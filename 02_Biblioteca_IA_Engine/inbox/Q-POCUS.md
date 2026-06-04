---
tags: [questoes, pocus, banco, q-pocus]
eixo: POCUS
questoes-feitas: 0
acertos: 0
created: 2026-04-20
---
# ❓ QUESTÕES POCUS — Banco Temático

**Conexões:** [[Questoes-INDEX]] | [[POCUS-HUB]] | [[Trials-MASTER]]

> Adicionar questões usando [[Template-Erro]] | Salvar em `04-Questoes/POCUS/`

---

## 🫁 BLUE Protocol / USG Pulmonar
- Questões sobre: Seashore Sign, Barcode Sign, Lung Point, Perfis A/B/C
- Trial cobrado: [[T-Lichtenstein2008]] — acurácia 90,5%

```dataview
LIST file.link
FROM "04-Questoes/POCUS"
WHERE contains(tags, "blue-protocol") OR contains(tags, "pulmonar")
```

## ❤️ POCUS Cardíaco (FATE, CAUSE, McConnell)
```dataview
LIST file.link
FROM "04-Questoes/POCUS"
WHERE contains(tags, "fate") OR contains(tags, "mcconnell") OR contains(tags, "tamponamento")
```

## ⚡ RUSH Protocol / Choque
```dataview
LIST file.link
FROM "04-Questoes/POCUS"
WHERE contains(tags, "rush") OR contains(tags, "choque")
```

## 🩸 TVP / VCI / Vascular
```dataview
LIST file.link
FROM "04-Questoes/POCUS"
WHERE contains(tags, "tvp") OR contains(tags, "vci")
```

## 🧠 ONSD / Neurológico
```dataview
LIST file.link
FROM "04-Questoes/POCUS"
WHERE contains(tags, "onsd") OR contains(tags, "pic")
```

## 🚨 eFAST / Trauma
```dataview
LIST file.link
FROM "04-Questoes/POCUS"
WHERE contains(tags, "efast") OR contains(tags, "trauma")
```
