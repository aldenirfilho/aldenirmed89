(() => {
  'use strict';
  const D = window.SEMIO_CARDIO;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const KEY = 'aldenirmed89:semiologia-cardio:v1';
  const FORMAT = 'aldenirmed89-semiologia-cardio-v1';
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
  const object = v => v && typeof v === 'object' && !Array.isArray(v);
  const integer = (v,min,max) => Number.isInteger(v) && v>=min && v<=max;
  const DAY=86400000;
  const soundById = new Map(D.sounds.map(x=>[x.id,x]));
  const audioById = new Map(D.audio.map(x=>[x.id,x]));
  const sourceById = new Map(D.sources.map(x=>[x.id,x]));
  const anchors = new Set([...document.querySelectorAll('[id]')].map(x=>x.id));
  const defaultState = () => ({lessons:{},caseAnswers:{},caseIndex:0,cards:{},checklist:[],selectedSound:'normal',lastSection:'aprender',listened:[],blindAttempts:0,blindCorrect:0});
  function normalizeState(input) {
    const s=defaultState(); if(!object(input)) return s;
    for(const lesson of D.lessons) if(object(input.lessons) && own(input.lessons,lesson.id) && input.lessons[lesson.id]===true) s.lessons[lesson.id]=true;
    for(const q of D.cases) if(object(input.caseAnswers) && own(input.caseAnswers,q.id) && integer(input.caseAnswers[q.id],0,q.options.length-1)) s.caseAnswers[q.id]=input.caseAnswers[q.id];
    if(integer(input.caseIndex,0,D.cases.length-1)) s.caseIndex=input.caseIndex;
    for(const card of D.flashcards) {
      const item=object(input.cards)&&own(input.cards,card.id)?input.cards[card.id]:null;
      if(object(item) && integer(item.level,0,4) && Number.isFinite(item.due) && item.due>=0 && item.due<Date.now()+3660*DAY) s.cards[card.id]={level:item.level,due:item.due};
    }
    if(Array.isArray(input.checklist)) s.checklist=[...new Set(input.checklist.filter(i=>integer(i,0,D.checklist.length-1)))];
    if(audioById.has(input.selectedSound)) s.selectedSound=input.selectedSound;
    if(anchors.has(input.lastSection)) s.lastSection=input.lastSection;
    if(Array.isArray(input.listened)) s.listened=[...new Set(input.listened.filter(i=>audioById.has(i)))];
    if(integer(input.blindAttempts,0,100000)) s.blindAttempts=input.blindAttempts;
    if(integer(input.blindCorrect,0,s.blindAttempts)) s.blindCorrect=input.blindCorrect;
    return s;
  }
  let storageOK=true;
  let state;
  try {state=normalizeState(JSON.parse(localStorage.getItem(KEY)||'{}'));} catch(_) {state=defaultState();storageOK=false;}
  function announce(message){$('announcement').textContent=message;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){storageOK=false;announce('O navegador não permitiu salvar. O módulo continua funcionando; exporte o progresso antes de sair.');}}
  function references(ids){return '<div class="source-links">'+(ids||[]).map(id=>{const s=sourceById.get(id);return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`:'';}).join('')+'</div>';}
  function updateProgress(){
    const answers=Object.keys(state.caseAnswers).length;
    const correct=D.cases.filter(q=>state.caseAnswers[q.id]===q.correct).length;
    const studied=Object.keys(state.lessons).length;
    const cards=Object.keys(state.cards).length;
    $('progress-summary').innerHTML=`<div><strong>${studied} / ${D.lessons.length}</strong><span>passos marcados como revistos</span></div><div><strong>${answers} / ${D.cases.length}</strong><span>casos respondidos · ${correct} acertos</span></div><div><strong>${cards} / ${D.flashcards.length}</strong><span>cartões com revisão registrada</span></div>`;
    $('resume-link').href='#'+state.lastSection;
    $('resume-link').textContent=studied||answers||cards?'Retomar meu estudo →':'Começar pelo exame';
    $('checklist-count').textContent=`${state.checklist.length} de ${D.checklist.length} etapas marcadas`;
  }
  document.querySelectorAll('[data-lesson]').forEach(box=>{
    box.checked=state.lessons[box.dataset.lesson]===true;
    box.addEventListener('change',()=>{if(box.checked)state.lessons[box.dataset.lesson]=true;else delete state.lessons[box.dataset.lesson];state.lastSection=box.dataset.lesson;save();updateProgress();});
  });
  $('expand-lessons').addEventListener('click',()=>{
    const open=$('expand-lessons').getAttribute('aria-expanded')!=='true';
    document.querySelectorAll('.lesson-details').forEach(el=>el.open=open);
    $('expand-lessons').setAttribute('aria-expanded',String(open));$('expand-lessons').textContent=open?'Recolher leitura':'Expandir leitura';
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link)return;
    const id=link.getAttribute('href').slice(1);if(anchors.has(id)){state.lastSection=id;save();}
  });

  // Search returns destinations without hiding clinical content or breaking anchors.
  const searchIndex=[...D.lessons.map(x=>({title:x.title,text:[x.lead,...x.blocks.map(b=>b.title+' '+b.text)].join(' '),target:x.id})),
    ...D.sounds.map(x=>({title:x.title,text:[x.listen,x.mechanism,x.focus,x.pitfall].join(' '),target:'laboratorio',sound:x.id})),
    ...D.syndromes.map(x=>({title:x.title,text:x.findings.join(' ')+' '+x.mechanism,target:'syndrome-'+x.id})),
    ...D.cases.map((x,index)=>({title:'Caso: '+x.title,text:x.stem,target:'casos',caseIndex:index}))];
  $('course-search').addEventListener('input',()=>{
    const query=norm($('course-search').value.trim());
    if(query.length<2){$('search-results').replaceChildren();return;}
    const matches=searchIndex.filter(x=>norm(x.title+' '+x.text).includes(query)).slice(0,10);
    $('search-results').innerHTML=matches.length?matches.map(x=>`<a href="#${esc(x.target)}" ${x.sound?`data-open-sound="${esc(x.sound)}"`:''} ${x.caseIndex!==undefined?`data-open-case="${x.caseIndex}"`:''}>${esc(x.title)}</a>`).join(''):'<p class="muted">Nenhum resultado. Tente um achado, como jugular, diastólico ou B3.</p>';
  });
  $('search-results').addEventListener('click',e=>{
    const a=e.target.closest('a');if(!a)return;
    if(a.dataset.openSound) selectSound(a.dataset.openSound);
    if(a.dataset.openCase!==undefined){state.caseIndex=Number(a.dataset.openCase);save();renderCase();}
    const target=document.getElementById(a.hash.slice(1));if(target?.tagName==='DETAILS')target.open=true;
    if(target?.classList.contains('lesson')) target.querySelector('.lesson-details').open=true;
  });

  // The audio is fetched as a complete local file before assigning a Blob URL.
  // This also avoids platform-specific Range requests for these short examples.
  const player=$('audio-player'), canvas=$('waveform'), ctx=canvas.getContext('2d');
  player.volume=.35;
  let selected=state.selectedSound,filter='Todos',loadToken=0,blobURL=null,signal=null,signalDuration=0,animation=0,blind=null;
  const titles=new Map([...D.sounds,...D.recordings].map(x=>[x.id,x.title]));
  function pcmWave(buffer){
    const v=new DataView(buffer);const str=(p,n)=>String.fromCharCode(...new Uint8Array(buffer,p,n));
    if(buffer.byteLength<44||str(0,4)!=='RIFF'||str(8,4)!=='WAVE')return null;
    let channels=0,rate=0,bits=0,format=0,start=0,length=0;
    for(let p=12;p+8<=v.byteLength;){const id=str(p,4),size=v.getUint32(p+4,true);if(p+8+size>v.byteLength)break;
      if(id==='fmt '&&size>=16){format=v.getUint16(p+8,true);channels=v.getUint16(p+10,true);rate=v.getUint32(p+12,true);bits=v.getUint16(p+22,true);}
      if(id==='data'){start=p+8;length=size;}p+=8+size+(size%2);
    }
    if(format!==1||bits!==16||!channels||!rate||!length)return null;
    const count=Math.floor(length/(2*channels)),samples=new Float32Array(count);
    for(let i=0;i<count;i++){let sum=0;for(let c=0;c<channels;c++)sum+=v.getInt16(start+(i*channels+c)*2,true)/32768;samples[i]=sum/channels;}
    return {samples,duration:count/rate};
  }
  function drawWave(){
    const width=Math.max(220,Math.round(canvas.getBoundingClientRect().width)),height=160,dpr=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==width*dpr){canvas.width=width*dpr;canvas.height=height*dpr;}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#05101d';ctx.fillRect(0,0,width,height);
    ctx.strokeStyle='#24465a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,80);ctx.lineTo(width,80);ctx.stroke();
    if(!signal)return;
    ctx.strokeStyle='#65deeb';ctx.beginPath();
    const stride=signal.length/width;
    for(let x=0;x<width;x++){let min=0,max=0;const end=Math.min(signal.length,Math.ceil((x+1)*stride));for(let i=Math.floor(x*stride);i<end;i++){min=Math.min(min,signal[i]);max=Math.max(max,signal[i]);}ctx.moveTo(x,80-min*74);ctx.lineTo(x,80-max*74);}
    ctx.stroke();
    const meta=audioById.get(selected);
    if(meta?.kind==='simulation'&&!blind){
      ctx.fillStyle='#ffc979';ctx.font='10px sans-serif';
      for(const [phase,label] of [[.06,'B1'],[.43,'B2']]){const x=phase*(60/meta.bpm)/signalDuration*width;ctx.fillText(label,Math.max(2,x),15);ctx.strokeStyle='#7d6747';ctx.beginPath();ctx.moveTo(x,23);ctx.lineTo(x,145);ctx.stroke();}
    }
    const cursor=player.currentTime/(player.duration||signalDuration)*width;
    if(Number.isFinite(cursor)){ctx.strokeStyle='#ffcd8e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cursor,22);ctx.lineTo(cursor,155);ctx.stroke();}
  }
  function tick(){drawWave();if(!player.paused&&!player.ended&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('a11y-reduce-motion'))animation=requestAnimationFrame(tick);}
  player.addEventListener('play',()=>{cancelAnimationFrame(animation);tick();if(!state.listened.includes(selected)){state.listened.push(selected);save();}});
  ['pause','ended','seeked','loadedmetadata'].forEach(event=>player.addEventListener(event,()=>{cancelAnimationFrame(animation);drawWave();}));
  player.addEventListener('error',()=>{$('audio-status').textContent='Não foi possível reproduzir este áudio. Tente selecionar novamente com conexão; as explicações continuam disponíveis.';});
  if('ResizeObserver' in window)new ResizeObserver(drawWave).observe(canvas);
  $('audio-speed').addEventListener('change',()=>{player.playbackRate=Number($('audio-speed').value);player.preservesPitch=false;player.webkitPreservesPitch=false;});
  $('audio-loop').addEventListener('change',()=>{player.loop=$('audio-loop').checked;});
  $('stop-audio').addEventListener('click',()=>{player.pause();if(Number.isFinite(player.duration))player.currentTime=0;drawWave();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)player.pause();});
  window.addEventListener('pagehide',()=>player.pause());
  function renderCatalog(){
    const query=norm($('sound-search').value);
    const list=[...D.sounds,...D.recordings].filter(x=>(filter==='Todos'||(filter==='Gravações reais'?x.kind==='recording':x.group===filter))&&norm(x.title+' '+(x.focus||'')).includes(query));
    $('sound-catalog').innerHTML=list.length?list.map(x=>`<button type="button" class="sound-item" data-sound="${esc(x.id)}" aria-current="${x.id===selected&&!blind}">${esc(x.title)}<small>${x.kind==='recording'?'Gravação clínica · pediatria':esc(x.group)+' · simulação'}</small></button>`).join(''):'<p class="muted">Nenhum som com este filtro.</p>';
  }
  const groups=['Todos','Bulhas','Sistólicos','Diastólicos','Contínuos','Atrito e outros','Gravações reais'];
  $('audio-filters').innerHTML=groups.map(g=>`<button type="button" data-filter="${esc(g)}" aria-pressed="${g===filter}">${esc(g)}</button>`).join('');
  $('audio-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCatalog();});
  $('sound-search').addEventListener('input',renderCatalog);
  $('sound-catalog').addEventListener('click',e=>{const b=e.target.closest('[data-sound]');if(b)selectSound(b.dataset.sound);});
  function detail(label,text){return `<div class="detail-row"><b>${esc(label)}</b><p>${esc(text)}</p></div>`;}
  async function selectSound(id,hidden=false){
    if(!audioById.has(id))return;
    if(!hidden){blind=null;$('blind-panel').hidden=true;}
    selected=id;state.selectedSound=id;save();const meta=audioById.get(id),item=soundById.get(id)||meta;
    player.pause();player.removeAttribute('src');player.load();signal=null;drawWave();
    if(blobURL){URL.revokeObjectURL(blobURL);blobURL=null;}
    $('sound-kind').textContent=hidden?'Simulação didática · exemplo oculto':meta.kind==='recording'?'Gravação clínica real · pediatria':'Simulação didática original';
    $('sound-title').textContent=hidden?'Exemplo oculto · localize B1 e B2':item.title;
    $('sound-listen').textContent=hidden?'Ouça e identifique o padrão temporal. Depois responda no treino auditivo.':(item.listen||'Trecho original publicado pelos autores. Use repetição para comparar ciclos; não extrapole este exemplo para todos os pacientes.');
    $('sound-details').hidden=hidden;
    document.querySelector('.comparison').hidden=hidden;
    if(!hidden){
      if(meta.kind==='recording'){
        const related={'real-still':'still','real-prolapso':'mvp','real-aortica':'as','real-pulmonar':'ps','real-civ':'vsd'}[id];
        $('sound-details').innerHTML=detail('Origem e população',meta.population)+detail('Autoria',meta.authors+' · '+meta.year)+detail('Limites',meta.changes)+`<p><a href="${esc(meta.article)}" target="_blank" rel="noopener">Artigo e suplementos originais</a> · <a href="${esc(meta.licenseUrl)}" target="_blank" rel="noopener">${esc(meta.license)}</a></p><button type="button" data-related-sound="${related}">Comparar com a simulação explicada</button>`;
      }else $('sound-details').innerHTML=detail('Onde e como ouvir',item.focus+' · '+item.exam)+detail('Mecanismo',item.mechanism)+detail('Manobra e contexto',item.maneuver)+`<div class="note caution"><strong>Armadilha</strong><p>${esc(item.pitfall)}</p></div>`+references(item.sources);
    }
    $('wave-caption').textContent=hidden?'O traçado não recebe pistas de diagnóstico.':meta.kind==='recording'?'Amplitude relativa do trecho original. Sem marcação automática de B1/B2.':'Amplitude relativa. B1/B2 marcadas no primeiro ciclo da simulação; ritmo basal de 72 bpm.';
    $('audio-status').textContent='Carregando o áudio…';renderCatalog();
    const token=++loadToken;
    try{
      const response=await fetch(meta.file);if(!response.ok)throw Error('HTTP '+response.status);
      const buffer=await response.arrayBuffer();if(token!==loadToken)return;
      const wave=pcmWave(buffer);signal=wave?.samples||null;signalDuration=wave?.duration||meta.duration;
      blobURL=URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));player.src=blobURL;
      player.playbackRate=Number($('audio-speed').value);player.preservesPitch=false;player.webkitPreservesPitch=false;
      $('audio-status').textContent=`✓ Áudio pronto · ${meta.duration.toFixed(1).replace('.',',')} s · pressione reproduzir`;
      drawWave();
    }catch(_){if(token===loadToken)$('audio-status').textContent='Áudio indisponível. Reabra com conexão para concluir o salvamento offline e tente novamente.';}
  }
  $('sound-details').addEventListener('click',e=>{const b=e.target.closest('[data-related-sound]');if(b)selectSound(b.dataset.relatedSound);});
  const options=[...D.sounds,...D.recordings].map(x=>`<option value="${esc(x.id)}">${esc(x.title)}</option>`).join('');
  $('compare-a').innerHTML=options;$('compare-b').innerHTML=options;$('compare-a').value='normal';$('compare-b').value='s3';
  $('play-a').addEventListener('click',()=>selectSound($('compare-a').value));$('play-b').addEventListener('click',()=>selectSound($('compare-b').value));
  const timingLabels={normal:'B1/B2 sem som adicional no modelo',extra:'Bulha extra, desdobramento, clique ou atrito',systolic:'Sopro sistólico',diastolic:'Sopro diastólico',continuous:'Sopro / ruído contínuo'};
  $('start-blind').addEventListener('click',()=>{
    const pool=D.sounds.filter(x=>x.id!==selected);const item=pool[Math.floor(Math.random()*pool.length)];
    blind={id:item.id,answered:false};selectSound(item.id,true);$('blind-panel').hidden=false;$('blind-feedback').hidden=true;
    $('blind-options').innerHTML=Object.entries(timingLabels).map(([id,label])=>`<button type="button" data-timing="${id}">${esc(label)}</button>`).join('');
    $('sound-title').scrollIntoView({block:'center',behavior:'auto'});
  });
  $('blind-options').addEventListener('click',e=>{
    const b=e.target.closest('[data-timing]');if(!b||!blind||blind.answered)return;
    blind.answered=true;const item=soundById.get(blind.id),correct=b.dataset.timing===item.timing;state.blindAttempts++;if(correct)state.blindCorrect++;save();
    $('blind-options').querySelectorAll('button').forEach(x=>{x.disabled=true;x.classList.toggle('answer-good',x.dataset.timing===item.timing);});
    if(!correct)b.classList.add('answer-bad');
    $('blind-feedback').hidden=false;$('blind-feedback').innerHTML=`<strong>${correct?'Você localizou o padrão.':'Compare o tempo antes de nomear a lesão.'}</strong><p>${esc(item.title)} · ${esc(timingLabels[item.timing])}</p><p>${esc(item.listen)}</p><p>${esc(item.pitfall)}</p><button type="button" id="reveal-sound">Abrir a explicação completa</button><small>${state.blindCorrect} acertos em ${state.blindAttempts} exercícios auditivos neste navegador.</small>`;
    $('reveal-sound').addEventListener('click',()=>selectSound(item.id));
  });

  const focuses={
    aortico:{title:'Foco aórtico',location:'2º espaço intercostal direito, junto ao esterno.',text:'Bom ponto de partida para sopro ejetivo aórtico. Explore irradiação cervical e correlacione com pulso e ictus. O foco não determina sozinho a válvula responsável.',sound:'as'},
    pulmonar:{title:'Foco pulmonar',location:'2º espaço intercostal esquerdo, paraesternal.',text:'Favorece avaliação de P2, desdobramento de B2 e sopros ejetivos pulmonares. Diferencie obstrução de aumento de fluxo, como na CIA.',sound:'phys-split'},
    erb:{title:'Foco de Erb',location:'3º espaço intercostal esquerdo, paraesternal.',text:'Janela útil para insuficiência aórtica. Percorra a borda esternal, com diafragma e posição tolerada; não é a posição anatômica da válvula aórtica.',sound:'ar'},
    tricuspide:{title:'Área tricúspide',location:'Borda esternal esquerda inferior, aproximadamente 4º–5º espaços.',text:'Compare som com inspiração, jugular e pulsação hepática. Insuficiência tricúspide e CIV podem compartilhar região acústica.',sound:'tr'},
    mitral:{title:'Foco mitral / ápice',location:'Região do ictus, habitualmente próxima ao 5º espaço esquerdo e linha hemiclavicular no adulto.',text:'Procure B1, insuficiência mitral e sons graves. Decúbito lateral esquerdo e campânula leve ajudam B3, B4 e ruflar mitral; explore irradiação.',sound:'ms'}
  };
  function selectFocus(id){const f=focuses[id];if(!f)return;document.querySelectorAll('[data-focus]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.focus===id)));$('focus-info').innerHTML=`<h3>${f.title}</h3><p class="lead">${f.location}</p><p>${f.text}</p><a class="button" href="#laboratorio" data-focus-sound="${f.sound}">Ouvir um exemplo</a>`;}
  $('focus-buttons').innerHTML=Object.entries(focuses).map(([id,f])=>`<button type="button" data-focus="${id}" aria-pressed="${id==='aortico'}">${f.title}</button>`).join('');
  document.querySelectorAll('[data-focus]').forEach(el=>{el.addEventListener('click',()=>selectFocus(el.dataset.focus));if(el.tagName.toLowerCase()==='g')el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectFocus(el.dataset.focus);}});});
  $('focus-info').addEventListener('click',e=>{const a=e.target.closest('[data-focus-sound]');if(a)selectSound(a.dataset.focusSound);});selectFocus('aortico');
  const maneuvers={inspiration:'Inspiração',valsalva:'Valsalva · esforço',squat:'Agachar',handgrip:'Preensão manual'};
  const responses={
    as:['Pode haver pouca mudança; não é um padrão de acentuação direita.','Costuma diminuir com a redução de retorno venoso.','Pode aumentar com maior retorno e fluxo; depende das condições de carga.','Pode diminuir ou mudar pouco; resposta não é um teste isolado.'],
    hcm:['Resposta variável; a inspiração não é o principal discriminador.','Pode aumentar: o ventrículo menor favorece obstrução dinâmica.','Costuma diminuir: maior enchimento e resistência tendem a reduzir a obstrução.','Frequentemente diminui com maior pós-carga; há variação individual.'],
    mr:['Geralmente não apresenta a acentuação inspiratória direita típica.','Muitos sopros diminuem com menor retorno; a causa da regurgitação modifica a resposta.','Pode aumentar com retorno e pós-carga, conforme o mecanismo.','Pode aumentar pela elevação da pós-carga e da regurgitação.'],
    tr:['Pode aumentar: sinal de Rivero-Carvallo, em respiração espontânea.','Tende a diminuir durante o esforço, pela redução de retorno.','Pode aumentar com maior enchimento; resposta é variável.','Resposta menos útil e variável; priorize inspiração, jugular e contexto.'],
    mvp:['Resposta variável; acompanhe o clique com o ciclo cardíaco.','Clique tende a antecipar e o sopro a ficar mais longo.','Clique tende a atrasar e o sopro a encurtar.','Pode modificar a regurgitação; o comportamento depende da anatomia e das cargas.'],
    ar:['A expiração confortável e inclinar o tronco podem facilitar a transmissão.','Pode diminuir com menor retorno/fluxo; não define gravidade.','Pode aumentar com elevação da resistência sistêmica.','Pode aumentar com maior pós-carga.'],
    ms:['Posição lateral e campânula leve são mais úteis que uma regra respiratória isolada.','A redução de retorno pode atenuar o ruflar.','Mudanças de fluxo podem modificar o sopro; não provocar esforço em sintomáticos.','Resposta variável; localização, estalido e ritmo são mais informativos.']
  };
  let maneuver='inspiration';
  $('maneuver-lesion').innerHTML=Object.keys(responses).map(id=>`<option value="${id}">${esc(soundById.get(id).title)}</option>`).join('');
  $('maneuver-buttons').innerHTML=Object.entries(maneuvers).map(([id,name])=>`<button type="button" data-maneuver="${id}" aria-pressed="${id===maneuver}">${name}</button>`).join('');
  function showManeuver(){const id=$('maneuver-lesion').value,index=Object.keys(maneuvers).indexOf(maneuver);$('maneuver-result').innerHTML=`<strong>${esc(maneuvers[maneuver])}</strong><p>${esc(responses[id][index])}</p>`+references(soundById.get(id).sources);}
  $('maneuver-lesion').addEventListener('change',showManeuver);$('maneuver-buttons').addEventListener('click',e=>{const b=e.target.closest('[data-maneuver]');if(!b)return;maneuver=b.dataset.maneuver;document.querySelectorAll('[data-maneuver]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));showManeuver();});showManeuver();

  function renderCase(){
    const q=D.cases[state.caseIndex],answered=own(state.caseAnswers,q.id),choice=state.caseAnswers[q.id];
    $('quiz-position').textContent=`Caso ${state.caseIndex+1} de ${D.cases.length}`;$('case-select').value=String(state.caseIndex);
    $('quiz-title').textContent=q.title;$('quiz-stem').textContent=q.stem;
    $('quiz-options').innerHTML=q.options.map((o,i)=>`<button type="button" data-answer="${i}" ${answered?'disabled':''} class="${answered&&i===q.correct?'answer-good':''} ${answered&&i===choice&&i!==q.correct?'answer-bad':''}"><b>${String.fromCharCode(65+i)}</b><span>${esc(o[0])}</span></button>`).join('');
    $('quiz-feedback').innerHTML=answered?`<div class="feedback"><strong>${choice===q.correct?'Resposta correta.':'Vamos refazer o raciocínio.'} Gabarito: ${String.fromCharCode(65+q.correct)}.</strong>${q.options.map((o,i)=>`<div class="option-comment"><b>${String.fromCharCode(65+i)} · ${i===q.correct?'Correta':'Incorreta'}</b><p>${esc(o[1])}</p></div>`).join('')}<div class="note"><b>Regra para a prática</b><p>${esc(q.rule)}</p></div><a href="#${esc(q.lesson)}">Rever a base clínica</a>${q.sound?` · <a href="#laboratorio" data-case-sound="${q.sound}">Comparar o som</a>`:''}${references(q.sources)}</div>`:'';
    const n=Object.keys(state.caseAnswers).length,correct=D.cases.filter(c=>state.caseAnswers[c.id]===c.correct).length;
    $('quiz-score').textContent=`${n} respondidos · ${correct} acertos`;updateProgress();
  }
  $('case-select').innerHTML=D.cases.map((q,i)=>`<option value="${i}">${i+1}. ${esc(q.title)}</option>`).join('');
  $('case-select').addEventListener('change',()=>{state.caseIndex=Number($('case-select').value);save();renderCase();});
  $('quiz-options').addEventListener('click',e=>{const b=e.target.closest('[data-answer]'),q=D.cases[state.caseIndex];if(!b||own(state.caseAnswers,q.id))return;state.caseAnswers[q.id]=Number(b.dataset.answer);state.lastSection='casos';save();renderCase();});
  $('quiz-feedback').addEventListener('click',e=>{const a=e.target.closest('[data-case-sound]');if(a)selectSound(a.dataset.caseSound);});
  function moveCase(step){state.caseIndex=(state.caseIndex+step+D.cases.length)%D.cases.length;save();renderCase();}
  $('quiz-next').addEventListener('click',()=>moveCase(1));$('quiz-prev').addEventListener('click',()=>moveCase(-1));
  $('quiz-reset').addEventListener('click',()=>{if(!confirm('Recomeçar apenas os 20 casos? Flashcards, leitura e checklist serão preservados.'))return;state.caseAnswers={};state.caseIndex=0;save();renderCase();});

  let freeFlash=false,flashIndex=0,currentCard=null,revealed=false;
  function flashQueue(){return D.flashcards.filter(c=>freeFlash||!state.cards[c.id]||state.cards[c.id].due<=Date.now()).sort((a,b)=>(state.cards[a.id]?.due||0)-(state.cards[b.id]?.due||0));}
  function renderFlash(){
    const queue=flashQueue();revealed=false;$('flash-answer').hidden=true;$('flash-again').disabled=true;$('flash-known').disabled=true;
    if(!queue.length){currentCard=null;$('flash-question').textContent='Tudo em dia nesta fila. Você pode descansar ou treinar livremente.';$('flash-position').textContent='Nenhum cartão vencido agora';$('flash-reveal').disabled=true;$('flash-skip').disabled=true;return;}
    flashIndex%=queue.length;currentCard=queue[flashIndex];$('flash-position').textContent=`${freeFlash?'Treino livre':'Revisão disponível'} · ${flashIndex+1} / ${queue.length}`;
    $('flash-question').textContent=currentCard.question;$('flash-answer').textContent=currentCard.answer;$('flash-reveal').disabled=false;$('flash-skip').disabled=false;
  }
  $('flash-reveal').addEventListener('click',()=>{if(!currentCard)return;revealed=true;$('flash-answer').hidden=false;$('flash-again').disabled=false;$('flash-known').disabled=false;});
  function rateFlash(known){
    if(!currentCard||!revealed)return;
    const old=state.cards[currentCard.id]?.level||0,level=known?Math.min(4,old+1):0,delay=known?[1,7,14,30][level-1]*DAY:10*60000;
    state.cards[currentCard.id]={level,due:Date.now()+delay};state.lastSection='revisao';
    $('flash-status').textContent=known?`Revisão registrada. Próxima sugestão: ${[1,7,14,30][level-1]} dia(s).`:'Registrado como difícil. Volta à fila em cerca de 10 minutos; você também pode usar treino livre.';
    if(freeFlash)flashIndex++;save();updateProgress();renderFlash();
  }
  $('flash-known').addEventListener('click',()=>rateFlash(true));$('flash-again').addEventListener('click',()=>rateFlash(false));
  $('flash-skip').addEventListener('click',()=>{flashIndex++;renderFlash();});
  $('flash-mode').addEventListener('click',()=>{freeFlash=!freeFlash;flashIndex=0;$('flash-mode').textContent=freeFlash?'Voltar à fila de revisão':'Treinar todos';renderFlash();});
  function renderChecklist(){
    $('exam-checklist').innerHTML=D.checklist.map((text,i)=>`<label class="check-item"><input type="checkbox" data-check="${i}" ${state.checklist.includes(i)?'checked':''}><span>${esc(text)}</span></label>`).join('');updateProgress();
  }
  $('exam-checklist').addEventListener('change',e=>{if(!e.target.matches('[data-check]'))return;const i=Number(e.target.dataset.check);state.checklist=e.target.checked?[...new Set([...state.checklist,i])]:state.checklist.filter(x=>x!==i);save();updateProgress();});
  $('checklist-reset').addEventListener('click',()=>{if(!confirm('Limpar somente as marcações do checklist de prática?'))return;state.checklist=[];save();renderChecklist();});
  $('study-tracks').innerHTML=D.tracks.map(t=>`<article class="track"><h3>${esc(t.title)}</h3><ol>${t.steps.map(([text,id])=>`<li><a href="#${esc(id)}">${esc(text)}</a></li>`).join('')}</ol></article>`).join('');
  $('export-progress').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({format:FORMAT,version:1,exportedAt:new Date().toISOString(),progress:state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='AldenirMed89-Semiologia-Cardiovascular-Progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);announce('Arquivo de progresso exportado. Guarde-o para retomar em outro navegador.');
  });
  $('import-progress').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(file.size>200000)throw Error('size');const data=JSON.parse(await file.text());
      if(!object(data)||data.format!==FORMAT||data.version!==1||!object(data.progress))throw Error('format');
      const raw=data.progress;
      if(!object(raw.lessons)||!object(raw.caseAnswers)||!object(raw.cards)||!Array.isArray(raw.checklist)||!Array.isArray(raw.listened))throw Error('structure');
      const next=normalizeState(raw);
      if(Object.keys(next.caseAnswers).length!==Object.keys(raw.caseAnswers).length||Object.keys(next.cards).length!==Object.keys(raw.cards).length||next.checklist.length!==new Set(raw.checklist).size)throw Error('values');
      if(!confirm('Substituir o progresso cardiovascular deste navegador pelo arquivo selecionado?'))return;
      state=next;save();document.querySelectorAll('[data-lesson]').forEach(x=>x.checked=state.lessons[x.dataset.lesson]===true);renderCase();renderFlash();renderChecklist();selectSound(state.selectedSound);announce('Progresso importado. O ponto de retomada está atualizado.');
    }catch(_){announce('Arquivo inválido ou incompatível. Seu progresso atual foi preservado.');}finally{e.target.value='';}
  });
  $('print-course').addEventListener('click',()=>{
    const details=[...document.querySelectorAll('details')],before=details.map(x=>x.open);details.forEach(x=>x.open=true);
    const restore=()=>{details.forEach((x,i)=>x.open=before[i]);window.removeEventListener('afterprint',restore);};
    window.addEventListener('afterprint',restore);window.print();
  });
  $('audio-credits').innerHTML=D.recordings.map(x=>`<article class="source-entry"><strong>${esc(x.title)}</strong><p>${esc(x.authors)} · ${x.year} · ${esc(x.population)}</p><p><a href="${esc(x.article)}" target="_blank" rel="noopener">Artigo</a> · <a href="${esc(x.source)}" target="_blank" rel="noopener">WAV original</a> · <a href="${esc(x.licenseUrl)}" target="_blank" rel="noopener">${esc(x.license)}</a></p><small>${esc(x.changes)}</small></article>`).join('');
  renderCase();renderFlash();renderChecklist();updateProgress();selectSound(selected);
  if(!storageOK)announce('O armazenamento não está disponível ou estava inválido. O curso funciona; exporte seu progresso para preservá-lo.');
})();
