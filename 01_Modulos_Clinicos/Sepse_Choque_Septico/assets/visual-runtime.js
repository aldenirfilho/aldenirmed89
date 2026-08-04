(function () {
  "use strict";

  const referenceMap = new Map(
    (window.SEPSE_ULTRA_EXPERT?.references || []).map((reference) => [reference.id, reference])
  );

  function buildSourceLinks(figure) {
    const sourceNode = figure.querySelector(".visual-source");
    const sourceIds = (figure.dataset.sourceIds || "").trim().split(/\s+/).filter(Boolean);
    const sources = sourceIds.map((id) => referenceMap.get(id)).filter(Boolean);
    if (!sourceNode || !sources.length) return;

    sourceNode.replaceChildren(document.createTextNode(sources.length > 1 ? "Fontes diretas: " : "Fonte direta: "));
    sources.forEach((source, index) => {
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${source.title} (${source.year})`;
      sourceNode.append(link);
      if (index < sources.length - 1) sourceNode.append(document.createTextNode(" · "));
    });
    sourceNode.append(document.createTextNode("."));
  }

  function buildImageActions(figure) {
    const caption = figure.querySelector("figcaption");
    const originalLink = caption?.querySelector(".visual-full-link");
    if (!caption || !originalLink || caption.querySelector(".visual-actions")) return;

    originalLink.textContent = "↗ Abrir imagem original";
    originalLink.setAttribute("aria-label", `Abrir ${figure.dataset.visualId || "imagem"} em nova guia`);

    const downloadLink = document.createElement("a");
    downloadLink.className = "visual-download";
    downloadLink.href = originalLink.getAttribute("href") || "";
    downloadLink.download = downloadLink.href.split("/").pop() || "sepse-ultra-expert.png";
    downloadLink.textContent = "⬇ Salvar / baixar imagem";
    downloadLink.setAttribute("aria-label", `Salvar ou baixar ${figure.dataset.visualId || "imagem"}`);

    const actions = document.createElement("div");
    actions.className = "visual-actions";
    originalLink.replaceWith(actions);
    actions.append(originalLink, downloadLink);
  }

  function expandTurboCaption(figure) {
    const details = figure.querySelector(".visual-description");
    if (details instanceof HTMLDetailsElement) {
      details.open = true;
      const summary = details.querySelector("summary");
      if (summary) summary.textContent = "Legenda Turbo TEMI — aplicação e limite";
    }

    const caption = figure.querySelector("figcaption");
    if (!caption || caption.querySelector(".visual-disclosure")) return;
    const disclosure = document.createElement("span");
    disclosure.className = "visual-disclosure";
    disclosure.textContent = "Infográfico didático conceitual gerado por IA. Não representa paciente, exame real, prescrição individual nem validação diagnóstica.";
    const sourceNode = caption.querySelector(".visual-source");
    if (sourceNode) sourceNode.before(disclosure);
    else caption.append(disclosure);
  }

  document.querySelectorAll("figure.clinical-visual[data-visual-id]").forEach((figure) => {
    buildSourceLinks(figure);
    expandTurboCaption(figure);
    buildImageActions(figure);
  });

  const dialog = document.getElementById("visualDialog");
  const dialogImage = document.getElementById("visualDialogImage");
  const dialogTitle = document.getElementById("visualDialogTitle");
  const dialogDescription = document.getElementById("visualDialogDescription");
  const closeButton = dialog?.querySelector("[data-dialog-close]");
  let returnFocus = null;

  if (!dialog || !dialogImage || !dialogTitle || !dialogDescription) return;

  function closeDialog() {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else {
      dialog.removeAttribute("open");
      dialog.hidden = true;
    }
    dialogImage.removeAttribute("src");
    if (returnFocus instanceof HTMLElement) returnFocus.focus();
    returnFocus = null;
  }

  function openFigure(button) {
    const visualId = button.dataset.visualTarget;
    if (!/^IMG-\d{2}$/.test(visualId || "")) return;
    const figure = document.querySelector(`figure[data-visual-id="${visualId}"]`);
    const image = figure?.querySelector("img");
    if (!figure || !image) return;

    const title = figure.querySelector("figcaption strong")?.textContent
      || image.alt
      || "Imagem didática";
    const description = figure.querySelector(".visual-description p")?.textContent
      || figure.querySelector("figcaption")?.textContent
      || image.alt;

    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    dialogTitle.textContent = title;
    dialogDescription.textContent = description;
    dialog.hidden = false;
    returnFocus = button;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    closeButton?.focus();
  }

  document.addEventListener("click", (event) => {
    const zoomButton = event.target.closest(".visual-zoom[data-visual-target]");
    if (zoomButton instanceof HTMLButtonElement) openFigure(zoomButton);
  });

  closeButton?.addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
}());
