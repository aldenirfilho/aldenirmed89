// ==========================================
// DB 4: NERD, INSIGHTS E PESQUISA (17 AO 24)
// Meta: Aprofundamento avançado e links clicáveis
// ==========================================

const db_pesquisa = {
    // 17. Curiosidades Nerds (10 Tópicos)
    sec_17: {
        title: "17. Curiosidades Nerds 🤓",
        list: [
            "1. A Cor Verde do RAPID: O software mundialmente famoso que lê perfusões em RM e CTP (RAPID) foi treinado especificamente para pintar a penumbra isquêmica (tecido salvável) de verde esperança e o core (tecido morto) de magenta choque.",
            "2. O Vírus Morcego Vampiro: A Desmoteplase, um trombolítico testado anos atrás (estudo DIAS-4), foi inicialmente sintetizada e extraída da saliva do morcego vampiro *Desmodus rotundus*.",
            "3. O cérebro engole o coração: Em um adulto em repouso, o cérebro, pesando apenas 2% do peso corporal, consome cerca de 20% do fluxo sanguíneo cardíaco e do oxigênio total do corpo.",
            "4. Polígono em Peças: Cerca de 50% das pessoas saudáveis no mundo têm o Polígono de Willis incompleto, o que as torna muito mais vulneráveis à isquemia fulminante se uma carótida ocluir bruscamente.",
            "5. A barreira Intransponível: A Barreira Hematoencefálica (BHE) é tão seletiva que bloqueia a passagem de 100% das drogas biológicas macias e mais de 98% das drogas sintéticas de pequeno tamanho.",
            "6. Fibrina em 3D: A estrutura do coágulo influencia a eficácia do Alteplase. Trombos 'vermelhos' (cardioembólicos, ricos em hemácias) dissolvem mais fácil. Trombos 'brancos' (ateroscleróticos, ricos em fibrina/plaqueta) resistem bravamente à lise química.",
            "7. Efeito Lázaro Neurológico: Relatos de pacientes em Locked-in severo (AVC Basilar) que levantam da maca minutos após a extração do coágulo na hemodinâmica, um dos maiores espetáculos da medicina.",
            "8. Nomenclatura Histórica: A palavra 'Stroke' (golpe/pancada) reflete a crença antiga de que a pessoa havia sido golpeada por um ser divino devido ao acometimento súbito fulminante.",
            "9. Vasospasmo Frio: A aplicação de gelo na cabeça para neuroproteção falhou no passado porque a hipotermia regional causou vasospasmo carotídeo paradoxal piorando a isquemia em alguns ensaios.",
            "10. Paradoxo Obesidade: No AVC (assim como na IC), existe o Paradoxo da Obesidade: pacientes obesos de grau leve têm mortalidade hospitalar MENOR do que pacientes magros subnutridos após o AVC (melhor reserva metabólica aguda)."
        ]
    },

    // 18. Insights Clínicos (10 Tópicos)
    sec_18: {
        title: "18. Insights Clínicos Sênior 💡",
        list: [
            "1. Todo paciente agitado pós-Trombólise tem sangramento oculto ou hipóxia até que se prove o contrário. Nunca contenha fisicamente sem examinar as pupilas.",
            "2. O cateter de O2 não é cosmético. Se a saturação é 98% em ar ambiente, o O2 suplementar não faz nada de bom e só empurra Radicais Livres (EROs) para a área infartada, matando mais a penumbra.",
            "3. O HGT engana: Em pacientes hiperglicêmicos crônicos (Dm2 descompensado), uma queda brusca de 300 para 110 mg/dL pode gerar neuroglicopenia focal e simular AVC. Não trate o número, trate o paciente.",
            "4. Confiar na Família, desconfiar do Horário: Se a esposa diz que ele caiu às 14h, questione profundamente o que ele fez entre as 12h e as 14h. O horário 'Last Seen Normal' exige minúcia policialística.",
            "5. Hipertensão Permissiva salva o cérebro. Se no dia seguinte a PA despencar pro normal (120/80) por uso empírico descuidado de captopril pelo colega da manhã, o paciente pode voltar a ter plegia por re-isquemia por baixo débito.",
            "6. A Tomografia de porta NORMAL é a MELHOR tomografia possível. Não reclame que não viu o AVC. Se não tem mancha preta, significa que você está a tempo de trombolisar e salvar tudo.",
            "7. Um ECG irregular sem P na porta de entrada no AVC Isquêmico sela o diagnóstico de Cardioembolismo e simplifica a internação (pula-se holters e etc, vai direto para anticoagulação tardia).",
            "8. Não espere a ambulância do SAMU Advanced se você tem Alteplase na UPA e um médico apto. Infunda a droga em bolus, mande rolar na bomba e bote ele na ambulância. Drip and Ship salva muito mais que Ship and Drip.",
            "9. Sintomas flutuantes (AIT repetido crescendo na frente da equipe de saúde) são uma emergência vascular máxima de estenose crítica ou trombo em rolamento oscilante. Intervenção imediata.",
            "10. Disfagia silenciosa é a maior assassina subaguda. Paciente recebe alta andando, vai para casa, engasga com sopa imperceptivelmente no jantar, faz pneumonia química massiva e morre 3 dias depois na UTI com Sepse."
        ]
    },

    // 19. Perspectivas Futuras (10 Tópicos)
    sec_19: {
        title: "19. Perspectivas Futuras e Ciência 🚀",
        list: [
            "1. Trombectomia Infinita: Trials investigam se podemos fazer Trombectomia após 24 horas (ex: dia 2 ou 3) em pacientes que têm progressão super lenta de morte celular (Fast vs Slow Progressors).",
            "2. Citoproteção Acoplada (NA-1): A retomada dos testes de neuroprotetores potentes (como Nerinetida) usados no exato momento da recanalização mecânica.",
            "3. Células Tronco Mesenquimais: Terapia celular intravenosa administrada 48 horas após o AVC isquêmico grave para promover neurogênese e religamento sináptico.",
            "4. Nanobots de Lise: Uso de micro-robôs magnéticos injetáveis guiados por campo magnético até o coágulo de circulação distal que não pode ser acessado por cateter.",
            "5. Stents Bioabsorvíveis Cerebrais: Criação de stents revestidos com fármacos para carótidas e intracranianas que dão suporte mecânico e depois dissolvem para não causar trombo em stent tardio.",
            "6. Mobile Stroke Units (MSU) Nacionais: Expansão global do modelo alemão de ambulâncias com CT Scanner embutido, levando o tempo Porta-Agulha para perto de zero no pré-hospitalar.",
            "7. Biomarcadores Rápidos de Sangue: Desenvolvimento de testes 'Point of Care' (ex: fitinha de HGT) que medem GFAP para diferenciar isquemia de hemorragia cerebral na própria ambulância sem precisar de Tomografia.",
            "8. Inteligência Artificial em Tomografia sem Contraste: Máquinas predizendo volume de isquemia baseado em leves alterações de pixel em NCCT em UPA, driblando a necessidade de Ressonância caras.",
            "9. Realidade Virtual na Reabilitação: Programas imersivos onde os pacientes recuperam os movimentos através da plasticidade neural jogando simuladores controlados pelos olhos.",
            "10. Trombolíticos Fibrino-Específicos Ultra-Rápidos: Criação de lise química de quarta geração com ação em segundos sem destruir o fibrinogênio sistêmico."
        ]
    },

    // 20. Aprofundamento (10 Links)
    sec_20: {
        title: "20. Pontos de Aprofundamento (Linkados) 🔗",
        list: [
            "<a href='https://www.ahajournals.org/doi/10.1161/STR.0000000000000211' target='_blank' class='link-out'>1. AHA/ASA Guidelines 2019/2023 for Early Management of Acute Ischemic Stroke</a>",
            "<a href='https://www.nejm.org/doi/full/10.1056/NEJMoa1706442' target='_blank' class='link-out'>2. DAWN Trial (Trombectomia de 6-24h) - NEJM</a>",
            "<a href='https://www.nejm.org/doi/full/10.1056/NEJMoa1713973' target='_blank' class='link-out'>3. DEFUSE-3 Trial (Perfusão de Imagem) - NEJM</a>",
            "<a href='https://www.nejm.org/doi/full/10.1056/NEJMoa1804355' target='_blank' class='link-out'>4. WAKE-UP Trial (Trombólise baseada em RM) - NEJM</a>",
            "<a href='https://www.nejm.org/doi/full/10.1056/NEJMoa1215781' target='_blank' class='link-out'>5. CHANCE Trial (Clopidogrel com Aspirina em AVC Menor) - NEJM</a>",
            "<a href='https://radiopaedia.org/articles/ischaemic-stroke' target='_blank' class='link-out'>6. Radiopaedia: Ischaemic Stroke Masterclass Images</a>",
            "<a href='https://www.uptodate.com/contents/initial-assessment-and-management-of-acute-stroke' target='_blank' class='link-out'>7. UpToDate: Initial Assessment of Acute Stroke</a>",
            "<a href='https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(22)01054-6/fulltext' target='_blank' class='link-out'>8. Tenecteplase vs Alteplase em Bridging - Lancet Meta-analysis</a>",
            "<a href='https://www.nihstrokescale.org/' target='_blank' class='link-out'>9. Certificação e Treinamento Oficial do NIHSS (Grátis)</a>",
            "<a href='https://academic.oup.com/ajh' target='_blank' class='link-out'>10. Journal of Hypertension: Controle Pressórico Agudo em Isquemia</a>"
        ]
    },

    // 21. Assuntos Correlacionados (5 Links)
    sec_21: {
        title: "21. Assuntos Correlacionados (Sugestões de Estudo) 🤝",
        list: [
            "<a href='#' class='link-out'>1. Hemorragia Subaracnoide (HSA) e Manejo do Vasospasmo 🔗</a>",
            "<a href='#' class='link-out'>2. Monitorização Multimodal e Invasiva da Pressão Intracraniana (PIC) 🔗</a>",
            "<a href='#' class='link-out'>3. Delirium Agudo em UTI e Analgosedação Guiada 🔗</a>",
            "<a href='#' class='link-out'>4. Profilaxia de Eventos Tromboembólicos em Pacientes Neurocríticos 🔗</a>",
            "<a href='#' class='link-out'>5. Diagnóstico de Morte Encefálica em Lesão Vascular Expansiva 🔗</a>"
        ]
    },

    // 22. Questionamentos (10 Tópicos)
    sec_22: {
        title: "22. Questionamentos e Debates Não Resolvidos ❓",
        list: [
            "1. Tenecteplase no SUS: Vale a pena padronizar TNK em hospitais periféricos rurais devido à sua maior facilidade (bolus) comparado à burocracia das bombas infusoras do rt-PA?",
            "2. Idade Limite: Até qual idade é ético submeter um idoso muito frágil a uma Craniectomia Descompressiva gigantesca sabendo que ele sobreviverá, mas provávelmente acamado com mRS 5?",
            "3. Heparina precoce: Retomar ou não as heparinas nos AVCs cardioembólicos nos dias iniciais em pacientes de extremo risco de re-embolia?",
            "4. Dupla antiagregação duradoura: Devemos prolongar o DAPT (AAS+Clopidogrel) por 90 dias em asiáticos (que têm mais estenose intracraniana) ao invés de 21 dias?",
            "5. Reversão no trombolítico: O uso de Ácido Tranexâmico sozinho é comparável ao Crioprecipitado para parar a hemorragia intracraniana induzida pelo rt-PA?",
            "6. Trombectomia em ASPECTS 0 a 2: Existe algum benefício oculto em abrir a artéria quando o território infartado já se apoderou de mais de 80% do hemisfério? Ou é risco puramente letal?",
            "7. Pressão pós-Trombectomia Perfeita: Se a artéria abriu perfeitamente (TICI 3), qual a melhor PA a ser perseguida para evitar sangramento por hiperperfusão de reperfusão? <140, <130 ou <160?",
            "8. Manejo do FOP: Fechar Forame Oval Patente é estritamente necessário em pacientes > 60 anos com AVC criptogênico, ou os trials só o protegem abaixo dessa idade?",
            "9. Vasodilatação Seletiva: É possível usar Óxido Nítrico Inalatório para aumentar o fluxo sanguíneo local no cérebro isquêmico sem causar queda sistêmica da PAM?",
            "10. Fibrilação subclínica de 5 minutos: Uma salva de fibrilação atrial de curtíssima duração descoberta num SmartWatch é mandatória para anticoagulação crônica total?"
        ]
    },

    // 23. Pesquisas em Andamento (5 Tópicos)
    sec_23: {
        title: "23. Pesquisas em Andamento (Clinical Trials) 🔬",
        list: [
            "1. TASTE Trial: Estudo global gigante testando Tenecteplase vs Alteplase não só em Mismatch, mas em populações gerais irrestritas de AVC isquêmico no cenário comum.",
            "2. TENSION Trial: Avaliando de perto os desfechos e segurança da Trombectomia Mecânica estendida para infartos de Córtex muito extensos (Core gigantesco inicial).",
            "3. TIMELESS Trial: Tentativa de usar o Tenecteplase tardiamente (4,5 até 24 horas) para pacientes sem acesso à Trombectomia que possuem documentação de imagem de Mismatch favorável (Perfusão).",
            "4. FRONTIER Trial: Investigação de Neuroproteção e drogas inovadoras (ex: derivados do NA-1) embarcadas direto na ambulância móvel (MSU) de tratamento antes do próprio hospital.",
            "5. AXIOMATIC-SSP Trial: Investigação de inibidores do Fator XI (como Milvexian) como antiagregantes superseguros de próxima geração para prevenção secundária sem os riscos brutais de hemorragia dos NOACs atuais.",
            "6. OCEANIC-STROKE (2025/2026): Estudo pivotal positivo testando o Inibidor do Fator XIa (Asundexian) no AVC não-cardioembólico, mostrando desacoplamento perfeito entre hemostasia e trombose (não sangra, mas não clota)."
        ]
    },

    // 24. Referências
    sec_24: {
        title: "24. Referências Bibliográficas (Consultadas) 📚",
        list: [
            "1. AHA/ASA 2019/2023 Guidelines for the Early Management of Patients With Acute Ischemic Stroke.",
            "2. Powers WJ, et al. '2019 Update to the 2018 Guidelines...', Stroke, 2019.",
            "3. Campbell BCV, et al. 'Tenecteplase versus Alteplase before Thrombectomy for Ischemic Stroke' (EXTEND-IA). N Engl J Med, 2015.",
            "4. Nogueira RG, et al. 'Thrombectomy 6 to 24 Hours after Stroke with a Mismatch' (DAWN). N Engl J Med, 2018.",
            "5. Albers GW, et al. 'Thrombectomy for Stroke at 6 to 16 Hours with Selection by Perfusion Imaging' (DEFUSE-3). N Engl J Med, 2018.",
            "6. Thomalla G, et al. 'MRI-Guided Thrombolysis for Stroke with Unknown Time of Onset' (WAKE-UP). N Engl J Med, 2018.",
            "7. Johnston SC, et al. 'Clopidogrel and Aspirin in Acute Ischemic Stroke and High-Risk TIA' (POINT). N Engl J Med, 2018.",
            "8. Jovin TG, et al. 'Thrombectomy in 6 to 24 hours for Acute Ischemic Stroke' (RESCUE-Japan). NEJM 2022."
        ]
    }
};
