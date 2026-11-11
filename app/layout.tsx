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
        <header
          className="sticky top-0 z-50"
          style={{
            height: 64,
            background: "#ffffff",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 16px",
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                color: "#111111",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              <span
                style={{
                  background: "#0a2540",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 11,
                  lineHeight: 1,
                  padding: "5px 6px",
                  borderRadius: 6,
                }}
              >
                SE
              </span>
              SearchEmbed
            </a>
            <a
              href="#pricing"
              className="nav-cta"
              style={{
                background: "#0a2540",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 28,
                padding: "10px 18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 40,
                minHeight: 40,
              }}
            >
              <span className="nav-cta-label">Get API Key</span>
              <span className="nav-cta-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="15" r="4" />
                  <path d="M10.85 12.15 19 4" />
                  <path d="M18 5l2 2" />
                  <path d="M15 8l2 2" />
                </svg>
              </span>
            </a>
          </div>
        </header>

        <div id="main" className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            padding: "40px 16px",
            background: "#ffffff",
          }}
        >
          <nav
            aria-label="Footer"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: "rgba(0, 0, 0, 0.45)",
            }}
          >
            <a href="mailto:kumasantosh947@gmail.com" style={{ color: "inherit", textDecoration: "none" }}>
              Contact
            </a>
            <a href="mailto:kumasantosh947@gmail.com" style={{ color: "inherit", textDecoration: "none" }}>
              Email
            </a>
            <a
              href="https://github.com/santoshkumarvvv/search-hub-"
              target="_blank"
              rel="noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              GitHub
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
