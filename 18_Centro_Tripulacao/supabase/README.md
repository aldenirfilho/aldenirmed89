# Gateways de associação — implantação separada do site

Código servidor implementado em 12/09/2026 UTC (11/09 em Fortaleza). **Não implantado.** O site é gratuito, sem previsão de cobrança. Esta pasta inteira é excluída do artefato GitHub Pages; versionar código não configura uma conta Supabase.

## Capacidades e limites

| Função | Aceita | Proteções | Resultado |
|---|---|---|---|
| `crew-manifestations` | POST `action=submit`, modalidade identificada e consentimento | Origin exato, JWT da plataforma, usuário real confirmado no Auth, limite do corpo/campos, quota atômica de 5 novos envios/hora/conta | Protocolo e ID produzidos pelo RPC existente |
| `crew-analytics` | POST `sectionSlug=centro-tripulacao` e `pageSessionId` de 32 caracteres hexadecimais após login | Mesma verificação de conta, quota de 60 tentativas/hora/conta, seção allowlisted | Registro deduplicado por carregamento/dia |

As funções recusam envio, consulta e resposta **anônimos**. Não há CAPTCHA implementado. A interface os mantém desativados com `enableAnonymousManifestations: false`. Um futuro gateway anônimo precisa de CAPTCHA acessível, proteção de borda e testes próprios; não habilite a flag com o código atual.

Leitura e resposta identificadas continuam usando `crew_manifestation_thread` / `reply_manifestation` com token do usuário e as políticas existentes. A quota nova protege submissões, não substitui essas políticas nem limita os RPCs antigos de resposta. A telemetria nova abrange usuários autenticados no Centro e nunca deve ser somada ao público GoatCounter do site.

## 1. Preparar o projeto e o banco

1. Você escolhe/cria um projeto Supabase de **homologação** e confirma seu e-mail.
2. Configure e-mail + senha com confirmação, SMTP e origens de retorno oficiais. Crie uma conta comum para teste e mantenha outra separada para administração.
3. Aplique primeiro `../scripts/supabase-schema.sql` no SQL Editor do projeto correto. O arquivo contém o esquema de perfis, consentimento, manifestações e RLS já existente.
4. Depois aplique `migrations/202609120001_crew_gateway_limits.sql`. Ele cria apenas o estado privado de quota e seu RPC. Não modifica dados de usuários existentes.
5. Verifique que anon e authenticated não têm leitura/escrita/EXECUTE da quota e que apenas service_role executa `crew_consume_gateway_quota`. Valide os acessos de usuário comum e administrador descritos no guia base.

Os limites usam `INSERT ... ON CONFLICT ... WHERE hits < limite`, no banco, para evitar depender da memória de uma única instância Edge. São janelas fixas de hora UTC. Não são proteção absoluta contra várias contas ou DDoS; configure limites de plataforma e monitoramento de custo antes de abrir o cadastro amplamente.

## 2. Segredos exclusivamente no servidor

A função usa as variáveis provisionadas pelo Supabase:

- `SUPABASE_URL` (hostname exato `https://<project-ref>.supabase.co`).
- `SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS`, mapa JSON com chave `default`; ou as legadas `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.
- `CREW_ALLOWED_ORIGINS`: lista de origens separadas por vírgula, sem caminho e sem curinga. Produção: `https://aldenirfilho.github.io`. Localhost só no ambiente de homologação.
- `CREW_RATE_LIMIT_SALT`: valor aleatório de pelo menos 32 caracteres, criado no gerenciador de segredos e mantido privado. Nenhuma chave real é fornecida no repositório.

Configure no dashboard Supabase, na área de secrets de Edge Functions. Alternativamente, use a CLI já autenticada e um arquivo privado fora do checkout, sem imprimir seu conteúdo:

```sh
supabase secrets set --env-file /caminho/privado/crew.env --project-ref REF_REAL
```

`REF_REAL` e os caminhos são marcadores que você substitui pelos valores do seu projeto. Não salve segredos no frontend, em commits, logs ou transcrições. O gateway não registra headers, corpos, UUIDs, e-mails ou tokens em logs e devolve erros genéricos. Verifique também as configurações de logging do provedor.

## 3. Implantar as duas funções

Na raiz `18_Centro_Tripulacao/`, com a CLI Supabase instalada e autenticada:

```sh
supabase functions deploy crew-manifestations --project-ref REF_REAL
supabase functions deploy crew-analytics --project-ref REF_REAL
```

A CLI encontra o diretório `supabase/` nesta pasta. `config.toml` mantém `verify_jwt = true`. Além da checagem de plataforma, o handler consulta `/auth/v1/user` com o bearer recebido e só aceita usuário confirmado. Não confia em claims simplesmente decodificadas nem em `p_verified_user_id` / `p_verified_email` enviados pelo navegador; esses campos são rejeitados e preenchidos pelo servidor.

A chamada privilegiada ao banco usa somente o segredo servidor. A identidade é definida pelo resultado do Auth. Quando o usuário não consente contato, o RPC recebe e-mail nulo.

## 4. Homologar antes de conectar a página pública

Use a sua conta de teste confirmada, nunca dados de pacientes. Teste:

1. `OPTIONS` da origem permitida tem CORS exato e não produz escrita; origem diferente é rejeitada.
2. Bearer ausente, inválido, expirado, conta não confirmada e conta anônima não criam manifestações/telemetria.
3. Um envio identificado válido cria **um protocolo no banco** vinculado ao UUID validado. A resposta do servidor não inclui e-mail, token ou chave.
4. Outra conta não consegue ler nem responder à conversa. O administrador autorizado consegue responder pelo fluxo existente.
5. O sexto novo envio da mesma conta na hora recebe 429; tentativas rejeitadas não geram protocolo. O contador deve resistir a requisições concorrentes.
6. A telemetria repete o mesmo `pageSessionId` sem duplicar a visualização no mesmo dia. Login e navegação continuam funcionando se ela falhar.
7. Anônimo segue indisponível; nenhuma ativação de CAPTCHA, newsletter ou envio de e-mail é alegada por esses testes.

O pacote tem 12 cenários automatizados com Auth/RPC simulados, executáveis da raiz do repositório:

```sh
node tests/crew_gateways.test.mjs
python3 -m unittest tests.test_crew_gateways
```

Não houve execução no runtime Deno hospedado nem migração/teste contra Postgres real nesta entrega. Os testes de lógica não substituem a homologação acima.

## 5. Conectar o frontend após os testes

Prepare `config.js` a partir de `config.example.js`, com:

- `mode: "connected"`, URL do projeto, chave pública e origens allowlisted;
- `manifestationEndpoint: "https://<project-ref>.supabase.co/functions/v1/crew-manifestations"`;
- `analyticsEndpoint: "https://<project-ref>.supabase.co/functions/v1/crew-analytics"`;
- `enableAnonymousManifestations: false` e `enablePublicProfiles: false`.

Troque somente a tag de `config.example.js` para `config.js` na página, preserve `app.js` e autorize o hostname exato no `connect-src` da CSP. Não publique segredo/salt. A autenticação, preferências e consentimento ficam disponíveis com o backend real; os e-mails diários ainda dependem da configuração e homologação do template de newsletter.

## Retenção e operação

A tabela de quota contém apenas escopo, hora, contagem e HMAC do UUID autenticado rotativo por dia UTC. O salt permanece no servidor. Não contém corpo, e-mail, token ou IP. Defina retenção e acompanhamento de abuso conforme a operação; nenhum job de exclusão ou cronograma foi instalado. Revise logging, limites de plataforma e custos do plano escolhido. A gratuidade para leitores do site não garante infraestrutura ilimitada gratuita.

Fontes técnicas: [autenticação Edge](https://supabase.com/docs/guides/functions/auth), [headers de autorização](https://supabase.com/docs/guides/functions/auth-headers), [segredos de ambiente](https://supabase.com/docs/guides/functions/secrets).
