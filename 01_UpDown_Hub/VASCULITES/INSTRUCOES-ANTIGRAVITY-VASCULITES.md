---
titulo: "Vasculites — Diagnóstico & Terapêutica (Dashboard Interativo)"
slug: vasculites-dashboard
tipo: ferramenta_interativa
formato: html_self_contained
status: aguardando_revisao_medica
visibility: privado_ate_revisao
copyright_safety: ok_conteudo_proprio_sem_copia_literal
source_type: sintese_propria_baseada_em_diretrizes_publicas
data_geracao: 2026-06-06
arquivo_alvo: public/ferramentas/vasculites-dashboard.html
sha256: e3440f790e0c12ae98a1dacab45b5ad5147139d8da68e6aaca28f4ea8421cc22
tamanho: 92KB
links_relacionados:
  - 03_Conteudos_UpDown_MD/cad-uti.md
  - 03_Conteudos_UpDown_MD/lupus-eritematoso-sistemico.md
  - public/ferramentas/cad-dashboard.html
  - public/ferramentas/les-dashboard.html
diretrizes_base:
  - "ACR/EULAR 2022 — critérios de classificação GPA/PAM/GEPA"
  - "ACR/Vasculitis Foundation 2021 — AAV, grandes vasos, médios vasos"
  - "CHCC 2012 — nomenclatura por calibre"
  - "FFS 2011 (French Vasculitis Study Group)"
  - "ADVOCATE/avacopan (NEJM 2021); SELECT-GCA/upadacitinibe (NEJM 2025); MANDARA/benralizumabe (NEJM 2024); MIRRA; PEXIVAS"
---

# 🤖 INSTRUÇÕES DE INTEGRAÇÃO — ANTIGRAVITY
## Pacote: **Vasculites — Dashboard Interativo** 🩸🔬

> **Agente alvo:** Antigravity (Gemini) — integração e deploy
> **Solicitante:** Dr. Aldenir Rocha · Enciclomedia Médica / Projeto UpDown
> **Natureza:** Ferramenta interativa HTML *self-contained* (sem dependências externas de JS)

---

## ⛔ REGRAS INVIOLÁVEIS (LER PRIMEIRO)

| # | Regra | Status |
|---|-------|--------|
| 1 | ❌ **NÃO DELETAR** nenhum arquivo existente do repositório | OBRIGATÓRIO |
| 2 | ❌ **NÃO ALTERAR** o `index.html` principal do site | OBRIGATÓRIO |
| 3 | 🔒 **NÃO PUBLICAR** este HTML em produção **sem revisão médica confirmada** | OBRIGATÓRIO |
| 4 | 🕵️ **NÃO EXPOR** dados privados, identificadores de pacientes ou PII | OBRIGATÓRIO |
| 5 | ➕ Apenas **adicionar** arquivos novos nos diretórios indicados abaixo | OBRIGATÓRIO |
| 6 | 🧪 Manter `status: aguardando_revisao_medica` no frontmatter **até** o Dr. Aldenir liberar | OBRIGATÓRIO |

> ⚠️ Enquanto `status` ≠ `publicado`, o arquivo deve permanecer em rota privada / não linkada no menu público.

---

## 📂 ESTRUTURA DE PASTAS / DESTINO

```
00_INBOX_ATUALIZACAO/
├── 05_Apps_Calculadoras/
│   └── vasculites-dashboard.html        ← arquivo recebido (origem do INBOX)
└── INSTRUCOES-ANTIGRAVITY-VASCULITES.md ← este manifesto

# DESTINO FINAL NO SITE (após validação):
public/
└── ferramentas/
    └── vasculites-dashboard.html        ← arquivo_alvo
```

---

## 🛠️ COMANDOS DE INTEGRAÇÃO (BASH)

```bash
# 1. Garantir que a pasta de ferramentas existe (não falha se já existir)
mkdir -p public/ferramentas

# 2. Copiar (NÃO mover/deletar a origem) o dashboard para o destino público
cp "00_INBOX_ATUALIZACAO/05_Apps_Calculadoras/vasculites-dashboard.html" \
   "public/ferramentas/vasculites-dashboard.html"

# 3. Validar integridade pós-cópia (deve bater com o manifesto)
sha256sum "public/ferramentas/vasculites-dashboard.html"
# Esperado: e3440f790e0c12ae98a1dacab45b5ad5147139d8da68e6aaca28f4ea8421cc22

# 4. Conferir que abre como arquivo único e autossuficiente (sem 404 de assets locais)
grep -c "src=\"./\|href=\"./" "public/ferramentas/vasculites-dashboard.html"
# Esperado: 0  (não há dependências locais; só Google Fonts via CDN com fallback)
```

> 🔁 **Idempotência:** rodar de novo apenas sobrescreve o destino com a mesma versão — seguro.

---

## 🌐 ROTEAMENTO DE URL

| Ambiente | Rota | Liberar quando |
|----------|------|----------------|
| 🔒 Pré-revisão (staging/privado) | `/_review/ferramentas/vasculites-dashboard.html` | imediatamente |
| 🌍 Produção (público) | `/ferramentas/vasculites-dashboard.html` | **somente após `status: publicado`** |

**Card sugerido para a galeria de ferramentas** (adicionar **apenas** após liberação, sem editar `index.html` — usar o componente/loader de cards já existente):

```json
{
  "titulo": "Vasculites — Dx & Terapêutica",
  "slug": "vasculites-dashboard",
  "icone": "🩸",
  "categoria": "Reumatologia / Imunologia",
  "url": "/ferramentas/vasculites-dashboard.html",
  "tags": ["ANCA", "ACR/EULAR 2022", "TEMI", "UTI"],
  "status": "aguardando_revisao_medica"
}
```

---

## 🧩 O QUE O ARQUIVO CONTÉM (11 módulos interativos)

| # | Módulo | Função |
|---|--------|--------|
| 1 | 🗺️ **Mapa por calibre (CHCC 2012)** | Grandes / médios / pequenos / variável |
| 2 | 🧬 **Algoritmo de anticorpos + diferenciais** | 9 cenários (PR3, MPO, eosinofilia, crio, IgA, anti-MBG, ANCA-neg, Behçet, duplo-ANCA) |
| 3 | 🧮 **Calculadora ACR/EULAR 2022** | Abas GPA/PAM/GEPA · escore ao vivo · limiares ≥5/≥5/≥6 |
| 4 | 📖 **Atlas clínico** (accordion) | ACG, Takayasu, PAN, GPA, PAM, GEPA, IgAV, crioglobulinêmica, Behçet |
| 5 | 🪜 **Escalada terapêutica** | Indução → manutenção → recaída + arsenal farmacológico |
| 6 | ⚠️ **Complicações graves** | Por sistema (pulmão-rim, neuro, cardíaco, GI) |
| 7 | 🏥 **Indicações de internação / UTI** | Checklists de gravidade |
| 8 | 🎯 **Five Factor Score (FFS 2011)** | Calculadora de prognóstico |
| 9 | 🧪 **Vasculites raras de alta gravidade** | anti-MBG, PACNS, Cogan, VEXAS, cocaína/levamisol, VUH, DADA2 |
| 10 | 🃏 **Flashcards** | 12 cards com *flip* |
| 11 | 📝 **Questões TEMI/R3** | 6 questões com gabarito, comentário e pegadinha |

**Stack visual:** dark · Syne (display) + IBM Plex Mono/Sans · CSS custom properties · JS 100% inline · responsivo (breakpoint 880px).

---

## ✅ CHECKLIST DE VERIFICAÇÃO PÓS-INTEGRAÇÃO

```
[ ] Arquivo copiado para public/ferramentas/vasculites-dashboard.html
[ ] SHA256 confere com o manifesto
[ ] Abre em navegador sem erro de console
[ ] Fontes carregam (Google Fonts) OU caem no fallback sans/mono sem quebrar layout
[ ] Calculadora ACR/EULAR soma corretamente e mostra veredito
[ ] Algoritmo de anticorpos renderiza dx + diferenciais ao clicar
[ ] FFS calcula e classifica mortalidade
[ ] Flashcards viram (flip) ao clicar
[ ] Quiz revela gabarito/comentário ao responder
[ ] Disclaimer visível (classificação ≠ diagnóstico)
[ ] index.html principal INTACTO (não modificado)
[ ] Nenhum arquivo existente deletado
[ ] status permanece "aguardando_revisao_medica"
```

---

## 🩺 GATE DE REVISÃO MÉDICA (pré-publicação)

> O conteúdo foi **sintetizado a partir de diretrizes públicas** (ACR/EULAR, CHCC, FFS) **sem cópia literal** de fontes proprietárias. Mesmo assim, **antes de tornar público**, o Dr. Aldenir deve confirmar:

1. ✔️ Doses, limiares e escores conferidos contra a fonte primária mais recente.
2. ✔️ Condutas alinhadas à realidade de Sobral/CE (disponibilidade de rituximabe, avacopan, tocilizumabe, plasmaférese).
3. ✔️ Disclaimer de "ferramenta educacional, não substitui julgamento clínico" presente e visível.
4. ✔️ Trocar `status: aguardando_revisao_medica` → `status: publicado` **somente após** o "OK" explícito.

---

## 🔭 EXPANSÕES FUTURAS SUGERIDAS (não executar agora)

- 📄 Artigo Markdown canônico complementar em `03_Conteudos_UpDown_MD/vasculites.md` (texto longo + referências).
- 🖼️ Infográficos estáticos para `04_Assets_Visuais/`: mapa de anticorpos, fluxograma síndrome pulmão-rim, escada terapêutica em PNG/SVG.
- ⚛️ Versão React do simulador de classificação (artefato isolado).
- ➕ Banco ampliado de questões TEMI/R3 (meta: 20–30).

---

**FIM DO MANIFESTO** · Gerado para integração segura · Revisão médica obrigatória antes do deploy público. 🔒✅
