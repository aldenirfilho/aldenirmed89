(function () {
  'use strict';
  const core = window.RadarDaily, data = window.RadarDailyMessages;
  const $ = id => document.getElementById(id);
  if (!core || !data || !data.entries.length || !$('hoje')) return;
  const params = new URLSearchParams(location.search);
  const validDate = core.dayNumber(params.get('dia')) !== null;
  let selectedDate = validDate ? params.get('dia') : core.dayKey();
  let pinnedId = data.entries.some(entry => entry.id === params.get('leitura')) ? params.get('leitura') : null;
  let followToday = !validDate && !pinnedId;
  let entry;
  const shortDate = key => key.split('-').reverse().join('/');
  const status = text => { $('daily-status').textContent = text; };
  const put = (id, text) => { $(id).textContent = text; };
  function render() {
    entry = (pinnedId && data.entries.find(item => item.id === pinnedId)) || core.select(data.entries, selectedDate);
    if (!entry) return;
    const today = core.dayKey();
    put('daily-label', (selectedDate === today ? 'Mensagem de hoje' : 'Leitura de ' + shortDate(selectedDate)) + ' · horário de Sobral');
    put('daily-date', shortDate(selectedDate));
    $('daily-date').dateTime = selectedDate;
    $('daily-picker').value = selectedDate;
    put('daily-title', entry.title);
    put('daily-situation', entry.situation);
    put('daily-verse', entry.verse);
    put('daily-source', entry.reference + ' · ' + entry.edition + ' ↗');
    $('daily-source').href = entry.sourceUrl;
    put('daily-context', entry.context);
    put('daily-unit', 'Contexto de leitura: ' + entry.readingUnit);
    put('daily-question', entry.question);
    put('daily-reflection', entry.summary);
    put('daily-action', entry.action);
    put('daily-care', entry.care);
    $('daily-blog-reading').href = entry.blogUrl;
    $('daily-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(core.messageText(entry, selectedDate));
    put('daily-provenance', 'Acervo: ' + data.blogName + ' · edição ' + data.sourceVersion +
      ' · conexão conferida em ' + shortDate(data.verifiedOn) + '. Revisão teológica independente pendente.');
    $('daily-reflection-box').open = false;
    $('daily-fallback').hidden = true;
    $('daily-content').hidden = false;
    $('daily-loading').hidden = true;
    renderRecent(today);
    status('');
  }
  function openDate(date, id = null, today = false) {
    if (core.dayNumber(date) === null) { status('Escolha uma data válida entre 2000 e 2099.'); return; }
    selectedDate = date; pinnedId = id; followToday = today;
    const url = new URL(location.href);
    url.searchParams.delete('dia'); url.searchParams.delete('leitura');
    if (!today) {
      url.searchParams.set('dia', date);
      if (id) url.searchParams.set('leitura', id);
    }
    url.hash = 'hoje';
    history.replaceState(null, '', url);
    document.dispatchEvent(new CustomEvent('radar:open-tab', {detail:'hoje'}));
    render();
  }
  function renderRecent(today) {
    const host = $('daily-recent'); host.replaceChildren();
    for (let i = 0; i < 7; i++) {
      const key = core.shift(today, -i), message = core.select(data.entries, key);
      const link = document.createElement('a');
      link.href = core.shareUrl(key, message.id);
      link.textContent = i === 0 ? 'Hoje' : shortDate(key).slice(0, 5);
      link.title = message.title;
      if (key === selectedDate) link.setAttribute('aria-current', 'date');
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); openDate(key, message.id);
      });
      host.append(link);
    }
  }
  async function copy() {
    const text = core.messageText(entry, selectedDate);
    try {
      await navigator.clipboard.writeText(text);
      $('daily-fallback').hidden = true;
      status('Mensagem copiada. Escolha com quem compartilhar.');
    } catch (_) {
      $('daily-fallback').hidden = false;
      $('daily-copy-text').value = text;
      $('daily-copy-text').focus(); $('daily-copy-text').select();
      status('Use Copiar no texto selecionado. O navegador não liberou a cópia automática.');
    }
  }
  $('daily-picker').addEventListener('change', event => openDate(event.target.value));
  $('daily-today').addEventListener('click', () => openDate(core.dayKey(), null, true));
  $('daily-copy').addEventListener('click', copy);
  $('daily-share').addEventListener('click', async () => {
    if (!navigator.share) { await copy(); return; }
    try { await navigator.share({title: entry.title, text: core.messageText(entry, selectedDate)}); }
    catch (error) { if (error.name !== 'AbortError') await copy(); }
  });
  const refresh = () => {
    if (followToday && selectedDate !== core.dayKey()) {
      selectedDate = core.dayKey(); pinnedId = null; render();
      status('A mensagem foi atualizada para o novo dia em Sobral.');
    }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('pageshow', refresh);
  setInterval(refresh, 60000);
  render();
})();
