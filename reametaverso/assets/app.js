/* Reametaverso — interações locais, sem backend, APIs, rastreadores ou dependências. */
(() => {
  'use strict';
  const data = window.ReaData;
  if (!data || !Array.isArray(data.schools)) return;
  const base = document.body.dataset.base || '';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const key = 'reametaverso.grimorio.v1';
  const schoolIds = new Set(data.schools.map(s => s.id));
  const fresh = () => ({version:1, schools:[], note:'', focus:false});
  let state = fresh();
  let storageAvailable = true;
  let toastTimer;
  let galleryFilter = 'todas';
  let galleryPosition = 0;
  let lastJourney = '';
  let discoveryIndex = 0;
  const noteInput = $('#journal-note');
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (stored && typeof stored === 'object' && stored.version === 1) {
      state.schools = Array.isArray(stored.schools) ? [...new Set(stored.schools.filter(id => schoolIds.has(id)))] : [];
      state.note = typeof stored.note === 'string' ? stored.note.slice(0,3000) : '';
      state.focus = stored.focus === true;
    }
  } catch (_) { state = fresh(); }
  function toast(text) {
    const el = $('#toast'); if (!el) return;
    clearTimeout(toastTimer); el.textContent = text; el.classList.add('visible');
    toastTimer = setTimeout(() => el.classList.remove('visible'), 4300);
  }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(state)); storageAvailable = true; return true; }
    catch (_) {
      storageAvailable = false;
      const notice = $('#storage-notice');
      if (notice) notice.textContent = 'O armazenamento deste navegador está indisponível ou cheio. As alterações permanecem apenas nesta sessão. Exporte o texto para não perder suas notas. Nenhum dado é enviado ao servidor.';
      return false;
    }
  }
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('class','icon'); svg.setAttribute('aria-hidden','true');
    const use = document.createElementNS('http://www.w3.org/2000/svg','use'); use.setAttribute('href','#i-'+name); svg.append(use); return svg;
  }
  function applyFocus() {
    document.body.classList.toggle('focus-mode',state.focus);
    $$('[data-focus]').forEach(button => { button.setAttribute('aria-pressed',String(state.focus)); button.setAttribute('aria-label',state.focus ? 'Desativar modo foco' : 'Ativar modo foco'); });
  }
  function renderSelections() {
    $$('[data-school-choice]').forEach(button => button.setAttribute('aria-pressed',String(state.schools.includes(button.dataset.schoolChoice))));
    $$('[data-follow]').forEach(button => {
      const selected = state.schools.includes(button.dataset.follow); button.setAttribute('aria-pressed',String(selected));
      const span = button.querySelector('span'); if (span) span.textContent = selected ? 'No meu grimório · remover' : 'Guardar no grimório';
    });
  }
  function toggleSchool(id) {
    if (!schoolIds.has(id)) return;
    const wasSelected = state.schools.includes(id);
    state.schools = wasSelected ? state.schools.filter(x => x !== id) : [...state.schools,id];
    const saved = persist(); renderSelections();
    const name = data.schools.find(s => s.id === id).name;
    toast(saved ? `${name}: ${wasSelected ? 'removida' : 'guardada'} no seu grimório.` : 'Escolha mantida apenas nesta sessão. Exporte seu grimório.');
  }
  function updateCounter() { if ($('#note-counter') && noteInput) $('#note-counter').textContent = `${noteInput.value.length} / 3000`; }
  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog || typeof dialog.showModal !== 'function') { toast('Este navegador não oferece os diálogos necessários. Use uma versão atualizada para os recursos interativos.'); return; }
    if (id === 'journal') { renderSelections(); $('#reset-confirm').hidden = true; updateCounter(); }
    if (!dialog.open) dialog.showModal(); document.body.classList.add('locked');
  }
  function closeDialog(id) { const dialog = document.getElementById(id); if (dialog && dialog.open) dialog.close(); }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close',() => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('locked'); });
    dialog.addEventListener('click',event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog(dialog.id);
    });
  });
  $$('[data-close]').forEach(button => button.addEventListener('click',() => closeDialog(button.dataset.close)));
  $$('[data-journal]').forEach(button => button.addEventListener('click',() => openDialog('journal')));
  $$('[data-privacy]').forEach(button => button.addEventListener('click',() => openDialog('privacy')));
  $$('[data-focus]').forEach(button => button.addEventListener('click',() => {
    state.focus = !state.focus; const saved = persist(); applyFocus();
    toast((state.focus ? 'Modo foco ativado: menos estímulos visuais.' : 'Modo imersivo restaurado.') + (saved ? '' : ' Preferência disponível nesta sessão.'));
  }));
  const menu = $('#navigation'); const menuButton = $('#menu-toggle');
  function closeMenu() {
    if (menu) menu.classList.remove('open');
    if (menuButton) { menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Abrir menu'); }
  }
  if (menu && menuButton) {
    menuButton.addEventListener('click',() => {
      const open = !menu.classList.contains('open'); menu.classList.toggle('open',open); menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e => { if(e.key === 'Escape') closeMenu(); });
    document.addEventListener('click',e => { if (!menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu(); });
  }
  const choices = $('#journal-schools');
  if (choices) data.schools.forEach(school => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'journal-school'; button.dataset.schoolChoice = school.id; button.setAttribute('aria-pressed','false');
    button.append(icon(school.icon),document.createTextNode(school.name)); button.addEventListener('click',() => toggleSchool(school.id)); choices.append(button);
  });
  $$('[data-follow]').forEach(button => button.addEventListener('click',() => toggleSchool(button.dataset.follow)));
  if (noteInput) { noteInput.value = state.note; noteInput.addEventListener('input',updateCounter); }
  if ($('#save-note')) $('#save-note').addEventListener('click',() => {
    state.note = noteInput.value.slice(0,3000); toast(persist() ? 'Nota salva somente neste navegador.' : 'Não foi possível salvar neste navegador. Exporte o texto para preservar sua nota.'); updateCounter();
  });
  if ($('#ask-reset')) $('#ask-reset').addEventListener('click',() => { $('#reset-confirm').hidden = false; $('#confirm-reset').focus(); });
  if ($('#cancel-reset')) $('#cancel-reset').addEventListener('click',() => { $('#reset-confirm').hidden = true; $('#ask-reset').focus(); });
  if ($('#confirm-reset')) $('#confirm-reset').addEventListener('click',() => {
    state.schools = []; state.note = ''; noteInput.value = ''; const saved = persist(); renderSelections(); updateCounter(); $('#reset-confirm').hidden = true; $('#ask-reset').focus();
    toast(saved ? 'Escolas e notas apagadas deste navegador.' : 'Grimório limpo nesta sessão. O navegador não permitiu atualizar o armazenamento.');
  });
  if ($('#export-journal')) $('#export-journal').addEventListener('click',() => {
    const names = data.schools.filter(s => state.schools.includes(s.id)).map(s => s.name); const note = noteInput ? noteInput.value : state.note;
    const text = 'REAMETAVERSO — MEU GRIMÓRIO\n\nEscolas de interesse: ' + (names.join(', ') || 'Ainda não escolhidas') + '\n\nMINHAS NOTAS\n' + (note || '(Sem notas)') + '\n\nAfinidades de livre escolha, não diagnósticos ou classificações.\nExportado localmente em ' + new Date().toLocaleString('pt-BR') + '.\n';
    const url = URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'meu-grimorio-reametaverso.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1500);
    toast('Grimório exportado. Guarde o arquivo em um local de sua escolha.');
  });
  function appendNote(text) {
    const current = noteInput ? noteInput.value : state.note; const proposed = [current.trim(),text].filter(Boolean).join('\n\n');
    if (proposed.length > 3000) { openDialog('journal'); toast('Seu grimório atingiu o limite. Exporte ou edite a nota antes de guardar outro convite.'); return; }
    state.note = proposed; if (noteInput) noteInput.value = proposed; const saved = persist(); updateCounter(); toast(saved ? 'Convite guardado no seu grimório.' : 'Convite disponível apenas nesta sessão. Exporte seu grimório.');
  }
  $$('[data-save-practice]').forEach(button => button.addEventListener('click',() => {
    const school = data.schools.find(s => s.id === button.dataset.schoolId); const practice = school && school.practices[Number(button.dataset.savePractice)];
    if (practice) appendNote(`${school.title} — ${practice.title} (${practice.time}, sugestão)\n${practice.text}`);
  }));
  function selectAtlas(id) {
    const school = data.schools.find(s => s.id === id); if (!school || !$('#atlas-title')) return;
    $('#atlas-title').textContent = school.name; $('#atlas-number').textContent = `TERRITÓRIO ${school.number} / 06`; $('#atlas-description').textContent = school.description; $('#atlas-symbol').replaceChildren(icon(school.icon));
    $('#atlas-tags').replaceChildren(...school.tags.map(tag => { const span = document.createElement('span'); span.className = 'tag'; span.textContent = tag; return span; }));
    $('#atlas-link').href = base+'escolas/'+school.id+'.html'; $$('[data-atlas]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.atlas === id)));
  }
  $$('[data-atlas]').forEach(button => button.addEventListener('click',() => selectAtlas(button.dataset.atlas)));
  function filteredGallery() { return galleryFilter === 'todas' ? data.gallery : data.gallery.filter(g => g.school === galleryFilter); }
  function renderImage() {
    const list = filteredGallery(); if (!list.length) return; galleryPosition = ((galleryPosition % list.length) + list.length) % list.length; const image = list[galleryPosition];
    $('#lightbox-image').src = (window.ReaAssets && window.ReaAssets[image.id]) || base+'assets/images/'+image.id+'.webp';
    $('#lightbox-image').alt = image.title+' — arte ficcional do Reametaverso'; $('#lightbox-title').textContent = image.title; $('#lightbox-description').textContent = image.subtitle; $('#lightbox-index').textContent = `${galleryPosition+1} / ${list.length}`;
    $('#previous-image').disabled = list.length < 2; $('#next-image').disabled = list.length < 2;
  }
  $$('[data-gallery]').forEach(button => button.addEventListener('click',() => { const list = filteredGallery(); const index = list.findIndex(g => g.id === button.dataset.gallery); galleryPosition = Math.max(0,index); renderImage(); openDialog('lightbox'); }));
  $$('[data-filter]').forEach(button => button.addEventListener('click',() => {
    galleryFilter = button.dataset.filter; $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    $$('#gallery-grid .gallery-item').forEach(item => item.hidden = galleryFilter !== 'todas' && item.dataset.category !== galleryFilter);
    const count = filteredGallery().length; if ($('#gallery-count')) $('#gallery-count').textContent = `${count} ${count===1 ? 'imagem' : 'imagens'} · Clique para ampliar · Use as setas do teclado na galeria.`;
  }));
  if ($('#previous-image')) $('#previous-image').addEventListener('click',() => { galleryPosition--; renderImage(); });
  if ($('#next-image')) $('#next-image').addEventListener('click',() => { galleryPosition++; renderImage(); });
  if ($('#lightbox')) $('#lightbox').addEventListener('keydown',event => {
    if(event.key === 'ArrowRight') { event.preventDefault(); galleryPosition++; renderImage(); }
    if(event.key === 'ArrowLeft') { event.preventDefault(); galleryPosition--; renderImage(); }
  });
  $$('[data-journey]').forEach(button => button.addEventListener('click',() => {
    let title,text,kicker;
    if (button.dataset.journey === 'pausa') {
      kicker = 'UMA PAUSA · SEM CONTAGEM REGRESSIVA'; title = 'Você pode apenas estar aqui.'; text = 'Deixe esta tela por alguns instantes, se for possível. Olhe ao redor, encontre uma posição confortável e escolha o ritmo da sua pausa. Não há tarefa para concluir.';
    } else if (button.dataset.journey === 'missao') {
      const school = data.schools.find(s => state.schools.includes(s.id)) || data.schools[1]; const p = school.practices[0]; kicker = school.title.toUpperCase()+' · '+p.time.toUpperCase()+' SUGERIDOS'; title = p.title; text = p.text;
    } else {
      const school = data.schools[discoveryIndex % data.schools.length]; discoveryIndex++; kicker = 'EXPLORE POR CURIOSIDADE · '+school.title.toUpperCase(); title = school.place; text = school.placeDescription+' Visite a página da escola pelo atlas ou pelos cartões. Não é necessário se inscrever.';
    }
    $('#mission-kicker').textContent = kicker; $('#mission-title').textContent = title; $('#mission-text').textContent = text; $('#mission-box').hidden = false; lastJourney = title+'\n'+text;
  }));
  if ($('#mission-save')) $('#mission-save').addEventListener('click',() => { if(lastJourney) appendNote(lastJourney); });
  $$('img').forEach(img => img.addEventListener('error',() => { if (!img.getAttribute('src')) return; img.dataset.loadError = 'true'; img.alt = 'Imagem indisponível: '+img.alt; },{once:true}));
  applyFocus(); renderSelections(); updateCounter();
})();
