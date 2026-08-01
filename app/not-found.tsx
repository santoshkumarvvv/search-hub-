import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-4">😕</span>
      <h1 className="text-2xl font-extrabold text-white">Page Not Found</h1>
      <p className="mt-2 text-sm text-muted">
        The app or page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110"
      >
        Back to Home
      </Link>
    </div>
  );
}
