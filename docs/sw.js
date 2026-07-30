/* AnimeHub service worker
   Strategy:
     - App shell  → cache-first  (instant repeat loads)
     - catalog    → stale-while-revalidate (fast + fresh)
     - everything else → network, never cached
   Author: Santosh Kumar · MIT
*/
var VERSION = 'animehub-v19';
var SHELL = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './icon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { /* partial cache is fine */ })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === VERSION ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  // catalog.json → stale-while-revalidate
  if (url.pathname.endsWith('/catalog.json')) {
    e.respondWith(
      caches.open(VERSION).then(function (cache) {
        return cache.match(req).then(function (cached) {
          var net = fetch(req).then(function (res) {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(function () { return cached; });
          return cached || net;
        });
      })
    );
    return;
  }

  // shell → cache-first, fall back to network, then to index.html
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
