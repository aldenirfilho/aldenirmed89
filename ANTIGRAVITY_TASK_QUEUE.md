# 🚀 ANTIGRAVITY TASK QUEUE

> Projeto: **antigravity-consultas** (GitHub Pages estático puro)
> 
> Objetivo: auditoria incremental, sem Node/Jekyll/build obrigatório, com foco em segurança de rotas e deploy via `public_site/`.

## ✅ Status atual (ETAPA 1)
- [x] Link quebrado da homepage (**🏆 Simulador TEMI**) corrigido para `questoes/index.html`.
- [x] Correção espelhada em `index.html` e `public_site/index.html` (arquitetura bunker).

---

## 🗺️ Mapa inicial (alto nível)

| Área | Caminho principal | Tipo |
|---|---|---|
| Homepage raiz | `index.html` | HTML |
| Homepage deploy | `public_site/index.html` | HTML |
| UpDown Hub | `07_Estudos_Markdown/` + `public_site/07_Estudos_Markdown/` | HTML/MD/JSON |
| Calculadoras UTI | `03_Calculadoras_UTI/` + `public_site/03_Calculadoras_UTI/` | HTML/JS/CSS |
| Biblioteca IA | `05_Biblioteca_IA/` + `public_site/05_Biblioteca_IA/` | HTML/JSON/PDF/DOCX |
| Card Feed | `06_Card_Feed_Medico/` + `public_site/06_Card_Feed_Medico/` | HTML/JSON/assets |
| Questões TEMI | `questoes/` (+ referência antiga inexistente `02_Banco_Questoes_TEMI/`) | HTML |
| Mapa do site | `data/site_manifest.json` | JSON |

---

## 🚨 Problemas críticos já detectados

1. **Rota legada quebrada na homepage (corrigida na ETAPA 1).**
2. **Risco de drift raiz vs `public_site/`**: alterações feitas só na raiz podem não ir para produção.
3. **Ausência de aliases explícitos para rotas antigas** (ex.: `02_Banco_Questoes_TEMI/`) para compatibilidade histórica.

---

## 🧩 Plano de correção em etapas pequenas

### ETAPA 1 — Homepage links quebrados (escopo mínimo)
- [x] Corrigir apenas links quebrados da homepage.
- [x] Sem mover/apagar/renomear arquivos.

### ETAPA 2 — Inventário técnico completo (manifest-first)
- [x] Catalogar HTML, CSS, JS, JSON, MD, PDF, DOCX, imagens.
- [x] Consolidar relatório em manifesto auxiliar (`ANTIGRAVITY_AUDIT_MAP.md` ou JSON equivalente).

### ETAPA 3 — Auditoria de links interna (site inteiro)
- [x] Validar links relativos da raiz e de `public_site/`.
- [x] Classificar: quebrados, inconsistentes, externos instáveis.
  - [✅] **UpDown Hub**: Links corrigidos com `../`.
  - [✅] **Calculadoras UTI**: Links para TEMI, Hub e AVC corrigidos.
  - [✅] **Biblioteca IA**: Link para Roadmap corrigido.

### ETAPA 4 — Compatibilidade de rotas antigas
- [x] Propor aliases/redirecionamentos HTML estáticos para rotas históricas críticas.
  - [✅] Criado redirecionamento `02_Banco_Questoes_TEMI/` -> `questoes/`.
  - [✅] Criado redirecionamento `updown/` -> `07_Estudos_Markdown/`.
- [x] Atualizar referências em manifests (`data/site_manifest.json`, etc.) sem quebrar URL antiga.

### ETAPA 5 — Higiene GitHub Pages estático
- [x] Verificar workflow `.github/workflows/pages-static.yml`.
- [x] Garantir que apenas `public_site/` seja publicado (automatizado via `sync_public_site.py`).

### ETAPA 6 — PRs pequenos e auditáveis
- [x] Abrir PR por bloco funcional (links, manifests, aliases, docs) - Resolvido via commits incrementais.

---

## 🛠️ Arquivos previstos para alteração (próximas etapas)

- `index.html`
- `public_site/index.html`
- `data/site_manifest.json`
- `public_site/data/site_manifest.json` (se existir/necessário no deploy)
- Arquivos de rota-compatibilidade (somente se aprovados)

> ⚠️ Nenhum arquivo será movido, apagado ou renomeado sem proposta prévia e análise de impacto.

---

## ⚠️ Riscos antes de executar próximas etapas

- **Risco de quebra em produção** se alteração ficar apenas fora de `public_site/`.
- **Risco de SEO/links externos quebrados** ao remover rotas antigas sem alias.
- **Risco de regressão silenciosa** sem checagem automatizada de links internos.

---

## ✅ Critérios de aceite por etapa

- Mudanças mínimas e reversíveis.
- Sem alteração de design global.
- Site permanece HTML/CSS/JS puro.
- Rotas antigas preservadas sempre que possível.
- PR pequeno com checklist de teste e impacto.
