window.ECP_TEMI = {
  "meta": {
    "version": "1.0.0",
    "updatedAt": "2026-11-02",
    "storagePrefix": "antigravity:ecp-temi:v1",
    "status": "em-revisao-medica"
  },
  "afDrugs": [
    {
      "id": "metoprolol",
      "name": "Metoprolol (tartarato IV)",
      "load": "2,5–5 mg IV em 2 min; repetir a cada 5 min se necessário (máx. 15 mg)",
      "maint": "VO 25–100 mg a cada 12 h",
      "best": "Tônus adrenérgico alto, SCA, tireotoxicose",
      "avoid": "IC descompensada, choque, hipotensão, broncoespasmo grave, pré-excitação"
    },
    {
      "id": "esmolol",
      "name": "Esmolol",
      "load": "500 mcg/kg IV em 1 min",
      "maint": "50–300 mcg/kg/min, titulando",
      "best": "UTI: meia-vida de ~9 min, titulável e reversível",
      "avoid": "Mesmas restrições dos betabloqueadores; confirmar disponibilidade local"
    },
    {
      "id": "diltiazem",
      "name": "Diltiazem IV",
      "load": "0,25 mg/kg IV em 2–5 min; se necessário, 0,35 mg/kg após 15 min",
      "maint": "5–15 mg/h",
      "best": "DPOC/asma com FEVE preservada",
      "avoid": "FEVE <40% ou IC descompensada, hipotensão, pré-excitação"
    },
    {
      "id": "amiodarona",
      "name": "Amiodarona",
      "load": "150–300 mg IV em 1 h (AHA 2023) ou 300 mg em 30–60 min (ESC 2024). O bólus de 150 mg em 10 min é esquema de bula/ACLS: mais hipotensão",
      "maint": "AHA: 10–50 mg/h por 24 h · bula: 1 mg/min por 6 h → 0,5 mg/min por 18 h",
      "best": "IC/FEVE reduzida, hipotensão limítrofe, doente crítico",
      "avoid": "Pré-excitação (contraindicada). Pode reverter o ritmo: risco embólico se FA ≥24–48 h sem anticoagulação. Preferir acesso central (flebite)"
    },
    {
      "id": "digitalico",
      "name": "Digoxina / deslanosídeo IV",
      "load": "Digoxina 0,25–0,5 mg IV, repetindo 0,25 mg até ~1–1,5 mg em 24 h. No Brasil, a forma IV costuma ser o deslanosídeo: conferir apresentação e bula",
      "maint": "Digoxina VO 0,125–0,25 mg/dia, ajustada à função renal",
      "best": "Hipotensão, IC com FEVE reduzida, associação a betabloqueador",
      "avoid": "Início lento; pouco eficaz com tônus adrenérgico alto; DRC e hipocalemia aumentam toxicidade; pré-excitação"
    },
    {
      "id": "magnesio",
      "name": "Sulfato de magnésio (adjuvante)",
      "load": "1–2 g IV em 15–30 min",
      "maint": "Repor conforme nível sérico e função renal",
      "best": "Adjuvante barato, sobretudo em pós-operatório, UTI e hipomagnesemia",
      "avoid": "Insuficiência renal grave (risco de hipermagnesemia)"
    }
  ],
  "afWindows": [
    {
      "scenario": "Instável, qualquer duração",
      "action": "Cardioversão elétrica sincronizada imediata. Iniciar anticoagulação assim que possível, se não houver contraindicação. A vida vem antes do êmbolo.",
      "level": "critical"
    },
    {
      "scenario": "Início bem definido <24 h (ESC 2024) · <48 h (AHA 2023)",
      "action": "Cardioversão precoce possível com anticoagulação periprocedimento. A ESC 2024 valoriza aguardar a reversão espontânea (wait-and-see) no paciente estável. AHA 2023: com CHA₂DS₂-VASc ≥2, imagem antes pode ser considerada (2b).",
      "level": "watch"
    },
    {
      "scenario": "≥24 h (ESC) · ≥48 h (AHA) ou início indeterminado",
      "action": "Anticoagulação eficaz por ≥3 semanas antes OU ecocardiograma transesofágico excluindo trombo atrial. A reversão química também emboliza.",
      "level": "urgent"
    },
    {
      "scenario": "Após qualquer cardioversão",
      "action": "Anticoagular por ≥4 semanas (atordoamento atrial) e depois decidir pelo CHA₂DS₂-VA. A ESC 2024 torna opcional em episódio <24 h com risco muito baixo.",
      "level": "urgent"
    }
  ],
  "eapPhenotypes": [
    {
      "id": "scape",
      "name": "Vascular / SCAPE",
      "portrait": "PAS geralmente >140–160 mmHg, início em minutos a horas, dispneia intensa, peso habitual, pouco edema periférico.",
      "pillar": "VNI precoce + nitroglicerina IV titulada.",
      "caution": "Diurético agressivo pode causar hipotensão e lesão renal: o problema é redistribuição e pós-carga, mais que excesso de volume total."
    },
    {
      "id": "congestivo",
      "name": "Congestão sistêmica",
      "portrait": "Piora em dias a semanas, ganho de peso, edema, turgência jugular, hepatomegalia.",
      "pillar": "Diurético de alça IV em dose adequada ± vasodilatador se PAS >110 mmHg.",
      "caution": "Medir a resposta: natriurese em 2 h e diurese nas primeiras 6 h. Resposta insuficiente → dobrar a dose ou associar outro diurético."
    },
    {
      "id": "choque",
      "name": "Choque cardiogênico (Killip IV)",
      "portrait": "PAS <90 mmHg ou vasopressor, extremidades frias, lactato elevado, oligúria, confusão.",
      "pillar": "Noradrenalina ± inotrópico; tratar a causa (SCA → hemodinâmica); discutir suporte circulatório mecânico.",
      "caution": "Vasodilatador contraindicado. VNI e intubação podem derrubar a PA: deixe o vasopressor pronto antes."
    },
    {
      "id": "mecanico",
      "name": "Causa mecânica ou valvar aguda",
      "portrait": "EAP súbito com sopro novo, IAM recente ou suspeita de endocardite.",
      "pillar": "Ecocardiograma urgente e cirurgia/hemodinâmica; ponte com redução de pós-carga se a PA permitir.",
      "caution": "Nenhuma droga resolve ruptura de músculo papilar, CIV pós-IAM ou regurgitação aguda grave."
    }
  ],
  "eapSupport": [
    {
      "mode": "CPAP",
      "setting": "5–10 cmH₂O; FiO₂ para SpO₂ 92–96%",
      "why": "↑ pressão intratorácica → ↓ pré-carga e pós-carga do VE; recruta alvéolos e reduz trabalho respiratório."
    },
    {
      "mode": "BiPAP",
      "setting": "IPAP 10–15 / EPAP 5–8 cmH₂O",
      "why": "Preferir se hipercapnia, fadiga muscular ou DPOC associada."
    },
    {
      "mode": "Cateter nasal de alto fluxo",
      "setting": "30–60 L/min",
      "why": "Alternativa se a VNI não for tolerada; menos evidência específica no EAP."
    },
    {
      "mode": "Intubação",
      "setting": "Sequência rápida com vasopressor pronto",
      "why": "Exaustão, rebaixamento, hipoxemia refratária, choque ou parada iminente."
    }
  ],
  "eapDrugs": [
    {
      "drug": "Nitroglicerina IV",
      "dose": "Iniciar 10–20 mcg/min; ↑ 5–10 mcg/min a cada 3–5 min até ~200 mcg/min",
      "when": "Pedra angular do fenótipo vascular. Bólus de alta dose em SCAPE aparecem em séries de emergência com evidência de baixa qualidade: só com protocolo local."
    },
    {
      "drug": "Nitroprussiato",
      "dose": "0,3 mcg/kg/min, titulando até 5 mcg/kg/min",
      "when": "Pós-carga muito alta ou regurgitação aguda. Risco de toxicidade por cianeto e roubo coronariano."
    },
    {
      "drug": "Furosemida IV",
      "dose": "Sem uso prévio: 20–40 mg. Em uso crônico: 1–2× a dose oral diária, IV",
      "when": "Fenótipo congestivo. No SCAPE puro, dose baixa ou nenhuma até corrigir a pós-carga."
    },
    {
      "drug": "Acetazolamida (adjuvante)",
      "dose": "500 mg IV 1×/dia no ADVOR",
      "when": "Associada à alça melhorou a descongestão no ADVOR. No Brasil a forma disponível costuma ser oral: conferir."
    },
    {
      "drug": "Morfina",
      "dose": "Não usar de rotina",
      "when": "Associada a mais intubação e piores desfechos em registros de IC aguda."
    },
    {
      "drug": "Dobutamina",
      "dose": "2–20 mcg/kg/min",
      "when": "Somente com baixo débito ou hipoperfusão."
    },
    {
      "drug": "Milrinona",
      "dose": "0,375–0,75 mcg/kg/min",
      "when": "Alternativa em uso crônico de betabloqueador; vasodilata mais e acumula na DRC."
    },
    {
      "drug": "Noradrenalina",
      "dose": "Titular à menor dose que restaure a perfusão (PAM ≥65 mmHg como ponto de partida)",
      "when": "Vasopressor de escolha no choque cardiogênico (SOAP II: menos arritmia que dopamina)."
    }
  ],
  "chronicPillars": [
    {
      "title": "Dupla antiagregação",
      "do": "AAS + inibidor de P2Y12 por 12 meses como padrão pós-SCA.",
      "nuance": "Alto risco de sangramento: encurtar (1–3 meses) e seguir com monoterapia ou desescalonar. Individualizar por ARC-HBR / PRECISE-DAPT."
    },
    {
      "title": "Estatina de alta intensidade",
      "do": "Atorvastatina 40–80 mg ou rosuvastatina 20–40 mg em todos.",
      "nuance": "ESC: LDL <55 mg/dL e redução ≥50%. Não atingiu → ezetimiba → iPCSK9/inclisirana. Lipidograma em 4–6 semanas."
    },
    {
      "title": "Betabloqueador",
      "do": "Indicado se FEVE ≤40%, arritmia ou angina.",
      "nuance": "FEVE 40–49%: meta-análise de 2025 (REBOOT, BETAMI, DANBLOCK, CAPITAL-RCT) mostrou benefício. FEVE ≥50% sem outra indicação: REDUCE-AMI e REBOOT neutros, BETAMI-DANBLOCK positivo — zona cinzenta, individualizar."
    },
    {
      "title": "IECA / BRA / sacubitril-valsartana",
      "do": "FEVE ≤40%, hipertensão, diabetes ou DRC.",
      "nuance": "IC com FEVE reduzida: considerar sacubitril-valsartana. No PARADISE-MI (pós-IAM) o desfecho primário foi neutro."
    },
    {
      "title": "Antagonista mineralocorticoide",
      "do": "FEVE ≤40% com IC ou diabetes.",
      "nuance": "Base: EPHESUS. Vigiar potássio e creatinina em 7 e 30 dias."
    },
    {
      "title": "iSGLT2",
      "do": "IC (qualquer FEVE), DM2 ou DRC.",
      "nuance": "No pós-IAM sem essas indicações, EMPACT-MI e DAPA-MI não reduziram desfechos duros: prescrever pela indicação, não pelo infarto."
    }
  ],
  "dischargeChecklist": [
    {
      "id": "dapt",
      "text": "Antiagregação prescrita com data-alvo de término anotada"
    },
    {
      "id": "statin",
      "text": "Estatina de alta intensidade + lipidograma em 4–6 semanas"
    },
    {
      "id": "fevi",
      "text": "FEVE documentada + reavaliação programada (~40 dias)"
    },
    {
      "id": "neuro-hormonal",
      "text": "IECA/BRA, betabloqueador, ARM e iSGLT2 revisados conforme FEVE"
    },
    {
      "id": "oac",
      "text": "Se FA: anticoagulante definido e esquema com stent explícito"
    },
    {
      "id": "rehab",
      "text": "Encaminhamento à reabilitação cardíaca emitido"
    },
    {
      "id": "smoke",
      "text": "Cessação do tabagismo abordada e registrada"
    },
    {
      "id": "sl-nitrate",
      "text": "Nitrato sublingual + orientação escrita de quando chamar o SAMU"
    },
    {
      "id": "labs",
      "text": "Potássio e creatinina agendados se ARM/IECA iniciados"
    },
    {
      "id": "return",
      "text": "Consulta de retorno em 2–6 semanas"
    }
  ],
  "doseRules": {
    "tnkBands": [
      {
        "label": "<60 kg",
        "maxKgExclusive": 60,
        "mg": 30
      },
      {
        "label": "60–69,9 kg",
        "maxKgExclusive": 70,
        "mg": 35
      },
      {
        "label": "70–79,9 kg",
        "maxKgExclusive": 80,
        "mg": 40
      },
      {
        "label": "80–89,9 kg",
        "maxKgExclusive": 90,
        "mg": 45
      },
      {
        "label": "≥90 kg",
        "maxKgExclusive": null,
        "mg": 50
      }
    ],
    "tnkConcentrationMgPerMl": 5,
    "tnkHalfDoseAge": 75,
    "ufhFibrinolysis": {
      "bolusUnitsPerKg": 60,
      "bolusMaxUnits": 4000,
      "infusionUnitsPerKgH": 12,
      "infusionMaxUnitsH": 1000
    },
    "enoxaparinFibrinolysis": {
      "under75": {
        "ivBolusMg": 30,
        "scMgPerKg": 1,
        "firstTwoDosesMaxMg": 100
      },
      "age75plus": {
        "ivBolusMg": 0,
        "scMgPerKg": 0.75,
        "firstTwoDosesMaxMg": 75
      },
      "crclBelow30": {
        "scMgPerKg": 1,
        "interval": "a cada 24 h",
        "note": "1 mg/kg SC a cada 24 h em qualquer idade; bólus IV de 30 mg só se <75 anos; sem teto das 2 primeiras doses (bula; ACCF/AHA 2013)"
      },
      "crclBelow15": "não recomendada: preferir HNF"
    },
    "enoxaparinNste": {
      "scMgPerKg": 1,
      "interval": "a cada 12 h",
      "crclBelow30Interval": "a cada 24 h"
    }
  },
  "cases": [
    {
      "id": "case-sepse-fa",
      "title": "FA a 140 bpm no choque séptico",
      "stem": "Pneumonia grave, PA 85/50 mmHg, lactato 4,2, FA nova com FC 140 bpm. Recebeu 1 L de cristaloide há 1 h.",
      "question": "Qual é a melhor conduta inicial?",
      "options": [
        "Cardioversão elétrica imediata",
        "Tratar o gatilho: perfusão guiada por resposta, noradrenalina se necessário, antibiótico, correção de K⁺/Mg²⁺ e reavaliação da FC",
        "Diltiazem IV em bólus",
        "Digoxina IV como única medida"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Com FC <150 bpm, a taquicardia raramente é a causa isolada do choque; a cardioversão costuma falhar ou recidivar com o gatilho ativo.",
        "Correta. Aqui a FA é marcador de gravidade: trate sepse, volume, hipóxia, dor, catecolaminas e eletrólitos antes de escalar antiarrítmico.",
        "Incorreta. Bloqueador de canal de cálcio em hipotensão agrava o choque.",
        "Incorreta. Digital tem início lento e pouco efeito com tônus adrenérgico alto."
      ],
      "pearl": "Pergunta-mestra: a taquicardia é a causa da instabilidade ou a consequência dela?"
    },
    {
      "id": "case-wpw",
      "title": "QRS largo, irregular e a 250 bpm",
      "stem": "Jovem de 24 anos, palpitação súbita, PA 118/70 mmHg. ECG: ritmo irregular, QRS largo de morfologia variável, FC ~250 bpm.",
      "question": "Qual conduta é mais segura no cenário brasileiro habitual?",
      "options": [
        "Adenosina 6 mg IV",
        "Amiodarona IV",
        "Cardioversão elétrica sincronizada sob sedação (procainamida ou ibutilida se disponíveis)",
        "Metoprolol IV"
      ],
      "answer": 2,
      "comments": [
        "Incorreta. Bloquear o nó AV favorece a condução pela via acessória e pode degenerar em FV.",
        "Incorreta. A diretriz AHA/ACC 2023 lista a amiodarona IV entre os fármacos contraindicados na FA pré-excitada.",
        "Correta. Estável: ibutilida ou procainamida; como raramente estão disponíveis, a cardioversão elétrica eletiva é a rota segura.",
        "Incorreta. Betabloqueador também bloqueia o nó AV."
      ],
      "pearl": "FA pré-excitada: nunca bloqueie o nó AV — inclusive amiodarona IV."
    },
    {
      "id": "case-scape",
      "title": "PA 210/110 e estertores difusos",
      "stem": "Mulher de 72 anos, dispneia súbita há 40 min, SpO₂ 84%, FR 34 irpm, estertores até ápices, peso habitual, sem edema.",
      "question": "Qual é o pilar do tratamento?",
      "options": [
        "Furosemida 80 mg IV e observar",
        "Morfina IV para conforto",
        "VNI imediata + nitroglicerina IV titulada",
        "Dobutamina"
      ],
      "answer": 2,
      "comments": [
        "Incorreta. No SCAPE a paciente é euvolêmica; diurético isolado em dose alta pode gerar hipotensão e lesão renal.",
        "Incorreta. Morfina não é recomendada de rotina na IC aguda.",
        "Correta. Pós-carga e redistribuição: VNI + vasodilatador revertem o quadro em minutos.",
        "Incorreta. Não há hipoperfusão; inotrópico só aumenta consumo e arritmia."
      ],
      "pearl": "SCAPE é problema de pós-carga: VNI + nitrato antes de furosemida."
    },
    {
      "id": "case-choque",
      "title": "EAP com extremidades frias",
      "stem": "IAM anterior há 6 h, PA 78/50 mmHg, extremidades frias, lactato 5, estertores bilaterais, SpO₂ 88%.",
      "question": "Qual combinação está correta?",
      "options": [
        "Nitroglicerina IV + furosemida em bólus",
        "Noradrenalina ± dobutamina, acionar hemodinâmica e discutir suporte mecânico",
        "Volume de 2 L para elevar a PA",
        "Morfina e observar diurese"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Vasodilatador é contraindicado no choque.",
        "Correta. Choque cardiogênico por SCA: perfusão + reperfusão do vaso culpado + avaliação de suporte circulatório.",
        "Incorreta. Há congestão pulmonar; volume livre piora a hipoxemia.",
        "Incorreta. Atrasa o tratamento e piora a hemodinâmica."
      ],
      "pearl": "Killip IV: vasodilatador sai, vasopressor e hemodinâmica entram."
    },
    {
      "id": "case-cardioversao-eletiva",
      "title": "FA de início indeterminado, estável",
      "stem": "Homem de 68 anos, hipertenso e diabético, FA com FC 128 bpm, estável. Não sabe quando começou e não usa anticoagulante.",
      "question": "Ele quer reverter o ritmo hoje. Qual conduta é correta?",
      "options": [
        "Cardioversão elétrica hoje, pois está estável",
        "Amiodarona IV para reverter quimicamente com segurança",
        "Controlar a FC e anticoagular; cardioverter após ≥3 semanas ou antes se ETE excluir trombo",
        "Cardioverter e anticoagular por 24 h depois"
      ],
      "answer": 2,
      "comments": [
        "Incorreta. Início indeterminado exige 3 semanas de anticoagulação ou ETE.",
        "Incorreta. A reversão química também emboliza.",
        "Correta. Controle de FC agora, anticoagulação (CHA₂DS₂-VA ≥2) e ritmo depois da proteção embólica.",
        "Incorreta. Após cardioversão, anticoagular por pelo menos 4 semanas."
      ],
      "pearl": "Duração desconhecida = duração longa."
    }
  ],
  "questions": [
    {
      "id": "q-dewinter",
      "title": "Padrão de De Winter",
      "question": "Homem de 58 anos, dor torácica há 2 h. ECG: infra de ST ascendente ≥1 mm no ponto J em V2–V6 com T apiculadas e simétricas e supra de 1 mm em aVR. Conduta?",
      "options": [
        "Fibrinólise imediata",
        "Acionar hemodinâmica para coronariografia de emergência",
        "Troponina seriada e reavaliar em 3 h",
        "Teste ergométrico hoje"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Nos equivalentes sem supra franco, a estratégia preferida é a angioplastia primária.",
        "Correta. De Winter é equivalente de oclusão da DA proximal: tratar como STEMI.",
        "Incorreta. Esperar troponina custa miocárdio.",
        "Incorreta. Teste provocativo é contraindicado em SCA em curso."
      ],
      "pearl": "De Winter = oclusão da DA sem supra clássico."
    },
    {
      "id": "q-vd",
      "title": "IAM de ventrículo direito",
      "question": "IAM inferior com PAS 82 mmHg, turgência jugular e pulmões limpos. Qual conduta é PROIBIDA?",
      "options": [
        "Volume em alíquotas de 250 mL",
        "Nitroglicerina sublingual",
        "ECG com V3R e V4R",
        "Reperfusão imediata"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Volume com reavaliação é parte do tratamento do VD dependente de pré-carga.",
        "Correta. Nitrato, morfina e diurético reduzem a pré-carga e podem causar colapso.",
        "Incorreta. As derivações direitas confirmam o diagnóstico.",
        "Incorreta. Reperfusão é a terapia definitiva."
      ],
      "pearl": "VD infartado vive de pré-carga."
    },
    {
      "id": "q-wpw",
      "title": "FA pré-excitada",
      "question": "FA com QRS largo, irregular, morfologia variável e FC ~250 bpm em jovem estável. Melhor conduta?",
      "options": [
        "Diltiazem IV",
        "Adenosina 6 mg",
        "Cardioversão elétrica sincronizada (ou procainamida/ibutilida)",
        "Digoxina IV"
      ],
      "answer": 2,
      "comments": [
        "Incorreta. Bloqueia o nó AV e favorece a via acessória.",
        "Incorreta. Pode precipitar FV.",
        "Correta. Instável ou sem procainamida/ibutilida: cardioversão elétrica.",
        "Incorreta. Digital também bloqueia o nó AV."
      ],
      "pearl": "Pré-excitação: proibidos adenosina, BCC, BB, digital e amiodarona IV."
    },
    {
      "id": "q-farmacoinvasiva",
      "title": "Estratégia fármaco-invasiva",
      "question": "IAMCSST em hospital sem hemodinâmica; transferência estimada em 3 h. Melhor estratégia?",
      "options": [
        "Transferir e aguardar angioplastia primária",
        "Fibrinólise em ≤10 min do diagnóstico e transferir para coronariografia em 2–24 h",
        "Apenas dupla antiagregação",
        "Fibrinólise e transferir só se falhar"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Atraso >120 min favorece a fibrinólise.",
        "Correta. Lisar rápido e levar ao cateterismo em 2–24 h mesmo com reperfusão bem-sucedida.",
        "Incorreta. Deixa o paciente sem reperfusão.",
        "Incorreta. Após fibrinólise, a coronariografia é rotina (2–24 h); falha exige resgate imediato."
      ],
      "pearl": "Fibrinólise não é o fim: é a primeira metade da estratégia fármaco-invasiva."
    },
    {
      "id": "q-scape",
      "title": "Pilar do SCAPE",
      "question": "Mulher de 72 anos, PAS 210/110, dispneia súbita há 40 min, estertores difusos, peso habitual, sem edema. Pilar do tratamento?",
      "options": [
        "Furosemida 80 mg IV em bólus",
        "Morfina 4 mg IV",
        "VNI + nitroglicerina IV titulada",
        "Dobutamina"
      ],
      "answer": 2,
      "comments": [
        "Incorreta. Paciente euvolêmica; diurético isolado não corrige a pós-carga.",
        "Incorreta. Não recomendada de rotina.",
        "Correta. Vasodilatador + VNI tratam redistribuição e pós-carga.",
        "Incorreta. Sem hipoperfusão não há indicação."
      ],
      "pearl": "Fenótipo antes de furosemida."
    },
    {
      "id": "q-reperfusao",
      "title": "Critério de reperfusão",
      "question": "Qual é o critério MAIS confiável de reperfusão 60–90 min após fibrinólise?",
      "options": [
        "Desaparecimento da dor",
        "Redução ≥50% do supra de ST na derivação de maior elevação",
        "Aparecimento de RIVA",
        "Pico de CK-MB"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. A dor pode melhorar por analgesia.",
        "Correta. Falha → angioplastia de resgate imediata.",
        "Incorreta. RIVA sugere, mas é inespecífico.",
        "Incorreta. Marcador tardio e retrospectivo."
      ],
      "pearl": "Resolução ≥50% do ST é o critério mais confiável."
    },
    {
      "id": "q-tnk-idoso",
      "title": "Tenecteplase no idoso",
      "question": "Homem de 80 anos, 72 kg, IAMCSST, sem hemodinâmica disponível e sem contraindicações. Doses de tenecteplase e enoxaparina?",
      "options": [
        "TNK 40 mg + enoxaparina 30 mg IV + 1 mg/kg SC 12/12 h",
        "TNK 20 mg + enoxaparina 0,75 mg/kg SC 12/12 h, sem bólus IV",
        "TNK 40 mg + enoxaparina 0,75 mg/kg SC sem bólus",
        "TNK 20 mg + enoxaparina 1 mg/kg SC 12/12 h com bólus"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Dose plena e bólus IV aumentam o risco de hemorragia intracraniana no idoso.",
        "Correta. ≥75 anos: meia-dose de TNK (faixa 70–79,9 kg = 40 → 20 mg) e enoxaparina sem bólus, 0,75 mg/kg (máx. 75 mg nas 2 primeiras doses).",
        "Incorreta. Faltou reduzir a TNK pela idade.",
        "Incorreta. O bólus IV é omitido a partir de 75 anos."
      ],
      "pearl": "≥75 anos: meia-dose de TNK e enoxaparina sem bólus."
    },
    {
      "id": "q-janela-cv",
      "title": "Janela da cardioversão",
      "question": "FA estável iniciada há ~30 h, sem anticoagulação prévia. Segundo a ESC 2024, qual é a conduta antes de cardioverter?",
      "options": [
        "Cardioverter: está dentro de 48 h",
        "≥3 semanas de anticoagulação OU ETE excluindo trombo",
        "Amiodarona IV, que dispensa anticoagulação",
        "Cardioverter e anticoagular por 24 h"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. A ESC 2024 reduziu o limiar de 48 h para 24 h (a AHA 2023 ainda usa 48 h). Em prova, leia a diretriz pedida.",
        "Correta. Acima de 24 h, proteção embólica antes da reversão.",
        "Incorreta. Reversão química também emboliza.",
        "Incorreta. Após cardioversão, ≥4 semanas."
      ],
      "pearl": "ESC 2024: 24 h. AHA 2023: 48 h."
    },
    {
      "id": "q-cha2ds2va",
      "title": "CHA₂DS₂-VA",
      "question": "Mulher de 66 anos com FA, sem outros fatores. Pela ESC 2024, qual é o escore e a recomendação?",
      "options": [
        "CHA₂DS₂-VA 2: anticoagulação recomendada",
        "CHA₂DS₂-VA 1: anticoagulação deve ser considerada",
        "CHA₂DS₂-VA 0: sem indicação",
        "CHA₂DS₂-VA 3: anticoagulação obrigatória"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. O sexo feminino deixou de pontuar no escore da ESC 2024.",
        "Correta. Idade 65–74 = 1 ponto; escore 1 → considerar anticoagulação (classe IIa).",
        "Incorreta. A idade já pontua.",
        "Incorreta. Escore superestimado."
      ],
      "pearl": "CHA₂DS₂-VA: mesmo limiar para homens e mulheres."
    },
    {
      "id": "q-commit",
      "title": "Betabloqueador IV no IAMCSST",
      "question": "Sobre betabloqueador IV na fase aguda do IAMCSST, é correto afirmar:",
      "options": [
        "Deve ser dado a todos nas primeiras 6 h",
        "É contraindicado com Killip ≥II, hipotensão, bradicardia ou sinais de baixo débito",
        "Reduz mortalidade independentemente da hemodinâmica",
        "É preferível ao AAS quando há taquicardia"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. O COMMIT mostrou mais choque cardiogênico com uso indiscriminado.",
        "Correta. Reservar para pacientes estáveis, hipertensos ou taquicárdicos sem congestão.",
        "Incorreta. O risco de choque anula o benefício nos instáveis.",
        "Incorreta. Não substitui antiagregação."
      ],
      "pearl": "COMMIT: betabloqueador IV indiscriminado aumenta choque."
    },
    {
      "id": "q-injuria-cronica",
      "title": "Troponina sem curva",
      "question": "Troponina de alta sensibilidade elevada e estável (sem delta) em paciente dialítico internado por celulite. Conduta?",
      "options": [
        "Dupla antiagregação e heparina plena",
        "Coronariografia em 24 h",
        "Tratar a infecção e registrar injúria miocárdica crônica",
        "Fibrinólise"
      ],
      "answer": 2,
      "comments": [
        "Incorreta. Só acrescenta risco de sangramento.",
        "Incorreta. Não há SCA.",
        "Correta. Elevação sem curva = injúria crônica, comum na DRC, IC e HVE.",
        "Incorreta. Sem indicação."
      ],
      "pearl": "Sem delta, sem infarto agudo."
    },
    {
      "id": "q-cdi",
      "title": "CDI após IAM",
      "question": "Qual é a indicação correta de CDI para prevenção primária após IAM?",
      "options": [
        "FEVE ≤35% medida no 3º dia",
        "FEVE ≤35% com CF II–III reavaliada ≥40 dias após o IAM, sob terapia otimizada",
        "Todo IAM anterior extenso",
        "TV não sustentada na fase aguda"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Precoce demais: há recuperação de miocárdio atordoado.",
        "Correta. DINAMIT e IRIS: implante precoce não reduziu mortalidade total.",
        "Incorreta. Tamanho do infarto não é critério isolado.",
        "Incorreta. Arritmia da fase aguda não define prevenção primária."
      ],
      "pearl": "CDI: esperar ≥40 dias (≥90 dias após revascularização)."
    },
    {
      "id": "q-bb-pos-iam",
      "title": "Betabloqueador pós-IAM em 2025",
      "question": "Após IAM tratado com angioplastia, FEVE 45%, sem IC nem arritmia. O que a evidência de 2025 sugere sobre betabloqueador?",
      "options": [
        "Sem benefício em nenhuma faixa de FEVE",
        "Benefício na FEVE levemente reduzida (40–49%) em meta-análise de ensaios randomizados",
        "Indicado apenas se FEVE ≥50%",
        "Contraindicado após angioplastia"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. A meta-análise de 2025 mostrou redução do desfecho composto na FEVE 40–49%.",
        "Correta. Morte, novo IAM ou IC diminuíram nesse subgrupo; na FEVE ≥50% o tema segue controverso.",
        "Incorreta. É justamente na FEVE preservada que os resultados divergem.",
        "Incorreta. Não há contraindicação."
      ],
      "pearl": "Quanto menor a FEVE, mais claro o benefício do betabloqueador."
    },
    {
      "id": "q-natriurese",
      "title": "Resposta diurética",
      "question": "IC aguda congestiva recebeu furosemida IV. Qual achado indica resposta INSUFICIENTE e necessidade de intensificar?",
      "options": [
        "Sódio urinário <50–70 mEq/L em 2 h ou diurese <100–150 mL/h nas primeiras 6 h",
        "Queda de 5% da creatinina",
        "Diurese de 3 L em 24 h",
        "Melhora da dispneia em 1 h"
      ],
      "answer": 0,
      "comments": [
        "Correta. Critério da ESC 2021: dobrar a dose de alça e reavaliar; persistindo, associar outro diurético.",
        "Incorreta. Não mede resposta natriurética.",
        "Incorreta. Indica boa resposta.",
        "Incorreta. Sinal clínico favorável."
      ],
      "pearl": "Meça a natriurese em 2 h: não espere 24 h para descobrir que o diurético falhou."
    }
  ],
  "flashcards": [
    {
      "id": "f1",
      "front": "Alvo de FC no controle permissivo da FA (RACE II)?",
      "back": "<110 bpm em repouso; mais estrito só se persistirem sintomas ou houver taquicardiomiopatia."
    },
    {
      "id": "f2",
      "front": "Limiar de duração da FA para cardioversão sem proteção embólica na ESC 2024?",
      "back": "24 h (antes 48 h). A AHA 2023 mantém 48 h."
    },
    {
      "id": "f3",
      "front": "O que mudou do CHA₂DS₂-VASc para o CHA₂DS₂-VA?",
      "back": "O sexo feminino deixou de pontuar: mesmos limiares para homens e mulheres (ESC 2024)."
    },
    {
      "id": "f4",
      "front": "Fármacos proibidos na FA pré-excitada?",
      "back": "Adenosina, verapamil/diltiazem, betabloqueador, digital e amiodarona IV."
    },
    {
      "id": "f5",
      "front": "Energia na cardioversão da FA (ERC 2021)?",
      "back": "Choque sincronizado inicial na carga máxima do aparelho, preferível à escalada (CHESS)."
    },
    {
      "id": "f6",
      "front": "Quando a anticoagulação crônica exige varfarina e não DOAC?",
      "back": "Prótese valvar mecânica e estenose mitral reumática moderada a grave."
    },
    {
      "id": "f7",
      "front": "Três fenótipos do EAP?",
      "back": "Vascular/SCAPE, congestivo e choque cardiogênico (mais a causa mecânica/valvar aguda)."
    },
    {
      "id": "f8",
      "front": "Resultado do 3CPO?",
      "back": "VNI melhorou dispneia e acidose mais rápido, sem reduzir mortalidade em 7 dias."
    },
    {
      "id": "f9",
      "front": "Dose inicial de furosemida IV em quem já usa diurético (ESC 2021)?",
      "back": "1–2× a dose oral diária, por via IV."
    },
    {
      "id": "f10",
      "front": "Contraindicações ao nitrato no EAP?",
      "back": "PAS <90 mmHg, iPDE5 recente (sildenafila <24 h, tadalafila <48 h), IAM de VD, estenose aórtica grave (relativa), CMH obstrutiva."
    },
    {
      "id": "f11",
      "front": "Faixas de TNK por peso?",
      "back": "<60 kg 30 mg · 60–69 35 mg · 70–79 40 mg · 80–89 45 mg · ≥90 50 mg; metade se ≥75 anos."
    },
    {
      "id": "f12",
      "front": "Enoxaparina com fibrinolítico em ≥75 anos?",
      "back": "Sem bólus IV; 0,75 mg/kg SC 12/12 h (máx. 75 mg nas 2 primeiras doses). Se ClCr <30: 1 mg/kg SC a cada 24 h, sem bólus (bula)."
    },
    {
      "id": "f13",
      "front": "Sgarbossa: qual critério pesa 5 pontos?",
      "back": "Supra de ST concordante ≥1 mm. Escore ≥3 tem alta especificidade."
    },
    {
      "id": "f14",
      "front": "Síndrome de Pickering?",
      "back": "EAP súbito recorrente ('flash') associado a estenose bilateral de artéria renal."
    }
  ],
  "references": [
    {
      "year": "2024",
      "title": "ESC/EACTS Guidelines for the management of atrial fibrillation",
      "type": "Diretriz internacional",
      "use": "CHA₂DS₂-VA, janela de 24 h, controle de FC, AF-CARE",
      "url": "https://doi.org/10.1093/eurheartj/ehae176"
    },
    {
      "year": "2023",
      "title": "ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
      "type": "Diretriz internacional",
      "use": "Janela de 48 h, FA pré-excitada, doses IV",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38033089/"
    },
    {
      "year": "2023",
      "title": "ESC Guidelines for the management of acute coronary syndromes",
      "type": "Diretriz internacional",
      "use": "Fibrinólise, anticoagulação adjuvante, prevenção secundária",
      "url": "https://academic.oup.com/eurheartj/article/44/38/3720/7243210"
    },
    {
      "year": "2025",
      "title": "ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes",
      "type": "Diretriz internacional",
      "use": "SCA: ponte com o módulo dedicado",
      "url": "https://www.jacc.org/doi/10.1016/j.jacc.2024.11.009"
    },
    {
      "year": "2021",
      "title": "ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure",
      "type": "Diretriz internacional",
      "use": "Fenótipos de IC aguda, diuréticos, vasodilatadores, inotrópicos",
      "url": "https://academic.oup.com/eurheartj/article/42/36/3599/6358045"
    },
    {
      "year": "2023",
      "title": "Focused Update of the 2021 ESC Heart Failure Guidelines",
      "type": "Atualização de diretriz",
      "use": "Atualizações terapêuticas em IC",
      "url": "https://academic.oup.com/eurheartj/article/44/37/3627/7246292"
    },
    {
      "year": "2021",
      "title": "European Resuscitation Council Guidelines 2021: Adult advanced life support",
      "type": "Diretriz internacional",
      "use": "Cardioversão sincronizada e energia",
      "url": "https://pubmed.ncbi.nlm.nih.gov/33773825/"
    },
    {
      "year": "2020",
      "title": "CHESS — Maximum-fixed energy shocks for cardioverting atrial fibrillation",
      "type": "Ensaio randomizado",
      "use": "360 J × escalonamento",
      "url": "https://pubmed.ncbi.nlm.nih.gov/31504412/"
    },
    {
      "year": "2010",
      "title": "RACE II — Lenient versus strict rate control in atrial fibrillation",
      "type": "Ensaio randomizado",
      "use": "Alvo de FC <110 bpm",
      "url": "https://pubmed.ncbi.nlm.nih.gov/20231232/"
    },
    {
      "year": "2008",
      "title": "3CPO — Noninvasive ventilation in acute cardiogenic pulmonary edema",
      "type": "Ensaio randomizado",
      "use": "VNI × oxigênio padrão",
      "url": "https://pubmed.ncbi.nlm.nih.gov/18614781/"
    },
    {
      "year": "2011",
      "title": "DOSE — Diuretic strategies in acute decompensated heart failure",
      "type": "Ensaio randomizado",
      "use": "Bólus × infusão; dose baixa × alta",
      "url": "https://pubmed.ncbi.nlm.nih.gov/21366472/"
    },
    {
      "year": "2022",
      "title": "ADVOR — Acetazolamide in acute decompensated heart failure",
      "type": "Ensaio randomizado",
      "use": "Acetazolamida adjuvante",
      "url": "https://pubmed.ncbi.nlm.nih.gov/36027559/"
    },
    {
      "year": "2013",
      "title": "STREAM — Fibrinolysis or primary PCI in STEMI",
      "type": "Ensaio randomizado",
      "use": "Estratégia fármaco-invasiva e meia-dose de TNK ≥75 anos",
      "url": "https://pubmed.ncbi.nlm.nih.gov/23473396/"
    },
    {
      "year": "2005",
      "title": "COMMIT/CCS-2 — Early intravenous then oral metoprolol in acute MI",
      "type": "Ensaio randomizado",
      "use": "Betabloqueador IV e choque",
      "url": "https://pubmed.ncbi.nlm.nih.gov/16271643/"
    },
    {
      "year": "2025",
      "title": "β-blockers after MI with mildly reduced ejection fraction: IPD meta-analysis",
      "type": "Meta-análise",
      "use": "FEVE 40–49%",
      "url": "https://pubmed.ncbi.nlm.nih.gov/40897190/"
    },
    {
      "year": "2025",
      "title": "REBOOT — ESC press release",
      "type": "Ensaio randomizado (comunicado)",
      "use": "Betabloqueador com FEVE >40%",
      "url": "https://www.escardio.org/The-ESC/Press-Office/Press-releases/Beta-blockers-did-not-reduce-cardiovascular-events-in-selected-heart-attack-patients-in-the-REBOOT-trial"
    }
  ]
};
