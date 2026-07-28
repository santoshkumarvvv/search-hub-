import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClient from '@/components/SearchClient';

export const metadata: Metadata = {
  title: 'खोजें',
  description: 'नाम, स्टूडियो या शैली से anime खोजें।',
};

export default function SearchPage() {
  return (
    <div className="container-page min-h-[80vh] pb-10 pt-28">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">खोजें</h1>
      <p className="mt-2 text-sm text-muted">नाम, स्टूडियो या शैली से अपनी सीरीज़ ढूँढें।</p>

      <Suspense
        fallback={
          <div className="mt-7 space-y-4">
            <div className="skeleton h-14 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />
              ))}
            </div>
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  );
}
