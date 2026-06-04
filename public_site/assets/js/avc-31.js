
document.querySelectorAll('.flash').forEach(c=>c.addEventListener('click',()=>c.classList.toggle('open')));
const search=document.getElementById('searchSections');
if(search){search.addEventListener('input',()=>{const q=search.value.toLowerCase();document.querySelectorAll('.section').forEach(s=>{s.style.display=s.textContent.toLowerCase().includes(q)?'block':'none'});});}
document.getElementById('focusMode')?.addEventListener('click',()=>document.body.classList.toggle('focus'));
