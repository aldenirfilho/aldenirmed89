/* Agregados públicos; nunca aceite sessões, e-mails ou eventos individuais. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CrewDailyMetrics = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
  const number = (v) => Number.isSafeInteger(v) && v >= 0;
  const validDay = (v) => {
    if (typeof v !== 'string' || !dayPattern.test(v)) return false;
    const date = new Date(v + 'T12:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === v;
  };
  function keys(obj, allowed) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) || Object.keys(obj).some(k => !allowed.includes(k))) throw Error('Formato não reconhecido: use somente o relatório agregado do conversor.');
  }
  function validate(data) {
    keys(data, ['schemaVersion','status','source','days']);
    if (data.schemaVersion !== 1 || !['ready','unavailable'].includes(data.status) || !Array.isArray(data.days) || data.days.length > 3660) throw Error('Versão ou série diária inválida.');
    keys(data.source, ['provider','generatedAt','timezone','method','sourceSha256','excludedRows','coverage']);
    const src=data.source;
    if (typeof src.provider !== 'string' || src.provider.length > 80 || !['America/Fortaleza','UTC'].includes(src.timezone) || typeof src.method !== 'string' || src.method.length > 700) throw Error('Origem ou fuso horário inválido.');
    if (src.generatedAt !== null && (typeof src.generatedAt !== 'string' || !Number.isFinite(Date.parse(src.generatedAt)))) throw Error('Data da exportação inválida.');
    if (src.sourceSha256 !== null && !/^[a-f0-9]{64}$/.test(src.sourceSha256)) throw Error('Hash da origem inválido.');
    if (typeof src.coverage !== 'string' || src.coverage.length > 300 || !number(src.excludedRows)) throw Error('Cobertura inválida.');
    const seen = new Set();
    const days=data.days.map(day => {
      keys(day,['date','visitors','views','pages']);
      if (!validDay(day.date) || seen.has(day.date) || !number(day.views) || (day.visitors !== null && (!number(day.visitors) || day.visitors > day.views)) || !Array.isArray(day.pages) || day.pages.length > 10000) throw Error('Dia repetido, data ou contagem inválida.');
      seen.add(day.date); const paths=new Set();
      const pages=day.pages.map(page=> {
        keys(page,['path','views']);
        if (typeof page.path !== 'string' || !/^\/aldenirmed89\/[A-Za-z0-9_./%~-]*$/.test(page.path) || /(?:\.\.|%2e|%2f|%5c)/i.test(page.path) || paths.has(page.path) || !number(page.views)) throw Error('Página inválida ou repetida.');
        paths.add(page.path); return {path:page.path, views:page.views};
      });
      if (pages.reduce((sum,p)=>sum+p.views,0) !== day.views) throw Error('Visualizações do dia não conferem com as páginas.');
      return {date:day.date, visitors:day.visitors, views:day.views, pages};
    }).sort((a,b)=>a.date.localeCompare(b.date));
    if (!number(days.reduce((sum,day)=>sum+day.views,0))) throw Error('Totais excedem a precisão segura do relatório.');
    if (data.status === 'unavailable' && days.length) throw Error('Fonte indisponível não pode conter observações.');
    return {schemaVersion:1,status:data.status,source:{...src},days};
  }
  function select(data,start,end) {
    const days=data.days.filter(d=>(!start || d.date>=start) && (!end || d.date<=end));
    const pageMap=new Map();
    days.forEach(d=>d.pages.forEach(p=>pageMap.set(p.path,(pageMap.get(p.path)||0)+p.views)));
    return {days,views:days.length ? days.reduce((n,d)=>n+d.views,0) : null,
      visitorDays:days.length && days.every(d=>d.visitors !== null) ? days.reduce((n,d)=>n+d.visitors,0) : null,
      pages:Array.from(pageMap,([path,views])=>({path,views})).sort((a,b)=>b.views-a.views||a.path.localeCompare(b.path))};
  }
  return {validate,select,validDay};
});
