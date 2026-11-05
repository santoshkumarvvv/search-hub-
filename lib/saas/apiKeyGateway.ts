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
}

const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';
const USE_KV = KV_URL.length > 0 && KV_TOKEN.length > 0;

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

function rateLimitKey(keyId: string) {
  return `ratelimit:key:${keyId}`;
}

export class ApiKeyGateway {
  private static keys: Map<string, ApiKeyRecord> = new Map([
    // Demo key is loaded from NEXT_PUBLIC_DEMO_API_KEY env var (see seedDemoKey).
    // No hardcoded keys in source — prevents repo-clone key theft.
  ]);
  private static seeded = false;

  // scrypt KDF parameters (N=16384, r=8, p=1, keylen=64)
  private static readonly SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  };

  private static async seedDemoKey(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;
    const demoRaw = process.env.NEXT_PUBLIC_DEMO_API_KEY || '';
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
      monthlyQuota: 1000,
      rateLimitPerMinute: 10,
    });
  }

  private static pruneExpiredTimestamps(now: number): void {
    // no-op: rate-limit state now lives in KV with TTL
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
   * Enables O(1) map lookup by keyId followed by a single scrypt verification.
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
      free: { monthly: 1000, rpm: 10 },
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
    // Persist key record to KV so it survives serverless cold starts
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
   * Verifies incoming raw key (sh_live_<keyId>_<randomSecret>) using O(1) map lookup
   * and a single scrypt + timingSafeEqual verification call per request.
   * Rate limits are enforced via KV-backed sliding window so they hold across
   * all serverless instances.
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

    const hashParts = candidate.keyHash.split('$');
    const saltHex = hashParts[2];
    const expectedDerivedHex = hashParts[3];
    const computed = await scryptAsync(rawKey, Buffer.from(saltHex, 'hex'), {
      ...this.SCRYPT_PARAMS,
      keylen: 64,
    });
    const expected = Buffer.from(expectedDerivedHex, 'hex');

    if (computed.length !== expected.length || !crypto.timingSafeEqual(computed, expected)) {
      return {
        valid: false,
        error: 'API key not recognized or revoked.',
        help: 'Cryptographic verification failed for the provided key.',
        statusCode: 401,
      };
    }

    if (candidate.totalUsage >= candidate.monthlyQuota) {
      return {
        valid: false,
        error: 'Monthly request quota exhausted.',
        help: `Your ${candidate.tier} tier limit of ${candidate.monthlyQuota.toLocaleString()} requests is reached. Upgrade your tier to resume access.`,
        statusCode: 429,
      };
    }

    // KV-backed sliding-window rate limit (shared across all serverless instances)
    const rlKey = rateLimitKey(candidate.id);
    const timestamps: number[] = (await kvGet<number[]>(rlKey)) || [];
    const oneMinuteAgo = now - 60_000;
    const activeTimestamps = timestamps.filter((t) => t > oneMinuteAgo);

    if (activeTimestamps.length >= candidate.rateLimitPerMinute) {
      await kvSet(rlKey, activeTimestamps, 60);
      return {
        valid: false,
        error: `Rate limit of ${candidate.rateLimitPerMinute} requests per minute exceeded.`,
        statusCode: 429,
      };
    }

    activeTimestamps.push(now);
    await kvSet(rlKey, activeTimestamps, 60);
    candidate.totalUsage += 1;
    await kvSet(`apikey:record:${candidate.id}`, candidate);

    const remainingQuota = candidate.monthlyQuota - candidate.totalUsage;

    return {
      valid: true,
      record: candidate,
      remainingQuota,
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
    if (USE_KV) {
      kvSet(rateLimitKey(id), null).catch(() => {});
      kvSet(`apikey:record:${id}`, null).catch(() => {});
    }
    return this.keys.delete(id);
  }
}