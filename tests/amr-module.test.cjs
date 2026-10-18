const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = require('node:path').resolve(__dirname, '../01_Modulos_Clinicos/Bacterias_Super_Resistentes') + require('node:path').sep;
const html = fs.readFileSync(base + 'index.html', 'utf8');
const code = fs.readFileSync(base + 'assets/app.js', 'utf8');
const strip = s => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
class Element {
  constructor(textContent = '', dataset = {}) { Object.assign(this, { textContent, dataset, listeners: {}, attributes: {}, value: '', hidden: false, checked: false }); }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  setAttribute(name, value) { this.attributes[name] = value; }
  focus() { this.focused = true; }
}
function setup(blocked = false) {
  const byId = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m => [m[1], new Element()]));
  const cards = [...html.matchAll(/<article class="panel mechanism" data-tags="([^"]+)">([\s\S]*?)<\/article>/g)].map(m => new Element(strip(m[2]), { tags: m[1] }));
  const rows = [...html.matchAll(/<tr data-tags="([^"]+)">([\s\S]*?)<\/tr>/g)].map(m => new Element(strip(m[2]), { tags: m[1] }));
  const checks = [...html.matchAll(/data-check="([^"]+)"/g)].map(m => new Element('', { check: m[1] }));
  const fieldsets = [...html.matchAll(/<fieldset class="panel checklist">([\s\S]*?)<\/fieldset>/g)].map(m => ({
    querySelector: () => new Element(strip(m[1].match(/<legend>([\s\S]*?)<\/legend>/)[1])),
    querySelectorAll: () => [...m[1].matchAll(/<label>([\s\S]*?)<\/label>/g)].map(x => new Element(strip(x[1])))
  }));
  const classes = new Set();
  const root = { dataset: { theme: 'light' }, style: {}, classList: { toggle(c, value) { if (value) classes.add(c); else classes.delete(c); }, remove(c) { classes.delete(c); } } };
  const meta = new Element();
  const data = new Map([
    ['antigravity:a11y:v1', JSON.stringify({ theme: 'dark', fontSize: 'large' })],
    ['antigravity:amr:study-checklist:v1', JSON.stringify({ 'initial-syndrome': true, unknown: 'private text must not be retained' })]
  ]);
  const localStorage = {
    getItem(k) { if (blocked) throw Error('blocked'); return data.get(k) ?? null; },
    setItem(k, v) { if (blocked) throw Error('blocked'); data.set(k, v); },
    removeItem(k) { if (blocked) throw Error('blocked'); data.delete(k); }
  };
  const queryAll = s => ({ '.mechanism': cards, '#doseBody tr': rows, '[data-check]': checks, '.checklist': fieldsets }[s] ?? []);
  const document = { documentElement: root, querySelector: s => s.startsWith('#') ? byId[s.slice(1)] : meta, querySelectorAll: queryAll };
  const window = { matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {}, isSecureContext: true, print() { window.printed = true; } };
  let copied;
  const navigator = { clipboard: { async writeText(text) { copied = text; } } };
  byId.mechanismFilter.value = 'all';
  vm.runInNewContext(code, { document, window, navigator, localStorage });
  return { byId, cards, rows, checks, root, data, window, copied: () => copied };
}
(async () => {
  const t = setup();
  assert.equal(t.cards.length, 5);
  assert.equal(t.rows.length, 10);
  assert.equal(t.checks.length, 12);
  assert.equal(t.root.dataset.theme, 'dark');
  assert.equal(t.byId.themeToggle.attributes['aria-pressed'], 'false');
  assert.equal(t.byId.themeToggle.attributes['aria-label'], 'Ativar visualização clara com fundo branco');
  assert.equal(t.checks.filter(x => x.checked).length, 1);
  t.byId.mechanismFilter.value = 'crab';
  t.byId.mechanismFilter.listeners.change();
  assert.equal(t.cards.filter(x => !x.hidden).length, 1);
  assert.equal(t.rows.filter(x => !x.hidden).length, 4);
  t.byId.amrSearch.value = 'zz-no-match';
  t.byId.amrSearch.listeners.input();
  assert.equal(t.byId.emptyMechanisms.hidden, false);
  assert.equal(t.byId.emptyDoses.hidden, false);
  t.byId.clearFilters.listeners.click();
  assert.equal(t.cards.filter(x => !x.hidden).length, 5);
  assert.equal(t.rows.filter(x => !x.hidden).length, 10);
  t.byId.amrSearch.value = 'SULBÁCTAM';
  t.byId.amrSearch.listeners.input();
  assert.equal(t.cards.filter(x => !x.hidden).length, 1);
  assert.equal(t.rows.filter(x => !x.hidden).length, 3);
  t.checks[1].checked = true;
  t.checks[1].listeners.change();
  const stored = JSON.parse(t.data.get('antigravity:amr:study-checklist:v1'));
  assert.equal(Object.keys(stored).length, 12);
  assert.ok(Object.values(stored).every(x => typeof x === 'boolean'));
  assert.equal(stored.unknown, undefined);
  await t.byId.copyChecklist.listeners.click();
  assert.ok(t.copied().includes('□ Confirmar síndrome'));
  assert.ok(!t.copied().includes('private text'));
  t.byId.resetChecklist.listeners.click();
  assert.equal(t.checks.filter(x => x.checked).length, 0);
  assert.ok(!t.data.has('antigravity:amr:study-checklist:v1'));
  assert.ok(t.data.has('antigravity:a11y:v1'));
  t.byId.themeToggle.listeners.click();
  assert.equal(t.root.dataset.theme, 'light');
  assert.equal(t.byId.themeToggle.attributes['aria-pressed'], 'true');
  assert.equal(t.byId.themeToggle.attributes['aria-label'], 'Ativar visualização escura');
  assert.equal(JSON.parse(t.data.get('antigravity:a11y:v1')).fontSize, 'large');
  t.byId.printButton.listeners.click();
  assert.equal(t.window.printed, true);
  const blocked = setup(true);
  blocked.byId.themeToggle.listeners.click();
  assert.equal(blocked.root.dataset.theme, 'dark');
  blocked.checks[0].checked = true;
  blocked.checks[0].listeners.change();
  assert.ok(blocked.byId.storageStatus.textContent.includes('indisponível'));
  blocked.window.isSecureContext = false;
  await blocked.byId.copyChecklist.listeners.click();
  assert.ok(blocked.byId.copyStatus.textContent.includes('indisponível'));
  console.log('PASS: 5 cenários / 10 doses / 12 checks; filtros, busca sem acento, vazio, reset, cópia, tema compartilhado, persistência booleana, impressão e storage bloqueado.');
})().catch(error => { console.error(error); process.exitCode = 1; });
