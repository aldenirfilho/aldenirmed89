
(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('reader-theme'); if(saved){root.dataset.theme=saved;}
  const progress=document.querySelector('.progress');
  const updateProgress=()=>{const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; progress.style.width=(max? (h.scrollTop/max*100):0)+'%'}; document.addEventListener('scroll',updateProgress,{passive:true}); updateProgress();
  document.querySelectorAll('[data-action="theme"]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('reader-theme',root.dataset.theme)}));
  document.querySelectorAll('[data-action="plus"]').forEach(b=>b.addEventListener('click',()=>{const s=parseFloat(getComputedStyle(root).getPropertyValue('--font-size'));root.style.setProperty('--font-size',Math.min(24,s+1)+'px')}));
  document.querySelectorAll('[data-action="minus"]').forEach(b=>b.addEventListener('click',()=>{const s=parseFloat(getComputedStyle(root).getPropertyValue('--font-size'));root.style.setProperty('--font-size',Math.max(15,s-1)+'px')}));
  document.querySelectorAll('[data-action="print"]').forEach(b=>b.addEventListener('click',()=>window.print()));
  const sidebar=document.querySelector('.sidebar'); document.querySelectorAll('[data-action="toc"]').forEach(b=>b.addEventListener('click',()=>sidebar.classList.toggle('open')));
  const links=[...document.querySelectorAll('.toc a')]; const ids=links.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}})},{rootMargin:'-20% 0px -70% 0px'}); ids.forEach(h=>obs.observe(h));
  // transform mermaid code blocks into renderable diagrams if present
  document.querySelectorAll('pre code.language-mermaid, pre.mermaid code').forEach(code=>{const div=document.createElement('div');div.className='mermaid';div.textContent=code.textContent;code.closest('pre').replaceWith(div);});
})();
