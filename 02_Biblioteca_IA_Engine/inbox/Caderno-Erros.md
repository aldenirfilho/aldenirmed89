---
tags: [erros, revisao, index, caderno]
created: 2026-04-20
---

# ⚠️ CADERNO DE ERROS — Índice Central

**Conexões:** [[HUB-PRINCIPAL]] | [[Questoes-INDEX]] | [[Trials-MASTER]]

> [!danger] Como usar
> **Toda questão errada** → criar nota com [[Template-Erro]] → adicionar aqui
> **Revisar este caderno:** toda semana (domingo) + véspera de simulados

---

## 📊 RESUMO DE ERROS POR EIXO

```dataview
TABLE count(rows) AS "Total Erros", filter(rows.revisado, (r) => r = true).length AS "Revisados"
FROM "07-Erros"
GROUP BY eixo
```

| Eixo | Erros | Revisados | Link |
|------|-------|-----------|------|
| VM / SDRA / Desmame | | | |
| Sepse / Choque | | | |
| Cardiologia UTI | | | |
| Neurointensivismo | | | |
| Nefrologia / IRA | | | |
| POCUS | | | |
| Ética / Paliativo | | | |
| Bioestatística | | | |
| Farmacologia | | | |

---

## 🔴 ERROS NÃO REVISADOS (Urgente)

```dataview
LIST
FROM "07-Erros"
WHERE revisado = false
SORT data-erro ASC
```

---

## 🔁 PADRÕES DE ERRO IDENTIFICADOS

> [!warning] Meus erros mais frequentes
> - [ ] {{padrão-1: ex: confundo Sn com Sp nos trials}}
> - [ ] {{padrão-2: ex: doses de vasopressores}}
> - [ ] {{padrão-3: ex: critérios de Berlim para SDRA}}
> - [ ] Adicionar conforme identificar

---

## 📋 TODOS OS ERROS (mais recentes primeiro)

```dataview
TABLE eixo AS "Eixo", subtema AS "Subtema", data-erro AS "Data", revisado AS "✅"
FROM "07-Erros"
SORT data-erro DESC
```

---

## 🎯 ESTRATÉGIA DE REVISÃO DOS ERROS

1. **Domingo:** revisar todos os erros da semana não revisados
2. **Pré-simulado:** revisar erros do eixo do simulado
3. **Véspera da prova:** revisar os 20 erros mais recentes
4. **Padrão de erro:** se errar 2x o mesmo tema → criar flashcard Anki dedicado

---

## 🔗 Índices de Questões por Eixo
- [[Q-VM-SDRA]] — Ventilação Mecânica e SDRA
- [[Q-Sepse-Choque]] — Sepse, Choque, SSC 2021
- [[Q-Cardio]] — Cardiologia Intensiva
- [[Q-Neuro]] — Neurointensivismo
- [[Q-Nefro]] — Nefrologia e IRA
- [[Q-POCUS]] — POCUS e USG beira leito
- [[Q-Etica]] — Ética e Cuidados Paliativos
- [[Q-Bioestat]] — Bioestatística e Metodologia
