export interface TechRadarItem {
  id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'cloud-infrastructure' | 'ai-engineering';
  ring: 'adopt' | 'trial' | 'assess' | 'hold';
  velocityScore: number; // 0-100 computed metric
  growthRatePercent: number;
  monthlyDownloads: string;
  p95LatencyBenchmark: string;
  marketOutlook: 'surging' | 'stable' | 'maturing' | 'deprecated';
}

export const GLOBAL_TECH_RADAR: TechRadarItem[] = [
  {
    id: 'typescript',
    name: 'TypeScript 5.8',
    category: 'languages',
    ring: 'adopt',
    velocityScore: 98.4,
    growthRatePercent: 42.1,
    monthlyDownloads: '198M',
    p95LatencyBenchmark: '0 ms (AOT compile)',
    marketOutlook: 'surging',
  },
  {
    id: 'nextjs',
    name: 'Next.js 15.5 App Router',
    category: 'frameworks',
    ring: 'adopt',
    velocityScore: 95.8,
    growthRatePercent: 38.6,
    monthlyDownloads: '48M',
    p95LatencyBenchmark: '38 ms P95',
    marketOutlook: 'surging',
  },
  {
    id: 'flutter',
    name: 'Dart 3 / Flutter 3.24',
    category: 'frameworks',
    ring: 'adopt',
    velocityScore: 92.1,
    growthRatePercent: 29.4,
    monthlyDownloads: '14M',
    p95LatencyBenchmark: '11 ms (120fps)',
    marketOutlook: 'surging',
  },
  {
    id: 'docker-containers',
    name: 'OCI Multi-Arch Containers',
    category: 'cloud-infrastructure',
    ring: 'adopt',
    velocityScore: 96.5,
    growthRatePercent: 31.0,
    monthlyDownloads: '1.2B',
    p95LatencyBenchmark: '99.98% SLA',
    marketOutlook: 'stable',
  },
  {
    id: 'pytorch',
    name: 'PyTorch 2.5 + CUDA',
    category: 'ai-engineering',
    ring: 'adopt',
    velocityScore: 97.2,
    growthRatePercent: 64.8,
    monthlyDownloads: '34M',
    p95LatencyBenchmark: '4.2 ms tensor latency',
    marketOutlook: 'surging',
  },
  {
    id: 'bun-runtime',
    name: 'Bun 1.2 Fast JS Engine',
    category: 'languages',
    ring: 'trial',
    velocityScore: 84.6,
    growthRatePercent: 58.2,
    monthlyDownloads: '9.2M',
    p95LatencyBenchmark: '2.1 ms cold start',
    marketOutlook: 'surging',
  },
];
