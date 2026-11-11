import crypto from 'crypto';

function scryptAsync(
  password: string,
  salt: Buffer,
  options: crypto.ScryptOptions & { keylen: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, options.keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

export type PricingTier = 'free' | 'pro' | 'enterprise';

export interface ApiKeyRecord {
  id: string;
  keyHash: string; // Formatted as: scrypt$v1$<saltHex>$<derivedHex>
  name: string;
  tier: PricingTier;
  createdAt: string;
  totalUsage: number;
  monthlyQuota: number;
  rateLimitPerMinute: number;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  help?: string;
  statusCode?: number;
  record?: ApiKeyRecord;
  remainingQuota?: number;
  migrationNote?: string;
  cached?: boolean;
}

export interface AtomicRateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
}

const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';
const USE_KV = KV_URL.length > 0 && KV_TOKEN.length > 0;

// In-memory atomic counters for single-round-trip synchronous increment-check-decrement
const memAtomicCounters = new Map<string, { count: number; expiresAt: number }>();

async function kvGet<T>(key: string): Promise<T | null> {
  if (!USE_KV) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.result as T) ?? null;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: unknown, exSeconds?: number): Promise<void> {
  if (!USE_KV) return;
  try {
    const url = exSeconds
      ? `${KV_URL}/set/${encodeURIComponent(key)}?ex=${exSeconds}`
      : `${KV_URL}/set/${encodeURIComponent(key)}`;
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // best-effort
  }
}

async function kvIncr(key: string, ttlSeconds: number): Promise<number | null> {
  if (!USE_KV) return null;
  try {
    const res = await fetch(`${KV_URL}/incr/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number };
    const count = typeof data.result === 'number' ? data.result : null;
    if (count === 1 && ttlSeconds > 0) {
      fetch(`${KV_URL}/expire/${encodeURIComponent(key)}/${ttlSeconds}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }
    return count;
  } catch {
    return null;
  }
}

async function kvDecr(key: string): Promise<number | null> {
  if (!USE_KV) return null;
  try {
    const res = await fetch(`${KV_URL}/decr/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number };
    return typeof data.result === 'number' ? data.result : null;
  } catch {
    return null;
  }
}

/**
 * Atomic rate limiter using INCR-first, then check against limit, and DECR back if exceeded.
 * Eliminates the get-modify-set race window across concurrent requests.
 */
export async function atomicRateLimit(
  scopeKey: string,
  limit: number,
  windowSeconds: number = 60
): Promise<AtomicRateLimitResult> {
  const now = Date.now();
  const windowBucket = Math.floor(now / (windowSeconds * 1000));
  const bucketKey = `ratelimit:atomic:${scopeKey}:${windowBucket}`;

  // Step 1: Synchronous atomic increment in local memory (zero race window across concurrent promises)
  let localEntry = memAtomicCounters.get(bucketKey);
  if (!localEntry || localEntry.expiresAt <= now) {
    localEntry = { count: 0, expiresAt: (windowBucket + 1) * windowSeconds * 1000 };
    memAtomicCounters.set(bucketKey, localEntry);
  }
  localEntry.count += 1;
  const localCount = localEntry.count;

  if (localCount > limit) {
    // Decrement back immediately and reject
    localEntry.count = Math.max(0, localEntry.count - 1);
    return {
      allowed: false,
      count: localEntry.count,
      limit,
      remaining: 0,
    };
  }

  // Step 2: If Vercel KV is configured, also perform atomic INCR / DECR on KV
  if (USE_KV) {
    const kvCount = await kvIncr(bucketKey, windowSeconds);
    if (kvCount !== null && kvCount > limit) {
      await kvDecr(bucketKey);
      localEntry.count = Math.max(0, localEntry.count - 1);
      return {
        allowed: false,
        count: kvCount - 1,
        limit,
        remaining: 0,
      };
    }
    if (kvCount !== null) {
      return {
        allowed: true,
        count: kvCount,
        limit,
        remaining: Math.max(0, limit - kvCount),
      };
    }
  }

  return {
    allowed: true,
    count: localCount,
    limit,
    remaining: Math.max(0, limit - localCount),
  };
}

export function resetAtomicRateLimitForTest(scopePrefix?: string): void {
  if (!scopePrefix) {
    memAtomicCounters.clear();
    return;
  }
  for (const k of memAtomicCounters.keys()) {
    if (k.includes(scopePrefix)) memAtomicCounters.delete(k);
  }
}

function rateLimitKey(keyId: string) {
  return `ratelimit:key:${keyId}`;
}

interface ScryptCacheEntry {
  valid: boolean;
  expiresAt: number;
}

export class ApiKeyGateway {
  private static keys: Map<string, ApiKeyRecord> = new Map([
    // Demo key is loaded in seedDemoKey.
  ]);
  private static seeded = false;

  // In-memory LRU cache keyed by raw API key string -> boolean verification result (TTL 60s, max 500 entries)
  private static scryptCache: Map<string, ScryptCacheEntry> = new Map();
  private static readonly SCRYPT_CACHE_TTL_MS = 60_000;
  private static readonly SCRYPT_CACHE_MAX_ENTRIES = 500;

  // scrypt KDF parameters (N=16384, r=8, p=1, keylen=64) — DO NOT CHANGE
  private static readonly SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  };

  private static getCachedVerification(rawKey: string, now: number): boolean | undefined {
    const entry = this.scryptCache.get(rawKey);
    if (!entry) return undefined;
    if (now >= entry.expiresAt) {
      this.scryptCache.delete(rawKey);
      return undefined;
    }
    // Refresh LRU order (delete and re-insert as most recently used)
    this.scryptCache.delete(rawKey);
    this.scryptCache.set(rawKey, entry);
    return entry.valid;
  }

  private static setCachedVerification(rawKey: string, valid: boolean, now: number): void {
    if (this.scryptCache.has(rawKey)) {
      this.scryptCache.delete(rawKey);
    }
    while (this.scryptCache.size >= this.SCRYPT_CACHE_MAX_ENTRIES) {
      const oldestKey = this.scryptCache.keys().next().value;
      if (oldestKey === undefined) break;
      this.scryptCache.delete(oldestKey);
    }
    this.scryptCache.set(rawKey, {
      valid,
      expiresAt: now + this.SCRYPT_CACHE_TTL_MS,
    });
  }

  public static getScryptCacheSize(): number {
    return this.scryptCache.size;
  }

  private static async seedDemoKey(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;
    const demoRaw =
      process.env.NEXT_PUBLIC_DEMO_API_KEY ||
      ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_');
    if (!demoRaw.startsWith('sh_live_')) return;
    const parts = demoRaw.split('_');
    if (parts.length !== 4) return;
    const keyId = parts[2];
    const keyHash = await this.hashKey(demoRaw);
    this.keys.set(`key_${keyId}`, {
      id: `key_${keyId}`,
      keyHash,
      name: 'Homepage Live Demo Widget (Free Tier)',
      tier: 'free',
      createdAt: '2026-01-01T00:00:00.000Z',
      totalUsage: 0,
      monthlyQuota: 2000,
      rateLimitPerMinute: 10,
    });
  }

  private static pruneExpiredTimestamps(_now: number): void {
    // no-op: rate-limit state now uses atomic INCR/DECR counters with TTL
  }

  /**
   * Hashes a raw API key using scrypt KDF with a cryptographically secure 16-byte random salt.
   * Format: scrypt$v1$<saltHex>$<derivedHex>
   */
  public static async hashKey(rawKey: string, saltHex?: string): Promise<string> {
    const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
    const derivedKey = await scryptAsync(rawKey, salt, { ...this.SCRYPT_PARAMS, keylen: 64 });
    return `scrypt$v1$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
  }

  /**
   * Generates a new cryptographically secure API key in format:
   * sh_live_<keyId>_<randomSecret>
   * Enables O(1) map lookup by keyId followed by scrypt verification (cached in 500-entry 60s LRU).
   */
  public static async generateKey(
    name: string,
    tier: PricingTier = 'free'
  ): Promise<{ rawKey: string; record: ApiKeyRecord }> {
    const keyId = crypto.randomBytes(8).toString('hex');
    const secret = crypto.randomBytes(16).toString('hex');
    const rawKey = `sh_live_${keyId}_${secret}`;
    const keyHash = await this.hashKey(rawKey);

    const quotas: Record<PricingTier, { monthly: number; rpm: number }> = {
      free: { monthly: 2000, rpm: 10 },
      pro: { monthly: 50000, rpm: 60 },
      enterprise: { monthly: 500000, rpm: 300 },
    };

    const record: ApiKeyRecord = {
      id: `key_${keyId}`,
      keyHash,
      name,
      tier,
      createdAt: new Date().toISOString(),
      totalUsage: 0,
      monthlyQuota: quotas[tier].monthly,
      rateLimitPerMinute: quotas[tier].rpm,
    };

    this.keys.set(record.id, record);
    await kvSet(`apikey:record:${record.id}`, record);
    return { rawKey, record };
  }

  public static async mintKey(
    name: string,
    tier: PricingTier = 'free'
  ): Promise<{ rawKey: string; record: ApiKeyRecord }> {
    return this.generateKey(name, tier);
  }

  /**
   * Verifies incoming raw key (sh_live_<keyId>_<randomSecret>) using a 500-entry, 60s TTL
   * in-memory LRU cache to skip per-request N=16384 scrypt hashing on cache hits,
   * followed by an atomic INCR/DECR rate limiter.
   */
  public static async verifyAndConsume(rawKey: string): Promise<VerificationResult> {
    await this.seedDemoKey();
    const now = Date.now();

    if (!rawKey || typeof rawKey !== 'string' || !rawKey.startsWith('sh_live_')) {
      return {
        valid: false,
        error: 'Invalid or missing API key.',
        help: "Pass your API key in the 'x-api-key' request header. Expected format: sh_live_<keyId>_<secret>. Generate a key via POST /api/v1/keys.",
        statusCode: 401,
      };
    }

    const parts = rawKey.split('_');
    if (parts.length !== 4 || parts[0] !== 'sh' || parts[1] !== 'live' || !parts[2] || !parts[3]) {
      return {
        valid: false,
        error: 'Malformed API key structure.',
        help: 'Expected format: sh_live_<keyId>_<secret>. Mint a new key at POST /api/v1/keys.',
        statusCode: 401,
      };
    }

    const keyId = parts[2];
    let candidate = this.keys.get(`key_${keyId}`) || this.keys.get(keyId) || undefined;
    if (!candidate && USE_KV) {
      candidate = (await kvGet<ApiKeyRecord>(`apikey:record:key_${keyId}`)) || undefined;
      if (candidate) this.keys.set(candidate.id, candidate);
    }

    if (!candidate) {
      return {
        valid: false,
        error: 'API key not recognized or revoked.',
        help: 'The provided key does not match active records. Verify your key or mint a new one at /api/v1/keys.',
        statusCode: 401,
      };
    }

    if (!candidate.keyHash.startsWith('scrypt$v1$')) {
      return {
        valid: false,
        error: 'Legacy insecure API key format detected. Revocation and key regeneration in effect.',
        help: 'Insecure SHA-256 keys are deprecated. Mint a new scrypt:v1 salted key at POST /api/v1/keys.',
        statusCode: 401,
      };
    }

    // Check 60s TTL, 500-entry LRU cache before running expensive N=16384 scrypt
    const cachedResult = this.getCachedVerification(rawKey, now);
    let wasCached = false;

    if (cachedResult !== undefined) {
      wasCached = true;
      if (!cachedResult) {
        return {
          valid: false,
          error: 'API key not recognized or revoked.',
          help: 'Cryptographic verification failed for the provided key.',
          statusCode: 401,
          cached: true,
        };
      }
    } else {
      const hashParts = candidate.keyHash.split('$');
      const saltHex = hashParts[2];
      const expectedDerivedHex = hashParts[3];

      const computed = await scryptAsync(rawKey, Buffer.from(saltHex, 'hex'), {
        ...this.SCRYPT_PARAMS,
        keylen: 64,
      });
      const expected = Buffer.from(expectedDerivedHex, 'hex');

      const isMatch =
        computed.length === expected.length && crypto.timingSafeEqual(computed, expected);
      this.setCachedVerification(rawKey, isMatch, now);

      if (!isMatch) {
        return {
          valid: false,
          error: 'API key not recognized or revoked.',
          help: 'Cryptographic verification failed for the provided key.',
          statusCode: 401,
          cached: false,
        };
      }
    }

    // Atomic rate limit (INCR first -> check -> DECR if exceeded)
    const rl = await atomicRateLimit(candidate.id, candidate.rateLimitPerMinute, 60);
    if (!rl.allowed) {
      return {
        valid: false,
        error: `Rate limit of ${candidate.rateLimitPerMinute} requests per minute exceeded.`,
        statusCode: 429,
        cached: wasCached,
      };
    }

    // Atomic increment-check-decrement on monthly quota
    candidate.totalUsage += 1;
    if (candidate.totalUsage > candidate.monthlyQuota) {
      candidate.totalUsage -= 1;
      return {
        valid: false,
        error: 'Monthly request quota exhausted.',
        help: `Your ${candidate.tier} tier limit of ${candidate.monthlyQuota.toLocaleString()} requests is reached. Upgrade your tier to resume access.`,
        statusCode: 429,
        cached: wasCached,
      };
    }

    if (USE_KV) {
      await kvSet(`apikey:record:${candidate.id}`, candidate);
    }
    const remainingQuota = candidate.monthlyQuota - candidate.totalUsage;

    return {
      valid: true,
      record: candidate,
      remainingQuota,
      cached: wasCached,
      migrationNote:
        candidate.tier === 'enterprise' ? 'Enterprise tier: priority routing enabled.' : undefined,
    };
  }

  public static getRecord(id: string): ApiKeyRecord | undefined {
    return this.keys.get(id);
  }

  public static listKeys(): ApiKeyRecord[] {
    return Array.from(this.keys.values());
  }

  public static revokeKey(id: string): boolean {
    this.scryptCache.clear();
    if (USE_KV) {
      kvSet(rateLimitKey(id), null).catch(() => {});
      kvSet(`apikey:record:${id}`, null).catch(() => {});
    }
    return this.keys.delete(id);
  }
}

export const PRICING_TIERS = {
  starter: {
    tier: 'free' as PricingTier,
    name: 'Starter',
    priceInr: 19,
    monthlySearches: 2000,
    rateLimitPerMinute: 10,
    agentRunsPerDay: 0,
  },
  pro: {
    tier: 'pro' as PricingTier,
    name: 'Pro',
    priceInr: 99,
    monthlySearches: 50000,
    rateLimitPerMinute: 60,
    agentRunsPerDay: 0,
  },
  ultra: {
    tier: 'enterprise' as PricingTier,
    name: 'Ultra',
    priceInr: 199,
    monthlySearches: 500000,
    rateLimitPerMinute: 300,
    agentRunsPerDay: 3,
  },
} as const;
