# 🧠 Delirium na UTI e Enfermaria — Turbo TEMI

Módulo estático, interativo e sem dependências externas para identificação,
diagnóstico, prevenção e manejo do delirium em adultos hospitalizados.

## Arquivos

- `index.html` — conteúdo clínico essencial e interface acessível.
- `assets/styles.css` — layout responsivo, impressão e visualização clara.
- `assets/theme-bootstrap.js` — aplica a preferência global antes da renderização.
- `assets/app.js` — escalas, treino, cópia de checklists e atalhos.
- `data/catalog.js` — dados educacionais plugáveis.
- `module.manifest.json` — contrato, privacidade e gate de revisão.
- `CHECKLIST_OPERACIONAL.md` — rotinas copiáveis por sessão.

## Limites de segurança

- Nenhum dado clínico digitado nas ferramentas é persistido.
- O módulo não envia dados, não usa APIs externas e não possui telemetria.
- RASS, CAM-ICU, ICDSC e 4AT apoiam rastreio; o diagnóstico permanece clínico.
- A farmacoterapia deve seguir indicação, monitorização e protocolo local.
- O estado atual é `em-revisao-medica`, com prévia pública explicitamente marcada.

## Atualização

1. Alterar conteúdo estruturado em `data/catalog.js`.
2. Manter regras clínicas essenciais também visíveis no HTML.
3. Atualizar versão e data no manifesto e no rodapé.
4. Executar `python3 -m unittest discover -s tests -p 'test_*.py' -v`.
5. Validar em Safari macOS e viewport iOS antes de solicitar ativação clínica.
