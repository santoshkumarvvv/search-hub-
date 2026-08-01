'use client';

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-4">⚠️</span>
      <h1 className="text-2xl font-extrabold text-white">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110"
      >
        Try Again
      </button>
    </div>
  );
}
