'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[MediaHub]', error);
  }, [error]);

  return (
    <main
      id="grid"
      className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <h1 className="text-xl font-bold text-white">Something went wrong</h1>
      <p className="text-sm leading-relaxed text-muted">
        The catalog could not be loaded. This is usually a temporary upstream issue.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110"
      >
        Try again
      </button>
    </main>
  );
}
