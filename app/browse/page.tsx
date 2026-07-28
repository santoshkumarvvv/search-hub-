import type { Metadata } from 'next';
import { getAll } from '@/lib/data';
import type { DubStatus } from '@/lib/types';
import BrowseGrid from '@/components/BrowseGrid';

export const metadata: Metadata = {
  title: 'सभी एनिमे हिंदी डब — ब्राउज़ करें',
  description:
    'पूरा एनिमे हिंदी डब कैटलॉग। श्रेणी, डब स्टेटस, रेटिंग और रिलीज़ के अनुसार फ़िल्टर करें।',
};

type Sort = 'trending' | 'new' | 'rating' | 'az';
type DubFilter = 'all' | DubStatus;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dub?: string }>;
}) {
  const { sort, dub } = await searchParams;

  const sorts: Sort[] = ['trending', 'new', 'rating', 'az'];
  const dubs: DubFilter[] = ['all', 'dubbed', 'in-progress', 'announced', 'subbed-only'];

  const initialSort = sorts.includes(sort as Sort) ? (sort as Sort) : 'trending';
  const initialDub = dubs.includes(dub as DubFilter) ? (dub as DubFilter) : 'all';

  return (
    <div className="container-page pb-10 pt-28">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">सभी सीरीज़</h1>
      <p className="mt-2 text-sm text-muted">
        पूरा हिंदी डब कैटलॉग ब्राउज़ करें और अपनी अगली पसंदीदा सीरीज़ खोजें।
      </p>

      <BrowseGrid items={getAll()} initialSort={initialSort} initialDub={initialDub} />
    </div>
  );
}
