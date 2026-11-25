(() => {
  'use strict';

  const section = document.getElementById('saude-digital');
  if (!section) return;

  const motion = section.querySelector('[data-a11y="motion"]');
  const session = section.querySelector('[data-focus-session]');
  const duration = document.getElementById('digital-focus-duration');
  const clock = session.querySelector('[role="timer"]');
  const status = session.querySelector('[role="status"]');
  const toggle = session.querySelector('[data-focus-start]');
  const reset = session.querySelector('[data-focus-reset]');
  const storageKey = 'antigravity:focus-timer:v1';
  const durations = new Set(Array.from(duration.options, option => Number(option.value)));
  const minute = 60_000;
  const labels = { ready: 'Iniciar', running: 'Pausar', paused: 'Retomar', done: 'Iniciar de novo' };
  const messages = {
    ready: '', running: 'Bloco em andamento.', paused: 'Bloco pausado.',
    done: 'Bloco concluído. Faça uma pausa se desejar.'
  };

  function ready(minutes) {
    return { mode: 'ready', minutes, remaining: minutes * minute, endsAt: 0 };
  }

  function load() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      if (saved && durations.has(saved.minutes) && Object.prototype.hasOwnProperty.call(labels, saved.mode) &&
          Number.isFinite(saved.remaining) && saved.remaining >= 0 && saved.remaining <= saved.minutes * minute &&
          Number.isFinite(saved.endsAt) && (saved.mode !== 'running' || saved.endsAt > 0)) return saved;
    } catch (_) { /* O temporizador funciona durante a visita sem acesso ao armazenamento. */ }
    return null;
  }

  let state = load() || ready(Number(duration.value));
  let ticker;

  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify(state)); }
    catch (_) { /* A contagem desta página continua normalmente. */ }
  }

  function remainingTime() {
    if (state.mode !== 'running') return state.remaining;
    return Math.max(0, Math.min(state.remaining, state.endsAt - Date.now()));
  }

  function renderClock(remaining) {
    const seconds = Math.ceil(remaining / 1000);
    const time = [Math.floor(seconds / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
    if (clock.textContent !== time) clock.textContent = time;
  }

  function renderState() {
    duration.value = String(state.minutes);
    duration.disabled = state.mode === 'running' || state.mode === 'paused';
    toggle.textContent = labels[state.mode];
    reset.disabled = state.mode === 'ready';
    if (status.textContent !== messages[state.mode]) status.textContent = messages[state.mode];
    renderClock(remainingTime());
  }

  function tick() {
    const remaining = remainingTime();
    if (remaining === 0) {
      update({ ...state, mode: 'done', remaining: 0, endsAt: 0 });
      return;
    }
    renderClock(remaining);
  }

  function refresh() {
    clearInterval(ticker);
    if (state.mode === 'running') {
      if (remainingTime() === 0) {
        tick();
        return;
      }
      if (!document.hidden) ticker = setInterval(tick, 250);
    }
    renderState();
  }

  function update(nextState) {
    state = nextState;
    save();
    refresh();
  }

  toggle.addEventListener('click', () => {
    if (state.mode === 'running') {
      const remaining = remainingTime();
      if (remaining === 0) tick();
      else update({ ...state, mode: 'paused', remaining, endsAt: 0 });
      return;
    }
    if (state.mode === 'done') state = ready(state.minutes);
    update({ ...state, mode: 'running', endsAt: Date.now() + state.remaining });
  });

  duration.addEventListener('change', () => update(ready(Number(duration.value))));
  reset.addEventListener('click', () => {
    update(ready(state.minutes));
    toggle.focus();
    status.textContent = 'Temporizador reiniciado.';
  });

  // A hora final absoluta mantém a contagem correta quando a aba fica em segundo plano.
  document.addEventListener('visibilitychange', () => {
    if (state.mode === 'running') refresh();
  });
  window.addEventListener('pagehide', () => clearInterval(ticker));
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    state = load() || state;
    refresh();
  });

  motion.hidden = false;
  session.hidden = false;
  refresh();
})();
