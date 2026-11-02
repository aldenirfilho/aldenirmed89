#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {TOPICS,topicIdsFor} from '../assets/js/study-search-core.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(ROOT,'data/study-search.json');
const json=relative=>JSON.parse(fs.readFileSync(path.join(ROOT,relative),'utf8'));
const plain=value=>String(value||'').replace(/<[^>]*>/g,' ').replace(/[#[\]*_>`]/g,' ').replace(/\s+/g,' ').trim();
const items=[];
function add(raw) {
 const topicIds=topicIdsFor(raw);
 items.push({...raw,topicIds,isNew:/^(?:nov26|temi-nov26|TEMI-NOV26)/i.test(raw.itemId),searchText:plain([raw.title,raw.excerpt,raw.category,raw.subtopic,raw.topicLabel,...raw.tags,raw.content||''].join(' ')),content:undefined});
}
for(const m of json('data/mnemonicos.json').mnemonicos) add({id:'mnemonico:'+m.id,itemId:m.id,type:'mnemonico',title:m.title,excerpt:plain(Object.entries(m.letters||{}).map(([a,b])=>a+': '+b).join(' · ')),category:m.category||'',topicId:m.topicId,topicLabel:m.topicLabel,subtopic:m.subtopic||'',tags:m.tags||[],content:m.content,href:'mnemonicos/?id='+encodeURIComponent(m.id),reviewStatus:m.reviewStatus||'conferir-no-item'});
const challenges=json('data/desafios.json');
for(const branch of ['temi','r3'])for(const d of challenges[branch]||[])add({id:'desafio:'+d.id,itemId:d.id,type:'desafio',title:d.title,excerpt:plain(d.excerpt),category:branch.toUpperCase(),topicId:d.topicId,topicLabel:d.topicLabel,subtopic:d.subtopic||'',tags:d.tags||[],content:d.content,href:'desafios/?b='+branch+'&id='+encodeURIComponent(d.id),reviewStatus:d.reviewStatus||'conferir-no-item'});
const banks=[['qbank_avc_agudo.js','QBANK_DATA','avc_agudo_questoes.html'],['qbank_temi_abcde.js','TEMI_ABCDE_QBANK','temi_abcde_questoes.html'],['qbank_temi_integrado_2026.js','TEMI_INTEGRADO_2026_QBANK','temi_integrado_2026_questoes.html'],['qbank_temi_novembro_2026.js','TEMI_NOVEMBRO_2026_QBANK','temi_novembro_2026_questoes.html']];
for(const [file,constant,page]of banks){
 const source=fs.readFileSync(path.join(ROOT,'questoes/data',file),'utf8');
 const bank=vm.runInNewContext(source+';'+constant,{}, {timeout:3000});
 for(const q of bank.questions){
  const block=(bank.blocks||[]).find(b=>b.id===q.block);
  add({id:'questao:'+q.id,itemId:q.id,type:'questao',title:(q.subtopic||block?.label||q.domain||'Questão TEMI')+' · '+q.id,excerpt:plain(q.stem),category:block?.label||q.domain||'',blockLabel:block?.label||'',topicId:q.topicId,topicLabel:q.topicLabel,subtopic:q.subtopic||'',tags:q.tags||[],href:'questoes/'+page+'?qid='+encodeURIComponent(q.id)+'#'+encodeURIComponent(q.id),reviewStatus:q.reviewStatus||bank.meta.status||'conferir-no-item'});
 }
}
if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error('IDs duplicados na busca');
const payload={schemaVersion:1,release:'2026-11-02',description:'Índice público de estudo; status clínico informado em cada fonte.',topics:TOPICS,counts:Object.fromEntries(['mnemonico','desafio','questao'].map(type=>[type,items.filter(i=>i.type===type).length])),items};
const data=JSON.stringify(payload,null,2)+'\n';
if(process.argv.includes('--check')){if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==data)throw new Error('Índice de busca desatualizado; execute build_study_search.mjs');}
else fs.writeFileSync(output,data);
console.log(JSON.stringify({items:items.length,...payload.counts}));
