# 🔄 Operação contínua do Antigravity Consultas

Manual prático para alimentar, corrigir e expandir o site sem perder
privacidade, rastreabilidade ou segurança clínica.

## 🚦 Fluxo rápido em sete passos

1. **Entrada privada:** receba o material sem colocá-lo diretamente no site.
2. **Triagem:** confirme autoria/licença, privacidade, validade clínica e destino.
3. **Uma entrega por vez:** use uma branch `codex/...` de escopo curto.
4. **Promoção controlada:** copie apenas o item aprovado para a pasta pública.
5. **Regeneração:** rode somente o scanner do componente alterado.
6. **Validação:** execute os gates automáticos e a revisão humana.
7. **Publicação:** Pull Request, checks verdes, merge em `main` e conferência do
   GitHub Pages.

> **Regra anti-sobrecarga:** uma entrada → uma decisão → uma branch → uma Pull
> Request. Conteúdos diferentes podem formar lotes pequenos, mas não misture
> arquivos pessoais, finanças, documentos jurídicos ou dados de pacientes com
> uma atualização clínica.

## 💻📱 Manter os acessos de Mac, Windows e iPhone

Os pacotes em `downloads/` são apenas lançadores, atalhos e ícones. Eles não
devem conter conteúdo clínico duplicado, credenciais, telemetria nem dados de
pacientes. O conteúdo continua sendo atualizado no site publicado.

Ao alterar qualquer pacote:

1. mantenha a instalação sem privilégio administrativo;
2. documente claramente todos os arquivos e ações locais;
3. preserve desinstalação reversível e caminhos de destino restritos;
4. regenere a linha correspondente em `downloads/SHA256SUMS.txt`;
5. teste a estrutura do ZIP e valide dimensões/formato dos ícones;
6. atualize o teste automatizado e o gate do GitHub Actions;
7. faça homologação física no sistema operacional indicado antes de afirmar
   compatibilidade total.

No Windows, a instalação PWA pelo Microsoft Edge é a opção principal. O ZIP é
uma alternativa transparente para criar atalhos locais. No iPhone, a instalação
oficial é feita pelo Safari em **Compartilhar → Adicionar à Tela de Início**.

## 🛡️ Portão obrigatório antes de qualquer publicação

Pare e mantenha o arquivo privado se qualquer resposta abaixo for “não sei”:

- **Autoria/licença:** tenho direito de publicar ou apenas de referenciar?
- **Privacidade:** removi nomes, iniciais, datas, imagens, números de prontuário,
  instituições e combinações que possam reidentificar uma pessoa?
- **Revisão clínica:** um médico conferiu recomendações, unidades, doses,
  contraindicações, população, referências e data?
- **Atualidade:** a orientação ainda representa a evidência e o protocolo atual?
- **Escopo:** está explícito que o material é educacional e não substitui
  julgamento clínico?

Obra de terceiro não deve ser copiada integralmente. Prefira síntese autoral,
citação curta quando necessária, referência bibliográfica e link oficial.

## 🖼️ Adicionar uma imagem ao Card Feed

### 1. Preparar

1. Confirme autoria/licença da imagem.
2. Remova qualquer dado identificável de paciente.
3. Revise o texto clínico visível na arte.
4. Prefira `WEBP` ou `PNG`; use `JPG` somente quando adequado.
5. Dê um nome curto, descritivo, sem espaços nem acentos:
   `ptt-plasmic-alertas.webp`.
6. Otimize o peso sem tornar números e legendas ilegíveis.

### 2. Escolher o tema

Coloque o arquivo em:

```text
05_Midia_E_Feed/assets/cards/public/<tema>/<arquivo>.webp
```

Exemplo:

```text
05_Midia_E_Feed/assets/cards/public/reumato-imuno/caps-triplo-positivo.webp
```

Se o tema for novo:

1. crie a pasta com um slug estável;
2. adicione o tema em `05_Midia_E_Feed/data/themes.json`;
3. use como `folder` o caminho
   `assets/cards/public/<tema>/`;
4. revise cor, emoji, nome e acessibilidade visual.

As pastas antigas sob `recovered/` continuam compatíveis, mas conteúdos novos
devem usar diretamente a pasta temática.

### 3. Regenerar e conferir

Na raiz do repositório:

```bash
python3 scripts_admin/scan_card_feed.py
python3 scripts_admin/scan_card_feed.py --check
```

Não edite manualmente `05_Midia_E_Feed/data/public.json`: ele é um índice
gerado. Abra o Card Feed, filtre o tema e confira imagem, legenda, contraste,
ordem e comportamento em tela estreita.

SVG exige cuidado adicional porque pode conter conteúdo ativo. O scanner
bloqueia SVG inseguro; prefira PNG/WEBP para cards clínicos.

## 📚 Adicionar conteúdo à Biblioteca IA

### 1. Manter a entrada privada

Coloque primeiro o original em:

```text
02_Biblioteca_IA_Engine/inbox/
```

Essa pasta é privada e ignorada pelo Git. Nunca use `site/` ou `public_site/`
como fonte.

Gere um inventário privado:

```bash
python3 scripts_admin/inventory_library_candidates.py \
  --source-root 02_Biblioteca_IA_Engine/inbox \
  --output 02_Biblioteca_IA_Engine/_private/library-candidates.json
```

### 2. Revisar e promover

1. confira autoria e licença com evidência;
2. inspecione o arquivo original e seus metadados, não apenas a prévia;
3. faça revisão de privacidade/LGPD;
4. faça revisão clínica e registre a data;
5. copie somente a versão aprovada para:

```text
02_Biblioteca_IA_Engine/acervo/<tema>/NOME_DO_DOCUMENTO.ext
```

Se não puder atestar os três gates, pare aqui e mantenha o item no inbox.

### 3. Aprovar o novo baseline

Depois de promover o arquivo e **antes de regenerar o manifesto**, execute:

```bash
python3 scripts_admin/update_library_publication_baseline.py --approve \
  --reviewer "Dr. Aldenir Rocha" \
  --change-note "Adicionar <tema/arquivo> após revisão clínica e de privacidade" \
  --attest-authorship-license \
  --attest-privacy \
  --attest-clinical-review
```

As flags são atestações reais, não simples formalidade. O baseline registra a
revisão declarada, mas não substitui prova de licença ou auditoria clínica.

### 4. Regenerar catálogo e previews

```bash
python3 02_Biblioteca_IA_Engine/scan_biblioteca.py
python3 scripts_admin/build_library_previews.py
python3 scripts_admin/build_library_connections.py
```

Revise no diff os caminhos, SHA-256, título, resumo e metadados editoriais.
Não altere manualmente IDs, hashes, extensão, tamanho ou paths estruturais.

### 5. Homologar no navegador

Confira pelo menos:

- um PDF e sua prévia;
- um DOCX e sua prévia textual;
- um Markdown;
- busca dentro do documento;
- Leitura Focada e saída com `Esc`;
- destaques, nota local e exportação;
- um formato apenas para download;
- navegação por teclado e tela estreita.

Prévia e OCR podem omitir ou interpretar incorretamente conteúdo. A inspeção
humana do original continua obrigatória.

## ✍️ Adicionar um estudo canônico ao UpDown Hub

Crie o Markdown na seção apropriada de `01_UpDown_Hub/content/`. Use
frontmatter explícito:

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

Estrutura TDAH-friendly recomendada:

1. decisão ou pergunta clínica;
2. alerta tempo-dependente;
3. algoritmo em poucos passos;
4. diagnóstico diferencial;
5. score com finalidade **e limitações**;
6. armadilhas cognitivas;
7. mnemônico;
8. cinco flashcards;
9. três questões comentadas;
10. referências e data de revisão.

Registre o item em `01_UpDown_Hub/registry.json`. Mantenha `status:
em_revisao` até a homologação médica e troque para `ativo` somente depois da
aprovação.

## 🧩 Criar um novo módulo clínico plugável

Use `01_Modulos_Clinicos/Hematologia_Critica/` como referência estrutural:

```text
01_Modulos_Clinicos/Novo_Modulo/
├── index.html
├── module.manifest.json
├── README.md
├── assets/
│   ├── app.js
│   └── styles.css
└── data/
    └── catalog.js
```

### Contrato mínimo

- O catálogo clínico deve ser dirigido por dados e separado da interface.
- O manifesto precisa declarar ID, versão, status, data, entrada, recursos,
  privacidade e gate de revisão.
- O módulo deve funcionar sem backend, telemetria ou API externa.
- Progresso local deve evitar dados clínicos e ser fácil de limpar.
- Todo score deve informar objetivo, população validada e limites.
- Toda dose/unidade exige dupla checagem e referência revisada.
- Casos devem ser fictícios e sem combinações reidentificáveis.
- Teclado, foco visível, contraste, tema claro/escuro e redução de movimento
  fazem parte da definição de pronto.

### Produtos didáticos recomendados

- modo **Plantão 60 s**;
- trilha **Diagnóstico Difícil**;
- modo **Turbo TEMI**;
- checklists marcáveis;
- comparador de síndromes;
- calculadoras/scores com interpretação limitada;
- mnemônicos;
- questões comentadas;
- flashcards de recordação ativa;
- casos progressivos;
- sprint de foco de 12 minutos;
- impressão limpa para round ou estudo.

### Integrar ao ecossistema

Revise e atualize, quando aplicável:

```text
01_UpDown_Hub/registry.json
data/topics.json
data/connections.json
data/site_manifest.json
06_Infra_Site_E_Assets/data/home-manifest.json
index.html
```

Depois, confirme que todos os caminhos partem da raiz pública e que não há
cópia divergente em `public_site/`.

## 🧮 Criar ou adaptar um app clínico

Antes de programar, escreva uma ficha curta:

- problema clínico e usuário;
- entrada, unidade e intervalo plausível de cada campo;
- fórmula ou regra com referência;
- população em que foi validada;
- situações em que não deve ser usada;
- resultado exibido e próxima ação segura;
- data e responsável pela revisão.

Checklist de implementação:

- [ ] valida campos vazios, negativos, extremos e separador decimal;
- [ ] não converte dose em prescrição universal;
- [ ] mostra unidades junto de entrada e resultado;
- [ ] não guarda dados de paciente;
- [ ] não transmite dados;
- [ ] oferece **Limpar/Reiniciar**;
- [ ] funciona por teclado e leitor de tela;
- [ ] possui testes de exemplos conhecidos e limites;
- [ ] mostra aviso educacional e referência;
- [ ] passou por revisão clínica humana.

Boas próximas expansões: HScore/HLH, CAPS, risco de lise tumoral, correção de
sódio, transfusão maciça, anticoagulação e reversão, eletrólitos críticos,
antimicrobianos na disfunção renal, ventilação e POCUS orientado por síndrome.
Cada produto deve nascer em uma Pull Request própria.

## ✅ Validação completa antes do push

Execute na raiz:

```bash
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts_admin/check_static_manifests.py
python3 scripts_admin/update_library_publication_baseline.py --check
python3 scripts_admin/build_library_previews.py --check
python3 scripts_admin/validar_paths.py --check
python3 scripts/validate_routes.py
python3 scripts_admin/publication_guard.py check-repository .
python3 scripts_admin/build_public_site.py . site
python3 scripts_admin/publication_guard.py sanitize-site site
python3 scripts_admin/publication_guard.py check-site site
```

Também faça:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/` e homologue home, busca, módulo alterado, navegação
por teclado, celular e rota offline. Interrompa o servidor com `Control + C`.

Não versione a pasta `site/`; ela é temporária e regenerada no deploy.

## 🚀 Publicação segura no GitHub Pages

### 1. Branch e revisão do escopo

```bash
git status --short --branch
git switch -c codex/nome-curto-da-entrega
git diff --check
```

Adicione somente os arquivos da entrega. Não use inclusão ampla se houver
alterações antigas ou pessoais na árvore de trabalho.

### 2. Commit rastreável

Formato:

```text
feat(escopo): descreva a entrega em português
```

Exemplo:

```text
feat(biblioteca): adicione guia revisado de hematologia
```

### 3. Push e Pull Request

```bash
git push -u origin codex/nome-curto-da-entrega
```

Abra uma Pull Request como rascunho, documente os testes realmente executados e
mantenha pendências de homologação claramente marcadas. Só tire do rascunho
quando o escopo estiver limpo e as revisões técnica, de privacidade e clínica
estiverem concluídas.

### 4. Merge e deploy

O workflow `.github/workflows/deploy-seguro.yml`:

1. recompila catálogos;
2. executa testes e portões de publicação;
3. monta `site/` por allowlist;
4. bloqueia conteúdo privado;
5. publica somente após merge/push em `main`.

Espere o GitHub Actions ficar verde. Em seguida, teste:

- `https://aldenirfilho.github.io/antigravity-consultas/`;
- as rotas novas;
- `manifest.webmanifest`;
- o Card Feed e a Biblioteca;
- download e checksum, quando alterados.

Se houver regressão, abra uma Pull Request de `revert` do commit problemático.
Não reescreva o histórico compartilhado e não use reset destrutivo.

## 🧯 Diagnóstico rápido

| Falha | Primeira verificação |
|---|---|
| Imagem não aparece | Pasta temática, extensão e `data/public.json` regenerado |
| Biblioteca bloqueou | Baseline, três atestações e manifesto físico |
| 404 em módulo | Path relativo, manifesto e allowlist do builder |
| Site antigo após deploy | Estado do Actions e cache/service worker |
| Deploy rejeitou conteúdo | Leia a mensagem do `publication_guard`; não contorne o gate |
| Conteúdo clínico incerto | Volte para `em_revisao` e solicite revisão humana |
| Mudanças estranhas no diff | Pare, preserve os arquivos e separe o escopo |

## 📅 Ritmo sustentável sugerido

- **Plantão/entrada:** capturar apenas a ideia e guardar no inbox.
- **Bloco de 12 minutos:** classificar tema, autoria e prioridade.
- **Uma sessão semanal:** revisar clinicamente um lote pequeno.
- **Uma Pull Request por produto:** publicar, observar e só então expandir.
- **Mensal:** revisar links, referências, datas, 404 e conteúdos de alto risco.
- **Trimestral:** auditar scores, doses, privacidade, acessibilidade e
  compatibilidade offline.

### Definição de pronto

- [ ] conteúdo autoral/licenciado;
- [ ] zero dados identificáveis;
- [ ] revisão clínica humana registrada;
- [ ] status e data atualizados;
- [ ] produtos didáticos conferidos;
- [ ] testes automáticos executados;
- [ ] homologação manual documentada;
- [ ] diff sem alterações acidentais;
- [ ] Pull Request revisada;
- [ ] deploy verde e rotas públicas conferidas.
