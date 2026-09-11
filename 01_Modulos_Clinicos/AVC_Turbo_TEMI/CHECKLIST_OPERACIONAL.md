# Checklist operacional — AVC agudo Turbo TEMI (edição 1.1)

## Antes de usar no plantão

- [ ] Ler a faixa de prévia: o módulo é educacional e está em revisão médica.
- [ ] Confirmar o protocolo institucional de AVC, a disponibilidade de trombolítico,
      trombectomia, reversores e nimodipino no serviço.
- [ ] Registrar dois tempos: última vez visto bem e hora da descoberta dos sintomas.
- [ ] Preencher o NIHSS item a item; usar UN só quando o manual admite barreira física.
- [ ] Tratar subtotal como subtotal; não usar soma isolada para decidir reperfusão.
- [ ] Conferir cada dose na bula e no protocolo local antes de prescrever.

## Antes de publicar uma nova edição

- [ ] Editar no pacote auditado, reconstruir (`build.py --require-images`) e rodar
      `estrutura.py`, `nihss.test.cjs`, `tools.test.cjs` e `browser.cjs`.
- [ ] Regenerar esta pasta com `scripts_admin/gerar_modulo_avc_turbo_temi.py`.
- [ ] Atualizar `module.manifest.json` (versão, data, evidência) e `data/visual-assets.json`.
- [ ] Registrar os arquivos alterados em `data/editorial/registry.json` com fontes.
- [ ] Rodar `python3 -m unittest tests.test_avc_turbo_temi_module` e os portões do CI.
- [ ] Atualizar `sw.js` (versão do cache) se arquivos do módulo mudarem.

## Homologação clínica (para mudar o status para `ativo`)

- [ ] Revisão médica assinada (neurologia vascular ou neurointensivismo).
- [ ] Figuras 03, 06 e 13 regeneradas e reinspecionadas; 12, 15, 16, 17 e 20 revistas.
- [ ] Fichas brasileiras conferidas com a farmácia e o protocolo do serviço.
- [ ] Texto integral de AHA/ASA AIS 2026, HIC 2022 e PCDT vigente reconferido.
- [ ] Teste em Safari/iOS.
- [ ] Data, versão e responsável registrados no manifesto e no registro editorial.
