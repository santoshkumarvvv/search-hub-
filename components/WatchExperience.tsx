'use client';

import { useMemo, useState } from 'react';
import type { Anime, AudioLang, Episode } from '@/lib/types';
import VideoPlayer from './VideoPlayer';
import AudioSwitcher from './AudioSwitcher';

/**
 * Wraps the player so the viewer can switch audio track (Hindi / English /
 * Japanese) without leaving the page. Hindi is preferred by default.
 */
export default function WatchExperience({
  anime,
  episode,
}: {
  anime: Anime;
  episode: Episode;
}) {
  const defaultLang: AudioLang =
    episode.audio.find((t) => t.lang === 'hindi')?.lang ?? episode.audio[0].lang;

  const [lang, setLang] = useState<AudioLang>(defaultLang);

  const track = useMemo(
    () => episode.audio.find((t) => t.lang === lang) ?? episode.audio[0],
    [episode.audio, lang],
  );

  return (
    <div className="space-y-4">
      <VideoPlayer
        // remount on track change so the new source loads cleanly
        key={`${anime.slug}-${episode.number}-${track.lang}`}
        source={track.source}
        title={`${anime.titleHindi ?? anime.title} — एपिसोड ${episode.number}`}
        poster={episode.thumbnail}
        resumeKey={`${anime.slug}-${episode.number}`}
      />

      <AudioSwitcher tracks={episode.audio} active={track.lang} onChange={setLang} />

      {!episode.audio.some((t) => t.lang === 'hindi') && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-200">
          इस एपिसोड की हिंदी डब अभी तैयार नहीं है। फ़िलहाल दूसरी ऑडियो में देखें — डब आते ही
          यहीं जुड़ जाएगी।
        </p>
      )}
    </div>
  );
}
