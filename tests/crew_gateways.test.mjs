import assert from 'node:assert/strict';
import {createGateway} from '../18_Centro_Tripulacao/supabase/functions/_shared/gateway.mjs';
const UID='12345678-1234-4123-8123-123456789abc';
const origin='https://aldenirfilho.github.io';
const env={SUPABASE_URL:'https://exampleproject.supabase.co',SUPABASE_ANON_KEY:'public-key-for-tests',SUPABASE_SERVICE_ROLE_KEY:'private-service-key-for-tests',CREW_ALLOWED_ORIGINS:origin,CREW_RATE_LIMIT_SALT:'test-only-secret-salt-0123456789abcdef'};
const token='not-a-real-jwt-validated-by-test-auth-server';
const payload={p_category:'sugestao',p_other_category:null,p_subject:'Teste educacional',p_body:'Uma sugestão de navegação para a biblioteca.',p_identity_mode:'identified',p_consent_to_process:true,p_consent_to_contact:true,p_anonymous_access_token:null};
function request(body={action:'submit',payload},headers={},method='POST'){
 return new Request('https://exampleproject.supabase.co/functions/v1/crew-manifestations',{method,headers:{origin,'content-type':'application/json',authorization:'Bearer '+token,...headers},...(method==='POST'?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});
}
function setup(kind='manifestations',options={}){
 const calls=[];
 const fetcher=async(url,init)=>{
   calls.push({url,init,body:init.body?JSON.parse(init.body):null});
   if(url.endsWith('/auth/v1/user'))return new Response(JSON.stringify(options.authUser||{id:UID,email:'verified@example.test',email_confirmed_at:'2026-09-01T00:00:00Z'}),{status:options.authStatus||200});
   if(url.endsWith('/crew_consume_gateway_quota'))return Response.json(options.quota??true);
   if(url.endsWith('/submit_manifestation'))return Response.json([{protocol:'AG-2026-0123456789ABCDEF',manifestation_id:UID}]);
   if(url.endsWith('/record_section_view'))return Response.json(true);
   throw Error('Unexpected destination');
 };
 return {calls,handler:createGateway(kind,{env:options.env||env,fetcher:options.fetcher||fetcher,now:()=>new Date(options.date||'2026-09-12T02:00:00Z')})};
}
let cases=0;
async function test(label,fn){await fn();cases++;}
await test('verified identity supplied only by Auth',async()=>{
 const {handler,calls}=setup();const response=await handler(request());assert.equal(response.status,200);
 const body=await response.json();assert.deepEqual(Object.keys(body),['protocol','manifestation_id']);
 assert.equal(calls[0].url,env.SUPABASE_URL+'/auth/v1/user');assert.equal(calls[0].init.headers.Authorization,'Bearer '+token);assert.equal(calls[0].init.redirect,'error');assert.equal(calls[1].init.redirect,'error');
 assert.equal(calls[2].body.p_verified_user_id,UID);assert.equal(calls[2].body.p_verified_email,'verified@example.test');
 assert.equal(calls[1].body.p_scope,'manifestations');assert.match(calls[1].body.p_subject_hash,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(calls[1].body).includes(UID));
 assert.ok(!JSON.stringify(body).includes(env.SUPABASE_SERVICE_ROLE_KEY));assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
});
await test('forged identity is rejected before privileged RPC',async()=>{
 const {handler,calls}=setup();assert.equal((await handler(request({action:'submit',payload:{...payload,p_verified_user_id:UID}}))).status,400);assert.equal(calls.length,0);
});
await test('origin missing or disallowed is denied',async()=>{
 for(const source of ['null','https://untrusted.example','']){const {handler,calls}=setup();const result=await handler(request(undefined,{origin:source}));assert.equal(result.status,403);assert.equal(result.headers.get('Access-Control-Allow-Origin'),null);assert.equal(calls.length,0);}
});
await test('preflight has no mutation and no credentials wildcard',async()=>{
 const {handler,calls}=setup();const result=await handler(request(undefined,{},'OPTIONS'));assert.equal(result.status,204);assert.equal(calls.length,0);assert.equal(result.headers.get('Access-Control-Allow-Credentials'),null);
});
await test('invalid bearer and unconfirmed accounts cannot write',async()=>{
 for(const options of [{authStatus:401},{authUser:{id:UID,email:'x@example.test'}},{authUser:{id:UID,email:'x@example.test',confirmed_at:'x',is_anonymous:true}}]){const {handler,calls}=setup('manifestations',options);assert.equal((await handler(request())).status,401);assert.equal(calls.length,1);}
 const {handler,calls}=setup();assert.equal((await handler(request(undefined,{authorization:''}))).status,401);assert.equal(calls.length,0);
});
await test('anonymous actions are disabled, not simulated',async()=>{
 for(const input of [{action:'anonymous-thread',payload:{}},{action:'anonymous-reply',payload:{}},{action:'submit',payload:{...payload,p_identity_mode:'anonymous'}}]){const {handler,calls}=setup();assert.equal((await handler(request(input))).status,503);assert.equal(calls.length,0);}
});
await test('rate limit stops write and uses rotating HMAC',async()=>{
 const malformed=setup('manifestations',{quota:{allowed:true}});assert.equal((await malformed.handler(request())).status,503);assert.equal(malformed.calls.length,2);
 const denied=setup('manifestations',{quota:false});const response=await denied.handler(request());assert.equal(response.status,429);assert.equal(denied.calls.length,2);assert.equal(response.headers.get('Retry-After'),'3600');
 const a=setup(),b=setup('manifestations',{date:'2026-09-13T02:00:00Z'});await a.handler(request());await b.handler(request());assert.notEqual(a.calls[1].body.p_subject_hash,b.calls[1].body.p_subject_hash);
});
await test('limits and consent checked before write',async()=>{
 for(const input of [{...payload,p_body:'short'},{...payload,p_subject:'x'.repeat(141)},{...payload,p_consent_to_process:false},{...payload,p_category:'arbitrary'},{...payload,p_category:'outra',p_other_category:'x'}]){const {handler,calls}=setup();assert.equal((await handler(request({action:'submit',payload:input}))).status,400);assert.equal(calls.length,0);}
 const {handler,calls}=setup();assert.equal((await handler(request('x'.repeat(25000)))).status,413);assert.equal(calls.length,0);
});
await test('email remains absent without contact consent',async()=>{
 const {handler,calls}=setup();assert.equal((await handler(request({action:'submit',payload:{...payload,p_consent_to_contact:false}}))).status,200);assert.equal(calls[2].body.p_verified_email,null);
});
await test('analytics accepts only authenticated center loads',async()=>{
 const {handler,calls}=setup('analytics');const response=await handler(request({sectionSlug:'centro-tripulacao',pageSessionId:'a'.repeat(32)}));assert.equal(response.status,200);assert.deepEqual(calls[2].body,{p_section_slug:'centro-tripulacao',p_session_id:'a'.repeat(32)});
 const invalid=setup('analytics');assert.equal((await invalid.handler(request({sectionSlug:'private/patient',pageSessionId:'a'.repeat(32)}))).status,400);assert.equal(invalid.calls.length,0);
});
await test('upstream failures and absent secrets fail closed',async()=>{
 const {handler}=setup('manifestations',{fetcher:async()=>{throw Error('Do not expose '+env.SUPABASE_SERVICE_ROLE_KEY)}});const result=await handler(request());assert.equal(result.status,503);assert.ok(!(await result.text()).includes(env.SUPABASE_SERVICE_ROLE_KEY));
 const missing=setup('manifestations',{env:{}});assert.equal((await missing.handler(request())).status,503);assert.equal(missing.calls.length,0);
});
await test('modern secret is only an apikey',async()=>{
 const modern=setup('manifestations',{env:{...env,SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_test_only_not_real'})}});assert.equal((await modern.handler(request())).status,200);assert.equal(modern.calls[1].init.headers.apikey,'sb_secret_test_only_not_real');assert.equal(modern.calls[1].init.headers.Authorization,undefined);
});
console.log(`${cases} gateway cases passed (mocked Auth/RPC; no deployment).`);
