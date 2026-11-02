import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateStudyBridge,PRIVATE_STUDY_MODES} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/private-study-bridge.mjs';
import {initLearning} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning.mjs';
import {REVIEW_STORAGE_KEY,emptyReview,recordReview} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/review-engine.mjs';
import {loadProgress} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-engine.mjs';
import {CARD_IDS} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-registry.mjs';

const settle = async () => { for(let i=0;i<8;i++) await Promise.resolve(); };
function fakePlayer(log) {
  return {setMode:mode=>log.push(['mode',mode]),setVisible:v=>log.push(['visible',v]),pause:()=>log.push(['pause']),dispose:()=>log.push(['dispose'])};
}
test('bridge loads only on private activation and reuses one player across origins and modes',async()=>{
  const host={hidden:false,textContent:''},log=[];let loads=0,mounts=0,opts;
  const bridge=createPrivateStudyBridge(host,{loadPlayer:async()=>{loads++;return (h,o)=>{mounts++;opts=o;assert.equal(h,host);return fakePlayer(log);};}});
  assert.equal(host.hidden,true);assert.equal(loads,0);
  bridge.setMode('review');bridge.setVisible(true);await bridge.setActive(true);
  assert.equal(loads,1);assert.equal(mounts,1);assert.equal(opts.initialMode,'review');assert.equal(opts.showNavigation,false);
  assert.deepEqual(log.slice(0,2),[['mode','review'],['visible',true]]);
  bridge.setActive(false);assert.equal(host.hidden,true);assert.deepEqual(log.slice(-2),[['visible',false],['pause']]);
  bridge.setMode('cards');bridge.setActive(true);assert.equal(mounts,1);assert.equal(loads,1);
  assert.deepEqual(log.slice(-1),[['visible',true]]);
  bridge.setActive(true);assert.equal(mounts,1);
});
test('async player is not mounted after cancellation or disposal, and reactivation retries safely',async()=>{
  let resolve;const module=new Promise(r=>resolve=r),host={hidden:false,textContent:''};let mounts=0;
  const bridge=createPrivateStudyBridge(host,{loadPlayer:()=>module});
  const pending=bridge.setActive(true);bridge.setActive(false);
  resolve(()=>{mounts++;return fakePlayer([]);});await pending;assert.equal(mounts,0);
  await bridge.setActive(true);assert.equal(mounts,1);bridge.dispose();bridge.dispose();
  const log=[];let end;const pendingMount=new Promise(r=>end=r);
  const second=createPrivateStudyBridge({}, {loadPlayer:async()=>()=>pendingMount});
  const wait=second.setActive(true);await settle();second.dispose();end(fakePlayer(log));await wait;
  assert.deepEqual(log,[['pause'],['dispose']]);
});
test('mode callbacks do not loop, unknown modes are ignored, hidden state always pauses',async()=>{
  const log=[],changes=[];let options;
  const bridge=createPrivateStudyBridge({}, {loadPlayer:async()=> (_h,o)=>{options=o;return { ...fakePlayer(log),setMode:mode=>{log.push(['mode',mode]);o.onModeChange(mode);}};},onModeChange:m=>changes.push(m)});
  await bridge.setActive(true);assert.deepEqual(changes,[]);
  bridge.setVisible(true);options.onModeChange('cards');assert.deepEqual(changes,['cards']);
  bridge.setMode('cards');bridge.setMode('constructor');options.onModeChange('constructor');assert.deepEqual(changes,['cards']);
  bridge.setVisible(false);assert.deepEqual(log.slice(-2),[['visible',false],['pause']]);
  assert.deepEqual(PRIVATE_STUDY_MODES,['flow','cases','cards','exam','review']);
});
test('loader failure gives a text-only local error and retry never falls back to a public record',async()=>{
  const host={};let calls=0;
  const bridge=createPrivateStudyBridge(host,{loadPlayer:async()=>{if(++calls===1)throw Error('private text must not render');return ()=>fakePlayer([]);}});
  await bridge.setActive(true);assert.match(host.textContent,/Não foi possível/);assert.doesNotMatch(host.textContent,/private text/);
  await bridge.setActive(true);assert.equal(calls,2);
});

async function withUI(run) {
  const keys=['document','window','localStorage','setInterval','clearInterval'];
  const descriptors=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const handlers={},elements=new Map(),storage=new Map(),ticks=[],playerLog=[],winHandlers={},docHandlers={};let playerOptions,mounts=0;
  const originalNow=Date.now;let now=1790000000000;Date.now=()=>now;
  const root={innerHTML:'',contains:n=>n?.owner===root,querySelectorAll:()=>[],querySelector(s){if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false});return elements.get(s);},addEventListener:(n,f)=>handlers[n]=f};
  const install=(k,v)=>Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true});
  const doc={activeElement:null,hidden:false,addEventListener:(n,f)=>docHandlers[n]=f};
  install('document',doc);install('window',{addEventListener:(n,f)=>winHandlers[n]=f});
  install('localStorage',{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)});
  install('setInterval',f=>{ticks.push(f);return ticks.length;});install('clearInterval',()=>{});
  try {
    const api=initLearning(root,{privatePlayerLoader:async()=> (_host,options)=>{mounts++;playerOptions=options;return fakePlayer(playerLog);}});api.setVisible(true);
    const click=dataset=>{const target={dataset,owner:root,closest(){return this;}};handlers.click({target});};
    await run({api,root,storage,playerLog,click,ticks,doc,docHandlers,winHandlers,advance:ms=>now+=ms,startExam(){root.querySelector('#exam-topic').value='dpoc';root.querySelector('#exam-count').value='6';root.querySelector('#exam-minutes').value='1';handlers.submit({target:{id:'exam-config'},preventDefault(){}});},options:()=>playerOptions,mounts:()=>mounts,body:()=>root.querySelector('#learn-body')});
  } finally {Date.now=originalNow;for(const k of keys){const d=descriptors.get(k);if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
}
test('same study controls select private review/remediation without writing public progress or counters',()=>withUI(async ui=>{
  assert.match(ui.root.innerHTML,/Biblioteca privada/);assert.equal(ui.mounts(),0);
  ui.api.openReview();ui.api.setOrigin('private');await settle();assert.equal(ui.mounts(),1);
  assert.equal(ui.options().initialMode,'review');assert.equal(ui.body().hidden,true);
  const before=[...ui.storage];ui.click({learn:'case-answer',answer:'0'});ui.click({learn:'review-clear-confirm'});
  ui.click({learnMode:'exam'});assert.equal(ui.api.getMode(),'exam');assert.deepEqual([...ui.storage],before);
  ui.options().onModeChange('cards');assert.equal(ui.api.getMode(),'cards');assert.deepEqual([...ui.storage],before);
  ui.api.setVisible(false);assert.equal(ui.playerLog.at(-1)[0],'pause');
  ui.api.setVisible(true);ui.api.setOrigin('public');assert.equal(ui.body().hidden,false);assert.equal(ui.api.getOrigin(),'public');
  ui.api.setOrigin('private');await settle();assert.equal(ui.mounts(),1);
  assert.equal(ui.storage.has(REVIEW_STORAGE_KEY),false);
}));
test('public automatic flow and exam pause while private practice is active; return resumes only by explicit action',()=>withUI(async ui=>{
  ui.click({learn:'flow-auto'});ui.api.setOrigin('private');await settle();
  ui.api.setOrigin('public');assert.match(ui.body().innerHTML,/No seu ritmo/);assert.doesNotMatch(ui.body().innerHTML,/Ⅱ Pausar fluxo/);
  ui.click({learnMode:'exam'});ui.startExam();ui.advance(12000);ui.api.setOrigin('private');
  ui.advance(120000);ui.ticks[0]();ui.api.setOrigin('public');
  assert.match(ui.body().innerHTML,/Cronômetro pausado/);assert.match(ui.body().innerHTML,/>00:48<\/output>/);assert.equal(ui.storage.has(REVIEW_STORAGE_KEY),false);
  ui.api.setOrigin('private');ui.api.setTopic('pac');assert.equal(ui.api.getOrigin(),'public');assert.equal(ui.api.getTopic(),'pac');
  ui.api.setOrigin('private');ui.doc.hidden=true;ui.docHandlers.visibilitychange();assert.equal(ui.playerLog.at(-1)[0],'pause');
  ui.winHandlers.pagehide();assert.ok(ui.playerLog.some(x=>x[0]==='visible'&&x[1]===false));
}));
test('private IDs remain rejected by public review and card scheduling loaders',()=>{
  assert.throws(()=>recordReview(emptyReview(),'library-study-clinical-aki-q1','wrong',Date.now()),RangeError);
  const privateSchedule={dueAt:Date.now(),intervalMs:86400000,repetitions:1};
  assert.deepEqual(Object.keys(loadProgress(JSON.stringify({schemaVersion:1,cards:{'library-study-clinical-aki-f1':privateSchedule}}),CARD_IDS).cards),[]);
});
