# Códice dos Projetos 360X

Painel global dos projetos de Aldenir Rocha de Oliveira Filho: sites, apps, artefatos, documentos e projetos criados com o Claude, com radar de projetos parados.

[Abrir a página pública](https://aldenirfilho.github.io/aldenirmed89/ecossistema/codice-projetos/) · [Catálogo](../index.html) · [Painel integrado](../painel.html) · [Portfólio](../../docs_usuario/PORTFOLIO_GITHUB/README.md)

## Conteúdo

- 94 projetos em 9 áreas, com tipo, última atividade, situação, próximo passo e links.
- Situação calculada pela última atividade: ativo (até 14 dias), morno (15 a 45) ou esquecido (mais de 45), além de aguarda ação, pausado, ideia e concluído.
- Oráculo do Resgate (sorteia um projeto parado), Radar de abandonados, fila curta de pendências e linha do tempo por mês.
- Busca, filtros por área, situação e tipo, favoritos e "revisitei hoje" salvos só no navegador do visitante.
- Lista dos projetos Claude (workspaces) e portais mestres.

## Versão pública

Assuntos pessoais, jurídicos e políticos ficam fora desta página. Links de artefatos, chats e projetos do Claude e de repositórios privados abrem só na conta do autor. A versão completa fica no repositório privado de catalogação.

## Estrutura e execução

- index.html: HTML, CSS e JavaScript em um arquivo; usa apenas fontes do Google Fonts.
- Os dados estão no próprio HTML (constantes `I`, `WS` e `MASTER`).

Sirva esta pasta com `python3 -m http.server 8000` e abra http://localhost:8000/.

Base: varredura de 2 de novembro de 2026 (artefatos do Claude, repositórios GitHub de aldenirfilho com sites testados ao vivo, projetos Claude e chats recentes).
