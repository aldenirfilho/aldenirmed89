"use strict";

window.SEPSE_ULTRA_EXPERT = {
  meta: {
    version: "0.1.0-local",
    updatedAt: "2026-08-03",
    sourcesVerifiedAt: "2026-08-03",
    storagePrefix: "antigravity:sepse-ultra-expert:v1",
    readyEvent: "antigravity:sepse-ultra-expert-ready"
  },

  burden: {
    annualDeathsAssociated: 21400000,
    estimateYear: 2021,
    publicationYear: 2025,
    sourceLabel: "GBD 2021 · Lancet Global Health 2025",
    sourceUrl: "https://doi.org/10.1016/S2214-109X(25)00356-0",
    caveat: "Projeção linear didática baseada em mortes associadas à sepse; não é contagem observada em tempo real."
  },

  timeline: [
    {
      id: "0-10",
      label: "0–10 min",
      title: "Reconheça a emergência e estabilize",
      priority: "Instabilidade vem antes do escore. Defina rapidamente: choque, hipoxemia, rebaixamento e ameaça imediata.",
      actions: [
        "ABCDE, monitorização, acessos, glicemia, temperatura, diurese e exame dirigido à perfusão.",
        "Declare a probabilidade de infecção: possível, provável ou definida; procure mimetizadores em paralelo.",
        "Acione código sepse/huddle e equipes críticas quando o sistema local dispuser.",
        "Se choque instável, inicie suporte hemodinâmico imediatamente; fluido e vasopressor podem ser simultâneos, caso a caso."
      ],
      reassess: "Em 10 minutos: pressão confiável, consciência, pele/tempo de enchimento capilar, oxigenação, diurese e trajetória.",
      never: "Não espere SOFA completo, lactato, imagem ou acesso central para tratar instabilidade evidente.",
      sourceIds: ["ssc2026", "hemodynamic-guide"]
    },
    {
      id: "10-60",
      label: "10–60 min",
      title: "Cultive, trate a infecção e proteja a perfusão",
      priority: "Choque ou sepse provável/definida: antimicrobiano imediato, idealmente em até 1 hora.",
      actions: [
        "Colha hemoculturas e amostras do foco o mais cedo possível, idealmente antes do antimicrobiano, sem atraso evitável.",
        "Prescreva esquema empírico por foco, gravidade, hospedeiro, culturas prévias, risco MDR e antibiograma local.",
        "Garanta dose de ataque e via adequadas; registre função renal/hepática, peso e terapias extracorpóreas.",
        "Meça lactato quando indicado e use-o junto de perfusão clínica, não como prova isolada de hipovolemia."
      ],
      reassess: "Ao completar 60 minutos: antimicrobiano administrado ou razão documentada, culturas úteis, foco provável e plano hemodinâmico.",
      never: "Não aplicar a meta de 1 hora indistintamente à baixa probabilidade de infecção sem choque.",
      sourceIds: ["ssc2026", "antibiotic-framework"]
    },
    {
      id: "1-3h",
      label: "1–3 h",
      title: "Feche o primeiro ciclo de ressuscitação",
      priority: "A intervenção só está completa quando sua resposta e seu dano potencial foram medidos.",
      actions: [
        "Em hipoperfusão induzida por sepse/choque, considere pelo menos 30 mL/kg de cristaloide no período, individualizando contexto e peso.",
        "Prefira cristaloide balanceado na maioria; traumatismo cranioencefálico é exceção relevante.",
        "Use medidas dinâmicas de responsividade e procure sinais de intolerância/congestão antes de repetir volume.",
        "Se possível sepse sem choque, complete investigação rápida; persistindo suspeita, administre antimicrobiano até 3 horas da suspeita."
      ],
      reassess: "Perfusão, pressão, débito estimado, oxigenação, congestão, diurese, lactato seriado e necessidade de UTI.",
      never: "Não continuar bolus apenas porque o lactato ainda não normalizou.",
      sourceIds: ["ssc2026", "hemodynamic-guide", "antibiotic-framework"]
    },
    {
      id: "3-6h",
      label: "3–6 h",
      title: "Controle a anatomia e refine o fenótipo",
      priority: "Quando há foco intervencionista, controle precoce é parte central do tratamento — idealmente em até 6 horas.",
      actions: [
        "Drenagem, desbridamento, retirada de dispositivo, descompressão ou cirurgia conforme anatomia e risco.",
        "Reavalie choque vasoplégico, hipovolêmico, cardiomiopático, obstrutivo ou misto com fisiologia integrada.",
        "Noradrenalina é primeira linha; adicione vasopressina com necessidade crescente e adrenalina se PAM inadequada apesar de ambas.",
        "Em choque com necessidade persistente de vasopressor, considere corticosteroide IV conforme protocolo e contraindicações."
      ],
      reassess: "Confirme eficácia do controle do foco e se a trajetória de suporte está caindo, estável ou escalando.",
      never: "Não interpretar 'até 6 horas' como permissão para aguardar quando a intervenção é emergencial.",
      sourceIds: ["ssc2026", "hemodynamic-guide"]
    },
    {
      id: "6-24h",
      label: "6–24 h",
      title: "Proteja órgãos e reabra hipóteses",
      priority: "Deterioração apesar do pacote inicial exige auditoria, não apenas mais do mesmo.",
      actions: [
        "Revise ventilação protetora, perfusão renal, glicemia, tromboprofilaxia, nutrição e risco de sangramento.",
        "Repita exame, microbiologia e imagem dirigida; procure foco não controlado e diagnósticos alternativos.",
        "Documente alvos de cada suporte e critérios de redução/interrupção.",
        "Acione UTI precocemente quando indicada; a SSC sugere admissão em até 6 horas para quem necessita."
      ],
      reassess: "SOFA/trajetória orgânica, dose de vasopressor, balanço, foco, culturas e necessidade de resgate.",
      never: "Não rotular como choque refratário antes de auditar bomba, tanque, tubos, foco e diagnóstico.",
      sourceIds: ["ssc2026", "hemodynamic-guide"]
    },
    {
      id: "24-72h",
      label: "24–72 h",
      title: "Desescale o que não é mais necessário",
      priority: "Rapidez inicial e stewardship são complementares.",
      actions: [
        "Reavalie diariamente se a síndrome continua infecciosa e suspenda terapia empírica quando alternativa for demonstrada/fortemente suspeita.",
        "Desescale com microbiologia/sensibilidade e considere desescalada mesmo com culturas negativas conforme resposta e probabilidade.",
        "Com foco controlado, prefira duração mais curta quando sustentada pelo sítio e pela evolução.",
        "Após a fase aguda, avalie remoção ativa de fluido por edema, peso, balanço, função cardiorrespiratória e suporte vigente."
      ],
      reassess: "Necessidade diária de antimicrobiano, cateter, ventilação, sedação, vasopressor, fluido e terapia renal.",
      never: "Não iniciar desressuscitação ativa durante escalada de vasopressor ou necessidade contínua de expansão.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "pos",
      label: "Pós-agudo",
      title: "Transforme sobrevivência em recuperação",
      priority: "Fraqueza, déficit cognitivo, sofrimento emocional e desorganização medicamentosa precisam de um plano visível.",
      actions: [
        "Reconciliação medicamentosa e resumo verbal/escrito da sepse, do foco e das intervenções.",
        "Avalie déficits físicos, cognitivos, emocionais, de deglutição, nutrição e autocuidado.",
        "Ofereça seguimento pós-doença crítica e reabilitação especialmente após ventilação invasiva prolongada.",
        "Defina responsável, prazo, exames, sinais de alarme e apoio à família."
      ],
      reassess: "O plano é compreensível, factível, compartilhado e tem responsáveis identificados?",
      never: "Não chamar de 'alta resolvida' quando persistem sequelas ou pendências sem dono.",
      sourceIds: ["ssc2026"]
    }
  ],

  phenotypePolicy: "Os perfis hemodinâmicos são rótulos operacionais didáticos, não uma classificação validada ou protocolo oficial. SENECA e CTS permanecem descritivos/investigacionais e não selecionam tratamento automaticamente.",

  phenotypes: {
    hemodynamic: [
      {
        id: "vasoplegic",
        icon: "🔥",
        name: "Vasoplégico",
        subtitle: "Tônus vascular inadequado domina o choque",
        mechanism: "Vasodilatação, disfunção endotelial, óxido nítrico, hiporresponsividade adrenérgica e má distribuição do fluxo.",
        clues: ["pressão diastólica baixa/pulso amplo", "extremidades inicialmente quentes podem ocorrer", "necessidade de vasopressor apesar de volume avaliado", "hipoperfusão pode coexistir com débito alto"],
        changes: ["priorize noradrenalina sem atraso", "avalie vasopressina com escalada de noradrenalina", "não confunda pressão corrigida com perfusão restaurada"],
        trap: "Mais volume não corrige vasoplegia estabelecida e pode aumentar edema/congestão.",
        evidence: "Fenótipo fisiológico acionável; integrar clínica, pressão confiável e ecocardiografia/monitorização conforme disponibilidade.",
        sourceIds: ["ssc2026", "hemodynamic-guide"]
      },
      {
        id: "volume-responsive",
        icon: "💧",
        name: "Baixa pré-carga responsiva",
        subtitle: "O paciente pode aumentar fluxo com expansão",
        mechanism: "Redução de volume efetivo, venodilatação, perdas e baixa pré-carga limitam o volume sistólico.",
        clues: ["manobra dinâmica positiva", "aumento mensurável de volume sistólico/débito", "ausência de intolerância importante", "contexto de perdas ou vasodilatação"],
        changes: ["use pequenos ciclos com alvo", "meça benefício e dano após cada intervenção", "interrompa quando responsividade desaparecer ou tolerância piorar"],
        trap: "Hipotensão, VCI pequena ou taquicardia isoladas não provam responsividade nem segurança para fluidos.",
        evidence: "SSC 2026 sugere medidas dinâmicas sobre exame/medidas estáticas isoladas; certeza baixa.",
        sourceIds: ["ssc2026", "hemodynamic-guide"]
      },
      {
        id: "cardiomyopathic",
        icon: "🫀",
        name: "Cardiomiopático",
        subtitle: "Disfunção cardíaca limita entrega de fluxo",
        mechanism: "Depressão sistólica e/ou diastólica, alteração de acoplamento ventrículo-arterial, isquemia, inflamação e efeito de catecolaminas.",
        clues: ["baixo débito/volume sistólico", "hipoperfusão apesar de PAM corrigida", "VE ou VD disfuncional", "arritmia, isquemia ou excesso de pós-carga"],
        changes: ["confirme volume e PAM adequados", "considere inotrópico apenas com hipoperfusão persistente", "trate arritmia/isquemia e reduza carga iatrogênica"],
        trap: "Fração de ejeção baixa isolada não prova baixo débito nem indica automaticamente dobutamina.",
        evidence: "SSC 2026: inotrópico é sugestão condicional, certeza muito baixa, para disfunção cardíaca com hipoperfusão persistente.",
        sourceIds: ["ssc2026", "hemodynamic-guide"]
      },
      {
        id: "right-obstructive",
        icon: "🫁",
        name: "VD/obstrutivo",
        subtitle: "O circuito direito ou uma obstrução limita o enchimento/fluxo",
        mechanism: "Sobrecarga aguda de VD, TEP, tamponamento, pneumotórax hipertensivo, auto-PEEP ou pressão intratorácica/abdominal elevada.",
        clues: ["VD dilatado/disfuncional", "pressão venosa elevada/congestão", "hipoxemia ou ventilação de alta pressão", "choque desproporcional ao foco aparente"],
        changes: ["trate a causa mecânica", "evite volume indiscriminado", "revise ventilador, PEEP, pressão abdominal e tromboembolismo"],
        trap: "Chamar todo choque em paciente infectado de distributivo atrasa causas reversíveis em minutos.",
        evidence: "Diagnóstico diferencial fisiológico; não é um subtipo SENECA.",
        sourceIds: ["ssc2026", "hemodynamic-guide"]
      },
      {
        id: "mixed",
        icon: "🧩",
        name: "Misto e dinâmico",
        subtitle: "Fenótipos coexistem e mudam ao longo das horas",
        mechanism: "Vasoplegia, baixa pré-carga, disfunção biventricular, ventilação e comorbidades interagem.",
        clues: ["resposta parcial a uma intervenção", "sinais discordantes", "mudança após intubação, fluido ou vasopressor", "órgãos com trajetórias diferentes"],
        changes: ["reavalie depois de cada intervenção", "use múltiplas medidas convergentes", "trate o componente dominante sem esquecer os demais"],
        trap: "Fixar o fenótipo inicial e repetir a mesma terapia apesar da mudança fisiológica.",
        evidence: "Modelo clínico integrativo; exige reclassificação seriada.",
        sourceIds: ["ssc2026", "hemodynamic-guide"]
      }
    ],
    seneca: [
      {
        id: "alpha",
        icon: "α",
        name: "SENECA α",
        subtitle: "Menor carga de anormalidades no cluster original",
        mechanism: "Perfil com menos disfunção laboratorial e menor necessidade relativa de vasopressor no estudo derivador.",
        clues: ["mais frequente no estudo original", "menos anormalidades laboratoriais", "menor mortalidade relativa do conjunto"],
        changes: ["use para entender heterogeneidade", "mantenha manejo guiado por fisiologia e foco", "não interprete como sepse leve garantida"],
        trap: "O cluster é retrospectivo; um paciente α pode deteriorar e precisa da mesma vigilância clínica.",
        evidence: "SENECA/JAMA 2019; descritivo e prognóstico, não prescritivo.",
        sourceIds: ["seneca", "seneca-validation"]
      },
      {
        id: "beta",
        icon: "β",
        name: "SENECA β",
        subtitle: "Idade, comorbidades e disfunção renal se destacam",
        mechanism: "Cluster enriquecido por pacientes mais velhos, doença crônica e sinais de disfunção renal.",
        clues: ["maior carga de doença crônica", "disfunção renal", "vulnerabilidade a dose e volume"],
        changes: ["revise farmacocinética e nefrotóxicos", "avalie tolerância a volume", "planeje recuperação e função basal"],
        trap: "Essas ações decorrem do fenótipo clínico real, não do rótulo β inferido sem classificador validado.",
        evidence: "SENECA/JAMA 2019; generalização e reprodutibilidade limitadas.",
        sourceIds: ["seneca", "seneca-validation"]
      },
      {
        id: "gamma",
        icon: "γ",
        name: "SENECA γ",
        subtitle: "Inflamação e disfunção pulmonar predominantes",
        mechanism: "Perfil com marcadores inflamatórios mais altos e maior comprometimento pulmonar no conjunto original.",
        clues: ["inflamação pronunciada", "disfunção respiratória", "risco de suporte ventilatório"],
        changes: ["proteja o pulmão e procure SDRA", "separe pneumonia, edema e outras causas", "não extrapole para imunomodulação"],
        trap: "Marcador inflamatório alto não identifica sozinho benefício de corticoide ou outra terapia de precisão.",
        evidence: "SENECA/JAMA 2019; hipótese para pesquisa, não algoritmo de tratamento.",
        sourceIds: ["seneca", "seneca-validation"]
      },
      {
        id: "delta",
        icon: "δ",
        name: "SENECA δ",
        subtitle: "Choque, acidose e disfunção hepática/coagulatória",
        mechanism: "Cluster original com maior disfunção hepática, coagulopatia, lactato e gravidade de choque.",
        clues: ["hipotensão/vasopressor", "acidose/lactato", "disfunção hepática", "coagulopatia"],
        changes: ["antecipe suporte intensivo", "audite perfusão e foco agressivamente", "ajuste drogas e procedimentos à falência orgânica"],
        trap: "Maior risco observado não autoriza terapias experimentais nem prognóstico determinista.",
        evidence: "Maior mortalidade no cluster original; validação externa multicêntrica publicada em 2025 encontrou distribuição e desempenho variáveis.",
        sourceIds: ["seneca", "seneca-validation"]
      }
    ],
    molecular: [
      {
        id: "cts1",
        icon: "C1",
        name: "CTS1",
        subtitle: "Inflamação, endotélio e neutrófilos imaturos",
        mechanism: "Consenso transcriptômico 2025 agregando SRS1, MARS2 e inflammopathic; vias inflamatórias, endotélio e neutrófilos se destacam.",
        clues: ["exige assinatura de expressão gênica", "não é reconhecível com segurança por aparência clínica", "pode apoiar enriquecimento de ensaios"],
        changes: ["nenhuma terapia automática hoje", "use somente em pesquisa validada", "não substituir critérios clínicos"],
        trap: "Inferir CTS1 por proteína C reativa ou fenótipo hiperinflamatório é inválido.",
        evidence: "Nature Medicine 2025; framework translacional, implicações clínicas ainda limitadas.",
        sourceIds: ["transcriptomic"]
      },
      {
        id: "cts2",
        icon: "C2",
        name: "CTS2",
        subtitle: "Heme, fibrinólise e assinaturas plaquetárias/eosinofílicas",
        mechanism: "Integra SRS2, MARS1 e coagulopathic; apresentou maior gravidade em partes das coortes.",
        clues: ["classificação molecular", "trajetória pode mudar", "sinais pós-hoc de interação terapêutica exigem confirmação"],
        changes: ["não negar corticosteroide indicado pela SSC", "não prescrever por cluster", "priorizar ensaios prospectivos"],
        trap: "Análise pós-hoc não supera recomendação clínica nem valida biomarcador de rotina.",
        evidence: "Nature Medicine 2025; potencial de desenho de ensaio, não standard of care.",
        sourceIds: ["transcriptomic"]
      },
      {
        id: "cts3",
        icon: "C3",
        name: "CTS3",
        subtitle: "Interferon, linfócitos e monócitos não clássicos",
        mechanism: "Agrupa assinaturas MARS3/adaptive com sinalização de interferon e características imunes distintas.",
        clues: ["classificação por painel gênico", "sobreposição e transição ao longo da UTI", "não equivale a imunidade 'boa' ou 'ruim'"],
        changes: ["nenhuma conduta automática", "registrar como evidência emergente", "separar prognóstico de predição de resposta"],
        trap: "Converter endótipo molecular em caricatura clínica ou protocolo de imunomodulação.",
        evidence: "Nature Medicine 2025; validações e implementação prospectiva ainda necessárias.",
        sourceIds: ["transcriptomic"]
      }
    ]
  },

  organSupport: [
    { id: "respiratory", icon: "🫁", title: "Respiratório", action: "Oxigenação contextual; cânula nasal de alto fluxo é sugerida sobre oxigênio convencional e VNI inicial em hipoxemia selecionada. Em SDRA, VT 6 mL/kg de peso predito e platô ≤30 cmH₂O.", limit: "Não atrasar intubação quando há falha. Prona acordada não deve ser forçada com sedação.", sourceIds: ["ssc2026"] },
    { id: "renal", icon: "🧪", title: "Renal", action: "Evite nefrotóxicos, ajuste antimicrobianos e defina indicação clássica de TRS. Se TRS é necessária, modalidade contínua ou intermitente pode ser usada conforme contexto.", limit: "Não iniciar TRS apenas por LRA sem indicação definitiva.", sourceIds: ["ssc2026"] },
    { id: "hematologic", icon: "🩸", title: "Hematológico", action: "Estratégia transfusional restritiva; tromboprofilaxia farmacológica salvo contraindicação, preferindo heparina de baixo peso molecular à não fracionada.", limit: "Limiar transfusional e anticoagulação devem considerar sangramento, isquemia e procedimentos.", sourceIds: ["ssc2026"] },
    { id: "nutrition", icon: "🍽️", title: "Nutrição/metabólico", action: "Nutrição enteral precoce, idealmente até 72 h quando viável; iniciar insulinoterapia quando glicose ≥180 mg/dL conforme SSC.", limit: "Evite sobrealimentação e hipoglicemia; reavalie tolerância gastrointestinal.", sourceIds: ["ssc2026"] },
    { id: "acidemia", icon: "🧯", title: "Acidemia", action: "A SSC sugere contra bicarbonato com a finalidade de melhorar hemodinâmica ou reduzir vasopressor na acidemia láctica por hipoperfusão. Pode ser considerado no choque com pH ≤7,2 e LRA AKIN 2–3.", limit: "Trate perfusão e causa; monitore sódio, cálcio, CO₂ e volume.", sourceIds: ["ssc2026"] },
    { id: "brain-comfort", icon: "🧠", title: "Cérebro e conforto", action: "Dor, delirium, sono, mobilidade e comunicação com família integram o cuidado. Metas de cuidado devem ser abordadas cedo e revistas com a trajetória.", limit: "Sedação não corrige encefalopatia séptica nem substitui investigação neurológica/metabólica.", sourceIds: ["ssc2026"] },
    { id: "corticosteroid", icon: "💊", title: "Corticosteroide", action: "Em choque séptico com necessidade persistente de vasopressor, corticosteroide IV é sugestão condicional de baixa certeza; siga regime institucional e monitore glicemia, fraqueza e infecção.", limit: "Evite esquema curto em dose muito alta (>400 mg/d de equivalente de hidrocortisona por <3 dias).", sourceIds: ["ssc2026", "steroids2024"] },
    { id: "deresuscitation", icon: "💧", title: "Desressuscitação", action: "Após a fase aguda, considere diurético e, se insuficiente/indicado, ultrafiltração, conforme edema, peso, balanço, coração, pulmão e suporte.", limit: "Não remover volume ativamente durante escalada de vasopressor ou necessidade contínua de expansão.", sourceIds: ["ssc2026"] }
  ],

  frontier: [
    {
      id: "corticosteroid",
      status: "supported",
      badge: "APOIADA · CONDICIONAL",
      title: "Corticosteroide IV",
      mechanism: "Modula resposta inflamatória e pode abreviar choque/necessidade vasopressora em pacientes selecionados.",
      evidence: "SSC 2026 sugere uso no choque séptico; certeza baixa.",
      guardrail: "Necessidade persistente de vasopressor, protocolo institucional, contraindicações e monitorização. Não usar altas doses curtas.",
      sourceIds: ["ssc2026", "steroids2024"]
    },
    {
      id: "methylene-blue",
      status: "insufficient",
      badge: "EVIDÊNCIA INSUFICIENTE",
      title: "Azul de metileno",
      mechanism: "Inibição da via óxido nítrico–guanilato ciclase pode elevar tônus vascular.",
      evidence: "Pode elevar pressão, mas benefício de sobrevida é desconhecido; SSC 2026 não emite recomendação.",
      guardrail: "Não é protocolo universal. Contraindicações no rótulo citado: deficiência de G6PD e hipersensibilidade. Alertas distintos: síndrome serotoninérgica com serotonérgicos/opioides, hemólise e possível subestimação da saturação pela oximetria de pulso.",
      sourceIds: ["ssc2026", "methylene-fda"]
    },
    {
      id: "midodrine",
      status: "insufficient",
      badge: "EVIDÊNCIA INSUFICIENTE",
      title: "Midodrina oral",
      mechanism: "Agonismo alfa periférico proposto para reduzir vasopressor IV em recuperação.",
      evidence: "SSC 2026 considera evidência insuficiente.",
      guardrail: "Não usar como substituto de estabilidade, acesso seguro, controle do foco ou monitorização de choque ativo.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "beta-blockers",
      status: "against",
      badge: "SUGERE CONTRA",
      title: "Betabloqueadores IV",
      mechanism: "Controle de taquicardia e demanda adrenérgica é fisiologicamente atraente.",
      evidence: "SSC 2026 sugere contra esmolol/landiolol como tratamento do choque; certeza muito baixa.",
      guardrail: "Trate causas de taquicardia e não converta estudo selecionado em rotina.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "terlipressin",
      status: "against",
      badge: "SUGERE CONTRA",
      title: "Terlipressina",
      mechanism: "Agonismo vasopressinérgico com ação prolongada.",
      evidence: "SSC 2026 sugere contra; certeza baixa.",
      guardrail: "Não substituir vasopressina/noradrenalina recomendadas com base apenas em disponibilidade ou potência.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "levosimendan",
      status: "against",
      badge: "SUGERE CONTRA",
      title: "Levosimendana",
      mechanism: "Sensibilização ao cálcio e vasodilatação com proposta inotrópica.",
      evidence: "SSC 2026 sugere contra na disfunção cardíaca com hipoperfusão; certeza baixa.",
      guardrail: "Não usar como alternativa automática a dobutamina/adrenalina no fenótipo indicado.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "vitamin-c",
      status: "against",
      badge: "SUGERE CONTRA",
      title: "Vitamina C intravenosa",
      mechanism: "Proposta antioxidante, endotelial e metabólica.",
      evidence: "SSC 2026 sugere contra; certeza baixa.",
      guardrail: "Não apresentar pacote metabólico como cuidado padrão ou livre de dano.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "ivig",
      status: "against",
      badge: "SUGERE CONTRA",
      title: "Imunoglobulina IV",
      mechanism: "Imunomodulação e neutralização de toxinas foram propostas.",
      evidence: "SSC 2026 sugere contra uso em sepse/choque; certeza baixa.",
      guardrail: "Indicações independentes específicas não devem ser confundidas com tratamento rotineiro da sepse.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "blood-purification",
      status: "against",
      badge: "SUGERE CONTRA",
      title: "Purificação sanguínea",
      mechanism: "Remoção extracorpórea de mediadores por hemoperfusão, hemofiltração de alta dose ou troca plasmática.",
      evidence: "SSC 2026 sugere contra; certeza muito baixa. Polimixina B também recebe sugestão contra, certeza baixa.",
      guardrail: "Não confundir TRS por indicação renal/metabólica com purificação experimental da sepse.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "vitamin-d-probiotics",
      status: "against",
      badge: "SUGERE CONTRA",
      title: "Vitamina D e probióticos",
      mechanism: "Reposição/imunomodulação e manipulação do microbioma foram propostas.",
      evidence: "SSC 2026 sugere contra como tratamento da sepse; certeza muito baixa.",
      guardrail: "Isso não impede reposição nutricional por outra indicação documentada.",
      sourceIds: ["ssc2026"]
    }
  ],

  cases: [
    {
      id: "case-1",
      title: "Pneumonia provável com choque instável",
      prompt: "Homem de 67 anos, febre, confusão, hipoxemia, PAM 52 mmHg, pele moteada e infiltrado pulmonar novo. O acesso central ainda não está disponível. Qual é o melhor primeiro conjunto de decisões?",
      options: [
        "Aguardar acesso central e tomografia antes de antimicrobiano/vasopressor",
        "ABCDE, culturas sem atraso, antimicrobiano imediato, cristaloide individualizado e noradrenalina periférica por protocolo",
        "Administrar 30 mL/kg e só então avaliar necessidade de vasopressor",
        "Calcular qSOFA; tratar apenas se pontuação ≥2"
      ],
      correct: 1,
      feedback: [
        "Incorreta. Aguardar acesso/imagem prolonga choque e tratamento da infecção provável.",
        "Correta. Choque instável exige ações simultâneas, reavaliação frequente e controle do foco.",
        "Incorreta. Na instabilidade grave, vasopressor e fluido podem ser simultâneos; volume não deve atrasar pressão.",
        "Incorreta. qSOFA não é gate diagnóstico nem deve atrasar tratamento."
      ],
      pearl: "O pacote é paralelo: fisiologia, infecção e anatomia caminham juntas.",
      sourceIds: ["ssc2026", "antibiotic-framework", "hemodynamic-guide"]
    },
    {
      id: "case-2",
      title: "Infecção com possibilidade de sepse em investigação",
      prompt: "Mulher de 42 anos, taquicardia, febre baixa, dor abdominal inespecífica, pressão preservada e disfunção orgânica ainda não confirmada. Infecção é possível, mas há diagnósticos alternativos. Qual estratégia é mais adequada?",
      options: [
        "Antimicrobiano de amplo espectro obrigatório em 1 hora para toda suspeita",
        "Nenhuma investigação porque não há choque",
        "Investigação rápida com limite temporal e antimicrobiano em até 3 horas se a preocupação infecciosa persistir",
        "Procalcitonina isolada decide se inicia tratamento"
      ],
      correct: 2,
      feedback: [
        "Incorreta. A SSC 2026 estratifica tempo por choque e probabilidade, evitando automatismo.",
        "Incorreta. Ausência de choque não exclui sepse nem elimina a necessidade de investigação.",
        "Correta. É a via para possível sepse sem choque, com monitorização e gatilhos explícitos.",
        "Incorreta. Avaliação clínica é preferida à procalcitonina para decidir o início."
      ],
      pearl: "Rapidez não significa tratar todas as síndromes inflamatórias como infecção.",
      sourceIds: ["ssc2026", "antibiotic-framework", "sepsis3"]
    },
    {
      id: "case-3",
      title: "Choque que não responde",
      prompt: "Paciente com sepse abdominal segue em escalada de vasopressor. Recebeu fluidos, mas está congesto; a drenagem produziu pouco débito e o ecocardiograma sugere disfunção de VD. Qual é a melhor atitude?",
      options: [
        "Repetir bolus até normalizar lactato",
        "Adicionar terapia experimental antes de reavaliar anatomia",
        "Auditar foco, eficácia da drenagem, responsividade/tolerância, VD, ventilador e diagnósticos obstrutivos",
        "Classificar como SENECA δ e escolher tratamento específico"
      ],
      correct: 2,
      feedback: [
        "Incorreta. Congestão e possível falência de VD tornam volume cego perigoso.",
        "Incorreta. Resgate não precede a auditoria de causas reversíveis e cuidado padrão.",
        "Correta. Choque refratário exige reabrir mecanismo, foco e efeitos iatrogênicos.",
        "Incorreta. SENECA não seleciona terapia à beira-leito."
      ],
      pearl: "Antes de resgatar, explique o choque.",
      sourceIds: ["ssc2026", "hemodynamic-guide"]
    },
    {
      id: "case-4",
      title: "Sobreviveu, mas não voltou ao basal",
      prompt: "Após 12 dias de UTI e 6 dias de ventilação invasiva, paciente está afebril e sem vasopressor, porém fraco, disfágico, ansioso e com medicações novas. Qual plano é mais completo?",
      options: [
        "Alta sem plano porque a infecção resolveu",
        "Manter todas as medicações da UTI até consulta futura",
        "Resumo verbal/escrito, reconciliação, avaliação física/cognitiva/emocional, reabilitação e seguimento com responsáveis",
        "Orientar apenas retorno se houver febre"
      ],
      correct: 2,
      feedback: [
        "Incorreta. Sobrevivência não encerra disfunções e riscos de transição.",
        "Incorreta. Medicamentos iniciados na UTI devem ser reconciliados e desprescritos quando cabível.",
        "Correta. A SSC 2026 integra educação, sequelas, reabilitação e transição.",
        "Incorreta. Sinais de alarme são mais amplos e o seguimento deve ser proativo."
      ],
      pearl: "A última etapa do bundle é devolver continuidade à vida do paciente.",
      sourceIds: ["ssc2026"]
    }
  ],

  questions: [
    {
      id: "q-1",
      title: "Rastreio",
      prompt: "Segundo a SSC 2026, qual ferramenta não deve ser usada isoladamente como rastreio hospitalar de sepse?",
      options: ["NEWS2", "MEWS", "SIRS", "qSOFA"],
      correct: 3,
      feedback: ["Incorreta. NEWS/NEWS2 são preferidos ao qSOFA isolado.", "Incorreta. MEWS é opção preferida ao qSOFA isolado.", "Incorreta. SIRS permanece entre as opções de rastreio preferidas.", "Correta. qSOFA isolado não é rastreio adequado nem teste de exclusão."],
      pearl: "qSOFA alerta risco; não fecha a porta da sepse.",
      sourceIds: ["ssc2026", "sepsis3"]
    },
    {
      id: "q-2",
      title: "Antimicrobiano",
      prompt: "Em provável sepse sem choque, a SSC 2026 recomenda antimicrobiano:",
      options: ["Após 3 horas obrigatoriamente", "Imediato, idealmente em até 1 hora", "Somente após procalcitonina", "Somente após cultura positiva"],
      correct: 1,
      feedback: ["Incorreta. A janela de até 3 horas aplica-se à possível sepse sem choque após investigação rápida.", "Correta. Probável/definida sem choque entra na janela imediata idealmente ≤1 hora.", "Incorreta. Procalcitonina não decide isoladamente o início.", "Incorreta. Cultura positiva não é pré-requisito."],
      pearl: "Tempo depende de choque e probabilidade, não de um relógio único.",
      sourceIds: ["ssc2026", "antibiotic-framework"]
    },
    {
      id: "q-3",
      title: "Fluidos",
      prompt: "Qual interpretação de 30 mL/kg está correta?",
      options: ["Bolus universal obrigatório antes do vasopressor", "Meta a repetir até lactato normal", "Ponto inicial condicional em hipoperfusão/choque, individualizado e reavaliado", "Contraindicado em todo paciente com insuficiência cardíaca"],
      correct: 2,
      feedback: ["Incorreta. Instabilidade pode exigir vasopressor simultâneo e individualização.", "Incorreta. Não perseguir lactato com volume sem fisiologia.", "Correta. Essa é a redação segura da SSC 2026.", "Incorreta. Comorbidade muda estratégia e vigilância, não cria proibição universal."],
      pearl: "Volume é fármaco: indicação, dose, resposta e toxicidade.",
      sourceIds: ["ssc2026", "hemodynamic-guide"]
    },
    {
      id: "q-4",
      title: "Vasopressor",
      prompt: "Paciente permanece hipotenso com noradrenalina em escalada. Qual próximo passo farmacológico é sugerido?",
      options: ["Dopamina", "Vasopressina", "Terlipressina", "Midodrina oral"],
      correct: 1,
      feedback: ["Incorreta. Noradrenalina é preferida à dopamina.", "Correta. A SSC sugere adicionar vasopressina com escalada de noradrenalina.", "Incorreta. A SSC sugere contra terlipressina.", "Incorreta. Evidência para midodrina é insuficiente."],
      pearl: "Evite inventar um limiar universal de dose para adicionar vasopressina.",
      sourceIds: ["ssc2026", "hemodynamic-guide"]
    },
    {
      id: "q-5",
      title: "Foco",
      prompt: "Sobre controle do foco, é correto afirmar:",
      options: ["Antibiótico substitui drenagem se for amplo", "Idealmente deve ocorrer cedo, em até 6 h quando indicado, sem aguardar se emergencial", "Só é necessário após falha de 48 h", "Imagem sempre precede intervenção"],
      correct: 1,
      feedback: ["Incorreta. Terapia sistêmica não corrige anatomia não controlada.", "Correta. Se emergencial, não se deve aguardar o limite de 6 horas.", "Incorreta. Atraso mantém carga infecciosa e choque.", "Incorreta. Imagem não pode atrasar intervenção clínica/operatória óbvia."],
      pearl: "Controle do foco é terapia antimicrobiana anatômica.",
      sourceIds: ["ssc2026"]
    },
    {
      id: "q-6",
      title: "Fronteira",
      prompt: "Qual é a posição da SSC 2026 sobre azul de metileno no choque séptico refratário?",
      options: ["Recomendação forte a favor", "Sugestão condicional a favor", "Evidência insuficiente para recomendar", "Recomendação forte contra"],
      correct: 2,
      feedback: ["Incorreta. Não há recomendação forte a favor.", "Incorreta. Não há sugestão formal a favor.", "Correta. Pressão pode melhorar, mas sobrevida e segurança permanecem incertas.", "Incorreta. Insuficiência de evidência não equivale a recomendação forte contra."],
      pearl: "Ausência de recomendação não é autorização silenciosa.",
      sourceIds: ["ssc2026", "methylene-fda"]
    },
    {
      id: "q-7",
      title: "Fenótipos",
      prompt: "Qual uso atual dos fenótipos SENECA é mais apropriado?",
      options: ["Escolher corticoide automaticamente", "Definir dose de fluido", "Ensinar heterogeneidade e apoiar pesquisa/prognóstico com limites", "Excluir choque em perfil α"],
      correct: 2,
      feedback: ["Incorreta. Não há validação prescritiva.", "Incorreta. Fluido é guiado por fisiologia individual.", "Correta. É uso educacional/investigacional seguro.", "Incorreta. Nenhum cluster exclui deterioração."],
      pearl: "Fenótipo explica; fisiologia decide.",
      sourceIds: ["seneca", "seneca-validation"]
    },
    {
      id: "q-8",
      title: "Pós-sepse",
      prompt: "Qual item deve integrar a alta pós-sepse?",
      options: ["Somente cultura final", "Reconciliação, educação verbal/escrita e avaliação de sequelas", "Suspender seguimento se afebril", "Manter fármacos da UTI por padrão"],
      correct: 1,
      feedback: ["Incorreta. Microbiologia é uma parte, não todo o plano.", "Correta. Transição e sequelas são componentes explícitos da SSC 2026.", "Incorreta. Sequelas podem persistir sem febre.", "Incorreta. Desprescrição e reconciliação são essenciais."],
      pearl: "A alta precisa explicar o passado e organizar o próximo passo.",
      sourceIds: ["ssc2026"]
    }
  ],

  references: [
    {
      id: "ssc2026",
      group: "Diretriz oficial",
      year: "2026",
      title: "Surviving Sepsis Campaign: Adult Guidelines 2026",
      url: "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines",
      supports: "129 declarações para adultos: reconhecimento, antimicrobianos, hemodinâmica, órgãos e recuperação.",
      limit: "Diretriz apoia decisão; não substitui contexto, ecologia e protocolo local."
    },
    {
      id: "ssc2026-full",
      group: "Texto integral",
      year: "2026",
      title: "SSC 2026 — Intensive Care Medicine",
      url: "https://link.springer.com/article/10.1007/s00134-026-08361-1",
      supports: "Métodos, evidência e justificativas completas da atualização de 23 mar 2026.",
      limit: "Consultar também a correção editorial publicada em 5 maio 2026."
    },
    {
      id: "ssc2026-correction",
      group: "Correção",
      year: "2026",
      title: "Publisher Correction — SSC 2026",
      url: "https://doi.org/10.1007/s00134-026-08410-9",
      supports: "Correção oficial associada ao artigo principal.",
      limit: "Deve acompanhar qualquer uso da versão inicial."
    },
    {
      id: "antibiotic-framework",
      group: "Infográfico oficial",
      year: "2026",
      title: "Antibiotic Timing Framework for Adults",
      url: "https://www.sccm.org/SCCM/media/SCCM/PDFs/SSC-Adult-Antibiotic-Timing-Framework-Infographic-2026.pdf",
      supports: "Estratificação de 1 hora, investigação até 3 horas e diferimento monitorado.",
      limit: "Não define agente; depende de sítio, resistência e hospedeiro."
    },
    {
      id: "hemodynamic-guide",
      group: "Infográfico oficial",
      year: "2026",
      title: "Quick Guide for Resuscitation and Hemodynamic Support",
      url: "https://sccm.org/SCCM/media/SCCM/PDFs/SSC-Adult-Quick-Guide-Infographic-2026.pdf",
      supports: "Fluidos, reavaliação, vasopressores, perfusão e corticosteroide.",
      limit: "Ferramenta resumida; decisões complexas exigem texto integral."
    },
    {
      id: "sepsis3",
      group: "Consenso",
      year: "2016",
      title: "Sepsis-3 — Third International Consensus Definitions",
      url: "https://pubmed.ncbi.nlm.nih.gov/26903338/",
      supports: "Definição de sepse, disfunção orgânica e papel do SOFA.",
      limit: "Definição operacional não deve atrasar tratamento de deterioração."
    },
    {
      id: "shock3",
      group: "Consenso",
      year: "2016",
      title: "Clinical Criteria for Septic Shock",
      url: "https://pubmed.ncbi.nlm.nih.gov/26903336/",
      supports: "Vasopressor para PAM ≥65 mmHg e lactato >2 mmol/L após volume adequado.",
      limit: "Critérios identificam uma população de maior risco; não substituem raciocínio etiológico."
    },
    {
      id: "gbd2021",
      group: "Carga global",
      year: "2025",
      title: "Global, regional, and national sepsis incidence and mortality, 1990–2021",
      url: "https://doi.org/10.1016/S2214-109X(25)00356-0",
      supports: "Estimativa de 166 milhões de casos e 21,4 milhões de mortes associadas em 2021.",
      limit: "Estimativa modelada, influenciada pela pandemia e não comparável diretamente a séries anteriores."
    },
    {
      id: "who2024",
      group: "Órgão oficial",
      year: "2024",
      title: "WHO Sepsis Fact Sheet",
      url: "https://www.who.int/news-room/fact-sheets/detail/sepsis",
      supports: "Prevenção, grupos de risco, carga histórica e custo hospitalar.",
      limit: "Os números globais principais da página derivam da estimativa GBD 2017."
    },
    {
      id: "cdc-core",
      group: "Qualidade hospitalar",
      year: "2023",
      title: "CDC Hospital Sepsis Program Core Elements",
      url: "https://www.cdc.gov/sepsis/hcp/core-elements/index.html",
      supports: "Nos EUA, sepse é uma das principais causas de hospitalização e mortalidade hospitalar, contribui para mais de um terço das mortes hospitalares e exige liderança, equipe, melhoria e stewardship.",
      limit: "Carga e documento organizacional dos Estados Unidos; não universalizar a proporção nem o modelo sem adaptação brasileira."
    },
    {
      id: "ilas",
      group: "Implementação brasileira",
      year: "2022",
      title: "ILAS — roteiro de implementação de protocolo gerenciado",
      url: "https://ilas.org.br/material/roteiro-de-implementacao-de-protocolo-assistencial-gerenciado/",
      supports: "Estrutura prática para implementação e melhoria institucional no Brasil.",
      limit: "Revalidar cada conduta clínica contra a SSC 2026 e protocolos atuais."
    },
    {
      id: "ebserh2025",
      group: "Protocolo institucional brasileiro",
      year: "2025",
      title: "EBSERH/HU-UFGD — Manejo da sepse em adultos",
      url: "https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-centro-oeste/hu-ufgd/acesso-a-informacao/pops-protocolos-e-processos/gad/prt-uvs-002-manejo-da-sepse-em-adultos-v-2.pdf",
      supports: "Exemplo oficial de adaptação institucional brasileira.",
      limit: "Não é diretriz universal; deve ser comparado à SSC 2026 e à realidade local."
    },
    {
      id: "seneca",
      group: "Fenótipos",
      year: "2019",
      title: "Derivation, Validation, and Potential Treatment Implications of Novel Clinical Phenotypes for Sepsis",
      url: "https://pubmed.ncbi.nlm.nih.gov/31104070/",
      supports: "Fenótipos clínicos α, β, γ e δ.",
      limit: "Clusters retrospectivos; não selecionar terapia automaticamente."
    },
    {
      id: "seneca-validation",
      group: "Validação externa",
      year: "2025",
      title: "Clinical subtypes in critically ill patients with sepsis: validation and parsimonious classifier model development",
      url: "https://pubmed.ncbi.nlm.nih.gov/39905513/",
      supports: "Validação dos quatro subtipos em grandes coortes de pacientes críticos.",
      limit: "A distribuição diferiu entre coortes; classificação continua não prescritiva."
    },
    {
      id: "transcriptomic",
      group: "Endótipos",
      year: "2025",
      title: "A consensus blood transcriptomic framework for sepsis",
      url: "https://www.nature.com/articles/s41591-025-03964-5",
      supports: "Três subtipos transcriptômicos de consenso e heterogeneidade biológica.",
      limit: "Framework de pesquisa; implicações clínicas ainda limitadas e análises terapêuticas exploratórias."
    },
    {
      id: "andromeda2",
      group: "Ressuscitação personalizada",
      year: "2025",
      title: "ANDROMEDA-SHOCK-2",
      url: "https://jamanetwork.com/journals/jama/fullarticle/2840823",
      supports: "Estratégia hemodinâmica personalizada guiada por perfusão periférica em choque séptico.",
      limit: "O benefício do desfecho hierárquico não equivale a redução isolada de mortalidade e não autoriza protocolo universal por fenótipo."
    },
    {
      id: "steroids2024",
      group: "Diretriz focada",
      year: "2024",
      title: "SCCM Focused Update: Corticosteroids in Sepsis, ARDS, and CAP",
      url: "https://sccm.org/clinical-resources/guidelines/guidelines/use-of-corticosteroids-in-sepsis-ards-cap",
      supports: "Uso de corticosteroide em choque e recomendação contra esquema curto em dose elevada.",
      limit: "Aplicar conforme população, dose equivalente, duração e contraindicações."
    },
    {
      id: "methylene-fda",
      group: "Regulatório",
      year: "2024",
      title: "FDA label — methylene blue",
      url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/204630s021lbl.pdf",
      supports: "Indicação regulatória, contraindicações e alertas de segurança do fármaco.",
      limit: "A indicação do rótulo é metemoglobinemia, não choque séptico."
    },
    {
      id: "composer-llm",
      group: "IA clínica",
      year: "2025",
      title: "Prospective implementation of an LLM-based system for early sepsis prediction",
      url: "https://www.nature.com/articles/s41746-025-01689-w",
      supports: "Exemplo prospectivo de IA para detecção precoce.",
      limit: "Não é diagnóstico autônomo; desempenho, alertas e mudança de domínio exigem governança local."
    }
  ]
};
