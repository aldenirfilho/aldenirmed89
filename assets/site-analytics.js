(() => {
  'use strict';

  const loader = document.querySelector('script[data-antigravity-analytics]');
  if (!loader || loader.dataset.enabled !== 'true') return;

  const siteCode = (loader.dataset.siteCode || '').trim();
  const publicHost = (loader.dataset.publicHost || '').trim();
  const isPublicSite = location.protocol === 'https:' && location.hostname === publicHost;
  if (!isPublicSite || !/^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/.test(siteCode)) return;

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
    const display = String(payload.count_unique ?? payload.count ?? '').trim();
    if (!display) throw new Error('counter-empty');
    const numeric = Number(display.replace(/\D/g, '')) || 0;
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
        Promise.all(config.routes.map(async (route) => ({
          ...route,
          count: await readCount(normalizePath(config.publicPathPrefix, route.path)),
        }))),
      ]);

      totalNode.textContent = total.display;
      listNode.replaceChildren();
      routeResults
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
      statusNode.textContent = config.privacyLabel;
      panel.closest('[data-analytics-section]').hidden = false;
    } catch (_) {
      panel.closest('[data-analytics-section]').hidden = true;
    }
  };

  showPanel();
})();
