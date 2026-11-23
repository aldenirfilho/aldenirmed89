document.documentElement.classList.add('js');

(function(){
  // Search and group controls share state so changing either preserves the other.
  var bts=document.querySelectorAll('.filtros .btn'), activeGroup='todos';
  var search=document.getElementById('taxon-search');
  function normalize(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  var dossiers=Array.from(document.querySelectorAll('#dossies .dossie, #aves .dossie'));
  var searchable=dossiers.map(function(d){return normalize(d.textContent)});
  function filter(){
    var term=normalize(search.value.trim()), visible=0;
    dossiers.forEach(function(d,i){var show=(activeGroup==='todos'||d.dataset.g===activeGroup)&&searchable[i].includes(term);d.hidden=!show;if(show)visible++});
    document.getElementById('taxon-count').textContent=visible+' dossiê(s) encontrado(s) nos filtros do Araripe.';
  }
  bts.forEach(function(b){b.addEventListener('click',function(){
    activeGroup=b.dataset.f;bts.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});filter();
    if(activeGroup==='ave')document.getElementById('aves').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  })});
  search.addEventListener('input',filter);filter();
  document.getElementById('imprimir').addEventListener('click',function(){window.print()});
  // quiz
  var Q=JSON.parse(document.getElementById('dados-quiz').textContent), qi=0, pts=0, el=document.getElementById('quiz-app');
  function quiz(){
    if(qi>=Q.length){el.innerHTML='<p class="qp">Fim! Você acertou '+pts+' de '+Q.length+'.</p><button class="btn ouro" id="q-re">Recomeçar</button>';
      document.getElementById('q-re').onclick=function(){qi=0;pts=0;quiz()};return}
    var q=Q[qi];
    el.innerHTML='<div class="barra"><span>Pergunta '+(qi+1)+' de '+Q.length+'</span><span>Acertos: '+pts+'</span></div><p class="qp"></p><div class="ops"></div><p class="exp" hidden></p><div class="acoes"><button class="btn ouro" id="q-prox" hidden>Próxima</button></div>';
    el.querySelector('.qp').textContent=q.p;
    var ops=el.querySelector('.ops');
    q.o.forEach(function(o,j){var b=document.createElement('button');b.className='btn op';b.textContent=String.fromCharCode(97+j)+') '+o;
      b.onclick=function(){
        ops.querySelectorAll('button').forEach(function(x,k){x.disabled=true;if(k===q.c)x.classList.add('certo')});
        if(j===q.c){pts++}else{b.classList.add('errado')}
        var ex=el.querySelector('.exp');ex.hidden=false;ex.textContent=(j===q.c?'✅ Isso! ':'❌ Não foi dessa vez. ')+q.x;
        var nx=document.getElementById('q-prox');nx.hidden=false;nx.focus();nx.onclick=function(){qi++;quiz()};
        el.querySelector('.barra span:last-child').textContent='Acertos: '+pts};
      ops.appendChild(b)});
  }
  quiz();
  // flashcards
  var F=JSON.parse(document.getElementById('dados-flash').textContent), fi=0, virado=false, fa=document.getElementById('flash-app');
  function flash(){
    var c=F[fi];
    fa.innerHTML='<button class="cartao-f" aria-live="polite"></button><div class="flash-nav"><button class="btn" id="f-ant">◀ Anterior</button><span>'+(fi+1)+' / '+F.length+'</span><button class="btn" id="f-prox">Próximo ▶</button><button class="btn" id="f-emb">🔀 Embaralhar</button></div>';
    var k=fa.querySelector('.cartao-f');
    function pinta(){k.innerHTML='';var t=document.createElement('div');t.className='tag';t.textContent=virado?'RESPOSTA':'PERGUNTA · toque para virar';k.appendChild(t);
      var p=document.createElement('div');p.className=virado?'verso':'';p.textContent=virado?c.v:c.f;k.appendChild(p);
      if(virado){var g=document.createElement('div');g.className='pg';g.textContent='⚠️ '+c.p;k.appendChild(g)}}
    pinta();
    k.onclick=function(){virado=!virado;pinta()};
    document.getElementById('f-ant').onclick=function(){fi=(fi-1+F.length)%F.length;virado=false;flash()};
    document.getElementById('f-prox').onclick=function(){fi=(fi+1)%F.length;virado=false;flash()};
    document.getElementById('f-emb').onclick=function(){for(var i=F.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=F[i];F[i]=F[j];F[j]=t}fi=0;virado=false;flash()};
  }
  flash();
})();
