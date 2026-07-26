# Revisão protetiva semanal

## Finalidade

Uma vez por semana, o Antigravity produz um **laudo técnico-editorial
preventivo** para ajudar a identificar falhas, mudanças em fontes oficiais e
itens que precisam de revisão humana.

O laudo:

- não é parecer jurídico;
- não certifica conformidade;
- não confirma automaticamente infração, plágio, erro clínico ou violação;
- não corrige, exclui, commita nem publica arquivos ou conteúdo do site;
- não altera baselines de fontes oficiais automaticamente;
- publica somente um extrato sanitizado na issue semanal e os laudos como
  artefatos do GitHub Actions;
- não substitui advogado, revisor clínico, profissional de segurança ou teste
  em dispositivo real.

Ausência de alerta automatizado também não prova ausência de risco.

## Frequência e histórico

O workflow `.github/workflows/revisao-protetiva-semanal.yml` roda:

- toda segunda-feira, aproximadamente às **08:00 em Fortaleza**
  (`11:00 UTC`);
- sob comando manual pelo `workflow_dispatch`.

Cada execução:

1. gera `laudo-semanal.md` e `laudo-semanal.json`;
2. preserva os arquivos como artefato do GitHub Actions por 90 dias;
3. cria ou atualiza **uma única issue para a semana ISO**;
4. compara o resumo atual com o último resumo semanal disponível;
5. sinaliza a execução quando houver achado alto/crítico ou laudo ausente.

Uma nova semana cria uma nova issue. Reexecuções na mesma semana atualizam a
issue daquela semana, enquanto cada execução continua registrada nos
artefatos do Actions.

## Escopo do laudo

### 1. Fontes jurídico-editoriais oficiais

O monitor reutiliza exclusivamente o catálogo
`data/legal-sources.json`, cuja allowlist contém fontes oficiais como:

- Presidência da República / Planalto;
- Conselho Federal de Medicina;
- Fundação Biblioteca Nacional;
- Instituto Nacional da Propriedade Industrial;
- Creative Commons.

Ele detecta indisponibilidade ou mudança textual por comparação técnica. O
resultado **não interpreta** a lei, a resolução ou a orientação. Baselines só
podem ser atualizados por uma operação manual separada, com fonte, revisor e
instante explícitos.

### 2. Bugs e integridade técnica

A revisão executa:

- testes automatizados Python;
- validação dos catálogos clínicos JavaScript;
- validação de manifests, paths, rotas e aliases;
- `publication_guard.py` no repositório e no artefato público;
- build do site por allowlist;
- verificação local e HTTPS das rotas canônicas;
- verificação dos downloads por existência, ZIP/CRC e SHA-256.

Falhas de rede podem ser transitórias. Um alerta de rota pública deve ser
repetido antes de concluir que existe defeito persistente.

### 3. Integridade editorial

O mecanismo valida política, registro e proveniência. Também inventaria o
acervo legado com o gate fail-closed.

O legado permanece declarado como:

- `not-certified`;
- `outside-registry-no-approval`.

Por isso, cada ocorrência do inventário é descrita como **achado heurístico
para triagem**, nunca como violação confirmada ou aprovação retroativa. O laudo
mostra contagens completas e uma amostra limitada; a triagem deve ocorrer por
lotes.

## Severidades

| Severidade | Uso operacional |
|---|---|
| Crítico | Possível exposição privada, build/artefato inseguro ou integridade de download local comprometida. Isolar e revisar antes de publicar. |
| Alto | Teste/gate essencial falhou, fonte oficial mudou ou superfície pública precisa de revisão prioritária. |
| Médio | Baseline oficial ausente, fonte indisponível, alerta médico/editorial heurístico ou falha HTTPS possivelmente transitória. |
| Baixo | Pendência de cadastro/organização do legado ou melhoria programável. |

Severidade é prioridade de triagem, não conclusão jurídica.

## Formato do extrato

O Markdown traz:

- resumo por severidade;
- comparação com a execução anterior quando disponível;
- resultados dos comandos;
- fontes oficiais e seus estados técnicos;
- inventário legado e sua limitação;
- rotas e downloads;
- plano sugerido para os próximos sete dias;
- limitações e commit auditado.

O JSON preserva evidência estruturada, códigos, fingerprints e trechos
limitados da saída. Padrões comuns de credencial são redigidos do trecho antes
de entrar no relatório. Nenhum conteúdo de documento privado é aberto ou
impresso pelo `publication_guard.py`.

## Procedimento humano após o laudo

1. Ler primeiro os itens críticos e altos.
2. Confirmar o achado em fonte, rota ou artefato independente.
3. Isolar manualmente conteúdo duvidoso antes de nova publicação.
4. Encaminhar o tema ao profissional adequado: editorial, clínico, jurídico,
   privacidade, segurança ou infraestrutura.
5. Registrar responsável, data, evidência, decisão e correção.
6. Só atualizar baseline oficial após leitura humana documentada.
7. Comparar o resultado na próxima segunda-feira.

## Execução local de desenvolvimento

O modo abaixo gera a estrutura sem a suíte completa e sem consultar a versão
publicada. O monitor das fontes oficiais continua ativo:

```bash
python3 scripts_admin/weekly_protective_review.py \
  --root . \
  --output-dir weekly-protective-review \
  --skip-full-tests \
  --skip-live
```

A execução semanal real **não** usa `--skip-full-tests` nem `--skip-live`.
O diretório `weekly-protective-review/` é efêmero e não deve ser publicado como
conteúdo do site.
