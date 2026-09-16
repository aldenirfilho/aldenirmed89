'use strict';
const CACHE_PREFIX = 'aldenirmed89-semiologia-cardio-';
const CACHE_NAME = `${CACHE_PREFIX}v4`;
const BASE = new URL('./', self.location.href);
const CORE = [
  './', 'index.html', 'assets/semio.css', 'assets/theme.js',
  'Abdominal/', 'Abdominal/index.html', 'Abdominal/assets/app.js', 'Abdominal/assets/abdominal.css', 'Abdominal/data/course.js',
  'assets/atlas-integrado.css', 'Atlas/', 'Atlas/index.html', 'Atlas/galeria.css', 'Atlas/galeria.js', 'Atlas/catalogo.js',
  'Cardiovascular/', 'Cardiovascular/index.html', 'Cardiovascular/assets/app.js', 'Cardiovascular/data/course.js',
  '../assets/icons/aldenirmed89-aerospace-orbital-192.png',
  '../assets/icons/aerospace-v2/icon-32.png', '../assets/icons/aerospace-v2/apple-touch-icon-180.png',
  '../assets/icons/aerospace-v2/icon-192.png', '../assets/icons/aerospace-v2/icon-512.png', '../assets/icons/aerospace-v2/icon-1024.png',
  '../manifest.webmanifest', '../01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/assets/icons/neuro-192.png'
];
const CORE_URLS = CORE.map(path => new URL(path, BASE).href);
const PAGE_PATHS = new Set(CORE_URLS.map(href => new URL(href).pathname).filter(path => path.endsWith('/') || path.endsWith('.html')));

async function remember(cache, request, response) {
  // Runtime caching is optional: a full device must still receive the online response.
  try { await cache.put(request, response.clone()); } catch (_) {}
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const manifest = await fetch(new URL('Cardiovascular/data/audio-manifest.json', BASE), {cache:'no-store'});
    if (!manifest.ok) throw new Error('Biblioteca sonora indisponível');
    const data = await manifest.json();
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_URLS);
    await cache.addAll(data.map(item => new URL('Cardiovascular/' + item.file, BASE).href));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
async function partial(response, range) {
  const bytes = await response.arrayBuffer(), size = bytes.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  let start = 0, end = size - 1;
  if (!match || (!match[1] && !match[2])) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  if (!match[1]) start = Math.max(0, size - Number(match[2]));
  else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
  if (start > end || start >= size) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  const headers = new Headers(response.headers);
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
  headers.set('Accept-Ranges','bytes');headers.set('Content-Length',String(end-start+1));
  return new Response(bytes.slice(start,end+1),{status:206,statusText:'Partial Content',headers});
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin) return;
  // Never take over the independent Neurology app or other sections.
  const isCore = CORE_URLS.includes(url.href);
  if (!url.pathname.startsWith(BASE.pathname) && !isCore) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheURL = new URL(request.url);
    // These static pages interpret filters in the browser; queries share the same HTML.
    // Keep asset versions and unknown routes distinct, including when offline.
    if (request.mode === 'navigate' && PAGE_PATHS.has(cacheURL.pathname)) cacheURL.search = '';
    const clean = new Request(cacheURL.href, {method:'GET'});
    const cached = await cache.match(clean);
    if (url.pathname === new URL('../manifest.webmanifest', BASE).pathname) {
      try {
        const response = await fetch(request, {cache:'no-store'});
        if (!response.ok) throw new Error('Manifesto indisponível');
        await remember(cache,clean,response);
        return response;
      } catch(error) { if(cached) return cached; throw error; }
    }
    if (request.headers.has('range')) return cached ? partial(cached, request.headers.get('range')) : fetch(request);
    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request);
        if(response.ok) await remember(cache,clean,response);
        return response;
      } catch(error) { if(cached) return cached; throw error; }
    }
    if (cached) return cached;
    const response = await fetch(request);
    if(response.ok && response.status===200) await remember(cache,clean,response);
    return response;
  })());
});
