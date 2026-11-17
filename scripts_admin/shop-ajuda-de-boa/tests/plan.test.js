'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {create}=require('../dist/assets/plan');
function environment(){let raw=null,n=0,tail=Promise.resolve();return{
 storage:{getItem:()=>raw,setItem:(key,value)=>{raw=value;}},
 lock:fn=>{const next=tail.then(fn);tail=next.catch(()=>{});return next;},
 newRevision:()=>String(++n),ids:['caatinga','msf'],key:'plan',maxCents:9999999
};}
const plan=(favorites=[],cart=[])=>({version:1,favorites,cart});
test('duas abas não sobrescrevem silenciosamente alterações de outra aba',async()=>{
 const env=environment(),a=create(env),b=create(env),initialA=a.load(),initialB=b.load();
 const first=await a.save(plan(['caatinga']),initialA.token);assert.equal(first.status,'saved');
 const stale=await b.save(plan([],[['msf',2500]]),initialB.token);assert.equal(stale.status,'conflict');
 assert.deepEqual(stale.state.favorites,['caatinga']);assert.deepEqual(a.load().state.cart,[]);
 const retried=await b.save(plan(stale.state.favorites,[['msf',2500]]),stale.token);assert.equal(retried.status,'saved');
 assert.deepEqual(a.load().state,plan(['caatinga'],[['msf',2500]]));
});
test('escritas simultâneas são serializadas e uma delas detecta conflito',async()=>{
 const env=environment(),a=create(env),b=create(env),token=a.load().token;
 const result=await Promise.all([a.save(plan(['caatinga']),token),b.save(plan(['msf']),token)]);
 assert.deepEqual(result.map(r=>r.status),['saved','conflict']);assert.deepEqual(a.load().state.favorites,['caatinga']);
});
test('planejamento legado carrega e valores adulterados são rejeitados',()=>{
 const env=environment();env.storage.setItem('plan',JSON.stringify(plan(['caatinga','unknown','caatinga'],[['msf',1],['unknown',3],['caatinga',-1],['msf',1.2]])));
 assert.deepEqual(create(env).load().state,plan(['caatinga'],[['msf',1]]));
});
test('sem bloqueio entre abas não persiste um snapshot inseguro',async()=>{
 const env=environment(),store=create({...env,lock:null});assert.equal((await store.save(plan(['msf']),null)).status,'unavailable');assert.equal(env.storage.getItem('plan'),null);
});
test('falha de armazenamento é exposta e preserva a revisão anterior',async()=>{
 const env=environment(),store=create(env);env.storage.setItem=()=>{throw Error('quota');};
 await assert.rejects(store.save(plan(['msf']),null),/quota/);assert.equal(store.load().token,null);
});
