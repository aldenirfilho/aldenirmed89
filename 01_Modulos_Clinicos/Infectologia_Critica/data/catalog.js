"use strict";

(() => {
  const catalog = {
    meta: {
      schemaVersion: "critical-module-v1",
      moduleVersion: "1.0.0",
      slug: "infectologia-critica",
      title: "Infectologia Crítica",
      subtitle: "Síndromes tempo-dependentes, stewardship e resistência antimicrobiana organizados para plantão, raciocínio clínico e prova TEMI — com decisões em camadas e limites explícitos.",
      kicker: "🦠 Plantão · UTI · Turbo TEMI",
      emoji: "🦠",
      updatedAt: "2026-07-30",
      status: "em-revisao-medica",
      readyEvent: "antigravity:infectology-ready",
      safetyNotice: "Material educacional em revisão médica. Não substitui infectologista, microbiologia local, controle de infecção, protocolo institucional, avaliação individual, ajuste renal/hepático nem dupla checagem de antimicrobianos."
    },
    quickActions: [
      { icon: "⏱️", title: "Sepse: relógio + foco", text: "Reconheça disfunção orgânica, estabilize, obtenha culturas sem atraso indevido e procure controle de foco.", href: "#emergencias" },
      { icon: "🧫", title: "Microbiologia útil", text: "Colete a amostra certa, do sítio certo, antes da terapia quando isso não atrasar uma emergência.", href: "#fluxos" },
      { icon: "🎯", title: "Terapia empírica", text: "Cruze síndrome, gravidade, exposições, colonização prévia e antibiograma local.", href: "#comparacoes" },
      { icon: "✂️", title: "Descalonar cedo", text: "Reavalie diagnóstico, foco, culturas, resposta, espectro e duração em checkpoints explícitos.", href: "#conceitos" }
    ],
    emergencies: [
      {
        id: "choque-septico", category: "Sepse", title: "Choque séptico",
        signal: "Infecção provável com hipoperfusão, hipotensão persistente ou necessidade de vasopressor após avaliação de volume.",
        firstHour: ["ABCDE e monitorização; confirme perfusão com múltiplos sinais, não apenas lactato.", "Culturas adequadas antes do antimicrobiano se não houver atraso clinicamente relevante.", "Antimicrobiano empírico orientado por foco, gravidade e ecologia local; planeje controle do foco.", "Reavalie fluido e vasopressor em ciclos curtos com medidas dinâmicas quando disponíveis."],
        decisive: ["Culturas e amostras do foco", "Imagem orientada à fonte", "Perfusão seriada e disfunções orgânicas"],
        doNot: ["Não use qSOFA isoladamente para excluir sepse.", "Não repita volume sem avaliar responsividade e tolerância.", "Não mantenha espectro máximo sem checkpoint de descalonamento."],
        tags: ["tempo-dependente", "controle de foco", "stewardship"], referenceIds: ["ssc2026", "sepsis3"]
      },
      {
        id: "pneumonia-hap-vap", category: "Pulmão", title: "Pneumonia hospitalar e associada à ventilação",
        signal: "Novo infiltrado com sinais clínicos de infecção e piora respiratória; diferencie de atelectasia, edema, hemorragia e SDRA.",
        firstHour: ["Avalie gravidade e risco de patógeno resistente.", "Colha amostra respiratória e hemoculturas quando indicadas.", "Escolha terapia empírica pelo antibiograma da UTI e exposições individuais.", "Revise diariamente diagnóstico, culturas e possibilidade de reduzir espectro/duração."],
        decisive: ["Amostra respiratória de qualidade", "Imagem comparativa", "Antibiograma local e culturas prévias"],
        doNot: ["Não trate colonização isolada.", "Não acrescente dupla cobertura automaticamente.", "Não prolongue terapia apenas por persistência radiológica."],
        tags: ["HAP", "VAP", "antibiograma"], referenceIds: ["hapvap2016", "amr2024"]
      },
      {
        id: "meningite-bacteriana", category: "Sistema nervoso", title: "Meningite bacteriana aguda",
        signal: "Febre, cefaleia, rigidez, alteração mental, convulsão ou púrpura; apresentações incompletas são comuns.",
        firstHour: ["Estabilize ABCDE e trate como emergência neurológica/infecciosa.", "Obtenha hemoculturas; não deixe neuroimagem ou punção atrasarem terapia quando a suspeita é alta.", "Defina necessidade de imagem antes da punção conforme risco clínico.", "Implemente precauções e notificação conforme agente/suspeita e protocolo local."],
        decisive: ["LCR com celularidade, glicose, proteína, Gram/cultura e teste molecular conforme contexto", "Hemoculturas", "Neuroimagem quando indicada"],
        doNot: ["Não espere a tríade clássica.", "Não faça punção sem avaliar risco de herniação/instabilidade.", "Não esqueça exposição epidemiológica e profilaxia de contatos quando aplicável."],
        tags: ["neuroinfecção", "LCR", "tempo-dependente"], referenceIds: ["whoMeningitis2025"]
      },
      {
        id: "neutropenia-febril", category: "Imunossuprimido", title: "Neutropenia febril de alto risco",
        signal: "Febre ou instabilidade em neutropenia profunda/prolongada, mesmo sem foco exuberante.",
        firstHour: ["ABCDE e avaliação de choque; procure cateter, pele, pulmão, abdome e região perianal sem exame invasivo desnecessário.", "Culturas periféricas e de lúmens apropriados.", "Inicie cobertura antipseudomonas conforme protocolo e ecologia local.", "Estratifique risco e considere fungos, vírus e patógenos resistentes conforme curso/exposições."],
        decisive: ["Hemoculturas por lúmen e periférica", "Imagem dirigida", "Duração/profundidade da neutropenia e profilaxias"],
        doNot: ["Não espere neutrofilia ou pus.", "Não faça toque retal de rotina na neutropenia profunda.", "Não adicione agentes sem uma hipótese e checkpoint."],
        tags: ["oncologia", "Pseudomonas", "imunossupressão"], referenceIds: ["idsaNeutropenia2011", "amr2024"]
      },
      {
        id: "endocardite-complicada", category: "Endovascular", title: "Endocardite infecciosa complicada",
        signal: "Bacteremia persistente, novo sopro, fenômenos embólicos, insuficiência cardíaca, bloqueio ou prótese/dispositivo.",
        firstHour: ["Estabilize complicações e obtenha múltiplos pares de hemoculturas antes da terapia quando possível.", "Realize ecocardiografia adequada ao risco e repita se a suspeita permanecer alta.", "Busque insuficiência valvar, abscesso, embolização e foco de bacteremia.", "Acione equipe multidisciplinar cedo quando houver complicação ou material protético."],
        decisive: ["Hemoculturas seriadas", "Ecocardiograma transtorácico/transesofágico conforme contexto", "Imagem de complicações embólicas/perivalvares"],
        doNot: ["Não declare cura apenas pela defervescência.", "Não interprete cultura positiva sem contexto de contaminação versus bacteremia verdadeira.", "Não atrase avaliação cirúrgica quando houver indicação potencial."],
        tags: ["bacteremia", "eco", "cirurgia"], referenceIds: ["ahaEndocarditis2015"]
      },
      {
        id: "fasceite-necrosante", category: "Pele e partes moles", title: "Infecção necrosante de partes moles",
        signal: "Dor desproporcional, progressão rápida, toxicidade, bolhas, crepitação, anestesia cutânea ou choque.",
        firstHour: ["Chame cirurgia imediatamente; diagnóstico é clínico-operatório.", "Ressuscite e colha culturas sem atrasar abordagem.", "Use cobertura empírica ampla conforme epidemiologia, incluindo anaeróbios e toxinas quando indicado.", "Marque limites, fotografe conforme política e reavalie progressão."],
        decisive: ["Exploração cirúrgica", "Culturas profundas", "Imagem apenas se não atrasar o centro cirúrgico"],
        doNot: ["Não use escore laboratorial para excluir doença.", "Não espere gás na imagem.", "Não substitua desbridamento por antibiótico."],
        tags: ["cirurgia", "toxina", "controle de foco"], referenceIds: ["idsaSsti2014"]
      },
      {
        id: "sindrome-choque-toxico", category: "Toxinas", title: "Síndrome do choque tóxico",
        signal: "Choque com febre, exantema/eritrodermia e disfunção multiorgânica, associado a foco estafilo/estreptocócico possível.",
        firstHour: ["Estabilize choque e identifique foco profundo, corpo estranho ou ferida.", "Controle o foco imediatamente.", "Empregue terapia antimicrobiana que contemple agente e supressão de toxina conforme protocolo.", "Discuta terapias adjuvantes apenas no contexto apropriado e com especialistas."],
        decisive: ["Culturas do foco e sangue", "Exploração do foco", "Critérios clínicos e exclusão de mimetizadores"],
        doNot: ["Não espere cultura sanguínea positiva.", "Não ignore tampão, ferida cirúrgica ou trauma mínimo.", "Não atrase cirurgia por investigação extensa."],
        tags: ["Staphylococcus", "Streptococcus", "toxina"], referenceIds: ["idsaSsti2014"]
      },
      {
        id: "gram-negativo-resistente", category: "Resistência", title: "Infecção grave por Gram-negativo resistente",
        signal: "Sepse com colonização prévia, antibiótico recente, longa internação, dispositivo ou cultura com ESBL, AmpC, CRE, CRAB ou DTR Pseudomonas.",
        firstHour: ["Separe colonização de infecção e confirme sítio.", "Revise cultura/antibiograma atual e prévios, mecanismo provável e exposição antimicrobiana.", "Use agente ativo com melhor evidência para mecanismo e sítio, com infectologia/farmácia.", "Planeje controle do foco e descalonamento desde a prescrição inicial."],
        decisive: ["Identificação e sensibilidade com mecanismo quando disponível", "Culturas prévias", "Sítio, gravidade e exposição farmacológica"],
        doNot: ["Não trate cultura sem síndrome.", "Não extrapole suscetibilidade de uma classe para outra.", "Não combine fármacos por reflexo quando há agente ativo adequado."],
        tags: ["ESBL", "CRE", "CRAB", "DTR"], referenceIds: ["amr2024"]
      },
      {
        id: "diarreia-c-difficile-fulminante", category: "Abdome", title: "Colite fulminante por C. difficile",
        signal: "Diarreia ou íleo com hipotensão, choque, megacólon ou disfunção grave após exposição de risco.",
        firstHour: ["Implemente precaução de contato e suporte de órgão.", "Suspenda antimicrobianos desnecessários e agentes que reduzam motilidade quando apropriado.", "Confirme síndrome e teste no paciente adequado.", "Acione cirurgia cedo em fulminância/megacólon; siga esquema institucional."],
        decisive: ["Quadro clínico compatível", "Teste em amostra apropriada", "Imagem e tendência de lactato/leucócitos no grave"],
        doNot: ["Não teste fezes formadas sem indicação.", "Não trate colonização assintomática.", "Não espere perfuração para discutir cirurgia."],
        tags: ["diarreia", "íleo", "controle de infecção"], referenceIds: ["idsaCdiff2021"]
      },
      {
        id: "fungemia-candidemia", category: "Fúngica", title: "Candidemia e candidíase invasiva",
        signal: "Sepse persistente com cateter, nutrição parenteral, cirurgia abdominal, exposição antimicrobiana ou imunossupressão.",
        firstHour: ["Obtenha hemoculturas e avalie foco/cateter.", "Inicie terapia guiada por gravidade, espécie provável, exposição prévia e ecologia local.", "Planeje remoção de cateter quando ele for fonte provável e clinicamente viável.", "Documente depuração microbiológica e pesquise complicações conforme diretriz."],
        decisive: ["Hemoculturas seriadas", "Identificação de espécie e suscetibilidade", "Avaliação de foco profundo/disseminação"],
        doNot: ["Não use biomarcador isolado como diagnóstico.", "Não ignore foco intra-abdominal.", "Não encurte seguimento sem documentar depuração e resposta."],
        tags: ["Candida", "cateter", "fungemia"], referenceIds: ["idsaCandida2016"]
      }
    ],
    pathways: [
      {
        id: "sepse-foco", title: "Sepse: reconhecer, estabilizar, localizar e controlar", timebox: "0–6 h",
        steps: [
          { title: "Fenótipo", text: "Defina choque, hipoperfusão, disfunção orgânica e necessidades de suporte." },
          { title: "Amostras úteis", text: "Colete sangue e foco sem atrasar terapia de uma emergência." },
          { title: "Empírico racional", text: "Síndrome + gravidade + ecologia local + culturas/exposições prévias." },
          { title: "Controle do foco", text: "Drenar, remover, desbridar ou operar no tempo clinicamente apropriado." },
          { title: "Checkpoint", text: "Em 24–72 h: diagnóstico, culturas, espectro, via, dose, duração e dispositivos." }
        ],
        exit: "Plano documentado com foco, suporte, revisão microbiológica e data de reavaliação."
      },
      {
        id: "amostra-antibiotico", title: "Amostra antes do antimicrobiano sem perder tempo", timebox: "minutos",
        steps: [
          { title: "Priorize", text: "Escolha amostras que realmente alteram diagnóstico ou descalonamento." },
          { title: "Qualidade", text: "Volume, sítio, técnica e transporte importam mais que multiplicar coletas ruins." },
          { title: "Não atrase", text: "Se a coleta ameaça atrasar uma emergência, trate e documente o motivo." },
          { title: "Interprete", text: "Integre pré-teste, Gram, cultura, PCR, exposição e resposta clínica." }
        ],
        exit: "Amostra rastreável, horário registrado e pergunta clínica explícita."
      },
      {
        id: "pav-decisao", title: "Suspeita de PAV: síndrome antes da cultura", timebox: "0–72 h",
        steps: [
          { title: "Probabilidade", text: "Infiltrado novo/progressivo + sinais infecciosos + piora respiratória." },
          { title: "Mimetizadores", text: "Atelectasia, edema, hemorragia, TEP e SDRA podem imitar PAV." },
          { title: "Microbiologia", text: "Amostra respiratória adequada e culturas conforme gravidade." },
          { title: "Antibiograma local", text: "Defina cobertura pelo risco individual e ecologia da UTI." },
          { title: "Time-out", text: "Em 48–72 h, pare, estreite ou redirecione com dados clínicos." }
        ],
        exit: "Diagnóstico revisado e menor espectro/duração seguros."
      },
      {
        id: "resistencia-gram-negativo", title: "Gram-negativo resistente: mecanismo → sítio → agente", timebox: "mesmo plantão",
        steps: [
          { title: "Infecção real?", text: "Confirme síndrome, sítio e necessidade de tratar." },
          { title: "Mecanismo", text: "Diferencie ESBL, AmpC, carbapenemase, DTR e CRAB quando possível." },
          { title: "Exposição", text: "Considere sítio, MIC, PK/PD, função orgânica e suporte extracorpóreo." },
          { title: "Foco", text: "Sem drenagem/remoção, atividade in vitro pode não resolver." },
          { title: "Seguimento", text: "Reavalie cultura, resposta, toxicidade e duração." }
        ],
        exit: "Terapia ativa e proporcional com stewardship registrado."
      },
      {
        id: "imunossuprimido-febril", title: "Imunossuprimido febril: três relógios", timebox: "primeira hora",
        steps: [
          { title: "Choque", text: "Suporte e antimicrobiano não podem esperar definição etiológica completa." },
          { title: "Tipo de imunidade", text: "Neutropenia, célula T, humoral e imunossupressores mudam o mapa de patógenos." },
          { title: "Linha do tempo", text: "Transplante, quimioterapia, profilaxia e exposições organizam hipóteses." },
          { title: "Reavaliação ampliada", text: "Se não responder, reabra foco, resistência, fungos, vírus e causas não infecciosas." }
        ],
        exit: "Mapa temporal e imunológico documentado, com plano de escalada diagnóstica."
      }
    ],
    comparisons: [
      {
        id: "colonizacao-infeccao", title: "Colonização × infecção",
        headers: ["Dimensão", "Colonização mais provável", "Infecção mais provável", "Pergunta-chave"],
        rows: [
          ["Síndrome", "Ausente ou explicada por outro processo", "Compatível com o sítio", "Há disfunção atribuível?"],
          ["Amostra", "Sítio não estéril, baixa qualidade", "Sítio apropriado/estéril", "A coleta representa o foco?"],
          ["Inflamação", "Inespecífica ou estável", "Tendência coerente com doença", "A cinética acompanha o quadro?"],
          ["Conduta", "Evitar antibiótico reflexo", "Tratar + controlar foco", "Qual dano de tratar versus observar?"]
        ]
      },
      {
        id: "betalactamases", title: "ESBL × AmpC × CRE",
        headers: ["Fenótipo", "Pista", "Risco interpretativo", "Ação mental"],
        rows: [
          ["ESBL-E", "Enterobacterales com resistência a cefalosporinas ampliadas", "Suscetibilidade in vitro pode não equivaler em sítio grave", "Use diretriz, sítio e gravidade"],
          ["AmpC-E", "Espécies com risco de expressão induzível/seleção", "Emergência de resistência durante terapia", "Reconheça espécie e exposição"],
          ["CRE", "Resistência a carbapenêmicos", "Mecanismos diferentes exigem agentes diferentes", "Procure carbapenemase/mecanismo"],
          ["CRAB/DTR", "Poucas opções ativas", "Colonização respiratória é frequente", "Confirme infecção e peça apoio especializado"]
        ]
      },
      {
        id: "sepse-mimetizadores", title: "Sepse × mimetizadores inflamatórios",
        headers: ["Pista", "Favorece infecção", "Favorece mimetizador", "Conduta segura"],
        rows: [
          ["Foco", "Fonte anatômica plausível", "Ausência após busca proporcional", "Não pare busca cedo"],
          ["Temporalidade", "Exposição/progressão compatível", "Relação com fármaco, transfusão, pancreatite, autoimune", "Reconstrua linha do tempo"],
          ["Microbiologia", "Resultado coerente e reprodutível", "Contaminante/colonizante", "Interprete pré-teste"],
          ["Resposta", "Melhora com foco + terapia", "Persistência apesar de terapia ativa", "Reabra diagnóstico em checkpoint"]
        ]
      },
      {
        id: "cultura-pcr", title: "Cultura × teste molecular",
        headers: ["Ferramenta", "Força", "Limite", "Uso inteligente"],
        rows: [
          ["Cultura", "Viabilidade, suscetibilidade, epidemiologia", "Tempo e sensibilidade", "Coletar bem antes da terapia quando possível"],
          ["PCR/painel", "Velocidade e alvos difíceis", "Detecta material, painel limitado, custo", "Responder pergunta específica"],
          ["Biomarcador", "Tendência e probabilidade em contexto", "Não localiza foco nem substitui clínica", "Apoiar, não comandar sozinho"],
          ["Microscopia/Gram", "Resposta precoce e qualidade da amostra", "Dependente de amostra/operador", "Conectar morfologia à síndrome"]
        ]
      }
    ],
    concepts: [
      { term: "Controle do foco", category: "Tratamento", definition: "Remover ou corrigir a fonte anatômica que mantém a infecção.", application: "Drenagem, desbridamento, cirurgia ou retirada de dispositivo podem ser tão decisivos quanto o antimicrobiano; timing depende de risco e viabilidade." },
      { term: "Time-out antimicrobiano", category: "Stewardship", definition: "Checkpoint formal para revisar necessidade, espectro, dose, via e duração.", application: "Agende na prescrição inicial; use novos dados e resposta, não apenas hábito." },
      { term: "Antibiograma local", category: "Epidemiologia", definition: "Mapa de suscetibilidade da instituição/UTI, idealmente estratificado por sítio e unidade.", application: "Apoia terapia empírica; não substitui culturas prévias e risco individual." },
      { term: "PK/PD no crítico", category: "Farmacologia", definition: "Relação entre exposição do fármaco, alvo microbiológico e resposta.", application: "Choque, edema, função renal variável, obesidade e suporte extracorpóreo mudam exposição; peça farmácia/monitorização quando disponível." },
      { term: "Descalonamento", category: "Stewardship", definition: "Reduzir espectro ou número de agentes quando os dados permitem.", application: "Inclui suspender se infecção ficar improvável; não significa tratar menos que o necessário." },
      { term: "Duração mínima eficaz", category: "Stewardship", definition: "Curso proporcional a foco, controle anatômico, patógeno e resposta.", application: "Evite números universais; bacteremia, endocardite, osso, SNC e imunossupressão exigem contextos próprios." },
      { term: "Pressão de colonização", category: "Epidemiologia", definition: "Carga de pacientes colonizados e oportunidades de transmissão em uma unidade.", application: "Higiene, isolamento e dispositivos importam; cultura de vigilância não é sinônimo de infecção." },
      { term: "Inóculo e biofilme", category: "Microbiologia", definition: "Alta carga e comunidades aderidas podem reduzir eficácia clínica.", application: "Material protético e coleções reforçam necessidade de controle do foco." },
      { term: "Probabilidade pré-teste", category: "Diagnóstico", definition: "Chance de doença antes do exame, baseada em síndrome e contexto.", application: "Define o valor de cultura, PCR e biomarcador; teste positivo não corrige uma hipótese incoerente." },
      { term: "Janela de oportunidade", category: "Tempo", definition: "Período em que atrasos têm maior custo em síndromes graves.", application: "Rapidez e precisão coexistem: faça o essencial em paralelo e documente o checkpoint." }
    ],
    mnemonics: [
      { code: "FOCO", title: "Sepse sem fonte não é plano", lines: ["F — Fenótipo e falência orgânica", "O — Obter amostras úteis", "C — Controlar a fonte", "O — Otimizar e reavaliar antimicrobiano"], limit: "Organizador; não substitui bundle ou protocolo." },
      { code: "CULTURA", title: "Coleta que muda conduta", lines: ["C — Contexto clínico", "U — Unidade e ecologia", "L — Local correto", "T — Técnica e transporte", "U — Uso prévio de antibiótico", "R — Resultado interpretado", "A — Ação no checkpoint"], limit: "Nem toda síndrome exige todas as culturas." },
      { code: "ABCDE-I", title: "Infecção no ABCDE", lines: ["A — Airway e aspiração", "B — Breathing e foco pulmonar", "C — Circulation, culturas e controle do foco", "D — Disability e neuroinfecção", "E — Exposure, pele, cateteres e epidemiologia", "I — Immunity"], limit: "É varredura inicial, não diagnóstico final." },
      { code: "STOP", title: "Time-out antimicrobiano", lines: ["S — Síndrome ainda é infecciosa?", "T — Testes e tendências", "O — Organismo, órgão e foco", "P — Parar, estreitar ou prosseguir com prazo"], limit: "Sempre registre a próxima revisão." },
      { code: "MDR", title: "Resistência em três perguntas", lines: ["M — Mecanismo provável", "D — Doença ou colonização?", "R — Regime ativo no sítio e paciente?"], limit: "Não seleciona fármaco sozinho." },
      { code: "DEVICE", title: "Dispositivo como foco", lines: ["D — Data de inserção", "E — Exame do sítio", "V — Valor/necessidade atual", "I — Identificar culturas", "C — Controle/remoção", "E — Evolução e complicações"], limit: "Remoção depende do dispositivo, agente e estabilidade." },
      { code: "SNC", title: "Meningite sem atraso evitável", lines: ["S — Suporte e sangue para culturas", "N — Neuroimagem apenas quando indicada", "C — Cobertura e corticosteroide conforme protocolo/contexto"], limit: "Esquemas variam com idade, imunidade e epidemiologia." },
      { code: "HOST", title: "Hospedeiro imunossuprimido", lines: ["H — História de imunidade", "O — Organismo pela exposição", "S — Síndrome e sítio", "T — Timeline de terapia/transplante"], limit: "Não substitui infectologia do imunossuprimido." }
    ],
    alerts: [
      { title: "Ancoragem no lactato", kind: "Viés", message: "Lactato é prognóstico/contextual e tem causas além de hipoperfusão.", countermeasure: "Cruze enchimento capilar, pele, diurese, pressão, eco e tendência." },
      { title: "Cultura virou diagnóstico", kind: "Viés", message: "Resultado positivo em sítio não estéril pode ser colonização.", countermeasure: "Reconstrua síndrome, qualidade da amostra e probabilidade pré-teste." },
      { title: "Escalada sem checkpoint", kind: "Stewardship", message: "Adicionar agentes sucessivamente aumenta toxicidade e obscurece o diagnóstico.", countermeasure: "Defina hipótese, objetivo e horário de reavaliação para cada agente." },
      { title: "Imagem atrasando fonte", kind: "Tempo", message: "Exames extensos podem atrasar drenagem ou desbridamento.", countermeasure: "Pergunte se a imagem muda a ação imediata e envolva equipe de foco cedo." },
      { title: "Dose fixa no paciente variável", kind: "Farmacologia", message: "Função renal e volume de distribuição mudam rapidamente no crítico.", countermeasure: "Recalcule exposição, órgão, peso adequado e suporte extracorpóreo." },
      { title: "Biomarcador como semáforo", kind: "Diagnóstico", message: "Nenhum biomarcador substitui probabilidade clínica e controle do foco.", countermeasure: "Use tendência como uma peça do conjunto, nunca como decisão única." },
      { title: "Tempo único para todos", kind: "Duração", message: "Duração depende de foco, patógeno, controle anatômico e hospedeiro.", countermeasure: "Escreva critério de parada e exceções específicas." },
      { title: "Mimetizador esquecido", kind: "Diagnóstico", message: "Choque inflamatório, fármaco, trombose e doença autoimune podem simular sepse.", countermeasure: "Se a resposta divergir, reabra o diagnóstico em vez de apenas ampliar espectro." }
    ],
    calculators: [
      {
        id: "qsofa", title: "qSOFA — alerta prognóstico contextual",
        description: "Some frequência respiratória ≥22/min, pressão sistólica ≤100 mmHg e alteração do estado mental.",
        fields: [
          { id: "rr", label: "Frequência respiratória (/min)", type: "number", min: 0, max: 80, step: 1 },
          { id: "sbp", label: "Pressão sistólica (mmHg)", type: "number", min: 0, max: 300, step: 1 },
          { id: "mental", label: "Estado mental", type: "select", options: [{ value: "normal", label: "Sem alteração nova" }, { value: "alterado", label: "Alteração nova" }] }
        ],
        limit: "qSOFA não é teste de rastreio e não exclui sepse; avalie SOFA/disfunção orgânica e o quadro completo."
      }
    ],
    questions: [
      { id: "inf-q01", block: "A · Via aérea", prompt: "Paciente com suspeita de meningite, rebaixamento e instabilidade. Qual princípio vem primeiro?", options: ["Punção lombar imediata em qualquer cenário", "ABCDE, culturas e terapia sem atraso indevido", "Aguardar rigidez de nuca", "Solicitar apenas biomarcadores"], correct: 1, explanation: "Estabilização e terapia tempo-dependente não devem ser atrasadas por punção ou imagem quando inseguras." },
      { id: "inf-q02", block: "B · Respiração", prompt: "Na suspeita de PAV, qual dado mais ajuda a evitar sobretratamento?", options: ["Cultura traqueal isolada", "Síndrome clínica integrada e amostra de qualidade", "Radiografia persistente isolada", "Colonização prévia isolada"], correct: 1, explanation: "PAV exige integração clínica; cultura isolada pode refletir colonização." },
      { id: "inf-q03", block: "C · Circulação", prompt: "Após fluido inicial em choque séptico, a melhor próxima pergunta é:", options: ["Quanto volume falta para um número fixo?", "Há responsividade e tolerância a mais fluido?", "O lactato normalizou em uma única medida?", "Posso ignorar o foco?"], correct: 1, explanation: "Reavaliação dinâmica reduz fluidos cegos e integra vasopressor, perfusão e tolerância." },
      { id: "inf-q04", block: "C · Foco", prompt: "Coleção drenável com choque e antibiótico ativo. O componente decisivo adicional é:", options: ["Trocar para antibiótico mais amplo automaticamente", "Controle do foco no tempo apropriado", "Esperar negativar hemocultura", "Apenas repetir biomarcador"], correct: 1, explanation: "Antimicrobiano não substitui drenagem/desbridamento quando a fonte persiste." },
      { id: "inf-q05", block: "D · Neurológico", prompt: "Qual afirmação sobre a tríade clássica da meningite é correta?", options: ["Sua ausência exclui doença", "Pode estar incompleta, portanto não exclui", "Só ocorre em vírus", "Dispensa hemoculturas"], correct: 1, explanation: "Apresentações incompletas são comuns; a suspeita depende do conjunto." },
      { id: "inf-q06", block: "E · Exposição", prompt: "Dor desproporcional e progressão rápida em partes moles exigem:", options: ["Aguardar escore laboratorial", "Avaliação cirúrgica imediata", "Apenas ultrassom ambulatorial", "Corticoide empírico"], correct: 1, explanation: "Infecção necrosante é diagnóstico clínico-operatório e atraso de cirurgia é perigoso." },
      { id: "inf-q07", block: "Stewardship", prompt: "Em 48–72 horas, culturas esclarecem foco e agente suscetível. A ação mais racional é:", options: ["Manter tudo até alta", "Revisar e estreitar/suspender o que não é necessário", "Adicionar cobertura dupla", "Ignorar função renal"], correct: 1, explanation: "Time-out é oportunidade de confirmar diagnóstico, descalonar e definir duração." },
      { id: "inf-q08", block: "Resistência", prompt: "Cultura respiratória com CRAB em paciente sem nova síndrome respiratória significa:", options: ["Infecção comprovada", "Colonização possível; correlacionar clinicamente", "Obrigação de terapia combinada", "Endocardite"], correct: 1, explanation: "CRAB frequentemente coloniza via aérea; tratar cultura isolada causa dano." },
      { id: "inf-q09", block: "Imunossupressão", prompt: "No neutropênico febril instável, deve-se:", options: ["Esperar neutrófilos subirem", "Coletar adequadamente e iniciar cobertura urgente conforme protocolo", "Fazer toque retal de rotina", "Excluir infecção se não houver pus"], correct: 1, explanation: "Inflamação pode ser mínima; instabilidade exige resposta rápida e contextual." },
      { id: "inf-q10", block: "Duração", prompt: "Qual é o melhor modo de definir duração antimicrobiana?", options: ["Um número igual para todos", "Foco + controle anatômico + patógeno + hospedeiro + resposta", "Até a radiografia zerar", "Enquanto PCR estiver acima do normal"], correct: 1, explanation: "Duração deve ser individualizada por síndrome e evolução, com critério de parada." }
    ],
    cases: [
      { id: "inf-c01", block: "Choque", prompt: "Paciente com choque, hidronefrose obstrutiva e piúria recebe terapia ativa. Próximo passo prioritário?", options: ["Apenas ampliar espectro", "Descompressão/controle urológico do foco", "Esperar cultura final", "Suspender suporte"], correct: 1, explanation: "Fonte obstruída exige controle anatômico urgente em paralelo ao suporte." },
      { id: "inf-c02", block: "PAV", prompt: "Paciente ventilado tem secreção colonizada, sem febre, sem novo infiltrado e sem piora. Melhor conduta?", options: ["Tratar cultura", "Reavaliar e não rotular PAV apenas pela cultura", "Cobertura tripla", "Trocar tubo por rotina"], correct: 1, explanation: "Sem síndrome compatível, colonização é mais provável que PAV." },
      { id: "inf-c03", block: "SNC", prompt: "Suspeita alta de meningite e déficit focal novo. A imagem será feita. O que não pode ocorrer?", options: ["Culturas de sangue", "Atraso evitável da terapia por esperar imagem/punção", "Precaução apropriada", "Monitorização"], correct: 1, explanation: "Imagem pode ser indicada, mas não deve criar atraso terapêutico perigoso." },
      { id: "inf-c04", block: "Resistência", prompt: "CRE em urocultura de paciente assintomático com cateter crônico. Melhor leitura inicial?", options: ["Choque oculto", "Bacteriúria/colonização possível; avaliar indicação real de tratar", "Pneumonia", "Meningite"], correct: 1, explanation: "Cultura sem síndrome não equivale a infecção; evite antimicrobiano reflexo." },
      { id: "inf-c05", block: "Partes moles", prompt: "Dor intensa, bolhas e hipotensão, mas TC sem gás. Melhor próximo passo?", options: ["Excluir fasceíte", "Avaliação cirúrgica imediata", "Alta com analgesia", "Aguardar PCR"], correct: 1, explanation: "Ausência de gás não exclui infecção necrosante; clínica e exploração prevalecem." },
      { id: "inf-c06", block: "Candidemia", prompt: "Hemoculturas com Candida em paciente com CVC. Qual plano é incompleto?", options: ["Avaliar cateter e foco", "Repetir culturas até documentar depuração", "Tratar apenas até desaparecer febre", "Identificar espécie/suscetibilidade"], correct: 2, explanation: "Defervescência isolada não documenta depuração nem exclui foco/complicação." }
    ],
    flashcards: [
      { id: "inf-f01", topic: "Sepse", front: "qSOFA exclui sepse quando baixo?", back: "Não.", pearl: "É alerta prognóstico contextual, não teste de rastreio isolado." },
      { id: "inf-f02", topic: "Sepse", front: "Antimicrobiano substitui controle do foco?", back: "Não.", pearl: "Coleções, tecido necrótico e dispositivos podem manter a infecção." },
      { id: "inf-f03", topic: "Microbiologia", front: "Qualidade ou quantidade de culturas?", back: "Qualidade orientada pela síndrome.", pearl: "Sítio, volume, técnica e tempo definem utilidade." },
      { id: "inf-f04", topic: "PAV", front: "Cultura traqueal positiva confirma PAV?", back: "Não isoladamente.", pearl: "Colonização é comum; exija síndrome compatível." },
      { id: "inf-f05", topic: "Stewardship", front: "Quando planejar o time-out?", back: "Na prescrição inicial.", pearl: "Especifique horário e perguntas de revisão." },
      { id: "inf-f06", topic: "Meningite", front: "Imagem deve sempre anteceder punção?", back: "Não.", pearl: "Use critérios de risco; não crie atraso terapêutico." },
      { id: "inf-f07", topic: "Partes moles", front: "LRINEC baixo exclui fasceíte?", back: "Não.", pearl: "É incapaz de substituir julgamento e cirurgia." },
      { id: "inf-f08", topic: "Resistência", front: "CRE é um único mecanismo?", back: "Não.", pearl: "Carbapenemases e outros mecanismos mudam escolha terapêutica." },
      { id: "inf-f09", topic: "Neutropenia", front: "Ausência de pus reduz muito a suspeita?", back: "Não.", pearl: "Neutropenia pode apagar sinais inflamatórios." },
      { id: "inf-f10", topic: "Endocardite", front: "Defervescência exclui complicação?", back: "Não.", pearl: "Busque insuficiência, abscesso, embolização e bacteremia persistente." },
      { id: "inf-f11", topic: "C. difficile", front: "Deve-se testar fezes formadas de rotina?", back: "Não.", pearl: "Teste o paciente com síndrome compatível e amostra apropriada." },
      { id: "inf-f12", topic: "Candida", front: "Candidemia é contaminante comum?", back: "Não deve ser tratada como contaminante.", pearl: "Exige avaliação, terapia e documentação de depuração." },
      { id: "inf-f13", topic: "PK/PD", front: "Função renal do crítico é estática?", back: "Não.", pearl: "Reavalie depuração aumentada, lesão renal e suporte extracorpóreo." },
      { id: "inf-f14", topic: "Duração", front: "Radiografia lenta justifica prolongar PAV?", back: "Não isoladamente.", pearl: "Imagem pode atrasar a melhora clínica." },
      { id: "inf-f15", topic: "Diagnóstico", front: "Biomarcador localiza o foco?", back: "Não.", pearl: "É uma peça probabilística, não mapa anatômico." },
      { id: "inf-f16", topic: "Dispositivo", front: "Todo cateter positivo deve permanecer?", back: "Depende do agente, foco, complicações e necessidade.", pearl: "Decisão é clínica e protocolar; avalie controle do foco." },
      { id: "inf-f17", topic: "Toxina", front: "Choque tóxico exige procurar foco oculto?", back: "Sim.", pearl: "Ferida, corpo estranho e tecido profundo podem ser discretos." },
      { id: "inf-f18", topic: "Epidemiologia", front: "Antibiograma local substitui histórico individual?", back: "Não.", pearl: "Combine unidade, sítio, culturas e exposições prévias." }
    ],
    references: [
      { id: "ssc2026", title: "Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2026", group: "SCCM/ESICM", year: 2026, url: "https://doi.org/10.1007/s00134-026-08361-1" },
      { id: "sepsis3", title: "The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3)", group: "JAMA", year: 2016, url: "https://pubmed.ncbi.nlm.nih.gov/26903338/" },
      { id: "amr2024", title: "IDSA 2024 Guidance on Antimicrobial-Resistant Gram-Negative Infections", group: "IDSA", year: 2024, url: "https://www.idsociety.org/practice-guideline/amr-guidance/" },
      { id: "hapvap2016", title: "ATS/IDSA Clinical Practice Guidelines for HAP/VAP", group: "ATS/IDSA", year: 2016, url: "https://www.idsociety.org/practice-guideline/hap_vap/" },
      { id: "whoMeningitis2025", title: "WHO guidelines on meningitis diagnosis, treatment and care", group: "WHO", year: 2025, url: "https://www.who.int/publications/i/item/9789240108042" },
      { id: "idsaNeutropenia2011", title: "IDSA guideline for antimicrobial agents in neutropenic patients with cancer", group: "IDSA", year: 2011, url: "https://www.idsociety.org/practice-guideline/neutropenic-patients-with-cancer/" },
      { id: "ahaEndocarditis2015", title: "Infective Endocarditis in Adults: Diagnosis, Antimicrobial Therapy, and Management of Complications", group: "AHA", year: 2015, url: "https://pubmed.ncbi.nlm.nih.gov/26373316/" },
      { id: "idsaSsti2014", title: "IDSA Practice Guidelines for Skin and Soft Tissue Infections", group: "IDSA", year: 2014, url: "https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/" },
      { id: "idsaCdiff2021", title: "SHEA/IDSA Focused Update for Management of Clostridioides difficile Infection", group: "SHEA/IDSA", year: 2021, url: "https://www.idsociety.org/practice-guideline/clostridioides-difficile-2021-focused-update/" },
      { id: "idsaCandida2016", title: "IDSA Clinical Practice Guideline for the Management of Candidiasis", group: "IDSA", year: 2016, url: "https://www.idsociety.org/practice-guideline/candidiasis/" },
      { id: "balance2024", title: "Antibiotic Treatment for 7 versus 14 Days in Patients with Bloodstream Infections", group: "BALANCE / NEJM", year: 2024, url: "https://pubmed.ncbi.nlm.nih.gov/39565030/" },
      { id: "andromeda2019", title: "Peripheral Perfusion versus Lactate-Targeted Resuscitation in Septic Shock", group: "ANDROMEDA-SHOCK / JAMA", year: 2019, url: "https://pubmed.ncbi.nlm.nih.gov/30772908/" }
    ]
  };

  window.ANTIGRAVITY_INFECTOLOGY = catalog;
  window.ANTIGRAVITY_CRITICAL_MODULE = catalog;
})();
