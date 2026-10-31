/* Seleção diária determinística; sem conta, servidor ou dados de visitantes. */
(function (root) {
  'use strict';
  const TIME_ZONE = 'America/Fortaleza';
  function dayKey(date = new Date()) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const value = type => parts.find(part => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  }
  function dayNumber(key) {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [y, m, d] = key.split('-').map(Number);
    if (y < 2000 || y > 2099) return null;
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toISOString().slice(0, 10) === key ? date.getTime() / 86400000 : null;
  }
  function select(entries, key) {
    const day = dayNumber(key);
    if (day === null || !Array.isArray(entries) || !entries.length) return null;
    const ordered = [...entries].sort((a, b) => a.id.localeCompare(b.id));
    return ordered[((day % ordered.length) + ordered.length) % ordered.length];
  }
  function shift(key, offset) {
    const day = dayNumber(key);
    if (day === null || !Number.isInteger(offset)) return null;
    const shifted = new Date((day + offset) * 86400000).toISOString().slice(0, 10);
    return dayNumber(shifted) === null ? null : shifted;
  }
  function shareUrl(key, id) {
    if (dayNumber(key) === null || !/^GF-\d{3}$/.test(id)) return null;
    const url = new URL('https://aldenirfilho.github.io/aldenirmed89/radar-biblico-3min/');
    url.searchParams.set('dia', key);
    url.searchParams.set('leitura', id);
    url.hash = 'hoje';
    return url.href;
  }
  function messageText(entry, key) {
    const url = shareUrl(key, entry.id);
    if (!url) return '';
    return ['📖 Mensagem do dia · ' + key.split('-').reverse().join('/'), entry.title,
      '\n“' + entry.verse + '”', entry.reference + ' · ' + entry.edition,
      '\n💬 Reflexão autoral: ' + entry.summary, '\n🌱 Uma ação possível: ' + entry.action,
      '\n🕊️ Convite voluntário à reflexão; respeite a crença e a vontade de quem recebe.',
      '\nLer e conferir o contexto: ' + entry.blogUrl, '\nRadar Bíblico: ' + url].join('\n');
  }
  const api = Object.freeze({TIME_ZONE, dayKey, dayNumber, select, shift, shareUrl, messageText});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RadarDaily = api;
})(globalThis);
