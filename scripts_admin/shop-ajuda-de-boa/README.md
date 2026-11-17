# Shop Ajuda de Boa · 360X

Vitrine de causas sociais e ambientais, com busca, filtros, favoritos, cesta de planejamento e carteira local criptografada. Edição recuperada 1.2, autorizada para publicação em 16/11/2026.

**Site:** https://shop-ajuda-de-boa.aldenirmed.chatgpt.site/

**Nova auditoria:** [AUDITORIA-CLAUDE.md](AUDITORIA-CLAUDE.md)

## Origem e manutenção

Base relacionada Bolsa de Ajuda 360° de 19/09/2026, sob MIT, recuperada do arquivo preservado pelo proprietário. O dossiê da loja original Ajuda de Boa identifica a prévia privada https://claude.ai/artifact/XbXBnrmjDXzEYduyde8tZE . Essa prévia foi preservada; esta publicação não afirma editá-la nem copiar integralmente seu catálogo.

Código espelhado na pasta `scripts_admin/shop-ajuda-de-boa` do repositório público `aldenirfilho/aldenirmed89`. O repositório dedicado solicitado ainda depende de autenticação com capacidade de criação. Esta pasta é fonte para desenvolvimento e auditoria, fora do artefato público GitHub Pages; a aplicação principal fica na origem própria acima.

## Rodar e conferir

Node.js 20 ou posterior e Python 3 para a checagem estática. Sem dependências Node.

```sh
npm test
npm run check:static
python3 -m http.server 8000 --directory dist
```

Abra `http://localhost:8000`. Em servidor remoto, use encaminhamento suportado. Prefira HTTPS para testar a carteira e não abra o HTML como arquivo. Execute a comparação QR opcional conforme as instruções de `tests/qr_reference.py`.

## Limites

Cesta e favoritos guardam somente planejamento neste navegador. Quando Web Locks ou armazenamento local não estão disponíveis, as alterações permanecem apenas na sessão e a interface avisa; não há gravação concorrente insegura como alternativa. A carteira cifra os registros e anexos localmente, sem conta online ou sincronização automática. Não existe intermediação de dinheiro, saldo financeiro ou confirmação bancária. Registros são autodeclarados e não substituem comprovantes do banco ou recibos da instituição. Senha perdida não é recuperável; exporte backups cifrados.

Não foram importadas contribuições, carteiras ou documentos pessoais antigos. Alterar de endereço não transfere dados entre origens. Só use dados sintéticos nos testes; validação real de IndexedDB, dispositivos móveis e auditoria independente de segurança continuam necessárias.

## Catálogo e fontes

11 instituições; fichas datadas individualmente. Em 16/11/2026 foram consultados:

- https://stacasa.org.br/
- https://amigosdobem.org/como-ajudar/
- https://www.pastoraldacrianca.org.br/doar
- https://www.acaatinga.org.br/proteja-a-caatinga/

Revisão de fonte não significa auditoria da organização ou confirmação bancária. Fontes antigas de Pix continuam bloqueadas. Nenhuma data deve ser renovada sem conferir a fonte.

Código MIT. Nomes de instituições são referências, sem parceria ou endosso presumido.
