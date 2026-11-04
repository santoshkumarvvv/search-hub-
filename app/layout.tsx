import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SearchEmbed — Search That Just Works, Zero Cloud Bill',
    template: '%s · SearchEmbed',
  },
  description:
    'Add instant, typo-tolerant BM25 search to any website or app in sixty seconds with one script tag. UPI pricing from ₹19/month.',
  applicationName: 'SearchEmbed',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    title: 'SearchEmbed — Search That Just Works, Zero Cloud Bill',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased selection:bg-purple/30 selection:text-white">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="font-display text-lg font-extrabold tracking-tight text-white transition hover:opacity-90"
            >
              <span className="bg-gradient-to-r from-purple via-purple to-gold bg-clip-text text-transparent">
                SearchEmbed
              </span>
            </Link>

            <nav aria-label="Primary navigation" className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm font-medium text-muted">
              <a href="/demo.html" className="transition hover:text-white">
                Demo
              </a>
              <a href="/pricing.html" className="transition hover:text-white">
                Pricing
              </a>
              <Link href="/catalog" className="transition hover:text-white">
                Catalog
              </Link>
              <a
                href="/pricing.html"
                className="hidden sm:inline-flex items-center rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-purple/70 hover:text-gold"
              >
                See pricing
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-line/80 bg-ink px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="font-display bg-gradient-to-r from-purple to-gold bg-clip-text text-base font-extrabold text-transparent">
                SearchEmbed
              </span>
              <p className="mt-1 text-xs text-muted">
                Contact:{' '}
                <a href="mailto:kumasantosh947@gmail.com" className="text-white/90 hover:text-gold transition">
                  kumasantosh947@gmail.com
                </a>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted">
              <a href="/demo.html" className="transition hover:text-white">
                Demo
              </a>
              <a href="/pricing.html" className="transition hover:text-white">
                Pricing
              </a>
              <Link href="/catalog" className="transition hover:text-white">
                Catalog
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
                href="mailto:kumasantosh947@gmail.com"
                className="transition hover:text-white"
              >
                kumasantosh947@gmail.com
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
