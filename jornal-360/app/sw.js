/* Service worker do Jornal Diário 360: app abre offline e guarda as edições já lidas. */
const VERSAO = "j360-site-v1-2026-11-16";
const CASCA = [
  "./", "./index.html", "./css/app.css", "./js/app.js", "./js/config.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png",
  "./icons/apple-touch-icon.png", "./fonts/opendyslexic-latin-400-normal.woff2",
  "./fonts/opendyslexic-latin-700-normal.woff2", "./fonts/unifrakturmaguntia-latin-400-normal.woff2",
  "./fonts/cinzel-latin-900-normal.woff2", "./privacidade.html", "./termos.html", "./leitor.html",
  "./js/pdfjs/pdf.min.js", "./js/pdfjs/pdf.worker.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Lista de edições: rede primeiro (para trazer a edição nova), cache como reserva.
  if (url.pathname.endsWith("editions.json")) {
    e.respondWith(
      fetch(e.request).then((r) => { const c = r.clone(); caches.open(VERSAO).then((k) => k.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Demais arquivos (PDFs, capas, casca): cache primeiro, e guarda o que for baixado.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(VERSAO).then((k) => k.put(e.request, c)); }
      return r;
    }))
  );
});
