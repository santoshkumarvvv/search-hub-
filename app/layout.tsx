import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MediaHub — Anime, Movies & Series',
    template: '%s · MediaHub'
  },
  description:
    'A fast, installable catalog for anime, films and series. Search thousands of titles, filter by genre and watch official trailers.',
  applicationName: 'MediaHub',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  },
  openGraph: {
    type: 'website',
    title: 'MediaHub — Anime, Movies & Series',
    description: 'Search thousands of titles, filter by genre and watch official trailers.',
    siteName: 'MediaHub'
  },
  twitter: { card: 'summary_large_image' },
  referrer: 'no-referrer'
};

export const viewport: Viewport = {
  themeColor: '#0b0d14',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a className="skip-link" href="#grid">Skip to catalog</a>

        {children}

        <footer className="border-t border-line px-4 py-8 text-center text-[11.5px] leading-7 text-muted">
          <p>MediaHub · installable · offline-capable</p>
          <p>
            Metadata by{' '}
            <a
              href="https://jikan.moe"
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-accent2 hover:underline"
            >
              Jikan
            </a>{' '}
            and{' '}
            <a
              href="https://www.themoviedb.org"
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-accent2 hover:underline"
            >
              TMDb
            </a>
            . Trailers stream from YouTube.
          </p>
          <p>
            Built by{' '}
            <a
              href="https://github.com/santoshkumarvvv"
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-accent2 hover:underline"
            >
              Santosh Kumar
            </a>{' '}
            · MIT
          </p>
        </footer>

        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}`.trim()
          }}
        />
      </body>
    </html>
  );
}
