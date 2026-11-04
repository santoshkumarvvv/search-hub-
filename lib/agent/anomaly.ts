export type AnomalyType = 'time' | 'value' | 'frequency';
export type Severity = 'low' | 'medium' | 'high';

export interface Anomaly {
  type: AnomalyType;
  severity: Severity;
  reason: string;
}

export type AnomalyFlag = Anomaly;

export interface RunRecord {
  ranAt: number;
  hourOfDay: number;
  resultCount: number;
  topScore: number;
  valueField: number | null;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function detectTimeAnomaly(history: RunRecord[], currentHour: number): AnomalyFlag | null {
  if (history.length < 5) return null;
  const hours = history.map((r) => r.hourOfDay);
  const m = mean(hours);
  const sd = stdDev(hours);
  if (sd === 0) {
    const diff = Math.abs(currentHour - m);
    if (diff >= 3) {
      return {
        type: 'time',
        severity: diff > 6 ? 'high' : 'medium',
        reason: `Result arrived at hour ${currentHour}, outside zero-variance baseline (mean ${m.toFixed(1)}, diff=${diff.toFixed(1)})`,
      };
    }
    return null;
  }
  const z = Math.abs(currentHour - m) / sd;
  if (z > 2) {
    const severity: Severity = z > 3 ? 'high' : z > 2.5 ? 'medium' : 'low';
    return {
      type: 'time',
      severity,
      reason: `Result arrived at hour ${currentHour}, outside normal window (mean ${m.toFixed(1)}, sd ${sd.toFixed(1)}, z=${z.toFixed(2)})`,
    };
  }
  return null;
}

export function detectValueAnomaly(history: RunRecord[], currentValue: number | null, thresholdPercent = 15): AnomalyFlag | null {
  if (currentValue === null) return null;
  const values = history.map((r) => r.valueField).filter((v): v is number => v !== null);
  if (values.length < 3) return null;
  const m = mean(values);
  if (m === 0) return null;
  const pctChange = Math.abs((currentValue - m) / m) * 100;
  if (pctChange > thresholdPercent) {
    const severity: Severity = pctChange > 50 ? 'high' : pctChange > 30 ? 'medium' : 'low';
    return {
      type: 'value',
      severity,
      reason: `Value ${currentValue} deviates ${pctChange.toFixed(1)}% from rolling average ${m.toFixed(2)} (threshold ${thresholdPercent}%)`,
    };
  }
  return null;
}

export function detectFrequencyAnomaly(history: RunRecord[]): AnomalyFlag | null {
  if (history.length < 4) return null;
  const recent = history.slice(-4);
  const prior = history.slice(0, -2);
  const priorNonZero = prior.filter((r) => r.resultCount > 0).length;
  const recentZero = recent.filter((r) => r.resultCount === 0).length;
  if (priorNonZero >= prior.length * 0.75 && recentZero >= 2) {
    return {
      type: 'frequency',
      severity: 'high',
      reason: `Result count dropped to zero for ${recentZero} consecutive runs after being consistently non-zero`,
    };
  }
  return null;
}

export function detectAllAnomalies(history: RunRecord[], current: RunRecord): AnomalyFlag[] {
  const anomalies: AnomalyFlag[] = [];
  const timeA = detectTimeAnomaly(history, current.hourOfDay);
  if (timeA) anomalies.push(timeA);
  const valueA = detectValueAnomaly(history, current.valueField);
  if (valueA) anomalies.push(valueA);
  const freqA = detectFrequencyAnomaly([...history, current]);
  if (freqA) anomalies.push(freqA);
  return anomalies;
}
