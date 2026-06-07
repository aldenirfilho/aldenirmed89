# 📦 MANIFESTO DE INTEGRAÇÃO — LES · Projeto Antigravity
# Gerado por: Agente Científico-Editorial Antigravity
# Data: 2026-05-09
# Versão: 1.0
# Status: PRONTO PARA INTEGRAÇÃO

---

## 🗂️ INVENTÁRIO DE ARQUIVOS ENTREGUES

| Arquivo | Tipo | Destino no repositório | Prioridade |
|---|---|---|---|
| `lupus-eritematoso-sistemico-diagnostico-manejo.md` | Markdown canônico | `00_INBOX_ATUALIZACAO/03_Conteudos_UpDown_MD/` | 🔴 Alta |
| `les-anticorpos-mapa-visual.html` | Infográfico publicável (1080×1920) | `00_INBOX_ATUALIZACAO/04_Assets_Visuais/les/` | 🟡 Média |
| `les-fluxograma-eular-acr-2019.html` | Fluxograma interativo mobile | `00_INBOX_ATUALIZACAO/04_Assets_Visuais/les/` | 🟡 Média |
| `les-escada-terapeutica.html` | Infográfico escalonado | `00_INBOX_ATUALIZACAO/04_Assets_Visuais/les/` | 🟡 Média |
| `les-dashboard-calculadora.html` | Dashboard interativo (SLEDAI-2K + EULAR/ACR) | `00_INBOX_ATUALIZACAO/05_Apps_Calculadoras/` | 🟡 Média |
| `MANIFESTO-LES-INTEGRACAO.md` (este arquivo) | Instrução de integração | `00_INBOX_ATUALIZACAO/` | 🔴 Alta |

---

## 📋 INSTRUÇÕES PARA O ANTIGRAVITY/GEMINI

### PASSO 1 — Verificação prévia (OBRIGATÓRIO)
```
ANTES de qualquer ação:
1. Ler README e regras do projeto
2. Listar arquivos existentes nas pastas de destino
3. Verificar se já existe conteúdo sobre LES no repositório
4. NÃO sobrescrever arquivos existentes sem análise
```

### PASSO 2 — Depositar conteúdo canônico
```
AÇÃO: Mover arquivo Markdown para pasta canônica
ARQUIVO: lupus-eritematoso-sistemico-diagnostico-manejo.md
DESTINO: 00_INBOX_ATUALIZACAO/03_Conteudos_UpDown_MD/
SLUG: lupus-eritematoso-sistemico-diagnostico-manejo
OBSERVAÇÃO: Este é o arquivo FONTE CANÔNICA — todos os outros derivam dele
```

### PASSO 3 — Depositar assets visuais
```
AÇÃO: Criar pasta e mover arquivos HTML
DESTINO: 00_INBOX_ATUALIZACAO/04_Assets_Visuais/les/
ARQUIVOS:
  - les-anticorpos-mapa-visual.html
  - les-fluxograma-eular-acr-2019.html
  - les-escada-terapeutica.html
OBSERVAÇÃO: Arquivos HTML autocontidos (não dependem de assets externos)
```

### PASSO 4 — Depositar calculadora/app
```
AÇÃO: Mover dashboard para pasta de apps
ARQUIVO: les-dashboard-calculadora.html
DESTINO: 00_INBOX_ATUALIZACAO/05_Apps_Calculadoras/
OBSERVAÇÃO: App 100% client-side (JavaScript vanilla), sem dependências de servidor
```

### PASSO 5 — Atualizar manifesto/índice (SOMENTE SE AUTORIZADO)
```
SE autorizado a atualizar índices:
  - Adicionar entrada no índice de conteúdos de Clínica Médica/Reumatologia
  - Adicionar entrada no índice de calculadoras
  - Linkar no hub de UTI/TEMI se existir

SE não autorizado:
  - Apenas depositar arquivos e aguardar instrução explícita
```

### PASSO 6 — Validação antes de publicar HTML público
```
VERIFICAR:
  ✅ Links internos entre páginas funcionando
  ✅ Renderização mobile (viewport correto)
  ✅ Calculadora JavaScript funcionando em todos os browsers
  ✅ Sem dados de pacientes expostos
  ✅ Sem prompts internos expostos
  ✅ Sem textos protegidos por direitos autorais copiados literalmente
  ✅ Revisão médica realizada antes de publicação pública
```

---

## 🔗 LINKS INTERNOS SUGERIDOS

O arquivo canônico `.md` deve ser linkado com:

```yaml
links_relacionados:
  - nefrite-lupica-diagnostico-classificacao
  - sindrome-antifosfolipidica-manejo
  - doenca-mista-tecido-conjuntivo
  - autoanticorpos-guia-reumatologia
  - hidroxicloroquina-uso-clinico
  - febre-origem-indeterminada
  - calculadora-sledai-2k  # → les-dashboard-calculadora.html
```

---

## 🏷️ METADADOS PARA INDEXAÇÃO

```yaml
slug: lupus-eritematoso-sistemico-diagnostico-manejo
titulo: "Lúpus Eritematoso Sistêmico — Diagnóstico, Manifestações e Manejo"
categoria: Clínica Médica / Reumatologia / UTI
tags: [LES, lúpus, autoimune, nefrite-lúpica, anticorpos-antinucleares, TEMI, clínica-médica, UTI, emergência]
nivel: intermediário-avançado
publico-alvo: [médico clínico, intensivista, residente, candidato TEMI]
status: rascunho — aguarda revisão médica
visibilidade: publico (após revisão)
versao: 1.0
data-criacao: 2026-05-09
data-revisao-medica: pendente
```

---

## ⚠️ REGRAS INVIOLÁVEIS — LEMBRE-SE SEMPRE

```
🚫 NÃO deletar arquivos antigos (PDF, DOCX, MD, HTML, PNG, JSON, ZIP) sem autorização explícita
🚫 NÃO mover arquivos da biblioteca sem atualizar manifestos E links
🚫 NÃO quebrar rotas antigas já publicadas
🚫 NÃO expor bastidores, prompts internos ou dados privados em página pública
🚫 NÃO alterar index.html ou arquivos de configuração sem ordem explícita
🚫 NÃO publicar HTML público sem revisão médica confirmada

✅ SEMPRE fazer mudanças incrementais
✅ SEMPRE preservar rotas antigas
✅ SEMPRE manter Markdown como fonte canônica (HTML é derivado)
✅ SEMPRE validar links após integração
✅ SEMPRE informar quais arquivos foram alterados ao finalizar
```

---

## 📊 RELATÓRIO DE SAÍDA — PARA O DR. ALDENIR

### Conteúdo entregue neste lote:

| Produto | Descrição | Dimensões | Status |
|---|---|---|---|
| **MD Canônico** | Artigo completo: diagnóstico, manifestações, anticorpos, tratamento, mnemônicos, flashcards, questões TEMI | — | ✅ Pronto |
| **Mapa de Anticorpos** | Visual dark-mode: ANA, anti-dsDNA, anti-Sm, RNP, Ro/La, antifosfolipídios com barras de sensib./especif. | 1080×1920 | ✅ Pronto |
| **Fluxograma EULAR/ACR** | Passo a passo diagnóstico com tabela de pontuação, resultados e alertas de UTI | Mobile vertical | ✅ Pronto |
| **Escada Terapêutica** | 4 degraus: leve → moderado → grave → refratário/UTI com doses e indicações | Infográfico | ✅ Pronto |
| **Dashboard Calculadora** | App interativo: SLEDAI-2K + EULAR/ACR 2019 com interpretação em tempo real | Web app | ✅ Pronto |

---

*Projeto Antigravity / Enciclomedia Médica · Conteúdo educacional autoral · 2026*
