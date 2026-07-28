'use client';

import { useEffect } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page grid min-h-[80vh] place-items-center py-28 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-line bg-elevated text-accent">
          <TriangleAlert size={28} />
        </span>
        <h1 className="mt-6 text-2xl font-bold">कुछ गड़बड़ हो गई</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          पेज लोड करते समय एक त्रुटि आई। कृपया दोबारा कोशिश करें।
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-muted">error: {error.digest}</p>
        )}
        <button type="button" onClick={reset} className="btn-primary mt-8 px-5 py-3">
          <RefreshCw size={17} /> फिर से कोशिश करें
        </button>
      </div>
    </div>
  );
}
