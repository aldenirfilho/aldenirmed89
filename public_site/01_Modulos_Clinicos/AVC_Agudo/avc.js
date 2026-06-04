// avc.js - Motor Universal da Enciclopédia TEMI (Matriz V7 Tailwind)

const globalDB = Object.assign({}, db_fundamentos, db_pratica, db_interativo, db_pesquisa, db_cross_ia);

// Ícones dinâmicos por módulo para dar o visual "Apple"
const getIconForSection = (num) => {
    const icons = {
        1: "🧠", 2: "📊", 3: "🧩", 4: "⚙️", 5: "🚨", 6: "🔍",
        7: "🛡️", 8: "💉", 9: "💊", 10: "🎯", 11: "📏", 12: "📝",
        13: "📦", 14: "⚠️", 15: "🃏", 16: "❓", 17: "💡", 18: "🔬",
        19: "📚", 20: "🔄", 21: "💬", 22: "⚡", 23: "🫁", 24: "🩺"
    };
    return icons[num] || "📄";
};

// Cores de gradiente por seção
const getGradientForSection = (num) => {
    const gradients = [
        "from-blue-500 to-cyan-500", "from-purple-500 to-violet-500", "from-amber-500 to-orange-500",
        "from-slate-700 to-slate-900", "from-rose-500 to-pink-600", "from-indigo-500 to-blue-600",
        "from-emerald-500 to-green-600", "from-red-500 to-orange-600", "from-pink-500 to-rose-500",
        "from-teal-500 to-cyan-600", "from-blue-600 to-indigo-600", "from-slate-600 to-slate-800",
        "from-orange-500 to-amber-500", "from-red-600 to-rose-600", "from-yellow-400 to-amber-500",
        "from-cyan-500 to-blue-600", "from-amber-400 to-yellow-500", "from-indigo-500 to-violet-600",
        "from-slate-700 to-slate-900", "from-emerald-400 to-teal-500", "from-violet-600 to-fuchsia-600"
    ];
    return gradients[(num - 1) % gradients.length];
};

function renderMatriz() {
    const container = document.getElementById('dynamic-content');
    const sidebar = document.getElementById('sidebar-nav');
    
    let mainHTML = "";
    let sideHTML = "";

    // Pega as chaves sec_1 até sec_24
    for (let i = 1; i <= 27; i++) {
        let dbId = 'sec_' + i;
        if (!globalDB[dbId]) continue;

        let sec = globalDB[dbId];
        let titleParts = sec.title.split('. ');
        let shortTitle = titleParts.slice(1).join('. ') || sec.title;
        let icon = getIconForSection(i);
        let grad = getGradientForSection(i);

        // Sidebar link
        sideHTML += `<li><a href="#sec_${i}" class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">${icon} ${shortTitle}</a></li>`;

        // Content Section
        let contentHTML = "";

        // TRATAMENTOS ESPECIAIS (Escalas, Flashcards, Quiz)
        if (i === 11) {
            contentHTML = renderCalculadoras(sec.list);
        } else if (i === 15) {
            contentHTML = renderFlashcardsGrid();
        } else if (i === 16) {
            contentHTML = renderQuizEngine();
        } else {
            // Lista genérica de conteúdo clínico
            let listHTML = "";
            sec.list.forEach(item => {
                let p = item.split('. ');
                let num = p[0] + '.';
                let txt = p.slice(1).join('. ');
                if(p.length === 1) { num = "•"; txt = item; }
                
                listHTML += `
                    <li class="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                        <span class="font-bold text-violet-600 dark:text-violet-400 min-w-[20px]">${num}</span>
                        <span class="text-slate-700 dark:text-slate-300">${txt}</span>
                    </li>`;
            });
            contentHTML = `<ul class="space-y-3 text-[15px]">${listHTML}</ul>`;
        }

            if (sec.images && sec.images.length > 0) {
                let imgHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">';
                sec.images.forEach(imgUrl => {
                    imgHTML += `<div class="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"><img src="${imgUrl}" alt="Clinical Image" class="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"></div>`;
                });
                imgHTML += '</div>';
                contentHTML += imgHTML;
            }

        // Monta a <details> box (Acordeão)
        // Seção 1 (Definição) começa aberta por padrão
        let isOpen = i === 1 ? "open" : "";

        mainHTML += `
        <section id="sec_${i}" class="scroll-mt-24">
            <details ${isOpen} class="group bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-6 card-hover overflow-hidden">
                <summary class="flex items-center justify-between p-6 sm:p-8 cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} grid place-items-center text-3xl shadow-lg text-white">${icon}</div>
                        <h3 class="text-xl sm:text-2xl font-extrabold">${sec.title}</h3>
                    </div>
                    <svg class="w-5 h-5 text-slate-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <div class="px-6 sm:px-8 pb-8">
                    ${contentHTML}
                </div>
            </details>
        </section>`;
    }

    container.innerHTML = mainHTML;
    sidebar.innerHTML = sideHTML;

    // Reativar script de navegação scroll
    setupScrollSpy();
}

// ----------------------------------------------------
// GERADORES ESPECIAIS (HTML para injeção)
// ----------------------------------------------------

function renderCalculadoras(rulesList) {
    let html = `
        <div class="grid sm:grid-cols-2 gap-4 mb-6">
            <div class="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                <h3 class="font-bold text-lg mb-2 text-rose-800 dark:text-rose-200">LAMS (Los Angeles Motor Scale)</h3>
                <p class="text-sm mb-4">Escore ≥ 4 indica LVO (Oclusão Grande Vaso).</p>
                <label class="block text-sm font-semibold mb-1">Face:</label>
                <select id="lams-f" class="w-full p-2 mb-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                    <option value="0">0 - Normal</option><option value="1">1 - Assimetria</option>
                </select>
                <label class="block text-sm font-semibold mb-1">Braços:</label>
                <select id="lams-b" class="w-full p-2 mb-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                    <option value="0">0 - Normal</option><option value="1">1 - Queda lenta</option><option value="2">2 - Queda rápida</option>
                </select>
                <label class="block text-sm font-semibold mb-1">Pernas:</label>
                <select id="lams-p" class="w-full p-2 mb-4 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                    <option value="0">0 - Normal</option><option value="1">1 - Queda lenta</option><option value="2">2 - Queda rápida</option>
                </select>
                <button onclick="calcLAMS()" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition">Calcular LAMS</button>
                <div id="lams-res" class="mt-4 text-center font-bold text-lg"></div>
            </div>

            <div class="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
                <h3 class="font-bold text-lg mb-2 text-indigo-800 dark:text-indigo-200">Classificador NIHSS Rápido</h3>
                <p class="text-sm mb-4">Digite o total (0 a 42) para triagem clínica.</p>
                <input type="number" id="nihss-val" placeholder="Total NIHSS" class="w-full p-3 mb-4 text-lg rounded-xl border dark:bg-slate-800 dark:border-slate-700">
                <button onclick="calcNIHSS()" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">Classificar Gravidade</button>
                <div id="nihss-res" class="mt-4 text-center font-bold text-lg"></div>
            </div>
        </div>
    `;

    // Lista de regras de escalas adicionais
    let regrasHtml = "";
    rulesList.forEach(item => {
        regrasHtml += `<li class="flex gap-2 p-2"><span class="font-bold text-violet-600">✓</span><span>${item}</span></li>`;
    });
    
    html += `<div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
        <p class="font-bold mb-2">Regras Adicionais de Escalas:</p>
        <ul class="text-[14px]">${regrasHtml}</ul></div>`;

    return html;
}

window.calcLAMS = function() {
    const total = parseInt(document.getElementById('lams-f').value) + parseInt(document.getElementById('lams-b').value) + parseInt(document.getElementById('lams-p').value);
    const res = document.getElementById('lams-res');
    if (total >= 4) {
        res.innerHTML = `LAMS: ${total} pontos <br> <span class="text-rose-600 dark:text-rose-400 mt-1 block">⚠️ Alto risco de LVO!</span>`;
    } else {
        res.innerHTML = `LAMS: ${total} pontos <br> <span class="text-emerald-600 dark:text-emerald-400 mt-1 block">Baixo risco de LVO</span>`;
    }
}

window.calcNIHSS = function() {
    const val = parseInt(document.getElementById('nihss-val').value) || 0;
    const res = document.getElementById('nihss-res');
    if(val > 0 && val < 5) res.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">AVC Leve (Minor)</span>`;
    else if(val >= 5 && val <= 15) res.innerHTML = `<span class="text-amber-600 dark:text-amber-400">AVC Moderado</span>`;
    else if(val > 15) res.innerHTML = `<span class="text-rose-600 dark:text-rose-400">AVC Grave (Alta morbidade)</span>`;
    else res.innerHTML = "Valor inválido";
}

function renderFlashcardsGrid() {
    let html = `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">`;
    globalDB.sec_15.fc_data.forEach(fc => {
        // Flashcard Tailwind UI (com flip animation CSS)
        html += `
        <div class="flashcard cursor-pointer h-36" onclick="this.classList.toggle('flipped')">
            <div class="flash-inner relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]">
                <div class="absolute inset-0 backface-hidden p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white grid place-items-center text-center font-bold text-sm leading-snug shadow-md">
                    ${fc.front}
                </div>
                <div class="absolute inset-0 backface-hidden [transform:rotateY(180deg)] p-5 rounded-2xl bg-slate-800 dark:bg-slate-950 text-white grid place-items-center text-center font-extrabold text-base leading-tight shadow-md border border-slate-700">
                    ${fc.back}
                </div>
            </div>
        </div>`;
    });
    html += `</div><p class="text-xs text-slate-500 mt-4 font-semibold text-center">💡 Clique nos cards para revelar a resposta (ADHD-friendly: repetição ativa)</p>`;
    return html;
}

// Variável de estado do quiz
let currentQuizIndex = 0;

function renderQuizEngine() {
    // Retorna a estrutura âncora do quiz, e engatilha o update
    setTimeout(() => updateQuizView(), 100);
    return `
        <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div class="flex justify-between items-center mb-4">
                <span class="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Simulado TEMI</span>
                <span id="quiz-count" class="font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full text-xs"></span>
            </div>
            <h3 id="quiz-question" class="text-lg font-bold mb-6 leading-relaxed text-slate-800 dark:text-white"></h3>
            <div id="quiz-options" class="space-y-3"></div>
            
            <!-- Caixa de Feedback Escondida -->
            <div id="quiz-feedback" class="hidden mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <p class="font-bold text-amber-800 dark:text-amber-200 mb-1">Gabarito e Comentário:</p>
                <p id="quiz-feedback-text" class="text-sm text-slate-700 dark:text-slate-300"></p>
            </div>

            <div class="flex justify-between mt-8">
                <button onclick="quizNav(-1)" class="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition">⬅️ Ant</button>
                <button onclick="quizNav(1)" class="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition">Próx ➡️</button>
            </div>
        </div>
    `;
}

window.updateQuizView = function() {
    const qData = globalDB.sec_16.quiz_data;
    if(currentQuizIndex < 0) currentQuizIndex = 0;
    if(currentQuizIndex >= qData.length) currentQuizIndex = qData.length - 1;

    const q = qData[currentQuizIndex];
    document.getElementById('quiz-count').textContent = `Q ${currentQuizIndex + 1} de ${qData.length}`;
    document.getElementById('quiz-question').textContent = q.q;
    
    let optsHTML = "";
    q.opts.forEach((opt, idx) => {
        optsHTML += `<button id="opt-${idx}" onclick="checkQuizAnswer(${idx}, ${q.ans})" class="w-full text-left p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-violet-500 hover:shadow-md transition text-[15px]">${opt}</button>`;
    });
    
    document.getElementById('quiz-options').innerHTML = optsHTML;
    document.getElementById('quiz-feedback').classList.add('hidden');
}

window.checkQuizAnswer = function(selectedIdx, correctIdx) {
    const q = globalDB.sec_16.quiz_data[currentQuizIndex];
    
    // Desativar botões temporariamente
    for(let i=0; i<q.opts.length; i++) {
        let btn = document.getElementById(`opt-${i}`);
        btn.disabled = true;
        if(i === correctIdx) {
            btn.classList.add('bg-emerald-50', 'dark:bg-emerald-900/30', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
        } else if (i === selectedIdx && selectedIdx !== correctIdx) {
            btn.classList.add('bg-rose-50', 'dark:bg-rose-900/30', 'border-rose-500', 'text-rose-700', 'dark:text-rose-300');
        }
    }

    const feedBox = document.getElementById('quiz-feedback');
    const feedText = document.getElementById('quiz-feedback-text');
    feedText.textContent = q.feed;
    feedBox.classList.remove('hidden');
}

window.quizNav = function(dir) {
    currentQuizIndex += dir;
    updateQuizView();
}

// Sistema de monitoramento de rolagem para ativar link da barra lateral
function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (pageYOffset >= top) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('bg-violet-100', link.getAttribute('href') === '#' + current);
            link.classList.toggle('dark:bg-violet-900/30', link.getAttribute('href') === '#' + current);
            link.classList.toggle('font-bold', link.getAttribute('href') === '#' + current);
            link.classList.toggle('text-violet-900', link.getAttribute('href') === '#' + current);
            link.classList.toggle('dark:text-violet-100', link.getAttribute('href') === '#' + current);
        });
    });
}

// Iniciar Motor assim que o documento carregar
document.addEventListener('DOMContentLoaded', renderMatriz);
