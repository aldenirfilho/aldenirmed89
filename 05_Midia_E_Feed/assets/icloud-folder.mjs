/** Conexão de leitura local. Nenhum arquivo é enviado ou convertido em base64. */
export const FOLDER_LIMITS = Object.freeze({maxCards:10000,maxEntries:50000,maxDepth:32,maxFileBytes:64*1024*1024});
export const RASTER_TYPES = Object.freeze({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',bmp:'image/bmp',avif:'image/avif'});
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
  return {seen:0,accepted:0,bytes:0,truncated:false,limits:{...limits},ignored:{hidden:0,unsupported:0,mime:0,empty:0,oversize:0,duplicate:0,unreadable:0,depth:0,limit:0,unsafePath:0}};
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
  async function walk(directory,prefix='',depth=0) {
    for await(const [name,child] of directory.entries()){
      if(report.seen>=limits.maxEntries){report.truncated=true;return;}
      report.seen++;
      const path=prefix?`${prefix}/${name}`:name;
      if(!relativeImagePath(path)){report.ignored.unsafePath++;continue;}
      if(String(name).split('/').some(hiddenPart)){report.ignored.hidden++;continue;}
      if(child.kind==='directory'){
        if(depth>=limits.maxDepth){report.ignored.depth++;report.truncated=true;continue;}
        await walk(child,path,depth+1);
      }else if(child.kind==='file'){
        if(!Object.hasOwn(RASTER_TYPES,String(name).split('.').pop().toLowerCase())){report.ignored.unsupported++;continue;}
        try{collectEntry(entries,seen,report,await child.getFile(),path,limits);}
        catch{report.ignored.unreadable++;}
      }else report.ignored.unsupported++;
    }
  }
  await walk(handle);
  entries.sort((a,b)=>a.path.localeCompare(b.path));
  return {entries,report,name:String(handle.name||'Pasta selecionada')};
}
export function collectFiles(files,{limits=FOLDER_LIMITS}={}) {
  const entries=[],seen=new Set(),report=newReport(limits);
  const list=Array.from(files||[]);
  const rootNames=new Set(list.map(file=>String(file.webkitRelativePath||'').split('/')[0]).filter(Boolean));
  const rootName=rootNames.size===1?[...rootNames][0]:'';
  for(const file of list){
    if(report.seen>=limits.maxEntries){report.truncated=true;break;}
    report.seen++;
    let path=String(file.webkitRelativePath||file.name||'');
    if(rootName&&path.startsWith(rootName+'/'))path=path.slice(rootName.length+1);
    if(path.split('/').length>limits.maxDepth+1){report.ignored.depth++;report.truncated=true;continue;}
    collectEntry(entries,seen,report,file,path,limits);
  }
  entries.sort((a,b)=>a.path.localeCompare(b.path));
  return {entries,report,name:rootName||'Pasta selecionada'};
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
      const cards=collected.entries.map(({file,path,identity})=>{
        const imageUrl=urlAPI.createObjectURL(file);urls.push(imageUrl);
        return {id:stableFolderCardId(collected.name+'/'+identity),title:String(file.name||path.split('/').pop()).replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim()||'Imagem local',imageName:file.name,imageType:file.type||RASTER_TYPES[path.split('.').pop().toLowerCase()],imageSize:file.size,imageUrl,folderLinked:true,origin:'icloud',clinicalReviewStatus:'pendente',source:'Pasta local do iCloud · imagem não publicada',status:'novo',tags:['iCloud'],createdAt:new Date(Number(file.lastModified)||0).toISOString(),updatedAt:new Date(Number(file.lastModified)||0).toISOString()};
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
      const ignored=Object.entries(report.ignored).filter(([,count])=>count).map(([reason,count])=>`${({hidden:'ocultos',unsupported:'formatos não aceitos',mime:'tipo incompatível',empty:'vazios',oversize:'acima de 64 MB',duplicate:'repetidos',unreadable:'sem leitura',depth:'subpastas profundas',limit:'acima do limite',unsafePath:'caminhos inválidos'})[reason]}: ${count}`).join(' · ');
      el('icloudFolderReport').textContent=`${report.accepted} imagens aceitas de ${report.seen} entradas examinadas. ${ignored||'Nenhuma entrada ignorada.'}${report.truncated?' Limite atingido; a listagem pode estar incompleta.':''}`;
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
