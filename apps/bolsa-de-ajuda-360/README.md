# Bolsa de Ajuda 360° — código para auditoria

**Status em 16/11/2026: código disponível nesta branch; site novo NÃO publicado.**

A tentativa de deploy 43980292430 falhou no controle editorial. O envio ao GitHub não deve ser confundido com publicação no GitHub Pages.

## Acesso para o Claude

- Código: https://github.com/aldenirfilho/aldenirmed89/tree/audit/bolsa-de-ajuda-360-2026-11-16/apps/bolsa-de-ajuda-360
- Roteiro: [AUDITORIA-CLAUDE.md](AUDITORIA-CLAUDE.md)
- Falha de publicação: https://github.com/aldenirfilho/aldenirmed89/actions/runs/43980292430
- Código de execução original preservado: commit 8341ac2fae54a78f4bad44f2da9fad4355ebdfba.

## Motivo do bloqueio

O gate informou `UNREGISTERED_PUBLIC_CONTENT` para os sete arquivos novos e `SENSITIVE_EMAIL` no catálogo, referente à chave Pix institucional em formato de e-mail. A política exige registro editorial, revisão e autorização documentados; classifica conteúdo beta como não público. Não foi inventada uma aprovação humana para contornar o gate.

A tentativa foi retirada da branch principal por commit de reversão 79c4c7a0bf0b5523a50d206963dcf59cfa73c970. A árvore de arquivos de main foi restaurada exatamente ao estado anterior. Não foram alterados policy.json, registry.json, testes de publicação ou workflows.

## Próxima revisão necessária

Auditar o código; decidir o enquadramento editorial correto e documentar a revisão efetivamente realizada; resolver o dado de Pix sinalizado por meio do procedimento existente, sem desativar o scanner; validar a carteira no navegador real. Só então preparar nova tentativa de deploy com os controles preservados.

A URL planejada é https://aldenirfilho.github.io/aldenirmed89/apps/bolsa-de-ajuda-360/ — **não a apresente como site disponível enquanto não houver deploy bem-sucedido e verificação do endereço**.

## Segurança do teste

Use apenas dados fictícios. Não faça pagamentos, não anexe documentos pessoais, não compartilhe senhas bancárias. A carteira é local, sem confirmação bancária e sem saldo financeiro. O código não atesta autenticidade de comprovantes nem recebimento de doações.
