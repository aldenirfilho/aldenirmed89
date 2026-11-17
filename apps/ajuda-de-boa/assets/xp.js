/* XP da Boa Ação · 360X — mesma régua do "Placar XP da Boa Ação" da Bolsa Ajuda de Boa.
   XP é pontuação de honra e mérito, não de dinheiro: o valor doado só entra pela
   proporção doado/recebido (a "medida"), e quem doa além da medida não ganha mais XP.
   Travas: reserva comprometida ou destinatário não verificado = XP zero.
   Funções puras, sem rede e sem armazenamento. Mesma fórmula no site e no app. */
(function(root){
'use strict';
const PARAMS=Object.freeze({
 ideal:0.05,      // proporção ideal doado/recebido (média da gaussiana)
 sdLow:0.05,      // desvio padrão abaixo do ideal (tolerância para quem doa menos)
 sdHigh:0.03,     // desvio padrão acima do ideal (sacrifício não rende mais XP)
 weights:Object.freeze({necessidade:3,gratidao:3,oportunidade:2,criatividade:1,seguranca:2}),
 xpMin:1000,      // ajuda válida com qualidade ou medida zero
 xpMax:10000      // todos os critérios em 3 e proporção ideal
});
const CRITERIA=Object.freeze([
 Object.freeze({id:'necessidade',icon:'🎯',label:'Necessidade',hint:'Quem recebe precisa mesmo?',scale:['Não precisa','Precisa pouco','Precisa','Urgente ou vital']}),
 Object.freeze({id:'gratidao',icon:'🙏',label:'Gratidão',hint:'Doou de bom grado?',scale:['Por culpa, pressão ou obrigação','Sem vontade','De bom grado','Feliz e grato por retribuir']}),
 Object.freeze({id:'oportunidade',icon:'⏱️',label:'Oportunidade',hint:'Chegou na hora em que fazia diferença?',scale:['Fora de hora','Tanto faz o momento','Em boa hora','Na hora exata da necessidade']}),
 Object.freeze({id:'criatividade',icon:'💡',label:'Criatividade',hint:'Forma original de ajudar?',scale:['Nenhuma','Forma comum','Boa ideia','Forma nova que outros podem copiar']}),
 Object.freeze({id:'seguranca',icon:'🛡️',label:'Segurança',hint:'Destinatário verificado e comprovante guardado?',scale:['Destinatário não verificado (XP zero)','Verificação fraca, sem comprovante','Verificado ou com comprovante','Verificado e com comprovante']})
]);
const LEVELS=Object.freeze([
 Object.freeze({min:0,icon:'🌱',name:'Semente'}),
 Object.freeze({min:10000,icon:'🌿',name:'Broto'}),
 Object.freeze({min:50000,icon:'🛡️',name:'Escudeiro do Bem'}),
 Object.freeze({min:150000,icon:'⚔️',name:'Guardião'}),
 Object.freeze({min:400000,icon:'🏰',name:'Cavaleiro da Boa Ação'}),
 Object.freeze({min:1000000,icon:'✨',name:'Paladino 360X'}),
 Object.freeze({min:2500000,icon:'👑',name:'Lenda do Bem'})
]);
const INFINITE_STEP=2500000; // depois da Lenda, cada 2,5 mi de XP acrescenta uma estrela: o XP tende ao infinito
const KINDS=Object.freeze(['dinheiro','materiais','tempo','sangue','divulgacao']);
const round2=n=>Math.round(n*100)/100;
function validScore(v){return Number.isInteger(v)&&v>=0&&v<=3;}
function validEvaluation(x){
 if(!x||typeof x!=='object')return false;
 for(const c of CRITERIA)if(!validScore(x[c.id]))return false;
 if(typeof x.reserva!=='boolean')return false;
 if(x.recebidoCents!==null&&x.recebidoCents!==undefined&&!(Number.isSafeInteger(x.recebidoCents)&&x.recebidoCents>0&&x.recebidoCents<1e11))return false;
 for(const k of Object.keys(x))if(!['reserva','recebidoCents',...CRITERIA.map(c=>c.id)].includes(k))return false;
 return true;
}
function quality(x){const w=PARAMS.weights;let s=0,t=0;for(const c of CRITERIA){s+=x[c.id]*w[c.id];t+=w[c.id];}return s/(3*t);}
function proportion(entry){const x=entry.xp;if(entry.kind!=='dinheiro'||!x||!x.recebidoCents||!entry.amountCents)return null;return entry.amountCents/x.recebidoCents;}
function measure(p){if(p===null||p===undefined)return 1;const sd=p<PARAMS.ideal?PARAMS.sdLow:PARAMS.sdHigh;return Math.exp(-((p-PARAMS.ideal)**2)/(2*sd*sd));}
/* Resultado detalhado de uma ajuda. evaluated=false: ainda sem avaliação (não pontua). */
function score(entry){
 const x=entry&&entry.xp;
 if(!x||!validEvaluation(x))return{evaluated:false,xp:0,quality:null,measure:null,proportion:null,lock:null};
 const q=quality(x),p=proportion(entry),m=measure(p);
 let lock=null;if(!x.reserva)lock='reserva';else if(x.seguranca===0)lock='seguranca';
 const xp=lock?0:round2(PARAMS.xpMin+(PARAMS.xpMax-PARAMS.xpMin)*q*m);
 return{evaluated:true,xp,quality:q,measure:m,proportion:p,lock};
}
/* Sugestão automática da Segurança: instituição do catálogo (fonte oficial) = verificada; comprovante anexado soma 1. */
function suggestSecurity(fromCatalog,hasEvidence){return Math.min(3,(fromCatalog?2:1)+(hasEvidence?1:0));}
function level(total){
 let i=0;for(let k=0;k<LEVELS.length;k++)if(total>=LEVELS[k].min)i=k;
 const cur=LEVELS[i],next=LEVELS[i+1]||null;
 const stars=next?0:Math.floor((total-cur.min)/INFINITE_STEP);
 const floor=next?cur.min:cur.min+stars*INFINITE_STEP,ceil=next?next.min:floor+INFINITE_STEP;
 return{index:i,icon:cur.icon,name:cur.name+(stars?' '+'★'.repeat(Math.min(stars,5))+(stars>5?'+'+(stars-5):''):''),stars,next:next?next.name:'Lenda '+'★'.repeat(Math.min(stars+1,5)),toNext:Math.max(0,round2(ceil-total)),progress:Math.max(0,Math.min(1,(total-floor)/(ceil-floor)))};
}
function summary(entries,causeOf){
 const scored=entries.map(e=>({e,s:score(e)}));const ev=scored.filter(r=>r.s.evaluated);
 const total=round2(ev.reduce((a,r)=>a+r.s.xp,0));const n=ev.length;const mean=n?total/n:0;
 const sd=n>1?Math.sqrt(ev.reduce((a,r)=>a+(r.s.xp-mean)**2,0)/n):0;
 const months=new Set(entries.map(e=>e.date.slice(0,7)));
 const causeIds=new Set(entries.map(e=>e.causeId));
 const cats=new Set();const cearaIds=new Set();
 for(const id of causeIds){const c=causeOf?causeOf(id):null;if(c){cats.add(c.category);if(c.ceara)cearaIds.add(id);}}
 const badges=[
  {id:'primeiro',icon:'🔰',name:'Primeiro gesto',hint:'1 ajuda avaliada',ok:n>=1},
  {id:'escudo',icon:'🛡️',name:'Escudo anti-golpe',hint:'5 ajudas verificadas e com comprovante',ok:ev.filter(r=>r.e.xp.seguranca===3).length>=5},
  {id:'ceara',icon:'🌵',name:'Raiz cearense',hint:'3 instituições do Ceará',ok:cearaIds.size>=3},
  {id:'sangue',icon:'🩸',name:'Sangue bom',hint:'1 doação de sangue registrada',ok:entries.some(e=>e.kind==='sangue')},
  {id:'tempo',icon:'⏳',name:'Mãos à obra',hint:'1 ajuda com tempo ou voluntariado',ok:entries.some(e=>e.kind==='tempo')},
  {id:'constancia',icon:'📅',name:'Constância',hint:'ajudas em 3 meses diferentes',ok:months.size>=3},
  {id:'medida',icon:'⚖️',name:'Justa medida',hint:'3 ajudas com medida ≥ 0,8',ok:ev.filter(r=>r.s.proportion!==null&&r.s.measure>=0.8).length>=3},
  {id:'causas',icon:'🌈',name:'Muitas causas',hint:'5 categorias diferentes',ok:cats.size>=5}
 ];
 return{total,count:entries.length,evaluated:n,pending:entries.length-n,mean:round2(mean),sd:round2(sd),locks:ev.filter(r=>r.s.lock).length,level:level(total),badges};
}
/* Linhas no formato da aba "Ajudas" do Placar XP (planilha), para colar ou importar. */
function placarRows(entries,causeOf){
 const head=['Data','Ajuda (o quê e a quem)','Doado (R$)','Recebido no período (R$)','Reserva preservada?','XP da boa ação','Necessidade (0-3)','Gratidão (0-3)','Oportunidade (0-3)','Criatividade (0-3)','Segurança (0-3)','Proporção doado/recebido','Medida (0-1)','Qualidade (0-1)','Observação'];
 const kindLabel={dinheiro:'Doação financeira',materiais:'Materiais',tempo:'Tempo/voluntariado',sangue:'Doação de sangue',divulgacao:'Divulgação'};
 const br=n=>n===null||n===undefined||n===''?'':String(n).replace('.',',');
 const rows=[head];
 for(const e of [...entries].sort((a,b)=>a.date.localeCompare(b.date))){
  const c=causeOf?causeOf(e.causeId):null,s=score(e),x=e.xp;
  rows.push([e.date,`${kindLabel[e.kind]||e.kind} · ${c?c.name:e.causeId}${e.detail?' · '+e.detail:''}`,e.kind==='dinheiro'?br((e.amountCents/100).toFixed(2)):'',x&&x.recebidoCents?br((x.recebidoCents/100).toFixed(2)):'',x?(x.reserva?'Sim':'Não'):'',s.evaluated?br(s.xp.toFixed(2)):'',x?x.necessidade:'',x?x.gratidao:'',x?x.oportunidade:'',x?x.criatividade:'',x?x.seguranca:'',s.proportion===null?'':br(s.proportion.toFixed(4)),s.evaluated?br(s.measure.toFixed(4)):'',s.evaluated?br(s.quality.toFixed(4)):'',s.evaluated?(s.lock==='reserva'?'Trava: reserva comprometida':s.lock==='seguranca'?'Trava: destinatário não verificado':'Registro autodeclarado'):'Pendente de avaliação']);
 }
 return rows;
}
const fmt=n=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(Math.round(n));
const api=Object.freeze({PARAMS,CRITERIA,LEVELS,KINDS,validEvaluation,quality,measure,proportion,score,suggestSecurity,level,summary,placarRows,fmt});
root.BA360_XP=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
