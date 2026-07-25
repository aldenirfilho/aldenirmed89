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
  const MAX_IMAGE_BYTES = 40 * 1024 * 1024;
  const MAX_IMAGE_PIXELS = 80_000_000;
  const MAX_ATTACHMENTS = 12;
  const FORGE_INTAKE_KEY = "antigravity_forge_intake_v1";
  const PEER_PACKET_SCHEMA = "antigravity-peer-review-packet-v1";
  const PEER_RESPONSE_SCHEMA = "antigravity-peer-review-response-v1";
  const IMAGE_TYPES = Object.freeze({
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/avif": "avif"
  });
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
    activeAttachmentId: "",
    imageImportMode: "new",
    libraryCatalog: [],
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

  function normalizeImageSource(value) {
    const source = String(value || "");
    if (!source) return "";
    if (/^data:image\/(?:png|jpeg|webp|gif|bmp|avif);base64,[a-zA-Z0-9+/=\s]+$/.test(source)) {
      return source;
    }
    if (
      !/^[a-z][a-z0-9+.-]*:/i.test(source)
      && !source.startsWith("//")
      && !source.includes("\\")
      && !source.includes("\u0000")
      && !source.split("/").some(part => part === "..")
    ) return source.slice(0, 1600);
    return "";
  }

  function normalizeAttachment(raw = {}) {
    const mime = Object.hasOwn(IMAGE_TYPES, raw.mime) ? raw.mime : "image/png";
    return {
      id: safeId(raw.id, "image"),
      name: String(raw.name || `imagem.${IMAGE_TYPES[mime]}`).slice(0, 240),
      mime,
      size: Math.max(0, Number(raw.size) || 0),
      width: Math.max(1, Number(raw.width) || 1),
      height: Math.max(1, Number(raw.height) || 1),
      originalData: normalizeImageSource(raw.originalData),
      editedData: normalizeImageSource(raw.editedData),
      createdAt: raw.createdAt || nowISO(),
      updatedAt: raw.updatedAt || nowISO()
    };
  }

  function normalizeKnowledgeCard(raw = {}) {
    return {
      id: safeId(raw.id, "card"),
      missionType: String(raw.missionType || "").slice(0, 80),
      front: String(raw.front || "").slice(0, 4000),
      back: String(raw.back || "").slice(0, 16000),
      evidence: String(raw.evidence || "").slice(0, 12000),
      sourceId: String(raw.sourceId || "").slice(0, 240),
      tags: Array.isArray(raw.tags)
        ? raw.tags.map(tag => String(tag).trim().slice(0, 80)).filter(Boolean).slice(0, 24)
        : [],
      createdAt: raw.createdAt || nowISO(),
      updatedAt: raw.updatedAt || nowISO()
    };
  }

  function normalizeSource(raw = {}) {
    return {
      id: String(raw.id || raw.path || "").slice(0, 240),
      title: String(raw.title || raw.name || "Fonte da Biblioteca").slice(0, 240),
      path: String(raw.path || "").slice(0, 1200),
      sourceSha256: String(raw.sourceSha256 || "").replace(/[^a-fA-F0-9]/g, "").slice(0, 64),
      theme: String(raw.theme || "").slice(0, 120),
      origin: String(raw.origin || "").slice(0, 120),
      format: String(raw.format || raw.tipo || "").slice(0, 80),
      tags: Array.isArray(raw.tags)
        ? raw.tags.map(tag => String(tag).slice(0, 80)).slice(0, 20)
        : []
    };
  }

  function normalizeReview(raw = {}) {
    const score = value => Math.max(1, Math.min(5, Number(value) || 1));
    return {
      id: safeId(raw.id, "review"),
      reviewer: String(raw.reviewer || "Revisor anônimo").slice(0, 80),
      scores: {
        evidence: score(raw.scores?.evidence),
        coherence: score(raw.scores?.coherence),
        uncertainty: score(raw.scores?.uncertainty),
        teachability: score(raw.scores?.teachability)
      },
      strength: String(raw.strength || "").slice(0, 4000),
      critique: String(raw.critique || "").slice(0, 4000),
      nextTest: String(raw.nextTest || "").slice(0, 4000),
      decision: ["revise", "testable", "teachable"].includes(raw.decision) ? raw.decision : "revise",
      targetProjectId: String(raw.targetProjectId || "").slice(0, 180),
      createdAt: raw.createdAt || nowISO()
    };
  }

  function normalizeChallenge(raw = {}) {
    return {
      id: safeId(raw.id, "temi"),
      stem: String(raw.stem || "").slice(0, 4000),
      options: Array.isArray(raw.options)
        ? raw.options.map(option => String(option).slice(0, 4000)).filter(Boolean).slice(0, 5)
        : [],
      answerIndex: Math.max(0, Math.min(4, Number(raw.answerIndex) || 0)),
      rationale: String(raw.rationale || "").slice(0, 8000),
      evidence: String(raw.evidence || "").slice(0, 8000),
      sourceId: String(raw.sourceId || "").slice(0, 240),
      createdAt: raw.createdAt || nowISO()
    };
  }

  function normalizeProject(project) {
    const title = String(project.title || "Projeto sem título").slice(0, 180);
    const missionsByType = new Map((project.missions || []).map(mission => [mission.type, mission]));
    let attachments = Array.isArray(project.attachments)
      ? project.attachments.map(normalizeAttachment).filter(item => item.originalData || item.editedData).slice(0, MAX_ATTACHMENTS)
      : [];
    if (!attachments.length && (project.sourceImageData || project.editedImageData)) {
      attachments = [normalizeAttachment({
        id: "primary",
        name: "imagem-principal.webp",
        mime: String(project.editedImageData || project.sourceImageData).startsWith("data:image/png") ? "image/png" : "image/webp",
        originalData: project.sourceImageData,
        editedData: project.editedImageData
      })];
    }
    const activeAttachmentId = attachments.some(item => item.id === project.activeAttachmentId)
      ? project.activeAttachmentId
      : (attachments[0]?.id || "");
    const activeAttachment = attachments.find(item => item.id === activeAttachmentId);
    return {
      id: safeId(project.id, "forge"),
      sourceCardId: String(project.sourceCardId || "").slice(0, 180),
      title,
      sourceImageData: activeAttachment?.originalData || normalizeImageSource(project.sourceImageData),
      editedImageData: activeAttachment?.editedData || normalizeImageSource(project.editedImageData),
      attachments,
      activeAttachmentId,
      ocrText: String(project.ocrText || "").slice(0, 120000),
      ocrConfidence: Number.isFinite(project.ocrConfidence) ? project.ocrConfidence : null,
      cards: Array.isArray(project.cards) ? project.cards.map(normalizeKnowledgeCard).slice(0, 200) : [],
      temiChallenges: Array.isArray(project.temiChallenges)
        ? project.temiChallenges.map(normalizeChallenge).slice(0, 100)
        : [],
      librarySources: Array.isArray(project.librarySources)
        ? project.librarySources.map(normalizeSource).filter(source => source.id || source.path).slice(0, 40)
        : [],
      peerReviews: Array.isArray(project.peerReviews)
        ? project.peerReviews.map(normalizeReview).slice(0, 100)
        : [],
      peerSourceProjectId: String(project.peerSourceProjectId || "").slice(0, 180),
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
    const cards = projects.reduce((sum, project) => sum + (project.cards?.length || 0), 0);
    const sources = projects.reduce((sum, project) => sum + (project.librarySources?.length || 0), 0);
    $("forgeStatProjects").textContent = projects.length;
    $("forgeStatProduced").textContent = produced;
    $("forgeStatTeachable").textContent = teachable;
    $("forgeStatOcr").textContent = withOcr;
    $("forgeStatCards").textContent = cards;
    $("forgeStatSources").textContent = sources;
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
      const attachment = project.attachments?.find(item => item.id === project.activeAttachmentId) || project.attachments?.[0];
      const image = attachment?.editedData || attachment?.originalData || project.editedImageData || project.sourceImageData;
      return `
        <article class="forge-project">
          ${image ? `<img src="${esc(image)}" alt="${esc(`Imagem do projeto ${project.title}`)}" loading="lazy" decoding="async"/>` : ""}
          <div class="forge-project-body">
            <h3>${esc(project.title)}</h3>
            <p>${metrics.produced}/5 artefatos • ${project.cards?.length || 0} cards • ${project.librarySources?.length || 0} fontes</p>
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

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Não foi possível ler a imagem."));
      reader.readAsDataURL(file);
    });
  }

  function declaredImageMime(file) {
    if (Object.hasOwn(IMAGE_TYPES, file.type)) return file.type;
    const extension = String(file.name || "").split(".").pop().toLowerCase();
    return ({
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      bmp: "image/bmp",
      avif: "image/avif"
    })[extension] || "";
  }

  async function hasExpectedImageSignature(file, mime = declaredImageMime(file)) {
    const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const ascii = String.fromCharCode(...bytes);
    if (mime === "image/png") return bytes[0] === 0x89 && ascii.slice(1, 4) === "PNG";
    if (mime === "image/jpeg") return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    if (mime === "image/gif") return ascii.startsWith("GIF87a") || ascii.startsWith("GIF89a");
    if (mime === "image/webp") return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP";
    if (mime === "image/bmp") return ascii.startsWith("BM");
    if (mime === "image/avif") return ascii.slice(4, 12).includes("ftyp") && /avif|avis/.test(ascii);
    return false;
  }

  async function attachmentFromFile(file) {
    const mime = declaredImageMime(file);
    if (!Object.hasOwn(IMAGE_TYPES, mime)) {
      throw new Error(`${file.name}: formato não suportado. Use PNG, JPG, WebP, GIF, BMP ou AVIF.`);
    }
    if (!file.size || file.size > MAX_IMAGE_BYTES) {
      throw new Error(`${file.name}: a imagem deve ter até 40 MB.`);
    }
    if (!await hasExpectedImageSignature(file, mime)) {
      throw new Error(`${file.name}: assinatura do arquivo não corresponde ao formato declarado.`);
    }
    const dataURL = await fileToDataURL(file);
    const image = await imageLoaded(dataURL);
    const pixels = image.naturalWidth * image.naturalHeight;
    if (!image.naturalWidth || !image.naturalHeight || pixels > MAX_IMAGE_PIXELS) {
      throw new Error(`${file.name}: dimensões acima do limite seguro de 80 megapixels.`);
    }
    return normalizeAttachment({
      id: uid("image"),
      name: file.name,
      mime,
      size: file.size,
      width: image.naturalWidth,
      height: image.naturalHeight,
      originalData: dataURL,
      editedData: "",
      createdAt: nowISO()
    });
  }

  function activeAttachment(project = state.current) {
    if (!project) return null;
    return project.attachments?.find(item => item.id === project.activeAttachmentId)
      || project.attachments?.[0]
      || null;
  }

  function persistActiveCanvas() {
    if (!state.current || !state.canvas?.width) return;
    const attachment = activeAttachment();
    if (!attachment) return;
    attachment.editedData = canvasDataURL();
    attachment.updatedAt = nowISO();
    state.current.activeAttachmentId = attachment.id;
    state.current.sourceImageData = attachment.originalData;
    state.current.editedImageData = attachment.editedData;
  }

  function renderAttachments() {
    const container = $("forgeAttachments");
    if (!container || !state.current) return;
    container.innerHTML = state.current.attachments.map(attachment => `
      <button class="forge-attachment" type="button" data-forge-attachment="${esc(attachment.id)}"
        aria-pressed="${attachment.id === state.current.activeAttachmentId}">
        <img src="${esc(attachment.editedData || attachment.originalData)}" alt="" loading="lazy" />
        <b>${esc(attachment.name)}</b>
        <small>${attachment.width}×${attachment.height} · ${esc(IMAGE_TYPES[attachment.mime]?.toUpperCase() || "IMG")}</small>
      </button>
    `).join("");
  }

  async function switchAttachment(id) {
    if (!state.current || id === state.current.activeAttachmentId) return;
    persistActiveCanvas();
    const attachment = state.current.attachments.find(item => item.id === id);
    if (!attachment) return;
    state.current.activeAttachmentId = attachment.id;
    state.activeAttachmentId = attachment.id;
    state.originalImage = attachment.originalData;
    state.current.sourceImageData = attachment.originalData;
    state.current.editedImageData = attachment.editedData;
    await drawSourceToCanvas(attachment.editedData || attachment.originalData, { resetHistory: true });
    renderAttachments();
  }

  async function importImageFiles(fileList, mode = "new") {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const existingCount = mode === "append" ? (state.current?.attachments.length || 0) : 0;
    if (files.length + existingCount > MAX_ATTACHMENTS) {
      throw new Error(`Use no máximo ${MAX_ATTACHMENTS} imagens por projeto.`);
    }
    const attachments = [];
    for (const file of files) attachments.push(await attachmentFromFile(file));
    if (mode === "append" && state.current) {
      persistActiveCanvas();
      state.current.attachments.push(...attachments);
      await switchAttachment(attachments[0].id);
      await saveCurrentProject();
      return;
    }
    const title = files[0].name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Projeto visual";
    const project = normalizeProject({
      id: uid("forge"),
      title,
      sourceImageData: attachments[0].originalData,
      attachments,
      activeAttachmentId: attachments[0].id,
      missions: createMissions(title),
      createdAt: nowISO()
    });
    await putProject(project);
    await openProject(project.id);
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

  function updateAppStatus(message) {
    if ($("forgeSaveStatus")) $("forgeSaveStatus").textContent = message;
    if ($("forgeExportStatus")) $("forgeExportStatus").textContent = message;
  }

  function setCanvasZoom(mode) {
    if (!state.canvas) return;
    const actual = mode === "actual";
    state.canvas.style.maxWidth = actual ? "none" : "100%";
    state.canvas.style.maxHeight = actual ? "none" : "68vh";
    state.canvas.style.width = actual ? `${state.canvas.width}px` : "auto";
    updateEditorStatus(actual
      ? `Visualização 1:1 · ${state.canvas.width} × ${state.canvas.height} px editáveis.`
      : "Imagem ajustada à área de trabalho.");
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

  function renderKnowledgeCards() {
    const container = $("forgeCards");
    if (!container || !state.current) return;
    if (!state.current.cards.length) {
      container.innerHTML = '<div class="forge-empty">Produza artefatos com evidência e pressione <b>Gerar dos artefatos</b>.</div>';
      return;
    }
    container.innerHTML = state.current.cards.map((card, index) => `
      <article class="forge-knowledge-card" data-forge-card-id="${esc(card.id)}">
        <div class="forge-card-meta"><b>Card produtivo ${index + 1}</b><span>${esc(card.missionType || "autoral")}</span></div>
        <label>Desafio
          <textarea data-card-field="front">${esc(card.front)}</textarea>
        </label>
        <label>Produção autoral
          <textarea data-card-field="back">${esc(card.back)}</textarea>
        </label>
        <label>Evidência literal ou visual
          <textarea data-card-field="evidence">${esc(card.evidence)}</textarea>
        </label>
        <label>Tags
          <input class="field" data-card-field="tags" value="${esc(card.tags.join(", "))}" />
        </label>
        <button class="btn small danger" type="button" data-delete-knowledge-card="${esc(card.id)}">Remover card</button>
      </article>
    `).join("");
  }

  function generateKnowledgeCards() {
    if (!state.current) return;
    const source = state.current.librarySources[0];
    const existingByMission = new Map(state.current.cards.map(card => [card.missionType, card]));
    const generated = state.current.missions
      .filter(mission => mission.artifact.trim().length >= 40 && mission.evidence.trim().length >= 20)
      .map(mission => {
        const template = MISSION_TEMPLATES.find(item => item.type === mission.type);
        const existing = existingByMission.get(mission.type);
        return normalizeKnowledgeCard({
          id: existing?.id || uid("card"),
          missionType: mission.type,
          front: existing?.front || `${template.title}: reconstrua o artefato sem consultar e explique qual evidência poderia refutá-lo.`,
          back: existing?.back || mission.artifact,
          evidence: existing?.evidence || mission.evidence,
          sourceId: source?.id || state.current.id,
          tags: existing?.tags?.length
            ? existing.tags
            : ["knowledge-forge", "TEMI", mission.type, source?.theme].filter(Boolean),
          createdAt: existing?.createdAt || nowISO()
        });
      });
    if (!generated.length) {
      updateAppStatus("⚠️ Produza ao menos um artefato e uma evidência antes de gerar cards.");
      return;
    }
    const manual = state.current.cards.filter(card => !MISSION_TEMPLATES.some(item => item.type === card.missionType));
    state.current.cards = [...generated, ...manual].slice(0, 200);
    renderKnowledgeCards();
    renderTemiChallenges();
    updateAppStatus(`✅ ${generated.length} card(s) produtivo(s) gerado(s) sem inventar conteúdo novo.`);
  }

  function generateTemiChallenges() {
    if (!state.current) return;
    if (state.current.cards.length < 4) {
      updateAppStatus("⚠️ Gere pelo menos quatro cards fundamentados para criar alternativas TEMI úteis.");
      return;
    }
    state.current.temiChallenges = state.current.cards.slice(0, 12).map((card, index, cards) => {
      const distractors = cards
        .filter(other => other.id !== card.id)
        .map(other => other.back.trim())
        .filter(Boolean)
        .filter((value, position, array) => array.indexOf(value) === position)
        .slice(0, 3);
      const answerIndex = index % 4;
      const options = [...distractors];
      options.splice(answerIndex, 0, card.back.trim());
      return normalizeChallenge({
        id: uid("temi"),
        stem: `No projeto “${state.current.title}”, qual alternativa reconstrói corretamente o artefato ligado ao desafio: ${card.front}`,
        options,
        answerIndex,
        rationale: `Resposta fundamentada na produção autoral do projeto. Confira a evidência antes de aceitar: ${card.evidence}`,
        evidence: card.evidence,
        sourceId: card.sourceId,
        createdAt: nowISO()
      });
    });
    renderTemiChallenges();
    updateAppStatus(`✅ ${state.current.temiChallenges.length} desafio(s) TEMI gerado(s) somente a partir dos cards revisados.`);
  }

  function renderTemiChallenges() {
    const container = $("forgeTemiChallenges");
    if (!container || !state.current) return;
    if (!state.current.temiChallenges.length) {
      container.innerHTML = '<div class="forge-empty">Os desafios TEMI aparecerão aqui após quatro cards fundamentados.</div>';
      return;
    }
    container.innerHTML = state.current.temiChallenges.map((challenge, index) => `
      <article class="forge-temi-card" data-temi-id="${esc(challenge.id)}">
        <h4>🧪 Desafio TEMI ${index + 1}</h4>
        <p>${esc(challenge.stem)}</p>
        <div class="forge-temi-options">
          ${challenge.options.map((option, optionIndex) => `
            <button type="button" data-temi-option="${optionIndex}"><b>${String.fromCharCode(65 + optionIndex)}.</b> ${esc(option)}</button>
          `).join("")}
        </div>
        <p class="forge-temi-feedback" role="status" aria-live="polite"></p>
      </article>
    `).join("");
  }

  function answerTemiChallenge(challengeId, optionIndex, button) {
    const challenge = state.current?.temiChallenges.find(item => item.id === challengeId);
    if (!challenge) return;
    const article = button.closest("[data-temi-id]");
    article.querySelectorAll("[data-temi-option]").forEach(option => {
      const index = Number(option.dataset.temiOption);
      option.dataset.result = index === challenge.answerIndex
        ? "correct"
        : (index === optionIndex ? "incorrect" : "");
    });
    const correct = optionIndex === challenge.answerIndex;
    article.querySelector(".forge-temi-feedback").textContent = `${correct ? "✅ Correto." : "⚠️ Reavalie."} ${challenge.rationale}`;
  }

  async function loadLibraryCatalog() {
    if (state.libraryCatalog.length) return;
    const response = await fetch("../02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Catálogo da Biblioteca indisponível.");
    const payload = await response.json();
    state.libraryCatalog = Array.isArray(payload.items) ? payload.items.map(normalizeSource) : [];
    renderLibraryResults("");
  }

  function sourceMatches(source, query) {
    const normalized = String(query || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!normalized) return true;
    const blob = [source.title, source.path, source.theme, source.origin, ...source.tags]
      .join(" ").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normalized.split(/\s+/).filter(Boolean).every(token => blob.includes(token));
  }

  function sourceLibraryUrl(source) {
    return `../02_Biblioteca_IA_Engine/index.html?q=${encodeURIComponent(source.title)}`;
  }

  function sourceCardHTML(source, linked = false) {
    return `
      <article class="forge-source-item" data-source-id="${esc(source.id)}">
        <h4>${esc(source.title)}</h4>
        <p>${esc(source.theme || "sem tema")} · ${esc(source.format || "documento")}</p>
        <div class="forge-source-meta">${esc(source.path)}${source.sourceSha256 ? `<br>SHA-256 ${esc(source.sourceSha256)}` : ""}</div>
        <div class="forge-source-actions">
          <a class="btn small" href="${esc(sourceLibraryUrl(source))}" target="_blank" rel="noopener">Abrir leitura</a>
          ${linked
            ? `<button class="btn small danger" type="button" data-unlink-source="${esc(source.id)}">Desvincular</button>`
            : `<button class="btn small primary" type="button" data-link-source="${esc(source.id)}">Vincular ao projeto</button>`}
        </div>
      </article>
    `;
  }

  function renderLibraryResults(query = "") {
    const container = $("forgeLibraryResults");
    if (!container) return;
    const linkedIds = new Set(state.current?.librarySources.map(source => source.id) || []);
    const matches = state.libraryCatalog.filter(source => sourceMatches(source, query) && !linkedIds.has(source.id)).slice(0, 24);
    container.innerHTML = matches.length
      ? matches.map(source => sourceCardHTML(source)).join("")
      : '<div class="forge-empty">Nenhuma fonte encontrada para esta busca.</div>';
    renderLinkedSources();
  }

  function renderLinkedSources() {
    const container = $("forgeLinkedSources");
    if (!container || !state.current) return;
    container.innerHTML = state.current.librarySources.length
      ? state.current.librarySources.map(source => sourceCardHTML(source, true)).join("")
      : '<div class="forge-empty">Nenhuma fonte vinculada ainda.</div>';
  }

  function attachLibrarySource(id) {
    if (!state.current) return;
    const source = state.libraryCatalog.find(item => item.id === id);
    if (!source || state.current.librarySources.some(item => item.id === source.id)) return;
    state.current.librarySources.push(normalizeSource(source));
    renderLibraryResults($("forgeLibrarySearch").value);
  }

  function unlinkLibrarySource(id) {
    if (!state.current) return;
    state.current.librarySources = state.current.librarySources.filter(source => source.id !== id);
    renderLibraryResults($("forgeLibrarySearch").value);
  }

  function scoreOptions() {
    return [1, 2, 3, 4, 5].map(value => `<option value="${value}">${value}/5</option>`).join("");
  }

  function renderPeerReviews() {
    if (!state.current) return;
    ["forgePeerEvidence", "forgePeerCoherence", "forgePeerUncertainty", "forgePeerTeachability"].forEach(id => {
      if (!$(id).options.length) $(id).innerHTML = scoreOptions();
    });
    $("btnForgePeerPacket").textContent = state.current.peerSourceProjectId && state.current.peerReviews.length
      ? "Exportar resposta ao autor"
      : "Exportar pacote";
    const container = $("forgePeerReviews");
    container.innerHTML = state.current.peerReviews.length
      ? state.current.peerReviews.map(review => `
        <article class="forge-review-card">
          <h4>🤝 ${esc(review.reviewer)} · ${esc(review.decision)}</h4>
          <div class="forge-review-scores">
            <span>Evidência ${review.scores.evidence}/5</span>
            <span>Coerência ${review.scores.coherence}/5</span>
            <span>Incerteza ${review.scores.uncertainty}/5</span>
            <span>Ensino ${review.scores.teachability}/5</span>
          </div>
          <p><b>Ponto forte:</b> ${esc(review.strength || "Não informado.")}</p>
          <p><b>Crítica:</b> ${esc(review.critique || "Não informada.")}</p>
          <p><b>Próximo teste:</b> ${esc(review.nextTest || "Não informado.")}</p>
        </article>
      `).join("")
      : '<div class="forge-empty">Nenhuma revisão recebida ou registrada.</div>';
  }

  function savePeerReview() {
    if (!state.current) return;
    const review = normalizeReview({
      id: uid("review"),
      reviewer: $("forgePeerName").value.trim() || "Revisor anônimo",
      scores: {
        evidence: $("forgePeerEvidence").value,
        coherence: $("forgePeerCoherence").value,
        uncertainty: $("forgePeerUncertainty").value,
        teachability: $("forgePeerTeachability").value
      },
      strength: $("forgePeerStrength").value,
      critique: $("forgePeerCritique").value,
      nextTest: $("forgePeerNextTest").value,
      decision: $("forgePeerDecision").value,
      targetProjectId: state.current.peerSourceProjectId || state.current.id,
      createdAt: nowISO()
    });
    if (review.critique.length < 20 || review.nextTest.length < 12) {
      $("forgeSaveStatus").textContent = "⚠️ Registre uma crítica construtiva e um próximo teste antes de salvar.";
      return;
    }
    state.current.peerReviews.push(review);
    ["forgePeerStrength", "forgePeerCritique", "forgePeerNextTest"].forEach(id => { $(id).value = ""; });
    renderPeerReviews();
    saveCurrentProject();
  }

  function safeFilename(value) {
    return String(value || "projeto")
      .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "projeto";
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadText(filename, content, type) {
    downloadBlob(filename, new Blob([content], { type }));
  }

  function exportableProject() {
    if (!state.current) throw new Error("Abra um projeto antes de exportar.");
    persistActiveCanvas();
    return normalizeProject(structuredClone(state.current));
  }

  function cardRows(project) {
    return project.cards.map(card => ({
      Front: card.front,
      Back: card.back,
      Evidence: card.evidence,
      SourceId: card.sourceId,
      Tags: card.tags.join(" ")
    }));
  }

  function cleanCell(value) {
    return String(value || "").replace(/\r?\n/g, "<br>").replace(/\t/g, " ");
  }

  function csvCell(value) {
    return `"${String(value || "").replace(/"/g, '""')}"`;
  }

  function projectMarkdown(project) {
    const lines = [
      `# ${project.title}`, "",
      `- Atualizado: ${project.updatedAt}`,
      `- Imagens: ${project.attachments.length}`,
      `- Fontes: ${project.librarySources.length}`, ""
    ];
    project.librarySources.forEach(source => {
      lines.push(`- Fonte: ${source.title} — ${source.path}${source.sourceSha256 ? ` — SHA-256 ${source.sourceSha256}` : ""}`);
    });
    project.missions.forEach((mission, index) => {
      lines.push("", `## ${index + 1}. ${MISSION_TEMPLATES.find(item => item.type === mission.type).title}`, "");
      lines.push(mission.artifact || "_Artefato ainda não produzido._", "");
      lines.push(`**Evidência:** ${mission.evidence || "não registrada"}`, "");
      lines.push(`**Incerteza:** ${mission.uncertainty || "não registrada"}`, "");
      lines.push(`**Próxima pergunta:** ${mission.nextQuestion || "não registrada"}`);
    });
    lines.push("", "## Cards produtivos", "");
    project.cards.forEach((card, index) => {
      lines.push(`### Card ${index + 1}`, "", `**Desafio:** ${card.front}`, "", `**Produção:** ${card.back}`, "", `**Evidência:** ${card.evidence}`, "");
    });
    return lines.join("\n");
  }

  function projectHTML(project, printable = false) {
    const image = activeAttachment(project)?.editedData || activeAttachment(project)?.originalData || "";
    const missions = project.missions.map((mission, index) => `
      <section><h2>${index + 1}. ${esc(MISSION_TEMPLATES.find(item => item.type === mission.type).title)}</h2>
      <p>${esc(mission.artifact || "Artefato ainda não produzido.")}</p>
      <p><b>Evidência:</b> ${esc(mission.evidence || "não registrada")}</p>
      <p><b>Incerteza:</b> ${esc(mission.uncertainty || "não registrada")}</p></section>
    `).join("");
    const cards = project.cards.map((card, index) => `
      <section><h2>Card ${index + 1}</h2><p><b>Desafio:</b> ${esc(card.front)}</p>
      <p><b>Produção:</b> ${esc(card.back)}</p><p><b>Evidência:</b> ${esc(card.evidence)}</p></section>
    `).join("");
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">
      <meta name="viewport" content="width=device-width"><title>${esc(project.title)}</title>
      <style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{max-width:900px;margin:auto;padding:${printable ? "0" : "2rem"};font:11pt/1.55 system-ui;color:#172033}
      h1,h2{color:#0f4c6e}img{display:block;max-width:100%;max-height:360px;object-fit:contain;margin:1rem auto;border-radius:12px}
      section{break-inside:avoid;border-top:1px solid #cbd5e1;padding:1rem 0}p{white-space:pre-wrap;overflow-wrap:anywhere}</style></head>
      <body><h1>${esc(project.title)}</h1>${image ? `<img src="${esc(image)}" alt="Imagem principal do projeto">` : ""}
      <p><b>Fontes vinculadas:</b> ${project.librarySources.map(source => esc(source.title)).join("; ") || "nenhuma"}</p>
      ${missions}<h1>Cards produtivos</h1>${cards}</body></html>`;
  }

  function printProject(project) {
    const frame = document.createElement("iframe");
    frame.title = "Projeto pronto para salvar como PDF";
    frame.setAttribute("sandbox", "allow-same-origin allow-modals");
    frame.style.cssText = "position:fixed;width:1px;height:1px;right:0;bottom:0;border:0";
    frame.addEventListener("load", () => {
      const view = frame.contentWindow;
      view?.addEventListener?.("afterprint", () => frame.remove(), { once: true });
      view?.focus();
      view?.print();
      window.setTimeout(() => frame.remove(), 60000);
    }, { once: true });
    frame.srcdoc = projectHTML(project, true);
    document.body.appendChild(frame);
  }

  function exportAnkiKit(project) {
    if (!project.cards.length) throw new Error("Gere cards produtivos antes de exportar para Anki.");
    const rows = cardRows(project);
    const attachment = activeAttachment(project);
    const image = attachment?.editedData || attachment?.originalData || "";
    const parsedImage = image ? parseDataURL(image) : null;
    const mediaName = parsedImage ? `${safeFilename(project.id)}.${IMAGE_TYPES[parsedImage.mime] || "png"}` : "";
    const header = ["#separator:tab", "#html:true", "#tags column:5", "#columns:Front\tBack\tEvidence\tSourceId\tTags"];
    const body = rows.map(row => [
      cleanCell(row.Front),
      cleanCell(`${row.Back}${mediaName ? `<br><img src="${mediaName}">` : ""}`),
      cleanCell(row.Evidence),
      cleanCell(row.SourceId),
      cleanCell(row.Tags)
    ].join("\t"));
    const encoder = new TextEncoder();
    const entries = [
      { name: "anki-import.txt", data: encoder.encode([...header, ...body].join("\n")) },
      { name: "LEIA-ME.md", data: encoder.encode("# Kit Anki da Forja\n\n1. Extraia o ZIP.\n2. Copie a imagem da pasta `media` para `collection.media` do Anki, quando houver.\n3. Importe `anki-import.txt` com HTML habilitado.\n4. Confira evidência e fonte antes de estudar.\n") },
      { name: "project.json", data: encoder.encode(JSON.stringify({ title: project.title, sources: project.librarySources, cards: project.cards }, null, 2)) }
    ];
    if (parsedImage) entries.push({ name: `media/${mediaName}`, data: parsedImage.bytes });
    downloadBlob(`${safeFilename(project.title)}-anki.zip`, createZip(entries));
  }

  function exportProject(format) {
    try {
      const project = exportableProject();
      const stem = safeFilename(project.title);
      if (format === "anki") exportAnkiKit(project);
      else if (format === "pdf") printProject(project);
      else if (format === "json") downloadText(`${stem}.json`, JSON.stringify(project, null, 2), "application/json;charset=utf-8");
      else if (format === "markdown") downloadText(`${stem}.md`, projectMarkdown(project), "text/markdown;charset=utf-8");
      else if (format === "html") downloadText(`${stem}.html`, projectHTML(project), "text/html;charset=utf-8");
      else if (format === "csv") {
        const rows = cardRows(project);
        const csv = [["Front", "Back", "Evidence", "SourceId", "Tags"], ...rows.map(row => Object.values(row))]
          .map(row => row.map(csvCell).join(",")).join("\r\n");
        downloadText(`${stem}-cards.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
      }
      updateAppStatus(format === "pdf"
        ? "✅ No diálogo de impressão, escolha Salvar como PDF."
        : `✅ Exportação ${format.toUpperCase()} preparada.`);
    } catch (error) {
      updateAppStatus(`⚠️ ${error.message}`);
    }
  }

  function exportPeerPacketOrResponse() {
    const project = exportableProject();
    const stem = safeFilename(project.title);
    if (project.peerSourceProjectId && project.peerReviews.length) {
      const response = {
        schema: PEER_RESPONSE_SCHEMA,
        exportedAt: nowISO(),
        targetProjectId: project.peerSourceProjectId,
        review: project.peerReviews.at(-1)
      };
      downloadText(`${stem}-resposta-revisao.json`, JSON.stringify(response, null, 2), "application/json;charset=utf-8");
      return;
    }
    const attachment = activeAttachment(project);
    const packetProject = {
      ...project,
      attachments: attachment ? [attachment] : [],
      activeAttachmentId: attachment?.id || "",
      peerReviews: []
    };
    downloadText(`${stem}-pacote-revisao.json`, JSON.stringify({
      schema: PEER_PACKET_SCHEMA,
      exportedAt: nowISO(),
      project: packetProject
    }, null, 2), "application/json;charset=utf-8");
  }

  async function importPeerFile(file) {
    if (!file) return;
    if (state.current) await saveCurrentProject();
    if (file.size > 100 * 1024 * 1024) throw new Error("Arquivo de revisão maior que 100 MB.");
    const payload = JSON.parse(await file.text());
    if (payload.schema === PEER_PACKET_SCHEMA && payload.project) {
      const original = normalizeProject(payload.project);
      original.peerSourceProjectId = original.id;
      original.id = uid("peer");
      original.title = `Revisão · ${original.title}`.slice(0, 180);
      original.peerReviews = [];
      await putProject(original);
      await openProject(original.id);
      switchTab("peer");
      return;
    }
    if (payload.schema === PEER_RESPONSE_SCHEMA && payload.review && payload.targetProjectId) {
      const target = state.projects.find(project => project.id === payload.targetProjectId);
      if (!target) throw new Error("Projeto original desta revisão não foi encontrado neste dispositivo.");
      const normalized = normalizeProject(target);
      normalized.peerReviews.push(normalizeReview(payload.review));
      await putProject(normalized);
      await openProject(normalized.id);
      switchTab("peer");
      return;
    }
    throw new Error("Arquivo não pertence ao modo de revisão por pares da Forja.");
  }

  function causalNodes(project) {
    const mission = project.missions.find(item => item.type === "causal-map");
    const text = String(mission?.artifact || "");
    return text.split(/(?:→|->|=>|;|\n)+/).map(node => node.trim()).filter(node => node.length >= 3).slice(0, 10);
  }

  function renderCausalGallery(query = "") {
    const container = $("forgeCausalGallery");
    const normalized = String(query || "").toLowerCase();
    const maps = state.projects.map(project => ({ project, nodes: causalNodes(project) }))
      .filter(item => item.nodes.length >= 2)
      .filter(item => !normalized || `${item.project.title} ${item.nodes.join(" ")}`.toLowerCase().includes(normalized));
    container.innerHTML = maps.length ? maps.map(({ project, nodes }) => `
      <article class="forge-causal-card">
        <h3>${esc(project.title)}</h3>
        <div class="forge-causal-chain">
          ${nodes.map((node, index) => `${index ? '<span class="forge-causal-arrow">→</span>' : ""}<span class="forge-causal-node">${esc(node)}</span>`).join("")}
        </div>
        <button class="btn small primary" type="button" data-open-causal="${esc(project.id)}">Abrir projeto</button>
      </article>
    `).join("") : '<div class="forge-empty">Produza mapas usando setas “→” para formar a galeria causal.</div>';
  }

  function textCardDataURL(title, evidence) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 1200, 675);
    gradient.addColorStop(0, "#071426");
    gradient.addColorStop(1, "#25124d");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 675);
    context.fillStyle = "#38bdf8";
    context.font = "800 32px system-ui";
    context.fillText("ANTIGRAVITY · EVIDÊNCIA DA BIBLIOTECA", 70, 82);
    context.fillStyle = "#ffffff";
    context.font = "800 52px system-ui";
    const drawWrapped = (text, x, y, maxWidth, lineHeight, maxLines) => {
      const words = String(text).split(/\s+/);
      let line = "";
      let lines = 0;
      for (const word of words) {
        const test = `${line}${word} `;
        if (context.measureText(test).width > maxWidth && line) {
          context.fillText(line.trim(), x, y);
          y += lineHeight;
          lines++;
          line = `${word} `;
          if (lines >= maxLines) break;
        } else line = test;
      }
      if (lines < maxLines && line) context.fillText(line.trim(), x, y);
      return y + lineHeight;
    };
    let y = drawWrapped(title, 70, 160, 1060, 62, 3);
    context.fillStyle = "#cbd5e1";
    context.font = "500 28px system-ui";
    drawWrapped(evidence, 70, y + 15, 1060, 39, 8);
    return canvas.toDataURL("image/webp", .9);
  }

  async function consumeLibraryIntakes() {
    let queue = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(FORGE_INTAKE_KEY) || "[]");
      queue = Array.isArray(parsed) ? parsed.slice(0, 100) : [];
    } catch {
      queue = [];
    }
    if (!queue.length) return null;
    let newestId = null;
    for (const intake of queue) {
      if (intake?.schema !== "antigravity-library-forge-intake-v1" || !intake.card || !intake.source) continue;
      if (state.projects.some(project => project.sourceCardId === intake.id)) continue;
      const source = normalizeSource(intake.source);
      const card = normalizeKnowledgeCard(intake.card);
      if (card.back.length < 40 || card.evidence.length < 20) continue;
      const title = `Biblioteca · ${source.title}`.slice(0, 180);
      const visual = textCardDataURL(source.title, card.evidence);
      const missions = createMissions(title);
      missions[0].artifact = card.back;
      missions[0].evidence = card.evidence;
      missions[0].nextQuestion = card.front;
      const attachment = normalizeAttachment({
        id: uid("image"),
        name: "evidencia-biblioteca.webp",
        mime: "image/webp",
        size: visual.length,
        width: 1200,
        height: 675,
        originalData: visual
      });
      const project = normalizeProject({
        id: uid("forge"),
        sourceCardId: intake.id,
        title,
        attachments: [attachment],
        activeAttachmentId: attachment.id,
        sourceImageData: visual,
        cards: [card],
        librarySources: [source],
        missions,
        createdAt: intake.createdAt || nowISO()
      });
      await requestResult(projectStore("readwrite").put(project));
      newestId = project.id;
    }
    try { localStorage.removeItem(FORGE_INTAKE_KEY); } catch {}
    await loadProjects();
    return newestId;
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
    if (tabName === "cards") {
      renderKnowledgeCards();
      renderTemiChallenges();
    }
    if (tabName === "sources") {
      loadLibraryCatalog().then(() => renderLibraryResults($("forgeLibrarySearch").value)).catch(error => {
        $("forgeLibraryResults").innerHTML = `<div class="forge-empty">⚠️ ${esc(error.message)}</div>`;
      });
    }
    if (tabName === "peer") renderPeerReviews();
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
    renderKnowledgeCards();
    renderTemiChallenges();
    renderLinkedSources();
    renderPeerReviews();
    switchTab("image");
    if (!$("knowledgeForgeDialog").open) $("knowledgeForgeDialog").showModal();
    const attachment = activeAttachment();
    state.current.activeAttachmentId = attachment?.id || "";
    state.activeAttachmentId = state.current.activeAttachmentId;
    const source = attachment?.editedData || attachment?.originalData || state.current.editedImageData || state.current.sourceImageData;
    state.originalImage = attachment?.originalData || state.current.sourceImageData || source;
    renderAttachments();
    await drawSourceToCanvas(source, { resetHistory: true });
    setCanvasZoom("fit");
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
    persistActiveCanvas();
    state.current.title = $("forgeProjectTitle").value.trim().slice(0, 180) || state.current.title;
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
    return IMAGE_TYPES[mime] || "png";
  }

  function mimeForPath(path) {
    const extension = path.split(".").pop().toLowerCase();
    return ({
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      bmp: "image/bmp",
      avif: "image/avif"
    })[extension] || "";
  }

  async function sourceToImageBytes(source) {
    if (String(source).startsWith("data:")) {
      const parsed = parseDataURL(source);
      if (!Object.hasOwn(IMAGE_TYPES, parsed.mime)) throw new Error("Tipo de imagem local não permitido no backup.");
      return parsed;
    }
    const resolved = new URL(source, location.href);
    if (!["http:", "https:", "file:"].includes(resolved.protocol)) throw new Error("Origem de imagem bloqueada.");
    if (location.protocol !== "file:" && resolved.origin !== location.origin) {
      throw new Error("Backup não incorpora imagem de origem externa.");
    }
    const response = await fetch(resolved.href);
    if (!response.ok) throw new Error("Imagem publicada indisponível para o backup.");
    const mime = response.headers.get("content-type")?.split(";")[0] || "";
    if (!Object.hasOwn(IMAGE_TYPES, mime)) {
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
        for (const attachment of copy.attachments) {
          for (const variant of ["originalData", "editedData"]) {
            const source = attachment[variant];
            if (!source) continue;
            const image = await sourceToImageBytes(source);
            const label = variant === "originalData" ? "original" : "editada";
            const path = `images/projects/${safeId(copy.id, "forge")}/${safeId(attachment.id, "image")}-${label}.${extensionForMime(image.mime)}`;
            entries.push({ name: path, data: image.bytes });
            attachment[variant === "originalData" ? "backupOriginalPath" : "backupEditedPath"] = path;
            attachment[variant === "originalData" ? "backupOriginalMime" : "backupEditedMime"] = image.mime;
            attachment[variant] = "";
          }
        }
        copy.sourceImageData = "";
        copy.editedImageData = "";
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
    if (!bytes || !Object.hasOwn(IMAGE_TYPES, mime)) {
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
    if (Array.isArray(record.attachments) && record.attachments.length) {
      record.attachments = record.attachments.map(raw => {
        const attachment = structuredClone(raw);
        for (const [pathField, mimeField, dataField] of [
          ["backupOriginalPath", "backupOriginalMime", "originalData"],
          ["backupEditedPath", "backupEditedMime", "editedData"]
        ]) {
          const path = String(attachment[pathField] || "");
          if (!path) continue;
          const mime = attachment[mimeField] || mimeForPath(path);
          if (!Object.hasOwn(IMAGE_TYPES, mime)) throw new Error("Formato de imagem de projeto inválido.");
          const bytes = files.get(path);
          if (!bytes) throw new Error(`Imagem de projeto ausente: ${path}.`);
          attachment[dataField] = bytesToDataURL(bytes, mime);
          delete attachment[pathField];
          delete attachment[mimeField];
        }
        return attachment;
      });
      return record;
    }
    const path = String(record.backupImagePath || "");
    if (!path) return record;
    const bytes = files.get(path);
    const mime = record.backupImageMime || mimeForPath(path);
    if (!bytes || !Object.hasOwn(IMAGE_TYPES, mime)) {
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
        button.addEventListener("keydown", event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const tabs = Array.from(document.querySelectorAll("[data-forge-tab]"));
          const current = tabs.indexOf(button);
          const next = event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
          tabs[next].focus();
          switchTab(tabs[next].dataset.forgeTab);
        });
      });
      $("btnForgeApplyCrop").addEventListener("click", applyCrop);
      $("btnForgeUndo").addEventListener("click", undoCanvas);
      $("btnForgeReset").addEventListener("click", resetCanvas);
      $("btnForgeFit").addEventListener("click", () => setCanvasZoom("fit"));
      $("btnForgeActual").addEventListener("click", () => setCanvasZoom("actual"));
      $("btnForgeText").addEventListener("click", addTextAnnotation);
      $("btnForgeOcr").addEventListener("click", runOcr);
      $("btnForgeSave").addEventListener("click", saveCurrentProject);
      $("btnForgeClose").addEventListener("click", () => $("knowledgeForgeDialog").close());
      $("knowledgeForgeDialog").addEventListener("close", () => {
        if (state.current) saveCurrentProject().catch(error => {
          $("forgeBackupStatus").textContent = `⚠️ Não foi possível salvar ao fechar: ${error.message}`;
        });
      });
      $("btnForgeNew").addEventListener("click", () => {
        state.imageImportMode = "new";
        $("forgeImageInput").click();
      });
      $("btnForgeAddImages").addEventListener("click", () => {
        state.imageImportMode = "append";
        $("forgeImageInput").click();
      });
      $("forgeImageInput").addEventListener("change", async event => {
        $("forgeBackupStatus").textContent = "Validando imagens e dimensões…";
        try {
          await importImageFiles(event.target.files, state.imageImportMode);
          $("forgeBackupStatus").textContent = "✅ Imagens anexadas e preservadas localmente.";
        } catch (error) {
          $("forgeBackupStatus").textContent = `❌ ${error.message}`;
        } finally {
          event.target.value = "";
        }
      });
      $("forgeAttachments").addEventListener("click", event => {
        const button = event.target.closest("[data-forge-attachment]");
        if (button) switchAttachment(button.dataset.forgeAttachment);
      });
      $("btnForgeGallery").addEventListener("click", () => {
        renderCausalGallery($("forgeGallerySearch").value);
        $("forgeGalleryDialog").showModal();
      });
      $("btnForgeGalleryClose").addEventListener("click", () => $("forgeGalleryDialog").close());
      $("forgeGallerySearch").addEventListener("input", event => renderCausalGallery(event.target.value));
      $("forgeCausalGallery").addEventListener("click", async event => {
        const button = event.target.closest("[data-open-causal]");
        if (!button) return;
        $("forgeGalleryDialog").close();
        await openProject(button.dataset.openCausal);
        switchTab("missions");
      });
      $("btnForgeGenerateCards").addEventListener("click", generateKnowledgeCards);
      $("btnForgeGenerateTemi").addEventListener("click", generateTemiChallenges);
      $("forgeCards").addEventListener("input", event => {
        const article = event.target.closest("[data-forge-card-id]");
        const field = event.target.dataset.cardField;
        const card = state.current?.cards.find(item => item.id === article?.dataset.forgeCardId);
        if (!card || !field) return;
        card[field] = field === "tags"
          ? event.target.value.split(",").map(tag => tag.trim()).filter(Boolean).slice(0, 24)
          : event.target.value.slice(0, field === "back" ? 16000 : field === "evidence" ? 12000 : 4000);
        card.updatedAt = nowISO();
      });
      $("forgeCards").addEventListener("click", event => {
        const button = event.target.closest("[data-delete-knowledge-card]");
        if (!button || !state.current) return;
        state.current.cards = state.current.cards.filter(card => card.id !== button.dataset.deleteKnowledgeCard);
        renderKnowledgeCards();
      });
      $("forgeTemiChallenges").addEventListener("click", event => {
        const button = event.target.closest("[data-temi-option]");
        const article = button?.closest("[data-temi-id]");
        if (button && article) answerTemiChallenge(article.dataset.temiId, Number(button.dataset.temiOption), button);
      });
      $("forgeLibrarySearch").addEventListener("input", event => renderLibraryResults(event.target.value));
      $("forgeLibraryResults").addEventListener("click", event => {
        const button = event.target.closest("[data-link-source]");
        if (button) attachLibrarySource(button.dataset.linkSource);
      });
      $("forgeLinkedSources").addEventListener("click", event => {
        const button = event.target.closest("[data-unlink-source]");
        if (button) unlinkLibrarySource(button.dataset.unlinkSource);
      });
      $("btnForgePeerSave").addEventListener("click", savePeerReview);
      $("btnForgePeerPacket").addEventListener("click", exportPeerPacketOrResponse);
      $("btnForgePeerImport").addEventListener("click", () => $("forgePeerInput").click());
      $("forgePeerInput").addEventListener("change", async event => {
        try {
          await importPeerFile(event.target.files?.[0]);
          $("forgeSaveStatus").textContent = "✅ Revisão importada com rastreabilidade.";
        } catch (error) {
          $("forgeSaveStatus").textContent = `⚠️ ${error.message}`;
        } finally {
          event.target.value = "";
        }
      });
      $("forgePanelExport").addEventListener("click", event => {
        const button = event.target.closest("[data-forge-export]");
        if (button) exportProject(button.dataset.forgeExport);
      });
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
      const intakeProjectId = await consumeLibraryIntakes();
      const params = new URLSearchParams(location.search);
      if (intakeProjectId && params.get("forge") === "intake") {
        await openProject(intakeProjectId);
        switchTab("cards");
      }
    } catch (error) {
      console.error(error);
      $("forgeBackupStatus").textContent = `⚠️ Forja local indisponível: ${error.message}`;
    }
  }

  window.KnowledgeForgeDiagnostics = Object.freeze({
    schema: BACKUP_SCHEMA,
    crc32,
    createZip,
    parseZip,
    causalNodes,
    cardRows,
    normalizeProject
  });
  window.addEventListener("cardfeed:ready", init, { once: true });
  if (window.CardFeedBridge?.ready) init();
  window.addEventListener("pagehide", () => {
    state.ocrWorker?.terminate?.();
    state.ocrWorker = null;
  });
})();
