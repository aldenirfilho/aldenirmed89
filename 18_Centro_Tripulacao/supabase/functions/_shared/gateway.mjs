/* Server only. No request bodies, identities, headers or secrets are logged. */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORIES=new Set(['agradecimento','sugestao','contribuicao','informacao','notificacao','reclamacao','outra']);
class GateError extends Error{constructor(status){super('Gateway request rejected');this.status=status;}}
function object(value,allowed){
  if(!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).some(key=>!allowed.includes(key)))throw new GateError(400);
}
function text(value,min,max){
  if(typeof value!=='string' || value.includes('\0'))throw new GateError(400);
  const clean=value.trim(), length=Array.from(clean).length;
  if(length<min || length>max)throw new GateError(400);
  return clean;
}
function key(env,mapName,legacy){
  if(env[mapName]){try{const map=JSON.parse(env[mapName]);if(typeof map.default==='string' && map.default)return map.default;}catch(_){throw new GateError(503);}}
  return env[legacy]||'';
}
function configuration(env){
  const url=env.SUPABASE_URL||'';
  const publicKey=key(env,'SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
  const secretKey=key(env,'SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
  const salt=env.CREW_RATE_LIMIT_SALT||'';
  const origins=(env.CREW_ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !publicKey || !secretKey || salt.length<32 || !origins.length)throw new GateError(503);
  if(origins.some(value=>{try{const u=new URL(value);return u.origin!==value || (u.protocol!=='https:' && !(u.protocol==='http:' && ['localhost','127.0.0.1'].includes(u.hostname)));}catch(_){return true;}}))throw new GateError(503);
  return {url,publicKey,secretKey,salt,origins};
}
async function boundedJson(request){
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new GateError(415);
  const max=24000, advertised=request.headers.get('content-length');
  if(advertised && (!/^\d+$/.test(advertised) || Number(advertised)>max))throw new GateError(413);
  if(!request.body)throw new GateError(400);
  const reader=request.body.getReader(),parts=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();throw new GateError(413);}parts.push(value);}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of parts){bytes.set(chunk,offset);offset+=chunk.length;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch(_){throw new GateError(400);}
}
async function hmac(salt,value){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(salt),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
function identifiedPayload(payload){
  object(payload,['p_category','p_other_category','p_subject','p_body','p_identity_mode','p_consent_to_process','p_consent_to_contact','p_anonymous_access_token']);
  if(payload.p_identity_mode==='anonymous')throw new GateError(503);
  if(payload.p_identity_mode!=='identified' || !CATEGORIES.has(payload.p_category) || payload.p_consent_to_process!==true || typeof payload.p_consent_to_contact!=='boolean' || payload.p_anonymous_access_token!==null)throw new GateError(400);
  return {
    p_category:payload.p_category,
    p_other_category:payload.p_category==='outra'?text(payload.p_other_category,2,80):null,
    p_subject:text(payload.p_subject,4,140),p_body:text(payload.p_body,10,5000),
    p_identity_mode:'identified',p_consent_to_process:true,p_consent_to_contact:payload.p_consent_to_contact,
    p_anonymous_access_token:null
  };
}
export function createGateway(kind,{env,fetcher=fetch,now=()=>new Date()}={}){
  if(!['manifestations','analytics'].includes(kind))throw Error('Unknown gateway');
  return async(request)=>{
    let origin='';
    const reply=(status,body)=>new Response(status===204?null:JSON.stringify(body),{status,headers:{
      ...(origin?{'Access-Control-Allow-Origin':origin}:{}),
      'Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS',
      'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info',
      'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
      ...(status===429?{'Retry-After':'3600'}:{})}});
    try{
      const config=configuration(env||{}), requestedOrigin=request.headers.get('origin');
      if(!requestedOrigin || !config.origins.includes(requestedOrigin))throw new GateError(403);
      origin=requestedOrigin;
      if(request.method==='OPTIONS')return reply(204,null);
      if(request.method!=='POST')throw new GateError(405);
      const authorization=request.headers.get('authorization')||'';
      if(!/^Bearer [^\s]{20,8192}$/.test(authorization))throw new GateError(401);
      const input=await boundedJson(request);
      let payload;
      if(kind==='manifestations'){
        object(input,['action','payload']);
        if(['anonymous-thread','anonymous-reply'].includes(input.action))throw new GateError(503);
        if(input.action!=='submit')throw new GateError(400);
        payload=identifiedPayload(input.payload);
      }else{
        object(input,['sectionSlug','pageSessionId']);
        if(input.sectionSlug!=='centro-tripulacao' || typeof input.pageSessionId!=='string' || !/^[a-f0-9]{32}$/.test(input.pageSessionId))throw new GateError(400);
        payload={p_section_slug:input.sectionSlug,p_session_id:input.pageSessionId};
      }
      // Auth validates the bearer against the project's current user; decoding JWT is not authentication.
      const auth=await fetcher(config.url+'/auth/v1/user',{headers:{apikey:config.publicKey,Authorization:authorization},signal:AbortSignal.timeout(10000),redirect:'error'});
      if(!auth.ok)throw new GateError(auth.status>=500?503:401);
      const user=await auth.json();
      if(!user || !UUID.test(user.id) || user.is_anonymous===true || typeof user.email!=='string' || user.email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) || !Number.isFinite(Date.parse(user.email_confirmed_at || user.confirmed_at || '')))throw new GateError(401);
      const serviceHeaders={apikey:config.secretKey,'Content-Type':'application/json'};
      if(!config.secretKey.startsWith('sb_secret_'))serviceHeaders.Authorization='Bearer '+config.secretKey;
      async function rpc(name,body){
        const response=await fetcher(config.url+'/rest/v1/rpc/'+name,{method:'POST',headers:serviceHeaders,body:JSON.stringify(body),signal:AbortSignal.timeout(10000),redirect:'error'});
        if(!response.ok)throw new GateError(503);
        return response.json();
      }
      const subject=await hmac(config.salt,`${kind}:${now().toISOString().slice(0,10)}:${user.id}`);
      const allowed=await rpc('crew_consume_gateway_quota',{p_scope:kind,p_subject_hash:subject});
      if(typeof allowed!=='boolean')throw new GateError(503);
      if(!allowed)throw new GateError(429);
      if(kind==='analytics'){
        const recorded=await rpc('record_section_view',payload);
        if(typeof recorded!=='boolean')throw new GateError(503);
        return reply(200,{recorded});
      }
      const result=await rpc('submit_manifestation',{
        ...payload,p_verified_user_id:user.id,p_verified_email:payload.p_consent_to_contact?user.email:null
      });
      const row=Array.isArray(result)?result[0]:result;
      if(!row || !/^AG-\d{4}-[A-F0-9]{16}$/.test(row.protocol) || !UUID.test(row.manifestation_id))throw new GateError(503);
      return reply(200,{protocol:row.protocol,manifestation_id:row.manifestation_id});
    }catch(error){
      const status=error instanceof GateError?error.status:503;
      return reply(status,{error:status===401?'Entre em uma conta com e-mail confirmado.':status===429?'Limite de tentativas atingido. Aguarde a próxima janela.':status===503?'Serviço indisponível ou modalidade ainda não habilitada.':'Solicitação não aceita.'});
    }
  };
}
