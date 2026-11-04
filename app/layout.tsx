import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SearchEmbed — Instant Client-Side BM25 Search, Zero Server Cost',
    template: '%s · SearchEmbed',
  },
  description:
    'Drop-in Okapi BM25 search widget and tiered API gateway that runs in the browser and at the edge. Zero Algolia bill. UPI pricing from ₹19/month.',
  applicationName: 'SearchEmbed',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    title: 'SearchEmbed — Instant Client-Side BM25 Search, Zero Server Cost',
    description:
      'Sub-millisecond Okapi BM25 search with typo tolerance and scrypt-vaulted API keys. UPI pricing ₹19–₹199/month.',
    siteName: 'SearchEmbed',
  },
  twitter: { card: 'summary_large_image' },
  referrer: 'no-referrer',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased selection:bg-purple/30 selection:text-white">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1160px] items-center justify-between px-4 py-3.5 sm:px-6">
            <Link
              href="/"
              className="font-display text-lg font-extrabold tracking-tight text-white transition hover:opacity-90"
            >
              <span className="bg-gradient-to-r from-purple via-purple to-gold bg-clip-text text-transparent">
                SearchEmbed
              </span>
            </Link>

            <nav aria-label="Primary navigation" className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm font-medium text-muted">
              <a href="/#features" className="transition hover:text-white">
                Features
              </a>
              <a href="/#live-demo" className="transition hover:text-white">
                Live Demo
              </a>
              <a href="/#pricing" className="transition hover:text-white">
                Pricing
              </a>
              <Link href="/catalog" className="transition hover:text-white">
                Catalog
              </Link>
              <a
                href="/pricing.html"
                className="hidden sm:inline-flex items-center rounded-lg border border-line bg-panel2 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:border-purple/70 hover:text-gold active:scale-[0.98]"
              >
                Start from ₹19/mo
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-line/80 bg-ink px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-[1160px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="font-display bg-gradient-to-r from-purple to-gold bg-clip-text text-base font-extrabold text-transparent">
                SearchEmbed
              </span>
              <p className="mt-1 text-xs text-muted">
                Okapi BM25 search engine · Typo tolerance · Scrypt API gateway · UPI pricing for India.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted">
              <a href="/demo.html" className="transition hover:text-white">
                Standalone Demo
              </a>
              <a href="/pricing.html" className="transition hover:text-white">
                Pricing
              </a>
              <Link href="/catalog" className="transition hover:text-white">
                45-App Catalog
              </Link>
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://santoshkumarvvv.github.io"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                Santosh Kumar
              </a>
            </div>
          </div>
        </footer>

        <script
          dangerouslySetInnerHTML={{
            __html:
              "if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function() {}); }); }",
          }}
        />
      </body>
    </html>
  );
}
