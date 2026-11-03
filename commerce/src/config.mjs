import { readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const catalog=JSON.parse(readFileSync(path.join(ROOT,'catalog.json'),'utf8'));
export function configFromEnv(e=process.env) {
  let hotmartPlans={}; try{hotmartPlans=JSON.parse(e.HOTMART_PLAN_MAP||'{}');}catch{throw new Error('HOTMART_PLAN_MAP inválido');}
  const cfg={
    port:Number(e.PORT||8788), database:e.DATABASE_PATH||path.join(ROOT,'runtime/membership.sqlite'),
    origins:(e.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean),
    supabaseUrl:e.SUPABASE_URL||'', supabaseKey:e.SUPABASE_PUBLISHABLE_KEY||'',
    stripeKey:e.STRIPE_RESTRICTED_KEY||'', stripeWebhook:e.STRIPE_WEBHOOK_SECRET||'',
    live:e.STRIPE_LIVEMODE==='true', salesEnabled:e.SALES_ENABLED==='true',
    prices:{basico:e.STRIPE_PRICE_BASICO||'',pro:e.STRIPE_PRICE_PRO||'',ultra:e.STRIPE_PRICE_ULTRA||''},
    portalConfiguration:e.STRIPE_PORTAL_CONFIGURATION||'', siteUrl:e.SITE_URL||'',
    supportEmail:e.SUPPORT_EMAIL||'', legalReady:e.LEGAL_REVIEWED==='true', featuresReviewed:e.FEATURES_HOMOLOGATED==='true',
    contentDir:e.PRIVATE_CONTENT_DIR||'', contentManifest:e.PRIVATE_CONTENT_MANIFEST||'',
    hashSecret:e.IDENTITY_HASH_SECRET||'', hotmartToken:e.HOTMART_HOTTOK||'',
    hotmartProduct:e.HOTMART_PRODUCT_ID||'', hotmartPlans,
  };
  if(cfg.supabaseUrl && !/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl))throw new Error('SUPABASE_URL inválida');
  for(const origin of cfg.origins){
    // iOS Capacitor has an opaque WHATWG origin ('null'); authorize only its exact documented origin.
    if(origin==='capacitor://localhost')continue;
    let u;try{u=new URL(origin);}catch{throw new Error('Origem precisa ser exata, sem caminho');}
    if(!['https:','http:'].includes(u.protocol)||u.origin!==origin||u.hostname.includes('*')||u.username||u.password)
      throw new Error('Origem precisa ser exata, sem caminho');
  }
  return cfg;
}
export function privateManifest(config) {
  if(!config.contentDir||!config.contentManifest) return [];
  const dir=realpathSync(config.contentDir);
  // Private payloads must live outside the public Git checkout and cannot be symlinks back into it.
  const repo=path.resolve(ROOT,'..');
  if(dir===repo||dir.startsWith(repo+path.sep)) throw new Error('Conteúdo deve ficar fora do checkout público');
  const manifest=realpathSync(config.contentManifest);
  if(!manifest.startsWith(dir+path.sep))throw new Error('Manifesto deve ficar no volume privado');
  const entries=JSON.parse(readFileSync(manifest,'utf8'));
  if(!Array.isArray(entries))throw new Error('Manifesto privado inválido');
  return entries.filter(x=>x.reviewed===true&&x.rightsCleared===true&&/^[a-z0-9-]{1,80}$/.test(x.slug)&&catalog.features[x.feature]&&typeof x.file==='string').filter(x=>{const file=realpathSync(path.resolve(dir,x.file));return file.startsWith(dir+path.sep)&&statSync(file).isFile()&&statSync(file).size<=2*1024*1024&&['.json','.md','.txt'].includes(path.extname(file));});
}
export function readiness(config) {
  const missing=[];
  if(!config.supabaseUrl||!config.supabaseKey)missing.push('autenticacao');
  if(!config.stripeKey||!config.stripeWebhook)missing.push('stripe_secrets');
  if(!config.origins.length||!/^https:\/\//.test(config.siteUrl))missing.push('origens_https');
  if(!Object.values(config.prices).every(x=>/^price_/.test(x)))missing.push('precos');
  if(!/^bpc_/.test(config.portalConfiguration))missing.push('portal_cancelamento');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail)||!config.legalReady)missing.push('suporte_termos_fiscal');
  if(!config.featuresReviewed)missing.push('funcoes_homologadas');
  if(config.hashSecret.length<32)missing.push('identity_secret');
  let entries=[];try{entries=privateManifest(config);}catch{missing.push('manifesto_privado');}
  const covered=new Set(entries.map(x=>x.feature));
  if(!Object.keys(catalog.features).every(x=>covered.has(x)))missing.push('conteudo_revisado_todas_funcoes');
  return {ready:missing.length===0, salesEnabled:config.salesEnabled&&missing.length===0, missing};
}
