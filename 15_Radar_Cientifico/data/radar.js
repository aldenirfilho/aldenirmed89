"use strict";

window.ANTIGRAVITY_RADAR={
  schemaVersion:"radar-v1",
  editionId:"2026-07-25-alpha",
  editionDate:"2026-07-25",
  generatedAt:"2026-07-25T18:40:00-03:00",
  timezone:"America/Fortaleza",
  editorialNote:"Seleção inicial por impacto, aplicabilidade em UTI/Clínica, novidade e qualidade da fonte. Sínteses informativas; confirme detalhes no artigo e no protocolo local.",
  priorities:[
    "Reavaliar o uso rotineiro de bicarbonato no choque com acidose: o ensaio SODa-BIC reforça que corrigir o número do pH não equivale automaticamente a melhorar desfechos.",
    "Oxigênio pós-parada: o LOGICAL não demonstrou vantagem funcional da estratégia conservadora sobre a liberal; evitar tanto hiperóxia desnecessária quanto hipoxemia.",
    "IA clínica autônoma avançou em ambiente simulado, mas governança, validação prospectiva e supervisão humana continuam sendo barreiras centrais."
  ],
  scientific:[
    {
      id:"doi:10.1056/NEJMoa2600526",priority:1,date:"2026-06-12",kind:"Ensaio clínico randomizado",
      access:"semiaberto",topic:"Terapia intensiva",title:"SODa-BIC: bicarbonato na acidose metabólica com choque",
      source:"New England Journal of Medicine",url:"https://www.nejm.org/doi/10.1056/NEJMoa2600526",
      summary:"Ensaio pragmático, adaptativo e duplo-cego comparou bicarbonato e placebo em adultos com acidose metabólica recebendo vasopressor. A leitura prática é resistir ao tratamento automático do pH e manter o foco na causa, perfusão e desfechos clínicos.",
      why:"Tema recorrente de plantão, choque e prova TEMI.",caveat:"Subgrupos, estratégia de infusão e desfechos renais devem ser conferidos no texto completo antes de mudar protocolo."
    },
    {
      id:"doi:10.1056/NEJMoa2513814",priority:1,date:"2026-06-10",kind:"Ensaio clínico randomizado",
      access:"semiaberto",topic:"Pós-parada cardíaca",title:"LOGICAL: oxigênio conservador após parada cardíaca",
      source:"New England Journal of Medicine",url:"https://www.nejm.org/doi/full/10.1056/NEJMoa2513814",
      summary:"Em pacientes inconscientes ventilados após parada, a estratégia conservadora não melhorou a sobrevida com desfecho funcional favorável quando comparada à estratégia liberal.",
      why:"Ajuda a calibrar alvos de oxigênio após ROSC sem transformar uma hipótese fisiológica em dogma.",caveat:"Aplicar em conjunto com monitorização confiável, diretrizes de pós-parada e prevenção de hipoxemia."
    },
    {
      id:"doi:10.1001/jama.2026.2897",priority:1,date:"2026-03-17",kind:"Ensaio clínico randomizado",
      access:"semiaberto",topic:"Delirium",title:"R2D2-ICU: contenção física restritiva versus liberal",
      source:"JAMA",url:"https://jamanetwork.com/journals/jama/article-abstract/2846726",
      summary:"Em 405 adultos sob ventilação invasiva, reduzir o uso de contenção de punhos não aumentou os dias vivos sem coma ou delirium em 14 dias; eventos de segurança e resultados de longo prazo foram semelhantes.",
      why:"Traz evidência para uma prática frequente, ética e potencialmente traumática.",caveat:"Estudo aberto e com limitações de generalização; não autoriza contenção automática."
    },
    {
      id:"doi:10.1001/jama.2026.6025",priority:2,date:"2026-05-18",kind:"Ensaio clínico cluster crossover",
      access:"semiaberto",topic:"Cateter venoso central",title:"EDTA 4% para reduzir complicações de dispositivos venosos",
      source:"JAMA",url:"https://jamanetwork.com/journals/jama/article-abstract/2849321",
      summary:"Em 1.468 pacientes, o lock com EDTA tetrassódico 4% reduziu o desfecho composto de infecção, oclusão com necessidade de alteplase e retirada por oclusão: 13,1 versus 19,9 eventos por 1.000 cateter-dia.",
      why:"Potencial impacto em infecção, patência e uso de trombolítico em lúmens inativos.",caveat:"Exige análise de disponibilidade, segurança, custo e validação institucional."
    },
    {
      id:"doi:10.1038/s41586-026-10675-5",priority:1,date:"2026-06-17",kind:"Pesquisa translacional",
      access:"aberto",topic:"IA em saúde",title:"MIRA: agentes médicos autônomos em prontuário simulado",
      source:"Nature",url:"https://www.nature.com/articles/s41586-026-10675-5",
      summary:"Um agente operou fluxos completos em prontuário eletrônico controlado, coletando história, solicitando exames e propondo condutas em mais de 500 casos. O desempenho simulado foi promissor, mas não representa segurança comprovada no mundo real.",
      why:"Antecipação prática do futuro dos copilotos clínicos e dos riscos de automação.",caveat:"Ambiente sandbox, casos retrospectivos e ausência de validação assistencial prospectiva."
    },
    {
      id:"doi:10.1038/s41551-026-01728-1",priority:2,date:"2026-07-10",kind:"Revisão e perspectiva",
      access:"semiaberto",topic:"IA em saúde",title:"IA neuro-simbólica em medicina",
      source:"Nature Biomedical Engineering",url:"https://www.nature.com/articles/s41551-026-01728-1",
      summary:"A combinação entre aprendizagem estatística e conhecimento clínico explícito pode melhorar transparência, consistência e auditabilidade dos sistemas médicos de IA.",
      why:"Conecta modelos generativos a regras, ontologias e justificativas clínicas.",caveat:"É um roteiro conceitual; benefícios clínicos dependem de validação."
    },
    {
      id:"doi:10.1038/s41586-026-10764-5",priority:2,date:"2026-06-17",kind:"Avaliação clínica simulada",
      access:"aberto",topic:"IA em saúde",title:"IA conversacional para manejo longitudinal de doenças",
      source:"Nature",url:"https://www.nature.com/articles/s41586-026-10764-5",
      summary:"Sistema conversacional foi avaliado em cenários de múltiplas consultas e raciocínio terapêutico, incluindo medicação. O desenho virtual é útil, mas não equivale a efetividade em pacientes reais.",
      why:"Expande IA médica de diagnóstico pontual para acompanhamento e tratamento.",caveat:"Estudo simulado; supervisão médica e fontes atualizadas continuam indispensáveis."
    },
    {
      id:"pmid:42194378",priority:2,date:"2026-05-01",kind:"Revisão sistemática",
      access:"aberto",topic:"POCUS",title:"POCUS realizado por enfermagem em terapia intensiva",
      source:"PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42194378/",
      summary:"Revisão sistemática avaliou impacto clínico, procedimental e profissional do ultrassom realizado por enfermeiros em UTIs adultas, incluindo acesso vascular e tomada de decisão.",
      why:"POCUS é uma competência de equipe, não apenas uma ferramenta médica.",caveat:"Heterogeneidade de treinamento e de desfechos limita generalizações."
    },
    {
      id:"who:ai-governance-lisbon-2026",priority:2,date:"2026-07-15",kind:"Política e governança",
      access:"aberto",topic:"IA em saúde",title:"OMS: governar a IA em saúde antes que as lacunas se tornem irreversíveis",
      source:"WHO Europe",url:"https://www.who.int/europe/news/item/15-07-2026-who-brings-37-countries-together-in-lisbon-to-get-ai-governance-right-and-make-it-work-for-every-patient",
      summary:"Representantes de 37 países discutiram governança. A OMS destacou que quase dois terços dos países europeus já usam IA em diagnóstico, enquanto apenas 8% têm estratégia específica de IA em saúde.",
      why:"Adoção está avançando mais rápido que responsabilidade, regulação e infraestrutura.",caveat:"Dados regionais e declaração política; não medem eficácia clínica."
    },
    {
      id:"amib:temi-2026-edital",priority:1,date:"2026-03-02",kind:"Documento oficial",
      access:"aberto",topic:"TEMI",title:"Edital TEMI 2026: cronograma, requisitos e bibliografia",
      source:"AMIB",url:"https://d1xe7tfg0uwul9.cloudfront.net/amib-portal/wp-content/uploads/2026/03/18144931/Edital-TEMI-2026-Atualizado.pdf",
      summary:"O edital oficial descreve elegibilidade, análise curricular, conteúdo e etapas. A prova teórica e a prática estão previstas para novembro de 2026; documentos de pontuação têm prazo próprio.",
      why:"Documento central para planejamento do estudo e organização documental.",caveat:"O edital pode ser retificado; sempre conferir a versão oficial mais recente."
    }
  ],
  geopolitics:[
    {
      id:"ms:estrategia-nacional-saude-2026",priority:1,date:"2026-07-20",topic:"Brasil",
      title:"Lei institui Estratégia Nacional de Saúde do Complexo Econômico-Industrial",
      source:"Ministério da Saúde",url:"https://www.gov.br/saude/pt-br/assuntos/noticias",
      summary:"Nova estratégia nacional conecta capacidade produtiva, inovação e resiliência do SUS. Para o radar clínico, importa acompanhar efeitos sobre medicamentos, equipamentos e autonomia tecnológica."
    },
    {
      id:"ms:ai-health-lisbon-2026",priority:1,date:"2026-07-15",topic:"Brasil · IA",
      title:"Brasil participa de conferência da OMS sobre IA aplicada à saúde",
      source:"Ministério da Saúde",url:"https://www.gov.br/saude/pt-br/assuntos/noticias",
      summary:"A agenda reuniu 37 países para discutir ética, governança, cooperação e responsabilidade no uso de IA em sistemas de saúde."
    },
    {
      id:"ms:arboviroses-el-nino-2026",priority:1,date:"2026-07-22",topic:"Brasil · clima",
      title:"Alerta para aumento de arboviroses associado ao El Niño",
      source:"Ministério da Saúde",url:"https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-alerta-estados-e-municipios-sobre-possivel-aumento-de-arboviroses-no-pais-devido-ao-el-nino/",
      summary:"O alerta recomenda reforço de vigilância e preparação. A interface UTI inclui choque, disfunção orgânica, demanda sazonal e capacidade de resposta regional."
    },
    {
      id:"ms:pesquisas-politicas-sus-2026",priority:2,date:"2026-07-08",topic:"Brasil · pesquisa",
      title:"Chamada apoia pesquisas avaliativas de políticas do SUS",
      source:"Ministério da Saúde",url:"https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/chamada-publica-seleciona-pesquisas-avaliativas-de-politicas-de-saude",
      summary:"Chamada pública destina recursos a pesquisas capazes de produzir evidência para decisões e políticas do SUS, com prazo informado na página oficial."
    },
    {
      id:"sesa-ce:noticias-2026",priority:2,date:"2026-07-25",topic:"Ceará",
      title:"Canal oficial de notícias da Saúde do Ceará entra no radar",
      source:"SESA Ceará",url:"https://www.saude.ce.gov.br/principal-2-2-2-2/noticias/",
      summary:"Acompanhamento regional de vigilância, assistência, formação, concursos e organização da rede. Itens críticos para o Ceará ganham prioridade editorial."
    },
    {
      id:"mec:cnrm-2026",priority:2,date:"2026-05-04",topic:"Residência médica",
      title:"CNRM mantém canais oficiais para legislação e situações do médico-residente",
      source:"Ministério da Educação",url:"https://www.gov.br/mec/pt-br/residencia-medica/canais-de-atendimento",
      summary:"Página oficial reúne canais para legislação, SISCNRM, transferência, irregularidades e documentação de residência médica."
    }
  ],
  visuals:[
    {id:"acidose",file:"./assets/cards/01-acidose-bicarbonato.png",title:"Acidose não é apenas um número",caption:"Causa → perfusão → ventilação → eletrólitos → terapia de resgate.",source:"NEJM · SODa-BIC",date:"12 jun 2026",sourceUrl:"https://www.nejm.org/doi/10.1056/NEJMoa2600526"},
    {id:"oxigenio",file:"./assets/cards/02-oxigenio-pos-parada.png",title:"Oxigênio pós-parada: alvo, não excesso",caption:"Evite a falsa dicotomia entre hiperóxia e hipoxemia.",source:"NEJM · LOGICAL",date:"10 jun 2026",sourceUrl:"https://www.nejm.org/doi/full/10.1056/NEJMoa2513814"},
    {id:"delirium",file:"./assets/cards/03-delirium-contencao.png",title:"Contenção não trata delirium",caption:"Segurança, causas reversíveis, ABCDEF e reavaliação.",source:"JAMA · R2D2-ICU",date:"17 mar 2026",sourceUrl:"https://jamanetwork.com/journals/jama/article-abstract/2846726"},
    {id:"cateter",file:"./assets/cards/04-cateter-edta.png",title:"Cateter: patência + infecção",caption:"Lock, lúmen inativo, biofilme e desfechos por cateter-dia.",source:"JAMA · Ensaio EDTA 4%",date:"18 mai 2026",sourceUrl:"https://jamanetwork.com/journals/jama/article-abstract/2849321"},
    {id:"agentes",file:"./assets/cards/05-agentes-ia-clinica.png",title:"Agente clínico precisa de trilhos",caption:"Sandbox, supervisão, permissões, auditoria e parada segura.",source:"Nature · MIRA",date:"17 jun 2026",sourceUrl:"https://www.nature.com/articles/s41586-026-10675-5"},
    {id:"governanca",file:"./assets/cards/06-governanca-ia.png",title:"Adoção de IA > governança",caption:"O abismo entre usar, regular, responsabilizar e validar.",source:"OMS Europa",date:"15 jul 2026",sourceUrl:"https://www.who.int/europe/news/item/15-07-2026-who-brings-37-countries-together-in-lisbon-to-get-ai-governance-right-and-make-it-work-for-every-patient"},
    {id:"pocus",file:"./assets/cards/07-pocus-equipe.png",title:"POCUS é competência de equipe",caption:"Treino, protocolo, documentação e decisão compartilhada.",source:"PubMed · Revisão sistemática",date:"mai 2026",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/42194378/"},
    {id:"temi",file:"./assets/cards/08-temi-cronograma.png",title:"TEMI: missão por fases",caption:"Edital → documentos → mapa curricular → questões → prova prática.",source:"AMIB · Edital TEMI 2026",date:"mar 2026",sourceUrl:"https://d1xe7tfg0uwul9.cloudfront.net/amib-portal/wp-content/uploads/2026/03/18144931/Edital-TEMI-2026-Atualizado.pdf"},
    {id:"sus",file:"./assets/cards/09-sus-dados-tecnologia.png",title:"SUS, dados e soberania",caption:"Interoperabilidade, capacidade produtiva e decisão pública.",source:"Ministério da Saúde",date:"20 jul 2026",sourceUrl:"https://www.gov.br/saude/pt-br/assuntos/noticias"},
    {id:"clima",file:"./assets/cards/10-clima-arboviroses.png",title:"Clima vira demanda de UTI",caption:"El Niño → vetor → casos → choque → capacidade regional.",source:"Ministério da Saúde",date:"22 jul 2026",sourceUrl:"https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-alerta-estados-e-municipios-sobre-possivel-aumento-de-arboviroses-no-pais-devido-ao-el-nino/"}
  ],
  spotify:[
    {
      id:"deep-focus",title:"Deep focus study playlist 💻",mode:"Foco profundo",
      image:"https://image-cdn-ak.spotifycdn.com/image/ab67706c000097acee44a2a4b20099eadaa0e57e",
      url:"https://open.spotify.com/playlist/0oPyDVNdgcPFAWmOYSK7O1?utm_source=openai&utm_medium=chatgpt&go=1&nap_web=1&request_id=868e5af3-faac-49cf-9f0a-3d9da552e362&nl=spotify%3Anl%3ACAASEIaOWvP6rEnPnwo9naVS42IaGDk6MG9QeURWTmRnY1BGQVdtT1lTSzdPMSAAMAPgAzXoA%2BSkvtr5M%2FADIA%3D%3D&redirect_uri=com.openai.chat%3A%2F%2F"
    },
    {
      id:"dark-academia",title:"dark academia studying and reading instrumentals",mode:"Leitura densa",
      image:"https://image-cdn-ak.spotifycdn.com/image/ab67706c000097ac932313e5571ed8553403d7ad",
      url:"https://open.spotify.com/playlist/3MelsVnZV5g03wyiJsybHk?utm_source=openai&utm_medium=chatgpt&go=1&nap_web=1&request_id=2602d05f-ad56-4c8f-ba20-86c05ccfa1a5&nl=spotify%3Anl%3ACAASECYC0F%2BtVkyPuiCGwFzPoaUaGDk6M01lbHNWblpWNWcwM3d5aUpzeWJIayAAMAPgAzXoA%2Ba7uNr5M%2FADIA%3D%3D&redirect_uri=com.openai.chat%3A%2F%2F"
    },
    {
      id:"peaceful-piano",title:"Peaceful Piano — music to focus/study to",mode:"Recuperação cognitiva",
      image:"https://image-cdn-fa.spotifycdn.com/image/ab67706c0000bebb3a131f06c2865923a0f2ae01",
      url:"https://open.spotify.com/playlist/1u4F50HA53L3Jwxbnk9IeO?utm_source=openai&utm_medium=chatgpt&go=1&nap_web=1&request_id=868e5af3-faac-49cf-9f0a-3d9da552e362&nl=spotify%3Anl%3ACAASEIaOWvP6rEnPnwo9naVS42IaGDk6MXU0RjUwSEE1M0wzSnd4Ym5rOUllTyAAMAPgAzXoA%2BSkvtr5M%2FADIA%3D%3D&redirect_uri=com.openai.chat%3A%2F%2F"
    }
  ]
};
