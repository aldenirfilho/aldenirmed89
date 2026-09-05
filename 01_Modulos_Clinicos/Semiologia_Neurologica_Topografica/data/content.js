window.ALDENIR_NEURO_SEMIOLOGY = Object.freeze({
  version: "1.0.0-rc.1",
  updatedAt: "2026-09-05",
  aphasiaPatterns: [
    {
      id: "broca",
      name: "Padrão não fluente tipo Broca",
      fluency: "nao-fluente",
      comprehension: "preservada",
      repetition: "prejudicada",
      naming: "prejudicada",
      signature: "Fala laboriosa, curta e agramática; compreensão relativamente melhor que a expressão; repetição e nomeação alteradas.",
      topography: "Rede frontal inferior dominante, ínsula anterior e conexões perisilvianas; frequentemente território superior da ACM.",
      associates: "Pode coexistir com apraxia da fala e paresia de face/braço contralateral.",
      caveat: "Não equivale automaticamente a uma pequena lesão isolada na área de Broca. Fluência depende de uma rede frontal-subcortical mais ampla."
    },
    {
      id: "wernicke",
      name: "Padrão fluente tipo Wernicke",
      fluency: "fluente",
      comprehension: "prejudicada",
      repetition: "prejudicada",
      naming: "prejudicada",
      signature: "Fala fluente, porém com conteúdo pobre, parafasias ou neologismos; compreensão e repetição comprometidas.",
      topography: "Rede temporal posterior dominante e conexões temporoparietais/ventrais; não há um único centro anatômico obrigatório.",
      associates: "Pode acompanhar hemianopsia homônima contralateral; déficit motor pode ser discreto.",
      caveat: "O rótulo clássico é uma heurística. Compreensão semântica envolve rede bilateral e regiões temporais, parietais e frontais."
    },
    {
      id: "conducao",
      name: "Afasia de condução",
      fluency: "fluente",
      comprehension: "preservada",
      repetition: "prejudicada",
      naming: "prejudicada",
      signature: "Fala fluente com parafasias fonêmicas e tentativas de autocorreção; compreensão relativamente boa; repetição desproporcionalmente ruim.",
      topography: "Rede dorsal dominante: região supramarginal, temporal superior posterior, ínsula e substância branca perisilviana, incluindo componentes do fascículo arqueado.",
      associates: "A repetição de frases longas e pseudopalavras costuma revelar o déficit.",
      caveat: "Não atribua o quadro exclusivamente a uma ruptura pontual do fascículo arqueado; córtex e múltiplas conexões podem participar."
    },
    {
      id: "global",
      name: "Afasia global",
      fluency: "nao-fluente",
      comprehension: "prejudicada",
      repetition: "prejudicada",
      naming: "prejudicada",
      signature: "Produção verbal muito reduzida, compreensão, nomeação e repetição amplamente comprometidas.",
      topography: "Dano extenso da rede perisilviana dominante ou disfunção de rede ampla; comum em grandes lesões do território da ACM.",
      associates: "Hemiparesia, hemianestesia e desvio conjugado podem coexistir.",
      caveat: "Reavalie após estabilização: nível de consciência, delirium, sedação, hipoacusia e déficits motores da fala podem simular maior gravidade."
    },
    {
      id: "transcortical-motora",
      name: "Afasia transcortical motora",
      fluency: "nao-fluente",
      comprehension: "preservada",
      repetition: "preservada",
      naming: "prejudicada",
      signature: "Pouca iniciativa verbal e fala não fluente, com compreensão relativamente boa e repetição preservada.",
      topography: "Regiões frontais mediais/anterior-superiores à rede clássica, área motora suplementar ou zonas limítrofes anteriores dominantes.",
      associates: "Abulia, dificuldade de iniciar respostas e paresia predominante em membro inferior podem ocorrer.",
      caveat: "Diferencie de depressão, abulia, mutismo acinético, apraxia da fala e redução de consciência."
    },
    {
      id: "transcortical-sensorial",
      name: "Afasia transcortical sensorial",
      fluency: "fluente",
      comprehension: "prejudicada",
      repetition: "preservada",
      naming: "prejudicada",
      signature: "Fala fluente com compreensão e nomeação ruins, mas repetição surpreendentemente preservada; ecolalia pode ocorrer.",
      topography: "Junção temporoparieto-occipital dominante ou zonas limítrofes posteriores que isolam a rede perisilviana.",
      associates: "Alterações visuais associativas ou hemianopsia podem acompanhar.",
      caveat: "Preservar repetição não significa linguagem funcional preservada; teste compreensão em complexidade crescente."
    },
    {
      id: "transcortical-mista",
      name: "Afasia transcortical mista",
      fluency: "nao-fluente",
      comprehension: "prejudicada",
      repetition: "preservada",
      naming: "prejudicada",
      signature: "Expressão não fluente e compreensão ruim, com repetição relativamente preservada.",
      topography: "Isolamento da rede perisilviana por lesões extensas de zonas limítrofes ou conexões associativas dominantes.",
      associates: "Ecolalia e déficits neurológicos extensos podem estar presentes.",
      caveat: "É um padrão sindrômico raro; confirme que a repetição é genuína e não apenas automatismo."
    },
    {
      id: "anomica",
      name: "Afasia anômica",
      fluency: "fluente",
      comprehension: "preservada",
      repetition: "preservada",
      naming: "prejudicada",
      signature: "Fala fluente e compreensível, com pausas de busca, circunlóquios e dificuldade predominante para nomear.",
      topography: "Pouco localizadora: pode refletir lesões temporais, parietais, subcorticais, recuperação de outra afasia ou doença neurodegenerativa.",
      associates: "Teste nomeação por confrontação, descrição, pistas semânticas/fonêmicas e fala espontânea.",
      caveat: "Anomia isolada não autoriza inferir uma área única. Escolaridade, idioma, visão e familiaridade com o objeto importam."
    }
  ],
  localizationRules: [
    {
      id: "cortex",
      title: "Córtex / rede hemisférica",
      signal: "Afasia, negligência, apraxia, agnosia, crise focal, desvio do olhar ou perda sensitiva cortical.",
      checks: "Linguagem completa, campos visuais, extinção, praxis, gnosia, face-braço-perna e dominância hemisférica.",
      contradiction: "Déficit motor/sensitivo puro sem qualquer sinal cortical torna cápsula interna, tálamo ou tronco mais prováveis."
    },
    {
      id: "subcortex",
      title: "Subcórtex / cápsula interna / tálamo",
      signal: "Síndrome motora pura, sensitiva pura ou sensitivo-motora densa envolvendo face, braço e perna, sem sinal cortical convincente.",
      checks: "Procure disartria-mão inábil, ataxia-hemiparesia, campos visuais, linguagem e negligência.",
      contradiction: "Afasia inequívoca, negligência ou crise focal deslocam a hipótese para rede cortical."
    },
    {
      id: "brainstem",
      title: "Tronco encefálico",
      signal: "Déficit de par craniano ipsilateral com fraqueza/sensibilidade contralateral, diplopia, disfagia, Horner ou ataxia.",
      checks: "Pupilas, motilidade ocular, face, palato/voz, língua, longos tratos, coordenação e padrão respiratório.",
      contradiction: "Afasia não é explicada por tronco isolado; disartria e rebaixamento podem ser confundidos com afasia."
    },
    {
      id: "cerebellum",
      title: "Cerebelo / conexões cerebelares",
      signal: "Dismetria, decomposição, disdiadococinesia, tremor de intenção, ataxia axial ou marcha de base alargada.",
      checks: "Dedo-nariz, calcanhar-joelho, movimentos alternados, fala escandida, nistagmo, tronco e marcha.",
      contradiction: "Romberg positivo apenas ao fechar os olhos sugere aferência proprioceptiva/vestibular, não cerebelo puro."
    },
    {
      id: "cord",
      title: "Medula espinal",
      signal: "Nível sensitivo, sinais piramidais abaixo da lesão, déficit bilateral, dissociação sensitiva ou disfunção esfincteriana.",
      checks: "Defina nível, sacral sparing, tônus anal quando indicado, reflexos, plantar, marcha e dor vertebral.",
      contradiction: "Face ou funções corticais afetadas não são explicadas por lesão medular isolada."
    },
    {
      id: "root-plexus-nerve",
      title: "Raiz, plexo ou nervo periférico",
      signal: "Dor radicular/dermatomal, fraqueza miotômica e reflexo correspondente reduzido; ou déficit no território de nervo nomeado.",
      checks: "Compare dermátomos, miótomos e nervos; procure paravertebral, múltiplos nervos/raízes e sinais autonômicos.",
      contradiction: "Hiperreflexia, Babinski ou nível sensitivo apontam para sistema nervoso central."
    },
    {
      id: "nmj-muscle",
      title: "Junção neuromuscular ou músculo",
      signal: "Fraqueza fatigável ocular/bulbar sem perda sensitiva sugere junção; fraqueza proximal simétrica com sensibilidade preservada sugere músculo.",
      checks: "Fatigabilidade, ptose/diplopia, voz/deglutição, pescoço, padrão proximal-distal, reflexos, CK e testes eletrofisiológicos conforme contexto.",
      contradiction: "Perda sensitiva objetiva, nível medular ou sinais corticais exigem outra localização."
    }
  ],
  examChecklist: [
    { id: "safety", group: "Preparação", label: "Segurança, consentimento e contexto", detail: "Identificar lado dominante, idioma, óculos/aparelho auditivo, dor, trauma cervical e risco de queda; em quadro agudo, priorizar ABC, sinais vitais e glicemia." },
    { id: "observation", group: "Preparação", label: "Observação antes do toque", detail: "Nível de consciência, postura, movimentos espontâneos, assimetria, fala, respiração, marcha de entrada e interação com o ambiente." },
    { id: "mental", group: "Funções superiores", label: "Consciência, orientação e atenção", detail: "Descrever vigília; testar orientação contextual e atenção com sequência de meses inversa ou tarefa compatível com escolaridade." },
    { id: "memory", group: "Funções superiores", label: "Memória e função executiva", detail: "Registro e evocação tardia, memória remota contextual, sequência motora, abstração e planejamento quando indicados." },
    { id: "language", group: "Funções superiores", label: "Linguagem em seis eixos", detail: "Fala espontânea/fluência, compreensão, nomeação, repetição, leitura e escrita; separar afasia de disartria e apraxia da fala." },
    { id: "cortical", group: "Funções superiores", label: "Negligência, praxis e gnosia", detail: "Extinção visual/tátil, bissecção, comandos gestuais, reconhecimento de objetos e funções corticais sensitivas com sensibilidade primária intacta." },
    { id: "cn1", group: "Pares cranianos", label: "I — olfato quando indicado", detail: "Testar cada narina com odor não irritante apenas quando clinicamente relevante; não usar amônia." },
    { id: "cn2", group: "Pares cranianos", label: "II — visão e aferência pupilar", detail: "Acuidade de cada olho, cores quando indicado, campos por confrontação, fundo de olho e defeito pupilar aferente relativo." },
    { id: "cn346", group: "Pares cranianos", label: "III, IV e VI — pupilas e motilidade ocular", detail: "Ptose, tamanho/reatividade pupilar, posição primária, versões, sacadas, perseguição, diplopia e nistagmo; não provocar manobras vestibulares sem indicação e segurança cervical." },
    { id: "cn5", group: "Pares cranianos", label: "V — sensibilidade facial e mastigação", detail: "Comparar V1/V2/V3, masseter/temporal e abertura mandibular; reflexo corneano apenas quando indicado, com técnica segura." },
    { id: "cn7", group: "Pares cranianos", label: "VII — face completa", detail: "Observar repouso, elevar sobrancelhas, fechar olhos com força, mostrar dentes/sorrir e inflar bochechas; procurar sinais associados e proteger córnea se fechamento incompleto." },
    { id: "cn8", group: "Pares cranianos", label: "VIII — audição e sistema vestibular", detail: "Voz sussurrada/atrito de dedos, Rinne e Weber se necessário; nistagmo, skew e marcha conforme síndrome. HINTS exige treinamento e síndrome vestibular aguda contínua apropriada." },
    { id: "cn910", group: "Pares cranianos", label: "IX e X — voz, palato e deglutição", detail: "Qualidade vocal, tosse, elevação palatal e manejo de secreções; não oferecer água se risco de aspiração. Reflexo nauseoso isolado tem utilidade limitada." },
    { id: "cn11", group: "Pares cranianos", label: "XI — esternocleidomastoideo e trapézio", detail: "Rotação da cabeça e elevação dos ombros contra resistência, comparando lados." },
    { id: "cn12", group: "Pares cranianos", label: "XII — língua", detail: "Inspecionar em repouso por atrofia/fasciculações; protrusão, lateralização, força contra a bochecha e articulação." },
    { id: "motor-inspect", group: "Motor", label: "Trofismo e movimentos involuntários", detail: "Volume muscular, atrofia, fasciculações, tremor, mioclonia, coreia, distonia e distribuição." },
    { id: "drift-tone", group: "Motor", label: "Pronator drift e tônus", detail: "Braços estendidos com olhos fechados; mobilização passiva para espasticidade, rigidez ou hipotonia, respeitando dor e trauma." },
    { id: "power", group: "Motor", label: "Força segmentar MRC 0–5", detail: "Testar proximal e distal, comparar lados, registrar músculo/movimento e limitar interpretação se houver dor, compreensão ruim ou esforço variável." },
    { id: "reflexes", group: "Reflexos", label: "Reflexos profundos e clônus", detail: "Bicipital C5–6, braquiorradial C5–6, tricipital C7–8, patelar L3–4 e aquileu S1; graduar, comparar e usar reforço quando necessário." },
    { id: "plantar", group: "Reflexos", label: "Resposta plantar e sinais patológicos", detail: "Estimular borda lateral da planta e registrar flexora, extensora ou indiferente; Hoffman/clônus apenas no contexto do restante do exame." },
    { id: "sensory-primary", group: "Sensibilidade", label: "Modalidades primárias", detail: "Com olhos fechados: toque leve, dor/temperatura, vibração e posição; comparar distal-proximal, lados e mapear fronteiras sem sugerir a resposta." },
    { id: "sensory-map", group: "Sensibilidade", label: "Padrão e nível", detail: "Procurar hemicorpo, nível medular, dermátomo, nervo nomeado, luva-meia, sela e dissociação entre modalidades." },
    { id: "sensory-cortical", group: "Sensibilidade", label: "Função sensitiva cortical", detail: "Estereognosia, grafestesia, localização e extinção somente se modalidades primárias e compreensão forem suficientes." },
    { id: "coordination", group: "Coordenação", label: "Membros e movimentos alternados", detail: "Dedo-nariz, dedo-alvo, calcanhar-joelho, diadococinesia e tapping; interpretar após considerar fraqueza, dor e perda proprioceptiva." },
    { id: "stance-gait", group: "Marcha", label: "Estação, Romberg e marcha", detail: "Levantar, base, início, passos, giro e balanço dos braços; calcanhares, pontas e tandem se seguro; proteger ativamente contra queda." },
    { id: "meningeal", group: "Complementos", label: "Meningismo e coluna quando indicados", detail: "Rigidez nucal e sinais meníngeos têm sensibilidade limitada; evitar mobilização cervical se trauma não esclarecido e não atrasar investigação de suspeita de neuroinfecção." },
    { id: "autonomic", group: "Complementos", label: "Autonômico e esfíncteres", detail: "PA/FC posturais quando seguro, sudorese, retenção/incontinência, função intestinal/sexual e sensibilidade perineal conforme hipótese." },
    { id: "coma", group: "Paciente não responsivo", label: "Exame dirigido no coma", detail: "GCS/descrição, pupilas, córneo-palpebral, posição ocular, resposta motora e tosse; oculocefálico apenas com coluna cervical liberada e sem contraindicação." },
    { id: "synthesis", group: "Síntese", label: "Resumo sindrômico e topográfico", detail: "Uma frase: tempo + síndrome + lado + nível anatômico mais provável + achados a favor/contra + urgência e próximo teste confirmatório." }
  ],
  cases: [
    {
      id: "case-language",
      stem: "Início súbito. Fala não fluente e agramática, compreensão de ordens simples relativamente preservada, repetição ruim e paresia de face/braço direitos.",
      options: ["Rede frontal inferior dominante esquerda", "Cerebelo direito", "Medula cervical", "Nervo facial direito"],
      answer: 0,
      feedback: "Afasia não fluente mais déficit face-braço contralateral localiza uma rede cortical/perisilviana dominante esquerda; o rótulo Broca é sindrômico, não um ponto único."
    },
    {
      id: "case-conduction",
      stem: "Fala fluente com parafasias fonêmicas e autocorreções; compreensão boa; incapacidade desproporcional de repetir frases longas.",
      options: ["Rede dorsal perisilviana dominante", "Lobo occipital bilateral", "Junção neuromuscular", "Cone medular"],
      answer: 0,
      feedback: "O padrão é de afasia de condução e sugere disfunção da rede dorsal fonológica/supramarginal e conexões perisilvianas, não necessariamente apenas do fascículo arqueado."
    },
    {
      id: "case-crossed",
      stem: "Diplopia e paresia do VI nervo à esquerda, fraqueza e hiperreflexia em braço/perna direitos, sem afasia.",
      options: ["Ponte esquerda", "Córtex frontal direito", "Plexo braquial esquerdo", "Cerebelo direito"],
      answer: 0,
      feedback: "Par craniano ipsilateral e trato longo contralateral formam um padrão cruzado de tronco; o VI aponta para a ponte."
    },
    {
      id: "case-cord",
      stem: "Paraparesia com hiperreflexia, resposta plantar extensora bilateral, nível sensitivo no tronco e retenção urinária.",
      options: ["Medula espinal", "Cápsula interna", "Nervo fibular", "Área de Wernicke"],
      answer: 0,
      feedback: "Nível sensitivo, sinais piramidais bilaterais abaixo da lesão e disfunção autonômica localizam a medula e exigem investigação urgente de compressão."
    },
    {
      id: "case-root",
      stem: "Dor lombar irradiada para face lateral da perna/dorso do pé, fraqueza de dorsiflexão e extensão do hálux, reflexos restantes preservados.",
      options: ["Raiz L5", "Hemisfério dominante", "Nervo facial", "Trato espinotalâmico cervical"],
      answer: 0,
      feedback: "Dor radicular e fraqueza miotômica sugerem raiz L5; compare com território do nervo fibular e examine inversão do pé e músculos paravertebrais."
    },
    {
      id: "case-face",
      stem: "Fraqueza aguda de toda a hemiface esquerda, inclusive testa e fechamento ocular, acompanhada de diplopia e hemiparesia direita.",
      options: ["Ponte esquerda", "Córtex motor direito isolado", "Nervo facial esquerdo isolado", "Músculo facial bilateral"],
      answer: 0,
      feedback: "Uma paralisia facial nuclear/infranuclear ipsilateral pode parecer periférica, mas sinais cruzados e diplopia apontam para tronco encefálico, não Bell isolada."
    },
    {
      id: "case-visual",
      stem: "Perda do hemicampo visual direito em ambos os olhos, com pupilas reativas e sem perda visual monocular.",
      options: ["Via retroquiasmática esquerda", "Nervo óptico direito", "Quiasma lateral direito", "Retina nasal esquerda isolada"],
      answer: 0,
      feedback: "Defeito homônimo localiza-se atrás do quiasma e contralateral ao hemicampo perdido: trato, radiações ou córtex visual esquerdos."
    },
    {
      id: "case-nmj",
      stem: "Ptose e diplopia flutuantes, pior ao final do dia, com pupilas, sensibilidade e reflexos preservados.",
      options: ["Junção neuromuscular", "Nervo óptico", "Córtex parietal", "Medula torácica"],
      answer: 0,
      feedback: "Fraqueza ocular fatigável sem alteração sensitiva ou pupilar sugere transmissão neuromuscular; o padrão clínico orienta testes confirmatórios."
    }
  ],
  references: [
    { title: "NINDS — Neurological Diagnostic Tests and Procedures", organization: "National Institute of Neurological Disorders and Stroke", year: "consulta 2026", url: "https://www.ninds.nih.gov/health-information/disorders/neurological-diagnostic-tests-and-procedures", use: "Componentes do exame neurológico e papel da história/exames complementares." },
    { title: "Neurologic Exam", organization: "StatPearls / NCBI Bookshelf", year: "consulta 2026", url: "https://www.ncbi.nlm.nih.gov/books/NBK557589/", use: "Técnica sistemática de funções superiores, pares cranianos, motor, sensitivo, reflexos, coordenação e marcha." },
    { title: "How to Localize Neurologic Lesions by Physical Examination", organization: "StatPearls / NCBI Bookshelf", year: "atualização 2023", url: "https://www.ncbi.nlm.nih.gov/books/NBK493159/", use: "Princípios de localização e distinção entre neurônio motor superior/inferior." },
    { title: "Clinical Methods — The Neurologic System", organization: "NCBI Bookshelf", year: "1990", url: "https://www.ncbi.nlm.nih.gov/books/NBK1746/", use: "Fundamentos clássicos e sequência do exame à beira-leito." },
    { title: "ASHA Practice Portal — Aphasia", organization: "American Speech-Language-Hearing Association", year: "consulta 2026", url: "https://www.asha.org/practice-portal/clinical-topics/aphasia/", use: "Domínios de avaliação da linguagem e cautela com subtipos rígidos." },
    { title: "Anatomy of aphasia revisited", organization: "Fridriksson et al., Brain", year: "2018", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5837461/", use: "Mapeamento lesão-sintoma e redes dorsal/ventral da linguagem." },
    { title: "The Wernicke area: modern evidence and a reinterpretation", organization: "Binder, Neurology", year: "2015", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4691684/", use: "Limites do modelo de um único centro de compreensão." },
    { title: "Analysis of Upper Facial Weakness in Central Facial Palsy Following Acute Ischemic Stroke", organization: "Wongwandee e Hongdusit, Neurology International", year: "2025", url: "https://pubmed.ncbi.nlm.nih.gov/39852776/", use: "Ressalva moderna: envolvimento facial superior pode ocorrer em paresia central." },
    { title: "Facial Nerve Palsy", organization: "StatPearls / NCBI Bookshelf", year: "consulta 2026", url: "https://www.ncbi.nlm.nih.gov/books/NBK549815/", use: "Exame facial, padrões supranuclear/nuclear/periférico e sinais associados." },
    { title: "Neuroanatomy, Visual Pathway", organization: "StatPearls / NCBI Bookshelf", year: "consulta 2026", url: "https://www.ncbi.nlm.nih.gov/books/NBK553189/", use: "Localização pré-quiasmática, quiasmática e retroquiasmática." },
    { title: "2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke", organization: "American Heart Association / American Stroke Association", year: "2026", url: "https://www.ahajournals.org/doi/10.1161/STR.0000000000000513", use: "Avaliação inicial do AVC e limitações reconhecidas do NIHSS, especialmente circulação posterior." },
    { title: "Stroke and TIA in over 16s — diagnosis and initial management", organization: "NICE NG128", year: "consulta 2026", url: "https://www.nice.org.uk/guidance/ng128/chapter/recommendations", use: "Reconhecimento e encaminhamento imediato de déficit neurológico súbito." },
    { title: "Suspected neurological conditions: recognition and referral", organization: "NICE NG127", year: "atualização 2023", url: "https://www.nice.org.uk/guidance/ng127/chapter/Recommendations-for-adults-aged-over-16", use: "Red flags de fraqueza, cauda equina e condições neurológicas suspeitas." },
    { title: "Core curriculum guidelines for a required clinical neurology experience", organization: "American Academy of Neurology / Neurology", year: "2019", url: "https://www.neurology.org/doi/10.1212/WNL.0000000000007187", use: "Competências educacionais para exame e localização do córtex ao músculo." },
    { title: "Consensus Paper: Revisiting the Symptoms and Signs of Cerebellar Syndrome", organization: "Bodranghien et al., Cerebellum", year: "2016", url: "https://pubmed.ncbi.nlm.nih.gov/26105056/", use: "Exame cerebelar de postura, marcha, membros, fala e oculomotricidade." },
    { title: "International Standards for Neurological Classification of Spinal Cord Injury", organization: "ASIA / ISCoS", year: "revisão 2026", url: "https://asia-spinalinjury.org/isncsci-resources/", use: "Documentação padronizada de nível, força segmentar e preservação sacral na lesão medular traumática." },
    { title: "Diagnosis and management of acute neuromuscular weakness", organization: "Quak et al., Singapore Medical Journal", year: "2026", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12908901/", use: "Padrões periféricos e alerta de falência ventilatória neuromuscular iminente." }
  ]
});
