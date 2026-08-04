(function installSepsisAcraDialogFix(root) {
  "use strict";

  if (root.__SEPSE_ACRA_DIALOG_FIX_V3__) return;
  root.__SEPSE_ACRA_DIALOG_FIX_V3__ = true;

  const documentNode = root.document;
  if (!documentNode) return;

  const OPEN = "[data-acra-open]";
  const CLOSE = "[data-acra-close]";
  const CLEAR = "[data-acra-clear]";
  const STAGE = "[data-acra-stage]";
  const CONTENT = "[data-acra-stage-content]";
  const STATUS = ".acra-stage__footer [data-acra-status]";
  const PROGRESS_KEY = "antigravity:sepse-acra:progress:v1";

  let currentHandle = null;
  let returnFocus = null;
  let artifacts = null;

  function stageNode() {
    return documentNode.querySelector(STAGE);
  }

  function contentNode() {
    const stage = stageNode();
    return stage ? stage.querySelector(CONTENT) : null;
  }

  function statusNode() {
    const stage = stageNode();
    return stage ? stage.querySelector(STATUS) : null;
  }

  function setStatus(message, state) {
    const status = statusNode();
    if (!status) return;
    status.textContent = message;
    status.dataset.acraStatus = state || "ready";
  }

  function placeholder() {
    const content = contentNode();
    if (!content) return;
    const message = documentNode.createElement("p");
    message.textContent =
      "Selecione um dos dez ACRA para iniciar. O conteúdo clínico convencional permanece disponível fora deste diálogo.";
    content.replaceChildren(message);
  }

  function unmountCurrent() {
    if (currentHandle && typeof currentHandle.unmount === "function") {
      try { currentHandle.unmount(); } catch (_error) {}
    }
    currentHandle = null;
  }

  function closeDialog(restoreFocus) {
    unmountCurrent();
    placeholder();
    setStatus("Aguardando seleção.", "idle");
    const stage = stageNode();
    if (stage) {
      if (typeof stage.close === "function" && stage.open) stage.close();
      else stage.hidden = true;
    }
    const target = returnFocus;
    returnFocus = null;
    if (restoreFocus && target && typeof target.focus === "function") target.focus();
  }

  function getArtifacts() {
    if (artifacts) return artifacts;
    const runtime = root.SepsisAcraRuntime;
    const bundle = root.SEPSE_ACRA_BUNDLE;
    if (!runtime || typeof runtime.validateBundle !== "function") return null;
    const validation = runtime.validateBundle(bundle);
    if (!validation || validation.ok !== true || !Array.isArray(validation.artifacts)) {
      return null;
    }
    artifacts = new Map(
      validation.artifacts.map((artifact) => [artifact.id, artifact])
    );
    return artifacts;
  }

  function readProgress() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : undefined;
    } catch (_error) {
      return undefined;
    }
  }

  function writeProgress(progress) {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      }
    } catch (_error) {}
  }

  function openArtifact(button) {
    const stage = stageNode();
    const content = contentNode();
    const runtime = root.SepsisAcraRuntime;
    const map = getArtifacts();
    const id = button && button.dataset ? button.dataset.acraId : "";
    const artifact = map && map.get(id);

    if (!stage || !content || !runtime ||
        typeof runtime.mount !== "function" || !artifact) {
      setStatus(
        "ACRA indisponível. O conteúdo convencional permanece acessível.",
        "fallback"
      );
      return false;
    }

    unmountCurrent();
    content.replaceChildren();
    returnFocus = button;

    const result = runtime.mount({
      artifact,
      onProgress: writeProgress,
      progress: readProgress(),
      target: content,
      variant: "full"
    });

    if (!result || result.ok !== true || !result.handle) {
      placeholder();
      setStatus(
        "Falha ao abrir o ACRA. O conteúdo convencional permanece acessível.",
        "fallback"
      );
      return false;
    }

    currentHandle = result.handle;
    stage.hidden = false;
    if (typeof stage.showModal === "function" && !stage.open) stage.showModal();
    setStatus(`Aberto: ${artifact.title}.`, "ready");

    const closeButton = stage.querySelector(CLOSE);
    if (closeButton && typeof closeButton.focus === "function") {
      closeButton.focus();
    }
    return true;
  }

  documentNode.addEventListener("click", (event) => {
    const target =
      event.target && typeof event.target.closest === "function"
        ? event.target
        : null;
    if (!target) return;

    const openButton = target.closest(OPEN);
    if (openButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openArtifact(openButton);
      return;
    }

    const stage = stageNode();
    if (!stage) return;

    const closeButton = target.closest(CLOSE);
    if (closeButton && stage.contains(closeButton)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeDialog(true);
      return;
    }

    const clearButton = target.closest(CLEAR);
    if (clearButton && stage.contains(clearButton)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        if (root.localStorage) root.localStorage.removeItem(PROGRESS_KEY);
      } catch (_error) {}
      setStatus(
        currentHandle
          ? "Progresso local limpo. O ACRA atual permanece aberto."
          : "Progresso local limpo.",
        "ready"
      );
    }
  }, true);

  documentNode.addEventListener("DOMContentLoaded", () => {
    const stage = stageNode();
    if (!stage) return;
    stage.addEventListener("cancel", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeDialog(true);
    }, true);
  }, { once: true });
})(globalThis);
