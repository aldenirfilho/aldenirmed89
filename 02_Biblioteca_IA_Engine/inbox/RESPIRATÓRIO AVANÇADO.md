# 📄 DOCUMENTO PRONTO PARA WORD: SUPORTE RESPIRATÓRIO AVANÇADO & SIMULADOR DECISÓRIO UTI
*(Copie e cole diretamente no Word. Aplique estilos: Título 1, Título 2, Tabela com bordas, Marcadores. Use fonte Consolas/Calibri 11pt para fórmulas e tabelas.)*

---

## 🧠 1. FLUXO DECISÓRIO INTEGRADO (LÓGICA DO SIMULADOR)
| 🟢 ENTRADA | 🔵 CÁLCULO AUTOMÁTICO | 🟡 CLASSIFICAÇÃO | 🔴 CONDUTA IMEDIATA |
|:---|:---|:---|:---|
| `PaO₂`, `FiO₂`, `PEEP`, `Peso Ideal` | `P/F`, `ΔP`, `Cstat`, `PBW` | Leve/Moderado/Grave ARDS | Ajustar `FiO₂/PEEP` → `VT 6ml/kg PBW` |
| `pH`, `PaCO₂`, `FR`, `VT` | `Ventilação Alveolar (VA)`, `PaCO₂ alvo` | Hipercapnia permissiva vs. falha | ↑`FR` ou ↑`VT` (se ΔP≤15) → considerar `NMB` |
| `ROX`, `Haccona`, `FR/VT` | `Índice ROX`, `RSBI` | Sucesso VNI/CNAF vs. falha | `Pronar` (P/F<150) ou `IOT` se `ROX<3.85 (2h/12h)` |
| `Pplato`, `Ppico`, `ΔP`, `Curvas` | `Auto-PEEP`, `Work of Breathing` | Assincronia / Overdistensão | Ajustar `Trigger/Flow/Cycle` → `Trocar modo` |

> 📌 **REGRA DE OURO SIMULADOR:** Se `ΔP > 15` OU `Pplato > 30` OU `P/F < 100` → **ESCALONAR/PRONAR/NMB**. Se `P/F > 150`, `FiO₂ ≤ 0.4`, `PEEP ≤ 8`, `RSBI < 105` → **DESMAME/SBT**.

---

## 📊 2. PAINEL GASOMÉTRICO & VENTILATÓRIO (INPUTS + OUTPUTS)
### 🔹 DADOS CLÍNICOS & GASOMÉTRICOS
| Parâmetro | Valor Inserido | Referência | Ação se Alterado |
|:---|:---|:---|:---|
| `pH` | ___ | 7.35-7.45 | `<7.25` → corrigir causa/ventilação |
| `PaCO₂` | ___ | 35-45 mmHg | `↑` → ↑`FR`/↑`VT` (ΔP≤15) |
| `PaO₂` | ___ | 80-100 mmHg | `↓` → ↑`FiO₂` → ↑`PEEP` → `Pronar` |
| `HCO₃⁻` | ___ | 22-26 mEq/L | Metabólico vs. compensação |
| `BE` | ___ | -2 to +2 | Guia ressuscitação/ajuste volêmico |
| `Lactato` | ___ | <2 mmol/L | `↑` → perfusão/sepse/hipóxia tecidual |
| `SaO₂` | ___ | ≥92% (≥88% ARDS) | Alvo ARDS: `88-95%` |

### 🔹 PARÂMETROS VENTILATÓRIOS
| Parâmetro | Valor Inserido | Fórmula/Relação | Limite Seguro |
|:---|:---|:---|:---|
| `VT` | ___ ml | `6 ml/kg PBW` | `≤ 8 ml/kg` (≤6 ARDS) |
| `FiO₂` | ___ % | - | `≥ 0.6` → considerar `PEEP/Prone` |
| `PEEP` | ___ cmH₂O | `FiO₂/PEEP table` | `≤ 15-18` (monitorar hemodinâmica) |
| `ΔP` | ___ cmH₂O | `Pplato - PEEP` | `≤ 15 cmH₂O` ⚠️ |
| `FR` | ___ rpm | - | `12-35` (ajustar PaCO₂) |
| `P insp / Ppico` | ___ | Pressão pico | `≤ 35-40` |
| `Pplato` | ___ | Hold inspiratório 0.5-1s | `≤ 30` ⚠️ |
| `Cstat` | ___ ml/cmH₂O | `VT/(Pplato-PEEP)` | `> 40` (normal) |
| `Ti / Te / I:E` | ___ s | `Ti = 0.8-1.2s` | `I:E 1:2 a 1:3` (↑Ti se auto-PEEP) |
| `P exp` | ___ | Pressão expiratória final | `> 0` → Auto-PEEP |

---

## ⚙️ 3. FÓRMULAS ESSENCIAIS INTEGRADAS
| Componente | Fórmula | Aplicação Clínica |
|:---|:---|:---|
| **PBW** (Peso Ideal) | `Homens: 50 + 0.91×(Altura cm - 152.4)`<br>`Mulheres: 45.5 + 0.91×(Altura cm - 152.4)` | Base `VT` & `pressão` |
| **P/F Ratio** | `PaO₂ / FiO₂` | `≤300` → Lesão Pulmonar; `≤200` → ARDS |
| **Driving Pressure (ΔP)** | `Pplato - PEEP` | `>15` → ↑mortalidade (Amato et al.) |
| **Complacência Estática** | `Cstat = VT / (Pplato - PEEP)` | `↓` → fibrose/edema/atelectasia |
| **Índice ROX** | `(SpO₂/FiO₂) / FR` | `≥4.88 (2h)` → sucesso CNAF; `<3.85` → falha |
| **Índice de Tobin (RSBI)** | `FR / VT(L)` | `<105` → preditor sucesso extubação |
| **Pressão Média (MAP)** | `[(Ppico-PEEP)×Ti/Ttot] + PEEP` (VCV)<br>`≈ (Pinsp+PEEP)/2` (PCV) | `↑MAP` → oxigenação (cuidado com hemodinâmica) |
| **Auto-PEEP** | `Pexp (hold exp) - PEEP setado` | `> 3-5` → obstrução/air trapping → ↑Ti/↓FR/broncodilatador |

---

## 🛡️ 4. PROTOCOLO VENTILAÇÃO PROTETORA & ARDS (BERLIN + SCCM/AMIB)
| Etapa | Conduta | Limite/Alvo | Ação Imediata |
|:---|:---|:---|:---|
| **1. VT** | `6 ml/kg PBW` | `≤ 6-8` | Reduzir 1ml/kg a cada 30min até `Pplato ≤ 30` |
| **2. Pplato** | Hold 0.5-1s | `≤ 30 cmH₂O` | Se `>30` → ↓`VT` ou ↓`PEEP` |
| **3. ΔP** | Monitorar | `≤ 15 cmH₂O` | Se `>15` → ↓`VT` ou ↑`PEEP` (se recrutável) |
| **4. Oxigenação** | `PaO₂ 55-80` / `SpO₂ 88-95%` | - | `FiO₂ ≥ 0.6` → ↑`PEEP` → `Tabela ARDSNet` |
| **5. CO₂** | Permissiva | `pH ≥ 7.20` | Se `<7.20` → ↑`FR` ou ↑`VT` (respeitar ΔP) |
| **6. Prone** | `P/F < 150` ou `ΔP > 15` | `≥ 16h/dia` | Sedação profunda + NMB se necessário |
| **7. Bloqueio** | `NMB` | `≤ 48h` | Indicada: `ΔP>15`, assincronia grave, `PaO₂/FiO₂<150` |

> 📈 **TABELA ARDSNet FiO₂/PEEP (High PEEP Strategy)**
> | FiO₂ | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0 |
> | PEEP | 5 | 8 | 10 | 12 | 14 | 16 | 18 | 20-24 |

---

## 📉 5. ALGORITMO ESCALONAMENTO / DESMAME
### 🔼 ESCALONAR SUPORTE SE:
- `P/F < 100` → `Prone` + `NMB` + `PEEP otimizado`
- `ΔP > 15` → ↓`VT`, ↑`PEEP` (se recrutável), `Prone`
- `ROX < 3.85 (12h)` ou `Haccona ↓` → `IOT + VM`
- `Auto-PEEP > 5` + `assincronia` → ↑`Ti`, ↓`FR`, `broncodilatador`, `PCV/PSV`

### 🔽 DESMAME / SBT SE:
- `P/F ≥ 150-200`, `FiO₂ ≤ 0.4`, `PEEP ≤ 8`
- `pH ≥ 7.25`, `PaCO₂ estável`, `Hemodinâmica estável`
- `RSBI < 105`, `Cstat > 30`, `FR ≤ 35`, `NMEC adequado`
- **SBT 30-120min:** `PSV 5-8` + `PEEP 5` ou `T-piece`
- **Sucesso:** Extubar. **Falha:** Retornar suporte, investigar causa (déficit NMEC, secreção, isquemia, ansiedade, diurese inadequada).

---

## 🌪️ 6. MODOS VENTILATÓRIOS, CURVAS & ASSINCRONIAS
### 📊 TABELA DE MODOS
| Modo | Controle | Gatilho | Ciclo | Indicação |
|:---|:---|:---|:---|:---|
| `VCV (A/C)` | `VT` | Tempo/Paciente | Tempo | Padrão ARDS, controle estrito |
| `PCV (A/C)` | `Pinsp` | Tempo/Paciente | Tempo | ↑conforto, vazamentos, pediatria |
| `PSV` | - | Paciente | Fluxo | Desmame, weaning progressivo |
| `SIMV` | `VT/P` | Tempo | Tempo + Paciente | Transição, evitar hiperventilação |
| `APRV/BiLevel` | `P high / P low` | Tempo | Tempo | Recrutamento, ARDS refratário, liberação espontânea |
| `NIV (CPAP/BiPAP)` | `PEEP/ΔP` | Paciente | Fluxo/Tempo | EPOC/IC, pós-extubação, imunossuprimidos |

### 🔍 DIAGNÓSTICO DE ASSINCRONIAS (CURVAS + AÇÃO)
| Assincronia | Curva Sinal | Causa | Ação Imediata |
|:---|:---|:---|:---|
| `Esforço Ineficaz` | Deflexão pressão/fluxo sem gatilho | ↓sensibilidade, auto-PEEP, fraqueza | ↑sensibilidade, ↓PEEP, tratar obstrução |
| `Duplo Gatilho` | 2 ciclos < `Ti` | `Ti` curto, demanda alta, vazamento | ↑`Ti`, ↑`trigger flow`, verificar circuito |
| `Starvation de Fluxo` | Fluxo insuficiente vs. demanda | `Flow` baixo, `VT` alto, ansiedade | ↑`Flow` (PCV), trocar para `PSV`, sedar |
| `Auto-PEEP / Air Trapping` | `Pexp > 0`, `Pplato↑` | `TE` curto, DPOC, `FR` alta | ↑`Ti`, ↓`FR`, broncodilatador, ↑`trigger delay` |
| `Reverse Triggering` | Inspiração pós-ciclo (diafragma ativo) | `Ti` longo, `PEEP` alto, neurogênico | ↓`Ti`, ↓`PEEP`, `NMB` se grave, `PSV` |
| `Microssincronia` | Oscilações pressão/fluxo | `Trigger` sensível, vazamento, secreção | Ajustar `trigger`, `cuff`, `assepsia`, `PSV` |

> 🖼️ **SUGESTÃO DE IMAGEM:** Inserir no Word: `Figura 1 – Curvas Pressão-Volume e Fluxo-Tempo com marcadores de assincronias`. Use setas vermelhas para gatilho falho e amarelas para auto-PEEP.

---

## 📋 7. PAINEL EXTRA RÁPIDO (REFERÊNCIA CLÍNICA)
### 🔹 CÁLCULO PBW & VT
| Altura (cm) | PBW (M) | PBW (F) | VT 6ml/kg |
|:---|:---|:---|:---|
| 160 | 57.3 | 52.4 | 344 / 314 ml |
| 170 | 66.4 | 61.5 | 398 / 369 ml |
| 180 | 75.5 | 70.6 | 453 / 424 ml |
| 190 | 84.6 | 79.7 | 508 / 478 ml |

### 🔹 ALVOS & LIMITES CRÍTICOS
| Parâmetro | Normal | Alerta | Crítico |
|:---|:---|:---|:---|
| `Pplato` | ≤30 | 30-32 | >32 |
| `ΔP` | ≤15 | 15-18 | >18 |
| `Cstat` | 40-60 | 30-40 | <30 |
| `ROX (2h)` | ≥4.88 | 3.85-4.88 | <3.85 |
| `RSBI` | <105 | 105-120 | >120 |
| `PaO₂/FiO₂` | >300 | 200-300 | <100 |

### 🔹 MEDICAÇÕES UTI (BOLOS/INFUSÃO)
| Fármaco | Dose Inicial | Titulação | Observação |
|:---|:---|:---|:---|
| `Fentanil` | 25-50 mcg | 1-3 mcg/kg/h | Analgesia first |
| `Midazolam` | 1-2 mg | 0.02-0.1 mg/kg/h | Acúmulo >48h |
| `Propofol` | 0.5 mg/kg | 1-4 mg/kg/h | Monitorar triglicérides |
| `Cisatracúrio` | 0.1-0.2 mg/kg | 1-3 mcg/kg/min | TOF monitor, ≤48h |

---

## 🤖 8. COMO TRANSFORMAR EM SIMULADOR INTERATIVO (WORD/EXCEL)
1. 📊 **Crie uma planilha Excel** com abas: `Inputs`, `Cálculos`, `Decisões`, `Curvas/Assincronias`
2. 🔢 **Insira fórmulas**: `=SE(P_F<100;"PRONAR/NMB";"MANUTENÇÃO")`, `=SE(ΔP>15;"REDUZIR VT/↑PEEP";"OK")`
3. 🎨 **Formatação Condicional**: Vermelho se `Pplato>30` ou `ΔP>15`, Amarelo se `ROX<4.88`, Verde se `RSBI<105`
4. 📥 **VBA/Macro (Opcional)**: Botão `GERAR CONDUTA` que retorna texto pronto para prontuário
5. 📄 **No Word**: Use `Campos de Formulário` → `Caixa de Texto` + `Caixa de Seleção` → `Proteger Documento (só preenchimento)`
6. ✅ **Validação**: Compare com `PROVENTS`, `ARDSNet`, `SCCM 2023`, `AMIB 2024`

---

## 🔬 9. CURIOSIDADES NERDS & PROFUNDAMENTO
- 🤓 **Física do ΔP**: `ΔP = VT / Cstat`. Mortalidade ↑ 3% por cmH₂O acima de 15 (Amato NEJM 2015).
- 🌍 **História**: Dr. William Sweet (1950) popularizou o "tanque de pulmão". ARDSNet (2000) mudou paradigma: `VT 6ml/kg` reduziu mortalidade de 40% → 31%.
- 🧠 **Neurofisiologia Ventilatória**: "Reverse triggering" é reflexo de Hering-Breuer distorcido pelo ciclo mecânico. `NMB` interrompe o arco reflexo.
- 📡 **Tecnologia Futura**: `EIT (Impedância Elétrica)` mapeia distribuição regional de VT em tempo real. IA prediz falha de desmame com 89% de acurácia (Crit Care 2023).
- 📚 **TEMI HIGH-YIELD**: `Prone positioning`, `Neuromuscular blockade`, `Driving pressure`, `Auto-PEEP`, `RSBI`, `ROX index`, `Berlin criteria`, `Lung-protective ventilation`.

---

## 📚 10. SUGESTÕES FINAIS & PRÓXIMOS PASSOS 🚀🧠💡
✅ **OPÇÃO 1:** Gerar versão `.docx` formatada com campos editáveis, macros de decisão e tabelas coloridas  
✅ **OPÇÃO 2:** Converter para `.xlsx` com fórmulas automáticas, formatação condicional e dashboard interativo  
✅ **OPÇÃO 3:** Criar aplicativo `PowerApps`/`Notion` sincronizado com prontuário eletrônico (via API FHIR)  
✅ **OPÇÃO 4:** Desenvolver checklist de `Extubação/Prone/NMB` em formato de cartão de bolso para plantão  

🖼️ **SUGESTÃO DE IMAGENS PARA INSERIR:**
- `Curvas Pressão-Fluxo-Tempo com assincronias marcadas`
- `Tabela ARDSNet FiO₂/PEEP`
- `Fluxograma Proning Protocol (PROSEVA)`
- `Mapa de Complacência Regional (EIT conceitual)`

🔍 **SUGESTÕES DE PESQUISA & APROFUNDAMENTO:**
- 📖 `Amato MB, et al. Driving Pressure and Survival in ARDS. NEJM 2015`
- 📖 `Guérin C, et al. Prone Positioning in Severe ARDS. NEJM 2013`
- 📖 `SCCM/ESICM Guidelines on Mechanical Ventilation 2023`
- 📖 `ROX Index Validation Trials. Chest 2021 / Crit Care 2022`
- 📖 `Neuromuscular Blockade in Early ARDS. ACURASYS/ROSE trials`
- 🧠 `TEMI 2025: Temas mais cobrados em VM, ARDS, Gasometria, Assincronias`

📦 **O QUE POSSO GERAR AGORA PARA VOCÊ:**
1. 📄 Arquivo `.docx` pronto com formatação profissional, sumário automático e campos de formulário
2. 📊 Planilha `.xlsx` com fórmulas pré-configuradas, alertas visuais e dashboard de decisão
3. 🗺️ Fluxogramas em `PDF/PNG` (Proning, Desmame, Escalonamento, Assincronias)
4. 🧠 Quiz TEMI interativo (50 questões comentadas sobre VM/ARDS)
5. 📅 Planner semanal otimizado para TDAH (blocos de 25min, checklists, finanças, estudos, mãe)

👉 **Responda com o número da opção desejada.** Eu gero, estruturo e entrego em formato pronto para uso imediato. 🛡️🏥📈