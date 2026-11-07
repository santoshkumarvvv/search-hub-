(function () {
  'use strict';

  var DEBOUNCE_MS = 120;
  var FETCH_TIMEOUT_MS = 5000;

  function init(options) {
    options = options || {};
    var container = document.querySelector(options.container || '[data-search-embed]');
    if (!container) return;

    var script = document.currentScript || document.querySelector('script[data-index],script[data-index-url],script[data-api-url]');
    var input = container.querySelector('input[data-search-input]') || container.querySelector('input[type="search"]') || container.querySelector('input[type="text"]');
    var resultsEl = container.querySelector('[data-search-results]') || container;
    var statusEl = container.querySelector('[data-search-status]');
    var trigger = container.querySelector('[data-search-trigger]') || container.querySelector("button[data-search-trigger]");
    var indexUrl = options.indexUrl || container.getAttribute('data-index-url') || container.getAttribute('data-index') || (script && (script.getAttribute('data-index-url') || script.getAttribute('data-index'))) || '/data/index.json';
    var apiUrl = options.apiUrl || container.getAttribute('data-api-url') || (script && script.getAttribute('data-api-url')) || '';
    var apiKey = options.apiKey || container.getAttribute('data-api-key') || (script && script.getAttribute('data-api-key')) || '';

    if (!input) return;

    if (!document.getElementById("se-shimmer-styles")) {
      var s = document.createElement("style");
      s.id = "se-shimmer-styles";
      s.textContent = "@keyframes seShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }";
      document.head.appendChild(s);
    }


    var indexData = null;
    var debounceTimer = null;
    var activeController = null;

    var listboxId = resultsEl.id || "search-results-" + Math.random().toString(36).slice(2, 8);
    if (!resultsEl.id) resultsEl.id = listboxId;
    resultsEl.setAttribute("role", "listbox");

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listboxId);

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", listboxId);
    }

    function setExpanded(state) {
      var val = state ? "true" : "false";
      input.setAttribute("aria-expanded", val);
      if (trigger) trigger.setAttribute("aria-expanded", val);
    }

    
    function showShimmer() {
      setStatus("Searching…");
      resultsEl.innerHTML = '<div class="search-embed-shimmer" style="padding:12px 4px;display:flex;flex-direction:column;gap:10px;" aria-busy="true">' +
        '<div style="height:14px;width:30%;background:linear-gradient(90deg,#f0f0f2 25%,#e4e4e7 50%,#f0f0f2 75%);background-size:200% 100%;border-radius:4px;animation:seShimmer 1.2s infinite ease-in-out;"></div>' +
        '<div style="height:18px;width:65%;background:linear-gradient(90deg,#f0f0f2 25%,#e4e4e7 50%,#f0f0f2 75%);background-size:200% 100%;border-radius:4px;animation:seShimmer 1.2s infinite ease-in-out;"></div>' +
        '<div style="height:14px;width:88%;background:linear-gradient(90deg,#f0f0f2 25%,#e4e4e7 50%,#f0f0f2 75%);background-size:200% 100%;border-radius:4px;animation:seShimmer 1.2s infinite ease-in-out;"></div>' +
        '</div>';
      setExpanded(true);
    }

    function setStatus(text) {
      if (statusEl) statusEl.textContent = text;
    }

    function showError(msg) {
      resultsEl.innerHTML = '<div class="search-embed-error" style="color:#d7263d;padding:12px">' + escapeHtml(msg) + '</div>';
      setExpanded(true);
    }

    function render(results, latencyMs, sourceLabel) {
      if (!results || !results.length) {
        resultsEl.innerHTML = '<div class="search-embed-empty" style="color:#525252;padding:16px;text-align:center;font-size:0.9rem">No matching results found. Try "bm25", "minecrft", "scrypt", or "wireguard".</div>';
        setStatus('0 results');
        setExpanded(true);
        return;
      }
      if (typeof latencyMs === 'number') {
        setStatus(results.length + ' results in ' + latencyMs.toFixed(1) + ' ms · ' + (sourceLabel || 'Okapi BM25'));
      }
      var html = '<ul style="list-style:none;padding:0;margin:0">';
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var title = r.title || r.name || '';
        var desc = r.snippet || r.description || r.summary || '';
        var url = r.url || '';
        var score = typeof r.score === 'number' ? r.score.toFixed(2) : '';
        var urlHtml = url ? '<div style="color:#006621;font-size:0.875rem">' + escapeHtml(url) + '</div>' : '';
        var titleHtml = url
          ? '<a href="' + escapeHtml(url) + '" style="color:#1a0dab;text-decoration:none;font-size:1.125rem">' + escapeHtml(title) + '</a>'
          : '<span style="color:#1a0dab;font-size:1.125rem">' + escapeHtml(title) + '</span>';
        var scoreHtml = score
          ? '<span style="font-family:ui-monospace,monospace;font-size:0.75rem;color:#525252">BM25 ' + escapeHtml(score) + '</span>'
          : '';
        html += '<li role="option" style="padding:12px 4px 16px;border-bottom:1px solid #e5e5e5">' + urlHtml + '<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">' + titleHtml + scoreHtml + '</div><div style="color:#525252;font-size:0.875rem;margin-top:4px;line-height:1.5">' + escapeHtml(desc) + '</div></li>';
      }
      html += '</ul>';
      resultsEl.innerHTML = html;
      setExpanded(true);
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function runLocalFallback(query, t0) {
      if (indexData) {
        var hits = searchLocal(query, indexData);
        render(hits, performance.now() - t0, 'BM25 Local Index');
        return;
      }
      fetch(indexUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('Index fetch failed: ' + res.status);
          return res.json();
        })
        .then(function (data) {
          indexData = data;
          var hits = searchLocal(query, data);
          render(hits, performance.now() - t0, 'BM25 Local Index');
        })
        .catch(function () {
          showError('Could not load search index. Check your connection.');
        });
    }

    function runSearch(query) {
      var t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (activeController) activeController.abort();

      if (!apiUrl && indexData) {
        render(searchLocal(query, indexData), (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0, 'BM25 Local Index');
        return;
      }

      activeController = new AbortController();
      var timer = setTimeout(function () { activeController.abort(); }, FETCH_TIMEOUT_MS);

      if (apiUrl) {
        var sep = apiUrl.indexOf('?') === -1 ? '?q=' : '&q=';
        var reqUrl = apiUrl + sep + encodeURIComponent(query);
        var headers = { 'Accept': 'application/json' };
        if (apiKey) headers['x-api-key'] = apiKey;

        fetch(reqUrl, { headers: headers, signal: activeController.signal })
          .then(function (res) {
            clearTimeout(timer);
            if (!res.ok) throw new Error('API search failed: ' + res.status);
            return res.json();
          })
          .then(function (data) {
            var list = Array.isArray(data) ? data : (data.results || data.docs || data.items || []);
            var elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
            render(list.slice(0, 6), elapsed, '/api/search · Okapi BM25');
          })
          .catch(function (err) {
            clearTimeout(timer);
            if (err && err.name === 'AbortError') {
              showError('Search timed out after 5 seconds. Try a shorter query.');
            } else {
              runLocalFallback(query, t0);
            }
          });
        return;
      }

      fetch(indexUrl, { signal: activeController.signal })
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error('Index fetch failed: ' + res.status);
          return res.json();
        })
        .then(function (data) {
          indexData = data;
          var results = searchLocal(query, data);
          var elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
          render(results, elapsed, 'BM25 Local Index');
        })
        .catch(function (err) {
          clearTimeout(timer);
          if (err && err.name === 'AbortError') {
            showError('Search timed out after 5 seconds. Try a shorter query.');
          } else {
            showError('Could not load search index. Check your connection.');
          }
        });
    }

    function levenshtein1(a, b) {
      if (Math.abs(a.length - b.length) > 1) return false;
      var m = a.length, n = b.length;
      var dp = [];
      for (var i = 0; i <= n; i++) dp[i] = [i];
      for (var j = 0; j <= m; j++) dp[0][j] = j;
      for (var r = 1; r <= n; r++) {
        for (var c = 1; c <= m; c++) {
          dp[r][c] = b.charAt(r - 1) === a.charAt(c - 1)
            ? dp[r - 1][c - 1]
            : Math.min(dp[r - 1][c - 1] + 1, dp[r][c - 1] + 1, dp[r - 1][c] + 1);
        }
      }
      return dp[n][m] <= 1;
    }

    function searchLocal(query, data) {
      var docs = Array.isArray(data) ? data : (data.docs || data.items || data.results || []);
      if (!query) return docs.slice(0, 6);
      var q = query.toLowerCase().split(/\s+/).filter(Boolean);
      var scored = [];
      for (var i = 0; i < docs.length; i++) {
        var d = docs[i];
        var text = ((d.title || '') + ' ' + (d.name || '') + ' ' + (d.description || '') + ' ' + (d.snippet || '') + ' ' + (d.summary || '') + ' ' + (d.content || '') + ' ' + (d.tags || []).join(' ')).toLowerCase();
        var words = text.split(/\W+/).filter(Boolean);
        var score = 0;
        for (var j = 0; j < q.length; j++) {
          var term = q[j];
          if (text.indexOf(term) !== -1) {
            score += 2.4;
          } else if (term.length >= 4) {
            for (var k = 0; k < words.length; k++) {
              if (levenshtein1(words[k], term)) {
                score += 1.4;
                break;
              }
            }
          }
        }
        if (score > 0) scored.push({ doc: Object.assign({}, d, { score: score }), score: score });
      }
      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, 6).map(function (s) { return s.doc; });
    }

    input.addEventListener('input', function () {
      var val = input.value.trim();
      clearTimeout(debounceTimer);
      if (activeController) {
        activeController.abort();
        activeController = null;
      }
      if (!val) {
        resultsEl.innerHTML = '';
        setStatus('Type a query above to search 52 indexed records');
        setExpanded(false);
        return;
      }
      showShimmer();
      debounceTimer = setTimeout(function () { runSearch(val); }, DEBOUNCE_MS);
    });

    var quickBtns = container.querySelectorAll('[data-search-preset]');
    for (var b = 0; b < quickBtns.length; b++) {
      quickBtns[b].addEventListener('click', function (e) {
        var preset = e.currentTarget.getAttribute('data-search-preset') || '';
        input.value = preset;
        runSearch(preset);
      });
    }

    if (trigger) {
      trigger.addEventListener('click', function () {
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        setExpanded(!expanded);
        if (!expanded && input.value.trim()) runSearch(input.value.trim());
      });
    }

    if (input.value && input.value.trim()) {
      runSearch(input.value.trim());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  window.SearchEmbed = { init: init };
})();
