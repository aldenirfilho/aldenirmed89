# RCP — Turbo TEMI 360°

Módulo estático educacional do AldenirMed89: PCR do adulto no meio público, emergência, enfermaria e UTI; doses, ventilação, causas reversíveis, situações especiais, cuidados pós-RCE e diferenças pediátricas.

**Edição 1.0 · 03/11/2026 · em revisão médica.** Conferência documental assistida por IA. Revisão médica humana e homologação institucional pendentes; nenhuma assinatura clínica é presumida.

- 14 capítulos, dez imagens WebP independentes, 20 questões comentadas alternativa por alternativa e 28 flashcards.
- Algoritmos AHA/ERC por ambiente, navegador de causas reversíveis e conversor de concentração da adrenalina adulta.
- Leitura por capítulo ou contínua, busca local, ampliação de imagem, tema compartilhado, texto ampliado e impressão completa.
- Interatividade inteiramente local. Somente preferências e progresso de estudo ficam no navegador. Não inserir dados de pacientes.
- O artefato publicado pode herdar métricas globais de navegação do portal; respostas clínicas e controles do módulo não são enviados.

## Fontes e autoria

A fonte canônica é `01_UpDown_Hub/content/intensiva/rcp-turbo-temi-360.md`. As questões e os cartões têm fonte editável em `data/learning.json`; `data/learning.js` e `index.html` são gerados. Fontes e limites aparecem no capítulo Referências. `data/visual-assets.json` documenta os dez recursos visuais originais assistidos por IA, com dimensões e hashes; não são exames de pacientes.

## Atualização do módulo

1. Revisar a fonte Markdown e o JSON; conferir recomendações e doses nas fontes primárias.
2. Executar `node scripts_admin/build_rcp_module.mjs` a partir da raiz, com `marked` disponível no ambiente de autoria. Alternativamente, passar `--marked-path` com o caminho do módulo ESM de `marked`.
3. Executar `python3 -m unittest discover -s tests -p 'test_rcp_turbo_temi_module.py' -v` e `node tests/browser_rcp_turbo_temi.cjs`, além dos gates editoriais e de publicação.
4. Atualizar registro editorial com autorização, fontes e estado real da revisão; nunca converter automaticamente a conferência por IA em revisão humana.

O gerador altera apenas saídas próprias deste módulo. Não remove diretórios, acervos ou versões anteriores. O rollback da publicação é feito por reversão do commit específico e novo deploy pelo fluxo oficial.
