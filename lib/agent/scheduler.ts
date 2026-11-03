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
const WEEKLY_CAP = 20;

function todayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function weekKey(ts: number): string {
  const d = new Date(ts);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export function canRun(job: Job, now: number): { allowed: boolean; reason?: string } {
  const dk = todayKey(now);
  const wk = weekKey(now);
  if (job.dayKey !== dk) {
    job.runCountToday = 0;
    job.dayKey = dk;
  }
  if (job.weekKey !== wk) {
    job.runCountWeek = 0;
    job.weekKey = wk;
  }
  if (job.runCountToday >= DAILY_CAP) return { allowed: false, reason: 'daily cap reached' };
  if (job.runCountWeek >= WEEKLY_CAP) return { allowed: false, reason: 'weekly cap reached' };
  if (now < job.nextRunAt) return { allowed: false, reason: 'not due' };
  return { allowed: true };
}

export function markRun(job: Job, now: number, status: LastStatus, error: string | null): void {
  job.lastRunAt = now;
  job.lastStatus = status;
  job.lastError = error;
  job.runCountToday += 1;
  job.runCountWeek += 1;
  job.nextRunAt = now + 15 * 60 * 1000;
}

const BLOCKED = /https?:\/\/|\b(rm|cat|ls|curl|wget|chmod|chown|sudo|bash|sh|python|node|perl|ruby|php|nc|netcat|ssh|ftp|telnet)\b|\.\.?\/|\|\||&&|;|`/i;

export function validateInstruction(instruction: string): { valid: boolean; reason?: string } {
  const words = instruction.trim().split(/\s+/);
  if (words.length > 50) return { valid: false, reason: 'instruction exceeds 50 words' };
  if (instruction.length === 0) return { valid: false, reason: 'empty instruction' };
  if (BLOCKED.test(instruction)) return { valid: false, reason: 'instruction contains blocked pattern' };
  return { valid: true };
}
