# Auditoria de descoberta — AldenirMed89

Data: 15/11/2026, America/Fortaleza. Base: `86ccdc5b9fe2197f79d8715e351d96d5dfb0c558`.
Estado: proposta para revisão; nenhuma publicação ou alteração de `main` autorizada nesta entrega.

## Conclusão

O site publicado já tem sitemap e canonical gerados durante o build. Os 404 na raiz do código-fonte não indicam ausência desses recursos em produção. Na conferência direta, a home, `/aldenirmed89/sitemap.xml` e `/aldenirmed89/robots.txt` responderam HTTP 200. O sitemap publicado contém **55 URLs**, não 54 como informado na atualização intermediária.

O sitemap é útil, mas incompleto. A proposta preserva o gerador e amplia sua seleção para **70 páginas existentes**. Todas as 70 URLs responderam 200 na consulta ao site público. Isso comprova disponibilidade HTTP nesta checagem, não indexação ou escolha de canonical pelo Google.

## Achados e correções

| Achado | Correção preparada | Justificativa |
|---|---|---|
| 15 páginas independentes fora do sitemap | Acrescentar rotas no manifesto existente | Doenças Genéticas, Pneumologia/protocolos-2026, quatro páginas de antimicrobianos, catálogo de agentes/habilidades, Auditoria UTI, Apps, Galeria, três páginas de questões, Desafios e Mnemônicos |
| Todas as entradas usam `updatedAt` do inventário como `lastmod` | Omitir `lastmod` | Alterar o inventário não comprova revisão de cada conteúdo; data por página exige fonte própria |
| Sitemap não verifica elegibilidade declarada no HTML | Filtrar redirects, `noindex`, `googlebot: none` e canonicals que apontam para outra página | Evitar sugerir URLs contraditórias; testes cobrem esses cenários |
| Parte da navegação depende de dados e JavaScript | Gerar `mapa-do-site.html` com os mesmos 70 destinos e link no rodapé da home | Links HTML acessíveis sem scripts; não depende de cliques para descobrir essas páginas |
| 11 páginas selecionadas sem descrição | Acrescentar descrições específicas | RespiraCrit, Ebooks, Questões Comentadas, Transcrições, POCUS, Atlas, Apps, Galeria e três páginas da Tripulação |

## Páginas e módulos internos

Uma URL HTML independente pode participar do sitemap. Exemplos: `/01_Modulos_Clinicos/Doencas_Geneticas/`, `/ecossistema/auditoria-uti/` e `/01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos/farmacologia.html`.

Já `#patogenos`, `#farmacos`, filtros de busca, cartões gerados por JavaScript, dados JSON e nós do Mapa Vivo são partes da página hospedeira. Não foram inventadas URLs para eles, nem criadas entradas XML com fragmentos. Visualizadores que dependem de parâmetros também exigem revisão própria antes de serem promovidos a documentos independentes.

Wrappers de rotas antigas, páginas offline, autenticação com `noindex`, componentes HTML, espelhos e prévias documentais isoladas não foram acrescentados indiscriminadamente. A seleção de 70 páginas não pretende representar cada arquivo HTML ou PDF do acervo. `inventario-html.csv` descreve os 247 HTMLs do artefato, inclusive prévias e componentes, para revisão posterior.

## robots.txt: necessário?

Não há bloqueio a corrigir. O arquivo efetivo seria `https://aldenirfilho.github.io/robots.txt`, que respondeu **404**. O arquivo existente em `/aldenirmed89/robots.txt` não controla o rastreamento do host, pois está em um subdiretório. Ele é mantido por compatibilidade, com comentário no gerador esclarecendo a limitação.

Não é necessário criar outro arquivo nesse projeto para permitir rastreamento. Para anunciar o sitemap, enviar sua URL diretamente à propriedade correspondente no Search Console. Uma futura mudança de `/robots.txt` exigiria atuar no site da raiz do host e considerar os demais projetos desse domínio; está fora desta proposta. `robots.txt` também não protege conteúdo privado.

## Validação realizada

- Suíte completa: **984 testes em 25,138 s; sem falhas; 1 ignorado**. Inclui três novos testes de descoberta, equivalência de canonical e integridade das rotas.
- Build completo: **1.869 arquivos, 791,3 MiB, sitemap de 70 URLs**.
- Sanitização e verificação do artefato: aprovadas.
- Gate editorial público: **898 arquivos textuais examinados, zero ocorrências**.
- Links: **247 HTMLs e 6.929 referências locais**, sem referências locais quebradas; 75 prévias verificadas por SHA-256, sem divergências.
- HTTP público: **70/70 destinos responderam 200**, sem `noindex` encontrado no cabeçalho HTML consultado.
- `git diff --check`: aprovado.
- Scripts inline dos **12 HTMLs alterados**: idênticos aos da base. Nenhum JS clínico, CSS de acessibilidade, fórmula ou fluxo médico foi alterado.

## Limitações e pendências

O auditor deixou **27 referências a fragmentos** para conferência em execução e seis apontamentos estruturais em componentes HTML (sem documento completo). A ausência estática de uma âncora não comprova falha: há destinos gerados por JavaScript. Esses casos estão registrados em `links-locais.json` e não foram tratados como links quebrados.

A checagem visual foi tentada com Playwright/Chromium e impedida pelo ambiente (`socket() failed: Operation not permitted`). Não foi concluído teste visual ou de navegação em navegador real. A suíte automatizada e a comparação dos scripts reduzem o risco, mas não substituem essa conferência.

Não foi acessada a conta do Search Console. Não foram confirmados cobertura de indexação, canonical selecionada pelo Google, cliques ou envio prévio do sitemap. Não foram rastreados os 992 links externos listados pelo auditor. O mapa HTML novo tem semântica, idioma, foco visível, link de salto e nenhuma dependência de JavaScript; a conferência visual segue pendente.

## Revisão e publicação posterior

1. Revisar o diff e o mapa HTML preparado, incluindo celular e navegação por teclado.
2. Após autorização do proprietário, integrar a branch e acompanhar o workflow de publicação; PRs não publicam no Pages conforme a condição atual do job `deploy`.
3. Conferir home, mapa e sitemap em produção, enviar `https://aldenirfilho.github.io/aldenirmed89/sitemap.xml` ao Search Console e inspecionar amostras de URLs.

Evitar: adicionar fragmentos ao sitemap; listar todo arquivo do repositório; confundir HTTP 200 com indexação; inventar `lastmod`; usar `Disallow` para proteger documentos; publicar antes da revisão.

## Referências oficiais

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/crawling/docs/robots-txt/create-robots-txt
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Código: https://github.com/aldenirfilho/aldenirmed89/blob/86ccdc5b9fe2197f79d8715e351d96d5dfb0c558/scripts_admin/build_public_site.py

Um sitemap ajuda a descoberta; sua presença não garante indexação ou posição nos resultados.
