// Conteúdo educacional autoral para adultos. Conferência documental: 18/10/2026.
// A edição WHO 2026 foi identificada; recomendações específicas abaixo remetem
// aos textos efetivamente conferidos, com ano e população explicitados.
export const EXPANSION_SOURCES = {
  who2026: { title: 'WHO · TB: tratamento e cuidados, 2ª edição', url: 'https://www.who.int/publications/i/item/9789240125124', year: 2026, scope: 'Edição de 25/09/2026 identificada na página oficial. O PDF integral não foi conferido nesta síntese; não fundamenta, isoladamente, as recomendações específicas de corticoide.' },
  whoSteroids: { title: 'WHO 2025 · recomendações 4.1–4.2: corticoides na TB', url: 'https://tbksp.who.int/sites/default/files/2025-06/3332%20HANDBOOK%20Module%204%20210525%20ACCESSIBLE%20ELECTRONIC.pdf#page=20', year: 2025, scope: 'Manual operacional WHO, recomendações 4.1–4.2 (PDF p.20): meningite, recomendação forte; pericardite, uso possível com recomendação condicional e certeza muito baixa. Não confundir com conferência integral da edição 2026.' },
  whoDiagnosis: { title: 'WHO 2025 · diagnóstico da tuberculose', url: 'https://www.who.int/publications/i/item/9789240107984', year: 2025, scope: 'Módulo 3: testes moleculares rápidos, investigação de resistência e diagnóstico de formas pulmonares e extrapulmonares.' },
  whoDiagnosisHandbook: { title: 'WHO 2025 · manual operacional de diagnóstico', url: 'https://tbksp.who.int/sites/default/files/2025-08/9789240110991-eng.pdf', year: 2025, scope: 'Aplicação dos testes por amostra e sítio; teste molecular no líquor e limites dos resultados negativos em doença paucibacilar.' },
  msManual: { title: 'Ministério da Saúde · Manual de controle da TB', url: 'https://www.gov.br/saude/pt-br/assuntos/brasil-saudavel/tuberculose/manual-de-recomendacoes-e-controle-da-ttuberculose-no-brasil-2a-ed', year: 2019, scope: '2ª edição atualizada, ainda disponibilizada pelo MS: manifestações clínicas e imagem, especialmente páginas 48–53 e 65–69. Complementar com notas técnicas posteriores.' },
  msCritical: { title: 'Ministério da Saúde · TB no paciente crítico', url: 'https://www.gov.br/aids/pt-br/central-de-conteudo/notas-informativas/2025/nota_informativa_no-6_2025_cgtm_dathi_svsa_ms.pdf/@@download/file', year: 2025, scope: 'Nota Informativa 6/2025: TB na UTI, urgência diagnóstica, amostras, absorção, disfunção orgânica e tratamento especializado; não transcrever esquemas complexos para automedicação.' },
  cdcTB: { title: 'CDC · visão clínica da doença tuberculosa', url: 'https://www.cdc.gov/tb/hcp/clinical-overview/tuberculosis-disease.html', year: 2026, scope: 'Página viva consultada em 18/10/2026: doença pulmonar, disseminação, órgãos extrapulmonares e circunstâncias de transmissibilidade.' },
  cdcDiagnosis: { title: 'CDC · investigação e diagnóstico da TB', url: 'https://www.cdc.gov/tb/hcp/testing-diagnosis/index.html', year: 2025, scope: 'História, exame, imagem e microbiologia; testes de infecção não distinguem, sozinhos, infecção latente de doença ativa.' },
  cdcSymptoms: { title: 'CDC · manifestações por sítio da TB', url: 'https://www.cdc.gov/tb/signs-symptoms/index.html', year: 2025, scope: 'Manifestações pulmonares e extrapulmonares, incluindo hematúria renal, dor vertebral e cefaleia/confusão na meningite.' },
  cdcControl: { title: 'CDC · controle da TB em serviços de saúde', url: 'https://www.cdc.gov/tb-healthcare-settings/hcp/infection-control/', year: 2023, scope: 'Controles administrativos e ambientais, reconhecimento precoce e proteção respiratória para suspeita de TB transmissível.' },
  cdcRespirator: { title: 'CDC · TB 101: proteção respiratória', url: 'https://www.cdc.gov/tb/webcourses/tb101/page1796.html', year: 2026, scope: 'Material oficial consultado em 18/10/2026: respirador adequado ao profissional e controle de fonte no paciente; aplicar o protocolo institucional brasileiro.' },
  idsaTB: { title: 'ATS/CDC/IDSA · TB sensível: sítios e corticoides', url: 'https://www.idsociety.org/practice-guideline/treatment-of-drug-susceptible-tb/', year: 2016, scope: 'Recomendações ainda relevantes não substituídas pela atualização focada de regimes: meningite; ausência de uso rotineiro na pericardite e pleurite; complicações extrapulmonares.' },
  nihTB: { title: 'NIH · TB em adultos e adolescentes com HIV', url: 'https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/mycobacterium', year: 2026, scope: 'Página viva consultada em 18/10/2026. População com HIV: TB do SNC, divergência na pericardite e TB-IRIS. Seu esquema de corticoide do SNC não é idêntico ao da WHO 2025.' },
  wgoTB: { title: 'WGO · tuberculose do trato digestivo', url: 'https://www.worldgastroenterology.org/guidelines/digestive-tract-tuberculosis/digestive-tract-tuberculosis-portuguese', year: 2021, scope: 'Diretriz da sociedade científica: apresentações intestinais/peritoneais, diagnóstico diferencial com doença de Crohn e obtenção de material.' },
  cdcStrongyloides: { title: 'CDC · cuidado clínico da estrongiloidíase', url: 'https://www.cdc.gov/strongyloides/hcp/clinical-care/index.html', year: 2024, scope: 'Risco de hiperinfecção/disseminação sob corticoide; atenção a exposição endêmica e avaliação antes da imunossupressão quando viável.' },
  cffDiagnosis: { title: 'Cystic Fibrosis Foundation · diagnóstico de FC', url: 'https://www.cff.org/medical-professionals/cf-diagnosis-clinical-care-guidelines', year: 2017, scope: 'Diretriz diagnóstica revisada pela CFF em julho de 2025 sem necessidade de atualização; integrar clínica e evidência de disfunção do CFTR, inclusive no adulto.' },
  cffBiology: { title: 'Cystic Fibrosis Foundation · sobre fibrose cística', url: 'https://www.cff.org/intro-cf/about-cystic-fibrosis', year: 2026, scope: 'Página institucional consultada em 18/10/2026: CFTR, secreções e manifestações multissistêmicas.' },
  cffEmergencies: { title: 'Cystic Fibrosis Foundation · hemoptise e pneumotórax', url: 'https://www.cff.org/medical-professionals/pneumothorax-and-hemoptysis-clinical-care-guidelines', year: 2010, scope: 'Diretriz revista em julho de 2025. Recomendações específicas de FC; seus limiares de volume de hemoptise não são transportados automaticamente para TB.' },
  cirseHemoptysis: { title: 'CIRSE · boas práticas em hemoptise ameaçadora', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9117352/', year: 2022, scope: 'Documento de boas práticas da sociedade, não diretriz sistemática: hemoptise com comprometimento de via aérea, respiração ou circulação exige estabilização e controle especializado do sangramento.' },
  ersBronchiectasis: { title: 'ERS 2025 · bronquiectasias em adultos', url: 'https://publications.ersnet.org/content/erj/66/6/2501126', year: 2025, scope: 'Diagnóstico clínico-radiológico, investigação de causas e manejo individualizado; corticoide inalatório não é tratamento rotineiro sem outra indicação.' },
  ishamABPA: { title: 'ISHAM 2024 · aspergilose broncopulmonar alérgica', url: 'https://publications.ersnet.org/content/erj/63/4/2400061', year: 2024, scope: 'Consenso revisado: critérios combinados e tratamento de ABPA aguda; distinguir hipersensibilidade de invasão fúngica.' },
  idsaAspergillus: { title: 'IDSA · aspergilose invasiva', url: 'https://www.idsociety.org/practice-guideline/aspergillosis/', year: 2016, scope: 'Diretriz geral de diagnóstico/tratamento: hospedeiro, imagem, micologia e terapia precoce na suspeita forte. Atualização IDSA 2026 de prevenção em transplante sólido tem outro escopo.' },
  idsaHistoplasma: { title: 'IDSA 2025/2026 · histoplasmose por apresentação', url: 'https://www.idsociety.org/practice-guideline/histoplasmosis/', year: 2026, scope: 'Recomendações 2025 para nódulos e doença leve/moderada; consenso de 16/09/2026 para tratamento inicial da forma aguda pulmonar grave ou disseminada. O consenso não equivale a uma revisão integral de todas as apresentações.' },
  nihHistoplasma: { title: 'NIH · histoplasmose em pessoas com HIV', url: 'https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/histoplasmosis', year: 2026, scope: 'Página viva consultada em 18/10/2026: doença disseminada, antígenos e gravidade na imunossupressão por HIV.' },
  msPCM: { title: 'Ministério da Saúde · paracoccidioidomicose', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/p/pcm', year: 2026, scope: 'Página oficial consultada em 18/10/2026: exposição ambiental, manifestações pulmonares/mucosas e confirmação laboratorial.' },
  msCocci: { title: 'Ministério da Saúde · coccidioidomicose no Brasil', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/c/coccidioidomicose/situacao-epidemiologica', year: 2026, scope: 'Página oficial consultada em 18/10/2026: ocorrência no semiárido do Nordeste e exposição a poeira/solo; perguntar pela exposição, sem presumir história pessoal.' },
  nihCrypto: { title: 'NIH · criptococose em pessoas com HIV', url: 'https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/cryptococcosis', year: 2026, scope: 'Página viva consultada em 18/10/2026: investigar SNC/disseminação, controlar pressão intracraniana e evitar corticoide rotineiro na indução ou para hipertensão intracraniana.' },
  nihPCP: { title: 'NIH · pneumocistose em pessoas com HIV', url: 'https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/pneumocystis', year: 2026, scope: 'Critério de corticoide adjuvante em PCP associada ao HIV: PaO₂ em ar ambiente <70 mmHg OU gradiente A–a ≥35 mmHg, idealmente iniciado até 72 horas da terapia específica. Não generalizar para não HIV.' },
  idsaNTM: { title: 'ATS/ERS/ESCMID/IDSA · micobactérias não tuberculosas', url: 'https://www.idsociety.org/practice-guideline/nontuberculous-mycobacterial-ntm-diseases/', year: 2020, scope: 'Doença pulmonar por MNT em adultos: critérios clínicos, radiológicos e microbiológicos; isolamento isolado não equivale automaticamente a doença ou indicação terapêutica.' }
};

const pending = 'Prévia educacional — revisão médica formal pendente';

export const PULMONARY_SECTIONS = [
  {
    id: 'raras', title: 'Pulmão além do habitual', kicker: '10 conexões · hospedeiro, mecanismo e risco',
    summary: 'Doenças menos comuns podem imitar pneumonia ou tuberculose. Reconheça o contexto, procure confirmação e identifique a deterioração antes de escolher um tratamento.',
    clinicalStatus: pending,
    blocks: [
      {
        id: 'raras-01', title: 'Fibrose cística no adulto',
        signal: 'Bronquiectasias, infecções respiratórias recorrentes e manifestações extrapulmonares podem motivar investigação de fibrose cística mesmo na vida adulta.',
        mechanism: 'A disfunção do CFTR altera o transporte de sal e água, tornando secreções mais difíceis de eliminar.',
        decision: 'Encaminhe a investigação para integrar história, teste do suor e análise de CFTR quando indicada; uma imagem isolada não confirma FC.',
        pitfall: 'Nem toda bronquiectasia é FC. O diagnóstico exige compatibilidade clínica e evidência de disfunção do CFTR.',
        severity: 'Hemoptise importante, pneumotórax ou piora respiratória exigem avaliação urgente.',
        sourceIds: ['cffDiagnosis', 'cffBiology', 'cffEmergencies'], image: 'assets/expansao/raras-01.png',
        imageAlt: 'Ilustração conceitual de brônquio com secreção espessa e conexão ao transporte de íons.',
        caption: 'CFTR → secreção espessa → dificuldade de limpeza. A arte explica o mecanismo; não confirma o diagnóstico.'
      },
      {
        id: 'raras-02', title: 'Bronquiectasias: interromper o ciclo',
        signal: 'Tosse produtiva persistente e exacerbações recorrentes pedem correlação com dilatação brônquica na tomografia.',
        mechanism: 'Retenção de secreções, infecção, inflamação e dano estrutural reforçam um ciclo de lesão.',
        decision: 'Investigue a causa e organize higiene brônquica individualizada, microbiologia e manejo das exacerbações com a equipe.',
        pitfall: 'Corticoide inalatório não é rotina na bronquiectasia sem outra indicação, como asma; imagem e sintomas precisam ser interpretados juntos.',
        severity: 'Hemoptise relevante, hipoxemia ou deterioração rápida mudam a prioridade para atendimento urgente.',
        sourceIds: ['ersBronchiectasis'], image: 'assets/expansao/raras-02.png',
        imageAlt: 'Brônquios conceituais dilatados com secreção e inflamação local.',
        caption: 'Estrutura e depuração se conectam: tratar só a infecção deixa parte do ciclo ativa.'
      },
      {
        id: 'raras-03', title: 'ABPA: alergia não é invasão',
        signal: 'Asma, FC ou bronquiectasias com piora recorrente, tampões mucosos e sinais de sensibilização podem sugerir ABPA.',
        mechanism: 'A aspergilose broncopulmonar alérgica é uma resposta de hipersensibilidade ao fungo nas vias aéreas.',
        decision: 'Combine sensibilização, IgE, achados complementares e imagem; ABPA aguda pode exigir corticoide sistêmico ou antifúngico sob avaliação especializada.',
        pitfall: 'Cultura positiva para Aspergillus, sozinha, não estabelece ABPA. O raciocínio terapêutico difere da aspergilose invasiva.',
        severity: 'Obstrução acentuada, hipoxemia ou declínio respiratório requerem avaliação imediata.',
        sourceIds: ['ishamABPA'], image: 'assets/expansao/raras-03.png',
        imageAlt: 'Via aérea com tampão de muco e resposta imune ao Aspergillus, em representação didática.',
        caption: 'ABPA conecta fungo e hipersensibilidade; não representa necessariamente invasão do tecido.'
      },
      {
        id: 'raras-04', title: 'Aspergilose invasiva: olhar o hospedeiro',
        signal: 'Neutropenia, transplante ou imunossupressão com infiltrado pulmonar novo elevam a suspeita de aspergilose invasiva.',
        mechanism: 'A defesa comprometida permite invasão do tecido pelo fungo; corticoides podem ampliar esse risco.',
        decision: 'Integre risco, tomografia e investigação micológica; na suspeita forte, a terapia especializada não deve aguardar toda a confirmação.',
        pitfall: 'Nem isolamento respiratório prova invasão, nem um teste negativo isolado a exclui em todo contexto.',
        severity: 'Hipoxemia progressiva, hemoptise ou deterioração sistêmica exigem resposta urgente.',
        sourceIds: ['idsaAspergillus'], image: 'assets/expansao/raras-04.png',
        imageAlt: 'Representação de hifas alcançando tecido pulmonar em um hospedeiro vulnerável.',
        caption: 'Hospedeiro vulnerável + lesão compatível + micologia: a conexão importa mais que um achado solitário.'
      },
      {
        id: 'raras-05', title: 'Histoplasmose: nódulo ou disseminação?',
        signal: 'História epidemiológica e estado imune ajudam a interpretar nódulos pulmonares ou doença febril sistêmica.',
        mechanism: 'Histoplasma pode permanecer localizado; na imunossupressão avançada por HIV, a disseminação ganha importância.',
        decision: 'A investigação pode incluir antígeno e microbiologia conforme a apresentação. Um nódulo assintomático não implica antifúngico automático.',
        pitfall: 'Separe as recomendações para nódulos/doença leve do consenso IDSA de 2026 para terapia inicial da forma grave; não aplicar uma conduta única a todas as apresentações.',
        severity: 'Instabilidade, falência respiratória ou acometimento multiorgânico exigem manejo hospitalar especializado.',
        sourceIds: ['idsaHistoplasma', 'nihHistoplasma'], image: 'assets/expansao/raras-05.png',
        imageAlt: 'Pulmão e órgãos conectados simbolizando a possibilidade de disseminação de Histoplasma.',
        caption: 'A mesma etiologia pode produzir doença localizada ou disseminada: o estado imune muda a leitura.'
      },
      {
        id: 'raras-06', title: 'Paracoccidioidomicose: perguntar pela exposição',
        signal: 'Exposição ao solo, trabalho rural e sintomas pulmonares associados a lesões de mucosa merecem atenção.',
        mechanism: 'A infecção adquirida do ambiente pode comprometer pulmões e outros órgãos, com inflamação e sequelas.',
        decision: 'Investigue a epidemiologia e obtenha confirmação laboratorial; mantenha TB e outras micoses no diferencial.',
        pitfall: 'Nem toda síndrome consumptiva com alteração pulmonar é TB. Tratar pelo padrão visual pode atrasar a etiologia correta.',
        severity: 'Comprometimento respiratório importante ou doença sistêmica grave requer avaliação especializada urgente.',
        sourceIds: ['msPCM'], image: 'assets/expansao/raras-06.png',
        imageAlt: 'Conexão didática entre exposição ao solo, pulmão e lesão de mucosa na paracoccidioidomicose.',
        caption: 'Exposição ambiental e mucosas ajudam a ampliar o diagnóstico diferencial pulmonar.'
      },
      {
        id: 'raras-07', title: 'Criptococose: procurar o SNC',
        signal: 'Em pessoa com HIV e suspeita de criptococose pulmonar, cefaleia ou alteração mental exigem investigar acometimento do SNC.',
        mechanism: 'A doença pode disseminar-se; na meningite, a pressão intracraniana é uma complicação decisiva.',
        decision: 'Avalie disseminação e necessidade de investigação liquórica com segurança. Hipertensão intracraniana exige manejo específico por equipe habilitada.',
        pitfall: 'Corticoide não é rotina na indução nem tratamento da hipertensão intracraniana criptocócica; situações de IRIS são outra avaliação.',
        severity: 'Rebaixamento, alterações visuais, déficit focal ou piora neurológica são sinais de urgência.',
        sourceIds: ['nihCrypto'], image: 'assets/expansao/raras-07.png',
        imageAlt: 'Representação conceitual conectando pulmão, fungo encapsulado e sistema nervoso central.',
        caption: 'Pulmão → possível disseminação → SNC. Procurar complicações muda a prioridade clínica.'
      },
      {
        id: 'raras-08', title: 'Pneumocistose: medir a oxigenação',
        signal: 'Em pessoa com HIV, dispneia progressiva, tosse seca e hipoxemia podem sugerir pneumocistose, sem confirmar sua etiologia.',
        mechanism: 'O acometimento alveolar compromete a troca gasosa; a oxigenação ajuda a definir gravidade.',
        decision: 'Na PCP associada ao HIV, corticoide adjuvante é indicado se PaO₂ em ar ambiente <70 mmHg OU gradiente A–a ≥35 mmHg.',
        pitfall: 'O limiar é da diretriz para HIV. Não transferir automaticamente essa indicação para PCP sem HIV.',
        severity: 'Hipoxemia ou progressão rápida exigem avaliação imediata e terapia específica; no HIV, o adjuvante deve começar idealmente até 72 horas após o início da terapia específica.',
        sourceIds: ['nihPCP'], image: 'assets/expansao/raras-08.png',
        imageAlt: 'Alvéolos com comprometimento difuso e conexão visual à passagem de oxigênio.',
        caption: 'Na PCP, medir a troca gasosa é mais útil que estimar gravidade apenas pela imagem.'
      },
      {
        id: 'raras-09', title: 'MNT: isolamento não basta',
        signal: 'Bronquiectasias, sintomas crônicos e culturas com micobactérias não tuberculosas pedem integração clínica.',
        mechanism: 'MNT ambientais podem aparecer em amostras sem serem a causa da doença pulmonar.',
        decision: 'Verifique critérios clínicos, radiológicos e microbiológicos, identificando espécie e repetição pertinente de culturas.',
        pitfall: 'Um isolamento não determina tratamento; mesmo com critérios preenchidos, a decisão depende da progressão, risco e preferências.',
        severity: 'Cavitação e progressão sustentada justificam avaliação especializada prioritária.',
        sourceIds: ['idsaNTM'], image: 'assets/expansao/raras-09.png',
        imageAlt: 'Amostras respiratórias e brônquios conectados para representar a integração diagnóstica de MNT.',
        caption: 'Amostra + espécie + evolução + pulmão: não transformar qualquer cultura em diagnóstico.'
      },
      {
        id: 'raras-10', title: 'Imunossupressão: ampliar antes de simplificar',
        signal: 'Infiltrado pulmonar em pessoa imunossuprimida pode representar infecções distintas e apresentações sobrepostas.',
        mechanism: 'O tipo de deficiência imune altera o conjunto de patógenos prováveis e a resposta inflamatória.',
        decision: 'Reveja HIV, transplante, neutropenia e medicamentos; escolha amostras e testes orientados ao hospedeiro. No semiárido do Nordeste, exposição à poeira também orienta considerar coccidioidomicose.',
        pitfall: 'Antes de ampliar corticoide, reavalie infecção invasiva e exposição a Strongyloides; melhora inflamatória transitória não confirma etiologia.',
        severity: 'Deterioração respiratória, neurológica ou circulatória requer investigação e suporte em paralelo.',
        sourceIds: ['idsaAspergillus', 'nihTB', 'cdcStrongyloides', 'msCocci'], image: 'assets/expansao/raras-10.png',
        imageAlt: 'Pulmão central conectado a diferentes defesas imunes e possíveis agentes infecciosos.',
        caption: 'O hospedeiro organiza o diferencial: uma imagem semelhante pode exigir decisões diferentes.'
      }
    ]
  },
  {
    id: 'tb-pulmonar', title: 'Tuberculose pulmonar', kicker: 'Reconhecer · proteger · confirmar · tratar',
    summary: 'A suspeita de TB combina contexto e investigação microbiológica. Controle de transmissão e identificação de gravidade começam antes do resultado final.',
    clinicalStatus: pending,
    blocks: [
      {
        id: 'tb-pulmonar-01', title: 'Transmissão: o ar conecta pessoas',
        signal: 'Doença pulmonar ou laríngea pode transmitir TB pelo ar; infecção latente não transmite.',
        mechanism: 'Partículas infecciosas suspensas podem alcançar outra pessoa; ambientes e tempo de exposição influenciam o risco.',
        decision: 'Reconheça a suspeita cedo, organize controle de fonte, ventilação e proteção respiratória.',
        pitfall: 'Não esperar confirmação para iniciar medidas de controle quando há suspeita de TB transmissível.',
        severity: 'A proteção de contatos deve ocorrer junto ao atendimento de qualquer instabilidade do paciente.',
        sourceIds: ['cdcTB', 'cdcControl'], image: 'assets/expansao/tb-pulmonar-01.png',
        imageAlt: 'Partículas no ar conectando um pulmão a um ambiente ventilado, em esquema conceitual.',
        caption: 'Reconhecimento precoce e ambiente seguro interrompem a conexão de transmissão.'
      },
      {
        id: 'tb-pulmonar-02', title: 'Granuloma: contenção não é esterilização',
        signal: 'Granulomas são achados de resposta inflamatória; não identificam sozinhos a etiologia.',
        mechanism: 'Na TB, células imunes organizam-se ao redor do foco; pode haver necrose e progressão da lesão.',
        decision: 'Relacione histologia a microbiologia, imagem e história; procure confirmação e diagnósticos alternativos.',
        pitfall: 'Granuloma não equivale automaticamente a TB ativa, e teste de infecção não substitui avaliação de doença.',
        severity: 'Sinais sistêmicos ou neurológicos exigem procurar disseminação, além do achado localizado.',
        sourceIds: ['msManual', 'cdcDiagnosis', 'cdcTB'], image: 'assets/expansao/tb-pulmonar-02.png',
        imageAlt: 'Células imunes organizadas ao redor de um foco pulmonar, representando um granuloma.',
        caption: 'A organização imune ajuda a entender a lesão, mas não prova sua causa nem sua atividade.'
      },
      {
        id: 'tb-pulmonar-03', title: 'Cavitação: estrutura e transmissão',
        signal: 'Cavidade pulmonar em quadro compatível aumenta a suspeita de TB, mas tem outros diagnósticos diferenciais.',
        mechanism: 'Necrose e comunicação com a via aérea podem produzir uma cavidade e eliminação de bacilos.',
        decision: 'Combine amostras respiratórias, teste molecular, cultura e avaliação de resistência.',
        pitfall: 'Não diagnosticar pela cavidade isolada: micoses, neoplasia e outras infecções também podem cavitar.',
        severity: 'Hemoptise com ameaça respiratória ou circulatória é uma emergência.',
        sourceIds: ['msManual', 'whoDiagnosis', 'msCritical'], image: 'assets/expansao/tb-pulmonar-03.png',
        imageAlt: 'Corte didático de cavidade pulmonar comunicando-se com um brônquio.',
        caption: 'Cavidade → comunicação com a via aérea. O mecanismo ajuda, mas a etiologia precisa ser investigada.'
      },
      {
        id: 'tb-pulmonar-04', title: 'TRM, cultura e sensibilidade',
        signal: 'A suspeita clínica exige investigação bacteriológica apropriada, mesmo quando a apresentação é pouco típica.',
        mechanism: 'O teste molecular acelera a detecção; cultura e testes de sensibilidade acrescentam informação sobre o agente e resistência.',
        decision: 'Colete material adequado e interprete o resultado no contexto, usando os fluxos nacionais de diagnóstico.',
        pitfall: 'Teste negativo isolado não encerra toda suspeita; baciloscopia não fornece o mesmo perfil de resistência do teste molecular.',
        severity: 'No paciente crítico, colher material e iniciar cuidado necessário são tarefas paralelas.',
        sourceIds: ['whoDiagnosis', 'whoDiagnosisHandbook', 'msCritical'], image: 'assets/expansao/tb-pulmonar-04.png',
        imageAlt: 'Amostra de escarro ligada a plataformas conceituais de teste molecular e cultura.',
        caption: 'Rapidez e profundidade são complementares: TRM, cultura e sensibilidade respondem perguntas diferentes.'
      },
      {
        id: 'tb-pulmonar-05', title: 'Precauções: paciente e profissional',
        signal: 'Tosse e suspeita de TB transmissível pedem triagem e separação precoces no serviço.',
        mechanism: 'Controle de fonte, ambiente adequado e respirador reduzem oportunidades de transmissão aérea.',
        decision: 'Use o protocolo institucional: máscara cirúrgica no paciente para controle de fonte e PFF2/N95 adequada ao profissional.',
        pitfall: 'A máscara cirúrgica do profissional não substitui o respirador na precaução para aerossóis.',
        severity: 'Procedimentos geradores de aerossóis exigem planejamento da proteção e do ambiente.',
        sourceIds: ['cdcControl', 'cdcRespirator'], image: 'assets/expansao/tb-pulmonar-05.png',
        imageAlt: 'Paciente com controle de fonte e profissional com respirador, em ambiente de isolamento conceitual.',
        caption: 'Controle de fonte e proteção do profissional têm funções complementares.'
      },
      {
        id: 'tb-pulmonar-06', title: 'Tratamento combinado: proteger a eficácia',
        signal: 'TB ativa requer um esquema combinado apropriado à sensibilidade, ao sítio e à pessoa.',
        mechanism: 'Medicamentos com ações complementares reduzem populações bacilares e limitam seleção de resistência.',
        decision: 'Vincule ao programa de TB e revise interações, tolerância, adesão e função orgânica.',
        pitfall: 'Não improvisar monoterapia nem copiar esquemas complexos de UTI sem equipe e monitorização.',
        severity: 'Na doença crítica, absorção e disfunção orgânica podem mudar a estratégia; atraso terapêutico importa.',
        sourceIds: ['idsaTB', 'msCritical', 'who2026'], image: 'assets/expansao/tb-pulmonar-06.png',
        imageAlt: 'Diferentes componentes terapêuticos convergindo sobre uma população de bacilos, sem doses representadas.',
        caption: 'Combinação adequada e acompanhamento preservam eficácia; esta imagem não define um esquema prescritivo.'
      },
      {
        id: 'tb-pulmonar-07', title: 'Resistência: testar, não adivinhar',
        signal: 'Detecção de resistência ou evolução inadequada exige reavaliar o diagnóstico e o esquema.',
        mechanism: 'Resistência pode estar presente na transmissão ou surgir por seleção durante exposição inadequada.',
        decision: 'Amplie investigação de sensibilidade e encaminhe à referência, revisando adesão, absorção e interações.',
        pitfall: 'Persistência de sintomas não prova resistência; também não autoriza acrescentar um medicamento isolado por conta própria.',
        severity: 'Piora em tratamento exige avaliação rápida, especialmente com falência orgânica.',
        sourceIds: ['whoDiagnosis', 'msCritical', 'idsaTB'], image: 'assets/expansao/tb-pulmonar-07.png',
        imageAlt: 'Bacilos e barreiras terapêuticas ilustrando diferentes perfis de sensibilidade.',
        caption: 'O perfil do agente orienta a combinação; falha aparente também pede revisar o contexto.'
      },
      {
        id: 'tb-pulmonar-08', title: 'Miliar e SDRA: TB também é UTI',
        signal: 'Febre, infiltrado difuso, hipoxemia e disfunção de órgãos podem acompanhar TB miliar ou disseminada.',
        mechanism: 'Disseminação e lesão pulmonar extensa podem provocar insuficiência respiratória e SDRA.',
        decision: 'Organize suporte, investigação e tratamento específico com equipe intensiva e referência de TB.',
        pitfall: 'Miliar não significa indicação automática de corticoide; o benefício adjuvante isolado nessa forma permanece incerto.',
        severity: 'Escalada de suporte de oxigênio, choque ou alteração neurológica requer resposta imediata.',
        sourceIds: ['cdcTB', 'msCritical', 'idsaTB'], image: 'assets/expansao/tb-pulmonar-08.png',
        imageAlt: 'Pulmões com distribuição difusa de pequenos focos e comprometimento da troca gasosa.',
        caption: 'Disseminação pode coexistir com falência respiratória: confirmar a etiologia e sustentar órgãos em paralelo.'
      },
      {
        id: 'tb-pulmonar-09', title: 'Hemoptise ameaçadora: priorizar a vida',
        signal: 'Sangramento respiratório com dificuldade de eliminar sangue, hipoxemia ou instabilidade é ameaçador à vida.',
        mechanism: 'O sangue pode comprometer ventilação e via aérea, além da repercussão circulatória.',
        decision: 'Acione atendimento emergencial e equipe capaz de proteger via aérea e controlar a fonte do sangramento.',
        pitfall: 'Não esperar atingir um volume fixo para reconhecer gravidade nem aplicar automaticamente limiar específico de FC à TB.',
        severity: 'Ameaça à via aérea, troca gasosa ou circulação exige ação imediata.',
        sourceIds: ['cirseHemoptysis', 'cffEmergencies'], image: 'assets/expansao/tb-pulmonar-09.png',
        imageAlt: 'Via aérea e vaso pulmonar em representação conceitual de sangramento, sem cena gráfica.',
        caption: 'A gravidade depende do impacto funcional; estimar mililitros não deve atrasar o socorro.'
      },
      {
        id: 'tb-pulmonar-10', title: 'Corticoide não acompanha toda TB',
        signal: 'TB pulmonar sem indicação específica não recebe corticoide adjuvante rotineiramente.',
        mechanism: 'Reduzir inflamação não elimina o bacilo e pode ampliar riscos infecciosos da imunossupressão.',
        decision: 'Defina o sítio, a complicação e eventual outra indicação antes de considerar o adjuvante.',
        pitfall: 'A recomendação para meningite não se transfere automaticamente para TB pulmonar, pleural ou ganglionar.',
        severity: 'Gravidade exige suporte e tratamento efetivo; isoladamente, não cria uma indicação universal de corticoide.',
        sourceIds: ['whoSteroids', 'idsaTB', 'cdcStrongyloides'], image: 'assets/expansao/tb-pulmonar-10.png',
        imageAlt: 'Pulmão e controle inflamatório conectados a uma decisão clínica contextual, sem medicamento prescrito.',
        caption: 'Antes do corticoide: qual sítio, qual complicação, qual população e qual evidência?'
      }
    ]
  },
  {
    id: 'tb-extra', title: 'Tuberculose extrapulmonar', kicker: 'O órgão muda a prioridade',
    summary: 'TB pode atingir órgãos além do pulmão. A investigação do sítio e a busca de complicações definem a urgência; corticoide depende de indicação específica.',
    clinicalStatus: pending,
    blocks: [
      {
        id: 'tb-extra-01', title: 'Disseminação: conectar os órgãos',
        signal: 'Febre e comprometimento de múltiplos órgãos, especialmente na imunossupressão, exigem considerar TB disseminada.',
        mechanism: 'A disseminação hematogênica pode alcançar SNC, ossos, linfonodos e outros sítios.',
        decision: 'Busque amostras do sítio e doença pulmonar concomitante; direcione exames aos sintomas e ao estado imune.',
        pitfall: 'TB extrapulmonar costuma não transmitir, mas coexistência pulmonar/laríngea e algumas lesões abertas mudam essa avaliação.',
        severity: 'Choque, falência respiratória ou manifestações neurológicas tornam a avaliação imediata.',
        sourceIds: ['cdcTB', 'msCritical'], image: 'assets/expansao/tb-extra-01.png',
        imageAlt: 'Conexões vasculares conceituais entre pulmão e diferentes órgãos em disseminação tuberculosa.',
        caption: 'O pulmão pode ser apenas uma parte do quadro; procurar o órgão ameaçado muda a decisão.'
      },
      {
        id: 'tb-extra-02', title: 'Meningite: tempo e inflamação',
        signal: 'Cefaleia persistente, febre, alteração mental ou sinais meníngeos podem indicar TB do SNC.',
        mechanism: 'Inflamação meníngea e complicações vasculares podem causar lesão neurológica.',
        decision: 'Providencie avaliação hospitalar urgente, investigação segura e tratamento oportuno; a WHO 2025 recomenda dexametasona ou prednisolona com redução em 6–8 semanas.',
        pitfall: 'Não esperar confirmação final para cuidar de forte suspeita grave. O NIH para HIV descreve outro esquema de duração, que exige individualização.',
        severity: 'Rebaixamento, convulsão, déficit focal ou hipertensão intracraniana pedem resposta imediata.',
        sourceIds: ['whoSteroids', 'nihTB', 'msManual'], image: 'assets/expansao/tb-extra-02.png',
        imageAlt: 'Meninges e base cerebral com inflamação ilustrativa, conectadas ao foco tuberculoso.',
        caption: 'Na meningite tuberculosa, terapia antimicrobiana e controle da inflamação têm papéis distintos e complementares.'
      },
      {
        id: 'tb-extra-03', title: 'Hidrocefalia: complicação, não detalhe',
        signal: 'Piora de consciência ou sinais de hipertensão intracraniana durante TB do SNC exigem investigar complicações.',
        mechanism: 'A inflamação pode dificultar a circulação do líquor e causar hidrocefalia.',
        decision: 'Priorize neuroimagem e avaliação neurológica/neurocirúrgica; a estratégia de investigação liquórica depende da segurança clínica.',
        pitfall: 'Corticoide não substitui avaliação e tratamento da hidrocefalia nem autoriza punção lombar automática.',
        severity: 'Deterioração neurológica aguda é emergência.',
        sourceIds: ['msManual', 'idsaTB', 'nihTB'], image: 'assets/expansao/tb-extra-03.png',
        imageAlt: 'Ventrículos cerebrais e fluxo de líquor alterado em esquema conceitual de hidrocefalia.',
        caption: 'Obstrução do fluxo de líquor pode exigir uma intervenção além do tratamento da infecção.'
      },
      {
        id: 'tb-extra-04', title: 'Pericardite: tratar a causa, avaliar a pressão',
        signal: 'Dispneia, dor torácica e derrame pericárdico podem acompanhar TB pericárdica.',
        mechanism: 'Inflamação e acúmulo de líquido podem comprometer o enchimento cardíaco; há risco de constrição.',
        decision: 'Avalie repercussão hemodinâmica. A WHO 2025 admite corticoide de forma condicional; ATS/CDC/IDSA não recomenda rotina e considera casos selecionados.',
        pitfall: 'Em pessoas com HIV, o NIH recomenda contra o adjuvante na pericardite tuberculosa; não apresentar o corticoide como obrigatório.',
        severity: 'Suspeita de tamponamento exige ecocardiografia e equipe capaz de intervenção urgente.',
        sourceIds: ['whoSteroids', 'idsaTB', 'nihTB', 'msManual'], image: 'assets/expansao/tb-extra-04.png',
        imageAlt: 'Coração envolvido por líquido pericárdico em corte anatômico conceitual.',
        caption: 'Derrame, repercussão e contexto HIV precisam ser separados na decisão sobre corticoide.'
      },
      {
        id: 'tb-extra-05', title: 'Pleurite: exsudato pede etiologia',
        signal: 'Dor pleurítica e derrame podem ser manifestação de TB, mas não são específicos.',
        mechanism: 'A inflamação pleural pode produzir exsudato; achados do líquido orientam a investigação, sem serem exclusivos da TB.',
        decision: 'Integre análise do líquido, microbiologia e eventual tecido, além de pesquisar acometimento pulmonar.',
        pitfall: 'ADA ou padrão linfocitário não devem ser lidos isoladamente. Corticoide adjuvante não é rotina na TB pleural.',
        severity: 'Dispneia importante ou suspeita de empiema exige avaliação rápida.',
        sourceIds: ['msManual', 'whoDiagnosisHandbook', 'idsaTB'], image: 'assets/expansao/tb-extra-05.png',
        imageAlt: 'Líquido no espaço pleural em corte torácico com indicação conceitual de coleta diagnóstica.',
        caption: 'O líquido oferece pistas e amostras; seu aspecto não substitui a investigação etiológica.'
      },
      {
        id: 'tb-extra-06', title: 'Ganglionar: obter material adequado',
        signal: 'Linfonodomegalia persistente pode ter causa tuberculosa, neoplásica ou outras causas infecciosas.',
        mechanism: 'O envolvimento linfonodal pode produzir inflamação granulomatosa e necrose.',
        decision: 'Planeje aspirado ou tecido para testes apropriados; separe material microbiológico sem formol e material para histologia.',
        pitfall: 'Aumento ganglionar durante tratamento não é automaticamente falha, resistência ou IRIS. Corticoide não é rotina na forma ganglionar simples.',
        severity: 'Compressão de estruturas ou piora sistêmica exige reavaliação prioritária.',
        sourceIds: ['whoDiagnosisHandbook', 'msCritical', 'nihTB', 'whoSteroids'], image: 'assets/expansao/tb-extra-06.png',
        imageAlt: 'Cadeia linfonodal cervical ampliada em representação anatômica de investigação ganglionar.',
        caption: 'Uma amostra bem planejada conecta microbiologia e histologia sem perder informação.'
      },
      {
        id: 'tb-extra-07', title: 'Pott: dor vertebral e função neurológica',
        signal: 'Dor vertebral persistente, contexto compatível e alterações ósseas podem sugerir TB da coluna.',
        mechanism: 'Destruição vertebral e extensão para tecidos adjacentes podem comprometer estabilidade e estruturas neurais.',
        decision: 'Investigue com imagem adequada e equipe especializada; procure déficit motor, sensitivo e esfincteriano.',
        pitfall: 'Não atribuir fraqueza nova apenas à dor nem esperar deformidade avançada para investigar.',
        severity: 'Suspeita de compressão medular ou instabilidade exige avaliação urgente de coluna/neurocirurgia.',
        sourceIds: ['msManual', 'idsaTB'], image: 'assets/expansao/tb-extra-07.png',
        imageAlt: 'Vértebras e canal medular em corte conceitual de doença de Pott com extensão adjacente.',
        caption: 'Na coluna, reconhecer ameaça à função neurológica é tão importante quanto nomear a infecção.'
      },
      {
        id: 'tb-extra-08', title: 'Abdominal: imitações e complicações',
        signal: 'Dor abdominal, perda ponderal, ascite ou alterações intestinais podem integrar TB abdominal.',
        mechanism: 'O acometimento pode envolver peritônio, intestino e linfonodos abdominais.',
        decision: 'Obtenha material e mantenha diferencial com neoplasia e doença de Crohn antes de imunossuprimir.',
        pitfall: 'A apresentação inespecífica pode atrasar o diagnóstico. Corticoide não é tratamento adjuvante rotineiro da peritonite tuberculosa.',
        severity: 'Sinais de obstrução, perfuração ou instabilidade requerem avaliação hospitalar urgente.',
        sourceIds: ['wgoTB', 'idsaTB'], image: 'assets/expansao/tb-extra-08.png',
        imageAlt: 'Peritônio, alças intestinais e linfonodos em esquema conceitual de TB abdominal.',
        caption: 'Sintomas semelhantes podem vir de mecanismos diferentes; confirmar evita imunossupressão inadequada.'
      },
      {
        id: 'tb-extra-09', title: 'Geniturinária: pensar além da urocultura comum',
        signal: 'Sintomas urinários persistentes ou hematúria sem explicação podem motivar investigação de TB geniturinária.',
        mechanism: 'O acometimento pode alcançar rim e vias urinárias após disseminação, com lesão e obstrução.',
        decision: 'Direcione amostras e imagem ao sítio e discuta microbiologia específica e avaliação urológica.',
        pitfall: 'Urocultura bacteriana habitual negativa não responde à pergunta sobre micobactéria.',
        severity: 'Obstrução urinária ou disfunção renal importante exigem avaliação rápida.',
        sourceIds: ['cdcSymptoms', 'idsaTB', 'whoDiagnosisHandbook'], image: 'assets/expansao/tb-extra-09.png',
        imageAlt: 'Rins e vias urinárias conectados à investigação microbiológica, em desenho conceitual.',
        caption: 'O sítio define a amostra: uma cultura comum não substitui pesquisa dirigida para TB.'
      },
      {
        id: 'tb-extra-10', title: 'Corticoide contextual: uma decisão por indicação',
        signal: 'Antes do adjuvante, identifique meningite, pericardite, IRIS ou outra indicação independente.',
        mechanism: 'O benefício anti-inflamatório varia conforme órgão e população; imunossupressão também pode causar dano.',
        decision: 'Use as recomendações específicas e avalie exposição a Strongyloides; na suspeita grave de TB do SNC, investigação e mitigação do risco ocorrem em paralelo ao cuidado urgente.',
        pitfall: 'Não transformar TB extrapulmonar em indicação única de corticoide nem classificar toda piora como IRIS.',
        severity: 'Comprometimento neurológico, tamponamento ou falência orgânica requer equipe especializada imediatamente.',
        sourceIds: ['whoSteroids', 'nihTB', 'cdcStrongyloides', 'msCritical'], image: 'assets/expansao/tb-extra-10.png',
        imageAlt: 'Pulmão, cérebro e coração ligados a uma decisão contextual sobre controle inflamatório.',
        caption: 'Órgão + população + complicação + risco: quatro perguntas antes do corticoide.'
      }
    ]
  }
];

export const CORTICOSTEROID_GUIDE = [
  {
    setting: 'Meningite tuberculosa · WHO 2025',
    recommendation: 'Recomenda dexametasona ou prednisolona adjuvante, com redução ao longo de 6–8 semanas, junto à terapia antituberculosa.',
    rationale: 'Recomendação forte, com certeza moderada. A edição WHO 2026 foi identificada, mas esta formulação foi conferida no manual operacional de 2025; não é uma prescrição individual.',
    sourceIds: ['whoSteroids', 'who2026']
  },
  {
    setting: 'TB do SNC em pessoas com HIV · NIH',
    recommendation: 'O NIH mantém indicação de corticoide adjuvante, mas descreve um esquema de duração diferente, de 12 semanas; definir o plano com especialista.',
    rationale: 'A população com HIV e o protocolo consultado devem ficar explícitos; não fundir os dois esquemas em uma duração universal.',
    sourceIds: ['nihTB', 'whoSteroids']
  },
  {
    setting: 'Pericardite tuberculosa · indicação seletiva',
    recommendation: 'WHO 2025: corticoide pode ser usado, de forma condicional. ATS/CDC/IDSA: não usar rotineiramente; considerar situações selecionadas de maior risco inflamatório.',
    rationale: 'A certeza é muito baixa e as diretrizes diferem. Repercussão do derrame e risco de constrição exigem avaliação própria; corticoide não resolve tamponamento.',
    sourceIds: ['whoSteroids', 'idsaTB']
  },
  {
    setting: 'Pericardite tuberculosa em pessoas com HIV',
    recommendation: 'O NIH recomenda contra corticoide adjuvante nessa indicação em pessoas com HIV.',
    rationale: 'Não demonstrou benefício clínico global suficiente e há preocupações de dano; essa população não deve receber uma orientação genérica de uso obrigatório.',
    sourceIds: ['nihTB']
  },
  {
    setting: 'TB pulmonar simples, pleural ou ganglionar',
    recommendation: 'Não usar corticoide adjuvante de rotina nessas formas sem outra indicação específica.',
    rationale: 'A recomendação da meningite não se transfere para outros sítios; na pleurite, ensaios não sustentam prevenção rotineira de sequelas pelo adjuvante.',
    sourceIds: ['whoSteroids', 'idsaTB']
  },
  {
    setting: 'TB miliar/disseminada e SDRA',
    recommendation: 'Não presumir indicação universal. O papel do corticoide adjuvante na TB miliar permanece incerto; complicações e outras indicações exigem avaliação própria.',
    rationale: 'Suporte de órgãos e terapia efetiva são prioritários; envolvimento do SNC ou insuficiência adrenal muda a pergunta clínica.',
    sourceIds: ['idsaTB', 'msCritical']
  },
  {
    setting: 'TB-IRIS',
    recommendation: 'Corticoide pode ter lugar em situações selecionadas de IRIS moderada/grave, sob acompanhamento especializado.',
    rationale: 'Antes, excluir falha terapêutica, resistência e outras infecções. A piora após terapia não estabelece IRIS automaticamente.',
    sourceIds: ['nihTB']
  },
  {
    setting: 'Strongyloides antes da imunossupressão',
    recommendation: 'Avaliar exposição epidemiológica e necessidade de investigação/mitigação de estrongiloidíase antes do corticoide, quando viável.',
    rationale: 'Há risco de hiperinfecção e disseminação. Em forte suspeita de TB grave do SNC, acionar equipe e manejar esse risco em paralelo, sem atrasar o tratamento urgente.',
    sourceIds: ['cdcStrongyloides', 'nihTB', 'msCritical']
  },
  {
    setting: 'PCP associada ao HIV · exceção fora da TB',
    recommendation: 'Indicar adjuvante se PaO₂ em ar ambiente <70 mmHg OU gradiente A–a ≥35 mmHg; iniciar idealmente até 72 horas após o início da terapia específica.',
    rationale: 'Esses critérios pertencem à diretriz de PCP em HIV. Na PCP sem HIV, não aplicar automaticamente esse benefício nem o mesmo algoritmo.',
    sourceIds: ['nihPCP']
  },
  {
    setting: 'Criptococose em pessoas com HIV · evitar uma transferência perigosa',
    recommendation: 'Corticoide não é rotina na indução e não deve ser usado para controlar hipertensão intracraniana criptocócica.',
    rationale: 'Pressão intracraniana requer manejo específico; IRIS grave é uma situação distinta, avaliada por especialista.',
    sourceIds: ['nihCrypto']
  }
];

export const SEVERITY_ALERTS = [
  { title: 'Meningoencefalite / deterioração neurológica', signals: 'Rebaixamento de consciência, convulsão, déficit focal ou sinais de hipertensão intracraniana.', action: 'Avaliação hospitalar imediata, investigação segura e tratamento oportuno; procurar hidrocefalia e outras complicações.', sourceIds: ['msManual', 'nihTB', 'idsaTB'] },
  { title: 'Miliar, disseminação ou SDRA', signals: 'Hipoxemia progressiva, necessidade crescente de suporte, choque ou disfunção de múltiplos órgãos.', action: 'Acionar equipe intensiva e referência em TB; investigar e tratar a infecção em paralelo ao suporte de órgãos.', sourceIds: ['msCritical', 'cdcTB'] },
  { title: 'Hemoptise ameaçadora à vida', signals: 'Sangramento com ameaça à via aérea, oxigenação ou circulação, independentemente de estimativa exata de volume.', action: 'Resposta emergencial com equipe habilitada a proteger a via aérea e controlar o sangramento.', sourceIds: ['cirseHemoptysis'] },
  { title: 'Tamponamento pericárdico', signals: 'Derrame associado a instabilidade hemodinâmica ou sinais de comprometimento do enchimento cardíaco.', action: 'Ecocardiografia e avaliação urgente por equipe capaz de intervenção; corticoide não substitui esse manejo.', sourceIds: ['idsaTB', 'msManual'] },
  { title: 'Compressão medular / doença de Pott', signals: 'Dor vertebral com fraqueza nova, alteração sensitiva, disfunção esfincteriana ou suspeita de instabilidade.', action: 'Avaliação urgente de coluna e imagem apropriada; não aguardar evolução da deformidade.', sourceIds: ['idsaTB', 'msManual'] }
];
