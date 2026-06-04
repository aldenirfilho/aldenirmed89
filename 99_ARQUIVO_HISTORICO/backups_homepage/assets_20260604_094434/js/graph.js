/*
  Mapa Vivo Editável 3.1 — Antigravity Consultas
  Objetivo: mapa clicável, curável e seguro para GitHub Pages.
  - Inclui/oculta/edita temas em memória
  - Conexões diretas: linhas contínuas
  - Conexões sugeridas: linhas tracejadas
  - Exporta patch JSON para aplicação segura no repositório
*/
(function () {
  "use strict";

  const DATA_URL = "data/connections.json";
  const DEFAULT_HEIGHT = 760;
  const MAX_FILE_NODES = 18;

  let state = {
    raw: null,
    nodes: [],
    edges: [],
    visibleNodes: [],
    visibleEdges: [],
    selectedNode: null,
    selectedEdge: null,
    mode: "core",
    query: "",
    width: 1180,
    height: DEFAULT_HEIGHT,
    simulation: null,
    zoomBehavior: null,
    svg: null,
    viewport: null,
    patch: createEmptyPatch()
  };

  document.addEventListener("DOMContentLoaded", initMapaVivo);

  async function initMapaVivo() {
    const graphEl = document.querySelector("#graph");
    const mapaEl = document.querySelector("#mapa");
    const root = graphEl || mapaEl;

    if (!root) {
      console.warn("[Mapa Vivo] Elemento #graph ou #mapa não encontrado.");
      return;
    }

    root.innerHTML = `
      <div class="graph-loading">🧠 Carregando Mapa Vivo...</div>
    `;

    try {
      const data = await loadGraphData();
      state.raw = data;
      const normalized = normalizeGraphData(data, root);
      state.nodes = normalized.nodes;
      state.edges = normalized.edges;
      renderGraphShell(root);
      applyFiltersAndRender();
      bindToolbarEvents(root);
      bindAdminEvents(root);
      updatePatchPreview();
    } catch (error) {
      console.error("[Mapa Vivo] Falha ao iniciar", error);
      renderFallback(root, error);
    }
  }

  async function loadGraphData() {
    const url = `${DATA_URL}?t=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Falha ao carregar ${DATA_URL}: HTTP ${response.status}`);
    return response.json();
  }

  function normalizeGraphData(data, root) {
    const rawNodes = Array.isArray(data.nodes) ? data.nodes : Array.isArray(data.topics) ? data.topics : [];
    const rawEdges = Array.isArray(data.edges) ? data.edges : Array.isArray(data.connections) ? data.connections : [];

    const width = Math.max(root.clientWidth || 1180, 820);
    const height = Math.max(root.clientHeight || DEFAULT_HEIGHT, DEFAULT_HEIGHT);
    state.width = width;
    state.height = height;

    const seen = new Set();
    const nodes = rawNodes
      .filter(Boolean)
      .map((node, index) => {
        const id = slugify(node.id || node.slug || node.label || node.title || `node-${index}`);
        const type = String(node.type || node.kind || "theme").toLowerCase();
        let x = Number.isFinite(Number(node.x)) ? Number(node.x) : distributeX(index, rawNodes.length, width);
        let y = Number.isFinite(Number(node.y)) ? Number(node.y) : distributeY(index, rawNodes.length, height);
        if (x >= 0 && x <= 100) x = (x / 100) * width;
        if (y >= 0 && y <= 100) y = (y / 100) * height;

        return {
          ...node,
          id,
          label: node.label || node.title || id,
          body: node.body || node.description || "Tópico clínico da Enciclopédia.",
          type,
          status: node.status || "ativo",
          url: node.url || node.href || "#",
          tags: normalizeTags(node.tags),
          visible: node.visible !== false && node.status !== "oculto" && node.status !== "rejeitado",
          x,
          y,
          fx: node.fixed === true ? x : undefined,
          fy: node.fixed === true ? y : undefined
        };
      })
      .filter((node) => {
        if (!node.id || seen.has(node.id)) return false;
        seen.add(node.id);
        return true;
      });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = rawEdges
      .filter(Boolean)
      .map((edge, index) => {
        const from = slugify(edge.from || edge.source || edge.origin || "");
        const to = slugify(edge.to || edge.target || edge.destination || "");
        return {
          ...edge,
          id: edge.id || `${from}__${to}__${index}`,
          from,
          to,
          source: from,
          target: to,
          relation: edge.relation || edge.label || "conecta",
          strength: edge.strength === "suggested" || edge.status === "sugerido" ? "suggested" : "direct",
          status: edge.status || (edge.strength === "suggested" ? "sugerido" : "ativo"),
          visible: edge.visible !== false && edge.status !== "oculto" && edge.status !== "rejeitado",
          reason: edge.reason || "",
          createdBy: edge.createdBy || "manual"
        };
      })
      .filter((edge) => edge.from && edge.to && nodeIds.has(edge.from) && nodeIds.has(edge.to));

    return { nodes, edges };
  }

  function renderGraphShell(root) {
    root.classList.add("graph-root-ready");
    root.innerHTML = `
      <div class="graph-toolbar" role="toolbar" aria-label="Controles do Mapa Vivo">
        <input id="graphSearch" class="graph-search" type="search" placeholder="🔎 Buscar tema, tag ou módulo..." autocomplete="off" />
        <div class="graph-actions">
          <button class="graph-mode active" data-mode="core" type="button">🧠 Núcleo</button>
          <button class="graph-mode" data-mode="clinical" type="button">🏥 Clínico</button>
          <button class="graph-mode" data-mode="files" type="button">📄 Arquivos</button>
          <button class="graph-mode" data-mode="all" type="button">🌐 Tudo</button>
          <button id="graphZoomIn" class="btn small" type="button">＋</button>
          <button id="graphZoomOut" class="btn small" type="button">−</button>
          <button id="graphReset" class="btn small" type="button">Reset</button>
          <button id="graphAdminToggle" class="btn small admin-toggle" type="button">🛠️ Curadoria</button>
        </div>
      </div>

      <div class="graph-statusbar">
        <span id="graphCount">0 nós</span>
        <span>•</span>
        <span>linha contínua = conexão direta</span>
        <span>•</span>
        <span>linha tracejada = sugestão/curadoria</span>
      </div>

      <div class="graph-canvas-wrap">
        <svg id="graphSvg" class="graph-svg" role="img" aria-label="Mapa vivo da Enciclopédia Médica"></svg>
      </div>

      <aside id="drawer" class="graph-drawer" hidden aria-live="polite"></aside>

      <section id="graphAdminPanel" class="graph-admin-panel" hidden>
        <div class="admin-head">
          <div>
            <h3>🛠️ Curadoria do Mapa Vivo</h3>
            <p>Inclua, oculte e conecte temas sem apagar o JSON principal. Tudo vira patch seguro.</p>
          </div>
          <button id="graphAdminClose" class="btn small" type="button">Fechar</button>
        </div>

        <div class="admin-grid">
          <form id="adminNodeForm" class="admin-card">
            <h4>➕ Incluir/editar tema</h4>
            <label>ID/slug <input name="id" placeholder="ex: lupus-uti" required /></label>
            <label>Título <input name="label" placeholder="🦋 Lúpus na UTI" required /></label>
            <label>Descrição <textarea name="body" rows="3" placeholder="Resumo do tema..."></textarea></label>
            <div class="admin-two">
              <label>Tipo
                <select name="type">
                  <option value="theme">theme</option>
                  <option value="module">module</option>
                  <option value="topic">topic</option>
                  <option value="tool">tool</option>
                  <option value="qbank">qbank</option>
                  <option value="feed">feed</option>
                  <option value="biblioteca">biblioteca</option>
                  <option value="file">file</option>
                  <option value="hub">hub</option>
                </select>
              </label>
              <label>Status
                <select name="status">
                  <option value="ativo">ativo</option>
                  <option value="planejado">planejado</option>
                  <option value="sugerido">sugerido</option>
                </select>
              </label>
            </div>
            <label>URL <input name="url" placeholder="temas/lupus-uti/index.html ou #" /></label>
            <label>Tags <input name="tags" placeholder="uti,temi,reumatologia,choque" /></label>
            <div class="admin-row">
              <button class="btn primary" type="submit">Adicionar tema ao patch</button>
              <button id="adminLoadSelected" class="btn" type="button">Carregar selecionado</button>
            </div>
          </form>

          <form id="adminEdgeForm" class="admin-card">
            <h4>🔗 Adicionar conexão</h4>
            <label>Origem <input name="from" placeholder="id-origem" required /></label>
            <label>Destino <input name="to" placeholder="id-destino" required /></label>
            <label>Relação <input name="relation" placeholder="subtema, alimenta, gera-card..." /></label>
            <div class="admin-two">
              <label>Força
                <select name="strength">
                  <option value="direct">direct / contínua</option>
                  <option value="suggested">suggested / tracejada</option>
                </select>
              </label>
              <label>Status
                <select name="status">
                  <option value="ativo">ativo</option>
                  <option value="sugerido">sugerido</option>
                </select>
              </label>
            </div>
            <label>Motivo <textarea name="reason" rows="3" placeholder="Por que essa conexão existe?"></textarea></label>
            <div class="admin-row">
              <button class="btn primary" type="submit">Adicionar conexão</button>
              <button id="adminUseSelectedAsFrom" class="btn" type="button">Usar selecionado como origem</button>
            </div>
          </form>

          <div class="admin-card">
            <h4>🧯 Exclusão segura</h4>
            <p>Não apaga fisicamente. Marca como oculto no patch.</p>
            <label>ID do tema <input id="adminHideNodeId" placeholder="id-do-tema" /></label>
            <label>Motivo <textarea id="adminHideReason" rows="3" placeholder="Motivo da ocultação"></textarea></label>
            <div class="admin-row">
              <button id="adminHideNode" class="btn danger" type="button">Ocultar tema</button>
              <button id="adminCopySelectedId" class="btn" type="button">Copiar ID selecionado</button>
            </div>
          </div>

          <div class="admin-card patch-card">
            <h4>📦 Patch JSON</h4>
            <p>Exporte e peça ao Antigravity para aplicar no JSON principal.</p>
            <div class="admin-row">
              <button id="adminCopyPatch" class="btn" type="button">Copiar patch</button>
              <button id="adminExportPatch" class="btn primary" type="button">Exportar patch JSON</button>
              <button id="adminClearPatch" class="btn danger" type="button">Limpar patch</button>
            </div>
            <pre id="adminPatchPreview" class="patch-preview"></pre>
          </div>
        </div>
      </section>
    `;

    state.svg = d3.select(root.querySelector("#graphSvg"));
    state.svg.attr("viewBox", `0 0 ${state.width} ${state.height}`);
    state.viewport = state.svg.append("g").attr("class", "graph-viewport");

    state.zoomBehavior = d3.zoom()
      .scaleExtent([0.45, 2.8])
      .on("zoom", (event) => state.viewport.attr("transform", event.transform));

    state.svg.call(state.zoomBehavior);
  }

  function applyFiltersAndRender() {
    state.visibleNodes = getVisibleNodes();
    const visibleIds = new Set(state.visibleNodes.map((node) => node.id));
    state.visibleEdges = state.edges.filter((edge) => {
      return edge.visible !== false &&
        edge.status !== "oculto" &&
        edge.status !== "rejeitado" &&
        visibleIds.has(edge.from) &&
        visibleIds.has(edge.to);
    });

    renderGraph();
    updateCounts();
  }

  function getVisibleNodes() {
    const q = normalizeText(state.query);
    let nodes = state.nodes.filter((node) => node.visible !== false && node.status !== "oculto" && node.status !== "rejeitado");

    if (state.mode === "core") {
      nodes = nodes.filter((node) => ["hub", "biblioteca", "feed", "qbank", "tool", "module"].includes(node.type));
    } else if (state.mode === "clinical") {
      nodes = nodes.filter((node) => ["hub", "module", "topic", "theme", "tool", "qbank"].includes(node.type));
    } else if (state.mode === "files") {
      const base = nodes.filter((node) => ["hub", "biblioteca"].includes(node.type) || node.id === "biblioteca-ia");
      const files = nodes.filter((node) => node.type === "file").slice(0, MAX_FILE_NODES);
      nodes = [...base, ...files];
    }

    if (q) {
      nodes = nodes.filter((node) => {
        const haystack = normalizeText([node.id, node.label, node.body, node.type, node.status, ...(node.tags || [])].join(" "));
        return haystack.includes(q);
      });
    }

    return nodes;
  }

  function renderGraph() {
    if (!window.d3 || !state.viewport) {
      throw new Error("Biblioteca D3 não carregada.");
    }

    if (state.simulation) state.simulation.stop();
    state.viewport.selectAll("*").remove();

    const links = state.visibleEdges.map((edge) => ({ ...edge }));
    const nodes = state.visibleNodes.map((node) => ({ ...node }));

    const linkLayer = state.viewport.append("g").attr("class", "graph-links");
    const labelLayer = state.viewport.append("g").attr("class", "graph-relation-labels");
    const nodeLayer = state.viewport.append("g").attr("class", "graph-nodes");

    const link = linkLayer
      .selectAll("line")
      .data(links, edgeKey)
      .join("line")
      .attr("class", (d) => `graph-link ${d.strength === "suggested" ? "suggested" : "direct"}`)
      .attr("stroke-dasharray", (d) => d.strength === "suggested" ? "8 8" : null)
      .attr("stroke", (d) => getLinkColor(d))
      .attr("stroke-width", (d) => getLinkWidth(d))
      .attr("stroke-opacity", (d) => d.status === "sugerido" ? 0.74 : 0.9)
      .on("click", (event, d) => {
        event.stopPropagation();
        state.selectedEdge = d;
        openEdgeDrawer(d);
      });

    const relationLabels = labelLayer
      .selectAll("text")
      .data(links.filter((edge) => edge.relation), edgeKey)
      .join("text")
      .attr("class", "graph-relation-label")
      .text((d) => shortRelation(d.relation));

    const node = nodeLayer
      .selectAll("g")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("class", (d) => `node-group node-${d.type || "theme"} status-${d.status || "ativo"}`)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("rect")
      .attr("class", "node-card")
      .attr("rx", 18)
      .attr("ry", 18)
      .attr("x", -82)
      .attr("y", -30)
      .attr("width", 164)
      .attr("height", 60);

    node.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("y", -4)
      .text((d) => truncate(d.label, 25));

    node.append("text")
      .attr("class", "node-sub")
      .attr("text-anchor", "middle")
      .attr("y", 16)
      .text((d) => `${typeLabel(d.type)} • ${d.status || "ativo"}`);

    node.on("click", (event, d) => {
      event.stopPropagation();
      state.selectedNode = state.nodes.find((n) => n.id === d.id) || d;
      openNodeDrawer(state.selectedNode);
    });

    state.svg.on("click", () => closeDrawer());

    state.simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance((d) => d.strength === "suggested" ? 220 : 165).strength(0.42))
      .force("charge", d3.forceManyBody().strength(-640))
      .force("center", d3.forceCenter(state.width / 2, state.height / 2))
      .force("collision", d3.forceCollide().radius(104))
      .force("x", d3.forceX((d) => clamp(d.x || state.width / 2, 80, state.width - 80)).strength(0.055))
      .force("y", d3.forceY((d) => clamp(d.y || state.height / 2, 70, state.height - 70)).strength(0.055));

    state.simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      relationLabels
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2 - 8);

      node.attr("transform", (d) => {
        d.x = clamp(d.x, 92, state.width - 92);
        d.y = clamp(d.y, 42, state.height - 42);
        return `translate(${d.x},${d.y})`;
      });
    });

    function dragstarted(event, d) {
      if (!event.active) state.simulation.alphaTarget(0.25).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = clamp(event.x, 92, state.width - 92);
      d.fy = clamp(event.y, 42, state.height - 42);
    }

    function dragended(event, d) {
      if (!event.active) state.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  function bindToolbarEvents(root) {
    const search = root.querySelector("#graphSearch");
    const buttons = root.querySelectorAll(".graph-mode");

    search.addEventListener("input", debounce((event) => {
      state.query = event.target.value || "";
      applyFiltersAndRender();
    }, 180));

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        state.mode = button.dataset.mode || "core";
        applyFiltersAndRender();
      });
    });

    root.querySelector("#graphZoomIn")?.addEventListener("click", () => zoomBy(1.18));
    root.querySelector("#graphZoomOut")?.addEventListener("click", () => zoomBy(0.84));
    root.querySelector("#graphReset")?.addEventListener("click", resetZoom);
    root.querySelector("#graphAdminToggle")?.addEventListener("click", () => toggleAdminPanel(true));
    root.querySelector("#graphAdminClose")?.addEventListener("click", () => toggleAdminPanel(false));
  }

  function bindAdminEvents(root) {
    const nodeForm = root.querySelector("#adminNodeForm");
    const edgeForm = root.querySelector("#adminEdgeForm");

    nodeForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(nodeForm);
      const node = {
        id: slugify(form.get("id")),
        label: String(form.get("label") || "").trim(),
        body: String(form.get("body") || "Tópico clínico da Enciclopédia.").trim(),
        type: String(form.get("type") || "theme"),
        status: String(form.get("status") || "ativo"),
        url: String(form.get("url") || "#").trim() || "#",
        tags: normalizeTags(form.get("tags")),
        visible: true,
        x: state.width / 2 + Math.random() * 120 - 60,
        y: state.height / 2 + Math.random() * 120 - 60,
        createdBy: "curadoria-local"
      };

      if (!node.id || !node.label) return notify("Preencha ID e título do tema.", "error");

      const existingIndex = state.nodes.findIndex((n) => n.id === node.id);
      if (existingIndex >= 0) {
        state.nodes[existingIndex] = { ...state.nodes[existingIndex], ...node };
        addPatchOperation({ op: "updateNode", id: node.id, node });
        notify("Tema atualizado em memória e no patch. 🛠️");
      } else {
        state.nodes.push(node);
        addPatchOperation({ op: "addNode", node });
        notify("Tema incluído em memória e no patch. ✅");
      }

      nodeForm.reset();
      applyFiltersAndRender();
    });

    edgeForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(edgeForm);
      const strength = String(form.get("strength") || "direct");
      const edge = {
        from: slugify(form.get("from")),
        to: slugify(form.get("to")),
        relation: String(form.get("relation") || "conecta").trim() || "conecta",
        strength,
        status: strength === "suggested" ? "sugerido" : String(form.get("status") || "ativo"),
        visible: true,
        reason: String(form.get("reason") || "").trim(),
        createdBy: "curadoria-local"
      };

      if (!edge.from || !edge.to) return notify("Preencha origem e destino.", "error");
      if (!findNode(edge.from) || !findNode(edge.to)) return notify("Origem ou destino não existem no mapa.", "error");

      state.edges.push({ ...edge, id: `${edge.from}__${edge.to}__${Date.now()}`, source: edge.from, target: edge.to });
      addPatchOperation({ op: strength === "suggested" ? "addSuggestedEdge" : "addDirectEdge", edge });
      notify(strength === "suggested" ? "Conexão sugerida adicionada — linha tracejada. ✨" : "Conexão direta adicionada — linha contínua. ✅");
      edgeForm.reset();
      applyFiltersAndRender();
    });

    root.querySelector("#adminLoadSelected")?.addEventListener("click", () => {
      if (!state.selectedNode) return notify("Selecione um nó no mapa primeiro.", "error");
      nodeForm.id.value = state.selectedNode.id;
      nodeForm.label.value = state.selectedNode.label;
      nodeForm.body.value = state.selectedNode.body || "";
      nodeForm.type.value = state.selectedNode.type || "theme";
      nodeForm.status.value = state.selectedNode.status || "ativo";
      nodeForm.url.value = state.selectedNode.url || "#";
      nodeForm.tags.value = (state.selectedNode.tags || []).join(",");
    });

    root.querySelector("#adminUseSelectedAsFrom")?.addEventListener("click", () => {
      if (!state.selectedNode) return notify("Selecione um nó no mapa primeiro.", "error");
      edgeForm.from.value = state.selectedNode.id;
    });

    root.querySelector("#adminHideNode")?.addEventListener("click", () => {
      const id = slugify(root.querySelector("#adminHideNodeId")?.value || state.selectedNode?.id || "");
      const reason = root.querySelector("#adminHideReason")?.value || "Ocultado por curadoria";
      hideNode(id, reason);
    });

    root.querySelector("#adminCopySelectedId")?.addEventListener("click", () => {
      if (!state.selectedNode) return notify("Selecione um nó primeiro.", "error");
      copyText(state.selectedNode.id);
      notify("ID copiado. 📋");
    });

    root.querySelector("#adminCopyPatch")?.addEventListener("click", () => {
      copyText(JSON.stringify(state.patch, null, 2));
      notify("Patch copiado. 📋");
    });

    root.querySelector("#adminExportPatch")?.addEventListener("click", exportPatch);

    root.querySelector("#adminClearPatch")?.addEventListener("click", () => {
      state.patch = createEmptyPatch();
      updatePatchPreview();
      notify("Patch limpo em memória. 🧹");
    });
  }

  function openNodeDrawer(node) {
    const drawer = document.querySelector("#drawer");
    if (!drawer) return;

    const direct = state.edges.filter((edge) => edge.visible !== false && edge.status !== "oculto" && edge.status !== "rejeitado" && edge.strength !== "suggested" && (edge.from === node.id || edge.to === node.id));
    const suggested = state.edges.filter((edge) => edge.visible !== false && edge.status !== "oculto" && edge.status !== "rejeitado" && edge.strength === "suggested" && (edge.from === node.id || edge.to === node.id));
    const autoSuggestions = suggestConnectionsForNode(node, state.nodes).filter((edge) => !hasEdge(edge.from, edge.to));

    drawer.hidden = false;
    drawer.innerHTML = `
      <button class="drawer-close" type="button" aria-label="Fechar">×</button>
      <div class="drawer-kicker">${escapeHtml(typeLabel(node.type))}</div>
      <h3>${escapeHtml(node.label)}</h3>
      <p>${escapeHtml(node.body || "Tópico clínico da Enciclopédia.")}</p>
      <div class="drawer-meta">
        <span>ID: <code>${escapeHtml(node.id)}</code></span>
        <span>Status: ${escapeHtml(node.status || "ativo")}</span>
        <span>Tags: ${(node.tags || []).map(escapeHtml).join(", ") || "—"}</span>
      </div>

      <div class="drawer-actions">
        ${node.url && node.url !== "#" ? `<a class="btn primary" href="${escapeAttr(node.url)}">Abrir conteúdo</a>` : ""}
        <button class="btn" data-action="copy-node-id" type="button">Copiar ID</button>
        <button class="btn danger" data-action="hide-node" type="button">Ocultar tema</button>
        <button class="btn" data-action="load-admin" type="button">Editar no painel</button>
      </div>

      <section class="drawer-connections">
        <h4>Conexões diretas</h4>
        ${renderEdgeList(direct, node.id, "direct")}
        <h4>Conexões sugeridas</h4>
        ${renderEdgeList(suggested, node.id, "suggested")}
        <h4>Novas sugestões possíveis</h4>
        ${renderSuggestionList(autoSuggestions)}
      </section>
    `;

    drawer.querySelector(".drawer-close")?.addEventListener("click", closeDrawer);
    drawer.querySelector("[data-action='copy-node-id']")?.addEventListener("click", () => {
      copyText(node.id);
      notify("ID copiado. 📋");
    });
    drawer.querySelector("[data-action='hide-node']")?.addEventListener("click", () => hideNode(node.id, "Ocultado pelo drawer"));
    drawer.querySelector("[data-action='load-admin']")?.addEventListener("click", () => {
      toggleAdminPanel(true);
      document.querySelector("#adminLoadSelected")?.click();
    });

    drawer.querySelectorAll("[data-add-suggestion]").forEach((button) => {
      button.addEventListener("click", () => {
        const payload = JSON.parse(button.getAttribute("data-add-suggestion"));
        state.edges.push({ ...payload, id: `${payload.from}__${payload.to}__${Date.now()}`, source: payload.from, target: payload.to });
        addPatchOperation({ op: "addSuggestedEdge", edge: payload });
        notify("Sugestão adicionada ao patch e desenhada como tracejada. ✨");
        applyFiltersAndRender();
        openNodeDrawer(node);
      });
    });

    drawer.querySelectorAll("[data-approve-edge]").forEach((button) => {
      button.addEventListener("click", () => {
        const [from, to] = button.getAttribute("data-approve-edge").split("|");
        approveSuggestedEdge(from, to);
        openNodeDrawer(node);
      });
    });

    drawer.querySelectorAll("[data-reject-edge]").forEach((button) => {
      button.addEventListener("click", () => {
        const [from, to] = button.getAttribute("data-reject-edge").split("|");
        rejectSuggestedEdge(from, to);
        openNodeDrawer(node);
      });
    });
  }

  function openEdgeDrawer(edge) {
    const drawer = document.querySelector("#drawer");
    if (!drawer) return;
    const from = findNode(edge.from) || { label: edge.from };
    const to = findNode(edge.to) || { label: edge.to };
    drawer.hidden = false;
    drawer.innerHTML = `
      <button class="drawer-close" type="button" aria-label="Fechar">×</button>
      <div class="drawer-kicker">${edge.strength === "suggested" ? "Conexão sugerida / tracejada" : "Conexão direta / contínua"}</div>
      <h3>${escapeHtml(from.label)} → ${escapeHtml(to.label)}</h3>
      <p><strong>Relação:</strong> ${escapeHtml(edge.relation || "conecta")}</p>
      <p><strong>Status:</strong> ${escapeHtml(edge.status || "ativo")}</p>
      ${edge.reason ? `<p><strong>Motivo:</strong> ${escapeHtml(edge.reason)}</p>` : ""}
      <div class="drawer-actions">
        ${edge.strength === "suggested" ? `<button class="btn primary" data-approve-edge="${edge.from}|${edge.to}" type="button">Aprovar conexão</button>` : ""}
        <button class="btn danger" data-hide-edge="${edge.from}|${edge.to}" type="button">Ocultar conexão</button>
      </div>
    `;
    drawer.querySelector(".drawer-close")?.addEventListener("click", closeDrawer);
    drawer.querySelector("[data-approve-edge]")?.addEventListener("click", () => approveSuggestedEdge(edge.from, edge.to));
    drawer.querySelector("[data-hide-edge]")?.addEventListener("click", () => hideEdge(edge.from, edge.to, "Ocultada pelo drawer"));
  }

  function renderEdgeList(edges, currentId, type) {
    if (!edges.length) return `<p class="muted">Nenhuma conexão ${type === "suggested" ? "sugerida" : "direta"} ainda.</p>`;
    return `<ul class="edge-list">${edges.map((edge) => {
      const otherId = edge.from === currentId ? edge.to : edge.from;
      const other = findNode(otherId);
      return `<li>
        <span>${edge.strength === "suggested" ? "〰️" : "━"} <strong>${escapeHtml(other?.label || otherId)}</strong><br><small>${escapeHtml(edge.relation || "conecta")}</small></span>
        ${edge.strength === "suggested" ? `<span class="edge-buttons"><button class="mini-btn" data-approve-edge="${edge.from}|${edge.to}" type="button">aprovar</button><button class="mini-btn danger" data-reject-edge="${edge.from}|${edge.to}" type="button">rejeitar</button></span>` : ""}
      </li>`;
    }).join("")}</ul>`;
  }

  function renderSuggestionList(suggestions) {
    if (!suggestions.length) return `<p class="muted">Sem novas sugestões automáticas por tags neste nó.</p>`;
    return `<ul class="edge-list suggestions">${suggestions.map((edge) => {
      const other = findNode(edge.to);
      const payload = escapeAttr(JSON.stringify(edge));
      return `<li>
        <span>✨ <strong>${escapeHtml(other?.label || edge.to)}</strong><br><small>${escapeHtml(edge.reason || edge.relation)}</small></span>
        <button class="mini-btn" data-add-suggestion="${payload}" type="button">adicionar tracejada</button>
      </li>`;
    }).join("")}</ul>`;
  }

  function hideNode(id, reason) {
    const node = findNode(id);
    if (!node) return notify("Tema não encontrado.", "error");
    node.visible = false;
    node.status = "oculto";
    state.edges.forEach((edge) => {
      if (edge.from === id || edge.to === id) edge.visible = false;
    });
    addPatchOperation({ op: "hideNode", id, reason: reason || "Ocultado por curadoria" });
    notify("Tema ocultado com segurança no patch. 🧯");
    closeDrawer();
    applyFiltersAndRender();
  }

  function hideEdge(from, to, reason) {
    state.edges.forEach((edge) => {
      if ((edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)) {
        edge.visible = false;
        edge.status = "oculto";
      }
    });
    addPatchOperation({ op: "hideEdge", from, to, reason: reason || "Ocultada por curadoria" });
    notify("Conexão ocultada no patch. 🧯");
    closeDrawer();
    applyFiltersAndRender();
  }

  function approveSuggestedEdge(from, to) {
    const edge = state.edges.find((e) => e.from === from && e.to === to && e.strength === "suggested");
    if (!edge) return notify("Conexão sugerida não encontrada.", "error");
    edge.strength = "direct";
    edge.status = "ativo";
    addPatchOperation({ op: "approveSuggestedEdge", from, to });
    notify("Conexão aprovada — virou linha contínua. ✅");
    applyFiltersAndRender();
  }

  function rejectSuggestedEdge(from, to) {
    const edge = state.edges.find((e) => e.from === from && e.to === to && e.strength === "suggested");
    if (!edge) return notify("Conexão sugerida não encontrada.", "error");
    edge.visible = false;
    edge.status = "rejeitado";
    addPatchOperation({ op: "rejectSuggestedEdge", from, to });
    notify("Conexão sugerida rejeitada. ❌");
    applyFiltersAndRender();
  }

  function suggestConnectionsForNode(node, allNodes) {
    const suggestions = [];
    const nodeTags = new Set(node.tags || []);
    for (const other of allNodes) {
      if (other.id === node.id || other.visible === false || other.status === "oculto") continue;
      const sharedTags = (other.tags || []).filter((tag) => nodeTags.has(tag));
      if (sharedTags.length >= 1) {
        suggestions.push({
          from: node.id,
          to: other.id,
          relation: `tags-compartilhadas:${sharedTags.join(",")}`,
          strength: "suggested",
          status: "sugerido",
          visible: true,
          reason: `Tags compartilhadas: ${sharedTags.join(", ")}`,
          createdBy: "Mapa Vivo 3.1"
        });
      }
    }
    return suggestions.slice(0, 8);
  }

  function renderFallback(root, error) {
    root.innerHTML = `
      <div class="graph-fallback">
        <h3>⚠️ Mapa Vivo em modo seguro</h3>
        <p>Erro encontrado: <code>${escapeHtml(error.message || String(error))}</code></p>
        <p>Confira se o arquivo <code>data/connections.json</code> existe, se o D3 foi carregado e se os IDs das conexões apontam para nós existentes.</p>
        <div class="graph-fallback-grid">
          <article><strong>🧠 Portal</strong><span>Nó central do projeto</span></article>
          <article><strong>📚 Biblioteca IA</strong><span>Arquivos e conteúdos</span></article>
          <article><strong>🏥 Módulos UTI</strong><span>AVC, VM, sepse, AKI...</span></article>
          <article><strong>🛠️ Correção</strong><span>Aplicar pacote Mapa Vivo 3.1</span></article>
        </div>
      </div>
    `;
  }

  function addPatchOperation(operation) {
    state.patch.updatedAt = new Date().toISOString();
    state.patch.operations.push(operation);
    updatePatchPreview();
  }

  function createEmptyPatch() {
    return {
      patchType: "mapa-vivo-admin-patch",
      version: "3.1",
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetRepository: "aldenirfilho/antigravity-consultas",
      targetFile: "data/connections.json",
      operations: []
    };
  }

  function updatePatchPreview() {
    const pre = document.querySelector("#adminPatchPreview");
    if (pre) pre.textContent = JSON.stringify(state.patch, null, 2);
  }

  function exportPatch() {
    const blob = new Blob([JSON.stringify(state.patch, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa_vivo_patch_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify("Patch JSON exportado. 📦");
  }

  function updateCounts() {
    const el = document.querySelector("#graphCount");
    if (!el) return;
    const allFiles = state.nodes.filter((n) => n.type === "file" && n.visible !== false).length;
    const extra = state.mode === "files" && allFiles > MAX_FILE_NODES ? ` • ${allFiles - MAX_FILE_NODES} arquivos extras ocultos no modo rápido` : "";
    el.textContent = `${state.visibleNodes.length} nós • ${state.visibleEdges.length} conexões${extra}`;
  }

  function toggleAdminPanel(show) {
    const panel = document.querySelector("#graphAdminPanel");
    if (panel) panel.hidden = !show;
  }

  function closeDrawer() {
    const drawer = document.querySelector("#drawer");
    if (drawer) drawer.hidden = true;
  }

  function zoomBy(factor) {
    if (!state.svg || !state.zoomBehavior) return;
    state.svg.transition().duration(180).call(state.zoomBehavior.scaleBy, factor);
  }

  function resetZoom() {
    if (!state.svg || !state.zoomBehavior) return;
    state.svg.transition().duration(220).call(state.zoomBehavior.transform, d3.zoomIdentity);
  }

  function findNode(id) {
    return state.nodes.find((node) => node.id === id);
  }

  function hasEdge(from, to) {
    return state.edges.some((edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from));
  }

  function getLinkColor(edge) {
    if (edge.strength === "suggested") return "rgba(255,209,102,0.82)";
    const relation = edge.relation || "";
    if (relation.includes("subtema")) return "rgba(62,232,255,0.88)";
    if (relation.includes("gera")) return "rgba(255,209,102,0.84)";
    if (relation.includes("alimenta")) return "rgba(78,240,161,0.82)";
    if (relation.includes("apoia")) return "rgba(169,140,255,0.82)";
    return "rgba(62,232,255,0.78)";
  }

  function getLinkWidth(edge) {
    if (edge.strength === "suggested") return 2.1;
    const relation = edge.relation || "";
    if (relation.includes("subtema")) return 2.8;
    if (relation.includes("gera")) return 2.7;
    if (relation.includes("alimenta")) return 2.7;
    return 2.35;
  }

  function edgeKey(edge) {
    return `${edge.from || edge.source?.id || edge.source}|${edge.to || edge.target?.id || edge.target}|${edge.relation}|${edge.strength}`;
  }

  function shortRelation(text) {
    return truncate(String(text || "conecta").replace("tags-compartilhadas:", "tags: "), 28);
  }

  function typeLabel(type) {
    const labels = {
      hub: "Hub",
      biblioteca: "Biblioteca IA",
      feed: "Card Feed",
      qbank: "Banco TEMI",
      tool: "Ferramenta",
      module: "Módulo clínico",
      topic: "Subtema",
      theme: "Tema",
      file: "Arquivo"
    };
    return labels[type] || "Tema";
  }

  function normalizeTags(input) {
    if (Array.isArray(input)) return input.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
    return String(input || "").split(/[;,]/).map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  }

  function normalizeText(text) {
    return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function slugify(text) {
    return normalizeText(text).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "node";
  }

  function distributeX(index, total, width) {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2;
    return width / 2 + Math.cos(angle) * Math.min(width * 0.34, 360);
  }

  function distributeY(index, total, height) {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2;
    return height / 2 + Math.sin(angle) * Math.min(height * 0.32, 260);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function truncate(text, max) {
    text = String(text || "");
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  function copyText(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
  }

  function notify(message, variant = "ok") {
    let toast = document.querySelector(".graph-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "graph-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.dataset.variant = variant;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
