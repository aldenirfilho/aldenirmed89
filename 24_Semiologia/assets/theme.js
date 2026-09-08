(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const root = document.documentElement;
  const key = 'antigravity:a11y:v1';
  let prefs = {};
  try { const p = JSON.parse(localStorage.getItem(key) || '{}'); if (p && typeof p === 'object' && !Array.isArray(p)) prefs = p; } catch (_) {}
  const apply = () => {
    const light = prefs.theme === 'light' || (!prefs.theme && prefs.clarity === true) || (prefs.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches);
    root.dataset.theme = light ? 'light' : 'dark';
    root.classList.toggle('a11y-large-text', prefs.large === true);
    root.classList.toggle('a11y-reduce-motion', prefs.motion === true);
    root.classList.toggle('a11y-contrast', prefs.contrast === true);
    const button = document.getElementById('theme-toggle');
    if (button) { button.textContent = light ? '☾ Escuro' : '☀ Claro'; button.setAttribute('aria-label', light ? 'Ativar visualização escura' : 'Ativar visualização clara'); button.setAttribute('aria-pressed', String(light)); }
  };
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', apply);
  window.addEventListener('storage', event => { if(event.key === key) { try { const p=JSON.parse(event.newValue || '{}'); if(p && typeof p==='object' && !Array.isArray(p)) { prefs=p;apply(); } } catch(_) {} } });
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      prefs.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      prefs.clarity = prefs.theme === 'light';
      try { localStorage.setItem(key, JSON.stringify(prefs)); } catch (_) {}
      apply();
    });
    const menu = document.getElementById('menu-toggle'), rail = document.getElementById('course-nav');
    menu?.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open)); rail.classList.toggle('is-open', open);
    });
    rail?.addEventListener('click', e => { if(e.target.closest('a')) { rail.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); } });
    document.addEventListener('keydown', e => { if(e.key==='Escape' && rail?.classList.contains('is-open')) { rail.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.focus(); } });
  });
  window.addEventListener('load', async () => {
    const status = document.getElementById('offline-status');
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    try {
      const registration = await navigator.serviceWorker.register(new URL('../sw.js', scriptURL));
      const installing = registration.installing || registration.waiting;
      const report = () => { if(status) status.textContent = '✓ Aulas e áudios salvos offline; imagens ficam disponíveis após serem abertas com conexão'; };
      if (installing) {
        if(status) status.textContent='Salvando aulas e áudios para uso offline…';
        installing.addEventListener('statechange', () => {
          if(installing.state==='activated') report();
          if(installing.state==='redundant' && status) status.textContent='O salvamento offline não terminou. Reabra com conexão para tentar novamente.';
        });
      } else if (registration.active) report();
    } catch (_) { if(status) status.textContent='Conteúdo online; salvamento offline indisponível neste navegador.'; }
  });
})();
