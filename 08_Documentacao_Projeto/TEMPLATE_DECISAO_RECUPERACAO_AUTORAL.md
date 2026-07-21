# 🧾 Template de decisão — recuperação autoral privada

> Template vazio e público. Ao preenchê-lo, salve a cópia **somente** em uma
> pasta `_private` ignorada pelo Git. Nunca registre dados identificáveis de
> pacientes, informações jurídicas ou financeiras.

## Identificação do lote

- Data: `AAAA-MM-DD`
- Tamanho planejado: `5–10`
- Registro privado: `_private/.../authorial-recovery-decisions.json`
- Manifesto público conferido em somente leitura: `sim/não`
- Responsável pela revisão: `NOME/FUNÇÃO — sem dado sensível`

## Candidato

- Candidate ID: `cand-...`
- SHA-256: `consultar o registro privado`
- Extensão: `.ext`
- Duplicate group: `dup-...` ou `nenhum`
- Ocorrências do mesmo SHA: `listar IDs; preservar todas`
- Rendition group: `rend-...` ou `nenhum`
- `alreadyPublicPaths`: `[]` — se houver path, retirar da triagem de republicação
- `authorshipHint`: `pista de nome; não é prova`

## Gate 1 — autoria

- [ ] `pending`
- [ ] `confirmed-author`
- [ ] `author-with-ai`
- [ ] `third-party`
- [ ] `rejected`

Evidência privada, sem dado sensível:

```text
Referência curta à declaração, histórico ou arquivo comprobatório privado.
```

> `third-party` sempre encerra esta fila como `hold-private`, mesmo quando uma
> licença aberta foi conferida. No site, use somente referência/link oficial.

## Gate 2 — licença

- [ ] `pending`
- [ ] `owned`
- [ ] `explicit-permission`
- [ ] `open-license`
- [ ] `official-link-only`
- [ ] `rejected`

Evidência privada:

```text
Titularidade, licença e versão conferidas; registrar apenas referência curta.
```

## Gate 3 — privacidade

- [ ] `pending`
- [ ] `no-sensitive-data`
- [ ] `anonymized-approved`
- [ ] `quarantined`
- [ ] `rejected`

Conferência mínima:

- [ ] texto integral;
- [ ] imagens e telas incorporadas;
- [ ] cabeçalhos, rodapés, comentários e revisão controlada;
- [ ] propriedades/metadados;
- [ ] planilhas ou slides ocultos;
- [ ] anexos, macros e objetos incorporados;
- [ ] nenhuma combinação capaz de reidentificar pessoa.

Evidência privada:

```text
Resultado da inspeção humana, sem transcrever identificadores.
```

## Gate 4 — revisão clínica

- [ ] `pending`
- [ ] `approved`
- [ ] `not-applicable`
- [ ] `outdated-quarantine`
- [ ] `rejected`

Conferência mínima quando houver conteúdo clínico:

- [ ] fontes e data;
- [ ] doses, unidades, diluições e velocidades;
- [ ] ajustes renal/hepático;
- [ ] contraindicações e riscos;
- [ ] diferença entre evidência, diretriz, protocolo e inferência;
- [ ] aplicabilidade institucional.

Evidência privada:

```text
Referência curta ao registro de revisão clínica.
```

## Resultado deste candidato

- [ ] `pending` — falta gate ou evidência;
- [ ] `hold-private` — manter privado, inclusive toda obra `third-party`;
- [ ] `gates-complete-human-review-required` — ainda não publicar.

Notas operacionais, sem dados sensíveis:

```text
Próxima microação e responsável.
```

## Fechamento

- [ ] Nenhum arquivo foi copiado, movido, renomeado ou apagado.
- [ ] Nenhum manifesto ou catálogo público foi alterado.
- [ ] Duplicatas exatas ocuparam uma só vaga e todas as ocorrências foram
      preservadas, sem sugestão de exclusão.
- [ ] Não existem decisões conflitantes não resolvidas entre ocorrências do
      mesmo SHA.
- [ ] O registro preenchido continua em `_private` e ignorado pelo Git.
- [ ] Uma decisão completa não foi confundida com autorização automática para
      publicação.
