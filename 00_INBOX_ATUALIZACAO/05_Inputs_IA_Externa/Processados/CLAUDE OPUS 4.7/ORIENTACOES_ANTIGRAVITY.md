# 📋 ORIENTAÇÕES ANTIGRAVITY — Claude Inspector v1.0
**Data:** 2026-05-05
**Repositório:** https://aldenirfilho.github.io/antigravity-consultas/
**Autor:** Dr. Aldenir Rocha | CRM 16587
**Missão:** Aplicar melhorias sem reescrever do zero. Apenas patches cirúrgicos.

---

## 🧠 CONTEXTO PARA TODAS AS IAs INTEGRADAS

Este projeto é uma **enciclopédia médica viva** focada em UTI/TEMI/Clínica Médica.
O usuário é Dr. Aldenir (TDAH grave) — o conteúdo deve ser:
- Visual, rápido, com emojis, TDAH-friendly
- Didático mas denso (nível intensivista/TEMI)
- Estrutura padrão: 31 blocos por módulo
- Nunca reescrever do zero sem necessidade — apenas patches

**IAs integradas:** Claude (inspetor/arquiteto), Antigravity (gerador/executor), outras IAs (conteúdo)
**Regra de ouro:** Claude inspeciona → gera orientações → Antigravity executa

---

## 🔍 AUDITORIA ATUAL (2026-05-05)

### ✅ O que está funcionando bem
- Homepage (`index.html`) — estrutura sólida, duas vias claras
- Módulo AVC Agudo — 31 blocos, dashboard, galeria
- Banco TEMI — lógica de relacionamento semântico inteligente
- Navegação com tags `relatedTopics`, `domain`, `difficulty`

### ⚠️ GAPS IDENTIFICADOS — prioridade alta

#### 1. Homepage `index.html`
- [ ] **Adicionar barra de busca global** (busca por palavra-chave entre módulos)
- [ ] **Contador de módulos atualizado dinamicamente** — hoje está hardcoded (`02`, `31+`)
- [ ] **Links do rodapé quebrados** — e-mail e formulário apontam para placeholders locais
- [ ] **Mapa vivo** (`#mapa`) — nós clicáveis mencionados mas não renderizando interação real
- [ ] **Meta tags SEO** incompletas — adicionar `og:title`, `og:description`, `og:image`

#### 2. Banco TEMI `02_Banco_Questoes_TEMI/index.html`
- [ ] **Módulos planejados** (Sepse, VM/SDRA, Choque) — criar páginas stub com estrutura básica
- [ ] **Filtro por domínio** — UI presente mas lógica JS precisa ser validada
- [ ] **Adicionar módulo: Sepse** (prioridade máxima TEMI)
- [ ] **Adicionar módulo: Choque** (segundo na fila)

#### 3. Módulo AVC `01_Modulos_Clinicos/AVC_Agudo/avc.html`
- [ ] **Conteúdo truncado** — a página renderizou pouco conteúdo (possível JS dinâmico não capturado)
- [ ] **Verificar se todos os 31 blocos estão acessíveis** sem JavaScript habilitado (SEO/fallback)
- [ ] **Adicionar breadcrumb** — ex: `Início > Módulos Clínicos > AVC Agudo`

---

## 🚀 PRÓXIMOS MÓDULOS — ORDEM DE PRIORIDADE

| Prioridade | Módulo | Pasta sugerida | Status |
|---|---|---|---|
| 🔴 1 | Sepse & Choque Séptico | `01_Modulos_Clinicos/Sepse/` | A criar |
| 🔴 2 | Choque (tipos + diagnóstico diferencial) | `01_Modulos_Clinicos/Choque/` | A criar |
| 🟠 3 | Ventilação Mecânica / SDRA | `01_Modulos_Clinicos/VM_SDRA/` | A criar |
| 🟠 4 | IRA / TRS em UTI | `01_Modulos_Clinicos/IRA_TRS/` | A criar |
| 🟡 5 | Sedação, Analgesia, Delirium (SAD) | `01_Modulos_Clinicos/SAD/` | A criar |
| 🟡 6 | POCUS em UTI | `01_Modulos_Clinicos/POCUS/` | A criar |

---

## 📐 PADRÃO DE ESTRUTURA — 31 BLOCOS (manter em TODOS os módulos)

```
Bloco 01 — Definição + Epidemiologia
Bloco 02 — Etiologias (mnemônico)
Bloco 03 — Fisiopatologia visual
Bloco 04 — Clínica (sinais e sintomas)
Bloco 05 — Diagnóstico (critérios + scores)
Bloco 06 — Exames essenciais
Bloco 07 — Diagnóstico diferencial
Bloco 08 — Estratificação de gravidade
Bloco 09 — Metas terapêuticas
Bloco 10 — Tratamento geral
Bloco 11 — Farmacologia (doses, ajustes, renal/hepático)
Bloco 12 — Prescrição sugerida (UTI)
Bloco 13 — Prescrição sugerida (Enfermaria)
Bloco 14 — Bundles (hora 1, hora 3, hora 6)
Bloco 15 — Checklist de admissão UTI
Bloco 16 — Checklist de round diário
Bloco 17 — Escalas e scores (com calculadora se possível)
Bloco 18 — Galeria de imagens / diagramas
Bloco 19 — Mnemônicos
Bloco 20 — Flashcards (frente/verso interativo)
Bloco 21 — Questões comentadas TEMI (5 questões)
Bloco 22 — Pegadinhas clássicas TEMI
Bloco 23 — Insights beira-leito
Bloco 24 — Situações especiais (gestante, idoso, IRC, hepatopata)
Bloco 25 — Populações vulneráveis
Bloco 26 — Prevenção e profilaxia
Bloco 27 — Complicações e como evitar
Bloco 28 — Quando acionar especialidade
Bloco 29 — Pesquisas em andamento (trials ativos)
Bloco 30 — Referências (guidelines + trials principais)
Bloco 31 — Mensagem final + conexões para outros módulos
```

---

## 🔧 PATCHES IMEDIATOS — aplicar agora

### PATCH 01 — Corrigir links rodapé `index.html`
**Localizar:**
```html
<a href="mailto:contato@enciclopedia-medica.local?subject=...">
<a href="https://forms.gle/substituir-pelo-formulario">
<a href="https://github.com/substituir/repositorio/issues">
```
**Substituir por:**
```html
<a href="mailto:aldenirrocha@email.com?subject=Sugestão Enciclopédia">📩 E-mail</a>
<a href="https://github.com/aldenirfilho/antigravity-consultas/issues">🐙 GitHub Issues</a>
```
*(Ajustar e-mail real se diferente)*

### PATCH 02 — Adicionar breadcrumb em avc.html
**Após o `<nav>` de topo, inserir:**
```html
<nav aria-label="breadcrumb" style="font-size:0.85rem; padding: 0.5rem 1rem; opacity:0.7;">
  <a href="/antigravity-consultas/index.html">🏠 Início</a> › 
  <a href="/antigravity-consultas/01_Modulos_Clinicos/">📁 Módulos</a> › 
  <span>🧠 AVC Agudo</span>
</nav>
```

### PATCH 03 — Adicionar meta tags OG na homepage
**No `<head>` do index.html, adicionar:**
```html
<meta property="og:title" content="Enciclopédia Médica Intensiva & Medicina Interna">
<meta property="og:description" content="Portal interativo UTI, TEMI, Clínica Médica — Dr. Aldenir Rocha">
<meta property="og:url" content="https://aldenirfilho.github.io/antigravity-consultas/">
<meta property="og:type" content="website">
```

---

## 📝 INSTRUÇÃO PARA O ANTIGRAVITY

> **Antigravity:** ao receber este arquivo, aplique os PATCHES na ordem indicada.
> Não reescreva páginas inteiras. Aplique apenas as modificações listadas.
> Para novos módulos, use o template de 31 blocos acima.
> Mantenha o estilo visual atual (cores, tipografia, emojis, estrutura de cards).
> A cada novo módulo gerado, atualize o contador na homepage e adicione o link no banco TEMI.
> Sempre inclua no rodapé do módulo: `Gerado por Antigravity | Revisado por Claude Inspector | v{data}`

---

## 🔄 PROTOCOLO DE INTEGRAÇÃO MULTI-IA

```
FLUXO PADRÃO:
1. Dr. Aldenir define tema/necessidade
2. Claude (aqui) inspeciona repositório e gera ORIENTACOES_ANTIGRAVITY.md
3. Antigravity recebe o .md e executa os patches/criações
4. Claude verifica o resultado via web_fetch
5. Ciclo se repete
```

**Regras compartilhadas entre todas as IAs:**
- 🎯 Foco: UTI + TEMI + Clínica Médica
- 🧠 Público: Dr. Aldenir (TDAH grave, intensivista, Sobral/CE)
- ✅ Linguagem: didática, emojis, visual, TDAH-friendly
- 🚫 Nunca: reescrever do zero sem necessidade
- 📦 Entregável: sempre HTML funcional + MD de orientações
- 🔗 Sempre manter links bidirecionais entre módulos

---

*Arquivo gerado por Claude Inspector — 2026-05-05*
*Próxima inspeção: após aplicação dos patches*
