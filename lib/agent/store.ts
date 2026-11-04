import type { Job } from './scheduler';
import type { Sketch } from './drift';
import type { RunRecord } from './anomaly';

/**
 * Shared agent & billing store. Uses Vercel KV when KV_REST_API_URL + KV_REST_API_TOKEN
 * are set; falls back to in-memory Maps for local dev.
 */

const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';
const USE_KV = KV_URL.length > 0 && KV_TOKEN.length > 0;

export interface SubscriptionRecord {
  paymentId: string;
  plan: string;
  tier: 'free' | 'pro' | 'enterprise';
  email: string;
  keyId: string;
  createdAt: string;
}

export interface OneTimeKeyClaim {
  claimToken: string;
  paymentId: string;
  apiKey: string;
  tier: 'free' | 'pro' | 'enterprise';
  plan: string;
  email: string;
  createdAt: string;
}

const memJobs = new Map<string, Job>();
const memSnapshots = new Map<string, Sketch>();
const memHistories = new Map<string, RunRecord[]>();
const memSubscriptions = new Map<string, SubscriptionRecord>();
const memClaims = new Map<string, OneTimeKeyClaim>();

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
    // best-effort; in-memory fallback still holds
  }
}

async function kvDel(key: string): Promise<void> {
  if (!USE_KV) return;
  try {
    await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // best-effort
  }
}

function jobKey(id: string) {
  return `agent:job:${id}`;
}
function snapKey(id: string) {
  return `agent:snap:${id}`;
}
function histKey(id: string) {
  return `agent:hist:${id}`;
}
function subKey(id: string) {
  return `billing:sub:${id}`;
}
function claimKey(token: string) {
  return `billing:claim:${token}`;
}

export const agentStore = {
  async getJob(id: string): Promise<Job | null> {
    if (!USE_KV) return memJobs.get(id) || null;
    return kvGet<Job>(jobKey(id));
  },

  async setJob(job: Job): Promise<void> {
    memJobs.set(job.id, job);
    await kvSet(jobKey(job.id), job);
  },

  async deleteJob(id: string): Promise<void> {
    memJobs.delete(id);
    await kvDel(jobKey(id));
  },

  async getAllJobs(): Promise<Job[]> {
    if (!USE_KV) return Array.from(memJobs.values());
    const ids = (await kvGet<string[]>('agent:job:ids')) || [];
    const jobs: Job[] = [];
    for (const id of ids) {
      const j = await kvGet<Job>(jobKey(id));
      if (j) jobs.push(j);
    }
    return jobs;
  },

  async registerJobId(id: string): Promise<void> {
    const ids = (await kvGet<string[]>('agent:job:ids')) || [];
    if (!ids.includes(id)) {
      ids.push(id);
      await kvSet('agent:job:ids', ids);
    }
  },

  async getSnapshot(id: string): Promise<Sketch | null> {
    if (!USE_KV) return memSnapshots.get(id) || null;
    return kvGet<Sketch>(snapKey(id));
  },

  async setSnapshot(id: string, sketch: Sketch): Promise<void> {
    memSnapshots.set(id, sketch);
    await kvSet(snapKey(id), sketch);
  },

  async getHistory(id: string): Promise<RunRecord[]> {
    if (!USE_KV) return memHistories.get(id) || [];
    return (await kvGet<RunRecord[]>(histKey(id))) || [];
  },

  async setHistory(id: string, history: RunRecord[]): Promise<void> {
    memHistories.set(id, history);
    await kvSet(histKey(id), history, 60 * 60 * 24 * 30);
  },

  async setSubscription(sub: SubscriptionRecord): Promise<void> {
    memSubscriptions.set(sub.paymentId, sub);
    if (sub.email) memSubscriptions.set(sub.email, sub);
    await kvSet(subKey(sub.paymentId), sub);
    if (sub.email) await kvSet(subKey(sub.email), sub);
  },

  async getSubscription(idOrEmail: string): Promise<SubscriptionRecord | null> {
    if (!USE_KV) return memSubscriptions.get(idOrEmail) || null;
    return kvGet<SubscriptionRecord>(subKey(idOrEmail));
  },

  async setOneTimeKeyClaim(claim: OneTimeKeyClaim): Promise<void> {
    memClaims.set(claim.claimToken, claim);
    memClaims.set(claim.paymentId, claim);
    await kvSet(claimKey(claim.claimToken), claim, 60 * 60 * 24);
    await kvSet(claimKey(claim.paymentId), claim, 60 * 60 * 24);
  },

  async consumeOneTimeKeyClaim(tokenOrPaymentId: string): Promise<OneTimeKeyClaim | null> {
    let claim = memClaims.get(tokenOrPaymentId) || null;
    if (!claim && USE_KV) {
      claim = await kvGet<OneTimeKeyClaim>(claimKey(tokenOrPaymentId));
    }
    if (!claim) return null;
    memClaims.delete(claim.claimToken);
    memClaims.delete(claim.paymentId);
    await kvDel(claimKey(claim.claimToken));
    await kvDel(claimKey(claim.paymentId));
    return claim;
  },
};
