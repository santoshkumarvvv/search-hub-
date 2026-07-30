/* ============================================================
   AnimeHub v17 — SAFE BOOT / SELF-HEALING BUILD
   - NEVER a black screen: hardcoded fallback renders instantly
   - catalog.json fetched with timeout + catch; failure shows a
     visible error banner and uses embedded FALLBACK_CATALOG.
   - All DOM refs guarded; any error during boot is caught and
     surfaced to the user instead of throwing silently.
   ============================================================ */
(function () {
  'use strict';

  // ───────────── HARDCODED FALLBACK CATALOG ─────────────
  // Works 100% offline, no network needed.
  var FALLBACK_CATALOG = [
    {id:1,title:"Jujutsu Kaisen",year:2020,episodes:47,score:9.0,studio:"MAPPA",rating:"TV-14",genres:["Action","Supernatural"],poster:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg",banner:"https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",synopsis:"Yuji Itadori swallows a cursed finger to protect his friends and enters a world of curses and sorcerers.",trending:true,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:2,title:"Demon Slayer",year:2019,episodes:63,score:8.7,studio:"ufotable",rating:"TV-MA",genres:["Action","Adventure"],poster:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg",banner:"https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",synopsis:"Tanjiro joins the Demon Slayer Corps after his family is slaughtered and his sister turned into a demon.",trending:true,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:3,title:"Attack on Titan",year:2013,episodes:89,score:9.1,studio:"MAPPA",rating:"TV-MA",genres:["Action","Drama"],poster:"https://cdn.myanimelist.net/images/anime/10/47347.jpg",banner:"https://cdn.myanimelist.net/images/anime/10/47347l.jpg",synopsis:"Humanity fights for survival behind massive walls against man-eating Titans.",trending:true,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:5,title:"Solo Leveling",year:2024,episodes:12,score:8.9,studio:"A-1 Pictures",rating:"TV-14",genres:["Action","Fantasy"],poster:"https://cdn.myanimelist.net/images/anime/1926/140799.jpg",banner:"https://cdn.myanimelist.net/images/anime/1926/140799l.jpg",synopsis:"The weakest hunter, Sung Jin-Woo, gains a mysterious power that lets him level up beyond anyone else.",trending:true,newRelease:true,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:7,title:"Chainsaw Man",year:2022,episodes:12,score:8.6,studio:"MAPPA",rating:"TV-MA",genres:["Action","Horror"],poster:"https://cdn.myanimelist.net/images/anime/1806/126216.jpg",banner:"https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",synopsis:"Denji merges with his chainsaw-devil dog Pochita to become the Chainsaw Man.",trending:false,newRelease:true,hindi:true,langDubs:{hindi:false,english:true,japanese:true}},
    {id:21,title:"One Piece",year:1999,episodes:1100,score:9.2,studio:"Toei Animation",rating:"TV-14",genres:["Adventure","Action"],poster:"https://cdn.myanimelist.net/images/anime/6/73245.jpg",banner:"https://cdn.myanimelist.net/images/anime/6/73245l.jpg",synopsis:"Monkey D. Luffy and his pirate crew search for the ultimate treasure — the One Piece.",trending:true,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:5114,title:"Fullmetal Alchemist: Brotherhood",year:2009,episodes:64,score:9.1,studio:"Bones",rating:"TV-14",genres:["Action","Adventure","Drama"],poster:"https://cdn.myanimelist.net/images/anime/1223/96541.jpg",banner:"https://cdn.myanimelist.net/images/anime/1223/96541l.jpg",synopsis:"Two brothers use alchemy to restore their bodies after a forbidden transmutation goes wrong.",trending:false,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:1535,title:"Death Note",year:2006,episodes:37,score:8.6,studio:"Madhouse",rating:"TV-MA",genres:["Mystery","Thriller"],poster:"https://cdn.myanimelist.net/images/anime/9/9453.jpg",banner:"https://cdn.myanimelist.net/images/anime/9/9453l.jpg",synopsis:"A brilliant student discovers a notebook that kills anyone whose name is written in it.",trending:false,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:9253,title:"Steins;Gate",year:2011,episodes:24,score:9.1,studio:"White Fox",rating:"TV-14",genres:["Sci-Fi","Thriller"],poster:"https://cdn.myanimelist.net/images/anime/1935/127974.jpg",banner:"https://cdn.myanimelist.net/images/anime/1935/127974l.jpg",synopsis:"A self-proclaimed mad scientist accidentally invents time travel — and must undo its consequences.",trending:false,newRelease:false,hindi:false,langDubs:{hindi:false,english:true,japanese:true}},
    {id:30276,title:"One Punch Man",year:2015,episodes:24,score:8.5,studio:"Madhouse",rating:"TV-14",genres:["Action","Comedy"],poster:"https://cdn.myanimelist.net/images/anime/12/76049.jpg",banner:"https://cdn.myanimelist.net/images/anime/12/76049l.jpg",synopsis:"A hero so strong he defeats every opponent with a single punch struggles to find a worthy foe.",trending:false,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}},
    {id:11061,title:"Hunter x Hunter (2011)",year:2011,episodes:148,score:9.0,studio:"Madhouse",rating:"TV-14",genres:["Adventure","Action"],poster:"https://cdn.myanimelist.net/images/anime/1337/99053.jpg",banner:"https://cdn.myanimelist.net/images/anime/1337/99053l.jpg",synopsis:"Young Gon Freecss sets out to become a Hunter and find his legendary father.",trending:false,newRelease:false,hindi:false,langDubs:{hindi:false,english:true,japanese:true}},
    {id:269,title:"Bleach",year:2004,episodes:392,score:8.1,studio:"Pierrot",rating:"TV-14",genres:["Action","Supernatural"],poster:"https://cdn.myanimelist.net/images/anime/3/40451.jpg",banner:"https://cdn.myanimelist.net/images/anime/3/40451l.jpg",synopsis:"Ichigo Kurosaki gains Soul Reaper powers and must defend the living from Hollows.",trending:false,newRelease:false,hindi:true,langDubs:{hindi:true,english:true,japanese:true}}
  ];

  // ───────────── SAFE DOM BOOT ─────────────
  // Wrap every step in try/catch. If anything throws, the page stays usable.
  function $(id) { return document.getElementById(id); }
  function safe(fn, label) {
    try { return fn(); }
    catch (err) { console.error('[AnimeHub]', label || 'error', err); showStatus('err', 'Non-fatal error: ' + (err && err.message ? err.message : String(err))); return null; }
  }

  var grid, statusEl, statusText, statusSpin, countEl, searchEl, toastEl;
  var panel, panelBack, playerEl, playerPh, dTitle, dMeta, dSyn, actPlay, actSave, actShare, audioRow, epGrid, epCount, hero;

  var CATALOG = FALLBACK_CATALOG.slice();
  var filterText = '';
  var selected = null;
  var selectedEp = 1;
  var selectedLang = 'hindi';
  var usingFallback = true;
  var catalogLoadError = null;
  var _tt;

  // ───────────── STATUS / TOAST ─────────────
  function setStatus(kind, msg, spinning) {
    if (!statusEl) return;
    statusEl.className = 'status show ' + kind;
    if (statusText) statusText.textContent = msg;
    if (statusSpin) statusSpin.style.display = spinning ? '' : 'none';
    if (!spinning) {
      clearTimeout(statusEl._t);
      statusEl._t = setTimeout(function () { statusEl.classList.remove('show'); }, 4500);
    }
  }
  function showStatus(kind, msg) { setStatus(kind, msg, false); }
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(_tt);
    _tt = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  // ───────────── RENDERING ─────────────
  function initialsOf(title) {
    return (title || '??').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  function renderCard(a) {
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', a.id);
    var isHindi = !!(a.hindi || (a.langDubs && a.langDubs.hindi));
    var badge = isHindi ? '<span class="badge">HINDI</span>' : '<span class="badge sub">SUB</span>';
    var genres = (a.genres && a.genres.length) ? '<span class="tag">' + a.genres.slice(0, 2).join(' · ') + '</span>' : '';
    var score = a.score ? '<span class="score">★ ' + a.score.toFixed(1) + '</span>' : '';
    var poster = a.poster || '';
    var initials = initialsOf(a.title);
    card.innerHTML =
      '<div class="thumb">' +
        '<div class="ph">' + initials + '</div>' +
        (poster ? '<img alt="" loading="lazy" referrerpolicy="no-referrer" />' : '') +
        badge + score +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-title">' + escapeHtml(a.title || 'Untitled') + '</div>' +
        '<div class="card-meta">' +
          '<span>' + (a.year || '—') + '</span>' +
          '<span>·</span>' +
          '<span>' + (a.episodes || '?') + ' eps</span>' +
          (genres ? '<span>·</span>' + genres : '') +
        '</div>' +
      '</div>';

    var img = card.querySelector('img');
    if (img && poster) {
      img.onload = function () { img.classList.add('loaded'); };
      img.onerror = function () { img.remove(); }; // keep the initials placeholder
      img.src = poster;
    }
    card.addEventListener('click', function () { openDetail(a); });
    return card;
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';
    var q = (filterText || '').trim().toLowerCase();
    var list = CATALOG;
    if (q) {
      list = CATALOG.filter(function (a) {
        var hay = (a.title + ' ' + (a.studio || '') + ' ' + (a.genres || []).join(' ')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }
    if (countEl) countEl.textContent = list.length + ' title' + (list.length === 1 ? '' : 's') + (usingFallback ? ' · offline' : '');
    if (list.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<h2>No matches</h2><p>Try a different search term.</p>';
      grid.appendChild(empty);
      return;
    }
    var frag = document.createDocumentFragment();
    list.forEach(function (a) { frag.appendChild(renderCard(a)); });
    grid.appendChild(frag);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // ───────────── DETAIL PANEL ─────────────
  function openDetail(a) {
    selected = a;
    selectedEp = 1;
    // pick first available language
    if (a.langDubs) {
      if (a.langDubs[selectedLang]) { /* keep */ }
      else if (a.langDubs.english) selectedLang = 'english';
      else selectedLang = 'japanese';
    } else {
      selectedLang = a.hindi ? 'hindi' : 'japanese';
    }

    if (dTitle) dTitle.textContent = a.title;
    if (dSyn) dSyn.textContent = a.synopsis || 'No synopsis available.';
    if (dMeta) {
      var parts = [];
      if (a.score) parts.push('<span class="star">★ ' + a.score.toFixed(1) + '</span>');
      if (a.year) parts.push(String(a.year));
      if (a.rating) parts.push(a.rating);
      if (a.studio) parts.push(a.studio);
      if (a.episodes) parts.push(a.episodes + ' episodes');
      if (a.genres && a.genres.length) parts.push(a.genres.slice(0, 4).map(function (g) { return '<span class="tag">' + escapeHtml(g) + '</span>'; }).join(' '));
      dMeta.innerHTML = parts.join(' <span style="opacity:.4">|</span> ');
    }
    if (hero) {
      hero.innerHTML = a.banner ? '<img alt="" referrerpolicy="no-referrer" />' : '';
      var himg = hero.querySelector('img');
      if (himg) { himg.onerror = function () { himg.remove(); }; himg.src = a.banner; }
    }
    renderAudio();
    renderEpisodes();
    renderPlayer();
    updateSaveBtn();
    if (panel) { panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); }
    document.body.style.overflow = 'hidden';
  }
  function closeDetail() {
    selected = null;
    if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
    document.body.style.overflow = '';
    if (playerEl) {
      // remove any iframe
      var ifr = playerEl.querySelector('iframe');
      if (ifr) ifr.remove();
      if (playerPh) playerPh.style.display = '';
    }
  }
  function renderAudio() {
    if (!audioRow || !selected) return;
    audioRow.innerHTML = '';
    var langs = [
      { k: 'hindi', label: 'Hindi' },
      { k: 'english', label: 'English' },
      { k: 'tamil', label: 'Tamil' },
      { k: 'telugu', label: 'Telugu' },
      { k: 'japanese', label: 'Japanese (Sub)' }
    ];
    langs.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'audio-btn' + (selectedLang === l.k ? ' active' : '');
      var supported = selected.langDubs ? !!selected.langDubs[l.k] : (l.k === 'japanese' ? true : !!selected.hindi);
      if (l.k === 'japanese') supported = true; // always supported (sub fallback)
      if (!supported) b.disabled = true;
      b.textContent = l.label;
      b.addEventListener('click', function () {
        selectedLang = l.k;
        renderAudio();
        renderPlayer();
        toast('Audio: ' + l.label);
      });
      audioRow.appendChild(b);
    });
  }
  function renderEpisodes() {
    if (!epGrid || !epCount || !selected) return;
    epGrid.innerHTML = '';
    var n = selected.episodes || 12;
    epCount.textContent = n + ' total';
    var frag = document.createDocumentFragment();
    var cap = Math.min(n, 60); // cap to keep UI snappy
    for (var i = 1; i <= cap; i++) {
      (function (ep) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'ep-chip' + (selectedEp === ep ? ' active' : '');
        c.textContent = String(ep).padStart(2, '0');
        c.addEventListener('click', function () { selectedEp = ep; renderEpisodes(); renderPlayer(); });
        frag.appendChild(c);
      })(i);
    }
    epGrid.appendChild(frag);
    if (n > cap) {
      var more = document.createElement('div');
      more.className = 'ep-chip';
      more.style.cursor = 'default';
      more.textContent = '+' + (n - cap) + ' more';
      epGrid.appendChild(more);
    }
  }
  function renderPlayer() {
    if (!playerEl || !selected) return;
    if (playerPh) playerPh.style.display = 'none';

    // Remove existing iframe
    var prev = playerEl.querySelector('iframe');
    if (prev) prev.remove();

    var langLabel = ({hindi:'Hindi',english:'English',tamil:'Tamil',telugu:'Telugu',japanese:'Japanese'})[selectedLang] || 'Japanese';
    var note = document.createElement('div');
    note.className = 'ph';
    note.style.position = 'absolute';
    note.style.inset = '0';
    note.style.background = 'rgba(15,23,42,.75)';
    note.innerHTML = '<b>▶ EP ' + String(selectedEp).padStart(2, '0') + ' · ' + langLabel + '</b>' +
                     '<span style="color:#94a3b8;font-size:11px">' + escapeHtml(selected.title) + '</span>' +
                     '<button class="pill primary" id="__play" style="margin-top:10px;pointer-events:auto">▶ Open embed</button>';
    playerEl.appendChild(note);
    var playBtn = note.querySelector('#__play');
    playBtn.addEventListener('click', function () { loadEmbed(); });

    // auto-load embed after short delay for ep1 (no autoplay, user gesture-friendly)
  }
  function loadEmbed() {
    if (!playerEl || !selected) return;
    var note = playerEl.querySelector('.ph');
    if (note) note.innerHTML = '<b>Loading embed…</b><span style="color:#94a3b8;font-size:11px">If blocked, tap ▶ in the player.</span>';
    var ifr = document.createElement('iframe');
    ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    ifr.allowFullscreen = true;
    ifr.referrerPolicy = 'no-referrer';
    // Use a safe YouTube embed as ultimate fallback (anime-related trailers/AMVs by id rotation)
    var yt = ['4A_X-Dvl0ws', 'VQGCKyvzIM4', 'MGRm4IzK1SQ', '2W0g1o7k1zI', 'jUwRQ9rDFW8'];
    var pick = yt[Math.abs(selected.id * 7 + selectedEp * 3) % yt.length];
    ifr.src = 'https://www.youtube-nocookie.com/embed/' + pick + '?rel=0';
    playerEl.appendChild(ifr);
    ifr.addEventListener('load', function () { if (note) note.style.display = 'none'; });
  }

  // ───────────── SAVE / SHARE (localStorage wrapped) ─────────────
  var U = (function () {
    var k = 'ah_safeboot_v17';
    var d = { saved: [] };
    try {
      var raw = localStorage.getItem(k);
      if (raw) d = JSON.parse(raw) || d;
      if (!d.saved) d.saved = [];
    } catch (e) { /* ignore */ }
    function save() { try { localStorage.setItem(k, JSON.stringify(d)); } catch (e) {} }
    return {
      isSaved: function (id) { return d.saved.some(function (x) { return x.id === id; }); },
      toggle: function (a) {
        var i = d.saved.findIndex(function (x) { return x.id === a.id; });
        if (i >= 0) { d.saved.splice(i, 1); save(); return false; }
        d.saved.unshift({ id: a.id, title: a.title, poster: a.poster, ts: Date.now() });
        save(); return true;
      }
    };
  })();
  function updateSaveBtn() {
    if (!actSave || !selected) return;
    var saved = U.isSaved(selected.id);
    actSave.textContent = saved ? '✓ Saved' : '＋ Save';
  }

  // ───────────── EVENTS ─────────────
  function bindEvents() {
    if (panelBack) panelBack.addEventListener('click', closeDetail);
    if (panel) panel.addEventListener('click', function (e) { if (e.target === panel) closeDetail(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && selected) closeDetail(); });

    if (actPlay) actPlay.addEventListener('click', function () {
      if (!selected) return;
      if (!playerEl.querySelector('iframe')) loadEmbed();
    });
    if (actSave) actSave.addEventListener('click', function () {
      if (!selected) return;
      var added = U.toggle(selected);
      toast(added ? 'Added to My List ❤' : 'Removed from My List');
      updateSaveBtn();
    });
    if (actShare) actShare.addEventListener('click', function () {
      if (!selected) return;
      var url = window.location.href.split('#')[0] + '#anime=' + selected.id;
      try { window.history.replaceState(null, '', url); } catch (e) {}
      if (navigator.share) {
        navigator.share({ title: selected.title, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { toast('Link copied!'); }).catch(function () { toast(url); });
      } else {
        toast(url);
      }
    });
    if (searchEl) {
      var _d;
      searchEl.addEventListener('input', function () {
        clearTimeout(_d);
        _d = setTimeout(function () { filterText = searchEl.value; renderGrid(); }, 120);
      });
    }
  }

  // ───────────── CATALOG LOAD (with timeout + fallback) ─────────────
  function fetchCatalog() {
    return new Promise(function (resolve) {
      var to = setTimeout(function () { resolve({ ok: false, reason: 'timeout', data: null }); }, 4000);
      fetch('./catalog.json', { cache: 'no-cache' })
        .then(function (r) {
          clearTimeout(to);
          if (!r.ok) return resolve({ ok: false, reason: 'http_' + r.status, data: null });
          return r.json().then(function (j) {
            // accept either an array or {results:[...]} shape
            var arr = null;
            if (Array.isArray(j)) arr = j;
            else if (j && Array.isArray(j.results)) arr = j.results;
            else if (j && Array.isArray(j.data)) arr = j.data;
            else if (j && Array.isArray(j.anime)) arr = j.anime;
            else if (j && Array.isArray(j.items)) arr = j.items;
            if (arr && arr.length) resolve({ ok: true, data: arr });
            else resolve({ ok: false, reason: 'empty', data: null });
          }).catch(function (e) {
            clearTimeout(to);
            resolve({ ok: false, reason: 'parse:' + (e && e.message), data: null });
          });
        })
        .catch(function (e) {
          clearTimeout(to);
          resolve({ ok: false, reason: 'network:' + (e && e.message), data: null });
        });
    });
  }

  function normalizeItems(arr) {
    return (arr || []).map(function (it) {
      var langs = it.langDubs || it.langs || {};
      return {
        id: it.id != null ? it.id : (it.mal_id || Math.floor(Math.random() * 1e9)),
        title: it.title || it.name || 'Untitled',
        year: it.year || (it.aired && it.aired.from ? new Date(it.aired.from).getFullYear() : null),
        episodes: it.episodes || 12,
        score: typeof it.score === 'number' ? it.score : null,
        studio: it.studio || (it.studios && it.studios[0] && it.studios[0].name) || '',
        rating: it.rating || 'TV-14',
        genres: it.genres ? it.genres.map(function (g) { return typeof g === 'string' ? g : (g.name || ''); }).filter(Boolean) : [],
        poster: it.poster || (it.images && it.images.jpg && (it.images.jpg.large_image_url || it.images.jpg.image_url)) || '',
        banner: it.banner || (it.images && it.images.jpg && it.images.jpg.large_image_url) || '',
        synopsis: it.synopsis || '',
        trending: !!it.trending,
        newRelease: !!it.newRelease,
        hindi: !!it.hindi || !!langs.hindi,
        langDubs: langs
      };
    });
  }

  function boot() {
    // grab DOM
    grid = $('grid'); statusEl = $('status'); statusText = $('statusText'); statusSpin = $('statusSpin');
    countEl = $('count'); searchEl = $('search'); toastEl = $('toast');
    panel = $('panel'); panelBack = $('panelBack'); playerEl = $('player'); playerPh = $('playerPh');
    dTitle = $('dTitle'); dMeta = $('dMeta'); dSyn = $('dSyn');
    actPlay = $('actPlay'); actSave = $('actSave'); actShare = $('actShare');
    audioRow = $('audioRow'); epGrid = $('epGrid'); epCount = $('epCount'); hero = $('hero');

    // 1) INSTANT render of fallback catalog so NO BLACK SCREEN ever
    renderGrid();
    setStatus('warn', 'Rendering offline catalog…', true);

    bindEvents();

    // 2) Try to fetch catalog.json in the background
    fetchCatalog().then(function (res) {
      if (res.ok && res.data && res.data.length) {
        var norm = normalizeItems(res.data);
        if (norm.length) {
          CATALOG = norm;
          usingFallback = false;
          catalogLoadError = null;
          renderGrid();
          setStatus('ok', 'Loaded ' + norm.length + ' titles from catalog', false);
          return;
        }
      }
      // failed -> keep fallback, show visible error
      usingFallback = true;
      catalogLoadError = res.reason || 'unknown';
      CATALOG = FALLBACK_CATALOG.slice();
      renderGrid();
      setStatus('err', 'Could not load catalog.json (' + catalogLoadError + ') — showing built-in sample titles.', false);
    });
  }

  // Boot immediately after DOM is parsed (script is defer'd so DOM is ready).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { safe(boot, 'boot'); });
  } else {
    safe(boot, 'boot');
  }

  // Last-resort global error handler: ensure status bar shows something useful
  window.addEventListener('error', function (e) {
    showStatus('err', 'Script error: ' + (e.message || 'unknown'));
  });
  window.addEventListener('unhandledrejection', function (e) {
    showStatus('err', 'Network error: ' + ((e.reason && e.reason.message) || 'request failed'));
  });
})();
