# 🧭 Como alimentar cada seção do Antigravity Consultas

Manual operacional passo a passo para incluir, revisar, validar e publicar
conteúdo no site sem perder privacidade, segurança clínica, rastreabilidade ou
compatibilidade offline.

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Atualizado em | 25 de julho de 2026 |
| Escopo | Home, 2 Portais, 2 Estações, 16 módulos/apps + Mapa Vivo, hubs editoriais, TEMI, guias, imagens, downloads e GitHub Pages |

> **Regra central:** conteúdo novo começa privado. Só chega ao site depois de autoria/licença, privacidade e revisão clínica humana.

## 🚀 Rota rápida para não se perder

Use primeiro a tabela **Escolha rápida do destino**. Depois pressione
`Cmd+F` no Mac ou `Ctrl+F` no Windows para abrir somente a seção que você
precisa agora.

1. Coloque o material no inbox privado do componente.
2. Escolha uma única seção de destino.
3. Confirme autoria/licença, zero dados identificáveis e revisão clínica.
4. Promova apenas a versão aprovada para a fonte canônica pública.
5. Execute o gerador específico da seção.
6. Revise o diff e os arquivos gerados.
7. Rode testes, manifests, paths, rotas e o portão de privacidade.
8. Monte `site/` por allowlist e homologue em navegador.
9. Abra uma Pull Request de escopo curto.
10. Faça merge somente com CI verde e revisão humana concluída.
11. Aguarde o deploy do GitHub Pages.
12. Confirme a rota publicada e uma rota antiga relacionada.

```text
PRIVADO → 3 GATES → FONTE CANÔNICA → GERADOR → DIFF
        → TESTES → ALLOWLIST → PREVIEW → PR → MAIN → PAGES → HOMOLOGAÇÃO
```

### ⏱️ Se você tem 1 hora

Não escolha manualmente uma seção. Peça ao Codex: **“Execute a Rotina
Antigravity de hoje, com 60 minutos.”**

O planejador `scripts_admin/plan_daily_updates.py` seleciona automaticamente
uma seção de conteúdo Turbo TEMI, uma de design TDAH-friendly e uma de
performance mensurável. Radar Diário, Integridade/privacidade e Portal Vivo
também recebem uma checagem contínua obrigatória. O roteiro completo está em
[`ROTINA_DIARIA_30_MIN.md`](ROTINA_DIARIA_30_MIN.md).

Às sextas, os três pilares formam um sprint de expansão dentro dos mesmos 60
minutos. O cronograma mostra a etapa atual e a fila de novos módulos, apps e
seções sugeridos; nenhuma rota pública é criada antes dos gates e da revisão.

## 🗺️ Escolha rápida do destino

| Quero adicionar | Fonte canônica | Atualização principal |
|---|---|---|
| UPGRADE, correção ou nova função da plataforma | `17_Portal_Vivo/data/posts.json` | Compositor → agente `antigravity-publicar-portal` → publicador validado |
| Assinatura, métricas agregadas, diretório administrativo ou manifestação | `18_Centro_Tripulacao/` | Interface pública → backend seguro configurado → RLS → revisão de privacidade |
| Artigo, notícia clínica ou observação de estudo enviada pelo chat | `15_Radar_Cientifico/data/radar.js` | Auditoria da fonte → síntese Turbo TEMI → Estação Radar Diário |
| Produto, equipamento ou promoção útil | `15_Radar_Cientifico/data/radar.js` + `assets/products/` | `product-watch` → preço datado → especificações/limites → par de imagens → canal Produtividade & Compras |
| Texto, botão ou cartão da Home | `index.html` | Edição manual + testes |
| Estudo clínico estruturado | `01_UpDown_Hub/content/` | Registro em `01_UpDown_Hub/registry.json` |
| PDF, DOCX ou documento pesquisável | `02_Biblioteca_IA_Engine/acervo/` | Baseline → scanner → previews |
| Imagem didática curta | `05_Midia_E_Feed/assets/cards/public/` | `scan_card_feed.py` |
| Ebook ou material longo | `04_Ebooks_Intensiva_Clinica/public/` | `scan_content_module.py` |
| Questão comentada, OSCE ou Anki | `07_Questoes_Comentadas/public/` | `scan_content_module.py` |
| Transcrição, legenda ou aula autorizada | `08_Transcricoes/public/` | `scan_content_module.py` |
| Material de ultrassom/POCUS | `09_POCUS_Hub/public/` | `scan_content_module.py` |
| Banco de questões TEMI | `questoes/data/` | Sincronização manual JS/JSON |
| Conteúdo do módulo AVC Agudo | `01_Modulos_Clinicos/AVC_Agudo/` | Sincronização manual entre dados, interface e material extenso |
| Conteúdo LES Autoanticorpos | `les-autoanticorpos/` | Sincronização manual das páginas e registro UpDown |
| Emergência, caso, flashcard ou score clínico | `01_Modulos_Clinicos/<módulo>/data/catalog.js` | Validador clínico dedicado |
| Calculadora ou aplicativo | Pasta do app e catálogo/fórmula correspondente | Testes de fórmula e interface |
| Desafio TEMI/R3 | `10_DESAFIOS/` | `build_desafios.py` |
| Mnemônico | `11_MNEMONICOS/` | `build_mnemonicos.py` |
| Nó ou conexão temática | `data/connections.json` | `build_connections.py` |
| Guia para o usuário | `docs_usuario/` | Markdown + wrapper HTML |
| Imagem geral | `imagens/` ou pasta de assets do módulo | Registro e validação manual |
| Pacote Mac, Windows ou iPhone | ZIP já permitido em `downloads/` | Checksum + teste físico |

## 🛡️ Portão universal antes de publicar

### Gate 1 — autoria e licença

- Confirme que o conteúdo é autoral, licenciado ou publicável.
- Não copie integralmente livros, cursos, artigos ou imagens de terceiros.
- Prefira síntese própria, algoritmo original, comentário e referência oficial.
- Registre a fonte e a data de consulta quando houver recomendação clínica.
- Se os direitos de uso ainda não estiverem documentalmente resolvidos, mantenha o item no inbox privado.

### Gate 2 — privacidade e LGPD

- Remova nome, iniciais, datas, rosto, voz, prontuário e instituição.
- Remova combinações raras que possam reidentificar uma pessoa.
- Limpe metadados de PDF, DOCX, imagem, áudio e vídeo.
- Nunca publique senha, token, e-mail privado ou documento pessoal.
- Casos educacionais devem ser fictícios ou totalmente descaracterizados.

### Gate 3 — revisão clínica humana

- Confira população, indicação, contraindicação e limitações.
- Confira unidades, doses, intervalos, fórmulas e arredondamentos.
- Diferencie diretriz, evidência, prática local e opinião.
- Registre data de revisão e referência.
- Mantenha `em_revisao` ou `em-revisao-medica` até o aceite real.

> **Pare se qualquer gate estiver incompleto.** O scanner e o CI não substituem julgamento médico, prova de licença ou auditoria de privacidade.

> **Status não é controle de acesso.** `em_revisao` é um rótulo público. Rascunho verdadeiro deve permanecer fora de qualquer fonte pública. Os módulos Hematologia/Reumatologia em `em-revisao-medica` só podem sair como `public-preview`, com aviso visível, até a revisão humana final.

## 📥 Entrada privada e promoção controlada

Use preferencialmente:

```text
00_INBOX_ATUALIZACAO/_private/triagem/
```

Componentes com inbox próprio:

```text
02_Biblioteca_IA_Engine/inbox/
04_Ebooks_Intensiva_Clinica/inbox/
05_Midia_E_Feed/inbox/
07_Questoes_Comentadas/inbox/
08_Transcricoes/inbox/
09_POCUS_Hub/inbox/
```

Algumas pastas privadas são ignoradas pelo Git e podem não existir numa cópia
nova. Crie somente as necessárias:

```bash
mkdir -p 00_INBOX_ATUALIZACAO/_private/triagem \
  02_Biblioteca_IA_Engine/inbox \
  04_Ebooks_Intensiva_Clinica/inbox \
  05_Midia_E_Feed/inbox \
  07_Questoes_Comentadas/inbox \
  08_Transcricoes/inbox \
  09_POCUS_Hub/inbox
```

Depois dos três gates, crie a fonte pública do hub somente ao promover o
primeiro item aprovado:

```bash
mkdir -p 04_Ebooks_Intensiva_Clinica/public \
  07_Questoes_Comentadas/public \
  08_Transcricoes/public \
  09_POCUS_Hub/public
```

`inbox/` e `_private/` não são versionados; `public/` é fonte pública
rastreada. Confirme a regra local com `git check-ignore -v <caminho>` antes de
colocar material sensível.

O inbox não é fonte pública. Depois dos três gates, copie somente o arquivo
aprovado para a pasta canônica indicada neste manual.

Não editar `public_site/`. Ele é um espelho legado e não participa do deploy
oficial. Não guardar fonte única em `site/`; essa pasta é temporária e é
apagada/recriada pelo builder.

## 🏠 Home — como alimentar cada bloco

A fonte visual principal é:

```text
index.html
```

### Hero, navegação, missão e métricas

1. Edite título, subtítulo, métricas e botões diretamente em `index.html`.
2. Preserve `h1`, landmarks, labels, foco, tema claro e redução de movimento.
3. Não coloque contagem manual sem conferir o catálogo correspondente.
4. Teste desktop, celular, zoom, teclado e impressão.

### Downloads Mac, Windows e iPhone

1. Altere somente os três ZIPs permitidos em `downloads/`.
2. Preserve instalação reversível e sem privilégio administrativo.
3. Atualize `downloads/SHA256SUMS.txt`.
4. Teste a estrutura interna do ZIP.
5. Atualize textos e links do bloco `#downloads` em `index.html`.
6. Faça homologação física no sistema operacional antes de afirmar suporte.

### Os 21 cartões — 2 Portais + 2 Estações + 16 módulos/apps + Mapa Vivo

Cada cartão é um link com classe `module-card` e possui:

```text
href
ícone
título
descrição
tags
chamada para ação
```

O **Portal Vivo** apresenta exclusivamente os UPGRADEs, correções e marcos de
evolução da plataforma. O **Centro da Tripulação** reúne assinatura consentida,
métricas agregadas, preferências e manifestações; dados de usuários aparecem
somente no comando autenticado. As duas áreas permanentes e independentes são a
**Estação Radar Diário**, destino do conteúdo clínico e de estudo recebido pelo
chat, e a **Estação Diretório Médico**, catálogo de fontes verificáveis.

Os 16 módulos/apps são UpDown, Biblioteca, Calculadoras, RespiraSense,
RespiraCrit, Delirium, Simulador TEMI, Card Feed, Ebooks, Questões Comentadas,
Transcrições, POCUS, RenalDose, SAPS 3, Hematologia e Reumatologia. O último
cartão visual é o **Mapa Vivo**, que abre a seção `#mapa` da Home.

Ao criar ou alterar um cartão:

1. confirme primeiro que a rota funciona;
2. edite o cartão em `index.html`;
3. revise `06_Infra_Site_E_Assets/data/home-manifest.json`;
4. revise `data/site_manifest.json`;
5. revise `data/topics.json` e `data/route_aliases.json`, quando aplicável;
6. execute os validadores de rotas e manifests;
7. confira o cartão no tema claro, espacial e alto contraste.

> **Atenção:** os cartões HTML são a apresentação efetiva. Confirme também
> `data/site_manifest.json` e os testes de cobertura antes de publicar.

### Hematologia e Reumatologia em destaque

Os blocos visuais da Home ficam em `index.html`, mas o conteúdo clínico vem de:

```text
01_Modulos_Clinicos/Hematologia_Critica/data/catalog.js
01_Modulos_Clinicos/Reumatologia_Critica/data/catalog.js
```

Sincronize títulos, métricas e estado de revisão com os catálogos e com os
respectivos `module.manifest.json`.

### Vias de aprendizagem

1. Edite os cards do bloco `#vias` em `index.html`.
2. Use links para rotas reais, nunca para arquivos temporários.
3. Mantenha descrição curta: objetivo, tempo estimado e produto de saída.
4. Confira as conexões temáticas em `data/topics.json`.

### Mapa Vivo

Fonte híbrida:

```text
data/connections.json
```

1. Curadoria manual pode adicionar nós e arestas.
2. Desafios e mnemônicos automáticos são atualizados pelo builder.
3. Execute `python3 scripts_admin/build_connections.py`.
4. Execute `python3 scripts_admin/validate_mapa_vivo.py`.
5. Abra o mapa, filtre cada ramo e teste todos os links novos.

### Mnemônicos e Desafios da Home

Não edite o HTML das listas para inserir conteúdo.

```text
11_MNEMONICOS/ → data/mnemonicos.json
10_DESAFIOS/   → data/desafios.json
```

Use os geradores específicos descritos adiante.

### Bloco TEMI

1. Atualize rotas e contagens somente depois de validar o banco real.
2. O hub público usa arquivos JavaScript em `questoes/data/`.
3. Não deduza número de questões por um JSON que a página não carrega.
4. Confira filtros, resposta, comentário, pérola e navegação por teclado.

### Pipeline, roadmap e segurança

Esses blocos são editoriais e ficam em `index.html`.

1. Altere apenas quando o processo real mudar.
2. Não prometa automação que o workflow não executa.
3. Mantenha a sequência privado → revisão → build → PR → Pages.
4. Preserve avisos educacionais e de revisão humana.

### Painel de acessibilidade

Ao adicionar um novo recurso:

1. revise o painel `#a11yPanel`;
2. mantenha rótulo acessível, alvo mínimo e foco visível;
3. teste texto ampliado, contraste e redução de movimento;
4. não quebre a persistência local de preferências;
5. confira o painel em tela estreita.

### Footer da Home

O footer é manual e fica em `index.html`. Ele reúne marca, identificação
profissional, links de módulos/conteúdo/projeto e o aviso educacional.

1. Atualize links quando uma rota canônica mudar.
2. Não altere nome, CRM ou aviso clínico sem revisão humana explícita.
3. Preserve os títulos das colunas e textos compreensíveis.
4. Teste todos os links, 404, tela estreita, tema claro e impressão.

## ✍️ UpDown Hub

### Onde entra

```text
01_UpDown_Hub/content/<area>/<slug>.md
```

HTML interativo aprovado também pode ficar na mesma área.

### Modelo do Markdown

```yaml
---
title: "Título clínico objetivo"
slug: "titulo-clinico-objetivo"
category: "Medicina Intensiva / Clínica Médica"
tags: [temi, emergencia, tema]
status: "em_revisao"
visibility: "publico"
source_type: "síntese autoral baseada em fontes revisadas"
copyright_safety: "reescrita autoral, sem cópia literal extensa"
updated_at: "AAAA-MM-DD"
---
```

### Passo a passo

1. Comece por `01_UpDown_Hub/content/modelos/template_estudo_seguro.md`.
2. Escreva pergunta clínica, alerta, algoritmo, diferenciais e limitações.
3. Acrescente armadilhas, mnemônico, flashcards e questões comentadas.
4. Use referências datadas.
5. Registre o conteúdo em `01_UpDown_Hub/registry.json`.
6. Preencha `id`, `title`, `icon`, `path`, `theme`, `status`, `version`, `summary`, `tags` e, se útil, `relatedUrl`.
7. Mantenha `status: em_revisao` até a homologação.
8. Abra pelo hub e pelo viewer Markdown.

Nos campos editoriais do `registry.json`, aceite somente texto simples e emoji;
HTML é proibido. Em `path` e `relatedUrl`, use apenas caminho relativo revisado
ou HTTPS. Nunca aceite `javascript:`, protocolo desconhecido, aspas injetadas ou
markup copiado. A interface atual injeta esses campos em HTML; por isso, revise
cada valor como entrada não confiável.

> Um arquivo dentro de rota pública pode ser acessado diretamente mesmo com status de revisão. `em_revisao` não torna o arquivo privado; rascunho verdadeiro deve permanecer no staging privado.

## 📚 Biblioteca IA

### Entrada e inventário privado

Coloque o original em:

```text
02_Biblioteca_IA_Engine/inbox/
```

Gere o inventário:

```bash
python3 scripts_admin/inventory_library_candidates.py \
  --source-root 02_Biblioteca_IA_Engine/inbox \
  --output 02_Biblioteca_IA_Engine/_private/library-candidates.json
```

### Promoção

Depois dos três gates, copie para:

```text
02_Biblioteca_IA_Engine/acervo/<tema>/<arquivo>
```

### Baseline obrigatório

O baseline deve ser aprovado antes do scanner:

```bash
python3 scripts_admin/update_library_publication_baseline.py --approve \
  --reviewer "Revisor responsável" \
  --change-note "Adicionar <tema/arquivo> após revisão" \
  --attest-authorship-license \
  --attest-privacy \
  --attest-clinical-review
```

As flags representam atestações reais.

### Regeneração

```bash
python3 02_Biblioteca_IA_Engine/scan_biblioteca.py
python3 scripts_admin/build_library_previews.py
python3 scripts_admin/build_library_connections.py
```

### Campos editoriais permitidos

Em `02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json`, a curadoria pode
corrigir:

```text
title
resumo
tags
ia_origem
data
createdAt
authorshipStatus
authorshipEvidence
license
privacyReviewStatus
clinicalReviewStatus
reviewedAt
```

Depois de corrigir metadados editoriais, rode novamente scanner, previews e
conexões para consolidar a camada editorial. Revise o diff antes de continuar.

### Campos estruturais que não devem ser editados

```text
id
path
filename
extension
sourceSha256
sizeBytes
previewMode
```

Também não edite manualmente:

```text
02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json
02_Biblioteca_IA_Engine/data/biblioteca_previews.json
02_Biblioteca_IA_Engine/previews/
```

### Conferência visual

- PDF e preview;
- DOCX e preview textual;
- Markdown;
- busca dentro do documento;
- Leitura Focada e saída com `Esc`;
- destaques e notas locais;
- arquivo apenas para download;
- teclado e celular.

## 🖼️ Card Feed Médico

### Fonte da imagem

```text
05_Midia_E_Feed/assets/cards/public/<tema>/<arquivo>.webp
```

Prefira WEBP ou PNG. Use nome curto, descritivo, sem espaços ou acentos.

### Tema novo

Registre em:

```text
05_Midia_E_Feed/data/themes.json
```

Campos principais:

```text
id
label
emoji
folder
href
```

### Metadados curados

Use `05_Midia_E_Feed/data/cards.json` para título, explicação, tags, fonte,
status, autoria/licença/revisão e `imageUrl`.

### Gerar índice público

```bash
python3 scripts_admin/scan_card_feed.py
python3 scripts_admin/scan_card_feed.py --check
```

Não edite manualmente:

```text
05_Midia_E_Feed/data/public.json
```

### Conferência visual

1. filtre pelo tema;
2. abra a imagem;
3. confira nitidez, legenda e contraste;
4. teste ordenação e tela estreita;
5. confirme que nenhum dado identificável aparece na arte;
6. teste avanço temporal se o item relacionado for áudio ou vídeo.

SVG pode conter conteúdo ativo. Prefira PNG/WEBP; SVG exige o validador de
segurança.

## 📘 Ebooks Intensiva e Clínica

> **SVG fora do Card Feed:** não publique enquanto não existir um gate geral de segurança. Converta para PNG/WEBP. Hoje o scanner do Card Feed é o único que valida SVG automaticamente; os scanners genéricos apenas indexam o arquivo.

### Fontes públicas

```text
04_Ebooks_Intensiva_Clinica/public/
04_Ebooks_Intensiva_Clinica/links/links.json
```

Antes de promover, procure arquivos acima do limite prático do GitHub:

```bash
find 04_Ebooks_Intensiva_Clinica/public -type f -size +99M -print
```

Mantenha arquivo acima de 99 MiB no inbox privado. Para conteúdo licenciado,
cadastre um link oficial em `links/links.json`; não tente incluí-lo no commit.

Para link externo, use:

```json
[
  {
    "title": "Nome do material",
    "url": "https://exemplo.com/material",
    "format": "html",
    "description": "Descrição objetiva.",
    "tags": ["ebook", "uti"]
  }
]
```

### Regeneração

```bash
python3 scripts_admin/scan_content_module.py 04_Ebooks_Intensiva_Clinica
python3 scripts_admin/scan_content_module.py 04_Ebooks_Intensiva_Clinica --check
```

Não edite `04_Ebooks_Intensiva_Clinica/data/catalogo.json`.

Confira capa/título, formato, tamanho, download, link externo e licença.

## ❓ Questões Comentadas, OSCE e Anki

### Fontes públicas

```text
07_Questoes_Comentadas/public/
07_Questoes_Comentadas/links/links.json
```

Aceita documentos, planilhas, CSV, Anki, HTML e outros formatos suportados pelo
scanner.

### Regeneração

```bash
python3 scripts_admin/scan_content_module.py 07_Questoes_Comentadas
python3 scripts_admin/scan_content_module.py 07_Questoes_Comentadas --check
```

Não edite `07_Questoes_Comentadas/data/catalogo.json`.

Faça revisão separada de enunciado, alternativas, gabarito, comentário, pérola,
fonte e ausência de ambiguidade.

## 🎙️ Transcrições

### Fontes públicas

```text
08_Transcricoes/public/
08_Transcricoes/links/links.json
```

Formatos frequentes: TXT, Markdown, DOCX, SRT, VTT, áudio e vídeo autorizado.

### Regeneração

```bash
python3 scripts_admin/scan_content_module.py 08_Transcricoes
python3 scripts_admin/scan_content_module.py 08_Transcricoes --check
```

Não edite `08_Transcricoes/data/catalogo.json`.

Antes de publicar, confirme consentimento/licença da gravação, remova nomes,
vozes identificáveis e referências a pacientes. Revise erros de transcrição,
unidades e nomes de medicamentos.

## 🔊 POCUS Hub

### Fontes públicas

```text
09_POCUS_Hub/public/
09_POCUS_Hub/links/links.json
```

Pode receber imagem, vídeo, aula, PDF, HTML ou link licenciado.

### Regeneração

```bash
python3 scripts_admin/scan_content_module.py 09_POCUS_Hub
python3 scripts_admin/scan_content_module.py 09_POCUS_Hub --check
```

Não edite `09_POCUS_Hub/data/catalogo.json`.

Confirme anonimização, orientação da imagem, janela, legenda, lado, preset,
ganho/profundidade e limitação diagnóstica. Uma imagem POCUS não deve ser
publicada como diagnóstico universal sem contexto.

## 🏆 Banco TEMI estruturado

### Fontes carregadas pelo site

```text
questoes/data/hub_qbanks.js
questoes/data/qbank_avc_agudo.js
```

Materiais relacionados:

```text
questoes/banco-questoes-padrao-temi-avc-agudo/data/qbank.temi.avc-agudo.json
questoes/banco-questoes-padrao-temi-avc-agudo/data/connections.qbank.avc-agudo.json
```

### Campos de uma questão

```text
id
difficulty
domain
tags[]
related[]
stem
options {A, B, C, D, E}
answer
comment
pearl
relatedTopics[]
sourceRefs[]
```

### Passo a passo

1. crie um ID estável;
2. escreva enunciado autossuficiente;
3. use cinco alternativas plausíveis;
4. registre gabarito e comentário;
5. acrescente pérola e referências;
6. sincronize o JS público e o JSON de referência;
7. atualize contagens e descrição em `hub_qbanks.js`;
8. atualize conexões;
9. teste resposta certa, erradas e navegação;
10. confira mobile e teclado.

Não existe gerador genérico confiável JSON → JS. A sincronização é manual.

Não edite:

```text
questoes/data/qbank_avc_agudo 2.js
questoes/data/hub_qbanks 2.js
```

Essas são cópias conflitantes legadas e não são a fonte carregada.

## 🧠 AVC Agudo e LES Autoanticorpos

### AVC Agudo

Fontes efetivamente carregadas:

```text
01_Modulos_Clinicos/AVC_Agudo/avc.html
01_Modulos_Clinicos/AVC_Agudo/avc.js
01_Modulos_Clinicos/AVC_Agudo/db_fundamentos.js
01_Modulos_Clinicos/AVC_Agudo/db_interativo.js
01_Modulos_Clinicos/AVC_Agudo/db_pratica.js
01_Modulos_Clinicos/AVC_Agudo/db_pesquisa.js
01_Modulos_Clinicos/AVC_Agudo/db_cross_ia.js
01_Modulos_Clinicos/AVC_Agudo/Imagens/
```

O estudo longo mantém duas representações que não possuem gerador confiável:

```text
01_Modulos_Clinicos/AVC_Agudo/avc-agudo-31-blocos.md
01_Modulos_Clinicos/AVC_Agudo/avc_31_blocos.html
```

1. Altere o banco JS correspondente ao bloco.
2. Ajuste `avc.js` somente quando mudar comportamento, não apenas texto.
3. Ao alterar o estudo longo, sincronize Markdown e HTML e revise o diff.
4. Adicione imagem em `Imagens/`, preserve caixa/Unicode NFC, remova metadados e atualize a referência do bloco.
5. Se rota ou tema mudar, revise `data/topics.json`, `data/connections.json` e `questoes/data/hub_qbanks.js`.
6. Teste âncoras, busca, LAMS/NIHSS, quiz, qbank, imagens, tema claro e celular.

### LES Autoanticorpos

Fontes:

```text
les-autoanticorpos/index.html
les-autoanticorpos/les-anticorpos-mapa-visual.html
les-autoanticorpos/les-dashboard-calculadora.html
les-autoanticorpos/les-escada-terapeutica.html
les-autoanticorpos/les-fluxograma-eular-acr-2019.html
```

1. Edite a página correspondente ao tipo de conteúdo.
2. Sincronize a entrada `updown-003-les-autoanticorpos` em `01_UpDown_Hub/registry.json`.
3. Revise tópicos, conexões e links da Home quando a rota mudar.
4. Valide mapa, fluxograma, SLEDAI/EULAR, escada terapêutica, quiz, flashcards, impressão, tema claro e celular.
5. Faça dupla checagem de critérios, pontos, métodos laboratoriais, doses e referências.

## 🩸 Hematologia e Reumatologia Crítica

### Fontes clínicas

```text
01_Modulos_Clinicos/Hematologia_Critica/data/catalog.js
01_Modulos_Clinicos/Reumatologia_Critica/data/catalog.js
```

Coleções:

```text
meta
categories
diagnosticTracks
emergencies
comparisons
concepts
mnemonics
alerts
calculators
questions
flashcards
cases
references
```

### Emergência

```text
id, title, icon, category, urgency, color, summary, trigger, tags,
firstHour[], decisive[], doNot[], pearl, referenceIds[]
```

### Outros blocos

- Trilha: `id`, `icon`, `title`, `subtitle`, `priority[]`, `collect[]`, `avoid`, `related[]`.
- Comparativo: `id`, `label`, `title`, `intro`, `columns[]`, `rows[]`, `pearl`.
- Calculadora: `id`, `shortTitle`, `title`, `kind`, `purpose`, `description`, `warning`, `requirements[]`, `groups[]`, `ranges`.
- Questão: `id`, `domain`, `prompt`, `options[]`, `correct`, `explanation`, `rule`.
- Caso: `id`, `title`, `vignette`, `options[]`, `correct`, `explanation`, `pearl`.
- Referência: `id`, `group`, `year`, `title`, `note`, `url`.

### Validação

```bash
node tests/validate_clinical_catalogs.js
```

Sincronize `module.manifest.json`, README do módulo, fonte canônica no UpDown e
métricas da Home. Não promova `em-revisao-medica` sem revisão humana.

## 🫁 RespiraSense e RespiraCrit

### RespiraSense

Fonte principal:

```text
01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/app.js
```

Blocos de dados:

```text
SUPPORT_OPTIONS
MODE_OPTIONS
DEMO_CASES
OXYGEN_DEVICES
VENT_MODES
PROTECTIVE_TARGETS
FORMULAS
tabelas PEEP
regras de assincronia
```

Ao alterar, teste caso normal, limites, Retina, impressão, tema claro, teclado e
descrições acessíveis dos gráficos.

### RespiraCrit

Fonte:

```text
01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html
```

Dados, fórmulas, suporte respiratório, PEEP/FiO₂ e assincronias estão no próprio
HTML. Exija dupla checagem clínica e teste valores conhecidos.

## 💊 Apps e calculadoras

### Diretórios e fontes

| App | Fonte |
|---|---|
| Hub de apps | `apps/index.html` |
| Central de calculadoras | `03_Calculadoras_E_Apps/index.html` |
| Vasoativas standalone | `01_UpDown_Hub/data/vasoactive_drugs_brasil_presets.json` + `01_UpDown_Hub/apps/vasoativas/index.html` |
| Vasoativas na Central | Arrays e fórmulas inline em `03_Calculadoras_E_Apps/index.html` |
| RenalDose | `13_RenalDose_Antimicrobianos/index.html` |
| SAPS 3 | `14_SAPS3_Calculator/index.html` |
| Sódio/Disnatremia | `calculadoras/sodio-disnatremia.html` |
| Bicarbonato/Albumina | `calculadoras/bicarbonato-albumina.html` |
| Vasculites Decision | `03_Calculadoras_E_Apps/vasculites-decision/` |

As duas implementações de vasoativas são independentes. Alterar uma não
atualiza a outra; sincronize e teste ambas quando a mudança for compartilhada.

### Ficha obrigatória antes de programar

- problema clínico;
- população;
- entradas e unidades;
- intervalos plausíveis;
- fórmula/regra e referência;
- contraindicações;
- interpretação limitada;
- próxima ação segura;
- data e responsável pela revisão.

### Checklist de implementação

- validar vazio, negativo, extremo e separador decimal;
- exibir unidades em entrada e resultado;
- mostrar fórmula ou lógica;
- oferecer Limpar/Reiniciar;
- não armazenar dados de paciente;
- não transmitir dados;
- testar teclado, mobile e tema claro;
- testar exemplos conhecidos;
- documentar arredondamento;
- incluir aviso educacional e limitações.

Uma nova ferramenta não é descoberta automaticamente. Atualize Hub de Apps,
Home, manifests, rotas e testes quando aplicável.

## 🧠 Desafios TEMI e R3

### Fonte

```text
10_DESAFIOS/**/*.md
```

### Organização

- arquivo solto: um desafio;
- `10_DESAFIOS/TEMI/`: força ramo TEMI;
- `10_DESAFIOS/R3/`: força ramo R3;
- subpasta: combina os Markdown em ordem alfabética;
- acrescentar conteúdo ao mesmo arquivo continua o desafio.

O primeiro H1 vira título. H2/H3 ou o primeiro parágrafo formam o resumo.

As pastas `10_DESAFIOS/TEMI/` e `10_DESAFIOS/R3/` podem não existir ainda.
Crie uma delas somente quando quiser forçar o ramo; caso contrário, use um
arquivo solto.

### Editor visual

O editor em `admin/desafios.html` trabalha com
`data/desafios.json`:

1. abra o editor no Chrome ou Edge do computador;
2. clique em **Vincular data/desafios.json** e escolha o arquivo canônico;
3. para item vindo de `.md`, edite título e conteúdo no Markdown;
4. use o editor apenas para `difficulty`, `tags`, `tema`, `observacoes` e `featured`;
5. para item manual sem `source`, salve diretamente no JSON vinculado;
6. sem vínculo, baixe o novo `desafios.json` e substitua o canônico somente após comparar versões;
7. nunca substitua um arquivo mais novo sem revisar o diff;
8. execute o gerador e as conexões.

### Regeneração

```bash
python3 scripts_admin/build_desafios.py
python3 scripts_admin/build_connections.py
```

`data/desafios.json` é híbrido. Não altere manualmente título ou conteúdo de
entradas com `source: 10_DESAFIOS...`; edite o Markdown. Use o editor visual
para entradas manuais e para os campos preservados pelo rebuild:
`difficulty`, `tags`, `tema`, `observacoes` e `featured`. Depois rode o builder
e revise o diff.

## 🧠 Mnemônicos

### Fonte

```text
11_MNEMONICOS/*.md
```

O scanner atual lê arquivos no primeiro nível, não subpastas.

### Frontmatter

```yaml
---
id: identificador
title: "Título"
emoji: "🧠"
color: "var(--cyan)"
category: "Categoria"
tags: ["tag1", "tag2"]
letters:
  A: "Significado de A"
  B: "Significado de B"
---
```

### Regeneração

```bash
python3 scripts_admin/build_mnemonicos.py
python3 scripts_admin/build_connections.py
```

Não edite manualmente:

```text
data/mnemonicos.json
```

Confira expansão de cada letra, conteúdo completo, contraste e link no Mapa.

## 🧭 Tópicos, Mapa Vivo e manifestos

### Tópicos

Em `data/topics.json`, um tópico normalmente possui:

```text
id
title
description
url
parent
type
status
priority
tags
```

### Conexões

Em `data/connections.json`:

```text
nó: id, label, body, type, url, status
aresta: from, to, relation
```

### Manifests

Ao criar rota ou módulo, revise:

```text
data/site_manifest.json
06_Infra_Site_E_Assets/data/home-manifest.json
data/route_aliases.json
module.manifest.json
```

Valide:

```bash
python3 scripts_admin/check_static_manifests.py
python3 scripts_admin/validar_paths.py --check
python3 scripts/validate_routes.py
python3 scripts_admin/validate_mapa_vivo.py
```

Limitação conhecida: `check_static_manifests.py` ainda consulta um manifesto
legado em `public_site/` ao comparar `canonicalRoutes`. Se uma rota canônica
nova expuser essa dependência, pare e corrija o validador em uma entrega
separada. Não sincronize nem edite `public_site/` para contornar o gate.

## 🖼️ Imagens e assets gerais

1. escolha a pasta do componente;
2. use nome curto e descritivo;
3. preserve Unicode NFC e caixa do caminho;
4. remova metadados;
5. otimize sem perder números ou legendas;
6. prefira WEBP/PNG para material didático;
7. teste texto alternativo;
8. fora do Card Feed, converta SVG para PNG/WEBP; o gate automático geral ainda não existe;
9. registre a imagem no catálogo ou HTML correspondente;
10. confira em tela Retina e celular.

### Galeria Visual

`imagens/index.html` é a página pública da Galeria Visual; ela não descobre
novos arquivos automaticamente. Os assets ficam na pasta canônica do módulo,
como `01_Modulos_Clinicos/AVC_Agudo/Imagens/`, ou em `assets/img` do componente.

Para criar um cartão:

1. coloque o asset na pasta canônica do módulo;
2. edite `imagens/index.html`;
3. preencha `href`, `src`, `alt`, título e descrição;
4. preserve caixa do caminho e composição Unicode NFC;
5. teste link direto, miniatura, 404, Retina, celular e teclado.

Card Feed e módulos mantêm pastas próprias e devem usar seus respectivos
scanners/manifests.

## 📖 Guias e documentos do usuário

### Estrutura

```text
docs_usuario/NOME_DO_GUIA.md
docs_usuario/NOME_DO_GUIA/index.html
```

O Markdown é a fonte canônica. O HTML usa `guide-reader.js` para oferecer:

- artigo branco;
- índice;
- texto ampliado;
- alto contraste;
- impressão/PDF;
- responsividade;
- fallback para o Markdown.

### Passo a passo

1. escreva H1, H2 e H3;
2. use listas simples, tabelas, citações e blocos de código;
3. evite HTML bruto e listas profundamente aninhadas;
4. crie o wrapper HTML;
5. adicione o cartão em `docs_usuario/index.html`;
6. adicione links na Home e no README;
7. adicione as rotas ao `sw.js`;
8. atualize testes e workflow;
9. gere e revise DOCX/PDF quando o guia precisar ser baixável;
10. teste leitura, impressão e fallback offline.

## 📦 Pacotes Mac, Windows e iPhone

Somente estes downloads são públicos:

```text
downloads/Antigravity-Consultas-macOS.zip
downloads/Antigravity-Consultas-Windows.zip
downloads/Antigravity-Consultas-iPhone-Icones.zip
downloads/SHA256SUMS.txt
```

Qualquer arquivo extra em `downloads/` bloqueia o build.

Depois de alterar:

1. teste ZIP;
2. confira os arquivos internos;
3. calcule SHA-256;
4. atualize `SHA256SUMS.txt`;
5. teste instalação e desinstalação;
6. documente limitações;
7. faça homologação física.

## ⚙️ O que é fonte e o que é gerado

### Editar

- Markdown em `01_UpDown_Hub/content/`;
- arquivos aprovados em `acervo/` ou `public/`;
- `links/links.json`;
- catálogos clínicos fonte;
- JS/HTML canônico de apps;
- `registry.json`;
- `topics.json`;
- curadoria manual permitida em `connections.json`;
- curadoria híbrida de `data/desafios.json` pelo editor visual;
- Markdown em `10_DESAFIOS/` e `11_MNEMONICOS/`;
- guias em `docs_usuario/`.

### Não editar manualmente

- `data/mnemonicos.json`;
- `<hub>/data/catalogo.json`;
- `05_Midia_E_Feed/data/public.json`;
- manifestos estruturais e previews da Biblioteca;
- `site/`;
- `public_site/`;
- arquivos com sufixo ` 2` criados por conflito.

`data/connections.json` e `data/desafios.json` são híbridos. O primeiro aceita
curadoria manual, mas o gerador administra desafios/mnemônicos automáticos. No
segundo, o editor mantém entradas manuais e campos editoriais; título/conteúdo
de item com `source` continuam pertencendo ao Markdown.

## 🔄 Regeneração por cenário

### Atualização completa

Este é um comando mutante e amplo: use somente em branch limpa. Ele reindexa
todos os módulos e pode corrigir paths. Para uma entrega pequena, prefira o
gerador específico.

```bash
bash scripts_admin/atualizar_tudo.sh
```

### Conferência básica sem gravar

```bash
bash scripts_admin/atualizar_tudo.sh --check
```

Essa conferência cobre baseline, previews, manifests e paths; não substitui a
validação completa abaixo.

### Biblioteca

```bash
python3 02_Biblioteca_IA_Engine/scan_biblioteca.py
python3 scripts_admin/build_library_previews.py
python3 scripts_admin/build_library_connections.py
```

### Card Feed

```bash
python3 scripts_admin/scan_card_feed.py
```

### Hub editorial

```bash
python3 scripts_admin/scan_content_module.py <HUB>
```

### Desafios, mnemônicos e conexões

```bash
python3 scripts_admin/build_desafios.py
python3 scripts_admin/build_mnemonicos.py
python3 scripts_admin/build_connections.py
```

Revise e versione JSONs gerados rastreados. Não versione previews/cache
temporário nem `site/`.

## ✅ Validação completa

Execute na raiz:

```bash
git status --short
git diff --check
python3 -m unittest discover -s tests -p 'test_*.py' -v
node tests/validate_clinical_catalogs.js
python3 scripts_admin/check_static_manifests.py
python3 scripts_admin/update_library_publication_baseline.py --check
python3 scripts_admin/build_library_previews.py --check
python3 scripts_admin/validar_paths.py --check
python3 scripts/validate_routes.py
python3 scripts_admin/validate_mapa_vivo.py
python3 scripts_admin/publication_guard.py check-repository .
```

Depois de adicionar somente os arquivos da entrega, execute também
`git diff --cached --check` e confira novamente `git status --short`.

Para o componente alterado:

```bash
python3 02_Biblioteca_IA_Engine/scan_biblioteca.py --check
python3 scripts_admin/scan_card_feed.py --check
python3 scripts_admin/scan_content_module.py <HUB> --check
```

Se um teste falhar, corrija a fonte. Não contorne o gate.

## 📦 Build público por allowlist

```bash
python3 scripts_admin/build_public_site.py . site
python3 scripts_admin/publication_guard.py sanitize-site site
python3 scripts_admin/publication_guard.py check-site site
```

Se `sanitize-site` remover algo inesperado, pare e corrija a fonte. Não use a
sanitização como solução silenciosa.

Nunca execute `scripts_admin/sync_public_site.py` ou
`atualizar_e_sincronizar.command` para publicar. Eles pertencem ao fluxo legado
de `public_site/`.

## 🖥️ Homologação local

Sirva somente o artefato:

```bash
python3 -m http.server 8000 --directory site
```

Abra:

```text
http://localhost:8000/
```

Confira:

- Home;
- rota nova;
- rota antiga relacionada;
- Visualização clara;
- modo espacial;
- alto contraste;
- busca e filtros;
- teclado;
- tela estreita;
- impressão/PDF;
- offline/PWA;
- mídia com avanço temporal;
- console sem erro;
- zero dados privados.

## 🚀 Publicação definitiva

1. confirme branch e escopo;
2. adicione somente arquivos da entrega;
3. crie commit rastreável;
4. faça push;
5. abra Pull Request como rascunho;
6. documente testes executados;
7. aguarde CI verde;
8. realize revisão clínica, técnica e de privacidade;
9. faça homologação visual;
10. marque o PR pronto;
11. faça merge em `main`;
12. aguarde build, launcher Windows e deploy;
13. confirme que o deployment usa o SHA esperado;
14. abra o GitHub Pages;
15. teste a rota nova e uma antiga.

O PR valida e monta o pacote, mas o deploy ocorre somente após merge/push em
`main`.

Site público:

```text
https://aldenirfilho.github.io/antigravity-consultas/
```

## ↩️ Reversão segura

1. crie uma branch a partir de `main`;
2. reverta o commit problemático;
3. execute novamente os gates;
4. abra outro PR;
5. aguarde deploy;
6. confirme a remoção no site.

Não use `reset --hard`, force-push ou reescrita de histórico compartilhado.

Um revert retira conteúdo da versão atual, mas não apaga dado sensível do
histórico Git. Se houver exposição de paciente, senha ou token, trate como
incidente de privacidade e providencie remoção especializada/rotação.

## 🧯 Diagnóstico rápido

| Sintoma | Verificação inicial |
|---|---|
| Card não aparece | Pasta temática, `cards.json` e `scan_card_feed.py` |
| Documento bloqueado | Baseline e três atestações da Biblioteca |
| Hub vazio | Arquivo está em `public/` e catálogo foi regenerado? |
| Questão TEMI não mudou | JS público e JSON de referência estão sincronizados? |
| 404 | Path, caixa, Unicode NFC, manifest e allowlist |
| Mapa não abre rota | Nó/aresta e `validate_mapa_vivo.py` |
| Site antigo | Actions, deploy e service worker/cache |
| Build bloqueado | Leia `publication_guard`; não contorne |
| Diff estranho | Pare e separe o escopo |
| Conteúdo clínico incerto | Volte para revisão humana |

## 🧠 Rotina TDAH-friendly

### Bloco de 3 minutos

- capture a ideia;
- escolha o inbox;
- não tente publicar.

### Sprint de 12 minutos

- classifique destino;
- registre fonte/licença;
- identifique o gate pendente.

### Sessão de foco

- revise um item;
- promova uma versão;
- execute um gerador;
- encerre com diff limpo e próximo passo escrito.

### Ritmo sugerido

- semanal: um lote pequeno revisado;
- mensal: links, referências, 404 e atualidade;
- trimestral: doses, scores, privacidade, acessibilidade e offline.

## ☑️ Definição de pronto

- [ ] destino correto;
- [ ] conteúdo autoral ou licenciado;
- [ ] zero dados identificáveis;
- [ ] revisão clínica registrada;
- [ ] fonte canônica atualizada;
- [ ] arquivo gerado revisado;
- [ ] testes automáticos aprovados;
- [ ] build por allowlist aprovado;
- [ ] homologação manual documentada;
- [ ] diff sem alterações acidentais;
- [ ] PR revisado;
- [ ] deploy verde;
- [ ] rota pública conferida.

## 🛡️ Alimentar os dois canais finais

### Integridade Jurídica e Responsabilidade Editorial

Atualizações públicas aprovadas entram em:

```text
19_Integridade_Editorial/data/revision-log.json
```

Antes de adicionar uma entrada:

- confira a fonte oficial e a data;
- diferencie texto normativo de interpretação;
- registre versão, resumo e referências;
- mantenha `status: public-approved` somente após revisão humana;
- nunca copie alerta automático diretamente para o público;
- atualize, quando necessário, o dossiê, o checklist e o protocolo de
  incidentes da estação.

### Conheça Aldenir

Rascunhos ficam no Caderno do Idealizador autenticado. Apenas uma versão
conscientemente aprovada entra em:

```text
20_Conheca_Aldenir/data/content/public-feed.json
```

Conteúdo factual precisa de referência HTTPS. Credenciais, títulos, história
pessoal sensível e dados de terceiros aguardam comprovação, consentimento e
revisão. O filtro do navegador é defesa adicional; ele não substitui o gate do
repositório.
