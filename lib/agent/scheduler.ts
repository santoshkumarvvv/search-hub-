export type DeliveryChannel = 'email' | 'in-app';
export type LastStatus = 'ok' | 'failed' | 'skipped';

export interface Job {
  id: string;
  userId: string;
  instruction: string;
  cron: string;
  nextRunAt: number;
  lastRunAt: number | null;
  lastStatus: LastStatus;
  lastError: string | null;
  deliveryChannel: DeliveryChannel;
  tier: 'ultra';
  threshold: string | null;
  runCountToday: number;
  runCountWeek: number;
  dayKey: string;
  weekKey: string;
}

export interface RunResult {
  jobId: string;
  ranAt: number;
  status: LastStatus;
  topResults: Array<{
    title: string;
    link: string;
    score: number;
    changed: boolean;
  }>;
  delta: {
    newItems: number;
    removedItems: number;
    changedFields: number;
  } | null;
  anomalies: Array<{
    type: 'time' | 'value' | 'frequency';
    severity: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  thresholdMet: boolean;
  error: string | null;
}

const DAILY_CAP = 3;
const WEEKLY_CAP = 15;

function todayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function weekKey(ts: number): string {
  const d = new Date(ts);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Pure gate check — does NOT mutate the job.
 * Returns a `patch` the caller should apply via markRun / agentStore.setJob
 * so the same Job object is never half-updated across instances.
 */
export function canRun(job: Job, now: number): {
  allowed: boolean;
  reason?: string;
  patch?: Partial<Job>;
} {
  const dk = todayKey(now);
  const wk = weekKey(now);
  const patch: Partial<Job> = {};
  if (job.dayKey !== dk) {
    patch.runCountToday = 0;
    patch.dayKey = dk;
  }
  if (job.weekKey !== wk) {
    patch.runCountWeek = 0;
    patch.weekKey = wk;
  }
  const today = patch.runCountToday ?? job.runCountToday;
  const week = patch.runCountWeek ?? job.runCountWeek;
  if (today >= DAILY_CAP) return { allowed: false, reason: 'daily cap reached', patch: Object.keys(patch).length ? patch : undefined };
  if (week >= WEEKLY_CAP) return { allowed: false, reason: 'weekly cap reached', patch: Object.keys(patch).length ? patch : undefined };
  if (now < job.nextRunAt) return { allowed: false, reason: 'not due', patch: Object.keys(patch).length ? patch : undefined };
  return { allowed: true, patch: Object.keys(patch).length ? patch : undefined };
}

export function markRun(job: Job, now: number, status: LastStatus, error: string | null): Job {
  const gate = canRun(job, now);
  const base: Job = gate.patch ? { ...job, ...gate.patch } : job;
  const dk = base.dayKey || todayKey(now);
  const wk = base.weekKey || weekKey(now);
  return {
    ...base,
    dayKey: dk,
    weekKey: wk,
    lastRunAt: now,
    lastStatus: status,
    lastError: error,
    runCountToday: base.runCountToday + 1,
    runCountWeek: base.runCountWeek + 1,
    nextRunAt: now + 15 * 60 * 1000,
  };
}

const BLOCKED = /https?:\/\/|\b(rm|cat|ls|curl|wget|chmod|chown|sudo|bash|sh|python|node|perl|ruby|php|nc|netcat|ssh|ftp|telnet)\b|\.\.?\/|\|\||&&|;|`/i;

export function validateInstruction(instruction: string): { valid: boolean; reason?: string } {
  const words = instruction.trim().split(/\s+/);
  if (words.length > 50) return { valid: false, reason: 'instruction exceeds 50 words' };
  if (instruction.length === 0) return { valid: false, reason: 'empty instruction' };
  if (BLOCKED.test(instruction)) return { valid: false, reason: 'instruction contains blocked pattern' };
  return { valid: true };
}
