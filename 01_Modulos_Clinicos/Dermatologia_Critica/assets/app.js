(function () {
  "use strict";

  const data = window.DERM_CRITICA;
  if (!data) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const sharedPreferenceKey = "antigravity:a11y:v1";
  const localPrefix = data.meta.storagePrefix;

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* opcional */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (_) { /* opcional */ }
    }
  };

  const state = {
    timeline: data.timeline[0].id,
    phenotype: data.phenotypes[0].id,
    therapy: data.therapies[0].id,
    trainingMode: "cases",
    trainingIndex: { cases: 0, questions: 0, flashcards: 0 },
    revealedFlashcards: new Set(storage.get(`${localPrefix}:flashcards`, [])),
    answered: {
      cases: new Set(storage.get(`${localPrefix}:cases`, [])),
      questions: new Set(storage.get(`${localPrefix}:questions`, []))
    },
    selectedAnswers: {}
  };

  function initTheme() {
    const root = document.documentElement;
    let preferences = storage.get(sharedPreferenceKey, {});
    if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) preferences = {};
    const systemLight = matchMedia("(prefers-color-scheme: light)").matches;
    const light = preferences.theme === "system"
      ? systemLight
      : preferences.theme === "light" || preferences.clarity === true;
    root.dataset.theme = light ? "light" : "dark";
    root.classList.toggle("a11y-contrast", preferences.contrast === true);
    updateThemeButton();

    $("#themeToggle")?.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      root.classList.remove("a11y-contrast");
      preferences.theme = next === "light" ? "light" : "dark";
      preferences.clarity = next === "light";
      preferences.contrast = false;
      storage.set(sharedPreferenceKey, preferences);
      updateThemeButton();
    });
  }

  function updateThemeButton() {
    const button = $("#themeToggle");
    if (!button) return;
    const light = document.documentElement.dataset.theme === "light";
    button.setAttribute("aria-pressed", String(light));
    button.setAttribute("aria-label", light ? "Ativar visualização escura" : "Ativar visualização clara com fundo branco");
    button.textContent = light ? "🌙 Escura" : "☀️ Clara";
  }

  function initFocus() {
    $("#focusToggle")?.addEventListener("click", (event) => {
      const enabled = document.body.classList.toggle("focus-mode");
      event.currentTarget.setAttribute("aria-pressed", String(enabled));
    });
  }

  function initTriage() {
    const form = $("#triageForm");
    const panel = $("#triageResult");
    if (!form || !panel) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const checked = new Set($$('input[type="checkbox"]:checked', form).map((input) => input.name));
      let level = "watch";
      let label = "Vigilância ativa";
      let title = "Baixo risco aparente — reavalie seriado";
      let summary = "Nenhum sinal de alarme foi marcado. Isso não exclui fase inicial de reação grave.";
      let actions = [
        "Rever fármacos e cronologia.",
        "Marcar limites do rash e repetir exame de pele/mucosas.",
        "Repetir hemograma e órgãos se o quadro evoluir.",
        "Escalonar imediatamente se surgir dor, mucosa, face, pústula, bolha ou órgão."
      ];

      if (checked.has("shock") || checked.has("airway")) {
        level = "critical";
        label = "Emergência fisiológica";
        title = "ABCDE + UTI agora";
        summary = "Há instabilidade ou ameaça de via aérea. A síndrome dermatológica é secundária à estabilização imediata.";
        actions = [
          "Acionar suporte avançado/UTI e monitorização contínua.",
          "Tratar anafilaxia se o fenótipo for compatível; proteger via aérea precocemente quando indicada.",
          "Suspender o provável culpado e registrar horários.",
          "Acionar dermatologia e equipe do órgão sem atrasar estabilização."
        ];
      } else if ((checked.has("pain") || checked.has("detachment")) && checked.has("mucosa")) {
        level = "critical";
        label = "Suspeita alta de SJS/TEN";
        title = "Falência cutânea: transferir cedo";
        summary = "Dor/pele dusky ou descolamento com mucosa é uma combinação de alto risco para SJS/TEN.";
        actions = [
          "Suspender imediatamente o provável culpado e não reexpor.",
          "Internar, medir área destacada, iniciar suporte e curativo não aderente.",
          "Acionar dermatologia e oftalmologia; avaliar UTI/centro experiente agora.",
          "Coletar SCORTEN sem usá-lo para atrasar a transferência."
        ];
      } else if (checked.has("organ") && (checked.has("face") || checked.has("eosinophilia"))) {
        level = "critical";
        label = "Suspeita alta de DRESS grave";
        title = "Órgão envolvido define gravidade";
        summary = "Disfunção orgânica associada a edema facial/eosinofilia aponta para DRESS e exige avaliação hospitalar urgente.";
        actions = [
          "Suspender o provável culpado e internar.",
          "Mapear fígado, rim, pulmão, coração e outros órgãos.",
          "Discutir corticoide sistêmico e desmame lento com especialista se órgão grave.",
          "Transferir para UTI se miocardite, falência hepática, respiratória, renal grave, SNC ou choque."
        ];
      } else if (checked.has("detachment") || checked.has("mucosa") || checked.has("organ")) {
        level = "urgent";
        label = "Reação grave possível";
        title = "Não tratar como exantema simples";
        summary = "Há ao menos um sinal maior de alarme. O paciente precisa fenotipagem e avaliação urgente.";
        actions = [
          "Suspender o provável culpado e revisar os não essenciais.",
          "Internar/monitorar conforme fisiologia e extensão.",
          "Acionar dermatologia e especialidade do órgão.",
          "Repetir pele, mucosas, área e exames em horas, não dias."
        ];
      } else if (checked.has("pustules")) {
        level = "urgent";
        label = "Via AGEP/overlap";
        title = "Pústulas difusas exigem retirada e revisão";
        summary = "O padrão sugere AGEP, mas mucosa intensa, órgão ou descolamento reclassificam o risco.";
        actions = [
          "Suspender o provável culpado, especialmente antibiótico recente.",
          "Hemograma, rim, fígado e avaliação de choque/órgãos.",
          "Suporte e corticoide tópico na forma não complicada.",
          "Biópsia/UTI se overlap, órgão grave ou falência cutânea."
        ];
      } else if (checked.has("erythroderma")) {
        level = "urgent";
        label = "Via eritrodermia";
        title = "Barreira cutânea em risco";
        summary = "Eritrodermia pode causar hipotermia, perdas, infecção e insuficiência cardíaca de alto débito.";
        actions = [
          "Avaliar temperatura, circulação, peso, balanço, eletrólitos e infecção.",
          "Internar se grave e iniciar aquecimento/emoliente/suporte.",
          "Investigar fármaco, psoríase, eczema e linfoma cutâneo.",
          "UTI se instabilidade, hipotermia, oligúria, insuficiência cardíaca, sepse ou disfunção orgânica."
        ];
      } else if (checked.has("face") || checked.has("eosinophilia") || checked.has("pain")) {
        level = "urgent";
        label = "SCAR precoce possível";
        title = "Amplie exames e reavalie em horas";
        summary = "Sinais precoces podem anteceder a síndrome completa; não encerre como alergia simples.";
        actions = [
          "Montar linha do tempo dos fármacos.",
          "Examinar mucosas e pele inteira novamente.",
          "Hemograma diferencial e função de órgãos.",
          "Acionar dermatologia se progressão ou dúvida."
        ];
      }

      panel.dataset.level = level;
      panel.innerHTML = `
        <span class="result-state">${escapeHtml(label)}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(summary)}</p>
        <ol>${actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        <div class="result-alert"><b>Limite:</b> apoio cognitivo; confirme no exame presencial e protocolo local.</div>
      `;
    });

    form.addEventListener("reset", () => {
      requestAnimationFrame(() => {
        panel.removeAttribute("data-level");
        panel.innerHTML = '<span class="result-state">Aguardando dados</span><h3>Use o quadro ao lado.</h3><p>Se o paciente estiver instável, não espere o resultado: inicie ABCDE e acione suporte avançado.</p>';
      });
    });
  }

  function renderTimeline() {
    const tabs = $("#timelineTabs");
    const panel = $("#timelinePanel");
    if (!tabs || !panel) return;
    tabs.innerHTML = data.timeline.map((item) => `<button type="button" role="tab" data-id="${escapeHtml(item.id)}" class="${item.id === state.timeline ? "active" : ""}" aria-selected="${item.id === state.timeline}">${escapeHtml(item.label)}</button>`).join("");
    const item = data.timeline.find((entry) => entry.id === state.timeline) || data.timeline[0];
    panel.innerHTML = `<span class="time-badge">${escapeHtml(item.label)}</span><h3>${escapeHtml(item.title)}</h3><p><strong>${escapeHtml(item.priority)}</strong></p>${list(item.actions)}<div class="never-line"><b>Não fazer:</b> ${escapeHtml(item.never)}</div>`;
    $$('[data-id]', tabs).forEach((button) => button.addEventListener("click", () => { state.timeline = button.dataset.id; renderTimeline(); }));
  }

  function renderPhenotypes() {
    const buttons = $("#phenotypeButtons");
    const detail = $("#phenotypeDetail");
    const table = $("#phenotypeTable");
    if (!buttons || !detail || !table) return;
    buttons.innerHTML = data.phenotypes.map((item) => `<button type="button" data-id="${escapeHtml(item.id)}" class="${item.id === state.phenotype ? "active" : ""}">${escapeHtml(item.icon)} ${escapeHtml(item.name)}</button>`).join("");
    const item = data.phenotypes.find((entry) => entry.id === state.phenotype) || data.phenotypes[0];
    detail.innerHTML = `
      <header><span class="phenotype-icon">${escapeHtml(item.icon)}</span><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.fullName)}</p></div></header>
      <div class="detail-columns">
        <div class="detail-box"><b>O que fixa</b>${list(item.pearls)}</div>
        <div class="detail-box trap"><b>Armadilha</b><p>${escapeHtml(item.traps)}</p><b>Destino</b><p>${escapeHtml(item.destination)}</p></div>
      </div>`;
    table.innerHTML = data.phenotypes.map((entry) => `<tr><td>${escapeHtml(entry.icon)} ${escapeHtml(entry.name)}</td><td>${escapeHtml(entry.latency)}</td><td>${escapeHtml(entry.clue)}</td><td>${escapeHtml(entry.mucosa)}</td><td>${escapeHtml(entry.systemic)}</td><td>${escapeHtml(entry.destination)}</td></tr>`).join("");
    $$('[data-id]', buttons).forEach((button) => button.addEventListener("click", () => { state.phenotype = button.dataset.id; renderPhenotypes(); }));
  }

  function initDrugClock() {
    const form = $("#drugClockForm");
    const result = $("#drugClockResult");
    if (!form || !result) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const phenotype = $("#drugPhenotype").value;
      const days = Number($("#drugDays").value);
      const reexposure = $("#drugReexposure").checked;
      const windowData = data.drugWindows[phenotype];
      const within = days >= windowData.min && days <= windowData.max;
      const veryEarly = days < windowData.min;
      const percent = Math.max(6, Math.min(100, (days / Math.max(windowData.max, 1)) * 100));
      const verdict = within
        ? "Cronologia compatível"
        : reexposure && veryEarly
          ? "Latência curta pode ser compatível com reexposição"
          : "Fora da janela frequente — não exclui";
      result.innerHTML = `
        <span class="eyebrow">${escapeHtml(verdict)}</span>
        <h3>${escapeHtml(days)} dia(s) · ${escapeHtml(windowData.label)}</h3>
        <progress class="window-meter" max="100" value="${percent}" aria-label="Posição aproximada na janela temporal">${Math.round(percent)}%</progress>
        <p>${escapeHtml(windowData.note)}</p>
        <p><b>Próxima ação:</b> revisar todas as drogas, inclusive suspensas, respectivas meias-vidas e alternativas; aplicar algoritmo apropriado com especialista.</p>`;
    });
  }

  function initScorten() {
    const form = $("#scortenForm");
    const result = $("#scortenResult");
    if (!form || !result) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const score = $$('input[type="checkbox"]:checked', form).length;
      const mortality = score <= 1 ? "3%" : score === 2 ? "12%" : score === 3 ? "35%" : score === 4 ? "58%" : "90%";
      result.dataset.risk = score >= 3 ? "high" : "moderate";
      result.innerHTML = `<span class="score-number">${score}</span><div><b>Risco histórico aproximado: ${mortality}</b><p>Coorte original do SCORTEN. Não é previsão individual, não mede benefício terapêutico e não deve atrasar UTI/transferência. Repetir no dia 3.</p></div>`;
    });
  }

  function renderTherapies() {
    const tabs = $("#therapyTabs");
    const panel = $("#therapyPanel");
    if (!tabs || !panel) return;
    tabs.innerHTML = data.therapies.map((item) => `<button type="button" role="tab" data-id="${escapeHtml(item.id)}" class="${item.id === state.therapy ? "active" : ""}" aria-selected="${item.id === state.therapy}">${escapeHtml(item.label)}</button>`).join("");
    const item = data.therapies.find((entry) => entry.id === state.therapy) || data.therapies[0];
    panel.innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <div class="therapy-columns">
        <div class="therapy-column"><h4>Base obrigatória</h4>${list(item.foundation)}</div>
        <div class="therapy-column"><h4>Quando escalar</h4>${list(item.escalation)}</div>
      </div>
      <div class="monitor-row">${item.monitor.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div>
      <p class="evidence-line"><b>Nível de confiança:</b> ${escapeHtml(item.evidence)}</p>`;
    $$('[data-id]', tabs).forEach((button) => button.addEventListener("click", () => { state.therapy = button.dataset.id; renderTherapies(); }));
  }

  function renderDestinations() {
    const grid = $("#destinationGrid");
    if (!grid) return;
    grid.innerHTML = data.destinations.map((item) => `
      <article class="destination-card">
        <header><h3>${escapeHtml(item.icon)} ${escapeHtml(item.title)}</h3><span class="destination-level">${escapeHtml(item.level)}</span></header>
        ${list(item.triggers)}
      </article>`).join("");
  }

  function currentTrainingCollection() {
    return data[state.trainingMode];
  }

  function renderTraining() {
    const collection = currentTrainingCollection();
    const index = state.trainingIndex[state.trainingMode];
    const item = collection[index];
    const panel = $("#trainingPanel");
    const progress = $("#trainingProgress");
    if (!panel || !progress) return;
    progress.value = ((index + 1) / collection.length) * 100;
    progress.textContent = `${Math.round(progress.value)}%`;

    if (state.trainingMode === "flashcards") {
      const revealed = state.revealedFlashcards.has(item.id);
      panel.innerHTML = `
        <div class="training-meta"><span>Flashcard ${index + 1}/${collection.length}</span><span>Clique para ${revealed ? "ocultar" : "revelar"}</span></div>
        <button class="flashcard ${revealed ? "revealed" : ""}" type="button" id="flashcardButton"><span>${revealed ? "Resposta" : "Pergunta"}</span><h3>${escapeHtml(revealed ? item.back : item.front)}</h3></button>`;
      $("#flashcardButton")?.addEventListener("click", () => {
        if (state.revealedFlashcards.has(item.id)) state.revealedFlashcards.delete(item.id);
        else state.revealedFlashcards.add(item.id);
        storage.set(`${localPrefix}:flashcards`, Array.from(state.revealedFlashcards));
        renderTraining();
      });
      return;
    }

    const selected = state.selectedAnswers[item.id];
    const answered = selected !== undefined;
    panel.innerHTML = `
      <div class="training-meta"><span>${state.trainingMode === "cases" ? "Caso" : "Questão"} ${index + 1}/${collection.length}</span><span>${answered ? "Comentada" : "Responda antes de revelar"}</span></div>
      <h3>${escapeHtml(item.title)}</h3>
      ${item.stem ? `<p class="case-stem">${escapeHtml(item.stem)}</p>` : ""}
      ${item.question ? `<p><b>${escapeHtml(item.question)}</b></p>` : ""}
      <div class="answer-list">${item.options.map((option, optionIndex) => `
        <button class="answer-option ${answered ? (optionIndex === item.answer ? "correct" : optionIndex === selected ? "incorrect" : "") : ""}" type="button" data-answer="${optionIndex}" ${answered ? "disabled" : ""}><b>${String.fromCharCode(65 + optionIndex)}.</b> ${escapeHtml(option)}</button>
        <div class="option-feedback ${answered ? "visible" : ""}"><b>${String.fromCharCode(65 + optionIndex)}:</b> ${escapeHtml(item.comments[optionIndex])}</div>`).join("")}</div>
      ${answered ? `<div class="pearl"><b>💡 Fixação:</b> ${escapeHtml(item.pearl)}</div>` : ""}`;

    $$('[data-answer]', panel).forEach((button) => button.addEventListener("click", () => {
      const answer = Number(button.dataset.answer);
      state.selectedAnswers[item.id] = answer;
      state.answered[state.trainingMode].add(item.id);
      storage.set(`${localPrefix}:${state.trainingMode}`, Array.from(state.answered[state.trainingMode]));
      renderTraining();
    }));
  }

  function initTraining() {
    $$(".training-tab").forEach((button) => button.addEventListener("click", () => {
      state.trainingMode = button.dataset.training;
      $$(".training-tab").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderTraining();
    }));
    $("#trainingPrev")?.addEventListener("click", () => {
      const length = currentTrainingCollection().length;
      state.trainingIndex[state.trainingMode] = (state.trainingIndex[state.trainingMode] - 1 + length) % length;
      renderTraining();
    });
    $("#trainingNext")?.addEventListener("click", () => {
      const length = currentTrainingCollection().length;
      state.trainingIndex[state.trainingMode] = (state.trainingIndex[state.trainingMode] + 1) % length;
      renderTraining();
    });
    $("#trainingReset")?.addEventListener("click", () => {
      state.revealedFlashcards.clear();
      state.answered.cases.clear();
      state.answered.questions.clear();
      state.selectedAnswers = {};
      ["flashcards", "cases", "questions"].forEach((key) => storage.remove(`${localPrefix}:${key}`));
      renderTraining();
    });
    renderTraining();
  }

  function renderReferences() {
    const container = $("#referencesList");
    if (!container) return;
    container.innerHTML = data.references.map((reference) => `
      <article class="reference-card">
        <span class="reference-year">${escapeHtml(reference.year)}</span>
        <div><h3>${escapeHtml(reference.title)}</h3><p>${escapeHtml(reference.type)} · ${escapeHtml(reference.use)}</p></div>
        <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a>
      </article>`).join("");
  }

  initTheme();
  initFocus();
  initTriage();
  renderTimeline();
  renderPhenotypes();
  initDrugClock();
  initScorten();
  renderTherapies();
  renderDestinations();
  initTraining();
  renderReferences();

  document.dispatchEvent(new CustomEvent("antigravity:dermatologia-critica-ready", { detail: { version: data.meta.version } }));
})();
