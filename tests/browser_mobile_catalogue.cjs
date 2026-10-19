'use strict';
// Serve the checkout over HTTP; optional CHROME_BIN, MOBILE_BASE, MOBILE_PROOF_DIR.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = new URL(process.env.MOBILE_BASE || 'http://127.0.0.1:8873/');
assert(base.pathname.endsWith('/'), 'MOBILE_BASE must end in /');
const resolve = relative => new URL(relative, base).href;
const proofDir = process.env.MOBILE_PROOF_DIR;
if (proofDir) fs.mkdirSync(proofDir, {recursive:true});
const proof = {generatedAt:new Date().toISOString(), base:base.href, status:'running',
  checks:[], viewports:[], screenshots:[], pageErrors:[], installRequests:[],
  limits:['Desktop Chromium with mobile touch viewports; not a physical phone or a 4G measurement.',
    'Stored response sizes are uncompressed payload sizes, not mobile network transfer.',
    'Installation failure and replacement of an active older worker are not injected in this browser scenario.']};
let browser, page, phase = 'setup';
async function screenshot(name) {
  if (!proofDir) return;
  await page.screenshot({path:path.join(proofDir,name), fullPage:false});
  proof.screenshots.push(name);
}
async function ready() {
  await page.waitForFunction(() => document.querySelector('#projectCount')?.textContent === '54');
  assert.equal(await page.locator('#rootCount').textContent(), '10');
}
async function reset() {
  await page.locator('#clearFilters').click();
  await page.waitForFunction(() => document.querySelectorAll('.project-card').length === 54);
  assert.equal(await page.locator('#resultsStatus').textContent(), '54 de 54 iniciativas exibidas.');
  assert.equal(await page.locator('#searchInput').inputValue(), '');
  for (const id of ['rootSelect','prioritySelect']) assert.equal(await page.locator('#'+id).inputValue(), 'all');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'searchInput');
}
async function search() {
  await page.locator('#searchInput').fill('TEMI');
  await page.waitForFunction(() => {
    const count = document.querySelectorAll('.project-card').length;
    return count > 0 && count < 54;
  });
  const count = await page.locator('.project-card').count();
  assert.equal(await page.locator('#resultsStatus').textContent(), `${count} de 54 iniciativas exibidas.`);
}
async function noOverflow(width, label) {
  await page.setViewportSize({width,height:844});
  const dimensions = await page.evaluate(() => ({viewport:innerWidth,
    document:document.documentElement.scrollWidth, body:document.body.scrollWidth}));
  assert(dimensions.document <= dimensions.viewport && dimensions.body <= dimensions.viewport,
    `${label}: horizontal overflow at ${width}px: ${JSON.stringify(dimensions)}`);
  proof.viewports.push({width,label,...dimensions});
}
async function resourcesAvailable(paths) {
  return page.evaluate(async urls => Promise.all(urls.map(async url => {
    const cached = await caches.match(url);
    if (!cached) throw Error('Missing Cache Storage entry: '+url);
    const cachedBytes = (await cached.arrayBuffer()).byteLength;
    const response = await fetch(url,{cache:'no-store'});
    if (!response.ok) throw Error('Resource unavailable: '+url+' '+response.status);
    const responseBytes = (await response.arrayBuffer()).byteLength;
    if (!cachedBytes || responseBytes !== cachedBytes) throw Error('Cached payload mismatch: '+url);
    return {path:new URL(url).pathname,cachedBytes,responseBytes};
  })), paths);
}
async function run() {
  browser = await chromium.launch({headless:true,
    ...(process.env.CHROME_BIN ? {executablePath:process.env.CHROME_BIN} : {})});
  proof.browserVersion = browser.version();
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,
    hasTouch:true,colorScheme:'dark',reducedMotion:'reduce',serviceWorkers:'allow'});
  context.setDefaultTimeout(20000);
  context.setDefaultNavigationTimeout(45000);
  context.on('request', request => {
    const parsed = new URL(request.url());
    if (phase === 'installation' && parsed.origin === base.origin) proof.installRequests.push(parsed.pathname);
  });
  page = await context.newPage();
  page.on('pageerror', error => proof.pageErrors.push({phase,message:error.message}));
  phase = 'installation';
  await page.goto(resolve('ecossistema/'));
  await ready();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => navigator.serviceWorker.controller?.state === 'activated');
  proof.installedCache = await page.evaluate(async () => {
    const names = (await caches.keys()).filter(name => name.startsWith('antigravity-root-'));
    const entries = [];
    for (const name of names) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) entries.push({path:new URL(request.url).pathname,
        uncompressedBytes:(await (await cache.match(request)).arrayBuffer()).byteLength});
    }
    return {names,entries,uncompressedBytes:entries.reduce((sum,item) => sum+item.uncompressedBytes,0)};
  });
  assert.equal(proof.installedCache.names.length,1);
  const isCourse = value => /\/01_Modulos_Clinicos\//.test(value) && !value.includes('/assets/icons/');
  assert(!proof.installedCache.entries.some(item => isCourse(item.path)), 'Course was precached before a visit');
  assert(!proof.installRequests.some(isCourse), 'Installation requested course content');
  proof.checks.push('No course content requested or precached before a visit.');
  phase = 'catalogue-controls';
  for (const width of [390,375]) {
    await noOverflow(width,'catalogue'); await reset(); await search(); await reset();
    const root = await page.locator('#rootSelect option').nth(1).getAttribute('value');
    for (const [selector,value,field] of [['rootSelect',root,'root'],['prioritySelect','agora','priority']]) {
      await page.locator('#'+selector).selectOption(value);
      await page.waitForFunction(({value,field}) => {
        const cards = [...document.querySelectorAll('.project-card')];
        return cards.length > 0 && cards.length < 54 && cards.every(card => card.dataset[field] === value);
      }, {value,field});
      await reset();
    }
    const summaries = page.locator('.project-card summary');
    await summaries.nth(0).focus(); await summaries.nth(0).press('Enter');
    await page.waitForFunction(() => document.querySelectorAll('.project-card details[open]').length === 1);
    await summaries.nth(1).focus(); await summaries.nth(1).press('Enter');
    await page.waitForFunction(() => {
      const details = document.querySelectorAll('.project-card details');
      return !details[0].open && details[1].open;
    });
    await noOverflow(width,'expanded-details'); await screenshot(`catalogue-${width}-details.png`);
    await page.locator('#collapseAll').click();
    assert.equal(await page.locator('.project-card details[open]').count(),0);
    proof.checks.push(`${width}px: layout, search, root/priority filters, reset/focus and keyboard details.`);
  }
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await page.locator('#themeButton').click();
  const selectedTheme = initialTheme === 'dark' ? 'light' : 'dark';
  assert.equal(await page.locator('html').getAttribute('data-theme'),selectedTheme);
  assert.equal(await page.locator('#themeButton').getAttribute('aria-label'),
    selectedTheme === 'light' ? 'Usar tema escuro' : 'Usar tema claro');
  await noOverflow(375,'alternate-theme');
  await page.locator('#catalogo').scrollIntoViewIfNeeded(); await screenshot('catalogue-375-theme.png');
  phase = 'catalogue-offline'; await context.setOffline(true);
  for (const route of ['ecossistema/','ecossistema/index.html']) {
    const response = await page.goto(resolve(route));
    assert(response.fromServiceWorker(), route+' must be served by the worker');
    await ready();
    assert.equal(await page.locator('html').getAttribute('data-theme'),selectedTheme);
    await search(); await reset();
  }
  proof.catalogueOffline = await resourcesAvailable(['ecossistema/assets/styles.css',
    'ecossistema/assets/app.js','ecossistema/data/catalog.json'].map(resolve));
  await page.locator('#catalogo').scrollIntoViewIfNeeded(); await screenshot('catalogue-offline.png');
  await page.locator('#themeButton').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),initialTheme);
  proof.checks.push('Both catalogue URLs, resources, search and persisted/reset theme work offline.');
  phase = 'home-offline';
  const homeResponse = await page.goto(resolve('index.html#top'));
  assert(homeResponse.fromServiceWorker(),'Home must be served by the worker');
  const skip = page.locator('#missionSkip');
  if (await skip.isVisible()) await skip.click();
  const quick = page.locator('#quickSearch'); await quick.fill('ECG');
  await page.waitForFunction(() => document.querySelectorAll('#quickResults a').length > 0);
  await quick.press('ArrowDown');
  assert(await page.evaluate(() => document.querySelector('#quickResults').contains(document.activeElement)));
  proof.homeOffline = await resourcesAvailable(['assets/site-navigation.css','assets/site-navigation.js'].map(resolve));
  await screenshot('home-offline-search.png');
  await quick.press('Escape'); assert.equal(await quick.inputValue(),'');
  assert(await page.locator('#quickResults').evaluate(element => element.hidden));
  proof.checks.push('Home quick search, keyboard controls and CSS/JS work offline.');
  phase = 'course-online'; await context.setOffline(false);
  const course = '01_Modulos_Clinicos/Almanaque_ECG/';
  await page.goto(resolve(course+'index.html'));
  await page.waitForFunction(() => document.querySelectorAll('#patternGrid .pattern-card').length === 60);
  const image = page.locator('#patternGrid img').first();
  await image.scrollIntoViewIfNeeded(); await image.evaluate(element => element.decode());
  const imageURL = await image.evaluate(element => element.currentSrc);
  assert(imageURL.startsWith(resolve(course)),'Expected a same-origin course image');
  const courseResources = ['assets/styles.css','assets/app.js','data/catalog.js','data/catalog-31-60.js']
    .map(relative => resolve(course+relative)).concat(imageURL);
  proof.courseOnline = await resourcesAvailable(courseResources);
  phase = 'course-offline'; await context.setOffline(true);
  const courseResponse = await page.reload();
  assert(courseResponse.fromServiceWorker(),'Visited course must be served by the worker');
  await page.waitForFunction(() => document.querySelectorAll('#patternGrid .pattern-card').length === 60);
  const offlineImage = page.locator('#patternGrid img').first();
  await offlineImage.scrollIntoViewIfNeeded(); await offlineImage.evaluate(element => element.decode());
  assert(await offlineImage.evaluate(element => element.naturalWidth > 0));
  proof.courseOffline = await resourcesAvailable(courseResources);
  await screenshot('visited-course-offline.png');
  proof.checks.push('Visited course: 60 models render offline with CSS, JS/data scripts and a loaded image.');
  assert.deepEqual(proof.pageErrors.filter(error => error.phase !== 'home-offline'),[],
    'Unexpected catalogue or course JavaScript error');
  proof.status = 'passed';
}
run().catch(error => {
  proof.status = 'failed'; proof.error = {message:error.message,stack:error.stack};
  console.error(error); process.exitCode = 1;
}).finally(async () => {
  if (proof.status === 'failed' && page && proofDir) {
    try { await screenshot('failure.png'); } catch (_) { /* Preserve original failure. */ }
  }
  if (proofDir) fs.writeFileSync(path.join(proofDir,'mobile-browser-proof.json'),JSON.stringify(proof,null,2)+'\n');
  console.log(JSON.stringify({status:proof.status,browserVersion:proof.browserVersion,
    checks:proof.checks,installedResources:proof.installedCache?.entries.length,proofDir:proofDir || null},null,2));
  if (browser) await browser.close();
});
