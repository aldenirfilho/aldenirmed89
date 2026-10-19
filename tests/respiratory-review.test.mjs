import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REVIEW_STORAGE_KEY, RETENTION_DELAY_MS, MAX_REVIEW_COUNT, REVIEW_CONCEPTS, REVIEW_IDS,
  emptyReview, loadReview, serializeReview, recordReview, recordExamReview,
  conceptFor, relatedContent, priorityConcepts, filterForConcepts, reviewSummary,
} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/review-engine.mjs';
import {DPOC_LEARNING as D} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-dpoc.mjs';
import {PAC_LEARNING as P} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-pac.mjs';
import {gradeExam} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-engine.mjs';
import {initLearning} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning.mjs';
const NOW=1_790_000_000_000;
const state=()=>({attempts:2,errors:1,lastAt:NOW,status:'aberto'});

test('explicit concepts map every published case/card/particle once, independently of clinical wording',()=>{
  assert.equal(REVIEW_CONCEPTS.length,12);assert.equal(REVIEW_IDS.length,36);
  const all=[...D.cases,...D.flashcards,...D.particles,...P.cases,...P.flashcards,...P.particles];
  const mapped=REVIEW_CONCEPTS.flatMap(c=>[...c.caseIds,...c.cardIds,...c.particleIds]);
  assert.equal(new Set(mapped).size,84);assert.deepEqual([...mapped].sort(),all.map(x=>x.id).sort());
  for(const c of REVIEW_CONCEPTS){assert.equal(c.caseIds.length,1);assert.equal(c.cardIds.length,2);assert.equal(c.particleIds.length,4);assert.equal(relatedContent(c.id),c);}
  assert.equal(conceptFor('dpoc-c01').id,'dpoc-diagnostico');assert.equal(conceptFor('not-a-question'),null);
  assert.deepEqual(filterForConcepts([{id:'dpoc-f01',topic:'altered label'},{id:'pac-f01',topic:'Diagnóstico'}],['dpoc-diagnostico']).map(x=>x.id),['dpoc-f01']);
  assert.throws(()=>REVIEW_CONCEPTS[0].cardIds.push('malicious'),TypeError);
});

test('directed filters keep complete four-phase sequences and leave original banks unchanged',()=>{
  const before=D.particles.map(p=>p.id);
  const particles=filterForConcepts(D.particles,['dpoc-ci','dpoc-suporte']);
  assert.equal(particles.length,8);
  const reversed=filterForConcepts(D.particles,['dpoc-suporte','dpoc-ci']);
  assert.equal(reversed[0].id,'dpoc-p17');assert.equal(reversed[4].id,'dpoc-p09');
  assert.deepEqual(reversed.slice(0,4).map(p=>p.phase),['contexto','mecanismo','decisao','transferencia']);assert.deepEqual(particles.slice(0,4).map(p=>p.phase),['contexto','mecanismo','decisao','transferencia']);
  assert.deepEqual(filterForConcepts(D.flashcards,['dpoc-ci']).map(c=>c.id),['dpoc-f05','dpoc-f06']);
  assert.deepEqual(filterForConcepts(D.flashcards,[]),[]);assert.deepEqual(filterForConcepts(D.flashcards,['__proto__']),[]);
  assert.deepEqual(D.particles.map(p=>p.id),before);
});

test('wrong/unanswered reopen items; immediate success is review, delayed retention can recover',()=>{
  const original=emptyReview();let s=recordReview(original,'dpoc-c01','wrong',NOW);
  assert.equal(Object.keys(original.items).length,0);assert.deepEqual(s.items['dpoc-c01'],{attempts:1,errors:1,lastAt:NOW,status:'aberto'});
  s=recordReview(s,'dpoc-c01','correct',NOW+1);assert.equal(s.items['dpoc-c01'].status,'emrevisao');
  s=recordReview(s,'dpoc-c01','correct',NOW+2);assert.equal(s.items['dpoc-c01'].status,'emrevisao');
  s=recordReview(s,'dpoc-c01','correct',NOW+2+RETENTION_DELAY_MS);assert.equal(s.items['dpoc-c01'].status,'recuperado');
  assert.equal(priorityConcepts(s).length,0);assert.equal(priorityConcepts(s,'mixed',true)[0].status,'recuperado');
  s=recordReview(s,'dpoc-c01','unanswered',NOW+3+RETENTION_DELAY_MS);
  assert.equal(s.items['dpoc-c01'].status,'aberto');assert.equal(s.items['dpoc-c01'].errors,2);
});

test('again adds card priority and good advances recovery without inventing mastery for new cards',()=>{
  assert.equal(reviewSummary(recordReview(emptyReview(),'dpoc-f01','good',NOW)).total,0);
  let s=recordReview(emptyReview(),'dpoc-f01','again',NOW);
  assert.equal(priorityConcepts(s)[0].id,'dpoc-diagnostico');
  s=recordReview(s,'dpoc-f01','good',NOW+1);assert.equal(s.items['dpoc-f01'].status,'emrevisao');
  s=recordReview(s,'dpoc-f01','good',NOW+1+RETENTION_DELAY_MS);assert.equal(s.items['dpoc-f01'].status,'recuperado');
  assert.deepEqual(reviewSummary(emptyReview()),{total:0,open:0,reviewing:0,recovered:0,attempts:0,errors:0});
  assert.equal('percentage' in reviewSummary(s),false);
});

test('repeated errors increase priority and module filters keep unrelated concepts available',()=>{
  let s=recordReview(emptyReview(),'dpoc-c01','wrong',NOW);
  s=recordReview(s,'pac-c01','wrong',NOW+1);s=recordReview(s,'dpoc-c02','wrong',NOW+2);
  const previous=priorityConcepts(s,'dpoc').find(c=>c.id==='dpoc-classificacao').priority;
  s=recordReview(s,'dpoc-c02','wrong',NOW+3);
  assert.equal(priorityConcepts(s,'dpoc')[0].id,'dpoc-classificacao');assert.ok(priorityConcepts(s,'dpoc')[0].priority>previous);
  assert.equal(priorityConcepts(s,'pac').length,1);assert.equal(reviewSummary(s,'pac').errors,1);
});

test('exam review uses gradeExam for wrong, blank, inherited and invalid selections, recording only known IDs',()=>{
  const questions=D.cases.slice(0,4);
  const answers=Object.assign(Object.create({[questions[3].id]:questions[3].answer}),{
    [questions[0].id]:questions[0].answer,[questions[1].id]:(questions[1].answer+1)%4,[questions[2].id]:'2',
  });
  const result=recordExamReview(emptyReview(),questions,answers,NOW);
  assert.deepEqual(result.result,gradeExam(questions,answers));assert.equal(result.result.unanswered,2);
  assert.equal(result.state.items[questions[0].id],undefined);
  for(const q of questions.slice(1))assert.equal(result.state.items[q.id].errors,1);
  const repeated=recordExamReview(emptyReview(),[questions[1],questions[1]],{},NOW);
  assert.equal(repeated.state.items[questions[1].id].attempts,1);
  const unknown={...questions[0],id:'pac-unknown'};
  assert.deepEqual(Object.keys(recordExamReview(emptyReview(),[unknown],{},NOW).state.items),[]);
});

test('safe persistence round-trips counters only and quarantines extra text, answers and prototype keys',()=>{
  const raw='{"schemaVersion":1,"patient":"discard","items":{"dpoc-c01":{"attempts":2,"errors":1,"lastAt":1790000000000,"status":"aberto","answer":2,"note":"discard"},"__proto__":{"polluted":true},"constructor":{},"pac-unknown":{}}}';
  const s=loadReview(raw);assert.equal(s.quarantined,true);
  const serialized=serializeReview(s);assert.deepEqual(JSON.parse(serialized),{schemaVersion:1,items:{'dpoc-c01':state()}});
  assert.doesNotMatch(serialized,/patient|answer|note|discard|__proto__|constructor|polluted/);
  assert.equal({}.polluted,undefined);
  assert.equal(Object.getPrototypeOf(s.items),null);
  assert.equal(loadReview(serialized).quarantined,false);
  s.items['pac-unknown']=state();s.items.__proto__=state();
  assert.deepEqual(Object.keys(JSON.parse(serializeReview(s)).items),['dpoc-c01']);
});

test('malformed storage, schema, row types, counts and timestamps are discarded within bounds',()=>{
  for(const raw of ['', '{bad','null','[]','{"schemaVersion":2,"items":{}}','x'.repeat(60_001)]){
    const s=loadReview(raw);assert.equal(s.quarantined,true);assert.equal(Object.keys(s.items).length,0);
  }
  assert.equal(loadReview(null).quarantined,false);
  for(const invalid of [{attempts:-1},{attempts:0},{errors:0},{errors:3},{attempts:1.5},{lastAt:-1},{lastAt:Infinity},{status:'mastered'},{attempts:MAX_REVIEW_COUNT+1}]){
    const s=loadReview(JSON.stringify({schemaVersion:1,items:{'dpoc-c01':{...state(),...invalid}}}));
    assert.equal(Object.keys(s.items).length,0,JSON.stringify(invalid));assert.equal(s.quarantined,true);
  }
  const s=emptyReview();s.items['dpoc-c01']=Object.create(state());
  assert.equal(Object.keys(JSON.parse(serializeReview(s)).items).length,0);
  assert.throws(()=>recordReview(s,'__proto__','wrong',NOW),RangeError);
  assert.throws(()=>recordReview(s,'dpoc-c01','free text',NOW),RangeError);
  assert.throws(()=>recordReview(s,'dpoc-c01','wrong',NaN),RangeError);
});

test('runtime counters saturate instead of overflowing and no selection or clinical text is serialized',()=>{
  const s=emptyReview();s.items['dpoc-c01']={attempts:MAX_REVIEW_COUNT,errors:MAX_REVIEW_COUNT,lastAt:NOW,status:'aberto'};
  const next=recordReview(s,'dpoc-c01','wrong',NOW+1);
  assert.equal(next.items['dpoc-c01'].attempts,MAX_REVIEW_COUNT);assert.equal(next.items['dpoc-c01'].errors,MAX_REVIEW_COUNT);
  const stored=JSON.parse(serializeReview(next));assert.deepEqual(Object.keys(stored.items['dpoc-c01']).sort(),['attempts','errors','lastAt','status']);
});

// Minimal browser boundary: invokes the real initLearning/events without an external DOM dependency.
function withUI(run,initialEntries=[]) {
  const keys=['document','window','localStorage','setInterval','clearInterval'];
  const previous=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const originalNow=Date.now;let now=NOW;Date.now=()=>now;
  const handlers={},elements=new Map(),stored=new Map(initialEntries),ticks=[];
  const root={innerHTML:'',querySelectorAll:()=>[],contains:node=>node?.owner===root,
    querySelector(selector){if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',value:''});return elements.get(selector);},
    addEventListener:(name,handler)=>handlers[name]=handler};
  const install=(key,value)=>Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
  install('document',{activeElement:null,hidden:false,addEventListener(){}});
  install('window',{addEventListener(){}});
  install('localStorage',{getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)});
  install('setInterval',fn=>{ticks.push(fn);return ticks.length;});install('clearInterval',()=>{});
  const click=dataset=>{const button={dataset,owner:root,closest(){return this;}};handlers.click({target:button});};
  try {
    const api=initLearning(root);api.setVisible(true);
    run({api,click,stored,body:()=>root.querySelector('#learn-body').innerHTML,
      advance:ms=>now+=ms,tick:()=>ticks[0](),
      startExam(){root.querySelector('#exam-topic').value='dpoc';root.querySelector('#exam-count').value='6';root.querySelector('#exam-minutes').value='1';handlers.submit({target:{id:'exam-config'},preventDefault(){}});}});
  } finally {Date.now=originalNow;for(const k of keys){const old=previous.get(k);if(old)Object.defineProperty(globalThis,k,old);else delete globalThis[k];}}
}

test('real learning UI registers case errors/blanks, directed filters and separate confirmed clearing',()=>withUI(ui=>{
  ui.api.openReview();assert.match(ui.body(),/Seu painel começa/);assert.doesNotMatch(ui.body(),/100%/);
  ui.click({learnMode:'cases'});ui.click({learn:'case-answer',answer:String((D.cases[0].answer+1)%4)});
  assert.equal(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)).items['dpoc-c01'].errors,1);
  ui.click({learn:'case-next'});ui.click({learn:'case-skip'});
  assert.equal(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)).items['dpoc-c02'].errors,1);
  ui.api.openReview();ui.click({learn:'review-start'});assert.match(ui.body(),/PARTÍCULA 1 \/ 8/);
  ui.click({learnMode:'cards'});assert.match(ui.body(),/4 CARDS NESTE TEMA/);
  ui.click({learn:'card-reveal'});ui.click({learn:'card-again'});
  const cardKey='turbo-temi-pulmao-revisao-v1',agenda=ui.stored.get(cardKey);assert.ok(agenda);
  ui.api.openReview();ui.click({learn:'review-clear'});assert.ok(ui.stored.has(REVIEW_STORAGE_KEY));assert.match(ui.body(),/Cancelar/);
  ui.click({learn:'review-clear-cancel'});assert.ok(ui.stored.has(REVIEW_STORAGE_KEY));
  ui.click({learn:'review-clear'});ui.click({learn:'review-clear-confirm'});
  assert.equal(ui.stored.has(REVIEW_STORAGE_KEY),false);assert.equal(ui.stored.get(cardKey),agenda);
}));

test('real UI manual/automatic exam finalization records wrong and blanks once; pause retains time',()=>withUI(ui=>{
  ui.click({learnMode:'exam'});ui.startExam();
  const first=D.cases.find(q=>ui.body().includes(q.title));assert.ok(first);
  ui.click({learn:'exam-answer',answer:String((first.answer+1)%4)});ui.click({learn:'exam-finish'});
  let saved=loadReview(ui.stored.get(REVIEW_STORAGE_KEY));assert.equal(reviewSummary(saved).errors,6);assert.equal(reviewSummary(saved).attempts,6);
  ui.click({learn:'exam-finish'});assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,6);
  ui.click({learn:'exam-new'});ui.startExam();ui.click({learn:'exam-pause'});ui.advance(120_000);ui.tick();
  assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,6);
  ui.click({learn:'exam-pause'});ui.advance(60_001);ui.tick();
  saved=loadReview(ui.stored.get(REVIEW_STORAGE_KEY));assert.equal(reviewSummary(saved).attempts,12);assert.equal(reviewSummary(saved).errors,12);
  ui.tick();assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,12);
  assert.doesNotMatch(ui.stored.get(REVIEW_STORAGE_KEY),/selected|choices|stem|question|PaCO|paciente/);
}));


test('review panel uses readable labels and opens the tracked second card instead of the first',()=>{
  const initial=recordReview(emptyReview(),'dpoc-f02','again',NOW);
  withUI(ui=>{
    ui.api.openReview();const html=ui.body();
    const records=html.match(/<div class="review-records">(.*?)<\/div>/s)?.[1];
    assert.ok(records);assert.match(records,/Flashcard ·/);assert.doesNotMatch(records,/dpoc-f02/);
    assert.match(html,/tentativa acompanhada/);assert.match(html,/somente itens acompanhados/);
    assert.match(html,/data-learn="review-card" data-review-id="dpoc-f02"/);
    ui.click({learn:'review-card',reviewId:'dpoc-f02'});assert.ok(ui.body().includes(D.flashcards[1].front));
  },[[REVIEW_STORAGE_KEY,serializeReview(initial)]]);
});

test('next-step concept is the first directed microflow even when its bank position is later',()=>{
  let initial=recordReview(emptyReview(),'dpoc-c03','wrong',NOW);
  initial=recordReview(initial,'dpoc-c05','wrong',NOW+1);initial=recordReview(initial,'dpoc-c05','wrong',NOW+2);
  withUI(ui=>{
    ui.api.openReview();assert.match(ui.body(),/<div class="review-next"><h4>Oxigênio e VNI/);
    ui.click({learn:'review-start'});assert.ok(ui.body().includes(D.particles[16].title));
    ui.click({learn:'review-stop'});assert.match(ui.body(),/PARTÍCULA 1 \/ 24/);
  },[[REVIEW_STORAGE_KEY,serializeReview(initial)]]);
});

test('empty-edition history is explicit and malformed review storage never damages the older card schedule',()=>{
  const cardKey='turbo-temi-pulmao-revisao-v1';
  const agenda=JSON.stringify({schemaVersion:1,cards:{'dpoc-f01':{dueAt:NOW,intervalMs:300000,repetitions:0}}});
  withUI(ui=>{
    ui.api.openReview();assert.match(ui.body(),/a partir desta edição/);assert.match(ui.body(),/não reconstrói erros anteriores/);
    assert.match(ui.body(),/agenda anterior de flashcards foi preservada/);
    assert.deepEqual(JSON.parse(ui.stored.get(REVIEW_STORAGE_KEY)),{schemaVersion:1,items:{}});
    assert.equal(ui.stored.get(cardKey),agenda);
  },[[REVIEW_STORAGE_KEY,'{"schemaVersion":1,"items":{"__proto__":{"patient":"discard"}}}'],[cardKey,agenda]]);
});
