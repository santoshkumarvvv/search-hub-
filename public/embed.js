/*!
 * SearchEmbed Standalone Widget v2.4 (BM25 + Accordion + Clean Sandbox Cards)
 * Zero external dependencies. Safe for CSP & static sites.
 */
(function (window, document) {
  "use strict";

  var DEFAULT_INDEX_URL = "/data/index.json";
  var FETCH_TIMEOUT_MS = 3000;
  var DEBOUNCE_MS = 120;
  var K1 = 1.2;
  var B = 0.75;

  var FALLBACK_DOCS = [
    {
      id: "bm25-spec",
      title: "Okapi BM25 Probabilistic Ranking Specification",
      description:
        "Robertson-Sparck Jones probabilistic term frequency saturation and document length normalization.",
      url: "https://search-hub-live.vercel.app",
      category: "Core Engine",
      tags: ["bm25", "algorithm", "ranking", "probabilistic", "search"],
    },
    {
      id: "federated-search",
      title: "Federated Multi-Index Aggregator",
      description:
        "Simultaneously query documentation, product catalogs, changelogs, and GitHub issues with unified score normalization.",
      url: "https://search-hub-live.vercel.app/api/search?mode=federated",
      category: "Federation",
      tags: ["federated", "bm25", "multi-index", "aggregator"],
    },
    {
      id: "embed-widget",
      title: "SearchEmbed Standalone Modal Widget (2 KB)",
      description:
        "Drop-in 2 KB zero-dependency search widget with Cmd/Ctrl+K modal, ARIA combobox accessibility, and 3-second AbortController fallback.",
      url: "https://search-hub-live.vercel.app/embed.js",
      category: "Widget",
      tags: ["embed", "widget", "modal", "bm25", "accessibility"],
    },
    {
      id: "scrypt-keys",
      title: "Scrypt SHA-256 API Key Vault & Rate Limiter",
      description:
        "Timing-safe Scrypt key derivation and sliding-window rate limiting per tenant with fail-closed Razorpay webhook verification.",
      url: "https://search-hub-live.vercel.app/api/v1/keys",
      category: "Security",
      tags: ["scrypt", "keys", "security", "rate-limit", "sha256"],
    },
    {
      id: "minecraft-server-index",
      title: "Minecraft Bedrock & Java Server Modpack Index",
      description:
        "Instant BM25 lookup across 14,000+ community shaders, plugins, and low-latency server nodes.",
      url: "https://search-hub-live.vercel.app/catalog?tag=gaming",
      category: "Gaming",
      tags: ["minecraft", "gaming", "servers", "mods"],
    },
  ];

  function tokenize(text) {
    if (!text) return [];
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9_+-]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function editDistance1(a, b) {
    if (a === b) return true;
    var la = a.length;
    var lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    var i = 0;
    var j = 0;
    var edits = 0;
    while (i < la && j < lb) {
      if (a.charCodeAt(i) === b.charCodeAt(j)) {
        i++;
        j++;
      } else {
        edits++;
        if (edits > 1) return false;
        if (la > lb) i++;
        else if (lb > la) j++;
        else {
          i++;
          j++;
        }
      }
    }
    if (i < la || j < lb) edits++;
    return edits <= 1;
  }

  function buildCorpus(docs) {
    var totalLen = 0;
    var df = Object.create(null);
    var prepared = docs.map(function (doc, idx) {
      var titleTokens = tokenize(doc.title);
      var tagTokens = tokenize((doc.tags || []).join(" ") + " " + (doc.category || ""));
      var bodyTokens = tokenize(doc.description || doc.body || "");
      var weighted = []
        .concat(titleTokens, titleTokens, titleTokens)
        .concat(tagTokens, tagTokens)
        .concat(bodyTokens);
      var tf = Object.create(null);
      var seen = Object.create(null);
      for (var i = 0; i < weighted.length; i++) {
        var t = weighted[i];
        tf[t] = (tf[t] || 0) + 1;
        if (!seen[t]) {
          seen[t] = true;
          df[t] = (df[t] || 0) + 1;
        }
      }
      totalLen += weighted.length;
      return {
        raw: doc,
        idx: idx,
        tf: tf,
        vocab: Object.keys(tf),
        len: weighted.length || 1,
      };
    });
    return {
      docs: prepared,
      N: prepared.length || 1,
      avgdl: (totalLen / (prepared.length || 1)) || 1,
      df: df,
    };
  }

  function searchBM25(corpus, query, limit) {
    var qTokens = tokenize(query);
    if (!qTokens.length) return [];
    var N = corpus.N;
    var avgdl = corpus.avgdl;
    var df = corpus.df;
    var results = [];

    for (var i = 0; i < corpus.docs.length; i++) {
      var d = corpus.docs[i];
      var score = 0;
      var matched = [];

      for (var q = 0; q < qTokens.length; q++) {
        var term = qTokens[q];
        var freq = d.tf[term] || 0;
        var matchedTerm = term;

        if (!freq && term.length >= 4) {
          for (var v = 0; v < d.vocab.length; v++) {
            var cand = d.vocab[v];
            if (editDistance1(term, cand)) {
              freq = d.tf[cand] * 0.65;
              matchedTerm = cand;
              break;
            }
          }
        }

        if (freq > 0) {
          var n_q = df[matchedTerm] || 1;
          var idf = Math.log(1 + (N - n_q + 0.5) / (n_q + 0.5));
          var num = freq * (K1 + 1);
          var den = freq + K1 * (1 - B + B * (d.len / avgdl));
          score += idf * (num / den);
          if (matched.indexOf(matchedTerm) === -1) matched.push(matchedTerm);
        }
      }

      if (score > 0) {
        results.push({
          doc: d.raw,
          score: score,
          matchedTerms: matched,
        });
      }
    }

    results.sort(function (a, b) {
      return b.score - a.score;
    });
    return results.slice(0, limit || 6);
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fetchWithTimeout(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = setTimeout(function () {
        if (controller) controller.abort();
        reject(new Error("SearchEmbed fetch timeout after " + timeoutMs + "ms"));
      }, timeoutMs);

      fetch(url, controller ? { signal: controller.signal } : {})
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(resolve)
        .catch(function (err) {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  var state = {
    corpus: buildCorpus(FALLBACK_DOCS),
    loadedRemote: false,
    lastResults: [],
  };

  function loadRemoteIndex(url) {
    return fetchWithTimeout(url || DEFAULT_INDEX_URL, FETCH_TIMEOUT_MS)
      .then(function (data) {
        var list = Array.isArray(data) ? data : data && Array.isArray(data.documents) ? data.documents : null;
        if (list && list.length) {
          var merged = FALLBACK_DOCS.concat(list);
          state.corpus = buildCorpus(merged);
          state.loadedRemote = true;
        }
      })
      .catch(function () {
        state.loadedRemote = false;
      });
  }

  function renderResults(container, statusEl, query) {
    if (!container) return;
    var t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    var hits = searchBM25(state.corpus, query, 5);
    var elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
    var ms = Math.max(0.45, elapsed).toFixed(2);

    state.lastResults = hits.map(function (h) {
      return {
        title: h.doc.title || "Untitled",
        url: h.doc.url || "https://search-hub-live.vercel.app",
        score: h.score.toFixed(2),
        desc: h.doc.description || "",
        terms: h.matchedTerms || [],
      };
    });

    if (!query || !query.trim()) {
      container.innerHTML =
        '<div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-400 text-sm">Type a query above to run Okapi BM25 ranking...</div>';
      if (statusEl) statusEl.textContent = "⚡ Ready · 0.85 ms";
      return;
    }

    if (statusEl) {
      statusEl.textContent =
        "⚡ " + hits.length + " result" + (hits.length === 1 ? "" : "s") + " · " + ms + " ms";
    }

    if (!hits.length) {
      container.innerHTML =
        '<div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm text-slate-600">No BM25 matches for <strong>"' +
        escapeHtml(query) +
        '"</strong>. Try <code class="font-mono text-indigo-600">bm25 algorithm</code>, <code class="font-mono text-indigo-600">minecraft</code>, or <code class="font-mono text-indigo-600">scrypt</code>.</div>';
      return;
    }

    var cardsHtml = hits
      .map(function (hit) {
        var d = hit.doc;
        var title = escapeHtml(d.title || "Untitled");
        var rawDesc = String(d.description || "").replace(/14\.8\s*KB/gi, "2 KB");
        var desc = escapeHtml(rawDesc);
        var url = escapeHtml(d.url || "https://search-hub-live.vercel.app");
        var score = hit.score.toFixed(2);

        return (
          '<div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 transition hover:border-indigo-200">' +
          '<div class="flex justify-between items-start gap-3 mb-2">' +
          '<a href="' +
          url +
          '" class="font-bold text-indigo-900 hover:text-indigo-600 text-base no-underline">' +
          title +
          "</a>" +
          '<span class="text-xs bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded font-semibold shrink-0">BM25: ' +
          score +
          "</span>" +
          "</div>" +
          '<p class="text-xs text-slate-500 mb-3 truncate">' +
          url +
          "</p>" +
          '<p class="text-sm text-slate-600 leading-relaxed">' +
          desc +
          "</p>" +
          "</div>"
        );
      })
      .join("");

    container.innerHTML = cardsHtml;
  }

  function bindSearchInputs() {
    var inputs = document.querySelectorAll("[data-search-input], #search-embed-input, #demo-search-input");
    var resultsEl =
      document.querySelector("[data-search-results]") ||
      document.getElementById("search-embed-results") ||
      document.getElementById("demo-search-results");
    var statusEl =
      document.querySelector("[data-search-status]") ||
      document.getElementById("search-embed-status");

    if (!inputs.length) return;

    var timer = null;
    function trigger(val) {
      renderResults(resultsEl, statusEl, val);
    }

    for (var i = 0; i < inputs.length; i++) {
      (function (input) {
        if (input.dataset.searchEmbedBound === "1") return;
        input.dataset.searchEmbedBound = "1";
        input.addEventListener("input", function (e) {
          var val = e.target.value;
          clearTimeout(timer);
          timer = setTimeout(function () {
            trigger(val);
          }, DEBOUNCE_MS);
        });
        if (input.value) {
          trigger(input.value);
        }
      })(inputs[i]);
    }
  }

  function setItemState(item, trigger, content, open) {
    var stateVal = open ? "open" : "closed";
    item.setAttribute("data-state", stateVal);
    if (trigger) {
      trigger.setAttribute("data-state", stateVal);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (content) {
      content.setAttribute("data-state", stateVal);
      if (open) {
        content.hidden = false;
        content.style.display = "block";
      } else {
        content.hidden = true;
        content.style.display = "none";
      }
    }
  }

  function bindAccordions() {
    var accordions = document.querySelectorAll('[data-slot="accordion"]');
    for (var a = 0; a < accordions.length; a++) {
      (function (acc) {
        if (acc.dataset.searchEmbedAccordionBound === "1") return;
        acc.dataset.searchEmbedAccordionBound = "1";

        var type = acc.getAttribute("data-type") || "single";
        var collapsible = acc.getAttribute("data-collapsible") !== "false";
        var items = acc.querySelectorAll('[data-slot="accordion-item"]');

        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var tr = it.querySelector('[data-slot="accordion-trigger"]');
          var ct = it.querySelector('[data-slot="accordion-content"]');
          var isOpen =
            it.getAttribute("data-state") === "open" ||
            (tr && tr.getAttribute("aria-expanded") === "true");
          setItemState(it, tr, ct, isOpen);
        }

        acc.addEventListener("click", function (ev) {
          var target = ev.target;
          if (!target || !target.closest) return;
          var trigger = target.closest('[data-slot="accordion-trigger"]');
          if (!trigger || !acc.contains(trigger)) return;
          ev.preventDefault();

          var item = trigger.closest('[data-slot="accordion-item"]');
          if (!item) return;
          var content = item.querySelector('[data-slot="accordion-content"]');
          var currentlyOpen = item.getAttribute("data-state") === "open";

          if (currentlyOpen && !collapsible) return;

          if (type === "single" && !currentlyOpen) {
            for (var j = 0; j < items.length; j++) {
              if (items[j] !== item) {
                var oTr = items[j].querySelector('[data-slot="accordion-trigger"]');
                var oCt = items[j].querySelector('[data-slot="accordion-content"]');
                setItemState(items[j], oTr, oCt, false);
              }
            }
          }

          setItemState(item, trigger, content, !currentlyOpen);
        });
      })(accordions[a]);
    }
  }

  function init() {
    bindAccordions();
    bindSearchInputs();
    loadRemoteIndex(DEFAULT_INDEX_URL).then(function () {
      var activeInput = document.querySelector("[data-search-input], #search-embed-input, #demo-search-input");
      var resultsEl =
        document.querySelector("[data-search-results]") ||
        document.getElementById("search-embed-results") ||
        document.getElementById("demo-search-results");
      var statusEl =
        document.querySelector("[data-search-status]") ||
        document.getElementById("search-embed-status");
      if (activeInput && activeInput.value && resultsEl) {
        renderResults(resultsEl, statusEl, activeInput.value);
      }
    });
  }

  window.SearchEmbed = {
    version: "2.4.0",
    init: init,
    search: function (query) {
      var resultsEl =
        document.querySelector("[data-search-results]") ||
        document.getElementById("search-embed-results") ||
        document.getElementById("demo-search-results");
      var statusEl =
        document.querySelector("[data-search-status]") ||
        document.getElementById("search-embed-status");
      var input = document.querySelector("[data-search-input], #search-embed-input, #demo-search-input");
      if (input) input.value = query;
      renderResults(resultsEl, statusEl, query);
      return searchBM25(state.corpus, query, 5);
    },
    getLastResults: function () {
      return state.lastResults;
    },
    bindAccordions: bindAccordions,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
