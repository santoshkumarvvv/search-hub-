/* =====================================================
   Kitsu — Hindi Anime Hub · script.js
   Data: Jikan API v4 (https://docs.api.jikan.moe)
   - Trending / Popular / Top Rated rows
   - Genre filter + paginated browse
   - Debounced live search
   - Detail modal + YouTube trailer
   - Watchlist (localStorage)
   ===================================================== */

'use strict';

const API = 'https://api.jikan.moe/v4';
const LS_KEY = 'kitsu_watchlist_v1';
const REQUEST_GAP_MS = 420; // Jikan rate limit: ~3 req/sec — queue से safe रहते हैं

/* ---------- State ---------- */
const animeCache = new Map();          // mal_id -> anime object (modal reuse)
let heroAnime = null;
let watchlist = loadWatchlist();
let browse = { genreId: 0, genreName: '', page: 1, hasNext: true, busy: false };
let searchController = null;
let searchTimer = null;

/* ---------- DOM shortcuts ---------- */
const $ = (sel) => document.querySelector(sel);
const heroBg = $('#heroBg');
const heroTitle = $('#heroTitle');
const heroMeta = $('#heroMeta');
const heroDesc = $('#heroDesc');
const trendingRow = $('#trendingRow');
const popularRow = $('#popularRow');
const topRatedRow = $('#topRatedRow');
const genreChips = $('#genreChips');
const browseGrid = $('#browseGrid');
const browseTitle = $('#browseTitle');
const loadMoreBtn = $('#loadMore');
const searchSection = $('#searchSection');
const searchTitle = $('#searchTitle');
const searchGrid = $('#searchGrid');
const toast = $('#toast');

/* =====================================================
   Utilities
   ===================================================== */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

/* Jikan rate-limit friendly queue — हर request के बीच gap */
const queue = (() => {
  let last = 0;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  return async function enqueue(fn) {
    const wait = Math.max(0, last + REQUEST_GAP_MS - Date.now());
    if (wait) await sleep(wait);
    last = Date.now();
    return fn();
  };
})();

/* fetch wrapper: timeout + 429 retry (एक बार) */
async function apiGet(path, { signal, retried } = {}) {
  return queue(async () => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
    try {
      const res = await fetch(API + path, { signal: ctrl.signal });
      if (res.status === 429 && !retried) {
        await new Promise((r) => setTimeout(r, 1600));
        return apiGet(path, { signal, retried: true });
      }
      if (!res.ok) throw new Error('API error: ' + res.status);
      const json = await res.json();
      return json;
    } finally {
      clearTimeout(timeout);
    }
  });
}

/* anime object को cache में रखो ताकि modal दोबारा fetch न करे */
function cacheAnime(a) {
  if (a && a.mal_id) animeCache.set(a.mal_id, a);
  return a;
}

function posterOf(a) {
  return a?.images?.jpg?.large_image_url || a?.images?.jpg?.image_url || '';
}

/* =====================================================
   Card rendering (DOM API — XSS safe)
   ===================================================== */

function buildCard(a) {
  cacheAnime(a);
  const card = el('article', 'card');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', a.title + ' — details खोलें');

  const poster = el('div', 'card-poster');
  const img = document.createElement('img');
  img.src = posterOf(a);
  img.alt = a.title + ' poster';
  img.loading = 'lazy';
  poster.append(img, el('span', 'hd', 'HD'));
  if (a.score) poster.append(el('span', 'score-badge', '★ ' + a.score.toFixed(1)));

  const body = el('div', 'card-body');
  body.append(el('h3', null, a.title_english || a.title));
  const meta = el('p');
  const eps = a.episodes ? a.episodes + ' Ep' : 'Ongoing';
  meta.append(Object.assign(el('b', null, '★ ' + (a.score ? a.score.toFixed(1) : 'N/A'))),
    document.createTextNode(' · ' + eps));
  body.append(meta);

  card.append(poster, body);
  card.addEventListener('click', () => openModal(a.mal_id));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(a.mal_id); }
  });
  return card;
}

function skelCards(n, fixed) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const c = el('div', 'skel-card' + (fixed ? ' fixed' : ''));
    c.append(el('div', 'sk-img'));
    const lines = el('div', 'sk-lines');
    lines.append(el('div', 'sk-line'), el('div', 'sk-line short'));
    c.append(lines);
    frag.append(c);
  }
  return frag;
}

function fillRow(rowEl, list) {
  rowEl.replaceChildren();
  list.forEach((a) => rowEl.append(buildCard(a)));
}

function emptyState(msg, icon) {
  const box = el('div', 'empty-state');
  box.append(el('span', 'big', icon || '🎬'), el('span', null, msg));
  return box;
}

/* =====================================================
   Hero (spotlight = trending #1)
   ===================================================== */

function setHero(a) {
  if (!a) return;
  heroAnime = a;
  cacheAnime(a);
  heroBg.style.backgroundImage = `url("${posterOf(a)}")`;
  heroTitle.textContent = a.title_english || a.title;
  heroMeta.replaceChildren();
  heroMeta.append(
    document.createTextNode('★ ' + (a.score ? a.score.toFixed(1) : 'N/A') + ' '),
    Object.assign(el('span', 'dim'),
      { textContent: `· ${a.year || 'New'} · ${a.episodes ? a.episodes + ' Episodes' : 'Airing'} · ${a.type || 'TV'}` })
  );
  heroDesc.textContent = truncate(a.synopsis, 260);
  updateWlButtons(a.mal_id);
}

$('#heroTrailer').addEventListener('click', () => { if (heroAnime) openModal(heroAnime.mal_id, { autoplayTrailer: true }); });
$('#heroWl').addEventListener('click', () => { if (heroAnime) toggleWatchlist(heroAnime.mal_id); });

/* =====================================================
   Home sections
   ===================================================== */

async function loadHome() {
  trendingRow.append(skelCards(8, true));
  popularRow.append(skelCards(8, true));
  topRatedRow.append(skelCards(8, true));

  try {
    const airing = await apiGet('/top/anime?filter=airing&limit=10&sfw=true');
    setHero(airing.data[0]);
    fillRow(trendingRow, airing.data);
  } catch { trendingRow.replaceChildren(emptyState('Trending लोड नहीं हो पाया 😢', '📡')); }

  try {
    const pop = await apiGet('/top/anime?filter=bypopularity&limit=10&sfw=true');
    fillRow(popularRow, pop.data);
  } catch { popularRow.replaceChildren(emptyState('Popular लोड नहीं हो पाया', '📡')); }

  try {
    const top = await apiGet('/top/anime?limit=10&sfw=true');
    fillRow(topRatedRow, top.data);
  } catch { topRatedRow.replaceChildren(emptyState('Top rated लोड नहीं हो पाया', '📡')); }
}

/* =====================================================
   Genres + Browse grid (pagination)
   ===================================================== */

async function loadGenres() {
  try {
    const res = await apiGet('/genres/anime');
    const list = res.data.slice(0, 16);
    const all = el('button', 'chip active', 'All');
    all.dataset.genre = '0';
    genreChips.append(all);
    list.forEach((g) => {
      const chip = el('button', 'chip', g.name);
      chip.dataset.genre = String(g.mal_id);
      chip.dataset.name = g.name;
      genreChips.append(chip);
    });
  } catch {
    genreChips.append(emptyState('Genres लोड नहीं हो पाए', '📡'));
  }
}

genreChips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  genreChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  browse.genreId = Number(chip.dataset.genre || 0);
  browse.genreName = chip.dataset.name || '';
  browse.page = 1;
  browse.hasNext = true;
  browseGrid.replaceChildren();
  browseTitle.textContent = browse.genreId ? `🎭 ${browse.genreName}` : '📺 Browse All';
  loadBrowse();
  $('#browse').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

async function loadBrowse() {
  if (browse.busy || !browse.hasNext) return;
  browse.busy = true;
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = 'लोड हो रहा है…';
  if (browse.page === 1) browseGrid.append(skelCards(9));

  const genrePart = browse.genreId ? `&genres=${browse.genreId}` : '';
  const path = `/anime?page=${browse.page}&limit=18&order_by=score&sort=desc&sfw=true${genrePart}`;

  try {
    const res = await apiGet(path);
    if (browse.page === 1) browseGrid.replaceChildren();
    (res.data || []).forEach((a) => browseGrid.append(buildCard(a)));
    browse.hasNext = Boolean(res.pagination && res.pagination.has_next_page);
    browse.page += 1;
    if (!browseGrid.children.length) browseGrid.append(emptyState('इस genre में कुछ नहीं मिला', '🕳️'));
  } catch {
    if (browse.page === 1) browseGrid.replaceChildren(emptyState('लोड नहीं हो पाया — दोबारा कोशिश करें', '📡'));
  } finally {
    browse.busy = false;
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'और दिखाओ ↓';
    loadMoreBtn.classList.toggle('hidden', !browse.hasNext);
  }
}

loadMoreBtn.addEventListener('click', loadBrowse);

/* =====================================================
   Search (debounced + abortable)
   ===================================================== */

function onSearchInput(e) {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  searchTimer = setTimeout(() => runSearch(q), 420);
}

async function runSearch(q) {
  if (searchController) searchController.abort();
  if (q.length < 2) {
    searchSection.classList.add('hidden');
    searchGrid.replaceChildren();
    return;
  }
  searchController = new AbortController();
  searchSection.classList.remove('hidden');
  searchTitle.textContent = `"${q}" के नतीजे`;
  searchGrid.replaceChildren(skelCards(6));
  searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const res = await apiGet(`/anime?q=${encodeURIComponent(q)}&limit=18&order_by=members&sort=desc&sfw=true`,
      { signal: searchController.signal });
    searchGrid.replaceChildren();
    if (!res.data || !res.data.length) {
      searchGrid.append(emptyState(`"${q}" का कोई नतीजा नहीं — कुछ और try करो`, '🔍'));
    } else {
      res.data.forEach((a) => searchGrid.append(buildCard(a)));
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      searchGrid.replaceChildren(emptyState('Search fail हो गया — thoda der बाद try करो', '📡'));
    }
  }
}

$('#searchInput').addEventListener('input', onSearchInput);
$('#searchInputM').addEventListener('input', onSearchInput);

/* =====================================================
   Watchlist (localStorage)
   ===================================================== */

function loadWatchlist() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveWatchlist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(watchlist)); } catch { /* storage full/blocked */ }
}

function inWatchlist(id) { return watchlist.some((w) => w.mal_id === id); }

function toggleWatchlist(id, sourceAnime) {
  const a = sourceAnime || animeCache.get(id) || watchlist.find((w) => w.mal_id === id);
  if (!a) return;
  if (inWatchlist(id)) {
    watchlist = watchlist.filter((w) => w.mal_id !== id);
    showToast(`"${truncate(a.title_english || a.title, 26)}" watchlist से हटाया ❌`);
  } else {
    watchlist.unshift({
      mal_id: a.mal_id,
      title: a.title_english || a.title,
      image: posterOf(a),
      score: a.score || null,
      episodes: a.episodes || null,
      type: a.type || 'TV',
    });
    showToast(`"${truncate(a.title_english || a.title, 26)}" watchlist में जुड़ा ❤️`);
  }
  saveWatchlist();
  renderWatchlist();
  updateWlButtons(id);
}

function updateWlButtons(id) {
  const saved = inWatchlist(id);
  if (heroAnime && heroAnime.mal_id === id) {
    $('#heroWl').textContent = saved ? '✓ Watchlist में है' : '+ Watchlist';
    $('#heroWl').classList.toggle('saved', saved);
  }
  const modalBtn = $('#modalWlBtn');
  if (modalBtn && Number(modalBtn.dataset.id) === id) {
    modalBtn.textContent = saved ? '✓ Watchlist में है' : '+ Watchlist';
    modalBtn.classList.toggle('saved', saved);
  }
}

function renderWatchlist() {
  $('#wlCount').textContent = watchlist.length;
  const list = $('#drawerList');
  list.replaceChildren();
  if (!watchlist.length) {
    const empty = el('div', 'wl-empty');
    empty.append(el('span', 'big', '🍿'), el('span', null, 'Watchlist खाली है — कोई card खोलो और "+ Watchlist" दबाओ'));
    list.append(empty);
    return;
  }
  watchlist.forEach((w) => {
    const item = el('div', 'wl-item');
    const thumb = el('div', 'wl-item-thumb');
    const img = document.createElement('img');
    img.src = w.image; img.alt = w.title; img.loading = 'lazy';
    thumb.append(img);
    thumb.addEventListener('click', () => { closeDrawer(); openModal(w.mal_id); });
    const info = el('div', 'wl-item-info');
    info.append(el('h4', null, w.title));
    const meta = el('p');
    meta.append(Object.assign(el('b', null, '★ ' + (w.score ? Number(w.score).toFixed(1) : 'N/A'))),
      document.createTextNode(` · ${w.episodes ? w.episodes + ' Ep' : 'Ongoing'} · ${w.type}`));
    info.append(meta);
    info.addEventListener('click', () => { closeDrawer(); openModal(w.mal_id); });
    const rm = el('button', 'icon-btn wl-remove', '🗑');
    rm.setAttribute('aria-label', w.title + ' हटाएं');
    rm.addEventListener('click', () => toggleWatchlist(w.mal_id));
    item.append(thumb, info, rm);
    list.append(item);
  });
}

/* ---------- Drawer open/close ---------- */
const drawer = $('#drawer');
const drawerOverlay = $('#drawerOverlay');
function openDrawer() { renderWatchlist(); drawer.classList.add('open'); drawerOverlay.classList.add('open'); }
function closeDrawer() { drawer.classList.remove('open'); drawerOverlay.classList.remove('open'); }
$('#watchlistBtn').addEventListener('click', openDrawer);
$('#drawerClose').addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

/* =====================================================
   Detail modal (+ trailer)
   ===================================================== */

const modalOverlay = $('#modalOverlay');
const modalBody = $('#modalBody');

async function openModal(id, { autoplayTrailer } = {}) {
  closeDrawer();
  document.body.style.overflow = 'hidden';
  modalOverlay.classList.remove('hidden');
  modalBody.replaceChildren(skelCards(1));

  let a = animeCache.get(id);
  if (!a || !a.synopsis) {
    try {
      const res = await apiGet(`/anime/${id}/full`);
      a = cacheAnime(res.data);
    } catch {
      a = watchlist.find((w) => w.mal_id === id) || null;
    }
  }
  if (!a) {
    modalBody.replaceChildren(emptyState('Details लोड नहीं हो पाए 😢', '📡'));
    return;
  }
  renderModal(a, autoplayTrailer);
}

function renderModal(a, autoplayTrailer) {
  const saved = inWatchlist(a.mal_id);
  modalBody.replaceChildren();

  const hero = el('div', 'modal-hero');
  const bg = document.createElement('img');
  bg.src = posterOf(a); bg.alt = a.title + ' banner';
  hero.append(bg, modalCloseBtnClone());

  const body = el('div', 'modal-body');
  body.append(el('h2', null, a.title_english || a.title));
  if (a.title_japanese) body.append(el('p', 'modal-jp', a.title_japanese));

  const meta = el('div', 'modal-meta');
  if (a.score) {
    const s = el('span');
    s.append(el('b', null, '★ ' + a.score.toFixed(1)));
    meta.append(s);
  }
  const bits = [
    a.year ? String(a.year) : (a.status || ''),
    a.episodes ? a.episodes + ' Episodes' : 'Airing',
    a.rating || '',
    a.rank ? 'Rank #' + a.rank : '',
  ].filter(Boolean);
  bits.forEach((b) => meta.append(el('span', null, b)));
  body.append(meta);

  const genres = [...(a.genres || []), ...(a.themes || [])].map((g) => g.name);
  if (genres.length) {
    const gWrap = el('div', 'modal-genres');
    genres.slice(0, 8).forEach((g) => gWrap.append(el('span', null, g)));
    body.append(gWrap);
  }

  body.append(el('p', 'modal-syn', a.synopsis || 'इस anime की जानकारी जल्द आएगी।'));

  const actions = el('div', 'modal-actions');
  const ytId = a.trailer && a.trailer.youtube_id;
  if (ytId) {
    const tBtn = el('button', 'btn primary', '▶ Trailer देखें');
    tBtn.addEventListener('click', () => playTrailer(ytId));
    actions.append(tBtn);
  }
  const wlBtn = el('button', 'btn ghost' + (saved ? ' saved' : ''), saved ? '✓ Watchlist में है' : '+ Watchlist');
  wlBtn.id = 'modalWlBtn';
  wlBtn.dataset.id = a.mal_id;
  wlBtn.addEventListener('click', () => toggleWatchlist(a.mal_id, a));
  actions.append(wlBtn);
  body.append(actions);

  const trailerBox = el('div', 'trailer-box');
  trailerBox.id = 'trailerBox';
  body.append(trailerBox);

  modalBody.append(hero, body);
  modalBody.parentElement.scrollTop = 0;

  if (autoplayTrailer && ytId) playTrailer(ytId);

  function playTrailer(yid) {
    trailerBox.replaceChildren();
    const wrap = el('div', 'frame-wrap');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${yid}?autoplay=1&rel=0`;
    iframe.title = a.title + ' trailer';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    wrap.append(iframe);
    trailerBox.append(wrap);
  }
}

/* modal close button (hero में overlay के लिए clone) */
function modalCloseBtnClone() {
  const btn = el('button', 'icon-btn modal-close', '✕');
  btn.setAttribute('aria-label', 'बंद करें');
  btn.style.top = '14px';
  btn.style.right = '54px';
  btn.addEventListener('click', closeModal);
  return btn;
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalBody.replaceChildren();           // iframe हटाओ → trailer sound बंद
  document.body.style.overflow = '';
}

$('#modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeDrawer(); $('#mobileMenu').classList.remove('open'); }
});

/* =====================================================
   Mobile menu
   ===================================================== */
$('#menuBtn').addEventListener('click', () => $('#mobileMenu').classList.toggle('open'));
$('#mobileMenu').addEventListener('click', (e) => {
  if (e.target.tagName === 'A') $('#mobileMenu').classList.remove('open');
});

/* =====================================================
   Boot
   ===================================================== */
renderWatchlist();
loadHome();
loadGenres();
loadBrowse();
