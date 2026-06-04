/**
 * LEITOR MARKDOWN PRO v3.1 — ANTIGRAVITY
 * Renderização profissional via Marked.js + Frontmatter Parser.
 */

const params = new URLSearchParams(location.search);
const docPath = params.get('doc') || 'content/modelos/template_estudo_seguro.md';
const body = document.getElementById('markdownBody');
const meta = document.getElementById('readerMeta');

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
    body.innerHTML = '<p class="muted">📦 Carregando conteúdo clínico...</p>';
    
    const res = await fetch(docPath + '?t=' + Date.now());
    if (!res.ok) throw new Error(`Não consegui encontrar o arquivo: ${docPath}`);
    
    const text = await res.text();
    const [fm, content] = parseFrontmatter(text);

    // 1. Atualizar Metadados Lateral
    meta.innerHTML = `
      <div class="meta-card">
        <div class="meta-icon">${fm.icon || '📄'}</div>
        <h2>${fm.title || 'Documento sem título'}</h2>
        <div class="meta-badge">${fm.status || 'ativo'}</div>
        <hr>
        <p><strong>ID:</strong> <code>${fm.id || '—'}</code></p>
        <p><strong>Versão:</strong> ${fm.version || 'v1.0'}</p>
        <p><strong>Tema:</strong> ${fm.theme || 'clínica'}</p>
        <p><strong>Data:</strong> ${fm.updated || '2026-05-08'}</p>
        <p><strong>Tags:</strong> <br>${(fm.tags || '').split(',').map(t => `<span class="tag">${t.trim()}</span>`).join(' ')}</p>
        <hr>
        <div class="meta-actions">
          <a class="btn primary" href="${docPath}" download>⬇️ Baixar MD</a>
          <button class="btn ghost" onclick="window.print()">🖨️ Imprimir</button>
        </div>
      </div>
    `;

    // 2. Renderizar Markdown usando Marked.js
    if (typeof marked !== 'undefined') {
      body.innerHTML = marked.parse(content);
    } else {
      // Fallback básico se a CDN falhar
      body.innerHTML = `<pre style="white-space:pre-wrap">${content}</pre>`;
      console.warn("Marked.js não carregou. Usando fallback pre-wrap.");
    }

  } catch (err) {
    body.innerHTML = `
      <div class="error-box">
        <h1>⚠️ Erro de Leitura</h1>
        <p>${err.message}</p>
        <a href="index.html" class="btn primary">Voltar ao Catálogo</a>
      </div>
    `;
  }
}

// Iniciar carregamento
loadDoc();
