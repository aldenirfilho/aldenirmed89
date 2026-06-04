---
tags: [pocus, hub, moc, protocolo]
eixo: POCUS
prioridade: 5
referencia: "Barros/Gallindo — Ecografia em TI e ME, Atheneu 2ª ed. 2023"
created: 2026-04-20
---

# 🔬 POCUS HUB — ULTRASSONOGRAFIA POINT-OF-CARE

> [!abstract] Referência Oficial TEMI 2026
> **Barros DS; Gallindo MAC.** *Ecografia em Terapia Intensiva e na Medicina de Emergência.*
> CMIB – Clínicas de Medicina Intensiva Brasileira. Editora Atheneu, **2ª edição, 2023.**

**Conexões:** [[HUB-PRINCIPAL]] | [[E2-Monitoracao-Suporte]] | [[E4-Insuficiencias-Organicas]] | [[E5-Neurointensivismo]]

---

## 🗺️ MAPA DE PROTOCOLOS POCUS

```
POCUS
├── 🫁 PULMONAR
│   ├── [[BLUE-Protocol]] — IRA Aguda (Lichtenstein 2008)
│   ├── [[LUS-Score]] — Desmame VM / SDRA (Mongodi 2016)
│   ├── [[PTX-USG]] — Seashore vs Barcode Sign
│   └── [[Derrame-Pleural]] — Spine Sign / Jellyfish Sign
├── 🚨 TRAUMA / eFAST
│   └── [[eFAST-Protocol]] — 10 janelas (Rozycki 1996)
├── ❤️ CARDÍACO
│   ├── [[FATE-CAUSE]] — FATE Protocol + CAUSE em PCR
│   ├── [[Tamponamento-USG]] — Colapso VD diastólico
│   ├── [[McConnell-TEP]] — VD dilatado + McConnell Sign
│   └── [[EPSS-VE]] — Função sistólica VE
├── ⚡ CHOQUE
│   └── [[RUSH-Protocol]] — PUMP + TANK + PIPES
├── 🩸 VASCULAR
│   ├── [[TVP-VCI]] — Compressão + VCI volemia
│   └── [[AAA-Pipes]] — Aneurisma Aorta Abdominal
├── 🧠 NEUROLÓGICO
│   └── [[ONSD-PIC]] — Pressão Intracraniana
├── 🫀 ABDOMINAL
│   └── [[POCUS-Abdome]] — VB + Rins + Aorta
└── 💉 PROCEDIMENTOS
    └── [[Procedimentos-USG]] — CVC / Toracocentese / Paracentese
```

---

## ⚡ CHECKLISTS DE BOLSO — POR CENÁRIO

### 🫁 DISPNEIA AGUDA → BLUE Protocol
- [ ] Pulmão anterior bilateral → Linhas A ou B? Lung sliding?
- [ ] Pulmão posterior/lateral → Derrame? Consolidação?
- [ ] Coração → FE, derrame, VD dilatado?
- [ ] VCI → Colabada ou distendida?
- [ ] Veias femorais (se suspeita TEP) → Compressão
- **Resultado:** → [[BLUE-Protocol]] para diagnóstico diferencial

### ⚡ CHOQUE → RUSH Protocol
- [ ] PUMP: Coração → Tamponamento? FE? VD dilatado?
- [ ] TANK: VCI → Colabada (<1.5cm) ou distendida (>2.1cm)?
- [ ] TANK: Pleura → PTX? Hemotórax? Linhas B?
- [ ] PIPES: Aorta >3cm? TVP femoral?
- **Resultado:** → [[RUSH-Protocol]] para tipo de choque

### 🚑 TRAUMA → eFAST
- [ ] Morrison → Líquido livre?
- [ ] Esplenorrenal → Líquido livre?
- [ ] Pelve → Coleção pélvica?
- [ ] Pericárdio → Derrame? Colapso VD?
- [ ] Pleuras → Hemotórax?
- [ ] Pulmão anterior (LINEAR) → Lung sliding? PTX?
- **Resultado:** → [[eFAST-Protocol]] para conduta

### 💔 PCR → CAUSE
- [ ] C — Tamponamento? (subxifoide)
- [ ] A — Hipotermia?
- [ ] U — PTX bilateral? (linear)
- [ ] S — Kissing walls? (hipovolemia)
- [ ] E — VD dilatado + McConnell? (TEP)
- **Janela:** < 10 segundos | **Resultado:** → [[FATE-CAUSE]]

### 🧠 PIC ELEVADA → ONSD
- [ ] Sonda linear sobre pálpebra fechada
- [ ] Medir 3mm posterior ao globo
- [ ] >5.8mm = PIC >20 mmHg → [[ONSD-PIC]]

---

## 📊 TRIALS POCUS — NÚMEROS PARA DECORAR

| Sinal / Trial | Valor Crítico | Referência |
|---------------|--------------|------------|
| Seashore Sign (sem PTX) | Sn **95%**, Sp **94%** | Lichtenstein 2008 |
| Barcode Sign (PTX) | Lung Point Sp **100%** | Kirkpatrick 2004 |
| BLUE Protocol (IRA) | Acurácia **90,5%** | Lichtenstein Chest 2008 |
| EPSS >10mm | FE **<30%** | Massie 1976 |
| McConnell Sign (TEP) | Sp **94%** | McConnell NEJM 1996 |
| VCI <1.5cm + colapso >50% | **Hipovolemia** | Feissel CCM 2004 |
| VCI >2.1cm + colapso <50% | **Congestão** | Barbier ICM 2004 |
| TVP compressão 2 pontos | Sn **95%**, Sp **96%** | Bhatt AEM 2020 |
| ONSD >5.8mm (3mm post.) | PIC >20mmHg | Dubourg ICM 2011 |
| ONSD Sn/Sp | Sn **90%**, Sp **85%** | Dubourg ICM 2011 |
| LUS Score >17 (desmame) | Falha desmame | Mongodi CC 2016 |
| FAST Trauma (Morrison) | Sn **83%**, Sp **99%** | Rozycki JACS 1996 |
| AAA USG | Sn **99%**, Sp **98%** | Rubano AEM 2013 |
| CVC guiado USG | ↓ complic. **57%** | Randolph CCM 1996 |
| Toracocentese USG | PTX **18%→3%** | Gordon Chest 2010 |

---

## 🔗 Backlinks automáticos
- [[E2-Monitoracao-Suporte#POCUS Cardíaco]]
- [[E3-Sepse-Infeccoes#Choque séptico RUSH]]
- [[E4-Insuficiencias-Organicas#TEP McConnell]]
- [[E5-Neurointensivismo#TCE ONSD]]
- [[Trials-MASTER]]
- [[Q-POCUS]]
