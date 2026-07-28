import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anime-hindi-dub.vercel.app';
const SITE_NAME = 'AnimeHindiDub';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'एनिमे हिंदी डब — Anime Hindi Dub ऑनलाइन देखें',
    template: `%s · ${SITE_NAME}`,
  },
  description:
    'सबसे नई एनिमे सीरीज़ हिंदी डब में मुफ़्त और HD क्वालिटी में देखें। ट्रेंडिंग, नई रिलीज़, श्रेणियाँ और तेज़ प्लेयर — सब एक जगह।',
  keywords: [
    'anime hindi dub',
    'एनिमे हिंदी डब',
    'anime in hindi',
    'hindi dubbed anime',
    'anime hindi me',
    'watch anime online hindi',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'एनिमे हिंदी डब — Anime Hindi Dub ऑनलाइन देखें',
    description: 'ट्रेंडिंग एनिमे हिंदी डब में HD क्वालिटी में देखें।',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'एनिमे हिंदी डब — Anime Hindi Dub',
    description: 'ट्रेंडिंग एनिमे हिंदी डब में HD क्वालिटी में देखें।',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#07080c',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'एनिमे हिंदी डब',
  url: SITE_URL,
  inLanguage: 'hi-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi-IN" suppressHydrationWarning>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
