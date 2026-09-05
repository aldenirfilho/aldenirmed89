# ⚠️ Pasta legada — não editar manualmente

Este diretório é um **mirror antigo e obsoleto**, gerado no passado por
`scripts_admin/sync_public_site.py` (script pré-`build_public_site.py`).

## Por que ele existe

Antes do fluxo atual de deploy, o site publicado era montado copiando
conteúdo para `public_site/`. Esse fluxo foi substituído pelo workflow
`.github/workflows/deploy-seguro.yml`, que hoje monta uma pasta `site/`
temporária (não versionada) diretamente no runner, via
`scripts_admin/build_public_site.py`.

O próprio comentário histórico do workflow de deploy documenta a mudança:

> "PARA DE ANINHAR `public_site/` dentro do artefato -> isso criava um site
> fantasma duplicado em /public_site/ (387 MB) idêntico à raiz."

## Estado atual

- ❌ **Não é usado pelo deploy real** (não aparece em `build_public_site.py`
  nem em `deploy-seguro.yml`).
- ❌ **Não deve receber edições manuais** — qualquer alteração aqui não se
  reflete no site publicado em <https://aldenirfilho.github.io/aldenirmed89/>.
- ✅ Ainda é lido por `scripts_admin/check_static_manifests.py` (checagem 7,
  "Consistência raiz vs public_site") só para comparar se os manifests
  antigos aqui dentro continuam batendo com os da raiz. Isso é um resquício
  do fluxo antigo, não uma dependência funcional do site.
- Mantido apenas para não perder histórico, evitando exclusões destrutivas
  sem uma tarefa dedicada e testada via Pull Request.

## Se um dia for removido

Antes de apagar esta pasta, é necessário também remover/ajustar a
checagem 7 em `scripts_admin/check_static_manifests.py`
(`check_public_site_consistency`), senão o CI de deploy passa a falhar por
depender de um arquivo que não existirá mais
(`public_site/data/site_manifest.json`).
