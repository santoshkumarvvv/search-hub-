'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Trailer player.
 *
 * Renders a branded shell and only mounts the YouTube iframe after an explicit
 * click, so no third-party frame loads until the user asks for it. The iframe
 * is sandboxed and uses the no-cookie host.
 */

interface Props {
  trailerKey: string | null;
  title: string;
  backdrop: string | null;
}

export default function Player({ trailerKey, title, backdrop }: Props) {
  const [active, setActive] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  // Tear the frame down when the title changes so audio never bleeds across pages.
  useEffect(() => {
    setActive(false);
  }, [trailerKey]);

  const src = trailerKey
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailerKey)}` +
      '?rel=0&modestbranding=1&playsinline=1&autoplay=1'
    : null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-panel2">
      {backdrop && !active && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backdrop}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}

      {active && src ? (
        <iframe
          ref={frameRef}
          src={src}
          title={`${title} — trailer`}
          className="absolute inset-0 h-full w-full border-0"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-ink/90 to-transparent p-6 text-center">
          {src ? (
            <>
              <button
                type="button"
                onClick={() => setActive(true)}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink transition hover:brightness-110"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play trailer
              </button>
              <p className="text-xs text-muted">Official trailer · opens in our player</p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-panel text-muted">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">No trailer available</p>
              <p className="max-w-sm text-xs text-muted">
                This title has no official trailer on file. Metadata is shown below.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
