# 📋 INSTRUÇÕES PARA O ANTIGRAVITY
## Integração e Publicação — Pacote CAD (Cetoacidose Diabética)

---

## 🗂️ ARQUIVOS GERADOS — INVENTÁRIO COMPLETO

| Arquivo | Tipo | Destino | Status |
|---|---|---|---|
| `cetoacidose-diabetica-uti.md` | Markdown canônico (UpDown) | `03_Conteudos_UpDown_MD/` | ✅ Pronto |
| `cad-simulador-protocolo.jsx` | React App (Artifact interativo) | `apps/simuladores/` | ✅ Pronto |
| `cad-transicao-ev-sc-infografico.html` | HTML estático (infográfico UTI) | `public/infograficos/` | ✅ Pronto |
| `cad-checklist-beira-leito.html` | HTML interativo (checklist) | `public/ferramentas/` | ✅ Pronto |

---

## 📁 ESTRUTURA DE PASTAS SUGERIDA NO REPOSITÓRIO

```
antigravity/
├── 00_INBOX_ATUALIZACAO/
│   └── 03_Conteudos_UpDown_MD/
│       └── cetoacidose-diabetica-uti.md          ← FONTE CANÔNICA
│
├── public/
│   ├── updown/
│   │   └── cetoacidose-diabetica-uti/
│   │       └── index.html                         ← Compilado do .md
│   ├── infograficos/
│   │   └── cad-transicao-ev-sc-infografico.html   ← Infográfico afixar UTI
│   └── ferramentas/
│       └── cad-checklist-beira-leito.html         ← Checklist interativo
│
└── apps/
    └── simuladores/
        └── cad-simulador-protocolo.jsx            ← React App (Artifact)
```

---

## 🚀 PASSO A PASSO DE INTEGRAÇÃO (INCREMENTAL E SEGURO)

### FASE 1 — Depósito do Markdown Canônico (fazer PRIMEIRO)

```bash
# 1. Copiar o arquivo MD para a pasta correta
cp cetoacidose-diabetica-uti.md \
   00_INBOX_ATUALIZACAO/03_Conteudos_UpDown_MD/cetoacidose-diabetica-uti.md

# 2. Verificar que o arquivo está íntegro
cat 00_INBOX_ATUALIZACAO/03_Conteudos_UpDown_MD/cetoacidose-diabetica-uti.md | head -30
```

---

### FASE 2 — Publicação dos Arquivos Estáticos

```bash
# Infográfico de transição EV→SC
cp cad-transicao-ev-sc-infografico.html \
   public/infograficos/cad-transicao-ev-sc-infografico.html

# Checklist interativo
cp cad-checklist-beira-leito.html \
   public/ferramentas/cad-checklist-beira-leito.html
```

---

### FASE 3 — Deploy do React App (Simulador)

```bash
# Para integração como componente React no site
cp cad-simulador-protocolo.jsx \
   apps/simuladores/cad-simulador-protocolo.jsx

# OU para usar como Artifact standalone no Claude.ai:
# Copiar o conteúdo do JSX diretamente como Artifact React
```

---

### FASE 4 — Compilar MD → HTML público (quando pronto)

```bash
# Com pandoc ou Jekyll/Hugo conforme pipeline do projeto
pandoc cetoacidose-diabetica-uti.md \
  -o public/updown/cetoacidose-diabetica-uti/index.html \
  --template=template-antigravity.html \
  --metadata title="Cetoacidose Diabética na UTI"
```

---

## 🔗 ROTAS SUGERIDAS NO SITE

| Arquivo | URL pública sugerida |
|---|---|
| Markdown → HTML | `/updown/cetoacidose-diabetica-uti/` |
| Simulador React | `/apps/cad-simulador/` |
| Infográfico | `/infograficos/cad-transicao-ev-sc/` |
| Checklist | `/ferramentas/cad-checklist/` |

---

## 🏷️ TAGS E METADADOS PARA MANIFESTOS/ÍNDICES

```yaml
slug: cetoacidose-diabetica-uti
title: Cetoacidose Diabética na UTI
category: Endocrinologia / Medicina Intensiva
tags:
  - CAD
  - cetoacidose diabetica
  - insulinoterapia EV
  - hipocalemia
  - anion gap
  - UTI
  - emergencia endocrina
  - TEMI
  - diabetes mellitus
nivel: avancado
status: publicado
created: 2025-01
```

---

## 🔗 LINKS INTERNOS SUGERIDOS (para linkagem no hub)

Adicionar no manifesto de links relacionados:

- `← /updown/estado-hiperosmolar-hiperglicemico/`
- `← /updown/disturbios-acido-base-uti/`
- `← /updown/hipocalemia-uti/`
- `← /updown/insulinoterapia-uti/`
- `← /updown/sepse-uti/` (CAD pode ter sepse como precipitante)
- `→ /apps/cad-simulador/` (Simulador interativo)
- `→ /ferramentas/cad-checklist/` (Checklist beira-leito)
- `→ /infograficos/cad-transicao-ev-sc/` (Infográfico transição)

---

## 🖼️ IMAGENS FUTURAS PARA CRIAR (Backlog Visual)

| Imagem | Formato | Prioridade |
|---|---|---|
| Algoritmo geral CAD (fluxograma vertical) | PNG 1080×1920 | 🔴 Alta |
| Mapa mental fisiopatologia CAD | PNG 1920×1080 | 🟡 Média |
| Card de bolso K⁺ × insulina | PNG 800×400 | 🔴 Alta |
| Comparativo CAD × EHH | PNG tabela visual | 🟡 Média |
| Timeline tratamento 0h–24h | SVG/PNG | 🟢 Baixa |

---

## ✅ CHECKLIST FINAL DE PUBLICAÇÃO

- [x] Markdown canônico com frontmatter YAML completo
- [x] Conteúdo reescrito autoralmente (sem cópia literal)
- [x] Sem dados de pacientes identificáveis
- [x] Simulador React funcional com calculadoras de AG, K⁺, insulina e transição
- [x] Infográfico HTML estático pronto para impressão A4/A3
- [x] Checklist interativo com checkboxes e barra de progresso
- [x] Todos os arquivos têm slug padronizado
- [x] Links internos sugeridos documentados
- [x] Instruções de integração para o Antigravity documentadas
- [ ] Revisão médica pelo Dr. Aldenir (pendente)
- [ ] Criação das imagens visuais (backlog)
- [ ] Linkagem no hub/mapa vivo do site (após aprovação)
- [ ] Atualização dos manifestos/índices (após aprovação)

---

## ⚠️ REGRAS DE SEGURANÇA PARA ESTA INTEGRAÇÃO

1. **NÃO alterar** arquivos existentes no repositório sem verificar conflitos de rota
2. **NÃO deletar** nenhum MD, HTML, PDF, PNG, JSON ou ZIP existente
3. **NÃO atualizar** index.html principal neste commit
4. **NÃO expor** bastidores, prompts ou dados privados nas páginas públicas
5. **PRESERVAR** todas as rotas antigas — adicionar apenas novas
6. **VALIDAR** links após publicação (mobile + desktop)
7. **AGUARDAR** aprovação do Dr. Aldenir antes de publicar HTML público

---

## 🔒 OBSERVAÇÃO DE SEGURANÇA AUTORAL

Todos os arquivos gerados foram escritos com linguagem própria e autoral.
Nenhum trecho longo foi copiado de fontes protegidas por direitos autorais.
O conteúdo é baseado em conceitos médicos de domínio público (fisiopatologia, 
condutas clínicas estabelecidas) e em diretrizes publicamente disponíveis 
(ADA, JBDS) parafraseadas com linguagem própria.
Seguro para publicação pública no site do Projeto Antigravity.

---

*Gerado pelo Agente Científico-Editorial do Projeto Antigravity*
*Pacote: CAD-UTI-v1.0 | Data: 2025-01*
