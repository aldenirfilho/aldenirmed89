window.ECG_ALMANAC = {
  "meta": {
    "version": "1.0.0",
    "updatedAt": "2026-08-21",
    "title": "Almanaque ECG 360 × Turbo TEMI",
    "patternCount": 30,
    "storagePrefix": "antigravity:almanaque-ecg:v1"
  },
  "quickScan": [
    {"step": "1", "title": "Calibre", "text": "Confirme nome/horário, 25 mm/s, 10 mm/mV, artefato e posição dos eletrodos."},
    {"step": "2", "title": "Ritmo", "text": "Frequência, regularidade, onda P, relação P–QRS e estabilidade hemodinâmica."},
    {"step": "3", "title": "Condução", "text": "Eixo, PR, largura do QRS, bloqueios, progressão de R e voltagem."},
    {"step": "4", "title": "Repolarização", "text": "Ponto J, ST, T, QT/QTc, ondas U e comparação com traçado prévio."},
    {"step": "5", "title": "Contexto", "text": "Sintomas, eletrólitos, temperatura, fármacos, isquemia, estrutura e tendência seriada."}
  ],
  "patterns": [
    {
      "id": "ecg-normal-calibracao", "number": 1, "title": "ECG normal e calibração", "short": "Calibre antes de interpretar.", "category": "fundamentos", "urgency": "base",
      "tags": ["normal", "calibração", "artefato", "intervalos", "eixo", "QTc"], "image": "assets/images/01_ecg_normal.png", "imageAlt": "ECG real anonimizado em doze derivações usado como referência de calibração e leitura sistemática.", "imageKind": "real",
      "firstLook": "Velocidade, ganho, qualidade e ritmo.", "leads": "DII para P/ritmo; I e aVF para eixo; V1 e V6 para condução; todas para progressão de R.", "measure": "Frequência, PR, QRS e QT/QTc. Use fórmula adequada à frequência e não aceite a medida automática sem conferir.",
      "context": "É o ponto de partida de todo ECG e a melhor defesa contra artefato, troca de cabos e comparação enganosa.",
      "findings": ["P antes de cada QRS e QRS após cada P no ritmo sinusal.", "Progressão precordial de R e ST–T sem padrão territorial agudo.", "Calibração padrão explicitamente confirmada."],
      "mimics": ["Troca de eletrodos de membros", "V1–V2 posicionados muito altos", "Tremor/artefato", "Variante relacionada a idade, sexo e biotipo"],
      "action": ["Corrija técnica antes de nomear doença.", "Compare com ECG prévio quando a mudança temporal importa."],
      "prevention": ["Padronize posicionamento e registre calibração.", "Repita o traçado quando a técnica não combina com a clínica."],
      "limits": ["ECG normal não exclui SCA, TEP, distúrbio eletrolítico ou arritmia intermitente."], "refs": ["aha-ecg", "acc-acs-2025"]
    },
    {
      "id": "iam-anterior", "number": 2, "title": "IAM anterior extenso", "short": "ST regional anterior/lateral: via de reperfusão.", "category": "isquemia", "urgency": "emergencia",
      "tags": ["STEMI", "IAM", "DA", "V2", "V6", "reciprocidade"], "image": "assets/images/02_iam_anterior_extenso.png", "imageAlt": "ECG real anonimizado com elevação de ST anterior e lateral compatível com infarto anterior extenso.", "imageKind": "real",
      "firstLook": "ST em derivações contíguas e alterações recíprocas.", "leads": "V2–V6, I e aVL; observe III/aVF como campo recíproco.", "measure": "Desvio do ST no ponto J conforme sexo, idade e derivação; a decisão não é apenas milimétrica.",
      "context": "Dor/isquemia em curso com padrão regional sugere oclusão coronariana e exige ativação rápida da rede.",
      "findings": ["Elevação regional de ST.", "Mudanças recíprocas aumentam especificidade.", "Ondas Q e perda de R podem aparecer com evolução."],
      "mimics": ["Repolarização precoce", "Pericardite", "Aneurisma ventricular", "Miocardite", "BRE/ritmo estimulado"],
      "action": ["Ative a via de reperfusão conforme rede e tempo; não aguarde troponina se o diagnóstico de trabalho é STEMI.", "Trate instabilidade e procure complicações precoces."],
      "prevention": ["Prevenção secundária e reabilitação após estabilização.", "Controle de fatores de risco e adesão ao seguimento."],
      "limits": ["O ECG localiza o território elétrico; não define sozinho anatomia, mecanismo ou estratégia definitiva."], "refs": ["acc-acs-2025", "udmi-2018"]
    },
    {
      "id": "iam-posterior", "number": 3, "title": "Infarto posterior", "short": "V1–V3 podem mostrar a imagem em espelho.", "category": "isquemia", "urgency": "emergencia",
      "tags": ["posterior", "V7", "V8", "V9", "ST depressão", "oclusão"], "image": "assets/images/03_infarto_posterior.png", "imageAlt": "Esquema sintético de depressão de ST e onda R alta em V1 a V3 com confirmação posterior em V8.", "imageKind": "sintetico",
      "firstLook": "ST deprimido horizontal em V1–V3 com R relativamente alta.", "leads": "V1–V3 como espelho; registre V7–V9 para olhar a parede posterior.", "measure": "Confirme desvio do ST nas derivações posteriores com calibração padrão e contexto isquêmico.",
      "context": "Pode acompanhar infarto inferior/lateral ou surgir como apresentação posterior isolada.",
      "findings": ["ST↓ máximo em V1–V3.", "R alta e T positiva anteriores podem reforçar o padrão.", "ST↑ em V7–V9 apoia o diagnóstico."],
      "mimics": ["Isquemia subendocárdica", "BRD", "Hipertrofia de VD", "Posição inadequada das precordiais"],
      "action": ["Registre V7–V9 sem atrasar a estratégia de reperfusão.", "Integre com derivações inferiores e direitas quando indicado."],
      "prevention": ["Inclua derivações adicionais no protocolo de dor com suspeita posterior."],
      "limits": ["O padrão anterior é uma pista; ausência de elevação posterior não zera uma suspeita clínica alta."], "refs": ["acc-acs-2025", "udmi-2018"]
    },
    {
      "id": "pericardite-aguda", "number": 4, "title": "Pericardite aguda", "short": "ST difuso e PR alterado não seguem um único território.", "category": "inflamacao", "urgency": "urgente",
      "tags": ["pericardite", "miopericardite", "PR depressão", "ST difuso", "dor pleurítica"], "image": "assets/images/04_pericardite_aguda.png", "imageAlt": "Traçado sintético com elevação difusa de ST e depressão de PR, compatível com padrão de pericardite aguda.", "imageKind": "sintetico",
      "firstLook": "Distribuição do ST e direção do PR.", "leads": "I, II, aVL, aVF e V3–V6; aVR pode mostrar padrão oposto.", "measure": "Não dependa de uma razão isolada; valorize evolução temporal, reciprocidade e clínica.",
      "context": "Dor pleurítica/posicional, atrito, inflamação sistêmica ou pós-infecção/procedimento.",
      "findings": ["Elevação geralmente difusa do ST.", "Depressão de PR fora de aVR.", "Evolução de ST/T pode ocorrer em estágios, mas não é obrigatória."],
      "mimics": ["STEMI", "Repolarização precoce", "Miocardite", "Síndrome de Takotsubo"],
      "action": ["Exclua SCA e causas específicas de alto risco.", "Use ecocardiografia quando houver suspeita de derrame/tamponamento e estratifique miopericardite."],
      "prevention": ["Trate etiologia e acompanhe sinais de recorrência conforme avaliação especializada."],
      "limits": ["ECG normal não exclui pericardite; troponina elevada sugere envolvimento miocárdico, não necessariamente SCA."], "refs": ["esc-myopericarditis-2025", "acc-acs-2025"]
    },
    {
      "id": "hipercalemia", "number": 5, "title": "Hipercalemia", "short": "T pontiaguda pode preceder falha de condução.", "category": "eletrolitos", "urgency": "emergencia",
      "tags": ["potássio", "hipercalemia", "T apiculada", "QRS largo", "IRA", "diálise"], "image": "assets/images/05_hipercalemia.png", "imageAlt": "Traçado sintético com ondas T altas e estreitas, redução da onda P e alargamento de QRS sugestivos de hipercalemia.", "imageKind": "sintetico",
      "firstLook": "T estreita/simétrica, P reduzida, PR e QRS.", "leads": "Avalie globalmente; precordiais ajudam a ver T e progressão do QRS.", "measure": "PR, QRS, frequência e evolução seriada; colha potássio sem esperar que o ECG quantifique gravidade.",
      "context": "Lesão renal, diálise, acidemia, lise celular, suplementos ou medicamentos que elevam K+.",
      "findings": ["T alta e estreita.", "PR prolongado e P achatada/ausente.", "QRS alarga e pode fundir-se à T em toxicidade avançada."],
      "mimics": ["Repolarização precoce", "Ondas T hiperagudas de isquemia", "Artefato", "Bloqueio intraventricular"],
      "action": ["Se grave ou com alterações elétricas, trate como emergência: estabilização de membrana, deslocamento intracelular e remoção de potássio conforme protocolo.", "Monitorize ECG, glicemia e potássio seriados; avalie necessidade de terapia renal substitutiva."],
      "prevention": ["Ajuste medicamentos e ingestão ao risco renal.", "Garanta seguimento laboratorial após alterações de função renal ou terapia."],
      "limits": ["Sensibilidade do ECG é baixa: traçado pouco alterado não exclui hipercalemia ameaçadora."], "refs": ["aha-special-2025", "uk-kidney-hyperk-2023", "ehj-hyperk-2019"]
    },
    {
      "id": "hipocalemia", "number": 6, "title": "Hipocalemia", "short": "T baixa, ST↓ e U: pense também em magnésio.", "category": "eletrolitos", "urgency": "urgente",
      "tags": ["potássio", "hipocalemia", "onda U", "QT", "QU", "diurético"], "image": "assets/images/06_hipocalemia.png", "imageAlt": "Traçado sintético com achatamento da onda T, depressão de ST e ondas U proeminentes sugestivos de hipocalemia.", "imageKind": "sintetico",
      "firstLook": "T achatada, ST↓ e U após a T.", "leads": "DII e V3–V5 costumam facilitar a visualização de T e U.", "measure": "Diferencie QT de QU; dose K+ e Mg2+ e avalie ectopia/arrítmia.",
      "context": "Perdas gastrointestinais/renais, diuréticos, alcalose, insulina, baixa ingestão ou realimentação.",
      "findings": ["T baixa ou invertida.", "ST deprimido.", "Onda U e aparente QT/QU prolongado."],
      "mimics": ["Isquemia", "Bradicardia com U fisiológica", "Hipomagnesemia", "Fármacos pró-QT"],
      "action": ["Reponha potássio conforme gravidade, acesso, função renal e protocolo; corrija magnésio associado.", "Monitorize quando houver alteração importante, sintomas, cardiopatia ou risco arrítmico."],
      "prevention": ["Revise perdas, diuréticos e metas individualizadas.", "Reavalie eletrólitos após reposição e correção da causa."],
      "limits": ["ECG não estima com precisão o valor sérico; alteração pode ser discreta apesar de déficit relevante."], "refs": ["ehj-hypok-2021", "aha-special-2025"]
    },
    {
      "id": "bav-total", "number": 7, "title": "Bloqueio AV total (BAVT)", "short": "Átrios e ventrículos seguem relógios independentes.", "category": "bloqueios", "urgency": "emergencia",
      "tags": ["BAVT", "terceiro grau", "dissociação AV", "escape", "bradicardia"], "image": "assets/images/07_bav_total.png", "imageAlt": "ECG real anonimizado com dissociação atrioventricular e ritmo de escape compatível com bloqueio AV completo.", "imageKind": "real",
      "firstLook": "P e QRS regulares, porém sem relação fixa.", "leads": "DII para marchar P; V1 pode expor atividade atrial; compare todas para escape e QRS.", "measure": "Frequências atrial e ventricular, largura do escape, estabilidade e pausas.",
      "context": "Doença de condução, isquemia, fármacos, distúrbios metabólicos, miocardite ou pós-procedimento.",
      "findings": ["Dissociação AV.", "Frequência atrial maior que ventricular.", "Escape estreito sugere origem mais alta; largo, mais distal — sem transformar isso em regra absoluta."],
      "mimics": ["Dissociação isorrítmica", "BAV 2:1/alto grau", "Extrassístoles bloqueadas", "Artefato"],
      "action": ["Avalie perfusão imediatamente e trate bradicardia instável pelo algoritmo atual.", "Prepare estimulação e avaliação especializada; corrija causas reversíveis sem atrasar suporte."],
      "prevention": ["Revise fármacos e distúrbios reversíveis.", "Siga pacientes com doença de condução conforme risco."],
      "limits": ["A frequência isolada não define tolerância; o paciente e o local do bloqueio mudam o risco."], "refs": ["acc-brady-2018", "aha-als-2025"]
    },
    {
      "id": "hipotermia-osborn", "number": 8, "title": "Hipotermia e onda J de Osborn", "short": "Bradicardia e condução lenta acompanham o resfriamento.", "category": "sistemicos", "urgency": "emergencia",
      "tags": ["hipotermia", "Osborn", "onda J", "bradicardia", "temperatura"], "image": "assets/images/08_hipotermia_osborn.png", "imageAlt": "Traçado sintético com bradicardia e entalhe no ponto J, a onda de Osborn associada à hipotermia.", "imageKind": "sintetico",
      "firstLook": "Frequência, J, PR, QRS, QT e artefato por tremor.", "leads": "Onda J pode aparecer em inferiores e precordiais laterais; avalie o traçado inteiro.", "measure": "Temperatura central e intervalos seriados; não use a amplitude da onda J como termômetro.",
      "context": "Exposição, imersão, intoxicação, endocrinopatia, trauma ou falha de termorregulação.",
      "findings": ["Bradicardia.", "Onda J/Osborn.", "Prolongamento de condução e arritmias com maior gravidade."],
      "mimics": ["Repolarização precoce", "Brugada", "Isquemia", "Hipercalcemia", "Artefato de tremor"],
      "action": ["Manuseie com cuidado, meça temperatura central e reaqueça conforme gravidade e recursos.", "Em parada, siga o algoritmo específico de hipotermia e considere centro com suporte extracorpóreo quando indicado."],
      "prevention": ["Proteção térmica em exposição, trauma e procedimentos prolongados.", "Identifique intoxicações e causas endócrinas associadas."],
      "limits": ["Onda de Osborn não é específica e pode faltar mesmo em hipotermia importante."], "refs": ["aha-special-2025"]
    },
    {
      "id": "torsades", "number": 9, "title": "Torsades de pointes", "short": "TV polimórfica sobre QT prolongado.", "category": "taquiarritmias", "urgency": "emergencia",
      "tags": ["torsades", "TV polimórfica", "QT longo", "magnésio", "choque"], "image": "assets/images/09_torsades_de_pointes.png", "imageAlt": "Traçado sintético de taquicardia ventricular polimórfica com oscilação da amplitude em torno da linha de base.", "imageKind": "sintetico",
      "firstLook": "TV polimórfica e QT longo antes/depois do episódio.", "leads": "Ritmo contínuo para o evento; ECG de 12 derivações para QT, causas e fenótipo após estabilização.", "measure": "QTc manual, pausa/gatilho e eletrólitos; diferencie TV polimórfica com QT normal.",
      "context": "Fármacos pró-QT, bradicardia, hipocalemia, hipomagnesemia, hipocalcemia ou síndrome congênita.",
      "findings": ["Eixo e amplitude dos QRS parecem girar.", "Início frequentemente pausa-dependente.", "QT prolongado sustenta a designação torsades."],
      "mimics": ["TV polimórfica isquêmica com QT normal", "FV", "Artefato de movimento"],
      "action": ["Sem pulso ou instável: choque imediato conforme suporte avançado.", "Corrija eletrólitos, interrompa agentes causais e use magnésio conforme algoritmo; considere aumento de frequência em recorrência pausa-dependente com equipe especializada."],
      "prevention": ["Revise combinações pró-QT, função renal/hepática e eletrólitos.", "Use monitorização quando o risco farmacológico/metabólico é alto."],
      "limits": ["Magnésio não é tratamento rotineiro de toda TV polimórfica com QT normal."], "refs": ["aha-als-2025", "esc-va-2022"]
    },
    {
      "id": "sobrecarga-vd-tep", "number": 10, "title": "Sobrecarga de VD e TEP", "short": "ECG estima repercussão direita; não fecha TEP.", "category": "sobrecarga", "urgency": "urgente",
      "tags": ["TEP", "VD", "S1Q3T3", "BRD", "strain", "embolia pulmonar"], "image": "assets/images/10_sobrecarga_vd_tep.png", "imageAlt": "ECG real anonimizado com sinais de sobrecarga ventricular direita e bloqueio de ramo direito, um padrão possível mas não diagnóstico de TEP.", "imageKind": "real",
      "firstLook": "Taquicardia, BRD, eixo e T negativas direitas.", "leads": "I e III para S1Q3T3; V1–V4 para strain de VD; aVR e inferiores como apoio.", "measure": "Frequência, eixo, QRS e extensão das alterações de repolarização.",
      "context": "Dispneia/hipoxemia, síncope, choque e risco tromboembólico; também ocorre em hipertensão pulmonar crônica.",
      "findings": ["Taquicardia sinusal é comum, mas inespecífica.", "BRD e padrão de strain de VD podem indicar maior repercussão.", "S1Q3T3 tem sensibilidade limitada."],
      "mimics": ["DPOC/hipertensão pulmonar", "BRD crônico", "Isquemia", "Displasia/cardiopatia de VD"],
      "action": ["Use probabilidade clínica e via diagnóstica apropriada; em instabilidade, priorize confirmação rápida de choque obstrutivo e reperfusão conforme protocolo.", "Avalie VD, biomarcadores e imagem de acordo com risco."],
      "prevention": ["Profilaxia de TEV quando indicada e manejo de fatores de risco."],
      "limits": ["ECG não exclui nem confirma TEP; serve para diferencial, repercussão e prognóstico."], "refs": ["esc-pe-2019"]
    },
    {
      "id": "bav-primeiro-grau", "number": 11, "title": "BAV de primeiro grau", "short": "PR prolongado, mas toda P conduz.", "category": "bloqueios", "urgency": "contexto",
      "tags": ["BAV", "primeiro grau", "PR longo", "condução AV"], "image": "assets/images/11_bav_primeiro_grau.png", "imageAlt": "Traçado sintético em DII, V1 e V5 com intervalo PR constante e prolongado.", "imageKind": "sintetico",
      "firstLook": "Uma P para cada QRS e PR fixo.", "leads": "DII costuma definir o início da P; V1 ajuda em ondas P discretas.", "measure": "PR em batimentos representativos; PR muito longo pode causar sintomas por dessincronia.",
      "context": "Vagotonia, fármacos, isquemia inferior, inflamação ou doença de condução.",
      "findings": ["PR acima do limite adulto.", "Condução 1:1.", "O local do atraso não é definido só pelo ECG de superfície."],
      "mimics": ["Onda P escondida na T", "Ritmo juncional com P retrógrada", "Marcapasso atrial"],
      "action": ["Procure sintomas e causa; em geral, não há tratamento do intervalo isolado.", "Reavalie se houver QRS largo, progressão ou cardiopatia."],
      "prevention": ["Revise fármacos que deprimem condução e acompanhe evolução quando indicado."],
      "limits": ["O rótulo 'primeiro grau' descreve atraso, não um QRS bloqueado."], "refs": ["acc-brady-2018"]
    },
    {
      "id": "bav-mobitz-i", "number": 12, "title": "BAV de 2º grau Mobitz I", "short": "PR cresce até uma P não conduzir.", "category": "bloqueios", "urgency": "contexto",
      "tags": ["Wenckebach", "Mobitz I", "segundo grau", "PR progressivo"], "image": "assets/images/12_bav_mobitz_i.png", "imageAlt": "Traçado sintético com prolongamento progressivo do PR seguido por onda P bloqueada, padrão de Wenckebach.", "imageKind": "sintetico",
      "firstLook": "QRS agrupados e pausa com P não conduzida.", "leads": "DII e V1 para marchar ondas P e PR.", "measure": "PR de cada batimento conduzido e relação atrioventricular ao longo de uma tira longa.",
      "context": "Frequentemente nodal, vagal ou medicamentoso; pode ocorrer em isquemia inferior.",
      "findings": ["PR alonga progressivamente.", "Onda P não conduz.", "Após a pausa, o PR reinicia mais curto."],
      "mimics": ["Extrassístole atrial bloqueada", "Mobitz II", "Flutter com condução variável", "Artefato"],
      "action": ["Avalie perfusão, sintomas e reversíveis.", "Se houver bradicardia instável, trate pelo algoritmo e escale monitorização."],
      "prevention": ["Revise fármacos e causas metabólicas; documente padrão e sintomas."],
      "limits": ["QRS estreito favorece localização nodal, mas não é garantia absoluta de baixo risco."], "refs": ["acc-brady-2018", "aha-als-2025"]
    },
    {
      "id": "bav-mobitz-ii", "number": 13, "title": "BAV de 2º grau Mobitz II", "short": "PR fixo e súbita P não conduzida.", "category": "bloqueios", "urgency": "emergencia",
      "tags": ["Mobitz II", "alto grau", "infranodal", "His-Purkinje"], "image": "assets/images/13_bav_mobitz_ii.png", "imageAlt": "Traçado sintético com intervalos PR fixos e ondas P subitamente não conduzidas, compatível com Mobitz II.", "imageKind": "sintetico",
      "firstLook": "P pontual sem QRS, sem Wenckebach anterior.", "leads": "Tira longa em DII/V1; todas as derivações para largura do QRS.", "measure": "PR dos conduzidos, relação AV, QRS e pausas.",
      "context": "Doença infranodal, isquemia anterior, pós-procedimento ou doença degenerativa.",
      "findings": ["PR constante.", "Falha súbita de condução.", "QRS pode ser largo e o bloqueio pode progredir."],
      "mimics": ["Extrassístole atrial bloqueada", "BAV 2:1", "Wenckebach atípico", "Bloqueio de alto grau"],
      "action": ["Monitorize e prepare estimulação/avaliação especializada mesmo se momentaneamente estável.", "Trate deterioração hemodinâmica pelo algoritmo de bradicardia."],
      "prevention": ["Evite fármacos agravantes quando apropriado e trate causas reversíveis."],
      "limits": ["BAV 2:1 não pode ser classificado com segurança como Mobitz I ou II por uma única relação."], "refs": ["acc-brady-2018", "aha-als-2025"]
    },
    {
      "id": "brd", "number": 14, "title": "Bloqueio de ramo direito", "short": "Atraso terminal em V1 e laterais.", "category": "bloqueios", "urgency": "contexto",
      "tags": ["BRD", "RBBB", "rSR", "V1", "S larga"], "image": "assets/images/14_bloqueio_ramo_direito.png", "imageAlt": "Traçado sintético destacando padrão rSR linha em V1 e onda S terminal alargada em I e V6.", "imageKind": "sintetico",
      "firstLook": "QRS largo, R′ em V1–V2 e S terminal em I/V6.", "leads": "V1–V2 e I/V6.", "measure": "Duração do QRS e eixo; compare se é novo.",
      "context": "Pode ser variante/crônico ou aparecer em TEP, isquemia, miocardite e cardiopatia estrutural.",
      "findings": ["rSR′/R′ anterior direito.", "S terminal larga lateral.", "ST–T secundariamente discordante em V1–V3."],
      "mimics": ["V1–V2 altos", "Síndrome de Brugada", "Hipertrofia de VD", "Bloqueio intraventricular inespecífico"],
      "action": ["Integre sintomas e ECG prévio; novo BRD com isquemia ou instabilidade exige avaliação urgente da causa."],
      "prevention": ["Corrija posicionamento das precordiais e acompanhe cardiopatia subjacente."],
      "limits": ["BRD novo não diagnostica isoladamente IAM ou TEP."], "refs": ["acc-brady-2018", "acc-acs-2025"]
    },
    {
      "id": "bre", "number": 15, "title": "Bloqueio de ramo esquerdo", "short": "QRS amplo com repolarização secundária.", "category": "bloqueios", "urgency": "contexto",
      "tags": ["BRE", "LBBB", "QRS largo", "Sgarbossa"], "image": "assets/images/15_bloqueio_ramo_esquerdo.png", "imageAlt": "Traçado sintético com QS em V1 e ondas R amplas nas derivações laterais, padrão de bloqueio de ramo esquerdo.", "imageKind": "sintetico",
      "firstLook": "QS/rS em V1 e R larga em I, aVL, V5–V6.", "leads": "V1, I, aVL, V5 e V6.", "measure": "QRS, eixo e concordância ST–T; compare com prévio.",
      "context": "Doença estrutural, hipertensão, cardiomiopatia, isquemia ou degeneração da condução.",
      "findings": ["QRS alargado.", "R ampla/entalhada lateral.", "ST–T geralmente discordante ao QRS dominante."],
      "mimics": ["Ritmo estimulado", "Hipercalemia", "Bloqueio intraventricular inespecífico", "Pré-excitação"],
      "action": ["Se houver suspeita isquêmica, use clínica, ECG prévio e critérios de oclusão; não descarte SCA pelo QRS largo.", "Avalie cardiopatia estrutural quando novo ou não explicado."],
      "prevention": ["Controle doença estrutural e fatores cardiovasculares; mantenha ECG de referência acessível."],
      "limits": ["BRE novo isolado não é critério suficiente de STEMI."], "refs": ["acc-brady-2018", "acc-acs-2025"]
    },
    {
      "id": "sgarbossa", "number": 16, "title": "Sgarbossa no BRE/ritmo estimulado", "short": "Concordância e desproporção expõem oclusão.", "category": "isquemia", "urgency": "emergencia",
      "tags": ["Sgarbossa", "BRE", "marcapasso", "oclusão", "ST concordante"], "image": "assets/images/16_sgarbossa_modificado.png", "imageAlt": "Esquema sintético com exemplos de alterações concordantes e elevação discordante desproporcional do ST em QRS largo.", "imageKind": "sintetico",
      "firstLook": "ST concordante ou discordância exagerada.", "leads": "Todas; depressão concordante em V1–V3 e elevação concordante em qualquer derivação merecem atenção.", "measure": "A modificação de Smith usa a razão ST/S para discordância proporcional; confirme método e ponto de medida.",
      "context": "Sintomas isquêmicos com BRE ou ritmo ventricular estimulado.",
      "findings": ["ST↑ concordante com QRS positivo.", "ST↓ concordante em V1–V3.", "ST↑ discordante desproporcional ao S precedente."],
      "mimics": ["Repolarização secundária esperada", "Cardiomiopatia", "Hipercalemia", "Erro de medida"],
      "action": ["Achado positivo no contexto apropriado deve acelerar avaliação de oclusão e reperfusão.", "Não use critério negativo isolado para excluir oclusão se a suspeita permanece alta."],
      "prevention": ["Mantenha ECG basal e padronize leitura de QRS largo na emergência."],
      "limits": ["Critérios aumentam especificidade, mas sensibilidade é incompleta e a clínica continua central."], "refs": ["acc-acs-2025", "sgarbossa-smith-2012"]
    },
    {
      "id": "wellens", "number": 17, "title": "Padrão de Wellens", "short": "T anterior típica entre episódios de dor.", "category": "isquemia", "urgency": "urgente",
      "tags": ["Wellens", "DA proximal", "T bifásica", "V2", "V4"], "image": "assets/images/17_padrao_wellens.png", "imageAlt": "Traçado sintético com onda T bifásica em V2 e profundamente negativa e simétrica em V3 e V4.", "imageKind": "sintetico",
      "firstLook": "T bifásica ou simétrica profunda em V2–V4.", "leads": "V2–V4, podendo estender-se de V1 a V6.", "measure": "Ponto J pouco deslocado, ondas Q ausentes e progressão de R preservada reforçam o padrão clássico.",
      "context": "Dor anginosa recente já resolvida, ECG registrado sem dor e biomarcador normal/discretamente alterado.",
      "findings": ["Tipo A: T bifásica.", "Tipo B: T profundamente negativa e simétrica.", "Pode pseudonormalizar durante dor/oclusão."],
      "mimics": ["TEP/strain de VD", "Cardiomiopatia apical", "Hipertrofia", "Reperfusão pós-isquêmica", "Causas neurológicas"],
      "action": ["Trate como SCA de alto risco e discuta avaliação coronária precoce.", "Evite teste de estresse quando o padrão e a história forem convincentes."],
      "prevention": ["Reconheça o período sem dor como janela diagnóstica, não como sinal de segurança."],
      "limits": ["Morfologia semelhante sem síndrome clínica não equivale automaticamente a Wellens."], "refs": ["acc-acs-2025"]
    },
    {
      "id": "de-winter", "number": 18, "title": "Padrão de de Winter", "short": "ST↓ ascendente e T altas anteriores: pense oclusão.", "category": "isquemia", "urgency": "emergencia",
      "tags": ["de Winter", "oclusão", "DA", "T hiperaguda", "ST depressão"], "image": "assets/images/18_padrao_de_winter.png", "imageAlt": "Traçado sintético com depressão ascendente do ST e ondas T altas simétricas em V2 a V4, além de discreta elevação em aVR.", "imageKind": "sintetico",
      "firstLook": "ST↓ ascendente no J com T alta/simétrica nas precordiais.", "leads": "V2–V6 e aVR.", "measure": "Distribuição regional e relação com sintomas; compare com K+ e ECG prévio.",
      "context": "Síndrome isquêmica aguda, frequentemente associada a oclusão proximal da descendente anterior.",
      "findings": ["Depressão ascendente do ST.", "T altas, simétricas e proeminentes.", "Pode haver discreta elevação em aVR."],
      "mimics": ["Hipercalemia", "Repolarização precoce", "Taquicardia", "Hipertrofia"],
      "action": ["Reconheça como padrão de alto risco de oclusão e acione avaliação/reperfusão conforme rede.", "Não aguarde a evolução para elevação clássica do ST se o contexto é convincente."],
      "prevention": ["Treine reconhecimento de equivalentes de oclusão em protocolos de dor torácica."],
      "limits": ["Nem toda T alta é de Winter; territorialidade, ponto J e contexto são essenciais."], "refs": ["acc-acs-2025"]
    },
    {
      "id": "repolarizacao-precoce", "number": 19, "title": "Repolarização precoce", "short": "J elevado pode ser variante; contexto decide.", "category": "repolarizacao", "urgency": "contexto",
      "tags": ["repolarização precoce", "ponto J", "ST côncavo", "variante"], "image": "assets/images/19_repolarizacao_precoce.png", "imageAlt": "Traçado sintético com entalhe no ponto J e elevação côncava e estável do ST em precordiais.", "imageKind": "sintetico",
      "firstLook": "Entalhe/empastamento do J e estabilidade.", "leads": "Precordiais médias/laterais e inferiores conforme fenótipo.", "measure": "Amplitude do J, inclinação do ST e comparação temporal; não use apenas formato côncavo.",
      "context": "Comum em jovens/atletas, mas pode coexistir com doença aguda.",
      "findings": ["J elevado com entalhe ou empastamento.", "ST frequentemente ascendente/côncavo.", "Ausência de reciprocidade territorial típica."],
      "mimics": ["STEMI", "Pericardite", "Brugada", "Hipotermia"],
      "action": ["Em sintomas de alto risco, conduza investigação de SCA apesar de um rótulo prévio de variante.", "Use ECG seriado e comparação com basal."],
      "prevention": ["Documente traçado basal e evite rotular sem correlação clínica."],
      "limits": ["Morfologia isolada não torna o paciente de baixo risco."], "refs": ["aha-ecg", "acc-acs-2025", "esc-va-2022"]
    },
    {
      "id": "hipercalcemia", "number": 20, "title": "Hipercalcemia", "short": "QT curto, sobretudo por ST curto.", "category": "eletrolitos", "urgency": "urgente",
      "tags": ["cálcio", "hipercalcemia", "QT curto", "ST curto"], "image": "assets/images/20_hipercalcemia.png", "imageAlt": "Traçado sintético com encurtamento do segmento ST e do intervalo QT associado à hipercalcemia.", "imageKind": "sintetico",
      "firstLook": "ST encurtado e T mais próxima do QRS.", "leads": "DII e precordiais com final da T nítido.", "measure": "QT/QTc manual e cálcio ionizado; interprete a correção pela frequência com cautela.",
      "context": "Hiperparatireoidismo, neoplasia, medicamentos, imobilização ou doença granulomatosa.",
      "findings": ["QT encurtado por ST curto.", "Em níveis extremos podem surgir bradicardia e distúrbios de condução.", "O ECG pode ser pouco expressivo."],
      "mimics": ["Síndrome de QT curto", "Digoxina", "Erro de medida da T", "Taquicardia"],
      "action": ["Confirme cálcio ionizado e trate gravidade, volume e causa conforme protocolo.", "Monitorize quando houver sintomas, alteração elétrica ou hipercalcemia importante."],
      "prevention": ["Reveja suplementos/medicamentos e acompanhe etiologia tratável."],
      "limits": ["QT curto não quantifica cálcio e pode ter outras causas."], "refs": ["aha-special-2025"]
    },
    {
      "id": "hipocalcemia", "number": 21, "title": "Hipocalcemia", "short": "QT longo principalmente por ST prolongado.", "category": "eletrolitos", "urgency": "urgente",
      "tags": ["cálcio", "hipocalcemia", "QT longo", "ST longo"], "image": "assets/images/21_hipocalcemia.png", "imageAlt": "Traçado sintético com prolongamento do segmento ST e do QT associado à hipocalcemia.", "imageKind": "sintetico",
      "firstLook": "Longo intervalo entre o fim do QRS e o início da T.", "leads": "DII, V5 ou V6 com final da T definido.", "measure": "QT/QTc, cálcio ionizado, magnésio e potássio.",
      "context": "Pós-tireoidectomia, pancreatite, sepse, doença renal, deficiência de vitamina D ou transfusão maciça.",
      "findings": ["ST prolongado.", "QT/QTc prolongado.", "Risco arrítmico aumenta com outros fatores pró-QT."],
      "mimics": ["QT longo congênito/adquirido", "Hipomagnesemia", "Hipocalemia", "Fármaco pró-QT"],
      "action": ["Hipocalcemia sintomática, tetania, crise ou alteração cardíaca relevante exige reposição monitorizada conforme protocolo.", "Corrija magnésio e a causa subjacente."],
      "prevention": ["Antecipe queda de cálcio em contextos de risco e monitore ionizado quando apropriado."],
      "limits": ["Albumina altera cálcio total; o ECG não substitui cálcio ionizado."], "refs": ["aha-special-2025", "esc-va-2022"]
    },
    {
      "id": "hipomagnesemia", "number": 22, "title": "Hipomagnesemia", "short": "Repolarização vulnerável e achados pouco específicos.", "category": "eletrolitos", "urgency": "urgente",
      "tags": ["magnésio", "hipomagnesemia", "QT longo", "torsades", "onda U"], "image": "assets/images/22_hipomagnesemia.png", "imageAlt": "Traçado sintético com prolongamento de QT, onda T baixa e onda U em contexto de hipomagnesemia.", "imageKind": "sintetico",
      "firstLook": "QT/QU, T/U e ectopia.", "leads": "DII e V3–V5 para repolarização; tira longa para ectopia.", "measure": "Mg2+, K+, Ca2+ e QTc; procure combinação de gatilhos.",
      "context": "Perdas GI/renais, diuréticos, álcool, inibidores de bomba, realimentação ou drogas nefrotóxicas.",
      "findings": ["QT prolongado ou alteração inespecífica de ST–T.", "Ondas U e ectopia podem ocorrer.", "Frequentemente acompanha hipocalemia/hipocalcemia."],
      "mimics": ["Hipocalemia", "Hipocalcemia", "QT longo farmacológico/congênito"],
      "action": ["Reponha magnésio e corrija eletrólitos associados conforme gravidade e função renal.", "Em torsades recorrente com QT longo, magnésio integra o algoritmo atual."],
      "prevention": ["Revise perdas e fármacos; monitore em pacientes de alto risco."],
      "limits": ["ECG é inespecífico e magnésio sérico pode não refletir o estoque corporal total."], "refs": ["aha-als-2025", "esc-va-2022"]
    },
    {
      "id": "hipermagnesemia", "number": 23, "title": "Hipermagnesemia", "short": "Bradicardia e condução lenta são pistas tardias.", "category": "eletrolitos", "urgency": "emergencia",
      "tags": ["magnésio", "hipermagnesemia", "bradicardia", "PR longo", "QRS largo"], "image": "assets/images/23_hipermagnesemia.png", "imageAlt": "Traçado sintético com bradicardia, prolongamento de PR e alargamento de QRS em hipermagnesemia avançada.", "imageKind": "sintetico",
      "firstLook": "Frequência, PR, QRS e bloqueio AV.", "leads": "DII para PR/ritmo e precordiais para QRS.", "measure": "Magnésio, função renal, pressão, reflexos e ventilação; não espere alteração elétrica para confirmar exposição.",
      "context": "Administração de magnésio, antiácidos/laxantes e insuficiência renal.",
      "findings": ["Bradicardia.", "PR e QRS prolongados.", "BAV, hipotensão e depressão neuromuscular em toxicidade grave."],
      "mimics": ["Hipercalemia", "Bloqueadores nodais", "Hipotermia", "Doença de condução"],
      "action": ["Interrompa a fonte; em toxicidade grave, antagonize efeitos e aumente eliminação conforme protocolo e função renal.", "Ofereça suporte hemodinâmico/ventilatório e discuta diálise quando indicada."],
      "prevention": ["Ajuste exposição à função renal e monitore quando houver infusão ou uso repetido."],
      "limits": ["Alterações no ECG são inespecíficas e podem surgir tardiamente."], "refs": ["aha-special-2025"]
    },
    {
      "id": "fibrilacao-atrial", "number": 24, "title": "Fibrilação atrial", "short": "RR irregular sem P organizada.", "category": "taquiarritmias", "urgency": "urgente",
      "tags": ["FA", "fibrilação atrial", "irregular", "cardioversão", "anticoagulação"], "image": "assets/images/24_fibrilacao_atrial.png", "imageAlt": "Traçado sintético com irregularidade absoluta dos intervalos RR e ausência de ondas P organizadas.", "imageKind": "sintetico",
      "firstLook": "Regularidade, P, largura do QRS e estabilidade.", "leads": "Tira em DII para RR; V1 para atividade atrial.", "measure": "Frequência ventricular, QRS, QT e duração provável do episódio.",
      "context": "FA primária ou secundária a infecção, isquemia, tireoide, álcool, pós-operatório e distúrbio eletrolítico.",
      "findings": ["RR irregularmente irregular.", "Ausência de P consistente.", "Linha de base fibrilatória variável."],
      "mimics": ["Extrassístoles frequentes", "MAT", "Flutter com condução variável", "Artefato"],
      "action": ["Instabilidade atribuível à FA exige cardioversão sincronizada.", "Se estável, individualize controle de frequência/ritmo, causa e prevenção tromboembólica."],
      "prevention": ["Controle fatores de risco e reavalie anticoagulação com ferramenta validada e risco de sangramento."],
      "limits": ["O ECG confirma o ritmo, mas não define sozinho duração, causa ou estratégia de anticoagulação."], "refs": ["acc-af-2023", "aha-als-2025"]
    },
    {
      "id": "flutter-atrial", "number": 25, "title": "Flutter atrial", "short": "Ondas F podem esconder-se na condução 2:1.", "category": "taquiarritmias", "urgency": "urgente",
      "tags": ["flutter", "ondas F", "2:1", "150 bpm", "macroreentrada"], "image": "assets/images/25_flutter_atrial.png", "imageAlt": "Traçado sintético com ondas F serrilhadas inferiores e condução atrioventricular dois para um.", "imageKind": "sintetico",
      "firstLook": "Taquicardia regular próxima de 150/min e atividade atrial serrilhada.", "leads": "II, III, aVF e V1.", "measure": "Frequências atrial/ventricular e relação de condução.",
      "context": "Cardiopatia, pós-operatório, doença pulmonar ou recorrência após ablação/FA.",
      "findings": ["Ondas F sem linha isoelétrica clara.", "Condução 2:1, 3:1, 4:1 ou variável.", "Resposta ventricular pode mascarar a frequência atrial."],
      "mimics": ["TSV", "Taquicardia atrial", "Artefato", "FA organizada"],
      "action": ["Instabilidade exige cardioversão sincronizada.", "Se estável, trate resposta ventricular/ritmo e tromboembolismo conforme contexto."],
      "prevention": ["Trate gatilhos e discuta ablação em recorrência típica apropriada."],
      "limits": ["Ondas F podem ficar ocultas no QRS/T; adenosina/manobra pode revelar o ritmo, não deve ser tratada como cardioversão do flutter."], "refs": ["acc-af-2023", "aha-als-2025"]
    },
    {
      "id": "tsv-regular", "number": 26, "title": "Taquicardia supraventricular regular", "short": "QRS estreito e regular: estabilidade primeiro.", "category": "taquiarritmias", "urgency": "urgente",
      "tags": ["TSV", "AVNRT", "AVRT", "taquicardia regular", "QRS estreito"], "image": "assets/images/26_tsv_regular.png", "imageAlt": "Traçado sintético de taquicardia regular de QRS estreito sem ondas P claramente visíveis.", "imageKind": "sintetico",
      "firstLook": "Regularidade, QRS e P oculta/retrógrada.", "leads": "DII e V1; ECG de 12 derivações antes/depois se isso não atrasar terapia.", "measure": "Frequência, QRS, RP/PR e início/término.",
      "context": "AVNRT, AVRT, taquicardia atrial ou flutter 2:1.",
      "findings": ["Ritmo regular.", "QRS geralmente estreito.", "P pode estar oculta, logo após QRS ou antes do QRS."],
      "mimics": ["Flutter 2:1", "Taquicardia sinusal", "TV com QRS relativamente estreito", "Taquicardia juncional"],
      "action": ["Instabilidade exige cardioversão sincronizada.", "Se estável e regular/estreita, manobras vagais e terapia protocolar podem ser diagnósticas e terapêuticas."],
      "prevention": ["Documente o ECG e discuta estratégia definitiva quando recorrente/sintomática."],
      "limits": ["Não rotule toda taquicardia regular como AVNRT sem analisar P, contexto e resposta."], "refs": ["aha-als-2025"]
    },
    {
      "id": "wpw-preexcitacao", "number": 27, "title": "Pré-excitação / WPW", "short": "PR curto, delta e QRS amplo.", "category": "taquiarritmias", "urgency": "urgente",
      "tags": ["WPW", "pré-excitação", "onda delta", "FA pré-excitada", "via acessória"], "image": "assets/images/27_pre_excitacao_wpw.png", "imageAlt": "Traçado sintético com intervalo PR curto, onda delta e alargamento inicial do QRS por pré-excitação.", "imageKind": "sintetico",
      "firstLook": "PR, início do QRS e taquiarritmia associada.", "leads": "Todas para reconhecer delta; V1 pode ajudar no padrão, não substitui estudo especializado.", "measure": "PR curto, QRS alargado e RR mínimo durante FA quando aplicável.",
      "context": "Pré-excitação pode ser intermitente; risco maior quando há síncope ou FA rápida.",
      "findings": ["PR curto.", "Onda delta.", "Alterações secundárias de ST–T."],
      "mimics": ["BRE/BRD", "Infarto antigo falso-positivo", "Fusão por marcapasso", "Hipertrofia"],
      "action": ["FA pré-excitada irregular e rápida é emergência; evite bloqueio isolado do nó AV e siga protocolo especializado.", "Discuta avaliação eletrofisiológica/ablação conforme sintomas e risco."],
      "prevention": ["Eduque sobre fármacos contraindicados no cenário de FA pré-excitada e registre o traçado basal."],
      "limits": ["Ausência de delta em um ECG não exclui via acessória oculta/intermitente."], "refs": ["acc-af-2023", "aha-als-2025"]
    },
    {
      "id": "tv-monomorfica", "number": 28, "title": "Taquicardia ventricular monomórfica", "short": "QRS largo regular: trate como TV até prova em contrário.", "category": "taquiarritmias", "urgency": "emergencia",
      "tags": ["TV", "taquicardia ventricular", "QRS largo", "cardioversão", "dissociação AV"], "image": "assets/images/28_taquicardia_ventricular.png", "imageAlt": "Traçado sintético de taquicardia ventricular monomórfica regular com complexos QRS largos.", "imageKind": "sintetico",
      "firstLook": "Pulso/perfusão, largura e regularidade.", "leads": "Tira de ritmo para estabilidade; 12 derivações se possível sem atrasar terapia.", "measure": "Frequência, QRS, eixo/concordância e QT após reversão.",
      "context": "Cicatriz de IAM/cardiomiopatia, isquemia, eletrólitos, fármacos ou canalopatia.",
      "findings": ["QRS largo e morfologia estável.", "Dissociação AV, captura e fusão são altamente sugestivas.", "Concordância precordial e eixo extremo reforçam TV."],
      "mimics": ["TSV com aberrância", "FA pré-excitada", "Ritmo estimulado", "Artefato"],
      "action": ["Instabilidade com pulso exige cardioversão sincronizada; sem pulso, desfibrilação e RCP.", "Se estável, use algoritmo de taquicardia de QRS largo e consulta especializada; evite atrasos diagnósticos perigosos."],
      "prevention": ["Trate cardiopatia/isquemia e fatores reversíveis; estratifique prevenção de morte súbita."],
      "limits": ["Ausência de um critério clássico não transforma automaticamente o ritmo em TSV."], "refs": ["aha-als-2025", "esc-va-2022"]
    },
    {
      "id": "brugada-tipo-1", "number": 29, "title": "Padrão de Brugada tipo 1", "short": "ST coved em V1–V2 e T negativa.", "category": "canalopatias", "urgency": "urgente",
      "tags": ["Brugada", "tipo 1", "morte súbita", "febre", "V1", "V2"], "image": "assets/images/29_brugada_tipo_1.png", "imageAlt": "Traçado sintético com elevação coved do ST e onda T negativa em V1 e V2, padrão tipo 1 de Brugada.", "imageKind": "sintetico",
      "firstLook": "Morfologia coved nas precordiais direitas.", "leads": "V1–V2 no espaço padrão e, por equipe treinada, em posições intercostais mais altas.", "measure": "Elevação do ponto J/ST e morfologia; o diagnóstico clínico vai além da aparência isolada.",
      "context": "Síncope, respiração agônica noturna, história familiar, arritmia ventricular; febre/fármacos podem desmascarar.",
      "findings": ["ST coved descendente.", "T negativa em V1–V2.", "Padrões tipo 2/3 não equivalem ao tipo 1 diagnóstico."],
      "mimics": ["BRD", "V1–V2 altos", "Hipercalemia", "Isquemia de VD", "Hipotermia", "Toxicidade por bloqueador de sódio"],
      "action": ["Trate febre e arritmia, retire gatilhos relevantes e obtenha avaliação especializada.", "Em parada/TV-FV, siga suporte avançado e estratifique prevenção secundária."],
      "prevention": ["Evite fármacos associados e oriente manejo precoce de febre conforme plano especializado."],
      "limits": ["Padrão ECG, fenocópia e síndrome clínica não são sinônimos."], "refs": ["esc-va-2022"]
    },
    {
      "id": "tamponamento", "number": 30, "title": "Tamponamento e alternância elétrica", "short": "O ECG sugere derrame; tamponamento é hemodinâmico.", "category": "sistemicos", "urgency": "emergencia",
      "tags": ["tamponamento", "derrame pericárdico", "baixa voltagem", "alternância elétrica", "choque obstrutivo"], "image": "assets/images/30_tamponamento_alternancia.png", "imageAlt": "Traçado sintético com baixa voltagem e alternância da amplitude do QRS, pistas de grande derrame pericárdico.", "imageKind": "sintetico",
      "firstLook": "Baixa voltagem, taquicardia e alternância elétrica.", "leads": "Derivações de membros para voltagem; tira longa e precordiais para alternância.", "measure": "Voltagem, variação batimento a batimento e frequência; correlacione com pulso paradoxal e imagem.",
      "context": "Neoplasia, pericardite, trauma/procedimento, anticoagulação, uremia ou dissecção.",
      "findings": ["Baixa voltagem.", "Alternância do eixo/amplitude.", "Taquicardia sinusal é comum, mas não obrigatória."],
      "mimics": ["DPOC/obesidade", "Hipotireoidismo", "Artefato", "Extrassístoles/bigeminismo"],
      "action": ["Choque obstrutivo com tamponamento exige drenagem urgente por equipe experiente e tratamento da causa.", "Use ecocardiografia/POCUS e hemodinâmica sem atrasar suporte."],
      "prevention": ["Monitorize derrames de risco e sinais de progressão conforme etiologia."],
      "limits": ["Ausência de baixa voltagem ou alternância não exclui tamponamento; ecocardiografia sem repercussão também não substitui avaliação clínica."], "refs": ["esc-myopericarditis-2025", "aha-special-2025"]
    }
  ],
  "fieldGuides": [
    {
      "id": "isquemia-cascade", "title": "Cascata da isquemia no ECG", "category": "Isquemia",
      "items": ["T hiperaguda regional pode preceder ST↑.", "Lesão transmural produz desvio do ST; isquemia/reperfusão altera T.", "Necrose elétrica pode gerar Q patológica e perda de R, mas não em todos.", "ECG seriado e sintomas dão a dimensão temporal; um traçado único é uma fotografia."]
    },
    {
      "id": "secondary-repolarization", "title": "Repolarização secundária", "category": "ST–T",
      "items": ["BRE, BRD, hipertrofia e ritmo estimulado podem alterar ST–T como consequência do QRS.", "Discordância esperada não exclui isquemia; procure concordância, desproporção e mudança nova.", "Digoxina pode produzir ST em colher e QT curto; isso não prova toxicidade.", "Toxicidade por bloqueio de canal de sódio pode alargar QRS e gerar R terminal em aVR: trate como emergência toxicológica pelo contexto."]
    },
    {
      "id": "toxins-drugs", "title": "Fármacos e tóxicos: busca rápida", "category": "Toxicologia",
      "items": ["QT longo: revise antiarrítmicos, antimicrobianos, antipsicóticos, antieméticos e interações; use uma base institucional atualizada.", "QRS largo + aVR terminal: suspeite bloqueio de canal de sódio, inclusive antidepressivo tricíclico.", "Bradicardia/BAV: procure beta-bloqueador, bloqueador de canal de cálcio, digoxina e intoxicações mistas.", "Nenhum padrão isolado identifica o agente; acione toxicologia/CIATox e trate síndrome clínica."]
    },
    {
      "id": "devices-artifacts", "title": "Dispositivos, derivações e artefatos", "category": "Técnica",
      "items": ["Espícula sem QRS sugere falha de captura; ausência de espícula quando deveria ocorrer sugere falha de sensibilidade/saída — confirme programação e cabos.", "Troca de braços pode inverter D I e aVR; dextrocardia mantém progressão precordial anormal.", "V1–V2 altos simulam BRD/Brugada e pioram progressão de R.", "Tremor pode imitar flutter/TV: confira pulso, outras derivações e eletrodos antes de tratar o monitor."]
    }
  ],
  "references": [
    {"id": "acc-acs-2025", "title": "2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for Acute Coronary Syndromes", "organization": "ACC/AHA", "year": 2025, "url": "https://www.acc.org/guidelines/guidelines/2025/02/27/17/21/acute-coronary-syndromes-2025"},
    {"id": "aha-als-2025", "title": "2025 AHA Guidelines — Adult Advanced Life Support", "organization": "American Heart Association", "year": 2025, "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support"},
    {"id": "aha-special-2025", "title": "2025 AHA Guidelines — Special Circumstances of Resuscitation", "organization": "American Heart Association", "year": 2025, "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-and-pediatric-special-circumstances-of-resuscitation"},
    {"id": "acc-brady-2018", "title": "2018 ACC/AHA/HRS Guideline on Bradycardia and Cardiac Conduction Delay", "organization": "ACC/AHA/HRS", "year": 2018, "url": "https://www.acc.org/Guidelines/Hubs/Bradycardia-and-Cardiac-Conduction-Delay"},
    {"id": "acc-af-2023", "title": "2023 ACC/AHA/ACCP/HRS Guideline for Atrial Fibrillation", "organization": "ACC/AHA/ACCP/HRS", "year": 2023, "url": "https://www.acc.org/Guidelines/Hubs/Atrial-Fibrillation"},
    {"id": "esc-va-2022", "title": "2022 ESC Guideline: Ventricular Arrhythmias and Prevention of Sudden Cardiac Death", "organization": "ESC", "year": 2022, "url": "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/ventricular-arrhythmias-and-the-prevention-of-sudden-cardiac-death/"},
    {"id": "esc-myopericarditis-2025", "title": "2025 ESC Guidelines for Myocarditis and Pericarditis", "organization": "ESC", "year": 2025, "url": "https://academic.oup.com/eurheartj/article/46/40/3952/8234483"},
    {"id": "esc-pe-2019", "title": "2019 ESC Guidelines for Acute Pulmonary Embolism", "organization": "ESC", "year": 2019, "url": "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/acute-pulmonary-embolism/"},
    {"id": "ehj-hypok-2021", "title": "Update on management of hypokalaemia and potassium goals", "organization": "European Heart Journal — Cardiovascular Pharmacotherapy", "year": 2021, "url": "https://academic.oup.com/ehjcvp/article/7/6/557/6270921"},
    {"id": "ehj-hyperk-2019", "title": "Management of hyperkalemia in the acutely ill patient", "organization": "European Heart Journal Supplements", "year": 2019, "url": "https://academic.oup.com/eurheartjsupp/article/21/Supplement_A/A12/5364194"},
    {"id": "uk-kidney-hyperk-2023", "title": "Clinical Practice Guideline: Treatment of Acute Hyperkalaemia in Adults", "organization": "UK Kidney Association", "year": 2023, "url": "https://www.ukkidney.org/health-professionals/guidelines/treatment-acute-hyperkalaemia-adults-0"},
    {"id": "udmi-2018", "title": "Fourth Universal Definition of Myocardial Infarction", "organization": "ESC/ACC/AHA/WHF", "year": 2018, "url": "https://academic.oup.com/eurheartj/article/40/3/237/5079081"},
    {"id": "sgarbossa-smith-2012", "title": "Modified Sgarbossa rule for acute coronary occlusion in LBBB", "organization": "Annals of Emergency Medicine", "year": 2012, "url": "https://pubmed.ncbi.nlm.nih.gov/22939607/"},
    {"id": "aha-ecg", "title": "AHA/ACCF/HRS Recommendations for Standardization and Interpretation of the ECG", "organization": "AHA/ACCF/HRS", "year": 2009, "url": "https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.108.191095"},
    {"id": "ptb-xl", "title": "PTB-XL, a large publicly available electrocardiography dataset", "organization": "PhysioNet", "year": 2020, "url": "https://physionet.org/content/ptb-xl/1.0.1/"}
  ]
};
