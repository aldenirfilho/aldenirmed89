# Semiologia Cardiovascular · versão 1.0

Curso autossuficiente com 16 lições, 12 síndromes, 25 simulações sonoras originais, 5 gravações clínicas licenciadas, 20 casos com todas as alternativas comentadas, 49 flashcards e roteiro de prática de 18 etapas.

O player oferece reprodução explícita, comparação A/B, repetição, velocidade e forma de onda. A onda mostra amplitude relativa; não é ECG nem classificação diagnóstica. Velocidades reduzidas alteram o timbre. Manobras mostram tendências textuais, sem simular respostas individuais de pacientes. O treino auditivo avalia categorias temporais em exemplos didáticos.

## Fontes e limitações

Os arquivos `data/lessons.json`, `sounds.json`, `syndromes.json`, `cases.json` e `sources.json` contêm redação original e referências rastreáveis. Foram consultadas fontes de semiotécnica e diretrizes ESC/EACTS 2025, ESC 2025/2023 e AHA/ACC 2024. Recomendações terapêuticas históricas dos textos clássicos não foram importadas.

**Revisão formal por docente/cardiologista pendente.** Síntese educacional não homologada como protocolo assistencial. Sons digitais não estabelecem gravidade, inocência de sopro ou competência clínica. Não há prescrição automática.

## Áudios e direitos

As simulações são síntese determinística original de tons e ruído filtrado. Não são gravações de pessoas nem modelo acústico validado. O som normal nesta edição é simulado. As cinco gravações reais provêm de coleção pediátrica publicada; ver `AUDIO_LICENSES.md` e `data/recordings.json`.

## Manutenção

Na raiz do repositório:

```sh
python3 scripts_admin/build_cardiovascular_audio.py
python3 scripts_admin/build_cardiovascular_course.py
python3 -m unittest discover -s tests -p 'test_semiologia_cardiovascular.py'
```

A fonte de edição é JSON + gerador. O gerador produz HTML legível mesmo sem JavaScript e `data/course.js` para atividades interativas. A síntese gera somente os 25 WAV originais; preserva as cinco gravações clínicas e documenta hashes no manifesto.

Ao mudar arquivos publicados, atualizar a versão do cache em `../sw.js` e registrar proveniência editorial. O cache baixa todos os sons antes de confirmar disponibilidade offline.

Revisão espaçada: aproximadamente 1, 7, 14 e 30 dias; dificuldade retorna após 10 minutos. Progresso por navegador com exportação/importação JSON validada. São salvos apenas identificadores de conteúdo, respostas, contagens e datas de revisão. Não existe campo para dados de pacientes.

Teste interativo adicional, com Playwright e Chrome disponíveis: defina `CARDIO_BASE` para a raiz do artefato servido por HTTP e execute `node tests/browser_semiologia_cardiovascular.cjs`. O teste usa um perfil temporário, exercita todos os sons, 20 casos, importação/exportação, fila de revisão, celular e offline; salva evidências apenas na pasta temporária do sistema.
