'use client';

import { Languages } from 'lucide-react';
import { AUDIO_LABELS, type AudioLang, type AudioTrack } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function AudioSwitcher({
  tracks,
  active,
  onChange,
}: {
  tracks: AudioTrack[];
  active: AudioLang;
  onChange: (lang: AudioLang) => void;
}) {
  if (tracks.length < 2) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted">
        <Languages size={14} className="text-accent" />
        ऑडियो: <span className="text-white">{AUDIO_LABELS[tracks[0].lang]}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Languages size={14} className="text-accent" />
        ऑडियो
      </span>
      <div
        role="group"
        aria-label="ऑडियो भाषा चुनें"
        className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-panel/70 p-1"
      >
        {tracks.map((t) => (
          <button
            key={t.lang}
            type="button"
            onClick={() => onChange(t.lang)}
            aria-pressed={t.lang === active}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              t.lang === active
                ? 'bg-accent text-white shadow-glow'
                : 'text-muted hover:bg-white/5 hover:text-white',
            )}
          >
            {AUDIO_LABELS[t.lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
