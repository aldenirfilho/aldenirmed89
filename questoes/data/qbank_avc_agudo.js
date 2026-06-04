const QBANK_DATA = 
{
  "meta": {
    "id": "qbank-temi-avc-agudo-v1",
    "title": "Banco de Questões Padrão TEMI — AVC Agudo",
    "subtitle": "30 questões comentadas com links semânticos para temas correlacionados",
    "version": "1.0",
    "created": "2026-05-05",
    "language": "pt-BR",
    "module": "avc-agudo",
    "integration": {
      "homepageLabel": "🏆 Banco de Questões Padrão TEMI",
      "recommendedPath": "temas/avc-agudo/banco-questoes-padrao-temi/index.html",
      "dataFile": "data/qbank.temi.avc-agudo.json",
      "relationshipsFile": "data/connections.qbank.avc-agudo.json"
    }
  },
  "topicRegistry": {
    "avc-agudo": {
      "title": "AVC Agudo",
      "path": "../index.html",
      "status": "ativo"
    },
    "codigo-avc-10-minutos": {
      "title": "Código AVC em 10 minutos",
      "path": "../codigo-avc-10-minutos.html",
      "status": "ativo"
    },
    "trombolise-avc": {
      "title": "Trombólise no AVC",
      "path": "../../trombolise-avc/index.html",
      "status": "planejado"
    },
    "trombectomia-mecanica": {
      "title": "Trombectomia mecânica",
      "path": "../../trombectomia-mecanica/index.html",
      "status": "planejado"
    },
    "hipertensao-emergencia": {
      "title": "Hipertensão na Emergência",
      "path": "../../hipertensao-emergencia/index.html",
      "status": "planejado"
    },
    "hemorragia-intracraniana": {
      "title": "Hemorragia Intracraniana",
      "path": "../../hemorragia-intracraniana/index.html",
      "status": "planejado"
    },
    "anticoagulacao": {
      "title": "Anticoagulação e Reversão",
      "path": "../../anticoagulacao/index.html",
      "status": "planejado"
    },
    "fibrilacao-atrial": {
      "title": "Fibrilação Atrial",
      "path": "../../fibrilacao-atrial/index.html",
      "status": "planejado"
    },
    "neuroimagem-avc": {
      "title": "Neuroimagem no AVC",
      "path": "../../neuroimagem-avc/index.html",
      "status": "planejado"
    },
    "disfagia-avc": {
      "title": "Disfagia e Aspiração no AVC",
      "path": "../../disfagia/index.html",
      "status": "planejado"
    },
    "edema-cerebral": {
      "title": "Edema Cerebral Maligno",
      "path": "../../edema-cerebral/index.html",
      "status": "planejado"
    },
    "delirium-uti": {
      "title": "Delirium em UTI",
      "path": "../../delirium-uti/index.html",
      "status": "planejado"
    },
    "via-aerea-neurocritico": {
      "title": "Via aérea no neurocrítico",
      "path": "../../via-aerea-neurocritico/index.html",
      "status": "planejado"
    },
    "glicemia-uti": {
      "title": "Glicemia no paciente crítico",
      "path": "../../glicemia-uti/index.html",
      "status": "planejado"
    },
    "sepse": {
      "title": "Sepse",
      "path": "../../sepse/index.html",
      "status": "planejado"
    },
    "prevencao-secundaria-avc": {
      "title": "Prevenção secundária pós-AVC",
      "path": "../../prevencao-secundaria-avc/index.html",
      "status": "planejado"
    },
    "nihss": {
      "title": "NIHSS",
      "path": "../../escalas/nihss/index.html",
      "status": "planejado"
    },
    "aspect": {
      "title": "ASPECTS",
      "path": "../../escalas/aspects/index.html",
      "status": "planejado"
    }
  },
  "questions": [
    {
      "id": "TEMI-AVC-001",
      "difficulty": "Médio",
      "domain": "Reconhecimento e fluxo",
      "tags": [
        "código-avc",
        "lkw",
        "emergência"
      ],
      "related": [
        "codigo-avc-10-minutos",
        "avc-agudo",
        "nihss"
      ],
      "stem": "Homem de 68 anos chega ao pronto-socorro com hemiparesia direita e afasia. A esposa refere que ele foi visto bem pela última vez às 07:10; chegou às 08:05. Glicemia capilar 118 mg/dL. Qual informação temporal deve ser registrada como referência para decisões de reperfusão?",
      "options": {
        "A": "Hora em que a esposa percebeu o déficit.",
        "B": "Hora de chegada ao pronto-socorro.",
        "C": "Último horário em que o paciente foi visto sem déficits, 07:10.",
        "D": "Hora em que a tomografia ficou pronta.",
        "E": "Hora da avaliação pelo neurologista."
      },
      "answer": "C",
      "comment": "A referência temporal clássica é o LKW/LSN — último momento conhecido em que o paciente estava bem. Ela orienta janela de trombólise, trombectomia e necessidade de imagem avançada em cenários selecionados.",
      "pearl": "⏱️ TEMI: não confunda hora de descoberta com último horário bem definido.",
      "relatedTopics": [
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        },
        {
          "slug": "nihss",
          "title": "NIHSS",
          "path": "../../escalas/nihss/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-002",
      "difficulty": "Fácil",
      "domain": "Mimetizadores",
      "tags": [
        "hipoglicemia",
        "mimetizador",
        "ABCDE"
      ],
      "related": [
        "codigo-avc-10-minutos",
        "glicemia-uti"
      ],
      "stem": "Paciente com déficit focal súbito chega sonolento e sudoreico. Antes de encaminhar para imagem, uma medida simples e obrigatória na abordagem inicial é:",
      "options": {
        "A": "Administrar benzodiazepínico empiricamente.",
        "B": "Realizar glicemia capilar imediata.",
        "C": "Iniciar heparina plena.",
        "D": "Administrar aspirina antes da TC.",
        "E": "Aguardar avaliação neurológica formal para qualquer medida."
      },
      "answer": "B",
      "comment": "Hipoglicemia pode mimetizar AVC e é reversível. A glicemia capilar faz parte da abordagem inicial ABCDE, sem atrasar o fluxo de imagem.",
      "pearl": "🍬 Todo déficit focal agudo precisa de glicemia capilar precoce.",
      "relatedTopics": [
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        },
        {
          "slug": "glicemia-uti",
          "title": "Glicemia no paciente crítico",
          "path": "../../glicemia-uti/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-003",
      "difficulty": "Médio",
      "domain": "Imagem",
      "tags": [
        "tc",
        "hemorragia",
        "reperfusão"
      ],
      "related": [
        "neuroimagem-avc",
        "hemorragia-intracraniana",
        "trombolise-avc"
      ],
      "stem": "No AVC isquêmico agudo com chegada dentro da janela de trombólise, o principal objetivo inicial da TC de crânio sem contraste é:",
      "options": {
        "A": "Confirmar a área isquêmica final.",
        "B": "Excluir hemorragia intracraniana e outras contraindicações radiológicas imediatas.",
        "C": "Avaliar perfusão cerebral obrigatoriamente antes de qualquer trombólise.",
        "D": "Calcular o risco cardioembólico.",
        "E": "Confirmar fibrilação atrial."
      },
      "answer": "B",
      "comment": "A TC sem contraste é usada inicialmente para excluir hemorragia e grandes lesões que mudem a conduta. Dentro da janela clássica, a imagem avançada não deve atrasar trombólise em paciente elegível.",
      "pearl": "🖥️ TC inicial no AVCi: primeiro, excluir sangue.",
      "relatedTopics": [
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "hemorragia-intracraniana",
          "title": "Hemorragia Intracraniana",
          "path": "../../hemorragia-intracraniana/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-004",
      "difficulty": "Hard",
      "domain": "NIHSS e déficit incapacitante",
      "tags": [
        "nihss",
        "déficit-incapacitante",
        "trombólise"
      ],
      "related": [
        "nihss",
        "trombolise-avc",
        "avc-agudo"
      ],
      "stem": "Mulher de 57 anos, pianista profissional, chega 2 horas após início de fraqueza discreta na mão direita, NIHSS 2. TC sem hemorragia. O déficit é incapacitante para sua atividade. Sobre trombólise, a melhor interpretação é:",
      "options": {
        "A": "NIHSS baixo sempre contraindica trombólise.",
        "B": "Déficit incapacitante pode justificar trombólise mesmo com NIHSS baixo, se elegível.",
        "C": "Deve-se aguardar 24 h para confirmar se haverá piora.",
        "D": "Trombólise só deve ser feita se NIHSS ≥10.",
        "E": "Deve receber dupla antiagregação obrigatoriamente em vez de trombólise."
      },
      "answer": "B",
      "comment": "A decisão não deve ser baseada apenas no número do NIHSS. Déficit aparentemente pequeno, mas incapacitante, pode ser elegível para trombólise dentro da janela, se não houver contraindicações.",
      "pearl": "🎹 NIHSS baixo não é sinônimo de AVC leve para aquele paciente.",
      "relatedTopics": [
        {
          "slug": "nihss",
          "title": "NIHSS",
          "path": "../../escalas/nihss/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-005",
      "difficulty": "Médio",
      "domain": "Trombólise",
      "tags": [
        "trombólise",
        "janela",
        "tenecteplase",
        "alteplase"
      ],
      "related": [
        "trombolise-avc",
        "codigo-avc-10-minutos"
      ],
      "stem": "Em paciente adulto com AVC isquêmico agudo, déficit incapacitante, TC sem hemorragia, sem contraindicações e início há 3 horas, a conduta de reperfusão medicamentosa deve priorizar:",
      "options": {
        "A": "Trombólise IV rápida em paciente elegível.",
        "B": "Heparina plena imediata.",
        "C": "Aspirina antes da trombólise.",
        "D": "Controle glicêmico intensivo 80–130 mg/dL antes de tratar.",
        "E": "Aguardar ressonância magnética obrigatória."
      },
      "answer": "A",
      "comment": "O tratamento trombolítico IV permanece pilar do AVCi agudo em elegíveis dentro da janela. Diretrizes recentes aceitam alteplase ou tenecteplase em cenários apropriados, conforme protocolo local.",
      "pearl": "💉 Tempo para trombólise é cérebro: não transformar elegível em inelegível por atraso.",
      "relatedTopics": [
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-006",
      "difficulty": "Médio",
      "domain": "Pressão arterial",
      "tags": [
        "pressão-arterial",
        "trombólise",
        "segurança"
      ],
      "related": [
        "hipertensao-emergencia",
        "trombolise-avc"
      ],
      "stem": "Paciente candidato à trombólise IV apresenta PA 202/112 mmHg. TC sem hemorragia. Qual meta pressórica deve ser atingida antes do trombolítico?",
      "options": {
        "A": "<220/120 mmHg.",
        "B": "<200/110 mmHg.",
        "C": "<185/110 mmHg.",
        "D": "<160/90 mmHg obrigatoriamente.",
        "E": "PAS <140 mmHg antes de qualquer reperfusão."
      },
      "answer": "C",
      "comment": "Antes da trombólise IV, a PA deve ser reduzida para <185/110 mmHg. Após trombólise, a meta usual é manter <180/105 mmHg por 24 h.",
      "pearl": "🎚️ Fórmula de prova: antes <185/110; depois <180/105.",
      "relatedTopics": [
        {
          "slug": "hipertensao-emergencia",
          "title": "Hipertensão na Emergência",
          "path": "../../hipertensao-emergencia/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-007",
      "difficulty": "Médio",
      "domain": "Pressão arterial",
      "tags": [
        "hipertensão-permissiva",
        "sem-reperfusão"
      ],
      "related": [
        "hipertensao-emergencia",
        "avc-agudo"
      ],
      "stem": "Paciente com AVC isquêmico, fora de janela para trombólise, sem indicação de trombectomia e sem dissecção, IAM, edema agudo de pulmão ou encefalopatia hipertensiva. PA 196/104 mmHg. Melhor conduta inicial:",
      "options": {
        "A": "Reduzir rapidamente PAS para <140 mmHg.",
        "B": "Permitir hipertensão, com monitorização, pois está abaixo de 220/120 mmHg.",
        "C": "Iniciar nitroprussiato em bomba para normalizar PA.",
        "D": "Suspender monitorização neurológica porque a PA está aceitável.",
        "E": "Administrar diurético obrigatoriamente."
      },
      "answer": "B",
      "comment": "Em AVC isquêmico sem reperfusão e sem emergência hipertensiva associada, aceita-se hipertensão permissiva, geralmente até 220/120 mmHg, para preservar perfusão da penumbra.",
      "pearl": "🧠 Cuidado: baixar PA demais pode roubar fluxo da penumbra.",
      "relatedTopics": [
        {
          "slug": "hipertensao-emergencia",
          "title": "Hipertensão na Emergência",
          "path": "../../hipertensao-emergencia/index.html",
          "status": "planejado"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-008",
      "difficulty": "Hard",
      "domain": "Trombectomia",
      "tags": [
        "OGV",
        "trombectomia",
        "angioTC"
      ],
      "related": [
        "trombectomia-mecanica",
        "neuroimagem-avc",
        "codigo-avc-10-minutos"
      ],
      "stem": "Paciente com AVC agudo, afasia global e hemiplegia direita, NIHSS 18, chega 90 minutos após LKW. TC sem hemorragia. Qual exame adicional é mais diretamente útil para detectar oclusão de grande vaso e orientar trombectomia?",
      "options": {
        "A": "Eletroencefalograma.",
        "B": "Angiotomografia de vasos cervicais/intracranianos.",
        "C": "Punção lombar.",
        "D": "Ecocardiograma transesofágico imediato.",
        "E": "Doppler venoso de membros inferiores."
      },
      "answer": "B",
      "comment": "Déficit cortical grave sugere OGV. A angioTC identifica oclusões arteriais proximais e guia trombectomia, sem atrasar trombólise se esta estiver indicada.",
      "pearl": "🧲 NIHSS alto + síndrome cortical = pense em OGV e AngioTC.",
      "relatedTopics": [
        {
          "slug": "trombectomia-mecanica",
          "title": "Trombectomia mecânica",
          "path": "../../trombectomia-mecanica/index.html",
          "status": "planejado"
        },
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-009",
      "difficulty": "Hard",
      "domain": "Imagem/ASPECTS",
      "tags": [
        "ASPECTS",
        "core-isquêmico",
        "trombectomia"
      ],
      "related": [
        "aspect",
        "neuroimagem-avc",
        "trombectomia-mecanica"
      ],
      "stem": "O ASPECTS na TC inicial do AVC de circulação anterior é usado principalmente para:",
      "options": {
        "A": "Quantificar o risco de fibrilação atrial.",
        "B": "Avaliar extensão de sinais isquêmicos precoces no território da artéria cerebral média.",
        "C": "Diagnosticar hipoglicemia mimetizadora.",
        "D": "Confirmar hemorragia subaracnoidea perimesencefálica.",
        "E": "Substituir avaliação clínica de NIHSS."
      },
      "answer": "B",
      "comment": "ASPECTS é uma escala radiológica para estimar a extensão de isquemia precoce na circulação anterior, especialmente território da ACM. Ajuda na seleção de terapias e prognóstico.",
      "pearl": "🧮 ASPECTS baixo = maior core, maior risco, decisão mais refinada.",
      "relatedTopics": [
        {
          "slug": "aspect",
          "title": "ASPECTS",
          "path": "../../escalas/aspects/index.html",
          "status": "planejado"
        },
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombectomia-mecanica",
          "title": "Trombectomia mecânica",
          "path": "../../trombectomia-mecanica/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-010",
      "difficulty": "Hard",
      "domain": "Janela estendida",
      "tags": [
        "wake-up-stroke",
        "ressonância",
        "perfusão"
      ],
      "related": [
        "neuroimagem-avc",
        "trombolise-avc"
      ],
      "stem": "Paciente acorda com déficit focal, sem LKW claro. TC sem hemorragia. Em centros com recurso, a seleção para trombólise em janela desconhecida pode envolver:",
      "options": {
        "A": "Administrar trombólise a todos os pacientes com hora desconhecida.",
        "B": "Critérios de imagem avançada, como mismatch DWI-FLAIR ou perfusão, em pacientes selecionados.",
        "C": "Ignorar imagem e decidir apenas pelo NIHSS.",
        "D": "Heparinização plena imediata como alternativa padrão.",
        "E": "Aguardar 48 horas para repetir TC."
      },
      "answer": "B",
      "comment": "Em AVC de início desconhecido ou janela estendida, imagem avançada pode identificar tecido potencialmente salvável e selecionar pacientes para terapia em cenários específicos.",
      "pearl": "🌅 Wake-up stroke não é automaticamente “sem tratamento”; é “precisa selecionar melhor”.",
      "relatedTopics": [
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-011",
      "difficulty": "Hard",
      "domain": "Anticoagulação",
      "tags": [
        "DOAC",
        "contraindicação",
        "trombólise"
      ],
      "related": [
        "anticoagulacao",
        "trombolise-avc",
        "fibrilacao-atrial"
      ],
      "stem": "Paciente com AVCi há 2 horas usa apixabana, última dose há 4 horas, função renal normal. TC sem hemorragia. Sobre trombólise IV, a interpretação mais segura é:",
      "options": {
        "A": "Usar trombólise sem restrições, pois DOAC não interfere.",
        "B": "Considerar uso recente de DOAC como contraindicação relativa/importante, salvo critérios laboratoriais/protocolares específicos que demonstrem ausência de efeito anticoagulante relevante.",
        "C": "Dar dose dobrada de trombolítico para vencer o anticoagulante.",
        "D": "Administrar aspirina e clopidogrel antes da TC.",
        "E": "Fazer heparina plena para substituir a trombólise."
      },
      "answer": "B",
      "comment": "Uso recente de anticoagulante oral direto aumenta risco hemorrágico e geralmente impede trombólise, salvo avaliação laboratorial/protocolo especializado indicando segurança.",
      "pearl": "🩸 DOAC recente + trombólise = zona de alto risco, não automatizar.",
      "relatedTopics": [
        {
          "slug": "anticoagulacao",
          "title": "Anticoagulação e Reversão",
          "path": "../../anticoagulacao/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "fibrilacao-atrial",
          "title": "Fibrilação Atrial",
          "path": "../../fibrilacao-atrial/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-012",
      "difficulty": "Médio",
      "domain": "Antitrombóticos pós-trombólise",
      "tags": [
        "antiagregante",
        "24h",
        "trombólise"
      ],
      "related": [
        "trombolise-avc",
        "anticoagulacao"
      ],
      "stem": "Após trombólise IV para AVC isquêmico, quando iniciar antiagregante plaquetário de rotina, se não houver complicação?",
      "options": {
        "A": "Imediatamente durante a infusão do trombolítico.",
        "B": "Após 2 horas, independente de imagem.",
        "C": "Geralmente após 24 horas e nova imagem excluindo hemorragia.",
        "D": "Nunca deve ser usado após trombólise.",
        "E": "Somente após 7 dias em todos os casos."
      },
      "answer": "C",
      "comment": "Antitrombóticos são geralmente evitados nas primeiras 24 horas após trombólise; reavaliação clínica e imagem ajudam a excluir hemorragia antes de iniciar.",
      "pearl": "⛔ Trombólise hoje, antiagregante só depois da segurança de 24h.",
      "relatedTopics": [
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "anticoagulacao",
          "title": "Anticoagulação e Reversão",
          "path": "../../anticoagulacao/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-013",
      "difficulty": "Fácil",
      "domain": "Disfagia",
      "tags": [
        "disfagia",
        "aspiração",
        "segurança"
      ],
      "related": [
        "disfagia-avc",
        "avc-agudo"
      ],
      "stem": "Paciente pós-AVC chega à enfermaria. Antes de liberar dieta por via oral, uma medida essencial para reduzir pneumonia aspirativa é:",
      "options": {
        "A": "Administrar antiemético profilático a todos.",
        "B": "Realizar triagem de disfagia/deglutição conforme protocolo.",
        "C": "Prescrever dieta livre se o paciente estiver acordado.",
        "D": "Evitar fisioterapia respiratória por 72 horas.",
        "E": "Usar sonda nasoenteral em todos os pacientes com AVC."
      },
      "answer": "B",
      "comment": "Disfagia é comum após AVC e aumenta risco de broncoaspiração. A triagem antes de VO é item de segurança fundamental.",
      "pearl": "🥤 Não liberar VO no AVC sem rastrear deglutição.",
      "relatedTopics": [
        {
          "slug": "disfagia-avc",
          "title": "Disfagia e Aspiração no AVC",
          "path": "../../disfagia/index.html",
          "status": "planejado"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-014",
      "difficulty": "Hard",
      "domain": "Neuro UTI/edema",
      "tags": [
        "edema-cerebral",
        "ACM-maligna",
        "craniectomia"
      ],
      "related": [
        "edema-cerebral",
        "via-aerea-neurocritico",
        "neuroimagem-avc"
      ],
      "stem": "Paciente jovem com infarto extenso de artéria cerebral média evolui em 24–48h com sonolência progressiva, vômitos e anisocoria. A complicação mais temida é:",
      "options": {
        "A": "Síndrome de Guillain-Barré.",
        "B": "Edema cerebral maligno com risco de herniação.",
        "C": "Neutropenia febril.",
        "D": "Hipocalcemia isolada.",
        "E": "Endocardite subaguda obrigatória."
      },
      "answer": "B",
      "comment": "Infartos extensos de ACM podem causar edema citotóxico/vasogênico progressivo, hipertensão intracraniana e herniação. Exigem Neuro UTI, neurocirurgia e medidas de controle de pressão intracraniana.",
      "pearl": "🌊 Piora 24–72h em grande ACM: pense em edema maligno.",
      "relatedTopics": [
        {
          "slug": "edema-cerebral",
          "title": "Edema Cerebral Maligno",
          "path": "../../edema-cerebral/index.html",
          "status": "planejado"
        },
        {
          "slug": "via-aerea-neurocritico",
          "title": "Via aérea no neurocrítico",
          "path": "../../via-aerea-neurocritico/index.html",
          "status": "planejado"
        },
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-015",
      "difficulty": "Hard",
      "domain": "Complicação da trombólise",
      "tags": [
        "hemorragia",
        "trombólise",
        "deterioração"
      ],
      "related": [
        "hemorragia-intracraniana",
        "trombolise-avc"
      ],
      "stem": "Durante trombólise IV, paciente apresenta cefaleia súbita intensa, vômitos e piora neurológica. A conduta inicial mais adequada é:",
      "options": {
        "A": "Acelerar a infusão do trombolítico para completar dose.",
        "B": "Suspender trombolítico, realizar avaliação urgente e TC de crânio, acionando protocolo de hemorragia/reversão.",
        "C": "Administrar heparina plena.",
        "D": "Aguardar 24 horas para imagem de controle.",
        "E": "Ignorar se PA estiver normal."
      },
      "answer": "B",
      "comment": "Deterioração neurológica durante/pós-trombólise sugere hemorragia intracraniana até prova em contrário. Deve-se interromper infusão e acionar protocolo de avaliação e reversão conforme instituição.",
      "pearl": "🩸 Piorou durante trombólise = pare e procure sangue.",
      "relatedTopics": [
        {
          "slug": "hemorragia-intracraniana",
          "title": "Hemorragia Intracraniana",
          "path": "../../hemorragia-intracraniana/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-016",
      "difficulty": "Hard",
      "domain": "Circulação posterior",
      "tags": [
        "basilar",
        "trombectomia",
        "NIHSS"
      ],
      "related": [
        "trombectomia-mecanica",
        "neuroimagem-avc",
        "via-aerea-neurocritico"
      ],
      "stem": "Paciente com rebaixamento, diplopia, tetraparesia e suspeita de oclusão de artéria basilar chega 10 horas após início. Qual afirmação é mais compatível com abordagem atual?",
      "options": {
        "A": "Oclusão basilar nunca é candidata a trombectomia.",
        "B": "EVT pode ser considerada/indicada em pacientes selecionados, inclusive até 24 h em cenários apropriados.",
        "C": "NIHSS não tem qualquer utilidade em circulação posterior.",
        "D": "Apenas aspirina resolve a maioria dos casos graves de basilar.",
        "E": "Não há necessidade de angioimagem."
      },
      "answer": "B",
      "comment": "A oclusão de basilar é grave e diretrizes recentes fortalecem a indicação de EVT em pacientes selecionados dentro de até 24 horas, especialmente com déficits importantes.",
      "pearl": "🧠 Basilar é AVC de alta mortalidade: pense rápido em angioimagem e EVT.",
      "relatedTopics": [
        {
          "slug": "trombectomia-mecanica",
          "title": "Trombectomia mecânica",
          "path": "../../trombectomia-mecanica/index.html",
          "status": "planejado"
        },
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "via-aerea-neurocritico",
          "title": "Via aérea no neurocrítico",
          "path": "../../via-aerea-neurocritico/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-017",
      "difficulty": "Médio",
      "domain": "Glicemia",
      "tags": [
        "hiperglicemia",
        "hipoglicemia",
        "UTI"
      ],
      "related": [
        "glicemia-uti",
        "codigo-avc-10-minutos"
      ],
      "stem": "Sobre manejo glicêmico no AVC isquêmico agudo, assinale a alternativa mais adequada:",
      "options": {
        "A": "Controle intensivo 80–130 mg/dL melhora desfecho e deve ser buscado agressivamente.",
        "B": "Hipoglicemia deve ser corrigida; controle intensivo 80–130 mg/dL não é recomendado por risco de hipoglicemia.",
        "C": "Glicemia não interfere no AVC agudo.",
        "D": "Insulina deve ser evitada sempre, mesmo em hiperglicemia grave.",
        "E": "Hiperglicemia exclui trombectomia."
      },
      "answer": "B",
      "comment": "Hipoglicemia é mimetizador e deve ser corrigida. Controle glicêmico intensivo pode aumentar hipoglicemia grave e não melhora desfecho em AVCi agudo.",
      "pearl": "🍬 Evite extremos: hipoglicemia mata neurônio e confunde diagnóstico.",
      "relatedTopics": [
        {
          "slug": "glicemia-uti",
          "title": "Glicemia no paciente crítico",
          "path": "../../glicemia-uti/index.html",
          "status": "planejado"
        },
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-018",
      "difficulty": "Fácil",
      "domain": "Oxigênio",
      "tags": [
        "oxigênio",
        "suporte",
        "hipoxemia"
      ],
      "related": [
        "via-aerea-neurocritico",
        "avc-agudo"
      ],
      "stem": "No AVC agudo, sobre oxigenoterapia, a melhor conduta é:",
      "options": {
        "A": "Oxigênio de rotina para todos, mesmo saturando bem.",
        "B": "Oxigênio se houver hipoxemia ou risco ventilatório, evitando hiperóxia desnecessária.",
        "C": "Nunca oferecer oxigênio no AVC.",
        "D": "Intubar todo paciente com NIHSS >4.",
        "E": "Usar ventilação não invasiva em todos."
      },
      "answer": "B",
      "comment": "A oxigenoterapia deve corrigir hipoxemia. Oxigênio suplementar rotineiro em normoxêmicos não é estratégia de melhora neurológica comprovada.",
      "pearl": "🫁 AVC não é indicação automática de O₂; hipoxemia é.",
      "relatedTopics": [
        {
          "slug": "via-aerea-neurocritico",
          "title": "Via aérea no neurocrítico",
          "path": "../../via-aerea-neurocritico/index.html",
          "status": "planejado"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-019",
      "difficulty": "Médio",
      "domain": "Crises epilépticas",
      "tags": [
        "convulsão",
        "profilaxia",
        "neurocrítico"
      ],
      "related": [
        "delirium-uti",
        "via-aerea-neurocritico"
      ],
      "stem": "Paciente com AVC isquêmico cortical sem crise convulsiva. Sobre anticonvulsivante profilático:",
      "options": {
        "A": "Deve ser prescrito rotineiramente a todos os AVCi corticais.",
        "B": "Não é rotina em AVCi sem crise; tratar se houver crise clínica/eletrográfica ou indicação específica.",
        "C": "Substitui investigação de rebaixamento.",
        "D": "É obrigatório antes de trombólise.",
        "E": "Previne transformação hemorrágica."
      },
      "answer": "B",
      "comment": "Profilaxia anticonvulsivante de rotina não é indicada no AVC isquêmico sem crises. Deve-se tratar crise e investigar rebaixamento conforme contexto.",
      "pearl": "⚡ Convulsão no AVC: trate quando existe; não medicalize no automático.",
      "relatedTopics": [
        {
          "slug": "delirium-uti",
          "title": "Delirium em UTI",
          "path": "../../delirium-uti/index.html",
          "status": "planejado"
        },
        {
          "slug": "via-aerea-neurocritico",
          "title": "Via aérea no neurocrítico",
          "path": "../../via-aerea-neurocritico/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-020",
      "difficulty": "Médio",
      "domain": "Temperatura",
      "tags": [
        "febre",
        "neuroproteção",
        "UTI"
      ],
      "related": [
        "sepse",
        "avc-agudo"
      ],
      "stem": "Paciente pós-AVC evolui com temperatura 38,5°C. A melhor interpretação é:",
      "options": {
        "A": "Febre é benéfica por aumentar perfusão cerebral.",
        "B": "Febre deve ser investigada e tratada, pois piora metabolismo cerebral e pode sinalizar infecção/aspiração.",
        "C": "Febre exclui diagnóstico de AVC.",
        "D": "Antibiótico amplo obrigatório em todo AVC febril, sem avaliação.",
        "E": "Hipotermia profunda é mandatória para todos."
      },
      "answer": "B",
      "comment": "Febre aumenta demanda metabólica cerebral e pode agravar lesão. Deve-se investigar causas comuns, como aspiração, ITU, pneumonia, e tratar conforme achados.",
      "pearl": "🌡️ No cérebro lesado, febre é inimiga.",
      "relatedTopics": [
        {
          "slug": "sepse",
          "title": "Sepse",
          "path": "../../sepse/index.html",
          "status": "planejado"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-021",
      "difficulty": "Hard",
      "domain": "Prevenção secundária/FA",
      "tags": [
        "fibrilação-atrial",
        "anticoagulação",
        "prevenção-secundária"
      ],
      "related": [
        "fibrilacao-atrial",
        "anticoagulacao",
        "prevencao-secundaria-avc"
      ],
      "stem": "Paciente com AVC isquêmico cardioembólico por fibrilação atrial. Sobre reinício/início de anticoagulação oral:",
      "options": {
        "A": "Deve ser iniciado imediatamente em todos, na primeira hora.",
        "B": "Depende de tamanho do infarto, risco hemorrágico, imagem de controle e gravidade; não é decisão única para todos.",
        "C": "É proibido para sempre após qualquer AVC.",
        "D": "Deve ser substituído por heparina plena obrigatória em todos.",
        "E": "Não depende de transformação hemorrágica."
      },
      "answer": "B",
      "comment": "O tempo de anticoagulação pós-AVC por FA é individualizado conforme extensão do infarto, gravidade, risco de transformação hemorrágica, imagem e risco embólico.",
      "pearl": "❤️ FA pós-AVC: anticoagular sim, mas o timing é o jogo.",
      "relatedTopics": [
        {
          "slug": "fibrilacao-atrial",
          "title": "Fibrilação Atrial",
          "path": "../../fibrilacao-atrial/index.html",
          "status": "planejado"
        },
        {
          "slug": "anticoagulacao",
          "title": "Anticoagulação e Reversão",
          "path": "../../anticoagulacao/index.html",
          "status": "planejado"
        },
        {
          "slug": "prevencao-secundaria-avc",
          "title": "Prevenção secundária pós-AVC",
          "path": "../../prevencao-secundaria-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-022",
      "difficulty": "Médio",
      "domain": "TEV",
      "tags": [
        "profilaxia-TEV",
        "imobilidade",
        "segurança"
      ],
      "related": [
        "avc-agudo",
        "via-aerea-neurocritico"
      ],
      "stem": "Paciente com AVC extenso, imobilidade importante e alto risco de aspiração. Qual medida de segurança não deve ser esquecida na internação?",
      "options": {
        "A": "Profilaxia de TEV conforme risco e segurança hemorrágica.",
        "B": "Suspender toda mobilização por 30 dias.",
        "C": "Heparina plena para todos desde a chegada.",
        "D": "Dieta livre imediata.",
        "E": "Restringir hidratação para todos."
      },
      "answer": "A",
      "comment": "Profilaxia de tromboembolismo venoso deve ser considerada conforme mobilidade, risco hemorrágico e tratamento recebido. Inclui medidas mecânicas e/ou farmacológicas quando seguro.",
      "pearl": "🦵 AVC imobiliza; imobilidade trombosa.",
      "relatedTopics": [
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        },
        {
          "slug": "via-aerea-neurocritico",
          "title": "Via aérea no neurocrítico",
          "path": "../../via-aerea-neurocritico/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-023",
      "difficulty": "Hard",
      "domain": "Antiagregação em AVC menor/AIT",
      "tags": [
        "dupla-antiagregação",
        "AIT",
        "AVC-menor"
      ],
      "related": [
        "prevencao-secundaria-avc",
        "anticoagulacao"
      ],
      "stem": "Paciente com AVC menor não incapacitante/AIT de alto risco, fora de indicação de trombólise. Uma estratégia frequentemente considerada em protocolos é:",
      "options": {
        "A": "Dupla antiagregação por período curto em pacientes selecionados, se baixo risco hemorrágico.",
        "B": "Trombólise obrigatória em todos os NIHSS baixos.",
        "C": "Heparina plena por 30 dias para todos.",
        "D": "Nenhuma terapia antitrombótica por 6 meses.",
        "E": "Anticoagulação oral em todos independentemente de etiologia."
      },
      "answer": "A",
      "comment": "Em AVC menor não incapacitante/AIT de alto risco, DAPT curta pode reduzir recorrência em pacientes selecionados, seguindo critérios e risco hemorrágico.",
      "pearl": "🧩 AVC menor não incapacitante ≠ trombólise automática; pense em DAPT curta se indicado.",
      "relatedTopics": [
        {
          "slug": "prevencao-secundaria-avc",
          "title": "Prevenção secundária pós-AVC",
          "path": "../../prevencao-secundaria-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "anticoagulacao",
          "title": "Anticoagulação e Reversão",
          "path": "../../anticoagulacao/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-024",
      "difficulty": "Médio",
      "domain": "Idoso e elegibilidade",
      "tags": [
        "idade",
        "trombólise",
        "elegibilidade"
      ],
      "related": [
        "trombolise-avc",
        "avc-agudo"
      ],
      "stem": "Paciente de 86 anos, independente, chega 2 horas após AVC incapacitante. TC sem hemorragia e sem contraindicações. Sobre idade:",
      "options": {
        "A": "Idade >80 anos contraindica absolutamente trombólise em qualquer cenário.",
        "B": "Idade isolada não deve excluir tratamento em paciente elegível.",
        "C": "Todo idoso deve receber apenas cuidados paliativos.",
        "D": "Trombectomia é proibida acima de 75 anos.",
        "E": "Não é necessário avaliar funcionalidade prévia."
      },
      "answer": "B",
      "comment": "A idade deve entrar na avaliação de risco-benefício, mas não é, isoladamente, contraindicação absoluta para terapias de reperfusão em pacientes elegíveis.",
      "pearl": "👴 Prova adora etarismo terapêutico: idade sozinha não decide.",
      "relatedTopics": [
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-025",
      "difficulty": "Hard",
      "domain": "Sintomas leves/não incapacitantes",
      "tags": [
        "déficit-não-incapacitante",
        "DAPT",
        "trombólise"
      ],
      "related": [
        "trombolise-avc",
        "prevencao-secundaria-avc"
      ],
      "stem": "Paciente com hipoestesia isolada leve, sem limitação funcional, NIHSS 1, dentro de 3 horas. TC normal. Sobre trombólise:",
      "options": {
        "A": "Deve ser feita sempre porque está dentro de 4,5 h.",
        "B": "Em déficit não incapacitante, trombólise tende a não trazer benefício; considerar abordagem antitrombótica conforme protocolo.",
        "C": "NIHSS 1 obriga trombectomia.",
        "D": "Heparina plena é o tratamento padrão.",
        "E": "Não há risco de recorrência e pode ter alta sem investigação."
      },
      "answer": "B",
      "comment": "Déficits não incapacitantes dentro da janela não se beneficiam claramente de trombólise; em pacientes selecionados, antiagregação e investigação etiológica são centrais.",
      "pearl": "🔍 Pergunta-chave: o déficit incapacita ou não?",
      "relatedTopics": [
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "prevencao-secundaria-avc",
          "title": "Prevenção secundária pós-AVC",
          "path": "../../prevencao-secundaria-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-026",
      "difficulty": "Hard",
      "domain": "Não atrasar reperfusão",
      "tags": [
        "imagem-avançada",
        "trombólise",
        "fluxo"
      ],
      "related": [
        "codigo-avc-10-minutos",
        "neuroimagem-avc",
        "trombolise-avc"
      ],
      "stem": "Paciente elegível para trombólise dentro de 2 horas, TC sem hemorragia. AngioTC e perfusão ainda não disponíveis. Qual princípio é correto?",
      "options": {
        "A": "Aguardar perfusão obrigatoriamente antes de trombólise em todos.",
        "B": "Não atrasar trombólise IV elegível dentro da janela por imagem avançada, enquanto se organiza avaliação de OGV se indicada.",
        "C": "Realizar ressonância obrigatória antes de qualquer trombolítico.",
        "D": "Dar antiagregante antes de trombolítico.",
        "E": "Esperar melhora espontânea por 3 horas."
      },
      "answer": "B",
      "comment": "Em paciente elegível dentro da janela clássica, a trombólise não deve ser atrasada por imagem avançada. Angioimagem pode ser feita rapidamente para trombectomia, conforme fluxo local.",
      "pearl": "🚀 TC sem sangue + elegível = não prender o paciente no corredor da imagem.",
      "relatedTopics": [
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        },
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-027",
      "difficulty": "Médio",
      "domain": "LKW em acordar com sintomas",
      "tags": [
        "wake-up-stroke",
        "lkw"
      ],
      "related": [
        "codigo-avc-10-minutos",
        "neuroimagem-avc"
      ],
      "stem": "Paciente acorda às 06:00 com hemiparesia. Dormiu bem às 23:00. Para cálculo inicial de tempo de início, o LKW é:",
      "options": {
        "A": "06:00, hora em que acordou.",
        "B": "23:00, último horário em que estava conhecido como normal.",
        "C": "Hora em que chegou ao hospital.",
        "D": "Hora da TC.",
        "E": "Hora da primeira prescrição."
      },
      "answer": "B",
      "comment": "Em wake-up stroke, o LKW é o último horário em que o paciente estava normal — no caso, antes de dormir. A hora de descoberta não equivale à hora de início.",
      "pearl": "🌙 Dormiu normal às 23h e acordou deficitário: LKW é 23h.",
      "relatedTopics": [
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        },
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-028",
      "difficulty": "Médio",
      "domain": "NIHSS",
      "tags": [
        "NIHSS",
        "afasia",
        "negligência"
      ],
      "related": [
        "nihss",
        "avc-agudo"
      ],
      "stem": "Qual achado costuma aumentar suspeita de síndrome cortical e possível oclusão de grande vaso em AVC agudo?",
      "options": {
        "A": "Dor lombar isolada.",
        "B": "Afasia ou negligência espacial associada a déficit motor.",
        "C": "Tosse crônica isolada.",
        "D": "Parestesia bilateral simétrica de anos de evolução.",
        "E": "Prurido difuso."
      },
      "answer": "B",
      "comment": "Afasia, negligência, desvio conjugado do olhar e hemiplegia sugerem envolvimento cortical e podem apontar para OGV, exigindo angioimagem se disponível.",
      "pearl": "🧠 Afasia/negligência são pistas de córtex — pense grande vaso.",
      "relatedTopics": [
        {
          "slug": "nihss",
          "title": "NIHSS",
          "path": "../../escalas/nihss/index.html",
          "status": "planejado"
        },
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-029",
      "difficulty": "Hard",
      "domain": "Hemorragia pós-reperfusão",
      "tags": [
        "transformação-hemorrágica",
        "PA",
        "neuroUTI"
      ],
      "related": [
        "hemorragia-intracraniana",
        "hipertensao-emergencia",
        "edema-cerebral"
      ],
      "stem": "Após trombectomia com reperfusão completa, equipe propõe reduzir PAS agressivamente para <120 mmHg para “proteger o cérebro”. Qual resposta é mais adequada?",
      "options": {
        "A": "Redução intensiva sempre melhora desfecho após EVT completa.",
        "B": "Redução intensiva para metas muito baixas pode ser prejudicial; evitar hipotensão e seguir metas/protocolo, sem buscar PAS <140 rotineiramente apenas por reperfusão completa.",
        "C": "Não monitorar PA após EVT.",
        "D": "Manter PA sempre >240 mmHg.",
        "E": "Usar nitroprussiato em todos."
      },
      "answer": "B",
      "comment": "Evidências recentes não sustentam redução intensiva rotineira da PAS para <140 após EVT, mesmo com reperfusão completa; hipotensão pode comprometer perfusão colateral/tecido vulnerável.",
      "pearl": "🎚️ Pós-EVT: nem hipertensão descontrolada, nem queda heroica.",
      "relatedTopics": [
        {
          "slug": "hemorragia-intracraniana",
          "title": "Hemorragia Intracraniana",
          "path": "../../hemorragia-intracraniana/index.html",
          "status": "planejado"
        },
        {
          "slug": "hipertensao-emergencia",
          "title": "Hipertensão na Emergência",
          "path": "../../hipertensao-emergencia/index.html",
          "status": "planejado"
        },
        {
          "slug": "edema-cerebral",
          "title": "Edema Cerebral Maligno",
          "path": "../../edema-cerebral/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    },
    {
      "id": "TEMI-AVC-030",
      "difficulty": "Expert",
      "domain": "Caso integrado TEMI",
      "tags": [
        "caso-integrado",
        "TEMI",
        "decisão"
      ],
      "related": [
        "avc-agudo",
        "codigo-avc-10-minutos",
        "trombolise-avc",
        "trombectomia-mecanica",
        "hipertensao-emergencia",
        "neuroimagem-avc"
      ],
      "stem": "Homem de 72 anos, independente, LKW há 80 minutos, afasia e hemiplegia direita, NIHSS 19, PA 188/106, glicemia 132, TC sem hemorragia. AngioTC mostra oclusão de M1. Qual é a melhor estratégia global?",
      "options": {
        "A": "Controle da PA para meta de trombólise, trombólise IV se elegível e acionar trombectomia sem atrasos.",
        "B": "Aguardar 24 h para ver evolução espontânea.",
        "C": "Aspirina + clopidogrel imediatamente antes da trombólise.",
        "D": "Heparina plena e observação em enfermaria.",
        "E": "Reduzir PAS para <120 antes de qualquer decisão."
      },
      "answer": "A",
      "comment": "O caso reúne janela precoce, déficit incapacitante e OGV. Deve-se ajustar PA para <185/110, trombolisar se não houver contraindicações e acionar trombectomia/transferência para EVT sem atrasar o fluxo.",
      "pearl": "🏆 TEMI Boss: AVC grave + M1 + janela precoce = ponte IVT/EVT se elegível.",
      "relatedTopics": [
        {
          "slug": "avc-agudo",
          "title": "AVC Agudo",
          "path": "../index.html",
          "status": "ativo"
        },
        {
          "slug": "codigo-avc-10-minutos",
          "title": "Código AVC em 10 minutos",
          "path": "../codigo-avc-10-minutos.html",
          "status": "ativo"
        },
        {
          "slug": "trombolise-avc",
          "title": "Trombólise no AVC",
          "path": "../../trombolise-avc/index.html",
          "status": "planejado"
        },
        {
          "slug": "trombectomia-mecanica",
          "title": "Trombectomia mecânica",
          "path": "../../trombectomia-mecanica/index.html",
          "status": "planejado"
        },
        {
          "slug": "hipertensao-emergencia",
          "title": "Hipertensão na Emergência",
          "path": "../../hipertensao-emergencia/index.html",
          "status": "planejado"
        },
        {
          "slug": "neuroimagem-avc",
          "title": "Neuroimagem no AVC",
          "path": "../../neuroimagem-avc/index.html",
          "status": "planejado"
        }
      ],
      "sourceRefs": [
        "AHA_ASA_2026_AIS",
        "TARGET_STROKE_PHASE_III",
        "SBAVC_DIRETRIZES"
      ]
    }
  ],
  "references": {
    "AHA_ASA_2026_AIS": {
      "title": "2026 AHA/ASA Guideline for Early Management of Acute Ischemic Stroke",
      "url": "https://www.ahajournals.org/doi/10.1161/STR.0000000000000513"
    },
    "AHA_TOP_THINGS_2026": {
      "title": "Top Things to Know: 2026 Guideline for AIS",
      "url": "https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know"
    },
    "TARGET_STROKE_PHASE_III": {
      "title": "AHA/ASA Target: Stroke Phase III",
      "url": "https://www.heart.org/en/professional/quality-improvement/target-stroke/introducing-target-stroke-phase-iii"
    },
    "SBAVC_DIRETRIZES": {
      "title": "Sociedade Brasileira de AVC — Diretrizes e Guidelines",
      "url": "https://avc.org.br/publicacoes-e-artigos/diretrizes-e-guidelines/"
    }
  }
};
