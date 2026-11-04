import type { Metadata, Viewport } from "next";
import Link from "next/link";
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
    title: "SearchEmbed — Search that ships in seconds",
    description:
      "Sub-millisecond Okapi BM25 search with typo tolerance, federated ranking, and tiered API keys. ₹19–₹199/month.",
    siteName: "SearchEmbed",
  },
  twitter: { card: "summary_large_image" },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#05060a",
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
      <body className="bg-ink font-sans text-white/90 antialiased selection:bg-white/15 selection:text-white">
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="font-display text-lg font-extrabold tracking-tight text-white/90 transition hover:text-white"
            >
              SearchEmbed
            </Link>

            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-6 text-xs sm:text-sm font-medium text-white/50"
            >
              <a href="/demo.html" className="transition hover:text-white/90">
                Demo
              </a>
              <a href="/pricing.html" className="transition hover:text-white/90">
                Pricing
              </a>
              <Link href="/catalog" className="transition hover:text-white/90">
                Catalog
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-white/5 bg-ink px-4 py-12 sm:px-6">
          <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="font-display text-sm font-bold text-white/90">SearchEmbed</span>
              <span aria-hidden="true">·</span>
              <span>Okapi BM25 Search Infrastructure</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-white/50">
              <a href="/demo.html" className="transition hover:text-white/90">
                Demo
              </a>
              <a href="/pricing.html" className="transition hover:text-white/90">
                Pricing
              </a>
              <Link href="/catalog" className="transition hover:text-white/90">
                Catalog
              </Link>
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white/90"
              >
                GitHub
              </a>
              <a
                href="mailto:kumasantosh947@gmail.com"
                className="transition hover:text-white/90"
              >
                kumasantosh947@gmail.com
              </a>
            </div>
          </div>
        </footer>

        <script
          dangerouslySetInnerHTML={{
            __html:
              "if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function() {}); }); }",
          }}
        />
      </body>
    </html>
  );
}
