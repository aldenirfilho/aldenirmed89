(function registerSepsisAcraController(root) {
  "use strict";

  if (root.SepsisAcraController) return;

  const MODE_KEY = "antigravity:sepse-acra:mode:v1";
  const PROGRESS_KEY = "antigravity:sepse-acra:progress:v1";
  const MODES = Object.freeze(["OFF", "PARCIAL", "AUTO"]);
  const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,63}$/;
  const MODE_ALIASES = Object.freeze({
    off: "OFF",
    "sem-acra": "OFF",
    parcial: "PARCIAL",
    auto: "AUTO"
  });
  const SELECTORS = Object.freeze({
    clear: "[data-acra-clear]",
    close: "[data-acra-close]",
    controller: "[data-acra-controller]",
    generated: '[data-acra-generated="true"]',
    mode: "[data-acra-mode]",
    open: "[data-acra-open]",
    slot: ".acra-slot[data-acra-id], .acra-slot[data-artifact-id]",
    stage: "[data-acra-stage]",
    modeStatus: "[data-acra-mode-status]",
    status: "[data-acra-status]",
    stageContent: "[data-acra-stage-content]"
  });
  const EMPTY_PROGRESS = Object.freeze({
    answeredIds: Object.freeze([]),
    checkedIds: Object.freeze([]),
    visitedIds: Object.freeze([])
  });

  function normalizeMode(value) {
    if (typeof value !== "string") return "";
    if (MODES.includes(value)) return value;
    return MODE_ALIASES[value.trim().toLowerCase()] || "";
  }

  function safeStorage(candidate) {
    if (!candidate) return null;
    try {
      if (
        typeof candidate.getItem !== "function" ||
        typeof candidate.setItem !== "function" ||
        typeof candidate.removeItem !== "function"
      ) {
        return null;
      }
      return candidate;
    } catch (_error) {
      return null;
    }
  }

  function readStorage(storage, key) {
    if (!storage) return null;
    try {
      return storage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeStorage(storage, key, value) {
    if (!storage) return false;
    try {
      storage.setItem(key, value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function removeStorage(storage, key) {
    if (!storage) return false;
    try {
      storage.removeItem(key);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function sanitizeIds(value) {
    if (!Array.isArray(value)) return [];
    const result = [];
    const seen = new Set();
    value.slice(0, 512).forEach((item) => {
      if (typeof item !== "string" || !ID_PATTERN.test(item) || seen.has(item)) return;
      seen.add(item);
      result.push(item);
    });
    return result.sort();
  }

  function sanitizeProgress(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY_PROGRESS;
    const allowed = new Set(["answeredIds", "checkedIds", "visitedIds"]);
    if (Object.keys(value).some((key) => !allowed.has(key))) return EMPTY_PROGRESS;
    return Object.freeze({
      answeredIds: Object.freeze(sanitizeIds(value.answeredIds)),
      checkedIds: Object.freeze(sanitizeIds(value.checkedIds)),
      visitedIds: Object.freeze(sanitizeIds(value.visitedIds))
    });
  }

  function readProgress(storage) {
    const raw = readStorage(storage, PROGRESS_KEY);
    if (!raw) return EMPTY_PROGRESS;
    try {
      return sanitizeProgress(JSON.parse(raw));
    } catch (_error) {
      return EMPTY_PROGRESS;
    }
  }

  function writeProgress(storage, value) {
    const progress = sanitizeProgress(value);
    return writeStorage(
      storage,
      PROGRESS_KEY,
      JSON.stringify({
        answeredIds: progress.answeredIds,
        checkedIds: progress.checkedIds,
        visitedIds: progress.visitedIds
      })
    );
  }

  function resolveArtifactId(node) {
    if (!node || !node.dataset) return "";
    const candidate = node.dataset.acraId || node.dataset.artifactId || "";
    return ID_PATTERN.test(candidate) ? candidate : "";
  }

  function create(options) {
    const settings = options && typeof options === "object" ? options : {};
    const documentNode = settings.document || root.document || null;
    const runtime = settings.runtime || root.SepsisAcraRuntime || null;
    const bundle = settings.bundle || root.SEPSE_ACRA_BUNDLE || null;
    const Observer = settings.IntersectionObserver || root.IntersectionObserver || null;
    let storageCandidate = settings.storage;
    if (storageCandidate === undefined) {
      try { storageCandidate = root.localStorage; } catch (_error) { storageCandidate = null; }
    }
    const storage = safeStorage(storageCandidate);
    const scope = settings.scope || (
      documentNode && typeof documentNode.querySelector === "function"
        ? documentNode.querySelector(SELECTORS.controller)
        : null
    );
    const queryRoot = scope || documentNode;
    const listeners = [];
    const mounts = new Map();
    let stageMount = null;
    let observer = null;
    let stageReturnFocus = null;
    let active = false;
    let invalidBundle = false;
    let mode = "PARCIAL";
    let progress = readProgress(storage);
    let artifacts = new Map();

    const queryAll = (selector) => {
      if (!queryRoot || typeof queryRoot.querySelectorAll !== "function") return [];
      return Array.from(queryRoot.querySelectorAll(selector));
    };
    const queryOne = (selector) => {
      if (!queryRoot || typeof queryRoot.querySelector !== "function") return null;
      return queryRoot.querySelector(selector);
    };
    const modeButtons = queryAll(SELECTORS.mode);
    const slots = queryAll(SELECTORS.slot);
    const openButtons = queryAll(SELECTORS.open);
    const clearButtons = queryAll(SELECTORS.clear);
    const closeButtons = queryAll(SELECTORS.close);
    const status = queryOne(SELECTORS.modeStatus) || queryOne(SELECTORS.status);
    const stage = queryOne(SELECTORS.stage) || (
      documentNode && typeof documentNode.getElementById === "function"
        ? documentNode.getElementById("acraStage")
        : null
    );
    const stageContent = stage && typeof stage.querySelector === "function"
      ? stage.querySelector(SELECTORS.stageContent)
      : null;
    const stageStatus = stage && typeof stage.querySelector === "function"
      ? stage.querySelector(SELECTORS.status)
      : null;

    function listen(node, type, listener) {
      if (!node || typeof node.addEventListener !== "function") return;
      node.addEventListener(type, listener);
      listeners.push(() => node.removeEventListener(type, listener));
    }

    function setStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      if (status.dataset) status.dataset.acraStatus = state || "ready";
    }

    function setStageStatus(message, state) {
      if (!stageStatus) return;
      stageStatus.textContent = message;
      if (stageStatus.dataset) stageStatus.dataset.acraStatus = state || "ready";
    }

    function resetStageContent() {
      if (!stageContent || typeof stageContent.replaceChildren !== "function") return;
      const message = documentNode.createElement("p");
      message.textContent = "Selecione um dos dez ACRA para iniciar. O conteúdo clínico convencional permanece disponível fora deste diálogo.";
      stageContent.replaceChildren(message);
    }

    function closeStage(restoreFocus) {
      if (stageMount && typeof stageMount.unmount === "function") stageMount.unmount();
      stageMount = null;
      resetStageContent();
      setStageStatus("Aguardando seleção.", "idle");
      if (stage) {
        if (typeof stage.close === "function" && stage.open) stage.close();
        else stage.hidden = true;
      }
      const focusTarget = stageReturnFocus;
      stageReturnFocus = null;
      if (restoreFocus === true && focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
    }

    function removeGeneratedNodes() {
      queryAll(SELECTORS.generated).forEach((node) => {
        if (typeof node.remove === "function") node.remove();
        else if (node.parentNode) node.parentNode.removeChild(node);
      });
    }

    function unmountAll() {
      if (observer && typeof observer.disconnect === "function") observer.disconnect();
      observer = null;
      mounts.forEach((handle) => {
        if (handle && typeof handle.unmount === "function") handle.unmount();
      });
      mounts.clear();
      closeStage(false);
      removeGeneratedNodes();
    }

    function syncControls() {
      if (scope && scope.dataset) {
        scope.dataset.acraMode = mode.toLowerCase();
        scope.dataset.acraState = invalidBundle ? "fallback" : mode === "OFF" ? "off" : "ready";
      }
      modeButtons.forEach((button) => {
        const candidate = normalizeMode(button.dataset && button.dataset.acraMode);
        button.setAttribute("aria-pressed", String(candidate === mode));
        button.disabled = invalidBundle && candidate !== "OFF";
      });
      slots.forEach((slot) => { slot.hidden = invalidBundle || mode === "OFF"; });
    }

    function persistMode(nextMode) {
      return writeStorage(storage, MODE_KEY, nextMode);
    }

    function onProgress(nextProgress) {
      progress = sanitizeProgress(nextProgress);
      writeProgress(storage, progress);
    }

    function mountInto(target, artifact, variant) {
      if (!runtime || typeof runtime.mount !== "function") return null;
      const result = runtime.mount({
        artifact,
        onProgress,
        progress,
        target,
        variant
      });
      if (!result || result.ok !== true || !result.handle) {
        setStatus(
          "A camada ACRA falhou com segurança. O conteúdo convencional permanece disponível.",
          "fallback"
        );
        return null;
      }
      return result.handle;
    }

    function mountSlot(slot) {
      if (mode === "OFF" || invalidBundle || mounts.has(slot)) return;
      const artifactId = resolveArtifactId(slot);
      const artifact = artifacts.get(artifactId);
      if (!artifact) {
        if (slot.dataset) slot.dataset.acraState = "fallback";
        return;
      }
      const handle = mountInto(slot, artifact, mode === "AUTO" ? "full" : "partial");
      if (!handle) return;
      mounts.set(slot, handle);
      if (slot.dataset) slot.dataset.acraState = "mounted";
      const merged = {
        answeredIds: progress.answeredIds,
        checkedIds: progress.checkedIds,
        visitedIds: [...progress.visitedIds, artifact.id]
      };
      onProgress(merged);
    }

    function observeSlots() {
      if (mode === "OFF" || invalidBundle) return;
      if (typeof Observer !== "function") {
        slots.forEach(mountSlot);
        return;
      }
      observer = new Observer((entries) => {
        entries.forEach((entry) => {
          if (!entry || !entry.isIntersecting) return;
          mountSlot(entry.target);
          if (observer && typeof observer.unobserve === "function") observer.unobserve(entry.target);
        });
      }, { rootMargin: "240px 0px", threshold: 0.05 });
      slots.forEach((slot) => observer.observe(slot));
    }

    function applyMode(nextMode, settingsForMode) {
      const normalized = normalizeMode(nextMode);
      const action = settingsForMode && typeof settingsForMode === "object"
        ? settingsForMode
        : {};
      if (!normalized || invalidBundle) return false;
      if (normalized === "AUTO" && action.userInitiated !== true && action.restored !== true) {
        setStatus("AUTO só é ativado por escolha explícita.", "guarded");
        return false;
      }
      unmountAll();
      mode = normalized;
      if (action.persist === true) persistMode(mode);
      syncControls();
      if (mode === "OFF") {
        setStatus("ACRA desligado. O conteúdo convencional permanece integralmente disponível.", "off");
        return true;
      }
      setStatus(
        mode === "AUTO"
          ? "AUTO ativo por opt-in: artefatos completos serão abertos progressivamente."
          : "PARCIAL ativo: resumos ACRA serão acrescentados progressivamente.",
        "ready"
      );
      observeSlots();
      return true;
    }

    function openArtifact(node) {
      if (mode === "OFF" || invalidBundle) {
        setStatus("Ative PARCIAL ou AUTO para abrir o ACRA.", "off");
        return false;
      }
      const artifactId = resolveArtifactId(node);
      const artifact = artifacts.get(artifactId);
      if (!artifact) {
        setStatus("Artefato ACRA indisponível. Use o conteúdo convencional.", "fallback");
        return false;
      }
      const target = stageContent || slots.find((slot) => resolveArtifactId(slot) === artifactId);
      if (!target) return false;
      closeStage(false);
      if (stageContent && typeof stageContent.replaceChildren === "function") {
        stageContent.replaceChildren();
      }
      stageReturnFocus = node && typeof node.focus === "function" ? node : null;
      stageMount = mountInto(target, artifact, "full");
      if (!stageMount) {
        resetStageContent();
        setStageStatus("Falha ao abrir o ACRA. O conteúdo convencional permanece disponível.", "fallback");
        return false;
      }
      if (stage) {
        stage.hidden = false;
        if (typeof stage.showModal === "function" && !stage.open) stage.showModal();
        const closeControl = stage.querySelector && stage.querySelector(SELECTORS.close);
        if (closeControl && typeof closeControl.focus === "function") closeControl.focus();
      }
      setStageStatus(`Aberto: ${artifact.title || artifact.id}.`, "ready");
      setStatus("Artefato ACRA completo aberto por solicitação explícita.", "ready");
      return true;
    }

    function clearProgress() {
      removeStorage(storage, PROGRESS_KEY);
      progress = EMPTY_PROGRESS;
      if (!invalidBundle && mode !== "OFF") {
        unmountAll();
        observeSlots();
      }
      setStatus("Progresso educacional ACRA limpo neste navegador.", "ready");
      return true;
    }

    function setFallback() {
      invalidBundle = true;
      mode = "OFF";
      unmountAll();
      syncControls();
      setStatus(
        "Camada ACRA local indisponível: bundle inválido. O conteúdo convencional permanece disponível.",
        "fallback"
      );
    }

    function bindControls() {
      modeButtons.forEach((button) => {
        listen(button, "click", () => {
          const next = normalizeMode(button.dataset && button.dataset.acraMode);
          applyMode(next, { persist: true, userInitiated: true });
        });
      });
      openButtons.forEach((button) => listen(button, "click", () => openArtifact(button)));
      clearButtons.forEach((button) => listen(button, "click", clearProgress));
      closeButtons.forEach((button) => listen(button, "click", () => closeStage(true)));
      if (stage) {
        listen(stage, "cancel", (event) => {
          if (event && typeof event.preventDefault === "function") event.preventDefault();
          closeStage(true);
        });
      }
    }

    function start() {
      if (active) return api;
      active = true;
      bindControls();
      if (!runtime || typeof runtime.validateBundle !== "function") {
        setFallback();
        return api;
      }
      const validation = runtime.validateBundle(bundle);
      if (!validation || validation.ok !== true || !Array.isArray(validation.artifacts)) {
        setFallback();
        return api;
      }
      artifacts = new Map(validation.artifacts.map((artifact) => [artifact.id, artifact]));
      const storedMode = normalizeMode(readStorage(storage, MODE_KEY));
      const initialMode = storedMode || "PARCIAL";
      applyMode(initialMode, { restored: storedMode === "AUTO", persist: false });
      return api;
    }

    function stop() {
      if (!active) return true;
      unmountAll();
      listeners.splice(0).reverse().forEach((dispose) => {
        try { dispose(); } catch (_error) { /* limpeza fail-safe */ }
      });
      mode = "OFF";
      active = false;
      syncControls();
      return true;
    }

    const api = Object.freeze({
      clearProgress,
      getMode: () => mode,
      isFallback: () => invalidBundle,
      openArtifact,
      setMode(nextMode, modeOptions) {
        return applyMode(nextMode, modeOptions || {});
      },
      start,
      stop
    });
    return api;
  }

  let singleton = null;

  function start(options) {
    if (!singleton) singleton = create(options || {});
    return singleton.start();
  }

  const api = Object.freeze({
    modeKey: MODE_KEY,
    modes: MODES,
    normalizeMode,
    progressKey: PROGRESS_KEY,
    sanitizeProgress,
    selectors: SELECTORS,
    create,
    start
  });
  root.SepsisAcraController = api;

  function autoStart() {
    if (
      !root.document ||
      typeof root.document.querySelector !== "function" ||
      !root.document.querySelector(SELECTORS.controller)
    ) {
      return;
    }
    start();
  }

  if (root.document) {
    if (root.document.readyState === "loading") {
      root.document.addEventListener("DOMContentLoaded", autoStart, { once: true });
    } else {
      autoStart();
    }
  }
})(globalThis);
