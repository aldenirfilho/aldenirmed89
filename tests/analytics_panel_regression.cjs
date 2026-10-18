'use strict';

// Browser contract tests with a small DOM and an intercepted fetch boundary.
// No network, live GoatCounter data, browser profile, or package install is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'assets/site-analytics.js'), 'utf8');
const sourceConfig = JSON.parse(fs.readFileSync(path.join(root, 'data/site-analytics.json'), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));

class Element {
  constructor(tag, attributes = {}) {
    this.tagName = tag.toUpperCase();
    this.attributes = {...attributes};
    this.children = [];
    this.listeners = new Map();
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.parentElement = null;
    this.ownText = '';
  }
  set textContent(value) { this.ownText = String(value); this.children = []; }
  get textContent() { return this.ownText + this.children.map(child => child.textContent).join(''); }
  append(...children) {
    for (const child of children) { child.parentElement = this; this.children.push(child); }
  }
  replaceChildren(...children) { this.children = []; this.ownText = ''; this.append(...children); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  matches(selector) {
    if (selector.startsWith('[')) return Object.hasOwn(this.attributes, selector.slice(1, -1));
    return this.tagName === selector.toUpperCase();
  }
  querySelectorAll(selector) {
    return this.children.flatMap(child => [
      ...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector),
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) {
    return this.matches(selector) ? this : this.parentElement?.closest(selector) || null;
  }
  addEventListener(event, callback) {
    this.listeners.set(event, [...(this.listeners.get(event) || []), callback]);
  }
  dispatch(event) { for (const callback of this.listeners.get(event) || []) callback(); }
  click() { if (!this.disabled) this.dispatch('click'); }
}

function fakeClock() {
  let next = 0;
  const tasks = new Map();
  return {
    tasks,
    setTimeout(callback, delay) { const id = ++next; tasks.set(id, {callback, delay}); return id; },
    clearTimeout(id) { tasks.delete(id); },
    advance(milliseconds) {
      for (const [id, task] of [...tasks]) {
        if (task.delay <= milliseconds) { tasks.delete(id); task.callback(); }
        else task.delay -= milliseconds;
      }
    },
  };
}

const response = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() { return clone(payload); },
});
const idle = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };
const baseConfig = () => ({
  ...clone(sourceConfig),
  routes: [
    {path: 'index.html', label: 'Início'},
    {path: 'questoes/index.html', label: 'Questões'},
  ],
});

function createPanel({config = baseConfig(), counters, storageDenied = false,
  hostname = sourceConfig.publicHost, protocol = 'https:', lazy = false,
  configStatus = 200, configPending = false, enabled = true, counterEnabled = true} = {}) {
  const section = new Element('section', {'data-analytics-section': ''});
  section.hidden = true;
  const panel = new Element('div', {'data-analytics-panel': ''});
  const total = new Element('strong', {'data-analytics-total': ''}); total.textContent = '—';
  const ranking = new Element('ol', {'data-analytics-ranking': ''});
  const status = new Element('p', {'data-analytics-status': ''});
  const stamp = new Element('p', {'data-analytics-updated': ''});
  const refresh = new Element('button', {'data-analytics-refresh': ''});
  panel.append(total, ranking, status); section.append(panel, stamp, refresh);
  const loader = new Element('script');
  loader.dataset = {
    enabled: String(enabled), siteCode: sourceConfig.siteCode,
    publicHost: sourceConfig.publicHost, counterEnabled: String(counterEnabled),
    config: 'data/site-analytics.json',
  };
  const head = new Element('head');
  const requests = [];
  const observers = [];
  const clock = fakeClock();
  const win = {};
  Object.defineProperty(win, 'localStorage', {
    get() {
      if (storageDenied === true) throw new Error('SecurityError');
      return {getItem() {
        if (storageDenied === 'read') throw new Error('SecurityError');
        return null;
      }};
    },
  });
  if (lazy) win.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.disconnected = true; }
  };
  const document = {
    head,
    querySelector(selector) {
      return selector === 'script[data-antigravity-analytics]' ? loader
        : selector === '[data-analytics-panel]' ? panel : null;
    },
    createElement(tag) { return new Element(tag); },
  };
  const fetch = (url, options) => {
    requests.push({url, options});
    let result;
    if (url === loader.dataset.config) result = configPending
      ? new Promise(() => {}) : response(config, configStatus);
    else {
      const urlObject = new URL(url);
      const key = decodeURIComponent(urlObject.pathname).replace(/^\/counter\//, '').replace(/\.json$/, '');
      result = counters ? counters(key, requests) : response({count: key === 'TOTAL' ? '90' : '12'});
    }
    return new Promise((resolve, reject) => {
      const abort = () => { const error = new Error('Aborted'); error.name = 'AbortError'; reject(error); };
      options.signal.addEventListener('abort', abort, {once: true});
      Promise.resolve(result).then(resolve, reject);
    });
  };
  vm.runInNewContext(code, {
    window: win, document, location: {hostname, protocol}, fetch,
    AbortController, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    URL, console,
  });
  return {section, panel, total, ranking, status, stamp, refresh, head, requests, observers, clock};
}

const tests = [];
function test(name, body) { tests.push({name, body}); }
const links = env => env.ranking.querySelectorAll('a');
const finished = env => {
  assert.equal(env.panel.getAttribute('aria-busy'), 'false');
  assert.equal(env.refresh.disabled, false);
  assert.match(env.stamp.textContent, /Última consulta:/);
  assert.equal(env.clock.tasks.size, 0, 'all timeout handles must be released');
};

test('TOTAL unavailable preserves successful section counts and reports a partial query', async () => {
  const env = createPanel({counters: key => key === 'TOTAL' ? response({}, 403) : response({count: '31'})});
  await idle();
  assert.equal(env.section.hidden, false);
  assert.equal(env.total.textContent, '—');
  assert.equal(links(env).length, 2);
  assert.match(env.status.textContent, /parcial/i);
  assert.match(env.status.textContent, /não representam pessoas únicas/i);
  finished(env);
});

test('ranking unavailable preserves the real total without inventing section numbers', async () => {
  const env = createPanel({counters: key => key === 'TOTAL' ? response({count: '1.234'}) : response({}, 503)});
  await idle();
  assert.equal(env.total.textContent, '1.234');
  assert.equal(links(env).length, 0);
  assert.match(env.ranking.textContent, /indisponíveis/i);
  assert.match(env.status.textContent, /parcial/i);
  finished(env);
});

test('all 403 responses leave an explicit unknown state, never zero', async () => {
  const env = createPanel({counters: () => response({}, 403)});
  await idle();
  assert.equal(env.total.textContent, '—');
  assert.equal(links(env).length, 0);
  assert.match(env.status.textContent, /não significa zero/i);
  assert.match(env.status.textContent, /protocolo de ativação/i);
  finished(env);
});

test('invalid counter payloads do not enter the total or ranking', async () => {
  const env = createPanel({counters: key => response({count: key === 'TOTAL' ? '<img src=x onerror=alert(1)>' : -18})});
  await idle();
  assert.equal(env.total.textContent, '—');
  assert.equal(links(env).length, 0);
  assert.match(env.status.textContent, /não significa zero/i);
  assert.equal(env.ranking.querySelectorAll('img').length, 0);
  finished(env);
});

test('XSS labels are literal text; external, traversal and encoded paths are ignored', async () => {
  const config = baseConfig();
  config.routes = [
    {path: 'safe/index.html', label: '<img src=x onerror=alert(1)>'},
    {path: '../private.html', label: 'Traversal'},
    {path: 'https://evil.example/page.html', label: 'External'},
    {path: '%2e%2e/private.html', label: 'Encoded traversal'},
    {path: '//evil.example/page.html', label: 'Protocol relative'},
  ];
  const env = createPanel({config});
  await idle();
  assert.equal(env.requests.length, 3, 'only config, TOTAL and the safe route may be queried');
  assert.equal(links(env).length, 1);
  assert.equal(links(env)[0].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(links(env)[0].href, 'safe/');
  assert.equal(env.ranking.querySelectorAll('img').length, 0);
  finished(env);
});

test('malformed route entries are skipped while remaining valid routes still render', async () => {
  const config = baseConfig();
  config.routes = [null, false, 17, {}, ...config.routes];
  const env = createPanel({config});
  await idle();
  assert.equal(env.total.textContent, '90');
  assert.equal(links(env).length, 2);
  assert.equal(env.requests.length, 4);
  finished(env);
});

test('a normal HTML filename ending in index.html keeps its route and counter identity', async () => {
  const config = baseConfig();
  config.routes = [{path: 'guides/myindex.html', label: 'Página válida'}];
  const env = createPanel({config});
  await idle();
  assert.equal(links(env)[0].href, 'guides/myindex.html');
  assert.ok(env.requests.some(request => decodeURIComponent(request.url).includes('/aldenirmed89/guides/myindex.html')));
  finished(env);
});

test('timeouts abort pending requests, restore controls and preserve successful counts', async () => {
  const never = new Promise(() => {});
  const env = createPanel({counters: key => key === 'TOTAL' ? never : response({count: '21'})});
  await idle();
  assert.equal(env.refresh.disabled, true);
  assert.equal(env.panel.getAttribute('aria-busy'), 'true');
  env.clock.advance(8001);
  await idle();
  assert.equal(env.total.textContent, '—');
  assert.equal(links(env).length, 2);
  assert.match(env.status.textContent, /parcial/i);
  finished(env);
});

test('config timeout restores the button and shows unavailability without counter requests', async () => {
  const env = createPanel({configPending: true});
  await idle();
  assert.equal(env.refresh.disabled, true);
  env.clock.advance(8001);
  await idle();
  assert.equal(env.requests.length, 1);
  assert.match(env.status.textContent, /indisponíveis/i);
  finished(env);
});

test('double clicks and overlapping observer callbacks cannot duplicate a pending query', async () => {
  let release;
  const totalResponse = new Promise(resolve => { release = resolve; });
  const env = createPanel({lazy: true, counters: key => key === 'TOTAL' ? totalResponse : response({count: '11'})});
  assert.equal(env.requests.length, 0);
  env.refresh.click(); env.refresh.click();
  env.observers[0].callback([{isIntersecting: true}]);
  await idle();
  assert.equal(env.refresh.disabled, true);
  assert.equal(env.requests.length, 4);
  release(response({count: '70'}));
  await idle();
  assert.equal(env.total.textContent, '70');
  finished(env);
  env.refresh.click(); await idle();
  assert.equal(env.requests.length, 8, 'a completed query may be explicitly refreshed');
});

test('denied localStorage disables collection but the public panel remains operational', async () => {
  for (const storageDenied of [true, 'read']) {
    const env = createPanel({storageDenied});
    await idle();
    assert.equal(env.head.children.length, 0, 'no optional collector is injected');
    assert.equal(env.total.textContent, '90');
    assert.equal(links(env).length, 2);
    finished(env);
  }
});

test('localhost, HTTP and disabled previews send no external request or collector', async () => {
  for (const options of [{hostname: 'localhost'}, {protocol: 'http:'}, {enabled: false}, {counterEnabled: false, enabled: false}]) {
    const env = createPanel(options); await idle(); env.refresh.click(); await idle();
    assert.equal(env.requests.length, 0);
    assert.equal(env.head.children.length, 0);
    assert.equal(env.total.textContent, '—');
    assert.match(env.status.textContent, /Nenhum número foi estimado/i);
  }
});

(async () => {
  let failures = 0;
  for (const {name, body} of tests) {
    try { await body(); console.log('PASS', name); }
    catch (error) { failures++; console.error('FAIL', name, '\n ', error.message); }
  }
  console.log(`Analytics panel: ${tests.length - failures}/${tests.length} passed.`);
  process.exitCode = failures ? 1 : 0;
})();
