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

export class ApiKeyGateway {
  private static keys: Map<string, ApiKeyRecord> = new Map([
    [
      "key_homepagedemo0001",
      {
        id: "key_homepagedemo0001",
        keyHash: "scrypt$v1$00112233445566778899aabbccddeeff$d575c15ed084c33a26dba6800ecf32ab5fc5a0fd60dc683752c3bda6367e31685fd6a3175376b7820247ec1c752f94ad1e8ffb9949e87028a95e1c6ceeb96d1f",
        name: "Homepage Live Demo Widget (Free Tier)",
        tier: "free",
        createdAt: "2026-01-01T00:00:00.000Z",
        totalUsage: 0,
        monthlyQuota: 1000,
        rateLimitPerMinute: 10,
      },
    ],
  ]);
  private static requestTimestamps: Map<string, { timestamps: number[]; expiresAt: number }> = new Map();
  private static readonly TIMESTAMP_TTL_MS = 60_000;

  // scrypt KDF parameters (N=16384, r=8, p=1, keylen=64)
  private static readonly SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  };

  private static pruneExpiredTimestamps(now: number): void {
    for (const [id, entry] of this.requestTimestamps.entries()) {
      if (now > entry.expiresAt) {
        this.requestTimestamps.delete(id);
      }
    }
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
   */
  public static async verifyAndConsume(rawKey: string): Promise<VerificationResult> {
    const now = Date.now();
    this.pruneExpiredTimestamps(now);

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
    const candidate = this.keys.get(`key_${keyId}`) || this.keys.get(keyId);
    if (!candidate) {
      return {
        valid: false,
        error: 'API key not recognized or revoked.',
        help: 'The provided API key does not match active records. Verify your key or mint a new one at /api/v1/keys.',
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
        help: 'Cryptographic verification failed for the provided API key.',
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

    const oneMinuteAgo = now - this.TIMESTAMP_TTL_MS;
    const existingEntry = this.requestTimestamps.get(candidate.id);
    const activeTimestamps = (existingEntry ? existingEntry.timestamps : []).filter(
      (t) => t > oneMinuteAgo
    );

    if (activeTimestamps.length >= candidate.rateLimitPerMinute) {
      return {
        valid: false,
        error: `Rate limit of ${candidate.rateLimitPerMinute} requests per minute exceeded.`,
        statusCode: 429,
      };
    }

    activeTimestamps.push(now);
    this.requestTimestamps.set(candidate.id, {
      timestamps: activeTimestamps,
      expiresAt: now + this.TIMESTAMP_TTL_MS,
    });
    candidate.totalUsage += 1;

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
    this.requestTimestamps.delete(id);
    return this.keys.delete(id);
  }
}
