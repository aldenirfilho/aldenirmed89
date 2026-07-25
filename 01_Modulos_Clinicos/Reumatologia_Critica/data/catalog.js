(function () {
  "use strict";

  const catalog = {
    meta: {
      schemaVersion: "1.0.0",
      moduleVersion: "1.0.0-rc.1",
      updatedAt: "2026-07-25",
      status: "em-revisao-medica",
      title: "Reumatologia Crítica — Emergências & Diagnósticos Difíceis",
      storagePrefix: "reuma",
      sprintSeconds: 720,
      specialistGate: "adaptar ao protocolo institucional e confirmar com Reumatologia, Nefrologia, Pneumologia, Hematologia e Infectologia conforme o órgão."
    },

    categories: [
      { id: "all", label: "Todos" },
      { id: "vasculite", label: "Vasculites" },
      { id: "lupus", label: "LES / conectivites" },
      { id: "trombose", label: "Trombose / TMA" },
      { id: "hiperinflamacao", label: "Hiperinflamação" },
      { id: "intersticio", label: "Pulmão / músculo" },
      { id: "via-aerea", label: "Via aérea / estrutura" }
    ],

    diagnosticTracks: [
      {
        id: "pulmonary-renal",
        icon: "🫁",
        title: "Hemorragia alveolar + glomerulonefrite",
        subtitle: "AAV, anti-GBM, LES, crioglobulinemia, infecção e toxicidade podem convergir.",
        priority: [
          "Estabilize oxigenação/ventilação e reconheça hemorragia alveolar mesmo sem hemoptise.",
          "Colha urina com sedimento, função renal, hemograma/coagulação e sorologias antes da imunossupressão quando possível.",
          "Acione UTI, Nefrologia, Pneumologia e Reumatologia; biópsia renal costuma oferecer alto rendimento."
        ],
        collect: [
          "EAS, relação proteína/creatinina, creatinina seriada, ANCA PR3/MPO, anti-GBM, ANA/dsDNA/complemento.",
          "TC de tórax, broncoscopia quando segura e útil; culturas e investigação infecciosa dirigida.",
          "Revisão de fármacos, anticoagulação, cocaína/levamisol e sinais de endocardite."
        ],
        avoid: "Não use ANCA isolado como diagnóstico; endocardite e infecção podem produzir ANCA e glomerulonefrite.",
        related: ["aav-pulmonary-renal", "anti-gbm", "sle-dah", "severe-cryoglobulinemia"]
      },
      {
        id: "aki-maha-hypertension",
        icon: "🫘",
        title: "IRA + hipertensão + hemólise microangiopática",
        subtitle: "Crise renal esclerodérmica, TTP, SHU complemento, hipertensão maligna e TMA do LES.",
        priority: [
          "Trate emergência hipertensiva e disfunção orgânica sem esperar etiologia completa.",
          "Se esclerose sistêmica e crise renal forem plausíveis, acione imediatamente o fluxo de IECA.",
          "Mantenha PTT no radar: colha ADAMTS13 e organize plasmaférese se a probabilidade for alta."
        ],
        collect: [
          "PA seriada, creatinina, EAS, proteinúria, esfregaço, LDH, haptoglobina, plaquetas e coagulação.",
          "ADAMTS13, complemento, ANA/dsDNA e revisão de exposição a glicocorticoide/ciclosporina.",
          "Fundo de olho, ECG/troponina e avaliação neurológica conforme fenótipo."
        ],
        avoid: "Esquizócitos não significam automaticamente PTT; na crise renal esclerodérmica a hipertensão e o contexto cutâneo/vascular são decisivos.",
        related: ["scleroderma-renal-crisis", "caps", "lupus-nephritis-rpgn"]
      },
      {
        id: "fever-ferritin",
        icon: "🔥",
        title: "Febre + ferritina + citopenias/falência",
        subtitle: "MAS/HLH, sepse, Still, LES, linfoma e infecção oportunista podem coexistir.",
        priority: [
          "Avalie falência orgânica e necessidade de UTI.",
          "Investigue e trate gatilhos infecciosos, malignos e reumatológicos em paralelo.",
          "Se a hiperinflamação progride, discuta imunomodulação antes de todos os critérios estarem completos."
        ],
        collect: [
          "Ferritina em tendência, hemograma, AST/ALT, LDH, triglicerídeos, fibrinogênio e coagulação.",
          "Culturas, imagem, EBV/CMV e investigação de malignidade conforme contexto.",
          "Esplenomegalia, exame neurológico, medula e marcadores especializados quando indicados."
        ],
        avoid: "MAS-2016 foi validado em AIJ sistêmica; não transforme esse classificador em teste diagnóstico universal do adulto.",
        related: ["mas-hlh", "adult-still-mas", "sle-neuro"]
      },
      {
        id: "thrombosis-multiorgan",
        icon: "🧨",
        title: "Tromboses múltiplas + disfunção multiorgânica",
        subtitle: "SAF catastrófica compete com sepse/CIVD, HIT, TTP, neoplasia e endocardite.",
        priority: [
          "Mapeie rapidamente órgãos, micro/macro-tromboses, sangramento e precipitantes.",
          "Acione equipe multidisciplinar e trate infecção/gatilho em paralelo.",
          "A terapia combinada de CAPS exige coordenação de anticoagulação, imunomodulação e plasma/IVIG."
        ],
        collect: [
          "Hemograma, hemólise, coagulação, função renal/hepática, troponina e imagem orientada por órgão.",
          "Lúpus anticoagulante, anticardiolipina e anti-β2GPI, interpretando interferência de anticoagulantes.",
          "Culturas, revisão de cirurgia, suspensão de anticoagulação, gravidez/puerpério e malignidade."
        ],
        avoid: "Plaquetopenia e PT/aPTT alterados não excluem trombose; também não anticoagule no piloto automático se hemorragia ativa domina.",
        related: ["caps", "scleroderma-renal-crisis", "sle-dah"]
      },
      {
        id: "rapid-ild",
        icon: "🌫️",
        title: "Hipoxemia + DPI rapidamente progressiva",
        subtitle: "Anti-MDA5/dermatomiosite, síndrome antissintetase, ES, infecção e toxicidade medicamentosa.",
        priority: [
          "Defina gravidade respiratória e necessidade de suporte/UTI.",
          "Colete microbiologia e revise imunossupressão antes de escalar terapia quando possível.",
          "Procure fenótipo de miosite mesmo com CK normal: pele, mãos de mecânico, artrite e fraqueza."
        ],
        collect: [
          "TCAR, gasometria, hemograma, CK/aldolase, ferritina e painel de miosite conforme acesso.",
          "Culturas/PCR e broncoscopia se segura e capaz de mudar decisão.",
          "ECG/troponina/eco se suspeita de miocardite associada."
        ],
        avoid: "CK normal não exclui dermatomiosite anti-MDA5; infecção oportunista pode ser indistinguível radiologicamente.",
        related: ["mda5-rpild", "myositis-crisis", "sle-dah"]
      },
      {
        id: "visual-headache",
        icon: "👁️",
        title: "Cefaleia nova + isquemia visual em ≥50 anos",
        subtitle: "Arterite de células gigantes é emergência ocular; mimetizadores não devem atrasar proteção da visão.",
        priority: [
          "Trate suspeita alta com ameaça visual conforme fluxo de GCA; não espere biópsia ou imagem.",
          "Acione Oftalmologia/Reumatologia e documente sintomas do outro olho.",
          "Organize ultrassom temporal/axilar e/ou biópsia sem suspender tratamento necessário."
        ],
        collect: [
          "VHS, PCR, hemograma/plaquetas e exame ocular completo.",
          "Claudicação mandibular/lingual, dor temporal, polimialgia e sinais de grandes vasos.",
          "Imagem vascular conforme expertise local."
        ],
        avoid: "Critérios classificatórios ACR/EULAR 2022 não foram feitos para excluir GCA em paciente individual.",
        related: ["gca-visual", "takayasu-critical"]
      },
      {
        id: "neuropathy-skin-gi",
        icon: "🦵",
        title: "Mononeurite + pele + dor abdominal/isquemia",
        subtitle: "PAN, AAV, crioglobulinemia, colesterol, infecção e embolia podem parecer iguais.",
        priority: [
          "Mapeie déficit motor agudo, dor neuropática, isquemia visceral e pressão arterial.",
          "Procure órgão ameaçado e envolvimento renal/pulmonar que reclassifique o fenótipo.",
          "Escolha o tecido acessível com maior rendimento para biópsia."
        ],
        collect: [
          "EAS, creatinina, ANCA, complemento, crioglobulinas, HBV/HCV/HIV.",
          "AngioTC abdominal se isquemia/aneurisma; eletroneuromiografia e biópsia dirigida.",
          "Hemoculturas e avaliação de endocardite quando plausível."
        ],
        avoid: "PAN clássica não causa glomerulonefrite pauci-imune nem hemorragia alveolar; esses achados puxam para outro mecanismo.",
        related: ["pan-mesenteric", "severe-cryoglobulinemia", "aav-pulmonary-renal"]
      },
      {
        id: "airway-cervical",
        icon: "🫁",
        title: "Estridor/disfonia ou instabilidade cervical",
        subtitle: "Policondrite, artrite cricoaritenoide da AR e subluxação C1–C2 podem tornar intubação perigosa.",
        priority: [
          "Acione via aérea difícil, anestesia e otorrino precocemente.",
          "Minimize manipulação cervical até excluir instabilidade atlantoaxial.",
          "Planeje broncoscopia/TC e estratégia de resgate conforme estabilidade."
        ],
        collect: [
          "Nasofibroscopia, TC dinâmica quando indicada e avaliação de cartilagem/estenose.",
          "Radiografia/TC/RM cervical conforme déficit e urgência.",
          "História de AR, policondrite, intubação prévia e imunossupressão/infeção."
        ],
        avoid: "Não induza anestesia geral sem plano para colapso de via aérea ou instabilidade cervical.",
        related: ["relapsing-polychondritis-airway", "ra-airway-cervical"]
      }
    ],

    emergencies: [
      {
        id: "aav-pulmonary-renal",
        title: "AAV com síndrome pulmão–rim",
        icon: "🫁",
        category: "vasculite",
        urgency: "Agora",
        summary: "Hemorragia alveolar e glomerulonefrite rapidamente progressiva por GPA/MPA/EGPA.",
        trigger: "Hipoxemia/infiltrado + queda de Hb ou lavado hemorrágico + sedimento glomerular/IRA.",
        tags: ["ANCA", "PR3", "MPO", "DAH", "RPGN"],
        firstHour: [
          "Suporte respiratório e renal; acionar UTI, Nefro, Pneumo e Reumato.",
          "Colher ANCA PR3/MPO, anti-GBM, urina, complemento e microbiologia sem atrasar proteção de órgão.",
          "Discutir indução urgente e papel seletivo de plasmaférese conforme gravidade, anti-GBM e protocolo."
        ],
        decisive: [
          "Sedimento urinário/proteinúria, creatinina seriada e biópsia renal.",
          "TC tórax e broncoscopia quando segura/útil.",
          "Hemoculturas e investigação de endocardite/infecção antes ou em paralelo."
        ],
        doNot: [
          "Não diagnosticar AAV apenas por ANCA positivo.",
          "Não atrasar tratamento de órgão ameaçado aguardando biópsia impossível."
        ],
        pearl: "Hemoptise pode faltar na hemorragia alveolar; queda de Hb e hipoxemia com infiltrado difuso são pistas.",
        referenceIds: ["eular-aav-2022", "kdigo-aav-2024"]
      },
      {
        id: "anti-gbm",
        title: "Doença anti-MBG",
        icon: "🎯",
        category: "vasculite",
        urgency: "Agora",
        summary: "Glomerulonefrite rapidamente progressiva ± hemorragia alveolar por anticorpo anti-membrana basal.",
        trigger: "Síndrome pulmão–rim com anti-GBM ou forte suspeita clínica.",
        tags: ["anti-GBM", "Goodpasture", "RPGN", "plasmaférese"],
        firstHour: [
          "Colher anti-GBM e ANCA; dupla positividade muda prognóstico/seguimento.",
          "Acionar Nefrologia e Hemoterapia para estratégia urgente de plasmaférese + imunossupressão conforme protocolo.",
          "Proteger pulmão/rim e evitar tabagismo/exposição pulmonar."
        ],
        decisive: [
          "Biópsia renal com padrão linear quando possível.",
          "Creatinina, diurese, sedimento e extensão da hemorragia alveolar.",
          "ANCA concomitante e investigação infecciosa."
        ],
        doNot: [
          "Não esperar biópsia se o quadro fulminante e a probabilidade forem altas.",
          "Não confundir o classificador de AAV com diagnóstico de anti-GBM."
        ],
        pearl: "Anti-GBM e ANCA podem coexistir; pense em comportamento agudo de anti-GBM e risco de recaída de AAV.",
        referenceIds: ["kdigo-gn-2021", "kdigo-aav-2024"]
      },
      {
        id: "caps",
        title: "SAF catastrófica",
        icon: "🧨",
        category: "trombose",
        urgency: "Agora",
        summary: "Trombose micro/macrovascular rapidamente progressiva em múltiplos órgãos, frequentemente precipitada.",
        trigger: "Disfunção de ≥3 órgãos em dias + trombose/APS, após considerar sepse, CIVD, HIT e TMA.",
        tags: ["CAPS", "aPL", "trombose", "TMA"],
        firstHour: [
          "Acionar UTI, Hematologia e Reumatologia; mapear trombose e sangramento.",
          "Tratar gatilho, sobretudo infecção e interrupção de anticoagulação.",
          "Discutir terapia combinada com heparina, glicocorticoide e plasmaférese ou IVIG conforme EULAR/protocolo."
        ],
        decisive: [
          "aPL completo com interpretação técnica durante anticoagulação.",
          "Hemólise, plaquetas, coagulação, rim, coração, SNC e imagem dirigida.",
          "Histologia de microtrombose quando segura e capaz de ajudar."
        ],
        doNot: [
          "Não aguardar persistência laboratorial de 12 semanas para tratar emergência compatível.",
          "Não reduzir tudo a CIVD sem mapear trombose e APS."
        ],
        pearl: "CAPS é diagnóstico clínico-temporal; a confirmação de APS e a terapia ocorrem em trilhas paralelas.",
        referenceIds: ["eular-aps-2019", "acr-eular-aps-2023"]
      },
      {
        id: "gca-visual",
        title: "GCA com ameaça visual",
        icon: "👁️",
        category: "vasculite",
        urgency: "Agora",
        summary: "Isquemia ocular por arterite de células gigantes pode tornar-se bilateral e irreversível.",
        trigger: "≥50 anos + perda visual/amaurose/diplopia, claudicação mandibular ou cefaleia temporal nova.",
        tags: ["GCA", "arterite temporal", "visão", "halo"],
        firstHour: [
          "Iniciar o fluxo de glicocorticoide para ameaça visual sem esperar teste confirmatório.",
          "Acionar Oftalmologia e Reumatologia; documentar acuidade/campo e sintomas contralaterais.",
          "Organizar ultrassom temporal/axilar e/ou biópsia rapidamente."
        ],
        decisive: [
          "Exame oftalmológico, VHS/PCR e plaquetas.",
          "Ultrassom com halo por operador experiente.",
          "Biópsia temporal ou imagem de grandes vasos conforme fenótipo."
        ],
        doNot: [
          "Não usar VHS/PCR normais isoladamente para excluir.",
          "Não aguardar biópsia para proteger visão."
        ],
        pearl: "O tratamento imediato protege sobretudo o outro olho; a visão já perdida pode não recuperar.",
        referenceIds: ["acr-eular-gca-2022", "eular-lvv-imaging-2023"]
      },
      {
        id: "scleroderma-renal-crisis",
        title: "Crise renal esclerodérmica",
        icon: "🫘",
        category: "trombose",
        urgency: "Agora",
        summary: "IRA e hipertensão acelerada em esclerose sistêmica, às vezes com TMA.",
        trigger: "ES difusa precoce + PA nova/elevada, creatinina crescente, cefaleia/edema pulmonar ± MAHA.",
        tags: ["esclerose sistêmica", "IECA", "hipertensão", "TMA"],
        firstHour: [
          "Iniciar/titular IECA prontamente segundo protocolo, com monitorização estreita.",
          "Tratar emergência hipertensiva e complicações; acionar Nefrologia/Reumatologia.",
          "Revisar exposição recente a altas doses de glicocorticoide."
        ],
        decisive: [
          "PA seriada, creatinina/diurese, EAS/proteinúria e hemólise.",
          "Fundo de olho, ECG/troponina e avaliação de edema pulmonar.",
          "ADAMTS13 se PTT permanece plausível."
        ],
        doNot: [
          "Não suspender IECA apenas por elevação inicial esperada de creatinina sem discussão especializada.",
          "Não usar glicocorticoide em altas doses por reflexo na ES."
        ],
        pearl: "A crise pode ser normotensiva em relação a valores populacionais; compare com a PA basal.",
        referenceIds: ["eular-ssc-2023", "acr-sard-ild-2023"]
      },
      {
        id: "mas-hlh",
        title: "MAS / HLH reumatológico",
        icon: "🔥",
        category: "hiperinflamacao",
        urgency: "Agora",
        summary: "Hiperinflamação rapidamente progressiva associada a Still, LES, infecção, malignidade ou terapia.",
        trigger: "Febre persistente + ferritina crescente + citopenias/hepatite/coagulopatia/falência.",
        tags: ["MAS", "HLH", "ferritina", "Still"],
        firstHour: [
          "Suporte de órgão e investigação sistemática de gatilhos.",
          "Monitorar ferritina, plaquetas, AST, fibrinogênio e triglicerídeos em série.",
          "Discutir imunomodulação precoce se progressão, sem esperar critérios completos."
        ],
        decisive: [
          "Culturas, EBV/CMV e imagem/medula conforme contexto.",
          "HScore/HLH-2004 como apoio; MAS-2016 apenas no contexto correto.",
          "Revisão de doença reumatológica, malignidade e fármacos."
        ],
        doNot: [
          "Não usar ferritina isolada como diagnóstico.",
          "Não excluir MAS porque existe infecção."
        ],
        pearl: "Queda de plaquetas/fibrinogênio e subida rápida de ferritina/AST podem ser mais úteis que um corte isolado.",
        referenceIds: ["eular-acr-hlh-2022", "mas-2016"]
      },
      {
        id: "sle-dah",
        title: "LES com hemorragia alveolar",
        icon: "🫁",
        category: "lupus",
        urgency: "Agora",
        summary: "Complicação rara e grave, frequentemente associada a nefrite/atividade sistêmica.",
        trigger: "LES/suspeita + hipoxemia, infiltrado difuso e queda de Hb, com ou sem hemoptise.",
        tags: ["LES", "DAH", "hemorragia alveolar", "nefrite"],
        firstHour: [
          "Suporte respiratório e UTI; interromper/reverter anticoagulação se apropriado.",
          "Investigar infecção agressivamente e colher dados de atividade do LES.",
          "Discutir imunossupressão de ameaça à vida com equipe multidisciplinar."
        ],
        decisive: [
          "TC, broncoscopia/lavado quando segura e microbiologia.",
          "Hemograma seriado, coagulação, complemento/dsDNA e urina.",
          "Avaliação para SAF/CAPS e TMA."
        ],
        doNot: [
          "Não assumir flare sem cobrir infecção plausível.",
          "Não exigir hemoptise para reconhecer."
        ],
        pearl: "LES grave pode combinar hemorragia alveolar, nefrite, TMA e infecção no mesmo episódio.",
        referenceIds: ["eular-sle-2023", "acr-ln-2024"]
      },
      {
        id: "lupus-nephritis-rpgn",
        title: "Nefrite lúpica grave / RPGN",
        icon: "🧪",
        category: "lupus",
        urgency: "Urgente",
        summary: "Deterioração renal rápida, sedimento ativo e proteinúria por nefrite proliferativa ou TMA associada.",
        trigger: "LES/suspeita + creatinina crescente, cilindros hemáticos, proteinúria e complemento baixo.",
        tags: ["nefrite lúpica", "RPGN", "biópsia renal", "TMA"],
        firstHour: [
          "Acionar Nefrologia/Reumatologia e organizar biópsia renal rapidamente.",
          "Controlar PA, volume, potássio e indicações dialíticas.",
          "Investigar infecção e TMA/SAF que modifiquem a estratégia."
        ],
        decisive: [
          "EAS, sedimento, UPCR, creatinina e complemento/dsDNA.",
          "Biópsia renal para classe, atividade, cronicidade e TMA.",
          "Hemólise, plaquetas e aPL quando apropriado."
        ],
        doNot: [
          "Não graduar gravidade apenas pela proteinúria.",
          "Não atrasar suporte renal enquanto organiza imunossupressão."
        ],
        pearl: "A biópsia responde mecanismo e prognóstico; creatinina/proteinúria sozinhas não distinguem atividade de dano crônico.",
        referenceIds: ["acr-ln-2024", "kdigo-ln-2024"]
      },
      {
        id: "sle-neuro",
        title: "LES neuropsiquiátrico grave",
        icon: "🧠",
        category: "lupus",
        urgency: "Agora",
        summary: "Convulsão, psicose, mielite, encefalopatia ou AVC exigem atribuição mecanística cuidadosa.",
        trigger: "Manifestação neurológica aguda em LES/suspeita após considerar infecção, metabólico, droga e trombose.",
        tags: ["NPSLE", "mielite", "convulsão", "SAF"],
        firstHour: [
          "ABC, tratar convulsão/AVC e corrigir causas metabólicas.",
          "Investigar infecção do SNC antes/em paralelo à imunossupressão.",
          "Separar fenótipo inflamatório de trombótico/aPL para orientar estratégia."
        ],
        decisive: [
          "RM encéfalo/medula, LCR quando seguro, EEG conforme manifestação.",
          "aPL, atividade do LES e avaliação vascular.",
          "Revisão de fármacos, PA, eletrólitos e infecção."
        ],
        doNot: [
          "Não atribuir todo sintoma neuro ao LES.",
          "Não usar autoanticorpo isolado como prova de causalidade."
        ],
        pearl: "A pergunta crítica não é apenas 'é LES?', mas 'é inflamatório, trombótico, infeccioso ou metabólico?'.",
        referenceIds: ["eular-sle-2023", "acr-eular-aps-2023"]
      },
      {
        id: "sle-cardiac",
        title: "Miocardite / tamponamento no LES",
        icon: "🫀",
        category: "lupus",
        urgency: "Agora",
        summary: "Inflamação cardíaca grave pode causar choque, arritmia ou derrame pericárdico com tamponamento.",
        trigger: "LES/suspeita + choque, dor, arritmia, troponina/BNP elevados ou derrame com sinais de tamponamento.",
        tags: ["miocardite", "pericardite", "tamponamento", "choque"],
        firstHour: [
          "POCUS/eco e suporte hemodinâmico; acionar Cardio/UTI.",
          "Drenar tamponamento conforme emergência e investigar infecção.",
          "Discutir imunossupressão após separar isquemia, miocardite viral, sepse e CAPS."
        ],
        decisive: [
          "ECG, troponina, BNP, eco e RM cardíaca quando estável.",
          "Culturas/microbiologia e atividade do LES.",
          "Coronárias/embolia conforme fenótipo."
        ],
        doNot: [
          "Não chamar todo aumento de troponina de miocardite.",
          "Não atrasar drenagem de tamponamento por investigação etiológica."
        ],
        pearl: "No choque do LES, inflamação, trombose, infecção e tamponamento podem coexistir.",
        referenceIds: ["eular-sle-2023"]
      },
      {
        id: "mda5-rpild",
        title: "Dermatomiosite anti-MDA5 com DPI-RP",
        icon: "🌫️",
        category: "intersticio",
        urgency: "Agora",
        summary: "Doença intersticial rapidamente progressiva, às vezes com pouca fraqueza e CK normal.",
        trigger: "Hipoxemia/TCAR progressiva + lesões cutâneas, artrite, mãos de mecânico ou fenótipo amiopático.",
        tags: ["anti-MDA5", "DPI-RP", "dermatomiosite", "ferritina"],
        firstHour: [
          "UTI/Pneumo/Reumato; quantificar progressão e necessidade de suporte.",
          "Investigar infecção oportunista e coletar painel de miosite/ferritina.",
          "Discutir imunossupressão combinada precoce conforme protocolo especializado."
        ],
        decisive: [
          "TCAR seriada, oxigenação e culturas/PCR.",
          "Anti-MDA5 e outros autoanticorpos de miosite.",
          "Pele/unhas, força, CK/aldolase e avaliação cardíaca."
        ],
        doNot: [
          "Não excluir miosite por CK normal.",
          "Não escalar imunossupressão sem reavaliar infecção."
        ],
        pearl: "No anti-MDA5, o pulmão pode ser a manifestação dominante e a ferritina pode acompanhar gravidade.",
        referenceIds: ["acr-sard-ild-2023", "ers-eular-ctd-ild-2025"]
      },
      {
        id: "myositis-crisis",
        title: "Crise de miopatia inflamatória",
        icon: "💪",
        category: "intersticio",
        urgency: "Agora",
        summary: "Fraqueza bulbar/respiratória, rabdomiólise, miocardite ou DPI ameaçam a vida.",
        trigger: "Fraqueza proximal aguda/subaguda + disfagia, hipoventilação, CK alta ou lesão cardíaca.",
        tags: ["miosite", "IMNM", "disfagia", "miocardite"],
        firstHour: [
          "Medir função respiratória/força bulbar e proteger via aérea.",
          "Monitorar potássio, rim, CK, urina e coração.",
          "Excluir tóxico, metabólico, infeccioso e miastenia antes de rotular."
        ],
        decisive: [
          "CK/aldolase, eletrólitos, TSH, troponina/ECG/eco.",
          "RM muscular, ENMG e biópsia quando mudam decisão.",
          "Anticorpos específicos: anti-SRP/HMGCR, antissintetase e outros."
        ],
        doNot: [
          "Não confiar apenas em CK para gravidade respiratória.",
          "Não confundir miopatia do crítico/esteroide com inflamação ativa sem evidência."
        ],
        pearl: "Disfagia e fraqueza respiratória são marcadores de gravidade mesmo quando CK começa a cair.",
        referenceIds: ["acr-sard-ild-2023", "eular-iim-2017"]
      },
      {
        id: "pan-mesenteric",
        title: "PAN com isquemia mesentérica/aneurisma",
        icon: "🩻",
        category: "vasculite",
        urgency: "Agora",
        summary: "Vasculite de médio vaso pode causar isquemia intestinal, aneurismas, neuropatia e hipertensão renovascular.",
        trigger: "Dor abdominal intensa/desproporcional + neuropatia/livedo/hipertensão sem glomerulonefrite.",
        tags: ["PAN", "isquemia mesentérica", "HBV", "aneurisma"],
        firstHour: [
          "Avaliação cirúrgica/vascular e angioTC urgente se isquemia.",
          "Rastrear HBV e outros gatilhos antes da estratégia imunossupressora.",
          "Tratar choque, perfuração e isquemia; acionar Reumato/Infecto."
        ],
        decisive: [
          "AngioTC/angiografia para microaneurismas/estenoses.",
          "HBsAg, anti-HBc, HBV-DNA; HCV/HIV.",
          "Biópsia de pele/nervo/músculo acessível."
        ],
        doNot: [
          "Não chamar de PAN se há GN pauci-imune ou hemorragia alveolar.",
          "Não atrasar cirurgia por tentativa de fechar autoanticorpo."
        ],
        pearl: "PAN poupa glomérulos/capilares; a urina pode mostrar isquemia, mas não o sedimento glomerular típico de AAV.",
        referenceIds: ["acr-vf-pan-2021", "eular-aav-2022"]
      },
      {
        id: "severe-cryoglobulinemia",
        title: "Vasculite crioglobulinêmica grave",
        icon: "❄️",
        category: "vasculite",
        urgency: "Urgente",
        summary: "Complexos imunes podem causar GN, neuropatia, isquemia, hiperviscosidade e hemorragia alveolar.",
        trigger: "Púrpura/neuropatia/GN + C4 baixo/RF alto, HCV ou doença linfoproliferativa.",
        tags: ["crioglobulina", "C4", "HCV", "complexo imune"],
        firstHour: [
          "Proteger órgão e tratar gatilho infeccioso/linfoproliferativo.",
          "Garantir coleta/transporte aquecido da crioglobulina.",
          "Discutir rituximabe, glicocorticoide e plasmaférese nos fenótipos fulminantes conforme protocolo."
        ],
        decisive: [
          "Crioglobulina, C4/C3, fator reumatoide e HCV-RNA.",
          "EAS/proteinúria, biópsia renal/pele e avaliação neurológica.",
          "HBV antes de rituximabe e investigação de clone B."
        ],
        doNot: [
          "Não excluir por crioglobulina negativa com coleta inadequada.",
          "Não imunossuprimir sem investigar HCV/HBV e infecção."
        ],
        pearl: "O pré-analítico é parte do diagnóstico: tubo que esfria cedo pode produzir falso-negativo.",
        referenceIds: ["eular-cryo-2009", "kdigo-gn-2021"]
      },
      {
        id: "behcet-pulmonary-artery",
        title: "Behçet com aneurisma de artéria pulmonar",
        icon: "🫀",
        category: "vasculite",
        urgency: "Agora",
        summary: "Hemoptise, aneurisma e trombose in situ criam alto risco hemorrágico.",
        trigger: "Behçet/fenótipo mucocutâneo + hemoptise ou lesão arterial pulmonar.",
        tags: ["Behçet", "aneurisma pulmonar", "hemoptise", "trombose"],
        firstHour: [
          "UTI, angioTC e discussão conjunta Reumato/Pneumo/Vascular.",
          "Controlar hemorragia e inflamação vascular conforme protocolo.",
          "Individualizar anticoagulação após excluir aneurisma pulmonar ativo."
        ],
        decisive: [
          "AngioTC de tórax e mapeamento vascular.",
          "Broncoscopia apenas quando segura e útil.",
          "Pesquisa de infecção e outros aneurismas/tromboses."
        ],
        doNot: [
          "Não anticoagular hemoptise/trombose automaticamente antes de avaliar aneurisma.",
          "Não tratar trombo isoladamente sem controlar vasculite."
        ],
        pearl: "Em Behçet, trombose venosa é inflamatória e aderida; aneurisma pulmonar muda radicalmente o risco da anticoagulação.",
        referenceIds: ["eular-behcet-2018"]
      },
      {
        id: "relapsing-polychondritis-airway",
        title: "Policondrite com via aérea crítica",
        icon: "🫁",
        category: "via-aerea",
        urgency: "Agora",
        summary: "Inflamação/colapso traqueobrônquico pode piorar abruptamente com sedação ou intubação.",
        trigger: "Estridor, tosse, disfonia ou dispneia em policondrite/condrite auricular-nasal.",
        tags: ["policondrite", "traqueomalácia", "estridor", "via aérea"],
        firstHour: [
          "Acionar anestesia/otorrino/pneumo e preparar via aérea difícil.",
          "Evitar sedação não planejada; manter estratégia de resgate.",
          "Avaliar necessidade de broncoscopia, stent ou traqueostomia com equipe experiente."
        ],
        decisive: [
          "TC inspiratória/expiratória e broncoscopia quando segura.",
          "Nasofibroscopia e avaliação de cartilagem laríngea.",
          "Excluir infecção, estenose pós-intubação e GPA."
        ],
        doNot: [
          "Não induzir anestesia sem plano para colapso dinâmico.",
          "Não interpretar espirometria normal fora da crise como segurança absoluta."
        ],
        pearl: "O problema pode ser dinâmico: a via aérea colapsa na expiração e piora com perda de tônus.",
        referenceIds: ["relapsing-polychondritis-review"]
      },
      {
        id: "ra-airway-cervical",
        title: "AR: cricoaritenoide / coluna cervical",
        icon: "🦴",
        category: "via-aerea",
        urgency: "Agora",
        summary: "Artrite cricoaritenoide e instabilidade atlantoaxial tornam intubação e manipulação cervical perigosas.",
        trigger: "AR + disfonia/estridor, dor cervical, sinais medulares ou necessidade de intubação.",
        tags: ["AR", "C1-C2", "cricoaritenoide", "intubação"],
        firstHour: [
          "Imobilizar/manipular minimamente coluna se instabilidade plausível.",
          "Planejar intubação com anestesia/otorrino e estratégia acordada.",
          "Tratar compressão medular/via aérea como emergência estrutural."
        ],
        decisive: [
          "Nasofibroscopia e exame de cordas vocais.",
          "TC/RM cervical e imagem dinâmica quando apropriado.",
          "Exame neurológico completo."
        ],
        doNot: [
          "Não hiperestender pescoço por rotina.",
          "Não atribuir disfonia apenas a infecção sem visualizar laringe quando grave."
        ],
        pearl: "Na AR de longa data, perguntar por pescoço e voz antes da intubação pode prevenir desastre.",
        referenceIds: ["ra-cervical-review"]
      },
      {
        id: "adult-still-mas",
        title: "Still do adulto com MAS",
        icon: "🌡️",
        category: "hiperinflamacao",
        urgency: "Agora",
        summary: "Flare hiperinflamatório pode evoluir com citopenias, hepatite, coagulopatia e choque.",
        trigger: "Febre quotidiana/rash/artrite + ferritina crescente e queda de plaquetas/fibrinogênio.",
        tags: ["Still", "MAS", "ferritina", "choque"],
        firstHour: [
          "Tratar falência orgânica e investigar infecção/malignidade.",
          "Comparar com tendência basal: plaquetas, fibrinogênio, AST e ferritina.",
          "Discutir glicocorticoide e bloqueio de citocina no protocolo especializado."
        ],
        decisive: [
          "Culturas/imagem, EBV/CMV e revisão medicamentosa.",
          "HScore/HLH-2004 como apoio, não barreira.",
          "Medula/linfonodo se malignidade é plausível."
        ],
        doNot: [
          "Não usar ferritina glicosilada ou total isoladamente para confirmar.",
          "Não chamar a deterioração de 'flare simples' sem procurar MAS."
        ],
        pearl: "No Still, a queda de marcadores antes elevados — plaquetas e fibrinogênio — pode ser mais alarmante que o valor absoluto.",
        referenceIds: ["eular-acr-hlh-2022", "mas-2016"]
      },
      {
        id: "takayasu-critical",
        title: "Takayasu com isquemia crítica",
        icon: "🫀",
        category: "vasculite",
        urgency: "Agora",
        summary: "Inflamação/estenose de grandes vasos pode causar AVC, isquemia de membro, coronária ou renal.",
        trigger: "Paciente jovem com déficit de pulso/PA assimétrica + isquemia aguda ou hipertensão renovascular.",
        tags: ["Takayasu", "grandes vasos", "isquemia", "angioRM"],
        firstHour: [
          "Tratar síndrome isquêmica e acionar Vascular/Cardio/Neuro/Reumato.",
          "Medir PA nos quatro membros e mapear território arterial.",
          "Revascularizar emergencialmente se necessário; controlar inflamação em paralelo."
        ],
        decisive: [
          "AngioTC/angioRM e imagem de aorta/ramos.",
          "ECG/troponina, neuroimagem e função renal conforme órgão.",
          "PCR/VHS, reconhecendo baixa sensibilidade para atividade individual."
        ],
        doNot: [
          "Não excluir atividade por PCR normal.",
          "Não atrasar revascularização salvadora por tentativa de controlar toda inflamação primeiro."
        ],
        pearl: "Em isquemia crítica, anatomia e perfusão comandam a primeira hora; atividade inflamatória orienta o plano seguinte.",
        referenceIds: ["eular-lvv-2018", "acr-eular-takayasu-2022"]
      }
    ],

    comparisons: [
      {
        id: "pulmonary-renal",
        label: "Pulmão–rim",
        title: "Síndrome pulmão–rim: anticorpo orienta, tecido e contexto decidem",
        intro: "Confirme hemorragia alveolar/glomerulonefrite e mantenha infecção/endocardite no diferencial.",
        columns: ["GPA/MPA", "Anti-GBM", "LES", "Crioglobulinemia", "Infecção/endocardite"],
        rows: [
          { label: "Pista", values: ["ENT/nódulos ou capilarite; PR3/MPO", "DAH + RPGN abrupta", "Atividade multissistêmica, complemento baixo", "Púrpura/neuropatia, C4 baixo, HCV/clone", "Febre/foco, vegetação, culturas"] },
          { label: "Sorologia", values: ["ANCA PR3/MPO", "Anti-GBM; pode haver ANCA", "ANA, dsDNA, complemento", "Crioglobulina, RF, C4, HCV", "Pode ter ANCA/RF positivos"] },
          { label: "Rim", values: ["GN pauci-imune", "IgG linear", "Imunocomplexos full-house/TMA", "MPGN/imunocomplexos", "GN por imunocomplexos"] },
          { label: "Próximo decisivo", values: ["Biópsia renal + exclusão de infecção", "Anti-GBM + biópsia", "Biópsia renal e atividade", "Pré-analítico da crioglobulina + biópsia", "Culturas, eco e tecido"] },
          { label: "Armadilha", values: ["ANCA = diagnóstico", "Esperar biópsia no fulminante", "Chamar tudo de flare", "Crioglobulina falso-negativa", "Imunossuprimir endocardite"] }
        ],
        pearl: "ANCA positivo não esteriliza hemocultura nem substitui a pergunta: existe vasculite depois de excluir mimetizadores?"
      },
      {
        id: "aki-tma",
        label: "IRA + MAHA + PA",
        title: "IRA, esquizócitos e hipertensão: cinco mecanismos, decisões diferentes",
        intro: "Compare pressão basal, contexto, coagulação, ADAMTS13 e padrão renal.",
        columns: ["Crise renal ES", "PTT", "SHU complemento", "HAS maligna", "LN/TMA-SAF"],
        rows: [
          { label: "Contexto", values: ["ES difusa precoce, GC recente", "MAT sem causa melhor", "Gatilho/complemento, rim dominante", "PA extrema e lesão de órgão", "LES/aPL, nefrite"] },
          { label: "PA", values: ["Nova/elevada; pode ser relativa", "Variável", "Variável", "Marcadamente alta", "Variável"] },
          { label: "Plaquetas", values: ["Queda moderada comum", "Frequentemente muito baixas", "Variável", "Moderada", "Variável"] },
          { label: "Teste-chave", values: ["Contexto + resposta ao IECA", "ADAMTS13", "Exclusão + complemento/genética contextual", "Fundo/retina e resposta à PA", "Biópsia renal, aPL, atividade LES"] },
          { label: "Ação crítica", values: ["IECA imediato", "TPE/fluxo PTT", "Suporte + bloqueio C5 selecionado", "Controle de PA", "Tratar nefrite/TMA/SAF conforme mecanismo"] }
        ],
        pearl: "A mesma lâmina com esquizócitos pode apontar para IECA, plasmaférese, bloqueio de complemento ou controle pressórico."
      },
      {
        id: "hyperferritin",
        label: "Ferritina",
        title: "Hiperferritinemia: sinal de carga inflamatória, não etiqueta etiológica",
        intro: "Use tendência, citopenias, fibrinogênio, AST e falência orgânica para reconhecer a síndrome.",
        columns: ["MAS/HLH", "Sepse", "Still ativo", "Malignidade", "Hepatite/lesão hepática"],
        rows: [
          { label: "Pistas", values: ["Citopenias, espleno, TG↑, fibrinogênio↓", "Foco/choque/lactato", "Febre quotidiana, rash, artrite", "B-sintomas, linfonodo, medula", "Transaminases/INR dominantes"] },
          { label: "Ferritina", values: ["Pode subir rapidamente", "Pode ser extrema", "Frequentemente alta", "Pode ser alta ± HLH", "Pode ser muito alta"] },
          { label: "Teste útil", values: ["Tendências + HScore/HLH-2004", "Culturas/imagem/foco", "Diagnóstico clínico e exclusões", "Tecido/medula", "Etiologia hepática"] },
          { label: "Conduta", values: ["Gatilho + hiperinflamação", "Antimicrobiano/suporte", "Controlar Still; vigiar MAS", "Onco + tratar HLH se presente", "Suporte e causa"] },
          { label: "Armadilha", values: ["Esperar critérios", "Excluir MAS", "Ferritina confirma Still", "Perder linfoma", "Imunossuprimir hepatite"] }
        ],
        pearl: "Ferritina extrema aumenta urgência de pensar, não a especificidade do diagnóstico."
      },
      {
        id: "rapid-ild",
        label: "DPI rápida",
        title: "DPI rapidamente progressiva: autoimunidade e infecção viajam juntas",
        intro: "O fenótipo de miosite pode ser sutil; o risco infeccioso cresce com a própria imunossupressão.",
        columns: ["Anti-MDA5", "Antissintetase", "ES-DPI", "Pneumocystis/infecção", "Toxicidade"],
        rows: [
          { label: "Pistas", values: ["Úlceras/pápulas, artrite, pouca miosite", "Mãos de mecânico, Raynaud, miosite", "Raynaud/esclerodactilia", "Imunossupressão, febre, LDH", "Droga/radiação/exposição"] },
          { label: "CK", values: ["Pode ser normal", "Variável", "Geralmente não dominante", "Não define", "Variável"] },
          { label: "Imagem", values: ["OP/NSIP difusa e rápida", "NSIP/OP", "NSIP/UIP", "Vidro fosco difuso", "Variável"] },
          { label: "Próximo exame", values: ["Painel miosite/ferritina + microbiologia", "Anticorpos antissintetase", "Autoanticorpos ES + TCAR", "PCR/BAL quando seguro", "Linha do tempo e exclusão"] },
          { label: "Armadilha", values: ["Excluir por CK normal", "Testar só Jo-1", "GC em alta dose por reflexo", "Chamar tudo de flare", "Ignorar interação medicamentosa"] }
        ],
        pearl: "Antes de 'escalar imunossupressão', escreva qual infecção ainda não foi razoavelmente excluída."
      },
      {
        id: "vasculitis-caliber",
        label: "Calibre vascular",
        title: "Calibre vascular e órgão ajudam a escolher o mapa",
        intro: "Há sobreposição, mas glomérulo, capilar pulmonar, aneurisma e pulso ausente não falam a mesma língua.",
        columns: ["GPA/MPA", "PAN", "GCA/Takayasu", "Behçet", "Crioglobulinemia"],
        rows: [
          { label: "Vaso dominante", values: ["Pequeno vaso/capilar", "Médio vaso", "Grande/médio", "Variável, arterial/venoso", "Pequeno vaso imunocomplexo"] },
          { label: "Rim", values: ["GN pauci-imune", "Isquemia/HTA, sem GN", "Renovascular", "Trombose", "MPGN"] },
          { label: "Pulmão", values: ["DAH/nódulos/ILD", "Capilar pulmonar poupado", "Aorta/ramos", "Aneurisma pulmonar", "DAH rara"] },
          { label: "Teste anatômico", values: ["TC + biópsia renal/órgão", "Angiografia/biopsia", "US/angio/PET", "AngioTC", "Biópsia + crioglobulina"] },
          { label: "Armadilha", values: ["ANCA isolado", "Chamar GN de PAN", "Marcador normal exclui", "Anticoagular aneurisma", "Coleta fria"] }
        ],
        pearl: "O calibre é um mapa inicial; o diagnóstico final integra padrão vascular, causa, tecido e mimetizadores."
      }
    ],

    concepts: [
      { icon: "🧬", label: "princípio", term: "Classificação não é diagnóstico", definition: "Critérios ACR/EULAR foram validados para formar grupos homogêneos de pesquisa após diagnóstico clínico e exclusão de mimetizadores.", application: "Use o score para aprender o fenótipo e documentar, nunca para dispensar julgamento." },
      { icon: "🫁", label: "síndrome", term: "Síndrome pulmão–rim", definition: "Combinação de hemorragia alveolar/capilarite e glomerulonefrite rapidamente progressiva.", application: "Aciona simultaneamente suporte, ANCA/anti-GBM/LES, infecção e biópsia renal." },
      { icon: "🫘", label: "órgão", term: "Sedimento glomerular ativo", definition: "Hemácias dismórficas e cilindros hemáticos sugerem lesão glomerular, mesmo com proteinúria variável.", application: "Distingue GN de isquemia renal da PAN e aponta para biópsia." },
      { icon: "🧨", label: "imunotrombose", term: "SAF catastrófica", definition: "Trombose de pequenos/grandes vasos que envolve múltiplos órgãos em curto intervalo.", application: "Exige tratar trombose, inflamação e precipitante em paralelo." },
      { icon: "🔥", label: "hiperinflamação", term: "MAS é dinâmica", definition: "A queda relativa de plaquetas/fibrinogênio e a subida rápida de ferritina/AST podem anteceder critérios completos.", application: "Compare com valores basais e defina frequência de reavaliação." },
      { icon: "👁️", label: "isquemia", term: "GCA ocular", definition: "Vasculite de artérias médias/grandes pode interromper perfusão ocular e ameaçar o olho contralateral.", application: "Trate suspeita alta com ameaça visual antes de biópsia/imagem." },
      { icon: "🌫️", label: "interstício", term: "DPI rapidamente progressiva", definition: "Piora respiratória/imaginológica em semanas, notadamente em anti-MDA5 e miosites.", application: "Imunossupressão e investigação infecciosa precisam correr juntas." },
      { icon: "❄️", label: "imunocomplexo", term: "Crioglobulina e pré-analítico", definition: "Proteínas precipitam no frio; coleta e transporte inadequados geram falso-negativo.", application: "Manter a amostra aquecida até separação é parte do teste." },
      { icon: "🫀", label: "vaso", term: "Trombose inflamatória do Behçet", definition: "Inflamação da parede vascular favorece trombo aderido e aneurisma, sobretudo pulmonar.", application: "Anticoagulação não pode ser automática diante de hemoptise/aneurisma." },
      { icon: "🦴", label: "estrutura", term: "Via aérea reumatológica", definition: "Cricoaritenoide, traqueomalácia e instabilidade cervical podem transformar sedação/intubação em colapso.", application: "Planejar via aérea e posição antes da indução." },
      { icon: "🧪", label: "mimetizador", term: "Infecção autoimune-like", definition: "Endocardite, TB, fungos e vírus podem causar ANCA, consumo de complemento, GN e manifestações vasculares.", application: "Culturas e avaliação infecciosa são parte do raciocínio reumatológico crítico." },
      { icon: "🎯", label: "decisão", term: "Órgão ameaçado", definition: "Manifestação capaz de causar morte ou dano irreversível em horas/dias, independentemente do nome final da doença.", application: "Define urgência, intensidade diagnóstica e necessidade de equipe multidisciplinar." }
    ],

    mnemonics: [
      { code: "IMUNE = ÓRGÃO", title: "Primeiro proteja o órgão", expansion: "Olho, pulmão, rim, cérebro, coração, vaso e via aérea vêm antes do painel de anticorpos.", use: "Na primeira leitura de qualquer emergência reumatológica.", limit: "Proteção de órgão não elimina a necessidade de confirmar o mecanismo." },
      { code: "PULMÃO–RIM = A·B·C·I", title: "ANCA · anti-GBM · Complemento · Infecção", expansion: "Colete os três e investigue infecção/endocardite em paralelo.", use: "DAH + sedimento glomerular/IRA.", limit: "O tecido e o contexto podem superar a sorologia." },
      { code: "CAPS = 3·D·T", title: "Três órgãos · Dias · Trombose", expansion: "Multiorgânico em curto tempo com evidência de trombose e aPL/contexto.", use: "Para reconhecer SAF catastrófica.", limit: "Sepse/CIVD/TTP/HIT continuam no diferencial." },
      { code: "ES + PA + IRA = IECA", title: "Crise renal esclerodérmica", expansion: "Mudança pressórica e creatinina em esclerose sistêmica exigem IECA imediato no fluxo.", use: "ES difusa precoce, sobretudo após glicocorticoide.", limit: "Compare PA basal e mantenha TTP/HAS maligna no mapa." },
      { code: "MAS = F·P·F", title: "Ferritina sobe · Plaquetas caem · Fibrinogênio cai", expansion: "Tendências opostas sinalizam ativação macrofágica.", use: "Still/LES com deterioração.", limit: "Sepse pode reproduzir o padrão e coexistir." },
      { code: "GCA = OLHO AGORA", title: "Visão não espera biópsia", expansion: "Em ≥50 anos com isquemia visual e fenótipo compatível, proteja o outro olho.", use: "Amaurose, diplopia ou perda visual.", limit: "Critérios classificatórios não são regra de exclusão." },
      { code: "MDA5 = PELE·PULMÃO", title: "Pouco músculo, muito pulmão", expansion: "Lesões cutâneas/artrite com DPI rápida podem ocorrer com CK normal.", use: "DPI-RP sem fraqueza exuberante.", limit: "Infecção oportunista precisa ser procurada." },
      { code: "PAN = MÉDIO sem GN", title: "Aneurisma, isquemia, neuropatia", expansion: "PAN clássica compromete médio vaso e poupa glomérulo/capilar pulmonar.", use: "Dor abdominal, livedo, mononeurite e HTA.", limit: "GN/DAH puxam para AAV/anti-GBM." },
      { code: "CRIO = C4·RF·CALOR", title: "Complemento baixo, fator reumatoide, amostra aquecida", expansion: "Tríade operacional para não perder crioglobulinemia.", use: "Púrpura + neuropatia/GN.", limit: "Resultados dependem de técnica e causa subjacente." },
      { code: "VIA AÉREA = VOZ + PESCOÇO", title: "Pergunte antes de intubar", expansion: "Disfonia/estridor apontam laringe; dor cervical/neurológico apontam C1–C2.", use: "AR ou policondrite com necessidade de via aérea.", limit: "Ausência de sintomas não exclui instabilidade em doença avançada." },
      { code: "ANCA ≠ VASCULITE", title: "Anticorpo não substitui doença", expansion: "Confirme síndrome, exclua mimetizadores e use biópsia quando útil.", use: "Todo ANCA positivo inesperado.", limit: "ANCA negativo também não exclui vasculite." },
      { code: "TURBO = 1·1·1", title: "Um órgão · um mimetizador · uma mudança", expansion: "Diga qual órgão ameaça, qual mimetizador mata e qual dado muda sua conduta.", use: "Fechamento de caso e revisão TEMI.", limit: "É ferramenta cognitiva, não checklist clínico completo." }
    ],

    alerts: [
      { level: "red", icon: "🦠", title: "Imunossupressão pode piorar o mimetizador", message: "Endocardite, TB, fungos e vírus podem parecer vasculite/flare.", action: "Colete culturas e cubra infecção plausível sem atrasar proteção de órgão." },
      { level: "red", icon: "👁️", title: "Visão não espera", message: "GCA com ameaça ocular pode tornar-se bilateral.", action: "Trate a suspeita alta e organize confirmação em paralelo." },
      { level: "red", icon: "🫘", title: "Crise renal ES pede IECA", message: "Glicocorticoide em alta dose pode ser fator de risco e não é resposta automática.", action: "Controle PA com IECA no fluxo e monitore rim/potássio." },
      { level: "yellow", icon: "🧬", title: "Critério classificatório não exclui doença", message: "Scores ACR/EULAR priorizam especificidade de pesquisa.", action: "Aplique somente após pré-requisitos e exclusão de mimetizadores." },
      { level: "red", icon: "🫁", title: "DAH pode não ter hemoptise", message: "Hipoxemia, queda de Hb e infiltrado difuso podem ser a apresentação.", action: "Investigue pulmão–rim e suporte respiratório imediatamente." },
      { level: "yellow", icon: "🔥", title: "Ferritina extrema não é etiologia", message: "MAS, sepse, hepatite e malignidade podem produzir valores muito altos.", action: "Use tendência, órgão, citopenias, AST, TG e fibrinogênio." },
      { level: "red", icon: "🫀", title: "Behçet + hemoptise muda anticoagulação", message: "Trombose pode coexistir com aneurisma pulmonar hemorrágico.", action: "Faça imagem vascular e decisão multidisciplinar antes do piloto automático." },
      { level: "yellow", icon: "🌫️", title: "CK normal não exclui anti-MDA5", message: "O fenótipo pode ser amiopático com pulmão dominante.", action: "Examine pele/unhas e investigue DPI-RP e infecção." },
      { level: "red", icon: "🦴", title: "AR pode tornar intubação perigosa", message: "Instabilidade C1–C2 e cricoaritenoide podem coexistir.", action: "Planeje posição e via aérea com equipe experiente." },
      { level: "yellow", icon: "❄️", title: "Crioglobulina pode ser falso-negativa", message: "Amostra que esfria antes do processamento perde sensibilidade.", action: "Confirme técnica, C4/RF, HCV e repita se a suspeita continuar alta." },
      { level: "green", icon: "🔁", title: "Reavalie o mecanismo", message: "Infecção, trombose e inflamação podem trocar de peso ao longo das horas.", action: "Defina dados e intervalo que obrigam revisão do plano." },
      { level: "yellow", icon: "💊", title: "Dose não é protocolo universal", message: "Gravidade, rim, infecção, fertilidade e disponibilidade mudam o regime.", action: "Use o módulo para reconhecer/estratificar e confirme prescrição localmente." }
    ],

    calculators: [
      {
        id: "sle-2019",
        shortTitle: "LES 2019",
        title: "EULAR/ACR 2019 — classificação de LES",
        kind: "critério classificatório",
        purpose: "classificação",
        description: "Soma o maior peso de cada domínio depois do critério de entrada ANA.",
        warning: "Não foi desenhado para diagnosticar ou excluir LES em indivíduo. Cada item deve não ter explicação mais provável.",
        requirements: [
          { id: "ana", label: "ANA ≥1:80 em HEp-2 ou teste equivalente, ao menos uma vez." },
          { id: "clinical", label: "Existe pelo menos um critério clínico atribuível ao LES." },
          { id: "attribution", label: "Mimetizadores e explicações mais prováveis foram avaliados." }
        ],
        groups: [
          { id: "constitutional", label: "Constitucional", options: [{ label: "Nenhum", points: 0 }, { label: "Febre", points: 2 }] },
          { id: "hematologic", label: "Hematológico (maior peso)", options: [{ label: "Nenhum", points: 0 }, { label: "Leucopenia", points: 3 }, { label: "Trombocitopenia", points: 4 }, { label: "Hemólise autoimune", points: 4 }] },
          { id: "neuro", label: "Neuropsiquiátrico (maior peso)", options: [{ label: "Nenhum", points: 0 }, { label: "Delirium", points: 2 }, { label: "Psicose", points: 3 }, { label: "Convulsão", points: 5 }] },
          { id: "mucocutaneous", label: "Mucocutâneo (maior peso)", options: [{ label: "Nenhum", points: 0 }, { label: "Alopecia não cicatricial", points: 2 }, { label: "Úlcera oral", points: 2 }, { label: "LES cutâneo subagudo ou discoide", points: 4 }, { label: "LES cutâneo agudo", points: 6 }] },
          { id: "serosal", label: "Serosas (maior peso)", options: [{ label: "Nenhum", points: 0 }, { label: "Derrame pleural ou pericárdico", points: 5 }, { label: "Pericardite aguda", points: 6 }] },
          { id: "musculoskeletal", label: "Musculoesquelético", options: [{ label: "Nenhum", points: 0 }, { label: "Envolvimento articular", points: 6 }] },
          { id: "renal", label: "Renal (maior peso)", options: [{ label: "Nenhum", points: 0 }, { label: "Proteinúria >0,5 g/dia", points: 4 }, { label: "Nefrite classe II ou V", points: 8 }, { label: "Nefrite classe III ou IV", points: 10 }] },
          { id: "apl", label: "Antifosfolípides", options: [{ label: "Ausentes/não pontua", points: 0 }, { label: "aPL positivo elegível", points: 2 }] },
          { id: "complement", label: "Complemento", options: [{ label: "Normal", points: 0 }, { label: "C3 ou C4 baixo", points: 3 }, { label: "C3 e C4 baixos", points: 4 }] },
          { id: "specific", label: "Anticorpos específicos", options: [{ label: "Ausentes/não pontua", points: 0 }, { label: "Anti-dsDNA ou anti-Sm", points: 6 }] }
        ],
        ranges: [
          { min: 0, max: 9, label: "Limiar classificatório não atingido", note: "Isso não exclui LES; reavalie atribuição, evolução e outras classificações." },
          { min: 10, max: 60, label: "Atinge limiar classificatório", note: "Pode classificar LES para pesquisa se todos os pré-requisitos e regras de atribuição forem atendidos." }
        ]
      },
      {
        id: "gca-2022",
        shortTitle: "GCA 2022",
        title: "ACR/EULAR 2022 — classificação de GCA",
        kind: "critério classificatório",
        purpose: "classificação",
        description: "Sistema ponderado validado para pesquisa em arterite de células gigantes.",
        warning: "Não usar para decidir se deve tratar ameaça visual; proteção da visão não espera o score.",
        requirements: [
          { id: "age", label: "Idade ≥50 anos ao diagnóstico." },
          { id: "vasculitis", label: "Existe diagnóstico clínico de vasculite de médio/grande vaso e mimetizadores foram excluídos." }
        ],
        groups: [
          { id: "stiffness", label: "Rigidez matinal ombros/pescoço", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "vision", label: "Perda visual súbita", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 3 }] },
          { id: "jaw", label: "Claudicação mandibular/lingual", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "headache", label: "Cefaleia temporal nova", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "scalp", label: "Sensibilidade do couro cabeludo", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "artery", label: "Anormalidade da artéria temporal", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "inflammation", label: "VHS ≥50 ou PCR ≥10 mg/L", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 3 }] },
          { id: "tab-halo", label: "Biópsia temporal positiva ou halo", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 5 }] },
          { id: "axillary", label: "Axilares bilaterais na imagem", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "pet", label: "Atividade aórtica no FDG-PET", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] }
        ],
        ranges: [
          { min: 0, max: 5, label: "Limiar classificatório não atingido", note: "Não exclui GCA e nunca deve atrasar tratamento ocular tempo-dependente." },
          { min: 6, max: 30, label: "Atinge limiar classificatório", note: "Classificação para pesquisa se pré-requisitos forem satisfeitos." }
        ]
      },
      {
        id: "gpa-2022",
        shortTitle: "GPA 2022",
        title: "ACR/EULAR 2022 — classificação de GPA",
        kind: "critério classificatório",
        purpose: "classificação",
        description: "Distingue GPA de outras vasculites pequenas/médias depois do diagnóstico de vasculite.",
        warning: "Não aplicar a todo ANCA positivo. O pré-requisito é vasculite já diagnosticada e mimetizadores excluídos.",
        requirements: [
          { id: "vasculitis", label: "Diagnóstico de vasculite de pequeno/médio vaso estabelecido." },
          { id: "mimics", label: "Mimetizadores de vasculite foram excluídos." }
        ],
        groups: [
          { id: "nasal", label: "Sangramento/úlcera/congestão nasal", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 3 }] },
          { id: "cartilage", label: "Envolvimento cartilaginoso", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "hearing", label: "Perda auditiva condutiva/sensorioneural", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "pr3", label: "cANCA ou PR3-ANCA", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 5 }] },
          { id: "lung", label: "Nódulo/massa/cavitação pulmonar", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "granuloma", label: "Granuloma/células gigantes em biópsia", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "sinus", label: "Sinusite/mastoidite em imagem", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "gn", label: "GN pauci-imune", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "mpo", label: "pANCA ou MPO-ANCA", options: [{ label: "Não", points: 0 }, { label: "Sim", points: -1 }] },
          { id: "eos", label: "Eosinófilos ≥1 × 10⁹/L", options: [{ label: "Não", points: 0 }, { label: "Sim", points: -4 }] }
        ],
        ranges: [
          { min: -10, max: 4, label: "Limiar de GPA não atingido", note: "Reclassifique o fenótipo entre MPA, EGPA e outras vasculites." },
          { min: 5, max: 30, label: "Atinge limiar classificatório de GPA", note: "Somente se vasculite foi estabelecida e mimetizadores excluídos." }
        ]
      },
      {
        id: "mpa-2022",
        shortTitle: "MPA 2022",
        title: "ACR/EULAR 2022 — classificação de MPA",
        kind: "critério classificatório",
        purpose: "classificação",
        description: "Sistema ponderado para classificar poliangiíte microscópica.",
        warning: "Não diagnostica vasculite e não deve ser aplicado antes de excluir infecção/endocardite e outros mimetizadores.",
        requirements: [
          { id: "vasculitis", label: "Diagnóstico de vasculite de pequeno/médio vaso estabelecido." },
          { id: "mimics", label: "Mimetizadores de vasculite foram excluídos." }
        ],
        groups: [
          { id: "mpo", label: "pANCA ou MPO-ANCA", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 6 }] },
          { id: "gn", label: "GN pauci-imune", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 3 }] },
          { id: "ild", label: "Fibrose pulmonar / DPI", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 3 }] },
          { id: "nasal", label: "Sangramento/úlcera/congestão nasal", options: [{ label: "Não", points: 0 }, { label: "Sim", points: -3 }] },
          { id: "pr3", label: "cANCA ou PR3-ANCA", options: [{ label: "Não", points: 0 }, { label: "Sim", points: -1 }] },
          { id: "eos", label: "Eosinófilos ≥1 × 10⁹/L", options: [{ label: "Não", points: 0 }, { label: "Sim", points: -4 }] }
        ],
        ranges: [
          { min: -10, max: 4, label: "Limiar de MPA não atingido", note: "Reavalie GPA, EGPA e outros mecanismos." },
          { min: 5, max: 20, label: "Atinge limiar classificatório de MPA", note: "Somente depois dos pré-requisitos." }
        ]
      },
      {
        id: "egpa-2022",
        shortTitle: "EGPA 2022",
        title: "ACR/EULAR 2022 — classificação de EGPA",
        kind: "critério classificatório",
        purpose: "classificação",
        description: "Sistema ponderado que valoriza eosinofilia, asma, pólipos e inflamação eosinofílica.",
        warning: "Não é ferramenta de rastreio de asma/eosinofilia; requer vasculite de pequeno/médio vaso já estabelecida.",
        requirements: [
          { id: "vasculitis", label: "Diagnóstico de vasculite de pequeno/médio vaso estabelecido." },
          { id: "mimics", label: "Mimetizadores de vasculite e síndromes hipereosinofílicas foram excluídos." }
        ],
        groups: [
          { id: "eos", label: "Eosinófilos ≥1 × 10⁹/L", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 5 }] },
          { id: "airway", label: "Doença obstrutiva de via aérea", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 3 }] },
          { id: "polyps", label: "Pólipos nasais", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 3 }] },
          { id: "biopsy", label: "Inflamação extravascular eosinofílica", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 2 }] },
          { id: "neuropathy", label: "Mononeurite múltipla/neuropatia motora", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "pr3", label: "cANCA ou PR3-ANCA", options: [{ label: "Não", points: 0 }, { label: "Sim", points: -3 }] },
          { id: "hematuria", label: "Hematúria", options: [{ label: "Não", points: 0 }, { label: "Sim", points: -1 }] }
        ],
        ranges: [
          { min: -10, max: 5, label: "Limiar de EGPA não atingido", note: "Reavalie GPA/MPA, síndrome hipereosinofílica e mimetizadores." },
          { min: 6, max: 20, label: "Atinge limiar classificatório de EGPA", note: "Somente se os pré-requisitos forem atendidos." }
        ]
      },
      {
        id: "ffs-2009",
        shortTitle: "FFS 2009",
        title: "Five-Factor Score revisado — prognóstico",
        kind: "escore prognóstico",
        purpose: "prognóstico",
        description: "Estima risco em vasculites necrosantes sistêmicas; não diagnostica e não substitui gravidade do órgão atual.",
        warning: "Use para prognóstico/população apropriada, não para decidir sozinho indução em emergência.",
        requirements: [
          { id: "snv", label: "Há vasculite necrosante sistêmica no espectro validado." }
        ],
        groups: [
          { id: "age", label: "Idade >65 anos", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "cardiac", label: "Sintomas cardíacos", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "gi", label: "Envolvimento gastrointestinal grave", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "renal", label: "Creatinina ≥150 µmol/L (~1,7 mg/dL)", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "ent", label: "Ausência de manifestações ENT", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] }
        ],
        ranges: [
          { min: 0, max: 0, label: "FFS 0", note: "Grupo prognóstico mais favorável; ainda pode haver órgão ameaçado que exige tratamento intenso." },
          { min: 1, max: 1, label: "FFS 1", note: "Risco prognóstico aumentado; integrar idade, órgão, subtipo e comorbidades." },
          { min: 2, max: 5, label: "FFS ≥2", note: "Grupo prognóstico de maior risco; requer planejamento e monitorização intensivos." }
        ]
      },
      {
        id: "mas-2016",
        shortTitle: "MAS 2016",
        title: "MAS-2016 em AIJ sistêmica",
        kind: "critério classificatório",
        purpose: "classificação",
        description: "Ferritina >684 ng/mL e pelo menos dois de quatro critérios em paciente febril com AIJ sistêmica conhecida/suspeita.",
        warning: "Validado para MAS complicando AIJ sistêmica, não como diagnóstico universal de HLH/MAS em adultos.",
        requirements: [
          { id: "sjia", label: "Paciente febril com AIJ sistêmica conhecida ou suspeita." },
          { id: "ferritin", label: "Ferritina >684 ng/mL." }
        ],
        groups: [
          { id: "platelets", label: "Plaquetas ≤181 × 10⁹/L", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "ast", label: "AST >48 U/L", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "tg", label: "Triglicerídeos >156 mg/dL", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
          { id: "fibrinogen", label: "Fibrinogênio ≤360 mg/dL", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] }
        ],
        ranges: [
          { min: 0, max: 1, label: "Menos de 2 critérios adicionais", note: "Não atinge o classificador; tendência e deterioração ainda exigem reavaliação." },
          { min: 2, max: 4, label: "Atinge o classificador MAS-2016", note: "Somente no contexto de AIJ sistêmica e após os pré-requisitos." }
        ]
      }
    ],

    questions: [
      { id: "rq1", domain: "Pulmão–rim", prompt: "ANCA positivo + GN + febre e sopro novo permite fechar AAV?", options: ["Sim", "Não; endocardite continua mimetizador crítico", "Só se PR3", "Só se MPO"], correct: 1, explanation: "Endocardite pode produzir ANCA, imunocomplexos e GN.", rule: "Anticorpo não substitui exclusão de mimetizador letal." },
      { id: "rq2", domain: "GCA", prompt: "Perda visual súbita em paciente de 72 anos com claudicação mandibular: qual prioridade?", options: ["Calcular score e esperar", "Tratar ameaça visual e confirmar em paralelo", "Aguardar biópsia", "Repetir VHS em 48h"], correct: 1, explanation: "O tratamento tempo-dependente não espera biópsia/score.", rule: "Visão não espera classificação." },
      { id: "rq3", domain: "Crise renal ES", prompt: "Qual eixo farmacológico é central na crise renal esclerodérmica?", options: ["IECA", "AINE", "Alta dose de glicocorticoide", "Betabloqueador isolado"], correct: 0, explanation: "IECA deve ser iniciado/titulado prontamente no fluxo apropriado.", rule: "ES + PA/IRA = IECA, com monitorização." },
      { id: "rq4", domain: "MAS", prompt: "MAS-2016 pode ser usado como teste diagnóstico universal em adulto com sepse?", options: ["Sim", "Não; foi validado em AIJ sistêmica", "Só com ferritina >500", "Só se hemofagocitose"], correct: 1, explanation: "É critério classificatório de contexto específico.", rule: "Validação e população importam tanto quanto o corte." },
      { id: "rq5", domain: "SAF", prompt: "CAPS provável exige persistência de aPL por 12 semanas antes de tratar?", options: ["Sim", "Não; a emergência é tratada enquanto a confirmação segue", "Somente se renal", "Somente se plaquetas normais"], correct: 1, explanation: "Critérios de classificação e confirmação laboratorial não podem atrasar suporte/terapia da emergência.", rule: "Urgência clínica e confirmação longitudinal correm em paralelo." },
      { id: "rq6", domain: "Anti-MDA5", prompt: "CK normal exclui dermatomiosite anti-MDA5 com DPI-RP?", options: ["Sim", "Não", "Somente em homem", "Somente sem rash"], correct: 1, explanation: "O fenótipo pode ser clinicamente amiopático e pulmão-dominante.", rule: "Pouco músculo não significa baixo risco pulmonar." },
      { id: "rq7", domain: "PAN", prompt: "Qual achado torna PAN clássica menos provável?", options: ["Mononeurite múltipla", "Microaneurismas", "GN pauci-imune", "Hipertensão renovascular"], correct: 2, explanation: "PAN poupa glomérulos/capilares.", rule: "GN/DAH puxam para AAV/anti-GBM." },
      { id: "rq8", domain: "Crioglobulinemia", prompt: "Crioglobulina negativa com forte suspeita e amostra transportada fria significa:", options: ["Doença excluída", "Possível falso-negativo pré-analítico", "GPA confirmada", "C4 alto esperado"], correct: 1, explanation: "A coleta deve permanecer aquecida até separação.", rule: "O pré-analítico faz parte do diagnóstico." },
      { id: "rq9", domain: "Behçet", prompt: "Behçet + hemoptise + trombose pulmonar: qual perigo do piloto automático?", options: ["Usar oxigênio", "Anticoagular antes de excluir aneurisma pulmonar", "Fazer angioTC", "Acionar reumatologia"], correct: 1, explanation: "Aneurisma pulmonar eleva risco de hemorragia fatal.", rule: "Imagem vascular precede decisão cega de anticoagulação." },
      { id: "rq10", domain: "AAV", prompt: "Para aplicar critérios GPA/MPA/EGPA 2022 é necessário:", options: ["Apenas ANCA positivo", "Diagnóstico de vasculite e exclusão de mimetizadores", "Ferritina alta", "Biópsia obrigatória em todos"], correct: 1, explanation: "Os critérios diferenciam subtipos após a etapa diagnóstica.", rule: "Classifique depois de diagnosticar vasculite." },
      { id: "rq11", domain: "LES", prompt: "No EULAR/ACR 2019, podem ser somados vários itens do mesmo domínio?", options: ["Sim", "Não; conta o maior peso do domínio", "Só no renal", "Só no hematológico"], correct: 1, explanation: "O sistema usa o maior critério por domínio.", rule: "Um domínio, um peso máximo." },
      { id: "rq12", domain: "Via aérea", prompt: "AR longa data + estridor + necessidade de intubação exige atenção a:", options: ["Apenas broncoespasmo", "Cricoaritenoide e instabilidade C1–C2", "Somente anemia", "Somente nódulo reumatoide"], correct: 1, explanation: "Laringe e coluna cervical podem tornar manejo de via aérea arriscado.", rule: "Voz + pescoço antes de intubar." },
      { id: "rq13", domain: "DAH", prompt: "Hemoptise é obrigatória na hemorragia alveolar?", options: ["Sim", "Não", "Só no LES", "Só na AAV"], correct: 1, explanation: "Pode faltar; hipoxemia, infiltrado e queda de Hb são pistas.", rule: "DAH sem hemoptise existe." },
      { id: "rq14", domain: "FFS", prompt: "O Five-Factor Score serve principalmente para:", options: ["Diagnosticar AAV", "Prognóstico em vasculites necrosantes sistêmicas", "Excluir infecção", "Decidir dose isoladamente"], correct: 1, explanation: "É prognóstico e não substitui avaliação do órgão ameaçado.", rule: "Nomeie a finalidade antes de usar o score." },
      { id: "rq15", domain: "NPSLE", prompt: "A primeira distinção mecanística no neuro-LES grave é:", options: ["ANA alto ou baixo", "Inflamatório vs trombótico vs infeccioso/metabólico", "Sexo", "Tempo de diagnóstico apenas"], correct: 1, explanation: "O mecanismo direciona imunossupressão, anticoagulação ou antimicrobiano.", rule: "Atribuição é parte do diagnóstico." },
      { id: "rq16", domain: "Takayasu", prompt: "PCR normal exclui atividade de Takayasu?", options: ["Sim", "Não", "Só se PET normal", "Só em jovens"], correct: 1, explanation: "Marcadores podem não refletir atividade vascular individual.", rule: "Sintoma, anatomia e imagem vencem um marcador isolado." }
    ],

    flashcards: [
      { id: "rf1", prompt: "Qual é o pré-requisito comum dos critérios AAV 2022?", answer: "Diagnóstico de vasculite de pequeno/médio vaso estabelecido e mimetizadores excluídos." },
      { id: "rf2", prompt: "Qual limiar classifica GPA em 2022?", answer: "≥5 pontos, somente após os pré-requisitos." },
      { id: "rf3", prompt: "Qual limiar classifica MPA em 2022?", answer: "≥5 pontos, após diagnóstico de vasculite e exclusão de mimetizadores." },
      { id: "rf4", prompt: "Qual limiar classifica EGPA em 2022?", answer: "≥6 pontos, com vasculite estabelecida e mimetizadores excluídos." },
      { id: "rf5", prompt: "Qual é o critério de entrada do LES 2019?", answer: "ANA ≥1:80 ao menos uma vez; depois exige ≥10 pontos e ao menos um critério clínico atribuível." },
      { id: "rf6", prompt: "Como somar itens do mesmo domínio no LES 2019?", answer: "Use apenas o item de maior peso dentro de cada domínio." },
      { id: "rf7", prompt: "Qual é o requisito absoluto da classificação GCA 2022?", answer: "Idade ≥50 anos ao diagnóstico; limiar total ≥6 pontos." },
      { id: "rf8", prompt: "Ameaça visual na GCA espera score ou biópsia?", answer: "Não. Tratamento e proteção da visão vêm antes; confirmação segue em paralelo." },
      { id: "rf9", prompt: "Qual tratamento é eixo da crise renal esclerodérmica?", answer: "IECA iniciado/titulado prontamente, com monitorização estreita e suporte de órgão." },
      { id: "rf10", prompt: "Glicocorticoide em alta dose é inofensivo na esclerose sistêmica?", answer: "Não. Associa-se a maior risco de crise renal e não deve ser usado por reflexo." },
      { id: "rf11", prompt: "Hemoptise é necessária para DAH?", answer: "Não. Hipoxemia, infiltrado difuso e queda de hemoglobina podem ser suficientes para suspeitar." },
      { id: "rf12", prompt: "Qual amostra exige transporte aquecido?", answer: "Crioglobulina; o tubo deve permanecer aquecido até separação adequada." },
      { id: "rf13", prompt: "Qual padrão clássico de PAN no rim?", answer: "Isquemia/hipertensão renovascular por médio vaso, sem glomerulonefrite pauci-imune." },
      { id: "rf14", prompt: "Qual é a tríade operacional do anti-MDA5?", answer: "Fenótipo cutâneo/artrite, DPI rapidamente progressiva e CK possivelmente normal." },
      { id: "rf15", prompt: "O que MAS-2016 exige?", answer: "Febre em AIJ sistêmica conhecida/suspeita, ferritina >684 e ≥2 de: plaquetas ≤181, AST >48, TG >156, fibrinogênio ≤360." },
      { id: "rf16", prompt: "Ferritina extrema confirma MAS?", answer: "Não. Use tendência, citopenias, AST, TG, fibrinogênio, órgão e gatilhos." },
      { id: "rf17", prompt: "Qual terapia combinada EULAR cita para CAPS?", answer: "Heparina + glicocorticoide + plasmaférese ou IVIG, além de tratar o precipitante, individualizando sangramento." },
      { id: "rf18", prompt: "Por que anticoagulação no Behçet pulmonar exige cautela?", answer: "Pode coexistir aneurisma de artéria pulmonar com alto risco de hemorragia." },
      { id: "rf19", prompt: "Qual dupla ameaça a intubação na AR?", answer: "Artrite cricoaritenoide e instabilidade atlantoaxial C1–C2." },
      { id: "rf20", prompt: "PCR normal exclui Takayasu ativa?", answer: "Não. Marcadores podem ser discordantes; integre clínica e imagem vascular." },
      { id: "rf21", prompt: "ANCA positivo em endocardite é possível?", answer: "Sim. Infecção/endocardite pode mimetizar AAV com ANCA, GN e consumo de complemento." },
      { id: "rf22", prompt: "Qual pergunta organiza o neuro-LES?", answer: "O mecanismo é inflamatório, trombótico/aPL, infeccioso, metabólico ou medicamentoso?" },
      { id: "rf23", prompt: "Qual é a função do FFS 2009?", answer: "Prognóstico em vasculites necrosantes sistêmicas; não diagnostica e não decide terapia isoladamente." },
      { id: "rf24", prompt: "Qual regra Turbo encerra o caso?", answer: "Nomeie um órgão ameaçado, um mimetizador letal e um dado que mudaria sua conduta." }
    ],

    cases: [
      { id: "rc1", title: "Caso 1 — Pulmão–rim e sopro", vignette: "Homem com febre, hemoptise, IRA, sedimento ativo, PR3-ANCA positivo e novo sopro cardíaco.", options: ["Fechar GPA pelo PR3", "Colher culturas/eco e tratar pulmão-rim mantendo endocardite no diferencial", "Ignorar o sopro", "Aplicar score sem investigar infecção"], correct: 1, explanation: "Endocardite pode mimetizar AAV; a proteção de órgão e a investigação infecciosa devem ocorrer juntas.", pearl: "ANCA não esteriliza hemocultura." },
      { id: "rc2", title: "Caso 2 — Visão em risco", vignette: "Mulher de 74 anos com amaurose fugaz, claudicação mandibular e cefaleia temporal nova.", options: ["Esperar biópsia", "Tratar GCA com ameaça visual e confirmar em paralelo", "Usar apenas aspirina", "Excluir se VHS 38"], correct: 1, explanation: "O risco visual é tempo-dependente e não espera confirmação.", pearl: "O alvo imediato é proteger o outro olho." },
      { id: "rc3", title: "Caso 3 — ES, PA e creatinina", vignette: "Paciente com esclerose sistêmica difusa precoce após alta dose de glicocorticoide apresenta PA nova 170/105, cefaleia e creatinina crescente.", options: ["Aumentar glicocorticoide", "Iniciar fluxo de IECA e acionar Nefro/Reumato", "Aguardar biópsia", "Tratar como PTI"], correct: 1, explanation: "O cenário é clássico de crise renal esclerodérmica.", pearl: "Compare com a PA basal; elevação relativa pode ser crítica." },
      { id: "rc4", title: "Caso 4 — Still e queda de fibrinogênio", vignette: "Doença de Still com febre persistente; ferritina triplica, plaquetas e fibrinogênio caem, AST sobe e surge confusão.", options: ["Flare simples", "Suspeitar MAS e tratar gatilhos/hiperinflamação urgentemente", "Esperar hemofagocitose", "Excluir por cultura positiva"], correct: 1, explanation: "A tendência e a disfunção orgânica sustentam MAS mesmo antes de todos os critérios.", pearl: "No MAS, a direção dos marcadores é parte do diagnóstico." },
      { id: "rc5", title: "Caso 5 — Trombose multiorgânica", vignette: "Puérpera com livedo, IRA, isquemia digital, trombocitopenia e aPL conhecido; deterioração em quatro dias.", options: ["Aguardar 12 semanas", "Acionar fluxo de CAPS e tratar precipitantes", "Diagnosticar apenas CIVD", "Suspender toda anticoagulação sem avaliar sangramento"], correct: 1, explanation: "CAPS é emergência multiorgânica; confirmação longitudinal não pode atrasar cuidado.", pearl: "Trombose, inflamação e gatilho são três alvos." },
      { id: "rc6", title: "Caso 6 — CK normal, pulmão grave", vignette: "Mulher com pápulas de Gottron, úlceras digitais, artrite, CK normal e piora hipoxêmica rápida com vidro fosco.", options: ["Excluir miosite", "Suspeitar anti-MDA5/DPI-RP e investigar infecção em paralelo", "Tratar só pneumonia bacteriana", "Aguardar fraqueza"], correct: 1, explanation: "Anti-MDA5 pode ser amiopático e pulmão-dominante.", pearl: "Pouco músculo não significa pouco risco." },
      { id: "rc7", title: "Caso 7 — Dor abdominal e mononeurite", vignette: "Homem com dor abdominal desproporcional, livedo, mononeurite e hipertensão; EAS sem sedimento glomerular.", options: ["PAN é plausível; fazer imagem vascular e rastrear HBV", "GPA confirmada", "Anti-GBM", "Apenas neuropatia diabética"], correct: 0, explanation: "O fenótipo de médio vaso sem GN favorece PAN.", pearl: "Calibre vascular organiza o mapa." },
      { id: "rc8", title: "Caso 8 — Púrpura, C4 baixo e teste negativo", vignette: "Púrpura, neuropatia, proteinúria, C4 muito baixo e HCV; crioglobulina veio negativa após transporte sem aquecimento.", options: ["Excluir crioglobulinemia", "Repetir com técnica aquecida e investigar órgão/gatilho", "Diagnosticar MPA", "Ignorar HCV"], correct: 1, explanation: "O erro pré-analítico pode causar falso-negativo.", pearl: "A amostra também precisa de cuidado crítico." },
      { id: "rc9", title: "Caso 9 — Behçet e hemoptise", vignette: "Homem com úlceras orais/genitais, trombose venosa e hemoptise; angioTC ainda não realizada.", options: ["Anticoagular imediatamente sem imagem", "Excluir aneurisma pulmonar e discutir inflamação/anticoagulação", "Dar apenas antibiótico", "Diagnosticar TEP simples"], correct: 1, explanation: "Aneurisma de artéria pulmonar muda o risco hemorrágico.", pearl: "Trombo no Behçet não é um trombo comum." },
      { id: "rc10", title: "Caso 10 — Estridor na policondrite", vignette: "Paciente com condrite auricular recorrente apresenta estridor e piora ao deitar; será levado para tomografia com sedação.", options: ["Sedação rotineira", "Acionar via aérea difícil e planejar resgate antes de sedar", "Nebulização e alta", "Ignorar traqueomalácia"], correct: 1, explanation: "Perda de tônus pode precipitar colapso dinâmico.", pearl: "Planeje antes de retirar a respiração espontânea." },
      { id: "rc11", title: "Caso 11 — AR e intubação", vignette: "Paciente com AR erosiva de longa data, dor cervical, parestesias e disfonia precisa de intubação.", options: ["Hiperextender pescoço", "Proteger coluna, avaliar C1–C2/laringe e planejar via aérea", "Usar qualquer técnica sem avaliação", "Tratar como ansiedade"], correct: 1, explanation: "Instabilidade atlantoaxial e cricoaritenoide podem coexistir.", pearl: "Voz e pescoço são sinais de via aérea." },
      { id: "rc12", title: "Caso 12 — Neuro-LES", vignette: "Mulher com LES apresenta convulsão, febre, plaquetas baixas e aPL triplo; RM mostra múltiplos infartos.", options: ["Imunossuprimir sem investigar", "Separar trombótico, inflamatório e infeccioso antes de definir eixo", "Diagnosticar psicose", "Ignorar aPL"], correct: 1, explanation: "O mecanismo pode ser SAF/CAPS, inflamação ou infecção; a terapia difere.", pearl: "No neuro-LES, atribuição é ação." }
    ],

    references: [
      { id: "eular-aav-2022", group: "AAV", year: "2022/2024", title: "EULAR recommendations for management of ANCA-associated vasculitis", note: "Indução, manutenção, glicocorticoide, rituximabe/ciclofosfamida e cenários de plasmaférese.", url: "https://ard.bmj.com/content/83/1/30" },
      { id: "kdigo-aav-2024", group: "AAV renal", year: "2024", title: "KDIGO Clinical Practice Guideline for ANCA-Associated Vasculitis", note: "Glomerulonefrite por AAV, indução, plasmaférese e seguimento renal.", url: "https://kdigo.org/guidelines/anca-associated-vasculitis/" },
      { id: "kdigo-gn-2021", group: "Glomerular", year: "2021", title: "KDIGO Clinical Practice Guideline for Glomerular Diseases", note: "Doença anti-GBM e glomerulopatias por imunocomplexos.", url: "https://kdigo.org/guidelines/gd/" },
      { id: "eular-aps-2019", group: "SAF/CAPS", year: "2019", title: "EULAR recommendations for antiphospholipid syndrome in adults", note: "CAPS: terapia combinada e tratamento do fator precipitante.", url: "https://ard.bmj.com/content/78/10/1296" },
      { id: "acr-eular-aps-2023", group: "SAF", year: "2023", title: "ACR/EULAR antiphospholipid syndrome classification criteria", note: "Domínios clínicos/laboratoriais para classificação; não são diagnóstico emergencial.", url: "https://ard.bmj.com/content/82/10/1258" },
      { id: "acr-eular-gca-2022", group: "GCA", year: "2022", title: "ACR/EULAR classification criteria for giant cell arteritis", note: "Idade ≥50 anos, itens ponderados e limiar ≥6 para pesquisa.", url: "https://ard.bmj.com/content/81/12/1647" },
      { id: "eular-lvv-imaging-2023", group: "Grandes vasos", year: "2023", title: "EULAR recommendations for imaging in large vessel vasculitis", note: "Ultrassom, RM, TC e PET na avaliação de GCA/Takayasu.", url: "https://ard.bmj.com/content/83/6/741" },
      { id: "eular-ssc-2023", group: "Esclerose sistêmica", year: "2023/2024", title: "EULAR recommendations for treatment of systemic sclerosis", note: "Inclui crise renal esclerodérmica e manejo por domínios.", url: "https://ard.bmj.com/content/early/2024/10/17/ard-2024-226430" },
      { id: "acr-sard-ild-2023", group: "DPI autoimune", year: "2023", title: "ACR guideline for treatment of SARD-associated ILD", note: "DPI em ES, AR e miopatias, incluindo DPI rapidamente progressiva.", url: "https://rheumatology.org/interstitial-lung-disease-guideline" },
      { id: "eular-acr-hlh-2022", group: "HLH/MAS", year: "2022/2023", title: "EULAR/ACR points to consider for suspected HLH/MAS", note: "Reconhecimento precoce, investigação de gatilhos, tratamento e monitorização.", url: "https://pubmed.ncbi.nlm.nih.gov/37486733/" },
      { id: "mas-2016", group: "MAS", year: "2016", title: "EULAR/ACR/PRINTO classification criteria for MAS in systemic JIA", note: "Ferritina >684 e dois de quatro critérios no contexto validado.", url: "https://www.pedrheumatology.com/pdf/2016_MAS_Criteria.pdf" },
      { id: "eular-sle-2023", group: "LES", year: "2023", title: "EULAR recommendations for management of systemic lupus erythematosus", note: "Doença ameaçadora de órgão, neuro-LES, hematológico e nefrite.", url: "https://ard.bmj.com/content/83/1/15" },
      { id: "acr-ln-2024", group: "Nefrite lúpica", year: "2024/2025", title: "ACR guideline for screening, treatment and management of lupus nephritis", note: "Biópsia, terapias combinadas e monitorização.", url: "https://acrjournals.onlinelibrary.wiley.com/doi/10.1002/art.43212" },
      { id: "kdigo-ln-2024", group: "Nefrite lúpica", year: "2024", title: "KDIGO Clinical Practice Guideline for Lupus Nephritis", note: "Classificação histológica, indução, manutenção e proteção renal.", url: "https://kdigo.org/guidelines/lupus-nephritis/" },
      { id: "ers-eular-ctd-ild-2025", group: "DPI-CTD", year: "2025/2026", title: "ERS/EULAR clinical practice guidelines for CTD-associated ILD", note: "Rastreamento, diagnóstico, monitorização e tratamento de DPI autoimune.", url: "https://publications.ersnet.org/lookup/doi/10.1183/13993003.02533-2024" },
      { id: "eular-iim-2017", group: "Miopatias", year: "2017", title: "EULAR/ACR classification criteria for idiopathic inflammatory myopathies", note: "Fenótipos e critérios de miopatia inflamatória.", url: "https://ard.bmj.com/content/76/12/1955" },
      { id: "acr-vf-pan-2021", group: "PAN", year: "2021", title: "ACR/Vasculitis Foundation guideline for polyarteritis nodosa", note: "Diagnóstico, gravidade, imagem vascular e tratamento.", url: "https://pubmed.ncbi.nlm.nih.gov/34235884/" },
      { id: "eular-cryo-2009", group: "Crioglobulinemia", year: "2009", title: "EULAR recommendations for small and medium vessel vasculitis", note: "Contexto de vasculite crioglobulinêmica e tratamento do gatilho.", url: "https://ard.bmj.com/content/68/3/310" },
      { id: "eular-behcet-2018", group: "Behçet", year: "2018", title: "EULAR recommendations for management of Behçet syndrome", note: "Aneurisma pulmonar, trombose e cautela com anticoagulação.", url: "https://ard.bmj.com/content/77/6/808" },
      { id: "relapsing-polychondritis-review", group: "Policondrite", year: "2025", title: "Relapsing polychondritis: tracheobronchial involvement", note: "Imagem dinâmica, broncoscopia, colapso e intervenção de via aérea.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11833600/" },
      { id: "ra-cervical-review", group: "AR / via aérea", year: "2022", title: "Perioperative and anesthetic management of rheumatoid arthritis", note: "Instabilidade cervical, cricoaritenoide e planejamento de intubação.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9271718/" },
      { id: "eular-lvv-2018", group: "Grandes vasos", year: "2018/2020", title: "EULAR recommendations for management of large vessel vasculitis", note: "GCA/Takayasu, imunossupressão e decisões vasculares.", url: "https://ard.bmj.com/content/79/1/19" },
      { id: "acr-eular-takayasu-2022", group: "Takayasu", year: "2022", title: "ACR/EULAR classification criteria for Takayasu arteritis", note: "Critérios ponderados de pesquisa e imagem vascular.", url: "https://ard.bmj.com/content/81/12/1654" },
      { id: "acr-eular-sle-2019", group: "LES", year: "2019", title: "EULAR/ACR classification criteria for systemic lupus erythematosus", note: "ANA como entrada, domínios ponderados e limiar ≥10.", url: "https://ard.bmj.com/content/78/9/1151" },
      { id: "acr-eular-gpa-2022", group: "GPA", year: "2022", title: "ACR/EULAR classification criteria for granulomatosis with polyangiitis", note: "Itens ponderados, pré-requisitos e limiar ≥5.", url: "https://ard.bmj.com/content/81/3/315" },
      { id: "acr-eular-mpa-2022", group: "MPA", year: "2022", title: "ACR/EULAR classification criteria for microscopic polyangiitis", note: "Itens ponderados, pré-requisitos e limiar ≥5.", url: "https://ard.bmj.com/content/81/3/321" },
      { id: "acr-eular-egpa-2022", group: "EGPA", year: "2022", title: "ACR/EULAR classification criteria for eosinophilic granulomatosis with polyangiitis", note: "Itens ponderados, pré-requisitos e limiar ≥6.", url: "https://ard.bmj.com/content/81/3/309" }
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

  window.ANTIGRAVITY_CRITICAL_MODULE = deepFreeze(catalog);
  window.ANTIGRAVITY_RHEUMATOLOGY = window.ANTIGRAVITY_CRITICAL_MODULE;
  document.dispatchEvent(new CustomEvent("antigravity:rheumatology-ready", {
    detail: window.ANTIGRAVITY_RHEUMATOLOGY
  }));
})();
