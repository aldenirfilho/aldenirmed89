/** Acervo privado por referência. Nunca envia documentos nem extrai texto. */
export const DOCUMENT_LIMITS=Object.freeze({maxDocuments:10000,maxEntries:50000,maxDepth:32,maxFileBytes:256*1024*1024,maxObjectURLs:8});
export const DOCUMENT_TYPES=Object.freeze({pdf:{format:'pdf',label:'PDF',mime:['application/pdf']},doc:{format:'word',label:'DOC',mime:['application/msword']},docx:{format:'word',label:'DOCX',mime:['application/vnd.openxmlformats-officedocument.wordprocessingml.document']},odt:{format:'word',label:'ODT',mime:['application/vnd.oasis.opendocument.text']},rtf:{format:'word',label:'RTF',mime:['application/rtf','text/rtf']},txt:{format:'text',label:'TXT',mime:['text/plain']},md:{format:'markdown',label:'MD',mime:['text/markdown','text/x-markdown','text/plain']},markdown:{format:'markdown',label:'Markdown',mime:['text/markdown','text/x-markdown','text/plain']},csv:{format:'csv',label:'CSV',mime:['text/csv','application/csv','text/plain']},pages:{format:'word',label:'Pages',mime:['application/vnd.apple.pages','application/x-iwork-pages-sffpages','application/zip']}});
export const LOCAL_DOCUMENT_THEMES=Object.freeze([{"id":"uti-geral","label":"UTI Geral","emoji":"🏥"},{"id":"sepse-choque","label":"Sepse / Choque","emoji":"🩸"},{"id":"vm-sdra","label":"Ventilação Mecânica / SDRA","emoji":"🫁"},{"id":"nefro-aki-trs","label":"Nefro / AKI / TRS","emoji":"🧪"},{"id":"infectologia","label":"Infectologia / Antimicrobianos","emoji":"🦠"},{"id":"neuro-uti","label":"Neuro UTI","emoji":"🧠"},{"id":"cardio-hemodinamica","label":"Cardio / Hemodinâmica","emoji":"❤️"},{"id":"endocrino-metabolico","label":"Endócrino / Metabólico","emoji":"🍬"},{"id":"disturbios-eletroliticos","label":"Distúrbios Hidroeletrolíticos / Ácido-base","emoji":"⚡"},{"id":"gastro-hepatologia","label":"Gastro / Hepatologia","emoji":"🩺"},{"id":"reumatologia","label":"Reumatologia","emoji":"🦋"},{"id":"hematologia","label":"Hematologia","emoji":"💉"},{"id":"emergencias-clinicas","label":"Emergências Clínicas","emoji":"🚨"},{"id":"farmaco-doses","label":"Farmacologia / Doses / Diluições","emoji":"💊"},{"id":"morte-cerebral-doacao","label":"Morte Cerebral / Doação","emoji":"🕊️"},{"id":"sedacao-analgesia","label":"Sedação / Analgesia / Delirium","emoji":"😴"},{"id":"psiquiatria","label":"Psiquiatria na UTI","emoji":"🧘"},{"id":"procedimentos-dispositivos","label":"Procedimentos / Dispositivos / Cateteres","emoji":"🧰"},{"id":"pocus-usg","label":"POCUS / USG Beira-leito","emoji":"🔊"},{"id":"temi-prova","label":"TEMI / Prova / Questões","emoji":"🏆"},{"id":"clinica-medica","label":"Clínica Médica / Enfermaria","emoji":"🏥"},{"id":"gestao-ia-produtividade","label":"IA / Obsidian / Produtividade Médica","emoji":"⚙️"},{"id":"familia-paciente","label":"Família / Paciente / Educação em Saúde","emoji":"👨‍👩‍👧"},{"id":"artigos-cientificos","label":"Artigos Científicos","emoji":"🔬"},{"id":"protocolos-institucionais","label":"Protocolos Institucionais","emoji":"📋"},{"id":"pneumologia","label":"Pneumologia","emoji":"🫁"},{"id":"dermatologia","label":"Dermatologia / Feridas","emoji":"🩹"},{"id":"tdah-neurodiversidade","label":"TDAH / Neurodiversidade","emoji":"🧩"},{"id":"juridico","label":"Jurídico / Documentação legal","emoji":"⚖️"},{"id":"financas-patrimonio","label":"Finanças / Patrimônio","emoji":"💰"},{"id":"academico-projetos","label":"Acadêmico / Projetos","emoji":"🎓"},{"id":"fe-historia-cultura","label":"Fé / História / Cultura","emoji":"🙏"},{"id":"inbox-revisar","label":"A revisar / Classificação pendente","emoji":"🔎"}].map(theme=>Object.freeze(theme)));
export const DOCUMENT_THEME_MANIFEST=Object.freeze({name:'biblioteca-temas-360x.json',schema:'library-local-themes-v1',maxBytes:5*1024*1024,maxEntries:10000});
const localThemeIds=new Set(LOCAL_DOCUMENT_THEMES.map(theme=>theme.id));
const generatedFolders=new Set(['00_ORGANIZADOS_POR_TEMA','00_ORGANIZACAO_360X']);
const SOURCES=Object.freeze({pdf:{label:'PDF',names:['PDF']},doc:{label:'DOC',names:['DOC','DOC 2026','DOC2026']}});
const hidden=part=>part.startsWith('.')||part==='__MACOSX';
export function documentPath(value){
  if(typeof value!=='string')return null;
  const path=value.normalize('NFC');
  if(!path||path.includes('\\')||/^[a-z][a-z0-9+.-]*:/i.test(path))return null;
  const parts=path.split('/');
  return parts.some(part=>!part||part==='.'||part==='..'||/[\u0000-\u001f\u007f]/.test(part))?null:path;
}
function sourceConfig(slot){if(!Object.hasOwn(SOURCES,slot))throw Error('Fonte local inválida.');return SOURCES[slot];}
function validateSource(slot,name){const config=sourceConfig(slot);if(!config.names.includes(String(name).normalize('NFC').trim().replace(/\s+/g,' ').toUpperCase()))throw Error(`Selecione diretamente a pasta ${config.label}${slot==='doc'?' ou DOC 2026':''}, dentro de 360X.`);}
export function documentEligibility(file,path,limits=DOCUMENT_LIMITS){
  const normalized=documentPath(path);if(!normalized)return 'unsafePath';
  if(normalized.split('/').some(hidden))return 'hidden';
  if(normalized.split('/').slice(0,-1).some(part=>generatedFolders.has(part)))return 'generated';
  if(file.isSymbolicLink===true||file.kind==='symlink')return 'unsafePath';
  const extension=normalized.split('.').pop().toLowerCase(),type=DOCUMENT_TYPES[extension];
  if(!type)return 'unsupported';
  const mime=String(file.type||'').toLowerCase();
  if(mime&&!['application/octet-stream',...type.mime].includes(mime))return 'mime';
  if(!Number.isSafeInteger(file.size)||file.size<=0)return 'empty';
  if(file.size>limits.maxFileBytes)return 'oversize';
  if(!Number.isSafeInteger(file.lastModified)||file.lastModified<0)return 'unsafePath';
  return '';
}
export function documentIdentity(slot,path,file){return `${slot}\u0000${documentPath(path)}\u0000${file.size}\u0000${file.lastModified}`;}
export function stableDocumentId(identity){let hash=14695981039346656037n;for(const char of identity){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}return 'library-local-'+hash.toString(16).padStart(16,'0');}
function report(){return {seen:0,accepted:0,bytes:0,truncated:false,incomplete:false,manifest:{status:'absent',entries:0,matched:0,fingerprintMismatch:0,unmatched:0},ignored:{unsafePath:0,hidden:0,generated:0,unsupported:0,mime:0,empty:0,oversize:0,duplicate:0,unreadable:0,depth:0,limit:0}};}
function plainRecord(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
function safeText(value,max){return typeof value==='string'&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value);}
function containsURL(value){if(typeof value==='string')return /(?:\b(?:https?|ftps?|file|data|blob|javascript|mailto|tel|sms|smb|ssh|about):|[a-z][a-z0-9+.-]*:\/\/|(?:^|\s)(?:www\.|\/\/))/i.test(value);if(Array.isArray(value))return value.some(containsURL);return value&&typeof value==='object'&&Object.entries(value).some(([key,item])=>containsURL(key)||containsURL(item));}
export function parseDocumentThemeManifest(text,sourceName){
  if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>DOCUMENT_THEME_MANIFEST.maxBytes)throw Error('oversize');
  const value=JSON.parse(text),topFields=new Set(['schema','sourceName','entries']);
  if(!plainRecord(value)||Object.keys(value).some(key=>!topFields.has(key))||value.schema!==DOCUMENT_THEME_MANIFEST.schema||!safeText(value.sourceName,120)||!value.sourceName||value.sourceName!==sourceName||!Array.isArray(value.entries)||value.entries.length>DOCUMENT_THEME_MANIFEST.maxEntries)throw Error('invalid');
  const fields=new Set(['path','size','modifiedMs','theme','themeLabel','confidence','method','matchedTerms','secondaryThemes','needsReview','reason']),byPath=new Map();
  for(const entry of value.entries){
    if(!plainRecord(entry)||Object.keys(entry).some(key=>!fields.has(key)))throw Error('invalid');
    const path=documentPath(entry.path);
    if(!path||path!==entry.path.normalize('NFC')||path.split('/').some(hidden)||path.split('/').some(part=>generatedFolders.has(part))||!Object.hasOwn(DOCUMENT_TYPES,path.split('.').pop().toLowerCase())||byPath.has(path))throw Error('invalid');
    if(containsURL(Object.fromEntries(Object.entries(entry).filter(([key])=>key!=='path'))))throw Error('invalid');
    if(!Number.isSafeInteger(entry.size)||entry.size<=0||!Number.isSafeInteger(entry.modifiedMs)||entry.modifiedMs<0||!localThemeIds.has(entry.theme)||!['alta','media','baixa'].includes(entry.confidence)||typeof entry.needsReview!=='boolean')throw Error('invalid');
    if(!safeText(entry.themeLabel,120)||!safeText(entry.method,120)||!safeText(entry.reason,500)||!Array.isArray(entry.matchedTerms)||entry.matchedTerms.length>100||!entry.matchedTerms.every(term=>safeText(term,120))||!Array.isArray(entry.secondaryThemes)||entry.secondaryThemes.length>LOCAL_DOCUMENT_THEMES.length||!entry.secondaryThemes.every(id=>localThemeIds.has(id)))throw Error('invalid');
    // Apenas tema e rótulos genéricos atravessam para a sessão. OCR bruto,
    // justificativa, método e campos de documento não são copiados.
    byPath.set(path,{size:entry.size,modifiedMs:entry.modifiedMs,theme:entry.theme,classificationSource:'manifest',classificationConfidence:entry.confidence,classificationNeedsReview:entry.needsReview||entry.confidence==='baixa'||entry.theme==='inbox-revisar',classificationTerms:[...new Set(entry.matchedTerms.map(term=>term.normalize('NFC').trim()).filter(Boolean))],classificationSecondaryThemes:[...new Set(entry.secondaryThemes.filter(id=>id!==entry.theme))]});
  }
  return byPath;
}
async function applyDocumentManifest(collected,manifestFile,duplicate=false){
  const report=collected.report.manifest;if(duplicate){report.status='invalid';return collected;}if(!manifestFile)return collected;
  if(manifestFile.name!==DOCUMENT_THEME_MANIFEST.name||manifestFile.isSymbolicLink===true||manifestFile.kind==='symlink'){report.status='invalid';return collected;}
  if(!Number.isSafeInteger(manifestFile.size)||manifestFile.size<=0||manifestFile.size>DOCUMENT_THEME_MANIFEST.maxBytes){report.status='oversize';return collected;}
  if(!['','application/json','text/json','text/plain'].includes(String(manifestFile.type||'').toLowerCase())){report.status='mime';return collected;}
  let raw;try{raw=await manifestFile.text();}catch{report.status='unreadable';return collected;}
  let byPath;try{byPath=parseDocumentThemeManifest(raw,collected.name);}catch(error){report.status=error?.message==='oversize'?'oversize':'invalid';return collected;}
  report.status='applied';report.entries=byPath.size;
  for(const entry of collected.entries){const match=byPath.get(entry.path);if(!match){report.unmatched++;continue;}if(match.size!==entry.file.size||match.modifiedMs!==entry.file.lastModified){report.fingerprintMismatch++;continue;}const {size,modifiedMs,...classification}=match;entry.classification=classification;report.matched++;}
  return collected;
}
function add(entries,seen,result,file,path,slot,limits,handle=null){const reason=documentEligibility(file,path,limits);if(reason){result.ignored[reason]++;return;}const normalized=documentPath(path),identity=documentIdentity(slot,normalized,file);if(seen.has(identity)){result.ignored.duplicate++;return;}seen.add(identity);if(entries.length>=limits.maxDocuments){result.ignored.limit++;result.truncated=true;return;}entries.push({file,path:normalized,identity,id:stableDocumentId(identity),handle});result.accepted++;result.bytes+=file.size;}
export async function collectDocumentDirectory(handle,{slot,limits=DOCUMENT_LIMITS,shouldCancel=()=>false,onProgress=()=>{}}={}){
  validateSource(slot,handle?.name);const entries=[],seen=new Set(),result=report();let manifestFile,manifestFound=false,duplicateManifest=false;
  const check=()=>{if(shouldCancel())throw Object.assign(Error('Leitura interrompida.'),{name:'AbortError'});};
  async function walk(directory,prefix='',depth=0){for await(const [name,child] of directory.entries()){
    check();if(result.seen&&result.seen%100===0){onProgress({...result});await new Promise(resolve=>setTimeout(resolve,0));check();}
    if(result.seen>=limits.maxEntries){result.truncated=true;return;}result.seen++;
    const path=prefix?`${prefix}/${name}`:name;
    if(!documentPath(path)||child.isSymbolicLink===true||child.kind==='symlink'){result.ignored.unsafePath++;continue;}
    if(String(name).split('/').some(hidden)){result.ignored.hidden++;continue;}
    if(child.kind==='directory'){if(generatedFolders.has(name)){result.ignored.generated++;continue;}if(/\.pages$/i.test(String(name))){result.ignored.unsupported++;continue;}if(depth>=limits.maxDepth){result.ignored.depth++;result.truncated=true;continue;}try{await walk(child,path,depth+1);}catch(error){if(error?.name==='AbortError')throw error;result.ignored.unreadable++;result.incomplete=true;}}
    else if(child.kind==='file'){
      if(!prefix&&name===DOCUMENT_THEME_MANIFEST.name){duplicateManifest=manifestFound;manifestFound=true;try{manifestFile=await child.getFile();}catch{result.manifest.status='unreadable';}continue;}
      if(!Object.hasOwn(DOCUMENT_TYPES,String(name).split('.').pop().toLowerCase())){result.ignored.unsupported++;continue;}
      try{check();const file=await child.getFile();check();add(entries,seen,result,file,path,slot,limits,child);}catch(error){if(error?.name==='AbortError')throw error;result.ignored.unreadable++;result.incomplete=true;}
    }else result.ignored.unsupported++;
  }}
  await walk(handle);check();onProgress({...result});entries.sort((a,b)=>a.path.localeCompare(b.path));return applyDocumentManifest({slot,name:handle.name,entries,report:result},manifestFile,duplicateManifest);
}
export function collectDocumentFiles(files,{slot,limits=DOCUMENT_LIMITS}={}){
  sourceConfig(slot);const list=Array.from(files||[]),roots=new Set(list.map(file=>String(file.webkitRelativePath||'').split('/')[0]).filter(Boolean));
  if(roots.size!==1)throw Error('Selecione uma pasta inteira no seletor de pastas.');const name=[...roots][0];validateSource(slot,name);
  const entries=[],seen=new Set(),result=report();let manifestFile,duplicateManifest=false;
  for(const file of list){if(result.seen>=limits.maxEntries){result.truncated=true;break;}result.seen++;const raw=String(file.webkitRelativePath||'');if(!raw.startsWith(name+'/')){result.ignored.unsafePath++;continue;}const path=raw.slice(name.length+1);if(path===DOCUMENT_THEME_MANIFEST.name){duplicateManifest=Boolean(manifestFile);manifestFile=file;continue;}if(path.split('/').length>limits.maxDepth+1){result.ignored.depth++;result.truncated=true;continue;}add(entries,seen,result,file,path,slot,limits);}
  entries.sort((a,b)=>a.path.localeCompare(b.path));const collected={slot,name,entries,report:result};return manifestFile?applyDocumentManifest(collected,manifestFile,duplicateManifest):collected;
}
export function documentMetadataOnly(item){return Object.fromEntries(['id','title','filename','extension','sizeBytes','modifiedMs','theme','tags','localSource','folderLinked','clinicalReviewStatus'].filter(key=>Object.hasOwn(item,key)).map(key=>[key,item[key]]));}
export function createDocumentHandleStore(idb=globalThis.indexedDB){
  let opening;function open(){if(!idb)return Promise.reject(Error('Armazenamento indisponível.'));if(!opening)opening=new Promise((resolve,reject)=>{const request=idb.open('LibraryLocalFolders_v1',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('handles'))request.result.createObjectStore('handles');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Armazenamento ocupado.'));});return opening;}
  async function run(mode,operation){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('handles',mode);let value;try{const request=operation(tx.objectStore('handles'));request.onsuccess=()=>{value=request.result;};request.onerror=()=>reject(request.error);}catch(error){reject(error);return;}tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Armazenamento interrompido.'));});}
  return {load:()=>run('readonly',store=>store.get('selected')),save:value=>run('readwrite',store=>store.put(value,'selected')),clear:()=>run('readwrite',store=>store.delete('selected'))};
}
export function createDocumentController({pickDirectory,urlAPI=globalThis.URL,storage=createDocumentHandleStore(),onItems=()=>{},onState=()=>{},inferTheme=()=>'',limits=DOCUMENT_LIMITS}={}){
  const current=new Map(),saved=new Map(),versions=new Map([['pdf',0],['doc',0]]),busy=new Set(),objectURLs=new Map();let storageQueue=Promise.resolve(),storageWarning='',disposed=false,rememberEnabled=true;
  function items(){return [...current.values()].flatMap(source=>source.items);}
  function state(){return {count:items().length,busy:busy.size>0,storageWarning,sources:Object.fromEntries(Object.keys(SOURCES).map(slot=>[slot,{connected:current.has(slot),count:current.get(slot)?.items.length||0,canReconnect:saved.has(slot),busy:busy.has(slot),report:current.get(slot)?.report}]))};}
  function emit(message){const value={...state(),message};onState(value);return value;}
  function revoke(id){const found=objectURLs.get(id);if(found){try{urlAPI.revokeObjectURL(found.url);}catch{}objectURLs.delete(id);}}
  function revokeSource(slot){for(const [id,value] of objectURLs)if(value.slot===slot)revoke(id);}
  async function persist(){if(!storage)return;storageQueue=storageQueue.catch(()=>{}).then(async()=>{const value=Object.fromEntries(saved);if(Object.keys(value).length)await storage.save(value);else await storage.clear();});try{await storageQueue;storageWarning='';}catch{storageWarning='O navegador não confirmou a atualização das conexões lembradas. Revise a permissão de arquivos nas configurações do navegador.';}}
  async function run(slot,loader,{remember=true}={}){
    sourceConfig(slot);const token=(versions.get(slot)||0)+1;versions.set(slot,token);busy.add(slot);emit(`Listando ${SOURCES[slot].label} local…`);
    try{
      const collected=await loader({shouldCancel:()=>disposed||versions.get(slot)!==token,onProgress:progress=>{if(!disposed&&versions.get(slot)===token)emit(`${SOURCES[slot].label}: ${progress.seen} entradas examinadas · ${progress.accepted} documentos aceitos…`);}});if(disposed||versions.get(slot)!==token)return {cancelled:true};
      if(!collected.entries.length){const error=Error('Nenhum documento compatível foi encontrado. A conexão anterior foi mantida.');error.report=collected.report;throw error;}
      const docs=collected.entries.map(entry=>{const extension=entry.path.split('.').pop().toLowerCase(),type=DOCUMENT_TYPES[extension];return {id:entry.id,title:entry.file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim()||'Documento local',filename:entry.file.name,extension,sizeBytes:entry.file.size,modifiedMs:entry.file.lastModified,relativePath:entry.path,tipo:type.format,formato:type.format,formatoLabel:type.label,theme:inferTheme(entry.path,slot)||'inbox-revisar',classificationSource:'filename',classificationNeedsReview:true,classificationTerms:[],classificationSecondaryThemes:[],...entry.classification,tags:[],origem:'icloud-local',origemLabel:`iCloud local · ${SOURCES[slot].label}`,folderLinked:true,localSource:slot,clinicalReviewStatus:'pendente',resumo:'Documento privado por referência. Busca por nome e pasta; conteúdo integral não indexado.'};});
      const permitted=remember&&rememberEnabled&&collected.handle&&typeof collected.handle.queryPermission==='function'&&await collected.handle.queryPermission({mode:'read'})==='granted';
      if(versions.get(slot)!==token||disposed)return {cancelled:true};
      const previous=current.get(slot);current.set(slot,{...collected,items:docs,handle:collected.handle||null});
      try{onItems(items(),{focus:true});}catch(error){if(previous)current.set(slot,previous);else current.delete(slot);throw error;}
      revokeSource(slot);
      if(permitted&&rememberEnabled)saved.set(slot,collected.handle);else saved.delete(slot);
      // A listagem termina neste commit síncrono. Persistir o handle não prolonga
      // a janela em que Cancelar promete preservar a conexão anterior.
      busy.delete(slot);const message=`${docs.length} documento(s) de ${SOURCES[slot].label} conectados somente neste navegador.${collected.report.incomplete?' Listagem parcial: houve entradas sem acesso.':''}${collected.report.truncated?' Limite atingido; há documentos fora desta listagem.':''}`;emit(message);
      await persist();if(versions.get(slot)!==token||disposed)return {cancelled:true};emit(message);return {connected:true,count:docs.length,report:collected.report};
    }catch(error){if(versions.get(slot)!==token||disposed)return {cancelled:true};if(error?.name==='AbortError'){emit('Seleção cancelada. A conexão anterior foi mantida.');return {cancelled:true};}emit(`Não foi possível conectar: ${error?.message||'acesso indisponível'}.`);return {error};}
    finally{if(versions.get(slot)===token){busy.delete(slot);emit('');}}
  }
  return {
    getState:state,getItems:items,
    async connect(slot,{remember=true}={}){sourceConfig(slot);if(!pickDirectory)return {needsFallback:true,slot};return run(slot,async scan=>{const handle=await pickDirectory({mode:'read',id:'library-local-'+slot});const result=await collectDocumentDirectory(handle,{slot,limits,...scan});return {...result,handle};},{remember});},
    async connectHandle(slot,handle,{request=false,remember=true}={}){sourceConfig(slot);const token=versions.get(slot);let permission=typeof handle?.queryPermission==='function'?await handle.queryPermission({mode:'read'}):'prompt';if(disposed||versions.get(slot)!==token)return {cancelled:true};if(permission!=='granted'&&request&&typeof handle?.requestPermission==='function')permission=await handle.requestPermission({mode:'read'});if(disposed||versions.get(slot)!==token)return {cancelled:true};if(permission!=='granted'){if(remember&&rememberEnabled)saved.set(slot,handle);emit('Pasta lembrada. Toque em Reconectar para autorizar a leitura.');return {needsPermission:true};}return run(slot,async scan=>({...await collectDocumentDirectory(handle,{slot,limits,...scan}),handle}),{remember});},
    connectFiles(slot,files){sourceConfig(slot);if(!files?.length){emit('Seleção cancelada. A conexão anterior foi mantida.');return Promise.resolve({cancelled:true});}return run(slot,()=>collectDocumentFiles(files,{slot,limits}),{remember:false});},
    async reconnect(slot,options={}){const handle=saved.get(slot)||current.get(slot)?.handle;return handle?this.connectHandle(slot,handle,{...options,request:true}):this.connect(slot,options);},
    async refresh(slot){const handle=current.get(slot)?.handle;if(!handle)return {needsFallback:true,slot};return this.connectHandle(slot,handle,{request:true,remember:saved.has(slot)});},
    async restore(){if(!storage)return {unavailable:true};const tokens=new Map(versions);try{const value=await storage.load();if(disposed)return {cancelled:true};for(const slot of Object.keys(SOURCES)){const handle=value?.[slot];if(handle&&rememberEnabled&&tokens.get(slot)===versions.get(slot)){if(typeof handle.queryPermission==='function')await handle.queryPermission({mode:'read'});if(rememberEnabled&&tokens.get(slot)===versions.get(slot))saved.set(slot,handle);}}emit(saved.size?'Pasta(s) lembrada(s). Toque em Reconectar para listar os documentos; nenhum arquivo foi aberto.':'');return {remembered:saved.size};}catch{storageWarning='Não foi possível restaurar a conexão lembrada. Selecione a pasta novamente.';emit('');return {unavailable:true};}},
    async open(id,{pin=false}={}){let source,entry;for(const value of current.values()){entry=value.entries.find(item=>item.id===id);if(entry){source=value;break;}}if(!entry)throw Error('Reconecte a pasta para abrir este documento.');const file=entry.handle?await entry.handle.getFile():entry.file;if(documentEligibility(file,entry.path,limits)||documentIdentity(source.slot,entry.path,file)!==entry.identity)throw Error('O arquivo mudou ou ficou indisponível. Atualize a pasta antes de abrir.');if(disposed||!current.get(source.slot)?.entries.some(item=>item.id===id))throw Error('A pasta foi desconectada.');if(objectURLs.has(id)){const old=objectURLs.get(id);objectURLs.delete(id);objectURLs.set(id,{...old,pin:pin||old.pin});return {url:old.url,item:source.items.find(item=>item.id===id)};}while(objectURLs.size>=limits.maxObjectURLs){const candidate=[...objectURLs].find(([,value])=>!value.pin);if(!candidate)throw Error('Feche a prévia anterior antes de abrir outro documento.');revoke(candidate[0]);}const url=urlAPI.createObjectURL(file);objectURLs.set(id,{url,slot:source.slot,pin});return {url,item:source.items.find(item=>item.id===id)};},
    release:revoke,
    cancel(slot){sourceConfig(slot);if(!busy.has(slot))return {cancelled:false};versions.set(slot,(versions.get(slot)||0)+1);busy.delete(slot);emit('Listagem interrompida. A conexão anterior foi mantida; você pode continuar buscando.');return {cancelled:true};},
    async setRemember(wanted){rememberEnabled=Boolean(wanted);if(!rememberEnabled){saved.clear();emit('Conexões lembradas removidas; os documentos abertos continuam nesta sessão.');await persist();emit('Conexões lembradas removidas; os documentos abertos continuam nesta sessão.');}return {remembered:saved.size};},
    async disconnect(slot){sourceConfig(slot);versions.set(slot,(versions.get(slot)||0)+1);busy.delete(slot);revokeSource(slot);current.delete(slot);saved.delete(slot);onItems(items(),{focus:false});await persist();emit('Pasta desconectada. Os documentos originais foram mantidos.');return {disconnected:true};},
    dispose(){disposed=true;for(const slot of Object.keys(SOURCES))versions.set(slot,(versions.get(slot)||0)+1);for(const id of objectURLs.keys())revoke(id);current.clear();}
  };
}

export function attachLocalDocumentUI({document,window,bridge}){
  const el=id=>document.getElementById(id);if(!el('libraryLocalControls')||!bridge?.setItems)return null;
  bridge.setThemes?.(LOCAL_DOCUMENT_THEMES);
  const preview=el('libraryLocalPreview'),frame=el('libraryLocalFrame');let previewId='',lastStatus='',previewVersion=0;
  const close=()=>{previewVersion++;frame.removeAttribute('src');if(previewId)controller.release(previewId);previewId='';if(preview.open)preview.close();};
  function changed(state){el('libraryLocalCancel').hidden=!state.busy;el('libraryLocalCancel').disabled=!state.busy;if(state.message)lastStatus=state.message;el('libraryLocalStatus').textContent=lastStatus||'Selecione PDF ou DOC para conectar o acervo privado.';el('libraryLocalCount').textContent=String(state.count);el('libraryLocalWarning').textContent=state.storageWarning||'';for(const slot of Object.keys(SOURCES)){const value=state.sources[slot];el('libraryConnect-'+slot).disabled=value.busy;el('libraryReconnect-'+slot).hidden=!value.canReconnect;el('libraryReconnect-'+slot).disabled=value.busy;el('libraryRefresh-'+slot).disabled=value.busy||!value.connected;el('libraryDisconnect-'+slot).disabled=!value.connected&&!value.canReconnect;el('librarySourceCount-'+slot).textContent=String(value.count);}const reports=Object.entries(state.sources).filter(([,source])=>source.report).map(([slot,{report}])=>`${SOURCES[slot].label}: ${report.accepted} aceitos de ${report.seen} entradas; ${Object.values(report.ignored).reduce((a,b)=>a+b,0)} ignoradas (${report.ignored.oversize} acima de 256 MB, ${report.ignored.unreadable} sem leitura, ${report.ignored.unsupported} formatos não aceitos)${report.truncated?' · limite atingido':''}${report.incomplete?' · listagem parcial por falta de acesso':''}. ${report.manifest.status==='applied'?`Temas: ${report.manifest.matched} correspondências; ${report.manifest.fingerprintMismatch} versões divergentes ignoradas; ${report.manifest.unmatched} sem entrada.`:report.manifest.status==='absent'?'Sem catálogo privado; temas sugeridos por nome/pasta.':'Catálogo privado ignorado por formato, acesso ou limite; temas sugeridos por nome/pasta.'}`);el('libraryLocalReport').textContent=reports.join(' ')||'Até 10.000 documentos por pasta, 50.000 entradas, 32 níveis e 256 MB por arquivo. PDF, DOC, DOCX, ODT, RTF, TXT, MD, CSV e Pages (arquivo); arquivos ocultos e atalhos simbólicos são ignorados.';}
  const controller=createDocumentController({pickDirectory:typeof window.showDirectoryPicker==='function'?options=>window.showDirectoryPicker(options):null,urlAPI:window.URL,storage:createDocumentHandleStore(window.indexedDB),inferTheme:bridge.inferTheme,onItems:(items,options)=>{if(previewId)close();bridge.setItems(items,options);},onState:changed});
  const fallback=slot=>{const input=el('libraryFolderInput-'+slot);input.value='';input.click();};
  const after=result=>{if(result?.needsFallback)fallback(result.slot);};
  el('libraryLocalCancel').addEventListener('click',()=>{for(const [slot,value] of Object.entries(controller.getState().sources))if(value.busy)controller.cancel(slot);});
  el('libraryLocalRemember').addEventListener('change',()=>controller.setRemember(el('libraryLocalRemember').checked).catch(()=>{el('libraryLocalWarning').textContent='Não foi possível confirmar a atualização das conexões lembradas.';}));
  const failure=()=>{lastStatus='Não foi possível abrir o documento. Disponibilize-o no iCloud e atualize a pasta.';el('libraryLocalStatus').textContent=lastStatus;};
  for(const slot of Object.keys(SOURCES)){
    el('libraryConnect-'+slot).addEventListener('click',()=>controller.connect(slot,{remember:el('libraryLocalRemember').checked}).then(after).catch(failure));
    el('libraryReconnect-'+slot).addEventListener('click',()=>controller.reconnect(slot,{remember:el('libraryLocalRemember').checked}).then(after).catch(failure));
    el('libraryRefresh-'+slot).addEventListener('click',()=>controller.refresh(slot).then(after).catch(failure));
    el('libraryDisconnect-'+slot).addEventListener('click',()=>controller.disconnect(slot).catch(failure));
    el('libraryFolderInput-'+slot).addEventListener('change',()=>controller.connectFiles(slot,el('libraryFolderInput-'+slot).files).catch(failure));
    el('libraryFolderInput-'+slot).addEventListener('cancel',()=>{el('libraryLocalStatus').textContent='Seleção cancelada. A conexão anterior foi mantida.';});
  }
  el('grid-arquivos').addEventListener('click',async event=>{const target=event.target?.closest?.('[data-local-document-action]');if(!target||!el('grid-arquivos').contains(target))return;event.preventDefault();event.stopPropagation();const id=target.dataset.localDocumentId,item=controller.getItems().find(item=>item.id===id);if(!item)return;try{if(target.dataset.localDocumentAction==='preview'&&item.extension==='pdf'){close();const token=previewVersion,opened=await controller.open(id,{pin:true});if(token!==previewVersion){if(previewId!==id)controller.release(id);return;}previewId=id;el('libraryLocalPreviewTitle').textContent=item.title;frame.title='PDF privado: '+item.title;frame.src=opened.url;preview.showModal();el('libraryLocalPreviewClose').focus();}else{const opened=await controller.open(id),link=document.createElement('a');link.href=opened.url;link.download=item.filename;link.rel='noopener';document.body.append(link);link.click();link.remove();}}catch{failure();}});
  el('libraryLocalPreviewClose').addEventListener('click',close);preview.addEventListener('cancel',event=>{event.preventDefault();close();});preview.addEventListener('close',()=>{frame.removeAttribute('src');if(previewId)controller.release(previewId);previewId='';});
  if(typeof window.showDirectoryPicker!=='function'){el('libraryLocalRemember').checked=false;el('libraryLocalRemember').disabled=true;el('libraryLocalFallback').textContent='Neste navegador, selecione a pasta novamente para atualizar ou após recarregar. Não há upload.';}
  window.addEventListener('pagehide',event=>{if(!event.persisted){close();controller.dispose();}});changed(controller.getState());controller.restore().catch(failure);return controller;
}
if(typeof window!=='undefined'&&typeof document!=='undefined'){let started=false;const start=()=>{if(started)return;started=true;attachLocalDocumentUI({document,window,bridge:window.LibraryLocalBridge});};if(window.LibraryLocalBridge?.ready)start();else window.addEventListener('library:local-ready',start,{once:true});}
