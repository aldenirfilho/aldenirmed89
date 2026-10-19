// Conteúdo autoral para adultos, com casos sintéticos e sem doses prescritivas.
// Conferência: 18/10/2026. WHO 2026 identificada; recomendações de corticoide
// aqui atribuídas aos textos efetivamente verificados (WHO 2025 e NIH/HIV).
const module = 'tb-extra';
const numbered = (kind, n) => `${module}-${kind}${String(n).padStart(2, '0')}`;
const withModule = items => items.map(item => ({ ...item, module }));
const concepts = [
  {id:'tb-extra-amostras',label:'Sítio e amostra',comment:'O órgão define a investigação; preserve material para microbiologia e histologia.'},
  {id:'tb-extra-snc',label:'SNC e corticoide',comment:'Priorize a urgência e identifique fonte, população e duração do adjuvante.'},
  {id:'tb-extra-hidrocefalia',label:'Hidrocefalia e segurança',comment:'Piora neurológica exige buscar complicações e avaliar segurança da investigação.'},
  {id:'tb-extra-pericardite',label:'Pericardite e HIV',comment:'Separe tamponamento da decisão contextual sobre corticoide.'},
  {id:'tb-extra-pott',label:'Pott e compressão medular',comment:'Função neurológica nova e instabilidade vertebral definem prioridade.'},
  {id:'tb-extra-outros-sitios',label:'Outros sítios e riscos',comment:'Não generalize corticoide; avalie risco de Strongyloides sem atrasar urgências.'}
].map((concept,i)=>({...concept,module,caseIds:[numbered('c',i+1)],cardIds:[numbered('f',i*2+1),numbered('f',i*2+2)],particleIds:Array.from({length:4},(_,j)=>numbered('p',i*4+j+1))}));

export const TB_EXTRA_LEARNING = {
  module, clinicalStatus:'Prévia educacional — revisão médica formal pendente', concepts,
  cases: withModule([
    {id:'tb-extra-c01',topic:'Sítio e amostra',title:'Um fragmento, duas perguntas',level:2,
      stem:'Caso sintético. Adulto com linfonodomegalia persistente tem indicação de coleta de material. TB está no diferencial, junto a outras infecções e doença linfoproliferativa. A equipe planeja microbiologia e histologia.',
      question:'Qual cuidado pré-analítico preserva a investigação?',
      choices:[
        {text:'Colocar todo o material em formol, pois ele preserva também a cultura.',why:'Formol inviabiliza a investigação microbiológica por cultura; o material deve ser separado conforme orientação do laboratório.'},
        {text:'Considerar qualquer granuloma confirmação exclusiva de TB.',why:'Granulomas podem ocorrer em outras condições; histologia precisa ser integrada a microbiologia e contexto.'},
        {text:'Planejar porções apropriadas para microbiologia sem formol e para histologia, conforme o laboratório.',why:'Correto. A coleta deve responder a perguntas complementares sem inutilizar a amostra microbiológica.'},
        {text:'Dispensar pesquisa pulmonar porque a hipótese é ganglionar.',why:'TB pulmonar pode coexistir; a avaliação de outros sítios e de transmissibilidade depende do contexto.'}
      ],answer:2,takeaway:'A investigação começa antes da coleta: sítio, recipiente e finalidade precisam estar claros.',sources:['msCritical','whoDiagnosisHandbook','cdcTB']},
    {id:'tb-extra-c02',topic:'SNC e corticoide',title:'Duas fontes, durações diferentes',level:3,
      stem:'Caso sintético. Adulto com forte suspeita de meningite tuberculosa é avaliado no hospital. A equipe compara a recomendação WHO 2025 com a diretriz NIH para pessoas com HIV; quer registrar o papel adjuvante sem criar uma receita universal.',
      question:'Qual síntese preserva as diferenças das fontes?',
      choices:[
        {text:'Não existe indicação adjuvante de corticoide na meningite tuberculosa.',why:'A WHO 2025 recomenda o adjuvante; o NIH também o indica no SNC em pessoas com HIV.'},
        {text:'WHO 2025 recomenda dexametasona ou prednisolona com redução em 6–8 semanas; o NIH/HIV descreve esquema de 12 semanas.',why:'Correto. Fonte e população devem acompanhar a duração; o plano individual requer a equipe especializada.'},
        {text:'O texto WHO 2025 prova que o PDF WHO 2026 foi integralmente conferido.',why:'A edição 2026 foi identificada, mas não se deve atribuir a ela conferência integral de texto não acessado.'},
        {text:'Corticoide isolado pode preceder por dias o cuidado etiológico, até chegar a cultura.',why:'O adjuvante não substitui terapia antituberculosa nem justifica atrasar manejo urgente na forte suspeita grave.'}
      ],answer:1,takeaway:'Meningite: indicação adjuvante com fonte e população explícitas, junto ao tratamento da causa.',sources:['whoSteroids','nihTB','who2026','msCritical']},
    {id:'tb-extra-c03',topic:'Hidrocefalia e segurança',title:'A consciência piorou',level:3,
      stem:'Caso sintético. Adulto em investigação de TB do SNC apresenta redução do nível de consciência e sinais de hipertensão intracraniana. A equipe ainda não definiu a segurança de uma punção lombar.',
      question:'Qual prioridade é mais segura?',
      choices:[
        {text:'Reconhecer deterioração, priorizar neuroimagem e avaliação neurológica/neurocirúrgica, investigando hidrocefalia.',why:'Correto. Uma complicação do fluxo de líquor pode requerer manejo específico; a investigação liquórica depende de segurança clínica.'},
        {text:'Realizar punção lombar automaticamente em qualquer apresentação para não perder tempo.',why:'A indicação e a segurança precisam ser avaliadas; sinais de complicação não permitem uma regra automática.'},
        {text:'Apenas aumentar o corticoide e observar, pois ele substitui manejo da hidrocefalia.',why:'Corticoide não resolve toda causa de hipertensão intracraniana nem substitui a avaliação de hidrocefalia.'},
        {text:'Esperar o diagnóstico microbiológico final antes de avaliar o rebaixamento.',why:'Deterioração neurológica é uma emergência independentemente da confirmação etiológica final.'}
      ],answer:0,takeaway:'Piora neurológica muda a prioridade: buscar complicação, preservar segurança e acionar equipe.',sources:['msManual','idsaTB','nihTB']},
    {id:'tb-extra-c04',topic:'Pericardite e HIV',title:'O derrame não decide sozinho o adjuvante',level:3,
      stem:'Caso sintético. Adulto com HIV tem diagnóstico de pericardite tuberculosa. Está estável, sem tamponamento. A equipe discute corticoide e compara diretrizes.',
      question:'Qual afirmação descreve corretamente a evidência consultada?',
      choices:[
        {text:'Todas as diretrizes exigem corticoide em qualquer pericardite tuberculosa.',why:'Há divergência: WHO permite uso condicional; ATS/CDC/IDSA não recomenda rotina; NIH recomenda contra nessa indicação em HIV.'},
        {text:'A recomendação da meningite deve ser aplicada sem alteração à pericardite.',why:'Órgão, desfechos e população mudam a relação benefício-risco.'},
        {text:'A presença de líquido implica obrigatoriamente tamponamento.',why:'Tamponamento depende da repercussão hemodinâmica, não apenas da identificação do derrame.'},
        {text:'No HIV, NIH recomenda contra o adjuvante; WHO 2025 é condicional e ATS/CDC/IDSA não recomenda uso rotineiro.',why:'Correto. A divergência deve ficar visível; a avaliação hemodinâmica e o tratamento etiológico continuam necessários.'}
      ],answer:3,takeaway:'Pericardite: explicite HIV e diretriz; derrame e tamponamento são perguntas diferentes.',sources:['nihTB','whoSteroids','idsaTB']},
    {id:'tb-extra-c05',topic:'Pott e compressão medular',title:'Dor antiga, fraqueza nova',level:3,
      stem:'Caso sintético. Adulto com dor vertebral persistente e suspeita de doença de Pott desenvolve fraqueza nas pernas e retenção urinária. Ainda não há confirmação microbiológica.',
      question:'Qual achado muda a prioridade do atendimento?',
      choices:[
        {text:'A falta de confirmação permite aguardar consulta eletiva apesar do déficit novo.',why:'Déficit neurológico e alteração esfincteriana sugerem ameaça à medula e exigem avaliação urgente.'},
        {text:'A possibilidade de compressão medular exige imagem e equipe especializada de coluna/neurocirurgia com urgência.',why:'Correto. A função neurológica nova exige avaliação de compressão e instabilidade, sem aguardar deformidade avançada.'},
        {text:'Fraqueza deve ser atribuída à dor, sem exame neurológico.',why:'Atribuição inespecífica pode perder uma complicação potencialmente incapacitante.'},
        {text:'Corticoide isolado substitui investigação da estabilidade e do agente.',why:'Uma intervenção anti-inflamatória não substitui avaliação mecânica, tratamento etiológico e eventual intervenção especializada.'}
      ],answer:1,takeaway:'No Pott, fraqueza ou disfunção esfincteriana nova é alerta de função ameaçada.',sources:['msManual','idsaTB']},
    {id:'tb-extra-c06',topic:'Outros sítios e riscos',title:'Nem todo sítio recebe corticoide',level:2,
      stem:'Caso sintético. Adulto com TB pleural, sem SNC, pericardite ou outra indicação independente de corticoide, está em avaliação etiológica e tratamento. A proposta é acrescentar adjuvante para prevenir sequela pleural de rotina.',
      question:'Qual decisão é sustentada pelas fontes consultadas?',
      choices:[
        {text:'Indicar rotineiramente, porque toda TB extrapulmonar responde da mesma forma.',why:'Os sítios têm evidências diferentes; a recomendação da meningite não é universal.'},
        {text:'Usar ADA isoladamente para confirmar etiologia e justificar corticoide.',why:'ADA deve ser interpretada no contexto e não constitui, sozinha, indicação do adjuvante.'},
        {text:'Não usar adjuvante de rotina na pleurite; manter investigação e manejo específicos.',why:'Correto. Ensaios não sustentam uso rotineiro para prevenir sequelas pleurais; eventual outra indicação exige avaliação separada.'},
        {text:'Suspender a investigação porque o padrão linfocitário exclui neoplasia.',why:'Outras doenças podem produzir exsudato linfocitário; a hipótese exige integração diagnóstica.'}
      ],answer:2,takeaway:'Pleurite não herda a indicação de corticoide da meningite; o sítio delimita a recomendação.',sources:['idsaTB','msManual','whoSteroids']}
  ]),
  flashcards: withModule([
    {id:'tb-extra-f01',topic:'Sítio e amostra',front:'Por que não colocar todo tecido suspeito de TB em formol?',back:'A cultura exige material apropriado sem formol; planejar porções distintas para microbiologia e histologia.',pitfall:'Preservar a anatomia e perder a possibilidade de cultura.',sources:['msCritical'],level:1},
    {id:'tb-extra-f02',topic:'Sítio e amostra',front:'TB extrapulmonar exclui doença pulmonar concomitante?',back:'Não. Investigar coexistência conforme contexto e revisar transmissibilidade.',pitfall:'Retirar a hipótese pulmonar apenas porque há outro órgão acometido.',sources:['cdcTB'],level:1},
    {id:'tb-extra-f03',topic:'SNC e corticoide',front:'Qual recomendação de corticoide foi conferida na WHO 2025 para meningite?',back:'Dexametasona ou prednisolona adjuvante, com redução em 6–8 semanas, junto ao tratamento etiológico.',pitfall:'Apresentar o adjuvante como monoterapia ou atribuir leitura integral ao PDF 2026.',sources:['whoSteroids'],level:2},
    {id:'tb-extra-f04',topic:'SNC e corticoide',front:'O esquema NIH/HIV do SNC é idêntico à duração WHO 2025?',back:'Não. O NIH descreve 12 semanas; explicitar população e protocolo, sem fundir em duração universal.',pitfall:'Ocultar a diferença entre as fontes.',sources:['nihTB','whoSteroids'],level:3},
    {id:'tb-extra-f05',topic:'Hidrocefalia e segurança',front:'Qual complicação considerar na piora neurológica da TB do SNC?',back:'Hidrocefalia, entre outras complicações; neuroimagem e avaliação especializada são prioritárias.',pitfall:'Atribuir toda piora apenas à infecção ainda ativa.',sources:['msManual','idsaTB'],level:2},
    {id:'tb-extra-f06',topic:'Hidrocefalia e segurança',front:'Corticoide substitui avaliação da hidrocefalia ou torna toda punção segura?',back:'Não. O fluxo de líquor e a segurança dos procedimentos exigem avaliação própria.',pitfall:'Usar uma indicação farmacológica como autorização automática para um procedimento.',sources:['idsaTB','nihTB'],level:3},
    {id:'tb-extra-f07',topic:'Pericardite e HIV',front:'Corticoide é obrigatório em toda pericardite tuberculosa?',back:'Não. WHO 2025 permite uso condicional; ATS/CDC/IDSA não recomenda rotina e considera casos selecionados.',pitfall:'Apagar a baixa certeza e as diferenças de recomendação.',sources:['whoSteroids','idsaTB'],level:2},
    {id:'tb-extra-f08',topic:'Pericardite e HIV',front:'O que o NIH recomenda para corticoide na pericardite tuberculosa com HIV?',back:'Recomenda contra o adjuvante nessa indicação; não generalizar uma orientação de uso obrigatório.',pitfall:'Transportar a recomendação de outro sítio ou população.',sources:['nihTB'],level:3},
    {id:'tb-extra-f09',topic:'Pott e compressão medular',front:'Pott com fraqueza nova e alteração esfincteriana: qual prioridade?',back:'Avaliação urgente de compressão medular e estabilidade, com imagem e equipe especializada.',pitfall:'Aguardar deformidade ou confirmação final antes de avaliar o déficit.',sources:['idsaTB','msManual'],level:2},
    {id:'tb-extra-f10',topic:'Pott e compressão medular',front:'Dor vertebral isolada confirma etiologia tuberculosa?',back:'Não. Contexto, imagem e investigação etiológica são necessários; outras infecções e neoplasias podem imitar.',pitfall:'Nomear Pott sem investigar o diferencial.',sources:['msManual'],level:1},
    {id:'tb-extra-f11',topic:'Outros sítios e riscos',front:'Pleural ou ganglionar simples recebe corticoide de rotina?',back:'Não, sem indicação específica independente; o benefício da meningite não deve ser generalizado.',pitfall:'Tratar toda TB extrapulmonar com o mesmo adjuvante.',sources:['whoSteroids','idsaTB'],level:1},
    {id:'tb-extra-f12',topic:'Outros sítios e riscos',front:'Como conectar Strongyloides e corticoide na urgência do SNC?',back:'Avaliar exposição e mitigação do risco com a equipe, em paralelo ao tratamento urgente, sem atrasá-lo.',pitfall:'Ignorar hiperinfecção ou atrasar cuidado vital enquanto completa a investigação.',sources:['cdcStrongyloides','nihTB','msCritical'],level:3}
  ]),
  particles: withModule([
    {id:'tb-extra-p01',topic:'Sítio e amostra',phase:'contexto',title:'Localize antes de coletar',prompt:'A mesma amostra responde a toda suspeita de TB extrapulmonar?',answer:'Não. O sítio e os testes disponíveis orientam a coleta.',takeaway:'O órgão muda a pergunta diagnóstica.',sources:['whoDiagnosisHandbook'],level:1},
    {id:'tb-extra-p02',topic:'Sítio e amostra',phase:'mecanismo',title:'Preserve duas informações',prompt:'Por que microbiologia e histologia se complementam?',answer:'Investigam agente e padrão tecidual; exigem planejamento do material e recipiente.',takeaway:'O pré-analítico também decide o rendimento.',sources:['msCritical'],level:1},
    {id:'tb-extra-p03',topic:'Sítio e amostra',phase:'decisao',title:'Separe o material',prompt:'Tecido será coletado para cultura e histologia. Qual cuidado?',answer:'Separar material microbiológico sem formol e a porção histológica conforme o laboratório.',takeaway:'Não inutilize a cultura com fixador.',sources:['msCritical'],level:2},
    {id:'tb-extra-p04',topic:'Sítio e amostra',phase:'transferencia',title:'Volte ao pulmão',prompt:'Ter TB em um linfonodo encerra a avaliação torácica?',answer:'Não. Doença pulmonar concomitante e transmissibilidade ainda precisam ser consideradas.',takeaway:'Um órgão identificado não exclui outro.',sources:['cdcTB'],level:2},
    {id:'tb-extra-p05',topic:'SNC e corticoide',phase:'contexto',title:'Reconheça urgência',prompt:'Forte suspeita de TB do SNC permite aguardar todos os resultados finais?',answer:'Não. O manejo hospitalar oportuno deve ocorrer junto à investigação segura.',takeaway:'Cuidado urgente não espera cultura final.',sources:['nihTB','msCritical'],level:2},
    {id:'tb-extra-p06',topic:'SNC e corticoide',phase:'mecanismo',title:'Separe os alvos',prompt:'Qual o papel do corticoide na meningite tuberculosa?',answer:'Adjuvar o controle inflamatório; não substituir o tratamento da infecção.',takeaway:'Adjuvante exige tratamento etiológico concomitante.',sources:['whoSteroids'],level:1},
    {id:'tb-extra-p07',topic:'SNC e corticoide',phase:'decisao',title:'Atribua à fonte correta',prompt:'Qual duração foi conferida na WHO 2025?',answer:'Dexametasona ou prednisolona com redução em 6–8 semanas, conforme plano clínico.',takeaway:'Fonte e ano fazem parte da recomendação.',sources:['whoSteroids'],level:2},
    {id:'tb-extra-p08',topic:'SNC e corticoide',phase:'transferencia',title:'Mude a população',prompt:'O NIH para HIV descreve exatamente o mesmo esquema de duração?',answer:'Não. Descreve 12 semanas; definir o plano específico com a equipe, sem criar duração universal.',takeaway:'Não misture populações e protocolos.',sources:['nihTB'],level:3},
    {id:'tb-extra-p09',topic:'Hidrocefalia e segurança',phase:'contexto',title:'Perceba a mudança',prompt:'O que significa rebaixamento novo durante TB do SNC?',answer:'Um alerta para reavaliação imediata e busca de complicações.',takeaway:'A trajetória neurológica muda a prioridade.',sources:['msManual'],level:1},
    {id:'tb-extra-p10',topic:'Hidrocefalia e segurança',phase:'mecanismo',title:'Siga o líquor',prompt:'Como inflamação pode contribuir para hidrocefalia?',answer:'Pode prejudicar a circulação do líquor e causar repercussão intracraniana.',takeaway:'A complicação não é apenas microbiológica.',sources:['msManual','idsaTB'],level:2},
    {id:'tb-extra-p11',topic:'Hidrocefalia e segurança',phase:'decisao',title:'Acione avaliação especializada',prompt:'Piora de consciência e suspeita de hipertensão intracraniana: o que priorizar?',answer:'Neuroimagem e equipe neurológica/neurocirúrgica, avaliando segurança dos procedimentos.',takeaway:'A investigação precisa acompanhar a segurança clínica.',sources:['idsaTB','nihTB'],level:3},
    {id:'tb-extra-p12',topic:'Hidrocefalia e segurança',phase:'transferencia',title:'Não substitua intervenção',prompt:'O adjuvante torna desnecessário investigar hidrocefalia?',answer:'Não. Alteração do fluxo de líquor pode exigir manejo específico.',takeaway:'Uma intervenção não resolve todas as complicações.',sources:['idsaTB'],level:3},
    {id:'tb-extra-p13',topic:'Pericardite e HIV',phase:'contexto',title:'Faça duas perguntas',prompt:'Derrame pericárdico responde sozinho se há tamponamento e se cabe corticoide?',answer:'Não. Repercussão hemodinâmica e indicação adjuvante são avaliações diferentes.',takeaway:'Imagem, fisiologia e tratamento não são sinônimos.',sources:['msManual','idsaTB'],level:1},
    {id:'tb-extra-p14',topic:'Pericardite e HIV',phase:'mecanismo',title:'Observe o enchimento',prompt:'Por que um derrame pode tornar-se uma emergência?',answer:'Pode comprometer o enchimento cardíaco e a circulação.',takeaway:'Tamponamento exige resposta própria.',sources:['idsaTB'],level:2},
    {id:'tb-extra-p15',topic:'Pericardite e HIV',phase:'decisao',title:'Declare a divergência',prompt:'Como resumir WHO 2025 e ATS/CDC/IDSA sobre o adjuvante?',answer:'WHO permite uso condicional; ATS/CDC/IDSA não recomenda rotina e considera situações selecionadas.',takeaway:'Não apresentar uma recomendação universal.',sources:['whoSteroids','idsaTB'],level:2},
    {id:'tb-extra-p16',topic:'Pericardite e HIV',phase:'transferencia',title:'Inclua o HIV',prompt:'Qual diferença precisa aparecer para pessoa com HIV?',answer:'O NIH recomenda contra corticoide adjuvante na pericardite tuberculosa.',takeaway:'População muda a recomendação.',sources:['nihTB'],level:3},
    {id:'tb-extra-p17',topic:'Pott e compressão medular',phase:'contexto',title:'Examine a função',prompt:'Na dor vertebral suspeita, que mudança é especialmente urgente?',answer:'Déficit motor, sensitivo ou esfincteriano novo.',takeaway:'Procure função ameaçada.',sources:['idsaTB','msManual'],level:1},
    {id:'tb-extra-p18',topic:'Pott e compressão medular',phase:'mecanismo',title:'Conecte osso e canal',prompt:'Como lesão vertebral pode comprometer função neurológica?',answer:'Destruição e extensão adjacente podem causar instabilidade e compressão de estruturas neurais.',takeaway:'Há uma ameaça mecânica além da infecção.',sources:['msManual','idsaTB'],level:2},
    {id:'tb-extra-p19',topic:'Pott e compressão medular',phase:'decisao',title:'Não espere deformidade',prompt:'Fraqueza e retenção urinária surgem na suspeita de Pott. Qual prioridade?',answer:'Imagem e avaliação urgente de coluna/neurocirurgia para compressão e estabilidade.',takeaway:'Déficit novo não é acompanhamento eletivo.',sources:['idsaTB'],level:3},
    {id:'tb-extra-p20',topic:'Pott e compressão medular',phase:'transferencia',title:'Mantenha o diferencial',prompt:'Dor e alteração vertebral confirmam TB sozinhas?',answer:'Não. Outras infecções e neoplasias também precisam ser consideradas.',takeaway:'Urgência de avaliar não é certeza etiológica.',sources:['msManual'],level:2},
    {id:'tb-extra-p21',topic:'Outros sítios e riscos',phase:'contexto',title:'Evite uma regra única',prompt:'TB pleural ou ganglionar simples exige corticoide?',answer:'Não de rotina, na ausência de outra indicação específica.',takeaway:'Extrapulmonar não é indicação farmacológica única.',sources:['whoSteroids','idsaTB'],level:1},
    {id:'tb-extra-p22',topic:'Outros sítios e riscos',phase:'mecanismo',title:'Lembre do hospedeiro',prompt:'Por que perguntar por Strongyloides antes de imunossuprimir?',answer:'A exposição pode indicar risco de hiperinfecção e disseminação sob corticoide.',takeaway:'O adjuvante também pode ampliar risco infeccioso.',sources:['cdcStrongyloides'],level:2},
    {id:'tb-extra-p23',topic:'Outros sítios e riscos',phase:'decisao',title:'Avalie risco sem paralisar',prompt:'Como organizar esse risco quando o SNC está gravemente ameaçado?',answer:'Acionar equipe e investigar/mitigar em paralelo ao tratamento urgente, sem atrasá-lo.',takeaway:'Mitigação e urgência precisam ser conciliadas.',sources:['cdcStrongyloides','nihTB','msCritical'],level:3},
    {id:'tb-extra-p24',topic:'Outros sítios e riscos',phase:'transferencia',title:'Mude o sítio, revise a inferência',prompt:'ADA elevada na pleura ou linfonodo aumentado define corticoide?',answer:'Não. Interpretar a etiologia e procurar indicação específica, sem transferir a recomendação da meningite.',takeaway:'Achado diagnóstico não é indicação adjuvante automática.',sources:['msManual','whoSteroids','idsaTB'],level:3}
  ])
};
