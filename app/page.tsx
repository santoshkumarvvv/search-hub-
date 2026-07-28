import { Clock3, Flame, Sparkles, TrendingUp } from 'lucide-react';
import Hero from '@/components/Hero';
import Row from '@/components/Row';
import GenreChips from '@/components/GenreChips';
import ContinueWatching from '@/components/ContinueWatching';
import { getAll, getFeatured, getNewReleases, getTopRated, getTrending } from '@/lib/data';

export default function HomePage() {
  const featured = getFeatured();
  const trending = getTrending();
  const newReleases = getNewReleases();
  const topRated = getTopRated();
  const all = getAll();

  return (
    <>
      <Hero items={featured} />

      <div className="container-page relative z-10 -mt-10 space-y-14 pb-10 sm:space-y-16">
        <ContinueWatching />

        <Row
          title="ट्रेंडिंग अभी"
          icon={<Flame size={20} className="text-accent" />}
          items={trending}
          href="/browse?sort=trending"
          priority
        />

        <Row
          title="नई रिलीज़"
          icon={<Clock3 size={19} className="text-cyan" />}
          items={newReleases}
          href="/browse?sort=new"
        />

        <GenreChips />

        <Row
          title="सर्वश्रेष्ठ रेटेड"
          icon={<TrendingUp size={19} className="text-amber-400" />}
          items={topRated}
          href="/browse?sort=rating"
        />

        <Row
          title="आपके लिए चुने गए"
          icon={<Sparkles size={19} className="text-neon" />}
          items={[...all].reverse()}
          href="/browse"
        />
      </div>
    </>
  );
}
