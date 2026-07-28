import type { Anime } from './types';

/**
 * DEMO CATALOG
 * ------------------------------------------------------------------
 * All titles below are ORIGINAL fictional works created for this
 * template — they are not real licensed series. Artwork uses free
 * Unsplash photography and the video sources are public/open-license
 * sample files (Blender Foundation open movies & Google sample media).
 *
 * Replace this file with your own catalog (or a CMS/database fetch)
 * before going live. Only ever embed video you have rights to.
 */

const OPEN_MP4 = {
  bunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  elephants:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  escapes:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  joyrides:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  blazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
} as const;

const img = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const ANIME: Anime[] = [
  {
    slug: 'crimson-lantern',
    title: 'Crimson Lantern',
    altTitle: 'Akai Tōrō',
    synopsis:
      'हर सौ साल में एक बार, एक लालटेन जलती है जो मरे हुओं को रास्ता दिखाती है। जब सत्रह वर्षीय Rei को उसका रखवाला चुना जाता है, उसे पता चलता है कि लौ बुझते ही उसका शहर परछाइयों के हवाले हो जाएगा. A lantern-keeper races the dying light to hold back the shadow tide.',
    year: 2025,
    status: 'Airing',
    rating: 9.4,
    views: 4_820_000,
    ageRating: 'U/A 16+',
    studio: 'Studio Hikari',
    languages: ['हिन्दी', 'English', '日本語'],
    genres: ['action', 'supernatural', 'fantasy'],
    poster: img('photo-1578632767115-351597cf2477', 700),
    banner: img('photo-1490077476659-095159692ab5', 1800),
    accentFrom: '#ff4d6d',
    accentTo: '#7c5cff',
    trending: true,
    featured: true,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'The Light That Refused',
        synopsis:
          'Rei एक टूटी हुई लालटेन के साथ मंदिर की सीढ़ियों पर मिलती है — और लौ उसे चुन लेती है।',
        durationLabel: '24 min',
        thumbnail: img('photo-1528360983277-13d401cdc186', 640),
        source: { kind: 'mp4', url: OPEN_MP4.bunny },
        releasedAt: '2025-04-06',
      },
      {
        number: 2,
        title: 'Ash Procession',
        synopsis: 'राख की एक चुपचाप चलती कतार शहर के पुल को पार करती है।',
        durationLabel: '24 min',
        thumbnail: img('photo-1503899036084-c55cdd92da26', 640),
        source: { kind: 'mp4', url: OPEN_MP4.escapes },
        releasedAt: '2025-04-13',
      },
      {
        number: 3,
        title: 'Names Written in Smoke',
        synopsis: 'हर नाम जो धुएँ में लिखा जाता है, वह एक वादा है जिसे तोड़ा नहीं जा सकता।',
        durationLabel: '25 min',
        thumbnail: img('photo-1519681393784-d120267933ba', 640),
        source: { kind: 'youtube', id: 'aqz-KE-bpKQ' },
        releasedAt: '2025-04-20',
      },
      {
        number: 4,
        title: 'The Keeper’s Debt',
        synopsis: 'लालटेन कुछ माँगती है — और Rei को कीमत चुकानी होगी।',
        durationLabel: '24 min',
        thumbnail: img('photo-1493246507139-91e8fad9978e', 640),
        source: { kind: 'mp4', url: OPEN_MP4.blazes },
        releasedAt: '2025-04-27',
      },
    ],
  },
  {
    slug: 'neon-shrine',
    title: 'Neon Shrine',
    altTitle: 'Neon Jinja',
    synopsis:
      '2088 का Tokyo — जहाँ पुराने देवता सर्वर रूम में रहते हैं। एक hacker-miko प्रार्थनाओं को कोड में बदलती है और गलती से एक ऐसा देवता जगा देती है जो delete होना नहीं चाहता।',
    year: 2025,
    status: 'Airing',
    rating: 9.1,
    views: 3_410_000,
    ageRating: 'U/A 16+',
    studio: 'Pixel Torii',
    languages: ['हिन्दी', 'English'],
    genres: ['sci-fi', 'supernatural', 'action'],
    poster: img('photo-1542051841857-5f90071e7989', 700),
    banner: img('photo-1536098561742-ca998e48cbcc', 1800),
    accentFrom: '#22d3ee',
    accentTo: '#7c5cff',
    trending: true,
    featured: true,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Cold Boot Prayer',
        synopsis: 'सर्वर रूम में पहली प्रार्थना compile होती है।',
        durationLabel: '23 min',
        thumbnail: img('photo-1493932484895-752d1471eab5', 640),
        source: { kind: 'mp4', url: OPEN_MP4.elephants },
        releasedAt: '2025-01-11',
      },
      {
        number: 2,
        title: 'Garbage Collection',
        synopsis: 'भूले हुए देवता memory से मिटाए जा रहे हैं।',
        durationLabel: '23 min',
        thumbnail: img('photo-1480796927426-f609979314bd', 640),
        source: { kind: 'vimeo', id: '76979871' },
        releasedAt: '2025-01-18',
      },
      {
        number: 3,
        title: 'Root Access',
        synopsis: 'मंदिर का असली मालिक कौन है — यह सवाल अब खतरनाक है।',
        durationLabel: '24 min',
        thumbnail: img('photo-1518709268805-4e9042af9f23', 640),
        source: { kind: 'mp4', url: OPEN_MP4.joyrides },
        releasedAt: '2025-01-25',
      },
    ],
  },
  {
    slug: 'blade-of-quiet-water',
    title: 'Blade of Quiet Water',
    altTitle: 'Shizuka na Mizu no Yaiba',
    synopsis:
      'एक तलवारबाज़ जिसने कभी वार नहीं किया, और एक नदी जो हर लड़ाई याद रखती है। शांति और हिंसा के बीच खींची गई एक धीमी, सुंदर कहानी।',
    year: 2024,
    status: 'Completed',
    rating: 9.6,
    views: 6_150_000,
    ageRating: 'U/A 13+',
    studio: 'Kawa Animation',
    languages: ['हिन्दी', 'English', '日本語'],
    genres: ['action', 'adventure', 'slice-of-life'],
    poster: img('photo-1531306728370-e2ebd9d7bb99', 700),
    banner: img('photo-1464822759023-fed622ff2c3b', 1800),
    accentFrom: '#38bdf8',
    accentTo: '#0ea5e9',
    trending: true,
    featured: true,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'The Unsheathed Vow',
        synopsis: 'तलवार म्यान में ही रहती है — यही उसका सबसे बड़ा वादा है।',
        durationLabel: '26 min',
        thumbnail: img('photo-1441974231531-c6227db76b6e', 640),
        source: { kind: 'mp4', url: OPEN_MP4.sintel },
        releasedAt: '2024-07-05',
      },
      {
        number: 2,
        title: 'Stones That Remember',
        synopsis: 'नदी के पत्थर हर नाम दोहराते हैं जो वहाँ मरा।',
        durationLabel: '25 min',
        thumbnail: img('photo-1470071459604-3b5ec3a7fe05', 640),
        source: { kind: 'mp4', url: OPEN_MP4.bunny },
        releasedAt: '2024-07-12',
      },
    ],
  },
  {
    slug: 'starlight-cafeteria',
    title: 'Starlight Cafeteria',
    altTitle: 'Hoshi no Shokudō',
    synopsis:
      'ब्रह्मांड के किनारे एक छोटा सा ढाबा, जहाँ हर ग्राहक एक कहानी और एक टूटा हुआ दिल लेकर आता है। गरम खाना, ठंडी रातें, और धीमी मरहम जैसी दोस्ती।',
    year: 2025,
    status: 'Airing',
    rating: 8.8,
    views: 1_930_000,
    ageRating: 'U',
    studio: 'Warm Bowl Studio',
    languages: ['हिन्दी', 'English'],
    genres: ['slice-of-life', 'comedy', 'sci-fi'],
    poster: img('photo-1512621776951-a57141f2eefd', 700),
    banner: img('photo-1414235077428-338989a2e8c0', 1800),
    accentFrom: '#fbbf24',
    accentTo: '#f97316',
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Table for One Comet',
        synopsis: 'पहला ग्राहक एक धूमकेतु है, और उसे जल्दी है।',
        durationLabel: '22 min',
        thumbnail: img('photo-1495521821757-a1efb6729352', 640),
        source: { kind: 'mp4', url: OPEN_MP4.escapes },
        releasedAt: '2025-05-02',
      },
      {
        number: 2,
        title: 'Soup for the Sleepless',
        synopsis: 'रात भर जागने वालों के लिए एक खास कटोरी।',
        durationLabel: '22 min',
        thumbnail: img('photo-1476718406336-bb5a9690ee2a', 640),
        source: { kind: 'youtube', id: 'aqz-KE-bpKQ' },
        releasedAt: '2025-05-09',
      },
    ],
  },
  {
    slug: 'iron-monsoon',
    title: 'Iron Monsoon',
    altTitle: 'Tetsu no Kisetsu',
    synopsis:
      'बारिश के मौसम में विशाल mecha जागते हैं। एक पायलट जो तूफ़ान से डरती है, उसे शहर की आखिरी ढाल बनना है।',
    year: 2024,
    status: 'Completed',
    rating: 9.0,
    views: 3_980_000,
    ageRating: 'U/A 16+',
    studio: 'Studio Hikari',
    languages: ['हिन्दी', 'English'],
    genres: ['mecha', 'action', 'sci-fi'],
    poster: img('photo-1518709268805-4e9042af9f23', 700),
    banner: img('photo-1451187580459-43490279c0fa', 1800),
    accentFrom: '#64748b',
    accentTo: '#0ea5e9',
    trending: true,
    featured: false,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'First Rain, First Alarm',
        synopsis: 'पहली बूँद गिरते ही सायरन बज उठता है।',
        durationLabel: '24 min',
        thumbnail: img('photo-1428592953211-077101b2021b', 640),
        source: { kind: 'mp4', url: OPEN_MP4.blazes },
        releasedAt: '2024-09-14',
      },
      {
        number: 2,
        title: 'Depth Charge',
        synopsis: 'समुद्र के नीचे कुछ बहुत बड़ा हिल रहा है।',
        durationLabel: '24 min',
        thumbnail: img('photo-1439405326854-014607f694d7', 640),
        source: { kind: 'mp4', url: OPEN_MP4.joyrides },
        releasedAt: '2024-09-21',
      },
    ],
  },
  {
    slug: 'paper-crane-detective',
    title: 'Paper Crane Detective',
    altTitle: 'Orizuru Tantei',
    synopsis:
      'एक जासूस जो सबूत नहीं, कागज़ की चिड़ियाँ पढ़ता है। हर मोड़ पर एक नई तह, और हर तह में एक झूठ।',
    year: 2025,
    status: 'Airing',
    rating: 8.9,
    views: 2_240_000,
    ageRating: 'U/A 13+',
    studio: 'Inkline Works',
    languages: ['हिन्दी', 'English'],
    genres: ['mystery', 'supernatural', 'slice-of-life'],
    poster: img('photo-1509023464722-18d996393ca8', 700),
    banner: img('photo-1507842217343-583bb7270b66', 1800),
    accentFrom: '#a78bfa',
    accentTo: '#ec4899',
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'One Thousand Folds',
        synopsis: 'हज़ारवीं चिड़िया एक नाम फुसफुसाती है।',
        durationLabel: '23 min',
        thumbnail: img('photo-1516414447565-b14be0adf13e', 640),
        source: { kind: 'vimeo', id: '76979871' },
        releasedAt: '2025-03-08',
      },
      {
        number: 2,
        title: 'The Crease Confession',
        synopsis: 'हर तह एक कबूलनामा छुपाए है।',
        durationLabel: '23 min',
        thumbnail: img('photo-1524995997946-a1c2e315a42f', 640),
        source: { kind: 'mp4', url: OPEN_MP4.elephants },
        releasedAt: '2025-03-15',
      },
    ],
  },
  {
    slug: 'summer-of-second-serve',
    title: 'Summer of Second Serve',
    altTitle: 'Nidome no Natsu',
    synopsis:
      'एक हारा हुआ टेनिस खिलाड़ी, एक टूटा हुआ कोर्ट, और एक गर्मी जो सब कुछ बदल देती है।',
    year: 2024,
    status: 'Completed',
    rating: 8.6,
    views: 1_410_000,
    ageRating: 'U',
    studio: 'Court Nine',
    languages: ['हिन्दी', 'English'],
    genres: ['sports', 'slice-of-life', 'romance'],
    poster: img('photo-1554068865-24cecd4e34b8', 700),
    banner: img('photo-1530549387789-4c1017266635', 1800),
    accentFrom: '#4ade80',
    accentTo: '#facc15',
    trending: false,
    featured: false,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'Fault',
        synopsis: 'पहली सर्विस, पहली गलती।',
        durationLabel: '22 min',
        thumbnail: img('photo-1622279457486-62dcc4a431d6', 640),
        source: { kind: 'mp4', url: OPEN_MP4.bunny },
        releasedAt: '2024-06-01',
      },
    ],
  },
  {
    slug: 'the-hollow-choir',
    title: 'The Hollow Choir',
    altTitle: 'Kūkyo no Gasshō',
    synopsis:
      'एक गाँव जहाँ हर रात एक गीत सुनाई देता है, और जो उसे गुनगुनाता है वह सुबह गायब हो जाता है।',
    year: 2025,
    status: 'Upcoming',
    rating: 8.4,
    views: 890_000,
    ageRating: 'A',
    studio: 'Nightfold',
    languages: ['हिन्दी', 'English'],
    genres: ['horror', 'mystery', 'supernatural'],
    poster: img('photo-1476370648495-3533f64427a2', 700),
    banner: img('photo-1509023464722-18d996393ca8', 1800),
    accentFrom: '#ef4444',
    accentTo: '#1e1b4b',
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'First Verse',
        synopsis: 'गीत की पहली पंक्ति हवा में तैरती है।',
        durationLabel: '25 min',
        thumbnail: img('photo-1533134486753-c833f0ed4866', 640),
        source: { kind: 'mp4', url: OPEN_MP4.sintel },
        releasedAt: '2025-10-03',
      },
    ],
  },
  {
    slug: 'dragonfruit-alchemy',
    title: 'Dragonfruit Alchemy',
    altTitle: 'Ryūka no Renkinjutsu',
    synopsis:
      'एक अनाड़ी alchemist लड़की और उसका बोलने वाला ड्रैगन-फल — जादू, हँसी और बहुत सारे धमाके।',
    year: 2025,
    status: 'Airing',
    rating: 8.7,
    views: 2_760_000,
    ageRating: 'U',
    studio: 'Warm Bowl Studio',
    languages: ['हिन्दी', 'English'],
    genres: ['fantasy', 'comedy', 'adventure'],
    poster: img('photo-1500673922987-e212871fec22', 700),
    banner: img('photo-1470071459604-3b5ec3a7fe05', 1800),
    accentFrom: '#f472b6',
    accentTo: '#22c55e',
    trending: true,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Boil, Bubble, Oops',
        synopsis: 'पहला प्रयोग, पहला विस्फोट।',
        durationLabel: '23 min',
        thumbnail: img('photo-1502134249126-9f3755a50d78', 640),
        source: { kind: 'youtube', id: 'aqz-KE-bpKQ' },
        releasedAt: '2025-02-14',
      },
      {
        number: 2,
        title: 'A Fruit Most Rude',
        synopsis: 'ड्रैगन-फल को अब बोलना सीख गया है — और वह चुप नहीं होता।',
        durationLabel: '23 min',
        thumbnail: img('photo-1490750967868-88aa4486c946', 640),
        source: { kind: 'mp4', url: OPEN_MP4.escapes },
        releasedAt: '2025-02-21',
      },
    ],
  },
  {
    slug: 'letters-to-a-falling-sky',
    title: 'Letters to a Falling Sky',
    altTitle: 'Ochiru Sora e no Tegami',
    synopsis:
      'दो अजनबी चिट्ठियों से जुड़े हैं, जबकि आसमान धीरे-धीरे नीचे गिर रहा है। समय कम है, पर शब्द बचे हैं।',
    year: 2024,
    status: 'Completed',
    rating: 9.2,
    views: 3_050_000,
    ageRating: 'U/A 13+',
    studio: 'Inkline Works',
    languages: ['हिन्दी', 'English', '日本語'],
    genres: ['romance', 'fantasy', 'slice-of-life'],
    poster: img('photo-1533450718592-29d45635f0a9', 700),
    banner: img('photo-1419242902214-272b3f66ee7a', 1800),
    accentFrom: '#818cf8',
    accentTo: '#f472b6',
    trending: true,
    featured: true,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'Postmarked Nowhere',
        synopsis: 'पहली चिट्ठी बिना पते के पहुँचती है।',
        durationLabel: '24 min',
        thumbnail: img('photo-1507499036636-f716246c2c23', 640),
        source: { kind: 'mp4', url: OPEN_MP4.elephants },
        releasedAt: '2024-11-08',
      },
      {
        number: 2,
        title: 'Reply in Blue Ink',
        synopsis: 'जवाब नीली स्याही में आता है।',
        durationLabel: '24 min',
        thumbnail: img('photo-1455390582262-044cdead277a', 640),
        source: { kind: 'vimeo', id: '76979871' },
        releasedAt: '2024-11-15',
      },
    ],
  },
  {
    slug: 'thunderfoot-league',
    title: 'Thunderfoot League',
    altTitle: 'Kaminari Ashi',
    synopsis:
      'गली के फुटबॉल से लेकर राष्ट्रीय स्तर तक — एक टीम जिसके पास जूते कम और जुनून ज़्यादा है।',
    year: 2025,
    status: 'Airing',
    rating: 8.5,
    views: 1_680_000,
    ageRating: 'U',
    studio: 'Court Nine',
    languages: ['हिन्दी', 'English'],
    genres: ['sports', 'comedy', 'adventure'],
    poster: img('photo-1517649763962-0c623066013b', 700),
    banner: img('photo-1431324155629-1a6deb1dec8d', 1800),
    accentFrom: '#22c55e',
    accentTo: '#0ea5e9',
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Barefoot Kickoff',
        synopsis: 'बिना जूतों के पहला मैच।',
        durationLabel: '23 min',
        thumbnail: img('photo-1543326727-cf6c39e8f84c', 640),
        source: { kind: 'mp4', url: OPEN_MP4.joyrides },
        releasedAt: '2025-06-07',
      },
    ],
  },
  {
    slug: 'wolfsong-frontier',
    title: 'Wolfsong Frontier',
    altTitle: 'Ōkami no Uta',
    synopsis:
      'बर्फ़ से ढके पहाड़ों में एक लड़का और एक भेड़िया एक खोई हुई सभ्यता का नक्शा ढूँढते हैं।',
    year: 2024,
    status: 'Completed',
    rating: 9.3,
    views: 4_120_000,
    ageRating: 'U/A 13+',
    studio: 'Kawa Animation',
    languages: ['हिन्दी', 'English'],
    genres: ['adventure', 'fantasy', 'action'],
    poster: img('photo-1518709766631-a6a7f45921c3', 700),
    banner: img('photo-1483728642387-6c3bdd6c93e5', 1800),
    accentFrom: '#94a3b8',
    accentTo: '#6366f1',
    trending: true,
    featured: true,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'Tracks in New Snow',
        synopsis: 'ताज़ी बर्फ़ पर पहले निशान।',
        durationLabel: '25 min',
        thumbnail: img('photo-1418985991508-e47386d96a71', 640),
        source: { kind: 'mp4', url: OPEN_MP4.sintel },
        releasedAt: '2024-12-06',
      },
      {
        number: 2,
        title: 'The Howl Map',
        synopsis: 'भेड़िये की आवाज़ ही नक्शा है।',
        durationLabel: '25 min',
        thumbnail: img('photo-1454391304352-2bf4678b1a7a', 640),
        source: { kind: 'mp4', url: OPEN_MP4.blazes },
        releasedAt: '2024-12-13',
      },
    ],
  },
];

/* ------------------------------ selectors ------------------------------ */

export const getAll = (): Anime[] => ANIME;

export const getBySlug = (slug: string): Anime | undefined =>
  ANIME.find((a) => a.slug === slug);

export const getFeatured = (): Anime[] => ANIME.filter((a) => a.featured);

export const getTrending = (): Anime[] =>
  [...ANIME].filter((a) => a.trending).sort((a, b) => b.views - a.views);

export const getNewReleases = (): Anime[] =>
  [...ANIME]
    .filter((a) => a.newRelease)
    .sort((a, b) => b.year - a.year || b.rating - a.rating);

export const getTopRated = (): Anime[] =>
  [...ANIME].sort((a, b) => b.rating - a.rating).slice(0, 10);

export const getByGenre = (genreSlug: string): Anime[] =>
  ANIME.filter((a) => a.genres.includes(genreSlug));

export const getRelated = (slug: string, limit = 6): Anime[] => {
  const current = getBySlug(slug);
  if (!current) return [];
  return ANIME.filter((a) => a.slug !== slug)
    .map((a) => ({
      anime: a,
      score: a.genres.filter((g) => current.genres.includes(g)).length,
    }))
    .sort((x, y) => y.score - x.score || y.anime.rating - x.anime.rating)
    .slice(0, limit)
    .map((x) => x.anime);
};

export function searchAnime(query: string, genre?: string): Anime[] {
  const q = query.trim().toLowerCase();
  return ANIME.filter((a) => {
    const matchesGenre = !genre || genre === 'all' || a.genres.includes(genre);
    if (!matchesGenre) return false;
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      (a.altTitle?.toLowerCase().includes(q) ?? false) ||
      a.studio.toLowerCase().includes(q) ||
      a.synopsis.toLowerCase().includes(q) ||
      a.genres.some((g) => g.includes(q))
    );
  });
}
