import http from 'node:http';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import StripeClient from 'stripe';
import { configFromEnv } from './config.mjs';
import { Store } from './store.mjs';
import { MembershipService, Problem } from './service.mjs';
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));}
async function body(req,max=1024*1024){const parts=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>max)throw new Problem(413,'body_too_large');parts.push(chunk);}return Buffer.concat(parts);}
export function createApp(service){
  const buckets=new Map();
  return http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    let route='/invalid';
    try{
      try{route=new URL(req.url,'http://localhost').pathname;}catch{throw new Problem(400,'invalid_url');}
      if(route==='/health'&&req.method==='GET')return json(res,200,{ok:true,service:'membership',version:'0.1.0'});
      if(route.startsWith('/api/')){
        const origin=req.headers.origin;service.assertOrigin(origin);
        res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
        if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type');res.writeHead(204);return res.end();}
        const key=req.socket.remoteAddress||'unknown',minute=Math.floor(Date.now()/60000),entry=buckets.get(key);
        if(!entry||entry.minute!==minute)buckets.set(key,{minute,hits:1});else if(++entry.hits>90)throw new Problem(429,'rate_limited');
        if(buckets.size>10000){for(const[k,v]of buckets)if(v.minute<minute)buckets.delete(k);}
      }
      if(route==='/api/catalog'&&req.method==='GET')return json(res,200,service.publicCatalog());
      if(route==='/webhooks/stripe'&&req.method==='POST')return json(res,200,await service.stripeWebhook(await body(req),req.headers['stripe-signature']));
      if(route==='/webhooks/hotmart'&&req.method==='POST')return json(res,200,await service.hotmartWebhook(await body(req),req.headers['x-hotmart-hottok']));
      if(!route.startsWith('/api/'))throw new Problem(404,'not_found');
      const auth=req.headers.authorization||'';const token=auth.startsWith('Bearer ')?auth.slice(7):'';const user=await service.authenticate(token);
      if(route==='/api/me'&&req.method==='GET')return json(res,200,service.me(user));
      if(route.startsWith('/api/content/')&&req.method==='GET'){
        const slug=route.slice('/api/content/'.length);if(!/^[a-z0-9-]{1,80}$/.test(slug))throw new Problem(404,'content_not_found');
        const content=await service.content(user,slug);res.writeHead(200,{'Content-Type':content.type});return res.end(content.body);
      }
      if(['/api/checkout','/api/portal'].includes(route)&&req.method==='POST'){
        if(!(req.headers['content-type']||'').startsWith('application/json'))throw new Problem(415,'json_required');
        let input;try{input=JSON.parse(await body(req,4096));}catch(e){if(e instanceof Problem)throw e;throw new Problem(400,'invalid_json');}
        if(!input||typeof input!=='object'||Array.isArray(input))throw new Problem(400,'invalid_json');
        if(route==='/api/checkout'){
          if(Object.keys(input).some(k=>k!=='tier')||typeof input.tier!=='string')throw new Problem(400,'tier_only');
          return json(res,200,await service.serial(()=>service.checkout(user,input.tier)));
        }
        if(Object.keys(input).length)throw new Problem(400,'portal_body_must_be_empty');
        return json(res,200,await service.portal(user));
      }
      throw new Problem(404,'not_found');
    }catch(error){
      const status=error instanceof Problem?error.status:500;
      if(status>=500)console.error(JSON.stringify({event:'request_failed',route:route.startsWith('/api/content/')?'/api/content/:slug':route,code:error instanceof Problem?error.code:'internal_error'}));
      return json(res,status,{error:error instanceof Problem?error.code:'internal_error'});
    }
  });
}
export function start(){
  const config=configFromEnv();mkdirSync(path.dirname(config.database),{recursive:true,mode:0o700});
  const store=new Store(config.database);
  const stripe=config.stripeKey?new StripeClient(config.stripeKey,{apiVersion:'2026-10-28.endive',maxNetworkRetries:2,timeout:15000}):null;
  const service=new MembershipService({config,store,stripe});const app=createApp(service);
  app.listen(config.port,'0.0.0.0',()=>console.log(JSON.stringify({event:'membership_listening',port:config.port,salesEnabled:service.publicCatalog().readiness.salesEnabled})));
  const stop=()=>{app.close(()=>{store.close();process.exit(0);});};process.on('SIGTERM',stop);process.on('SIGINT',stop);return app;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)start();
