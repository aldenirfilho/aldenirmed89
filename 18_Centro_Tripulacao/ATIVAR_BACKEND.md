# Ativar o backend com segurança

> Faça primeiro em um projeto de homologação. O site funciona de forma honesta
> e limitada sem backend; não existe urgência para conectar credenciais.

## 1. Criar e proteger o projeto Supabase

1. Crie um projeto Supabase dedicado.
2. Em **Authentication → Providers**, habilite e-mail + senha e exija confirmação
   de e-mail.
3. Defina URLs de redirecionamento somente para os domínios oficiais HTTPS e
   para um `localhost` específico de homologação.
4. Ative proteção contra senhas vazadas e limite tentativas de login.
5. Execute `scripts/supabase-schema.sql` no SQL Editor.
6. Crie o primeiro administrador manualmente, como `owner`, usando o UUID exato
   do usuário Auth. Não ofereça no frontend uma função de “tornar admin”.
7. Teste RLS com três sessões: `anon`, tripulante comum e admin.

O esquema contém `profiles`, `subscriptions`, `admin_users`, `section_views`,
`section_daily_aggregates`, `manifestations` e `manifestation_messages`, todos
com RLS. Funções `SECURITY DEFINER` têm `search_path` fixo e permissões
específicas.

### Bootstrap manual da conta owner

O repositório não cria conta, senha, e-mail ou UUID. Para iniciar:

1. no painel administrativo do Supabase Auth, convide/crie a conta real do
   responsável e conclua a confirmação de e-mail;
2. copie o UUID real exibido pelo Auth — não use um valor inventado;
3. como owner do banco, execute manualmente:

```sql
insert into public.admin_users (user_id, role, reason)
values ('UUID-REAL-DO-USUARIO-AUTH', 'owner', 'Responsável inicial da missão');
```

`UUID-REAL-DO-USUARIO-AUTH` é marcador de documentação, não uma conta. A senha
é definida somente pelo fluxo do provedor e nunca por SQL, GitHub ou este site.
Outros operadores recebem `role='admin'`; mantenha apenas o mínimo necessário
de owners e audite qualquer alteração.

## 2. Configurar a aplicação pública

Copie `config.example.js` para `config.js`, preencha e faça o `index.html`
carregar `config.js`.

```js
window.ANTIGRAVITY_CREW_CONFIG = Object.freeze({
  mode: "connected",
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseAnonKey: "SUA-ANON-KEY-PUBLICA",
  allowedAppOrigins: [
    "https://aldenirfilho.github.io",
    "http://127.0.0.1:8000"
  ],
  allowedApiOrigins: [
    "https://SEU-PROJETO.supabase.co"
  ],
  analyticsEndpoint: "",
  manifestationEndpoint: "",
  institutionalEmail: "",
  enablePublicProfiles: false
});
```

Depois, ajuste a política CSP de `index.html` para o hostname exato do projeto:
substitua `connect-src 'self'` por, por exemplo,
`connect-src 'self' https://SEU-PROJETO.supabase.co`. Não use curinga.
O `allowedAppOrigins` recebe **origens**, sem caminho;
`https://aldenirfilho.github.io/antigravity-consultas/` tem origem
`https://aldenirfilho.github.io`.

### O que pode e o que não pode estar no frontend

- `supabaseUrl`: público.
- `supabaseAnonKey`: público por desenho, desde que RLS esteja correto.
- `institutionalEmail`: público quando houver um endereço oficial aprovado.
- `service-role`: **nunca**. Ela ignora RLS e só pode existir como secret de
  automação/servidor.
- chaves de provedor de e-mail, CAPTCHA e salts: **nunca**.
- access token: somente em memória; uma recarga exige novo login.
- chave da conversa anônima: mostrada/copiada uma vez e nunca persistida.

## 3. E-mail institucional

Não há endereço inventado no código. Enquanto `institutionalEmail` estiver
vazio ou inválido, a interface mostra **“Canal de e-mail em configuração”**.

Quando a organização definir um endereço monitorado e aprovar sua política de
retenção, preencha esse campo. Não use caixa pessoal.

## 4. Portal de Escuta e proteção contra abuso

O formulário exige categoria, assunto, mensagem e consentimento. “Outra” exige
uma especificação. O banco:

- cria manifestação anônima somente pelo RPC validado `submit_manifestation`,
  sem `INSERT`/`SELECT` direto para `anon` ou `authenticated`;
- associa manifestação identificada a `auth.uid()`;
- permite ao usuário autenticado ler somente a própria;
- libera leitura/resposta geral somente a `admin_users`;
- protege conversa anônima com protocolo + chave secreta hasheada;
- nunca expõe e-mail em RPC público.

Os RPCs `submit_manifestation`, `crew_anonymous_thread` e
`reply_anonymous_manifestation` estão revogados para `anon` e `authenticated`;
somente `service_role` pode executá-los. Antes de abrir o canal, implemente uma
Supabase Edge Function, informe sua URL exata em `manifestationEndpoint` e
aplique:

1. allowlist de origem e checagem estrita de `Origin`;
2. CAPTCHA acessível (por exemplo, Turnstile) no envio anônimo;
3. rate limit por IP hasheado no servidor (não armazene IP bruto);
4. limite por protocolo/chave e janela de tempo;
5. tamanho máximo de corpo igual ou menor ao banco;
6. moderação de spam, retenção definida e trilha de auditoria;
7. respostas de erro genéricas para evitar enumeração de protocolo.

Se `manifestationEndpoint` estiver vazio, a interface desabilita o envio e
declara que o gateway está pendente. Não libere EXECUTE direto como atalho.
Para envio identificado, a Edge Function deve validar o bearer token com
`auth.getUser()`, ignorar qualquer e-mail/UUID vindo do corpo do navegador e
preencher `p_verified_user_id` e `p_verified_email` exclusivamente com o usuário
devolvido pelo provedor. No envio anônimo, esses dois argumentos ficam nulos.

A conversa é assíncrona. Não rotule como IA, “tempo real” ou resposta imediata.
Defina um SLA humano somente quando a equipe tiver capacidade real.

## 5. Métricas de visualização

O frontend cria um `pageSessionId` aleatório por carregamento do documento e o
reutiliza em qualquer registro feito durante esse carregamento.
`record_section_view` deduplica seção/carregamento/dia e armazena somente um hash
efêmero, sem IP; recarregar a página inicia uma nova visualização. Os papéis
`anon` e `authenticated` não podem executar esse RPC nem inserir na tabela.
Configure `analyticsEndpoint` para uma Edge Function HTTPS cuja
origem esteja em `allowedApiOrigins`. Somente essa função, validando a allowlist
de `Origin` e aplicando rate limit, chama o RPC como `service_role`. Se o
endpoint estiver vazio ou falhar, o frontend não registra nada e nunca cria
uma contagem local.

Não grave:

- diagnóstico, pesquisa clínica ou conteúdo lido por pessoa;
- URL completa com parâmetros;
- IP, user-agent ou identificadores publicitários;
- qualquer trilha individual para o diretório.

Exiba somente os agregados de `crew_public_metrics`. Se a consulta falhar,
continue exibindo `—`.

## 5.1 Perfil público opcional

`public_profile` começa falso e `crew_public_profiles` não tem EXECUTE para
`anon`/`authenticated`. Se a missão decidir abrir um mural:

1. revise os quatro campos projetados pelo RPC (nunca e-mail);
2. ative `enablePublicProfiles: true`;
3. conceda `grant execute on function public.crew_public_profiles() to anon,
   authenticated;`;
4. ofereça revogação imediata do opt-in e teste cache/remoção.

Não conceda acesso público à tabela `profiles`.

## 5.2 Caderno do Idealizador e responsabilidade editorial

GitHub Pages publica qualquer arquivo versionado. Portanto, não crie Markdown,
JSON, HTML, imagem ou anexo público com biografia, currículo, história pessoal,
experiências ou reflexões privadas. O Caderno grava somente em
`owner_documents`, protegido por RLS e `is_crew_owner()`.

Categorias permitidas: `biografia`, `curriculo`, `historia`, `experiencia`,
`reflexao`, `posicao`, `explicacao` e `legado`. Estados editoriais:
`draft`, `review`, `private` e `publish-approved`. Mesmo
`publish-approved` continua privado e exige `publication_workflow_reference`;
não há view, RPC nem exportação pública automática.

Uma futura publicação exige um fluxo separado e auditável:

1. revisão factual, editorial, de privacidade e risco;
2. recorte explícito do que será publicado;
3. consentimento e aprovação registrados fora do documento bruto;
4. exportação redigida para um novo artefato público;
5. possibilidade de correção ou retirada.

O Caderno registra memória e responsabilidade, não superioridade, certificação
ou autoridade clínica automática.

Credenciais ficam em `owner_credential_verifications`, separadas dos textos. O
owner só pode inserir alegações `pending` e lê as próprias; não recebe
`UPDATE`. Somente um processo backend independente com `service_role` pode
registrar método, revisor e data de verificação. Até então, a interface marca a
alegação como não verificada.

## 6. Newsletter consentida

O template em `automation/` está fora de `.github/workflows`, portanto não roda.
Ele:

- inicia em dry-run;
- seleciona somente `status=active`, `frequency=daily`, `consent_at != null` e
  `unsubscribed_at is null`;
- não imprime endereços;
- exige `--send` **e** `CONFIRM_NEWSLETTER_SEND=YES`;
- exige allowlist do host do provedor;
- inclui um link de cancelamento baseado em token.

Revise o conteúdo editorial, teste com lista interna e valide LGPD antes de
ativar. A automação não deve decidir recomendações clínicas personalizadas.

## 7. Checklist de homologação

- [ ] Login inválido não revela se o e-mail existe.
- [ ] Senha não aparece em storage, logs, analytics ou erros.
- [ ] Access token e chave de protocolo anônimo não aparecem em Web Storage.
- [ ] Usuário comum recebe 403 ao consultar `admin_users` alheio/diretório.
- [ ] Anônimo não lista manifestações, respostas ou perfis privados.
- [ ] Protocolo anônimo incorreto retorna erro genérico.
- [ ] Cancelamento interrompe a seleção da próxima newsletter.
- [ ] Métricas públicas nunca contêm e-mail, UUID ou histórico individual.
- [ ] CSP e as duas allowlists contêm somente origens oficiais.
- [ ] Backup, retenção e exclusão de conta foram definidos.
- [ ] Testes de teclado, leitor de tela, mobile e modo desconectado passaram.
