import Link from 'next/link';
import { Mic } from 'lucide-react';
import { GENRES } from '@/lib/genres';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-neon">
              <Mic size={15} className="text-white" />
            </span>
            <span className="text-base font-black tracking-tight">
              एनिमे<span className="text-accent">हिंदी</span>डब
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            एनिमे सीरीज़ हिंदी डब में, HD क्वालिटी और तेज़ प्लेयर के साथ। डेमो कैटलॉग में सभी
            शीर्षक काल्पनिक हैं।
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">नेविगेशन</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {[
              { href: '/', label: 'होम' },
              { href: '/browse?dub=dubbed', label: 'हिंदी डब सीरीज़' },
              { href: '/browse', label: 'सभी सीरीज़' },
              { href: '/genres', label: 'श्रेणियाँ' },
              { href: '/watchlist', label: 'मेरी लिस्ट' },
              { href: '/search', label: 'खोजें' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">लोकप्रिय श्रेणियाँ</h3>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 text-sm text-muted">
            {GENRES.slice(0, 8).map((g) => (
              <li key={g.slug}>
                <Link href={`/genres/${g.slug}`} className="transition-colors hover:text-accent">
                  {g.nameHindi}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">कानूनी</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>नियम व शर्तें</li>
            <li>गोपनीयता नीति</li>
            <li>DMCA / कॉपीराइट</li>
            <li>संपर्क करें</li>
          </ul>
          <p className="mt-5 rounded-lg border border-line bg-panel/60 p-3 text-[11px] leading-relaxed text-muted">
            यह एक डेमो टेम्पलेट है। केवल वही वीडियो अपलोड या एम्बेड करें जिनके अधिकार आपके पास हों।
          </p>
        </div>
      </div>

      <div className="border-t border-line py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} एनिमेहिंदीडब · Next.js 15 + Tailwind CSS
      </div>
    </footer>
  );
}
