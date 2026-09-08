const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.CARDIO_BASE||'http://127.0.0.1:8873/';
const output=fs.mkdtempSync(require('node:path').join(require('node:os').tmpdir(),'semiologia-qa-'));
const KEY='aldenirmed89:semiologia-cardio:v1';
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('goatcounter')&&!m.text().includes('ERR_INTERNET_DISCONNECTED'))errors.push(m.text())});
await page.goto(base);
if(await page.locator('#missionSkip').isVisible())await page.locator('#missionSkip').click();
assert.equal(await page.locator('.neuro-feature,.mission-neuro-direct').count(),0);
await page.locator('.module-card[href="24_Semiologia/index.html"]').click();
await page.locator('a[href*="aprofundamento.html"]').first().click();
await page.locator('.module-return a[href="../../24_Semiologia/index.html"]').click();
await page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('disponíveis offline'),{},{timeout:30000});
await page.locator('a[href="Cardiovascular/index.html"]').click();await page.waitForFunction(()=>document.querySelector('#audio-player').readyState>=1);
assert.equal(await page.locator('[data-sound]').count(),30);assert.equal(await page.locator('.lesson').count(),16);
assert(await page.locator('#audio-player').evaluate(x=>x.paused));
assert(await page.locator('.sound-item').evaluateAll(items=>items.every(x=>x.scrollHeight<=x.clientHeight+2)), 'Catalog labels fit their buttons');
// Exercise every file in the native browser decoder/player; changing examples pauses playback.
const ids=await page.evaluate(()=>SEMIO_CARDIO.audio.map(x=>x.id));
for(const id of ids){await page.locator(`[data-sound="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('#audio-status').textContent.includes('Áudio pronto'));assert(await page.locator('#audio-player').evaluate(x=>x.paused));await page.locator('#audio-player').evaluate(x=>x.play());await page.waitForFunction(()=>document.querySelector('#audio-player').currentTime>0);}
await page.locator('#stop-audio').click();assert(await page.locator('#audio-player').evaluate(x=>x.paused&&x.currentTime===0));
await page.locator('#audio-speed').selectOption('0.75');assert.equal(await page.locator('#audio-player').evaluate(x=>x.playbackRate),.75);
await page.locator('#audio-loop').check();assert(await page.locator('#audio-player').evaluate(x=>x.loop));
await page.locator('#compare-a').selectOption('normal');await page.locator('#play-a').click();await page.waitForFunction(()=>document.querySelector('#audio-status').textContent.includes('Áudio pronto'));assert((await page.locator('#sound-title').textContent()).includes('B1'));
await page.locator('#start-blind').click();assert(await page.locator('#sound-details').isHidden());await page.locator('#blind-options button').first().click();assert.equal(await page.locator('#blind-options button:disabled').count(),5);assert(await page.locator('#blind-feedback').isVisible());await page.locator('#reveal-sound').click();
// Score all 20 cases, keep position after reload and prevent duplicate scores.
for(let i=0;i<20;i++){await page.locator('#case-select').selectOption(String(i));const correct=await page.evaluate(i=>SEMIO_CARDIO.cases[i].correct,i);await page.locator(`[data-answer="${correct}"]`).click();assert.equal(await page.locator('.option-comment').count(),4);}
assert.equal(await page.locator('#quiz-score').textContent(),'20 respondidos · 20 acertos');
await page.locator('[data-lesson]').first().check();await page.locator('#flash-reveal').click();await page.locator('#flash-known').click();assert((await page.locator('#flash-status').textContent()).includes('1 dia'));
await page.locator('#exam-checklist input').first().check();await page.reload();assert.equal(await page.locator('#quiz-position').textContent(),'Caso 20 de 20');assert.equal(await page.locator('#quiz-options button:disabled').count(),4);assert(await page.locator('[data-lesson]').first().isChecked());assert(await page.locator('#exam-checklist input').first().isChecked());
await page.locator('#course-search').fill('jugular');assert(await page.locator('#search-results a').count()>0);
await page.locator('#focus-buttons [data-focus="mitral"]').click();assert((await page.locator('#focus-info').textContent()).toLowerCase().includes('mitral'));
await page.locator('#maneuver-lesion').selectOption('hcm');await page.locator('[data-maneuver]').nth(1).click();assert((await page.locator('#maneuver-result').textContent()).length>60);
// Export/import, reject a corrupt file without clearing progress.
const downloadEvent=page.waitForEvent('download');await page.locator('#export-progress').click();const dl=await downloadEvent;await dl.saveAs(output+'/cardio-progress.json');const exported=JSON.parse(fs.readFileSync(output+'/cardio-progress.json','utf8'));assert.equal(Object.keys(exported.progress.caseAnswers).length,20);
await page.locator('#import-progress').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{"format":"bad"}')});await page.waitForFunction(()=>document.querySelector('#announcement').textContent.includes('inválido'));assert.equal(await page.locator('#quiz-score').textContent(),'20 respondidos · 20 acertos');
page.on('dialog',d=>d.accept());await page.locator('#import-progress').setInputFiles(output+'/cardio-progress.json');await page.waitForFunction(()=>document.querySelector('#announcement').textContent.includes('importado'));
// Empty scheduled queue remains usable via free practice.
await page.evaluate(KEY=>{const s=JSON.parse(localStorage.getItem(KEY));for(const c of SEMIO_CARDIO.flashcards)s.cards[c.id]={level:1,due:Date.now()+86400000};localStorage.setItem(KEY,JSON.stringify(s))},KEY);await page.reload();assert(await page.locator('#flash-reveal').isDisabled());await page.locator('#flash-mode').click();assert(await page.locator('#flash-reveal').isEnabled());
// Mobile/light preferences and appearance.
await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`overflow ${width}`);}
await page.setViewportSize({width:390,height:844});await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
await page.locator('#laboratorio').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/cardio-lab-mobile.png'});await page.locator('#theme-toggle').click();await page.setViewportSize({width:1440,height:1000});await page.locator('#laboratorio').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/cardio-lab-desktop.png'});
// Offline navigation and every audio, including an explicit Range request.
await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.includes('/24_Semiologia/sw.js'));
await context.setOffline(true);await page.goto(base+'24_Semiologia/index.html');await page.locator('a[href="Cardiovascular/index.html"]').click();await page.waitForFunction(()=>document.querySelector('#audio-status').textContent.includes('Áudio pronto'));
const offline=await page.evaluate(async()=>{let count=0;for(const a of SEMIO_CARDIO.audio){const r=await fetch(a.file);if(!r.ok)throw Error(a.file);const ab=await r.arrayBuffer();if(ab.byteLength<1000)throw Error('empty');count++;}const r=await fetch('assets/audio/normal.wav',{headers:{Range:'bytes=0-99'}});return {count,range:r.status,length:(await r.arrayBuffer()).byteLength};});assert.deepEqual(offline,{count:30,range:206,length:100});
await page.locator('#audio-player').evaluate(x=>x.play());await page.waitForFunction(()=>document.querySelector('#audio-player').currentTime>0);
await context.setOffline(false);
// Corrupt and denied storage do not prevent opening the course.
const denied=await browser.newContext({serviceWorkers:'block'});await denied.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value:()=>{throw Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value:()=>{throw Error('denied')}})});const p2=await denied.newPage();let deniedErrors=[];p2.on('pageerror',e=>deniedErrors.push(e.message));await p2.goto(base+'24_Semiologia/Cardiovascular/index.html');assert.equal(await p2.locator('#case-select option').count(),20);assert.equal(deniedErrors.length,0);await denied.close();
console.log(JSON.stringify({base,output,audiosPlayed:ids.length,cases:20,flashcards:49,offline,errors},null,2));assert.equal(errors.length,0);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
