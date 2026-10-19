// Síntese educacional autoral para adultos. Fontes conferidas em 18/10/2026.
// Prévia: a conferência documental não substitui a revisão médica formal.
export const SPECIALTY_SOURCES = {
  idsaVertebral: {
    title: 'IDSA 2015 · osteomielite vertebral nativa em adultos',
    url: 'https://www.idsociety.org/practice-guideline/vertebral-osteomyelitis/',
    year: 2015,
    scope: 'Diretriz de investigação, diferenciais e urgências da infecção vertebral nativa. Seus regimes para osteomielite bacteriana não são esquemas para TB; não cobre infecção de implantes.'
  },
  msTB: {
    title: 'Ministério da Saúde · Manual de controle da tuberculose',
    url: 'https://www.gov.br/saude/pt-br/assuntos/brasil-saudavel/tuberculose/manual-de-recomendacoes-e-controle-da-ttuberculose-no-brasil-2a-ed',
    year: 2019,
    scope: '2ª edição atualizada, disponibilizada pelo MS em 2026. TB óssea/vertebral e confirmação por material do sítio acometido; páginas 51 e 71 do PDF. A data da página não transforma o manual em edição 2026.'
  },
  whoDiagnosis: {
    title: 'WHO 2025 · manual operacional de diagnóstico, módulo 3',
    url: 'https://tbksp.who.int/sites/default/files/2025-08/9789240110991-eng.pdf',
    year: 2025,
    scope: 'Manual operacional: testes e recomendações por sítio/amostra. A recomendação forte de NAAT extrapulmonar lista amostras específicas e não inclui tecido vertebral; não presumir validação universal.'
  },
  idsaTB: {
    title: 'ATS/CDC/IDSA 2016 · TB óssea, articular e vertebral',
    url: 'https://www.idsociety.org/practice-guideline/treatment-of-drug-susceptible-tb/',
    year: 2016,
    scope: 'Seção específica de TB vertebral: tratamento clínico dos casos sem complicações e avaliação cirúrgica em compressão, instabilidade ou resposta inadequada. Não transporta regimes abreviados de TB pulmonar para Pott.'
  },
  acrEular: {
    title: 'ACR/EULAR · critérios de classificação IgG4 de 2019',
    url: 'https://rheumatology.org/api/asset/bltfeda178976f1ad2a',
    year: 2020,
    scope: 'Critérios de 2019, publicados em 2020: classificação para pesquisa, com exclusões e domínios ponderados. O próprio documento esclarece que não estabelecem o diagnóstico clínico.'
  },
  rcd2020: {
    title: 'Grupo MHLW/Japão · critérios diagnósticos revisados IgG4 de 2020',
    url: 'https://igg4.jp/wp-content/uploads/2021/11/201228.pdf',
    year: 2021,
    scope: 'RCD 2020, publicado em 2021: integração clínico-radiológica, sorológica e patológica; exclusão de mimetizadores. Não recomenda teste terapêutico com corticoide.'
  },
  pathology: {
    title: 'Consenso internacional · anatomopatologia da doença relacionada à IgG4',
    url: 'https://www.nature.com/articles/modpathol201272',
    year: 2012,
    scope: 'Consenso primário: morfologia e correlação clinicopatológica são centrais; quantificação de plasmócitos IgG4+ é complementar e depende do órgão e da amostra.'
  },
  ophthalmic2024: {
    title: 'Grupo japonês · critérios orbitários IgG4 revisados em 2023',
    url: 'https://link.springer.com/article/10.1007/s10384-024-01072-4',
    year: 2024,
    scope: 'Critérios de órgão publicados em 2024: neuropatia óptica, ameaça visual e distinção de linfoma. Não são critérios gerais para todos os órgãos.'
  },
  vascular2024: {
    title: 'Circulation Journal 2024 · doença cardiovascular/retroperitoneal IgG4',
    url: 'https://www.jstage.jst.go.jp/article/circj/88/10/88_CJ-24-0026/_article',
    year: 2024,
    scope: 'Estudo primário de validação e proposta de critérios de órgão revisados em 2023. População japonesa; não substituir avaliação vascular/renal nem generalizar seu desempenho a toda doença IgG4.'
  },
  orbitalMimics2025: {
    title: 'J Clin Pathol 2025 · doença orbitária IgG4 e seus mimetizadores',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39160060/',
    year: 2025,
    scope: 'Estudo clinicopatológico primário, 37 pacientes: elevação sérica e plasmócitos IgG4+ também ocorreram em mimetizadores. Evidência de uma série orbitária, sem estimativa universal de desempenho.'
  }
};

const preview = 'Prévia educacional — revisão médica formal pendente';

export const SPECIALTY_SECTIONS = [
  {
    id: 'pott',
    title: 'Mal de Pott',
    kicker: 'Coluna · mecanismo, etiologia e função neurológica',
    summary: 'TB vertebral pode causar destruição óssea e compressão neural. Primeiro reconheça a emergência; depois conecte imagem, material do sítio e diferenciais.',
    clinicalStatus: preview,
    redFlags: [
      'Fraqueza nova/progressiva, perda sensitiva, alteração da marcha ou disfunção urinária/intestinal: avaliação urgente por possível compressão medular ou da cauda equina.',
      'Dor vertebral com deformidade progressiva ou suspeita de instabilidade: avaliação especializada imediata, com proteção da coluna conforme a equipe.',
      'Sepse, instabilidade hemodinâmica ou déficit neurológico progressivo: não atrasar intervenção e terapia empírica indicadas para aguardar biópsia.',
      'Coleção epidural ou compressão na imagem: correlacionar imediatamente com exame neurológico e acionar a equipe de coluna.'
    ],
    steps: [
      {
        id: 'pott-01', title: 'Primeiro: há ameaça neural?',
        signal: 'Dor vertebral com fraqueza, alteração sensitiva ou esfincteriana muda a prioridade.',
        mechanism: 'Destruição, deformidade e extensão epidural podem comprometer estruturas neurais.',
        decision: 'Documente o exame neurológico, obtenha RM urgente e acione avaliação de coluna/neurocirurgia conforme disponibilidade.',
        pitfall: 'Na sepse ou deterioração neurológica, não espere confirmação etiológica para a resposta urgente.',
        sourceIds: ['idsaVertebral', 'idsaTB']
      },
      {
        id: 'pott-02', title: 'Transformar dor em hipótese',
        signal: 'Dor persistente localizada, sensibilidade vertebral e sintomas constitucionais sustentam investigação.',
        mechanism: 'A TB pode atingir a coluna por disseminação; a apresentação pode ser insidiosa.',
        decision: 'Revise exposição, TB prévia, imunossupressão e outros sítios; procure também causas bacterianas e neoplásicas.',
        pitfall: 'A ausência de febre ou de doença pulmonar evidente não afasta Pott.',
        sourceIds: ['msTB', 'idsaVertebral']
      },
      {
        id: 'pott-03', title: 'RM: extensão antes do rótulo',
        signal: 'Lesão vertebral, coleção paravertebral ou extensão epidural exige mapear o comprometimento.',
        mechanism: 'O dano pode envolver corpos vertebrais, discos e tecidos adjacentes.',
        decision: 'Use RM para extensão neural/tecidual; complemente a anatomia óssea e a avaliação de estabilidade quando indicado.',
        pitfall: 'Padrão radiológico sugestivo não identifica sozinho o agente nem exclui neoplasia.',
        sourceIds: ['idsaVertebral', 'msTB']
      },
      {
        id: 'pott-04', title: 'Obter material que responda',
        signal: 'Etiologia incerta pede material representativo do foco vertebral ou coleção acessível.',
        mechanism: 'Histologia e microbiologia respondem perguntas diferentes e complementares.',
        decision: 'Planeje com a equipe biópsia guiada ou cirúrgica e amostras para histologia, micobactérias e demais agentes plausíveis.',
        pitfall: 'Se clinicamente estável, priorize amostragem antes de terapia empírica quando viável; urgências são exceção.',
        sourceIds: ['msTB', 'idsaVertebral']
      },
      {
        id: 'pott-05', title: 'Interpretar microbiologia em conjunto',
        signal: 'TRM/NAAT, cultura e histologia podem ser discordantes na TB extrapulmonar.',
        mechanism: 'Carga bacilar e qualidade da amostra influenciam o rendimento.',
        decision: 'Combine cultura/sensibilidade e histologia; discuta TRM no tecido conforme validação laboratorial. Se a suspeita persiste, reavalie a amostragem.',
        pitfall: 'Teste negativo isolado não exclui TB; granuloma isolado não prova sua etiologia. Não extrapole validação entre amostras.',
        sourceIds: ['whoDiagnosis', 'msTB', 'idsaVertebral']
      },
      {
        id: 'pott-06', title: 'Confirmar e acompanhar função',
        signal: 'TB vertebral confirmada requer plano conjunto de infectologia, referência TB e equipe de coluna.',
        mechanism: 'Controlar o bacilo não corrige automaticamente compressão ou instabilidade.',
        decision: 'Individualize tratamento e seguimento neurológico/funcional; reavalie cirurgia diante de compressão, instabilidade ou evolução inadequada.',
        pitfall: 'Não aplicar regime pulmonar abreviado automaticamente; corticoide não é rotina na TB vertebral isolada.',
        sourceIds: ['idsaTB', 'msTB']
      }
    ],
    differentials: [
      {
        name: 'Espondilodiscite piogênica',
        clues: 'Bacteremia, procedimento recente ou foco infeccioso podem orientar.',
        discriminator: 'Hemoculturas e cultura do foco; integrar a RM ao contexto.',
        caution: 'Evolução lenta também ocorre; duração dos sintomas não separa os agentes.',
        sourceIds: ['idsaVertebral']
      },
      {
        name: 'Metástase, mieloma ou linfoma',
        clues: 'Lesão destrutiva, massa ou doença oncológica prévia.',
        discriminator: 'Histopatologia representativa, com estudo complementar dirigido.',
        caution: 'TB inicial pode simular neoplasia; imagem sugestiva não substitui tecido.',
        sourceIds: ['idsaVertebral']
      },
      {
        name: 'Espondilite por Brucella',
        clues: 'Exposição animal, ocupacional ou alimentar relevante.',
        discriminator: 'Sorologia/culturas dirigidas em contexto epidemiológico compatível.',
        caution: 'Não presumir TB por granuloma ou cronicidade.',
        sourceIds: ['idsaVertebral']
      },
      {
        name: 'Osteomielite fúngica',
        clues: 'Imunossupressão ou exposição endêmica favorecem investigação dirigida.',
        discriminator: 'Histologia e cultura fúngica do foco, conforme o hospedeiro.',
        caution: 'Granulomas e lesões vertebrais podem compartilhar aparência com TB.',
        sourceIds: ['idsaVertebral', 'msTB']
      },
      {
        name: 'Fratura vertebral osteoporótica ou patológica',
        clues: 'Trauma, fragilidade óssea ou colapso vertebral.',
        discriminator: 'Imagem e história de fragilidade; investigar causa secundária se houver sinais atípicos.',
        caution: 'Colapso não define a causa e pode coexistir com infecção ou tumor.',
        sourceIds: ['idsaVertebral']
      },
      {
        name: 'Doença degenerativa/discal',
        clues: 'Alterações de platôs/discos podem imitar infecção.',
        discriminator: 'Correlacionar padrão da RM, evolução e sinais clínico-laboratoriais.',
        caution: 'Não atribuir déficit novo ou sintomas sistêmicos apenas à degeneração.',
        sourceIds: ['idsaVertebral']
      }
    ]
  },
  {
    id: 'igg4',
    title: 'Doença relacionada à IgG4',
    kicker: 'Multissistêmica · reconhecer, comprovar, excluir mimetizadores',
    summary: 'O diagnóstico integra órgão, imagem, laboratório e anatomopatologia. IgG4 sérica elevada ou imunocoloração positiva, isoladamente, não estabelecem a doença.',
    clinicalStatus: preview,
    redFlags: [
      'Perda visual, alteração de visão de cores ou sinais de compressão orbitária: avaliação oftalmológica urgente por ameaça ao nervo óptico.',
      'Hidronefrose, oligúria ou piora renal em doença retroperitoneal: avaliar obstrução e função renal com urgência.',
      'Dor torácica/abdominal súbita, instabilidade ou suspeita de complicação de aorta: atendimento emergencial.',
      'Icterícia obstrutiva com febre ou deterioração sistêmica: investigar complicação biliar/infecciosa e obstrução sem aguardar a conclusão do treino.',
      'Febre alta, inflamação muito intensa, massa rapidamente progressiva ou suspeita de câncer: priorizar exclusão de infecção e neoplasia antes de imunossupressão.'
    ],
    steps: [
      {
        id: 'igg4-01', title: 'Identificar órgão e risco',
        signal: 'Aumento glandular, massa pancreática, lesão orbitária ou fibrose retroperitoneal podem motivar a hipótese.',
        mechanism: 'Inflamação e fibrose podem formar massas e comprometer a função de diferentes órgãos.',
        decision: 'Mapeie órgãos acometidos e ameaça funcional; visão, rim e grandes vasos mudam a urgência.',
        pitfall: 'Massa é uma apresentação, não um diagnóstico de IgG4.',
        sourceIds: ['rcd2020', 'ophthalmic2024', 'vascular2024']
      },
      {
        id: 'igg4-02', title: 'Soro: apoio, não veredito',
        signal: 'IgG4 sérica elevada aumenta a atenção quando o fenótipo é compatível.',
        mechanism: 'Elevação também ocorre em mimetizadores; casos de IgG4 podem não ter elevação.',
        decision: 'Interprete junto à clínica, imagem e exames dirigidos ao órgão; investigue alternativas.',
        pitfall: 'Nem IgG4 sérica isolada confirma, nem resultado normal exclui a doença.',
        sourceIds: ['rcd2020', 'orbitalMimics2025']
      },
      {
        id: 'igg4-03', title: 'Tecido: arquitetura e contexto',
        signal: 'Lesão acessível ou dúvida etiológica relevante favorece biópsia representativa planejada.',
        mechanism: 'Infiltrado linfoplasmocitário, fibrose estoriforme e flebite obliterante são padrões centrais, variáveis por órgão.',
        decision: 'Solicite correlação clinicopatológica e quantificação IgG4+/IgG conforme sítio e qualidade da amostra.',
        pitfall: 'Plasmócitos IgG4+ ou uma razão elevada sem morfologia/contexto não bastam; amostra pequena pode ser inconclusiva.',
        sourceIds: ['pathology', 'rcd2020', 'orbitalMimics2025']
      },
      {
        id: 'igg4-04', title: 'Excluir antes de imunossuprimir',
        signal: 'Infecção, linfoma e câncer podem reproduzir massas e alterações laboratoriais.',
        mechanism: 'Esses mimetizadores exigem condutas distintas; imunossupressão pode agravar infecção e atrasar diagnóstico.',
        decision: 'Dirija histologia, microbiologia e investigação oncológica ao órgão, exposição e hospedeiro.',
        pitfall: 'Não usar teste terapêutico com corticoide para estabelecer o diagnóstico.',
        sourceIds: ['rcd2020', 'pathology', 'orbitalMimics2025']
      },
      {
        id: 'igg4-05', title: 'Classificação não é diagnóstico',
        signal: 'Os critérios ACR/EULAR de 2019 organizam entrada, exclusões e domínios ponderados.',
        mechanism: 'Foram construídos para classificar populações de pesquisa com alta especificidade.',
        decision: 'Use como referência de estudo; o diagnóstico clínico requer integração especializada e critérios de órgão quando pertinentes.',
        pitfall: 'Não preencher a classificação não exclui doença clínica; preenchê-la não dispensa a investigação de mimetizadores.',
        sourceIds: ['acrEular', 'ophthalmic2024', 'vascular2024']
      },
      {
        id: 'igg4-06', title: 'Resolver discordâncias',
        signal: 'Clínica, imagem, soro e biópsia podem apontar em direções diferentes.',
        mechanism: 'Distribuição das lesões, fibrose e amostragem alteram a expressão dos achados.',
        decision: 'Discuta revisão da lâmina, melhor sítio de biópsia e alternativas com equipe multidisciplinar antes de fechar a hipótese.',
        pitfall: 'Resposta ao corticoide não prova IgG4; persistência ou progressão obriga reavaliar diagnóstico e complicações.',
        sourceIds: ['rcd2020', 'pathology', 'orbitalMimics2025']
      }
    ],
    differentials: [
      {
        name: 'Linfoma e outras proliferações linfoplasmocitárias',
        clues: 'Massa ou linfonodomegalia pode acompanhar plasmócitos IgG4+.',
        discriminator: 'Arquitetura tecidual, imunofenótipo e clonalidade quando indicados.',
        caution: 'IgG4+ no tecido e elevação sérica não excluem linfoma.',
        sourceIds: ['pathology', 'ophthalmic2024', 'orbitalMimics2025']
      },
      {
        name: 'Câncer pancreático, biliar ou de outro órgão',
        clues: 'Massa focal, obstrução ou progressão precisam de investigação oncológica.',
        discriminator: 'Imagem dirigida e amostragem adequada ao sítio, com revisão especializada.',
        caution: 'Não rotular massa como IgG4 apenas pela sorologia e não testar corticoide para diferenciá-la.',
        sourceIds: ['rcd2020', 'pathology']
      },
      {
        name: 'TB, micoses e outras infecções',
        clues: 'Exposição, imunossupressão, necrose ou febre orientam investigação.',
        discriminator: 'Microbiologia e histologia do sítio; integrar a epidemiologia.',
        caution: 'Excluir infecção antes de imunossupressão; granuloma isolado não define o agente.',
        sourceIds: ['rcd2020', 'acrEular', 'msTB']
      },
      {
        name: 'Síndrome de Sjögren',
        clues: 'Sintomas secos e acometimento salivar/lacrimal podem se sobrepor.',
        discriminator: 'Fenótipo clínico, autoanticorpos e histologia glandular apropriada.',
        caution: 'Aumento de glândula isolado não diferencia as doenças.',
        sourceIds: ['rcd2020', 'acrEular', 'pathology']
      },
      {
        name: 'Vasculites associadas a ANCA',
        clues: 'Padrão otorrinolaringológico, pulmonar ou renal pode suscitar a alternativa.',
        discriminator: 'ANCA e biópsia interpretados com fenótipo; procurar vasculite necrosante.',
        caution: 'Não fazer diagnóstico pela sorologia isolada; ameaça renal/pulmonar exige resposta urgente.',
        sourceIds: ['acrEular', 'rcd2020']
      },
      {
        name: 'Sarcoidose',
        clues: 'Doença torácica ou multissistêmica com inflamação granulomatosa.',
        discriminator: 'Correlacionar padrão de órgão, histologia e exclusão de infecção.',
        caution: 'Granulomas predominantes pedem reconsiderar IgG4; não provam sarcoidose sozinhos.',
        sourceIds: ['acrEular', 'rcd2020']
      },
      {
        name: 'Doença de Castleman multicêntrica',
        clues: 'Adenopatias e síndrome inflamatória sistêmica podem simular IgG4.',
        discriminator: 'Arquitetura linfonodal e investigação hematológica dirigida.',
        caution: 'Aumento de plasmócitos IgG4+ pode confundir; não concluir apenas pela contagem.',
        sourceIds: ['acrEular', 'rcd2020', 'pathology']
      },
      {
        name: 'Fibrose retroperitoneal secundária ou doença vascular alternativa',
        clues: 'Tecido periaórtico, obstrução ureteral ou alteração vascular.',
        discriminator: 'Avaliação vascular/renal, imagem e investigação etiológica dirigida.',
        caution: 'O padrão retroperitoneal isolado não atribui a causa à IgG4.',
        sourceIds: ['vascular2024', 'rcd2020']
      }
    ]
  }
];
