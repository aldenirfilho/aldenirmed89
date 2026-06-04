---
title: "Cetoacidose Diabética na UTI — Abordagem Intensiva Completa"
slug: "cetoacidose-diabetica-uti"
category: "Endocrinologia / Medicina Intensiva / Emergência"
tags:
  - cetoacidose diabética
  - CAD
  - diabetes mellitus
  - insulinoterapia EV
  - distúrbios ácido-base
  - hipocalemia
  - anion gap
  - UTI
  - emergência endócrina
  - TEMI
  - clínica médica
status: "publicado"
visibility: "publico"
nivel: "avancado"
source_type: "conteúdo autoral didático baseado em diretrizes internacionais (ADA, Surviving Sepsis, ABEMI)"
copyright_safety: "reescrita autoral completa, sem cópia literal de fontes protegidas"
created_for: "Projeto Antigravity / UpDown / Enciclomedia Médica"
created_by: "Agente Científico-Editorial Antigravity"
fontes_verificar:
  - "ADA Standards of Care 2024 — Diabetic Ketoacidosis"
  - "Joint British Diabetes Societies — DKA Guidelines 2023"
  - "UpToDate: Diabetic ketoacidosis and hyperosmolar hyperglycemic state in adults (revisão 2023)"
  - "Kitabchi AE et al. Hyperglycemic crises in adult patients with diabetes. Diabetes Care. 2009"
links_relacionados:
  - "estado-hiperosmolar-hiperglicemico.md"
  - "disturbios-acido-base-uti.md"
  - "hipocalemia-uti.md"
  - "insulinoterapia-uti.md"
  - "protocolo-sepse-uti.md"
imagens_sugeridas:
  - "cad-algoritmo-tratamento-1080x1920.png"
  - "cad-transicao-ev-sc-infografico.png"
  - "cad-anion-gap-mapa-mental.png"
  - "cad-checklist-beira-leito.png"
data_criacao: "2025-01"
revisao_medica_pendente: true
---

# 🧠 Cetoacidose Diabética na UTI

> **Emergência metabólica com risco de morte** se mal conduzida. Dominar o protocolo é salvar vidas — e passar no TEMI.

---

## 1. 🔭 Visão Geral Rápida

A **cetoacidose diabética (CAD)** é uma das emergências endócrinas mais frequentes em UTI e emergência. Surge da deficiência absoluta (ou relativa) de insulina combinada ao excesso de hormônios contrarreguladores, gerando uma tríade clássica: **hiperglicemia + acidose metabólica com ânion gap elevado + cetonemia/cetonúria**.

| Item | Ponto-chave |
|---|---|
| 🎯 Quem | DM1 (clássico), DM2 sob estresse extremo, iniciantes de iSGLT2 |
| ⚡ Quando | Infecção, omissão de insulina, IAM, AVC, trauma, cirurgia |
| 🔥 Risco | Mortalidade < 1% se tratado corretamente; até 5–10% nas formas graves |
| 🧠 Mensagem central | **Repor volume → Corrigir K⁺ antes da insulina → Insulina EV → Transição segura SC** |

---

## 2. 📌 Conceitos Principais para Lembrar

> 🟥 **Nunca** iniciar insulina com K⁺ < 3,5 mEq/L — risco de arritmia fatal.

> 🟧 **A glicemia normaliza antes da acidose** — não suspenda insulina EV só porque a glicemia caiu para 200 mg/dL.

> 🟨 **Bicarbonato de sódio raramente é necessário** — usar apenas se pH < 6,9 com instabilidade hemodinâmica.

> 🟩 **Ânion gap corrigido pela albumina** — em pacientes críticos com hipoalbuminemia, o AG real pode estar mascarado.

> 🔵 **CAD euglicêmica** — existe! Jejum prolongado, iSGLT2, gestação. Não descartar CAD só porque glicemia < 250 mg/dL.

---

## 3. 📖 Definição e Contexto Clínico

### Definição diagnóstica clássica (ADA)

| Critério | CAD Leve | CAD Moderada | CAD Grave |
|---|---|---|---|
| Glicemia (mg/dL) | > 250 | > 250 | > 250 |
| pH arterial | 7,25–7,30 | 7,00–7,24 | < 7,00 |
| Bicarbonato (mEq/L) | 15–18 | 10–15 | < 10 |
| Cetonúria/cetonemia | Positiva | Positiva | Positiva |
| Ânion gap | > 10 | > 12 | > 12 |
| Estado mental | Alerta | Alerta/sonolento | Estupor/coma |

### ⚠️ CAD Euglicêmica — Armadilha Clássica

- Glicemia < 250 mg/dL mas acidose com AG elevado presente
- Causas: uso de **iSGLT2** (dapagliflozina, empagliflozina), **gestação**, **jejum prolongado**, **insuficiência hepática**
- Conduta: suspender iSGLT2, tratar como CAD convencional

### Epidemiologia no Brasil

- Incidência em ascensão com o crescimento do DM2 e uso de iSGLT2
- Principais precipitantes em nosso meio: **infecção (pneumonia, ITU)**, omissão de insulina, DM de início recente

---

## 4. 🧬 Fisiopatologia — Cascata que Você Precisa Entender

```
DEFICIÊNCIA DE INSULINA
        ↓
┌───────────────────────────────────────────┐
│  HIPERGLICEMIA          LIPÓLISE EXCESSIVA │
│  (gliconeogênese ↑     (AGL → fígado)     │
│   glicogenólise ↑)              ↓          │
│        ↓               CETOGÊNESE ↑        │
│  Diurese osmótica      (β-OH-butirato      │
│  Perda de Na⁺, K⁺, Cl⁻ acetoacetato)      │
│  Desidratação           ↓                  │
│        ↓           ACIDOSE METABÓLICA      │
│  Hipovolemia          AG elevado           │
└───────────────────────────────────────────┘
        ↓
CONSEQUÊNCIAS SISTÊMICAS:
• Hipocalemia paradoxal (K⁺ sai da célula, mas perdas urinárias maciças)
• Hiperfosfatemia inicial → hipofosfatemia no tratamento
• Pseudohiponatremia (corrigir pela glicemia)
• Alcalose metabólica concomitante (vômitos) = distúrbio misto
```

### 🔑 Ponto Crítico: Potássio no CAD

- **Entrada na UTI:** K⁺ sérico pode estar normal ou alto, mas o **K⁺ corporal total está depletado**
- Com insulina: K⁺ entra na célula → **hipocalemia grave e rápida**
- Meta: manter K⁺ entre 4,0–5,0 mEq/L durante o tratamento

### Correção do Sódio pela Glicemia

```
Na⁺ corrigido = Na⁺ medido + 1,6 × [(Glicemia - 100) / 100]
```

> 💡 Cada 100 mg/dL de glicemia acima de 100 → soma 1,6 ao Na⁺ real

---

## 5. 🩺 Quadro Clínico

| Manifestação | O que sugere | Alerta |
|---|---|---|
| Poliúria, polidipsia | CAD instalando-se | Pode ser sutil no início |
| Náuseas, vômitos, dor abdominal | Cetose + acidose | DD: abdome agudo, pancreatite (lipase pode estar elevada) |
| Respiração de Kussmaul | pH < 7,20 | Sinal de acidose grave |
| Hálito cetônico (frutado) | Cetonemia | Clássico, nem sempre presente |
| Alteração do nível de consciência | pH < 7,00 ou hiperosmolaridade | Indicação de UTI |
| Hipotensão, taquicardia | Hipovolemia grave | Expansão imediata com SF 0,9% |
| Febre | Infecção precipitante | Investigar foco infeccioso sempre |

### ⚠️ Dor abdominal na CAD

- Pode ser **consequência da cetose** (até 40% dos casos) → melhora com tratamento
- Ou pode ser a **causa da CAD** (pancreatite, apendicite, isquemia mesentérica)
- Reavalie sempre após 6–8h de tratamento; se dor persistir → investigação ativa

---

## 6. 🧪 Diagnóstico

### Suspeita Clínica

- DM conhecido + poliúria + vômitos + dor abdominal + desidratação
- Qualquer paciente diabético em mau estado geral
- Uso de iSGLT2 + mal-estar + cetose (mesmo sem hiperglicemia franca)

### Exames Iniciais Obrigatórios (Primeiros 30 minutos)

| Exame | O que buscar |
|---|---|
| Gasometria arterial | pH, PCO₂, HCO₃⁻, ânion gap |
| Glicemia capilar + sérica | Confirmar hiperglicemia |
| Eletrólitos (Na⁺, K⁺, Cl⁻) | Distúrbios antes de iniciar insulina |
| Função renal (ureia, creatinina) | Grau de disfunção e cálculo AG |
| Cetonúria (fita urinária) ou beta-OH-butirato sérico | Confirmar cetose |
| Hemograma completo | Leucocitose (pode ser estresse, não só infecção) |
| ECG | Alterações por hipocalemia ou hipercalemia |
| Urocultura, hemocultura, RX tórax | Identificar precipitante infeccioso |

### Cálculo do Ânion Gap

```
AG = Na⁺ − (Cl⁻ + HCO₃⁻)
Normal: 8–12 mEq/L

AG corrigido pela albumina (pacientes críticos):
AG corrigido = AG calculado + 2,5 × (4,0 − albumina medida)
```

### Diagnóstico Diferencial Importante

| Diagnóstico | Como diferenciar | Exame útil |
|---|---|---|
| Estado hiperosmolar hiperglicêmico (EHH) | Glicemia muito alta (>600), sem cetose, osmolaridade >320, DM2 | Osmolaridade, cetonúria negativa |
| Acidose lática | AG alto, lactato > 4, sem cetose | Lactato sérico |
| Intoxicação por álcool/metanol | Histórico, osmol gap | Osmol gap, dosagem toxicológica |
| Acidose urêmica | Insuficiência renal grave prévia | Ureia, creatinina, histórico |
| CAD + outro distúrbio | Distúrbio misto — checar por delta-delta | Delta/Delta ratio |

---

## 7. ⚖️ Estratificação de Gravidade e Indicação de UTI

### Indicações de UTI/Monitorização Intensiva

- pH < 7,00
- Bicarbonato < 10 mEq/L
- Alteração do nível de consciência (Glasgow < 14)
- Hipotensão ou choque
- Insuficiência respiratória
- Arritmia grave
- Comorbidades instáveis (IAM precipitante, sepse grave)
- Idade extrema ou ausência de suporte adequado em enfermaria

### Score de Gravidade Prático

| Parâmetro | Leve | Moderado | Grave |
|---|---|---|---|
| pH | 7,25–7,30 | 7,00–7,24 | < 7,00 |
| HCO₃⁻ | 15–18 | 10–14 | < 10 |
| Consciência | Alerta | Sonolento | Estupor/coma |
| Local de tratamento | Pronto-socorro | Internação | UTI |

---

## 8. 💊 Tratamento Prático — O Protocolo que Salva Vidas

### 📋 Regra de Ouro: RICE

```
R — Reidratação vigorosa (primeiro passo)
I — Insulina EV (após K⁺ > 3,5)
C — Correção do K⁺ (antes, durante e depois)
E — Eliminar precipitante (infecção, omissão, IAM...)
```

---

### 8.1 Reidratação Venosa

| Tempo | Solução | Volume |
|---|---|---|
| 1ª hora | SF 0,9% | 1.000–1.500 mL em adultos (15–20 mL/kg) |
| 2ª–4ª hora | SF 0,9% ou 0,45% (conforme Na⁺ corrigido) | 500 mL/h |
| Após 4h | SF 0,45% + 20 mEq/L KCl | 250–500 mL/h |
| Glicemia < 250 mg/dL | Trocar para SG 5% + SF 0,45% + KCl | Manter glicemia 150–200 mg/dL |

> 💡 Se Na⁺ corrigido **alto**: usar SF 0,45%
> 💡 Se Na⁺ corrigido **normal ou baixo**: usar SF 0,9%

---

### 8.2 Reposição de Potássio — CRÍTICO 🔑

| K⁺ sérico | Conduta |
|---|---|
| < 3,3 mEq/L | ⛔ **NÃO iniciar insulina!** Repor 20–40 mEq/h KCl até K⁺ > 3,5 |
| 3,3–5,0 mEq/L | Repor 20–30 mEq KCl em cada litro de hidratação |
| > 5,0 mEq/L | Não repor; monitorar ECG e dosagem horária |

> ⚠️ Monitorar K⁺ a cada 1–2 horas nas primeiras 6h!

---

### 8.3 Insulinoterapia Endovenosa

**Preparação da bomba:**
```
Solução: 100 U de insulina regular em 100 mL de SF 0,9%
Concentração: 1 U/mL
```

**Protocolo:**

| Fase | Dose |
|---|---|
| Bolus inicial | 0,1 U/kg EV (opcional — não obrigatório nas diretrizes mais recentes) |
| Infusão contínua | 0,1 U/kg/h (dose padrão) |
| Se glicemia não cair 50–75 mg/dL/h na 1ª hora | Dobrar taxa de infusão |
| Quando glicemia < 200–250 mg/dL | Reduzir para 0,02–0,05 U/kg/h e adicionar SG 5% |

> 🎯 Meta da infusão: queda de glicemia de **50–75 mg/dL por hora**

> ⛔ **NÃO suspender** insulina EV até: pH > 7,30 + HCO₃⁻ > 18 + AG normalizado

---

### 8.4 Bicarbonato de Sódio — Usar Raramente

| Quando usar | Quando NÃO usar |
|---|---|
| pH < 6,9 + instabilidade hemodinâmica | pH entre 6,9 e 7,10 — tratar a causa |
| Hipercalemia grave ameaçadora | Rotineiramente em CAD |

**Se indicado:**
- NaHCO₃ 8,4% → 100 mEq diluídos em 400 mL água destilada + 20 mEq KCl, infundir em 2h
- Reavaliar gasometria após

---

### 8.5 Fosfato

- Repor **apenas se** fosfato < 1,0 mg/dL + fraqueza muscular, hemólise ou depressão respiratória
- Não repor rotineiramente

---

### 8.6 Transição EV → Subcutânea — O Passo que Mais Gera Erro ⚠️

**Critérios para transição (TODOS precisam estar presentes):**

```
✅ pH > 7,30
✅ Bicarbonato > 18 mEq/L
✅ Ânion gap < 12 mEq/L
✅ Paciente acordado, orientado e tolerando via oral
✅ Glicemia < 200 mg/dL (desejável)
```

**Como fazer a transição:**

```
1. Calcular dose total de insulina EV das últimas 6–8h
   → Extrapolar para 24h (dose diária total estimada = DDT)

2. Calcular insulina basal SC:
   → 50–80% da DDT como insulina basal (NPH ou análogo lento)

3. Aplicar primeira dose SC com 1–2h de sobreposição com a bomba EV
   (para evitar hiperglicemia de rebote)

4. Depois: suspender bomba EV

5. Adicionar insulina prandial (rápida ou ultrarrápida) se paciente se alimentar
```

> 🔴 **Erro fatal:** suspender insulina EV e só depois aplicar SC → gap de insulina → recidiva de CAD!

---

## 9. 🔁 Fluxograma Prático de Manejo

```
SUSPEITA DE CAD
       ↓
Gasometria + glicemia + K⁺ + cetonúria (15 min)
       ↓
┌──────────────────────────────────────┐
│ CONFIRMA DIAGNÓSTICO?                │
│ pH < 7,3 + AG > 12 + cetonúria +    │
│ glicemia > 250 (ou CAD euglicêmica) │
└──────────────────────────────────────┘
       ↓
ESTRATIFICAR GRAVIDADE
pH < 7,0 ou consciência alterada → UTI
pH 7,0–7,3 → Internação geral/HC
       ↓
REIDRATAÇÃO IMEDIATA
SF 0,9% — 1 L na 1ª hora
       ↓
CHECAR K⁺
K⁺ < 3,3 → Repor KCl, NÃO insulina ainda
K⁺ 3,3–5,0 → Repor KCl + iniciar insulina
K⁺ > 5,0 → Insulina sem KCl, monitorar
       ↓
INSULINA EV: 0,1 U/kg/h
       ↓
GLICEMIA HORÁRIA
Meta: queda 50–75 mg/dL/h
       ↓
GLICEMIA < 250 mg/dL → Adicionar SG5%
(manter glicemia 150–200; manter insulina EV)
       ↓
pH > 7,30 + HCO₃ > 18 + AG normal?
→ Avaliar transição EV → SC
       ↓
IDENTIFICAR E TRATAR PRECIPITANTE
(infecção, IAM, omissão de insulina)
       ↓
ALTA COM EDUCAÇÃO DIABETOLÓGICA
```

---

## 10. 🩺 Como Conduzir no Plantão

### ⏱️ Primeiros 5 Minutos

- [ ] Acesso venoso calibroso (16G ou mais)
- [ ] Gasometria arterial + K⁺ sérico + glicemia + cetonúria
- [ ] ECG (checar hipercalemia/hipocalemia)
- [ ] Iniciar SF 0,9% — 1 litro em 1 hora
- [ ] Monitor cardíaco contínuo

### ⏱️ Primeira Hora

- [ ] Resultado dos exames em mãos
- [ ] Decidir local (UTI vs. internação)
- [ ] Iniciar insulina EV **somente após K⁺ > 3,5**
- [ ] Solicitar culturas + RX tórax + ECG
- [ ] Identificar e tratar precipitante

### ⏱️ Primeiras 6 Horas

- [ ] Glicemia capilar a cada hora
- [ ] K⁺, gasometria e eletrólitos a cada 2–4h
- [ ] Ajustar taxa de insulina conforme meta glicêmica
- [ ] Adicionar SG 5% quando glicemia < 250 mg/dL
- [ ] Monitorar diurese (sonda vesical se grave)
- [ ] Balanço hídrico rigoroso

### 📊 Reavaliação (6–12h)

- [ ] Está atingindo critérios de resolução?
- [ ] K⁺ estável?
- [ ] Paciente acorda, orientado, tolerando VO?
- [ ] Precipitante controlado?

### ✅ Critérios de Segurança para Alta da UTI

- pH > 7,35
- HCO₃⁻ > 18 mEq/L
- AG normal (< 12)
- K⁺ estável 4,0–5,0 mEq/L
- Consciência plena
- Via oral funcionando
- Insulina SC iniciada com sobreposição adequada

---

## 11. 📌 Pontos que Caem em Prova — TEMI / R3 / Clínica Médica

- **📌 Ponto 1:** Antes de iniciar insulina, checar K⁺! Se < 3,5, repor primeiro.
- **📌 Ponto 2:** A acidose demora mais para resolver do que a hiperglicemia. Continue a insulina EV até pH > 7,30 e AG normal, mesmo se glicemia < 200.
- **📌 Ponto 3:** CAD euglicêmica existe — pensar em iSGLT2, jejum, gestação.
- **📌 Ponto 4:** Bicarbonato raramente é indicado. pH < 6,9 é o limiar.
- **📌 Ponto 5:** Transição EV→SC exige sobreposição de 1–2 horas. Suspender antes de aplicar SC = erro grave.
- **🎯 Pegadinha:** Leucocitose na CAD pode ser resposta ao estresse metabólico, não necessariamente infecção. Mas sempre investigar!
- **🎯 Pegadinha:** Lipase elevada na CAD pode ser da própria cetose, não pancreatite.
- **🎯 Conduta que muda gabarito:** Na EHH (estado hiperosmolar), não há cetose significativa — não tratar com bolus de insulina agressivo; a reidratação é o pilar principal.

---

## 12. ⚠️ Erros Comuns e Armadilhas

| Erro Comum | Por que é Perigoso | Como Evitar |
|---|---|---|
| Iniciar insulina com K⁺ < 3,3 | Hipocalemia grave → arritmia fatal, PCR | Sempre checar K⁺ antes da insulina |
| Suspender insulina EV assim que glicemia cai | Cetose persiste → recidiva | Manter até AG e pH normalizados |
| Não sobrepor SC com EV na transição | Gap de insulina → rebote hiperglicêmico | Aplicar SC 1–2h antes de suspender EV |
| Usar bicarbonato rotineiramente | Piora paradoxal (alcalose intracelular, hipocalemia, desvio da curva de O₂) | Reservar para pH < 6,9 com instabilidade |
| Não identificar o precipitante | CAD recidiva | Sempre buscar causa: infecção, IAM, omissão |
| Ignorar CAD euglicêmica em uso de iSGLT2 | Diagnóstico tardio, acidose progressiva | Pedir beta-OH-butirato mesmo com glicemia "normal" |
| Repor fosfato rotineiramente | Sem benefício comprovado, risco de hipocalcemia | Repor apenas se < 1 mg/dL sintomático |
| Não corrigir Na⁺ pela glicemia | Subestimar hiponatremia real | Usar fórmula de correção |

---

## 13. 🧩 Mnemônicos Úteis

### Mnemônico 1 — RICE (tratamento CAD)

- **R** — Reidratação vigorosa (SF 0,9%)
- **I** — Insulina EV (0,1 U/kg/h, após K⁺ > 3,5)
- **C** — Correção do Potássio (crítica e contínua)
- **E** — Eliminar o precipitante

**Como usar:** No plantão, ao ver qualquer paciente com suspeita de CAD, já pensa: RICE. São os 4 pilares do tratamento.

---

### Mnemônico 2 — KID para K⁺ na CAD

- **K** < 3,3 → **K**ora repor, não insulina
- **I** → **I**nsuline entre 3,3–5,0 (com KCl junto)
- **D** → **D**ê só insulina se > 5,0 (sem KCl, com ECG)

---

### Mnemônico 3 — RESOLUÇÃO DA CAD (critérios de resolução)

- **pH** > 7,30
- **HCO₃⁻** > 18
- **AG** < 12
- **Glic** < 200 (desejável)
- Consciência **plena**

> "**PHAG-C** — Quando PHAG-C tá ok, pode pensar em trocar a insulina."

---

### Mnemônico 4 — CAUSA (precipitantes de CAD)

- **C** — Cirurgia / trauma
- **A** — Abstenção de insulina (omissão)
- **U** — Uso de corticoide / drogas
- **S** — Sepse / infecção
- **A** — AVC / IAM / abdome agudo

---

## 14. 🃏 Flashcards

### Flashcard 1
**Frente:** Qual é a tríade diagnóstica da CAD?
**Verso:** Hiperglicemia (>250) + Acidose metabólica com AG elevado + Cetonúria/cetonemia

### Flashcard 2
**Frente:** Com K⁺ = 3,0 mEq/L, o que fazer antes de insulina?
**Verso:** Repor KCl (20–40 mEq/h) até K⁺ > 3,5 ANTES de iniciar insulina EV

### Flashcard 3
**Frente:** Quando suspender a insulina EV na CAD?
**Verso:** Quando pH > 7,30 + HCO₃⁻ > 18 + AG < 12, e após iniciar SC com sobreposição de 1–2h

### Flashcard 4
**Frente:** CAD euglicêmica — principais causas?
**Verso:** iSGLT2 (flozinas), jejum prolongado, gestação, insuficiência hepática

### Flashcard 5
**Frente:** Meta de queda glicêmica na infusão de insulina?
**Verso:** 50–75 mg/dL por hora

### Flashcard 6
**Frente:** Quando usar bicarbonato na CAD?
**Verso:** pH < 6,9 com instabilidade hemodinâmica. Não usar rotineiramente.

### Flashcard 7
**Frente:** Fórmula do Ânion Gap?
**Verso:** AG = Na⁺ − (Cl⁻ + HCO₃⁻). Normal: 8–12 mEq/L

### Flashcard 8
**Frente:** Como corrigir o sódio pela glicemia?
**Verso:** Na⁺ corrigido = Na⁺ medido + 1,6 × [(Glicemia − 100) / 100]

### Flashcard 9
**Frente:** Por que o K⁺ pode estar normal ou alto na CAD na entrada, mesmo com depleção corporal total?
**Verso:** Acidose empurra K⁺ para fora da célula (troca H⁺/K⁺). Com insulina, K⁺ volta para dentro → hipocalemia rápida.

### Flashcard 10
**Frente:** Qual é o erro mais perigoso na transição EV→SC?
**Verso:** Suspender insulina EV antes de aplicar a dose SC. A sobreposição de 1–2h é obrigatória.

### Flashcard 11
**Frente:** Diferença principal entre CAD e EHH?
**Verso:** CAD: cetose + acidose + glicemia > 250 (DM1 clássico). EHH: hiperosmolaridade > 320 + glicemia > 600 + sem cetose significativa + DM2.

### Flashcard 12
**Frente:** Qual precipitante de CAD NÃO pode ser perdido por risco de morte?
**Verso:** Infarto agudo do miocárdio (IAM silencioso) — fazer ECG em todo paciente com CAD.

---

## 15. ❓ Questões Estilo TEMI / R3

### Questão 1

Paciente masculino, 28 anos, DM1, dá entrada na UPA com poliúria, vômitos há 2 dias e dor abdominal. Gasometria: pH 7,12, HCO₃⁻ 8 mEq/L, PCO₂ 22 mmHg. K⁺ = 3,0 mEq/L. Glicemia = 420 mg/dL. Cetonúria 3+. ECG sem alterações. Qual é a conduta mais adequada?

A) Iniciar insulina regular EV 0,1 U/kg/h imediatamente
B) Administrar bicarbonato de sódio imediatamente pelo pH < 7,20
C) Repor KCl até K⁺ > 3,5 mEq/L antes de iniciar insulina EV
D) Iniciar insulina NPH SC e hidratação oral
E) Aguardar resultado de hemocultura para definir antibioticoterapia

**Gabarito: C**

**Comentário:** K⁺ = 3,0 está abaixo de 3,3 mEq/L — limiar para reposição obrigatória antes de insulina. Insulina sem correção de K⁺ neste nível pode precipitar hipocalemia grave e arritmia fatal.

**Pegadinha:** O pH de 7,12 assusta, mas não indica bicarbonato (que seria apenas para pH < 6,9 com instabilidade). A alteração que define a conduta aqui é o K⁺.

**Conceito testado:** Manejo do potássio antes da insulinoterapia na CAD.

---

### Questão 2

Paciente com CAD em tratamento há 8 horas. Glicemia atual: 195 mg/dL. pH: 7,18. HCO₃⁻: 12 mEq/L. AG: 18. O plantonista decide suspender a insulina EV. Essa conduta é:

A) Correta, pois a glicemia normalizou
B) Correta, pois já faz 8 horas de tratamento
C) Incorreta, pois a resolução da CAD exige pH > 7,30, HCO₃⁻ > 18 e AG normal
D) Incorreta, pois a insulina só pode ser suspensa após 24 horas
E) Correta se o paciente estiver assintomático

**Gabarito: C**

**Comentário:** A glicemia normaliza antes da acidose. A resolução da CAD é definida por critérios metabólicos (pH, HCO₃⁻ e AG), não pela glicemia. Suspender insulina com acidose ativa = recidiva garantida.

**Conceito testado:** Critérios de resolução da CAD.

---

### Questão 3

Mulher, 34 anos, DM2, iniciou dapagliflozina há 3 semanas. Chega ao PS com fraqueza, náuseas e mal-estar. Glicemia = 190 mg/dL. Gasometria: pH 7,15, HCO₃⁻ 9, AG = 22. Cetonúria 3+. O diagnóstico mais provável é:

A) Estado hiperosmolar hiperglicêmico
B) Acidose lática por metformina
C) Cetoacidose diabética euglicêmica por iSGLT2
D) Acidose metabólica por insuficiência renal
E) Intoxicação por salicilatos

**Gabarito: C**

**Comentário:** CAD euglicêmica em usuária de iSGLT2 (flozina). As flozinas aumentam excreção renal de glicose e promovem cetogênese — CAD pode ocorrer sem hiperglicemia significativa. AG elevado + cetonúria confirma.

**Conceito testado:** CAD euglicêmica / iSGLT2.

---

### Questão 4

Na transição da insulina EV para SC em paciente com CAD em resolução, qual é o procedimento correto?

A) Suspender EV, aguardar 4 horas e então aplicar a primeira dose SC
B) Aplicar insulina SC e suspender EV imediatamente
C) Aplicar insulina SC basal 1–2 horas antes de suspender a infusão EV
D) Usar apenas insulina rápida SC e não usar basal no primeiro dia
E) Reduzir gradualmente a infusão EV sem aplicar insulina SC

**Gabarito: C**

**Comentário:** A sobreposição de 1–2h é essencial para evitar hiperglicemia de rebote (gap de insulina). Suspender EV antes de aplicar SC é erro clássico.

**Conceito testado:** Transição EV→SC segura na CAD.

---

### Questão 5

Homem, 55 anos, DM2, dá entrada em coma. Glicemia: 780 mg/dL. pH: 7,36. HCO₃⁻: 24. AG: 10. Osmolaridade calculada: 368 mOsm/kg. Cetonúria negativa. Qual a diferença fundamental em relação à CAD que muda a conduta?

A) O paciente deve receber insulina em bolus de 0,2 U/kg imediatamente
B) Na ausência de cetose, o pilar do tratamento é a reidratação agressiva, não a insulina agressiva
C) Bicarbonato está indicado pela osmolaridade alta
D) Usar insulina NPH SC ao invés de EV
E) A mortalidade do EHH é menor que a da CAD

**Gabarito: B**

**Comentário:** Estado hiperosmolar hiperglicêmico (EHH): sem acidose, sem cetose. O tratamento é dominado pela reidratação vigorosa. Insulina é coadjuvante e em doses menores. A mortalidade do EHH é maior que a da CAD (5–20% vs < 1–5%).

**Conceito testado:** Diferenciação CAD × EHH e conduta específica.

---

## 16. 🖼️ Sugestões de Imagens Didáticas (Para Bastidor do Projeto)

| Imagem Sugerida | Objetivo | Formato |
|---|---|---|
| Fluxograma vertical de manejo CAD | Uso rápido no plantão, celular | PNG 1080×1920 |
| Algoritmo de K⁺ + insulina | Card de beira-leito | PNG 800×600 |
| Infográfico transição EV→SC | Afixar na UTI | A4 horizontal / PNG |
| Mapa mental fisiopatologia CAD | Estudo visual | PNG 1920×1080 |
| Tabela de doses de KCl × K⁺ sérico | Rápida consulta | Card PNG 600×400 |
| Timeline do tratamento (0h–24h) | Didático para residência | PNG infográfico |
| Comparativo CAD × EHH | Revisão para prova | Tabela visual |
| Dashboard HTML calculadora CAD | Interativo no site | React / HTML |

---

## 17. 🧠 Resumo Final — Conceitos Principais para Memorizar

### 1. O que é CAD
Deficiência de insulina → hiperglicemia + cetose + acidose metabólica com AG elevado. Emergência com mortalidade < 1% se bem tratada.

### 2. Pilares do Tratamento (RICE)
- **R**eidratação: SF 0,9% → 1L na 1ª hora
- **I**nsulina EV: 0,1 U/kg/h (nunca antes de corrigir K⁺)
- **C**orreção do K⁺: meta 4,0–5,0 mEq/L
- **E**liminar precipitante: infecção, IAM, omissão

### 3. A Regra do Potássio
- K⁺ < 3,3 → Primeiro KCl, depois insulina
- K⁺ 3,3–5,0 → KCl junto com insulina
- K⁺ > 5,0 → Insulina sem KCl, monitorar

### 4. Não Suspenda Insulina EV Cedo
pH > 7,30 + HCO₃⁻ > 18 + AG < 12. A glicemia melhora antes da acidose.

### 5. CAD Euglicêmica Existe
iSGLT2 (flozinas), gestação, jejum. Não deixe passar.

### 6. Transição EV→SC
Sobreposição de 1–2h obrigatória. Nunca suspender EV antes de aplicar SC.

### 7. Mensagem de Prova
> 🎯 *"Se eu tiver que lembrar de uma coisa sobre CAD, é: nunca dê insulina sem checar K⁺ primeiro, e nunca suspenda insulina EV até o AG normalizar — não até a glicemia baixar."*

---

## 📚 Referências e Fontes para Verificação

1. American Diabetes Association. Standards of Medical Care in Diabetes. Hyperglycemic Crises in Adults. *Diabetes Care*, edição mais recente.
2. Joint British Diabetes Societies Inpatient Care Group. The Management of Diabetic Ketoacidosis in Adults. 2023.
3. Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN. Hyperglycemic crises in adult patients with diabetes. *Diabetes Care*. 2009;32(7):1335–1343.
4. Umpierrez G, Korytkowski M. Diabetic emergencies — ketoacidosis, hyperglycaemic hyperosmolar state and hypoglycaemia. *Nat Rev Endocrinol*. 2016.
5. Trachtenbarg DE. Diabetic ketoacidosis. *Am Fam Physician*. 2005.

> ⚠️ **Aviso clínico:** Este conteúdo é educacional. Condutas devem ser ajustadas ao contexto clínico individual, protocolos institucionais e julgamento médico. Não substitui avaliação clínica direta.

---

*Projeto Antigravity / UpDown / Enciclomedia Médica — Conteúdo autoral didático para publicação pública.*
*Slug:* `cetoacidose-diabetica-uti`
*Pasta:* `00_INBOX_ATUALIZACAO/03_Conteudos_UpDown_MD/`
