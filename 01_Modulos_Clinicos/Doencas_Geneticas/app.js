(() => {
  'use strict';
  const key = 'antigravity:a11y:v1';
  const themeButton = document.getElementById('themeToggle');
  const preference = () => { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; } };
  const applyTheme = () => {
    const state = preference();
    const light = state.theme === 'light' || (state.theme === 'system' && matchMedia('(prefers-color-scheme: light)').matches) || (!state.theme && state.clarity === true);
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    themeButton.setAttribute('aria-pressed', String(light));
    themeButton.setAttribute('aria-label', light ? 'Ativar visualização escura' : 'Ativar visualização clara');
    themeButton.textContent = light ? '🌙 Tema escuro' : '☀️ Tema claro';
  };
  applyTheme();
  themeButton.addEventListener('click', () => {
    const state = preference();
    const light = document.documentElement.dataset.theme !== 'light';
    try { localStorage.setItem(key, JSON.stringify({ ...state, theme: light ? 'light' : 'dark', clarity: light })); } catch {}
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    themeButton.setAttribute('aria-pressed', String(light));
    themeButton.setAttribute('aria-label', light ? 'Ativar visualização escura' : 'Ativar visualização clara');
    themeButton.textContent = light ? '🌙 Tema escuro' : '☀️ Tema claro';
  });
  window.addEventListener('storage', e => { if (e.key === key) applyTheme(); });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
  document.getElementById('printModule').addEventListener('click', () => window.print());
  const search = document.getElementById('atlasSearch');
  const cards = [...document.querySelectorAll('[data-visual-id]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let category = 'todos';
  const filter = () => {
    let count = 0;
    cards.forEach(card => {
      const visible = (category === 'todos' || card.dataset.category === category) && normalize(card.textContent + ' ' + card.querySelector('img').alt).includes(normalize(search.value.trim()));
      card.hidden = !visible;
      if (visible) count++;
    });
    document.getElementById('atlasCount').textContent = `${count} de 10 imagens`;
    document.getElementById('atlasEmpty').hidden = count > 0;
  };
  search.addEventListener('input', filter);
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filter();
  }));
})();
