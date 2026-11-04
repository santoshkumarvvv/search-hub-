import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SearchEmbed — Client-Side BM25 Search, Zero Server Cost',
    template: '%s · SearchEmbed'
  },
  description:
    'Drop-in BM25 search widget that runs entirely in the browser. No server, no cloud bill, no Algolia invoice. UPI pricing from ₹19/month for India.',
  applicationName: 'SearchEmbed',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  },
  openGraph: {
    type: 'website',
    title: 'SearchEmbed — Client-Side BM25 Search, Zero Server Cost',
    description:
      'BM25 search widget running in your browser. Zero server cost. UPI pricing ₹19–199/month.',
    siteName: 'SearchEmbed'
  },
  twitter: { card: 'summary_large_image' },
  referrer: 'no-referrer'
);

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        {children}

        <footer className="border-t border-line bg-panel px-4 py-10">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <div>
                <span className="bg-gradient-to-r from-purple to-gold bg-clip-text text-lg font-extrabold text-transparent">
                  SearchEmbed
                </span>
                <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-muted">
                  Client-side BM25 search. Zero server cost. UPI pricing for India.
                </p>
              </div>
              <div className="flex gap-12 text-[12px] text-muted">
                <div>
                  <h4 className="mb-2 font-bold uppercase tracking-wider text-white/70 text-[10px]">
                    Product
                  </h4>
                  <ul className="space-y-1.5">
                    <li><a href="/pricing.html" className="hover:text-purple transition">Pricing</a></li>
                    <li><a href="/demo.html" className="hover:text-purple transition">Demo</a></li>
                    <li><a href="/catalog" className="hover:text-purple transition">Catalog</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-bold uppercase tracking-wider text-white/70 text-[10px]">
                    Links
                  </h4>
                  <ul className="space-y-1.5">
                    <li><a href="https://github.com/santoshkumarvvv/search-hub-" target="_blank" rel="noreferrer" className="hover:text-purple transition">GitHub</a></li>
                    <li><a href="https://santoshkumarvvv.github.io" className="hover:text-purple transition">Portfolio</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-line pt-4 text-center text-[11px] text-muted/60">
              SearchEmbed · Built by{' '}
              <a
                href="https://github.com/santoshkumarvvv"
                rel="noreferrer"
                target="_blank"
                className="font-semibold text-purple hover:underline"
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
