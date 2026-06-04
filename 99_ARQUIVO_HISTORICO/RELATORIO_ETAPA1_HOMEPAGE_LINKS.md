# Etapa 1 — Auditoria e correção de links da homepage

## Escopo executado
- Verificação de links referenciados em `index.html` (raiz) e `public_site/index.html`.
- Validação de existência local dos arquivos apontados por `href` e `src`.
- Sem alteração de design, sem mover/renomear/apagar arquivos.

## Resultado
- **Nenhum link quebrado encontrado na homepage** dentro do escopo de arquivos locais.
- Todos os caminhos internos da home apontam para destinos existentes.

## Observações
- O link `questoes/index.html` está funcional e redireciona para `02_Banco_Questoes_TEMI/index.html`, preservando rota antiga.
- Como não havia links quebrados na home, **nenhuma correção de URL foi necessária** nesta etapa.

## Comandos de validação usados
```bash
python - <<'PY'
import re,os
for f in ['index.html','public_site/index.html']:
    txt=open(f,encoding='utf-8').read()
    paths=re.findall(r'(?:href|src)="([^"]+)"',txt)
    for p in paths:
        if p.startswith('http') or p.startswith('#'): 
            continue
        assert os.path.exists(os.path.join(os.path.dirname(f),p)), (f,p)
print('OK')
PY
```
