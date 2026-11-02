import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {FOLDER_LIMITS,THEME_MANIFEST,LOCAL_THEME_IDS,parseThemeManifest,relativeImagePath,imageEligibility,fileIdentity,stableFolderCardId,collectDirectory,collectFiles,folderMetadataOnly,createHandleStore,createFolderController,attachFolderUI} from '../05_Midia_E_Feed/assets/icloud-folder.mjs';

const file=(name='sepse.png',extra={})=>({name,type:'image/png',size:100,lastModified:1700000000000,...extra});
const fileHandle=image=>({kind:'file',getFile:async()=>image});
function directory(name='IMAGENS',children=[],permission='granted'){
  return {name,kind:'directory',children,permission,queries:[],requests:[],
    async *entries(){for(const entry of this.children)yield entry;},
    async queryPermission(options){this.queries.push(options);return this.permission;},
    async requestPermission(options){this.requests.push(options);this.permission='granted';return 'granted';}};
}
function urls(){let next=0;return {created:[],revoked:[],createObjectURL(image){const url='blob:mock-'+(++next);this.created.push({url,image});return url;},revokeObjectURL(url){this.revoked.push(url);}};}
function memoryStore(initial){return {value:initial,calls:[],async load(){this.calls.push('load');return this.value;},async save(handle){this.calls.push('save');this.value=handle;},async clear(){this.calls.push('clear');this.value=null;}};}
function fixture(options={}){
  const urlAPI=urls(),storage=memoryStore(),published=[],states=[];
  const controller=createFolderController({urlAPI,storage,onCards:(cards,settings)=>published.push({cards,settings}),onState:state=>states.push(state),...options});
  return {controller,urlAPI,storage,published,states};
}
function manifestEntry(extra={}){return {path:'sepse.png',size:100,modifiedMs:1700000000000,theme:'sepse-choque',themeLabel:'Sepse / Choque',confidence:'alta',method:'nome-pasta-ocr',matchedTerms:['sepse'],secondaryThemes:[],needsReview:false,reason:'Termo temático presente',...extra};}
function manifest(entries=[manifestEntry()],extra={}){return {schema:THEME_MANIFEST.schema,sourceName:'IMAGENS',entries,...extra};}
function manifestFile(value=manifest(),extra={}){const content=typeof value==='string'?value:JSON.stringify(value);return {name:THEME_MANIFEST.name,type:'application/json',size:Buffer.byteLength(content),lastModified:1700000000000,async text(){return content;},...extra};}

test('private theme parser accepts only bounded metadata and the exact current theme allowlist',()=>{
  const parsed=parseThemeManifest(JSON.stringify(manifest()));
  assert.deepEqual(parsed.get('sepse.png'),{size:100,modifiedMs:1700000000000,theme:'sepse-choque',confidence:'alta',needsReview:false});
  assert.deepEqual(LOCAL_THEME_IDS,[...JSON.parse(fs.readFileSync(new URL('../05_Midia_E_Feed/data/themes.json',import.meta.url))).themes].map(theme=>theme.id));
  for(const field of ['themeLabel','reason','matchedTerms','method','secondaryThemes','path'])assert.equal(Object.hasOwn(parsed.get('sepse.png'),field),false,field);
  assert.equal(parseThemeManifest(JSON.stringify(manifest([manifestEntry({path:'cafe\u0301.png',confidence:'baixa'})]))).get('café.png').needsReview,true);
  assert.equal(parseThemeManifest(JSON.stringify(manifest([manifestEntry({theme:'a-classificar'})]))).get('sepse.png').needsReview,true);
  for(const path of ['2026-11-02 17:30:01.png','guia www.example.png','guia https:exemplo.png','subpasta/guia www.example.png'])assert.ok(parseThemeManifest(JSON.stringify(manifest([manifestEntry({path})]))).has(path));
});

test('private parser rejects URLs, injected fields, unsafe paths, duplicates, unknown themes and excess entries',()=>{
  const rejected=[
    '{', JSON.stringify(manifest([],{href:'https://example.test'})),JSON.stringify(manifest([],{sourceName:'OUTRA'})),
    ...[
      {path:'../sepse.png'},{path:'/tmp/sepse.png'},{path:'https:exemplo.png'},{path:'file:exemplo.png'},{path:'//servidor/exemplo.png'},{path:'neuro\\sepse.png'},{path:'.oculto/a.png'},{path:'00_ORGANIZACAO_360X/a.png'},
      {path:'x.svg'},{theme:'tema-inexistente'},{themeLabel:'https://example.test'},{reason:'dados https:\u002f\u002fexample.test'},
      {matchedTerms:['blob:secret']},{reason:'mailto:private@example.test'},{reason:'smb://servidor/acervo'},{clinicalReviewStatus:'aprovado'},{href:'x'},{imageUrl:'local.png'},{notes:'nota substituída'},
      {confidence:'aprovado'},{secondaryThemes:['outro']},{size:-1},{modifiedMs:1.5},{needsReview:'false'},
    ].map(extra=>JSON.stringify(manifest([manifestEntry(extra)]))),
    JSON.stringify(manifest([manifestEntry(),manifestEntry()])),
    JSON.stringify(manifest(Array.from({length:THEME_MANIFEST.maxEntries+1},(_,i)=>manifestEntry({path:`${i}.png`})) )),
    ' '.repeat(THEME_MANIFEST.maxBytes+1)
  ];
  for(const raw of rejected)assert.throws(()=>parseThemeManifest(raw));
});

test('directory applies local themes by exact relative path, size and mtime without touching image bytes',async()=>{
  const image=file();image.text=()=>{throw Error('pixels não devem ser lidos');};
  const dir=directory('IMAGENS',[[THEME_MANIFEST.name,fileHandle(manifestFile(manifest([manifestEntry({needsReview:true})])))],['sepse.png',fileHandle(image)]]);
  const result=await collectDirectory(dir);
  assert.deepEqual(result.entries[0].classification,{theme:'sepse-choque',classificationSource:'manifest',classificationConfidence:'alta',classificationNeedsReview:true});
  assert.equal(result.report.manifest.matched,1);assert.equal(result.report.accepted,1);assert.equal(result.report.ignored.unsupported,0);
  const f=fixture({pickDirectory:async()=>dir});await f.controller.connect();
  const card=f.published.at(-1).cards[0];assert.equal(card.theme,'sepse-choque');assert.equal(card.clinicalReviewStatus,'pendente');
  for(const key of ['path','manifest','reason','matchedTerms','method','secondaryThemes','themeLabel'])assert.equal(Object.hasOwn(card,key),false,key);
  const exported=folderMetadataOnly(card);
  for(const key of ['classificationSource','classificationConfidence','classificationNeedsReview'])assert.equal(Object.hasOwn(exported,key),false,key);
});

test('same filename in a different folder or changed fingerprint never inherits a manifest classification',async()=>{
  const result=await collectFiles([
    file('sepse.png',{webkitRelativePath:'IMAGENS/sepse.png',size:101}),
    file('sepse.png',{webkitRelativePath:'IMAGENS/neuro/sepse.png'}),
    file('other.png',{webkitRelativePath:'IMAGENS/other.png',lastModified:1700000000001}),
    manifestFile(manifest([manifestEntry(),manifestEntry({path:'other.png'})]),{webkitRelativePath:'IMAGENS/'+THEME_MANIFEST.name})
  ]);
  assert.ok(result.entries.every(entry=>!entry.classification));
  assert.equal(result.report.manifest.fingerprintMismatch,2);assert.equal(result.report.manifest.unmatched,1);assert.equal(result.report.manifest.matched,0);
});

test('fallback and directory picker produce identical stable IDs, use only root manifest and ignore organization shortcuts',async()=>{
  let nestedReads=0,shortcutReads=0;
  const localManifest=manifestFile();
  const dir=directory('IMAGENS',[
    ['sepse.png',fileHandle(file())],[THEME_MANIFEST.name,fileHandle(localManifest)],
    ['neuro',directory('neuro',[[THEME_MANIFEST.name,{kind:'file',getFile:async()=>{nestedReads++;return localManifest;}}]])],
    ...['00_ORGANIZADAS_POR_TEMA','00_ORGANIZACAO_360X'].map(name=>[name,directory(name,[['sepse.png',{kind:'file',getFile:async()=>{shortcutReads++;return file();}}]])]),
    ['symbolic.png',{kind:'symlink',getFile:async()=>{throw Error('não seguir');}}]
  ]);
  const collected=await collectDirectory(dir);assert.equal(nestedReads,0);assert.equal(shortcutReads,0);assert.equal(collected.report.ignored.generated,2);assert.equal(collected.report.ignored.unsafePath,1);
  const f=fixture({pickDirectory:async()=>dir});await f.controller.connect();const first=f.published.at(-1).cards[0];
  await f.controller.connectFiles([file('sepse.png',{webkitRelativePath:'IMAGENS/sepse.png'}),manifestFile(manifest(),{webkitRelativePath:'IMAGENS/'+THEME_MANIFEST.name}),file('sepse.png',{webkitRelativePath:'IMAGENS/00_ORGANIZACAO_360X/sepse.png'})]);
  const second=f.published.at(-1).cards[0];assert.equal(second.id,first.id);assert.equal(second.theme,first.theme);assert.equal(f.controller.getState().count,1);assert.equal(f.controller.getState().report.ignored.generated,1);
});

test('invalid, oversized, mismatched MIME, duplicate or unreadable theme files leave safe filename inference available',async()=>{
  const cases=[
    [manifestFile('{'),'invalid'],
    [manifestFile(manifest(),{size:THEME_MANIFEST.maxBytes+1,text(){throw Error('não ler');}}),'oversize'],
    [manifestFile(manifest(),{type:'image/png'}),'mime'],
    [manifestFile(manifest(),{isSymbolicLink:true}),'invalid'],
    [manifestFile(manifest(),{text(){throw Error('sem leitura');}}),'unreadable']
  ];
  for(const [candidate,status] of cases){
    const f=fixture();const outcome=await f.controller.connectFiles([file(),candidate]);
    assert.equal(outcome.connected,true);assert.equal(outcome.report.manifest.status,status);const card=f.published.at(-1).cards[0];
    assert.equal(card.theme,undefined);assert.equal(card.classificationSource,'filename');assert.equal(card.classificationNeedsReview,true);assert.equal(card.clinicalReviewStatus,'pendente');
  }
  const duplicate=await collectFiles([file(),manifestFile(),manifestFile()]);assert.equal(duplicate.report.manifest.status,'invalid');
  const nested=await collectFiles([file('sepse.png',{webkitRelativePath:'IMAGENS/sepse.png'}),manifestFile(manifest(),{webkitRelativePath:'IMAGENS/sub/'+THEME_MANIFEST.name})]);assert.equal(nested.report.manifest.status,'absent');
  const absent=collectFiles([file()]);assert.equal(absent instanceof Promise,false);assert.equal(absent.report.manifest.status,'absent');
});

test('path guard rejects traversal, absolute paths, controls and normalizes relative Unicode',()=>{
  for(const path of ['../foto.png','a/../foto.png','/tmp/a.png','C:\\a.png','a//b.png','x/\u0000.png',''])assert.equal(relativeImagePath(path),null,path);
  assert.equal(relativeImagePath('neuro\\imagem.png'),'neuro/imagem.png');
  assert.equal(relativeImagePath('cafe\u0301.png'),'café.png');
});

test('raster policy excludes SVG, documents, hidden paths, type mismatches, empty and oversized files',()=>{
  assert.equal(imageEligibility(file(),'sepse.png'),'');
  assert.equal(imageEligibility(file('x.JPG',{type:'image/jpeg'}),'x.JPG'),'');
  assert.equal(imageEligibility(file('x.avif',{type:''}),'x.avif'),'');
  for(const [image,path,reason] of [
    [file('x.svg',{type:'image/svg+xml'}),'x.svg','unsupported'],[file('x.pdf',{type:'application/pdf'}),'x.pdf','unsupported'],
    [file(),'.privado/sepse.png','hidden'],[file(), '__MACOSX/sepse.png','hidden'],
    [file('x.png',{type:'image/svg+xml'}),'x.png','mime'],[file('x.png',{size:0}),'x.png','empty'],
    [file('x.png',{size:FOLDER_LIMITS.maxFileBytes+1}),'x.png','oversize']
  ])assert.equal(imageEligibility(image,path),reason);
});

test('fallback traversal preserves relative folders and deduplicates by path, size and modification time',()=>{
  const image=file('card.png',{webkitRelativePath:'IMAGENS/neuro/card.png'});
  const result=collectFiles([image,{...image},file('card.png',{webkitRelativePath:'IMAGENS/renal/card.png'})]);
  assert.equal(result.name,'IMAGENS');assert.equal(result.entries.length,2);assert.equal(result.report.ignored.duplicate,1);
  assert.deepEqual(result.entries.map(x=>x.path),['neuro/card.png','renal/card.png']);
  const id=stableFolderCardId(fileIdentity(result.entries[0].path,image));
  assert.equal(id,stableFolderCardId(fileIdentity('neuro/card.png',{...image})));
  assert.notEqual(id,stableFolderCardId(fileIdentity('neuro/card.png',{...image,lastModified:image.lastModified+1})));
});

test('directory collector skips hidden directories without opening their files and reports unreadable entries',async()=>{
  let reads=0;
  const hidden=directory('.oculto',[['a.png',{kind:'file',getFile:async()=>{reads++;throw Error('não abrir');}}]]);
  const broken={kind:'file',getFile:async()=>{throw Error('sem acesso');}};
  const dir=directory('IMAGENS',[['.oculto',hidden],['a.png',fileHandle(file('a.png'))],['fail.png',broken],['documento.pdf',fileHandle(file('documento.pdf'))]]);
  const result=await collectDirectory(dir);
  assert.equal(reads,0);assert.equal(result.entries.length,1);assert.equal(result.report.ignored.hidden,1);
  assert.equal(result.report.ignored.unreadable,1);assert.equal(result.report.ignored.unsupported,1);
});

test('large folders are bounded and the report admits incomplete enumeration',async()=>{
  const limits={...FOLDER_LIMITS,maxCards:2,maxEntries:4,maxDepth:1};
  const dir=directory('IMAGENS',[...Array.from({length:5},(_,i)=>['x'+i+'.png',fileHandle(file('x'+i+'.png'))])]);
  const result=await collectDirectory(dir,{limits});
  assert.equal(result.entries.length,2);assert.equal(result.report.seen,4);assert.equal(result.report.ignored.limit,2);assert.equal(result.report.truncated,true);
  const nested=directory('a',[['b',directory('b',[['x.png',fileHandle(file())]])]]);
  const deep=await collectDirectory(directory('root',[['a',nested]]),{limits});
  assert.equal(deep.report.ignored.depth,1);assert.equal(deep.report.truncated,true);
});

test('picker opens read-only and publishes object URLs without reading file bytes or serializing File objects',async()=>{
  const image=file();image.arrayBuffer=()=>{throw Error('não ler bytes');};image.text=image.arrayBuffer;
  const handle=directory('IMAGENS',[['sepse.png',fileHandle(image)]]);let pickerOptions;
  const f=fixture({pickDirectory:async options=>{pickerOptions=options;return handle;}});
  const result=await f.controller.connect();
  assert.deepEqual(pickerOptions,{mode:'read'});assert.equal(result.count,1);assert.equal(f.storage.value,handle);
  const card=f.published.at(-1).cards[0];assert.match(card.imageUrl,/^blob:/);assert.equal(card.folderLinked,true);assert.equal(card.origin,'icloud');
  for(const key of ['imageData','file','handle','blob'])assert.equal(Object.hasOwn(card,key),false,key);
  assert.match(f.controller.getState().message,/1 imagem/);assert.equal(f.controller.getState().busy,false);
});

test('refresh uses the active directory and stable identity while replacing/revoking old URLs',async()=>{
  const handle=directory('IMAGENS',[['a.png',fileHandle(file('a.png'))]]),f=fixture({pickDirectory:async()=>handle});
  await f.controller.connect();const previous=f.published.at(-1).cards[0];
  handle.children.push(['b.png',fileHandle(file('b.png'))]);await f.controller.refresh();
  const current=f.published.at(-1);assert.equal(current.cards.length,2);assert.equal(current.cards[0].id,previous.id);
  assert.equal(current.settings.focus,false);assert.deepEqual(f.urlAPI.revoked,[previous.imageUrl]);
});

test('cancelled picker and fatal enumeration failure preserve the previous connection and URLs',async()=>{
  let mode='ok';const good=directory('IMAGENS',[['a.png',fileHandle(file('a.png'))]]);
  const f=fixture({pickDirectory:async()=>{if(mode==='cancel')throw Object.assign(Error('cancel'),{name:'AbortError'});if(mode==='broken')return {name:'falha',async *entries(){throw Error('acesso revogado');}};return good;}});
  await f.controller.connect();const prior=f.published.at(-1).cards;
  mode='cancel';assert.equal((await f.controller.connect()).cancelled,true);assert.equal(f.controller.getState().count,1);
  mode='broken';assert.ok((await f.controller.connect()).error);assert.equal(f.controller.getState().count,1);
  assert.equal(f.published.length,1);assert.equal(f.published[0].cards,prior);assert.equal(f.urlAPI.revoked.length,0);assert.equal(f.storage.value,good);
});

test('a folder without eligible files keeps previous cards and reports rejected types',async()=>{
  const f=fixture();await f.controller.connectFiles([file('a.png',{webkitRelativePath:'IMAGENS/a.png'})]);
  const result=await f.controller.connectFiles([file('documento.pdf',{type:'application/pdf',webkitRelativePath:'IMAGENS/documento.pdf'})]);
  assert.ok(result.error);assert.equal(f.controller.getState().count,1);assert.equal(f.urlAPI.revoked.length,0);
  assert.equal(f.states.at(-1).report.ignored.unsupported,1);
});

test('temporary URLs from a failed new publication are revoked, previous cards remain valid',async()=>{
  let fail=false;const published=[];
  const f=fixture({onCards:cards=>{if(fail)throw Error('ponte recusou');published.push(cards);}});
  await f.controller.connectFiles([file('a.png')]);fail=true;
  assert.ok((await f.controller.connectFiles([file('b.png')])).error);
  assert.equal(f.controller.getState().count,1);assert.equal(f.urlAPI.revoked.length,1);
  assert.notEqual(f.urlAPI.revoked[0],published[0][0].imageUrl);
});

test('restore consults read permission without prompting; explicit reconnect requests it',async()=>{
  const handle=directory('IMAGENS',[['a.png',fileHandle(file('a.png'))]],'prompt'),storage=memoryStore(handle),f=fixture({storage});
  assert.equal((await f.controller.restore()).needsPermission,true);assert.equal(handle.requests.length,0);assert.equal(f.published.length,0);
  assert.equal(f.controller.getState().canReconnect,true);
  await f.controller.reconnect();assert.equal(handle.requests.length,1);assert.deepEqual(handle.requests[0],{mode:'read'});assert.equal(f.controller.getState().count,1);
});

test('restore of a granted remembered directory reconnects without a permission request or forcing filters',async()=>{
  const handle=directory('IMAGENS',[['a.png',fileHandle(file('a.png'))]]),f=fixture({storage:memoryStore(handle)});
  await f.controller.restore();assert.equal(handle.requests.length,0);assert.equal(f.published.at(-1).settings.focus,false);assert.equal(f.controller.getState().count,1);
});

test('unavailable handle persistence does not break the session connection',async()=>{
  const failure=async()=>{throw Object.assign(Error('sem clone'),{name:'DataCloneError'});};
  const f=fixture({storage:{load:failure,save:failure,clear:failure},pickDirectory:async()=>directory('IMAGENS',[['a.png',fileHandle(file('a.png'))]])});
  await f.controller.restore();await f.controller.connect();assert.equal(f.controller.getState().connected,true);assert.match(f.controller.getState().storageWarning,/sessão/);
  await assert.rejects(createHandleStore(undefined).load());
});

test('fallback requests a new folder snapshot for refresh and leaves cancellation harmless',async()=>{
  const f=fixture();assert.equal((await f.controller.connect()).needsFallback,true);
  await f.controller.connectFiles([file('a.png',{webkitRelativePath:'IMAGENS/a.png'})]);
  assert.equal((await f.controller.refresh()).needsFallback,true);assert.equal((await f.controller.connectFiles([])).cancelled,true);
  assert.equal(f.controller.getState().count,1);assert.equal(f.urlAPI.revoked.length,0);
});

test('disconnect clears saved handle and releases URLs; late scans cannot resurrect the folder',async()=>{
  let release;const waiting=new Promise(resolve=>{release=resolve;});
  const handle=directory('IMAGENS',[['late.png',{kind:'file',getFile:async()=>{await waiting;return file('late.png');}}]]);
  const f=fixture({pickDirectory:async()=>handle});const pending=f.controller.connect();await Promise.resolve();
  await f.controller.disconnect();release();assert.equal((await pending).cancelled,true);
  assert.equal(f.controller.getState().count,0);assert.equal(f.storage.value,null);assert.ok(f.published.every(entry=>entry.cards.length===0));
  assert.equal(f.urlAPI.created.length,f.urlAPI.revoked.length);
});

test('disconnect releases each live URL and leaves stable metadata exportable for reconnection',async()=>{
  const f=fixture();await f.controller.connectFiles([file('a.png'),file('b.png')]);
  const card=f.published.at(-1).cards[0],metadata=folderMetadataOnly({...card,notes:'rever',favorite:true,blob:{secret:'fake'},handle:{}});
  assert.equal(metadata.notes,'rever');assert.equal(metadata.favorite,true);assert.equal(metadata.requiresFolderReconnect,true);
  assert.equal(JSON.stringify(metadata).includes('blob:'),false);
  for(const key of ['imageUrl','imageData','blob','file','handle'])assert.equal(Object.hasOwn(metadata,key),false,key);
  await f.controller.disconnect();assert.equal(f.urlAPI.revoked.length,2);assert.equal(f.published.at(-1).cards.length,0);
});

const assetVersion=createHash('sha256').update(fs.readFileSync(new URL('../05_Midia_E_Feed/assets/icloud-folder.mjs',import.meta.url))).digest('hex').slice(0,16);
const moduleAsset='assets/icloud-folder.mjs?v='+assetVersion;
const html=fs.readFileSync(new URL('../05_Midia_E_Feed/index.html',import.meta.url),'utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
function coreFunction(name){const start=inline.indexOf('    function '+name+'(');assert.ok(start>=0,name);const rest=inline.slice(start);const next=rest.slice(1).search(/\n    (?:async )?function /);return next<0?rest:rest.slice(0,next+1);}
function coreFixture(){
  const fieldMatch=inline.match(/const LOCAL_MUTABLE_FIELDS = (\[[\s\S]*?\]);/),writes=[];
  const elements=Object.fromEntries(['search','themeFilter','assetFilter','sortMode','btnReview','editId','editDialog','viewerImg','viewerDialog'].map(id=>[id,{value:id==='assetFilter'?'all':id==='sortMode'?'newest':'',textContent:'',dataset:{},close(){},removeAttribute(){}}]));
  const code=`const LOCAL_MUTABLE_FIELDS=${fieldMatch[1]};let repoCards=[],folderCards=[],localCards=[],hiddenCards=[],activeTheme='',reviewOnly=false,directCardId='',paginationContext='';const $=id=>elements[id];const searchTokens=()=>[];const needsReview=()=>false;const inferTheme=()=> 'uti-geral';const inferTags=()=>['uti-geral'];const resetFocusState=()=>{};const render=()=>{};function store(){return {put(card){writes.push(card);const req={};queueMicrotask(()=>req.onsuccess());return req;}};}\n`+
    ['mergeLocalOverride','isFolderLinkedCard','localRecordForStorage','portableBackupCard','backupCards','putLocal','allCards','getCard','setFolderCards','getFiltered'].map(coreFunction).join('\n')+
    `\n({allCards,putLocal,portableBackupCard,backupCards,getFiltered,setFolderCards,setRepo:x=>repoCards=x,setLocal:x=>localCards=x,filter:x=>elements.assetFilter.value=x})`;
  const core=vm.runInNewContext(code,{elements,writes,queueMicrotask,Date,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},window:{dispatchEvent(){}}});
  return {core,writes,elements};
}

test('actual core merges folder notes while protecting images and hides stale overrides after disconnect',()=>{
  const {core}=coreFixture();core.setRepo([{id:'repo-1',imageUrl:'assets/public.png',favorite:false}]);
  core.setLocal([{id:'repo-1',imageUrl:'blob:bad',favorite:true},{id:'icloud-a',folderLinked:true,imageData:'data:bad',imageUrl:'blob:bad',notes:'rever',favorite:true},{id:'local-1',imageData:'data:image/png;base64,AA=='}]);
  core.setFolderCards([{id:'icloud-a',folderLinked:true,imageUrl:'blob:canonical',title:'a'}]);
  let cards=core.allCards();assert.equal(cards.length,3);assert.equal(cards.find(x=>x.id==='repo-1').imageUrl,'assets/public.png');
  const linked=cards.find(x=>x.id==='icloud-a');assert.equal(linked.imageUrl,'blob:canonical');assert.equal(linked.notes,'rever');assert.equal(linked.origin,'icloud');assert.equal(linked.imageData,undefined);
  core.filter('icloud');assert.equal(core.getFiltered().length,1);
  core.setFolderCards([]);assert.equal(core.allCards().some(x=>x.id==='icloud-a'),false);assert.equal(core.allCards().length,2);
});

test('actual local manual theme overrides manifest without changing assets, private notes or clinical review',()=>{
  const {core}=coreFixture();
  core.setLocal([{id:'icloud-a',folderLinked:true,theme:'neuro-uti',notes:'minha nota',favorite:true,classificationSource:'unsafe',clinicalReviewStatus:'aprovado',imageUrl:'https://example.test'}]);
  core.setFolderCards([{id:'icloud-a',folderLinked:true,imageUrl:'blob:canonical',theme:'sepse-choque',title:'a',classificationSource:'manifest',classificationNeedsReview:true,classificationConfidence:'baixa',clinicalReviewStatus:'pendente'}]);
  const card=core.allCards()[0];assert.equal(card.theme,'neuro-uti');assert.equal(card.notes,'minha nota');assert.equal(card.favorite,true);
  assert.equal(card.classificationSource,'manual');assert.equal(card.classificationNeedsReview,false);assert.equal(card.clinicalReviewStatus,'pendente');assert.equal(card.imageUrl,'blob:canonical');
  const exported=core.portableBackupCard(card);
  assert.equal(exported.notes,'minha nota');
  for(const key of ['classificationSource','classificationConfidence','classificationNeedsReview','manifest','path','matchedTerms','reason'])assert.equal(Object.hasOwn(exported,key),false,key);
});

test('actual card UI identifies local organization and review with escaped, allowlisted classification labels',()=>{
  const render=vm.runInNewContext(`${coreFunction('esc')}\n${coreFunction('cardHTML')}\ncardHTML`,{themeById:()=>({emoji:'🗂️',label:'Tema local'}),connectedHref:()=>'?theme=sepse-choque',isFocusMode:()=>false,formatDate:()=>'',hiddenCards:[],encodeURIComponent});
  const output=render({id:'icloud-a',folderLinked:true,title:'<script>privado</script>',theme:'sepse-choque',classificationSource:'manifest',classificationConfidence:'media',classificationNeedsReview:true,clinicalReviewStatus:'pendente'});
  assert.match(output,/catálogo privado/);assert.match(output,/confiança média/);assert.match(output,/Conferir classificação/);assert.match(output,/Organização temática; revisão clínica pendente/);assert.ok(!output.includes('<script>privado'));
  const untrusted=render({id:'icloud-a',folderLinked:true,classificationSource:'<script>x</script>',classificationConfidence:'<img onerror=x>'});
  assert.ok(!untrusted.includes('<script>'));assert.ok(!untrusted.includes('<img onerror'));assert.match(untrusted,/sugestão pelo nome/);
});

test('actual local theme shortcut filters in place and preserves the connected folder without navigation',async()=>{
  const elements={themeFilter:{value:''},search:{value:'busca anterior'},assetFilter:{value:'icloud'},feed:{contains:()=>true}};
  const calls={renders:0,resets:0,prevented:0,navigation:0};
  class FakeElement{constructor(id){this.dataset={localTheme:id};}closest(){return this;}}
  const start=inline.indexOf('    async function handleFeedAction('),end=inline.indexOf('\n    function handleCardImageError',start);
  const handle=vm.runInNewContext(`let activeTheme='';const themes=[{id:'tdah-neurodiversidade'}];const $=id=>elements[id];const resetFocusState=()=>calls.resets++;const render=()=>calls.renders++;${inline.slice(start,end)}\n({run:handleFeedAction,theme:()=>activeTheme})`,{elements,calls,Element:FakeElement,window:{location:new Proxy({},{set(){calls.navigation++;throw Error('Não navegar');}})}});
  await handle.run({target:new FakeElement('tdah-neurodiversidade'),preventDefault(){calls.prevented++;}});
  assert.equal(handle.theme(),'tdah-neurodiversidade');assert.equal(elements.themeFilter.value,'tdah-neurodiversidade');assert.equal(elements.search.value,'');assert.equal(elements.assetFilter.value,'icloud');
  assert.equal(calls.renders,1);assert.equal(calls.resets,1);assert.equal(calls.prevented,1);assert.equal(calls.navigation,0);
  await handle.run({target:new FakeElement('tema-inválido'),preventDefault(){throw Error('Tema não permitido');}});
  assert.equal(calls.renders,1);
  const render=vm.runInNewContext(`${coreFunction('esc')}\n${coreFunction('cardHTML')}\ncardHTML`,{themeById:()=>({emoji:'🧩',label:'TDAH'}),connectedHref:card=>'./index.html?theme='+encodeURIComponent(card.theme),isFocusMode:()=>false,formatDate:()=>'',hiddenCards:[],encodeURIComponent});
  const output=render({id:'icloud-a',theme:'tdah-neurodiversidade',folderLinked:true});
  assert.match(output,/<button[^>]+data-local-theme="tdah-neurodiversidade"/);assert.ok(!output.includes('href="./index.html?theme='));
});

test('actual putLocal and JSON backup retain only folder metadata, never ephemeral image material',async()=>{
  const {core,writes}=coreFixture();const card={id:'icloud-a',folderLinked:true,imageUrl:'blob:temporary',imageData:'data:image/png;base64,AA==',blob:{},file:{},handle:{},notes:'nota',favorite:true,title:'card'};
  await core.putLocal(card);const saved=writes[0];assert.equal(saved.notes,'nota');assert.equal(saved.favorite,true);assert.equal(saved.requiresFolderReconnect,true);
  for(const key of ['imageUrl','imageData','blob','file','handle'])assert.equal(Object.hasOwn(saved,key),false,key);
  assert.equal(JSON.stringify(core.portableBackupCard(card)).includes('blob:'),false);
  assert.equal(core.portableBackupCard({id:'legacy',imageUrl:'blob:old',notes:'keep'}).imageUrl,undefined);
  core.setLocal([card]);const detached=core.backupCards();assert.equal(detached.length,1);assert.equal(detached[0].notes,'nota');assert.equal(detached[0].requiresFolderReconnect,true);assert.equal(JSON.stringify(detached).includes('blob:'),false);
});

test('actual integration exposes picker fallback and keeps linked images read-only in editor and Forja',()=>{
  for(const marker of ['id="icloudFolderInput"','webkitdirectory directory multiple','id="btnIcloudConnect"','id="btnIcloudRefresh"','id="btnIcloudDisconnect"','value="icloud"','setFolderCards,',moduleAsset])assert.ok(html.includes(marker),marker);
  assert.ok(inline.includes('$("editImageInput").disabled = Boolean(c.folderLinked)'));
  assert.ok(inline.includes('replacement && original.folderLinked'));
  assert.ok(inline.includes('image && !c.folderLinked'));
  assert.ok(inline.includes('cards: backupCards()'));
  const sw=fs.readFileSync(new URL('../05_Midia_E_Feed/sw.js',import.meta.url),'utf8');assert.ok(sw.includes(moduleAsset));assert.ok(sw.includes('`${CACHE_PREFIX}v10`'));
});

test('DOM adapter enables connect and drives the fallback file selection without upload APIs',async()=>{
  const ids=['icloudFolderInput','icloudFolderStatus','btnIcloudConnect','btnIcloudRefresh','btnIcloudDisconnect','btnIcloudReconnect','icloudStorageWarning','icloudFolderReport','icloudFallbackNote','icloudRemember'];
  const elements=Object.fromEntries(ids.map(id=>[id,{listeners:new Map(),value:'',files:[],checked:true,disabled:true,hidden:false,textContent:'',clicks:0,addEventListener(type,listener){this.listeners.set(type,listener);},click(){this.clicks++;},async emit(type){return this.listeners.get(type)?.();}}]));
  const published=[],urlAPI=urls(),events=new Map();
  const controller=attachFolderUI({document:{getElementById:id=>elements[id]},window:{URL:urlAPI,addEventListener:(type,listener)=>events.set(type,listener)},bridge:{setFolderCards:cards=>published.push(cards)}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(elements.btnIcloudConnect.disabled,false);assert.equal(elements.icloudRemember.disabled,true);
  await elements.btnIcloudConnect.emit('click');assert.equal(elements.icloudFolderInput.clicks,1);
  elements.icloudFolderInput.files=[file('a.png',{webkitRelativePath:'IMAGENS/a.png'})];await elements.icloudFolderInput.emit('change');
  assert.equal(published.at(-1).length,1);assert.equal(elements.btnIcloudRefresh.disabled,false);assert.match(elements.icloudFallbackNote.textContent,/novamente/);
  await elements.btnIcloudRefresh.emit('click');assert.equal(elements.icloudFolderInput.clicks,2);
  await elements.btnIcloudDisconnect.emit('click');assert.equal(published.at(-1).length,0);assert.equal(controller.getState().count,0);
});
