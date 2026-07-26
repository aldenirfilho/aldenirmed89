# Monitor técnico de fontes jurídico-editoriais

Este diretório contém o catálogo de fontes oficiais usado pela sentinela
jurídico-editorial do Antigravity. O monitor detecta indisponibilidade ou
mudança textual relevante; ele **não interpreta a lei, não aprova conteúdo e
não publica alterações**.

## Operação segura

Verificação somente leitura:

```bash
python3 scripts_admin/check_legal_sources.py \
  --check \
  --report legal-integrity-report.json
```

O código de saída é `0` somente quando todas as fontes selecionadas coincidem
com baselines emitidos. Baseline ausente, mudança ou indisponibilidade retorna
`2` e exige revisão humana.

Atualização deliberada de uma fonte, depois de comparar o documento oficial:

```bash
python3 scripts_admin/check_legal_sources.py \
  --refresh \
  --source cfm-resolution-2336 \
  --reviewer "Nome do revisor humano" \
  --reviewed-at "2026-07-25T22:00:00-03:00" \
  --report legal-integrity-refresh.json
```

`--refresh` exige ao menos um `--source`, o nome do revisor e um timestamp
ISO-8601 com fuso. Todas as fontes selecionadas são obtidas e validadas antes
da troca atômica do catálogo, evitando atualização parcial.

## Limites deliberados

- Somente HTTPS, porta padrão e hosts da allowlist compilada.
- Redirecionamento para outro host é recusado.
- Timeout de 20 segundos por padrão, configurável apenas entre 1 e 60 segundos.
- Máximo absoluto de 5 MB por resposta e 4 MB de texto normalizado.
- `User-Agent` identifica claramente o monitor e aponta para a estação pública.
- Scripts, estilos, navegação, formulários e molduras de cabeçalho/rodapé não
  entram no hash. Datas editoriais voláteis conhecidas também são removidas.
- A Resolução CFM nº 2.336/2023 é um PDF oficial estável e, por não haver
  extrator PDF na biblioteca padrão, recebe hash dos bytes binários limitados;
  as demais fontes recebem hash do texto HTML visível normalizado.
- Cada fonte exige marcadores e tamanho mínimo para recusar páginas de bloqueio,
  CAPTCHA ou erro que retornem HTTP 200.
- O relatório guarda hashes e metadados, nunca uma cópia integral da fonte.
- O workflow diário abre ou atualiza uma única issue para revisão; não faz
  commit, não muda baseline e não publica interpretação.

Os hashes indicam integridade técnica do texto extraído. Eles não demonstram,
isoladamente, autoria, vigência, aplicabilidade nem aprovação jurídica.
