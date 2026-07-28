import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[80vh] place-items-center py-28 text-center">
      <div>
        <p className="bg-gradient-to-r from-accent to-neon bg-clip-text text-7xl font-black text-transparent sm:text-9xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">यह पेज नहीं मिला</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          हो सकता है यह सीरीज़ हटा दी गई हो या लिंक गलत हो। नीचे से वापस चलें।
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary px-5 py-3">
            <Home size={17} /> होम पर जाएँ
          </Link>
          <Link href="/browse" className="btn-ghost px-5 py-3">
            <Compass size={17} /> कैटलॉग ब्राउज़ करें
          </Link>
        </div>
      </div>
    </div>
  );
}
