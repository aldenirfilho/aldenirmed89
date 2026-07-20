/**
 * LEITOR MARKDOWN PRO v3.1 — ANTIGRAVITY
 * Renderização profissional via Marked.js + Frontmatter Parser.
 */

const params = new URLSearchParams(location.search);
const DEFAULT_DOC_PATH = 'content/modelos/template_estudo_seguro.md';
const requestedDocPath = params.get('doc') || DEFAULT_DOC_PATH;
const body = document.getElementById('markdownBody');
const meta = document.getElementById('readerMeta');

function resolveDocumentUrl(rawPath) {
  const raw = String(rawPath || '').trim();
  if (!raw || raw.includes('\\') || raw.includes('\0')) {
    throw new Error('Caminho de documento inválido.');
  }

  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    throw new Error('Caminho de documento malformado.');
  }

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(decoded)) {
    throw new Error('Somente documentos locais do catálogo são permitidos.');
  }

  const segments = decoded.split('/');
  if (segments.some(segment => !segment || segment === '.' || segment === '..')) {
    throw new Error('O caminho do documento saiu da área pública permitida.');
  }
  if (!/\.md(?:own)?$/i.test(decoded)) {
    throw new Error('Somente arquivos Markdown podem ser abertos neste leitor.');
  }

  const contentRoot = new URL('content/', location.href);
  const encodedPath = segments.map(segment => encodeURIComponent(segment)).join('/');
  const documentUrl = new URL(encodedPath, location.href);
  if (documentUrl.origin !== location.origin || !documentUrl.pathname.startsWith(contentRoot.pathname)) {
    throw new Error('O documento não pertence ao catálogo público permitido.');
  }
  return documentUrl;
}

function safeAnchorUrl(rawValue, baseUrl) {
  try {
    const url = new URL(String(rawValue || ''), baseUrl);
    if (url.origin === location.origin || url.protocol === 'https:') return url.href;
  } catch {
    // URL inválida: o link será convertido em texto sem navegação.
  }
  return null;
}

function safeImageUrl(rawValue, baseUrl) {
  try {
    const url = new URL(String(rawValue || ''), baseUrl);
    if (url.origin === location.origin && ['http:', 'https:'].includes(url.protocol)) return url.href;
  } catch {
    // URL inválida: a imagem será removida.
  }
  return null;
}

function sanitizeRenderedHtml(html, baseUrl) {
  const allowedTags = new Set([
    'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'PRE', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH',
    'THEAD', 'TR', 'U', 'UL'
  ]);
  const template = document.createElement('template');
  template.innerHTML = String(html || '');

  [...template.content.querySelectorAll('*')].forEach(node => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    const href = node.tagName === 'A' ? node.getAttribute('href') : null;
    const src = node.tagName === 'IMG' ? node.getAttribute('src') : null;
    const alt = node.tagName === 'IMG' ? node.getAttribute('alt') : null;
    const title = node.getAttribute('title');
    const codeClass = node.tagName === 'CODE' ? node.getAttribute('class') : null;
    [...node.attributes].forEach(attribute => node.removeAttribute(attribute.name));

    if (node.tagName === 'A') {
      const safeHref = safeAnchorUrl(href, baseUrl);
      if (safeHref) {
        node.setAttribute('href', safeHref);
        node.setAttribute('rel', 'noopener noreferrer');
        if (new URL(safeHref).origin !== location.origin) node.setAttribute('target', '_blank');
      }
    } else if (node.tagName === 'IMG') {
      const safeSrc = safeImageUrl(src, baseUrl);
      if (!safeSrc) {
        node.replaceWith(document.createTextNode(alt || ''));
        return;
      }
      node.setAttribute('src', safeSrc);
      node.setAttribute('alt', alt || '');
      node.setAttribute('loading', 'lazy');
    } else if (node.tagName === 'CODE' && /^language-[a-z0-9_-]+$/i.test(codeClass || '')) {
      node.setAttribute('class', codeClass);
    }

    if (title) node.setAttribute('title', title);
  });

  const comments = document.createTreeWalker(template.content, NodeFilter.SHOW_COMMENT);
  const commentNodes = [];
  while (comments.nextNode()) commentNodes.push(comments.currentNode);
  commentNodes.forEach(comment => comment.remove());
  return template.content.cloneNode(true);
}

function textElement(tagName, text, className = '') {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = String(text ?? '');
  return element;
}

function appendMetaField(container, label, value, useCode = false) {
  const row = document.createElement('p');
  const strong = textElement('strong', `${label}:`);
  row.append(strong, document.createTextNode(' '));
  row.append(textElement(useCode ? 'code' : 'span', value || '—'));
  container.append(row);
}

function renderMetadata(frontmatter, documentUrl) {
  const card = document.createElement('div');
  card.className = 'meta-card';
  card.append(
    textElement('div', frontmatter.icon || '📄', 'meta-icon'),
    textElement('h2', frontmatter.title || 'Documento sem título'),
    textElement('div', frontmatter.status || 'ativo', 'meta-badge'),
    document.createElement('hr')
  );
  appendMetaField(card, 'ID', frontmatter.id, true);
  appendMetaField(card, 'Versão', frontmatter.version || 'v1.0');
  appendMetaField(card, 'Tema', frontmatter.theme || 'clínica');
  appendMetaField(card, 'Data', frontmatter.updated || 'não informada');

  const tagsRow = document.createElement('p');
  tagsRow.append(textElement('strong', 'Tags:'), document.createElement('br'));
  String(frontmatter.tags || '').split(',').map(tag => tag.trim()).filter(Boolean).forEach(tag => {
    tagsRow.append(textElement('span', tag, 'tag'), document.createTextNode(' '));
  });
  card.append(tagsRow, document.createElement('hr'));

  const actions = document.createElement('div');
  actions.className = 'meta-actions';
  const download = textElement('a', '⬇️ Baixar MD', 'btn primary');
  download.href = documentUrl.href;
  download.download = '';
  const print = textElement('button', '🖨️ Imprimir', 'btn ghost');
  print.type = 'button';
  print.addEventListener('click', () => window.print());
  actions.append(download, print);
  card.append(actions);
  meta.replaceChildren(card);
}

function renderError(message) {
  const box = document.createElement('div');
  box.className = 'error-box';
  box.append(textElement('h1', '⚠️ Erro de Leitura'), textElement('p', message));
  const back = textElement('a', 'Voltar ao Catálogo', 'btn primary');
  back.href = 'index.html';
  box.append(back);
  body.replaceChildren(box);
}

/**
 * Extrai metadados (Frontmatter) do início do arquivo MD.
 */
function parseFrontmatter(md) {
  if (!md.startsWith('---')) return [{}, md];
  const end = md.indexOf('\n---', 3);
  if (end === -1) return [{}, md];
  
  const raw = md.slice(3, end).trim();
  const content = md.slice(end + 4).trim();
  const data = {};
  
  raw.split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      data[key] = val;
    }
  });
  return [data, content];
}

/**
 * Carrega e renderiza o documento.
 */
async function loadDoc() {
  try {
    body.replaceChildren(textElement('p', '📦 Carregando conteúdo clínico...', 'muted'));
    const documentUrl = resolveDocumentUrl(requestedDocPath);
    const fetchUrl = new URL(documentUrl.href);
    fetchUrl.searchParams.set('t', String(Date.now()));
    
    const res = await fetch(fetchUrl, { credentials: 'same-origin', redirect: 'error' });
    if (!res.ok) throw new Error(`Não consegui encontrar o arquivo solicitado (${res.status}).`);
    
    const text = await res.text();
    const [fm, content] = parseFrontmatter(text);

    // 1. Atualizar Metadados Lateral
    renderMetadata(fm, documentUrl);

    // 2. Renderizar Markdown usando Marked.js
    if (typeof marked !== 'undefined') {
      body.replaceChildren(sanitizeRenderedHtml(marked.parse(content), documentUrl));
    } else {
      // Fallback básico se a CDN falhar
      const fallback = textElement('pre', content);
      fallback.className = 'reader-fallback';
      body.replaceChildren(fallback);
      console.warn("Marked.js não carregou. Usando fallback pre-wrap.");
    }

  } catch (err) {
    renderError(err instanceof Error ? err.message : 'Falha inesperada ao abrir o documento.');
  }
}

// Iniciar carregamento
loadDoc();
