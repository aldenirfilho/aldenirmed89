# Centro da Tripulação Antigravity

Portal estático, privacidade-first e plugável para a comunidade da missão. Ele
oferece:

- métricas **agregadas** de assinantes e visualizações gerais/por seção;
- conta por e-mail e senha por meio do Supabase Auth, quando configurado;
- assinatura diária com consentimento e cancelamento independente da conta;
- preferências de tema, idioma, avisos e perfil público opt-in;
- diretório de usuários e métricas administrativas, solicitados somente depois
  de sessão válida **e** confirmação de administrador pelo servidor;
- Portal de Escuta para agradecimento, sugestão, contribuição, informação,
  notificação, reclamação ou outra manifestação;
- manifestação anônima ou identificada, protocolo verificável e conversa
  assíncrona com a equipe;
- canal geral reservado a comentários, sugestões, pedidos, críticas e
  contribuições próprias ou devidamente autorizadas; materiais de terceiros sem
  direito/licença e dados clínicos identificáveis não devem ser enviados;
- Caderno do Idealizador privado e discreto, exibido somente quando o backend
  confirma `role=owner`, com responsabilidade editorial e verificação de
  credenciais em fluxo separado.

## Estado entregue

O repositório vem deliberadamente em `mode: "disconnected"`. Portanto:

- nenhuma conta é criada ou simulada;
- métricas aparecem como `—`, não como números inventados;
- protocolos não são gerados localmente;
- somente preferências não sensíveis ficam no `localStorage`;
- token de sessão e chave de acompanhamento anônimo ficam apenas em memória;
  uma recarga encerra a sessão e a chave anônima precisa ser digitada novamente.

O arquivo `data/public-metrics.json` declara explicitamente esse estado.

### Matriz de capacidade atual

| Estado | Capacidades |
|---|---|
| **Funciona agora** | Navegação entre painéis, visualização clara/escura, perfis visuais, preferências locais, layout responsivo e indicadores honestos `—` no modo desconectado. |
| **Preparado no código** | Adaptador de autenticação, perfis, assinatura, métricas, diretório, manifestações, Caderno privado, esquema SQL/RLS, gateways de envio identificado/telemetria autenticada com quota e template dry-run do boletim. Esses caminhos ainda precisam de homologação real. |
| **Bloqueado até infraestrutura segura** | Contas, e-mails, números reais, protocolos, conversas, telemetria, diretório administrativo, documentos owner e verificação de credenciais. Gateways autenticados e quota SQL estão implementados em `supabase/`, mas não implantados. CAPTCHA, proteção anônima e provedor de e-mail permanecem pendentes. |

Idioma e notificações são preferências preparadas: ainda não traduzem este
Centro nem enviam alertas. Enquanto `enablePublicProfiles` for `false`, o opt-in
de perfil público permanece desabilitado e nenhum mural é apresentado.

Tema e perfil visual respeitam a preferência global
`antigravity:a11y:v1`: modo `light`, `dark` ou `system` e os mesmos IDs de
perfil usados pela Home. O botão **Claro/Escuro** no cabeçalho também atualiza
essa preferência compartilhada.

## Estrutura

```text
18_Centro_Tripulacao/
├── index.html
├── config.example.js
├── assets/
│   ├── app.js
│   └── styles.css
├── data/public-metrics.json
├── scripts/supabase-schema.sql
├── automation/
│   ├── send_daily_newsletter.mjs
│   ├── newsletter-workflow.example.yml
│   └── README.md
└── ATIVAR_BACKEND.md
```

## Segurança por desenho

- A senha existe apenas na variável do evento durante a chamada TLS ao
  Supabase Auth. O campo é limpo antes da requisição; ela não vai para
  `localStorage`, `sessionStorage`, logs ou banco da aplicação.
- Access token e chave anônima também não são persistidos em Web Storage.
- A `anon key` do Supabase é uma chave pública. A proteção real é RLS.
- A `service-role` ignora RLS e **jamais** pode estar em `index.html`,
  `config.js`, `app.js` ou qualquer bundle público.
- O diretório não é carregado nem renderizado até `session && isAdmin`.
- E-mail, assinatura, telemetria bruta e manifestações não são públicos.
- Perfil público é um opt-in separado e o RPC público devolve somente nome,
  atuação e data de ingresso — nunca e-mail.
- O frontend usa `textContent`/nós DOM, valida tamanhos e restringe destinos por
  allowlist. Não injeta HTML recebido do servidor.
- Manifestação anônima não pode ser listada. O acompanhamento exige protocolo e
  chave secreta, e a chave não é enviada por e-mail, persistida ou registrada
  em logs.
- Criação/consulta anônima e telemetria passam somente por Edge gateways
  allowlisted; os RPCs internos ficam revogados ao navegador.
- Nenhuma biografia, relato, currículo ou rascunho pessoal é salvo em arquivo
  estático. GitHub Pages não é um cofre; esses conteúdos pertencem somente às
  tabelas privadas com RLS.

Leia [ATIVAR_BACKEND.md](./ATIVAR_BACKEND.md) antes de conectar qualquer serviço.

## Evolução de 11/09/2026 — acesso gratuito

- `painel-visitas.html`: filtros diários, visitantes estimados por sessão e páginas acessadas; fonte indisponível nunca vira zero. JSON local importado permanece somente em memória.
- `conectar.html`: roteiro operacional progressivo para GoatCounter, Supabase Auth, associação gratuita, Portal de Escuta e boletim.
- `divulgacao.html`: textos copiáveis e lista de canais em CSV; nenhum contato ou envio é criado.
- `scripts_admin/import_goatcounter_daily.py` (na raiz): conversor local de CSV GoatCounter v2. Exclui bots/eventos e rotas fora do manifesto canônico. Deduplica sessões por dia entre páginas, remove identificadores e conserva SHA-256 da fonte. Recusa sobrescrever a saída.
- O acesso ao site permanece gratuito, sem previsão de cobrança. Nenhuma conta de infraestrutura ou rotina automática foi ativada.

O painel depende de um CSV real com sessões para estimar público diário. Ausência de coleta histórica não pode ser reconstruída. A soma entre dias é visitante-dia, nunca público único no período. O mecanismo Supabase existente continua independente: seu `pageSessionId` identifica carregamentos, não pessoas.

### Gateways autenticados implementados (ainda não implantados)

O pacote `supabase/` acrescenta duas Edge Functions e uma migração de quota. O núcleo valida a sessão real no Supabase Auth, vincula o envio ao UUID/e-mail retornado pelo provedor, exige consentimento, valida origem e limites, e aplica quota atômica por conta com HMAC rotativo por dia. Não loga corpos ou credenciais.

- `crew-manifestations`: somente submissão **identificada**, 5 por hora por conta. Leitura e respostas identificadas continuam pelos RPCs existentes protegidos por RLS.
- `crew-analytics`: somente carregamento autenticado do Centro, 60 tentativas por hora por conta, mantendo deduplicação existente por carregamento/dia. Não mede todo o público do site.
- Anônimo desativado por padrão (`enableAnonymousManifestations: false`): CAPTCHA, proteção contra abuso e homologação precisam preceder qualquer habilitação. Os gateways entregues recusam as ações anônimas.
- Não houve deploy, migração de banco nem teste com usuários reais. Consulte `supabase/README.md` e o guia público `conectar.html`.
