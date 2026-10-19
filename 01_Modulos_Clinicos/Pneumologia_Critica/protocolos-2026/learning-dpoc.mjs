// Conteúdo educacional autoral: casos sintéticos, sem vínculo com questões oficiais.
// Conferência de fontes: 18/10/2026. GOLD 2026 e ERS/ATS; decisões individuais
// exigem contexto clínico. Não acrescenta doses nem prescrição ao módulo aprovado.
export const DPOC_LEARNING = {
  cases: [
    {
      id:'dpoc-c01',topic:'Diagnóstico',title:'A razão está perto do corte',
      stem:'Pessoa de 61 anos, exposição tabágica e dispneia crônica. Espirometria tecnicamente adequada: VEF₁/CVF pós-broncodilatador 0,68. É a primeira avaliação; não há descompensação aguda.',
      question:'Qual próximo passo respeita o GOLD e a incerteza do exame?',
      choices:[
        {text:'Confirmar definitivamente DPOC apenas porque a razão é menor que 0,70.',why:'O corte indica obstrução nessa medida, mas a faixa de 0,60 a 0,80 exige confirmação em outra ocasião e contexto clínico.'},
        {text:'Integrar o contexto e repetir a espirometria em outra ocasião para confirmar a obstrução.',why:'Correto. A variabilidade pode mudar a classificação perto do corte; a causa da obstrução também depende da avaliação clínica.'},
        {text:'Excluir DPOC porque 0,68 é maior que 0,60.',why:'0,60 não é o corte diagnóstico. É parte da faixa em que a repetição ajuda a confirmar presença ou ausência de obstrução.'},
        {text:'Usar apenas a tomografia para substituir a confirmação funcional.',why:'A imagem pode esclarecer fenótipos e diagnósticos alternativos, mas não substitui a espirometria na confirmação usual da obstrução.'}
      ],answer:1,takeaway:'Obstrução medida + contexto + confirmação quando indicada. Um número isolado não encerra o diagnóstico.',sources:['gold'],level:1
    },
    {
      id:'dpoc-c02',topic:'Classificação',title:'Poucos sintomas, um evento importante',
      stem:'Pessoa de 67 anos com DPOC confirmada, sem manutenção prévia. VEF₁ 45% do previsto, CAAT 4 e uma exacerbação moderada nos últimos 12 meses; nenhuma grave.',
      question:'Qual combinação descreve corretamente os dois eixos?',
      choices:[
        {text:'GOLD 3 e grupo A.',why:'O grau 3 está correto, mas o grupo A exige zero exacerbações moderadas ou graves no GOLD 2026.'},
        {text:'GOLD 2 e grupo E.',why:'O grupo E está correto. VEF₁ de 45% pertence ao grau 3, e não ao grau 2.'},
        {text:'GOLD 3 e grupo B porque há dispneia.',why:'Sintomas não anulam a história de exacerbação. Uma moderada já direciona ao grupo E em 2026.'},
        {text:'GOLD 3 e grupo E.',why:'Correto. VEF₁ de 30% a menos de 50% define grau 3; uma exacerbação moderada ou grave define E, independentemente do CAAT.'}
      ],answer:3,takeaway:'VEF₁ descreve obstrução. A/B/E organiza sintomas e eventos; uma moderada já conta para E.',sources:['gold'],level:1
    },
    {
      id:'dpoc-c03',topic:'CI e eosinófilos',title:'Eosinófilos baixos, asma confirmada',
      stem:'Pessoa de 58 anos tem DPOC e diagnóstico concomitante confirmado de asma. Usa LABA + LAMA e apresenta eosinófilos de 70 células/µL. A equipe revisa a manutenção.',
      question:'Qual princípio deve permanecer explícito na decisão?',
      choices:[
        {text:'A asma concomitante exige considerar sua diretriz e incluir CI, com revisão médica do esquema.',why:'Correto. A indicação de CI pela asma não desaparece porque o eosinófilo está abaixo de 100.'},
        {text:'Eosinófilos abaixo de 100 proíbem CI em qualquer doença.',why:'Esse valor sinaliza menor benefício preventivo esperado de CI na DPOC; não é contraindicação absoluta nem revoga a indicação pela asma.'},
        {text:'Apenas eosinófilos acima de 300 permitem reconhecer asma.',why:'Eosinofilia isolada não confirma asma e sua ausência não exclui o diagnóstico já estabelecido.'},
        {text:'Manter o raciocínio exclusivo de DPOC e ignorar a asma na escolha.',why:'Asma concomitante modifica a necessidade de CI e deve permanecer visível mesmo quando técnica e adesão ainda estão em revisão.'}
      ],answer:0,takeaway:'CI depende da doença e do contexto. Eosinófilos ajudam a estimar benefício na DPOC; não são um diagnóstico de asma.',sources:['gold'],level:2
    },
    {
      id:'dpoc-c04',topic:'Reavaliação',title:'O dispositivo não entrega o tratamento esperado',
      stem:'Pessoa de 72 anos usa LABA + LAMA, relata dispneia persistente e não teve exacerbações no último ano. Ao demonstrar o uso do inalador, erra etapas essenciais; a adesão também é irregular.',
      question:'Qual prioridade torna o ajuste mais coerente?',
      choices:[
        {text:'Acrescentar CI exclusivamente pela dispneia, sem revisar o uso do dispositivo.',why:'Dispneia isolada não é justificativa suficiente para adicionar CI; falhas de técnica e adesão precisam ser corrigidas.'},
        {text:'Prescrever antibiótico porque a dispneia continua apesar da manutenção.',why:'Dispneia persistente não demonstra infecção bacteriana nem preenche, sozinha, a árvore de antibiótico da exacerbação.'},
        {text:'Corrigir técnica e adesão, avaliar reabilitação e investigar outras causas de dispneia.',why:'Correto. Confirmar a entrega do tratamento e os fatores modificáveis antecede escalonamento; comorbidades podem explicar sintomas.'},
        {text:'Usar o grupo A/B/E inicial para reiniciar automaticamente toda a manutenção.',why:'Quem já usa tratamento segue o algoritmo de seguimento a partir do esquema atual e do problema predominante.'}
      ],answer:2,takeaway:'Antes de aumentar o esquema, confirme o uso real e o problema que precisa ser tratado.',sources:['gold'],level:2
    },
    {
      id:'dpoc-c05',topic:'Oxigênio e VNI',title:'Gasometria e esforço contam juntos',
      stem:'Pessoa de 69 anos com exacerbação mantém esforço respiratório após medidas iniciais. pH arterial 7,29 e PaCO₂ 70 mmHg. Está acordada, cooperativa, com secreções manejáveis, sem choque ou ameaça imediata à via aérea.',
      question:'Qual estratégia deve ser avaliada prioritariamente?',
      choices:[
        {text:'Aguardar todos os exames e o resultado de cultura antes de avaliar suporte ventilatório.',why:'A acidose hipercápnica e o esforço já indicam necessidade de avaliação imediata; completar o formulário não pode atrasar suporte.'},
        {text:'Avaliar VNI em ambiente monitorado, com reavaliação precoce e acesso à intubação se houver falha.',why:'Correto. O cenário combina acidose hipercápnica, esforço persistente e elegibilidade descrita; a resposta clínica e gasométrica deve orientar a continuidade.'},
        {text:'Preferir sempre alto fluxo, independentemente de acidose e trajetória.',why:'Alto fluxo não é substituto universal da VNI na insuficiência hipercápnica acidótica.'},
        {text:'Considerar PaCO₂ elevada uma ordem automática de intubação em qualquer paciente.',why:'O suporte depende de fisiologia, via aérea, contraindicações e resposta. Hipercapnia isolada não determina automaticamente a modalidade.'}
      ],answer:1,takeaway:'Acidose + hipercapnia + contexto orientam VNI. Falha, deterioração ou via aérea ameaçada exigem outra avaliação sem demora.',sources:['gold','niv'],level:3
    },
    {
      id:'dpoc-c06',topic:'Exacerbação e antibiótico',title:'A febre entra na combinação de 2026',
      stem:'Pessoa de 64 anos com DPOC apresenta escarro mais purulento e febre durante piora respiratória. Está em avaliação, sem dados suficientes para excluir pneumonia. Alergias, culturas e epidemiologia local ainda serão revistas.',
      question:'Qual leitura dos critérios está correta?',
      choices:[
        {text:'Febre nunca participa da avaliação de antibiótico na exacerbação.',why:'O texto GOLD 2026 inclui febre como sintoma adicional quando há aumento de purulência.'},
        {text:'Toda exacerbação de DPOC deve receber o mesmo antimicrobiano.',why:'Etiologia, gravidade, alergias, função orgânica e resistência local impedem uma escolha universal.'},
        {text:'A combinação prova exacerbação isolada e dispensa procurar pneumonia.',why:'Pneumonia pode coexistir ou explicar o quadro. O critério terapêutico não fecha o diagnóstico diferencial.'},
        {text:'Purulência + febre preenchem a combinação sintomática para avaliar antibiótico; investigar pneumonia e selecionar pelo contexto.',why:'Correto. Cultura positiva em exacerbação prévia ou necessidade de ventilação também são caminhos de indicação, com interpretação clínica.'}
      ],answer:3,takeaway:'Reconheça o critério; depois escolha com contexto. Antibiótico não substitui a busca do diagnóstico e da gravidade.',sources:['gold'],level:3
    }
  ],
  flashcards: [
    {id:'dpoc-f01',topic:'Diagnóstico',front:'VEF₁/CVF pós-BD <0,70 basta, sozinho, para encerrar o diagnóstico?',back:'Não. O achado deve ser integrado a sintomas, exposições, qualidade do exame e diagnósticos alternativos.',pitfall:'Confundir um corte funcional com a causa da obstrução.',sources:['gold'],level:1},
    {id:'dpoc-f02',topic:'Diagnóstico',front:'O que fazer com razão pós-BD entre 0,60 e 0,80?',back:'Confirmar presença ou ausência de obstrução com repetição em outra ocasião, no contexto clínico.',pitfall:'Pedir repetição apenas quando a primeira razão está abaixo de 0,70.',sources:['gold'],level:2},
    {id:'dpoc-f03',topic:'Classificação',front:'Uma exacerbação moderada e CAAT baixo: qual grupo em 2026?',back:'Grupo E. A/B exigem zero exacerbações moderadas ou graves nos últimos 12 meses.',pitfall:'Manter a antiga exigência de duas moderadas para reconhecer E.',sources:['gold'],level:1},
    {id:'dpoc-f04',topic:'Classificação',front:'VEF₁ de 45% permite saber o grupo A/B/E?',back:'Permite reconhecer GOLD 3. A/B/E exige história de eventos e avaliação de sintomas, conforme o cenário.',pitfall:'Usar gravidade espirométrica como substituto da história clínica.',sources:['gold'],level:2},
    {id:'dpoc-f05',topic:'CI e eosinófilos',front:'Eosinófilos <100 excluem CI se há asma concomitante confirmada?',back:'Não. Asma requer CI. Na DPOC, o eosinófilo estima o benefício preventivo, junto à história de exacerbações.',pitfall:'Transformar um biomarcador em proibição absoluta.',sources:['gold'],level:2},
    {id:'dpoc-f06',topic:'CI e eosinófilos',front:'Onde entram os valores 100 e 300 células/µL?',back:'No seguimento com exacerbação em LABA/LAMA, ≥100 favorece considerar tripla; na terapia inicial do grupo E, ≥300 favorece considerar tripla.',pitfall:'Tratar início e seguimento como o mesmo algoritmo ou diagnóstico.',sources:['gold'],level:3},
    {id:'dpoc-f07',topic:'Reavaliação',front:'Dispneia persistente: qual revisão vem antes de escalar?',back:'Técnica, adesão, dispositivo, acesso, medidas não farmacológicas e outras causas de dispneia.',pitfall:'Chamar de falha farmacológica um tratamento que não foi usado adequadamente.',sources:['gold'],level:1},
    {id:'dpoc-f08',topic:'Reavaliação',front:'Prevenção de exacerbação termina no inalador?',back:'Não. Cessação tabágica, vacinas elegíveis, atividade física, reabilitação e plano de ação também integram o cuidado.',pitfall:'Reduzir prevenção a acrescentar medicamentos.',sources:['gold'],level:2},
    {id:'dpoc-f09',topic:'Oxigênio e VNI',front:'PaCO₂ 60 mmHg e pH 7,40 indicam VNI automaticamente?',back:'Não. Há hipercapnia sem o par acidótico; avaliar basal, esforço, fadiga, hipoxemia e evolução.',pitfall:'Usar PaCO₂ isolada para escolher suporte.',sources:['gold','niv'],level:2},
    {id:'dpoc-f10',topic:'Oxigênio e VNI',front:'Qual a meta habitual de SpO₂ na exacerbação e qual o checkpoint?',back:'88–92%, titulando oxigênio e reavaliando gasometria e resposta clínica.',pitfall:'Buscar saturação máxima sem acompanhar retenção de CO₂ ou acidose.',sources:['niv'],level:2},
    {id:'dpoc-f11',topic:'Exacerbação e antibiótico',front:'Purulência + febre entra na árvore GOLD 2026 de antibiótico?',back:'Sim. Purulência + dispneia, febre ou volume é uma combinação para avaliar antibiótico; cultura prévia positiva ou ventilação são outros caminhos.',pitfall:'Esquecer a febre ou aplicar antibiótico a toda piora respiratória.',sources:['gold'],level:2},
    {id:'dpoc-f12',topic:'Exacerbação e antibiótico',front:'Critério de antibiótico exclui pneumonia ou determina o agente?',back:'Não. Investigue diagnósticos coexistentes e selecione tratamento conforme gravidade, culturas, alergias e protocolo local.',pitfall:'Confundir indicação de avaliar tratamento com prescrição individual pronta.',sources:['gold'],level:3}
  ],
  particles: [
    {id:'dpoc-p01',topic:'Diagnóstico',phase:'contexto',title:'Comece pela pergunta clínica',prompt:'Dispneia crônica e exposição tornam DPOC uma possibilidade. O que ainda falta?',answer:'Confirmar a obstrução e avaliar se o conjunto é compatível com DPOC.',takeaway:'Possibilidade clínica não é confirmação.',sources:['gold'],level:1},
    {id:'dpoc-p02',topic:'Diagnóstico',phase:'mecanismo',title:'Um corte, alguma variabilidade',prompt:'Por que 0,69 e 0,71 não devem ser lidos sem contexto?',answer:'A medida varia biologicamente. Perto do corte, repetir ajuda a confirmar a classificação.',takeaway:'O corte organiza a avaliação; não elimina a incerteza.',sources:['gold'],level:1},
    {id:'dpoc-p03',topic:'Diagnóstico',phase:'decisao',title:'Escolha o próximo exame útil',prompt:'Razão pós-BD 0,68 em primeira avaliação estável. Qual o próximo checkpoint?',answer:'Repetir em outra ocasião e integrar qualidade do exame, sintomas, exposições e diferenciais.',takeaway:'Na faixa 0,60–0,80, confirme antes de encerrar o raciocínio.',sources:['gold'],level:2},
    {id:'dpoc-p04',topic:'Diagnóstico',phase:'transferencia',title:'Quando a primeira medida é 0,74',prompt:'A mesma cautela vale se a primeira razão não demonstra obstrução?',answer:'Sim. A faixa 0,60–0,80 inclui confirmação de presença ou ausência, se a avaliação clínica sustenta a investigação.',takeaway:'Repetição não é exclusiva de resultados abaixo de 0,70.',sources:['gold'],level:3},

    {id:'dpoc-p05',topic:'Classificação',phase:'contexto',title:'Separe três informações',prompt:'VEF₁, sintomas e exacerbações respondem à mesma pergunta?',answer:'Não. Descrevem obstrução, impacto percebido e história de eventos.',takeaway:'Organize os eixos antes de escolher o algoritmo.',sources:['gold'],level:1},
    {id:'dpoc-p06',topic:'Classificação',phase:'mecanismo',title:'Um evento já revela risco',prompt:'Por que poucos sintomas não mantêm o paciente no grupo A após uma exacerbação moderada?',answer:'A classificação de 2026 valoriza o risco associado ao evento, mesmo com baixa carga sintomática.',takeaway:'A história de eventos pode prevalecer sobre sintomas baixos.',sources:['gold'],level:2},
    {id:'dpoc-p07',topic:'Classificação',phase:'decisao',title:'Classifique sem misturar',prompt:'DPOC confirmada, VEF₁ 45%, CAAT 4 e uma moderada no ano: como registrar?',answer:'GOLD 3 e grupo E.',takeaway:'Grau espirométrico e grupo clínico coexistem.',sources:['gold'],level:2},
    {id:'dpoc-p08',topic:'Classificação',phase:'transferencia',title:'A escala ainda não chegou',prompt:'Há uma exacerbação grave conhecida, mas CAAT e mMRC não foram aferidos. O grupo E depende desses escores?',answer:'Não. O evento já define E; registre que a carga sintomática continua pendente.',takeaway:'Dado pendente não apaga um critério positivo conhecido.',sources:['gold'],level:3},

    {id:'dpoc-p09',topic:'CI e eosinófilos',phase:'contexto',title:'Identifique a doença que pede CI',prompt:'Antes de interpretar eosinófilos, qual diagnóstico concomitante muda a necessidade de CI?',answer:'Asma concomitante confirmada.',takeaway:'A indicação de CI também depende do diagnóstico.',sources:['gold'],level:1},
    {id:'dpoc-p10',topic:'CI e eosinófilos',phase:'mecanismo',title:'Biomarcador de benefício',prompt:'O que os eosinófilos ajudam a estimar na DPOC?',answer:'A magnitude do benefício preventivo esperado de CI, integrado às exacerbações e ao risco de efeitos adversos.',takeaway:'Benefício é um gradiente, não um diagnóstico.',sources:['gold'],level:2},
    {id:'dpoc-p11',topic:'CI e eosinófilos',phase:'decisao',title:'Situe o valor no algoritmo',prompt:'Exacerbação em LABA/LAMA, eosinófilos 180/µL e técnica revisada. Qual discussão cabe?',answer:'Considerar tripla com CI, ponderando benefício, risco e contexto clínico.',takeaway:'O corte de seguimento não é o mesmo da terapia inicial do grupo E.',sources:['gold'],level:2},
    {id:'dpoc-p12',topic:'CI e eosinófilos',phase:'transferencia',title:'O número não cancela a asma',prompt:'Se há asma confirmada e eosinófilos 70/µL, o CI fica automaticamente excluído?',answer:'Não. A asma mantém sua indicação de CI; revisar o esquema com o médico.',takeaway:'Não transforme eosinófilos baixos em regra absoluta.',sources:['gold'],level:3},

    {id:'dpoc-p13',topic:'Reavaliação',phase:'contexto',title:'Qual problema persiste?',prompt:'No retorno, o alvo principal é dispneia, exacerbação ou ambos?',answer:'Defina o problema predominante e parta da manutenção atual; se ambos exigem intervenção, priorize a via de exacerbações.',takeaway:'Seguimento começa pelo problema atual.',sources:['gold'],level:1},
    {id:'dpoc-p14',topic:'Reavaliação',phase:'mecanismo',title:'Entrega também é tratamento',prompt:'Por que uma técnica inadequada pode parecer falta de resposta?',answer:'O uso incorreto compromete a entrega esperada; adesão irregular reduz a exposição ao tratamento.',takeaway:'Antes de escalar, veja a pessoa usar o dispositivo.',sources:['gold'],level:1},
    {id:'dpoc-p15',topic:'Reavaliação',phase:'decisao',title:'Corrija o que é modificável',prompt:'Dispneia em LABA/LAMA, sem exacerbações, com erros de técnica. Qual prioridade?',answer:'Corrigir técnica e adesão, avaliar reabilitação e investigar outras causas; CI não é adicionado só por dispneia.',takeaway:'Sintoma persistente não equivale a indicação automática de CI.',sources:['gold'],level:2},
    {id:'dpoc-p16',topic:'Reavaliação',phase:'transferencia',title:'Mantenha o ciclo após a melhora',prompt:'Após melhorar, qual revisão evita que o cuidado vire uma receita estática?',answer:'Rever sintomas, eventos, técnica, adesão, exposições, prevenção e plano de ação nas consultas.',takeaway:'Reavaliar é parte contínua do tratamento.',sources:['gold'],level:3},

    {id:'dpoc-p17',topic:'Oxigênio e VNI',phase:'contexto',title:'Reconheça a prioridade',prompt:'Na exacerbação, o que vem antes de completar um formulário?',answer:'Reconhecer instabilidade, ameaça à via aérea, hipoxemia e falência ventilatória.',takeaway:'Suporte não espera campos administrativos.',sources:['gold','niv'],level:1},
    {id:'dpoc-p18',topic:'Oxigênio e VNI',phase:'mecanismo',title:'Oxigênio tem efeitos fisiológicos',prompt:'Hipercapnia por oxigênio se explica apenas por perder o estímulo hipóxico?',answer:'Não. Alterações de ventilação/perfusão e efeito Haldane também participam; a importância relativa varia.',takeaway:'Compreender o mecanismo reforça a titulação, não a recusa de O₂ na hipoxemia.',sources:['oxygen_phys'],level:2},
    {id:'dpoc-p19',topic:'Oxigênio e VNI',phase:'decisao',title:'Integre os dados',prompt:'pH 7,29, PaCO₂ 70 e esforço persistente após medidas iniciais: qual discussão é urgente?',answer:'Avaliar VNI, elegibilidade, monitorização e possibilidade imediata de intubação se falhar.',takeaway:'A gasometria orienta; segurança e evolução completam a decisão.',sources:['gold','niv'],level:2},
    {id:'dpoc-p20',topic:'Oxigênio e VNI',phase:'transferencia',title:'Mude um dado, revise a conclusão',prompt:'Na avaliação inicial, antes de iniciar VNI, pH 7,40 com PaCO₂ 60 indica VNI automaticamente?',answer:'Não. Reavalie basal, esforço, fadiga, oxigenação e trajetória; PaCO₂ isolada não decide suporte. Este exemplo não define retirada de VNI já iniciada.',takeaway:'Hipercapnia e acidose não são sinônimos. Indicação inicial e retirada do suporte são decisões diferentes.',sources:['gold','niv'],level:3},

    {id:'dpoc-p21',topic:'Exacerbação e antibiótico',phase:'contexto',title:'Piora não tem causa única',prompt:'Toda piora respiratória na DPOC é uma exacerbação bacteriana?',answer:'Não. Pneumonia, IC, TEP e pneumotórax podem coexistir ou produzir sintomas semelhantes.',takeaway:'Procure gravidade, gatilho e mimetizadores.',sources:['gold'],level:1},
    {id:'dpoc-p22',topic:'Exacerbação e antibiótico',phase:'mecanismo',title:'Critério não é certeza etiológica',prompt:'O que a combinação de purulência com outro sintoma oferece?',answer:'Uma base clínica para avaliar antibiótico; não prova sozinha qual agente está presente.',takeaway:'A indicação não elimina a incerteza microbiológica.',sources:['gold'],level:2},
    {id:'dpoc-p23',topic:'Exacerbação e antibiótico',phase:'decisao',title:'Use a árvore de 2026',prompt:'Purulência aumentada e febre: há combinação sintomática para avaliar antibiótico?',answer:'Sim. Dispneia ou aumento de volume também podem acompanhar a purulência; cultura positiva prévia ou ventilação são caminhos adicionais.',takeaway:'Inclua a febre; não aplique apenas a regra antiga.',sources:['gold'],level:2},
    {id:'dpoc-p24',topic:'Exacerbação e antibiótico',phase:'transferencia',title:'Quando aparece consolidação',prompt:'Se a investigação sugere pneumonia, basta repetir a árvore da exacerbação?',answer:'Não. Reavaliar como PAC, gravidade, coexistência e microbiologia; integrar as condutas sem somar esquemas automaticamente.',takeaway:'Mudar o diagnóstico pode mudar o percurso terapêutico.',sources:['gold'],level:3}
  ]
};
