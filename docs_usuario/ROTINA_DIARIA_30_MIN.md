# 🛰️ Rotina Diária Antigravity — 29 minutos

O Codex escolhe automaticamente as seções do dia. Você não precisa decidir o
tema, organizar a ordem nem abrir o Mac Pro.

> **Comando único para usar no chat:** “Execute a Rotina Antigravity de hoje,
> com no máximo 29 minutos.”

## 🎯 O que acontece todos os dias

O planejador escolhe três seções diferentes:

1. **🩺 Clínica e TEMI — 11 minutos:** um único ponto clínico de alto valor.
2. **🧠 Estudo ativo — 8 minutos:** questão, desafio, card, mnemônico ou resumo.
3. **🛰️ Sustentação do portal — 6 minutos:** Radar, links, navegação,
   documentação, acessibilidade ou integridade.
4. **🛡️ Validação — 4 minutos:** diff, privacidade, teste relacionado, builder e
   decisão de publicação.

**Total máximo: 29 minutos.**

## 🧠 Como o Codex escolhe

A escolha não é aleatória. O planejador combina:

- rodízio diário entre as seções da mesma trilha;
- prioridade clínica e importância para o TEMI;
- tempo desde a última alteração registrada no Git;
- penalidade para seção atualizada nos últimos três dias;
- bloqueio de repetição no cronograma dos cinco dias anteriores;
- pequena variação determinística pela data.

Isso mantém o site dinâmico sem abandonar seções menos chamativas.

## 📅 Cronograma vivo

O cronograma não fica congelado numa tabela semanal. Ele é recalculado a cada
dia conforme o estado atual do projeto.

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

## ⏱️ Mini-roteiro diário

### Minuto 0–11 — Clínica e TEMI

- Abrir somente a seção escolhida.
- Selecionar um único ponto de decisão, alerta ou conceito.
- Conferir uma fonte primária ou diretriz oficial quando houver afirmação nova.
- Fazer uma microentrega: um bloco, uma pérola ou uma correção.
- Não transformar estudo isolado em protocolo.

### Minuto 11–19 — Estudo ativo

- Transformar conhecimento já sustentado em uma única atividade.
- Preferir questão comentada, pergunta de recuperação, mini-OSCE, mnemônico com
  ressalva ou card autossuficiente.
- Registrar fonte e limitação.
- Não usar dados reais ou identificáveis de paciente.

### Minuto 19–25 — Sustentação do portal

- Executar somente a microtarefa escolhida.
- Revisar um link, uma rota, uma descrição, uma entrada do Radar ou um aviso
  editorial.
- Não abrir uma reforma visual ampla.

### Minuto 25–29 — Validação

- Revisar o diff.
- Confirmar autoria/licença, privacidade e revisão clínica.
- Executar teste relacionado, portão de publicação e builder.
- Se qualquer gate falhar, manter em revisão e não publicar.
- Parar no minuto 29, mesmo que existam outras boas ideias.

## 🛡️ Regras de publicação

### Conteúdo clínico ou de estudo

- Destino editorial: **Estação Radar Diário**.
- Identidade de publicação: DOI, PMID, identificador editorial ou URL canônica.
- Informar desenho, achado, relevância e limitação.
- Rotular preprint e revisão clínica pendente.
- Conteúdo educacional não substitui protocolo local nem decisão assistencial.

### Melhoria da plataforma

- Destino editorial: **Portal Vivo — UPGRADE**.
- Publicar somente recurso, correção ou integração realmente entregue.
- Não prometer automação, segurança ou resultado que não tenha sido validado.

### Módulo clínico

- Alterar diretamente a fonte canônica do módulo somente com sustentação e
  revisão clínica humana.
- Sem revisão, a descoberta pode entrar no Radar como estudo, mas não como
  recomendação operacional definitiva.

## 🚨 Regra do plantão

Se surgir qualquer necessidade assistencial:

1. interrompa imediatamente a rotina;
2. cuide do paciente;
3. retome depois a partir da seção em que parou;
4. não use informação identificável do caso real como conteúdo do site.

O cronograma é uma ferramenta de estudo e manutenção, nunca uma prioridade
acima da assistência.

## ✅ Definição de uma sessão concluída

Uma sessão diária termina quando:

- três microentregas ou menos foram executadas;
- nenhuma seção excedeu seu orçamento;
- o diff não contém dados privados nem arquivos acidentais;
- conteúdo clínico novo tem fonte e status de revisão;
- os testes realmente executados foram documentados;
- a próxima ideia ficou anotada, sem ampliar o escopo atual.

## 🔄 Uniformidade semanal

Ao longo da semana, o sistema procura cobrir:

- módulos clínicos críticos;
- recuperação ativa para TEMI;
- Radar e fontes científicas;
- Biblioteca e materiais autorizados;
- navegação, acessibilidade e operação offline;
- integridade editorial e privacidade.

Uma atualização curta e rastreável por dia é preferível a uma grande reforma
difícil de revisar.
