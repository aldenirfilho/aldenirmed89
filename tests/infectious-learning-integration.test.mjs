import test from 'node:test';
import assert from 'node:assert/strict';
import {BANK,LEARNING_TOPICS,ALL_CASES,ALL_CARDS,ALL_PARTICLES,CARD_IDS,LEARNING_SOURCES}
  from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-registry.mjs';
import {buildExam,gradeExam,loadProgress,serializeProgress,scheduleReview,selectDueCards}
  from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning-engine.mjs';
import {REVIEW_STORAGE_KEY,REVIEW_CONCEPTS,REVIEW_IDS,emptyReview,loadReview,serializeReview,
  recordReview,recordExamReview,conceptFor,priorityConcepts,filterForConcepts,reviewSummary}
  from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/review-engine.mjs';
import {initLearning} from '../01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026/learning.mjs';

const NOW=1_790_000_000_000;
const CARD_KEY='turbo-temi-pulmao-revisao-v1';
const NEW_TOPICS=['tb-pulmonar','tb-extra','micoses'];
const LEGACY_TOPICS=['dpoc','pac',...NEW_TOPICS];
const moduleFor=id=>LEARNING_TOPICS.find(t=>id.startsWith(`${t.id}-`))?.id;

test('five banks have unique sourced content, explicit preview limits and complete editorial mappings',()=>{
  assert.deepEqual(LEARNING_TOPICS.slice(0,5).map(t=>t.id),LEGACY_TOPICS);
  const previous=LEGACY_TOPICS.map(id=>BANK[id]);
  assert.equal(previous.flatMap(b=>b.cases).length,30);assert.equal(previous.flatMap(b=>b.flashcards).length,60);assert.equal(previous.flatMap(b=>b.particles).length,120);
  const all=[...ALL_CASES,...ALL_CARDS,...ALL_PARTICLES];
  assert.equal(new Set(all.map(x=>x.id)).size,all.length);
  assert.equal(REVIEW_CONCEPTS.filter(c=>LEGACY_TOPICS.includes(c.module)).length,30);assert.equal(REVIEW_IDS.filter(id=>LEGACY_TOPICS.some(t=>id.startsWith(`${t}-`))).length,90);
  for(const {id,preview} of LEARNING_TOPICS.filter(t=>LEGACY_TOPICS.includes(t.id))){
    const bank=BANK[id];
    assert.equal(bank.cases.length,6);assert.equal(bank.flashcards.length,12);assert.equal(bank.particles.length,24);
    assert.equal(preview,NEW_TOPICS.includes(id));
    if(preview)assert.match(bank.clinicalStatus,/revisão médica formal pendente/);
    const concepts=REVIEW_CONCEPTS.filter(c=>c.module===id);assert.equal(concepts.length,6);
    for(const c of concepts){
      assert.equal(c.caseIds.length,1);assert.equal(c.cardIds.length,2);assert.equal(c.particleIds.length,4);
      assert.ok(c.label.trim()&&c.comment.trim());
      const particles=filterForConcepts(bank.particles,[c.id]);
      assert.deepEqual(particles.map(p=>p.phase),['contexto','mecanismo','decisao','transferencia']);
    }
    for(const item of [...bank.cases,...bank.flashcards,...bank.particles]){
      assert.equal(moduleFor(item.id),id);assert.equal(conceptFor(item.id)?.module,id);
      if(preview)assert.equal(item.module,id);
      assert.ok(item.topic.trim());assert.ok([1,2,3].includes(item.level));
      assert.ok(item.sources.length);for(const source of item.sources)assert.ok(LEARNING_SOURCES[source]?.url,`${item.id}: ${source}`);
    }
    for(const q of bank.cases){assert.equal(q.choices.length,4);assert.ok(q.answer>=0&&q.answer<4);q.choices.forEach(c=>assert.ok(c.text.trim()&&c.why.trim()));}
  }
});

test('exams filter module IDs despite human topic labels; mixed blocks cover all available modules',()=>{
  const original=ALL_CASES.map(q=>q.id);
  for(const {id} of LEARNING_TOPICS){
    const result=buildExam({bank:ALL_CASES,topic:id,count:12,random:()=>0.3});
    assert.equal(result.length,6);assert.ok(result.every(q=>moduleFor(q.id)===id));
    assert.equal(new Set(result.map(q=>q.id)).size,6);
  }
  for(const count of [6,12])for(const random of [()=>0,()=>0.3,()=>0.99]){
    const mixed=buildExam({bank:ALL_CASES,topic:'mixed',count,random});
    assert.equal(mixed.length,count);assert.equal(new Set(mixed.map(q=>q.id)).size,count);
    assert.equal(new Set(mixed.map(q=>moduleFor(q.id))).size,Math.min(count,LEARNING_TOPICS.length));
  }
  const forged={...BANK['tb-extra'].cases[0],module:'pac'};
  assert.equal(buildExam({bank:[forged],topic:'tb-extra'}).length,0);
  assert.throws(()=>buildExam({bank:ALL_CASES,topic:'tb'}),RangeError);
  assert.deepEqual(ALL_CASES.map(q=>q.id),original);
});

test('existing SRS v1 survives expansion and every new card round-trips with due ordering',()=>{
  const legacy={dueAt:NOW-1000,intervalMs:300000,repetitions:0};
  const raw=JSON.stringify({schemaVersion:1,cards:{'dpoc-f01':legacy,'pac-f12':legacy,'tb-extra-invented':legacy},patient:'discard'});
  const progress=loadProgress(raw,CARD_IDS);
  assert.deepEqual({...progress.cards},{'dpoc-f01':legacy,'pac-f12':legacy});
  for(const card of ALL_CARDS)if(!progress.cards[card.id])progress.cards[card.id]=scheduleReview(null,'good',NOW);
  const text=serializeProgress(progress),restored=loadProgress(text,CARD_IDS);
  assert.equal(Object.keys(restored.cards).length,CARD_IDS.length);assert.deepEqual(restored.cards['dpoc-f01'],legacy);
  assert.equal(selectDueCards(ALL_CARDS,restored,NOW)[0].id,'dpoc-f01');
  assert.doesNotMatch(text,/patient|invented|note/);
  for(const id of NEW_TOPICS){
    const cards=BANK[id].flashcards,copy=loadProgress(null,CARD_IDS);
    copy.cards[cards[1].id]=scheduleReview(null,'again',NOW-300001);
    assert.equal(selectDueCards(cards,copy,NOW)[0].id,cards[1].id);
  }
});

test('old review history and new error/blank/again IDs share schema v1 without cross-topic leakage',()=>{
  let state=recordReview(emptyReview(),'dpoc-c01','wrong',NOW);
  const legacy=JSON.parse(serializeReview(state)).items['dpoc-c01'];
  state=loadReview(serializeReview(state));
  for(const id of NEW_TOPICS){
    const questions=BANK[id].cases;
    const answers={[questions[0].id]:(questions[0].answer+1)%4,[questions[1].id]:questions[1].answer};
    const update=recordExamReview(state,questions,answers,NOW+1);state=update.state;
    assert.deepEqual(update.result,gradeExam(questions,answers));
    assert.equal(reviewSummary(state,id).errors,5);assert.equal(reviewSummary(state,id).total,5);
    state=recordReview(state,BANK[id].flashcards[1].id,'again',NOW+2);
    const priority=priorityConcepts(state,id);assert.ok(priority.length);assert.ok(priority.every(c=>c.module===id));
    assert.equal(reviewSummary(state,id).errors,6);
  }
  const saved=serializeReview(state),roundtrip=loadReview(saved);
  assert.deepEqual(roundtrip.items['dpoc-c01'],legacy);assert.equal(reviewSummary(roundtrip,'pac').total,0);
  assert.doesNotMatch(saved,/selected|choices|stem|question|patient|takeaway/);
  assert.throws(()=>recordReview(state,'tb-extra-c99','wrong',NOW),RangeError);
  const poisoned=loadReview('{"schemaVersion":1,"items":{"tb-extra-c99":{},"__proto__":{"polluted":true}}}');
  assert.equal(poisoned.quarantined,true);assert.equal(Object.keys(poisoned.items).length,0);assert.equal({}.polluted,undefined);
});

// Exercises real learning event handlers with only browser boundaries replaced.
function withUI(run,entries=[]){
  const keys=['document','window','localStorage','setInterval','clearInterval'];
  const old=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const previousNow=Date.now;let now=NOW;Date.now=()=>now;
  const handlers={},elements=new Map(),stored=new Map(entries),ticks=[],topicChanges=[],visibility={};
  const root={innerHTML:'',contains:n=>n?.owner===root,querySelectorAll:()=>[],
    querySelector(s){if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:''});return elements.get(s);},
    addEventListener:(name,fn)=>handlers[name]=fn};
  const install=(key,value)=>Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
  install('document',{activeElement:null,hidden:false,addEventListener:(event,fn)=>visibility[event]=fn});
  install('window',{addEventListener(){}});
  install('localStorage',{getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)});
  install('setInterval',fn=>{ticks.push(fn);return ticks.length;});install('clearInterval',()=>{});
  const click=dataset=>{const button={dataset,owner:root,closest(){return this;}};handlers.click({target:button});};
  const change=(id,value)=>{root.querySelector(`#${id}`).value=value;handlers.change({target:{id,value}});};
  try{
    const api=initLearning(root,{onTopicChange:id=>topicChanges.push(id)});api.setVisible(true);
    run({api,stored,click,change,topicChanges,body:()=>root.querySelector('#learn-body').innerHTML,shell:()=>root.innerHTML,
      advance:ms=>now+=ms,tick:()=>ticks[0](),selectValue:()=>root.querySelector('#learning-topic').value,
      startExam(scope,count=6,minutes=1){root.querySelector('#exam-topic').value=scope;root.querySelector('#exam-count').value=String(count);root.querySelector('#exam-minutes').value=String(minutes);handlers.submit({target:{id:'exam-config'},preventDefault(){}});},
      hide(){document.hidden=true;visibility.visibilitychange();},show(){document.hidden=false;visibility.visibilitychange();}});
  }finally{Date.now=previousNow;for(const k of keys){const p=old.get(k);if(p)Object.defineProperty(globalThis,k,p);else delete globalThis[k];}}
}

test('internal selector and compatible API open every new flow/case/card with source and preview labels',()=>withUI(ui=>{
  assert.ok(ui.shell().includes(`${ALL_CASES.length} casos autorais · ${ALL_CARDS.length} flashcards · ${ALL_PARTICLES.length} micropartículas`));
  assert.match(ui.shell(),/não.*método validado especificamente para TDAH/);
  for(const id of NEW_TOPICS){
    ui.change('learning-topic',id);assert.equal(ui.api.getTopic(),id);assert.equal(ui.selectValue(),id);
    ui.click({learnMode:'flow'});assert.ok(ui.body().includes(BANK[id].particles[0].title));assert.match(ui.body(),/revisão médica formal pendente/);
    ui.click({learn:'flow-reveal'});assert.match(ui.body(),/class="learn-refs"><a href="https:/);
    ui.click({learnMode:'cases'});const q=BANK[id].cases[0];assert.ok(ui.body().includes(q.title));
    ui.click({learn:'case-answer',answer:String((q.answer+1)%4)});
    ui.api.openReview();assert.ok(ui.body().includes(conceptFor(q.id).label));assert.match(ui.body(),/Caso ·/);
    ui.click({learn:'review-start'});assert.match(ui.body(),/PARTÍCULA 1 \/ 4/);
    ui.click({learnMode:'cards'});assert.match(ui.body(),/2 CARDS NESTE TEMA/);
    ui.click({learn:'card-reveal'});ui.click({learn:'card-again'});
    assert.ok(Object.keys(loadProgress(ui.stored.get(CARD_KEY),CARD_IDS).cards).some(card=>moduleFor(card)===id));
    ui.click({learn:'review-stop'});ui.click({learnMode:'cards'});assert.match(ui.body(),/12 CARDS NESTE TEMA/);
  }
  assert.deepEqual(ui.topicChanges,NEW_TOPICS);
  ui.api.setTopic('micoses');ui.api.setTopic('__proto__');assert.equal(ui.topicChanges.length,3);
  ui.api.setTopic('pac');assert.equal(ui.api.getTopic(),'pac');assert.equal(ui.topicChanges.at(-1),'pac');
}));

test('new-topic manual exams and timed mixed exams record errors/blanks once and preserve pause semantics',()=>withUI(ui=>{
  for(const id of NEW_TOPICS){
    ui.api.setTopic(id);ui.click({learnMode:'exam'});ui.startExam(id);
    const q=BANK[id].cases.find(q=>ui.body().includes(q.title));assert.ok(q);
    ui.click({learn:'exam-answer',answer:String((q.answer+1)%4)});ui.click({learn:'exam-finish'});
    const before=reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)),id);assert.equal(before.errors,6);
    ui.click({learn:'exam-finish'});assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)),id).attempts,before.attempts);
    ui.click({learn:'exam-new'});
  }
  ui.startExam('mixed',12);ui.click({learn:'exam-pause'});const before=reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts;
  ui.advance(120000);ui.tick();assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,before);
  ui.click({learn:'exam-pause'});ui.advance(60001);ui.tick();
  const saved=loadReview(ui.stored.get(REVIEW_STORAGE_KEY));
  // Previously tracked errors plus first mistakes in any remaining modules; no double finalization.
  assert.equal(reviewSummary(saved).attempts,before+12);ui.tick();assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY))).attempts,before+12);
  assert.ok(priorityConcepts(saved,'dpoc').length);assert.ok(priorityConcepts(saved,'pac').length);
  assert.doesNotMatch(ui.stored.get(REVIEW_STORAGE_KEY),/selected|choices|stem|question|patient/);
}));

test('switching themes and hiding the page pause active work without changing old SRS or clearing other modules',()=>{
  const agenda=JSON.stringify({schemaVersion:1,cards:{'dpoc-f01':{dueAt:NOW,intervalMs:300000,repetitions:0}}});
  withUI(ui=>{
    ui.api.setTopic('tb-extra');ui.click({learnMode:'cases'});ui.click({learn:'case-skip'});
    ui.api.setTopic('dpoc');ui.api.openReview();assert.match(ui.body(),/Há registros em outros temas/);
    ui.click({learn:'review-topic',topic:'tb-extra'});assert.equal(ui.api.getTopic(),'tb-extra');assert.match(ui.body(),/Seu próximo passo/);
    ui.click({learnMode:'exam'});ui.startExam('tb-extra');ui.hide();ui.advance(120000);ui.show();ui.tick();
    assert.match(ui.body(),/Cronômetro pausado/);assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)),'tb-extra').errors,1);
    ui.api.openReview();ui.click({learn:'review-clear'});assert.match(ui.body(),/todos os temas/);ui.click({learn:'review-clear-confirm'});
    assert.equal(ui.stored.has(REVIEW_STORAGE_KEY),false);assert.equal(ui.stored.get(CARD_KEY),agenda);
  },[[CARD_KEY,agenda]]);
});


test('openFlow API keeps a previous-topic exam paused and exposes its original scope when resumed',()=>withUI(ui=>{
  ui.click({learnMode:'exam'});ui.startExam('dpoc');
  ui.api.setTopic('tb-extra');ui.api.openFlow();
  assert.equal(ui.api.getMode(),'flow');assert.ok(ui.body().includes(BANK['tb-extra'].particles[0].title));
  ui.advance(120000);ui.tick();assert.equal(ui.stored.has(REVIEW_STORAGE_KEY),false);
  ui.click({learnMode:'exam'});assert.equal(ui.api.getMode(),'exam');
  assert.match(ui.body(),/Simulado preservado: DPOC/);assert.match(ui.body(),/Cronômetro pausado/);
  ui.click({learn:'exam-finish'});assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)),'dpoc').errors,6);
  assert.equal(reviewSummary(loadReview(ui.stored.get(REVIEW_STORAGE_KEY)),'tb-extra').total,0);
}));
