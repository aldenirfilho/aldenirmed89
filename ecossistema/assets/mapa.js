/* Mapa público 360X: diretório compartilhado, relações editoriais e SVG nativo. */
"use strict";
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const WIDTH = 1200;
  const HEIGHT = 920;
  const maxZoom = () => matchMedia("(max-width: 700px)").matches ? 5 : 2.5;
  const state = {
    projects: [], categories: [], connections: [], selected: null,
    query: "", category: "all", view: matchMedia("(max-width: 700px)").matches ? "list" : "map",
    affinities: true, ready: false, positions: new Map(), bounds: {x: 0, y: 0, w: WIDTH, h: HEIGHT},
    box: {x: 0, y: 0, w: WIDTH, h: HEIGHT}
  };
  const byId = (id) => document.getElementById(id);
  const clean = (value, max = 2000) => String(value ?? "").trim().replace(/\u0000/g, "").slice(0, max);
  const fold = (value) => clean(value, 5000).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const make = (tag, text, className = "") => {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const svg = (tag, attrs = {}, text) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, String(value)));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const categoryFor = (project) => state.categories.find((category) => category.title === project.category);
  const categoryColor = (category) => category.colors[document.documentElement.dataset.theme === "light" ? "light" : "dark"];
  const selectedProject = () => state.projects.find((project) => project.id === state.selected);
  const connectionList = (id) => state.connections.filter((edge) => edge.source === id || edge.target === id);
  const otherId = (edge, id) => edge.source === id ? edge.target : edge.source;

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
    } catch (_) { return null; }
  }

  function loadData(directory, metadata) {
    if (!Array.isArray(directory.projects) || !directory.projects.length || metadata.version !== 1 ||
        !Array.isArray(metadata.categories) || !metadata.categories.length || !Array.isArray(metadata.connections)) {
      throw new Error("Formato de catálogo indisponível.");
    }
    const categoryIds = new Set();
    const categoryTitles = new Set();
    state.categories = metadata.categories.map((entry) => {
      if (!/^[a-z0-9-]+$/.test(entry.id) || !entry.title || categoryIds.has(entry.id) || categoryTitles.has(entry.title) ||
          !/^#[a-f0-9]{6}$/i.test(entry.colors?.light) || !/^#[a-f0-9]{6}$/i.test(entry.colors?.dark)) {
        throw new Error("Área inválida no mapa.");
      }
      categoryIds.add(entry.id); categoryTitles.add(entry.title);
      return {id: entry.id, title: clean(entry.title, 80), description: clean(entry.description), colors: entry.colors};
    });
    const ids = new Set();
    state.projects = directory.projects.map((entry) => {
      const url = safeUrl(entry.url);
      if (!/^[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id) || !url || !entry.title || !categoryTitles.has(entry.category)) {
        throw new Error("Destino inválido no diretório.");
      }
      ids.add(entry.id);
      const label = metadata.labels?.[entry.id] || {};
      return {
        id: entry.id, url, category: entry.category, kind: entry.kind,
        title: clean(label.title || entry.title, 160), originalTitle: clean(entry.title, 160),
        short: clean(label.short || entry.title, 32), subtitle: clean(label.subtitle || entry.category, 46),
        description: clean(entry.description), accessNote: clean(entry.accessNote).replace(/NEXUS/gi, "360X"),
        verifiedAt: /^\d{4}-\d{2}-\d{2}$/.test(entry.verifiedAt) ? entry.verifiedAt : null
      };
    });
    const pairs = new Set();
    state.connections = metadata.connections.map((edge) => {
      const pair = [edge.source, edge.target].sort().join("|");
      if (!ids.has(edge.source) || !ids.has(edge.target) || edge.source === edge.target || pairs.has(pair) || !edge.label) {
        throw new Error("Conexão inválida no mapa.");
      }
      pairs.add(pair);
      return {source: edge.source, target: edge.target, label: clean(edge.label, 180)};
    });
  }

  function matchingProjects() {
    const query = fold(state.query);
    return state.projects.filter((project) =>
      (state.category === "all" || categoryFor(project).id === state.category) &&
      (!query || fold([project.title, project.originalTitle, project.description, project.subtitle, project.category].join(" ")).includes(query))
    );
  }

  function externalLink(project, className, short = false) {
    const label = project.kind === "documentation" ? "Abrir documentação" : "Abrir site";
    const link = make("a", `${short ? (project.kind === "documentation" ? "Documentação" : "Abrir") : label} ↗`, className);
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${label}: ${project.title} (nova aba)`);
    return link;
  }

  function updateHash() {
    const params = new URLSearchParams();
    if (state.selected) params.set("projeto", state.selected);
    if (state.category !== "all") params.set("area", state.category);
    if (state.query) params.set("busca", state.query);
    if (state.view === "list") params.set("vista", "lista");
    const hash = params.toString();
    try { history.replaceState(null, "", `${location.pathname}${location.search}${hash ? `#${hash}` : ""}`); }
    catch (_) { /* Pré-visualizações locais podem não permitir History API. */ }
  }

  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    state.selected = state.projects.some((project) => project.id === params.get("projeto")) ? params.get("projeto") : null;
    state.category = state.categories.some((category) => category.id === params.get("area")) ? params.get("area") : "all";
    state.query = clean(params.get("busca"), 150);
    if (params.has("vista")) state.view = params.get("vista") === "lista" ? "list" : "map";
    if (state.selected && !matchingProjects().some((project) => project.id === state.selected)) {
      state.category = "all"; state.query = "";
    }
    byId("mapSearch").value = state.query;
  }

  function filterCategory(id) {
    state.category = id;
    state.selected = null;
    render(true);
    updateHash();
  }

  function renderFilters() {
    const holder = byId("mapFilters");
    const focusedId = document.activeElement?.dataset.filter;
    const entries = [{id: "all", title: "Todos", count: state.projects.length}, ...state.categories.map((category) => ({
      ...category, count: state.projects.filter((project) => project.category === category.title).length
    }))];
    holder.replaceChildren();
    entries.forEach((category) => {
      const button = make("button", null, "filter-button");
      button.type = "button";
      button.dataset.filter = category.id;
      button.setAttribute("aria-pressed", String(state.category === category.id));
      button.setAttribute("aria-controls", "mapNodes projectList");
      if (category.colors) {
        button.style.setProperty("--category-color", categoryColor(category));
        const dot = make("span", null, "category-dot"); dot.setAttribute("aria-hidden", "true"); button.append(dot);
      }
      button.append(make("span", category.title), make("span", String(category.count), "filter-count"));
      button.addEventListener("click", () => filterCategory(category.id));
      holder.append(button);
      if (focusedId === category.id) button.focus({preventScroll: true});
    });
  }

  function focusDetails() {
    const heading = byId("detailTitle");
    heading.focus({preventScroll: true});
    if (matchMedia("(max-width: 1080px)").matches) byId("mapDetails").scrollIntoView({block: "start", behavior: "auto"});
  }

  function selectProject(id, focusDetail = false) {
    if (!state.projects.some((project) => project.id === id)) return;
    state.selected = id;
    let refit = false;
    if (!matchingProjects().some((project) => project.id === id)) {
      state.category = "all"; state.query = ""; byId("mapSearch").value = ""; refit = true;
    }
    render(refit);
    updateHash();
    if (focusDetail || matchMedia("(max-width: 1080px)").matches) focusDetails();
  }

  function reset() {
    state.selected = null; state.query = ""; state.category = "all";
    byId("mapSearch").value = "";
    render(true); updateHash();
  }

  function renderList(projects) {
    const holder = byId("projectList");
    holder.replaceChildren();
    projects.forEach((project) => {
      const row = make("li", null, `project-row${state.selected === project.id ? " is-selected" : ""}`);
      row.style.setProperty("--category-color", categoryColor(categoryFor(project)));
      const button = make("button", null, "project-row-button");
      button.type = "button";
      button.dataset.project = project.id;
      button.setAttribute("aria-pressed", String(state.selected === project.id));
      button.setAttribute("aria-controls", "detailBody");
      button.setAttribute("aria-label", `Conhecer ${project.title}`);
      const dot = make("span", null, "category-dot"); dot.setAttribute("aria-hidden", "true");
      const text = make("span"); text.append(make("strong", project.title), make("small", `${project.category} · ${project.subtitle}`));
      button.append(dot, text);
      button.addEventListener("click", () => selectProject(project.id, true));
      row.append(button, externalLink(project, "project-row-link", true));
      holder.append(row);
    });
    byId("listEmpty").hidden = projects.length > 0;
  }

  function node(key, type, x, y, w, h, title, subtitle, category, action) {
    const group = svg("g", {
      id: `node-${key}`, class: `map-node map-node--${type}`, transform: `translate(${x} ${y})`,
      role: "button", tabindex: "0", "aria-label": `${title}${type === "project" ? ", conhecer projeto" : type === "category" ? ", filtrar área" : ", visão geral"}`,
      "aria-controls": type === "project" ? "detailBody" : "mapNodes projectList"
    });
    group.dataset.nodeKey = key;
    if (category) group.style.setProperty("--category-color", categoryColor(category));
    const selected = type === "project" && state.selected === key;
    if (type === "project") group.setAttribute("aria-pressed", String(selected));
    if (selected) group.classList.add("is-selected");
    if (type === "project" && state.query) group.classList.add("is-match");
    group.append(svg("title", {}, title), svg("rect", {class: "node-card", width: w, height: h, rx: type === "hub" ? 22 : 12}));
    if (type === "hub") {
      group.append(svg("text", {class: "node-title", x: w / 2, y: 40, "text-anchor": "middle"}, title),
        svg("text", {class: "node-subtitle", x: w / 2, y: 64, "text-anchor": "middle"}, subtitle));
    } else {
      group.append(svg("rect", {class: "node-dot", x: 0, y: 17, width: 3, height: h - 34, rx: 1.5}),
        svg("text", {class: "node-title", x: 14, y: 23}, title),
        svg("text", {class: "node-subtitle", x: 14, y: 41}, subtitle));
    }
    group.addEventListener("click", action);
    group.addEventListener("keydown", (event) => {
      if (["Enter", " "].includes(event.key)) { event.preventDefault(); event.stopPropagation(); action(); }
      else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault(); event.stopPropagation(); focusNeighbor(key, event.key);
      }
    });
    byId("mapNodes").append(group);
    state.positions.set(key, {x, y, w, h, type, category});
    return group;
  }

  function edgePath(path, className = "", color = null) {
    const pathNode = svg("path", {d: path, class: `map-edge ${className}`.trim(), "vector-effect": "non-scaling-stroke"});
    if (color) pathNode.style.setProperty("--category-color", color);
    byId("mapEdges").append(pathNode);
  }

  function renderGraph(projects) {
    const focusKey = document.activeElement?.dataset.nodeKey;
    byId("mapNodes").replaceChildren();
    byId("mapEdges").replaceChildren();
    state.positions.clear();
    const groups = state.categories.filter((category) => projects.some((project) => project.category === category.title));
    const related = new Set(state.selected ? connectionList(state.selected).map((edge) => otherId(edge, state.selected)) : []);
    node("universo", "hub", 488, 32, 224, 86, "360X", "UM UNIVERSO DE PROJETOS", null, reset);
    let lowest = 118;
    groups.forEach((category, index) => {
      const x = ((index + .5) * WIDTH / groups.length) - 105;
      const members = projects.filter((project) => project.category === category.title);
      const hasSelected = members.some((project) => project.id === state.selected);
      node(`area-${category.id}`, "category", x, 185, 210, 55, category.title, `${members.length} ${members.length === 1 ? "projeto" : "projetos"}`, category, () => filterCategory(category.id));
      edgePath(`M600 118 C600 153 ${x + 105} 150 ${x + 105} 185`, hasSelected ? "map-edge--active" : "", categoryColor(category));
      members.forEach((project, row) => {
        const y = 278 + row * 74;
        lowest = Math.max(lowest, y + 55);
        const active = project.id === state.selected;
        edgePath(`M${x + 105} 240 L${x + 105} 251 Q${x + 105} 260 ${x + 96} 260 L${x - 12} 260 Q${x - 22} 260 ${x - 22} 270 L${x - 22} ${y + 17.5} Q${x - 22} ${y + 27.5} ${x - 12} ${y + 27.5} L${x} ${y + 27.5}`,
          active ? "map-edge--active" : state.selected && !related.has(project.id) ? "map-edge--muted" : "", categoryColor(category));
        const group = node(project.id, "project", x, y, 210, 55, project.short, project.subtitle, category, () => selectProject(project.id));
        group.setAttribute("aria-label", `${project.title}, ${project.category}, conhecer projeto`);
        if (state.selected && !active && !related.has(project.id)) group.classList.add("is-muted");
      });
    });
    if (state.selected && state.affinities) {
      connectionList(state.selected).forEach((edge) => {
        const from = state.positions.get(edge.source); const to = state.positions.get(edge.target);
        if (!from || !to) return;
        let path;
        if (Math.abs(from.x - to.x) < 1) {
          const x = from.x + from.w;
          const bow = x + 38;
          path = `M${x} ${from.y + 27.5} C${bow} ${from.y + 27.5} ${bow} ${to.y + 27.5} ${x} ${to.y + 27.5}`;
        } else {
          const left = from.x < to.x ? from : to;
          const right = from.x < to.x ? to : from;
          const a = left.x + left.w; const b = right.x;
          const mid = (a + b) / 2;
          path = `M${a} ${left.y + 27.5} C${mid} ${left.y + 27.5} ${mid} ${right.y + 27.5} ${b} ${right.y + 27.5}`;
        }
        edgePath(path, "map-edge--affinity map-edge--active");
      });
    }
    if (!projects.length) {
      byId("mapNodes").append(svg("text", {x: 600, y: 320, class: "node-title", "text-anchor": "middle"}, "Nenhum projeto encontrado."),
        svg("text", {x: 600, y: 350, class: "node-subtitle", "text-anchor": "middle"}, "Tente outro termo ou volte à visão geral."));
    }
    state.bounds = {x: 0, y: 0, w: WIDTH, h: Math.max(500, lowest + 65)};
    if (focusKey && byId(`node-${focusKey}`)) byId(`node-${focusKey}`).focus({preventScroll: true});
  }

  function focusNeighbor(key, direction) {
    const from = state.positions.get(key);
    if (!from) return;
    const cx = from.x + from.w / 2; const cy = from.y + from.h / 2;
    const vertical = ["ArrowUp", "ArrowDown"].includes(direction);
    const sign = ["ArrowUp", "ArrowLeft"].includes(direction) ? -1 : 1;
    let best = null; let score = Infinity;
    state.positions.forEach((position, id) => {
      if (id === key) return;
      const dx = position.x + position.w / 2 - cx; const dy = position.y + position.h / 2 - cy;
      const primary = vertical ? dy : dx; const secondary = vertical ? dx : dy;
      const candidate = Math.abs(primary) + Math.abs(secondary) * 3;
      if (primary * sign > 5 && candidate < score) { best = id; score = candidate; }
    });
    if (best) {
      const position = state.positions.get(best);
      byId(`node-${best}`).focus({preventScroll: true});
      if (position.x < state.box.x || position.x + position.w > state.box.x + state.box.w || position.y < state.box.y || position.y + position.h > state.box.y + state.box.h) {
        state.box.x = position.x + position.w / 2 - state.box.w / 2;
        state.box.y = position.y + position.h / 2 - state.box.h / 2;
        applyBox();
      }
    }
  }

  function renderDetails() {
    const holder = byId("detailBody");
    holder.replaceChildren();
    const project = selectedProject();
    const heading = make("h2", project ? project.title : state.category === "all" ? "Sua próxima descoberta começa aqui." : state.categories.find((category) => category.id === state.category).title, "detail-title");
    heading.id = "detailTitle"; heading.tabIndex = -1;
    if (!project) {
      holder.style.removeProperty("--category-color");
      holder.append(make("p", "VISÃO DO CONJUNTO", "detail-kicker"), heading,
        make("p", "Escolha uma área ou um projeto. As linhas mostram como cada iniciativa participa deste universo.", "detail-description"));
      const choices = make("div", null, "detail-overview");
      state.categories.forEach((category) => {
        const button = make("button", null, "detail-category-button"); button.type = "button";
        button.style.setProperty("--category-color", categoryColor(category));
        const dot = make("span", null, "category-dot"); dot.setAttribute("aria-hidden", "true");
        button.append(dot, make("span", category.title), make("small", String(state.projects.filter((item) => item.category === category.title).length)));
        button.addEventListener("click", () => { filterCategory(category.id); focusDetails(); });
        choices.append(button);
      });
      holder.append(choices, make("p", "Selecione um projeto para descobrir afinidades e abrir seu site. A lista oferece os mesmos caminhos.", "detail-note"));
      return;
    }
    holder.style.setProperty("--category-color", categoryColor(categoryFor(project)));
    holder.append(make("p", project.category.toLocaleUpperCase("pt-BR"), "detail-kicker"), heading,
      make("p", project.description, "detail-description"), externalLink(project, "detail-action"));
    const catalog = make("a", "Ver na vitrine de projetos →", "detail-secondary");
    catalog.href = `./index.html#site-${project.id}`;
    holder.append(catalog);
    const share = make("button", "Copiar link deste ponto", "detail-secondary share-button");
    share.type = "button";
    share.addEventListener("click", async () => {
      const url = new URL(location.href); url.hash = new URLSearchParams({projeto: project.id}).toString();
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard indisponível");
        await navigator.clipboard.writeText(url.href);
        share.textContent = "Link copiado ✓";
      } catch (_) {
        const input = make("input", null, "share-url"); input.type = "text"; input.readOnly = true; input.value = url.href;
        input.setAttribute("aria-label", "Link do projeto: selecione e copie"); share.replaceWith(input); input.select();
      }
    });
    holder.append(share);
    if (project.accessNote) holder.append(make("p", project.accessNote, "detail-note"));
    const relations = connectionList(project.id);
    const section = make("section", null, "detail-related");
    section.append(make("h3", "Caminhos relacionados"), make("p", "Afinidades de conteúdo para continuar explorando."));
    const list = make("ul");
    relations.forEach((edge) => {
      const related = state.projects.find((item) => item.id === otherId(edge, project.id));
      const item = make("li"); const button = make("button", null, "related-button"); button.type = "button";
      button.dataset.related = related.id;
      button.append(make("span", `${related.short} →`), make("small", edge.label));
      button.addEventListener("click", () => selectProject(related.id, true));
      item.append(button); list.append(item);
    });
    section.append(list);
    if (!relations.length) section.append(make("p", "Explore os outros projetos desta área no mapa."));
    holder.append(section);
    if (project.verifiedAt) {
      const [year, month, day] = project.verifiedAt.split("-");
      holder.append(make("p", `Referência do diretório: ${day}/${month}/${year}.`, "detail-meta"));
    }
  }

  function syncView() {
    byId("graphPanel").hidden = state.view !== "map";
    byId("listPanel").hidden = state.view !== "list";
    byId("mapView").setAttribute("aria-pressed", String(state.view === "map"));
    byId("listView").setAttribute("aria-pressed", String(state.view === "list"));
    byId("mapRelatedToggle").disabled = state.view !== "map";
  }

  function render(refit = false) {
    if (!state.ready) return;
    const projects = matchingProjects();
    if (state.selected && !projects.some((project) => project.id === state.selected)) state.selected = null;
    renderFilters(); renderGraph(projects); renderList(projects); renderDetails(); syncView();
    const areas = new Set(projects.map((project) => project.category)).size;
    byId("mapCount").textContent = `${projects.length} de ${state.projects.length} projetos · ${areas} ${areas === 1 ? "área" : "áreas"}${state.selected ? ` · ${selectedProject().title} selecionado` : ""}`;
    byId("mapHelp").textContent = state.selected ? "Tracejadas: afinidades do projeto selecionado. Arraste para mover." : "Selecione um projeto. Arraste para mover; use +/− para ampliar.";
    if (refit) fit();
    syncThemeButton();
  }

  function syncThemeButton() {
    const next = document.documentElement.dataset.theme === "dark" ? "claro" : "escuro";
    byId("mapTheme").setAttribute("aria-label", `Usar tema ${next}`);
    byId("mapTheme").title = `Usar tema ${next}`;
  }

  function applyBox() {
    const box = state.box;
    box.x = Math.max(-box.w / 3, Math.min(WIDTH - box.w * 2 / 3, box.x));
    box.y = Math.max(-box.h / 3, Math.min(Math.max(HEIGHT, state.bounds.h) - box.h * 2 / 3, box.y));
    byId("mapSvg").setAttribute("viewBox", `${box.x} ${box.y} ${box.w} ${box.h}`);
    const zoom = WIDTH / box.w;
    byId("mapViewport").style.touchAction = zoom > 1.01 ? "none" : "pan-y";
    byId("mapZoom").textContent = `${Math.round(zoom * 100)}%`;
    byId("mapZoomIn").disabled = zoom >= maxZoom() - .01;
    byId("mapZoomOut").disabled = zoom <= .71;
  }

  function fit() {
    state.box = {...state.bounds};
    applyBox();
  }

  function zoom(factor) {
    const old = state.box;
    const width = Math.max(WIDTH / maxZoom(), Math.min(WIDTH / .7, old.w / factor));
    const height = old.h * width / old.w;
    state.box = {x: old.x + (old.w - width) / 2, y: old.y + (old.h - height) / 2, w: width, h: height};
    applyBox();
  }

  function bindMapMovement() {
    const viewport = byId("mapViewport");
    const map = byId("mapSvg");
    let drag = null;
    let suppressClick = false;
    viewport.addEventListener("pointerdown", (event) => {
      suppressClick = false;
      if (event.button !== 0 || (event.pointerType === "touch" && WIDTH / state.box.w <= 1.01)) return;
      drag = {id: event.pointerId, x: event.clientX, y: event.clientY, box: {...state.box}};
    });
    viewport.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
      suppressClick = true;
      viewport.setPointerCapture(event.pointerId); viewport.classList.add("is-dragging");
      const matrix = map.getScreenCTM();
      if (!matrix) return;
      state.box.x = drag.box.x - (event.clientX - drag.x) / matrix.a;
      state.box.y = drag.box.y - (event.clientY - drag.y) / matrix.d;
      applyBox();
    });
    const release = () => { drag = null; viewport.classList.remove("is-dragging"); };
    viewport.addEventListener("pointerup", release); viewport.addEventListener("pointercancel", release);
    viewport.addEventListener("lostpointercapture", release);
    viewport.addEventListener("click", (event) => {
      if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    }, true);
    viewport.addEventListener("keydown", (event) => {
      if (["+", "="].includes(event.key)) { event.preventDefault(); zoom(1.2); }
      else if (event.key === "-") { event.preventDefault(); zoom(1 / 1.2); }
      else if (event.key === "0" || event.key === "Home") { event.preventDefault(); fit(); }
      else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const amount = state.box.w * .08;
        if (event.key === "ArrowUp") state.box.y -= amount;
        if (event.key === "ArrowDown") state.box.y += amount;
        if (event.key === "ArrowLeft") state.box.x -= amount;
        if (event.key === "ArrowRight") state.box.x += amount;
        applyBox();
      }
    });
  }

  function bindControls() {
    byId("mapSearch").addEventListener("input", (event) => {
      state.query = clean(event.target.value, 150); state.selected = null; render(true); updateHash();
    });
    byId("mapReset").addEventListener("click", reset);
    byId("mapTheme").addEventListener("click", () => {
      window.Map360Theme.apply(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
    });
    window.addEventListener("map360:theme", () => { if (state.ready) render(); else syncThemeButton(); });
    byId("mapView").addEventListener("click", () => { state.view = "map"; syncView(); updateHash(); });
    byId("listView").addEventListener("click", () => { state.view = "list"; syncView(); updateHash(); });
    byId("mapRelatedToggle").addEventListener("change", (event) => {
      state.affinities = event.target.checked; renderGraph(matchingProjects());
    });
    byId("mapZoomIn").addEventListener("click", () => zoom(1.2));
    byId("mapZoomOut").addEventListener("click", () => zoom(1 / 1.2));
    byId("mapFit").addEventListener("click", fit);
    window.addEventListener("hashchange", () => {
      if (state.ready) { readHash(); render(true); if (state.selected) focusDetails(); }
    });
    bindMapMovement(); syncThemeButton();
  }

  async function start() {
    bindControls();
    byId("mapViewport").setAttribute("aria-busy", "true");
    try {
      const responses = await Promise.all([fetch("./data/sites-360x.json"), fetch("./data/mapa-conexoes.json")]);
      if (responses.some((response) => !response.ok)) throw new Error("Catálogo indisponível.");
      const [directory, metadata] = await Promise.all(responses.map((response) => response.json()));
      loadData(directory, metadata);
      state.ready = true; readHash(); render(true);
      byId("mapFallback").open = false;
      if (state.selected) focusDetails();
    } catch (_) {
      byId("mapError").textContent = "O mapa não carregou. Você pode abrir todos os projetos pelos links abaixo ou recarregar a página.";
      byId("mapError").hidden = false; byId("mapFallback").open = true;
      byId("graphPanel").hidden = true; byId("listPanel").hidden = true;
      byId("mapCount").textContent = "Links diretos disponíveis abaixo.";
      ["mapSearch", "mapView", "listView", "mapReset", "mapRelatedToggle"].forEach((id) => { byId(id).disabled = true; });
    } finally {
      byId("mapLoading").hidden = true; byId("mapViewport").setAttribute("aria-busy", "false");
    }
    if ("serviceWorker" in navigator && ["https:", "http:"].includes(location.protocol)) {
      navigator.serviceWorker.register("../sw.js").catch(() => { /* O diretório funciona também sem modo offline. */ });
    }
  }
  start();
})();
