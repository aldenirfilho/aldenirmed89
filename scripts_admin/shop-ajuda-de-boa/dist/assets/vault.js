/* Local-only vault (v2.0: aceita sangue/divulgação e a avaliação opcional do XP da Boa Ação). AES-256-GCM + PBKDF2-SHA256, 310000 iterations.
   No browser password, card, CPF or server credential is requested.
   No security audit is claimed. An unlocked/compromised browser can access its contents. */
(function(root){
'use strict';
const C=root.BA360,ITERATIONS=310000,MAX_STATE=16*1024*1024,MAX_FILE=3*1024*1024;
const AAD=new TextEncoder(),DB_NAME='bolsa360-private-v1';
let dbPromise=null,key=null,salt=null,state=null,revision=null,busy=false,epoch=0;
function supported(){return !!(root.crypto?.subtle&&root.indexedDB&&root.crypto?.getRandomValues);}
function db(){if(!supported())return Promise.reject(Error('A carteira exige um navegador com Web Crypto e IndexedDB. Abra em HTTPS ou em localhost.'));
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore('vault');r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result);};r.onerror=()=>{dbPromise=null;reject(Error('O navegador não permitiu abrir o armazenamento local.'));};r.onblocked=()=>reject(Error('Feche outras abas desta carteira e tente de novo.'));});return dbPromise;}
async function read(){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('vault','readonly'),r=tx.objectStore('vault').get('main');r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(Error('Não foi possível ler a carteira local.'));});}
async function write(envelope,expected){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('vault','readwrite'),store=tx.objectStore('vault');let conflict=false;const r=store.get('main');r.onsuccess=()=>{if((r.result?.revision??null)!==expected){conflict=true;tx.abort();return;}store.put(envelope,'main');};tx.oncomplete=resolve;tx.onerror=()=>reject(Error('Não foi possível salvar. Verifique o espaço e as permissões do navegador.'));tx.onabort=()=>reject(Error(conflict?'A carteira mudou em outra aba. Bloqueie e abra novamente antes de continuar.':'A gravação foi cancelada. Nenhuma alteração foi confirmada.'));});}
function passwordCheck(password){if(typeof password!=='string'||password.length<12||password.length>256)throw Error('Use uma senha local de 12 a 256 caracteres. Prefira uma frase longa e exclusiva.');}
async function derive(password,s){const material=await crypto.subtle.importKey('raw',AAD.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:s,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
function signature(bytes){if(bytes.length>=5&&String.fromCharCode(...bytes.slice(0,5))==='%PDF-')return 'application/pdf';if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return 'image/png';if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';return null;}
function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===s;}
function validateState(s){
 if(!s||s.version!==1||!Array.isArray(s.entries)||s.entries.length>5000)throw Error('Estrutura de carteira inválida.');
 const serialized=JSON.stringify(s);if(AAD.encode(serialized).length>MAX_STATE)throw Error('A carteira atingiu o limite local de 16 MB. Exporte o backup e reduza os anexos antes de continuar.');
 const ids=new Set(),causes=new Set(root.BA360_CATALOG.map(c=>c.id));
 for(const e of s.entries){
  if(!e||typeof e.id!=='string'||!/^BA-[a-f0-9-]{36}$/i.test(e.id)||ids.has(e.id)||!causes.has(e.causeId))throw Error('Registro inválido ou duplicado.');ids.add(e.id);
  if(!validDate(e.date)||!['dinheiro','tempo','materiais','sangue','divulgacao'].includes(e.kind)||typeof e.detail!=='string'||e.detail.length>240||typeof e.createdAt!=='string'||!Number.isFinite(Date.parse(e.createdAt)))throw Error('Campos de registro inválidos.');
  if(e.kind==='dinheiro'&&(!Number.isSafeInteger(e.amountCents)||e.amountCents<1||e.amountCents>C.MAX_CENTS))throw Error('Valor de registro inválido.');
  if(e.kind!=='dinheiro'&&e.amountCents!==0)throw Error('Tempo, materiais, sangue e divulgação não podem ser somados como dinheiro.');
  if(e.xp!==undefined&&e.xp!==null&&!(root.BA360_XP&&root.BA360_XP.validEvaluation(e.xp)))throw Error('Avaliação de XP inválida.');
  if(e.evidence){const f=e.evidence;if(typeof f.data!=='string'||f.data.length>MAX_FILE*1.34||!Number.isInteger(f.bytes)||f.bytes<1||f.bytes>MAX_FILE||typeof f.sha256!=='string'||!/^[a-f0-9]{64}$/.test(f.sha256)||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(f.data))throw Error('Anexo inválido.');const bytes=C.unb64(f.data);if(bytes.length!==f.bytes||signature(bytes)!==f.type)throw Error('O tipo ou tamanho de um anexo é inválido.');}
 }
 return s;
}
function validateEnvelope(e){if(!e||e.format!=='BA360-VAULT'||e.version!==1||e.kdf!=='PBKDF2-SHA256'||e.iterations!==ITERATIONS||e.cipher!=='AES-256-GCM'||typeof e.revision!=='string'||!/^[a-f0-9-]{36}$/i.test(e.revision)||typeof e.data!=='string'||e.data.length>24*1024*1024||typeof e.salt!=='string'||typeof e.iv!=='string'||e.salt.length>32||e.iv.length>24)throw Error('Este arquivo não é um backup compatível da Bolsa de Ajuda 360°.');if(C.unb64(e.salt).length!==16||C.unb64(e.iv).length!==12)throw Error('Backup inválido.');return e;}
async function encrypt(s,k,sa){validateState(s);const iv=crypto.getRandomValues(new Uint8Array(12)),rev=crypto.randomUUID();const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:AAD.encode('BA360|1|'+rev)},k,AAD.encode(JSON.stringify(s)));return{format:'BA360-VAULT',version:1,cipher:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:C.b64(sa),iv:C.b64(iv),revision:rev,data:C.b64(new Uint8Array(data))};}
async function decrypt(e,password){validateEnvelope(e);passwordCheck(password);const sa=C.unb64(e.salt),k=await derive(password,sa);let s;try{const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:C.unb64(e.iv),additionalData:AAD.encode('BA360|1|'+e.revision)},k,C.unb64(e.data));s=validateState(JSON.parse(new TextDecoder().decode(bytes)));}catch{throw Error('Senha incorreta ou arquivo de carteira inválido.');}return{k,sa,s};}
function lock(){epoch++;key=null;salt=null;state=null;revision=null;}
function checkEpoch(start){if(start!==epoch)throw Error('A carteira foi bloqueada durante a operação. Abra novamente para conferir o estado salvo.');}
async function exclusive(fn){if(busy)throw Error('Uma gravação está em andamento. Aguarde um instante.');busy=true;try{return await fn();}finally{busy=false;}}
const api={supported,MAX_FILE,signature,validDate,validateState,validateEnvelope,
 get locked(){return key===null;},get data(){return state?structuredClone(state):null;},
 async exists(){return !!(await read());},
 async create(password){return exclusive(async()=>{const start=epoch;passwordCheck(password);const sa=crypto.getRandomValues(new Uint8Array(16)),k=await derive(password,sa),s={version:1,entries:[]};const e=await encrypt(s,k,sa);await write(e,null);checkEpoch(start);key=k;salt=sa;state=s;revision=e.revision;return api.data;});},
 async unlock(password){return exclusive(async()=>{const start=epoch,e=await read();if(!e)throw Error('Não há carteira salva neste navegador.');const d=await decrypt(e,password);checkEpoch(start);key=d.k;salt=d.sa;state=d.s;revision=e.revision;return api.data;});},
 async mutate(fn){return exclusive(async()=>{if(!key)throw Error('Abra sua carteira antes de salvar.');const start=epoch,expected=revision,k=key,sa=salt,next=structuredClone(state);fn(next);validateState(next);const e=await encrypt(next,k,sa);await write(e,expected);checkEpoch(start);state=next;revision=e.revision;return api.data;});},
 async backup(){const e=await read();if(!e)throw Error('Crie uma carteira antes de exportar.');return JSON.stringify(e,null,2);},
 async importBackup(e,password,allowReplace=false){return exclusive(async()=>{const start=epoch,old=await read();if(old&&!allowReplace)throw Error('Autorize a substituição da carteira local antes de importar.');const d=await decrypt(e,password),fresh=await encrypt(d.s,d.k,d.sa);await write(fresh,old?.revision??null);checkEpoch(start);key=d.k;salt=d.sa;state=d.s;revision=fresh.revision;return api.data;});},
 async erase(){return exclusive(async()=>{const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('vault','readwrite');tx.objectStore('vault').delete('main');tx.oncomplete=resolve;tx.onerror=()=>reject(Error('Não foi possível apagar a carteira.'));});lock();});},
 lock
};root.BA360_VAULT=Object.freeze(api);
})(globalThis);
