# Bolsa de Ajuda 360° — roteiro de auditoria independente

Data de preparação: 16/11/2026. Status: versão de auditoria, não homologada para uso com dados sensíveis. A disponibilidade HTTP e o resultado do deploy devem ser conferidos separadamente; a existência deste arquivo no repositório não prova publicação.

## Endereços

- Aplicação destinada à auditoria: https://aldenirfilho.github.io/aldenirmed89/apps/bolsa-de-ajuda-360/
- Código: https://github.com/aldenirfilho/aldenirmed89/tree/main/apps/bolsa-de-ajuda-360
- Este roteiro: https://github.com/aldenirfilho/aldenirmed89/blob/main/apps/bolsa-de-ajuda-360/AUDITORIA-CLAUDE.md

## Escopo e limites

Aplicação estática em HTML, CSS e JavaScript. O catálogo inclui oito instituições e permite busca, filtros, favoritos de sessão e cesta de planejamento. A carteira é local ao navegador, com IndexedDB e Web Crypto; não é uma conta online, banco, custodiante nem carteira com saldo financeiro. Não há servidor de autenticação, confirmação bancária, webhook, rateio, saque ou sincronização automática.

Não execute pagamentos reais, não acesse contas bancárias e não use dados ou comprovantes pessoais. Para testes, use perfil de navegador descartável, senha exclusiva de teste, registros explicitamente fictícios e arquivos sintéticos. Não altere o repositório, publique correções ou envie formulários externos: esta solicitação é de auditoria e propostas de correção.

Os registros emitidos são autodeclarados e devem permanecer claramente identificados como NÃO BANCÁRIOS e NÃO FISCAIS. Não há prova de recebimento ou impacto. O catálogo não representa parceria ou auditoria de instituições.

## Evidências já disponíveis e o que elas não provam

Antes da publicação desta revisão, foram executados no pacote local:

- 11 grupos de testes Node: aprovação. Os testes criptográficos usam Web Crypto; o armazenamento IndexedDB é substituído por um adaptador em memória. Não comprovam persistência real entre sessões do navegador.
- 12 comparações de matrizes QR com implementação independente Python qrcode: idênticas para versão 8, correção L e máscara 0. Isso não valida titularidade, chave ativa, leitura por todos os bancos ou liquidação.
- 19 verificações de interface no Chromium: aprovação. Executadas com documento em memória e relógio fixado em 19/09/2026 para testar o caminho de geração de Pix. Não equivalem a testes em aparelhos físicos nem a auditoria completa de segurança ou acessibilidade.
- A revisão de publicação acrescenta aviso de auditoria, noindex/nofollow e canonical, preservando os cinco arquivos de lógica, catálogo e estilo do pacote original.

O auditor deve reproduzir os resultados independentemente e informar qualquer limitação de acesso ou de execução. Não transforme a mera leitura do código em teste executado.

## Atenção ao Pix e às datas

O catálogo original declara consulta das fontes em 19/09/2026. Em 16/11/2026 essa consulta tem mais de 30 dias. A interface deve bloquear a geração de Pix dessas fichas e encaminhar ao canal oficial. A data do catálogo NÃO foi artificialmente atualizada nesta publicação.

Audite a regra `fresh()` e sua dependência do relógio do aparelho. Um bloqueio no cliente não é controle bancário nem impede alguém de alterar o próprio código. Nenhuma chave deve ser tratada como atualmente validada apenas por existir no código. A reativação exige nova conferência documental, revisão e testes, não somente trocar uma data. Não execute transferências para testar.

## Roteiro de testes solicitado

1. Publicação: HTTP, HTTPS, arquivos CSS/JS, erros de console, CSP, caminhos relativos, navegação direta por hash e interferência de caches ou service workers do site principal.
2. Interface: busca com acentos, combinações de filtros, resultados vazios, favoritos, cesta, valor inválido, abertura dos canais oficiais e comportamento após recarregar a página. Favoritos e cesta são temporários por projeto, não falha de sincronização.
3. Acessibilidade: teclado, foco dos modais, fechamento por Escape, leitura por tecnologia assistiva, contraste, alvos de toque, zoom 200%, movimento reduzido e larguras de 375, 768 e 1440 pixels. Diferencie emulação de teste em iPhone/Android real.
4. Carteira: criar, salvar, bloquear, senha incorreta, reabrir após reload e nova sessão, backup, restauração em perfil limpo, backup adulterado, senha perdida, falha de armazenamento, limite de espaço, concorrência entre abas e bloqueio automático. Use somente dados fictícios.
5. Criptografia: reveja PBKDF2, salt, IV, AES-GCM, AAD, armazenamento do envelope, exposição de dados com o cofre aberto e limites do modelo de ameaça. Não declare inviolabilidade.
6. Anexos: tipos aceitos, limite de tamanho, arquivo falso, duplicação, cálculo de hash, importação de backup e download original. Checagem de assinatura de arquivo NÃO é antivírus, sanitização de PDF ou autenticação de comprovante.
7. Segurança de saída: escape de conteúdo, XSS, sugestões de URLs, CSV e fórmulas, impressão e HTML de registro. Não execute testes destrutivos ou contra serviços de terceiros.
8. Regras financeiras: somas em centavos, separação entre dinheiro e materiais/tempo, datas, duplicações, totais autodeclarados e ausência de confirmação de pagamento. O recibo local não pode parecer emitido pelo banco ou instituição.
9. Pix: formato BR Code, CRC, valores e QR, fonte e beneficiário, dados desatualizados, reuso de código estático e avisos ao doador. Testes de matriz não demonstram titularidade bancária.
10. Privacidade e implantação: identifique dados enviados a terceiros, inclusive fontes e hospedagem. O caminho da aplicação NÃO é uma fronteira de isolamento: outros projetos no mesmo host aldenirfilho.github.io compartilham a origem do navegador. Recomende domínio/origem exclusiva e revisão independente antes do uso com comprovantes reais.

## Arquivos para revisão

- `index.html`: estrutura, CSP, avisos e views.
- `assets/style.css`: layout responsivo, modais e impressão.
- `assets/catalog.js`: instituições, fontes, datas e dados públicos de Pix.
- `assets/core.js`: valores em centavos, escape, CRC16, BR Code e QR.
- `assets/vault.js`: criptografia, validação e armazenamento local.
- `assets/app.js`: interface, eventos, registros, anexos, backup e exportações.

## Formato de entrega solicitado ao Claude

Apresente primeiro os bloqueadores para uso real. Para cada achado: severidade (crítica/alta/média/baixa), evidência, arquivo e linha quando disponíveis, passos de reprodução, resultado esperado, resultado observado, impacto e correção sugerida.

Separe TESTADO E CONFIRMADO, INFERIDO DO CÓDIGO, HIPÓTESE, NÃO TESTADO e LIMITAÇÃO DE ACESSO. Informe navegador, data, viewport, versão/commit analisado e quais recursos você efetivamente conseguiu executar. Termine com decisão fundamentada: apto apenas para demonstração, apto para piloto restrito ou não apto, e uma lista objetiva de critérios ainda necessários. Não conceda aprovação bancária, fiscal ou jurídica.
