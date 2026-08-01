import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SearchHub — APK, MOD & Games Download Portal',
    template: '%s · SearchHub'
  },
  description:
    'Download the latest APK, MOD and premium unlocked Android apps and games for free. Fast, safe and always up-to-date. Powered by SANTOSH KUMAR.',
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
  referrer: 'no-referrer',
  authors: [{ name: 'Santosh Kumar', url: 'https://github.com/santoshkumarvvv' }],
  creator: 'Santosh Kumar',
  keywords: ['APK', 'MOD', 'Games', 'Android', 'Download', 'SearchHub', 'Santosh Kumar']
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
                <span className="bg-gradient-to-r from-accent via-purple-400 to-accent2 bg-clip-text text-lg font-extrabold text-transparent">
                  SearchHub
                </span>
                <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-muted">
                  Your go-to source for APK, MOD and premium unlocked Android apps. Fast
                  downloads, always free. Powered by <span className="text-accent font-semibold">SANTOSH KUMAR</span>.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent2"></span>
                  <span className="text-[10px] text-muted/60 font-medium">SYSTEM ONLINE</span>
                </div>
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
            <div className="mt-8 border-t border-line pt-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-muted/60">SANTOSH KUMAR</span>
                  <span className="text-muted/30">•</span>
                  <a
                    href="https://github.com/santoshkumarvvv"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-[11px] font-semibold text-accent hover:underline"
                  >
                    @santoshkumarvvv
                  </a>
                </div>
                <p className="text-[10px] text-muted/40">
                  © 2024 SearchHub · Multi-AI Cyberpunk Edition · Built by SANTOSH KUMAR
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
