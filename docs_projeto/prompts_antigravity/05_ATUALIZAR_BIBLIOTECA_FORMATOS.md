# Atualizar Biblioteca IA por formato e origem

Use este roteiro quando novos documentos forem adicionados à Biblioteca IA.

## Onde inserir arquivos novos

Coloque os arquivos em:

```text
02_Biblioteca_IA_Engine/inbox/
```

Formatos reconhecidos:

- `.doc` / `.docx` — documentos gerados por IA
- `.pdf` — artigos científicos, guidelines e PDFs
- `.xls` / `.xlsx` — planilhas
- `.md` / `.markdown` — Markdown
- `.csv` / `.tsv` — dados tabulares e Anki quando o nome indicar flashcards
- `.ppt` / `.pptx` — apresentações
- `.txt` — textos simples
- `.apkg` — flashcards Anki
- `.html` / `.htm` — páginas interativas

## Comandos

```bash
cd "/Users/aldenirfilho/Library/Mobile Documents/iCloud~md~obsidian/Documents/Comando Central/Antigravity_Consultas/02_Biblioteca_IA_Engine"
bash scan_inbox.sh
```

Validar JSON:

```bash
cd "/Users/aldenirfilho/Library/Mobile Documents/iCloud~md~obsidian/Documents/Comando Central/Antigravity_Consultas"
python3 -m json.tool 02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json >/dev/null
python3 -m json.tool 02_Biblioteca_IA_Engine/data/inbox.json >/dev/null
python3 -m json.tool 02_Biblioteca_IA_Engine/data/biblioteca_inbox_manifest_auto.json >/dev/null
```

Publicar:

```bash
git status --short
git add 02_Biblioteca_IA_Engine docs_projeto/prompts_antigravity/05_ATUALIZAR_BIBLIOTECA_FORMATOS.md
git commit -m "Atualiza Biblioteca IA por formato e origem"
git push origin main
```

## O que conferir no site

- A Biblioteca IA deve carregar os filtros de tema, formato e origem.
- Os documentos devem aparecer em repartições como Word IA, PDF, Markdown, CSV, Anki, TXT, XLS e PPTX quando existirem.
- Cada card deve permitir **Ver**, **Classificar** e **Baixar**.
- Arquivos Word, Excel e PowerPoint usam visualizador online quando a página está publicada no GitHub Pages; se o preview não abrir, o botão de download deve funcionar.
