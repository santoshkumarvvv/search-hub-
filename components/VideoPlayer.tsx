'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Loader2,
} from 'lucide-react';
import type { VideoSource } from '@/lib/types';
import { cn, formatDuration } from '@/lib/utils';

interface Props {
  source: VideoSource;
  title: string;
  poster?: string;
  /** localStorage key used to resume playback (mp4 only) */
  resumeKey?: string;
}

export default function VideoPlayer({ source, title, poster, resumeKey }: Props) {
  if (source.kind === 'youtube' || source.kind === 'vimeo') {
    const src =
      source.kind === 'youtube'
        ? `https://www.youtube-nocookie.com/embed/${source.id}?rel=0&modestbranding=1&playsinline=1`
        : `https://player.vimeo.com/video/${source.id}?dnt=1&title=0&byline=0`;

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black shadow-card">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return <NativePlayer url={source.url} poster={source.poster ?? poster} title={title} resumeKey={resumeKey} />;
}

function NativePlayer({
  url,
  poster,
  title,
  resumeKey,
}: {
  url: string;
  poster?: string;
  title: string;
  resumeKey?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  /* resume position */
  useEffect(() => {
    if (!resumeKey) return;
    const v = videoRef.current;
    if (!v) return;
    const saved = Number(window.localStorage.getItem(`kitsune:pos:${resumeKey}`) ?? 0);
    if (saved > 5) {
      const apply = () => {
        if (saved < v.duration - 10) v.currentTime = saved;
      };
      if (v.readyState >= 1) apply();
      else v.addEventListener('loadedmetadata', apply, { once: true });
    }
  }, [resumeKey]);

  useEffect(() => {
    if (!resumeKey) return;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (v && !v.paused && v.currentTime > 0) {
        window.localStorage.setItem(`kitsune:pos:${resumeKey}`, String(v.currentTime));
      }
    }, 5000);
    return () => clearInterval(id);
  }, [resumeKey]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => setFailed(true));
    else v.pause();
  };

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration || 0);
  };

  const toggleFullscreen = async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* fullscreen may be blocked */
    }
  };

  /* keyboard shortcuts scoped to the player */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if ([' ', 'k', 'arrowleft', 'arrowright', 'f', 'm'].includes(key)) e.preventDefault();
    if (key === ' ' || key === 'k') togglePlay();
    if (key === 'arrowleft') seek(-10);
    if (key === 'arrowright') seek(10);
    if (key === 'f') void toggleFullscreen();
    if (key === 'm') {
      const v = videoRef.current;
      if (v) {
        v.muted = !v.muted;
        setMuted(v.muted);
      }
    }
  };

  const nudgeControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2800);
  };

  const progress = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={nudgeControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      role="region"
      aria-label={`Video player: ${title}`}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        playsInline
        preload="metadata"
        className="h-full w-full bg-black"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          nudgeControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setTime(v.currentTime);
          if (v.buffered.length) {
            setBuffered((v.buffered.end(v.buffered.length - 1) / (v.duration || 1)) * 100);
          }
        }}
      />

      {loading && !failed && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/40">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-ink/95 px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-white">वीडियो लोड नहीं हो सका</p>
            <p className="mt-1 text-xs text-muted">
              स्रोत उपलब्ध नहीं है या नेटवर्क धीमा है। कृपया दोबारा कोशिश करें।
            </p>
            <button
              type="button"
              className="btn-ghost mt-4 px-4 py-2 text-xs"
              onClick={() => {
                setFailed(false);
                setLoading(true);
                videoRef.current?.load();
              }}
            >
              <RotateCcw size={14} /> फिर से लोड करें
            </button>
          </div>
        </div>
      )}

      {!playing && !loading && !failed && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center bg-black/25 transition-colors hover:bg-black/10"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-white shadow-glow transition-transform hover:scale-110 sm:h-20 sm:w-20">
            <Play size={30} fill="currentColor" className="ml-1" />
          </span>
        </button>
      )}

      {/* controls */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 sm:px-4',
          controlsVisible || !playing ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {/* seek bar */}
        <div className="group/bar relative mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/25"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 scale-0 rounded-full bg-accent shadow-glow transition-transform group-hover/bar:scale-100" />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            aria-label="Seek"
            onChange={(e) => {
              const v = videoRef.current;
              if (v) {
                v.currentTime = Number(e.target.value);
                setTime(Number(e.target.value));
              }
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="flex items-center gap-3 text-white">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="transition-transform hover:scale-110">
            {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button type="button" onClick={() => seek(-10)} aria-label="Rewind 10 seconds" className="hidden transition-transform hover:scale-110 sm:block">
            <RotateCcw size={18} />
          </button>
          <button type="button" onClick={() => seek(10)} aria-label="Forward 10 seconds" className="hidden transition-transform hover:scale-110 sm:block">
            <RotateCw size={18} />
          </button>

          <div className="group/vol flex items-center gap-2">
            <button
              type="button"
              aria-label={muted ? 'Unmute' : 'Mute'}
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.muted = !v.muted;
                setMuted(v.muted);
              }}
              className="transition-transform hover:scale-110"
            >
              {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                const val = Number(e.target.value);
                const v = videoRef.current;
                if (v) {
                  v.volume = val;
                  v.muted = val === 0;
                  setMuted(val === 0);
                }
                setVolume(val);
              }}
              className="h-1 w-0 cursor-pointer accent-accent opacity-0 transition-all duration-300 group-hover/vol:w-16 group-hover/vol:opacity-100 sm:w-16 sm:opacity-100"
            />
          </div>

          <span className="ml-auto font-mono text-[11px] tabular-nums text-gray-300 sm:text-xs">
            {formatDuration(time)} / {formatDuration(duration)}
          </span>

          <button type="button" onClick={toggleFullscreen} aria-label="Toggle fullscreen" className="transition-transform hover:scale-110">
            {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
          </button>
        </div>
      </div>
    </div>
  );
}
