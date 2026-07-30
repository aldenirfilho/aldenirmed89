const TEMI_ABCDE_QBANK = {
  meta: {
    id: "qbank-temi-abcde-50-v1",
    title: "Sprint TEMI — POCUS, VM, IOT, DVA e Sepse",
    subtitle: "50 questões comentadas, 10 por bloco, com revisão ABCDE item a item",
    version: "1.0",
    updated: "2026-07-30",
    target: "radar-diario",
    destination: "Estação Radar Diário — conteúdo clínico/estudo do chat",
    status: "revisao-medica-pendente",
    purpose: "Apoio educacional para médicos e preparação TEMI; não substitui protocolo local, treinamento prático ou julgamento clínico.",
    patientData: false
  },
  sources: {
    SSC2026: {
      label: "Surviving Sepsis Campaign 2026",
      url: "https://doi.org/10.1007/s00134-026-08361-1",
      design: "diretriz internacional"
    },
    SCCM_RSI_2023: {
      label: "SCCM — Rapid Sequence Intubation 2023",
      url: "https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-rapid-sequence-intubation",
      design: "diretriz clínica"
    },
    ATS_ARDS_2024: {
      label: "ATS — ARDS guideline update 2024",
      url: "https://pubmed.ncbi.nlm.nih.gov/38032683/",
      design: "diretriz clínica"
    },
    ARMA: {
      label: "ARDSNet ARMA",
      url: "https://pubmed.ncbi.nlm.nih.gov/10793162/",
      design: "ensaio randomizado"
    },
    PROSEVA: {
      label: "PROSEVA",
      url: "https://pubmed.ncbi.nlm.nih.gov/23688302/",
      design: "ensaio randomizado"
    },
    ROSE: {
      label: "ROSE",
      url: "https://pubmed.ncbi.nlm.nih.gov/31112383/",
      design: "ensaio randomizado"
    },
    ART: {
      label: "ART",
      url: "https://pubmed.ncbi.nlm.nih.gov/28973363/",
      design: "ensaio randomizado"
    },
    PREOXI: {
      label: "PREOXI",
      url: "https://pubmed.ncbi.nlm.nih.gov/38869091/",
      design: "ensaio randomizado"
    },
    DEVICE: {
      label: "DEVICE",
      url: "https://pubmed.ncbi.nlm.nih.gov/37326325/",
      design: "ensaio randomizado"
    },
    PREVENT: {
      label: "PreVent",
      url: "https://pubmed.ncbi.nlm.nih.gov/30779528/",
      design: "ensaio randomizado"
    },
    SOAP_II: {
      label: "SOAP II",
      url: "https://pubmed.ncbi.nlm.nih.gov/20200382/",
      design: "ensaio randomizado"
    },
    VASST: {
      label: "VASST",
      url: "https://pubmed.ncbi.nlm.nih.gov/18305265/",
      design: "ensaio randomizado"
    },
    VANISH: {
      label: "VANISH",
      url: "https://pubmed.ncbi.nlm.nih.gov/27483065/",
      design: "ensaio randomizado"
    },
    SEPSISPAM: {
      label: "SEPSISPAM",
      url: "https://pubmed.ncbi.nlm.nih.gov/24635770/",
      design: "ensaio randomizado"
    },
    TRIAL_65: {
      label: "65 Trial",
      url: "https://pubmed.ncbi.nlm.nih.gov/32049269/",
      design: "ensaio randomizado"
    },
    ATHOS_3: {
      label: "ATHOS-3",
      url: "https://pubmed.ncbi.nlm.nih.gov/28528561/",
      design: "ensaio randomizado"
    },
    ANDROMEDA: {
      label: "ANDROMEDA-SHOCK",
      url: "https://pubmed.ncbi.nlm.nih.gov/30772908/",
      design: "ensaio randomizado"
    },
    CLASSIC: {
      label: "CLASSIC",
      url: "https://pubmed.ncbi.nlm.nih.gov/35709019/",
      design: "ensaio randomizado"
    },
    CLOVERS: {
      label: "CLOVERS",
      url: "https://pubmed.ncbi.nlm.nih.gov/36688507/",
      design: "ensaio randomizado"
    },
    LOVIT: {
      label: "LOVIT",
      url: "https://pubmed.ncbi.nlm.nih.gov/35704292/",
      design: "ensaio randomizado"
    },
    VITAMINS: {
      label: "VITAMINS",
      url: "https://pubmed.ncbi.nlm.nih.gov/31950979/",
      design: "ensaio randomizado"
    },
    VEXUS: {
      label: "VExUS development study",
      url: "https://pubmed.ncbi.nlm.nih.gov/32270297/",
      design: "coorte prospectiva pós-cirurgia cardíaca"
    },
    SHOC_ED: {
      label: "SHoC-ED",
      url: "https://pubmed.ncbi.nlm.nih.gov/32968565/",
      design: "ensaio randomizado"
    },
    ACEP_POCUS_2023: {
      label: "ACEP POCUS Guidelines 2023",
      url: "https://www.acep.org/siteassets/new-pdfs/policy-statements/ultrasound-guidelines--emergency-point-of-care-and-clinical-ultrasound-guidelines-in-medicine.pdf",
      design: "diretriz de prática"
    }
  },
  blocks: [
    { id: "POCUS", icon: "🩻", label: "POCUS", color: "#43e8ff" },
    { id: "VM", icon: "🫁", label: "Ventilação Mecânica", color: "#6aa9ff" },
    { id: "IOT", icon: "🛟", label: "Intubação Orotraqueal", color: "#a78bfa" },
    { id: "DVA", icon: "💉", label: "Drogas Vasoativas", color: "#ffad4f" },
    { id: "SEPSE", icon: "🦠", label: "Sepse", color: "#54f0a2" }
  ],
  questions: [
    {
      id: "TEMI-POCUS-001",
      block: "POCUS",
      difficulty: "Médio",
      tags: ["pulmão", "linhas A", "deslizamento"],
      stem: "Paciente com dispneia apresenta linhas A bilaterais e deslizamento pleural preservado. Qual interpretação é a mais adequada?",
      options: {
        A: "O padrão exclui embolia pulmonar.",
        B: "O padrão confirma exacerbação de DPOC.",
        C: "O pulmão anterior está predominantemente aerado, mas o diagnóstico depende do contexto.",
        D: "O achado confirma edema pulmonar cardiogênico.",
        E: "O padrão confirma pneumotórax bilateral."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. POCUS pulmonar normal ou com linhas A não exclui TEP.",
        B: "Incorreta. Asma/DPOC podem produzir perfil A, mas o padrão não confirma etiologia.",
        C: "Correta. Linhas A com sliding indicam aeramento anterior e exigem integração clínica.",
        D: "Incorreta. Edema intersticial costuma gerar linhas B difusas, embora haja exceções.",
        E: "Incorreta. Sliding preservado torna pneumotórax naquele ponto muito improvável."
      },
      synthesis: "POCUS descreve um padrão; não deve converter síndrome em diagnóstico sem probabilidade clínica.",
      pearl: "🧠 Perfil A = pulmão aerado; não significa pulmão sem doença.",
      sourceRefs: ["ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-POCUS-002",
      block: "POCUS",
      difficulty: "Médio",
      tags: ["linhas B", "síndrome intersticial", "edema"],
      stem: "Linhas B bilaterais, múltiplas e difusas, com deslizamento presente, foram encontradas em paciente hipoxêmico. O que esse achado permite afirmar?",
      options: {
        A: "Existe síndrome intersticial, cuja causa ainda precisa ser definida.",
        B: "Há pneumonia bacteriana comprovada.",
        C: "Há edema cardiogênico comprovado.",
        D: "Há pneumotórax oculto.",
        E: "A pressão de oclusão da artéria pulmonar está obrigatoriamente elevada."
      },
      answer: "A",
      rationales: {
        A: "Correta. B-lines difusas indicam aumento de densidade/interstício, não etiologia única.",
        B: "Incorreta. Pneumonia costuma exigir contexto e sinais como consolidação focal.",
        C: "Incorreta. Edema cardiogênico é uma causa, mas ARDS e inflamação também são possíveis.",
        D: "Incorreta. Pneumotórax tende a abolir sliding e B-lines no ponto examinado.",
        E: "Incorreta. B-lines não medem diretamente pressão de oclusão."
      },
      synthesis: "Diferencie síndrome ultrassonográfica de diagnóstico causal.",
      pearl: "🌧️ B-lines dizem 'interstício úmido/denso', não dizem sozinho por quê.",
      sourceRefs: ["ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-POCUS-003",
      block: "POCUS",
      difficulty: "Médio",
      tags: ["pneumotórax", "lung point", "sliding"],
      stem: "Em paciente subitamente hipoxêmico, há ausência de sliding e de pulso pulmonar; um lung point é identificado. Qual conclusão é mais forte?",
      options: {
        A: "O lung point apoia fortemente pneumotórax no hemitórax examinado.",
        B: "Ausência de sliding isolada sempre confirma pneumotórax.",
        C: "B-lines difusas confirmariam pneumotórax.",
        D: "O achado exclui necessidade de avaliação clínica imediata.",
        E: "O tamanho do pneumotórax é definido com precisão pelo lung point."
      },
      answer: "A",
      rationales: {
        A: "Correta. Lung point é achado altamente específico quando tecnicamente verdadeiro.",
        B: "Incorreta. Apneia, intubação seletiva, aderências e pleurodese podem abolir sliding.",
        C: "Incorreta. B-lines verdadeiras no ponto examinado tornam pneumotórax improvável ali.",
        D: "Incorreta. Instabilidade exige ação integrada; POCUS não substitui ABCDE.",
        E: "Incorreta. Localização pode sugerir extensão, mas não quantifica com precisão universal."
      },
      synthesis: "Use combinação de sinais e fisiologia, especialmente no pneumotórax hipertensivo.",
      pearl: "📍 Lung point confirma melhor do que 'sem sliding' isolado.",
      sourceRefs: ["ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-POCUS-004",
      block: "POCUS",
      difficulty: "Difícil",
      tags: ["pericárdio", "PLAX", "derrame pleural"],
      stem: "Na janela paraesternal longitudinal, coleção anecoica é vista posteriormente ao coração. Qual relação anatômica ajuda a diferenciar derrame pericárdico de pleural?",
      options: {
        A: "Derrame pericárdico costuma cruzar posteriormente à aorta descendente.",
        B: "Derrame pleural tende a ficar posterior à aorta descendente; pericárdico, anterior.",
        C: "Ambos são sempre indistinguíveis nessa janela.",
        D: "A presença de líquido confirma tamponamento.",
        E: "A espessura isolada define repercussão hemodinâmica."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. A relação descrita está invertida.",
        B: "Correta. Na PLAX, a aorta descendente ajuda a localizar pleura e pericárdio.",
        C: "Incorreta. A anatomia e outras janelas frequentemente permitem diferenciação.",
        D: "Incorreta. Tamponamento é síndrome hemodinâmica, não simples presença de líquido.",
        E: "Incorreta. Velocidade de acúmulo e sinais de colapso importam mais que espessura isolada."
      },
      synthesis: "Anatomia em múltiplas janelas evita confundir dois espaços fluidos.",
      pearl: "🧭 Aorta descendente: pleura atrás, pericárdio à frente.",
      sourceRefs: ["ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-POCUS-005",
      block: "POCUS",
      difficulty: "Difícil",
      tags: ["VD", "TEP", "choque"],
      stem: "POCUS mostra VD dilatado e septo interventricular achatado em paciente com choque. Qual alternativa é correta?",
      options: {
        A: "O achado confirma TEP agudo e autoriza trombólise sem contexto.",
        B: "O padrão indica sobrecarga de VD, mas TEP é apenas uma das causas.",
        C: "O achado exclui hipertensão pulmonar crônica.",
        D: "O sinal de McConnell, se presente, é patognomônico.",
        E: "Ventilação mecânica não interfere na morfologia do VD."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. POCUS aumenta probabilidade, mas decisão de reperfusão exige integração.",
        B: "Correta. TEP, hipertensão pulmonar, infarto de VD e pressão ventilatória podem causar o padrão.",
        C: "Incorreta. Hipertensão pulmonar crônica é diferencial central.",
        D: "Incorreta. McConnell não é patognomônico e pode ocorrer em outras condições.",
        E: "Incorreta. Pressão intratorácica e resistência pulmonar alteram carga do VD."
      },
      synthesis: "VD grande é fenótipo hemodinâmico; o tempo e a causa precisam ser definidos.",
      pearl: "🫀 POCUS vê sobrecarga do VD, não enxerga o trombo por decreto.",
      sourceRefs: ["ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-POCUS-006",
      block: "POCUS",
      difficulty: "Difícil",
      tags: ["VCI", "responsividade", "ventilação espontânea"],
      stem: "Paciente respirando espontaneamente tem VCI pequena e muito variável. Qual uso do achado é mais seguro?",
      options: {
        A: "Administrar volume automaticamente até a VCI dilatar.",
        B: "Concluir hipovolemia absoluta com certeza.",
        C: "Usar como uma peça do exame e preferir teste dinâmico quando possível.",
        D: "Excluir congestão venosa sistêmica.",
        E: "Calcular pressão atrial direita exata."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. VCI isolada não é autorização para fluidos.",
        B: "Incorreta. Esforço inspiratório e pressão abdominal alteram variabilidade.",
        C: "Correta. Integre perfusão, pulmão, coração e resposta a manobra dinâmica.",
        D: "Incorreta. Congestão é multiparamétrica e pode coexistir com variabilidade.",
        E: "Incorreta. Estimativas de pressão têm incerteza relevante no paciente crítico."
      },
      synthesis: "A VCI é contextual; responsividade e tolerância são perguntas diferentes.",
      pearl: "💧 VCI variável não significa 'tanque vazio' automaticamente.",
      sourceRefs: ["SSC2026", "ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-POCUS-007",
      block: "POCUS",
      difficulty: "Difícil",
      tags: ["VExUS", "congestão", "AKI"],
      stem: "Qual conjunto corresponde melhor ao VExUS grave descrito no estudo de desenvolvimento?",
      options: {
        A: "VCI fina e todos os Dopplers normais.",
        B: "VCI dilatada com alterações venosas graves em múltiplos territórios.",
        C: "Apenas linhas B focais.",
        D: "Somente fração de ejeção reduzida.",
        E: "Somente pressão arterial elevada."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Isso não representa congestão venosa grave pelo sistema.",
        B: "Correta. VCI dilatada e Dopplers hepático, portal/renal alterados sustentam gravidade.",
        C: "Incorreta. Linha B não compõe diretamente a graduação VExUS.",
        D: "Incorreta. Fração de ejeção não mede congestão sistêmica venosa.",
        E: "Incorreta. Pressão arterial não define o escore."
      },
      synthesis: "VExUS é uma ferramenta de congestão, originalmente associativa e não um protocolo terapêutico validado universalmente.",
      pearl: "🌊 CAVA + Dopplers; não 'VCI sozinha'.",
      sourceRefs: ["VEXUS"]
    },
    {
      id: "TEMI-POCUS-008",
      block: "POCUS",
      difficulty: "Médio",
      tags: ["FAST", "trauma", "choque"],
      stem: "Trauma fechado, choque e FAST positivo no hipocôndrio direito. Qual interpretação é mais adequada?",
      options: {
        A: "O exame identifica precisamente o órgão que sangra.",
        B: "O achado de líquido livre, integrado à instabilidade, acelera controle hemorrágico.",
        C: "FAST negativo excluiria hemorragia retroperitoneal.",
        D: "FAST positivo diferencia sangue de ascite com certeza.",
        E: "O exame substitui avaliação cirúrgica."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. FAST detecta líquido, mas não localiza sempre a lesão fonte.",
        B: "Correta. Em instabilidade, líquido livre muda prioridade e mobiliza controle de dano.",
        C: "Incorreta. Retroperitônio e pequenas coleções podem escapar.",
        D: "Incorreta. O conteúdo anecoico precisa de contexto; ascite pode gerar falso positivo.",
        E: "Incorreta. É ferramenta de triagem integrada à equipe de trauma."
      },
      synthesis: "FAST responde 'há líquido onde não deveria?' mais do que 'qual órgão sangra?'.",
      pearl: "🩸 Instável + FAST positivo = pense controle de hemorragia, não tomografia automática.",
      sourceRefs: ["ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-POCUS-009",
      block: "POCUS",
      difficulty: "Difícil",
      tags: ["SHoC-ED", "evidência", "choque"],
      stem: "Qual leitura do SHoC-ED evita extrapolação indevida sobre POCUS no choque indiferenciado?",
      options: {
        A: "POCUS precoce reduziu mortalidade de forma definitiva.",
        B: "POCUS não tem utilidade diagnóstica individual.",
        C: "O protocolo não melhorou marcadores globais de ressuscitação, sem excluir benefício em casos selecionados.",
        D: "O estudo prova que RUSH deve ser abandonado.",
        E: "O estudo comparou dois vasopressores."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. O ensaio não demonstrou benefício definitivo de mortalidade.",
        B: "Incorreta. Ausência de benefício global não significa ausência de utilidade individual.",
        C: "Correta. Essa é a leitura equilibrada do ensaio e de suas limitações.",
        D: "Incorreta. O estudo não justifica abandonar POCUS contextual.",
        E: "Incorreta. A intervenção foi protocolo POCUS versus cuidado usual."
      },
      synthesis: "Ferramenta diagnóstica pode ajudar decisões sem necessariamente melhorar desfecho global em todo paciente.",
      pearl: "🔬 Trial negativo para estratégia global ≠ ferramenta inútil.",
      sourceRefs: ["SHOC_ED"]
    },
    {
      id: "TEMI-POCUS-010",
      block: "POCUS",
      difficulty: "Médio",
      tags: ["PCR", "POCUS", "pausa"],
      stem: "Durante PCR, qual prática de POCUS é mais compatível com segurança?",
      options: {
        A: "Prolongar a pausa até obter todas as janelas.",
        B: "Preparar a janela durante compressões e adquirir imagem na pausa programada, sem prolongá-la.",
        C: "Usar ausência de movimento cardíaco como motivo isolado para encerrar.",
        D: "Substituir checagem de ritmo por ecocardiografia.",
        E: "Aguardar especialista antes de retomar compressões."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Pausas prolongadas reduzem perfusão coronária.",
        B: "Correta. Planejamento e gravação rápida preservam compressões.",
        C: "Incorreta. Prognóstico e término exigem múltiplos dados e contexto.",
        D: "Incorreta. POCUS complementa o algoritmo de ressuscitação.",
        E: "Incorreta. Compressões devem ser retomadas imediatamente."
      },
      synthesis: "A pergunta não é apenas o que o POCUS mostra, mas quanto tempo ele rouba das compressões.",
      pearl: "⏱️ Na PCR, a janela não pode ser maior que a pausa.",
      sourceRefs: ["ACEP_POCUS_2023"]
    },
    {
      id: "TEMI-VM-001",
      block: "VM",
      difficulty: "Médio",
      tags: ["volume corrente", "peso predito", "ARDSNet"],
      stem: "Em paciente obeso com SDRA, qual peso deve orientar o volume corrente protetor?",
      options: {
        A: "Peso atual medido na admissão.",
        B: "Peso ideal estimado pela altura e sexo, isto é, peso predito.",
        C: "Peso após diurese.",
        D: "Média entre peso atual e predito.",
        E: "Superfície corporal."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Peso atual superestima tamanho pulmonar na obesidade.",
        B: "Correta. Peso predito aproxima dimensão pulmonar e orienta mL/kg.",
        C: "Incorreta. Variação hídrica não define tamanho pulmonar.",
        D: "Incorreta. Essa média não pertence ao protocolo validado.",
        E: "Incorreta. Superfície corporal não é base do volume corrente ARDSNet."
      },
      synthesis: "Pulmão acompanha altura/sexo mais do que massa corporal atual.",
      pearl: "📏 Volume corrente olha a altura, não a balança.",
      sourceRefs: ["ARMA", "ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-002",
      block: "VM",
      difficulty: "Médio",
      tags: ["platô", "SDRA", "proteção"],
      stem: "Qual alvo é central na ventilação protetora da SDRA segundo ARDSNet e diretrizes?",
      options: {
        A: "Pressão de pico sempre abaixo de 20 cmH₂O.",
        B: "Pressão de platô abaixo de 30 cmH₂O, junto a baixo volume corrente.",
        C: "PEEP obrigatoriamente zero.",
        D: "PaCO₂ sempre normal.",
        E: "FiO₂ sempre 100%."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Pico inclui componente resistivo e pode estar alto com platô aceitável.",
        B: "Correta. Limitar platô e volume é pilar de proteção pulmonar.",
        C: "Incorreta. PEEP é usada para oxigenação/recrutamento conforme fenótipo.",
        D: "Incorreta. Hipercapnia permissiva pode ocorrer dentro de limites clínicos.",
        E: "Incorreta. Exposição excessiva ao oxigênio deve ser evitada."
      },
      synthesis: "Proteção combina volume e pressão; nenhum número deve ser lido isoladamente.",
      pearl: "6 pelo PBW, platô abaixo de 30.",
      sourceRefs: ["ARMA", "ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-003",
      block: "VM",
      difficulty: "Difícil",
      tags: ["driving pressure", "complacência", "PEEP"],
      stem: "Pressão de platô é 28 cmH₂O e PEEP total é 12 cmH₂O. Qual é a driving pressure?",
      options: {
        A: "12 cmH₂O.",
        B: "16 cmH₂O.",
        C: "28 cmH₂O.",
        D: "40 cmH₂O.",
        E: "Não pode ser calculada sem pressão de pico."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Esse é o valor da PEEP total.",
        B: "Correta. Driving pressure = platô − PEEP total = 16.",
        C: "Incorreta. Esse é o platô.",
        D: "Incorreta. Somar platô e PEEP não define driving pressure.",
        E: "Incorreta. Pressão de pico não é necessária ao cálculo."
      },
      synthesis: "Driving pressure reflete volume normalizado pela complacência do sistema respiratório.",
      pearl: "🧮 ΔP = Pplat − PEEP total.",
      sourceRefs: ["ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-004",
      block: "VM",
      difficulty: "Médio",
      tags: ["PROSEVA", "prona", "SDRA"],
      stem: "Qual cenário mais se aproxima da população e estratégia do PROSEVA?",
      options: {
        A: "SDRA leve, prona por duas horas.",
        B: "SDRA grave com PaO₂/FiO₂ <150, prona precoce por sessões prolongadas.",
        C: "DPOC estável em ventilação não invasiva.",
        D: "Pneumonia sem hipoxemia.",
        E: "Prona somente após sete dias de hipoxemia."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O benefício pivotal ocorreu em SDRA grave e sessões longas.",
        B: "Correta. Esse é o núcleo clínico do PROSEVA.",
        C: "Incorreta. Não foi a população do ensaio.",
        D: "Incorreta. Ausência de hipoxemia grave não corresponde ao estudo.",
        E: "Incorreta. A estratégia foi precoce, não resgate tardio obrigatório."
      },
      synthesis: "PROSEVA depende de seleção, precocidade, duração e equipe experiente.",
      pearl: "🔄 Prona não é manobra curta; é estratégia prolongada.",
      sourceRefs: ["PROSEVA", "ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-005",
      block: "VM",
      difficulty: "Difícil",
      tags: ["ROSE", "bloqueio neuromuscular", "sedação"],
      stem: "Qual interpretação do ROSE é correta?",
      options: {
        A: "Bloqueio neuromuscular contínuo precoce deve ser rotineiro em toda SDRA.",
        B: "Bloqueio com sedação profunda reduziu mortalidade comparado a cuidado usual com sedação mais leve.",
        C: "Não houve benefício de mortalidade para bloqueio rotineiro; uso pode permanecer selecionado.",
        D: "O ensaio estudou apenas pacientes não intubados.",
        E: "O ensaio proibiu prona."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. O ensaio afasta automatismo.",
        B: "Incorreta. Não houve redução significativa de mortalidade.",
        C: "Correta. Diretrizes admitem uso condicional em cenários graves selecionados.",
        D: "Incorreta. A população tinha SDRA moderada-grave ventilada.",
        E: "Incorreta. A leitura não se resume a proibição de prona."
      },
      synthesis: "Ausência de benefício rotineiro não equivale a proibição em dissincronia ou hipoxemia selecionada.",
      pearl: "🌹 ROSE: não paralise por reflexo.",
      sourceRefs: ["ROSE", "ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-006",
      block: "VM",
      difficulty: "Difícil",
      tags: ["ART", "recrutamento", "PEEP"],
      stem: "Qual foi a principal lição clínica do ART?",
      options: {
        A: "Manobra agressiva de recrutamento com PEEP titulada reduziu mortalidade.",
        B: "Estratégia agressiva aumentou mortalidade e não deve ser rotina.",
        C: "PEEP nunca deve ser usada na SDRA.",
        D: "Toda manobra de recrutamento é equivalente.",
        E: "O ensaio avaliou apenas ventilação não invasiva."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O resultado foi desfavorável.",
        B: "Correta. A intervenção agressiva trouxe dano em comparação à estratégia controle.",
        C: "Incorreta. PEEP continua parte da ventilação; o problema é a estratégia agressiva.",
        D: "Incorreta. Técnica, pressão e seleção mudam risco.",
        E: "Incorreta. O estudo foi de ventilação invasiva na SDRA."
      },
      synthesis: "Não confunda 'PEEP individualizada' com recrutamento agressivo protocolar.",
      pearl: "⚠️ ART: abrir o pulmão agressivamente pode fechar a circulação.",
      sourceRefs: ["ART", "ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-007",
      block: "VM",
      difficulty: "Médio",
      tags: ["SBT", "desmame", "sedação"],
      stem: "Paciente melhora da causa da insuficiência respiratória. Qual abordagem favorece libertação do ventilador?",
      options: {
        A: "Aguardar extubação até força muscular normal.",
        B: "Parear avaliação diária de sedação/despertar e teste de respiração espontânea quando seguro.",
        C: "Manter sedação profunda para evitar qualquer taquipneia.",
        D: "Usar gasometria normal como único critério.",
        E: "Ignorar proteção de via aérea e secreções."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Normalidade completa não é requisito e pode atrasar.",
        B: "Correta. SAT/SBT e avaliação clínica reduzem atraso evitável.",
        C: "Incorreta. Sedação profunda desnecessária prolonga ventilação.",
        D: "Incorreta. Prontidão é multiparamétrica.",
        E: "Incorreta. Tosse, consciência e secreções importam para extubação."
      },
      synthesis: "Desmame começa antes do SBT, com causa tratada e sedação revisada.",
      pearl: "⏰ Wake up + breathe, quando seguro.",
      sourceRefs: ["ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-008",
      block: "VM",
      difficulty: "Difícil",
      tags: ["auto-PEEP", "DPOC", "curvas"],
      stem: "Qual achado de curva sugere auto-PEEP por expiração incompleta?",
      options: {
        A: "Fluxo expiratório retorna a zero muito antes do ciclo seguinte.",
        B: "Fluxo expiratório permanece abaixo da linha de base quando inicia a próxima inspiração.",
        C: "Pressão de platô é menor que a PEEP.",
        D: "Volume corrente expirado é idêntico ao inspirado.",
        E: "Capnografia mostra platô normal."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Isso sugere tempo expiratório suficiente.",
        B: "Correta. Fluxo que não zera indica aprisionamento.",
        C: "Incorreta. Essa relação não descreve fisiologia válida usual.",
        D: "Incorreta. Igualdade de volume não exclui hiperinsuflação dinâmica.",
        E: "Incorreta. Capnograma normal não substitui curva fluxo-tempo."
      },
      synthesis: "Trate a constante de tempo: resistência, frequência, fluxo e tempo expiratório.",
      pearl: "📉 Se a expiração não zera, o próximo ciclo começa cedo demais.",
      sourceRefs: ["ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-009",
      block: "VM",
      difficulty: "Difícil",
      tags: ["hipercapnia permissiva", "TCE", "pH"],
      stem: "Em qual situação a hipercapnia permissiva merece cautela especial?",
      options: {
        A: "SDRA sem doença neurológica.",
        B: "Hipertensão intracraniana ou lesão cerebral com risco de aumento do fluxo cerebral.",
        C: "DPOC com auto-PEEP.",
        D: "Paciente com drive respiratório ausente.",
        E: "Anemia sem sangramento."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Pode ser aceita dentro de limites na proteção pulmonar.",
        B: "Correta. CO₂ pode aumentar fluxo cerebral e pressão intracraniana.",
        C: "Incorreta. Hipercapnia pode ser tolerada para ampliar expiração, conforme pH/contexto.",
        D: "Incorreta. Ausência de drive por si não é a principal contraindicação fisiológica.",
        E: "Incorreta. Anemia não é contraindicação específica à permissividade."
      },
      synthesis: "Proteção pulmonar precisa respeitar o cérebro e a acidemia.",
      pearl: "🧠 CO₂ permitido no pulmão pode ser perigoso no crânio.",
      sourceRefs: ["ATS_ARDS_2024"]
    },
    {
      id: "TEMI-VM-010",
      block: "VM",
      difficulty: "Médio",
      tags: ["FiO2", "oxigênio", "toxicidade"],
      stem: "Após estabilização, SpO₂ permanece muito acima da meta com FiO₂ de 100%. Qual princípio é apropriado?",
      options: {
        A: "Manter FiO₂ de 100% por segurança em toda ventilação.",
        B: "Reduzir FiO₂ progressivamente para a menor necessária à meta individual.",
        C: "Retirar PEEP antes de ajustar oxigênio.",
        D: "Aceitar qualquer hiperóxia porque não causa dano.",
        E: "Usar PaO₂ isolada sem observar SpO₂ e contexto."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Hiperóxia prolongada pode ser prejudicial.",
        B: "Correta. Titule à menor FiO₂ que atinja alvo seguro.",
        C: "Incorreta. PEEP e FiO₂ têm efeitos distintos e devem ser integradas.",
        D: "Incorreta. Excesso de oxigênio não é biologicamente neutro.",
        E: "Incorreta. Monitorização e perfusão precisam ser integradas."
      },
      synthesis: "Oxigênio é terapia com alvo, não configuração 'quanto mais, melhor'.",
      pearl: "🎯 Depois do resgate, desescale a FiO₂.",
      sourceRefs: ["ATS_ARDS_2024"]
    },
    {
      id: "TEMI-IOT-001",
      block: "IOT",
      difficulty: "Médio",
      tags: ["PREOXI", "VNI", "hipoxemia"],
      stem: "Adulto crítico com hipoxemia grave necessita IOT. Qual método reduziu hipoxemia no PREOXI comparado à máscara de oxigênio?",
      options: {
        A: "Nenhuma pré-oxigenação.",
        B: "VNI para pré-oxigenação.",
        C: "Oxigênio em baixo fluxo.",
        D: "Hiperventilação manual sem PEEP em todos.",
        E: "Intubação imediata antes de preparar o material."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Pré-oxigenação é componente crítico da segurança.",
        B: "Correta. VNI reduziu hipoxemia durante IOT no ensaio.",
        C: "Incorreta. Não corresponde à intervenção superior estudada.",
        D: "Incorreta. Técnica indiscriminada não foi a comparação.",
        E: "Incorreta. Preparação reduz falhas e complicações quando há tempo."
      },
      synthesis: "A pressão positiva pode aumentar reserva em shunt, respeitando contraindicações.",
      pearl: "🫧 PREOXI: pré-oxigenação é intervenção, não espera passiva.",
      sourceRefs: ["PREOXI", "SCCM_RSI_2023"]
    },
    {
      id: "TEMI-IOT-002",
      block: "IOT",
      difficulty: "Médio",
      tags: ["DEVICE", "videolaringoscopia", "primeira passagem"],
      stem: "Qual foi o principal achado do DEVICE em adultos críticos?",
      options: {
        A: "Laringoscopia direta teve maior sucesso de primeira passagem.",
        B: "Videolaringoscopia aumentou sucesso de primeira passagem.",
        C: "Videolaringoscopia eliminou todas as complicações.",
        D: "Não houve diferença de visualização ou sucesso.",
        E: "O ensaio avaliou apenas intubação eletiva em centro cirúrgico."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O resultado favoreceu vídeo.",
        B: "Correta. Sucesso na primeira tentativa foi maior com videolaringoscopia.",
        C: "Incorreta. Nenhum dispositivo elimina complicações.",
        D: "Incorreta. Houve diferença relevante no desfecho primário.",
        E: "Incorreta. Foram emergência e UTI."
      },
      synthesis: "Escolha dispositivo com evidência e domínio técnico, mantendo plano de contingência.",
      pearl: "📹 Primeira passagem é desfecho de segurança.",
      sourceRefs: ["DEVICE"]
    },
    {
      id: "TEMI-IOT-003",
      block: "IOT",
      difficulty: "Difícil",
      tags: ["PreVent", "bolsa-máscara", "hipoxemia"],
      stem: "No PreVent, ventilação bolsa-máscara entre indução e laringoscopia teve qual efeito?",
      options: {
        A: "Aumentou hipoxemia grave.",
        B: "Reduziu hipoxemia grave sem aumento demonstrado de aspiração.",
        C: "Eliminou a necessidade de pré-oxigenação.",
        D: "Foi contraindicada em todos os adultos críticos.",
        E: "Aumentou mortalidade hospitalar de forma comprovada."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O efeito foi no sentido oposto.",
        B: "Correta. Esse foi o resultado principal de segurança respiratória.",
        C: "Incorreta. Ventilação após indução complementa, não substitui, pré-oxigenação.",
        D: "Incorreta. Deve ser individualizada, não proibida universalmente.",
        E: "Incorreta. O ensaio não demonstrou esse dano."
      },
      synthesis: "O benefício não autoriza bolsa-máscara indiscriminada em via aérea contaminada.",
      pearl: "🎈 PreVent: ventilar pode proteger; avalie aspiração e vedação.",
      sourceRefs: ["PREVENT"]
    },
    {
      id: "TEMI-IOT-004",
      block: "IOT",
      difficulty: "Difícil",
      tags: ["choque", "colapso peri-intubação", "otimização"],
      stem: "Paciente em choque profundo necessita IOT. Qual afirmação é mais segura?",
      options: {
        A: "A indução sempre melhora a pressão arterial.",
        B: "A ventilação positiva não altera retorno venoso.",
        C: "IOT pode precipitar colapso; perfusão, pré-oxigenação e resgate devem ser preparados.",
        D: "Um bolus de fluido é superior a vasopressor em qualquer paciente.",
        E: "Não há necessidade de plano pós-intubação."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. Indução pode causar vasodilatação e perda de tônus simpático.",
        B: "Incorreta. Pressão positiva pode reduzir retorno venoso.",
        C: "Correta. A via aérea fisiologicamente difícil exige otimização antecipada.",
        D: "Incorreta. SCCM considera evidência insuficiente para superioridade universal.",
        E: "Incorreta. Sedação, ventilador e hemodinâmica pós-IOT precisam estar prontos."
      },
      synthesis: "A IOT do crítico é procedimento hemodinâmico e respiratório.",
      pearl: "⚡ Antes da lâmina: oxigênio, pressão, plano e pós-IOT.",
      sourceRefs: ["SCCM_RSI_2023"]
    },
    {
      id: "TEMI-IOT-005",
      block: "IOT",
      difficulty: "Médio",
      tags: ["LEMON", "via aérea difícil", "avaliação"],
      stem: "Qual item NÃO pertence ao LEMON?",
      options: {
        A: "Look externally.",
        B: "Evaluate regra 3-3-2.",
        C: "Mallampati.",
        D: "Obstruction.",
        E: "Norepinephrine dose."
      },
      answer: "E",
      rationales: {
        A: "Incorreta como resposta. Look compõe LEMON.",
        B: "Incorreta como resposta. Evaluate compõe LEMON.",
        C: "Incorreta como resposta. Mallampati compõe LEMON.",
        D: "Incorreta como resposta. Obstruction compõe LEMON.",
        E: "Correta. Dose de vasopressor não faz parte do mnemônico anatômico."
      },
      synthesis: "LEMON avalia anatomia; HEAVEN/MACOCHA incorporam outros riscos.",
      pearl: "🍋 LEMON vê a via aérea; não enxerga toda a fisiologia.",
      sourceRefs: ["SCCM_RSI_2023"]
    },
    {
      id: "TEMI-IOT-006",
      block: "IOT",
      difficulty: "Difícil",
      tags: ["MACOCHA", "UTI", "hipoxemia"],
      stem: "Qual combinação integra o MACOCHA para IOT difícil na UTI?",
      options: {
        A: "Somente Mallampati e peso.",
        B: "Anatomia, apneia, mobilidade cervical, abertura oral, coma, hipoxemia e operador.",
        C: "Apenas saturação e pressão arterial.",
        D: "Somente experiência do operador.",
        E: "Idade, creatinina e lactato."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O escore é mais amplo.",
        B: "Correta. Resume os domínios do MACOCHA.",
        C: "Incorreta. Faltam anatomia e contexto.",
        D: "Incorreta. Operador é apenas um componente.",
        E: "Incorreta. Esses itens não formam o escore."
      },
      synthesis: "O risco na UTI nasce de anatomia, fisiologia e ambiente.",
      pearl: "🧮 MACOCHA: boca + pescoço + cérebro + oxigênio + operador.",
      sourceRefs: ["SCCM_RSI_2023"]
    },
    {
      id: "TEMI-IOT-007",
      block: "IOT",
      difficulty: "Médio",
      tags: ["RSI", "bloqueador neuromuscular", "sedativo"],
      stem: "Segundo a diretriz SCCM de RSI, qual associação é recomendada?",
      options: {
        A: "Bloqueador neuromuscular sem sedativo-hipnótico.",
        B: "Sedativo-hipnótico com bloqueador neuromuscular para RSI, salvo contexto específico.",
        C: "Apenas opioide em toda IOT.",
        D: "Corticoide obrigatório após qualquer indução.",
        E: "Evitar bloqueador em todos os pacientes críticos."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Paralisar consciente é grave falha de segurança.",
        B: "Correta. A diretriz recomenda NMBA quando se usa indução para RSI.",
        C: "Incorreta. Opioide isolado não constitui indução adequada universal.",
        D: "Incorreta. Corticoide não é obrigatório após qualquer agente.",
        E: "Incorreta. NMBA integra RSI quando apropriado."
      },
      synthesis: "Indução e paralisia devem ser planejadas como par, com sedação pós-IOT pronta.",
      pearl: "🛡️ Nunca paralise sem hipnose adequada.",
      sourceRefs: ["SCCM_RSI_2023"]
    },
    {
      id: "TEMI-IOT-008",
      block: "IOT",
      difficulty: "Difícil",
      tags: ["etomidato", "corticoide", "RSI"],
      stem: "Qual afirmação sobre etomidato na RSI é compatível com a diretriz SCCM?",
      options: {
        A: "Etomidato é proibido em sepse.",
        B: "Corticoide deve ser dado rotineiramente para reverter supressão adrenal após dose única.",
        C: "Não há diferença clara de mortalidade/hipotensão versus outros agentes, e corticoide pós-etomidato não é recomendado para esse fim.",
        D: "Etomidato não produz hipnose.",
        E: "Etomidato substitui o bloqueador neuromuscular."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. A diretriz não estabelece proibição universal.",
        B: "Incorreta. Sugere contra corticoide com esse objetivo específico.",
        C: "Correta. Resume as recomendações e a incerteza disponível.",
        D: "Incorreta. É agente hipnótico de indução.",
        E: "Incorreta. Hipnótico e NMBA têm funções distintas."
      },
      synthesis: "Escolha do agente depende da fisiologia; nenhum é magicamente neutro.",
      pearl: "🧪 Etomidato: não demonize nem 'compense' automaticamente.",
      sourceRefs: ["SCCM_RSI_2023"]
    },
    {
      id: "TEMI-IOT-009",
      block: "IOT",
      difficulty: "Médio",
      tags: ["rocurônio", "succinilcolina", "NMBA"],
      stem: "Na ausência de contraindicação à succinilcolina, qual orientação da SCCM é correta?",
      options: {
        A: "Somente succinilcolina pode ser usada.",
        B: "Somente rocurônio pode ser usado.",
        C: "Rocurônio ou succinilcolina são opções, considerando contraindicações e plano pós-IOT.",
        D: "Nenhum bloqueador deve ser usado.",
        E: "A escolha independe de hipercalemia, doença neuromuscular ou duração."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. Rocurônio é alternativa válida.",
        B: "Incorreta. Succinilcolina pode ser válida quando não contraindicada.",
        C: "Correta. A seleção é contextual e a sedação pós-IOT é indispensável.",
        D: "Incorreta. A diretriz recomenda NMBA na RSI.",
        E: "Incorreta. Contraindicações e duração são decisivas."
      },
      synthesis: "A melhor droga é a compatível com fisiologia, contraindicações e capacidade de sedação contínua.",
      pearl: "🔐 Roc dura; succ tem contraindicações — pense antes de empurrar.",
      sourceRefs: ["SCCM_RSI_2023"]
    },
    {
      id: "TEMI-IOT-010",
      block: "IOT",
      difficulty: "Médio",
      tags: ["capnografia", "confirmação", "tubo"],
      stem: "Qual método fornece a confirmação contínua mais importante de posição traqueal após IOT, na presença de perfusão?",
      options: {
        A: "Ausculta isolada.",
        B: "Embaçamento do tubo.",
        C: "Capnografia com curva persistente, integrada à avaliação clínica.",
        D: "Radiografia antes de ventilar.",
        E: "Expansão torácica subjetiva isolada."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. Ausculta pode enganar e não é contínua.",
        B: "Incorreta. Embaçamento é inespecífico.",
        C: "Correta. Curva persistente confirma ventilação traqueal quando há circulação.",
        D: "Incorreta. Radiografia avalia profundidade/complicações, mas não deve atrasar ventilação.",
        E: "Incorreta. Expansão isolada não exclui posição esofágica ou seletiva."
      },
      synthesis: "Confirme tubo, profundidade, ventilação bilateral e estado hemodinâmico.",
      pearl: "📈 Tubo sem onda de CO₂ é tubo não confirmado.",
      sourceRefs: ["SCCM_RSI_2023"]
    },
    {
      id: "TEMI-DVA-001",
      block: "DVA",
      difficulty: "Médio",
      tags: ["noradrenalina", "choque séptico", "primeira linha"],
      stem: "Qual vasopressor é referência de primeira linha no choque séptico?",
      options: {
        A: "Dopamina.",
        B: "Noradrenalina.",
        C: "Vasopressina isolada.",
        D: "Angiotensina II isolada.",
        E: "Dobutamina."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Dopamina causa mais arritmias e não é primeira linha usual.",
        B: "Correta. Noradrenalina é o vasopressor inicial recomendado.",
        C: "Incorreta. Vasopressina é geralmente adjuvante, não substituta inicial.",
        D: "Incorreta. Angiotensina II é opção selecionada em refratariedade.",
        E: "Incorreta. Dobutamina é inotrópico, não vasopressor inicial padrão."
      },
      synthesis: "Comece pela droga adequada, mas trate simultaneamente causa e perfusão.",
      pearl: "💉 Choque séptico: NORA primeiro.",
      sourceRefs: ["SSC2026", "SOAP_II"]
    },
    {
      id: "TEMI-DVA-002",
      block: "DVA",
      difficulty: "Médio",
      tags: ["SOAP II", "dopamina", "arritmia"],
      stem: "Qual resultado diferencia dopamina de noradrenalina no SOAP II?",
      options: {
        A: "Dopamina reduziu arritmias.",
        B: "Dopamina aumentou arritmias, sem benefício global de mortalidade.",
        C: "Noradrenalina aumentou mortalidade em todo choque.",
        D: "As drogas foram idênticas em eventos adversos.",
        E: "O ensaio avaliou apenas pacientes sem choque."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Dopamina causou mais arritmias.",
        B: "Correta. Esse é o achado prático central.",
        C: "Incorreta. Não houve esse sinal global.",
        D: "Incorreta. Eventos arrítmicos diferiram.",
        E: "Incorreta. Todos os participantes tinham choque."
      },
      synthesis: "Mortalidade neutra não apaga diferença importante de segurança.",
      pearl: "🧼 SOAP II: DOPA suja o ritmo.",
      sourceRefs: ["SOAP_II"]
    },
    {
      id: "TEMI-DVA-003",
      block: "DVA",
      difficulty: "Difícil",
      tags: ["VASST", "vasopressina", "adjuvante"],
      stem: "Qual interpretação do VASST é mais adequada?",
      options: {
        A: "Vasopressina reduziu mortalidade global de forma inequívoca.",
        B: "Vasopressina em baixa dose como adjuvante não reduziu mortalidade global.",
        C: "Vasopressina substituiu noradrenalina como primeira linha.",
        D: "O estudo avaliou apenas choque cardiogênico.",
        E: "Subgrupo menos grave prova indicação universal precoce."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O desfecho global foi neutro.",
        B: "Correta. Essa é a conclusão primária.",
        C: "Incorreta. Foi adicionada a vasopressores abertos.",
        D: "Incorreta. A população era choque séptico.",
        E: "Incorreta. Subgrupo não deve virar regra universal."
      },
      synthesis: "Vasopressina é opção catecolamina-poupadora; não é prova de superioridade de mortalidade.",
      pearl: "➕ VASST: soma vasopressina, não soma certeza de sobrevida.",
      sourceRefs: ["VASST", "SSC2026"]
    },
    {
      id: "TEMI-DVA-004",
      block: "DVA",
      difficulty: "Difícil",
      tags: ["VANISH", "vasopressina", "rim"],
      stem: "No VANISH, vasopressina precoce comparada à noradrenalina:",
      options: {
        A: "Melhorou significativamente dias livres de falência renal no desfecho primário.",
        B: "Não melhorou o desfecho renal primário nem mortalidade; houve menos TRR como achado secundário.",
        C: "Aumentou mortalidade de forma inequívoca.",
        D: "Eliminou necessidade de catecolamina.",
        E: "Foi estudada apenas após 72 horas."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O desfecho primário não melhorou.",
        B: "Correta. Resume resultado e hierarquia dos desfechos.",
        C: "Incorreta. Não houve diferença significativa de mortalidade.",
        D: "Incorreta. Não eliminou suporte vasoativo.",
        E: "Incorreta. A estratégia foi precoce."
      },
      synthesis: "Achado secundário de TRR não prova substituição da primeira linha.",
      pearl: "🫥 VANISH: vasopressina não fez a falência renal 'sumir'.",
      sourceRefs: ["VANISH"]
    },
    {
      id: "TEMI-DVA-005",
      block: "DVA",
      difficulty: "Médio",
      tags: ["PAM", "SEPSISPAM", "hipertensão"],
      stem: "Qual alvo de PAM inicial é mais compatível com diretrizes, antes de personalização?",
      options: {
        A: "45 mmHg.",
        B: "55 mmHg para todos.",
        C: "Cerca de 65 mmHg.",
        D: "85 mmHg para todos.",
        E: "100 mmHg para todos."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. Geralmente insuficiente para perfusão.",
        B: "Incorreta. Não é o alvo inicial usual universal.",
        C: "Correta. É referência inicial, seguida de avaliação de perfusão.",
        D: "Incorreta. SEPSISPAM não mostrou benefício global e houve mais FA.",
        E: "Incorreta. Exposição catecolamínica seria excessiva na maioria."
      },
      synthesis: "PAM é meio para perfusão, não troféu numérico.",
      pearl: "🎯 Comece em 65; personalize com perfusão e pressão habitual.",
      sourceRefs: ["SSC2026", "SEPSISPAM"]
    },
    {
      id: "TEMI-DVA-006",
      block: "DVA",
      difficulty: "Difícil",
      tags: ["65 Trial", "hipotensão permissiva", "idosos"],
      stem: "Qual conclusão é correta sobre o 65 Trial?",
      options: {
        A: "PAM 60–65 reduziu mortalidade de 90 dias de forma estatisticamente significativa.",
        B: "Hipotensão permissiva reduziu exposição a vasopressor, sem redução estatística de mortalidade.",
        C: "O estudo incluiu apenas pacientes jovens.",
        D: "O estudo provou que PAM 60 serve para todos.",
        E: "Vasopressores não produziram eventos adversos."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. O desfecho de mortalidade não atingiu significância.",
        B: "Correta. Essa é a leitura equilibrada do estudo.",
        C: "Incorreta. Incluiu pacientes com 65 anos ou mais.",
        D: "Incorreta. Não autoriza generalização universal.",
        E: "Incorreta. O equilíbrio risco-benefício motivou o ensaio."
      },
      synthesis: "Menos vasopressor pode ser desejável, mas não deve sacrificar perfusão individual.",
      pearl: "6️⃣ 65 Trial: permissivo, não permissividade sem vigilância.",
      sourceRefs: ["TRIAL_65"]
    },
    {
      id: "TEMI-DVA-007",
      block: "DVA",
      difficulty: "Difícil",
      tags: ["dobutamina", "baixo débito", "perfusão"],
      stem: "Paciente em choque séptico alcança PAM com noradrenalina, mas mantém baixo débito e hipoperfusão. Qual opção pode ser considerada?",
      options: {
        A: "Dobutamina em paciente selecionado, com monitorização de resposta e arritmia.",
        B: "Dopamina obrigatória para todos.",
        C: "Suspender vasopressor imediatamente.",
        D: "Administrar fluido ilimitado sem avaliar responsividade.",
        E: "Tratar apenas o lactato sem examinar perfusão."
      },
      answer: "A",
      rationales: {
        A: "Correta. Inotrópico pode ser considerado quando baixo débito persiste.",
        B: "Incorreta. Dopamina não é obrigatória e aumenta arritmias.",
        C: "Incorreta. PAM pode cair e piorar perfusão.",
        D: "Incorreta. Fluido sem responsividade/tolerância gera dano.",
        E: "Incorreta. Lactato é marcador contextual, não alvo exclusivo."
      },
      synthesis: "Pressão restaurada não garante fluxo; trate o fenótipo hemodinâmico.",
      pearl: "🫀 PAM ok + débito baixo = pense bomba, não apenas vaso.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-DVA-008",
      block: "DVA",
      difficulty: "Difícil",
      tags: ["epinefrina", "lactato", "beta-2"],
      stem: "Após iniciar epinefrina, lactato aumenta apesar de melhora de perfusão periférica. Qual explicação deve ser lembrada?",
      options: {
        A: "Todo aumento de lactato significa hipóxia tecidual progressiva.",
        B: "Estimulação beta-adrenérgica pode elevar lactato sem hipoperfusão equivalente.",
        C: "Epinefrina sempre reduz glicólise.",
        D: "Lactato perde qualquer valor clínico.",
        E: "O valor confirma necrose mesentérica."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Produção adrenérgica é causa não hipóxica.",
        B: "Correta. Epinefrina pode aumentar glicólise e lactato.",
        C: "Incorreta. O efeito beta pode aumentar produção.",
        D: "Incorreta. Continua útil quando interpretado com contexto e tendência.",
        E: "Incorreta. Lactato é inespecífico."
      },
      synthesis: "Não trate um biomarcador sem ler a fisiologia que o produz.",
      pearl: "🧪 Com adrenalina, lactato pode ser sinal beta, não só sinal de falta de fluxo.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-DVA-009",
      block: "DVA",
      difficulty: "Difícil",
      tags: ["ATHOS-3", "angiotensina II", "choque refratário"],
      stem: "Qual desfecho foi claramente favorecido pela angiotensina II no ATHOS-3?",
      options: {
        A: "Resposta de PAM em três horas.",
        B: "Redução comprovada de mortalidade em 28 dias.",
        C: "Ausência total de eventos trombóticos.",
        D: "Cura da causa do choque.",
        E: "Substituição obrigatória da noradrenalina."
      },
      answer: "A",
      rationales: {
        A: "Correta. O estudo demonstrou resposta pressórica.",
        B: "Incorreta. Mortalidade não foi reduzida significativamente.",
        C: "Incorreta. Segurança e trombose exigem consideração.",
        D: "Incorreta. Vasopressor não controla foco/etiologia.",
        E: "Incorreta. Foi adjuvante em choque refratário."
      },
      synthesis: "Melhorar pressão é desfecho fisiológico; não equivale automaticamente a salvar vidas.",
      pearl: "⬆️ ATHOS-3 levanta MAP, não levanta certeza de sobrevida.",
      sourceRefs: ["ATHOS_3"]
    },
    {
      id: "TEMI-DVA-010",
      block: "DVA",
      difficulty: "Médio",
      tags: ["vasopressor periférico", "noradrenalina", "segurança"],
      stem: "Choque séptico e acesso central ainda indisponível. Qual afirmação é mais atual?",
      options: {
        A: "Noradrenalina nunca pode ser iniciada por acesso periférico.",
        B: "Pode ser iniciada temporariamente em acesso periférico adequado, com protocolo e vigilância, evitando atraso.",
        C: "Deve-se aguardar horas por cateter central apesar de choque.",
        D: "Qualquer veia distal e sem inspeção é aceitável.",
        E: "Extravasamento não exige plano de manejo."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Diretrizes aceitam início periférico bem monitorado.",
        B: "Correta. Local, calibre, inspeção e tempo devem seguir protocolo.",
        C: "Incorreta. Atraso de vasopressor em choque pode ser prejudicial.",
        D: "Incorreta. Acesso proximal/adequado e vigilância reduzem risco.",
        E: "Incorreta. A equipe deve ter protocolo de extravasamento."
      },
      synthesis: "Acesso periférico é ponte segura quando bem escolhido, não licença para abandono da vigilância.",
      pearl: "🚦 NORA periférica: comece cedo, veja sempre, centralize quando indicado.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-SEPSE-001",
      block: "SEPSE",
      difficulty: "Médio",
      tags: ["Sepsis-3", "SOFA", "qSOFA"],
      stem: "Qual definição melhor representa sepse em adultos?",
      options: {
        A: "Qualquer infecção com febre.",
        B: "Disfunção orgânica ameaçadora à vida causada por resposta desregulada à infecção.",
        C: "qSOFA ≥2 isoladamente.",
        D: "Lactato elevado isoladamente.",
        E: "Hemocultura positiva obrigatória."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Infecção sem disfunção orgânica não define sepse.",
        B: "Correta. É o conceito do Sepsis-3.",
        C: "Incorreta. qSOFA é alerta prognóstico, não definição diagnóstica isolada.",
        D: "Incorreta. Lactato tem múltiplas causas.",
        E: "Incorreta. Culturas podem ser negativas."
      },
      synthesis: "Sepse combina suspeita/confirmação de infecção com disfunção orgânica.",
      pearl: "🦠 Infecção + órgão falhando; não 'febre + qSOFA'.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-SEPSE-002",
      block: "SEPSE",
      difficulty: "Difícil",
      tags: ["antibiótico", "tempo", "stewardship"],
      stem: "Qual estratégia de tempo para antimicrobiano equilibra urgência e stewardship segundo SSC atual?",
      options: {
        A: "Antibiótico imediato para toda SIRS, sem avaliação.",
        B: "Choque séptico ou alta probabilidade: imediato; possível sepse sem choque: investigação rápida e decisão em janela curta.",
        C: "Aguardar cultura positiva em todo paciente.",
        D: "Adiar 24 horas mesmo em choque.",
        E: "Procalcitonina isolada decide início."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Supertratamento e diagnósticos alternativos importam.",
        B: "Correta. Urgência cresce com choque/probabilidade; sem choque há espaço para avaliação rápida.",
        C: "Incorreta. Culturas podem demorar ou ser negativas.",
        D: "Incorreta. Choque exige tratamento imediato.",
        E: "Incorreta. Biomarcador isolado não decide início."
      },
      synthesis: "Tempo do antibiótico é estratificado pela probabilidade e pela presença de choque.",
      pearl: "⏱️ Choque não espera; possibilidade sem choque merece diagnóstico rápido.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-SEPSE-003",
      block: "SEPSE",
      difficulty: "Médio",
      tags: ["hemocultura", "antibiótico", "diagnóstico"],
      stem: "Sobre culturas antes do antimicrobiano, qual afirmação é correta?",
      options: {
        A: "Devem ser obtidas quando isso não causa atraso substancial no tratamento indicado.",
        B: "São dispensáveis em todo choque.",
        C: "Devem atrasar antibiótico por várias horas.",
        D: "Uma única amostra sempre basta.",
        E: "Cultura negativa exclui infecção."
      },
      answer: "A",
      rationales: {
        A: "Correta. Aumenta rendimento e permite descalonamento sem sacrificar tempo.",
        B: "Incorreta. Culturas são importantes quando viáveis.",
        C: "Incorreta. Não devem atrasar terapia urgente.",
        D: "Incorreta. Técnica e número dependem do foco e protocolo.",
        E: "Incorreta. Sensibilidade é imperfeita."
      },
      synthesis: "Diagnóstico microbiológico e tratamento devem correr em paralelo.",
      pearl: "🧫 Colete primeiro se for rápido; trate primeiro se coletar significar atraso perigoso.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-SEPSE-004",
      block: "SEPSE",
      difficulty: "Médio",
      tags: ["controle de foco", "drenagem", "cirurgia"],
      stem: "Paciente com choque séptico e abscesso intra-abdominal drenável recebe antimicrobianos. Qual próximo princípio é central?",
      options: {
        A: "Aguardar normalização do lactato antes de controlar o foco.",
        B: "Realizar controle de foco tão cedo quanto clinicamente e logisticamente viável.",
        C: "Trocar antibiótico indefinidamente sem drenar.",
        D: "Controle de foco não muda desfecho.",
        E: "Adiar até hemocultura identificar o agente."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Foco persistente sustenta choque e lactato.",
        B: "Correta. Drenagem/remoção do foco é pilar do tratamento.",
        C: "Incorreta. Antimicrobiano pode falhar sem controle anatômico.",
        D: "Incorreta. Controle de foco é recomendação central.",
        E: "Incorreta. Não é necessário esperar cultura quando a indicação é clara."
      },
      synthesis: "Antibiótico sem controle de foco pode ser tratamento incompleto.",
      pearl: "🛠️ Sepse com coleção: remédio chega, mas a fonte precisa sair.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-SEPSE-005",
      block: "SEPSE",
      difficulty: "Difícil",
      tags: ["fluidos", "responsividade", "cristaloide balanceado"],
      stem: "Após volume inicial, qual abordagem é mais coerente para novos fluidos?",
      options: {
        A: "Repetir bolus fixos sem reavaliar.",
        B: "Usar medidas dinâmicas de responsividade e sinais de tolerância/congestão.",
        C: "Usar PVC isolada como verdade.",
        D: "Usar lactato isolado como indicação de volume.",
        E: "Evitar qualquer fluido em todo choque."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Acúmulo sem benefício gera dano.",
        B: "Correta. Resposta a manobra e tolerância guiam melhor.",
        C: "Incorreta. PVC isolada prediz mal responsividade.",
        D: "Incorreta. Lactato pode subir por causas não volêmicas.",
        E: "Incorreta. Alguns pacientes são responsivos e necessitam volume."
      },
      synthesis: "Pergunte duas coisas: responderá ao fluido e tolerará o fluido?",
      pearl: "💧 Responsividade não é sinônimo de necessidade; tolerância completa a decisão.",
      sourceRefs: ["SSC2026", "CLOVERS", "CLASSIC"]
    },
    {
      id: "TEMI-SEPSE-006",
      block: "SEPSE",
      difficulty: "Difícil",
      tags: ["CLOVERS", "CLASSIC", "fluidos"],
      stem: "Qual resumo conjunto de CLOVERS e CLASSIC é mais defensável?",
      options: {
        A: "Estratégia liberal venceu universalmente.",
        B: "Estratégia restritiva venceu universalmente.",
        C: "Não houve superioridade de mortalidade universal; fase e fenótipo devem orientar.",
        D: "Vasopressores devem ser evitados nas primeiras 24 horas.",
        E: "Fluidos não têm papel na ressuscitação."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. CLOVERS não mostrou superioridade liberal.",
        B: "Incorreta. Nenhum ensaio mostrou vitória universal restritiva.",
        C: "Correta. Resultados neutros pedem individualização.",
        D: "Incorreta. Vasopressor precoce pode evitar sobrecarga e hipotensão.",
        E: "Incorreta. Volume permanece indicado em pacientes selecionados."
      },
      synthesis: "Trials neutros refinam a pergunta: para quem, quando e até onde?",
      pearl: "🍀 CLOVERS + CLASSIC: evite a religião do fluido.",
      sourceRefs: ["CLOVERS", "CLASSIC", "SSC2026"]
    },
    {
      id: "TEMI-SEPSE-007",
      block: "SEPSE",
      difficulty: "Difícil",
      tags: ["ANDROMEDA", "TEC", "lactato"],
      stem: "No ANDROMEDA-SHOCK, estratégia guiada por tempo de enchimento capilar comparada à guiada por lactato:",
      options: {
        A: "Reduziu significativamente mortalidade em 28 dias no teste primário.",
        B: "Não atingiu significância para mortalidade, mas associou-se a menos disfunção orgânica.",
        C: "Foi claramente inferior em todos os desfechos.",
        D: "Eliminou utilidade do lactato.",
        E: "Usou apenas pressão arterial como alvo."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. P foi 0,06 no desfecho primário.",
        B: "Correta. Menor SOFA em 72 horas foi achado secundário.",
        C: "Incorreta. Não houve inferioridade global.",
        D: "Incorreta. Lactato continua marcador útil e contextual.",
        E: "Incorreta. O comparador era estratégia guiada por lactato."
      },
      synthesis: "TEC é barato, repetível e útil, mas não deve ser único alvo.",
      pearl: "🖐️ Veja a pele antes de perseguir o número do laboratório.",
      sourceRefs: ["ANDROMEDA", "SSC2026"]
    },
    {
      id: "TEMI-SEPSE-008",
      block: "SEPSE",
      difficulty: "Difícil",
      tags: ["corticoide", "ADRENAL", "APROCCHSS"],
      stem: "Qual afirmação integra adequadamente ADRENAL e APROCCHSS?",
      options: {
        A: "Ambos provaram exatamente o mesmo regime e desfecho.",
        B: "ADRENAL não reduziu mortalidade em 90 dias; APROCCHSS mostrou redução com hidrocortisona mais fludrocortisona.",
        C: "Corticoides nunca aceleram reversão do choque.",
        D: "Fludrocortisona é obrigatória em toda sepse sem choque.",
        E: "Os ensaios tornam desnecessário considerar efeitos adversos."
      },
      answer: "B",
      rationales: {
        A: "Incorreta. Regimes e desenhos foram diferentes.",
        B: "Correta. Resume a principal tensão entre os ensaios.",
        C: "Incorreta. Resolução do choque foi acelerada.",
        D: "Incorreta. População era choque séptico, não toda sepse.",
        E: "Incorreta. Hiperglicemia, fraqueza e infecção devem ser considerados."
      },
      synthesis: "Diretriz transforma evidência heterogênea em recomendação contextual.",
      pearl: "🧪 ADRENAL e APROCCHSS: mesmo tema, receitas e resultados diferentes.",
      sourceRefs: ["SSC2026"]
    },
    {
      id: "TEMI-SEPSE-009",
      block: "SEPSE",
      difficulty: "Difícil",
      tags: ["LOVIT", "VITAMINS", "vitamina C"],
      stem: "Qual conclusão sobre vitamina C intravenosa rotineira no choque séptico é sustentada por LOVIT/VITAMINS?",
      options: {
        A: "Reduz mortalidade de forma inequívoca.",
        B: "A combinação acelera sempre a retirada de vasopressor.",
        C: "Não há suporte para uso rotineiro; LOVIT levantou sinal de dano no desfecho composto.",
        D: "Substitui antimicrobianos.",
        E: "É recomendada para todo paciente com lactato alto."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. Benefício de mortalidade não foi demonstrado.",
        B: "Incorreta. VITAMINS não melhorou tempo vivo e livre de vasopressor.",
        C: "Correta. A evidência afasta rotina e exige cautela.",
        D: "Incorreta. Não trata a infecção ou o foco.",
        E: "Incorreta. Lactato isolado não indica vitamina C."
      },
      synthesis: "Plausibilidade biológica não substitui ensaio randomizado.",
      pearl: "🍊 Na sepse, vitamina C não é atalho para o bundle.",
      sourceRefs: ["LOVIT", "VITAMINS", "SSC2026"]
    },
    {
      id: "TEMI-SEPSE-010",
      block: "SEPSE",
      difficulty: "Médio",
      tags: ["qSOFA", "triagem", "descalonamento"],
      stem: "Qual uso do qSOFA é mais adequado?",
      options: {
        A: "Definir sepse sozinho.",
        B: "Excluir sepse quando menor que 2.",
        C: "Sinalizar risco à beira-leito, sem substituir triagem mais sensível ou avaliação completa.",
        D: "Decidir antibiótico e foco sem exame.",
        E: "Substituir SOFA e julgamento clínico."
      },
      answer: "C",
      rationales: {
        A: "Incorreta. qSOFA não é definição diagnóstica.",
        B: "Incorreta. Baixa sensibilidade impede exclusão.",
        C: "Correta. É alerta prognóstico simples e contextual.",
        D: "Incorreta. Decisão exige probabilidade, foco e gravidade.",
        E: "Incorreta. Não substitui avaliação de disfunção orgânica."
      },
      synthesis: "Sepse exige reavaliação contínua e suspensão de antimicrobiano quando outra causa se torna convincente.",
      pearl: "🚩 qSOFA alerta; não absolve nem condena.",
      sourceRefs: ["SSC2026"]
    }
  ]
};
