const {test} = require('node:test');
const assert = require('node:assert/strict');
const core = require('../radar-biblico-3min/daily-core.js');
const catalog = require('../radar-biblico-3min/daily-messages.js');

test('a virada do dia ocorre à meia-noite de Sobral, sem depender do fuso do aparelho', () => {
  assert.equal(core.dayKey(new Date('2026-11-01T02:59:59Z')), '2026-10-31');
  assert.equal(core.dayKey(new Date('2026-11-01T03:00:00Z')), '2026-11-01');
  assert.equal(core.dayKey(new Date('invalid')), null);
});
test('datas inválidas, normalizadas silenciosamente ou fora de faixa são rejeitadas', () => {
  for(const value of ['2026-02-29','2026-11-31','2026-13-01','2026-1-01','1999-12-31','2100-01-01',null,'<script>']) {
    assert.equal(core.dayNumber(value),null,String(value));
    assert.equal(core.select(catalog.entries,value),null,String(value));
  }
  assert.equal(core.shift('2028-02-28',1),'2028-02-29');
  assert.equal(core.shift('2026-12-31',1),'2027-01-01');
});
test('a mesma data retorna a mesma mensagem mesmo se o catálogo vier em outra ordem', () => {
  const key='2026-10-31';
  assert.equal(core.select(catalog.entries,key).id,core.select([...catalog.entries].reverse(),key).id);
  // 20.757 dias desde 1970: resto 21, posição 22 no acervo público.
  assert.equal(core.select(catalog.entries,key).id,'GF-022');
  assert.equal(core.select(catalog.entries,'2026-11-01').id,'GF-023');
});
test('um ciclo percorre todas as leituras sem repetição e volta ao início', () => {
  const start='2026-10-31', n=catalog.entries.length;
  const ids=Array.from({length:n},(_,i)=>core.select(catalog.entries,core.shift(start,i)).id);
  assert.equal(new Set(ids).size,n);
  assert.equal(core.select(catalog.entries,core.shift(start,n)).id,ids[0]);
  assert.equal(core.select([],start),null);
});
test('o compartilhamento fixa a data e o identificador e preserva a citação e o contexto', () => {
  const entry=catalog.entries[0],key='2026-10-31';
  const url=new URL(core.shareUrl(key,entry.id));
  assert.equal(url.origin,'https://aldenirfilho.github.io');
  assert.equal(url.searchParams.get('leitura'),entry.id);
  assert.equal(url.searchParams.get('dia'),key);
  assert.equal(url.hash,'#hoje');
  const text=core.messageText(entry,key);
  assert(text.includes(entry.verse));assert(text.includes(entry.blogUrl));
  assert(text.includes('Reflexão autoral'));assert(text.includes('voluntário'));
  assert.equal(core.shareUrl(key,'javascript:alert(1)'),null);
});
test('o acervo usa somente as 24 leituras públicas conferidas, com fontes rastreáveis', () => {
  assert.equal(catalog.entries.length,24);
  assert.equal(new Set(catalog.entries.map(m=>m.id)).size,24);
  for(const entry of catalog.entries){
    assert.match(entry.publicPageSha256,/^[a-f0-9]{64}$/);
    assert.equal(new URL(entry.blogUrl).origin,catalog.blogUrl);
    assert.equal(new URL(entry.sourceUrl).origin,'https://www.gutenberg.org');
    assert.equal(entry.theologicalReview,'pendente');
    for(const key of ['title','verse','summary','context','question','action','care'])assert(entry[key].trim());
  }
});
