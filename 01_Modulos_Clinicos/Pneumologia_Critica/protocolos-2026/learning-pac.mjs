// Casos sintéticos e sínteses autorais; não reproduzem questões de provas.
// Derivados de MODULES.pac/FORMS e dos motores curb65/severeCAP/therapyCAP/durationCAP aprovados.
// Revalidação primária em 18/10/2026: ATS 2025 (volume jan/2026), Q1–Q4;
// posição IDSA 2026, DOI 10.1093/ajrccm/aamag065; NICE NG250, box 2/1.2.
// As chaves abaixo resolvem para SOURCES da plataforma. Nenhuma dose nova é introduzida.
export const PAC_LEARNING = {
  cases: [
    {
      id: 'pac-c01', topic: 'Diagnóstico e imagem', title: 'O aparelho não faz o diagnóstico sozinho', level: 1,
      stem: 'Caso sintético. Adulto imunocompetente com febre, tosse e sinais focais. A radiografia não está disponível de imediato. Um médico treinado realiza ultrassom pulmonar com achado de consolidação compatível; os dados clínicos também sustentam PAC.',
      question: 'Como interpretar a estratégia de imagem segundo a atualização ATS?',
      choices: [
        {text: 'O ultrassom é uma alternativa aceitável quando há competência e contexto clínico apropriados.', why: 'A sugestão ATS é condicional e depende da qualidade do exame e da competência local. O achado deve ser integrado à síndrome clínica.'},
        {text: 'A ausência de radiografia torna impossível avaliar PAC.', why: 'A ATS admite o ultrassom como alternativa em locais com experiência adequada. A disponibilidade de um único método não define toda a avaliação.'},
        {text: 'A consolidação no ultrassom dispensa diagnóstico diferencial.', why: 'Imagem compatível precisa ser interpretada com a história e a evolução. Outras causas podem produzir achados que exigem revisão.'},
        {text: 'O resultado será equivalente mesmo sem treinamento do operador.', why: 'A competência é uma condição da recomendação. Ter um aparelho disponível não assegura aquisição nem interpretação adequadas.'}
      ],
      answer: 0, takeaway: 'Síndrome + imagem + competência. O método integra o raciocínio clínico.', sources: ['ats']
    },
    {
      id: 'pac-c02', topic: 'Risco e unidades', title: 'CURB baixo, oxigenação preocupante', level: 2,
      stem: 'Caso sintético. Pessoa de 52 anos com PAC, orientada, FR 22/min, PA 118/72 mmHg e ureia 60 mg/dL. SpO₂ de 85% em ar ambiente, confirmada na avaliação. Não há outro critério do CURB-65.',
      question: 'Qual interpretação reúne o cálculo e a decisão clínica?',
      choices: [
        {text: 'CURB-65 = 0; a oxigenação só importa se o escore aumentar.', why: 'Ureia 60 ÷ 6,006 ultrapassa 7 mmol/L e soma um ponto. Além disso, a hipoxemia precisa ser avaliada independentemente do escore.'},
        {text: 'CURB-65 = 1; a hipoxemia exige avaliação imediata e impede usar o escore como autorização de alta.', why: 'A ureia soma o único ponto. O CURB-65 não inclui oxigenação; julgamento clínico, suporte necessário e avaliação do local de cuidado prevalecem.'},
        {text: 'CURB-65 = 2, porque idade acima de 50 anos já pontua.', why: 'A idade pontua a partir de 65 anos. O dado que soma ponto neste caso é a ureia após conversão correta.'},
        {text: 'É obrigatório tratar ureia 60 como BUN 60 para evitar subestimar risco.', why: 'Os analitos não são intercambiáveis em mg/dL. Use a unidade e o nome exatos do laudo; trocar o analito distorce o cálculo.'}
      ],
      answer: 1, takeaway: 'Converta a unidade; depois olhe o paciente. CURB-65 baixo não exclui hipoxemia grave.', sources: ['nice', 'idsa']
    },
    {
      id: 'pac-c03', topic: 'PAC grave', title: 'Três menores já bastam', level: 2,
      stem: 'Caso sintético. Adulto imunocompetente com PAC tem FR 32/min, PaO₂/FiO₂ de 240 e infiltrados multilobares. Não usa vasopressor nem ventilação invasiva. Esses três critérios menores foram confirmados.',
      question: 'Qual é a classificação e sua implicação?',
      choices: [
        {text: 'Não é PAC grave, porque faltam critérios maiores.', why: 'Um critério maior não é obrigatório quando há três ou mais menores. As duas formas de preencher a definição são alternativas.'},
        {text: 'Os três menores obrigam intubação imediata em qualquer paciente.', why: 'Definir PAC grave indica avaliação e suporte conforme a fisiologia. A escala não é uma ordem automática de intubação.'},
        {text: 'É PAC grave; requer avaliação imediata da intensidade de suporte e da equipe de terapia intensiva.', why: 'FR ≥30, relação PaO₂/FiO₂ ≤250 e infiltrados multilobares somam três menores, suficientes para a definição ATS/IDSA.'},
        {text: 'Só será possível classificar depois de calcular CURB-65.', why: 'Os critérios ATS/IDSA de gravidade têm função própria. Não dependem de um CURB-65 alto para reconhecer esse cenário.'}
      ],
      answer: 2, takeaway: 'PAC grave: um maior OU três menores. Reconheça a gravidade sem automatizar o suporte.', sources: ['idsa', 'pathway']
    },
    {
      id: 'pac-c04', topic: 'Vírus e antibióticos', title: 'O teste viral abre uma decisão', level: 3,
      stem: 'Caso sintético. Adulto imunocompetente com DPOC e diabetes, internado por PAC não grave, apresenta teste viral positivo. Não há choque nem critério de PAC grave. A equipe discute antibiótico empírico e a probabilidade de coinfecção.',
      question: 'Qual afirmação representa a divergência das fontes atuais?',
      choices: [
        {text: 'ATS e IDSA concordam que toda PCR viral positiva exige antibiótico.', why: 'A positividade viral não impõe antibiótico em todos os contextos. Há recomendações diferentes conforme cenário e uma divergência explícita em situações não graves.'},
        {text: 'A IDSA recomenda nunca usar antibiótico em qualquer PAC com vírus positivo.', why: 'A IDSA admite tratamento quando fatores individuais sustentam coinfecção e concorda com antibiótico empírico na PAC grave com vírus positivo.'},
        {text: 'O resultado viral demonstra ausência de bactéria e resolve sozinho a decisão.', why: 'A detecção de vírus não exclui coinfecção. Gravidade, evolução, dados microbiológicos e contexto continuam relevantes.'},
        {text: 'ATS sugere antibiótico nesse cenário; IDSA não endossa a aplicação automática e favorece decisão individual.', why: 'A divergência abrange internação não grave e ambulatório com comorbidades, ambos com vírus positivo. Documente os fatores individuais e siga o protocolo local.'}
      ],
      answer: 3, takeaway: 'Conhecer a divergência faz parte da resposta correta. Vírus positivo não substitui avaliação de coinfecção.', sources: ['ats', 'debate']
    },
    {
      id: 'pac-c05', topic: 'Duração e estabilidade', title: 'O terceiro dia é um checkpoint', level: 2,
      stem: 'Caso sintético. Adulto com PAC não grave completa três dias de antibiótico eficaz. Está com T 37,0 °C, FC 84/min, FR 20/min, PAS 112 mmHg, consciência normal e SpO₂ 95% em ar ambiente. Tolera VO, há retorno viável e a elegibilidade foi revista. Não há complicação ou agente que exija curso maior.',
      question: 'Qual é a interpretação da atualização ATS?',
      choices: [
        {text: 'Pode-se considerar curso inferior a cinco dias, mínimo de três, após decisão clínica individual.', why: 'A sugestão é condicional para PAC não grave, estável e elegível. O dia de tratamento inicia a revisão, sem gerar ordem automática de suspensão.'},
        {text: 'Toda PAC deve receber pelo menos sete dias, mesmo nesse contexto.', why: 'A atualização permite curso mais curto em pacientes não graves selecionados. Um mínimo universal de sete dias não representa essa recomendação.'},
        {text: 'A melhora clínica permitiria suspender antes de completar três dias em qualquer paciente.', why: 'A sugestão de curso curto mantém mínimo de três dias. A melhora isolada não elimina esse mínimo nem os demais critérios de elegibilidade.'},
        {text: 'A mesma regra de três dias pode ser aplicada a PAC grave estável.', why: 'A PAC grave mantém duração de pelo menos cinco dias, com ajuste pela evolução, pelo agente e pelas complicações.'}
      ],
      answer: 0, takeaway: 'Tempo + estabilidade + elegibilidade. Curso curto é uma possibilidade condicional.', sources: ['ats', 'pathway']
    },
    {
      id: 'pac-c06', topic: 'Corticoide e reavaliação', title: 'A exceção por influenza importa', level: 3,
      stem: 'Caso sintético. Adulto imunocompetente tem PAC grave com influenza confirmada. Não há outra indicação independente de corticoide identificada. A equipe pergunta se a sugestão ATS de corticoide na PAC grave pode ser aplicada automaticamente.',
      question: 'Qual é a resposta mais adequada?',
      choices: [
        {text: 'Sim; a gravidade elimina qualquer exceção relacionada ao agente.', why: 'A recomendação ATS para PAC grave exclui pneumonia por influenza. A presença de gravidade não apaga essa restrição.'},
        {text: 'Não; a sugestão ATS exclui influenza e outras indicações precisam ser avaliadas separadamente.', why: 'Não se deve transferir a sugestão de modo automático para esse cenário. A diretriz também não estabelece um esquema universal de corticoide.'},
        {text: 'Basta aumentar a dose para contornar a exceção por influenza.', why: 'A exceção não é corrigida por uma dose maior. Essa proposta não é sustentada pela base aprovada.'},
        {text: 'A exclusão significa que corticoide é proibido para qualquer outra doença concomitante.', why: 'A recomendação é sobre uso por PAC. Uma indicação independente, se existir, exige avaliação própria; a questão informa que nenhuma foi identificada.'}
      ],
      answer: 1, takeaway: 'Antes de considerar corticoide, confira gravidade, influenza e indicação específica.', sources: ['ats']
    }
  ],
  flashcards: [
    {id: 'pac-f01', topic: 'Diagnóstico e imagem', front: 'Qual dupla sustenta a avaliação de PAC?', back: 'Síndrome clínica compatível e infiltrado novo, interpretados em conjunto.', pitfall: 'Rotular pneumonia por um achado de imagem isolado.', sources: ['ats'], level: 1},
    {id: 'pac-f02', topic: 'Diagnóstico e imagem', front: 'Quando o ultrassom pode substituir a radiografia na estratégia diagnóstica?', back: 'Quando existe competência local e contexto apropriado; a sugestão ATS é condicional.', pitfall: 'Confundir disponibilidade do aparelho com competência para o exame.', sources: ['ats'], level: 1},
    {id: 'pac-f03', topic: 'Risco e unidades', front: 'Como converter o exame para o corte de ureia >7 mmol/L do CURB-65?', back: 'Ureia em mg/dL ÷6,006; BUN em mg/dL ÷2,801. Compare antes de arredondar.', pitfall: 'Usar o divisor de BUN para um resultado de ureia.', sources: ['nice'], level: 2},
    {id: 'pac-f04', topic: 'Risco e unidades', front: 'CURB-65 de 0–1 autoriza alta com hipoxemia?', back: 'Não. Avalie oxigenação, estabilidade, VO e suporte; ATS/IDSA prefere PSI + julgamento para internação.', pitfall: 'Tratar uma estimativa de risco como decisão automática de local de cuidado.', sources: ['idsa', 'nice'], level: 2},
    {id: 'pac-f05', topic: 'PAC grave', front: 'Qual combinação define PAC grave pelos critérios ATS/IDSA?', back: 'Um critério maior OU pelo menos três menores.', pitfall: 'Exigir um maior e três menores ao mesmo tempo.', sources: ['idsa', 'pathway'], level: 1},
    {id: 'pac-f06', topic: 'PAC grave', front: 'Como tratar um critério de gravidade que não foi avaliado?', back: 'Como desconhecido. Não conte como normal nem use a ausência de preenchimento para excluir gravidade.', pitfall: 'Transformar campo vazio em resposta negativa.', sources: ['pathway'], level: 2},
    {id: 'pac-f07', topic: 'Vírus e antibióticos', front: 'Em quais cenários vírus+ existe a divergência ATS–IDSA 2026?', back: 'Ambulatório com comorbidades e internação não grave: ATS sugere antibiótico; IDSA não endossa aplicação automática.', pitfall: 'Apresentar a atualização ATS como consenso conjunto ATS/IDSA.', sources: ['ats', 'debate'], level: 3},
    {id: 'pac-f08', topic: 'Vírus e antibióticos', front: 'Na PAC grave, vírus positivo permite omitir antibacteriano por si só?', back: 'Não. O teste não exclui coinfecção; as fontes sustentam antibacteriano empírico nesse cenário.', pitfall: 'Usar PCR viral ou procalcitonina baixa isoladamente como comando de suspensão.', sources: ['ats', 'debate', 'idsa'], level: 2},
    {id: 'pac-f09', topic: 'Duração e estabilidade', front: 'Quem pode ser avaliado para mínimo de três dias segundo a ATS?', back: 'PAC não grave, com estabilidade e elegibilidade revistas; curso <5 dias é sugestão condicional.', pitfall: 'Suspender ao atingir o terceiro dia, sem revisar a evolução.', sources: ['ats'], level: 2},
    {id: 'pac-f10', topic: 'Duração e estabilidade', front: 'Quais eixos compõem a estabilidade antes de revisar a duração?', back: 'Temperatura, FC, FR, pressão, consciência e oxigenação. Conferir também VO e retorno seguro.', pitfall: 'Usar apenas ausência de febre; PAC grave mantém mínimo de cinco dias.', sources: ['ats', 'pathway'], level: 2},
    {id: 'pac-f11', topic: 'Corticoide e reavaliação', front: 'Qual é a ressalva central do corticoide na PAC grave pela ATS?', back: 'A sugestão exclui influenza. Na PAC não grave, não usar rotineiramente por pneumonia.', pitfall: 'Aplicar um corticoide universal sem conferir agente e outras indicações.', sources: ['ats'], level: 2},
    {id: 'pac-f12', topic: 'Corticoide e reavaliação', front: 'Sem melhora em 48–72 h ou com deterioração, o que revisar?', back: 'Diagnóstico, adesão, resistência, derrame/empiema, abscesso e foco extrapulmonar. Deterioração exige avaliação imediata.', pitfall: 'Aguardar o prazo ou apenas aumentar medicamentos sem procurar a causa.', sources: ['nice', 'idsa'], level: 3}
  ],
  particles: [
    {id: 'pac-p01', topic: 'Diagnóstico e imagem', phase: 'contexto', title: 'Comece pela hipótese', prompt: 'Tosse e febre, isoladamente, fecham PAC?', answer: 'Não. Integre a síndrome clínica à imagem e ao diagnóstico diferencial.', takeaway: 'Um sintoma não encerra a investigação.', sources: ['ats'], level: 1},
    {id: 'pac-p02', topic: 'Diagnóstico e imagem', phase: 'mecanismo', title: 'Imagem revela um padrão', prompt: 'Por que uma consolidação precisa de contexto?', answer: 'Um padrão de imagem não identifica sozinho a causa; a história e a evolução ajudam a interpretar o achado.', takeaway: 'Padrão de imagem não equivale a etiologia.', sources: ['ats'], level: 1},
    {id: 'pac-p03', topic: 'Diagnóstico e imagem', phase: 'decisao', title: 'Escolha o método com competência', prompt: 'Ultrassom disponível e operador treinado: pode integrar a estratégia?', answer: 'Sim. A ATS o aceita como alternativa à radiografia quando há competência e condições apropriadas.', takeaway: 'A competência faz parte da escolha do exame.', sources: ['ats'], level: 2},
    {id: 'pac-p04', topic: 'Diagnóstico e imagem', phase: 'transferencia', title: 'Reabra a hipótese', prompt: 'O quadro evolui de modo incompatível com a hipótese inicial. O que fazer?', answer: 'Revisar PAC e considerar alternativas já previstas na base, como TEP, IC e atelectasia.', takeaway: 'A evolução pode mudar o diagnóstico.', sources: ['ats', 'idsa'], level: 3},
    {id: 'pac-p05', topic: 'Risco e unidades', phase: 'contexto', title: 'Leia o nome do exame', prompt: 'O laudo informa 50 mg/dL. Já é possível pontuar a ureia?', answer: 'Falta saber se o resultado é ureia ou BUN. A unidade numérica sozinha não identifica o analito.', takeaway: 'Nome do analito + unidade + valor.', sources: ['nice'], level: 1},
    {id: 'pac-p06', topic: 'Risco e unidades', phase: 'mecanismo', title: 'Use o divisor correto', prompt: 'Quais divisores levam os resultados em mg/dL ao corte em mmol/L?', answer: 'Ureia: 6,006. BUN: 2,801. O critério é >7 mmol/L, sem arredondar antes da comparação.', takeaway: 'Converter errado muda o escore.', sources: ['nice'], level: 2},
    {id: 'pac-p07', topic: 'Risco e unidades', phase: 'decisao', title: 'Resolva a informação ausente', prompt: 'A ureia ainda não está disponível. O CURB-65 está completo?', answer: 'Não. Registre a incompletude; o dado ausente não equivale a zero ponto nem impede reconhecer instabilidade.', takeaway: 'Incompleto é diferente de normal.', sources: ['nice', 'idsa'], level: 2},
    {id: 'pac-p08', topic: 'Risco e unidades', phase: 'transferencia', title: 'Cruze escore e fisiologia', prompt: 'CURB baixo e SpO₂ muito reduzida: qual dado governa a urgência?', answer: 'A hipoxemia exige avaliação imediata. O CURB não mede oxigenação; PSI e julgamento ajudam na decisão de internação.', takeaway: 'A fisiologia prevalece sobre a tranquilidade do número.', sources: ['idsa', 'nice'], level: 3},
    {id: 'pac-p09', topic: 'PAC grave', phase: 'contexto', title: 'Separe duas perguntas', prompt: 'Estimar mortalidade e avaliar necessidade de suporte intensivo são a mesma tarefa?', answer: 'Não. CURB/PSI e critérios ATS/IDSA de PAC grave têm funções diferentes.', takeaway: 'Use a ferramenta para a pergunta certa.', sources: ['idsa'], level: 1},
    {id: 'pac-p10', topic: 'PAC grave', phase: 'mecanismo', title: 'Reconheça falência orgânica', prompt: 'Quais são os dois critérios maiores?', answer: 'Insuficiência respiratória com necessidade de ventilação invasiva e choque séptico com vasopressor.', takeaway: 'Um maior já preenche a definição.', sources: ['idsa', 'pathway'], level: 1},
    {id: 'pac-p11', topic: 'PAC grave', phase: 'decisao', title: 'Some apenas o que foi confirmado', prompt: 'FR ≥30, PaO₂/FiO₂ ≤250 e infiltrados multilobares foram confirmados. E agora?', answer: 'São três menores: PAC grave. Avaliar imediatamente intensidade de cuidado e suporte conforme a fisiologia.', takeaway: 'Não precisa surgir um maior para reconhecer gravidade.', sources: ['idsa', 'pathway'], level: 2},
    {id: 'pac-p12', topic: 'PAC grave', phase: 'transferencia', title: 'Não espere o formulário', prompt: 'O paciente deteriora antes de terminar a lista. Você deve completar tudo primeiro?', answer: 'Não. Priorize avaliação e suporte imediatos; critérios desconhecidos não justificam aguardar diante da deterioração.', takeaway: 'A urgência não depende de um formulário completo.', sources: ['idsa', 'pathway'], level: 3},
    {id: 'pac-p13', topic: 'Vírus e antibióticos', phase: 'contexto', title: 'Situe o vírus positivo', prompt: 'Qual informação vem antes de interpretar a conduta no vírus+?', answer: 'Cenário de cuidado, gravidade, comorbidades e probabilidade individual de coinfecção.', takeaway: 'O mesmo teste pode abrir decisões diferentes.', sources: ['ats', 'debate'], level: 1},
    {id: 'pac-p14', topic: 'Vírus e antibióticos', phase: 'mecanismo', title: 'Detecção não é exclusão', prompt: 'Por que encontrar vírus não resolve a presença de bactéria?', answer: 'Infecções podem coexistir. Antibacteriano não trata o vírus; sua indicação depende do risco de componente bacteriano.', takeaway: 'Diferencie o resultado do teste da decisão terapêutica.', sources: ['ats', 'debate'], level: 2},
    {id: 'pac-p15', topic: 'Vírus e antibióticos', phase: 'decisao', title: 'Explicite o ponto controverso', prompt: 'Vírus+ na internação não grave: como descrever a base atual?', answer: 'ATS sugere antibiótico; IDSA não endossa aplicação automática. Individualizar e registrar a avaliação de coinfecção.', takeaway: 'A divergência deve aparecer na decisão.', sources: ['ats', 'debate'], level: 2},
    {id: 'pac-p16', topic: 'Vírus e antibióticos', phase: 'transferencia', title: 'Mude a gravidade, reveja o plano', prompt: 'Se o cenário passa a PAC grave, o vírus positivo libera omitir antibiótico?', answer: 'Não. As fontes sustentam antibacteriano empírico na PAC grave; teste viral ou procalcitonina isolados não o dispensam.', takeaway: 'Reclassificar gravidade muda o peso das evidências.', sources: ['ats', 'debate', 'idsa'], level: 3},
    {id: 'pac-p17', topic: 'Duração e estabilidade', phase: 'contexto', title: 'Calendário é checkpoint', prompt: 'Chegar ao terceiro dia já encerra o tratamento?', answer: 'Não. Primeiro revisar gravidade, estabilidade, resposta, agente, complicações e elegibilidade.', takeaway: 'Data não substitui reavaliação.', sources: ['ats', 'pathway'], level: 1},
    {id: 'pac-p18', topic: 'Duração e estabilidade', phase: 'mecanismo', title: 'Olhe o conjunto da recuperação', prompt: 'Por que estar afebril não basta para afirmar estabilidade?', answer: 'Pressão, frequência cardíaca e respiratória, consciência e oxigenação também importam; conferir VO e retorno.', takeaway: 'Estabilidade reúne vários eixos.', sources: ['ats', 'pathway'], level: 2},
    {id: 'pac-p19', topic: 'Duração e estabilidade', phase: 'decisao', title: 'Aplique a condição inteira', prompt: 'PAC não grave, estável e elegível após três dias eficazes: qual possibilidade revisar?', answer: 'Curso inferior a cinco dias, mínimo de três, com decisão individual. A sugestão ATS é condicional.', takeaway: 'Não grave + estável + elegível, sem suspensão automática.', sources: ['ats'], level: 2},
    {id: 'pac-p20', topic: 'Duração e estabilidade', phase: 'transferencia', title: 'Procure o que muda a duração', prompt: 'O paciente melhora, mas há empiema ou agente que exige curso maior. Vale o atalho de três dias?', answer: 'Não. Complicação ou agente específico exige revisão individual; PAC grave mantém pelo menos cinco dias.', takeaway: 'Melhora não apaga uma exceção.', sources: ['ats', 'idsa'], level: 3},
    {id: 'pac-p21', topic: 'Corticoide e reavaliação', phase: 'contexto', title: 'Declare a indicação', prompt: 'Na PAC não grave, corticoide sistêmico é rotina por pneumonia?', answer: 'Não. Uma indicação por outra doença deve ser avaliada separadamente.', takeaway: 'Toda intervenção precisa de indicação específica.', sources: ['ats'], level: 1},
    {id: 'pac-p22', topic: 'Corticoide e reavaliação', phase: 'mecanismo', title: 'Separe infecção e resposta do hospedeiro', prompt: 'A sugestão de corticoide na PAC grave significa substituir o antibiótico?', answer: 'Não. Considerar a resposta inflamatória não elimina o tratamento do componente infeccioso nem suas reavaliações.', takeaway: 'Uma decisão não substitui a outra.', sources: ['ats', 'idsa'], level: 2},
    {id: 'pac-p23', topic: 'Corticoide e reavaliação', phase: 'decisao', title: 'Confira a exceção antes de avançar', prompt: 'PAC grave por influenza: a sugestão ATS de corticoide se aplica diretamente?', answer: 'Não. Influenza está excluída dessa sugestão. Revisar outras indicações e o protocolo; não há esquema universal na ATS.', takeaway: 'Agente e indicação delimitam a recomendação.', sources: ['ats'], level: 2},
    {id: 'pac-p24', topic: 'Corticoide e reavaliação', phase: 'transferencia', title: 'Falha pede nova pergunta', prompt: 'Sem melhora em 48–72 h, basta aumentar medicação e aguardar?', answer: 'Não. Reavaliar diagnóstico, adesão, resistência e complicações, como empiema/abscesso. Deterioração exige avaliação imediata.', takeaway: 'Procure a causa da falha antes de repetir o plano.', sources: ['nice', 'idsa'], level: 3}
  ]
};
