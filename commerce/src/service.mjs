import { createHmac, timingSafeEqual, randomInt, randomUUID } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { catalog, privateManifest, readiness } from './config.mjs';
export class Problem extends Error {constructor(status,code){super(code);this.status=status;this.code=code;}}
const idOf=x=>typeof x==='string'?x:x?.id;
const invoiceSub=x=>idOf(x?.parent?.subscription_details?.subscription);
const nowSeconds=()=>Math.floor(Date.now()/1000);
export const STRIPE_EVENTS=[
  'checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed',
  'customer.subscription.created','customer.subscription.updated','customer.subscription.deleted',
  'invoice.paid','invoice.payment_failed','charge.refunded','charge.dispute.created','radar.early_fraud_warning.created'
];
export function hashEmail(email,secret) {return createHmac('sha256',secret).update(email.trim().toLowerCase()).digest('hex');}
function safeEquals(a,b){if(!a||!b)return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export class MembershipService {
  constructor({config,store,stripe,fetchImpl=fetch,clock=nowSeconds}){this.config=config;this.store=store;this.stripe=stripe;this.fetch=fetchImpl;this.clock=clock;this.queue=Promise.resolve();}
  serial(fn){const p=this.queue.then(fn,fn);this.queue=p.catch(()=>{});return p;}
  async authenticate(token){
    if(!token||token.length>8192)throw new Problem(401,'authentication_required');
    if(!this.config.supabaseUrl||!this.config.supabaseKey)throw new Problem(503,'authentication_unconfigured');
    let response;try{response=await this.fetch(this.config.supabaseUrl+'/auth/v1/user',{headers:{apikey:this.config.supabaseKey,Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});}catch{throw new Problem(503,'authentication_unavailable');}
    if(!response.ok)throw new Problem(401,'invalid_session');
    const user=await response.json();
    if(!/^[0-9a-f-]{36}$/i.test(user.id||'')||!user.email_confirmed_at||!user.email||user.is_anonymous)throw new Problem(403,'verified_account_required');
    if(this.config.hashSecret.length<32)throw new Problem(503,'identity_unconfigured');
    return {id:user.id,email:user.email,emailHash:hashEmail(user.email,this.config.hashSecret)};
  }
  publicCatalog(){const state=readiness(this.config);return {...catalog,salesEnabled:state.salesEnabled,readiness:state};}
  me(user){
    const subscriptions=this.store.subscriptions(user.id,user.emailHash),now=this.clock();
    const valid=subscriptions.filter(s=>!s.risk_block&&s.paid_until>now&&['active','past_due','canceling'].includes(s.status));
    const tiers=catalog.plans.filter(p=>valid.some(s=>s.tier===p.id));
    const plan=tiers.at(-1);
    return {user:{id:user.id},tier:plan?.id||null,features:plan?.features||[],subscriptions,content:privateManifest(this.config).filter(x=>plan?.features.includes(x.feature)).map(x=>({slug:x.slug,title:x.title||x.slug,feature:x.feature}))};
  }
  assertOrigin(origin){if(!this.config.origins.includes(origin))throw new Problem(403,'origin_rejected');}
  async checkout(user,tier){
    if(!catalog.plans.some(x=>x.id===tier))throw new Problem(400,'unknown_tier');
    if(!readiness(this.config).salesEnabled)throw new Problem(503,'sales_not_ready');
    if(this.me(user).subscriptions.some(s=>s.risk_block))throw new Problem(409,'subscription_review_required');
    if(this.me(user).subscriptions.some(s=>!s.risk_block&&s.paid_until>this.clock()))throw new Problem(409,'manage_existing_subscription');
    const pending=this.store.pending(user.id,this.clock());
    if(pending){if(pending.tier!==tier)throw new Problem(409,'checkout_already_pending');return {url:pending.url};}
    const price=await this.stripe.prices.retrieve(this.config.prices[tier]);
    const plan=catalog.plans.find(x=>x.id===tier);
    if(price.livemode!==this.config.live||!price.active||price.currency!=='brl'||price.unit_amount!==plan.amount||price.recurring?.interval!=='month'||price.recurring?.interval_count!==1)throw new Problem(503,'price_configuration_mismatch');
    let customer=this.store.customer(user.id);
    if(!customer){const c=await this.stripe.customers.create({}, {idempotencyKey:'aldenirmed-customer-'+user.id});customer=c.id;this.store.linkCustomer(user.id,customer);}
    let attempt=this.store.attempt(user.id);
    if(attempt){
      const saved=JSON.parse(attempt.payload_json);
      if(saved.line_items[0].price!==price.id)throw new Problem(409,'checkout_already_pending');
      // A lost response never leads to a new chargeable session. Escalate old unknown attempts for reconciliation.
      if(attempt.created_at+1800<this.clock())throw new Problem(503,'checkout_reconciliation_required');
    }else{
      const suffix=Array.from({length:8},()=>String.fromCharCode(97+randomInt(26))).join('');
      const base=this.config.siteUrl.replace(/\/$/,'');
      const payload={
        mode:'subscription',customer,client_reference_id:user.id,
        line_items:[{price:price.id,quantity:1}],
        subscription_data:{billing_mode:{type:'flexible'}},
        integration_identifier:'aldenirmed89_'+suffix,
        success_url:base+'/membros/?checkout=retorno',cancel_url:base+'/planos/',
        expires_at:this.clock()+3600,
      };
      this.store.setAttempt(user.id,'aldenirmed-checkout-'+randomUUID(),payload,this.clock());
      attempt=this.store.attempt(user.id);
    }
    const session=await this.stripe.checkout.sessions.create(JSON.parse(attempt.payload_json),{idempotencyKey:attempt.attempt_key});
    this.store.completeAttempt(user.id,{...session,tier});return {url:session.url};
  }
  async portal(user){
    const customer=this.store.customer(user.id);
    if(!customer||!this.config.portalConfiguration)throw new Problem(404,'stripe_subscription_not_found');
    const session=await this.stripe.billingPortal.sessions.create({customer,configuration:this.config.portalConfiguration,return_url:this.config.siteUrl.replace(/\/$/,'')+'/membros/'});
    return {url:session.url};
  }
  async content(user,slug){
    const state=this.me(user),entry=privateManifest(this.config).find(x=>x.slug===slug);
    if(!entry)throw new Problem(404,'content_not_found');
    if(!state.features.includes(entry.feature))throw new Problem(403,'subscription_required');
    const dir=await realpath(this.config.contentDir),file=await realpath(path.resolve(dir,entry.file));
    if(!file.startsWith(dir+path.sep))throw new Problem(403,'private_path_rejected');
    // JSON/Markdown only; no arbitrary HTML/script execution or file URLs from browser input.
    const ext=path.extname(file).toLowerCase();if(!['.json','.md','.txt'].includes(ext))throw new Problem(403,'content_type_rejected');
    const body=await readFile(file);if(body.length>2*1024*1024)throw new Problem(413,'content_too_large');
    return {body,type:ext==='.json'?'application/json; charset=utf-8':'text/plain; charset=utf-8'};
  }
  async stripeWebhook(raw,signature){
    if(!this.config.stripeWebhook||!this.stripe)throw new Problem(503,'webhook_unconfigured');
    let event;try{event=this.stripe.webhooks.constructEvent(raw,signature,this.config.stripeWebhook);}catch{throw new Problem(400,'invalid_signature');}
    if(event.livemode!==this.config.live)throw new Problem(400,'mode_mismatch');
    return this.serial(async()=>{
      if(this.store.seen('stripe',event.id))return {received:true,duplicate:true};
      const object=event.data.object;let ids=[],risk=false;
      if(event.type.startsWith('customer.subscription.'))ids=[object.id];
      else if(['invoice.paid','invoice.payment_failed'].includes(event.type)){const invoice=await this.stripe.invoices.retrieve(object.id);const sub=invoiceSub(invoice);if(sub)ids=[sub];}
      else if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){
        const session=await this.stripe.checkout.sessions.retrieve(object.id);
        if(session.mode==='subscription'&&session.payment_status==='paid'&&session.subscription)ids=[idOf(session.subscription)];
      }else if(['charge.refunded','charge.dispute.created','radar.early_fraud_warning.created'].includes(event.type)){
        risk=true;ids=await this.riskSubscriptions(event.type,object);
      }
      const rows=[];for(const id of new Set(ids)){const row=await this.stripeSnapshot(id);if(row)rows.push(row);}
      this.store.transaction(()=>{
        if(this.store.seen('stripe',event.id))return;
        for(const id of ids)if(risk)this.store.hold('stripe',id,event.type);
        for(const row of rows){row.risk_block=risk||this.store.held('stripe',row.subscription_id)?1:0;this.store.put(row);this.store.clearPending(row.subject.slice(5));}
        this.store.event('stripe',event.id,event.type,this.clock());
      });return {received:true};
    });
  }
  async stripeSnapshot(id){
    const sub=await this.stripe.subscriptions.retrieve(id,{expand:['latest_invoice']});
    if(sub.livemode!==this.config.live)throw new Problem(400,'mode_mismatch');
    const owner=this.store.owner(idOf(sub.customer));if(!owner)return null; // Never infer ownership from unverified metadata/email.
    const item=sub.items?.data?.length===1?sub.items.data[0]:null;
    const tier=Object.keys(this.config.prices).find(k=>this.config.prices[k]===idOf(item?.price))||null;
    let invoice=sub.latest_invoice;
    if(typeof invoice==='string')invoice=await this.stripe.invoices.retrieve(invoice);
    const previous=this.store.get('stripe',id);
    let paidUntil=previous?.paid_until||0,paidTier=previous?.tier||null;
    const lines=invoice?.lines?.data||[];
    const paidLine=lines.find(l=>idOf(l.pricing?.price_details?.price||l.price)===idOf(item?.price)&&l.period?.end);
    if(tier&&item?.quantity===1&&invoice?.status==='paid'&&invoiceSub(invoice)===id&&paidLine){
      paidUntil=Math.min(Number(item.current_period_end||0),Number(paidLine.period.end));paidTier=tier;
    }
    if(!['active','past_due'].includes(sub.status)){paidUntil=0;}
    return {provider:'stripe',subscription_id:id,subject:'user:'+owner,tier:paidTier,status:sub.status,
      paid_until:paidUntil,updated_at:this.clock(),cancel_at:sub.cancel_at||0,risk_block:this.store.held('stripe',id)?1:0};
  }
  async riskSubscriptions(type,object){
    const chargeId=type==='charge.refunded'?object.id:idOf(object.charge);
    if(!chargeId)throw new Problem(422,'risk_charge_unresolved');
    const charge=await this.stripe.charges.retrieve(chargeId);
    const intent=idOf(charge.payment_intent),ids=new Set();
    if(intent){
      // Stripe API 2026-10-28: Charge -> PaymentIntent -> InvoicePayment -> Invoice -> Subscription.
      const payments=this.stripe.invoicePayments.list({payment:{type:'payment_intent',payment_intent:intent},limit:100});
      for await(const payment of payments){const invoice=await this.stripe.invoices.retrieve(idOf(payment.invoice));const sub=invoiceSub(invoice);if(sub)ids.add(sub);}
    }else if(charge.invoice){const invoice=await this.stripe.invoices.retrieve(idOf(charge.invoice));const sub=invoiceSub(invoice);if(sub)ids.add(sub);}
    return [...ids];
  }
  async hotmartWebhook(raw,token){
    if(this.config.hashSecret.length<32)throw new Problem(503,'identity_unconfigured');
    if(!this.config.hotmartToken)throw new Problem(503,'hotmart_unconfigured');
    if(!safeEquals(token,this.config.hotmartToken))throw new Problem(401,'invalid_hotmart_token');
    let e;try{e=JSON.parse(raw);}catch{throw new Problem(400,'invalid_json');}
    if(!e.id||typeof e.id!=='string'||e.id.length>200||!Number.isFinite(e.creation_date))throw new Problem(400,'invalid_event');
    const d=e.data||{},cancel=e.event==='SUBSCRIPTION_CANCELLATION';
    const product=String(d.product?.id||''),plan=String(d.subscription?.plan?.id||'');
    if(product!==this.config.hotmartProduct||!Object.hasOwn(this.config.hotmartPlans,plan)||!catalog.plans.some(x=>x.id===this.config.hotmartPlans[plan]))throw new Problem(400,'unknown_hotmart_product_or_plan');
    const email=cancel?d.subscriber?.email:d.buyer?.email;
    const subscriber=cancel?d.subscriber?.code:d.subscription?.subscriber?.code;
    if(!email||!subscriber||typeof subscriber!=='string')throw new Problem(400,'invalid_subscription_identity');
    const subid=product+':'+subscriber,subject='email:'+hashEmail(email,this.config.hashSecret);
    const approved=['PURCHASE_APPROVED','PURCHASE_COMPLETE'].includes(e.event),risk=['PURCHASE_REFUNDED','PURCHASE_CHARGEBACK'].includes(e.event);
    const at=e.creation_date;
    if(at>(this.clock()+300)*1000)throw new Problem(400,'future_event');
    return this.serial(()=>{
      if(this.store.seen('hotmart',e.id))return {received:true,duplicate:true};
      const previous=this.store.get('hotmart',subid);
      if(previous&&previous.subject!==subject)throw new Problem(409,'subscription_owner_conflict');
      let until=previous?.paid_until||0,status=previous?.status||'pending',tier=previous?.tier||null;
      if(approved){
        // No fixed 30-day approximation: require provider's actual paid cycle boundary.
        const next=Number(d.purchase?.date_next_charge||d.date_next_charge||0);
        if(!Number.isFinite(next)||next<=e.creation_date||next>e.creation_date+40*86400000)throw new Problem(422,'paid_period_missing_or_invalid');
        until=Math.floor(next/1000);status='active';tier=this.config.hotmartPlans[plan];
      }else if(cancel){status='canceling';const end=Number(d.date_next_charge||0);if(end>0)until=Math.min(until,Math.floor(end/1000));}
      else if(['PURCHASE_DELAYED','PURCHASE_EXPIRED','PURCHASE_CANCELED'].includes(e.event)){status='past_due';}
      else if(risk){status='suspended';until=0;}
      const row={provider:'hotmart',subscription_id:subid,subject,tier,status,paid_until:until,updated_at:at,risk_block:risk?1:0,cancel_at:cancel?until:0};
      this.store.transaction(()=>{
        if(risk)this.store.hold('hotmart',subid,e.event);
        row.risk_block=this.store.held('hotmart',subid)?1:0;
        // Risk always wins even if older than the most recent approval.
        this.store.put(row);this.store.event('hotmart',e.id,e.event,this.clock());
      });return {received:true};
    });
  }
}
