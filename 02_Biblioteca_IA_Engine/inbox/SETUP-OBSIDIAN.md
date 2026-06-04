---
tags: [setup, obsidian, configuracao, guia]
created: 2026-04-20
---

# ⚙️ GUIA DE CONFIGURAÇÃO — OBSIDIAN TEMI 2026

> [!tip] Leia PRIMEIRO antes de importar o vault

---

## 📥 PASSO 1 — INSTALAR O OBSIDIAN

1. Acesse: **obsidian.md** → Download grátis
2. Disponível para: Windows, Mac, Linux, **iOS** e **Android** (ideal para plantão!)
3. Instalar e abrir

---

## 📂 PASSO 2 — IMPORTAR ESTE VAULT

1. Extrair o arquivo ZIP em uma pasta (ex: `Documentos/TEMI-2026/`)
2. No Obsidian: **"Open folder as vault"** → Selecionar a pasta
3. Confirmar que a pasta `.obsidian` está dentro
4. O vault carregará com todas as notas e configurações

---

## 🔌 PASSO 3 — INSTALAR PLUGINS ESSENCIAIS

> Ir em: **Settings → Community Plugins → Browse**

### 🔴 OBRIGATÓRIOS (instalar agora)

| Plugin | Função | Como usar |
|--------|--------|-----------|
| **Dataview** | Queries automáticas nas notas | Exibe tabelas dinâmicas no HUB |
| **Templater** | Templates automáticos | Cria novas notas com estrutura pronta |
| **Tasks** | Gerenciar checkboxes como tarefas | Filtrar pendências entre notas |
| **Calendar** | Calendário visual do diário | Link com [[Template-Diario]] |
| **QuickAdd** | Captura rápida de erros/dúvidas | Atalho para nova questão errada |

### 🟡 RECOMENDADOS

| Plugin | Função |
|--------|--------|
| **Tag Wrangler** | Gerenciar e renomear tags em massa |
| **Minimal Theme Settings** | Visual limpo e profissional |
| **Better Word Count** | Conta palavras por nota |
| **Obsidian Git** | Backup automático no GitHub (opcional) |
| **Smart Connections** | IA para sugerir conexões entre notas |

---

## ⚙️ PASSO 4 — CONFIGURAR O TEMPLATER

1. Settings → Templater → **Template folder location** → `09-Templates`
2. Ativar: **Trigger Templater on new file creation**
3. Mapear templates:
   - Nova nota em `02-Temas/` → [[Template-Tema]]
   - Nova nota em `04-Questoes/` → [[Template-Erro]]
   - Nova nota em `05-Trials/` → [[Template-Trial]]
   - Nova nota em `10-Diario/` → [[Template-Diario]]

---

## ⌨️ PASSO 5 — ATALHOS ESSENCIAIS (memorizar)

| Atalho | Ação |
|--------|------|
| `Ctrl + O` | **Abrir qualquer nota** (busca pelo nome) |
| `Ctrl + Shift + F` | **Busca global** em todo o vault |
| `Ctrl + G` | **Graph View** — ver conexões |
| `Ctrl + E` | Alternar edição / visualização |
| `Ctrl + P` | **Paleta de comandos** |
| `Ctrl + N` | Nova nota |
| `Ctrl + K` | Inserir link para outra nota |
| `Alt + Enter` | Abrir link em painel lateral |
| `Ctrl + Shift + I` | Inserir template (Templater) |
| `Ctrl + Click` | Abrir link em novo painel |

---

## 🏷️ PASSO 6 — SISTEMA DE TAGS (estrutura)

```
[[hub]] / [[moc]]          → Notas índice / mapas de conteúdo
[[temi2026]]            → Toda nota relacionada à prova
[[pocus]]               → Notas de POCUS
[[trial]]               → Fichas de trials
[[questao]]             → Questões de prova
[[erro]]                → Questões erradas
[[revisao]]             → Para revisar
[[duvida]]              → Dúvida pendente

# Eixos:
[[eixo/e1-fisiologia]]
[[eixo/e2-monitoracao]]
[[eixo/e3-sepse]]
[[eixo/e4-orgaos]]
[[eixo/e5-neuro]]
[[eixo/e6-periop]]
[[eixo/e7-etica]]
[[eixo/e8-gestao]]
[[eixo/e9-bioestat]]
[[eixo/pocus]]
```

---

## 🗂️ PASSO 7 — ESTRUTURA DO VAULT (entender antes de usar)

```
📁 TEMI-2026 (vault root)
├── 📁 00-HUB/          → Dashboard + Doses + Escalas + Glossário
├── 📁 01-Eixos/         → Uma nota por eixo (visão geral)
├── 📁 02-Temas/         → Notas detalhadas por tema e subtema
│   ├── E1-Fisiologia/
│   ├── E2-Ventilacao-Hemodinamica/
│   ├── E3-Sepse-Infeccoes/
│   ├── E4-Orgaos/
│   ├── E5-Neurointensivismo/
│   ├── E6-Perioperatorio-Clinico/
│   ├── E7-Etica-Paliativo/
│   ├── E8-Gestao-Qualidade/
│   └── E9-Bioestatistica/
├── 📁 03-POCUS/         → Protocolos POCUS (BLUE, RUSH, eFAST, FATE...)
├── 📁 04-Questoes/      → Banco de questões por eixo
│   ├── TEMI/
│   └── POCUS/
├── 📁 05-Trials/        → Fichas individuais de cada trial
├── 📁 06-Flashcards/    → Flashcards para revisão rápida
├── 📁 07-Erros/         → Questões erradas (Caderno de Erros)
├── 📁 08-Revisao/       → Materiais de revisão e simulados
├── 📁 09-Templates/     → Templates (Tema, Trial, Erro, Diário)
└── 📁 10-Diario/        → Diário diário de estudos
```

---

## 📱 PASSO 8 — OBSIDIAN NO CELULAR (para o plantão)

1. Instalar **Obsidian** no celular (iOS/Android)
2. Sincronizar via:
   - **Obsidian Sync** (pago — $10/mês) → mais simples
   - **iCloud** (iOS) → pasta no iCloud Drive
   - **Google Drive + FolderSync** (Android) → gratuito
   - **Remotely Save plugin** + OneDrive/Dropbox → gratuito
3. No celular: uso principal = leitura + Anki + anotações rápidas de erros

---

## 🔄 WORKFLOW DIÁRIO RECOMENDADO

### Início do dia (5 min)
1. Abrir [[HUB-PRINCIPAL]]
2. Criar nota do dia → [[Template-Diario]]
3. Verificar [[Caderno-Erros]] — o que revisar hoje

### Durante estudo (contínuo)
1. Estudar tema → abrir nota existente OU criar nova com [[Template-Tema]]
2. Errar questão → criar com [[Template-Erro]] → adicionar à [[Caderno-Erros]]
3. Ler trial → criar com [[Template-Trial]] → linkar no [[Trials-MASTER]]
4. Dúvida → anotar na nota do tema com tag `#duvida`

### Fim do dia (10 min)
1. Completar [[Template-Diario]] — métricas do dia
2. Revisar erros do dia antes de dormir (consolidação)
3. Preparar foco do dia seguinte

---

## 🎯 FLUXO DE BUSCA RÁPIDA

> Quando precisar de algo específico:

```
"Dose de noradrenalina"        → Ctrl+O → "Doses" → [[Doses-Vasoativos]]
"Score de sepse"               → Ctrl+O → "Escalas" → [[Escalas-Scores]]
"Trial BLUE Protocol"          → Ctrl+O → "T-Lich" → [[T-Lichtenstein2008]]
"McConnell no TEP"             → Ctrl+O → "McConn" → [[McConnell-TEP]]
"Minhas dúvidas sobre SDRA"    → Ctrl+Shift+F → "#duvida SDRA"
"Erros não revisados"          → [[Caderno-Erros]] → seção Dataview
"Checklist eFAST rápido"       → Ctrl+O → "eFAST" → [[eFAST-Protocol]]
"Número-chave de trial"        → [[Trials-MASTER]] → Ctrl+F no nome
```

---

> 💡 **Dica TDAH:** Configure o **QuickAdd** para criar questão errada com 2 cliques, sem sair do contexto. Vai na paleta `Ctrl+P` → "QuickAdd: Novo Erro" → preenche os campos.
