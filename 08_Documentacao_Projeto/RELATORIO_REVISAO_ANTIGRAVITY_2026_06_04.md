# 🧭 RELATÓRIO DE REVISÃO — ANTIGRAVITY CONSULTAS

**Data:** 2026-06-04  
**Repositório:** `aldenirfilho/antigravity-consultas`  
**Objetivo:** revisar falhas estruturais, restaurar consistência de navegação e orientar o Antigravity a executar correções sem apagar ou mover acervo.

---

## 1. Resumo executivo 🚨

O site não parece ter perdido os arquivos principais. O problema central é de **orquestração de rotas, manifests e hidratação de páginas**.

Foram identificados sinais fortes de:

1. rotas públicas duplicadas ou divergentes;
2. wrappers que existem, mas não estavam refletidos corretamente em `data/route_aliases.json`;
3. Biblioteca IA com catálogo robusto, mas com pontos frágeis no preview e no carregamento de dados;
4. Mapa Vivo com versão avançada, porém ainda dependente de caminho relativo e CDN D3;
5. UpDown Hub funcionando via `registry.json`, mas com poucos documentos publicados em relação ao volume total do acervo;
6. necessidade de manter estratégia **manifest-first**, sem reorganização destrutiva.

---

## 2. Correção já aplicada ✅

Arquivo alterado:

```txt
data/route_aliases.json
```

Commit:

```txt
72ac6e60ea6ae7b869acd0c8188a95e79329cd2b
```

### O que foi corrigido

- `questoes/index.html` agora aponta para `02_Banco_Questoes_TEMI/index.html`, alinhado ao wrapper real.
- `apps/index.html` foi preservado como hub público ativo, e não como redirecionamento para rota possivelmente inexistente.
- `imagens/index.html` foi preservado como galeria pública ativa.
- Foram adicionadas rotas amigáveis futuras para calculadoras e Card Feed.
- O arquivo ganhou `updatedAt`, `version` e `policy` para servir como fonte de verdade.

---

## 3. Diagnóstico por módulo

### 3.1 Home — `index.html`

Status: **funcional, mas ainda rígida**.

A home aponta para:

```txt
07_Estudos_Markdown/index.html
01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html
06_Card_Feed_Medico/index.html
questoes/index.html
03_Calculadoras_UTI/index.html
05_Biblioteca_IA/index.html
#mapa
```

Conduta:

- manter a home estável;
- não redesenhar layout agora;
- apenas adicionar cards/links por manifesto;
- evitar reescrever `index.html` inteiro.

---

### 3.2 Biblioteca IA — `05_Biblioteca_IA/index.html`

Status: **acervo existe; UI precisa endurecimento técnico**.

A Biblioteca carrega dados de:

```txt
05_Biblioteca_IA/data/biblioteca_taxonomia_temas.json
05_Biblioteca_IA/data/biblioteca_catalogo.json
05_Biblioteca_IA/data/biblioteca_brain_connections.json
data/roadmap_30_melhorias_biblioteca_ia.json
05_Biblioteca_IA/data/biblioteca_inbox_manifest_auto.json
```

Achados:

- `biblioteca_catalogo.json` declara mais de 200 arquivos catalogados;
- o preview usa `getBaseUrl()`, mas essa função deve ser confirmada/implementada;
- o roadmap é lido como `resRoad.roadmap`, mas o JSON atual usa `suggestions`; isso pode deixar o roadmap invisível;
- o botão de exclusão visual pode assustar, mesmo que não apague arquivo real. Recomenda-se renomear para “marcar para revisar/remover da visualização”.

Correções recomendadas:

1. criar função `getBaseUrl()` antes de `abrirPreview()`;
2. trocar leitura do roadmap para aceitar `resRoad.roadmap || resRoad.suggestions || []`;
3. proteger `abrirPreview()` contra path vazio;
4. renomear botão 🗑️ para `Ocultar localmente` ou `Marcar para revisão`;
5. criar alerta visual quando `catalog.items.length > 0`, mas filtros retornarem zero.

---

### 3.3 UpDown Hub — `07_Estudos_Markdown/index.html`

Status: **funcional, mas subaproveitado**.

O Hub carrega:

```txt
07_Estudos_Markdown/registry.json
```

Achados:

- `registry.json` tem documentos ativos, mas ainda representa uma fração pequena do material total;
- documentos `.md` são abertos por `viewer.html?doc=...`;
- apps listados dentro do UpDown apontam para `../apps/vasoativas/index.html`, mas o hub público `apps/index.html` aponta para `../07_Estudos_Markdown/apps/vasoativas/index.html`.

Correções recomendadas:

1. validar existência real de `07_Estudos_Markdown/viewer.html`;
2. validar existência real de `07_Estudos_Markdown/apps/vasoativas/index.html`;
3. adicionar fallback se `registry.json` carregar com zero documentos;
4. criar rotina automática: todo `.md` novo em `00_INBOX_ATUALIZACAO/03_Conteudos_UpDown_MD/` deve gerar entrada no `registry.json`.

---

### 3.4 Mapa Vivo — `assets/js/graph.js` + `data/connections.json`

Status: **avançado, mas precisa endurecimento de caminho/fallback**.

Achados:

- `data/connections.json` está na versão `4.2-unified`;
- `graph.js` usa D3 por CDN na home;
- o carregamento padrão usa `data/connections.json`, que funciona na home, mas pode falhar em páginas internas;
- os prompts prévios já recomendavam fallback com caminhos múltiplos.

Correções recomendadas:

1. adicionar `data-graph-src="/antigravity-consultas/data/connections.json"` no container do mapa;
2. manter fallback relativo para desenvolvimento local;
3. incluir fallback local para D3 ou renderização em lista quando D3 falhar;
4. validar que linhas sugeridas e diretas permanecem visíveis;
5. limitar nós `file` por página com botão “mostrar mais”.

---

### 3.5 Wrappers públicos

Status: **parcialmente bons, mas manifesto estava divergente**.

Wrappers/rotas encontrados:

```txt
biblioteca/index.html -> ../05_Biblioteca_IA/index.html
updown/index.html -> ../07_Estudos_Markdown/index.html
questoes/index.html -> ../02_Banco_Questoes_TEMI/index.html
apps/index.html -> hub próprio ativo
imagens/index.html -> galeria própria ativa
```

Correção aplicada no manifesto de rotas para refletir isso.

---

## 4. Lista de tarefas para o Antigravity executar 🛠️

### Fase 0 — Segurança obrigatória

1. Criar branch:

```bash
git checkout -b fix/resgate-manifest-first-2026-06-04
```

2. Não deletar, mover ou renomear arquivos originais.
3. Fazer commit pequeno por fase.
4. Antes de alterar, salvar relatório incremental em:

```txt
08_Documentacao_Projeto/RELATORIO_EXECUCAO_FIX_2026_06_04.md
```

---

### Fase 1 — Validar rotas principais

Testar no navegador/local server:

```txt
/index.html
/updown/index.html
/07_Estudos_Markdown/index.html
/biblioteca/index.html
/05_Biblioteca_IA/index.html
/imagens/index.html
/apps/index.html
/questoes/index.html
/02_Banco_Questoes_TEMI/index.html
/03_Calculadoras_UTI/index.html
/06_Card_Feed_Medico/index.html
```

Para cada rota, registrar:

- abre ou não abre;
- erro de console;
- erro 404;
- links internos quebrados;
- se mobile está legível.

---

### Fase 2 — Corrigir Biblioteca IA

Editar:

```txt
05_Biblioteca_IA/index.html
```

Adicionar antes da função `abrirPreview()`:

```js
function getBaseUrl() {
  const origin = window.location.origin;
  const path = window.location.pathname;
  if (path.includes('/antigravity-consultas/')) {
    return origin + '/antigravity-consultas/05_Biblioteca_IA/';
  }
  return window.location.href.replace(/index\.html.*$/, '').replace(/[^/]*$/, '');
}

function normalizePath(path) {
  if (!path) return '';
  return String(path).replace(/^\.\//, '').replace(/^05_Biblioteca_IA\//, '');
}
```

Trocar:

```js
roadmap = resRoad.roadmap || [];
```

Por:

```js
roadmap = resRoad.roadmap || resRoad.suggestions || [];
```

Melhorar `renderRoadmap()` para aceitar `title` ou `label`:

```js
const texto = r.label || r.title || r.description || 'Item sem título';
```

---

### Fase 3 — Corrigir Mapa Vivo

Editar `index.html`:

```html
<div class="graph" id="graph" data-graph-src="/antigravity-consultas/data/connections.json" style="height: 600px; background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid var(--border);"></div>
```

Editar `assets/js/graph.js`:

- se o fetch de `data-graph-src` falhar, tentar:

```js
const candidates = [
  dataUrl,
  'data/connections.json',
  './data/connections.json',
  '../data/connections.json',
  '/antigravity-consultas/data/connections.json'
];
```

- se D3 não existir, renderizar lista simples de nós com links.

---

### Fase 4 — Corrigir UpDown Hub

Validar:

```txt
07_Estudos_Markdown/registry.json
07_Estudos_Markdown/viewer.html
07_Estudos_Markdown/assets/estudos.js
```

Se `viewer.html` não existir, criar viewer mínimo para Markdown.

Adicionar mensagem de fallback quando `registry.documents.length === 0`:

```txt
Nenhum UpDown publicado no registry.json. Verifique se os arquivos .md foram integrados ao registro central.
```

---

### Fase 5 — Criar script de auditoria

Criar:

```txt
scripts/validate_routes.py
```

Função:

- ler `data/site_manifest.json`;
- ler `data/route_aliases.json`;
- conferir existência dos arquivos locais apontados;
- listar rotas quebradas;
- gerar relatório em Markdown.

Saída:

```txt
08_Documentacao_Projeto/RELATORIO_VALIDACAO_ROTAS.md
```

---

## 5. Critérios de sucesso ✅

O resgate será considerado bem-sucedido quando:

1. Home abrir sem erro crítico de console;
2. Biblioteca IA mostrar mais de 0 arquivos;
3. PDFs/DOCX abrirem em preview ou link direto;
4. UpDown Hub mostrar os documentos de `registry.json`;
5. `questoes/index.html` levar ao Banco TEMI;
6. `biblioteca/index.html` levar à Biblioteca IA;
7. `apps/index.html` e `imagens/index.html` permanecerem acessíveis;
8. Mapa Vivo carregar nós/conexões ou fallback em lista;
9. nenhum arquivo original for apagado;
10. relatório final listar arquivos alterados, riscos e pendências.

---

## 6. Prompt curto para colar no Antigravity ⚡

```txt
Você está no repositório aldenirfilho/antigravity-consultas. Execute o relatório 08_Documentacao_Projeto/RELATORIO_REVISAO_ANTIGRAVITY_2026_06_04.md. Trabalhe em branch fix/resgate-manifest-first-2026-06-04. Não apague, mova ou renomeie arquivos originais. Corrija primeiro rotas, manifests, Biblioteca IA, Mapa Vivo e UpDown Hub. Gere relatório incremental em 08_Documentacao_Projeto/RELATORIO_EXECUCAO_FIX_2026_06_04.md. Faça commits pequenos e valide GitHub Pages/mobile. Prioridade: restaurar acesso antes de melhorar estética.
```

---

## 7. Próximas melhorias recomendadas 🌱

1. Criar `scripts/validate_routes.py`.
2. Criar `scripts/generate_site_manifest.py`.
3. Criar `scripts/sync_updown_registry.py`.
4. Criar `scripts/sync_biblioteca_catalogo.py`.
5. Criar página `/status/index.html` com saúde do site.
6. Criar fallback universal para JSON não carregado.
7. Criar auditoria LGPD antes de publicar novos materiais.
8. Criar painel “Arquivos órfãos” e “Links quebrados”.
9. Criar rotina de commit por lote de 20 arquivos.
10. Criar modo leitor unificado para Markdown, PDF e DOCX.
