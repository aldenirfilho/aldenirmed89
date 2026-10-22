
(()=>{
'use strict';
const $ = s => document.querySelector(s);
const galleryData=JSON.parse($('#gallery-data').textContent);
const theme=$('#theme');
try { if(localStorage.getItem('smd4-theme')==='dark') document.documentElement.classList.add('dark'); } catch(e){}
theme.addEventListener('click',()=>{document.documentElement.classList.toggle('dark');try{localStorage.setItem('smd4-theme',document.documentElement.classList.contains('dark')?'dark':'light')}catch(e){}});
const chapters=[...document.querySelectorAll('.chapter')];
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
$('#search').addEventListener('input',e=>{const q=normalize(e.target.value.trim());let count=0;chapters.forEach(el=>{const show=!q||normalize(el.textContent).includes(q);el.hidden=!show;if(q&&show)el.open=true;count+=show?1:0});$('#search-status').textContent=q?`${count} seções correspondem à busca.`:'30 seções: 23 capítulos, anexos, glossário, referências e encerramento.'});
$('#open-all').addEventListener('click',()=>chapters.forEach(e=>{if(!e.hidden)e.open=true}));
$('#close-all').addEventListener('click',()=>chapters.forEach(e=>e.open=false));
$('#large-text').addEventListener('click',()=>{const on=document.body.classList.toggle('read-large');$('#large-text').setAttribute('aria-pressed',on)});
function revealHash(){if(!location.hash)return;const node=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!node)return;const detail=node.closest('details');if(detail){detail.hidden=false;detail.open=true;}if(node.tagName==='DETAILS'){node.hidden=false;node.open=true;}}
window.addEventListener('hashchange',revealHash);revealHash();
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const dest=document.getElementById(a.getAttribute('href').slice(1));if(dest){const d=dest.closest('details');if(d){d.hidden=false;d.open=true;}if(dest.tagName==='DETAILS'){dest.hidden=false;dest.open=true;}}}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.filter;let count=0;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b===button));document.querySelectorAll('.gallery-card').forEach(card=>{card.hidden=value!=='all'&&card.dataset.group!==value;if(!card.hidden)count++;});$('#gallery-status').textContent=`${count} painéis exibidos. Clique em uma imagem para ampliar e ler a nota editorial.`;}));
const dialog=$('#image-dialog');let opener=null;
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{const item=galleryData.find(x=>x.id===button.dataset.image);opener=button;$('#dialog-title').textContent=item.title;$('#dialog-image').src=item.image;$('#dialog-image').alt=`Painel histórico: ${item.title}`;$('#dialog-note').textContent=item.note;$('#dialog-original').href=item.image;dialog.showModal();}));
$('#dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(opener)opener.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function calculate(){let total=0;document.querySelectorAll('[data-weight]').forEach(input=>{const value=Number(input.value);total+=value*Number(input.dataset.weight)/100;input.nextElementSibling.value=String(value);input.nextElementSibling.textContent=String(value)});let p=Number($('#penalties').value);if(!Number.isFinite(p))p=0;p=Math.min(100,Math.max(0,p));const score=Math.min(100,Math.max(0,total-p));$('#ned').textContent=score.toFixed(2).replace('.',',');$('#score-state').textContent=$('#critical').checked?'Selo suspenso neste cenário: requisito crítico não atendido. A média não compensa violação grave.':'Resultado fictício, sem classificação de empresa real e sem direito a subsídio.';}
document.querySelectorAll('[data-weight],#penalties,#critical').forEach(e=>e.addEventListener('input',calculate));calculate();
$('#reset-score').addEventListener('click',()=>{document.querySelectorAll('[data-weight]').forEach(e=>e.value='80');$('#penalties').value='0';$('#critical').checked=false;calculate();});
})();
