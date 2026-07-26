"use strict";

/*
 * Fonte navegável da Estação Radar Diário.
 *
 * Três relógios nunca devem ser misturados:
 * - sourcePublishedAt: publicação/atualização da fonte;
 * - editorialPublishedAt: entrada no Radar;
 * - checkedAt: última conferência humana da referência.
 *
 * O Radar tem três canais editoriais independentes:
 * - scientific: ciência clínica;
 * - context: saúde, sistemas e geopolítica;
 * - commercial: produtividade e compras.
 *
 * Cada visual possui duas versões do mesmo conteúdo: card e widescreen.
 */

const RADAR_GENERATED_AT="2026-07-25T22:40:00-03:00";
const EDITORIAL_DAY="2026-07-25";

const scientific=[
  {
    id:"pmid:42469838",section:"scientific",priority:1,date:"2026-07-17",
    sourcePublishedAt:"2026-07-17T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:39:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Estudo prospectivo bicêntrico",evidenceLevel:"Observacional fisiológico",access:"aberto",topic:"Hemodinâmica",
    title:"Hipertensão intra-abdominal reduz a confiabilidade da elevação passiva das pernas",
    source:"Critical Care · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42469838/",
    summary:"Em 88 pacientes ventilados, a elevação passiva das pernas discriminou responsividade a fluidos muito bem sem hipertensão intra-abdominal, mas perdeu desempenho quando a pressão intra-abdominal era ≥12 mmHg. Teste de oclusão expiratória e mini-fluid challenge mantiveram melhor desempenho nesse subgrupo.",
    why:"Evita uma leitura binária e potencialmente enganosa de um teste dinâmico frequente na UTI.",
    caveat:"Estudo pequeno, fisiológico e observacional; desempenho diagnóstico não demonstra melhora de desfechos.",
    didactic:{
      clinicalQuestion:"A hipertensão intra-abdominal altera a acurácia da elevação passiva das pernas para prever responsividade a fluidos?",
      design:"Prospectivo, observacional, em dois centros; comparação de testes dinâmicos contra mudança do débito cardíaco.",
      population:"88 adultos sob ventilação mecânica; hipertensão intra-abdominal definida como pressão intra-abdominal ≥12 mmHg.",
      mainResult:"AUROC da elevação passiva das pernas: 0,96 sem hipertensão intra-abdominal e 0,71 com hipertensão; no grupo com hipertensão, oclusão expiratória e mini-fluid challenge tiveram AUROC 0,89 e 0,90.",
      clinicalMeaning:"A mecânica abdominal pode impedir transferência venosa suficiente e produzir falso negativo no teste.",
      practiceToday:"Meça a pressão intra-abdominal quando houver suspeita; se elevada, integre oclusão expiratória, mini-fluid challenge, débito cardíaco e tolerância a fluidos.",
      doNotInfer:"Não administrar fluido apenas porque um teste é positivo; responsividade não equivale a necessidade nem tolerância.",
      temiHook:"Diferencie responsividade, necessidade, segurança e tolerância ao fluido.",
      memoryAnchor:"PLR NEGATIVO + HIA ≠ SEMPRE NÃO RESPONSIVO",
      caveats:["Amostra de 88 pacientes.","Resultado fisiológico, sem comparação de desfechos clínicos."]
    }
  },
  {
    id:"pmid:42476363",section:"scientific",priority:1,date:"2026-07-20",
    sourcePublishedAt:"2026-07-20T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:38:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Revisão clínica",evidenceLevel:"Revisão narrativa aberta",access:"aberto",topic:"POCUS",
    title:"Pirâmide POCUS integra coração, pulmão e congestão venosa",
    source:"Clinical Medicine · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42476363/",
    summary:"A revisão propõe integrar ultrassom cardíaco, pulmonar e venoso a variáveis dinâmicas — ventilação, pré-carga, drogas vasoativas e metabolismo — em vez de interpretar uma única janela como diagnóstico completo.",
    why:"Transforma imagens isoladas em uma pergunta fisiológica organizada para choque e hipoxemia.",
    caveat:"É um modelo integrativo de revisão, não um score validado nem um ensaio de desfecho.",
    didactic:{
      clinicalQuestion:"Como integrar achados cardiopulmonares e venosos do POCUS na avaliação do paciente crítico?",
      design:"Revisão clínica com estrutura didática em pirâmide.",
      population:"Pacientes críticos com choque, hipoxemia ou dúvida hemodinâmica.",
      mainResult:"Três pilares — coração, pulmão e congestão venosa sistêmica — devem ser interpretados no contexto fisiológico e reavaliados após intervenção.",
      clinicalMeaning:"Uma janela responde a uma pergunta; o conjunto orienta o fenótipo e a próxima decisão.",
      practiceToday:"Comece pela pergunta clínica, adquira janelas de qualidade, integre os três domínios e documente limitações e resposta à intervenção.",
      doNotInfer:"Não considerar a pirâmide um protocolo validado, nem usar POCUS para substituir exame, monitorização ou método confirmatório indicado.",
      temiHook:"POCUS é extensão do exame físico orientada por pergunta, não coleção de imagens.",
      memoryAnchor:"CORAÇÃO + PULMÃO + VEIAS → CONTEXTO → REAVALIAÇÃO",
      caveats:["Revisão narrativa.","Dependência de treinamento, qualidade de imagem e contexto clínico."]
    }
  },
  {
    id:"pmid:41848489",section:"scientific",priority:1,date:"2026-07-15",
    sourcePublishedAt:"2026-07-15T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:37:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Ensaio clínico randomizado",evidenceLevel:"ECR aberto, centro único",access:"semiaberto",topic:"IA em saúde",
    title:"IA em TC de baixa dose detectou mais nódulos, sem reduzir o tempo de leitura",
    source:"AJR · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/41848489/",
    summary:"Em 911 exames de pessoas assintomáticas, a assistência por IA não reduziu significativamente o tempo de interpretação. Aumentou achados Lung-RADS positivos e recomendações de TC de seguimento; nenhum câncer foi diagnosticado no seguimento mediano de cerca de 215 dias.",
    why:"Mostra o paradoxo prático: maior detecção pode gerar mais investigação sem benefício clínico já demonstrado.",
    caveat:"Centro único, rastreamento oportunístico e seguimento curto; não avaliou mortalidade nem sobrediagnóstico a longo prazo.",
    didactic:{
      clinicalQuestion:"A IA integrada ao PACS acelera a leitura e melhora a detecção de nódulos em TC de baixa dose?",
      design:"Ensaio prospectivo, randomizado, aberto e de centro único.",
      population:"911 indivíduos assintomáticos em check-up; 10 radiologistas torácicos.",
      mainResult:"Tempo 187 vs 172 s (p=0,23); Lung-RADS positivo 16,9% vs 10,3%; recomendação de seguimento 15,3% vs 7,4%.",
      clinicalMeaning:"Mais achados não significam automaticamente mais benefício; podem aumentar exames, ansiedade e custo.",
      practiceToday:"Antes de adotar, monitore tempo real, falsos positivos, seguimentos, câncer confirmado, carga de trabalho e equidade.",
      doNotInfer:"Não concluir que a IA melhora desfechos oncológicos ou substitui o radiologista.",
      temiHook:"Separe acurácia/detecção, eficiência operacional e desfecho centrado no paciente.",
      memoryAnchor:"MAIS DETECÇÃO ≠ MAIS BENEFÍCIO",
      caveats:["Centro único.","Nenhum câncer no seguimento mediano de aproximadamente 215 dias."]
    }
  },
  {
    id:"pmid:42449426",section:"scientific",priority:1,date:"2026-07-14",
    sourcePublishedAt:"2026-07-14T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:36:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Seguimento de ensaio randomizado",evidenceLevel:"Análise de desfechos em 1 ano",access:"aberto",topic:"Ventilação mecânica",
    title:"Volume corrente ultrabaixo: sobrevida semelhante e sinal cognitivo que exige cautela",
    source:"PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42449426/",
    summary:"No seguimento de 215 pacientes com SDRA por COVID-19 randomizados para 4 ou 6 mL/kg de peso predito, a mortalidade em um ano não diferiu significativamente. Entre sobreviventes, o grupo ultrabaixo teve MoCA de 5 minutos mediano 2 pontos menor; hipercapnia associou-se ao resultado, sem provar causalidade.",
    why:"Lembra que proteção pulmonar precisa ser equilibrada com carga terapêutica e possíveis efeitos sistêmicos.",
    caveat:"Análise em sobreviventes, escala cognitiva breve e associação de hipercapnia não causal.",
    didactic:{
      clinicalQuestion:"Ventilação com 4 mL/kg, comparada a 6 mL/kg, altera mortalidade ou cognição em um ano?",
      design:"Seguimento de ensaio randomizado multicêntrico.",
      population:"215 adultos com SDRA relacionada à COVID-19.",
      mainResult:"Mortalidade em 1 ano sem diferença significativa; entre sobreviventes, MoCA de 5 minutos mediano 2 pontos menor no grupo ultrabaixo.",
      clinicalMeaning:"Reduzir volume além do padrão protetor não garante benefício e pode exigir sedação, suporte extracorpóreo de CO₂ ou tolerância à hipercapnia.",
      practiceToday:"Use estratégia individualizada, monitore drive, sincronia, pH/PaCO₂, sedação e desfechos além do pulmão.",
      doNotInfer:"Não afirmar que hipercapnia causou déficit cognitivo, nem abandonar ventilação protetora.",
      temiHook:"Diferencie estratégia protetora padrão, ultrabaixa e indicação de suporte extracorpóreo.",
      memoryAnchor:"PROTEGER O PULMÃO SEM ESQUECER O CÉREBRO",
      caveats:["Análise de sobreviventes.","Instrumento cognitivo breve e contexto específico de COVID-19."]
    }
  },
  {
    id:"pmid:42432993",section:"scientific",priority:1,date:"2026-07-10",
    sourcePublishedAt:"2026-07-10T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:35:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Ensaio clínico randomizado",evidenceLevel:"ECR unicêntrico",access:"aberto",topic:"Delirium",
    title:"Visita familiar flexível reduziu delirium em uma UTI ortopédica",
    source:"Journal of International Medical Research · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42432993/",
    summary:"Em 405 pacientes ≥60 anos após cirurgia ortopédica, a visita flexível foi associada a menor delirium (29,5% vs 44,4%) e menor uso de sedativos (32,0% vs 44,9%), sem aumento observado de infecção ou permanência.",
    why:"É uma intervenção humana, potencialmente simples, mas dependente do contexto e da forma de implementação.",
    caveat:"Centro único e UTI ortopédica; resultados contrastam com ensaios prévios maiores em populações gerais de UTI.",
    didactic:{
      clinicalQuestion:"Visita familiar flexível reduz delirium pós-operatório em idosos na UTI ortopédica?",
      design:"Ensaio randomizado, paralelo, de centro único.",
      population:"405 pacientes com 60 anos ou mais, admitidos após cirurgia ortopédica.",
      mainResult:"Delirium 29,5% vs 44,4%; sedativos 32,0% vs 44,9%; sem aumento observado de infecção ou tempo de internação.",
      clinicalMeaning:"Família pode colaborar com orientação, comunicação e segurança, mas o efeito não deve ser extrapolado sem contexto.",
      practiceToday:"Estruture critérios, educação do familiar, horários flexíveis, higiene, participação segura e avaliação local de resultados.",
      doNotInfer:"Não transformar um ensaio unicêntrico em política universal nem atribuir todo o efeito apenas à presença da família.",
      temiHook:"Medidas não farmacológicas de delirium exigem pacote, processo e contexto.",
      memoryAnchor:"FAMÍLIA ORIENTADA → PRESENÇA SEGURA → REORIENTAÇÃO",
      caveats:["Centro único e população ortopédica.","Comparar com evidência prévia antes de mudar política institucional."]
    }
  },
  {
    id:"pmid:42393197",section:"scientific",priority:2,date:"2026-07-02",
    sourcePublishedAt:"2026-07-02T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:34:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Estudo de avaliação",evidenceLevel:"Comparação IA versus médicos",access:"aberto",topic:"IA em saúde",
    title:"IA avaliando IA: útil para triagem, insuficiente para substituir julgamento clínico",
    source:"PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42393197/",
    summary:"Mais de 400 médicos de sete especialidades compararam avaliações humanas e automatizadas de respostas clínicas geradas por IA. Avaliadores de IA foram eficientes e direcionalmente alinhados, mas perderam nuances percebidas por especialistas.",
    why:"É relevante para qualquer sistema que pretenda auditar respostas médicas automaticamente.",
    caveat:"Alinhamento médio não elimina falhas raras, diferenças por especialidade ou riscos de um avaliador compartilhar o mesmo viés do sistema avaliado.",
    didactic:{
      clinicalQuestion:"Um modelo de IA pode substituir especialistas na avaliação de respostas clínicas de outra IA?",
      design:"Estudo comparativo com avaliação humana multiespecialidade.",
      population:"Mais de 400 médicos de sete especialidades e respostas clínicas produzidas por IA.",
      mainResult:"Os avaliadores automáticos foram rápidos e, em média, alinhados à direção dos humanos, mas não captaram toda a nuance clínica.",
      clinicalMeaning:"Automação pode priorizar e pré-auditar; casos limítrofes, graves e discordantes precisam de revisão especializada.",
      practiceToday:"Use amostragem humana, critérios explícitos, dupla checagem de itens críticos e rastreio de discordâncias.",
      doNotInfer:"Não considerar uma nota automática prova de segurança ou correção clínica.",
      temiHook:"Validação de IA exige padrão de referência, análise de erro e governança.",
      memoryAnchor:"IA TRIAGEM → HUMANO DECIDE → ERRO É AUDITADO",
      caveats:["Possível viés compartilhado entre gerador e avaliador.","Desempenho médio pode ocultar falhas clínicas importantes."]
    }
  },
  {
    id:"pmid:42012891",section:"scientific",priority:1,date:"2026-07-01",
    sourcePublishedAt:"2026-07-01T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:33:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Ensaio piloto randomizado",evidenceLevel:"Piloto aberto",access:"semiaberto",topic:"POCUS",
    title:"POCUS de tolerância a fluidos mudou condutas em metade dos pacientes com LRA",
    source:"CJASN · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42012891/",
    summary:"Em 80 pacientes não críticos com lesão renal aguda, B-lines e VExUS mudaram a conduta inicialmente planejada em 50% e aumentaram o uso precoce de diurético. O piloto não mostrou diferença em balanço de cinco dias, progressão da LRA ou morte/escalonamento.",
    why:"Coloca congestão e tolerância ao lado da pergunta clássica sobre responsividade a fluidos.",
    caveat:"Piloto pequeno, unicêntrico, aberto e em pacientes não críticos; não desenhado para eficácia clínica.",
    didactic:{
      clinicalQuestion:"Adicionar ultrassom pulmonar e venoso à avaliação da LRA é factível e muda manejo?",
      design:"Ensaio piloto randomizado, aberto, de centro único.",
      population:"80 pacientes não críticos com LRA para quem fluido havia sido iniciado ou considerado.",
      mainResult:"O POCUS mudou a conduta inicial em 50%; diurético no dia 1: 40% vs 15%; sem diferença demonstrada nos principais desfechos clínicos exploratórios.",
      clinicalMeaning:"A ultrassonografia pode revelar intolerância/congestão que a avaliação usual não explicitou.",
      practiceToday:"Pergunte separadamente: há responsividade? há necessidade? há tolerância? documente B-lines/VExUS e reavalie.",
      doNotInfer:"Não prescrever diurético ou negar fluido por VExUS isolado; o estudo não provou melhora de desfechos.",
      temiHook:"Responsividade a fluidos e tolerância a fluidos são eixos diferentes.",
      memoryAnchor:"RESPONDE? PRECISA? TOLERA?",
      caveats:["Amostra de 80 e centro único.","População não crítica e desfechos clínicos exploratórios."]
    }
  },
  {
    id:"pmid:42159452",section:"scientific",priority:2,date:"2026-07-01",
    sourcePublishedAt:"2026-07-01T11:00:00-03:00",editorialPublishedAt:"2026-07-25T22:32:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Ensaio pragmático randomizado",evidenceLevel:"ECR unicêntrico",access:"aberto",topic:"Delirium",
    title:"Pacote ABCDEF não reduziu delirium neste ensaio pragmático australiano",
    source:"Critical Care Medicine · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42159452/",
    summary:"A adesão completa ao pacote ocorreu em 50% dos dias. Delirium acumulado foi semelhante (37,9% vs 36,4%), assim como duração e função na alta da UTI; um domínio de atividades usuais foi melhor aos 90 dias e exige confirmação.",
    why:"Mostra como fidelidade de implementação, contexto e desfecho mudam a leitura de uma intervenção complexa.",
    caveat:"UTI única de oito leitos, alguns componentes já faziam parte do cuidado usual e adesão completa foi limitada.",
    didactic:{
      clinicalQuestion:"Implementar o ABCDEF completo reduz delirium e melhora função e qualidade de vida?",
      design:"Ensaio pragmático randomizado em uma UTI médico-cirúrgica.",
      population:"Adultos com permanência prevista de pelo menos 48 horas.",
      mainResult:"Delirium 37,9% vs 36,4%; duração e função semelhantes; sinal em um domínio de qualidade de vida aos 90 dias.",
      clinicalMeaning:"Resultado nulo não prova inutilidade de cada componente; intervenção complexa depende de adesão e contraste com cuidado usual.",
      practiceToday:"Audite cada componente, adesão real, sedação, mobilidade, comunicação e desfechos locais.",
      doNotInfer:"Não abandonar o pacote nem prometer que sua simples adoção reduzirá delirium.",
      temiHook:"Em estudos pragmáticos, examine fidelidade, contaminação e cuidado basal.",
      memoryAnchor:"PACOTE SÓ EXISTE SE FOR ENTREGUE",
      caveats:["Adesão completa em 50% dos dias.","Centro único com parte do pacote já incorporada."]
    }
  },
  {
    id:"pmid:41855428",section:"scientific",priority:2,date:"2026-07-01",
    sourcePublishedAt:"2026-07-01T10:00:00-03:00",editorialPublishedAt:"2026-07-25T22:31:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Ensaio fase 3 de não inferioridade",evidenceLevel:"ECR multicêntrico",access:"semiaberto",topic:"Sedação",
    title:"Remimazolam foi não inferior ao propofol para sedação curta pós-operatória",
    source:"Anesthesiology · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/41855428/",
    summary:"Em 211 pacientes quase todos pós-operatórios, sedados por até 24 horas, sucesso de sedação foi 98,1% com remimazolam e 96,2% com propofol, atendendo a margem de não inferioridade de −8%.",
    why:"Adiciona uma opção potencial, mas em cenário e duração estreitos.",
    caveat:"Não extrapolar para sedação prolongada, choque, delirium ou populações clínicas diferentes.",
    didactic:{
      clinicalQuestion:"Remimazolam mantém alvo de RASS tão bem quanto propofol em sedação curta de ventilados pós-operatórios?",
      design:"Ensaio fase 3, multicêntrico, randomizado, cego para avaliador e de não inferioridade.",
      population:"211 pacientes ventilados; 99,1% pós-operatórios; tratamento máximo de 24 horas.",
      mainResult:"Sucesso 98,1% vs 96,2%; diferença 1,9%, IC95% −3,3 a 7,8, compatível com margem de não inferioridade de −8%.",
      clinicalMeaning:"Eficácia no alvo curto foi semelhante dentro da margem escolhida; escolha ainda depende de hemodinâmica, despertar, custo e disponibilidade.",
      practiceToday:"Não mude protocolo apenas pelo resumo; compare população, margem, eventos adversos, recuperação e custo local.",
      doNotInfer:"Não afirmar superioridade, menor delirium ou segurança em sedação prolongada.",
      temiHook:"Não inferioridade exige interpretar margem, intervalo de confiança e população por protocolo/intenção de tratar.",
      memoryAnchor:"NÃO INFERIOR ≠ SUPERIOR ≠ IGUAL EM TUDO",
      caveats:["Sedação curta e quase exclusivamente pós-operatória.","Margem de não inferioridade de −8%."]
    }
  },
  {
    id:"pmid:42229230",section:"scientific",priority:2,date:"2026-06-02",
    sourcePublishedAt:"2026-06-02T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:30:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Revisão sistemática e metanálise",evidenceLevel:"52 estudos observacionais",access:"semiaberto",topic:"Delirium",
    title:"Delirium associado à sepse: incidência agrupada alta, risco não é causalidade",
    source:"Intensive & Critical Care Nursing · PubMed",url:"https://pubmed.ncbi.nlm.nih.gov/42229230/",
    summary:"A metanálise reuniu 52 estudos e 89.789 pacientes, estimando incidência agrupada de 43%. Idade, gravidade, ventilação mecânica, lactato e doença cerebrovascular apareceram associados, com heterogeneidade e risco de confusão.",
    why:"Ajuda a reconhecer alto risco sem converter associações em ferramentas de decisão não validadas.",
    caveat:"Predomínio observacional, definições e populações heterogêneas; fatores associados não são necessariamente modificáveis ou causais.",
    didactic:{
      clinicalQuestion:"Qual a incidência e quais fatores se associam ao delirium em pacientes com sepse na UTI?",
      design:"Revisão sistemática e metanálise de 52 estudos.",
      population:"89.789 pacientes de UTI com sepse.",
      mainResult:"Incidência agrupada 43% (IC95% 39–47%); múltiplos marcadores clínicos e de gravidade associados.",
      clinicalMeaning:"Risco alto reforça rastreio e prevenção, mas associação não define tratamento nem causalidade.",
      practiceToday:"Faça rastreio validado, reveja sedação, dor, sono, mobilidade, hipóxia, infecção, metabolismo e fármacos.",
      doNotInfer:"Não usar um fator isolado como score validado nem tratar marcador associado como causa comprovada.",
      temiHook:"Em metanálise observacional, examine heterogeneidade, confusão e definição do desfecho.",
      memoryAnchor:"RISCO ALTO → RASTREAR → PROCURAR CAUSAS → PREVENIR",
      caveats:["Heterogeneidade entre estudos.","Associações observacionais não estabelecem causalidade."]
    }
  }
];

const geopolitics=[
  {
    id:"who:precision-medicine-ai-2026-07-24",section:"context",priority:2,date:"2026-07-24",
    sourcePublishedAt:"2026-07-24T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:29:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Cooperação internacional",evidenceLevel:"Comunicado institucional",access:"aberto",topic:"IA em saúde",
    title:"OMS Sudeste Asiático e Universidade de Colombo anunciam capacitação em IA e medicina de precisão",
    source:"WHO South-East Asia",url:"https://www.who.int/southeastasia/news/detail/24-07-2026-who-searo-and-university-of-colombo-collaborate-on-ai-leadership-and-capacity-development-for-precision-medicine-primary-health-care-and-universal-health-coverage",
    summary:"A parceria prevê formação de liderança e capacidade em IA, genômica e medicina de precisão com foco em atenção primária e cobertura universal.",
    why:"Capacitação e governança podem afetar como tecnologias clínicas chegam a sistemas públicos.",
    caveat:"É anúncio de cooperação, não avaliação de eficácia, cronograma de implantação brasileira ou benefício assistencial.",
    routineImpact:"Para médico e estudante: acompanhar currículos, competências em dados e requisitos de validação; não confundir formação institucional com ferramenta pronta para uso clínico.",
    didactic:{
      clinicalQuestion:"O que um anúncio de capacitação em IA e precisão muda na rotina clínica hoje?",
      design:"Comunicado oficial de parceria acadêmico-institucional.",
      population:"Lideranças e profissionais de saúde da Região do Sudeste Asiático da OMS.",
      mainResult:"Foram definidos eixos de desenvolvimento de capacidade em IA, genômica e medicina de precisão.",
      clinicalMeaning:"A direção estratégica é relevante, mas o efeito depende de currículo, governança, infraestrutura e avaliação.",
      practiceToday:"Fortaleça alfabetização em dados, privacidade, viés, validação externa e supervisão humana.",
      doNotInfer:"Não considerar a parceria evidência de benefício clínico de uma tecnologia específica.",
      temiHook:"Política de saúde e evidência clínica respondem a perguntas diferentes.",
      memoryAnchor:"CAPACITAR → VALIDAR → GOVERNAR → IMPLEMENTAR",
      caveats:["Anúncio institucional.","Sem resultado assistencial ou calendário brasileiro."]
    }
  },
  {
    id:"who:west-nile-europe-2026-07-24",section:"context",priority:1,date:"2026-07-24",
    sourcePublishedAt:"2026-07-24T11:00:00-03:00",editorialPublishedAt:"2026-07-25T22:28:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Alerta epidemiológico",evidenceLevel:"Vigilância oficial",access:"aberto",topic:"Saúde global",
    title:"Vírus do Nilo Ocidental aumenta em partes da Europa: reconheça o fenótipo neuroinvasivo",
    source:"WHO Europe",url:"https://www.who.int/europe/news/item/24-07-2026-west-nile-virus--as-cases-rise-across-parts-of-europe--here-is-what-you-need-to-know",
    summary:"A OMS relatou casos na Grécia e Itália em 2026. A maioria das infecções é assintomática; doença neurológica grave ocorre em cerca de 1 em 150 infectados. Não há vacina humana licenciada nem antiviral específico.",
    why:"Viagem, exposição a mosquitos e síndrome neurológica aguda podem transformar um alerta distante em diagnóstico diferencial local.",
    caveat:"Contagens europeias não estimam risco individual no Brasil; confirme epidemiologia e vigilância locais.",
    routineImpact:"Para médico: perguntar viagem/exposição, reconhecer meningite, encefalite ou paralisia flácida e acionar vigilância conforme protocolo. Para estudante: revisar flavivírus e diferenciais de neuroinfecção.",
    didactic:{
      clinicalQuestion:"Quando o alerta europeu deve entrar no raciocínio de um médico no Brasil?",
      design:"Atualização oficial de vigilância e orientação pública.",
      population:"Pessoas expostas a mosquitos em áreas com circulação, especialmente idosos e imunocomprometidos.",
      mainResult:"70–80% assintomáticos; doença neuroinvasiva grave em aproximadamente 1/150; suporte é a base do tratamento.",
      clinicalMeaning:"O valor está na história epidemiológica e no reconhecimento precoce da síndrome neurológica, não em rastrear indiscriminadamente.",
      practiceToday:"Pergunte viagem e exposição, examine neurologicamente, trate suporte e siga regras locais de diagnóstico/notificação.",
      doNotInfer:"Não assumir transmissão local brasileira com base em dados europeus nem usar antibiótico/antiviral específico sem indicação.",
      temiHook:"Síndrome + epidemiologia + gravidade orientam investigação de neuroinfecção.",
      memoryAnchor:"MOSQUITO + VIAGEM + NEURO → PENSAR E NOTIFICAR",
      caveats:["Dados europeus e dinâmicos.","Sem vacina humana licenciada ou antiviral específico."]
    }
  },
  {
    id:"ms:fumaça-incendios-2026-07-21",section:"context",priority:1,date:"2026-07-21",
    sourcePublishedAt:"2026-07-21T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:27:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Alerta de saúde pública",evidenceLevel:"Orientação oficial",access:"aberto",topic:"Saúde ambiental",
    title:"Ministério da Saúde monitora fumaça de incêndios: risco respiratório chega ao plantão",
    source:"Ministério da Saúde",url:"https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-monitora-impactos-dos-incendios-florestais-na-saude-e-orienta-populacao-sobre-exposicao-a-fumaca",
    summary:"O Ministério reforçou vigilância dos efeitos da fumaça e orientações de redução de exposição. Material particulado fino pode agravar doença respiratória e cardiovascular, sobretudo em crianças, idosos, gestantes e pessoas com comorbidades.",
    why:"Transforma notícia ambiental em anamnese, prevenção, fluxo de atendimento e planejamento de capacidade.",
    caveat:"Risco varia por concentração local, tempo de exposição e vulnerabilidade; consulte dados ambientais e vigilância regional.",
    routineImpact:"Para médico: acrescentar exposição à fumaça na história, revisar plano de asma/DPOC, identificar hipoxemia e orientar redução de exposição. Para estudante: correlacionar PM2,5, inflamação e descompensação cardiorrespiratória.",
    didactic:{
      clinicalQuestion:"Como um alerta de fumaça deve mudar triagem e orientação clínica?",
      design:"Comunicado oficial de monitoramento e prevenção.",
      population:"População exposta, com maior atenção a crianças, idosos, gestantes e cardiopatas/pneumopatas.",
      mainResult:"A fumaça contém partículas finas capazes de penetrar profundamente no sistema respiratório e agravar doenças.",
      clinicalMeaning:"Exposição ambiental é dado clínico e operacional, especialmente durante picos de atendimento.",
      practiceToday:"Pergunte localização/tempo de exposição, sintomas, comorbidades, saturação; oriente redução de exposição e sinais de alarme.",
      doNotInfer:"Não atribuir todo sintoma à fumaça nem prometer proteção total com máscara ou ambiente interno.",
      temiHook:"Exposição + vulnerabilidade + síndrome + gravidade.",
      memoryAnchor:"FUMAÇA → EXPOSIÇÃO → SpO₂ → GRUPOS DE RISCO",
      caveats:["Concentração local pode mudar rapidamente.","Siga vigilância e protocolo regional."]
    }
  },
  {
    id:"ms:diagnostico-portatil-tb-2026-07-15",section:"context",priority:2,date:"2026-07-15",
    sourcePublishedAt:"2026-07-15T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:26:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Encomenda tecnológica",evidenceLevel:"Consulta oficial ao mercado",access:"aberto",topic:"SUS e inovação",
    title:"Saúde consulta mercado para diagnóstico portátil de tuberculose",
    source:"Ministério da Saúde",url:"https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-recebe-contribuicoes-do-mercado-para-desenvolver-encomenda-tecnologica-que-identificara-tuberculose/",
    summary:"O Ministério recebeu contribuições para desenvolver solução portátil de identificação de tuberculose. A iniciativa busca aproximar diagnóstico de territórios e populações com barreiras de acesso.",
    why:"Tecnologia de campo pode alterar tempo até diagnóstico, isolamento, tratamento e vigilância.",
    caveat:"Consulta e desenvolvimento não equivalem a produto aprovado, desempenho validado, compra concluída ou disponibilidade no serviço.",
    routineImpact:"Para médico e estudante: manter o fluxo diagnóstico atual; acompanhar validação, população-alvo, sensibilidade, especificidade e implantação antes de incorporar a novidade.",
    didactic:{
      clinicalQuestion:"O anúncio muda o diagnóstico de tuberculose disponível hoje?",
      design:"Consulta institucional para encomenda tecnológica.",
      population:"Populações e territórios com barreiras ao diagnóstico convencional.",
      mainResult:"Há uma iniciativa de desenvolvimento; ainda não há produto validado e disponível anunciado nessa fonte.",
      clinicalMeaning:"Potencial de descentralização é relevante, mas depende de desempenho, regulação, logística e integração ao SUS.",
      practiceToday:"Use os métodos e fluxos vigentes; acompanhe estudos de validação e diretrizes oficiais.",
      doNotInfer:"Não divulgar a tecnologia como disponível nem substituir teste recomendado.",
      temiHook:"Inovação percorre necessidade → desenvolvimento → validação → regulação → implementação.",
      memoryAnchor:"ANÚNCIO ≠ TESTE VALIDADO ≠ DISPONÍVEL",
      caveats:["Fase de consulta/desenvolvimento.","Sem desempenho clínico informado."]
    }
  },
  {
    id:"amib:temi-2026-edital",section:"context",priority:1,date:"2026-03-18",
    sourcePublishedAt:"2026-03-18T14:49:31-03:00",editorialPublishedAt:"2026-07-25T22:25:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Prazo oficial",evidenceLevel:"Edital atualizado",access:"aberto",topic:"TEMI",
    title:"TEMI 2026: prazo de 31 de julho exige ação de candidatos já inscritos",
    source:"AMIB · Edital TEMI 2026",url:"https://d1xe7tfg0uwul9.cloudfront.net/amib-portal/wp-content/uploads/2026/03/18144931/Edital-TEMI-2026-Atualizado.pdf",
    summary:"Para candidatos já inscritos, o edital atualizado prevê 31/07 às 20h para atualização/reenvio documental e 31/07 às 18h como previsão de análise de condição especial. As inscrições encerraram em 15/07.",
    why:"É uma tarefa com prazo e risco operacional maior que mais uma sessão de estudo.",
    caveat:"Confirme retificações e sua situação individual no canal oficial; esta síntese não reabre inscrição encerrada.",
    routineImpact:"Para candidato inscrito: auditar documentos, comprovantes e status antes do prazo. Para estudo: prova teórica prevista em 10/11 e prática em 15/11, em Olinda, conforme o edital consultado.",
    didactic:{
      clinicalQuestion:"Qual é a próxima ação objetiva para o candidato TEMI 2026 já inscrito?",
      design:"Leitura operacional do edital oficial atualizado.",
      population:"Candidatos com inscrição realizada até 15/07/2026.",
      mainResult:"Reenvio/atualização documental até 31/07 às 20h; conferir situação e eventuais retificações no portal oficial.",
      clinicalMeaning:"Prazo documental tem prioridade sobre conteúdo novo de estudo porque pode impedir participação.",
      practiceToday:"Abra o portal oficial, confira status, documentos legíveis, comprovante e necessidade de correção; registre evidência do envio.",
      doNotInfer:"Não interpretar esta síntese como confirmação de inscrição, deferimento ou direito a reabertura.",
      temiHook:"Teórica: 90 questões; prática por estações de simulação, conforme edital consultado.",
      memoryAnchor:"31/07 • DOCUMENTOS • COMPROVANTE • STATUS",
      caveats:["Pode haver retificação posterior.","Cada candidato deve conferir a própria situação."]
    }
  },
  {
    id:"sesa-ce:pas-tb-cuida-2026",section:"context",priority:2,date:"2026-06-30",
    sourcePublishedAt:"2026-06-30T12:00:00-03:00",editorialPublishedAt:"2026-07-25T22:24:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Planejamento estadual",evidenceLevel:"Programação oficial",access:"aberto",topic:"Ceará",
    title:"Ceará inclui ações digitais para tuberculose na programação anual de saúde",
    source:"Secretaria da Saúde do Ceará · PAS 2026",url:"https://www.saude.ce.gov.br/wp-content/uploads/sites/9/2026/06/PAS-2026.pdf",
    summary:"A Programação Anual de Saúde do Ceará registra ações para qualificar vigilância e cuidado em tuberculose, incluindo iniciativas digitais como o TB CUIDA.",
    why:"Conecta política estadual, vigilância e continuidade do cuidado ao território onde a plataforma é usada.",
    caveat:"Documento de programação não demonstra cobertura, adoção real, efetividade ou disponibilidade em cada município.",
    routineImpact:"Para médico no Ceará: conhecer o fluxo municipal e os canais estaduais pode reduzir perda de seguimento; confirmar disponibilidade local antes de orientar o paciente.",
    didactic:{
      clinicalQuestion:"O que um item da programação estadual significa para a prática local?",
      design:"Documento anual de planejamento e metas de saúde.",
      population:"Rede de saúde e pessoas acompanhadas por tuberculose no Ceará.",
      mainResult:"A ação consta no planejamento; execução e alcance precisam ser acompanhados por indicadores e comunicação oficial.",
      clinicalMeaning:"Planejamento sinaliza direção e oportunidade de integração, não entrega comprovada.",
      practiceToday:"Consulte fluxo municipal, vigilância epidemiológica e material oficial antes de encaminhar ou cadastrar.",
      doNotInfer:"Não afirmar que a ferramenta está ativa em todo o estado ou que melhora desfechos sem avaliação.",
      temiHook:"Diferencie estrutura, processo, cobertura e desfecho em políticas de saúde.",
      memoryAnchor:"PLANO → EXECUÇÃO → COBERTURA → DESFECHO",
      caveats:["Documento programático.","Disponibilidade pode variar por município."]
    }
  }
];

const commercial=[
  {
    id:"commerce:shopee-suporte-notebook-11683006699",section:"commercial",priority:1,date:EDITORIAL_DAY,
    sourcePublishedAt:"2026-07-25T20:00:00-03:00",editorialPublishedAt:"2026-07-25T22:23:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Oferta monitorada",evidenceLevel:"Preço comercial dinâmico",access:"aberto",topic:"Ergonomia e estudo",
    title:"Suporte dobrável para notebook: barato, mas só funciona ergonomicamente com periféricos",
    source:"Shopee Brasil",url:"https://shopee.com.br/Apoio-Notebook-Suporte-Laptop-Ergonomico-Dobravel-em-alum%C3%ADnio-i.392264865.11683006699",
    summary:"Snapshot da busca em 25/07/2026 mostrou R$52,15 em promoção, frente a R$54,90 de referência. O valor final pode mudar com frete, cupom, vendedor e carrinho.",
    why:"Elevar a tela pode organizar uma estação de estudo e aproximar o topo do monitor da linha dos olhos.",
    caveat:"Usar o teclado elevado por longos períodos pode piorar punhos e ombros; combine com teclado e mouse externos.",
    price:{display:"R$ 52,15",reference:"R$ 54,90",checkedAt:"2026-07-25T20:00:00-03:00",availability:"Preço visto na busca; confirme no carrinho.",volatile:true},
    commerce:{
      retailer:"Shopee",affiliate:false,
      specs:["Estrutura anunciada em alumínio","Dobrável e inclinável","Compatibilidade e carga devem ser confirmadas no anúncio","Garantia e devolução devem ser conferidas"],
      goodFor:"Mesa fixa ou móvel com notebook, teclado e mouse externos.",
      howToUse:"Ajuste o topo da tela próximo à linha dos olhos, mantenha antebraços apoiados e faça pausas.",
      possibleBenefit:"Pode reduzir flexão cervical e liberar espaço de mesa; não há garantia de eliminar dor ou aumentar rendimento.",
      worthIf:"Vale considerar se a estrutura for estável, suportar seu notebook e o custo total continuar baixo.",
      skipIf:"Evite se balançar, bloquear ventilação, não suportar o peso ou se você não usará periféricos externos."
    },
    didactic:{
      clinicalQuestion:"Este acessório resolve um problema real da sua estação de estudo?",
      design:"Comparação prática de função, ergonomia, preço e limitações do anúncio.",
      population:"Usuários de notebook que estudam por períodos prolongados.",
      mainResult:"Preço inicial baixo e ajuste de altura são úteis, mas ergonomia depende do conjunto completo.",
      clinicalMeaning:"Acessório não corrige sozinho postura, dor, iluminação, pausa ou organização.",
      practiceToday:"Meça mesa/tela, confira estabilidade, peso suportado, ventilação, frete e política de devolução.",
      doNotInfer:"Não prometer prevenção de lesão ou ganho mensurável de produtividade.",
      temiHook:"Compra racional: problema → requisito → custo total → teste → reavaliação.",
      memoryAnchor:"ELEVAR TELA + TECLADO EXTERNO + PAUSAS",
      caveats:["Preço e estoque mudam.","Especificações pertencem ao vendedor e devem ser confirmadas."]
    }
  },
  {
    id:"commerce:amazon-monitor-bettdow-b0d6dt84jd",section:"commercial",priority:2,date:EDITORIAL_DAY,
    sourcePublishedAt:"2026-07-25T19:55:00-03:00",editorialPublishedAt:"2026-07-25T22:22:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Produto em observação",evidenceLevel:"Especificações do varejista",access:"aberto",topic:"Produtividade digital",
    title:"Monitor portátil 15,6″: segunda tela útil só se conexão, energia e garantia fecharem",
    source:"Amazon Brasil",url:"https://www.amazon.com.br/Bettdow-Portatil-Conectado-Inteligente-magn%C3%A9tico/dp/B0D6DT84JD",
    summary:"A página anuncia painel IPS Full HD 1920×1080, 178°, duas USB-C completas, Mini HDMI, cerca de 655 g, capa magnética e alto-falantes. Não havia preço de oferta confirmável na conferência.",
    why:"Pode manter artigo/PDF em uma tela e notas ou questões na outra, reduzindo trocas de janela.",
    caveat:"USB-C do computador precisa suportar vídeo por DisplayPort Alt Mode; alguns cenários exigem HDMI e alimentação separada.",
    price:{display:"Preço não confirmado",reference:"Abrir oferta atual",checkedAt:"2026-07-25T19:55:00-03:00",availability:"Sem preço de oferta verificável na conferência.",volatile:true},
    commerce:{
      retailer:"Amazon",affiliate:false,
      specs:["15,6 polegadas","1920×1080 IPS","Ângulo anunciado de 178°","2 USB-C completas + Mini HDMI","Aproximadamente 655 g","Capa magnética e alto-falantes"],
      goodFor:"PDF/artigo + notas, prontuário de treino + diretriz, aula + questões.",
      howToUse:"Antes de comprar, teste DP Alt Mode, portas, cabo, alimentação, brilho, escala, suporte e compatibilidade com macOS/Windows.",
      possibleBenefit:"Pode reduzir alternância de janelas; ganho de foco ou velocidade não é garantido.",
      worthIf:"Faz sentido para quem realmente usa duas referências simultâneas e precisa mobilidade.",
      skipIf:"Evite se o notebook já tem tela grande suficiente, se faltam portas compatíveis ou se garantia/devolução são frágeis."
    },
    didactic:{
      clinicalQuestion:"A segunda tela remove um gargalo ou apenas acrescenta equipamento?",
      design:"Auditoria de especificações, compatibilidade, uso e custo não confirmado.",
      population:"Médicos e estudantes com fluxo digital de duas fontes simultâneas.",
      mainResult:"O conjunto anunciado é portátil e Full HD, porém preço e compatibilidade prática precisam de conferência.",
      clinicalMeaning:"Ferramenta só produz valor quando resolve troca recorrente de contexto.",
      practiceToday:"Conte quantas vezes alterna janelas, confira portas e compare garantia, brilho, peso e preço final.",
      doNotInfer:"Não prometer aumento percentual de produtividade nem precisão de cor profissional.",
      temiHook:"Métrica simples: tempo de configuração + uso real + redução percebida de trocas.",
      memoryAnchor:"DUAS TELAS SÓ SE HOUVER DOIS FLUXOS",
      caveats:["Preço indisponível na auditoria.","Dados técnicos são os declarados pelo varejista."]
    }
  },
  {
    id:"commerce:amazon-jbl-tune-770nc-b0c664nhv6",section:"commercial",priority:2,date:EDITORIAL_DAY,
    sourcePublishedAt:"2026-07-25T19:50:00-03:00",editorialPublishedAt:"2026-07-25T22:21:00-03:00",checkedAt:RADAR_GENERATED_AT,
    kind:"Produto em observação",evidenceLevel:"Especificações do varejista",access:"aberto",topic:"Áudio e foco",
    title:"Fone com ANC pode ajudar no estudo — nunca às custas de vigilância e segurança",
    source:"Amazon Brasil",url:"https://www.amazon.com.br/JBL-Fone-Ouvido-770NC-Bluetooth/dp/B0C664NHV6",
    summary:"A página do JBL Tune 770NC informa cancelamento ativo de ruído, Ambient Aware/TalkThru, Bluetooth 5.3, multiponto, equalização por aplicativo e bateria de até 70 horas. Não havia oferta em destaque confirmável.",
    why:"Redução de ruído pode tornar o ambiente de estudo mais previsível para algumas pessoas.",
    caveat:"Não usar com isolamento em plantão, trânsito, direção ou qualquer situação que exija ouvir alarmes e pessoas; proteja a audição.",
    price:{display:"Sem oferta em destaque",reference:"Comparar preço e garantia",checkedAt:"2026-07-25T19:50:00-03:00",availability:"Página ativa, sem oferta em destaque na conferência.",volatile:true},
    commerce:{
      retailer:"Amazon",affiliate:false,
      specs:["Cancelamento ativo de ruído","Ambient Aware e TalkThru","Bluetooth 5.3","Conexão multiponto","EQ por aplicativo","Até 70 h anunciadas"],
      goodFor:"Estudo individual em local seguro, videoaulas e ciclos de foco.",
      howToUse:"Use volume moderado, pausas auditivas e modo ambiente quando precisar perceber o entorno.",
      possibleBenefit:"Pode reduzir distração sonora percebida; não trata TDAH nem garante foco.",
      worthIf:"Considere se conforto, vedação, modo ambiente, garantia e preço final forem adequados.",
      skipIf:"Não compre apenas pelo ANC; evite se aperta, aquece, isola demais ou incentiva volume alto."
    },
    didactic:{
      clinicalQuestion:"O fone reduz um ruído específico sem criar risco ou desconforto?",
      design:"Auditoria de especificações, contexto de uso e segurança.",
      population:"Estudantes e profissionais em sessões de foco fora da assistência direta.",
      mainResult:"Recursos de ANC, modo ambiente e multiponto podem apoiar o fluxo; preço atual não foi confirmado.",
      clinicalMeaning:"Controle de ambiente é uma ferramenta, não tratamento nem substituto de planejamento.",
      practiceToday:"Teste conforto, latência, microfone, modo ambiente, volume e política de devolução.",
      doNotInfer:"Não prometer foco, rendimento acadêmico ou benefício clínico.",
      temiHook:"Ambiente → ciclo curto → pausa → revisão do que funcionou.",
      memoryAnchor:"ANC NO ESTUDO • OUVIDOS LIVRES NO PLANTÃO",
      caveats:["Autonomia varia com uso e ANC.","Preço e disponibilidade são dinâmicos."]
    }
  }
];

const visuals=[
  {
    id:"plr-hia",itemId:"pmid:42469838",
    file:"./assets/cards/01-plr-hia-card.png",cardFile:"./assets/cards/01-plr-hia-card.png",wideFile:"./assets/cards/01-plr-hia-wide.png",
    title:"PLR sob pressão abdominal",caption:"Quando a hipertensão intra-abdominal torna um teste negativo menos confiável.",
    alt:"Infográfico clínico em português explicando por que a hipertensão intra-abdominal reduz o desempenho da elevação passiva das pernas.",
    source:"Critical Care · PubMed",date:"2026-07-17",sourcePublishedAt:"2026-07-17T12:00:00-03:00",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/42469838/",
    transcript:{question:"A hipertensão intra-abdominal altera o PLR?",evidence:"AUROC caiu de 0,96 sem HIA para 0,71 com HIA neste estudo de 88 pacientes.",practice:"Meça pressão intra-abdominal e use teste alternativo quando elevada.",limit:"Responsividade não prova necessidade ou tolerância a fluidos."}
  },
  {
    id:"pocus-piramide",itemId:"pmid:42476363",
    file:"./assets/cards/02-pocus-piramide-card.png",cardFile:"./assets/cards/02-pocus-piramide-card.png",wideFile:"./assets/cards/02-pocus-piramide-wide.png",
    title:"Pirâmide POCUS",caption:"Coração, pulmão e veias integrados a uma pergunta fisiológica.",
    alt:"Infográfico em português com os três pilares da pirâmide POCUS: coração, pulmão e congestão venosa sistêmica.",
    source:"Clinical Medicine · PubMed",date:"2026-07-20",sourcePublishedAt:"2026-07-20T12:00:00-03:00",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/42476363/",
    transcript:{question:"Como evitar decisões por uma única janela?",evidence:"A revisão organiza três domínios em um modelo fisiológico integrado.",practice:"Pergunta, aquisição, integração, intervenção e reavaliação.",limit:"É estrutura de revisão, não score validado."}
  },
  {
    id:"fumaca-mp25",itemId:"ms:fumaça-incendios-2026-07-21",
    file:"./assets/cards/03-fumaca-mp25-card.png",cardFile:"./assets/cards/03-fumaca-mp25-card.png",wideFile:"./assets/cards/03-fumaca-mp25-wide.png",
    title:"Fumaça entra na anamnese",caption:"Exposição, vulnerabilidade, SpO₂ e sinais de gravidade.",
    alt:"Infográfico em português sobre triagem prática de pessoas expostas à fumaça de incêndios e material particulado fino.",
    source:"Ministério da Saúde",date:"2026-07-21",sourcePublishedAt:"2026-07-21T12:00:00-03:00",sourceUrl:"https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-monitora-impactos-dos-incendios-florestais-na-saude-e-orienta-populacao-sobre-exposicao-a-fumaca",
    transcript:{question:"O que muda na triagem durante fumaça intensa?",evidence:"O Ministério monitora agravos e orienta redução de exposição.",practice:"Pergunte exposição, comorbidades, sintomas e avalie gravidade.",limit:"Risco depende da concentração local e da vulnerabilidade."}
  },
  {
    id:"temi-prazo",itemId:"amib:temi-2026-edital",
    file:"./assets/cards/04-temi-prazo-card.png",cardFile:"./assets/cards/04-temi-prazo-card.png",wideFile:"./assets/cards/04-temi-prazo-wide.png",
    title:"TEMI 2026: tarefa antes do conteúdo",caption:"31 de julho: documentos, status e comprovante para quem já se inscreveu.",
    alt:"Checklist em português para candidato TEMI 2026 conferir documentos, status e comprovante antes do prazo de 31 de julho.",
    source:"AMIB · Edital TEMI 2026",date:"2026-03-18",sourcePublishedAt:"2026-03-18T14:49:31-03:00",sourceUrl:"https://d1xe7tfg0uwul9.cloudfront.net/amib-portal/wp-content/uploads/2026/03/18144931/Edital-TEMI-2026-Atualizado.pdf",
    transcript:{question:"Qual ação tem maior prioridade para o inscrito?",evidence:"O edital atualizado contém prazo documental em 31/07.",practice:"Conferir portal, legibilidade, reenvio, status e comprovante.",limit:"Confirme retificações e sua situação individual."}
  },
  {
    id:"vt-ultrabaixo-cognicao",itemId:"pmid:42449426",
    file:"./assets/cards/05-vt-ultrabaixo-cognicao-card.png",cardFile:"./assets/cards/05-vt-ultrabaixo-cognicao-card.png",wideFile:"./assets/cards/05-vt-ultrabaixo-cognicao-wide.png",
    title:"Volume ultrabaixo e cérebro",caption:"Sobrevida semelhante; sinal cognitivo que não prova causalidade.",
    alt:"Infográfico em português sobre ventilação com volume corrente ultrabaixo, mortalidade em um ano e cautela na interpretação cognitiva.",
    source:"PubMed",date:"2026-07-14",sourcePublishedAt:"2026-07-14T12:00:00-03:00",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/42449426/",
    transcript:{question:"4 mL por kg melhora desfechos em um ano?",evidence:"Mortalidade semelhante; MoCA breve mediano 2 pontos menor entre sobreviventes do grupo ultrabaixo.",practice:"Individualize e monitore pH, CO₂, sincronia, sedação e cérebro.",limit:"Associação com hipercapnia não demonstra causalidade."}
  },
  {
    id:"visita-flexivel-delirium",itemId:"pmid:42432993",
    file:"./assets/cards/06-visita-flexivel-delirium-card.png",cardFile:"./assets/cards/06-visita-flexivel-delirium-card.png",wideFile:"./assets/cards/06-visita-flexivel-delirium-wide.png",
    title:"Família como intervenção estruturada",caption:"Menos delirium neste ensaio; contexto e implementação importam.",
    alt:"Infográfico em português sobre visita familiar flexível, delirium e uso seguro de familiares como parceiros de cuidado.",
    source:"J Int Med Res · PubMed",date:"2026-07-10",sourcePublishedAt:"2026-07-10T12:00:00-03:00",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/42432993/",
    transcript:{question:"Visita flexível reduz delirium?",evidence:"29,5% versus 44,4% em 405 idosos de uma UTI ortopédica.",practice:"Defina educação, higiene, participação segura e métricas locais.",limit:"Centro único e população específica; não é política universal."}
  },
  {
    id:"ia-nodulos-tc",itemId:"pmid:41848489",
    file:"./assets/cards/07-ia-nodulos-tc-card.png",cardFile:"./assets/cards/07-ia-nodulos-tc-card.png",wideFile:"./assets/cards/07-ia-nodulos-tc-wide.png",
    title:"IA detecta mais — e depois?",caption:"Mais nódulos e seguimentos, sem economia de tempo demonstrada.",
    alt:"Infográfico em português comparando detecção de nódulos, tempo de leitura e recomendações de seguimento com inteligência artificial.",
    source:"AJR · PubMed",date:"2026-07-15",sourcePublishedAt:"2026-07-15T12:00:00-03:00",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/41848489/",
    transcript:{question:"IA acelerou a TC e melhorou resultado clínico?",evidence:"Não reduziu tempo; aumentou Lung-RADS positivo e seguimentos.",practice:"Audite falsos positivos, exames adicionais, câncer confirmado e carga de trabalho.",limit:"Seguimento curto e nenhum câncer diagnosticado nos dois grupos."}
  },
  {
    id:"ia-avalia-ia",itemId:"pmid:42393197",
    file:"./assets/cards/08-ia-avalia-ia-card.png",cardFile:"./assets/cards/08-ia-avalia-ia-card.png",wideFile:"./assets/cards/08-ia-avalia-ia-wide.png",
    title:"Quem audita a IA clínica?",caption:"Automação para triagem; especialista para nuance e risco.",
    alt:"Infográfico em português sobre uso de inteligência artificial para pré-auditar outra IA com revisão médica de casos críticos.",
    source:"PubMed",date:"2026-07-02",sourcePublishedAt:"2026-07-02T12:00:00-03:00",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/42393197/",
    transcript:{question:"IA pode substituir o médico avaliador?",evidence:"Houve alinhamento direcional e eficiência, mas perda de nuances humanas.",practice:"Pré-audite, amostre, revise discordâncias e itens graves.",limit:"Nota automática não é prova de segurança clínica."}
  },
  {
    id:"aki-pocus-tolerancia",itemId:"pmid:42012891",
    file:"./assets/cards/09-aki-pocus-tolerancia-card.png",cardFile:"./assets/cards/09-aki-pocus-tolerancia-card.png",wideFile:"./assets/cards/09-aki-pocus-tolerancia-wide.png",
    title:"LRA: responde, precisa e tolera?",caption:"B-lines e VExUS mudaram condutas; desfecho clínico ainda não demonstrado.",
    alt:"Infográfico em português separando responsividade, necessidade e tolerância a fluidos em lesão renal aguda com POCUS.",
    source:"CJASN · PubMed",date:"2026-07-01",sourcePublishedAt:"2026-07-01T12:00:00-03:00",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/42012891/",
    transcript:{question:"POCUS de tolerância muda manejo na LRA?",evidence:"Mudou a intenção em 50% e aumentou diurético precoce no piloto de 80 pacientes.",practice:"Integre pulmão, veias, perfusão, necessidade e reavaliação.",limit:"Piloto não provou melhora de desfechos clínicos."}
  },
  {
    id:"west-nile",itemId:"who:west-nile-europe-2026-07-24",
    file:"./assets/cards/10-west-nile-card.png",cardFile:"./assets/cards/10-west-nile-card.png",wideFile:"./assets/cards/10-west-nile-wide.png",
    title:"Nilo Ocidental: reconhecer o raro grave",caption:"Viagem, mosquito e síndrome neurológica orientam suspeita.",
    alt:"Infográfico em português sobre triagem de vírus do Nilo Ocidental, exposição a mosquitos, viagem e sinais neurológicos graves.",
    source:"OMS Europa",date:"2026-07-24",sourcePublishedAt:"2026-07-24T11:00:00-03:00",sourceUrl:"https://www.who.int/europe/news/item/24-07-2026-west-nile-virus--as-cases-rise-across-parts-of-europe--here-is-what-you-need-to-know",
    transcript:{question:"Quando incluir Nilo Ocidental no diferencial?",evidence:"Doença neuroinvasiva grave ocorre em cerca de 1/150 infectados.",practice:"História de viagem/exposição, exame neurológico, suporte e vigilância local.",limit:"Dados europeus não estimam risco individual no Brasil."}
  }
];

const productVisuals=[
  {
    id:"produto-suporte-notebook",itemId:"commerce:shopee-suporte-notebook-11683006699",
    file:"./assets/products/01-suporte-notebook-card.png",cardFile:"./assets/products/01-suporte-notebook-card.png",wideFile:"./assets/products/01-suporte-notebook-wide.png",
    title:"Suporte de notebook: kit, não peça isolada",caption:"Preço datado, estabilidade, ventilação e periféricos antes da compra.",
    alt:"Guia visual em português para avaliar suporte dobrável de notebook, preço, estabilidade, ergonomia e necessidade de teclado externo.",
    source:"Shopee · conferência comercial",date:EDITORIAL_DAY,sourcePublishedAt:"2026-07-25T20:00:00-03:00",sourceUrl:"https://shopee.com.br/Apoio-Notebook-Suporte-Laptop-Ergonomico-Dobravel-em-alum%C3%ADnio-i.392264865.11683006699",
    transcript:{question:"O suporte resolve seu problema de mesa?",evidence:"Snapshot R$52,15; preço final e especificações precisam de confirmação.",practice:"Use com teclado/mouse externos e verifique estabilidade e ventilação.",limit:"Não garante postura perfeita, alívio de dor ou produtividade."}
  },
  {
    id:"produto-monitor-portatil",itemId:"commerce:amazon-monitor-bettdow-b0d6dt84jd",
    file:"./assets/products/02-monitor-portatil-card.png",cardFile:"./assets/products/02-monitor-portatil-card.png",wideFile:"./assets/products/02-monitor-portatil-wide.png",
    title:"Segunda tela com critério",caption:"Compatibilidade USB-C, energia, garantia e uso real definem valor.",
    alt:"Guia visual em português para avaliar monitor portátil Full HD, conexões USB-C, Mini HDMI, energia e fluxo de estudo.",
    source:"Amazon · conferência comercial",date:EDITORIAL_DAY,sourcePublishedAt:"2026-07-25T19:55:00-03:00",sourceUrl:"https://www.amazon.com.br/Bettdow-Portatil-Conectado-Inteligente-magn%C3%A9tico/dp/B0D6DT84JD",
    transcript:{question:"Uma segunda tela reduz troca de contexto?",evidence:"Especificações foram conferidas; preço atual não estava disponível.",practice:"Confirme DP Alt Mode, energia, brilho, garantia, peso e devolução.",limit:"Não há ganho de produtividade garantido."}
  },
  {
    id:"produto-fone-anc",itemId:"commerce:amazon-jbl-tune-770nc-b0c664nhv6",
    file:"./assets/products/03-fone-anc-card.png",cardFile:"./assets/products/03-fone-anc-card.png",wideFile:"./assets/products/03-fone-anc-wide.png",
    title:"ANC para estudar, nunca para perder vigilância",caption:"Conforto, volume seguro, modo ambiente e contexto antes da compra.",
    alt:"Guia visual em português para uso seguro de fone com cancelamento de ruído durante estudo e alerta para não usar isolado no plantão.",
    source:"Amazon · conferência comercial",date:EDITORIAL_DAY,sourcePublishedAt:"2026-07-25T19:50:00-03:00",sourceUrl:"https://www.amazon.com.br/JBL-Fone-Ouvido-770NC-Bluetooth/dp/B0C664NHV6",
    transcript:{question:"ANC ajuda sem comprometer segurança?",evidence:"A página confirma ANC e recursos; não havia oferta em destaque.",practice:"Use volume moderado e modo ambiente; não se isole no plantão ou trânsito.",limit:"Não trata TDAH nem garante foco."}
  }
];

const spotify=[
  {id:"deep-focus",title:"Deep focus study playlist 💻",mode:"Foco profundo",image:"https://image-cdn-ak.spotifycdn.com/image/ab67706c000097acee44a2a4b20099eadaa0e57e",url:"https://open.spotify.com/playlist/0oPyDVNdgcPFAWmOYSK7O1"},
  {id:"dark-academia",title:"Dark academia — instrumentais para leitura",mode:"Leitura densa",image:"https://image-cdn-ak.spotifycdn.com/image/ab67706c000097ac932313e5571ed8553403d7ad",url:"https://open.spotify.com/playlist/3MelsVnZV5g03wyiJsybHk"},
  {id:"peaceful-piano",title:"Peaceful Piano — estudo e recuperação",mode:"Recuperação cognitiva",image:"https://image-cdn-fa.spotifycdn.com/image/ab67706c0000bebb3a131f06c2865923a0f2ae01",url:"https://open.spotify.com/playlist/1u4F50HA53L3Jwxbnk9IeO"}
];

window.ANTIGRAVITY_RADAR={
  schemaVersion:"radar-v2",
  editionId:"2026-07-25",
  editionDate:EDITORIAL_DAY,
  generatedAt:RADAR_GENERATED_AT,
  updatedAt:RADAR_GENERATED_AT,
  lastScanAt:RADAR_GENERATED_AT,
  timezone:"America/Fortaleza",
  freshnessPolicy:"A edição abre todos os dias. Se não houver publicação relevante do próprio dia, o Radar mostra a fonte mais recente disponível sem alterar sua data original. Preço e estoque comercial sempre exibem o horário da conferência.",
  editorialNote:"Prioridade combina gravidade, aplicabilidade em UTI/Clínica, recência e qualidade da fonte. Ciência, contexto e comércio permanecem separados. Conteúdo comercial não é afiliado, não promete resultado e exige conferência de preço, vendedor, garantia e necessidade real.",
  commercialPolicy:"Sem links afiliados. Preço é snapshot, nunca promessa. Produto só entra com problema de uso, especificações conferíveis, limite, segurança e alternativa de não comprar.",
  priorities:[
    "TEMI: candidato já inscrito deve conferir documentos, status e comprovante antes de 31/07; prazo operacional vem antes de conteúdo novo.",
    "Na hipertensão intra-abdominal, um PLR negativo perde confiabilidade: diferencie responsividade, necessidade e tolerância a fluidos.",
    "Fumaça e alertas globais só entram quando traduzidos em anamnese, triagem, vigilância e impacto real na rotina."
  ],
  editions:[
    {
      id:"2026-07-25",date:EDITORIAL_DAY,label:"Edição de 25 de julho de 2026",
      generatedAt:RADAR_GENERATED_AT,lastUpdatedAt:RADAR_GENERATED_AT,
      itemIds:[...scientific,...geopolitics,...commercial].map(item=>item.id),
      visualIds:visuals.map(item=>item.id),visualPairCount:10,visualAssetCount:20,
      commercialIds:commercial.map(item=>item.id),
      productVisualIds:productVisuals.map(item=>item.id),productVisualPairCount:3,productVisualAssetCount:6
    }
  ],
  scientific,
  geopolitics,
  commercial,
  visuals,
  productVisuals,
  spotify
};
