"use strict";

const CACHE_PREFIX = "antigravity-root-";
const CACHE_NAME = `${CACHE_PREFIX}v18`;
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
  "./15_Radar_Cientifico/index.html",
  "./15_Radar_Cientifico/data/radar.js",
  "./15_Radar_Cientifico/data/radar-history.json",
  "./16_Diretorio_Medico/index.html",
  "./16_Diretorio_Medico/data/sites.js",
  "./17_Portal_Vivo/index.html",
  "./17_Portal_Vivo/data/posts.js",
  "./17_Portal_Vivo/data/posts.json",
  "./17_Portal_Vivo/data/publication-history.json",
  "./18_Centro_Tripulacao/index.html",
  "./18_Centro_Tripulacao/config.example.js",
  "./18_Centro_Tripulacao/assets/app.js",
  "./18_Centro_Tripulacao/assets/styles.css",
  "./18_Centro_Tripulacao/data/public-metrics.json",
  "./19_Integridade_Editorial/index.html",
  "./19_Integridade_Editorial/data/revision-log.json",
  "./19_Integridade_Editorial/data/legal-sources.json",
  "./19_Integridade_Editorial/DOCUMENTACAO_PROTETIVA.md",
  "./19_Integridade_Editorial/CHECKLIST_PUBLICACAO.md",
  "./19_Integridade_Editorial/PROTOCOLO_INCIDENTES.md",
  "./20_Conheca_Aldenir/index.html",
  "./20_Conheca_Aldenir/config.js",
  "./20_Conheca_Aldenir/assets/styles.css",
  "./20_Conheca_Aldenir/assets/app.js",
  "./20_Conheca_Aldenir/data/content/public-documents.json",
  "./20_Conheca_Aldenir/data/content/public-feed.json",
  "./21_Central_Ativacao/index.html",
  "./21_Central_Ativacao/assets/app.js",
  "./21_Central_Ativacao/assets/styles.css",
  "./21_Central_Ativacao/data/roadmap.json",
  "./22_Microparticulas_Ativas_ACRA/index.html",
  "./22_Microparticulas_Ativas_ACRA/assets/theme-bootstrap.js",
  "./22_Microparticulas_Ativas_ACRA/assets/styles.css",
  "./22_Microparticulas_Ativas_ACRA/assets/app.js",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/pocus-choque-mapa-acra-v1.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/ausencia-sliding-barcode.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/choque-cardiogenico-ve-b-lines.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/choque-obstrutivo-vd-dilatado.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/derrame-pericardico-swinging-heart.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/expansao/efast-morrison-normal-hemoperitonio.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/expansao/fluido-doppler-carotideo-seriado.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/expansao/pulmao-padroes-essenciais.jpg",
  "./22_Microparticulas_Ativas_ACRA/assets/visuals/real-pocus-ccby/expansao/tvp-veia-femoral-nao-compressivel.jpg",
  "./22_Microparticulas_Ativas_ACRA/data/pocus-choque-acra.json",
  "./22_Microparticulas_Ativas_ACRA/data/ios-widget-formats.json",
  "./22_Microparticulas_Ativas_ACRA/data/visual-assets.json",
  "./22_Microparticulas_Ativas_ACRA/module.manifest.json",
  "./assets/editorial-attribution.css",
  "./data/editorial/editorial-provenance.json",
  "./data/theme-catalog.json",
  "./en/index.html",
  "./en/assets/theme.css",
  "./en/assets/theme.js",
  "./en/radar/index.html",
  "./en/radar/app.js",
  "./en/radar/radar.css",
  "./en/radar/data/radar.en.js",
  "./01_Modulos_Clinicos/Hematologia_Critica/index.html",
  "./01_Modulos_Clinicos/Hematologia_Critica/assets/app.js",
  "./01_Modulos_Clinicos/Hematologia_Critica/assets/styles.css",
  "./01_Modulos_Clinicos/Hematologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/Reumatologia_Critica/index.html",
  "./01_Modulos_Clinicos/Reumatologia_Critica/assets/theme.css",
  "./01_Modulos_Clinicos/Reumatologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/Infectologia_Critica/index.html",
  "./01_Modulos_Clinicos/Infectologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/Pneumologia_Critica/index.html",
  "./01_Modulos_Clinicos/Pneumologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/Dermatologia_Critica/index.html",
  "./01_Modulos_Clinicos/Dermatologia_Critica/assets/styles.css",
  "./01_Modulos_Clinicos/Dermatologia_Critica/assets/app.js",
  "./01_Modulos_Clinicos/Dermatologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/_shared_critical/assets/critical.css",
  "./01_Modulos_Clinicos/_shared_critical/assets/critical-theme.js",
  "./01_Modulos_Clinicos/_shared_critical/assets/critical.js",
  "./mnemonicos/index.html",
  "./mnemonicos/styles.css",
  "./mnemonicos/app.js",
  "./docs_usuario/index.html",
  "./docs_usuario/guide-reader.css",
  "./docs_usuario/guide-reader.js",
  "./docs_usuario/OPERACAO_CONTINUA/index.html",
  "./docs_usuario/OPERACAO_CONTINUA.md",
  "./docs_usuario/ALIMENTAR_CONTEUDO_SITE/index.html",
  "./docs_usuario/ALIMENTAR_CONTEUDO_SITE.md",
  "./docs_usuario/ROTINA_DIARIA_30_MIN/index.html",
  "./docs_usuario/ROTINA_DIARIA_30_MIN.md",
  "./docs_usuario/RADAR_CIENTIFICO_OPERACAO/index.html",
  "./docs_usuario/RADAR_CIENTIFICO_OPERACAO.md",
  "./docs_usuario/PORTAL_VIVO_PUBLICACAO/index.html",
  "./docs_usuario/PORTAL_VIVO_PUBLICACAO.md",
  "./docs_usuario/CENTRO_TRIPULACAO/index.html",
  "./docs_usuario/CENTRO_TRIPULACAO.md",
  "./docs_usuario/PROXIMAS_ETAPAS/index.html",
  "./docs_usuario/PROXIMAS_ETAPAS.md",
  "./docs_usuario/ACESSO_DOCK_MAC/index.html",
  "./docs_usuario/ACESSO_DOCK_MAC.md",
  "./docs_usuario/ACESSO_WINDOWS/index.html",
  "./docs_usuario/ACESSO_WINDOWS.md",
  "./docs_usuario/ACESSO_IPHONE/index.html",
  "./docs_usuario/ACESSO_IPHONE.md"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(SHELL_ASSETS);
      await Promise.allSettled(
        WARM_ASSETS.map((asset) => cache.add(asset))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
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
  if (request.headers.has("range")) return fetch(request);
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
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
