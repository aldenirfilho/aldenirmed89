# 🕵️ ANTIGRAVITY AUDIT MAP — Inventário Técnico (Etapa 2)

Este documento mapeia todos os ativos técnicos do projeto, servindo como base para auditoria de links e integridade do deploy.

---

## 🏗️ 1. ESTRUTURA CORE (RAIZ vs PUBLIC_SITE)

| Recurso | Raiz (`/`) | Public Site (`public_site/`) | Status |
|---|---|---|---|
| Homepage | `index.html` | `index.html` | ✅ Sincronizado |
| UpDown Hub | `07_Estudos_Markdown/index.html` | `07_Estudos_Markdown/index.html` | ✅ Sincronizado |
| Manifesto UpDown | `07_Estudos_Markdown/registry.json` | `07_Estudos_Markdown/registry.json` | ✅ Sincronizado |
| Biblioteca IA | `05_Biblioteca_IA/index.html` | `05_Biblioteca_IA/index.html` | ✅ Sincronizado |
| Calculadoras UTI | `03_Calculadoras_UTI/index.html` | `03_Calculadoras_UTI/index.html` | ✅ Sincronizado |
| Card Feed | `06_Card_Feed_Medico/index.html` | `06_Card_Feed_Medico/index.html` | ✅ Sincronizado |

---

## 📊 2. MANIFESTOS E DADOS (JSON)

Estes arquivos controlam a dinâmica do site e as conexões do Mapa Vivo.

| Arquivo | Localização | Função |
|---|---|---|
| `site_manifest.json` | `data/` | Inventário global do portal |
| `registry.json` | `07_Estudos_Markdown/` | Lista de cards do UpDown Hub |
| `connections.json` | `data/` | Mapeamento de relações do Mapa Vivo (D3.js) |
| `navigation.json` | `data/` | Estrutura de menus dinâmicos |
| `route_aliases.json` | `data/` | Mapa de redirecionamentos (em construção) |

---

## 📂 3. ACERVO DE DOCUMENTOS (BIBLIOTECA IA)

A Biblioteca possui um motor de busca próprio e gerencia arquivos pesados.

- **Total de Pastas de Acervo:** 18 (Sepse, VM, Cardio, Procedimentos, etc.)
- **Tipos de Arquivos:** PDF, DOCX, XLSX.
- **Inbox:** `05_Biblioteca_IA/inbox/` (Arquivos aguardando classificação).
- **Status de Sincronia:** O `public_site/05_Biblioteca_IA/` reflete os mesmos arquivos da raiz.

---

## 🎨 4. ASSETS E DESIGN (ESTÁTICO)

- **CSS:** Localizado em `assets/css/` (base.css, home.css, graph-vivo.css).
- **JS:** Localizado em `assets/js/` (app.js, search.js, graph.js).
- **Imagens:** Centralizadas em `imagens/` e `assets/img/`.
- **Logo Oficial:** `logo_concept_3_book_1778036997285.png` (Copiada para a raiz e `public_site`).

---

## 🚨 5. OBSERVAÇÕES DE AUDITORIA

1. **Drift de Sincronia:** Foi detectado que o `public_site` é uma cópia manual. Qualquer alteração em `data/site_manifest.json` na raiz **deve** ser replicada para `public_site/data/site_manifest.json`.
2. **Rota Inexistente:** A pasta `02_Banco_Questoes_TEMI/` citada em links antigos foi removida em favor de `questoes/`.
3. **Módulos Novos:** O módulo `les-autoanticorpos/` já está 100% integrado no `public_site`.

---

**Relatório gerado em:** 2026-05-10
**Auditado por:** Antigravity Agent (Codex Mode) 🚀🩺
