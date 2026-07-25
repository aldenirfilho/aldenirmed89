(function () {
  "use strict";

  const data = window.ANTIGRAVITY_CRITICAL_MODULE || window.ANTIGRAVITY_HEMATOLOGY;
  if (!data) {
    document.body.innerHTML = "<p>Catálogo do módulo crítico não carregado.</p>";
    return;
  }

  const storagePrefix = data.meta.storagePrefix || "critical-module";
  const storageKey = (suffix) => `${storagePrefix}-${suffix}`;
  const sprintSeconds = Number(data.meta.sprintSeconds) || 720;

  const storage = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        /* Preferências locais são opcionais. */
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (_) {
        /* Sem efeito clínico. */
      }
    }
  };

  const state = {
    category: "all",
    search: "",
    openEmergency: null,
    comparison: data.comparisons[0]?.id || null,
    flashIndex: 0,
    flashRevealed: false,
    caseIndex: 0,
    reviewed: new Set(storage.get(storageKey("reviewed"), [])),
    answeredCases: new Set(storage.get(storageKey("cases"), [])),
    answeredQuestions: new Set(storage.get(storageKey("questions"), [])),
    questionIndex: 0,
    timerSeconds: Number(storage.get(storageKey("timer-seconds"), sprintSeconds)) || sprintSeconds,
    timerRunning: false,
    timerId: null
  };

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function list(items) {
    return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
  }

  function getReference(id) {
    return data.references.find((item) => item.id === id);
  }

  function initTheme() {
    const preferred = storage.get(storageKey("theme"), null);
    if (preferred === "light" || preferred === "dark") {
      document.documentElement.dataset.theme = preferred;
    }

    $("#themeToggle")?.addEventListener("click", toggleTheme);
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    storage.set(storageKey("theme"), next);
  }

  function initFocusMode() {
    const button = $("#focusToggle");
    if (!button) return;

    button.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("focus-mode");
      button.setAttribute("aria-pressed", String(enabled));
      if (enabled) $("#plantao")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderDiagnosticTracks() {
    const container = $("#syndromeButtons");
    if (!container) return;

    container.innerHTML = data.diagnosticTracks.map((track) => `
      <button class="syndrome-button" type="button" data-track="${esc(track.id)}">
        <span aria-hidden="true">${esc(track.icon)}</span>
        <b>${esc(track.title)}</b>
      </button>
    `).join("");

    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-track]");
      if (!button) return;
      const track = data.diagnosticTracks.find((item) => item.id === button.dataset.track);
      if (!track) return;

      $$(".syndrome-button", container).forEach((item) => item.classList.toggle("active", item === button));
      renderTrackPanel(track);
    });
  }

  function renderTrackPanel(track) {
    const panel = $("#syndromePanel");
    if (!panel) return;

    const related = track.related
      .map((id) => data.emergencies.find((item) => item.id === id))
      .filter(Boolean);

    panel.innerHTML = `
      <span class="kicker">${esc(track.icon)} padrão dominante</span>
      <h3>${esc(track.title)}</h3>
      <p>${esc(track.subtitle)}</p>
      <div class="action-grid">
        <div class="action-box">
          <strong>1 · Priorize</strong>
          ${list(track.priority)}
        </div>
        <div class="action-box">
          <strong>2 · Colete sem atrasar</strong>
          ${list(track.collect)}
        </div>
      </div>
      <div class="danger-line"><b>Armadilha:</b> ${esc(track.avoid)}</div>
      <div class="card-tags" aria-label="Cards relacionados">
        ${related.map((item) => `<button class="filter-button" type="button" data-open-related="${esc(item.id)}">${esc(item.icon)} ${esc(item.title)}</button>`).join("")}
      </div>
    `;

    $$("[data-open-related]", panel).forEach((button) => {
      button.addEventListener("click", () => {
        state.category = "all";
        state.search = "";
        state.openEmergency = button.dataset.openRelated;
        const search = $("#emergencySearch");
        if (search) search.value = "";
        renderEmergencyFilters();
        renderEmergencies();
        focusEmergencyDetail(state.openEmergency);
      });
    });
  }

  function renderEmergencyFilters() {
    const container = $("#categoryFilters");
    if (!container) return;

    container.innerHTML = data.categories.map((category) => `
      <button
        class="filter-button${state.category === category.id ? " active" : ""}"
        type="button"
        data-category="${esc(category.id)}"
        aria-pressed="${state.category === category.id ? "true" : "false"}"
      >${esc(category.label)}</button>
    `).join("");
  }

  function emergencySearchText(item) {
    return normalize([
      item.title,
      item.summary,
      item.trigger,
      item.category,
      ...item.tags,
      ...item.firstHour,
      ...item.decisive,
      ...item.doNot,
      item.pearl
    ].join(" "));
  }

  function filteredEmergencies() {
    const query = normalize(state.search);
    return data.emergencies.filter((item) => {
      const categoryMatch = state.category === "all" || item.category === state.category;
      const searchMatch = !query || emergencySearchText(item).includes(query);
      return categoryMatch && searchMatch;
    });
  }

  function renderEmergencyCard(item) {
    const detailId = `emergency-detail-${item.id}`;
    return `
      <article class="emergency-card" role="listitem" data-emergency-card="${esc(item.id)}" data-category="${esc(item.category)}">
        <div class="card-head">
          <span class="card-icon" aria-hidden="true">${esc(item.icon)}</span>
          <span class="urgency">${esc(item.urgency)}</span>
        </div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.summary)}</p>
        <div class="card-trigger"><b>Dispare com:</b> ${esc(item.trigger)}</div>
        <div class="card-tags">${item.tags.slice(0, 3).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</div>
        <button
          class="card-open"
          type="button"
          data-open-emergency="${esc(item.id)}"
          aria-expanded="${state.openEmergency === item.id ? "true" : "false"}"
          aria-controls="${esc(detailId)}"
        >
          <span>${state.openEmergency === item.id ? "Fechar conduta" : "Abrir primeira hora"}</span><span aria-hidden="true">${state.openEmergency === item.id ? "↑" : "→"}</span>
        </button>
      </article>
    `;
  }

  function renderEmergencyDetail(item) {
    const references = item.referenceIds.map(getReference).filter(Boolean);
    const detailId = `emergency-detail-${item.id}`;
    const titleId = `${detailId}-title`;
    return `
      <article
        class="card-detail"
        id="${esc(detailId)}"
        data-emergency-detail="${esc(item.id)}"
        role="region"
        aria-labelledby="${esc(titleId)}"
        tabindex="-1"
      >
        <div class="detail-head">
          <div>
            <span class="kicker">${esc(item.icon)} ${esc(item.urgency)} · apoio cognitivo</span>
            <h3 id="${esc(titleId)}">${esc(item.title)}</h3>
            <p>${esc(item.pearl)}</p>
          </div>
          <button class="detail-close" type="button" aria-label="Fechar detalhes">×</button>
        </div>
        <div class="detail-grid">
          <section class="detail-block">
            <h4>Primeira hora</h4>
            ${list(item.firstHour)}
          </section>
          <section class="detail-block">
            <h4>Exames que mudam decisão</h4>
            ${list(item.decisive)}
          </section>
          <section class="detail-block">
            <h4>Não faça automaticamente</h4>
            ${list(item.doNot)}
          </section>
        </div>
        <div class="detail-pitfall">
          <b>📚 Fontes:</b>
          ${references.map((ref) => `<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.group)} ${esc(ref.year)}</a>`).join(" · ")}
          <br><b>🛡️ Gate:</b> ${esc(data.meta.specialistGate || "adaptar ao protocolo institucional e confirmar com a equipe especialista.")}
        </div>
      </article>
    `;
  }

  function emergencyTrigger(id, root) {
    return $$("[data-open-emergency]", root).find((button) => button.dataset.openEmergency === id);
  }

  function focusEmergencyDetail(id) {
    if (!id) return;
    window.requestAnimationFrame(() => {
      const detail = document.getElementById(`emergency-detail-${id}`);
      if (!detail) return;
      detail.focus({ preventScroll: true });
      detail.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function focusEmergencyTrigger(id) {
    if (!id) return;
    window.requestAnimationFrame(() => emergencyTrigger(id, $("#emergencyGrid"))?.focus());
  }

  function closeEmergency(id) {
    state.openEmergency = null;
    renderEmergencies();
    focusEmergencyTrigger(id);
  }

  function renderEmergencies() {
    const grid = $("#emergencyGrid");
    const noResults = $("#noResults");
    const count = $("#visibleCount");
    if (!grid) return;

    const items = filteredEmergencies();
    if (count) count.textContent = String(items.length);
    if (noResults) noResults.hidden = items.length > 0;

    if (state.openEmergency && !items.some((item) => item.id === state.openEmergency)) {
      state.openEmergency = null;
    }

    grid.innerHTML = "";
    items.forEach((item) => {
      grid.insertAdjacentHTML("beforeend", renderEmergencyCard(item));
      if (state.openEmergency === item.id) {
        grid.insertAdjacentHTML("beforeend", renderEmergencyDetail(item));
      }
    });

    $$("[data-open-emergency]", grid).forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.openEmergency;
        const closing = state.openEmergency === id;
        state.openEmergency = closing ? null : id;
        renderEmergencies();
        if (closing) focusEmergencyTrigger(id);
        else focusEmergencyDetail(id);
      });
    });

    $(".detail-close", grid)?.addEventListener("click", () => {
      closeEmergency(state.openEmergency);
    });

    const detail = state.openEmergency
      ? document.getElementById(`emergency-detail-${state.openEmergency}`)
      : null;
    detail?.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeEmergency(state.openEmergency);
    });
  }

  function initEmergencySearch() {
    const filters = $("#categoryFilters");
    const input = $("#emergencySearch");

    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      state.openEmergency = null;
      renderEmergencyFilters();
      renderEmergencies();
    });

    input?.addEventListener("input", () => {
      state.search = input.value;
      state.openEmergency = null;
      renderEmergencies();
    });
  }

  function renderComparisonTabs() {
    const container = $("#comparisonTabs");
    if (!container) return;

    container.innerHTML = data.comparisons.map((item, index) => `
      <button
        id="comparison-tab-${esc(item.id)}"
        class="${state.comparison === item.id ? "active" : ""}"
        type="button"
        role="tab"
        aria-selected="${state.comparison === item.id ? "true" : "false"}"
        aria-controls="comparisonPanel"
        data-comparison="${esc(item.id)}"
        tabindex="${state.comparison === item.id || (!state.comparison && index === 0) ? "0" : "-1"}"
      >${esc(item.label)}</button>
    `).join("");

    const activate = (button, moveFocus) => {
      state.comparison = button.dataset.comparison;
      $$("[data-comparison]", container).forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });
      renderComparison();
      if (moveFocus) button.focus();
    };

    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-comparison]");
      if (!button) return;
      activate(button, false);
    });

    container.addEventListener("keydown", (event) => {
      const button = event.target.closest("[data-comparison]");
      if (!button) return;
      const buttons = $$("[data-comparison]", container);
      const index = buttons.indexOf(button);
      let nextIndex = index;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = buttons.length - 1;
      else return;

      event.preventDefault();
      activate(buttons[nextIndex], true);
    });
  }

  function renderComparison() {
    const panel = $("#comparisonPanel");
    const item = data.comparisons.find((comparison) => comparison.id === state.comparison) || data.comparisons[0];
    if (!panel || !item) return;

    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");
    panel.setAttribute("aria-labelledby", `comparison-tab-${item.id}`);
    panel.innerHTML = `
      <div class="comparison-intro">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.intro)}</p>
      </div>
      <div class="table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th scope="col">Discriminador</th>
              ${item.columns.map((column) => `<th scope="col">${esc(column)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${item.rows.map((row) => `
              <tr>
                <th scope="row">${esc(row.label)}</th>
                ${row.values.map((value) => `<td>${esc(value)}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="comparison-pearl"><b>💡 Pérola:</b> ${esc(item.pearl)}</div>
    `;
  }

  function initPlasmic() {
    const form = $("#plasmicForm");
    if (!form) return;

    const update = () => {
      const score = $$('input[name="plasmic"]:checked', form).length;
      const result = $("#plasmicResult");
      if (!result) return;

      let label = "Baixa probabilidade (0–4)";
      let note = "PTT não é impossível; reavalie contexto e alternativas.";
      if (score === 5) {
        label = "Probabilidade intermediária (5)";
        note = "Exige integração clínica, ADAMTS13 e discussão urgente.";
      } else if (score >= 6) {
        label = "Alta probabilidade (6–7)";
        note = "Acione o fluxo de PTT; não espere ADAMTS13 se a suspeita clínica for alta.";
      }

      result.innerHTML = `
        <span>ESCORE</span>
        <strong>${score}/7</strong>
        <p><b>${esc(label)}</b><br>${esc(note)}</p>
      `;
    };

    form.addEventListener("change", update);
    form.addEventListener("reset", () => window.setTimeout(update, 0));
  }

  function renderConcepts() {
    const container = $("#conceptGrid");
    if (!container || !Array.isArray(data.concepts)) return;

    container.innerHTML = data.concepts.map((item) => `
      <article class="learning-card concept-card">
        <span class="learning-icon" aria-hidden="true">${esc(item.icon || "🧠")}</span>
        <div>
          <span class="kicker">${esc(item.label || "conceito")}</span>
          <h3>${esc(item.term)}</h3>
          <p>${esc(item.definition)}</p>
          <div class="learning-pearl"><b>Aplicação:</b> ${esc(item.application)}</div>
        </div>
      </article>
    `).join("");
  }

  function renderMnemonics() {
    const container = $("#mnemonicGrid");
    if (!container || !Array.isArray(data.mnemonics)) return;

    container.innerHTML = data.mnemonics.map((item) => `
      <article class="learning-card mnemonic-card">
        <span class="mnemonic-code">${esc(item.code)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.expansion)}</p>
        <div class="learning-pearl"><b>Use quando:</b> ${esc(item.use)}</div>
        <small>⚠️ ${esc(item.limit)}</small>
      </article>
    `).join("");
  }

  function renderAlerts() {
    const container = $("#alertGrid");
    if (!container || !Array.isArray(data.alerts)) return;

    container.innerHTML = data.alerts.map((item) => `
      <article class="alert-card alert-${esc(item.level || "yellow")}">
        <span aria-hidden="true">${esc(item.icon || "⚠️")}</span>
        <div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.message)}</p>
          <b>${esc(item.action)}</b>
        </div>
      </article>
    `).join("");
  }

  function calculatorResult(item, form) {
    const requirements = (item.requirements || []).map((requirement) => ({
      requirement,
      met: Boolean(form.querySelector(`[name="requirement-${CSS.escape(requirement.id)}"]`)?.checked)
    }));
    const missing = requirements.filter((entry) => !entry.met).map((entry) => entry.requirement.label);
    const selections = $$("select[data-score-group]", form);
    const score = selections.reduce((total, select) => total + Number(select.value || 0), 0);
    const allSelected = selections.every((select) => select.value !== "");
    const range = (item.ranges || []).find((entry) => score >= entry.min && score <= entry.max);

    if (missing.length) {
      return {
        score,
        label: "Pré-requisito não preenchido",
        note: `Não interprete o escore. Falta: ${missing.join("; ")}.`
      };
    }
    if (!allSelected) {
      return { score, label: "Complete os domínios", note: "Escolha uma opção em cada domínio antes de interpretar." };
    }
    return {
      score,
      label: range?.label || "Fora da faixa configurada",
      note: range?.note || item.warning
    };
  }

  function renderCalculator(item) {
    const host = $("#calculatorPanel");
    if (!host || !item) return;

    host.innerHTML = `
      <div class="calculator-head">
        <div>
          <span class="kicker">${esc(item.kind || "ferramenta educacional")}</span>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.description)}</p>
        </div>
        <span class="purpose-badge">${esc(item.purpose || "apoio")}</span>
      </div>
      <div class="calculator-warning"><b>⚠️ Limite:</b> ${esc(item.warning)}</div>
      <form class="generic-calculator" id="activeCalculator">
        ${(item.requirements || []).length ? `
          <fieldset class="requirement-list">
            <legend>Pré-requisitos de uso</legend>
            ${(item.requirements || []).map((requirement) => `
              <label><input type="checkbox" name="requirement-${esc(requirement.id)}"> ${esc(requirement.label)}</label>
            `).join("")}
          </fieldset>
        ` : ""}
        <div class="score-domain-grid">
          ${(item.groups || []).map((group) => `
            <label class="score-domain">
              <span>${esc(group.label)}</span>
              <select data-score-group="${esc(group.id)}">
                <option value="">Selecione…</option>
                ${group.options.map((option) => `<option value="${esc(option.points)}">${esc(option.label)} (${Number(option.points) >= 0 ? "+" : ""}${esc(option.points)})</option>`).join("")}
              </select>
            </label>
          `).join("")}
        </div>
        <div class="calculator-result" id="calculatorResult" aria-live="polite">
          <span>RESULTADO EDUCACIONAL</span>
          <strong>—</strong>
          <p>Preencha os campos para interpretar a ferramenta.</p>
        </div>
        <button class="text-button" type="reset">Limpar ferramenta</button>
      </form>
    `;

    const form = $("#activeCalculator", host);
    const update = () => {
      const result = calculatorResult(item, form);
      const box = $("#calculatorResult", host);
      if (!box) return;
      box.innerHTML = `
        <span>${esc(item.resultLabel || "ESCORE")}</span>
        <strong>${esc(result.score)}</strong>
        <p><b>${esc(result.label)}</b><br>${esc(result.note)}</p>
      `;
    };
    form?.addEventListener("change", update);
    form?.addEventListener("reset", () => window.setTimeout(() => renderCalculator(item), 0));
  }

  function renderCalculatorTabs() {
    const tabs = $("#calculatorTabs");
    if (!tabs || !Array.isArray(data.calculators) || !data.calculators.length) return;

    tabs.innerHTML = data.calculators.map((item, index) => `
      <button class="${index === 0 ? "active" : ""}" type="button" data-calculator="${esc(item.id)}" aria-pressed="${index === 0 ? "true" : "false"}">${esc(item.shortTitle || item.title)}</button>
    `).join("");

    tabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-calculator]");
      if (!button) return;
      $$("[data-calculator]", tabs).forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderCalculator(data.calculators.find((item) => item.id === button.dataset.calculator));
    });
    renderCalculator(data.calculators[0]);
  }

  function renderQuestion() {
    const item = data.questions?.[state.questionIndex];
    const stage = $("#questionStage");
    if (!item || !stage) return;

    stage.innerHTML = `
      <span class="kicker">questão ${state.questionIndex + 1} de ${data.questions.length} · ${esc(item.domain || "TEMI")}</span>
      <h3>${esc(item.prompt)}</h3>
      <div class="case-options">
        ${item.options.map((option, index) => `
          <button class="case-option" type="button" data-question-option="${index}">${String.fromCharCode(65 + index)}. ${esc(option)}</button>
        `).join("")}
      </div>
      <div class="case-feedback" hidden></div>
    `;
    $("#questionPosition").textContent = `${state.questionIndex + 1}/${data.questions.length}`;
    $$("[data-question-option]", stage).forEach((button) => {
      button.addEventListener("click", () => answerQuestion(item, button));
    });
  }

  function answerQuestion(item, selectedButton) {
    const index = Number(selectedButton.dataset.questionOption);
    const buttons = $$("[data-question-option]", $("#questionStage"));
    buttons.forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === item.correct) button.classList.add("correct");
      else if (button === selectedButton) button.classList.add("incorrect");
    });

    const feedback = $(".case-feedback", $("#questionStage"));
    if (feedback) {
      feedback.hidden = false;
      feedback.innerHTML = `
        <b>${index === item.correct ? "✅ Correto." : "❌ Resposta incorreta."}</b>
        ${esc(item.explanation)}
        <br><b>🎯 Regra de prova:</b> ${esc(item.rule)}
      `;
    }
    state.answeredQuestions.add(item.id);
    saveProgress();
  }

  function moveQuestion(delta) {
    state.questionIndex = (state.questionIndex + delta + data.questions.length) % data.questions.length;
    renderQuestion();
  }

  function initQuestions() {
    if (!Array.isArray(data.questions) || !data.questions.length) return;
    $("#questionPrev")?.addEventListener("click", () => moveQuestion(-1));
    $("#questionNext")?.addEventListener("click", () => moveQuestion(1));
    renderQuestion();
  }

  function saveProgress() {
    storage.set(storageKey("reviewed"), Array.from(state.reviewed));
    storage.set(storageKey("cases"), Array.from(state.answeredCases));
    storage.set(storageKey("questions"), Array.from(state.answeredQuestions));
    updateProgress();
  }

  function updateProgress() {
    const total = data.flashcards.length + data.cases.length + (data.questions?.length || 0);
    const done = state.reviewed.size + state.answeredCases.size + state.answeredQuestions.size;
    const label = $("#progressLabel");
    const bar = $("#progressBar");
    if (label) label.textContent = `${done} de ${total} revisões`;
    if (bar) {
      bar.max = total;
      bar.value = done;
      bar.textContent = `${total ? Math.round((done / total) * 100) : 0}%`;
    }
  }

  function renderFlashcard() {
    const item = data.flashcards[state.flashIndex];
    if (!item) return;

    $("#flashcardPrompt").textContent = item.prompt;
    $("#flashcardAnswer").textContent = item.answer;
    $("#flashcardAnswer").hidden = !state.flashRevealed;
    $("#flashcardHint").textContent = state.flashRevealed
      ? "Resposta revelada · avance quando conseguir explicar em voz alta"
      : "Clique ou pressione Enter para revelar";
    $("#flashPosition").textContent = `${state.flashIndex + 1}/${data.flashcards.length}`;
    $(".flashcard-label").textContent = state.flashRevealed ? "RESPOSTA" : "PERGUNTA";
  }

  function revealFlashcard() {
    if (state.flashRevealed) return;
    const item = data.flashcards[state.flashIndex];
    state.flashRevealed = true;
    if (item) state.reviewed.add(item.id);
    saveProgress();
    renderFlashcard();
  }

  function moveFlashcard(delta) {
    state.flashIndex = (state.flashIndex + delta + data.flashcards.length) % data.flashcards.length;
    state.flashRevealed = false;
    renderFlashcard();
  }

  function initFlashcards() {
    const card = $("#flashcard");
    card?.addEventListener("click", revealFlashcard);
    card?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        revealFlashcard();
      }
    });
    $("#flashPrev")?.addEventListener("click", () => moveFlashcard(-1));
    $("#flashNext")?.addEventListener("click", () => moveFlashcard(1));
    renderFlashcard();
  }

  function renderCase() {
    const item = data.cases[state.caseIndex];
    const stage = $("#caseStage");
    if (!item || !stage) return;

    stage.innerHTML = `
      <span class="kicker">caso ${state.caseIndex + 1} de ${data.cases.length}</span>
      <h3>${esc(item.title)}</h3>
      <p class="case-vignette">${esc(item.vignette)}</p>
      <div class="case-options">
        ${item.options.map((option, index) => `
          <button class="case-option" type="button" data-case-option="${index}">${String.fromCharCode(65 + index)}. ${esc(option)}</button>
        `).join("")}
      </div>
      <div class="case-feedback" hidden></div>
    `;
    $("#casePosition").textContent = `${state.caseIndex + 1}/${data.cases.length}`;

    $$("[data-case-option]", stage).forEach((button) => {
      button.addEventListener("click", () => answerCase(item, button));
    });
  }

  function answerCase(item, selectedButton) {
    const index = Number(selectedButton.dataset.caseOption);
    const buttons = $$("[data-case-option]", $("#caseStage"));
    buttons.forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === item.correct) button.classList.add("correct");
      else if (button === selectedButton) button.classList.add("incorrect");
    });

    const feedback = $(".case-feedback", $("#caseStage"));
    if (feedback) {
      feedback.hidden = false;
      feedback.innerHTML = `
        <b>${index === item.correct ? "✅ Correto." : "❌ Reveja o mecanismo."}</b>
        ${esc(item.explanation)}
        <br><b>💡 ${esc(item.pearl)}</b>
      `;
    }

    state.answeredCases.add(item.id);
    saveProgress();
  }

  function moveCase(delta) {
    state.caseIndex = (state.caseIndex + delta + data.cases.length) % data.cases.length;
    renderCase();
  }

  function initCases() {
    $("#casePrev")?.addEventListener("click", () => moveCase(-1));
    $("#caseNext")?.addEventListener("click", () => moveCase(1));
    renderCase();
  }

  function initStudyTabs() {
    const buttons = $$("[data-study-tab]");
    const activate = (button) => {
      const target = button.dataset.studyTab;
      buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", String(active));
          item.tabIndex = active ? 0 : -1;
      });
      $$("[data-study-pane]").forEach((pane) => {
        const active = pane.dataset.studyPane === target;
        pane.classList.toggle("active", active);
        pane.hidden = !active;
      });
    };

    buttons.forEach((button, index) => {
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener("click", () => activate(button));
      button.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = buttons.length - 1;
        else return;

        event.preventDefault();
        const next = buttons[nextIndex];
        activate(next);
        next.focus();
      });
    });
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function renderTimer() {
    const timer = $("#timer");
    if (timer) {
      const formatted = formatTime(state.timerSeconds);
      timer.textContent = formatted;
      timer.setAttribute("aria-label", `Tempo restante: ${formatted}`);
    }
    const button = $("#timerStart");
    if (button) {
      button.textContent = state.timerRunning ? "Ⅱ Pausar" : "▶ Iniciar";
      button.setAttribute("aria-pressed", String(state.timerRunning));
    }
  }

  function announceTimer(message) {
    const status = $("#timerStatus");
    if (status) status.textContent = message;
  }

  function stopTimer(message) {
    state.timerRunning = false;
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
    renderTimer();
    if (message) announceTimer(message);
  }

  function toggleTimer() {
    if (state.timerRunning) {
      stopTimer(`Sprint pausado com ${formatTime(state.timerSeconds)} restantes.`);
      return;
    }

    if (state.timerSeconds <= 0) state.timerSeconds = sprintSeconds;
    state.timerRunning = true;
    renderTimer();
    announceTimer(`Sprint iniciado com ${formatTime(state.timerSeconds)}.`);
    state.timerId = window.setInterval(() => {
      state.timerSeconds -= 1;
      storage.set(storageKey("timer-seconds"), state.timerSeconds);
      renderTimer();
      if (state.timerSeconds <= 0) {
        stopTimer("Sprint concluído. Explique agora a síndrome em 30 segundos.");
      }
    }, 1000);
  }

  function resetTimer() {
    stopTimer();
    state.timerSeconds = sprintSeconds;
    storage.remove(storageKey("timer-seconds"));
    renderTimer();
    announceTimer(`Cronômetro reiniciado para ${formatTime(sprintSeconds)}.`);
  }

  function initTimer() {
    $("#timerStart")?.addEventListener("click", toggleTimer);
    $("#timerReset")?.addEventListener("click", resetTimer);
    renderTimer();
  }

  function renderReferences() {
    const container = $("#referenceGrid");
    if (!container) return;

    container.innerHTML = data.references.map((item) => `
      <a class="reference-card" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">
        <span>${esc(item.group)} · ${esc(item.year)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.note)}</p>
        <b>Abrir fonte ↗</b>
      </a>
    `).join("");
  }

  function initBackTop() {
    const button = $("#backTop");
    if (!button) return;
    const update = () => button.classList.toggle("visible", window.scrollY > 700);
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    update();
  }

  function initKeyboard() {
    document.addEventListener("keydown", (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        $("#emergencySearch")?.focus();
        return;
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === "f") $("#focusToggle")?.click();
      if (event.key.toLowerCase() === "t") toggleTheme();
    });
  }

  function init() {
    initTheme();
    initFocusMode();
    renderDiagnosticTracks();
    renderEmergencyFilters();
    initEmergencySearch();
    renderEmergencies();
    renderComparisonTabs();
    renderComparison();
    initPlasmic();
    renderConcepts();
    renderMnemonics();
    renderAlerts();
    renderCalculatorTabs();
    initStudyTabs();
    initFlashcards();
    initCases();
    initQuestions();
    initTimer();
    renderReferences();
    updateProgress();
    initBackTop();
    initKeyboard();
  }

  init();
})();
