import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://search-hub-live.vercel.app"),
  title: {
    default: "SearchEmbed - Sub-millisecond Search Infrastructure",
    template: "%s · SearchEmbed",
  },
  description:
    "Drop one 2 KB script tag to index, rank, and typo-correct your catalog under a millisecond. Okapi BM25 ranking with predictable Rupee pricing from ₹19/mo.",
  keywords: [
    "BM25 search",
    "embedded search widget",
    "instant site search",
    "JavaScript search engine",
    "Okapi BM25",
    "docs search",
    "SearchEmbed",
  ],
  authors: [{ name: "Santosh Kumar", url: "https://github.com/santoshkumarvvv" }],
  openGraph: {
    title: "SearchEmbed - Sub-millisecond Search Infrastructure",
    description:
      "Drop one 2 KB script tag to index, rank, and typo-correct your catalog under a millisecond.",
    type: "website",
    siteName: "SearchEmbed",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SearchEmbed - Sub-millisecond Search Infrastructure",
    description: "Drop one 2 KB script tag for sub-millisecond BM25 search. Plans from ₹19/mo.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafbfc",
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
      <body className="dot-grid min-h-screen flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        {/* Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
            <a
              href="/"
              className="flex items-center gap-3 text-slate-900 no-underline focus:outline-none"
            >
              <div className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-sm shadow-sm">
                SE
              </div>
              <span className="font-bold text-lg tracking-tight">SearchEmbed</span>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                v2.4
              </span>
            </a>

            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600"
            >
              <a href="#features" className="hover:text-indigo-600 transition">
                Features
              </a>
              <a href="#sandbox" className="hover:text-indigo-600 transition">
                Sandbox
              </a>
              <a href="#pricing" className="hover:text-indigo-600 transition">
                Pricing
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-800 no-underline"
              >
                <span aria-hidden="true">⭐</span> GitHub
              </a>
              <a
                href="#pricing"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition no-underline whitespace-nowrap"
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
              <div className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs">
                SE
              </div>
              <span className="font-bold text-sm text-slate-900">SearchEmbed</span>
              <span className="text-xs text-slate-400">
                · Okapi BM25 Search Infrastructure
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="/demo.html" className="hover:text-indigo-600 transition">
                Demo
              </a>
              <a href="/pricing.html" className="hover:text-indigo-600 transition">
                Pricing
              </a>
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 transition"
              >
                GitHub
              </a>
              <a
                href="mailto:kumasantosh947@gmail.com"
                className="hover:text-indigo-600 transition"
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
