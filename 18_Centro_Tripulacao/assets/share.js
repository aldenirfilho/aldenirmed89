(() => {
  'use strict';
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const field=document.getElementById(button.dataset.copy),status=document.getElementById('shareStatus');
    try{await navigator.clipboard.writeText(field.value);status.textContent='Texto copiado. Revise e compartilhe no canal escolhido.';}
    catch(_){field.focus();field.select();status.textContent='Texto selecionado. Pressione ⌘C no Mac ou Ctrl+C para copiar.';}
  }));
})();
