import type { Anime } from './types';

/**
 * DEMO CATALOG — Hindi Dub
 * ------------------------------------------------------------------
 * All titles below are ORIGINAL fictional works written for this
 * template. They are NOT real licensed anime. Artwork uses free
 * Unsplash photography and video sources are public open-license
 * sample files (Blender Foundation open movies / Google sample media).
 *
 * ⚠️ Replace this file with your own licensed catalog before launch.
 * Only ever embed or host video you hold distribution rights for —
 * uploading unlicensed Hindi dubs is copyright infringement and will
 * get the site taken down by the rights holders.
 *
 * Schema notes for a Hindi-dub site:
 *  - `dubStatus`  drives the badge shown on cards and detail pages
 *  - `audio[]`    lists playable tracks; put the Hindi track FIRST so
 *                 it is selected by default in the player
 *  - `titleHindi` is rendered as the primary heading where present
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
    titleHindi: 'लाल लालटेन',
    altTitle: 'Akai Tōrō',
    synopsis:
      'हर सौ साल में एक बार एक लालटेन जलती है जो मरे हुओं को रास्ता दिखाती है। जब सत्रह साल की रे को उसका रखवाला चुना जाता है, तो उसे पता चलता है कि लौ बुझते ही उसका पूरा शहर परछाइयों के हवाले हो जाएगा।',
    year: 2025,
    status: 'Airing',
    rating: 9.4,
    views: 4_820_000,
    ageRating: 'U/A 16+',
    studio: 'Studio Hikari',
    dubStudio: 'साउंड सेतु स्टूडियो',
    dubStatus: 'in-progress',
    languages: ['hindi', 'english', 'japanese'],
    genres: ['action', 'supernatural', 'fantasy'],
    poster: img('photo-1578632767115-351597cf2477', 700),
    banner: img('photo-1490077476659-095159692ab5', 1800),
    trending: true,
    featured: true,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'The Light That Refused',
        titleHindi: 'वो लौ जो बुझी नहीं',
        synopsis: 'रे को मंदिर की सीढ़ियों पर एक टूटी लालटेन मिलती है और लौ उसे चुन लेती है।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1528360983277-13d401cdc186', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.bunny } },
          { lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.escapes } },
          { lang: 'japanese', source: { kind: 'youtube', id: 'aqz-KE-bpKQ' } },
        ],
        releasedAt: '2025-04-06',
        dubbedAt: '2025-04-20',
      },
      {
        number: 2,
        title: 'Ash Procession',
        titleHindi: 'राख का जुलूस',
        synopsis: 'राख की एक चुपचाप चलती कतार शहर के पुराने पुल को पार करती है।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1503899036084-c55cdd92da26', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.escapes } },
          { lang: 'japanese', source: { kind: 'vimeo', id: '76979871' } },
        ],
        releasedAt: '2025-04-13',
        dubbedAt: '2025-04-27',
      },
      {
        number: 3,
        title: 'Names Written in Smoke',
        titleHindi: 'धुएँ में लिखे नाम',
        synopsis: 'हर नाम जो धुएँ में लिखा जाता है, वो एक वादा है जिसे तोड़ा नहीं जा सकता।',
        durationLabel: '25 मिनट',
        thumbnail: img('photo-1519681393784-d120267933ba', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'youtube', id: 'aqz-KE-bpKQ' } },
          { lang: 'japanese', source: { kind: 'mp4', url: OPEN_MP4.blazes } },
        ],
        releasedAt: '2025-04-20',
        dubbedAt: '2025-05-04',
      },
      {
        number: 4,
        title: 'The Keeper’s Debt',
        titleHindi: 'रखवाले का कर्ज़',
        synopsis: 'लालटेन कुछ माँगती है और रे को उसकी कीमत चुकानी होगी।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1493246507139-91e8fad9978e', 640),
        audio: [{ lang: 'japanese', source: { kind: 'mp4', url: OPEN_MP4.blazes } }],
        releasedAt: '2025-04-27',
      },
    ],
  },
  {
    slug: 'neon-shrine',
    title: 'Neon Shrine',
    titleHindi: 'नियॉन मंदिर',
    altTitle: 'Neon Jinja',
    synopsis:
      '2088 का टोक्यो, जहाँ पुराने देवता सर्वर रूम में रहते हैं। एक हैकर-मिको प्रार्थनाओं को कोड में बदलती है और गलती से एक ऐसा देवता जगा देती है जो डिलीट होना नहीं चाहता।',
    year: 2025,
    status: 'Airing',
    rating: 9.1,
    views: 3_410_000,
    ageRating: 'U/A 16+',
    studio: 'Pixel Torii',
    dubStudio: 'वॉइसक्राफ्ट इंडिया',
    dubStatus: 'dubbed',
    languages: ['hindi', 'english'],
    genres: ['sci-fi', 'supernatural', 'action'],
    poster: img('photo-1542051841857-5f90071e7989', 700),
    banner: img('photo-1536098561742-ca998e48cbcc', 1800),
    trending: true,
    featured: true,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Cold Boot Prayer',
        titleHindi: 'पहली प्रार्थना',
        synopsis: 'सर्वर रूम में पहली प्रार्थना कंपाइल होती है।',
        durationLabel: '23 मिनट',
        thumbnail: img('photo-1493932484895-752d1471eab5', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.elephants } },
          { lang: 'english', source: { kind: 'vimeo', id: '76979871' } },
        ],
        releasedAt: '2025-01-11',
        dubbedAt: '2025-01-18',
      },
      {
        number: 2,
        title: 'Garbage Collection',
        titleHindi: 'भूले हुए देवता',
        synopsis: 'भूले हुए देवता मेमोरी से मिटाए जा रहे हैं।',
        durationLabel: '23 मिनट',
        thumbnail: img('photo-1480796927426-f609979314bd', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'vimeo', id: '76979871' } },
          { lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.joyrides } },
        ],
        releasedAt: '2025-01-18',
        dubbedAt: '2025-01-25',
      },
      {
        number: 3,
        title: 'Root Access',
        titleHindi: 'रूट एक्सेस',
        synopsis: 'मंदिर का असली मालिक कौन है, ये सवाल अब खतरनाक हो चुका है।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1518709268805-4e9042af9f23', 640),
        audio: [{ lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.joyrides } }],
        releasedAt: '2025-01-25',
        dubbedAt: '2025-02-01',
      },
    ],
  },
  {
    slug: 'blade-of-quiet-water',
    title: 'Blade of Quiet Water',
    titleHindi: 'शांत जल की तलवार',
    altTitle: 'Shizuka na Mizu no Yaiba',
    synopsis:
      'एक तलवारबाज़ जिसने कभी वार नहीं किया और एक नदी जो हर लड़ाई याद रखती है। शांति और हिंसा के बीच खिंची हुई एक धीमी, खूबसूरत कहानी।',
    year: 2024,
    status: 'Completed',
    rating: 9.6,
    views: 6_150_000,
    ageRating: 'U/A 13+',
    studio: 'Kawa Animation',
    dubStudio: 'साउंड सेतु स्टूडियो',
    dubStatus: 'dubbed',
    languages: ['hindi', 'english', 'japanese'],
    genres: ['action', 'adventure', 'slice-of-life'],
    poster: img('photo-1531306728370-e2ebd9d7bb99', 700),
    banner: img('photo-1464822759023-fed622ff2c3b', 1800),
    trending: true,
    featured: true,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'The Unsheathed Vow',
        titleHindi: 'म्यान में बंद वादा',
        synopsis: 'तलवार म्यान में ही रहती है, यही उसका सबसे बड़ा वादा है।',
        durationLabel: '26 मिनट',
        thumbnail: img('photo-1441974231531-c6227db76b6e', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.sintel } },
          { lang: 'japanese', source: { kind: 'mp4', url: OPEN_MP4.bunny } },
        ],
        releasedAt: '2024-07-05',
        dubbedAt: '2024-08-01',
      },
      {
        number: 2,
        title: 'Stones That Remember',
        titleHindi: 'पत्थर जो याद रखते हैं',
        synopsis: 'नदी के पत्थर हर उस नाम को दोहराते हैं जो वहाँ खोया।',
        durationLabel: '25 मिनट',
        thumbnail: img('photo-1470071459604-3b5ec3a7fe05', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.bunny } },
          { lang: 'japanese', source: { kind: 'mp4', url: OPEN_MP4.sintel } },
        ],
        releasedAt: '2024-07-12',
        dubbedAt: '2024-08-08',
      },
    ],
  },
  {
    slug: 'starlight-cafeteria',
    title: 'Starlight Cafeteria',
    titleHindi: 'सितारों का ढाबा',
    altTitle: 'Hoshi no Shokudō',
    synopsis:
      'ब्रह्मांड के किनारे एक छोटा सा ढाबा, जहाँ हर ग्राहक एक कहानी और एक टूटा दिल लेकर आता है। गरम खाना, ठंडी रातें और धीरे-धीरे बनती दोस्ती।',
    year: 2025,
    status: 'Airing',
    rating: 8.8,
    views: 1_930_000,
    ageRating: 'U',
    studio: 'Warm Bowl Studio',
    dubStudio: 'वॉइसक्राफ्ट इंडिया',
    dubStatus: 'dubbed',
    languages: ['hindi', 'english'],
    genres: ['slice-of-life', 'comedy', 'sci-fi'],
    poster: img('photo-1512621776951-a57141f2eefd', 700),
    banner: img('photo-1414235077428-338989a2e8c0', 1800),
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Table for One Comet',
        titleHindi: 'एक धूमकेतु की मेज़',
        synopsis: 'पहला ग्राहक एक धूमकेतु है और उसे बहुत जल्दी है।',
        durationLabel: '22 मिनट',
        thumbnail: img('photo-1495521821757-a1efb6729352', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.escapes } },
          { lang: 'english', source: { kind: 'youtube', id: 'aqz-KE-bpKQ' } },
        ],
        releasedAt: '2025-05-02',
        dubbedAt: '2025-05-09',
      },
      {
        number: 2,
        title: 'Soup for the Sleepless',
        titleHindi: 'जागने वालों का सूप',
        synopsis: 'रात भर जागने वालों के लिए एक खास कटोरी।',
        durationLabel: '22 मिनट',
        thumbnail: img('photo-1476718406336-bb5a9690ee2a', 640),
        audio: [{ lang: 'hindi', source: { kind: 'youtube', id: 'aqz-KE-bpKQ' } }],
        releasedAt: '2025-05-09',
        dubbedAt: '2025-05-16',
      },
    ],
  },
  {
    slug: 'iron-monsoon',
    title: 'Iron Monsoon',
    titleHindi: 'लोहे का मानसून',
    altTitle: 'Tetsu no Kisetsu',
    synopsis:
      'बारिश के मौसम में विशाल मेका जाग उठते हैं। एक पायलट जो तूफ़ान से डरती है, उसे ही शहर की आखिरी ढाल बनना है।',
    year: 2024,
    status: 'Completed',
    rating: 9.0,
    views: 3_980_000,
    ageRating: 'U/A 16+',
    studio: 'Studio Hikari',
    dubStudio: 'ध्वनि डब वर्क्स',
    dubStatus: 'dubbed',
    languages: ['hindi', 'english'],
    genres: ['mecha', 'action', 'sci-fi'],
    poster: img('photo-1518709268805-4e9042af9f23', 700),
    banner: img('photo-1451187580459-43490279c0fa', 1800),
    trending: true,
    featured: false,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'First Rain, First Alarm',
        titleHindi: 'पहली बूँद, पहला सायरन',
        synopsis: 'पहली बूँद गिरते ही पूरे शहर का सायरन बज उठता है।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1428592953211-077101b2021b', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.blazes } },
          { lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.joyrides } },
        ],
        releasedAt: '2024-09-14',
        dubbedAt: '2024-10-01',
      },
      {
        number: 2,
        title: 'Depth Charge',
        titleHindi: 'गहराई का धमाका',
        synopsis: 'समुद्र के नीचे कुछ बहुत बड़ा हिल रहा है।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1439405326854-014607f694d7', 640),
        audio: [{ lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.joyrides } }],
        releasedAt: '2024-09-21',
        dubbedAt: '2024-10-08',
      },
    ],
  },
  {
    slug: 'paper-crane-detective',
    title: 'Paper Crane Detective',
    titleHindi: 'कागज़ की चिड़िया जासूस',
    altTitle: 'Orizuru Tantei',
    synopsis:
      'एक जासूस जो सबूत नहीं, कागज़ की चिड़ियाँ पढ़ता है। हर मोड़ पर एक नई तह और हर तह में छुपा एक झूठ।',
    year: 2025,
    status: 'Airing',
    rating: 8.9,
    views: 2_240_000,
    ageRating: 'U/A 13+',
    studio: 'Inkline Works',
    dubStudio: 'ध्वनि डब वर्क्स',
    dubStatus: 'in-progress',
    languages: ['hindi', 'english'],
    genres: ['mystery', 'supernatural', 'slice-of-life'],
    poster: img('photo-1509023464722-18d996393ca8', 700),
    banner: img('photo-1507842217343-583bb7270b66', 1800),
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'One Thousand Folds',
        titleHindi: 'हज़ार तहें',
        synopsis: 'हज़ारवीं चिड़िया एक नाम फुसफुसाती है।',
        durationLabel: '23 मिनट',
        thumbnail: img('photo-1516414447565-b14be0adf13e', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'vimeo', id: '76979871' } },
          { lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.elephants } },
        ],
        releasedAt: '2025-03-08',
        dubbedAt: '2025-03-22',
      },
      {
        number: 2,
        title: 'The Crease Confession',
        titleHindi: 'तह का कबूलनामा',
        synopsis: 'हर तह अपने अंदर एक कबूलनामा छुपाए है।',
        durationLabel: '23 मिनट',
        thumbnail: img('photo-1524995997946-a1c2e315a42f', 640),
        audio: [{ lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.elephants } }],
        releasedAt: '2025-03-15',
      },
    ],
  },
  {
    slug: 'summer-of-second-serve',
    title: 'Summer of Second Serve',
    titleHindi: 'दूसरी सर्विस की गर्मी',
    altTitle: 'Nidome no Natsu',
    synopsis:
      'एक हारा हुआ टेनिस खिलाड़ी, एक टूटा हुआ कोर्ट और एक गर्मी जो सब कुछ बदल देती है।',
    year: 2024,
    status: 'Completed',
    rating: 8.6,
    views: 1_410_000,
    ageRating: 'U',
    studio: 'Court Nine',
    dubStatus: 'announced',
    languages: ['english'],
    genres: ['sports', 'slice-of-life', 'romance'],
    poster: img('photo-1554068865-24cecd4e34b8', 700),
    banner: img('photo-1530549387789-4c1017266635', 1800),
    trending: false,
    featured: false,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'Fault',
        titleHindi: 'गलती',
        synopsis: 'पहली सर्विस और पहली गलती।',
        durationLabel: '22 मिनट',
        thumbnail: img('photo-1622279457486-62dcc4a431d6', 640),
        audio: [{ lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.bunny } }],
        releasedAt: '2024-06-01',
      },
    ],
  },
  {
    slug: 'the-hollow-choir',
    title: 'The Hollow Choir',
    titleHindi: 'सूना गायकवृंद',
    altTitle: 'Kūkyo no Gasshō',
    synopsis:
      'एक गाँव जहाँ हर रात एक गीत सुनाई देता है और जो उसे गुनगुनाता है वो सुबह गायब हो जाता है।',
    year: 2025,
    status: 'Upcoming',
    rating: 8.4,
    views: 890_000,
    ageRating: 'A',
    studio: 'Nightfold',
    dubStatus: 'announced',
    languages: ['japanese'],
    genres: ['horror', 'mystery', 'supernatural'],
    poster: img('photo-1476370648495-3533f64427a2', 700),
    banner: img('photo-1509023464722-18d996393ca8', 1800),
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'First Verse',
        titleHindi: 'पहली पंक्ति',
        synopsis: 'गीत की पहली पंक्ति हवा में तैरती है।',
        durationLabel: '25 मिनट',
        thumbnail: img('photo-1533134486753-c833f0ed4866', 640),
        audio: [{ lang: 'japanese', source: { kind: 'mp4', url: OPEN_MP4.sintel } }],
        releasedAt: '2025-10-03',
      },
    ],
  },
  {
    slug: 'dragonfruit-alchemy',
    title: 'Dragonfruit Alchemy',
    titleHindi: 'ड्रैगनफ्रूट कीमियागरी',
    altTitle: 'Ryūka no Renkinjutsu',
    synopsis:
      'एक अनाड़ी कीमियागर लड़की और उसका बोलने वाला ड्रैगनफ्रूट। जादू, हँसी और बहुत सारे धमाके।',
    year: 2025,
    status: 'Airing',
    rating: 8.7,
    views: 2_760_000,
    ageRating: 'U',
    studio: 'Warm Bowl Studio',
    dubStudio: 'वॉइसक्राफ्ट इंडिया',
    dubStatus: 'dubbed',
    languages: ['hindi', 'english'],
    genres: ['fantasy', 'comedy', 'adventure'],
    poster: img('photo-1500673922987-e212871fec22', 700),
    banner: img('photo-1470071459604-3b5ec3a7fe05', 1800),
    trending: true,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Boil, Bubble, Oops',
        titleHindi: 'उबाल, बुलबुला, ओह!',
        synopsis: 'पहला प्रयोग और पहला विस्फोट।',
        durationLabel: '23 मिनट',
        thumbnail: img('photo-1502134249126-9f3755a50d78', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'youtube', id: 'aqz-KE-bpKQ' } },
          { lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.escapes } },
        ],
        releasedAt: '2025-02-14',
        dubbedAt: '2025-02-21',
      },
      {
        number: 2,
        title: 'A Fruit Most Rude',
        titleHindi: 'सबसे बदतमीज़ फल',
        synopsis: 'ड्रैगनफ्रूट अब बोलना सीख गया है और वो चुप नहीं होता।',
        durationLabel: '23 मिनट',
        thumbnail: img('photo-1490750967868-88aa4486c946', 640),
        audio: [{ lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.escapes } }],
        releasedAt: '2025-02-21',
        dubbedAt: '2025-02-28',
      },
    ],
  },
  {
    slug: 'letters-to-a-falling-sky',
    title: 'Letters to a Falling Sky',
    titleHindi: 'गिरते आसमान के नाम चिट्ठियाँ',
    altTitle: 'Ochiru Sora e no Tegami',
    synopsis:
      'दो अजनबी चिट्ठियों से जुड़े हैं, जबकि आसमान धीरे-धीरे नीचे गिर रहा है। वक़्त कम है, पर शब्द अब भी बचे हैं।',
    year: 2024,
    status: 'Completed',
    rating: 9.2,
    views: 3_050_000,
    ageRating: 'U/A 13+',
    studio: 'Inkline Works',
    dubStudio: 'साउंड सेतु स्टूडियो',
    dubStatus: 'dubbed',
    languages: ['hindi', 'english', 'japanese'],
    genres: ['romance', 'fantasy', 'slice-of-life'],
    poster: img('photo-1533450718592-29d45635f0a9', 700),
    banner: img('photo-1419242902214-272b3f66ee7a', 1800),
    trending: true,
    featured: true,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'Postmarked Nowhere',
        titleHindi: 'बेपते की चिट्ठी',
        synopsis: 'पहली चिट्ठी बिना किसी पते के पहुँचती है।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1507499036636-f716246c2c23', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.elephants } },
          { lang: 'japanese', source: { kind: 'vimeo', id: '76979871' } },
        ],
        releasedAt: '2024-11-08',
        dubbedAt: '2024-12-01',
      },
      {
        number: 2,
        title: 'Reply in Blue Ink',
        titleHindi: 'नीली स्याही में जवाब',
        synopsis: 'जवाब नीली स्याही में आता है।',
        durationLabel: '24 मिनट',
        thumbnail: img('photo-1455390582262-044cdead277a', 640),
        audio: [{ lang: 'hindi', source: { kind: 'vimeo', id: '76979871' } }],
        releasedAt: '2024-11-15',
        dubbedAt: '2024-12-08',
      },
    ],
  },
  {
    slug: 'thunderfoot-league',
    title: 'Thunderfoot League',
    titleHindi: 'बिजली पाँव लीग',
    altTitle: 'Kaminari Ashi',
    synopsis:
      'गली के फुटबॉल से लेकर राष्ट्रीय स्तर तक। एक टीम जिसके पास जूते कम और जुनून ज़्यादा है।',
    year: 2025,
    status: 'Airing',
    rating: 8.5,
    views: 1_680_000,
    ageRating: 'U',
    studio: 'Court Nine',
    dubStudio: 'ध्वनि डब वर्क्स',
    dubStatus: 'in-progress',
    languages: ['hindi', 'english'],
    genres: ['sports', 'comedy', 'adventure'],
    poster: img('photo-1517649763962-0c623066013b', 700),
    banner: img('photo-1431324155629-1a6deb1dec8d', 1800),
    trending: false,
    featured: false,
    newRelease: true,
    episodes: [
      {
        number: 1,
        title: 'Barefoot Kickoff',
        titleHindi: 'नंगे पाँव किकऑफ़',
        synopsis: 'बिना जूतों के खेला गया पहला मैच।',
        durationLabel: '23 मिनट',
        thumbnail: img('photo-1543326727-cf6c39e8f84c', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.joyrides } },
          { lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.bunny } },
        ],
        releasedAt: '2025-06-07',
        dubbedAt: '2025-06-21',
      },
    ],
  },
  {
    slug: 'wolfsong-frontier',
    title: 'Wolfsong Frontier',
    titleHindi: 'भेड़िये का गीत',
    altTitle: 'Ōkami no Uta',
    synopsis:
      'बर्फ़ से ढके पहाड़ों में एक लड़का और एक भेड़िया मिलकर एक खोई हुई सभ्यता का नक्शा ढूँढते हैं।',
    year: 2024,
    status: 'Completed',
    rating: 9.3,
    views: 4_120_000,
    ageRating: 'U/A 13+',
    studio: 'Kawa Animation',
    dubStudio: 'साउंड सेतु स्टूडियो',
    dubStatus: 'dubbed',
    languages: ['hindi', 'english'],
    genres: ['adventure', 'fantasy', 'action'],
    poster: img('photo-1518709766631-a6a7f45921c3', 700),
    banner: img('photo-1483728642387-6c3bdd6c93e5', 1800),
    trending: true,
    featured: true,
    newRelease: false,
    episodes: [
      {
        number: 1,
        title: 'Tracks in New Snow',
        titleHindi: 'नई बर्फ़ पर निशान',
        synopsis: 'ताज़ी गिरी बर्फ़ पर पहले निशान दिखते हैं।',
        durationLabel: '25 मिनट',
        thumbnail: img('photo-1418985991508-e47386d96a71', 640),
        audio: [
          { lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.sintel } },
          { lang: 'english', source: { kind: 'mp4', url: OPEN_MP4.blazes } },
        ],
        releasedAt: '2024-12-06',
        dubbedAt: '2024-12-20',
      },
      {
        number: 2,
        title: 'The Howl Map',
        titleHindi: 'हुंकार का नक्शा',
        synopsis: 'भेड़िये की आवाज़ ही असली नक्शा है।',
        durationLabel: '25 मिनट',
        thumbnail: img('photo-1454391304352-2bf4678b1a7a', 640),
        audio: [{ lang: 'hindi', source: { kind: 'mp4', url: OPEN_MP4.blazes } }],
        releasedAt: '2024-12-13',
        dubbedAt: '2024-12-27',
      },
    ],
  },
];

/* ------------------------------ selectors ------------------------------ */

export const getAll = (): Anime[] => ANIME;

export const getBySlug = (slug: string): Anime | undefined =>
  ANIME.find((a) => a.slug === slug);

/** Series with a Hindi dub already available — the site's core offering. */
export const getHindiDubbed = (): Anime[] =>
  ANIME.filter((a) => a.dubStatus === 'dubbed').sort((a, b) => b.views - a.views);

/** Hindi dub currently releasing episode by episode. */
export const getDubInProgress = (): Anime[] =>
  ANIME.filter((a) => a.dubStatus === 'in-progress').sort((a, b) => b.views - a.views);

/** Hindi dub confirmed but not yet released. */
export const getDubAnnounced = (): Anime[] =>
  ANIME.filter((a) => a.dubStatus === 'announced');

/** Most recently dubbed episodes, newest first. */
export const getFreshDubs = (limit = 10): Anime[] =>
  ANIME.filter((a) => a.episodes.some((e) => e.dubbedAt))
    .map((a) => ({
      anime: a,
      latest: Math.max(
        ...a.episodes.filter((e) => e.dubbedAt).map((e) => new Date(e.dubbedAt!).getTime()),
      ),
    }))
    .sort((x, y) => y.latest - x.latest)
    .slice(0, limit)
    .map((x) => x.anime);

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
      // prefer same-genre titles that are also Hindi dubbed
      score:
        a.genres.filter((g) => current.genres.includes(g)).length +
        (a.dubStatus === 'dubbed' ? 1 : 0),
    }))
    .sort((x, y) => y.score - x.score || y.anime.rating - x.anime.rating)
    .slice(0, limit)
    .map((x) => x.anime);
};

export interface SearchOptions {
  genre?: string;
  /** Only return series with a Hindi dub available. */
  hindiOnly?: boolean;
}

export function searchAnime(query: string, options: SearchOptions = {}): Anime[] {
  const { genre, hindiOnly } = options;
  const q = query.trim().toLowerCase();

  return ANIME.filter((a) => {
    if (genre && genre !== 'all' && !a.genres.includes(genre)) return false;
    if (hindiOnly && a.dubStatus !== 'dubbed') return false;
    if (!q) return true;

    return (
      a.title.toLowerCase().includes(q) ||
      (a.titleHindi?.toLowerCase().includes(q) ?? false) ||
      (a.altTitle?.toLowerCase().includes(q) ?? false) ||
      a.studio.toLowerCase().includes(q) ||
      (a.dubStudio?.toLowerCase().includes(q) ?? false) ||
      a.synopsis.toLowerCase().includes(q) ||
      a.genres.some((g) => g.includes(q))
    );
  });
}
