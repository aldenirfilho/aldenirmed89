const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');
const { DURATION, FORM_IDS, buildForm, newAttempt, readAttempt, remaining, grade, clockText } = require('../questoes/assets/temi-simulado-2026.js');

const source = readFileSync(require.resolve('../questoes/data/qbank_temi_800_2026.js'), 'utf8');
const bank = vm.runInNewContext(`${source}\nTEMI_800_2026_QBANK`);
const form = buildForm(bank.questions);
const blocked = [3, 8, 12, 19, 22, 30, 89, 213, 222, 249, 321, 323, 331, 340, 411, 520, 541, 587, 768, 770];

test('forma fixa de 90 IDs distintos em 20 blocos e sem os itens sinalizados', () => {
  assert.equal(form.length, 90);
  assert.equal(new Set(FORM_IDS).size, 90);
  assert.equal(new Set(form.map(item => item.question.block)).size, 20);
  for (const id of FORM_IDS) assert.ok(!blocked.includes(Number(id.slice(-3))), id);
  const restricted = bank.questions.filter(question => FORM_IDS.includes(question.id));
  assert.deepEqual(buildForm(restricted.reverse()), form);
  assert.throws(() => buildForm(restricted.slice(1)), /indisponível/);
});

test('adaptação para quatro alternativas preserva uma resposta e a justificativa original', () => {
  for (const item of form) {
    assert.deepEqual(item.options.map(option => option.letter), ['A', 'B', 'C', 'D']);
    assert.equal(new Set(item.options.map(option => option.text)).size, 4);
    assert.equal(item.options.filter(option => option.correct).length, 1);
    const correctOption = item.options.find(option => option.letter === item.answer);
    assert.equal(correctOption.text, item.question.options[item.question.answer]);
    assert.equal(correctOption.rationale, item.question.rationales[item.question.answer]);
    for (const option of item.options) {
      const originalLetter = Object.keys(item.question.options).find(letter => item.question.options[letter] === option.text);
      assert.equal(option.rationale, item.question.rationales[originalLetter]);
      assert.doesNotMatch(option.text, /\b(?:todas|nenhuma)\s+as\s+alternativas\b/i);
    }
  }
});

test('cronômetro deriva prazo de quatro horas do horário persistido', () => {
  const attempt = newAttempt(1000000000);
  assert.equal(DURATION, 14400000);
  assert.equal(clockText(remaining(attempt, attempt.startedAt)), '04:00:00');
  assert.equal(clockText(remaining(attempt, attempt.startedAt + 61501)), '03:58:59');
  assert.equal(remaining(attempt, attempt.startedAt + DURATION - 1), 1);
  assert.equal(remaining(attempt, attempt.startedAt + DURATION + 1), 0);
  assert.equal(remaining(attempt, attempt.startedAt - 1000), DURATION);
});

test('restaura valores válidos sem alterar as escolhas e descarta uma sessão danificada', () => {
  const [first, second] = FORM_IDS;
  const attempt = newAttempt(1000000000);
  attempt.position = 42;
  attempt.answers = { [first]: 'D', [second]: 'E', MACRO: 'A' };
  attempt.flags = [first, first, 'invalid'];
  attempt.submittedAt = attempt.startedAt + DURATION + 1;
  assert.deepEqual(readAttempt(JSON.parse(JSON.stringify(attempt))), {
    startedAt: attempt.startedAt, position: 42, answers: { [first]: 'D' }, flags: [first], submittedAt: attempt.startedAt + DURATION
  });
  assert.equal(readAttempt({ startedAt: 'invalid' }), null);
  assert.equal(readAttempt({ startedAt: Number.MAX_SAFE_INTEGER }), null);
});

test('corrige acertos, erros e questões em branco sobre as 90 questões', () => {
  const [first, second] = form;
  const incorrect = second.options.find(option => !option.correct).letter;
  assert.deepEqual(grade(form, {
    [first.question.id]: first.answer, [second.question.id]: incorrect
  }), { correct: 1, incorrect: 1, blank: 88 });
  const allCorrect = Object.fromEntries(form.map(item => [item.question.id, item.answer]));
  assert.deepEqual(grade(form, allCorrect), { correct: 90, incorrect: 0, blank: 0 });
});
