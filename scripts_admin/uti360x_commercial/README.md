# UTI 360X Gestão — candidato comercial 0.2.0

Aplicativo demonstrável criado em 03/11/2026, apoiado no painel da Auditoria UTI do PR #65. Código novo restrito à área de engenharia `scripts_admin`, não incluída no site público. O repositório em si é público; não armazenar segredos ou dados pessoais.

[Guia de uso](docs/README.md) · [Hipóteses comerciais](docs/PLANO_COMERCIAL.md) · [Arquitetura de pagamentos pendente](docs/ARQUITETURA_PAGAMENTOS.md).

## Entrega
Seis módulos: visão geral, catálogo, carteira de compras/ABC, evidências, orçamento e produto comercial. HTML autocontido com Excel original; importações CSV; relatório estático; sessão JSON; demo sintética; opções de leitura e tema; manifesto/service worker para futura implantação técnica.

## Estado
Software implementado; checkout e cobrança desativados. Preços comerciais são hipóteses. Base de preços preservada de 22/10/2026: 140 itens, 35 observações, 32 itens com preço; não atualizada. Sem integração automática BPS/PNCP. Sem login, controle pago de acesso, multiusuário ou servidor de licenças.

A revisão humana pendente do PR #65 não foi considerada realizada. Não houve merge, alteração da homepage, liberação de site nem mudança nos gates editoriais. As novas fontes de engenharia não substituem o painel anterior.

## Verificação
Testes de lógica (48 casos) e de interface (43 verificações) usam exemplos sintéticos. O navegador é renderizado em memória; isso não comprova instalação PWA nem publicação no site. O workflow gera o pacote e evidências sem publicar GitHub Pages ou criar releases.

```
node --test scripts_admin/uti360x_commercial/tests/core.test.cjs
python3 scripts_admin/uti360x_commercial/build.py --out scripts_admin/uti360x_commercial/package
python3 scripts_admin/uti360x_commercial/tests/browser.py
```
