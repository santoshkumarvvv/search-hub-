"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Famous Brazilian Funk playlist — 16 recognizable anthems, each >= 2 minutes.
 * Hosted locally in /public/music/ and served from https://search-hub-live.vercel.app/music/...
 * for guaranteed HTTP 200 playback with zero external instability.
 */
export const TRACKS = [
  {
    title: "Desenrola Bate Joga de Ladin",
    artist: "Os Hawaianos & L7NNON",
    duration: "2:38",
    url: "/music/01-os-hawaianos-desenrola-bate-joga-de-ladin.mp3",
  },
  {
    title: "Olha a Explosão",
    artist: "MC Kevinho",
    duration: "3:07",
    url: "/music/02-mc-kevinho-olha-a-explosao.mp3",
  },
  {
    title: "Terremoto",
    artist: "Anitta & MC Kevinho",
    duration: "2:36",
    url: "/music/03-anitta-mc-kevinho-terremoto.mp3",
  },
  {
    title: "Mega Mandelão dos Fluxos",
    artist: "MC GW",
    duration: "3:30",
    url: "/music/04-mc-gw-mega-mandelao-dos-fluxos.mp3",
  },
  {
    title: "Montagem Coral",
    artist: "DJ Holanda, MC GW, MC TH & MC Cyclope",
    duration: "2:25",
    url: "/music/05-mc-gw-montagem-coral.mp3",
  },
  {
    title: "Maçã Verde",
    artist: "MC Hariel",
    duration: "3:21",
    url: "/music/06-mc-hariel-maca-verde.mp3",
  },
  {
    title: "Câmera Lenta",
    artist: "MC Hariel",
    duration: "4:05",
    url: "/music/07-mc-hariel-camera-lenta.mp3",
  },
  {
    title: "Cupido",
    artist: "MC Hariel",
    duration: "3:06",
    url: "/music/08-mc-hariel-cupido.mp3",
  },
  {
    title: "De História em História",
    artist: "MC Hariel",
    duration: "2:34",
    url: "/music/09-mc-hariel-de-historia-em-historia.mp3",
  },
  {
    title: "Baile de Favela (KondZilla)",
    artist: "MC João",
    duration: "3:08",
    url: "/music/10-mc-joao-baile-de-favela.mp3",
  },
  {
    title: "Dançarina (Funk Remix)",
    artist: "Pedro Sampaio, Anitta & MC Pedrinho",
    duration: "3:34",
    url: "/music/11-pedro-sampaio-anitta-mc-pedrinho-dancarina.mp3",
  },
  {
    title: "Luz do Luar (KondZilla)",
    artist: "MC Fioti",
    duration: "4:03",
    url: "/music/12-mc-fioti-luz-do-luar.mp3",
  },
  {
    title: "Joga Pra Frente",
    artist: "MC Kevinho",
    duration: "3:08",
    url: "/music/13-mc-kevinho-joga-pra-frente.mp3",
  },
  {
    title: "Cabelo Voa",
    artist: "Mr. Catra & MC G3",
    duration: "2:16",
    url: "/music/14-mr-catra-cabelo-voa.mp3",
  },
  {
    title: "Desce Glamourosa",
    artist: "Verônica Costa (Furacão 2000)",
    duration: "2:33",
    url: "/music/15-veronica-costa-desce-glamourosa.mp3",
  },
  {
    title: "Tócame",
    artist: "Anitta",
    duration: "2:48",
    url: "/music/16-anitta-tocame.mp3",
  },
] as const;

const MODERATE_VOLUME = 0.45;

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
          // If not yet unlocked via gesture, test if browser allows unmuted autoplay
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
    <div className="inline-flex items-center justify-center gap-1.5" role="group" aria-label="Music player">
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
        aria-label="Skip to next track"
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
