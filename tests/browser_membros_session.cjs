/* Regressão local da sessão de membros.
 * Executar: node tests/browser_membros_session.cjs
 * Opcionais: PLAYWRIGHT_MODULE, CHROMIUM_EXECUTABLE, MEMBERS_SITE_ROOT.
 * Usa Chrome isolado e respostas fictícias interceptadas; não acessa contas,
 * serviços de produção, perfil pessoal nem grava dados ou capturas.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(process.env.MEMBERS_SITE_ROOT || path.join(__dirname, '..'));
const ORIGIN = 'http://members-session.invalid';
const API = 'https://fixture-api.invalid';
const AUTH = 'https://fixture.supabase.co';
const candidates = [
  process.env.PLAYWRIGHT_MODULE,
  'playwright',
  path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),
].filter(Boolean);
let playwright;
for (const candidate of candidates) {
  try { playwright = require(candidate); break; } catch (_) {}
}
if (!playwright) throw new Error('Playwright indisponível. Defina PLAYWRIGHT_MODULE para uma instalação existente.');
const { chromium } = playwright;
const executablePath = [
  process.env.CHROMIUM_EXECUTABLE,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  chromium.executablePath(),
].filter(Boolean).find(file => fs.existsSync(file));
if (!executablePath) throw new Error('Navegador indisponível. Defina CHROMIUM_EXECUTABLE.');

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
function barrier() { return { started: deferred(), release: deferred() }; }
async function boundedClose(target) {
  if (!target) return;
  let timer;
  try {
    await Promise.race([
      target.close().catch(() => {}),
      new Promise(resolve => { timer = setTimeout(resolve, 1500); }),
    ]);
  } finally { clearTimeout(timer); }
}

let browser, context;
async function run() {
  browser = await chromium.launch({ headless: true, executablePath });
  context = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1080, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [], unexpected = [];
  page.on('pageerror', error => errors.push(error.message));
  const contentBarrier = barrier();
  let delayedMe = null;
  const account = {
    user: { id: '00000000-0000-4000-8000-000000000001' },
    tier: 'basico', features: ['microestudos'], subscriptions: [],
    content: [{ slug: 'material-ficticio', title: 'Material de teste autorizado', feature: 'microestudos' }],
  };
  const cors = {
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,apikey',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Cache-Control': 'no-store',
  };
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === ORIGIN) {
      if (url.pathname === '/membros/config.json') {
        return route.fulfill({ json: { apiBaseUrl: API, supabaseUrl: AUTH, supabasePublishableKey: 'sb_publishable_test' } });
      }
      const files = {
        '/membros/index.html': ['index.html', 'text/html; charset=utf-8'],
        '/membros/app.js': ['app.js', 'application/javascript; charset=utf-8'],
        '/membros/style.css': ['style.css', 'text/css; charset=utf-8'],
      };
      if (files[url.pathname]) {
        const [name, contentType] = files[url.pathname];
        return route.fulfill({ body: fs.readFileSync(path.join(ROOT, 'membros', name)), contentType });
      }
      if (url.pathname === '/favicon.ico') return route.fulfill({ status: 204 });
    }
    if ([API, AUTH].includes(url.origin) && request.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors });
    }
    if (url.origin === AUTH && url.pathname === '/auth/v1/token') {
      assert.equal(request.method(), 'POST');
      return route.fulfill({ headers: cors, json: { access_token: 'fixture-access-token' } });
    }
    if (url.origin === API && url.pathname === '/api/catalog') {
      return route.fulfill({ headers: cors, json: { salesEnabled: false } });
    }
    if (url.origin === API && url.pathname === '/api/me') {
      assert.equal(request.headers().authorization, 'Bearer fixture-access-token');
      const currentBarrier = delayedMe;
      delayedMe = null;
      if (currentBarrier) {
        currentBarrier.started.resolve();
        await currentBarrier.release.promise;
      }
      return route.fulfill({ headers: cors, json: account });
    }
    if (url.origin === API && url.pathname === '/api/content/material-ficticio') {
      assert.equal(request.headers().authorization, 'Bearer fixture-access-token');
      contentBarrier.started.resolve();
      await contentBarrier.release.promise;
      return route.fulfill({ headers: cors, contentType: 'text/plain; charset=utf-8', body: 'MATERIAL_PREMIUM_FICTICIO' });
    }
    unexpected.push(request.method() + ' ' + url.origin + url.pathname);
    return route.abort();
  });

  async function login() {
    await page.locator('#email').fill('fixture@example.invalid');
    await page.locator('#password').fill('fixture-only-password');
    await page.locator('#login').click();
    await page.waitForFunction(() => !document.getElementById('account').hidden && !document.getElementById('refresh').disabled);
  }
  async function settled(responsePromise) {
    await (await responsePromise).finished();
    // A resposta já terminou; aguarda as continuações de leitura e pintura do cliente.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.waitForTimeout(100);
  }
  async function assertSignedOut() {
    assert.equal(await page.locator('#account').isHidden(), true);
    assert.equal(await page.locator('#auth').isVisible(), true);
    assert.equal(await page.locator('#content').isHidden(), true);
    assert.equal(await page.locator('#content-text').textContent(), '');
    assert.equal(await page.locator('#content-catalog button').count(), 0);
    assert.equal(await page.locator('#features li').count(), 0);
  }

  await page.goto(ORIGIN + '/membros/index.html');
  await page.waitForFunction(() => !document.getElementById('login').disabled);
  await login();
  const material = page.locator('#content-catalog button');
  assert.equal(await material.count(), 1);
  assert.equal(await material.textContent(), 'Material de teste autorizado');
  console.log('PASS catálogo autorizado aparece como material clicável');

  const contentResponse = page.waitForResponse(response => response.url() === API + '/api/content/material-ficticio');
  await material.click();
  await contentBarrier.started.promise;
  await page.locator('#logout').click();
  await assertSignedOut();
  contentBarrier.release.resolve();
  await settled(contentResponse);
  await assertSignedOut();
  console.log('PASS material recebido após logout é descartado e não reaparece');

  await login();
  const refreshBarrier = barrier();
  delayedMe = refreshBarrier;
  const refreshResponse = page.waitForResponse(response => response.url() === API + '/api/me');
  await page.locator('#refresh').click();
  await refreshBarrier.started.promise;
  await page.locator('#logout').click();
  refreshBarrier.release.resolve();
  await settled(refreshResponse);
  await assertSignedOut();
  console.log('PASS atualização de conta recebida após logout não reabre painel ou catálogo');
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpected, []);
  console.log('PASS nenhum erro JavaScript ou acesso a serviço externo não simulado');
}

(async () => {
  let code = 0;
  try { await run(); }
  catch (error) { code = 1; console.error(error.stack || error); }
  finally {
    // O browser é exclusivo deste teste. O limite evita prender o comando em
    // versões de Chrome que demoram a encerrar após interceptação de requisições.
    await boundedClose(context);
    await boundedClose(browser);
  }
  process.exit(code);
})();
