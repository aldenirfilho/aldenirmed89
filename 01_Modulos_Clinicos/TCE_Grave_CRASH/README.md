# TCE grave — Protocolo CRASH

Módulo estático e interativo para organizar ressuscitação, neuroproteção,
hipertensão intracraniana, sedação/despertar, assincronias ventilatórias,
falência respiratória grave e intoxicações associadas ao trauma.

## Arquivos

- `index.html` — conteúdo clínico essencial, algoritmos e interface acessível.
- `assets/styles.css` — layout responsivo, tema claro/escuro e impressão.
- `assets/visuals/` — dez pranchas sintéticas widescreen do atlas TC 360X.
- `assets/app.js` — filtro de assincronias, gate de despertar e cópia local.
- `data/catalog.js` — contrato público mínimo e metadados clínicos.
- `data/visual-assets.json` — registro auditável, dimensões, texto alternativo e
  SHA-256 das pranchas.
- `module.manifest.json` — publicação, privacidade, evidência e gate de revisão.
- `CHECKLIST_OPERACIONAL.md` — checklists de uso e homologação.

## Limites de segurança

- “CRASH” é um mnemônico autoral, não um escore validado.
- O módulo diferencia o mnemônico dos ensaios CRASH e CRASH-3.
- Nenhum dado clínico digitado é salvo ou transmitido.
- Doses exibidas são referências ENLS e exigem dupla checagem local.
- O gate interativo não autoriza teste de despertar; apenas expõe pré-condições.
- Toda prancha é sintética, não deriva de paciente e não serve para diagnóstico.
- O registro visual entra no aquecimento offline; os JPEGs são carregados sob demanda
  e passam ao cache local após a primeira visualização, evitando instalação inicial pesada.
- O estado é `em-revisao-medica` com `public-preview`; a versão pode circular
  como prévia educacional, mas não é protocolo assistencial homologado.
- A homologação multiprofissional documentada continua obrigatória antes de
  mudar o módulo para `ativo`.
- ATLS/ACLS, neurocirurgia e protocolos institucionais prevalecem.

## Validação

```bash
python3 -m unittest tests.test_tce_crash_module -v
node --check 01_Modulos_Clinicos/TCE_Grave_CRASH/assets/app.js
node --check 01_Modulos_Clinicos/TCE_Grave_CRASH/data/catalog.js
python3 scripts_admin/validate_mapa_vivo.py data/connections.json
```

Antes de mudar o status para `ativo`, cumprir integralmente o `reviewGate` do
manifesto e registrar a homologação clínica.
