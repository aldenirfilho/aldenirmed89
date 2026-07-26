/*
 * CONFIGURAÇÃO PÚBLICA — copie este arquivo para config.js somente depois
 * de criar o backend. A chave anon do Supabase é pública por desenho e fica
 * protegida por RLS. NUNCA coloque service-role, senha ou segredo aqui.
 *
 * Se usar config.js, troque a última tag de script em index.html para:
 *   <script src="./config.js"></script>
 */
window.ANTIGRAVITY_CREW_CONFIG = Object.freeze({
  mode: "disconnected",
  supabaseUrl: "",
  supabaseAnonKey: "",
  allowedAppOrigins: [
    "https://aldenirfilho.github.io",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
  ],
  allowedApiOrigins: [],
  // Edge Function HTTPS exata; vazia = não registrar visualização.
  analyticsEndpoint: "",
  // Gateway HTTPS obrigatório para criar/consultar manifestação anônima.
  manifestationEndpoint: "",
  institutionalEmail: "",
  enablePublicProfiles: false
});
