import { Clock3, Flame, Mic, Sparkles, TrendingUp } from 'lucide-react';
import Hero from '@/components/Hero';
import Row from '@/components/Row';
import GenreChips from '@/components/GenreChips';
import ContinueWatching from '@/components/ContinueWatching';
import {
  getAll,
  getDubInProgress,
  getFeatured,
  getFreshDubs,
  getHindiDubbed,
  getTopRated,
  getTrending,
} from '@/lib/data';

export default function HomePage() {
  return (
    <>
      <Hero items={getFeatured()} />

      <div className="container-page relative z-10 -mt-10 space-y-14 pb-10 sm:space-y-16">
        <ContinueWatching />

        <Row
          title="हिंदी डब में उपलब्ध"
          icon={<Mic size={19} className="text-emerald-400" />}
          items={getHindiDubbed()}
          href="/browse?dub=dubbed"
          priority
        />

        <Row
          title="ताज़ा हिंदी डब"
          icon={<Sparkles size={19} className="text-neon" />}
          items={getFreshDubs()}
          href="/browse?dub=dubbed"
        />

        <Row
          title="ट्रेंडिंग अभी"
          icon={<Flame size={20} className="text-accent" />}
          items={getTrending()}
          href="/browse?sort=trending"
        />

        <GenreChips />

        <Row
          title="डब जारी है"
          icon={<Clock3 size={19} className="text-amber-400" />}
          items={getDubInProgress()}
          href="/browse?dub=in-progress"
        />

        <Row
          title="सर्वश्रेष्ठ रेटेड"
          icon={<TrendingUp size={19} className="text-amber-400" />}
          items={getTopRated()}
          href="/browse?sort=rating"
        />

        <Row title="आपके लिए चुने गए" items={[...getAll()].reverse()} href="/browse" />
      </div>
    </>
  );
}
