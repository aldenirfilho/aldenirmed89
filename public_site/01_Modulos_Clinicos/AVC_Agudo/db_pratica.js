// ==========================================
// DB 2: PRÁTICA CLÍNICA E UTI (TÓPICOS 6 AO 10)
// Meta: 130 Tópicos de conduta nua e crua
// ==========================================

const db_pratica = {
    // Tópico 6: Abordagem Prática (30 Tópicos)
    sec_6: {
        title: "6. Abordagem Prática Direta e Meticulosa ⚡",
        list: [
            "1. ⏱️ Minuto zero: Todo déficit focal neurológico súbito é AVC até prova em contrário.",
            "2. 🚨 Golden Hour: A meta global do hospital é avaliar o paciente, fazer a TC e iniciar trombolítico em menos de 60 minutos.",
            "3. 🩸 Minuto 5 (HGT): O primeiro passo cego da enfermagem é furar o dedo. Hipoglicemia afasta diagnóstico imediato de AVC.",
            "4. 🕰️ Minuto 10 (Last Seen Normal): Perguntar a família exata hora em que o paciente foi visto normal pela última vez.",
            "5. 🧮 Minuto 15 (NIHSS): Avaliação sistemática na maca: Consciência, olhar, visão, paralisia facial, força motora, ataxia, sensibilidade, linguagem, disartria, negligência.",
            "6. 🖼️ Minuto 25 (TC sem Contraste): Enviar IMEDIATAMENTE. Objetivo: Descartar hemorragia, NÃO ver a isquemia.",
            "7. 💉 Minuto 45 (Decisão rt-PA): Se TC normal (sem sangue), sintomas < 4,5h e sem contraindicações -> Trombólise no corredor da TC.",
            "8. 🩺 O Exame Físico Focado: Pulso (FA?), Sopro Carotídeo, Ausculta cardíaca, Pressão Arterial simétrica nos dois braços (dissecção aórtica?).",
            "9. 🚨 Sinais de Alerta para Mimics: Convulsão no início do quadro (sugere paralisia de Todd), febre alta com rigidez de nuca (Meningite focal).",
            "10. ⚠️ Manejo da PA Aguda: Reduzir SÓ SE for fazer Alteplase (> 185/110) ou se houver dissecção de aorta/EAP. Senão, não trate PA aguda.",
            "11. 💊 Droga Anti-Hipertensiva Ouro: Labetalol IV ou Nicardipina (No BR: Cuidado com nitroprussiato - Proibido). Pode-se usar Esmolol ou Metoprolol IV como alternativas limitadas.",
            "12. 🚫 O que NÃO fazer: Nunca prescrever Nifedipino sublingual (queda abrupta e incontrolável da PA = infarto cerebral fulminante).",
            "13. 🧠 Decisão Drip and Ship: Se o seu hospital não tem Hemodinâmica, trombolise e encaminhe para o Centro Avançado de AVC.",
            "14. 🔪 Angio-TC (CTA): Deve ser solicitada de rotina pós-TC normal para investigar estenose de grande vaso (LVO), mas NÃO pode atrasar o Alteplase.",
            "15. 💧 Hidratação na Prática: Acesso calibroso com Soro Fisiológico (0,9%) puro. Nunca soro com glicose.",
            "16. 🤒 Antitérmicos: Dipirona e Paracetamol agressivos. Não tolere picos > 37,5°C na fase hiperaguda.",
            "17. 🛡️ Cabeceira Zero vs 30°: O default é 30° para proteger as vias aéreas. Baixe para 0° apenas se presenciar piora neurológica indicando colapso de perfusão.",
            "18. 🩸 Coleta Sanguínea Inteligente: Não retarde o rt-PA esperando Hemograma. Só espere Plaquetas se o paciente usa heparina, tem doença hepática ou oncológica conhecida.",
            "19. ⚠️ O Despertar (Wake-up): Familiar relata que paciente foi dormir às 22h bem e acordou hemiplégico às 06h. O 'Last seen normal' é 22h (portanto > 8h = fora de janela para rt-PA empírico sem RM).",
            "20. 🛌 Abordagem do Acamado: Mudar decúbito de 2/2h, colchão pneumático. Escaras pioram processos infecciosos que afundam o AVC.",
            "21. 💊 Vias de Administração: Tudo deve ser Endovenoso (EV). Nunca via intramuscular (IM) num paciente que vai receber ou recebeu trombolítico.",
            "22. 🚽 Sondagem: Passar Sonda Vesical APENAS se retenção urinária severa comprovada. Preferencialmente passar a sonda ANTES de infundir o Trombolítico para não sangrar a uretra.",
            "23. 🫁 O2 Suplementar: Só ofereça O2 cateter 2L se a saturação estiver REALMENTE caindo abaixo de 94%.",
            "24. 🍽️ Abordagem Nutricional Básica: Não libere água ou comida até a fonoaudióloga testar os reflexos palatais e de deglutição. Risco máximo de broncoaspiração.",
            "25. ❤️ Fibrilação Atrial Descoberta: Não inicie Varfarina ou NOAC na porta. O controle agudo é manter normocardia e anticoagular dias/semanas depois.",
            "26. 🩸 Manejo de Sangramento Trombólico: Se gengiva, compressão. Se piora neurológica, parar o rt-PA imediatamente e providenciar Hemograma, TAP, TTPa, Crioprecipitado e TC de crânio urgente.",
            "27. 🏥 Transferência para UTI: Todos os AVCs isquêmicos que receberam rt-PA devem obrigatoriamente ir para unidade de monitorização contínua pelas primeiras 24h.",
            "28. 🧬 Exame Neurológico Horário: Enfermeiro ou Médico de plantão DEVE aferir o NIHSS a cada 60 minutos na UTI.",
            "29. 🧠 Confusão x Agitação: Evite amarrar (contenção física) que gera aumento da PA e ansiedade extrema. Tratar causa base: dor, bexigoma, hipóxia.",
            "30. 💊 Haloperidol SOS: Se agitação extrema risco de vida, doses mínimas de Haloperidol (0,5 a 1mg IV), evitando sedativos puros como Midazolam (exceto para IOT)."
        ]
    },

    // Tópico 7: Emergência (20 Tópicos)
    sec_7: {
        title: "7. Abordagem na Sala de Emergência (Sala Vermelha) 🚑",
        list: [
            "1. 🚑 Admissão Direta: O paciente vai direto para o Box de Emergência/Ressuscitação. Pular triagens burocráticas.",
            "2. 🫁 ABCDE do Trauma adaptado: A (Vias aéreas patentes?), B (Ventilação adequada?), C (Pulso e perfusão?).",
            "3. 🩸 Acesso Venoso Periférico: Instalar DOIS (2) acessos calibrosos (18G ou 16G), preferencialmente em fossa antecubital (para eventual Angio-TC com contraste de alto fluxo).",
            "4. 🚫 Proibição Venosa Central: Não puncionar jugular/subclávia. Não puncionar gasometria arterial a menos que estritamente necessário (contraindica o rt-PA se for local incompressível).",
            "5. ⏱️ Disparo de Equipe: Acionar imediatamente o 'Código AVC' (Neurologia, Radiologia, Laboratório).",
            "6. 🖼️ Liberação do Tomógrafo: Radiologia DEVE desocupar o tomógrafo na hora em que ouvir Código AVC.",
            "7. 🧮 Coleta de Dados Flash: LAMS (Los Angeles Motor Scale) - se ≥ 4 pontos, preparar terreno para transferência de Trombectomia.",
            "8. 🧪 Laboratório Rápido Kit AVC: Hemograma, Ureia, Creatinina, Eletrólitos, Glicemia, TAP, TTPa e Troponina (Isquemia cardíaca concomitante).",
            "9. ❤️ ECG de 12 Derivações: Fazer rápido. O AVC e o Infarto Miocárdico podem ocorrer simultaneamente, especialmente na artéria Insular.",
            "10. 🧠 Acompanhamento de Familiar: Essencial ter alguém que estava presente no início dos sintomas ao lado da maca durante a avaliação médica (para anamnese).",
            "11. ⚖️ Pesagem: Obter peso corporar imediato. A dose do rt-PA é exatamente 0,9mg/kg. Uma estimativa errada é perigosa.",
            "12. 🏥 Check-List de Contraindicações Absolutas: Cirurgias prévias de alto risco (3 meses), sangramento atual grave, TC com HSA.",
            "13. 💊 Check-List de Contraindicações Relativas: Idade > 80, infarto extenso (ASPECTS baixo). Hoje trombolisa-se com cautela.",
            "14. 💉 A Bolsa de Alteplase (Preparo): O pó liofilizado (50mg por frasco) deve ser reconstituído apenas com a água de injeção que o acompanha, sem agitar agressivamente.",
            "15. ⏱️ Instalação da Bomba: Programar o bolus de 10% primeiro. Depois 90% em exatos 60 minutos.",
            "16. 🔄 Flushing Final: Ao acabar a bolsa, infundir mais 50 mL de SF 0,9% na mesma linha para que o restinho da droga que ficou no equipo caia na veia do paciente.",
            "17. 🧮 NIHSS Pré e Pós: O NIHSS inicial deve estar anotado na folha de sala vermelha, e reavaliado a cada 15 minutos.",
            "18. 🚨 Manejo de Náuseas e Vômitos: Ondansetrona ou Metoclopramida. Vômitos na admissão aumentam risco de aspiração ou aumento súbito de PIC.",
            "19. 🗣️ Consentimento Verbal: AHA preconiza que trombólise é emergência médica e o consentimento verbal de risco/benefício com o familiar é ideal, mas ausência de familiar não atrasa o protocolo vital.",
            "20. 🚚 Rápida Saída: Assim que trombolisado, organizar vaga de UTI e, se LVO confirmado na angio-TC, ligar imediatamente para serviço de neurointervenção."
        ]
    },

    // Tópico 8: Enfermaria (20 Tópicos)
    sec_8: {
        title: "8. Abordagem em Enfermaria (Fase Subaguda > 24-48h) 🛏️",
        list: [
            "1. 🔄 Transição Segura: Acontece após a estabilização na UTI ou em AVCs menores sem indicação de rt-PA que estão super estáveis.",
            "2. 🛏️ Profilaxia DVT: Iniciar Heparina Profilática (Enoxaparina 40mg SC ou HNF 5000 UI 8/8h) AGORA que passou o período de sangramento cego das 24h.",
            "3. 💊 Iniciar AAS/DAPT: Introduzir AAS 100mg ou DAPT (AAS + Clopidogrel) dependendo da classificação (CHANCE).",
            "4. 🧠 Investigação Etiológica Focada: A enfermaria não é depósito, é o lugar de investigar O PORQUÊ o paciente infartou o cérebro.",
            "5. ❤️ Holter de 24h a 72h: Indispensável para AVC Criptogênico tentar encontrar Fibrilação Atrial subclínica.",
            "6. 🖼️ Ecocardiograma Transtorácico (ETT): Todo paciente fará. Avalia FEVE, trombos cavitários e anomalias de contratilidade.",
            "7. 🩺 Ecocardiograma Transesofágico (ETE): Indicado em jovens e criptogênicos para descartar trombo em apêndice atrial ou Forame Oval Patente (FOP).",
            "8. 🩸 Doppler de Carótidas e Vertebrais: Essencial em território anterior. Estenose severa (>70%) precisa ser documentada para cirurgia.",
            "9. 🍽️ Reintrodução Alimentar: Fonoaudiologia assina a liberação. Iniciar dieta branda/pastosa. Proibido líquidos ralos sem espessante em disfágicos leves.",
            "10. 🚶‍♂️ Fisioterapia Motora Precoce: Mobilização do leito já no primeiro dia de enfermaria, evitando síndrome do imobilismo, atelectasias e trombose.",
            "11. 🗣️ Terapia da Fala e Ocupacional: Início para reabilitação de afasias de Broca e Wernicke.",
            "12. 🚽 Manejo Intestinal: Constipação pós-AVC é epidêmica e causa esforço de Valsalva (pode estourar vaso fraco ou piorar o retorno venoso cerebral). Laxativos osmóticos de rotina.",
            "13. 💧 Retirada de Sondas: A SVD e o Acesso Venoso devem ser removidos no primeiro instante possível para focar na reabilitação e evitar sepse urinária.",
            "14. 🩸 Exames Básicos: Checar perfil lipídico completo, HbA1c, Sorologia Sífilis (VDRL), Função Tireoidiana e HIV.",
            "15. 💊 Introdução de Anticoagulação: Regra do 1-3-6-12 (ou similares). Em FA comprovada, começar DOACs dias após o AVC a depender do tamanho do infarto (Pequeno = 3 dias, Médio = 6 dias, Grande = 12 dias ou mais).",
            "16. 🏥 Controle de Infecções: Vigilância constante contra Pneumonia Associada à Assistência (PAV/PAC) por broncoaspiração micro silenciosa.",
            "17. 💊 Alta com Otimização Medicamentosa: Ajustar estatinas de alta potência para casa. Atorvastatina 80mg ou Rosuvastatina 40mg diário.",
            "18. ❤️ Controle Pressórico Crônico: Na enfermaria pode-se iniciar iECA ou BRA associado a tiazídicos lentamente para ir normalizando a PA e alcançar o alvo < 130/80 de forma vitalícia.",
            "19. 📝 Educação do Paciente (Alta): Explicar os sinais de alerta 'FAST' ao paciente e familiares. 10% dos pacientes terão um segundo AVC no primeiro ano.",
            "20. 🧠 Saúde Mental: Depressão Pós-AVC é devastadora. Triagem ativa com o paciente, possível prescrição de Inibidores Seletivos de Recaptação de Serotonina (ISRS)."
        ]
    },

    // Tópico 9: Condutas em UTI (30 Tópicos)
    sec_9: {
        title: "9. Abordagem e Conduta em UTI (Neurointensivismo) 🏥",
        list: [
            "1. 🧠 Monitorização Contínua: UTI neurológica requer aferição invasiva/frequente de PAM, SpO2 contínua e PAI (Pressão Arterial Invasiva) se possível.",
            "2. 🧮 Dinâmica Cerebral (PPC = PAM - PIC): A penumbra isquêmica perdeu autorregulação. Toda a sua irrigação depende do quanto a Pressão Arterial consegue vencer o inchaço (PIC).",
            "3. 📉 Quedas Súbitas de PAM: Vasodilatação sistêmica iatrogênica (uso errado de propofol alto) zera a perfusão da área isquêmica e finaliza a necrose.",
            "4. 🫁 Manejo Ventilatório: Intubação orotraqueal indicada se Glasgow < 8 (perda protetiva de VA), hipoxemia refratária, ou hipertensão intracraniana (HIC) fulminante exigindo neuroproteção profunda.",
            "5. 🌬️ Sedação Focada (Neuroproteção): Evitar benzodiazepínicos de longa meia vida. Propofol é preferível (reduz a CMRO2 e PIC) se o paciente não estiver muito hipotenso.",
            "6. ⚠️ PCO2 na Ventilação: A hipocapnia (PCO2 < 35) causa grave vasoconstrição nos vasos saudáveis, o que reduz a PIC de forma mágica, mas gera mais hipóxia isquêmica. O Alvo é Estrito: Normocapnia (PCO2 35 - 40 mmHg).",
            "7. 🧊 Temperatura: CMRO2 (consumo de oxigênio do cérebro) aumenta 10% para cada grau elevado. Controlar a temperatura da UTI rigorosamente para < 37,5°C. Cobertores de resfriamento se necessário.",
            "8. 💊 Soro e Osmolaridade: Nunca prescrever Soro Glicosado (5%), Ringer ou Soro Hipotônico (0.45%). A água livre invadirá as células isquêmicas agravando edema cerebral. Apenas Solução Fisiológica 0,9%.",
            "9. 🩸 Foco Glicêmico Fino: Mantenha níveis de 140-180 mg/dL. Hipoglicemia < 70 ou hiperglicemia > 200 lesam a BBB e pioram metabolismo anaeróbio.",
            "10. ⚡ Controle Eletroencefalográfico (EEG): Pacientes intubados que não despertam apesar do término da sedação devem realizar EEG contínuo para investigar Status Epilepticus Não-Convulsivo.",
            "11. 🧠 Convulsões Profiláticas: NUNCA usar Fenitoína/anticonvulsivantes profiláticos em isquemia. O uso só é permitido em crise documentada clínica ou elétrica.",
            "12. 🚨 A Síndrome do AVC Maligno: Ocorre na oclusão total da ACM. Ocorre tipicamente nas 48h-72h. O hemisfério inteiro incha. Paciente agita, a pupila ipsilateral dilata e ele afunda em coma (herniação uncal).",
            "13. 🔪 Craniectomia Descompressiva Hemisférica: O tratamento para o AVC Maligno. Abre-se e remove-se a calota craniana de metade do crânio para acomodar o inchaço maciço. Melhora sobrevida dramaticamente se feito em < 48h (especialmente < 60 anos).",
            "14. 💧 Osmoterapia na Crise Edematosa: Para a subida rápida de PIC com anisocoria: Manitol a 20% (0,5 a 1g/kg) ou Solução Salina Hipertônica a 3% ou 20%. Só usar como ponte até a cirurgia ou TC.",
            "15. 🚫 Corticoides: Dexametasona/Corticoides são PROIBIDOS no tratamento do edema de AVC Isquêmico (eles ajudam no edema peritumoral, mas são ineficazes e tóxicos em edema citotóxico de isquemia).",
            "16. 🏥 Posicionamento da Cabeça: Manter rigorosamente alinhada (sem virar o pescoço de lado). Rotação de pescoço obstrui veias jugulares e aumenta brutalmente a Pressão Intracraniana (PIC).",
            "17. ❤️ DVA Frequente: Noraepinefrina (Noradrenalina) é o vasopressor de escolha caso haja hipotensão em UTI para restabelecer a PAM protetiva e salvar a penumbra.",
            "18. 🩸 Trombose Venosa Profunda (TVP) Prevenção: Compressor pneumático mecânico. O paciente neurológico pós-isquêmico tem alta chance de TEP pela imobilidade na UTI.",
            "19. 💊 Vasodilatadores na UTI: Labetalol e Clevidipina são de escolha, seguidos por Esmolol e Urapidil. Evitar hidralazina (pode causar picos e vales aleatórios de PA e edema cerebral por aumento do fluxo volumétrico).",
            "20. 🧠 Delirium Hiperativo: Evitar excesso de sedação. Preferir Precedex (Dexmedetomidina) se paciente estubar agitado, pois preserva drive respiratório e permite avaliação do NIHSS.",
            "21. 🩸 Trombectomia na UTI: Paciente que volta da Hemodinâmica precisa monitorizar sítio de punção femoral para evitar hematoma retroperitoneal (observar assimetria e dor na coxa).",
            "22. 🍽️ Disfagia Severa (GTT): Se falha grave de deglutição que se arrasta por > 7 a 14 dias em UTI, discutir Gastrostomia para viabilizar transferência e reabilitação.",
            "23. 🫁 Traqueostomia Precoce: Ponderar a TQT em pacientes com oclusão bilateral grande vaso ou falha bulbar sem perspectiva de reverter deficit em 7 a 14 dias.",
            "24. 🏥 Monitoramento da PUPILA: Avaliação pupilar (tamanho, fotorreatividade, simetria) é mandatória. Qualquer anisocoria na UTI sinaliza shift de linha média de emergência.",
            "25. 🩺 Ritmo de Ausculta Cardíaca e Pulmonar: Vigilância de crepitações por broncoaspiração que podem requerer broncoscopia ou introdução precoce de Piperacilina-Tazobactam (ou similar) por pneumonia de aspiração química ou séptica.",
            "26. 🧮 Monitoramento de Coagulopatia: Em raros casos o Alteplase pode desarranjar os fatores e causar sangramento oculto em sítios improváveis. Observar melenas.",
            "27. ❤️ Controle do Potássio e Magnésio: Mantenha normalização fina de eletrólitos para evitar arritmias que possam chocar novamente a hemodinâmica do doente.",
            "28. 🩸 Hemoglobina: Alvo de transfusão é clássico em UTI (Transfundir apenas se Hb < 7g/dL em estáveis).",
            "29. 🧠 Cuidados Oculares: Lubrificação intensiva dos olhos e oclusão palpebral passiva em pacientes que perderam o reflexo de piscar (protege contra úlcera de córnea).",
            "30. 🛡️ Check-list de Liberação para Ala Geral (Alta da UTI): Controle de PA estável sem DVA, Nível de consciência adequado para proteção de vias aéreas, ECG sem arritmia aguda instável."
        ]
    },

    // Tópico 10: Prescrição (30 Itens de Bundle Completo)
    sec_10: {
        title: "10. Bundle de Prescrição Sugerida e Completa 💊",
        list: [
            "1. Dieta: Zero absoluto (NPO) ou Enteral por SNE pós liberação fono/endoscópica.",
            "2. Cabeceira: Elevada a 30° / Cabeça alinhada ao eixo.",
            "3. Cuidados de Enfermagem I: Mudança de decúbito 2/2h.",
            "4. Cuidados de Enfermagem II: Cuidados com pontos de pressão, gel protetor ocular a noite.",
            "5. Monitorização I: PA de 1/1h nas primeiras 24h, FC, SatO2, Tax.",
            "6. Monitorização II: NIHSS a cada hora (Notificar ao médico se queda > 4 pontos ou rebaixamento de consciência).",
            "7. Soro Basal I: Solução Fisiológica 0,9% 1000ml, gotejamento IV 60 ml/hora.",
            "8. Protetor Gástrico: Pantoprazol 40 mg IV 1x/dia.",
            "9. Oxigenoterapia SOS: O2 cateter nasal 2 L/min SOS caso SatO2 < 94%.",
            "10. Controle Glicêmico I: Dextro / HGT de 4/4h.",
            "11. Controle Glicêmico II: Insulina Regular SC (conforme protocolo local), iniciar só se glicemia > 180 mg/dL.",
            "12. Controle Térmico I: Dipirona 1g IV de 6/6h.",
            "13. Controle Térmico II: Paracetamol 750mg VO/SNE SOS se Temperatura > 37,5°C.",
            "14. Profilaxia TVP I (Mecânica): Botas de Compressão Pneumática Intermitente em MMII. Início Imediato.",
            "15. Profilaxia TVP II (Medicamentosa): Suspensa/Cancelada nas primeiras 24h pós Trombolítico.",
            "16. Prevenção Secundária (Antiplaquetário): Suspensa/Cancelada nas primeiras 24h. (Após 24h e tomografia: AAS 100-300mg VO).",
            "17. Prevenção Secundária (Estatinas): Atorvastatina 80 mg VO 1x a noite (ou Rosuvastatina 40mg).",
            "18. Controle Pressórico Agudo: Labetalol 10 a 20 mg IV (bolus lento) SOS caso PA > 180x105 (Trombolisados) ou > 220x120 (Não-Trombolisados).",
            "19. Prevenção Intestinal: Macrogol ou Lactulose 15ml VO/SNE de 12/12h (Para manter evacuação sem Valsalva).",
            "20. Analgesia: Tramadol 50 mg IV ou VO SOS em caso de dor intensa refratária a dipirona.",
            "21. Antiemético I: Ondansetrona 4 mg IV de 8/8h SOS.",
            "22. Antiemético II: Metoclopramida 10 mg IV de 8/8h SOS.",
            "23. Fisioterapia: Motora e respiratória, 1 a 2 sessões por dia, início precoce (avaliação UTI).",
            "24. Fonoaudiologia: Avaliação de deglutição imediata para possível liberação de via oral.",
            "25. Prevenção VAP: Higiene oral estrita com Clorexidina 0,12% 12/12h.",
            "26. Manejo Psiquiátrico SOS (Agitação extrema): Haloperidol 0,5 a 1 mg IV SOS agitação com risco a vias aéreas/acessos.",
            "27. Laboratoriais para Manhã: Hemograma, U/Cr, Na/K/Mg/Ca, TGO/TGP, Lipidograma Completo, HbA1c, coagulograma completo.",
            "28. Imagem/Exames Rotina de Investigação: Solicitar Eco Transtorácico, Holter 24h, Doppler das Carótidas para dias seguintes.",
            "29. Observações para a Enfermagem: NOTIFICAR Médico se sangramento em gengiva, urina vermelha, hematêmese ou cefaleia súbita excruciante.",
            "30. Conduta de Acionamento Rápido: Deixar prescrito para a equipe acionar Hemodinâmica ou Tomografia imediatamente se houver rebaixamento de consciência não justificado."
        ]
    }
};
