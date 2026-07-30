"use strict";

(() => {
  const catalog = {
    meta: {
      schemaVersion: "critical-module-v1",
      moduleVersion: "1.0.0",
      slug: "pneumologia-critica",
      title: "Pneumologia Crítica",
      subtitle: "Insuficiência respiratória, SDRA, doenças obstrutivas, hemoptise e TEP organizados em decisões práticas, fisiologia visível e treino Turbo TEMI.",
      kicker: "🫁 Plantão · UTI · Turbo TEMI",
      emoji: "🫁",
      updatedAt: "2026-07-30",
      status: "em-revisao-medica",
      readyEvent: "antigravity:pulmonology-ready",
      safetyNotice: "Material educacional em revisão médica. Não substitui avaliação à beira-leito, gasometria e mecânica seriadas, protocolo de ventilação, fisioterapia respiratória, pneumologista/intensivista nem dupla checagem de parâmetros e dispositivos."
    },
    quickActions: [
      { icon: "🫧", title: "Oxigenação com meta", text: "Defina fenótipo, alvo, dispositivo e critérios explícitos de falha/escalada.", href: "#fluxos" },
      { icon: "🛡️", title: "Ventilação protetora", text: "Use peso predito, limite estresse/pressão e trate a causa da lesão pulmonar.", href: "#ferramentas" },
      { icon: "🔄", title: "Prona cedo", text: "Em SDRA grave selecionada, considere prona prolongada com equipe treinada e checklist.", href: "#emergencias" },
      { icon: "⏰", title: "Não atrasar IOT", text: "Suporte não invasivo exige vigilância e gatilhos objetivos para intubação.", href: "#alertas" }
    ],
    emergencies: [
      {
        id: "sdra", category: "Hipoxemia", title: "SDRA moderada a grave",
        signal: "Hipoxemia aguda com opacidades bilaterais não plenamente explicadas por edema cardiogênico, em contexto de agressão compatível.",
        firstHour: ["Confirme fenótipo, tempo, imagem e causa; exclua mimetizadores tratáveis.", "Ventile com volume corrente baseado em peso predito e limite pressão de platô/driving pressure contextual.", "Titule PEEP/FiO₂ e evite manobras de recrutamento prolongadas de rotina.", "Considere prona prolongada na SDRA grave e resgate/ECMO em casos selecionados com centro experiente."],
        decisive: ["Gasometria com FiO₂/PEEP documentadas", "Pressão de platô e mecânica", "Imagem e avaliação de edema cardiogênico/carga"],
        doNot: ["Não use peso real para VT.", "Não normalize CO₂ à custa de pressão lesiva.", "Não atrase prona/resgate por repetição de ajustes ineficazes."],
        tags: ["ARDS", "protetora", "prona"], referenceIds: ["atsArds2024", "arma2000", "proseva2013", "art2017"]
      },
      {
        id: "ir-hipoxemica", category: "Hipoxemia", title: "Insuficiência respiratória hipoxêmica aguda",
        signal: "Taquipneia, esforço, hipoxemia e infiltrados; gravidade não é capturada apenas pela saturação.",
        firstHour: ["Trate causa e corrija hipoxemia com dispositivo adequado.", "Monitore frequência, trabalho, estado mental, hemodinâmica, gasometria e trajetória.", "Cânula de alto fluxo pode ser opção em fenótipo apropriado, com reavaliação estreita.", "Defina gatilhos de intubação antes de iniciar suporte não invasivo."],
        decisive: ["Trajetória clínica", "Gasometria contextual", "Imagem e POCUS/eco quando disponíveis"],
        doNot: ["Não interprete melhora da SpO₂ como redução do esforço.", "Não prolongue suporte falho.", "Não aplique achado de trial fora da população estudada."],
        tags: ["HFNC", "CNAF", "escalada"], referenceIds: ["florali2015", "soho2026"]
      },
      {
        id: "dpoc-hipercapnica", category: "Obstrutiva", title: "Exacerbação de DPOC com acidose hipercápnica",
        signal: "Dispneia, obstrução e aumento de PaCO₂ com acidemia, sem contraindicação imediata à VNI.",
        firstHour: ["Oxigene com alvo individualizado e evite hiperóxia.", "Broncodilate, trate gatilho e avalie secreção/fadiga.", "VNI é preferencial quando indicada e tolerada, com monitorização de resposta.", "Prepare intubação se deterioração, contraindicação ou falha precoce."],
        decisive: ["Gasometria seriada", "Trabalho respiratório e consciência", "Causa da exacerbação e imagem"],
        doNot: ["Não negar oxigênio necessário por medo de CO₂.", "Não usar VNI sem plano de falha.", "Não sedar profundamente para forçar máscara."],
        tags: ["DPOC", "VNI", "hipercapnia"], referenceIds: ["ersAtsNiv2017", "gold2026"]
      },
      {
        id: "asma-quase-fatal", category: "Obstrutiva", title: "Asma grave/quase fatal",
        signal: "Fala entrecortada, exaustão, silêncio auscultatório, alteração mental, hipoxemia ou PaCO₂ normalizando/subindo.",
        firstHour: ["Oxigênio, broncodilatação repetida/contínua e corticosteroide conforme protocolo.", "Corrija gatilhos e considere adjuvantes no fenótipo grave.", "Intube por deterioração clínica, não por um único número.", "Na VM, priorize tempo expiratório, baixa frequência e aceitação de hipercapnia permissiva quando apropriada."],
        decisive: ["Exame e trajetória", "Gasometria quando grave", "Curvas de fluxo e auto-PEEP após IOT"],
        doNot: ["Não confunda tórax silencioso com melhora.", "Não empilhe ciclos ventilatórios.", "Não persiga PaCO₂ normal com hiperinsuflação dinâmica."],
        tags: ["asma", "auto-PEEP", "hiperinsuflação"], referenceIds: ["gina2025"]
      },
      {
        id: "hemoptise-ameacadora", category: "Via aérea", title: "Hemoptise ameaçadora à vida",
        signal: "Sangramento com risco de asfixia, troca gasosa comprometida ou instabilidade; volume estimado é menos importante que impacto.",
        firstHour: ["Proteja via aérea e posicione pulmão sangrante para baixo quando lateralização for conhecida e apropriada.", "Acione broncoscopia, radiologia intervencionista e cirurgia conforme recurso.", "Corrija coagulopatia reversível e estabilize hemodinâmica.", "Localize fonte com estratégia que não atrase controle."],
        decisive: ["Lateralização por imagem/broncoscopia", "Hemograma/coagulação", "AngioTC quando estável e disponível"],
        doNot: ["Não subestime por volume relatado.", "Não deixe pulmão sadio receber inundação quando pode lateralizar.", "Não atrasar controle definitivo por investigação sequencial excessiva."],
        tags: ["via aérea", "broncoscopia", "embolização"], referenceIds: ["hemoptysisReview2017"]
      },
      {
        id: "tep-alto-risco", category: "Vascular", title: "TEP de alto risco",
        signal: "Suspeita de embolia pulmonar com choque/hipotensão persistente ou deterioração, frequentemente com sobrecarga de VD.",
        firstHour: ["ABCDE e suporte evitando piora abrupta do VD.", "Use eco/POCUS e imagem conforme estabilidade e probabilidade.", "Defina reperfusão com equipe e contraindicações; não espere exame impossível no instável.", "Planeje anticoagulação e terapia de resgate conforme risco hemorrágico."],
        decisive: ["Probabilidade clínica", "Eco com disfunção de VD no instável", "AngioTC quando factível"],
        doNot: ["Não sobrecarregue volume cegamente.", "Não intube sem plano hemodinâmico.", "Não use dímero-D em cenário de alta probabilidade/instabilidade para excluir."],
        tags: ["TEP", "ventrículo direito", "reperfusão"], referenceIds: ["escPe2019"]
      },
      {
        id: "pneumotorax-hipertensivo", category: "Pleura", title: "Pneumotórax hipertensivo",
        signal: "Deterioração respiratória/hemodinâmica abrupta com pressão pleural crescente, especialmente sob pressão positiva.",
        firstHour: ["Reconheça clinicamente e descomprima sem aguardar imagem quando instável.", "Converta para drenagem definitiva e confirme funcionamento.", "Reduza fatores ventilatórios que perpetuam fuga quando possível.", "Investigue causa e pulmão contralateral após estabilização."],
        decisive: ["Clínica e resposta à descompressão", "POCUS se imediatamente disponível sem atraso", "Imagem após estabilização"],
        doNot: ["Não aguarde radiografia no choque.", "Não confie apenas em desvio traqueal tardio.", "Não assuma que dreno instalado está pérvio/posicionado."],
        tags: ["pleura", "choque obstrutivo", "barotrauma"], referenceIds: ["btsPleural2023"]
      },
      {
        id: "auto-peep-colapso", category: "Mecânica", title: "Colapso por auto-PEEP/hiperinsuflação dinâmica",
        signal: "Hipotensão ou parada após intubação em obstrutivo, fluxo expiratório que não zera e pressão de pico alta.",
        firstHour: ["Desconecte brevemente do ventilador se colapso grave e permita exalação, enquanto trata causas simultâneas.", "Reduza frequência/volume-minuto e aumente tempo expiratório.", "Trate broncoespasmo, secreção e assincronia.", "Meça auto-PEEP quando possível e diferencie de pneumotórax."],
        decisive: ["Curva fluxo-tempo", "Pausa expiratória", "Pressão pico versus platô e ultrassom pleural"],
        doNot: ["Não aumentar frequência por reflexo.", "Não perseguir PaCO₂ normal.", "Não ignorar pneumotórax como diagnóstico concorrente."],
        tags: ["auto-PEEP", "DPOC", "asma"], referenceIds: ["ersAtsNiv2017", "gina2025"]
      },
      {
        id: "falha-extubacao", category: "Desmame", title: "Falha de extubação e estridor",
        signal: "Obstrução alta, edema, fraqueza, secreção, disfunção cardíaca ou fadiga após retirada do tubo.",
        firstHour: ["Reconheça mecanismo e gravidade; oxigene e prepare reintubação se necessário.", "Não use VNI para mascarar falha com necessidade clara de via aérea, salvo contexto selecionado/protocolo.", "Trate causa provável e envolva equipe de via aérea em estridor grave.", "Revise prevenção: teste, cuff leak contextual, secreção, tosse e risco cardíaco."],
        decisive: ["Exame de via aérea", "Gasometria e trabalho respiratório", "POCUS/eco e avaliação de secreções"],
        doNot: ["Não atrasar reintubação necessária.", "Não atribuir toda falha a edema.", "Não confundir suporte pós-extubação preventivo com resgate de falha estabelecida."],
        tags: ["extubação", "estridor", "reintubação"], referenceIds: ["ersAtsNiv2017"]
      },
      {
        id: "ecmo-resgate", category: "Resgate", title: "SDRA refratária e avaliação para VV-ECMO",
        signal: "Hipoxemia/hipercapnia graves apesar de ventilação otimizada, prona e medidas de resgate, em paciente potencialmente reversível.",
        firstHour: ["Confirme que ventilação protetora e prona foram aplicadas adequadamente.", "Contate centro de ECMO cedo; transferência tardia pode fechar janela.", "Avalie reversibilidade, tempo de VM, comorbidades, sangramento e recursos.", "Mantenha proteção pulmonar e suporte durante decisão/transferência."],
        decisive: ["Gravidade e duração", "Resposta a prona/otimização", "Critérios e contraindicações do centro"],
        doNot: ["Não encare ECMO como correção de ventilação não otimizada.", "Não espere colapso irreversível para discutir.", "Não omita riscos hemorrágicos e de transporte."],
        tags: ["VV-ECMO", "resgate", "EOLIA"], referenceIds: ["atsArds2024", "eolia2018"]
      }
    ],
    pathways: [
      {
        id: "hipoxemia-escalada", title: "Hipoxemia: dispositivo → resposta → escalada", timebox: "minutos–horas",
        steps: [
          { title: "Fenótipo e causa", text: "Pneumonia, edema, SDRA, TEP, atelectasia, shunt e obstrução pedem estratégias diferentes." },
          { title: "Meta e dispositivo", text: "Defina alvo individualizado e escolha oxigênio convencional, alto fluxo ou VNI pelo fenótipo." },
          { title: "Resposta integral", text: "SpO₂, esforço, frequência, consciência, hemodinâmica e gasometria/trajectória." },
          { title: "Gatilho de falha", text: "Escreva previamente quando intubar; evite suporte indefinido em deterioração." }
        ],
        exit: "Dispositivo adequado, causa em tratamento e critério de escalada documentado."
      },
      {
        id: "sdra-bundle", title: "SDRA: proteção pulmonar em camadas", timebox: "primeiras 6 h",
        steps: [
          { title: "Peso predito", text: "Calcule pela altura e sexo; não use peso real para volume corrente." },
          { title: "Pressões", text: "Monitore platô, driving pressure e complacência no contexto." },
          { title: "PEEP/FiO₂", text: "Titule evitando tanto atelectrauma quanto hiperdistensão/hemodinâmica ruim." },
          { title: "Prona", text: "Na grave selecionada, aplique cedo, prolongada e com checklist." },
          { title: "Resgate", text: "Bloqueio neuromuscular/ECMO em pacientes selecionados; evite recrutamento prolongado rotineiro." }
        ],
        exit: "Ventilação protetora comprovada por números e estratégia de resgate definida."
      },
      {
        id: "obstrutivo-intubado", title: "Obstrutivo intubado: esvaziar antes de ventilar mais", timebox: "minutos",
        steps: [
          { title: "Detecte", text: "Fluxo expiratório não zera, auto-PEEP e hipotensão sugerem aprisionamento." },
          { title: "Dê tempo", text: "Reduza frequência, ajuste VT/fluxo inspiratório e prolongue expiração." },
          { title: "Aceite", text: "Hipercapnia permissiva pode ser preferível a hiperinsuflação, se não houver contraindicação." },
          { title: "Trate causa", text: "Broncodilatação, secreção, tubo e assincronia." },
          { title: "Reavalie", text: "Curvas, pressões e hemodinâmica após cada mudança." }
        ],
        exit: "Fluxo retorna a zero ou melhora, auto-PEEP/hemodinâmica controladas."
      },
      {
        id: "desmame-extubacao", title: "Desmame: pronto → teste → proteger extubação", timebox: "diário",
        steps: [
          { title: "Prontidão", text: "Causa melhorando, oxigenação/hemodinâmica compatíveis e capacidade de iniciar esforço." },
          { title: "Teste espontâneo", text: "Avalie tolerância sem transformar índice isolado em sentença." },
          { title: "Via aérea", text: "Consciência, tosse, secreção e risco de edema importam." },
          { title: "Pós-extubação", text: "Planeje alto fluxo/VNI preventiva apenas para perfil de risco e protocolo adequados." },
          { title: "Falha", text: "Reintube sem atraso quando suporte não invasivo não for seguro." }
        ],
        exit: "Plano de extubação e resgate compartilhado com equipe."
      },
      {
        id: "hemoptise", title: "Hemoptise: proteger pulmão saudável e controlar fonte", timebox: "imediato",
        steps: [
          { title: "Impacto", text: "Defina ameaça por via aérea, oxigenação e hemodinâmica, não só por volume." },
          { title: "Lateralize", text: "Se fonte conhecida, pulmão sangrante para baixo quando apropriado." },
          { title: "Via aérea", text: "Planeje tubo/calibre e broncoscopia com equipe experiente." },
          { title: "Controle", text: "Embolização arterial é frequentemente central; cirurgia em cenários selecionados." }
        ],
        exit: "Via aérea protegida, lado/fonte identificados e equipe definitiva acionada."
      }
    ],
    comparisons: [
      {
        id: "pico-plato", title: "Pressão de pico × platô",
        headers: ["Padrão", "Pico", "Platô", "Hipótese dominante"],
        rows: [
          ["Resistência elevada", "Alta", "Normal/próxima do basal", "Broncoespasmo, secreção, tubo dobrado"],
          ["Complacência reduzida", "Alta", "Alta", "SDRA, edema, atelectasia, pneumotórax, parede torácica"],
          ["Ambas", "Alta", "Alta", "Componente resistivo + elástico"],
          ["Ação", "Inspecione circuito/fluxo", "Faça pausa com segurança", "Trate mecanismo, não apenas alarme"]
        ]
      },
      {
        id: "hfnc-vni-iot", title: "Alto fluxo × VNI × IOT",
        headers: ["Suporte", "Melhor encaixe", "Sinal de alerta", "Limite"],
        rows: [
          ["Alto fluxo", "Hipoxemia selecionada, paciente cooperativo", "Esforço/taquipneia persistentes", "Não protege via aérea"],
          ["VNI", "DPOC acidótica, edema cardiogênico e perfis selecionados", "Piora de pH, consciência ou instabilidade", "Interface e risco de atraso"],
          ["IOT", "Falha, via aérea, exaustão, choque ou hipoxemia refratária", "Pré-oxigenação/hemodinâmica frágeis", "Procedimento de alto risco"],
          ["Regra", "Teste com objetivo", "Reavalie cedo", "Escalone antes do colapso"]
        ]
      },
      {
        id: "sdra-edema", title: "SDRA × edema cardiogênico",
        headers: ["Pista", "SDRA", "Cardiogênico", "Cuidado"],
        rows: [
          ["Contexto", "Agressão inflamatória compatível", "Congestão/disfunção cardíaca", "Podem coexistir"],
          ["Eco/POCUS", "Pode mostrar VD/coração não dominante", "Pressões/fluxos e congestão compatíveis", "Interprete com ventilação"],
          ["Resposta", "Proteção + causa + estratégia hídrica", "Descongestão/suporte cardíaco", "Evite teste terapêutico cego"],
          ["Definição", "Origem não plenamente explicada por edema hidrostático", "Predomínio hidrostático", "Use conjunto, não um exame"]
        ]
      },
      {
        id: "broncoespasmo-pneumotorax", title: "Broncoespasmo × pneumotórax sob VM",
        headers: ["Pista", "Broncoespasmo/auto-PEEP", "Pneumotórax", "Ação imediata"],
        rows: [
          ["Ausculta", "Sibilos ou silêncio difuso", "Assimetria pode ocorrer", "Examine sem atrasar suporte"],
          ["Curva", "Expiração não zera", "Mudança súbita/pressões", "Veja curvas e circuito"],
          ["POCUS", "Deslizamento preservado em geral", "Ausência de deslizamento no contexto", "Use se imediato"],
          ["Choque", "Melhora com exalação", "Melhora com descompressão", "Instável: trate hipótese letal"]
        ]
      }
    ],
    concepts: [
      { term: "Peso corporal predito", category: "Ventilação", definition: "Estimativa baseada em altura e sexo, relacionada ao tamanho pulmonar.", application: "É o denominador para VT protetor; obesidade não aumenta o tamanho do pulmão." },
      { term: "Driving pressure", category: "Mecânica", definition: "Diferença entre pressão de platô e PEEP total em condições válidas.", application: "Apoia leitura de estresse relativo; depende de esforço, pausa e mecânica da parede." },
      { term: "Auto-PEEP", category: "Mecânica", definition: "Pressão expiratória intrínseca por esvaziamento incompleto.", application: "Suspeite se fluxo não zera; reduza volume-minuto e aumente tempo expiratório." },
      { term: "Complacência", category: "Mecânica", definition: "Mudança de volume por mudança de pressão.", application: "Tendência é mais útil que um número isolado; parede torácica e esforço interferem." },
      { term: "Relação P/F", category: "Oxigenação", definition: "PaO₂ dividida pela FiO₂ em fração.", application: "Classifica hipoxemia no contexto, mas varia com PEEP, tempo, posição e FiO₂." },
      { term: "Hipercapnia permissiva", category: "Proteção", definition: "Aceitar CO₂ mais alto para evitar ventilação lesiva.", application: "Requer contexto e contraindicações; pH e hemodinâmica importam." },
      { term: "Prona prolongada", category: "Resgate", definition: "Posição ventral mantida por sessão longa em SDRA grave selecionada.", application: "Benefício depende de seleção, precocidade, duração, proteção pulmonar e equipe treinada." },
      { term: "ROX", category: "Monitorização", definition: "Índice que combina oxigenação e frequência respiratória durante alto fluxo.", application: "Pode apoiar tendência; não deve atrasar intubação nem substituir exame." },
      { term: "P-SILI", category: "Fisiologia", definition: "Hipótese de lesão associada a esforço inspiratório intenso durante respiração espontânea.", application: "Observe esforço e trajetória; evidência não autoriza intubação por um único índice." },
      { term: "Potência mecânica", category: "Ventilação", definition: "Energia transferida ao sistema respiratório por unidade de tempo.", application: "Integra VT, pressões, fluxo e frequência; conceito útil, alvo universal ainda limitado." }
    ],
    mnemonics: [
      { code: "PROTEGE", title: "VM protetora em camadas", lines: ["P — Peso predito", "R — Recrutamento prolongado: evitar rotina", "O — Oxigenação com PEEP/FiO₂", "T — Tensão/pressões", "E — Expiração e auto-PEEP", "G — Gasometria contextual", "E — Etiologia e evolução"], limit: "Organizador; ajuste individualmente." },
      { code: "FLUXO", title: "Obstrutivo sob VM", lines: ["F — Fluxo expiratório zera?", "L — Longo tempo expiratório", "U — Use baixa frequência", "X — eXamine auto-PEEP e pneumotórax", "O — Oxigene e trate obstrução"], limit: "Não substitui análise de curvas e mecânica." },
      { code: "PRONA", title: "Prona segura", lines: ["P — Paciente e indicação", "R — Recursos e equipe", "O — Olhos, pele e dispositivos", "N — Nutrição e neuroproteção", "A — Avaliar resposta/complicações"], limit: "Use checklist institucional completo." },
      { code: "FALHA", title: "Suporte não invasivo falhando", lines: ["F — Frequência/esforço", "A — Acidose/alteração mental", "L — Lesão e trajetória", "H — Hemodinâmica/hipoxemia", "A — Airway e aspiração"], limit: "Gatilhos devem ser definidos antes do teste." },
      { code: "HEMOPTISE", title: "Sangramento pulmonar crítico", lines: ["H — Hemodinâmica", "E — Esquerda/direita: lateralizar", "M — Manter pulmão sadio protegido", "O — Oxigenação", "P — Proteger via aérea", "T — Tratar coagulopatia", "I — Intervenção", "S — Sítio", "E — Embolização/equipe"], limit: "A sequência depende da estabilidade e recursos." },
      { code: "EXTUBA", title: "Prontidão para extubação", lines: ["E — Etiologia melhorando", "X — troca gasosa", "T — Tosse", "U — Unidade neurológica/consciência", "B — Balanço e coração", "A — Airway e secreções"], limit: "Nenhum item isolado determina sucesso." },
      { code: "TEP-VD", title: "TEP instável", lines: ["T — Tensão arterial/choque", "E — Eco de VD", "P — Probabilidade", "V — Volume com cautela", "D — Decidir reperfusão"], limit: "Não substitui equipe e diretriz." },
      { code: "DOPE", title: "Deterioração ventilatória abrupta", lines: ["D — Deslocamento do tubo", "O — Obstrução", "P — Pneumotórax", "E — Equipamento"], limit: "Acrescente auto-PEEP e fisiologia do paciente ao checklist." }
    ],
    alerts: [
      { title: "Saturação bonita, paciente pior", kind: "Monitorização", message: "SpO₂ pode melhorar enquanto esforço e fadiga progridem.", countermeasure: "Monitore frequência, esforço, consciência, hemodinâmica e trajetória." },
      { title: "VT pelo peso real", kind: "Ventilação", message: "O pulmão acompanha altura, não massa corporal total.", countermeasure: "Calcule peso predito e documente o denominador." },
      { title: "Pico alto = pulmão rígido", kind: "Mecânica", message: "Pressão de pico inclui resistência e não define complacência sozinha.", countermeasure: "Compare pico com platô e examine circuito/broncoespasmo." },
      { title: "PEEP sempre maior", kind: "Ventilação", message: "PEEP pode recrutar ou hiperdistender e comprometer hemodinâmica.", countermeasure: "Titule por fenótipo, resposta e tolerância." },
      { title: "VNI como adiamento", kind: "Tempo", message: "Suporte não invasivo falho pode atrasar IOT e piorar desfecho.", countermeasure: "Defina gatilhos de falha e reavalie em intervalos curtos." },
      { title: "CO₂ normal a qualquer custo", kind: "Obstrutiva", message: "Aumentar volume-minuto pode causar hiperinsuflação dinâmica.", countermeasure: "Priorize esvaziamento e proteção; aceite hipercapnia quando apropriada." },
      { title: "P/F sem contexto", kind: "Diagnóstico", message: "P/F muda com FiO₂, PEEP, posição e tempo.", countermeasure: "Registre condições da medida e use tendência." },
      { title: "Prona como manobra de oxigênio", kind: "SDRA", message: "Benefício não depende apenas de subir SpO₂ imediatamente.", countermeasure: "Use indicação, duração e proteção do protocolo estudado." }
    ],
    calculators: [
      {
        id: "pf-pbw", title: "P/F + peso corporal predito",
        description: "Converta FiO₂ em fração e estime o peso predito para contextualizar oxigenação e volume corrente protetor.",
        fields: [
          { id: "pao2", label: "PaO₂ (mmHg)", type: "number", min: 1, max: 800, step: 1 },
          { id: "fio2", label: "FiO₂ (0,21–1 ou 21–100%)", type: "number", min: 0.21, max: 100, step: 0.01 },
          { id: "height", label: "Altura (cm)", type: "number", min: 100, max: 230, step: 0.1 },
          { id: "sex", label: "Equação de referência", type: "select", options: [{ value: "male", label: "Masculina" }, { value: "female", label: "Feminina" }] }
        ],
        limit: "Ferramenta educacional. Não classifica SDRA sem critérios completos nem define parâmetros ventilatórios isoladamente."
      }
    ],
    questions: [
      { id: "pne-q01", block: "A · Via aérea", prompt: "Hemoptise ameaçadora com lado de sangramento conhecido. Qual princípio protege o pulmão saudável?", options: ["Pulmão sangrante para cima", "Pulmão sangrante para baixo quando apropriado", "Deambulação", "VNI sem plano"], correct: 1, explanation: "A lateralização pode reduzir inundação do pulmão contralateral enquanto a via aérea e o controle definitivo são organizados." },
      { id: "pne-q02", block: "B · Oxigenação", prompt: "Em alto fluxo, SpO₂ melhora, mas esforço e frequência pioram. Melhor interpretação?", options: ["Sucesso garantido", "Possível falha; reavaliar e escalar sem atraso", "Alta da UTI", "Ignorar esforço"], correct: 1, explanation: "Oxigenação isolada não captura fadiga nem P-SILI; trajetória manda." },
      { id: "pne-q03", block: "B · Mecânica", prompt: "Pressão de pico alta com platô normal sugere predominantemente:", options: ["Resistência aumentada", "Complacência reduzida isolada", "Choque distributivo", "Hiponatremia"], correct: 0, explanation: "O gradiente pico-platô aponta componente resistivo, como broncoespasmo ou obstrução do tubo." },
      { id: "pne-q04", block: "B · SDRA", prompt: "Qual peso é usado para orientar VT protetor?", options: ["Peso atual", "Peso predito pela altura/sexo", "Peso ideal por IMC 25 sempre", "Peso de admissão com edema"], correct: 1, explanation: "O tamanho pulmonar se relaciona à altura e sexo, não ao peso real." },
      { id: "pne-q05", block: "C · VD", prompt: "No TEP de alto risco, grande carga de volume pode:", options: ["Sempre corrigir o choque", "Piorar distensão/interdependência do VD", "Eliminar trombo", "Substituir reperfusão"], correct: 1, explanation: "O VD agudamente sobrecarregado pode piorar com excesso de volume; suporte deve ser cuidadoso." },
      { id: "pne-q06", block: "C · Auto-PEEP", prompt: "Obstrutivo intubado fica hipotenso e fluxo expiratório não zera. Primeira lógica ventilatória?", options: ["Aumentar frequência", "Permitir exalação e reduzir aprisionamento", "Aumentar VT", "Normalizar CO₂ imediatamente"], correct: 1, explanation: "Hiperinsuflação dinâmica reduz retorno venoso; dê tempo expiratório e trate obstrução." },
      { id: "pne-q07", block: "D · Fadiga", prompt: "PaCO₂ de asmático grave passa de baixa para normal com piora clínica. Isso pode indicar:", options: ["Cura", "Fadiga e falência ventilatória", "Apenas erro laboratorial", "Hiperventilação maior"], correct: 1, explanation: "Normalização/subida de CO₂ no asmático em deterioração pode sinalizar exaustão." },
      { id: "pne-q08", block: "E · Pleura", prompt: "Choque súbito sob pressão positiva com suspeita forte de pneumotórax hipertensivo. Deve-se:", options: ["Aguardar radiografia", "Descomprimir imediatamente", "Fazer espirometria", "Aumentar PEEP"], correct: 1, explanation: "É diagnóstico clínico tempo-dependente; imagem não deve atrasar descompressão no instável." },
      { id: "pne-q09", block: "SDRA", prompt: "A diretriz ATS 2024 recomenda contra:", options: ["Ventilação protetora", "Manobras de recrutamento prolongadas de rotina em SDRA moderada/grave", "Avaliar ECMO selecionada", "PEEP individualizada"], correct: 1, explanation: "A recomendação forte é contra recrutamento pulmonar prolongado; outras intervenções dependem do contexto." },
      { id: "pne-q10", block: "Desmame", prompt: "Paciente falha extubação com indicação clara de reintubação. Melhor conduta?", options: ["VNI indefinida para adiar", "Reintubar sem atraso evitável", "Apenas sedar", "Ignorar hipercapnia"], correct: 1, explanation: "Suporte não invasivo não deve mascarar falha estabelecida com necessidade de via aérea." }
    ],
    cases: [
      { id: "pne-c01", block: "SDRA", prompt: "Paciente 165 cm, obesidade e SDRA. Para calcular VT inicial protetor, qual peso usar?", options: ["Peso real", "Peso corporal predito pela altura/sexo", "Peso pós-diálise", "Peso estimado visualmente"], correct: 1, explanation: "Obesidade não aumenta tamanho pulmonar; use PBW." },
      { id: "pne-c02", block: "Obstrutiva", prompt: "DPOC intubado: pico 48, platô 22 e fluxo não zera. Fenótipo dominante?", options: ["Resistência + auto-PEEP", "Complacência isoladamente baixa", "TEP confirmado", "Edema cerebral"], correct: 0, explanation: "Grande gradiente pico-platô e expiração incompleta apontam resistência/aprisionamento." },
      { id: "pne-c03", block: "Hipoxemia", prompt: "Alto fluxo há 2 h: saturação 94%, FR 38, tiragem e confusão nova. Próximo passo?", options: ["Manter porque saturação está boa", "Preparar escalada/intubação com equipe", "Reduzir monitorização", "Dar alta"], correct: 1, explanation: "Esforço e alteração mental sinalizam falha apesar da SpO₂." },
      { id: "pne-c04", block: "Prona", prompt: "SDRA grave em protetora, sem contraindicação, equipe treinada. Estratégia apoiada por PROSEVA?", options: ["Prona curta de 1 h", "Prona precoce por sessão prolongada", "Apenas posição lateral", "Recrutamento prolongado obrigatório"], correct: 1, explanation: "PROSEVA aplicou sessões de pelo menos 16 horas em SDRA grave selecionada." },
      { id: "pne-c05", block: "Pleura", prompt: "Paciente em VM entra em choque, hemitórax esquerdo sem deslizamento no POCUS e alta suspeita de tensão. Conduta?", options: ["Esperar TC", "Descompressão imediata", "Aumentar pressão", "Teste de caminhada"], correct: 1, explanation: "Instabilidade e forte suspeita exigem tratamento sem atraso por imagem." },
      { id: "pne-c06", block: "TEP", prompt: "Choque com alta suspeita de TEP, transporte à TC é inseguro e eco mostra VD muito dilatado. Melhor princípio?", options: ["Dímero-D para excluir", "Decisão de reperfusão baseada em contexto/equipe sem exame inviável", "Aguardar estabilidade espontânea", "Carga volumosa automática"], correct: 1, explanation: "No instável, eco à beira-leito e probabilidade podem apoiar decisão urgente com equipe e avaliação de sangramento." }
    ],
    flashcards: [
      { id: "pne-f01", topic: "VM", front: "VT protetor usa qual peso?", back: "Peso corporal predito.", pearl: "Calcule pela altura e sexo." },
      { id: "pne-f02", topic: "Mecânica", front: "Pico alto e platô normal?", back: "Componente resistivo.", pearl: "Pense tubo, secreção e broncoespasmo." },
      { id: "pne-f03", topic: "Mecânica", front: "Fluxo expiratório não zera?", back: "Suspeite auto-PEEP.", pearl: "Dê mais tempo expiratório e reduza volume-minuto." },
      { id: "pne-f04", topic: "SDRA", front: "Prona grave dura poucos minutos?", back: "Não.", pearl: "Benefício estudado com sessões prolongadas e equipe treinada." },
      { id: "pne-f05", topic: "SDRA", front: "Recrutamento prolongado é rotina?", back: "Não.", pearl: "ATS 2024 recomenda contra em SDRA moderada/grave." },
      { id: "pne-f06", topic: "Hipoxemia", front: "SpO₂ normal exclui fadiga?", back: "Não.", pearl: "Observe esforço, frequência, consciência e trajetória." },
      { id: "pne-f07", topic: "DPOC", front: "VNI sem plano de falha é segura?", back: "Não.", pearl: "Defina critérios e tempo de reavaliação." },
      { id: "pne-f08", topic: "Asma", front: "PaCO₂ normal em piora grave é tranquilizadora?", back: "Não necessariamente.", pearl: "Pode sinalizar exaustão." },
      { id: "pne-f09", topic: "Pleura", front: "Tensão instável espera RX?", back: "Não.", pearl: "Descompressão é tempo-dependente." },
      { id: "pne-f10", topic: "TEP", front: "Dímero-D exclui TEP no choque de alta probabilidade?", back: "Não é a estratégia.", pearl: "Use avaliação/imagem compatíveis com estabilidade." },
      { id: "pne-f11", topic: "Hemoptise", front: "A ameaça depende só do volume?", back: "Não.", pearl: "Via aérea, troca gasosa e hemodinâmica definem gravidade." },
      { id: "pne-f12", topic: "Desmame", front: "Teste espontâneo aprovado garante extubação?", back: "Não.", pearl: "Tosse, secreção, consciência e via aérea também importam." },
      { id: "pne-f13", topic: "Oxigenação", front: "P/F deve registrar condições?", back: "Sim.", pearl: "FiO₂, PEEP, posição e tempo mudam interpretação." },
      { id: "pne-f14", topic: "ECMO", front: "Quando telefonar para centro de ECMO?", back: "Cedo, antes do colapso irreversível.", pearl: "Discussão não obriga canulação; preserva opções." },
      { id: "pne-f15", topic: "Pressões", front: "Platô alto mede apenas pulmão?", back: "Não.", pearl: "Parede torácica, abdome e esforço influenciam." },
      { id: "pne-f16", topic: "Obstrutiva", front: "Objetivo primário é normalizar PaCO₂?", back: "Não.", pearl: "Evite hiperinsuflação e lesão; aceite permissividade quando segura." },
      { id: "pne-f17", topic: "HFNC", front: "ROX decide sozinho a IOT?", back: "Não.", pearl: "É apoio de tendência, não substituto do exame." },
      { id: "pne-f18", topic: "Prona", front: "Subir SpO₂ é o único objetivo da prona?", back: "Não.", pearl: "Homogeneidade e proteção podem importar além da resposta imediata." }
    ],
    references: [
      { id: "atsArds2024", title: "ATS Guideline Update on Management of Adult Patients with ARDS", group: "ATS", year: 2024, url: "https://pubmed.ncbi.nlm.nih.gov/38032683/" },
      { id: "arma2000", title: "Ventilation with Lower Tidal Volumes — ARDSNet ARMA", group: "ARDSNet / NEJM", year: 2000, url: "https://pubmed.ncbi.nlm.nih.gov/10793162/" },
      { id: "proseva2013", title: "Prone Positioning in Severe ARDS — PROSEVA", group: "REVA / NEJM", year: 2013, url: "https://pubmed.ncbi.nlm.nih.gov/23688302/" },
      { id: "florali2015", title: "High-Flow Oxygen in Acute Hypoxemic Respiratory Failure — FLORALI", group: "REVA / NEJM", year: 2015, url: "https://pubmed.ncbi.nlm.nih.gov/25981908/" },
      { id: "soho2026", title: "High-Flow or Standard Oxygen in Acute Hypoxemic Respiratory Failure — SOHO", group: "NEJM", year: 2026, url: "https://pubmed.ncbi.nlm.nih.gov/41841715/" },
      { id: "eolia2018", title: "Extracorporeal Membrane Oxygenation for Severe ARDS — EOLIA", group: "REVA/ECMONet / NEJM", year: 2018, url: "https://pubmed.ncbi.nlm.nih.gov/29791822/" },
      { id: "art2017", title: "Lung Recruitment and Titrated PEEP versus Low PEEP in ARDS — ART", group: "JAMA", year: 2017, url: "https://pubmed.ncbi.nlm.nih.gov/28973363/" },
      { id: "ersAtsNiv2017", title: "Official ERS/ATS Clinical Practice Guidelines: Noninvasive Ventilation for Acute Respiratory Failure", group: "ERS/ATS", year: 2017, url: "https://pubmed.ncbi.nlm.nih.gov/28860265/" },
      { id: "gold2026", title: "Global Strategy for Prevention, Diagnosis and Management of COPD — 2026 Report", group: "GOLD", year: 2026, url: "https://goldcopd.org/2026-gold-report-and-pocket-guide/" },
      { id: "gina2025", title: "Global Strategy for Asthma Management and Prevention — 2025", group: "GINA", year: 2025, url: "https://ginasthma.org/2025-gina-strategy-report/" },
      { id: "escPe2019", title: "ESC Guidelines for Acute Pulmonary Embolism", group: "ESC/ERS", year: 2019, url: "https://pubmed.ncbi.nlm.nih.gov/31504429/" },
      { id: "btsPleural2023", title: "British Thoracic Society Guideline for Pleural Disease", group: "BTS", year: 2023, url: "https://pubmed.ncbi.nlm.nih.gov/37433578/" },
      { id: "hemoptysisReview2017", title: "A systematic approach to the management of massive hemoptysis", group: "Journal of Thoracic Disease", year: 2017, url: "https://pubmed.ncbi.nlm.nih.gov/28713725/" },
      { id: "rose2019", title: "Early Neuromuscular Blockade in ARDS — ROSE", group: "PETAL / NEJM", year: 2019, url: "https://pubmed.ncbi.nlm.nih.gov/31112383/" }
    ]
  };

  window.ANTIGRAVITY_PULMONOLOGY = catalog;
  window.ANTIGRAVITY_CRITICAL_MODULE = catalog;
})();
