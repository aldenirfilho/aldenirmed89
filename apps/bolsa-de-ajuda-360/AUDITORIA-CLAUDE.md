# Bolsa de Ajuda 360° — auditoria independente

**16/11/2026: código disponível para auditoria. Publicação no GitHub Pages bloqueada pelo controle editorial; não há novo site público confirmado.**

## Endereços e evidência do bloqueio

Código: https://github.com/aldenirfilho/aldenirmed89/tree/audit/bolsa-de-ajuda-360-2026-11-16/apps/bolsa-de-ajuda-360

Tentativa de deploy: https://github.com/aldenirfilho/aldenirmed89/actions/runs/43980292430

URL planejada, ainda não publicada: https://aldenirfilho.github.io/aldenirmed89/apps/bolsa-de-ajuda-360/

O gate retornou UNREGISTERED_PUBLIC_CONTENT para os sete arquivos novos e SENSITIVE_EMAIL para uma chave Pix institucional em formato de e-mail. A política existente exige revisão e autorização documentadas; conteúdo beta não é público. Não foram alterados os controles nem inventada aprovação humana. A tentativa foi revertida em main pelo commit 79c4c7a0bf0b5523a50d206963dcf59cfa73c970, restaurando a árvore anterior. O código de execução do commit 8341ac2fae54a78f4bad44f2da9fad4355ebdfba foi preservado nesta branch.

## Escopo e limites

Aplicação estática HTML/CSS/JavaScript com oito instituições, busca, filtros, favoritos de sessão e cesta de planejamento. Carteira local em IndexedDB com Web Crypto, não conta online, banco ou carteira com saldo. Não há servidor de autenticação, webhook bancário, rateio, saque ou sincronização automática.

Não faça pagamentos reais, não acesse contas bancárias e não utilize comprovantes pessoais. Use perfil de navegador descartável, senha exclusiva de teste, registros explicitamente fictícios e arquivos sintéticos. Não altere o repositório, publique correções nem envie formulários externos: esta solicitação é de auditoria e propostas de correção.

Os registros locais são autodeclarados, NÃO BANCÁRIOS e NÃO FISCAIS. Não provam recebimento ou impacto. O catálogo não representa parceria ou auditoria das instituições.

## Testes locais e limites da evidência

- 11 grupos de testes Node aprovados. Os testes criptográficos usam Web Crypto, mas IndexedDB é substituído por adaptador em memória. Não comprovam persistência real.
- 12 comparações de matrizes QR idênticas à implementação independente Python qrcode (versão 8, correção L, máscara 0). Não validam chave ativa, titularidade, leitura por todos os bancos ou liquidação.
- 19 verificações de interface Chromium aprovadas, com documento em memória e relógio em 19/09/2026 para testar geração de Pix. Não são testes em aparelhos físicos.
- 10 verificações adicionais em memória com data 16/11/2026 aprovadas: aviso de auditoria, noindex, oito fichas, bloqueio de fonte Pix antiga, canal oficial, larguras de 375/768/1440 pixels e ausência de exceções JavaScript no fluxo.
- Tentativa de navegação local para testar IndexedDB real bloqueada pelo ambiente com ERR_BLOCKED_BY_ADMINISTRATOR. Não foi contornada; persistência, reabertura e restauração no navegador real continuam pendentes.
- A consulta HTTPS pelo ambiente de execução teve falha de DNS. O deploy falhou independentemente disso, conforme GitHub Actions.

Reproduza os resultados independentemente. Leitura de código não equivale a teste executado. Não declare auditoria de segurança concluída com base nesses testes.

## Pix e datas

O catálogo original declara consulta das fontes em 19/09/2026. Em 16/11/2026, mais de 30 dias se passaram. A interface deve bloquear o Pix dessas fichas e encaminhar ao canal oficial. A data NÃO foi artificialmente atualizada.

Audite fresh() e sua dependência do relógio do aparelho. Bloqueio no cliente não é controle bancário nem impede alguém de alterar o próprio código. Uma chave presente no arquivo não está automaticamente validada. A reativação exige nova conferência das fontes, revisão e testes; não basta trocar a data.

## Roteiro de auditoria

1. Publicação e governança: analisar o gate e os registros editoriais exigidos; separar autorização para publicar de revisão técnica/humana efetivamente realizada. Não desativar scanners nem registrar aprovação fictícia. A URL planejada não deve ser apresentada como ativa.
2. Interface: busca com acentos, combinações de filtros, resultados vazios, favoritos, cesta, valores inválidos, links oficiais e recarga. Favoritos e cesta são temporários por projeto.
3. Acessibilidade: teclado, foco e Escape nos modais, tecnologia assistiva, contraste, alvos de toque, zoom 200%, movimento reduzido e telas de 375, 768 e 1440 pixels. Diferenciar emulação de aparelhos físicos.
4. Carteira: criar, salvar, bloquear, senha incorreta, reload, nova sessão, backup, importação em perfil limpo, backup adulterado, senha perdida, falha de armazenamento, quota, concorrência e bloqueio automático. Somente dados fictícios.
5. Criptografia: PBKDF2, salt, IV, AES-GCM, AAD, envelope, dados enquanto o cofre está aberto e modelo de ameaça. Não afirmar inviolabilidade.
6. Anexos: formatos, tamanho, arquivo falso, duplicação, hash, importação e download original. Assinatura de arquivo não é antivírus, sanitização de PDF ou autenticação bancária.
7. Saídas: escape, XSS, URLs sugeridas, CSV e fórmulas, impressão e registro HTML. Não fazer testes destrutivos ou contra terceiros.
8. Regras financeiras: centavos, separação de dinheiro e materiais/tempo, datas, duplicações e totais autodeclarados. Registro local não pode parecer emitido pelo banco ou instituição.
9. Pix: BR Code, CRC, valor, QR, fonte, beneficiário, desatualização, reuso e avisos. A comparação de matrizes não valida titularidade.
10. Privacidade e implantação: tráfego de fontes/hospedagem, CSP, caminhos relativos e interferência de service workers. Projetos no mesmo host aldenirfilho.github.io compartilham a origem; subpasta não isola IndexedDB. Domínio/origem exclusiva e revisão independente são necessários antes de uso habitual com comprovantes reais.

## Arquivos

index.html: estrutura e CSP. assets/style.css: responsividade e impressão. assets/catalog.js: fontes, datas e dados públicos de Pix. assets/core.js: centavos, escape, CRC, BR Code e QR. assets/vault.js: criptografia, validação e armazenamento. assets/app.js: interface, anexos, backup e exportações.

## Entrega do Claude

Priorize bloqueadores para uso real. Para cada achado: severidade, evidência, arquivo/linha, reprodução, esperado versus observado, impacto e correção sugerida.

Separe TESTADO E CONFIRMADO, INFERIDO DO CÓDIGO, HIPÓTESE, NÃO TESTADO e LIMITAÇÃO DE ACESSO. Informe ambiente, data e commit efetivamente analisado. Termine com critérios para demonstração/piloto e aprovação editorial necessária, sem declarar aprovação bancária, fiscal ou jurídica.
