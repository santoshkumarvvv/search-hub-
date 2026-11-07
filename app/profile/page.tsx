'use client';

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple">Founder</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold text-ink sm:text-5xl">Santosh Kumar</h1>
      <p className="mt-4 max-w-xl text-muted leading-relaxed">
        Building SearchEmbed — Okapi BM25 search that ships in a single script tag,
        with Hindi voice, typo tolerance, and rupee pricing.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="https://github.com/santoshkumarvvv" className="btn-primary min-h-12 px-6" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="/" className="btn-secondary min-h-12 px-6">
          Back to SearchEmbed
        </a>
      </div>
    </main>
  );
}
