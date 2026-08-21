window.SCA_TEMI = {
  "meta": {
    "version": "1.0.0",
    "updatedAt": "2026-08-21",
    "storagePrefix": "antigravity:sca-temi:v1"
  },
  "ecgScenarios": [
    {
      "id": "stemi",
      "label": "STEMI / oclusão",
      "title": "Elevação persistente de ST ou equivalente de oclusão",
      "priority": "Ative a via de reperfusão. Não espere biomarcadores quando o ECG e o contexto sustentam o diagnóstico de trabalho.",
      "actions": [
        "Confirme qualidade técnica, território e derivações contíguas; compare com ECG prévio se isso não atrasar a via.",
        "No infarto inferior, registre V3R–V4R para avaliar ventrículo direito quando indicado.",
        "Se houver depressão de ST em V1–V3 com suspeita posterior, registre V7–V9.",
        "Bloqueio de ramo ou ritmo estimulado não deve tranquilizar quando a suspeita de oclusão permanece alta."
      ],
      "trap": "Elevação de ST não é sinônimo automático de infarto tipo 1, mas diagnósticos alternativos devem ser avaliados sem criar atraso evitável na reperfusão de uma oclusão provável."
    },
    {
      "id": "nste",
      "label": "NSTE-ACS",
      "title": "Sem elevação persistente de ST",
      "priority": "Combine sintomas, ECG seriado, troponina de alta sensibilidade e estabilidade para classificar risco e tempo da estratégia invasiva.",
      "actions": [
        "Procure depressão de ST, inversão de T, elevação transitória e alterações dinâmicas durante sintomas.",
        "Repita o ECG se o primeiro for não diagnóstico, se a dor persistir/recorrer ou se o estado clínico mudar.",
        "Muito alto risco exige angiografia imediata; alto risco sustenta considerar estratégia invasiva precoce, em geral dentro de 24 horas.",
        "Use GRACE como parte da avaliação prognóstica, nunca isoladamente."
      ],
      "trap": "ECG inicial normal não exclui SCA. NSTEMI é diagnóstico clínico-biomarcador; angina instável pode ocorrer sem elevação de troponina."
    },
    {
      "id": "nondiagnostic",
      "label": "ECG não diagnóstico",
      "title": "A fotografia inicial pode perder um processo dinâmico",
      "priority": "Mantenha o paciente em uma via estruturada de observação e reavaliação se a probabilidade clínica não for baixa.",
      "actions": [
        "Repita ECG durante recorrência da dor e considere monitorização contínua do segmento ST.",
        "Use troponina de alta sensibilidade em protocolo validado, com delta e ponto de corte próprios do ensaio.",
        "Considere ecocardiografia e diagnósticos fatais alternativos de acordo com o contexto.",
        "Não aplique um resultado isolado de escore ou biomarcador fora do tempo desde o início dos sintomas."
      ],
      "trap": "Uma troponina inicial normal, especialmente muito cedo, não encerra a investigação."
    },
    {
      "id": "mimics",
      "label": "Diferenciais fatais",
      "title": "Trate SCA sem perder as ameaças que mudam o tratamento",
      "priority": "Dissecção aguda de aorta, embolia pulmonar, pneumotórax hipertensivo, tamponamento e outras causas graves podem simular SCA.",
      "actions": [
        "Procure assimetria de pulsos, déficit neurológico, dor abrupta transfixante e sinais de malperfusão quando houver suspeita de aorta.",
        "Avalie hipóxia desproporcional, sinais de ventrículo direito e fatores de risco para embolia pulmonar.",
        "Use POCUS/ecocardiografia por profissional treinado quando puder mudar imediatamente a conduta.",
        "Evite terapia antitrombótica automática antes de enfrentar uma suspeita relevante de dissecção aórtica."
      ],
      "trap": "O objetivo não é pedir todos os exames: é reconhecer qual diagnóstico alternativo mudaria imediatamente a via e o risco do tratamento."
    }
  ],
  "timeline": [
    {
      "id": "0-10",
      "label": "0–10 min",
      "title": "Estabilidade, ECG e ativação",
      "priority": "Defina se há instabilidade ou oclusão provável antes de buscar uma precisão diagnóstica impossível no primeiro minuto.",
      "actions": [
        "Avalie via aérea, respiração, circulação, perfusão, saturação, dor, estado mental e sinais de choque/insuficiência cardíaca.",
        "Obtenha e interprete ECG de 12 derivações em até 10 minutos.",
        "Inicie monitorização, acesso venoso e colete troponina de alta sensibilidade sem atrasar reperfusão no STEMI.",
        "Ative a rede de reperfusão/hemodinâmica cedo se houver STEMI, equivalente de oclusão ou NSTE-ACS de muito alto risco."
      ],
      "never": "Não administrar oxigênio rotineiramente se a saturação for ≥90%; use quando houver hipoxemia ou outra indicação clínica."
    },
    {
      "id": "10-60",
      "label": "10–60 min",
      "title": "Confirme a via e trate riscos concorrentes",
      "priority": "ECG seriado e trajetória clínica valem mais que uma única fotografia.",
      "actions": [
        "Repita ECG se o primeiro for não diagnóstico ou se houver mudança de sintomas/estado clínico.",
        "Use derivações direitas/posteriores no contexto apropriado.",
        "Aplique via de troponina validada para o ensaio e estime risco isquêmico e hemorrágico.",
        "Revise alergias, anticoagulação, função renal, anemia, sangramento, diagnóstico diferencial e medicamentos prévios."
      ],
      "never": "Não interpretar troponina acima do percentil 99 como infarto tipo 1 sem evidência de isquemia e padrão temporal compatível."
    },
    {
      "id": "1-6h",
      "label": "1–6 h",
      "title": "Reperfusão, resposta e complicações",
      "priority": "Depois da decisão inicial, confirme que a estratégia está funcionando e procure deterioração.",
      "actions": [
        "No STEMI tratado com fibrinólise, procure critérios de falha e necessidade de ICP de resgate; após sucesso, mantenha transferência para angiografia precoce.",
        "Reavalie dor, ST, perfusão, arritmias, congestão, sangramento e função renal.",
        "Faça ecocardiografia urgente em choque, instabilidade ou suspeita de complicação mecânica.",
        "Em choque com anatomia multivascular, priorize revascularização emergencial do vaso culpado; não faça ICP rotineira dos não culpados no mesmo ato."
      ],
      "never": "Não use o SYNTAX para atrasar o tratamento do vaso culpado em um paciente instável."
    },
    {
      "id": "6-24h",
      "label": "6–24 h",
      "title": "Telemetria, função ventricular e plano anatômico",
      "priority": "A maioria dos eventos hospitalares graves ocorre cedo; a intensidade de vigilância acompanha o risco.",
      "actions": [
        "Mantenha ECG contínuo em pacientes de alto risco e por pelo menos 24 horas após o início dos sintomas em todos com STEMI.",
        "Prolongue monitorização em instabilidade, arritmia importante, fração de ejeção <40%, reperfusão malsucedida, estenoses críticas adicionais ou complicações da ICP.",
        "Documente função ventricular e procure recorrência isquêmica, choque, insuficiência cardíaca, complicação mecânica, sangramento e lesão renal.",
        "Se houver doença multivascular complexa, planeje revascularização completa de modo individualizado e use Heart Team quando necessário."
      ],
      "never": "Não confundir alta precoce possível em paciente selecionado e estável com uma meta obrigatória para todos."
    },
    {
      "id": "alta",
      "label": "Antes da alta",
      "title": "Feche o ciclo agudo e abra a prevenção secundária",
      "priority": "A alta segura exige diagnóstico, anatomia/plano, função ventricular, tratamento, educação e seguimento coerentes.",
      "actions": [
        "Registre fração de ejeção, complicações, revascularização realizada e lesões remanescentes.",
        "Reconcilie tratamento antitrombótico e risco de sangramento conforme estratégia e protocolo.",
        "Otimize prevenção secundária, reabilitação cardíaca, tabagismo, lipídios, pressão e diabetes.",
        "Oriente sinais de alarme, adesão, retorno e seguimento."
      ],
      "never": "Não usar esta página para prescrever esquema ou duração antitrombótica sem integrar sangramento, anticoagulação, ICP, cirurgia e orientação cardiológica."
    }
  ],
  "complications": [
    {
      "id": "electrical",
      "title": "Arritmias e bloqueios",
      "signal": "Minutos–horas",
      "detail": "TV/FV, bradiarritmia e bloqueio atrioventricular podem causar deterioração abrupta. Resposta: reconhecer ritmo, perfusão e reversíveis; desfibrilar/estimular e escalar conforme algoritmo de suporte avançado."
    },
    {
      "id": "shock",
      "title": "Insuficiência cardíaca e choque",
      "signal": "Perfusão + congestão",
      "detail": "Hipotensão, extremidades frias, oligúria, alteração mental, lactato e edema pulmonar exigem ecocardiografia urgente, definição hemodinâmica e revascularização emergencial do vaso culpado quando aplicável."
    },
    {
      "id": "mechanical",
      "title": "Complicação mecânica",
      "signal": "Sopro ou colapso",
      "detail": "Ruptura de músculo papilar, comunicação interventricular e ruptura de parede livre podem aparecer com choque, novo sopro, edema pulmonar ou tamponamento. Ecocardiografia e equipe cirúrgica/Heart Team são urgentes."
    },
    {
      "id": "recurrent",
      "title": "Isquemia ou reinfarto",
      "signal": "Dor + ECG dinâmico",
      "detail": "Recorrência de dor, novas alterações de ST/T, instabilidade ou nova elevação de biomarcadores reabre a avaliação de oclusão, trombose de stent, lesão não tratada e necessidade de nova angiografia."
    },
    {
      "id": "bleeding",
      "title": "Sangramento",
      "signal": "Visível ou oculto",
      "detail": "Queda de hemoglobina, hipotensão, sangramento em acesso, gastrointestinal ou intracraniano mudam o balanço antitrombótico. Identifique fonte, gravidade e relação temporal; não suspenda terapias críticas sem decisão contextual."
    },
    {
      "id": "pericardial-thrombus",
      "title": "Pericardite e trombo de VE",
      "signal": "Dias–semanas",
      "detail": "Dor pleurítica/posicional, atrito ou novo derrame sugerem pericardite. Infarto anterior extenso e disfunção apical aumentam atenção para trombo de ventrículo esquerdo; imagem define a investigação."
    }
  ],
  "cases": [
    {
      "id": "case-ecg-10",
      "title": "ECG ainda na recepção",
      "stem": "Paciente com dor torácica contínua há 40 minutos chega estável. O primeiro ECG ainda não foi feito.",
      "question": "Qual é a prioridade diagnóstica?",
      "options": [
        "Aguardar a primeira troponina",
        "Obter e interpretar ECG de 12 derivações em até 10 minutos",
        "Solicitar ecocardiograma completo antes do ECG",
        "Aplicar SYNTAX clínico sem angiografia"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Troponina não substitui o ECG inicial e não deve atrasar reconhecimento de STEMI.",
        "Correta. ECG em até 10 minutos organiza a via imediata de reperfusão ou de NSTE-ACS.",
        "Incorreta. Ecocardiografia tem papel importante, mas não precede o ECG nem deve atrasar reperfusão.",
        "Incorreta. O SYNTAX anatômico depende da coronariografia e não é ferramenta de diagnóstico inicial."
      ],
      "pearl": "ECG primeiro; troponina em paralelo."
    },
    {
      "id": "case-stemi-troponin",
      "title": "ECG compatível, troponina pendente",
      "stem": "Dor típica persistente e elevação de ST em derivações contíguas. A troponina só ficará disponível em 35 minutos.",
      "question": "Qual princípio deve guiar a conduta?",
      "options": [
        "Esperar troponina para confirmar necrose",
        "Ativar a via de reperfusão sem aguardar biomarcador",
        "Repetir ECG apenas em seis horas",
        "Calcular GRACE antes de acionar hemodinâmica"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. O atraso pode aumentar a perda miocárdica.",
        "Correta. No STEMI clínico-eletrocardiográfico, biomarcador não deve atrasar reperfusão.",
        "Incorreta. A reperfusão é tempo-dependente.",
        "Incorreta. GRACE não substitui a via de reperfusão do STEMI."
      ],
      "pearl": "STEMI é diagnóstico de trabalho para reperfusão, não uma espera por troponina."
    },
    {
      "id": "case-nste-shock",
      "title": "NSTEMI com choque",
      "stem": "Troponina em ascensão, depressão de ST, extremidades frias, hipotensão e congestão pulmonar.",
      "question": "Qual é a prioridade?",
      "options": [
        "Estratégia seletiva após teste não invasivo",
        "Angiografia/revascularização emergencial do vaso culpado e suporte de choque",
        "Aguardar 24 horas por se tratar de NSTEMI",
        "Revascularizar rotineiramente todos os vasos no mesmo ato"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. O choque é critério de muito alto risco.",
        "Correta. Instabilidade exige estratégia invasiva imediata e foco no vaso culpado.",
        "Incorreta. O rótulo NSTEMI não reduz a urgência quando há choque.",
        "Incorreta. Em choque, ICP rotineira de vasos não culpados no mesmo ato aumenta dano em comparação com a estratégia culpado-primeiro."
      ],
      "pearl": "No choque, a fisiologia define o relógio e o vaso culpado define a prioridade."
    },
    {
      "id": "case-troponin",
      "title": "Troponina elevada na sepse",
      "stem": "Paciente séptico, taquicárdico, sem dor, com troponina acima do percentil 99 e sem alteração isquêmica no ECG.",
      "question": "Qual interpretação é mais segura?",
      "options": [
        "Todo valor acima do percentil 99 é infarto tipo 1",
        "Há lesão miocárdica; é preciso integrar delta, isquemia e causas alternativas",
        "A troponina não tem valor prognóstico",
        "O ECG normal exclui qualquer lesão miocárdica"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. Lesão miocárdica tem várias causas.",
        "Correta. Infarto exige lesão aguda e evidência de isquemia; sepse pode elevar troponina.",
        "Incorreta. Troponina frequentemente carrega informação prognóstica mesmo fora do infarto tipo 1.",
        "Incorreta. ECG e troponina respondem perguntas diferentes."
      ],
      "pearl": "Troponina responde 'há lesão?'; o contexto responde 'qual mecanismo?'."
    },
    {
      "id": "case-syntax",
      "title": "Doença de três vasos após estabilização",
      "stem": "Após tratamento do vaso culpado, a angiografia mostra doença de três vasos complexa. Há diabetes e função ventricular reduzida.",
      "question": "Como usar o SYNTAX?",
      "options": [
        "Como decisão automática por cirurgia",
        "Como parte da discussão do Heart Team, junto a fatores clínicos e possibilidade de revascularização completa",
        "Como escore de diagnóstico de NSTEMI",
        "Para substituir risco cirúrgico e preferência do paciente"
      ],
      "answer": 1,
      "comments": [
        "Incorreta. O escore apoia, mas não decide sozinho.",
        "Correta. Anatomia, clínica, completude, risco, preferência e expertise local devem ser integrados.",
        "Incorreta. SYNTAX descreve anatomia após angiografia.",
        "Incorreta. O escore anatômico não inclui todas essas dimensões."
      ],
      "pearl": "SYNTAX organiza a anatomia; o Heart Team organiza a decisão."
    }
  ],
  "questions": [
    {
      "id": "q-oxygen",
      "title": "Oxigênio na SCA",
      "question": "Em paciente com SCA e saturação de 96%, sem desconforto respiratório, qual conduta está alinhada às diretrizes?",
      "options": ["Oxigênio rotineiro", "Não oferecer oxigênio rotineiramente", "Intubar preventivamente", "Oxigênio apenas após troponina"],
      "answer": 1,
      "comments": ["Incorreta. Não melhora desfechos quando a saturação é ≥90%.", "Correta. Oxigênio é indicado se houver hipoxemia ou outra necessidade clínica.", "Incorreta. Não há indicação.", "Incorreta. A indicação depende de oxigenação e clínica, não da troponina."],
      "pearl": "Na SCA normoxêmica, oxigênio não é terapia de rotina."
    },
    {
      "id": "q-hstn",
      "title": "Troponina seriada",
      "question": "Qual afirmação é correta sobre hs-cTn?",
      "options": ["Um ponto de corte é universal para todos os ensaios", "Algoritmos rápidos usam limites e deltas específicos do ensaio", "Valor inicial normal sempre exclui infarto", "Troponina elevada sempre define mecanismo aterotrombótico"],
      "answer": 1,
      "comments": ["Incorreta. Os valores dependem do ensaio.", "Correta. O laboratório e a via validada precisam ser conhecidos.", "Incorreta. O tempo de sintomas e o delta importam.", "Incorreta. Elevação indica lesão, não mecanismo."],
      "pearl": "Conheça o ensaio local antes de aplicar 0/1 h ou 0/2 h."
    },
    {
      "id": "q-lytic",
      "title": "Fibrinólise",
      "question": "Quando a estratégia farmacoinvasiva entra no mapa do STEMI?",
      "options": ["Em qualquer NSTEMI", "Quando ICP primária não é possível no tempo recomendado, dentro da janela apropriada e sem contraindicação", "Depois de esperar a troponina", "Como substituta definitiva da angiografia"],
      "answer": 1,
      "comments": ["Incorreta. Fibrinólise não é terapia do NSTEMI.", "Correta. Depois, transfira para centro com ICP e avalie resgate/angiografia precoce.", "Incorreta. Troponina não deve atrasar reperfusão.", "Incorreta. A estratégia inclui transferência e angiografia."],
      "pearl": "Fibrinólise é uma ponte farmacoinvasiva, não o fim do percurso."
    },
    {
      "id": "q-monitor",
      "title": "Monitorização",
      "question": "Qual paciente merece pelo menos 24 h de monitorização de ritmo e ST?",
      "options": ["Somente quem teve FV", "Todo paciente com STEMI e demais pacientes de alto risco", "Apenas quem não fez ICP", "Somente quem tem dor persistente"],
      "answer": 1,
      "comments": ["Incorreta. O critério é mais amplo.", "Correta. A duração aumenta conforme o risco arrítmico e complicações.", "Incorreta. Reperfusão não elimina todo o risco precoce.", "Incorreta. Dor é só um dos sinais relevantes."],
      "pearl": "Telemetria acompanha risco, não apenas sintomas."
    },
    {
      "id": "q-syntax",
      "title": "Limite do SYNTAX",
      "question": "Qual variável não está adequadamente representada no SYNTAX anatômico isolado?",
      "options": ["Complexidade de bifurcação", "Extensão anatômica", "Fragilidade e risco cirúrgico", "Calcificação da lesão"],
      "answer": 2,
      "comments": ["Incorreta. Faz parte da complexidade anatômica.", "Incorreta. É objetivo do escore.", "Correta. É preciso integrar variáveis clínicas e risco cirúrgico.", "Incorreta. Contribui para complexidade anatômica."],
      "pearl": "Anatomia não é a pessoa inteira."
    },
    {
      "id": "q-shock-multivessel",
      "title": "Choque e múltiplos vasos",
      "question": "Na SCA com choque e anatomia multivascular, qual estratégia é recomendada no procedimento emergencial?",
      "options": ["ICP rotineira de todos os vasos", "Revascularização do vaso culpado primeiro", "Nenhuma revascularização", "Cirurgia obrigatória para todos"],
      "answer": 1,
      "comments": ["Incorreta. Pode aumentar morte ou falência renal.", "Correta. Lesões adicionais são tratadas depois conforme evolução e estratégia.", "Incorreta. Revascularização emergencial melhora sobrevida.", "Incorreta. A modalidade depende da anatomia e viabilidade, sem automatismo."],
      "pearl": "Choque: culpado primeiro; completude depois."
    }
  ],
  "flashcards": [
    {"id": "f1", "front": "Meta para ECG inicial na suspeita de SCA?", "back": "Obter e interpretar em até 10 minutos do primeiro contato/apresentação."},
    {"id": "f2", "front": "ECG normal exclui SCA?", "back": "Não. Repita se sintomas persistirem/recorrerem ou se a condição mudar."},
    {"id": "f3", "front": "Biomarcador preferido no NSTE-ACS?", "back": "Troponina cardíaca de alta sensibilidade em algoritmo validado para o ensaio."},
    {"id": "f4", "front": "Troponina elevada significa automaticamente infarto tipo 1?", "back": "Não. Indica lesão; infarto exige padrão agudo mais evidência de isquemia."},
    {"id": "f5", "front": "Quando a ICP primária é a estratégia preferida no STEMI?", "back": "Quando pode oferecer reperfusão em tempo adequado, usando como referência até 120 min do diagnóstico."},
    {"id": "f6", "front": "O que fazer após fibrinólise bem-sucedida?", "back": "Transferir para centro com ICP e realizar angiografia precoce, em geral entre 2 e 24 h."},
    {"id": "f7", "front": "Quando pensar em ICP de resgate?", "back": "Falha de reperfusão, instabilidade, piora isquêmica ou dor persistente após fibrinólise."},
    {"id": "f8", "front": "Oxigênio rotineiro com SpO₂ ≥90%?", "back": "Não; use se houver hipoxemia ou outra indicação clínica."},
    {"id": "f9", "front": "Critério que torna NSTE-ACS imediatamente invasiva?", "back": "Muito alto risco: choque/instabilidade, dor refratária, IC isquêmica, arritmia grave, complicação mecânica ou ECG dinâmico recorrente."},
    {"id": "f10", "front": "Tempo de monitorização em STEMI de alto risco?", "back": "Pelo menos 24 h de ritmo e ST; prolongar conforme risco e complicações."},
    {"id": "f11", "front": "SYNTAX é calculado antes ou depois da angiografia?", "back": "Depois: é um escore de complexidade anatômica coronariana."},
    {"id": "f12", "front": "SYNTAX alto decide sozinho por cirurgia?", "back": "Não. Apoia o Heart Team junto a clínica, risco, completude, preferência e expertise local."}
  ],
  "references": [
    {
      "year": "2025",
      "title": "ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes",
      "type": "Diretriz internacional",
      "use": "Avaliação inicial, terapias, estratégia invasiva, revascularização, choque e internação",
      "url": "https://www.jacc.org/doi/10.1016/j.jacc.2024.11.009"
    },
    {
      "year": "2023",
      "title": "ESC Guidelines for the management of acute coronary syndromes",
      "type": "Diretriz internacional",
      "use": "ECG, hs-cTn, risco, reperfusão, monitorização e cuidados hospitalares",
      "url": "https://academic.oup.com/eurheartj/article/44/38/3720/7243210"
    },
    {
      "year": "2021",
      "title": "ACC/AHA/SCAI Guideline for Coronary Artery Revascularization",
      "type": "Diretriz internacional",
      "use": "Heart Team, complexidade anatômica, ICP versus cirurgia e SYNTAX",
      "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001038"
    },
    {
      "year": "2020",
      "title": "Redevelopment and validation of the SYNTAX score II 2020",
      "type": "Análise de estudo multicêntrico com validação externa",
      "use": "Predição individualizada de longo prazo após ICP ou cirurgia em doença complexa",
      "url": "https://pubmed.ncbi.nlm.nih.gov/33038944/"
    },
    {
      "year": "2019",
      "title": "SYNTAXES: 10-year follow-up of the randomized SYNTAX trial",
      "type": "Seguimento de ensaio randomizado",
      "use": "Resultados tardios de ICP versus cirurgia em três vasos/tronco",
      "url": "https://pubmed.ncbi.nlm.nih.gov/31488373/"
    },
    {
      "year": "2017",
      "title": "CULPRIT-SHOCK: PCI Strategies in Patients with Acute Myocardial Infarction and Cardiogenic Shock",
      "type": "Ensaio clínico randomizado",
      "use": "Vaso culpado primeiro versus ICP multivascular imediata no choque",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1710261"
    }
  ]
};
