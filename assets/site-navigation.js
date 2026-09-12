(() => {
  'use strict';
  const input = document.getElementById('quickSearch');
  const list = document.getElementById('quickResults');
  const status = document.getElementById('quickSearchStatus');
  if (!input || !list || !status) return;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const unique = new Map();
  document.querySelectorAll('a.module-card').forEach(card => {
    const href = card.getAttribute('href');
    if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) return;
    unique.set(href, {href, title:card.querySelector('h3')?.textContent.trim() || card.textContent.trim(), text:card.textContent, kind:'Módulo / estação'});
  });
  const show = () => {
    const words = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    list.replaceChildren();
    list.hidden = !words.length;
    if (!words.length) {
      status.textContent = 'Busque módulos e os documentos recém-integrados. A busca fica neste navegador.';
      return;
    }
    const results = [...unique.values()].filter(item => words.every(word => normalize(item.text).includes(word)));
    results.slice(0,12).forEach(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.title;
      const label = document.createElement('small');
      label.textContent = item.kind;
      link.append(label);li.append(link);list.append(li);
    });
    if (!results.length) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '02_Biblioteca_IA_Engine/index.html?q=' + encodeURIComponent(input.value.trim().slice(0,180));
      link.textContent = 'Pesquisar este assunto no acervo completo da Biblioteca IA →';
      li.append(link);list.append(li);
    }
    status.textContent = results.length ? `${results.length} rota(s) encontrada(s)${results.length>12 ? '; mostrando as primeiras 12' : ''}. Use Tab para escolher.` : 'Nenhuma rota rápida encontrada. Continue a busca na Biblioteca IA.';
  };
  input.addEventListener('input',show);
  input.addEventListener('keydown',event => {
    if(event.key==='Escape'){input.value='';show();}
    if(event.key==='ArrowDown'&&!list.hidden){event.preventDefault();list.querySelector('a')?.focus();}
  });
  fetch('02_Biblioteca_IA_Engine/data/biblioteca_ingestao_20260911.json', {credentials:'same-origin'})
    .then(response => {if(!response.ok) throw Error('library-unavailable');return response.json();})
    .then(data => {
      if(!Array.isArray(data.items)) return;
      data.items.forEach(item => {
        const preview = String(item.previewPath || '');
        if(!/^previews\/[a-zA-Z0-9_-]+\.html$/.test(preview) || typeof item.title !== 'string') return;
        if(!/^[a-zA-Z0-9_-]+$/.test(String(item.id || ''))) return;
        const href = '02_Biblioteca_IA_Engine/index.html?doc=' + encodeURIComponent(item.id);
        unique.set(href,{href,title:item.title,text:[item.title,item.theme,...(Array.isArray(item.tags)?item.tags:[])].join(' '),kind:'Word IA · prévia educacional em revisão médica'});
      });
      show();
    }).catch(() => { /* Os módulos e a busca no acervo continuam disponíveis. */ });
})();
