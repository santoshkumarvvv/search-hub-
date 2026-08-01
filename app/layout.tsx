import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SearchHub — Download APK, MOD & Games',
    template: '%s · SearchHub'
  },
  description:
    'Download the latest APK, MOD and premium unlocked Android apps and games for free. Fast, safe and always up-to-date.',
  applicationName: 'SearchHub',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  },
  openGraph: {
    type: 'website',
    title: 'SearchHub — Download APK, MOD & Games',
    description:
      'Download the latest APK, MOD and premium unlocked Android apps and games for free.',
    siteName: 'SearchHub'
  },
  twitter: { card: 'summary_large_image' },
  referrer: 'no-referrer'
};

export const viewport: Viewport = {
  themeColor: '#0d1117',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a className="skip-link" href="#grid">
          Skip to catalog
        </a>

        {children}

        <footer className="border-t border-line bg-panel px-4 py-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div>
                <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-lg font-extrabold text-transparent">
                  SearchHub
                </span>
                <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-muted">
                  Your go-to source for APK, MOD and premium unlocked Android apps. Fast
                  downloads, always free.
                </p>
              </div>
              <div className="flex gap-12 text-[12px] text-muted">
                <div>
                  <h4 className="mb-2 font-bold uppercase tracking-wider text-white/70 text-[10px]">
                    Categories
                  </h4>
                  <ul className="space-y-1.5">
                    <li><a href="/?category=game" className="hover:text-accent transition">Games</a></li>
                    <li><a href="/?category=app" className="hover:text-accent transition">Apps</a></li>
                    <li><a href="/?category=tool" className="hover:text-accent transition">Tools</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-bold uppercase tracking-wider text-white/70 text-[10px]">
                    Popular
                  </h4>
                  <ul className="space-y-1.5">
                    <li><a href="/?q=minecraft" className="hover:text-accent transition">Minecraft</a></li>
                    <li><a href="/?q=spotify" className="hover:text-accent transition">Spotify</a></li>
                    <li><a href="/?q=gta" className="hover:text-accent transition">GTA San Andreas</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-line pt-4 text-center text-[11px] text-muted/60">
              SearchHub · Built by{' '}
              <a
                href="https://github.com/santoshkumarvvv"
                rel="noopener noreferrer"
                target="_blank"
                className="font-semibold text-accent hover:underline"
              >
                Santosh Kumar
              </a>{' '}
              · MIT License
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
