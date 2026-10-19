// Casos sintéticos e sínteses autorais para adultos; não reproduzem prova oficial.
// Fontes primárias e base pulmonary-expansion-data.mjs conferidas em 18/10/2026.
const module = 'tb-pulmonar';
const numbered = (kind, n) => `${module}-${kind}${String(n).padStart(2, '0')}`;
const withModule = items => items.map(item => ({ ...item, module }));
const concepts = [
  {id:'tb-pulmonar-diagnostico',label:'Diagnóstico e limites',comment:'Combine suspeita, amostra e microbiologia; um resultado isolado tem limites.'},
  {id:'tb-pulmonar-transmissao',label:'Transmissão e precauções',comment:'Reconheça cedo e diferencie controle de fonte de proteção do profissional.'},
  {id:'tb-pulmonar-resistencia',label:'Combinação e resistência',comment:'Reavalie resistência, adesão, absorção e interações sem improvisar monoterapia.'},
  {id:'tb-pulmonar-gravidade',label:'Miliar e suporte de órgãos',comment:'Investigue TB disseminada em paralelo ao suporte da falência orgânica.'},
  {id:'tb-pulmonar-hemoptise',label:'Hemoptise ameaçadora',comment:'O impacto na via aérea, respiração e circulação define a urgência.'},
  {id:'tb-pulmonar-corticoide',label:'Corticoide e reavaliação',comment:'Exija uma indicação específica e não chame toda piora de IRIS.'}
].map((concept, i) => ({...concept,module,caseIds:[numbered('c',i+1)],cardIds:[numbered('f',i*2+1),numbered('f',i*2+2)],particleIds:Array.from({length:4},(_,j)=>numbered('p',i*4+j+1))}));

export const TB_PULMONAR_LEARNING = {
  module, clinicalStatus:'Prévia educacional — revisão médica formal pendente', concepts,
  cases: withModule([
    {id:'tb-pulmonar-c01',topic:'Diagnóstico e limites',title:'O primeiro teste veio negativo',level:2,
      stem:'Caso sintético. Adulto com tosse persistente, emagrecimento e cavidade pulmonar. O primeiro teste molecular de escarro é negativo; a suspeita clínica continua relevante e não há diagnóstico alternativo definido.',
      question:'Qual próximo passo evita encerrar a investigação cedo demais?',
      choices:[
        {text:'Reavaliar qualidade da amostra, completar investigação com cultura e exames dirigidos, mantendo diferenciais.',why:'Correto. Um resultado negativo isolado não exclui toda TB; amostra, carga bacilar e probabilidade pré-teste interferem na leitura.'},
        {text:'Excluir definitivamente TB, porque o teste molecular tem sensibilidade absoluta.',why:'Nenhum teste apresenta sensibilidade absoluta em todos os sítios e apresentações; a discordância precisa ser investigada.'},
        {text:'Confirmar TB apenas pela cavidade e dispensar microbiologia.',why:'Cavidades também ocorrem em micoses, neoplasias e outras infecções. A imagem não identifica sozinha o agente.'},
        {text:'Usar IGRA positivo como prova suficiente de TB pulmonar ativa.',why:'Teste de infecção não distingue sozinho infecção latente de doença ativa nem resolve a etiologia da lesão.'}
      ],answer:0,takeaway:'Suspeita persistente + teste negativo pedem revisão da investigação, sem diagnóstico automático por imagem.',sources:['whoDiagnosis','whoDiagnosisHandbook','cdcDiagnosis','msManual']},
    {id:'tb-pulmonar-c02',topic:'Transmissão e precauções',title:'A coleta ainda não aconteceu',level:1,
      stem:'Caso sintético. Adulto com suspeita de TB pulmonar transmissível aguarda coleta no pronto atendimento, próximo a outras pessoas. A equipe dispõe de protocolo institucional de precauções para aerossóis.',
      question:'Qual estratégia deve começar antes da confirmação?',
      choices:[
        {text:'Aguardar o resultado para evitar medidas desnecessárias.',why:'A suspeita já exige reconhecimento e controle de transmissão; esperar confirmação mantém exposição evitável.'},
        {text:'Organizar separação e ambiente, máscara no paciente para controle de fonte e PFF2/N95 apropriada ao profissional.',why:'Correto. Medidas administrativas, ambientais e proteção respiratória se complementam desde a suspeita.'},
        {text:'Colocar apenas máscara cirúrgica no profissional como equivalente ao respirador.',why:'Máscara cirúrgica não oferece a mesma função do respirador na precaução para aerossóis.'},
        {text:'Tratar infecção latente e TB pulmonar ativa como igualmente transmissíveis.',why:'Infecção latente não transmite; distinguir os estados é parte do controle de transmissão.'}
      ],answer:1,takeaway:'Controle de fonte e respirador têm funções complementares; proteção começa na suspeita.',sources:['cdcControl','cdcRespirator','cdcTB']},
    {id:'tb-pulmonar-c03',topic:'Combinação e resistência',title:'Piora não é sinônimo de resistência',level:3,
      stem:'Caso sintético. Adulto em tratamento combinado para TB apresenta evolução insatisfatória. Há vômitos, uso de outros medicamentos e dúvidas sobre doses realmente tomadas; o perfil de sensibilidade ainda está incompleto.',
      question:'Qual raciocínio é mais adequado?',
      choices:[
        {text:'Acrescentar um único fármaco empiricamente ao esquema que parece falhar.',why:'Modificar isoladamente uma combinação sem avaliação especializada pode produzir exposição inadequada e selecionar resistência.'},
        {text:'Afirmar que toda piora demonstra resistência adquirida.',why:'Adesão, absorção, interações, outro diagnóstico e complicações também podem explicar o quadro.'},
        {text:'Reavaliar esses fatores e completar a investigação de sensibilidade com a referência de TB.',why:'Correto. O esquema depende do agente e da exposição efetiva aos medicamentos, além do sítio e da função orgânica.'},
        {text:'Abandonar a combinação e escolher monoterapia até a cultura ficar pronta.',why:'Monoterapia improvisada não constitui estratégia segura para TB ativa; a equipe deve definir a combinação efetiva.'}
      ],answer:2,takeaway:'Investigue o motivo da falha aparente; não transforme incerteza em monoterapia ou acréscimo isolado.',sources:['whoDiagnosis','msCritical','idsaTB']},
    {id:'tb-pulmonar-c04',topic:'Miliar e suporte de órgãos',title:'Infiltrado difuso e choque',level:3,
      stem:'Caso sintético. Adulto imunossuprimido tem febre, infiltrado pulmonar difuso, hipoxemia progressiva e choque. A equipe considera TB miliar/disseminada entre as hipóteses, sem confirmação final.',
      question:'Qual prioridade reúne investigação e cuidado imediato?',
      choices:[
        {text:'Esperar cultura para iniciar qualquer suporte ou avaliação específica.',why:'Falência respiratória e choque exigem suporte imediato; investigação e tratamento oportuno não podem depender de cultura final.'},
        {text:'Excluir TB porque sua evolução nunca é aguda ou crítica.',why:'TB miliar e disseminada podem produzir insuficiência respiratória grave e falência de múltiplos órgãos.'},
        {text:'Prescrever corticoide automaticamente apenas pelo padrão miliar.',why:'O papel adjuvante na TB miliar é incerto; a gravidade não cria indicação universal independente do contexto.'},
        {text:'Acionar equipe intensiva, obter amostras e avaliar tratamento específico oportuno em paralelo ao suporte.',why:'Correto. O quadro exige sustentar órgãos e esclarecer a causa simultaneamente, incluindo busca de outros sítios.'}
      ],answer:3,takeaway:'TB também pode ser uma emergência intensiva. Etiologia e suporte são tarefas paralelas.',sources:['msCritical','cdcTB','idsaTB']},
    {id:'tb-pulmonar-c05',topic:'Hemoptise ameaçadora',title:'O volume é incerto, a ameaça não',level:3,
      stem:'Caso sintético. Adulto com suspeita de doença cavitária elimina sangue, não consegue limpar a via aérea e apresenta queda de oxigenação. O volume exato não foi medido.',
      question:'Qual interpretação orienta a prioridade?',
      choices:[
        {text:'Aguardar um volume mínimo universal antes de acionar ajuda.',why:'A repercussão respiratória já torna o sangramento ameaçador; estimar mililitros não deve atrasar o socorro.'},
        {text:'Reconhecer hemoptise ameaçadora e acionar equipe para proteção de via aérea e controle do sangramento.',why:'Correto. Comprometimento da via aérea, oxigenação ou circulação determina urgência mesmo sem quantificação precisa.'},
        {text:'Considerar gravidade apenas se houver hipotensão.',why:'Asfixia e falência respiratória podem ameaçar a vida antes de grande perda circulatória.'},
        {text:'Aplicar automaticamente à TB um limiar de volume publicado especificamente para FC.',why:'Limiar de outra população não substitui a avaliação funcional e contextual da hemoptise.'}
      ],answer:1,takeaway:'Impacto na via aérea e na troca gasosa pode ser mais urgente que a estimativa de volume.',sources:['cirseHemoptysis','cffEmergencies']},
    {id:'tb-pulmonar-c06',topic:'Corticoide e reavaliação',title:'Uma recomendação não serve para todos os sítios',level:2,
      stem:'Caso sintético. Adulto com TB pulmonar sem acometimento do SNC, pericardite ou outra indicação de corticoide está estável. Surge a proposta de acrescentar o adjuvante porque ele é recomendado na meningite tuberculosa.',
      question:'Qual é a melhor avaliação dessa proposta?',
      choices:[
        {text:'A indicação na meningite se aplica automaticamente a qualquer TB.',why:'O benefício é dependente do sítio e do contexto; não se transfere de forma universal para TB pulmonar simples.'},
        {text:'Corticoide substitui parte da terapia antituberculosa quando a inflamação é intensa.',why:'Controle inflamatório não elimina o bacilo nem substitui uma combinação efetiva.'},
        {text:'Não usar adjuvante rotineiro nessa forma; investigar uma indicação específica antes de considerá-lo.',why:'Correto. A recomendação para meningite não torna o adjuvante rotina na forma pulmonar sem outra indicação.'},
        {text:'Qualquer piora posterior permite chamar o quadro de IRIS e iniciar o adjuvante.',why:'IRIS exige contexto apropriado e exclusão de falha, resistência e outras infecções; piora isolada não confirma o diagnóstico.'}
      ],answer:2,takeaway:'Defina a indicação; não transplante a recomendação da meningite para toda TB.',sources:['whoSteroids','idsaTB','nihTB']}
  ]),
  flashcards: withModule([
    {id:'tb-pulmonar-f01',topic:'Diagnóstico e limites',front:'Teste molecular negativo exclui toda TB pulmonar?',back:'Não. Interprete qualidade da amostra, carga bacilar e probabilidade clínica; complete investigação quando a suspeita persiste.',pitfall:'Transformar um negativo isolado em exclusão absoluta.',sources:['whoDiagnosisHandbook'],level:1},
    {id:'tb-pulmonar-f02',topic:'Diagnóstico e limites',front:'IGRA ou teste tuberculínico confirma TB ativa?',back:'Não. Demonstram evidência de infecção, mas não separam sozinhos infecção latente de doença ativa.',pitfall:'Usar teste de infecção para explicar automaticamente uma cavidade.',sources:['cdcDiagnosis'],level:2},
    {id:'tb-pulmonar-f03',topic:'Transmissão e precauções',front:'Qual é o checkpoint para iniciar precauções na suspeita transmissível?',back:'O reconhecimento da suspeita, seguindo protocolo institucional; não aguardar confirmação final.',pitfall:'Manter exposição enquanto a coleta é organizada.',sources:['cdcControl'],level:1},
    {id:'tb-pulmonar-f04',topic:'Transmissão e precauções',front:'Máscara do paciente e respirador do profissional fazem a mesma coisa?',back:'Não. A primeira faz controle de fonte; PFF2/N95 apropriada protege o profissional no contexto de aerossóis.',pitfall:'Trocar o respirador por máscara cirúrgica na precaução aérea.',sources:['cdcRespirator'],level:1},
    {id:'tb-pulmonar-f05',topic:'Combinação e resistência',front:'Evolução inadequada prova resistência?',back:'Não. Reavalie sensibilidade, diagnóstico, adesão, absorção, interações e complicações.',pitfall:'Acrescentar um medicamento isolado antes de esclarecer a exposição efetiva.',sources:['whoDiagnosis','msCritical'],level:2},
    {id:'tb-pulmonar-f06',topic:'Combinação e resistência',front:'Por que o tratamento da TB ativa é combinado?',back:'A combinação apropriada atinge populações bacilares e ajuda a evitar seleção de resistência.',pitfall:'Improvisar monoterapia para aguardar um exame.',sources:['idsaTB'],level:1},
    {id:'tb-pulmonar-f07',topic:'Miliar e suporte de órgãos',front:'TB pode causar SDRA e choque?',back:'Sim. Formas miliar/disseminada podem produzir insuficiência respiratória e disfunção multiorgânica.',pitfall:'Excluir TB apenas porque a apresentação é crítica.',sources:['msCritical','cdcTB'],level:1},
    {id:'tb-pulmonar-f08',topic:'Miliar e suporte de órgãos',front:'Padrão miliar significa corticoide adjuvante obrigatório?',back:'Não. O benefício adjuvante isolado nessa apresentação permanece incerto; outras indicações precisam ser avaliadas.',pitfall:'Usar gravidade como indicação universal.',sources:['idsaTB'],level:2},
    {id:'tb-pulmonar-f09',topic:'Hemoptise ameaçadora',front:'É necessário medir o volume para reconhecer hemoptise ameaçadora?',back:'Não. Ameaça à via aérea, oxigenação ou circulação já determina urgência.',pitfall:'Esperar uma quantidade fixa apesar da deterioração.',sources:['cirseHemoptysis'],level:1},
    {id:'tb-pulmonar-f10',topic:'Hemoptise ameaçadora',front:'Por que hemoptise pode matar antes de grande perda sanguínea?',back:'O sangue pode comprometer via aérea e ventilação, causando asfixia e falência respiratória.',pitfall:'Avaliar apenas pressão arterial e hemoglobina.',sources:['cirseHemoptysis'],level:2},
    {id:'tb-pulmonar-f11',topic:'Corticoide e reavaliação',front:'TB pulmonar simples recebe corticoide adjuvante de rotina?',back:'Não, na ausência de uma indicação específica independente.',pitfall:'Aplicar a recomendação da meningite a qualquer sítio.',sources:['whoSteroids','idsaTB'],level:1},
    {id:'tb-pulmonar-f12',topic:'Corticoide e reavaliação',front:'O que excluir antes de atribuir a piora à TB-IRIS?',back:'Falha terapêutica, resistência e outras infecções, além de confirmar o contexto de reconstituição imune.',pitfall:'Chamar toda piora após tratamento de IRIS.',sources:['nihTB'],level:3}
  ]),
  particles: withModule([
    {id:'tb-pulmonar-p01',topic:'Diagnóstico e limites',phase:'contexto',title:'Defina a suspeita',prompt:'Tosse persistente e cavidade bastam para identificar o agente?',answer:'Não. Sustentam investigação, mas outros agentes e doenças também podem cavitar.',takeaway:'Imagem não identifica sozinha a etiologia.',sources:['msManual'],level:1},
    {id:'tb-pulmonar-p02',topic:'Diagnóstico e limites',phase:'mecanismo',title:'Entenda o negativo',prompt:'Por que um teste pode ser negativo apesar de doença?',answer:'Carga bacilar, sítio e qualidade da amostra afetam a detecção.',takeaway:'O teste precisa de contexto.',sources:['whoDiagnosisHandbook'],level:1},
    {id:'tb-pulmonar-p03',topic:'Diagnóstico e limites',phase:'decisao',title:'Continue de forma dirigida',prompt:'A suspeita continua após o primeiro negativo. Qual checkpoint?',answer:'Rever amostra e investigação complementar, incluindo cultura e diferenciais.',takeaway:'Persistência de suspeita pede revisão, não certeza por imagem.',sources:['whoDiagnosis'],level:2},
    {id:'tb-pulmonar-p04',topic:'Diagnóstico e limites',phase:'transferencia',title:'Separe infecção e doença',prompt:'Se o IGRA é positivo, a etiologia da cavidade fica resolvida?',answer:'Não. O teste não distingue sozinho infecção latente de doença ativa.',takeaway:'Uma pergunta diagnóstica exige o teste apropriado.',sources:['cdcDiagnosis'],level:3},
    {id:'tb-pulmonar-p05',topic:'Transmissão e precauções',phase:'contexto',title:'Reconheça antes do laudo',prompt:'Quando começa o controle da transmissão no serviço?',answer:'Na suspeita de TB transmissível, seguindo o protocolo local.',takeaway:'Não esperar confirmação para proteger.',sources:['cdcControl'],level:1},
    {id:'tb-pulmonar-p06',topic:'Transmissão e precauções',phase:'mecanismo',title:'Interrompa a exposição',prompt:'Por que ventilação e proteção respiratória se complementam?',answer:'O ambiente e o respirador atuam em etapas diferentes da exposição aérea.',takeaway:'Proteção é um conjunto de medidas.',sources:['cdcControl'],level:1},
    {id:'tb-pulmonar-p07',topic:'Transmissão e precauções',phase:'decisao',title:'Defina as funções',prompt:'Como organizar paciente e profissional na precaução aérea?',answer:'Controle de fonte no paciente e respirador PFF2/N95 apropriado ao profissional, além do ambiente.',takeaway:'Máscara cirúrgica e respirador não são equivalentes.',sources:['cdcRespirator'],level:2},
    {id:'tb-pulmonar-p08',topic:'Transmissão e precauções',phase:'transferencia',title:'Mude o estado clínico',prompt:'Infecção latente sem doença é transmissível?',answer:'Não. Não confundir infecção latente com TB pulmonar ativa transmissível.',takeaway:'Definir o estado evita medidas e rótulos indevidos.',sources:['cdcTB'],level:2},
    {id:'tb-pulmonar-p09',topic:'Combinação e resistência',phase:'contexto',title:'Faça a pergunta da falha',prompt:'Evolução ruim tem uma única explicação?',answer:'Não. Resistência é uma possibilidade entre problemas de exposição, diagnóstico e complicações.',takeaway:'Falha aparente exige diagnóstico do problema.',sources:['msCritical'],level:1},
    {id:'tb-pulmonar-p10',topic:'Combinação e resistência',phase:'mecanismo',title:'Proteja a combinação',prompt:'Por que evitar monoterapia improvisada?',answer:'Uma exposição inadequada pode selecionar bacilos resistentes e comprometer a eficácia.',takeaway:'Combinação precisa ser efetiva, não apenas numerosa.',sources:['idsaTB'],level:2},
    {id:'tb-pulmonar-p11',topic:'Combinação e resistência',phase:'decisao',title:'Revise a exposição real',prompt:'Vômitos e interações aparecem na piora. O que rever?',answer:'Adesão, absorção, interações, função orgânica e perfil de sensibilidade com a referência.',takeaway:'O medicamento prescrito pode não ser a exposição recebida.',sources:['msCritical','whoDiagnosis'],level:2},
    {id:'tb-pulmonar-p12',topic:'Combinação e resistência',phase:'transferencia',title:'Evite o acréscimo isolado',prompt:'Acrescentar apenas um fármaco resolve uma combinação em falha?',answer:'Não é estratégia para improvisar; a referência deve reconstruir um plano efetivo pelo contexto e sensibilidade.',takeaway:'Não transforme um resultado pendente em monoterapia funcional.',sources:['idsaTB'],level:3},
    {id:'tb-pulmonar-p13',topic:'Miliar e suporte de órgãos',phase:'contexto',title:'Inclua TB no crítico',prompt:'Hipoxemia difusa e choque excluem TB?',answer:'Não. TB miliar/disseminada pode ter apresentação intensiva.',takeaway:'A velocidade do quadro não exclui a etiologia.',sources:['msCritical'],level:1},
    {id:'tb-pulmonar-p14',topic:'Miliar e suporte de órgãos',phase:'mecanismo',title:'Conecte órgãos',prompt:'Por que procurar manifestações além do pulmão?',answer:'Disseminação pode envolver vários órgãos, inclusive o SNC.',takeaway:'O órgão ameaçado pode estar fora do tórax.',sources:['cdcTB'],level:1},
    {id:'tb-pulmonar-p15',topic:'Miliar e suporte de órgãos',phase:'decisao',title:'Trabalhe em paralelo',prompt:'O paciente piora enquanto a investigação está em andamento. Qual prioridade?',answer:'Suporte imediato, coleta possível e avaliação oportuna da terapia específica com equipe intensiva.',takeaway:'Suporte e investigação não são etapas mutuamente excludentes.',sources:['msCritical'],level:3},
    {id:'tb-pulmonar-p16',topic:'Miliar e suporte de órgãos',phase:'transferencia',title:'Não automatize o adjuvante',prompt:'A gravidade da forma miliar basta para corticoide universal?',answer:'Não. O benefício isolado é incerto; procure indicação específica e contexto.',takeaway:'Gravidade não substitui evidência por indicação.',sources:['idsaTB'],level:3},
    {id:'tb-pulmonar-p17',topic:'Hemoptise ameaçadora',phase:'contexto',title:'Olhe a repercussão',prompt:'O que torna a hemoptise imediatamente ameaçadora?',answer:'Comprometimento da via aérea, respiração ou circulação.',takeaway:'O paciente define a urgência.',sources:['cirseHemoptysis'],level:1},
    {id:'tb-pulmonar-p18',topic:'Hemoptise ameaçadora',phase:'mecanismo',title:'Pense em asfixia',prompt:'Por que a pressão pode estar preservada apesar de grande risco?',answer:'Sangue na via aérea pode prejudicar ventilação antes de choque hemorrágico.',takeaway:'Hemoptise é também uma emergência respiratória.',sources:['cirseHemoptysis'],level:2},
    {id:'tb-pulmonar-p19',topic:'Hemoptise ameaçadora',phase:'decisao',title:'Acione a equipe',prompt:'A pessoa não elimina sangue e dessatura. O volume está incerto. Esperar?',answer:'Não. Acionar resposta emergencial com capacidade de proteger via aérea e controlar a fonte.',takeaway:'A quantificação não deve atrasar socorro.',sources:['cirseHemoptysis'],level:3},
    {id:'tb-pulmonar-p20',topic:'Hemoptise ameaçadora',phase:'transferencia',title:'Evite importar cortes',prompt:'Um corte de volume específico para FC resolve a decisão na TB?',answer:'Não. População e repercussão precisam ser avaliadas; não aplicar o limiar automaticamente.',takeaway:'Conheça a população da recomendação.',sources:['cffEmergencies','cirseHemoptysis'],level:3},
    {id:'tb-pulmonar-p21',topic:'Corticoide e reavaliação',phase:'contexto',title:'Nomeie a indicação',prompt:'Corticoide acompanha toda TB pulmonar?',answer:'Não. A forma simples não tem indicação adjuvante rotineira sem outro motivo específico.',takeaway:'A indicação precisa aparecer antes do medicamento.',sources:['whoSteroids','idsaTB'],level:1},
    {id:'tb-pulmonar-p22',topic:'Corticoide e reavaliação',phase:'mecanismo',title:'Não confunda funções',prompt:'Reduzir inflamação substitui eliminar o bacilo?',answer:'Não. O adjuvante não substitui terapia antimicrobiana efetiva.',takeaway:'Controle inflamatório e controle etiológico têm funções distintas.',sources:['whoSteroids'],level:1},
    {id:'tb-pulmonar-p23',topic:'Corticoide e reavaliação',phase:'decisao',title:'Cheque antes de transferir',prompt:'Recomendação da meningite autoriza corticoide na forma pulmonar simples?',answer:'Não. Sítio e complicação delimitam a indicação.',takeaway:'Não transfira uma recomendação para todas as apresentações.',sources:['whoSteroids','idsaTB'],level:2},
    {id:'tb-pulmonar-p24',topic:'Corticoide e reavaliação',phase:'transferencia',title:'Piora pede nova investigação',prompt:'Após início de terapias, toda piora em pessoa com HIV é TB-IRIS?',answer:'Não. Confirmar o contexto e excluir falha, resistência e outras infecções antes de atribuir à IRIS.',takeaway:'A cronologia ajuda, mas não fecha o diagnóstico.',sources:['nihTB'],level:3}
  ])
};
