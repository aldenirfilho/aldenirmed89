# 🩸 Hematologia Crítica — Emergências & Diagnósticos Difíceis

Mini-plataforma estática, offline e plugável do Antigravity Consultas. Foi
desenhada para quatro usos:

1. **Plantão 60 s:** reconhecer síndromes tempo-dependentes e lembrar as
   primeiras ações que não podem atrasar.
2. **Diagnóstico difícil:** comparar mecanismos antes de fixar um rótulo.
3. **Produtos didáticos:** conceitos, mnemônicos, alertas e Score Lab com
   PLASMIC, 4Ts e ISTH CIVD.
4. **Turbo TEMI:** revisar com 32 flashcards, 12 casos, 12 questões e sprint.

## Estado de publicação

`em-revisao-medica` — o módulo foi implementado e pode ser validado localmente,
mas o conteúdo clínico precisa da revisão do Dr. Aldenir antes de ser publicado.

## Arquitetura plugável

- `index.html`: estrutura sem conteúdo clínico duplicado.
- `assets/styles.css`: identidade visual, responsividade e impressão.
- `assets/app.js`: renderização, busca, filtros e interações.
- `data/catalog.js`: única fonte de cards, trilhas, conceitos, mnemônicos,
  alertas, scores, questões, casos, flashcards e referências.
- `module.manifest.json`: contrato de integração, privacidade e gate clínico.

Para adicionar uma doença, acrescente um objeto em `emergencies` dentro de
`data/catalog.js`. A interface renderiza o novo item automaticamente.

## Privacidade e segurança

- Nenhuma chamada de rede.
- Nenhuma telemetria.
- Nenhum cadastro ou campo para dados de pacientes.
- O `localStorage` guarda apenas preferência de tema, progresso educacional e
  sprint de foco.
- Não há cálculo ou recomendação individual de dose.

## Checklist de homologação médica

- [ ] PTT/MAT e uso do PLASMIC.
- [ ] HLH/MAS e limites de HScore/HLH-2004.
- [ ] LPA/CIVD, leucostase e lise tumoral.
- [ ] HIT, hemofilia adquirida, PTI e hemólise.
- [ ] Reações transfusionais e complicações falciformes.
- [ ] Condutas dependentes da disponibilidade local.
- [ ] Linguagem das questões TEMI e das armadilhas.
- [ ] Referências e data da próxima revisão.
