# Inbox — Biblioteca IA

Use esta pasta para documentos novos que ainda precisam de triagem, tema, resumo ou revisão antes de entrar no acervo curado.

## O que colocar aqui

- PDFs, DOC/DOCX, planilhas, CSV/TSV, Markdown, TXT, HTML e slides recebidos para avaliação.
- Materiais clínicos ainda sem tema definitivo.
- Arquivos que precisam de revisão de privacidade, fonte, validade científica ou utilidade TEMI/plantão.

## Quando não usar o inbox

Se o conteúdo já estiver curado e o tema estiver claro, coloque diretamente em:

```text
02_Biblioteca_IA_Engine/acervo/<tema>/
```

Exemplos de temas: `uti-geral`, `sepse-choque`, `vm-sdra`, `nefro-aki-trs`, `infectologia`, `neuro-uti`, `cardio-hemodinamica`, `pocus-usg`, `temi-prova`.

## Atualizar catálogo

Na raiz do repositório:

```bash
bash scripts_admin/atualizar_tudo.sh
```

Ou apenas a Biblioteca:

```bash
cd 02_Biblioteca_IA_Engine
bash scan_inbox.sh
```

Antes de publicar, valide:

```bash
python3 scripts_admin/check_static_manifests.py
python3 scripts_admin/validar_paths.py --check
```

## Regras de segurança

- Nunca inserir dados identificáveis de pacientes.
- Preferir nomes sem `:` e sem caracteres especiais.
- Não apagar arquivos do acervo sem revisão manual.
- Conteúdo educacional: não substitui julgamento clínico nem protocolo institucional.
