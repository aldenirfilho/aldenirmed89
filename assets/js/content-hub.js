const state = {
  catalog: { items: [], formats: [], module: {} },
  format: "todos",
  source: "todos",
  query: ""
};

const fmtIcon = {
  pdf: "📄", ebook: "📘", word: "📝", spreadsheet: "📊", markdown: "⬇️", csv: "📈",
  presentation: "📽️", text: "📃", anki: "🃏", html: "🌐", image: "🖼️",
  video: "🎬", audio: "🎧", archive: "🗜️", link: "🔗", file: "📦"
};

function safePath(path, allowExternal = false) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw || raw.includes("\\") || raw.includes("\0")) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }

  if (allowExternal) {
    if (!/^https?:\/\//i.test(decoded)) return null;
    try {
      const external = new URL(decoded);
      if (!["http:", "https:"].includes(external.protocol) || external.username || external.password) return null;
      return external.href;
    } catch {
      return null;
    }
  }

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(decoded)) return null;
  const segments = decoded.split("/");
  if (segments.some(segment => !segment || segment === "." || segment === "..")) return null;

  const base = new URL("./", window.location.href);
  const encoded = segments.map(segment => encodeURIComponent(segment)).join("/");
  const resolved = new URL(encoded, base);
  if (resolved.origin !== window.location.origin || !resolved.pathname.startsWith(base.pathname)) return null;
  return resolved.href;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsArg(value) {
  return escapeHtml(String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n"));
}

function bytesLabel(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function initHub() {
  const res = await fetch("data/catalogo.json");
  state.catalog = res.ok ? await res.json() : { items: [], formats: [], module: {} };
  renderStats();
  renderFilters();
  renderGrid();
}

function renderStats() {
  const items = state.catalog.items || [];
  const files = items.filter(i => i.source !== "link").length;
  const links = items.filter(i => i.source === "link").length;
  document.getElementById("stat-total").textContent = items.length;
  document.getElementById("stat-files").textContent = files;
  document.getElementById("stat-links").textContent = links;
  document.getElementById("stat-formats").textContent = new Set(items.map(i => i.format)).size;
}

function renderFilters() {
  const formatSelect = document.getElementById("format-filter");
  const sourceSelect = document.getElementById("source-filter");
  const tabs = document.getElementById("format-tabs");
  const formats = state.catalog.formats || [];

  formatSelect.innerHTML = `<option value="todos">Todos os formatos</option>` +
    formats.map(f => `<option value="${f.id}">${f.emoji || fmtIcon[f.id] || "📦"} ${f.label} (${f.count})</option>`).join("");

  sourceSelect.innerHTML = `
    <option value="todos">Arquivos e links</option>
    <option value="file">Somente arquivos</option>
    <option value="link">Somente links</option>
  `;

  tabs.innerHTML = `<button class="tab active" data-format="todos" onclick="setFormat('todos')">Todos</button>` +
    formats.map(f => `<button class="tab" data-format="${f.id}" onclick="setFormat('${f.id}')">${f.emoji || fmtIcon[f.id] || "📦"} ${f.label} · ${f.count}</button>`).join("");
}

function setFormat(format) {
  state.format = format;
  document.getElementById("format-filter").value = format;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.format === format));
  renderGrid();
}

function setSource(source) {
  state.source = source;
  renderGrid();
}

function setQuery(value) {
  state.query = value.toLowerCase().trim();
  renderGrid();
}

function clearFilters() {
  state.format = "todos";
  state.source = "todos";
  state.query = "";
  document.getElementById("search").value = "";
  document.getElementById("format-filter").value = "todos";
  document.getElementById("source-filter").value = "todos";
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.format === "todos"));
  renderGrid();
}

function filteredItems() {
  return (state.catalog.items || []).filter(item => {
    const haystack = [
      item.title, item.filename, item.description, item.formatLabel, item.source,
      ...(item.tags || [])
    ].filter(Boolean).join(" ").toLowerCase();
    const okQuery = !state.query || haystack.includes(state.query);
    const okFormat = state.format === "todos" || item.format === state.format;
    const okSource = state.source === "todos" || item.source === state.source;
    return okQuery && okFormat && okSource;
  });
}

function renderGrid() {
  const grid = document.getElementById("items-grid");
  const empty = document.getElementById("empty-state");
  const count = document.getElementById("result-count");
  const items = filteredItems();
  count.textContent = `${items.length} item(ns) encontrado(s)`;
  empty.style.display = items.length ? "none" : "block";
  grid.innerHTML = items.map(item => {
    const icon = item.formatEmoji || fmtIcon[item.format] || "📦";
    const href = safePath(item.path || item.url, item.source === "link") || "#";
    const size = item.sizeBytes ? ` · ${bytesLabel(item.sizeBytes)}` : "";
    const fileLabel = item.source === "link" ? "Link externo" : `${item.filename || "Arquivo"}${size}`;
    const download = item.source === "link" ? "" : `<a class="btn" href="${escapeHtml(href)}" download>⬇️ Baixar</a>`;
    const title = item.title || item.filename || "Item";
    return `
      <article class="card">
        <div class="icon">${escapeHtml(icon)}</div>
        <div class="title">${escapeHtml(title)}</div>
        <div class="meta">${escapeHtml(item.formatLabel || item.format)} · ${escapeHtml(fileLabel)}</div>
        <p class="desc">${escapeHtml(item.description || "Conteudo aguardando descricao e curadoria.")}</p>
        <div class="tags">${(item.tags || []).slice(0, 8).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}</div>
        <div class="actions">
          <button class="btn primary" onclick="openPreview('${escapeJsArg(encodeURIComponent(item.path || item.url))}','${escapeJsArg(title)}','${escapeJsArg(item.format)}','${escapeJsArg(item.source)}')">👁️ Ver</button>
          <a class="btn" href="${escapeHtml(href)}" target="_blank" rel="noopener">🔗 Abrir</a>
          ${download}
        </div>
      </article>
    `;
  }).join("");
}

function openPreview(encodedPath, title, format, source) {
  const path = decodeURIComponent(encodedPath);
  const href = safePath(path, source === "link");
  if (!href) {
    console.error("Preview bloqueado: caminho fora da área permitida.", path);
    return;
  }
  const safeHref = escapeHtml(href);
  const safeTitle = escapeHtml(title);
  const overlay = document.getElementById("preview");
  const frame = document.getElementById("preview-frame");
  const body = document.getElementById("preview-body");
  const direct = document.getElementById("preview-direct");
  const download = document.getElementById("preview-download");
  document.getElementById("preview-title").textContent = title;
  direct.href = href;
  download.href = href;
  download.style.display = source === "link" ? "none" : "inline-flex";
  frame.removeAttribute("srcdoc");
  frame.setAttribute("sandbox", "allow-downloads");
  frame.src = "about:blank";
  body.innerHTML = "";
  frame.style.display = "block";
  body.style.display = "none";

  if (source === "link") {
    window.open(href, "_blank", "noopener");
    return;
  }
  if (format === "image") {
    frame.style.display = "none";
    body.style.display = "grid";
    body.innerHTML = `<img src="${safeHref}" alt="${safeTitle}">`;
  } else if (format === "video") {
    frame.style.display = "none";
    body.style.display = "grid";
    body.innerHTML = `<video src="${safeHref}" controls></video>`;
  } else if (format === "audio") {
    frame.style.display = "none";
    body.style.display = "grid";
    body.innerHTML = `<audio src="${safeHref}" controls></audio>`;
  } else if (["word", "spreadsheet", "presentation"].includes(format)) {
    const fullUrl = new URL(href, window.location.href).href;
    frame.setAttribute("sandbox", "allow-scripts allow-forms allow-popups allow-downloads");
    frame.src = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  } else if (format === "anki") {
    frame.srcdoc = `<html><body style="font-family:system-ui;padding:2rem"><h2>Arquivo Anki</h2><p>Baixe e importe no Anki.</p><p><a href="${safeHref}" download>Baixar arquivo</a></p></body></html>`;
  } else if (format === "ebook") {
    frame.srcdoc = `<html><body style="font-family:system-ui;padding:2rem"><h2>Ebook EPUB</h2><p>Use os botões acima para abrir ou baixar o ebook.</p><p><a href="${safeHref}" download>Baixar ebook</a></p></body></html>`;
  } else if (format === "archive") {
    frame.srcdoc = `<html><body style="font-family:system-ui;padding:2rem"><h2>Arquivo compactado</h2><p>Baixe e abra no aplicativo adequado.</p><p><a href="${safeHref}" download>Baixar arquivo</a></p></body></html>`;
  } else {
    frame.src = href;
  }
  overlay.classList.add("open");
}

function closePreview() {
  document.getElementById("preview-frame").src = "about:blank";
  document.getElementById("preview").classList.remove("open");
}

initHub().catch(err => {
  console.error(err);
  document.getElementById("empty-state").style.display = "block";
  document.getElementById("empty-state").textContent = "Erro ao carregar catalogo. Rode scan_inbox.sh.";
});
