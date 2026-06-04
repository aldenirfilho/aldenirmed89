/**
 * MAPA VIVO 4.1 PERSISTENTE — ANTIGRAVITY ENGINE
 * Curadoria PRO com Painel de Inclusão, localStorage e Busca Contextual.
 */

const CONFIG_V4 = {
  HEIGHT: 760,
  FORCE: -2200,
  DISTANCE: 180,
  COLLISION: 110,
  STORAGE_KEY: 'antigravity.mapa.overlay.v4',
  MODES: {
    CORE: ['hub', 'biblioteca', 'feed', 'qbank', 'tool'],
    CLINICAL: ['hub', 'module', 'topic', 'theme'],
    FILES: ['hub', 'biblioteca', 'file'],
    ALL: ['hub', 'biblioteca', 'feed', 'qbank', 'tool', 'module', 'topic', 'theme', 'file']
  }
};

let state = {
  fullData: { nodes: [], edges: [] },
  filteredNodes: [],
  filteredLinks: [],
  currentMode: 'CORE',
  isEditMode: false,
  selectedNodes: [],
  searchTerm: '',
  overlay: {
    addedNodes: [],
    updatedNodes: {},
    hiddenNodeIds: [],
    addedEdges: [],
    hiddenEdgeKeys: [],
    positions: {}
  },
  simulation: null,
  svg: null,
  g: null,
  zoom: null
};

// ── INICIALIZAÇÃO ──

async function initGraph() {
  const container = document.getElementById('graph');
  if (!container) return;

  container.innerHTML = '<div style="padding:40px; color:#64748b; font-family:Syne;">🧠 Carregando Cérebro Clínico v4.1...</div>';

  try {
    const dataUrl = container.getAttribute('data-graph-src') || 'data/connections.json';
    
    // Carregamento robusto com suporte a Patch
    const rawData = await loadConnectionsData(dataUrl);
    
    // Normalização de Schema (compatibilidade legada)
    state.fullData = normalizeGraphData(rawData);
    
    loadOverlay();
    applyOverlay();

    renderInterface(container);
    updateGraph();
    updateDebug();
  } catch (err) {
    console.error("Mapa Vivo Error:", err);
    renderFallback(container, err.message);
  }
}

/**
 * Carrega o JSON principal e tenta mesclar com um patch opcional da Biblioteca IA
 */
async function loadConnectionsData(dataUrl) {
  try {
    // 1. Buscar base com cache-buster
    const res = await fetch(dataUrl + '?t=' + Date.now());
    if (!res.ok) throw new Error("JSON principal do mapa não encontrado.");
    let baseData = await res.json();

    // 2. Tentar buscar patch opcional da Biblioteca IA
    // Caminho relativo ao index da biblioteca ou da home
    const patchPaths = ['data/connections_patch_biblioteca.json', '05_Biblioteca_IA/data/connections_patch_biblioteca.json'];
    
    for (const path of patchPaths) {
      try {
        const patchRes = await fetch(path + '?t=' + Date.now());
        if (patchRes.ok) {
          const patchData = await patchRes.json();
          console.log("🧩 Patch de conexões aplicado:", path);
          
          if (patchData.nodes) baseData.nodes = [...(baseData.nodes || []), ...patchData.nodes];
          if (patchData.edges) baseData.edges = [...(baseData.edges || []), ...patchData.edges];
          if (patchData.links) baseData.links = [...(baseData.links || []), ...patchData.links];
          break; // Sucesso no patch
        }
      } catch(e) { /* patch opcional falhou silenciosamente */ }
    }

    return baseData;
  } catch (err) {
    throw err;
  }
}

/**
 * Garante que o objeto tenha arrays de nodes e edges, tratando fallbacks legados
 */
function normalizeGraphData(data) {
  const normalized = {
    nodes: Array.isArray(data.nodes) ? data.nodes : [],
    edges: Array.isArray(data.edges) ? data.edges : (Array.isArray(data.links) ? data.links : [])
  };
  
  // Garantir campos mínimos nos links normalizados (from/to)
  normalized.edges = normalized.edges.map(e => ({
    ...e,
    from: e.from || e.source,
    to: e.to || e.target
  }));

  return normalized;
}

// ── GESTÃO DE DADOS & OVERLAY ──

function loadOverlay() {
  const saved = localStorage.getItem(CONFIG_V4.STORAGE_KEY);
  if (saved) {
    try {
      state.overlay = JSON.parse(saved);
    } catch (e) {
      console.warn("Falha ao ler overlay local.");
    }
  }
}

function saveOverlay() {
  localStorage.setItem(CONFIG_V4.STORAGE_KEY, JSON.stringify(state.overlay));
  updateDebug();
}

function applyOverlay() {
  // 1. Ocultar Nós
  state.fullData.nodes.forEach(n => {
    if (state.overlay.hiddenNodeIds.includes(n.id)) n.visible = false;
    if (state.overlay.updatedNodes[n.id]) Object.assign(n, state.overlay.updatedNodes[n.id]);
    if (state.overlay.positions[n.id]) {
      n.fx = state.overlay.positions[n.id].x;
      n.fy = state.overlay.positions[n.id].y;
    }
  });

  // 2. Adicionar Nós
  state.overlay.addedNodes.forEach(n => {
    if (!state.fullData.nodes.find(orig => orig.id === n.id)) {
      state.fullData.nodes.push(n);
    }
  });

  // 3. Ocultar Edges
  state.fullData.edges.forEach(e => {
    const key = `${e.from}->${e.to}`;
    if (state.overlay.hiddenEdgeKeys.includes(key)) e.visible = false;
  });

  // 4. Adicionar Edges
  state.overlay.addedEdges.forEach(e => {
    const key = `${e.from}->${e.to}`;
    if (!state.fullData.edges.find(orig => `${orig.from}->${orig.to}` === key)) {
      state.fullData.edges.push(e);
    }
  });
}

// ── INTERFACE & RENDER ──

function renderInterface(container) {
  const width = container.clientWidth || 1000;
  container.innerHTML = `
    <div class="graph-toolbar">
      <div class="graph-search-wrap">
        <input type="text" class="graph-search" placeholder="🔍 Buscar tema (mostra vizinhos)..." oninput="handleSearch(this.value)">
      </div>
      <div class="graph-actions">
        <button class="btn primary" onclick="setMode('CORE')">🧠 Núcleo</button>
        <button class="btn primary" onclick="setMode('CLINICAL')">🏥 Clínico</button>
        <button class="btn primary" onclick="setMode('FILES')">📄 Arquivos</button>
        <button class="btn ghost" onclick="setMode('ALL')">🌐 Tudo</button>
      </div>
      <div class="graph-actions" style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
        <button id="btnEdit" class="btn-curadoria btn ghost" onclick="toggleEditMode()">🛠️ Modo Curadoria</button>
        <button id="btnExport" class="btn ghost" onclick="exportPatch()" style="display:none">💾 Exportar Patch</button>
        <button id="btnReset" class="btn ghost" onclick="clearLocalChanges()" style="display:none">🧹 Limpar Local</button>
      </div>
    </div>
    <div id="debugPanel" class="debug-panel" hidden></div>
    <div id="curatorshipPanel" hidden>
      <h4 style="margin:0 0 10px 0; color:#3ee8ff; font-family:Syne;">✨ Adicionar Tema</h4>
      <label>Título</label>
      <input type="text" id="addTitle" placeholder="Ex: Sepse no Idoso">
      <label>ID (Slug)</label>
      <input type="text" id="addId" placeholder="Ex: sepse-idoso" onfocus="autoSlug()">
      <label>Tipo</label>
      <select id="addType">
        <option value="theme">Tema Clínico</option>
        <option value="module">Módulo Principal</option>
        <option value="file">Arquivo de Estudo</option>
      </select>
      <label>Tags (vírgula)</label>
      <input type="text" id="addTags" placeholder="uti, temi, sepse">
      <button class="btn primary" onclick="addNewNodeManual()" style="margin-top:10px; width:100%">Adicionar ao Mapa →</button>
    </div>
    <div id="graph-canvas-wrap" style="width:100%; height:${CONFIG_V4.HEIGHT}px"></div>
  `;

  state.svg = state.svg || d3.select("#graph-canvas-wrap").append("svg").attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width} ${CONFIG_V4.HEIGHT}`);
  state.g = state.g || state.svg.append("g");
  state.zoom = state.zoom || d3.zoom().scaleExtent([0.05, 8]).on("zoom", (event) => state.g.attr("transform", event.transform));
  state.svg.call(state.zoom);
}

function updateGraph() {
  const width = document.getElementById('graph-canvas-wrap').clientWidth || 1000;
  
  const typesToMatch = CONFIG_V4.MODES[state.currentMode];
  let nodes = state.fullData.nodes.filter(n => n.visible !== false && (typesToMatch.includes(n.type) || isNodeInMatch(n) || n.isNew));
  
  if (state.currentMode === 'FILES' && !state.searchTerm) nodes = nodes.slice(0, 50);

  const nodeIds = new Set(nodes.map(n => n.id));
  let links = state.fullData.edges.filter(e => e.visible !== false && nodeIds.has(e.from) && nodeIds.has(e.to));

  state.filteredNodes = nodes;
  state.filteredLinks = links.map(e => ({
    source: e.from, target: e.to, 
    relation: e.relation || "conecta", 
    style: (e.strength === 'suggested' || e.status === 'sugerido' || e.style === 'dashed') ? 'dashed' : 'solid'
  }));

  state.g.selectAll("*").remove();

  const link = state.g.append("g")
    .attr("class", "edges-layer")
    .selectAll("path")
    .data(state.filteredLinks)
    .join("path")
    .attr("class", d => `edge ${d.style === 'dashed' ? 'edge--suggested' : 'edge--direct'}`)
    .attr("fill", "none");

  const node = state.g.append("g")
    .attr("class", "nodes-layer")
    .selectAll(".node-group")
    .data(state.filteredNodes)
    .join("g")
    .attr("class", d => `node-group node-${d.type} ${state.selectedNodes.includes(d.id) ? 'is-selected' : ''} ${isExactMatch(d) ? 'is-match' : ''} ${d.isNew ? 'is-new' : ''}`)
    .style("color", d => getNodeColor(d.type))
    .call(d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded))
    .on("click", (event, d) => handleNodeClick(event, d));

  node.append("rect").attr("class", "node-card").attr("rx", 14).attr("ry", 14)
    .attr("x", d => -(calculateNodeWidth(d)/2)).attr("y", -20)
    .attr("width", d => calculateNodeWidth(d)).attr("height", 40);

  node.append("text").attr("class", "node-label").attr("text-anchor", "middle").attr("dy", 6).text(d => d.label);
  node.append("text").attr("class", "node-sub").attr("text-anchor", "middle").attr("dy", 28).text(d => d.type.toUpperCase());

  if (state.simulation) state.simulation.stop();
  state.simulation = d3.forceSimulation(state.filteredNodes)
    .force("link", d3.forceLink(state.filteredLinks).id(d => d.id).distance(CONFIG_V4.DISTANCE))
    .force("charge", d3.forceManyBody().strength(CONFIG_V4.FORCE))
    .force("center", d3.forceCenter(width / 2, CONFIG_V4.HEIGHT / 2))
    .force("collision", d3.forceCollide().radius(CONFIG_V4.COLLISION));

  state.simulation.on("tick", () => {
    link.attr("d", d => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    });
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });
}

// ── LÓGICA DE CURADORIA ADICIONAL ──

window.autoSlug = () => {
  const title = document.getElementById('addTitle').value;
  if (title && !document.getElementById('addId').value) {
    document.getElementById('addId').value = safeSlugify(title);
  }
};

function safeSlugify(text) {
  if (!text) return "";
  return text.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

window.addNewNodeManual = () => {
  const id = document.getElementById('addId').value;
  const label = document.getElementById('addTitle').value;
  if (!id || !label) { alert("ID e Título são obrigatórios."); return; }

  const newNode = {
    id, label, 
    type: document.getElementById('addType').value,
    tags: document.getElementById('addTags').value.split(',').map(t => t.trim()),
    body: "Novo tema adicionado via curadoria.",
    visible: true,
    isNew: true
  };

  state.overlay.addedNodes.push(newNode);
  saveOverlay();
  applyOverlay();
  
  // Limpar campos
  document.getElementById('addId').value = '';
  document.getElementById('addTitle').value = '';
  document.getElementById('addTags').value = '';

  alert(`✅ Tópico "${label}" adicionado! Ele aparecerá em destaque pulsar.`);
  updateGraph();
};

// ── LÓGICA DE BUSCA VIZINHOS ──

function handleSearch(val) {
  state.searchTerm = val.toLowerCase();
  updateGraph();
}

function isExactMatch(d) {
  if (!state.searchTerm) return false;
  return d.label.toLowerCase().includes(state.searchTerm) || d.id.toLowerCase().includes(state.searchTerm);
}

function isNodeInMatch(d) {
  if (!state.searchTerm) return false;
  if (isExactMatch(d)) return true;
  if (d.id === 'portal') return true;

  const links = state.fullData.edges.filter(e => e.visible !== false);
  const matchedNodeIds = state.fullData.nodes
    .filter(n => n.label.toLowerCase().includes(state.searchTerm) || n.id.toLowerCase().includes(state.searchTerm))
    .map(n => n.id);
  
  return links.some(e => 
    (matchedNodeIds.includes(e.from) && e.to === d.id) || 
    (matchedNodeIds.includes(e.to) && e.from === d.id)
  );
}

// ── MODO CURADORIA ──

function toggleEditMode() {
  state.isEditMode = !state.isEditMode;
  document.getElementById('btnEdit').classList.toggle('active');
  document.getElementById('btnExport').style.display = state.isEditMode ? 'block' : 'none';
  document.getElementById('btnReset').style.display = state.isEditMode ? 'block' : 'none';
  document.getElementById('debugPanel').hidden = !state.isEditMode;
  document.getElementById('curatorshipPanel').hidden = !state.isEditMode;
  document.body.classList.toggle('is-editing');
  state.selectedNodes = [];
  updateGraph();
}

function handleNodeClick(event, d) {
  if (state.isEditMode) {
    if (state.selectedNodes.includes(d.id)) {
      state.selectedNodes = state.selectedNodes.filter(id => id !== d.id);
    } else {
      state.selectedNodes.push(d.id);
      if (state.selectedNodes.length === 2) createQuickEdge();
    }
    updateGraph();
  } else {
    showDrawer(d);
  }
}

function createQuickEdge() {
  const from = state.selectedNodes[0];
  const to = state.selectedNodes[1];
  const newEdge = { from, to, relation: "sugestao-clinica", strength: "suggested", status: "sugerido", visible: true };
  
  state.overlay.addedEdges.push(newEdge);
  applyOverlay();
  saveOverlay();
  state.selectedNodes = [];
  updateGraph();
}

function clearLocalChanges() {
  if (confirm("Limpar todas as alterações locais (nós novos, conexões e posições)?")) {
    state.overlay = { addedNodes: [], updatedNodes: {}, hiddenNodeIds: [], addedEdges: [], hiddenEdgeKeys: [], positions: {} };
    saveOverlay();
    location.reload();
  }
}

function exportPatch() {
  const blob = new Blob([JSON.stringify(state.overlay, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patch_antigravity_v4_${Date.now()}.json`;
  a.click();
}

// ── UTILS ──

function calculateNodeWidth(d) { return d.label.length * 9 + 44; }
function getNodeColor(type) {
  const c = { hub: "#ffad4d", biblioteca: "#00d4ff", feed: "#38bdf8", qbank: "#ffc107", tool: "#4ef0a1", module: "#7c3aed", theme: "#64748b", file: "#94a3b8" };
  return c[type] || "#64748b";
}

function dragStarted(event, d) { if (!event.active) state.simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
function dragEnded(event, d) { 
  if (!event.active) state.simulation.alphaTarget(0); 
  state.overlay.positions[d.id] = { x: event.x, y: event.y };
  saveOverlay();
}

function updateDebug() {
  const panel = document.getElementById('debugPanel');
  if (!panel) return;
  panel.innerHTML = `
    <div>Nós: ${state.filteredNodes.length}/${state.fullData.nodes.length}</div>
    <div>Links: ${state.filteredLinks.length}</div>
    <div>Overlay: ${JSON.stringify(state.overlay).length} bytes</div>
    <div>Modo: ${state.currentMode}</div>
  `;
}

function showDrawer(d) {
  const drawer = document.getElementById('drawer');
  document.getElementById('drawerTitle').textContent = d.label;
  document.getElementById('drawerBody').innerHTML = `
    <p style="margin-bottom:1.5rem">${d.body}</p>
    <div class="drawer-meta"><span>TIPO: ${d.type.toUpperCase()}</span><span>ID: ${d.id}</span></div>
    <div class="drawer-actions">${d.url && d.url !== '#' ? `<a href="${d.url}" class="btn primary">Abrir Conteúdo →</a>` : ''}</div>
    ${state.isEditMode ? `<button class="btn danger" onclick="hideNodeDirect('${d.id}')" style="margin-top:20px; width:100%">🚫 Ocultar Tema</button>` : ''}
  `;
  drawer.hidden = false;
  document.getElementById('drawerClose').onclick = () => drawer.hidden = true;
}

window.hideNodeDirect = (id) => {
  if (confirm(`Ocultar permanentemente (local) o nó ${id}?`)) {
    state.overlay.hiddenNodeIds.push(id);
    saveOverlay();
    location.reload();
  }
};

function setMode(m) { state.currentMode = m; updateGraph(); }
function renderFallback(container, msg) {
  container.innerHTML = `<div class="graph-fallback"><h3>⚠️ Modo Seguro</h3><p>${msg}</p><ul style="text-align:left;max-height:300px;overflow:auto">${state.fullData.nodes.map(n => `<li><a href="${n.url}">${n.label}</a></li>`).join('')}</ul></div>`;
}

document.addEventListener('DOMContentLoaded', initGraph);
window.MapaVivoDebug = { 
  getState: () => state, 
  clearOverlay: () => { localStorage.removeItem(CONFIG_V4.STORAGE_KEY); location.reload(); } 
};
