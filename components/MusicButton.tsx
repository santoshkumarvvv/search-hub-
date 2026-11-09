'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Free-license Brazilian funk, phonk, and reggaeton energy tracks (>= 2 min each, website playback allowed). */
const TRACKS = [
  {
    title: 'Baile Funk Rio Bounce',
    url: 'https://assets.mixkit.co/music/275/275.mp3',
  },
  {
    title: 'Favela Phonk Drift',
    url: 'https://assets.mixkit.co/music/276/276.mp3',
  },
  {
    title: 'Sao Paulo Montagem Pulse',
    url: 'https://assets.mixkit.co/music/279/279.mp3',
  },
  {
    title: 'Reggaeton Dembow Heat',
    url: 'https://assets.mixkit.co/music/280/280.mp3',
  },
  {
    title: 'Carioca Bass Tamborzao',
    url: 'https://assets.mixkit.co/music/282/282.mp3',
  },
  {
    title: 'Midnight Phonk Cowbell',
    url: 'https://assets.mixkit.co/music/283/283.mp3',
  },
  {
    title: 'Perreo Sub-Bass Rhythm',
    url: 'https://assets.mixkit.co/music/285/285.mp3',
  },
  {
    title: 'Mandelao Street Beat',
    url: 'https://assets.mixkit.co/music/130/130.mp3',
  },
  {
    title: 'Belo Horizonte Funk Groove',
    url: 'https://assets.mixkit.co/music/131/131.mp3',
  },
  {
    title: 'Drift Phonk Overdrive',
    url: 'https://assets.mixkit.co/music/132/132.mp3',
  },
  {
    title: 'Copacabana Night Dembow',
    url: 'https://assets.mixkit.co/music/138/138.mp3',
  },
  {
    title: 'Automotivo Bassline',
    url: 'https://assets.mixkit.co/music/140/140.mp3',
  },
  {
    title: 'Latin Trap Reggaeton Flow',
    url: 'https://assets.mixkit.co/music/146/146.mp3',
  },
  {
    title: 'Neon Phonk Distortion',
    url: 'https://assets.mixkit.co/music/159/159.mp3',
  },
  {
    title: 'Recife Brega Funk Surge',
    url: 'https://assets.mixkit.co/music/171/171.mp3',
  },
  {
    title: 'Medellin Reggaeton Knock',
    url: 'https://assets.mixkit.co/music/246/246.mp3',
  },
  {
    title: 'Zona Sul Funk Bass',
    url: 'https://assets.mixkit.co/music/225/225.mp3',
  },
  {
    title: 'Turbo Phonk Finale',
    url: 'https://assets.mixkit.co/music/231/231.mp3',
  },
] as const;

const MODERATE_VOLUME = 0.45;

const btnClass =
  'inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-[#7c5cff] text-white shadow-[0_2px_10px_rgba(124,92,255,0.4)] transition hover:bg-[#6b4ce6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/50';

export default function MusicButton() {
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const wantPlayRef = useRef(true);
  const errorCountRef = useRef(0);

  const attemptPlayWithFallback = useCallback((audio: HTMLAudioElement) => {
    try {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Muted-then-unmute fallback when browser blocks unmuted autoplay
          try {
            audio.muted = true;
            const mutedPromise = audio.play();
            if (mutedPromise && typeof mutedPromise.catch === 'function') {
              mutedPromise.catch(() => {
                /* silent — will resume on first user interaction */
              });
            }
          } catch {
            /* silent */
          }
        });
      }
    } catch {
      /* silent */
    }
  }, []);

  const loadTrack = useCallback(
    (index: number, autoplay: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;
      const next = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
      indexRef.current = next;
      setTrackIndex(next);
      wantPlayRef.current = autoplay;
      try {
        audio.pause();
        audio.src = TRACKS[next].url;
        audio.load();
        if (autoplay) {
          attemptPlayWithFallback(audio);
        }
      } catch {
        /* silent fail */
      }
    },
    [attemptPlayWithFallback]
  );

  useEffect(() => {
    const audio = new Audio(TRACKS[0].url);
    audio.volume = MODERATE_VOLUME;
    audio.preload = 'auto';
    audio.loop = false;
    audioRef.current = audio;
    wantPlayRef.current = true;

    const onPlay = () => {
      errorCountRef.current = 0;
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      // Auto-advance to next track; loops back to 0 when playlist ends
      loadTrack(indexRef.current + 1, true);
    };
    const onError = () => {
      // Silently skip to next track if audio fails
      errorCountRef.current += 1;
      if (errorCountRef.current < TRACKS.length) {
        loadTrack(indexRef.current + 1, wantPlayRef.current);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Start continuous autoplay on mount
    attemptPlayWithFallback(audio);

    // Restore moderate unmuted volume on first user interaction
    const unlockAudio = () => {
      const current = audioRef.current;
      if (!current) return;
      try {
        current.muted = false;
        current.volume = MODERATE_VOLUME;
        if (wantPlayRef.current && current.paused) {
          const p = current.play();
          if (p && typeof p.catch === 'function') p.catch(() => { /* silent */ });
        }
      } catch {
        /* silent */
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    window.addEventListener('click', unlockAudio, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      try {
        audio.pause();
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        audioRef.current = null;
      } catch {
        /* ignore */
      }
    };
  }, [attemptPlayWithFallback, loadTrack]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.muted = false;
      audio.volume = MODERATE_VOLUME;
      if (audio.paused) {
        wantPlayRef.current = true;
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => { /* silent */ });
      } else {
        wantPlayRef.current = false;
        audio.pause();
      }
    } catch {
      /* silent */
    }
  };

  const skip = (dir: 1 | -1) => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = false;
      audio.volume = MODERATE_VOLUME;
    }
    errorCountRef.current = 0;
    loadTrack(indexRef.current + dir, true);
  };

  const close = () => {
    wantPlayRef.current = false;
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audioRef.current = null;
      } catch {
        /* ignore */
      }
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="inline-flex items-center justify-center gap-1.5" role="group" aria-label="Music player">
      <button
        type="button"
        onClick={() => skip(-1)}
        aria-label="Skip to previous free track"
        title="Previous"
        className={btnClass}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${TRACKS[trackIndex].title}` : `Play ${TRACKS[trackIndex].title}`}
        aria-pressed={playing}
        title={TRACKS[trackIndex].title}
        className={btnClass}
      >
        {playing ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={close}
        aria-label="Close music player"
        title="Close"
        className={btnClass}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => skip(1)}
        aria-label="Skip to next free track"
        title="Skip"
        className={btnClass}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>
  );
}
