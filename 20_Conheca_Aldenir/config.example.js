/*
 * Configuração pública do canal Conheça Aldenir.
 *
 * Este arquivo nunca deve conter senha, token, chave privada, service role,
 * client secret ou segredo de assinatura. O gateway guarda os segredos no
 * servidor e aplica autenticação, limitação de taxa, validação e auditoria.
 */
window.ANTIGRAVITY_IDEALIZER_CONFIG = Object.freeze({
  mode: "disconnected",
  conversationEndpoint: "",
  threadEndpoint: "",
  allowedGatewayOrigins: [],
  contactEmail: "",
  suggestedEmailIdentity: "AldenGrav360",
  maxMessageLength: 3000,
  minimumSubmissionIntervalMs: 60000,
  requestTimeoutMs: 12000
});
