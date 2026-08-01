'use client';

import type { AppItem } from '@/lib/types';

export default function DownloadSection({ app }: { app: AppItem }) {
  return (
    <div className="shrink-0 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => alert(`Download started: ${app.name} v${app.version}`)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent2 px-8 py-3.5 text-sm font-extrabold text-ink transition hover:brightness-110 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97]"
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
        Download APK
      </button>
      <p className="mt-2 text-center text-[10px] text-muted">
        v{app.version} · {app.size} · Safe &amp; Verified
      </p>
    </div>
  );
}
