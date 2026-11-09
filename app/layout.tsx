import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SearchEmbed — Search that ships in seconds",
    template: "%s · SearchEmbed",
  },
  description:
    "Instant Okapi BM25 search with typo tolerance, federated signals, and scrypt-authenticated API keys. 2 KB widget starting at ₹19/month via UPI.",
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
      "Drop one 2 KB script tag to index, rank, and typo-correct your catalog in under a millisecond.",
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
      "Drop one 2 KB script tag to index, rank, and typo-correct your catalog in under a millisecond.",
    images: ["https://search-hub-live.vercel.app/og-image.png"],
  },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#F8FAFC",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-slate-900 antialiased selection:bg-indigo-500/15 selection:text-slate-950 min-h-screen overflow-x-hidden flex flex-col">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        {/* STICKY GLASSMORPHISM NAVBAR */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 h-16">
          <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-4 sm:px-6">
            {/* Left: Brand mark + Wordmark + Version badge */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 focus-visible:outline-none"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-extrabold tracking-tight text-white shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-105">
                  SE
                </span>
                <span className="font-display text-base font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-indigo-600">
                  SearchEmbed
                </span>
              </Link>
              <span className="rounded-md border border-slate-200/80 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                v2.4
              </span>
            </div>

            {/* Center (Desktop): Smooth-scroll links */}
            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
            >
              <a href="#sandbox" className="transition-colors hover:text-indigo-600">
                Sandbox
              </a>
              <a href="#features" className="transition-colors hover:text-indigo-600">
                Benchmarks
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-indigo-600">
                3-Step Setup
              </a>
              <a href="#pricing" className="transition-colors hover:text-indigo-600">
                Pricing
              </a>
            </nav>

            {/* Right: GitHub star badge + Get API Key CTA */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>GitHub ★</span>
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span>Get API Key</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        {/* STRUCTURED DEVELOPER FOOTER */}
        <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-6">
          <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            {/* Left Column */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 font-mono text-[10px] font-extrabold text-white">
                  SE
                </span>
                <span className="font-display text-sm font-extrabold tracking-tight text-slate-950">
                  SearchEmbed
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-xs font-medium text-slate-500">
                  Okapi BM25 Search Infrastructure
                </span>
              </div>
              <div className="inline-flex items-center gap-2 font-mono text-xs text-emerald-700">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>● All edge nodes operational</span>
              </div>
            </div>

            {/* Right Column */}
            <nav
              aria-label="Footer navigation"
              className="flex flex-row flex-wrap items-center gap-6 text-sm font-semibold text-slate-600"
            >
              <a href="/demo.html" className="inline-flex min-h-[44px] items-center transition-colors hover:text-indigo-600">
                Demo
              </a>
              <a href="/pricing.html" className="inline-flex min-h-[44px] items-center transition-colors hover:text-indigo-600">
                Pricing
              </a>
              <a href="/catalog" className="inline-flex min-h-[44px] items-center transition-colors hover:text-indigo-600">
                Catalog
              </a>
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center transition-colors hover:text-indigo-600"
              >
                GitHub
              </a>
              <a
                href="mailto:kumasantosh947@gmail.com"
                className="inline-flex min-h-[44px] items-center transition-colors hover:text-indigo-600"
              >
                Contact
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
