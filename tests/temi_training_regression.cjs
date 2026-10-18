'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'questoes/temi_integrado_2026_questoes.html'), 'utf8');
const bankSource = fs.readFileSync(path.join(root, 'questoes/data/qbank_temi_integrado_2026.js'), 'utf8');
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const coreSource = source.split('// BEGIN TEMI TRAINING CORE')[1].split('// END TEMI TRAINING CORE')[0];
const core = vm.runInNewContext(coreSource.replace(/^[^\n]*\n/, '') + '\n;trainingCore', {Date});
const bank = vm.runInNewContext(bankSource + ';TEMI_INTEGRADO_2026_QBANK');
const progressKey = 'antigravity:temi-integrado-2026:training:progress:v1';
const prefsKey = 'antigravity:temi-integrado-2026:training:preferences:v1';
const legacyPrefix = 'antigravity:temi-integrado-2026:reviewed:';
const firstId = bank.questions[0].id;
const clone = value => JSON.parse(JSON.stringify(value));

// Local calendar behavior, including UTC offsets and DST calendar days.
for (const hour of [0, 1, 23]) {
  assert.equal(core.localDay(new Date(2026, 9, 18, hour, 59)), '2026-10-18');
}
assert.equal(core.addDays('2026-10-31', 1), '2026-11-01');
assert.equal(core.addDays('2028-02-28', 1), '2028-02-29');
assert.equal(core.addDays('2026-03-07', 1), '2026-03-08');
assert.equal(core.addDays('2026-11-01', 1), '2026-11-02');
assert.equal(core.difference('2026-03-07', '2026-03-09'), 2);
assert.equal(core.difference('2026-10-31', '2026-11-02'), 2);
assert.equal(core.parseDay('2026-02-30'), null);
assert.equal(core.parseDay('not-a-date'), null);
assert.equal(core.parseDay('<script>'), null);
if (process.argv.includes('--calendar')) {
  console.log(`Calendar passed in ${process.env.TZ}`);
  process.exit(0);
}

// Schedule targets derive from actual study dates, with oldest review first.
const records = {};
let plan = core.dailyPlan(bank.questions, bank.blocks, records, '2026-10-18', '2026-10-18');
assert.equal(plan.next.length, 10);
assert.ok(plan.next.every(question => question.block === bank.blocks[0].id));
assert.equal(new Set(plan.next.map(question => question.id)).size, 10);
plan.next.forEach(question => { records[question.id] = {learnedOn:'2026-10-18', reviews:{}, difficult:false}; });
plan = core.dailyPlan(bank.questions, bank.blocks, records, '2026-10-18', '2026-10-19');
assert.equal(plan.due.length, 10);
assert.equal(plan.next.length, 10, 'reviews count within the daily cap');
assert.ok(plan.next.every(question => question.block === bank.blocks[0].id));
plan.next.forEach(question => { records[question.id].reviews[1] = '2026-10-19'; });
plan = core.dailyPlan(bank.questions, bank.blocks, records, '2026-10-18', '2026-10-19');
assert.equal(plan.done.length, 10);
assert.equal(plan.next.length, 0, 'completing cards must not endlessly append new questions');
assert.equal(plan.ids.size, 10, 'completed cards remain visible in the daily session');
plan = core.dailyPlan(bank.questions, bank.blocks, records, '2026-10-18', '2026-10-20');
assert.equal(plan.next.length, 10);
assert.ok(plan.next.every(question => question.block === bank.blocks[1].id));
assert.equal(core.nextReview(records[firstId]).day, '2026-10-25');
const delayed = {learnedOn:'2026-10-01', reviews:{1:'2026-10-18'}, difficult:false};
assert.equal(core.nextReview(delayed).day, '2026-10-19', 'overdue steps are resumed on separate days');
delayed.reviews[7] = '2026-10-19';
assert.equal(core.nextReview(delayed).day, '2026-10-22');
delayed.reviews[21] = '2026-10-22';
assert.equal(core.nextReview(delayed), null);
assert.equal(core.dailyPlan(bank.questions, bank.blocks, {}, '2026-10-20', '2026-10-18').next.length, 0);
records[bank.questions[2].id].difficult = true;
plan = core.dailyPlan(bank.questions, bank.blocks, records, '2026-10-18', '2026-10-25');
assert.equal(plan.next[0].id, bank.questions[2].id, 'difficult cards precede equally overdue cards');
const malformed = core.cleanRecords({
  [firstId]: {learnedOn:'2026-02-30', reviews:{1:'2026-10-19'}, difficult:'yes'},
  unknown: {learnedOn:'2026-10-18', reviews:{}},
}, bank.questions.map(question => question.id));
assert.equal(malformed[firstId].learnedOn, null);
assert.equal(malformed[firstId].difficult, false);
assert.equal(Object.keys(malformed).length, 1, 'foreign keys cannot enter question progress');
const early = core.cleanRecords({[firstId]:{learnedOn:'2026-10-18', reviews:{1:'2026-10-18',7:'2026-10-19'}}}, [firstId]);
assert.equal(Object.keys(early[firstId].reviews).length, 0);

// Exercise the actual page script through a small DOM, storage, and clock boundary.
class Element {
  constructor(attrs = {}, document) {
    this.document = document;
    this.attributes = {...attrs}; this.children = []; this.listeners = new Map();
    this.dataset = {}; this.style = {}; this.value = ''; this._text = ''; this._html = '';
    this.disabled = Object.hasOwn(attrs, 'disabled');
    this.classes = new Set((attrs.class || '').split(/\s+/).filter(Boolean));
    this.classList = {
      add: name => this.classes.add(name), contains: name => this.classes.has(name),
      toggle: (name, force) => {
        const enabled = force === undefined ? !this.classes.has(name) : force;
        enabled ? this.classes.add(name) : this.classes.delete(name);
        return enabled;
      },
    };
    Object.entries(attrs).forEach(([name, value]) => {
      if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    });
  }
  set innerHTML(value) { this._html = value; this.children = this.document.parse(value); }
  get innerHTML() { return this._html; }
  set textContent(value) { this._text = String(value); }
  get textContent() { return this._text; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  querySelectorAll(selector) {
    const attribute = selector.match(/^\[([^\]]+)\]$/)?.[1];
    return this.children.filter(element => attribute && Object.hasOwn(element.attributes, attribute));
  }
  addEventListener(event, callback) { this.listeners.set(event, [...(this.listeners.get(event) || []), callback]); }
  dispatch(event, target = this) { for (const callback of this.listeners.get(event) || []) callback({target}); }
  click() { if (!this.disabled) this.dispatch('click'); }
  closest(selector) { return this.queryMatches(selector) ? this : null; }
  queryMatches(selector) { return Object.hasOwn(this.attributes, selector.slice(1, -1)); }
  focus() { this.document.activeElement = this; }
  scrollIntoView(options) { this.scrollOptions = options; }
  setCustomValidity(message) { this.validationMessage = message; }
  reportValidity() { this.reportedValidity = true; }
}

function makeApp({storage = new Map(), denied = false, writesDenied = false, reduced = false} = {}) {
  let now = new Date(2026, 9, 18, 23, 45).getTime();
  class LocalDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const elements = new Map(), documentListeners = new Map(), windowListeners = new Map();
  const document = {
    hidden:false,
    getElementById: id => elements.get(id),
    addEventListener: (event, callback) => documentListeners.set(event, callback),
    parse(value) {
      return [...value.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)].map(match => {
        const attrs = {};
        for (const attr of match[2].matchAll(/([a-zA-Z][\w-]*)(?:="([^"]*)")?/g)) attrs[attr[1]] = attr[2] || '';
        const element = new Element(attrs, document);
        if (attrs.id) elements.set(attrs.id, element);
        return element;
      });
    },
  };
  document.parse(html);
  document.documentElement = new Element({}, document);
  const storageCalls = [];
  const localStorage = {
    getItem(key) { if (denied) throw new Error('SecurityError'); return storage.get(key) ?? null; },
    setItem(key, value) { if (denied || writesDenied) throw new Error('QuotaExceededError'); storage.set(key, value); storageCalls.push(['set',key]); },
    removeItem(key) { if (denied || writesDenied) throw new Error('SecurityError'); storage.delete(key); storageCalls.push(['remove',key]); },
    clear() { throw new Error('Storage must never be globally cleared'); },
  };
  const context = vm.createContext({
    document, Date:LocalDate, localStorage,
    matchMedia: () => ({matches:reduced}), navigator:{},
    window:{confirm: () => true, addEventListener: (event, callback) => windowListeners.set(event,callback)},
  });
  vm.runInContext(bankSource, context);
  vm.runInContext(source, context);
  const get = id => elements.get(id);
  const button = (attribute, id) => get('questions').querySelectorAll(`[data-${attribute}]`).find(item => item.attributes[`data-${attribute}`] === id);
  return {
    get, button, storage, storageCalls, document,
    day(year, month, date) { now = new Date(year, month - 1, date, 0, 5).getTime(); windowListeners.get('focus')(); },
  };
}

const app = makeApp({reduced:true});
assert.match(app.get('trainingToday').textContent, /18\/10\/2026/);
assert.match(app.get('trainingCount').textContent, /^0 de 10/);
assert.equal(app.get('blockTabs').getAttribute('role'), 'group');
app.get('todayTraining').click();
assert.equal(app.get('visibleQ').textContent, '10');
assert.equal(app.get('todayTraining').getAttribute('aria-pressed'), 'true');
assert.equal(app.get('resultText').scrollOptions.behavior, 'instant');
assert.equal(app.document.activeElement, app.get('resultText'));
assert.equal(app.button('toggle',firstId).getAttribute('aria-expanded'), 'false');
app.button('toggle',firstId).click();
assert.equal(app.button('toggle',firstId).getAttribute('aria-expanded'), 'true');
app.button('difficult',firstId).click();
assert.equal(app.button('difficult',firstId).getAttribute('aria-pressed'), 'true');
assert.equal(clone(JSON.parse(app.storage.get(progressKey)))[firstId].difficult, true);
for (const question of bank.questions.slice(0,10)) app.button('review',question.id).click();
assert.match(app.get('trainingCount').textContent, /^10 de 10/);
assert.match(app.get('trainingNext').textContent, /Meta de hoje concluída/);
assert.equal(app.get('visibleQ').textContent, '10');
assert.equal(app.button('review',firstId).disabled, true, 'same-day repetition is not credited');
assert.equal(JSON.parse(app.storage.get(progressKey))[firstId].learnedOn, '2026-10-18');
const persisted = makeApp({storage:app.storage});
assert.match(persisted.get('trainingCount').textContent, /^10 de 10/, 'reload restores progress');
app.day(2026,10,19);
assert.match(app.get('trainingToday').textContent, /19\/10\/2026/);
assert.match(app.get('trainingCount').textContent, /^0 de 10/);
assert.equal(app.button('review',firstId).disabled, false);
app.button('review',firstId).click();
assert.equal(JSON.parse(app.storage.get(progressKey))[firstId].reviews[1], '2026-10-19');
assert.equal(app.button('review',firstId).disabled, true);
assert.match(app.get('trainingCount').textContent, /^1 de 10/);
app.get('allTraining').click();
assert.equal(app.get('visibleQ').textContent, '50');
app.get('statusFilter').value = 'difficult'; app.get('statusFilter').dispatch('change');
assert.equal(app.get('visibleQ').textContent, '1');
app.get('trainingStart').value = '2026-02-30'; app.get('saveTrainingStart').click();
assert.equal(app.get('trainingStart').reportedValidity, true);
app.get('trainingStart').value = '2026-10-20'; app.get('saveTrainingStart').click();
assert.equal(JSON.parse(app.storage.get(prefsKey)).startedOn, '2026-10-20');
assert.equal(JSON.parse(app.storage.get(progressKey))[firstId].reviews[1], '2026-10-19', 'planning never overwrites real study dates');
app.storage.set('antigravity:a11y:v1','{"theme":"light"}');
app.storage.set('other-bank-progress','keep');
app.get('resetProgress').click();
assert.equal(app.storage.has(progressKey), false);
assert.equal(app.storage.get('other-bank-progress'), 'keep');
assert.equal(app.storage.get('antigravity:a11y:v1'), '{"theme":"light"}');
assert.equal(JSON.parse(app.storage.get(prefsKey)).startedOn, '2026-10-20');
assert.ok(app.storageCalls.filter(([action]) => action === 'remove').every(([,key]) => key === progressKey || key.startsWith(legacyPrefix)));

for (const option of [{denied:true}, {writesDenied:true}]) {
  const transient = makeApp(option);
  assert.match(transient.get('trainingStorage').textContent, /Armazenamento indisponível/);
  transient.button('review',firstId).click();
  assert.equal(transient.get('reviewedQ').textContent, '1', 'in-memory progress works when storage rejects writes');
  transient.button('undo',firstId).click();
  assert.equal(transient.get('reviewedQ').textContent, '0');
}
const legacy = makeApp({storage:new Map([[legacyPrefix + firstId,'1']])});
assert.equal(legacy.get('reviewedQ').textContent, '1', 'legacy review marks survive upgrade');
assert.match(legacy.get('questions').innerHTML, /Revisão anterior sem data/);
legacy.button('review',firstId).click();
assert.equal(JSON.parse(legacy.storage.get(progressKey))[firstId].learnedOn, '2026-10-18');
const corrupt = makeApp({storage:new Map([[progressKey,'{broken json']])});
assert.match(corrupt.get('trainingStorage').textContent, /ilegível/);
assert.equal(corrupt.get('visibleQ').textContent, '50');
assert.ok(html.includes('@media(prefers-reduced-motion:reduce)'));
assert.ok(!source.includes('localStorage.clear('));
console.log('TEMI training calendar, scheduling, persistence, reset, fallback, filters and accessibility passed.');
