/* =====================================================
   ANIFLIX — Premium Dark Anime Streaming
   Fully local data — zero network dependency
   Netflix-style with glowing play buttons, trailer popup,
   category filters, search, My List
   ===================================================== */

'use strict';

// ==================== LOCAL ANIME DATA ====================
const ANIME_DATA = [
  {
    id: 1,
    title: "Jujutsu Kaisen",
    title_jp: "呪術廻戦",
    year: 2023,
    episodes: 24,
    score: 9.0,
    rating: "TV-14",
    type: "TV",
    genres: ["Action", "Supernatural", "Dark Fantasy"],
    poster: "https://picsum.photos/id/1015/300/450",
    banner: "https://picsum.photos/id/1015/1400/600",
    trailer: "https://www.youtube.com/embed/4A_X-Dvl0ws",
    trailer_id: "4A_X-Dvl0ws",
    synopsis: "In a world where cursed spirits feed on unsuspecting humans, Yuji Itadori swallows a powerful finger to protect his friends and joins Tokyo Jujutsu High to fight evil.",
    trending: true,
    top_rated: true
  },
  {
    id: 2,
    title: "Demon Slayer",
    title_jp: "鬼滅の刃",
    year: 2022,
    episodes: 11,
    score: 8.7,
    rating: "TV-MA",
    type: "TV",
    genres: ["Action", "Adventure", "Historical"],
    poster: "https://picsum.photos/id/1005/300/450",
    banner: "https://picsum.photos/id/1005/1400/600",
    trailer: "https://www.youtube.com/embed/VQGCKyvzIM4",
    trailer_id: "VQGCKyvzIM4",
    synopsis: "After his family is slaughtered by demons, Tanjiro Kamado joins the Demon Slayer Corps to avenge them and turn his sister back into a human.",
    trending: true,
    top_rated: true
  },
  {
    id: 3,
    title: "Attack on Titan",
    title_jp: "進撃の巨人",
    year: 2023,
    episodes: 28,
    score: 9.1,
    rating: "TV-MA",
    type: "TV",
    genres: ["Action", "Drama", "Mystery"],
    poster: "https://picsum.photos/id/201/300/450",
    banner: "https://picsum.photos/id/201/1400/600",
    trailer: "https://www.youtube.com/embed/MGRm4IzK1SQ",
    trailer_id: "MGRm4IzK1SQ",
    synopsis: "Humanity fights for survival behind massive walls against giant humanoid Titans. Eren Yeager joins the military to seek revenge.",
    trending: true,
    top_rated: true
  },
  {
    id: 4,
    title: "One Piece",
    title_jp: "ワンピース",
    year: 2024,
    episodes: 1070,
    score: 9.3,
    rating: "TV-14",
    type: "TV",
    genres: ["Adventure", "Action", "Comedy"],
    poster: "https://picsum.photos/id/29/300/450",
    banner: "https://picsum.photos/id/29/1400/600",
    trailer: "https://www.youtube.com/embed/Ades3pQbeh8",
    trailer_id: "Ades3pQbeh8",
    synopsis: "Follows the adventures of Monkey D. Luffy and his pirate crew in search of the ultimate treasure known as 'One Piece'.",
    trending: true,
    top_rated: false
  },
  {
    id: 5,
    title: "Solo Leveling",
    title_jp: "나 혼자만 레벨업",
    year: 2024,
    episodes: 12,
    score: 8.9,
    rating: "TV-14",
    type: "TV",
    genres: ["Action", "Fantasy", "Adventure"],
    poster: "https://picsum.photos/id/160/300/450",
    banner: "https://picsum.photos/id/160/1400/600",
    trailer: "https://www.youtube.com/embed/2W0g1o7k1zI",
    trailer_id: "2W0g1o7k1zI",
    synopsis: "In a world where hunters battle monsters, the weakest hunter Sung Jin-Woo gains a mysterious power to level up alone.",
    trending: true,
    top_rated: true
  },
  {
    id: 6,
    title: "Spy × Family",
    title_jp: "SPY×FAMILY",
    year: 2022,
    episodes: 25,
    score: 8.5,
    rating: "TV-PG",
    type: "TV",
    genres: ["Comedy", "Action", "Slice of Life"],
    poster: "https://picsum.photos/id/251/300/450",
    banner: "https://picsum.photos/id/251/1400/600",
    trailer: "https://www.youtube.com/embed/3K6mJ3a9mM4",
    trailer_id: "3K6mJ3a9mM4",
    synopsis: "A spy, an assassin, and a telepath must form a fake family to maintain their secret identities.",
    trending: false,
    top_rated: true
  },
  {
    id: 7,
    title: "Chainsaw Man",
    title_jp: "チェンソーマン",
    year: 2022,
    episodes: 12,
    score: 8.6,
    rating: "TV-MA",
    type: "TV",
    genres: ["Action", "Horror", "Dark Fantasy"],
    poster: "https://picsum.photos/id/180/300/450",
    banner: "https://picsum.photos/id/180/1400/600",
    trailer: "https://www.youtube.com/embed/3X3vQ9t4W3U",
    trailer_id: "3X3vQ9t4W3U",
    synopsis: "Denji, a young man with a chainsaw devil, joins the Public Safety Devil Hunters to pay off his debts.",
    trending: true,
    top_rated: false
  },
  {
    id: 8,
    title: "My Hero Academia",
    title_jp: "僕のヒーローアカデミア",
    year: 2023,
    episodes: 25,
    score: 8.3,
    rating: "TV-14",
    type: "TV",
    genres: ["Action", "Superhero", "School"],
    poster: "https://picsum.photos/id/133/300/450",
    banner: "https://picsum.photos/id/133/1400/600",
    trailer: "https://www.youtube.com/embed/9F7Y6f9zL2I",
    trailer_id: "9F7Y6f9zL2I",
    synopsis: "In a world where 80% of the population has superpowers, Izuku Midoriya trains to become the greatest hero.",
    trending: false,
    top_rated: true
  },
  {
    id: 9,
    title: "Death Note",
    title_jp: "デスノート",
    year: 2006,
    episodes: 37,
    score: 8.9,
    rating: "TV-14",
    type: "TV",
    genres: ["Mystery", "Psychological", "Thriller"],
    poster: "https://picsum.photos/id/1074/300/450",
    banner: "https://picsum.photos/id/1074/1400/600",
    trailer: "https://www.youtube.com/embed/g4f8m5q7v3Q",
    trailer_id: "g4f8m5q7v3Q",
    synopsis: "A brilliant student discovers a notebook that can kill anyone whose name is written in it.",
    trending: false,
    top_rated: true
  },
  {
    id: 10,
    title: "Fullmetal Alchemist: Brotherhood",
    title_jp: "鋼の錬金術師",
    year: 2009,
    episodes: 64,
    score: 9.4,
    rating: "TV-14",
    type: "TV",
    genres: ["Action", "Adventure", "Drama"],
    poster: "https://picsum.photos/id/106/300/450",
    banner: "https://picsum.photos/id/106/1400/600",
    trailer: "https://www.youtube.com/embed/2i2khp7v8hQ",
    trailer_id: "2i2khp7v8hQ",
    synopsis: "Two brothers use alchemy in a quest to restore their bodies after a failed transmutation.",
    trending: false,
    top_rated: true
  },
  {
    id: 11,
    title: "Naruto Shippuden",
    title_jp: "ナルト疾風伝",
    year: 2009,
    episodes: 500,
    score: 8.7,
    rating: "TV-14",
    type: "TV",
    genres: ["Action", "Adventure", "Martial Arts"],
    poster: "https://picsum.photos/id/1009/300/450",
    banner: "https://picsum.photos/id/1009/1400/600",
    trailer: "https://www.youtube.com/embed/9L8m4jN2v5Q",
    trailer_id: "9L8m4jN2v5Q",
    synopsis: "Naruto Uzumaki continues his journey to become the greatest ninja and protect his village.",
    trending: true,
    top_rated: false
  },
  {
    id: 12,
    title: "Bleach: Thousand-Year Blood War",
    title_jp: "BLEACH 千年血戦篇",
    year: 2022,
    episodes: 26,
    score: 8.8,
    rating: "TV-MA",
    type: "TV",
    genres: ["Action", "Supernatural", "Adventure"],
    poster: "https://picsum.photos/id/1033/300/450",
    banner: "https://picsum.photos/id/1033/1400/600",
    trailer: "https://www.youtube.com/embed/8K3N7v6m4pQ",
    trailer_id: "8K3N7v6m4pQ",
    synopsis: "Ichigo Kurosaki faces the most powerful enemy yet in the final arc of the Bleach saga.",
    trending: true,
    top_rated: true
  },
  {
    id: 13,
    title: "Hunter x Hunter (2011)",
    title_jp: "ハンター×ハンター",
    year: 2011,
    episodes: 148,
    score: 9.0,
    rating: "TV-14",
    type: "TV",
    genres: ["Adventure", "Action", "Fantasy"],
    poster: "https://picsum.photos/id/251/300/450",
    banner: "https://picsum.photos/id/251/1400/600",
    trailer: "https://www.youtube.com/embed/3K6mJ3a9mM4",
    trailer_id: "3K6mJ3a9mM4",
    synopsis: "Gon Freecss sets out to become a Hunter and find his father.",
    trending: false,
    top_rated: true
  },
  {
    id: 14,
    title: "Vinland Saga",
    title_jp: "ヴィンランド・サガ",
    year: 2023,
    episodes: 24,
    score: 8.8,
    rating: "TV-MA",
    type: "TV",
    genres: ["Action", "Adventure", "Historical"],
    poster: "https://picsum.photos/id/160/300/450",
    banner: "https://picsum.photos/id/160/1400/600",
    trailer: "https://www.youtube.com/embed/4A_X-Dvl0ws",
    trailer_id: "4A_X-Dvl0ws",
    synopsis: "Thorfin's quest for revenge in the Viking age and journey to Vinland.",
    trending: true,
    top_rated: true
  },
  {
    id: 15,
    title: "Frieren: Beyond Journey's End",
    title_jp: "葬送のフリーレン",
    year: 2023,
    episodes: 28,
    score: 9.2,
    rating: "TV-14",
    type: "TV",
    genres: ["Fantasy", "Adventure", "Drama"],
    poster: "https://picsum.photos/id/201/300/450",
    banner: "https://picsum.photos/id/201/1400/600",
    trailer: "https://www.youtube.com/embed/VQGCKyvzIM4",
    trailer_id: "VQGCKyvzIM4",
    synopsis: "An immortal elf mage reflects on life and friendship after the death of her companions.",
    trending: true,
    top_rated: true
  }
];

// ==================== STATE ====================
let myList = JSON.parse(localStorage.getItem('aniflix_mylist') || '[]');
let currentFilter = 'all';
let currentSearch = '';

// ==================== UTILS ====================
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function saveMyList() {
  localStorage.setItem('aniflix_mylist', JSON.stringify(myList));
}

function isInMyList(id) {
  return myList.some(item => item.id === id);
}

function toggleMyList(anime, sourceBtn = null) {
  const exists = myList.findIndex(item => item.id === anime.id);
  
  if (exists !== -1) {
    myList.splice(exists, 1);
    showToast(`"${anime.title}" removed from My List`);
  } else {
    myList.unshift({
      id: anime.id,
      title: anime.title,
      poster: anime.poster,
      year: anime.year,
      score: anime.score,
      episodes: anime.episodes
    });
    showToast(`"${anime.title}" added to My List ❤️`);
  }
  
  saveMyList();
  renderMyList();
  
  // Update any buttons on the page
  updateListButtons(anime.id);
}

function updateListButtons(animeId) {
  // Update all buttons that match this anime
  document.querySelectorAll(`[data-anime-id="${animeId}"]`).forEach(btn => {
    const inList = isInMyList(animeId);
    if (btn.id === 'heroListBtn' || btn.id === 'detailListBtn') {
      btn.innerHTML = inList ? '✓ In My List' : '+ My List';
      btn.style.background = inList ? '#22c55e' : '';
    }
  });
}

// ==================== RENDER CARDS ====================
function createAnimeCard(anime, isGrid = false) {
  const card = document.createElement('div');
  card.className = `anime-card ${isGrid ? 'grid-card' : ''}`;
  card.dataset.id = anime.id;

  const inList = isInMyList(anime.id);

  card.innerHTML = `
    <div class="poster-container">
      <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
      
      <!-- GLOWING PLAY BUTTON -->
      <button class="play-btn" data-trailer="${anime.trailer_id}" data-title="${anime.title}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
      
      <div class="card-overlay">
        <div class="card-title">${anime.title}</div>
        <div class="card-meta">
          <span class="card-score">★ ${anime.score}</span>
          <span>${anime.year}</span>
        </div>
      </div>
    </div>
  `;

  // Click on card opens detail modal
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.play-btn')) {
      openDetailModal(anime);
    }
  });

  // Play button opens trailer popup
  const playBtn = card.querySelector('.play-btn');
  playBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    openTrailerModal(anime);
  });

  return card;
}

// ==================== HERO ====================
function setHero(anime) {
  const heroBg = document.getElementById('heroBg');
  const heroTitle = document.getElementById('heroTitle');
  const heroDesc = document.getElementById('heroDesc');
  const heroPlay = document.getElementById('heroPlayBtn');
  const heroInfo = document.getElementById('heroInfoBtn');
  const heroList = document.getElementById('heroListBtn');

  heroBg.style.backgroundImage = `url('${anime.banner}')`;
  heroTitle.textContent = anime.title;
  heroDesc.textContent = anime.synopsis;

  // Update meta
  const metaContainer = document.querySelector('.hero-meta');
  metaContainer.innerHTML = `
    <span class="meta-score">★ ${anime.score}</span>
    <span class="meta-year">${anime.year}</span>
    <span class="meta-ep">${anime.episodes} Episodes</span>
    <span class="meta-rating">${anime.rating}</span>
  `;

  // Play trailer button
  heroPlay.onclick = () => openTrailerModal(anime);

  // More info
  heroInfo.onclick = () => openDetailModal(anime);

  // My List button
  const updateHeroListBtn = () => {
    const inList = isInMyList(anime.id);
    heroList.innerHTML = inList ? '✓ In My List' : '+ My List';
    heroList.style.background = inList ? '#22c55e' : '';
    heroList.style.borderColor = inList ? '#22c55e' : '';
  };
  updateHeroListBtn();

  heroList.onclick = () => {
    toggleMyList(anime);
    updateHeroListBtn();
  };

  // Store current hero anime
  window.currentHeroAnime = anime;
}

// ==================== FILTER CHIPS ====================
function renderFilterChips() {
  const container = document.getElementById('filterChips');
  container.innerHTML = '';

  const allGenres = new Set();
  ANIME_DATA.forEach(anime => anime.genres.forEach(g => allGenres.add(g)));

  // All chip
  const allChip = document.createElement('div');
  allChip.className = `chip ${currentFilter === 'all' ? 'active' : ''}`;
  allChip.textContent = 'All';
  allChip.onclick = () => {
    currentFilter = 'all';
    currentSearch = '';
    document.getElementById('searchInput').value = '';
    renderAllSections();
  };
  container.appendChild(allChip);

  // Genre chips
  Array.from(allGenres).forEach(genre => {
    const chip = document.createElement('div');
    chip.className = `chip ${currentFilter === genre ? 'active' : ''}`;
    chip.textContent = genre;
    chip.onclick = () => {
      currentFilter = genre;
      currentSearch = '';
      document.getElementById('searchInput').value = '';
      renderAllSections();
    };
    container.appendChild(chip);
  });
}

// ==================== RENDER SECTIONS ====================
function filterAnime(list) {
  let result = list;

  // Apply filter
  if (currentFilter !== 'all') {
    result = result.filter(anime => anime.genres.includes(currentFilter));
  }

  // Apply search
  if (currentSearch.length > 1) {
    const q = currentSearch.toLowerCase();
    result = result.filter(anime =>
      anime.title.toLowerCase().includes(q) ||
      anime.title_jp.toLowerCase().includes(q) ||
      anime.genres.join(' ').toLowerCase().includes(q)
    );
  }

  return result;
}

function renderTrending() {
  const container = document.getElementById('trendingRow');
  container.innerHTML = '';
  
  const filtered = filterAnime(ANIME_DATA.filter(a => a.trending));
  
  if (filtered.length === 0) {
    container.innerHTML = '<p style="padding:20px;color:#666">No trending titles match your filter.</p>';
    return;
  }
  
  filtered.forEach(anime => {
    container.appendChild(createAnimeCard(anime));
  });
}

function renderTopRated() {
  const container = document.getElementById('topRatedRow');
  container.innerHTML = '';
  
  const filtered = filterAnime(ANIME_DATA.filter(a => a.top_rated));
  
  if (filtered.length === 0) {
    container.innerHTML = '<p style="padding:20px;color:#666">No top rated titles match your filter.</p>';
    return;
  }
  
  filtered.forEach(anime => {
    container.appendChild(createAnimeCard(anime));
  });
}

function renderBrowseGrid() {
  const container = document.getElementById('animeGrid');
  container.innerHTML = '';
  
  const filtered = filterAnime(ANIME_DATA);
  const countEl = document.getElementById('resultsCount');
  
  countEl.textContent = `Showing ${filtered.length} titles`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;padding:60px 20px;text-align:center;color:#666">
        No anime found matching your search or filter.
      </div>
    `;
    return;
  }

  filtered.forEach(anime => {
    container.appendChild(createAnimeCard(anime, true));
  });
}

function renderMyList() {
  const container = document.getElementById('myListRow');
  const empty = document.getElementById('myListEmpty');
  
  container.innerHTML = '';
  
  if (myList.length === 0) {
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  
  myList.forEach(saved => {
    // Find full anime data
    const fullAnime = ANIME_DATA.find(a => a.id === saved.id) || saved;
    
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <div class="poster-container">
        <img src="${fullAnime.poster || saved.poster}" alt="${fullAnime.title || saved.title}" loading="lazy">
        <button class="play-btn" data-trailer="${fullAnime.trailer_id || ''}" data-title="${fullAnime.title || saved.title}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="card-overlay">
          <div class="card-title">${fullAnime.title || saved.title}</div>
          <div class="card-meta">
            <span class="card-score">★ ${fullAnime.score || saved.score}</span>
            <span>${fullAnime.year || saved.year}</span>
          </div>
        </div>
      </div>
    `;
    
    // Click card
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.play-btn')) {
        const full = ANIME_DATA.find(a => a.id === saved.id);
        if (full) openDetailModal(full);
      }
    });
    
    // Play button
    const playBtn = card.querySelector('.play-btn');
    if (playBtn && fullAnime.trailer_id) {
      playBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        openTrailerModal(fullAnime);
      });
    }
    
    container.appendChild(card);
  });
}

// ==================== TRAILER POPUP ====================
function openTrailerModal(anime) {
  const modal = document.getElementById('trailerModal');
  const iframe = document.getElementById('trailerIframe');
  const titleEl = document.getElementById('trailerTitle');
  
  titleEl.textContent = `${anime.title} — Official Trailer`;
  
  // Use YouTube embed
  iframe.src = `https://www.youtube.com/embed/${anime.trailer_id}?autoplay=1&rel=0&modestbranding=1`;
  
  modal.style.display = 'flex';
  modal.classList.add('active');
  
  // Close handlers
  const close = () => {
    modal.style.display = 'none';
    modal.classList.remove('active');
    iframe.src = ''; // stop video
  };
  
  document.getElementById('closeTrailer').onclick = close;
  document.getElementById('closeTrailerBtn').onclick = close;
  
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

// ==================== DETAIL MODAL ====================
function openDetailModal(anime) {
  const modal = document.getElementById('detailModal');
  const hero = document.getElementById('detailHero');
  const titleEl = document.getElementById('detailTitle');
  const metaEl = document.getElementById('detailMeta');
  const genresEl = document.getElementById('detailGenres');
  const synopsisEl = document.getElementById('detailSynopsis');
  const playBtn = document.getElementById('detailPlayBtn');
  const listBtn = document.getElementById('detailListBtn');

  // Set hero banner
  hero.style.backgroundImage = `url('${anime.banner}')`;
  
  titleEl.textContent = anime.title;
  
  metaEl.innerHTML = `
    <span>★ ${anime.score}</span>
    <span>${anime.year}</span>
    <span>${anime.episodes} Episodes</span>
    <span>${anime.rating}</span>
    <span>${anime.type}</span>
  `;
  
  // Genres
  genresEl.innerHTML = '';
  anime.genres.forEach(genre => {
    const tag = document.createElement('span');
    tag.className = 'genre-tag';
    tag.textContent = genre;
    genresEl.appendChild(tag);
  });
  
  synopsisEl.textContent = anime.synopsis;
  
  // Play trailer
  playBtn.onclick = () => {
    closeDetailModal();
    setTimeout(() => openTrailerModal(anime), 300);
  };
  
  // My List button
  const updateListBtn = () => {
    const inList = isInMyList(anime.id);
    listBtn.innerHTML = inList ? '✓ In My List' : '+ My List';
    listBtn.style.background = inList ? '#22c55e' : '';
  };
  updateListBtn();
  
  listBtn.onclick = () => {
    toggleMyList(anime);
    updateListBtn();
  };
  
  // Show modal
  modal.style.display = 'flex';
  modal.classList.add('active');
  
  // Close handlers
  const close = () => {
    modal.style.display = 'none';
    modal.classList.remove('active');
  };
  
  document.getElementById('closeDetail').onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  modal.style.display = 'none';
  modal.classList.remove('active');
}

// ==================== SEARCH ====================
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    renderAllSections();
  });
  
  // Allow Enter to focus results
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && currentSearch.length > 1) {
      document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// ==================== MAIN RENDER ====================
function renderAllSections() {
  renderTrending();
  renderTopRated();
  renderBrowseGrid();
  renderMyList();
  renderFilterChips();
}

// ==================== INITIALIZE ====================
function initialize() {
  // Set initial hero (first trending)
  const heroAnime = ANIME_DATA.find(a => a.trending) || ANIME_DATA[0];
  setHero(heroAnime);
  
  // Render everything
  renderFilterChips();
  renderAllSections();
  
  // Setup search
  setupSearch();
  
  // Profile button
  document.getElementById('profileBtn').addEventListener('click', () => {
    showToast('Profile settings coming soon in ANIFLIX Premium!');
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName === 'BODY') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => {
        m.style.display = 'none';
        m.classList.remove('active');
      });
      // Stop any playing trailer
      const iframe = document.getElementById('trailerIframe');
      if (iframe) iframe.src = '';
    }
  });
  
  // Initial toast
  setTimeout(() => {
    // showToast('Welcome to ANIFLIX — Premium Dark Anime Experience');
  }, 1200);
  
  console.log('%c[ANIFLIX] Premium dark anime site initialized with local data.', 'color:#666');
}

// Boot
initialize();