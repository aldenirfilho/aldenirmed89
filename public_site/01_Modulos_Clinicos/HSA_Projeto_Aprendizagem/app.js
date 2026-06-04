// ===========================
// HSA Projeto de Aprendizagem
// App.js — Lógica interativa
// ===========================

// ==================== NAVEGAÇÃO POR ABAS ====================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ==================== FLASHCARDS ====================
const flashcardsData = [
    { cat: "Epidemiologia", q: "Qual a taxa de letalidade da HSA aneurismática em 30 dias?", a: "Aproximadamente 30%. Historicamente era ~50%, mas vem caindo ~2% ao ano. 18-24% morrem antes de chegar ao hospital." },
    { cat: "Triagem", q: "Quais as indicações de IOT na HSA?", a: "GCS ≤8, PIC elevada, oxigenação inadequada, hipoventilação, instabilidade hemodinâmica, necessidade de sedação profunda ou paralisia." },
    { cat: "Classificação", q: "O que avalia a escala de Hunt & Hess?", a: "Estado neurológico na admissão: Grau 1 (assintomático) a Grau 5 (coma/descerebração). Baseada no exame neurológico inicial." },
    { cat: "Classificação", q: "A escala de Fisher avalia qual risco?", a: "Risco de VASOESPASMO CEREBRAL baseado no padrão de sangue na TC. Fisher 3 (coágulo ≥1mm) = maior risco de vasoespasmo." },
    { cat: "Tratamento", q: "Qual a dose e via de administração da nimodipina na HSA?", a: "60 mg VO ou SNG a cada 4 horas, por 21 dias. Iniciar em até 48h. NUNCA administrar IV (risco de óbito!)." },
    { cat: "Tratamento", q: "Qual a meta de PA na HSA aguda com aneurisma não tratado?", a: "PAS < 160 mmHg ou PAM < 110 mmHg. Se paciente alerta: PAS < 140 mmHg. Evitar hipotensão! PPC alvo ≥ 70 mmHg." },
    { cat: "Tratamento", q: "Quais anti-hipertensivos são preferidos na HSA?", a: "Labetalol, nicardipina, clevidipina ou enalapril IV. EVITAR nitroprussiato e nitroglicerina (aumentam volume sanguíneo cerebral e PIC)." },
    { cat: "Tratamento", q: "Como reverter varfarina na HSA?", a: "CCP de 4 fatores + Vitamina K IV. Se CCP indisponível: PFC ou plasma descongelado." },
    { cat: "Tratamento", q: "Como reverter dabigatrana na HSA?", a: "Idarucizumab (Praxbind) 5g IV. Se indisponível: FEIBA 50-80 U/kg IV." },
    { cat: "Vasoespasmo", q: "Quando ocorre o vasoespasmo após HSA?", a: "Entre o 4º e 14º dia, com pico no 7-8º dia. Pode ocorrer mais cedo, mesmo na admissão. Afeta ~30% dos pacientes." },
    { cat: "Vasoespasmo", q: "Qual o tratamento de 1ª linha para ICT (isquemia cerebral tardia)?", a: "Aumento hemodinâmico: elevar PAM com vasopressores (norepinefrina ou fenilefrina) + manter euvolemia. NÃO usar hipervolemia!" },
    { cat: "Vasoespasmo", q: "A nimodipina reduz o vasoespasmo angiográfico?", a: "NÃO! A nimodipina não reduz a incidência de vasoespasmo, mas MELHORA os desfechos. O mecanismo é desconhecido (neuroproteção?)." },
    { cat: "Complicações", q: "Qual a incidência de ressangramento nas primeiras 24h?", a: "4-14%, com risco máximo nas primeiras 2-12 horas. Mortalidade do ressangramento: até 70%." },
    { cat: "Complicações", q: "Qual o tratamento da hidrocefalia aguda na HSA?", a: "DVE (dreno ventricular externo). Permite medir PIC e drenar LCR. Drenagem lombar é alternativa apenas na hidrocefalia COMUNICANTE." },
    { cat: "Complicações", q: "Como diferenciar SIADH de Perda Cerebral de Sal na HSA?", a: "Labs similares (Na↓, Osm sérica↓, Na urinário↑). Diferença: SIADH = euvolêmico/hipervolêmico. Perda cerebral de sal = HIPOVOLÊMICO." },
    { cat: "Complicações", q: "Por que evitar fenitoína na HSA?", a: "Associada a PIORES desfechos neurológicos e cognitivos. Preferir levetiracetam quando anticonvulsivante for necessário." },
    { cat: "Monitoramento", q: "Qual a frequência ideal de exames neurológicos na HSA?", a: "A cada 1-2 horas, especialmente durante o período de risco de ICT (dias 4-14)." },
    { cat: "Profilaxia", q: "Qual antibiótico usar para profilaxia de PAV na HSA?", a: "Ceftriaxona 2g IV dose única. Reduziu PAV de 32% para 14% em 7 dias. Também reduziu mortalidade em 28 dias." },
    { cat: "Prognóstico", q: "Quais são os 3 principais preditores de desfecho na HSA?", a: "1) Nível de consciência/classificação neurológica na admissão. 2) Idade (correlação inversa). 3) Volume de sangue na TC inicial." },
    { cat: "Prognóstico", q: "Qual a incidência de epilepsia após HSA?", a: "5-12%. Latência mediana de 207 dias. Fatores de risco: grau ruim, AVC isquêmico associado, clipagem cirúrgica, crises precoces." },
];

let currentCard = 0;
let cards = [...flashcardsData];

function renderCard() {
    const card = cards[currentCard];
    document.getElementById('cardQuestion').textContent = card.q;
    document.getElementById('cardAnswer').textContent = card.a;
    document.getElementById('cardCategory').textContent = card.cat;
    document.getElementById('cardCounter').textContent = `${currentCard + 1} / ${cards.length}`;
    document.getElementById('cardProgress').style.width = `${((currentCard + 1) / cards.length) * 100}%`;
    // Remover flip
    document.getElementById('flashcard').classList.remove('flipped');
}

function toggleFlashcard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

function nextCard() {
    currentCard = (currentCard + 1) % cards.length;
    renderCard();
}

function prevCard() {
    currentCard = (currentCard - 1 + cards.length) % cards.length;
    renderCard();
}

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentCard = 0;
    renderCard();
}

// ==================== QUIZ ====================
const quizData = [
    {
        q: "Qual a dose correta de nimodipina na HSA aneurismática?",
        opts: ["30 mg VO 6/6h por 14 dias", "60 mg VO 4/4h por 21 dias", "60 mg IV contínuo por 14 dias", "120 mg VO 12/12h por 7 dias"],
        correct: 1,
        explain: "Nimodipina 60 mg a cada 4 horas, via oral ou SNG, por 21 dias. NUNCA administrar IV (risco de eventos adversos graves, incluindo óbito)."
    },
    {
        q: "Paciente com HSA e PAS de 190 mmHg. Qual a meta de PA antes do reparo do aneurisma?",
        opts: ["PAS < 120 mmHg", "PAS < 140 mmHg para todos os pacientes", "PAS < 160 mmHg ou PAM < 110 mmHg", "Não tratar a PA até após o reparo"],
        correct: 2,
        explain: "Meta: PAS < 160 ou PAM < 110 mmHg. Se alerta, PAS < 140. Evitar hipotensão. PPC alvo ≥ 70 mmHg."
    },
    {
        q: "Qual anti-hipertensivo deve ser EVITADO na HSA aguda?",
        opts: ["Labetalol", "Nicardipina", "Nitroprussiato", "Clevidipina"],
        correct: 2,
        explain: "Nitroprussiato e nitroglicerina devem ser evitados — aumentam o volume sanguíneo cerebral e, consequentemente, a PIC."
    },
    {
        q: "Qual o período de maior risco para vasoespasmo após HSA?",
        opts: ["Primeiras 24 horas", "Dias 4-14, pico no 7-8º dia", "Dias 21-30", "Após 6 semanas"],
        correct: 1,
        explain: "O vasoespasmo geralmente ocorre entre os dias 4-14, com pico no 7-8º dia. Pode ocorrer mais cedo, mesmo na admissão."
    },
    {
        q: "Qual o tratamento de primeira linha para isquemia cerebral tardia na HSA?",
        opts: ["Hipervolemia com cristaloides", "Hemicraniectomia descompressiva", "Aumento hemodinâmico com vasopressores", "Nimodipina em dose dobrada"],
        correct: 2,
        explain: "Tratamento de 1ª linha: elevar PAM com vasopressores (norepinefrina ou fenilefrina) + manter euvolemia. Hipervolemia NÃO é recomendada."
    },
    {
        q: "Qual o NNT (número necessário para tratar) da nimodipina na HSA?",
        opts: ["3", "7", "13", "25"],
        correct: 2,
        explain: "NNT = 13 (IC 95% 8-30) para prevenir um desfecho ruim. A nimodipina é o padrão de tratamento apesar de não reduzir o vasoespasmo angiográfico."
    },
    {
        q: "Paciente com HSA em uso de dabigatrana. Qual o agente de reversão específico?",
        opts: ["Vitamina K IV", "CCP de 4 fatores", "Idarucizumab 5g IV", "Andexanet alfa"],
        correct: 2,
        explain: "Idarucizumab (Praxbind) 5g IV é o antídoto específico para dabigatrana. Se indisponível: FEIBA 50-80 U/kg."
    },
    {
        q: "Qual anticonvulsivante deve ser EVITADO na HSA?",
        opts: ["Levetiracetam", "Valproato", "Fenitoína", "Lacosamida"],
        correct: 2,
        explain: "A fenitoína está associada a piores desfechos neurológicos e cognitivos na HSA. Preferir levetiracetam."
    },
    {
        q: "Qual a incidência de hidrocefalia na HSA?",
        opts: ["5-10%", "20-30%", "50-60%", "70-80%"],
        correct: 1,
        explain: "A hidrocefalia afeta 20-30% dos pacientes com HSA. 22% desenvolvem dependência de derivação."
    },
    {
        q: "Como diferenciar SIADH de Perda Cerebral de Sal na HSA?",
        opts: ["Pelo nível de sódio sérico", "Pelo nível de sódio urinário", "Pelo estado volêmico do paciente", "Pela osmolalidade urinária"],
        correct: 2,
        explain: "Labs são similares. Diferença: SIADH = euvolêmico/hipervolêmico. Perda cerebral de sal = HIPOVOLÊMICO."
    },
    {
        q: "Por que NÃO se deve restringir fluidos na hiponatremia por SIADH na HSA?",
        opts: ["Porque piora a hiponatremia", "Porque aumenta risco de contração volêmica e isquemia", "Porque causa hipercalemia", "Porque interfere com a nimodipina"],
        correct: 1,
        explain: "A restrição hídrica aumenta o risco de contração do volume intravascular e, consequentemente, lesão isquêmica relacionada ao vasoespasmo."
    },
    {
        q: "Qual o limiar de transfusão de hemoglobina recomendado na HSA?",
        opts: ["< 7 g/dL (restritivo)", "< 9 g/dL (liberal)", "< 10 g/dL", "< 8 g/dL"],
        correct: 0,
        explain: "Limiar restritivo de 7 g/dL, conforme diretrizes. Estudo com 742 pacientes não mostrou benefício significativo com limiar mais alto (10 vs 8 g/dL)."
    },
    {
        q: "Qual antibiótico profilático reduz PAV na HSA?",
        opts: ["Vancomicina 1g IV", "Piperacilina-tazobactam 4,5g IV", "Ceftriaxona 2g IV dose única", "Meropenem 1g IV"],
        correct: 2,
        explain: "Ceftriaxona 2g IV dose única. Reduziu PAV de 32% para 14% em 7 dias e mortalidade em 28 dias (15% vs 25%)."
    },
    {
        q: "Em quanto tempo idealmente o aneurisma deve ser reparado após HSA?",
        opts: ["Em até 72 horas", "Em até 24 horas", "Em até 7 dias", "Somente após resolução do vasoespasmo"],
        correct: 1,
        explain: "O reparo deve ser realizado o mais cedo possível, idealmente em < 24 horas. Alguns centros: ~7h da admissão."
    },
    {
        q: "Qual a mortalidade associada ao ressangramento na HSA?",
        opts: ["Até 20%", "Até 40%", "Até 70%", "Até 90%"],
        correct: 2,
        explain: "A mortalidade associada ao ressangramento é de até 70%. Ocorre em 4-14% nas primeiras 24h, com pico nas 2-12h."
    },
    {
        q: "O que a escala WFNS incorpora além da GCS?",
        opts: ["Idade do paciente", "Volume de sangue na TC", "Presença de déficit motor", "Tamanho do aneurisma"],
        correct: 2,
        explain: "A WFNS combina a GCS com a presença ou ausência de déficit motor para classificar a gravidade da HSA."
    },
    {
        q: "Na HSA, qual complicação cardíaca pode mimetizar IAM?",
        opts: ["Fibrilação atrial", "Cardiomiopatia de Takotsubo", "Pericardite constritiva", "Endocardite"],
        correct: 1,
        explain: "Cardiomiopatia de Takotsubo (balonamento apical transitório) — disfunção VE apical sem DAC significativa. Tipicamente reversível."
    },
    {
        q: "Qual a frequência ideal de exames neurológicos na HSA aguda?",
        opts: ["A cada 6 horas", "A cada 4 horas", "A cada 1-2 horas", "A cada 12 horas"],
        correct: 2,
        explain: "Exames neurológicos a cada 1-2 horas, especialmente durante o período de alto risco de ICT (dias 4-14)."
    },
    {
        q: "Qual a principal causa de hiponatremia na HSA?",
        opts: ["Uso excessivo de manitol", "SIADH ou Perda Cerebral de Sal", "Insuficiência adrenal aguda", "Nefropatia perdedora de sal"],
        correct: 1,
        explain: "SIADH (euvolêmica) ou Perda Cerebral de Sal (hipovolêmica). Até 30% dos pacientes com HSA desenvolvem hiponatremia."
    },
    {
        q: "Qual a incidência de epilepsia tardia após HSA aneurismática?",
        opts: ["1-2%", "5-12%", "25-30%", "40-50%"],
        correct: 1,
        explain: "5-12%, com latência mediana de 207 dias. FR: grau ruim, AVC isquêmico associado, clipagem, crises precoces."
    },
];

let currentQuestion = 0;
let score = 0;
let quizAnswered = false;

function renderQuestion() {
    const q = quizData[currentQuestion];
    document.getElementById('quizQuestion').textContent = q.q;
    document.getElementById('quizCounter').textContent = `Questão ${currentQuestion + 1} / ${quizData.length}`;
    document.getElementById('quizProgress').style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;

    const optContainer = document.getElementById('quizOptions');
    optContainer.innerHTML = '';
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = `${String.fromCharCode(65 + i)}) ${opt}`;
        btn.onclick = () => selectAnswer(i);
        optContainer.appendChild(btn);
    });

    document.getElementById('quizFeedback').className = 'quiz-feedback';
    document.getElementById('quizFeedback').style.display = 'none';
    document.getElementById('quizNextBtn').style.display = 'none';
    quizAnswered = false;
}

function selectAnswer(index) {
    if (quizAnswered) return;
    quizAnswered = true;

    const q = quizData[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');

    options.forEach((opt, i) => {
        opt.classList.add('disabled');
        if (i === q.correct) opt.classList.add('correct');
        if (i === index && i !== q.correct) opt.classList.add('incorrect');
    });

    const feedback = document.getElementById('quizFeedback');
    if (index === q.correct) {
        score++;
        feedback.className = 'quiz-feedback show correct-fb';
        feedback.innerHTML = `✅ <strong>Correto!</strong> ${q.explain}`;
    } else {
        feedback.className = 'quiz-feedback show incorrect-fb';
        feedback.innerHTML = `❌ <strong>Incorreto.</strong> ${q.explain}`;
    }
    feedback.style.display = 'block';

    if (currentQuestion < quizData.length - 1) {
        document.getElementById('quizNextBtn').style.display = 'block';
    } else {
        setTimeout(showResult, 1500);
    }
}

function nextQuestion() {
    currentQuestion++;
    renderQuestion();
}

function showResult() {
    document.getElementById('quizContainer').style.display = 'none';
    const result = document.getElementById('quizResult');
    result.style.display = 'block';

    const pct = Math.round((score / quizData.length) * 100);
    let icon, title, color;

    if (pct >= 80) { icon = '🏆'; title = 'Excelente!'; color = 'var(--accent-green)'; }
    else if (pct >= 60) { icon = '👍'; title = 'Bom trabalho!'; color = 'var(--accent-yellow)'; }
    else if (pct >= 40) { icon = '📚'; title = 'Continue estudando!'; color = 'var(--accent-orange)'; }
    else { icon = '💪'; title = 'Revise o conteúdo!'; color = 'var(--accent-red)'; }

    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultScore').textContent = `Você acertou ${score} de ${quizData.length} questões (${pct}%)`;
    const fill = document.getElementById('resultFill');
    fill.style.background = color;
    setTimeout(() => { fill.style.width = pct + '%'; }, 100);
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('resultFill').style.width = '0%';
    renderQuestion();
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    renderCard();
    renderQuestion();
});
