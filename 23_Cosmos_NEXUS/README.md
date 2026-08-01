# NEXUS Cosmos — operação segura

Esta estação recebe produtos GPT/Codex, registra a identidade dos bytes,
topografa o conteúdo e prepara a sincronização privada. Ela **não publica** o
portal. A Biblioteca IA é o destino canônico de Word e PDF; imagens são
roteadas por função para Biblioteca Visual/Card Feed, ACRA/POCUS ou Atlas
NEXUS.

## Comando mais simples

Para Word, PDF ou imagem já materializados no computador:

```bash
python3 scripts_admin/nexus_cosmos.py intake \
  --source "/caminho/para/arquivo.pdf" \
  --block organizador-estudos
```

O padrão é `P1`: a fonte entra na fila local privada, recebe código único,
hash, rota e procedimento, mas fica bloqueada para GitHub e para o acervo
público da Biblioteca. O arquivo original não é movido, renomeado ou alterado;
seus bytes são congelados em um blob privado atômico identificado pelo SHA-256.

Depois de uma primeira classificação, um material possivelmente P0 pode ser
registrado como candidato a revisão:

```bash
python3 scripts_admin/nexus_cosmos.py intake \
  --source "/caminho/para/imagem.png" \
  --block motor-visual \
  --universe U3 \
  --privacy P0 \
  --objective "imagem Turbo TEMI"
```

Blocos aceitos:

- `evolucao`
- `plano-terapeutico`
- `motor-visual`
- `organizador-estudos`
- `turbo-temi`
- `refinaria-temi`
- `tutor`
- `extensao`

## O que o intake produz

- `####DOC`, `####PDF`, `####IMG` ou `####SRC` para a fonte física;
- `####AGX` para o produto educacional;
- `####SES` para a sessão;
- `PRC###` para o procedimento de acoplagem;
- SHA-256, MIME, tamanho, universo, bloco e TAGs estruturais;
- rota canônica e gates obrigatórios;
- estados independentes para Drive, Notion, GitHub rascunho e Biblioteca IA;
- trava de publicação ativa e TAF vazio.

A fila fica em `.nexus-sync-private/queue/`, e os blobs em
`.nexus-sync-private/blobs/`; ambos são ignorados pelo Git. Diretórios usam
permissão `0700` e recibos/blobs `0600`. Repetir os mesmos bytes no mesmo papel
semântico retorna `SKIP_DUPLICATE` e preserva o código original. Alterar apenas
a classificação de privacidade exige revisão explícita e não cria duplicata.

Para ver o plano sem revelar paths, títulos ou conteúdo:

```bash
python3 scripts_admin/nexus_cosmos.py sync-plan
```

## Sincronização automática

A rotina NEXUS Sync reconcilia periodicamente os registros pendentes:

1. Drive preserva os bytes originais e checksums.
2. Notion registra UID, versão, TAGs, relações, status e proveniência.
3. Biblioteca IA recebe o encaminhamento canônico de Word/PDF e seus previews.
4. GitHub recebe somente P0 sanitizado e com gates concluídos, em branch/PR de rascunho.
5. P1–P3, pacientes, PHI, direitos incertos e destinos ambíguos permanecem em
   quarentena privada.

Para arquivos gerados dentro da conversa, também é válido usar o comando
semântico:

```text
NEXUS ACOPLAR: #organizador-estudos | fonte=<arquivo> | tipo=gpt-pdf | objetivo=<resultado>
```

## Homologação, tombamento e publicação

```text
####AGX → PRC### → HOM### → TOM### → TAF###
```

O `TAF###` só pode nascer quando a homologação e o manifesto tombado apontam
para o mesmo conjunto de bytes. Mesmo assim, nenhuma publicação ocorre.

O único desbloqueio aceito é o comando literal do proprietário, na sessão
corrente:

```text
PUBLICAR {TAF###-EXATO}
```

Depois do comando, todo o lote ainda é revalidado antes de qualquer merge ou
deploy. Sem essa chave, `main`, merge, auto-merge, GitHub Pages e publicadores
de site continuam bloqueados.
