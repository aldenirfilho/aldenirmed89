(() => {
  'use strict';
  const loader = document.querySelector('script[data-antigravity-analytics]');
  const panel = document.querySelector('[data-analytics-panel]');
  const siteCode = (loader?.dataset.siteCode || '').trim();
  const publicHost = (loader?.dataset.publicHost || '').trim();
  const isPublicSite = location.protocol === 'https:' && location.hostname === publicHost;
  const enabled = loader && loader.dataset.enabled === 'true';
  const validCode = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/.test(siteCode);
  const endpoint = validCode ? `https://${siteCode}.goatcounter.com` : '';

  // Optional collection and public reporting are independent: blocked storage
  // must not hide the panel or prevent a read-only metrics query.
  if (enabled && isPublicSite && validCode) {
    try {
      window.localStorage.getItem('antigravity:analytics:storage-check');
      const counterScript = document.createElement('script');
      counterScript.async = true;
      counterScript.src = 'https://gc.zgo.at/count.js';
      counterScript.dataset.goatcounter = `${endpoint}/count`;
      counterScript.referrerPolicy = 'strict-origin-when-cross-origin';
      document.head.append(counterScript);
    } catch (_) { /* Collection stays disabled when browser storage is denied. */ }
  }
  if (!panel) return;
  const section = panel.closest('[data-analytics-section]');
  const totalNode = panel.querySelector('[data-analytics-total]');
  const listNode = panel.querySelector('[data-analytics-ranking]');
  const statusNode = panel.querySelector('[data-analytics-status]');
  const stampNode = section?.querySelector('[data-analytics-updated]');
  const refresh = section?.querySelector('[data-analytics-refresh]');
  if (!totalNode || !listNode || !statusNode) return;
  if (section) section.hidden = false;
  let running = false;

  const json = async url => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {
        credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: controller.signal,
      });
      if (!response.ok) throw new Error(`source-${response.status}`);
      return await response.json();
    } finally { clearTimeout(timer); }
  };
  const readCount = async path => {
    const payload = await json(`${endpoint}/counter/${encodeURIComponent(path)}.json`);
    const display = String(payload.count ?? '').trim();
    if (!/^[0-9][0-9., \u00a0]*$/.test(display)) throw new Error('counter-invalid');
    const numeric = Number(display.replace(/[., \u00a0]/g, ''));
    if (!Number.isSafeInteger(numeric) || numeric < 0) throw new Error('counter-invalid');
    return {display, numeric};
  };
  const message = text => { statusNode.textContent = text; };
  const empty = text => { const item = document.createElement('li'); item.textContent = text; listNode.append(item); };
  const showPanel = async () => {
    if (running) return;
    if (!enabled || !validCode || !isPublicSite || loader.dataset.counterEnabled !== 'true') {
      message('Contador disponível no endereço público do site após ativação na conta de métricas. Nesta prévia, consulte o painel diário e o protocolo de ativação. Nenhum número foi estimado.');
      return;
    }
    running = true;
    panel.setAttribute('aria-busy', 'true');
    if (refresh) refresh.disabled = true;
    message('Consultando a fonte de audiência…');
    // Clear previous observations before each query; an error never looks current.
    totalNode.textContent = '—';
    listNode.replaceChildren();
    try {
      const config = await json(loader.dataset.config);
      if (config.enabled !== true || config.visitorCounterEnabled !== true || config.siteCode !== siteCode || !Array.isArray(config.routes)) throw new Error('config-invalid');
      const prefix = config.publicPathPrefix;
      if (typeof prefix !== 'string' || !/^\/[a-zA-Z0-9_-]+\/$/.test(prefix)) throw new Error('prefix-invalid');
      const routes = config.routes.filter(route => route && typeof route === 'object' && typeof route.label === 'string' && typeof route.path === 'string' && /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html$/.test(route.path)).slice(0, 30);
      const path = route => route.path === 'index.html' ? prefix : prefix + route.path.replace(/(^|\/)index\.html$/i, '$1');
      // Failure of TOTAL must not discard successful section observations.
      const [total, ...results] = await Promise.allSettled([
        readCount('TOTAL'), ...routes.map(async route => ({...route, count: await readCount(path(route))})),
      ]);
      const available = results.filter(result => result.status === 'fulfilled').map(result => result.value);
      if (total.status === 'fulfilled') totalNode.textContent = total.value.display;
      available.sort((a, b) => b.count.numeric - a.count.numeric).slice(0, 5).forEach(route => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = route.path === 'index.html' ? './' : route.path.replace(/(^|\/)index\.html$/i, '$1');
        link.textContent = route.label;
        const count = document.createElement('strong');
        count.textContent = route.count.display;
        item.append(link, count); listNode.append(item);
      });
      if (!available.length) empty('Contagens das seções indisponíveis.');
      if (total.status !== 'fulfilled' && !available.length) {
        message('Métricas indisponíveis: a fonte não autorizou ou não respondeu. Isso não significa zero visitantes. Use o protocolo de ativação para liberar o contador público ou consulte um relatório agregado no painel diário.');
      } else {
        message(`Fonte: GoatCounter. Contagens acumuladas por página/sessão; não representam pessoas únicas no site nem visitas do dia. Ranking limitado às seções acompanhadas. A origem pode levar até 4 horas para atualizar.${total.status !== 'fulfilled' || available.length < routes.length ? ' Consulta parcial: algumas contagens estão indisponíveis.' : ''}`);
      }
    } catch (_) {
      empty('Aguardando uma fonte de audiência disponível.');
      message('Métricas indisponíveis: não foi possível validar ou consultar a fonte. Isso não significa zero visitantes. Consulte o protocolo de ativação e o painel diário.');
    } finally {
      if (stampNode) stampNode.textContent = `Última consulta: ${new Date().toLocaleString('pt-BR', {timeZone: 'America/Fortaleza'})} (Fortaleza).`;
      panel.setAttribute('aria-busy', 'false');
      if (refresh) refresh.disabled = false;
      running = false;
    }
  };
  refresh?.addEventListener('click', showPanel);
  // Defer the optional ranking requests until the visitor approaches the section.
  if (enabled && isPublicSite && validCode && 'IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect(); showPanel();
    }, {rootMargin: '300px'});
    observer.observe(panel);
    message('As contagens serão consultadas ao abrir esta seção. Você também pode usar Atualizar audiência.');
  } else { showPanel(); }
})();
