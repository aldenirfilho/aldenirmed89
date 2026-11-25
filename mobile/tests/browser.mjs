// Optional visual QA: npm install --no-save --package-lock=false playwright
// Then npm run build && node tests/browser.mjs (uses installed Google Chrome).
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const { chromium } = playwright;

const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!path.startsWith(`${root}/`)) { res.writeHead(403).end(); return; }
  try { const content = await readFile(path); res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream'); res.end(content); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => document.querySelector('#task-status').textContent.length > 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator('#task').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page.locator('#task').fill('Rever uma dúvida');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page.locator('#task').fill('Deixar a próxima peça');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  assert.equal(await page.locator('#task').isDisabled(), true);
  assert.equal(await page.locator('#tasks img').count(), 0);
  await page.locator('#note').fill('Minha próxima peça é comparar dois conceitos.');
  await page.reload();
  assert.equal(await page.locator('#tasks li').count(), 3);
  assert.equal(await page.locator('#note').inputValue(), 'Minha próxima peça é comparar dois conceitos.');
  await page.locator('#tasks li').first().getByRole('button').click();
  await page.locator('#task').fill('Explicar um conceito sem consultar');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page.locator('[data-tab="today"]').click();
  await mkdir('build/qa', { recursive: true });
  await page.screenshot({ path: 'build/qa/mobile-today.png' });
  await page.locator('[data-tab="cards"]').click();
  await page.getByRole('button', { name: 'Mostrar resposta' }).click();
  assert.equal(await page.locator('#card-answer').isVisible(), true);
  await page.locator('[data-days="14"]').click();
  assert.match(await page.locator('#review-status').textContent(), /Revisão marcada/);
  await page.locator('#favorite').click();
  await page.locator('[data-tab="library"]').click();
  assert.equal(await page.locator('#favorites article').count(), 1);
  await page.locator('[data-tab="account"]').click();
  await page.waitForFunction(() => document.querySelector('#account-configuration').textContent.includes('preparação'));
  assert.equal(await page.locator('#login-form').isVisible(), false);
  assert.equal(await page.locator('a[href^="http"]').count(), 0);
  await context.setOffline(true);
  await page.locator('[data-tab="cards"]').click();
  await page.getByRole('button', { name: 'Mostrar resposta' }).click();
  assert.equal(await page.locator('#card-answer').isVisible(), true);
  await page.screenshot({ path: 'build/qa/mobile-cards.png' });
  assert.deepEqual(errors, []);
  console.log('PASS: mobile 390×844, tarefas/notas persistentes, texto seguro, cartões/revisão/favoritos, conta indisponível, ações offline e sem erro JS.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
