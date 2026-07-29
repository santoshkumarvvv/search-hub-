'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  Plus,
  Check,
  ChevronRight,
  Menu,
  X,
  Flame,
  Clock3,
  Star,
  UserCircle,
  Film,
  Tv,
  Sparkles,
  XCircle,
  Filter,
  Volume2,
  Shield,
  Heart,
  Share2,
  Award,
  Eye,
  Bookmark,
  Zap,
  Globe,
  Compass,
  PlayCircle
} from 'lucide-react';

// संतोष (Santosh) द्वारा तैयार किया गया भारत का नंबर 1 हिंदी डब्ड एनीमे और मूवीज डेटाबेस
export interface AnimeItem {
  id: string;
  title: string;
  sub: string;
  tag: string;
  img: string;
  bannerImg: string;
  desc: string;
  rating: string;
  eps: string;
  year: string;
  type: 'Series' | 'Movie';
  categories: string[];
  genres: string;
  quality: string;
  embedUrl: string;
  episodesList: { epNum: number; title: string; duration: string }[];
}

const SANTOSH_ANIME_DATABASE: AnimeItem[] = [
  {
    id: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    sub: 'डेमन स्लेयर: किमेत्सु नो याइबा',
    tag: 'TRENDING #1 • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&q=85',
    bannerImg: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=85',
    desc: 'तानजीरो कामडो अपने परिवार को बचाने और अपनी बहन नेजुको को वापस इंसान बनाने के लिए डेमन स्लेयर (Demon Slayer) बनने की एक रोमांचक यात्रा पर निकलता है। भारत में सबसे लोकप्रिय हिंदी डब्ड एनीमे।',
    rating: '9.7',
    eps: '55 Episodes',
    year: '2024',
    type: 'Series',
    categories: ['Action', 'Fantasy', 'Adventure'],
    genres: 'Action • Fantasy • Adventure • Historical',
    quality: '4K HD HINDI',
    embedUrl: 'https://www.youtube.com/embed/VQGCKyvzIM4?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'क्रूरता की शुरुआत (The Beginning)', duration: '24 मिनट' },
      { epNum: 2, title: 'प्रशिक्षक उरोकोदाकी (Trainer Urokodaki)', duration: '24 मिनट' },
      { epNum: 3, title: 'अंतिम चयन परीक्षा (Final Selection)', duration: '23 मिनट' },
      { epNum: 4, title: 'दानव का खात्मा (Demon Defeated)', duration: '24 मिनट' },
      { epNum: 5, title: 'अपनी तलवार खुद चुनो (Your Own Steel)', duration: '24 मिनट' },
    ],
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    sub: 'जुजुत्सु कैसेन — श्राप और शक्ति',
    tag: 'BLOCKBUSTER #2 • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1614583224974-4a62d3b9a3ca?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1614583224974-4a62d3b9a3ca?w=1600&q=85',
    desc: 'यूजी इतादोरी एक शक्तिशाली श्रापित वस्तु को निगल लेता है और श्रापों की रहस्यमयी दुनिया (Jujutsu Sorcerers) में कदम रखता है। बेहतरीन एक्शन और हिंदी संवादों के साथ।',
    rating: '9.6',
    eps: '47 Episodes',
    year: '2024',
    type: 'Series',
    categories: ['Action', 'Fantasy'],
    genres: 'Action • Dark Fantasy • Supernatural',
    quality: '1080p HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/pkXK8zP2mJ8?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'सुकुना की उंगली (Ryomen Sukuna)', duration: '24 मिनट' },
      { epNum: 2, title: 'मेरे लिए सिर्फ मौत (For Myself)', duration: '24 मिनट' },
      { epNum: 3, title: 'लौह जैसी इच्छाशक्ति (Girl of Steel)', duration: '24 मिनट' },
      { epNum: 4, title: 'शापित गर्भ (Curse Womb Must Die)', duration: '24 मिनट' },
    ],
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    sub: 'सोलो लेवलिंग — सबसे कमजोर से सबसे मजबूत',
    tag: 'NEW SENSATION • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1618336753974-4a62d3b9a3ca?w=1600&q=85',
    desc: 'दुनिया का सबसे कमज़ोर हंटर, सुंग जिन-वू, एक रहस्यमयी कालकोठरी में मौत के बाद एक अद्भुत प्रणाली द्वारा चुना जाता है। अब वह असीमित शक्ति की ओर बढ़ता है।',
    rating: '9.8',
    eps: '25 Episodes',
    year: '2025',
    type: 'Series',
    categories: ['Action', 'Fantasy', 'Adventure'],
    genres: 'Action • Fantasy • Adventure • System',
    quality: '4K HD HINDI',
    embedUrl: 'https://www.youtube.com/embed/9Xw3fJ18_4w?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'मैं इस्तेमाल होने वाला नहीं (I\'m Used to It)', duration: '24 मिनट' },
      { epNum: 2, title: 'दोहरी कालकोठरी (Double Dungeon)', duration: '24 मिनट' },
      { epNum: 3, title: 'दैनिक खोज (Daily Quest)', duration: '23 मिनट' },
      { epNum: 4, title: 'बॉस से मुकाबला (Boss Fight)', duration: '25 मिनट' },
    ],
  },
  {
    id: 'one-piece',
    title: 'One Piece',
    sub: 'वन पीस — समुद्री लुटेरों का राजा',
    tag: 'LEGENDARY • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?w=1600&q=85',
    desc: 'मंकी डी. लुफी और उसकी स्ट्रा हैट (Straw Hat) क्रू दुनिया के सबसे महान खजाने "One Piece" की खोज में विशाल समुद्र पर रोमांचक सफर करते हैं।',
    rating: '9.5',
    eps: '1122 Episodes',
    year: '2024',
    type: 'Series',
    categories: ['Action', 'Adventure'],
    genres: 'Action • Adventure • Fantasy • Comedy',
    quality: 'HD HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/MCb13lbVGE0?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'मैं बनूंगा समुद्री लुटेरों का राजा! (I\'m Luffy!)', duration: '24 मिनट' },
      { epNum: 2, title: 'महान तलवारबाज जोरो (Enter Zoro)', duration: '24 मिनट' },
      { epNum: 3, title: 'मॉर्गन के खिलाफ जंग (Morgan vs Luffy)', duration: '24 मिनट' },
    ],
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan',
    sub: 'अटैक ऑन टाइटन — मानवता की आखिरी जंग',
    tag: 'TOP RATED #1 • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=1600&q=85',
    desc: 'विशालकाय दीवारों के पीछे बची मानवता का सामना खून के प्यासे टाइटन्स (Titans) से होता है। एरेन येगर अपनी आज़ादी और बदला लेने के लिए संकल्प लेता है।',
    rating: '9.9',
    eps: '89 Episodes',
    year: '2023',
    type: 'Series',
    categories: ['Action', 'Fantasy', 'Adventure'],
    genres: 'Action • Dark Fantasy • Mystery • Drama',
    quality: '4K HD HINDI',
    embedUrl: 'https://www.youtube.com/embed/M_OauH5AFc8?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'उस दिन (To You, 2,000 Years From Now)', duration: '25 मिनट' },
      { epNum: 2, title: 'दीवार का टूटना (That Day)', duration: '24 मिनट' },
      { epNum: 3, title: 'कैडेट प्रशिक्षण (A Dim Light)', duration: '24 मिनट' },
    ],
  },
  {
    id: 'your-name',
    title: 'Your Name (Kimi no Na wa)',
    sub: 'योर नेम — एक जादुई प्रेम कहानी (हिंदी डब्ड मूवी)',
    tag: 'MASTERPIECE • मूवी',
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85',
    desc: 'दो अजनबी लड़के और लड़की, मित्सुहा और ताकी, अचानक एक-दूसरे के शरीरों में बदलने लगते हैं। समय और सितारों के बीच बुनी गई एक खूबसूरत और भावुक कहानी।',
    rating: '9.7',
    eps: '1 Movie (106 Min)',
    year: '2024',
    type: 'Movie',
    categories: ['Fantasy', 'Romance', 'Movies'],
    genres: 'Fantasy • Romance • Drama • Supernatural',
    quality: '4K HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/xU47nhruN-Q?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'योर नेम — पूर्ण मूवी (Full Movie Hindi Dubbed)', duration: '106 मिनट' },
    ],
  },
  {
    id: 'suzume',
    title: 'Suzume no Tojimari',
    sub: 'सुज़ुमे — आपदाओं के दरवाजे',
    tag: 'SUPERHIT MOVIE • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85',
    desc: '17 वर्षीय सुज़ुमे एक रहस्यमयी युवक की मदद करने के लिए जापान भर के परित्यक्त स्थानों में खुल रहे आपदाओं के दरवाज़ों को बंद करने के सफर पर निकलती है।',
    rating: '9.4',
    eps: '1 Movie (122 Min)',
    year: '2024',
    type: 'Movie',
    categories: ['Fantasy', 'Adventure', 'Movies'],
    genres: 'Fantasy • Adventure • Mystery • Drama',
    quality: '4K HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/6c4-qQv_bZg?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'सुज़ुमे — पूर्ण मूवी (Full Movie Hindi Dubbed)', duration: '122 मिनट' },
    ],
  },
  {
    id: 'naruto-shippuden',
    title: 'Naruto: Shippuden',
    sub: 'नारुतो शिप्पुडेन — होकागे का सपना',
    tag: 'ALL TIME GREAT • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&q=85',
    desc: 'नारुतो उज़ुमाकी अपनी कड़ी ट्रेनिंग के बाद गांव वापस लौटता है और अकात्सुकी (Akatsuki) से अपने दोस्त सासुके और दुनिया को बचाने की अंतिम लड़ाई लड़ता है।',
    rating: '9.4',
    eps: '500 Episodes',
    year: '2023',
    type: 'Series',
    categories: ['Action', 'Adventure'],
    genres: 'Action • Adventure • Martial Arts • Ninja',
    quality: '1080p HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/-G9BqkgZXRA?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'घर वापसी (Homecoming)', duration: '24 मिनट' },
      { epNum: 2, title: 'अकात्सुकी की दस्तक (The Akatsuki Move)', duration: '24 मिनट' },
      { epNum: 3, title: 'काकेगाशी का इम्तिहान (Test of Kakashi)', duration: '23 मिनट' },
    ],
  },
  {
    id: 'black-clover',
    title: 'Black Clover',
    sub: 'ब्लैक क्लोवर — बिना जादू का जादूगर',
    tag: 'POPULAR ACTION • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=85',
    desc: 'एक ऐसी दुनिया जहां जादू ही सब कुछ है, आस्टा बिना किसी जादू के पैदा होता है। लेकिन अपनी कभी हार न मानने वाली इच्छाशक्ति से वह विजार्ड किंग बनने की ओर बढ़ता है।',
    rating: '9.1',
    eps: '170 Episodes',
    year: '2023',
    type: 'Series',
    categories: ['Action', 'Fantasy'],
    genres: 'Action • Fantasy • Comedy • Magic',
    quality: 'HD HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/v9qI9-3Z5j4?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'आस्टा और योनो (Asta and Yuno)', duration: '24 मिनट' },
      { epNum: 2, title: 'मैजिक नाइट्स परीक्षा (Magic Knights)', duration: '24 मिनट' },
    ],
  },
  {
    id: 'hunter-x-hunter',
    title: 'Hunter x Hunter',
    sub: 'हंटर x हंटर — महान खोज',
    tag: 'CRITICAL ACCLAIM • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85',
    desc: 'गोन फ्रीक्स अपने पिता को खोजने के लिए खतरनाक हंटर परीक्षा (Hunter Exam) में भाग लेता है और किलुआ, कुरापिका और लियोरियो के साथ आजीवन मित्रता बनाता है।',
    rating: '9.7',
    eps: '148 Episodes',
    year: '2023',
    type: 'Series',
    categories: ['Action', 'Adventure'],
    genres: 'Action • Adventure • Fantasy • Mystery',
    quality: '1080p HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/d6kBeJjTGnY?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'हंटर बनने का सफर (Departure x And x Friends)', duration: '24 मिनट' },
      { epNum: 2, title: 'परीक्षा का पहला चरण (Test x Of x Tests)', duration: '24 मिनट' },
    ],
  },
  {
    id: 'demon-slayer-mugen-train',
    title: 'Demon Slayer: Mugen Train',
    sub: 'डेमन स्लेयर: मुगेन ट्रेन (हिंदी मूवी)',
    tag: 'BOX OFFICE RECORD • मूवी',
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85',
    desc: 'तानजीरो और उसके दोस्त फ्लेम हशीरा क्योजुरो रेंगोकु के साथ एक रहस्यमयी ट्रेन पर सवार होते हैं जहाँ 40 से अधिक यात्री गायब हो चुके हैं। अद्वितीय एक्शन और इमोशन।',
    rating: '9.8',
    eps: '1 Movie (117 Min)',
    year: '2024',
    type: 'Movie',
    categories: ['Action', 'Fantasy', 'Movies'],
    genres: 'Action • Dark Fantasy • Drama • Anime Movie',
    quality: '4K HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/bF9dISdJg58?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'मुगेन ट्रेन — पूर्ण मूवी (Full Movie Hindi Dubbed)', duration: '117 मिनट' },
    ],
  },
  {
    id: 'tokyo-revengers',
    title: 'Tokyo Revengers',
    sub: 'टोक्यो रिवेंजर्स — समय की छलांग',
    tag: 'HIGH VOLTAGE • हिंदी डब्ड',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&q=80',
    bannerImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=85',
    desc: 'ताकेमिची हानागाकी को 12 साल पीछे समय में वापस जाने की शक्ति मिलती है। अपनी प्रेमिका और दोस्तों को टोक्यो मंज़ी गैंग से बचाने के लिए वह गैंग में शामिल होता है।',
    rating: '9.1',
    eps: '37 Episodes',
    year: '2024',
    type: 'Series',
    categories: ['Action'],
    genres: 'Action • Drama • Time Travel • Delinquent',
    quality: '1080p HINDI DUB',
    embedUrl: 'https://www.youtube.com/embed/tZk4X8aVvwg?autoplay=1',
    episodesList: [
      { epNum: 1, title: 'पुनर्जन्म (Reborn)', duration: '24 मिनट' },
      { epNum: 2, title: 'बदलाव का संकल्प (Resist)', duration: '24 मिनट' },
    ],
  },
];

export default function Home() {
  // संतोष (Santosh) द्वारा तैयार किया गया स्टेट और फिल्टर लॉजिक
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('सभी');
  const [saved, setSaved] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [audioLang, setAudioLang] = useState<'Hindi' | 'Japanese'>('Hindi');
  const [heroIndex, setHeroIndex] = useState(0);

  // श्रेणी टैब्स (Santosh Filter Categories)
  const categoriesList = [
    { label: 'सभी', icon: <Sparkles size={16} /> },
    { label: 'Action', icon: <Flame size={16} /> },
    { label: 'Fantasy', icon: <Zap size={16} /> },
    { label: 'Adventure', icon: <Compass size={16} /> },
    { label: 'Movies', icon: <Film size={16} /> },
    { label: 'Series', icon: <Tv size={16} /> },
    { label: 'मेरी वॉचलिस्ट', icon: <Heart size={16} /> },
  ];

  // वॉचलिस्ट टॉगल (Santosh Watchlist Handler)
  const toggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // फ़िल्टर किया गया एनीमे डेटा
  const filteredAnime = useMemo(() => {
    return SANTOSH_ANIME_DATABASE.filter((anime) => {
      const matchesSearch =
        anime.title.toLowerCase().includes(query.toLowerCase()) ||
        anime.sub.toLowerCase().includes(query.toLowerCase()) ||
        anime.genres.toLowerCase().includes(query.toLowerCase()) ||
        anime.desc.toLowerCase().includes(query.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === 'सभी') return true;
      if (activeCategory === 'Movies') return anime.type === 'Movie';
      if (activeCategory === 'Series') return anime.type === 'Series';
      if (activeCategory === 'मेरी वॉचलिस्ट') return saved.includes(anime.id);
      return anime.categories.includes(activeCategory);
    });
  }, [query, activeCategory, saved]);

  const heroAnime = SANTOSH_ANIME_DATABASE[heroIndex] || SANTOSH_ANIME_DATABASE[0];

  // संतोष द्वारा डिज़ाइन किया गया कार्ड कंपोनेंट (Santosh Card Component)
  const AnimeCard = ({ anime }: { anime: AnimeItem }) => {
    const isMarked = saved.includes(anime.id);
    return (
      <div
        onClick={() => {
          setSelectedAnime(anime);
          setCurrentEpisodeIndex(0);
        }}
        className="group relative cursor-pointer min-w-[170px] sm:min-w-[200px] md:min-w-[220px] transition-all duration-300 hover:-translate-y-1.5"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-panel border border-white/10 shadow-lg shadow-black/40">
          <img
            src={anime.img}
            alt={anime.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
          {/* क्वालिटी बैज */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-extrabold text-black uppercase tracking-wider shadow">
              {anime.quality}
            </span>
          </div>
          {/* वॉचलिस्ट बटन */}
          <button
            onClick={(e) => toggleWatchlist(anime.id, e)}
            className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
              isMarked
                ? 'bg-accent text-black font-bold'
                : 'bg-black/60 text-white hover:bg-white/20'
            }`}
            title="वॉचलिस्ट में जोड़ें"
          >
            {isMarked ? <Check size={16} /> : <Plus size={16} />}
          </button>
          {/* होवर ओवरले */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black shadow-lg shadow-accent/40 transition transform group-hover:scale-105">
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </span>
              <span className="text-xs font-bold text-accent tracking-wide uppercase">
                अभी देखें (Play)
              </span>
            </div>
            <p className="text-[11px] text-gray-300 line-clamp-2 leading-tight">
              {anime.desc}
            </p>
          </div>
        </div>
        <div className="mt-2.5">
          <h3 className="truncate text-sm font-bold text-gray-100 group-hover:text-accent transition">
            {anime.title}
          </h3>
          <div className="mt-0.5 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1 font-semibold text-accent">
              ★ {anime.rating}
            </span>
            <span>{anime.eps}</span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-gray-400">
            {anime.sub}
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-ink text-gray-100 pb-20">
      {/* 1. संतोष द्वारा डिज़ाइन किया गया नेविगेशन बार (Santosh Header) */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-white/10 bg-ink/90 px-4 py-3.5 backdrop-blur-xl md:px-12">
        <div className="flex items-center gap-8">
          <div
            onClick={() => {
              setQuery('');
              setActiveCategory('सभी');
            }}
            className="cursor-pointer flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-amber-600 text-black font-black text-xl shadow-lg shadow-accent/20">
              S
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Santosh</span>
                <span className="text-accent">Anime</span>
              </div>
              <div className="text-[10px] font-bold text-amber-400 tracking-wider">
                संतोष हिंदी डब्ड हब
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-300 lg:flex">
            {categoriesList.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveCategory(cat.label);
                  setQuery('');
                }}
                className={`flex items-center gap-1.5 transition ${
                  activeCategory === cat.label
                    ? 'text-accent font-bold'
                    : 'hover:text-white'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {cat.label === 'मेरी वॉचलिस्ट' && saved.length > 0 && (
                  <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black">
                    {saved.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* सर्च इनपुट */}
          <div className="relative flex items-center rounded-full border border-white/10 bg-panel px-3.5 py-2 shadow-inner focus-within:border-accent/60 transition">
            <Search size={16} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="हिंदी डब्ड एनीमे खोजें..."
              className="w-36 bg-transparent pl-2 text-sm text-white outline-none placeholder:text-muted sm:w-56"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* संतोष VIP प्रोफाइल बैज */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <UserCircle size={17} className="text-accent" />
            <span>Santosh VIP</span>
          </div>

          {/* मोबाइल मेनू बटन */}
          <button
            className="rounded-full border border-white/10 p-2 text-gray-300 lg:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* मोबाइल नेविगेशन ड्रॉअर */}
      {mobileMenu && (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-white/10 bg-ink/95 px-6 py-5 backdrop-blur-2xl lg:hidden animate-fade-in">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            श्रेणियां (Categories by Santosh)
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {categoriesList.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveCategory(cat.label);
                  setMobileMenu(false);
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  activeCategory === cat.label
                    ? 'bg-accent text-black shadow-md'
                    : 'bg-panel text-gray-300 hover:bg-white/10'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {cat.label === 'मेरी वॉचलिस्ट' && saved.length > 0 && (
                  <span className="ml-auto rounded-full bg-black/30 px-2 py-0.5 text-xs">
                    {saved.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. संतोष द्वारा डिज़ाइन किया गया हीरो बैनर (Santosh Hero Banner) */}
      {!query && activeCategory === 'सभी' && (
        <section className="relative min-h-[640px] md:min-h-[700px] flex items-end overflow-hidden pt-24 pb-16">
          <img
            src={heroAnime.bannerImg || heroAnime.img}
            alt={heroAnime.title}
            className="absolute inset-0 h-full w-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          <div className="hero-gradient absolute inset-0" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-black text-black tracking-wider uppercase">
                  {heroAnime.tag}
                </span>
                <span className="rounded-md border border-white/20 bg-black/40 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-gray-200">
                  {heroAnime.quality}
                </span>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                  ★ {heroAnime.rating} RATING
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none text-white drop-shadow-md">
                {heroAnime.title}
                <span className="block mt-2 text-2xl sm:text-3xl font-normal text-amber-300/90">
                  {heroAnime.sub}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-gray-200 drop-shadow">
                {heroAnime.desc}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 font-medium">
                <span className="text-accent font-bold">
                  {heroAnime.year}
                </span>
                <span>•</span>
                <span>{heroAnime.eps}</span>
                <span>•</span>
                <span className="text-gray-300">{heroAnime.genres}</span>
              </div>

              <div className="mt-7 flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setSelectedAnime(heroAnime);
                    setCurrentEpisodeIndex(0);
                  }}
                  className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-accent to-amber-500 px-7 py-3.5 text-sm sm:text-base font-black text-black shadow-xl shadow-accent/30 hover:brightness-110 active:scale-95 transition"
                >
                  <Play size={20} fill="currentColor" />
                  <span>अभी देखें (Watch Now)</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(heroAnime.id)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-6 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-xl hover:bg-white/10 active:scale-95 transition"
                >
                  {saved.includes(heroAnime.id) ? (
                    <>
                      <Check size={19} className="text-accent" />
                      <span>वॉचलिस्ट में सेव है</span>
                    </>
                  ) : (
                    <>
                      <Plus size={19} />
                      <span>वॉचलिस्ट में जोड़ें</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* हीरो स्विचर (Santosh Featured Selector) */}
            <div className="hidden lg:flex flex-col gap-2 bg-black/50 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <div className="text-[11px] font-bold text-muted px-2 uppercase tracking-wider">
                संतोष की टॉप पसंद (Santosh Top Picks)
              </div>
              <div className="flex gap-2">
                {SANTOSH_ANIME_DATABASE.slice(0, 4).map((anime, idx) => (
                  <button
                    key={anime.id}
                    onClick={() => setHeroIndex(idx)}
                    className={`relative h-16 w-28 overflow-hidden rounded-lg border-2 transition ${
                      heroIndex === idx
                        ? 'border-accent scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={anime.img}
                      alt={anime.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-[10px] font-extrabold text-white bg-black/70 px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. संतोष कैटेगरी फ़िल्टर टैब्स (Santosh Category Pills) */}
      <section className="mt-8 max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            {categoriesList.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveCategory(cat.label);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition ${
                  activeCategory === cat.label
                    ? 'bg-accent text-black shadow-lg shadow-accent/20'
                    : 'bg-panel text-gray-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {cat.label === 'मेरी वॉचलिस्ट' && saved.length > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-black ${
                      activeCategory === cat.label
                        ? 'bg-black text-accent'
                        : 'bg-accent text-black'
                    }`}
                  >
                    {saved.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted font-medium">
            <Filter size={15} />
            <span>संतोष द्वारा कुल {filteredAnime.length} एनीमे</span>
          </div>
        </div>
      </section>

      {/* 4. मुख्य एनीमे ग्रिड और सेक्संस (Santosh Content Sections) */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-8 space-y-12">
        {/* अगर सर्च या विशिष्ट केटेगरी सिलेक्ट है तो ग्रिड दिखाओ */}
        {(query || activeCategory !== 'सभी') && (
          <section className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>
                    {query
                      ? `"${query}" के लिए परिणाम`
                      : activeCategory === 'मेरी वॉचलिस्ट'
                      ? 'मेरी वॉचलिस्ट (Santosh Watchlist)'
                      : `${activeCategory} श्रेणी के एनीमे`}
                  </span>
                </h2>
                <p className="mt-1 text-xs text-muted">
                  संतोष के कलेक्शन से उच्च गुणवत्ता (HD/4K) में हिंदी डब्ड एनीमे
                </p>
              </div>
              <button
                onClick={() => {
                  setQuery('');
                  setActiveCategory('सभी');
                }}
                className="text-xs text-accent font-semibold hover:underline"
              >
                सभी देखें (Reset)
              </button>
            </div>

            {filteredAnime.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-panel p-12 text-center">
                <Film size={40} className="mx-auto text-muted mb-3" />
                <h3 className="text-lg font-bold text-gray-200">
                  कोई एनीमे नहीं मिला
                </h3>
                <p className="mt-1 text-sm text-muted">
                  कृपया कोई दूसरा कीवर्ड या श्रेणी चुनें। संतोष के डेटाबेस में
                  नए एनीमे जल्द जोड़े जा रहे हैं।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {filteredAnime.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* सामान्य होम व्यू (जब 'सभी' सिलेक्ट हो) */}
        {!query && activeCategory === 'सभी' && (
          <>
            {/* ट्रेंडिंग नाउ */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
                    <Flame size={19} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      ट्रेंडिंग हिंदी डब्ड (Trending in Hindi)
                    </h2>
                    <p className="text-xs text-muted">
                      भारत में सबसे ज्यादा देखे जा रहे एनीमे
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCategory('Action')}
                  className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  सभी देखें <ChevronRight size={15} />
                </button>
              </div>
              <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3">
                {SANTOSH_ANIME_DATABASE.slice(0, 7).map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </section>

            {/* ब्लॉकबस्टर हिंदी डब्ड मूवीज */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                    <Film size={19} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      ब्लॉकबस्टर हिंदी मूवीज (Anime Movies in Hindi)
                    </h2>
                    <p className="text-xs text-muted">
                      Your Name, Suzume, Mugen Train और अन्य शानदार फिल्में
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCategory('Movies')}
                  className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  सभी मूवीज देखें <ChevronRight size={15} />
                </button>
              </div>
              <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3">
                {SANTOSH_ANIME_DATABASE.filter((a) => a.type === 'Movie').map(
                  (anime) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  )
                )}
              </div>
            </section>

            {/* एक्शन एवं एडवेंचर सीरीज़ */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <Zap size={19} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      एक्शन एवं एडवेंचर (Action & Adventure)
                    </h2>
                    <p className="text-xs text-muted">
                      दमदार एक्शन और रोमांच से भरपूर हिंदी डब्ड सीरीज़
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCategory('Adventure')}
                  className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  सभी देखें <ChevronRight size={15} />
                </button>
              </div>
              <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3">
                {SANTOSH_ANIME_DATABASE.filter(
                  (a) =>
                    a.categories.includes('Action') ||
                    a.categories.includes('Adventure')
                ).map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </section>

            {/* संतोष का खास फीचर कार्ड */}
            <section className="my-10 rounded-3xl border border-white/10 bg-gradient-to-r from-panel via-panel/80 to-amber-950/30 p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
                  संतोष स्पेशल फीचर (SANTOSH EXCLUSIVE)
                </span>
                <h3 className="mt-3 text-2xl md:text-3xl font-black text-white">
                  अब हर एनीमे देखें अपनी मातृभाषा हिंदी में!
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  संतोष (Santosh) द्वारा तैयार किए गए इस विशेष प्लेटफॉर्म पर आपको मिलता
                  है 4K अल्ट्रा एचडी गुणवत्ता और स्पष्ट हिंदी डबिंग। बिना किसी बफरिंग
                  के कभी भी, कहीं भी स्ट्रीमिंग का आनंद लें।
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-gray-200">
                  <div className="flex items-center gap-1.5">
                    <Check size={16} className="text-accent" />
                    <span>100% फ्री स्ट्रीमिंग</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={16} className="text-accent" />
                    <span>HD & 4K वीडियो सपोर्ट</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={16} className="text-accent" />
                    <span>संतोष द्वारा लगातार नए अपडेट</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* 5. संतोष वीडियो प्लेयर एवं एपिसोड मॉडल (Santosh Video Player Modal) */}
      {selectedAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/15 bg-panel p-4 md:p-7 shadow-2xl shadow-black">
            {/* मॉडल हेडर */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-accent px-2 py-0.5 text-xs font-black text-black">
                    {selectedAnime.quality}
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    ★ {selectedAnime.rating} IMDB
                  </span>
                  <span className="text-xs text-muted">• {selectedAnime.year}</span>
                </div>
                <h3 className="mt-1 text-xl md:text-2xl font-black text-white">
                  {selectedAnime.title}
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  {selectedAnime.sub}
                </p>
              </div>

              <button
                onClick={() => setSelectedAnime(null)}
                className="rounded-full bg-white/10 p-2 text-gray-300 hover:bg-white/20 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* वीडियो प्लेयर (Responsive 16:9 Embedded Trailer / Player by Santosh) */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl">
              <iframe
                src={selectedAnime.embedUrl}
                title={selectedAnime.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* ऑडियो एवं क्वालिटी कंट्रोलर */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted uppercase">
                  ऑडियो भाषा:
                </span>
                <button
                  onClick={() => setAudioLang('Hindi')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    audioLang === 'Hindi'
                      ? 'bg-accent text-black shadow'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  🇮🇳 हिंदी डब्ड (Hindi Dub)
                </button>
                <button
                  onClick={() => setAudioLang('Japanese')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    audioLang === 'Japanese'
                      ? 'bg-accent text-black shadow'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  🇯🇵 जापानी (Subtitled)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleWatchlist(selectedAnime.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                    saved.includes(selectedAnime.id)
                      ? 'bg-accent text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {saved.includes(selectedAnime.id) ? (
                    <>
                      <Check size={15} />
                      <span>वॉचलिस्ट में सेव है</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>वॉचलिस्ट में जोड़ें</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedAnime.title,
                        text: `${selectedAnime.title} हिंदी में देखें - संतोष हिंदी एनीमे हब`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/20"
                >
                  <Share2 size={14} />
                  <span>शेयर</span>
                </button>
              </div>
            </div>

            {/* एपिसोड सूची (Santosh Episode Selector) */}
            <div className="mt-5">
              <h4 className="mb-3 text-sm font-bold text-white flex items-center gap-2">
                <PlayCircle size={16} className="text-accent" />
                <span>एपिसोड्स चुनें (Select Episode) — {selectedAnime.eps}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {selectedAnime.episodesList.map((ep, idx) => (
                  <button
                    key={ep.epNum}
                    onClick={() => setCurrentEpisodeIndex(idx)}
                    className={`flex items-center justify-between rounded-xl p-3.5 text-left transition border ${
                      currentEpisodeIndex === idx
                        ? 'border-accent bg-accent/15 text-white shadow-md'
                        : 'border-white/5 bg-black/40 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-accent">
                        EPISODE {ep.epNum}
                      </div>
                      <div className="text-sm font-semibold truncate mt-0.5">
                        {ep.title}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted">
                      {ep.duration}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* एनीमे का विवरण */}
            <div className="mt-6 rounded-xl bg-black/50 p-4 border border-white/5">
              <h5 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                सारांश (Synopsis in Hindi)
              </h5>
              <p className="text-sm leading-relaxed text-gray-200">
                {selectedAnime.desc}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                <span>
                  <strong className="text-gray-200">श्रेणी:</strong>{' '}
                  {selectedAnime.genres}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. संतोष द्वारा निर्मित फुटर (Santosh Footer) */}
      <footer className="mt-24 border-t border-white/10 bg-panel/60 px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-xl font-black text-white">
            <span className="text-accent">Santosh</span>
            <span>Anime Hub</span>
          </div>

          <p className="text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
            भारत का नंबर 1 हिंदी डब्ड एनीमे और मूवीज स्ट्रीमिंग प्लेटफॉर्म।
            संतोष (Santosh) द्वारा प्यार और जुनून के साथ डिज़ाइन एवं विकसित।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-400">
            <a href="#about" className="hover:text-accent transition">
              हमारे बारे में (About Santosh)
            </a>
            <a href="#privacy" className="hover:text-accent transition">
              गोपनीयता नीति (Privacy Policy)
            </a>
            <a href="#dmca" className="hover:text-accent transition">
              DMCA / डिस्क्लेमर
            </a>
            <a href="#contact" className="hover:text-accent transition">
              संपर्क करें (Contact Santosh)
            </a>
          </div>

          <div className="pt-4 border-t border-white/5 text-xs text-muted">
            © 2026 Santosh (संतोष) — All Rights Reserved. Designed & Developed exclusively by Santosh.
          </div>
        </div>
      </footer>
    </main>
  );
}
