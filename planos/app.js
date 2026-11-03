'use strict';

// A vitrine nunca decide preços nem concede acesso. Toda compra passa pela
// identidade e pelo catálogo mantidos no servidor da área de membros.
(async function configurePlans() {
  const buttons = [...document.querySelectorAll('[data-plan]')];
  try {
    const response = await fetch('config.json', { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) return;
    const config = await response.json();
    if (config.salesEnabled !== true) return;
    const provider = ['stripe', 'hotmart'].find(name => config.providers?.[name]?.enabled === true);
    if (!provider) return;
    for (const button of buttons) {
      const plan = button.dataset.plan;
      if (!['basico', 'pro', 'ultra'].includes(plan)) continue;
      // O servidor revalida disponibilidade, preço e assinatura existente.
      // Nenhuma URL arbitrária da configuração é aberta pelo navegador.
      button.disabled = false;
      button.textContent = 'Continuar com minha conta';
      button.addEventListener('click', () => {
        const target = new URL('../membros/', window.location.href);
        target.searchParams.set('plan', plan);
        target.searchParams.set('provider', provider);
        window.location.assign(target.href);
      });
    }
  } catch (_) {
    // Sem configuração válida, mantém a compra fechada.
  }
}());
