window.DERM_CRITICA = {
  meta: {
    version: "1.0.0",
    updatedAt: "2026-08-02",
    storagePrefix: "antigravity:dermatologia-critica:v1"
  },

  timeline: [
    {
      id: "0-10",
      label: "0–10 min",
      title: "Estabilize e interrompa a agressão",
      priority: "ABCDE primeiro. Não espere dermatologia para tratar instabilidade.",
      actions: [
        "Avalie via aérea, respiração, circulação, estado neurológico, temperatura e dor.",
        "Suspenda imediatamente o fármaco mais provável e reveja os não essenciais; preserve medicamentos indispensáveis sem suspeita forte até decisão clínica.",
        "Se anafilaxia: adrenalina intramuscular e protocolo próprio — urticária isolada não é SJS/TEN.",
        "Se descolamento, dor intensa, mucosa ou instabilidade: monitorização contínua e contato precoce com UTI/centro experiente."
      ],
      never: "Não fazer reexposição, não desbridar rotineiramente epiderme destacada e não atrasar suporte para obter biópsia."
    },
    {
      id: "10-60",
      label: "10–60 min",
      title: "Defina fenótipo, extensão e gravidade",
      priority: "Transforme um “rash” em dados mensuráveis.",
      actions: [
        "Examine toda a pele e mucosas ocular, oral e genital; registre dor, cor violácea, alvos atípicos, pústulas, edema facial e Nikolsky.",
        "Estime superfície corporal com eritema e com descolamento separadamente; fotografe apenas com consentimento e política institucional.",
        "Monte a linha do tempo de todos os fármacos: início, fim, ajuste, exposição prévia e primeira lesão.",
        "Solicite hemograma com diferencial, eletrólitos, ureia/creatinina, glicose, bicarbonato, transaminases, bilirrubinas e exames orientados pelo órgão suspeito."
      ],
      never: "Não rotule automaticamente como alergia a todos os medicamentos e não use um hemograma normal isolado para excluir fase inicial."
    },
    {
      id: "1-6h",
      label: "1–6 h",
      title: "Construa a equipe e proteja órgãos",
      priority: "SJS/TEN é cuidado multidisciplinar desde cedo.",
      actions: [
        "Acione dermatologia; considere biópsia de pele para padrão/diagnósticos diferenciais sem atrasar conduta.",
        "Na suspeita de SJS/TEN, acione oftalmologia — idealmente nas primeiras 24 horas — mesmo com sintomas oculares discretos.",
        "Use cobertura não aderente, minimize fricção, adesivos e procedimentos traumáticos; aqueça o ambiente e trate a dor.",
        "Planeje balanço hídrico individualizado, diurese, nutrição precoce e cuidados oral/genital/ocular."
      ],
      never: "Não aplicar automaticamente fórmulas de queimadura térmica; a reposição deve ser individualizada e em geral é menor."
    },
    {
      id: "6-24h",
      label: "6–24 h",
      title: "Confirme trajetória e escalone",
      priority: "A velocidade de progressão pesa mais que uma fotografia isolada.",
      actions: [
        "Reavalie extensão, mucosas, dor, diurese, eletrólitos e órgãos seriados.",
        "Calcule SCORTEN em SJS/TEN nas primeiras 24 horas; use como prognóstico, nunca como autorização para permanecer em enfermaria.",
        "Escolha terapia fenótipo-específica com especialista e protocolo local; documente qualidade da evidência e contraindicações.",
        "Inicie plano de prevenção de infecção sem antibiótico sistêmico profilático; colha culturas e trate apenas se houver suspeita clínica."
      ],
      never: "Não iniciar múltiplos imunomoduladores sem diagnóstico, objetivo, monitorização e plano de interrupção."
    },
    {
      id: "24-72h",
      label: "24–72 h",
      title: "Reavalie complicações e causalidade",
      priority: "O caso pode mudar de via: AGEP/DRESS podem ter sobreposição; SJS/TEN pode progredir.",
      actions: [
        "Repita o SCORTEN no dia 3 em SJS/TEN e reavalie necessidade de transferência/escalada a qualquer momento.",
        "Monitore infecção, cicatrização, dor, delirium, nutrição, trombose e complicações de olhos, boca, genitais e pulmões.",
        "Em DRESS, acompanhe órgãos seriados e planeje retirada lenta do corticoide quando usado; recaídas podem ocorrer.",
        "Registre o fármaco culpado provável, reação e alternativas seguras no prontuário e na alta; oriente evitar reexposição."
      ],
      never: "Não reduzir rapidamente corticoide sistêmico em DRESS grave que respondeu; recaída é frequente e o seguimento deve continuar após a alta."
    }
  ],

  phenotypes: [
    {
      id: "sjsten",
      icon: "🔥",
      name: "SJS/TEN",
      fullName: "Síndrome de Stevens–Johnson / necrólise epidérmica tóxica",
      latency: "Geralmente 5–28 dias após início; pode variar com reexposição/meia-vida",
      clue: "Dor, pele dusky, máculas-alvo atípicas, bolhas e descolamento",
      mucosa: "Quase sempre importante; ≥2 sítios é forte alarme",
      systemic: "Febre, perdas cutâneas, ocular/genital, respiratório; SCORTEN prognóstico",
      destination: "Internação; UTI/centro experiente precocemente se progressiva, extensa ou fisiologicamente grave",
      pearls: [
        "Classificação pela área descolada: SJS <10%; sobreposição 10–<30%; TEN ≥30%.",
        "O pródromo e a dor podem preceder o descolamento evidente.",
        "Oftalmologia nas primeiras 24 horas; sequelas podem surgir mesmo quando o acometimento inicial parece discreto."
      ],
      traps: "Confundir com eritema multiforme, AGEP com destacamento ou síndrome da pele escaldada; a biópsia ajuda, mas não deve atrasar suporte/transferência."
    },
    {
      id: "dress",
      icon: "🫀",
      name: "DRESS",
      fullName: "Reação a fármaco com eosinofilia e sintomas sistêmicos",
      latency: "Frequentemente 2–8 semanas; pode começar mais cedo em reexposição",
      clue: "Exantema infiltrado extenso + edema facial + febre/linfonodos",
      mucosa: "Pode ocorrer, em geral menos erosiva que SJS/TEN",
      systemic: "Eosinofilia/linfócitos atípicos; fígado, rim, pulmão, coração e outros órgãos",
      destination: "Internar se órgão envolvido ou evolução importante; UTI se falência orgânica/choque",
      pearls: [
        "Miocardite pode ser tardia e letal; dor, dispneia, arritmia ou troponina alterada exigem avaliação dirigida.",
        "Use RegiSCAR como apoio diagnóstico; não espere eosinofilia para interromper o provável culpado.",
        "Recaídas e autoimunidade tardia justificam seguimento após a fase aguda."
      ],
      traps: "Taper curto ou abrupto do corticoide em doença grave pode favorecer recaída; excluir infecção e outras causas de disfunção orgânica."
    },
    {
      id: "agep",
      icon: "⚪",
      name: "AGEP",
      fullName: "Pustulose exantemática generalizada aguda",
      latency: "Muitas vezes rápida (horas–poucos dias), sobretudo com antibióticos; pode variar",
      clue: "Centenas de pústulas estéreis, pequenas e não foliculares sobre eritema/edema",
      mucosa: "Ausente ou leve na maioria; mucosa intensa sugere sobreposição/diferencial",
      systemic: "Febre, neutrofilia; pode haver rim, fígado, pulmão ou choque em casos graves",
      destination: "Geralmente internação curta se extensa/sistêmica; UTI se choque, órgão grave ou falência cutânea",
      pearls: [
        "A retirada do fármaco e o suporte resolvem a maioria em dias a duas semanas.",
        "Descamação pós-pustular é esperada durante resolução.",
        "EuroSCAR e histopatologia ajudam quando há dúvida com pustular psoriasis, DRESS ou SJS/TEN."
      ],
      traps: "Não interpretar toda pústula como infecção bacteriana nem manter o antibiótico suspeito por reflexo."
    },
    {
      id: "erythroderma",
      icon: "🌡️",
      name: "Eritrodermia",
      fullName: "Eritema e descamação generalizados",
      latency: "Variável; aguda em fármacos, gradual em dermatoses/linfoma cutâneo",
      clue: "Eritema e descamação em ≥90% da superfície corporal",
      mucosa: "Não é a pista principal; erosão importante sugere SCAR associada",
      systemic: "Perda de calor/fluido/proteína, infecção, alto débito e descompensação cardíaca",
      destination: "Casos graves hospitalizam; UTI se instabilidade, hipotermia, insuficiência cardíaca, sepse ou disfunção orgânica",
      pearls: [
        "Investigue causa: psoríase, eczema, fármaco, linfoma cutâneo e outras dermatoses.",
        "A barreira cutânea falha: aqueça, hidrate com cautela, use emoliente e monitore balanço/eletrólitos.",
        "Biópsias seriadas e avaliação hematológica podem ser necessárias quando a causa permanece obscura."
      ],
      traps: "Corticoide sistêmico empírico pode mascarar diagnóstico e agravar rebote de psoríase; tratar a causa após estabilização."
    },
    {
      id: "exanthem",
      icon: "🌸",
      name: "Exantema simples",
      fullName: "Erupção morbiliforme medicamentosa de baixo risco aparente",
      latency: "Frequentemente 4–14 dias; mais rápida em reexposição",
      clue: "Máculas/pápulas simétricas, pruriginosas, sem dor ou pele dusky",
      mucosa: "Ausente",
      systemic: "Sem disfunção orgânica; febre baixa pode ocorrer, mas exige vigilância",
      destination: "Muitas vezes manejo em enfermaria/ambulatorial; reavaliar se surgirem sinais de alarme",
      pearls: [
        "Marque limites do rash e reavalie evolução, mucosas, face, dor e laboratório.",
        "Em hospitalizados, infecção viral, sepse e múltiplos fármacos ampliam o diferencial.",
        "A ausência de red flags hoje não elimina evolução para SCAR amanhã."
      ],
      traps: "Chamar de simples quando há dor, mucosa, edema facial, púrpura, pústulas, bolhas ou órgão envolvido."
    },
    {
      id: "urticaria",
      icon: "🫁",
      name: "Urticária/anafilaxia",
      fullName: "Reação imediata urticariforme com ou sem anafilaxia",
      latency: "Minutos a horas na forma imediata",
      clue: "Urticas migratórias; angioedema, broncoespasmo ou hipotensão na anafilaxia",
      mucosa: "Edema pode ocorrer; erosão não é típica",
      systemic: "Anafilaxia: via aérea, respiração e/ou circulação; sintomas GI podem acompanhar",
      destination: "Anafilaxia exige emergência, adrenalina IM e observação conforme risco; UTI se refratária/grave",
      pearls: [
        "Adrenalina intramuscular é primeira linha na anafilaxia; anti-histamínico não a substitui.",
        "Urticas individuais tendem a desaparecer em menos de 24 horas sem deixar marca.",
        "Lesão fixa dolorosa/purpúrica ou >24 horas sugere outro diagnóstico."
      ],
      traps: "Tratar hipotensão/broncoespasmo apenas com corticoide e anti-histamínico."
    }
  ],

  drugWindows: {
    sjsten: { min: 5, max: 28, label: "janela clássica de 5–28 dias", note: "Considere drogas de meia-vida longa e use ALDEN com dermatologia/farmacovigilância." },
    dress: { min: 14, max: 56, label: "janela frequente de 2–8 semanas", note: "Reexposição pode encurtar latência; alguns fármacos apresentam padrões próprios." },
    agep: { min: 0, max: 14, label: "janela geralmente curta, de horas a poucos dias", note: "Antibióticos podem desencadear rapidamente; outras drogas podem ter latência maior." },
    exanthem: { min: 4, max: 14, label: "janela frequente de 4–14 dias", note: "Reexposição pode produzir rash em 1–3 dias." }
  },

  therapies: [
    {
      id: "sjsten",
      label: "SJS/TEN",
      title: "SJS/TEN: suporte especializado é o tratamento central",
      foundation: [
        "Suspender cedo o provável culpado e evitar reexposição.",
        "Cuidado multidisciplinar em UTI/centro com experiência em falência cutânea/queimados conforme gravidade.",
        "Fluido e eletrólitos individualizados, analgesia, termorregulação, nutrição, cuidado não aderente e pouca fricção.",
        "Oftalmologia em até 24 horas; cuidado oral, genital e respiratório dirigido."
      ],
      escalation: [
        "Não há regime imunomodulador universalmente estabelecido. Evidência comparativa permanece limitada e heterogênea.",
        "Etanercepte e ciclosporina são opções discutidas em centros experientes; corticoide/IVIG e combinações variam por protocolo. Decidir cedo com dermatologia/UTI, considerando infecção, função renal, tempo de doença e contraindicações.",
        "A metanálise de 2026 encontrou sinal de menor mortalidade com etanercepte versus suporte, mas com imprecisão; isso não transforma a terapia em padrão automático."
      ],
      monitor: ["progressão da área destacada", "SCORTEN dias 1 e 3", "diurese/eletrólitos", "infecção", "olhos/mucosas", "dor/nutrição"],
      evidence: "Suporte: recomendação consistente de diretrizes. Imunomodulação: baixa ou muito baixa certeza para várias comparações; decisão especializada."
    },
    {
      id: "dress",
      label: "DRESS",
      title: "DRESS: a gravidade do órgão define a intensidade",
      foundation: [
        "Suspender o culpado, examinar órgãos e excluir alternativas infecciosas/autoimunes.",
        "Leve, sem órgão grave: corticoide tópico de alta potência, emoliente e monitorização seriada.",
        "Moderado: corticoide sistêmico pode ser considerado; individualize após avaliar órgão e infecção.",
        "Grave, com órgão ameaçado: corticoide sistêmico é recomendado por consenso, com equipe do órgão envolvido."
      ],
      escalation: [
        "O consenso Delphi sugere retirada em 6 semanas–3 meses nos casos leves/moderados e 3–6 meses nos graves, conforme resposta; evite desmame brusco.",
        "Refratário: ciclosporina, anti-IL-5/anti-IL-5R ou IVIG podem ser considerados em contexto especializado; evidência é limitada.",
        "Carga viral alta de CMV com manifestação compatível pode justificar antiviral; não tratar reativação laboratorial isolada automaticamente."
      ],
      monitor: ["fígado/coagulação", "rim/urina", "pulmão", "ECG/troponina se suspeita cardíaca", "hemograma/eosinófilos", "recaída e tireoide no seguimento"],
      evidence: "Consenso internacional de especialistas; faltam ensaios robustos e dose universal."
    },
    {
      id: "agep",
      label: "AGEP",
      title: "AGEP: retire o agente; a maioria melhora com suporte",
      foundation: [
        "Suspender o provável culpado e revisar antibióticos recentes.",
        "Emoliente, compressas, corticoide tópico e anti-histamínico se prurido.",
        "Monitorar febre, neutrofilia, rim, fígado e pulmão; investigar infecção apenas quando clinicamente indicada."
      ],
      escalation: [
        "Em AGEP com comprometimento sistêmico ou pele muito grave, consenso europeu admite prednisona 0,5 mg/kg/dia por 5–7 dias.",
        "Se houver provável sobreposição AGEP/DRESS, conduzir como DRESS e planejar desmame mais lento.",
        "Choque, órgão grave ou destacamento relevante exigem UTI e revisão diagnóstica/biópsia."
      ],
      monitor: ["superfície/pústulas", "temperatura", "neutrófilos", "rim/fígado", "choque", "descamação de resolução"],
      evidence: "Consenso europeu; ausência de ensaios terapêuticos fortes."
    },
    {
      id: "erythroderma",
      label: "Eritrodermia",
      title: "Eritrodermia: estabilize a barreira e trate a causa",
      foundation: [
        "Internar os casos graves; aquecer, corrigir fluidos/eletrólitos com cautela e monitorar circulação/diurese.",
        "Emoliente abundante, curativo úmido quando indicado e corticoide tópico de potência apropriada.",
        "Suspender medicamentos desnecessários; antibiótico sistêmico apenas se infecção clínica.",
        "Pesquisar psoríase, eczema, farmacodermia, linfoma cutâneo e outras causas."
      ],
      escalation: [
        "Tratar insuficiência cardíaca de alto débito, hipotermia, sepse e disfunção orgânica em UTI.",
        "Terapia sistêmica é causa-específica e deve ser discutida com dermatologia; evite corticoide sistêmico empírico sem avaliar psoríase/linfoma/infecção.",
        "Caso sem causa definida pode exigir biópsias seriadas, revisão de lâminas e investigação hematológica."
      ],
      monitor: ["temperatura", "peso/balanço", "eletrólitos/albumina", "coração", "infecção", "linfonodos e causa"],
      evidence: "Revisões e prática especializada; tratamento etiológico depende do diagnóstico."
    }
  ],

  destinations: [
    {
      icon: "🔥",
      title: "SJS/TEN",
      level: "Transferência precoce",
      triggers: [
        "descolamento progressivo ou ≥10% da superfície corporal",
        "duas ou mais mucosas, dor intensa ou necessidade complexa de curativos",
        "via aérea/respiratório, instabilidade, sepse ou distúrbio hidroeletrolítico/renal importante",
        "SCORTEN elevado/crescente ou serviço sem experiência multidisciplinar"
      ]
    },
    {
      icon: "🫀",
      title: "DRESS",
      level: "UTI por órgão ameaçado",
      triggers: [
        "miocardite, arritmia ou choque",
        "insuficiência hepática aguda, coagulopatia ou encefalopatia",
        "insuficiência respiratória, lesão renal grave ou SNC",
        "progressão rápida multiorgânica ou necessidade de suporte invasivo"
      ]
    },
    {
      icon: "🌡️",
      title: "Eritrodermia",
      level: "UTI por falência sistêmica",
      triggers: [
        "hipotermia ou instabilidade hemodinâmica",
        "insuficiência cardíaca de alto débito/descompensação",
        "perda hídrica/eletrolítica importante ou oligúria",
        "sepse, insuficiência respiratória ou fragilidade com deterioração"
      ]
    },
    {
      icon: "⚪",
      title: "AGEP/overlap",
      level: "UTI se forma grave",
      triggers: [
        "choque ou falência de órgão",
        "extensa falência cutânea/descolamento",
        "mucosa intensa ou suspeita de sobreposição SJS/TEN/DRESS",
        "progressão apesar da retirada do fármaco e suporte"
      ]
    }
  ],

  cases: [
    {
      id: "case-1",
      title: "Dor cutânea após alopurinol",
      stem: "Homem, 58 anos, 18 dias após iniciar alopurinol, apresenta febre, máculas violáceas dolorosas, erosões oral e ocular e 6% de descolamento. Estável hemodinamicamente.",
      question: "Qual é a melhor ação imediata?",
      options: [
        "Suspender o alopurinol, iniciar suporte e acionar dermatologia, oftalmo e transferência precoce",
        "Aguardar biópsia antes de suspender o medicamento",
        "Tratar como eritema multiforme e liberar",
        "Calcular SCORTEN e transferir apenas se ≥3"
      ],
      answer: 0,
      comments: [
        "Correta. Dor, pele violácea, duas mucosas e descolamento sugerem SJS/TEN; retirada precoce, suporte e equipe experiente não dependem de SCORTEN alto.",
        "Incorreta. A biópsia ajuda, mas não deve atrasar retirada do provável culpado ou suporte.",
        "Incorreta. O padrão é uma emergência cutânea; alta é insegura.",
        "Incorreta. SCORTEN estima prognóstico e não é critério isolado de transferência."
      ],
      pearl: "SJS com <10% de descolamento ainda pode progredir e exigir centro experiente."
    },
    {
      id: "case-2",
      title: "Edema facial e hepatite",
      stem: "Mulher, 44 anos, 5 semanas após iniciar carbamazepina, apresenta exantema infiltrado, edema facial, febre, eosinófilos 1.900/mm³ e ALT 12 vezes o limite superior.",
      question: "Qual via de manejo é mais coerente?",
      options: [
        "DRESS grave: suspender culpado, internar, avaliar órgãos e discutir corticoide sistêmico com desmame lento",
        "Exantema simples: anti-histamínico e alta",
        "AGEP: antibiótico empírico para as lesões",
        "SJS/TEN: desbridamento amplo imediato"
      ],
      answer: 0,
      comments: [
        "Correta. Latência, edema facial, eosinofilia e hepatite são muito sugestivos de DRESS com órgão relevante.",
        "Incorreta. Disfunção hepática exclui baixo risco e exige internação/monitorização.",
        "Incorreta. Não há padrão pustular; antibiótico pode piorar a causalidade.",
        "Incorreta. Não há descolamento/mucosa erosiva e desbridamento rotineiro não é recomendado nem em SJS/TEN."
      ],
      pearl: "Miocardite em DRESS pode ser silenciosa ou tardia; sintomas cardíacos pedem ECG/troponina/ecocardiograma."
    },
    {
      id: "case-3",
      title: "Pústulas após antibiótico",
      stem: "Paciente internado inicia piperacilina-tazobactam e, 36 horas depois, desenvolve febre, eritema difuso e centenas de pústulas não foliculares. Neutrofilia, mucosa poupada, sem órgão grave.",
      question: "Qual conduta inicial tem melhor relação benefício-risco?",
      options: [
        "Retirar o provável culpado, suporte e corticoide tópico, com monitorização",
        "Manter antibiótico e drenar as pústulas",
        "Iniciar IVIG de rotina",
        "Transferir obrigatoriamente para unidade de queimados"
      ],
      answer: 0,
      comments: [
        "Correta. O padrão sugere AGEP não complicada; retirada e suporte resolvem a maioria.",
        "Incorreta. Pústulas de AGEP costumam ser estéreis e não devem ser drenadas rotineiramente.",
        "Incorreta. IVIG não é terapia rotineira de AGEP.",
        "Incorreta. Transferência depende de choque, órgão, falência cutânea ou sobreposição, ausentes no caso."
      ],
      pearl: "AGEP pode descamar durante melhora; isso isoladamente não significa progressão para TEN."
    },
    {
      id: "case-4",
      title: "Eritrodermia e hipotermia",
      stem: "Homem, 72 anos, psoríase conhecida, eritrodermia em 95% da superfície, temperatura 35 °C, edema, oligúria e taquicardia 132/min.",
      question: "Qual é a prioridade?",
      options: [
        "UTI, aquecimento, avaliação hemodinâmica e correção cautelosa de fluidos/eletrólitos, além da dermatologia",
        "Apenas aumentar emoliente e revisar em 48 horas",
        "Bolus repetidos pela fórmula de Parkland",
        "Corticoide sistêmico empírico em alta dose antes de definir causa"
      ],
      answer: 0,
      comments: [
        "Correta. Hipotermia, oligúria e taquicardia indicam falência sistêmica associada à barreira cutânea.",
        "Incorreta. Medida tópica isolada é insuficiente diante de instabilidade fisiológica.",
        "Incorreta. Eritrodermia não é queimadura térmica; reposição deve ser individualizada.",
        "Incorreta. Em psoríase, corticoide sistêmico empírico pode causar rebote; estabilize e defina terapia etiológica especializada."
      ],
      pearl: "Eritrodermia pode causar vasodilatação, perda de calor/proteína e insuficiência cardíaca de alto débito."
    },
    {
      id: "case-5",
      title: "SCORTEN baixo, progressão alta",
      stem: "Paciente com SJS/TEN provável tem SCORTEN 1, mas o descolamento aumentou de 4% para 12% em seis horas e há erosões em três mucosas.",
      question: "Como interpretar?",
      options: [
        "A progressão e o acometimento mucoso justificam transferência, apesar do SCORTEN baixo",
        "SCORTEN 1 permite permanência em enfermaria sem monitorização",
        "Repetir o escore somente após sete dias",
        "O escore exclui TEN"
      ],
      answer: 0,
      comments: [
        "Correta. O escore é prognóstico e não substitui avaliação dinâmica ou capacidade do serviço.",
        "Incorreta. A evolução rápida exige escalada de cuidado.",
        "Incorreta. Recomenda-se avaliação nas primeiras 24 horas e repetição no dia 3, além de reavaliação clínica contínua.",
        "Incorreta. A classificação SJS/TEN depende da área destacada, não do SCORTEN."
      ],
      pearl: "Número pequeno não neutraliza um paciente que está piorando."
    },
    {
      id: "case-6",
      title: "DRESS e desmame rápido",
      stem: "Após melhora de DRESS com hepatite sob corticoide sistêmico, a dose foi reduzida rapidamente em sete dias. O rash, febre e ALT voltaram.",
      question: "Qual explicação e próximo passo são mais prováveis?",
      options: [
        "Recaída de DRESS; reavaliar órgãos/infecção e reestruturar desmame lento com especialista",
        "Alergia ao emoliente; suspender todo suporte",
        "É evolução inevitável; nenhuma reavaliação é necessária",
        "Fazer reexposição ao fármaco original para confirmar"
      ],
      answer: 0,
      comments: [
        "Correta. Recaída é reconhecida, especialmente com redução rápida; antes de intensificar, reavalie infecção e órgãos.",
        "Incorreta. O quadro sistêmico não é explicado de forma segura por emoliente.",
        "Incorreta. Recorrência exige nova avaliação de gravidade.",
        "Incorreta e perigosa. Reexposição a provável SCAR é contraindicada."
      ],
      pearl: "O consenso internacional sugere desmames de semanas a meses conforme gravidade."
    }
  ],

  questions: [
    {
      id: "q-1",
      title: "Área de descolamento",
      stem: "Qual faixa define a sobreposição SJS/TEN?",
      options: ["<5%", "<10%", "10% a <30%", "≥30%"],
      answer: 2,
      comments: [
        "Incorreta. Não é a faixa de sobreposição.",
        "Incorreta. <10% corresponde a SJS.",
        "Correta. Sobreposição é 10% a <30% de superfície com descolamento.",
        "Incorreta. ≥30% corresponde a TEN."
      ],
      pearl: "Estime área destacada separadamente da área apenas eritematosa."
    },
    {
      id: "q-2",
      title: "Antibiótico profilático",
      stem: "Em SJS/TEN sem foco infeccioso, o antibiótico sistêmico profilático deve ser:",
      options: ["Rotineiro", "Evitado; tratar infecção quando suspeita/documentada", "Iniciado se SCORTEN ≥2", "Definido pela área destacada"],
      answer: 1,
      comments: [
        "Incorreta. Diretrizes não recomendam profilaxia sistêmica rotineira.",
        "Correta. Vigilância e culturas dirigidas; tratar quando houver sinais clínicos.",
        "Incorreta. SCORTEN não indica antibiótico.",
        "Incorreta. A extensão não substitui critérios de infecção."
      ],
      pearl: "Febre pode fazer parte da doença; procure foco, tendência e fisiologia."
    },
    {
      id: "q-3",
      title: "Oftalmologia",
      stem: "Na suspeita de SJS/TEN, a avaliação oftalmológica deve ocorrer:",
      options: ["Somente se perda visual", "Após reepitelização", "Idealmente nas primeiras 24 horas", "Apenas em TEN ≥30%"],
      answer: 2,
      comments: [
        "Incorreta. Sintomas iniciais podem ser discretos e sequelas relevantes.",
        "Incorreta. Seria tarde para prevenção/manejo agudo.",
        "Correta. Diretrizes recomendam avaliação precoce, idealmente em 24 horas.",
        "Incorreta. SJS também pode ter acometimento ocular grave."
      ],
      pearl: "Examine olhos ativamente; não espere que o paciente peça parecer."
    },
    {
      id: "q-4",
      title: "SCORTEN",
      stem: "Qual variável NÃO faz parte do SCORTEN original?",
      options: ["Bicarbonato <20 mmol/L", "Frequência cardíaca >120/min", "Eosinofilia >1.500/mm³", "Descolamento >10%"],
      answer: 2,
      comments: [
        "Incorreta. Bicarbonato baixo vale um ponto.",
        "Incorreta. Frequência cardíaca >120/min vale um ponto.",
        "Correta. Eosinofilia sugere DRESS, mas não integra SCORTEN.",
        "Incorreta. Descolamento >10% vale um ponto."
      ],
      pearl: "Os sete itens também incluem idade, neoplasia, ureia e glicose."
    },
    {
      id: "q-5",
      title: "DRESS grave",
      stem: "Segundo consenso internacional, DRESS grave com órgão ameaçado deve geralmente receber:",
      options: ["Somente anti-histamínico", "Corticoide sistêmico e retirada lenta conforme resposta", "Reexposição controlada", "Antibiótico profilático"],
      answer: 1,
      comments: [
        "Incorreta. Anti-histamínico não trata órgão ameaçado.",
        "Correta. É a base consensual, embora dose/desmame exatos sejam individualizados.",
        "Incorreta. Reexposição é perigosa.",
        "Incorreta. Antibiótico depende de infecção, não do rótulo DRESS."
      ],
      pearl: "Gravidade é definida pelo órgão, não apenas pela extensão do rash."
    },
    {
      id: "q-6",
      title: "AGEP",
      stem: "Qual achado favorece AGEP?",
      options: ["Pústulas não foliculares difusas e neutrofilia", "Erosões em três mucosas com dor", "Miocardite tardia e eosinofilia", "Urticas migratórias"],
      answer: 0,
      comments: [
        "Correta. É o padrão clássico, geralmente de início rápido.",
        "Incorreta. Favorece SJS/TEN ou overlap.",
        "Incorreta. Favorece DRESS.",
        "Incorreta. Favorece urticária."
      ],
      pearl: "Mucosa intensa, descolamento ou órgão grave pedem revisão diagnóstica e biópsia."
    },
    {
      id: "q-7",
      title: "Eritrodermia",
      stem: "A eritrodermia costuma ser definida por eritema/descamação em:",
      options: [">10%", ">30%", ">50%", "≥90% da superfície corporal"],
      answer: 3,
      comments: [
        "Incorreta. É extensão insuficiente para a definição usual.",
        "Incorreta. É extensão insuficiente.",
        "Incorreta. Ainda não atinge o limiar convencional.",
        "Correta. O limiar usual é ≥90% da superfície corporal."
      ],
      pearl: "A gravidade decorre também da falência de barreira e da fisiologia, não só da porcentagem."
    },
    {
      id: "q-8",
      title: "Cuidado da pele em SJS/TEN",
      stem: "Qual estratégia é mais alinhada às diretrizes?",
      options: ["Desbridamento agressivo rotineiro", "Curativo não aderente e mínima fricção", "Adesivos fortes para fixar dispositivos", "Banhos quentes prolongados"],
      answer: 1,
      comments: [
        "Incorreta. Manejo conservador da epiderme é recomendado na maioria dos protocolos.",
        "Correta. Protege a barreira e reduz trauma.",
        "Incorreta. Adesivos podem ampliar destacamento.",
        "Incorreta. Pode piorar perda de calor/trauma."
      ],
      pearl: "Planeje monitorização com o menor trauma cutâneo possível."
    },
    {
      id: "q-9",
      title: "Imunomodulação em SJS/TEN",
      stem: "Qual afirmação é mais correta em 2026?",
      options: ["Existe um regime universal comprovado", "Suporte perdeu importância após etanercepte", "Evidência é limitada; escolha deve ser especializada e não substituir suporte", "IVIG é obrigatória para todos"],
      answer: 2,
      comments: [
        "Incorreta. Não há regime universal com alta certeza.",
        "Incorreta. Suporte especializado continua central.",
        "Correta. Há sinais para algumas terapias, mas estudos são heterogêneos e imprecisos.",
        "Incorreta. IVIG não é obrigatória e os dados são inconsistentes."
      ],
      pearl: "Distinguir possibilidade terapêutica de padrão obrigatório evita falsa precisão."
    },
    {
      id: "q-10",
      title: "Primeira documentação",
      stem: "O item mais útil para causalidade medicamentosa na admissão é:",
      options: ["Lista sem datas", "Linha do tempo de início/fim e primeira lesão de cada fármaco", "Somente o último antibiótico", "História familiar de alergia isolada"],
      answer: 1,
      comments: [
        "Incorreta. Sem datas não há avaliação adequada de latência.",
        "Correta. A cronologia completa é a base para causalidade e ALDEN/RegiSCAR.",
        "Incorreta. O culpado pode ser um medicamento iniciado semanas antes.",
        "Incorreta. Não substitui a cronologia individual."
      ],
      pearl: "Inclua medicamentos suspensos recentemente e drogas de meia-vida longa."
    }
  ],

  flashcards: [
    { id: "f-1", front: "SJS, overlap e TEN: porcentagens?", back: "SJS <10%; overlap 10% a <30%; TEN ≥30% de superfície corporal destacada." },
    { id: "f-2", front: "Tríade de alarme no rash hospitalar", back: "Dor cutânea + mucosa + disfunção orgânica/descolamento são sinais de possível SCAR e exigem avaliação imediata." },
    { id: "f-3", front: "O SCORTEN decide transferência?", back: "Não. Ele estima prognóstico; progressão, fisiologia e capacidade do serviço decidem o destino." },
    { id: "f-4", front: "Quando repetir SCORTEN?", back: "Nas primeiras 24 horas e no dia 3; reavaliar clinicamente o tempo todo." },
    { id: "f-5", front: "Oftalmo na SJS/TEN", back: "Idealmente nas primeiras 24 horas, mesmo com sintomas discretos." },
    { id: "f-6", front: "DRESS: latência típica", back: "Frequentemente 2–8 semanas; reexposição pode encurtar." },
    { id: "f-7", front: "DRESS: órgãos de alto risco", back: "Fígado, rim, pulmão e coração; miocardite pode ser tardia e letal." },
    { id: "f-8", front: "DRESS: erro de desmame", back: "Redução rápida do corticoide em doença grave pode precipitar recaída; planejar semanas a meses conforme gravidade/resposta." },
    { id: "f-9", front: "AGEP: pista dominante", back: "Pústulas pequenas, estéreis e não foliculares sobre eritema, com febre/neutrofilia e início frequentemente rápido." },
    { id: "f-10", front: "AGEP: base do tratamento", back: "Retirar o culpado + suporte/tópico; sistêmico apenas em forma grave selecionada." },
    { id: "f-11", front: "Eritrodermia: definição", back: "Eritema e descamação em ≥90% da superfície corporal." },
    { id: "f-12", front: "Eritrodermia: por que UTI?", back: "Hipotermia, choque, alto débito/IC, perdas hidroeletrolíticas, sepse ou falência orgânica." },
    { id: "f-13", front: "Antibiótico profilático em SJS/TEN?", back: "Não. Vigiar, cultivar quando indicado e tratar infecção suspeita/documentada." },
    { id: "f-14", front: "Curativo em SJS/TEN", back: "Não aderente, mínima fricção; evitar adesivos e desbridamento rotineiro agressivo." },
    { id: "f-15", front: "Fluidos em falência cutânea", back: "Individualizar por fisiologia e diurese; não copiar automaticamente fórmula de queimadura térmica." },
    { id: "f-16", front: "Causalidade em SJS/TEN", back: "Linha do tempo completa + ALDEN como apoio; nunca reexpor para confirmar." },
    { id: "f-17", front: "RegiSCAR ajuda em quais síndromes?", back: "DRESS e AGEP têm sistemas RegiSCAR/EuroSCAR de apoio; não substituem julgamento clínico." },
    { id: "f-18", front: "Sinal que reclassifica exantema simples", back: "Dor, mucosa, edema facial, púrpura, pústulas, bolhas, eosinofilia ou órgão envolvido." }
  ],

  references: [
    {
      id: "latin-sjsten-2025",
      year: "2025",
      title: "Latin American guidelines for the diagnosis and treatment of Stevens-Johnson syndrome and toxic epidermal necrolysis",
      type: "Diretriz",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11986972/",
      use: "Classificação, retirada do fármaco, suporte, oftalmologia, curativos e transferência."
    },
    {
      id: "bad-sjsten-2016",
      year: "2016",
      title: "U.K. guidelines for the management of Stevens-Johnson syndrome/toxic epidermal necrolysis in adults",
      type: "Diretriz BAD",
      url: "https://pubmed.ncbi.nlm.nih.gov/27317286/",
      use: "Equipe multidisciplinar, suporte, pele, infecção e centros experientes."
    },
    {
      id: "sjsten-meta-2026",
      year: "2026",
      title: "Systemic immunomodulating therapies for Stevens-Johnson syndrome and toxic epidermal necrolysis: systematic review and meta-analysis",
      type: "Revisão sistemática",
      url: "https://pubmed.ncbi.nlm.nih.gov/40905522/",
      use: "Eficácia comparativa e incerteza da imunomodulação."
    },
    {
      id: "cochrane-sjsten-2022",
      year: "2022",
      title: "Systemic interventions for treatment of Stevens-Johnson syndrome and toxic epidermal necrolysis",
      type: "Cochrane",
      url: "https://pubmed.ncbi.nlm.nih.gov/35274741/",
      use: "Certeza da evidência para terapias sistêmicas."
    },
    {
      id: "scorten-2000",
      year: "2000",
      title: "SCORTEN: a severity-of-illness score for toxic epidermal necrolysis",
      type: "Estudo original",
      url: "https://pubmed.ncbi.nlm.nih.gov/10951229/",
      use: "Sete variáveis e mortalidade histórica."
    },
    {
      id: "alden-2010",
      year: "2010",
      title: "ALDEN, an algorithm for assessment of drug causality in Stevens-Johnson syndrome and toxic epidermal necrolysis",
      type: "Estudo de validação",
      url: "https://pubmed.ncbi.nlm.nih.gov/20375998/",
      use: "Causalidade medicamentosa em SJS/TEN."
    },
    {
      id: "dress-delphi-2023",
      year: "2023",
      title: "Management of Adult Patients With Drug Reaction With Eosinophilia and Systemic Symptoms: A Delphi-Based International Consensus",
      type: "Consenso internacional",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10652220/",
      use: "Estratificação, terapia, desmame, refratariedade e seguimento em DRESS."
    },
    {
      id: "agep-consensus-2024",
      year: "2024",
      title: "European expert consensus on acute generalized exanthematous pustulosis",
      type: "Consenso europeu",
      url: "https://onlinelibrary.wiley.com/doi/10.1111/jdv.20232",
      use: "Diagnóstico, suporte e corticoide sistêmico em AGEP grave."
    },
    {
      id: "agep-review-2023",
      year: "2023",
      title: "Acute Generalized Exanthematous Pustulosis: Clinical Features, Differential Diagnosis, and Management",
      type: "Revisão",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10166469/",
      use: "Fenótipo, diferenciais e evolução."
    },
    {
      id: "erythroderma-review",
      year: "2020",
      title: "Erythroderma",
      type: "Revisão clínica",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7139437/",
      use: "Definição, etiologias, complicações e suporte hospitalar."
    }
  ]
};
