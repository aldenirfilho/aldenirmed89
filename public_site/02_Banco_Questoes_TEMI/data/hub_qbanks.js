const HUB_DATA = 
{
  "topicRegistry": {
    "avc-agudo": { "label": "AVC Agudo", "url": "../01_Modulos_Clinicos/AVC_Agudo/avc.html", "status": "ativo" },
    "codigo-avc-10-minutos": { "label": "Código AVC", "url": "../01_Modulos_Clinicos/AVC_Agudo/codigo_avc_10_minutos_dashboard_html.html", "status": "ativo" },
    "trombolise-avc": { "label": "Trombólise no AVC", "url": "../01_Modulos_Clinicos/AVC_Agudo/avc.html#trombolise", "status": "ativo" },
    "trombectomia-avc": { "label": "Trombectomia", "url": "../01_Modulos_Clinicos/AVC_Agudo/avc.html#trombectomia", "status": "ativo" },
    "neuroimagem-avc": { "label": "Neuroimagem", "url": "../01_Modulos_Clinicos/AVC_Agudo/avc_31_blocos.html#bloco-18", "status": "ativo" },
    "hipertensao-emergencia": { "label": "Hipertensão na Emergência", "url": "", "status": "planejado" },
    "fibrilacao-atrial": { "label": "Fibrilação Atrial", "url": "", "status": "planejado" },
    "anticoagulacao": { "label": "Anticoagulação", "url": "", "status": "planejado" },
    "hemorragia-intracraniana": { "label": "Hemorragia Intracraniana", "url": "", "status": "planejado" },
    "edema-cerebral": { "label": "Edema Cerebral", "url": "", "status": "planejado" },
    "delirium-uti": { "label": "Delirium em UTI", "url": "", "status": "planejado" },
    "disfagia": { "label": "Disfagia", "url": "", "status": "planejado" },
    "sepse": { "label": "Sepse", "url": "", "status": "planejado" },
    "ventilacao-mecanica": { "label": "Ventilação Mecânica", "url": "", "status": "planejado" },
    "choque": { "label": "Choque", "url": "", "status": "planejado" }
  },
  "qbanks": [
    {
      "id": "qbank-temi-avc-agudo",
      "title": "AVC Agudo",
      "icon": "🧠",
      "status": "ativo",
      "domain": "neuro",
      "difficultyProfile": "Fácil → Expert",
      "questions": 30,
      "comments": 30,
      "estimatedTime": "45–70 min",
      "url": "avc_agudo_questoes.html",
      "description": "Banco inaugural com 30 questões comentadas sobre Código AVC, trombólise, trombectomia, neuroimagem, PA, UTI e prevenção de complicações.",
      "relatedTopics": [
        "avc-agudo", "trombolise-avc", "trombectomia-avc", "neuroimagem-avc", "hipertensao-emergencia", "fibrilacao-atrial", "anticoagulacao", "hemorragia-intracraniana", "edema-cerebral", "disfagia", "delirium-uti"
      ],
      "keywords": ["AVC", "trombolise", "trombectomia", "NIHSS", "ASPECTS", "pressao arterial", "neuroimagem", "TEMI"]
    },
    {
      "id": "qbank-temi-sepse",
      "title": "Sepse e Choque Séptico",
      "icon": "🦠",
      "status": "planejado",
      "domain": "infectologia",
      "difficultyProfile": "Médio → Expert",
      "questions": 0,
      "comments": 0,
      "estimatedTime": "em construção",
      "url": "",
      "description": "Bundle de 1 hora, lactato, vasopressores, antibiótico precoce, fonte infecciosa, fluidos, hemodinâmica e UTI.",
      "relatedTopics": ["sepse", "choque", "antibioticoterapia", "uti"],
      "keywords": ["sepse", "choque septico", "lactato", "noradrenalina", "surviving sepsis"]
    },
    {
      "id": "qbank-temi-vm-sdra",
      "title": "Ventilação Mecânica / SDRA",
      "icon": "🫁",
      "status": "planejado",
      "domain": "respiratorio",
      "difficultyProfile": "Médio → Expert",
      "questions": 0,
      "comments": 0,
      "estimatedTime": "em construção",
      "url": "",
      "description": "Driving pressure, PEEP, volume corrente, SDRA, prona, desmame, VNI, assincronia e proteção pulmonar.",
      "relatedTopics": ["ventilacao-mecanica", "sdra", "gasometria", "sedacao"],
      "keywords": ["ventilacao", "SDRA", "PEEP", "driving pressure", "prona"]
    },
    {
      "id": "qbank-temi-choque-hemodinamica",
      "title": "Choque e Hemodinâmica",
      "icon": "🫀",
      "status": "planejado",
      "domain": "hemodinamica",
      "difficultyProfile": "Hard → Expert",
      "questions": 0,
      "comments": 0,
      "estimatedTime": "em construção",
      "url": "",
      "description": "Tipos de choque, drogas vasoativas, monitorização minimamente invasiva e PAM.",
      "relatedTopics": ["choque", "sepse", "uti"],
      "keywords": ["choque", "pam", "noradrenalina", "uti"]
    }
  ]
}
;
