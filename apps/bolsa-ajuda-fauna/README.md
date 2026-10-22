# Bolsa de Ajuda — Fauna 360°

Diretório educativo público: 26 animais ameaçados (25 espécies e uma subespécie), habitats, ameaças, ações prioritárias, referências e dez instituições de conservação.

## Abrir

Rota no portal: `apps/bolsa-ajuda-fauna/index.html`. Arquivos estáticos, sem instalação, chave de API, dependência de CDN ou backend. Os scripts e estilos são locais. Para desenvolvimento, execute `python3 -m http.server 8000` na raiz e abra a rota no navegador.

## Recursos

Busca sem acentos e com múltiplos termos; filtros de risco e região; atalho para Ceará; favoritos locais com tratamento de falha de armazenamento; exportação JSON da seleção; fichas acessíveis por teclado; links institucionais HTTPS; layout responsivo e impressão.

## Limites

Não recebe pagamentos, não registra valores, não recebe comprovantes e não publica dados de doadores. Favorito não equivale a doação. Uma instituição relacionada à causa não é necessariamente um canal de financiamento exclusivo daquela espécie. Quando não há canal específico verificado, a ficha informa essa lacuna. Projeto Albatroz não é apresentado como destino específico para o albatroz-das-galápagos.

As categorias globais foram transpostas da pesquisa-base de 18/10/2026. A data de consulta não é a data da avaliação IUCN. Em 22/10/2026 foram consultados os canais institucionais indicados, exceto o Asian Rhino Specialist Group, marcado como não revalidado nesta data. Não há atualização automática das categorias ou auditoria financeira das entidades. Os ícones são símbolos ilustrativos, sem fotografia ou logotipo de terceiros.

## Manutenção

Edite `catalog.json` e regenere `catalog.js` como `window.FAUNA_CATALOG = ` seguido do mesmo JSON e `;`. A suíte compara as duas representações. Mantenha fontes e datas, registre o escopo de cada canal e execute os testes antes de publicar. Não adicione dados bancários inferidos, comprovantes, tokens ou dados de doadores.

## Testes

`python3 -m unittest discover -s tests -p 'test_fauna_site.py' -v`

`node --check apps/bolsa-ajuda-fauna/app.js`

O fluxo existente de publicação por allowlist inclui `apps/`. A autorização deste trabalho abrange apenas este conteúdo educativo e sua navegação, sem alterar módulos clínicos ou regras de privacidade.
