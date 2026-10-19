import { SOURCES } from './clinical-engine.mjs?v=73a92287e43bc300';
import { DPOC_LEARNING } from './learning-dpoc.mjs?v=133ae5c0be664985';
import { PAC_LEARNING } from './learning-pac.mjs?v=a25fcb6a94674d4a';
import { buildExam, gradeExam, remainingSeconds, scheduleReview, selectDueCards,
  loadProgress, serializeProgress, nextParticleIndex } from './learning-engine.mjs?v=7f9a31f7e150cdf5';

const BANK = { dpoc: DPOC_LEARNING, pac: PAC_LEARNING };
const ALL_CASES = [...DPOC_LEARNING.cases, ...PAC_LEARNING.cases];
const CARD_IDS = [...DPOC_LEARNING.flashcards, ...PAC_LEARNING.flashcards].map(c => c.id);
const STORAGE_KEY = 'turbo-temi-pulmao-revisao-v1';
const PHASES = { contexto: '01 · Contexto', mecanismo: '02 · Mecanismo', decisao: '03 · Decisão', transferencia: '04 · Transferência' };
const MODES = [['flow', '🔬 Microfluxo'], ['cases', '🩺 Casos'], ['cards', '🧠 Flashcards'], ['exam', '⏱ Simulado']];
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clock = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const refs = keys => [...new Set(keys)].map(key => SOURCES[key] ? `<a href="${esc(SOURCES[key].url)}" target="_blank" rel="noopener noreferrer">${esc(SOURCES[key].title)} ↗</a>` : '').join(' · ');
const action = (name, label, extra = '') => `<button type="button" data-learn="${name}" ${extra}>${label}</button>`;

export function initLearning(root) {
  let topic = 'dpoc', mode = 'flow', visible = false, notice = '', storageOK = true;
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch { storageOK = false; }
  const progress = loadProgress(raw, CARD_IDS);
  const flow = { dpoc: { index: 0, cycle: 1, revealed: false }, pac: { index: 0, cycle: 1, revealed: false } };
  let auto = false, cadence = 30, flowDeadline = null;
  let caseIndex = 0, caseAnswer = null, cardRevealed = false;
  let cards = selectDueCards(BANK[topic].flashcards, progress, Date.now());
  let exam = null;
  const examDraft = { topic: 'dpoc', count: 6, minutes: 10 };

  root.innerHTML = `<div class="learn-intro"><div><p class="eyebrow">TURBO TEMI 360X · TREINO EM MICROPARTÍCULAS</p><h2 id="learn-heading">Uma decisão. Um comentário. O próximo passo.</h2><p>12 casos autorais · 24 flashcards · 48 micropartículas. Escolha DPOC ou pneumonia na lateral.</p></div><span class="learn-badge">UM PASSO POR VEZ</span></div>
    <nav class="learn-modes" aria-label="Formato de estudo">${MODES.map(([id, label]) => `<button type="button" data-learn-mode="${id}" aria-pressed="${id === mode}">${label}</button>`).join('')}</nav>
    <p class="learn-notice" id="learn-notice" role="status"></p><div id="learn-body"></div>
    <details class="learn-method"><summary>🔬 Como funciona o modelo microparticulado progressivo?</summary><div><p>O fluxo transforma um tópico em quatro partículas: contexto → mecanismo → decisão → transferência. Pense antes de revelar; confira o comentário e siga na mesma tela. Ao terminar, o percurso recomeça sem tela de bloqueio.</p><p>A citometria de fluxo inspira a metáfora visual: partículas passam por uma janela de atenção. É uma organização didática autoral, não um exame nem um método validado especificamente para TDAH.</p><p>O avanço automático é opcional. Os flashcards usam recuperação ativa e revisão espaçada; os intervalos de 5 minutos, 1 dia e progressão até 30 dias são escolhas desta plataforma, ajustáveis em versões futuras.</p><p>Base pedagógica: <a href="https://doi.org/10.1126/science.1152408" target="_blank" rel="noopener noreferrer">Karpicke e Roediger, 2008 ↗</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/39250798/" target="_blank" rel="noopener noreferrer">Estudo de repetição espaçada em médicos, 2024 ↗</a>.</p></div></details>
    <p class="learn-footnote">Questões autorais para preparação TEMI; não são questões oficiais da AMIB. Casos inteiramente fictícios, derivados das referências do módulo. Somente o agendamento dos flashcards fica salvo neste navegador; respostas dos casos e simulados ficam nesta sessão.</p>`;

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, serializeProgress(progress)); }
    catch { storageOK = false; }
  }
  function pause(message = '') {
    let changed = false;
    if (auto) { auto = false; flowDeadline = null; changed = true; }
    if (exam?.running) {
      exam.remainingMs = Math.max(0, exam.deadline - Date.now());
      exam.running = false;
      if (!exam.remainingMs) finishExam('Tempo encerrado');
      changed = true;
    }
    if (changed && message) notice = message;
  }
  function nextParticle() {
    const current = flow[topic], length = BANK[topic].particles.length;
    current.index = nextParticleIndex(current.index, length);
    if (current.index === 0) current.cycle++;
    current.revealed = false;
  }
  function flowHTML() {
    const current = flow[topic], particles = BANK[topic].particles, p = particles[current.index];
    return `<section class="learn-card" aria-labelledby="particle-title"><div class="learn-meta"><span>PARTÍCULA ${current.index + 1} / ${particles.length} · CICLO ${current.cycle}</span><span>${esc(p.topic)} · nível ${p.level}</span></div>
      <ol class="particle-stream" aria-label="Fases do percurso">${Object.entries(PHASES).map(([key, label]) => `<li ${key === p.phase ? 'aria-current="step"' : ''}><span aria-hidden="true">●</span>${esc(label)}</li>`).join('')}</ol>
      <progress value="${current.index + 1}" max="${particles.length}" aria-label="Posição no percurso"></progress><h3 id="particle-title">${esc(p.title)}</h3><p class="learn-prompt">${esc(p.prompt)}</p>
      ${current.revealed ? `<div class="learn-answer"><strong>Conecte a ideia</strong><p>${esc(p.answer)}</p><p class="learn-anchor">↳ ${esc(p.takeaway)}</p><p class="learn-refs">${refs(p.sources)}</p></div>` : '<p class="muted">Recupere a resposta mentalmente antes de revelar.</p>'}
      <div class="learn-actions">${action('flow-reveal', current.revealed ? '✓ Comentário revelado' : 'Revelar comentário', current.revealed ? 'disabled' : 'class="primary"')}${action('flow-next', 'Próxima partícula →')}</div>
      <div class="flow-controls"><label for="flow-cadence">Tempo por pergunta / comentário<select id="flow-cadence">${[10, 20, 30, 45, 60].map(n => `<option value="${n}" ${cadence === n ? 'selected' : ''}>${n} segundos</option>`).join('')}</select></label>${action('flow-auto', auto ? 'Ⅱ Pausar fluxo' : '▶ Fluxo contínuo', `aria-pressed="${auto}"`)}<output id="flow-clock" aria-live="off">${auto ? 'Em fluxo' : 'No seu ritmo'}</output></div><p class="muted">No automático, pergunta e comentário se alternam. Não há pontuação por exposição. Sair desta camada pausa o fluxo.</p></section>`;
  }
  function explanations(q, selected) {
    return `<div class="choice-comments">${q.choices.map((choice, i) => `<article class="choice-comment ${i === q.answer ? 'correct' : ''}"><h4>${String.fromCharCode(65 + i)} · ${i === q.answer ? '✓ Correta' : 'Por que não'}${selected === i ? ' · sua escolha' : ''}</h4><p>${esc(choice.text)}</p><p class="muted">${esc(choice.why)}</p></article>`).join('')}</div><p class="learn-anchor">🧠 ${esc(q.takeaway)}</p><p class="learn-refs">${refs(q.sources)}</p>`;
  }
  function casesHTML() {
    const cases = BANK[topic].cases, q = cases[caseIndex];
    return `<section class="learn-card"><label for="case-select">Escolha um caso<select id="case-select">${cases.map((item, i) => `<option value="${i}" ${caseIndex === i ? 'selected' : ''}>${i + 1}. ${esc(item.title)}</option>`).join('')}</select></label><div class="learn-meta"><span>CASO ${caseIndex + 1} / ${cases.length}</span><span>${esc(q.topic)} · nível ${q.level}</span></div><h3>${esc(q.title)}</h3><p class="case-stem">${esc(q.stem)}</p><h4>${esc(q.question)}</h4>
      <div class="learn-choices" role="group" aria-label="Alternativas do caso">${q.choices.map((choice, i) => `<button type="button" data-learn="case-answer" data-answer="${i}" aria-pressed="${caseAnswer === i}" ${caseAnswer !== null ? 'disabled' : ''}><b>${String.fromCharCode(65 + i)}</b><span>${esc(choice.text)}</span></button>`).join('')}</div>
      ${caseAnswer !== null ? `<div class="learn-feedback" role="status">${caseAnswer === q.answer ? '✓ Boa decisão.' : '↻ Vamos revisar o raciocínio.'} Confira as quatro alternativas.</div>${explanations(q, caseAnswer)}` : '<p class="muted">Uma resposta libera o comentário de todas as alternativas.</p>'}
      <div class="learn-actions">${action('case-prev', '← Caso anterior')}${action('case-next', 'Próximo caso →', 'class="primary"')}</div></section>`;
  }
  function cardsHTML() {
    if (!cardRevealed) cards = selectDueCards(BANK[topic].flashcards, progress, Date.now());
    const card = cards[0], saved = progress.cards[card.id];
    const due = !saved ? 'Nova' : saved.dueAt <= Date.now() ? 'Revisão disponível' : `Próxima revisão: ${new Date(saved.dueAt).toLocaleString('pt-BR')}`;
    const reviewed = BANK[topic].flashcards.filter(c => progress.cards[c.id]).length;
    return `<section class="learn-card"><div class="learn-meta"><span>${cards.length} CARDS NESTE TEMA · ${reviewed} COM AGENDAMENTO</span><span>${esc(due)}</span></div><p class="eyebrow">${esc(card.topic)} · NÍVEL ${card.level}</p><h3>${esc(card.front)}</h3>
      ${cardRevealed ? `<div class="learn-answer"><p>${esc(card.back)}</p><p class="learn-anchor">⚠️ ${esc(card.pitfall)}</p><p class="learn-refs">${refs(card.sources)}</p></div><p class="muted">Avalie a lembrança que teve antes de virar o card.</p><div class="learn-actions">${action('card-again', '↻ Rever em 5 min')}${action('card-good', '✓ Lembrei · espaçar revisão', 'class="primary"')}</div>` : `<p class="muted">Tente responder sem olhar. Uma ideia por cartão.</p>${action('card-reveal', 'Virar flashcard', 'class="primary"')}`}
      <p class="muted">Cards vencidos aparecem antes dos novos. Ao terminar a fila, você pode continuar em revisão livre, mesmo antes da data agendada.</p></section>`;
  }
  function examHTML() {
    if (!exam) return `<section class="learn-card"><p class="eyebrow">SIMULADO AUTORAL · RESPOSTAS COMENTADAS AO FINAL</p><h3>Um bloco de atenção por vez.</h3><form id="exam-config"><div class="exam-config"><label for="exam-topic">Tema<select id="exam-topic"><option value="${topic}" ${examDraft.topic === topic ? 'selected' : ''}>${topic === 'dpoc' ? 'DPOC' : 'Pneumonia comunitária'}</option><option value="mixed" ${examDraft.topic === 'mixed' ? 'selected' : ''}>Misto · DPOC + pneumonia</option></select></label><label for="exam-count">Tamanho<select id="exam-count"><option value="6" ${examDraft.count === 6 ? 'selected' : ''}>Até 6 questões</option><option value="12" ${examDraft.count === 12 ? 'selected' : ''}>Até 12 questões · banco misto</option></select></label><label for="exam-minutes">Tempo · minutos<input id="exam-minutes" type="number" min="1" max="60" step="1" value="${examDraft.minutes}" required></label></div><p class="muted">6 questões por tema; 12 no banco misto. Você pode pausar. Tempo encerrado corrige o bloco; questões em branco contam como não respondidas.</p><button class="primary" type="submit">▶ Iniciar simulado</button></form></section>`;
    if (exam.result) return `<section class="learn-card"><p class="eyebrow">${esc(exam.reason)} · ${exam.label}</p><h3>Seu treino: ${exam.result.correct} / ${exam.result.total}</h3><p class="exam-score">${exam.result.percentage}%</p><p>${exam.result.unanswered} sem resposta. Use os comentários para escolher o próximo foco.</p><div class="exam-review">${exam.questions.map((q, i) => { const item = exam.result.items[i]; return `<details><summary>${item.correct ? '✓' : '↻'} ${i + 1}. ${esc(q.title)} · ${item.selected === null ? 'sem resposta' : item.correct ? 'acerto' : 'revisar'}</summary><div><p>${esc(q.stem)}</p><p><strong>${esc(q.question)}</strong></p>${explanations(q, item.selected)}</div></details>`; }).join('')}</div><div class="learn-actions">${action('exam-new', 'Preparar outro simulado', 'class="primary"')}${action('exam-to-cards', 'Revisar flashcards')}</div></section>`;
    const q = exam.questions[exam.index];
    return `<section class="learn-card"><div class="exam-toolbar"><div><p class="eyebrow">${exam.label}</p><h3>Questão ${exam.index + 1} / ${exam.questions.length}</h3></div><output id="exam-clock" aria-label="Tempo restante" aria-live="off">${clock(remainingSeconds(exam.running ? exam.deadline : Date.now() + exam.remainingMs))}</output>${action('exam-pause', exam.running ? 'Ⅱ Pausar' : '▶ Retomar', `aria-pressed="${!exam.running}"`)}</div>
      <p>${Object.keys(exam.answers).length} respondidas · ${exam.running ? 'Em andamento' : 'Cronômetro pausado'}</p><progress value="${Object.keys(exam.answers).length}" max="${exam.questions.length}" aria-label="Questões respondidas"></progress><h4>${esc(q.title)}</h4><p class="case-stem">${esc(q.stem)}</p><h4>${esc(q.question)}</h4><div class="learn-choices" role="group" aria-label="Alternativas do simulado">${q.choices.map((choice, i) => `<button type="button" data-learn="exam-answer" data-answer="${i}" aria-pressed="${exam.answers[q.id] === i}" ${!exam.running ? 'disabled' : ''}><b>${String.fromCharCode(65 + i)}</b><span>${esc(choice.text)}</span></button>`).join('')}</div><div class="learn-actions">${action('exam-prev', '← Anterior', exam.index === 0 ? 'disabled' : '')}${action('exam-next', 'Próxima →', exam.index === exam.questions.length - 1 ? 'disabled' : '')}${action('exam-finish', 'Finalizar e corrigir', 'class="primary"')}</div><p class="muted">Você pode alterar uma resposta antes de finalizar. Os comentários aparecem na correção.</p></section>`;
  }
  function render() {
    const active = document.activeElement;
    const focusAction = root.contains(active) ? active?.dataset?.learn : null;
    const focusAnswer = active?.dataset?.answer;
    root.querySelectorAll('[data-learn-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.learnMode === mode));
    root.querySelector('#learn-notice').textContent = [notice, !storageOK ? 'Armazenamento local indisponível: a revisão funciona nesta sessão.' : ''].filter(Boolean).join(' ');
    root.querySelector('#learn-body').innerHTML = ({ flow: flowHTML, cases: casesHTML, cards: cardsHTML, exam: examHTML })[mode]();
    if (focusAction) root.querySelector(`[data-learn="${focusAction}"]${focusAnswer !== undefined ? `[data-answer="${focusAnswer}"]` : ''}:not([disabled])`)?.focus({ preventScroll: true });
  }
  function finishExam(reason) {
    if (!exam || exam.result) return;
    exam.running = false;
    exam.remainingMs = 0;
    exam.result = gradeExam(exam.questions, exam.answers);
    exam.reason = reason;
    notice = reason === 'Tempo encerrado' ? 'Tempo encerrado. O simulado foi corrigido.' : 'Simulado corrigido. Confira os comentários.';
  }
  root.addEventListener('submit', event => {
    if (event.target.id !== 'exam-config') return;
    event.preventDefault();
    const minutes = Number(root.querySelector('#exam-minutes').value);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 60) { notice = 'Informe de 1 a 60 minutos inteiros.'; render(); return; }
    const scope = root.querySelector('#exam-topic').value;
    const questions = buildExam({ bank: ALL_CASES, topic: scope, count: Number(root.querySelector('#exam-count').value) });
    exam = { questions, answers: {}, index: 0, running: true, deadline: Date.now() + minutes * 60000, remainingMs: minutes * 60000, result: null, label: scope === 'mixed' ? 'DPOC + PAC' : scope === 'dpoc' ? 'DPOC' : 'Pneumonia comunitária' };
    notice = ''; render();
  });
  root.addEventListener('change', event => {
    if (event.target.id === 'exam-topic') examDraft.topic = event.target.value;
    if (event.target.id === 'exam-count') examDraft.count = Number(event.target.value);
    if (event.target.id === 'exam-minutes') { const n = Number(event.target.value); if (Number.isInteger(n) && n >= 1 && n <= 60) examDraft.minutes = n; }
    if (event.target.id === 'flow-cadence') { cadence = Number(event.target.value); if (auto) flowDeadline = Date.now() + cadence * 1000; }
    if (event.target.id === 'case-select') { caseIndex = Number(event.target.value); caseAnswer = null; render(); }
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.dataset.learnMode) { pause(); mode = button.dataset.learnMode; notice = ''; render(); return; }
    const cmd = button.dataset.learn;
    if (!cmd) return;
    notice = '';
    if (cmd === 'flow-reveal') flow[topic].revealed = true;
    if (cmd === 'flow-next') { nextParticle(); if (auto) flowDeadline = Date.now() + cadence * 1000; }
    if (cmd === 'flow-auto') { auto = !auto; flowDeadline = auto ? Date.now() + cadence * 1000 : null; }
    if (cmd === 'case-answer' && caseAnswer === null) caseAnswer = Number(button.dataset.answer);
    if (cmd === 'case-prev' || cmd === 'case-next') { caseIndex = (caseIndex + (cmd === 'case-prev' ? -1 : 1) + BANK[topic].cases.length) % BANK[topic].cases.length; caseAnswer = null; }
    if (cmd === 'card-reveal') cardRevealed = true;
    if (cmd === 'card-again' || cmd === 'card-good') { const card = cards.shift(); progress.cards[card.id] = scheduleReview(progress.cards[card.id], cmd === 'card-again' ? 'again' : 'good', Date.now()); cards.push(card); cardRevealed = false; persist(); notice = 'Revisão agendada. Próximo cartão.'; }
    if (cmd.startsWith('exam-') && exam && !exam.result) {
      if (exam.running && remainingSeconds(exam.deadline) === 0) { finishExam('Tempo encerrado'); render(); return; }
      if (cmd === 'exam-answer' && exam.running) exam.answers[exam.questions[exam.index].id] = Number(button.dataset.answer);
      if (cmd === 'exam-next') exam.index = Math.min(exam.questions.length - 1, exam.index + 1);
      if (cmd === 'exam-prev') exam.index = Math.max(0, exam.index - 1);
      if (cmd === 'exam-pause') { if (exam.running) pause(); else { exam.deadline = Date.now() + exam.remainingMs; exam.running = true; } }
      if (cmd === 'exam-finish') finishExam('Bloco finalizado');
    }
    if (cmd === 'exam-new') exam = null;
    if (cmd === 'exam-to-cards') mode = 'cards';
    render();
  });
  function tick() {
    if (!visible || document.hidden) return;
    const now = Date.now();
    if (mode === 'flow' && auto) {
      if (now >= flowDeadline) { if (flow[topic].revealed) nextParticle(); else flow[topic].revealed = true; flowDeadline = now + cadence * 1000; render(); }
      const out = root.querySelector('#flow-clock');
      if (out) out.textContent = `${remainingSeconds(flowDeadline, now)} s · ${flow[topic].revealed ? 'comentário' : 'pergunta'}`;
    }
    if (mode === 'exam' && exam?.running) {
      const seconds = remainingSeconds(exam.deadline, now);
      if (!seconds) { finishExam('Tempo encerrado'); render(); }
      else { const out = root.querySelector('#exam-clock'); if (out) out.textContent = clock(seconds); }
    }
  }
  let timer = setInterval(tick, 250);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pause('Treino pausado ao sair da página. Retome quando quiser.'); render(); } });
  window.addEventListener('pagehide', () => { pause(); clearInterval(timer); });
  window.addEventListener('pageshow', event => { if (event.persisted) { timer = setInterval(tick, 250); notice = 'Treino pausado após voltar à página.'; render(); } });
  render();
  return {
    setTopic(id) { if (!BANK[id] || topic === id) return; pause('Tema alterado; o treino em andamento foi pausado.'); topic = id; if (examDraft.topic !== 'mixed') examDraft.topic = id; caseIndex = 0; caseAnswer = null; cardRevealed = false; cards = selectDueCards(BANK[id].flashcards, progress, Date.now()); render(); },
    setVisible(value) { visible = value; if (!value) { pause('Treino pausado ao mudar de camada.'); render(); } },
  };
}
