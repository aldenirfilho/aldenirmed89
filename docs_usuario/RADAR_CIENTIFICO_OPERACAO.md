# Estação Radar Diário Antigravity — operação contínua

## O que é atualizado

A edição pública e o índice cronológico ficam em
`15_Radar_Cientifico/data/radar.js`. O histórico
antirrepetição fica em `15_Radar_Cientifico/data/radar-history.json` e conserva
IDs persistentes de DOI, PMID ou URL canônica por 365 dias.

Cada edição completa precisa conter:

1. três prioridades no briefing;
2. pelo menos dez itens científicos ou oficiais;
3. três canais separados: **Ciência Clínica**, **Saúde e Sistemas** e
   **Produtividade & Compras**;
4. uma editoria de saúde nacional, global e Ceará, sempre traduzindo a notícia
   em impacto prático para médico e estudante;
5. exatamente dez pares de sínteses visuais editoriais em português: widescreen para
   desktop e card vertical para celular;
6. três pares adicionais de imagens para os itens comerciais da edição;
7. `itemId`, fonte, data, link direto, texto alternativo e transcrição em toda
   imagem;
8. conteúdo didático expandido e ressalva de aplicabilidade em todo item;
9. datas separadas de publicação da fonte, entrada editorial e conferência.

O portal agrupa por `editorialPublishedAt`. `sourcePublishedAt` nunca deve ser
alterado para fazer um conteúdo antigo parecer novo. `checkedAt` registra a
última conferência da referência. Quando não houver publicação relevante do
próprio dia, use o item mais recente disponível e apresente sua data real.

## Regra editorial

A seleção ordena primeiro o nível e a confiabilidade da evidência, depois a
relevância para UTI/Clínica/TEMI e, em empate, a data mais recente. Na ausência
de estudo de alto impacto novo, a edição pode usar diretriz, revisão sistemática,
política oficial ou estudo observacional recente, sempre identificando o desenho.

Não se publica:

- item repetido no período de retenção;
- resumo sem fonte primária ou institucional;
- conclusão maior que o resultado apresentado;
- preprint sem o rótulo correspondente;
- imagem decorativa ou sem referência;
- texto, dose ou número gerado sem conferência;
- link para fonte ilegal de artigos;
- preço sem data/hora de conferência;
- link afiliado oculto;
- promessa de foco, rendimento, cura, prevenção de dor ou produtividade;
- produto sem especificação verificável, utilidade, risco e opção explícita de
  não comprar.

## Canal Produtividade & Compras

O canal comercial é curadoria independente, não vitrine automática. Cada item
usa `section: "commercial"` e precisa conter:

1. link direto HTTPS do produto;
2. `price.display`, `price.checkedAt`, disponibilidade e aviso de volatilidade;
3. varejista e divulgação `affiliate: false`;
4. especificações conferidas no anúncio;
5. para quem serve e como usar;
6. benefício apenas como possibilidade, nunca como resultado garantido;
7. quando vale e quando não comprar;
8. compatibilidade, vendedor, garantia/devolução, frete e segurança;
9. par visual em `assets/products/`, com card e widescreen.

Se o preço não estiver visível, publique **Preço não confirmado**. Nunca
reaproveite preço de busca antiga como se fosse atual.

## Como inserir uma atualização manual

1. Abra `15_Radar_Cientifico/data/radar.js`.
2. Crie um ID persistente: prefira `doi:`, depois `pmid:` e, por último, a URL
   canônica normalizada.
3. Preencha `sourcePublishedAt`, `editorialPublishedAt`, `checkedAt`, desenho,
   acesso, tema, título, fonte, URL, resumo, motivo e ressalva.
4. Preencha todo o objeto `didactic`: pergunta clínica, desenho, população,
   achado principal, significado, leitura para hoje, o que não concluir, gancho
   TEMI, âncora de memória e limitações.
5. Verifique se o ID ainda não existe em `radar-history.json`.
6. Para uma imagem clínica/notícia, salve os dois PNGs em
   `15_Radar_Cientifico/assets/cards/`. Para compra, use
   `15_Radar_Cientifico/assets/products/`. Preencha `wideFile`, `cardFile`,
   `itemId`, `alt`, `source`, `sourcePublishedAt`, `sourceUrl` e os quatro
   campos de `transcript`. Os dois formatos precisam sustentar a mesma
   informação e a mesma referência.
7. Registre a edição em `editions`, mantendo exatamente dez `visualIds` e,
   quando houver a rodada comercial, três `productVisualIds`.
8. Adicione o ID ao histórico e atualize as contagens da edição.
9. Rode `python3 -m unittest tests.test_radar_directory -v`.

## Padrão visual

Use português, fundo claro, hierarquia de leitura forte e um único conceito por
card. Estrutura recomendada: manchete, pergunta/população, achado, aplicação
proporcional, alerta e faixa discreta de referência. A explicação precisa existir
também como HTML pesquisável e acessível; o PNG não pode ser a única fonte da
informação. A arte é uma síntese autoral e não deve imitar figura oficial da
revista.

O seletor **Automático / Widescreen / Card** fica salvo apenas no navegador. No
modo automático, a página usa widescreen a partir de 921 px e card vertical nas
telas menores.

## Spotify

O site aceita apenas endereços `https://open.spotify.com/`. Para adicionar a
trilha pessoal, use no Spotify **Compartilhar → Copiar link da playlist**, cole
no campo do Radar e selecione **Salvar e abrir**. Nenhuma credencial é armazenada.

## Diretório médico plugável

Novas fontes entram em `16_Diretorio_Medico/data/sites.js` com nome, URL HTTPS,
região, categoria, acesso e prioridade. Não repita a URL. Dê preferência a
fontes abertas e institucionais.

## Segurança clínica

O Radar é material de atualização e estudo, não prescrição. Antes de aplicar:
confirme o texto integral, população, intervenção, desfechos, limitações,
diretriz vigente e protocolo local.
