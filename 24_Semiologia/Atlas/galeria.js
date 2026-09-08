
(() => {
 "use strict";
 const catalog=window.SEMIO_CATALOG;
 if(!catalog)return;
 const items=catalog.items,byId=new Map(items.map(a=>[a.id,a]));
 const cards=Array.from(document.querySelectorAll(".card"));
 const dialog=document.getElementById("viewer"),search=document.getElementById("busca");
 let filter="all",visible=items.slice(),activeId=null,opener=null;
 const normalize=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 function applyFilter(){
  const query=normalize(search.value.trim());
  visible=items.filter(a=>(filter==="all"||a.group===filter)&&normalize(a.id+" "+a.title+" "+a.section+" "+a.caption).includes(query));
  const ids=new Set(visible.map(a=>a.id));
  cards.forEach(card=>{card.hidden=!ids.has(card.id)});
  document.getElementById("result-count").textContent=visible.length+" "+(visible.length===1?"imagem encontrada":"imagens na coleção");
  document.getElementById("empty").hidden=visible.length>0;
 }
 document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
  filter=button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
  applyFilter();
 }));
 search.addEventListener("input",applyFilter);
 document.getElementById("hide-captions").addEventListener("change",event=>document.body.classList.toggle("hide-captions",event.target.checked));
 function selection(){return visible.some(a=>a.id===activeId)?visible:items}
 function display(id){
  const a=byId.get(id);if(!a)return;
  activeId=id;
  const selected=selection(),index=selected.findIndex(a=>a.id===id);
  document.getElementById("viewer-position").textContent=a.id+" · "+(index+1)+" de "+selected.length;
  const img=document.getElementById("viewer-img");img.src=a.file;img.alt=a.alt;
  document.getElementById("viewer-title").textContent=a.title;
  document.getElementById("viewer-group").textContent=a.group==="Neurologica"?"SEMIOLOGIA NEUROLÓGICA":"SEMIOLOGIA CARDIOVASCULAR";
  document.getElementById("viewer-section").textContent="Inserção sugerida: "+a.section;
  document.getElementById("viewer-caption").textContent=a.caption;
  const download=document.getElementById("viewer-download");download.href=a.file;download.download=a.file.split("/").pop();
  const sourceList=document.getElementById("viewer-sources");sourceList.replaceChildren();
  for(const key of a.references){
   const source=catalog.sources[key],li=document.createElement("li"),link=document.createElement("a");
   link.href=source.url;link.textContent=source.title;link.target="_blank";link.rel="noopener noreferrer";
   li.append(link);sourceList.append(li);
  }
 }
 document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>{
  opener=button;display(button.dataset.open);
  if(typeof dialog.showModal==="function"){dialog.showModal();document.body.style.overflow="hidden"}
  else window.open(byId.get(button.dataset.open).file,"_blank","noopener");
 }));
 function close(){dialog.close()}
 document.getElementById("close-viewer").addEventListener("click",close);
 dialog.addEventListener("close",()=>{document.body.style.overflow="";opener?.focus({preventScroll:true})});
 dialog.addEventListener("click",event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()}});
 function step(delta){const selected=selection(),index=selected.findIndex(a=>a.id===activeId);if(selected.length)display(selected[(index+delta+selected.length)%selected.length].id)}
 document.getElementById("prev").addEventListener("click",()=>step(-1));
 document.getElementById("next").addEventListener("click",()=>step(1));
 dialog.addEventListener("keydown",event=>{if(event.key==="ArrowLeft"){event.preventDefault();step(-1)}if(event.key==="ArrowRight"){event.preventDefault();step(1)}});
 const initial=new URLSearchParams(location.search).get("modulo");
 if(["Neurologica","Cardiovascular"].includes(initial)){filter=initial;document.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.filter===initial)));applyFilter();}
})();

