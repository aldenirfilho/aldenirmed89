# Scripts Dataview — Fluxo por temas

## Notas P0 sem revisão
```dataview
TABLE macrotema, prioridade, status, revisao
FROM "01_Temas"
WHERE prioridade = "P0" AND (revisao = null OR revisao = "")
SORT file.name ASC
```

## Protocolos em rascunho
```dataview
TABLE protocolo, prioridade, gatilho, fonte
FROM "02_Protocolos"
WHERE status = "rascunho"
SORT prioridade ASC
```

## Casos por prioridade
```dataview
TABLE tema, prioridade, status
FROM "03_Casos_TEMI"
SORT prioridade ASC, file.name ASC
```

## Revisão de flashcards
```dataview
LIST
FROM "04_Flashcards"
WHERE contains(tags, "flashcard")
```
