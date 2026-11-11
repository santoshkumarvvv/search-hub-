import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SearchEmbed - Sub-millisecond Search Infrastructure",
    template: "%s · SearchEmbed",
  },
  description:
    "Drop one 2 KB script tag to index, rank, and typo-correct your catalog under a millisecond.",
  keywords: [
    "BM25 search engine",
    "embeddable search widget",
    "typo-tolerant search",
    "instant search API",
    "SearchEmbed",
  ],
  authors: [{ name: "Santosh Kumar" }],
  creator: "Santosh Kumar",
  publisher: "SearchEmbed",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    title: "SearchEmbed",
    description:
      "Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond",
    siteName: "SearchEmbed",
    url: "https://search-hub-live.vercel.app",
    images: [
      {
        url: "https://search-hub-live.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "SearchEmbed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SearchEmbed",
    description:
      "Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond",
    images: ["https://search-hub-live.vercel.app/og-image.png"],
  },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#fafbfc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dot-grid min-h-screen flex flex-col antialiased selection:bg-slate-900 selection:text-white">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        {/* Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
          <div
            className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "60px",
            }}
          >
            <a href="/" className="flex items-center gap-2.5 no-underline shrink-0">
              <div className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-sm shadow-sm">
                SE
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                SearchEmbed
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                v2.4
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-slate-900 transition">
                Features
              </a>
              <a href="#sandbox" className="hover:text-slate-900 transition">
                Sandbox
              </a>
              <a href="#pricing" className="hover:text-slate-900 transition">
                Pricing
              </a>
            </nav>

            <div className="flex items-center shrink-0">
              <a
                href="#pricing"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap inline-flex items-center justify-center leading-none"
                style={{
                  height: "auto",
                  padding: "8px 14px",
                  borderRadius: "8px",
                }}
              >
                Get API Key &rarr;
              </a>
            </div>
          </div>
        </header>

        <div id="main" className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white font-bold px-2.5 py-1 rounded-lg text-xs">
                SE
              </div>
              <span className="font-bold text-sm text-slate-900">SearchEmbed</span>
              <span className="text-xs text-slate-400">
                · Okapi BM25 Search Infrastructure
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#sandbox" className="hover:text-slate-900 transition">
                Demo
              </a>
              <a href="#pricing" className="hover:text-slate-900 transition">
                Pricing
              </a>
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition"
              >
                GitHub
              </a>
              <a
                href="mailto:kumasantosh947@gmail.com"
                className="hover:text-slate-900 transition"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
