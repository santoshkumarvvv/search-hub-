/* MediaHub service worker
   - App shell   -> cache-first
   - /api/*      -> network-first with cache fallback (works offline)
   - Cross-origin-> never cached
*/
var VERSION = 'mediahub-v2';
var SHELL = ['/', '/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches
      .open(VERSION)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { /* a partial cache is still useful */ })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (k) { return k === VERSION ? null : caches.delete(k); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;

  // API: prefer fresh data, fall back to the last good response.
  if (url.pathname.indexOf('/api/') === 0) {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(VERSION).then(function (c) { c.put(req, copy); });
          }
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (hit) {
            return hit || new Response(
              JSON.stringify({ items: [], page: 1, hasMore: false, total: 0 }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Shell and static assets.
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req)
        .then(function (res) {
          if (res && res.ok && res.type === 'basic') {
            var copy = res.clone();
            caches.open(VERSION).then(function (c) { c.put(req, copy); });
          }
          return res;
        })
        .catch(function () {
          if (req.mode === 'navigate') return caches.match('/');
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});
