(() => {
  'use strict';

  const DURATION = 4 * 60 * 60 * 1000;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const KEY = 'antigravity:temi-simulado-adulto-2026:v1';
  // Keep a stable form for saved attempts. Only the selected item IDs are read from the bank.
  const ITEM_NUMBERS = [
    1, 4, 10, 16, 40,
    41, 49, 54, 59, 67,
    82, 84, 86, 90, 101,
    121, 124, 135, 138, 146,
    161, 171, 172, 179, 183,
    201, 203, 205, 206, 211,
    245, 255, 259, 261, 268,
    289, 295, 298, 302, 312,
    334, 335, 344, 350, 356,
    361, 364, 371, 374, 399,
    401, 407, 417, 428,
    443, 445, 456, 474,
    481, 485, 489, 504,
    524, 533, 542, 556,
    566, 568, 570, 576,
    607, 616, 625, 629,
    643, 646, 650, 656,
    681, 684, 692, 702,
    721, 723, 733, 751,
    762, 765, 791, 799
  ];
  const FORM_IDS = ITEM_NUMBERS.map(number => `TEMI-800-${String(number).padStart(3, '0')}`);

  const ADDITIONAL_DESCRIPTIONS = {
    'capno:broncoespasmo': 'O capnograma tem subida expiratória lenta e oblíqua, seguida de platô inclinado. O final de cada ciclo retorna à linha de base.',
    'capno:normal': 'O capnograma mostra ciclos repetidos com subida expiratória rápida, platô em torno de 38 mmHg e retorno próximo de zero a cada inspiração.',
    'capno:rcp_baixa': 'Nos ciclos do capnograma, os valores ao fim da expiração permanecem próximos de 8 mmHg.',
    'capno:rosc': 'No capnograma, o valor ao fim da expiração sobe de aproximadamente 11 para 42 mmHg entre o primeiro e o segundo ciclo.',
    'rx:sdra': 'Radiografia de tórax esquemática em projeção AP com opacidades difusas nos dois campos pulmonares.',
    'rx:eap': 'Radiografia de tórax esquemática em projeção AP com opacidades peri-hilares e basais bilaterais e silhueta cardíaca aumentada no desenho.',
    'tc:hiv': 'Corte axial esquemático de tomografia sem contraste com material hiperdenso nos dois ventrículos laterais.',
    'tc:hed': 'Corte axial esquemático de tomografia sem contraste com coleção hiperdensa lentiforme à esquerda e desvio das estruturas centrais no sentido oposto.',
    'pic:complacencia_baixa': 'Traçado de pressão intracraniana com três picos por ciclo. O segundo pico, P2, é mais alto que o primeiro, P1.',
    'rotem:normal': 'Tromboelastometria rotacional. EXTEM: CT 60 segundos, A10 48 milímetros, ML 5%. FIBTEM: CT 60 segundos, A10 14 milímetros, ML 3%.'
  };

  function shuffled(input, seed) {
    const values = [...input];
    let state = seed;
    for (let index = values.length - 1; index > 0; index -= 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const target = Math.floor(state / 0x100000000 * (index + 1));
      [values[index], values[target]] = [values[target], values[index]];
    }
    return values;
  }

  function buildForm(questions) {
    const byId = new Map(questions.map(question => [question.id, question]));
    return shuffled(FORM_IDS, 20261119).map(id => {
      const question = byId.get(id);
      if (!question || !question.options || !question.rationales) throw new Error('Questão da forma indisponível.');
      const entries = Object.entries(question.options);
      const incorrect = entries.filter(([key]) => key !== question.answer);
      if (entries.length !== 5 || incorrect.length !== 4 || !question.rationales[question.answer]?.startsWith('Correta.') ||
          incorrect.some(([key]) => !question.rationales[key]?.startsWith('Incorreta.'))) {
        throw new Error('Gabarito de origem incompatível com a forma.');
      }
      const number = Number(id.slice(-3));
      const omit = incorrect[number % incorrect.length][0];
      const options = shuffled(entries.filter(([key]) => key !== omit), 301096 + number * 4793).map(([key, text], index) => ({
        letter: LETTERS[index],
        text,
        rationale: question.rationales[key],
        correct: key === question.answer
      }));
      return { question, options, answer: options.find(option => option.correct).letter };
    });
  }

  function newAttempt(now) {
    return { startedAt: now, submittedAt: null, position: 0, answers: {}, flags: [] };
  }

  function readAttempt(value) {
    if (!value || !Number.isSafeInteger(value.startedAt) || value.startedAt < 0 ||
        value.startedAt > Number.MAX_SAFE_INTEGER - DURATION) return null;
    const position = Number.isInteger(value.position) && value.position >= 0 && value.position < FORM_IDS.length ? value.position : 0;
    const answers = {};
    for (const id of FORM_IDS) {
      if (LETTERS.includes(value.answers?.[id])) answers[id] = value.answers[id];
    }
    const flags = Array.isArray(value.flags) ? FORM_IDS.filter(id => value.flags.includes(id)) : [];
    const submittedAt = Number.isSafeInteger(value.submittedAt) && value.submittedAt >= value.startedAt
      ? Math.min(value.submittedAt, value.startedAt + DURATION) : null;
    return { startedAt: value.startedAt, submittedAt, position, answers, flags };
  }

  function remaining(attempt, now) {
    return Math.max(0, Math.min(DURATION, attempt.startedAt + DURATION - now));
  }

  function grade(form, answers) {
    return form.reduce((count, item) => {
      const answer = answers[item.question.id];
      if (!answer) count.blank += 1;
      else if (answer === item.answer) count.correct += 1;
      else count.incorrect += 1;
      return count;
    }, { correct: 0, incorrect: 0, blank: 0 });
  }

  function clockText(milliseconds) {
    const seconds = Math.ceil(milliseconds / 1000);
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
      .map(unit => String(unit).padStart(2, '0')).join(':');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DURATION, FORM_IDS, buildForm, newAttempt, readAttempt, remaining, grade, clockText };
  }
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  function init() {
    const $ = id => document.getElementById(id);
    const appError = $('app-error');
    let form;
    try {
      if (typeof TEMI_800_2026_QBANK === 'undefined' || !window.Temi800Figuras) throw new Error('Banco indisponível.');
      form = buildForm(TEMI_800_2026_QBANK.questions);
    } catch (_) {
      appError.textContent = 'O banco de questões está indisponível. Recarregue a página para tentar novamente.';
      appError.hidden = false;
      return;
    }

    const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
    function applyTheme() {
      let prefs = {};
      try { prefs = JSON.parse(localStorage.getItem('antigravity:a11y:v1')) || {}; } catch (_) {}
      const light = prefs.contrast !== true && (prefs.theme === 'light' ||
        (prefs.theme === 'system' && !darkPreference.matches) || (!prefs.theme && prefs.clarity === true));
      document.documentElement.classList.toggle('light', light);
      document.documentElement.classList.toggle('contrast', prefs.contrast === true);
    }
    applyTheme();
    darkPreference.addEventListener('change', applyTheme);

    const optionGroup = $('options');
    const questionTitle = $('question-title');
    const confirmation = $('confirm-submit');
    const submitButton = $('submit');
    const clearButton = $('clear-answer');
    let available = true;
    let attempt = load();
    let interval = null;
    let lastWarning = null;

    function storageNotice(message) {
      $('storage-notice').textContent = message;
      $('storage-notice').hidden = false;
    }

    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const valid = readAttempt(JSON.parse(raw));
        if (valid) return valid;
      } catch (error) {
        if (!(error instanceof SyntaxError)) {
          available = false;
          storageNotice('O navegador bloqueou o armazenamento. O progresso fica disponível nesta aba até fechar ou recarregar.');
          return null;
        }
      }
      storageNotice('Não foi possível restaurar a tentativa anterior. Você pode iniciar uma nova.');
      return null;
    }

    function save() {
      if (!available) return;
      try {
        localStorage.setItem(KEY, JSON.stringify(attempt));
        $('storage-notice').hidden = true;
      } catch (_) {
        available = false;
        storageNotice('Não foi possível salvar o progresso. A tentativa permanece aberta nesta aba.');
      }
    }

    function sync() {
      if (!available) return;
      const latest = load();
      if (latest && latest.startedAt === attempt?.startedAt) {
        attempt.answers = latest.answers;
        attempt.flags = latest.flags;
        attempt.submittedAt = latest.submittedAt;
      }
    }

    const positionButtons = form.map((_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      const symbols = document.createElement('span');
      symbols.setAttribute('aria-hidden', 'true');
      button.append(String(index + 1), symbols);
      button.addEventListener('click', () => navigate(index));
      return button;
    });
    $('positions').replaceChildren(...positionButtons);

    function renderStatus() {
      const answered = Object.keys(attempt.answers).length;
      const finished = attempt.submittedAt !== null;
      $('progress').textContent = `${answered} de ${form.length}`;
      $('sheet-summary').textContent = finished ? 'Cartão-resposta para revisão' : `Cartão-resposta · ${answered} de ${form.length} respondidas`;
      positionButtons.forEach((button, position) => {
        const id = form[position].question.id;
        const answeredHere = Boolean(attempt.answers[id]);
        const marked = attempt.flags.includes(id);
        const marks = [answeredHere ? '✓' : '', marked ? '•' : ''].join('').trim();
        button.querySelector('span').textContent = marks;
        button.dataset.answered = String(answeredHere);
        button.setAttribute('aria-label', `Questão ${position + 1}, ${answeredHere ? 'respondida' : 'sem resposta'}${marked ? ', marcada para revisar' : ''}`);
        if (position === attempt.position) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
    }

    function renderFigure(question) {
      const image = question.image;
      const visual = $('visual');
      const rendered = image && window.Temi800Figuras.render(image, question.id);
      $('figure').hidden = !rendered;
      visual.replaceChildren();
      if (!rendered) return;
      const illustration = document.createElement('div');
      illustration.setAttribute('aria-hidden', 'true');
      illustration.innerHTML = rendered;
      visual.append(illustration);
      const fallback = /interpretação descrita no comentário/i.test(image.alt) ? image.caption : image.alt;
      const description = window.Temi800Figuras.describe?.(image) || ADDITIONAL_DESCRIPTIONS[`${image.kind}:${image.key}`] ||
        fallback || 'Figura esquemática do caso.';
      visual.setAttribute('role', 'img');
      visual.setAttribute('aria-label', description);
    }

    function showOptions(item) {
      const selected = attempt.answers[item.question.id];
      optionGroup.replaceChildren(...item.options.map(option => {
        const label = document.createElement('label');
        label.className = 'choice';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = option.letter;
        input.checked = option.letter === selected;
        const text = document.createElement('span');
        const letter = document.createElement('strong');
        letter.textContent = `${option.letter}.`;
        text.append(letter, ` ${option.text}`);
        label.append(input, text);
        return label;
      }));
      clearButton.disabled = !selected;
      renderFlag(item.question.id);
    }

    function renderFlag(id) {
      $('flag').setAttribute('aria-pressed', String(attempt.flags.includes(id)));
    }

    function renderCorrection(item) {
      const userAnswer = attempt.answers[item.question.id];
      const verdict = userAnswer ? `Sua resposta foi ${userAnswer}.` : 'Questão sem resposta.';
      $('correct-answer').textContent = `${verdict} Gabarito: ${item.answer}.`;
      $('rationales').replaceChildren(...item.options.map(option => {
        const row = document.createElement('li');
        const text = document.createElement('strong');
        text.textContent = option.text;
        row.append(text, document.createElement('br'), option.rationale);
        return row;
      }));
      $('synthesis').textContent = item.question.synthesis;
      const sources = [];
      for (const ref of item.question.sourceRefs || []) {
        const source = TEMI_800_2026_QBANK.sources[ref];
        if (!source?.url?.startsWith('https://')) continue;
        const element = document.createElement('li');
        const link = document.createElement('a');
        link.href = source.url;
        link.textContent = source.label;
        element.append(link);
        sources.push(element);
      }
      $('sources').replaceChildren(...sources);
      $('sources').hidden = !sources.length;
    }

    function renderQuestion(focus = false) {
      const position = attempt.position;
      const finished = attempt.submittedAt !== null;
      const item = form[position];
      questionTitle.textContent = `Questão ${position + 1} de ${form.length}`;
      $('stem').textContent = item.question.stem;
      renderFigure(item.question);
      $('answer-fields').hidden = finished;
      $('question-tools').hidden = finished;
      $('correction').hidden = !finished;
      if (finished) {
        optionGroup.replaceChildren();
        renderCorrection(item);
      } else {
        showOptions(item);
      }
      $('previous').disabled = position === 0;
      $('next').disabled = position === form.length - 1;
      if (focus) questionTitle.focus();
    }

    function renderAttempt() {
      const finished = attempt?.submittedAt != null;
      $('welcome').hidden = !!attempt;
      $('exam').hidden = !attempt;
      if (!attempt) return;
      $('attempt-summary').hidden = finished;
      $('results').hidden = !finished;
      if (finished) {
        const scores = grade(form, attempt.answers);
        $('score').textContent = `${scores.correct} de ${form.length} acertos (${new Intl.NumberFormat('pt-BR', { style: 'percent' }).format(scores.correct / form.length)})`;
        const status = remaining(attempt, attempt.submittedAt) === 0 ? 'Tempo esgotado.' : 'Tentativa entregue.';
        $('result-detail').textContent = `${status} Erros: ${scores.incorrect}. Em branco: ${scores.blank}.`;
      }
      renderStatus();
      renderQuestion();
    }

    function announce(message) {
      $('announcement').textContent = message;
    }

    function finish(expired) {
      if (!attempt || attempt.submittedAt !== null) return;
      sync();
      if (attempt.submittedAt === null) {
        const deadline = attempt.startedAt + DURATION;
        attempt.submittedAt = expired ? deadline : Math.max(attempt.startedAt, Math.min(Date.now(), deadline));
        save();
      }
      if (confirmation.open) confirmation.close('expired');
      stopTimer();
      renderAttempt();
      $('result-title').focus();
    }

    function tick() {
      if (!attempt || attempt.submittedAt !== null) return;
      const left = remaining(attempt, Date.now());
      const timer = $('timer');
      timer.textContent = clockText(left);
      timer.dataset.ending = String(left <= 10 * 60 * 1000);
      if (!left) {
        finish(true);
        return;
      }
      const warning = left <= 60 * 1000 ? 'Falta menos de um minuto.' : left <= 10 * 60 * 1000 ? 'Faltam menos de dez minutos.' : null;
      if (warning && warning !== lastWarning) announce(warning);
      lastWarning = warning;
    }

    function stopTimer() {
      clearInterval(interval);
      interval = null;
    }

    function startTimer() {
      stopTimer();
      tick();
      if (attempt && attempt.submittedAt === null) interval = setInterval(tick, 1000);
    }

    function navigate(position) {
      sync();
      if (attempt.submittedAt === null && !remaining(attempt, Date.now())) {
        finish(true);
        return;
      }
      attempt.position = position;
      save();
      renderStatus();
      renderQuestion(true);
    }

    function edit(callback) {
      sync();
      if (attempt.submittedAt !== null) {
        renderAttempt();
        return;
      }
      if (!remaining(attempt, Date.now())) {
        finish(true);
        return;
      }
      const id = form[attempt.position].question.id;
      callback(id);
      save();
      renderStatus();
      return id;
    }

    $('start').addEventListener('click', () => {
      attempt = load() || newAttempt(Date.now());
      save();
      renderAttempt();
      startTimer();
      if (attempt.submittedAt === null) questionTitle.focus();
      else $('result-title').focus();
    });
    optionGroup.addEventListener('change', event => {
      if (!(event.target instanceof HTMLInputElement) || !LETTERS.includes(event.target.value)) return;
      const id = edit(id => { attempt.answers[id] = event.target.value; });
      if (id) clearButton.disabled = false;
    });
    clearButton.addEventListener('click', () => {
      const id = edit(id => { delete attempt.answers[id]; });
      if (!id) return;
      const selected = optionGroup.querySelector('input:checked');
      if (selected) selected.checked = false;
      clearButton.disabled = true;
      optionGroup.querySelector('input').focus();
    });
    $('flag').addEventListener('click', () => {
      const id = edit(id => {
        attempt.flags = attempt.flags.includes(id) ? attempt.flags.filter(flag => flag !== id) : [...attempt.flags, id];
      });
      if (id) renderFlag(id);
    });
    $('previous').addEventListener('click', () => navigate(attempt.position - 1));
    $('next').addEventListener('click', () => navigate(attempt.position + 1));
    submitButton.addEventListener('click', () => {
      sync();
      if (attempt.submittedAt !== null) {
        renderAttempt();
        $('result-title').focus();
        return;
      }
      if (!remaining(attempt, Date.now())) {
        finish(true);
        return;
      }
      const answered = Object.keys(attempt.answers).length;
      $('confirm-detail').textContent = `${answered} de ${form.length} questões respondidas. Ao entregar, as respostas ficam bloqueadas e o gabarito é liberado.`;
      confirmation.returnValue = '';
      confirmation.showModal();
    });
    confirmation.addEventListener('close', () => {
      if (confirmation.returnValue === 'confirmed') finish(false);
      else if (attempt?.submittedAt === null) submitButton.focus();
    });
    $('restart').addEventListener('click', () => {
      if (!window.confirm('Substituir a tentativa e o resultado atuais por uma nova tentativa?')) return;
      attempt = newAttempt(Date.now());
      save();
      renderAttempt();
      startTimer();
      questionTitle.focus();
    });
    window.addEventListener('storage', event => {
      if (event.key === 'antigravity:a11y:v1') applyTheme();
      if (event.key !== KEY) return;
      const previouslySubmitted = attempt?.submittedAt;
      attempt = load();
      if (confirmation.open) confirmation.close('sync');
      renderAttempt();
      startTimer();
      if (previouslySubmitted === null && attempt?.submittedAt != null) $('result-title').focus();
    });
    document.addEventListener('visibilitychange', tick);

    renderAttempt();
    startTimer();
  }
})();
