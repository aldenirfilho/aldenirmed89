/* Preferência compartilhada com o AldenirMed89; sem acesso à rede. */
(() => {
  try {
    const prefs = JSON.parse(localStorage.getItem('antigravity:a11y:v1') || '{}') || {};
    const root = document.documentElement;
    const systemLight = matchMedia('(prefers-color-scheme: light)').matches;
    const light = !prefs.contrast && (prefs.theme === 'light' || (prefs.theme === 'system' && systemLight) || (prefs.theme == null && prefs.clarity === true));
    root.dataset.theme = light ? 'light' : 'dark';
    root.classList.toggle('a11y-contrast', prefs.contrast === true);
    root.classList.toggle('a11y-large-text', prefs.large === true);
    root.classList.toggle('a11y-reduce-motion', prefs.motion === true);
    const scale = Number(localStorage.getItem('antigravity:rcp:v1:font'));
    if (scale >= 90 && scale <= 130) root.style.fontSize = scale + '%';
  } catch (_) { /* A leitura permanece disponível com armazenamento bloqueado. */ }
})();
