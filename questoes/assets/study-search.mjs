import {TOPICS,filterStudyItems,safeStudyHref} from '../../assets/js/study-search-core.mjs';
const $=id=>document.getElementById(id);
const labels={questao:'Questões TEMI',desafio:'Desafios clínicos',mnemonico:'Mnemônicos'};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let items=[],limit=20;
const params=new URLSearchParams(location.search);
$('study-query').value=params.get('q')||'';
$('study-type').value=Object.hasOwn(labels,params.get('type'))?params.get('type'):'';
$('study-new').checked=params.get('new')==='1';
$('study-topic').insertAdjacentHTML('beforeend',TOPICS.map(t=>`<option value="${t.id}">${t.icon} ${t.label}</option>`).join(''));
if(TOPICS.some(t=>t.id===params.get('topic')))$('study-topic').value=params.get('topic');
function prefs(){try{const p=JSON.parse(localStorage.getItem('antigravity:a11y:v1')||'{}');return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}catch{return {};}}
let currentPrefs=prefs();
function applyTheme(){const p=currentPrefs;const contrast=p.contrast===true;const light=!contrast&&(p.theme==='light'||(p.theme==='system'&&matchMedia('(prefers-color-scheme: light)').matches)||(!['light','dark','system'].includes(p.theme)&&p.clarity===true));document.documentElement.classList.toggle('a11y-light',light);document.documentElement.classList.toggle('a11y-contrast',contrast);document.documentElement.classList.toggle('a11y-large',p.large===true);$('theme-toggle').setAttribute('aria-pressed',String(light));}
applyTheme();
$('theme-toggle').onclick=()=>{const p=prefs(),light=!document.documentElement.classList.contains('a11y-light');currentPrefs={...p,theme:light?'light':'dark',clarity:light,contrast:false};try{localStorage.setItem('antigravity:a11y:v1',JSON.stringify(currentPrefs));}catch{}applyTheme();};
window.addEventListener('storage',e=>{if(e.key==='antigravity:a11y:v1'){currentPrefs=prefs();applyTheme();}});
function render(sync=true){
 const filters={query:$('study-query').value,topic:$('study-topic').value,type:$('study-type').value,onlyNew:$('study-new').checked};
 const found=filterStudyItems(items,filters).sort((a,b)=>Number(b.isNew)-Number(a.isNew));
 $('study-status').textContent=`${found.length} de ${items.length} itens · mostrando ${Math.min(limit,found.length)}. Escolha um resultado para estudar.`;
 $('study-counts').innerHTML=Object.entries(labels).map(([type,label])=>`<span>${found.filter(i=>i.type===type).length} ${label.toLowerCase()}</span>`).join('');
 $('study-results').innerHTML=found.slice(0,limit).map(item=>{const href=safeStudyHref(item.href);if(!href)return '';const topics=item.topicIds.map(id=>TOPICS.find(t=>t.id===id)?.label).filter(Boolean).join(' · ');return `<article class="result-card" role="listitem"><div class="result-meta"><span class="type-label">${esc(labels[item.type])}</span>${item.isNew?'<span class="new-label">Novo · novembro 2026</span>':''}</div><h3>${esc(item.title)}</h3><p>${esc(item.excerpt.slice(0,260))}${item.excerpt.length>260?'…':''}</p><div class="result-meta">${esc(topics||item.category)}${item.subtopic?' · '+esc(item.subtopic):''}</div><div class="result-meta">${item.reviewStatus==='revisao-medica-pendente'?'Revisão médica pendente':'Confira o estado de revisão na fonte'}</div><a href="${esc(href)}" aria-label="Abrir ${esc(labels[item.type])}: ${esc(item.title)}">Abrir ${item.type==='questao'?'questão':item.type==='desafio'?'desafio':'mnemônico'} →<span class="sr-only"></span></a></article>`;}).join('');
 $('study-empty').hidden=found.length>0;$('study-more').hidden=limit>=found.length;
 $('study-results').setAttribute('aria-busy','false');
 if(sync){const q=new URLSearchParams();if(filters.query)q.set('q',filters.query);if(filters.topic)q.set('topic',filters.topic);if(filters.type)q.set('type',filters.type);if(filters.onlyNew)q.set('new','1');history.replaceState(null,'',location.pathname+(q.size?'?'+q:''));}
}
async function load(){try{$('study-status').textContent='Carregando o acervo…';const response=await fetch('../data/study-search.json?v=20261102');if(!response.ok)throw Error('HTTP');const data=await response.json();if(!Array.isArray(data.items))throw Error('Índice');items=data.items;$('study-retry').hidden=true;render(false);}catch{$('study-status').textContent='Não foi possível carregar a busca. Tente novamente ou abra uma seção pelos links acima.';$('study-results').setAttribute('aria-busy','false');$('study-retry').hidden=false;}}
$('search-form').onsubmit=e=>{e.preventDefault();limit=20;render();};
for(const id of ['study-query','study-topic','study-type','study-new'])$(id).addEventListener(id==='study-query'?'input':'change',()=>{limit=20;render();});
$('study-clear').onclick=()=>{$('search-form').reset();limit=20;render();$('study-query').focus();};
$('study-more').onclick=()=>{limit+=20;render();};$('study-retry').onclick=load;
load();
