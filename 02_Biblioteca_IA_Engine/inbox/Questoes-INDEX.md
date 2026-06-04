---
tags: [questoes, index, moc, banco]
created: 2026-04-20
---
# ❓ BANCO DE QUESTÕES — Índice Central

**Conexões:** [[HUB-PRINCIPAL]] | [[Caderno-Erros]] | [[Trials-MASTER]]

> [!tip] Como usar
> - Criar nova questão errada: usar [[Template-Erro]] → salvar em `04-Questoes/TEMI/` ou `POCUS/`
> - Buscar questão: `Ctrl+Shift+F` → digitar tema + tag `#questao`

---

## 📊 QUESTÕES POR EIXO

### TEMI
- [[Q-VM-SDRA]] — Ventilação Mecânica, Desmame, SDRA
- [[Q-Sepse-Choque]] — Sepse, Choque Séptico, SSC 2021
- [[Q-Cardio]] — Cardiologia Intensiva, IAM, IC
- [[Q-Neuro]] — Neurointensivismo, AVC, TCE, ME
- [[Q-Nefro]] — Nefrologia Crítica, IRA, CRRT
- [[Q-Farmaco]] — Farmacologia, Vasoativos, Sedação
- [[Q-Etica]] — Ética, Cuidados Paliativos, CFM
- [[Q-Bioestat]] — Bioestatística, Metodologia, Sn/Sp
- [[Q-Nutricao]] — Nutrição, PADIS, Glicemia
- [[Q-Obstetrica]] — Obstetrícia Crítica

### POCUS
- [[Q-POCUS]] — Todas as questões de POCUS/USG

---

## 📈 PROGRESSO GERAL

```dataview
TABLE questoes-feitas AS "Feitas", acertos AS "Acertos", percentual AS "%"
FROM "04-Questoes"
WHERE file.name != "Questoes-INDEX"
```

---

## 🔴 QUESTÕES PARA REVISAR

```dataview
LIST file.link
FROM "04-Questoes"
WHERE revisado = false AND acertou = false
SORT data-erro DESC
LIMIT 10
```
