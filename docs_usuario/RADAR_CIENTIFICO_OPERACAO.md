# Radar Científico Antigravity — operação diária

## O que é atualizado

A edição pública fica em `15_Radar_Cientifico/data/radar.js`. O histórico
antirrepetição fica em `15_Radar_Cientifico/data/radar-history.json` e conserva
IDs persistentes de DOI, PMID ou URL canônica por 365 dias.

Cada edição completa precisa conter:

1. três prioridades no briefing;
2. pelo menos dez itens científicos ou oficiais;
3. um bloco de saúde nacional, global e Ceará;
4. exatamente dez sínteses visuais em português;
5. fonte, data e link direto em toda imagem;
6. ressalva de aplicabilidade em todo artigo clínico.

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
- link para fonte ilegal de artigos.

## Como inserir uma atualização manual

1. Abra `15_Radar_Cientifico/data/radar.js`.
2. Crie um ID persistente: prefira `doi:`, depois `pmid:` e, por último, a URL
   canônica normalizada.
3. Preencha data, desenho, acesso, tema, título, fonte, URL, resumo, motivo e
   ressalva.
4. Verifique se o ID ainda não existe em `radar-history.json`.
5. Para uma imagem, salve o PNG em `15_Radar_Cientifico/assets/cards/` e
   preencha `source`, `date` e `sourceUrl`.
6. Adicione o ID ao histórico e atualize a contagem da edição.
7. Rode `python3 -m unittest tests.test_radar_directory -v`.

## Padrão visual

Use português, fundo claro, hierarquia de leitura forte e um único conceito por
card. Estrutura recomendada: título, fluxo/comparação, alerta e aplicação
prática. A fonte aparece no HTML; a arte é uma síntese autoral e não deve imitar
uma figura oficial da revista.

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
