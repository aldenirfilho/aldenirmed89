# Homologação — Delirium na UTI/Enfermaria

Data: 25/07/2026

Versão avaliada: `1.0.0-rc.1`

Status clínico: `em_revisao_medica`

Status técnico: aprovado para prévia pública identificada

## Escopo

- Módulo autossuficiente de identificação, diagnóstico diferencial, prevenção,
  tratamento e abordagem da agitação perigosa/refratária.
- RASS, CAM-ICU/iCAM-ICU, ICDSC e 4AT interativos.
- PRE-DELIRIC e E-PRE-DELIRIC apresentados como modelos de risco, não como
  testes diagnósticos.
- Bundle ABCDEF, tabelas terapêuticas, 12 flashcards, 10 questões, 5 casos e
  6 checklists operacionais copiáveis.
- Visualização clara com fundo branco, modo espacial escuro, modo foco,
  impressão/PDF e uso offline.

## Testes automatizados

### Suíte direcionada

Comando:

```text
python3 -m unittest tests.test_delirium_clarity \
  tests.test_clarity_home_coverage \
  tests.test_safari_theme_fallback -v
```

Resultado: **14/14 testes aprovados**.

Cobertura principal:

- limites e interpretação de RASS, CAM-ICU, ICDSC e 4AT;
- contraindicações e limites da farmacoterapia;
- abordagem de agitação refratária sem promessas excessivas;
- CSP, privacidade local e ausência de telemetria;
- contraste, impressão branca, responsividade e teclado;
- integração com portal, manifesto, registro, grafo e fonte editorial.

### Suíte integral

Comando:

```text
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

Resultado final após sincronizar com a `main`: **190/190 testes aprovados em
1,658 s**.

Observação operacional: 85 cópias de conflito criadas pelo iCloud foram
temporariamente isoladas durante a regressão e restauradas ao final. Nenhuma
delas integra esta entrega.

### Catálogos e publicação segura

Comandos:

```text
node tests/validate_clinical_catalogs.js
python3 scripts_admin/build_public_site.py . .tmp-public-delirium-validation
python3 scripts_admin/publication_guard.py sanitize-site .tmp-public-delirium-validation
python3 scripts_admin/publication_guard.py check-site .tmp-public-delirium-validation
```

Resultados:

- catálogos clínicos validados;
- artefato montado com **962 arquivos e 232,4 MiB**;
- sanitização concluída sem remoção de registro privado;
- portão de privacidade aprovado;
- entrada pública do módulo presente no artefato.

## Homologação visual rápida — Safari

### Safari no macOS

- [x] Visualização clara ativada pelo atalho `T`.
- [x] Fundo branco nativo, sem filtro aplicado ao conteúdo.
- [x] Cabeçalho, título, botões, aviso clínico e card lateral legíveis.
- [x] Sem overflow horizontal global no viewport de desktop.
- [x] `Tab` percorreu PDF, Foco e tema com ordem previsível.
- [x] `Espaço` ativou e desativou o modo Foco.
- [x] Estados acessíveis `aria-pressed` foram atualizados.

Evidência:
[Safari macOS — modo claro](assets/homologacao/delirium-safari-macos-claro-2026-07-25.jpg)

### Safari — comportamento iOS responsivo

Ambiente: Modo de Design Responsivo do Safari, viewport **390 × 844**, proporção
de pixels **2x**.

- [x] Cabeçalho compacto e botão Menu sem corte.
- [x] Menu expandido dentro da largura do viewport.
- [x] Hero, título, texto e botões em uma coluna.
- [x] Sem overflow horizontal global visível.
- [x] Tabelas extensas permanecem em contêiner rolável próprio.
- [x] Aviso de revisão clínica permanece visível e legível.
- [x] Tema claro persistiu durante a mudança de viewport.

Evidência:
[Safari responsivo 390 × 844 — menu aberto](assets/homologacao/delirium-safari-ios-responsive-claro-2026-07-25.jpg)

Limitação: esta etapa valida o motor/layout do Safari no modo responsivo; não
substitui homologação em iPhone físico, gesto real, VoiceOver ou variações de
barra segura do aparelho.

## Checklist operacional por sessão

Os seis blocos prontos para copiar e colar estão em:

- [CHECKLIST_OPERACIONAL.md](../01_Modulos_Clinicos/Delirium_UTI/CHECKLIST_OPERACIONAL.md)

Sessões:

1. Triagem e ameaças imediatas.
2. Avaliação na UTI.
3. Avaliação na enfermaria.
4. Prevenção/ABCDEF.
5. Agitação perigosa ou refratária.
6. Passagem de plantão e reavaliação.

## Gate antes da ativação clínica

- [ ] Revisar conteúdo com médico responsável e equipe multiprofissional.
- [ ] Confirmar horários locais de rastreio e documentação.
- [ ] Adaptar protocolos de sedação, abstinência, QTc e contenção.
- [ ] Confirmar fluxos locais de EEG, neuroimagem e especialistas.
- [ ] Homologar em iPhone físico com VoiceOver quando disponível.
- [ ] Alterar o manifesto de `em_revisao_medica` para `ativo` somente após o
      aceite clínico registrado.

Conclusão: **prévia pública tecnicamente homologada**, com conteúdo clínico
deliberadamente mantido em revisão médica.
