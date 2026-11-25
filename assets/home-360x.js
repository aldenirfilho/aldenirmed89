/* AldenirMed 360X · comportamento da navegação agrupada e das seções recolhíveis.
   - Menus do cabeçalho: um aberto por vez; fecham com Esc, clique fora ou ao escolher um link.
   - Âncoras dentro de <details> fechados (ex.: #pipeline nos bastidores) abrem o bloco antes de rolar.
   Sem dependências e sem armazenamento: tudo acontece nesta página. */
(() => {
  'use strict';
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const groups = [...nav.querySelectorAll('.nav-group')];
  const toggle = document.getElementById('navMenuToggle');
  const menu = document.getElementById('siteNavMenu');
  const compactNav = window.matchMedia('(max-width: 1100px)');

  /* Celular: um botão "Menu" mostra e esconde a navegação completa. */
  const setMenu = (open) => {
    nav.classList.toggle('menu-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    if (!open) closeGroups(null);
  };

  const closeGroups = (except) => {
    groups.forEach((group) => { if (group !== except) group.open = false; });
  };

  toggle?.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  compactNav.addEventListener('change', () => setMenu(false));
  menu?.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (compactNav.matches) setMenu(false);
    else closeGroups(null);
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) return;
    const target = revealTarget(href.slice(1));
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  groups.forEach((group) => {
    group.addEventListener('toggle', () => { if (group.open) closeGroups(group); });
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && nav.classList.contains('menu-open')) setMenu(false);
    if (!event.target.closest('.nav-group')) closeGroups(null);
  });

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.key !== 'Escape') return;
    const open = groups.find((group) => group.open);
    if (open) {
      event.preventDefault();
      open.open = false;
      open.querySelector('summary')?.focus();
      return;
    }
    if (nav?.classList.contains('menu-open')) {
      event.preventDefault();
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
