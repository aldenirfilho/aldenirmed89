"use strict";

const CACHE_PREFIX = "antigravity-root-";
const CACHE_NAME = `${CACHE_PREFIX}v27`;
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./assets/aldenirmed89-mystic.css",
  "./assets/brand/aldenirmed89-total-orange-social-card.png",
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
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/index.html",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/assets/styles.css",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/assets/theme-bootstrap.js",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/assets/visual-runtime.js",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/assets/acra-runtime.js",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/assets/acra-controller.js",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/assets/app.js",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/data/catalog.js",
  "./01_Modulos_Clinicos/Sepse_Choque_Septico/data/acra-bundle.js",
  "./01_Modulos_Clinicos/Infectologia_Critica/index.html",
  "./01_Modulos_Clinicos/Infectologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/Pneumologia_Critica/index.html",
  "./01_Modulos_Clinicos/Pneumologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/TCE_Grave_CRASH/index.html",
  "./01_Modulos_Clinicos/TCE_Grave_CRASH/assets/styles.css",
  "./01_Modulos_Clinicos/TCE_Grave_CRASH/assets/app.js",
  "./01_Modulos_Clinicos/TCE_Grave_CRASH/data/catalog.js",
  "./01_Modulos_Clinicos/TCE_Grave_CRASH/data/visual-assets.json",
  "./01_Modulos_Clinicos/TCE_Grave_CRASH/module.manifest.json",
  "./01_Modulos_Clinicos/TCE_Grave_CRASH/CHECKLIST_OPERACIONAL.md",
  "./01_Modulos_Clinicos/Dermatologia_Critica/index.html",
  "./01_Modulos_Clinicos/Dermatologia_Critica/assets/styles.css",
  "./01_Modulos_Clinicos/Dermatologia_Critica/assets/app.js",
  "./01_Modulos_Clinicos/Dermatologia_Critica/data/catalog.js",
  "./01_Modulos_Clinicos/Sindrome_Coronariana_Aguda/index.html",
  "./01_Modulos_Clinicos/Sindrome_Coronariana_Aguda/assets/styles.css",
  "./01_Modulos_Clinicos/Sindrome_Coronariana_Aguda/assets/app.js",
  "./01_Modulos_Clinicos/Sindrome_Coronariana_Aguda/data/catalog.js",
  "./01_Modulos_Clinicos/Almanaque_ECG/index.html",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/styles.css",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/app.js",
  "./01_Modulos_Clinicos/Almanaque_ECG/data/catalog.js",
  "./01_Modulos_Clinicos/Almanaque_ECG/data/catalog-31-60.js",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/01_ecg_normal.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/02_iam_anterior_extenso.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/03_infarto_posterior.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/04_pericardite_aguda.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/05_hipercalemia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/06_hipocalemia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/07_bav_total.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/08_hipotermia_osborn.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/09_torsades_de_pointes.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/10_sobrecarga_vd_tep.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/11_bav_primeiro_grau.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/12_bav_mobitz_i.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/13_bav_mobitz_ii.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/14_bloqueio_ramo_direito.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/15_bloqueio_ramo_esquerdo.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/16_sgarbossa_modificado.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/17_padrao_wellens.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/18_padrao_de_winter.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/19_repolarizacao_precoce.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/20_hipercalcemia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/21_hipocalcemia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/22_hipomagnesemia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/23_hipermagnesemia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/24_fibrilacao_atrial.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/25_flutter_atrial.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/26_tsv_regular.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/27_pre_excitacao_wpw.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/28_taquicardia_ventricular.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/29_brugada_tipo_1.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/30_tamponamento_alternancia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/31_bradicardia_sinusal.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/32_taquicardia_sinusal.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/33_pausa_sinusal.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/34_ritmo_juncional.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/35_ritmo_idioventricular_acelerado.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/36_fibrilacao_ventricular.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/37_assistolia.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/38_atividade_eletrica_sem_pulso.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/39_tv_polimorfica_qt_normal.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/40_fa_pre_excitada.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/41_taquicardia_atrial_multifocal.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/42_extrassistoles_ventriculares_r_sobre_t.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/43_iam_inferior.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/44_infarto_ventriculo_direito.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/45_iam_lateral.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/46_isquemia_subendocardica_dinamica.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/47_st_depressao_difusa_avr.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/48_ondas_t_hiperagudas.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/49_bloqueio_fascicular_anterior.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/50_bloqueio_fascicular_posterior.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/51_bloqueio_bifascicular.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/52_bloqueio_ramo_alternante.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/53_bav_alto_grau_2_para_1.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/54_marcapasso_captura_adequada.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/55_falha_captura_marcapasso.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/56_falha_sensibilidade_marcapasso.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/57_efeito_digitalico.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/58_bloqueio_canal_sodio.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/59_qt_longo_adquirido.png",
  "./01_Modulos_Clinicos/Almanaque_ECG/assets/images/60_ondas_t_cerebrais.png",
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
