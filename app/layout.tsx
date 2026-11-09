import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SearchEmbed — Search that ships in seconds",
    template: "%s · SearchEmbed",
  },
  description:
    "Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond",
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
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const LANG_INIT_SCRIPT = `(function(){function a(l){document.documentElement.lang=l;var t=document.getElementById('langText');if(t)t.textContent=l==='hi'?'हिंदी':'English';var n=document.querySelectorAll('[data-en][data-hi]');for(var i=0;i<n.length;i++){var e=n[i];if(e.getAttribute('data-rich')==='true')continue;var v=e.getAttribute('data-'+l);if(v)e.textContent=v;}var p=document.querySelectorAll('[data-placeholder-en][data-placeholder-hi]');for(var j=0;j<p.length;j++){var inp=p[j];var ph=inp.getAttribute('data-placeholder-'+l);if(ph)inp.setAttribute('placeholder',ph);}window.dispatchEvent(new CustomEvent('se-lang-change',{detail:l}));}window.__seToggleLang=function(){var c=document.documentElement.lang==='hi'?'hi':'en';a(c==='en'?'hi':'en');};document.addEventListener('click',function(ev){var target=ev.target;if(target&&target.closest&&target.closest('#langBtn')){window.__seToggleLang();}});})();`;

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
          <div className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center font-display text-lg font-extrabold tracking-tight text-ink transition hover:text-purple"
              data-en="SearchEmbed"
              data-hi="सर्चएम्बेड"
            >
              SearchEmbed
            </Link>
            <button
              type="button"
              id="langBtn"
              aria-label="Toggle Hindi and English language"
              className="inline-flex min-h-[34px] items-center gap-1 rounded-full border border-[#e4dcff] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#7c5cff] transition hover:border-[#7c5cff] hover:bg-[#f7f5ff] cursor-pointer"
            >
              🌐 <span id="langText">English</span>
            </button>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer
          className="border-t border-[#7c5cff] bg-white/90 px-4 py-10 sm:px-6"
          style={{ borderTop: "1px solid #7c5cff" }}
        >
          <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5 text-xs text-muted">
              <span className="font-display text-sm font-bold text-ink">SearchEmbed</span>
              <span aria-hidden="true">·</span>
              <span
                data-en="Okapi BM25 Search Infrastructure"
                data-hi="ओकापी BM25 सर्च इंफ्रास्ट्रक्चर"
              >
                Okapi BM25 Search Infrastructure
              </span>
            </div>
            <nav
              aria-label="Footer navigation"
              className="flex w-full sm:w-auto flex-row flex-nowrap items-center justify-evenly sm:justify-between gap-6 sm:gap-8 text-sm font-semibold text-ink"
            >
              <a
                href="/#sandbox"
                className="inline-flex min-h-[44px] items-center transition hover:text-purple"
                data-en="Demo"
                data-hi="डेमो"
              >
                Demo
              </a>
              <a
                href="/pricing"
                className="inline-flex min-h-[44px] items-center transition hover:text-purple"
                data-en="Pricing"
                data-hi="मूल्य"
              >
                Pricing
              </a>
              <a
                href="https://github.com/santoshkumarvvv/search-hub-"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center transition hover:text-purple"
                data-en="GitHub"
                data-hi="गिटहब"
              >
                GitHub
              </a>
              <a
                href="mailto:kumasantosh947@gmail.com"
                className="inline-flex min-h-[44px] items-center transition hover:text-purple"
                data-en="Contact"
                data-hi="संपर्क"
              >
                Contact
              </a>
            </nav>
          </div>
        </footer>

        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
      </body>
    </html>
  );
}
