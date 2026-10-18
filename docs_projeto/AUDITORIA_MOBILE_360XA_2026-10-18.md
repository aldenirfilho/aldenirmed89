# Auditoria móvel do Ecossistema 360xA — 18/10/2026

Base: `a97cc9d24da179afa396789f481f340454e189c6` (PR #28).

## Resultado e escopo

Correção de 12 linhas no `sw.js`: mantém o shell existente, instala somente os quatro arquivos do catálogo e sua URL de diretório, e deixa os demais recursos para o cache sob demanda já implementado. Cache incrementado de v42 para v43. Sem alteração de conteúdo, UI, dados clínicos ou privados. Os testes que fixavam a versão do cache foram atualizados.

A lista WARM_ASSETS permanece como inventário para evitar uma refatoração ampla; somente seus caminhos `./ecossistema/` entram na instalação. Não há download automático das demais entradas dessa lista.

## Verificação em produção

O workflow [39144734957](https://github.com/aldenirfilho/aldenirmed89/actions/runs/39144734957) terminou com sucesso em 18/10/2026 às 16:27:30 UTC (13:27:30 de Fortaleza), no commit da PR #28. A URL pública respondeu HTTP 200 e Last-Modified 16:27:24 UTC.

GETs públicos com Accept-Encoding: identity retornaram:

| Recurso | HTTP | Bytes de corpo recebidos |
|---|---:|---:|
| ecossistema/ | 200 | 25.165 |
| ecossistema/assets/styles.css | 200 | 23.007 |
| ecossistema/assets/app.js | 200 | 11.296 |
| ecossistema/data/catalog.json | 200 | 87.192 |
| favicon.ico | 200 | 74.459 |
| sw.js | 200 | 20.030 |

Esses são corpos HTTP efetivamente consultados neste ambiente, sem compressão solicitada. Não incluem cabeçalhos, TLS, retransmissões, cache HTTP do celular ou a política de compressão que o navegador negociaria.

SHA-256 do worker público: `ae6027716cf4be8e5552c7d75cd45c8ceac21e9547e68f871b95644bf5dd9c9b`, igual ao worker anterior usado na comparação.

## Primeiro acesso necessário

A interface do catálogo depende apenas de HTML, CSS, JS e catalog.json: **146.660 bytes (143,22 KiB)**. Não usa imagens médicas, fontes externas ou módulos clínicos para renderizar os 54 projetos e dez raízes. Favicon é apresentação auxiliar; o service worker implementa o offline. O registro ocorre no evento load e baixa o conjunto de instalação adicionalmente. Por isso o peso da interface isolada não representa o consumo total do primeiro acesso.

A navegação interna, pesquisa e filtros atuam sobre o JSON já carregado; não justificam pré-carregar cursos. No código há rótulos de formulário, link para pular conteúdo, status aria-live, foco visível, controles de pelo menos 44 px e regra para movimento reduzido. Há versões responsivas e conteúdo de fallback. A página tem várias seções antes da busca: isso aumenta a rolagem até o catálogo no celular, mas alterar a organização editorial ultrapassa esta correção.

## Comparação controlada da instalação

O teste executa o código real do worker em Node VM com fetch e Cache Storage controlados. Resolve `./` e diretórios para seu index.html, preserva a chave de cada URL, conta as operações de download e soma o tamanho local do corpo. Não é benchmark de navegador nem medição em 4G.

| Medida na simulação | Antes | Proposto |
|---|---:|---:|
| Operações de pré-cache | 274 | 31 |
| Bytes sem compressão | 12.729.736 | 3.273.298 |
| MiB sem compressão | 12,14 | 3,12 |

Diferença: **243 solicitações** e **9.456.438 bytes (9,02 MiB; 74,29%)** evitados nessa simulação. São estimativas do potencial de transferência, a partir de operações reais do worker simulado e tamanhos locais. A navegação inicial, requisições do navegador, reutilização de cache HTTP e atualização de worker não foram somadas.

O artefato publicado de aproximadamente 625,9 MiB informado na PR não equivale ao primeiro acesso. Nesta rodada, o artefato completo não foi regenerado nem baixado.

Arquivos grandes dentro do conjunto que era instalado: mapa POCUS (317.338 bytes), aprofundamento neurológico HTML (205.222), bundle ACRA de sepse (198.537), HTML AVC (196.271). A lista inclui ainda as 60 imagens do almanaque ECG. Nada disso é necessário à interface do catálogo.

O shell mantido ainda inclui imagens de marca de 633.228 e 407.768 bytes, um ícone 1024 de 633.228 bytes e o index da home de 305.058 bytes. Essa é uma oportunidade posterior: um shell mínimo por rota reduziria mais o consumo, mas exigiria rever a experiência offline da home. Não foi feito nesta alteração pequena.

## Offline e atualização

- Catálogo inteiro fica disponível após instalação concluída, inclusive acesso direto a `ecossistema/` e `ecossistema/index.html`. Antes só o index explícito estava pré-cacheado.
- CSS, JS e JSON reabrem offline. O JSON continua network-first com fallback ao cache.
- Cursos e imagens deixam de ser baixados antes do uso. A navegação e os recursos elegíveis continuam usando os handlers existentes para cache sob demanda.
- Um curso nunca visitado não passa a estar integralmente disponível offline por abrir o catálogo. Nem o comportamento anterior garantia cursos completos, pois nem todas as dependências estavam na lista e allSettled tolerava falhas.
- Atualizar a versão remove o cache antigo, como já ocorria. Conteúdo educacional anteriormente guardado nesse cache precisará ser acessado online novamente. Cache do navegador pode ser removido por falta de espaço; não há garantia de armazenamento permanente.
- A instalação agora exige sucesso do conjunto essencial do catálogo; em caso de falha, o worker novo não assume o controle e o anterior permanece ativo.

## Validação e limites

Executados: `node --check sw.js`, `git diff --check` e regressão comportamental do worker. Passaram instalação sem cursos/imagens clínicas (exceto dois pequenos ícones do shell preservado), offline das duas URLs do catálogo, CSS/JS/JSON com 54 projetos e dez raízes, curso visitado online reaberto offline e fallback de navegação.

Suíte completa: **645 testes, 643 passaram, uma falha e um ignorado**. A falha é `test_publication_baseline_freezes_the_exact_physical_corpus`: 193 arquivos esperados contra 194 observados. Ela já apareceu na primeira execução e não envolve o worker. Há arquivos temporários não rastreados no checkout; não foram incluídos na alteração. A montagem pública também bloqueou por inventário e, após afastar temporários, por índice de previews ausente. Esses bloqueios não foram contornados nem tiveram seus dados alterados.

O navegador Playwright não estava instalado e a tentativa de download retornou arquivo ZIP inválido. Por isso não foram medidos LCP, tempo de instalação, volume real em rede móvel, layout renderizado ou interação em navegador. Há roteiro automatizado de navegador incluído, **ainda não executado**. As observações de acessibilidade são de inspeção de código e testes existentes, não certificação visual.

## Reprodução

```bash
# No checkout anterior, preservar o worker para comparação:
git show a97cc9d24da179afa396789f481f340454e189c6:sw.js > /tmp/sw-before.js
node --check sw.js
node tests/mobile_precache_regression.cjs /tmp/sw-before.js
python3 -m unittest discover -s tests -p 'test_*.py'
git diff --check
```

Teste opcional em navegador instalado (terminal separado para o servidor):

```bash
python3 -m http.server 8873 --bind 127.0.0.1
# Em outro terminal, com playwright disponível:
node tests/browser_mobile_catalogue.cjs
```

Para fechar a medição real: usar perfil limpo de navegador móvel, mesma rota e rede antes/depois; registrar HAR incluindo service worker, bytes transferidos, LCP e tempo até worker activated; repetir com cache aquecido; ativar modo avião, recarregar as duas URLs e testar pesquisa, filtro e módulo visitado. Comparar instalação completa, não só o evento load. O roteiro de navegador não substitui esse ensaio de rede.
