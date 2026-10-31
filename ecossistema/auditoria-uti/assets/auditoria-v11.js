/* Extensão progressiva do painel existente. Dados locais nunca são enviados. */
(() => {
  'use strict';
  const A=window.UTI360X, C=window.UTI360XPlusCore;
  if (!A || !C || document.getElementById('v11-import')) return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>typeof n==='number'&&Number.isFinite(n)?n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Não informado';
  const number=n=>typeof n==='number'&&Number.isFinite(n)?n.toLocaleString('pt-BR',{maximumFractionDigits:4}):'—';
  const KEY='uti360x-draft-v11', PREF='uti360x-draft-enabled-v11';
  let pending=[], saveTimer, busy=false, reviewSignature=null;
  const add=(parent,html)=>parent.insertAdjacentHTML('beforeend',html);
  function download(content,name,type) {
    const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  const band=document.createElement('div');band.className='card v11-band';
  band.innerHTML='<div><span class="badge good">Versão 1.1</span><h2>Da referência à revisão documentada</h2><p class="muted small">Importe documentos, confirme equivalência e exporte uma triagem rastreável. Base incorporada: '+esc(A.DATA.cutoff)+'. Os preços não foram atualizados automaticamente.</p></div><div class="v11-actions"><button class="btn primary" data-v11-open>Importar referências CSV</button><button class="btn" id="v11-go-tco">Compra × locação</button></div><p id="v11-counter" class="small muted" aria-live="polite"></p>';
  $('view-overview').querySelector('.page-title').after(band);
  const toolbar=document.createElement('div');toolbar.className='toolbar';
  toolbar.innerHTML='<button class="btn" data-v11-open>Importar referências CSV</button><button class="btn primary" id="v11-report">Baixar relatório HTML</button><span class="small muted">Relatório estático para revisão e impressão; sem envio ao servidor.</span>';
  $('view-audit').querySelector('.page-title').after(toolbar);
  const review=document.createElement('details');review.className='details v11-review';
  review.innerHTML='<summary>Conferir referências locais do item selecionado</summary><div class="details-content"><p class="small muted">A importação não autentica documentos. Abra a fonte e confira apresentação, unidade, configuração, frete, tributos e condições comerciais antes de marcar cada referência.</p><div id="v11-review-list" class="mt"></div></div>';
  $('auditReferences').before(review);
  add($('view-sources'), '<section class="card mt" aria-labelledby="v11-source-title"><h2 id="v11-source-title">Atualizar a pesquisa local</h2><p class="muted small mt">Baixe os dados nos portais oficiais, normalize no modelo e importe o CSV. Não há conexão automática BPS/PNCP. Nenhum registro importado altera o catálogo histórico ou a planilha incorporada.</p><div class="v11-actions mt"><button class="btn primary" data-v11-open>Importar referências CSV</button><button class="btn" id="v11-template">Baixar CSV-modelo</button><button class="btn" id="v11-pending-export">Exportar lacunas da base</button></div></section>');
  add($('view-sources'), '<section class="card mt" aria-labelledby="v11-draft-title"><h2 id="v11-draft-title">Continuidade neste navegador</h2><p class="muted small mt">Opcional: rascunho de compra, cenários, referências e comparação de aquisição. Não use em equipamento compartilhado nem insira dados de pacientes. O armazenamento local não é criptografado pelo painel.</p><label class="checkline mt"><input type="checkbox" id="v11-autosave">Salvar rascunho automaticamente neste navegador</label><div class="v11-actions mt"><button class="btn" id="v11-restore">Restaurar rascunho</button><button class="btn" id="v11-forget">Apagar rascunho local</button></div><p id="v11-save-status" class="small muted mt" role="status">Use também Salvar sessão para manter uma cópia em arquivo.</p></section>');
  const fields=[['months','Horizonte (meses)','60'],['purchase','Aquisição total (R$)',''],['install','Instalação na compra (R$)',''],['maintenance','Manutenção da compra (R$/mês)',''],['consumablesBuy','Consumíveis na compra (R$/mês)',''],['residual','Valor residual no fim (R$)',''],['rent','Locação + serviços (R$/mês)',''],['consumablesRent','Consumíveis na locação (R$/mês)',''],['returnCost','Adesão/devolução na locação (R$)','']];
  add($('view-budget'), '<details class="details" id="v11-tco"><summary>Compra × locação: custo total no horizonte</summary><div class="details-content"><p class="small muted">Compare o mesmo conjunto de equipamentos e capacidade. Informe todos os campos, inclusive zero explícito. Valores nominais: sem inflação, desconto financeiro ou efeitos tributários. Não some depreciação à aquisição neste cálculo.</p><div class="v11-form mt">'+fields.map(([k,l,v])=>'<div class="field"><label for="v11-tco-'+k+'">'+l+'</label><input id="v11-tco-'+k+'" type="number" min="'+(k==='months'?1:0)+'" max="'+(k==='months'?1200:1e12)+'" step="'+(k==='months'?1:0.01)+'" value="'+v+'" placeholder="Não informado"></div>').join('')+'</div><div id="v11-tco-result" class="notice info mt" role="status"></div></div></details>');
  add(document.body,'<dialog id="v11-import" aria-labelledby="v11-import-title"><div class="v11-dialog-head"><h2 id="v11-import-title">Importar referências documentais</h2><button class="btn" id="v11-close">Fechar</button></div><p class="muted small mt">CSV UTF-8, até 300 referências locais e 2 MB. Datas AAAA-MM-DD. Preços 1234,56 ou 1234.56. As nove colunas devem seguir o modelo; arquivos nativos do BPS/PNCP precisam ser normalizados antes.</p><p class="notice mt"><strong>Importações entram com equivalência pendente.</strong> Nenhum preço será considerado comparável sem conferência humana.</p><div class="v11-actions"><button class="btn" id="v11-dialog-template">Baixar modelo vazio</button><label class="field"><span>Arquivo CSV</span><input id="v11-csv-file" type="file" accept=".csv,text/csv"></label></div><p id="v11-import-status" class="small muted mt" role="status"></p><div id="v11-preview" class="mt"></div><button class="btn primary mt" id="v11-apply" disabled>Adicionar à sessão</button></dialog>');
  function getTco() {return Object.fromEntries(fields.map(([k])=>{const s=$('v11-tco-'+k).value;return[k,s===''?null:Number(s)];}));}
  function renderTco() {
    const r=C.totalCost(getTco());
    $('v11-tco-result').innerHTML=r.valid?'<div><strong>Compra: '+money(r.buy)+' · Locação: '+money(r.rent)+'</strong><p>Diferença locação − compra: '+money(r.difference)+'.</p><p class="small muted">Compra: aquisição + instalação + meses × (manutenção + consumíveis) − residual. Locação: meses × (aluguel/serviços + consumíveis) + adesão/devolução. Simulação, não recomendação de contratação.</p></div>':'Preencha todos os valores não negativos; horizonte inteiro de 1–1.200 meses e residual não superior à aquisição.';
  }
  function reviewList() {
    const all=A.getState().userReferences, refs=all.filter(r=>r.sku===$('auditItem').value);
    $('v11-counter').textContent=all.length+' referência(s) na sessão · '+all.filter(r=>!r.equivalent).length+' com equivalência pendente. A base incorporada permanece separada.';
    const signature=JSON.stringify([$('auditItem').value,refs.map(r=>[r.id,r.sku,r.date,r.organization,r.process,r.recordPrice,r.factor,r.url,r.brand,r.notes])]);
    if(signature===reviewSignature){document.querySelectorAll('[data-v11-ref]').forEach(el=>{el.checked=refs.find(r=>r.id===el.dataset.v11Ref)?.equivalent===true;});return;}
    reviewSignature=signature;
    $('v11-review-list').innerHTML=refs.length?refs.map(r=>'<article class="v11-ref"><strong>'+esc(r.organization)+' · '+esc(r.process)+'</strong><p class="small muted">'+esc(r.sku)+' · '+esc(r.date)+' · '+money(r.recordPrice)+' por embalagem / '+number(r.factor)+' unidade(s)-base · '+esc(r.brand||'Marca não informada')+'</p><p class="small">'+esc(r.notes||'Sem observações adicionais.')+'</p><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Abrir documento-fonte</a><label class="checkline mt"><input type="checkbox" data-v11-ref="'+esc(r.id)+'" '+(r.equivalent?'checked':'')+'>Conferi a equivalência técnica e comercial desta referência com o item selecionado.</label></article>').join(''):'<p class="small muted">Nenhuma referência local deste item. Selecione outro item ou importe documentos.</p>';
  }
  function template() {download(C.csv([C.headers]),'UTI360X_modelo_referencias.csv','text/csv;charset=utf-8');}
  function openImport() {
    pending=[];$('v11-csv-file').value='';$('v11-import-status').textContent='A conferência ocorre localmente; nenhum arquivo é enviado.';$('v11-preview').innerHTML='';$('v11-apply').disabled=true;$('v11-import').showModal();
  }
  async function preview(file) {
    pending=[];$('v11-apply').disabled=true;$('v11-preview').innerHTML='';
    if (!file) return;
    if (file.size>2e6) {$('v11-import-status').textContent='Arquivo acima de 2 MB.';return;}
    try {
      const text=await file.text();
      const rows=C.validateImport(text,A.DATA.items,A.DATA.references.concat(A.getState().userReferences));
      if (A.getState().userReferences.length+rows.length>300) throw Error('A sessão excederia 300 referências locais.');
      pending=rows;
      $('v11-import-status').textContent=rows.length+' linha(s) válida(s). Nenhuma alteração foi feita. Confirme para adicionar com equivalência pendente.';
      $('v11-preview').innerHTML='<div class="table-wrap"><table><thead><tr><th>Item</th><th>Instituição</th><th>Preço / unidade-base</th></tr></thead><tbody>'+rows.slice(0,12).map(r=>'<tr><td>'+esc(r.sku)+'</td><td>'+esc(r.organization)+'</td><td>'+money(r.recordPrice/r.factor)+'</td></tr>').join('')+'</tbody></table></div>'+(rows.length>12?'<p class="small muted">Prévia das primeiras 12 linhas.</p>':'');
      $('v11-apply').disabled=false;
    } catch(e) {$('v11-import-status').textContent='Importação bloqueada. Nenhuma linha adicionada.\n'+e.message;}
  }
  function applyImport() {
    if (!pending.length) return;
    const existing=new Set(A.DATA.references.concat(A.getState().userReferences).map(C.referenceKey));
    if (A.getState().userReferences.length+pending.length>300||pending.some(r=>existing.has(C.referenceKey(r)))) {$('v11-import-status').textContent='A sessão mudou. Selecione o arquivo novamente.';$('v11-apply').disabled=true;return;}
    const sku=pending[0].sku, stamp=Date.now();
    A.getState().userReferences.push(...pending.map((r,i)=>({...r,id:'csv-'+stamp+'-'+i,equivalent:false})));
    pending=[];$('compareConfirm').checked=false;$('auditItem').value=sku;A.renderAudit();A.changeView('audit');review.open=true;$('v11-import').close();reviewList();scheduleSave();
  }
  function saveStatus(s) {$('v11-save-status').textContent=s;}
  function saveDraft() {
    if (!$('v11-autosave').checked||busy) return;
    try {localStorage.setItem(KEY,JSON.stringify(A.getSession()));saveStatus('Rascunho salvo somente neste navegador às '+new Date().toLocaleTimeString('pt-BR')+'.');}
    catch (_) {saveStatus('Não foi possível gravar localmente. Use Salvar sessão para exportar um arquivo.');}
  }
  function scheduleSave() {clearTimeout(saveTimer);saveTimer=setTimeout(saveDraft,400);}
  function restoreDraft() {
    try {const text=localStorage.getItem(KEY);if(!text)throw Error('Não há rascunho salvo.');if(!window.confirm('Restaurar substituirá a sessão atual. Salve-a em arquivo antes de continuar. Prosseguir?'))return;busy=true;A.restoreSession(JSON.parse(text));reviewList();saveStatus('Rascunho restaurado. Reconfirme cada referência, a compra e os cenários.');}
    catch(e){saveStatus(e.message);}finally{busy=false;}
  }
  function report() {
    const a=A.getAuditInput(),r=A.evaluateAudit(a,A.getState().userReferences),item=A.DATA.items.find(i=>i.id===a.sku);
    const line=(k,v)=>'<tr><th>'+esc(k)+'</th><td>'+esc(v)+'</td></tr>';
    const list=r.problems.length?'<ul>'+r.problems.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>':'<p>Sem bloqueio automático. A documentação não foi autenticada pelo painel.</p>';
    const rows=r.refs.map(x=>'<tr><td>'+esc(x.date)+'</td><td>'+esc(x.organization)+'<br>'+esc(x.process)+'</td><td>'+esc(money(x.normalized))+'</td><td>'+esc(x.reason)+'</td><td>'+ (C.validUrl(x.url)?'<a href="'+esc(x.url)+'" rel="noopener noreferrer">Fonte</a>':'URL inválida')+'</td></tr>').join('');
    const html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'"><title>Triagem de preços — Auditoria UTI 360X</title><style>body{font:16px/1.6 system-ui,sans-serif;color:#182b40;max-width:1060px;margin:40px auto;padding:0 24px}h1{font-size:28px}table{border-collapse:collapse;width:100%;font-size:13px;margin:22px 0}th,td{text-align:left;border:1px solid #cfd8e3;padding:9px;overflow-wrap:anywhere}th{background:#eef3f7}.notice{border-left:4px solid #926000;padding:14px;background:#fff8ec}code{overflow-wrap:anywhere}a{color:#075a70}@media print{body{margin:0}h2{break-after:avoid}tr{break-inside:avoid}}</style><h1>Triagem de preços · Auditoria UTI 360X</h1><p>Versão 1.1 · Gerado em '+esc(C.todayISO())+' · Base incorporada de '+esc(A.DATA.cutoff)+'</p><p class="notice"><strong>'+esc(r.status)+'</strong><br>Este relatório não comprova superfaturamento, regularidade, dano ou valor a restituir. Documentos locais e confirmações são declarações do usuário; exigem revisão independente.</p><h2>Compra e resultado</h2><table>'+line('Documento/processo',a.doc||'Não informado')+line('Item',a.sku+' — '+(item?.name||''))+line('Especificação / unidade',(item?.spec||'')+' / '+(item?.unit||''))+line('Data da compra',a.date)+line('Preço da embalagem',money(a.paid))+line('Unidades-base por embalagem / quantidade',number(a.factor)+' / '+number(a.qty))+line('Preço normalizado',money(r.unit))+line('Amostra elegível',r.n)+line('Mediana descritiva',money(r.median))+line('Desvio',r.delta===null?'Bloqueado':number(r.delta*100)+'%')+line('Materialidade indicativa',money(r.materiality))+'</table><h2>Pendências</h2>'+list+'<h2>Parâmetros declarados</h2><table>'+line('Mínimo de referências',a.minRefs)+line('Janela em dias',a.window)+line('Atenção / prioridade (%)',a.attention+' / '+a.priority)+line('Razão máxima/mínima permitida',a.maxRatio)+line('Equivalência da compra confirmada',a.confirmed?'Sim, pelo usuário':'Não')+'</table><p>Percentuais são critérios gerenciais editáveis, não limites legais. Referências posteriores à compra e fora da janela são excluídas.</p><h2>Referências incluídas e excluídas</h2><table><thead><tr><th>Data</th><th>Instituição/processo</th><th>R$/unidade</th><th>Situação</th><th>Documento</th></tr></thead><tbody>'+rows+'</tbody></table><h2>Rastreabilidade</h2><p>Origem: '+esc(A.DATA.workbook)+'. Sem atualização automática BPS/PNCP.</p><p>SHA-256 da planilha de origem: <code>'+esc(A.DATA.sourceHash)+'</code>.</p><p>Use a função Imprimir do navegador para gerar uma cópia PDF. Guarde também a sessão e os documentos-fonte. Não inserir dados de pacientes.</p></html>';
    download(html,'UTI360X_triagem_'+a.sku+'_'+C.todayISO()+'.html','text/html;charset=utf-8');
  }
  document.querySelectorAll('[data-v11-open]').forEach(b=>b.addEventListener('click',openImport));
  $('v11-close').addEventListener('click',()=>$('v11-import').close());
  $('v11-csv-file').addEventListener('change',e=>preview(e.target.files[0]));
  $('v11-apply').addEventListener('click',applyImport);
  ['v11-template','v11-dialog-template'].forEach(id=>$(id).addEventListener('click',template));
  $('v11-report').addEventListener('click',report);
  $('v11-go-tco').addEventListener('click',()=>{A.changeView('budget');$('v11-tco').open=true;$('v11-tco').scrollIntoView({block:'start'});});
  $('v11-pending-export').addEventListener('click',()=>download(C.csv([['sku','item','grupo','unidade','referencias_base','pendencia'],...A.DATA.items.filter(x=>x.n<3).map(x=>[x.id,x.name,x.group,x.unit,x.n,x.n===0?'Sem preço elegível na base':'Amostra inferior a três; revisar equivalência e ampliar pesquisa'])]),'UTI360X_lacunas_base_incorporada.csv','text/csv;charset=utf-8'));
  document.addEventListener('change',e=>{const id=e.target.dataset?.v11Ref;if(!id)return;const r=A.getState().userReferences.find(x=>x.id===id);if(r){r.equivalent=e.target.checked;$('compareConfirm').checked=false;A.renderAudit();reviewList();scheduleSave();}});
  fields.forEach(([k])=>$('v11-tco-'+k).addEventListener('input',renderTco));
  ['input','change'].forEach(type=>document.addEventListener(type,scheduleSave));
  new MutationObserver(()=>{reviewList();scheduleSave();}).observe($('auditReferences'),{childList:true});
  $('v11-restore').addEventListener('click',restoreDraft);
  $('v11-forget').addEventListener('click',()=>{try{localStorage.removeItem(KEY);localStorage.removeItem(PREF);$('v11-autosave').checked=false;clearTimeout(saveTimer);saveStatus('Rascunho apagado. A sessão aberta não foi alterada.');}catch(_){saveStatus('Armazenamento local indisponível.');}});
  $('v11-autosave').addEventListener('change',()=>{try{if($('v11-autosave').checked){localStorage.setItem(PREF,'yes');saveDraft();}else{localStorage.removeItem(PREF);localStorage.removeItem(KEY);saveStatus('Salvamento desativado e rascunho local apagado.');}}catch(_){saveStatus('Armazenamento local indisponível. Use Salvar sessão.');}});
  // Nunca sobrescrever um rascunho anterior ao abrir a página, nem restaurá-lo sem ação explícita.
  try {if(localStorage.getItem(KEY))saveStatus('Há um rascunho local. Restaure-o antes de ativar um novo salvamento.');}catch(_){}
  window.UTI360XPlus=Object.freeze({version:'1.1.0',getExtension:()=>({version:1,tco:getTco()}),restoreExtension:x=>{fields.forEach(([k,,v])=>{$('v11-tco-'+k).value=v;});if(x?.version===1&&x.tco)fields.forEach(([k])=>{const v=x.tco[k];if(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1e12)$('v11-tco-'+k).value=v;});renderTco();},preview,report});
  renderTco();reviewList();
})();
