import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {DOCUMENT_LIMITS,DOCUMENT_TYPES,documentPath,documentEligibility,documentIdentity,stableDocumentId,collectDocumentDirectory,collectDocumentFiles,documentMetadataOnly,createDocumentHandleStore,createDocumentController,attachLocalDocumentUI} from '../02_Biblioteca_IA_Engine/assets/local-folders.mjs';
const file=(name='sepse.pdf',extra={})=>({name,type:DOCUMENT_TYPES[name.split('.').pop()]?.mime[0]||'',size:100,lastModified:1700000000000,text(){throw Error('Não ler conteúdo');},arrayBuffer(){throw Error('Não ler bytes');},...extra});
const fh=image=>({kind:'file',getFile:async()=>image});
function dir(name='PDF',children=[],permission='granted'){return {name,kind:'directory',children,permission,queries:[],requests:[],reads:0,async *entries(){this.reads++;for(const child of this.children)yield child;},async queryPermission(options){this.queries.push(options);return this.permission;},async requestPermission(options){this.requests.push(options);this.permission='granted';return this.permission;}};}
function urls(){return {created:[],revoked:[],createObjectURL(file){const value='blob:local-doc-'+(this.created.length+1);this.created.push({value,file});return value;},revokeObjectURL(value){this.revoked.push(value);}};}
function store(value){return {value,calls:[],async load(){this.calls.push('load');return this.value;},async save(next){this.calls.push('save');this.value=next;},async clear(){this.calls.push('clear');this.value=null;}};}
function fixture(extra={}){const urlAPI=urls(),storage=store(),published=[],states=[];const controller=createDocumentController({urlAPI,storage,onItems:items=>published.push(items),onState:state=>states.push(state),...extra});return {controller,urlAPI,storage,published,states};}

test('document paths are relative NFC and reject schemes, traversal, control characters and backslashes',()=>{
  for(const value of ['../x.pdf','x/../y.docx','/a.pdf','C:\\x.pdf','https://example.test/a.pdf','file:secret.pdf','a//b.txt','x/\u0000.pdf'])assert.equal(documentPath(value),null);
  assert.equal(documentPath('cafe\u0301/07:06.pdf'),'café/07:06.pdf');
});
test('document policy supports approved formats, rejects mismatched MIME and bounds bytes',()=>{
  for(const extension of Object.keys(DOCUMENT_TYPES))assert.equal(documentEligibility(file('a.'+extension),'a.'+extension),'');
  for(const [candidate,path,reason] of [[file('a.pdf',{type:'text/html'}),'a.pdf','mime'],[file('a.docx',{type:'application/x-msdownload'}),'a.docx','mime'],[file('a.svg'),'a.svg','unsupported'],[file(),'.secret/a.pdf','hidden'],[file('a.pdf',{size:0}),'a.pdf','empty'],[file('a.pdf',{size:DOCUMENT_LIMITS.maxFileBytes+1}),'a.pdf','oversize'],[file('a.pdf',{isSymbolicLink:true}),'a.pdf','unsafePath']])assert.equal(documentEligibility(candidate,path),reason);
});
test('directory scope is explicit and metadata traversal skips images, symlinks, hidden folders and Pages bundles',async()=>{
  let excludedReads=0;
  const forbidden={kind:'file',getFile:async()=>{excludedReads++;throw Error('não abrir');}};
  const root=dir('PDF',[['sepse.pdf',fh(file())],['imagem.png',forbidden],['.privado',dir('.privado',[['x.pdf',forbidden]])],['a.pages',dir('a.pages',[['Preview.txt',forbidden]])],['link.pdf',{kind:'symlink'}],['broken.docx',{kind:'file',getFile:async()=>{throw Error('indisponível');}}]]);
  const result=await collectDocumentDirectory(root,{slot:'pdf'});assert.equal(result.entries.length,1);assert.equal(excludedReads,0);assert.equal(result.report.ignored.unsafePath,1);assert.equal(result.report.ignored.hidden,1);assert.equal(result.report.ignored.unsupported,2);assert.equal(result.report.ignored.unreadable,1);
  await assert.rejects(collectDocumentDirectory(dir('360X'),{slot:'pdf'}));await assert.rejects(collectDocumentDirectory(dir('DOCUMENTOS'),{slot:'doc'}));
});
test('fallback preserves folders, deduplicates and shares stable identity with directory mode',async()=>{
  const image=file('arquivo.docx',{webkitRelativePath:'DOC 2026/neuro/arquivo.docx'}),fallback=collectDocumentFiles([image,{...image}],{slot:'doc'});
  const native=await collectDocumentDirectory(dir('DOC 2026',[['neuro',dir('neuro',[['arquivo.docx',fh(image)]])]]),{slot:'doc'});
  assert.equal(fallback.report.ignored.duplicate,1);assert.equal(fallback.entries[0].id,native.entries[0].id);assert.equal(fallback.entries[0].path,'neuro/arquivo.docx');
  assert.notEqual(stableDocumentId(documentIdentity('doc','neuro/arquivo.docx',image)),stableDocumentId(documentIdentity('doc','neuro/arquivo.docx',{...image,lastModified:image.lastModified+1})));
  assert.throws(()=>collectDocumentFiles([file('a.pdf',{webkitRelativePath:'360X/PDF/a.pdf'})],{slot:'pdf'}));
});
test('enumeration is bounded, reports oversize and permits cancellation before reading more metadata',async()=>{
  const limits={...DOCUMENT_LIMITS,maxDocuments:2,maxEntries:5,maxDepth:1};
  const result=await collectDocumentDirectory(dir('PDF',Array.from({length:8},(_,i)=>['a'+i+'.pdf',fh(file('a'+i+'.pdf'))])),{slot:'pdf',limits});
  assert.equal(result.entries.length,2);assert.equal(result.report.seen,5);assert.equal(result.report.truncated,true);
  let stop=false,progress=0;
  await assert.rejects(collectDocumentDirectory(dir('PDF',Array.from({length:101},(_,i)=>['a'+i+'.pdf',fh(file('a'+i+'.pdf'))])),{slot:'pdf',onProgress(){progress++;stop=true;},shouldCancel:()=>stop}),{name:'AbortError'});
  assert.equal(progress,1);
});
test('native connection reads metadata only; no blob or content is read until explicit open',async()=>{
  let options;const root=dir('PDF',[['sepse.pdf',fh(file())]]),f=fixture({pickDirectory:async value=>{options=value;return root;},inferTheme:()=> 'sepse-choque'});
  await f.controller.connect('pdf');assert.equal(options.mode,'read');assert.equal(f.urlAPI.created.length,0);assert.equal(f.published.at(-1)[0].clinicalReviewStatus,'pendente');assert.equal(f.published.at(-1)[0].theme,'sepse-choque');
  const item=f.published.at(-1)[0];assert.ok(item.id.startsWith('library-local-'));for(const field of ['file','blob','handle','imageData','imageUrl','url'])assert.equal(Object.hasOwn(item,field),false);
  const opened=await f.controller.open(item.id);assert.match(opened.url,/^blob:/);assert.equal(f.urlAPI.created.length,1);
  const metadata=documentMetadataOnly({...item,url:opened.url,file:{},handle:{},text:'conteúdo'});for(const field of ['url','file','handle','blob','text','relativePath'])assert.equal(Object.hasOwn(metadata,field),false);
});
test('separate PDF and DOC slots coexist and disconnect releases only its own object URLs',async()=>{
  const f=fixture();await f.controller.connectFiles('pdf',[file('a.pdf',{webkitRelativePath:'PDF/a.pdf'})]);await f.controller.connectFiles('doc',[file('b.docx',{webkitRelativePath:'DOC 2026/b.docx'})]);
  const items=f.controller.getItems();assert.equal(items.length,2);for(const item of items)await f.controller.open(item.id);
  await f.controller.disconnect('pdf');assert.equal(f.controller.getItems().length,1);assert.equal(f.controller.getItems()[0].localSource,'doc');assert.equal(f.urlAPI.revoked.length,1);f.controller.dispose();assert.equal(f.urlAPI.revoked.length,2);
});
test('object URLs are lazy, capped and refreshed fingerprints are checked again before opening',async()=>{
  const f=fixture({limits:{...DOCUMENT_LIMITS,maxObjectURLs:2}});await f.controller.connectFiles('pdf',Array.from({length:3},(_,i)=>file('a'+i+'.pdf',{webkitRelativePath:'PDF/a'+i+'.pdf'})));
  for(const item of f.controller.getItems())await f.controller.open(item.id);assert.equal(f.urlAPI.created.length,3);assert.equal(f.urlAPI.revoked.length,1);
  let current=file();const root=dir('PDF',[['sepse.pdf',{kind:'file',getFile:async()=>current}]]),g=fixture();await g.controller.connectHandle('pdf',root);const item=g.controller.getItems()[0];current={...current,size:101};await assert.rejects(g.controller.open(item.id),/mudou/);assert.equal(g.urlAPI.created.length,0);
});
test('restore never enumerates or requests permission, even for an already granted remembered handle',async()=>{
  const root=dir('PDF',[['sepse.pdf',fh(file())]]),storage=store({pdf:root}),f=fixture({storage});await f.controller.restore();assert.equal(root.reads,0);assert.equal(root.requests.length,0);assert.equal(f.published.length,0);assert.equal(f.controller.getState().sources.pdf.canReconnect,true);await f.controller.reconnect('pdf');assert.equal(root.reads,1);
  const prompt=dir('DOC 2026',[['a.docx',fh(file('a.docx'))]],'prompt'),g=fixture({storage:store({doc:prompt})});await g.controller.restore();assert.equal(prompt.requests.length,0);await g.controller.reconnect('doc');assert.equal(prompt.requests.length,1);assert.deepEqual(prompt.requests[0],{mode:'read'});
});
test('cancelled picker, empty/wrong folder and persistence errors keep the previous connection usable',async()=>{
  const f=fixture({pickDirectory:async()=>{throw Object.assign(Error('cancelled'),{name:'AbortError'});}});await f.controller.connectFiles('pdf',[file('a.pdf',{webkitRelativePath:'PDF/a.pdf'})]);const first=f.controller.getItems()[0];assert.equal((await f.controller.connect('pdf')).cancelled,true);
  assert.ok((await f.controller.connectFiles('pdf',[file('x.png',{webkitRelativePath:'PDF/x.png'})])).error);assert.ok((await f.controller.connectFiles('pdf',[file('a.pdf',{webkitRelativePath:'360X/a.pdf'})])).error);assert.equal(f.controller.getItems()[0].id,first.id);assert.equal((await f.controller.refresh('pdf')).needsFallback,true);
  const fail=async()=>{throw Error('sem armazenamento');},g=fixture({storage:{load:fail,save:fail,clear:fail}});await g.controller.connectHandle('pdf',dir('PDF',[['a.pdf',fh(file('a.pdf'))]]));assert.equal(g.controller.getState().count,1);assert.match(g.controller.getState().storageWarning,/lembradas/);await assert.rejects(createDocumentHandleStore(undefined).load());
});
test('cancel during a delayed scan cannot resurrect the old request or its saved handle',async()=>{
  let release;const waiting=new Promise(resolve=>release=resolve),f=fixture();await f.controller.connectFiles('pdf',[file('a.pdf',{webkitRelativePath:'PDF/a.pdf'})]);
  const pending=f.controller.connectHandle('pdf',dir('PDF',[['late.pdf',{kind:'file',getFile:async()=>{await waiting;return file('late.pdf');}}]]));await new Promise(resolve=>setImmediate(resolve));f.controller.cancel('pdf');release();assert.equal((await pending).cancelled,true);assert.equal(f.controller.getItems()[0].filename,'a.pdf');assert.equal(f.controller.getState().sources.pdf.busy,false);
  let allow;const permission=new Promise(resolve=>allow=resolve),root=dir('PDF',[['b.pdf',fh(file('b.pdf'))]]);let calls=0;root.queryPermission=async()=>++calls===1?'granted':permission;
  const g=fixture(),connecting=g.controller.connectHandle('pdf',root);await new Promise(resolve=>setImmediate(resolve));await g.controller.disconnect('pdf');allow('granted');await connecting;assert.equal(g.controller.getState().count,0);assert.equal(g.controller.getState().sources.pdf.canReconnect,false);assert.equal(g.storage.value,null);
});

const html=fs.readFileSync(new URL('../02_Biblioteca_IA_Engine/index.html',import.meta.url),'utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
function fn(name){const marker='function '+name+'(',start=inline.indexOf(marker);assert.ok(start>=0,name);const rest=inline.slice(start),next=rest.slice(1).search(/\n(?:async )?function /);return next<0?rest:rest.slice(0,next+1);}
function libraryCore(){
  const elements=Object.fromEntries(['busca','filtro-formato','filtro-origem','grid-arquivos','grid-title','grid-subtitle','empty-state','btn-load-more'].map(id=>[id,{value:'',innerHTML:'',textContent:'',style:{},parentNode:{style:{}}}]));
  const code=`let catalog={items:[]},localFolderItems=[],taxonomy={themes:[{id:'infectologia',label:'Infectologia'},{id:'endocrino-metabolico',label:'Endócrino'},{id:'nefro-aki-trs',label:'Nefrologia'},{id:'neuro-uti',label:'Neuro UTI'},{id:'temi-prova',label:'TEMI'}]},documentManifest={partitions:[],origins:[]},currentFilter='todos',currentFormatFilter='todos',currentOriginFilter='todos',currentRenderLimit=50,lastRenderState='';const document={getElementById:id=>elements[id]};const popularFiltros=()=>{};const renderStats=()=>{};const getIcon=()=>'';const inlineToken=value=>value;const normalizePath=value=>value;const safeEncodePath=value=>value;const authorshipLabel=()=>'';const licenseLabel=()=>'';const clinicalReviewLabel=()=>'';const privacyReviewLabel=()=>'';`+['escapeHTML','searchKey','matchesSearch','libraryItems','inferLocalDocumentTheme','setLocalLibraryItems','localLibraryCardHTML','popularFormatos','renderGrid'].map(fn).join('\n')+`\n({setItems:setLocalLibraryItems,infer:inferLocalDocumentTheme,render:renderGrid,all:libraryItems,setPublic:items=>catalog.items=items,publicItems:()=>catalog.items,setOrigin:value=>currentOriginFilter=value,setTheme:value=>currentFilter=value})`;
  return {core:vm.runInNewContext(code,{elements}),elements};
}
test('actual library bridge searches local filename/folder alongside public documents and preserves the canonical catalog',()=>{
  const {core,elements}=libraryCore(),published={id:'canonical',title:'Original público',path:'acervo/a.pdf',tipo:'pdf',formato:'pdf',theme:'infectologia'};core.setPublic([published]);
  const item={id:'library-local-1234567890abcdef',folderLinked:true,title:'Resumo privado',filename:'a.pdf',relativePath:'tuberculose/a.pdf',extension:'pdf',tipo:'pdf',formato:'pdf',formatoLabel:'PDF',localSource:'pdf',origem:'icloud-local',theme:'infectologia'};core.setItems([item],{focus:true});
  assert.equal(core.publicItems().length,1);assert.equal(core.publicItems()[0].path,published.path);assert.equal(core.all().length,2);assert.match(elements['grid-arquivos'].innerHTML,/data-local-document-action="preview"/);assert.ok(!elements['grid-arquivos'].innerHTML.includes('view.officeapps'));
  elements.busca.value='tuberculose';core.render();assert.match(elements['grid-subtitle'].textContent,/1 documento/);elements.busca.value='não existente';core.render();assert.match(elements['grid-subtitle'].textContent,/0 documento/);
  elements.busca.value='';core.setOrigin('todos');core.render();assert.match(elements['grid-subtitle'].textContent,/2 documento/);core.setOrigin('icloud-local');core.setTheme('infectologia');core.render();assert.match(elements['grid-subtitle'].textContent,/1 documento/);
  core.setItems([]);assert.equal(core.all().length,1);assert.match(elements['grid-arquivos'].innerHTML,/Original público/);assert.equal(core.infer('tuberculose/a.pdf'),'infectologia');
  assert.equal(core.infer('insuficiencia adrenal.pdf'),'endocrino-metabolico');assert.equal(core.infer('cortisol e tireoide.docx'),'endocrino-metabolico');assert.equal(core.infer('lesao renal aguda.pdf'),'nefro-aki-trs');assert.equal(core.infer('TDAH neurodiversidade.pdf'),'');assert.equal(core.infer('neuro anotacoes.txt'),'');assert.equal(core.infer('Turbo TEMI 360X material.pdf'),'');
});
test('markup exposes one shared search, private picker fallbacks and an isolated PDF preview without remote office routing',()=>{
  const version=createHash('sha256').update(fs.readFileSync(new URL('../02_Biblioteca_IA_Engine/assets/local-folders.mjs',import.meta.url))).digest('hex').slice(0,16);assert.ok(html.includes('assets/local-folders.mjs?v='+version));
  for(const marker of ['id="libraryConnect-pdf"','id="libraryConnect-doc"','id="libraryLocalCancel"','id="libraryFolderInput-pdf"','id="libraryFolderInput-doc"','webkitdirectory directory multiple','id="libraryLocalFrame"','sandbox="" referrerpolicy="no-referrer"','LibraryLocalBridge','conteúdo integral não é indexado'])assert.ok(html.includes(marker),marker);
  const module=fs.readFileSync(new URL('../02_Biblioteca_IA_Engine/assets/local-folders.mjs',import.meta.url),'utf8');for(const forbidden of ['fetch(','XMLHttpRequest','readAsDataURL','view.officeapps','api.openai','file.text(','file.arrayBuffer('])assert.ok(!module.includes(forbidden),forbidden);
});
test('DOM adapter drives fallback, lazy PDF open/close and download-only DOCX without automatic document loads',async()=>{
  const ids=['libraryLocalControls','libraryLocalPreview','libraryLocalFrame','libraryLocalPreviewTitle','libraryLocalPreviewClose','libraryLocalCancel','libraryLocalStatus','libraryLocalCount','libraryLocalWarning','libraryLocalReport','libraryLocalRemember','libraryLocalFallback','grid-arquivos',...['pdf','doc'].flatMap(slot=>['libraryConnect-','libraryReconnect-','libraryRefresh-','libraryDisconnect-','librarySourceCount-','libraryFolderInput-'].map(prefix=>prefix+slot))];
  const elements=Object.fromEntries(ids.map(id=>[id,{listeners:new Map(),value:'',files:[],checked:true,hidden:false,disabled:false,textContent:'',open:false,clicks:0,addEventListener(type,listener){this.listeners.set(type,listener);},click(){this.clicks++;},focus(){},removeAttribute(key){delete this[key];},showModal(){this.open=true;},close(){this.open=false;this.listeners.get('close')?.({});},contains(){return true;},async emit(type,event={}){return this.listeners.get(type)?.(event);}}]));
  const urlAPI=urls(),published=[],downloaded=[],events=new Map();
  const controller=attachLocalDocumentUI({document:{getElementById:id=>elements[id],createElement:()=>({click(){downloaded.push(this);},remove(){}}),body:{append(){}}},window:{URL:urlAPI,addEventListener:(type,listener)=>events.set(type,listener)},bridge:{setItems:items=>published.push(items),inferTheme:()=>''}});await new Promise(resolve=>setImmediate(resolve));assert.equal(urlAPI.created.length,0);assert.equal(elements.libraryLocalRemember.disabled,true);
  await elements['libraryConnect-pdf'].emit('click');assert.equal(elements['libraryFolderInput-pdf'].clicks,1);elements['libraryFolderInput-pdf'].files=[file('a.pdf',{webkitRelativePath:'PDF/a.pdf'})];await elements['libraryFolderInput-pdf'].emit('change');assert.equal(published.at(-1).length,1);assert.equal(urlAPI.created.length,0);
  const action=(id,kind)=>({target:{closest:()=>({dataset:{localDocumentId:id,localDocumentAction:kind}})},preventDefault(){},stopPropagation(){}});
  await elements['grid-arquivos'].emit('click',action(controller.getItems()[0].id,'preview'));assert.equal(elements.libraryLocalPreview.open,true);assert.match(elements.libraryLocalFrame.src,/^blob:/);await elements.libraryLocalPreviewClose.emit('click');assert.equal(elements.libraryLocalFrame.src,undefined);assert.equal(urlAPI.revoked.length,1);
  elements['libraryFolderInput-doc'].files=[file('a.docx',{webkitRelativePath:'DOC 2026/a.docx'})];await elements['libraryFolderInput-doc'].emit('change');await elements['grid-arquivos'].emit('click',action(controller.getItems().find(item=>item.localSource==='doc').id,'preview'));assert.equal(elements.libraryLocalPreview.open,false);assert.equal(downloaded.length,1);assert.match(downloaded[0].href,/^blob:/);assert.equal(downloaded[0].download,'a.docx');assert.ok(elements.libraryLocalRemember.listeners.has('change'));elements.libraryLocalRemember.checked=false;await elements.libraryLocalRemember.emit('change');assert.equal(controller.getItems().length,2);events.get('pagehide')({persisted:false});assert.equal(urlAPI.created.length,urlAPI.revoked.length);
});

test('cancelling the final permission await preserves the previous items and live URL before commit',async()=>{
  const f=fixture();await f.controller.connectFiles('pdf',[file('a.pdf',{webkitRelativePath:'PDF/a.pdf'})]);const previous=f.controller.getItems()[0],opened=await f.controller.open(previous.id);
  let release,calls=0;const waiting=new Promise(resolve=>release=resolve),root=dir('PDF',[['b.pdf',fh(file('b.pdf'))]]);root.queryPermission=async()=>++calls===1?'granted':waiting;
  const connecting=f.controller.connectHandle('pdf',root);await new Promise(resolve=>setImmediate(resolve));assert.equal(f.controller.getItems()[0].id,previous.id);assert.equal(f.controller.cancel('pdf').cancelled,true);release('granted');assert.equal((await connecting).cancelled,true);assert.equal(f.controller.getItems()[0].id,previous.id);assert.ok(!f.urlAPI.revoked.includes(opened.url));assert.equal(f.published.length,1);
});
test('commit ends cancellation before persistence completes; inaccessible subfolders produce partial results, AbortError does not',async()=>{
  let release;const waiting=new Promise(resolve=>release=resolve),storage={async save(){await waiting;},async clear(){},async load(){}};
  const f=fixture({storage}),connecting=f.controller.connectHandle('pdf',dir('PDF',[['a.pdf',fh(file('a.pdf'))]]));await new Promise(resolve=>setImmediate(resolve));assert.equal(f.controller.getState().sources.pdf.busy,false);assert.equal(f.controller.cancel('pdf').cancelled,false);assert.equal(f.controller.getItems().length,1);release();assert.equal((await connecting).connected,true);
  const broken={kind:'directory',async *entries(){throw Object.assign(Error('no access'),{name:'NotAllowedError'});}};
  const result=await collectDocumentDirectory(dir('PDF',[['a.pdf',fh(file('a.pdf'))],['private',broken],['b.pdf',fh(file('b.pdf'))]]),{slot:'pdf'});assert.equal(result.entries.length,2);assert.equal(result.report.ignored.unreadable,1);assert.equal(result.report.incomplete,true);assert.equal(result.report.truncated,false);
  await assert.rejects(collectDocumentDirectory({name:'PDF',async *entries(){throw Error('root denied');}},{slot:'pdf'}));
  const aborted={kind:'directory',async *entries(){throw Object.assign(Error('stop'),{name:'AbortError'});}};
  await assert.rejects(collectDocumentDirectory(dir('PDF',[['a.pdf',fh(file())],['abort',aborted]]),{slot:'pdf'}),{name:'AbortError'});
});
test('turning Remember off clears both handles immediately, preserves live items and cannot be undone by a late permission or restore',async()=>{
  const storage=store(),f=fixture({storage});await f.controller.connectHandle('pdf',dir('PDF',[['a.pdf',fh(file('a.pdf'))]]));await f.controller.connectHandle('doc',dir('DOC 2026',[['b.docx',fh(file('b.docx'))]]));assert.equal(Object.keys(storage.value).length,2);
  const forgetting=f.controller.setRemember(false);assert.equal(f.controller.getState().sources.pdf.canReconnect,false);assert.equal(f.controller.getState().sources.doc.canReconnect,false);assert.equal(f.controller.getItems().length,2);await forgetting;assert.equal(storage.value,null);const restored=fixture({storage});await restored.controller.restore();assert.equal(restored.controller.getState().sources.pdf.canReconnect,false);assert.equal(restored.controller.getState().sources.doc.canReconnect,false);assert.equal(f.controller.getItems().length,2);
  await f.controller.refresh('pdf');assert.equal(storage.value,null);assert.equal(f.controller.getState().sources.pdf.canReconnect,false);
  let release,calls=0;const pending=new Promise(resolve=>release=resolve),root=dir('PDF',[['late.pdf',fh(file('late.pdf'))]]);root.queryPermission=async()=>++calls===1?'granted':pending;const g=fixture(),connecting=g.controller.connectHandle('pdf',root);await new Promise(resolve=>setImmediate(resolve));await g.controller.setRemember(false);release('granted');await connecting;assert.equal(g.controller.getState().sources.pdf.canReconnect,false);assert.equal(g.storage.value,null);
});
