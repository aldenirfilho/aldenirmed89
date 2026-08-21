(() => {
  "use strict";

  const catalog = window.ECG_ALMANAC;
  if (!catalog || !Array.isArray(catalog.patterns)) return;

  const preferenceKey = document.documentElement.dataset.preferenceKey || "antigravity:a11y:v1";
  const state = { query: "", category: "all", compare: [] };
  const byId = new Map(catalog.patterns.map((pattern) => [pattern.id, pattern]));
  const references = new Map(catalog.references.map((reference) => [reference.id, reference]));

  const nodes = {
    quickGrid: document.querySelector("#quickGrid"),
    patternGrid: document.querySelector("#patternGrid"),
    filterRow: document.querySelector("#filterRow"),
    catalogSearch: document.querySelector("#catalogSearch"),
    heroSearch: document.querySelector("#heroSearch"),
    heroSearchForm: document.querySelector("#heroSearchForm"),
    clearSearch: document.querySelector("#clearSearch"),
    resultCount: document.querySelector("#resultCount"),
    activeFilter: document.querySelector("#activeFilter"),
    emptyState: document.querySelector("#emptyState"),
    compareTray: document.querySelector("#compareTray"),
    compareSummary: document.querySelector("#compareSummary"),
    openCompare: document.querySelector("#openCompare"),
    clearCompare: document.querySelector("#clearCompare"),
    detailDialog: document.querySelector("#detailDialog"),
    detailContent: document.querySelector("#detailContent"),
    compareDialog: document.querySelector("#compareDialog"),
    compareContent: document.querySelector("#compareContent"),
    fieldGuideGrid: document.querySelector("#fieldGuideGrid"),
    referenceGrid: document.querySelector("#referenceGrid"),
    themeToggle: document.querySelector("#themeToggle"),
    focusToggle: document.querySelector("#focusToggle")
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function list(items) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function showDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function renderQuickScan() {
    nodes.quickGrid.innerHTML = catalog.quickScan.map((item) => `
      <li><b>${escapeHtml(item.step)}</b><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></li>
    `).join("");
  }

  function categoryLabel(value) {
    const labels = {
      fundamentos: "Fundamentos",
      isquemia: "Isquemia",
      inflamacao: "Inflamação/pericárdio",
      eletrolitos: "Eletrólitos",
      bloqueios: "Bloqueios",
      taquiarritmias: "Taquiarritmias",
      repolarizacao: "Repolarização",
      canalopatias: "Canalopatias",
      sobrecarga: "Sobrecarga/TEP",
      sistemicos: "Sistêmicos"
    };
    return labels[value] || value;
  }

  function urgencyLabel(value) {
    return { emergencia: "Emergência", urgente: "Atenção urgente", contexto: "Contextual", base: "Base técnica" }[value] || value;
  }

  function renderFilters() {
    const categories = [...new Set(catalog.patterns.map((pattern) => pattern.category))];
    const items = [{ value: "all", label: "Todos" }, ...categories.map((value) => ({ value, label: categoryLabel(value) }))];
    nodes.filterRow.innerHTML = items.map((item) => `
      <button class="filter-chip" type="button" data-category="${escapeHtml(item.value)}" aria-pressed="${state.category === item.value}">${escapeHtml(item.label)}</button>
    `).join("");
  }

  function searchableText(pattern) {
    return normalize([
      pattern.number, pattern.title, pattern.short, pattern.category, pattern.urgency,
      pattern.firstLook, pattern.leads, pattern.measure, pattern.context,
      ...pattern.tags, ...pattern.findings, ...pattern.mimics, ...pattern.action,
      ...pattern.prevention, ...pattern.limits
    ].join(" "));
  }

  function filteredPatterns() {
    const query = normalize(state.query);
    return catalog.patterns.filter((pattern) => {
      const categoryMatch = state.category === "all" || pattern.category === state.category;
      const queryMatch = !query || searchableText(pattern).includes(query);
      return categoryMatch && queryMatch;
    });
  }

  function renderPatternCard(pattern) {
    const selected = state.compare.includes(pattern.id);
    return `
      <article class="pattern-card" data-pattern-id="${escapeHtml(pattern.id)}">
        <button class="pattern-image-button" type="button" data-open-detail="${escapeHtml(pattern.id)}" aria-label="Abrir guia ${escapeHtml(pattern.title)}">
          <img src="${escapeHtml(pattern.image)}" alt="${escapeHtml(pattern.imageAlt)}" width="1792" height="1024" loading="lazy" decoding="async">
          <span class="image-label">${pattern.imageKind === "real" ? "ECG real anonimizado" : "Traçado sintético"}</span>
        </button>
        <div class="pattern-body">
          <div class="card-meta"><span>#${String(pattern.number).padStart(2, "0")} · ${escapeHtml(categoryLabel(pattern.category))}</span><span class="urgency urgency-${escapeHtml(pattern.urgency)}">${escapeHtml(urgencyLabel(pattern.urgency))}</span></div>
          <h3>${escapeHtml(pattern.title)}</h3>
          <p>${escapeHtml(pattern.short)}</p>
          <div class="first-look"><strong>Veja primeiro</strong>${escapeHtml(pattern.firstLook)}</div>
          <div class="card-actions">
            <button class="button button-primary" type="button" data-open-detail="${escapeHtml(pattern.id)}">Abrir guia</button>
            <button class="button compare-button" type="button" data-compare="${escapeHtml(pattern.id)}" aria-pressed="${selected}">${selected ? "Selecionado" : "Comparar"}</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderPatterns() {
    const items = filteredPatterns();
    nodes.patternGrid.innerHTML = items.map(renderPatternCard).join("");
    nodes.resultCount.textContent = `${items.length} ${items.length === 1 ? "modelo" : "modelos"}`;
    nodes.activeFilter.textContent = state.category === "all" ? "Todos os temas" : categoryLabel(state.category);
    nodes.emptyState.hidden = items.length !== 0;
    renderFilters();
  }

  function detailSection(title, items, className = "") {
    return `<section class="detail-section ${className}"><h3>${escapeHtml(title)}</h3>${list(items)}</section>`;
  }

  function renderSourcePills(pattern) {
    return pattern.refs.map((id) => references.get(id)).filter(Boolean).map((reference) => `
      <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.organization)} · ${escapeHtml(reference.year)}</a>
    `).join("");
  }

  function openDetail(id, updateHash = true) {
    const pattern = byId.get(id);
    if (!pattern) return;
    nodes.detailContent.innerHTML = `
      <div class="detail-shell">
        <div class="detail-hero"><img src="${escapeHtml(pattern.image)}" alt="${escapeHtml(pattern.imageAlt)}" width="1792" height="1024"></div>
        <div class="detail-copy">
          <span class="eyebrow">Modelo ${String(pattern.number).padStart(2, "0")} · ${escapeHtml(categoryLabel(pattern.category))}</span>
          <h2 id="detailTitle">${escapeHtml(pattern.title)}</h2>
          <p class="detail-sub">${escapeHtml(pattern.short)}</p>
          <div class="detail-key">
            <div class="key-card"><strong>Veja primeiro</strong>${escapeHtml(pattern.firstLook)}</div>
            <div class="key-card"><strong>Derivações</strong>${escapeHtml(pattern.leads)}</div>
            <div class="key-card"><strong>Meça</strong>${escapeHtml(pattern.measure)}</div>
          </div>
          <div class="detail-grid">
            ${detailSection("Achados-chave", pattern.findings)}
            <section class="detail-section"><h3>Contexto típico</h3><p>${escapeHtml(pattern.context)}</p></section>
            ${detailSection("Compare com", pattern.mimics)}
            ${detailSection("Próxima ação segura", pattern.action, "action")}
            ${detailSection("Prevenção e seguimento", pattern.prevention)}
            ${detailSection("Limites e armadilhas", pattern.limits, "limit")}
          </div>
          <div class="source-pills" aria-label="Fontes deste modelo">${renderSourcePills(pattern)}</div>
        </div>
      </div>
    `;
    showDialog(nodes.detailDialog);
    if (updateHash) history.replaceState(null, "", `#padrao=${encodeURIComponent(id)}`);
  }

  function updateCompareTray() {
    if (state.compare.length === 0) {
      nodes.compareTray.hidden = true;
      return;
    }
    nodes.compareTray.hidden = false;
    const names = state.compare.map((id) => byId.get(id)?.title).filter(Boolean);
    nodes.compareSummary.textContent = state.compare.length === 1 ? `${names[0]} · escolha mais um.` : `${names[0]} × ${names[1]}`;
    nodes.openCompare.disabled = state.compare.length !== 2;
  }

  function toggleCompare(id) {
    if (!byId.has(id)) return;
    if (state.compare.includes(id)) state.compare = state.compare.filter((item) => item !== id);
    else if (state.compare.length < 2) state.compare = [...state.compare, id];
    else state.compare = [state.compare[1], id];
    updateCompareTray();
    renderPatterns();
  }

  function compareColumn(pattern) {
    return `
      <article class="comparison-column">
        <img src="${escapeHtml(pattern.image)}" alt="${escapeHtml(pattern.imageAlt)}" width="1792" height="1024">
        <div>
          <h3>${escapeHtml(pattern.title)}</h3>
          <div class="comparison-row"><strong>Veja primeiro</strong><span>${escapeHtml(pattern.firstLook)}</span></div>
          <div class="comparison-row"><strong>Derivações</strong><span>${escapeHtml(pattern.leads)}</span></div>
          <div class="comparison-row"><strong>Meça</strong><span>${escapeHtml(pattern.measure)}</span></div>
          <div class="comparison-row"><strong>Contexto</strong><span>${escapeHtml(pattern.context)}</span></div>
          <div class="comparison-row"><strong>Ação</strong><span>${escapeHtml(pattern.action.join(" "))}</span></div>
          <div class="comparison-row"><strong>Limite</strong><span>${escapeHtml(pattern.limits.join(" "))}</span></div>
        </div>
      </article>
    `;
  }

  function openComparison() {
    if (state.compare.length !== 2) return;
    const items = state.compare.map((id) => byId.get(id)).filter(Boolean);
    nodes.compareContent.innerHTML = `
      <div class="compare-shell"><span class="eyebrow">Comparação ativa</span><h2 id="compareTitle">${escapeHtml(items[0].title)} × ${escapeHtml(items[1].title)}</h2><div class="comparison-grid">${items.map(compareColumn).join("")}</div></div>
    `;
    showDialog(nodes.compareDialog);
  }

  function renderFieldGuides() {
    nodes.fieldGuideGrid.innerHTML = catalog.fieldGuides.map((guide) => `
      <article class="field-guide" id="${escapeHtml(guide.id)}"><small>${escapeHtml(guide.category)}</small><h3>${escapeHtml(guide.title)}</h3>${list(guide.items)}</article>
    `).join("");
  }

  function renderReferences() {
    nodes.referenceGrid.innerHTML = catalog.references.map((reference) => `
      <a class="reference-card" href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer"><small>${escapeHtml(reference.organization)} · ${escapeHtml(reference.year)}</small><strong>${escapeHtml(reference.title)}</strong><span>Abrir fonte original ↗</span></a>
    `).join("");
  }

  function applyQuery(value) {
    state.query = value;
    nodes.catalogSearch.value = value;
    nodes.heroSearch.value = value;
    renderPatterns();
  }

  function readPreferences() {
    let preferences = {};
    try { preferences = JSON.parse(localStorage.getItem(preferenceKey) || "{}"); } catch (_) { preferences = {}; }
    const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const resolvedTheme = preferences.theme === "system"
      ? (systemLight ? "light" : "dark")
      : preferences.theme;
    const light = resolvedTheme === "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    nodes.themeToggle.setAttribute("aria-pressed", String(light));
    nodes.themeToggle.textContent = light ? "🌙 Escura" : "☀️ Clara";
  }

  function saveTheme(theme) {
    let preferences = {};
    try { preferences = JSON.parse(localStorage.getItem(preferenceKey) || "{}"); } catch (_) { preferences = {}; }
    preferences.theme = theme === "light" ? "light" : "dark";
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  }

  nodes.heroSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyQuery(nodes.heroSearch.value);
    document.querySelector("#modelos").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  nodes.heroSearch.addEventListener("input", () => applyQuery(nodes.heroSearch.value));
  nodes.catalogSearch.addEventListener("input", () => applyQuery(nodes.catalogSearch.value));
  nodes.clearSearch.addEventListener("click", () => { applyQuery(""); nodes.catalogSearch.focus(); });
  nodes.filterRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderPatterns();
  });
  nodes.patternGrid.addEventListener("click", (event) => {
    const detailButton = event.target.closest("[data-open-detail]");
    if (detailButton) { openDetail(detailButton.dataset.openDetail); return; }
    const compareButton = event.target.closest("[data-compare]");
    if (compareButton) toggleCompare(compareButton.dataset.compare);
  });
  nodes.openCompare.addEventListener("click", openComparison);
  nodes.clearCompare.addEventListener("click", () => { state.compare = []; updateCompareTray(); renderPatterns(); });
  nodes.themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    nodes.themeToggle.setAttribute("aria-pressed", String(next === "light"));
    nodes.themeToggle.textContent = next === "light" ? "🌙 Escura" : "☀️ Clara";
    saveTheme(next);
  });
  nodes.focusToggle.addEventListener("click", () => {
    const active = document.body.classList.toggle("focus-mode");
    nodes.focusToggle.setAttribute("aria-pressed", String(active));
    nodes.focusToggle.textContent = active ? "↩️ Completo" : "🎯 Foco";
  });
  [nodes.detailDialog, nodes.compareDialog].forEach((dialog) => dialog.addEventListener("close", () => {
    if (location.hash.startsWith("#padrao=")) history.replaceState(null, "", location.pathname + location.search);
  }));

  renderQuickScan();
  renderFilters();
  renderPatterns();
  renderFieldGuides();
  renderReferences();
  readPreferences();
  updateCompareTray();

  if (location.hash.startsWith("#padrao=")) {
    const id = decodeURIComponent(location.hash.slice("#padrao=".length));
    if (byId.has(id)) openDetail(id, false);
  }
})();
