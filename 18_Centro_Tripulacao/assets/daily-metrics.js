(() => {
  'use strict';
  const byId=id=>document.getElementById(id), core=window.CrewDailyMetrics;
  const fmt=n=>n===null?'—':new Intl.NumberFormat('pt-BR').format(n);
  const date=s=>s.split('-').reverse().join('/');
  let snapshot=null, local=false, operation=0, request=null;
  function el(tag,text){const node=document.createElement(tag);node.textContent=text;return node;}
  function message(text){byId('dailyStatus').textContent=text;}
  function busy(value){byId('dailyStatus').setAttribute('aria-busy',String(value));byId('dailyRefresh').disabled=value;}
  function begin(){if(request){request.abort();request=null;}operation+=1;busy(true);return operation;}
  function render(){
    if(!snapshot) return;
    const start=byId('dailyStart').value,end=byId('dailyEnd').value;
    if(start && end && start>end){
      message('A data inicial precisa vir antes da final. Corrija o intervalo para exibir os números.');
      ['dailyViews','dailyVisitorDays','dailyCoverage'].forEach(id=>byId(id).textContent='—');
      byId('dailyRows').replaceChildren();byId('dailyPages').replaceChildren();byId('exportDaily').disabled=true;return;
    }
    const scope=core.select(snapshot,start,end);
    byId('dailyViews').textContent=fmt(scope.views);
    byId('dailyVisitorDays').textContent=fmt(scope.visitorDays);
    byId('dailyCoverage').textContent=snapshot.status==='ready'?fmt(scope.days.length):'—';
    byId('visitorDaysLabel').textContent=scope.days.length===1?'Visitantes estimados no dia':'Soma de visitantes diários';
    const available=snapshot.status==='ready';
    message(available?(scope.days.length?`${local?'Arquivo privado validado; visível somente nesta aba.':'Relatório público agregado carregado.'} Escolha um dia para ver o que foi acessado.`:'Nenhuma observação nesse intervalo; isso não comprova zero acessos.'):'Dados diários ainda indisponíveis. Não há observações diárias nesta fonte; consulte a origem e o guia de conexão.');
    const src=snapshot.source;
    byId('dailySource').textContent=`${local?'Arquivo local (somente nesta aba)':'Relatório publicado'} · ${src.provider} · Fuso ${src.timezone}. ${src.coverage}`;
    const stamp=src.generatedAt?new Date(src.generatedAt):null;
    byId('dailyFreshness').textContent=stamp?`Relatório gerado em ${stamp.toLocaleString('pt-BR',{timeZone:src.timezone})}. Último dia com observação: ${snapshot.days.length?date(snapshot.days[snapshot.days.length-1].date):'nenhum'}.${Date.now()-stamp.getTime()>172800000?' Relatório gerado há mais de 48 horas.':''} Consulta de arquivo, sem atualização em tempo real.`:'Sem exportação disponível';
    byId('dailyMethod').textContent=src.method;
    byId('dailyHash').textContent=src.sourceSha256?`SHA-256 do arquivo-fonte: ${src.sourceSha256}`:'';
    const body=byId('dailyRows');body.replaceChildren();
    const max=Math.max(1,...scope.days.map(d=>d.views));
    scope.days.forEach(d=>{
      const row=document.createElement('tr');
      const td=document.createElement('td'),button=el('button',date(d.date));
      button.type='button';button.className='daily-day-button';button.setAttribute('aria-label',`Ver páginas de ${date(d.date)}`);
      button.addEventListener('click',()=>{byId('dailyStart').value=d.date;byId('dailyEnd').value=d.date;render();byId('pagesHeading').focus();});
      td.append(button);
      const chart=document.createElement('td'), meter=document.createElement('meter');
      meter.min=0;meter.max=max;meter.value=d.views;meter.setAttribute('aria-label',`${fmt(d.views)} visualizações em ${date(d.date)}`);chart.append(meter);
      row.append(td,el('td',fmt(d.visitors)),el('td',fmt(d.views)),chart);body.append(row);
    });
    if(!scope.days.length){const tr=document.createElement('tr'),td=el('td','Sem observações disponíveis. Dias sem registro não são preenchidos com zero.');td.colSpan=4;tr.append(td);body.append(tr);}
    const pages=byId('dailyPages');pages.replaceChildren();
    scope.pages.forEach(p=>{const tr=document.createElement('tr'),td=document.createElement('td'),a=el('a',p.path.replace('/aldenirmed89/','/')||'/');a.href='https://aldenirfilho.github.io'+p.path;td.append(a);tr.append(td,el('td',fmt(p.views)));pages.append(tr);});
    if(!scope.pages.length){const tr=document.createElement('tr'),td=el('td','Nenhuma página disponível para este intervalo.');td.colSpan=2;tr.append(td);pages.append(tr);}
    byId('exportDaily').disabled=!scope.days.length;
    if(byId('discardDaily'))byId('discardDaily').disabled=!local;
  }
  function use(data,isLocal){
    const validated=core.validate(data);
    snapshot=validated;local=isLocal;
    byId('dailyStart').value='';byId('dailyEnd').value='';render();
  }
  async function load(){
    const ticket=begin(),controller=new AbortController();request=controller;
    const timeout=setTimeout(()=>controller.abort(),15000);
    message('Consultando a fonte pública. O relatório anterior só será substituído após validação.');
    try{
      const response=await fetch('./data/daily-visits.json',{cache:'no-store',credentials:'same-origin',signal:controller.signal});
      if(!response.ok)throw Error('Fonte indisponível.');
      const data=await response.json();
      if(ticket===operation)use(data,false);
    }catch(error){
      if(ticket===operation)message(snapshot?'Não foi possível recarregar a fonte. O relatório anterior foi mantido; confira se a origem abaixo é pública ou privada e verifique sua data.':'Não foi possível ler o relatório publicado. Importe um relatório agregado local ou consulte o guia de conexão.');
    }finally{
      clearTimeout(timeout);
      if(ticket===operation){request=null;busy(false);}
    }
  }
  byId('dailyStart').addEventListener('change',render);byId('dailyEnd').addEventListener('change',render);
  byId('dailyReset').addEventListener('click',()=>{byId('dailyStart').value='';byId('dailyEnd').value='';render();});
  byId('dailyRefresh').addEventListener('click',load);
  byId('importDaily').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    const ticket=begin();
    message('Validando o arquivo privado nesta aba. Nenhum dado do arquivo é enviado.');
    try{
      if(file.size>5000000)throw Error('O relatório agregado deve ter até 5 MB.');
      const data=JSON.parse(await file.text());
      if(ticket===operation)use(data,true);
    }catch(error){
      if(ticket===operation)message(`Arquivo recusado: ${error.message} ${snapshot?'O relatório anterior foi mantido; confira a origem abaixo.':'Nenhum relatório foi carregado. Consulte o guia de conexão.'}`);
    }finally{
      if(ticket===operation){e.target.value='';busy(false);}
    }
  });
  byId('discardDaily')?.addEventListener('click',()=>{
    snapshot=null;local=false;
    ['dailyStart','dailyEnd','importDaily'].forEach(id=>byId(id).value='');
    ['dailyViews','dailyVisitorDays','dailyCoverage'].forEach(id=>byId(id).textContent='—');
    ['dailySource','dailyFreshness','dailyMethod','dailyHash'].forEach(id=>byId(id).textContent='');
    byId('dailyRows').replaceChildren();byId('dailyPages').replaceChildren();
    byId('exportDaily').disabled=true;byId('discardDaily').disabled=true;
    load();
  });
  byId('exportDaily').addEventListener('click',()=>{
    if(!snapshot)return;
    const start=byId('dailyStart').value,end=byId('dailyEnd').value;
    if(start && end && start>end)return;
    const scope=core.select(snapshot,start,end);
    if(!scope.days.length)return;
    const blob=new Blob([JSON.stringify({...snapshot,days:scope.days},null,2)+'\n'],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='aldenirmed89-visitas-agregadas.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  load();
})();
