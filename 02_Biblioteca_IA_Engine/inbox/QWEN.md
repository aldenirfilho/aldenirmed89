Agora vou criar para você um **documento Word completo e estruturado** para suporte decisional em ventilação mecânica. Como não posso gerar arquivos .docx diretamente, vou fornecer o conteúdo formatado que você poderá copiar para o Word, além de instruções para criar tabelas interativas e fórmulas automáticas.

---

# **DOCUMENTO WORD - GUIA COMPLETO DE SUPORTE RESPIRATÓRIO E VENTILAÇÃO MECÂNICA**

## **INSTRUÇÕES INICIAIS:**
1. Abra o Microsoft Word
2. Copie todo o conteúdo abaixo
3. Use fonte **Calibri 11** ou **Arial 10**
4. Configure margens: **2,5 cm** (todas)
5. Use **paisagem** para páginas de tabelas grandes
6. Insira **quebras de seção** entre capítulos principais

---

```
================================================================================
                           PÁGINA DE CAPA
================================================================================

                    MANUAL AVANÇADO DE SUPORTE RESPIRATÓRIO
                         E VENTILAÇÃO MECÂNICA
                    
                    SISTEMA INTEGRADO DE DECISÃO CLÍNICA
                    E SIMULAÇÃO DE PARÂMETROS VENTILATÓRIOS

                           EDIÇÃO 2025/2026

              Baseado nas Diretrizes AMIB/SBPT 2024 e 
              Evidências Atualizadas em Terapia Intensiva

================================================================================


================================================================================
                           ÍNDICE ANALÍTICO
================================================================================

1. SUPORTE RESPIRATÓRIO BÁSICO
   1.1 Cateter Nasal de O2 (CN)
   1.2 Máscara de Venturi (MV)
   1.3 Máscara Simples e com Reservatório (MR)
   1.4 Calculadora de Oxigenoterapia

2. OXIGENOTERAPIA DE ALTO FLUXO (CBAF/HFNC)
   2.1 Parâmetros e Ajustes
   2.2 Índices de Sucesso/Falha
   2.3 Protocolo de Escalonamento

3. VENTILAÇÃO NÃO INVASIVA (VNI)
   3.1 Modos Ventilatórios
   3.2 Parâmetros Iniciais e Ajustes
   3.3 Critérios de Intubação
   3.4 Calculadora VNI

4. VENTILAÇÃO MECÂNICA INVASIVA
   4.1 Modos Ventilatórios Completos
       • VCV - Ventilação Controlada a Volume
       • PCV - Ventilação Controlada a Pressão
       • PSV - Pressão de Suporte
       • SIMV - Ventilação Mandatória Intermitente
       • PRVC - Ventilação Controlada a Pressão Regulada
       • APRV - Ventilação com Liberação de Pressão
       • NIV - Modos Híbridos
   4.2 Parâmetros Ventilatórios
   4.3 Curvas e Loopings
   4.4 Calculadora de Parâmetros

5. FÓRMULAS E CÁLCULOS AVANÇADOS
   5.1 Gasometria Arterial
   5.2 Mecânica Respiratória
   5.3 Troca Gasosa
   5.4 Índices Prognósticos

6. SÍNDROME DO DESCONFORTO RESPIRATÓRIO AGUDO (SARA/ARDS)
   6.1 Definição e Classificação (Berlim)
   6.2 Ventilação Protetora
   6.3 Manobras de Recrutamento
   6.4 Pronação
   6.5 Bloqueio Neuromuscular
   6.6 ECMO - Critérios

7. ASSINCRONIAS VENTILATÓRIAS
   7.1 Identificação por Curvas
   7.2 Classificação
   7.3 Condutas Específicas

8. PROTOCOLOS DECISIONAIS
   8.1 Algoritmo de Escalonamento
   8.2 Algoritmo de Desmame
   8.3 Protocolo de SARA Grave
   8.4 Checklist Diário

9. TABELAS DE REFERÊNCIA RÁPIDA
   9.1 Valores Normais
   9.2 Drogas Vasoativas
   9.3 Sedação e Analgesia
   9.4 Bloqueadores Neuromusculares

10. ANEXOS E FLUXOGRAMAS

================================================================================
                    SEÇÃO 1: SUPORTE RESPIRATÓRIO BÁSICO
================================================================================

1.1 CATETER NASAL DE O2 (CN)
─────────────────────────────

FÓRMULA DE ESTIMATIVA DE FiO2:
═══════════════════════════════

FiO2 estimada = 21 + (4 × fluxo de O2 em L/min)

Exemplo: 
Fluxo 3 L/min → FiO2 = 21 + (4 × 3) = 33%

LIMITAÇÕES:
• Fluxo máximo: 6 L/min (conforto do paciente)
• FiO2 máxima real: ~45%
• Varia com padrão respiratório do paciente

TABELA DE CONVERSÃO RÁPIDA:
────────────────────────────
Fluxo (L/min) | FiO2 Aproximada | Observações
──────────────┼─────────────────┼────────────────────
    1         |      25%        | Hipoxemia leve
    2         |      29%        | 
    3         |      33%        | Uso comum
    4         |      37%        |
    5         |      41%        |
    6         |      45%        | Limite conforto
──────────────┴─────────────────┴────────────────────

1.2 MÁSCARA DE VENTURI (MV)
────────────────────────────

CARACTERÍSTICA: Fornece FiO2 precisa e constante

TABELA DE CORES E VAZÕES:
─────────────────────────
Cor      | FiO2 | Fluxo O2 | Fluxo Total | Relação Ar:O2
─────────┼──────┼──────────┼─────────────┼──────────────
Azul     |  24% |    2 L   |    48 L/min |    25:1
Branco   |  28% |    4 L   |    44 L/min |    10:1
Laranja  |  31% |    6 L   |    42 L/min |     7:1
Amarelo  |  35% |    8 L   |    40 L/min |     5:1
Vermelho |  40% |   10 L   |    38 L/min |     3:1
Verde    |  50% |   12 L   |    36 L/min |     2:1
─────────┴──────┴──────────┴─────────────┴──────────────

FÓRMULA DA RELAÇÃO AR/O2:
═════════════════════════
Relação = (100 - FiO2) / (FiO2 - 21)

Exemplo para FiO2 40%:
Relação = (100 - 40) / (40 - 21) = 60/19 ≈ 3:1

1.3 MÁSCARA COM RESERVATÓRIO (MR)
─────────────────────────────────

CARACTERÍSTICAS:
• Fluxo mínimo: 10-15 L/min (evitar reinalação de CO2)
• FiO2: 60-90% (depende do fluxo e padrão respiratório)
• Reservatório deve permanecer ≥1/3 cheio durante inspiração

INDICAÇÕES:
✓ Hipoxemia grave (PaO2 < 60 mmHg ou SpO2 < 90%)
✓ Emergências (choque, trauma, IAM)
✓ Pré-oxigenação para intubação

CONTRA-INDICAÇÕES RELATIVAS:
✗ Retenção de CO2 (DPOC grave)
✗ Risco de aspiração
✗ Trauma facial

================================================================================
              SEÇÃO 2: OXIGENOTERAPIA DE ALTO FLUXO (CBAF/HFNC)
================================================================================

2.1 PARÂMETROS E AJUSTES
────────────────────────

CONFIGURAÇÃO INICIAL PADRÃO:
════════════════════════════
• Fluxo: 30-40 L/min (ajustar 30-60 L/min)
• FiO2: Titular para SpO2 92-96% (ou 88-92% se risco hiperCAPNIA)
• Temperatura: 37°C
• Umidificação: 100% (44 mgH2O/L)

FÓRMULA DE AJUSTE DE FLUXO:
═══════════════════════════
Fluxo ideal = 0,5 × FR basal do paciente (L/min)

Exemplo: FR 24 irpm → Fluxo inicial 30-35 L/min

VANTAGENS FISIOLÓGICAS:
1. Lavagem do espaço morto nasofaríngeo
2. PEEP fisiológico (1-3 cmH2O a 30 L/min; 4-6 cmH2O a 60 L/min)
3. Melhora da complacência da parede torácica
4. Conforto superior à máscara

2.2 ÍNDICES DE SUCESSO/FRACAÇÃO
───────────────────────────────

ÍNDICE ROX (Oxigenação):
═══════════════════════
ROX = (SpO2/FiO2) / FR

Interpretação:
• ROX ≥ 4,88 às 2h, 6h e 12h → SUCESSO (baixo risco intubação)
• ROX < 3,85 às 2h → ALTO RISCO de falha → considerar intubação
• ROX 3,85-4,88 → monitorização rigorosa

Exemplo prático:
SpO2 94%, FiO2 0,6 (60%), FR 28
ROX = (94/60) / 28 = 1,57 / 28 = 0,056 × 100 = 5,6 ✓

CRITÉRIOS DE FRACAÇÃO DO CBAF:
══════════════════════════════
☐ FR > 35 irpm persistente
☐ SpO2 < 90% com FiO2 > 0,8
☐ Esforço respiratório intenso (uso musculatura acessória)
☐ Alteração do nível de consciência
☐ Instabilidade hemodinâmica
☐ pH < 7,25 com PaCO2 elevada
☐ Falha em 1-2 horas de teste

2.3 PROTOCOLO DE ESCALONAMENTO
──────────────────────────────

ALGORITMO DECISÃO CBAF:
═══════════════════════

Avaliação inicial
        ↓
SpO2 < 90% com O2 convencional?
        ↓
SIM → Iniciar CBAF
        ├─ Fluxo: 40 L/min
        └─ FiO2: 100% inicial, titular após
        ↓
Reavaliar em 30-60 min
        ↓
Calcular ROX Index
        ↓
ROX ≥ 4,88 → Manter e monitorar q6h
ROX 3,85-4,88 → Otimizar parâmetros, reavaliar q2h
ROX < 3,85 → Considerar VNI ou intubação

================================================================================
                    SEÇÃO 3: VENTILAÇÃO NÃO INVASIVA (VNI)
================================================================================

3.1 MODOS VENTILATÓRIOS
───────────────────────

A) CPAP (Pressão Positiva Contínua)
═══════════════════════════════════
• Pressão contínua durante todo ciclo
• Indicações: Edema pulmonar cardiogênico, apneia do sono
• Parâmetro único: PEEP/CPAP (5-15 cmH2O)

B) BIPAP/PSV + PEEP (Dois Níveis de Pressão)
═══════════════════════════════════════════
• IPAP (Pressão Inspiratória): Suporte pressórico
• EPAP (Pressão Expiratória): PEEP
• PS = IPAP - EPAP

C) AVAPS (Volume Assegurado com Pressão Adaptável)
══════════════════════════════════════════════════
• Garante volume corrente alvo
• Ajusta pressão automaticamente
• Indicado: Doenças neuromusculares, obesidade

3.2 PARÂMETROS INICIAIS E AJUSTES
─────────────────────────────────

CONFIGURAÇÃO INICIAL PADRÃO:
════════════════════════════

PARA DPOC/ASMA:
───────────────
• Modo: S/T (Espontâneo/Temporizado)
• IPAP: 10-12 cmH2O (inicial) → titular até 20 cmH2O
• EPAP: 4-5 cmH2O (pode aumentar para 8-10 se autoPEEP)
• FR backup: 12-16 irpm
• Ti: 0,8-1,2 seg
• FiO2: titular SpO2 88-92%

PARA EDEMA PULMONAR CARDIOGÊNICO:
─────────────────────────────────
• Modo: CPAP ou BIPAP
• Pressão: 8-12 cmH2O
• FiO2: titular SpO2 ≥ 95%

PARA HIPOXÊMICO (Pneumonia, SARA leve):
───────────────────────────────────────
• Modo: BIPAP
• IPAP: 12-14 cmH2O
• EPAP: 8-10 cmH2O (PEEP mais alta)
• FiO2: titular SpO2 92-96%

FÓRMULA DE CÁLCULO DE PRESSÃO DE SUPORTE:
════════════════════════════════════════
PS inicial = 0,5 × (Ppico desejada - PEEP)

Exemplo: Ppico alvo 25, PEEP 5
PS = 0,5 × (25 - 5) = 10 cmH2O

AJUSTE PROGRESSIVO:
══════════════════
1. Iniciar com IPAP 10 / EPAP 5
2. Aumentar IPAP de 2 em 2 cmH2O a cada 5-10 min
3. Meta: VT 6-8 mL/kg (peso ideal), FR < 25
4. Máximo IPAP: 20-25 cmH2O (risco distensão gástrica)

3.3 CRITÉRIOS DE INTUBAÇÃO (FRACAÇÃO VNI)
─────────────────────────────────────────

CRITÉRIOS DE FRACAÇÃO IMEDIATA:
═══════════════════════════════
☐ Parada cardiorrespiratória
☐ Parada respiratória
☐ Alteração aguda do nível de consciência
☐ Aspiração de conteúdo gástrico
☐ Instabilidade hemodinâmica grave (PAS < 90 mmHg)
☐ Arritmia ventricular instável

CRITÉRIOS DE FRACAÇÃO APÓS 1-2 HORAS:
═════════════════════════════════════
☐ pH < 7,25 com PaCO2 > 50 mmHg (DPOC)
☐ PaO2/FiO2 < 150 (hipoxemia persistente)
☐ FR > 35 irpm ou < 8 irpm
☐ Esforço respiratório intenso persistente
☐ Intolerância à interface (não adaptação)
☐ Secreções abundantes (dificuldade clearance)

ESCORE DE FRACAÇÃO VNI:
══════════════════════
1 ponto para cada:
• pH < 7,30
• PaO2/FiO2 < 200
• FR > 30
• Glasgow < 15
• Sepse associada

≥ 2 pontos → Alto risco de falha → considerar intubação precoce

3.4 CALCULADORA VNI INTERATIVA
──────────────────────────────

[INSERIR TABELA NO WORD COM FÓRMULAS]

DADOS DO PACIENTE:
─────────────────
Peso (kg): _______
Altura (cm): _______
Sexo: M ( )  F ( )

CÁLCULOS AUTOMÁTICOS:
────────────────────
Peso Ideal (Devine):
• Homens: 50 + 0,91 × (altura - 152,4)
• Mulheres: 45,5 + 0,91 × (altura - 152,4)

VT Alvo (6-8 mL/kg): _______ a _______ mL

PARÂMETROS SUGERIDOS:
────────────────────
IPAP inicial: _______ cmH2O
EPAP inicial: _______ cmH2O
PS (IPAP-EPAP): _______ cmH2O
FR backup: _______ irpm

================================================================================
                SEÇÃO 4: VENTILAÇÃO MECÂNICA INVASIVA
================================================================================

4.1 MODOS VENTILATÓRIOS COMPLETOS
─────────────────────────────────

A) VCV - VENTILAÇÃO CONTROLADA A VOLUME
═══════════════════════════════════════

CARACTERÍSTICAS:
• Volume corrente fixo
• Pressão variável (depende da complacência/resistência)
• Garantia de minutagem

PARÂMETROS A AJUSTAR:
────────────────────
1. Volume Corrente (VT): 6-8 mL/kg (peso ideal)
2. Frequência Respiratória (FR): 12-20 irpm
3. Fluxo Inspiratório: 40-60 L/min (padrão quadrado) ou 
   desacelerado
4. PEEP: 5 cmH2O (inicial) → ajustar conforme necessidade
5. FiO2: 100% inicial → titular conforme SpO2/PaO2
6. Relação I:E: 1:2 a 1:3
7. Trigger: -2 a -3 cmH2O (sensibilidade) ou 2-3 L/min (fluxo)

VANTAGENS:
✓ Garantia de volume minuto
✓ Monitorização da mecânica pulmonar
✓ Padrão-ouro para proteção pulmonar

DESVANTAGENS:
✗ Pressão de pico variável (risco barotrauma)
✗ Desconforto se não sedado adequadamente
✗ Risco de hipo/hiperventilação se parâmetros inadequados

INDICAÇÕES PREFERENCIAIS:
• Pós-operatório imediato
• Pacientes sedados/paralisados
• SARA (controle rigoroso de VT)
• Hipertensão intracraniana (controle de PaCO2)

B) PCV - VENTILAÇÃO CONTROLADA A PRESSÃO
════════════════════════════════════════

CARACTERÍSTICAS:
• Pressão inspiratória fixa
• Volume corrente variável (depende da complacência)
• Fluxo desacelerado (melhor distribuição)

PARÂMETROS A AJUSTAR:
────────────────────
1. Pcontrol (Pinsp): 10-20 cmH2O acima da PEEP
2. PEEP: 5-15 cmH2O
3. FR: 12-20 irpm
4. Ti (Tempo Inspiratório): 0,8-1,2 seg
5. FiO2: titular
6. Trigger: -2 a -3 cmH2O

VANTAGENS:
✓ Limitação de pressão (proteção contra barotrauma)
✓ Fluxo desacelerado (melhor conforto e distribuição)
✓ Melhor relação V/Q
✓ Menor necessidade de sedação

DESVANTAGENS:
✗ Volume minuto não garantido
✗ Varia com alterações da complacência
✗ Requer monitorização rigorosa do VT

FÓRMULA DE CÁLCULO DE PCONTROL:
═══════════════════════════════
Pcontrol = (VT desejado / Complacência) + (Resistência × Fluxo)

Simplificada:
Pcontrol inicial = 15-20 cmH2O (adulto padrão)
Ajustar para VT 6-8 mL/kg

INDICAÇÕES PREFERENCIAIS:
• Asma grave (limitar Ppico)
• DPOC (fluxo desacelerado)
• Pacientes com desconforto em VCV
• Lesão pulmonar aguda

C) PSV - PRESSÃO DE SUPORTE
═══════════════════════════

CARACTERÍSTICAS:
• Modo espontâneo (paciente dispara todos os ciclos)
• Pressão de suporte constante
• Ciclagem a fluxo (geralmente 25% do pico)

PARÂMETROS A AJUSTAR:
────────────────────
1. PS (Pressão de Suporte): 5-20 cmH2O
2. PEEP: 5-15 cmH2O
3. FiO2: titular
4. Trigger: -1 a -2 cmH2O (mais sensível)
5. Alarme de apneia: 20-30 seg

VANTAGENS:
✓ Máximo conforto (paciente controla FR e Ti)
✓ Ideal para desmame
✓ Preserva musculatura respiratória
✓ Menor sedação necessária

DESVANTAGENS:
✗ Depende de esforço respiratório adequado
✗ Risco de fadiga se PS insuficiente
✗ Volume minuto variável

INDICAÇÕES:
• Desmame ventilatório
• Pacientes conscientes e cooperativos
• Suporte parcial
• Teste de respiração espontânea (PS 5-8 + PEEP 5)

CRITÉRIO DE PRONTIDÃO PARA PSV:
═══════════════════════════════
✓ Despertar adequado (Glasgow ≥ 13)
✓ Estabilidade hemodinâmica
✓ PaO2/FiO2 > 200 com PEEP ≤ 8
✓ pH > 7,25
✓ Hemoglobina > 7-8 g/dL
✓ Ausência de isquemia miocárdica

D) SIMV - VENTILAÇÃO MANDATÓRIA INTERMITENTE
════════════════════════════════════════════

CARACTERÍSTICAS:
• Combina ciclos controlados + espontâneos
• Pode ser SIMV-VC ou SIMV-PC
• Ciclos espontâneos podem ter PS

PARÂMETROS:
───────────
• FR mandatória: 8-12 irpm
• VT ou Pcontrol: conforme modo escolhido
• PS nos ciclos espontâneos: 5-10 cmH2O
• PEEP: conforme necessidade

VANTAGENS:
✓ Transição gradual do controle total para espontâneo
✓ Garantia de ventilação mínima
✓ Preserva força muscular

DESVANTAGENS:
✗ Pode aumentar trabalho respiratório
✗ Risco de assincronia
✗ Desmame pode ser mais lento

INDICAÇÕES:
• Transição de controle total para desmame
• Pacientes com esforço respiratório variável
• Weaning prolongado

E) PRVC - VENTILAÇÃO CONTROLADA A PRESSÃO REGULADA
══════════════════════════════════════════════════

CARACTERÍSTICAS:
• Modo híbrido (pressão com garantia de volume)
• Ajusta automaticamente a pressão para atingir VT alvo
• Combina vantagens de VCV e PCV

PARÂMETROS:
───────────
• VT alvo: 6-8 mL/kg
• PEEP: conforme necessidade
• FR: 12-20 irpm
• Pmax: limitar (geralmente 35-40 cmH2O)
• FiO2: titular

VANTAGENS:
✓ Garantia de volume minuto
✓ Limitação de pressão
✓ Ajuste automático às mudanças da mecânica
✓ Menor trabalho da equipe

DESVANTAGENS:
✗ Pode mascarar piora da complacência
✗ Requer monitorização da pressão
✗ Nem todos os ventiladores têm

INDICAÇÕES:
• Pacientes com mecânica pulmonar instável
• Transição entre modos
• Quando disponível, preferência sobre VCV

F) APRV - VENTILAÇÃO COM LIBERAÇÃO DE PRESSÃO
═════════════════════════════════════════════

CARACTERÍSTICAS:
• Dois níveis de CPAP (Phigh e Plow)
• Tempo prolongado em Phigh (Thigh)
• Liberação breve para Plow (Tlow)
• Respiração espontânea permitida em ambos níveis

PARÂMETROS INICIAIS:
───────────────────
• Phigh: 20-30 cmH2O (igual à Pplatô do modo anterior)
• Plow: 0-5 cmH2O
• Thigh: 4-6 seg
• Tlow: 0,4-0,8 seg (tempo para fluxo expiratório 50-75%)
• FiO2: titular

VANTAGENS:
✓ Recrutamento alveolar sustentado
✓ Melhora oxigenação
✓ Preserva respiração espontânea
✓ Menor necessidade de sedação
✓ Melhora clearance de secreções

DESVANTAGENS:
✗ Curva de aprendizado
✗ Risco de autoPEEP se Tlow muito longo
✗ Não indicado em obstrução grave

INDICAÇÕES:
• SARA moderada a grave
• Hipoxemia refratária
• Obesidade mórbida
• Atelectasias extensas

CONTRA-INDICAÇÕES:
✗ Asma grave/DPOC com aprisionamento
✗ Hipotensão intracraniana (aumento P intratorácica)
✗ Instabilidade hemodinâmica grave

4.2 PARÂMETROS VENTILATÓRIOS - TABELA RESUMO
────────────────────────────────────────────

[INSERIR TABELA NO WORD]

PARÂMETRO         | VALOR INICIAL    | FAIXA SEGURA    | OBSERVAÇÕES
──────────────────┼──────────────────┼─────────────────┼────────────────
VT                | 6-8 mL/kg        | 4-10 mL/kg      | Usar peso ideal
FR                | 12-16 irpm       | 8-30 irpm       | Ajustar pH/PaCO2
Fluxo             | 40-60 L/min      | 30-80 L/min     | Forma de onda
PEEP              | 5 cmH2O          | 0-24 cmH2O      | Titular
FiO2              | 100%             | 21-100%         | Titular SpO2 ≥92%
Pcontrol/PS       | 10-15 cmH2O      | 5-30 cmH2O      | Ajustar VT
Trigger           | -2 cmH2O         | -5 a +5 cmH2O   | Sensibilidade
Ti                | 0,8-1,2 seg      | 0,5-2,0 seg     | Relação I:E
I:E               | 1:2 a 1:3        | 1:1 a 1:5       | Ajustar Ti/FR
Pmax alarme       | 40 cmH2O         | 35-50 cmH2O     | Proteger barotrauma
VT min alarme     | 4 mL/kg          | 3-5 mL/kg       | Detectar desconexão
FR min alarme     | 8 irpm           | 6-10 irpm       | Detectar apneia
FR max alarme     | 30 irpm          | 25-35 irpm      | Detectar taquipneia

4.3 CURVAS E LOOPINGS - INTERPRETAÇÃO
─────────────────────────────────────

A) CURVA DE PRESSÃO X TEMPO
══════════════════════════

VCV (Volume Controlado):
───────────────────────
        Ppico
          ▲
          │     /\
          │    /  \
Pplatô ───┼───/────\────────
          │  /      \
          │ /        \
PEEP ─────/──────────\──────► tempo
         ↑            ↑
      Inspiração   Expiração

Interpretação:
• Ppico: Pressão máxima (resistência + complacência)
• Pplatô: Pressão alveolar (apenas complacência)
• Diferença Ppico-Pplatô = pressão resistiva
• Normal: Ppico < 30, Pplatô < 28, DP < 15

PCV (Pressão Controlada):
─────────────────────────
        Pcontrol
          ▲
          │  ┌────────┐
          │  │        │
          │  │        │
PEEP ─────┴──┘        └─────────► tempo
          ↑            ↑
       Inspiração   Expiração

Pressão quadrada (constante durante inspiração)

B) CURVA DE FLUXO X TEMPO
═════════════════════════

VCV - Fluxo Quadrado:
────────────────────
          ▲
          │  ┌────────┐
          │  │        │
          │  │        │
    0 ────┴──┘        └─────────► tempo
          │            \
          │             \
          ▼              \
       Inspiração      Expiração

VCV - Fluxo Desacelerado:
────────────────────────
          ▲
          │\
          │ \
          │  \
    0 ────┼───\────────────────► tempo
          │    \         /\
          │     \       /  \
          ▼      \     /    \
       Inspiração  Expiração

PCV - Fluxo Desacelerado (padrão):
─────────────────────────────────
          ▲
          │\
          │ \
          │  \
    0 ────┼───\────────────────► tempo
          │    \         /\
          │     \       /  \
          ▼      \     /    \

Interpretação:
• Fluxo pico normal: 40-60 L/min
• Ciclagem: geralmente 25% do fluxo pico
• Retorno à linha base: verificar autoPEEP

C) CURVA DE VOLUME X TEMPO
══════════════════════════

          ▲
     VT   │     /\
          │    /  \
          │   /    \
    0 ────┴──/──────\──────────► tempo
         ↑  /        \
      Inspiração   Expiração

Interpretação:
• Inclinação = fluxo
• Platô = pausa inspiratória
• Retorno completo = sem vazamento
• Volume expirado = volume inspirado (sem vazamento)

D) LOOPING PRESSÃO X VOLUME
═══════════════════════════

        Pressão
          ▲
          │    Inspiração
          │   ↗
     Ppico│  ╱
          │ ╱  Pplatô
          │╱  ╱
    PEEP──┼─╲╱─────────────────
          │  ╲  Expiração
          │   ╲
          │    ╲
          ────────────────────► Volume
               VT

Interpretação:
• Curva anti-horária = normal
• Inclinação = complacência (mais vertical = menor complacência)
• Área do loop = trabalho respiratório
• "Bico de pássaro" = autoPEEP

E) LOOPING FLUXO X VOLUME
═════════════════════════

        Fluxo
          ▲
          │    /\
          │   /  \
          │  /    \
    0 ────┼─/──────\───────────► Volume
          │/        \
          │          \
          │           \
          ▼            \

Interpretação:
• Forma de flor = normal
• Assimetria = obstrução ou restrição
• Não retorno a zero = vazamento

4.4 CALCULADORA DE PARÂMETROS VENTILATÓRIOS
──────────────────────────────────────────

[INSERIR NO WORD COMO TABELA COM FÓRMULAS]

DADOS DO PACIENTE:
─────────────────
Altura (cm): _______
Sexo: M ( )  F ( )
Peso atual (kg): _______
Peso ideal calculado: _______

CÁLCULO DO PESO IDEAL (Devine):
═══════════════════════════════
Homens: 50 + 0,91 × (altura - 152,4)
Mulheres: 45,5 + 0,91 × (altura - 152,4)

Exemplo: Homem 175 cm
PI = 50 + 0,91 × (175 - 152,4) = 50 + 0,91 × 22,6 = 50 + 20,6 = 70,6 kg

PARÂMETROS SUGERIDOS:
────────────────────

MODO VCV:
────────
VT (6 mL/kg): _______ mL
VT (8 mL/kg): _______ mL
FR inicial: _______ irpm
Fluxo: _______ L/min
PEEP: _______ cmH2O
FiO2 inicial: 100% → titular

MODO PCV:
────────
Pcontrol: _______ cmH2O
PEEP: _______ cmH2O
Ti: _______ seg
FR: _______ irpm
FiO2: _______ %

MINUTO-VOLUME ALVO:
──────────────────
VM = VT × FR
Exemplo: 420 mL × 14 = 5.880 mL/min = 5,9 L/min

================================================================================
                    SEÇÃO 5: FÓRMULAS E CÁLCULOS AVANÇADOS
================================================================================

5.1 GASOMETRIA ARTERIAL
───────────────────────

A) EQUAÇÃO DE HENDERSON-HASSELBALCH (SIMPLIFICADA)
══════════════════════════════════════════════════

pH = 6,1 + log (HCO3 / (0,03 × PaCO2))

Valores normais:
• pH: 7,35 - 7,45
• PaCO2: 35 - 45 mmHg
• HCO3: 22 - 26 mEq/L
• PaO2: 80 - 100 mmHg
• SaO2: 95 - 100%
• BE (Excesso de Base): -2 a +2 mEq/L
• Lactato: 0,5 - 1,5 mmol/L

B) CÁLCULO DO BICARBONATO ESPERADO (COMPENSAÇÃO)
═══════════════════════════════════════════════

ACIDOSE RESPIRATÓRIA AGUDA:
───────────────────────────
ΔHCO3 = 0,1 × ΔPaCO2
HCO3 esperado = 24 + [0,1 × (PaCO2 - 40)]

Exemplo: PaCO2 60 mmHg
HCO3 esperado = 24 + [0,1 × (60-40)] = 24 + 2 = 26 mEq/L

ACIDOSE RESPIRATÓRIA CRÔNICA:
─────────────────────────────
ΔHCO3 = 0,4 × ΔPaCO2
HCO3 esperado = 24 + [0,4 × (PaCO2 - 40)]

Exemplo: PaCO2 60 mmHg
HCO3 esperado = 24 + [0,4 × 20] = 24 + 8 = 32 mEq/L

ALCALOSE RESPIRATÓRIA AGUDA:
────────────────────────────
ΔHCO3 = 0,2 × ΔPaCO2
HCO3 esperado = 24 - [0,2 × (40 - PaCO2)]

ALCALOSE RESPIRATÓRIA CRÔNICA:
──────────────────────────────
ΔHCO3 = 0,5 × ΔPaCO2
HCO3 esperado = 24 - [0,5 × (40 - PaCO2)]

ACIDOSE METABÓLICA:
──────────────────
PaCO2 esperada = (1,5 × HCO3) + 8 (±2)

Exemplo: HCO3 15 mEq/L
PaCO2 esperada = (1,5 × 15) + 8 = 22,5 + 8 = 30,5 mmHg (±2)
Faixa: 28,5 - 32,5 mmHg

ALCALOSE METABÓLICA:
───────────────────
PaCO2 esperada = (0,7 × HCO3) + 20 (±2)

Exemplo: HCO3 35 mEq/L
PaCO2 esperada = (0,7 × 35) + 20 = 24,5 + 20 = 44,5 mmHg

C) CÁLCULO DO ANION GAP (LACUNA ANIÔNICA)
════════════════════════════════════════

AG = Na - (Cl + HCO3)
Normal: 8-12 mEq/L (ou 12 ± 4)

Exemplo: Na 140, Cl 100, HCO3 15
AG = 140 - (100 + 15) = 140 - 115 = 25 mEq/L (elevado)

ANION GAP CORRIGIDO (ALBUMINA):
══════════════════════════════
AG corrigido = AG calculado + 2,5 × (4 - albumina g/dL)

Exemplo: AG 12, albumina 2 g/dL
AG corrigido = 12 + 2,5 × (4-2) = 12 + 5 = 17 mEq/L

INTERPRETAÇÃO:
─────────────
AG elevado (>12):
• Acidose lática
• Cetoacidose
• Insuficiência renal
• Intoxicações (metanol, etilenoglicol, salicilatos)

AG normal:
• Diarreia (perda HCO3)
• Acidose tubular renal
• Infusão de soro fisiológico

D) CÁLCULO DO DELTA GAP
══════════════════════

Delta Gap = (AG medido - 12) / (24 - HCO3 medido)

Interpretação:
• < 0,4: Acidose metabólica com AG normal associada
• 0,4 - 0,8: Acidose mista (AG + normal)
• 0,8 - 2,0: Apenas acidose com AG elevado
• > 2,0: Acidose com AG + alcalose metabólica

E) CÁLCULO DA OSMOLALIDADE
══════════════════════════

Osm calculada = (2 × Na) + (Glicose/18) + (BUN/2,8) + (Etanol/4,6)

Normal: 275-295 mOsm/kg

LACUNA OSMOLAR:
══════════════
Lacuna = Osm medida - Osm calculada
Normal: < 10 mOsm/kg

Elevada: intoxicações (álcoois, manitol, glicina)

F) CÁLCULO DO Shunt (Qs/Qt) - FÓRMULA DE BERGGREN
════════════════════════════════════════════════

Qs/Qt = (CcO2 - CaO2) / (CcO2 - CvO2)

Onde:
• CcO2 = conteúdo O2 capilar pulmonar
• CaO2 = conteúdo O2 arterial
• CvO2 = conteúdo O2 venoso misto

Simplificada (estimativa):
Qs/Qt ≈ (PAO2 - PaO2) × 0,003 / [(PAO2 - PaO2) × 0,003 + (CaO2 - CvO2)]

Normal: < 5%
SARA: > 20%

G) CÁLCULO DO ÍNDICE DE OXIGENAÇÃO (OI)
══════════════════════════════════════

OI = (FiO2 × Pmean × 100) / PaO2

Onde Pmean = pressão média das vias aéreas

Interpretação:
• OI < 5: Normal
• OI 5-15: Disfunção pulmonar leve
• OI 15-25: Disfunção moderada
• OI 25-40: Disfunção grave
• OI > 40: Muito grave (considerar ECMO)

H) CÁLCULO DO PaO2/FiO2 (P/F)
════════════════════════════

P/F = PaO2 (mmHg) / FiO2 (decimal)

Exemplo: PaO2 80 mmHg, FiO2 0,6 (60%)
P/F = 80 / 0,6 = 133

CLASSIFICAÇÃO SARA (Berlim):
───────────────────────────
• Leve: 200 < P/F ≤ 300 (com PEEP ≥ 5)
• Moderada: 100 < P/F ≤ 200
• Grave: P/F ≤ 100

I) CÁLCULO DO ÍNDICE DE OXIGENAÇÃO RESPIRATÓRIA (ROX)
═══════════════════════════════════════════════════

ROX = (SpO2 / FiO2) / FR

Já detalhado na seção de CBAF

J) CÁLCULO DA PRESSÃO ALVEOLAR DE O2 (PAO2)
══════════════════════════════════════════

PAO2 = FiO2 × (Patm - PH2O) - (PaCO2 / RQ)

Onde:
• Patm = pressão atmosférica (760 mmHg ao nível do mar)
• PH2O = pressão de vapor d'água (47 mmHg a 37°C)
• RQ = quociente respiratório (0,8)

Simplificada ao nível do mar:
PAO2 = FiO2 × 713 - (PaCO2 / 0,8)
PAO2 = FiO2 × 713 - (PaCO2 × 1,25)

Exemplo: FiO2 0,5, PaCO2 40
PAO2 = 0,5 × 713 - (40 × 1,25) = 356,5 - 50 = 306,5 mmHg

K) GRADIENTE ALVÉOLO-ARTERIAL DE O2 (A-a)
═══════════════════════════════════════

Gradiente A-a = PAO2 - PaO2

Normal: < 10-15 mmHg (jovem)
Aumenta com idade: (Idade/4) + 4

Exemplo: 60 anos, PAO2 300, PaO2 80
Gradiente = 300 - 80 = 220 mmHg (elevado)

Causas de aumento:
• Shunt
• Distúrbio V/Q
• Distúrbio de difusão

L) CÁLCULO DA SATURAÇÃO DE O2 (ESTIMATIVA)
═════════════════════════════════════════

Equação de Severinghouse (simplificada):

SaO2 = 1 / [1 + 23400 / (PaO3 + 150 × PaO)]

Ou usar tabela de conversão:
PaO2  | SaO2
──────┼─────
  40  |  75%
  50  |  85%
  60  |  90%
  70  |  93%
  80  |  95%
  90  |  97%
 100  |  98%

5.2 MECÂNICA RESPIRATÓRIA
─────────────────────────

A) COMPLACÊNCIA DO SISTEMA RESPIRATÓRIO (CRS)
════════════════════════════════════════════

CRS = VT / (Pplatô - PEEP)

Unidade: mL/cmH2O ou L/cmH2O

Exemplo: VT 400 mL, Pplatô 25, PEEP 10
CRS = 400 / (25 - 10) = 400 / 15 = 26,7 mL/cmH2O

Interpretação:
• Normal: 60-100 mL/cmH2O
• SARA: < 40 mL/cmH2O
• < 20 mL/cmH2O: muito grave

B) COMPLACÊNCIA ESTÁTICA vs DINÂMICA
═══════════════════════════════════

Complacência Estática (Cstat):
Cstat = VT / (Pplatô - PEEP)
(Medir com pausa inspiratória de 0,5-2 seg)

Complacência Dinâmica (Cdin):
Cdin = VT / (Ppico - PEEP)
(Sem pausa, durante fluxo)

Cstat > Cdin (diferença indica resistência)

C) RESISTÊNCIA DAS VIAS AÉREAS (Raw)
═══════════════════════════════════

Raw = (Ppico - Pplatô) / Fluxo

Unidade: cmH2O/L/seg

Exemplo: Ppico 35, Pplatô 25, Fluxo 1 L/seg (60 L/min)
Raw = (35 - 25) / 1 = 10 cmH2O/L/seg

Interpretação:
• Normal: 0,5-2,5 cmH2O/L/seg
• Intubação: 3-6 cmH2O/L/seg
• Broncoespasmo: > 10 cmH2O/L/seg
• Obstrução grave: > 15 cmH2O/L/seg

D) PRESSÃO DE DISTENSÃO (DRIVING PRESSURE - DP)
══════════════════════════════════════════════

DP = Pplatô - PEEP
ou
DP = VT / CRS

Exemplo 1: Pplatô 28, PEEP 10
DP = 28 - 10 = 18 cmH2O

Exemplo 2: VT 400 mL, CRS 25 mL/cmH2O
DP = 400 / 25 = 16 cmH2O

IMPORTÂNCIA:
• DP > 15 cmH2O: aumento mortalidade em SARA
• Meta: DP < 14 cmH2O
• Melhor preditor de desfecho que VT isolado

E) PRESSÃO ESOFÁGICA (Pes) - COMPLACÊNCIA DA PAREDE
══════════════════════════════════════════════════

Com cateter esofágico:

Pressão Transpulmonar (PL) = Paw - Pes

Onde:
• Paw = pressão das vias aéreas
• Pes = pressão esofágica (estimativa pressão pleural)

PL expiratória = PEEP - Pes exp
PL inspiratória = Pplatô - Pes insp

Meta: PL expiratória 0-10 cmH2O (evitar colapso/ hiperdistensão)

F) AUTOPEEP (PEEP INTRÍNSECA)
════════════════════════════

Método 1 - Manobra de oclusão expiratória:
─────────────────────────────────────────
AutoPEEP = Pplatô expiratória - PEEP total

Técnica:
1. Ocluir circuito no final da expiração
2. Aguardar equilíbrio (3-5 seg)
3. Medir pressão (PEEP total)
4. AutoPEEP = PEEP total - PEEP externa

Método 2 - Curva de fluxo:
──────────────────────────
Observar se fluxo expiratório não retorna a zero antes da próxima inspiração

Causas:
• FR excessiva
• Texp insuficiente
• Obstrução (asma, DPOC)
• Fluxo expiratório limitado

Consequências:
• Hiperinsuflação dinâmica
• Aumento trabalho respiratório
• Barotrauma
• Hipotensão (diminuição retorno venoso)

Tratamento:
• Diminuir FR
• Aumentar fluxo expiratório
• Diminuir Ti (aumentar Texp)
• Broncodilatadores
• Sedação

G) TRABALHO RESPIRATÓRIO (WOB)
═════════════════════════════

WOB = ∫ P × dV

Área sob a curva pressão-volume

Unidade: Joules/L ou cmH2O×L/min

Normal: 0,3-0,6 J/L
Aumentado: > 1,0 J/L (fadiga muscular)

H) ÍNDICE DE RESPIRAÇÃO RÁPIDA E SUPERFICIAL (RSBI)
══════════════════════════════════════════════════

RSBI = FR / VT (em litros)

Exemplo: FR 28 irpm, VT 0,4 L (400 mL)
RSBI = 28 / 0,4 = 70

Interpretação (desmame):
• RSBI < 105: preditor de sucesso no desmame
• RSBI > 105: alto risco de falha
• Sensibilidade: 78%, Especificidade: 60%

Melhor ponto de corte: 80-105

I) PRESSÃO DE OCLUSÃO DAS VIAS AÉREAS (P0.1)
═══════════════════════════════════════════

P0.1 = pressão gerada nos primeiros 100 ms de inspiração

Medida:
• Ocluir via aérea no início da inspiração
• Medir pressão negativa gerada

Interpretação:
• Normal: < 2 cmH2O
• Aumentado: > 4-6 cmH2O (aumento drive respiratório)
• > 6 cmH2O: desconforto, risco fadiga

Uso:
• Avaliar esforço respiratório
• Ajustar nível de suporte
• Prever sucesso no desmame

J) ELASTÂNCIA DO SISTEMA RESPIRATÓRIO
════════════════════════════════════

Elastância = 1 / Complacência

Unidade: cmH2O/L

Exemplo: CRS 0,04 L/cmH2O (40 mL/cmH2O)
Elastância = 1 / 0,04 = 25 cmH2O/L

5.3 TROCA GASOSA
────────────────

A) CONTEÚDO ARTERIAL DE OXIGÊNIO (CaO2)
══════════════════════════════════════

CaO2 = (1,34 × Hb × SaO2) + (0,003 × PaO2)

Onde:
• 1,34 = constante de Hüfner (mL O2/g Hb)
• Hb = hemoglobina (g/dL)
• SaO2 = saturação arterial (%)
• 0,003 = coeficiente de solubilidade do O2
• PaO2 = pressão parcial de O2 (mmHg)

Exemplo: Hb 12 g/dL, SaO2 95%, PaO2 80 mmHg
CaO2 = (1,34 × 12 × 0,95) + (0,003 × 80)
CaO2 = 15,3 + 0,24 = 15,54 mL O2/dL

Normal: 16-22 mL O2/dL

B) CONTEÚDO VENOSO MISTO DE OXIGÊNIO (CvO2)
══════════════════════════════════════════

CvO2 = (1,34 × Hb × SvO2) + (0,003 × PvO2)

SvO2 normal: 65-75%
CvO2 normal: 12-16 mL O2/dL

C) EXTRAÇÃO DE OXIGÊNIO (O2ER)
═════════════════════════════

O2ER = (CaO2 - CvO2) / CaO2

ou

O2ER = (SaO2 - SvO2) / SaO2

Normal: 20-30%

Aumentada (>30%):
• Baixo débito cardíaco
• Anemia
• Hipoxemia

Diminuída (<20%):
• Shunt
• Intoxicação cianeto
• Hipertireoidismo
• Sepse (fase hiperdinâmica)

D) CONSUMO DE OXIGÊNIO (VO2)
════════════════════════════

VO2 = DC × (CaO2 - CvO2) × 10

Onde:
• DC = débito cardíaco (L/min)
• Fator 10: conversão dL para L

Normal: 200-250 mL/min (ou 3-4 mL/kg/min)

Exemplo: DC 5 L/min, CaO2 18, CvO2 14
VO2 = 5 × (18-14) × 10 = 5 × 4 × 10 = 200 mL/min

E) ENTREGA DE OXIGÊNIO (DO2)
════════════════════════════

DO2 = DC × CaO2 × 10

Normal: 900-1100 mL/min (ou 15-20 mL/kg/min)

Exemplo: DC 5 L/min, CaO2 18 mL/dL
DO2 = 5 × 18 × 10 = 900 mL/min

F) RELAÇÃO VO2/DO2
═════════════════

Normal: VO2 independente de DO2 (plateau)
Crítico: DO2 < 300-400 mL/min → VO2 dependente de DO2

G) CÁLCULO DO DÉBITO CARDÍACO (FICK)
═══════════════════════════════════

DC = VO2 / [(CaO2 - CvO2) × 10]

Exemplo: VO2 250 mL/min, CaO2 18, CvO2 13
DC = 250 / [(18-13) × 10] = 250 / 50 = 5 L/min

H) ÍNDICE CARDÍACO (IC)
══════════════════════

IC = DC / SC

Onde SC = superfície corporal

SC (DuBois) = 0,007184 × (peso^0,425) × (altura^0,725)

Normal IC: 2,5-4,0 L/min/m²

I) RESISTÊNCIA VASCULAR SISTÊMICA (RVS)
══════════════════════════════════════

RVS = [(PAM - PVC) / DC] × 80

Onde:
• PAM = pressão arterial média
• PVC = pressão venosa central
• Fator 80: conversão para dinas×seg×cm^-5

Normal: 800-1200 dinas×seg×cm^-5

Exemplo: PAM 85, PVC 8, DC 5
RVS = [(85-8) / 5] × 80 = (77/5) × 80 = 15,4 × 80 = 1232

J) RESISTÊNCIA VASCULAR PULMONAR (RVP)
════════════════════════════════════

RVP = [(PAPm - PCP) / DC] × 80

Onde:
• PAPm = pressão arterial pulmonar média
• PCP = pressão capilar pulmonar (ou PCWP)

Normal: 100-250 dinas×seg×cm^-5

5.4 ÍNDICES PROGNÓSTICOS
────────────────────────

A) APACHE II (RESUMIDO)
══════════════════════

Pontuação:
• Idade: 0-6 pontos
• Fisiologia aguda: 0-60 pontos (12 parâmetros)
• Doença crônica: 0-5 pontos

Mortalidade estimada:
• 0-4: 3%
• 5-9: 8%
• 10-14: 15%
• 15-19: 25%
• 20-24: 40%
• 25-29: 55%
• 30-34: 75%
• ≥35: >85%

B) SAPS 3
═══════

Mais complexo, calculadora online recomendada

C) SOFA (SEQUENTIAL ORGAN FAILURE ASSESSMENT)
═══════════════════════════════════════════

[INSERIR TABELA]

Sistema  | 0 | 1 | 2 | 3 | 4
─────────┼───┼───┼───┼───┼───
Resp     |   |   |   |   |
PaO2/FiO2|>400|≤400|≤300|≤200|≤100
         |   |   |   |   |com VM
Coag     |   |   |   |   |
Plaquetas|>150|≤150|≤100|≤50 |≤20
         |   |   |   |   |×10³
Fígado   |   |   |   |   |
Bilirrub.|<1,2|1,2- |2,0- |6,0- |>12,0
(mg/dL)  |   |1,9  |5,9  |11,9 |
Cardio   |   |   |   |   |
PAM      |≥70|<70|Dopa≤5|Dopa>5|Dopa>15
         |   |   |ou Dob|ou Dob|ou Dob>0,1
         |   |   |qualq.|qualq.|+ Epi≤0,1
         |   |   |      |      |+ Epi>0,1
Neuro    |   |   |   |   |
Glasgow  | 15|13-|10- | 6- | <6
         |   |14  |12  | 9  |
Renal    |   |   |   |   |
Creatinina|<1,2|1,2- |2,0- |3,5- |>5,0
(mg/dL)  |   |1,9  |3,4  |4,9  |
ou       |   |   |   |   |
Diurese  |   |   |<0,5|<0,3|<0,3
         |   |   |mL/kg|mL/kg|mL/kg
         |   |   |/h   |/h   |/h
         |   |   |     |     |×12h ×24h

Interpretação:
• SOFA basal: prognóstico
• ΔSOFA (admissão-48h): resposta tratamento
• SOFA ≥ 2: disfunção orgânica
• Cada ponto: ↑ mortalidade em 10-20%

D) ÍNDICE DE MORTALIDADE EM SARA
══════════════════════════════

Fatores de risco:
• Idade > 60 anos
• SOFA ≥ 8
• P/F < 100
• Complacência < 30 mL/cmH2O
• Acidose (pH < 7,20)
• Sepse associada

E) PREDITORES DE SUCESSO NO DESMAME
══════════════════════════════════

✓ RSBI < 105
✓ FR < 35
✓ VT > 5 mL/kg
✓ P0.1 < 4-6 cmH2O
✓ PImax < -20 a -30 cmH2O
✓ Estabilidade hemodinâmica
✓ Glasgow ≥ 13
✓ PaO2/FiO2 > 200
✓ PEEP ≤ 5-8
✓ PS ≤ 5-8
✓ Ausência de acidose
✓ Hemoglobina > 7-8

================================================================================
            SEÇÃO 6: SÍNDROME DO DESCONFORTO RESPIRATÓRIO AGUDO
================================================================================

6.1 DEFINIÇÃO E CLASSIFICAÇÃO (BERLIM 2012)
───────────────────────────────────────────

CRITÉRIOS DIAGNÓSTICOS:
══════════════════════
1. Início: ≤ 7 dias de insulto conhecido
2. Imagem: Opacidades bilaterais (RX ou TC)
   - Não explicadas por derrame, colapso ou nódulos
3. Origem do edema: Insuficiência cardíaca ou 
   sobrecarga volêmica não explicam completamente
4. Oxigenação (com PEEP ≥ 5 cmH2O):

CLASSIFICAÇÃO:
──────────────
                PaO2/FiO2    Mortalidade
                (mmHg)       estimada
Leve           200-300         27%
Moderada       100-200         32%
Grave           ≤ 100          45%

6.2 VENTILAÇÃO PROTETORA - PROTOCOLO ARDSNet
────────────────────────────────────────────

PASSO 1: CALCULAR PESO IDEAL
════════════════════════════
Homens: 50 + 0,91 × (altura cm - 152,4)
Mulheres: 45,5 + 0,91 × (altura cm - 152,4)

Exemplo: Mulher 165 cm
PI = 45,5 + 0,91 × (165-152,4) = 45,5 + 11,5 = 57 kg

PASSO 2: AJUSTAR MODO E PARÂMETROS
══════════════════════════════════
Modo: VCV ou PCV (preferência VCV)

Parâmetros iniciais:
• VT: 8 mL/kg (peso ideal) → reduzir para 6 mL/kg
• FR: Iniciar 14-16 irpm → ajustar pH
• PEEP: Ver tabela abaixo
• FiO2: Iniciar 100% → titular PaO2 55-80 ou SpO2 88-95%
• Fluxo: 60-80 L/min (melhor conforto)
• I:E: 1:2 a 1:3 (pode inverter se necessário)

META:
────
• VT: 4-8 mL/kg (ideal 6)
• Pplatô: < 30 cmH2O
• DP (Pplatô-PEEP): < 15 cmH2O
• pH: ≥ 7,20 (aceitar hipercapnia permissiva)
• PaCO2: aumentar gradualmente (máx 80-100 se pH ≥ 7,15)
• PaO2: 55-80 mmHg
• SpO2: 88-95%

TABELA DE PEEP/FiO2 (ARDSNet):
═════════════════════════════

 Nível  |  FiO2  |  PEEP
────────┼────────────────
   1    |  0,3   |   5
   2    |  0,4   |   5
   3    |  0,4   |   8
   4    |  0,5   |   8
   5    |  0,5   |  10
   6    |  0,6   |  10
   7    |  0,7   |  10
   8    |  0,7   |  12
   9    |  0,8   |  14
  10    |  0,9   |  14
  11    |  0,9   |  16
  12    |  1,0   |  16
  13    |  1,0   |  18
  14    |  1,0   |  20
  15    |  1,0   |  22
  16    |  1,0   |  24

Como usar:
1. Iniciar com FiO2 1,0 e PEEP adequada
2. Reduzir FiO2 primeiro (meta ≤ 0,6)
3. Depois reduzir PEEP
4. Manter SpO2 88-95%

TABELA ALTERNATIVA (PEEP MAIS ALTA):
═══════════════════════════════════
Para SARA grave (P/F < 150):

 FiO2   |  PEEP Baixa | PEEP Alta
────────┼─────────────┼──────────
 0,3-0,4|      5      |    5-8
 0,4-0,5|      5-8    |   8-10
 0,5-0,6|      8-10   |  10-14
 0,6-0,7|     10      |  14-16
 0,7-0,8|     10-14   |  16-18
 0,8-0,9|     14-16   |  18-20
 0,9-1,0|     16-18   |  20-24

Estudo ALVEOLI: PEEP mais alta pode beneficiar SARA grave

PASSO 3: MONITORAR E AJUSTAR
════════════════════════════

A cada 1-2 horas inicialmente:
☐ Gasometria arterial
☐ Pplatô (pausa inspiratória)
☐ Complacência
☐ DP
☐ Ppico
☐ SpO2 e FR

Ajustes:
────────
Se Pplatô > 30:
→ Reduzir VT de 1 mL/kg (mínimo 4 mL/kg)
→ Se VT já 4 e Pplatô > 30: considerar manobras de recrutamento, 
  pronação, bloqueio

Se pH < 7,15-7,20:
→ Aumentar FR (máx 35)
→ Se não resolver: bicarbonato (controvérsia)
→ Considerar ECMO se refratário

Se PaO2 < 55 ou SpO2 < 88%:
→ Aumentar FiO2 (tabela)
→ Aumentar PEEP (tabela)
→ Considerar manobra recrutamento
→ Pronação
→ Bloqueio neuromuscular

6.3 MANOBRAS DE RECRUTAMENTO ALVEOLAR
────────────────────────────────────

INDICAÇÕES:
✓ SARA moderada/grave
• Hipoxemia refratária
• Atelectasias extensas
• Após desconexão do VM
• Antes de pronação

CONTRA-INDICAÇÕES:
✗ Instabilidade hemodinâmica
✗ Barotrauma recente (pneumotórax)
✗ Hipertensão intracraniana
✗ Cirurgia torácica recente
✗ Embolia pulmonar

TÉCNICA 1 - CPAP CONTÍNUA:
─────────────────────────
• CPAP 30-40 cmH2O por 30-40 seg
• FiO2 100%
• Monitorização contínua

TÉCNICA 2 - PRESSÃO CONTROLADA:
──────────────────────────────
• Pcontrol 40-50 cmH2O
• PEEP 20-25 cmH2O
• FR 10-12
• Ti 2-3 seg
• Duração: 2-3 min

TÉCNICA 3 - INCREMENTAL PEEP (mais segura):
─────────────────────────────────────────
• Aumentar PEEP de 5 em 5 cmH2O a cada 2 min
• Manter Pcontrol constante (ajustar para VT)
• PEEP máxima: 35-40 cmH2O
• Depois reduzir gradualmente

TÉCNICA 4 - SUSTAINED INFLATION:
───────────────────────────────
• Pcontrol 15-20 acima da PEEP basal
• PEEP 15-20
• Por 2 min
• FiO2 100%

MONITORIZAÇÃO DURANTE MANOBRA:
─────────────────────────────
☐ PAM (pressão arterial média)
☐ FC
☐ SpO2
☐ ECG
☐ Ppico e Pplatô

INTERROMPER SE:
✗ PAM < 60 mmHg
✗ SpO2 < 85%
✗ Arritmias
✗ Ppico > 50 cmH2O

AVALIAÇÃO DE RESPOSTA:
─────────────────────
Imediata (30 min):
• ↑ PaO2/FiO2 > 50 mmHg = respondedor
• ↑ Complacência
• ↓ Ppico e Pplatô

Sustentada (24h):
• Manter melhora oxigenação
• Reduzir FiO2 e PEEP

6.4 PRONAÇÃO - PROTOCOLO
────────────────────────

INDICAÇÕES (Estudo PROSEVA):
✓ SARA grave (P/F < 150)
✓ PEEP ≥ 10
✓ FiO2 ≥ 0,6
✓ Iniciar precocemente (< 36h)

CONTRA-INDICAÇÕES:
✗ Instabilidade hemodinâmica
✗ Fraturas instáveis
✗ Cirurgia facial/torácica recente
✗ Gravidez
✗ Obesidade mórbida extrema (relativa)
✗ Pressão intracraniana elevada

PREPARAÇÃO:
──────────
Equipe: mínimo 4-5 pessoas
• 1 médico (cabeceira, via aérea)
• 2-3 enfermeiros/fisioterapeutas (laterais)
• 1 para pés/membros

Materiais:
• Colchão especial ou travesseiros
• Fita adesiva
• Gazes/protetores
• Aspirador
• Ambu
• Drogas vasoativas preparadas
• Sedação/analgesia adequadas

CHECKLIST PRÉ-PRONAÇÃO:
──────────────────────
☐ Sedação adequada (RASS -4 a -5)
☐ Analgesia
☐ Bloqueio neuromuscular (opcional, mas recomendado)
☐ Via aérea segura (fixação reforçada)
☐ Acesso venoso central seguro
☐ Drogas vasoativas em bomba
☐ Sonda gástrica aberta (evitar distensão)
☐ Cateter vesical
☐ Retirar objetos soltos
☐ Explicar procedimento (se consciente)

TÉCNICA:
────────
1. Posicionar paciente em decúbito dorsal
2. Elevar leito à altura adequada
3. Posicionar equipe (2 de cada lado + cabeceira)
4. Elevar braços ao lado do corpo
5. Virar em bloco (contar 1-2-3)
6. Acomodar em decúbito ventral
7. Posicionar cabeça (alternar lado a cada 2-4h)
8. Posicionar braços (posição de nadador ou ao lado)
9. Colocar travesseiros/almofadas:
   - Tórax (evitar compressão abdominal)
   - Pelve
   - Joelhos
   - Tornozelos
10. Verificar todos os dispositivos
11. Ausculta pulmonar
12. Gasometria (30-60 min)

DURAÇÃO:
────────
• Mínimo: 12-16 horas consecutivas
• Ideal: 16-20 horas
• Ciclos: 1-4 ciclos (média 3)
• Intervalo: 12-24h em decúbito dorsal

MONITORIZAÇÃO:
─────────────
☐ Contínua: ECG, PAM, SpO2
☐ Hourly: Pressão de pico, complacência
☐ Gasometria: 30 min, 2h, 6h, 12h
☐ Pele: a cada 2-4h (proteger pontos de pressão)
☐ Olhos: lubrificar, fechar
☐ Tubos: verificar permeabilidade

CRITÉRIOS PARA SUPENDER PRONAÇÃO:
────────────────────────────────
✓ P/F > 150 por > 4h com:
  - PEEP ≤ 10
  - FiO2 ≤ 0,6
✓ Estabilidade hemodinâmica
✓ Após mínimo 12-16h de pronação

COMPLICAÇÕES:
────────────
• Extubação acidental (1-3%)
• Obstrução de tubo
• Deslocamento de cateteres
• Lesões de pele/pressão
• Edema facial
• Neuropatias compressivas
• Isquemia ocular (raro)

BENEFÍCIOS:
──────────
✓ Melhora oxigenação (aumento P/F)
✓ Redução mortalidade (SARA grave)
✓ Homogeneização ventilação
✓ Recrutamento alveolar
✓ Melhora drenagem secreções
✓ Proteção pulmonar

6.5 BLOQUEIO NEUROMUSCULAR
─────────────────────────

INDICAÇÕES:
✓ SARA grave (P/F < 120-150)
✓ Assincronia grave refratária
✓ Necessidade de controle rigoroso de Pplatô
✓ Pronação (facilitar)
✓ Hipertensão intracraniana
✓ Status asmático grave

CONTRA-INDICAÇÕES:
✗ Miastenia gravis
✗ Síndrome de Guillain-Barré
✗ Queimaduras extensas (>48h)
✗ Trauma raquimedular
✗ Alergia conhecida

DROGAS:
───────

A) CISATRACÚRIO (preferido):
──────────────────────────
• Dose: 0,1-0,2 mg/kg em bolus
• Infusão: 1-3 mcg/kg/min (0,06-0,18 mg/kg/h)
• Metabolismo: Hofmann (independente fígado/rim)
• Duração: 20-30 min (bolus)
• Efeitos: mínimos cardiovasculares

B) ROCURÔNIO:
────────────
• Dose: 0,6-1,2 mg/kg (intubação)
• Infusão: 6-12 mcg/kg/min (0,36-0,72 mg/kg/h)
• Metabolismo: hepático
• Duração: 30-60 min
• Reversão: sugammadex (se necessário)

C) VECURÔNIO:
────────────
• Dose: 0,08-0,1 mg/kg
• Infusão: 1-2 mcg/kg/min
• Metabolismo: hepático/renal
• Duração: 20-30 min

PROTOCOLO DE ADMINISTRAÇÃO:
──────────────────────────
1. Sedação profunda ANTES do bloqueio
   - Propofol: 2-4 mg/kg/h
   - Midazolam: 0,05-0,2 mg/kg/h
   - + Opioide (fentanil/morfina/sufentanil)

2. Analgesia adequada
   - Fentanil: 1-5 mcg/kg/h
   - Sufentanil: 0,2-1 mcg/kg/h
   - Remifentanil: 0,05-0,3 mcg/kg/min

3. Iniciar bloqueio
   - Bolus inicial
   - Infusão contínua

4. Monitorização:
   ☐ TOF (Train-of-Four) - ideal
   ☐ Ausência de movimento
   ☐ Ausência de assincronia
   ☐ Pplatô e DP
   ☐ Gasometria

5. Duração:
   • Máximo: 48 horas consecutivas
   • Reavaliar diariamente
   • Suspender quando possível

6. "Férias" do bloqueio (se > 48h):
   • Interromper 4-6h a cada 24h
   • Avaliar necessidade de continuidade
   • Verificar função neuromuscular

MONITORIZAÇÃO DO BLOQUEIO:
─────────────────────────
TOF (Train-of-Four):
• 4 estímulos elétricos
• Contar contrações musculares
• Meta: 1-2/4 respostas (bloqueio profundo)
• 0/4: bloqueio excessivo
• 4/4: bloqueio insuficiente

Sem TOF disponível:
• Ausência de movimento
• Ausência de disparos no VM
• Pplatô adequada
• Ausência de assincronia

EFEITOS ADVERSOS:
────────────────
• Fraqueza muscular prolongada
• Miopatia
• Reações alérgicas
• Liberação histamina (menos com cisatracúrio)
• Taquicardia (vecurônio/rocurônio)

INTERRUPÇÃO:
───────────
• Suspender infusão
• Aguardar recuperação (30-90 min)
• Avaliar força muscular
• Fisioterapia respiratória
• Desmame sedação

6.6 ECMO - CRITÉRIOS
────────────────────

TIPOS:
──────
1. V-V ECMO (veno-venoso): Suporte respiratório
2. V-A ECMO (veno-arterial): Suporte cardiorrespiratório

INDICAÇÕES PARA SARA:
✓ SARA grave refratária
✓ P/F < 50 por > 3h
✓ P/F < 80 por > 6h
✓ pH < 7,15-7,20 com PaCO2 > 60
✓ Pplatô > 35 apesar de otimização
✓ Mortalidade estimada > 50% (score ECMO)

CRITÉRIOS DE INCLUSÃO (CESAR Trial):
───────────────────────────────────
• Idade 18-65 anos
• SARA grave
• Murray Score ≥ 3,0 ou pH < 7,20
• Sem contraindicações absolutas

MURRAY SCORE (Lung Injury Score):
────────────────────────────────
Avaliar 4 parâmetros (0-4 pontos cada):

1. PaO2/FiO2:
   >300 = 0
   225-299 = 1
   175-224 = 2
   100-174 = 3
   <100 = 4

2. PEEP:
   ≤5 = 0
   6-8 = 1
   9-11 = 2
   12-14 = 3
   ≥15 = 4

3. Complacência:
   ≥80 = 0
   60-79 = 1
   40-59 = 2
   20-39 = 3
   ≤19 = 4

4. Opacidades RX (4 quadrantes):
   0 = 0
   1 = 1
   2 = 2
   3 = 3
   4 = 4

Score total / 4 = índice
• 0 = normal
• 0,1-2,5 = lesão pulmonar aguda
• 2,5-4,0 = SARA

CONTRA-INDICAÇÕES:
✗ Idade > 65-70 anos (relativa)
✗ Doença terminal/irreversível
✗ Imunossupressão grave
✗ Sangramento ativo/contra-indicação anticoagulação
✗ AVC recente/hemorragia intracraniana
✗ Cirurgia recente (não urgente)
✗ Trauma múltiplo grave
✗ Queimaduras extensas
✗ Expectativa de vida < 6 meses

PROTOCOLO DE INÍCIO:
───────────────────
1. Otimizar VM convencional
2. Manobras de recrutamento
3. Pronação (mínimo 1 ciclo)
4. Bloqueio neuromuscular
5. Reavaliar em 6-24h
6. Se refratário → considerar ECMO

Transferência para centro ECMO:
• Contatar equipe especializada
• Estabilizar paciente
• Transporte especializado

MANEJO COM ECMO:
───────────────
• VM "protetora ultra": 
  - VT 3-4 mL/kg
  - FR 5-10
  - PEEP 10-15
  - FiO2 30-40%
• Anticoagulação (heparina)
• Monitorização rigorosa
• Fisioterapia
• Nutrição

================================================================================
                    SEÇÃO 7: ASSINCRONIAS VENTILATÓRIAS
================================================================================

7.1 CLASSIFICAÇÃO E IDENTIFICAÇÃO
─────────────────────────────────

TIPOS DE ASSINCRONIAS:
══════════════════════

A) ASSINCRONIAS DE DISPARO (TRIGGER)
────────────────────────────────────

1. DISPARO INEFICAZ (Failed Trigger)
═══════════════════════════════════
CURVA:
      Pressão
        ▲
        │  ┌─┐     ┌─┐
        │  │ │     │ │
        │  │ │  ↓  │ │  ↓ = esforço não
        │  │ │     │ │      disparou
PEEP ───┴──┘ └───── └─────────► tempo

Fluxo:
      ▲
      │  ┌─┐     ┌─┐
      │  │ │     │ │
  0 ──┴──┘ └───── └──────────►
         ↓
    esforço sem ciclo

CAUSAS:
• AutoPEEP excessiva
• Trigger pouco sensível
• Fraqueza muscular
• Sedação excessiva

SOLUÇÕES:
✓ Aumentar sensibilidade do trigger
  (diminuir valor negativo: -3 → -2 → -1)
✓ Diminuir autoPEEP
  - Aumentar fluxo expiratório
  - Diminuir FR/Ti
  - Broncodilatadores
✓ Reduzir sedação
✓ Tratar causa da fraqueza

2. AUTODISPARO (Auto-triggering)
══════════════════════════════
CURVA:
      Pressão
        ▲
        │  ┌─┐┌─┐┌─┐
        │  │ ││ ││ │  Ciclos sem esforço
        │  │ ││ ││ │  do paciente
PEEP ───┴──┘ └─┘─┴─────────► tempo

CAUSAS:
• Vazamento no circuito
• Condensação no circuito
• Trigger muito sensível
• Cardiogenic oscillations
• Refluxo gástrico

SOLUÇÕES:
✓ Diminuir sensibilidade (aumentar trigger)
✓ Verificar vazamentos
✓ Drenar condensação
✓ Ajustar alarmes
✓ Verificar cuff do TOT

B) ASSINCRONIAS DE CICLAGEM
───────────────────────────

3. CICLAGEM PRECOCE
══════════════════
CURVA:
      Fluxo
        ▲
        │\
        │ \
        │  \  ↓ ciclagem antes
    0 ──┼───\─── do fim do fluxo
        │    \  ↓
        │     \
        ▼      \

Pressão:
        ▲
        │  ┌─┐
        │  │ │↓
        │  │ │
PEEP ───┴──┘ └─────────────►

CAUSAS:
• Ti muito curto
• Sensibilidade de ciclagem muito alta
  (75% → 50% → 25%)
• Obstrução das vias aéreas

CONSEQUÊNCIAS:
✗ "Air hunger" (fome de ar)
✗ Aumento trabalho respiratório
✗ Desconforto
✗ Duplo disparo

SOLUÇÕES:
✓ Aumentar Ti
✓ Diminuir sensibilidade de ciclagem
  (de 25% para 10-15% em DPOC)
✓ Aumentar fluxo inspiratório
✓ Broncodilatadores

4. CICLAGEM TARDIA
═════════════════
CURVA:
      Fluxo
        ▲
        │\
        │ \
        │  \
    0 ──┼───\─────────
        │    \       ↓
        │     \______↓ ciclagem após
        ▼            fim do esforço

Pressão:
        ▲
        │  ┌─────┐
        │  │     │↑
        │  │     │
PEEP ───┴──┘     └─────────►

CAUSAS:
• Ti muito longo
• Sensibilidade de ciclagem muito baixa
• Esforço expiratório precoce

CONSEQUÊNCIAS:
✗ Aumento Ppico
✗ Desconforto
✗ Aumento autoPEEP
✗ Esforço contra o ventilador

SOLUÇÕES:
✓ Diminuir Ti
✓ Aumentar sensibilidade de ciclagem
  (25% → 50% → 75%)
✓ Ajustar sedação

C) ASSINCRONIAS DE FLUXO
────────────────────────

5. FOME DE FLUXO (Flow Starvation)
════════════════════════════════
CURVA:
      Pressão
        ▲
        │  /─┐
        │ /  │  Concavidade na
        │/   │  curva de pressão
PEEP ───┘   └───────────────►

Fluxo:
        ▲
        │  ┌───┐
        │  │   │  Fluxo insuficiente
    0 ──┴──┘   └──────────────►

CAUSAS:
• Fluxo inspiratório inadequado
• FR elevada
• Demanda > oferta

SOLUÇÕES:
✓ Aumentar fluxo inspiratório
  (40 → 60 → 80 L/min)
✓ Mudar para fluxo desacelerado
✓ Aumentar PS ou Pcontrol
✓ Sedação/analgesia

D) ASSINCRONIAS DE ESFORÇO
──────────────────────────

6. DUPLO DISPARO (Double Triggering)
══════════════════════════════════
CURVA:
      Pressão
        ▲
        │  ┌───┐
        │  │   │┌───
        │  │   ││   │  Dois ciclos
PEEP ───┴──┘   └┘   └─  consecutivos
        │               sem expiração
        └──────────────────────────►

Volume:
        ▲
        │  ┌─────┐
        │  │     │  VT acumulado
        │  │     │  (stacking)
    0 ──┴──┘     └──────────────►

CAUSAS:
• Demanda de fluxo elevada
• Ti muito curto
• Esforço inspiratório intenso
• Ansiedade/dor

CONSEQUÊNCIAS:
✗ "Stacking" de volume
✗ Hiperinsuflação
✗ Barotrauma
✗ Ppico elevada

SOLUÇÕES:
✓ Aumentar Ti
✓ Aumentar fluxo
✓ Aumentar sedação/analgesia
✓ Tratar dor/ansiedade
✓ Considerar modo controlado
  temporariamente

7. REVERSE TRIGGERING
════════════════════
CURVA:
      Pressão
        ▲
        │  ┌─┐ ┌─┐
        │  │ │ │ │  Ciclo ventilador
        │  │ │↓│ │  dispara esforço
PEEP ───┴──┘ └─┘ └─  do paciente
        │      ↓
        └─────────────►

Mecanismo:
• Insuflação pulmonar → reflexo → esforço
• Comum em pacientes com bloqueio
• Pode causar duplo disparo

SOLUÇÕES:
✓ Aumentar sedação
✓ Bloqueio neuromuscular
✓ Ajustar parâmetros

7.2 ALGORITMO DE DIAGNÓSTICO
────────────────────────────

Paciente com desconforto/assincronia
                ↓
Avaliar curvas (pressão, fluxo, volume)
                ↓
Identificar tipo de assincronia
                ↓
────────────────────────────────
DISPARO INEFICAZ?
• Esforço sem ciclo
        ↓
✓ Aumentar sensibilidade trigger
✓ Diminuir autoPEEP
✓ Reduzir sedação
────────────────────────────────
AUTODISPARO?
• Ciclos sem esforço
        ↓
✓ Diminuir sensibilidade
✓ Verificar vazamentos
✓ Drenar circuito
────────────────────────────────
CICLAGEM PRECOCE?
• Ciclagem antes do fim fluxo
        ↓
✓ Aumentar Ti
✓ Diminuir % ciclagem
✓ Aumentar fluxo
────────────────────────────────
CICLAGEM TARDIA?
• Ciclagem após fim esforço
        ↓
✓ Diminuir Ti
✓ Aumentar % ciclagem
────────────────────────────────
FOME DE FLUXO?
• Concavidade na pressão
        ↓
✓ Aumentar fluxo
✓ Fluxo desacelerado
✓ Aumentar PS
────────────────────────────────
DUPLO DISPARO?
• Dois ciclos consecutivos
        ↓
✓ Aumentar Ti
✓ Aumentar sedação
✓ Verificar dor/ansiedade
────────────────────────────────

Se persistir:
→ Reavaliar modo ventilatório
→ Aumentar sedação/analgesia
→ Considerar bloqueio temporário
→ Verificar causa subjacente

7.3 TABELA RESUMO DE AJUSTES
────────────────────────────

[INSERIR TABELA NO WORD]

Assincronia      | Ajuste Principal     | Ajuste Secundário
─────────────────┼──────────────────────┼──────────────────
Disparo ineficaz │ Trigger -2 → -1 cmH2O│ Diminuir autoPEEP
Autodisparo      │ Trigger -2 → -3 cmH2O│ Verificar vazamento
Ciclagem precoce │ Ti 0,8 → 1,2 seg     │ Ciclagem 25% → 10%
Ciclagem tardia  │ Ti 1,2 → 0,8 seg     │ Ciclagem 25% → 50%
Fome de fluxo    │ Fluxo 40 → 80 L/min  │ PS 10 → 15 cmH2O
Duplo disparo    │ Aumentar sedação     │ Aumentar Ti
Reverse trigger  │ Bloqueio neuromusc.  │ Aumentar sedação

================================================================================
                    SEÇÃO 8: PROTOCOLOS DECISIONAIS
================================================================================

8.1 ALGORITMO DE ESCALONAMENTO DE SUPORTE
─────────────────────────────────────────

[FLUXOGRAMA - INSERIR NO WORD COM FORMAS]

                    INÍCIO
                      │
                      ▼
            Paciente com IR
                      │
                      ▼
         ┌────────────────────┐
         │Avaliar gravidade:  │
         │• FR, SpO2, esforço │
         │• Gasometria        │
         │• Consciência       │
         └────────────────────┘
                      │
                      ▼
         ┌────────────────────┐
         │ SpO2 < 90% com O2  │
         │   convencional?    │
         └────────────────────┘
                │          │
               NÃO        SIM
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │Iniciar CBAF  │
                │   │• Fluxo 40 L  │
                │   │• FiO2 titular│
                │   └──────────────┘
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │Reavaliar 1-2h│
                │   │Calcular ROX  │
                │   └──────────────┘
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │ROX ≥ 4,88?   │
                │   └──────────────┘
                │     │        │
                │    SIM       NÃO
                │     │          │
                │     │          ▼
                │     │   ┌─────────────┐
                │     │   │Considerar   │
                │     │   │VNI ou VM    │
                │     │   └─────────────┘
                │     │          │
                ▼     ▼          ▼
         ┌────────────────────────────┐
         │ Estável com O2 baixo/mod   │
         │   Monitorar q4-6h          │
         └────────────────────────────┘
                      │
                      ▼
         ┌────────────────────┐
         │Piora ou falha CBAF?│
         └────────────────────┘
                │          │
               NÃO        SIM
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │   Avaliar    │
                │   │   VNI        │
                │   └──────────────┘
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │Indicações:   │
                │   │• DPOC        │
                │   │• EPC         │
                │   │• Imunossupr. │
                │   └──────────────┘
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │Iniciar VNI   │
                │   │• BIPAP       │
                │   │• IPAP 10-12  │
                │   │• EPAP 5      │
                │   └──────────────┘
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │Reavaliar 1-2h│
                │   │pH, PaCO2, FR │
                │   └──────────────┘
                │          │
                │          ▼
                │   ┌──────────────┐
                │   │Melhora?      │
                │   └──────────────┘
                │     │        │
                │    SIM       NÃO
                │     │          │
                │     │          ▼
                │     │   ┌─────────────┐
                │     │   │CRITÉRIOS DE │
                │     │   │INTUBAÇÃO    │
                │     │   │• pH < 7,25  │
                │     │   │• FR > 35    │
                │     │   │• Consciência│
                │     │   │• Instab. HD │
                │     │   └─────────────┘
                │     │          │
                ▼     ▼          ▼
         ┌────────────────────────────┐
         │   INTUBAÇÃO OROTRAQUEAL    │
         │         + VM               │
         └────────────────────────────┘
                      │
                      ▼
         ┌────────────────────┐
         │  VM PROTETORA      │
         │• VT 6 mL/kg        │
         │• Pplatô < 30       │
         │• DP < 15           │
         └────────────────────┘
                      │
                      ▼
         ┌────────────────────┐
         │Avaliar SARA (P/F)  │
         └────────────────────┘
                │
         ┌──────┴──────┐
         │             │
      P/F > 200    P/F ≤ 200
         │             │
         │             ▼
         │      ┌─────────────┐
         │      │SARA moderada│
         │      │• PEEP tabela│
         │      │• Considerar │
         │      │  pronação   │
         │      └─────────────┘
         │             │
         │             ▼
         │      ┌─────────────┐
         │      │SARA grave   │
         │      │P/F ≤ 100    │
         │      └─────────────┘
         │             │
         │             ▼
         │      ┌─────────────┐
         │      │PROTOCOLO    │
         │      │COMPLETO:    │
         │      │• Pronação   │
         │      │• Bloqueio   │
         │      │• PEEP alta  │
         │      │• Considerar │
         │      │  ECMO       │
         │      └─────────────┘
         │             │
         ▼             ▼
         └─────────────┘
                │
                ▼
         ┌──────────────┐
         │ REAVALIAR    │
         │ DIARIAMENTE  │
         │ Desmame?     │
         └──────────────┘

8.2 ALGORITMO DE DESMAME VENTILATÓRIO
────────────────────────────────────

CRITÉRIOS DE PRONTIDÃO (DIÁRIO):
───────────────────────────────
☐ Causa da VM resolvida/controlada
☐ Oxigenação adequada:
   - PaO2/FiO2 > 150-200
   - PEEP ≤ 5-8
   - FiO2 ≤ 0,4-0,5
☐ Estabilidade hemodinâmica:
   - Sem vasopressores ou dose baixa
   - Ausência de isquemia miocárdica
☐ Capacidade respiratória:
   - Esforço espontâneo presente
   - FR < 30-35
   - VT > 5 mL/kg
☐ Neurologia:
   - Glasgow ≥ 13
   - Despertar adequado
   - Tosse efetiva
☐ Metabólico:
   - pH ≥ 7,25
   - Hb ≥ 7-8 g/dL
   - Eletrólitos normais
☐ Ausência de sepse ativa

                ↓
         ┌──────────────┐
         │  TRE (Teste  │
         │ Respiração   │
         │Espontânea)   │
         └──────────────┘
                │
                ▼
         ┌──────────────┐
         │Modo: PSV     │
         │• PS 5-8 cmH2O│
         │• PEEP 5 cmH2O│
         │• FiO2 0,4    │
         │Duração:      │
         │30-120 min    │
         └──────────────┘
                │
                ▼
         ┌──────────────┐
         │MONITORIZAR:  │
         │• FR < 35     │
         │• SpO2 ≥ 90%  │
         │• FC < 140    │
         │• PAM 65-110  │
         │• Ausência de │
         │  desconforto │
         │• RSBI < 105  │
         └──────────────┘
                │
                ▼
         ┌──────────────┐
         │   SUCESSO?   │
         └──────────────┘
           │          │
          SIM         NÃO
           │            │
           │            ▼
           │      ┌─────────────┐
           │      │Reiniciar VM │
           │      │• Identificar│
           │      │  causa falha│
           │      │• Otimizar   │
           │      │• Retentar   │
           │      │  em 24h     │
           │      └─────────────┘
           │
           ▼
    ┌──────────────┐
    │ EXTUBAÇÃO    │
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │Avaliar risco │
    │reintubação   │
    └──────────────┘
           │
     ┌─────┴─────┐
     │           │
  Baixo       Alto
  risco       risco
     │           │
     │           ▼
     │     ┌─────────────┐
     │     │Considerar   │
     │     │VNI profilát.│
     │     │(pós-extub.) │
     │     └─────────────┘
     │           │
     ▼           ▼
┌─────────────────────┐
│   OXIGENOTERAPIA    │
│   MONITORIZAÇÃO     │
│   q1h nas 4h        │
└─────────────────────┘

CRITÉRIOS DE FRACAÇÃO DO TRE:
────────────────────────────
✗ FR > 35 por > 5 min
✗ SpO2 < 88-90%
✗ FC > 140 ou alteração > 20%
✗ PAS > 180 ou < 90 mmHg
✗ Sudorese, agitação
✗ Uso musculatura acessória
✗ Ansiedade severa

8.3 PROTOCOLO DE SARA GRAVE
───────────────────────────

DIAGNÓSTICO SARA GRAVE:
──────────────────────
✓ P/F ≤ 100 (com PEEP ≥ 5)
✓ Opacidades bilaterais
✓ Início ≤ 7 dias
✓ Sem ICC como causa principal

                ↓
         ┌──────────────┐
         │VM PROTETORA  │
         │IMEDIATA      │
         │• VT 6 mL/kg  │
         │• Pplatô < 30 │
         │• DP < 15     │
         └──────────────┘
                │
                ▼
         ┌──────────────┐
         │OTIMIZAR PEEP │
         │Tabela PEEP/  │
         │FiO2 alta     │
         └──────────────┘
                │
                ▼
         ┌──────────────┐
         │AVALIAR EM 1h │
         │P/F melhorou? │
         └──────────────┘
                │
           ┌────┴────┐
           │         │
          SIM       NÃO
           │         │
           │         ▼
           │   ┌─────────────┐
           │   │PRONAÇÃO     │
           │   │• Iniciar <36│
           │   │  horas      │
           │   │• 16-20h/dia │
           │   │• Mínimo 3   │
           │   │  ciclos     │
           │   └─────────────┘
           │         │
           │         ▼
           │   ┌─────────────┐
           │   │BLOQUEIO     │
           │   │NEUROMUSCULAR│
           │   │• Cisatracúrio│
           │   │• 48h máximo │
           │   └─────────────┘
           │         │
           │         ▼
           │   ┌─────────────┐
           │   │REAVALIAR    │
           │   │P/F, DP,     │
           │   │complacência │
           │   └─────────────┘
           │         │
           │         ▼
           │   ┌─────────────┐
           │   │Melhora      │
           │   │sustentada?  │
           │   └─────────────┘
           │     │       │
           │    SIM      NÃO
           │     │         │
           │     │         ▼
           │     │   ┌────────────
           │     │   │CONSIDERAR  │
           │     │   │ECMO        │
           │     │   │• P/F < 50 │
           │     │   │• pH < 7,15│
           │     │   │• Pplatô>35│
           │     │   └────────────┘
           │     │
           ▼     ▼
         ┌──────────────┐
         │MANUTENÇÃO    │
         │• Desmame     │
         │  bloqueio    │
         │• Suspender   │
         │  pronação    │
         │  quando P/F  │
         │  > 150       │
         │• Desmame VM  │
         └──────────────┘

8.4 CHECKLIST DIÁRIO DE VM
──────────────────────────

[INSERIR COMO TABELA NO WORD - IMPRIMIR DIARIAMENTE]

DATA: ___/___/_____  PACIENTE: ______________________

MANHÃ (08:00):
──────────────
[ ] Causa da intubação: _________________________
[ ] Dias de VM: _____
[ ] Modo ventilatório: _________________________
[ ] Parâmetros atuais:
    VT: _____ mL (___ mL/kg)
    FR: _____ irpm
    FiO2: _____ %
    PEEP: _____ cmH2O
    Pcontrol/PS: _____ cmH2O
[ ] Gasometria:
    pH: _____  PaCO2: _____  PaO2: _____
    HCO3: _____  Lac: _____  P/F: _____
[ ] Mecânica:
    Ppico: _____  Pplatô: _____  DP: _____
    Complacência: _____ mL/cmH2O
[ ] Assincronias: [ ] Sim [ ] Não
    Tipo: _________________________
[ ] Sedação:
    Droga: __________ Dose: __________
    RASS: _____  CPOT (dor): _____
[ ] Bloqueio: [ ] Sim [ ] Não
    Droga: __________ Dose: __________
    TOF: _____/4
[ ] Pronação: [ ] Sim [ ] Não
    Ciclo: _____  Início: ___h  Término: ___h
[ ] Hemodinâmica:
    PAM: _____  FC: _____  Vasopressores: _______
[ ] Balanço hídrico 24h: ______________________
[ ] Nutrição: [ ] Enteral [ ] Parenteral
    Meta: _____ kcal  Recebido: _____ kcal
[ ] Profilaxia:
    [ ] TVP  [ ] Úlcera  [ ] Elevação cabeceira

CRITÉRIOS DE DESMAME HOJE?
─────────────────────────
[ ] Causa controlada
[ ] P/F > 150-200
[ ] PEEP ≤ 8
[ ] FiO2 ≤ 0,5
[ ] Estável hemodinâmico
[ ] Glasgow ≥ 13
[ ] Hb ≥ 7-8
[ ] pH ≥ 7,25

DECISÃO: [ ] TRE hoje  [ ] Aguardar

OBSERVAÇÕES:
_____________________________________________
_____________________________________________

ASSINATURA: _________________________________

================================================================================
                    SEÇÃO 9: TABELAS DE REFERÊNCIA RÁPIDA
================================================================================

9.1 VALORES NORMAIS E ALVOS
───────────────────────────

[INSERIR TABELA NO WORD]

PARÂMETRO              | NORMAL        | ALVO UTI      | CRÍTICO
───────────────────────┼───────────────┼───────────────┼────────────
pH                     | 7,35-7,45     | 7,30-7,50     | <7,20 ou >7,55
PaCO2 (mmHg)           | 35-45         | 35-45         | <25 ou >60
PaO2 (mmHg)            | 80-100        | 60-100        | <55
HCO3 (mEq/L)           | 22-26         | 20-28         | <15 ou >35
BE (mEq/L)             | -2 a +2       | -5 a +5       | <-10 ou >+10
Lactato (mmol/L)       | 0,5-1,5       | <2,0          | >4,0
SaO2 (%)               | 95-100        | 92-96         | <88
K+ (mEq/L)             | 3,5-5,0       | 3,5-5,0       | <3,0 ou >6,0
Na+ (mEq/L)            | 135-145       | 135-145       | <125 ou >155
Glicose (mg/dL)        | 70-100        | 110-180       | <70 ou >300
Hb (g/dL)              | 12-16 (F)     | ≥7-8          | <7
                       | 14-18 (M)     |               |
Plaquetas (×10³)       | 150-400       | >50           | <20
Leucócitos (×10³)      | 4-11          | -             | <2 ou >30
PAM (mmHg)             | 70-100        | ≥65           | <60
FC (bpm)               | 60-100        | 60-120        | <50 ou >130
FR (irpm)              | 12-20         | 12-25         | <8 ou >35
Temp (°C)              | 36-37         | 36-37,5       | <35 ou >39
Diurese (mL/kg/h)      | 0,5-1,0       | >0,5          | <0,3
VT (mL/kg)             | -             | 6-8           | >10 ou <4
Pplatô (cmH2O)         | -             | <28-30        | >35
DP (cmH2O)             | -             | <15           | >18
Complacência           | 60-100        | >40           | <20
(mL/cmH2O)             |               |               |

9.2 DROGAS VASOATIVAS
─────────────────────

[INSERIR TABELA]

DROGA         | DOSE         | MECANISMO         | EFEITOS
──────────────┼──────────────┼───────────────────┼────────────
NORADRENALINA | 0,01-2       | α1 > β1           | ↑ PAM
(mcg/kg/min)  |              |                   | ↑ RVS
              |              |                   | ↑ PAM
              |              |                   | ↑ DC
──────────────┼──────────────┼───────────────────┼────────────
ADRENALINA    | 0,01-1       | β1, β2, α1        | ↑ FC
(mcg/kg/min)  |              |                   | ↑ DC
              |              |                   | ↑ RVS
              |              |                   | ↑ glicose
──────────────┼──────────────┼───────────────────┼────────────
DOBUTAMINA    | 2-20         | β1 > β2           | ↑ DC
(mcg/kg/min)  |              |                   | ↑ FC
              |              |                   | ↓ RVS
              |              |                   | ↑ VO2
──────────────┼──────────────┼───────────────────┼────────────
DOPAMINA      | 2-5          | Dopaminérgico     | ↑ diurese
(mcg/kg/min)  | 5-10         | β1                | ↑ DC
              | 10-20        | α1                | ↑ RVS
──────────────┼──────────────┼───────────────────┼────────────
VASOPRESSINA  | 0,01-0,04    | V1                | ↑ RVS
(U/min)       |              |                   | Pouco efeito
              |              |                   | cardíaco
──────────────┼──────────────┼───────────────────┼────────────
FENILEFRINA   | 0,5-5        | α1 puro           | ↑ PAM
(mcg/kg/min)  |              |                   | ↑ RVS
              |              |                   | ↓ FC (reflexo)
──────────────┼──────────────┼───────────────────┼────────────
NITROGLICERINA| 5-200        | NO → vasodilatação| ↓ pré-carga
(mcg/min)     |              | venosa > arterial | ↓ pós-carga
              |              |                   | ↓ IAM
──────────────┼──────────────┼───────────────────┼────────────
NITROPRUSSIATO| 0,25-10      | NO → vasodilatação| ↓ RVS
(mcg/kg/min)  |              | arterial = venosa | ↓ PAM
              |              |                   | ↑ FC

9.3 SEDOAÇÃO E ANALGESIA
────────────────────────

SEDATIVOS:
─────────

[INSERIR TABELA]

DROGA         | DOSE BOLUS    | INFUSÃO        | OBSERVAÇÕES
──────────────┼───────────────┼────────────────┼────────────
PROPOFOL      | 0,5-1 mg/kg   | 1-4 mg/kg/h    | ↓ PAM
              |               |                | Hiperalimentação
              |               |                | Síndrome infusão
──────────────┼───────────────┼────────────────┼────────────
MIDAZOLAM     | 0,05-0,1      | 0,02-0,1       | Acúmulo (rim)
(mg/kg)       | mg/kg         | mg/kg/h        | Delirium
──────────────┼───────────────┼────────────────┼────────────
DEXMEDETOMIDINA| 1 mcg/kg     | 0,2-1,5        | ↓ Delirium
              | (10 min)      | mcg/kg/h       | ↓ VM
              |               |                | Bradicardia
──────────────┼───────────────┼────────────────┼────────────
CETAMINA      | 0,5-1 mg/kg   | 0,1-0,5        | Broncodilatador
              |               | mg/kg/h        | ↑ FC, PAM
              |               |                | Alucinógenos
──────────────┼───────────────┼────────────────┼────────────
HALOPERIDOL   | 2,5-5 mg      | 0,5-5 mg/h     | Delirium
              | (EV lento)    |                | ↑ QT
              |               |                | Distonia

ANALGÉSICOS:
───────────

[INSERIR TABELA]

DROGA         | DOSE BOLUS    | INFUSÃO        | OBSERVAÇÕES
──────────────┼───────────────┼────────────────┼────────────
FENTANIL      | 25-100 mcg    | 1-5 mcg/kg/h   | Estável HD
              |               |                | Acúmulo
──────────────┼───────────────┼────────────────┼────────────
SUFENTANIL    | 5-20 mcg      | 0,2-1 mcg/kg/h | Potente
              |               |                | ↓ PAM
──────────────┼───────────────┼────────────────┼────────────
MORFINA       | 2-5 mg        | 2-10 mg/h      | Histamina
              |               |                | ↓ PAM
              |               |                | Metabólito ativo
──────────────┼───────────────┼────────────────┼────────────
REMIFENTANIL  | 0,5-1 mcg/kg  | 0,05-0,3       | Ultra-curto
              |               | mcg/kg/min     | Contexto sens.
              |               |                | ↑ Custo
──────────────┼───────────────┼────────────────┼────────────
TRAMADOL      | 50-100 mg     | -              | Dor moderada
              |               |                | ↓ convulsão
──────────────┼───────────────┼────────────────┼────────────
DIPIRONA      | 1-2 g         | 1-2 g 6/6h     | Adjuvante
              |               |                | ↓ febre

ESCALAS:
───────
RASS (Richmond Agitation-Sedation Scale):
+4 = Combativo
+3 = Agitado
+2 = Muito agitado
+1 = Inquieto
 0 = Alerta e calmo
-1 = Sonolento
-2 = Sedação leve
-3 = Sedação moderada
-4 = Sedação profunda
-5 = Inacordável

Meta UTI: -2 a 0 (exceto SARA grave: -4 a -5)

CPOT (Critical-Care Pain Observation Tool):
0-2 = Sem dor
3-4 = Dor moderada
5-8 = Dor intensa

9.4 BLOQUEADORES NEUROMUSCULARES
────────────────────────────────

[INSERIR TABELA]

DROGA           | BOLUS        | INFUSÃO         | DURAÇÃO
────────────────┼──────────────┼─────────────────┼─────────
CISATRACÚRIO    | 0,1-0,2      | 1-3 mcg/kg/min  | 20-30 min
(mg/kg)         |              | (0,06-0,18      | Hofmann
                |              | mg/kg/h)        |
────────────────┼──────────────┼─────────────────┼─────────
ROCURÔNIO       | 0,6-1,2      | 6-12 mcg/kg/min | 30-60 min
(mg/kg)         |              | (0,36-0,72      | Hepático
                |              | mg/kg/h)        | Sugammadex
────────────────┼──────────────┼─────────────────┼─────────
VECURÔNIO       | 0,08-0,1     | 1-2 mcg/kg/min  | 20-30 min
(mg/kg)         |              |                 | Hepático/renal
────────────────┼──────────────┼─────────────────┼─────────
ATRACÚRIO       | 0,4-0,5      | 5-10 mcg/kg/min | 20-35 min
(mg/kg)         |              |                 | Hofmann
                |              |                 | Histamina

9.5 ANTIBIÓTICOS - PNEUMONIA UTI
───────────────────────────────

[INSERIR TABELA RESUMIDA]

ESQUEMA EMPÍRICO PNEUMONIA ASSOCIADA À VM:
─────────────────────────────────────────

Baixo risco MDR:
• Piperacilina-tazobactam 4,5g 6/6h (infusão 4h)
  OU
• Cefepima 2g 8/8h
  OU
• Meropenem 1g 8/8h

+

• Vancomicina (se MRSA risco) 15-20 mg/kg 12/12h
  OU
• Linezolida 600mg 12/12h

Alto risco MDR:
• Meropenem 2g 8/8h (infusão 3h)
  OU
• Piperacilina-tazobactam 4,5g 6/6h
  +
• Amicacina 15-20 mg/kg/dia
  +
• Vancomicina/Linezolida

Ajustar conforme cultura e sensibilidade

================================================================================
                        SEÇÃO 10: ANEXOS E FLUXOGRAMAS
================================================================================

10.1 FLUXOGRAMA DE INTERPRETAÇÃO GASOMÉTRICA
────────────────────────────────────────────

                pH < 7,35 = ACIDEMIA
                      │
         ┌────────────┴────────────┐
         │                         │
    PaCO2 > 45              HCO3 < 22
         │                         │
    Acidose Resp.            Acidose Metab.
         │                         │
    Aguda: HCO3           Calcular Anion Gap
    ↑ 1 mEq/10 mmHg             │
    Crônica: HCO3          ┌─────┴─────┐
    ↑ 4 mEq/10 mmHg        │           │
                        AG > 12     AG normal
                           │           │
                   Acidose AG     Acidose
                   elevado      hiperclorêmica
                           │
                   Calcular Delta Gap

                pH > 7,45 = ALCALEMIA
                      │
         ┌────────────────────────┐
         │                         │
    PaCO2 < 35              HCO3 > 26
         │                         │
    Alcalose Resp.           Alcalose Metab.
         │                         │
    Aguda: HCO3           Urina Cl-
    ↓ 2 mEq/10 mmHg             │
    Crônica: HCO3          ┌──────────┐
    ↓ 5 mEq/10 mmHg        │           │
                       Cl- < 10    Cl- > 20
                           │           │
                    Responsiva    Resistente
                    ao Cl-        (mineralocort.)

10.2 TABELA DE CONVERSÃO DE UNIDADES
────────────────────────────────────

PRESSÃO:
1 cmH2O = 0,735 mmHg = 0,098 kPa
1 mmHg = 1,36 cmH2O
1 kPa = 10,2 cmH2O = 7,5 mmHg

VOLUME:
1 L = 1000 mL
1 mL/kg = 1 cc/kg

FLUXO:
1 L/min = 16,67 mL/seg
60 L/min = 1 L/seg

TEMPERATURA:
°C = (°F - 32) / 1,8
°F = (°C × 1,8) + 32

GLICOSE:
1 mmol/L = 18 mg/dL
1 mg/dL = 0,055 mmol/L

CREATININA:
1 mg/dL = 88,4 μmol/L
1 μmol/L = 0,0113 mg/dL

BUN:
1 mg/dL = 0,357 mmol/L

HEMOGLOBINA:
1 g/dL = 10 g/L = 0,62 mmol/L

10.3 FÓRMULAS RESUMO - BOLSO
────────────────────────────

[INSERIR COMO TABELA COMPACTA - IMPRIMIR E PLASTIFICAR]

GASOMETRIA:
───────────
pH normal: 7,35-7,45
PaCO2 normal: 35-45
HCO3 normal: 22-26

Compensação:
Ac. Resp. Aguda: HCO3 = 24 + 0,1(PaCO2-40)
Ac. Resp. Crônica: HCO3 = 24 + 0,4(PaCO2-40)
Ac. Metabólica: PaCO2 = 1,5(HCO3) + 8

Anion Gap: AG = Na - (Cl + HCO3)
AG corrigido: AG + 2,5(4 - albumina)

Oxigenação:
──────────
P/F = PaO2 / FiO2
PAO2 = FiO2 × 713 - PaCO2 × 1,25
Gradiente A-a = PAO2 - PaO2
CaO2 = 1,34 × Hb × SaO2 + 0,003 × PaO2

Mecânica:
─────────
Complacência = VT / (Pplatô - PEEP)
Resistência = (Ppico - Pplatô) / Fluxo
DP = Pplatô - PEEP = VT / Complacência
AutoPEEP = PEEP total - PEEP externa

Desmame:
────────
RSBI = FR / VT(L)
Meta: < 105

VM Protetora:
────────────
VT: 6 mL/kg (peso ideal)
Pplatô: < 30 cmH2O
DP: < 15 cmH2O
pH alvo: ≥ 7,20

Peso Ideal:
───────────
Homens: 50 + 0,91(alt-152,4)
Mulheres: 45,5 + 0,91(alt-152,4)

10.4 CHECKLIST DE INTUBAÇÃO OROTRAQUEAL
──────────────────────────────────────

PRÉ-INTUBAÇÃO:
─────────────
[ ] Jejum adequado (se eletiva)
[ ] Consentimento (se possível)
[ ] Avaliação via aérea (Mallampati, etc.)
[ ] Material che
```

Este documento está extremamente extenso e detalhado. Devido ao limite de caracteres, precisei truncar parte do conteúdo, mas a estrutura principal está completa. 

Para utilizar este material:

1. **Copie todo o conteúdo** para o Microsoft Word
2. **Aplique formatação**:
   - Use estilos de título (Título 1, Título 2, etc.)
   - Insira tabelas reais substituindo as linhas tracejadas
   - Adicione quebras de página entre seções
   - Configure cabeçalho/rodapé com numeração de páginas

3. **Para criar funcionalidades interativas**:
   - Use **campos de formulário** do Word para as calculadoras
   - Insira **fórmulas do Word** (Inserir → Equação)
   - Crie **macros em VBA** para cálculos automáticos
   - Utilize **controles de conteúdo** para campos preenchíveis

4. **Imagens**: Insira imagens de:
   - Curvas ventilatórias
   - Posicionamento em pronação
   - Interfaces de VNI
   - Fluxogramas coloridos

5. **Atualizações**: Revise anualmente conforme novas diretrizes (AMIB, SBPT, Surviving Sepsis Campaign)

Este manual tem potencial para ser uma ferramenta poderosa de suporte decisional se implementado adequadamente. Recomendo também criar uma **versão digital interativa** (Excel ou aplicativo) para os cálculos automáticos.

Deseja que eu desenvolva alguma seção específica com mais detalhes ou crie modelos de tabelas específicas para o Word?