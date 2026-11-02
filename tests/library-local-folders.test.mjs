import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {DOCUMENT_LIMITS,DOCUMENT_TYPES,DOCUMENT_THEME_MANIFEST,LOCAL_DOCUMENT_THEMES,parseDocumentThemeManifest,documentPath,documentEligibility,documentIdentity,stableDocumentId,collectDocumentDirectory,collectDocumentFiles,documentMetadataOnly,createDocumentHandleStore,createDocumentController,attachLocalDocumentUI} from '../02_Biblioteca_IA_Engine/assets/local-folders.mjs';
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
  const aliasTable=inline.match(/const LOCAL_DOCUMENT_SUBJECT_ALIASES = Object\.freeze\((\[[\s\S]*?\])\);/)[1];
  const code=`const LOCAL_DOCUMENT_SUBJECT_ALIASES=${aliasTable};let catalog={items:[]},localFolderItems=[],localDocumentThemes=[],taxonomy={themes:[{id:'infectologia',label:'Infectologia'},{id:'endocrino-metabolico',label:'Endócrino'},{id:'nefro-aki-trs',label:'Nefrologia'},{id:'neuro-uti',label:'Neuro UTI'},{id:'temi-prova',label:'TEMI'}]},documentManifest={partitions:[],origins:[]},currentFilter='todos',currentFormatFilter='todos',currentOriginFilter='todos',currentRenderLimit=50,lastRenderState='';const document={getElementById:id=>elements[id]};const popularFiltros=()=>{};const renderStats=()=>{};const getIcon=()=>'';const inlineToken=value=>value;const normalizePath=value=>value;const safeEncodePath=value=>value;const authorshipLabel=()=>'';const licenseLabel=()=>'';const clinicalReviewLabel=()=>'';const privacyReviewLabel=()=>'';`+['escapeHTML','searchKey','matchesSearch','setLocalDocumentThemes','libraryFilterThemes','localDocumentThemeById','localDocumentSubjects','localDocumentSearchAliases','matchesLocalDocumentSearch','libraryItems','inferLocalDocumentTheme','setLocalLibraryItems','localLibraryCardHTML','popularFormatos','renderGrid'].map(fn).join('\n')+`\n({setItems:setLocalLibraryItems,aliases:localDocumentSearchAliases,matchLocal:matchesLocalDocumentSearch,setThemes:setLocalDocumentThemes,filterThemes:libraryFilterThemes,infer:inferLocalDocumentTheme,render:renderGrid,all:libraryItems,setPublic:items=>catalog.items=items,publicItems:()=>catalog.items,setOrigin:value=>currentOriginFilter=value,setTheme:value=>currentFilter=value})`;
  const core=vm.runInNewContext(code,{elements});core.setThemes(LOCAL_DOCUMENT_THEMES);return {core,elements};
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
  for(const marker of ['id="libraryConnect-pdf"','id="libraryConnect-doc"','id="libraryLocalCancel"','id="libraryFolderInput-pdf"','id="libraryFolderInput-doc"','webkitdirectory directory multiple','id="libraryLocalOpen"','target="_blank" rel="noopener noreferrer"','id="libraryLocalDownload"','LibraryLocalBridge','conteúdo integral não é indexado'])assert.ok(html.includes(marker),marker);
  const localDialog=html.match(/<dialog id="libraryLocalPreview"[\s\S]*?<\/dialog>/)[0];assert.ok(!localDialog.includes('<iframe'));assert.ok(!html.includes('id="libraryLocalFrame"'));
  const module=fs.readFileSync(new URL('../02_Biblioteca_IA_Engine/assets/local-folders.mjs',import.meta.url),'utf8');for(const forbidden of ['fetch(','XMLHttpRequest','readAsDataURL','view.officeapps','api.openai','file.text(','file.arrayBuffer('])assert.ok(!module.includes(forbidden),forbidden);
});
test('DOM adapter drives fallback, lazy PDF open/close and download-only DOCX without automatic document loads',async()=>{
  const ids=['libraryLocalControls','libraryLocalPreview','libraryLocalOpen','libraryLocalDownload','libraryLocalPreviewTitle','libraryLocalPreviewClose','libraryLocalCancel','libraryLocalStatus','libraryLocalCount','libraryLocalWarning','libraryLocalReport','libraryLocalRemember','libraryLocalFallback','grid-arquivos',...['pdf','doc'].flatMap(slot=>['libraryConnect-','libraryReconnect-','libraryRefresh-','libraryDisconnect-','librarySourceCount-','libraryFolderInput-'].map(prefix=>prefix+slot))];
  const elements=Object.fromEntries(ids.map(id=>[id,{listeners:new Map(),value:'',files:[],checked:true,hidden:false,disabled:false,textContent:'',open:false,clicks:0,addEventListener(type,listener){this.listeners.set(type,listener);},click(){this.clicks++;},focus(){},removeAttribute(key){delete this[key];},showModal(){this.open=true;},close(){this.open=false;this.listeners.get('close')?.({});},contains(){return true;},async emit(type,event={}){return this.listeners.get(type)?.(event);}}]));
  const urlAPI=urls(),published=[],downloaded=[],events=new Map();
  const controller=attachLocalDocumentUI({document:{getElementById:id=>elements[id],createElement:()=>({click(){downloaded.push(this);},remove(){}}),body:{append(){}}},window:{URL:urlAPI,addEventListener:(type,listener)=>events.set(type,listener)},bridge:{setItems:items=>published.push(items),inferTheme:()=>''}});await new Promise(resolve=>setImmediate(resolve));assert.equal(urlAPI.created.length,0);assert.equal(elements.libraryLocalRemember.disabled,true);
  await elements['libraryConnect-pdf'].emit('click');assert.equal(elements['libraryFolderInput-pdf'].clicks,1);elements['libraryFolderInput-pdf'].files=[file('a.pdf',{webkitRelativePath:'PDF/a.pdf'})];await elements['libraryFolderInput-pdf'].emit('change');assert.equal(published.at(-1).length,1);assert.equal(urlAPI.created.length,0);
  const action=(id,kind)=>({target:{closest:()=>({dataset:{localDocumentId:id,localDocumentAction:kind}})},preventDefault(){},stopPropagation(){}});
  await elements['grid-arquivos'].emit('click',action(controller.getItems()[0].id,'preview'));assert.equal(elements.libraryLocalPreview.open,true);assert.match(elements.libraryLocalOpen.href,/^blob:/);assert.equal(elements.libraryLocalDownload.href,elements.libraryLocalOpen.href);assert.equal(elements.libraryLocalDownload.download,'a.pdf');await elements.libraryLocalPreviewClose.emit('click');assert.equal(elements.libraryLocalOpen.href,undefined);assert.equal(elements.libraryLocalDownload.href,undefined);assert.equal(elements.libraryLocalDownload.download,undefined);assert.equal(urlAPI.revoked.length,1);
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

function themeEntry(extra={}){return {path:'arquivo.pdf',size:100,modifiedMs:1700000000000,theme:'pneumologia',themeLabel:'Pneumologia',confidence:'alta',method:'titulo',matchedTerms:['Tuberculose'],secondaryThemes:['infectologia'],needsReview:false,reason:'Assunto reconhecido para organização local',...extra};}
function themeManifest(entries=[themeEntry()],sourceName='PDF',extra={}){return {schema:DOCUMENT_THEME_MANIFEST.schema,sourceName,entries,...extra};}
function themeFile(value=themeManifest(),extra={}){const content=typeof value==='string'?value:JSON.stringify(value);return {name:DOCUMENT_THEME_MANIFEST.name,type:'application/json',size:Buffer.byteLength(content),lastModified:1700000000000,async text(){return content;},...extra};}

test('local document taxonomy keeps the 25 public themes exact and adds only the agreed twelve private themes',()=>{
  const published=JSON.parse(fs.readFileSync(new URL('../02_Biblioteca_IA_Engine/data/biblioteca_taxonomia_temas.json',import.meta.url))).themes;
  assert.equal(LOCAL_DOCUMENT_THEMES.length,37);assert.deepEqual(LOCAL_DOCUMENT_THEMES.slice(0,25).map(({id,label})=>({id,label})),published.map(({id,label})=>({id,label})));
  assert.deepEqual(LOCAL_DOCUMENT_THEMES.slice(25).map(theme=>theme.id),['pneumologia','dermatologia','tdah-neurodiversidade','juridico','financas-patrimonio','academico-projetos','fe-historia-cultura','inbox-revisar','gineco-obstetricia','pediatria-neonatologia','saude-coletiva-epidemiologia','cirurgia-trauma']);
});
test('theme manifest parser validates schema, source, fields, URLs, safe document paths, limits and theme IDs',()=>{
  const parsed=parseDocumentThemeManifest(JSON.stringify(themeManifest()),'PDF');assert.equal(parsed.get('arquivo.pdf').theme,'pneumologia');assert.deepEqual(parsed.get('arquivo.pdf').classificationTerms,['Tuberculose']);
  for(const path of ['07:06/arquivo.pdf','guia www.exemplo.docx','cafe\u0301.pdf'])assert.ok(parseDocumentThemeManifest(JSON.stringify(themeManifest([themeEntry({path})])),'PDF').has(path.normalize('NFC')));
  assert.equal(parseDocumentThemeManifest(JSON.stringify(themeManifest([themeEntry({confidence:'baixa'})])),'PDF').get('arquivo.pdf').classificationNeedsReview,true);
  const invalid=['{',JSON.stringify({schema:DOCUMENT_THEME_MANIFEST.schema,entries:[]}),JSON.stringify(themeManifest([],'DOC 2026')),JSON.stringify(themeManifest([],'PDF',{href:'https://example.test'})),
    ...[{path:'../arquivo.pdf'},{path:'/tmp/a.pdf'},{path:'file:arquivo.pdf'},{path:'a\\b.pdf'},{path:'a.png'},{path:'00_ORGANIZADOS_POR_TEMA/a.pdf'},{path:'.privado/a.pdf'},{theme:'inventado'},{secondaryThemes:['inventado']},{confidence:'validado'},{needsReview:'false'},{size:0},{modifiedMs:1.5},{reason:'https://example.test'},{matchedTerms:['data:secret']},{clinicalReviewStatus:'aprovado'},{notes:'nota invadida'},{imageUrl:'blob:x'},{href:'a.pdf'},{title:'outro título'}].map(extra=>JSON.stringify(themeManifest([themeEntry(extra)]))),
    JSON.stringify(themeManifest([themeEntry(),themeEntry()])),JSON.stringify(themeManifest(Array.from({length:10001},(_,i)=>themeEntry({path:`${i}.pdf`})))),' '.repeat(DOCUMENT_THEME_MANIFEST.maxBytes+1)];
  for(const content of invalid)assert.throws(()=>parseDocumentThemeManifest(content,'PDF'));
});
test('native and fallback collectors read only the exact root manifest and apply strict path, size, mtime without changing IDs',async()=>{
  let nestedReads=0,generatedReads=0;
  const json=themeFile(),image=file('arquivo.pdf'),children=[['arquivo.pdf',fh(image)],[DOCUMENT_THEME_MANIFEST.name,fh(json)],['sub',dir('sub',[[DOCUMENT_THEME_MANIFEST.name,{kind:'file',getFile:async()=>{nestedReads++;return json;}}]])],...['00_ORGANIZADOS_POR_TEMA','00_ORGANIZACAO_360X'].map(name=>[name,dir(name,[['arquivo.pdf',{kind:'file',getFile:async()=>{generatedReads++;return image;}}]])])];
  const native=await collectDocumentDirectory(dir('PDF',children),{slot:'pdf'});assert.equal(native.entries.length,1);assert.equal(native.report.manifest.matched,1);assert.equal(native.report.ignored.generated,2);assert.equal(nestedReads,0);assert.equal(generatedReads,0);
  const plain=collectDocumentFiles([{...image,webkitRelativePath:'PDF/arquivo.pdf'}],{slot:'pdf'});assert.equal(plain instanceof Promise,false);assert.equal(native.entries[0].id,plain.entries[0].id);
  const fallback=await collectDocumentFiles([{...image,webkitRelativePath:'PDF/arquivo.pdf'},themeFile(themeManifest(),{webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name}),file('copy.pdf',{webkitRelativePath:'PDF/00_ORGANIZADOS_POR_TEMA/copy.pdf'})],{slot:'pdf'});assert.equal(fallback.report.manifest.matched,1);assert.equal(fallback.entries[0].id,native.entries[0].id);assert.equal(fallback.report.ignored.generated,1);
  const mismatch=await collectDocumentFiles([file('arquivo.pdf',{size:101,webkitRelativePath:'PDF/arquivo.pdf'}),file('arquivo.pdf',{webkitRelativePath:'PDF/sub/arquivo.pdf'}),themeFile(themeManifest(),{webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name})],{slot:'pdf'});assert.equal(mismatch.report.manifest.fingerprintMismatch,1);assert.equal(mismatch.report.manifest.unmatched,1);assert.ok(mismatch.entries.every(entry=>!entry.classification));
  const changedTime=await collectDocumentFiles([file('arquivo.pdf',{lastModified:1700000000001,webkitRelativePath:'PDF/arquivo.pdf'}),themeFile(themeManifest(),{webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name})],{slot:'pdf'});assert.equal(changedTime.report.manifest.fingerprintMismatch,1);
});
test('invalid, oversized, wrong MIME, symlink or source-mismatched manifests fall back safely without modifying document metadata',async()=>{
  for(const [candidate,status] of [[themeFile('{'),'invalid'],[themeFile(themeManifest([],'DOC 2026')),'invalid'],[themeFile(themeManifest(),{size:DOCUMENT_THEME_MANIFEST.maxBytes+1,text(){throw Error('não ler');}}),'oversize'],[themeFile(themeManifest(),{type:'text/html'}),'mime'],[themeFile(themeManifest(),{isSymbolicLink:true}),'invalid'],[themeFile(themeManifest(),{text(){throw Error('sem leitura');}}),'unreadable']]){
    const f=fixture({inferTheme:()=> 'uti-geral'});const result=await f.controller.connectFiles('pdf',[file('arquivo.pdf',{webkitRelativePath:'PDF/arquivo.pdf'}),{...candidate,webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name}]);assert.equal(result.connected,true);assert.equal(result.report.manifest.status,status);const item=f.controller.getItems()[0];assert.equal(item.theme,'uti-geral');assert.equal(item.classificationSource,'filename');assert.equal(item.classificationNeedsReview,true);assert.equal(item.clinicalReviewStatus,'pendente');assert.equal(f.urlAPI.created.length,0);
  }
  const duplicate=await collectDocumentFiles([file('arquivo.pdf',{webkitRelativePath:'PDF/arquivo.pdf'}),themeFile(themeManifest(),{webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name}),themeFile(themeManifest(),{webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name})],{slot:'pdf'});assert.equal(duplicate.report.manifest.status,'invalid');
});
test('manifest subjects and secondary filters are transient, escaped, locally searchable and leave public notes and routes untouched',async()=>{
  const f=fixture();await f.controller.connectFiles('pdf',[file('arquivo.pdf',{webkitRelativePath:'PDF/arquivo.pdf'}),themeFile(themeManifest([themeEntry({needsReview:true,matchedTerms:['Tuberculose','<script>texto</script>']})]),{webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name})]);const item=f.controller.getItems()[0];assert.equal(item.theme,'pneumologia');assert.equal(item.classificationNeedsReview,true);assert.equal(item.clinicalReviewStatus,'pendente');assert.deepEqual(item.tags,[]);
  for(const key of ['reason','matchedTerms','method','manifest','href','url','notes','themeLabel'])assert.equal(Object.hasOwn(item,key),false,key);
  const metadata=documentMetadataOnly(item);for(const key of ['classificationTerms','classificationSecondaryThemes','classificationSource','classificationConfidence','classificationNeedsReview','relativePath'])assert.equal(Object.hasOwn(metadata,key),false,key);
  const {core,elements}=libraryCore();const canonical={id:'public-a',path:'acervo/a.pdf',title:'Público',tipo:'pdf',theme:'infectologia',notes:'nota já existente',classificationTerms:['Tuberculose']};core.setPublic([canonical]);core.setItems([item],{focus:true});assert.equal(core.publicItems()[0].notes,'nota já existente');assert.equal(core.publicItems()[0].path,'acervo/a.pdf');assert.equal(core.publicItems()[0].theme,'infectologia');
  elements.busca.value='tuberculose';core.render();assert.match(elements['grid-subtitle'].textContent,/1 documento/);assert.ok(!elements['grid-arquivos'].innerHTML.includes('<script>texto'));assert.match(elements['grid-arquivos'].innerHTML,/&lt;script&gt;texto/);assert.match(elements['grid-arquivos'].innerHTML,/catálogo privado/);assert.match(elements['grid-arquivos'].innerHTML,/Conferir classificação/);
  elements.busca.value='';core.setTheme('infectologia');core.render();assert.match(elements['grid-subtitle'].textContent,/1 documento/);assert.ok(core.filterThemes().some(theme=>theme.id==='pneumologia'));assert.ok(!core.filterThemes().some(theme=>theme.id==='juridico'));
  core.setItems([]);assert.equal(core.filterThemes().some(theme=>theme.id==='pneumologia'),false);assert.equal(core.publicItems()[0].notes,'nota já existente');
});
test('cancellation while a manifest is pending never publishes late classifications or replaces an active source',async()=>{
  const f=fixture();await f.controller.connectFiles('pdf',[file('a.pdf',{webkitRelativePath:'PDF/a.pdf'})]);const before=f.controller.getItems()[0];let release;const waiting=new Promise(resolve=>release=resolve),json=themeFile(themeManifest(),{async text(){await waiting;return JSON.stringify(themeManifest());}});
  const connecting=f.controller.connectFiles('pdf',[file('arquivo.pdf',{webkitRelativePath:'PDF/arquivo.pdf'}),{...json,webkitRelativePath:'PDF/'+DOCUMENT_THEME_MANIFEST.name}]);await new Promise(resolve=>setImmediate(resolve));f.controller.cancel('pdf');release();assert.equal((await connecting).cancelled,true);assert.equal(f.controller.getItems()[0].id,before.id);assert.equal(f.published.length,1);
});

test('local search supports accents, reordered compound topics and safe abbreviations from generic labels in opaque documents',()=>{
  const {core,elements}=libraryCore();
  const make=(index,terms,theme='infectologia',extra={})=>({id:'library-local-'+index.toString(16).padStart(16,'0'),folderLinked:true,title:'a8c42f-'+index,filename:'a8c42f-'+index+'.pdf',relativePath:'a8c42f-'+index+'.pdf',extension:'pdf',tipo:'pdf',formato:'pdf',formatoLabel:'PDF',localSource:'pdf',origem:'icloud-local',theme,classificationSource:'manifest',classificationTerms:terms,classificationSecondaryThemes:[],clinicalReviewStatus:'pendente',...extra});
  const items=[make(1,['Tuberculose pulmonar resistente']),make(2,['Tuberculose extrapulmonar']),make(3,['Doença pulmonar obstrutiva crônica'],'pneumologia'),make(4,['Insuficiência adrenal'],'endocrino-metabolico'),make(5,['Lesão renal aguda'],'nefro-aki-trs'),make(6,[], 'infectologia',{title:'outbreak'}),make(7,['Pneumonia'],'pneumologia'),make(8,['Pneumonia adquirida na comunidade'],'pneumologia'),make(9,[],'uti-geral',{title:'Tuberculose',filename:'Tuberculose.pdf'}),make(10,['IgG4'],'reumatologia'),make(11,['Doença relacionada a IgG4'],'reumatologia')];
  core.setItems(items,{focus:true});const count=query=>{elements.busca.value=query;core.render();return Number(elements['grid-subtitle'].textContent.split(' ')[0]);};
  assert.equal(count('pulmonár tuberculóse'),1);assert.equal(count('resistente TB'),1);assert.equal(count('TB'),2);assert.equal(count('COPD'),1);assert.equal(count('crônica obstrutiva pulmonar'),1);assert.equal(count('renal'),1);assert.equal(count('PAC'),1);assert.equal(count('IgG 4'),2);assert.equal(count('doença relacionada'),1);
  assert.deepEqual([...core.aliases(items[8])],[]);assert.equal(core.matchLocal('outbreak','tb'),false);assert.equal(core.matchLocal('insuficiência adrenal','renal'),false);assert.equal(core.matchLocal('tuberculose extrapulmonar','pulmonar'),false);
  assert.equal(core.matchLocal('No FA','fa no'),true);assert.equal(core.matchLocal('fenômeno fadiga','fa'),false);
  assert.deepEqual(items[0].classificationTerms,['Tuberculose pulmonar resistente']);assert.equal(Object.hasOwn(items[0],'searchAliases'),false);
});
test('reviewed manifest refresh keeps fingerprint IDs and manual public notes, updates searchable topics and leaves clinical review pending',async()=>{
  let revised=false;const image=file('opaque.docx');
  const json=themeFile(themeManifest([], 'DOC 2026'),{async text(){return JSON.stringify(themeManifest([themeEntry({path:'opaque.docx',theme:revised?'infectologia':'inbox-revisar',themeLabel:revised?'Infectologia / Antimicrobianos':'A revisar / Classificação pendente',confidence:revised?'alta':'baixa',method:'revisao',matchedTerms:revised?['Tuberculose resistente']:[],secondaryThemes:revised?['pneumologia']:[],needsReview:!revised})],'DOC 2026'));}});
  const handle=dir('DOC 2026',[['opaque.docx',fh(image)],[DOCUMENT_THEME_MANIFEST.name,fh(json)]]),f=fixture();await f.controller.connectHandle('doc',handle);const before=f.controller.getItems()[0];assert.equal(before.theme,'inbox-revisar');assert.equal(before.classificationNeedsReview,true);const opened=await f.controller.open(before.id);
  revised=true;await f.controller.refresh('doc');const after=f.controller.getItems()[0];assert.equal(after.id,before.id);assert.equal(after.theme,'infectologia');assert.equal(after.classificationNeedsReview,false);assert.equal(after.clinicalReviewStatus,'pendente');assert.ok(f.urlAPI.revoked.includes(opened.url));const reopened=await f.controller.open(after.id);assert.match(reopened.url,/^blob:/);assert.notEqual(reopened.url,opened.url);
  const {core,elements}=libraryCore();core.setPublic([{id:'public-control',title:'Controle público',path:'acervo/control.pdf',tipo:'pdf',theme:'uti-geral',notes:'nota manual preservada'}]);core.setItems([after],{focus:true});elements.busca.value='TB resistente';core.render();assert.match(elements['grid-subtitle'].textContent,/1 documento/);assert.match(elements['grid-arquivos'].innerHTML,/revisão clínica pendente/);assert.ok(!elements['grid-arquivos'].innerHTML.includes('Conferir classificação'));assert.equal(core.publicItems()[0].notes,'nota manual preservada');assert.equal(core.publicItems()[0].path,'acervo/control.pdf');
  const portable=documentMetadataOnly(after);for(const field of ['classificationTerms','classificationSecondaryThemes','classificationSource','classificationNeedsReview','searchAliases','manifest','reason'])assert.equal(Object.hasOwn(portable,field),false);
  f.controller.dispose();
});

test('Word owner files are excluded by basename only, without opening metadata or creating blobs, in native and fallback modes',async()=>{
  assert.equal(documentEligibility(file('~$a.docx'),'~$a.docx'),'auxiliary');assert.equal(documentEligibility(file('~$a.DOC'),'pasta/~$a.DOC'),'auxiliary');
  for(const extension of ['pdf','txt','csv','md','pages'])assert.equal(documentEligibility(file('~$legitimo.'+extension),'~$legitimo.'+extension),'');
  let auxiliaryReads=0;const blocked={kind:'file',getFile:async()=>{auxiliaryReads++;throw Error('Não abrir auxiliar');}};
  const root=dir('DOC 2026',[['~$a.docx',blocked],['folder',dir('folder',[['~$b.DOC',blocked]])],['normal.docx',fh(file('normal.docx'))],['~$legitimo.txt',fh(file('~$legitimo.txt'))]]);
  const native=await collectDocumentDirectory(root,{slot:'doc'});assert.equal(native.entries.length,2);assert.equal(native.report.ignored.auxiliary,2);assert.equal(native.report.ignored.unreadable,0);assert.equal(auxiliaryReads,0);
  const fallback=collectDocumentFiles([file('~$a.docx',{webkitRelativePath:'DOC 2026/~$a.docx'}),file('normal.docx',{webkitRelativePath:'DOC 2026/normal.docx'}),file('~$legitimo.txt',{webkitRelativePath:'DOC 2026/~$legitimo.txt'})],{slot:'doc'});assert.equal(fallback.entries.length,2);assert.equal(fallback.report.ignored.auxiliary,1);
  const f=fixture();await f.controller.connectHandle('doc',root);assert.equal(f.controller.getItems().length,2);assert.equal(f.urlAPI.created.length,0);assert.equal(auxiliaryReads,0);assert.ok(f.controller.getItems().every(item=>!/^~\$.*\.(doc|docx)$/i.test(item.filename)));
});
test('a manifest may retain Word auxiliary classifications without exposing those files as readable documents',async()=>{
  const entries=[themeEntry({path:'normal.docx'}),themeEntry({path:'~$aux.docx',size:162})],json=themeFile(themeManifest(entries,'DOC 2026'),{webkitRelativePath:'DOC 2026/'+DOCUMENT_THEME_MANIFEST.name});
  const f=fixture();const result=await f.controller.connectFiles('doc',[file('normal.docx',{webkitRelativePath:'DOC 2026/normal.docx'}),file('~$aux.docx',{size:162,webkitRelativePath:'DOC 2026/~$aux.docx'}),json]);assert.equal(result.connected,true);assert.equal(result.report.accepted,1);assert.equal(result.report.ignored.auxiliary,1);assert.equal(result.report.manifest.entries,2);assert.equal(result.report.manifest.matched,1);assert.equal(result.report.manifest.unmatched,0);assert.equal(result.report.manifest.unusedEntries,1);assert.equal(f.controller.getItems()[0].filename,'normal.docx');assert.equal(f.urlAPI.created.length,0);
});
