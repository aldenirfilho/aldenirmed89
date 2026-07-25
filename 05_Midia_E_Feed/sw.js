const CACHE_PREFIX = "card-feed-medico-";
const CACHE_NAME = `${CACHE_PREFIX}v6`;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./assets/knowledge-forge.css",
  "./assets/knowledge-forge.js",
  "./assets/vendor/tesseract/tesseract.min.js",
  "./assets/vendor/tesseract/worker.min.js",
  "./assets/vendor/tesseract/tesseract-core-lstm.wasm.js",
  "./assets/vendor/tesseract/lang/por.traineddata.gz",
  "./assets/vendor/tesseract/lang/eng.traineddata.gz",
  "./data/cards.json",
  "./data/public.json",
  "./data/themes.json",
  "./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.headers.has("range")) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
