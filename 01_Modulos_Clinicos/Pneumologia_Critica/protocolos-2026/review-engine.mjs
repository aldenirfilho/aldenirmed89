import { LEARNING_CONCEPTS } from './learning-registry.mjs?v=dbc34eb79dc4732b';
import { gradeExam } from './learning-engine.mjs?v=4af5fd4cc9ba7c8d';

export const REVIEW_STORAGE_KEY = 'turbo-temi-pulmao-erros-v1';
export const RETENTION_DELAY_MS = 5 * 60_000;
export const MAX_REVIEW_COUNT = 1_000_000;
const MAX_TIME = 8_640_000_000_000_000;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const record = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const time = n => Number.isSafeInteger(n) && n >= 0 && n <= MAX_TIME;
const count = n => Number.isSafeInteger(n) && n >= 0 && n <= MAX_REVIEW_COUNT;
const statuses = new Set(['aberto', 'emrevisao', 'recuperado']);

// Os conceitos novos e legados compartilham o mesmo mapa editorial explícito.
export const REVIEW_CONCEPTS = LEARNING_CONCEPTS;
const concepts = new Map(REVIEW_CONCEPTS.map(c => [c.id,c]));
const byId = new Map(REVIEW_CONCEPTS.flatMap(c => [...c.caseIds,...c.cardIds,...c.particleIds].map(id => [id,c])));
export const REVIEW_IDS = Object.freeze(REVIEW_CONCEPTS.flatMap(c => [...c.caseIds,...c.cardIds]));
const allowed = new Set(REVIEW_IDS);
export const conceptFor = id => byId.get(id) || null;
export const relatedContent = id => concepts.get(id) || null;
export const emptyReview = () => ({schemaVersion:1,items:Object.create(null),quarantined:false});

function cleanItem(item) {
  if (!record(item) || !['attempts','errors','lastAt','status'].every(key=>own(item,key)) || !count(item.attempts) || !count(item.errors) || item.errors < 1
      || item.attempts < item.errors || !time(item.lastAt) || !statuses.has(item.status)) return null;
  return {attempts:item.attempts,errors:item.errors,lastAt:item.lastAt,status:item.status};
}
function cleanState(state) {
  const clean=emptyReview();
  if (record(state?.items)) for (const id of REVIEW_IDS) if (own(state.items,id)) {
    const item=cleanItem(state.items[id]);if(item)clean.items[id]=item;
  }
  return clean;
}

/** Invalid data is quarantined by discarding it; no raw payload is retained or copied. */
export function loadReview(raw) {
  const state=emptyReview();
  if (raw===null || raw===undefined) return state;
  let parsed;
  try {if(typeof raw!=='string'||raw.length>60_000)throw new Error();parsed=JSON.parse(raw);} catch {state.quarantined=true;return state;}
  if(!record(parsed)||parsed.schemaVersion!==1||!record(parsed.items)){state.quarantined=true;return state;}
  if(Object.keys(parsed).some(k=>!['schemaVersion','items'].includes(k)))state.quarantined=true;
  for(const id of Object.keys(parsed.items)) {
    if(!allowed.has(id)){state.quarantined=true;continue;}
    const item=cleanItem(parsed.items[id]);
    if(!item){state.quarantined=true;continue;}
    if(Object.keys(parsed.items[id]).some(k=>!['attempts','errors','lastAt','status'].includes(k)))state.quarantined=true;
    state.items[id]=item;
  }
  return state;
}
export function serializeReview(state) {
  const clean=cleanState(state);
  return JSON.stringify({schemaVersion:1,items:clean.items});
}

/** Only known case/card IDs and numeric progress survive; never saves selected answers. */
export function recordReview(state,id,outcome,nowMs=Date.now()) {
  if(!allowed.has(id))throw new RangeError('ID de revisão desconhecido.');
  if(!['wrong','unanswered','correct','again','good'].includes(outcome))throw new RangeError('Resultado inválido.');
  if(!time(nowMs))throw new RangeError('Horário inválido.');
  const next=cleanState(state),previous=next.items[id];
  const error=['wrong','unanswered','again'].includes(outcome);
  if(!previous&&!error)return next; // No invented 100% or record of mastery for unseen content.
  let status='aberto';
  if(!error)status=previous.status==='aberto'?'emrevisao'
    :previous.status==='emrevisao'&&nowMs-previous.lastAt>=RETENTION_DELAY_MS?'recuperado':previous.status;
  next.items[id]={attempts:Math.min(MAX_REVIEW_COUNT,(previous?.attempts||0)+1),
    errors:Math.min(MAX_REVIEW_COUNT,(previous?.errors||0)+(error?1:0)),lastAt:nowMs,status};
  return next;
}

/** The same gradeExam drives both displayed correction and review; call once at finalization. */
export function recordExamReview(state,questions,answers,nowMs=Date.now()) {
  const result=gradeExam(questions,answers);let next=cleanState(state);const seen=new Set();
  for(const item of result.items)if(allowed.has(item.id)&&!seen.has(item.id)){
    seen.add(item.id);next=recordReview(next,item.id,item.selected===null?'unanswered':item.correct?'correct':'wrong',nowMs);
  }
  return {state:next,result};
}

export function priorityConcepts(state,module='mixed',includeRecovered=false) {
  const entries=cleanState(state).items;
  return REVIEW_CONCEPTS.filter(c=>module==='mixed'||c.module===module).flatMap(c=>{
    const rows=[...c.caseIds,...c.cardIds].flatMap(id=>entries[id]?[{id,...entries[id]}]:[]);
    if(!rows.length)return [];
    const active=rows.filter(r=>r.status!=='recuperado');if(!includeRecovered&&!active.length)return [];
    const relevant=active.length?active:rows;
    const status=active.some(r=>r.status==='aberto')?'aberto':active.length?'emrevisao':'recuperado';
    const errors=rows.reduce((sum,r)=>sum+r.errors,0),activeErrors=relevant.reduce((sum,r)=>sum+r.errors,0),attempts=rows.reduce((sum,r)=>sum+r.attempts,0);
    return [{...c,rows,status,errors,attempts,lastAt:Math.max(...rows.map(r=>r.lastAt)),
      priority:active.length?activeErrors*3+active.length*10+(status==='aberto'?5:0):0}];
  }).sort((a,b)=>b.priority-a.priority||a.lastAt-b.lastAt||a.id.localeCompare(b.id));
}
export function filterForConcepts(items,conceptIds) {
  const ids=[...new Set((Array.isArray(conceptIds)?conceptIds:[]).filter(id=>concepts.has(id)))];
  const bank=Array.isArray(items)?items:[];
  return ids.flatMap(id=>bank.filter(item=>conceptFor(item?.id)?.id===id));
}
export function reviewSummary(state,module='mixed') {
  const rows=Object.entries(cleanState(state).items).filter(([id])=>module==='mixed'||conceptFor(id)?.module===module).map(([,r])=>r);
  return {total:rows.length,open:rows.filter(r=>r.status==='aberto').length,
    reviewing:rows.filter(r=>r.status==='emrevisao').length,recovered:rows.filter(r=>r.status==='recuperado').length,
    attempts:rows.reduce((s,r)=>s+r.attempts,0),errors:rows.reduce((s,r)=>s+r.errors,0)};
}
