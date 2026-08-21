/* Offline support. Nothing is uploaded anywhere; this only caches the app's own
   files so it keeps working without a connection.

   Strategy is network-first: when online you always get the newest version of a
   file, and the cache is only used when the network fails. Cache-first would be
   faster on repeat visits but would serve stale code after every deploy, which
   is a miserable way to iterate.

   Bump CACHE below if you ever need to force every visitor to start clean —
   also the only way to purge anything a stale fetch already wrote into the
   old cache entry before this file's own {cache:"no-store"} fix landed. */
const CACHE = "workbench-v2";
const CORE = [
  "./", "index.html", "manifest.webmanifest",
  "styles/base.css", "styles/games.css", "styles/responsive.css",
  "engine/main.js", "engine/dom.js", "engine/i18n.js", "engine/ui.js",
  "engine/store.js", "engine/audio.js", "engine/arcade.js", "engine/catalogue.js",
  "games/spawner.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;   // fonts etc: leave alone
  e.respondWith(
    fetch(e.request, {cache:"no-store"})   // bypass the browser's own HTTP cache, not just this worker's
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));    // subject modules land here too
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html")))
  );
});
