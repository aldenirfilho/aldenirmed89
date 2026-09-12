'use strict';
// DOM e rede controlados: apenas dados sintéticos, sem conexão externa.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assets = path.join(__dirname, '../18_Centro_Tripulacao/assets');
const tick = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}
class Element {
  constructor() { this.value=''; this.textContent=''; this.disabled=false; this.files=[]; this.children=[]; this.handlers={}; this.attrs={}; }
  addEventListener(type, fn) { this.handlers[type] = fn; }
  setAttribute(key, value) { this.attrs[key] = value; }
  replaceChildren(...nodes) { this.children = nodes; }
  append(...nodes) { this.children.push(...nodes); }
  focus() {}
  click() { return this.handlers.click?.({target:this}); }
}
function report(views = 3) {
  return {schemaVersion:1,status:'ready',source:{provider:'TESTE SINTÉTICO',generatedAt:'2026-09-11T15:00:00Z',timezone:'UTC',method:'Fixture sintética.',sourceSha256:null,excludedRows:0,coverage:'Teste, não publicar.'},days:[{date:'2026-09-11',visitors:1,views,pages:[{path:'/aldenirmed89/',views}]}]};
}
function setup() {
  const elements = new Map(), pending = [], timers = new Map();
  let serial = 0;
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  const sandbox = {
    document:{getElementById:get, createElement:()=>new Element()},
    Intl, Date, AbortController, Blob, URL,
    setTimeout:fn=>{const id=++serial;timers.set(id,fn);return id;},
    clearTimeout:id=>timers.delete(id),
    fetch:(url,options)=>{assert.equal(url,'./data/daily-visits.json');assert.equal(options.method,undefined);const d=deferred();pending.push({...d,options});return d.promise;}
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(assets,'daily-metrics-core.js'),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(assets,'daily-metrics.js'),'utf8'),ctx);
  return {
    get,pending,timers,
    respond:(index,data)=>pending[index].resolve({ok:true,json:async()=>data}),
    importFile:file=>{const input=get('importDaily');input.files=[file];return input.handlers.change({target:input});},
    importReport:data=>{const input=get('importDaily');input.files=[{size:100,text:async()=>JSON.stringify(data)}];return input.handlers.change({target:input});}
  };
}
(async()=>{
  let passed=0;
  {
    const x=setup();const data=report();data.status='unavailable';data.days=[];
    x.respond(0,data);await tick();
    assert.equal(x.get('dailyViews').textContent,'—');assert.equal(x.get('exportDaily').disabled,true);passed++;
  }
  {
    const x=setup();await x.importReport(report(8));
    x.respond(0,report(1));await tick();
    assert.equal(x.get('dailyViews').textContent,'8');assert.match(x.get('dailySource').textContent,/Arquivo local/);
    assert.equal(x.pending.length,1);assert.equal(x.pending[0].options.signal.aborted,true);passed++;
  }
  {
    const x=setup();await x.importReport(report(8));
    await x.importFile({size:4,text:async()=>'{bad'});
    assert.equal(x.get('dailyViews').textContent,'8');assert.match(x.get('dailyStatus').textContent,/relatório anterior foi mantido/);passed++;
  }
  {
    const x=setup();let read=false;
    await x.importFile({size:5000001,text:async()=>{read=true;return '{}';}});
    assert.equal(read,false);assert.match(x.get('dailyStatus').textContent,/5 MB/);passed++;
  }
  {
    const x=setup(), slow=deferred();
    const first=x.importFile({size:100,text:()=>slow.promise});
    await x.importReport(report(12));slow.resolve(JSON.stringify(report(4)));await first;
    assert.equal(x.get('dailyViews').textContent,'12');passed++;
  }
  {
    const x=setup();await x.importReport(report(8));
    const loading=x.get('dailyRefresh').click();x.pending[1].reject(Error('offline'));await loading;
    assert.equal(x.get('dailyViews').textContent,'8');assert.match(x.get('dailySource').textContent,/Arquivo local/);
    assert.match(x.get('dailyStatus').textContent,/relatório anterior foi mantido/);assert.equal(x.get('dailyRefresh').disabled,false);passed++;
  }
  {
    const x=setup();await x.importReport(report(8));x.get('discardDaily').click();
    assert.equal(x.get('dailyViews').textContent,'—');assert.equal(x.get('dailySource').textContent,'');
    assert.equal(x.get('dailyRows').children.length,0);assert.equal(x.get('exportDaily').disabled,true);
    x.pending[1].reject(Error('offline'));await tick();assert.equal(x.get('dailyViews').textContent,'—');passed++;
  }
  {
    const x=setup();await x.importReport(report(8));
    const loading=x.get('dailyRefresh').click();x.respond(1,report(2));await loading;
    assert.equal(x.get('dailyViews').textContent,'2');assert.match(x.get('dailySource').textContent,/Relatório publicado/);
    assert.equal(x.get('discardDaily').disabled,true);passed++;
  }
  {
    const x=setup();await x.importReport(report(8));
    x.get('dailyStart').value='2026-09-12';x.get('dailyEnd').value='2026-09-11';
    x.get('dailyStart').handlers.change();assert.equal(x.get('exportDaily').disabled,true);assert.equal(x.get('dailyViews').textContent,'—');passed++;
  }
  {
    const x=setup();for(const fn of x.timers.values())fn();
    assert.equal(x.pending[0].options.signal.aborted,true);
    x.pending[0].reject(Error('timeout'));await tick();assert.equal(x.get('dailyRefresh').disabled,false);passed++;
  }
  console.log(`${passed} cenários de concorrência, privacidade e erro aprovados.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
