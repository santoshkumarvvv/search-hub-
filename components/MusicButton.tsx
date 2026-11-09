"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Famous Hindi Songs playlist — 15 widely recognized Bollywood hits, classic playback, and indie Hindi tracks,
 * each over 2 minutes long (3:35 to 6:52).
 * Hosted in /public/music/ and served from https://search-hub-live.vercel.app/music/...
 * for guaranteed HTTP 200 playback with zero external instability.
 */
export const TRACKS = [
  {
    title: "Chaiyya Chaiyya (Dil Se)",
    artist: "Sukhwinder Singh, Sapna Awasthi & A.R. Rahman",
    duration: "6:52",
    url: "/music/01-chaiyya-chaiyya-dil-se.mp3",
  },
  {
    title: "Kun Faya Kun (Rockstar)",
    artist: "A.R. Rahman, Javed Ali & Mohit Chauhan",
    duration: "6:21",
    url: "/music/02-kun-faya-kun-rockstar.mp3",
  },
  {
    title: "Nadaan Parinde (Rockstar)",
    artist: "A.R. Rahman & Mohit Chauhan",
    duration: "5:00",
    url: "/music/03-nadaan-parinde-rockstar.mp3",
  },
  {
    title: "Tere Bina (Guru)",
    artist: "A.R. Rahman & Chinmayi",
    duration: "4:47",
    url: "/music/04-tere-bina-guru.mp3",
  },
  {
    title: "Maa Tujhe Salaam (Vande Mataram)",
    artist: "A.R. Rahman",
    duration: "4:43",
    url: "/music/05-maa-tujhe-salaam-vande-mataram.mp3",
  },
  {
    title: "Yeh Jo Des Hai Tera (Swades)",
    artist: "A.R. Rahman",
    duration: "5:26",
    url: "/music/06-yeh-jo-des-hai-tera-swades.mp3",
  },
  {
    title: "Choti Si Aasha (Roja)",
    artist: "Minmini & A.R. Rahman",
    duration: "4:43",
    url: "/music/07-choti-si-aasha-roja.mp3",
  },
  {
    title: "Rangeela Re (Rangeela)",
    artist: "Asha Bhosle, Aditya Narayan & A.R. Rahman",
    duration: "5:31",
    url: "/music/08-rangeela-re.mp3",
  },
  {
    title: "Jai Ho (Slumdog Millionaire)",
    artist: "A.R. Rahman & Sukhwinder Singh",
    duration: "3:41",
    url: "/music/09-jai-ho-ar-rahman.mp3",
  },
  {
    title: "Bombay Theme",
    artist: "A.R. Rahman",
    duration: "5:18",
    url: "/music/10-bombay-theme-ar-rahman.mp3",
  },
  {
    title: "Kesariya Balam (Lekin)",
    artist: "Lata Mangeshkar",
    duration: "5:30",
    url: "/music/11-kesariya-balam-lata-mangeshkar.mp3",
  },
  {
    title: "Kesariya Balam (Euphoria Rock)",
    artist: "Palash Sen (Euphoria)",
    duration: "5:30",
    url: "/music/12-kesariya-balam-palash-sen.mp3",
  },
  {
    title: "Kesariya Balam (Folk Fusion)",
    artist: "Shubha Mudgal",
    duration: "3:35",
    url: "/music/13-kesariya-balam-shubha-mudgal.mp3",
  },
  {
    title: "Kesariya Balam (Padharo Mhare Des)",
    artist: "Allah Jilai Bai",
    duration: "6:39",
    url: "/music/14-kesariya-balam-allah-jilai-bai.mp3",
  },
  {
    title: "Kuch Naa Kaho",
    artist: "Queenie Fernandes (Jazz Goa)",
    duration: "4:24",
    url: "/music/15-kuch-naa-kaho.mp3",
  },
] as const;

const OG_ART = "https://search-hub-live.vercel.app/og-image.png";
const MODERATE_VOLUME = 0.45;

function setSessionArtwork(title: string, artist: string) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      artwork: [96, 128, 192, 512].map((size) => ({
        src: OG_ART,
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
    });
  } catch {
    /* ignore */
  }
}

const btnClass =
  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-[#7c5cff] text-white shadow-[0_2px_10px_rgba(124,92,255,0.4)] transition hover:bg-[#6b4ce6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/50";

export default function MusicButton() {
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const wantPlayRef = useRef(true);
  const unlockedRef = useRef(false);
  const errorCountRef = useRef(0);

  const attemptPlayWithFallback = useCallback((audio: HTMLAudioElement) => {
    try {
      audio.volume = MODERATE_VOLUME;
      if (!unlockedRef.current) {
        // Start muted on initial page load so browser autoplay always succeeds,
        // then unmute to 0.45 on first user interaction (or try unmuted if allowed).
        audio.muted = true;
      }
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          if (!unlockedRef.current) {
            try {
              audio.muted = false;
              audio.volume = MODERATE_VOLUME;
              if (audio.paused) {
                audio.muted = true;
                const retry = audio.play();
                if (retry && typeof retry.catch === "function") retry.catch(() => {});
              }
            } catch {
              audio.muted = true;
            }
          }
        }).catch(() => {
          try {
            audio.muted = true;
            const mutedPromise = audio.play();
            if (mutedPromise && typeof mutedPromise.catch === "function") {
              mutedPromise.catch(() => {
                /* silent — resumes on first user interaction */
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
      setSessionArtwork(TRACKS[next].title, TRACKS[next].artist);
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
    audio.muted = true;
    audio.preload = "auto";
    audio.loop = false;
    audioRef.current = audio;
    wantPlayRef.current = true;
    setSessionArtwork(TRACKS[0].title, TRACKS[0].artist);

    const onPlay = () => {
      errorCountRef.current = 0;
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      // Auto-advance to next track; wrap-around loop from last track back to first (0)
      loadTrack(indexRef.current + 1, true);
    };
    const onError = () => {
      // Silently advance to next track on any audio error with zero error UI
      errorCountRef.current += 1;
      if (errorCountRef.current < TRACKS.length) {
        loadTrack(indexRef.current + 1, wantPlayRef.current);
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Autoplay on page load with muted-then-unmute fallback
    attemptPlayWithFallback(audio);

    // Restore volume to 0.45 unmuted on first user interaction
    const unlockAudio = () => {
      unlockedRef.current = true;
      const current = audioRef.current;
      if (!current) return;
      try {
        current.muted = false;
        current.volume = MODERATE_VOLUME;
        if (wantPlayRef.current && current.paused) {
          const p = current.play();
          if (p && typeof p.catch === "function") p.catch(() => { /* silent */ });
        }
      } catch {
        /* silent */
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
    window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
    window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
    window.addEventListener("click", unlockAudio, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      try {
        audio.pause();
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
        audioRef.current = null;
      } catch {
        /* ignore */
      }
    };
  }, [attemptPlayWithFallback, loadTrack]);

  const toggle = () => {
    unlockedRef.current = true;
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.muted = false;
      audio.volume = MODERATE_VOLUME;
      if (audio.paused) {
        wantPlayRef.current = true;
        const p = audio.play();
        if (p && typeof p.catch === "function") p.catch(() => { /* silent */ });
      } else {
        wantPlayRef.current = false;
        audio.pause();
      }
    } catch {
      /* silent */
    }
  };

  const skip = (dir: 1 | -1) => {
    unlockedRef.current = true;
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

  const currentTrack = TRACKS[trackIndex];

  return (
    <div className="relative inline-flex h-14 items-center justify-center px-11" role="group" aria-label="Music player">
      <div className="inline-flex items-center justify-center gap-0.5">
      <button
        type="button"
        onClick={() => skip(-1)}
        aria-label="Skip to previous track"
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
        aria-label={playing ? `Pause ${currentTrack.title} by ${currentTrack.artist}` : `Play ${currentTrack.title} by ${currentTrack.artist}`}
        aria-pressed={playing}
        title={`${currentTrack.artist} — ${currentTrack.title} (${currentTrack.duration})`}
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
        onClick={() => skip(1)}
        aria-label="Skip to next track"
        title="Skip"
        className={btnClass}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Close music player"
        title="Close"
        className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center bg-transparent text-[#a1a1aa] hover:text-ink"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
