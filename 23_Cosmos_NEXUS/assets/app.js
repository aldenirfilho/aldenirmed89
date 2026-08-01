"use strict";

(() => {
  const PATHS = {
    cosmos: "data/cosmos.json",
    atlas: "data/atlas.json",
    history: "data/ecosystem-history.json",
    blocks: "data/block-registry.json",
    topology: "data/tag-topology.json",
    surfaces: "data/surface-routing.json",
    recipes: "data/render-recipes.json",
    renderDemo: "data/render-demo.json",
    lifecycle: "data/product-lifecycle.json",
    entityCodes: "data/entity-code-contract.json",
    daily: "data/daily-update-contract.json",
    globalGraph: "../data/connections.json"
  };

  const STORAGE_KEY = "antigravity.nexus-cosmos.v1";
  const A11Y_PREFERENCES_KEY = "antigravity:a11y:v1";
  const LIGHT_GRAPH_COLORS = new Map([
    ["#48dcff", "#006d80"],
    ["#55f0c2", "#087a55"],
    ["#8b7cff", "#5946c7"],
    ["#a8ff78", "#286b18"],
    ["#ff63d8", "#9f1b76"],
    ["#ff8f70", "#9b3f10"],
    ["#ffd166", "#7a4e00"]
  ]);
  const DEFAULT_STATE = { lastNode: null, lens: "fusion", seenImages: [] };
  const runtime = {
    cosmos: null,
    atlas: null,
    history: null,
    globalGraph: null,
    blocks: null,
    topology: null,
    surfaces: null,
    recipes: null,
    renderDemo: null,
    lifecycle: null,
    entityCodes: null,
    daily: null,
    activeLens: "fusion",
    selectedNode: "nexus",
    zoom: 1,
    translateX: 0,
    translateY: 0,
    atlasGroup: "todos",
    atlasQuery: "",
    dialogItem: null,
    dragging: false,
    pointerStart: null
  };

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return { ...DEFAULT_STATE };
      return {
        ...DEFAULT_STATE,
        ...parsed,
        seenImages: Array.isArray(parsed.seenImages) ? parsed.seenImages.filter((item) => typeof item === "string") : []
      };
    } catch (_) {
      return { ...DEFAULT_STATE };
    }
  }

  let saved = readState();

  function saveState(patch) {
    saved = { ...saved, ...patch };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (_) {
      // Preferências são opcionais; indisponibilidade do armazenamento não bloqueia a estação.
    }
  }

  function readA11yPreferences(serialized) {
    try {
      const raw = arguments.length ? serialized : localStorage.getItem(A11Y_PREFERENCES_KEY);
      const parsed = JSON.parse(raw || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function clarityActive(preferences) {
    if (preferences.contrast === true) return false;
    if (preferences.theme === "light") return true;
    if (preferences.theme === "dark") return false;
    if (preferences.theme === "system") {
      return matchMedia("(prefers-color-scheme: light)").matches;
    }
    if (typeof preferences.clarity === "boolean") return preferences.clarity;
    return document.documentElement.dataset.defaultTheme === "light";
  }

  function applyA11yPreferences(preferences = readA11yPreferences()) {
    const html = document.documentElement;
    const clarity = clarityActive(preferences);
    const contrast = preferences.contrast === true;
    html.dataset.theme = clarity ? "light" : "dark";
    html.dataset.contrast = contrast ? "high" : "normal";
    html.style.colorScheme = contrast ? "dark" : clarity ? "light" : "dark";
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      clarity ? "#ffffff" : contrast ? "#000000" : "#07111f"
    );

    const toggle = $("#theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(clarity));
      toggle.setAttribute(
        "aria-label",
        clarity
          ? "Desativar visualização clara e voltar ao modo cósmico escuro"
          : "Ativar visualização clara com fundo branco"
      );
      toggle.title = clarity ? "Voltar ao modo cósmico escuro" : "Ativar visualização clara";
      toggle.textContent = clarity ? "☾" : "☀";
    }
    if (runtime.cosmos) {
      $$(".graph-node").forEach((button) => {
        const node = runtime.cosmos.nodes.find((item) => item.id === button.dataset.nodeId);
        if (node) button.style.setProperty("--node-color", universeColor(node));
      });
    }
    requestAnimationFrame(drawEdges);
  }

  async function fetchJson(path) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.warn(`NEXUS: não foi possível carregar ${path}`, error);
      return null;
    }
  }

  function textElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    return node;
  }

  function setStatus(message) {
    const status = $("#interaction-status");
    if (status) status.textContent = message;
  }

  function universeColor(node) {
    if (!runtime.cosmos) return "#48dcff";
    if (node.kind === "core") return document.documentElement.dataset.theme === "light" ? "#102a43" : "#ffffff";
    const constellation = runtime.cosmos.constellations.find((item) => item.id === node.constellationIds?.[0]);
    if (constellation) {
      return document.documentElement.dataset.theme === "light"
        ? LIGHT_GRAPH_COLORS.get(constellation.color.toLowerCase()) || "#006d80"
        : constellation.color;
    }
    const universe = runtime.cosmos.universes.find((item) => item.id === node.universeIds?.[0]);
    const color = universe?.color || "#48dcff";
    return document.documentElement.dataset.theme === "light"
      ? LIGHT_GRAPH_COLORS.get(color.toLowerCase()) || "#006d80"
      : color;
  }

  function initUniverses() {
    const grid = $("#universe-grid");
    if (!grid || !runtime.cosmos) return;
    grid.replaceChildren();
    runtime.cosmos.universes.forEach((universe) => {
      const card = document.createElement("article");
      card.className = "universe-card";
      card.dataset.code = universe.code;
      card.style.setProperty("--universe-color", universe.color);
      card.style.setProperty("--universe-border", `${universe.color}55`);
      card.append(
        textElement("div", "universe-icon", universe.icon),
        textElement("p", "eyebrow", universe.code),
        textElement("h3", "", universe.name),
        textElement("p", "", universe.summary)
      );
      const quote = textElement("blockquote", "", universe.question);
      card.append(quote);
      grid.append(card);
    });
  }

  function activeConstellations() {
    const lens = runtime.cosmos?.lenses.find((item) => item.id === runtime.activeLens);
    return new Set(lens?.constellations || runtime.cosmos?.constellations.map((item) => item.id) || []);
  }

  function nodeVisible(node) {
    if (node.kind === "core" || node.kind === "universe") return true;
    const active = activeConstellations();
    return node.constellationIds?.some((id) => active.has(id));
  }

  function initLenses() {
    const bar = $("#lens-bar");
    if (!bar || !runtime.cosmos) return;
    const queryLens = new URLSearchParams(location.search).get("lens");
    const validSaved = runtime.cosmos.lenses.some((item) => item.id === saved.lens) ? saved.lens : "fusion";
    runtime.activeLens = runtime.cosmos.lenses.some((item) => item.id === queryLens) ? queryLens : validSaved;
    bar.replaceChildren();
    runtime.cosmos.lenses.forEach((lens) => {
      const button = textElement("button", "lens-button", lens.label);
      button.type = "button";
      button.dataset.lens = lens.id;
      button.setAttribute("aria-pressed", String(lens.id === runtime.activeLens));
      button.addEventListener("click", () => setLens(lens.id));
      bar.append(button);
    });
  }

  function setLens(lensId) {
    if (!runtime.cosmos?.lenses.some((item) => item.id === lensId)) return;
    runtime.activeLens = lensId;
    saveState({ lens: lensId });
    $$(".lens-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lens === lensId)));
    updateGraphVisibility();
    updateQuery();
    const lens = runtime.cosmos.lenses.find((item) => item.id === lensId);
    setStatus(`${lens.label} ativa · ${lens.constellations.length} constelações visíveis.`);
  }

  function initGraph() {
    if (!runtime.cosmos) return;
    const layer = $("#graph-nodes");
    if (!layer) return;
    layer.replaceChildren();

    const queryNode = new URLSearchParams(location.search).get("node");
    const preferred = runtime.cosmos.nodes.some((node) => node.id === queryNode)
      ? queryNode
      : runtime.cosmos.nodes.some((node) => node.id === saved.lastNode) ? saved.lastNode : "nexus";
    runtime.selectedNode = preferred;

    runtime.cosmos.nodes.forEach((node) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "graph-node";
      button.dataset.nodeId = node.id;
      button.dataset.kind = node.kind;
      button.style.left = `${node.x}%`;
      button.style.top = `${node.y}%`;
      button.style.setProperty("--node-color", universeColor(node));
      button.setAttribute("aria-label", `${node.label}. ${node.summary}`);
      button.append(textElement("span", "", node.icon), textElement("small", "", node.label));
      button.addEventListener("click", () => selectNode(node.id));
      layer.append(button);
    });

    initGraphList();
    initGraphTabs();
    initGraphPanZoom();
    updateGraphVisibility();
    selectNode(runtime.selectedNode, { updateUrl: false, announce: false });
    addEventListener("resize", drawEdges, { passive: true });
  }

  function neighborsFor(nodeId) {
    const ids = new Set();
    runtime.cosmos.edges.forEach((edge) => {
      if (edge.from === nodeId) ids.add(edge.to);
      if (edge.to === nodeId) ids.add(edge.from);
    });
    return ids;
  }

  function selectNode(nodeId, options = {}) {
    const node = runtime.cosmos?.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    runtime.selectedNode = nodeId;
    saveState({ lastNode: nodeId });
    const neighbors = neighborsFor(nodeId);
    $$(".graph-node").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.nodeId === nodeId);
      button.classList.toggle("is-neighbor", neighbors.has(button.dataset.nodeId));
    });
    $$(".graph-list button").forEach((button) => button.classList.toggle("is-active", button.dataset.nodeId === nodeId));

    $("#inspector-icon").textContent = node.icon;
    $("#inspector-title").textContent = node.label;
    $("#inspector-summary").textContent = node.summary;
    const tagBox = $("#inspector-tags");
    tagBox.replaceChildren();
    [node.kind, ...(node.universeIds || []).map((id) => id.toUpperCase()), ...(node.constellationIds || []).map((id) => `###${id.toUpperCase()}`), node.status]
      .forEach((tag) => tagBox.append(textElement("span", "", tag)));
    const constellation = runtime.cosmos.constellations.find((item) => item.id === node.id);
    const link = $("#inspector-link");
    const destination = node.href || constellation?.href;
    if (destination) {
      link.href = destination;
      link.textContent = node.href ? "Abrir sessão candidata →" : "Abrir esta constelação →";
      link.hidden = false;
    } else {
      link.hidden = true;
    }
    drawEdges();
    if (options.updateUrl !== false) updateQuery();
    if (options.announce !== false) setStatus(`${node.label} selecionado · ${neighbors.size} relações locais.`);
    const continueButton = $("#continue-button");
    if (continueButton) continueButton.hidden = nodeId === "nexus";
  }

  function updateQuery() {
    const params = new URLSearchParams(location.search);
    if (runtime.selectedNode && runtime.selectedNode !== "nexus") params.set("node", runtime.selectedNode);
    else params.delete("node");
    if (runtime.activeLens && runtime.activeLens !== "fusion") params.set("lens", runtime.activeLens);
    else params.delete("lens");
    const query = params.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
  }

  function updateGraphVisibility() {
    $$(".graph-node").forEach((button) => {
      const node = runtime.cosmos.nodes.find((item) => item.id === button.dataset.nodeId);
      button.classList.toggle("is-dimmed", !nodeVisible(node));
      button.tabIndex = nodeVisible(node) ? 0 : -1;
    });
    $$(".graph-list li").forEach((item) => {
      const node = runtime.cosmos.nodes.find((nodeItem) => nodeItem.id === item.dataset.nodeId);
      item.hidden = !nodeVisible(node);
    });
    drawEdges();
  }

  function drawEdges() {
    const canvas = $("#graph-canvas");
    const world = $("#graph-world");
    if (!canvas || !world || !runtime.cosmos) return;
    const width = world.clientWidth;
    const height = world.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    const nodes = new Map(runtime.cosmos.nodes.map((node) => [node.id, node]));
    const neighbors = neighborsFor(runtime.selectedNode);
    const lightGraph = document.documentElement.dataset.theme === "light";

    runtime.cosmos.edges.forEach((edge) => {
      const from = nodes.get(edge.from);
      const to = nodes.get(edge.to);
      if (!from || !to || !nodeVisible(from) || !nodeVisible(to)) return;
      const highlighted = edge.from === runtime.selectedNode || edge.to === runtime.selectedNode;
      const x1 = from.x / 100 * width;
      const y1 = from.y / 100 * height;
      const x2 = to.x / 100 * width;
      const y2 = to.y / 100 * height;
      const gradient = context.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, universeColor(from));
      gradient.addColorStop(1, universeColor(to));
      context.beginPath();
      context.moveTo(x1, y1);
      context.quadraticCurveTo(width / 2, height / 2, x2, y2);
      context.strokeStyle = gradient;
      context.globalAlpha = highlighted ? .92 : neighbors.has(from.id) || neighbors.has(to.id) ? .58 : lightGraph ? .32 : .17;
      context.lineWidth = highlighted ? 2.25 : 1;
      context.stroke();
    });
    context.globalAlpha = 1;
  }

  function initGraphList() {
    const list = $("#graph-list");
    if (!list) return;
    list.replaceChildren();
    runtime.cosmos.nodes.forEach((node) => {
      const item = document.createElement("li");
      item.dataset.nodeId = node.id;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.nodeId = node.id;
      button.append(textElement("strong", "", `${node.icon} ${node.label}`), textElement("small", "", node.summary));
      button.addEventListener("click", () => selectNode(node.id));
      item.append(button);
      list.append(item);
    });
  }

  function initGraphTabs() {
    const tabs = [$("#tab-map"), $("#tab-list")].filter(Boolean);
    const panels = [$("#map-panel"), $("#list-panel")].filter(Boolean);
    function activate(tab) {
      tabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.classList.toggle("active", active);
        candidate.setAttribute("aria-selected", String(active));
        candidate.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
      if (tab.id === "tab-map") requestAnimationFrame(drawEdges);
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
  }

  function applyWorldTransform() {
    const world = $("#graph-world");
    if (!world) return;
    world.style.transform = `translate(${runtime.translateX}px, ${runtime.translateY}px) scale(${runtime.zoom})`;
    $("#zoom-reset").textContent = `${Math.round(runtime.zoom * 100)}%`;
  }

  function changeZoom(delta) {
    runtime.zoom = Math.min(1.65, Math.max(.75, runtime.zoom + delta));
    applyWorldTransform();
  }

  function initGraphPanZoom() {
    $("#zoom-in")?.addEventListener("click", () => changeZoom(.1));
    $("#zoom-out")?.addEventListener("click", () => changeZoom(-.1));
    $("#zoom-reset")?.addEventListener("click", () => {
      runtime.zoom = 1;
      runtime.translateX = 0;
      runtime.translateY = 0;
      applyWorldTransform();
    });
    const stage = $("#graph-stage");
    if (!stage) return;
    stage.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".graph-node")) return;
      runtime.dragging = true;
      runtime.pointerStart = { x: event.clientX, y: event.clientY, tx: runtime.translateX, ty: runtime.translateY };
      stage.classList.add("dragging");
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove", (event) => {
      if (!runtime.dragging || !runtime.pointerStart) return;
      runtime.translateX = runtime.pointerStart.tx + event.clientX - runtime.pointerStart.x;
      runtime.translateY = runtime.pointerStart.ty + event.clientY - runtime.pointerStart.y;
      applyWorldTransform();
    });
    const stopDrag = () => { runtime.dragging = false; runtime.pointerStart = null; stage.classList.remove("dragging"); };
    stage.addEventListener("pointerup", stopDrag);
    stage.addEventListener("pointercancel", stopDrag);
  }

  function initConstellations() {
    const grid = $("#constellation-grid");
    if (!grid || !runtime.cosmos) return;
    grid.replaceChildren();
    runtime.cosmos.constellations.forEach((item) => {
      const card = document.createElement("a");
      card.className = "constellation-card";
      card.href = item.href;
      card.style.setProperty("--constellation-color", item.color);
      const image = document.createElement("img");
      image.src = item.portalImage;
      image.alt = "";
      image.width = 1400;
      image.height = item.id === "acra" ? 933 : 788;
      image.loading = "lazy";
      image.decoding = "async";
      card.append(
        image,
        textElement("span", "constellation-icon", item.icon),
        textElement("h3", "", item.name),
        textElement("p", "", item.summary),
        textElement("small", "", `${item.universes.map((id) => id.toUpperCase()).join(" · ")} → abrir rota`)
      );
      grid.append(card);
    });
  }

  function initDepths() {
    const grid = $("#depth-grid");
    if (!grid || !runtime.cosmos) return;
    grid.replaceChildren();
    runtime.cosmos.renderDepths.forEach((depth, index) => {
      const card = document.createElement("article");
      card.className = "depth-card";
      card.append(
        textElement("span", "depth-index", `TELA ${index}`),
        textElement("h3", "", depth.label),
        textElement("span", "", depth.budget),
        textElement("p", "", depth.purpose)
      );
      const list = document.createElement("ul");
      depth.output.forEach((item) => list.append(textElement("li", "", item)));
      card.append(list);
      grid.append(card);
    });
  }

  function initEvolution() {
    const evolution = runtime.cosmos?.syntheticEvolution;
    const timeline = $("#evolution-timeline");
    if (!evolution || !timeline) return;
    $("#evolution-disclaimer").textContent = evolution.disclaimer;
    timeline.replaceChildren();
    evolution.stages.forEach((stage, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.id = `evolution-tab-${stage.id}`;
      button.role = "tab";
      button.setAttribute("aria-selected", String(index === 0));
      button.setAttribute("aria-controls", "evolution-card");
      button.tabIndex = index === 0 ? 0 : -1;
      button.append(textElement("span", "", stage.time), textElement("strong", "", stage.label));
      button.addEventListener("click", () => selectEvolutionStage(stage.id));
      button.addEventListener("keydown", (event) => {
        const buttons = $$("button", timeline);
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next].click();
        buttons[next].focus();
      });
      timeline.append(button);
    });
    selectEvolutionStage(evolution.stages[0].id, false);
  }

  function selectEvolutionStage(stageId, focus = true) {
    const stage = runtime.cosmos.syntheticEvolution.stages.find((item) => item.id === stageId);
    if (!stage) return;
    $$("#evolution-timeline button").forEach((button) => {
      const active = button.id === `evolution-tab-${stageId}`;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    const fields = {
      "evolution-time": stage.time,
      "evolution-state": stage.state,
      "evolution-certainty": stage.certainty,
      "evolution-title": stage.label,
      "evolution-summary": stage.summary,
      "action-value": stage.action,
      "target-value": stage.target,
      "deadline-value": stage.deadline,
      "reassessment-value": stage.reassessment,
      "trigger-value": stage.trigger,
      "contingency-value": stage.contingency
    };
    Object.entries(fields).forEach(([id, value]) => { const node = $(`#${id}`); if (node) node.textContent = value; });
    if (focus) $("#evolution-card")?.focus({ preventScroll: true });
  }

  function initHistory() {
    const box = $("#history-diff");
    const snapshots = runtime.history?.snapshots;
    if (!box || !Array.isArray(snapshots) || snapshots.length < 2) {
      if (box) box.append(textElement("p", "", "Histórico ainda insuficiente para calcular evolução."));
      return;
    }
    const before = snapshots[0];
    const after = snapshots.at(-1);
    const changes = [
      { value: `+${after.globalGraph.nodes - before.globalGraph.nodes}`, label: "nós globais" },
      { value: `+${after.globalGraph.edges - before.globalGraph.edges}`, label: "arestas globais" },
      { value: `+${after.canonicalRoutesAdded - before.canonicalRoutesAdded}`, label: "rota canônica" },
      { value: `${after.constellations}/7`, label: "constelações" }
    ];
    box.replaceChildren();
    changes.forEach((change) => {
      const card = document.createElement("div");
      card.className = "diff-card";
      card.append(textElement("strong", "", change.value), textElement("span", "", change.label));
      box.append(card);
    });
  }

  function initAtlas() {
    if (!runtime.atlas) return;
    const groups = ["todos", ...new Set(runtime.atlas.items.map((item) => item.group))];
    const filters = $("#atlas-filters");
    filters.replaceChildren();
    groups.forEach((group) => {
      const button = textElement("button", "filter-button", group === "todos" ? "Todos" : group);
      button.type = "button";
      button.dataset.group = group;
      button.setAttribute("aria-pressed", String(group === runtime.atlasGroup));
      button.addEventListener("click", () => {
        runtime.atlasGroup = group;
        $$(".filter-button", filters).forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate.dataset.group === group)));
        renderAtlas();
      });
      filters.append(button);
    });
    $("#atlas-search")?.addEventListener("input", (event) => {
      runtime.atlasQuery = event.currentTarget.value.trim().toLocaleLowerCase("pt-BR");
      renderAtlas();
    });
    initDialog();
    renderAtlas();
    updateAtlasProgress();
  }

  function atlasMatches(item) {
    const groupMatch = runtime.atlasGroup === "todos" || item.group === runtime.atlasGroup;
    const corpus = [item.id, item.title, item.group, item.legend, ...(item.tags || [])].join(" ").toLocaleLowerCase("pt-BR");
    return groupMatch && (!runtime.atlasQuery || corpus.includes(runtime.atlasQuery));
  }

  function renderAtlas() {
    const grid = $("#atlas-grid");
    if (!grid || !runtime.atlas) return;
    const items = runtime.atlas.items.filter(atlasMatches);
    grid.replaceChildren();
    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "atlas-card";
      card.classList.toggle("is-seen", saved.seenImages.includes(item.id));
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Abrir ${item.id}: ${item.title}`);
      button.addEventListener("click", () => openAtlasItem(item));
      const wrap = document.createElement("div");
      wrap.className = "image-wrap";
      wrap.style.setProperty("--asset-aspect", `${item.asset.width}/${item.asset.height}`);
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.alt;
      image.width = item.asset.width;
      image.height = item.asset.height;
      image.loading = index < 2 ? "eager" : "lazy";
      image.decoding = "async";
      wrap.append(image, textElement("span", "atlas-badge", item.catalogCode || item.id), textElement("span", "atlas-seen-mark", "✓"));
      const content = document.createElement("div");
      content.className = "atlas-card-content";
      content.append(textElement("h3", "", item.title), textElement("p", "", item.legend));
      const footer = document.createElement("footer");
      footer.append(textElement("span", "", item.group), textElement("span", "", `${item.asset.width}×${item.asset.height}`));
      content.append(footer);
      button.append(wrap, content);
      card.append(button);
      grid.append(card);
    });
    $("#atlas-empty").hidden = items.length !== 0;
  }

  function openAtlasItem(item) {
    runtime.dialogItem = item;
    $("#dialog-image").src = item.image;
    $("#dialog-image").alt = item.alt;
    $("#dialog-image").width = item.asset.width;
    $("#dialog-image").height = item.asset.height;
    $("#dialog-id").textContent = `${item.catalogCode || item.id} · ${item.id} · ${item.group}`;
    $("#dialog-title").textContent = item.title;
    $("#dialog-legend").textContent = item.legend;
    $("#dialog-question").textContent = item.question;
    $("#dialog-answer").textContent = item.legend;
    $("#dialog-answer").hidden = true;
    $("#dialog-reveal").textContent = "Mostrar síntese";
    $("#dialog-asset-integrity").textContent = `${item.asset.width}×${item.asset.height} · ${item.asset.bytes} bytes · SHA-256 ${item.asset.sha256}`;
    $("#dialog-source-integrity").textContent = `${item.source.dimensions} · SHA-256 ${item.source.sha256}`;
    if (!saved.seenImages.includes(item.id)) {
      saveState({ seenImages: [...saved.seenImages, item.id] });
      renderAtlas();
      updateAtlasProgress();
    }
    $("#atlas-dialog").showModal();
  }

  function initDialog() {
    const dialog = $("#atlas-dialog");
    $("#dialog-close")?.addEventListener("click", () => dialog.close());
    $("#dialog-reveal")?.addEventListener("click", (event) => {
      const answer = $("#dialog-answer");
      answer.hidden = !answer.hidden;
      event.currentTarget.textContent = answer.hidden ? "Mostrar síntese" : "Ocultar síntese";
    });
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function updateAtlasProgress() {
    const count = runtime.atlas?.items.filter((item) => saved.seenImages.includes(item.id)).length || 0;
    $("#atlas-seen").textContent = String(count);
  }

  function initArchitecture() {
    const pipeline = $("#pipeline");
    const gates = $("#quality-gates");
    if (!runtime.cosmos) return;
    pipeline?.replaceChildren(...runtime.cosmos.pipeline.map((item) => textElement("li", "", item)));
    gates?.replaceChildren(...runtime.cosmos.qualityGates.map((item) => textElement("span", "", item)));
  }

  function initGlobalMetrics() {
    const nodes = runtime.globalGraph?.nodes?.length;
    const edges = runtime.globalGraph?.edges?.length;
    $("#metric-global-nodes").textContent = Number.isInteger(nodes) ? String(nodes) : "local";
    $("#metric-global-edges").textContent = Number.isInteger(edges) ? String(edges) : "local";
  }

  function initCoupling() {
    const dock = $("#coupling-grid");
    const universes = $("#universe-sessions");
    const tags = $("#tag-examples");
    const surfaces = $("#surface-grid");
    if (dock && runtime.blocks?.blocks) {
      dock.replaceChildren();
      runtime.blocks.blocks.forEach((block) => {
        const card = document.createElement("article");
        card.className = "coupling-card";
        card.dataset.status = block.status;
        card.append(
          textElement("span", "coupling-icon", block.icon),
          textElement("p", "eyebrow", block.code),
          textElement("h3", "", block.title),
          textElement("p", "", block.purpose)
        );
        const path = textElement("code", "coupling-path", block.ingestionPath);
        const universeRow = document.createElement("div");
        universeRow.className = "tag-row";
        block.universes.forEach((id) => universeRow.append(textElement("span", "", id.toUpperCase())));
        card.append(path, universeRow, textElement("span", "coupling-status", block.statusLabel));
        dock.append(card);
      });
    }
    if (universes && runtime.blocks?.universeSessions) {
      universes.replaceChildren();
      runtime.blocks.universeSessions.forEach((session) => {
        const panel = document.createElement("article");
        panel.className = "universe-session";
        panel.style.setProperty("--session-color", session.color);
        panel.append(textElement("p", "eyebrow", `${session.code} · UNIVERSO-GRAFO`), textElement("h3", "", `${session.icon} ${session.title}`), textElement("p", "", session.purpose));
        const route = document.createElement("ol");
        session.route.forEach((item) => route.append(textElement("li", "", item)));
        panel.append(route);
        const links = document.createElement("div");
        links.className = "tag-row";
        session.blocks.forEach((item) => links.append(textElement("span", "", item)));
        panel.append(links);
        universes.append(panel);
      });
    }
    if (tags && runtime.topology?.examples) {
      tags.replaceChildren(...runtime.topology.examples.map((tag) => textElement("code", "", tag)));
    }
    if (surfaces && runtime.surfaces?.surfaces) {
      surfaces.replaceChildren();
      runtime.surfaces.surfaces.forEach((surface) => {
        const card = document.createElement("article");
        card.className = "surface-card";
        card.append(
          textElement("strong", "", surface.label),
          textElement("span", "", surface.authority),
          textElement("small", "", surface.automatic ? "local automático" : "autorização necessária")
        );
        surfaces.append(card);
      });
    }
    const copyButton = $("#copy-command");
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        const command = $("#command-syntax")?.textContent || "";
        const status = $("#copy-status");
        try {
          await navigator.clipboard.writeText(command);
          status.textContent = "Comando-base copiado. Nenhuma sincronização foi executada.";
        } catch (_) {
          status.textContent = "Selecione e copie o comando manualmente; a área de transferência não está disponível.";
        }
      });
    }
    const lifecycle = $("#lifecycle-flow");
    if (lifecycle && runtime.lifecycle?.stages) {
      lifecycle.replaceChildren();
      runtime.lifecycle.stages.forEach((stage) => {
        const item = document.createElement("li");
        item.append(
          textElement("strong", "", `${stage.icon} ${stage.label}`),
          textElement("span", "", `${stage.output} · Gate: ${stage.gate}`)
        );
        lifecycle.append(item);
      });
    }
  }

  function initRenderer() {
    const tabs = $("#recipe-tabs");
    if (!tabs || !runtime.recipes?.recipes || !runtime.renderDemo) return;
    tabs.replaceChildren();
    runtime.recipes.recipes.forEach((recipe, index) => {
      const button = textElement("button", "recipe-tab", `${recipe.icon} ${recipe.label}`);
      button.type = "button";
      button.role = "tab";
      button.id = `recipe-tab-${recipe.id}`;
      button.dataset.recipe = recipe.id;
      button.setAttribute("aria-selected", String(index === 0));
      button.setAttribute("aria-controls", "render-stage");
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener("click", () => renderRecipe(recipe.id));
      button.addEventListener("keydown", (event) => {
        const buttons = $$(".recipe-tab", tabs);
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next].click();
        buttons[next].focus();
      });
      tabs.append(button);
    });
    renderRecipe(runtime.recipes.recipes[0].id, false);
  }

  function renderRecipe(recipeId, announce = true) {
    const recipe = runtime.recipes.recipes.find((item) => item.id === recipeId);
    const output = $("#render-output");
    if (!recipe || !output) return;
    $$(".recipe-tab").forEach((button) => {
      const active = button.dataset.recipe === recipeId;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    $("#render-kicker").textContent = recipe.preserves.map((item) => item.toUpperCase()).join(" · ");
    $("#render-stage-title").textContent = `${recipe.icon} ${recipe.label}`;
    $("#render-stage-fallback").textContent = `Fallback acessível: ${recipe.fallback}`;
    output.replaceChildren();

    if (recipeId === "radar") renderRadar(output);
    else if (recipeId === "timeline") renderDemoTimeline(output);
    else if (recipeId === "matrix") renderDemoTable(output);
    else if (recipeId === "chart") renderDemoChart(output);
    else if (recipeId === "visual") renderDemoVisual(output);
    else if (recipeId === "acra") renderDemoAcra(output);
    else if (recipeId === "turbo") renderDemoTurbo(output);
    else if (recipeId === "graph") renderDemoGraph(output);
    if (announce) setStatus(`${recipe.label} renderizado a partir do núcleo sintético comum.`);
  }

  function renderRadar(output) {
    const grid = document.createElement("div");
    grid.className = "action-contract";
    [
      ["P0", "Preservar fonte, privacidade e identidade antes da síntese."],
      ["MUDANÇA", "Fonte linear convertida em CASE-IR e relações explícitas."],
      ["AÇÃO", "Selecionar a receita pela relação que precisa ser mantida."],
      ["LACUNA", "Revisão médica e atestado de direitos continuam pendentes."],
      ["ALVO", "Produto local íntegro, acessível, topografado e testável."],
      ["REAVALIAÇÃO", "QR0–QR8 antes de sincronizar ou publicar."]
    ].forEach(([label, value]) => {
      const item = document.createElement("div");
      item.append(textElement("span", "", label), textElement("strong", "", value));
      grid.append(item);
    });
    output.append(grid);
  }

  function renderDemoTimeline(output) {
    const timeline = document.createElement("div");
    timeline.className = "demo-timeline";
    runtime.renderDemo.renders.timeline.forEach((item) => {
      const card = document.createElement("article");
      card.append(textElement("small", "", item.time), textElement("strong", "", item.label), textElement("span", "", item.detail), textElement("span", "", item.status));
      timeline.append(card);
    });
    output.append(timeline);
  }

  function renderDemoTable(output) {
    const source = runtime.renderDemo.renders.table;
    const table = document.createElement("table");
    table.className = "demo-table";
    table.append(textElement("caption", "", source.caption));
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    source.columns.forEach((column) => headRow.append(textElement("th", "", column)));
    head.append(headRow);
    const body = document.createElement("tbody");
    source.rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell) => tr.append(textElement("td", "", cell)));
      body.append(tr);
    });
    table.append(head, body);
    output.append(table);
  }

  function renderDemoChart(output) {
    const source = runtime.renderDemo.renders.chart;
    const figure = document.createElement("figure");
    figure.className = "demo-chart";
    figure.setAttribute("aria-label", `${source.title}, em ${source.unit}`);
    source.points.forEach((point) => {
      const row = document.createElement("div");
      row.className = "chart-row";
      const track = document.createElement("div");
      track.className = "chart-track";
      track.setAttribute("role", "img");
      track.setAttribute("aria-label", `${point.label}: ${point.value} de ${point.max}`);
      const fill = document.createElement("span");
      fill.className = "chart-fill";
      fill.style.width = `${Math.max(0, Math.min(100, point.value / point.max * 100))}%`;
      track.append(fill);
      row.append(textElement("span", "", point.label), track, textElement("strong", "", `${point.value}/${point.max}`));
      figure.append(row);
    });
    figure.append(textElement("figcaption", "sr-only", `Fonte: ${source.sourceId}. Valores estruturais do demonstrador, não desfechos clínicos.`));
    output.append(figure);
  }

  function renderDemoVisual(output) {
    const source = runtime.renderDemo.renders.visual;
    const layout = document.createElement("div");
    layout.className = "render-visual";
    const image = document.createElement("img");
    image.src = source.src;
    image.alt = source.alt;
    image.width = 1400;
    image.height = 788;
    image.loading = "lazy";
    const copy = document.createElement("div");
    copy.className = "render-copy";
    copy.append(textElement("h4", "", "Contrato da imagem"), textElement("p", "", source.legend), textElement("p", "", `Limite: ${source.limitations}`), textElement("code", "", `sourceId=${source.sourceId} · rights=${source.rights}`));
    layout.append(image, copy);
    output.append(layout);
  }

  function renderDemoAcra(output) {
    const source = runtime.renderDemo.renders.acra;
    const layout = document.createElement("div");
    layout.className = "acra-demo";
    const prompt = document.createElement("div");
    prompt.append(textElement("p", "eyebrow", "TENTATIVA ANTES DO FEEDBACK"), textElement("h4", "", source.prompt));
    const button = textElement("button", "", "Revelar feedback");
    button.type = "button";
    const answer = textElement("p", "", source.answer);
    answer.hidden = true;
    button.addEventListener("click", () => {
      answer.hidden = !answer.hidden;
      button.textContent = answer.hidden ? "Revelar feedback" : "Ocultar feedback";
    });
    prompt.append(button, answer);
    const transfer = document.createElement("div");
    transfer.append(textElement("p", "eyebrow", "ARMADILHA → TRANSFERÊNCIA"), textElement("h4", "", "Aplicar em outro contexto"), textElement("p", "", `Armadilha: ${source.trap}`), textElement("p", "", `Transferência: ${source.transfer}`));
    const review = document.createElement("div");
    review.className = "tag-row";
    source.reviewSchedule.forEach((item) => review.append(textElement("span", "", item)));
    transfer.append(review);
    layout.append(prompt, transfer);
    output.append(layout);
  }

  function renderDemoTurbo(output) {
    const source = runtime.renderDemo.renders.turbo;
    const forge = document.createElement("div");
    forge.className = "turbo-forge";
    source.outputs.forEach((item, index) => {
      const card = document.createElement("article");
      card.append(textElement("span", "", `DERIVAÇÃO ${String(index + 1).padStart(2, "0")}`), textElement("strong", "", item));
      forge.append(card);
    });
    output.append(forge, textElement("p", "interaction-status", `Fonte canônica comum: ${source.canonicalSourceId} · ${source.objective}`));
  }

  function renderDemoGraph(output) {
    const list = document.createElement("ul");
    list.className = "graph-demo-list";
    runtime.cosmos.edges
      .filter((edge) => edge.from.startsWith("block-") || edge.to === "tag-deposito")
      .slice(0, 14)
      .forEach((edge) => {
        const item = document.createElement("li");
        item.append(textElement("code", "", edge.relation), document.createTextNode(` · ${edge.from} → ${edge.to}`));
        list.append(item);
      });
    output.append(list);
    const tags = document.createElement("div");
    tags.className = "tag-examples";
    runtime.renderDemo.structuralTags.forEach((tag) => tags.append(textElement("code", "", tag)));
    output.append(tags);
  }

  function initPreferences() {
    const toggle = $("#theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const preferences = readA11yPreferences();
        const clarity = clarityActive(preferences);
        const updated = { ...preferences, clarity: !clarity };
        updated.theme = clarity ? "dark" : "light";
        if (updated.clarity) updated.contrast = false;
        try {
          localStorage.setItem(A11Y_PREFERENCES_KEY, JSON.stringify(updated));
        } catch (_) {
          // O tema continua funcional nesta página mesmo sem persistência local.
        }
        applyA11yPreferences(updated);
      });
    }
    addEventListener("storage", (event) => {
      if (event.key === A11Y_PREFERENCES_KEY) {
        applyA11yPreferences(readA11yPreferences(event.newValue));
      }
    });
    const systemTheme = matchMedia("(prefers-color-scheme: light)");
    const handleSystemThemeChange = () => {
      const preferences = readA11yPreferences();
      if (preferences.theme === "system") applyA11yPreferences(preferences);
    };
    if (systemTheme.addEventListener) systemTheme.addEventListener("change", handleSystemThemeChange);
    else systemTheme.addListener?.(handleSystemThemeChange);
    applyA11yPreferences();
    const continueButton = $("#continue-button");
    if (continueButton && saved.lastNode && saved.lastNode !== "nexus") {
      continueButton.hidden = false;
      continueButton.addEventListener("click", () => {
        document.querySelector("#grafo")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        selectNode(saved.lastNode);
      });
    }
  }

  async function bootstrap() {
    initPreferences();
    const [
      cosmos,
      atlas,
      historyData,
      globalGraph,
      blocks,
      topology,
      surfaces,
      recipes,
      renderDemo,
      lifecycle,
      entityCodes,
      daily
    ] = await Promise.all([
      fetchJson(PATHS.cosmos),
      fetchJson(PATHS.atlas),
      fetchJson(PATHS.history),
      fetchJson(PATHS.globalGraph),
      fetchJson(PATHS.blocks),
      fetchJson(PATHS.topology),
      fetchJson(PATHS.surfaces),
      fetchJson(PATHS.recipes),
      fetchJson(PATHS.renderDemo),
      fetchJson(PATHS.lifecycle),
      fetchJson(PATHS.entityCodes),
      fetchJson(PATHS.daily)
    ]);
    runtime.cosmos = cosmos;
    runtime.atlas = atlas;
    runtime.history = historyData;
    runtime.globalGraph = globalGraph;
    runtime.blocks = blocks;
    runtime.topology = topology;
    runtime.surfaces = surfaces;
    runtime.recipes = recipes;
    runtime.renderDemo = renderDemo;
    runtime.lifecycle = lifecycle;
    runtime.entityCodes = entityCodes;
    runtime.daily = daily;

    if (!cosmos || !atlas) {
      setStatus("A estação não conseguiu carregar os contratos locais obrigatórios.");
      return;
    }
    initUniverses();
    initLenses();
    initGraph();
    initConstellations();
    initDepths();
    initEvolution();
    initHistory();
    initAtlas();
    initArchitecture();
    initGlobalMetrics();
    initCoupling();
    initRenderer();
  }

  bootstrap();
})();
