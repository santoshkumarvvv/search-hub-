import { BadgeCheck, Clock, Mic, Subtitles } from 'lucide-react';
import type { DubStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STYLES: Record<
  DubStatus,
  { label: string; className: string; icon: typeof Mic }
> = {
  dubbed: {
    label: 'हिंदी डब',
    className: 'bg-emerald-500/90 text-white',
    icon: BadgeCheck,
  },
  'in-progress': {
    label: 'डब जारी',
    className: 'bg-amber-500/90 text-black',
    icon: Clock,
  },
  announced: {
    label: 'डब जल्द',
    className: 'bg-neon/90 text-white',
    icon: Mic,
  },
  'subbed-only': {
    label: 'सबटाइटल',
    className: 'bg-white/15 text-gray-200',
    icon: Subtitles,
  },
};

export default function DubBadge({
  status,
  size = 'sm',
  className,
}: {
  status: DubStatus;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { label, className: tone, icon: Icon } = STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-bold backdrop-blur-sm',
        size === 'sm' ? 'px-1.5 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs',
        tone,
        className,
      )}
    >
      <Icon size={size === 'sm' ? 11 : 14} />
      {label}
    </span>
  );
}
