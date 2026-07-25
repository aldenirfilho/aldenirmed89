(function () {
  "use strict";

  const catalog = {
    meta: {
      schemaVersion: "1.0.0",
      moduleVersion: "1.1.0-rc.1",
      updatedAt: "2026-07-25",
      status: "em-revisao-medica",
      title: "Hematologia Crítica — Emergências & Diagnósticos Difíceis",
      storagePrefix: "hemato",
      sprintSeconds: 720,
      specialistGate: "adaptar ao protocolo institucional e confirmar com Hematologia, Hemoterapia e Farmácia Clínica."
    },

    categories: [
      { id: "all", label: "Todos" },
      { id: "microangiopatia", label: "MAT / plaquetas" },
      { id: "hiperinflamacao", label: "Hiperinflamação" },
      { id: "onco", label: "Onco-hemato" },
      { id: "coagulacao", label: "Coagulação" },
      { id: "hemolise", label: "Hemólise / transfusão" }
    ],

    diagnosticTracks: [
      {
        id: "maha",
        icon: "🔬",
        title: "Plaquetopenia + hemólise microangiopática",
        subtitle: "Esquizócitos, LDH alta, haptoglobina baixa, DAT geralmente negativo.",
        priority: [
          "Trate como microangiopatia trombótica até organizar o diferencial.",
          "Acione hematologia e acesso a plasmaférese se PTT for plausível.",
          "Colha ADAMTS13 antes de plasma quando isso não atrasar o cuidado."
        ],
        collect: [
          "Hemograma, reticulócitos, esfregaço revisado, LDH, bilirrubina, haptoglobina e DAT.",
          "PT/INR, aPTT, fibrinogênio e D-dímero; creatinina, EAS e proteinúria.",
          "Troponina/ECG, teste de gravidez e investigação do gatilho conforme contexto."
        ],
        avoid: "Não espere pêntade, febre ou déficit neurológico para suspeitar de PTT. PLASMIC ajuda, mas não encerra o caso.",
        related: ["ttp", "cmhus", "secondary-tma", "dic"]
      },
      {
        id: "fever-cytopenia",
        icon: "🌡️",
        title: "Febre + citopenias + ferritina/inflamação",
        subtitle: "HLH/MAS, sepse, malignidade e doença reumatológica podem coexistir.",
        priority: [
          "Avalie disfunção orgânica e necessidade de UTI enquanto investiga.",
          "Procure e trate gatilho infeccioso, maligno ou reumatológico em paralelo.",
          "Se a hiperinflamação progride, discuta terapia antes de completar todos os critérios."
        ],
        collect: [
          "Tendência de ferritina, hemograma, transaminases, bilirrubina, LDH, fibrinogênio e triglicerídeos.",
          "Culturas, imagem e testes dirigidos a infecção; revisão de medula quando indicada.",
          "Esplenomegalia, exame neurológico e rastreio de neoplasia/autoimunidade."
        ],
        avoid: "Ferritina isolada não diagnostica HLH/MAS. Critérios podem ser incompletos no início; valorize tendência e falência orgânica.",
        related: ["hlh-mas", "dic", "neutropenic-fever", "apl"]
      },
      {
        id: "bleeding-coagulopathy",
        icon: "🩹",
        title: "Sangramento + coagulopatia",
        subtitle: "Consumo, LPA, anticoagulante, deficiência ou inibidor adquirido.",
        priority: [
          "Controle fonte, ABC, temperatura, cálcio e choque hemorrágico conforme o caso.",
          "Acione hemoterapia cedo e reverta anticoagulante quando indicado pelo protocolo.",
          "Se houver suspeita de LPA, acione o fluxo específico imediatamente."
        ],
        collect: [
          "PT/INR, aPTT, fibrinogênio, D-dímero, plaquetas, função hepática e renal.",
          "Esfregaço, histórico de anticoagulantes e mistura do aPTT quando apropriado.",
          "Repetição seriada: a direção dos valores é mais útil que uma fotografia."
        ],
        avoid: "Fibrinogênio normal não exclui CIVD inicial; como reagente de fase aguda, pode começar alto.",
        related: ["dic", "apl", "acquired-hemophilia", "critical-itp"]
      },
      {
        id: "hyperleukocytosis",
        icon: "⚪",
        title: "Leucocitose extrema + sintoma neuro/respiratório",
        subtitle: "Leucostase é diagnóstico clínico e pode ocorrer sem um limiar universal.",
        priority: [
          "Acione onco-hematologia e UTI para citorredução urgente.",
          "Inicie prevenção e monitorização intensiva de lise tumoral.",
          "Evite transfundir hemácias automaticamente se isso puder agravar hiperviscosidade; discuta a estratégia."
        ],
        collect: [
          "Hemograma/esfregaço, eletrólitos, ácido úrico, fósforo, cálcio, creatinina e LDH.",
          "Coagulograma/fibrinogênio para LPA/CIVD.",
          "Imagem cerebral/tórax orientada pelo fenótipo, sem atrasar a citorredução."
        ],
        avoid: "O número de leucócitos não define sozinho leucostase. Sintomas pulmonares e neurológicos mudam a urgência.",
        related: ["leukostasis", "tls", "apl"]
      },
      {
        id: "heparin-platelets",
        icon: "💉",
        title: "Queda de plaquetas + heparina ± trombose",
        subtitle: "HIT é protrombótica; pedir PF4 sem probabilidade pré-teste gera falso-positivo.",
        priority: [
          "Calcule 4Ts com dados completos e reavalie se o quadro mudar.",
          "Probabilidade intermediária/alta: interrompa toda heparina e siga o algoritmo institucional de anticoagulante não heparínico.",
          "Procure trombose e necrose cutânea, além da queda absoluta de plaquetas."
        ],
        collect: [
          "Linha do tempo da exposição e contagens anteriores.",
          "Imunoensaio anti-PF4/heparina se 4Ts intermediário/alto.",
          "Ensaio funcional quando disponível e indicado."
        ],
        avoid: "Com 4Ts baixo, a diretriz recomenda não testar rotineiramente. A intensidade do anticoagulante depende também do risco de sangramento.",
        related: ["hit", "dic", "secondary-tma"]
      },
      {
        id: "acute-hemolysis",
        icon: "🧪",
        title: "Anemia aguda + hemólise",
        subtitle: "Imune, microangiopática, enzimática, transfusional ou falciforme.",
        priority: [
          "Defina gravidade: choque, hipóxia, dor torácica, hemoglobinúria, IRA ou isquemia.",
          "Integre DAT e esfregaço ao contexto; nenhum teste isolado substitui o fenótipo.",
          "Se transfusão é vital, coordene com hemoterapia em vez de aguardar compatibilidade perfeita."
        ],
        collect: [
          "Reticulócitos, LDH, bilirrubina, haptoglobina, DAT e esfregaço.",
          "Urina, função renal, potássio e coagulograma conforme gravidade.",
          "História de transfusão, fármacos, frio, infecção, prótese e doença falciforme."
        ],
        avoid: "DAT positivo não prova que toda anemia seja autoimune; DAT negativo não exclui completamente hemólise imune.",
        related: ["severe-aiha", "transfusion-reaction", "sickle-emergency", "ttp"]
      },
      {
        id: "neutropenic-sepsis",
        icon: "🦠",
        title: "Febre/instabilidade em neutropenia",
        subtitle: "A ausência de sinais inflamatórios exuberantes não tranquiliza.",
        priority: [
          "Aplicar bundle de sepse e antibiótico empírico antipseudomonas conforme protocolo local.",
          "A primeira dose deve ocorrer rapidamente; cultura não pode atrasá-la.",
          "Estratificar estabilidade, foco, duração prevista da neutropenia e exposição prévia."
        ],
        collect: [
          "Culturas periféricas e de cateter quando possível, lactato e função orgânica.",
          "Exame cuidadoso de pele, mucosa, cateter, pulmão, abdome e períneo.",
          "Imagem e investigação fúngica guiadas por risco e persistência."
        ],
        avoid: "Não use ausência de pus, leucocitose ou febre alta para reduzir a urgência em neutropenia profunda.",
        related: ["neutropenic-fever", "hlh-mas", "dic"]
      },
      {
        id: "transfusion-symptoms",
        icon: "🩸",
        title: "Sintoma novo durante transfusão",
        subtitle: "Hemólise, contaminação, anafilaxia, TRALI e TACO podem parecer iguais no início.",
        priority: [
          "Interrompa a transfusão e mantenha acesso venoso com solução compatível conforme protocolo.",
          "Avalie ABC, sinais vitais e trate anafilaxia/choque/hipoxemia imediatamente.",
          "Confira identificação e acione banco de sangue/hemoterapia."
        ],
        collect: [
          "Documentação do tempo, volume, produto e sinais.",
          "Amostras e bolsa/equipo conforme protocolo de reação transfusional.",
          "DAT, hemólise, culturas, BNP/imagem e balanço conforme fenótipo."
        ],
        avoid: "Não reinicie a bolsa por conta própria. Mesmo reação aparentemente leve precisa ser classificada antes de continuar.",
        related: ["transfusion-reaction", "sickle-emergency", "severe-aiha"]
      }
    ],

    emergencies: [
      {
        id: "ttp",
        title: "PTT imune",
        icon: "⚡",
        category: "microangiopatia",
        urgency: "Agora",
        color: "#ff3d67",
        summary: "MAT com trombocitopenia, geralmente ADAMTS13 <10%; a pêntade clássica não é necessária.",
        trigger: "Plaquetas baixas + anemia hemolítica microangiopática sem explicação melhor.",
        tags: ["MAT", "ADAMTS13", "PLASMIC", "plasmaférese"],
        firstHour: [
          "Acionar hematologia e acesso a troca plasmática terapêutica.",
          "Colher ADAMTS13 antes de plasma, se não houver atraso.",
          "Se probabilidade pré-teste for alta, iniciar a estratégia institucional de TPE + corticoide; discutir caplacizumabe e rituximabe."
        ],
        decisive: [
          "Esfregaço, LDH, haptoglobina, bilirrubina, reticulócitos e DAT.",
          "PLASMIC/French score como probabilidade pré-teste.",
          "Troponina/ECG e avaliação neurológica/renal."
        ],
        doNot: [
          "Não esperar a pêntade nem o resultado de ADAMTS13 para acionar o fluxo.",
          "Evitar plaquetas de rotina; reservar para sangramento ameaçador/procedimento crítico após discussão.",
          "Não usar esquizócitos isoladamente para fechar PTT."
        ],
        pearl: "PTT é uma doença do tempo: suspeita clínica alta vale mais que a completude da apresentação.",
        referenceIds: ["isth-ttp-2025", "isth-ttp-diagnosis", "bsh-tma-2023"]
      },
      {
        id: "cmhus",
        title: "SHU mediada por complemento",
        icon: "🧬",
        category: "microangiopatia",
        urgency: "Urgente",
        color: "#b79aff",
        summary: "MAT frequentemente renal-predominante após excluir PTT, toxina Shiga e causas secundárias.",
        trigger: "MAT + IRA importante, ADAMTS13 não gravemente reduzida e ausência de explicação alternativa suficiente.",
        tags: ["SHUa", "complemento", "IRA", "eculizumabe"],
        firstHour: [
          "Acionar nefrologia/hematologia e organizar exclusão rápida de PTT e STEC.",
          "Oferecer suporte renal, controlar pressão e retirar gatilhos/drogas suspeitas.",
          "Discutir bloqueio de C5 precocemente quando SHU mediada por complemento for provável."
        ],
        decisive: [
          "ADAMTS13, pesquisa de Shiga/STEC no contexto correto e revisão de causas secundárias.",
          "Função renal, urina/proteinúria, complemento e painel dirigido.",
          "História de gravidez, transplante, hipertensão grave, autoimunidade e fármacos."
        ],
        doNot: [
          "Não esperar genética para tratar doença provável e progressiva.",
          "Não chamar toda MAT renal de SHUa antes de excluir mimetizadores.",
          "Antes de bloqueio de C5, cumprir proteção antimeningocócica conforme protocolo."
        ],
        pearl: "O diagnóstico é clínico e de exclusão dinâmica; complemento sérico normal não exclui.",
        referenceIds: ["bsh-tma-2023"]
      },
      {
        id: "secondary-tma",
        title: "MAT secundária e mimetizadores",
        icon: "🧩",
        category: "microangiopatia",
        urgency: "Mesmo dia",
        color: "#62d8ed",
        summary: "HELLP, hipertensão maligna, câncer, transplante, drogas, esclerodermia e pseudo-MAT por B12.",
        trigger: "MAT com contexto causal forte ou achados que não cabem em PTT/SHU primária.",
        tags: ["HELLP", "HAS maligna", "B12", "transplante"],
        firstHour: [
          "Tratar o gatilho: parto quando indicado, controle pressórico, retirada de droga ou terapia da doença base.",
          "Manter PTT no radar até ADAMTS13 e fenótipo serem coerentes.",
          "Investigar B12 quando macrocitose, neutropenia, LDH desproporcional e reticulocitopenia."
        ],
        decisive: [
          "História obstétrica, pressão/fundo de olho e transplante/fármacos.",
          "VCM, reticulócitos, B12, homocisteína e ácido metilmalônico quando disponíveis.",
          "ADAMTS13 e coagulograma para separar PTT/CIVD."
        ],
        doNot: [
          "Não atribuir esquizócitos automaticamente a PTT.",
          "Não esquecer crise renal esclerodérmica e hipertensão maligna.",
          "Não perder pseudo-MAT por B12: plasmaférese não corrige a causa."
        ],
        pearl: "LDH muito alta com reticulócitos inadequadamente baixos é pista de eritropoiese ineficaz.",
        referenceIds: ["bsh-tma-2023"]
      },
      {
        id: "dic",
        title: "CIVD / coagulopatia de consumo",
        icon: "🕸️",
        category: "coagulacao",
        urgency: "Agora",
        color: "#ffbf47",
        summary: "Ativação sistêmica da coagulação por sepse, trauma, câncer, obstetrícia e outras causas.",
        trigger: "Doença associada + plaquetas em queda, PT prolongando, D-dímero alto e fibrinogênio em tendência de queda.",
        tags: ["CIVD", "ISTH", "fibrinogênio", "causa-base"],
        firstHour: [
          "Tratar agressivamente a causa de base.",
          "Avaliar sangramento/trombose e suporte hemoterápico guiado por clínica e protocolo.",
          "Repetir exames: tendência seriada é parte do diagnóstico."
        ],
        decisive: [
          "Plaquetas, PT/INR, fibrinogênio, D-dímero/FDP e esfregaço.",
          "Escore ISTH quando aplicável ao contexto.",
          "Função orgânica, lactato, culturas e investigação do gatilho."
        ],
        doNot: [
          "Não transfundir para 'normalizar laboratório' sem contexto clínico.",
          "Não excluir CIVD porque fibrinogênio está normal/alto no início.",
          "Não esquecer LPA, complicação obstétrica e aneurisma como gatilhos."
        ],
        pearl: "CIVD é síndrome secundária: corrigir o gatilho é a terapia central.",
        referenceIds: ["isth-dic-2026", "isth-dic-causes"]
      },
      {
        id: "hlh-mas",
        title: "HLH / MAS",
        icon: "🔥",
        category: "hiperinflamacao",
        urgency: "Agora",
        color: "#ff7849",
        summary: "Hiperinflamação sistêmica progressiva por infecção, malignidade, reumatologia ou predisposição genética.",
        trigger: "Febre persistente + citopenias + ferritina crescente, hepatite, esplenomegalia, DIC/hipofibrinogenemia ou falência orgânica.",
        tags: ["HLH", "MAS", "ferritina", "HScore"],
        firstHour: [
          "Avaliar falência orgânica e necessidade de UTI.",
          "Investigar e tratar gatilho infeccioso, maligno e reumatológico simultaneamente.",
          "Se inflamação grave/progressiva, discutir imunomodulação precoce com equipe experiente enquanto a investigação continua."
        ],
        decisive: [
          "Tendência de ferritina, hemograma, triglicerídeos, fibrinogênio, transaminases e LDH.",
          "HScore/HLH-2004 como ferramentas, não como portões absolutos.",
          "Medula, sCD25, função NK, EBV e genética conforme contexto/disponibilidade."
        ],
        doNot: [
          "Não esperar hemofagocitose na medula; ela pode faltar ou ser inespecífica.",
          "Não tratar ferritina isolada.",
          "Não usar protocolo pediátrico de HLH automaticamente para todo MAS secundário."
        ],
        pearl: "Critérios classificam; tendência inflamatória + disfunção orgânica determinam urgência.",
        referenceIds: ["eular-acr-hlh-2022", "hscore-original"]
      },
      {
        id: "apl",
        title: "LPA + coagulopatia",
        icon: "🧫",
        category: "onco",
        urgency: "Agora",
        color: "#ff3d67",
        summary: "Leucemia promielocítica aguda é emergência hemorrágica; ATRA não deve aguardar confirmação molecular quando a suspeita é forte.",
        trigger: "Blastos/promielócitos sugestivos + sangramento, plaquetopenia, fibrinogênio baixo ou CIVD.",
        tags: ["LPA", "ATRA", "PML-RARA", "hemorragia"],
        firstHour: [
          "Acionar onco-hematologia e iniciar o protocolo institucional de ATRA na suspeita.",
          "Suporte hemostático intensivo com metas institucionais e monitorização frequente.",
          "Enviar PML-RARA por método rápido e vigiar síndrome de diferenciação."
        ],
        decisive: [
          "Esfregaço/morfologia, PT/aPTT, fibrinogênio, D-dímero e plaquetas seriados.",
          "Confirmação genética de PML-RARA.",
          "Função renal/hepática, eletrólitos, ECG e risco de lise."
        ],
        doNot: [
          "Não aguardar genética para iniciar ATRA se a suspeita for alta.",
          "Evitar procedimentos invasivos desnecessários, inclusive punção lombar.",
          "Não relaxar suporte de coagulação após a primeira melhora."
        ],
        pearl: "Na LPA suspeita, minutos importam mais que a classificação completa da AML.",
        referenceIds: ["eln-apl"]
      },
      {
        id: "leukostasis",
        title: "Hiperleucocitose / leucostase",
        icon: "🌪️",
        category: "onco",
        urgency: "Agora",
        color: "#62d8ed",
        summary: "Obstrução microvascular clínica, sobretudo pulmonar e neurológica, em leucemias agudas.",
        trigger: "Hiperleucocitose com hipoxemia, dispneia, cefaleia, confusão, déficit, sangramento ou alteração visual.",
        tags: ["AML", "leucostase", "citorredução", "aférese"],
        firstHour: [
          "Acionar onco-hematologia/UTI para citorredução urgente.",
          "Hidratação e prevenção de lise tumoral com monitorização estreita de volume.",
          "Discutir leucaférese caso a caso; não é substituto da terapia antileucêmica."
        ],
        decisive: [
          "Hemograma/esfregaço e fenotipagem sem atrasar citorredução.",
          "Eletrólitos, ácido úrico, fósforo, cálcio, LDH e creatinina.",
          "Coagulograma/fibrinogênio e imagem dirigida aos sintomas."
        ],
        doNot: [
          "Não definir leucostase somente pelo número de leucócitos.",
          "Não transfundir hemácias automaticamente sem discutir hiperviscosidade.",
          "Leucaférese não é rotina em LPA."
        ],
        pearl: "Leucostase é fenótipo clínico; o mesmo número de leucócitos tem riscos diferentes conforme a doença.",
        referenceIds: ["hyperleukocytosis-review"]
      },
      {
        id: "tls",
        title: "Síndrome de lise tumoral",
        icon: "⚗️",
        category: "onco",
        urgency: "Agora",
        color: "#b79aff",
        summary: "HiperK, hiperfosfatemia, hipocalcemia, hiperuricemia e IRA espontâneas ou após terapia.",
        trigger: "Neoplasia de alto risco + eletrólitos/ácido úrico em ascensão, arritmia, oligúria, convulsão ou IRA.",
        tags: ["SLT", "rasburicase", "hipercalemia", "diálise"],
        firstHour: [
          "Monitorização cardíaca e tratamento imediato da hipercalemia sintomática/grave.",
          "Hidratação individualizada e controle rigoroso de balanço.",
          "Estratificar risco e usar hipouricemiante conforme protocolo; discutir terapia renal substitutiva cedo."
        ],
        decisive: [
          "Potássio, fósforo, cálcio, ácido úrico, creatinina e LDH seriados.",
          "ECG, diurese e estado volêmico.",
          "Carga tumoral, sensibilidade à terapia e função renal basal."
        ],
        doNot: [
          "Não corrigir hipocalcemia assintomática de rotina quando há hiperfosfatemia.",
          "Não atrasar diálise diante de indicação clínica/refratariedade.",
          "Rasburicase exige atenção a deficiência de G6PD."
        ],
        pearl: "A prevenção começa antes da primeira dose antineoplásica; alguns casos são espontâneos.",
        referenceIds: ["tls-consensus-2023"]
      },
      {
        id: "neutropenic-fever",
        title: "Febre neutropênica",
        icon: "🦠",
        category: "onco",
        urgency: "Até 1 h",
        color: "#58e6ad",
        summary: "Emergência infecciosa em que o exame físico pode ser silencioso e a progressão rápida.",
        trigger: "Febre ou instabilidade em neutropenia atual/esperada, especialmente ANC <500/µL.",
        tags: ["neutropenia", "sepse", "antipseudomonas", "culturas"],
        firstHour: [
          "Avaliar como sepse, colher culturas sem atrasar a primeira dose.",
          "Iniciar antibiótico empírico amplo antipseudomonas conforme epidemiologia/protocolo local.",
          "Estratificar alto risco, foco, cateter, mucosite e exposição prévia."
        ],
        decisive: [
          "Culturas periféricas e de cateter, lactato e função orgânica.",
          "Imagem guiada por sintomas; TC pode ser necessária mesmo com radiografia normal.",
          "Risco de fungo em febre persistente e neutropenia prolongada."
        ],
        doNot: [
          "Não esperar neutrófilos ou cultura para tratar.",
          "Não adicionar cobertura anti-MRSA rotineiramente sem indicação.",
          "Não usar 'aparência boa' isoladamente para decidir manejo ambulatorial."
        ],
        pearl: "Em neutropenia, a primeira manifestação de infecção pode ser apenas febre ou hipotensão.",
        referenceIds: ["asco-idsa-neutropenia", "idsa-neutropenia"]
      },
      {
        id: "hit",
        title: "Trombocitopenia induzida por heparina",
        icon: "🧷",
        category: "coagulacao",
        urgency: "Mesmo dia",
        color: "#ffbf47",
        summary: "Reação imune protrombótica; queda relativa e timing importam mais que plaquetopenia profunda.",
        trigger: "Queda >50% ou nova trombose tipicamente 5–14 dias após heparina, ou rápida com exposição recente.",
        tags: ["HIT", "4Ts", "PF4", "trombose"],
        firstHour: [
          "Calcular 4Ts com dados completos.",
          "Se intermediário/alto, suspender toda heparina e seguir anticoagulação não heparínica conforme risco de sangramento/órgãos.",
          "Investigar trombose e colher imunoensaio; confirmar com ensaio funcional quando indicado."
        ],
        decisive: [
          "Percentual de queda, nadir, timing, trombose e outras causas.",
          "Imunoensaio anti-PF4/heparina.",
          "Ensaio funcional e força do ELISA no contexto clínico."
        ],
        doNot: [
          "Não pedir PF4 com 4Ts baixo de rotina.",
          "Não iniciar varfarina na fase aguda antes de recuperação plaquetária.",
          "Não transfundir plaquetas rotineiramente sem sangramento/alto risco."
        ],
        pearl: "HIT causa trombose antes de causar sangramento; plaquetas podem permanecer >150 mil se a queda relativa for grande.",
        referenceIds: ["ash-hit"]
      },
      {
        id: "critical-itp",
        title: "PTI com sangramento crítico",
        icon: "🟣",
        category: "coagulacao",
        urgency: "Agora",
        color: "#b79aff",
        summary: "Plaquetopenia imune é diagnóstico de exclusão; hemorragia intracraniana ou instabilidade exige terapia combinada.",
        trigger: "Plaquetopenia isolada importante + sangramento ameaçador, após excluir MAT/CIVD/HIT/droga/medula.",
        tags: ["PTI", "IVIG", "corticoide", "plaquetas"],
        firstHour: [
          "Controle do sítio, hematologia e terapia de resgate combinada conforme protocolo.",
          "Corticoide + IVIG são eixos de resposta rápida; plaquetas entram como adjunto no sangramento crítico.",
          "Suspender agentes que agravam sangramento e investigar causa secundária."
        ],
        decisive: [
          "Esfregaço para pseudoplaquetopenia/blastos/esquizócitos.",
          "Coagulograma, hemólise, função renal/hepática e medicações.",
          "Imagem imediata conforme sítio de sangramento."
        ],
        doNot: [
          "Não definir PTI só pela contagem baixa.",
          "Não usar transfusão de plaquetas isolada como tratamento definitivo.",
          "Não atrasar neuroimagem em cefaleia/déficit com plaquetas muito baixas."
        ],
        pearl: "O alvo da emergência é hemostasia clínica, não uma contagem 'normal'.",
        referenceIds: ["itp-consensus"]
      },
      {
        id: "acquired-hemophilia",
        title: "Hemofilia A adquirida",
        icon: "🧯",
        category: "coagulacao",
        urgency: "Agora",
        color: "#ff7849",
        summary: "Autoanticorpo contra FVIII; sangramento novo em idosos, puerpério, autoimunidade, câncer ou sem causa.",
        trigger: "Hematomas extensos, sangramento de mucosa/músculo + aPTT isolado prolongado sem história prévia.",
        tags: ["FVIII", "inibidor", "aPTT", "Bethesda"],
        firstHour: [
          "Evitar procedimentos e acionar centro de hemofilia/hematologia.",
          "Controlar sangramento clinicamente relevante com agente hemostático especializado conforme disponibilidade.",
          "Iniciar plano de erradicação do inibidor após estratificação."
        ],
        decisive: [
          "Teste de mistura com incubação, atividade de FVIII e título de inibidor.",
          "Excluir heparina, anticoagulante lúpico com sangramento por outra causa e deficiência congênita.",
          "Pesquisar puerpério, autoimunidade, malignidade e fármacos."
        ],
        doNot: [
          "Não ignorar aPTT isolado antes de procedimento.",
          "Não usar plasma como solução principal para inibidor de alto título.",
          "Evitar punções/IM e procedimentos desnecessários."
        ],
        pearl: "Hemartrose é menos típica que grandes equimoses e sangramento de tecidos moles.",
        referenceIds: ["aha-consensus"]
      },
      {
        id: "severe-aiha",
        title: "Anemia hemolítica autoimune grave",
        icon: "🌡️",
        category: "hemolise",
        urgency: "Agora",
        color: "#ff7849",
        summary: "Hemólise quente, fria ou mista pode causar hipóxia, isquemia e incompatibilidade sorológica complexa.",
        trigger: "Queda rápida de Hb + reticulocitose/LDH/bilirrubina, haptoglobina baixa e DAT compatível.",
        tags: ["AHAI", "DAT", "transfusão", "hemólise"],
        firstHour: [
          "Avaliar necessidade de transfusão por fisiologia, não apenas por número.",
          "Acionar hemoterapia para selecionar a melhor unidade possível; transfusão vital não deve esperar compatibilidade perfeita.",
          "Tratar subtipo e causa; aquecimento é essencial na doença por aglutinina fria."
        ],
        decisive: [
          "DAT monoespecífico IgG/C3, esfregaço e marcadores de hemólise.",
          "Reticulócitos; reticulocitopenia é sinal de gravidade.",
          "Investigação de fármacos, infecção, autoimunidade e linfoproliferação."
        ],
        doNot: [
          "Não atribuir toda anemia com DAT positivo à AHAI.",
          "Não negar hemácias em instabilidade por causa da prova cruzada difícil.",
          "Não tratar doença fria primária como se fosse sempre AHAI quente."
        ],
        pearl: "Compatibilidade sorológica é meio; oxigenação tecidual é o objetivo.",
        referenceIds: ["aiha-consensus"]
      },
      {
        id: "transfusion-reaction",
        title: "Reação transfusional aguda",
        icon: "🚫",
        category: "hemolise",
        urgency: "Agora",
        color: "#ff3d67",
        summary: "Febre, dor, dispneia, urticária, hipotensão ou hemoglobinúria durante/até horas após transfusão.",
        trigger: "Qualquer sintoma novo temporalmente associado ao hemocomponente.",
        tags: ["TRALI", "TACO", "hemólise", "anafilaxia"],
        firstHour: [
          "Interromper transfusão, manter acesso conforme protocolo e avaliar ABC.",
          "Conferir paciente/produto e avisar banco de sangue/hemoterapia.",
          "Tratar anafilaxia, choque, hipoxemia ou sobrecarga pelo fenótipo."
        ],
        decisive: [
          "Clerical, inspeção do plasma, DAT, repetição ABO e hemólise.",
          "Culturas de paciente/bolsa se febre alta/choque.",
          "Balanço, imagem, BNP/eco conforme dúvida TACO vs TRALI."
        ],
        doNot: [
          "Não reiniciar sem avaliação e autorização do fluxo institucional.",
          "Não chamar toda dispneia de TACO; TRALI e anafilaxia mudam o tratamento.",
          "Não descartar reação grave porque os primeiros testes foram negativos."
        ],
        pearl: "A primeira conduta é a mesma diante da incerteza: parar, avaliar, conferir e comunicar.",
        referenceIds: ["bsh-transfusion-2023", "aabb-transfusion-2026"]
      },
      {
        id: "sickle-emergency",
        title: "Síndrome torácica / hiper-hemólise falciforme",
        icon: "🫁",
        category: "hemolise",
        urgency: "Agora",
        color: "#62d8ed",
        summary: "Nova opacidade pulmonar com sintomas na doença falciforme; transfusão pode salvar ou agravar hiper-hemólise.",
        trigger: "Dor/febre/hipoxemia/infiltrado ou queda de Hb após transfusão com Hb abaixo do pré-transfusional.",
        tags: ["falciforme", "STA", "troca", "hiper-hemólise"],
        firstHour: [
          "Oxigênio, analgesia cuidadosa, antibiótico, espirometria de incentivo e suporte respiratório.",
          "Acionar hematologia/hemoterapia para transfusão simples versus troca em síndrome grave/progressiva.",
          "Na hiper-hemólise, evitar transfusão adicional quando possível e seguir protocolo especializado."
        ],
        decisive: [
          "Hb versus basal, reticulócitos, LDH/bilirrubina, tipagem estendida e histórico de anticorpos.",
          "Imagem pulmonar, gasometria quando indicada e avaliação de infecção/TEP.",
          "Hemoglobina pós-transfusão e frações quando disponíveis."
        ],
        doNot: [
          "Não transfundir crise dolorosa não complicada de rotina.",
          "Não elevar Hb sem considerar hiperviscosidade.",
          "Não esquecer reação hemolítica tardia mesmo sem novo aloanticorpo detectável."
        ],
        pearl: "Síndrome torácica grave ou rapidamente progressiva favorece troca de hemácias quando disponível.",
        referenceIds: ["ash-scd-transfusion"]
      },
      {
        id: "caps",
        title: "SAF catastrófica",
        icon: "🧨",
        category: "coagulacao",
        urgency: "Agora",
        color: "#ffbf47",
        summary: "Tromboses multiorgânicas rápidas com trombocitopenia/MAT, frequentemente disparadas por infecção, cirurgia ou suspensão de anticoagulação.",
        trigger: "Falência de múltiplos órgãos em dias + tromboses de pequenos/grandes vasos e anticorpos antifosfolípides.",
        tags: ["CAPS", "SAF", "trombose", "plasmaférese"],
        firstHour: [
          "Acionar hematologia, reumatologia e UTI; tratar gatilho.",
          "Anticoagulação quando não houver contraindicação absoluta e imunomodulação combinada conforme protocolo.",
          "Discutir plasmaférese/IVIG cedo em doença multiorgânica."
        ],
        decisive: [
          "Imagem/biopsia quando segura para documentar tromboses.",
          "Anticoagulante lúpico, anticardiolipina e anti-β2GPI, interpretando interferência de anticoagulantes.",
          "Diferencial com PTT, CIVD, HIT, endocardite e HELLP."
        ],
        doNot: [
          "Não aguardar repetição em 12 semanas para tratar emergência provável.",
          "Não atribuir toda plaquetopenia a consumo sem procurar MAT.",
          "Não esquecer infecção como gatilho tratável."
        ],
        pearl: "CAPS é síndrome clínico-patológica; positividade laboratorial isolada não basta.",
        referenceIds: ["caps-review-2024", "eular-aps-2019"]
      }
    ],

    comparisons: [
      {
        id: "tma",
        label: "MAT: PTT × SHU × CIVD",
        title: "Microangiopatia trombótica: o que realmente separa?",
        intro: "Comece confirmando hemólise microangiopática e trombocitopenia. Depois use coagulação, rim, contexto e ADAMTS13.",
        columns: ["PTT imune", "SHU complemento", "SHU-STEC", "CIVD", "HELLP / pseudo-MAT B12"],
        rows: [
          { label: "Pista dominante", values: ["Plaquetas muito baixas, neuro/cardíaco", "IRA renal-predominante", "Diarreia/surto, IRA", "Doença-gatilho + consumo", "Gestação/hipertensão ou macrocitose"] },
          { label: "Coagulação", values: ["Geralmente preservada", "Geralmente preservada", "Geralmente preservada", "PT frequentemente prolonga, D-dímero alto", "HELLP variável; B12 preservada"] },
          { label: "ADAMTS13", values: ["<10% sustenta diagnóstico", "Não gravemente reduzida", "Não gravemente reduzida", "Não gravemente reduzida", "Não gravemente reduzida"] },
          { label: "Rim", values: ["Pode acometer; às vezes menos dominante", "Frequentemente grave", "Frequentemente grave", "Variável", "HELLP variável; B12 geralmente sem MAT renal típica"] },
          { label: "Ação crítica", values: ["TPE + imunossupressão; caplacizumabe conforme fluxo", "Discutir bloqueio de C5", "Suporte; evitar antibiótico/antimotilidade indiscriminados", "Tratar causa + suporte hemostático", "Resolver gestação/PA ou repor B12"] },
          { label: "Armadilha", values: ["Esperar pêntade/ADAMTS13", "Esperar genética", "Confundir com PTT sem contexto", "Fibrinogênio normal no início", "LDH muito alta + retic baixo na B12"] }
        ],
        pearl: "Se PTT continua plausível, a exclusão ainda não terminou — mesmo quando existe outro gatilho possível."
      },
      {
        id: "fever",
        label: "Febre + citopenias",
        title: "Febre e citopenias: HLH/MAS não é sinônimo de ferritina alta",
        intro: "Pense simultaneamente em hiperinflamação, infecção, malignidade e autoimunidade; mais de um processo pode estar ativo.",
        columns: ["HLH/MAS", "Sepse/CIVD", "Leucemia aguda", "Doença de Still/MAS", "Leishmaniose visceral"],
        rows: [
          { label: "Pistas", values: ["Ferritina crescente, espleno, hepatite, hipofibrinogênio", "Foco, choque, lactato, consumo", "Blastos, dor óssea, infiltração, lise", "Febre quotidiana, rash, artrite", "Exposição, esplenomegalia, pancitopenia"] },
          { label: "Ferritina", values: ["Pode ser muito alta; tendência importa", "Pode elevar, sobretudo choque/hepatopatia", "Pode elevar; mais se HLH associado", "Alta; pode disparar com MAS", "Pode elevar e mimetizar HLH"] },
          { label: "Próximo exame", values: ["TG/fibrinogênio, medula, sCD25 conforme acesso", "Culturas, imagem, coagulação seriada", "Esfregaço, citometria, medula", "Avaliação reumatológica e de órgão", "Teste direto/PCR/sorologia conforme cenário"] },
          { label: "Ação", values: ["Tratar gatilho + hiperinflamação se progressiva", "Antimicrobiano + suporte + controle do foco", "Onco-hematologia e prevenção de lise", "Controlar inflamação e gatilho", "Terapia etiológica; infectologia"] },
          { label: "Armadilha", values: ["Esperar 5/8 critérios", "Excluir HLH porque há sepse", "Perder LPA/HLH associado", "Chamar tudo de sepse", "Imunossuprimir antes de investigar endemia"] }
        ],
        pearl: "Hemofagocitose é um achado, não um diagnóstico; pode faltar no HLH e aparecer fora dele."
      },
      {
        id: "coag",
        label: "aPTT / PT alterados",
        title: "Coagulopatia com sangramento: o desenho do teste orienta o mecanismo",
        intro: "Reveja anticoagulantes e colete antes de reposição quando isso não atrasar hemostasia. Mistura do aPTT é contextual.",
        columns: ["CIVD", "Hepatopatia", "Anticoagulante", "Hemofilia A adquirida", "LPA"],
        rows: [
          { label: "Padrão", values: ["PT ± aPTT, plaquetas, D-dímero", "PT, fatores múltiplos, plaquetas", "Varia pelo fármaco/teste", "aPTT isolado prolongado", "CIVD/hiperfibrinólise + blastos"] },
          { label: "Fibrinogênio", values: ["Baixo ou tendência de queda", "Baixo em doença avançada", "Geralmente não define", "Preservado", "Frequentemente baixo"] },
          { label: "Mistura", values: ["Não é o exame central", "Pode corrigir parcialmente", "Pode não corrigir", "Não corrige após incubação", "Não é o exame central"] },
          { label: "Pista clínica", values: ["Doença-gatilho, sangramento/trombose", "Estigmas/falência hepática", "História e tempo da última dose", "Equimoses/músculo, puerpério/idoso", "Promielócitos, sangramento precoce"] },
          { label: "Ação", values: ["Tratar causa e suporte guiado", "Suporte + causa; não corrigir número isolado", "Antídoto/reversão conforme gravidade", "Agente hemostático + erradicar inibidor", "ATRA imediato na suspeita + suporte"] }
        ],
        pearl: "aPTT isolado novo com sangramento e sem heparina merece hemofilia adquirida até explicação melhor."
      },
      {
        id: "platelets",
        label: "Plaquetopenia na UTI",
        title: "Plaquetopenia do paciente crítico: tendência e contexto vencem o número",
        intro: "Confirme que é real, compare com a linha do tempo e procure trombose, hemólise e coagulopatia.",
        columns: ["Sepse/CIVD", "HIT", "PTT/MAT", "Droga/infecção", "Medula/PTI"],
        rows: [
          { label: "Timing", values: ["Com deterioração sistêmica", "5–14 dias; rápida se exposição recente", "Agudo, sem timing medicamentoso fixo", "Após nova exposição/infecção", "Variável; PTI mais isolada"] },
          { label: "Nadir típico", values: ["Variável, pode ser profundo", "Frequentemente moderado", "Frequentemente profundo na PTT", "Variável", "PTI pode ser muito profunda"] },
          { label: "Trombose", values: ["Micro/macro possível", "Muito característica", "Microvascular", "Dependente da causa", "PTI não é fenótipo primário"] },
          { label: "Hemólise", values: ["Pode haver esquizócitos", "Não é típica", "MAHA define síndrome", "Pode coexistir", "Não é típica em PTI isolada"] },
          { label: "Teste-chave", values: ["Coagulação seriada/gatilho", "4Ts → PF4 → funcional", "ADAMTS13 e MAT workup", "Revisão de fármacos/testes dirigidos", "Esfregaço, linhas celulares, medula se indicada"] }
        ],
        pearl: "A pseudoplaquetopenia por EDTA é um diagnóstico barato de excluir e caro de esquecer."
      },
      {
        id: "hemolysis",
        label: "Hemólise",
        title: "Hemólise aguda: DAT e esfregaço são bússola, não piloto automático",
        intro: "Integre o mecanismo ao cenário transfusional, infeccioso, mecânico, medicamentoso e falciforme.",
        columns: ["MAHA", "AHAI quente", "Aglutinina fria", "Reação transfusional", "G6PD / oxidativa"],
        rows: [
          { label: "Esfregaço", values: ["Esquizócitos", "Esferócitos", "Aglutinação", "Variável", "Bite cells/Heinz com coloração"] },
          { label: "DAT", values: ["Geralmente negativo", "IgG ± C3", "C3 predominante", "Pode ser positivo", "Negativo"] },
          { label: "Pista", values: ["Plaquetopenia/órgão", "Autoimune/linfoproliferação", "Frio/infeção/clonal", "Tempo após hemocomponente", "Fármaco, fava, infecção"] },
          { label: "Ação", values: ["Tratar TMA/CIVD causal", "Corticoide é eixo na quente; transfundir se vital", "Aquecer; terapia específica conforme gravidade", "Parar transfusão e acionar hemoterapia", "Retirar oxidante e suporte; transfundir se necessário"] },
          { label: "Armadilha", values: ["Confundir B12 com PTT", "DAT positivo incidental", "Aquecer só o paciente, não o circuito", "Reiniciar bolsa sem avaliação", "Testar G6PD durante crise pode dar falso-normal"] }
        ],
        pearl: "Reticulocitopenia em hemólise é sinal de alarme: falência medular, deficiência, anticorpo antirreticulócito ou crise aplástica."
      }
    ],

    concepts: [
      {
        icon: "🔬",
        label: "mecanismo",
        term: "Anemia hemolítica microangiopática",
        definition: "Hemólise intravascular por fragmentação mecânica na microcirculação, sugerida por esquizócitos, LDH alta e haptoglobina baixa.",
        application: "Quando vem com plaquetopenia e lesão de órgão, organiza o raciocínio de MAT antes do nome etiológico."
      },
      {
        icon: "🧬",
        label: "biomarcador",
        term: "ADAMTS13 gravemente reduzida",
        definition: "Atividade abaixo de 10% sustenta fortemente PTT, mas o resultado frequentemente chega depois da decisão inicial.",
        application: "Colha antes de plasma quando isso não atrasar; probabilidade clínica alta continua sendo emergência."
      },
      {
        icon: "🩹",
        label: "hemostasia",
        term: "Consumo versus inibidor",
        definition: "CIVD consome plaquetas e fatores; hemofilia adquirida costuma produzir aPTT isolado prolongado por inibidor de fator VIII.",
        application: "O desenho PT/aPTT/fibrinogênio/plaquetas direciona o próximo teste e evita reposição automática."
      },
      {
        icon: "🔥",
        label: "síndrome",
        term: "Hiperinflamação HLH/MAS",
        definition: "Ativação imune desregulada com febre, citopenias, hepatite, coagulopatia e falência orgânica; critérios podem ser incompletos no início.",
        application: "Investigue e trate gatilho e hiperinflamação em paralelo quando o paciente deteriora."
      },
      {
        icon: "🧫",
        label: "onco-hemato",
        term: "LPA como emergência hemorrágica",
        definition: "A leucemia promielocítica aguda pode estrear com CIVD/hiperfibrinólise e morte hemorrágica precoce.",
        application: "Promielócitos + coagulopatia devem acionar confirmação urgente, suporte hemostático e fluxo de ATRA."
      },
      {
        icon: "🌪️",
        label: "síndrome",
        term: "Leucostase",
        definition: "Disfunção microvascular clínica, sobretudo pulmonar e neurológica, em hiperleucocitose; não existe corte numérico universal.",
        application: "Sintomas definem urgência e citorredução; o hemograma isolado não encerra o risco."
      },
      {
        icon: "💉",
        label: "imunotrombose",
        term: "HIT é protrombótica",
        definition: "Anticorpos ativadores contra complexos PF4/heparina geram queda plaquetária e alto risco de trombose.",
        application: "Use 4Ts antes do laboratório; um anti-PF4 positivo sem contexto pode ser falso-positivo."
      },
      {
        icon: "🧪",
        label: "hemólise",
        term: "DAT é contexto, não veredito",
        definition: "O teste direto da antiglobulina detecta imunoglobulina/complemento na hemácia, mas pode ser positivo sem hemólise ou negativo em AHAI.",
        application: "Integre reticulócitos, bilirrubina, LDH, haptoglobina, esfregaço e fenótipo clínico."
      },
      {
        icon: "🧠",
        label: "cognição",
        term: "Probabilidade pré-teste",
        definition: "É a chance clínica antes do exame; determina se o teste acrescenta informação ou apenas produz ruído.",
        application: "PLASMIC e 4Ts organizam essa etapa, mas não substituem dados completos nem reavaliação."
      },
      {
        icon: "📈",
        label: "monitorização",
        term: "Tendência supera fotografia",
        definition: "Fibrinogênio, plaquetas, LDH, creatinina e ferritina podem ser pouco específicos em uma coleta isolada.",
        application: "Repita em intervalos definidos e interprete direção, velocidade e resposta ao tratamento."
      },
      {
        icon: "🩸",
        label: "hemoterapia",
        term: "Transfusão por fisiologia",
        definition: "Gravidade clínica, hipóxia, sangramento e velocidade de queda importam mais que um limiar isolado.",
        application: "Em hemólise imune grave, incompatibilidade sorológica não deve atrasar suporte vital coordenado."
      },
      {
        icon: "🛡️",
        label: "segurança",
        term: "Tratamento tempo-dependente",
        definition: "Algumas síndromes exigem ação antes da confirmação final: PTT provável, LPA suspeita, sepse neutropênica e reação transfusional.",
        application: "Colete o decisivo sem transformar investigação em atraso terapêutico."
      }
    ],

    mnemonics: [
      {
        code: "MAT = F·P·Ó",
        title: "Fragmentação · Plaquetopenia · Órgão",
        expansion: "Confirme hemólise por fragmentação, observe a queda plaquetária e mapeie rim, cérebro e coração.",
        use: "Para reconhecer a síndrome antes de separar PTT, SHU, CIVD e MAT secundária.",
        limit: "Esquizócitos podem ser poucos no início; ausência em uma lâmina não encerra o caso."
      },
      {
        code: "PTT = PLEX Já",
        title: "Probabilidade alta · Troca plasmática sem demora",
        expansion: "Colha ADAMTS13, acione especialista e inicie o fluxo institucional quando PTT é provável.",
        use: "Na MAT com plaquetas muito baixas e sem explicação melhor.",
        limit: "É gatilho operacional, não prescrição universal; caplacizumabe e imunossupressão dependem do fluxo."
      },
      {
        code: "HLH = F·C·F",
        title: "Ferritina em tendência · Citopenias · Falência",
        expansion: "Olhe a curva de ferritina, múltiplas linhagens e disfunção hepática, neurológica, respiratória ou hemostática.",
        use: "Para evitar que hiperinflamação progressiva seja rotulada apenas como sepse.",
        limit: "Ferritina alta não é específica e sepse pode coexistir."
      },
      {
        code: "LPA = ATRA",
        title: "Acione · Trate · Reponha · Acompanhe",
        expansion: "Acione onco-hematologia, trate pelo fluxo de suspeita, suporte coagulopatia e acompanhe parâmetros seriados.",
        use: "Promielócitos anormais com sangramento ou consumo.",
        limit: "A confirmação PML::RARA segue obrigatória; evite procedimentos invasivos."
      },
      {
        code: "HIT = 4 antes do PF4",
        title: "Quatro Ts antes do laboratório",
        expansion: "Thrombocytopenia, Timing, Thrombosis e oTher causes determinam a probabilidade pré-teste.",
        use: "Toda suspeita de trombocitopenia induzida por heparina.",
        limit: "Dados ausentes distorcem o escore; recalcule se o quadro mudar."
      },
      {
        code: "CIVD = C·I·V·D",
        title: "Causa · INR/PT · Velocidade · D-dímero",
        expansion: "Procure a doença-gatilho, acompanhe coagulação, valorize tendência e documente fibrinólise.",
        use: "Na coagulopatia do paciente crítico.",
        limit: "Fibrinogênio normal ou alto não exclui fase inicial."
      },
      {
        code: "AHA = DAT + MAPA",
        title: "DAT integrado ao mapa de hemólise",
        expansion: "DAT, esfregaço, reticulócitos, LDH, bilirrubina, haptoglobina e contexto formam o diagnóstico.",
        use: "Na anemia aguda com sinais de hemólise.",
        limit: "DAT positivo sozinho não prova causalidade."
      },
      {
        code: "TRANSFUSÃO = PARE",
        title: "Pare · ABC · Revise ID · Escale hemoterapia",
        expansion: "Interrompa a bolsa, estabilize, confira identificação e comunique antes de rotular a reação.",
        use: "Qualquer sintoma novo durante hemocomponente.",
        limit: "Não reinicie sem classificação e autorização do protocolo."
      },
      {
        code: "LEUCO = N·P·L",
        title: "Neurológico · Pulmonar · Lise",
        expansion: "Em hiperleucocitose, procure sintomas neuro/pulmonares e previna lise tumoral durante citorredução.",
        use: "Para reconhecer leucostase clínica.",
        limit: "O corte leucocitário varia com a doença; não espere um número mágico."
      },
      {
        code: "RETIC baixo = PARE",
        title: "Produção medular inadequada em suposta hemólise",
        expansion: "Pense em deficiência de B12/folato, crise aplástica, falência medular, infecção ou anticorpo antirreticulócito.",
        use: "Quando a medula não responde como esperado à anemia hemolítica.",
        limit: "Reticulócitos devem ser corrigidos para o grau de anemia."
      }
    ],

    alerts: [
      {
        level: "red",
        icon: "🚨",
        title: "Não espere a pêntade da PTT",
        message: "A apresentação completa é tardia e incomum.",
        action: "MAT + trombocitopenia sem alternativa convincente já dispara avaliação urgente."
      },
      {
        level: "red",
        icon: "🧫",
        title: "LPA suspeita é emergência",
        message: "A coagulopatia pode piorar antes da confirmação molecular.",
        action: "Acione imediatamente o protocolo de LPA e suporte hemostático."
      },
      {
        level: "yellow",
        icon: "🧪",
        title: "Anti-PF4 sem 4Ts gera ruído",
        message: "A positividade do imunoensaio não equivale a HIT clínica.",
        action: "Documente probabilidade pré-teste e use ensaio funcional quando indicado."
      },
      {
        level: "red",
        icon: "🔥",
        title: "HLH/MAS pode coexistir com sepse",
        message: "Encontrar infecção não encerra a investigação da hiperinflamação.",
        action: "Acompanhe falência orgânica, citopenias, ferritina, fibrinogênio e gatilhos."
      },
      {
        level: "yellow",
        icon: "📉",
        title: "Fibrinogênio normal não exclui CIVD",
        message: "Como reagente de fase aguda, ele pode começar elevado.",
        action: "Use tendência seriada, D-dímero/FDP, PT e plaquetas no contexto."
      },
      {
        level: "red",
        icon: "🩸",
        title: "Sangramento não espera compatibilidade perfeita",
        message: "Na anemia hemolítica crítica, atraso transfusional pode ser mais perigoso.",
        action: "Coordene a melhor unidade possível com hemoterapia e monitore."
      },
      {
        level: "yellow",
        icon: "🔬",
        title: "Esquizócito é pista, não etiologia",
        message: "PTT, SHU, CIVD, prótese, HELLP e hipertensão maligna podem fragmentar hemácias.",
        action: "Integre coagulação, rim, pressão, gestação, ADAMTS13 e gatilho."
      },
      {
        level: "red",
        icon: "🦠",
        title: "Neutropenia apaga sinais",
        message: "Ausência de pus ou grande resposta inflamatória não tranquiliza.",
        action: "Antimicrobiano e suporte não devem esperar exames completos."
      },
      {
        level: "yellow",
        icon: "⚪",
        title: "Leucostase é clínica",
        message: "O mesmo número de leucócitos tem riscos diferentes entre subtipos.",
        action: "Priorize sintomas neurológicos/pulmonares e prevenção de lise."
      },
      {
        level: "green",
        icon: "🔁",
        title: "Recalcule quando o paciente muda",
        message: "PLASMIC, 4Ts e CIVD refletem um momento e dados disponíveis.",
        action: "Defina intervalo de reavaliação e documente a tendência."
      }
    ],

    calculators: [
      {
        id: "plasmic-generic",
        shortTitle: "PLASMIC",
        title: "PLASMIC — probabilidade de ADAMTS13 <10%",
        kind: "probabilidade pré-teste",
        purpose: "probabilidade",
        description: "Ferramenta para adultos com suspeita de microangiopatia trombótica.",
        warning: "Não confirma nem exclui PTT sozinho e não deve atrasar tratamento quando a suspeita é alta.",
        requirements: [
          { id: "mat", label: "Há suspeita clínica de MAT em adulto (trombocitopenia + hemólise microangiopática)." }
        ],
        groups: [
          { id: "platelets", label: "Plaquetas <30 × 10⁹/L", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "hemolysis", label: "Critério de hemólise presente", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "cancer", label: "Sem câncer ativo", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "transplant", label: "Sem transplante prévio", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "mcv", label: "VCM <90 fL", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "inr", label: "INR <1,5", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "creatinine", label: "Creatinina <2,0 mg/dL", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] }
        ],
        ranges: [
          { min: 0, max: 4, label: "Baixa probabilidade", note: "PTT não é impossível; reavalie dados, contexto e alternativas." },
          { min: 5, max: 5, label: "Probabilidade intermediária", note: "Integre ADAMTS13 e discussão urgente; a conduta depende do fenótipo." },
          { min: 6, max: 7, label: "Alta probabilidade", note: "Acione o fluxo de PTT; não aguarde ADAMTS13 se a suspeita clínica for alta." }
        ]
      },
      {
        id: "four-ts",
        shortTitle: "4Ts",
        title: "4Ts — probabilidade pré-teste de HIT",
        kind: "probabilidade pré-teste",
        purpose: "probabilidade",
        description: "Quatro domínios clínicos antes de pedir anti-PF4/heparina.",
        warning: "Dados ausentes podem subestimar ou superestimar HIT; recalcule se o quadro ou a linha do tempo mudar.",
        requirements: [
          { id: "heparin", label: "Houve exposição relevante a heparina e a contagem/linha do tempo foi revisada." }
        ],
        groups: [
          {
            id: "thrombocytopenia",
            label: "Thrombocytopenia",
            options: [
              { label: "Queda <30% ou nadir <10", points: 0 },
              { label: "Queda 30–50% ou nadir 10–19", points: 1 },
              { label: "Queda >50% e nadir ≥20", points: 2 }
            ]
          },
          {
            id: "timing",
            label: "Timing",
            options: [
              { label: "≤4 dias sem exposição recente", points: 0 },
              { label: "Compatível mas incerto, após 14 dias ou reexposição 30–100 dias", points: 1 },
              { label: "Início claro 5–14 dias ou ≤1 dia com exposição <30 dias", points: 2 }
            ]
          },
          {
            id: "thrombosis",
            label: "Thrombosis / sequela",
            options: [
              { label: "Nenhuma", points: 0 },
              { label: "Suspeita, progressiva/recorrente ou lesão cutânea não necrótica", points: 1 },
              { label: "Nova trombose confirmada, necrose, reação IV ou hemorragia adrenal", points: 2 }
            ]
          },
          {
            id: "other",
            label: "oTher causes",
            options: [
              { label: "Causa alternativa definida", points: 0 },
              { label: "Causa alternativa possível", points: 1 },
              { label: "Nenhuma causa aparente", points: 2 }
            ]
          }
        ],
        ranges: [
          { min: 0, max: 3, label: "Baixa probabilidade", note: "Diretriz ASH recomenda não testar/tratar rotineiramente, salvo incerteza importante nos dados." },
          { min: 4, max: 5, label: "Probabilidade intermediária", note: "Seguir algoritmo institucional: interromper heparina, testar e escolher intensidade conforme risco trombótico/hemorrágico." },
          { min: 6, max: 8, label: "Alta probabilidade", note: "Seguir fluxo urgente de HIT com anticoagulante não heparínico e testes apropriados." }
        ]
      },
      {
        id: "isth-overt-dic",
        shortTitle: "ISTH CIVD",
        title: "ISTH — escore de CIVD manifesta",
        kind: "escore diagnóstico seriado",
        purpose: "compatibilidade",
        description: "Organiza plaquetas, marcador de fibrina, prolongamento do PT e fibrinogênio na presença de doença-gatilho.",
        warning: "Só deve ser aplicado em contexto associado a CIVD; um valor isolado não substitui tendência, clínica nem diagnóstico da causa.",
        requirements: [
          { id: "trigger", label: "Existe doença subjacente conhecida por associar-se a CIVD." }
        ],
        groups: [
          {
            id: "platelets",
            label: "Plaquetas",
            options: [
              { label: "≥100 × 10⁹/L", points: 0 },
              { label: "50–99 × 10⁹/L", points: 1 },
              { label: "<50 × 10⁹/L", points: 2 }
            ]
          },
          {
            id: "fibrin",
            label: "D-dímero / produtos de degradação",
            options: [
              { label: "Sem aumento", points: 0 },
              { label: "Aumento moderado", points: 2 },
              { label: "Aumento forte", points: 3 }
            ]
          },
          {
            id: "pt",
            label: "Prolongamento do PT",
            options: [
              { label: "<3 segundos", points: 0 },
              { label: "3 a <6 segundos", points: 1 },
              { label: "≥6 segundos", points: 2 }
            ]
          },
          {
            id: "fibrinogen",
            label: "Fibrinogênio",
            options: [
              { label: "≥1,0 g/L", points: 0 },
              { label: "<1,0 g/L", points: 1 }
            ]
          }
        ],
        ranges: [
          { min: 0, max: 4, label: "Não compatível com CIVD manifesta neste momento", note: "Repetir em 1–2 dias ou antes se deterioração; CIVD não manifesta continua possível." },
          { min: 5, max: 8, label: "Compatível com CIVD manifesta", note: "Correlacionar clinicamente, tratar a causa e monitorar parâmetros de forma seriada." }
        ]
      }
    ],

    questions: [
      {
        id: "q1",
        domain: "PTT/MAT",
        prompt: "Em adulto com MAT provável e PLASMIC 7, qual interpretação é correta?",
        options: ["PTT está confirmada", "ADAMTS13 é dispensável", "Há alta probabilidade pré-teste de ADAMTS13 gravemente reduzida", "Plaquetas devem ser transfundidas rotineiramente"],
        correct: 2,
        explanation: "PLASMIC estima probabilidade pré-teste; confirmação integra ADAMTS13 e contexto, sem atrasar a emergência.",
        rule: "Escore orienta probabilidade, não substitui diagnóstico."
      },
      {
        id: "q2",
        domain: "HIT",
        prompt: "Qual cenário corresponde a 2 pontos no domínio trombocitopenia do 4Ts?",
        options: ["Queda de 25%", "Nadir de 8 mil", "Queda >50% com nadir ≥20 mil", "Qualquer plaquetopenia após heparina"],
        correct: 2,
        explanation: "A combinação de queda relativa >50% e nadir ≥20 ×10⁹/L vale 2 pontos.",
        rule: "Em HIT, a queda relativa costuma ser mais informativa que um nadir extremo."
      },
      {
        id: "q3",
        domain: "CIVD",
        prompt: "Fibrinogênio de 320 mg/dL em paciente séptico exclui CIVD?",
        options: ["Sim", "Não, pode estar normal/alto no início e a tendência importa", "Sim, se D-dímero alto", "Só se plaquetas normais"],
        correct: 1,
        explanation: "Fibrinogênio é reagente de fase aguda; a direção seriada e os demais parâmetros são essenciais.",
        rule: "Na CIVD, fotografe menos e filme mais."
      },
      {
        id: "q4",
        domain: "LPA",
        prompt: "Promielócitos anormais + consumo importante: qual ação não deve aguardar PML::RARA?",
        options: ["Punção lombar", "Fluxo de ATRA e suporte hemostático institucional", "Biópsia de linfonodo", "Observação por 24 horas"],
        correct: 1,
        explanation: "LPA é emergência hemorrágica; confirmação molecular corre em paralelo.",
        rule: "Suspeita morfológica forte de LPA muda a primeira hora."
      },
      {
        id: "q5",
        domain: "HLH/MAS",
        prompt: "Qual afirmação sobre hemofagocitose é correta?",
        options: ["É obrigatória", "Confirma HLH isoladamente", "Pode faltar no início e aparecer em outras condições", "Exclui infecção"],
        correct: 2,
        explanation: "É um achado inespecífico e não obrigatório.",
        rule: "HLH/MAS é síndrome clínico-laboratorial dinâmica."
      },
      {
        id: "q6",
        domain: "Leucostase",
        prompt: "O que melhor define leucostase?",
        options: ["Leucócitos >100 mil em qualquer leucemia", "Síndrome clínica de disfunção microvascular, sobretudo neuro/pulmonar", "D-dímero alto", "Febre com neutropenia"],
        correct: 1,
        explanation: "O risco varia por subtipo e os sintomas orientam urgência.",
        rule: "Leucostase é clínica, não apenas contagem."
      },
      {
        id: "q7",
        domain: "Hemólise",
        prompt: "DAT positivo prova que toda anemia presente é autoimune?",
        options: ["Sim", "Não; precisa haver evidência de hemólise e correlação clínica", "Somente se IgG", "Somente se C3"],
        correct: 1,
        explanation: "DAT pode ser incidental ou relacionado a fármaco/transfusão sem explicar toda a anemia.",
        rule: "Teste positivo não equivale a causalidade."
      },
      {
        id: "q8",
        domain: "Hemofilia adquirida",
        prompt: "aPTT isolado prolongado, sangramento de partes moles e mistura sem correção após incubação sugerem:",
        options: ["PTI", "Deficiência de vitamina K", "Inibidor de fator VIII", "CIVD obrigatória"],
        correct: 2,
        explanation: "É o padrão clássico de hemofilia A adquirida.",
        rule: "Sangramento novo + aPTT isolado = pense em inibidor."
      },
      {
        id: "q9",
        domain: "Transfusão",
        prompt: "Primeiro passo diante de dispneia e febre durante transfusão:",
        options: ["Aumentar velocidade", "Parar a transfusão e avaliar ABC", "Dar antitérmico e reiniciar", "Esperar terminar a bolsa"],
        correct: 1,
        explanation: "Interromper, estabilizar, conferir identificação e comunicar hemoterapia precedem o rótulo.",
        rule: "PARE antes de classificar."
      },
      {
        id: "q10",
        domain: "Pseudo-MAT",
        prompt: "Qual combinação sugere deficiência grave de B12 mimetizando MAT?",
        options: ["Reticulócitos altos e VCM baixo", "LDH muito alta, macrocitose/citopenias e reticulócitos baixos", "ADAMTS13 <10%", "Fibrinogênio baixo isolado"],
        correct: 1,
        explanation: "A ineficiência medular produz LDH desproporcional e resposta reticulocitária inadequada.",
        rule: "Hemólise aparente com retic baixo pede revisão de produção."
      },
      {
        id: "q11",
        domain: "Febre neutropênica",
        prompt: "Qual atitude é mais perigosa em neutropenia febril instável?",
        options: ["Colher culturas sem atrasar", "Iniciar suporte", "Aguardar imagem completa antes do antimicrobiano", "Examinar cateter e períneo"],
        correct: 2,
        explanation: "O antimicrobiano empírico não deve esperar a conclusão da investigação.",
        rule: "Na neutropenia, ausência de exuberância inflamatória não reduz urgência."
      },
      {
        id: "q12",
        domain: "Falciforme",
        prompt: "Síndrome torácica aguda grave/progressiva pode exigir:",
        options: ["Ferro venoso", "Troca de hemácias conforme avaliação especializada", "Transfusão de plaquetas rotineira", "Espera até confirmação microbiológica"],
        correct: 1,
        explanation: "Troca manual ou automatizada é considerada na forma grave/progressiva, junto ao suporte.",
        rule: "Gravidade e progressão definem a estratégia transfusional."
      }
    ],

    flashcards: [
      { id: "f1", prompt: "Qual combinação mínima deve disparar o fluxo de PTT?", answer: "Trombocitopenia + anemia hemolítica microangiopática sem causa alternativa convincente. A pêntade não é necessária." },
      { id: "f2", prompt: "O ADAMTS13 deve ser colhido quando?", answer: "Antes da infusão/troca de plasma quando isso não atrasar o tratamento. Suspeita alta não deve esperar o resultado." },
      { id: "f3", prompt: "Qual achado diferencia CIVD de PTT com mais utilidade inicial?", answer: "Coagulograma de consumo: PT prolongando, D-dímero/FDP alto e fibrinogênio em queda favorecem CIVD; nenhum valor isolado é absoluto." },
      { id: "f4", prompt: "Hemofagocitose na medula é obrigatória para HLH/MAS?", answer: "Não. Pode faltar no início e pode aparecer em outras condições. Use o padrão clínico-laboratorial e a evolução." },
      { id: "f5", prompt: "Qual é a conduta que não espera confirmação molecular na suspeita forte de LPA?", answer: "Acionar o fluxo de LPA e iniciar ATRA conforme protocolo institucional, além de suporte hemostático intensivo." },
      { id: "f6", prompt: "Leucostase é definida por um valor fixo de leucócitos?", answer: "Não. É uma síndrome clínica, sobretudo pulmonar e neurológica, cujo risco varia com o subtipo de leucemia." },
      { id: "f7", prompt: "Qual ferramenta deve vir antes do anti-PF4 em suspeita de HIT?", answer: "Escore 4Ts com dados completos. Probabilidade baixa geralmente não deve ser testada." },
      { id: "f8", prompt: "aPTT isolado prolongado + sangramento novo + mistura sem correção sugere o quê?", answer: "Inibidor adquirido, especialmente hemofilia A adquirida; medir FVIII e inibidor Bethesda." },
      { id: "f9", prompt: "Qual é a primeira ação diante de qualquer reação transfusional suspeita?", answer: "Interromper a transfusão, manter acesso conforme protocolo, avaliar ABC, conferir identificação e avisar hemoterapia." },
      { id: "f10", prompt: "Fibrinogênio normal exclui CIVD?", answer: "Não. Pode estar normal ou alto no início por ser reagente de fase aguda; valorize tendência seriada." },
      { id: "f11", prompt: "Qual pista sugere pseudo-MAT por deficiência de B12?", answer: "LDH desproporcionalmente alta, macrocitose/neutropenia e reticulócitos inadequadamente baixos." },
      { id: "f12", prompt: "Na anemia hemolítica autoimune grave, incompatibilidade sorológica impede transfusão vital?", answer: "Não. A decisão é fisiológica; coordene com hemoterapia para a melhor unidade possível sem atrasar suporte vital." },
      { id: "f13", prompt: "Na síndrome torácica aguda falciforme grave ou progressiva, que modalidade transfusional costuma ser preferida?", answer: "Troca de hemácias manual ou automatizada, conforme disponibilidade e avaliação especializada." },
      { id: "f14", prompt: "Qual erro comum em febre neutropênica piora desfecho?", answer: "Atrasar antibiótico empírico amplo para completar exames ou esperar cultura." },
      { id: "f15", prompt: "PLASMIC alto confirma PTT?", answer: "Não. Estima probabilidade de ADAMTS13 gravemente reduzida; o diagnóstico integra clínica e ADAMTS13." },
      { id: "f16", prompt: "O que deve ser tratado em paralelo no HLH/MAS?", answer: "A hiperinflamação progressiva e o gatilho: infecção, malignidade, reumatologia ou predisposição genética." },
      { id: "f17", prompt: "Quais são os quatro domínios do 4Ts?", answer: "Thrombocytopenia, Timing, Thrombosis e oTher causes." },
      { id: "f18", prompt: "Qual faixa do 4Ts é baixa probabilidade?", answer: "0–3 pontos; em geral não se recomenda testar ou tratar rotineiramente, salvo incerteza importante nos dados." },
      { id: "f19", prompt: "Por que HIT pode ocorrer com plaquetas acima de 100 mil?", answer: "Porque a queda relativa >50% pode ser o sinal principal; HIT costuma ter nadir moderado e é protrombótica." },
      { id: "f20", prompt: "Qual é o limiar do ISTH para CIVD manifesta?", answer: "≥5 pontos em paciente com doença-gatilho compatível; deve ser repetido seriamente conforme a evolução." },
      { id: "f21", prompt: "Qual diferença prática entre score diagnóstico e classificatório?", answer: "O diagnóstico apoia decisão clínica; classificação foi desenhada para homogeneizar pesquisa e não deve ser usada isoladamente para diagnosticar." },
      { id: "f22", prompt: "Qual achado laboratorial pode enganar na hemólise por deficiência de G6PD?", answer: "A dosagem durante a crise pode ser falso-normal porque as hemácias mais deficientes já foram destruídas." },
      { id: "f23", prompt: "Por que reticulócitos baixos preocupam em hemólise?", answer: "Sugerem resposta medular inadequada: deficiência, crise aplástica, falência medular ou supressão/inflamação." },
      { id: "f24", prompt: "O que diferencia leucostase de hiperleucocitose assintomática?", answer: "Disfunção microvascular clínica, especialmente sintomas pulmonares ou neurológicos." },
      { id: "f25", prompt: "Qual risco acompanha a citorredução da leucostase?", answer: "Síndrome de lise tumoral; eletrólitos, ácido úrico, creatinina e balanço hídrico exigem monitorização." },
      { id: "f26", prompt: "Qual padrão de mistura favorece inibidor de fator VIII?", answer: "Falta de correção do aPTT, especialmente após incubação, no contexto de sangramento novo." },
      { id: "f27", prompt: "A transfusão de plaquetas é rotina na PTT?", answer: "Não. Em geral é evitada, salvo sangramento com ameaça à vida ou procedimento imprescindível, após discussão especializada." },
      { id: "f28", prompt: "Qual é o conceito de CIVD não manifesta?", answer: "Alterações iniciais/seriadas em paciente com gatilho, antes de atingir o limiar de CIVD manifesta; exige reavaliação." },
      { id: "f29", prompt: "O que significa uma hemocultura positiva em suspeita de HLH/MAS?", answer: "Pode identificar o gatilho, mas não exclui hiperinflamação coexistente; trate ambos conforme evolução." },
      { id: "f30", prompt: "Qual é o erro cognitivo de ancorar em 'plaquetopenia da sepse'?", answer: "Deixar de procurar HIT, MAT/PTT, CIVD, droga, hiperesplenismo, falência medular ou pseudoplaquetopenia." },
      { id: "f31", prompt: "O que deve ser registrado ao usar qualquer escore?", answer: "Momento, dados disponíveis/ausentes, pré-requisitos, finalidade, resultado e plano de reavaliação." },
      { id: "f32", prompt: "Qual regra encerra o sprint Turbo TEMI?", answer: "Explique em voz alta uma decisão, uma armadilha e um dado que faria você mudar de conduta." }
    ],

    cases: [
      {
        id: "c1",
        title: "Caso 1 — Plaquetas 14 mil + confusão",
        vignette: "Mulher de 36 anos, petéquias e confusão aguda. Hb 8,1 g/dL, plaquetas 14 mil, LDH muito alta, haptoglobina indetectável, esquizócitos, creatinina 1,3 mg/dL, PT normal.",
        options: [
          "Aguardar ADAMTS13 antes de iniciar qualquer tratamento",
          "Acionar plasmaférese/hematologia, colher ADAMTS13 e tratar PTT provável",
          "Transfundir plaquetas rotineiramente e observar",
          "Diagnosticar CIVD apenas pelo D-dímero"
        ],
        correct: 1,
        explanation: "O padrão é MAT com alta probabilidade de PTT. ADAMTS13 deve ser colhido antes do plasma quando possível, mas não deve atrasar o fluxo de emergência.",
        pearl: "Pegadinha TEMI: a pêntade clássica não é requisito."
      },
      {
        id: "c2",
        title: "Caso 2 — Febre, ferritina e falência orgânica",
        vignette: "Homem de 48 anos com febre persistente, esplenomegalia, pancitopenia, ferritina em rápida ascensão, triglicerídeos elevados, fibrinogênio baixo e hepatite. Culturas ainda em andamento.",
        options: [
          "Excluir HLH porque ainda não há hemofagocitose",
          "Esperar completar todos os critérios antes de discutir tratamento",
          "Investigar/tratar gatilhos e discutir imunomodulação precoce pela progressão",
          "Interpretar ferritina isoladamente como confirmação"
        ],
        correct: 2,
        explanation: "O padrão reconhecível e a disfunção orgânica justificam urgência. A avaliação de gatilhos e da hiperinflamação ocorre simultaneamente.",
        pearl: "HScore/HLH-2004 apoiam, mas não devem virar barreira em deterioração."
      },
      {
        id: "c3",
        title: "Caso 3 — Coagulopatia + promielócitos",
        vignette: "Paciente jovem com gengivorragia, plaquetas 22 mil, fibrinogênio baixo, D-dímero muito alto e promielócitos anormais no esfregaço.",
        options: [
          "Aguardar PML-RARA para iniciar o fluxo",
          "Fazer punção lombar imediatamente",
          "Acionar LPA, iniciar ATRA conforme protocolo e suporte hemostático",
          "Tratar como PTI isolada"
        ],
        correct: 2,
        explanation: "LPA é emergência hemorrágica. ATRA e suporte hemostático entram na suspeita forte; confirmação molecular segue em paralelo.",
        pearl: "Evite procedimentos invasivos desnecessários na coagulopatia."
      },
      {
        id: "c4",
        title: "Caso 4 — Plaquetas caem após heparina",
        vignette: "Paciente no 7º dia de heparina, queda de plaquetas de 230 para 92 mil e nova TVP. Sem causa alternativa forte.",
        options: [
          "HIT é improvável porque plaquetas estão acima de 50 mil",
          "Calcular 4Ts; se intermediário/alto, suspender heparina e seguir algoritmo",
          "Pedir PF4, manter heparina até o resultado",
          "Transfundir plaquetas preventivamente"
        ],
        correct: 1,
        explanation: "A queda relativa >50%, timing e trombose sustentam alta probabilidade. HIT é protrombótica e o nadir pode ser moderado.",
        pearl: "O percentual de queda importa mais que um limiar absoluto."
      },
      {
        id: "c5",
        title: "Caso 5 — Sangramento no puerpério",
        vignette: "Puérpera com grandes equimoses e sangramento muscular, sem história de sangramento prévio. PT normal, aPTT muito prolongado e mistura sem correção após incubação.",
        options: [
          "Hemofilia A adquirida; medir FVIII/inibidor e acionar especialista",
          "CIVD obrigatória",
          "Deficiência de vitamina K",
          "PTI isolada"
        ],
        correct: 0,
        explanation: "O padrão é clássico para inibidor adquirido de FVIII. Controlar sangramento e erradicar o inibidor são prioridades.",
        pearl: "Hemartrose é menos típica; tecidos moles e equimoses dominam."
      },
      {
        id: "c6",
        title: "Caso 6 — Dispneia durante transfusão",
        vignette: "Após 40 minutos de concentrado de hemácias, paciente apresenta dispneia, febre e hipotensão.",
        options: [
          "Aumentar a velocidade para concluir a bolsa",
          "Dar antitérmico e reiniciar sem avisar",
          "Parar transfusão, avaliar ABC, conferir identificação e acionar hemoterapia",
          "Diagnosticar TACO sem avaliação adicional"
        ],
        correct: 2,
        explanation: "As reações graves compartilham apresentação inicial. A sequência segura é parar, estabilizar, conferir e comunicar; depois diferenciar hemólise, sepse, TRALI, TACO e anafilaxia.",
        pearl: "O rótulo vem depois da interrupção e estabilização."
      },
      {
        id: "c7",
        title: "Caso 7 — Plaquetas 160 para 72 mil",
        vignette: "Paciente no 6º dia de heparina, queda de 55% das plaquetas, sem nadir extremo, com isquemia aguda do membro. Não há outra causa definida.",
        options: [
          "HIT é impossível porque plaquetas são >50 mil",
          "Aplicar 4Ts; alta probabilidade exige fluxo urgente de HIT",
          "Manter heparina e aguardar o nadir",
          "Pedir apenas D-dímero"
        ],
        correct: 1,
        explanation: "A queda relativa, o timing e a trombose são altamente sugestivos mesmo com nadir moderado.",
        pearl: "HIT é síndrome de imunotrombose, não de sangramento por plaquetopenia profunda."
      },
      {
        id: "c8",
        title: "Caso 8 — CIVD com fibrinogênio normal",
        vignette: "Paciente séptico piora com plaquetas em queda, PT prolongando e D-dímero fortemente elevado. Fibrinogênio é 310 mg/dL.",
        options: [
          "Excluir CIVD pelo fibrinogênio",
          "Interpretar tendência e aplicar escore no contexto do gatilho",
          "Diagnosticar PTT pelo fibrinogênio",
          "Tratar apenas o número do INR"
        ],
        correct: 1,
        explanation: "O fibrinogênio pode permanecer normal/alto no início; tendência e conjunto dos achados importam.",
        pearl: "CIVD é um processo dinâmico ligado à doença de base."
      },
      {
        id: "c9",
        title: "Caso 9 — Hiperleucocitose e hipoxemia",
        vignette: "Paciente com leucemia mieloide aguda, leucócitos 118 mil, confusão, dispneia e infiltrados bilaterais; eletrólitos ainda normais.",
        options: [
          "Esperar eletrólitos alterarem para considerar emergência",
          "Reconhecer leucostase clínica, acionar citorredução e prevenir lise",
          "Transfundir hemácias automaticamente",
          "Definir leucostase apenas pelo número"
        ],
        correct: 1,
        explanation: "Sintomas neuro/pulmonares definem a síndrome; prevenção de lise começa antes da alteração laboratorial.",
        pearl: "Citorredução e lise tumoral são dois lados do mesmo plantão."
      },
      {
        id: "c10",
        title: "Caso 10 — LDH extrema e reticulócitos baixos",
        vignette: "Idoso com Hb 6,8, plaquetas 58 mil, LDH muito alta, haptoglobina baixa, raros esquizócitos, VCM 112 fL e reticulócitos inadequadamente baixos.",
        options: [
          "PTT confirmada",
          "Pseudo-MAT por deficiência de B12 deve entrar no topo do diferencial",
          "HIT provável",
          "CIVD confirmada"
        ],
        correct: 1,
        explanation: "Macrocitose, múltiplas citopenias, LDH desproporcional e resposta reticulocitária baixa sugerem hematopoese ineficaz.",
        pearl: "Pseudo-MAT pode imitar PTT; a medula ineficaz deixa pistas."
      },
      {
        id: "c11",
        title: "Caso 11 — Neutropenia sem febre exuberante",
        vignette: "Paciente pós-quimioterapia, neutrófilos 80/mm³, temperatura 37,7 °C, hipotensão, confusão e dor abdominal.",
        options: [
          "Aguardar febre ≥38,3 °C",
          "Tratar como sepse neutropênica e iniciar fluxo antimicrobiano urgente",
          "Excluir infecção pela ausência de leucocitose",
          "Solicitar apenas ferritina"
        ],
        correct: 1,
        explanation: "Instabilidade em neutropenia profunda é emergência infecciosa mesmo sem febre exuberante.",
        pearl: "O sistema imune incapaz pode produzir sinais discretos diante de infecção grave."
      },
      {
        id: "c12",
        title: "Caso 12 — Hemólise e necessidade transfusional",
        vignette: "Paciente com AHAI quente, Hb 4,9 g/dL, angina e hipoxemia. Banco de sangue informa incompatibilidade ampla.",
        options: [
          "Proibir transfusão até compatibilidade perfeita",
          "Coordenar hemoterapia e transfundir a melhor unidade possível pelo risco vital",
          "Transfundir plaquetas",
          "Aguardar resposta ao corticoide por 48 horas"
        ],
        correct: 1,
        explanation: "A decisão é fisiológica; em anemia crítica, o risco de não transfundir pode superar o risco da incompatibilidade.",
        pearl: "O objetivo é ganhar oxigenação com vigilância e coordenação especializada."
      }
    ],

    references: [
      {
        id: "isth-ttp-2025",
        group: "PTT",
        year: "2025",
        title: "2025 focused update of the 2020 ISTH guidelines for management of TTP",
        note: "Mantém recomendações centrais para TPE, imunossupressão e caplacizumabe.",
        url: "https://pubmed.ncbi.nlm.nih.gov/40533296/"
      },
      {
        id: "isth-ttp-diagnosis",
        group: "PTT",
        year: "2020",
        title: "ISTH guidelines for the diagnosis of thrombotic thrombocytopenic purpura",
        note: "Probabilidade pré-teste, ADAMTS13 e estratégia de tratamento inicial.",
        url: "https://pubmed.ncbi.nlm.nih.gov/32914582/"
      },
      {
        id: "bsh-tma-2023",
        group: "MAT",
        year: "2023",
        title: "BSH guideline: diagnosis and management of TTP and thrombotic microangiopathies",
        note: "PTT, SHU mediada por complemento e outras MATs.",
        url: "https://pubmed.ncbi.nlm.nih.gov/37586700/"
      },
      {
        id: "eular-acr-hlh-2022",
        group: "HLH/MAS",
        year: "2022/2023",
        title: "EULAR/ACR points to consider for suspected HLH/MAS",
        note: "Reconhecimento precoce, gatilhos, tratamento e monitorização.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11017727/"
      },
      {
        id: "hscore-original",
        group: "HLH/MAS",
        year: "2014",
        title: "Development and validation of the HScore",
        note: "Ferramenta probabilística para síndrome hemofagocítica reativa.",
        url: "https://pubmed.ncbi.nlm.nih.gov/24782338/"
      },
      {
        id: "eln-apl",
        group: "Onco-hemato",
        year: "2019",
        title: "European LeukemiaNet: management of acute promyelocytic leukemia",
        note: "Diagnóstico, ATRA, coagulopatia e complicações.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30803991/"
      },
      {
        id: "hyperleukocytosis-review",
        group: "Onco-hemato",
        year: "2016",
        title: "Hyperleukocytosis and leukostasis: management of a medical emergency",
        note: "Citorredução, suporte e prevenção de lise tumoral.",
        url: "https://pubmed.ncbi.nlm.nih.gov/27967252/"
      },
      {
        id: "tls-consensus-2023",
        group: "Onco-hemato",
        year: "2023",
        title: "Expert consensus guidelines for tumor lysis syndrome",
        note: "Estratificação, profilaxia e manejo de SLT.",
        url: "https://pubmed.ncbi.nlm.nih.gov/37579533/"
      },
      {
        id: "ash-hit",
        group: "Coagulação",
        year: "2018 · rev. 2022",
        title: "ASH guideline: heparin-induced thrombocytopenia",
        note: "4Ts, estratégia de testes e anticoagulação não heparínica.",
        url: "https://www.hematology.org/education/clinicians/guidelines-and-quality-care/clinical-practice-guidelines/venous-thromboembolism-guidelines/heparin-induced-thrombocytopenia"
      },
      {
        id: "aha-consensus",
        group: "Coagulação",
        year: "2020",
        title: "International recommendations on acquired hemophilia A",
        note: "Diagnóstico, controle do sangramento e erradicação do inibidor.",
        url: "https://pubmed.ncbi.nlm.nih.gov/32381574/"
      },
      {
        id: "itp-consensus",
        group: "Plaquetas",
        year: "2019",
        title: "Updated international consensus report on primary ITP",
        note: "Investigação e manejo, incluindo sangramento de emergência.",
        url: "https://pubmed.ncbi.nlm.nih.gov/31770441/"
      },
      {
        id: "aiha-consensus",
        group: "Hemólise",
        year: "2020",
        title: "International consensus on autoimmune hemolytic anemia in adults",
        note: "Diagnóstico e tratamento de AHAI quente/fria.",
        url: "https://pubmed.ncbi.nlm.nih.gov/31839434/"
      },
      {
        id: "ash-scd-transfusion",
        group: "Falciforme",
        year: "2020",
        title: "ASH guideline: sickle cell disease transfusion support",
        note: "Troca de hemácias em síndrome torácica grave e hiper-hemólise.",
        url: "https://www.hematology.org/education/clinicians/guidelines-and-quality-care/clinical-practice-guidelines/sickle-cell-disease-guidelines/scd-guidelines-transfusion-support"
      },
      {
        id: "asco-idsa-neutropenia",
        group: "Infecção",
        year: "2018",
        title: "ASCO/IDSA guideline: outpatient management of fever and neutropenia",
        note: "Primeira dose empírica em até uma hora da triagem e estratificação.",
        url: "https://www.idsociety.org/practice-guideline/fever-and-neutropenia-in-adults-with-cancer/"
      },
      {
        id: "idsa-neutropenia",
        group: "Infecção",
        year: "2010/2011",
        title: "IDSA guideline: antimicrobial agents in neutropenic patients with cancer",
        note: "Terapia empírica imediata, ampla e orientada pelo risco.",
        url: "https://www.idsociety.org/practice-guideline/neutropenic-patients-with-cancer/"
      },
      {
        id: "bsh-transfusion-2023",
        group: "Hemoterapia",
        year: "2023",
        title: "BSH guideline on acute transfusion reactions",
        note: "Reconhecimento, investigação e manejo inicial.",
        url: "https://pubmed.ncbi.nlm.nih.gov/37211954/"
      },
      {
        id: "aabb-transfusion-2026",
        group: "Hemoterapia",
        year: "2026",
        title: "AABB Guide to the Laboratory Evaluation of Transfusion Reactions",
        note: "Interrupção, conferência e investigação laboratorial segura.",
        url: "https://marketplace.aabb.org/PRODUCTFILES/15699451/213030_pre.pdf"
      },
      {
        id: "isth-dic-2026",
        group: "CIVD",
        year: "2026",
        title: "ISTH SSC communication: global practice in DIC",
        note: "Prática global, diagnóstico e lacunas no manejo de CIVD.",
        url: "https://pubmed.ncbi.nlm.nih.gov/41655787/"
      },
      {
        id: "isth-dic-causes",
        group: "CIVD",
        year: "2020",
        title: "ISTH communication: underlying disorders of DIC",
        note: "Gatilhos infecciosos, malignos, obstétricos e de lesão tecidual.",
        url: "https://pubmed.ncbi.nlm.nih.gov/32881338/"
      },
      {
        id: "caps-review-2024",
        group: "SAF catastrófica",
        year: "2024",
        title: "Catastrophic antiphospholipid syndrome: a CAPS-tivating hematologic disease",
        note: "Reconhecimento, terapia combinada e opções para doença refratária.",
        url: "https://pubmed.ncbi.nlm.nih.gov/39644034/"
      },
      {
        id: "eular-aps-2019",
        group: "SAF",
        year: "2019",
        title: "EULAR recommendations for antiphospholipid syndrome in adults",
        note: "Prevenção, anticoagulação e manejo de manifestações da SAF.",
        url: "https://pubmed.ncbi.nlm.nih.gov/31092409/"
      }
    ]
  };

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.keys(value).forEach(function (key) {
      deepFreeze(value[key]);
    });
    return value;
  }

  window.ANTIGRAVITY_HEMATOLOGY = deepFreeze(catalog);
  window.ANTIGRAVITY_CRITICAL_MODULE = window.ANTIGRAVITY_HEMATOLOGY;
  document.dispatchEvent(new CustomEvent("antigravity:hematology-ready", {
    detail: window.ANTIGRAVITY_HEMATOLOGY
  }));
})();
