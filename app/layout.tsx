import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://kitsune-stream.vercel.app'),
  title: {
    default: 'KitsuneStream — Modern Anime Streaming',
    template: '%s · KitsuneStream',
  },
  description:
    'एक तेज़, सुंदर anime streaming अनुभव — trending सीरीज़, श्रेणियाँ, खोज और HD प्लेयर।',
  keywords: ['anime', 'streaming', 'hindi anime', 'watch anime online', 'nextjs'],
  openGraph: {
    type: 'website',
    siteName: 'KitsuneStream',
    title: 'KitsuneStream — Modern Anime Streaming',
    description: 'Trending anime, श्रेणियाँ, खोज और एक तेज़ HD प्लेयर।',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07080c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          मुख्य सामग्री पर जाएँ
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
