// Banco autoral de preparação; sem questões oficiais ou dados de pacientes.
const TEMI_NOVEMBRO_2026_QBANK = {
  "meta": {
    "id": "qbank-temi-novembro-2026-80-v1",
    "title": "TEMI Novembro 2026 — 80 questões autorais",
    "subtitle": "Dez temas de terapia intensiva; casos fictícios e comentários A–E",
    "version": "1.0",
    "updated": "2026-11-02",
    "verifiedAt": "2026-11-02",
    "target": "radar-diario",
    "destination": "AldenirMed89 — busca temática e preparação TEMI",
    "status": "revisao-medica-pendente",
    "patientData": false,
    "authorship": "Conteúdo educacional autoral assistido por IA; revisão médica humana formal pendente.",
    "purpose": "Preparação educacional em adultos; questões não oficiais da AMIB; casos inteiramente fictícios.",
    "safety": "⚠️ Ferramenta educacional/de apoio à decisão. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual.",
    "scope": "Os conceitos foram conferidos nas fontes primárias indicadas. Datas de conferência não significam revisão integral de toda diretriz. Cada fonte delimita o escopo; doses não são geradas automaticamente.",
    "clinicalReviewStatus": "public-preview-pending-formal-medical-review",
    "claimsHumanClinicalReview": false
  },
  "sources": {
    "NOV_SSC26": {
      "label": "SCCM/ESICM — Surviving Sepsis Campaign 2026",
      "url": "https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Recomendações da página oficial conferidas; adultos. Grau de recomendação e contexto devem acompanhar a aplicação."
    },
    "NOV_BLING3": {
      "label": "BLING III — ensaio randomizado, JAMA 2024",
      "url": "https://jamanetwork.com/journals/jama/fullarticle/2819971",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Desfecho primário e resultados publicados; infusão contínua versus intermitente. Não confundir ausência de significância com equivalência demonstrada."
    },
    "NOV_CLOVERS": {
      "label": "CLOVERS — ensaio randomizado, NEJM 2023",
      "url": "https://doi.org/10.1056/NEJMoa2212663",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "População com hipotensão por sepse após fluidos iniciais; não testa ausência de ressuscitação."
    },
    "NOV_6S": {
      "label": "6S — ensaio randomizado, NEJM 2012",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1204242",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Hidroxietilamido em sepse grave comparado com cristaloide balanceado; resultado não autoriza equivalência entre todos os coloides."
    },
    "NOV_AARC24": {
      "label": "AARC — avaliação paciente-ventilador, 2024",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11298231/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Avaliação de pressões, volume, PEEP, via aérea e humidificação; não determina uma configuração universal."
    },
    "NOV_ATS24": {
      "label": "ATS — atualização da diretriz de SDRA, 2024",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10870893/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "PEEP, ECMO e recomendações mantidas de proteção/prona. Recomendações condicionais preservadas."
    },
    "NOV_ART": {
      "label": "ART — ensaio randomizado, JAMA 2017",
      "url": "https://jamanetwork.com/journals/jama/fullarticle/2654894",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Estratégia específica de recrutamento e titulação de PEEP; não representa todo ajuste de PEEP."
    },
    "NOV_NMB26": {
      "label": "SCCM — bloqueio neuromuscular em adultos com SDRA, 2026",
      "url": "https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-for-the-administration-of-neuromuscular-blockade",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Página oficial e resumo executivo: indicação, otimização e segurança. Não atribuir superioridade universal a dose fixa ou monitorização específica."
    },
    "NOV_AMR26": {
      "label": "IDSA — resistência em gram-negativos, 2026",
      "url": "https://www.idsociety.org/practice-guideline/amr-guidance/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Versão de 30/07/2026 substitui anteriores; ESBL/AmpC e interpretação clínica. Escopo regulatório e microbiológico norte-americano exige adaptação local."
    },
    "NOV_CAND16": {
      "label": "IDSA — candidíase, recomendações de seguimento de 2016",
      "url": "https://www.idsociety.org/practice-guideline/candidiasis/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Uso restrito à recomendação de hemoculturas de seguimento; não apresentada como revisão mais recente de todo o tratamento antifúngico."
    },
    "NOV_CRYPTO": {
      "label": "NIH — criptococose em adultos/adolescentes com HIV",
      "url": "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/cryptococcosis",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Página viva conferida; início de TARV no acometimento do SNC e controle de pressão. Não extrapolar automaticamente para pessoas sem HIV."
    },
    "NOV_SAB26": {
      "label": "IDSA/ESCMID — bacteremia por S. aureus, parte 1, 2026",
      "url": "https://www.idsociety.org/practice-guideline/staphylococcus-aureus-bacteremia",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Consenso publicado em 09/09/2026: risco, investigação e seguimento. Parte 1 não é diretriz integral de todos os esquemas antimicrobianos."
    },
    "NOV_VAP16": {
      "label": "ATS/IDSA — pneumonia hospitalar/associada à ventilação, 2016",
      "url": "https://www.idsociety.org/practice-guideline/hap_vap/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Recomendação de duração em pneumonia associada à ventilação com resposta adequada; complicações exigem individualização."
    },
    "NOV_CDC_CAUTI": {
      "label": "CDC — prevenção de ITU associada a cateter",
      "url": "https://www.cdc.gov/infection-control/hcp/cauti/summary-of-recommendations.html",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Resumo oficial vigente da diretriz de 2009; troca por indicação clínica, sistema fechado e necessidade diária."
    },
    "NOV_BTF4": {
      "label": "Brain Trauma Foundation — TCE grave, quarta edição",
      "url": "https://braintrauma.org/coma/guidelines/severe-tbi",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Corticoide e hiperventilação; versão publicada da quarta edição, sem inferir que toda terapêutica neurológica permanece igual."
    },
    "NOV_ICH22": {
      "label": "AHA/ASA — hemorragia intracerebral espontânea, 2022",
      "url": "https://www.ahajournals.org/doi/10.1161/STR.0000000000000407",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Reversão de anticoagulação, compressão pneumática e urgência cerebelar; escopo explícito não traumático."
    },
    "NOV_ICH25": {
      "label": "ESO/EANS — hemorragia intracerebral espontânea, 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12098356/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Recomendações de prevenção primária de crises e trombose; não equivale a orientação para tratar crise documentada."
    },
    "NOV_HSA26": {
      "label": "ESO/EANS/ESMINT — HSA aneurismática, 2026",
      "url": "https://pubmed.ncbi.nlm.nih.gov/42095754/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Abstract primário conferido: nimodipina oral e recomendações principais. Não foi alegada leitura integral do documento a partir deste resumo."
    },
    "NOV_HSA23": {
      "label": "AHA/ASA — HSA aneurismática, 2023",
      "url": "https://doi.org/10.1161/STR.0000000000000436",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Euvolemia e cuidado dirigido. Referência atribuída à AHA/ASA; complementada pela diretriz europeia de 2026 no ponto aplicável."
    },
    "NOV_KDIGO12": {
      "label": "KDIGO — diretriz final de lesão renal aguda, 2012",
      "url": "https://kdigo.org/wp-content/uploads/2016/10/KDIGO-2012-AKI-Guideline-English.pdf",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Definição, diuréticos e indicação de TRR. A atualização AKI/AKD 2026 estava em preparação após consulta pública; o rascunho não foi usado como diretriz final."
    },
    "NOV_UKKA26": {
      "label": "UK Kidney Association — hipercalemia, atualização julho/2026",
      "url": "https://www.ukkidney.org/health-professionals/guidelines/treatment-acute-hyperkalaemia-adults-0",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Página oficial identifica PDF final atualizado em julho/2026; monitorização pós-insulina, pseudohipercalemia e eliminação de potássio."
    },
    "NOV_HIPONA": {
      "label": "Society for Endocrinology — hiponatremia sintomática, 2016",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5314809/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Emergência por sintomas graves e prevenção de sobrecorreção; protocolo operacional e limites devem ser individualizados."
    },
    "NOV_DKA24": {
      "label": "ADA/EASD e sociedades — crises hiperglicêmicas, consenso 2024",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11272983/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Adultos: diagnóstico e transição da insulina. Consenso de especialistas, não extrapolado para pediatria."
    },
    "NOV_ADA26": {
      "label": "ADA — Standards of Care 2026, seção 6",
      "url": "https://doi.org/10.2337/dc26-s006",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Basal durante doença/jejum e segurança em crise hiperglicêmica; plano deve ser individualizado."
    },
    "NOV_GLIC24": {
      "label": "SCCM — controle glicêmico no paciente crítico, 2024",
      "url": "https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-on-glycemic-control-for-critically-ill",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Medição e prevenção de hipoglicemia; não fornece prescrição automática de insulina nesta síntese."
    },
    "NOV_ADRENAL": {
      "label": "Society for Endocrinology — crise adrenal",
      "url": "https://www.endocrinology.org/clinical-practice/clinical-guidance/adrenal-crisis/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Emergência endócrina: não atrasar terapia e colher amostras se não houver atraso."
    },
    "NOV_MIX26": {
      "label": "Consenso conjunto — coma mixedematoso, 2026",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC13452032/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Consenso ETA/BTA/Society for Endocrinology/Welsh Society; orientação de especialistas sem graduação formal GRADE."
    },
    "NOV_HIPOCAL": {
      "label": "Society for Endocrinology — hipocalcemia aguda, 2016",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5314808/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Emergência sintomática e busca de causa; uso restrito ao reconhecimento e avaliação, sem dose neste banco."
    },
    "NOV_ACS25": {
      "label": "ACC/AHA e sociedades — síndrome coronariana aguda, 2025",
      "url": "https://doi.org/10.1016/j.jacc.2024.11.009",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Choque, revascularização e acesso radial; recomendações e destaques oficiais conferidos."
    },
    "NOV_AMI25": {
      "label": "AABB — transfusão no infarto agudo, 2025",
      "url": "https://www.aabb.org/news-resources/news/article/2025/08/20/expert-panel-recommends-liberal-transfusion-strategy-for-hospitalized-patients-with-ami",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Resumo oficial da diretriz: estratégia liberal condicional em IAM; evidência de baixa certeza, individualizar risco e congestão."
    },
    "NOV_ALS25": {
      "label": "AHA — suporte avançado de vida adulto, 2025",
      "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Taquiarritmias e bradicardia; cenários hemodinâmicos específicos, sem dose elétrica universal."
    },
    "NOV_POS25": {
      "label": "AHA — cuidados após parada cardíaca, 2025",
      "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/post-cardiac-arrest-care",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Controle de temperatura e avaliação seriada; verificar duração, elegibilidade e protocolo local."
    },
    "NOV_HIT18": {
      "label": "ASH — trombocitopenia induzida por heparina, 2018",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6258919/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "4Ts, anticoagulação não heparínica, antagonista de vitamina K e plaquetas; atribuição específica à ASH 2018."
    },
    "NOV_TTP25": {
      "label": "ISTH — atualização focada de PTT, 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC13470878/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Atualização da PTT congênita e manutenção de princípios da imune; não confundir as duas etiologias."
    },
    "NOV_PE26": {
      "label": "AHA/ACC e sociedades — tromboembolismo pulmonar agudo, 2026",
      "url": "https://www.jacc.org/doi/10.1016/j.jacc.2025.11.005",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "ClassificaçãoA–E, anticoagulação e reperfusão; destaques oficiais e recomendações primárias pertinentes conferidos."
    },
    "NOV_PLT25": {
      "label": "AABB/ICTMG — transfusão de plaquetas, 2025",
      "url": "https://www.aabb.org/news-resources/news/article/2025/05/29/aabb-develops-new-platelet-transfusion-guidelines",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Resumo oficial: limiar em contextos definidos; não autoriza aplicar um limiar único a hemorragia ou neurocirurgia."
    },
    "NOV_PAN24": {
      "label": "ACG — pancreatite aguda, 2024",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC13221274/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Alimentação e CPRE; recomendações atribuídas à ACG 2024, sem alegar ser a única diretriz vigente mundialmente."
    },
    "NOV_BAVENO": {
      "label": "Baveno VII — consenso de hipertensão portal",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11090185/",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Hemorragia varicosa, transfusão e vasoativo; ajustar ao sangramento ativo e comorbidades."
    },
    "NOV_ASC21": {
      "label": "AASLD — ascite, PBE e síndrome hepatorrenal, 2021",
      "url": "https://doi.org/10.1002/hep.31884",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Diagnóstico de PBE e investigação; não define cobertura empírica universal para todos os hospitais."
    },
    "NOV_ESPEN23": {
      "label": "ESPEN — nutrição clínica na UTI, 2023",
      "url": "https://www.espen.org/files/ESPEN-Guidelines/ESPEN_practical_and_partially_revised_guideline_Clinical_nutrition_in_the_intensive_care_unit.pdf",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Tolerância e realimentação; monitorização metabólica e contexto hemodinâmico."
    },
    "NOV_PADIS18": {
      "label": "SCCM — PADIS, recomendações de base de 2018",
      "url": "https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-for-the-prevention-and-management-of-pa",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Dor, escalas e intervenções não farmacológicas; atualização focada 2025 não substitui todos os tópicos de base."
    },
    "NOV_PADIS25": {
      "label": "SCCM — atualização focada PADIS, 2025",
      "url": "https://www.sccm.org/clinical-resources/guidelines/guidelines/focused-update-padis-guideline",
      "design": "diretriz, consenso ou estudo primário identificado no título",
      "verifiedAt": "2026-11-02",
      "scope": "Sono, mobilização e limites de evidência para ansiedade/delirium; recomendações condicionais mantidas."
    }
  },
  "blocks": [
    {
      "id": "sepse-choque",
      "label": "Sepse e choque",
      "icon": "🦠",
      "color": "#42d6b7"
    },
    {
      "id": "ventilacao-sdra",
      "label": "Ventilação e SDRA",
      "icon": "🫁",
      "color": "#65baff"
    },
    {
      "id": "infeccoes-antimicrobianos",
      "label": "Infecções e antimicrobianos",
      "icon": "🧫",
      "color": "#a2d85b"
    },
    {
      "id": "neurocritico",
      "label": "Neurocrítico",
      "icon": "🧠",
      "color": "#ad9cff"
    },
    {
      "id": "renal-eletrolitos",
      "label": "Renal e eletrólitos",
      "icon": "🧪",
      "color": "#4fd8e8"
    },
    {
      "id": "metabolico-endocrino",
      "label": "Metabólico e endócrino",
      "icon": "⚗️",
      "color": "#f3c367"
    },
    {
      "id": "cardiovascular",
      "label": "Cardiovascular",
      "icon": "🫀",
      "color": "#ff8b93"
    },
    {
      "id": "hematologia-trombose",
      "label": "Hematologia e trombose",
      "icon": "🩸",
      "color": "#ef9bc6"
    },
    {
      "id": "gastro-hepato-nutricao",
      "label": "Gastro, hepato e nutrição",
      "icon": "🍲",
      "color": "#d9ad78"
    },
    {
      "id": "sedacao-seguranca",
      "label": "Sedação e segurança",
      "icon": "🛏️",
      "color": "#99c3e9"
    }
  ],
  "questions": [
    {
      "id": "TEMI-NOV26-001",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Reavaliação diagnóstica",
      "difficulty": "Médio",
      "tags": [
        "sepse-choque",
        "reavalia-o-diagn-stica",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto iniciou antibiótico por febre e hipotensão. A investigação demonstra hemorragia por ruptura vascular, sem foco infeccioso. Após controlar o sangramento, qual revisão é adequada?",
      "options": {
        "A": "Reavaliar a hipótese e suspender o empírico se a causa alternativa explicar o quadro.",
        "B": "Completar sempre 14 dias porque foi acionado protocolo de sepse.",
        "C": "Manter antimicrobiano até normalizar toda proteína C reativa.",
        "D": "Trocar por antifúngico porque a cultura inicial foi negativa.",
        "E": "Ignorar a hemorragia se o lactato estava elevado."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. A hipótese inicial deve ser revista quando evidência nova muda a etiologia.",
        "B": "Incorreta. A ativação do protocolo não comprova infecção.",
        "C": "Incorreta. Um marcador inespecífico não determina duração sozinho.",
        "D": "Incorreta. Cultura negativa não demonstra doença fúngica.",
        "E": "Incorreta. Lactato elevado também acompanha choque hemorrágico."
      },
      "synthesis": "A hipótese inicial deve ser revista quando evidência nova muda a etiologia.",
      "pearl": "🧠 Reavaliação diagnóstica: Reavaliar a hipótese e suspender o empírico se a causa alternativa explicar o quadro.",
      "sourceRefs": [
        "NOV_SSC26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-002",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Descalonamento",
      "difficulty": "Médio",
      "tags": [
        "sepse-choque",
        "descalonamento",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Após choque séptico, hemocultura identifica agente sensível a um fármaco mais estreito. O adulto melhora e o foco foi controlado. Qual atitude representa stewardship?",
      "options": {
        "A": "Manter toda cobertura inicial até a alta por segurança.",
        "B": "Revisar e estreitar o esquema conforme agente, sítio e evolução.",
        "C": "Suspender tudo apenas porque a febre cedeu.",
        "D": "Adicionar outro agente de mesmo espectro obrigatoriamente.",
        "E": "Ignorar o sítio porque a bactéria é sensível in vitro."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. A cobertura inicial deve ser reavaliada.",
        "B": "Correta. Descalonamento reduz exposição desnecessária sem abandonar tratamento eficaz.",
        "C": "Incorreta. Melhora isolada não define término do tratamento.",
        "D": "Incorreta. Duplicação não é resposta automática ao antibiograma.",
        "E": "Incorreta. Penetração e foco continuam relevantes."
      },
      "synthesis": "Descalonamento reduz exposição desnecessária sem abandonar tratamento eficaz.",
      "pearl": "🧠 Descalonamento: Revisar e estreitar o esquema conforme agente, sítio e evolução.",
      "sourceRefs": [
        "NOV_SSC26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-003",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Vasopressor e acesso",
      "difficulty": "Médio",
      "tags": [
        "sepse-choque",
        "vasopressor-e-acesso",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com choque séptico instável precisa de noradrenalina e o acesso central levará tempo. Há acesso periférico apropriado e equipe capaz de vigiar o local. Qual princípio é adequado?",
      "options": {
        "A": "Aguardar sempre o cateter central antes de qualquer vasopressor.",
        "B": "Aplicar em qualquer pequeno acesso sem inspeção.",
        "C": "Evitar atraso do vasopressor, usando acesso periférico monitorizado conforme protocolo.",
        "D": "Substituir vasopressor por expansão ilimitada.",
        "E": "Usar a via periférica sem reavaliar necessidade e duração."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. A espera pode prolongar hipoperfusão.",
        "B": "Incorreta. A segurança depende de local, acesso e monitorização.",
        "C": "Correta. O benefício da prontidão exige vigilância de extravasamento e planejamento do acesso.",
        "D": "Incorreta. Mais volume pode causar dano sem corrigir vasoplegia.",
        "E": "Incorreta. A estratégia deve ser revista continuamente."
      },
      "synthesis": "O benefício da prontidão exige vigilância de extravasamento e planejamento do acesso.",
      "pearl": "🧠 Vasopressor e acesso: Evitar atraso do vasopressor, usando acesso periférico monitorizado conforme protocolo.",
      "sourceRefs": [
        "NOV_SSC26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-004",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Infusão de betalactâmicos",
      "difficulty": "Médio",
      "tags": [
        "sepse-choque",
        "infus-o-de-betalact-micos",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. A UTI adota manutenção por infusão prolongada de betalactâmico em sepse. A primeira dose ainda não foi administrada. O que precisa permanecer no planejamento?",
      "options": {
        "A": "Omitir a primeira dose para reduzir resistência.",
        "B": "Usar dose fixa igual em toda função renal.",
        "C": "Prometer benefício individual certo de sobrevida.",
        "D": "Dose inicial de ataque e ajuste farmacocinético antes da manutenção prolongada.",
        "E": "Dispensar controle de foco porque a infusão é contínua."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Atraso ou subexposição inicial não é stewardship.",
        "B": "Incorreta. Depuração e terapia renal substitutiva alteram exposição.",
        "C": "Incorreta. Recomendação populacional não garante desfecho individual.",
        "D": "Correta. A manutenção prolongada não substitui atingir exposição inicial adequada.",
        "E": "Incorreta. A estratégia de administração não elimina o foco."
      },
      "synthesis": "A manutenção prolongada não substitui atingir exposição inicial adequada.",
      "pearl": "🧠 Infusão de betalactâmicos: Dose inicial de ataque e ajuste farmacocinético antes da manutenção prolongada.",
      "sourceRefs": [
        "NOV_SSC26",
        "NOV_BLING3"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-005",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Leitura crítica do BLINGIII",
      "difficulty": "Difícil",
      "tags": [
        "sepse-choque",
        "leitura-cr-tica-do-blingiii",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Um residente lê BLINGIII e afirma: infusão contínua demonstrou superioridade estatística no desfecho primário de mortalidade 90 dias. Qual correção preserva a precisão?",
      "options": {
        "A": "O estudo provou que toda infusão prolongada aumenta mortalidade.",
        "B": "A análise primária demonstrou benefício inequívoco.",
        "C": "Ausência de significância torna a pergunta farmacológica irrelevante.",
        "D": "Uma recomendação posterior altera retroativamente o resultado do ensaio.",
        "E": "A diferença do desfecho primário não atingiu significância; isso não prova equivalência."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Essa conclusão não corresponde ao resultado primário.",
        "B": "Incorreta. Não houve significância estatística nessa análise.",
        "C": "Incorreta. A interpretação exige efeito, incerteza e outros desfechos.",
        "D": "Incorreta. Diretrizes sintetizam evidência; não reescrevem resultados.",
        "E": "Correta. Um resultado não significativo não demonstra igualdade entre estratégias."
      },
      "synthesis": "Um resultado não significativo não demonstra igualdade entre estratégias.",
      "pearl": "🧠 Leitura crítica do BLINGIII: A diferença do desfecho primário não atingiu significância; isso não prova equivalência.",
      "sourceRefs": [
        "NOV_BLING3"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-006",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Aplicabilidade do CLOVERS",
      "difficulty": "Difícil",
      "tags": [
        "sepse-choque",
        "aplicabilidade-do-clovers",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Durante discussão do CLOVERS, alguém propõe nunca administrar fluidos iniciais na hipotensão por sepse. Qual limite do ensaio invalida essa extrapolação?",
      "options": {
        "A": "Os participantes já haviam recebido fluidos antes da comparação das estratégias.",
        "B": "O ensaio incluiu exclusivamente choque cardiogênico.",
        "C": "O estudo demonstrou superioridade universal da estratégia liberal.",
        "D": "Todo paciente randomizado estava sem qualquer cristaloide prévio.",
        "E": "O resultado dispensa reavaliação de congestão e perfusão."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. O ensaio compara estratégias após tratamento inicial, não ressuscitação versus nenhuma ressuscitação.",
        "B": "Incorreta. A população foi hipotensão relacionada à sepse.",
        "C": "Incorreta. Não houve diferença significativa no desfecho primário.",
        "D": "Incorreta. Havia ressuscitação inicial antes da randomização.",
        "E": "Incorreta. Aplicabilidade exige contexto individual."
      },
      "synthesis": "O ensaio compara estratégias após tratamento inicial, não ressuscitação versus nenhuma ressuscitação.",
      "pearl": "🧠 Aplicabilidade do CLOVERS: Os participantes já haviam recebido fluidos antes da comparação das estratégias.",
      "sourceRefs": [
        "NOV_CLOVERS"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-007",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Segurança dos coloides",
      "difficulty": "Médio",
      "tags": [
        "sepse-choque",
        "seguran-a-dos-coloides",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. No choque por infecção, propõe-se hidroxietilamido para poupar cristaloide. Qual interpretação do ensaio6S e da diretriz é adequada?",
      "options": {
        "A": "A pequena quantidade torna seu uso comprovadamente protetor renal.",
        "B": "Hidroxietilamido deve ser evitado nesse cenário pelo sinal de dano.",
        "C": "Todos os coloides têm benefício idêntico ao da albumina.",
        "D": "Maior expansão intravascular elimina qualquer risco renal.",
        "E": "O estudo avaliou somente solução salina como coloide."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Não existe essa garantia de segurança.",
        "B": "Correta. O 6S encontrou pior segurança em sepse; a SSC recomenda contra amidos.",
        "C": "Incorreta. Classes diferentes não são intercambiáveis por inferência.",
        "D": "Incorreta. Efeito hemodinâmico não exclui toxicidade.",
        "E": "Incorreta. O comparador era cristaloide balanceado."
      },
      "synthesis": "O 6S encontrou pior segurança em sepse; a SSC recomenda contra amidos.",
      "pearl": "🧠 Segurança dos coloides: Hidroxietilamido deve ser evitado nesse cenário pelo sinal de dano.",
      "sourceRefs": [
        "NOV_6S",
        "NOV_SSC26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-008",
      "block": "sepse-choque",
      "topicId": "sepse-choque",
      "topicLabel": "Sepse e choque",
      "subtopic": "Momento da nova expansão",
      "difficulty": "Médio",
      "tags": [
        "sepse-choque",
        "momento-da-nova-expans-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Após tratamento inicial da sepse, PAM melhorou, mas surgiu congestão pulmonar. Lactato caiu parcialmente. Qual plano evita usar um número como ordem automática de mais volume?",
      "options": {
        "A": "Repetir volume até lactato atingir zero.",
        "B": "Ignorar perfusão porque a PAM atingiu a meta.",
        "C": "Integrar perfusão, resposta dinâmica e sinais de sobrecarga antes de novo fluido.",
        "D": "Usar apenas pressão venosa central como prova de responsividade.",
        "E": "Administrar diurético sem avaliar choque persistente."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Normalização não é indicação ilimitada de fluidos.",
        "B": "Incorreta. Pressão adequada não garante perfusão de todos os órgãos.",
        "C": "Correta. Lactato exige interpretação; cada expansão precisa de objetivo e reavaliação.",
        "D": "Incorreta. Uma medida estática isolada não demonstra benefício do bolus.",
        "E": "Incorreta. Remoção de volume também exige contexto hemodinâmico."
      },
      "synthesis": "Lactato exige interpretação; cada expansão precisa de objetivo e reavaliação.",
      "pearl": "🧠 Momento da nova expansão: Integrar perfusão, resposta dinâmica e sinais de sobrecarga antes de novo fluido.",
      "sourceRefs": [
        "NOV_SSC26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-009",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "Pressão resistiva",
      "difficulty": "Médio",
      "tags": [
        "ventilacao-sdra",
        "press-o-resistiva",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto intubado apresenta aumento da pressão de pico, com platô inalterado, secreção espessa e sibilos. Qual componente deve ser investigado primeiro?",
      "options": {
        "A": "Redução de complacência como única explicação possível.",
        "B": "Hipovolemia comprovada pela pressão de pico.",
        "C": "Necessidade obrigatória de aumentar volume corrente.",
        "D": "Aumento de resistência, incluindo secreção, broncoespasmo e circuito.",
        "E": "Pulmão normal porque o platô não mudou."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Complacência reduzida costuma elevar também o platô.",
        "B": "Incorreta. Pressão de via aérea não comprova volemia.",
        "C": "Incorreta. Aumentar volume pode agravar pressões e lesão.",
        "D": "Correta. Pico alto com platô estável sugere componente resistivo aumentado.",
        "E": "Incorreta. Aumento de resistência ainda requer investigação."
      },
      "synthesis": "Pico alto com platô estável sugere componente resistivo aumentado.",
      "pearl": "🧠 Pressão resistiva: Aumento de resistência, incluindo secreção, broncoespasmo e circuito.",
      "sourceRefs": [
        "NOV_AARC24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-010",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "Peso e volume corrente",
      "difficulty": "Médio",
      "tags": [
        "ventilacao-sdra",
        "peso-e-volume-corrente",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto obeso pesa 110 kg, mas o peso predito pela altura é 60 kg. Recebe 660 mL por ciclo na SDRA. Qual revisão é correta?",
      "options": {
        "A": "Manter porque 660 mL equivale a 6 mL/kg de peso real.",
        "B": "Aumentar até compensar toda hipercapnia, sem limite de pressão.",
        "C": "Trocar peso predito por peso edemaciado diário.",
        "D": "Decidir proteção apenas pela saturação.",
        "E": "Recalcular a proteção usando peso predito e revisar pressões/tolerância."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. O peso real não é a referência protetora.",
        "B": "Incorreta. Ventilação deve equilibrar proteção e contexto fisiológico.",
        "C": "Incorreta. Edema não representa tamanho pulmonar.",
        "D": "Incorreta. Boa oxigenação não exclui hiperdistensão.",
        "E": "Correta. O volume atual corresponde a 11 mL/kg de peso predito."
      },
      "synthesis": "O volume atual corresponde a 11 mL/kg de peso predito.",
      "pearl": "🧠 Peso e volume corrente: Recalcular a proteção usando peso predito e revisar pressões/tolerância.",
      "sourceRefs": [
        "NOV_AARC24",
        "NOV_ATS24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-011",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "PEEP total",
      "difficulty": "Difícil",
      "tags": [
        "ventilacao-sdra",
        "peep-total",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Na ventilação passiva, PEEP ajustada é 8 cmH₂O e PEEP total medida corretamente é 14 cmH₂O. Qual interpretação é adequada?",
      "options": {
        "A": "Há 6 cmH₂O de PEEP intrínseca, exigindo avaliar expiração e obstrução.",
        "B": "PEEP intrínseca é 22 cmH₂O.",
        "C": "A PEEP total será sempre igual à ajustada.",
        "D": "O dado comprova necessidade de elevar frequência respiratória.",
        "E": "O achado dispensa conferir técnica de medida."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. A diferença entre PEEP total e externa estima o componente intrínseco.",
        "B": "Incorreta. Somar os valores não calcula o componente intrínseco.",
        "C": "Incorreta. Aprisionamento aéreo pode aumentar a pressão ao fim da expiração.",
        "D": "Incorreta. Encurtar a expiração pode piorar aprisionamento.",
        "E": "Incorreta. Validade depende de condições apropriadas de mensuração."
      },
      "synthesis": "A diferença entre PEEP total e externa estima o componente intrínseco.",
      "pearl": "🧠 PEEP total: Há 6 cmH₂O de PEEP intrínseca, exigindo avaliar expiração e obstrução.",
      "sourceRefs": [
        "NOV_AARC24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-012",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "PEEP individualizada",
      "difficulty": "Médio",
      "tags": [
        "ventilacao-sdra",
        "peep-individualizada",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com SDRA moderada mantém hipoxemia após proteção inicial. A equipe discute PEEP mais alta. Qual formulação corresponde à ATS 2024?",
      "options": {
        "A": "É uma imposição para todo adulto ventilado, inclusive sem SDRA.",
        "B": "É uma sugestão para SDRA moderada/grave, com avaliação de resposta e tolerância.",
        "C": "Exige recrutamento prolongado de alta pressão junto à PEEP.",
        "D": "Dispensa avaliar pressão arterial e sobredistensão.",
        "E": "É contraindicação absoluta em qualquer SDRA grave."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. População e gravidade limitam a recomendação.",
        "B": "Correta. A recomendação é condicional e não autoriza PEEP alta indiscriminada.",
        "C": "Incorreta. A diretriz separa PEEP mais alta de recrutamento prolongado.",
        "D": "Incorreta. Benefício e efeitos adversos precisam ser acompanhados.",
        "E": "Incorreta. A diretriz contempla uso selecionado, não proibição universal."
      },
      "synthesis": "A recomendação é condicional e não autoriza PEEP alta indiscriminada.",
      "pearl": "🧠 PEEP individualizada: É uma sugestão para SDRA moderada/grave, com avaliação de resposta e tolerância.",
      "sourceRefs": [
        "NOV_ATS24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-013",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "Seleção para ECMO",
      "difficulty": "Difícil",
      "tags": [
        "ventilacao-sdra",
        "sele-o-para-ecmo",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com SDRA muito grave segue hipoxêmico apesar de ventilação protetora e prona adequadas. Qual discussão é mais fiel à diretriz?",
      "options": {
        "A": "Indicar VV-ECMO apenas por uma saturação isolada.",
        "B": "Tratar ECMO como substituta automática da proteção pulmonar.",
        "C": "Avaliação em centro especializado para VV-ECMO, considerando reversibilidade e critérios.",
        "D": "Usar recomendação condicional como garantia de benefício para todos.",
        "E": "Descartar discussão porque a ventilação já falhou uma vez."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Seleção exige trajetória, medidas já aplicadas e contexto.",
        "B": "Incorreta. Proteção continua relevante durante o suporte extracorpóreo.",
        "C": "Correta. ECMO é opção selecionada; a decisão inclui prognóstico e recursos.",
        "D": "Incorreta. Efeito populacional não elimina riscos individuais.",
        "E": "Incorreta. Persistência apesar de otimização pode justificar avaliação."
      },
      "synthesis": "ECMO é opção selecionada; a decisão inclui prognóstico e recursos.",
      "pearl": "🧠 Seleção para ECMO: Avaliação em centro especializado para VV-ECMO, considerando reversibilidade e critérios.",
      "sourceRefs": [
        "NOV_ATS24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-014",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "Dose de posição prona",
      "difficulty": "Médio",
      "tags": [
        "ventilacao-sdra",
        "dose-de-posi-o-prona",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com SDRA grave tolera prona. Propõe-se uma sessão de 20 minutos por dia como equivalente ao esquema apoiado por diretrizes. Qual crítica é correta?",
      "options": {
        "A": "Qualquer mudança de decúbito tem a mesma evidência de mortalidade.",
        "B": "Prona só pode ser usada com recrutamento prolongado.",
        "C": "Prona elimina a necessidade de vigiar tubos e pressão.",
        "D": "A evidência envolve sessões prolongadas, não exposição breve equivalente.",
        "E": "Melhora imediata da saturação é o único objetivo avaliável."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Duração e população fazem parte da intervenção estudada.",
        "B": "Incorreta. Esse requisito não integra a recomendação.",
        "C": "Incorreta. Posicionamento exige equipe e monitorização.",
        "D": "Correta. A recomendação mantida pela ATS contempla mais de 12 horas por dia.",
        "E": "Incorreta. Proteção, tolerância e desfechos clínicos também importam."
      },
      "synthesis": "A recomendação mantida pela ATS contempla mais de 12 horas por dia.",
      "pearl": "🧠 Dose de posição prona: A evidência envolve sessões prolongadas, não exposição breve equivalente.",
      "sourceRefs": [
        "NOV_ATS24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-015",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "Intervenção específica do ART",
      "difficulty": "Difícil",
      "tags": [
        "ventilacao-sdra",
        "interven-o-espec-fica-do-art",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Ao revisar o ART, a equipe quer adotar de rotina manobras de recrutamento prolongado de alta pressão. Qual conclusão é adequada?",
      "options": {
        "A": "O ensaio demonstrou sobrevida superior com a estratégia agressiva.",
        "B": "O ART prova que qualquer PEEP é nociva.",
        "C": "A oxigenação transitória superior garante benefício de sobrevida.",
        "D": "A estratégia deve ser aplicada também a pulmões sem SDRA.",
        "E": "A estratégia estudada teve sinal de dano e não sustenta esse uso rotineiro."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. O resultado ocorreu na direção de pior segurança.",
        "B": "Incorreta. O ensaio não comparou ausência total de PEEP.",
        "C": "Incorreta. Desfecho fisiológico não substitui desfecho clínico.",
        "D": "Incorreta. Essa extrapolação amplia indevidamente população e intervenção.",
        "E": "Correta. O resultado exige distinguir recrutamento agressivo de ajustes usuais de PEEP."
      },
      "synthesis": "O resultado exige distinguir recrutamento agressivo de ajustes usuais de PEEP.",
      "pearl": "🧠 Intervenção específica do ART: A estratégia estudada teve sinal de dano e não sustenta esse uso rotineiro.",
      "sourceRefs": [
        "NOV_ART",
        "NOV_ATS24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-016",
      "block": "ventilacao-sdra",
      "topicId": "ventilacao-sdra",
      "topicLabel": "Ventilação e SDRA",
      "subtopic": "Antes do bloqueio neuromuscular",
      "difficulty": "Médio",
      "tags": [
        "ventilacao-sdra",
        "antes-do-bloqueio-neuromuscular",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com SDRA apresenta assincronia. Antes de iniciar bloqueador, qual etapa a diretriz SCCM 2026 ressalta?",
      "options": {
        "A": "Otimizar ventilador, analgesia e sedação e avaliar a necessidade individual.",
        "B": "Usar bloqueador para dispensar analgesia.",
        "C": "Paralisar todo adulto em prona, obrigatoriamente.",
        "D": "Interpretar ausência de movimento como prova de inconsciência.",
        "E": "Escolher sempre dose fixa porque superioridade é definitiva."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Bloqueio não substitui resolver fatores ajustáveis de assincronia.",
        "B": "Incorreta. Paralisia não promove analgesia.",
        "C": "Incorreta. Não há essa indicação universal apenas pela posição.",
        "D": "Incorreta. Paralisia mascara resposta motora, sem garantir sedação.",
        "E": "Incorreta. A diretriz reconhece incerteza entre estratégias de dose."
      },
      "synthesis": "Bloqueio não substitui resolver fatores ajustáveis de assincronia.",
      "pearl": "🧠 Antes do bloqueio neuromuscular: Otimizar ventilador, analgesia e sedação e avaliar a necessidade individual.",
      "sourceRefs": [
        "NOV_NMB26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-017",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "ESBL e sítio de infecção",
      "difficulty": "Difícil",
      "tags": [
        "infeccoes-antimicrobianos",
        "esbl-e-s-tio-de-infec-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto tem bacteremia por E. coli produtora de ESBL. O laboratório informa cefepime sensível. Qual cuidado da orientação IDSA 2026 é pertinente?",
      "options": {
        "A": "O resultado sensível torna qualquer sítio equivalente à cistite.",
        "B": "Não escolher cefepime automaticamente; infecção invasiva por ESBL exige opção apropriada.",
        "C": "Trocar por nitrofurantoína para tratar a bacteremia.",
        "D": "TratarESBL como mecanismo igual a toda carbapenemase.",
        "E": "Ignorar o agente e escolher apenas o antibiótico mais novo."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Sítio e evidência clínica modificam a decisão.",
        "B": "Correta. A orientação sugere evitar cefepime em infecção extraurinária por ESBL.",
        "C": "Incorreta. Nitrofurantoína não é tratamento de infecção sistêmica.",
        "D": "Incorreta. Mecanismos de resistência não são sinônimos.",
        "E": "Incorreta. Escolha exige microbiologia, sítio e avaliação clínica."
      },
      "synthesis": "A orientação sugere evitar cefepime em infecção extraurinária por ESBL.",
      "pearl": "🧠 ESBL e sítio de infecção: Não escolher cefepime automaticamente; infecção invasiva por ESBL exige opção apropriada.",
      "sourceRefs": [
        "NOV_AMR26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-018",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "AmpC e mudança de resistência",
      "difficulty": "Difícil",
      "tags": [
        "infeccoes-antimicrobianos",
        "ampc-e-mudan-a-de-resist-ncia",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Enterobacter cloacae causa bacteremia invasiva. Há proposta de ceftriaxona porque a primeira amostra era sensível. Qual problema deve ser considerado?",
      "options": {
        "A": "Toda sensibilidade inicial exclui resistência durante tratamento.",
        "B": "TodoEnterobacter exige o mesmo fármaco independente do antibiograma.",
        "C": "Risco de expressão relevante de AmpC e emergência de resistência durante terapia.",
        "D": "AmpC é marcador de infecção viral concomitante.",
        "E": "Ceftriaxona é obrigatória mesmo diante de falha clínica."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. A expressão do mecanismo pode alterar a atividade clínica.",
        "B": "Incorreta. O plano ainda depende de sítio, gravidade e susceptibilidade.",
        "C": "Correta. A IDSA distingue infecção invasiva de situações não graves selecionadas.",
        "D": "Incorreta. AmpC é mecanismo bacteriano de resistência.",
        "E": "Incorreta. Evolução e microbiologia devem provocar reavaliação."
      },
      "synthesis": "A IDSA distingue infecção invasiva de situações não graves selecionadas.",
      "pearl": "🧠 AmpC e mudança de resistência: Risco de expressão relevante de AmpC e emergência de resistência durante terapia.",
      "sourceRefs": [
        "NOV_AMR26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-019",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "Colonização e patógeno resistente",
      "difficulty": "Médio",
      "tags": [
        "infeccoes-antimicrobianos",
        "coloniza-o-e-pat-geno-resistente",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Aspirado traqueal cresce Stenotrophomonas em adulto ventilado que melhora, sem novo infiltrado ou piora sistêmica. Qual interpretação deve preceder uma combinação antimicrobiana?",
      "options": {
        "A": "Todo isolamento determina pneumonia e exige terapia máxima.",
        "B": "A resistência dispensa avaliar foco e qualidade da amostra.",
        "C": "A melhora comprova que nenhuma cultura futura terá valor.",
        "D": "Distinguir colonização de infecção clinicamente relevante.",
        "E": "Iniciar antifúngico porque o nome do agente é incomum."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. A cultura precisa ser integrada ao quadro.",
        "B": "Incorreta. Esses elementos continuam essenciais.",
        "C": "Incorreta. A interpretação deve acompanhar a evolução.",
        "D": "Correta. Isolamento de um microrganismo resistente não basta para atribuir doença.",
        "E": "Incorreta. Stenotrophomonas é bactéria, não fungo."
      },
      "synthesis": "Isolamento de um microrganismo resistente não basta para atribuir doença.",
      "pearl": "🧠 Colonização e patógeno resistente: Distinguir colonização de infecção clinicamente relevante.",
      "sourceRefs": [
        "NOV_AMR26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-020",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "Documentar clareamento da candidemia",
      "difficulty": "Médio",
      "tags": [
        "infeccoes-antimicrobianos",
        "documentar-clareamento-da-candidemia",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto em tratamento de candidemia melhorou da febre, mas ainda não tem hemocultura de controle. Qual tarefa continua necessária?",
      "options": {
        "A": "Considerar o desaparecimento da febre como cultura negativa.",
        "B": "Usar cultura de secreção respiratória como substituta.",
        "C": "Contar tratamento apenas desde a primeira dose sem revisar complicações.",
        "D": "Suspender imediatamente porque o adulto está afebril.",
        "E": "Obter hemoculturas seriadas para documentar a depuração da corrente sanguínea."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Resposta clínica não documenta depuração microbiológica.",
        "B": "Incorreta. Esse sítio não demonstra clareamento do sangue.",
        "C": "Incorreta. Clareamento e focos secundários integram a duração.",
        "D": "Incorreta. Melhora isolada não define terapia concluída.",
        "E": "Correta. A IDSA recomenda controles diários ou a cada dois dias nesse seguimento."
      },
      "synthesis": "A IDSA recomenda controles diários ou a cada dois dias nesse seguimento.",
      "pearl": "🧠 Documentar clareamento da candidemia: Obter hemoculturas seriadas para documentar a depuração da corrente sanguínea.",
      "sourceRefs": [
        "NOV_CAND16"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-021",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "Criptococose e início da TARV",
      "difficulty": "Difícil",
      "tags": [
        "infeccoes-antimicrobianos",
        "criptococose-e-in-cio-datarv",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com HIV sem TARV inicia tratamento de meningite criptocócica. Qual discussão de tempo é apoiada pelo NIH?",
      "options": {
        "A": "Em geral adiar o início da TARV por 4–6 semanas após iniciar antifúngicos para doença do SNC.",
        "B": "Iniciar sempre no mesmo dia, independentemente do SNC.",
        "C": "Nunca iniciar TARV após meningite criptocócica.",
        "D": "Aplicar a mesma janela a qualquer infecção oportunista.",
        "E": "Decidir apenas pela contagem de CD4, ignorando pressão intracraniana."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Esse cenário difere de outras infecções oportunistas e exige plano especializado.",
        "B": "Incorreta. TARV muito precoce nessa população pode aumentar mortalidade.",
        "C": "Incorreta. O adiamento é temporário, não abandono do tratamento do HIV.",
        "D": "Incorreta. População e etiologia determinam recomendações distintas.",
        "E": "Incorreta. Complicações e controle da infecção também importam."
      },
      "synthesis": "Esse cenário difere de outras infecções oportunistas e exige plano especializado.",
      "pearl": "🧠 Criptococose e início da TARV: Em geral adiar o início da TARV por 4–6 semanas após iniciar antifúngicos para doença do SNC.",
      "sourceRefs": [
        "NOV_CRYPTO"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-022",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "Bacteremia persistente porS. aureus",
      "difficulty": "Difícil",
      "tags": [
        "infeccoes-antimicrobianos",
        "bacteremia-persistente-pors-aureus",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com bacteremia porS. aureus mantém hemoculturas positivas após 48 horas de tratamento apropriado. Qual consequência clínica é mais adequada?",
      "options": {
        "A": "Classificar automaticamente como contaminação de pele.",
        "B": "Intensificar a busca de foco endovascular ou profundo e revisar controle do foco.",
        "C": "Dispensar investigação porque o fármaco é sensível.",
        "D": "Declarar cura se a febre estiver menor.",
        "E": "Escolher duração curta fixa sem estratificar risco."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. S. aureus no sangue requer avaliação clínica séria.",
        "B": "Correta. Persistência é sinal de risco que exige investigação, não apenas mais dias de antibiótico.",
        "C": "Incorreta. Sensibilidade não exclui foco não controlado.",
        "D": "Incorreta. A bacteremia permanece documentada.",
        "E": "Incorreta. Duração depende de investigação, foco e evolução."
      },
      "synthesis": "Persistência é sinal de risco que exige investigação, não apenas mais dias de antibiótico.",
      "pearl": "🧠 Bacteremia persistente porS. aureus: Intensificar a busca de foco endovascular ou profundo e revisar controle do foco.",
      "sourceRefs": [
        "NOV_SAB26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-023",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "Duração da pneumonia associada à ventilação",
      "difficulty": "Médio",
      "tags": [
        "infeccoes-antimicrobianos",
        "dura-o-da-pneumonia-associada-ventila-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com PAV teve resposta clínica adequada, sem abscesso, empiema ou outra complicação. Qual leitura da ATS/IDSA 2016 é apropriada?",
      "options": {
        "A": "Todo isolamento de gram-negativo exige 21 dias.",
        "B": "Radiografia ainda alterada impede qualquer término.",
        "C": "O curso usual é de 7 dias, com ajustes conforme a evolução e as complicações.",
        "D": "Sete dias valem mesmo para foco complicado sem controle.",
        "E": "O curso termina obrigatoriamente na primeira melhora da febre."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Espécie isolada não impõe esse curso universal.",
        "B": "Incorreta. Resolução radiológica pode atrasar em relação à clínica.",
        "C": "Correta. A recomendação não corresponde a prolongar automaticamente toda PAV por semanas.",
        "D": "Incorreta. Complicações exigem decisão individualizada.",
        "E": "Incorreta. Duração não é guiada por esse dado isolado."
      },
      "synthesis": "A recomendação não corresponde a prolongar automaticamente toda PAV por semanas.",
      "pearl": "🧠 Duração da pneumonia associada à ventilação: O curso usual é de 7 dias, com ajustes conforme a evolução e as complicações.",
      "sourceRefs": [
        "NOV_VAP16"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-024",
      "block": "infeccoes-antimicrobianos",
      "topicId": "infeccoes-antimicrobianos",
      "topicLabel": "Infecções e antimicrobianos",
      "subtopic": "Sistema de drenagem urinária",
      "difficulty": "Médio",
      "tags": [
        "infeccoes-antimicrobianos",
        "sistema-de-drenagem-urin-ria",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com cateter vesical ainda indicado teve desconexão e contaminação do sistema fechado. Qual conduta é compatível com prevenção de ITU?",
      "options": {
        "A": "Ignorar a desconexão se a urina estiver clara.",
        "B": "Administrar antibiótico profilático indefinido para compensar a quebra.",
        "C": "Trocar todos os cateteres diariamente de rotina.",
        "D": "Restabelecer o sistema fechado com troca apropriada segundo técnica e protocolo.",
        "E": "Irrigar sempre a bexiga com antibiótico."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Aparência não comprova esterilidade.",
        "B": "Incorreta. Antimicrobiano não substitui técnica e indicação adequada.",
        "C": "Incorreta. A CDC orienta troca por indicação clínica, não intervalo fixo.",
        "D": "Correta. Quebra da barreira exige resposta; trocas não devem seguir calendário arbitrário.",
        "E": "Incorreta. Essa prática não é prevenção rotineira recomendada."
      },
      "synthesis": "Quebra da barreira exige resposta; trocas não devem seguir calendário arbitrário.",
      "pearl": "🧠 Sistema de drenagem urinária: Restabelecer o sistema fechado com troca apropriada segundo técnica e protocolo.",
      "sourceRefs": [
        "NOV_CDC_CAUTI"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-025",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Corticoide no TCE",
      "difficulty": "Médio",
      "tags": [
        "neurocritico",
        "corticoide-no-tce",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com TCE grave tem edema cerebral traumático. Propõe-se metilprednisolona em alta dose para reduzir mortalidade. Qual avaliação é adequada?",
      "options": {
        "A": "Prescrever porque todo edema cerebral é vasogênico tumoral.",
        "B": "Usar até a PIC normalizar, sem avaliar etiologia.",
        "C": "Considerar a medicação obrigatória em qualquer neurolesão.",
        "D": "Aplicar a recomendação de meningite tuberculosa ao trauma.",
        "E": "Não usar corticoide para esse objetivo no TCE grave."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Edema traumático não equivale ao associado a tumor.",
        "B": "Incorreta. Redução de um número não demonstra benefício clínico.",
        "C": "Incorreta. Indicações diferem entre etiologias.",
        "D": "Incorreta. A população e o mecanismo são diferentes.",
        "E": "Correta. Na lesão traumática, corticoide não melhora esse desfecho e pode causar dano."
      },
      "synthesis": "Na lesão traumática, corticoide não melhora esse desfecho e pode causar dano.",
      "pearl": "🧠 Corticoide no TCE: Não usar corticoide para esse objetivo no TCE grave.",
      "sourceRefs": [
        "NOV_BTF4"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-026",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Hiperventilação profilática",
      "difficulty": "Difícil",
      "tags": [
        "neurocritico",
        "hiperventila-o-profil-tica",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com TCE grave está ventilado, sem sinais atuais de herniação. A equipe quer manter PaCO₂ em 24 mmHg profilaticamente. Qual crítica é correta?",
      "options": {
        "A": "Hiperventilação profilática prolongada pode reduzir fluxo cerebral e deve ser evitada.",
        "B": "PaCO₂ baixa sempre melhora a oferta de oxigênio cerebral.",
        "C": "O alvo deve ser mantido por uma semana em todo TCE.",
        "D": "Hipocapnia torna dispensável medir oxigenação.",
        "E": "Ventilação pode ser decidida apenas pela saturação periférica."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Uso de resgate é situação distinta e exige monitorização especializada.",
        "B": "Incorreta. Vasoconstrição pode comprometer perfusão.",
        "C": "Incorreta. A recomendação não sustenta essa rotina.",
        "D": "Incorreta. PaCO₂ não substitui avaliar oxigenação sistêmica e cerebral.",
        "E": "Incorreta. CO₂, pressão e perfusão também precisam ser considerados."
      },
      "synthesis": "Uso de resgate é situação distinta e exige monitorização especializada.",
      "pearl": "🧠 Hiperventilação profilática: Hiperventilação profilática prolongada pode reduzir fluxo cerebral e deve ser evitada.",
      "sourceRefs": [
        "NOV_BTF4"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-027",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Anticoagulação e hemorragia cerebral",
      "difficulty": "Difícil",
      "tags": [
        "neurocritico",
        "anticoagula-o-e-hemorragia-cerebral",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto em anticoagulante oral direto apresenta hemorragia intracerebral. INR é normal. Qual inferência deve ser evitada?",
      "options": {
        "A": "Identificar fármaco, última dose e função renal.",
        "B": "Concluir que INR normal exclui efeito do anticoagulante oral direto.",
        "C": "Discutir reversão conforme agente e gravidade.",
        "D": "Reconhecer que o tempo desde a última dose importa.",
        "E": "Solicitar apoio especializado sem atrasar estabilização."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Esses dados são relevantes para a avaliação urgente.",
        "B": "Correta. INR não quantifica confiavelmente a atividade de todos esses fármacos.",
        "C": "Incorreta. Reversão é específica ao mecanismo e contexto.",
        "D": "Incorreta. A exposição residual varia ao longo do tempo.",
        "E": "Incorreta. Estabilização e investigação devem ocorrer em paralelo."
      },
      "synthesis": "INR não quantifica confiavelmente a atividade de todos esses fármacos.",
      "pearl": "🧠 Anticoagulação e hemorragia cerebral: Concluir que INR normal exclui efeito do anticoagulante oral direto.",
      "sourceRefs": [
        "NOV_ICH22"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-028",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Profilaxia mecânica na HIC",
      "difficulty": "Médio",
      "tags": [
        "neurocritico",
        "profilaxia-mec-nica-na-hic",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto não deambulante tem hemorragia intracerebral espontânea recém-diagnosticada. Qual medida de prevenção de trombose é apoiada pela AHA/ASA?",
      "options": {
        "A": "Adiar toda prevenção até voltar a caminhar.",
        "B": "Usar apenas meias elásticas como equivalentes à compressão pneumática.",
        "C": "Compressão pneumática intermitente desde o dia do diagnóstico, se aplicável.",
        "D": "Iniciar anticoagulação plena em todos imediatamente.",
        "E": "Prescrever filtro de cava para qualquer pessoa imóvel."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. A imobilidade mantém risco tromboembólico.",
        "B": "Incorreta. Não há equivalência de eficácia nessa população.",
        "C": "Correta. Meias elásticas isoladas não oferecem a mesma proteção demonstrada.",
        "D": "Incorreta. Isso amplia risco e não corresponde à profilaxia universal.",
        "E": "Incorreta. Imobilidade isolada não autoriza filtro."
      },
      "synthesis": "Meias elásticas isoladas não oferecem a mesma proteção demonstrada.",
      "pearl": "🧠 Profilaxia mecânica na HIC: Compressão pneumática intermitente desde o dia do diagnóstico, se aplicável.",
      "sourceRefs": [
        "NOV_ICH22",
        "NOV_ICH25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-029",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Prevenção primária de crises",
      "difficulty": "Médio",
      "tags": [
        "neurocritico",
        "preven-o-prim-ria-de-crises",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com HIC espontânea não teve crise clínica ou eletrográfica. O residente propõe anticonvulsivante obrigatório por meses. Qual leitura da ESO/EANS 2025 é adequada?",
      "options": {
        "A": "O fármaco é obrigatório porque qualquer HIC causa epilepsia.",
        "B": "A recomendação também proíbe tratar crise eletrográfica.",
        "C": "Déficit focal estável comprova estado de mal.",
        "D": "Não instituir profilaxia antiepiléptica primária rotineira nesse cenário.",
        "E": "O benefício de uso indefinido está demonstrado para todos."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Risco aumentado não equivale a benefício comprovado de profilaxia.",
        "B": "Incorreta. Tratamento de crise é pergunta clínica diferente.",
        "C": "Incorreta. Déficit pela lesão estrutural não confirma crise.",
        "D": "Correta. Ausência de indicação preventiva não impede tratar crise documentada.",
        "E": "Incorreta. A evidência não sustenta essa generalização."
      },
      "synthesis": "Ausência de indicação preventiva não impede tratar crise documentada.",
      "pearl": "🧠 Prevenção primária de crises: Não instituir profilaxia antiepiléptica primária rotineira nesse cenário.",
      "sourceRefs": [
        "NOV_ICH25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-030",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Nimodipina na HSA",
      "difficulty": "Médio",
      "tags": [
        "neurocritico",
        "nimodipina-na-hsa",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com HSA aneurismática é internado em unidade especializada. Qual medida tem apoio na diretriz europeia de 2026?",
      "options": {
        "A": "Substituir nimodipina por estatina obrigatória para todos.",
        "B": "Usar sulfato de magnésio rotineiro como equivalente comprovado.",
        "C": "Dispensar tratar o aneurisma porque há nimodipina.",
        "D": "Atribuir ao medicamento garantia de ausência de isquemia tardia.",
        "E": "Administração oral de nimodipina, com avaliação de tolerância e plano da equipe."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. A diretriz não apoia estatina rotineira para esse objetivo.",
        "B": "Incorreta. Não há equivalência sustentada para prevenção universal.",
        "C": "Incorreta. Controle da lesão causadora continua essencial.",
        "D": "Incorreta. Risco persiste e exige vigilância.",
        "E": "Correta. A recomendação visa reduzir complicações isquêmicas e melhorar desfechos."
      },
      "synthesis": "A recomendação visa reduzir complicações isquêmicas e melhorar desfechos.",
      "pearl": "🧠 Nimodipina na HSA: Administração oral de nimodipina, com avaliação de tolerância e plano da equipe.",
      "sourceRefs": [
        "NOV_HSA26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-031",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Volemia na HSA",
      "difficulty": "Médio",
      "tags": [
        "neurocritico",
        "volemia-na-hsa",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com HSA aneurismática está estável e sem déficit tardio. A equipe cogita expansão contínua para produzir hipervolemia preventiva. Qual princípio é adequado?",
      "options": {
        "A": "Buscar euvolemia e evitar hipervolemia profilática indiscriminada.",
        "B": "Manter balanço positivo crescente como objetivo universal.",
        "C": "Provocar desidratação para evitar qualquer edema.",
        "D": "Decidir volemia só por um valor de pressão venosa central.",
        "E": "Parar de acompanhar sódio porque o aneurisma foi tratado."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Sobrecarga pode causar complicações sem benefício preventivo estabelecido.",
        "B": "Incorreta. Balanço positivo não é sinônimo de perfusão cerebral adequada.",
        "C": "Incorreta. Hipovolemia pode comprometer perfusão.",
        "D": "Incorreta. Medida isolada não define todo o estado circulatório.",
        "E": "Incorreta. Distúrbios de sódio e perdas podem ocorrer durante o curso."
      },
      "synthesis": "Sobrecarga pode causar complicações sem benefício preventivo estabelecido.",
      "pearl": "🧠 Volemia na HSA: Buscar euvolemia e evitar hipervolemia profilática indiscriminada.",
      "sourceRefs": [
        "NOV_HSA23"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-032",
      "block": "neurocritico",
      "topicId": "neurocritico",
      "topicLabel": "Neurocrítico",
      "subtopic": "Hemorragia cerebelar e urgência",
      "difficulty": "Difícil",
      "tags": [
        "neurocritico",
        "hemorragia-cerebelar-e-urg-ncia",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com hematoma cerebelar apresenta piora de consciência e hidrocefalia por compressão do tronco. Qual decisão não deve ser postergada?",
      "options": {
        "A": "Aguardar obrigatoriamente uma semana para repetir a imagem.",
        "B": "Avaliação neurocirúrgica urgente para tratamento da compressão e hidrocefalia.",
        "C": "Tratar como vertigem periférica sem revisar a tomografia.",
        "D": "Considerar o tamanho do hematoma o único critério possível.",
        "E": "Inferir bom prognóstico apenas pela ausência de hemiparesia."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. A deterioração atual exige resposta urgente.",
        "B": "Correta. Na fossa posterior, deterioração e compressão podem exigir intervenção imediata.",
        "C": "Incorreta. Há lesão estrutural e sinais de gravidade.",
        "D": "Incorreta. Estado neurológico, hidrocefalia e tronco também importam.",
        "E": "Incorreta. Comprometimento cerebelar pode ser grave sem hemiparesia."
      },
      "synthesis": "Na fossa posterior, deterioração e compressão podem exigir intervenção imediata.",
      "pearl": "🧠 Hemorragia cerebelar e urgência: Avaliação neurocirúrgica urgente para tratamento da compressão e hidrocefalia.",
      "sourceRefs": [
        "NOV_ICH22"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-033",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Diurese no diagnóstico de LRA",
      "difficulty": "Médio",
      "tags": [
        "renal-eletrolitos",
        "diurese-no-diagn-stico-de-lra",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto de 70 kg elimina 140 mL de urina em 6 horas. Creatinina ainda está próxima da basal. Qual interpretação é correta?",
      "options": {
        "A": "LRA é impossível enquanto a creatinina não ultrapassar 2 mg/dL.",
        "B": "A diurese está normal porque houve alguma urina.",
        "C": "O critério de diurese pode identificar LRA antes de elevação evidente da creatinina.",
        "D": "Diagnosticar obstrução apenas pelo volume urinário.",
        "E": "Administrar fluido sem avaliar volume e permeabilidade do cateter."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Não há esse limiar absoluto para todos.",
        "B": "Incorreta. Produção presente não exclui oligúria.",
        "C": "Correta. A diurese é aproximadamente 0,33 mL/kg/h nesse intervalo.",
        "D": "Incorreta. A causa exige avaliação adicional.",
        "E": "Incorreta. Conduta deve seguir a etiologia e o estado circulatório."
      },
      "synthesis": "A diurese é aproximadamente 0,33 mL/kg/h nesse intervalo.",
      "pearl": "🧠 Diurese no diagnóstico de LRA: O critério de diurese pode identificar LRA antes de elevação evidente da creatinina.",
      "sourceRefs": [
        "NOV_KDIGO12"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-034",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Mudança de creatinina",
      "difficulty": "Médio",
      "tags": [
        "renal-eletrolitos",
        "mudan-a-de-creatinina",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. A creatinina de um adulto passa de 0,8 para 1,2 mg/dL em 36 horas. Qual leitura da definição KDIGO final de 2012 é adequada?",
      "options": {
        "A": "Excluir LRA porque o valor final está perto da referência laboratorial.",
        "B": "Esperar creatinina dobrar para reconhecer qualquer lesão.",
        "C": "Atribuir obrigatoriamente a necrose tubular sem investigar.",
        "D": "A elevação absoluta de 0,4 mg/dL já atende ao critério temporal de LRA.",
        "E": "Usar rascunho KDIGO 2026 como diretriz final já publicada."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Mudança em relação à basal também integra a definição.",
        "B": "Incorreta. Esse não é o único critério diagnóstico.",
        "C": "Incorreta. Critério funcional não define a causa.",
        "D": "Correta. O aumento de pelo menos 0,3 mg/dL em 48 horas é relevante.",
        "E": "Incorreta. A situação editorial do documento precisa ser respeitada."
      },
      "synthesis": "O aumento de pelo menos 0,3 mg/dL em 48 horas é relevante.",
      "pearl": "🧠 Mudança de creatinina: A elevação absoluta de 0,4 mg/dL já atende ao critério temporal de LRA.",
      "sourceRefs": [
        "NOV_KDIGO12"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-035",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Diuréticos na LRA",
      "difficulty": "Médio",
      "tags": [
        "renal-eletrolitos",
        "diur-ticos-na-lra",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com risco de LRA está euvolêmico. Propõe-se furosemida exclusivamente para impedir o aumento de creatinina. Qual avaliação é adequada?",
      "options": {
        "A": "Maior volume de urina comprova recuperação da filtração.",
        "B": "Furosemida impede toda necessidade futura de diálise.",
        "C": "A ausência de edema torna diurético obrigatoriamente protetor.",
        "D": "Todo adulto oligúrico precisa da mesma dose, sem avaliação.",
        "E": "Diurético não é estratégia rotineira para prevenir LRA."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Diurese induzida pode ocorrer sem reversão da lesão.",
        "B": "Incorreta. Esse benefício não está demonstrado.",
        "C": "Incorreta. Pode haver depleção de volume e dano.",
        "D": "Incorreta. A decisão depende da causa e do estado volêmico.",
        "E": "Correta. Seu eventual papel em sobrecarga não demonstra prevenção de lesão."
      },
      "synthesis": "Seu eventual papel em sobrecarga não demonstra prevenção de lesão.",
      "pearl": "🧠 Diuréticos na LRA: Diurético não é estratégia rotineira para prevenir LRA.",
      "sourceRefs": [
        "NOV_KDIGO12"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-036",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Indicação emergencial de TRR",
      "difficulty": "Médio",
      "tags": [
        "renal-eletrolitos",
        "indica-o-emergencial-de-trr",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com LRA tem edema pulmonar grave refratário ao manejo clínico e hipoxemia. A creatinina é 2,0 mg/dL. Qual decisão é adequada?",
      "options": {
        "A": "Avaliar TRR pela complicação ameaçadora, sem exigir creatinina muito elevada.",
        "B": "Aguardar creatinina maior que 8 mg/dL em qualquer situação.",
        "C": "Descartar TRR porque o valor não parece alto.",
        "D": "Exigir anúria completa para considerar suporte renal.",
        "E": "Usar apenas ureia isolada para decidir toda a conduta."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Indicações emergenciais dependem das repercussões clínicas e metabólicas.",
        "B": "Incorreta. Não existe esse pré-requisito universal.",
        "C": "Incorreta. A complicação pode ser grave com creatinina menor.",
        "D": "Incorreta. Produção residual não elimina uma indicação urgente.",
        "E": "Incorreta. Tendência, complicações e contexto são essenciais."
      },
      "synthesis": "Indicações emergenciais dependem das repercussões clínicas e metabólicas.",
      "pearl": "🧠 Indicação emergencial de TRR: Avaliar TRR pela complicação ameaçadora, sem exigir creatinina muito elevada.",
      "sourceRefs": [
        "NOV_KDIGO12"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-037",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Hipoglicemia após tratar hipercalemia",
      "difficulty": "Médio",
      "tags": [
        "renal-eletrolitos",
        "hipoglicemia-ap-s-tratar-hipercalemia",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com insuficiência renal recebeu insulina e glicose para hipercalemia. O potássio caiu, e uma glicemia inicial é normal. Qual cuidado ainda é necessário?",
      "options": {
        "A": "Parar glicemias assim que o potássio cair.",
        "B": "Manter monitorização seriada da glicemia por risco de hipoglicemia tardia.",
        "C": "Supor que glicose administrada impede toda hipoglicemia.",
        "D": "Usar apenas sintomas para detectar hipoglicemia no sedado.",
        "E": "Repetir insulina automaticamente a cada glicemia normal."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. A ação da insulina pode persistir.",
        "B": "Correta. A resposta inicial não encerra a vigilância após insulina.",
        "C": "Incorreta. A proteção não é absoluta, especialmente na disfunção renal.",
        "D": "Incorreta. Sintomas podem estar ausentes ou mascarados.",
        "E": "Incorreta. Repetição exige potássio, glicose e avaliação clínica."
      },
      "synthesis": "A resposta inicial não encerra a vigilância após insulina.",
      "pearl": "🧠 Hipoglicemia após tratar hipercalemia: Manter monitorização seriada da glicemia por risco de hipoglicemia tardia.",
      "sourceRefs": [
        "NOV_UKKA26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-038",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Pseudohipercalemia",
      "difficulty": "Médio",
      "tags": [
        "renal-eletrolitos",
        "pseudohipercalemia",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto estável, sem alteração eletrocardiográfica, tem potássio elevado em amostra hemolisada, discordante da evolução. Qual próxima avaliação é apropriada?",
      "options": {
        "A": "Declarar que todo resultado hemolisado é necessariamente inofensivo.",
        "B": "Ignorar para sempre qualquer dosagem de potássio posterior.",
        "C": "Repetir coleta adequada rapidamente e confrontar resultado, ECG e contexto.",
        "D": "Prescrever diálise apenas pela amostra sem revisar o quadro.",
        "E": "Usar ECG normal como exclusão absoluta de hipercalemia grave."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Pode coexistir hipercalemia real.",
        "B": "Incorreta. Nova amostra pode esclarecer o risco.",
        "C": "Correta. Suspeita de artefato exige confirmação; não deve atrasar emergência verdadeira.",
        "D": "Incorreta. Um resultado questionável requer integração clínica.",
        "E": "Incorreta. ECG normal não tem sensibilidade suficiente para excluir risco."
      },
      "synthesis": "Suspeita de artefato exige confirmação; não deve atrasar emergência verdadeira.",
      "pearl": "🧠 Pseudohipercalemia: Repetir coleta adequada rapidamente e confrontar resultado, ECG e contexto.",
      "sourceRefs": [
        "NOV_UKKA26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-039",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Hiponatremia com convulsão",
      "difficulty": "Médio",
      "tags": [
        "renal-eletrolitos",
        "hiponatremia-com-convuls-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com sódio 112 mmol/L apresenta convulsão e rebaixamento. Após suporte inicial, qual princípio orienta a correção?",
      "options": {
        "A": "Aguardar toda investigação etiológica antes de tratar.",
        "B": "Normalizar o sódio rapidamente até 140 mmol/L.",
        "C": "Usar restrição hídrica isolada como única resposta imediata.",
        "D": "Tratar a emergência sintomática com salina hipertônica monitorizada conforme protocolo.",
        "E": "Desconsiderar a história de duração e fatores de risco."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. A emergência neurológica não deve esperar a investigação completa.",
        "B": "Incorreta. Correção excessiva pode provocar desmielinização osmótica.",
        "C": "Incorreta. Ela não substitui a abordagem de sintomas graves.",
        "D": "Correta. Gravidade dos sintomas exige tratamento oportuno e controle da variação do sódio.",
        "E": "Incorreta. Esses dados orientam metas e prevenção de sobrecorreção."
      },
      "synthesis": "Gravidade dos sintomas exige tratamento oportuno e controle da variação do sódio.",
      "pearl": "🧠 Hiponatremia com convulsão: Tratar a emergência sintomática com salina hipertônica monitorizada conforme protocolo.",
      "sourceRefs": [
        "NOV_HIPONA"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-040",
      "block": "renal-eletrolitos",
      "topicId": "renal-eletrolitos",
      "topicLabel": "Renal e eletrólitos",
      "subtopic": "Sobrecorreção do sódio",
      "difficulty": "Difícil",
      "tags": [
        "renal-eletrolitos",
        "sobrecorre-o-do-s-dio",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com hiponatremia crônica e desnutrição desenvolve aquarese intensa após tratamento da causa. Qual mudança exige vigilância imediata?",
      "options": {
        "A": "Considerar toda diurese elevada como prova de tratamento sem risco.",
        "B": "Acompanhar sódio apenas após 48 horas.",
        "C": "Aumentar salina automaticamente porque a diurese cresceu.",
        "D": "Supor que desnutrição reduz risco de desmielinização.",
        "E": "Aceleração da subida do sódio, com revisão do plano para evitar sobrecorreção."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Aquarese pode aumentar a velocidade de correção.",
        "B": "Incorreta. A trajetória pode mudar rapidamente.",
        "C": "Incorreta. O balanço de água livre deve ser reavaliado.",
        "D": "Incorreta. Desnutrição é fator de vulnerabilidade, não proteção.",
        "E": "Correta. A diurese aquosa pode elevar o sódio além do previsto pela solução infundida."
      },
      "synthesis": "A diurese aquosa pode elevar o sódio além do previsto pela solução infundida.",
      "pearl": "🧠 Sobrecorreção do sódio: Aceleração da subida do sódio, com revisão do plano para evitar sobrecorreção.",
      "sourceRefs": [
        "NOV_HIPONA"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-041",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "Transição da insulina na CAD",
      "difficulty": "Médio",
      "tags": [
        "metabolico-endocrino",
        "transi-o-da-insulina-na-cad",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto resolveu a CAD e vai passar da insulina IV para esquema subcutâneo. Qual etapa reduz lacuna de cobertura?",
      "options": {
        "A": "Planejar sobreposição de 1–2 horas entre insulina subcutânea e retirada da IV.",
        "B": "Retirar IV e esperar a hiperglicemia reaparecer para prescrever basal.",
        "C": "Manter apenas correções avulsas sem plano basal quando ele é necessário.",
        "D": "Usar a mesma dose para qualquer função renal ou ingestão.",
        "E": "Presumir que resolução da CAD dispensa investigar o precipitante."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. A ação do esquema subcutâneo precisa começar antes da interrupção da infusão.",
        "B": "Incorreta. A lacuna favorece rebote metabólico.",
        "C": "Incorreta. Cobertura basal pode ser essencial para prevenir recorrência.",
        "D": "Incorreta. O esquema exige ajuste ao contexto.",
        "E": "Incorreta. A causa deve ser abordada para prevenir nova crise."
      },
      "synthesis": "A ação do esquema subcutâneo precisa começar antes da interrupção da infusão.",
      "pearl": "🧠 Transição da insulina na CAD: Planejar sobreposição de 1–2 horas entre insulina subcutânea e retirada da IV.",
      "sourceRefs": [
        "NOV_DKA24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-042",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "Osmolalidade efetiva",
      "difficulty": "Difícil",
      "tags": [
        "metabolico-endocrino",
        "osmolalidade-efetiva",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto tem sódio 150 mmol/L e glicose 900 mg/dL. Usando 2 ×Na + glicose/18, qual é a osmolalidade efetiva estimada?",
      "options": {
        "A": "200 mOsm/kg.",
        "B": "350 mOsm/kg.",
        "C": "450 mOsm/kg.",
        "D": "1200 mOsm/kg.",
        "E": "É impossível estimar sem adicionar a ureia nessa fórmula."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Esse valor não corresponde à soma proposta.",
        "B": "Correta. Duas vezes 150 mais 900 dividido por 18 resulta em 350.",
        "C": "Incorreta. A conversão da glicose precisa respeitar o divisor.",
        "D": "Incorreta. Somar glicose em mg/dL diretamente ignora a conversão.",
        "E": "Incorreta. A fórmula fornecida estima osmolalidade efetiva, sem ureia."
      },
      "synthesis": "Duas vezes 150 mais 900 dividido por 18 resulta em 350.",
      "pearl": "🧠 Osmolalidade efetiva: 350 mOsm/kg.",
      "sourceRefs": [
        "NOV_DKA24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-043",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "CAD e estado hiperosmolar mistos",
      "difficulty": "Médio",
      "tags": [
        "metabolico-endocrino",
        "cad-e-estado-hiperosmolar-mistos",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com glicose 820 mg/dL tem hiperosmolalidade, β-hidroxibutirato 4,5 mmol/L e pH 7,22. Qual leitura evita uma classificação inadequada?",
      "options": {
        "A": "O valor da glicose elimina a necessidade de avaliar cetonas.",
        "B": "A acidose deve ser ignorada se o sódio estiver alto.",
        "C": "Há características de crise mista; hiperglicemia extrema não exclui cetoacidose.",
        "D": "Todo quadro hiperosmolar é isento de cetose significativa.",
        "E": "O diagnóstico pode ser fechado apenas pela glicemia capilar."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. A coexistência muda a abordagem.",
        "B": "Incorreta. Sódio elevado não neutraliza a acidose.",
        "C": "Correta. Hiperosmolalidade pode coexistir com cetose e acidose significativas.",
        "D": "Incorreta. Existem apresentações sobrepostas.",
        "E": "Incorreta. São necessários outros dados metabólicos e clínicos."
      },
      "synthesis": "Hiperosmolalidade pode coexistir com cetose e acidose significativas.",
      "pearl": "🧠 CAD e estado hiperosmolar mistos: Há características de crise mista; hiperglicemia extrema não exclui cetoacidose.",
      "sourceRefs": [
        "NOV_DKA24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-044",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "Basal no diabetes tipo 1 durante jejum",
      "difficulty": "Médio",
      "tags": [
        "metabolico-endocrino",
        "basal-no-diabetes-tipo1-durante-jejum",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com diabetes tipo 1 fica sem alimentação por doença aguda. Qual princípio de prescrição é adequado para prevenir CAD durante o jejum?",
      "options": {
        "A": "Suspender toda insulina enquanto não houver refeições.",
        "B": "Usar a dieta como substituta da insulina basal.",
        "C": "Monitorizar apenas quando aparecer poliúria.",
        "D": "A insulina basal não deve ser simplesmente suspensa por estar em jejum.",
        "E": "Presumir que glicemia momentaneamente normal exclui risco futuro."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Deficiência absoluta de insulina favorece cetose.",
        "B": "Incorreta. Alimentação não substitui o hormônio necessário.",
        "C": "Incorreta. A prevenção exige acompanhamento antes de sintomas tardios.",
        "D": "Correta. É necessário ajustar o plano e monitorizar, mantendo cobertura basal apropriada.",
        "E": "Incorreta. Jejum e doença não eliminam a necessidade de basal."
      },
      "synthesis": "É necessário ajustar o plano e monitorizar, mantendo cobertura basal apropriada.",
      "pearl": "🧠 Basal no diabetes tipo 1 durante jejum: A insulina basal não deve ser simplesmente suspensa por estar em jejum.",
      "sourceRefs": [
        "NOV_ADA26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-045",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "Medição de glicose no choque",
      "difficulty": "Difícil",
      "tags": [
        "metabolico-endocrino",
        "medi-o-de-glicose-no-choque",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto em vasopressor tem extremidades frias e glicemia capilar inesperadamente baixa, discordante de outra medida. Qual avaliação é mais segura?",
      "options": {
        "A": "A medição capilar é infalível em toda condição circulatória.",
        "B": "Ignorar um valor baixo apenas porque parece discordante.",
        "C": "Aumentar insulina enquanto se aguarda confirmação de valor baixo.",
        "D": "Usar somente urina para ajustar insulina na UTI.",
        "E": "Confirmar com método/amostra apropriados à perfusão, sem atrasar tratar hipoglicemia suspeita."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Perfusão e técnica interferem na medida.",
        "B": "Incorreta. É preciso confirmar e proteger o adulto de risco imediato.",
        "C": "Incorreta. Isso pode agravar hipoglicemia.",
        "D": "Incorreta. Glicosúria não substitui monitorização sanguínea adequada.",
        "E": "Correta. Má perfusão pode comprometer a confiabilidade da amostra capilar."
      },
      "synthesis": "Má perfusão pode comprometer a confiabilidade da amostra capilar.",
      "pearl": "🧠 Medição de glicose no choque: Confirmar com método/amostra apropriados à perfusão, sem atrasar tratar hipoglicemia suspeita.",
      "sourceRefs": [
        "NOV_GLIC24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-046",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "Crise adrenal e investigação",
      "difficulty": "Médio",
      "tags": [
        "metabolico-endocrino",
        "crise-adrenal-e-investiga-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com suspeita de crise adrenal tem choque, vômitos e hipoglicemia. Qual relação entre exames e tratamento é adequada?",
      "options": {
        "A": "Colher amostras se possível sem atraso e iniciar tratamento emergencial.",
        "B": "Aguardar teste de estímulo antes de qualquer tratamento.",
        "C": "Tratar apenas a glicose e ignorar a instabilidade.",
        "D": "Considerar cortisol isolado como requisito de toda decisão imediata.",
        "E": "Presumir que toda hiponatremia é SIADH sem avaliar adrenal."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Confirmação laboratorial não deve adiar suporte e glicocorticoide quando a suspeita é alta.",
        "B": "Incorreta. O atraso pode prolongar uma emergência potencialmente fatal.",
        "C": "Incorreta. A crise exige abordagem sistêmica.",
        "D": "Incorreta. O contexto clínico orienta a urgência.",
        "E": "Incorreta. Insuficiência adrenal integra o diferencial."
      },
      "synthesis": "Confirmação laboratorial não deve adiar suporte e glicocorticoide quando a suspeita é alta.",
      "pearl": "🧠 Crise adrenal e investigação: Colher amostras se possível sem atraso e iniciar tratamento emergencial.",
      "sourceRefs": [
        "NOV_ADRENAL"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-047",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "Coma mixedematoso",
      "difficulty": "Difícil",
      "tags": [
        "metabolico-endocrino",
        "coma-mixedematoso",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com hipotireoidismo interrompeu reposição e chega sonolento, hipotérmico, bradicárdico e hipoventilando. Qual princípio do consenso conjunto de 2026 é pertinente?",
      "options": {
        "A": "Usar sedativo para tratar a hipoventilação como ansiedade.",
        "B": "Suporte intensivo, glicocorticoide de estresse precoce e reposição tireoidiana cautelosa.",
        "C": "Aguardar coma profundo para considerar a síndrome.",
        "D": "Repor hormônio sem avaliar suporte ventilatório e circulatório.",
        "E": "Tratar a pontuação diagnóstica como prova independente do contexto."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Sedação pode piorar depressão ventilatória.",
        "B": "Correta. O plano contempla possível insuficiência adrenal e risco cardiovascular.",
        "C": "Incorreta. A apresentação pode ocorrer sem coma literal.",
        "D": "Incorreta. Disfunção orgânica requer medidas paralelas.",
        "E": "Incorreta. O escore não substitui avaliação e dados bioquímicos."
      },
      "synthesis": "O plano contempla possível insuficiência adrenal e risco cardiovascular.",
      "pearl": "🧠 Coma mixedematoso: Suporte intensivo, glicocorticoide de estresse precoce e reposição tireoidiana cautelosa.",
      "sourceRefs": [
        "NOV_MIX26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-048",
      "block": "metabolico-endocrino",
      "topicId": "metabolico-endocrino",
      "topicLabel": "Metabólico e endócrino",
      "subtopic": "Hipocalcemia sintomática",
      "difficulty": "Médio",
      "tags": [
        "metabolico-endocrino",
        "hipocalcemia-sintom-tica",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Após cirurgia cervical, adulto desenvolve parestesias, tetania e QT prolongado. Qual investigação orienta o cuidado imediato?",
      "options": {
        "A": "Excluir distúrbio de cálcio porque há albumina normal.",
        "B": "Usar apenas cálcio total sem considerar o contexto clínico.",
        "C": "Avaliar cálcio ionizado, magnésio e gravidade, com correção monitorizada quando indicada.",
        "D": "Atribuir toda tetania a hipercalemia.",
        "E": "Dar alta porque parestesia isolada é sempre benigna."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Albumina normal não exclui hipocalcemia verdadeira.",
        "B": "Incorreta. Cálcio ionizado e condições da amostra podem ser importantes.",
        "C": "Correta. Hipocalcemia sintomática exige resposta e pesquisa de fatores associados.",
        "D": "Incorreta. O conjunto é compatível com hipocalcemia, entre diferenciais.",
        "E": "Incorreta. Tetania e alteração de QT são sinais de risco."
      },
      "synthesis": "Hipocalcemia sintomática exige resposta e pesquisa de fatores associados.",
      "pearl": "🧠 Hipocalcemia sintomática: Avaliar cálcio ionizado, magnésio e gravidade, com correção monitorizada quando indicada.",
      "sourceRefs": [
        "NOV_HIPOCAL"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-049",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "Revascularização no choque cardiogênico",
      "difficulty": "Difícil",
      "tags": [
        "cardiovascular",
        "revasculariza-o-no-choque-cardiog-nico",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com infarto e choque cardiogênico tem lesão culpada e outras estenoses. Qual estratégia corresponde ao princípio da diretriz de SCA 2025?",
      "options": {
        "A": "Adiar toda reperfusão até suspender vasopressor.",
        "B": "Tratar obrigatoriamente todas as estenoses no primeiro procedimento.",
        "C": "Tratar apenas com nitrato, independentemente da pressão.",
        "D": "Revascularizar urgentemente a artéria culpada; não fazer angioplastia multivascular rotineira no mesmo ato.",
        "E": "Aplicar evidência de SCA estável sem considerar a instabilidade."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Choque não elimina urgência de reperfusão.",
        "B": "Incorreta. Isso não é rotina recomendada no choque.",
        "C": "Incorreta. Hipotensão exige cuidado e reperfusão não pode ser substituída assim.",
        "D": "Correta. A estratégia do choque difere da revascularização completa em outros cenários.",
        "E": "Incorreta. A população muda a interpretação da estratégia."
      },
      "synthesis": "A estratégia do choque difere da revascularização completa em outros cenários.",
      "pearl": "🧠 Revascularização no choque cardiogênico: Revascularizar urgentemente a artéria culpada; não fazer angioplastia multivascular rotineira no mesmo ato.",
      "sourceRefs": [
        "NOV_ACS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-050",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "Acesso para intervenção coronariana",
      "difficulty": "Médio",
      "tags": [
        "cardiovascular",
        "acesso-para-interven-o-coronariana",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com SCA será submetido a intervenção coronária, e ambas as vias são tecnicamente viáveis. Qual preferência pode reduzir complicações hemorrágicas?",
      "options": {
        "A": "Acesso femoral obrigatório para toda SCA.",
        "B": "Escolher via sem avaliar anatomia, suporte e experiência.",
        "C": "Radial elimina toda possibilidade de sangramento.",
        "D": "O acesso escolhido dispensa ajuste de antitrombóticos.",
        "E": "Acesso radial, quando apropriado à experiência e ao procedimento."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Não é uma exigência universal.",
        "B": "Incorreta. Esses fatores continuam relevantes.",
        "C": "Incorreta. O benefício não significa ausência de risco.",
        "D": "Incorreta. Antitrombóticos ainda exigem avaliação própria.",
        "E": "Correta. A diretriz favorece radial para reduzir sangramento e complicações vasculares."
      },
      "synthesis": "A diretriz favorece radial para reduzir sangramento e complicações vasculares.",
      "pearl": "🧠 Acesso para intervenção coronariana: Acesso radial, quando apropriado à experiência e ao procedimento.",
      "sourceRefs": [
        "NOV_ACS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-051",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "Anemia durante infarto",
      "difficulty": "Difícil",
      "tags": [
        "cardiovascular",
        "anemia-durante-infarto",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto hospitalizado com IAM tem hemoglobina 8,6 g/dL, sem sangramento ativo. Alguém aplica automaticamente o limiar de 7 g/dL da população estável geral. Qual revisão é adequada?",
      "options": {
        "A": "IAM tem orientação específica: considerar estratégia liberal, individualizando riscos e contexto.",
        "B": "O limiar de 7 g/dL vale invariavelmente para qualquer síndrome.",
        "C": "Toda pessoa com IAM deve chegar obrigatoriamente a 14 g/dL.",
        "D": "O risco de congestão desaparece porque há isquemia.",
        "E": "A recomendação condicional equivale a benefício individual certo."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. AABB 2025 faz sugestão condicional abaixo de 10 g/dL, com baixa certeza.",
        "B": "Incorreta. IAM é uma população com recomendação própria.",
        "C": "Incorreta. Essa meta não decorre da diretriz.",
        "D": "Incorreta. Transfusão requer avaliar também sobrecarga.",
        "E": "Incorreta. Certeza da evidência e contexto precisam acompanhar a decisão."
      },
      "synthesis": "AABB 2025 faz sugestão condicional abaixo de 10 g/dL, com baixa certeza.",
      "pearl": "🧠 Anemia durante infarto: IAM tem orientação específica: considerar estratégia liberal, individualizando riscos e contexto.",
      "sourceRefs": [
        "NOV_AMI25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-052",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "TV polimórfica sustentada",
      "difficulty": "Difícil",
      "tags": [
        "cardiovascular",
        "tv-polim-rfica-sustentada",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto desenvolve TV polimórfica sustentada e colapso hemodinâmico. A sincronização não reconhece QRS de modo confiável. Qual intervenção elétrica é pertinente?",
      "options": {
        "A": "Esperar indefinidamente o aparelho sincronizar todos os complexos.",
        "B": "Choque não sincronizado imediato, conforme equipamento e protocolo de emergência.",
        "C": "Tratar como taquicardia sinusal e apenas observar.",
        "D": "Usar exclusivamente manobra vagal.",
        "E": "Aguardar resultado de magnésio antes de qualquer choque."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. A demora prolonga instabilidade e risco de degeneração.",
        "B": "Correta. TV polimórfica não permite sincronização confiável; não atrasar desfibrilação.",
        "C": "Incorreta. O ritmo é ventricular e ameaçador.",
        "D": "Incorreta. Ela não trata essa emergência ventricular.",
        "E": "Incorreta. A instabilidade atual exige intervenção imediata."
      },
      "synthesis": "TV polimórfica não permite sincronização confiável; não atrasar desfibrilação.",
      "pearl": "🧠 TV polimórfica sustentada: Choque não sincronizado imediato, conforme equipamento e protocolo de emergência.",
      "sourceRefs": [
        "NOV_ALS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-053",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "Fibrilação atrial pré-excitada",
      "difficulty": "Difícil",
      "tags": [
        "cardiovascular",
        "fibrila-o-atrial-pr--excitada",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto apresenta FA pré-excitada, muito rápida e com QRS variáveis. Qual grupo de fármacos pode agravar a condução pela via acessória?",
      "options": {
        "A": "Qualquer sedativo, pelo simples fato de permitir cardioversão.",
        "B": "Soluções cristaloides em qualquer quantidade mínima.",
        "C": "Bloqueadores nodais AV, incluindo verapamil, betabloqueadores, digoxina e amiodarona IV.",
        "D": "Todo fármaco anticoagulante, pelo mesmo mecanismo elétrico.",
        "E": "Apenas reposição de potássio orientada por hipocalemia."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Sedação apropriada pode integrar uma estratégia elétrica segura.",
        "B": "Incorreta. O risco específico perguntado é bloqueio nodal na pré-excitação.",
        "C": "Correta. A AHA alerta para aceleração ventricular e risco de fibrilação ventricular.",
        "D": "Incorreta. Anticoagulação tem riscos distintos, sem esse mecanismo nodal.",
        "E": "Incorreta. Correção monitorizada não é o grupo contraindicado descrito."
      },
      "synthesis": "A AHA alerta para aceleração ventricular e risco de fibrilação ventricular.",
      "pearl": "🧠 Fibrilação atrial pré-excitada: Bloqueadores nodais AV, incluindo verapamil, betabloqueadores, digoxina e amiodarona IV.",
      "sourceRefs": [
        "NOV_ALS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-054",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "Bradicardia persistente com hipoperfusão",
      "difficulty": "Médio",
      "tags": [
        "cardiovascular",
        "bradicardia-persistente-com-hipoperfus-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto tem bloqueio atrioventricular avançado, hipotensão e alteração mental apesar de medidas farmacológicas iniciais. Qual estratégia precisa ser preparada?",
      "options": {
        "A": "Esperar retorno ambulatorial porque há pulso.",
        "B": "Administrar bloqueador nodal para reduzir ainda mais a frequência.",
        "C": "Usar somente oxigênio, sem monitorização.",
        "D": "Estimulação cardíaca temporária e suporte enquanto se trata a causa.",
        "E": "Descartar intervenção por não ser uma parada cardíaca."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Pulso presente não exclui instabilidade grave.",
        "B": "Incorreta. Isso pode agravar o bloqueio e a perfusão.",
        "C": "Incorreta. A hipoperfusão por bradicardia exige tratamento específico.",
        "D": "Correta. Bradicardia instável refratária pode exigir marca-passo temporário.",
        "E": "Incorreta. Emergências peri-parada também exigem ação imediata."
      },
      "synthesis": "Bradicardia instável refratária pode exigir marca-passo temporário.",
      "pearl": "🧠 Bradicardia persistente com hipoperfusão: Estimulação cardíaca temporária e suporte enquanto se trata a causa.",
      "sourceRefs": [
        "NOV_ALS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-055",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "Controle de temperatura pós-parada",
      "difficulty": "Médio",
      "tags": [
        "cardiovascular",
        "controle-de-temperatura-p-s-parada",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Após retorno da circulação, adulto não obedece a comandos verbais. Qual plano é compatível com AHA 2025?",
      "options": {
        "A": "Deixar a temperatura evoluir sem acompanhamento.",
        "B": "Afirmar que 33°C é comprovadamente superior para todo subgrupo.",
        "C": "Fazer infusão rápida de fluido gelado pré-hospitalar como rotina.",
        "D": "Usar a temperatura isolada para determinar prognóstico neurológico precoce.",
        "E": "Controle deliberado e protocolado de temperatura, com prevenção de febre e monitorização."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Controle de temperatura é parte do cuidado protocolado.",
        "B": "Incorreta. Essa superioridade universal não foi demonstrada.",
        "C": "Incorreta. A AHA não recomenda essa prática rotineira.",
        "D": "Incorreta. Prognóstico exige tempo, métodos múltiplos e controle de confundidores.",
        "E": "Correta. A diretriz contempla alvos entre 32 e 37,5°C, adaptados ao plano clínico."
      },
      "synthesis": "A diretriz contempla alvos entre 32 e 37,5°C, adaptados ao plano clínico.",
      "pearl": "🧠 Controle de temperatura pós-parada: Controle deliberado e protocolado de temperatura, com prevenção de febre e monitorização.",
      "sourceRefs": [
        "NOV_POS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-056",
      "block": "cardiovascular",
      "topicId": "cardiovascular",
      "topicLabel": "Cardiovascular",
      "subtopic": "Recorrência de torsades",
      "difficulty": "Difícil",
      "tags": [
        "cardiovascular",
        "recorr-ncia-de-torsades",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto tem episódios autolimitados de torsades, QTc prolongado, hipocalemia e uso de medicamento que prolonga QT. Entre episódios está com pulso e perfusão. Qual ação reduz recorrência?",
      "options": {
        "A": "Rever fármacos causais, corrigir eletrólitos e considerar magnésio IV com monitorização.",
        "B": "Adicionar sistematicamente outro agente que prolonga QT.",
        "C": "Ignorar a hipocalemia porque o ritmo reverte sozinho.",
        "D": "Generalizar magnésio como eficaz em toda TV de QT normal.",
        "E": "Retirar monitorização assim que ocorrer ritmo sinusal."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Tratar o substrato é necessário; episódio sustentado instável ainda exige choque.",
        "B": "Incorreta. Isso pode agravar a predisposição à torsades.",
        "C": "Incorreta. A reversão não elimina risco de nova arritmia.",
        "D": "Incorreta. A indicação depende do mecanismo e do QT.",
        "E": "Incorreta. A causa pode continuar presente."
      },
      "synthesis": "Tratar o substrato é necessário; episódio sustentado instável ainda exige choque.",
      "pearl": "🧠 Recorrência de torsades: Rever fármacos causais, corrigir eletrólitos e considerar magnésio IV com monitorização.",
      "sourceRefs": [
        "NOV_ALS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-057",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "Baixa probabilidade de HIT",
      "difficulty": "Médio",
      "tags": [
        "hematologia-trombose",
        "baixa-probabilidade-de-hit",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto usa heparina e tem discreta queda plaquetária explicada por outra causa. O 4Ts, calculado com dados suficientes, é baixo. Qual abordagem da ASH é adequada?",
      "options": {
        "A": "Tratar todo teste imunológico positivo isolado como HIT definida.",
        "B": "Evitar investigação laboratorial rotineira de HIT e reavaliar se o contexto mudar.",
        "C": "Suspender toda anticoagulação em qualquer trombocitopenia.",
        "D": "Solicitar painel repetido diariamente independentemente do quadro.",
        "E": "Ignorar ausência de dados ao calcular o 4Ts."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Resultado precisa de contexto e interpretação apropriada.",
        "B": "Correta. Baixa probabilidade pré-teste aumenta risco de falso-positivo e conduta indevida.",
        "C": "Incorreta. Causa e risco trombótico precisam ser avaliados.",
        "D": "Incorreta. A indicação depende da probabilidade clínica.",
        "E": "Incorreta. Incerteza no escore pode exigir investigação adicional."
      },
      "synthesis": "Baixa probabilidade pré-teste aumenta risco de falso-positivo e conduta indevida.",
      "pearl": "🧠 Baixa probabilidade de HIT: Evitar investigação laboratorial rotineira de HIT e reavaliar se o contexto mudar.",
      "sourceRefs": [
        "NOV_HIT18"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-058",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "Varfarina na HIT aguda",
      "difficulty": "Difícil",
      "tags": [
        "hematologia-trombose",
        "varfarina-na-hit-aguda",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com HIT aguda confirmada e plaquetas ainda muito baixas precisa de anticoagulação. Qual conduta deve ser evitada nessa fase?",
      "options": {
        "A": "Selecionar anticoagulante não heparínico conforme situação clínica.",
        "B": "Rever heparina presente em lavagens e outros dispositivos.",
        "C": "Iniciar antagonista da vitamina K antes da recuperação plaquetária.",
        "D": "Avaliar função renal e hepática ao escolher o fármaco.",
        "E": "Monitorizar trombose e evolução das plaquetas."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Esse é um princípio do tratamento da HIT.",
        "B": "Incorreta. Exposições inadvertidas precisam ser identificadas.",
        "C": "Correta. A ASH alerta para complicações trombóticas dessa introdução precoce.",
        "D": "Incorreta. Essas funções influenciam a segurança.",
        "E": "Incorreta. O acompanhamento é necessário durante o tratamento."
      },
      "synthesis": "A ASH alerta para complicações trombóticas dessa introdução precoce.",
      "pearl": "🧠 Varfarina na HIT aguda: Iniciar antagonista da vitamina K antes da recuperação plaquetária.",
      "sourceRefs": [
        "NOV_HIT18"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-059",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "Plaquetas na HIT sem sangramento",
      "difficulty": "Médio",
      "tags": [
        "hematologia-trombose",
        "plaquetas-na-hit-sem-sangramento",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com HIT tem trombocitopenia, mas não sangra e não fará procedimento de alto risco. Qual afirmação é adequada?",
      "options": {
        "A": "Transfundir até contagem normal em todo caso.",
        "B": "InterpretarHIT como doença exclusivamente hemorrágica.",
        "C": "Considerar transfusão absolutamente proibida mesmo em hemorragia grave.",
        "D": "Não transfundir plaquetas rotineiramente apenas para normalizar a contagem.",
        "E": "Manter heparina porque as plaquetas transfundidas neutralizam anticorpos."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Normalizar um número não demonstra benefício nesse contexto.",
        "B": "Incorreta. A condição tem risco trombótico importante.",
        "C": "Incorreta. Situações de sangramento exigem ponderação específica.",
        "D": "Correta. Sangramento e risco procedural podem modificar a decisão individual.",
        "E": "Incorreta. Transfusão não resolve a exposição causal."
      },
      "synthesis": "Sangramento e risco procedural podem modificar a decisão individual.",
      "pearl": "🧠 Plaquetas na HIT sem sangramento: Não transfundir plaquetas rotineiramente apenas para normalizar a contagem.",
      "sourceRefs": [
        "NOV_HIT18"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-060",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "PTT e tempo do ADAMTS13",
      "difficulty": "Difícil",
      "tags": [
        "hematologia-trombose",
        "ptt-e-tempo-do-adamts13",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto apresenta anemia hemolítica microangiopática, trombocitopenia e forte suspeita de PTT imune. O resultado de ADAMTS13 demorará. Qual princípio é adequado?",
      "options": {
        "A": "Aguardar obrigatoriamente vários dias até a confirmação.",
        "B": "Tratar apenas com transfusão de plaquetas para normalizar o hemograma.",
        "C": "Presumir que PTT congênita e imune sempre têm o mesmo plano.",
        "D": "UsarADAMTS13 após grande exposição a plasma como se não houvesse interferência.",
        "E": "Colher amostra antes da terapia quando viável e iniciar tratamento urgente sem aguardar o resultado."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. A demora pode causar dano orgânico grave.",
        "B": "Incorreta. Isso não trata o mecanismo da PTT imune.",
        "C": "Incorreta. Etiologias e estratégias específicas diferem.",
        "D": "Incorreta. A terapia pode dificultar interpretação da amostra.",
        "E": "Correta. Alta suspeita pode exigir troca plasmática e medidas específicas imediatas."
      },
      "synthesis": "Alta suspeita pode exigir troca plasmática e medidas específicas imediatas.",
      "pearl": "🧠 PTT e tempo do ADAMTS13: Colher amostra antes da terapia quando viável e iniciar tratamento urgente sem aguardar o resultado.",
      "sourceRefs": [
        "NOV_TTP25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-061",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "TEP e probabilidade diagnóstica",
      "difficulty": "Médio",
      "tags": [
        "hematologia-trombose",
        "tep-e-probabilidade-diagn-stica",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto hospitalizado com infecção e dispneia tem dímero D elevado. Qual interpretação é adequada?",
      "options": {
        "A": "O exame não confirma TEP isoladamente; é preciso integrar probabilidade e investigação apropriada.",
        "B": "O resultado prova trombo e dispensa imagem em qualquer pessoa.",
        "C": "A infecção exclui completamente a possibilidade de TEP.",
        "D": "Escolher trombólise apenas pelo número do dímero D.",
        "E": "Aplicar todo algoritmo ambulatorial sem considerar internação e probabilidade."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. DímeroD pode aumentar em várias doenças e tem utilidade dependente do contexto.",
        "B": "Incorreta. A especificidade é limitada.",
        "C": "Incorreta. Condições podem coexistir.",
        "D": "Incorreta. Reperfusão depende de diagnóstico, gravidade e risco hemorrágico.",
        "E": "Incorreta. A aplicabilidade do teste muda com a população."
      },
      "synthesis": "DímeroD pode aumentar em várias doenças e tem utilidade dependente do contexto.",
      "pearl": "🧠 TEP e probabilidade diagnóstica: O exame não confirma TEP isoladamente; é preciso integrar probabilidade e investigação apropriada.",
      "sourceRefs": [
        "NOV_PE26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-062",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "TEP com falência circulatória",
      "difficulty": "Difícil",
      "tags": [
        "hematologia-trombose",
        "tep-com-fal-ncia-circulat-ria",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com TEP confirmado apresenta hipotensão persistente e sinais de falência cardiopulmonar. Qual discussão é coerente com AHA/ACC 2026?",
      "options": {
        "A": "Tratar como categoria de baixo risco por ter diagnóstico confirmado.",
        "B": "Acionar equipe de resposta e avaliar terapia avançada de reperfusão conforme risco hemorrágico e recursos.",
        "C": "Esperar obrigatoriamente três meses antes de considerar reperfusão.",
        "D": "Declarar trombólise obrigatória independentemente de qualquer contraindicação.",
        "E": "Aplicar tratamento ambulatorial apenas porque o trombo é segmentar."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Confirmação não define baixa gravidade.",
        "B": "Correta. A categoria de maior gravidade demanda decisões urgentes e individualizadas.",
        "C": "Incorreta. A falência circulatória é uma emergência atual.",
        "D": "Incorreta. Benefício e risco precisam ser confrontados.",
        "E": "Incorreta. Estado cardiopulmonar não pode ser ignorado pela descrição anatômica."
      },
      "synthesis": "A categoria de maior gravidade demanda decisões urgentes e individualizadas.",
      "pearl": "🧠 TEP com falência circulatória: Acionar equipe de resposta e avaliar terapia avançada de reperfusão conforme risco hemorrágico e recursos.",
      "sourceRefs": [
        "NOV_PE26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-063",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "Plaquetopenia hipoproliferativa na quimioterapia",
      "difficulty": "Médio",
      "tags": [
        "hematologia-trombose",
        "plaquetopenia-hipoproliferativa-na-quimioterapia",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto em quimioterapia tem plaquetas 8.000/µL, sem sangramento, em contexto hipoproliferativo. Qual referência da AABB/ICTMG 2025 é pertinente?",
      "options": {
        "A": "Aguardar contagem zero em todo paciente sem hemorragia.",
        "B": "Usar 10.000/µLcomo único limiar também para neurocirurgia.",
        "C": "Considerar transfusão profilática no contexto definido abaixo de 10.000/µL.",
        "D": "Transfundir toda trombocitopenia imune pelos mesmos critérios.",
        "E": "Concluir que a contagem isolada define toda segurança do paciente."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. O contexto descrito tem recomendação profilática.",
        "B": "Incorreta. Procedimentos e sangramento exigem outros critérios.",
        "C": "Correta. O limiar depende da população; não é regra para todas as causas de plaquetopenia.",
        "D": "Incorreta. Etiologia e resposta esperada diferem.",
        "E": "Incorreta. Evolução, sangramento e procedimentos ainda importam."
      },
      "synthesis": "O limiar depende da população; não é regra para todas as causas de plaquetopenia.",
      "pearl": "🧠 Plaquetopenia hipoproliferativa na quimioterapia: Considerar transfusão profilática no contexto definido abaixo de 10.000/µL.",
      "sourceRefs": [
        "NOV_PLT25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-064",
      "block": "hematologia-trombose",
      "topicId": "hematologia-trombose",
      "topicLabel": "Hematologia e trombose",
      "subtopic": "Plaquetas na HIC associada à aspirina",
      "difficulty": "Difícil",
      "tags": [
        "hematologia-trombose",
        "plaquetas-na-hic-associada-aspirina",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto em aspirina tem HIC espontânea, plaquetas normais e não necessita neurocirurgia emergencial. Qual cautela é adequada?",
      "options": {
        "A": "Transfundir obrigatoriamente por qualquer uso prévio de aspirina.",
        "B": "Interpretar plaquetas normais como prova de ausência de efeito antiplaquetário.",
        "C": "Aplicar a mesma regra sem ajuste a qualquer cirurgia emergencial.",
        "D": "Evitar transfusão rotineira de plaquetas apenas para reverter a aspirina nesse cenário.",
        "E": "Usar a recomendação para proibir toda terapia hemostática em qualquer hemorragia."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Essa generalização não corresponde à recomendação.",
        "B": "Incorreta. Função e contagem não são a mesma medida.",
        "C": "Incorreta. O contexto cirúrgico modifica a avaliação.",
        "D": "Correta. A AHA/ASA descreve dano potencial; cirurgia emergencial é contexto distinto.",
        "E": "Incorreta. Intervenções dependem do mecanismo e da indicação."
      },
      "synthesis": "A AHA/ASA descreve dano potencial; cirurgia emergencial é contexto distinto.",
      "pearl": "🧠 Plaquetas na HIC associada à aspirina: Evitar transfusão rotineira de plaquetas apenas para reverter a aspirina nesse cenário.",
      "sourceRefs": [
        "NOV_ICH22"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-065",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "Realimentação na pancreatite leve",
      "difficulty": "Médio",
      "tags": [
        "gastro-hepato-nutricao",
        "realimenta-o-na-pancreatite-leve",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com pancreatite aguda leve melhora da dor, sem vômitos e tolera alimentação. Qual proposta corresponde à ACG 2024?",
      "options": {
        "A": "Jejum obrigatório por sete dias em qualquer pancreatite.",
        "B": "Nutrição parenteral imediata apesar de trato gastrointestinal utilizável.",
        "C": "Liberar dieta apenas quando toda imagem voltar ao normal.",
        "D": "Aplicar o mesmo plano sem avaliar vômitos e gravidade.",
        "E": "Reintrodução oral precoce conforme tolerância, sem exigir normalização da lipase."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. A recomendação favorece alimentação precoce se tolerada.",
        "B": "Incorreta. A via oral ou enteral deve ser considerada antes.",
        "C": "Incorreta. Resolução radiológica não é requisito para realimentação.",
        "D": "Incorreta. Tolerância e contexto precisam orientar a progressão.",
        "E": "Correta. A espera por marcador normal não é requisito para todo quadro leve."
      },
      "synthesis": "A espera por marcador normal não é requisito para todo quadro leve.",
      "pearl": "🧠 Realimentação na pancreatite leve: Reintrodução oral precoce conforme tolerância, sem exigir normalização da lipase.",
      "sourceRefs": [
        "NOV_PAN24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-066",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "Pancreatite com colangite",
      "difficulty": "Médio",
      "tags": [
        "gastro-hepato-nutricao",
        "pancreatite-com-colangite",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com pancreatite biliar apresenta febre, icterícia e colangite. Qual intervenção precisa ser discutida prontamente?",
      "options": {
        "A": "CPRE precoce para tratar a obstrução/infecção biliar, além do suporte.",
        "B": "Adiar toda intervenção biliar por um mês obrigatoriamente.",
        "C": "Esperar a lipase normalizar antes de avaliar a via biliar.",
        "D": "Fazer apenas antibiótico e dispensar avaliar drenagem.",
        "E": "Aplicar recomendação contra CPRE rotineira como proibição absoluta."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Colangite é uma indicação específica, distinta da pancreatite biliar não complicada.",
        "B": "Incorreta. Infecção com obstrução pode exigir drenagem urgente.",
        "C": "Incorreta. O marcador pancreático não define a urgência da colangite.",
        "D": "Incorreta. O controle da obstrução pode ser essencial.",
        "E": "Incorreta. A recomendação não exclui a indicação por colangite."
      },
      "synthesis": "Colangite é uma indicação específica, distinta da pancreatite biliar não complicada.",
      "pearl": "🧠 Pancreatite com colangite: CPRE precoce para tratar a obstrução/infecção biliar, além do suporte.",
      "sourceRefs": [
        "NOV_PAN24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-067",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "Evitar CPRE diagnóstica desnecessária",
      "difficulty": "Difícil",
      "tags": [
        "gastro-hepato-nutricao",
        "evitar-cpre-diagn-stica-desnecess-ria",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto tem pancreatite biliar sem colangite nem icterícia persistente. Há suspeita de cálculo residual ainda não confirmado. Qual investigação pode evitar CPRE apenas diagnóstica?",
      "options": {
        "A": "Fazer CPRE urgente em todo episódio, independentemente do risco.",
        "B": "Colangiorressonância ou ecoendoscopia, conforme disponibilidade e contexto.",
        "C": "Considerar ultrassom inicial negativo como exclusão de qualquer cálculo.",
        "D": "Dispensar avaliação porque dor biliar não muda a conduta.",
        "E": "Escolher cirurgia pancreática apenas para confirmar cálculo de colédoco."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Não há indicação universal de CPRE precoce sem colangite.",
        "B": "Correta. A investigação menos invasiva pode orientar a necessidade de tratamento endoscópico.",
        "C": "Incorreta. A sensibilidade depende de localização e condições do exame.",
        "D": "Incorreta. Obstrução persistente pode alterar o planejamento.",
        "E": "Incorreta. A investigação deve ser proporcional à hipótese."
      },
      "synthesis": "A investigação menos invasiva pode orientar a necessidade de tratamento endoscópico.",
      "pearl": "🧠 Evitar CPRE diagnóstica desnecessária: Colangiorressonância ou ecoendoscopia, conforme disponibilidade e contexto.",
      "sourceRefs": [
        "NOV_PAN24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-068",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "Suspeita de hemorragia varicosa",
      "difficulty": "Médio",
      "tags": [
        "gastro-hepato-nutricao",
        "suspeita-de-hemorragia-varicosa",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com cirrose apresenta hematêmese importante. Após medidas iniciais, a equipe suspeita de sangramento varicoso e organiza endoscopia. Qual conduta não precisa aguardar confirmação endoscópica?",
      "options": {
        "A": "Esperar obrigatoriamente a endoscopia para qualquer terapia específica.",
        "B": "Substituir estabilização por endoscopia sem suporte.",
        "C": "Iniciar tratamento vasoativo apropriado à suspeita, conforme protocolo e contraindicações.",
        "D": "Normalizar hemoglobina até valor alto em todos antes do exame.",
        "E": "Concluir que todo sangramento no cirrótico é varicoso sem verificar."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. O tratamento deve acompanhar a urgência da suspeita.",
        "B": "Incorreta. Via aérea e circulação precisam ser avaliadas em paralelo.",
        "C": "Correta. Baveno VII orienta terapia precoce no sangramento varicoso suspeito.",
        "D": "Incorreta. Transfusão deve ser conservadora e individualizada.",
        "E": "Incorreta. A hipótese inicial ainda precisa de confirmação e diferenciais."
      },
      "synthesis": "Baveno VII orienta terapia precoce no sangramento varicoso suspeito.",
      "pearl": "🧠 Suspeita de hemorragia varicosa: Iniciar tratamento vasoativo apropriado à suspeita, conforme protocolo e contraindicações.",
      "sourceRefs": [
        "NOV_BAVENO"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-069",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "INR e plasma na hemorragia varicosa",
      "difficulty": "Difícil",
      "tags": [
        "gastro-hepato-nutricao",
        "inr-e-plasma-na-hemorragia-varicosa",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto com hemorragia varicosa tem INR prolongado. Qual crítica se aplica à proposta de grandes volumes de plasma apenas para normalizar esse número?",
      "options": {
        "A": "INR elevado sempre demonstra falta global de coagulação mensurável por esse único teste.",
        "B": "Corrigir INR até 1,0 é pré-requisito universal para tratar a fonte.",
        "C": "Todo volume de plasma reduz pressão portal.",
        "D": "Plasma não é recomendado rotineiramente nesse objetivo e pode piorar sobrecarga/pressão portal.",
        "E": "O teste exclui qualquer risco trombótico no cirrótico."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. A hemostasia da cirrose é mais complexa.",
        "B": "Incorreta. A meta laboratorial isolada não deve atrasar controle do sangramento.",
        "C": "Incorreta. Sobrecarga pode aumentá-la.",
        "D": "Correta. INR não representa sozinho o equilíbrio hemostático da cirrose.",
        "E": "Incorreta. Trombose pode ocorrer apesar de INR prolongado."
      },
      "synthesis": "INR não representa sozinho o equilíbrio hemostático da cirrose.",
      "pearl": "🧠 INR e plasma na hemorragia varicosa: Plasma não é recomendado rotineiramente nesse objetivo e pode piorar sobrecarga/pressão portal.",
      "sourceRefs": [
        "NOV_BAVENO"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-070",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "Ascite neutrocítica",
      "difficulty": "Médio",
      "tags": [
        "gastro-hepato-nutricao",
        "ascite-neutroc-tica",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto cirrótico com ascite tem 380 neutrófilos/mm³ no líquido, sem foco abdominal cirúrgico identificado. A cultura ainda está pendente. Qual avaliação é adequada?",
      "options": {
        "A": "PBE só existe com crescimento bacteriano demonstrado.",
        "B": "Ausência de febre exclui infecção do líquido.",
        "C": "A contagem define o mesmo antibiótico em qualquer hospital.",
        "D": "O resultado impede considerar peritonite secundária quando houver sinais.",
        "E": "O achado sustenta PBE e não exige aguardar cultura positiva para tratar."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Ascite neutrocítica com cultura negativa pode exigir tratamento.",
        "B": "Incorreta. Apresentações podem ser pouco sintomáticas.",
        "C": "Incorreta. Cobertura depende de aquisição, exposição e resistência local.",
        "D": "Incorreta. Causas cirúrgicas devem ser investigadas conforme contexto.",
        "E": "Correta. O limiar de neutrófilos é relevante mesmo com cultura posteriormente negativa."
      },
      "synthesis": "O limiar de neutrófilos é relevante mesmo com cultura posteriormente negativa.",
      "pearl": "🧠 Ascite neutrocítica: O achado sustenta PBE e não exige aguardar cultura positiva para tratar.",
      "sourceRefs": [
        "NOV_ASC21"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-071",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "Síndrome de realimentação",
      "difficulty": "Médio",
      "tags": [
        "gastro-hepato-nutricao",
        "s-ndrome-de-realimenta-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto desnutrido inicia nutrição e desenvolve queda importante de fósforo, potássio e magnésio. Qual plano é mais seguro?",
      "options": {
        "A": "Rever a progressão calórica, corrigir distúrbios e monitorizar síndrome de realimentação.",
        "B": "Aumentar rapidamente calorias para corrigir a fraqueza.",
        "C": "Acompanhar apenas sódio porque fósforo não tem função clínica.",
        "D": "Presumir que nutrição enteral elimina todo risco de realimentação.",
        "E": "Corrigir uma dosagem e dispensar monitorização subsequente."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. A oferta de nutrientes pode revelar depleção e exigir ajuste da estratégia.",
        "B": "Incorreta. Isso pode agravar o desequilíbrio metabólico.",
        "C": "Incorreta. Hipofosfatemia pode comprometer função respiratória e cardíaca.",
        "D": "Incorreta. A síndrome não é exclusiva da via parenteral.",
        "E": "Incorreta. A trajetória durante a realimentação precisa ser acompanhada."
      },
      "synthesis": "A oferta de nutrientes pode revelar depleção e exigir ajuste da estratégia.",
      "pearl": "🧠 Síndrome de realimentação: Rever a progressão calórica, corrigir distúrbios e monitorizar síndrome de realimentação.",
      "sourceRefs": [
        "NOV_ESPEN23"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-072",
      "block": "gastro-hepato-nutricao",
      "topicId": "gastro-hepato-nutricao",
      "topicLabel": "Gastro, hepato e nutrição",
      "subtopic": "Resíduo gástrico e tolerância",
      "difficulty": "Médio",
      "tags": [
        "gastro-hepato-nutricao",
        "res-duo-g-strico-e-toler-ncia",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto estável recebe dieta gástrica. Um resíduo de 250 mL em 6 horas é encontrado, sem vômitos, distensão ou outros sinais. Qual leitura evita interrupção injustificada?",
      "options": {
        "A": "Parar alimentação por qualquer quantidade aspirada.",
        "B": "Integrar os achados; esse valor isolado não exige suspender automaticamente a dieta.",
        "C": "Elevar imediatamente a oferta sem examinar o adulto.",
        "D": "Declarar risco zero de aspiração apenas pelo valor.",
        "E": "Trocar obrigatoriamente para nutrição parenteral definitiva."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. Pequenos resíduos não estabelecem intolerância grave.",
        "B": "Correta. A ESPEN usa outros critérios e contexto de intolerância; não basta um resíduo menor isolado.",
        "C": "Incorreta. A progressão também exige avaliação clínica.",
        "D": "Incorreta. O risco depende de múltiplos fatores.",
        "E": "Incorreta. Esse achado isolado não indica abandonar a via enteral."
      },
      "synthesis": "A ESPEN usa outros critérios e contexto de intolerância; não basta um resíduo menor isolado.",
      "pearl": "🧠 Resíduo gástrico e tolerância: Integrar os achados; esse valor isolado não exige suspender automaticamente a dieta.",
      "sourceRefs": [
        "NOV_ESPEN23"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-073",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Dor no adulto sem comunicação",
      "difficulty": "Médio",
      "tags": [
        "sedacao-seguranca",
        "dor-no-adulto-sem-comunica-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto intubado não consegue relatar dor. Durante procedimento, FC aumenta e há expressão facial de desconforto. Qual abordagem é mais apropriada?",
      "options": {
        "A": "Definir dor exclusivamente pela frequência cardíaca.",
        "B": "Considerar ausência de fala como ausência de dor.",
        "C": "Usar avaliação comportamental validada, como CPOT ou BPS, integrada ao contexto.",
        "D": "Aumentar hipnótico sem avaliar analgesia.",
        "E": "Registrar escala verbal preenchida por suposição."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Taquicardia tem várias causas e não quantifica dor.",
        "B": "Incorreta. Incapacidade de comunicar não exclui dor.",
        "C": "Correta. Sinais vitais isolados não medem dor de forma válida.",
        "D": "Incorreta. Sedação não substitui tratamento da dor.",
        "E": "Incorreta. O método deve ser adequado à capacidade de comunicação."
      },
      "synthesis": "Sinais vitais isolados não medem dor de forma válida.",
      "pearl": "🧠 Dor no adulto sem comunicação: Usar avaliação comportamental validada, como CPOT ou BPS, integrada ao contexto.",
      "sourceRefs": [
        "NOV_PADIS18"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-074",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Coma e triagem de delirium",
      "difficulty": "Médio",
      "tags": [
        "sedacao-seguranca",
        "coma-e-triagem-de-delirium",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto ventilado permanece não despertável sob sedação profunda. Qual erro deve ser evitado na triagem de delirium?",
      "options": {
        "A": "Registrar a sedação e a impossibilidade de avaliação naquele momento.",
        "B": "Rever necessidade de sedação profunda conforme segurança clínica.",
        "C": "Repetir avaliação quando houver nível de despertar apropriado.",
        "D": "Registrar resultado negativo como se o adulto tivesse condições de ser avaliado.",
        "E": "Investigar fatores reversíveis de rebaixamento."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. Isso preserva a interpretação correta do exame.",
        "B": "Incorreta. A meta deve ser reavaliada quando o contexto permitir.",
        "C": "Incorreta. O estado pode mudar ao longo do tempo.",
        "D": "Correta. Nível de despertar limita a aplicação das ferramentas; coma não equivale a teste negativo.",
        "E": "Incorreta. Sedação e outras causas precisam ser consideradas."
      },
      "synthesis": "Nível de despertar limita a aplicação das ferramentas; coma não equivale a teste negativo.",
      "pearl": "🧠 Coma e triagem de delirium: Registrar resultado negativo como se o adulto tivesse condições de ser avaliado.",
      "sourceRefs": [
        "NOV_PADIS18"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-075",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Melatonina na atualização PADIS",
      "difficulty": "Médio",
      "tags": [
        "sedacao-seguranca",
        "melatonina-na-atualiza-o-padis",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "A equipe lê PADIS 2025 e decide incluir melatonina em sua discussão de sono. Qual formulação preserva o grau da evidência?",
      "options": {
        "A": "É intervenção obrigatória com benefício certo em todo adulto.",
        "B": "Elimina a necessidade de medidas ambientais para sono.",
        "C": "Substitui analgesia e tratamento da causa da agitação.",
        "D": "Prova que qualquer sedativo noturno tem o mesmo efeito.",
        "E": "É uma sugestão condicional, não garantia universal de prevenção de delirium ou morte."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Recomendação condicional não tem essa interpretação.",
        "B": "Incorreta. Cuidados não farmacológicos continuam relevantes.",
        "C": "Incorreta. Sono, dor e etiologia da agitação são dimensões distintas.",
        "D": "Incorreta. Não é possível extrapolar para toda a classe.",
        "E": "Correta. A recomendação não deve ganhar força ou desfechos que o documento não demonstrou."
      },
      "synthesis": "A recomendação não deve ganhar força ou desfechos que o documento não demonstrou.",
      "pearl": "🧠 Melatonina na atualização PADIS: É uma sugestão condicional, não garantia universal de prevenção de delirium ou morte.",
      "sourceRefs": [
        "NOV_PADIS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-076",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Ansiedade e benzodiazepínicos",
      "difficulty": "Difícil",
      "tags": [
        "sedacao-seguranca",
        "ansiedade-e-benzodiazep-nicos",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Ao discutir ansiedade em adultos da UTI, um residente afirma que PADIS 2025 recomenda benzodiazepínico rotineiro para todos. Qual correção é adequada?",
      "options": {
        "A": "A atualização reconhece evidência insuficiente para essa recomendação na ansiedade da UTI.",
        "B": "A diretriz comprova uso universal obrigatório.",
        "C": "A incerteza permite ignorar dependência ou abstinência.",
        "D": "Toda ansiedade significa falha respiratória e dispensa comunicação.",
        "E": "Evidência insuficiente demonstra benefício e segurança definitivos."
      },
      "answer": "A",
      "rationales": {
        "A": "Correta. Ausência de recomendação não equivale a proibição em indicações específicas.",
        "B": "Incorreta. Essa conclusão não corresponde à atualização.",
        "C": "Incorreta. Essas situações exigem avaliação própria.",
        "D": "Incorreta. A avaliação deve investigar causas e necessidades.",
        "E": "Incorreta. Incerteza precisa ser mantida explícita."
      },
      "synthesis": "Ausência de recomendação não equivale a proibição em indicações específicas.",
      "pearl": "🧠 Ansiedade e benzodiazepínicos: A atualização reconhece evidência insuficiente para essa recomendação na ansiedade da UTI.",
      "sourceRefs": [
        "NOV_PADIS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-077",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Mobilização com instabilidade",
      "difficulty": "Médio",
      "tags": [
        "sedacao-seguranca",
        "mobiliza-o-com-instabilidade",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto em choque está com vasopressor em rápida escalada. A rotina de mobilização estava agendada. Qual princípio é mais seguro?",
      "options": {
        "A": "Executar a mesma intensidade em qualquer estado hemodinâmico.",
        "B": "Reavaliar elegibilidade e adiar progressão insegura até condições clínicas apropriadas.",
        "C": "Abandonar para sempre qualquer reabilitação após um episódio instável.",
        "D": "Usar apenas a idade para liberar ou impedir mobilização.",
        "E": "Considerar o calendário mais importante que sinais de hipoperfusão."
      },
      "answer": "B",
      "rationales": {
        "A": "Incorreta. A recomendação não elimina critérios de segurança.",
        "B": "Correta. Mobilização deve considerar estabilidade, segurança e capacidade de participação.",
        "C": "Incorreta. A elegibilidade deve ser reavaliada, não descartada definitivamente.",
        "D": "Incorreta. Risco depende do estado clínico e funcional.",
        "E": "Incorreta. A instabilidade atual exige prioridade."
      },
      "synthesis": "Mobilização deve considerar estabilidade, segurança e capacidade de participação.",
      "pearl": "🧠 Mobilização com instabilidade: Reavaliar elegibilidade e adiar progressão insegura até condições clínicas apropriadas.",
      "sourceRefs": [
        "NOV_PADIS25"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-078",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Analgesia antes de mais hipnose",
      "difficulty": "Médio",
      "tags": [
        "sedacao-seguranca",
        "analgesia-antes-de-mais-hipnose",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto intubado fica agitado ao reposicionar uma fratura dolorosa. Qual avaliação deve preceder simplesmente aprofundar a sedação?",
      "options": {
        "A": "Aumentar apenas hipnótico porque todo movimento é ansiedade.",
        "B": "Usar bloqueador neuromuscular para ocultar a resposta dolorosa.",
        "C": "Reconhecer e tratar dor, além de investigar outros fatores de agitação.",
        "D": "Excluir dor se a pressão arterial estiver normal.",
        "E": "Desconsiderar procedimentos como fonte de dor na UTI."
      },
      "answer": "C",
      "rationales": {
        "A": "Incorreta. Dor é uma hipótese evidente no contexto.",
        "B": "Incorreta. Paralisia não trata dor nem garante inconsciência.",
        "C": "Correta. Analgesia e sedação têm objetivos distintos e precisam de avaliação própria.",
        "D": "Incorreta. Sinais vitais não excluem sofrimento.",
        "E": "Incorreta. Intervenções podem exigir planejamento analgésico."
      },
      "synthesis": "Analgesia e sedação têm objetivos distintos e precisam de avaliação própria.",
      "pearl": "🧠 Analgesia antes de mais hipnose: Reconhecer e tratar dor, além de investigar outros fatores de agitação.",
      "sourceRefs": [
        "NOV_PADIS18"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-079",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Paralisia não confirma conforto",
      "difficulty": "Médio",
      "tags": [
        "sedacao-seguranca",
        "paralisia-n-o-confirma-conforto",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto recebe bloqueador neuromuscular e para de se mover. Qual interpretação é adequada?",
      "options": {
        "A": "Pode-se retirar analgesia assim que houver paralisia.",
        "B": "Frequência cardíaca normal prova ausência de consciência.",
        "C": "Um único método de monitorização é comprovadamente superior em todos.",
        "D": "A ausência de movimento não demonstra analgesia ou sedação suficientes.",
        "E": "Todo adulto paralisado está necessariamente em coma farmacológico."
      },
      "answer": "D",
      "rationales": {
        "A": "Incorreta. O bloqueador não tem esse efeito analgésico.",
        "B": "Incorreta. Sinal vital isolado não demonstra estado de consciência.",
        "C": "Incorreta. A diretriz reconhece limites de evidência entre estratégias.",
        "D": "Correta. O bloqueio mascara resposta motora; conforto e hipnose exigem planejamento independente.",
        "E": "Incorreta. Bloqueio neuromuscular não equivale a hipnose."
      },
      "synthesis": "O bloqueio mascara resposta motora; conforto e hipnose exigem planejamento independente.",
      "pearl": "🧠 Paralisia não confirma conforto: A ausência de movimento não demonstra analgesia ou sedação suficientes.",
      "sourceRefs": [
        "NOV_NMB26"
      ],
      "reviewStatus": "revisao-medica-pendente"
    },
    {
      "id": "TEMI-NOV26-080",
      "block": "sedacao-seguranca",
      "topicId": "sedacao-seguranca",
      "topicLabel": "Sedação e segurança",
      "subtopic": "Interface e lesão por pressão",
      "difficulty": "Médio",
      "tags": [
        "sedacao-seguranca",
        "interface-e-les-o-por-press-o",
        "TEMI",
        "novembro-2026"
      ],
      "stem": "Caso fictício. Adulto em VNI apresenta marca dolorosa crescente na ponte nasal. A oxigenação melhorou. Qual conduta de segurança deve acompanhar o suporte?",
      "options": {
        "A": "Apertar continuamente a máscara até desaparecer qualquer vazamento, ignorando a pele.",
        "B": "Presumir que melhora da saturação prova segurança da interface.",
        "C": "Suspender toda monitorização após a primeira hora de VNI.",
        "D": "Tratar a marca como problema inevitável que não requer revisão.",
        "E": "Inspecionar pele e ajuste da interface, reduzindo pressão lesiva sem perder suporte eficaz."
      },
      "answer": "E",
      "rationales": {
        "A": "Incorreta. Pressão excessiva pode agravar a lesão.",
        "B": "Incorreta. Eficácia respiratória e integridade da pele são avaliações distintas.",
        "C": "Incorreta. Tolerância e complicações podem mudar.",
        "D": "Incorreta. A avaliação do dispositivo permite prevenir dano.",
        "E": "Correta. Resposta respiratória favorável não elimina risco de lesão associada ao dispositivo."
      },
      "synthesis": "Resposta respiratória favorável não elimina risco de lesão associada ao dispositivo.",
      "pearl": "🧠 Interface e lesão por pressão: Inspecionar pele e ajuste da interface, reduzindo pressão lesiva sem perder suporte eficaz.",
      "sourceRefs": [
        "NOV_AARC24"
      ],
      "reviewStatus": "revisao-medica-pendente"
    }
  ]
};
