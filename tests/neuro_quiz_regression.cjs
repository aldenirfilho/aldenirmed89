'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/assets/aprofundamento.js'), 'utf8');
const start = source.indexOf('var QUIZ=');
const end = source.indexOf('/* ===================== Flashcards', start);
assert(start >= 0 && end > start);
const quiz = source.slice(start, end);

// Exercise the actual shipped quiz in a fresh document on each reload.
function open(storage, unavailable = false) {
  class Element {
    constructor() { this.textContent = ''; this.children = []; this.events = {}; this.classList = {add(){}, remove(){}}; }
    set innerHTML(value) { this.html = value; this.children = []; }
    get innerHTML() { return this.html; }
    appendChild(child) { this.children.push(child); }
    addEventListener(type, listener) { this.events[type] = listener; }
    click() { if (!this.disabled) this.events.click?.(); }
  }
  const elements = new Map();
  const $ = selector => {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  };
  vm.runInNewContext(quiz, {
    $, LVNAME: {}, esc: String, document: {createElement: () => new Element()},
    store(key, value) {
      if (unavailable) return null;
      if (value === undefined) return storage[key] ? JSON.parse(storage[key]) : null;
      storage[key] = JSON.stringify(value);
    }
  });
  return $;
}

const storage = {};
let $ = open(storage);
$('#quiz-opts').children[0].click();
const score = $('#quiz-score').textContent;
assert.match(score, /Acertos: [01] · Erros: [01]/);
assert($('#quiz-opts').children.every(button => button.disabled));
$ = open(storage);
assert.equal($('#quiz-score').textContent, score);
assert($('#quiz-opts').children.every(button => button.disabled), 'answered case must stay locked after reload');
$('#quiz-opts').children[0].click();
assert.equal($('#quiz-score').textContent, score);
$('#quiz-next').click();
const secondCase = $('#quiz-stem').textContent;
$ = open(storage);
assert.equal($('#quiz-pos').textContent, 'Caso 2 / 28');
assert.equal($('#quiz-stem').textContent, secondCase);
$('#quiz-shuffle').click();
const shuffledCase = $('#quiz-stem').textContent;
$ = open(storage);
assert.equal($('#quiz-stem').textContent, shuffledCase);
$('#quiz-reset').click();
$ = open(storage);
assert.equal($('#quiz-score').textContent, 'Acertos: 0 · Erros: 0');
assert.equal($('#quiz-pos').textContent, 'Caso 1 / 28');
assert($('#quiz-opts').children.every(button => !button.disabled));

$ = open({nm_quiz_v1: JSON.stringify({ok: 12, err: 3})});
assert.equal($('#quiz-score').textContent, 'Acertos: 12 · Erros: 3', 'legacy totals survive');
for (const invalid of [true, [], 'bad', {ok:'oops', err:-8, pos:99, order:[0,0], answered:{0:99, '-1':0}}]) {
  $ = open({nm_quiz_v1: JSON.stringify(invalid)});
  assert.equal($('#quiz-score').textContent, 'Acertos: 0 · Erros: 0');
  assert.equal($('#quiz-pos').textContent, 'Caso 1 / 28');
  $('#quiz-opts').children[0].click();
  assert(!$('#quiz-score').textContent.includes('NaN'));
}
$ = open({}, true);
$('#quiz-opts').children[0].click();
assert($('#quiz-opts').children.every(button => button.disabled));
console.log('Quiz: reload, duplicate prevention, position, shuffle, reset, legacy and invalid storage PASS.');
