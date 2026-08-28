"use strict";

(() => {
  const catalog = {
    meta: {
      schemaVersion: "critical-module-v1",
      moduleVersion: "1.2.0",
      slug: "pneumologia-critica",
      title: "Pneumologia Crítica",
      subtitle: "Insuficiência respiratória, SDRA, doenças obstrutivas, hemoptise e TEP organizados em decisões práticas, fisiologia visível e treino Turbo TEMI.",
      kicker: "🫁 Plantão · UTI · Turbo TEMI",
      emoji: "🫁",
      updatedAt: "2026-08-28",
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
        id: "dpoc-hipercapnica", category: "Obstrutiva", title: "DPOC exacerbada com acidose/encefalopatia hipercápnica",
        signal: "Após tratamento inicial: PaCO₂ elevada, pH ≤7,35 e esforço, fadiga ou alteração da consciência. PaCO₂ alta isolada pode ser basal; encefalopatia hipercápnica é um diagnóstico clínico.",
        firstHour: ["ABCDE, monitorização, oxigênio controlado para SpO₂ geralmente entre 88–92% e gasometria seriada.", "Administre broncodilatador inalatório de curta ação, corticosteroide sistêmico quando indicado e trate o gatilho conforme diretriz e protocolo local.", "Procure pneumonia, pneumotórax, edema pulmonar, TEP, síndrome coronariana, arritmia, secreção, aspiração e sedativos/opioides.", "Na acidose hipercápnica, inicie VNI bilevel precocemente se a via aérea for segura; documente antes os critérios de falha e intubação."],
        decisive: ["pH, PaCO₂, bicarbonato e gasometria basal quando conhecida", "Frequência, esforço, consciência, proteção da via aérea e secreções", "Resposta clínica em 30–60 min e tendência gasométrica aproximadamente em 1 h"],
        doNot: ["Não diagnosticar ‘narcose por CO₂’ por um valor isolado de PaCO₂.", "Não normalizar SpO₂ ou PaCO₂ à custa de hiperóxia e aprisionamento aéreo.", "Não prolongar VNI em piora de pH, esforço, consciência, oxigenação ou hemodinâmica."],
        tags: ["DPOC", "VNI", "hipercapnia", "auto-PEEP"], referenceIds: ["gold2026", "atsNirs2026", "ersAtsNiv2017", "btsIcsAhrf2016", "hessCopdVent2023"]
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
        tags: ["auto-PEEP", "DPOC", "asma"], referenceIds: ["btsIcsAhrf2016", "hessCopdVent2023", "jubranPeep2024"]
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
        id: "dpoc-vni-checkpoint", title: "DPOC acidótica: VNI → checkpoint → escalada", timebox: "primeira hora",
        steps: [
          { title: "Confirme falência aguda", text: "Combine pH, PaCO₂, frequência, esforço e consciência. Hipercapnia crônica sem acidose não basta; exclua hipoxemia, hipoglicemia, sepse, AVC, uremia e fármacos depressores." },
          { title: "Comece o tratamento", text: "Titule O₂ para SpO₂ geralmente 88–92%, broncodilate, use corticosteroide sistêmico quando indicado e trate a causa conforme GOLD e protocolo local; antibiótico depende de purulência, cultura prévia, ventilação e contexto infeccioso." },
          { title: "Configure a VNI", text: "Interface oronasal; referência BTS: IPAP próxima de 15 e EPAP 3–5 cmH₂O. Suba IPAP conforme expansão, esforço, frequência, vazamento e gasometria; 20–30 cmH₂O pode ser necessário. São referências, não prescrição universal." },
          { title: "Faça o checkpoint", text: "Em 30–60 min, procure redução do esforço/frequência, melhora da consciência e direção favorável do pH; repita gasometria aproximadamente em 1 h. Corrija máscara, vazamento, suporte insuficiente e assincronia." },
          { title: "Escale sem atraso", text: "Piora clínica ou gasométrica, via aérea insegura, secreção não manejável, aspiração, choque, hipoxemia ameaçadora ou intolerância não corrigível indicam preparação para IOT." }
        ],
        exit: "Resposta objetiva à VNI ou intubação realizada antes do colapso. Ao elevar EPAP, reavalie a diferença IPAP − EPAP e a ventilação efetiva."
      },
      {
        id: "obstrutivo-intubado", title: "Obstrutivo intubado: esvaziar antes de ventilar mais", timebox: "minutos",
        steps: [
          { title: "Detecte", text: "Fluxo expiratório não retorna a zero, auto-PEEP, pressão de pico alta e hipotensão sugerem aprisionamento; compare pico com platô e exclua pneumotórax/DOPE." },
          { title: "Comece conservador", text: "Referências iniciais: VT 6–8 mL/kg de peso predito, FR 10–15/min (faixa baixa se obstrução intensa), Ti 0,8–1,2 s, I:E ≥1:3 e fluxo VCV frequentemente 60–100 L/min." },
          { title: "Dê tempo", text: "Se aprisiona, reduza volume-minuto — em geral FR primeiro —, encurte Ti/aumente fluxo e prolongue expiração. PEEP próxima de 5 cmH₂O é só ponto de partida; titule por PEEP total, platô e hemodinâmica." },
          { title: "Aceite", text: "Aproxime a PaCO₂ basal ou aceite hipercapnia permissiva quando apropriado. pH 7,20–7,25 é faixa eventualmente tolerada em obstrução extrema, com evidência baixa; não é objetivo rotineiro." },
          { title: "Resgate e causa", text: "No colapso grave, desconexão breve para exalação é teste/resgate temporário enquanto se trata broncoespasmo, secreção, tubo, assincronia, pneumotórax e outras causas de choque." },
          { title: "Reavalie", text: "Após cada mudança, confira curva fluxo-tempo, auto-PEEP em paciente passivo, platô, volume expirado, sincronia, gasometria e pressão arterial." }
        ],
        exit: "Fluxo expiratório retorna a zero ou melhora, auto-PEEP e hemodinâmica estão controladas, e a causa segue em tratamento."
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
          ["Alto fluxo", "Hipoxemia selecionada; ATS 2026 admite alternativa condicional apenas na acidemia hipercápnica leve, com vigilância", "Esforço/taquipneia persistentes", "Não protege via aérea nem substitui VNI na acidose mais grave"],
          ["VNI bilevel", "Primeira escolha na DPOC com acidose hipercápnica e via aérea segura", "Piora de pH, esforço, consciência ou instabilidade", "Interface, secreções e risco de atraso"],
          ["IOT", "Falha, via aérea, exaustão, choque ou hipoxemia refratária", "Pré-oxigenação/hemodinâmica frágeis", "Procedimento de alto risco"],
          ["Regra", "Teste com objetivo", "Reavalie cedo", "Escalone antes do colapso"]
        ]
      },
      {
        id: "dpoc-vm-invasiva", title: "DPOC intubada: dê tempo para expirar",
        headers: ["Controle", "Referência inicial", "Objetivo", "Se houver aprisionamento"],
        rows: [
          ["Modo", "VCV ou PCV", "Usar modo familiar; não há superioridade comprovada", "Rever volume-minuto, curvas e sincronia"],
          ["VT", "6–8 mL/kg de peso predito", "Evitar hiperdistensão", "Reduzir conforme platô, volume expirado e hemodinâmica"],
          ["Frequência", "10–15/min; faixa baixa na obstrução intensa", "Diminuir volume-minuto", "Reduzir frequência antes de perseguir PaCO₂"],
          ["Ti / fluxo", "Ti 0,8–1,2 s; fluxo VCV frequentemente 60–100 L/min", "I:E ≥1:3 e fluxo expiratório chegando a zero", "Encurtar Ti ou aumentar fluxo"],
          ["PEEP", "Baixa, frequentemente próxima de 5 cmH₂O", "Reduzir carga de disparo sem hiperdistender", "Titular por PEEP total, platô, volume e pressão arterial"],
          ["Pressões", "Platô preferencialmente <28–30 cmH₂O", "Separar resistência de distensão alveolar", "Pico alto isolado pode refletir resistência"],
          ["Oxigenação", "FiO₂ de resgate com redução precoce", "SpO₂ geralmente 88–92%", "Excluir secreção, atelectasia e pneumotórax"],
          ["CO₂ / pH", "Aproximar PaCO₂ basal ou obter pH seguro", "Evitar hiperinsuflação", "Aceitar hipercapnia permissiva quando apropriado"]
        ]
      },
      {
        id: "dpoc-terapeutica", title: "DPOC exacerbada: terapêutica sem automatizar prescrição",
        headers: ["Intervenção", "Quando buscar", "Checkpoint", "Limite / regra local"],
        rows: [
          ["Oxigênio controlado", "Hipoxemia", "SpO₂ geralmente 88–92% + gasometria", "Não negar O₂; evitar hiperóxia"],
          ["SABA ± SAMA", "Broncoespasmo/obstrução", "Esforço, ausculta, frequência e técnica de entrega", "Dose e dispositivo conforme protocolo; titule O₂ separadamente"],
          ["Corticosteroide sistêmico", "Exacerbação moderada/grave quando indicado", "Resposta, glicemia, eventos adversos", "Curso curto conforme GOLD e contraindicações; dose exige validação local"],
          ["Antibiótico", "Escarro purulento, cultura respiratória prévia positiva ou necessidade de VNI/VM", "Culturas prévias, função renal, resposta e diagnóstico de pneumonia", "Escolha e duração dependem da microbiologia/protocolo local"],
          ["Tratar precipitante", "Pneumonia, edema, arritmia, SCA, TEP, pneumotórax, aspiração ou fármacos", "Trajetória clínica e exames dirigidos", "Não atribuir toda piora à DPOC"],
          ["Metilxantina IV", "Não é rotina", "Toxicidade/interações se exceção justificada", "GOLD desaconselha uso rotineiro"]
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
      { term: "Encefalopatia hipercápnica", category: "DPOC", definition: "Alteração da consciência associada à hipercapnia — também chamada ‘narcose por CO₂’ — após excluir causas concorrentes.", application: "Não existe PaCO₂ isolada diagnóstica; integre pH, basal, oxigenação, glicemia, sepse, neurologia, uremia e fármacos." },
      { term: "Constante de tempo", category: "Mecânica", definition: "Produto de resistência por complacência; descreve a velocidade de enchimento e esvaziamento pulmonar.", application: "Na obstrução, constantes longas exigem mais tempo expiratório e favorecem aprisionamento heterogêneo." },
      { term: "PEEP total", category: "Mecânica", definition: "Soma funcional da PEEP externa com a pressão intrínseca mensurada em condições válidas.", application: "Use pausa expiratória em paciente passivo e interprete com curva, platô, volume e hemodinâmica." },
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
      { title: "PaCO₂ alta = narcose", kind: "DPOC", message: "Hipercapnia crônica pode ter PaCO₂ elevada sem encefalopatia ou falência aguda.", countermeasure: "Confirme alteração de consciência, acidose e trajetória; exclua hipoxemia, glicose, sepse, AVC, uremia e sedativos/opioides." },
      { title: "Alto fluxo substitui VNI na acidose", kind: "Suporte", message: "A recomendação ATS 2026 para alto fluxo na falência hipercápnica é condicional e restrita à acidemia leve, com baixa certeza.", countermeasure: "Mantenha VNI bilevel como primeira escolha na DPOC acidótica e disponibilidade imediata de escalada." },
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
      { id: "pne-q10", block: "Desmame", prompt: "Paciente falha extubação com indicação clara de reintubação. Melhor conduta?", options: ["VNI indefinida para adiar", "Reintubar sem atraso evitável", "Apenas sedar", "Ignorar hipercapnia"], correct: 1, explanation: "Suporte não invasivo não deve mascarar falha estabelecida com necessidade de via aérea." },
      { id: "pne-q11", block: "DPOC · VNI", prompt: "DPOC exacerbada, após tratamento inicial: pH 7,29, PaCO₂ 68 mmHg, FR 30 e via aérea segura. Suporte preferencial?", options: ["VNI bilevel com checkpoint precoce", "Alto fluxo sem plano de falha", "Oxigênio a 100%", "Intubação obrigatória apenas pelo valor de PaCO₂"], correct: 0, explanation: "ERS/ATS recomenda VNI bilevel na insuficiência hipercápnica acidótica por DPOC. Defina falha antes de iniciar e reavalie em 30–60 min, com gasometria aproximadamente em 1 h." },
      { id: "pne-q12", block: "DPOC · Auto-PEEP", prompt: "Na VM, o fluxo expiratório ainda não chegou a zero quando começa a inspiração seguinte. Qual ajuste lógico prioritário?", options: ["Aumentar frequência", "Reduzir tempo expiratório", "Reduzir volume-minuto e prolongar expiração", "Normalizar PaCO₂ imediatamente"], correct: 2, explanation: "O traçado sugere esvaziamento incompleto. Em geral, reduza FR/volume-minuto e encurte Ti ou aumente fluxo, reavaliando curvas, pressões e hemodinâmica." },
      { id: "pne-q13", block: "DPOC · Colapso", prompt: "DPOC intubado desenvolve hipotensão abrupta, pressão de pico alta e expiração incompleta. Melhor princípio imediato?", options: ["Aumentar VT", "Desconexão breve para exalação como resgate enquanto avalia DOPE e pneumotórax", "Aumentar FR", "Assumir auto-PEEP e ignorar outras causas"], correct: 1, explanation: "Desconexão breve pode testar/aliviar temporariamente hiperinsuflação grave, mas não é tratamento definitivo. Investigue simultaneamente tubo, obstrução, pneumotórax, equipamento e outras causas de choque." }
    ],
    cases: [
      { id: "pne-c01", block: "SDRA", prompt: "Paciente 165 cm, obesidade e SDRA. Para calcular VT inicial protetor, qual peso usar?", options: ["Peso real", "Peso corporal predito pela altura/sexo", "Peso pós-diálise", "Peso estimado visualmente"], correct: 1, explanation: "Obesidade não aumenta tamanho pulmonar; use PBW." },
      { id: "pne-c02", block: "Obstrutiva", prompt: "DPOC intubado: pico 48, platô 22 e fluxo não zera. Fenótipo dominante?", options: ["Resistência + auto-PEEP", "Complacência isoladamente baixa", "TEP confirmado", "Edema cerebral"], correct: 0, explanation: "Grande gradiente pico-platô e expiração incompleta apontam resistência/aprisionamento." },
      { id: "pne-c03", block: "Hipoxemia", prompt: "Alto fluxo há 2 h: saturação 94%, FR 38, tiragem e confusão nova. Próximo passo?", options: ["Manter porque saturação está boa", "Preparar escalada/intubação com equipe", "Reduzir monitorização", "Dar alta"], correct: 1, explanation: "Esforço e alteração mental sinalizam falha apesar da SpO₂." },
      { id: "pne-c04", block: "Prona", prompt: "SDRA grave em protetora, sem contraindicação, equipe treinada. Estratégia apoiada por PROSEVA?", options: ["Prona curta de 1 h", "Prona precoce por sessão prolongada", "Apenas posição lateral", "Recrutamento prolongado obrigatório"], correct: 1, explanation: "PROSEVA aplicou sessões de pelo menos 16 horas em SDRA grave selecionada." },
      { id: "pne-c05", block: "Pleura", prompt: "Paciente em VM entra em choque, hemitórax esquerdo sem deslizamento no POCUS e alta suspeita de tensão. Conduta?", options: ["Esperar TC", "Descompressão imediata", "Aumentar pressão", "Teste de caminhada"], correct: 1, explanation: "Instabilidade e forte suspeita exigem tratamento sem atraso por imagem." },
      { id: "pne-c06", block: "TEP", prompt: "Choque com alta suspeita de TEP, transporte à TC é inseguro e eco mostra VD muito dilatado. Melhor princípio?", options: ["Dímero-D para excluir", "Decisão de reperfusão baseada em contexto/equipe sem exame inviável", "Aguardar estabilidade espontânea", "Carga volumosa automática"], correct: 1, explanation: "No instável, eco à beira-leito e probabilidade podem apoiar decisão urgente com equipe e avaliação de sangramento." },
      { id: "pne-c07", block: "DPOC · Consciência", prompt: "DPOC com sonolência, pH 7,27 e PaCO₂ 82 mmHg, mas tosse e via aérea ainda eficazes, hemodinâmica estável e equipe experiente. Qual princípio?", options: ["PaCO₂ obriga IOT em todos", "Teste de VNI muito monitorado pode ser considerado, com preparo imediato para IOT", "Sedação profunda para tolerar máscara", "Alto fluxo sempre substitui VNI"], correct: 1, explanation: "Encefalopatia hipercápnica isolada não é contraindicação absoluta à VNI. Via aérea insegura, aspiração, secreção não manejável, peri-parada, choque ou piora precoce favorecem IOT." },
      { id: "pne-c08", block: "DPOC · Mecânica", prompt: "Após IOT: VT 8 mL/kg predito, FR 22/min, fluxo não zera e pressão arterial cai. Qual mudança ataca o mecanismo dominante?", options: ["Aumentar FR", "Reduzir FR/volume-minuto e ampliar tempo expiratório", "Aumentar VT", "Subir PEEP sem medir mecânica"], correct: 1, explanation: "FR elevada reduz o tempo expiratório e agrava hiperinsuflação dinâmica. Reduza volume-minuto, trate obstrução e reavalie curva, auto-PEEP, platô e hemodinâmica." }
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
      { id: "pne-f18", topic: "Prona", front: "Subir SpO₂ é o único objetivo da prona?", back: "Não.", pearl: "Homogeneidade e proteção podem importar além da resposta imediata." },
      { id: "pne-f19", topic: "DPOC", front: "PaCO₂ alta isolada define ‘narcose’?", back: "Não.", pearl: "Encefalopatia hipercápnica é clínica e exige exclusão de causas concorrentes." },
      { id: "pne-f20", topic: "DPOC", front: "Meta usual de SpO₂ na exacerbação hipercápnica?", back: "Geralmente 88–92%.", pearl: "Titule oxigênio e confirme com gasometria; não negue O₂ necessário." },
      { id: "pne-f21", topic: "VNI", front: "Quando fazer o primeiro checkpoint da VNI?", back: "Clínica em 30–60 min e gasometria aproximadamente em 1 h.", pearl: "Procure direção favorável do pH, esforço, FR e consciência." },
      { id: "pne-f22", topic: "VNI", front: "Elevar apenas EPAP mantém o mesmo suporte ventilatório?", back: "Não necessariamente.", pearl: "A pressão de suporte é a diferença IPAP − EPAP; reavalie ventilação efetiva." },
      { id: "pne-f23", topic: "VM obstrutiva", front: "Referência inicial de VT na DPOC intubada?", back: "6–8 mL/kg de peso predito.", pearl: "Associe baixa FR e expiração longa; números são ponto de partida." },
      { id: "pne-f24", topic: "Auto-PEEP", front: "Desconectar brevemente resolve a hiperinsuflação?", back: "É apenas teste/resgate temporário.", pearl: "O definitivo é reduzir volume-minuto, prolongar expiração e tratar a causa." }
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
      { id: "atsNirs2026", title: "ATS Guideline: Noninvasive Respiratory Support for Acute Respiratory Failure", group: "ATS", year: 2026, url: "https://pubmed.ncbi.nlm.nih.gov/42371750/" },
      { id: "btsIcsAhrf2016", title: "BTS/ICS Guideline for Acute Hypercapnic Respiratory Failure", group: "BTS/ICS", year: 2016, url: "https://pubmed.ncbi.nlm.nih.gov/26976648/" },
      { id: "hessCopdVent2023", title: "Respiratory Care Management of COPD Exacerbations", group: "Respiratory Care", year: 2023, url: "https://pubmed.ncbi.nlm.nih.gov/37225653/" },
      { id: "jubranPeep2024", title: "Setting PEEP in the Severely Obstructive Patient", group: "Current Opinion in Critical Care", year: 2024, url: "https://pubmed.ncbi.nlm.nih.gov/38085854/" },
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
