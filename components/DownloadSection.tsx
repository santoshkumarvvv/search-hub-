'use client';

import type { AppItem } from '@/lib/types';

export default function DownloadSection({ app }: { app: AppItem }) {
  return (
    <div className="shrink-0 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => alert(`Download started: ${app.name} v${app.version}`)}
        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent via-purple-500 to-accent2 px-8 py-3.5 text-sm font-extrabold text-ink shadow-cyber-lg transition-all hover:brightness-110 hover:shadow-cyber-lg active:scale-[0.97]"
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
        
        <span className="relative flex items-center gap-2">
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
        </span>
      </button>
      
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="flex items-center gap-1 text-[10px] text-muted">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent2"></span>
          Safe & Verified
        </span>
        <span className="text-muted/30">•</span>
        <span className="text-[10px] text-muted">
          Powered by SANTOSH KUMAR
        </span>
      </div>
    </div>
  );
}
