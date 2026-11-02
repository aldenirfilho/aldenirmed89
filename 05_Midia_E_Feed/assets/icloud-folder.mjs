/** Conexão de leitura local. Nenhum arquivo é enviado ou convertido em base64. */
export const FOLDER_LIMITS = Object.freeze({maxCards:10000,maxEntries:50000,maxDepth:32,maxFileBytes:64*1024*1024});
export const RASTER_TYPES = Object.freeze({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',bmp:'image/bmp',avif:'image/avif'});
export const THEME_MANIFEST = Object.freeze({name:'cardfeed-temas-360x.json',schema:'cardfeed-icloud-themes-v1',maxBytes:5*1024*1024,maxEntries:10000});
export const LOCAL_THEME_IDS = Object.freeze(['uti-geral','temi','vm-sdra','sepse-choque','nefro-aki-trs','endocrino-diabetes','neuro-uti','cardio-hemodinamica','infectologia','farmaco-doses','pocus','familia-paciente','ia-produtividade','reumato-imuno','pneumologia','gastro-hepato-nutricao','hematologia-trombose','dermato-feridas','tdah-neurodiversidade','identidade-360x','fe-espiritualidade','vida-organizacao','pdd-acervo','a-classificar']);
const themeIds=new Set(LOCAL_THEME_IDS);
const generatedFolders=new Set(['00_ORGANIZADAS_POR_TEMA','00_ORGANIZACAO_360X']);
const hiddenPart = part => part.startsWith('.') || part === '__MACOSX';
export function relativeImagePath(path) {
  const text=String(path||'').replace(/\\/g,'/').normalize('NFC');
  if(/^[a-z]:\//i.test(text))return null;
  const parts=text.split('/');
  if(!parts.length || parts.some(part=>!part || part==='.' || part==='..' || /[\u0000-\u001f]/.test(part)))return null;
  return parts.join('/');
}
export function imageEligibility(file,path,limits=FOLDER_LIMITS) {
  const normalized=relativeImagePath(path);
  if(!normalized)return 'unsafePath';
  if(normalized.split('/').some(hiddenPart))return 'hidden';
  if(normalized.split('/').slice(0,-1).some(part=>generatedFolders.has(part)))return 'generated';
  if(file.isSymbolicLink===true||file.kind==='symlink')return 'unsafePath';
  const ext=normalized.split('.').pop().toLowerCase();
  if(!Object.hasOwn(RASTER_TYPES,ext))return 'unsupported';
  const type=String(file.type||'').toLowerCase();
  if(type && type!==RASTER_TYPES[ext] && !(ext==='bmp'&&type==='image/x-ms-bmp'))return 'mime';
  if(!Number.isFinite(file.size)||file.size<=0)return 'empty';
  if(file.size>limits.maxFileBytes)return 'oversize';
  return '';
}
export function fileIdentity(path,file) {
  return `${String(path).normalize('NFC')}\u0000${file.size}\u0000${Number(file.lastModified)||0}`;
}
export function stableFolderCardId(identity) {
  // Identidade de versão: o mesmo caminho relativo, tamanho e mtime conserva as notas.
  let value=14695981039346656037n;
  for(const char of String(identity)){value^=BigInt(char.codePointAt(0));value=BigInt.asUintN(64,value*1099511628211n);}
  return 'icloud-'+value.toString(16).padStart(16,'0');
}
function newReport(limits) {
  return {seen:0,accepted:0,bytes:0,truncated:false,limits:{...limits},ignored:{hidden:0,generated:0,unsupported:0,mime:0,empty:0,oversize:0,duplicate:0,unreadable:0,depth:0,limit:0,unsafePath:0},manifest:{status:'absent',entries:0,matched:0,fingerprintMismatch:0,unmatched:0}};
}

// Somente o JSON privado de temas é lido. Pixels, OCR e nomes não saem do dispositivo.
function containsURL(value) {
  if(typeof value==='string')return /(?:\b(?:https?|ftps?|file|data|blob|javascript|mailto|tel|sms|smb|ssh|about):|[a-z][a-z0-9+.-]*:\/\/|(?:^|\s)(?:www\.|\/\/))/i.test(value);
  if(Array.isArray(value))return value.some(containsURL);
  return value&&typeof value==='object'&&Object.entries(value).some(([key,item])=>containsURL(key)||containsURL(item));
}
function plainRecord(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
function safeText(value,max){return typeof value==='string'&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value);}
export function parseThemeManifest(text) {
  if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>THEME_MANIFEST.maxBytes)throw new Error('oversize');
  const value=JSON.parse(text);
  const topFields=new Set(['schema','sourceName','entries']);
  if(!plainRecord(value)||Object.keys(value).some(key=>!topFields.has(key))||value.schema!==THEME_MANIFEST.schema||value.sourceName!=='IMAGENS'||!Array.isArray(value.entries)||value.entries.length>THEME_MANIFEST.maxEntries)throw new Error('invalid');
  const fields=new Set(['path','size','modifiedMs','theme','themeLabel','confidence','method','matchedTerms','secondaryThemes','needsReview','reason']);
  const byPath=new Map();
  for(const entry of value.entries){
    if(!plainRecord(entry)||Object.keys(entry).some(key=>!fields.has(key)))throw new Error('invalid');
    const path=relativeImagePath(entry.path);
    // O caminho é uma identidade local, nunca um href. Nomes reais podem conter
    // domínios ou palavras de protocolos; apenas esquemas no início são recusados.
    if(!path||typeof entry.path!=='string'||/^[a-z][a-z0-9+.-]*:/i.test(path)||path!==entry.path.normalize('NFC')||path.split('/').some(hiddenPart)||path.split('/').some(part=>generatedFolders.has(part))||!Object.hasOwn(RASTER_TYPES,path.split('.').pop().toLowerCase())||byPath.has(path))throw new Error('invalid');
    if(containsURL(Object.fromEntries(Object.entries(entry).filter(([key])=>key!=='path'))))throw new Error('invalid');
    if(!Number.isSafeInteger(entry.size)||entry.size<=0||!Number.isSafeInteger(entry.modifiedMs)||entry.modifiedMs<0||!themeIds.has(entry.theme)||!['alta','media','baixa'].includes(entry.confidence)||typeof entry.needsReview!=='boolean')throw new Error('invalid');
    if(!safeText(entry.themeLabel,120)||!safeText(entry.method,120)||!safeText(entry.reason,500)||!Array.isArray(entry.matchedTerms)||entry.matchedTerms.length>100||!entry.matchedTerms.every(term=>safeText(term,120))||!Array.isArray(entry.secondaryThemes)||entry.secondaryThemes.length>LOCAL_THEME_IDS.length||!entry.secondaryThemes.every(theme=>themeIds.has(theme)))throw new Error('invalid');
    // O resto do documento não é transferido aos cards, às notas ou ao backup.
    byPath.set(path,{size:entry.size,modifiedMs:entry.modifiedMs,theme:entry.theme,confidence:entry.confidence,needsReview:entry.needsReview||entry.confidence==='baixa'||entry.theme==='a-classificar'});
  }
  return byPath;
}
async function applyThemeManifest(collected,manifestFile,duplicate=false){
  const report=collected.report.manifest;
  if(duplicate){report.status='invalid';return collected;}
  if(!manifestFile)return collected;
  if(manifestFile.name!==THEME_MANIFEST.name||manifestFile.isSymbolicLink===true||manifestFile.kind==='symlink'){report.status='invalid';return collected;}
  if(!Number.isSafeInteger(manifestFile.size)||manifestFile.size<=0||manifestFile.size>THEME_MANIFEST.maxBytes){report.status='oversize';return collected;}
  if(!['','application/json','text/json','text/plain'].includes(String(manifestFile.type||'').toLowerCase())){report.status='mime';return collected;}
  let raw;
  try{raw=await manifestFile.text();}catch{report.status='unreadable';return collected;}
  let byPath;
  try{byPath=parseThemeManifest(raw);}catch(error){report.status=error?.message==='oversize'?'oversize':'invalid';return collected;}
  report.status='applied';report.entries=byPath.size;
  for(const entry of collected.entries){
    const match=byPath.get(entry.path);
    if(!match){report.unmatched++;continue;}
    if(match.size!==entry.file.size||match.modifiedMs!==entry.file.lastModified){report.fingerprintMismatch++;continue;}
    entry.classification={theme:match.theme,classificationSource:'manifest',classificationConfidence:match.confidence,classificationNeedsReview:match.needsReview};
    report.matched++;
  }
  return collected;
}
function collectEntry(entries,seen,report,file,path,limits) {
  const reason=imageEligibility(file,path,limits);
  if(reason){report.ignored[reason]++;return;}
  const relativePath=relativeImagePath(path);
  const identity=fileIdentity(relativePath,file);
  if(seen.has(identity)){report.ignored.duplicate++;return;}
  seen.add(identity);
  if(entries.length>=limits.maxCards){report.ignored.limit++;report.truncated=true;return;}
  entries.push({file,path:relativePath,identity});
  report.accepted++;report.bytes+=file.size;
}
export async function collectDirectory(handle,{limits=FOLDER_LIMITS}={}) {
  const entries=[],seen=new Set(),report=newReport(limits);
  let manifestFile,manifestFound=false,duplicateManifest=false;
  async function walk(directory,prefix='',depth=0) {
    for await(const [name,child] of directory.entries()){
      if(report.seen>=limits.maxEntries){report.truncated=true;return;}
      report.seen++;
      const path=prefix?`${prefix}/${name}`:name;
      if(!relativeImagePath(path)){report.ignored.unsafePath++;continue;}
      if(String(name).split('/').some(hiddenPart)){report.ignored.hidden++;continue;}
      if(child.isSymbolicLink===true||child.kind==='symlink'){report.ignored.unsafePath++;continue;}
      if(child.kind==='directory'){
        if(generatedFolders.has(name)){report.ignored.generated++;continue;}
        if(depth>=limits.maxDepth){report.ignored.depth++;report.truncated=true;continue;}
        await walk(child,path,depth+1);
      }else if(child.kind==='file'){
        if(!prefix&&name===THEME_MANIFEST.name){
          duplicateManifest=manifestFound;manifestFound=true;
          try{manifestFile=await child.getFile();}catch{report.manifest.status='unreadable';}
          continue;
        }
        if(!Object.hasOwn(RASTER_TYPES,String(name).split('.').pop().toLowerCase())){report.ignored.unsupported++;continue;}
        try{collectEntry(entries,seen,report,await child.getFile(),path,limits);}
        catch{report.ignored.unreadable++;}
      }else report.ignored.unsupported++;
    }
  }
  await walk(handle);
  entries.sort((a,b)=>a.path.localeCompare(b.path));
  return applyThemeManifest({entries,report,name:String(handle.name||'Pasta selecionada')},manifestFile,duplicateManifest);
}
// Preserva a API síncrona sem manifesto; com JSON na raiz retorna uma Promise.
export function collectFiles(files,{limits=FOLDER_LIMITS}={}) {
  const entries=[],seen=new Set(),report=newReport(limits);
  const list=Array.from(files||[]);
  const rootNames=new Set(list.map(file=>String(file.webkitRelativePath||'').split('/')[0]).filter(Boolean));
  const rootName=rootNames.size===1?[...rootNames][0]:'';
  let manifestFile,duplicateManifest=false;
  for(const file of list){
    if(report.seen>=limits.maxEntries){report.truncated=true;break;}
    report.seen++;
    let path=String(file.webkitRelativePath||file.name||'');
    if(rootName&&path.startsWith(rootName+'/'))path=path.slice(rootName.length+1);
    if(path===THEME_MANIFEST.name){duplicateManifest=Boolean(manifestFile);manifestFile=file;continue;}
    if(path.split('/').length>limits.maxDepth+1){report.ignored.depth++;report.truncated=true;continue;}
    collectEntry(entries,seen,report,file,path,limits);
  }
  entries.sort((a,b)=>a.path.localeCompare(b.path));
  const collected={entries,report,name:rootName||'Pasta selecionada'};
  return manifestFile?applyThemeManifest(collected,manifestFile,duplicateManifest):collected;
}
export function folderMetadataOnly(card) {
  const fields=['id','title','theme','tags','explanation','notes','source','status','favorite','nextReview','updatedAt'];
  const result=Object.fromEntries(fields.filter(key=>Object.hasOwn(card,key)).map(key=>[key,card[key]]));
  return {...result,folderLinked:true,requiresFolderReconnect:true};
}
export function createHandleStore(idb=globalThis.indexedDB) {
  let opening;
  function open(){
    if(!idb)return Promise.reject(new Error('Armazenamento indisponível.'));
    if(!opening)opening=new Promise((resolve,reject)=>{
      const request=idb.open('CardFeedICloudLink_v1',1);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('handles'))request.result.createObjectStore('handles');};
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Armazenamento ocupado.'));
    });
    return opening;
  }
  async function transaction(mode,operation){
    const database=await open();
    return new Promise((resolve,reject)=>{
      const tx=database.transaction('handles',mode),store=tx.objectStore('handles');
      let result;
      try{const request=operation(store);request.onsuccess=()=>{result=request.result;};request.onerror=()=>reject(request.error);}
      catch(error){reject(error);return;}
      tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Operação interrompida.'));
    });
  }
  return {load:()=>transaction('readonly',store=>store.get('selected')),save:handle=>transaction('readwrite',store=>store.put(handle,'selected')),clear:()=>transaction('readwrite',store=>store.delete('selected'))};
}
export function createFolderController({pickDirectory,urlAPI=globalThis.URL,storage=createHandleStore(),onCards=()=>{},onState=()=>{},limits=FOLDER_LIMITS}={}) {
  let current={cards:[],urls:[],handle:null,name:'',mode:''},savedHandle=null,generation=0,busy=false,storageWarning='',lastMessage='',displayedReport,storageQueue=Promise.resolve();
  function snapshot(message=lastMessage,report=displayedReport??current.report){return {connected:current.cards.length>0,count:current.cards.length,name:current.name,mode:current.mode,canReconnect:Boolean(savedHandle),busy,message,report,storageWarning};}
  function emit(message,report=current.report){lastMessage=message;displayedReport=report;const state=snapshot(message,report);onState(state);return state;}
  function revoke(urls){for(const url of urls)try{urlAPI.revokeObjectURL(url);}catch{/* Liberação best effort. */}}
  async function remember(handle,wanted,token){
    if(!storage)return;
    storageQueue=storageQueue.catch(()=>{}).then(async()=>{
      if(token!==generation)return;
      const permitted=wanted&&handle&&typeof handle.queryPermission==='function'&&await handle.queryPermission({mode:'read'})==='granted';
      if(token!==generation)return;
      if(permitted)await storage.save(handle);else await storage.clear();
      if(token===generation){savedHandle=permitted?handle:null;storageWarning='';}
    });
    try{await storageQueue;}
    catch{if(token===generation)storageWarning=wanted?'A pasta funciona nesta sessão, mas o navegador não conseguiu lembrar a conexão.':'O navegador não confirmou a atualização da pasta lembrada. Revise a permissão de arquivos nas configurações do navegador.';}
  }
  async function commit(collected,{handle=null,mode,rememberHandle=true,focus=true,token}){
    handle=handle||collected.handle||null;
    const urls=[];
    try{
      if(!collected.entries.length){const error=new Error('Nenhuma imagem compatível e legível foi encontrada');error.report=collected.report;throw error;}
      const cards=collected.entries.map(({file,path,identity,classification})=>{
        const imageUrl=urlAPI.createObjectURL(file);urls.push(imageUrl);
        return {id:stableFolderCardId(collected.name+'/'+identity),title:String(file.name||path.split('/').pop()).replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim()||'Imagem local',imageName:file.name,imageType:file.type||RASTER_TYPES[path.split('.').pop().toLowerCase()],imageSize:file.size,imageUrl,folderLinked:true,origin:'icloud',clinicalReviewStatus:'pendente',source:'Pasta local do iCloud · imagem não publicada',status:'novo',tags:['iCloud'],classificationSource:'filename',classificationNeedsReview:true,...classification,createdAt:new Date(Number(file.lastModified)||0).toISOString(),updatedAt:new Date(Number(file.lastModified)||0).toISOString()};
      });
      if(token!==generation){revoke(urls);return {cancelled:true};}
      // Publicar é síncrono: a referência anterior só é liberada depois de aceita pela ponte.
      onCards(cards,{focus});
      const previous=current;
      current={cards,urls,handle,name:collected.name,mode,report:collected.report,rememberHandle};
      revoke(previous.urls);
      await remember(handle,rememberHandle,token);
      if(token!==generation)return {cancelled:true};
      emit(`${cards.length} imagem(ns) de ${collected.name} conectadas somente neste navegador.`,collected.report);
      return {connected:true,count:cards.length,report:collected.report};
    }catch(error){revoke(urls);throw error;}
  }
  async function run(loader,options){
    const token=++generation;busy=true;emit('Lendo a lista de arquivos da pasta…');
    try{const collected=await loader();return await commit(collected,{...options,token});}
    catch(error){
      if(token!==generation)return {cancelled:true};
      if(error?.name==='AbortError'){emit('Seleção cancelada. A conexão anterior foi mantida.');return {cancelled:true};}
      emit(`Não foi possível conectar: ${error?.message||'acesso indisponível'}. A conexão anterior foi mantida.`,error?.report||current.report);
      return {error};
    }finally{if(token===generation){busy=false;emit(lastMessage,displayedReport);}}
  }
  return {
    getState:()=>snapshot(),
    async connect({rememberHandle=true}={}){
      if(!pickDirectory)return {needsFallback:true};
      return run(async()=>{const handle=await pickDirectory({mode:'read'});const collected=await collectDirectory(handle,{limits});collected.handle=handle;return collected;},{mode:'directory',rememberHandle,focus:true});
    },
    async connectHandle(handle,{rememberHandle=true,request=false,focus=true}={}){
      const token=generation;
      let permission=typeof handle?.queryPermission==='function'?await handle.queryPermission({mode:'read'}):'prompt';
      if(token!==generation)return {cancelled:true};
      if(permission!=='granted'&&request&&typeof handle?.requestPermission==='function')permission=await handle.requestPermission({mode:'read'});
      if(token!==generation)return {cancelled:true};
      if(permission!=='granted'){savedHandle=handle;emit('Pasta lembrada. Toque em Reconectar para autorizar a leitura; nenhuma permissão foi solicitada automaticamente.');return {needsPermission:true};}
      return run(()=>collectDirectory(handle,{limits}),{handle,mode:'directory',rememberHandle,focus});
    },
    connectFiles(files){if(!files?.length){emit('Seleção cancelada. A conexão anterior foi mantida.');return Promise.resolve({cancelled:true});}return run(()=>collectFiles(files,{limits}),{mode:'files',rememberHandle:false,focus:true});},
    async reconnect({rememberHandle=true}={}){if(savedHandle)return this.connectHandle(savedHandle,{request:true,rememberHandle});return this.connect({rememberHandle});},
    async refresh(){if(current.handle)return this.connectHandle(current.handle,{request:true,focus:false,rememberHandle:current.rememberHandle});return {needsFallback:true};},
    async restore(){
      if(!storage)return {unavailable:true};
      const token=generation;
      try{const restored=await storage.load();if(token!==generation)return {cancelled:true};savedHandle=restored;if(!savedHandle)return {empty:true};return await this.connectHandle(savedHandle,{rememberHandle:true,request:false,focus:false});}
      catch{if(token!==generation)return {cancelled:true};storageWarning='Não foi possível restaurar a pasta; conecte-a novamente.';emit(storageWarning);return {unavailable:true};}
    },
    async disconnect(){
      const token=++generation;busy=false;onCards([],{focus:false});revoke(current.urls);current={cards:[],urls:[],handle:null,name:'',mode:''};savedHandle=null;
      await remember(null,false,token);
      if(token!==generation)return {cancelled:true};
      emit('Pasta desconectada. Os originais e suas anotações locais foram mantidos.');return {disconnected:true};
    },
    dispose(){generation++;revoke(current.urls);current={cards:[],urls:[],handle:null,name:'',mode:''};}
  };
}

export function attachFolderUI({document,window,bridge}) {
  const el=id=>document.getElementById(id),input=el('icloudFolderInput');
  if(!input||!bridge?.setFolderCards)return null;
  let controller;
  function stateChanged(state){
    el('icloudFolderStatus').textContent=state.message||`${state.count} imagem(ns) locais conectadas.`;
    el('btnIcloudConnect').disabled=state.busy;
    el('btnIcloudRefresh').disabled=state.busy||!state.connected;
    el('btnIcloudDisconnect').disabled=!state.connected&&!state.canReconnect;
    el('btnIcloudReconnect').hidden=!state.canReconnect;
    el('btnIcloudReconnect').disabled=state.busy;
    el('icloudStorageWarning').textContent=state.storageWarning||'';
    const report=state.report;
    if(report){
      const ignored=Object.entries(report.ignored).filter(([,count])=>count).map(([reason,count])=>`${({hidden:'ocultos',generated:'pastas de organização ignoradas',unsupported:'formatos não aceitos',mime:'tipo incompatível',empty:'vazios',oversize:'acima de 64 MB',duplicate:'repetidos',unreadable:'sem leitura',depth:'subpastas profundas',limit:'acima do limite',unsafePath:'caminhos inválidos'})[reason]}: ${count}`).join(' · ');
      const manifest=report.manifest;
      const classification=manifest?.status==='applied'?` Temas locais: ${manifest.matched} correspondências; ${manifest.fingerprintMismatch} versões divergentes ignoradas; ${manifest.unmatched} sem entrada, com sugestão pelo nome.`:manifest?.status&&manifest.status!=='absent'?' Catálogo de temas ignorado por formato, limite ou acesso inválido; sugestões pelo nome precisam de conferência.':' Sem catálogo local de temas; sugestões pelo nome precisam de conferência.';
      el('icloudFolderReport').textContent=`${report.accepted} imagens aceitas de ${report.seen} entradas examinadas. ${ignored||'Nenhuma entrada ignorada.'}${report.truncated?' Limite atingido; a listagem pode estar incompleta.':''}${classification}`;
    }else el('icloudFolderReport').textContent='Limites: 10.000 imagens, 50.000 entradas examinadas, 32 níveis de subpastas e 64 MB por imagem. SVG e documentos não entram no feed.';
    el('icloudFallbackNote').textContent=state.mode==='files'||typeof window.showDirectoryPicker!=='function'?'Neste navegador, Atualizar pede a seleção da pasta novamente. A seleção não fica lembrada após fechar ou recarregar a página.':'';
  }
  controller=createFolderController({pickDirectory:typeof window.showDirectoryPicker==='function'?options=>window.showDirectoryPicker(options):null,urlAPI:window.URL,storage:createHandleStore(window.indexedDB),onCards:(cards,options)=>bridge.setFolderCards(cards,options),onState:stateChanged});
  const fallback=()=>{input.value='';input.click();};
  const after=result=>{if(result?.needsFallback)fallback();};
  const fail=error=>{el('icloudFolderStatus').textContent='Não foi possível concluir a leitura. A conexão anterior foi mantida.';bridge.toast?.('A pasta não foi alterada. Tente conectar novamente.');};
  el('btnIcloudConnect').addEventListener('click',()=>controller.connect({rememberHandle:el('icloudRemember').checked}).then(after).catch(fail));
  el('btnIcloudReconnect').addEventListener('click',()=>controller.reconnect({rememberHandle:el('icloudRemember').checked}).then(after).catch(fail));
  el('btnIcloudRefresh').addEventListener('click',()=>controller.refresh().then(after).catch(fail));
  el('btnIcloudDisconnect').addEventListener('click',()=>controller.disconnect().catch(fail));
  input.addEventListener('change',()=>controller.connectFiles(input.files).catch(fail));
  input.addEventListener('cancel',()=>{el('icloudFolderStatus').textContent='Seleção cancelada. A conexão anterior foi mantida.';});
  if(typeof window.showDirectoryPicker!=='function'){
    el('icloudRemember').checked=false;el('icloudRemember').disabled=true;
    el('icloudFallbackNote').textContent='Este navegador usa o seletor de pasta. Será necessário selecioná-la novamente após recarregar.';
  }
  window.addEventListener('pagehide',event=>{if(!event.persisted)controller.dispose();});
  stateChanged(controller.getState());
  // Não se solicita permissão no carregamento. Um handle só volta se já tiver leitura concedida.
  controller.restore().catch(fail);
  return controller;
}

if(typeof window!=='undefined'&&typeof document!=='undefined'){
  let started=false;
  const start=()=>{if(started)return;started=true;attachFolderUI({document,window,bridge:window.CardFeedBridge});};
  if(window.CardFeedBridge?.ready)start();
  else window.addEventListener('cardfeed:ready',start,{once:true});
}
