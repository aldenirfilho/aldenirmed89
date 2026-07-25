"use strict";

const CACHE_PREFIX = "antigravity-root-";
const CACHE_NAME = `${CACHE_PREFIX}v3`;
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./assets/icons/antigravity-consultas-192.png",
  "./assets/icons/antigravity-consultas-512.png",
  "./assets/icons/apple-touch-icon.png"
];
const WARM_ASSETS = [
  "./data/site_manifest.json",
  "./01_Modulos_Clinicos/Hematologia_Critica/index.html",
  "./01_Modulos_Clinicos/Hematologia_Critica/assets/app.js",
  "./01_Modulos_Clinicos/Hematologia_Critica/assets/styles.css",
  "./01_Modulos_Clinicos/Hematologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/Reumatologia_Critica/index.html",
  "./01_Modulos_Clinicos/Reumatologia_Critica/assets/theme.css",
  "./01_Modulos_Clinicos/Reumatologia_Critica/data/catalog.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(SHELL_ASSETS);
      await Promise.allSettled(
        WARM_ASSETS.map((asset) => cache.add(asset))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return (
      (await caches.match(request)) ||
      (await caches.match("./offline.html"))
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (
    response.ok &&
    response.type === "basic" &&
    !request.headers.has("range")
  ) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

function networkOnlyDownload(request) {
  return fetch(new Request(request, { cache: "no-store" }));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const downloadsPath = new URL("./downloads/", self.registration.scope).pathname;
  if (url.pathname.startsWith(downloadsPath)) {
    event.respondWith(networkOnlyDownload(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
