# Homologação — Delirium na Emergência, UTI e Enfermaria

Data: 25/07/2026

Versão avaliada: `1.1.0-rc.1`

Status clínico: `em-revisao-medica`

Status técnico: aprovado para prévia pública identificada

## Escopo homologado

- Entrada prática por cenário: emergência, UTI e enfermaria.
- Console educacional para selecionar o próximo passo sem armazenar dado clínico.
- RASS, CAM-ICU/iCAM-ICU, ICDSC e 4AT interativos.
- PRE-DELIRIC e E-PRE-DELIRIC apresentados como modelos de risco, não como
  instrumentos diagnósticos.
- Prevenção ABCDEF, ambiente, função, AVD e terapia ocupacional.
- Escada de segurança para agitação perigosa ou refratária, sem dose universal.
- Riscos de antipsicóticos, dexmedetomidina, benzodiazepínicos e propofol.
- Aba exclusiva sobre contenção física/mecânica com evidência, indicação
  excepcional, monitorização, retirada, governança e responsabilidade no Brasil.
- 15 flashcards, 13 questões, 7 casos e 7 checklists operacionais copiáveis.
- 10 infográficos autorais Turbo TEMI com texto alternativo, dimensões explícitas
  e carregamento progressivo.
- Visualização clara branca por padrão, modo espacial escuro, modo foco,
  impressão/PDF e funcionamento offline.

## Log consolidado de testes

### Suíte direcionada do módulo

Comando:

```text
python3 -m unittest tests.test_delirium_clarity -v
```

Resultado: **12/12 testes aprovados**.

Cobertura principal:

- conteúdo e limites de RASS, CAM-ICU, ICDSC e 4AT;
- cenários práticos e simuladores de decisão;
- prevenção, medidas ocupacionais e agitação refratária;
- contenção física, governança brasileira e registro;
- 10 imagens, textos alternativos e carregamento eficiente;
- CSP, privacidade local, impressão, Safari, contraste e teclado.

### Suíte integral

Comando:

```text
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

Resultado final após sincronização com a `main`: **216/216 testes aprovados em
2,576 s**.

Observação operacional: 85 cópias de conflito criadas pelo iCloud foram
temporariamente isoladas durante a regressão e restauradas ao final, sem
sobrescrita. Nenhuma delas integra a entrega.

### Catálogos, sintaxe e integridade

Comandos:

```text
node tests/validate_clinical_catalogs.js
node --check 01_Modulos_Clinicos/Delirium_UTI/assets/app.js
node --check 01_Modulos_Clinicos/Delirium_UTI/assets/theme-bootstrap.js
node --check 01_Modulos_Clinicos/Delirium_UTI/data/catalog.js
python3 -m json.tool 01_Modulos_Clinicos/Delirium_UTI/module.manifest.json
git diff --check
```

Resultados:

- catálogos clínicos validados;
- três arquivos JavaScript sem erro sintático;
- manifesto JSON válido;
- nenhuma quebra de whitespace detectada.

### Build público e portões

Comandos:

```text
python3 scripts_admin/publication_guard.py check-repository .
python3 scripts_admin/build_public_site.py . .tmp_public_delirium_v110
python3 scripts_admin/publication_guard.py check-site .tmp_public_delirium_v110
```

Resultados:

- portão do repositório aprovado;
- artefato montado com **989 arquivos e 255,7 MiB**;
- **10/10 imagens** do módulo presentes;
- **0** cópias com sufixo ` 2.*` no artefato;
- portão de privacidade aprovado.

O primeiro destino de teste fora da raiz foi recusado pelo builder, como
previsto pelo comportamento fail-closed. O workflow foi repetido em subpasta
temporária válida e concluído com sucesso.

## Homologação visual rápida — Safari

### Safari no macOS

- [x] Fundo branco nativo, sem filtro sobre texto ou imagens.
- [x] Contraste, foco visível, títulos, avisos e botões legíveis.
- [x] Sem overflow horizontal global no viewport desktop.
- [x] Abas de cenário e contenção mudaram conteúdo e `aria-selected`.
- [x] Setas, `Home`, `End`, `Tab`, `Return` e `Escape` responderam.
- [x] Console de investigação produziu orientação contextual sem persistência.
- [x] Aba jurídica exibiu responsabilidades e documentação sem prometer
      parecer jurídico individual.

Evidência:
[Safari macOS — visualização clara](assets/homologacao/delirium-safari-macos-claro-2026-07-25.jpg)

### Safari — comportamento iOS responsivo

Ambiente: Modo de Design Responsivo do Safari, viewport **390 × 844**, proporção
de pixels **2x**.

- [x] Cabeçalho compacto e botão Menu sem corte.
- [x] Menu expandiu dentro do viewport e fechou com `Escape`.
- [x] `Tab` alcançou controles interativos com foco identificável.
- [x] Hero, imagens, cards, títulos e botões permaneceram em uma coluna legível.
- [x] Tabelas viraram cartões rotulados; não dependem de rolagem horizontal.
- [x] Aba jurídica de contenção funcionou no viewport móvel.
- [x] Sem overflow horizontal visível após a correção responsiva.
- [x] Aviso de revisão clínica permaneceu visível.

Evidências:

- [Safari responsivo 390 × 844 — menu aberto](assets/homologacao/delirium-safari-ios-responsive-claro-2026-07-25.jpg)
- [Safari responsivo 390 × 844 — tabelas em cartões](assets/homologacao/delirium-safari-ios-responsive-cards-2026-07-25.jpg)

Limitação: esta etapa valida o motor/layout do Safari no modo responsivo; não
substitui homologação em iPhone físico, gesto real, VoiceOver, teclado externo
no iOS ou variações de safe area do aparelho.

## Checklist operacional por sessão

Os sete blocos prontos para copiar e colar estão em:

- [CHECKLIST_OPERACIONAL.md](../01_Modulos_Clinicos/Delirium_UTI/CHECKLIST_OPERACIONAL.md)

Sessões:

1. Emergência e triagem em 60 segundos.
2. Avaliação na UTI por turno.
3. Enfermaria e recuperação.
4. Prevenção multicomponente.
5. Agitação perigosa ou refratária.
6. Contenção física/mecânica.
7. Passagem e documentação.

## Gate antes da ativação clínica

- [ ] Revisar conteúdo com médico responsável e equipe multiprofissional.
- [ ] Confirmar periodicidade local de rastreio e documentação.
- [ ] Adaptar protocolos de sedação, abstinência, QTc e contenção.
- [ ] Revisar a aba brasileira com governança/assessoria jurídica institucional.
- [ ] Confirmar fluxos locais de EEG, neuroimagem e especialistas.
- [ ] Homologar em iPhone físico com VoiceOver quando disponível.
- [ ] Alterar o manifesto de `em-revisao-medica` para `ativo` somente após aceite
      clínico formal registrado.

Conclusão: **prévia pública tecnicamente homologada**, com conteúdo clínico e
jurídico-institucional deliberadamente mantido em revisão especializada.
