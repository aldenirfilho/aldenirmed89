/* ============================================================
   CONFIGURAÇÃO DO JORNAL DIÁRIO 360 — edite só este arquivo.
   Cole aqui os links de pagamento criados no painel do Stripe
   (ou da Hotmart). Link vazio = botão aparece como "em breve".
   ============================================================ */
window.J360_CONFIG = {
  appName: "Jornal Diário 360",
  // Links de apoio (Stripe Payment Links ou checkout da Hotmart)
  links: {
    leitor: "",   // Leitor Apoiador — R$ 19,90/mês
    patrono: "",  // Patrono 360 — R$ 49,90/mês
    avulso: ""    // Apoio avulso — pague quanto quiser
  },
  // Portal do cliente Stripe (para o apoiador cancelar sozinho). Opcional.
  portalCliente: "",
  // E-mail público de contato (use um e-mail profissional, não o pessoal)
  contato: "",
  // Endereço público do app (para compartilhamento)
  urlPublica: "https://aldenirfilho.github.io/aldenirmed89/jornal-360/app/"
};
