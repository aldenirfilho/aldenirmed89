'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const api = require('../02_Biblioteca_IA_Engine/assets/livros-360x.js');
const config = JSON.parse(fs.readFileSync(path.join(root, '02_Biblioteca_IA_Engine/data/livros_360x_publicacao.json'), 'utf8'));
const productUrl = 'https://www.amazon.com.br/dp/B000000000'; // Fixture, nunca usada na vitrine.
const fixtureIsbn = '9780306406157'; // Apenas teste do dígito verificador.

function fakeCard(id) {
  const link = { hidden: true, href: undefined, removeAttribute(name) { delete this[name]; } };
  const parts = {
    '[data-book360-status]': { textContent: 'Em preparação' },
    '[data-book360-isbn]': { textContent: 'ISBN pendente' },
    '[data-book360-amazon]': link
  };
  return { dataset: { book360: id }, querySelector: name => parts[name], parts, link };
}

test('nenhum dos três livros nasce com ISBN ou endereço comercial', () => {
  assert.deepEqual(Object.keys(config.books).sort(), ['clinica', 'emergencia', 'uti']);
  for (const entry of Object.values(config.books)) {
    assert.equal(entry.isbn, '');
    assert.equal(entry.amazonUrl, '');
    assert.equal(api.publicationFor(entry), null);
  }
});

test('ISBN ausente ou com dígito incorreto nunca ativa produto', () => {
  for (const isbn of ['', '9780306406158', '9780306406157<script>', 9780306406157]) {
    assert.equal(api.publicationFor({ isbn, amazonUrl: productUrl }), null);
  }
  assert.equal(api.normalizeIsbn('978-0-306-40615-7'), fixtureIsbn);
  assert.equal(api.normalizeIsbn('0-306-40615-2'), '0306406152');
});

test('somente produto HTTPS em domínio exato da Amazon é aceito', () => {
  for (const url of [
    'javascript:alert(1)', 'http://www.amazon.com.br/dp/B000000000',
    'https://amazon.com.br.evil.example/dp/B000000000',
    'https://www.amazon.com.br@evil.example/dp/B000000000',
    'https://u:p@www.amazon.com.br/dp/B000000000',
    'https://www.amazon.com.br:8443/dp/B000000000',
    'https://www.amazon.com.br/', 'https://amzn.to/example', '', null
  ]) assert.equal(api.normalizeAmazonUrl(url), null, String(url));
  assert.equal(api.normalizeAmazonUrl(productUrl), productUrl);
  assert.equal(api.normalizeAmazonUrl('https://amazon.com/gp/product/B000000000?ref=test'), 'https://amazon.com/gp/product/B000000000?ref=test');
});

test('cada livro é ativado individualmente, e configuração inválida restaura estado seguro', () => {
  const cards = ['emergencia', 'uti', 'clinica'].map(fakeCard);
  const doc = { querySelectorAll: () => cards };
  api.applyPublications(doc, { schemaVersion: 1, books: { uti: { isbn: fixtureIsbn, amazonUrl: productUrl } } });
  assert.equal(cards[0].link.hidden, true);
  assert.equal(cards[1].link.hidden, false);
  assert.equal(cards[1].link.href, productUrl);
  assert.equal(cards[1].parts['[data-book360-isbn]'].textContent, 'ISBN ' + fixtureIsbn);
  assert.equal(cards[2].link.hidden, true);
  api.applyPublications(doc, config);
  for (const card of cards) {
    assert.equal(card.link.hidden, true);
    assert.equal(card.link.href, undefined);
    assert.equal(card.parts['[data-book360-status]'].textContent, 'Em preparação');
  }
});

test('falha de JSON ou rede não quebra a biblioteca nem ativa links', async () => {
  const cards = [fakeCard('emergencia')];
  const doc = { querySelectorAll: () => cards };
  for (const fetcher of [
    async () => { throw new Error('offline'); },
    async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => { throw new Error('JSON inválido'); } })
  ]) {
    assert.equal(await api.init(doc, fetcher), false);
    assert.equal(cards[0].link.hidden, true);
  }
});

test('configuração é consultada apenas no caminho local e sem cache antigo', async () => {
  let request;
  assert.equal(await api.init({ querySelectorAll: () => [] }, async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => config };
  }), true);
  assert.equal(request.url, 'data/livros_360x_publicacao.json?v=20261019-1');
  assert.equal(request.options.cache, 'no-store');
});

test('HTML preserva busca e acervo; capas completas e links vazios são locais', () => {
  const html = fs.readFileSync(path.join(root, '02_Biblioteca_IA_Engine/index.html'), 'utf8');
  assert.equal((html.match(/data-book360="/g) || []).length, 3);
  assert.equal((html.match(/data-book360-amazon hidden/g) || []).length, 3);
  assert.match(html, /id="busca"/);
  assert.match(html, /id="grid-arquivos"/);
  assert.match(html, /id="view-estudo"/);
  assert.match(html, /id="acervo-gratuito"/);
  const showcase = html.slice(html.indexOf('<section class="books360"'), html.indexOf('<section class="books360-free"'));
  assert.doesNotMatch(showcase, /youtube|youtu\.be|\.docx|\.pdf|R\$|checkout/i);
  assert.match(showcase, /Aldenir Rocha de Oliveira Filho/);
  for (const cover of ['emergencia.webp', 'uti.webp', 'clinica-medica.webp']) {
    assert.ok(fs.existsSync(path.join(root, '02_Biblioteca_IA_Engine/assets/livros-360x', cover)));
  }
});
