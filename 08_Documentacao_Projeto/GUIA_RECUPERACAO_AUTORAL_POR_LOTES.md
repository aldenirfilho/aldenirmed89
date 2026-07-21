# 🔐 Recuperação autoral por lotes — guia operacional

**Ferramenta:** `scripts_admin/recover_authorial_batches.py`
**Versão:** 1.1 — 21/07/2026
**Objetivo:** reencontrar, agrupar e revisar documentos privados sem publicar,
copiar, mover, renomear ou apagar nenhum arquivo.

## O que fazer agora

```text
1. Executar em SOMENTE LEITURA
          ↓
2. Confrontar os SHA com o manifesto público, em somente leitura
          ↓
3. Conferir o lote de 5 obras únicas por SHA
          ↓
4. Criar o registro privado com flag explícita
          ↓
5. Revisar os quatro gates de cada candidato
          ↓
6. Manter pendente ou bloqueado quando houver dúvida
          ↓
7. Depois dos quatro gates: revisão humana separada
```

> 🚨 **Esta ferramenta nunca publica documentos.** Mesmo quando todos os gates
> estiverem completos, o resultado será `gates-complete-human-review-required`.
> Qualquer promoção futura segue o
> `08_Documentacao_Projeto/GUIA_INSERCAO_SEGURA_DOCUMENTOS.md`.

## Contrato de segurança

- A fonte precisa estar dentro de uma pasta chamada exatamente `inbox` ou
  `_private`.
- O registro de decisões precisa ficar sob `_private` e estar ignorado pelo Git.
- Por padrão, a ferramenta é **somente leitura** e não cria nem o diretório do
  registro.
- A única escrita possível exige `--write-private` e afeta somente o JSON
  indicado por `--registry`.
- O registro é gravado atomicamente e com permissão local `0600` quando o sistema
  operacional oferece esse controle.
- Links simbólicos são recusados e não são percorridos.
- Com `--public-manifest`, o programa lê **somente**
  `biblioteca_documentos_manifest.json`, valida `sourceSha256` + `path` e marca
  `alreadyPublicPaths`. O manifesto nunca é gravado.
- Hashes já presentes no manifesto público ficam fora do próximo lote para não
  sugerir republicação.
- Nenhum `acervo/`, catálogo, manifesto, `public/`, `site/`, Card Feed ou leitor
  da Biblioteca é alterado.
- Nome de arquivo e `authorshipHint` são apenas pistas; nunca confirmam autoria.
- O conteúdo dos documentos não é extraído. Apenas caminho privado, extensão,
  tamanho e SHA-256 entram no inventário privado.

## Etapa 0 — confirmar o projeto e a proteção do registro

Na raiz do repositório:

```bash
cd "/Users/aldenirpro/Documents/OpenAI-export/antigravity-consultas"
pwd
git status --short --branch
git check-ignore -v "02_Biblioteca_IA_Engine/_private/authorial-recovery-decisions.json"
```

O último comando precisa mostrar uma regra do `.gitignore`. Se não mostrar,
**pare**. A própria ferramenta também recusará a escrita.

O registro é privado, mas não substitui backup dos originais. Preserve os
arquivos-fonte em armazenamento protegido.

## Etapa 1 — visualizar o próximo lote sem criar nada

```bash
python3 scripts_admin/recover_authorial_batches.py \
  --source-root "02_Biblioteca_IA_Engine/inbox" \
  --registry "02_Biblioteca_IA_Engine/_private/authorial-recovery-decisions.json" \
  --public-manifest "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json" \
  --batch-size 5
```

Resultado esperado:

- mensagem `Modo: SOMENTE LEITURA`;
- quantidade de candidatos, duplicatas e possíveis rendições;
- confirmação `Manifesto público: SOMENTE LEITURA` e quantidade de SHA já
  publicados que ficaram fora do lote;
- próximo lote com até cinco **obras SHA** e um ID representante `cand-...` por
  hash;
- confirmação de que nenhum arquivo ou diretório foi criado.

O tamanho pode ser ajustado entre 5 e 10:

```bash
--batch-size 5
--batch-size 8
--batch-size 10
```

Se restarem menos de cinco obras únicas elegíveis, a ferramenta informa **lote
final parcial**. Ela nunca preenche o lote com hashes já públicos, concluídos ou
bloqueados.

> ⚠️ Se `--public-manifest` for omitido, a execução continua segura e somente
> leitura, mas mostra `comparação NÃO APLICADA`. Para a triagem real, use sempre
> o manifesto canônico indicado acima.

### Mais de uma fonte privada

Repita `--source-root`; não junte diretórios manualmente:

```bash
python3 scripts_admin/recover_authorial_batches.py \
  --source-root "02_Biblioteca_IA_Engine/inbox" \
  --source-root "00_INBOX_ATUALIZACAO/_private/triagem-biblioteca-autoral-2026-07-21" \
  --registry "02_Biblioteca_IA_Engine/_private/authorial-recovery-decisions.json" \
  --public-manifest "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json" \
  --batch-size 5
```

## Etapa 2 — criar o único registro privado

Depois de conferir o resumo em modo somente leitura, repita o comando com a
autorização explícita:

```bash
python3 scripts_admin/recover_authorial_batches.py \
  --source-root "02_Biblioteca_IA_Engine/inbox" \
  --registry "02_Biblioteca_IA_Engine/_private/authorial-recovery-decisions.json" \
  --public-manifest "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json" \
  --batch-size 5 \
  --write-private
```

Esse comando cria ou atualiza apenas:

```text
02_Biblioteca_IA_Engine/_private/authorial-recovery-decisions.json
```

O registro contém:

- inventário atual com SHA-256;
- `alreadyPublicPaths` por ocorrência, quando o SHA já consta no manifesto;
- grupos de duplicatas exatas;
- possíveis rendições da mesma obra, como DOCX e PDF;
- decisões e evidências de cada gate;
- candidatos que sumiram da fonte, preservados como decisões órfãs;
- próximo lote pendente com um representante por SHA e todas as ocorrências do
  mesmo hash preservadas/listadas.

> Duplicata exata ou nome semelhante **não autoriza descarte**. A ferramenta
> apenas agrupa. Duplicatas exatas ocupam uma vaga no lote, mas todas continuam
> inventariadas; isso nunca sugere apagar, mover ou substituir uma ocorrência.

## Etapa 3 — revisar os quatro gates

Use um candidato por vez. Não inclua nome, prontuário, endereço, telefone ou
outro dado identificável nas evidências/notas.

| Gate | Estados disponíveis | Regra prática |
|---|---|---|
| Autoria | `pending`, `confirmed-author`, `author-with-ai`, `third-party`, `rejected` | `third-party` sempre resulta em `hold-private`; use referência/link oficial no site |
| Licença | `pending`, `owned`, `explicit-permission`, `open-license`, `official-link-only`, `rejected` | licença não transforma obra de terceiro em documento autoral recuperável |
| Privacidade | `pending`, `no-sensitive-data`, `anonymized-approved`, `quarantined`, `rejected` | dúvida ou identificador mantém o documento privado |
| Revisão clínica | `pending`, `approved`, `not-applicable`, `outdated-quarantine`, `rejected` | material clínico desatualizado não avança |

`third-party`, estados de rejeição/quarentena e `official-link-only` produzem
`hold-private`. Mesmo uma licença aberta não encaminha obra de terceiro à
republicação por esta ferramenta. Um gate sem evidência continua pendente mesmo
que um status tenha sido escolhido.

Cada SHA ocupa uma vaga, mas o registro conserva uma decisão por ocorrência.
Se duplicatas idênticas receberem estados diferentes, o SHA sai do lote e surge
o alerta `Decisões conflitantes em duplicatas exatas`, com todos os IDs e
caminhos. Resolva o conflito deliberadamente em cada ocorrência; nunca presuma
que a decisão sobre um caminho autoriza automaticamente os demais.

### Exemplo copiável de decisão completa

Substitua somente o ID e as evidências genéricas. Não coloque dados de paciente
na linha de comando, pois ela pode permanecer no histórico do Terminal.

```bash
python3 scripts_admin/recover_authorial_batches.py \
  --source-root "02_Biblioteca_IA_Engine/inbox" \
  --registry "02_Biblioteca_IA_Engine/_private/authorial-recovery-decisions.json" \
  --public-manifest "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json" \
  --batch-size 5 \
  --candidate-id "cand-SUBSTITUIR_PELO_ID" \
  --authorship-status confirmed-author \
  --authorship-evidence "Declaração autoral arquivada na pasta privada." \
  --license-status owned \
  --license-evidence "Titularidade conferida na ficha privada." \
  --privacy-status no-sensitive-data \
  --privacy-evidence "Inspeção humana integral concluída sem identificadores." \
  --clinical-review-status approved \
  --clinical-review-evidence "Revisão médica e referências registradas na ficha privada." \
  --notes "Aguardando revisão humana final; nenhuma publicação autorizada." \
  --write-private
```

### Exemplo de bloqueio seguro

```bash
python3 scripts_admin/recover_authorial_batches.py \
  --source-root "02_Biblioteca_IA_Engine/inbox" \
  --registry "02_Biblioteca_IA_Engine/_private/authorial-recovery-decisions.json" \
  --public-manifest "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json" \
  --candidate-id "cand-SUBSTITUIR_PELO_ID" \
  --privacy-status quarantined \
  --privacy-evidence "Requer saneamento humano antes de nova avaliação." \
  --notes "Manter privado." \
  --write-private
```

## Como interpretar o resultado

| Estado | Significado | Próxima ação |
|---|---|---|
| `pending` | Falta status ou evidência em pelo menos um gate | manter privado e revisar |
| `hold-private` | Há rejeição, quarentena, desatualização ou somente link oficial | não promover o arquivo |
| `gates-complete-human-review-required` | Os quatro gates foram documentados | fazer revisão humana final em fluxo separado |

Não existe estado `published`, botão de promoção ou destino público nessa
ferramenta.

## Retomar amanhã sem perder o fio 🧠

1. Execute novamente o comando da Etapa 1.
2. O registro existente será lido, sem ser regravado.
3. Hashes já públicos e candidatos concluídos ou bloqueados ficam fora do
   próximo lote.
4. Arquivo alterado recebe novo ID, porque o SHA-256 mudou; a decisão antiga é
   preservada como órfã e não é aplicada automaticamente à nova versão.
5. Use `--write-private` apenas quando desejar registrar uma decisão ou atualizar
   o inventário privado.

## Checklist de encerramento do lote

- [ ] Revisei no máximo 5–10 candidatos.
- [ ] Comparei duplicatas sem apagar nenhuma cópia.
- [ ] Confirmei `Manifesto público: SOMENTE LEITURA` antes da triagem.
- [ ] Cada SHA exato ocupou somente uma vaga e todas as ocorrências foram
      preservadas.
- [ ] Tratei DOCX/PDF/PPTX/XLSX semelhantes como possíveis rendições.
- [ ] Registrei evidência real de autoria e licença.
- [ ] Inspecionei o documento integral, inclusive metadados e conteúdo oculto.
- [ ] Não registrei dados identificáveis no JSON ou no Terminal.
- [ ] Materiais incertos continuam `pending` ou `hold-private`.
- [ ] Não usei `git add` no registro `_private`.
- [ ] Nenhum arquivo foi publicado, movido, renomeado ou apagado.

## Teste técnico da ferramenta

```bash
PYTHONDONTWRITEBYTECODE=1 \
python3 -m unittest tests.test_authorial_recovery_batches -v
```

O teste cobre: modo somente leitura, escrita explícita, SHA-256, um representante
por hash exato, confronto somente leitura com manifesto público, exclusão dos
hashes já publicados, rendições, gates, lote final parcial, registro corrompido,
fonte pública recusada e exigência de `.gitignore` dentro de um repositório.

## Principais erros a evitar ❌

1. Usar `--write-private` antes de conferir o modo somente leitura.
2. Apontar a ferramenta para `acervo/`, `public/` ou outra pasta pública.
3. Omitir `--public-manifest` na triagem real e retriar um SHA já publicado.
4. Tratar `authorshipHint` como prova.
5. Marcar licença como própria sem evidência documental.
6. Republicar obra de terceiro porque ela possui licença aberta; nesta fila ela
   permanece privada e o site usa referência/link oficial.
7. Usar “anonimizado” sem inspeção integral do arquivo.
8. Ignorar decisões conflitantes entre ocorrências do mesmo SHA.
9. Publicar porque os quatro gates ficaram completos.
10. Apagar duplicatas ou substituir rendições durante a triagem.
11. Adicionar o registro privado ao Git.
