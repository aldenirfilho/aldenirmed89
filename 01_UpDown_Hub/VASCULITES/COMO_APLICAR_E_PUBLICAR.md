# Como aplicar e publicar as correções

Esta sessão do Claude Code foi provisionada **somente leitura** (o push deu 403
tanto pelo git quanto pela integração do GitHub). Por isso o trabalho está
**commitado localmente** e empacotado aqui para você publicar. Nada se perde.

São **2 commits** sobre o seu `main` atual (063e12a):

- `cab8334` fix: corrige 404s, restaura visualizacao de documentos in-site e hubs
- `4d59fa4` feat: alimentacao continua, validacao anti-404 e pagina de diagnostico

---

## Opção A — via git bundle (recomendado, preserva os commits exatos)

```bash
# dentro do seu clone do repositório, com o main atualizado em 063e12a
git fetch /caminho/para/antigravity-fix.bundle \
    claude/awesome-mayer-Syb64:claude/awesome-mayer-Syb64

git checkout claude/awesome-mayer-Syb64
git push -u origin claude/awesome-mayer-Syb64
```

## Opção B — via patches (.patch)

```bash
git checkout -b claude/awesome-mayer-Syb64 main
git am --3way 0001-*.patch 0002-*.patch
git push -u origin claude/awesome-mayer-Syb64
```

---

## Depois de publicar

1. Abra um PR de `claude/awesome-mayer-Syb64` para `main` (ou faça merge direto).
2. O deploy do GitHub Pages roda no push para `main`
   (`.github/workflows/deploy-seguro.yml`).
3. Abra **`diagnostico.html`** no site para conferir que está tudo verde.

## Conferência rápida (opcional, antes do push)

```bash
python3 scripts_admin/validar_paths.py --check   # deve dar 0 removidos (404)
```
