'use strict';

// Start an HTTP preview, then run with NODE_PATH pointing to the bundled Playwright.
// Optional: env 360X_BASE_URL=http://127.0.0.1:8769/ node tests/browser_360x_accessibility.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');

const directory = JSON.parse(fs.readFileSync(path.join(__dirname, '../ecossistema/data/sites-360x.json'), 'utf8'));
const projects = directory.projects;
const trails = JSON.parse(fs.readFileSync(path.join(__dirname, '../ecossistema/data/trilhas-360x.json'), 'utf8')).trails;
const base = process.env['360X_BASE_URL'] || 'http://127.0.0.1:8769/';
const mapURL = new URL('ecossistema/mapa.html', base.endsWith('/') ? base : `${base}/`).href;
const scenarioFilter = process.env['360X_SCENARIOS'] ? new RegExp(process.env['360X_SCENARIOS'], 'i') : null;
const launch = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, headless: true}
  : {channel: 'chrome', headless: true};

async function ready(page) {
  await page.goto(mapURL, {waitUntil: 'load'});
  try {
    await page.waitForFunction(count => {
      const status = document.getElementById('mapCount');
      return status && status.textContent.includes(`${count} de ${count}`);
    }, projects.length);
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      title: document.title,
      count: document.getElementById('mapCount')?.textContent,
      error: document.getElementById('mapError')?.textContent
    }));
    throw new Error(`Mapa indisponível: ${JSON.stringify(diagnostic)}; eventos: ${JSON.stringify(page.mapDiagnostics || [])}`, {cause: error});
  }
  assert.equal(await page.locator('#mapError').isVisible(), false, 'O mapa deve carregar sem mensagem de erro.');
}

async function focusIsVisible(page) {
  return page.evaluate(() => {
    const focused = document.activeElement;
    const rect = focused.getBoundingClientRect();
    const viewport = document.getElementById('mapViewport').getBoundingClientRect();
    return {
      id: focused.id,
      isNode: focused.classList.contains('map-node'),
      visible: rect.width > 0 && rect.height > 0 &&
        rect.left >= viewport.left - 2 && rect.right <= viewport.right + 2 &&
        rect.top >= viewport.top - 2 && rect.bottom <= viewport.bottom + 2
    };
  });
}

(async () => {
  const browser = await chromium.launch(launch);
  let passed = 0;
  async function scenario(name, options, action) {
    if (scenarioFilter && !scenarioFilter.test(name)) return;
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}, serviceWorkers: 'block', ...options});
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.mapDiagnostics = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => page.mapDiagnostics.push({url: request.url(), failure: request.failure()}));
    page.on('response', response => {
      if (response.url().endsWith('.json')) page.mapDiagnostics.push({url: response.url(), status: response.status()});
    });
    page.on('console', async message => {
      if (!['warning', 'error'].includes(message.type())) return;
      page.mapDiagnostics.push({type: message.type(), text: message.text()});
      for (const argument of message.args()) {
        const stack = await argument.evaluate(value => value instanceof Error ? value.stack : null).catch(() => null);
        if (stack) page.mapDiagnostics.push({stack});
      }
    });
    try {
      await action(page, context);
      assert.deepEqual(errors, [], `${name}: nenhum erro JavaScript é esperado.`);
      passed += 1;
      console.log(JSON.stringify({scenario: name, status: 'passed'}));
    } finally { await context.close(); }
  }
  try {
    assert(projects.length >= 35, 'A regressão deve cobrir os 35 destinos já cadastrados.');

    await scenario('Tab mantém cada nó visível após ampliar', {}, async page => {
      await ready(page);
      await page.locator('#mapView').click();
      await page.locator('#mapZoomIn').click({clickCount: 3});
      const nodeCount = await page.locator('#mapNodes .map-node').count();
      const visited = new Set();
      await page.locator('#mapViewport').focus();
      for (let index = 0; index < nodeCount; index += 1) {
        await page.keyboard.press('Tab');
        const focused = await focusIsVisible(page);
        assert(focused.isNode, `Tab ${index + 1} deve alcançar um nó, recebeu ${focused.id}.`);
        assert(focused.visible, `O foco em ${focused.id} deve permanecer dentro do recorte do mapa.`);
        visited.add(focused.id);
      }
      assert.equal(visited.size, nodeCount, 'Todos os nós devem ser alcançáveis sem repetição por Tab.');
    });

    await scenario('320 pixels sem transbordamento horizontal', {viewport: {width: 320, height: 740}}, async page => {
      await ready(page);
      const widths = await page.evaluate(() => ({viewport: innerWidth, document: document.documentElement.scrollWidth}));
      assert(widths.document <= widths.viewport, JSON.stringify(widths));
      assert(await page.locator('#mapTheme').isVisible(), 'O controle de tema deve continuar visível.');
      assert(await page.locator('#listPanel').isVisible(), 'A leitura linear deve ser a vista inicial no celular.');
    });

    await scenario('Todos os destinos permanecem acessíveis sem JavaScript', {javaScriptEnabled: false}, async page => {
      await page.goto(mapURL, {waitUntil: 'load'});
      assert(await page.locator('#mapFallback').isVisible(), 'O diretório estático deve permanecer visível.');
      assert.equal(await page.locator('.map-explorer').isVisible(), false, 'Controles dependentes de JavaScript devem ser ocultados.');
      const links = page.locator('#mapFallback .fallback-grid a[href]');
      const actual = await links.evaluateAll(nodes => nodes.map(node => node.href).sort());
      const expected = projects.map(project => new URL(project.url).href).sort();
      assert.deepEqual(actual, expected, 'O fallback deve oferecer exatamente os mesmos destinos do catálogo canônico.');
      for (const link of await links.all()) assert(await link.isVisible(), 'Cada link estático deve ser visível.');
    });

    await scenario('Lista e filtros preservam os caminhos visíveis', {}, async page => {
      await ready(page);
      await page.locator('#listView').click();
      assert(await page.locator('#listPanel').isVisible());
      assert.equal(await page.locator('#graphPanel').isVisible(), false);
      await page.locator('#mapFilters [data-filter="clinica"]').click();
      const expected = projects.filter(project => project.category === 'Clínica e estudo').length;
      assert.equal(await page.locator('#projectList .project-row').count(), expected);
      for (const row of await page.locator('#projectList .project-row').all()) {
        assert(await row.locator('button').isVisible());
        assert(await row.locator('a[href]').isVisible());
      }
      await page.locator('#mapFilters [data-filter="all"]').click();
      assert.equal(await page.locator('#projectList .project-row').count(), projects.length);
    });

    await scenario('Busca vazia e visão geral preservam foco', {}, async page => {
      await ready(page);
      await page.locator('#listView').click();
      await page.locator('#mapSearch').focus();
      await page.locator('#mapSearch').pressSequentially('zzzz-sem-projeto-360x');
      assert.equal(await page.locator('#projectList .project-row').count(), 0);
      assert(await page.locator('#listEmpty').isVisible());
      assert.equal(await page.evaluate(() => document.activeElement.id), 'mapSearch');
      await page.locator('#mapReset').click();
      assert.equal(await page.locator('#mapSearch').inputValue(), '');
      assert.equal(await page.locator('#projectList .project-row').count(), projects.length);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'mapReset', 'Visão geral não deve perder foco para o body.');
    });

    await scenario('Tema claro e escuro persistem e alteram a superfície', {}, async page => {
      await ready(page);
      const before = await page.evaluate(() => ({theme: document.documentElement.dataset.theme, background: getComputedStyle(document.body).backgroundColor}));
      await page.locator('#mapTheme').click();
      const after = await page.evaluate(() => ({theme: document.documentElement.dataset.theme, background: getComputedStyle(document.body).backgroundColor}));
      assert.notEqual(after.theme, before.theme);
      assert.notEqual(after.background, before.background);
      await page.reload({waitUntil: 'load'});
      assert.equal(await page.locator('html').getAttribute('data-theme'), after.theme);
      await page.locator('#mapTheme').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), before.theme);
    });

    await scenario('Texto ampliado aplica e persiste a preferência compartilhada', {}, async page => {
      await ready(page);
      const normalSize = await page.locator('.detail-description').evaluate(node => parseFloat(getComputedStyle(node).fontSize));
      await page.locator('#mapLargeText').click();
      assert.equal(await page.locator('#mapLargeText').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('antigravity:a11y:v1')).large), true);
      await page.reload({waitUntil: 'load'});
      await page.waitForFunction(() => document.documentElement.dataset.largeText === 'true');
      const largeSize = await page.locator('.detail-description').evaluate(node => parseFloat(getComputedStyle(node).fontSize));
      assert(largeSize >= normalSize * 1.2, `O texto deve aumentar de fato: ${normalSize}px → ${largeSize}px.`);
      const widths = await page.evaluate(() => ({viewport: innerWidth, document: document.documentElement.scrollWidth}));
      assert(widths.document <= widths.viewport, 'Texto ampliado não deve provocar transbordamento horizontal.');
      await page.locator('#mapLargeText').click();
      assert.equal(await page.locator('#mapLargeText').getAttribute('aria-pressed'), 'false');
    });

    await scenario('Alto contraste informa o estado e persiste a preferência', {}, async page => {
      await ready(page);
      const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      await page.locator('#mapHighContrast').click();
      assert.equal(await page.locator('#mapHighContrast').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('antigravity:a11y:v1')).contrast), true);
      const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert.notEqual(after, before, 'Alto contraste deve alterar a superfície visual.');
      await page.reload({waitUntil: 'load'});
      await page.waitForFunction(() => document.documentElement.dataset.highContrast === 'true');
      await page.locator('#mapHighContrast').click();
      assert.equal(await page.locator('#mapHighContrast').getAttribute('aria-pressed'), 'false');
    });

    for (const trail of trails) {
      await scenario(`Trilha ${trail.id}: etapas, navegação, link e saída`, {}, async page => {
        await ready(page);
        await page.locator(`[data-trail="${trail.id}"]`).click();
        assert(await page.locator('#trailJourney').isVisible());
        assert.equal(await page.locator('#trailJourneyTitle').textContent(), trail.title);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'trailJourneyTitle');
        const stepIds = trail.steps.map(step => step.projectId);
        assert.deepEqual(await page.locator('#trailSteps [data-trail-project]').evaluateAll(nodes => nodes.map(node => node.dataset.trailProject)), stepIds);
        const navigation = page.getByRole('group', {name: 'Percorrer a trilha'});
        const previous = () => navigation.getByRole('button', {name: '← Anterior'});
        const next = () => navigation.getByRole('button', {name: 'Próximo →'});
        async function checkStep(index) {
          const projectId = stepIds[index];
          const project = projects.find(item => item.id === projectId);
          assert.equal(await page.locator('#trailSteps [aria-current="step"]').getAttribute('data-trail-project'), projectId);
          assert.equal(await page.locator('#detailBody .detail-action').getAttribute('href'), project.url);
          assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('projeto'), projectId);
          assert.equal(await previous().isDisabled(), index === 0);
          assert.equal(await next().isDisabled(), index === stepIds.length - 1);
        }
        await checkStep(0);
        await page.locator('#listView').click();
        assert(await page.locator('#listPanel').isVisible());
        assert.deepEqual(await page.locator('#projectList [data-project]').evaluateAll(nodes => nodes.map(node => node.dataset.project).sort()), [...stepIds].sort());
        assert((await page.locator('#mapCount').textContent()).includes(`${stepIds.length} de ${projects.length}`));
        for (let index = 1; index < stepIds.length; index += 1) {
          await next().click();
          await checkStep(index);
        }
        await previous().click();
        await checkStep(stepIds.length - 2);
        const sharedURL = page.url();
        assert.equal(new URLSearchParams(new URL(sharedURL).hash.slice(1)).get('trilha'), trail.id);
        await page.reload({waitUntil: 'load'});
        await page.waitForFunction(expected => document.querySelector('#trailSteps [aria-current="step"]')?.dataset.trailProject === expected, stepIds.at(-2));
        assert(await page.locator('#listPanel').isVisible(), 'O link deve restaurar também a vista em lista.');
        assert.equal(await page.locator('#trailJourneyTitle').textContent(), trail.title);
        await checkStep(stepIds.length - 2);
        await page.locator('#trailExit').click();
        assert.equal(await page.locator('#trailJourney').isVisible(), false);
        assert.equal(await page.locator('#projectList .project-row').count(), projects.length);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'mapSearch');
        const params = new URLSearchParams(new URL(page.url()).hash.slice(1));
        assert.equal(params.has('trilha'), false);
        assert.equal(params.has('projeto'), false);
      });
    }

    await scenario('Escolher etapa fora da busca preserva a trilha', {}, async page => {
      await ready(page);
      await page.locator('[data-trail="clinica-uti"]').click();
      await page.locator('#mapSearch').fill('Respira');
      assert((await page.locator('#mapCount').textContent()).includes(`2 de ${projects.length}`));
      await page.locator('#trailSteps [data-trail-project="aldenirmed"]').click();
      assert.equal(await page.locator('#mapSearch').inputValue(), '');
      assert.equal(await page.locator('#trailSteps [aria-current="step"]').getAttribute('data-trail-project'), 'aldenirmed');
      assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('trilha'), 'clinica-uti');
      assert.equal(await page.locator('#trailSteps .trail-step').count(), 7);
      assert((await page.locator('#mapCount').textContent()).includes(`7 de ${projects.length}`));
    });

    await scenario('Preferências de leitura combinam com armazenamento bloqueado', {}, async (page, context) => {
      await context.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new Error('Armazenamento bloqueado para a regressão'); }});
      });
      await ready(page);
      await page.locator('#mapLargeText').click();
      await page.locator('#mapHighContrast').click();
      assert.equal(await page.locator('html').getAttribute('data-large-text'), 'true');
      assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
      assert.equal(await page.locator('#mapLargeText').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#mapHighContrast').getAttribute('aria-pressed'), 'true');
      await page.locator('#mapHighContrast').click();
      assert.equal(await page.locator('html').getAttribute('data-large-text'), 'true');
      assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'false');
    });

    await scenario('Vitrine: link direto revela cartão fora da busca e move foco', {}, async page => {
      const catalogURL = new URL('ecossistema/index.html', base.endsWith('/') ? base : `${base}/`).href;
      await page.goto(catalogURL, {waitUntil: 'load'});
      await page.waitForFunction(count => document.querySelectorAll('#sitesGrid .site-card').length === count, projects.length);
      await page.locator('#sitesSearch').fill('plantas');
      assert((await page.locator('#sitesGrid .site-card').count()) < projects.length);
      assert.equal(await page.locator('#site-respiracrit').count(), 0, 'A busca inicial deve excluir o cartão do RespiraCrit.');
      await page.evaluate(() => { location.hash = '#site-respiracrit'; });
      await page.locator('#site-respiracrit').waitFor({state: 'visible'});
      assert.equal(await page.locator('#sitesSearch').inputValue(), '');
      assert.equal(await page.locator('#sitesGrid .site-card').count(), projects.length);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'site-respiracrit');
    });

    if (process.env['360X_CAPTURE_DIR']) {
      const output = process.env['360X_CAPTURE_DIR'];
      for (const [name, width, height] of [['desktop', 1440, 1450], ['mobile', 390, 1100]]) {
        const context = await browser.newContext({viewport: {width, height}, serviceWorkers: 'block'});
        try {
          const page = await context.newPage();
          await ready(page);
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({path: path.join(output, `360x-preview-${name}.png`)});
          await page.locator('[data-trail="clinica-uti"]').click();
          await page.locator('#trailJourney').screenshot({path: path.join(output, `360x-preview-trilha-${name}.png`)});
        } finally { await context.close(); }
      }
    }

    console.log(JSON.stringify({status: 'passed', scenarios: passed, projects: projects.length, trails: trails.length, url: mapURL}));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
