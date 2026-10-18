'use strict';
// Run against a local HTTP server or the deployed site after merging.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 const base=process.env.MOBILE_BASE||'http://127.0.0.1:8873/';
 try {
  await page.goto(new URL('ecossistema/',base).href);
  await page.waitForFunction(()=>document.querySelector('#projectCount').textContent==='54');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#searchInput').fill('TEMI');
  assert((await page.locator('.project-card').count()) > 0);
  assert((await page.locator('.project-card').count()) < 54);
  await page.locator('#clearFilters').click();
  await page.locator('#rootSelect').selectOption({index:1});
  assert.notEqual(await page.locator('#rootSelect').inputValue(),'all');
  await page.locator('#clearFilters').click();
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('#projectCount').textContent==='54');
  await page.locator('#searchInput').fill('TEMI');
  assert(await page.locator('#resultsStatus').textContent());
  console.log('PASS: mobile layout, search, filters, offline reload');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
