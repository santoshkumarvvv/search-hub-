import { Job } from './scheduler';
import { Sketch } from './drift';
import { RunRecord } from './anomaly';

/**
 * Shared agent store. Uses Vercel KV when KV_REST_API_URL + KV_REST_API_TOKEN
 * are set; falls back to in-memory Maps for local dev.
 * All three agent routes (create, run, cron) import from here so cron and
 * run see the same jobs on any warm instance.
 */

const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';
const USE_KV = KV_URL.length > 0 && KV_TOKEN.length > 0;

const memJobs = new Map<string, Job>();
const memSnapshots = new Map<string, Sketch>();
const memHistories = new Map<string, RunRecord[]>();

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
    // KV has no list-all; rely on in-memory index of ids
    const ids = await kvGet<string[]>('agent:job:ids') || [];
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
    await kvSet(histKey(id), history, 60 * 60 * 24 * 30); // 30-day TTL
  },
};
