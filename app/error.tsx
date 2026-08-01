'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('System Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
          <span className="text-4xl">⚠️</span>
        </div>
      </div>
      
      <h1 className="mb-4 text-2xl font-extrabold text-white">
        System Malfunction
      </h1>
      
      <p className="mb-6 max-w-md text-muted">
        A critical error has been detected in the neural network. 
        Our AI systems are working to resolve this issue.
      </p>
      
      {error.digest && (
        <p className="mb-6 rounded bg-panel px-4 py-2 font-mono text-xs text-muted/60">
          ERROR_ID: {error.digest}
        </p>
      )}
      
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-6 py-3 font-bold text-accent transition hover:border-accent hover:bg-accent hover:text-ink"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
        Reboot System
      </button>
      
      <p className="mt-8 text-xs text-muted/40">
        SearchHub Error Handler · SANTOSH KUMAR Systems
      </p>
    </div>
  );
}
