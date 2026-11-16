/* AldenirMed 360X · comportamento da navegação agrupada e das seções recolhíveis.
   - Menus do cabeçalho: um aberto por vez; fecham com Esc, clique fora ou ao escolher um link.
   - Âncoras dentro de <details> fechados (ex.: #pipeline nos bastidores) abrem o bloco antes de rolar.
   Sem dependências e sem armazenamento: tudo acontece nesta página. */
(() => {
  'use strict';
  const groups = [...document.querySelectorAll('.nav-group')];
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('navMenuToggle');
  const menu = document.getElementById('siteNavMenu');

  /* Celular: um botão "Menu" mostra e esconde a navegação completa. */
  const setMenu = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  toggle?.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const closeGroups = (except) => {
    groups.forEach((group) => { if (group !== except) group.open = false; });
  };

  groups.forEach((group) => {
    group.addEventListener('toggle', () => { if (group.open) closeGroups(group); });
    group.querySelectorAll('.nav-panel a').forEach((link) => {
      link.addEventListener('click', () => { group.open = false; });
    });
  });

  document.addEventListener('click', (event) => {
    if (!groups.some((group) => group.open)) return;
    if (!event.target.closest('.nav-group')) closeGroups(null);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = groups.find((group) => group.open);
    if (open) {
      open.open = false;
      open.querySelector('summary')?.focus();
      return;
    }
    if (nav?.classList.contains('menu-open')) {
      setMenu(false);
      toggle?.focus();
    }
  });

  /* Abre os <details> ancestrais de um alvo de âncora. */
  const revealTarget = (id) => {
    if (!id) return null;
    let target = null;
    try { target = document.getElementById(decodeURIComponent(id)); } catch (_) { target = null; }
    if (!target) return null;
    let node = target.parentElement;
    while (node) {
      if (node.tagName === 'DETAILS' && !node.open) node.open = true;
      node = node.parentElement;
    }
    return target;
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    revealTarget(link.getAttribute('href').slice(1));
  }, true);

  const fromHash = () => {
    const target = revealTarget(location.hash.slice(1));
    if (target && target.closest('details')) {
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
