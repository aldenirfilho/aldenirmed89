import { gradeExam } from './learning-engine.mjs?v=7f9a31f7e150cdf5';

export const REVIEW_STORAGE_KEY = 'turbo-temi-pulmao-erros-v1';
export const RETENTION_DELAY_MS = 5 * 60_000;
export const MAX_REVIEW_COUNT = 1_000_000;
const MAX_TIME = 8_640_000_000_000_000;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const record = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const time = n => Number.isSafeInteger(n) && n >= 0 && n <= MAX_TIME;
const count = n => Number.isSafeInteger(n) && n >= 0 && n <= MAX_REVIEW_COUNT;
const statuses = new Set(['aberto', 'emrevisao', 'recuperado']);

// Mapeamento editorial explícito; não infere conteúdo clínico por palavras ou similaridade.
export const REVIEW_CONCEPTS = Object.freeze([
  {id:'dpoc-diagnostico',module:'dpoc',label:'Diagnóstico',comment:'Retome contexto, espirometria e confirmação perto do corte.',caseIds:['dpoc-c01'],cardIds:['dpoc-f01','dpoc-f02'],particleIds:['dpoc-p01','dpoc-p02','dpoc-p03','dpoc-p04']},
  {id:'dpoc-classificacao',module:'dpoc',label:'Classificação',comment:'Separe obstrução, sintomas e eventos antes de classificar.',caseIds:['dpoc-c02'],cardIds:['dpoc-f03','dpoc-f04'],particleIds:['dpoc-p05','dpoc-p06','dpoc-p07','dpoc-p08']},
  {id:'dpoc-ci',module:'dpoc',label:'CI e eosinófilos',comment:'Cruze asma, exacerbações e o contexto do biomarcador.',caseIds:['dpoc-c03'],cardIds:['dpoc-f05','dpoc-f06'],particleIds:['dpoc-p09','dpoc-p10','dpoc-p11','dpoc-p12']},
  {id:'dpoc-reavaliacao',module:'dpoc',label:'Reavaliação',comment:'Reveja técnica, adesão e o problema que ainda persiste.',caseIds:['dpoc-c04'],cardIds:['dpoc-f07','dpoc-f08'],particleIds:['dpoc-p13','dpoc-p14','dpoc-p15','dpoc-p16']},
  {id:'dpoc-suporte',module:'dpoc',label:'Oxigênio e VNI',comment:'Integre gasometria, esforço, via aérea e resposta ao suporte.',caseIds:['dpoc-c05'],cardIds:['dpoc-f09','dpoc-f10'],particleIds:['dpoc-p17','dpoc-p18','dpoc-p19','dpoc-p20']},
  {id:'dpoc-antibiotico',module:'dpoc',label:'Exacerbação e antibiótico',comment:'Releia os critérios e diferencie indicação de prescrição pronta.',caseIds:['dpoc-c06'],cardIds:['dpoc-f11','dpoc-f12'],particleIds:['dpoc-p21','dpoc-p22','dpoc-p23','dpoc-p24']},
  {id:'pac-imagem',module:'pac',label:'Diagnóstico e imagem',comment:'Conecte síndrome, imagem e competência do operador.',caseIds:['pac-c01'],cardIds:['pac-f01','pac-f02'],particleIds:['pac-p01','pac-p02','pac-p03','pac-p04']},
  {id:'pac-risco',module:'pac',label:'Risco e unidades',comment:'Confira analito, unidade e fisiologia além do escore.',caseIds:['pac-c02'],cardIds:['pac-f03','pac-f04'],particleIds:['pac-p05','pac-p06','pac-p07','pac-p08']},
  {id:'pac-gravidade',module:'pac',label:'PAC grave',comment:'Retome maiores, menores e suporte sem esperar o formulário.',caseIds:['pac-c03'],cardIds:['pac-f05','pac-f06'],particleIds:['pac-p09','pac-p10','pac-p11','pac-p12']},
  {id:'pac-virus',module:'pac',label:'Vírus e antibióticos',comment:'Situe gravidade, coinfecção e a divergência entre as fontes.',caseIds:['pac-c04'],cardIds:['pac-f07','pac-f08'],particleIds:['pac-p13','pac-p14','pac-p15','pac-p16']},
  {id:'pac-duracao',module:'pac',label:'Duração e estabilidade',comment:'Use tempo, estabilidade e elegibilidade em conjunto.',caseIds:['pac-c05'],cardIds:['pac-f09','pac-f10'],particleIds:['pac-p17','pac-p18','pac-p19','pac-p20']},
  {id:'pac-corticoide',module:'pac',label:'Corticoide e reavaliação',comment:'Confira indicação, influenza e causas de falha do plano.',caseIds:['pac-c06'],cardIds:['pac-f11','pac-f12'],particleIds:['pac-p21','pac-p22','pac-p23','pac-p24']},
].map(c => Object.freeze({...c,caseIds:Object.freeze(c.caseIds),cardIds:Object.freeze(c.cardIds),particleIds:Object.freeze(c.particleIds)})));
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
