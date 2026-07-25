(() => {
  "use strict";

  const catalog = {
    version: "1.0.0-rc.1",
    updatedAt: "2026-07-25",
    rass: [
      { score: 4, label: "Combativo", cue: "Violento, risco imediato para equipe." },
      { score: 3, label: "Muito agitado", cue: "Puxa dispositivos; comportamento agressivo." },
      { score: 2, label: "Agitado", cue: "Movimentos frequentes e não intencionais; luta com ventilador." },
      { score: 1, label: "Inquieto", cue: "Ansioso ou apreensivo, sem agressividade." },
      { score: 0, label: "Alerta e calmo", cue: "Contato espontâneo, sem agitação." },
      { score: -1, label: "Sonolento", cue: "Desperta à voz e mantém contato ocular por mais de 10 s." },
      { score: -2, label: "Sedação leve", cue: "Desperta à voz, contato ocular por menos de 10 s." },
      { score: -3, label: "Sedação moderada", cue: "Movimento ou abertura ocular à voz, sem contato ocular." },
      { score: -4, label: "Sedação profunda", cue: "Movimento apenas ao estímulo físico." },
      { score: -5, label: "Não despertável", cue: "Sem resposta à voz ou ao estímulo físico." }
    ],
    causes: [
      {
        icon: "🫁",
        title: "Oxigenação e ventilação",
        items: ["Hipoxemia", "Hipercapnia", "Falha de interface/ventilador", "Aspiração ou fadiga"]
      },
      {
        icon: "🩸",
        title: "Perfusão e inflamação",
        items: ["Choque/hipoperfusão", "Sepse", "Anemia ou sangramento relevantes", "Febre ou hipotermia"]
      },
      {
        icon: "🧪",
        title: "Metabólico e órgãos",
        items: ["Glicose", "Na/Ca/Mg", "Uremia", "Falência hepática", "Distúrbio ácido-base"]
      },
      {
        icon: "💊",
        title: "Drogas e abstinência",
        items: ["Benzodiazepínicos", "Anticolinérgicos", "Opioides/corticoide", "Polifarmácia", "Álcool ou sedativos"]
      },
      {
        icon: "🧠",
        title: "Neurológico",
        items: ["AVC/hemorragia", "Estado epiléptico não convulsivo", "Meningoencefalite", "TCE", "Catatonia"]
      },
      {
        icon: "🩹",
        title: "Dor e desconforto",
        items: ["Dor não tratada", "Dispneia", "Sede", "Posição", "Tubo/cateter/dispositivo"]
      },
      {
        icon: "🚻",
        title: "Retenção e trânsito",
        items: ["Retenção urinária", "Fecaloma", "Constipação", "Diarreia", "Náusea"]
      },
      {
        icon: "🌙",
        title: "Ambiente e função",
        items: ["Privação de sono", "Imobilidade", "Sem óculos/aparelho auditivo", "Mudanças de quarto", "Isolamento"]
      }
    ],
    flashcards: [
      {
        q: "Qual é o gate antes do CAM-ICU?",
        a: "Avaliar o nível de consciência com RASS. Em RASS −4 ou −5, o CAM-ICU fica não avaliável; trate/reveja coma e sedação."
      },
      {
        q: "Qual é a fórmula do CAM-ICU positivo?",
        a: "Característica 1 + característica 2 + (característica 3 OU 4): início agudo/flutuação + desatenção + pensamento desorganizado ou nível de consciência alterado."
      },
      {
        q: "ICDSC 3 pontos fecha delirium?",
        a: "Não. 1–3 sugere delirium subsindrômico/alterações que pedem reavaliação; ≥4 é rastreio positivo, ainda dependente de diagnóstico clínico."
      },
      {
        q: "Qual instrumento o NICE recomenda na enfermaria?",
        a: "4AT quando há indicadores de delirium. Em terapia intensiva ou recuperação pós-anestésica, CAM-ICU ou ICDSC."
      },
      {
        q: "Delirium hipoativo é 'mais leve'?",
        a: "Não. É frequentemente perdido porque aparece como lentificação, retraimento, pouca mobilidade ou sonolência; exige busca ativa."
      },
      {
        q: "Antipsicótico trata a causa do delirium?",
        a: "Não. Não substitui correção etiológica e não demonstrou encurtar delirium de rotina. Pode ser considerado por curto prazo apenas para sofrimento/risco, após desescalada, conforme protocolo e contraindicações."
      },
      {
        q: "Quando benzodiazepínico pode ser necessário?",
        a: "Principalmente em abstinência de álcool/benzodiazepínico, convulsões ou outra indicação específica. No delirium comum, exposição a benzodiazepínico é fator modificável associado."
      },
      {
        q: "Quando lembrar dexmedetomidina no delirium agitado?",
        a: "No adulto em ventilação mecânica quando a agitação impede desmame/extubação; monitorar bradicardia e hipotensão e seguir protocolo da UTI."
      },
      {
        q: "PRE-DELIRIC diagnostica delirium?",
        a: "Não. Estima risco com dados das primeiras 24 h para intensificar prevenção. CAM-ICU/ICDSC rastreiam o estado atual."
      },
      {
        q: "Qual a conduta inicial diante de um score positivo?",
        a: "Confirmar mudança aguda/flutuação, documentar, buscar causas e mimetizadores, corrigir ameaças imediatas e aplicar prevenção/manejo multicomponente."
      },
      {
        q: "Contenção física evita autoextubação com segurança comprovada?",
        a: "Não há demonstração robusta de eficácia e ela pode aumentar agitação e eventos. Se inevitável por risco imediato, usar a menor restrição, tempo mínimo e reavaliação frequente."
      },
      {
        q: "Quando pedir TC, EEG ou líquor?",
        a: "Não como painel universal. Use conforme sinais focais/trauma, rebaixamento inexplicado, suspeita de crise não convulsiva ou infecção/inflamação do SNC."
      }
    ],
    questions: [
      {
        q: "Paciente intubado, RASS −5. Qual é a próxima classificação correta?",
        options: [
          "CAM-ICU negativo",
          "CAM-ICU positivo",
          "CAM-ICU não avaliável; investigar coma/sedação",
          "ICDSC obrigatoriamente ≥4"
        ],
        answer: 2,
        why: "Sem resposta à voz ou estímulo físico, não se interpreta ausência de respostas cognitivas como CAM-ICU negativo."
      },
      {
        q: "Qual combinação torna o CAM-ICU positivo?",
        options: [
          "1 + 2 + (3 ou 4)",
          "1 + 3 apenas",
          "2 + 4 apenas",
          "Qualquer uma das quatro características"
        ],
        answer: 0,
        why: "Início agudo/flutuação e desatenção são obrigatórios, somados a pensamento desorganizado ou nível de consciência alterado."
      },
      {
        q: "Idoso na enfermaria, novo retraimento e respostas lentas. Melhor passo?",
        options: [
          "Aguardar agitação",
          "Aplicar 4AT e avaliar causas",
          "Prescrever antipsicótico profilático",
          "Concluir demência"
        ],
        answer: 1,
        why: "Delirium hipoativo é comum e perdido. Na enfermaria, indicadores devem levar a avaliação com 4AT e diagnóstico clínico."
      },
      {
        q: "Qual medida tem melhor coerência com prevenção multicomponente?",
        options: [
          "Sedação profunda noturna",
          "Antipsicótico para todos os idosos",
          "Mobilização, reorientação, sono e correção sensorial",
          "Restrição física preventiva"
        ],
        answer: 2,
        why: "A prevenção é multicomponente: cognição, sono, mobilidade, visão/audição, dor e redução de fatores modificáveis."
      },
      {
        q: "Delirium agitado em VM impede extubação apesar da correção de causas. Opção respaldada no PADIS 2018?",
        options: [
          "Dexmedetomidina conforme protocolo",
          "Haloperidol profilático em dose fixa",
          "Benzodiazepínico de rotina",
          "Cetamina para prevenir delirium"
        ],
        answer: 0,
        why: "A recomendação condicional favorece dexmedetomidina nessa situação específica, com monitorização."
      },
      {
        q: "Sobre haloperidol/antipsicóticos no delirium da UTI, é correto:",
        options: [
          "Encurtam delirium de forma comprovada",
          "São prevenção universal",
          "A evidência não permite recomendação rotineira; reservar controle sintomático selecionado",
          "Dispensam busca etiológica"
        ],
        answer: 2,
        why: "Ensaios não demonstraram benefício rotineiro na duração; a atualização PADIS 2025 não recomenda a favor nem contra por baixa certeza."
      },
      {
        q: "ICDSC total 5 em uma janela de enfermagem significa:",
        options: [
          "Rastreio positivo, confirmar clinicamente e investigar",
          "Diagnóstico etiológico concluído",
          "Sedação obrigatória",
          "Demência provável"
        ],
        answer: 0,
        why: "ICDSC ≥4 é rastreio positivo; não define causa nem substitui julgamento clínico."
      },
      {
        q: "Qual cenário muda a lógica dos benzodiazepínicos?",
        options: [
          "Delirium hipoativo sem causa",
          "Abstinência de álcool com hiperatividade autonômica",
          "Idoso com retenção urinária",
          "Privação de sono"
        ],
        answer: 1,
        why: "Abstinência de álcool/sedativos e convulsões são indicações específicas; fora delas, benzodiazepínicos podem piorar o quadro."
      },
      {
        q: "Agitação persiste após medidas iniciais. Antes de escalar sedação, o que deve ser reconsiderado?",
        options: [
          "Somente a dose do antipsicótico",
          "Mimetizadores: crise não convulsiva, AVC, abstinência, toxidrome, catatonia",
          "Apenas o horário",
          "Somente a idade"
        ],
        answer: 1,
        why: "Refratariedade exige reabrir diagnóstico e procurar ameaças e síndromes tratáveis específicas."
      },
      {
        q: "PRE-DELIRIC deve ser usado para:",
        options: [
          "Confirmar delirium atual",
          "Predizer risco e priorizar prevenção",
          "Escolher antipsicótico",
          "Definir RASS alvo"
        ],
        answer: 1,
        why: "É modelo prognóstico das primeiras 24 h, não instrumento diagnóstico."
      }
    ],
    cases: [
      {
        title: "Caso 1 — O silencioso",
        vignette: "Homem de 78 anos, pneumonia em melhora, passa a comer menos, responde lentamente e dorme durante o round. Sem agitação.",
        prompt: "Qual erro cognitivo deve ser evitado?",
        answer: "Confundir ausência de agitação com ausência de delirium. Buscar mudança aguda/flutuação, aplicar 4AT na enfermaria e investigar hipóxia, infecção, fármacos, dor, retenção e distúrbios metabólicos."
      },
      {
        title: "Caso 2 — A extubação que não chega",
        vignette: "Mulher em VM, metas ventilatórias cumpridas, RASS +2 ao reduzir propofol; tenta retirar tubo e falha repetidamente no processo de extubação.",
        prompt: "Como estruturar a decisão?",
        answer: "Tratar dor, hipóxia/hipercapnia e causas reversíveis; definir alvo de sedação leve; aplicar CAM-ICU quando avaliável; considerar dexmedetomidina se o delirium agitado continuar impedindo desmame/extubação, monitorando bradicardia/hipotensão."
      },
      {
        title: "Caso 3 — O CAM-ICU falso 'negativo'",
        vignette: "Paciente em choque, RASS −5, sem resposta aos testes cognitivos. Registro anterior: CAM-ICU negativo.",
        prompt: "Qual a correção?",
        answer: "Classificar como não avaliável, não negativo. Rever sedativos, perfusão, glicemia, oxigenação/ventilação, causas metabólicas e neurológicas de coma."
      },
      {
        title: "Caso 4 — Agitação perigosa",
        vignette: "Idoso tenta saltar da cama e agride a equipe. Retenção urinária dolorosa é encontrada; há QTc prolongado e história de Parkinson.",
        prompt: "Qual é a hierarquia?",
        answer: "Equipe e ambiente seguros, uma voz para desescalada, tratar dor/retenção e outras ameaças. Evitar haloperidol se possível pelo Parkinson e risco cardíaco; se controle farmacológico for inevitável, usar protocolo local e apoio especializado com monitorização."
      },
      {
        title: "Caso 5 — 'Delirium' refratário",
        vignette: "Oscilações motoras faciais e rebaixamento persistem apesar de correção metabólica e retirada de sedativos.",
        prompt: "Qual diagnóstico alternativo não pode ser perdido?",
        answer: "Estado epiléptico não convulsivo. Reavaliar neurologicamente e indicar EEG conforme disponibilidade e probabilidade clínica; neuroimagem/líquor dependem dos red flags."
      }
    ],
    checklists: {
      triagem: {
        title: "🚨 Sessão 1 — Triagem em 60 segundos",
        text: [
          "[ ] Segurança imediata: paciente, equipe, dispositivos e via aérea",
          "[ ] ABC + SpO₂/ventilação + perfusão + glicemia",
          "[ ] Dor, dispneia, retenção urinária, fecaloma e abstinência",
          "[ ] Definir mudança aguda/flutuação em relação ao basal",
          "[ ] Fenótipo: hipoativo, hiperativo ou misto",
          "[ ] Se red flag neurológica, acelerar investigação dirigida"
        ]
      },
      uti: {
        title: "🫁 Sessão 2 — Avaliação na UTI por turno",
        text: [
          "[ ] Registrar alvo e valor atual do RASS",
          "[ ] RASS −4/−5: CAM-ICU não avaliável; rever coma/sedação",
          "[ ] RASS ≥−3: aplicar CAM-ICU ou ICDSC conforme rotina",
          "[ ] Resultado + horário + mudança do basal documentados",
          "[ ] Revisar dor, sedativos, anticolinérgicos e benzodiazepínicos",
          "[ ] Acionar ABCDEF: SAT/SBT, sedação, mobilidade e família"
        ]
      },
      enfermaria: {
        title: "🏥 Sessão 3 — Enfermaria/recuperação",
        text: [
          "[ ] Procurar mudança em cognição, atenção, percepção e função",
          "[ ] Não esquecer retraimento, lentificação e baixa ingesta",
          "[ ] Aplicar 4AT se houver indicadores (CAM-ICU/ICDSC em crítica/recuperação)",
          "[ ] Confirmar clinicamente; diferenciar demência, depressão e afasia",
          "[ ] Orientação, relógio/calendário, óculos, audição, hidratação e sono",
          "[ ] Comunicar diagnóstico e plano na transição do cuidado"
        ]
      },
      prevencao: {
        title: "🛡️ Sessão 4 — Prevenção multicomponente",
        text: [
          "[ ] Dor avaliada e tratada sem sedação excessiva",
          "[ ] Sedação mais leve possível e despertares/desmame protocolizados",
          "[ ] Dia com luz/atividade; noite com menos ruído e interrupções",
          "[ ] Óculos, aparelho auditivo, prótese e comunicação disponíveis",
          "[ ] Mobilização segura e redução de dispositivos desnecessários",
          "[ ] Hidratação, nutrição, oxigenação e trânsito intestinal revistos",
          "[ ] Família envolvida em reorientação e metas quando apropriado"
        ]
      },
      agitacao: {
        title: "🔥 Sessão 5 — Agitação perigosa ou refratária",
        text: [
          "[ ] Chamar ajuda; saída livre; uma pessoa conduz comunicação",
          "[ ] Corrigir hipóxia/hipercapnia, hipoglicemia, choque, dor e abstinência",
          "[ ] Reduzir estímulos; remover dispositivos não essenciais",
          "[ ] Reavaliar diagnóstico: AVC, crise, toxidrome, NMS/serotonina, catatonia",
          "[ ] VM + agitação impede extubação: considerar dexmedetomidina conforme protocolo",
          "[ ] Antipsicótico somente por curto prazo para sofrimento/risco selecionado",
          "[ ] Antes de antipsicótico: QTc, K/Mg, Parkinson/Lewy, EPS e interações",
          "[ ] Contenção física: último recurso, menor grau/tempo e reavaliação frequente",
          "[ ] Se sedação profunda for inevitável por risco imediato: ambiente monitorizado e via aérea preparada"
        ]
      },
      passagem: {
        title: "📣 Sessão 6 — Passagem e documentação",
        text: [
          "[ ] Basal cognitivo e funcional + fonte da informação",
          "[ ] Início/flutuação + fenótipo + RASS",
          "[ ] Instrumento, escore/resultado e horário",
          "[ ] Causas confirmadas, suspeitas e exames dirigidos",
          "[ ] Intervenções não farmacológicas em curso",
          "[ ] Fármacos usados, indicação, alvo, monitorização e prazo de retirada",
          "[ ] Riscos ativos e plano da próxima reavaliação"
        ]
      }
    },
    references: [
      {
        title: "SCCM PADIS — atualização focada 2025",
        note: "Sedação, antipsicóticos, mobilização e melatonina.",
        href: "https://www.sccm.org/clinical-resources/guidelines/guidelines/focused-update-padis-guideline"
      },
      {
        title: "SCCM PADIS 2018",
        note: "Rastreio, prevenção multicomponente e delirium agitado em VM.",
        href: "https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-for-the-prevention-and-management-of-pa"
      },
      {
        title: "NICE CG103 — atualizado em 2023",
        note: "4AT, CAM-ICU/ICDSC, prevenção, desescalada e haloperidol selecionado.",
        href: "https://www.nice.org.uk/guidance/cg103/chapter/Recommendations"
      },
      {
        title: "Vanderbilt/ICU Delirium — CAM-ICU",
        note: "Manual, fluxograma e materiais de aplicação à beira-leito.",
        href: "https://www.icudelirium.org/medical-professionals/delirium/monitoring-delirium-in-the-icu"
      },
      {
        title: "4AT — guia oficial",
        note: "Pontuação, aplicação e limitações do teste rápido.",
        href: "https://www.the4at.com/userguide"
      },
      {
        title: "MIND-USA — NEJM 2018",
        note: "Haloperidol/ziprasidona não aumentaram dias vivos sem delirium/coma.",
        href: "https://www.nejm.org/doi/10.1056/NEJMoa1808217"
      },
      {
        title: "AID-ICU — NEJM 2022",
        note: "Ensaio de haloperidol em delirium na UTI.",
        href: "https://www.nejm.org/doi/10.1056/NEJMoa2211868"
      },
      {
        title: "PRE-DELIRIC — BMJ 2012",
        note: "Modelo prognóstico com fatores das primeiras 24 horas de UTI.",
        href: "https://www.bmj.com/content/344/bmj.e420"
      },
      {
        title: "ICDSC — validação original",
        note: "Checklist de oito itens para a janela de observação da UTI.",
        href: "https://pubmed.ncbi.nlm.nih.gov/11430542/"
      },
      {
        title: "CAM-ICU — validação original",
        note: "Validação em pacientes críticos sob ventilação mecânica.",
        href: "https://jamanetwork.com/journals/jama/fullarticle/194422"
      }
    ]
  };

  window.ANTIGRAVITY_DELIRIUM = catalog;
  window.ANTIGRAVITY_CRITICAL_MODULE = {
    id: "delirium-uti-enfermaria-turbo",
    catalog,
    privacy: {
      network: false,
      telemetry: false,
      patientData: false
    }
  };
  window.dispatchEvent(new CustomEvent("antigravity:delirium-ready"));
})();
