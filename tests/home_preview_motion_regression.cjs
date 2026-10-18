'use strict';

// Exercise the actual home preview initializers against controlled input/focus,
// browser preferences and time. Rendering assertions inspect the resulting cards.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const home = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const motionFunction = home.slice(
  home.indexOf('function missionHasReducedMotion(){'),
  home.indexOf('function clearMissionTimers(){'),
);
function initializer(kind) {
  const marker = kind === 'desafios' ? '/* ── DESAFIOS CLÍNICOS' : '/* ── MNEMÔNICOS CLÍNICOS';
  const start = home.indexOf('(async function(){', home.indexOf(marker));
  const end = home.indexOf('\n})();', start) + '\n})();'.length;
  assert.ok(start >= 0 && end > start, 'preview initializer must exist');
  return motionFunction + '\n' + home.slice(start, end);
}

class Classes {
  constructor(onChange = () => {}) { this.values = new Set(); this.onChange = onChange; }
  contains(value) { return this.values.has(value); }
  add(...values) { values.forEach(value => this.values.add(value)); this.onChange(); }
  remove(...values) { values.forEach(value => this.values.delete(value)); this.onChange(); }
  toggle(value, force) {
    const next = force ?? !this.contains(value);
    if (next) this.add(value); else this.remove(value);
    return next;
  }
}
class Element {
  constructor(id, onClassChange) {
    this.id = id; this.children = []; this.parentElement = null;
    this.classList = new Classes(onClassChange); this.events = new Map();
    this.style = {}; this.dataset = {}; this.hovered = false;
    this.textContent = ''; this.markup = '';
  }
  append(...items) { items.forEach(item => { item.parentElement = this; this.children.push(item); }); }
  set innerHTML(markup) {
    this.markup = markup; this.children = [];
    const cards = markup.matchAll(/<(a|article)\s+class="([^"]*\breveal\b[^"]*)"[\s\S]*?<\/\1>/g);
    for (const card of cards) {
      const element = new Element('rendered-card'); element.classList.add(...card[2].split(/\s+/));
      this.append(element);
    }
  }
  get innerHTML() { return this.markup; }
  querySelectorAll(selector) { return this.children.filter(child => selector === '.reveal' && child.classList.contains('reveal')); }
  matches(selector) { return selector === ':hover' && this.hovered; }
  contains(element) { return element === this || this.children.some(child => child.contains(element)); }
  setAttribute() {}
  addEventListener(event, callback) { this.events.set(event, [...(this.events.get(event) || []), callback]); }
  dispatch(event, value = {}) { (this.events.get(event) || []).forEach(callback => callback(value)); }
  click() { this.dispatch('click'); }
}

async function setup(kind, {osReduced = false, internalReduced = false, hasObserver = true} = {}) {
  const mutations = [];
  const root = new Element('html', () => queueMicrotask(() => mutations.forEach(callback => callback())));
  if (internalReduced) root.classList.add('a11y-reduce-motion');
  const prefix = kind === 'desafios' ? 'dsf' : 'mnem';
  const ids = new Map();
  const element = id => { if (!ids.has(id)) ids.set(id, new Element(id)); return ids.get(id); };
  const section = element(kind), grid = element(prefix + '-grid');
  const previous = element(prefix + 'Prev'), next = element(prefix + 'Next');
  section.append(grid, previous, next);
  element('dsfPreviewCount'); element('mnemCount'); element('mnemEmpty');
  const document = {
    documentElement: root, activeElement: null,
    getElementById: id => ids.get(id) || null,
    querySelectorAll: () => [],
  };
  const intervals = new Map(); let id = 0;
  const media = {
    matches: osReduced, events: [],
    addEventListener(event, callback) { if (event === 'change') this.events.push(callback); },
    set(reduced) { this.matches = reduced; this.events.forEach(callback => callback({matches: reduced})); },
  };
  const sample = Array.from({length: 7}, (_, index) => ({
    id: 'case-' + index, title: 'Caso ' + index, content: 'Caso fictício ' + index,
    excerpt: 'Resumo ' + index, date: '2026-10-18', tags: [],
    letters: {A: 'Apoio educacional ' + index},
  }));
  const payload = kind === 'desafios' ? {temi: sample, r3: sample} : {mnemonicos: sample};
  const win = {
    matchMedia: () => media,
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() { mutations.push(this.callback); }
    },
  };
  const observer = hasObserver ? {observe() {}} : null;
  const context = {
    document, window: win, observer, TOPICS: {}, mdToHtml: value => value, openDrawer() {}, console,
    fetch: async () => ({ok: true, json: async () => payload}),
    setInterval(callback) { intervals.set(++id, callback); return id; },
    clearInterval(timer) { intervals.delete(timer); },
  };
  await vm.runInNewContext(initializer(kind), context);
  const flush = async () => { await new Promise(resolve => setImmediate(resolve)); };
  return {
    root, document, section, grid, previous, next, media, intervals, flush,
    tick() { [...intervals.values()].forEach(callback => callback()); },
  };
}

(async () => {
  for (const kind of ['desafios', 'mnemonicos']) {
    for (const preference of [{osReduced: true}, {internalReduced: true}]) {
      const env = await setup(kind, preference); await env.flush();
      assert.equal(env.intervals.size, 0, `${kind}: initial reduced motion must disable automatic changes`);
      const before = env.grid.innerHTML; env.next.click();
      assert.notEqual(env.grid.innerHTML, before, `${kind}: manual navigation must remain available`);
    }
    console.log('PASS', kind, 'respects OS/internal reduced motion without disabling manual navigation');

    const env = await setup(kind);
    assert.equal(env.intervals.size, 1);
    const before = env.grid.innerHTML; env.tick();
    assert.notEqual(env.grid.innerHTML, before, `${kind}: rotation changes the visible trio`);
    env.root.classList.add('a11y-reduce-motion'); await env.flush();
    assert.equal(env.intervals.size, 0, `${kind}: changing internal preference must stop an existing timer`);
    env.root.classList.remove('a11y-reduce-motion'); await env.flush();
    assert.equal(env.intervals.size, 1);
    env.media.set(true);
    assert.equal(env.intervals.size, 0, `${kind}: OS preference change must stop an existing timer`);
    env.media.set(false);
    assert.equal(env.intervals.size, 1);

    env.section.hovered = true; env.section.dispatch('mouseenter');
    assert.equal(env.intervals.size, 0);
    env.media.set(true); env.media.set(false);
    assert.equal(env.intervals.size, 0, `${kind}: preference changes must not resume rotation while hovered`);
    env.section.hovered = false; env.section.dispatch('mouseleave');
    assert.equal(env.intervals.size, 1);
    env.document.activeElement = env.next; env.section.dispatch('focusin');
    assert.equal(env.intervals.size, 0);
    env.section.dispatch('mouseleave');
    assert.equal(env.intervals.size, 0, `${kind}: pointer leaving must not override keyboard focus`);
    env.document.activeElement = null; env.section.dispatch('focusout'); await env.flush();
    assert.equal(env.intervals.size, 1);
    console.log('PASS', kind, 'updates existing timers and preserves hover/keyboard pauses');

    const fallback = await setup(kind, {hasObserver: false});
    assert.equal(fallback.grid.querySelectorAll('.reveal').length, 3);
    assert.ok(fallback.grid.querySelectorAll('.reveal').every(card => card.classList.contains('visible')),
      `${kind}: cards must stay readable without IntersectionObserver`);
    const first = fallback.grid.innerHTML; fallback.next.click();
    assert.notEqual(fallback.grid.innerHTML, first);
    console.log('PASS', kind, 'renders and navigates without IntersectionObserver');
  }
  console.log('Home previews: 6/6 behavior groups passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
