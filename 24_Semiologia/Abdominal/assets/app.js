(() => {
  'use strict';
  const {course, signs, visuals} = window.ABDOMINAL_DATA;
  const $ = id => document.getElementById(id);
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const key = 'aldenirmed89:abdominal:progress:v1';
  const fresh = () => ({schema:1,module:'semiologia-abdominal',lessons:[],checks:[],cases:{},cards:{}});
  let persistent = true;
  function validate(data) {
    if (!data || data.schema !== 1 || data.module !== 'semiologia-abdominal') throw Error('Arquivo de outro módulo ou versão.');
    const output = fresh();
    for (const [field, records] of [['lessons',course.lessons],['checks',course.checklist]]) {
      if (!Array.isArray(data[field]) || data[field].some(x => !records.some(r => r.id === x))) throw Error('Atividades inválidas.');
      output[field] = [...new Set(data[field])];
    }
    for (const field of ['cases','cards']) if (!data[field] || typeof data[field] !== 'object' || Array.isArray(data[field])) throw Error('Progresso incompleto.');
    for (const [id,value] of Object.entries(data.cases)) {
      const record = course.cases.find(r=>r.id===id);
      if (!record || !Number.isInteger(value) || value<0 || value>=record.options.length) throw Error('Resposta inválida.');
      output.cases[id] = value;
    }
    for (const [id,value] of Object.entries(data.cards)) {
      if (!course.flashcards.some(r=>r.id===id) || !value || !Number.isInteger(value.level) || value.level<0 || value.level>4 || typeof value.due!=='number' || !Number.isFinite(value.due) || value.due<0 || value.due>Date.now()+366*86400000) throw Error('Revisão inválida.');
      output.cards[id] = {level:value.level,due:value.due};
    }
    return output;
  }
  let state = fresh();
  try { const saved=localStorage.getItem(key); if(saved) state=validate(JSON.parse(saved)); localStorage.setItem(key,JSON.stringify(state)); }
  catch(_) { persistent=false; }
  function announce(text) { $('announcement').textContent=text; }
  function save() {
    try { localStorage.setItem(key,JSON.stringify(state)); persistent=true; }
    catch(_) { persistent=false; announce('Armazenamento indisponível. O progresso permanece nesta sessão; use Exportar antes de fechar.'); }
    updateProgress();
  }
  function updateProgress() {
    $('learn-progress').textContent=state.lessons.length+'/'+course.lessons.length;
    $('case-progress').textContent=Object.keys(state.cases).length+'/'+course.cases.length;
    $('check-progress').textContent=state.checks.length+'/'+course.checklist.length;
    document.querySelectorAll('[data-learn]').forEach(el=>el.checked=state.lessons.includes(el.dataset.learn));
    document.querySelectorAll('[data-check]').forEach(el=>el.checked=state.checks.includes(el.dataset.check));
  }
  for (const [attr,field] of [['learn','lessons'],['check','checks']]) {
    document.querySelectorAll('[data-'+attr+']').forEach(el=>el.addEventListener('change',()=>{
      const id=el.dataset[attr]; state[field]=state[field].filter(x=>x!==id);if(el.checked)state[field].push(id);save();
    }));
  }
  updateProgress();
  if(!persistent) announce('Armazenamento indisponível ou progresso anterior incompatível. Use Exportar para guardar esta sessão.');

  function filterSigns() {
    const terms=normalize($('sign-search').value).trim().split(/\s+/).filter(Boolean),category=$('sign-category').value,priority=$('sign-priority').value;
    let count=0;
    signs.forEach(sign=>{
      const corpus=normalize([sign.name,...sign.aliases,sign.category,sign.anatomy,sign.position,sign.positive,sign.mechanism,sign.interpretation,...sign.steps].join(' '));
      const visible=(!category || sign.category===category)&&(!priority || sign.priority===priority)&&terms.every(t=>corpus.includes(t));
      $('sinal-'+sign.id).hidden=!visible;if(visible)count++;
    });
    $('sign-count').textContent=count ? count+' de '+signs.length+' sinais e manobras' : 'Nenhum resultado. Tente outro termo ou remova os filtros.';
  }
  ['sign-search','sign-category','sign-priority'].forEach(id=>$(id).addEventListener(id==='sign-search'?'input':'change',filterSigns));
  function openAnchor() {
    let id;try {id=decodeURIComponent(location.hash.slice(1));} catch(_) {return;}
    const target=$(id);if(!target)return;
    if(target.matches('[data-sign]')) { $('sign-search').value='';$('sign-category').value='';$('sign-priority').value='';filterSigns(); }
    if(target.tagName==='DETAILS')target.open=true;
    for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  }
  window.addEventListener('hashchange',openAnchor);openAnchor();

  function focusPanel(id) {const heading=$(id).querySelector('h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  let tutorIndex=0,tutorStep=0,tutorRevealed=false;
  function renderTutor() {
    const restoreFocus=$('tutor-panel').contains(document.activeElement);
    const tutor=course.tutors[tutorIndex],step=tutor.steps[tutorStep];
    document.querySelectorAll('[data-tutor]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.tutor===tutor.id)));
    $('tutor-panel').innerHTML='<p class="eyebrow">'+escape(tutor.role)+' · etapa '+(tutorStep+1)+'/'+tutor.steps.length+'</p><h3>'+escape(tutor.name)+'</h3><p>'+escape(tutor.goal)+'</p><h3>'+escape(step.question)+'</h3><p class="muted">Formule sua resposta antes de revelar.</p>'+(tutorRevealed?'<div class="flash-answer">'+escape(step.answer)+'</div><div class="note caution"><strong>Erro a evitar:</strong> '+escape(tutor.pitfall)+'</div>':'<button id="tutor-reveal" class="primary">Conferir orientação</button>')+'<div class="actions case-navigation"><button id="tutor-prev" '+(tutorStep===0?'disabled':'')+'>← Etapa anterior</button><button id="tutor-next" '+(!tutorRevealed?'disabled':'')+'>'+(tutorStep===tutor.steps.length-1?'Recomeçar roteiro':'Próxima etapa →')+'</button></div>'+(tutorRevealed&&tutorStep===tutor.steps.length-1?'<div class="note"><strong>Próxima prática:</strong> '+escape(tutor.nextAction)+'</div>':'');
    $('tutor-reveal')?.addEventListener('click',()=>{tutorRevealed=true;renderTutor();$('tutor-next').focus();});
    $('tutor-prev').addEventListener('click',()=>{tutorStep--;tutorRevealed=false;renderTutor();});
    $('tutor-next').addEventListener('click',()=>{tutorStep=(tutorStep+1)%tutor.steps.length;tutorRevealed=false;renderTutor();});
    if(restoreFocus)focusPanel('tutor-panel');
  }
  document.querySelectorAll('[data-tutor]').forEach(el=>el.addEventListener('click',()=>{tutorIndex=course.tutors.findIndex(x=>x.id===el.dataset.tutor);tutorStep=0;tutorRevealed=false;renderTutor();}));renderTutor();

  let caseIndex=0;
  function renderCase() {
    const restoreFocus=$('case-panel').contains(document.activeElement);
    const item=course.cases[caseIndex],selected=state.cases[item.id],answered=Number.isInteger(selected);
    $('case-select').value=String(caseIndex);
    $('case-panel').innerHTML='<p class="eyebrow">Caso '+(caseIndex+1)+' de '+course.cases.length+' · cenário fictício</p><h3>'+escape(item.title)+'</h3><p>'+escape(item.stem)+'</p><h4>'+escape(item.question)+'</h4><div class="quiz-options">'+item.options.map((option,i)=>'<button data-answer="'+i+'" '+(answered?'disabled class="'+(option.correct?'correct':i===selected?'incorrect':'')+'"':'')+'>'+String.fromCharCode(65+i)+'. '+escape(option.text)+(answered&&i===selected?' — sua resposta':'')+'</button>').join('')+'</div>'+(answered?'<div id="case-feedback" tabindex="-1"><p class="eyebrow">'+(item.options[selected].correct?'Resposta correta':'Reveja o raciocínio')+'</p>'+item.options.map((option,i)=>'<div class="option-feedback '+(option.correct?'correct':'')+'"><h4>'+String.fromCharCode(65+i)+'. '+(option.correct?'Correta':'Incorreta')+'</h4><p>'+escape(option.feedback)+'</p></div>').join('')+'<div class="note"><strong>Leve para a prática:</strong> '+escape(item.takeaway)+'</div><p class="source-links">'+item.sources.map(id=>'<a href="#fonte-'+escape(id)+'">Consultar referência</a>').join(' · ')+'</p><button id="case-retry">Responder novamente</button></div>':'')+'<div class="actions case-navigation"><button id="case-prev" '+(caseIndex===0?'disabled':'')+'>← Caso anterior</button><button id="case-next" '+(caseIndex===course.cases.length-1?'disabled':'')+'>Próximo caso →</button></div>';
    document.querySelectorAll('[data-answer]').forEach(el=>el.addEventListener('click',()=>{state.cases[item.id]=Number(el.dataset.answer);save();renderCase();$('case-feedback').focus({preventScroll:true});}));
    $('case-retry')?.addEventListener('click',()=>{delete state.cases[item.id];save();renderCase();});
    $('case-prev').addEventListener('click',()=>{caseIndex--;renderCase();});
    $('case-next').addEventListener('click',()=>{caseIndex++;renderCase();});
    if(restoreFocus)focusPanel('case-panel');
  }
  $('case-select').addEventListener('change',()=>{caseIndex=Number($('case-select').value);renderCase();});renderCase();

  let flashIndex=0,flashRevealed=false,onlyDue=false;
  const deck=()=>course.flashcards.filter(card=>!onlyDue || !state.cards[card.id] || state.cards[card.id].due<=Date.now());
  function renderFlash() {
    const restoreFocus=$('flash-panel').contains(document.activeElement);
    const queue=deck();$('flash-mode').setAttribute('aria-pressed',String(onlyDue));
    if(!queue.length){$('flash-count').textContent='Nenhuma revisão pendente agora';$('flash-panel').innerHTML='<div class="empty-review"><h3>Por hoje, esta fila está em dia.</h3><p>Você pode voltar às técnicas ou desativar o filtro para explorar todos os cartões.</p></div>';if(restoreFocus)focusPanel('flash-panel');return;}
    flashIndex=(flashIndex+queue.length)%queue.length;const card=queue[flashIndex];
    $('flash-count').textContent=(flashIndex+1)+'/'+queue.length+(onlyDue?' pendentes':' cartões');
    $('flash-panel').innerHTML='<p class="eyebrow">'+escape(card.topic)+'</p><h3>'+escape(card.question)+'</h3>'+(flashRevealed?'<div class="flash-answer">'+escape(card.answer)+'</div><div class="actions"><button id="flash-hard">Ainda difícil · retomar em 1 dia</button><button id="flash-good" class="primary">Lembrei · ampliar intervalo</button></div>':'<button id="flash-reveal" class="primary">Revelar explicação</button>')+'<div class="actions case-navigation"><button id="flash-prev">← Anterior</button><button id="flash-next">Pular por enquanto →</button></div>';
    $('flash-reveal')?.addEventListener('click',()=>{flashRevealed=true;renderFlash();$('flash-good').focus();});
    function rate(good){const level=good?Math.min(4,(state.cards[card.id]?.level||0)+1):0;const days=good?[1,1,7,14,30][level]:1;state.cards[card.id]={level,due:Date.now()+days*86400000};save();if(!onlyDue)flashIndex++;flashRevealed=false;renderFlash();announce('Revisão sugerida em '+days+' dia(s).');}
    $('flash-hard')?.addEventListener('click',()=>rate(false));$('flash-good')?.addEventListener('click',()=>rate(true));
    $('flash-prev').addEventListener('click',()=>{flashIndex--;flashRevealed=false;renderFlash();});$('flash-next').addEventListener('click',()=>{flashIndex++;flashRevealed=false;renderFlash();});
    if(restoreFocus)focusPanel('flash-panel');
  }
  $('flash-mode').addEventListener('click',()=>{onlyDue=!onlyDue;flashIndex=0;flashRevealed=false;renderFlash();});renderFlash();

  $('export-progress').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='progresso-semiologia-abdominal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Progresso exportado. Guarde este arquivo para retomar em outro dispositivo.');});
  $('import-progress').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try { if(file.size>100000)throw Error('Arquivo grande demais.');const imported=validate(JSON.parse(await file.text()));state=imported;flashIndex=0;flashRevealed=false;save();renderCase();renderFlash();announce(persistent?'Progresso importado e salvo neste navegador.':'Progresso importado nesta sessão; armazenamento indisponível. Exporte antes de fechar.'); }
    catch(error){announce('Não foi possível importar. '+error.message+' O progresso atual foi preservado.');}
    event.target.value='';
  });
  $('reset-progress').addEventListener('click',()=>{if(!confirm('Recomeçar o progresso abdominal neste navegador? Exporte antes se quiser conservar uma cópia.'))return;state=fresh();flashIndex=0;flashRevealed=false;save();renderCase();renderFlash();announce('Progresso abdominal reiniciado.');});

  let imageIndex=0,lastImageButton=null;
  function renderImage(){const item=visuals[imageIndex];if(!item)return;$('dialog-title').textContent=item.id+' · '+item.title;$('dialog-image').src=item.file;$('dialog-image').alt=item.alt;$('dialog-caption').textContent=item.caption+' '+item.limit;}
  document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{imageIndex=visuals.findIndex(x=>x.id===button.dataset.image);lastImageButton=button;renderImage();$('image-dialog').showModal();$('close-image').focus();}));
  $('close-image').addEventListener('click',()=>$('image-dialog').close());
  $('image-dialog').addEventListener('close',()=>lastImageButton?.focus());
  $('image-prev').addEventListener('click',()=>{imageIndex=(imageIndex-1+visuals.length)%visuals.length;renderImage();});$('image-next').addEventListener('click',()=>{imageIndex=(imageIndex+1)%visuals.length;renderImage();});
  $('image-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){$('image-prev').click();e.preventDefault();}if(e.key==='ArrowRight'){$('image-next').click();e.preventDefault();}});
  $('visual-filter').addEventListener('change',()=>document.querySelectorAll('[data-visual-category]').forEach(el=>el.hidden=!!$('visual-filter').value&&el.dataset.visualCategory!==$('visual-filter').value));
})();
