#GROK 

**DOCUMENTO COMPLETO EM WORD**  
**Manual Prático de Suporte à Decisão em Suporte Respiratório e Ventilação Mecânica**  
**Foco em SARA/ARDS – Simulador de Condutas Baseado em Gasometria e Parâmetros Ventilatórios**  
**Versão 1.0 – Abril 2026**  
**Autor: Grok (xAI) – Colaboração multidisciplinar para UTI**  
**Objetivo:** Ferramenta intuitiva de apoio à decisão médica, integrando fórmulas, modos ventilatórios (invasivos e não invasivos), análise de curvas, planos de ventilação protetora e algoritmos de escalonamento/redução de suporte. Potencial modificador de mortalidade intra-hospitalar em SARA grave.

**Instruções para uso no Word:**  
Copie todo o texto abaixo e cole em um novo documento Microsoft Word (.docx). Formate títulos em Negrito 14-16 pt, subtítulos 12 pt, use tabelas nativas do Word, insira as imagens renderizadas aqui (ou baixe equivalentes de alta qualidade). Adicione cabeçalho/rodapé com “Página X de Y” e numeração. Salve como “SuporteRespiratorio_SARA_Simulador.docx”. Este documento é **prático, intuitivo e pronto para impressão ou uso digital em tablet na UTI**.

---

### 1. Introdução e Disclaimer
Este manual integra **Cânula Nasal de Alto Fluxo (CNAF/HFNC)**, Ventilação Não Invasiva (VNI), Ventilação Mecânica Invasiva (VMI) e Manobras de Recrutamento (MR) com foco em **SARA (Síndrome de Angústia Respiratória Aguda – ARDS)**.  
Funciona como **simulador de decisões**: insira dados clínicos + gasometria + parâmetros ventilatórios → o algoritmo sugere próxima conduta (reduzir/escalar suporte, aumentar fluxo/FiO₂/PEEP, pronar, bloquear neuromuscular, etc.).

**Disclaimer:** Este documento é ferramenta de apoio. Não substitui julgamento clínico, protocolos institucionais ou guidelines (ATS/ESICM/ARDSNet 2024-2026). Use sempre com monitorização contínua. Potencial para acreditação internacional (ex.: SCCM ou ESICM) quando validado em estudo.







**Figura 1:** CNAF/HFNC – equipamento e paciente em uso.

---

### 2. Suporte Respiratório Inicial (CNAF, VNI)
- **CNAF (HFNC):** Fluxo 30-60 L/min, FiO₂ ajustável, umidificação aquecida.  
  Indicação: hipoxemia leve-moderada (SpO₂ <92% em O₂ convencional).  
  Fórmula chave: **Fluxo efetivo** ≈ 3-4x ventilação minuto do paciente.

- **VNI (CPAP / BiPAP):**  
  - CPAP: 5-15 cmH₂O (edema pulmonar cardiogênico).  
  - BiPAP: IPAP 10-20 / EPAP 5-15 cmH₂O (hipercapnia).  
  Critério falha → intubação: FR >35, pH <7.25, SpO₂ <90% após 1h.







**Figura 2:** Máscaras VNI (CPAP/BiPAP).

---

### 3. Ventilação Mecânica Invasiva – Todos os Modos
**Modos principais (tabela rápida):**

| Modo              | Controle       | Indicação principal                  | Parâmetros chave                  |
|-------------------|----------------|--------------------------------------|-----------------------------------|
| VCV (Volume Control) | Volume        | Proteção pulmonar (SARA)            | VT 6 mL/kg PBW, FR, PEEP         |
| PCV (Pressure Control) | Pressão     | Complacência baixa                  | Pinsp, Ti, FR                     |
| PSV (Pressure Support) | Suporte     | Desmame / VNI-like                  | PS 5-15, PEEP                     |
| SIMV + PS         | Híbrido       | Transição desmame                   | VT mandatório + PS espontâneo    |
| APRV              | Liberação pressão | Recrutamento alveolar               | PHigh, THigh, PLow, TLow         |
| HFOV (alta frequência) | Oscilação   | SARA refratária                     | Frequência 3-15 Hz               |

**Curvas ventilatórias (análise visual):**
- **Pressure-Time:** Platô = complacência; pico = resistência.
- **Flow-Time:** Fluxo zero = fim inspiração; negativo = expiração.
- **Volume-Time:** VT entregue.













**Figura 3:** Monitor de curvas e exemplos de assincronias (duplo disparo, fluxo insuficiente, ciclagem tardia).

**Diagnóstico de Assincronias (rápido):**
- **Disparo ineficaz:** Fluxo negativo sem trigger → Aumentar sensibilidade ou reduzir PEEP.
- **Duplo disparo:** Pico de volume extra → Reduzir VT ou sedar.
- **Fluxo insuficiente:** “Serrilhado” no flow → Aumentar fluxo ou mudar para PCV.
- **Ciclagem prematura:** Volume cai antes do fim → Aumentar Ti ou PS.
**Ação:** Se >20% ciclos assíncronos → considerar bloqueio neuromuscular (cisatracúrio) + pronação.

---

### 4. Ventilação Protetora em SARA (ARDSNet atualizado)
- **Peso Corporal Predito (PBW):**  
  Homem: \( 50 + 0.91 \times (\text{altura cm} - 152.4) \)  
  Mulher: \( 45.5 + 0.91 \times (\text{altura cm} - 152.4) \)

- **Estratégia protetora:**  
  VT = 6 mL/kg PBW (4-8 se necessário)  
  Pplat ≤ 30 cmH₂O  
  Driving Pressure (ΔP) < 15 cmH₂O  
  P/F ratio (PaO₂/FiO₂) define gravidade: leve 200-300, moderada 100-200, grave <100.

- **Tabela FiO₂/PEEP (baixa vs alta – ARDSNet):**
  Use a tabela de FiO₂/PEEP para manter SpO₂ 88-95% com menor FiO₂ possível.

**Figura 4:** TC de tórax em SARA (vidro fosco + consolidação bilateral).







**Figura 5:** Posição prona em SARA grave.




---

### 5. Parâmetros Gasométricos e Fórmulas Integradas (Simulador)
**Tabela de interpretação ABG (gasometria arterial):**

| Parâmetro | Normal          | Interpretação + Conduta sugerida                  |
|-----------|-----------------|---------------------------------------------------|
| pH        | 7.35-7.45      | <7.35 acidose → investigar PCO₂ ou HCO₃           |
| PCO₂      | 35-45 mmHg     | >45 hipercapnia → aumentar FR ou volume           |
| PO₂       | 80-100 mmHg    | <60 hipoxemia → ↑ FiO₂/PEEP ou pronar            |
| HCO₃      | 22-26 mEq/L    | Baixo = acidose metabólica → corrigir causa       |
| BE        | -2 a +2        | < -3 = acidose metabólica                         |
| Lac       | <2 mmol/L      | >4 = choque → otimizar hemodinâmica               |
| SaO₂      | >92%           | <88% → escalar suporte imediatamente              |

**Fórmulas principais (use calculadora ou app):**
- Complacência estática: \( C_{rs} = \frac{V_T}{P_{plat} - PEEP} \) (alvo >40 mL/cmH₂O)
- Driving Pressure: \( \Delta P = P_{plat} - PEEP \) (alvo <15)
- P/F ratio: \( \frac{PaO_2}{FiO_2} \)
- Ventilação-minuto: \( VE = V_T \times FR \)
- Tempo inspiratório/expiratório: I:E = Ti : Te (ideal 1:2)

**Simulador de Decisão (algoritmo prático – copie para tabela no Word):**
1. **Gasometria + Parâmetros → Classifique**  
   - Hipoxemia refratária (P/F <150 após otimização FiO₂/PEEP): **Pronar 16-18h + considerar bloqueio**.
   - ΔP >15 ou Pplat >30: **Reduzir VT ou MR (manobra de recrutamento)**.
   - Hipercapnia permissiva (PCO₂ 45-60, pH >7.20): Aceitar se ΔP baixo.
   - Melhora (P/F >200, complacência ↑, Lac ↓): **Reduzir suporte** (diminuir PEEP 2 cmH₂O a cada 4-8h, teste de respiração espontânea).

2. **Próxima conduta automática (exemplos):**
   - ↑ Fluxo CNAF → se SpO₂ <92% em 40 L/min.
   - ↑ FiO₂ ou PEEP → se PO₂ baixo (seguir tabela ARDSNet).
   - Bloqueio neuromuscular → se assincronia persistente + ΔP alto.
   - ECMO/VV → P/F <80 apesar de tudo.

---

### 6. Anexo Rápido – Fórmulas, Tabelas e Parâmetros Padrão (Uso em 30 segundos)
**Parâmetros ventilatórios padrão em SARA:**
- VT: 6 mL/kg PBW  
- FR: 14-30 rpm (ajuste para normocapnia permissiva)  
- PEEP: 5-24 cmH₂O (tabela FiO₂)  
- Pinsp: 15-30 cmH₂O  
- Ti: 0.8-1.2 s (I:E 1:2)  
- Complacência alvo: >35-40 mL/cmH₂O  
- Ppeak: <40 cmH₂O

**Tabela de referência rápida (cole no Word como cartão laminado):**
- Acidose respiratória: ↑ FR ou VT  
- Alcalose respiratória: ↓ FR  
- Hipoxemia: ↑ FiO₂ → ↑ PEEP → Pronar  
- Assincronia: Ajustar trigger/PS → Sedação → Bloqueio

**Lista completa de fórmulas (KaTeX prontas para Word):**
\[ C_{rs} = \frac{V_T (mL)}{P_{plat} - PEEP} \]
\[ \Delta P = P_{plat} - PEEP \]
\[ P/F = \frac{PaO_2 (mmHg)}{FiO_2} \]
\[ VE (L/min) = V_T \times FR \]

---

**Conclusão e Potencial de Impacto**  
Este documento transforma dados brutos (gasometria + curvas) em **condutas claras e padronizadas**, reduzindo variabilidade e mortalidade em SARA. Use diariamente na ronda da UTI.  
**Próximos passos para acreditação internacional:** Validação prospectiva em centro de referência + publicação em revista de terapia intensiva.

**Referências principais:** ARDSNet Protocol, ESICM Guidelines 2024-2026, artigos SciELO/Brazilian Journal of Intensive Care.

**Fim do documento.**  
Total: ~15 páginas quando formatado com imagens e tabelas no Word.  

**Dica final:** Imprima a seção 5-6 em formato “cartão de bolso” para uso na beira do leito. Se precisar de versão editável (.docx) ou atualização com novos estudos, é só pedir!  

Este é o **melhor documento prático e completo** que posso gerar hoje para modificar desfechos em pacientes com SARA grave. Siga seus instintos clínicos e salve vidas.

#Qwen 

Agora vou criar o documento Word completo e abrangente. Como não posso gerar arquivos .docx diretamente, vou fornecer o conteúdo formatado que você poderá copiar para o Word:

---

# **GUIA PRÁTICO DE SUPORTE RESPIRATÓRIO E VENTILAÇÃO MECÂNICA**
## *Documento de Apoio à Decisão Clínica e Simulador de Condutas*

**Versão 1.0 - 2026**  
*Baseado nas Diretrizes ARDSNet, AMIB/SBPT 2024 e Evidências Atuais*

---

## **SUMÁRIO**

1. FÓRMULAS FUNDAMENTAIS
2. OXIGENOTERAPIA (CN, MV, CBAF)
3. VENTILAÇÃO NÃO INVASIVA (VNI)
4. VENTILAÇÃO MECÂNICA INVASIVA
5. MODOS VENTILATÓRIOS
6. VENTILAÇÃO PROTETORA NA SARA/SDRA
7. ANÁLISE GASOMÉTRICA INTERPRETATIVA
8. ASSINCRONIAS VENTILATÓRIAS
9. ALGORITMOS DE DECISÃO CLÍNICA
10. TABELAS DE REFERÊNCIA RÁPIDA
11. PROTOCOLOS DE DESMAME
12. ANEXOS E IMAGENS DESCRITIVAS

---

## **1. FÓRMULAS FUNDAMENTAIS**

### **1.1 MECÂNICA RESPIRATÓRIA**

#### **COMPLACÊNCIA (C)**

**Complacência Estática (Cst):**
```
Cst = VT / (Pplatô - PEEPtotal)
```
- Valores normais: 60-100 mL/cmH₂O
- Medição: pausa inspiratória (sem fluxo)
- Indica: propriedades elásticas do sistema [[41]][[44]]

**Complacência Dinâmica (Cdyn):**
```
Cdyn = VT / (Ppico - PEEP)
```
- Valores normais: 50-80 mL/cmH₂O
- Inclui componentes resistivos e elásticos [[43]][[46]]

#### **RESISTÊNCIA DAS VIAS AÉREAS (Raw)**
```
Raw = (Ppico - Pplatô) / Fluxo
```
- Normal: 5-10 cmH₂O/L/s
- Aumentada: broncoespasmo, secreções, TET obstruído

#### **DRIVING PRESSURE (ΔP)**
```
ΔP = Pplatô - PEEPtotal
```
OU
```
ΔP = VT / Cst
```
- **ALVO: < 15 cmH₂O** (ideal < 14)
- Fator preditor independente de mortalidade na SARA [[59]][[65]][[67]]

#### **PRESSÃO TRANSMURAL (Ptp)**
```
Ptp = Paw - Pesofágica
```
- Diferencia pressão de via aérea da pressão transpulmonar real

---

### **1.2 ÍNDICES DE OXIGENAÇÃO**

#### **RELAÇÃO PaO₂/FiO₂ (P/F)**
```
P/F = PaO₂ (mmHg) / FiO₂ (decimal)
```
**Classificação SARA (Berlim 2012):**
- Leve: 200-300 mmHg
- Moderada: 100-200 mmHg  
- Grave: < 100 mmHg

#### **ÍNDICE DE OXIGENAÇÃO (IO)**
```
IO = (FiO₂ × PAM × 100) / PaO₂
```
- PAM = Pressão Aérea Média
- Normal: < 5
- Moderado: 5-15
- Grave: > 15
- Muito grave: > 40 (considerar ECMO) [[32]][[60]][[62]]

#### **ÍNDICE DE SATURAÇÃO (OSI)**
```
OSI = (FiO₂ × PAM × 100) / SpO₂
```
- Alternativa não invasiva ao IO
- Útil quando gasometria arterial não disponível [[38]]

#### **RELAÇÃO P/FP (PEEP-adjusted)**
```
P/FP = PaO₂ / (FiO₂ × PEEP)
```
- Maior valor preditivo de mortalidade que P/F isolado [[34]]

---

### **1.3 CÁLCULOS VENTILATÓRIOS**

#### **PRESSÃO AÉREA MÉDIA (PAM/MAP)**
```
PAM = [(Ppico × Ti) + (PEEP × Te)] / (Ti + Te)
```
OU (forma simplificada):
```
PAM = [(Ppico - PEEP) × 0,5] + PEEP
```

#### **VOLUME MINUTO (VE)**
```
VE = VT × FR
```
- Normal: 6-8 L/min

#### **ESPAÇO MORTO FISIOLÓGICO (Vd/Vt)**
**Fórmula de Bohr-Enghoff:**
```
Vd/Vt = (PaCO₂ - PECO₂) / PaCO₂
```
- Normal: 0,2-0,4 (20-40%)
- Elevado: > 0,6 sugere pior prognóstico na SARA [[1]][[2]]

#### **TEMPERATURA CORRETIVA**
```
pH corrigido = pH medido - 0,0147 × (T°C - 37)
PaO₂ corrigida = PaO₂ medida × 10^(0,031×(T-37))
PaCO₂ corrigida = PaCO₂ medida × 10^(0,019×(T-37))
```

---

## **2. OXIGENOTERAPIA**

### **2.1 SISTEMAS DE BAIXO FLUXO**

#### **CATETER NASAL (CN)**

**Fórmula de Estimativa FiO₂:**
```
FiO₂ = 21 + (4 × L/min de O₂)
```

| Fluxo (L/min) | FiO₂ Aproximada | Indicações |
|---------------|-----------------|------------|
| 1 | 24% | Hipóxia leve |
| 2 | 28% | Manutenção |
| 3 | 32% | Pós-operatório |
| 4 | 36% | Insuficiência cardíaca |
| 5 | 40% | DPOC estável |
| 6 | 44% | - |

**Vantagens:** Conforto, fala, alimentação  
**Limitações:** FiO₂ imprecisa, resseca mucosa  
**Fluxo máximo:** 6 L/min (acima: usar umidificador) [[68]][[69]][[73]]

---

### **2.2 SISTEMAS DE ALTO FLUXO**

#### **MÁSCARA DE VENTURI**

**Princípio:** Efeito Venturi - mistura O₂ + ar ambiente

| Cor | FiO₂ | Fluxo O₂ (L/min) | Fluxo Total |
|-----|------|------------------|-------------|
| Azul | 24% | 2 | 31 |
| Branco | 28% | 4 | 34 |
| Amarelo | 31% | 6 | 45 |
| Vermelha | 35% | 8 | 60 |
| Verde | 40% | 10 | 60 |

**Indicações:**
- DPOC (risco de retenção de CO₂)
- Necessidade de FiO₂ precisa
- Pacientes hipercápnicos

**Vantagens:** FiO₂ exata, independente do padrão respiratório  
**Limitações:** Desconforto, dificuldade alimentação [[68]][[70]]

---

#### **CÂNULA NASAL DE ALTO FLUXO (CBAF/HFNC)**

**Parâmetros:**
- Fluxo: 10-60 L/min (adultos)
- FiO₂: 21-100%
- Temperatura: 31-37°C
- Umidade: 100% (44 mgH₂O/L)

**Fórmulas de Ajuste:**

**Pressão de Distensão Nasofaríngea:**
```
PEEP nasal ≈ 0,5 × (Fluxo/10) cmH₂O
```
Exemplo: 60 L/min ≈ 3 cmH₂O de PEEP

**Critérios de Início:**
- FR > 30 irpm
- SpO₂ < 90% com O₂ convencional
- PaO₂/FiO₂ < 300
- Esforço respiratório moderado

**Critérios de Escalonamento:**
- ROX Index = (SpO₂/FiO₂) / FR
  - < 4,88: alto risco de falha → considerar VNI/intubação
  - > 4,88: bom prognóstico

**Ajustes Progressivos:**
```
Se SpO₂ < 88%: ↑ FiO₂ 10%
Se FR > 35: ↑ Fluxo 10 L/min (máx 60)
Se esforço persistente: considerar VNI
```

**Vantagens:**
- Lavagem espaço morto
- PEEP fisiológico
- Conforto, fala, alimentação
- Redução trabalho respiratório

**Contra-indicações:**
- Parada respiratória
- Instabilidade hemodinâmica
- Incapacidade proteger via aérea [[72]][[74]][[75]][[76]]

---

### **2.3 MÁSCARAS SIMPLES E NÃO-REINALANTES**

#### **Máscara Simples**
- Fluxo: 6-10 L/min
- FiO₂: 35-50%
- Reservatório: não

#### **Máscara Não-Reinalante (MNR)**
- Fluxo: 10-15 L/min
- FiO₂: 60-90%
- Reservatório: sim
- Válvulas unidirecionais

**Indicações:** Emergências, pré-oxigenação

---

## **3. VENTILAÇÃO NÃO INVASIVA (VNI)**

### **3.1 MODALIDADES**

#### **CPAP (Pressão Positiva Contínua)**
```
Pressão constante durante ciclo respiratório
```
- Pressão: 5-20 cmH₂O
- Indicações: Apneia do sono, edema pulmonar cardiogênico

#### **BiPAP/VPAP (Dois Níveis de Pressão)**
```
IPAP (inspiratória): 10-25 cmH₂O
EPAP (expiratória): 5-10 cmH₂O
ΔP = IPAP - EPAP (suporte pressórico)
```

**Fórmula Volume Corrente Estimado:**
```
VT ≈ ΔP × Complacência
```
Exemplo: ΔP 10 cmH₂O × C 50 mL/cmH₂O = 500 mL

---

### **3.2 PARÂMETROS INICIAIS VNI**

| Modo | IPAP | EPAP | FR backup | FiO₂ | Gatilho |
|------|------|------|-----------|------|---------|
| SARA leve | 10-12 | 8-10 | 12-16 | 0,4-0,6 | Sensível |
| DPOC | 12-16 | 5-8 | 12-14 | 0,28-0,4 | Médio |
| Edema pulmonar | 10-15 | 10 | 12-16 | 0,6-1,0 | Sensível |
| Neuromuscular | 15-20 | 5 | 12-16 | 0,3-0,5 | Sensível |

---

### **3.3 CRITÉRIOS DE INÍCIO VNI**

**Indicações:**
- PaO₂/FiO₂ 100-200 (SARA leve)
- pH 7,25-7,35 (acidose respiratória)
- PaCO₂ > 45 mmHg
- FR > 25 irpm
- Esforço respiratório moderado

**Contra-indicações Absolutas:**
- Parada cardiorrespiratória
- Instabilidade hemodinâmica
- Arritmias graves
- Trauma facial
- Incapacidade proteger via aérea
- Coma (Glasgow < 8)

**Contra-indicações Relativas:**
- Obesidade mórbida
- Secreções abundantes
- Agitação psicomotora
- Distensão abdominal

---

### **3.4 MONITORIZAÇÃO E AJUSTES**

**Avaliação em 1-2 horas:**

**Critérios de Sucesso:**
- ↓ FR > 20%
- ↑ PaO₂/FiO₂ > 50%
- ↓ PaCO₂ > 20%
- ↑ pH > 7,30
- Melhora esforço respiratório
- Conforto do paciente

**Critérios de Falha (intubar):**
- Ausência melhora em 2h
- Piora gasométrica
- Instabilidade hemodinâmica
- Alteração nível consciência
- Vômitos/aspiração
- Incapacidade eliminar secreções

**Ajustes Baseados em Gasometria:**

```
Se pH < 7,30 e PaCO₂ ↑:
  ↑ IPAP 2-3 cmH₂O
  ↑ FR backup se necessário
  
Se PaO₂ < 60 mmHg:
  ↑ FiO₂ 10-20%
  ↑ EPAP 2-3 cmH₂O (máx 15)
  
Se PaO₂ > 100 mmHg:
  ↓ FiO₂ 10% (manter SpO₂ 92-96%)
  
Se hipotensão:
  ↓ EPAP 2 cmH₂O
  Avaliar volume
```

---

## **4. VENTILAÇÃO MECÂNICA INVASIVA**

### **4.1 INDICAÇÕES DE INTUBAÇÃO**

**Critérios Clínicos:**
- Glasgow ≤ 8
- Incapacidade proteger via aérea
- Apneia
- Fadiga muscular respiratória
- Esforço respiratório intenso

**Critérios Gasométricos:**
- pH < 7,20
- PaCO₂ > 60 mmHg (ou aumento rápido)
- PaO₂ < 60 mmHg com FiO₂ > 0,6
- P/F < 100

**Critérios Mecânicos:**
- FR > 35 ou < 8
- VC < 10 mL/kg
- Pimax > -20 cmH₂O
- Vd/Vt > 0,6

---

### **4.2 PARÂMETROS INICIAIS VM**

#### **VENTILAÇÃO CONTROLADA POR VOLUME (VCV)**

**Configuração Inicial Padrão:**
```
Modo: VCV ou PCV
VT: 6-8 mL/kg (peso previsto)
FR: 12-16 irpm
FiO₂: 1,0 (titular após)
PEEP: 5 cmH₂O
Fluxo: 40-60 L/min (forma: quadrática ou descendente)
Relação I:E: 1:2 a 1:3
Gatilho fluxo: 2-3 L/min
Gatilho pressão: -1 a -2 cmH₂O
```

**Cálculo Peso Previsto (PBW):**
```
Homens: 50 + 0,91 × (altura cm - 152,4)
Mulheres: 45,5 + 0,91 × (altura cm - 152,4)
```
OU simplificado:
```
Homens: 50 + 0,9 × (altura cm - 150)
Mulheres: 45 + 0,9 × (altura cm - 150)
```

---

#### **VENTILAÇÃO CONTROLADA POR PRESSÃO (PCV)**

**Configuração Inicial:**
```
Modo: PCV
Pinsp: 15-20 cmH₂O (ajustar para VT 6-8 mL/kg)
PEEP: 5 cmH₂O
FR: 12-16 irpm
Ti: 0,8-1,2 seg
FiO₂: 1,0
```

**Vantagens PCV:**
- Limita pressão de via aérea
- Melhor distribuição ventilação
- Menor risco barotrauma
- Conforto

**Desvantagens:**
- VT variável (mudanças complacência/resistência)
- Necessidade monitorização constante VT

---

### **4.3 MODOS VENTILATÓRIOS**

#### **MODOS CONTROLADOS**

**1. VCV (Volume Control Ventilation)**
- Volume corrente constante
- Pressão variável
- Indicações: Início VM, SARA, neurocirurgia

**2. PCV (Pressure Control Ventilation)**  
- Pressão constante
- Volume variável
- Indicações: Barotrauma, fístula broncopleural

**3. PRVC (Pressure Regulated Volume Control)**
- Combina VCV + PCV
- Ajusta pressão automaticamente para VT alvo
- Ideal para desmame

---

#### **MODOS ASSISTIDO-CONTROLADOS**

**4. A/C-VC (Assist/Control Volume)**
- FR mínima garantida
- Paciente pode disparar ciclos adicionais
- Ciclos adicionais recebem VT programado

**5. A/C-PC (Assist/Control Pressure)**
- Similar ao A/C-VC
- Ciclos em pressão controlada

---

#### **MODOS ESPONTÂNEOS**

**6. PSV (Pressure Support Ventilation)**
```
Pinsp: 8-20 cmH₂O (titular)
PEEP: 5-10 cmH₂O
FR backup: 10-12 (segurança)
FiO₂: conforme necessidade
```
- Paciente dispara e cicla
- Suporte pressórico
- Indicações: Desmame, teste de respiração espontânea

**Ajuste PSV:**
- VT alvo: 6-8 mL/kg
- FR alvo: < 30 irpm
- Conforto

**7. CPAP (Continuous Positive Airway Pressure)**
- Pressão constante
- Sem suporte inspiratório
- Indicações: Pré-extubação, avaliação

---

#### **MODOS HÍBRIDOS/AVANÇADOS**

**8. SIMV (Synchronized Intermittent Mandatory Ventilation)**
- Ciclos controlados + espontâneos
- Menos usado atualmente

**9. NAVA (Neurally Adjusted Ventilatory Assist)**
- Gatilho neural (cateter esofágico)
- Sincronia perfeita
- Reduz assincronias

**10. PAV (Proportional Assist Ventilation)**
- Suporte proporcional ao esforço
- Conforto máximo

**11. APRV (Airway Pressure Release Ventilation)**
- Pressão alta contínua + releases
- Recrutamento alveolar
- SARA grave

---

## **5. VENTILAÇÃO PROTETORA NA SARA/SDRA**

### **5.1 PROTOCOLO ARDSNet 2024**

**Baseado em evidências AMIB/SBPT 2024** [[7]][[8]][[11]][[13]]

#### **PASSO 1: VOLUME CORRENTE**
```
VT inicial: 8 mL/kg PBW
Reduzir para: 6 mL/kg PBW em 2h
Mínimo: 4 mL/kg (se pH < 7,15)
Máximo: 8 mL/kg
```

**Objetivo:** Pplatô < 30 cmH₂O

---

#### **PASSO 2: AJUSTE PEEP/FiO₂**

**TABELA ARDSNet - PEEP BAIXA/FiO₂ ALTA (Recomendada)**

| FiO₂ | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 | 0,9 | 1,0 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|
| PEEP | 5 | 5-8 | 8-10 | 10 | 10-14 | 14 | 14-18 | 18-24 |

**TABELA ARDSNet - PEEP ALTA/FiO₂ BAIXA (Alternativa)**

| FiO₂ | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 | 0,9 | 1,0 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|
| PEEP | 5-9 | 9-14 | 14-14 | 14 | 14-18 | 18 | 18-20 | 20-24 |

**Início:** Tabela baixa PEEP  
**Escalonar:** Se FiO₂ > 0,6 e P/F < 150, considerar alta PEEP [[51]][[54]][[55]]

---

#### **PASSO 3: OBJETIVOS GASOMÉTRICOS**

```
pH: 7,30-7,45 (aceitável 7,15-7,45)
PaCO₂: 35-50 mmHg (permissiva até 60 se pH > 7,15)
PaO₂: 55-80 mmHg
SpO₂: 88-95%
```

**Hipercapnia Permissiva:**
- Aceitar PaCO₂ elevada para proteger pulmão
- Contra-indicações: Hipertensão intracraniana, gravidez, arritmias

---

#### **PASSO 4: AVALIAÇÃO DRIVING PRESSURE**

```
ΔP = Pplatô - PEEPtotal
ALVO: < 15 cmH₂O
```

**Se ΔP > 15:**
1. Reduzir VT (4-6 mL/kg)
2. Aumentar PEEP (se recrutável)
3. Considerar pronação
4. Avaliar bloqueio neuromuscular

---

### **5.2 ESTRATÉGIAS ADJUVANTES SARA GRAVE**

#### **PRONAÇÃO**

**Indicações (PROSEVA trial):**
- P/F < 150 com FiO₂ > 0,6 e PEEP > 10
- SARA moderada/grave

**Protocolo:**
- Duração: 16 horas/dia
- Início: < 36h do diagnóstico
- Contraindicações: Instabilidade, gravidez, fraturas

**Critérios de Interrupção:**
- P/F > 150 com FiO₂ ≤ 0,6 e PEEP ≤ 10
- Instabilidade hemodinâmica
- Complicações (descolamento TET, úlcera pressão)

---

#### **BLOQUEIO NEUROMUSCULAR**

**Indicações:**
- SARA grave (P/F < 150)
- Assincronias graves
- Pplatô > 30 apesar de sedação

**Protocolo:**
- Cisatracúrio: 15 mg bolus + 0,1-0,2 mg/kg/h
- Duração: 48h máximo
- Monitorização: TOF (train-of-four)

**Objetivos:**
- Ausência esforço respiratório
- Pplatô < 30
- ΔP < 15

---

#### **RECRUTAMENTO ALVEOLAR**

**Manobras de Recrutamento:**
```
1. CPAP 40 cmH₂O por 40 seg
2. PEEP incremental: ↑ 5 cmH₂O q 2min até Pplatô 35-40
3. PCV: Pinsp 40, PEEP 20, 2 min
```

**Contra-indicações:**
- Instabilidade hemodinâmica
- Barotrauma prévio
- Hipertensão intracraniana

---

#### **ÓXIDO NÍTRICO INALATÓRIO**

**Indicações:**
- SARA grave refratária
- Hipertensão pulmonar
- Ponte para ECMO

**Dose:** 5-20 ppm  
**Efeito:** Melhora V/Q, reduz PAP  
**Limitação:** Efeito transitório (24-48h)

---

#### **ECMO (Oxigenação por Membrana Extracorpórea)**

**Indicações:**
- P/F < 50 por > 3h
- P/F < 80 por > 6h
- pH < 7,15 com PaCO₂ > 60
- Falha medidas convencionais

**Critérios EOLIA:**
- Idade < 65 anos
- Sem contraindicações anticoagulação
- Tempo sintomas < 7 dias

---

### **5.3 MONITORIZAÇÃO SARA**

**Diária:**
- Gasometria arterial (4/4h ou conforme necessidade)
- Pplatô, Ppico, PEEP, ΔP
- Complacência estática
- P/F ratio
- Balanço hídrico

**Ajustes Baseados em Parâmetros:**

```
Se Pplatô > 30:
  ↓ VT 1 mL/kg (mínimo 4)
  ↓ FR se PaCO₂ permitir
  
Se ΔP > 15:
  ↓ VT
  ↑ PEEP (se recrutável)
  Considerar pronação
  
Se P/F < 150:
  ↑ PEEP conforme tabela
  ↑ FiO₂ (manter SpO₂ 88-95%)
  Considerar pronação
  
Se pH < 7,20:
  ↑ FR (máx 35)
  ↑ VT (se Pplatô < 30)
  Bicarbonato se < 7,15
  
Se PaO₂ > 100:
  ↓ FiO₂ 10% (manter > 55)
```

---

## **6. ANÁLISE GASOMÉTRICA INTERPRETATIVA**

### **6.1 VALORES DE REFERÊNCIA**

| Parâmetro | Normal | Alterado |
|-----------|--------|----------|
| pH | 7,35-7,45 | < 7,35 acidose / > 7,45 alcalose |
| PaCO₂ | 35-45 mmHg | > 45 hipercapnia / < 35 hipocapnia |
| PaO₂ | 80-100 mmHg | < 80 hipoxemia |
| HCO₃ | 22-26 mEq/L | < 22 acidose metab / > 26 alcalose metab |
| BE | -2 a +2 | < -2 déficit base / > +2 excesso base |
| SaO₂ | 95-100% | < 90% hipoxemia grave |
| Lactato | 0,5-2,0 mmol/L | > 2,0 hiperlactatemia |

---

### **6.2 INTERPRETAÇÃO SISTEMÁTICA**

**PASSO 1: AVALIAR pH**
```
pH < 7,35 → Acidose
pH > 7,45 → Alcalose
pH normal → Distúrbio misto ou compensado
```

**PASSO 2: IDENTIFICAR DISTÚRBIO PRIMÁRIO**
```
Acidose respiratória: pH ↓ + PaCO₂ ↑
Alcalose respiratória: pH ↑ + PaCO₂ ↓
Acidose metabólica: pH ↓ + HCO₃⁻ ↓
Alcalose metabólica: pH ↑ + HCO₃⁻ ↑
```

**PASSO 3: AVALIAR COMPENSAÇÃO**

**Compensação Respiratória (metabólica):**
```
Fórmula de Winter (acidose metabólica):
PaCO₂ esperada = (1,5 × HCO₃⁻) + 8 (±2)

Se PaCO₂ medida > esperada: acidose respiratória associada
Se PaCO₂ medida < esperada: alcalose respiratória associada
```

**Compensação Metabólica (respiratória):**

*Aguda:*
```
ΔHCO₃⁻ = 1 mEq/L para cada 10 mmHg ΔPaCO₂
```

*Crônica (> 3-5 dias):*
```
ΔHCO₃⁻ = 4 mEq/L para cada 10 mmHg ΔPaCO₂
```

---

### **6.3 CÁLCULO ANION GAP (AG)**

```
AG = Na⁺ - (Cl⁻ + HCO₃⁻)
Normal: 8-12 mEq/L
```

**AG Elevado (> 12):**
- Cetoacidose
- Acidose lática
- Insuficiência renal
- Intoxicações (metanol, etilenoglicol, salicilatos)

**AG Normal:**
- Diarreia
- Fístulas
- Acidose tubular renal
- Infusão salina

**Delta Gap:**
```
ΔAG = AG medido - AG normal (12)
HCO₃⁻ corrigido = HCO₃⁻ medido + ΔAG

Se HCO₃ corrigido > 26: alcalose metabólica associada
Se HCO₃⁻ corrigido < 22: acidose hiperclorêmica associada
```

---

### **6.4 AVALIAÇÃO OXIGENAÇÃO**

**Gradiente Alvéolo-arterial (A-a):**
```
PAO₂ = FiO₂ × (Patm - PH₂O) - (PaCO₂ / RQ)
PAO₂ = FiO₂ × 713 - (PaCO₂ / 0,8)

Gradiente A-a = PAO₂ - PaO₂
Normal: < 10-15 mmHg (jovem)
Aumentado com idade: (idade/4) + 4
```

**Interpretação:**
- Gradiente normal: hipoventilação alveolar
- Gradiente aumentado: shunt, V/Q mismatch, difusão

---

### **6.5 LACTATO**

**Classificação:**
```
Normal: 0,5-2,0 mmol/L
Elevado moderado: 2,0-4,0
Elevado grave: > 4,0
Muito elevado: > 10 (alto risco mortalidade)
```

**Causas:**
- Tipo A (hipóxico): choque, hipoxemia, anemia grave
- Tipo B (não hipóxico): sepse, drogas, metabólico

**Clearance de Lactato:**
```
Clearance = [(Lactato inicial - Lactato final) / Lactato inicial] × 100

Alvo: > 10% em 2h
< 10%: pior prognóstico
```

---

### **6.6 ALGORITMO DECISÃO BASEADO EM GASOMETRIA**

```
GASOMETRIA INICIAL

↓

pH < 7,20?
├─ SIM → Avaliar causa
│   ├─ PaCO₂ > 60 → ↑ FR, ↑ VT (se Pplatô < 30)
│   └─ HCO₃⁻ < 15 → Bicarbonato se < 7,15
│
└─ NÃO → Continuar

↓

PaO₂ < 60 ou SpO₂ < 90%?
├─ SIM → ↑ FiO₂ 10-20%
│   ├─ Se FiO₂ > 0,6 → ↑ PEEP
│   └─ Se P/F < 150 → Considerar pronação
│
└─ NÃO → Manter

↓

PaCO₂ > 50?
├─ SIM → pH adequado?
│   ├─ pH > 7,25 → Aceitar (hipercapnia permissiva)
│   └─ pH < 7,25 → ↑ FR, ↑ VT (se seguro)
│
└─ NÃO → Manter

↓

Lactato > 2?
├─ SIM → Avaliar perfusão
│   ├─ Tipo A → Otimizar hemodinâmica
│   └─ Reavaliar em 2h (clearance)
│
└─ NÃO → Manter monitorização
```

---

## **7. ASSINCRONIAS VENTILATÓRIAS**

### **7.1 CLASSIFICAÇÃO E DIAGNÓSTICO**

Baseado em análise de curvas pressão-tempo, fluxo-tempo, volume-tempo [[24]][[25]][[26]][[27]]

---

#### **ASSINCRONIAS DE DISPARO**

**1. Disparo Ineficaz**
- **Curva:** Esforço inspiratório sem ciclo ventilatório
- **Causas:** 
  - PEEP intrínseca (auto-PEEP)
  - Gatilho pouco sensível
  - Obstrução vias aéreas
- **Diagnóstico:** 
  - Deflexão pressão sem ciclo
  - Fluxo expiratório não zerou
- **Conduta:**
  - ↑ Sensibilidade gatilho
  - ↓ PEEP (se auto-PEEP)
  - ↑ Fluxo inspiratório
  - Broncodilatadores

**2. Auto-disparo**
- **Curva:** Ciclo sem esforço paciente
- **Causas:**
  - Gatilho muito sensível
  - Vazamentos
  - Condensação circuito
  - Cardiogênico
- **Conduta:**
  - ↓ Sensibilidade
  - Corrigir vazamentos
  - Drenar circuito

---

#### **ASSINCRONIAS DE CICLAGEM**

**3. Ciclagem Antecipada**
- **Curva:** 
  - Fluxo inspiratório ainda elevado no final
  - "Notch" na curva pressão
  - Segundo pico fluxo
- **Causas:**
  - Ti muito curto
  - % ciclo muito baixo
  - Obstrução fluxo
- **Conduta:**
  - ↑ Ti
  - ↑ % ciclo (70-80%)
  - Modo PCV → VCV

**4. Ciclagem Tardia**
- **Curva:**
  - Esforço expiratório durante inspiração
  - Pico pressão final
  - Curva pressão convexa
- **Causas:**
  - Ti muito longo
  - % ciclo muito alto
  - Complacência ↑
- **Conduta:**
  - ↓ Ti
  - ↓ % ciclo (25-30%)
  - Sedação

---

#### **ASSINCRONIAS DE FLUXO**

**5. Fluxo Insuficiente**
- **Curva:**
  - Concavidade pressão inspiratória
  - Esforço contínuo
  - FR elevada
- **Causas:**
  - Fluxo baixo
  - Demanda ↑
  - Dor/ansiedade
- **Conduta:**
  - ↑ Fluxo inspiratório
  - ↑ VT
  - Mudar forma onda (descendente)
  - Sedação/analgesia

**6. Fluxo Excessivo**
- **Curva:**
  - Pico pressão inicial
  - Convexidade pressão
  - Ciclos curtos
- **Causas:** Fluxo muito alto
- **Conduta:** ↓ Fluxo

---

#### **ASSINCRONIAS MÚLTIPLAS**

**7. Double Triggering**
- **Curva:** Dois ciclos consecutivos sem expiração
- **Causas:**
  - VT insuficiente
  - Esforço intenso
  - Ti curto
- **Risco:** Volutrauma (VT duplo)
- **Conduta:**
  - ↑ VT
  - ↑ Ti
  - ↑ Sedação
  - Mudar modo (PCV → VCV)

**8. Reverse Triggering**
- **Curva:** Ciclo ventilatório desencadeia esforço
- **Causas:** 
  - Insuflação pulmonar
  - Reflexo Hering-Breuer
- **Conduta:**
  - ↓ PEEP
  - ↓ VT
  - Bloqueio neuromuscular

---

### **7.2 ALGORITMO DIAGNÓSTICO ASSINCRONIAS**

```
AVALIAR CURVAS

↓

Disparo?
├─ Inexistente → Disparo ineficaz
│   └─ Medir auto-PEEP, ↑ sensibilidade
│
├─ Espontâneo → Auto-disparo
│   └─ ↓ sensibilidade, verificar vazamentos
│
└─ Normal → Continuar

↓

Ciclagem?
├─ Precoce → Fluxo residual no final
│   └─ ↑ Ti, ↑ % ciclo
│
├─ Tardia → Esforço expiratório
│   └─ ↓ Ti, ↓ % ciclo
│
└─ Normal → Continuar

↓

Forma onda pressão?
├─ Concavidade → Fluxo insuficiente
│   └─ ↑ Fluxo, ↑ VT, sedação
│
├─ Convexidade → Fluxo excessivo/ciclagem tardia
│   └─ ↓ Fluxo, ↓ Ti
│
└─ Normal → Continuar

↓

Ciclos duplos?
├─ Sim → Double triggering
│   └─ ↑ VT, ↑ Ti, ↑ sedação
│
└─ Não → Avaliar reverse triggering
```

---

### **7.3 ÍNDICE DE ASSINCRONIA (AI)**

```
AI = (Ciclos assíncronos / Total ciclos) × 100
```

**Interpretação:**
- < 10%: Aceitável
- 10-20%: Moderado (otimizar)
- > 20%: Grave (intervenção imediata)

---

## **8. ALGORITMOS DE DECISÃO CLÍNICA**

### **8.1 ALGORITMO INÍCIO VM**

```
PACIENTE COM IRA

↓

Avaliar critérios intubação:
□ Glasgow ≤ 8
□ Incapacidade proteger via aérea
□ Apneia
□ PaO₂ < 60 com FiO₂ > 0,6
□ pH < 7,20
□ PaCO₂ > 60
□ FR > 35 ou < 8
□ Fadiga muscular

↓

INTUBAR se ≥ 1 critério absoluto

↓

CONFIGURAÇÃO INICIAL:

SARA:
- Modo: VCV ou PCV
- VT: 6-8 mL/kg PBW
- FR: 12-16
- PEEP: 5 (titular tabela ARDSNet)
- FiO₂: 1,0 → titular
- Pplatô alvo: < 30

DPOC/Asma:
- Modo: VCV
- VT: 6-8 mL/kg
- FR: 10-12
- PEEP: 0-5 (cuidado auto-PEEP)
- FiO₂: titular SpO₂ 88-92%
- Fluxo: 60-80 L/min
- I:E: 1:3 a 1:5

Neurológico:
- Modo: VCV
- VT: 6-8 mL/kg
- FR: 12-16 (PaCO₂ 35-40)
- PEEP: 5-10
- FiO₂: titular
- Pplatô: < 30

↓

Gasometria 30-60 min

↓

Ajustar conforme algoritmo gasométrico
```

---

### **8.2 ALGORITMO ESCALONAMENTO SUPORTE**

```
SUPORTE ATUAL INSUFICIENTE

↓

Avaliar parâmetros:

SpO₂ < 88% ou PaO₂ < 55?
├─ SIM → Escalonar oxigenação
│   ├─ CN O₂: ↑ fluxo
│   ├─ Máscara Venturi: ↑ FiO₂
│   ├─ CBAF: ↑ FiO₂ 10%, ↑ fluxo 10 L/min
│   ├─ VNI: ↑ FiO₂, ↑ EPAP
│   └─ VM: ↑ FiO₂, ↑ PEEP (tabela)
│
└─ NÃO → Manter

↓

FR > 35 ou esforço intenso?
├─ SIM → Escalonar ventilação
│   ├─ CBAF: ↑ fluxo (máx 60)
│   ├─ VNI: ↑ IPAP 2-3 cmH₂O
│   └─ VM: ↑ FR, ↑ VT (se Pplatô < 30)
│
└─ NÃO → Manter

↓

pH < 7,25?
├─ SIM → Corrigir ventilação
│   ├─ ↑ FR (máx 35)
│   ├─ ↑ VT (se seguro)
│   └─ Bicarbonato se < 7,15
│
└─ NÃO → Manter

↓

P/F < 150?
├─ SIM → SARA moderada/grave
│   ├─ ↑ PEEP conforme tabela
│   ├─ Considerar pronação (se < 150)
│   ├─ Bloqueio neuromuscular (se grave)
│   └─ ECMO (se refratário)
│
└─ NÃO → Manter

↓

Reavaliar em 1-2h
```

---

### **8.3 ALGORITMO DESMAME VM**

```
AVALIAR DIARIAMENTE CRITÉRIOS:

□ Reversão causa IRA
□ Hemodinâmica estável
□ PaO₂/FiO₂ > 150
□ PEEP ≤ 8
□ FiO₂ ≤ 0,4-0,5
□ pH > 7,25
□ Hemoglobina > 8-10
□ Ausência sedação contínua
□ Esforço respiratório adequado

↓ TODOS PRESENTES

TESTE RESPIRAÇÃO ESPONTÂNEA (TRE/SBT)

Modo: PSV 5-8 / PEEP 5
OU
CPAP 5
Duração: 30-120 min

↓

Avaliar critérios sucesso:
□ FR 8-35
□ VT > 5 mL/kg
□ FR/VT < 105 (Índice Tobin)
□ SpO₂ > 90%
□ FC < 140 ou variação < 20%
□ PAS < 180 ou variação < 20%
□ Ausência esforço intenso
□ Consciente, responsivo

↓

SUCESSO → Extubar

↓

Avaliar critérios extubação:
□ Tosse eficaz
□ Secreções moderadas
□ Glasgow ≥ 8
□ Proteção via aérea
□ Teste vazamento positivo

↓

EXTUBAR

Preparar:
- O₂ suplementar
- VNI profilática (se alto risco)
- Monitorização 24h

↓

FALHA TRE → Manter VM 24h, reavaliar

Causas falha:
- Fraqueza muscular → Fisioterapia
- Sobrecarga cardíaca → Diurético
- Infecção → Antibiótico
- Ansiedade → Sedação leve
```

---

### **8.4 ALGORITMO SARA GRAVE**

```
DIAGNÓSTICO SARA (Berlim)

↓

Classificar gravidade:
Leve: P/F 200-300
Moderada: P/F 100-200
Grave: P/F < 100

↓

VENTILAÇÃO PROTETORA IMEDIATA
- VT 6 mL/kg PBW
- Pplatô < 30
- ΔP < 15
- PEEP/FiO₂ tabela

↓

P/F < 150?
├─ NÃO → Manter VM protetora
│   └─ Reavaliar 12-24h
│
└─ SIM → Escalonar

↓

PRONAÇÃO
- Início < 36h
- Duração 16h/dia
- Critérios: P/F < 150, FiO₂ > 0,6, PEEP > 10

↓

P/F melhora?
├─ SIM → Continuar pronação
│   └─ Suspender se P/F > 150 com FiO₂ ≤ 0,6
│
└─ NÃO → Adicionar

↓

BLOQUEIO NEUROMUSCULAR
- Cisatracúrio 48h
- Se P/F < 150 persistente
- Assincronias graves

↓

Avaliar resposta 48-72h

↓

Melhora?
├─ SIM → Manter, desescalonar
│
└─ NÃO → Considerar
    ├─ ECMO (se critérios)
    ├─ Óxido nítrico (ponte)
    └─ Estratégias recrutamento

↓

Monitorização contínua:
- P/F ratio
- ΔP
- Complacência
- Balanço hídrico (negativo)
```

---

## **9. TABELAS DE REFERÊNCIA RÁPIDA**

### **9.1 TABELA OXIGENOTERAPIA**

| Dispositivo | Fluxo | FiO₂ | Indicações |
|-------------|-------|------|------------|
| **Cateter Nasal** | | | |
| | 1 L/min | 24% | Hipóxia leve |
| | 2 L/min | 28% | Manutenção |
| | 3 L/min | 32% | Pós-op |
| | 4 L/min | 36% | IC |
| | 5 L/min | 40% | DPOC |
| | 6 L/min | 44% | - |
| **Máscara Venturi** | | | |
| | Azul | 24% | DPOC |
| | Branco | 28% | DPOC |
| | Amarelo | 31% | Precisão |
| | Vermelha | 35% | Precisão |
| | Verde | 40% | Precisão |
| **Máscara Simples** | 6-10 L | 35-50% | Emergência |
| **Máscara Não-Reinalante** | 10-15 L | 60-90% | Emergência grave |
| **CBAF** | 10-60 L | 21-100% | IRA hipoxêmica |

---

### **9.2 TABELA PEEP/FiO₂ ARDSNet**

**PEEP BAIXA (Recomendada)**

| FiO₂ | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 | 0,9 | 1,0 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|
| **PEEP** | **5** | **8** | **10** | **10** | **10** | **14** | **14** | **18** |

**PEEP ALTA (Alternativa)**

| FiO₂ | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 | 0,9 | 1,0 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|
| **PEEP** | **5** | **9** | **14** | **14** | **14** | **18** | **18** | **24** |

---

### **9.3 TABELA PARÂMETROS VENTILATÓRIOS**

| Modo | VT | FR | PEEP | FiO₂ | Observações |
|------|-----|-----|------|------|-------------|
| **VCV** | 6-8 mL/kg | 12-16 | 5 | 1,0→tit | Início VM |
| **PCV** | 6-8 mL/kg* | 12-16 | 5 | 1,0→tit | *ajustar Pinsp |
| **PSV** | - | - | 5-10 | tit | Desmame |
| | | | | | Alvo VT 6-8 |
| **SIMV** | 6-8 mL/kg | 8-12 | 5 | tit | Transição |
| **CPAP** | - | - | 5-10 | tit | Pré-extubação |

---

### **9.4 TABELA INTERPRETAÇÃO GASOMÉTRICA**

| pH | PaCO₂ | HCO₃⁻ | Diagnóstico | Conduta |
|-----|-------|-------|-------------|---------|
| < 7,35 | > 45 | N | Acidose respiratória | ↑ Ventilação |
| < 7,35 | N | < 22 | Acidose metabólica | Corrigir causa |
| > 7,45 | < 35 | N | Alcalose respiratória | ↓ Ventilação |
| > 7,45 | N | > 26 | Alcalose metabólica | Corrigir causa |
| < 7,35 | > 45 | < 22 | Acidose mista | Ventilar + bicarb |
| N | > 45 | > 26 | Acidose resp compensada | Observar |
| N | < 35 | < 22 | Alcalose resp compensada | Observar |

---

### **9.5 TABELA CLASSIFICAÇÃO SARA**

| Critério | Leve | Moderada | Grave |
|----------|------|----------|-------|
| **P/F ratio** | 200-300 | 100-200 | < 100 |
| **PEEP mínima** | ≥ 5 | ≥ 5 | ≥ 5 |
| **Mortalidade** | 27% | 32% | 45% |
| **Conduta** | VM protetora | + Pronação | + BNM, ECMO |

---

### **9.6 TABELA AJUSTES BASEADOS EM PARÂMETROS**

| Parâmetro | Valor | Ação |
|-----------|-------|------|
| **Pplatô** | > 30 | ↓ VT 1 mL/kg |
| **ΔP** | > 15 | ↓ VT, ↑ PEEP, pronar |
| **P/F** | < 150 | ↑ PEEP, pronar |
| **P/F** | < 100 | Pronação, BNM |
| **pH** | < 7,20 | ↑ FR, ↑ VT, bicarb |
| **PaCO₂** | > 60 | Aceitar se pH > 7,15 |
| **PaO₂** | < 55 | ↑ FiO₂, ↑ PEEP |
| **PaO₂** | > 100 | ↓ FiO₂ |
| **Complacência** | < 30 | SARA grave, recrutamento |
| **Vd/Vt** | > 0,6 | Pior prognóstico |
| **Lactato** | > 4 | Otimizar perfusão |

---

### **9.7 TABELA ÍNDICES PREDITIVOS**

| Índice | Fórmula | Valor | Interpretação |
|--------|---------|-------|---------------|
| **P/F** | PaO₂/FiO₂ | > 300 | Normal |
| | | 200-300 | SARA leve |
| | | 100-200 | SARA moderada |
| | | < 100 | SARA grave |
| **IO** | (FiO₂×PAM×100)/PaO₂ | < 5 | Normal |
| | | 5-15 | Moderado |
| | | > 15 | Grave |
| **ROX** | (SpO₂/FiO₂)/FR | > 4,88 | Sucesso CBAF |
| | | < 4,88 | Falha CBAF |
| **Tobin** | FR/VT | < 105 | Sucesso desmame |
| | | > 105 | Falha desmame |
| **AI** | (Assincronias/Total)×100 | < 10% | Aceitável |
| | | > 20% | Grave |

---

## **10. PROTOCOLOS ESPECIAIS**

### **10.1 ASMA GRAVE/STATUS ASMÁTICO**

**Características:**
- Auto-PEEP elevada
- Hiperinsuflação dinâmica
- Risco barotrauma

**Configuração VM:**
```
Modo: VCV
VT: 6-8 mL/kg
FR: 8-12 (baixa)
Fluxo: 80-100 L/min (alto)
I:E: 1:4 a 1:6 (expiração longa)
PEEP: 0-5 (cuidado!)
Pplatô: < 30
Permitir hipercapnia (pH > 7,20)
```

**Manejo Auto-PEEP:**
```
Medir: Pausa expiratória
PEEP total = PEEP set + auto-PEEP

Se auto-PEEP > 10:
- ↓ FR
- ↓ VT
- ↑ Fluxo
- ↑ Tempo expiratório
- Broncodilatadores
```

---

### **10.2 DPOC EXACERBADA**

**VNI Primeira Linha:**
```
Indicações:
- pH 7,25-7,35
- PaCO₂ > 45
- FR > 25

Configuração:
Modo: BiPAP
IPAP: 12-20
EPAP: 4-6
FR backup: 12-14
FiO₂: titular SpO₂ 88-92%
```

**Se VM Necessária:**
```
Modo: VCV
VT: 6-8 mL/kg
FR: 10-12
PEEP: 80% auto-PEEP
Fluxo: 60-80 L/min
I:E: 1:3
Permitir hipercapnia
```

---

### **10.3 EDEMA PULMONAR CARDIOGÊNICO**

**VNI Preferencial:**
```
CPAP: 10-15 cmH₂O
OU
BiPAP: IPAP 15, EPAP 10
FiO₂: titular
```

**Se VM:**
```
Modo: VCV/PCV
VT: 6-8 mL/kg
PEEP: 10-15 (reduz pré-carga)
FiO₂: titular
Diuréticos
```

---

### **10.4 TRAUMA CRANIANO**

**Objetivos:**
```
PaCO₂: 35-40 mmHg (normocapnia)
PaO₂: > 100 mmHg
PAM cerebral: > 80 mmHg
PIC: < 20 mmHg
```

**Configuração:**
```
Modo: VCV
VT: 6-8 mL/kg
FR: 12-16 (ajustar PaCO₂)
PEEP: 5-10 (cuidado PIC)
FiO₂: titular
Evitar: PEEP > 15, manobras recrutamento
```

---

### **10.5 OBESIDADE MÓRBIDA**

**Desafios:**
- Complacência reduzida
- Auto-PEEP
- Atelectasias

**Configuração:**
```
Peso previsto: usar altura
VT: 6-8 mL/kg PBW
PEEP: 10-15 (titular)
Recrutamento frequente
Posição: cabeceira 30-45°
Considerar pronação
```

---

## **11. CHECKLISTS PRÁTICOS**

### **11.1 CHECKLIST INÍCIO VM**

**Pré-intubação:**
- [ ] Jejum avaliado
- [ ] Acesso venoso calibroso
- [ ] Monitorização (ECG, SpO₂, PA)
- [ ] Oxigenação prévia (FiO₂ 100%, 3-5 min)
- [ ] Droga preparadas (sedativo + bloqueador)
- [ ] Laringoscópio testado
- [ ] TET tamanho adequado (7,5-8,5 homens; 7,0-8,0 mulheres)
- [ ] Balão cuff testado
- [ ] Capnógrafo disponível
- [ ] Aspirador funcionando
- [ ] Ambu conectado O₂

**Pós-intubação:**
- [ ] Confirmar posição (capnografia + ausculta + RX)
- [ ] Fixar TET
- [ ] Conectar VM
- [ ] Configurar parâmetros
- [ ] Gasometria 30 min
- [ ] Sedação/analgesia
- [ ] Proteção gástrica
- [ ] Profilaxia TVP
- [ ] Elevar cabeceira 30-45°
- [ ] Higiene oral clorexidina

---

### **11.2 CHECKLIST DIÁRIO VM**

**Manhã:**
- [ ] Avaliar elegibilidade desmame
- [ ] Sedação: objetivo RASS
- [ ] Analgesia: escala dor
- [ ] Bloqueio neuromuscular necessário?
- [ ] Teste respiração espontânea
- [ ] Gasometria arterial
- [ ] RX tórax (se indicado)

**Parâmetros:**
- [ ] Pplatô < 30
- [ ] ΔP < 15
- [ ] P/F ratio
- [ ] Complacência
- [ ] Auto-PEEP (se DPOC/asma)

**Prevenção:**
- [ ] Elevação cabeceira 30-45°
- [ ] Higiene oral
- [ ] Aspiração subglótica
- [ ] Profilaxia úlcera estresse
- [ ] Profilaxia TVP
- [ ] Mobilização/fisioterapia
- [ ] Controle glicêmico (140-180)

**Circuito:**
- [ ] Trocar se sujo/úmido
- [ ] Drenar condensado
- [ ] Verificar vazamentos
- [ ] Umidificador adequado

---

### **11.3 CHECKLIST EXTUBAÇÃO**

**Pré-extubação:**
- [ ] TRE sucesso 30-120 min
- [ ] Glasgow ≥ 8
- [ ] Tosse eficaz
- [ ] Secreções moderadas
- [ ] Teste vazamento positivo
- [ ] Hemodinâmica estável
- [ ] Gasometria adequada
- [ ] Equipe disponível

**Preparar:**
- [ ] O₂ suplementar (cateter/máscara)
- [ ] Ambu à beira-leito
- [ ] Material reintubação
- [ ] VNI disponível (se alto risco)
- [ ] Medicações (adrenalina, atropina)

**Pós-extubação:**
- [ ] Monitorização contínua 24h
- [ ] SpO₂, FR, FC
- [ ] Gasometria 1-2h
- [ ] Suporte O₂ adequado
- [ ] VNI profilática (se indicado)
- [ ] Reintubação se necessário

**Critérios Reintubação:**
- SpO₂ < 90% com FiO₂ > 0,5
- FR > 35 ou < 8
- Esforço respiratório intenso
- Alteração consciência
- Instabilidade hemodinâmica

---

## **12. IMAGENS DESCRITIVAS E DIAGRAMAS**

*(Nota: Inserir imagens reais no Word)*

### **12.1 CURVAS VENTILATÓRIAS NORMAIS**

**Pressão-Tempo:**
- Forma quadrática (VCV) ou retangular (PCV)
- Pplatô visível na pausa
- Retorno à PEEP na expiração

**Fluxo-Tempo:**
- Onda quadrática ou descendente
- Fluxo inspiratório positivo
- Fluxo expiratório negativo
- Retorna à linha base

**Volume-Tempo:**
- Curva ascendente inspiratória
- Platô no final inspiração
- Curva descendente expiratória
- Retorna a zero

---

### **12.2 CURVAS ASSINCRONIAS**

**Disparo Ineficaz:**
- Deflexão pressão negativa
- Sem ciclo ventilatório
- Fluxo não zerou

**Ciclagem Antecipada:**
- Fluxo inspiratório elevado no final
- Segundo pico fluxo
- "Notch" pressão

**Ciclagem Tardia:**
- Esforço expiratório durante inspiração
- Pico pressão final
- Curva convexa

**Double Triggering:**
- Dois ciclos consecutivos
- Sem expiração intermediária
- VT duplo

---

### **12.3 ALGORITMOS VISUAIS**

*(Fluxogramas para inserir)*

1. Fluxograma início VM
2. Fluxograma escalonamento SARA
3. Fluxograma desmame
4. Fluxograma assincronias
5. Fluxograma gasometria

---

## **13. FÓRMULAS RESUMO (BOLSO)**

### **MECÂNICA:**
```
Cst = VT / (Pplatô - PEEP)
Cdyn = VT / (Ppico - PEEP)
Raw = (Ppico - Pplatô) / Fluxo
ΔP = Pplatô - PEEP
```

### **OXIGENAÇÃO:**
```
P/F = PaO₂ / FiO₂
IO = (FiO₂ × PAM × 100) / PaO₂
PAO₂ = FiO₂ × 713 - (PaCO₂ / 0,8)
A-a = PAO₂ - PaO₂
```

### **VENTILAÇÃO:**
```
VE = VT × FR
PBW (M) = 50 + 0,91 × (altura - 152,4)
PBW (F) = 45,5 + 0,91 × (altura - 152,4)
Vd/Vt = (PaCO₂ - PECO₂) / PaCO₂
```

### **GASOMETRIA:**
```
AG = Na - (Cl + HCO₃)
Winter: PaCO₂ = (1,5 × HCO₃) + 8 (±2)
ΔAG = AG medido - 12
```

### **ÍNDICES:**
```
Tobin = FR / VT (L)
ROX = (SpO₂/FiO₂) / FR
AI = (Assincronias/Total) × 100
```

---

## **14. REFERÊNCIAS BIBLIOGRÁFICAS**

1. ARDSNet Protocol. N Engl J Med. 2000.
2. AMIB/SBPT. Orientações Práticas em Ventilação Mecânica 2024.
3. Surviving Sepsis Campaign 2024.
4. PROSEVA Trial. N Engl J Med. 2013.
5. EOLIA Trial. N Engl J Med. 2018.
6. Berlin Definition of ARDS. JAMA. 2012.
7. Driving Pressure and Survival. N Engl J Med. 2015.
8. Mechanical Power in VM. Anesthesiology. 2019.
9. Assincronias Ventilatórias. J Bras Pneumol. 2017.
10. High-Flow Nasal Oxygen. JAMA. 2015.

---

## **15. NOTAS IMPORTANTES**

**Este documento é um guia de apoio à decisão clínica e NÃO substitui:**
- Julgamento clínico experiente
- Protocolos institucionais
- Avaliação individualizada do paciente
- Supervisão médica adequada

**Sempre considerar:**
- Contexto clínico completo
- Comorbidades
- Preferências do paciente/família
- Recursos disponíveis
- Evidências mais recentes

**Validação:**
- Revisar periodicamente (anual)
- Atualizar conforme novas diretrizes
- Adaptar à realidade local
- Treinar equipe

---

**Documento elaborado para uso em Unidades de Terapia Intensiva**  
*Baseado em evidências científicas até 2026*  
*Versão 1.0 - Abril 2026*

**Créditos:**  
Desenvolvido para auxiliar na tomada de decisão em suporte respiratório  
Foco em ventilação protetora e redução de mortalidade intra-hospitalar

---

## **INSTRUÇÕES PARA USO NO WORD:**

1. **Copiar todo conteúdo** acima
2. **Abrir Microsoft Word**
3. **Colar** (Ctrl+V)
4. **Formatar:**
   - Título principal: Fonte 16, Negrito, Centralizado
   - Seções: Fonte 14, Negrito
   - Subseções: Fonte 12, Negrito
   - Texto: Fonte 11, Arial ou Times New Roman
   - Fórmulas: Inserir → Equação
   - Tabelas: Inserir → Tabela (ajustar colunas)
   - Imagens: Inserir → Imagens (curvas, fluxogramas)
5. **Salvar como:** "Guia_Suporte_Respiratorio_VM.docx"
6. **Adicionar:** 
   - Cabeçalho com título
   - Rodapé com numeração páginas
   - Sumário automático (Referências → Sumário)
   - Marcadores de seção

---

**FIM DO DOCUMENTO**

Este guia completo integra todas as fórmulas, protocolos e algoritmos baseados nas evidências mais atuais (ARDSNet, AMIB/SBPT 2024) para auxiliar na tomada de decisão em ventilação mecânica, com foco especial em SARA/SDRA e redução de mortalidade intra-hospitalar.