import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExam, gradeExam, remainingMilliseconds, remainingSeconds, resumeDeadline,
  scheduleReview, selectDueCards, loadProgress, serializeProgress, nextParticleIndex,
} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-engine.mjs';
import {DPOC_LEARNING} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-dpoc.mjs';
import {PAC_LEARNING} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-pac.mjs';
import {SOURCES} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/clinical-engine.mjs';

const DAY = 86_400_000;
const NOW = 1_790_000_000_000;
const question = (id, answer = 0) => ({id, topic: 'Assunto descritivo', choices: ['A', 'B', 'C', 'D'], answer});
const bank = [...Array.from({length: 6}, (_, i) => question(`dpoc-case-${i + 1}`, i % 4)),
  ...Array.from({length: 6}, (_, i) => question(`pac-case-${i + 1}`, i % 4))];

test('exam filters IDs before sampling and caps to the available topic', () => {
  const original = bank.map(item => item.id);
  const exam = buildExam({bank: [...bank, bank[0]], topic: 'dpoc', count: 12, random: () => 0.25});
  assert.equal(exam.length, 6);
  assert.ok(exam.every(item => item.id.startsWith('dpoc-')));
  assert.equal(new Set(exam.map(item => item.id)).size, 6);
  assert.deepEqual(bank.map(item => item.id), original);
  assert.notDeepEqual(exam.map(item => item.id), original.slice(0, 6));
  assert.equal(buildExam({bank, topic: 'mixed', count: 12, random: () => 0}).length, 12);
  assert.throws(() => buildExam({bank, random: () => 1}), RangeError);
  const explained = bank.slice(0, 6).map(item => ({...item,
    choices: item.choices.map(text => ({text, why: 'Explicação autoral da alternativa.'}))}));
  assert.equal(buildExam({bank: explained, topic: 'dpoc', random: () => 0}).length, 6);
});

test('grading gives no credit to missing, inherited, string or out-of-range answers', () => {
  const questions = bank.slice(0, 4);
  const answers = Object.assign(Object.create({[questions[3].id]: questions[3].answer}), {
    [questions[0].id]: 0, [questions[1].id]: '1', [questions[2].id]: 4,
  });
  const result = gradeExam(questions, answers);
  assert.equal(result.correct, 1);
  assert.equal(result.total, 4);
  assert.equal(result.percentage, 25);
  assert.equal(result.unanswered, 3);
  assert.equal(result.items[3].selected, null);
  assert.equal(gradeExam(questions, []).correct, 0);
  assert.equal(gradeExam(questions, [0, 1, 2, 3]).correct, 4);
  assert.deepEqual(gradeExam([], {}), {correct: 0, total: 0, percentage: 0, unanswered: 0, items: []});
});

test('absolute timer expires despite delayed callbacks and pause retains exact milliseconds', () => {
  const deadline = NOW + 10_001;
  assert.equal(remainingSeconds(deadline, NOW), 11);
  assert.equal(remainingSeconds(deadline, deadline - 1), 1);
  assert.equal(remainingSeconds(deadline, deadline), 0);
  assert.equal(remainingSeconds(deadline, deadline + 90_000), 0);
  assert.equal(remainingSeconds(NaN, NOW), 0);
  const paused = remainingMilliseconds(deadline, NOW + 4321);
  assert.equal(paused, 5680);
  const resumed = resumeDeadline(paused, NOW + 100_000);
  assert.equal(remainingMilliseconds(resumed, NOW + 100_000), paused);
  assert.equal(remainingSeconds(resumed, NOW + 105_681), 0);
});

test('review again resets to five minutes; good expands from one day to a thirty-day cap', () => {
  let state = scheduleReview(null, 'good', NOW);
  assert.deepEqual(state, {dueAt: NOW + DAY, intervalMs: DAY, repetitions: 1});
  state = scheduleReview(state, 'good', NOW);
  assert.equal(state.intervalMs, 2 * DAY);
  for (let i = 0; i < 8; i += 1) state = scheduleReview(state, 'good', NOW);
  assert.equal(state.intervalMs, 30 * DAY);
  state = scheduleReview(state, 'again', NOW);
  assert.deepEqual(state, {dueAt: NOW + 300_000, intervalMs: 300_000, repetitions: 0});
  assert.equal(scheduleReview(state, 'good', NOW).intervalMs, DAY);
  assert.equal(scheduleReview({dueAt: -1, intervalMs: Infinity, repetitions: -5}, 'good', NOW).intervalMs, DAY);
  assert.throws(() => scheduleReview(null, 'easy', NOW), RangeError);
});

test('due cards precede new cards and future cards without repeated IDs', () => {
  const cards = ['dpoc-new', 'pac-future', 'dpoc-due', 'pac-overdue', 'dpoc-due'].map(id => ({id}));
  const progress = loadProgress(null, cards.map(card => card.id));
  progress.cards['pac-future'] = {dueAt: NOW + DAY, intervalMs: DAY, repetitions: 1};
  progress.cards['dpoc-due'] = {dueAt: NOW, intervalMs: DAY, repetitions: 1};
  progress.cards['pac-overdue'] = {dueAt: NOW - DAY, intervalMs: DAY, repetitions: 1};
  assert.deepEqual(selectDueCards(cards, progress, NOW).map(card => card.id),
    ['pac-overdue', 'dpoc-due', 'dpoc-new', 'pac-future']);
});

test('corrupt storage, unsupported schema and invalid numeric state recover safely', () => {
  for (const raw of [null, '', '{broken', 'null', '[]', '{"schemaVersion":2,"cards":{}}']) {
    assert.deepEqual(JSON.parse(serializeProgress(loadProgress(raw, ['dpoc-card']))), {schemaVersion: 1, cards: {}});
  }
  const bad = JSON.stringify({schemaVersion: 1, cards: {
    'dpoc-negative': {dueAt: -1, intervalMs: DAY, repetitions: 1},
    'dpoc-fraction': {dueAt: NOW, intervalMs: DAY, repetitions: 1.5},
    'pac-text': {dueAt: NOW, intervalMs: '86400000', repetitions: 1},
  }});
  assert.deepEqual(Object.keys(loadProgress(bad, ['dpoc-negative', 'dpoc-fraction', 'pac-text']).cards), []);
  assert.throws(() => serializeProgress({schemaVersion: 1, cards: {}}), TypeError);
});

test('only known IDs and three numeric fields survive serialization; prototype keys never do', () => {
  const state = {dueAt: NOW, intervalMs: DAY, repetitions: 2};
  const raw = JSON.stringify({schemaVersion: 1, cards: {'dpoc-known': {...state, note: 'must disappear'}, 'pac-unknown': state}, patient: 'must disappear'});
  const progress = loadProgress(raw, new Set(['dpoc-known', '__proto__', 'constructor']));
  progress.cards['pac-unknown'] = state;
  progress.cards.__proto__ = state;
  const serialized = JSON.parse(serializeProgress(progress));
  assert.deepEqual(serialized, {schemaVersion: 1, cards: {'dpoc-known': state}});
  assert.equal({}.dueAt, undefined);
});

test('every static known flashcard can round-trip without losing its ID', () => {
  const ids = Array.from({length: 24}, (_, i) => `${i < 12 ? 'dpoc' : 'pac'}-card-${i + 1}`);
  const progress = loadProgress(null, ids);
  ids.forEach(id => { progress.cards[id] = scheduleReview(null, 'good', NOW); });
  const restored = loadProgress(serializeProgress(progress), ids);
  assert.deepEqual(Object.keys(restored.cards).sort(), [...ids].sort());
});

test('particle progression loops and handles empty, invalid and negative indices', () => {
  assert.equal(nextParticleIndex(23, 24), 0);
  assert.equal(nextParticleIndex(0, 24), 1);
  assert.equal(nextParticleIndex(-1, 24), 0);
  assert.equal(nextParticleIndex(Infinity, 24), 0);
  assert.equal(nextParticleIndex(0, 0), 0);
});

test('published banks provide twelve explained cases, twenty-four cards and forty-eight sourced particles', () => {
  const ids = new Set();
  for (const [topic, data] of [['dpoc', DPOC_LEARNING], ['pac', PAC_LEARNING]]) {
    assert.equal(data.cases.length, 6);
    assert.equal(data.flashcards.length, 12);
    assert.equal(data.particles.length, 24);
    for (const entry of [...data.cases, ...data.flashcards, ...data.particles]) {
      assert.ok(entry.id.startsWith(`${topic}-`));
      assert.ok(!ids.has(entry.id), `ID repetido: ${entry.id}`);
      ids.add(entry.id);
      assert.ok(typeof entry.topic === 'string' && entry.topic.trim());
      assert.ok([1, 2, 3].includes(entry.level));
      assert.ok(Array.isArray(entry.sources) && entry.sources.length > 0);
      entry.sources.forEach(source => assert.ok(Object.hasOwn(SOURCES, source), `Fonte ausente: ${source}`));
    }
    for (const entry of data.cases) {
      assert.equal(entry.choices.length, 4);
      assert.ok(Number.isInteger(entry.answer) && entry.answer >= 0 && entry.answer < 4);
      entry.choices.forEach(choice => {
        assert.ok(typeof choice.text === 'string' && choice.text.trim());
        assert.ok(typeof choice.why === 'string' && choice.why.trim());
      });
      assert.ok(entry.stem.trim() && entry.question.trim() && entry.takeaway.trim());
    }
    data.flashcards.forEach(entry => assert.ok(entry.front.trim() && entry.back.trim()));
    data.particles.forEach(entry => assert.ok(entry.phase.trim() && entry.prompt.trim() && entry.answer.trim() && entry.takeaway.trim()));
  }
  const actualBank = [...DPOC_LEARNING.cases, ...PAC_LEARNING.cases];
  assert.equal(buildExam({bank: actualBank, count: 12, random: () => 0.5}).length, 12);
  const cards = [...DPOC_LEARNING.flashcards, ...PAC_LEARNING.flashcards];
  const progress = loadProgress(null, cards.map(card => card.id));
  cards.forEach(card => { progress.cards[card.id] = scheduleReview(null, 'good', NOW); });
  const restored = loadProgress(serializeProgress(progress), cards.map(card => card.id));
  assert.equal(Object.keys(restored.cards).length, 24);
});
