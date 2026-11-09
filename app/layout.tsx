import type { Metadata, Viewport } from "next";
import Link from "next/link";
import MusicButton from "@/components/MusicButton";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SearchEmbed — Search that ships in seconds",
    template: "%s · SearchEmbed",
  },
  description:
    "Instant Okapi BM25 search with typo tolerance, federated signals, and scrypt-authenticated API keys. Starts at ₹19/month via UPI.",
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
      "Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond.",
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
      "Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond.",
    images: ["https://search-hub-live.vercel.app/og-image.png"],
  },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-ink antialiased selection:bg-purple/15 selection:text-ink min-h-screen overflow-x-hidden flex flex-col">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-[#ece7ff] bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-center gap-2 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center font-display text-lg font-extrabold tracking-tight text-ink transition hover:text-purple"
            >
              SearchEmbed
            </Link>
            <MusicButton />
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-[#ece7ff] bg-white/90 px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-[1120px] flex-col flex-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5 text-xs text-muted">
              <span className="font-display text-sm font-bold text-ink">SearchEmbed</span>
              <span aria-hidden="true">·</span>
              <span>Okapi BM25 Search Infrastructure</span>
            </div>
            <nav
              aria-label="Footer navigation"
              className="flex flex-row flex-wrap items-center gap-5 sm:gap-6 text-sm font-semibold text-ink"
            >
              <a href="/demo.html" className="inline-flex min-h-[44px] items-center transition hover:text-purple">
                Demo
              </a>
              <a href="/pricing.html" className="inline-flex min-h-[44px] items-center transition hover:text-purple">
                Pricing
              </a>
              <a href="/catalog" className="inline-flex min-h-[44px] items-center transition hover:text-purple">
                Catalog
              </a>
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center transition hover:text-purple"
              >
                GitHub
              </a>
              <a
                href="mailto:kumasantosh947@gmail.com"
                className="inline-flex min-h-[44px] items-center transition hover:text-purple"
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
