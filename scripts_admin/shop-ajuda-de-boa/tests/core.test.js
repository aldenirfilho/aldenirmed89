'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const C=require('../dist/assets/core');
const D=require('../dist/assets/catalog');

test('valores monetários em centavos, com formatos brasileiros',()=>{
 for(const [s,n] of [['0,01',1],['25',2500],['25.50',2550],['R$ 1.250,99',125099],['99.999,99',9999999]])assert.equal(C.cents(s),n);
});
test('rejeita valores negativos, vazios, ambíguos ou fora do limite',()=>{
 for(const s of ['',null,'0','-25','1.2345','3,456','1e4','Infinity','NaN','100.000,00','<script>','25,10,11'])assert.throws(()=>C.cents(s));
});
test('escapa conteúdo HTML',()=>{assert.equal(C.esc('<>&"\''),'&lt;&gt;&amp;&quot;&#39;');});
test('CRC-16/CCITT-FALSE corresponde ao vetor padrão',()=>{assert.equal(C.crc16('123456789'),'29B1');});
test('BR Code da Caatinga corresponde ao vetor de referência',()=>{
 assert.equal(C.pix(D.find(c=>c.id==='caatinga').pix,2500),'00020101021126360014br.gov.bcb.pix011402885544000103520400005303986540525.005802BR5919ASSOCIACAO CAATINGA6009FORTALEZA62070503***6304A94B');
});
test('Pix e QR de todas as chaves: comprimento, checksum, tipos e limites',()=>{
 for(const c of D.filter(c=>c.pix))for(const v of [1,2500,C.MAX_CENTS]){
  const s=C.pix(c.pix,v);assert.equal(s.slice(-4),C.crc16(s.slice(0,-4)));assert.ok(s.includes(c.pix.key));
  const m=C.qrMatrix(s);assert.equal(m.length,49);assert.ok(m.every(r=>r.length===49&&r.every(b=>typeof b==='boolean')));
  assert.ok(C.qrSvg(s).includes('viewBox="0 0 57 57"'));
 }
 assert.throws(()=>C.pix(null,2500));assert.throws(()=>C.pix(D.find(c=>c.pix).pix,0));assert.throws(()=>C.pix(D.find(c=>c.pix).pix,1.2));assert.throws(()=>C.qrMatrix('a'.repeat(193)));
});
test('catálogo 2.0: instituições e tickers únicos, links HTTPS, datas, perspectiva e projetos com fonte',()=>{
 assert.equal(D.length,12);assert.equal(D.filter(x=>x.ceara).length,6);assert.equal(D.filter(x=>x.pix).length,3);assert.ok(!JSON.stringify(D).includes('@'));assert.equal(new Set(D.map(x=>x.id)).size,D.length);assert.equal(new Set(D.map(x=>x.ticker)).size,D.length);
 for(const d of D){for(const key of ['website','source','helpUrl'])assert.equal(new URL(d[key]).protocol,'https:');assert.match(d.checked,/^2026-(09-19|11-16)$/);assert.ok(d.proposal);assert.match(d.ticker,/^[A-Z]{4}(3|4|5|6|7|8|9|11)$/);assert.ok(d.perspective.length>20);assert.ok(d.projects.length>=2&&d.projects.every(p=>p.t&&p.d));assert.equal(new URL(d.projSource.url).protocol,'https:');assert.match(d.projSource.checked,/^2026-11-16$/);}
 assert.deepEqual(D.find(x=>x.id==='caatinga').pix.key,'02885544000103');assert.equal(D.find(x=>x.id==='hemoce-sobral').pix,null);
});

// In-memory IndexedDB-shaped adapter for isolated crypto/state tests only.
// This does NOT replace a browser storage integration test.
function storageAdapter(){
 let value=null;
 const store={get(){const r={};queueMicrotask(()=>{r.result=structuredClone(value);r.onsuccess?.();});return r;},put(v){value=structuredClone(v);},delete(){value=null;}};
 const db={createObjectStore(){},close(){},transaction(){const tx={objectStore:()=>store,abort(){tx.aborted=true;queueMicrotask(()=>tx.onabort?.());}};setTimeout(()=>{if(!tx.aborted)tx.oncomplete?.();},0);return tx;}};
 return {indexedDB:{open(){const r={};queueMicrotask(()=>{r.result=db;r.onsuccess?.();});return r;}},read:()=>structuredClone(value)};
}
function vault(adapter){
 const ctx={BA360:C,BA360_CATALOG:D,BA360_XP:require('../dist/assets/xp'),crypto:crypto.webcrypto,indexedDB:adapter.indexedDB,TextEncoder,TextDecoder,Uint8Array,Date,JSON,structuredClone,Set,Error,console};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/assets/vault.js'),'utf8'),ctx);
 return ctx.BA360_VAULT;
}
const record=()=>({id:'BA-'+crypto.randomUUID(),causeId:'caatinga',date:'2026-09-19',kind:'dinheiro',amountCents:2500,detail:'TESTE AUTOMATIZADO — NENHUM PAGAMENTO',createdAt:'2026-09-19T12:00:00.000Z',evidence:null});
const password='frase-exclusiva-para-teste-360';
test('datas e assinaturas de anexos: rejeita HTML, datas inválidas e dinheiro em tempo',()=>{
 const V=vault(storageAdapter());assert.equal(V.validDate('2026-02-30'),false);assert.equal(V.validDate('2024-02-29'),true);assert.equal(V.signature(new TextEncoder().encode('<html>')),null);
 assert.equal(V.signature(new TextEncoder().encode('%PDF-1.4\n')),'application/pdf');
 assert.throws(()=>V.validateState({version:1,entries:[{...record(),kind:'tempo'}]}));
});
test('AES-GCM/PBKDF2: salva ciphertext, bloqueia, recusa senha errada e restaura',async()=>{
 const a=storageAdapter(),V=vault(a);await V.create(password);await V.mutate(s=>s.entries.push(record()));
 assert.equal(V.data.entries.length,1);const envelope=a.read();const serialized=JSON.stringify(envelope);
 assert.ok(!serialized.includes('TESTE AUTOMATIZADO'));assert.ok(!serialized.includes('caatinga'));assert.equal(envelope.iterations,310000);assert.equal(envelope.cipher,'AES-256-GCM');
 V.lock();assert.equal(V.locked,true);assert.equal(V.data,null);
 await assert.rejects(V.unlock('senha-incorreta-muito-longa'));assert.equal(V.locked,true);
 await V.unlock(password);assert.equal(V.data.entries[0].amountCents,2500);
 const b=storageAdapter(),W=vault(b);await W.importBackup(envelope,password);assert.equal(W.data.entries[0].detail,'TESTE AUTOMATIZADO — NENHUM PAGAMENTO');
 await assert.rejects(W.importBackup(envelope,password));
 const old=b.read().revision;const modified={...envelope,data:envelope.data.slice(0,2)+(envelope.data[2]==='A'?'B':'A')+envelope.data.slice(3)};
 await assert.rejects(W.importBackup(modified,password,true));assert.equal(b.read().revision,old);
 await W.erase();assert.equal(await W.exists(),false);
});
test('conflito entre duas instâncias não sobrescreve silenciosamente',async()=>{
 const a=storageAdapter(),V=vault(a),W=vault(a);await V.create(password);await W.unlock(password);
 await V.mutate(s=>s.entries.push(record()));const revision=a.read().revision;
 await assert.rejects(W.mutate(s=>s.entries.push(record())),/outra aba/);assert.equal(a.read().revision,revision);
 W.lock();await W.unlock(password);assert.equal(W.data.entries.length,1);
});
test('bloqueio durante derivação não reabre o cofre',async()=>{
 const V=vault(storageAdapter());await V.create(password);V.lock();const opening=V.unlock(password);V.lock();await assert.rejects(opening,/bloqueada/);assert.equal(V.locked,true);assert.equal(V.data,null);
});

test('cofre 2.0 aceita sangue, divulgação e avaliação de XP; recusa avaliação inválida',async()=>{
 const V=vault(storageAdapter());await V.create(password);
 const ev={necessidade:3,gratidao:3,oportunidade:2,criatividade:1,seguranca:3,reserva:true,recebidoCents:600000};
 await V.mutate(s=>{s.entries.push({...record(),xp:ev});s.entries.push({...record(),kind:'sangue',amountCents:0,detail:'Doação de sangue',xp:{...ev,recebidoCents:null}});s.entries.push({...record(),kind:'divulgacao',amountCents:0,detail:'Compartilhei a campanha'});});
 assert.equal(V.data.entries.length,3);
 await assert.rejects(V.mutate(s=>{s.entries[0].xp={...ev,necessidade:4};}),/XP inválida/);
 await assert.rejects(V.mutate(s=>{s.entries[0].xp={...ev,extra:1};}),/XP inválida/);
 await assert.rejects(V.mutate(s=>{s.entries.push({...record(),kind:'sangue',amountCents:100});}));
});
