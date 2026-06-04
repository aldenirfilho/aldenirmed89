// ==========================================
// DB 3: INTERATIVO, FLASHCARDS E QUESTÕES (11 AO 16)
// Meta: Cumprir rigorosamente 30 questões e 30 flashcards
// ==========================================

const db_interativo = {
    // 11. Escalas e Ferramentas (Calculadoras e Regras)
    sec_11: {
        title: "11. As 5 Escalas Ouro (Cálculo Mental) 🧮",
        list: [
            "1. NIHSS (National Institutes of Health Stroke Scale): Padrão Ouro. Vai de 0 a 42. Menor que 5 é leve (cuidado ao trombolisar). Acima de 6 a 15 é grave/moderado e acima de 15 é severo. 11 Itens de avaliação (Nível de consciência é o Item 1).",
            "2. LAMS (Los Angeles Motor Scale): Avalia Face (0-1), Braço (0-2) e Perna (0-2). Se LAMS >= 4, o paciente tem altíssima chance de ter uma oclusão de grande vaso (LVO). Ideal para equipe do SAMU decidir transporte direto para Hemodinâmica.",
            "3. ASPECTS (Alberta Stroke Program Early CT Score): Começa com 10 pontos. Subtrai-se 1 ponto para cada área isquêmica infartada da ACM vista na Tomografia sem contraste. ASPECTS <= 5 significa infarto monstruoso (mas Trombectomia ainda pode salvar de acordo com RESCUE-Japan).",
            "4. CHADS2 e CHA2DS2-VASc: Estima o risco anual de AVC em pacientes com Fibrilação Atrial. C=Congestive Heart Failure, H=Hypertension, A2=Age>75 (2pts), D=Diabetes, S2=Stroke (2pts), V=Vascular disease, A=Age 65-74, Sc=Sex category (feminino). Pontuação >= 2 no homem ou >=3 na mulher indica anticoagulação OBRIGATÓRIA.",
            "5. HAS-BLED: Estima o risco de sangramento maior em 1 ano caso inicie anticoagulante. Hypertension, Abnormal renal/liver, Stroke, Bleeding history, Labile INR, Elderly (>65), Drugs/Alcohol. Mesmo se o HAS-BLED for alto (ex: 3), os benefícios de evitar o AVC costumam superar o risco de sangrar."
        ]
    },

    // 12. Imagens
    sec_12: {
        title: "12. Achados Radiológicos Clássicos (10 Laudos) 🖼️",
        list: [
            "1. Sinal da Artéria Cerebral Média Hiperdensa (Dense MCA Sign): Sinal precocíssimo na TC sem contraste. Indica um trombo grosseiro entupindo o vaso na hora. Sinaliza pior prognóstico sem Trombectomia.",
            "2. Perda da Fita Insular (Insular Ribbon Sign): O córtex da ínsula é extremamente sensível à isquemia, borrando na TC sem contraste em poucas horas.",
            "3. Apagamento do Núcleo Lentiforme: Os gânglios da base (nutridos pelas lenticuloestriadas) borram e se mesclam com a substância branca em menos de 6 horas na TC.",
            "4. Apagamento dos Sulcos Corticais: O edema citotóxico incha o cérebro agudamente, comprimindo e 'alisando' os sulcos contra a calota craniana na TC sem contraste.",
            "5. Mismatch de Perfusão (Core vs Penumbra): Na CTP ou RM, Core Isquêmico (Fluxo sanguíneo cerebral < 30%) aparece como uma bola vermelha pequena, e o Tempo de Trânsito Médio (Tmax > 6s) aparece verde enorme. É a senha para Trombectomia 24h.",
            "6. RM Sequência Difusão (DWI): O padrão ouro definitivo. Brilha (fica branco) na lesão hiperaguda isquêmica em questão de minutos, muito antes da TC ver qualquer coisa.",
            "7. RM Sequência FLAIR: Demora de 4 a 6 horas para começar a brilhar. É o relógio natural. Se brilhou na DWI e não brilhou no FLAIR = AVC nas primeiras horas.",
            "8. RM Sequência SWI (Susceptibility-Weighted): Excelente para ver micro-hemorragias antigas ('pontinhos pretos' de hemossiderina), alertando para risco de sangrar pós-rtPA ou indicando Angiopatia Amiloide em idosos.",
            "9. Sinal do Delta Vazio (Empty Delta Sign): Exclusivo da Trombose Venosa Cerebral (TVC) na Angio-TC ou Angio-RM Venosa. O contraste pinta o seio sagital, mas o centro fica escuro (o trombo).",
            "10. Desvio de Linha Média e Herniação Uncal: Ocorre no dia 3-5 no AVC Maligno. Os ventrículos são esmagados e a linha média (septo pelúcido) se desloca > 5mm em direção ao hemisfério sadio."
        ],
        images: [
            "https://storage.googleapis.com/nejm-multimedia/cms/10.1056/NEJMcp2415601/asset/c618a96a-8f07-4b1c-a783-716e955c2439/assets/images/large/NEJMcp2415601_f1.jpg",
            "https://storage.googleapis.com/jama-multimedia/cms/10.1001/jamanetworkopen.2025.0548/images/zoi250046f2.jpg"
        ]
    },

    // 13. Peculiaridades (30 Tópicos)
    sec_13: {
        title: "13. Peculiaridades e Mimics (30 Tópicos) ⚠️",
        list: [
            "1. Enxaqueca Hemiplégica (Mimic): Pacientes podem apresentar aura profunda e hemiparesia idêntica ao AVC antes da cefaleia.",
            "2. Paralisia de Todd (Mimic): Após uma crise convulsiva, o membro fica temporariamente paralisado. Pode enganar e levar a trombólise desnecessária.",
            "3. Hipoglicemia (Mimic): Simula absolutamente qualquer déficit focal (afasia, plegia). O cérebro local desliga sem glicose.",
            "4. Paralisia de Bell (Mimic): Apenas assimetria facial periférica (pega a testa!). O AVC agudo causa paralisia facial CENTRAL (poupa a testa, o paciente franze a testa normal).",
            "5. Infecção Sistêmica Súbita (Recrudescência): Uma UTI, infecção urinária grave pode fazer uma sequela de AVC antigo 'acender' novamente (paciente parece ter tido novo AVC no mesmo lugar).",
            "6. Síndrome de Wallenberg: Oclusão da PICA. Disfagia grave, rouquidão, nistagmo, vertigem, Horner ipsilateral e perda térmica da face ipsilateral com corpo contralateral.",
            "7. Síndrome de Weber: Oclusão da artéria cerebral posterior, ramo mesencefálico. Hemiparesia + paralisia do III par (oculomotor) ipsilateral.",
            "8. Síndrome de Anton: AVC occipital bilateral. Paciente sofre de cegueira cortical severa, MAS ele nega que está cego e confabula (anosognosia).",
            "9. Síndrome de Gerstmann: Lesão no lobo parietal inferior esquerdo. Agrafia, acalculia, confusão direita-esquerda e agnosia digital.",
            "10. Dissecção de Carótida: Suspeitar em jovem com dor na região anterior do pescoço + Síndrome de Horner ipsilateral + Afasia/Hemiparesia aguda.",
            "11. Dissecção de Vertebral: Suspeitar após trauma cervical (massagem quiroprática vigorosa) com sinais de tronco encefálico súbitos.",
            "12. Hemorragia Intracraniana Oculta: Em microbleeds, só a SWI da RM revela. Pode contraindicar rt-PA se > 10 microbleeds.",
            "13. Trombose de Seio Venoso: Causa infartos hemorrágicos bilaterais ou em áreas não arteriais clássicas. Tratamento: Heparina plena (mesmo sangrando!).",
            "14. Displasia Fibromuscular: Típico de mulheres jovens, causa estenose em colar de contas na carótida, propiciando isquemia.",
            "15. Angiopatia Amiloide Cerebral: Causa frequente de hemorragia lobar idosa, não isquemia. Facilita muito sangramentos pós-Trombólise.",
            "16. Vasculite Primária do SNC: Causa infartos multifocais sem fonte embólica clara em pacientes com cefaleia arrastada e VHS alto.",
            "17. Endocardite Infecciosa: Forma êmbolos sépticos. A trombólise EV é ABSOLUTAMENTE contraindicada por risco maciço de hemorragia mycótica.",
            "18. Mixoma Atrial: Tumor cardíaco benigno, mas causa AVC embólico bizarro em jovens por fragmentação do tumor.",
            "19. Coagulopatias: SAF (Sindrome Antifosfolípide) lidera os AVCs venosos e arteriais em mulheres jovens com abortos de repetição.",
            "20. FOP (Forame Oval Patente) e Embolia Paradoxal: Um trombo de TVP viaja da perna, passa do átrio direito para o esquerdo burlando o pulmão e sobe para o cérebro.",
            "21. Doença de Moyamoya: Vasos do polígono de Willis ocluem progressivamente, gerando rede vascular frágil em nuvem de fumaça. Risco misto isquêmico e hemorrágico.",
            "22. AVC Lacunar (Lipohialinose): Aterosclerose em microvaso penetrante não é resolvida por Trombectomia Mecânica (pois o cateter não entra). Trombolítico ajuda, mas AAS é ouro.",
            "23. Síndrome de CADASIL: Doença genética (mutação NOTCH3) causando enxaquecas, demência e múltiplos infartos lacunares em adultos jovens.",
            "24. Cocaína/Crack: Droga simpaticomimética potente, causa vasospasmo agudo ou pico hipertensivo, resultando em AVC isquêmico ou hemorrágico em muito jovens.",
            "25. COVID-19: Induziu estados de hipercoagulabilidade severa, causando grandes LVOs inflamatórios em pacientes jovens sem fatores de risco clássicos.",
            "26. Apneia Obstrutiva do Sono (AOS): Hipóxia crônica noturna gera FA silenciosa e policitemia secundária. Pesquisa de rotina no ambulatório.",
            "27. Polineuropatia Pós-AVC: Pacientes internados podem desenvolver miopatia do doente crítico, atrasando brutalmente o desmame ventilatório e reabilitação.",
            "28. Cefaleia Pós-AVC: Comum devido à inflamação perivascular pós isquemia. O uso indiscriminado de AINEs deve ser evitado pelo risco cardíaco e renal; focar em analgésicos puros.",
            "29. Reflexo de Cushing no Edema Citotóxico: Bradicardia + Hipertensão + Ritmo Respiratório Irregular indica iminência absoluta de herniação por inchaço da área de infarto.",
            "30. Abuso de Trombolítico (Risco de Sangramento): O tratamento para qualquer sangramento massivo intracraniano no paciente trombolisado é imediatamente estancar infusão, infundir crioprecipitado e solicitar parecer neurocirúrgico, embora a drenagem em tecido necrótico isquêmico sangrante raramente seja salvadora em comparação com sangramentos epidurais."
        ]
    },

    // 14. Mnemônicos
    sec_14: {
        title: "14. 10 Mnemônicos Ouro da UTI e Emergência 🧩",
        list: [
            "1. F.A.S.T. (Cincinnati adaptado): Face dropping, Arm weakness, Speech difficulty, Time to call 192 (A base da triagem pública).",
            "2. B.E. F.A.S.T.: Adicionado Balance (Equilíbrio) e Eyes (Visão diplopia/hemianopsia) para incluir AVCs de circulação posterior (Cerebelo/Tronco).",
            "3. TIME IS BRAIN: O lema global que resume a pressa em abrir a artéria, custe o que custar na triagem inicial.",
            "4. Regra dos 4,5h vs 6h vs 24h: 4,5h (Trombolítico IV) / 6h (Trombectomia direta mecânica baseada em Tomografia) / 24h (Trombectomia baseada em software RAPID/Mismatch).",
            "5. P.A. 185/110: Teto para começar o rTPA. P.A. 180/105: Teto de Segurança pós-rtPA nas primeiras 24h. Memorizar este binômio é OBRIGATÓRIO.",
            "6. A.A.S.: Após As 24h Seguintes da trombólise (Mnemônico lúdico para lembrar que AAS é proibido junto com Alteplase e só começa depois de 1 dia).",
            "7. H.G.T.: Hipoglicemia Gera Transtornos (Sempre checar a glicose do dedo no minuto zero para descartar mímica neurológica).",
            "8. Mismatch D.F.: Difusão-Brilha e Flair-Apagado (Indica que o AVC é recém-nascido, ainda dentro das 4,5h).",
            "9. CHA2DS2-VASc: (Mnemônico em si, detalhado nas Escalas) para decidir introdução vitalícia de Varfarina ou DOACs.",
            "10. S.H.I.N.E.: Sacrificar Hipoglicemia INduzida na Emergência (O estudo que enterrou a insulina estrita e aprovou os 140-180 mg/dL na UTI)."
        ]
    },

    // 15. Flashcards (Array de Objetos - Total 30)
    sec_15: {
        title: "15. Flashcards Ouro (Spaced Repetition) 🃏",
        list: [],
        fc_data: [
            { front: "Principal contraindicação absoluta radiológica para trombólise venosa?", back: "Hemorragia Intracraniana ou Subaracnóide atual." },
            { front: "Meta pressórica para iniciar o uso do Alteplase (rt-PA)?", back: "PA ≤ 185/110 mmHg." },
            { front: "Qual o alvo da Pressão Arterial nas primeiras 24 horas APÓS a administração do Alteplase?", back: "Manter estritamente PA < 180/105 mmHg." },
            { front: "Qual é a dose total padronizada do Alteplase (rt-PA) no AVC isquêmico e o limite máximo?", back: "0,9 mg/kg (Dose máxima de 90 mg)." },
            { front: "Como é a dinâmica de infusão da bolsa de Alteplase?", back: "10% administrados em bolus ao longo de 1 minuto; os 90% restantes na bomba em infusão contínua por 1 hora." },
            { front: "Qual a janela de tempo convencional (clássica) para realizar a Trombólise IV em pacientes elegíveis?", back: "Até 4,5 horas do início dos sintomas (Last seen normal)." },
            { front: "Qual o limite de plaquetas que contraindica a Trombólise Venosa?", back: "< 100.000 /mm³." },
            { front: "Qual o limite de RNI (INR) que contraindica a Trombólise Venosa?", back: "RNI > 1,7 ou uso recente de NOAC nas últimas 48h." },
            { front: "O que o Sinal da Artéria Cerebral Média Hiperdensa na TC de crânio indica?", back: "Oclusão aguda e severa de Grande Vaso (Trombo massivo), reforça a indicação urgente de Trombectomia Mecânica." },
            { front: "Qual é o principal diagnóstico diferencial sistêmico e tratável do AVC agudo (Mimic Stroke)?", back: "Hipoglicemia severa (Sempre solicitar o HGT no minuto zero)." },
            { front: "Se um paciente for submetido a Trombólise, quando você deve iniciar a profilaxia com AAS ou profilaxia de TVP com Heparina?", back: "Estritamente APÓS 24 horas e apenas DEPOIS de uma nova TC de crânio de controle confirmando que não houve sangramento." },
            { front: "Paciente NÃO irá receber Trombolítico (perdeu a janela). Qual o alvo da PA para evitar a piora isquêmica?", back: "Hipertensão Permissiva: Aceita-se PA de até 220/120 mmHg para garantir perfusão na penumbra." },
            { front: "Na Ressonância Magnética (RM), qual é a leitura de Mismatch para um 'Wake-Up Stroke' (AVC ao acordar)?", back: "Sequência DWI positiva (brilhando) e Sequência FLAIR negativa (sem brilho). Indica AVC agudo (< 4,5h)." },
            { front: "Dose exata do trombolítico Tenecteplase (TNK) no AVC Isquêmico?", back: "0,25 mg/kg (Máximo de 25mg) em bolus único." },
            { front: "Janela clássica para realizar a Trombectomia Mecânica sem necessidade de avançados estudos de perfusão?", back: "Até 6 horas do início dos sintomas." },
            { front: "Estudos que validaram a extensão da janela da Trombectomia de 6 para 24 horas?", back: "DAWN Trial e DEFUSE-3 Trial (Exigindo documentação de Mismatch de Perfusão)." },
            { front: "Alvo Glicêmico seguro na UTI para pacientes neurocríticos com AVC (Estudo SHINE)?", back: "Manter entre 140 e 180 mg/dL (evitar rigor < 130)." },
            { front: "Fatores clássicos modificáveis responsáveis por grande porcentagem dos AVCs:", back: "HAS, Diabetes, Tabagismo, Fibrilação Atrial." },
            { front: "O que é o NIHSS e qual o seu significado numérico se > 6?", back: "Escala clínica de gravidade de 0 a 42. Valores maiores que 6 sugerem alta probabilidade de Oclusão de Grande Vaso (LVO)." },
            { front: "Por que se mantém a cabeceira a 30° graus na enfermaria ou UTI no AVC Agudo?", back: "Para evitar a broncoaspiração devido à disfagia comum no quadro neuro-motor e facilitar a drenagem venosa craniana." },
            { front: "A via oral no paciente com AVC pode ser liberada imediatamente se ele estiver conversando?", back: "NÃO. Dieta NPO (Zero) rigorosa até teste de deglutição à beira-leito pela fonoaudiologia (Risco massivo de pneumonia aspirativa)." },
            { front: "Qual o vaso responsável pela maioria dos infartos cerebrais e causa hemiparesia braquiofacial contralateral + afasia (se hemisfério esquerdo)?", back: "Artéria Cerebral Média (ACM)." },
            { front: "Qual é a conduta IMEDIATA caso o paciente na bomba de Alteplase reduza de súbito sua consciência ou sofra cefaleia intensa e grave?", back: "Parar IMEDIATAMENTE a infusão, coletar laboratório (Coagulograma) e enviar urgente para a Tomografia." },
            { front: "Se confirmado o sangramento iatrogênico pelo uso do Alteplase, qual a terapia medicamentosa empírica principal de reversão?", back: "Infusão de Crioprecipitado (ou ácido tranexâmico/plaquetas)." },
            { front: "Síndrome de Horner (miose, ptose, anidrose) combinada com afasia e dor no pescoço anterior em pacientes jovens. O que suspeitar?", back: "Dissecção aguda de Artéria Carótida." },
            { front: "Quais medicações são de primeira linha para baixar a PA em urgências hipertensivas no AVC (evitando redução de PIC)?", back: "Labetalol ou Nicardipina intravenosos." },
            { front: "O que é o conceito Drip and Ship?", back: "Infundir o trombolítico na unidade básica primeiro, e depois colocar o paciente na ambulância para um centro avançado de trombectomia." },
            { front: "Principal etiologia do AVC tipo lacunar (pequenos vasos perfurantes)?", back: "Lipohialinose crônica das arteríolas devido a HAS e Diabetes mal controlados ao longo dos anos." },
            { front: "Manejo da febre aguda no paciente com AVC isquêmico:", back: "Resfriamento ativo e agressivo (Dipirona, Paracetamol, mantas frias). Manter normotermia. Febre acelera a necrose do cérebro isquêmico." },
            { front: "Uso empírico de corticoides sistêmicos (ex: dexametasona) para reduzir o edema no AVC isquêmico agudo. Sim ou não?", back: "NÃO! Totalmente contraindicado. Corticoides não combatem o edema citotóxico da isquemia, aumentam glicose e pioram desfecho clínico." }
        ]
    },

    // 16. Questões (Array de Objetos - Total 30)
    sec_16: {
        title: "16. Simulado TEMI (30 Questões Comentadas) ❓",
        list: [],
        quiz_data: [
            { q: "1. Paciente de 65 anos dá entrada com hemiparesia E instalada há 2 horas. TC crânio s/ contraste normal. PA atual é de 200/115 mmHg. Qual o 1º passo vital antes do trombolítico?", opts: ["Infundir Alteplase imediatamente, afinal tempo é cérebro.", "Fazer Nitroprussiato de Sódio IV rápido para derrubar a PA para 120x80.", "Administrar Labetalol EV para reduzir a PA para ≤ 185/110 mmHg.", "Adiar o trombolítico por mais 2h e observar a queda natural da PA."], ans: 2, feed: "Alteplase exige PA ≤ 185/110 antes de abrir a bomba. Nitroprussiato é proibido por aumento da PIC." },
            { q: "2. Após a infusão do rt-PA, qual é o alvo rigoroso da Pressão Arterial nas primeiras 24 horas na UTI?", opts: ["Abaixo de 140/90 mmHg", "Abaixo de 180/105 mmHg", "Abaixo de 220/120 mmHg", "Abaixo de 160/100 mmHg"], ans: 1, feed: "Pós-trombólise a PA deve ser mantida < 180/105 para impedir que a área que voltou a ser vascularizada arrebente e sangre." },
            { q: "3. Uma mulher acorda às 07:00 da manhã com afasia grave. O marido diz que foram deitar às 23:00 e ela estava ótima. Para o protocolo de AVC, qual é a hora do 'Last Seen Normal' (Início dos sintomas)?", opts: ["07:00 da manhã", "03:00 da manhã (metade do sono)", "23:00 da noite anterior", "Indeterminada, portanto exclui-se protocolo."], ans: 2, feed: "Wake-up Stroke. O Início é cravado na última vez em que ela foi vista saudável e normal (23:00). Ultrapassou a janela clássica. Necessitará de RM ou imagem avançada para intervir." },
            { q: "4. A conduta correta sobre Antiagregação (AAS) em um paciente submetido à Trombólise Venosa bem sucedida é:", opts: ["Iniciar AAS imediatamente na porta junto ao rt-PA.", "Iniciar AAS 100mg após 24h e obrigatoriamente após nova TC confirmando ausência de hemorragia.", "Não usar AAS se ele tomou Alteplase, para nunca mais.", "Prescrever dupla antiagregação imediata com Clopidogrel + AAS."], ans: 1, feed: "É probido antitrombótico na fase do rt-PA pelo risco cego de sangramento. Esperar 24h e exigir TC para liberar a pílula de AAS." },
            { q: "5. Em um paciente diagnosticado com AVC e NÃO ELEGÍVEL à terapia de reperfusão, até qual valor se tolera a PA sistêmica antes de tratá-la (Hipertensão Permissiva)?", opts: ["180/105 mmHg", "160/90 mmHg", "185/110 mmHg", "220/120 mmHg"], ans: 3, feed: "Sem trombolítico, a única salvação da penumbra isquêmica é a pressão alta do paciente. Aceita-se até 220x120 mmHg sem usar anti-hipertensivos." },
            { q: "6. Qual droga, devido ao risco fatal de roubo de fluxo, vasoparalisia induzida e aumento imprevisto da PIC, é abolida da fase aguda isquêmica?", opts: ["Labetalol Endovenoso", "Nicardipina Endovenosa", "Nifedipino Sublingual ou Nitroprussiato contínuo", "Esmolol Endovenoso"], ans: 2, feed: "Drogas de ação abrupta e sem controle fino como o Nifedipino SL podem derrubar a PA drasticamente e matar o paciente na hora. O Nitroprussiato causa potente venodilatação cerebral." },
            { q: "7. Sobre a Dose do Alteplase (rt-PA), marque a matemática exata preconizada pelo guideline:", opts: ["0,9 mg/kg. Máx 90mg. 50% bolus, 50% em 1h.", "0,5 mg/kg. Máx 50mg. 10% bolus, 90% bomba.", "0,9 mg/kg. Máx 90mg. 10% bolus, 90% bomba 1h.", "0,25 mg/kg em bolus rápido."], ans: 2, feed: "Alternativa C descreve com precisão a diluição do rT-PA no AVC (A D refere-se ao TNK)." },
            { q: "8. A Fonoaudiologia é essencial no AVC por um motivo principal de mortalidade secundária. Qual é o principal erro fatal na enfermaria?", opts: ["Falta de massagem terapêutica do maxilar.", "Liberação irresponsável de dieta livre (ou água) por via oral antes de testar risco aspirativo.", "Não passar Sonda Vesical.", "Atrasar o banho de leito."], ans: 1, feed: "A pneumonia aspirativa nos primeiros 3 dias de internação causa sepse e mata milhares de pacientes. O teste de deglutição é a chave." },
            { q: "9. O que é o sinal de 'Mismatch' Perfusão-Difusão ou DWI-FLAIR na RM?", opts: ["Garantia de que o tecido isquêmico está 100% necrosado irreversivelmente.", "Prova radiológica de que ainda existe grande área de cérebro paralisada, mas VIÁVEL, se desentupir o vaso (Penumbra).", "Indica que o paciente tem micro-sangramentos proibitivos para Trombectomia.", "Mostra apenas aneurismas escondidos."], ans: 1, feed: "Mismatch significa tecido salvável. O núcleo já está morto (Core), mas a casca isquêmica ao redor está hibernando e pedindo oxigênio (Penumbra)." },
            { q: "10. Qual a Janela Estendida atual validada pelos ensaios DEFUSE-3 e DAWN para a Trombectomia Mecânica na Oclusão de Grande Vaso anterior?", opts: ["Até 6 horas.", "Até 12 horas.", "De 6 até 24 horas do início dos sintomas (desde que haja critérios rigorosos de imagem CTP).", "Até 48 horas."], ans: 2, feed: "Trombectomia até 24h revolucionou a neurointervenção. Se o software de perfusão mostrar salvabilidade, envia para a mesa." },
            { q: "11. Em relação ao controle glicêmico e estudos recentes (SHINE) na UTI, a meta correta é:", opts: ["Glicemia em 80-110 mg/dL a todo custo com bomba de insulina contínua.", "Manter entre 140 e 180 mg/dL.", "Manter sempre acima de 250 mg/dL por energia suplementar.", "Controle da glicemia não importa na fisiologia da isquemia."], ans: 1, feed: "140 a 180 é o alvo. Cérebro hiperglicemiado faz lactato anaeróbico. Cérebro hipoglicemiado entra em coma. O meio-termo impera." },
            { q: "12. Qual droga endovenosa tem provado equivalência clínica (e as vezes superioridade prática) ao Alteplase devido à facilidade de aplicar em Bolus Rápido (0,25mg/kg) para 'bridging' antes de Hemodinâmica?", opts: ["Heparina não fracionada", "Tenecteplase (TNK)", "Estreptoquinase", "AAS injetável"], ans: 1, feed: "Tenecteplase! Sua enorme vantagem é poder ser feito no bolo e colocar o paciente logo na ambulância, sem carregar equipo ligado." },
            { q: "13. Paciente 85 anos, Fibrilação Atrial crônica sem tratamento, chega no H-4. NIHSS 18. Tomografia normal. Não há hemodinâmica num raio de 500km. TTPa normal, plaquetas 200 mil. Ele usa Varfarina mas esqueceu por 2 semanas (RNI hoje na porta = 1,2). Qual a conduta?", opts: ["Trombolisar com Alteplase IV agora.", "Contraindicado por idade > 80a.", "Contraindicado pela Varfarina mesmo o RNI estando < 1.7.", "Contraindicado pelo NIHSS grave."], ans: 0, feed: "AHA autoriza trombólise em > 80 anos. RNI <= 1.7 autoriza o uso. É o melhor candidato ao Alteplase para salvar a vida. Resposta: Trombolisar." },
            { q: "14. A escala NIHSS quantifica gravidade. O primeiro item cobrado nela é:", opts: ["Força no braço direito", "Tônus de membros", "Nível de Consciência (Nível, Perguntas, Comandos)", "Ataxia apendicular"], ans: 2, feed: "O item 1A, 1B e 1C testam nível de alerta (vigília, mês da idade, abre-fecha os olhos)." },
            { q: "15. A profilaxia para Trombose Venosa Profunda (TVP) em paciente que acabou de fazer Alteplase na UPA é:", opts: ["Heparina não fracionada SC 5000UI na mesma hora.", "Enoxaparina 40mg SC profilática na mesma hora.", "Apenas métodos mecânicos (compressão pneumática intermitente nas pernas) nas primeiras 24 horas.", "AAS e Deambulação imediata."], ans: 2, feed: "Nada de furos venosos preventivos ou anticoagulantes. Nas 24h pós rt-PA é arriscado. Bota compressiva na perna (Mecânica)." },
            { q: "16. Sintoma de alerta clássico na evolução do AVC Maligno na UTI com isquemia de toda a Média:", opts: ["Convulsão de 30 segundos com volta ao normal.", "Edema de membros inferiores e febre alta.", "Anisocoria e rápida piora do nível de consciência (GCS cai vertiginosamente).", "Taquicardia supraventricular instável."], ans: 2, feed: "Anisocoria em AVC extenso significa hérnia de uncus/tronco encefálico por inchaço fatal cerebral." },
            { q: "17. A indicação vital para tratar o edema no AVC Maligno descrito na pergunta anterior em um jovem (antes da herniação letal) é:", opts: ["Coma induzido e Corticoides IV dose altíssima (Solumedrol).", "Craniectomia Descompressiva Hemisférica em até 48 horas.", "Heparina venosa em bomba infusora contínua.", "Trombólise Intra-arterial de resgate com drogas extras."], ans: 1, feed: "Se não houver calota craniana pra acomodar o edema, ele vai comprimir o tronco e morrer. O teto temporal ideal da craniectomia é agir antes de 48h." },
            { q: "18. Paciente chega com NIHSS=2 (Apenas disartria leve que não lhe impede de viver normalmente) 2 horas após início. TC normal. Conduta:", opts: ["Alteplase emergencial, protocolo estrito.", "Recomendação forte contra Alteplase (segundo estudo PRISMS). Não o expor a risco de sangramento intracraniano por causa de defeito leve e não incapacitante.", "Trombectomia imediata em sala.", "Nitroprussiato IV e AAS em alta dose."], ans: 1, feed: "O benefício do Alteplase para 'AVC Minor' sem incapacidade limitante é irrisório perante a chance de ele sangrar no cérebro por causa da droga." },
            { q: "19. É obrigatório esperar todos os exames de coagulação e creatinina para infundir Alteplase em um doente sem histórico clínico suspeito?", opts: ["Verdadeiro. O Ministério proíbe Alteplase sem o TTPa.", "Falso. O tempo é cérebro. Apenas o Glicosímetro (HGT) precisa estar em mãos se o paciente for hígido e sem histórico de câncer ou drogas.", "Falso, mas a Troponina é mandatória antes.", "Verdadeiro, o potássio precisa estar ajustado antes."], ans: 1, feed: "Tempo salva neurônio. Nao retarde a seringa esperando o laboratório soltar a ureia/creatinina de um homem hígido sem anticoagulante." },
            { q: "20. Jovem 25 anos com síndrome medular/tronco aguda após trauma contuso de quiropraxia no pescoço. Causa base principal a descartar?", opts: ["Trombose Venosa Cerebral idiopática.", "Dissecção Aguda da Artéria Vertebral.", "Estenose carotídea familiar precoce.", "Angiopatia amiloide congênita."], ans: 1, feed: "Acidente mecânico cervical tem extrema correlação com estiramento e dissecção da artéria vertebral posterior." },
            { q: "21. Qual vaso cerebral irriga a face medial do córtex frontal e parietal (motor e sensório primário para pernas e genitais)? Seu AVC afeta mais o membro inferior.", opts: ["Artéria Cerebral Média", "Artéria Cerebral Anterior", "Artéria Cerebral Posterior", "Artéria Coróidea Anterior"], ans: 1, feed: "Oclusão de ACA resulta em hemiparesia crural intensa." },
            { q: "22. Principal uso do Manitol a 20% no AVC isquêmico:", opts: ["Dilatar as veias jugulares e melhorar perfusão.", "Restaurar o ATP neuronal.", "Terapia de urgência de ponte para a sala cirúrgica quando ocorre edema isquêmico fatal tardio (Ex: no dia 3 na UTI, quando a PIC atinge limites letais).", "Como adjuvante ao Trombolítico para dissolver a placa."], ans: 2, feed: "O Manitol ou a salina hipertônica são osmoterápicos para combater HIC grave por algumas horas enquanto preparam craniectomia. Eles não desentopem vasos." },
            { q: "23. Terapia 'DAPT' de 21 dias (AAS e Clopidogrel) preconizada pelo trial CHANCE é estritamente indicada para qual grupo de isquêmicos agudos?", opts: ["Paciente de Wake-Up com grandes oclusões (NIHSS 22).", "AIT (Ataque Isquêmico Transitório) de alto risco e Minor Stroke (NIHSS ≤ 3) não trombolisados.", "Pacientes com Hemorragia Lobar recente e isquemia secundária.", "Pacientes que receberam Alteplase há menos de 10h."], ans: 1, feed: "AAS e Clopidogrel (Dupla antiagregação) de curta duração evita recorrência precoce massiva em pessoas com AIT de altíssimo risco." },
            { q: "24. Fisiopatologia: Qual canal ativado pelo Glutamato na penumbra permite o influxo torrencial de Cálcio ativador de apopstose e necrose?", opts: ["Receptor NMDA (N-metil-D-aspartato).", "Canais de Sódio dependentes de voltagem lentos.", "Bomba de Potássio em repouso.", "Canais de cloro GABAérgicos."], ans: 0, feed: "A excitotoxicidade fatal se dá na hiperativação dos NMDA, lotando a célula de Cálcio que ativa lipases matadoras." },
            { q: "25. Qual tipo de solução soroterápica é proibida na prescrição de manutenção de AVC agudo, por exacerbar o inchaço celular agudo?", opts: ["Soro Fisiológico a 0,9%.", "Solução Salina Hipertônica a 3%.", "Soro Glicosado a 5% e soluções Ringer lactato com tonicidade menor.", "Sangue em concentrado puro."], ans: 2, feed: "A isquemia gera perda de bomba e inchaço celular. Soluções de água livre (como as com dextrose e ringer fraco) passam rapidamente para dentro do neurônio edemaciando o tecido (Edema citotóxico)." },
            { q: "26. O infarto cardioembólico por Fibrilação Atrial possui qual comportamento tomográfico de maior incidência comparado à aterosclerose em pequenos vasos?", opts: ["São infartos lacunares de micro perfurantes centrais.", "Produzem com extrema frequência transformação hemorrágica, pois o trombo vermelho é lizado rapidamente expondo vasos friáveis a alta pressão em tecido morto grande.", "Apenas acometem a artéria basilar por questão de anatomia direita.", "Não geram nenhum efeito no edema vasoativo."], ans: 1, feed: "FA joga grandes trombos de sangue no cérebro. Eles recanalizam por conta própria tardiamente de forma explosiva, banhando os tecidos frágeis e causando hemorragia intraparenquimatosa perigosa." },
            { q: "27. Se houver uso acidental super dosado de Alteplase durante o preparo no PA e o paciente sangrar na sonda gástrica, qual exame avalia a depleção proteica do alvo do rt-PA?", opts: ["Glicemia em jejum.", "Pesquisa de VHS e Fator Reumatoide.", "Dosagem laboratorial do Fibrinogênio sérico.", "Ecocardiograma de base."], ans: 2, feed: "O rt-PA destrói coágulos ativando plasmina que dissolve a fibrina. O fibrinogênio cai drasticamente. Se Fibrinogênio < 150 (em crise), indica reposição massiva imediata de Crioprecipitado para parar sangramento vivo." },
            { q: "28. Qual fator determina na imagem Perfusional CTP se aquele paciente (15 horas após início do AVC) merece a sala de cirurgia?", opts: ["Uma área de 'Core Isquêmico' gigante com quase nada de fluxo perilesional reduzido.", "O tamanho absoluto do trombo branco na coronária.", "Um 'Core Isquêmico' minúsculo e uma área de lentificação capilar (Tmax > 6s) gigantesca (Mismatch severo favorável).", "Pela ausência completa de perfusão em todo o crânio (Morte Cefálica simulada)."], ans: 2, feed: "O cirurgião só abre o vaso 24h depois se houver prova radiológica de que tem cérebro VIVO pedindo oxigênio ao redor de um foco morto minúsculo." },
            { q: "29. Pós-estabilização aguda (Dia 2 enfermaria), o Doppler mostra estenose carotídea unilateral severa (80%) causadora do quadro. Qual a recomendação para Endarterectomia sintomática?", opts: ["Esperar 3 anos para operar.", "Não opera-se estenoses de carótida no doente idoso moderno.", "Realizar no prazo máximo otimizado, de preferência na primeira à segunda semana pós AVC enquanto a placa está instável (evitando novo AVC imediato).", "Fazer apenas dieta hídrica permanente e AAS e não mexer no pescoço."], ans: 2, feed: "Estenose sintomática >70% tem risco de recorrência fulminante nos primeiros dias/semanas. A cirurgia de carótida precisa entrar rápido no planejamento." },
            { q: "30. Resuma o Bundle Ouro da Enfermaria / UTI após 48h de evolução sem trombólise:", opts: ["Dieta Zero Ad aeternum, Corticoides crônicos e Profilaxia com Varfarina indiscriminada.", "Dupla Antiagregação nos não cardioembólicos até 21d, Estatina Potente (Atorvastatina 80), Reabilitação Motora diária Precoce, Holter de investigação e liberação via oral só pós Fono.", "Manter AAS 500mg/dia, retirar Sonda por protocolo social imediato e liberar banhos livres de imersão.", "Trombólise intratecal com Alteplase e Manitol profilático diário a 100 mL de hora em hora para todos."], ans: 1, feed: "O Bundle correto prevê AAS/Clopidogrel temporário para Minor, Estatina máxima para inflamação e prevenção, reabilitação imediata (sentar, deambular assistido) para prevenir escaras e DVT, investigação causa com ETT/Holter e proteção da via aérea com dieta pela Fono." }
        ]
    }
};
