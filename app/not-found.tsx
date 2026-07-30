import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      id="grid"
      className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p className="text-5xl font-black text-accent">404</p>
      <h1 className="text-xl font-bold text-white">Title not found</h1>
      <p className="text-sm leading-relaxed text-muted">
        That title isn&apos;t in the catalog, or the upstream provider no longer lists it.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110"
      >
        Back to catalog
      </Link>
    </main>
  );
}
