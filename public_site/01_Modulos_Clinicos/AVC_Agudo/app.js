document.addEventListener('DOMContentLoaded', () => {

    // --- ROTEAMENTO E NAVEGAÇÃO DE PÁGINAS ---
    const dashboardCards = document.querySelectorAll('.dash-card');
    const pages = document.querySelectorAll('.page');
    const backBtns = document.querySelectorAll('.btn-back');

    dashboardCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            window.scrollTo(0, 0);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById('dashboard').classList.add('active');
            window.scrollTo(0, 0);
        });
    });

    // --- ACCORDIONS ---
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });

    // --- CALCULADORA NIHSS ---
    const nihssSelects = document.querySelectorAll('.nihss-item');
    const nihssResult = document.getElementById('nihss-result-text');
    
    function calcNIHSS() {
        if(!nihssResult) return;
        let total = 0;
        nihssSelects.forEach(select => {
            total += parseInt(select.value) || 0;
        });
        
        let gravidade = "";
        let cor = "var(--success)";
        if(total === 0) { gravidade = "Sem déficits"; }
        else if (total >= 1 && total <= 4) { gravidade = "AVC Menor"; }
        else if (total >= 5 && total <= 15) { gravidade = "AVC Moderado"; cor = "var(--warning)"; }
        else if (total >= 16 && total <= 20) { gravidade = "AVC Moderado a Grave"; cor = "var(--danger)"; }
        else { gravidade = "AVC Grave"; cor = "var(--danger)"; }
        
        nihssResult.innerHTML = `<span style="color:${cor}; font-weight:bold; font-size:1.2em;">Total: ${total} pontos</span><br>Classificação: ${gravidade}`;
    }
    
    nihssSelects.forEach(s => s.addEventListener('change', calcNIHSS));

    // --- FLUXOGRAMA DE TROMBÓLISE (INTERATIVO) ---
    const checkJanela = document.getElementById('fluxo-janela');
    const checkSangue = document.getElementById('fluxo-sangue');
    const resFluxo = document.getElementById('fluxo-resultado');

    function updateFluxo() {
        if(!resFluxo) return;
        if(checkJanela.checked && checkSangue.checked) {
            resFluxo.style.display = 'block';
            resFluxo.innerHTML = `<span style="color:var(--success); font-weight:bold;">✅ Elegível para Trombólise!</span><br>
            <strong>Droga:</strong> Alteplase 0,9 mg/kg (Max 90mg).<br>
            <strong>Ação:</strong> 10% em bolus (1min), 90% em bomba (1h).<br>
            <strong>Meta PA:</strong> Manter ≤ 180/105 mmHg.`;
        } else if (!checkJanela.checked || !checkSangue.checked) {
            resFluxo.style.display = 'block';
            resFluxo.innerHTML = `<span style="color:var(--danger); font-weight:bold;">🚨 Trombólise EV Contraindicada neste cenário básico.</span><br>
            Se fora da janela, avaliar <strong>Mismatch DWI-FLAIR</strong> (Ressonância) ou Perfusão para <strong>Trombectomia (até 24h)</strong>.`;
        }
    }
    
    if(checkJanela) checkJanela.addEventListener('change', updateFluxo);
    if(checkSangue) checkSangue.addEventListener('change', updateFluxo);


    // --- BASE DE DADOS DE FLASHCARDS ---
    const flashcards = [
        { q: "Qual o alvo da Pressão Arterial ANTES da trombólise?", a: "PA ≤ 185/110 mmHg." },
        { q: "Estudo SHINE e meta glicêmica?", a: "Controle estrito (<130) causou mais dano por hipoglicemia. A meta atual é 140-180 mg/dL (tratar se > 180)." },
        { q: "Janela clássica para Trombectomia Mecânica (LVO)?", a: "Até 6h. Estendida até 24h pelos estudos DAWN e DEFUSE-3 se houver penumbra viável em imagem de perfusão." },
        { q: "O que é o estudo WAKE-UP?", a: "Permitiu trombólise em AVC do despertar se RM mostrar lesão em difusão (DWI) mas sem hiperintensidade em FLAIR (isquemia < 4,5h)." },
        { q: "Qual o mecanismo da Paralisia de Todd?", a: "Paresia transitória após uma crise epiléptica (exaustão neuronal temporária), é o maior mimic na emergência." }
    ];

    let currentCardIndex = 0;
    const fcQuestion = document.getElementById('fc-question');
    const fcAnswer = document.getElementById('fc-answer');
    const fcCounter = document.getElementById('fc-counter');
    const fcInner = document.getElementById('flashcard-inner');

    function loadCard(index) {
        if(!fcInner) return;
        fcInner.classList.remove('is-flipped');
        setTimeout(() => {
            fcQuestion.textContent = flashcards[index].q;
            fcAnswer.textContent = flashcards[index].a;
            fcCounter.textContent = `${index + 1} / ${flashcards.length}`;
        }, 200);
    }

    if(document.getElementById('btn-flip-fc')) {
        document.getElementById('btn-flip-fc').addEventListener('click', () => fcInner.classList.toggle('is-flipped'));
        document.getElementById('btn-next-fc').addEventListener('click', () => {
            currentCardIndex = (currentCardIndex < flashcards.length - 1) ? currentCardIndex + 1 : 0;
            loadCard(currentCardIndex);
        });
        document.getElementById('btn-prev-fc').addEventListener('click', () => {
            currentCardIndex = (currentCardIndex > 0) ? currentCardIndex - 1 : flashcards.length - 1;
            loadCard(currentCardIndex);
        });
        loadCard(0);
    }

    // --- BASE DE DADOS DE QUESTÕES TEMI (30 QUESTÕES) ---
    const quizData = [
        { q: "1. Paciente de 65 anos com hemiparesia à direita iniciada há 3 horas. PA na admissão: 200/115 mmHg. TC crânio s/ sangramento. A conduta em relação à pressão arterial antes de administrar alteplase é:",
          opts: ["Reduzir PA para ≤ 185/110 mmHg", "Reduzir PA para ≤ 140/90 mmHg", "Não tratar, a hipertensão é permissiva", "Aguardar PA chegar a 220/120 para tratar"],
          ans: 0,
          feed: "AHA/ASA: Antes da trombólise EV, a PA deve ser ≤ 185/110 mmHg para minimizar risco de transformação hemorrágica." },
        { q: "2. Paciente de 70 anos apresenta AVC isquêmico agudo há 5 horas (fora da janela para alteplase). Qual a meta pressórica nas primeiras 24h caso não seja candidato a trombectomia?",
          opts: ["Manter < 180/105 mmHg", "Tratar se > 220/120 mmHg e reduzir apenas 15%", "Manter normotensão estrita (120/80)", "Tolerar até 240/130 mmHg"],
          ans: 1,
          feed: "Sem reperfusão, a hipertensão permissiva é tolerada até 220/120. Reduzir excessivamente lesa a área de penumbra devido à falha da autorregulação." },
        { q: "3. Na avaliação pré-hospitalar, uma pontuação alta na escala LAMS (Los Angeles Motor Scale) sugere qual achado?",
          opts: ["Hipoglicemia grave", "Hemorragia subaracnóidea", "Oclusão de grande vaso (LVO)", "Crise epiléptica focal"],
          ans: 2,
          feed: "Escalas como LAMS e RACE são usadas para triar Oclusão de Grande Vaso (Large Vessel Occlusion), indicando necessidade primária de centro com hemodinâmica (trombectomia)." },
        { q: "4. No AVC agudo, o uso de soluções de soro hipotônico (ex: NaCl 0,45%) deve ser evitado devido ao risco de:",
          opts: ["Hipernatremia", "Edema cerebral piorado", "Hipocalcemia aguda", "Redução da diurese"],
          ans: 1,
          feed: "Fluidos hipotônicos podem exacerbar o edema no AVC isquêmico. Prefere-se sempre SF 0,9% (isotônico) ou Ringer Simples." },
        { q: "5. O estudo clínico DAWN estabeleceu qual premissa na Trombectomia Mecânica?",
          opts: ["Uso obrigatório de Alteplase junto ao cateterismo", "Expansão da janela de Trombectomia de 6h para até 24h baseado no Mismatch Clínico/Core de infarto (RM ou TC perfusão)", "Restrição da Trombectomia apenas para menores de 65 anos", "Substituição total da trombólise venosa"],
          ans: 1,
          feed: "DAWN e DEFUSE-3 revolucionaram as diretrizes AHA 2018/2019 ao estender a janela de reperfusão endovascular para até 24 horas caso exista grande área de penumbra (mismatch volumétrico)." },
        { q: "6. Dentre os 'mimics' (simuladores) de AVC, qual deve ser descartado IMEDIATAMENTE (primeiro exame na emergência)?",
          opts: ["Enxaqueca", "Epilepsia", "Hipoglicemia", "Transtorno conversivo"],
          ans: 2,
          feed: "A hipoglicemia é o simulador metabólico mais clássico e grave, e requer descarte na triagem primária (HGT rápido)." },
        { q: "7. Estudo WAKE-UP avaliou o AVC do despertar baseando-se em qual achado de imagem para indicar trombolítico?",
          opts: ["Sangramento leve na TC", "Mismatch na Ressonância: Lesão brilhante na Difusão (DWI) mas não visível ainda em FLAIR", "Sinal da Artéria Cerebral Média densa", "Hipoatenuação extensa em TC"],
          ans: 1,
          feed: "O estudo Wake-Up mostrou que lesões agudas brilham na DWI quase imediatamente, mas demoram de 3 a 4 horas para aparecer no FLAIR. Se há DWI positivo e FLAIR negativo, a lesão tem menos de 4,5h." },
        { q: "8. Após a administração de alteplase, o paciente deve ser monitorado numa UTI/Unidade de AVC. Quando pode ser iniciado o AAS?",
          opts: ["Junto com o alteplase", "Imediatamente após a infusão", "Apenas 24 horas após a infusão, seguida de TC de controle", "Após 7 dias"],
          ans: 2,
          feed: "Aspirina (e outros antitrombóticos/anticoagulantes) NUNCA devem ser iniciados nas primeiras 24h após a trombólise até que uma nova neuroimagem exclua sangramento." },
        { q: "9. Para avaliação da via aérea, recomenda-se a intubação profilática no AVC isquêmico grave?",
          opts: ["Sim, protege broncoaspiração em todos os casos", "Não, intubação apenas se perda de reflexos bulbares, rebaixamento grave (GCS < 8) ou insuficiência respiratória iminente", "Sim, para controlar o CO2 e fazer hiperventilação", "Não, apenas se o AVC for hemorrágico"],
          ans: 1,
          feed: "A via aérea no neurocrítico deve ser protegida apenas perante falha clínica objetiva (incapacidade de proteger a via ou oxigenar)." },
        { q: "10. Qual a temperatura-alvo nos primeiros dias de AVC isquêmico na UTI?",
          opts: ["Hipotermia terapêutica (32-34ºC)", "Normotermia (evitar febre rigorosamente > 37.8ºC a 38ºC)", "Tolerar até 39ºC", "Hipertermia terapêutica para aumentar fluxo"],
          ans: 1,
          feed: "A febre aumenta a demanda metabólica em uma área que já está sofrendo hipóxia (penumbra). Deve ser combatida agressivamente com antitérmicos e resfriamento de superfície se refratária." },
        { q: "11. Fisiopatologia da Isquemia: Qual íon invade a célula rapidamente causando edema celular citotóxico (morte neuronal hiperaguda)?",
          opts: ["Potássio", "Sódio", "Cálcio livre extracelular", "Magnésio"],
          ans: 1,
          feed: "Com a falta de ATP, a bomba Na+/K+ falha, o sódio entra maciçamente, puxando água para dentro da célula (Edema Citotóxico)." },
        { q: "12. Qual droga anti-hipertensiva IV é considerada de primeira linha para controle pressórico hiperagudo no AVC (conforme disponibilidade UpToDate/AHA)?",
          opts: ["Nitroprussiato de Sódio", "Labetalol ou Nicardipina", "Nifedipino sublingual", "Clonidina oral"],
          ans: 1,
          feed: "Labetalol e Nicardipina/Clevidipina são preferenciais por serem tituláveis e não induzirem vasodilatação cerebral intensa imediata (ao contrário do nitroprussiato, que pode aumentar a PIC)." },
        { q: "13. Uso de Nifedipino sublingual no controle da PA aguda do AVC é:",
          opts: ["Altamente recomendado", "Contraindicado", "Opção de segunda linha", "Depende do peso"],
          ans: 1,
          feed: "Contraindicado! Causa quedas imprevisíveis e abruptas da PA, prejudicando drasticamente a perfusão da área de penumbra isquêmica." },
        { q: "14. Em relação à cascata excitotóxica do AVC isquêmico, qual o principal neurotransmissor envolvido na morte neuronal?",
          opts: ["GABA", "Acetilcolina", "Glutamato", "Dopamina"],
          ans: 2,
          feed: "A hipóxia leva à liberação maciça de Glutamato, que ativa receptores NMDA, causando um influxo letal de Cálcio para o neurônio." },
        { q: "15. De acordo com as diretrizes, oxigenoterapia suplementar rotineira em todos os AVCs não-hipoxêmicos (SatO2 98% em ar ambiente):",
          opts: ["Aumenta área de penumbra", "Não é recomendada e pode gerar radicais livres", "É recomendada (O2 100%)", "Previne morte neuronal"],
          ans: 1,
          feed: "Oxigênio suplementar em normóxicos não traz benefícios provados em desfecho funcional e a hiperóxia pode gerar EROs (espécies reativas de oxigênio)." },
        { q: "16. Edema Cerebral Vasogênico no AVC ocorre caracteristicamente:",
          opts: ["Nos primeiros minutos", "Apenas após 1 mês", "Sua expressão máxima ocorre tipicamente entre o 3º e 5º dia pós-evento", "Não ocorre no AVC isquêmico"],
          ans: 2,
          feed: "O edema citotóxico é celular e imediato. O edema vasogênico (quebra da barreira hematoencefálica) atinge o pico entre 72 a 96 horas, sendo a fase de maior risco de herniação (AVC Maligno)." },
        { q: "17. Como iniciar a prevenção de Trombose Venosa Profunda (TVP) em AVC com trombolítico recém administrado (< 24h)?",
          opts: ["Heparina em bomba", "Enoxaparina plena na primeira hora", "Compressão pneumática intermitente nas primeiras 24h", "AAS alta dose associado a Clopidogrel"],
          ans: 2,
          feed: "Anticoagulantes são proscritos nas primeiras 24h pós-alteplase pelo altíssimo risco de transformação hemorrágica. Profilaxia mecânica é o padrão." },
        { q: "18. Sinal da Artéria Cerebral Média (ACM) hiperdensa na TC sem contraste indica:",
          opts: ["Calcificação venosa idiopática", "Hemorragia ativa pontina", "Trombo agudo intra-arterial na topografia da ACM", "Envelhecimento normal"],
          ans: 2,
          feed: "O sinal da ACM hiperdensa reflete o coágulo real (tromboembólico agudo) dentro do vaso, muitas vezes sendo o único achado nas primeiras horas do AVC." },
        { q: "19. Sobre o uso de Estatinas após um AVC Isquêmico agudo não-cardioembólico:",
          opts: ["Estão contraindicadas", "Suspender por 1 semana", "Iniciar ou continuar precocemente Atorvastatina alta potência", "Usar apenas se LDL > 200"],
          ans: 2,
          feed: "Diretrizes recomendam estatinas de alta intensidade (Atorvastatina 80mg) para redução do risco aterotrombótico (pleiotropia e estabilização de placa)." },
        { q: "20. Na oclusão da Artéria Basilar (circulação posterior), os achados podem incluir:",
          opts: ["Afasia e hemiparesia direita proporcionada", "Quadriparesia, rebaixamento de consciência e diplopia", "Amaurose fugaz unilateral isolada", "Hemianopsia homônima isolada"],
          ans: 1,
          feed: "AVC de tronco encefálico pode cursar com déficit motor cruzado ou bilateral, alterações severas de pares cranianos, vertigem refratária e coma rápido." },
        { q: "21. Paciente de 45 anos na UTI, 72h após AVC Isquêmico extenso de Cerebral Média, evolui com anisocoria e Glasgow 6. Suspeita clínica:",
          opts: ["Convulsão sutil", "Edema cerebral vasogênico maligno com herniação uncal", "Re-trombose em outra artéria", "Conversão hemorrágica petequial benigna"],
          ans: 1,
          feed: "O pico do edema ocorre no 3º ao 5º dia. O AVC 'Maligno' da ACM leva a shift de linha média e herniação uncal (anisocoria ipsilateral pela compressão do 3º par craniano)." },
        { q: "22. Qual é o tratamento definitivo sugerido pelos trials (ex: DECIMAL, DESTINY, HAMLET) para o AVC Maligno da Artéria Cerebral Média em pacientes jovens (≤60a)?",
          opts: ["Barbitúricos em alta dose", "Craniectomia Descompressiva precoce (dentro de 48h)", "Hipotermia 32 graus", "Trombectomia de resgate no 3º dia"],
          ans: 1,
          feed: "A craniectomia descompressiva hemisférica antes que ocorra herniação irreversível salva vidas (reduz mortalidade massivamente, apesar da morbidade funcional residual)." },
        { q: "23. Uso de Tenecteplase (TNK) no lugar da Alteplase (rt-PA). Qual a grande vantagem que fundamenta o Guideline 2023?",
          opts: ["Administração em bolus único (5-10 segundos) facilitando o transfer 'Drip-and-Ship'", "Não causa conversão hemorrágica em nenhuma dose", "Não possui janela terapêutica", "Pode ser dado sem TC prévia se paciente for jovem"],
          ans: 0,
          feed: "O TNK (0,25 mg/kg) é muito prático por ser aplicado em bolus único, sendo ótimo especialmente antes da transferência primária para trombectomia mecânica (bridging therapy)." },
        { q: "24. Fisiopatologia: Qual o comportamento da Autorregulação Cerebral em territórios de Penumbra Isquêmica?",
          opts: ["Permanece inalterada e funcional", "Passa a funcionar de forma exponencial", "É perdida (Vasoparalisia); o Fluxo Sanguíneo Cerebral torna-se passivamente dependente da Pressão Arterial Média", "Causa vasoconstrição extrema de defesa"],
          ans: 2,
          feed: "Com a acidose e isquemia, os vasos da penumbra perdem a capacidade de contrair ou dilatar, dilatando-se ao máximo. Portanto, quedas na PAM reduzem catastroficamente o fluxo ali (PPC = PAM - PIC)." },
        { q: "25. Controle de PCO2 na Ventilação Mecânica de um neurocrítico com AVC Agudo. O que hiperventilação intensa (PaCO2 < 30 mmHg) gera?",
          opts: ["Vasodilatação cerebral, aumentando a área de penumbra", "Vasoconstrição cerebral reativa, podendo aprofundar gravemente a isquemia local", "Aumento da oferta capilar de oxigênio", "Redução do edema citotóxico sem efeito vascular"],
          ans: 1,
          feed: "Hipocapnia induz vasoconstrição severa das artérias saudáveis. Embora reduza a PIC rapidamente, ela piora o fluxo da área isquêmica e pode aumentar o infarto." },
        { q: "26. Qual o limiar clássico do escore NIHSS que, na prática, levanta forte suspeita clínica de Oclusão de Grande Vaso (LVO) e dispara indicação de angio-TC imediata?",
          opts: ["NIHSS ≥ 1", "NIHSS ≥ 6", "NIHSS 0 (apenas com vertigem)", "NIHSS ≥ 35"],
          ans: 1,
          feed: "Déficits de NIHSS maiores que 6 sugerem fortemente a presença de uma LVO (circulação anterior), tornando a Trombectomia Mecânica altamente factível." },
        { q: "27. Se houver conversão hemorrágica sintomática intra-hospitalar durante ou logo após a infusão de alteplase, a conduta primária imediata é:",
          opts: ["Manter infusão do trombolítico mas iniciar plasma fresco", "Suspender alteplase, solicitar TC urgente e solicitar Crioprecipitado/Ácido Tranexâmico", "Heparinização para estabilizar o vaso", "Apenas observar e fazer RM de controle"],
          ans: 1,
          feed: "Qualquer piora neurológica requer stop na medicação. A reversão empírica da Alteplase é feita com Crioprecipitado (fator VIII e Fibrinogênio) ou antifibrinolíticos (Tranexâmico)." },
        { q: "28. Conceitualmente, a Isquemia Cerebral Transitória (AIT) atual (tissue-based definition) diferencia-se do AVC isquêmico por:",
          opts: ["Duração puramente baseada no relógio (exatamente menor que 24 horas independentemente de imagem)", "Resolução clínica com AUSÊNCIA de infarto cerebral agudo na neuroimagem (RM DWI)", "Pelo NIHSS, sendo AIT sempre pontuação 0 no momento do ataque", "Ser originário apenas de fontes cardioembólicas"],
          ans: 1,
          feed: "O conceito antigo (tempo < 24h) caiu. Hoje, se houve sintoma transitório mas a Ressonância (DWI) mostrar lesão isquêmica permanente, o diagnóstico é de AVC isquêmico, e não AIT." },
        { q: "29. Quando solicitar Eletroencefalograma (EEG) contínuo no AVC isquêmico agudo na UTI?",
          opts: ["Rotina para todos nas primeiras 48h", "Em pacientes com rebaixamento de consciência não explicado pela gravidade da imagem, para descartar status epilepticus não-convulsivo", "Para guiar Trombólise em coma", "Nunca se o AVC for focal e leve"],
          ans: 1,
          feed: "O EEG é indicado quando o exame neurológico e o coma parecem desproporcionais aos achados estruturais da TC/RM, sugerindo crises de estado de mal não convulsivo associadas à lesão." },
        { q: "30. Estudo clínico recente (Ex: ESCAPE-NA1) testou uma droga inibidora do PSD-95 (Nerinetida) para proteger o tecido cerebral. Qual é o mecanismo teórico-base desta classe de drogas?",
          opts: ["Destruir o coágulo no nível microvascular", "Neuroproteção: bloquear a cascata de excitotoxicidade induzida pelo glutamato antes da morte neuronal irreversível", "Aumentar a glicólise anaeróbica nas áreas perfundidas", "Agir como um novo tipo de heparina purificada"],
          ans: 1,
          feed: "O futuro do tratamento tenta unir reperfusão mecânica com neuroproteção citoprotetora (impedindo o cálcio de induzir a produção letal de óxido nítrico no nível neuronal)." }
    ];

    let currentQuizIndex = 0;
    const qText = document.getElementById('quiz-question');
    const optList = document.getElementById('quiz-options');
    const feedbackBox = document.getElementById('quiz-feedback');
    const qCounter = document.getElementById('quiz-counter');

    function loadQuiz(index) {
        if(!qText) return;
        const data = quizData[index];
        qText.textContent = data.q;
        optList.innerHTML = '';
        feedbackBox.style.display = 'none';
        qCounter.textContent = `Questão ${index + 1} de ${quizData.length}`;

        data.opts.forEach((opt, idx) => {
            let btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(idx, data.ans, data.feed, btn);
            optList.appendChild(btn);
        });
    }

    function checkAnswer(selected, correct, feedback, btnElement) {
        const buttons = optList.querySelectorAll('.option-btn');
        buttons.forEach(b => b.disabled = true);

        if(selected === correct) {
            btnElement.classList.add('correct');
        } else {
            btnElement.classList.add('wrong');
            buttons[correct].classList.add('correct');
        }

        feedbackBox.innerHTML = `<strong>Análise TEMI:</strong> ${feedback}`;
        feedbackBox.style.display = 'block';
    }

    if(document.getElementById('btn-next-quiz')) {
        document.getElementById('btn-next-quiz').addEventListener('click', () => {
            if(currentQuizIndex < quizData.length - 1) {
                currentQuizIndex++;
                loadQuiz(currentQuizIndex);
            }
        });

        document.getElementById('btn-prev-quiz').addEventListener('click', () => {
            if(currentQuizIndex > 0) {
                currentQuizIndex--;
                loadQuiz(currentQuizIndex);
            }
        });
        
        loadQuiz(0);
    }
});
