(function () {
  'use strict';

  function normalizeIsbn(value) {
    if (typeof value !== 'string' || !/^[\dXx\s-]+$/.test(value)) return null;
    const isbn = value.replace(/[\s-]/g, '').toUpperCase();
    if (/^97[89]\d{10}$/.test(isbn)) {
      const sum = [...isbn].reduce((total, digit, i) => total + Number(digit) * (i % 2 ? 3 : 1), 0);
      return sum % 10 === 0 ? isbn : null;
    }
    if (/^\d{9}[\dX]$/.test(isbn)) {
      const sum = [...isbn].reduce((total, digit, i) => total + (digit === 'X' ? 10 : Number(digit)) * (10 - i), 0);
      return sum % 11 === 0 ? isbn : null;
    }
    return null;
  }

  function normalizeAmazonUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      const allowedHosts = ['amazon.com.br', 'www.amazon.com.br', 'amazon.com', 'www.amazon.com'];
      if (url.protocol !== 'https:' || url.username || url.password || url.port || !allowedHosts.includes(url.hostname)) return null;
      if (!/\/(?:dp|gp\/product)\/[A-Z0-9]{10}(?:\/|$)/i.test(url.pathname)) return null;
      return url.href;
    } catch (_) {
      return null;
    }
  }

  function publicationFor(value) {
    if (!value || typeof value !== 'object') return null;
    const isbn = normalizeIsbn(value.isbn);
    const url = normalizeAmazonUrl(value.amazonUrl);
    return isbn && url ? { isbn, url } : null;
  }

  function applyPublications(doc, config) {
    const books = config && config.schemaVersion === 1 && config.books;
    doc.querySelectorAll('[data-book360]').forEach(card => {
      const publication = publicationFor(books && books[card.dataset.book360]);
      const status = card.querySelector('[data-book360-status]');
      const isbn = card.querySelector('[data-book360-isbn]');
      const link = card.querySelector('[data-book360-amazon]');
      if (!status || !isbn || !link) return;
      link.hidden = !publication;
      if (publication) {
        link.href = publication.url;
        status.textContent = 'Disponível na Amazon';
        isbn.textContent = 'ISBN ' + publication.isbn;
      } else {
        link.removeAttribute('href');
        status.textContent = 'Em preparação';
        isbn.textContent = 'ISBN pendente';
      }
    });
  }

  async function init(doc, fetcher) {
    try {
      const response = await fetcher('data/livros_360x_publicacao.json?v=20261019-1', { cache: 'no-store' });
      if (!response.ok) return false;
      applyPublications(doc, await response.json());
      return true;
    } catch (_) {
      return false;
    }
  }

  const api = { normalizeIsbn, normalizeAmazonUrl, publicationFor, applyPublications, init };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof document !== 'undefined' && typeof fetch === 'function') {
    const start = () => init(document, fetch);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }
})();
