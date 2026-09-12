(() => {
  'use strict';

  const loader = document.querySelector('script[data-antigravity-analytics]');
  if (!loader || loader.dataset.enabled !== 'true') return;

  const siteCode = (loader.dataset.siteCode || '').trim();
  const publicHost = (loader.dataset.publicHost || '').trim();
  const isPublicSite = location.protocol === 'https:' && location.hostname === publicHost;
  if (!isPublicSite || !/^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/.test(siteCode)) return;

  // The external counter reads localStorage for its own opt-out setting.
  // If the browser denies access, keep optional analytics out of the page.
  try {
    window.localStorage.getItem('antigravity:analytics:storage-check');
  } catch (_) {
    return;
  }

  const endpoint = `https://${siteCode}.goatcounter.com`;
  const counterScript = document.createElement('script');
  counterScript.async = true;
  counterScript.src = 'https://gc.zgo.at/count.js';
  counterScript.dataset.goatcounter = `${endpoint}/count`;
  counterScript.referrerPolicy = 'strict-origin-when-cross-origin';
  document.head.append(counterScript);

  const panel = document.querySelector('[data-analytics-panel]');
  if (!panel || loader.dataset.counterEnabled !== 'true') return;

  const totalNode = panel.querySelector('[data-analytics-total]');
  const listNode = panel.querySelector('[data-analytics-ranking]');
  const statusNode = panel.querySelector('[data-analytics-status]');

  const normalizePath = (prefix, relative) => {
    const cleanPrefix = `/${String(prefix || '').replace(/^\/+|\/+$/g, '')}/`;
    if (relative === 'index.html') return cleanPrefix;
    const clean = relative.replace(/^\/+/, '').replace(/index\.html$/i, '');
    return `${cleanPrefix}${clean}`.replace(/\/{2,}/g, '/');
  };

  const readCount = async (path) => {
    const response = await fetch(`${endpoint}/counter/${encodeURIComponent(path)}.json`, {
      credentials: 'omit',
      mode: 'cors',
      referrerPolicy: 'no-referrer',
    });
    if (!response.ok) throw new Error(`counter-${response.status}`);
    const payload = await response.json();
    const display = String(payload.count ?? payload.count_unique ?? '').trim();
    if (!/^[0-9][0-9., \u00a0]*$/.test(display)) throw new Error('counter-invalid');
    const numeric = Number(display.replace(/[., \u00a0]/g, ''));
    if (!Number.isSafeInteger(numeric) || numeric < 0) throw new Error('counter-invalid');
    return {display, numeric};
  };

  const showPanel = async () => {
    try {
      const response = await fetch(loader.dataset.config, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`config-${response.status}`);
      const config = await response.json();
      if (
        config.enabled !== true ||
        config.visitorCounterEnabled !== true ||
        config.siteCode !== siteCode ||
        !Array.isArray(config.routes)
      ) return;

      const [total, routeResults] = await Promise.all([
        readCount('TOTAL'),
        Promise.allSettled(config.routes.map(async (route) => ({
          ...route,
          count: await readCount(normalizePath(config.publicPathPrefix, route.path)),
        }))),
      ]);

      totalNode.textContent = total.display;
      listNode.replaceChildren();
      const availableRoutes = routeResults.filter(result => result.status === 'fulfilled').map(result => result.value);
      availableRoutes
        .sort((left, right) => right.count.numeric - left.count.numeric)
        .slice(0, 5)
        .forEach((route) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = route.path === 'index.html' ? './' : route.path.replace(/index\.html$/i, '');
          link.textContent = route.label;
          const count = document.createElement('strong');
          count.textContent = route.count.display;
          count.setAttribute('aria-label', `${route.count.display} visitas registradas`);
          item.append(link, count);
          listNode.append(item);
        });
      statusNode.textContent = `${config.privacyLabel} Contagem acumulada por página/sessão; não representa pessoas únicas no site nem visitas do dia.${availableRoutes.length < config.routes.length ? ' Algumas seções não responderam.' : ''}`;
      panel.closest('[data-analytics-section]').hidden = false;
    } catch (_) {
      if (totalNode) totalNode.textContent = '—';
      if (listNode) listNode.replaceChildren();
      if (statusNode) statusNode.textContent = 'Métricas indisponíveis: o contador público não autorizou ou não respondeu à consulta. Isso não significa zero visitantes. Abra o painel diário para consultar a origem e conectar um relatório agregado.';
      const section = panel.closest('[data-analytics-section]');
      if (section) section.hidden = false;
    }
  };

  showPanel();
})();
