# 🚀 ANTIGRAVITY — Manual Operacional Único

> **Projeto:** `antigravity-consultas` · Enciclopédia Médica Intensiva & Interna
> **Tipo:** site estático puro (HTML/CSS/JS) no GitHub Pages · sem build obrigatório
> **Este arquivo substitui e consolida:** `ANTIGRAVITY_AUDIT_MAP.md` + `ANTIGRAVITY_TASK_QUEUE.md` + `RELATORIO_ETAPA1_HOMEPAGE_LINKS.md`
> **Atualizado em:** 2026-06 (auditoria completa do repositório)

---

## 0. Como o agente deve operar (leia antes de tudo)

1. **Ler este arquivo + `README.md` antes de qualquer alteração.**
2. **Trabalhar de forma incremental**, 1 etapa por vez, com commit pequeno e auditável.
3. **Listar arquivos afetados** antes de executar.
4. **Nunca apagar/mover** PDF, DOCX, MD, HTML, PNG, JSON, ZIP **sem autorização explícita** do Dr. Aldenir. Operações destrutivas estão marcadas com 🔴 **[REQUER AUTORIZAÇÃO]**.
5. **Preferir `git rm --cached`** (mantém o arquivo no disco e no histórico → 100% reversível) a apagar do disco.
6. **Preservar rotas antigas** (ver `data/route_aliases.json`).
7. **Nunca publicar bastidores** (prompts, instruções internas, `_private/`).
8. **Nenhum HTML clínico ao ar sem revisão médica.**

Legenda de prioridade: **P0** = quebra produção · **P1** = inchaço/risco · **P2** = organização.

---

## 1. 🕵️ AUDITORIA DE REGISTRO (estado atual encontrado)

Repositório: **~1,2 GB · 1.537 arquivos** · 87 commits.
HTML 79% · JS 13% · CSS 5% · Python 2,5%.

### 1.1 Achados CRÍTICOS (P0 — site quebrado em produção)

| # | Problema | Evidência | Impacto |
|---|---|---|---|
| **C1** | `06_Infra_Site_E_Assets/` **não é copiada** pelo deploy, mas a home carrega `home-landing.css/.js/data` de lá | `grep 06_Infra_Site_E_Assets deploy-seguro.yml` = 0 | **Home no ar sem CSS e sem JS** (busca de tópicos, mapa, drawer mortos) |
| **C2** | `data/` **não é copiada** pelo deploy | `grep data deploy = 0`; `home-landing.js` faz `fetch("06_Infra_Site_E_Assets/data/home-manifest.json")` e o Mapa Vivo usa `data/connections.json` | **Mapa Vivo e navegação dinâmica quebram** (404) |
| **C3** | `les-autoanticorpos/` **não é copiada** pelo deploy, embora esteja no registry/manifests | `grep les-autoanticorpos deploy = 0` | Módulo LES inacessível por rota direta |
| **C4** | Arquivos de **bastidor publicados** | `08_PROMPT_ANTIGRAVITY_RULES.md`, `INSTRUCOES-ANTIGRAVITY-CAD.md`, `antigravity_instructions.md` (×2, um em `_private/`) dentro de `07_Estudos_Markdown/` que o deploy copia inteira | **Vaza prompts/instruções internas** — viola regra inviolável |

> ⛑️ **C1–C4 são corrigidos de uma vez** pelo novo `deploy-seguro.yml` (ver Etapa A).
> A auditoria anterior (Etapa 1) não detectou C1–C3 porque só checava *existência local* do arquivo, não o que o **CI realmente publica**.

### 1.2 Achados de INCHAÇO (P1 — ~555 MB de redundância)

| # | Problema | Evidência | Impacto |
|---|---|---|---|
| **R1** | Pasta `site/` **versionada** (168 MB) | É varrida por `rm -rf site` no início do CI | Peso morto puro; nunca usada |
| **R2** | `public_site/` (387 MB) é **espelho manual da raiz** | `sync_public_site.py` copia raiz→public_site; deploy ainda aninha em `/public_site/` | Site fantasma duplicado + dobra o repo |
| **R3** | Biblioteca IA (168 MB de PDF/DOCX) aparece **até 3×** | raiz + public_site + (deploy fazia `cp 05_ site/biblioteca`) | Binários pesados triplicados |

### 1.3 Achados de ORGANIZAÇÃO (P2 — confusão de taxonomia)

| # | Problema | Detalhe |
|---|---|---|
| **O1** | **Symlinks quebrados na raiz** | `📂_ACERVO_BIBLIOTECA_OFFLINE` → `02_Biblioteca_IA_Engine/...` (inexistente); `↕️_REVISOES_UPDOWN_OFFLINE` → `01_UpDown_Hub/...` (inexistente). Apontam para pastas renomeadas. |
| **O2** | **Três pastas `06_`** colidindo | `06_Card_Feed_Medico/` (app real) · `06_Feed_Instamed_IA/` (kits duplicados/antigos) · `06_Infra_Site_E_Assets/` (infra da home — numeração enganosa) |
| **O3** | **Questões duplicadas** | `questoes/` **e** `02_Banco_Questoes_TEMI/` coexistem; `AUDIT_MAP` dizia que `02_` foi removida — **não foi** |
| **O4** | **Manifests inconsistentes** | `site_manifest.json` aponta questões p/ `02_Banco_Questoes_TEMI`; `route_aliases.json` confirma wrapper `questoes/→02_`. Vários `patch_*.json` soltos nunca consolidados |
| **O5** | **README aspiracional** | Descrevia estrutura `uti/ medicina-interna/ pocus/...` que **não existe**; a real é numerada (`01_ 03_ 05_...`) |

---

## 2. 🧩 PLANO DE MANUTENÇÃO EM ETAPAS

### ETAPA A — Aplicar correções P0 ✅ (SEGURA · não destrutiva)

Substituir/adicionar 3 arquivos (entregues prontos pelo Claude). **Nenhum conteúdo é apagado.**

```bash
# A partir da raiz do repositório:
cp NOVO/deploy-seguro.yml   .github/workflows/deploy-seguro.yml   # corrige C1,C2,C3,C4,R2,R3
cp NOVO/.gitignore          .gitignore                            # passa a ignorar site/
cp NOVO/README.md           README.md                             # documentação real
cp NOVO/ANTIGRAVITY_INSTRUCTIONS.md  ANTIGRAVITY_INSTRUCTIONS.md  # este arquivo

git add .github/workflows/deploy-seguro.yml .gitignore README.md ANTIGRAVITY_INSTRUCTIONS.md
git commit -m "fix(deploy): publica 06_Infra/data/les-autoanticorpos, remove bastidores e site fantasma; docs reais"
git push
```

**Verificação pós-deploy** (após o Actions terminar):
- Abrir a home → deve aparecer **estilizada** (fundo escuro, gradiente, cards de vidro).
- Abrir DevTools → Network → **sem 404** em `home-landing.css/.js`, `home-manifest.json`, `connections.json`.
- Conferir que `https://…/public_site/` **não** existe mais como duplicata.
- Conferir que `https://…/07_Estudos_Markdown/content/intensiva/INSTRUCOES-ANTIGRAVITY-CAD.md` retorna **404** (bastidor protegido).

---

### ETAPA B — Parar de versionar a pasta `site/` 🔴 [REQUER AUTORIZAÇÃO] (P1 · −168 MB)

`site/` é artefato de build, regenerado no CI. Removê-la do versionamento é **reversível** (`--cached` mantém histórico).

```bash
# Verificar primeiro o que será destracado:
git ls-files site/ | head
# Destracar (mantém no disco local, sai do versionamento):
git rm -r --cached site/
git commit -m "chore: deixa de versionar artefato de build site/ (regenerado no CI)"
git push
# (Opcional, se quiser liberar disco local depois do push) :
# rm -rf site/
```

---

### ETAPA C — Aposentar o espelho `public_site/` 🔴 [REQUER AUTORIZAÇÃO] (P1 · −387 MB)

`public_site/` é cópia manual da raiz. Como o deploy é montado **da raiz**, o espelho é redundante.
**Antes de remover, provar que tudo em `public_site/` já existe na raiz** (script abaixo). Só prosseguir se a lista de "exclusivos" estiver vazia.

```bash
# 1) Conferir arquivos que existem SÓ no public_site (devem ser zero ou triviais):
python3 - <<'PY'
import os
root="."; ps="public_site"
def rel(base):
    out=set()
    for dp,_,fs in os.walk(base):
        for f in fs:
            r=os.path.relpath(os.path.join(dp,f), base)
            out.add(r)
    return out
ps_files=rel(ps)
exclusivos=[f for f in ps_files if not os.path.exists(os.path.join(root,f)) and not f.startswith(("_last_sync","ANTIGRAVITY"))]
print("Arquivos exclusivos do public_site (precisam de atenção):", len(exclusivos))
for f in sorted(exclusivos)[:50]: print("  ", f)
PY

# 2) SE a lista acima for vazia/trivial, destracar o espelho:
git rm -r --cached public_site/
# 3) Aposentar o sincronizador (vira no-op documentado):
git rm --cached scripts_admin/sync_public_site.py 2>/dev/null || true
git commit -m "chore: aposenta espelho public_site/ (deploy é montado da raiz)"
git push
```

> Se o passo 1 listar arquivos exclusivos reais, **NÃO remover**: copiar esses arquivos para a raiz primeiro, revalidar, e só então destracar.

---

### ETAPA D — Blindar privacidade na fonte (P1 · segura)

O workflow já remove bastidores do *artefato*. Para blindar também a *fonte*, padronizar: todo arquivo de instrução interna fica em `_private/` (já ignorado pelo `.gitignore`).

```bash
# Mover (não apagar) instruções soltas para _private dentro do próprio módulo:
for f in \
  07_Estudos_Markdown/content/avc-agudo-isquemico/08_PROMPT_ANTIGRAVITY_RULES.md \
  07_Estudos_Markdown/content/intensiva/INSTRUCOES-ANTIGRAVITY-CAD.md \
  07_Estudos_Markdown/content/reumatologia/les-manifestacoes/antigravity_instructions.md ; do
    d="$(dirname "$f")/_private"; mkdir -p "$d"; git mv "$f" "$d/" 2>/dev/null || mv "$f" "$d/";
done
git add -A && git commit -m "chore(privacidade): instruções internas movidas para _private/" && git push
```

---

### ETAPA E — Consolidar taxonomia 🔴 [REQUER AUTORIZAÇÃO caso a caso] (P2)

**Propostas** (executar só após o Dr. Aldenir aprovar cada uma):

1. **Renomear `06_Infra_Site_E_Assets/` → `90_Infra_Site/`** (ou mover seu conteúdo para `assets/`). Atualiza o `<link>`/`<script>` da home. Resolve O2.
   *Risco:* quebra a home se o caminho não for atualizado em conjunto. Fazer rename + edição do `index.html` no mesmo commit + alias.
2. **Arquivar `06_Feed_Instamed_IA/`** (kits duplicados antigos do Card Feed) → mover para `99_ARQUIVO_HISTORICO/`. Resolve O2.
3. **Escolher UMA casa para questões.** Manter `02_Banco_Questoes_TEMI/` como canônica e `questoes/` como wrapper de redirect (já é). Atualizar todos os manifests para refletir isso de forma consistente. Resolve O3/O4.

> Toda renomeação/movimentação **preserva a rota antiga** via wrapper HTML de redirect + entrada em `route_aliases.json`.

---

### ETAPA F — Consolidar manifests `patch_*.json` (P2 · segura)

Há patches soltos em `data/`: `patch_modulo_07.json`, `patch_updown_002.json`, `patch_updown_les.json`, `connections_patch_biblioteca.json`, `topics_patch_biblioteca.json`.

```bash
# Mesclar cada patch no manifesto-mãe correspondente (connections.json / topics.json),
# validar com o script de integridade, e então arquivar os patches:
python3 scripts_admin/validate_mapa_vivo.py    # deve passar sem erros
# Após merge validado:
git mv data/patch_*.json data/_aplicados/ 2>/dev/null || true
```

---

### ETAPA G — Corrigir/limpar symlinks quebrados (P2 · segura)

```bash
# Os dois symlinks da raiz apontam para pastas inexistentes:
ls -la "📂_ACERVO_BIBLIOTECA_OFFLINE" "↕️_REVISOES_UPDOWN_OFFLINE"
# Opção 1 (recomendada): remover os symlinks quebrados (o deploy já os ignora):
git rm "📂_ACERVO_BIBLIOTECA_OFFLINE" "↕️_REVISOES_UPDOWN_OFFLINE"
# Opção 2: recriar apontando para os destinos reais (05_Biblioteca_IA / 07_Estudos_Markdown)
git commit -m "fix: remove symlinks quebrados da raiz" && git push
```

---

## 3. 🔄 SOP — Alimentação contínua (adicionar um novo tema)

Para documentos em qualquer hub, o procedimento vigente e detalhado está em
`08_Documentacao_Projeto/GUIA_INSERCAO_SEGURA_DOCUMENTOS.md`.

Fluxo padrão para cada novo UpDown (mantém o site organizado e versionável):

1. **Depositar** o material bruto em `00_INBOX_ATUALIZACAO/triagem/`, staging
   local privado e ignorado pelo Git. Nunca versionar um diretório `inbox/`.
2. **Gerar o `.md` canônico** com o Prompt-Mestre UpDown → salvar em
   `01_UpDown_Hub/content/<area>/<slug>.md` com frontmatter YAML completo.
   - `area` ∈ {`intensiva`, `interna`, `emergencia`, `reumatologia`, …}
   - `slug` minúsculo, sem acento: ex. `choque-septico-refratario-na-uti`
3. **Registrar** o documento em `01_UpDown_Hub/registry.json` (id, title, icon, path, status).
4. **Revisão médica** do Dr. Aldenir → mudar `status` para `ativo` só após aprovação. 🛡️
5. **(Opcional) Publicar HTML/app** correspondente e linká-lo.
6. **Conectar no Mapa Vivo**: adicionar nós/arestas em `data/connections.json` e tópicos em `data/topics.json`.
7. **Validar** com `scripts_admin/validate_mapa_vivo.py` e o preview local (`scripts_admin/preview_local.sh`).
8. **Commit pequeno** descrevendo o tema adicionado.

### Frontmatter YAML padrão
```yaml
---
title: "Título do tema"
slug: "slug-do-tema"
category: "Clínica Médica / UTI / Emergência"
tags: [medicina interna, terapia intensiva, emergência, TEMI]
status: "rascunho"          # rascunho | em_revisao | ativo
visibility: "publico"
source_type: "artigo transformado em conteúdo autoral"
copyright_safety: "reescrita autoral, sem cópia literal extensa"
links_relacionados: []
created_for: "Projeto Antigravity / Enciclomedia Médica"
---
```

---

## 4. ✅ Checklist de aceite (toda mudança)

- [ ] Mudança mínima, incremental e reversível.
- [ ] Nenhum arquivo único apagado/movido sem autorização.
- [ ] Rotas antigas preservadas (wrapper + `route_aliases.json`).
- [ ] Site continua HTML/CSS/JS puro.
- [ ] Nenhum bastidor/prompt/paciente exposto.
- [ ] Build (`Actions`) verde + sem 404 no Network da home.
- [ ] Conteúdo clínico novo passou por **revisão médica**.

---

## 5. 🛠️ Arquivos de governança ativos

| Arquivo | Papel |
|---|---|
| `ANTIGRAVITY_INSTRUCTIONS.md` | **Este** — manual operacional único |
| `README.md` | Visão pública + arquitetura real |
| `data/route_aliases.json` | Rotas legadas/amigáveis |
| `data/site_manifest.json` | Inventário de hubs/módulos |
| `scripts_admin/validate_mapa_vivo.py` | Validação de integridade do Mapa Vivo |
| `scripts_admin/preview_local.sh` | Preview local idêntico ao deploy |

> Os antigos `ANTIGRAVITY_AUDIT_MAP.md` e `ANTIGRAVITY_TASK_QUEUE.md` podem ser arquivados em `99_ARQUIVO_HISTORICO/` após a Etapa A.
