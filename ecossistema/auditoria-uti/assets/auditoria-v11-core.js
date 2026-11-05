/* Auditoria UTI 360X v1.1 — funções puras, sem rede ou dependências. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UTI360XPlusCore = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const headers = ['sku','data','instituicao','processo','preco_embalagem','unidades_base','url','marca','observacoes'];
  const norm = v => String(v == null ? '' : v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s+'T00:00:00Z')) && new Date(s+'T00:00:00Z').toISOString().slice(0,10) === s;
  function todayISO(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Fortaleza', year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const part = t => parts.find(p => p.type === t).value;
    return part('year')+'-'+part('month')+'-'+part('day');
  }
  function validUrl(s) {
    try { const u = new URL(s); return ['http:','https:'].includes(u.protocol) && !!u.hostname && !u.username && !u.password; }
    catch (_) { return false; }
  }
  function parseNumber(value) {
    const s = String(value == null ? '' : value).trim();
    if (!s) return null;
    let cleaned;
    if (s.includes(',')) {
      if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,6}$/.test(s)) return null;
      cleaned = s.replace(/\./g,'').replace(',','.');
    } else {
      if (!/^\d+(?:\.\d{1,6})?$/.test(s)) return null;
      // Um ponto com três casas pode significar milhar. Exigir desambiguação.
      if (/^[1-9]\d{0,2}\.\d{3}$/.test(s)) return null;
      cleaned = s;
    }
    const n = Number(cleaned);
    return finite(n) && n <= 1e12 ? n : null;
  }
  function parseCSV(text) {
    if (typeof text !== 'string' || text.length > 2e6) throw Error('CSV inválido ou maior que 2 MB.');
    text = text.replace(/^\uFEFF/,'');
    const first = text.split(/\r?\n/)[0];
    const delimiter = first.includes(';') ? ';' : ',';
    const rows = []; let row = [], field = '', quoted = false, closed = false;
    const add = () => { row.push(field); field = ''; closed = false; };
    const end = () => { add(); if (row.some(v => v.trim())) rows.push(row); row = []; if (rows.length > 301) throw Error('Limite de 300 linhas por importação.'); };
    for (let i=0; i<text.length; i++) {
      const c=text[i];
      if (quoted) {
        if (c==='"') { if (text[i+1]==='"') {field+='"';i++;} else {quoted=false;closed=true;} }
        else field+=c;
      } else if (c==='"') {
        if (field || closed) throw Error('Aspas malformadas no CSV.');
        quoted=true;
      } else if (c===delimiter) add();
      else if (c==='\r' || c==='\n') { if (c==='\r' && text[i+1]==='\n') i++; end(); }
      else { if (closed) throw Error('Texto após o fechamento de aspas.'); field+=c; }
      if (field.length > 2000 || row.length > 15) throw Error('Campo ou linha acima do limite.');
    }
    if (quoted) throw Error('Aspas não fechadas no CSV.');
    if (field || row.length || closed) end();
    if (rows.length<2) throw Error('O CSV precisa de cabeçalho e ao menos uma referência.');
    return rows;
  }
  const referenceKey = r => [r.sku,norm(r.organization),norm(r.process)].join('|');
  function validateImport(text, items, existing, today = todayISO()) {
    const rows=parseCSV(text); const names=rows.shift().map(v=>norm(v));
    if (names.length!==headers.length || names.some((v,i)=>v!==headers[i])) throw Error('Cabeçalho diferente do modelo. Baixe o CSV-modelo e preserve as nove colunas.');
    if (!Array.isArray(items) || !Array.isArray(existing)) throw Error('Base indisponível.');
    const known = new Set(existing.map(referenceKey)); const clean = [], errors=[];
    for (let i=0;i<rows.length;i++) {
      const r=rows[i]; const fail=m=>errors.push('Linha '+(i+2)+': '+m);
      if (r.length!==headers.length) {fail('número de colunas incorreto.');continue;}
      const [sku,date,org,proc,p,f,url,brand,notes]=r.map(v=>v.trim());
      const price=parseNumber(p), factor=parseNumber(f);
      if (!items.some(x=>x.id===sku)) {fail('código de item desconhecido.');continue;}
      if (!validDate(date)||date<'2000-01-01'||date>today) {fail('data inválida ou futura; use AAAA-MM-DD.');continue;}
      if (!org||!proc||org.length>180||proc.length>300) {fail('instituição e processo são obrigatórios (máximo 180/300 caracteres).');continue;}
      if (!finite(price)||price<=0||!finite(factor)||factor<=0||factor>1e9) {fail('preço/fator inválido ou ambíguo; use 1234,56 ou 1234.56, sem R$.');continue;}
      if (!validUrl(url)||url.length>1500||brand.length>300||notes.length>1500) {fail('URL http(s) sem credenciais e textos dentro dos limites são obrigatórios.');continue;}
      const ref={id:'csv-'+i+'-'+sku,sku,date,organization:org,process:proc,recordPrice:price,factor,url,brand,notes,recordType:'Importação local; verificar documento',recordUnit:'embalagem informada',sourceId:'LOCAL',state:'',origin:'Manual',equivalent:false,include:true};
      if (known.has(referenceKey(ref))) {fail('mesmo item, instituição e processo já cadastrados.');continue;}
      known.add(referenceKey(ref));clean.push(ref);
    }
    if (errors.length) throw Error(errors.slice(0,8).join('\n')+(errors.length>8?'\nMais '+(errors.length-8)+' erro(s).':''));
    return clean;
  }
  function csv(rows) {
    const cell = v => { let s=v==null?'':String(v); if (/^[\s\uFEFF]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s)) s="'"+s; return '"'+s.replace(/"/g,'""')+'"'; };
    return '\uFEFF'+rows.map(r=>r.map(cell).join(';')).join('\r\n');
  }
  function totalCost(a) {
    const keys=['purchase','install','maintenance','consumablesBuy','rent','consumablesRent','returnCost','residual'];
    if (!a || !Number.isInteger(a.months)||a.months<1||a.months>1200||!keys.every(k=>finite(a[k])&&a[k]>=0&&a[k]<=1e12)||a.residual>a.purchase) return {valid:false,buy:null,rent:null,difference:null};
    const buy=a.purchase+a.install+a.months*(a.maintenance+a.consumablesBuy)-a.residual;
    const rent=a.months*(a.rent+a.consumablesRent)+a.returnCost;
    return {valid:true,buy,rent,difference:rent-buy,buyMonthly:buy/a.months,rentMonthly:rent/a.months};
  }
  return {headers,todayISO,validDate,validUrl,parseNumber,parseCSV,referenceKey,validateImport,csv,totalCost};
});
