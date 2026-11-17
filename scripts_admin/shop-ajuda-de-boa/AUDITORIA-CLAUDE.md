# Auditoria independente · Shop Ajuda de Boa

Edição 2.0 · 16/11/2026 (sobre a edição recuperada 1.2). Auditoria solicitada pelo proprietário; auditoria externa ainda não realizada.

## Edição 2.0 — o que mudou e como foi testado

- Testado: `npm test` (22 testes, incluindo os 3 exemplos da planilha Placar XP), `npm run check:static`, `build_app.py --check`; navegador Chromium headless com dados sintéticos: Pix rápido, conferência anti-golpe, QR, criação do cofre, registro com XP, Placar CSV, backup; app em `file://` com IndexedDB real e em modo sessão; importação do backup do site no app.
- Não testado: Safari/iOS, Android, leitores de tela, impressão; auditoria de segurança externa.
- Pendência: revalidar nas páginas oficiais as chaves Pix de Aquasis, Lar Amigos de Jesus e SOS Mata Atlântica (consulta de 19/09/2026) e então atualizar `checked`.

## Abrir primeiro

- Site principal: https://shop-ajuda-de-boa.aldenirmed.chatgpt.site/
- Página de auditoria: https://shop-ajuda-de-boa.aldenirmed.chatgpt.site/auditoria.html
- Código: https://github.com/aldenirfilho/aldenirmed89/tree/main/scripts_admin/shop-ajuda-de-boa
- Seção AldenirMed89: https://aldenirfilho.github.io/aldenirmed89/#shop-ajuda-de-boa
- Códice de projetos: https://aldenirfilho.github.io/aldenirmed89/ecossistema/codice-projetos/

O código é espelhado em uma pasta do repositório existente. Não foi criado um repositório separado, pois a conexão não oferece essa operação e o login solicitado no navegador foi cancelado. A hospedagem principal usa origem própria; o código desta pasta não é servido como uma carteira no domínio compartilhado do AldenirMed89.

## Pedido ao Claude

Faça uma auditoria independente desta edição. Identifique o commit efetivamente consultado, data, navegador e ambiente. Leia README, este roteiro e os testes. Diferencie revisão de código, teste realmente executado, hipótese e limitação de acesso. Não assuma aprovação por outra IA.

Priorize catálogo, pesquisa com acentos, categorias, regiões, ordenação de Pix recente, favoritos vazios e filtrados, cesta, concorrência entre duas abas, armazenamento negado, armazenamento corrompido, links oficiais, fluxo móvel e navegação por teclado.

Revise a carteira: IndexedDB real, criação, bloqueio, senha incorreta, backup/restauração em outro navegador, perda de senha, arquivos adulterados, anexos, duplicatas, inatividade, conflito entre abas e exportação CSV. Os testes Node do cofre usam armazenamento simulado; não demonstram persistência real do navegador.

Use somente dados de teste sem pagamento. Gerar um QR ou registrar uma ajuda não confirma pagamento. Não faça doações, nem anexe comprovantes reais ou documentos pessoais. Não altere chaves Pix ou datas de fonte sem nova consulta ao documento oficial.

## Correções desta edição

- Cesta e favoritos: detecção de concorrência entre abas, revisão antes de salvar e sincronização entre abas; proteção com Web Locks quando disponível.
- Ordenação prioriza Pix com fonte recente; favoritos filtrados exibem mensagem adequada.
- Testes antigos ajustados ao diretório dist e ao catálogo atual. A checagem estática não se apresenta como teste de navegador.
- Fonte da Associação Caatinga relida em 16/11/2026; outras datas históricas preservadas. Fontes com mais de 30 dias seguem bloqueadas para geração Pix.

Confira estas afirmações no commit e nos resultados; não aceite documentação como prova de execução.

## Comandos reproduzíveis

```sh
npm test
npm run check:static
npm run check:qr
```

O teste QR independente pode exigir a dependência opcional Python qrcode, conforme a mensagem do script. Não relate comandos não executados como aprovados.

## Entrega pedida

Para cada achado: severidade, arquivo/linha, evidência, reprodução, impacto e correção sugerida. Separe:

1. TESTADO E CONFIRMADO;
2. INFERIDO DO CÓDIGO;
3. HIPÓTESE A TESTAR;
4. NÃO TESTADO / LIMITAÇÃO.

Execute correções apenas em branch própria se o ambiente e a autorização permitirem. Proponha patches pequenos; preserve dados locais e proteções. Não publique, faça merge, envie mensagens ou altere contas sem autorização específica. Reexecute os testes pertinentes e apresente diff e riscos restantes. Nunca desative scanners ou invente revisão humana para fazer um deploy passar.
