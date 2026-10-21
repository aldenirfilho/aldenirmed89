"use strict";

(() => {
  const DATA_URL = "./data/catalog.json";
  const SITES_URL = "./data/sites-360x.json";
  const THEME_KEY = "aldenirmed89:ecosystem-theme:v1";
  const SHARED_THEME_KEY = "antigravity:a11y:v1";
  const PRIORITY_LABELS = Object.freeze({
    agora: "AGORA",
    proximo: "PRÓXIMO",
    incubando: "INCUBANDO",
    pausado: "PAUSADO"
  });
  const PHASE_LABELS = Object.freeze({
    ideia: "IDEIA",
    estruturacao: "ESTRUTURAÇÃO",
    prototipo: "PROTÓTIPO",
    revisao: "EM REVISÃO",
    disponivel: "DISPONÍVEL",
    validado: "VALIDADO"
  });
  const VISIBILITY_LABELS = Object.freeze({
    public: "PÚBLICO",
    "controlled-public": "RESUMO PÚBLICO"
  });
  const state = { catalog: null, query: "", root: "all", priority: "all", sites: [], siteQuery: "", siteCategory: "all" };
  const byId = (id) => document.getElementById(id);
  const make = (tag, text, className = "") => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  const clean = (value, max = 1200) => String(value ?? "").trim().replace(/\u0000/g, "").slice(0, max);
  const fold = (value) => clean(value, 4000).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const asArray = (value) => Array.isArray(value) ? value : [];

  function safeThemeRead() {
    try {
      const shared = JSON.parse(localStorage.getItem(SHARED_THEME_KEY) || "{}");
      if (shared.contrast === true) return "dark";
      const lightProfiles = ["light", "aerospace-light", "minimal", "sepia", "rustic-light", "natural", "modern-serious"];
      if (shared.theme === "system") return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      if (shared.visualProfile) return lightProfiles.includes(shared.visualProfile) ? "light" : "dark";
      if (shared.theme === "light" || shared.theme === "dark") return shared.theme;
      if (shared.clarity === true) return "light";
      return localStorage.getItem(THEME_KEY);
    } catch (_error) { return null; }
  }

  function safeThemeWrite(value) {
    try {
      const shared = JSON.parse(localStorage.getItem(SHARED_THEME_KEY) || "{}");
      shared.theme = value;
      shared.visualProfile = value === "light" ? "aerospace-light" : "aerospace";
      shared.clarity = value === "light";
      shared.contrast = false;
      localStorage.setItem(SHARED_THEME_KEY, JSON.stringify(shared));
      localStorage.setItem(THEME_KEY, value);
    } catch (_error) { /* optional */ }
  }

  function applyTheme(value) {
    const theme = value === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    byId("themeButton").setAttribute("aria-label", theme === "dark" ? "Usar tema claro" : "Usar tema escuro");
  }

  function safeSiteUrl(value) {
    try {
      const url = new URL(String(value));
      return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
    } catch (_error) { return null; }
  }

  function safeSiteImage(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(String(value), document.baseURI);
      return url.origin === window.location.origin ? url.href : null;
    } catch (_error) { return null; }
  }

  function siteCard(project) {
    const card = make("article", null, "site-card");
    card.id = `site-${project.id}`;
    const image = make("img", null, "site-card-image");
    image.src = project.image;
    image.alt = clean(project.imageAlt || project.title, 240);
    image.width = 800;
    image.height = 450;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => { image.hidden = true; }, { once: true });
    const body = make("div", null, "site-card-body");
    body.append(make("p", project.category, "site-category"), make("h3", project.title), make("p", project.description, "site-description"));
    if (project.accessNote) body.append(make("p", project.accessNote, "site-access-note"));
    const link = make("a", "Abrir site ↗", "site-link");
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Abrir site ${project.title} em nova aba`);
    body.append(link);
    card.append(image, body);
    return card;
  }

  function renderSites() {
    const holder = byId("sitesGrid");
    const query = fold(state.siteQuery);
    const projects = state.sites.filter((project) =>
      (state.siteCategory === "all" || project.category === state.siteCategory) &&
      (!query || fold([project.title, project.description, project.category].join(" ")).includes(query))
    );
    holder.replaceChildren();
    projects.forEach((project) => holder.append(siteCard(project)));
    if (!projects.length) holder.append(make("p", "Nenhum site encontrado. Tente outro assunto ou limpe a busca.", "empty-state"));
    holder.setAttribute("aria-busy", "false");
    byId("sitesStatus").textContent = `${projects.length} de ${state.sites.length} sites para explorar · links abrem em nova aba.`;
  }

  async function startSites() {
    byId("sitesControls").addEventListener("submit", (event) => event.preventDefault());
    byId("sitesSearch").addEventListener("input", (event) => { state.siteQuery = event.target.value; renderSites(); });
    byId("sitesCategory").addEventListener("change", (event) => { state.siteCategory = event.target.value; renderSites(); });
    byId("sitesClear").addEventListener("click", () => {
      state.siteQuery = ""; state.siteCategory = "all";
      byId("sitesSearch").value = ""; byId("sitesCategory").value = "all";
      renderSites(); byId("sitesSearch").focus();
    });
    try {
      const response = await fetch(SITES_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Diretório indisponível.");
      const payload = await response.json();
      if (!Array.isArray(payload.projects) || !payload.projects.length) throw new Error("Diretório vazio.");
      const seen = new Set();
      state.sites = payload.projects.map((project) => {
        if (!project || !/^[a-z0-9-]{2,100}$/.test(project.id) || seen.has(project.id)) throw new Error("Identificador inválido.");
        seen.add(project.id);
        const url = safeSiteUrl(project.url);
        const image = safeSiteImage(project.image);
        if (!url || !image || !clean(project.title) || !clean(project.description) || !clean(project.category)) throw new Error("Projeto incompleto.");
        return { ...project, url, image, title: clean(project.title, 180), description: clean(project.description, 700), category: clean(project.category, 100) };
      });
      [...new Set(state.sites.map((project) => project.category))].sort((a, b) => a.localeCompare(b, "pt-BR")).forEach((category) => {
        const option = make("option", category);
        option.value = category;
        byId("sitesCategory").append(option);
      });
      renderSites();
      byId("sitesFallback").hidden = true;
      if (window.location.hash === "#sites-publicos" || window.location.hash.startsWith("#site-")) {
        const target = byId(window.location.hash.slice(1));
        if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    } catch (_error) {
      byId("sitesStatus").textContent = "As imagens e os filtros estão indisponíveis agora. Use os links abaixo para visitar os projetos.";
      byId("sitesGrid").setAttribute("aria-busy", "false");
    }
  }

  function validateCatalog(payload) {
    if (!payload || payload.schemaVersion !== "1.0.0" || !Array.isArray(payload.roots) || !Array.isArray(payload.projects)) {
      throw new Error("Catálogo público ausente ou incompatível.");
    }
    const rootIds = new Set();
    payload.roots.forEach((root) => {
      if (!/^[a-z0-9-]{3,60}$/.test(root.id) || rootIds.has(root.id) || !clean(root.name) || !clean(root.purpose) || !clean(root.foundation)) {
        throw new Error("Raiz inválida no catálogo.");
      }
      rootIds.add(root.id);
    });
    const projectIds = new Set();
    payload.projects.forEach((project) => {
      if (
        !/^[a-z0-9-]{3,80}$/.test(project.id) || projectIds.has(project.id) || !rootIds.has(project.root) ||
        !PRIORITY_LABELS[project.priority] || !PHASE_LABELS[project.phase] || !VISIBILITY_LABELS[project.visibility] || !clean(project.name) ||
        !clean(project.objective) || !clean(project.foundation) || !clean(project.nextStep)
      ) throw new Error("Projeto inválido no catálogo.");
      projectIds.add(project.id);
    });
    return payload;
  }

  function rootMap() {
    return new Map(state.catalog.roots.map((root) => [root.id, root]));
  }

  function projectsForRoot(rootId) {
    return state.catalog.projects.filter((project) => project.root === rootId);
  }

  function setRootFilter(rootId) {
    state.root = rootId;
    byId("rootSelect").value = rootId;
    renderProjects();
    byId("catalogo").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function renderPriorityRoots() {
    const holder = byId("priorityRoots");
    holder.replaceChildren();
    state.catalog.roots.filter((root) => root.priority === true).forEach((root) => {
      const card = make("article", null, "priority-card");
      card.append(make("span", root.icon, "root-icon"), make("h3", root.name), make("p", root.purpose), make("p", root.foundation, "root-foundation"));
      const action = make("button", `Ver ${projectsForRoot(root.id).length} iniciativas →`);
      action.type = "button";
      action.addEventListener("click", () => setRootFilter(root.id));
      card.append(action);
      holder.append(card);
    });
  }

  function renderRoots() {
    const holder = byId("rootGrid");
    const select = byId("rootSelect");
    holder.replaceChildren();
    state.catalog.roots.forEach((root) => {
      const count = projectsForRoot(root.id).length;
      const card = make("article", null, `root-card${root.priority ? " is-priority" : ""}`);
      const button = make("button");
      button.type = "button";
      button.setAttribute("aria-label", `Filtrar projetos da raiz ${root.name}`);
      button.append(make("span", root.icon, "root-icon"), make("h3", root.name), make("p", root.purpose), make("p", root.foundation, "root-foundation"), make("span", `${count} iniciativas · ${root.priority ? "prioridade" : "laboratório"}`, "root-meta"));
      button.addEventListener("click", () => setRootFilter(root.id));
      card.append(button);
      holder.append(card);
      const option = make("option", root.name);
      option.value = root.id;
      select.append(option);
    });
  }

  function badge(text, className = "") {
    return make("span", text, `badge ${className}`.trim());
  }

  function detailBlock(title, text, className = "") {
    const block = make("section", null, `detail-block ${className}`.trim());
    block.append(make("h4", title), make("p", text));
    return block;
  }

  function listBlock(title, values) {
    const block = make("section", null, "detail-block");
    block.append(make("h4", title));
    const list = make("ul", null, "detail-list");
    asArray(values).forEach((value) => list.append(make("li", clean(value))));
    block.append(list);
    return block;
  }

  function projectCard(project, roots) {
    const root = roots.get(project.root);
    const card = make("article", null, "project-card");
    card.dataset.root = project.root;
    card.dataset.priority = project.priority;
    const details = make("details");
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      document.querySelectorAll(".project-card details[open]").forEach((other) => { if (other !== details) other.open = false; });
    });
    const summary = make("summary");
    const heading = make("div", null, "card-heading");
    heading.append(make("span", null, "root-dot"), make("h3", project.name));
    const badges = make("div", null, "badge-row");
    const priorityClass = { agora: "badge-now", proximo: "badge-next", incubando: "badge-incubating", pausado: "badge-paused" }[project.priority];
    badges.append(badge(PRIORITY_LABELS[project.priority], priorityClass), badge(PHASE_LABELS[project.phase]), badge(VISIBILITY_LABELS[project.visibility]), badge(root.name));
    summary.append(heading, make("p", project.objective, "card-summary"), badges);
    const body = make("div", null, "project-detail");
    const lead = make("div", null, "detail-lead");
    lead.append(detailBlock("Fundamento", project.foundation), detailBlock("Estado documental e validação", project.evidence));
    body.append(lead, detailBlock("Próximo nanomicropasso", project.nextStep, "next-step"));
    if (asArray(project.outputs).length) body.append(listBlock("Frutos possíveis", project.outputs));
    body.append(detailBlock("Caminho de valor", project.valuePath));
    if (asArray(project.safeguards).length) body.append(listBlock("Limites antes de avançar", project.safeguards));
    const aliases = asArray(project.aliases).filter(Boolean);
    if (aliases.length) {
      body.append(make("p", `Nomes históricos revisados: ${aliases.join(", ")}.`, "aliases"));
    }
    details.append(summary, body);
    card.append(details);
    return card;
  }

  function searchable(project, root) {
    return fold([project.name, project.type, project.objective, project.foundation, project.evidence, project.nextStep, project.valuePath, root.name, ...asArray(project.aliases), ...asArray(project.outputs)].join(" "));
  }

  function filteredProjects() {
    const roots = rootMap();
    const query = fold(state.query);
    return state.catalog.projects.filter((project) => {
      if (state.root !== "all" && project.root !== state.root) return false;
      if (state.priority !== "all" && project.priority !== state.priority) return false;
      return !query || searchable(project, roots.get(project.root)).includes(query);
    });
  }

  function renderProjects() {
    const holder = byId("projectGrid");
    const roots = rootMap();
    const projects = filteredProjects();
    holder.replaceChildren();
    projects.forEach((project) => holder.append(projectCard(project, roots)));
    if (!projects.length) holder.append(make("p", "Nenhum projeto corresponde aos filtros. Limpe a busca ou escolha outra raiz.", "empty-state"));
    holder.setAttribute("aria-busy", "false");
    byId("resultsStatus").textContent = `${projects.length} de ${state.catalog.projects.length} iniciativas exibidas.`;
  }

  function bindControls() {
    byId("catalogControls").addEventListener("submit", (event) => event.preventDefault());
    byId("searchInput").addEventListener("input", (event) => { state.query = event.target.value; renderProjects(); });
    byId("rootSelect").addEventListener("change", (event) => { state.root = event.target.value; renderProjects(); });
    byId("prioritySelect").addEventListener("change", (event) => { state.priority = event.target.value; renderProjects(); });
    byId("clearFilters").addEventListener("click", () => {
      state.query = ""; state.root = "all"; state.priority = "all";
      byId("searchInput").value = ""; byId("rootSelect").value = "all"; byId("prioritySelect").value = "all";
      renderProjects(); byId("searchInput").focus();
    });
    byId("collapseAll").addEventListener("click", () => document.querySelectorAll(".project-card details[open]").forEach((details) => { details.open = false; }));
    byId("themeButton").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next); safeThemeWrite(next);
    });
  }

  async function start() {
    applyTheme(safeThemeRead() || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    bindControls();
    startSites();
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar o catálogo.");
      state.catalog = validateCatalog(await response.json());
      ["priorityFallback", "rootFallback", "catalogFallback"].forEach((id) => { byId(id).hidden = true; });
      byId("projectCount").textContent = String(state.catalog.projects.length);
      byId("rootCount").textContent = String(state.catalog.roots.length);
      renderPriorityRoots(); renderRoots(); renderProjects();
    } catch (_error) {
      byId("resultsStatus").textContent = "O catálogo não pôde ser carregado agora.";
      byId("projectGrid").setAttribute("aria-busy", "false");
      byId("projectGrid").append(make("p", "Recarregue a página. Se o problema continuar, use a página inicial para acessar os módulos já publicados.", "empty-state"));
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === SHARED_THEME_KEY) applyTheme(safeThemeRead());
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("../sw.js", { scope: "../" }).catch(() => { /* offline is optional */ });
    });
  }

  start();
})();
