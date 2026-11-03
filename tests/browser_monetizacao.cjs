const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async () => {
  const output = path.join(os.tmpdir(), 'antigravity-monetizacao-qa'); fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const base = process.env.MONETIZATION_QA_URL || 'http://127.0.0.1:8873';
  const report = {passed:[],screenshots:[]};
  try {
    for (const width of [1440,390,320]) {
      const context = await browser.newContext({viewport:{width,height:950}});
      const page = await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+'/planos/', {waitUntil:'networkidle'});
      assert.equal(await page.locator('[data-plan]:disabled').count(),3);
      assert.equal(await page.locator('tbody tr').count(),12);
      assert.equal(await page.locator('h1').isVisible(),true);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      const shot=path.join(output,'planos-'+width+'.png');await page.screenshot({path:shot,fullPage:true});report.screenshots.push(shot);
      await page.goto(base+'/membros/',{waitUntil:'networkidle'});
      assert.match(await page.locator('#status').innerText(),/em preparação/);
      assert.equal(await page.locator('#login:disabled').count(),1);
      assert.equal(await page.locator('#signup:disabled').count(),1);
      assert.equal(await page.locator('[data-tier]:disabled').count(),3);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.equal(await page.evaluate(()=>localStorage.length),0);
      assert.deepEqual(errors,[]);report.passed.push('Planos e conta fechados, sem overflow/erro em '+width+'px');
      await context.close();
    }
    const nojs = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const page = await nojs.newPage();await page.goto(base+'/planos/');
    assert.equal(await page.locator('[data-plan]:disabled').count(),3);
    assert.match(await page.locator('body').innerText(),/R\$.*49/s);report.passed.push('Sem JavaScript: oferta legível e venda fechada');await nojs.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
