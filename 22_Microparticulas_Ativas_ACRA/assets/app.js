(function initializeMicroparticles() {
  "use strict";

  const artifactUrl = "data/pocus-choque-acra.json";
  const progressKey = "antigravity:acra:pocus-shock:v1";
  const themeKey = "antigravity:a11y:v1";
  const widgetPreferenceKey = "antigravity:acra:widget-size:v1";
  const allowedComponentTypes = new Set([
    "callout",
    "tabs",
    "accordion",
    "cards",
    "numberedSteps",
    "comparisonTable",
    "thresholdTable",
    "checklist",
    "quiz",
    "keyValueGrid",
    "sources",
    "progress",
    "followupActions"
  ]);

  const state = loadProgress();
  let artifact = null;
  let sourceById = new Map();
  let actionById = new Map();
  let progressComponent = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function loadProgress() {
    const fallback = { checks: {}, quizzes: {}, visited: {} };
    try {
      const parsed = JSON.parse(localStorage.getItem(progressKey) || "{}");
      return {
        checks: parsed && typeof parsed.checks === "object" ? parsed.checks : {},
        quizzes: parsed && typeof parsed.quizzes === "object" ? parsed.quizzes : {},
        visited: parsed && typeof parsed.visited === "object" ? parsed.visited : {}
      };
    } catch (_) {
      return fallback;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(progressKey, JSON.stringify(state));
    } catch (_) {
      // O conteúdo continua funcional mesmo sem armazenamento local.
    }
  }

  function assertArtifactShape(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Artefato ACRA inválido.");
    }
    if (value.version !== "1.0" || typeof value.id !== "string") {
      throw new Error("Versão do contrato ACRA não suportada.");
    }
    if (!Array.isArray(value.critical) || !Array.isArray(value.components)) {
      throw new Error("Estrutura ACRA incompleta.");
    }
    if (value.components.length > 24) {
      throw new Error("O artefato excede o limite de componentes.");
    }
    const ids = new Set();
    const registerId = (id) => {
      if (typeof id !== "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(id)) {
        throw new Error("Identificador ACRA inválido.");
      }
      if (ids.has(id)) throw new Error("Identificador ACRA duplicado.");
      ids.add(id);
    };
    registerId(value.id);
    value.critical.forEach((item) => registerId(item.id));
    value.components.forEach((component) => {
      registerId(component.id);
      if (!allowedComponentTypes.has(component.type)) {
        throw new Error("Componente ACRA não permitido.");
      }
    });
    (value.actions || []).forEach((item) => registerId(item.id));
    (value.sources || []).forEach((item) => registerId(item.id));
    return value;
  }

  function titleFor(component) {
    const heading = element("h3", "component-title", component.title || "");
    return heading;
  }

  function componentShell(component, extraClass) {
    const shell = element("article", `component ${extraClass || ""}`.trim());
    shell.id = component.id;
    shell.dataset.componentType = component.type;
    if (component.title) shell.append(titleFor(component));
    return shell;
  }

  function renderContentBlocks(blocks) {
    const wrapper = element("div", "content-block");
    blocks.forEach((block) => {
      if (block.type === "paragraph") {
        wrapper.append(element("p", "", block.text));
      } else if (block.type === "bulletList") {
        const list = element("ul");
        block.items.forEach((item) => list.append(element("li", "", item)));
        wrapper.append(list);
      } else if (block.type === "keyValueList") {
        const list = element("dl", "kv-grid");
        block.items.forEach((item) => {
          const pair = element("div", "kv-item");
          pair.append(element("dt", "", item.label));
          pair.append(element("dd", "", item.value));
          list.append(pair);
        });
        wrapper.append(list);
      }
    });
    return wrapper;
  }

  function renderCallout(component) {
    const shell = componentShell(component, "callout");
    shell.dataset.tone = component.tone;
    shell.append(element("p", "", component.text));
    return shell;
  }

  function renderKeyValue(component) {
    const shell = componentShell(component);
    const grid = element("dl", "kv-grid");
    component.items.forEach((item) => {
      const pair = element("div", "kv-item");
      pair.append(element("dt", "", item.label));
      pair.append(element("dd", "", item.value));
      grid.append(pair);
    });
    shell.append(grid);
    return shell;
  }

  function renderSteps(component) {
    const shell = componentShell(component);
    const list = element("ol", "step-list");
    component.items.forEach((item) => {
      const row = element("li");
      const copy = element("div");
      copy.append(element("h3", "", item.title));
      copy.append(element("p", "", item.text));
      row.append(copy);
      list.append(row);
    });
    shell.append(list);
    return shell;
  }

  function renderTabs(component) {
    const shell = componentShell(component);
    const tabList = element("div", "tab-list");
    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-label", component.title || "Conteúdo em abas");
    const panels = [];

    component.items.forEach((item, index) => {
      const button = element("button", "tab-button", item.label);
      const panel = element("div", "tab-panel");
      const tabId = `${component.id}-${item.id}-tab`;
      const panelId = `${component.id}-${item.id}-panel`;
      button.type = "button";
      button.id = tabId;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.tabIndex = index === 0 ? 0 : -1;
      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.hidden = index !== 0;
      panel.append(renderContentBlocks(item.content));
      panels.push({ button, panel });
      tabList.append(button);
      shell.append(panel);

      button.addEventListener("click", () => {
        panels.forEach((pair) => {
          const active = pair.button === button;
          pair.button.setAttribute("aria-selected", String(active));
          pair.button.tabIndex = active ? 0 : -1;
          pair.panel.hidden = !active;
        });
        state.visited[component.id] = true;
        saveProgress();
        updateProgress();
      });
    });

    shell.insertBefore(tabList, shell.children[1] || null);
    return shell;
  }

  function renderCards(component) {
    const shell = componentShell(component);
    const grid = element("div", "card-grid");
    component.items.forEach((item) => {
      const card = element("article", "study-card");
      card.dataset.tone = item.tone || "neutral";
      card.append(element("h3", "", item.title));
      card.append(element("p", "", item.text));
      grid.append(card);
    });
    shell.append(grid);
    return shell;
  }

  function renderComparison(component) {
    const shell = componentShell(component);
    const scroll = element("div", "table-scroll");
    const table = element("table");
    const head = element("thead");
    const headerRow = element("tr");
    headerRow.append(element("th", "", "Sinal"));
    component.columns.forEach((column) => headerRow.append(element("th", "", column.label)));
    head.append(headerRow);
    const body = element("tbody");
    component.rows.forEach((row) => {
      const tr = element("tr");
      tr.append(element("th", "", row.label));
      row.cells.forEach((cell) => tr.append(element("td", "", cell)));
      body.append(tr);
    });
    table.append(head, body);
    scroll.append(table);
    shell.append(scroll);
    return shell;
  }

  function renderThresholds(component) {
    const shell = componentShell(component);
    const scroll = element("div", "table-scroll");
    const table = element("table");
    const head = element("thead");
    const headerRow = element("tr");
    ["Métrica", "Pista", "Interpretação segura"].forEach((label) => {
      headerRow.append(element("th", "", label));
    });
    head.append(headerRow);
    const body = element("tbody");
    component.rows.forEach((row) => {
      const tr = element("tr");
      tr.append(element("th", "", row.metric));
      tr.append(element("td", "", `${row.operator} ${row.value}${row.unit ? ` ${row.unit}` : ""}`));
      tr.append(element("td", "", row.meaning));
      body.append(tr);
    });
    table.append(head, body);
    scroll.append(table);
    shell.append(scroll);
    return shell;
  }

  function renderChecklist(component) {
    const shell = componentShell(component);
    const list = element("ul", "checklist");
    component.items.forEach((item) => {
      const row = element("li", "check-item");
      const checkbox = document.createElement("input");
      const copy = element("label");
      const inputId = `${component.id}-${item.id}`;
      checkbox.type = "checkbox";
      checkbox.id = inputId;
      checkbox.checked = Boolean(state.checks[item.id] ?? item.initiallyChecked);
      copy.htmlFor = inputId;
      copy.append(element("strong", "", item.label));
      if (item.details) copy.append(element("small", "", item.details));
      checkbox.addEventListener("change", () => {
        state.checks[item.id] = checkbox.checked;
        state.visited[component.id] = true;
        saveProgress();
        updateProgress();
      });
      row.append(checkbox, copy);
      list.append(row);
    });
    shell.append(list);
    return shell;
  }

  function renderAccordion(component) {
    const shell = componentShell(component);
    const list = element("div", "accordion-list");
    const items = [];
    component.items.forEach((item) => {
      const wrapper = element("section", "accordion-item");
      const button = element("button", "accordion-trigger", item.label);
      const panel = element("div", "accordion-panel");
      const panelId = `${component.id}-${item.id}-content`;
      button.type = "button";
      button.setAttribute("aria-expanded", String(Boolean(item.initiallyOpen)));
      button.setAttribute("aria-controls", panelId);
      panel.id = panelId;
      panel.hidden = !item.initiallyOpen;
      panel.append(renderContentBlocks(item.content));
      items.push({ button, panel });
      button.addEventListener("click", () => {
        const willOpen = button.getAttribute("aria-expanded") !== "true";
        items.forEach((pair) => {
          pair.button.setAttribute("aria-expanded", "false");
          pair.panel.hidden = true;
        });
        button.setAttribute("aria-expanded", String(willOpen));
        panel.hidden = !willOpen;
        if (willOpen) {
          state.visited[component.id] = true;
          saveProgress();
          updateProgress();
        }
      });
      wrapper.append(button, panel);
      list.append(wrapper);
    });
    shell.append(list);
    return shell;
  }

  function renderQuiz(component) {
    const shell = componentShell(component);
    const list = element("div", "quiz-list");

    component.questions.forEach((question, questionIndex) => {
      const card = element("section", "quiz-question");
      const fieldset = element("fieldset");
      const legend = element(
        "legend",
        "",
        `${questionIndex + 1}. ${question.prompt}`
      );
      const options = element("div", "quiz-options");
      const stored = state.quizzes[question.id] || {};
      let selectedId = typeof stored.selectedId === "string" ? stored.selectedId : "";

      question.options.forEach((option) => {
        const label = element("label", "quiz-option");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = question.id;
        input.value = option.id;
        input.checked = selectedId === option.id;
        input.addEventListener("change", () => {
          selectedId = option.id;
          submit.disabled = false;
        });
        label.append(input, document.createTextNode(option.label));
        options.append(label);
      });

      const submit = element("button", "quiz-submit", "Conferir resposta");
      submit.type = "button";
      submit.disabled = !selectedId;
      const feedback = element("p", "quiz-feedback");
      feedback.hidden = true;

      function showFeedback(choice) {
        const correct = choice === question.correctOptionId;
        feedback.dataset.correct = String(correct);
        feedback.textContent = `${correct ? "✅ Correto. " : "🔁 Revise. "}${question.feedback}`;
        feedback.hidden = false;
        submit.textContent = "Revisar resposta";
      }

      if (stored.evaluated && selectedId) showFeedback(selectedId);

      submit.addEventListener("click", () => {
        if (!selectedId) return;
        state.quizzes[question.id] = { selectedId, evaluated: true };
        state.visited[component.id] = true;
        saveProgress();
        showFeedback(selectedId);
        updateProgress();
      });

      fieldset.append(legend, options);
      card.append(fieldset, submit, feedback);
      list.append(card);
    });
    shell.append(list);
    return shell;
  }

  function renderProgress(component) {
    const shell = componentShell(component);
    const wrapper = element("div", "progress-shell");
    const track = element("div", "progress-track");
    const value = element("div", "progress-value");
    const copy = element("div", "progress-copy");
    const label = element("span", "", component.label || "Progresso");
    const count = element("strong", "", `${component.current}/${component.total}`);
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(component.total));
    track.setAttribute("aria-valuenow", String(component.current));
    track.append(value);
    copy.append(label, count);
    wrapper.append(track, copy);
    shell.append(wrapper);
    progressComponent = { component, track, value, count };
    return shell;
  }

  function renderSources(component) {
    const shell = componentShell(component);
    const list = element("ol", "source-list");
    component.sourceIds.forEach((sourceId) => {
      const source = sourceById.get(sourceId);
      if (!source) return;
      const item = element("li");
      const url = safeHttpsUrl(source.url);
      if (url) {
        const link = element("a", "", source.title);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const meta = [source.publisher, source.publishedAt].filter(Boolean).join(" · ");
        if (meta) link.append(element("small", "", meta));
        item.append(link);
      } else {
        item.append(element("span", "", source.title));
      }
      list.append(item);
    });
    shell.append(list);
    return shell;
  }

  function safeHttpsUrl(value) {
    if (typeof value !== "string") return "";
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function renderActions(component) {
    const shell = componentShell(component);
    const grid = element("div", "action-grid");
    const preview = element("div", "action-preview");
    preview.hidden = true;
    component.actionIds.forEach((actionId) => {
      const action = actionById.get(actionId);
      if (!action || action.requiresPreview !== true) return;
      const button = element("button", "action-button", `➡️ ${action.label}`);
      button.type = "button";
      button.addEventListener("click", () => {
        preview.textContent = `Prévia de estudo: ${action.prompt}`;
        preview.hidden = false;
        const targetId = Array.isArray(action.contextComponentIds)
          ? action.contextComponentIds[0]
          : "";
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.tabIndex = -1;
          target.focus({ preventScroll: true });
        }
      });
      grid.append(button);
    });
    shell.append(grid, preview);
    return shell;
  }

  function renderComponent(component) {
    switch (component.type) {
      case "callout":
        return renderCallout(component);
      case "keyValueGrid":
        return renderKeyValue(component);
      case "numberedSteps":
        return renderSteps(component);
      case "tabs":
        return renderTabs(component);
      case "cards":
        return renderCards(component);
      case "comparisonTable":
        return renderComparison(component);
      case "thresholdTable":
        return renderThresholds(component);
      case "checklist":
        return renderChecklist(component);
      case "accordion":
        return renderAccordion(component);
      case "quiz":
        return renderQuiz(component);
      case "progress":
        return renderProgress(component);
      case "sources":
        return renderSources(component);
      case "followupActions":
        return renderActions(component);
      default:
        throw new Error(`Componente não suportado: ${component.type}`);
    }
  }

  function renderCritical(items) {
    const target = document.getElementById("artifact-critical");
    items.forEach((item) => {
      const alert = element("article", "critical-alert");
      alert.dataset.severity = item.severity;
      const icons = { danger: "⛔", warning: "⚠️", info: "ℹ️" };
      const icon = element("span", "critical-icon", icons[item.severity] || "ℹ️");
      icon.setAttribute("aria-hidden", "true");
      const copy = element("div");
      copy.append(element("h3", "", item.title));
      copy.append(element("p", "", item.text));
      alert.append(icon, copy);
      target.append(alert);
    });
  }

  function computeProgress() {
    if (!artifact) return { current: 1, total: 7 };
    const layers = [
      true,
      Boolean(state.visited["component-m1-mechanism"]),
      Boolean(state.visited["component-m2-phenotypes"]),
      Boolean(state.visited["component-m3-case"]) ||
        Boolean(state.visited["component-m3-scan"]),
      Boolean(state.visited["component-m4-pitfalls"]),
      artifact.components
        .find((item) => item.id === "component-m5-recall")
        ?.questions.every((question) => state.quizzes[question.id]?.evaluated) || false,
      artifact.components
        .find((item) => item.id === "component-m6-resume")
        ?.items.some((item) => state.checks[item.id]) || false
    ];
    return { current: layers.filter(Boolean).length, total: layers.length };
  }

  function updateProgress() {
    if (!progressComponent) return;
    const next = computeProgress();
    const percentage = Math.round((next.current / next.total) * 100);
    progressComponent.value.style.width = `${percentage}%`;
    progressComponent.track.setAttribute("aria-valuenow", String(next.current));
    progressComponent.count.textContent = `${next.current}/${next.total} · ${percentage}%`;
  }

  function markObservedComponents() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (id) {
            state.visited[id] = true;
            saveProgress();
            updateProgress();
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.55 }
    );
    document.querySelectorAll(".component").forEach((node) => observer.observe(node));
  }

  function configureTheme() {
    const button = document.getElementById("theme-toggle");
    const root = document.documentElement;

    function syncButton() {
      const light = root.dataset.theme === "light";
      button.setAttribute("aria-pressed", String(light));
      button.setAttribute(
        "aria-label",
        light ? "Ativar visualização escura" : "Ativar visualização clara"
      );
      button.textContent = light ? "🌙 Modo escuro" : "☀️ Modo claro";
    }

    button.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      root.dataset.themePreference = next;
      try {
        localStorage.setItem(themeKey, JSON.stringify({ theme: next }));
      } catch (_) {
        // Preferência não persistida, sem impacto no conteúdo.
      }
      syncButton();
    });
    syncButton();
  }

  function configureFocusMode() {
    const button = document.getElementById("focus-mode");
    button.addEventListener("click", () => {
      const active = document.body.classList.toggle("focus-active");
      button.textContent = active ? "↩ Sair do modo foco" : "⚡ Iniciar modo foco";
      button.setAttribute("aria-pressed", String(active));
      const target = document.getElementById(
        active ? "component-m0-essence" : "metodologia"
      );
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function configureStudyDrawer() {
    const drawer = document.getElementById("study-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    const toggle = document.getElementById("study-drawer-toggle");
    const closeButton = document.getElementById("study-drawer-close");
    if (!drawer || !backdrop || !toggle || !closeButton) return;

    let returnFocus = toggle;

    function closeDrawer() {
      if (drawer.hidden) return;
      drawer.hidden = true;
      backdrop.hidden = true;
      drawer.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("drawer-open");
      returnFocus.focus();
    }

    function openDrawer() {
      returnFocus =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : toggle;
      drawer.hidden = false;
      backdrop.hidden = false;
      drawer.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("drawer-open");
      closeButton.focus();
    }

    toggle.addEventListener("click", () => {
      if (drawer.hidden) openDrawer();
      else closeDrawer();
    });
    closeButton.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);
    drawer
      .querySelectorAll("[data-close-drawer]")
      .forEach((link) => link.addEventListener("click", closeDrawer));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !drawer.hidden) closeDrawer();
    });
  }

  function configureWidgets() {
    const allowedSizes = new Set(["small", "medium", "large"]);
    const buttons = Array.from(
      document.querySelectorAll("[data-widget-size]")
    );
    const panels = Array.from(
      document.querySelectorAll("[data-widget-panel]")
    );
    if (!buttons.length || !panels.length) return;

    function selectWidget(size, persist) {
      const safeSize = allowedSizes.has(size) ? size : "small";
      buttons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.widgetSize === safeSize)
        );
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.widgetPanel !== safeSize;
      });
      if (persist) {
        try {
          localStorage.setItem(widgetPreferenceKey, safeSize);
        } catch (_) {
          // O seletor continua funcional sem persistência.
        }
      }
    }

    let initialSize = "small";
    try {
      const stored = localStorage.getItem(widgetPreferenceKey);
      if (stored && allowedSizes.has(stored)) initialSize = stored;
    } catch (_) {
      // Preferência indisponível; usa formato pequeno.
    }
    selectWidget(initialSize, false);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        selectWidget(button.dataset.widgetSize, true);
      });
    });
  }

  function configurePocusViewer() {
    const dialog = document.getElementById("pocus-viewer");
    const viewerImage = document.getElementById("pocus-viewer-image");
    const viewerTitle = document.getElementById("pocus-viewer-title");
    const viewerCaption = document.getElementById("pocus-viewer-caption");
    const closeButton = document.getElementById("pocus-viewer-close");
    const zoomOut = document.getElementById("pocus-zoom-out");
    const zoomIn = document.getElementById("pocus-zoom-in");
    const zoomReset = document.getElementById("pocus-zoom-reset");
    const zoomValue = document.getElementById("pocus-zoom-value");
    if (
      !dialog ||
      !viewerImage ||
      !viewerTitle ||
      !viewerCaption ||
      !closeButton ||
      !zoomOut ||
      !zoomIn ||
      !zoomReset ||
      !zoomValue
    ) {
      return;
    }

    let zoom = 1;
    let returnFocus = null;

    function updateZoom(nextZoom) {
      zoom = Math.min(3, Math.max(1, nextZoom));
      viewerImage.style.width = `${Math.round(zoom * 100)}%`;
      zoomValue.textContent = `${Math.round(zoom * 100)}%`;
      zoomOut.disabled = zoom <= 1;
      zoomIn.disabled = zoom >= 3;
    }

    function closeViewer() {
      if (dialog.open) dialog.close();
    }

    function openViewer(trigger, sourceImage) {
      const card = sourceImage.closest(".pocus-card, .expansion-card");
      const label = card?.querySelector("h3, .phenotype-badge");
      const caption = sourceImage.closest("figure")?.querySelector("figcaption");
      returnFocus = trigger;
      viewerTitle.textContent = label?.textContent?.trim() || "Imagem POCUS";
      viewerCaption.textContent =
        caption?.textContent?.trim() || sourceImage.alt;
      viewerImage.src = sourceImage.currentSrc || sourceImage.src;
      viewerImage.alt = sourceImage.alt;
      updateZoom(1);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      closeButton.focus();
    }

    document
      .querySelectorAll(".pocus-image img, .expansion-figure img")
      .forEach((sourceImage) => {
        const trigger = element("button", "pocus-zoom-trigger");
        trigger.type = "button";
        trigger.setAttribute(
          "aria-label",
          `Ampliar imagem: ${sourceImage.alt}`
        );
        sourceImage.parentNode.insertBefore(trigger, sourceImage);
        trigger.append(sourceImage);
        trigger.addEventListener("click", () => {
          openViewer(trigger, sourceImage);
        });
      });

    zoomOut.addEventListener("click", () => updateZoom(zoom - 0.25));
    zoomIn.addEventListener("click", () => updateZoom(zoom + 0.25));
    zoomReset.addEventListener("click", () => updateZoom(1));
    closeButton.addEventListener("click", closeViewer);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeViewer();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeViewer();
    });
    dialog.addEventListener("close", () => {
      viewerImage.removeAttribute("src");
      if (returnFocus) returnFocus.focus();
    });
  }

  async function start() {
    configureTheme();
    configureFocusMode();
    configureStudyDrawer();
    configureWidgets();
    configurePocusViewer();
    const status = document.getElementById("artifact-status");
    const target = document.getElementById("artifact-components");

    try {
      const response = await fetch(artifactUrl, { credentials: "same-origin" });
      if (!response.ok) throw new Error(`Falha ao carregar (${response.status}).`);
      artifact = assertArtifactShape(await response.json());
      sourceById = new Map((artifact.sources || []).map((item) => [item.id, item]));
      actionById = new Map((artifact.actions || []).map((item) => [item.id, item]));
      document.title = `${artifact.title} · Micropartículas ACRA`;
      renderCritical(artifact.critical);
      artifact.components.forEach((component) => {
        target.append(renderComponent(component));
      });
      status.remove();
      updateProgress();
      markObservedComponents();
    } catch (error) {
      status.className = "error-card";
      status.textContent =
        "Não foi possível abrir o artefato interativo. Recarregue a página; os avisos clínicos e a metodologia continuam disponíveis.";
      console.error("Falha segura ao renderizar ACRA:", error);
    }
  }

  start();
})();
