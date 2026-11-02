export const TOPICS = Object.freeze([
 ['sepse-choque','Sepse e choque','🦠'],['ventilacao-sdra','Ventilação e SDRA','🫁'],
 ['infeccoes-antimicrobianos','Infecções e antimicrobianos','💊'],['neurocritico','Neurocrítico','🧠'],
 ['renal-eletrolitos','Renal e eletrólitos','🧪'],['metabolico-endocrino','Metabólico e endócrino','⚗️'],
 ['cardiovascular','Cardiovascular','🫀'],['hematologia-trombose','Hematologia e trombose','🩸'],
 ['gastro-hepato-nutricao','Gastro, hepato e nutrição','🍽️'],['sedacao-seguranca','Sedação e segurança','🛏️']
].map(([id,label,icon])=>Object.freeze({id,label,icon})));
export const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const ALIASES = {
 ira:['ira','aki','lra','injuria renal aguda','lesao renal aguda','insuficiencia renal aguda'], aki:['ira','aki','lra','injuria renal aguda','lesao renal aguda'],
 lra:['lra','ira','aki','lesao renal aguda','injuria renal aguda','insuficiencia renal aguda'],
 vm:['vm','ventilacao mecanica'], sdra:['sdra','ards','sindrome do desconforto respiratorio'],
 dva:['dva','vasoativa','vasopressor'], pcr:['pcr','parada cardiorrespiratoria','ressuscitacao'],
 cad:['cad','cetoacidose'], tep:['tep','embolia pulmonar','tromboembolismo pulmonar'],
 iot:['iot','intubacao'], tb:['tb','tuberculose'], hsa:['hsa','hemorragia subaracnoidea']
};
export function matchesQuery(text,query) {
 const haystack=' '+normalize(text)+' ';
 return normalize(query).split(' ').filter(Boolean).every(token =>
  (ALIASES[token] || [token]).some(term => term.length<=3 ? haystack.includes(' '+term+' ') : haystack.includes(term)));
}
const RULES = [
 ['sepse-choque',/sepse|septic|choque|vasopress|lactato/],['ventilacao-sdra',/ventil|sdra|ards|peep|prona|desmame|extuba|intuba|pulmao|pulmon|pleur|respirator|\biot\b|\btre\b|\bvni\b|\bvm\b/],
 ['infeccoes-antimicrobianos',/infect|antimicro|antibi|candid|fung|tuberc|bacter|pneumonia|stewardship/],
 ['neurocritico',/neuro|\bavc\b|\btce\b|\bhsa\b|cerebr|convuls|epilep|pupila|coma/],
 ['renal-eletrolitos',/renal|nefro|eletrol|potass|sodio|\bira\b|\baki\b|\blra\b|\bcrrt\b|\btrr\b|\btrs\b|\bsled\b|\bpirrt\b|dialise|acidose|alcalose/],
 ['metabolico-endocrino',/metabol|endocr|diabet|ceto|glic|adrenal|tireo|mixed/],
 ['cardiovascular',/cardio|coronar|\biam\b|\bpcr\b|arritm|bradic|taquic|hemodinam|ressusc/],
 ['hematologia-trombose',/hemat|tromb|transfus|plaquet|anticoag|heparina|\btep\b|hemorrag|sangra/],
 ['gastro-hepato-nutricao',/gastro|hepat|nutri|pancrea|cirros|digest|enteral|refeeding|aliment/],
 ['sedacao-seguranca',/seda|segur|delir|analges|mobil|comunica|famil|cateter|checklist|prevenc/]
];
export function topicIdsFor(item) {
 if(TOPICS.some(t=>t.id===item.topicId))return [item.topicId];
 const text=normalize([item.title,item.category,item.blockLabel,item.domain,item.subtopic,item.excerpt,...(item.tags||[])].join(' '));
 return RULES.filter(([,rule])=>rule.test(text)).map(([id])=>id);
}
export function filterStudyItems(items,{query='',topic='',type='',onlyNew=false}={}) {
 return items.filter(item => (!onlyNew || item.isNew) && (!topic || item.topicIds.includes(topic)) && (!type || item.type===type) && matchesQuery(item.searchText,query));
}
export function safeStudyHref(href) {
 const value=String(href||'');
 return /^(?:mnemonicos|desafios|questoes)\/[a-zA-Z0-9_./?=&%#-]*$/.test(value) && !value.includes('..') ? '../'+value : null;
}
