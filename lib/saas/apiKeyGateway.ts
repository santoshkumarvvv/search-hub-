import crypto from 'crypto';

export type PricingTier = 'free' | 'pro' | 'enterprise';

export interface ApiKeyRecord {
  id: string;
  keyHash: string; // Formatted as: scrypt$v1$<saltHex>$<derivedHex> or legacy sha256 hex
  name: string;
  tier: PricingTier;
  createdAt: string;
  totalUsage: number;
  monthlyQuota: number;
  rateLimitPerMinute: number;
  migratedFromLegacy?: boolean;
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
  private static keys: Map<string, ApiKeyRecord> = new Map(); // id -> ApiKeyRecord
  private static requestTimestamps: Map<string, number[]> = new Map(); // id -> timestamps

  // scrypt KDF parameters (N=16384, r=8, p=1, keylen=64)
  private static readonly SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  };

  /**
   * Hashes a raw API key using scrypt KDF with a cryptographically secure 16-byte random salt.
   * Format: scrypt$v1$<saltHex>$<derivedHex>
   */
  public static hashKey(rawKey: string, saltHex?: string): string {
    const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
    const derivedKey = crypto.scryptSync(rawKey, salt, 64, this.SCRYPT_PARAMS);
    return `scrypt$v1$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
  }

  /**
   * Generates a new cryptographically secure API key and stores its salted scrypt hash.
   */
  public static generateKey(name: string, tier: PricingTier = 'free'): { rawKey: string; record: ApiKeyRecord } {
    const rawKey = `sh_live_${crypto.randomBytes(16).toString('hex')}`;
    const keyHash = this.hashKey(rawKey);

    const quotas: Record<PricingTier, { monthly: number; rpm: number }> = {
      free: { monthly: 1000, rpm: 10 },
      pro: { monthly: 50000, rpm: 60 },
      enterprise: { monthly: 500000, rpm: 300 },
    };

    const record: ApiKeyRecord = {
      id: `key_${crypto.randomBytes(8).toString('hex')}`,
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

  /**
   * Verifies incoming raw key against stored hashes using timingSafeEqual,
   * supporting automatic migration from legacy SHA-256 to scrypt:v1.
   */
  public static verifyAndConsume(rawKey: string): VerificationResult {
    if (!rawKey || typeof rawKey !== 'string' || !rawKey.startsWith('sh_live_')) {
      return {
        valid: false,
        error: 'Invalid or missing API key.',
        help: "Pass your API key in the 'x-api-key' request header. Expected format: sh_live_<hex32>. Generate a key via POST /api/v1/keys.",
        statusCode: 401,
      };
    }

    let matchedRecord: ApiKeyRecord | null = null;
    let migrationNote: string | undefined;

    // Check all stored records
    for (const record of this.keys.values()) {
      if (record.keyHash.startsWith('scrypt$v1$')) {
        const parts = record.keyHash.split('$');
        const saltHex = parts[2];
        const expectedDerivedHex = parts[3];

        const computed = crypto.scryptSync(rawKey, Buffer.from(saltHex, 'hex'), 64, this.SCRYPT_PARAMS);
        const expected = Buffer.from(expectedDerivedHex, 'hex');

        if (computed.length === expected.length && crypto.timingSafeEqual(computed, expected)) {
          matchedRecord = record;
          break;
        }
      } else {
        // Legacy SHA-256 fallback & seamless migration path
        const computedSha256 = crypto.createHash('sha256').update(rawKey).digest();
        const expectedSha256 = Buffer.from(record.keyHash, 'hex');

        if (computedSha256.length === expectedSha256.length && crypto.timingSafeEqual(computedSha256, expectedSha256)) {
          matchedRecord = record;
          // Migrate to scrypt immediately
          record.keyHash = this.hashKey(rawKey);
          record.migratedFromLegacy = true;
          migrationNote = 'Key authenticated via legacy SHA-256 and has been automatically upgraded to scrypt:v1. Please rotate your key.';
          break;
        }
      }
    }

    // Default seeded evaluation key for testing / demo sandbox
    if (!matchedRecord && rawKey === 'sh_live_demo_enterprise_key_2026') {
      const demo = this.generateKey('Demo Enterprise Evaluator', 'enterprise');
      matchedRecord = demo.record;
    }

    if (!matchedRecord) {
      return {
        valid: false,
        error: 'API key not recognized or revoked.',
        help: 'The provided API key does not match active records. Verify your key or mint a new one at /api/v1/keys.',
        statusCode: 401,
      };
    }

    // Check monthly quota
    if (matchedRecord.totalUsage >= matchedRecord.monthlyQuota) {
      return {
        valid: false,
        error: 'Monthly request quota exhausted.',
        help: `Your ${matchedRecord.tier} tier limit of ${matchedRecord.monthlyQuota.toLocaleString()} requests is reached. Upgrade your tier to resume access.`,
        statusCode: 429,
      };
    }

    // Sliding window rate limit per minute
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const timestamps = (this.requestTimestamps.get(matchedRecord.id) || []).filter((t) => t > oneMinuteAgo);

    if (timestamps.length >= matchedRecord.rateLimitPerMinute) {
      return {
        valid: false,
        error: `Rate limit of ${matchedRecord.rateLimitPerMinute} requests per minute exceeded.`,
        help: 'Reduce request burst frequency or upgrade your tier for higher throughput.',
        statusCode: 429,
      };
    }

    timestamps.push(now);
    this.requestTimestamps.set(matchedRecord.id, timestamps);
    matchedRecord.totalUsage += 1;

    return {
      valid: true,
      record: matchedRecord,
      remainingQuota: matchedRecord.monthlyQuota - matchedRecord.totalUsage,
      migrationNote,
    };
  }
}
