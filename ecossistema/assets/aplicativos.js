"use strict";
(() => {
 const input=document.getElementById('app-search'), cards=[...document.querySelectorAll('[data-app]')];
 const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const texts=new Map(cards.map(c=>[c,fold(c.textContent)]));
 function filter(){const q=fold(input.value.trim());let count=0;for(const c of cards){c.hidden=!texts.get(c).includes(q);if(!c.hidden)count++;}document.getElementById('app-count').textContent=`${count} de ${cards.length} registros`;document.getElementById('no-results').hidden=count>0;}
 input.addEventListener('input',filter);document.getElementById('clear-search').addEventListener('click',()=>{input.value='';filter();input.focus();});
})();
