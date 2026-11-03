import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import StripeClient from 'stripe';
import { Store } from '../src/store.mjs';
import { MembershipService, hashEmail } from '../src/service.mjs';
import { catalog, configFromEnv, readiness } from '../src/config.mjs';
import { createApp } from '../src/server.mjs';
const userId='00000000-0000-4000-8000-000000000001',otherId='00000000-0000-4000-8000-000000000002',NOW=1800000000;
const signClient=new StripeClient('fixture_not_a_real_key');
function fixture({withContent=false}={}){
 const temp=mkdtempSync(path.join(tmpdir(),'membership-fixture-'));
 const config={...configFromEnv({}),origins:['http://localhost'],supabaseUrl:'https://fixture.supabase.co',supabaseKey:'public_fixture',hashSecret:'x'.repeat(48),live:false,stripeWebhook:'fixture_webhook_signing_secret',hotmartToken:'fixture_hottok',hotmartProduct:'123',hotmartPlans:{'1':'basico','2':'pro','3':'ultra'},prices:{basico:'price_basic',pro:'price_pro',ultra:'price_ultra'},siteUrl:'https://example.invalid',portalConfiguration:'bpc_fixture',supportEmail:'support@example.invalid',legalReady:true,featuresReviewed:true,salesEnabled:false,stripeKey:'fixture_not_a_real_key'};
 if(withContent){config.contentDir=path.join(temp,'private');mkdirSync(config.contentDir);config.contentManifest=path.join(config.contentDir,'manifest.json');const entries=Object.keys(catalog.features).map((feature,i)=>{writeFileSync(path.join(config.contentDir,i+'.md'),'Conteúdo autoral fictício de teste');return{slug:'fixture-'+i,title:'Fixture',feature,file:i+'.md',reviewed:true,rightsCleared:true};});writeFileSync(config.contentManifest,JSON.stringify(entries));}
 const store=new Store(path.join(temp,'db.sqlite'));store.linkCustomer(userId,'cus_fixture');
 const invoice={id:'in_fixture',livemode:false,status:'paid',parent:{subscription_details:{subscription:'sub_fixture'}},lines:{data:[{pricing:{price_details:{price:'price_basic'}},period:{end:NOW+3600}}]}};
 const sub={id:'sub_fixture',livemode:false,customer:'cus_fixture',status:'active',latest_invoice:invoice,items:{data:[{quantity:1,price:{id:'price_basic'},current_period_end:NOW+3600}]}};
 const stripe={
  webhooks:signClient.webhooks,
  subscriptions:{retrieve:async()=>sub},invoices:{retrieve:async()=>invoice},
  charges:{retrieve:async()=>({id:'ch_fixture',payment_intent:'pi_fixture'})},invoicePayments:{list:()=>[{invoice:'in_fixture'}]},
  prices:{retrieve:async id=>({id,active:true,livemode:false,currency:'brl',unit_amount:4990,recurring:{interval:'month',interval_count:1}})},
  customers:{create:async()=>({id:'cus_fixture'})},
  checkout:{sessions:{retrieve:async()=>({mode:'subscription',payment_status:'paid',subscription:'sub_fixture'}),create:async data=>({id:'cs_fixture',url:'https://checkout.stripe.com/fixture',expires_at:NOW+1800,data})}},
  billingPortal:{sessions:{create:async data=>({url:'https://billing.stripe.com/'+data.customer})}}
 };
 const fetchImpl=async(_url,opts)=>({ok:opts.headers.Authorization==='Bearer verified',json:async()=>({id:userId,email:'fixture@example.invalid',email_confirmed_at:'2026-01-01',is_anonymous:false})});
 const service=new MembershipService({config,store,stripe,fetchImpl,clock:()=>NOW});
 const user={id:userId,email:'fixture@example.invalid',emailHash:hashEmail('fixture@example.invalid',config.hashSecret)};
 return{temp,config,store,stripe,service,user,sub,invoice};
}
function stripeEvent(type,id='evt_fixture',object={id:'sub_fixture'}){return {id,type,created:NOW,livemode:false,data:{object}};}
function deliver(f,event){const raw=JSON.stringify(event),header=signClient.webhooks.generateTestHeaderString({payload:raw,secret:f.config.stripeWebhook});return f.service.stripeWebhook(Buffer.from(raw),header);}
function hotEvent(event='PURCHASE_APPROVED',id='hot_fixture',time=NOW){return{id,event,creation_date:time*1000,data:{product:{id:123},buyer:{email:'fixture@example.invalid'},subscription:{plan:{id:1},subscriber:{code:'subscriber_fixture'}},purchase:{date_next_charge:(NOW+3600)*1000}}};}

test('catálogo usa centavos e herança 6/9/12; venda desativada por padrão',()=>{
 const f=fixture();assert.deepEqual(catalog.plans.map(x=>[x.amount,x.features.length]),[[4990,6],[9990,9],[14990,12]]);assert.equal(f.service.publicCatalog().salesEnabled,false);assert.equal(readiness(f.config).ready,false);f.store.close();
});
test('auth consulta Supabase e exige conta confirmada; nunca aceita ID do cliente',async()=>{
 const f=fixture();assert.equal((await f.service.authenticate('verified')).id,userId);await assert.rejects(f.service.authenticate('spoofed'),{status:401});
 f.service.fetch=async()=>({ok:true,json:async()=>({id:userId,email:'fixture@example.invalid'})});await assert.rejects(f.service.authenticate('verified'),{status:403});f.store.close();
});
test('assinatura paga libera apenas o nível autorizado e outra conta é negada',async()=>{
 const f=fixture({withContent:true});await deliver(f,stripeEvent('invoice.paid','evt_paid',{id:'in_fixture'}));assert.equal(f.service.me(f.user).tier,'basico');assert.equal(f.service.me({...f.user,id:otherId,emailHash:'other'}).tier,null);assert.equal(f.service.me(f.user).features.includes('simulados'),false);
 assert.match((await f.service.content(f.user,'fixture-1')).body.toString(),/fictício/);await assert.rejects(f.service.content(f.user,'fixture-7'),{status:403});f.store.close();
});
test('assinatura/checkout falsificados, modo incorreto e assinatura inválida não liberam',async()=>{
 const f=fixture();await assert.rejects(f.service.stripeWebhook(Buffer.from('{}'),'invalid'),{status:400});await assert.rejects(deliver(f,{...stripeEvent('customer.subscription.updated'),livemode:true}),{status:400});f.stripe.checkout.sessions.retrieve=async()=>({mode:'subscription',payment_status:'unpaid',subscription:'sub_fixture'});await deliver(f,stripeEvent('checkout.session.completed','evt_unpaid',{id:'cs_fixture'}));assert.equal(f.service.me(f.user).tier,null);f.store.close();
});
test('duplicata durável não reaplica e erro transitório permite retentativa',async()=>{
 const f=fixture();const original=f.stripe.subscriptions.retrieve;f.stripe.subscriptions.retrieve=async()=>{throw Error('transient');};const e=stripeEvent('customer.subscription.updated');await assert.rejects(deliver(f,e));assert.equal(f.store.seen('stripe',e.id),false);f.stripe.subscriptions.retrieve=original;await deliver(f,e);assert.equal((await deliver(f,e)).duplicate,true);const reopened=new Store(path.join(f.temp,'db.sqlite'));assert.equal(reopened.seen('stripe',e.id),true);reopened.close();f.store.close();
});
test('eventos atrasados Stripe reconciliam estado atual; cancelamento e expiração bloqueiam',async()=>{
 const f=fixture();await deliver(f,stripeEvent('invoice.paid','evt_a',{id:'in_fixture'}));f.sub.cancel_at=NOW+3600;await deliver(f,stripeEvent('customer.subscription.updated','evt_b'));assert.equal(f.service.me(f.user).tier,'basico');f.service.clock=()=>NOW+3601;assert.equal(f.service.me(f.user).tier,null);f.service.clock=()=>NOW;f.sub.status='canceled';await deliver(f,stripeEvent('invoice.paid','evt_old',{id:'in_fixture'}));assert.equal(f.service.me(f.user).tier,null);f.store.close();
});
test('upgrade sem fatura paga do novo preço não eleva o nível',async()=>{
 const f=fixture();await deliver(f,stripeEvent('invoice.paid','evt_a',{id:'in_fixture'}));f.sub.items.data[0].price.id='price_ultra';await deliver(f,stripeEvent('customer.subscription.updated','evt_upgrade'));assert.equal(f.service.me(f.user).tier,'basico');f.store.close();
});
test('reembolso, disputa e fraude são persistidos e não reativam por evento posterior',async()=>{
 for(const type of ['charge.refunded','charge.dispute.created','radar.early_fraud_warning.created']){
 const f=fixture();await deliver(f,stripeEvent('invoice.paid','evt_paid',{id:'in_fixture'}));await deliver(f,stripeEvent(type,'evt_risk',type==='charge.refunded'?{id:'ch_fixture'}:{charge:'ch_fixture'}));assert.equal(f.service.me(f.user).tier,null);await deliver(f,stripeEvent('invoice.paid','evt_new',{id:'in_fixture'}));assert.equal(f.service.me(f.user).tier,null);assert.equal(f.store.held('stripe','sub_fixture'),true);f.store.close();}
});
test('Hotmart exige segredo/produto/plano conhecidos e período real finito',async()=>{
 const f=fixture();await assert.rejects(f.service.hotmartWebhook(JSON.stringify(hotEvent()),'wrong'),{status:401});let e=hotEvent();e.data.subscription.plan.id=999;await assert.rejects(f.service.hotmartWebhook(JSON.stringify(e),f.config.hotmartToken),{status:400});e=hotEvent();delete e.data.purchase.date_next_charge;await assert.rejects(f.service.hotmartWebhook(JSON.stringify(e),f.config.hotmartToken),{status:422});await f.service.hotmartWebhook(JSON.stringify(hotEvent()),f.config.hotmartToken);assert.equal(f.service.me(f.user).tier,'basico');assert.equal(f.store.db.prepare('SELECT subject FROM subscriptions').get().subject.includes('@'),false);f.store.close();
});
test('Hotmart preserva período pago no cancelamento, deduplica e refund atrasado vence',async()=>{
 const f=fixture();await f.service.hotmartWebhook(JSON.stringify(hotEvent()),f.config.hotmartToken);assert.equal((await f.service.hotmartWebhook(JSON.stringify(hotEvent()),f.config.hotmartToken)).duplicate,true);
 const canceled=hotEvent('SUBSCRIPTION_CANCELLATION','hot_cancel',NOW+10);canceled.data.subscriber={email:'fixture@example.invalid',code:'subscriber_fixture'};canceled.data.date_next_charge=(NOW+3600)*1000;await f.service.hotmartWebhook(JSON.stringify(canceled),f.config.hotmartToken);assert.equal(f.service.me(f.user).tier,'basico');
 await f.service.hotmartWebhook(JSON.stringify(hotEvent('PURCHASE_REFUNDED','hot_refund',NOW-10)),f.config.hotmartToken);assert.equal(f.service.me(f.user).tier,null);await f.service.hotmartWebhook(JSON.stringify(hotEvent('PURCHASE_APPROVED','hot_new',NOW+20)),f.config.hotmartToken);assert.equal(f.service.me(f.user).tier,null);f.store.close();
});
test('cancelar Hotmart não cancela Stripe e vice-versa',async()=>{
 const f=fixture();await deliver(f,stripeEvent('invoice.paid','evt_paid',{id:'in_fixture'}));await f.service.hotmartWebhook(JSON.stringify(hotEvent()),f.config.hotmartToken);await f.service.hotmartWebhook(JSON.stringify(hotEvent('PURCHASE_REFUNDED','hot_refund')),f.config.hotmartToken);assert.equal(f.service.me(f.user).tier,'basico');f.store.close();
});
test('conteúdo privado exige review e direitos; arquivo público e symlink externo não entram',async()=>{
 const f=fixture({withContent:true});const original=JSON.parse(await import('node:fs').then(fs=>fs.readFileSync(f.config.contentManifest,'utf8')));original[0].reviewed=false;writeFileSync(f.config.contentManifest,JSON.stringify(original));await deliver(f,stripeEvent('invoice.paid','evt_paid',{id:'in_fixture'}));await assert.rejects(f.service.content(f.user,'fixture-0'),{status:404});
 const outside=path.join(f.temp,'outside.md');writeFileSync(outside,'outside');symlinkSync(outside,path.join(f.config.contentDir,'link.md'));original.push({slug:'link',feature:'microestudos',file:'link.md',reviewed:true,rightsCleared:true});writeFileSync(f.config.contentManifest,JSON.stringify(original));await assert.rejects(f.service.content(f.user,'link'),{status:404});f.store.close();
});
test('checkout só aceita allowlist; porta de lançamento bloqueia até homologação',async()=>{
 const f=fixture();await assert.rejects(f.service.checkout(f.user,'enterprise'),{status:400});await assert.rejects(f.service.checkout(f.user,'basico'),{status:503});f.store.close();
});
test('checkout validado usa preço servidor e portal usa dono autenticado',async()=>{
 const f=fixture({withContent:true});f.config.salesEnabled=true;let payload;f.stripe.checkout.sessions.create=async data=>{payload=data;return{id:'cs_fixture',url:'https://checkout.stripe.com/fixture',expires_at:NOW+1800};};await f.service.checkout(f.user,'basico');assert.equal(payload.line_items[0].price,'price_basic');assert.match(payload.integration_identifier,/_[a-z]{8}$/);assert.equal(payload.payment_method_types,undefined);assert.equal((await f.service.checkout(f.user,'basico')).url,'https://checkout.stripe.com/fixture');assert.equal((await f.service.portal(f.user)).url,'https://billing.stripe.com/cus_fixture');await assert.rejects(f.service.portal({...f.user,id:otherId}),{status:404});f.store.close();
});
test('HTTP bloqueia Origin, bearer ausente e adulteração de preço',async()=>{
 const f=fixture();const app=createApp(f.service);await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+app.address().port;try{
 let r=await fetch(url+'/api/me',{headers:{Origin:'https://attacker.invalid'}});assert.equal(r.status,403);
 r=await fetch(url+'/api/me',{headers:{Origin:'http://localhost'}});assert.equal(r.status,401);
 r=await fetch(url+'/api/checkout',{method:'POST',headers:{Origin:'http://localhost',Authorization:'Bearer verified','Content-Type':'application/json'},body:JSON.stringify({tier:'ultra',price:1})});assert.equal(r.status,400);
 r=await fetch(url+'/api/catalog',{headers:{Origin:'http://localhost'}});assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).salesEnabled,false);
 }finally{await new Promise(resolve=>app.close(resolve));f.store.close();}
});


test('HTTP malformado recebe 400 e o processo continua respondendo',async()=>{
 const f=fixture();const app=createApp(f.service);await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));const port=app.address().port;
 try{
  const raw=await new Promise((resolve,reject)=>{const socket=net.createConnection({host:'127.0.0.1',port},()=>socket.write('GET http://[ HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n'));let data='';socket.on('data',chunk=>data+=chunk);socket.on('end',()=>resolve(data));socket.on('error',reject);});
  assert.match(raw,/HTTP\/1.1 400/);
  const response=await fetch('http://127.0.0.1:'+port+'/health');assert.equal(response.status,200);
 }finally{await new Promise(resolve=>app.close(resolve));f.store.close();}
});


test('resposta perdida do checkout reaproveita payload e chave persistidos',async()=>{
 const f=fixture({withContent:true});f.config.salesEnabled=true;const calls=[];let failed=true;
 f.stripe.checkout.sessions.create=async(payload,options)=>{calls.push({payload,options});if(failed){failed=false;throw Error('response lost');}return{id:'cs_retry',url:'https://checkout.stripe.com/retry',expires_at:NOW+3600};};
 await assert.rejects(f.service.checkout(f.user,'basico'));assert.ok(f.store.attempt(f.user.id));
 f.service.clock=()=>NOW+10;await f.service.checkout(f.user,'basico');assert.deepEqual(calls[0],calls[1]);assert.equal(f.store.attempt(f.user.id),undefined);f.store.close();
});
