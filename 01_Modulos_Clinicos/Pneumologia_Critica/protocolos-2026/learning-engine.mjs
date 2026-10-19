import { LEARNING_TOPIC_IDS } from './learning-registry.mjs?v=dbc34eb79dc4732b';

const MINUTE = 60_000;
const DAY = 86_400_000;
const MAX_INTERVAL = 30 * DAY;
const MAX_REPETITIONS = 1_000_000;
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const moduleForId = id => typeof id==='string' ? LEARNING_TOPIC_IDS.find(topic=>id.startsWith(`${topic}-`)) : undefined;
const safeId = id => { const module=moduleForId(id); return Boolean(module && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id.slice(module.length+1))); };
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const timestamp = value => Number.isSafeInteger(value) && value >= 0;
const allowlists = new WeakMap();

function cleanCardState(value) {
  if (!isRecord(value) || !timestamp(value.dueAt)
      || !Number.isSafeInteger(value.intervalMs) || value.intervalMs < 0 || value.intervalMs > MAX_INTERVAL
      || !Number.isSafeInteger(value.repetitions) || value.repetitions < 0 || value.repetitions > MAX_REPETITIONS) return null;
  return {dueAt: value.dueAt, intervalMs: value.intervalMs, repetitions: value.repetitions};
}

function validQuestion(question) {
  return isRecord(question) && safeId(question.id)
    && Array.isArray(question.choices) && question.choices.length === 4
    && question.choices.every(choice => typeof choice === 'string' ? choice.trim()
      : isRecord(choice) && typeof choice.text === 'string' && choice.text.trim()
        && typeof choice.why === 'string' && choice.why.trim())
    && Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.choices.length;
}

/** Selects without replacement and never mutates the supplied question bank. */
export function buildExam({bank = [], topic = 'mixed', count = 6, random = Math.random} = {}) {
  if (![...LEARNING_TOPIC_IDS, 'mixed'].includes(topic)) throw new RangeError('Tópico inválido.');
  if (![6, 12].includes(count)) throw new RangeError('Escolha 6 ou 12 questões.');
  if (typeof random !== 'function') throw new TypeError('Gerador aleatório inválido.');
  const seen = new Set();
  const moduleFor = question => moduleForId(question.id);
  const pool = (Array.isArray(bank) ? bank : []).filter(question => {
    if (!validQuestion(question) || seen.has(question.id)) return false;
    const module = moduleFor(question);
    if (!module || (question.module !== undefined && question.module !== module)
        || (topic !== 'mixed' && module !== topic)) return false;
    seen.add(question.id);
    return true;
  });
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('O gerador deve retornar um número entre 0 e 1, excluindo 1.');
    const selected = Math.floor(value * (index + 1));
    [pool[index], pool[selected]] = [pool[selected], pool[index]];
  }
  const size = Math.min(count, pool.length);
  if (topic === 'mixed') {
    // One question from every available module before filling the remaining slots.
    // The prior shuffle randomizes selection within and between the module groups.
    const represented = new Set(), selected = [];
    for (const question of pool) {
      const module = moduleFor(question);
      if (!represented.has(module) && selected.length < size) { represented.add(module); selected.push(question); }
    }
    const chosen = new Set(selected.map(q=>q.id));
    for (const question of pool) if (selected.length<size && !chosen.has(question.id)) selected.push(question);
    return selected;
  }
  return pool.slice(0, size);
}

/** Answers may be an index-aligned array or an own-property map keyed by ID. */
export function gradeExam(questions = [], answers = {}) {
  const bank = Array.isArray(questions) ? questions : [];
  const items = bank.map((question, index) => {
    const id = typeof question?.id === 'string' ? question.id : '';
    const candidate = Array.isArray(answers)
      ? (owns(answers, index) ? answers[index] : null)
      : (isRecord(answers) && owns(answers, id) ? answers[id] : null);
    const choices = Array.isArray(question?.choices) ? question.choices : [];
    const selected = Number.isInteger(candidate) && candidate >= 0 && candidate < choices.length ? candidate : null;
    const answer = Number.isInteger(question?.answer) && question.answer >= 0 && question.answer < choices.length
      ? question.answer : null;
    return {id, selected, correct: selected !== null && answer !== null && selected === answer, answer};
  });
  const correct = items.filter(item => item.correct).length;
  const total = items.length;
  return {correct, total, percentage: total ? Math.round(correct / total * 100) : 0,
    unanswered: items.filter(item => item.selected === null).length, items};
}

/** Absolute deadlines prevent delayed browser callbacks from extending an exam. */
export function remainingMilliseconds(deadlineMs, nowMs = Date.now()) {
  if (!timestamp(deadlineMs) || !timestamp(nowMs)) return 0;
  return Math.max(0, deadlineMs - nowMs);
}

export function remainingSeconds(deadlineMs, nowMs = Date.now()) {
  return Math.ceil(remainingMilliseconds(deadlineMs, nowMs) / 1000);
}

export function resumeDeadline(remainingMs, nowMs = Date.now()) {
  if (!timestamp(nowMs) || !Number.isFinite(remainingMs)) return null;
  return Math.min(Number.MAX_SAFE_INTEGER, nowMs + Math.max(0, Math.ceil(remainingMs)));
}

/** Cognitive review intervals, not a prediction of clinical competence. */
export function scheduleReview(cardState, rating, nowMs = Date.now()) {
  if (!['again', 'good'].includes(rating)) throw new RangeError('Use again ou good.');
  if (!timestamp(nowMs)) throw new RangeError('Horário inválido.');
  const previous = cleanCardState(cardState);
  const repetitions = rating === 'again' ? 0 : Math.min(MAX_REPETITIONS, (previous?.repetitions || 0) + 1);
  const intervalMs = rating === 'again' ? 5 * MINUTE
    : !previous || previous.repetitions === 0 ? DAY : Math.min(MAX_INTERVAL, Math.max(DAY, previous.intervalMs * 2));
  return {dueAt: Math.min(Number.MAX_SAFE_INTEGER, nowMs + intervalMs), intervalMs, repetitions};
}

/** Due first, then new cards, then scheduled cards; preserves one card per ID. */
export function selectDueCards(cards = [], progress = {}, nowMs = Date.now()) {
  const seen = new Set();
  const states = isRecord(progress?.cards) ? progress.cards : {};
  const now = timestamp(nowMs) ? nowMs : 0;
  return (Array.isArray(cards) ? cards : []).flatMap((card, index) => {
    if (!safeId(card?.id) || seen.has(card.id)) return [];
    seen.add(card.id);
    const state = owns(states, card.id) ? cleanCardState(states[card.id]) : null;
    return [{card, index, group: !state ? 1 : state.dueAt <= now ? 0 : 2, dueAt: state?.dueAt || 0}];
  }).sort((left, right) => left.group - right.group || left.dueAt - right.dueAt || left.index - right.index)
    .map(entry => entry.card);
}

/** Reads storage text only; never accesses storage, patient input or the network. */
export function loadProgress(raw, validIds = []) {
  const iterable = Array.isArray(validIds) || validIds instanceof Set ? validIds : [];
  const allowed = new Set([...iterable].filter(safeId));
  const progress = {schemaVersion: 1, cards: Object.create(null)};
  allowlists.set(progress, allowed);
  let parsed;
  try { parsed = typeof raw === 'string' ? JSON.parse(raw) : null; } catch { return progress; }
  if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !isRecord(parsed.cards)) return progress;
  for (const id of allowed) {
    if (!owns(parsed.cards, id)) continue;
    const state = cleanCardState(parsed.cards[id]);
    if (state) progress.cards[id] = state;
  }
  return progress;
}

/** Serialize the object returned by loadProgress; updates to its cards are allowed. */
export function serializeProgress(progress) {
  const allowed = isRecord(progress) ? allowlists.get(progress) : null;
  if (!allowed) throw new TypeError('Inicialize o progresso com loadProgress antes de salvar.');
  const cards = Object.create(null);
  if (isRecord(progress.cards)) for (const id of allowed) {
    if (!owns(progress.cards, id)) continue;
    const state = cleanCardState(progress.cards[id]);
    if (state) cards[id] = state;
  }
  return JSON.stringify({schemaVersion: 1, cards});
}

export function nextParticleIndex(index, length) {
  if (!Number.isFinite(length) || Math.floor(length) <= 0 || !Number.isFinite(index)) return 0;
  const size = Math.floor(length);
  return ((Math.trunc(index) + 1) % size + size) % size;
}
