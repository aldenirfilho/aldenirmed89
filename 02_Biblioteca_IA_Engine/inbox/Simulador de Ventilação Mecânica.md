Segue abaixo o **conteúdo completo estruturado** para que você mesmo possa copiar e colar no Microsoft Word (ou Google Docs), formatando títulos, tabelas e caixas de texto conforme sua preferência.  
O documento foi elaborado com a profundidade técnica exigida, integrando fórmulas, parâmetros e lógica decisória para servir como **simulador de conduta** em ventilação mecânica e suporte respiratório, com ênfase em SARA grave.

---

# DOCUMENTO DE APOIO À DECISÃO EM SUPORTE RESPIRATÓRIO  
## *Simulador de Ventilação Mecânica e Guia de Condutas Baseado em Parâmetros Clínicos e Gasométricos*

> **Como usar este documento**  
> 1. Insira os dados do paciente nos campos sugeridos.  
> 2. Compare com as metas e fórmulas.  
> 3. Siga o algoritmo de **escalonamento** (aumento de suporte) vs. **desmame** (redução de suporte).  
> 4. Utilize o *Painel Rápido* (apêndice) para consultas imediatas.

---

## SUMÁRIO

1. Abreviaturas e Glossário  
2. Parâmetros Clínicos e Gasométricos – Coleta e Metas  
3. Fórmulas Essenciais para o Suporte Respiratório  
4. Modos Ventilatórios e Características  
5. Ventilação Protetora – Planos e Alvos (PRVC, Baixo Vt, Driving Pressure)  
6. Algoritmo de Decisão: Reduzir vs. Escalonar Suporte  
7. Diagnóstico de Assincronias Ventilatórias (por curvas ou parâmetros)  
8. Painel Rápido – Tabelas e Fórmulas Facilitadas para Casos Recorrentes  
9. Casos Clínicos Exemplo (SARA grave, DPOC, Pós-operatório)  
10. Referências e Potencial de Creditação Internacional  

---

## 1. ABREVIATURAS E GLOSSÁRIO

| Sigla | Significado | Unidade |
|-------|-------------|---------|
| CN O2 | Cateter Nasal de Oxigênio | L/min |
| MR | Máscara de Reservatório | L/min / FiO₂ |
| CBAF | Cânula de Alto Fluxo | L/min / FiO₂ |
| VNI | Ventilação Não Invasiva | --- |
| VM | Ventilação Mecânica Invasiva | --- |
| VT | Volume Corrente | mL / kg de peso predito |
| FiO₂ | Fração inspirada de oxigênio | 0,21 – 1,0 |
| PEEP | Pressão expiratória final positiva | cmH₂O |
| DP | Driving Pressure (Pplatô – PEEP) | cmH₂O |
| Pplatô | Pressão de platô | cmH₂O |
| Pico | Pressão de pico | cmH₂O |
| Compl | Complacência (estática ou dinâmica) | mL/cmH₂O |
| Ti / Te | Tempo inspiratório / expiratório | segundos |
| PaO₂ / FiO₂ | Índice de oxigenação | mmHg |
| SARA | Síndrome do Desconforto Respiratório Agudo | --- |

---

## 2. PARÂMETROS COLETADOS (CLÍNICOS + GASOMETRIA)

> **Preencha com os dados atuais do paciente**

| Parâmetro | Valor atual | Meta / Alvo |
|-----------|-------------|--------------|
| pH         | ________    | 7,35 – 7,45  |
| PaCO₂      | ________    | 35 – 45 mmHg |
| PaO₂       | ________    | 55 – 80 mmHg (SARA) ou >60 |
| Bicarbonato | ________    | 22 – 26 mEq/L |
| BE (Base excess) | ________ | -2 a +2 |
| Lactato    | ________    | < 2,0 mmol/L |
| SpO₂       | ________    | 88 – 95% (SARA) / >92% geral |
| FiO₂ atual | ________    | conforme P/F |
| PEEP atual | ________    | conforme quadro |
| VT (mL ou mL/kg) | ________ | 4–6 mL/kg (SARA), 6–8 mL/kg (demais) |
| Frequência respiratória | ________ | 12 – 20 ipm |
| Pressão de pico (Pico) | ________ | < 35 cmH₂O |
| Pressão de platô (Pplatô) | ________ | < 30 cmH₂O |
| Driving pressure (DP) | ________ | < 15 cmH₂O |
| Complacência (estática) | ________ | > 30 mL/cmH₂O (desejável) |
| Fluxo inspiratório | ________ | 40 – 60 L/min (ideal) |

---

## 3. FÓRMULAS ESSENCIAIS (APLICAÇÃO NO MOMENTO DA DECISÃO)

| Objetivo | Fórmula | Interpretação |
|----------|---------|----------------|
| **Índice de oxigenação P/F** | PaO₂ / FiO₂ | < 100 = SARA grave <br> 100-200 = moderada <br> 200-300 = leve |
| **Complacência estática** | VT / (Pplatô – PEEP) | Quanto menor, mais pulmão rígido |
| **Driving Pressure (DP)** | Pplatô – PEEP | Meta < 15; cada aumento de 1 → +3% mortalidade |
| **Volume minuto (VM)** | VT × FR | SARA: 6–8 L/min <br> DPOC: 8–10 L/min |
| **Tempo inspiratório (Ti) ideal** | 0,5 a 0,7 seg (na VC) ou 0,8–1,2 na PCV | Ajustar conforme constante de tempo |
| **PEEP ideal por melhor complacência** | Teste de decremental PEEP ou tabela PEEP alta/média/baixa | Vide painel rápido |
| **Relação P/F alvo para redução de FiO₂** | Queda de FiO₂ possível se P/F > 150 por 4h | Escalonamento reverso |
| **Índice de oxigenação (IO)** | (FiO₂ × Pmean) / PaO₂ | IO < 5 = leve; > 15 = grave (indicativo de ECMO) |
| **Tensão alveolar de O₂ (PAO₂)** | (Pb – 47) × FiO₂ – (PaCO₂ / 0,8) | Avaliar gradiente A-a |

---

## 4. MODOS VENTILATÓRIOS E SUAS CURVAS CARACTERÍSTICAS

| Modo | Forma de onda característica (curva pressão x tempo) | Indicação principal |
|------|------------------------------------------------------|----------------------|
| **VC (Controle a volume)** | Pressão ascendente constante (rampa) | Início da VM, SARA clássica |
| **PCV (Controle a pressão)** | Pressão quadrada, fluxo decrescente | SARA grave, barotrauma |
| **PRVC** | Pressão ajustada a cada ciclo para VT alvo | SARA + preservar driving pressure |
| **PSV (Pressão de suporte)** | Pressão constante, fluxo decrescente ativado pelo paciente | Desmame |
| **SIMV + PS** | Ciclos mandatórios intercalados com espontâneos | Transição da VM |
| **VNI (CPAP / BIPAP)** | Dois níveis de pressão (IPAP / EPAP) | Edema agudo pulmonar, DPOC |

> **Curvas para diagnóstico de assincronias** – consulte seção 7.

---

## 5. PLANOS DE VENTILAÇÃO PROTETORA (SARA GRAVE)

### 5.1. Estratégia Inicial (primeiras 24-48h)
- **VT:** 4–6 mL/kg (peso predito)
- **PEEP:** conforme tabela PEEP alta (tabela ARDSNet) → vide painel rápido
- **FiO₂:** ajustar para SpO₂ 88-95%
- **Driving pressure:** manter < 15 (reduzir VT se DP > 15)
- **Pplatô:** < 30 cmH₂O

### 5.2. Manobras adjuvantes quando refratário (P/F < 100 por > 6h)
- **Pronação** – se P/F < 150 com PEEP ≥ 10 e FiO₂ ≥ 0,6
- **Bloqueio neuromuscular (cisatracúrio)** – se assincronia grave ou driving pressure > 18 mesmo com VT baixo
- **Recrutamento alveolar** – APM controlado (apenas se hemodinâmica estável)
- **ECMO** – se P/F < 80 por > 6h ou pH < 7,15 com hipercapnia refratária

---

## 6. ALGORITMO DE DECISÃO: REDUZIR VS. ESCALONAR SUPORTE

> Insira os parâmetros atuais e siga o fluxo.\


INÍCIO: Paciente em ventilação invasiva ou não invasiva

1. pH ≥ 7,35 e PaCO₂ < 50, PaO₂ > 65 com FiO₂ < 0,5? 
   → SIM: Tentar REDUZIR suporte (desmame)
   → NÃO: ESCALONAR ou MANTER + otimizar
   
   --------------------------------------------
   **REDUZIR SUPORTE**
   - Tentar reduzir FiO₂ em 0,05 a cada 10 min (se P/F > 200)
   - Reduzir PEEP em 2 cmH₂O (se PEEP > 10 e P/F > 200)
   - Reduzir pressão de suporte (PS) em 2-4 cmH₂O na VNI/PSV
   - Se paciente espontâneo e estável → testar TOT em T
   
   **ESCALONAR SUPORTE** (piora de oxigenação ou ventilação)
   
   | Parâmetro alterado                  | Conduta prioritária                           |
   |-------------------------------------|-----------------------------------------------|
   | PaO₂ < 60 ou SpO₂ < 88%             | Aumentar FiO₂ em 0,1-0,2                     |
   | P/F < 150 com PEEP < 12             | Aumentar PEEP em 2 cmH₂O (até 20-24)         |
   | PaCO₂ > 55 com pH < 7,30            | Aumentar FR (até 35 ipm) ou VT (cuidado com DP) |
   | Pplatô > 30                         | Reduzir VT → se mantém Pplatô alto, reduzir PEEP |
   | DP > 18                             | Reduzir VT ou mudar para PCV com mesmo DP     |
   | Assincronia grave (disparo duplo)   | Aumentar fluxo ou trocar modo (PRVC/PCV)      |
   | P/F < 100 após otimização           | Considerar PRONAR ou BLOQUEIO                |
   | Lactato > 4 mesmo com ventilação boa| Reavaliar choque (não escalonar apenas VM)    |


---

## 7. DIAGNÓSTICO DE ASSINCRONIAS VENTILATÓRIAS  
(por foto da curva ou parâmetros inseridos)

| Assincronia | Curva característica | Parâmetros inseridos que indicam | Ação a tomar |
|-------------|----------------------|----------------------------------|---------------|
| **Disparo ineficaz** | Curva de pressão negativa não seguida de fluxo | Esforço do paciente sem ciclagem; PEEP alta | Reduzir PEEP, reduzir sensibilidade de disparo, tratar auto-PEEP |
| **Duplo disparo (double trigger)** | Dois ciclos próximos, pouco tempo expiratório | VT duplicado, Ti curto no primeiro ciclo | Aumentar fluxo inspiratório, aumentar Ti, reduzir sensibilidade de ciclagem |
| **Ciclagem precoce (short-cycling)** | Pressão cai antes do final do esforço | Pico de fluxo expiratório alto, tempo expiratório longo | Aumentar tempo inspiratório (Ti), reduzir critério de ciclagem para fluxo menor (ex: 25% do pico) |
| **Ciclagem tardia (prolongada)** | Pressão sustentada além do esforço | Esforço expiratório presente, autotrigger | Reduzir Ti, aumentar fluxo de ciclagem (>40%) |
| **Auto-PEEP dinâmica** | Fluxo expiratório não retorna a zero antes do próximo disparo | PEEP total > PEEP ajustada, curvas concavidade | Aumentar Te, reduzir FR, broncodilatador |
| **Flip-flop (alternância entre modos)** | Ciclos mandatórios vs espontâneos irregulares | Variação de VT > 30% entre ciclos | Ajustar nível de PS e gatilho, suprimir SIMV para PSV puro |

> **Como usar:** Cole a imagem da curva de pressão x tempo ou fluxo x tempo. Compare com a descrição acima. O sistema (simulador) sugerirá a conduta.

---

## 8. PAINEL RÁPIDO – AUXÍLIO IMEDIATO (FÓRMULAS E TABELAS)

### 8.1. Tabela PEEP vs. FiO₂ (ARDSNet baixa PEEP vs. alta PEEP – valores adaptados)

| FiO₂ | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 | 0,9 | 1,0 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|
| PEEP (baixa) | 5 | 5 | 8 | 10 | 10 | 14 | 16 | 18 |
| PEEP (alta)  | 8 | 10 | 12 | 14 | 16 | 18 | 22 | 24 |

**Regra prática:**  
- P/F > 300 → PEEP 5–8  
- P/F 200–300 → PEEP 8–12  
- P/F 100–200 → PEEP 12–18  
- P/F < 100   → PEEP 18–24  

### 8.2. Cálculo rápido da Complacência (estática)

`Compl = VT (L) / (Pplatô – PEEP)`  
Exemplo: VT 0,45 L, Pplatô 26, PEEP 10 → Compl = 0,45 / 16 = 0,028 L/cmH₂O = 28 mL/cmH₂O

### 8.3. Parâmetros padrão para casos recorrentes

| Condição | Modo | VT (mL/kg) | PEEP inicial | FiO₂ alvo | Plateau alvo |
|----------|------|------------|--------------|------------|---------------|
| SARA grave | PCV ou PRVC | 4-6 | 14-18 | 0,6-1,0 | <30 |
| DPOC exacerbado | VNI (BIPAP) ou PSV | 6-8 | 5-8 (EPAP) | 0,3-0,5 | <25 |
| Pós-operatório abdominal | SIMV + PS | 6-8 | 5-8 | 0,3 | <25 |
| TCE grave | VC normocapnia (PaCO₂ 35-40) | 6-8 | 5 | 0,4 | <25 |
| Asma grave (status) | PCV com baixa FR (10-14) | 4-6 | 0-5 | 0,6-1,0 | Pplatô <30 |

### 8.4. Índices de desmame rápidos

| Índice | Fórmula | Valor preditivo de sucesso |
|--------|---------|----------------------------|
| Índice de Tobin (f/VT) | FR (ipm) / VT (L) | < 105 → sucesso |
| P0.1 | Oclusão inicial | > 6 → falha provável |
| RSBI corrigido | FR / (VT/kg) | > 130 → falha |

---

## 9. EXEMPLO DE APLICAÇÃO – SARA GRAVE + DECISÃO

**Dados inseridos:**  
pH 7,24 ; PaCO₂ 68 ; PaO₂ 55 ; FiO₂ 0,8 ; PEEP 16 ; VT 340 mL (5 mL/kg) ; FR 28 ; Pplatô 31 ; DP = 15 ; Lactato 2,5.

**Análise:**  
- P/F = 55 / 0,8 = 68 → SARA grave.  
- pH baixo por hipercapnia (PaCO₂ 68).  
- Pplatô limite (31).  
- DP = 15 (aceitável).  
- Lactato 2,5 (sem choque refratário).

**Conduta sugerida (escalonar ventilação):**  
1. **Reduzir VT para 4,5 mL/kg (300 mL)** → reduziria DP para ≈ 13-14? Risco de piorar PaCO₂.  
2. **Aumentar FR para 32 ipm** → ganho de VM, melhoraria PaCO₂, cuidado com auto-PEEP.  
3. **Avaliar PEEP** – atualmente 16, FiO₂ 0,8, pode aumentar PEEP para 18 tentando melhorar PaO₂.  
4. **Pronação** indicada (P/F < 150 por >12h com PEEP alta e Pplatô aceitável) → sim, realizar.  
5. **Bloqueio neuromuscular** – se após pronação ainda assincronia ou driving pressure > 18.

---

## 10. REFERÊNCIAS E POTENCIAL DE CREDITAÇÃO INTERNACIONAL

- ARDSNet trials (NEJM 2000).  
- Amato et al. Driving pressure and survival (ICM 2015).  
- Guia de Ventilação Protetora – SCCM 2023.  
- **Potencial do documento:**  
  - Submeter à Society of Critical Care Medicine (SCCM) como ferramenta educacional.  
  - Incorporar como *add-on* para sistemas de prontuário eletrônico.  
  - Validação em coorte prospectiva para redução de mortalidade intra-hospitalar.

---

## APÊNDICE – INSTRUÇÕES DE USO COMO SIMULADOR

1. **Crie uma planilha (Excel) associada** – conecte as fórmulas automaticamente.  
2. **Ou use o documento impresso** – preencha os campos sempre com lápis.  
3. **Para cada decisão**, consulte o algoritmo de escalonamento (seção 6).  
4. **Registre a conduta** e reavalie após 30 a 60 minutos.  

> **Aviso:** Este documento não substitui o julgamento clínico presencial. Serve como apoio estruturado para equipes treinadas.

---

**Data da última revisão:** ______  
**Responsável técnico (assinatura):** ________________________________

---

Caso deseje, posso gerar uma **versão em formato PDF** com layout otimizado para impressão e tabelas editáveis, ou transformar este conteúdo em um **arquivo .docx** legível diretamente no Word. Basta solicitar.

Segue um documento completo, estruturado para funcionar como uma ferramenta prática de suporte à decisão em ventilação mecânica. Você pode copiar todo o conteúdo abaixo e colar em um arquivo do Word. As seções foram diagramadas para permitir navegação rápida com sumário automático (use títulos do Word). Para uma experiência de simulador interativo, algumas seções funcionam como fluxogramas textuais e tabelas de decisão.

---

# SIMULADOR INTEGRADO DE SUPORTE RESPIRATÓRIO  
## Guia de Decisão Clínica e Ventilação Protetora  
**Versão 1.0 – Uso em UTI Adulto**  

---

## SUMÁRIO  
1. Fórmulas Essenciais Integradas  
2. Painel Rápido de Parâmetros Padrão  
3. Modos Ventilatórios e Curvas: Identificação e Ação  
4. Diagnóstico de Assincronias pela Curva  
5. Algoritmo de Escalonamento e Redução de Suporte  
6. Simulador de Decisão Baseado em Gasometria e Mecânica Pulmonar  
7. Planos de Ventilação Protetora (SARA)  
8. Referência Rápida para Condutas Especiais  

---

## 1. FÓRMULAS ESSENCIAIS INTEGRADAS  

| Fórmula | Cálculo | Aplicação Clínica |
|--------|--------|-------------------|
| **Relação PaO₂/FiO₂** | PaO₂ / FiO₂ (ex: 80 / 0,6 = 133) | Classifica gravidade SARA: Leve 200-300, Moderada 100-200, Grave <100 |
| **Índice de Oxigenação (IO)** | (FiO₂ × MAP × 100) / PaO₂ | Em neonato/ped; em adulto auxilia indicação ECMO se >30-40 |
| **Driving Pressure (ΔP)** | Pplatô – PEEP | Alvo ≤ 15 cmH₂O; >15 associado a maior mortalidade |
| **Complacência Estática (Cest)** | VT / (Pplatô – PEEP) | Normal ≥ 60 mL/cmH₂O; <30 indica restrição grave |
| **Resistência de Vias Aéreas** | (Ppico – Pplatô) / Fluxo (L/s) | Normal ≤ 5-10 cmH₂O/L/s; elevada = broncoespasmo, secreção, tubo estreito |
| **Ventilação Alveolar (VA)** | (VT – VD) × FR | Ajuste fino de FR e VT para controle de PCO₂; VD ~2,2 mL/kg peso predito |
| **Índice de Tobin** | FR / VT (em litros) | <105 prevê sucesso no desmame |
| **Pressão de Oclusão (P0.1)** | Medida no ventilador nos primeiros 100 ms | <3,5 cmH₂O prediz sucesso no desmame |
| **Relação PaO₂/PAO₂ (a/A)** | PaO₂ / PAO₂ (PAO₂ = FiO₂×(Patm-47) – PCO₂/0,8) | <0,35 indica shunt grave |
| **Diferença Alvéolo-arterial (D[A-a]O₂)** | PAO₂ – PaO₂ | Normal 5-15 mmHg; >350 em SARA grave |
| **Fluxo Inspiratório Necessário (pico)** | VT / Tinsp (em segundos) | Ajuste para evitar assincronia de fluxo no PSV |
| **Tempo Constante (τ)** | Complacência × Resistência | Guia para ajuste de Tempo Inspiratório (3-5 τ) |
| **Calculo Peso Predito Homem** | 50 + 0,91 × (altura cm – 152,4) | VT protetor = 4-8 mL/kg peso predito |
| **Calculo Peso Predito Mulher** | 45,5 + 0,91 × (altura cm – 152,4) | Idem acima |

---

## 2. PAINEL RÁPIDO – PARÂMETROS PADRÃO (MODOS COMUNS)  

| Modo | Parâmetro Inicial Sugerido (Adulto) | Alvo | Observação |
|------|-----------------------------------|------|------------|
| **VCV/PCV-C** | VT 6 mL/kg peso predito, FR 16-22, FiO₂ 0,5, PEEP 8-10 | Pplatô ≤30, ΔP ≤15, SpO₂ 92-96% | Reduzir VT se Pplatô >30 |
| **PSV** | Pressão de suporte 10-15 cmH₂O, PEEP 5-8, FiO₂ para SpO₂ >90% | VT espontâneo 6-8 mL/kg, FR <30, P0.1<3,5 | Ajustar PS para FR confortável |
| **APRV (BiLevel)** | Phigh 25-30, Plow 0, Thigh 4-6s, Tlow 0,5-0,8s | VT liberado 6-8 mL/kg, SpO₂ alvo | Tlow curto para evitar desrecrutamento |
| **VNI (CPAP/BiPAP)** | IPAP 10-12, EPAP 5-8, ΔIPAP mínimo 5 | FR<25, uso de acessórios, SpO₂ >90% | Interface bem ajustada; escape ≤20 L/min |
| **CNAF** | Fluxo 30-60 L/min, FiO₂ para SpO₂ >92% | Redução FR, conforto | Se falha em 2h, considerar VNI/IOT |
| **MR (Máscara Reservatório)** | Fluxo 10-15 L/min | SpO₂ >92% | FiO₂ estimada 0,6-0,8 |
| **CB/CN O₂** | Fluxo 1-6 L/min | SpO₂ alvo | Cada L/min ≈ +4% FiO₂ (máx ~0,44) |

---

## 3. MODOS VENTILATÓRIOS – ANÁLISE DE CURVAS E CONDUTA  

### 3.1 VCV (Volume Controlado)  
- **Curvas**: Fluxo constante (onda quadrada) ou descendente (rampa). Pressão sobe até Ppico.  
- **Pproblemas**: Se Ppico elevado com Pplatô normal → resistência alta. Se ambos elevados → baixa complacência.  
- **Conduta imediata**: Verificar tubo, secreção, broncoespasmo. Checar PEEP ideal (curva P-V).  

### 3.2 PCV (Pressão Controlada)  
- **Curvas**: Pressão constante; fluxo desacelerado. VT variável (monitorar).  
- **Alerta**: Queda VT sem alteração de pressão → piora mecânica ou escape.  
- **Conduta**: Se VT <4 mL/kg, considerar mudança para VCV com limite de pressão ou aumentar pressão inspiratória, reavaliar sedação, PEEP.  

### 3.3 PSV (Pressão de Suporte)  
- **Critério de ciclagem**: % do pico de fluxo (padrão 25%). Em DPOC, aumentar para 40-50% para evitar duplo disparo.  
- **Se Ti longo e expiração curta**: reduzir % de ciclagem ou PS; ver auto-PEEP.  

### 3.4 APRV / BiLevel  
- **Curvas**: Duas pressões; liberação breve.  
- **Falha**: Tlow muito curto gera auto-PEEP e hiperinsuflação; Tlow longo desrecruta.  
- **Ajuste**: Tlow ajustado para que fluxo expiratório atinja 50-75% do pico (não zerar).  

---

## 4. DIAGNÓSTICO DE ASSINCRONIAS PELA CURVA  

| Tipo de Assincronia | Achado na Curva | Causa Provável | Conduta |
|--------------------|-----------------|----------------|---------|
| **Disparo Ineficaz** | Queda de pressão/fluxo sem entrega de ciclo | Auto-PEEP, baixa sensibilidade, fraqueza muscular | Aumentar PEEP externa, ajustar sensibilidade (pressão -1 a -2), ver sedação |
| **Duplo Disparo** | Dois ciclos consecutivos sem expiração completa | Esforço inspiratório prolongado, ciclagem precoce no PSV | Aumentar PS, reduzir % de ciclagem (ex: 40%), checar auto-PEEP |
| **Autociclagem** | Ciclos iniciados pelo ventilador sem esforço do paciente | Escape de ar, condensado no circuito, sensibilidade alta | Corrigir escape, drenar água, ajustar sensibilidade |
| **Fluxo Insuficiente** | Curva de pressão côncava (em VCV) / sensação de fome de ar | Fluxo inspiratório abaixo da demanda do paciente | Aumentar fluxo (VCV), ou mudar para PCV, ou aumentar rampa |
| **Ciclagem Tardia** | Aumento da pressão no final da inspiração (PSV), esforço expiratório ativo | % de ciclagem muito baixa, Ti longo | Aumentar % de ciclagem para 40-50%, reduzir Ti max |
| **Auto-PEEP (PEEPi)** | Fluxo expiratório não retorna a zero antes do próximo ciclo | Armadilha aérea (DPOC, asma), FR alta, VT alto | Reduzir FR, aumentar tempo expiratório, broncodilatador, PEEP externa até 80% do auto-PEEP |

> **Ação prática**: Fotografe a curva do ventilador. Compare com os padrões acima. Aplique a conduta listada e reavalie em 10-15 minutos.

---

## 5. ALGORITMO DE ESCALONAMENTO E REDUÇÃO DE SUPORTE  

### 5.1 OXIGENAÇÃO (avaliar PaO₂/SpO₂)  

| Relação P/F (PaO₂/FiO₂) | Classificação | Conduta Sugerida |
|--------------------------|---------------|------------------|
| >300 | Normal / Leve | Reduzir FiO₂ primeiro, depois PEEP se estável |
| 200-300 | SARA Leve | Ajustar PEEP conforme tabela ARDSNet; avaliar CNAF/VNI |
| 100-200 | SARA Moderada | Tabela PEEP alta; considerar prona se P/F <150 após otimização; avaliar BNM se assincronia |
| <100 | SARA Grave | Prona (16h/dia); BNM precoce (cisatracúrio 48h); se refratário → ECMO (IO>30, P/F<80 otimizado) |

**Tabela PEEP/FiO₂ (LOW PEEP – ARDSNet)**  
FiO₂: 0,3 → PEEP 5  
FiO₂: 0,4 → PEEP 5-8  
FiO₂: 0,5 → PEEP 8-10  
FiO₂: 0,6 → PEEP 10  
FiO₂: 0,7 → PEEP 10-14  
FiO₂: 0,8 → PEEP 14  
FiO₂: 0,9 → PEEP 14-18  
FiO₂: 1,0 → PEEP 18-24  

**Estratégia de alta PEEP** (se moderado-grave): considere tabela ALVEOLI ou EXPRESS: FiO₂ 0,5 → PEEP até 12; 0,6 → 14; 0,7 → 16; 0,8 → 18; 0,9 → 20; 1,0 → 22-24.

### 5.2 VENTILAÇÃO (avaliar pH e PCO₂)  

- **Se pH <7,25 e PCO₂ >60 (acidose respiratória)** com Pplatô <30:  
  - Aumentar FR até 30-35  
  - Se VT <8 mL/kg e Pplatô ≤30, aumentar VT em passos de 0,5 mL/kg  
  - Otimizar sedação e avaliar uso de BNM para sincronia  
- **Se pH >7,45 e PCO₂ <35 (alcalose respiratória)**:  
  - Reduzir FR primeiro; ajustar sedação  
  - Em PSV, reduzir pressão de suporte  
- **Se pH normal e PCO₂ controlado, mas Pplatô >30**:  
  - Reduzir VT até 4-6 mL/kg peso predito, mesmo que PCO₂ suba (hipercapnia permissiva), manter pH ≥7,20  
  - Se pH <7,20 e Pplatô alto, considerar ECMO  

### 5.3 DESMAME (REDUÇÃO DE SUPORTE)  

**Critérios para Teste de Respiração Espontânea (TRE):**  
- Patologia de base resolvida/controlada  
- PaO₂/FiO₂ >200 com PEEP ≤8 e FiO₂ ≤0,4  
- pH ≥7,30, PCO₂ estável  
- FR ≤30, VT espontâneo >5 mL/kg  
- Índice de Tobin <105  
- P0.1 <3,5 cmH₂O  
- RASS -2 a 0, sem agitação psicomotora  
- FiO₂ ≤0,4, PEEP ≤8  

**Modo TRE**: PSV 7 cmH₂O + PEEP 5 cmH₂O ou Tubo T por 30-120 min.  
**Falha na TRE**: FR>35, SpO₂<90%, PCO₂ aumenta >10 mmHg, uso musculatura acessória, diaforese, rebaixamento.  

**Extubação**: Após TRE bem-sucedida, avaliar proteção de via aérea (tosse, secreção).

---

## 6. SIMULADOR DE DECISÃO – DADOS CLÍNICOS E GASOMÉTRICOS  

> **Modo de uso**: Insira os valores reais do paciente nos campos. Siga a interpretação imediata. A recomendação de conduta aparece em **negrito**.

### EXEMPLO 1 – SARA MODERADA EM VCV  

**Parâmetros ventilador:** Modo VCV, VT 380 mL (6 mL/kg), FR 22, FiO₂ 0,7, PEEP 12, Ppico 42, Pplatô 32, Fluxo 50 L/min.  
**Gasometria:** pH 7,21, PCO₂ 62, PO₂ 58, HCO₃ 24, BE -2, SaO₂ 88%, Lactato 3,1.  

**Cálculos rápidos:**
- P/F = 58/0,7 = 82,8 (SARA Grave)  
- Driving Pressure = 32-12 = **20 cmH₂O** (ALTO, >15)  
- Complacência = 380/20 = 19 mL/cmH₂O (muito baixa)  
**Interpretação:** Acidose respiratória com hipoxemia refratária e mecânica de alto estresse.  
**Conduta sugerida:**
1. Aumentar PEEP conforme tabela para FiO₂ 0,7 → considerar 16-18 cmH₂O e reavaliar Pplatô.
2. Reduzir VT para 5 mL/kg (redução ~10%) se possível; tolerar hipercapnia até pH 7,15.
3. Otimizar sedação e considerar **cisatracúrio** em bomba 48h.
4. Indicar **prona** imediata (se P/F <100, já elegível).
5. Avaliar ECMO: IO = (0,7×18×100)/58 = 21,7 (ainda <30), mas P/F <80 em FiO₂ alto → discutir com ECMO team se persistir.
6. Checar curva: duplo disparo? Ajustar sedação/modo PCV.
7. Gasometria de controle em 1h.

### EXEMPLO 2 – DESMAME DIFÍCIL EM PSV  

**Parâmetros:** PSV, PS 14, PEEP 5, FiO₂ 0,35.  
**Dados:** FR 32, VT 280 mL (peso predito 70 kg → 4 mL/kg), Índice Tobin = 32/0,28 = 114 (>105). P0.1 = 4,8 cmH₂O.  
**Gasometria:** pH 7,35, PCO₂ 45, PO₂ 88.  
**Interpretação:** Padrão de alto drive, baixo VT; alto risco de falha de extubação.  
**Conduta:**
- Não prosseguir para TRE ainda.
- Otimizar PS: aumentar para 18, reavaliar FR/VT após 20 min.  
- Investigar causas: dor, ansiedade, distensão abdominal, acidose oculta (lactato?).
- Corrigir eletrólitos (K, P, Mg).
- Considerar modos de desmame progressivo (SIMV+PS, depois PSV) ou desmame guiado por protocolo com evolução diária.

### EXEMPLO 3 – ASSINCRONIA EM PCV  

**Curva:** Observa-se esforço inspiratório no ramo expiratório, sem disparo do ventilador (disparo ineficaz).  
**Parâmetros:** PCV, Pinsp 20, FR 18, PEEP 8, FiO₂ 0,45. Onda de fluxo não retorna a zero.  
**Diagnóstico suspeito:** Auto-PEEP com disparos ineficazes.  
**Conduta sugerida:**
1. Medir auto-PEEP pela pausa expiratória.
2. Aumentar PEEP externa para 80% do auto-PEEP.
3. Reduzir FR (se possível) ou reduzir Ti, aumentando tempo expiratório.
4. Broncodilatador se broncoespasmo.
5. Ajustar sensibilidade de disparo (mais sensível) até corrigir.

---

## 7. PLANOS DE VENTILAÇÃO PROTETORA (SARA) – RESUMO  

| Parâmetro | Meta |
|-----------|------|
| VT | 4-8 mL/kg de peso predito |
| Pplatô | ≤ 30 cmH₂O |
| Driving Pressure | ≤ 15 cmH₂O |
| PEEP | Individualizada (tabela ou PEEP ótima por complacência/oxigenação) |
| FiO₂ | Mínima para SpO₂ 92-96% |
| pH | ≥ 7,15 (hipercapnia permissiva) |
| FR | Ajustar para pH, no máximo 35 |
| Pronação | Se P/F <150 após 12-24h de ventilação protetora otimizada |
| BNM | Se P/F <150 e assincronia grave (cisatracúrio 48h) |
| ECMO | P/F <80, IO >30, ou hipercapnia com pH<7,15 apesar de VT mínimo |

---

## 8. REFERÊNCIA RÁPIDA – CONDUTAS ESPECIAIS  

| Situação | Ação Imediata |
|----------|---------------|
| **Desaturação súbita** | Desconectar, ventilar com AMBU FiO₂ 1,0. Checar pulso, tubo (DOPES – deslocamento, obstrução, pneumotórax, equipamento, stacking). |
| **Hipotensão pós-intubação** | Reduzir PEEP temporariamente, avaliar pneumotórax hipertensivo, fluidos se responsivo. |
| **Pplatô >30** | Reduzir VT imediatamente, checar auto-PEEP, ajustar sedação. |
| **Suspeita de auto-PEEP** | Pausa expiratória; se presente, reduzir FR, alongar Te, broncodilatador se asma/DPOC. |
| **Hipercapnia permissiva** | Meta pH ≥7,15; se menor, considerar bicarbonato (se acidose metabólica associada), aumentar FR até 35, ECMO se refratário. |
| **Falha de VNI** | Critérios: pH<7,30 apesar de VNI otimizada, rebaixamento, instabilidade hemodinâmica. IOT imediata. |
| **Weaning difícil** | Ecocardio (falência cardíaca diastólica), eletrólitos, força muscular inspiratória (Pimax < -20 cmH₂O fraco), corticoide se estridor. |

---

## COMO USAR ESTE DOCUMENTO NO DIA-A-DIA  
1. Imprima as tabelas principais e fixe na estação de trabalho.  
2. Durante o round, preencha mentalmente o **Simulador** com os dados do ventilador e da última gasometria.  
3. Siga o **Algoritmo de Escalonamento**.  
4. Em caso de dúvida na curva, abra a seção **Assincronias** e compare com a foto.  
5. Utilize o **Painel Rápido** para ajustes iniciais de novos pacientes.  

---

Este documento foi elaborado com o objetivo de integrar todos os pilares do manejo ventilatório moderno baseado em evidências (ARDSNet, LUNG SAFE, PROSEVA, ACURASYS, EOLIA) e traduzi-los em decisões práticas e imediatas, com potencial de reduzir mortalidade intra-hospitalar ao padronizar condutas e facilitar o reconhecimento precoce de gravidade e assincronias.