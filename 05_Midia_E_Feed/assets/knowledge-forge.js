(() => {
  "use strict";

  const DB_NAME = "CardFeedMedicoLocalDB_v2";
  const DB_VERSION = 2;
  const CARD_STORE = "cards";
  const PROJECT_STORE = "knowledgeProjects";
  const BACKUP_SCHEMA = "antigravity-card-feed-backup-v3";
  const MAX_ZIP_BYTES = 512 * 1024 * 1024;
  const MAX_ZIP_ENTRIES = 2500;
  const MAX_PROJECTS = 1000;
  const MAX_CARDS = 5000;
  const MAX_CANVAS_EDGE = 1800;
  const MATURITY_LABELS = {
    draft: "Rascunho",
    testable: "Testável",
    teachable: "Ensinável"
  };
  const MISSION_TEMPLATES = Object.freeze([
    {
      type: "evidence-constellation",
      icon: "🔭",
      title: "Constelação de evidências",
      subtitle: "Transforme pixels e texto em afirmações rastreáveis.",
      prompt: title => `Produza uma constelação para “${title}”: separe observações visíveis, inferências clínicas e lacunas. Conecte cada afirmação a uma evidência da imagem ou do OCR.`
    },
    {
      type: "diagnostic-duel",
      icon: "⚔️",
      title: "Duelo de modelos",
      subtitle: "Construa duas explicações concorrentes e tente refutá-las.",
      prompt: title => `Construa dois modelos plausíveis para “${title}”. Para cada um, descreva o melhor argumento, o achado que o enfraquece e a informação capaz de decidir o duelo.`
    },
    {
      type: "causal-map",
      icon: "🕸️",
      title: "Mapa causal",
      subtitle: "Produza mecanismo, consequência e pontos de intervenção.",
      prompt: title => `Desenhe em palavras a cadeia causal de “${title}”: gatilho → mecanismo → achados → desfechos. Marque onde uma intervenção poderia mudar o percurso e qual efeito adverso poderia surgir.`
    },
    {
      type: "decision-simulator",
      icon: "🎛️",
      title: "Simulador de decisão",
      subtitle: "Defina limiares, custo do erro e plano de reavaliação.",
      prompt: title => `Crie um cenário decisório inspirado em “${title}”. Defina a decisão, o limiar para agir, o custo de falso positivo e falso negativo, além do dado que obrigaria reavaliação.`
    },
    {
      type: "teachable-synthesis",
      icon: "🧑‍🚀",
      title: "Síntese ensinável",
      subtitle: "Produza um artefato que outra pessoa consiga usar e criticar.",
      prompt: title => `Produza uma microaula de 90 segundos sobre “${title}”: ideia central, três relações essenciais, uma armadilha e uma pergunta ainda aberta. Termine com como você verificaria a qualidade da síntese.`
    }
  ]);

  const state = {
    db: null,
    bridge: null,
    projects: [],
    current: null,
    canvas: null,
    context: null,
    originalImage: "",
    history: [],
    tool: "pen",
    drawing: false,
    startPoint: null,
    snapshot: null,
    cropSelection: null,
    ocrWorker: null,
    initialized: false
  };

  const $ = id => document.getElementById(id);
  const nowISO = () => new Date().toISOString();
  const uid = prefix => `${prefix}_${Date.now().toString(36)}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character]));
  }

  function safeId(value, fallbackPrefix) {
    const normalized = String(value || "").replace(/[^a-zA-Z0-9_.:-]/g, "-").slice(0, 180);
    return normalized || uid(fallbackPrefix);
  }

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Falha no IndexedDB."));
    });
  }

  function transactionComplete(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Transação local interrompida."));
      transaction.onabort = () => reject(transaction.error || new Error("Transação local cancelada."));
    });
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = event => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(CARD_STORE)) {
          database.createObjectStore(CARD_STORE, { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains(PROJECT_STORE)) {
          const projects = database.createObjectStore(PROJECT_STORE, { keyPath: "id" });
          projects.createIndex("sourceCardId", "sourceCardId", { unique: false });
          projects.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Não foi possível abrir a Forja."));
      request.onblocked = () => reject(new Error("Feche outras abas antigas do Card Feed e tente novamente."));
    });
  }

  function projectStore(mode = "readonly") {
    return state.db.transaction(PROJECT_STORE, mode).objectStore(PROJECT_STORE);
  }

  async function loadProjects() {
    state.projects = (await requestResult(projectStore().getAll()))
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    renderProjects();
  }

  async function putProject(project) {
    project.updatedAt = nowISO();
    await requestResult(projectStore("readwrite").put(project));
    await loadProjects();
    return project;
  }

  async function deleteProject(id) {
    await requestResult(projectStore("readwrite").delete(id));
    await loadProjects();
  }

  function createMissions(title) {
    return MISSION_TEMPLATES.map(template => ({
      id: uid("mission"),
      type: template.type,
      maturity: "draft",
      artifact: "",
      evidence: "",
      uncertainty: "",
      nextQuestion: "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      prompt: template.prompt(title)
    }));
  }

  function normalizeProject(project) {
    const title = String(project.title || "Projeto sem título").slice(0, 180);
    const missionsByType = new Map((project.missions || []).map(mission => [mission.type, mission]));
    return {
      id: safeId(project.id, "forge"),
      sourceCardId: String(project.sourceCardId || "").slice(0, 180),
      title,
      sourceImageData: String(project.sourceImageData || ""),
      editedImageData: String(project.editedImageData || ""),
      ocrText: String(project.ocrText || "").slice(0, 120000),
      ocrConfidence: Number.isFinite(project.ocrConfidence) ? project.ocrConfidence : null,
      missions: MISSION_TEMPLATES.map(template => {
        const existing = missionsByType.get(template.type) || {};
        return {
          id: safeId(existing.id, "mission"),
          type: template.type,
          maturity: Object.hasOwn(MATURITY_LABELS, existing.maturity) ? existing.maturity : "draft",
          artifact: String(existing.artifact || "").slice(0, 24000),
          evidence: String(existing.evidence || "").slice(0, 12000),
          uncertainty: String(existing.uncertainty || "").slice(0, 12000),
          nextQuestion: String(existing.nextQuestion || "").slice(0, 12000),
          createdAt: existing.createdAt || nowISO(),
          updatedAt: existing.updatedAt || nowISO(),
          prompt: template.prompt(title)
        };
      }),
      createdAt: project.createdAt || nowISO(),
      updatedAt: project.updatedAt || nowISO()
    };
  }

  function missionProductionScore(mission) {
    let score = 0;
    if (mission.artifact.trim().length >= 120) score++;
    if (mission.evidence.trim().length >= 35) score++;
    if (mission.uncertainty.trim().length >= 25) score++;
    if (mission.nextQuestion.trim().length >= 25) score++;
    return score;
  }

  function projectMetrics(project) {
    const missions = project.missions || [];
    const produced = missions.filter(mission => missionProductionScore(mission) >= 3).length;
    const teachable = missions.filter(mission => mission.maturity === "teachable").length;
    const total = Math.max(1, missions.length);
    return {
      produced,
      teachable,
      percent: Math.round((produced / total) * 100)
    };
  }

  function renderProjects() {
    const container = $("forgeProjects");
    if (!container) return;
    const projects = state.projects;
    const produced = projects.reduce((sum, project) => sum + projectMetrics(project).produced, 0);
    const teachable = projects.reduce((sum, project) => sum + projectMetrics(project).teachable, 0);
    const withOcr = projects.filter(project => project.ocrText?.trim()).length;
    $("forgeStatProjects").textContent = projects.length;
    $("forgeStatProduced").textContent = produced;
    $("forgeStatTeachable").textContent = teachable;
    $("forgeStatOcr").textContent = withOcr;
    if (!projects.length) {
      container.innerHTML = `
        <div class="forge-empty">
          <b>🛰️ Nenhum projeto ainda.</b><br/>
          Escolha um card com imagem e pressione <b>Forjar conhecimento</b>.
          A imagem pode ter sido criada pelo GPT, Claude, Gemini ou por você.
        </div>
      `;
      return;
    }
    container.innerHTML = projects.map(project => {
      const metrics = projectMetrics(project);
      const image = project.editedImageData || project.sourceImageData;
      return `
        <article class="forge-project">
          ${image ? `<img src="${esc(image)}" alt="${esc(`Imagem do projeto ${project.title}`)}" loading="lazy" decoding="async"/>` : ""}
          <div class="forge-project-body">
            <h3>${esc(project.title)}</h3>
            <p>${metrics.produced}/5 artefatos produzidos • ${project.ocrText ? "OCR disponível" : "OCR pendente"}</p>
            <div class="forge-project-progress" aria-label="${metrics.percent}% do projeto produzido">
              <span style="width:${metrics.percent}%"></span>
            </div>
            <div class="forge-project-actions">
              <button type="button" class="btn small primary" data-open-forge="${esc(project.id)}">🧠 Continuar</button>
              <button type="button" class="btn small danger" data-delete-forge="${esc(project.id)}">🗑️</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  async function imageLoaded(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("A imagem do card não pôde ser aberta."));
      image.src = source;
    });
  }

  async function drawSourceToCanvas(source, { resetHistory = false } = {}) {
    const image = await imageLoaded(source);
    const scale = Math.min(1, MAX_CANVAS_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    state.canvas.width = width;
    state.canvas.height = height;
    state.context.clearRect(0, 0, width, height);
    state.context.drawImage(image, 0, 0, width, height);
    if (resetHistory) state.history = [];
    state.cropSelection = null;
    state.snapshot = null;
    updateEditorStatus(`${width} × ${height} px • edição local`);
  }

  function canvasDataURL() {
    const webp = state.canvas.toDataURL("image/webp", .92);
    return webp.startsWith("data:image/webp") ? webp : state.canvas.toDataURL("image/png");
  }

  function pushHistory() {
    state.history.push(canvasDataURL());
    if (state.history.length > 10) state.history.shift();
  }

  async function undoCanvas() {
    const previous = state.history.pop();
    if (!previous) {
      updateEditorStatus("Nada para desfazer.");
      return;
    }
    await drawSourceToCanvas(previous);
    updateEditorStatus("Última alteração desfeita.");
  }

  async function resetCanvas() {
    if (!state.originalImage) return;
    pushHistory();
    await drawSourceToCanvas(state.originalImage);
    updateEditorStatus("Imagem original restaurada.");
  }

  function canvasPoint(event) {
    const rect = state.canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(state.canvas.width, (event.clientX - rect.left) * state.canvas.width / rect.width)),
      y: Math.max(0, Math.min(state.canvas.height, (event.clientY - rect.top) * state.canvas.height / rect.height))
    };
  }

  function selectedColor(alpha = 1) {
    const hex = $("forgeColor").value || "#38bdf8";
    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);
    return `rgba(${red},${green},${blue},${alpha})`;
  }

  function editorLineWidth() {
    return Math.max(2, Number($("forgeStroke").value) || 6);
  }

  function restoreSnapshot() {
    if (state.snapshot) state.context.putImageData(state.snapshot, 0, 0);
  }

  function drawArrow(from, to, { preview = false } = {}) {
    const context = state.context;
    const width = editorLineWidth();
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const head = Math.max(12, width * 3);
    context.save();
    context.strokeStyle = selectedColor();
    context.fillStyle = selectedColor();
    context.lineWidth = width;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.beginPath();
    context.moveTo(to.x, to.y);
    context.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
    context.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();
    if (preview) context.setLineDash([8, 5]);
    context.restore();
  }

  function drawCropSelection(from, to) {
    const context = state.context;
    const x = Math.min(from.x, to.x);
    const y = Math.min(from.y, to.y);
    const width = Math.abs(to.x - from.x);
    const height = Math.abs(to.y - from.y);
    state.cropSelection = { x, y, width, height };
    context.save();
    context.strokeStyle = "#fbbf24";
    context.fillStyle = "rgba(251,191,36,.14)";
    context.lineWidth = Math.max(2, state.canvas.width / 500);
    context.setLineDash([10, 7]);
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
    context.restore();
  }

  function handleCanvasPointerDown(event) {
    if (!state.current) return;
    event.preventDefault();
    state.canvas.setPointerCapture?.(event.pointerId);
    state.drawing = true;
    state.startPoint = canvasPoint(event);
    pushHistory();
    state.snapshot = state.context.getImageData(0, 0, state.canvas.width, state.canvas.height);
    if (state.tool === "pen" || state.tool === "highlight") {
      state.context.save();
      state.context.strokeStyle = selectedColor(state.tool === "highlight" ? .28 : 1);
      state.context.lineWidth = state.tool === "highlight" ? editorLineWidth() * 3 : editorLineWidth();
      state.context.lineCap = "round";
      state.context.lineJoin = "round";
      state.context.beginPath();
      state.context.moveTo(state.startPoint.x, state.startPoint.y);
    }
  }

  function handleCanvasPointerMove(event) {
    if (!state.drawing) return;
    event.preventDefault();
    const point = canvasPoint(event);
    if (state.tool === "pen" || state.tool === "highlight") {
      state.context.lineTo(point.x, point.y);
      state.context.stroke();
      return;
    }
    restoreSnapshot();
    if (state.tool === "arrow") drawArrow(state.startPoint, point, { preview: true });
    if (state.tool === "crop") drawCropSelection(state.startPoint, point);
  }

  function handleCanvasPointerUp(event) {
    if (!state.drawing) return;
    event.preventDefault();
    const point = canvasPoint(event);
    if (state.tool === "pen" || state.tool === "highlight") {
      state.context.lineTo(point.x, point.y);
      state.context.stroke();
      state.context.restore();
    } else {
      restoreSnapshot();
      if (state.tool === "arrow") drawArrow(state.startPoint, point);
      if (state.tool === "crop") drawCropSelection(state.startPoint, point);
    }
    state.drawing = false;
    updateEditorStatus(state.tool === "crop" ? "Seleção pronta. Pressione Aplicar corte." : "Anotação adicionada.");
  }

  async function applyCrop() {
    const crop = state.cropSelection;
    if (!crop || crop.width < 12 || crop.height < 12) {
      updateEditorStatus("Selecione uma área maior antes de aplicar o corte.");
      return;
    }
    restoreSnapshot();
    const x = Math.max(0, Math.round(crop.x));
    const y = Math.max(0, Math.round(crop.y));
    const width = Math.min(state.canvas.width - x, Math.round(crop.width));
    const height = Math.min(state.canvas.height - y, Math.round(crop.height));
    const temporary = document.createElement("canvas");
    temporary.width = width;
    temporary.height = height;
    temporary.getContext("2d").drawImage(state.canvas, x, y, width, height, 0, 0, width, height);
    state.canvas.width = width;
    state.canvas.height = height;
    state.context.drawImage(temporary, 0, 0);
    state.cropSelection = null;
    state.snapshot = null;
    updateEditorStatus(`Corte aplicado: ${width} × ${height} px.`);
  }

  function addTextAnnotation() {
    const text = $("forgeTextAnnotation").value.trim();
    if (!text) {
      updateEditorStatus("Digite um texto antes de anotar.");
      return;
    }
    pushHistory();
    const size = Math.max(18, Math.round(state.canvas.width / 28));
    const padding = Math.round(size * .42);
    const context = state.context;
    context.save();
    context.font = `800 ${size}px system-ui, sans-serif`;
    const width = Math.min(state.canvas.width - padding * 2, context.measureText(text).width + padding * 2);
    context.fillStyle = "rgba(2,6,23,.82)";
    context.fillRect(padding, padding, width, size + padding * 1.5);
    context.fillStyle = selectedColor();
    context.fillText(text.slice(0, 90), padding * 1.6, padding + size);
    context.restore();
    $("forgeTextAnnotation").value = "";
    updateEditorStatus("Texto incorporado à imagem.");
  }

  function updateEditorStatus(message) {
    $("forgeEditorStatus").textContent = message;
  }

  function setTool(tool) {
    if (!["pen", "highlight", "arrow", "crop"].includes(tool)) return;
    state.tool = tool;
    document.querySelectorAll("[data-forge-tool]").forEach(button => {
      const active = button.dataset.forgeTool === tool;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateEditorStatus({
      pen: "Caneta: desenhe livremente.",
      highlight: "Marca-texto: realce uma região.",
      arrow: "Seta: arraste do ponto inicial ao destino.",
      crop: "Corte: arraste uma seleção e pressione Aplicar corte."
    }[tool]);
  }

  function renderMissions() {
    const container = $("forgeMissions");
    const project = state.current;
    container.innerHTML = project.missions.map((mission, index) => {
      const template = MISSION_TEMPLATES.find(item => item.type === mission.type);
      const score = missionProductionScore(mission);
      return `
        <details class="forge-mission" ${index === 0 ? "open" : ""} data-mission-id="${esc(mission.id)}">
          <summary>
            <span class="forge-mission-number">${template.icon}</span>
            <span class="forge-mission-title">
              <b>${index + 1}. ${esc(template.title)}</b>
              <small>${esc(template.subtitle)}</small>
            </span>
            <span class="forge-maturity">${esc(MATURITY_LABELS[mission.maturity])} • ${score}/4</span>
          </summary>
          <div class="forge-mission-body">
            <div class="forge-prompt">${esc(mission.prompt)}</div>
            <label>
              Artefato produzido
              <textarea data-mission-field="artifact" placeholder="Produza um mapa, argumento, protocolo, comparação ou microaula. Não procure uma resposta pronta.">${esc(mission.artifact)}</textarea>
            </label>
            <label>
              Evidências e rastreabilidade
              <textarea data-mission-field="evidence" placeholder="Quais pixels, palavras do OCR ou relações sustentam o artefato?">${esc(mission.evidence)}</textarea>
            </label>
            <label>
              Incerteza e contraponto
              <textarea data-mission-field="uncertainty" placeholder="O que pode estar errado? Qual interpretação rival merece teste?">${esc(mission.uncertainty)}</textarea>
            </label>
            <label>
              Próxima pergunta ou experimento
              <textarea data-mission-field="nextQuestion" placeholder="Que dado novo, busca ou simulação faria o conhecimento avançar?">${esc(mission.nextQuestion)}</textarea>
            </label>
            <label>
              Maturidade do conhecimento
              <select class="select" data-mission-field="maturity">
                ${Object.entries(MATURITY_LABELS).map(([value, label]) =>
                  `<option value="${value}" ${mission.maturity === value ? "selected" : ""}>${label}</option>`
                ).join("")}
              </select>
            </label>
          </div>
        </details>
      `;
    }).join("");
  }

  function switchTab(tabName) {
    document.querySelectorAll("[data-forge-tab]").forEach(button => {
      const selected = button.dataset.forgeTab === tabName;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll("[data-forge-panel]").forEach(panel => {
      panel.hidden = panel.dataset.forgePanel !== tabName;
    });
  }

  async function openProject(projectId, { autoOcr = false } = {}) {
    const found = state.projects.find(project => project.id === projectId);
    if (!found) return;
    state.current = normalizeProject(structuredClone(found));
    $("forgeProjectTitle").value = state.current.title;
    $("forgeDialogTitle").textContent = state.current.title;
    $("forgeOcrText").value = state.current.ocrText || "";
    $("forgeOcrStatus").textContent = state.current.ocrText
      ? `Texto local disponível${Number.isFinite(state.current.ocrConfidence) ? ` • confiança média ${Math.round(state.current.ocrConfidence)}%` : ""}. Revise contra a imagem.`
      : "OCR ainda não executado.";
    $("forgeOcrBar").style.width = state.current.ocrText ? "100%" : "0";
    renderMissions();
    switchTab("image");
    $("knowledgeForgeDialog").showModal();
    const source = state.current.editedImageData || state.current.sourceImageData;
    state.originalImage = state.current.sourceImageData || source;
    await drawSourceToCanvas(source, { resetHistory: true });
    if (autoOcr && !state.current.ocrText) {
      window.setTimeout(() => runOcr(), 250);
    }
  }

  async function createProjectFromCard(card) {
    const image = card?.imageData || card?.imageUrl || "";
    if (!card || !image) {
      state.bridge.toast("Este card precisa de uma imagem para iniciar a Forja.");
      return;
    }
    const existing = state.projects.find(project => project.sourceCardId === card.id);
    if (existing) {
      await openProject(existing.id);
      return;
    }
    const project = normalizeProject({
      id: uid("forge"),
      sourceCardId: card.id,
      title: card.title || "Projeto visual",
      sourceImageData: image,
      editedImageData: "",
      ocrText: "",
      missions: createMissions(card.title || "Projeto visual"),
      createdAt: nowISO(),
      updatedAt: nowISO()
    });
    await putProject(project);
    await openProject(project.id, { autoOcr: true });
  }

  async function saveCurrentProject() {
    if (!state.current) return;
    state.current.title = $("forgeProjectTitle").value.trim().slice(0, 180) || state.current.title;
    state.current.editedImageData = canvasDataURL();
    state.current.ocrText = $("forgeOcrText").value.trim().slice(0, 120000);
    state.current.missions.forEach(mission => {
      mission.prompt = MISSION_TEMPLATES.find(template => template.type === mission.type).prompt(state.current.title);
    });
    await putProject(normalizeProject(state.current));
    state.current = state.projects.find(project => project.id === state.current.id);
    $("forgeDialogTitle").textContent = state.current.title;
    $("forgeSaveStatus").textContent = "✅ Projeto salvo neste dispositivo.";
    window.setTimeout(() => { $("forgeSaveStatus").textContent = ""; }, 2500);
  }

  function updateOcrProgress(message) {
    const progress = Math.max(0, Math.min(1, Number(message.progress) || 0));
    $("forgeOcrBar").style.width = `${Math.round(progress * 100)}%`;
    const labels = {
      "loading tesseract core": "Carregando motor OCR local",
      "initializing tesseract": "Inicializando OCR",
      "loading language traineddata": "Carregando idiomas português e inglês",
      "initializing api": "Preparando reconhecimento",
      "recognizing text": "Reconhecendo texto da imagem"
    };
    $("forgeOcrStatus").textContent = `${labels[message.status] || "OCR local"} • ${Math.round(progress * 100)}%`;
  }

  async function getOcrWorker() {
    if (state.ocrWorker) return state.ocrWorker;
    if (!window.Tesseract?.createWorker) {
      throw new Error("O motor OCR local não foi carregado. Atualize a página e tente novamente.");
    }
    state.ocrWorker = await window.Tesseract.createWorker("por+eng", 1, {
      workerPath: "./assets/vendor/tesseract/worker.min.js",
      langPath: "./assets/vendor/tesseract/lang",
      corePath: "./assets/vendor/tesseract/tesseract-core-lstm.wasm.js",
      legacyCore: false,
      legacyLang: false,
      logger: updateOcrProgress
    });
    return state.ocrWorker;
  }

  async function runOcr() {
    if (!state.current || $("btnForgeOcr").disabled) return;
    $("btnForgeOcr").disabled = true;
    $("forgeOcrStatus").textContent = "Iniciando OCR local…";
    $("forgeOcrBar").style.width = "2%";
    try {
      const worker = await getOcrWorker();
      const result = await worker.recognize(state.canvas);
      const text = String(result?.data?.text || "").replace(/\u0000/g, "").trim().slice(0, 120000);
      const confidence = Number(result?.data?.confidence);
      state.current.ocrText = text;
      state.current.ocrConfidence = Number.isFinite(confidence) ? confidence : null;
      $("forgeOcrText").value = text;
      $("forgeOcrBar").style.width = "100%";
      $("forgeOcrStatus").textContent = text
        ? `✅ OCR concluído no dispositivo${Number.isFinite(confidence) ? ` • confiança média ${Math.round(confidence)}%` : ""}. Revise o texto antes de usá-lo.`
        : "⚠️ OCR concluído sem texto reconhecível. Você pode transcrever manualmente.";
      await saveCurrentProject();
    } catch (error) {
      console.error(error);
      $("forgeOcrBar").style.width = "0";
      $("forgeOcrStatus").textContent = `⚠️ ${error.message} O campo continua disponível para transcrição manual.`;
    } finally {
      $("btnForgeOcr").disabled = false;
    }
  }

  function crcTable() {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index++) {
      let value = index;
      for (let bit = 0; bit < 8; bit++) {
        value = (value & 1) ? (0xEDB88320 ^ (value >>> 1)) : (value >>> 1);
      }
      table[index] = value >>> 0;
    }
    return table;
  }

  const CRC_TABLE = crcTable();

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function concatBytes(chunks) {
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.length;
    }
    return output;
  }

  function u16(value) {
    const bytes = new Uint8Array(2);
    new DataView(bytes.buffer).setUint16(0, value, true);
    return bytes;
  }

  function u32(value) {
    const bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
    return bytes;
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  function createZip(entries) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const stamp = dosDateTime();
    for (const entry of entries) {
      const name = encoder.encode(entry.name);
      const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
      const crc = crc32(data);
      const localHeader = concatBytes([
        u32(0x04034B50), u16(20), u16(0x0800), u16(0), u16(stamp.time), u16(stamp.date),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name
      ]);
      localParts.push(localHeader, data);
      const centralHeader = concatBytes([
        u32(0x02014B50), u16(20), u16(20), u16(0x0800), u16(0), u16(stamp.time), u16(stamp.date),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0),
        u16(0), u16(0), u32(0), u32(offset), name
      ]);
      centralParts.push(centralHeader);
      offset += localHeader.length + data.length;
    }
    const central = concatBytes(centralParts);
    const local = concatBytes(localParts);
    const end = concatBytes([
      u32(0x06054B50), u16(0), u16(0), u16(entries.length), u16(entries.length),
      u32(central.length), u32(local.length), u16(0)
    ]);
    return new Blob([local, central, end], { type: "application/zip" });
  }

  function parseDataURL(dataURL) {
    const match = /^data:([^;,]+);base64,([a-zA-Z0-9+/=\s]+)$/.exec(dataURL);
    if (!match) throw new Error("Imagem local em formato inesperado.");
    const binary = atob(match[2].replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    return { mime: match[1], bytes };
  }

  function bytesToDataURL(bytes, mime) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return `data:${mime};base64,${btoa(binary)}`;
  }

  function extensionForMime(mime) {
    return ({
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif"
    })[mime] || "png";
  }

  function mimeForPath(path) {
    const extension = path.split(".").pop().toLowerCase();
    return ({
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif"
    })[extension] || "";
  }

  async function sourceToImageBytes(source) {
    if (String(source).startsWith("data:")) return parseDataURL(source);
    const resolved = new URL(source, location.href);
    if (!["http:", "https:", "file:"].includes(resolved.protocol)) throw new Error("Origem de imagem bloqueada.");
    if (location.protocol !== "file:" && resolved.origin !== location.origin) {
      throw new Error("Backup não incorpora imagem de origem externa.");
    }
    const response = await fetch(resolved.href);
    if (!response.ok) throw new Error("Imagem publicada indisponível para o backup.");
    const mime = response.headers.get("content-type")?.split(";")[0] || "";
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mime)) {
      throw new Error("Formato de imagem publicado não permitido no backup.");
    }
    return { mime, bytes: new Uint8Array(await response.arrayBuffer()) };
  }

  async function exportZipBackup() {
    const button = $("btnForgeExport");
    button.disabled = true;
    $("forgeBackupStatus").textContent = "Montando backup local…";
    try {
      const cards = await requestResult(state.db.transaction(CARD_STORE).objectStore(CARD_STORE).getAll());
      const projects = await requestResult(projectStore().getAll());
      const entries = [];
      const portableCards = [];
      const portableProjects = [];
      for (const card of cards) {
        const copy = structuredClone(card);
        const source = copy.imageData || "";
        if (source) {
          const image = await sourceToImageBytes(source);
          const path = `images/cards/${safeId(copy.id, "card")}.${extensionForMime(image.mime)}`;
          entries.push({ name: path, data: image.bytes });
          copy.backupImagePath = path;
          copy.backupImageMime = image.mime;
          delete copy.imageData;
        }
        portableCards.push(copy);
      }
      for (const rawProject of projects) {
        const copy = normalizeProject(structuredClone(rawProject));
        const source = copy.editedImageData || copy.sourceImageData;
        if (source) {
          const image = await sourceToImageBytes(source);
          const path = `images/projects/${safeId(copy.id, "forge")}.${extensionForMime(image.mime)}`;
          entries.push({ name: path, data: image.bytes });
          copy.backupImagePath = path;
          copy.backupImageMime = image.mime;
          copy.sourceImageData = "";
          copy.editedImageData = "";
        }
        portableProjects.push(copy);
      }
      const manifest = {
        schema: BACKUP_SCHEMA,
        app: "Antigravity Knowledge Forge",
        version: 3,
        exportedAt: nowISO(),
        counts: {
          cards: portableCards.length,
          projects: portableProjects.length,
          images: entries.length
        },
        privacy: "Conteúdo criado localmente; nenhuma imagem foi enviada para serviço externo."
      };
      const encoder = new TextEncoder();
      entries.unshift(
        { name: "manifest.json", data: encoder.encode(JSON.stringify(manifest, null, 2)) },
        { name: "cards.json", data: encoder.encode(JSON.stringify(portableCards, null, 2)) },
        { name: "knowledge-projects.json", data: encoder.encode(JSON.stringify(portableProjects, null, 2)) }
      );
      const zip = createZip(entries);
      if (zip.size > MAX_ZIP_BYTES) throw new Error("O backup ultrapassou o limite de 512 MB.");
      const url = URL.createObjectURL(zip);
      const link = document.createElement("a");
      link.href = url;
      link.download = `antigravity-forja-conhecimento-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      $("forgeBackupStatus").textContent = `✅ ZIP completo: ${portableCards.length} cards, ${portableProjects.length} projetos e ${entries.length - 3} imagens.`;
    } catch (error) {
      console.error(error);
      $("forgeBackupStatus").textContent = `❌ ${error.message}`;
    } finally {
      button.disabled = false;
    }
  }

  function safeZipPath(path) {
    const value = String(path || "").replace(/\\/g, "/");
    if (!value || value.startsWith("/") || value.includes("\u0000")) return false;
    const parts = value.split("/");
    return !parts.some(part => part === ".." || part === "");
  }

  function parseZip(bytes) {
    if (bytes.length > MAX_ZIP_BYTES) throw new Error("ZIP maior que 512 MB.");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let endOffset = -1;
    for (let offset = Math.max(0, bytes.length - 65557); offset <= bytes.length - 22; offset++) {
      if (view.getUint32(offset, true) === 0x06054B50) endOffset = offset;
    }
    if (endOffset < 0) throw new Error("Estrutura ZIP inválida.");
    const count = view.getUint16(endOffset + 10, true);
    const centralSize = view.getUint32(endOffset + 12, true);
    const centralOffset = view.getUint32(endOffset + 16, true);
    if (count > MAX_ZIP_ENTRIES || centralOffset + centralSize > bytes.length) {
      throw new Error("ZIP excede os limites de segurança.");
    }
    const decoder = new TextDecoder();
    const files = new Map();
    let offset = centralOffset;
    let totalSize = 0;
    for (let index = 0; index < count; index++) {
      if (view.getUint32(offset, true) !== 0x02014B50) throw new Error("Diretório ZIP corrompido.");
      const flags = view.getUint16(offset + 8, true);
      const method = view.getUint16(offset + 10, true);
      const expectedCrc = view.getUint32(offset + 16, true);
      const compressedSize = view.getUint32(offset + 20, true);
      const uncompressedSize = view.getUint32(offset + 24, true);
      const nameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const localOffset = view.getUint32(offset + 42, true);
      if (flags & 1) throw new Error("ZIP criptografado não é aceito.");
      if (method !== 0 || compressedSize !== uncompressedSize) {
        throw new Error("Este restaurador aceita apenas backups ZIP criados pela Forja.");
      }
      const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
      if (!safeZipPath(name) || files.has(name)) throw new Error("Nome de arquivo inseguro ou duplicado no ZIP.");
      if (view.getUint32(localOffset, true) !== 0x04034B50) throw new Error("Entrada ZIP inválida.");
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      const data = bytes.slice(dataOffset, dataOffset + compressedSize);
      if (data.length !== compressedSize || crc32(data) !== expectedCrc) {
        throw new Error(`CRC inválido em ${name}.`);
      }
      totalSize += data.length;
      if (totalSize > MAX_ZIP_BYTES) throw new Error("Conteúdo descompactado maior que 512 MB.");
      files.set(name, data);
      offset += 46 + nameLength + extraLength + commentLength;
    }
    return files;
  }

  function parseBackupJson(files, path) {
    const data = files.get(path);
    if (!data) throw new Error(`Arquivo obrigatório ausente: ${path}.`);
    try {
      return JSON.parse(new TextDecoder().decode(data));
    } catch {
      throw new Error(`JSON inválido em ${path}.`);
    }
  }

  function restoreImage(record, files) {
    const path = String(record.backupImagePath || "");
    if (!path) return record;
    const bytes = files.get(path);
    const mime = record.backupImageMime || mimeForPath(path);
    if (!bytes || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mime)) {
      throw new Error(`Imagem inválida ou ausente: ${path}.`);
    }
    record.imageData = bytesToDataURL(bytes, mime);
    record.imageType = mime;
    record.imageSize = bytes.length;
    delete record.backupImagePath;
    delete record.backupImageMime;
    return record;
  }

  function restoreProjectImage(record, files) {
    const path = String(record.backupImagePath || "");
    if (!path) return record;
    const bytes = files.get(path);
    const mime = record.backupImageMime || mimeForPath(path);
    if (!bytes || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mime)) {
      throw new Error(`Imagem de projeto inválida ou ausente: ${path}.`);
    }
    record.editedImageData = bytesToDataURL(bytes, mime);
    delete record.backupImagePath;
    delete record.backupImageMime;
    return record;
  }

  async function importZipBackup(file) {
    if (!file) return;
    $("forgeBackupStatus").textContent = "Validando ZIP e CRCs…";
    try {
      if (file.size > MAX_ZIP_BYTES) throw new Error("ZIP maior que 512 MB.");
      const files = parseZip(new Uint8Array(await file.arrayBuffer()));
      const manifest = parseBackupJson(files, "manifest.json");
      if (manifest.schema !== BACKUP_SCHEMA) throw new Error("Backup não pertence à Forja de Conhecimento v3.");
      const cards = parseBackupJson(files, "cards.json");
      const projects = parseBackupJson(files, "knowledge-projects.json");
      if (!Array.isArray(cards) || cards.length > MAX_CARDS) throw new Error("Quantidade de cards inválida.");
      if (!Array.isArray(projects) || projects.length > MAX_PROJECTS) throw new Error("Quantidade de projetos inválida.");
      const restoredCards = cards.map(raw => {
        const card = structuredClone(raw);
        card.id = safeId(card.id, "local");
        card.origin = "local";
        return restoreImage(card, files);
      });
      const restoredProjects = projects.map(raw => normalizeProject(restoreProjectImage(structuredClone(raw), files)));
      const transaction = state.db.transaction([CARD_STORE, PROJECT_STORE], "readwrite");
      const cardStore = transaction.objectStore(CARD_STORE);
      const knowledgeStore = transaction.objectStore(PROJECT_STORE);
      restoredCards.forEach(card => cardStore.put(card));
      restoredProjects.forEach(project => knowledgeStore.put(project));
      await transactionComplete(transaction);
      await state.bridge.refresh();
      await loadProjects();
      $("forgeBackupStatus").textContent = `✅ Restaurados ${restoredCards.length} cards e ${restoredProjects.length} projetos; outros dados locais foram preservados.`;
    } catch (error) {
      console.error(error);
      $("forgeBackupStatus").textContent = `❌ ${error.message}`;
    } finally {
      $("forgeZipInput").value = "";
    }
  }

  async function init() {
    if (state.initialized) return;
    state.bridge = window.CardFeedBridge;
    if (!state.bridge?.getCard) return;
    state.initialized = true;
    try {
      state.db = await openDatabase();
      state.canvas = $("forgeCanvas");
      state.context = state.canvas.getContext("2d", { alpha: false, willReadFrequently: true });
      state.canvas.addEventListener("pointerdown", handleCanvasPointerDown);
      state.canvas.addEventListener("pointermove", handleCanvasPointerMove);
      state.canvas.addEventListener("pointerup", handleCanvasPointerUp);
      state.canvas.addEventListener("pointercancel", handleCanvasPointerUp);
      document.querySelectorAll("[data-forge-tool]").forEach(button => {
        button.addEventListener("click", () => setTool(button.dataset.forgeTool));
      });
      document.querySelectorAll("[data-forge-tab]").forEach(button => {
        button.addEventListener("click", () => switchTab(button.dataset.forgeTab));
      });
      $("btnForgeApplyCrop").addEventListener("click", applyCrop);
      $("btnForgeUndo").addEventListener("click", undoCanvas);
      $("btnForgeReset").addEventListener("click", resetCanvas);
      $("btnForgeText").addEventListener("click", addTextAnnotation);
      $("btnForgeOcr").addEventListener("click", runOcr);
      $("btnForgeSave").addEventListener("click", saveCurrentProject);
      $("btnForgeClose").addEventListener("click", () => $("knowledgeForgeDialog").close());
      $("btnForgeExport").addEventListener("click", exportZipBackup);
      $("btnForgeImport").addEventListener("click", () => $("forgeZipInput").click());
      $("forgeZipInput").addEventListener("change", event => importZipBackup(event.target.files?.[0]));
      $("forgeProjectTitle").addEventListener("input", event => {
        if (!state.current) return;
        state.current.title = event.target.value.slice(0, 180);
        $("forgeDialogTitle").textContent = state.current.title || "Projeto de conhecimento";
      });
      $("forgeOcrText").addEventListener("input", event => {
        if (state.current) state.current.ocrText = event.target.value.slice(0, 120000);
      });
      $("forgeMissions").addEventListener("input", event => {
        const field = event.target.dataset.missionField;
        const details = event.target.closest("[data-mission-id]");
        if (!field || !details || !state.current) return;
        const mission = state.current.missions.find(item => item.id === details.dataset.missionId);
        if (!mission) return;
        mission[field] = field === "maturity"
          ? event.target.value
          : event.target.value.slice(0, field === "artifact" ? 24000 : 12000);
        mission.updatedAt = nowISO();
        const badge = details.querySelector(".forge-maturity");
        badge.textContent = `${MATURITY_LABELS[mission.maturity]} • ${missionProductionScore(mission)}/4`;
      });
      $("forgeProjects").addEventListener("click", async event => {
        const openButton = event.target.closest("[data-open-forge]");
        const deleteButton = event.target.closest("[data-delete-forge]");
        if (openButton) await openProject(openButton.dataset.openForge);
        if (deleteButton) {
          const project = state.projects.find(item => item.id === deleteButton.dataset.deleteForge);
          if (project && confirm(`Apagar o projeto “${project.title}”? O card original será preservado.`)) {
            await deleteProject(project.id);
          }
        }
      });
      $("feed").addEventListener("click", event => {
        const button = event.target.closest("[data-forge]");
        if (!button) return;
        createProjectFromCard(state.bridge.getCard(button.dataset.forge)).catch(error => {
          console.error(error);
          state.bridge.toast(`Não foi possível abrir a Forja: ${error.message}`);
        });
      });
      setTool("pen");
      await loadProjects();
    } catch (error) {
      console.error(error);
      $("forgeBackupStatus").textContent = `⚠️ Forja local indisponível: ${error.message}`;
    }
  }

  window.KnowledgeForgeDiagnostics = Object.freeze({
    schema: BACKUP_SCHEMA,
    crc32,
    createZip,
    parseZip
  });
  window.addEventListener("cardfeed:ready", init, { once: true });
  if (window.CardFeedBridge?.ready) init();
  window.addEventListener("pagehide", () => {
    state.ocrWorker?.terminate?.();
    state.ocrWorker = null;
  });
})();
