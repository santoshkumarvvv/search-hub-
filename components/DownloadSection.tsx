'use client';

import { useState } from 'react';
import type { AppItem } from '@/lib/types';

export default function DownloadSection({ app }: { app: AppItem }) {
  const [started, setStarted] = useState(false);

  return (
    <div className="shrink-0 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="btn-cta-gradient flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-extrabold text-white transition"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {started ? `Downloading ${app.name} v${app.version}…` : 'Download Package'}
      </button>
      <p className="mt-2 text-center text-[10px] text-muted">
        v{app.version} · {app.size} · Safe &amp; Verified
      </p>
    </div>
  );
}
