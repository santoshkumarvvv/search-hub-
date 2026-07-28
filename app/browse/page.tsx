import type { Metadata } from 'next';
import { getAll } from '@/lib/data';
import BrowseGrid from '@/components/BrowseGrid';

export const metadata: Metadata = {
  title: 'ब्राउज़ करें',
  description: 'पूरा anime कैटलॉग — श्रेणी, रेटिंग और रिलीज़ के अनुसार फ़िल्टर करें।',
};

type Sort = 'trending' | 'new' | 'rating' | 'az';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const allowed: Sort[] = ['trending', 'new', 'rating', 'az'];
  const initialSort = allowed.includes(sort as Sort) ? (sort as Sort) : 'trending';

  return (
    <div className="container-page pb-10 pt-28">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">सभी सीरीज़</h1>
      <p className="mt-2 text-sm text-muted">
        पूरा कैटलॉग ब्राउज़ करें और अपनी अगली पसंदीदा सीरीज़ खोजें।
      </p>

      <BrowseGrid items={getAll()} initialSort={initialSort} />
    </div>
  );
}
