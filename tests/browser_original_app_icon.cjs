'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.ICON_TEST_BASE || 'http://127.0.0.1:8873/aldenirmed89/site/';
(async () => {
  const browser = await chromium.launch({channel:'chrome', headless:true});
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const path of ['', '24_Semiologia/Cardiovascular/index.html']) {
      await page.goto(base + path, {waitUntil:'load'});
      const client = await context.newCDPSession(page);
      const app = await client.send('Page.getAppManifest');
      assert.equal(app.errors.length, 0, JSON.stringify(app.errors));
      const manifest = JSON.parse(app.data);
      assert.equal(manifest.id, './');
      assert(manifest.icons.every(icon => icon.src.includes('/aerospace-v2/')));
      const icons = await page.locator('head link[rel="icon"],head link[rel="apple-touch-icon"]').evaluateAll(links => links.map(link => link.href));
      assert(icons.length >= 2);
      assert(icons.every(url => url.includes('/aerospace-v2/')));
      for (const url of icons) {
        const response = await context.request.get(url);
        assert.equal(response.status(), 200, url);
        assert((await response.body()).length > 100);
      }
      const dimensions = await page.evaluate(async url => {
        const image = new Image(); image.src = url; await image.decode();
        return [image.naturalWidth, image.naturalHeight];
      }, new URL('assets/icons/aerospace-v2/icon-512.png', base).href);
      assert.deepEqual(dimensions, [512,512]);
      await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
      const current = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
      assert(current.icons.every(icon => icon.src.includes('/aerospace-v2/')));
      await client.detach();
      console.log(JSON.stringify({page:path || '/', manifest:app.url, icons:icons.length, decodedIcon:dimensions}));
    }
    assert.deepEqual(errors, []);
    await context.close();
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exit(1);});
