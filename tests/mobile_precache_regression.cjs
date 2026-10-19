'use strict';
// Real worker code, controlled fetch/cache APIs: no browser or network required.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..'), scope = 'https://example.test/aldenirmed89/';
async function check(file, proposed) {
  const events = {}, stores = new Map([["antigravity-root-v42", new Map()], ["independent-module", new Map()]]), requests = [];
  let offline = false;
  const key = r => new URL(typeof r === 'string' ? r : r.url, scope).href;
  const fetch = async r => {
    if (offline) throw new Error('offline');
    const url = key(r), relative = new URL(url).pathname.replace('/aldenirmed89/', '');
    requests.push({url, bytes:0});
    const local = path.join(root, relative.split('?')[0] || 'index.html');
    const target = fs.statSync(local).isDirectory() ? path.join(local, 'index.html') : local;
    requests[requests.length-1].bytes = fs.statSync(target).size;
    const response = new Response(fs.readFileSync(target));
    Object.defineProperty(response, "type", {value:"basic"});
    return response;
  };
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const data = stores.get(name);
      return {
        async add(r) { const response = await fetch(r); data.set(key(r), response); },
        async addAll(rs) { for (const r of rs) await this.add(r); },
        async put(r, response) { data.set(key(r), response); },
        async match(r) { return data.get(key(r))?.clone(); }
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(n) { return stores.delete(n); },
    async match(r) { for (const data of stores.values()) if (data.has(key(r))) return data.get(key(r)).clone(); }
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    self: {location:{origin:new URL(scope).origin},registration:{scope},addEventListener:(n,f)=>events[n]=f,
      skipWaiting:async()=>{},clients:{claim:async()=>{}}},
    caches, fetch, URL, Request, Response
  });
  let task; events.install({waitUntil:p=>task=p}); await task;
  const result = {requests:requests.length, uncompressedBytes:requests.reduce((n,r)=>n+r.bytes,0)};
  if (proposed) {
    events.activate({waitUntil:p=>task=p}); await task;
    assert(!stores.has('antigravity-root-v42'));
    assert(stores.has('independent-module'));
    for (const asset of ['./assets/site-navigation.css','./assets/site-navigation.js'])
      assert(await caches.match(asset));
    assert(!requests.some(r=>/\/01_Modulos_Clinicos\/|\/22_Microparticulas/.test(r.url) && !r.url.includes('/assets/icons/')));
    async function serve(relative, mode='cors') {
      let response;
      events.fetch({request:{url:key(relative),method:'GET',mode,headers:new Headers()},respondWith:p=>response=p});
      return response;
    }
    // Runtime caching remains available for an educational page visited online.
    await serve('./01_Modulos_Clinicos/Almanaque_ECG/index.html','navigate');
    const courseCSS = await (await serve('./01_Modulos_Clinicos/Almanaque_ECG/assets/styles.css')).text();
    offline=true;
    assert.equal(await (await serve('./01_Modulos_Clinicos/Almanaque_ECG/assets/styles.css')).text(), courseCSS);
    for (const route of ['./ecossistema/','./ecossistema/index.html']) {
      assert((await (await serve(route,'navigate')).text()).includes('searchInput'));
    }
    for (const route of ['./ecossistema/assets/styles.css','./ecossistema/assets/app.js'])
      assert.equal((await serve(route)).status,200);
    const catalog = await (await serve('./ecossistema/data/catalog.json')).json();
    assert.equal(catalog.projects.length,54); assert.equal(catalog.roots.length,10);
    assert((await (await serve('./01_Modulos_Clinicos/Almanaque_ECG/index.html','navigate')).text()).includes('<html'));
    assert((await (await serve('./unvisited.html','navigate')).text()).includes('<html'));
    console.log('PASS: offline directory/index, catalogue JSON/CSS/JS, visited course and offline fallback');
  }
  return result;
}
(async()=>{
  const after = await check(path.join(root,'sw.js'),true);
  if(process.argv[2]) {
    const before = await check(path.resolve(process.argv[2]),false);
    console.log(JSON.stringify({before,after,avoidedRequests:before.requests-after.requests,
      avoidedUncompressedBytes:before.uncompressedBytes-after.uncompressedBytes},null,2));
  } else console.log(JSON.stringify({after},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
