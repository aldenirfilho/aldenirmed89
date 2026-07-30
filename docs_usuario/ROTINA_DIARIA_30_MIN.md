# 🛰️ Rotina Diária Antigravity — 60 minutos

O Codex escolhe automaticamente as seções do dia. Você não precisa decidir o
tema, organizar a ordem nem abrir o Mac Pro.

> **Comando único para usar no chat:** “Execute a Rotina Antigravity de hoje,
> com 60 minutos.”

> O endereço deste arquivo mantém `ROTINA_DIARIA_30_MIN` por compatibilidade
> com links e instalações antigas. A rotina vigente dura **60 minutos**.

## 🎯 O que acontece todos os dias

O planejador mantém três tópicos contínuos e escolhe três seções diferentes para
os pilares randômicos:

1. **🔁 Pulso contínuo — 10 minutos:** Radar Diário, Integridade/privacidade e
   Portal Vivo são verificados em todas as sessões.
2. **🧠 Conteúdo Turbo TEMI — 18 minutos:** uma microentrega com fonte, gancho
   de prova, recuperação ativa e ressalva clínica.
3. **🎨 Design TDAH-friendly — 12 minutos:** hierarquia, escaneabilidade,
   responsividade, teclado e redução de carga cognitiva.
4. **⚡ Performance e qualidade — 12 minutos:** um gargalo medido, uma melhoria
   reversível e um teste ou comparação antes/depois.
5. **🛡️ Validação e publicação — 8 minutos:** diff, privacidade, gate
   editorial, testes relacionados e builder.

**Total máximo: 60 minutos.**

## 🎲 Como o Codex escolhe

A seleção é **pseudoaleatória, auditável e equilibrada**. Isso significa que
ela varia diariamente, mas pode ser reproduzida para revisão.

O planejador combina:

- uma permutação diferente e reproduzível em cada ciclo de cada pilar;
- prioridade clínica, valor para o TEMI e impacto operacional;
- tempo desde a última alteração registrada no Git;
- penalidade para seção alterada nos últimos cinco dias;
- bloqueio de repetição nas seis seleções anteriores de cada pilar;
- prevenção de escolher a mesma rota em dois pilares no mesmo dia;
- janela de equilíbrio de 42 dias para monitorar cobertura.

Assim, áreas populares não monopolizam a rotina e seções menos visíveis voltam
ao cronograma de forma homogênea ao longo do tempo.

## 🔁 Pulso contínuo obrigatório

Três tópicos não participam do sorteio: são considerados diariamente.

### 📡 Radar Diário — 6 minutos

- procurar uma fonte primária nova e relevante;
- verificar duplicidade por DOI, PMID, identificador ou URL canônica;
- publicar somente se houver achado sustentado;
- quando não houver atualização segura, registrar a decisão de não publicar.

### 🛡️ Integridade e privacidade — 2 minutos

- verificar dados identificáveis, credenciais e conteúdo em revisão;
- observar alertas dos gates e não flexibilizar bloqueios para ganhar tempo.

### 🛰️ Portal Vivo — 2 minutos

- conferir o histórico antirrepetição;
- registrar somente UPGRADE realmente entregue;
- não criar publicação artificial para preencher o calendário.

## 🧠 Contrato Turbo TEMI + TDAH

### Conteúdo Turbo TEMI

Uma entrega de conteúdo termina com:

- impacto clínico ou educacional em uma frase;
- gancho de prova ou pergunta de recuperação;
- âncora visual ou mnemônica própria;
- dois a cinco pontos de alto rendimento;
- fonte, população, desenho ou limitação quando aplicável;
- ressalva: não substituir protocolo local nem decisão assistencial.

### Design TDAH-friendly

Uma entrega de design termina com:

- uma ação principal evidente;
- blocos curtos e hierarquia legível em cinco segundos;
- foco visível, teclado e alvos de toque adequados;
- contraste, modo claro/escuro, mobile e impressão preservados;
- nenhum elemento decorativo sem função de aprendizagem.

### Performance mensurável

Uma entrega de performance termina com:

- hipótese e métrica antes da alteração;
- uma única otimização pequena e reversível;
- medida ou contrato automatizado depois da alteração;
- zero aumento de permissões, telemetria ou dependência externa;
- nenhuma mudança silenciosa em fórmula, dado clínico ou compatibilidade.

## 📅 Cronograma vivo

O cronograma é recalculado diariamente conforme data, ciclo equilibrado e
histórico real do projeto.

Para gerar somente hoje:

```bash
python3 scripts_admin/plan_daily_updates.py --root .
```

Para visualizar os próximos sete dias:

```bash
python3 scripts_admin/plan_daily_updates.py --root . --days 7
```

Para simular outra data:

```bash
python3 scripts_admin/plan_daily_updates.py \
  --root . \
  --date 2026-08-01 \
  --days 7
```

O planejador é somente leitura: não modifica o site, não usa rede e não publica nada sozinho.

## ⏱️ Mini-roteiro diário de 1 hora

### Minuto 0–10 — Pulso contínuo

- **0–6:** Radar Diário.
- **6–8:** Integridade e privacidade.
- **8–10:** Portal Vivo e histórico antirrepetição.

Uma checagem sem novidade relevante também é conclusão válida. Não force uma
publicação.

### Minuto 10–28 — Conteúdo Turbo TEMI

- **10–12:** abrir somente a rota escolhida e iniciar o cronômetro.
- **12–22:** revisar ou criar uma única microentrega.
- **22–26:** acrescentar fonte, gancho de prova, âncora e ressalva.
- **26–28:** reler como intensivista em plantão e parar.

Não transformar estudo isolado em protocolo. Não usar dados reais ou
identificáveis de paciente.

### Minuto 28–40 — Design TDAH-friendly

- **28–30:** observar a tela em desktop e largura móvel.
- **30–37:** corrigir apenas uma barreira de hierarquia ou interação.
- **37–40:** conferir teclado, foco, contraste e alvo de toque.

Não iniciar uma reforma visual ampla. Clareza vem antes de decoração.

### Minuto 40–52 — Performance e qualidade

- **40–43:** medir o estado atual ou definir um contrato objetivo.
- **43–49:** executar uma única melhoria reversível.
- **49–52:** repetir a medida ou o teste e documentar o resultado real.

Se não houver medida confiável, criar o teste primeiro e deixar a otimização
para outra sessão.

### Minuto 52–60 — Validação e publicação

- revisar o diff e remover qualquer arquivo acidental;
- confirmar autoria, licença, privacidade e status de revisão clínica;
- executar os testes diretamente relacionados;
- executar gate editorial, portão de publicação e builder;
- registrar no Radar conteúdo clínico/estudo e no Portal Vivo somente UPGRADE
  operacional realmente entregue;
- encerrar no minuto 60.

## 🚦 Semáforo de foco

- **🟢 Executar agora:** a microentrega escolhida para o pilar atual.
- **🟡 Estacionar:** melhoria útil fora do timebox.
- **🔴 Bloquear:** dado identificável, credencial, fonte incerta, dose
  imperativa sem revisão ou mudança ampla sem teste.

Use uma aba, um cronômetro e uma entrega por vez. Não abra o próximo pilar
antes de fechar o atual.

## 🛡️ Regras de publicação

### Conteúdo clínico ou de estudo

- Destino editorial: **Estação Radar Diário**.
- Identidade: DOI, PMID, identificador editorial ou URL canônica.
- Informar desenho, achado, relevância e limitação.
- Rotular preprint e revisão clínica pendente.
- Conteúdo educacional não substitui protocolo local nem decisão assistencial.

### Melhoria da plataforma

- Destino editorial: **Portal Vivo — UPGRADE**.
- Publicar somente recurso, correção ou integração realmente entregue.
- Informar a métrica executada; não prometer velocidade ou segurança sem
  evidência.

### Módulo clínico

- Alterar a fonte canônica somente com sustentação e revisão clínica humana.
- Sem revisão, a descoberta pode entrar no Radar como estudo, mas não como
  recomendação operacional definitiva.

## 🚨 Regra do plantão

Se surgir qualquer necessidade assistencial:

1. interrompa imediatamente a rotina;
2. cuide do paciente;
3. retome depois a partir do pilar em que parou;
4. não use informação identificável do caso real como conteúdo do site.

O cronograma é ferramenta de estudo e manutenção, nunca prioridade acima da
assistência.

## ✅ Definição de sessão concluída

Uma sessão diária termina quando:

- Radar, Integridade e Portal Vivo foram verificados sem publicação artificial;
- uma microentrega de conteúdo, uma de design e uma de performance foram
  encerradas ou justificadamente bloqueadas;
- nenhuma seção excedeu seu orçamento;
- o diff não contém dados privados nem arquivos acidentais;
- conteúdo clínico novo tem fonte e status de revisão;
- performance tem medida antes/depois ou contrato automatizado;
- os testes realmente executados foram documentados;
- ideias extras ficaram estacionadas sem ampliar o escopo.

## 🔄 Uniformidade ao longo do tempo

Em até 42 dias, o sistema procura distribuir atenção entre:

- módulos clínicos críticos e recuperação ativa TEMI;
- hubs, Biblioteca, Radar, Portal e Diretório;
- hierarquia visual, mobile, teclado e acessibilidade;
- carregamento, renderização, assets, cache offline, rotas e builders;
- integridade editorial, privacidade e reversibilidade.

O objetivo não é mexer em tudo todos os dias. É produzir três melhorias
pequenas, coerentes e verificáveis, mantendo o projeto vivo sem criar uma
reforma impossível de revisar.
