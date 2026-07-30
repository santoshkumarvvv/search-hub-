/* ============================================================
   AnimeHub — safe-boot catalog renderer
   Author: Santosh Kumar
   License: MIT

   Design rules:
     1. Never show a blank screen. An embedded catalog renders
        before any network call is made.
     2. Every DOM lookup is null-guarded; every boot step is
        wrapped so one failure never white-screens the page.
     3. All user-reachable strings are escaped, all URLs are
        protocol-validated before they touch the DOM.
   ============================================================ */
(function () {
  'use strict';

  var VERSION = '19';

  // ───────────── EMBEDDED FALLBACK CATALOG ─────────────
  // Renders with zero network. Keeps the app usable offline.
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

  var LANGS = [
    { k: 'hindi',    label: 'Hindi' },
    { k: 'english',  label: 'English' },
    { k: 'tamil',    label: 'Tamil' },
    { k: 'telugu',   label: 'Telugu' },
    { k: 'japanese', label: 'Japanese (Sub)' }
  ];
  var LANG_LABEL = { hindi:'Hindi', english:'English', tamil:'Tamil', telugu:'Telugu', japanese:'Japanese' };

  var FILTERS = [
    { k: 'all',      label: 'All' },
    { k: 'hindi',    label: 'Hindi Dub' },
    { k: 'trending', label: 'Trending' },
    { k: 'new',      label: 'New' },
    { k: 'saved',    label: 'My List' }
  ];

  var SORTS = [
    { k: 'default',  label: 'Default' },
    { k: 'score',    label: 'Top rated' },
    { k: 'year',     label: 'Newest' },
    { k: 'title',    label: 'A–Z' },
    { k: 'episodes', label: 'Most episodes' }
  ];

  // ───────────── STATE ─────────────
  var CATALOG = FALLBACK_CATALOG.slice();
  var filterText = '';
  var activeFilter = 'all';
  var activeSort = 'default';
  var selected = null;
  var selectedEp = 1;
  var selectedLang = 'hindi';
  var usingFallback = true;
  var lastFocused = null;
  var _tt, _searchDebounce;

  var els = {};

  // ───────────── UTILITIES ─────────────
  function $(id) { return document.getElementById(id); }

  function safe(fn, label) {
    try { return fn(); }
    catch (err) {
      console.error('[AnimeHub]', label || 'error', err);
      showStatus('err', 'Non-fatal error in ' + (label || 'app'));
      return null;
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  /** Only allow http(s) image URLs. Blocks javascript:, data:, vbscript:. */
  function safeUrl(u) {
    if (!u) return '';
    var s = String(u).trim();
    if (!/^https?:\/\//i.test(s)) return '';
    return s;
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  // ───────────── STATUS / TOAST ─────────────
  function setStatus(kind, msg, spinning) {
    if (!els.status) return;
    els.status.className = 'status show ' + kind;
    if (els.statusText) els.statusText.textContent = msg;
    if (els.statusSpin) els.statusSpin.style.display = spinning ? '' : 'none';
    if (!spinning) {
      clearTimeout(els.status._t);
      els.status._t = setTimeout(function () {
        els.status.classList.remove('show');
      }, 4500);
    }
  }
  function showStatus(kind, msg) { setStatus(kind, msg, false); }

  function toast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(_tt);
    _tt = setTimeout(function () { els.toast.classList.remove('show'); }, 2200);
  }

  // ───────────── PERSISTENCE (quota-safe) ─────────────
  var Store = (function () {
    var KEY = 'animehub_v' + VERSION;
    var data = { saved: [], progress: {} };

    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') data = parsed;
      }
    } catch (e) { /* private mode / corrupt payload — use defaults */ }

    if (!Array.isArray(data.saved)) data.saved = [];
    if (!data.progress || typeof data.progress !== 'object') data.progress = {};

    function persist() {
      try { localStorage.setItem(KEY, JSON.stringify(data)); }
      catch (e) {
        // Quota exceeded — trim oldest entries and retry once.
        data.saved = data.saved.slice(0, 50);
        try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e2) {}
      }
    }

    return {
      isSaved: function (id) {
        return data.saved.some(function (x) { return x.id === id; });
      },
      savedIds: function () {
        return data.saved.map(function (x) { return x.id; });
      },
      count: function () { return data.saved.length; },
      toggle: function (a) {
        var i = data.saved.findIndex(function (x) { return x.id === a.id; });
        if (i >= 0) { data.saved.splice(i, 1); persist(); return false; }
        data.saved.unshift({ id: a.id, title: a.title, poster: a.poster, ts: Date.now() });
        persist();
        return true;
      },
      setProgress: function (id, ep) { data.progress[id] = ep; persist(); },
      getProgress: function (id) { return data.progress[id] || 0; }
    };
  })();

  // ───────────── RENDERING: CARDS ─────────────
  function initialsOf(title) {
    return (title || '??').split(/\s+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  function renderCard(a) {
    var card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('data-id', a.id);
    card.setAttribute('aria-label', a.title + (a.year ? ', ' + a.year : ''));

    var isHindi = !!(a.hindi || (a.langDubs && a.langDubs.hindi));
    var badge = isHindi
      ? '<span class="badge">HINDI</span>'
      : '<span class="badge sub">SUB</span>';
    var genres = (a.genres && a.genres.length)
      ? '<span class="tag">' + escapeHtml(a.genres.slice(0, 2).join(' · ')) + '</span>'
      : '';
    var score = a.score ? '<span class="score">★ ' + a.score.toFixed(1) + '</span>' : '';
    var savedMark = Store.isSaved(a.id) ? '<span class="saved-dot" title="In My List">✓</span>' : '';
    var poster = safeUrl(a.poster);

    card.innerHTML =
      '<div class="thumb">' +
        '<div class="ph">' + escapeHtml(initialsOf(a.title)) + '</div>' +
        badge + score + savedMark +
      '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-title">' + escapeHtml(a.title || 'Untitled') + '</h3>' +
        '<div class="card-meta">' +
          '<span>' + escapeHtml(a.year || '—') + '</span>' +
          '<span aria-hidden="true">·</span>' +
          '<span>' + escapeHtml(a.episodes || '?') + ' eps</span>' +
          (genres ? '<span aria-hidden="true">·</span>' + genres : '') +
        '</div>' +
      '</div>';

    if (poster) {
      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.onload = function () { img.classList.add('loaded'); };
      img.onerror = function () { img.remove(); }; // initials placeholder stays
      img.src = poster;
      var thumb = card.querySelector('.thumb');
      if (thumb) thumb.appendChild(img);
    }

    function open() { openDetail(a); }
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    return card;
  }

  // ───────────── RENDERING: GRID ─────────────
  function applyFilters() {
    var q = (filterText || '').trim().toLowerCase();
    var list = CATALOG.slice();

    if (activeFilter === 'hindi') {
      list = list.filter(function (a) { return !!(a.hindi || (a.langDubs && a.langDubs.hindi)); });
    } else if (activeFilter === 'trending') {
      list = list.filter(function (a) { return !!a.trending; });
    } else if (activeFilter === 'new') {
      list = list.filter(function (a) { return !!a.newRelease; });
    } else if (activeFilter === 'saved') {
      var ids = Store.savedIds();
      list = list.filter(function (a) { return ids.indexOf(a.id) !== -1; });
    }

    if (q) {
      list = list.filter(function (a) {
        var hay = (a.title + ' ' + (a.studio || '') + ' ' + (a.genres || []).join(' ')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }

    if (activeSort === 'score') {
      list.sort(function (x, y) { return (y.score || 0) - (x.score || 0); });
    } else if (activeSort === 'year') {
      list.sort(function (x, y) { return (y.year || 0) - (x.year || 0); });
    } else if (activeSort === 'title') {
      list.sort(function (x, y) { return String(x.title).localeCompare(String(y.title)); });
    } else if (activeSort === 'episodes') {
      list.sort(function (x, y) { return (y.episodes || 0) - (x.episodes || 0); });
    }

    return list;
  }

  function renderGrid() {
    if (!els.grid) return;
    var list = applyFilters();

    if (els.count) {
      els.count.textContent = list.length + ' title' + (list.length === 1 ? '' : 's') +
        (usingFallback ? ' · offline' : '');
    }
    if (els.savedCount) {
      var n = Store.count();
      els.savedCount.textContent = n ? String(n) : '';
      els.savedCount.style.display = n ? '' : 'none';
    }

    els.grid.innerHTML = '';

    if (list.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      var h = document.createElement('h2');
      h.textContent = activeFilter === 'saved' ? 'Your list is empty' : 'No matches';
      var p = document.createElement('p');
      p.textContent = activeFilter === 'saved'
        ? 'Tap ＋ Save on any title to add it here.'
        : 'Try a different search term or filter.';
      empty.appendChild(h);
      empty.appendChild(p);
      els.grid.appendChild(empty);
      return;
    }

    var frag = document.createDocumentFragment();
    list.forEach(function (a) { frag.appendChild(renderCard(a)); });
    els.grid.appendChild(frag);
  }

  function renderChips() {
    if (els.filterRow) {
      els.filterRow.innerHTML = '';
      FILTERS.forEach(function (f) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip' + (activeFilter === f.k ? ' active' : '');
        b.textContent = f.label;
        b.setAttribute('aria-pressed', activeFilter === f.k ? 'true' : 'false');
        b.addEventListener('click', function () {
          activeFilter = f.k;
          renderChips();
          renderGrid();
        });
        els.filterRow.appendChild(b);
      });
    }
    if (els.sortSelect && !els.sortSelect.options.length) {
      SORTS.forEach(function (s) {
        var o = document.createElement('option');
        o.value = s.k;
        o.textContent = s.label;
        els.sortSelect.appendChild(o);
      });
    }
  }

  // ───────────── DETAIL PANEL ─────────────
  function openDetail(a, skipHash) {
    if (!a) return;
    selected = a;
    selectedEp = clamp(Store.getProgress(a.id) || 1, 1, a.episodes || 12);
    lastFocused = document.activeElement;

    // Pick the best available audio track.
    if (a.langDubs) {
      if (!a.langDubs[selectedLang]) {
        selectedLang = a.langDubs.hindi ? 'hindi'
                     : a.langDubs.english ? 'english'
                     : 'japanese';
      }
    } else {
      selectedLang = a.hindi ? 'hindi' : 'japanese';
    }

    if (els.dTitle) els.dTitle.textContent = a.title;
    if (els.dSyn) els.dSyn.textContent = a.synopsis || 'No synopsis available.';

    if (els.dMeta) {
      els.dMeta.innerHTML = '';
      var bits = [];
      if (a.score) bits.push(['star', '★ ' + a.score.toFixed(1)]);
      if (a.year) bits.push(['', String(a.year)]);
      if (a.rating) bits.push(['', a.rating]);
      if (a.studio) bits.push(['', a.studio]);
      if (a.episodes) bits.push(['', a.episodes + ' episodes']);
      bits.forEach(function (b, i) {
        if (i) {
          var sep = document.createElement('span');
          sep.className = 'sep';
          sep.setAttribute('aria-hidden', 'true');
          sep.textContent = '|';
          els.dMeta.appendChild(sep);
        }
        var s = document.createElement('span');
        if (b[0]) s.className = b[0];
        s.textContent = b[1];
        els.dMeta.appendChild(s);
      });
      (a.genres || []).slice(0, 4).forEach(function (g) {
        var t = document.createElement('span');
        t.className = 'tag';
        t.textContent = g;
        els.dMeta.appendChild(t);
      });
    }

    if (els.hero) {
      els.hero.innerHTML = '';
      var banner = safeUrl(a.banner);
      if (banner) {
        var himg = document.createElement('img');
        himg.alt = '';
        himg.decoding = 'async';
        himg.referrerPolicy = 'no-referrer';
        himg.onerror = function () { himg.remove(); };
        himg.src = banner;
        els.hero.appendChild(himg);
      }
    }

    renderAudio();
    renderEpisodes();
    renderPlayerPlaceholder();
    updateSaveBtn();

    if (els.panel) {
      els.panel.classList.add('open');
      els.panel.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
    if (els.panelBack) els.panelBack.focus();

    if (!skipHash) {
      try { history.pushState({ anime: a.id }, '', '#anime=' + a.id); } catch (e) {}
    }
  }

  function closeDetail(skipHash) {
    selected = null;
    if (els.panel) {
      els.panel.classList.remove('open');
      els.panel.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    if (els.player) {
      var ifr = els.player.querySelector('iframe');
      if (ifr) ifr.remove();                     // stop playback immediately
      if (els.playerPh) els.playerPh.style.display = '';
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    if (!skipHash && location.hash.indexOf('#anime=') === 0) {
      try { history.pushState(null, '', location.pathname + location.search); } catch (e) {}
    }
    renderGrid(); // refresh saved markers
  }

  function renderAudio() {
    if (!els.audioRow || !selected) return;
    els.audioRow.innerHTML = '';
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'audio-btn' + (selectedLang === l.k ? ' active' : '');
      var supported = l.k === 'japanese'
        ? true
        : (selected.langDubs ? !!selected.langDubs[l.k] : !!selected.hindi);
      b.disabled = !supported;
      b.textContent = l.label;
      b.setAttribute('aria-pressed', selectedLang === l.k ? 'true' : 'false');
      b.addEventListener('click', function () {
        selectedLang = l.k;
        renderAudio();
        renderPlayerPlaceholder();
        toast('Audio: ' + l.label);
      });
      els.audioRow.appendChild(b);
    });
  }

  function renderEpisodes() {
    if (!els.epGrid || !selected) return;
    els.epGrid.innerHTML = '';
    var n = selected.episodes || 12;
    if (els.epCount) els.epCount.textContent = n + ' total';

    var cap = Math.min(n, 60);
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= cap; i++) {
      (function (ep) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'ep-chip' + (selectedEp === ep ? ' active' : '');
        c.textContent = String(ep).padStart(2, '0');
        c.setAttribute('aria-label', 'Episode ' + ep);
        c.setAttribute('aria-pressed', selectedEp === ep ? 'true' : 'false');
        c.addEventListener('click', function () {
          selectedEp = ep;
          Store.setProgress(selected.id, ep);
          renderEpisodes();
          renderPlayerPlaceholder();
          if (els.actPlay) els.actPlay.textContent = '▶ Play EP ' + String(ep).padStart(2, '0');
        });
        frag.appendChild(c);
      })(i);
    }
    els.epGrid.appendChild(frag);

    if (n > cap) {
      var more = document.createElement('div');
      more.className = 'ep-chip muted';
      more.textContent = '+' + (n - cap) + ' more';
      els.epGrid.appendChild(more);
    }
    if (els.actPlay) els.actPlay.textContent = '▶ Play EP ' + String(selectedEp).padStart(2, '0');
  }

  function renderPlayerPlaceholder() {
    if (!els.player || !selected) return;
    if (els.playerPh) els.playerPh.style.display = 'none';

    var prev = els.player.querySelector('iframe');
    if (prev) prev.remove();
    var oldNote = els.player.querySelector('.play-note');
    if (oldNote) oldNote.remove();

    var note = document.createElement('div');
    note.className = 'ph play-note';

    var b = document.createElement('b');
    b.textContent = '▶ EP ' + String(selectedEp).padStart(2, '0') + ' · ' +
                    (LANG_LABEL[selectedLang] || 'Japanese');
    var sub = document.createElement('span');
    sub.className = 'sub';
    sub.textContent = selected.title;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill primary';
    btn.textContent = '▶ Load player';
    btn.addEventListener('click', loadEmbed);

    note.appendChild(b);
    note.appendChild(sub);
    note.appendChild(btn);
    els.player.appendChild(note);
  }

  function loadEmbed() {
    if (!els.player || !selected) return;
    var note = els.player.querySelector('.play-note');
    if (note) {
      note.innerHTML = '';
      var b = document.createElement('b');
      b.textContent = 'Loading player…';
      note.appendChild(b);
    }

    var ifr = document.createElement('iframe');
    ifr.title = selected.title + ' — episode ' + selectedEp;
    ifr.loading = 'lazy';
    ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    ifr.allowFullscreen = true;
    ifr.referrerPolicy = 'no-referrer';
    // Restrict what the embedded frame is allowed to do.
    ifr.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');

    // Demonstration embeds only — replace with a licensed provider in production.
    var ids = ['4A_X-Dvl0ws', 'VQGCKyvzIM4', 'MGRm4IzK1SQ', 'jUwRQ9rDFW8'];
    var pick = ids[Math.abs(selected.id * 7 + selectedEp * 3) % ids.length];
    ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(pick) + '?rel=0&modestbranding=1';

    ifr.addEventListener('load', function () { if (note) note.style.display = 'none'; });
    els.player.appendChild(ifr);
  }

  function updateSaveBtn() {
    if (!els.actSave || !selected) return;
    var saved = Store.isSaved(selected.id);
    els.actSave.textContent = saved ? '✓ Saved' : '＋ Save';
    els.actSave.setAttribute('aria-pressed', saved ? 'true' : 'false');
  }

  // ───────────── ROUTER (deep links) ─────────────
  function findById(id) {
    return CATALOG.filter(function (a) { return String(a.id) === String(id); })[0] || null;
  }

  function syncFromHash() {
    var m = /^#anime=(.+)$/.exec(location.hash || '');
    if (m) {
      var a = findById(decodeURIComponent(m[1]));
      if (a) { openDetail(a, true); return; }
    }
    if (selected) closeDetail(true);
  }

  // ───────────── EVENTS ─────────────
  function bindEvents() {
    if (els.panelBack) els.panelBack.addEventListener('click', function () { closeDetail(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && selected) { closeDetail(); return; }
      // "/" focuses search when not already typing
      if (e.key === '/' && !selected) {
        var tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          if (els.search) els.search.focus();
        }
      }
    });

    // Focus trap inside the dialog
    if (els.panel) {
      els.panel.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab' || !selected) return;
        var f = els.panel.querySelectorAll(
          'button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }

    if (els.actPlay) els.actPlay.addEventListener('click', function () {
      if (!selected) return;
      if (!els.player.querySelector('iframe')) loadEmbed();
    });

    if (els.actSave) els.actSave.addEventListener('click', function () {
      if (!selected) return;
      var added = Store.toggle(selected);
      toast(added ? 'Added to My List' : 'Removed from My List');
      updateSaveBtn();
    });

    if (els.actShare) els.actShare.addEventListener('click', function () {
      if (!selected) return;
      var url = location.href.split('#')[0] + '#anime=' + selected.id;
      if (navigator.share) {
        navigator.share({ title: selected.title, url: url }).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(function () { toast('Link copied'); })
          .catch(function () { toast(url); });
      } else {
        toast(url);
      }
    });

    if (els.search) {
      var onSearch = debounce(function () {
        filterText = els.search.value;
        renderGrid();
      }, 140);
      els.search.addEventListener('input', onSearch);
      els.search.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { els.search.value = ''; filterText = ''; renderGrid(); }
      });
    }

    if (els.sortSelect) {
      els.sortSelect.addEventListener('change', function () {
        activeSort = els.sortSelect.value;
        renderGrid();
      });
    }

    window.addEventListener('popstate', function () { safe(syncFromHash, 'router'); });
    window.addEventListener('online',  function () { showStatus('ok', 'Back online'); });
    window.addEventListener('offline', function () { showStatus('warn', 'You are offline — cached data in use'); });
  }

  // ───────────── CATALOG LOADING ─────────────
  function fetchCatalog() {
    return new Promise(function (resolve) {
      var done = false;
      var finish = function (r) { if (!done) { done = true; resolve(r); } };
      var to = setTimeout(function () { finish({ ok: false, reason: 'timeout' }); }, 5000);

      fetch('./catalog.json', { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) { clearTimeout(to); return finish({ ok: false, reason: 'http_' + r.status }); }
          return r.json().then(function (j) {
            clearTimeout(to);
            var arr = Array.isArray(j) ? j
              : (j && (j.anime || j.results || j.data || j.items));
            if (Array.isArray(arr) && arr.length) finish({ ok: true, data: arr });
            else finish({ ok: false, reason: 'empty' });
          });
        })
        .catch(function (e) {
          clearTimeout(to);
          finish({ ok: false, reason: 'network' });
        });
    });
  }

  function normalizeItems(arr) {
    return (arr || []).map(function (it) {
      var langs = it.langDubs || it.langs || {};
      return {
        id: it.id != null ? it.id : (it.mal_id != null ? it.mal_id : Math.floor(Math.random() * 1e9)),
        title: it.title || it.name || 'Untitled',
        year: it.year || (it.aired && it.aired.from ? new Date(it.aired.from).getFullYear() : null),
        episodes: it.episodes || 12,
        score: typeof it.score === 'number' ? it.score : null,
        studio: it.studio || (it.studios && it.studios[0] && it.studios[0].name) || '',
        rating: it.rating || 'TV-14',
        genres: (it.genres || []).map(function (g) {
          return typeof g === 'string' ? g : (g && g.name) || '';
        }).filter(Boolean),
        poster: it.poster || (it.images && it.images.jpg &&
                (it.images.jpg.large_image_url || it.images.jpg.image_url)) || '',
        banner: it.banner || (it.images && it.images.jpg && it.images.jpg.large_image_url) || '',
        synopsis: it.synopsis || '',
        trending: !!it.trending,
        newRelease: !!it.newRelease,
        hindi: !!it.hindi || !!langs.hindi,
        langDubs: langs
      };
    }).filter(function (x) { return x.title !== 'Untitled' || x.id; });
  }

  // ───────────── SERVICE WORKER ─────────────
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
    navigator.serviceWorker.register('./sw.js').catch(function () {
      /* SW is an enhancement; failure must never break the app */
    });
  }

  // ───────────── BOOT ─────────────
  function boot() {
    els = {
      grid: $('grid'), status: $('status'), statusText: $('statusText'), statusSpin: $('statusSpin'),
      count: $('count'), search: $('search'), toast: $('toast'),
      filterRow: $('filterRow'), sortSelect: $('sortSelect'), savedCount: $('savedCount'),
      panel: $('panel'), panelBack: $('panelBack'), player: $('player'), playerPh: $('playerPh'),
      dTitle: $('dTitle'), dMeta: $('dMeta'), dSyn: $('dSyn'),
      actPlay: $('actPlay'), actSave: $('actSave'), actShare: $('actShare'),
      audioRow: $('audioRow'), epGrid: $('epGrid'), epCount: $('epCount'), hero: $('hero')
    };

    // 1) Paint the embedded catalog immediately — no blank screen, ever.
    renderChips();
    renderGrid();
    setStatus('warn', 'Loading catalog…', true);
    bindEvents();

    // 2) Hydrate from the remote catalog in the background.
    fetchCatalog().then(function (res) {
      if (res.ok) {
        var norm = normalizeItems(res.data);
        if (norm.length) {
          CATALOG = norm;
          usingFallback = false;
          renderGrid();
          setStatus('ok', 'Loaded ' + norm.length + ' titles');
          safe(syncFromHash, 'router');
          return;
        }
      }
      usingFallback = true;
      CATALOG = FALLBACK_CATALOG.slice();
      renderGrid();
      setStatus('err', 'Catalog unavailable (' + (res.reason || 'unknown') + ') — showing built-in titles');
      safe(syncFromHash, 'router');
    });

    registerSW();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { safe(boot, 'boot'); });
  } else {
    safe(boot, 'boot');
  }

  // Last-resort handlers so failures surface instead of dying silently.
  window.addEventListener('error', function (e) {
    showStatus('err', 'Script error: ' + (e.message || 'unknown'));
  });
  window.addEventListener('unhandledrejection', function () {
    showStatus('err', 'A network request failed');
  });
})();
