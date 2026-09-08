(() => {
  'use strict';
  const panel = document.querySelector('.neuro-install');
  if (!panel) return;
  const button = panel.querySelector('[data-neuro-install]');
  const status = panel.querySelector('[data-neuro-status]');
  const installStatus = panel.querySelector('[data-install-status]');
  const standalone = window.matchMedia('(display-mode: standalone)');
  let deferredPrompt = null;
  const installed = () => standalone.matches || navigator.standalone === true;
  function showInstalled() {
    button.hidden = true;
    deferredPrompt = null;
    installStatus.textContent = 'Você está usando a Semiologia como app independente.';
  }
  if (installed()) showInstalled();
  if (location.hash === '#instalar-app') panel.open = true;
  window.addEventListener('hashchange', () => {
    if (location.hash === '#instalar-app') panel.open = true;
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    if (installed()) return;
    deferredPrompt = event;
    button.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    button.hidden = true;
    deferredPrompt = null;
    installStatus.textContent = 'Semiologia instalada. Abra pelo ícone próprio no seu aparelho.';
  });
  standalone.addEventListener?.('change', () => { if (installed()) showInstalled(); });
  button.addEventListener('click', async () => {
    const prompt = deferredPrompt;
    if (!prompt) return;
    deferredPrompt = null;
    button.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      installStatus.textContent = choice.outcome === 'accepted'
        ? 'Instalação solicitada ao navegador. Conclua a confirmação no seu aparelho.'
        : 'Instalação adiada. Você pode continuar usando a seção no navegador.';
    } catch (_) {
      installStatus.textContent = 'Use o menu do navegador para instalar, seguindo as instruções abaixo.';
    } finally {
      button.disabled = false;
      button.hidden = true;
    }
  });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Para preparar o acesso sem internet, abra esta seção pelo endereço HTTPS do site.';
    return;
  }
  const appRoot = new URL('../', document.currentScript.src);
  const ready = () => {
    status.textContent = 'Textos, casos e ferramentas preparados para acesso sem internet. Imagens ficam disponíveis depois de consultadas. O navegador pode liberar esse armazenamento.';
  };
  navigator.serviceWorker.register(new URL('sw.js', appRoot), {scope: appRoot.href, updateViaCache:'none'})
    .then(registration => {
      if (registration.active) ready();
      const worker = registration.installing || registration.waiting;
      if (worker) worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') ready();
        if (worker.state === 'redundant' && !registration.active) {
          status.textContent = 'O preparo sem internet não terminou. Mantenha a conexão e abra a seção novamente.';
        }
      });
    }).catch(() => {
      status.textContent = 'A seção continua disponível online. O navegador não concluiu o preparo sem internet.';
    });
})();
