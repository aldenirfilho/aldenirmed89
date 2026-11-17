# Ajuda de Boa 2.0 · Bolsa Ajuda de Boa · 360X

Vitrine de causas sociais e ambientais com **perspectiva e projetos** por instituição, **Pix rápido com QR Code** (com conferência anti-golpe da chave), **XP da Boa Ação** (mesma régua do Placar XP da planilha) e o **app Bolsa Ajuda de Boa** para baixar. Edição 2.0 de 16/11/2026, construída sobre a edição recuperada 1.2.

| Onde | Endereço | Cofre |
|---|---|---|
| Vitrine pública (GitHub Pages) | https://aldenirfilho.github.io/aldenirmed89/apps/ajuda-de-boa/ | não (modo vitrine) |
| Edição com carteira (origem exclusiva) | https://shop-ajuda-de-boa.aldenirmed.chatgpt.site/ | sim (republicar a pasta `dist` para atualizar) |
| App Bolsa Ajuda de Boa (arquivo único, offline) | `dist/downloads/bolsa-ajuda-de-boa.html` | sim (IndexedDB ou modo sessão) |

### Novidades da 2.0
- 12 instituições (inclui Hemoce Sobral para doação de sangue) com ticker (ex.: CAAT4, AQUA7), perspectiva, 3–5 projetos e fonte datada.
- Pix rápido: escolher causa → valor → QR. Chaves consultadas há mais de 30 dias exigem que o doador confira a chave na página oficial (vale 30 dias neste navegador).
- XP da Boa Ação (`assets/xp.js`): 1.000–10.000 XP por ajuda, qualidade = Necessidade×3, Gratidão×3, Oportunidade×2, Criatividade×1, Segurança×2; medida gaussiana da proporção doado/recebido (ideal 5%, σ 5%/3%); travas de reserva e de destinatário. Níveis 🌱→👑 e estrelas sem fim. Export “Placar XP” com as 15 colunas da aba “Ajudas” da planilha.
- Novos tipos de ajuda: doação de sangue e divulgação. Backups 2.0 com esses tipos não abrem na 1.2.
- App Bolsa Ajuda de Boa: home broker do bem (painel, posições por ticker, XP por mês, extrato, organizações, Pix, cofre), mesmo formato de backup do site.

### Gerar app e vitrine
```sh
python3 scripts_admin/shop-ajuda-de-boa/build_app.py          # gera dist/downloads, injeta SHA-256 e atualiza apps/ajuda-de-boa
python3 scripts_admin/shop-ajuda-de-boa/build_app.py --check  # falha se algo estiver desatualizado
```

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

12 instituições; fichas datadas individualmente. Perspectivas e projetos de 16/11/2026 têm fonte própria (`projSource`: oficial, público, imprensa ou síntese). Em 16/11/2026 foram consultados:

- https://stacasa.org.br/
- https://amigosdobem.org/como-ajudar/
- https://www.pastoraldacrianca.org.br/doar
- https://www.acaatinga.org.br/proteja-a-caatinga/

Revisão de fonte não significa auditoria da organização ou confirmação bancária. Fontes antigas de Pix continuam bloqueadas. Nenhuma data deve ser renovada sem conferir a fonte.

Código MIT. Nomes de instituições são referências, sem parceria ou endosso presumido.
