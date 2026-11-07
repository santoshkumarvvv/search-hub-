'use client';

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary mt-6 min-h-12 px-8"
      >
        Try Again
      </button>
    </div>
  );
}
