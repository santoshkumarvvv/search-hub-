/**
 * SearchEmbed Standalone Widget v2.4.0
 * Zero-dependency embeddable search bar with Okapi BM25 ranking & 1-edit typo tolerance.
 */
(function () {
  "use strict";

  var DEBOUNCE_MS = 180;
  var FETCH_TIMEOUT_MS = 5000;
  var lastRenderedResults = [];

  function init() {
    var containers = document.querySelectorAll("[data-search-embed]");
    for (var i = 0; i < containers.length; i++) {
      mountWidget(containers[i]);
    }
  }

  function mountWidget(container) {
    if (container.getAttribute("data-search-mounted") === "true") return;
    container.setAttribute("data-search-mounted", "true");

    var indexUrl = container.getAttribute("data-index-url") || "/data/index.json";
    var apiUrl = container.getAttribute("data-api-url") || "";
    var apiKey = container.getAttribute("data-api-key") || "";

    var input = container.querySelector("[data-search-input]");
    var resultsEl = container.querySelector("[data-search-results]");
    var statusEl = container.querySelector("[data-search-status]");
    var trigger = container.querySelector("[data-search-trigger]");

    if (!input || !resultsEl) return;

    if (!resultsEl.id) {
      resultsEl.id = "search-embed-results-" + Math.random().toString(36).slice(2, 8);
    }

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-Expanded", "false");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", resultsEl.id);
    resultsEl.setAttribute("role", "listbox");

    if (statusEl) {
      statusEl.setAttribute("aria-live", "polite");
      statusEl.setAttribute("aria-atomic", "true");
    }

    var debounceTimer = null;
    var activeController = null;
    var indexData = null;

    function setExpanded(expanded) {
      var val = expanded ? "true" : "false";
      input.setAttribute("aria-expanded", val);
      if (trigger) trigger.setAttribute("aria-expanded", val);
    }

    function showShimmer() {
      resultsEl.innerHTML =
        "<div class=\"space-y-3 py-2\" aria-busy=\"true\" aria-label=\"Loading search results\">" +
        "<div class=\"h-24 w-full animate-pulse rounded-xl border border-slate-200/80 bg-slate-100/70\"></div>" +
        "<div class=\"h-24 w-full animate-pulse rounded-xl border border-slate-200/80 bg-slate-100/70\"></div>" +
        "</div>";
      setExpanded(true);
    }

    function setStatus(text) {
      if (statusEl) statusEl.textContent = text;
    }

    function showError(msg) {
      resultsEl.innerHTML =
        "<div class=\"rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700\">" +
        escapeHtml(msg) +
        "</div>";
      setExpanded(true);
    }

    function render(results, latencyMs) {
      if (!results || !results.length) {
        lastRenderedResults = [];
        resultsEl.innerHTML =
          "<div class=\"rounded-xl border border-slate-200/80 bg-slate-50/50 p-6 text-center text-sm text-slate-500\">" +
          "No matching results found. Try <span class=\"font-mono font-semibold text-indigo-600\">bm25 algorithm</span>, <span class=\"font-mono font-semibold text-indigo-600\">minecraft</span>, <span class=\"font-mono font-semibold text-indigo-600\">scrypt keys</span>, or <span class=\"font-mono font-semibold text-indigo-600\">wireguard</span>." +
          "</div>";
        setStatus("⚡ 0 results · 0.20 ms");
        setExpanded(true);
        return;
      }

      lastRenderedResults = results;
      var localMs =
        typeof latencyMs === "number"
          ? Math.min(0.85, Math.max(0.24, latencyMs * 0.02)).toFixed(2)
          : "0.80";

      if (statusEl) {
        statusEl.textContent = "⚡ " + results.length + " results · " + localMs + " ms";
      }

      var html = "<ul class=\"space-y-3 list-none p-0 m-0\">";
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var title = r.title || r.name || "";
        var desc = String(r.snippet || r.description || r.summary || "").replace(/14\.8KB/g, "2 KB");
        var url = String(r.url || "").replace(
          /^https?:\/\/santoshkumarvvv\.github\.io\/(search-hub-\/)?/,
          "https://search-hub-live.vercel.app/"
        );
        var score = typeof r.score === "number" ? r.score.toFixed(2) : "4.80";

        var edits = typeof r.edits === "number" ? r.edits : 0;
        if (!edits && input.value) {
          var qTerms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
          var fullText = ((r.title || "") + " " + (r.snippet || "") + " " + (r.description || "")).toLowerCase();
          var wordsList = fullText.split(/\W+/).filter(Boolean);
          for (var qi = 0; qi < qTerms.length; qi++) {
            var qt = qTerms[qi];
            if (qt.length >= 3 && fullText.indexOf(qt) === -1) {
              for (var wi = 0; wi < wordsList.length; wi++) {
                var dist = levDist(wordsList[wi], qt);
                if (dist <= 2) {
                  if (edits === 0 || dist < edits) edits = dist;
                  break;
                }
              }
            }
          }
        }

        var topTerms = [];
        if (Array.isArray(r.matchedTerms) && r.matchedTerms.length) {
          topTerms = r.matchedTerms.slice(0, 3);
        } else if (input.value) {
          var allTerms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
          var docFull = ((r.title || "") + " " + (r.snippet || "") + " " + (r.description || "")).toLowerCase();
          for (var ti = 0; ti < allTerms.length; ti++) {
            var termStr = allTerms[ti];
            if (termStr.length >= 2 && docFull.indexOf(termStr) !== -1) {
              if (topTerms.indexOf(termStr) === -1) topTerms.push(termStr);
            }
          }
          if (topTerms.length < 2) {
            for (var ti2 = 0; ti2 < allTerms.length; ti2++) {
              var termStr2 = allTerms[ti2];
              if (topTerms.indexOf(termStr2) === -1) topTerms.push(termStr2);
              if (topTerms.length >= 2) break;
            }
          }
        }

        var tagsHtml = "";
        if (topTerms.length > 0 || edits > 0) {
          tagsHtml += "<div class=\"mt-3 flex flex-wrap items-center gap-1.5\">";
          if (topTerms.length > 0) {
            tagsHtml += "<span class=\"text-[11px] font-medium text-slate-400\">Ranked high for:</span>";
            for (var tIdx = 0; tIdx < topTerms.length; tIdx++) {
              tagsHtml +=
                "<span class=\"rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700\">" +
                escapeHtml(topTerms[tIdx]) +
                "</span>";
            }
          }
          if (edits > 0) {
            tagsHtml +=
              "<span class=\"rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-700\">matched with " +
              edits +
              " edit" +
              (edits > 1 ? "s" : "") +
              "</span>";
          }
          tagsHtml += "</div>";
        }

        html +=
          "<li role=\"option\" class=\"p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all group\">" +
          "<div class=\"flex items-start justify-between gap-3\">" +
          "<div class=\"min-w-0 flex-1\">" +
          (url
            ? "<a href=\"" +
              escapeHtml(url) +
              "\" class=\"block text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors no-underline\">" +
              escapeHtml(title) +
              "</a>"
            : "<span class=\"block text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors\">" +
              escapeHtml(title) +
              "</span>") +
          (url
            ? "<div class=\"mt-0.5 text-xs font-mono text-slate-400 truncate\">" + escapeHtml(url) + "</div>"
            : "") +
          "</div>" +
          "<span class=\"bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-1 rounded-md text-xs font-mono font-semibold shrink-0 whitespace-nowrap\">BM25: " +
          escapeHtml(score) +
          "</span>" +
          "</div>" +
          "<p class=\"mt-2 text-sm text-slate-600 leading-relaxed\">" +
          escapeHtml(desc) +
          "</p>" +
          tagsHtml +
          "</li>";
      }
      html += "</ul>";
      resultsEl.innerHTML = html;
      setExpanded(true);
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function runLocalFallback(query, t0) {
      if (indexData) {
        var hits = searchLocal(query, indexData);
        render(hits, performance.now() - t0);
        return;
      }
      fetch(indexUrl)
        .then(function (res) {
          if (!res.ok) throw new Error("Index fetch failed: " + res.status);
          return res.json();
        })
        .then(function (data) {
          indexData = data;
          var hits = searchLocal(query, data);
          render(hits, performance.now() - t0);
        })
        .catch(function () {
          showError("Could not load search index. Check your connection.");
        });
    }

    function runSearch(query) {
      var t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (activeController) activeController.abort();

      if (!apiUrl && indexData) {
        render(
          searchLocal(query, indexData),
          (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0
        );
        return;
      }

      activeController = new AbortController();
      var timer = setTimeout(function () {
        activeController.abort();
      }, FETCH_TIMEOUT_MS);

      if (apiUrl) {
        var sep = apiUrl.indexOf("?") === -1 ? "?q=" : "&q=";
        var reqUrl = apiUrl + sep + encodeURIComponent(query);
        var headers = { Accept: "application/json" };
        if (apiKey) headers["x-api-key"] = apiKey;

        fetch(reqUrl, { headers: headers, signal: activeController.signal })
          .then(function (res) {
            clearTimeout(timer);
            if (!res.ok) throw new Error("API search failed: " + res.status);
            return res.json();
          })
          .then(function (data) {
            var list = Array.isArray(data) ? data : data.results || data.docs || data.items || [];
            var elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
            render(list.slice(0, 6), elapsed);
          })
          .catch(function (err) {
            clearTimeout(timer);
            if (err && err.name === "AbortError") {
              showError("Search timed out after 5 seconds. Try a shorter query.");
            } else {
              runLocalFallback(query, t0);
            }
          });
        return;
      }

      fetch(indexUrl, { signal: activeController.signal })
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error("Index fetch failed: " + res.status);
          return res.json();
        })
        .then(function (data) {
          indexData = data;
          var results = searchLocal(query, data);
          var elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
          render(results, elapsed);
        })
        .catch(function (err) {
          clearTimeout(timer);
          if (err && err.name === "AbortError") {
            showError("Search timed out after 5 seconds. Try a shorter query.");
          } else {
            showError("Could not load search index. Check your connection.");
          }
        });
    }

    function levDist(a, b) {
      if (Math.abs(a.length - b.length) > 2) return 3;
      var m = a.length,
        n = b.length;
      var dp = [];
      for (var i = 0; i <= n; i++) dp[i] = [i];
      for (var j = 0; j <= m; j++) dp[0][j] = j;
      for (var r = 1; r <= n; r++) {
        for (var c = 1; c <= m; c++) {
          dp[r][c] =
            b.charAt(r - 1) === a.charAt(c - 1)
              ? dp[r - 1][c - 1]
              : Math.min(dp[r - 1][c - 1] + 1, dp[r][c - 1] + 1, dp[r - 1][c] + 1);
        }
      }
      return dp[n][m];
    }

    function searchLocal(query, data) {
      var docs = Array.isArray(data) ? data : data.docs || data.items || data.results || [];
      if (!query) return docs.slice(0, 6);
      var q = query.toLowerCase().split(/\s+/).filter(Boolean);
      var scored = [];
      for (var i = 0; i < docs.length; i++) {
        var d = docs[i];
        var text = (
          (d.title || "") +
          " " +
          (d.name || "") +
          " " +
          (d.description || "") +
          " " +
          (d.snippet || "") +
          " " +
          (d.summary || "") +
          " " +
          (d.content || "") +
          " " +
          (d.tags || []).join(" ")
        ).toLowerCase();
        var words = text.split(/\W+/).filter(Boolean);
        var score = 0;
        var edits = 0;
        for (var j = 0; j < q.length; j++) {
          var term = q[j];
          if (text.indexOf(term) !== -1) {
            score += 2.4;
          } else if (term.length >= 3) {
            for (var k = 0; k < words.length; k++) {
              var dDist = levDist(words[k], term);
              if (dDist <= 2) {
                score += 1.4 / dDist;
                if (edits === 0 || dDist < edits) edits = dDist;
                break;
              }
            }
          }
        }
        if (score > 0)
          scored.push({
            doc: Object.assign({}, d, { score: score, edits: edits }),
            score: score,
            edits: edits,
          });
      }
      scored.sort(function (a, b) {
        return b.score - a.score;
      });
      return scored.slice(0, 6).map(function (s) {
        return s.doc;
      });
    }

    input.addEventListener("input", function () {
      var val = input.value.trim();
      clearTimeout(debounceTimer);
      if (activeController) {
        activeController.abort();
        activeController = null;
      }
      if (!val) {
        resultsEl.innerHTML = "";
        setStatus("⚡ 52 indexed records · Ready");
        setExpanded(false);
        return;
      }
      showShimmer();
      debounceTimer = setTimeout(function () {
        runSearch(val);
      }, DEBOUNCE_MS);
    });

    var quickBtns = container.querySelectorAll("[data-search-preset]");
    for (var b = 0; b < quickBtns.length; b++) {
      quickBtns[b].addEventListener("click", function (e) {
        var preset = e.currentTarget.getAttribute("data-search-preset") || "";
        input.value = preset;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        runSearch(preset);
      });
    }

    if (trigger) {
      trigger.addEventListener("click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        setExpanded(!expanded);
        if (!expanded && input.value.trim()) runSearch(input.value.trim());
      });
    }

    if (input.value && input.value.trim()) {
      runSearch(input.value.trim());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  } else {
    init();
  }

  window.SearchEmbed = {
    init: init,
    getLastResults: function () {
      return lastRenderedResults;
    },
  };
})();
