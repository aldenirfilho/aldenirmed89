"use strict";

(() => {
  const ROADMAP_URL = "./data/roadmap.json";
  const PROGRESS_KEY = "antigravity:activation-progress:v1";
  const A11Y_KEY = "antigravity:a11y:v1";
  const ALLOWED_STATUSES = new Set([
    "live", "ready", "owner-action", "blocked", "planned"
  ]);
  const ALLOWED_ACTORS = new Set(["owner", "codex", "joint"]);
  const STATUS_LABELS = Object.freeze({
    live: "NO AR",
    ready: "PRONTO",
    "owner-action": "PRECISA DE VOCÊ",
    blocked: "BLOQUEADO",
    planned: "DEPOIS"
  });
  const ACTOR_LABELS = Object.freeze({
    owner: "Proprietário",
    codex: "Codex",
    joint: "Ação conjunta"
  });
  const OFFICIAL_HOSTS = new Set([
    "supabase.com",
    "www.supabase.com",
    "docs.github.com",
    "platform.openai.com",
    "developers.cloudflare.com",
    "www.gov.br",
    "planalto.gov.br",
    "www.planalto.gov.br",
    "sistemas.cfm.org.br",
    "publicidademedica.cfm.org.br",
    "creativecommons.org",
    "github.com",
    "aldenirfilho.github.io"
  ]);
  const state = {
    roadmap: null,
    progress: { schemaVersion: "1.0.0", completed: {}, updatedAt: null },
    filter: "now",
    focus: null,
    timerRemaining: 15 * 60,
    timerId: 0
  };

  const byId = (id) => document.getElementById(id);
  const make = (tag, value, className = "") => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) {
      element.textContent = String(value);
    }
    return element;
  };
  const clean = (value, max = 500) =>
    String(value ?? "").trim().replace(/\u0000/g, "").slice(0, max);
  const asArray = (value) => Array.isArray(value) ? value : [];
  const isText = (value, max = 500) =>
    typeof value === "string" && value.trim().length > 0 && value.length <= max;
  const isTextList = (value) =>
    Array.isArray(value) && value.length > 0 &&
    value.every((item) => isText(item));
  const safeRead = (key, fallback) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : fallback;
    } catch (_error) {
      return fallback;
    }
  };
  const safeWrite = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  };
  const safeRemove = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (_error) {
      // Storage may be unavailable in hardened/private browsing modes.
    }
  };
  const safeExternalUrl = (value) => {
    try {
      const url = new URL(String(value || ""));
      if (url.protocol !== "https:" || !OFFICIAL_HOSTS.has(url.hostname)) {
        return "";
      }
      return url.href;
    } catch (_error) {
      return "";
    }
  };

  function normalizeProgress(value) {
    const completed = {};
    if (value && value.schemaVersion === "1.0.0") {
      Object.entries(value.completed || {}).forEach(([id, done]) => {
        if (/^[a-z0-9][a-z0-9-]{2,79}$/.test(id) && done === true) {
          completed[id] = true;
        }
      });
    }
    return {
      schemaVersion: "1.0.0",
      completed,
      updatedAt: clean(value?.updatedAt, 40) || null
    };
  }

  function roadmapItems() {
    return asArray(state.roadmap?.items);
  }

  function allMicroActions() {
    return roadmapItems().flatMap((item) =>
      asArray(item.microActions).map((action) => ({ item, action }))
    );
  }

  function isComplete(actionId) {
    return state.progress.completed[actionId] === true;
  }

  function saveProgress() {
    state.progress.updatedAt = new Date().toISOString();
    safeWrite(PROGRESS_KEY, state.progress);
    updateProgressSummary();
    updateNextAction();
  }

  function validateRoadmap(payload) {
    if (
      !payload ||
      payload.schemaVersion !== "1.0.0" ||
      !Array.isArray(payload.items)
    ) {
      throw new Error("Roadmap público ausente ou incompatível.");
    }
    const itemIds = new Set();
    const allIds = new Set();
    payload.items.forEach((item) => {
      const id = clean(item.id, 80);
      if (
        !/^[a-z0-9][a-z0-9-]{2,79}$/.test(id) ||
        allIds.has(id) ||
        !ALLOWED_STATUSES.has(item.status) ||
        !ALLOWED_ACTORS.has(item.actor) ||
        !isText(item.title, 160) ||
        !isText(item.estimatedTime, 80) ||
        !isTextList(item.completionCriteria) ||
        !Array.isArray(item.dependsOn) ||
        !Array.isArray(item.microActions) ||
        item.microActions.length === 0 ||
        (item.actor === "owner" && !isTextList(item.doNotShare))
      ) {
        throw new Error("O roadmap contém uma etapa inválida.");
      }
      itemIds.add(id);
      allIds.add(id);
      item.microActions.forEach((action) => {
        const actionId = clean(action.id, 80);
        const actionActor = action.actor || item.actor;
        if (
          !/^[a-z0-9][a-z0-9-]{2,79}$/.test(actionId) ||
          allIds.has(actionId) ||
          !ALLOWED_ACTORS.has(actionActor) ||
          !isText(action.label, 200) ||
          !isText(action.estimatedTime, 80) ||
          !isText(action.completionCriterion, 500) ||
          (actionActor === "owner" && !isTextList(action.doNotShare))
        ) {
          throw new Error("O roadmap contém uma microação inválida.");
        }
        allIds.add(actionId);
      });
    });
    payload.items.forEach((item) => {
      asArray(item.dependsOn).forEach((dependency) => {
        if (!itemIds.has(dependency)) {
          throw new Error("O roadmap contém dependência desconhecida.");
        }
      });
    });
    return payload;
  }

  function statusCounts() {
    return roadmapItems().reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, {});
  }

  function updateProgressSummary() {
    const actions = allMicroActions();
    const completed = actions.filter(({ action }) => isComplete(action.id)).length;
    const percent = actions.length ? Math.round((completed / actions.length) * 100) : 0;
    byId("progressBar").style.width = `${percent}%`;
    byId("progressLabel").textContent = `${percent}% do progresso local`;
    byId("roadmapMeta").textContent = state.progress.updatedAt
      ? `${completed} de ${actions.length} microações marcadas neste navegador.`
      : `${actions.length} microações públicas; nenhuma marcação local ainda.`;
    const counts = statusCounts();
    byId("liveCount").textContent = String(counts.live || 0);
    byId("readyCount").textContent = String(counts.ready || 0);
    byId("ownerCount").textContent = String(counts["owner-action"] || 0);
    byId("laterCount").textContent = String(
      (counts.blocked || 0) + (counts.planned || 0)
    );
  }

  function actionableMicroActions() {
    const rank = {
      "owner-action": 0,
      ready: 1,
      blocked: 2,
      planned: 3,
      live: 4
    };
    return allMicroActions()
      .filter(({ item, action }) =>
        item.status !== "live" && !isComplete(action.id)
      )
      .sort((left, right) =>
        (Number(left.item.priority) || 99) - (Number(right.item.priority) || 99) ||
        rank[left.item.status] - rank[right.item.status]
      );
  }

  function updateNextAction() {
    const next = actionableMicroActions()[0] || null;
    state.focus = next;
    if (!next) {
      byId("nextActionTitle").textContent = "Progresso local concluído";
      byId("nextActionText").textContent =
        "Revise os critérios públicos: caixas marcadas não substituem homologação.";
      byId("nextActor").textContent = "Revisão conjunta";
      byId("nextTime").textContent = "—";
      byId("focusNextButton").disabled = true;
      return;
    }
    byId("nextActionTitle").textContent = clean(next.item.title, 180);
    byId("nextActionText").textContent = clean(next.action.label, 300);
    byId("nextActor").textContent = ACTOR_LABELS[next.item.actor];
    byId("nextTime").textContent = clean(
      next.action.estimatedTime || next.item.estimatedTime,
      50
    );
    byId("focusNextButton").disabled = false;
  }

  function appendTextList(parent, title, values) {
    const items = asArray(values).map((value) => clean(value, 500)).filter(Boolean);
    if (!items.length) return;
    const section = make("section");
    section.append(make("h4", title));
    const list = make("ul");
    items.forEach((value) => list.append(make("li", value)));
    section.append(list);
    parent.append(section);
  }

  function appendSources(parent, sources) {
    const valid = asArray(sources)
      .map((source) => ({
        title: clean(source?.title, 140),
        url: safeExternalUrl(source?.url)
      }))
      .filter((source) => source.title && source.url);
    if (!valid.length) return;
    const list = make("ul", null, "source-list");
    valid.forEach((source) => {
      const item = make("li");
      const anchor = make("a", source.title);
      anchor.href = source.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      item.append(anchor);
      list.append(item);
    });
    const section = make("section");
    section.append(make("h4", "Fontes oficiais"), list);
    parent.append(section);
  }

  function renderCard(item) {
    const card = make("article", null, "roadmap-card");
    card.dataset.status = item.status;
    card.dataset.actor = item.actor;
    card.dataset.itemId = item.id;

    const top = make("div", null, "card-top");
    const titleBox = make("div");
    titleBox.append(
      make("p", clean(item.phase || item.priorityLabel || "Próxima etapa", 80), "eyebrow"),
      make("h3", clean(item.title, 180)),
      make("p", clean(item.summary || "", 600))
    );
    top.append(titleBox);
    card.append(top);

    const badges = make("div", null, "badge-row");
    badges.append(
      make("span", STATUS_LABELS[item.status], `badge status-${item.status}`),
      make("span", ACTOR_LABELS[item.actor], "badge"),
      make("span", clean(item.estimatedTime, 50), "badge")
    );
    card.append(badges);

    const microList = make("div", null, "micro-list");
    asArray(item.microActions).forEach((action) => {
      const row = make("label", null, "micro-action");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = isComplete(action.id);
      checkbox.disabled = item.status === "live";
      checkbox.dataset.actionId = action.id;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.progress.completed[action.id] = true;
        } else {
          delete state.progress.completed[action.id];
        }
        row.classList.toggle("is-complete", checkbox.checked);
        saveProgress();
        applyFilter();
      });
      const textBox = make("span", null, "micro-copy");
      textBox.append(
        make("span", clean(action.label, 300)),
        make(
          "small",
          `Pronto quando: ${clean(action.completionCriterion, 500)}`,
          "micro-criterion"
        )
      );
      const time = make(
        "small",
        clean(action.estimatedTime || item.estimatedTime, 50)
      );
      row.classList.toggle("is-complete", checkbox.checked);
      row.append(checkbox, textBox, time);
      microList.append(row);
    });
    card.append(microList);

    const details = document.createElement("details");
    details.append(make("summary", "Ver critério, dependências e cuidados"));
    const detailGrid = make("div", null, "detail-grid");
    appendTextList(detailGrid, "Depende do proprietário", item.ownerSteps);
    appendTextList(detailGrid, "Codex executa depois", item.codexSteps);
    appendTextList(
      detailGrid,
      "Critérios de conclusão",
      item.completionCriteria
    );
    const dependencies = asArray(item.dependsOn);
    if (dependencies.length) {
      appendTextList(detailGrid, "Dependências", dependencies);
    }
    const doNotShare = asArray(item.doNotShare);
    if (doNotShare.length) {
      const warning = make("section");
      warning.append(make("h4", "Nunca compartilhar", "warning"));
      const list = make("ul");
      doNotShare.forEach((value) =>
        list.append(make("li", clean(value, 300), "warning"))
      );
      warning.append(list);
      detailGrid.append(warning);
    }
    appendSources(detailGrid, item.sources);
    details.append(detailGrid);
    card.append(details);
    return card;
  }

  function renderRoadmap() {
    const list = byId("roadmapList");
    list.replaceChildren();
    roadmapItems().forEach((item) => list.append(renderCard(item)));
    list.setAttribute("aria-busy", "false");
    byId("loadStatus").textContent =
      "Plano carregado. O filtro “Agora” mostra ações prontas ou dependentes de você.";
    byId("missionStatusTitle").textContent =
      clean(state.roadmap.title || "Roadmap operacional carregado", 180);
    updateProgressSummary();
    updateNextAction();
    applyFilter();
    ["copyReturnButton", "exportButton", "resetButton"].forEach((id) => {
      byId(id).disabled = false;
    });
  }

  function itemMatchesFilter(card) {
    const item = roadmapItems().find(
      (candidate) => candidate.id === card.dataset.itemId
    );
    if (!item) return false;
    if (state.filter === "all") return true;
    if (state.filter === "now") {
      return ["owner-action", "ready"].includes(item.status);
    }
    if (state.filter === "owner") {
      return ["owner", "joint"].includes(item.actor) && item.status !== "live";
    }
    if (state.filter === "codex") {
      return ["codex", "joint"].includes(item.actor) && item.status !== "live";
    }
    if (state.filter === "done") {
      const actions = asArray(item.microActions);
      return item.status === "live" || (
        actions.length > 0 && actions.every((action) => isComplete(action.id))
      );
    }
    return true;
  }

  function applyFilter() {
    const cards = [...byId("roadmapList").querySelectorAll(".roadmap-card")];
    let visible = 0;
    cards.forEach((card) => {
      card.hidden = !itemMatchesFilter(card);
      if (!card.hidden) visible += 1;
    });
    const oldEmpty = byId("roadmapList").querySelector(".empty-state");
    oldEmpty?.remove();
    if (!visible && cards.length) {
      byId("roadmapList").append(
        make(
          "p",
          "Nenhuma etapa corresponde a este filtro. Marque menos caixas ou escolha “Tudo”.",
          "empty-state"
        )
      );
    }
  }

  function returnPayload() {
    const completedIds = Object.keys(state.progress.completed).sort();
    const remainingOwner = roadmapItems()
      .filter((item) =>
        ["owner", "joint"].includes(item.actor) &&
        item.status !== "live" &&
        asArray(item.microActions).some((action) => !isComplete(action.id))
      )
      .map((item) => item.id);
    return {
      schemaVersion: "antigravity-safe-handoff-v1",
      roadmapVersion: clean(state.roadmap?.updatedAt, 40),
      completedMicroActionIds: completedIds,
      remainingOwnerItemIds: remainingOwner,
      containsSecrets: false,
      note: "Progresso local autodeclarado; exige confirmação e homologação."
    };
  }

  function returnText() {
    const payload = returnPayload();
    return [
      "ANTIGRAVITY — RETORNO SEGURO DA CENTRAL DE ATIVAÇÃO",
      `Roadmap: ${payload.roadmapVersion || "não informado"}`,
      `Microações marcadas: ${payload.completedMicroActionIds.join(", ") || "nenhuma"}`,
      `Etapas minhas ainda abertas: ${payload.remainingOwnerItemIds.join(", ") || "nenhuma"}`,
      "Confirmo: não incluí senha, token, chave secreta, service_role ou dado de paciente.",
      "Observação: as marcações são locais e ainda precisam de verificação."
    ].join("\n");
  }

  async function copyReturn() {
    try {
      await navigator.clipboard.writeText(returnText());
      byId("loadStatus").textContent =
        "Retorno seguro copiado. Revise antes de enviar ao Codex.";
    } catch (_error) {
      byId("loadStatus").textContent =
        "O navegador bloqueou a cópia. Use “Exportar progresso”.";
    }
  }

  function exportProgress() {
    const content = JSON.stringify(returnPayload(), null, 2) + "\n";
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "antigravity-retorno-seguro.json";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    byId("loadStatus").textContent =
      "Arquivo local gerado sem segredos ou campos livres.";
  }

  function resetProgress() {
    if (!window.confirm("Apagar somente as marcações locais desta Central?")) {
      return;
    }
    state.progress = { schemaVersion: "1.0.0", completed: {}, updatedAt: null };
    safeRemove(PROGRESS_KEY);
    renderRoadmap();
    byId("loadStatus").textContent = "Progresso local apagado.";
  }

  function formatTimer() {
    const minutes = Math.floor(state.timerRemaining / 60);
    const seconds = state.timerRemaining % 60;
    byId("focusTimer").textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = 0;
    }
    byId("timerStartButton").disabled = false;
    byId("timerPauseButton").disabled = true;
  }

  function startTimer() {
    if (state.timerId || state.timerRemaining <= 0) return;
    byId("timerStartButton").disabled = true;
    byId("timerPauseButton").disabled = false;
    state.timerId = window.setInterval(() => {
      state.timerRemaining -= 1;
      formatTimer();
      if (state.timerRemaining <= 0) {
        stopTimer();
        byId("focusActionText").textContent =
          "Tempo encerrado. Pare, respire e registre apenas o que realmente concluiu.";
      }
    }, 1000);
  }

  function resetTimer() {
    stopTimer();
    state.timerRemaining = 15 * 60;
    formatTimer();
  }

  function openFocus() {
    if (!state.focus) return;
    resetTimer();
    byId("focusTaskTitle").textContent = clean(state.focus.item.title, 180);
    byId("focusActionText").textContent = clean(
      state.focus.action.label,
      300
    );
    byId("focusPanel").hidden = false;
    byId("focusPanel").scrollIntoView({ behavior: "smooth", block: "center" });
    byId("timerStartButton").focus();
  }

  function closeFocus() {
    stopTimer();
    byId("focusPanel").hidden = true;
    byId("focusNextButton").focus();
  }

  function applyTheme(mode) {
    const theme = mode === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    const button = byId("themeButton");
    button.textContent = theme === "light" ? "🌙 Escuro" : "☀️ Claro";
    button.setAttribute("aria-pressed", String(theme === "light"));
    button.setAttribute(
      "aria-label",
      theme === "light"
        ? "Ativar visualização escura"
        : "Ativar visualização clara"
    );
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "light" ? "#f4f8fc" : "#061526");
  }

  function toggleTheme() {
    const next =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";
    const current = safeRead(A11Y_KEY, {});
    const updated = current && typeof current === "object" ? { ...current } : {};
    updated.theme = next;
    safeWrite(A11Y_KEY, updated);
    applyTheme(next);
  }

  function bindEvents() {
    document.querySelectorAll(".filter-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter || "all";
        document.querySelectorAll(".filter-button").forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle("is-active", active);
          candidate.setAttribute("aria-pressed", String(active));
        });
        applyFilter();
      });
    });
    byId("focusNextButton").addEventListener("click", openFocus);
    byId("closeFocusButton").addEventListener("click", closeFocus);
    byId("timerStartButton").addEventListener("click", startTimer);
    byId("timerPauseButton").addEventListener("click", stopTimer);
    byId("timerResetButton").addEventListener("click", resetTimer);
    byId("copyReturnButton").addEventListener("click", copyReturn);
    byId("exportButton").addEventListener("click", exportProgress);
    byId("resetButton").addEventListener("click", resetProgress);
    byId("printButton").addEventListener("click", () => window.print());
    byId("themeButton").addEventListener("click", toggleTheme);
  }

  async function loadRoadmap() {
    try {
      const response = await fetch(ROADMAP_URL, {
        cache: "no-store",
        credentials: "same-origin",
        referrerPolicy: "no-referrer"
      });
      if (!response.ok) throw new Error("Roadmap público indisponível.");
      const payload = validateRoadmap(await response.json());
      state.roadmap = payload;
      renderRoadmap();
    } catch (error) {
      byId("roadmapList").setAttribute("aria-busy", "false");
      byId("loadStatus").textContent =
        `${clean(error.message, 180)} Use o guia textual e tente novamente.`;
      byId("roadmapList").append(
        make(
          "p",
          "Nenhuma ação foi simulada. O estado continua fail-closed.",
          "empty-state"
        )
      );
      byId("missionStatusTitle").textContent = "Roadmap não verificado";
    }
  }

  function init() {
    const savedA11y = safeRead(A11Y_KEY, {});
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(
      savedA11y.theme === "light" ||
      (savedA11y.theme === "system" && prefersLight)
        ? "light"
        : "dark"
    );
    state.progress = normalizeProgress(safeRead(PROGRESS_KEY, {}));
    bindEvents();
    loadRoadmap();
  }

  init();
})();
