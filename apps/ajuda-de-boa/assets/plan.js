/* Planning only: no wallet records, passwords or attachments are stored here.
   Web Locks serialize writes between tabs; revision conflicts refresh instead of overwriting. */
(function(root){
'use strict';
function create(options){
 const {storage,key,lock,maxCents}=options,ids=new Set(options.ids);
 function normalize(value){return{version:1,
  favorites:[...new Set((Array.isArray(value?.favorites)?value.favorites:[]).filter(id=>typeof id==='string'&&ids.has(id)))],
  cart:[...new Map((Array.isArray(value?.cart)?value.cart:[]).filter(row=>Array.isArray(row)&&row.length===2&&ids.has(row[0])&&Number.isSafeInteger(row[1])&&row[1]>0&&row[1]<=maxCents))]
 };}
 function load(){const token=storage?storage.getItem(key):null;let parsed=null;try{parsed=JSON.parse(token);}catch{}return{state:normalize(parsed?.version===1?parsed:null),token};}
 async function save(value,expected){
  if(!storage||!lock)return{status:'unavailable'};
  return lock(async()=>{
   const latest=load();if(latest.token!==expected)return{status:'conflict',...latest};
   const state=normalize(value),token=JSON.stringify({...state,revision:options.newRevision()});
   storage.setItem(key,token);return{status:'saved',state,token};
  });
 }
 return Object.freeze({load,save});
}
const api=Object.freeze({create});root.BA360_PLAN=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
