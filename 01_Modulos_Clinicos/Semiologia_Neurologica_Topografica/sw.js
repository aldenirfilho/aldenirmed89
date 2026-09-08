'use strict';
// Each section owns only its scope and cache; never remove another app's data.
const CACHE_PREFIX = 'aldenirmed89-semiologia-neuro-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const APP_ROOT = new URL('./', self.location.href);
const SHARED_ASSETS = [
  '../../assets/aldenirmed89-mystic.css',
  '../../assets/editorial-attribution.css',
  '../../assets/site-analytics.css',
  '../../assets/site-analytics.js'
].map(path => new URL(path, APP_ROOT).href);
const SHELL_ASSETS = [
  './index.html', './aprofundamento.html', './offline.html', './manifest.webmanifest',
  './assets/neuro-app.css', './assets/neuro-app.js',
  './assets/styles.css', './assets/app.js', './assets/theme-bootstrap.js',
  './data/content.js', './assets/aprofundamento.css?v=1.1.4',
  './assets/aprofundamento.js?v=1.1.3', './assets/atlas-estudo.js?v=1.1.3',
  './assets/icons/neuro-64.png', './assets/icons/neuro-180.png',
  './assets/icons/neuro-192.png', './assets/icons/neuro-512.png', ...SHARED_ASSETS
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== APP_ROOT.origin) return;
  if (!url.pathname.startsWith(APP_ROOT.pathname) && !SHARED_ASSETS.includes(url.href)) return;
  // Network first: study material is refreshed whenever connectivity is available.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected) {
        // Finish writes before returning; offline navigation immediately afterwards is reliable.
        try { await cache.put(request, response.clone()); } catch (_) { /* Storage can be full. */ }
      }
      return response;
    } catch (_) {
      const cached = await cache.match(request, {ignoreSearch:true});
      if (cached) return cached;
      if (request.mode === 'navigate') {
        if (url.pathname === APP_ROOT.pathname) return cache.match(new URL('index.html', APP_ROOT).href);
        return cache.match(new URL('offline.html', APP_ROOT).href);
      }
      return Response.error();
    }
  })());
});
