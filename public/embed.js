(function () {
  'use strict';

  var DEBOUNCE_MS = 150;
  var FETCH_TIMEOUT_MS = 5000;

  function init(options) {
    options = options || {};
    var container = document.querySelector(options.container || '[data-search-embed]');
    if (!container) return;

    var script = document.currentScript || document.querySelector('script[data-index],script[data-index-url],script[data-api-url]');
    var input = container.querySelector('input[data-search-input]') || container.querySelector('input[type="search"]') || container.querySelector('input[type="text"]');
    var resultsEl = container.querySelector('[data-search-results]') || container;
    var trigger = container.querySelector('[data-search-trigger]') || container.querySelector("button");
    var indexUrl = options.indexUrl || container.getAttribute('data-index-url') || container.getAttribute('data-index') || (script && (script.getAttribute('data-index-url') || script.getAttribute('data-index'))) || '/data/index.json';
    var apiUrl = options.apiUrl || container.getAttribute('data-api-url') || (script && script.getAttribute('data-api-url')) || '';
    var apiKey = options.apiKey || container.getAttribute('data-api-key') || (script && script.getAttribute('data-api-key')) || '';

    if (!input) return;

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

    function showError(msg) {
      resultsEl.innerHTML = '<div class="search-embed-error" style="color:#ff6b6b;padding:12px">' + escapeHtml(msg) + '</div>';
      setExpanded(true);
    }

    function render(results) {
      if (!results || !results.length) {
        resultsEl.innerHTML = '<div class="search-embed-empty" style="color:#8a8a9a;padding:12px">No results</div>';
        setExpanded(true);
        return;
      }
      var html = '<ul style="list-style:none;padding:0;margin:0">';
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var title = r.title || r.name || '';
        var desc = r.snippet || r.description || r.summary || '';
        var url = r.url || '';
        var titleHtml = url
          ? '<a href="' + escapeHtml(url) + '" style="color:inherit;text-decoration:none">' + escapeHtml(title) + '</a>'
          : escapeHtml(title);
        html += '<li role="option" style="padding:10px 12px;border-bottom:1px solid #2a2a3a"><strong>' + titleHtml + '</strong><br><span style="color:#8a8a9a;font-size:0.85rem">' + escapeHtml(desc) + '</span></li>';
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

    function runSearch(query) {
      if (activeController) activeController.abort();

      if (!apiUrl && indexData) {
        render(searchLocal(query, indexData));
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
            render(list);
          })
          .catch(function (err) {
            clearTimeout(timer);
            if (err.name === 'AbortError') {
              showError('Search timed out after 5 seconds. Try a shorter query.');
            } else {
              showError('Could not complete API search. Check your key or connection.');
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
          render(results);
        })
        .catch(function (err) {
          clearTimeout(timer);
          if (err.name === 'AbortError') {
            showError('Search timed out after 5 seconds. Try a shorter query.');
          } else {
            showError('Could not load search index. Check your connection.');
          }
        });
    }

    function searchLocal(query, data) {
      var docs = Array.isArray(data) ? data : (data.docs || data.items || data.results || []);
      if (!query) return docs.slice(0, 10);
      var q = query.toLowerCase().split(/\s+/).filter(Boolean);
      var scored = [];
      for (var i = 0; i < docs.length; i++) {
        var d = docs[i];
        var text = ((d.title || '') + ' ' + (d.name || '') + ' ' + (d.description || '') + ' ' + (d.snippet || '') + ' ' + (d.summary || '') + ' ' + (d.content || '') + ' ' + (d.tags || []).join(' ')).toLowerCase();
        var score = 0;
        for (var j = 0; j < q.length; j++) {
          if (text.indexOf(q[j]) !== -1) score += 1;
        }
        if (score > 0) scored.push({ doc: d, score: score });
      }
      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, 10).map(function (s) { return s.doc; });
    }

    input.addEventListener('input', function () {
      var val = input.value.trim();
      clearTimeout(debounceTimer);
      if (!val) {
        resultsEl.innerHTML = '';
        setExpanded(false);
        return;
      }
      debounceTimer = setTimeout(function () { runSearch(val); }, DEBOUNCE_MS);
    });

    if (trigger) {
      trigger.addEventListener('click', function () {
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        setExpanded(!expanded);
        if (!expanded && input.value.trim()) runSearch(input.value.trim());
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  window.SearchEmbed = { init: init };
})();
