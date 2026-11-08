'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Free-license tracks only: Free Music Archive (CC) + Pixabay Content License. */
const TRACKS = [
  {
    title: 'Night Owl',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3',
  },
  {
    title: 'Enthusiast',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3',
  },
  {
    title: 'Algorithms',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3',
  },
  {
    title: 'Ambient Calm',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
] as const;

const btnClass +
  'inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-[#7c5cff] text-white shadow-[0_2px_10px_rgba(124,92,255,0.4)] transition hover:bg-[#6b4ce6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/50';

export default function MusicButton() {
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const wantPlayRef = useRef(false);

  const loadTrack = useCallback((index: number, autoplay: boolean) => {
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
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => { /* silent fail */ });
      }
    } catch {
      /* silent fail */
    }
  }, []);

  useEffect(() => {
    const audio = new Audio(TRACKS[0].url);
    audio.volume = 0.45;
    audio.preload = 'metadata';
    audio.loop = false;
    audioRef.current = audio;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      loadTrack(indexRef.current + 1, true);
    };
    const onError = () => {
      /* silent fail — try next free track once */
      loadTrack(indexRef.current + 1, wantPlayRef.current);
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
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
  }, [loadTrack]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
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
    loadTrack(indexRef.current + dir, true);
  };

  const close = () => {
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
    <div className="ml-2 inline-flex items-center gap-1.5" role="group" aria-label="Music player">
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
          <path strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
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
