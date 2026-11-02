import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TOPICS,normalize,matchesQuery,topicIdsFor,filterStudyItems,safeStudyHref} from '../assets/js/study-search-core.mjs';
const load=()=>JSON.parse(fs.readFileSync(new URL('../data/study-search.json',import.meta.url)));
test('busca clínica normaliza acentos, combina termos e reconhece siglas sem colisão parcial',()=>{
 assert.equal(normalize('HIPERCALÊMIA — SÓDIO'),'hipercalemia sodio');
 assert.ok(matchesQuery('Injúria renal aguda; potássio','IRA potassio'));
 assert.ok(matchesQuery('Lesão renal aguda; diurese','IRA'));
 assert.ok(matchesQuery('Injúria renal aguda; diurese','LRA'));
 assert.ok(matchesQuery('LRA e potássio','AKI'));
 assert.ok(matchesQuery('Ventilação mecânica e PEEP','VM PEEP'));
 assert.ok(matchesQuery('Tromboembolismo pulmonar de alto risco','TEP risco'));
 assert.ok(!matchesQuery('Terapia renal','IRA'));
 assert.ok(!matchesQuery('Sepse com lactato normal','sepse dopamina'));
});
test('temas explícitos predominam sobre palavras citadas em diferenciais',()=>{
 assert.deepEqual(topicIdsFor({topicId:'renal-eletrolitos',title:'Choque e potássio',tags:[]}),['renal-eletrolitos']);
 assert.ok(topicIdsFor({title:'Ventilação mecânica',tags:[]}).includes('ventilacao-sdra'));
});
test('índice preserva IDs de todos os catálogos, inclui exatamente160 itens novos e16 por tema',()=>{
 const {items,counts}=load();
 assert.equal(new Set(items.map(i=>i.id)).size,items.length);
 assert.equal(items.filter(i=>i.isNew).length,160);
 assert.ok(items.find(i=>i.itemId==='TEMI-IOT-001').topicIds.includes('ventilacao-sdra'));
 assert.ok(items.find(i=>i.itemId==='temi-int26-crrt-instabilidade').topicIds.includes('renal-eletrolitos'));
 assert.ok(filterStudyItems(items,{query:'IRA',type:'questao',onlyNew:true}).length>0);
 assert.deepEqual(Object.fromEntries(['mnemonico','desafio','questao'].map(type=>[type,items.filter(i=>i.type===type&&i.isNew).length])),{mnemonico:50,desafio:30,questao:80});
 const m=JSON.parse(fs.readFileSync(new URL('../data/mnemonicos.json',import.meta.url))).mnemonicos;
 const d=JSON.parse(fs.readFileSync(new URL('../data/desafios.json',import.meta.url)));
 assert.equal(counts.mnemonico,m.length);assert.equal(counts.desafio,d.temi.length+d.r3.length);
 for(const i of m)assert.ok(items.some(x=>x.id==='mnemonico:'+i.id));
 for(const i of [...d.temi,...d.r3])assert.ok(items.some(x=>x.id==='desafio:'+i.id));
 for(const topic of TOPICS){const found=filterStudyItems(items,{topic:topic.id,onlyNew:true});assert.equal(found.length,16);assert.equal(found.filter(i=>i.type==='questao').length,8);assert.equal(found.filter(i=>i.type==='mnemonico').length,5);assert.equal(found.filter(i=>i.type==='desafio').length,3);}
});
test('links são internos e cada resultado leva a um item real sem URL de execução',()=>{
 for(const i of load().items){assert.ok(safeStudyHref(i.href),i.href);const relative=i.href.split(/[?#]/)[0];assert.ok(fs.existsSync(new URL('../'+relative+(relative.endsWith('/')?'index.html':''),import.meta.url)),relative);assert.ok(i.itemId&&i.searchText);}
 for(const bad of ['javascript:alert(1)','https://evil.test/','//evil.test/','questoes/../../private','questoes/index.html\" onclick=\"x'])assert.equal(safeStudyHref(bad),null);
});
function domHarness({query='',fail=false,storageDenied=false,preferences={}}={}){
 class El{constructor(id){this.id=id;this.value='';this.checked=false;this.hidden=false;this.textContent='';this.innerHTML='';this.events={};this.attrs={};}addEventListener(name,fn){this.events[name]=fn;}setAttribute(n,v){this.attrs[n]=v;}insertAdjacentHTML(_,html){this.innerHTML+=html;}focus(){this.focused=true;}reset(){for(const id of ['study-query','study-topic','study-type'])elements[id].value='';elements['study-new'].checked=false;}emit(n){return this.events[n]?.({preventDefault(){},target:this});}}
 const ids=[...fs.readFileSync(new URL('../questoes/explorar.html',import.meta.url),'utf8').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const elements=Object.fromEntries(ids.map(id=>[id,new El(id)]));
 const classes=new Set();const root={classList:{toggle(c,state){if(state)classes.add(c);else classes.delete(c);},contains:c=>classes.has(c)}};
 const history={replaceState(_,__,value){this.value=String(value);}};
 const context={document:{getElementById:id=>elements[id],documentElement:root},window:{addEventListener(){}},localStorage:{getItem(){if(storageDenied)throw Error('denied');return JSON.stringify(preferences);},setItem(){if(storageDenied)throw Error('denied');}},location:{search:query,pathname:'/questoes/explorar.html'},URLSearchParams,history,matchMedia:()=>({matches:false}),fetch:async()=>{if(fail)throw Error('offline');return {ok:true,json:async()=>load()};},console,searchCore:{TOPICS,filterStudyItems,safeStudyHref}};
 const source=fs.readFileSync(new URL('../questoes/assets/study-search.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'const {TOPICS,filterStudyItems,safeStudyHref}=searchCore;\n');
 vm.runInNewContext(source,context,{timeout:2000});return {elements,history,classes};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('controlador real restaura filtros, pagina, atualiza contagem e limpa sem alterar progresso',async()=>{
 const h=domHarness({query:'?topic=renal-eletrolitos&type=questao&new=1'});await settle();
 assert.match(h.elements['study-status'].textContent,/8 de/);
 assert.equal((h.elements['study-results'].innerHTML.match(/role="listitem"/g)||[]).length,8);
 h.elements['study-clear'].onclick();assert.equal(h.elements['study-query'].focused,true);
 assert.equal((h.elements['study-results'].innerHTML.match(/role="listitem"/g)||[]).length,20);
 h.elements['study-more'].onclick();assert.equal((h.elements['study-results'].innerHTML.match(/role="listitem"/g)||[]).length,40);
 h.elements['study-query'].value='zzzzinexistente';h.elements['study-query'].emit('input');assert.equal(h.elements['study-empty'].hidden,false);assert.match(h.history.value,/q=zzzzinexistente/);
});
test('falha de rede é explícita e visualização clara funciona com armazenamento bloqueado',async()=>{
 const h=domHarness({fail:true,storageDenied:true});await settle();
 assert.equal(h.elements['study-retry'].hidden,false);assert.match(h.elements['study-status'].textContent,/Não foi possível/);assert.equal(h.elements['study-results'].attrs['aria-busy'],'false');
 h.elements['theme-toggle'].onclick();assert.ok(h.classes.has('a11y-light'));
});

test('novo banco mantém plano de8questões por dia, revisões por estudo real e armazenamento independente',()=>{
 const html=fs.readFileSync(new URL('../questoes/temi_novembro_2026_questoes.html',import.meta.url),'utf8');
 const coreText=html.split('// BEGIN TEMI TRAINING CORE')[1].split('// END TEMI TRAINING CORE')[0].replace(/^[^\n]*\n/,'');
 const core=vm.runInNewContext(coreText+';trainingCore',{Date});
 const bank=vm.runInNewContext(fs.readFileSync(new URL('../questoes/data/qbank_temi_novembro_2026.js',import.meta.url),'utf8')+';TEMI_NOVEMBRO_2026_QBANK');
 const day='2026-11-02',records={};let plan=core.dailyPlan(bank.questions,bank.blocks,records,day,day);assert.equal(plan.next.length,8);
 for(const q of plan.next)records[q.id]={learnedOn:day,reviews:{},difficult:false};
 plan=core.dailyPlan(bank.questions,bank.blocks,records,day,'2026-11-03');assert.equal(plan.due.length,8);assert.equal(plan.next.length,8);
 assert.ok(html.includes('antigravity:temi-novembro-2026:training:progress:v1'));assert.ok(!html.includes('antigravity:temi-integrado-2026:training:progress:v1'));
});

test('busca respeita texto ampliado e alto contraste da preferência global',async()=>{const h=domHarness({preferences:{large:true,contrast:true,theme:'light'}});await settle();assert.ok(h.classes.has('a11y-large'));assert.ok(h.classes.has('a11y-contrast'));assert.ok(!h.classes.has('a11y-light'));});
