# 🚀 Próximas etapas — guia do proprietário

Este é o roteiro curto para continuar o Antigravity sem misturar tarefas,
credenciais ou riscos. Faça **uma microação por vez**.

> **Estado real agora:** o site e a revisão protetiva semanal estão no ar. O
> Centro da Tripulação continua em **NO-GO para backend**. Login, assinatura,
> métricas reais, diretório, manifestações, respostas, caderno privado e
> boletim permanecem desconectados até a homologação terminar.

## ⚡ Faça somente isto agora

### Missão de 15 minutos — criar o e-mail institucional

1. Escolha um provedor confiável.
2. Crie uma caixa exclusiva para a plataforma.
3. Ative MFA.
4. Guarde senha e códigos de recuperação em local privado.
5. Envie uma mensagem de teste para a nova caixa.
6. Decida se o endereço já pode aparecer publicamente.

Quando terminar, responda no chat:

```text
ETAPA P0
E-mail institucional criado e testado: SIM
Exibição pública autorizada: SIM / NÃO / DEPOIS
Quero continuar com orientação tela a tela: SIM
```

Não envie a senha, código de MFA, códigos de recuperação, cookie, token ou
endereço pessoal de recuperação.

## 🚦 O que significa cada estado

| Estado | Significado | Sua ação |
|---|---|---|
| **No ar** | Entrega publicada e verificável | usar ou acompanhar |
| **Pronto para executar** | Codex pode iniciar quando a dependência estiver disponível | autorizar o escopo |
| **Precisa de você** | somente o proprietário pode concluir a etapa externa | seguir a microação |
| **Bloqueado por dependência** | falta segurança, decisão ou serviço real | não contornar |
| **Planejado** | importante, mas não é a próxima ação | deixar para depois |

As caixas marcadas na Central de Ativação ficam somente neste navegador. Elas
ajudam na organização, mas **não mudam o estado técnico do projeto** e não
comprovam que uma etapa foi homologada.

## 🛡️ Regra principal do backend

O backend permanece em **NO-GO** enquanto faltar qualquer item:

- e-mail institucional real, monitorado e protegido por MFA;
- projeto separado de homologação;
- confirmação de e-mail e redirecionamentos restritos;
- esquema revisado e RLS testada por papel;
- gateways protegidos para métricas e manifestações;
- ausência comprovada de segredos no frontend, Git, logs e chat;
- testes de falha, cancelamento e revogação;
- autorização humana explícita para mudar o modo para `connected`.

Não use um atalho que libere RPC privilegiado para o navegador. Não altere o
modo para `connected` apenas porque o formulário aparece pronto.

## P0 — ativação segura do Centro da Tripulação

### Passo 1 — e-mail institucional

Complete a missão de 15 minutos apresentada no início deste guia.

**Você pode enviar ao Codex:**

- o endereço, somente depois de criado e aprovado para exibição;
- a confirmação de que MFA está ativo;
- a decisão `PÚBLICO`, `AINDA NÃO PÚBLICO` ou `DEPOIS`.

**Não envie:**

- senha;
- código de MFA;
- códigos de recuperação;
- link de redefinição;
- dados da conta pessoal de recuperação.

### Passo 2 — projeto Supabase de homologação

Faça esta etapa somente depois do e-mail.

1. Crie um projeto dedicado a homologação.
2. Gere uma senha forte para o banco.
3. Guarde essa senha em gerenciador de senhas.
4. Mantenha confirmação de e-mail ativa.
5. Cadastre apenas o endereço oficial HTTPS e um localhost específico nas URLs
   permitidas.
6. Ative proteção contra senhas vazadas e limite de tentativas quando
   disponível.
7. Não importe dados reais.
8. Não aplique o esquema sem a revisão P0-03.

**Você pode enviar ao Codex:**

- a URL pública `https://SEU-PROJETO.supabase.co`;
- a chave pública `sb_publishable_…`, somente quando RLS estiver revisada e a
  integração de homologação for autorizada;
- `CONFIRMAÇÃO DE E-MAIL ATIVA: SIM`;
- a lista textual das origens permitidas, sem segredos.

**Não envie:**

- senha do banco;
- `sb_secret_…` ou a chave legada `service_role`;
- JWT secret;
- arquivo `.env`;
- dump do banco;
- código de MFA;
- token de sessão.

### Passo 3 — revisão pelo Codex

Depois do handoff mínimo, o Codex deve:

1. revisar o esquema e todas as concessões;
2. conferir RLS nas tabelas expostas;
3. restringir CSP e allowlists;
4. preparar uma configuração somente de homologação;
5. gerar a matriz de testes para anônimo, tripulante, administrador e
   proprietário;
6. manter a interface pública em `disconnected`.

Nenhum segredo é necessário para revisar os arquivos locais.

### Passo 4 — gateways

Métricas e manifestações precisam de gateways protegidos. O navegador não pode
chamar diretamente funções privilegiadas.

O proprietário cria segredos no cofre do provedor. O Codex implementa validação
de origem, limitação de requisições, proteção contra abuso e falha segura.

Nunca copie para o chat:

- `sb_secret_…` ou a chave legada `service_role`;
- segredo do CAPTCHA;
- chave do provedor de e-mail;
- salt;
- token bearer;
- screenshot do cofre.

### Passo 5 — homologação

Use contas separadas de teste e confirme:

- anônimo não lista informações restritas;
- tripulante lê somente os próprios registros;
- administrador não vira proprietário;
- encerramento de sessão e cancelamento funcionam;
- serviço indisponível não gera número, protocolo ou envio falso;
- logs sanitizados não revelam contato privado ou segredo.

A decisão final deve ser uma destas:

```text
GO DE HOMOLOGAÇÃO — AUTORIZO PREPARAR A PUBLICAÇÃO
```

ou

```text
NO-GO — MANTER DESCONECTADO E CORRIGIR AS PENDÊNCIAS
```

## 📡 P1 — Radar Diário

### Publicar hoje sem automação

O fluxo manual assistido já pode ser usado:

1. envie a URL específica do artigo, documento ou notícia;
2. escreva `PUBLICAR NO RADAR`;
3. explique em uma frase por que é relevante;
4. o Codex verifica data, fonte e repetição;
5. o Codex prepara síntese e, quando útil, widescreen + card;
6. revise fontes, limitações e imagem;
7. envie `APROVADO PARA PUBLICAR`.

Não envie dados clínicos identificáveis, credenciais, link privado com token ou
obra integral de terceiros sem autorização.

### Automação diária — escolha segura

O padrão recomendado é:

```text
RASCUNHO DIÁRIO COM REVISÃO HUMANA
```

A automação pode coletar, deduplicar e preparar rascunhos. Ela não deve publicar
conteúdo clínico de forma autônoma.

Antes de qualquer chave paga:

1. defina um teto mensal;
2. defina o máximo de rascunhos por dia;
3. confirme revisão humana obrigatória;
4. use o fluxo seguro de criação/configuração da chave;
5. nunca cole a chave no chat, Git, issue, código ou screenshot.

Resposta sugerida:

```text
AUTOMAÇÃO DO RADAR
Modo: RASCUNHO DIÁRIO COM REVISÃO HUMANA / ADIAR
Máximo de rascunhos por dia: __
Teto mensal aprovado: faixa de __
Publicação humana obrigatória: SIM
```

Não inclua dados bancários ou o valor de qualquer segredo.

## 🛡️ P1 — laudo semanal em 15 minutos

Toda semana:

1. abra a issue da revisão;
2. leia primeiro o resumo;
3. priorize achados altos e críticos;
4. escolha para cada um: `CORRIGIR`, `ISOLAR`, `DOCUMENTAR` ou
   `REVISÃO ESPECIALIZADA`;
5. envie ao Codex apenas número da issue, identificador e decisão.

Exemplo:

```text
REVISÃO SEMANAL
Issue: #__
Achado: __
Decisão: CORRIGIR / ISOLAR / DOCUMENTAR / REVISÃO ESPECIALIZADA
```

Não cole documento pessoal, conversa privada, parecer confidencial, dados
clínicos identificáveis ou logs brutos na issue.

## 🧠 P2 — escolher um único módulo

Escolha apenas um:

- `SEPSE`;
- `AKI-TRS`;
- `INFECTO`;
- `ENDOCRINO`.

Depois envie:

```text
PRÓXIMO MÓDULO
Código: __
Objetivo: PLANTÃO / PROVA / AMBOS
Protocolo local autorizado: NENHUM / TÍTULO E VERSÃO
Revisão humana antes de publicar: SIM
```

Não anexe protocolo restrito, documento fechado, credencial ou caso real
reidentificável.

## 📜 P2 — proteção formal

O repositório registra autoria, datas e hashes, mas isso não garante registro,
exclusividade ou ausência de litígio.

1. escolha se deseja avaliar nome, logotipo, código, textos ou conjunto
   editorial;
2. solicite ao Codex inventário datado e checksums;
3. consulte os procedimentos oficiais;
4. procure orientação profissional quando necessário;
5. protocole e pague somente nos canais oficiais;
6. guarde documentos e comprovantes fora do site público.

O Codex pode preparar o pacote técnico. Não envie documento de identidade,
comprovante, pagamento, procuração ou parecer confidencial.

## 💻📱 P2 — aplicativos nativos

Os downloads atuais são acessos facilitados. Aplicativos nativos assinados
exigem contas e certificados externos.

Antes de começar:

1. escolha uma plataforma prioritária;
2. aprove custos;
3. crie a conta diretamente no fornecedor;
4. guarde chaves privadas no seu cofre;
5. nunca envie chave privada, senha, MFA ou pagamento ao Codex.

PWA e atalhos continuam sendo a opção mais simples enquanto essa decisão não
for tomada.

## 🌐 P2 — versão em inglês

Escolha no máximo três páginas por lote. A fonte em português deve estar
estável, e cada lote mantém referências, datas, limitações e revisão.

## ✅ O que enviar e o que nunca enviar

| Pode enviar quando necessário | Nunca enviar |
|---|---|
| endereço institucional já criado e aprovado | senha |
| URL pública do projeto Supabase | `sb_secret_…` ou chave legada `service_role` |
| chave `sb_publishable_…`, somente após RLS e para integração autorizada | senha do banco ou JWT secret |
| confirmação textual de configurações | código de MFA ou recuperação |
| URL pública da fonte do Radar | chave da OpenAI ou outro provedor |
| número público de issue e identificador do achado | token, cookie ou arquivo `.env` |
| código do próximo módulo | dados clínicos identificáveis |
| decisão editorial objetiva | documento pessoal ou pagamento |
| screenshot redigido, quando indispensável | screenshot de cofre, segredo ou painel sensível |

Se um segredo for enviado por engano, pare a tarefa, revogue o segredo no
provedor e só depois continue com uma credencial nova.

## 🧩 Resposta mínima para continuar

Copie, preencha e envie:

```text
ETAPA P0
E-mail institucional criado e testado: SIM / NÃO
Exibição pública do e-mail autorizada: SIM / NÃO / DEPOIS
Projeto Supabase de homologação criado: SIM / NÃO
Confirmação de e-mail ativa: SIM / NÃO
Quero continuar com orientação tela a tela: SIM
```

Não acrescente nenhuma credencial.

## Fontes oficiais

- Supabase Auth: <https://supabase.com/docs/guides/auth>
- Supabase — autenticação por senha:
  <https://supabase.com/docs/guides/auth/passwords>
- Supabase — configuração geral:
  <https://supabase.com/docs/guides/auth/general-configuration>
- Supabase — Row Level Security:
  <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase — segurança:
  <https://supabase.com/docs/guides/security/product-security>
- GitHub Actions — segredos:
  <https://docs.github.com/en/actions/reference/security/secrets>
- GitHub Actions — uso seguro:
  <https://docs.github.com/en/actions/reference/security/secure-use>
- GitHub Actions — eventos agendados:
  <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule>
- OpenAI API — quickstart:
  <https://platform.openai.com/docs/quickstart>
- LGPD:
  <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>
- Direitos Autorais:
  <https://www.planalto.gov.br/ccivil_03/leis/l9610.htm>
- Biblioteca Nacional — Direitos Autorais:
  <https://www.gov.br/bn/pt-br/atuacao/direitos-autorais-1/direitos-autorais>
- INPI — Guia Básico de Marcas:
  <https://www.gov.br/inpi/pt-br/servicos/marcas/guia-basico/guia-basico>
- Resolução CFM nº 2.336/2023:
  <https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2023/2336>

Essas fontes orientam a configuração e a revisão, mas não substituem
aconselhamento jurídico, análise clínica ou avaliação de segurança especializada
quando necessária.
