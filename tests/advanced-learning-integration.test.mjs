import test from 'node:test';
import assert from 'node:assert/strict';
import {BANK,LEARNING_TOPICS,LEARNING_CONCEPTS,ALL_CASES,ALL_CARDS,ALL_PARTICLES,CARD_IDS,LEARNING_SOURCES}
  from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-registry.mjs';
import {EXAM_COUNTS,buildExam,gradeExam,loadProgress,serializeProgress,scheduleReview,selectDueCards}
  from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-engine.mjs';
import {REVIEW_IDS,REVIEW_STORAGE_KEY,emptyReview,loadReview,serializeReview,recordReview,recordExamReview,
  reviewSummary,priorityConcepts,conceptFor,filterForConcepts}
  from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/review-engine.mjs';
import {initLearning} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning.mjs';
import {ADVANCED_TB_SOURCES} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/advanced-tb-sources.mjs';
import {ADVANCED_THERAPY_SOURCES} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/advanced-therapy-sources.mjs';

const NEW=['neuro-tb','tb-resistente','antifungicos','igg4-tratamento'];
const OLD=['dpoc','pac','tb-pulmonar','tb-extra','micoses'];
const NOW=1_790_000_000_000,DAY=86400000;
const CARD_KEY='turbo-temi-pulmao-revisao-v1';
const topicFor=id=>conceptFor(id)?.module;

test('nine themes expose the expected totals and every advanced item has one explicit concept and a merged primary source',()=>{
  assert.deepEqual(LEARNING_TOPICS.map(t=>t.id),[...OLD,...NEW]);
  assert.equal(ALL_CASES.length,54);assert.equal(ALL_CARDS.length,108);assert.equal(ALL_PARTICLES.length,216);
  assert.equal(LEARNING_CONCEPTS.length,54);assert.equal(REVIEW_IDS.length,162);
  const all=[...ALL_CASES,...ALL_CARDS,...ALL_PARTICLES];assert.equal(new Set(all.map(x=>x.id)).size,378);
  const mapped=LEARNING_CONCEPTS.flatMap(c=>[...c.caseIds,...c.cardIds,...c.particleIds]);
  assert.deepEqual([...mapped].sort(),all.map(x=>x.id).sort());assert.equal(new Set(mapped).size,378);
  for(const id of NEW){
    const bank=BANK[id];assert.equal(bank.module,id);assert.match(bank.clinicalStatus,/revisão médica formal pendente/);
    assert.equal(bank.cases.length,6);assert.equal(bank.flashcards.length,12);assert.equal(bank.particles.length,24);
    const concepts=LEARNING_CONCEPTS.filter(c=>c.module===id);assert.equal(concepts.length,6);
    for(const c of concepts){
      assert.deepEqual([c.caseIds.length,c.cardIds.length,c.particleIds.length],[1,2,4]);
      assert.deepEqual(filterForConcepts(bank.particles,[c.id]).map(p=>p.phase),['contexto','mecanismo','decisao','transferencia']);
    }
    for(const item of [...bank.cases,...bank.flashcards,...bank.particles]){
      assert.equal(item.module,id);assert.equal(topicFor(item.id),id);assert.ok(item.id.startsWith(`${id}-`));
      assert.ok(item.sources.length);item.sources.forEach(key=>assert.ok(LEARNING_SOURCES[key]?.url,`${item.id}: ${key}`));
    }
  }
  const keys=[...Object.keys(ADVANCED_TB_SOURCES),...Object.keys(ADVANCED_THERAPY_SOURCES)];
  assert.equal(new Set(keys).size,keys.length);
  for(const [key,source] of Object.entries({...ADVANCED_TB_SOURCES,...ADVANCED_THERAPY_SOURCES}))assert.deepEqual(LEARNING_SOURCES[key],source);
});

test('all nine topic filters work and mixed 6 differs explicitly from 12/18 coverage',()=>{
  assert.deepEqual(EXAM_COUNTS,[6,12,18]);
  for(const {id} of LEARNING_TOPICS)for(const count of EXAM_COUNTS){
    const questions=buildExam({bank:ALL_CASES,topic:id,count,random:()=>0.5});
    assert.equal(questions.length,6);assert.ok(questions.every(q=>topicFor(q.id)===id));
  }
  for(const count of EXAM_COUNTS)for(const random of [()=>0,()=>0.5,()=>0.999]){
    const questions=buildExam({bank:ALL_CASES,topic:'mixed',count,random});
    assert.equal(questions.length,count);assert.equal(new Set(questions.map(q=>q.id)).size,count);
    assert.equal(new Set(questions.map(q=>topicFor(q.id))).size,count===6?6:9);
  }
  assert.throws(()=>buildExam({bank:ALL_CASES,count:9}),RangeError);
  assert.throws(()=>buildExam({bank:ALL_CASES,topic:'constructor'}),RangeError);
  assert.equal(buildExam({bank:[{...BANK['neuro-tb'].cases[0],module:'tb-resistente'}],topic:'mixed'}).length,0);
});

test('migration keeps all 90 previous review rows and 60 previous SRS schedules under schema v1',()=>{
  const oldIds=OLD.flatMap(id=>[...BANK[id].cases,...BANK[id].flashcards].map(x=>x.id));assert.equal(oldIds.length,90);
  const oldCards=OLD.flatMap(id=>BANK[id].flashcards.map(x=>x.id));assert.equal(oldCards.length,60);
  const items=Object.fromEntries(oldIds.map((id,i)=>[id,{attempts:i+2,errors:i+1,lastAt:NOW-i,status:i%2?'emrevisao':'aberto'}]));
  const review=loadReview(JSON.stringify({schemaVersion:1,items}));assert.equal(review.quarantined,false);
  assert.deepEqual(JSON.parse(serializeReview(review)).items,items);
  const schedules=Object.fromEntries(oldCards.map((id,i)=>[id,{dueAt:NOW+i,intervalMs:DAY,repetitions:2}]));
  const progress=loadProgress(JSON.stringify({schemaVersion:1,cards:schedules}),CARD_IDS);
  assert.deepEqual(JSON.parse(serializeProgress(progress)).cards,schedules);
  for(const id of NEW){
    const card=BANK[id].flashcards[0];progress.cards[card.id]=scheduleReview(null,'again',NOW);
    const updated=recordReview(review,BANK[id].cases[0].id,'unanswered',NOW);
    assert.deepEqual(updated.items[oldIds[0]],items[oldIds[0]]);assert.equal(updated.items[BANK[id].cases[0].id].errors,1);
    assert.equal(selectDueCards(BANK[id].flashcards,progress,NOW+300000)[0].id,card.id);
  }
  assert.equal(loadProgress(serializeProgress(progress),CARD_IDS).schemaVersion,1);
  const invalid=loadReview('{"schemaVersion":1,"items":{"neuro-tb-c99":{},"__proto__":{"polluted":true},"constructor":{},"antifungicos-f99":{}}}');
  assert.equal(invalid.quarantined,true);assert.equal(Object.keys(invalid.items).length,0);assert.equal({}.polluted,undefined);
  assert.throws(()=>recordReview(review,'igg4-tratamento-c99','wrong',NOW),RangeError);
  const cardPayload='{"schemaVersion":1,"cards":{"neuro-tb-f01":{"dueAt":1790000000000,"intervalMs":300000,"repetitions":0,"note":"discard"},"neuro-tb-f99":{"dueAt":1790000000000,"intervalMs":300000,"repetitions":0},"__proto__":{"polluted":true},"neuro-tb-__proto__":{},"constructor":{}}}';
  const safeCards=serializeProgress(loadProgress(cardPayload,[...CARD_IDS,'__proto__','constructor','neuro-tb-__proto__']));
  assert.deepEqual(Object.keys(JSON.parse(safeCards).cards),['neuro-tb-f01']);
  assert.doesNotMatch(safeCards,/note|discard|f99|__proto__|constructor|polluted/);
});

test('new-topic grading follows gradeExam for errors/blanks and never stores a response or medical text',()=>{
  let state=emptyReview();
  for(const id of NEW){
    const questions=BANK[id].cases,answers={[questions[0].id]:(questions[0].answer+1)%4,[questions[1].id]:questions[1].answer};
    const update=recordExamReview(state,questions,answers,NOW);state=update.state;
    assert.deepEqual(update.result,gradeExam(questions,answers));assert.equal(reviewSummary(state,id).errors,5);
    assert.equal(reviewSummary(state,id).total,5);assert.ok(priorityConcepts(state,id).every(c=>c.module===id));
  }
  const saved=serializeReview(state);assert.doesNotMatch(saved,/selected|answer|choices|stem|question|patient|takeaway/);
  assert.equal(Object.keys(loadReview(saved).items).length,20);
});

function withUI(run,entries=[]){
  const keys=['document','window','localStorage','setInterval','clearInterval'];
  const before=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const originalNow=Date.now;let now=NOW;Date.now=()=>now;
  const handlers={},elements=new Map(),stored=new Map(entries),ticks=[],changes=[];
  const root={innerHTML:'',contains:n=>n?.owner===root,querySelectorAll:()=>[],
    querySelector(s){if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:''});return elements.get(s);},
    addEventListener:(name,fn)=>handlers[name]=fn};
  const install=(key,value)=>Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
  install('document',{activeElement:null,hidden:false,addEventListener(){}});install('window',{addEventListener(){}});
  install('localStorage',{getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)});
  install('setInterval',fn=>{ticks.push(fn);return ticks.length;});install('clearInterval',()=>{});
  const click=dataset=>{const button={dataset,owner:root,closest(){return this;}};handlers.click({target:button});};
  const change=(id,value)=>{root.querySelector(`#${id}`).value=value;handlers.change({target:{id,value}});};
  try{
    const api=initLearning(root,{onTopicChange:id=>changes.push(id)});api.setVisible(true);
    run({api,stored,click,change,changes,body:()=>root.querySelector('#learn-body').innerHTML,shell:()=>root.innerHTML,
      advance:ms=>now+=ms,tick:()=>ticks[0](),
      start(scope,count=6){root.querySelector('#exam-topic').value=scope;root.querySelector('#exam-count').value=String(count);root.querySelector('#exam-minutes').value='1';handlers.submit({target:{id:'exam-config'},preventDefault(){}});}});
  }finally{Date.now=originalNow;for(const k of keys){const p=before.get(k);if(p)Object.defineProperty(globalThis,k,p);else delete globalThis[k];}}
}

test('all four advanced modules open by API/selector and integrate flow, cases, cards and directed review',()=>withUI(ui=>{
  assert.match(ui.shell(),/54 casos autorais · 108 flashcards · 216 micropartículas/);
  assert.match(ui.shell(),/Todos os demais temas/);assert.match(ui.shell(),/não.*método validado especificamente para TDAH/);
  for(const id of NEW){
    ui.change('learning-topic',id);assert.equal(ui.api.getTopic(),id);ui.api.openFlow();
    assert.ok(ui.body().includes(BANK[id].particles[0].title));assert.match(ui.body(),/revisão médica formal pendente/);
    ui.click({learn:'flow-reveal'});assert.match(ui.body(),/class="learn-refs"><a href="https:/);
    ui.click({learnMode:'cases'});const q=BANK[id].cases[0];ui.click({learn:'case-answer',answer:String((q.answer+1)%4)});
    ui.api.openReview();assert.match(ui.body(),/Caso ·/);ui.click({learn:'review-start'});assert.match(ui.body(),/PARTÍCULA 1 \/ 4/);
    ui.click({learnMode:'cards'});assert.match(ui.body(),/2 CARDS NESTE TEMA/);ui.click({learn:'card-reveal'});ui.click({learn:'card-again'});
    assert.ok(Object.keys(loadProgress(ui.stored.get(CARD_KEY),CARD_IDS).cards).some(card=>topicFor(card)===id));
    ui.click({learn:'review-stop'});ui.click({learnMode:'cards'});assert.match(ui.body(),/12 CARDS NESTE TEMA/);
  }
  assert.deepEqual(ui.changes,NEW);ui.api.setTopic('__proto__');assert.equal(ui.api.getTopic(),'igg4-tratamento');
}));

test('exam form describes partial versus complete coverage and completed blocks retain actual topic counts',()=>withUI(ui=>{
  ui.click({learnMode:'exam'});ui.change('exam-topic','mixed');
  assert.match(ui.body(),/até 6 dos 9 temas disponíveis/);assert.doesNotMatch(ui.body(),/todos os 9 temas disponíveis/);
  ui.change('exam-count','12');assert.match(ui.body(),/todos os 9 temas disponíveis/);
  ui.change('exam-count','18');assert.match(ui.body(),/todos os 9 temas disponíveis/);
  ui.start('mixed',6);assert.match(ui.body(),/Misto · 6 de 9 temas/);ui.click({learn:'exam-finish'});
  assert.match(ui.body(),/6 sem resposta/);ui.click({learn:'exam-new'});
  ui.start('mixed',18);assert.match(ui.body(),/Misto · 9 de 9 temas/);
}));

test('advanced manual and eighteen-question timed blocks record blanks once and preserve pauses and old agendas',()=>{
  const agenda=JSON.stringify({schemaVersion:1,cards:{'dpoc-f01':{dueAt:NOW,intervalMs:DAY,repetitions:2}}});
  withUI(ui=>{
    for(const id of NEW){
      ui.api.setTopic(id);ui.click({learnMode:'exam'});ui.start(id,18);assert.match(ui.body(),/Questão 1 \/ 6/);
      ui.click({learn:'exam-finish'});assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)),id).errors,6);
      ui.click({learn:'exam-new'});
    }
    ui.start('mixed',18);ui.click({learn:'exam-pause'});const before=reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts;
    ui.advance(120000);ui.tick();assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,before);
    ui.click({learn:'exam-pause'});ui.advance(60001);ui.tick();
    assert.match(ui.body(),/18 sem resposta/);assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,before+18);
    ui.tick();assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,before+18);
    ui.api.openReview();ui.click({learn:'review-clear'});ui.click({learn:'review-clear-confirm'});
    assert.equal(ui.stored.has(REVIEW_STORAGE_KEY),false);assert.equal(ui.stored.get(CARD_KEY),agenda);
  },[[CARD_KEY,agenda]]);
});
