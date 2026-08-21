(function () {
  "use strict";

  const data = window.SCA_TEMI;
  if (!data) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const globalKey = "antigravity:a11y:v1";
  const localPrefix = data.meta.storagePrefix;

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  const safeHttps = (value) => {
    try {
      const url = new URL(String(value));
      return url.protocol === "https:" ? url.href : "#";
    } catch (_) {
      return "#";
    }
  };

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
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* sem persistência */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (_) { /* sem persistência */ }
    }
  };

  function parsePreferences(raw) {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function currentTheme(preferences) {
    if (preferences.contrast === true) return "contrast";
    if (preferences.clarity === true || preferences.theme === "light") return "light";
    if (preferences.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return "dark";
  }

  function applyTheme(preferences) {
    const theme = currentTheme(preferences);
    document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("a11y-contrast", theme === "contrast");
    const button = $("#themeToggle");
    if (button) {
      const clarity = theme === "light";
      button.setAttribute("aria-pressed", String(clarity));
      button.setAttribute("aria-label", clarity ? "Ativar visualização escura" : "Ativar visualização clara com fundo branco");
      button.textContent = clarity ? "🌙 Escura" : "☀️ Clara";
    }
  }

  function initTheme() {
    let preferences = parsePreferences(storage.get(globalKey, {}));
    applyTheme(preferences);
    $("#themeToggle")?.addEventListener("click", () => {
      const clarity = currentTheme(preferences) === "light";
      preferences = {
        ...preferences,
        clarity: !clarity,
        theme: clarity ? "dark" : "light"
      };
      if (preferences.clarity) preferences.contrast = false;
      storage.set(globalKey, preferences);
      applyTheme(preferences);
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== globalKey) return;
      preferences = parsePreferences(event.newValue);
      applyTheme(preferences);
    });
    window.matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => {
      if (preferences.theme === "system") applyTheme(preferences);
    });
  }

  function initFocus() {
    const button = $("#focusToggle");
    button?.addEventListener("click", () => {
      const active = document.body.classList.toggle("focus-mode");
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? "✓ Foco" : "🎯 Foco";
    });
  }

  function renderResult(container, result) {
    if (!container) return;
    container.dataset.level = result.level;
    container.innerHTML = `
      <span class="result-state">${escapeHtml(result.state)}</span>
      <h3>${escapeHtml(result.title)}</h3>
      ${list(result.actions)}
      <div class="result-alert"><b>${escapeHtml(result.label)}:</b> ${escapeHtml(result.note)}</div>`;
  }

  function initTriage() {
    const form = $("#triageForm");
    const output = $("#triageResult");
    if (!form || !output) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      const has = (name) => Boolean(values[name]);
      const veryHigh = ["shock", "pain", "arrhythmia", "heartFailure", "mechanical", "recurrentEcg"].some(has);
      const high = ["nstemi", "grace", "transientSt", "dynamicEcg"].some(has);
      let result;

      if (has("stemi")) {
        result = {
          level: "critical",
          state: "Via de reperfusão",
          title: "Trate como STEMI/equivalente de oclusão.",
          actions: [
            "Ative imediatamente a rede de reperfusão/hemodinâmica.",
            "Defina se ICP primária pode reperfundir em até 120 min do diagnóstico.",
            "Não espere troponina quando ela não mudará esta via.",
            "Avalie diagnósticos alternativos e contraindicações sem criar atraso evitável."
          ],
          label: "Regra local",
          note: "Confirme transporte, sala, equipe, contraindicações e protocolo farmacológico do serviço."
        };
      } else if (veryHigh || has("hardEcg")) {
        result = {
          level: "critical",
          state: "Invasiva imediata",
          title: "Há sinal de muito alto risco ou oclusão difícil de ler.",
          actions: [
            "Acione cardiologia/hemodinâmica para angiografia emergencial.",
            "Trate simultaneamente choque, arritmia, insuficiência cardíaca ou complicação mecânica.",
            "Repita ECG e use derivações adicionais/ecocardiografia sem atrasar a via.",
            "Se houver choque, priorize revascularização do vaso culpado."
          ],
          label: "Diretriz",
          note: "A urgência decorre da instabilidade e da isquemia em curso, não apenas do rótulo STEMI/NSTEMI."
        };
      } else if (high) {
        result = {
          level: "urgent",
          state: "Alto risco",
          title: "Considere estratégia invasiva precoce.",
          actions: [
            "Mantenha internação e monitorização compatíveis com o risco.",
            "Considere angiografia dentro de 24 h segundo diretriz, logística e avaliação cardiológica.",
            "Integre GRACE, dinâmica de ECG/troponina, sangramento e comorbidades.",
            "Reclassifique imediatamente se surgir dor refratária, choque, arritmia ou insuficiência cardíaca."
          ],
          label: "Regra local",
          note: "Disponibilidade e transferência não mudam o risco clínico; documente o plano e qualquer atraso."
        };
      } else {
        result = {
          level: "watch",
          state: "Avaliação seriada",
          title: "Nenhum critério prioritário foi marcado.",
          actions: [
            "Não encerre a investigação com um ECG ou uma troponina isolados.",
            "Use uma via validada de hs-cTn, ECG seriado e probabilidade clínica.",
            "Investigue diagnósticos alternativos e reavalie após qualquer mudança.",
            "Defina destino somente depois da estratificação completa."
          ],
          label: "Limite",
          note: "Ausência de marcações nesta ferramenta não significa baixo risco nem alta segura."
        };
      }
      renderResult(output, result);
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        output.removeAttribute("data-level");
        output.innerHTML = '<span class="result-state">Aguardando achados</span><h3>Comece pela estabilidade e pelo ECG.</h3><p>Se houver deterioração, acione suporte e rede de reperfusão sem esperar esta ferramenta.</p>';
      }, 0);
    });
  }

  function renderEcg() {
    const tabs = $("#ecgTabs");
    const panel = $("#ecgPanel");
    if (!tabs || !panel) return;
    let active = data.ecgScenarios[0].id;

    const draw = () => {
      tabs.innerHTML = data.ecgScenarios.map((scenario) => `
        <button type="button" role="tab" class="${scenario.id === active ? "active" : ""}" aria-selected="${scenario.id === active}" data-ecg="${escapeHtml(scenario.id)}">${escapeHtml(scenario.label)}</button>`).join("");
      const scenario = data.ecgScenarios.find((item) => item.id === active);
      panel.innerHTML = `
        <span class="time-badge">${escapeHtml(scenario.priority)}</span>
        <h3>${escapeHtml(scenario.title)}</h3>
        ${list(scenario.actions)}
        <div class="never-line"><b>Armadilha:</b> ${escapeHtml(scenario.trap)}</div>`;
      $$('[data-ecg]', tabs).forEach((button) => button.addEventListener("click", () => {
        active = button.dataset.ecg;
        draw();
      }));
    };
    draw();
  }

  function initReperfusion() {
    const form = $("#reperfusionForm");
    const presentation = $("#presentation");
    const context = $("#stemiContext");
    const output = $("#reperfusionResult");
    if (!form || !presentation || !context || !output) return;

    const sync = () => { context.hidden = presentation.value !== "stemi"; };
    presentation.addEventListener("change", sync);
    sync();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const type = presentation.value;
      const shock = $("#shockContext").checked;
      const early = $("#earlyWindow").checked;
      const pciInTime = $("#pciInTime").checked;
      const contraindication = $("#lyticContra").checked;
      let result;

      if (shock) {
        result = {
          level: "critical",
          state: "Choque / instabilidade",
          title: "Revascularização emergencial do vaso culpado.",
          actions: [
            "Acione suporte de choque, ecocardiografia urgente e equipe invasiva/cirúrgica.",
            "Realize ICP do vaso culpado ou cirurgia se a ICP não for viável.",
            "Não faça ICP rotineira dos vasos não culpados no mesmo procedimento.",
            "Reavalie lesões remanescentes após estabilização."
          ],
          label: "Diretriz",
          note: "A decisão sobre suporte circulatório mecânico é individual e pondera benefício, sangramento, isquemia de membro e lesão renal."
        };
      } else if (type === "stemi" && pciInTime) {
        result = {
          level: "critical",
          state: "ICP primária",
          title: "A estratégia preferida é ICP primária em tempo oportuno.",
          actions: [
            "Ative a sala e minimize atrasos evitáveis.",
            "Transfira imediatamente se estiver em hospital sem ICP.",
            "Monitore resposta, arritmias, choque e complicações.",
            "Planeje revascularização completa de lesões não culpadas em paciente estável, de forma individualizada."
          ],
          label: "Meta de sistema",
          note: "A referência de 120 min vai do diagnóstico de STEMI à reperfusão por ICP; o serviço deve mapear seus próprios marcos."
        };
      } else if (type === "stemi" && early && !contraindication) {
        result = {
          level: "urgent",
          state: "Estratégia farmacoinvasiva",
          title: "Considere fibrinólise imediata e transferência.",
          actions: [
            "Confirme elegibilidade e ausência de contraindicações pelo protocolo local.",
            "Não espere sinais de reperfusão para iniciar a transferência ao centro com ICP.",
            "Faça ICP de resgate se a fibrinólise falhar ou houver instabilidade/isquemia persistente.",
            "Após sucesso, programe angiografia precoce, em geral entre 2 e 24 h."
          ],
          label: "Segurança",
          note: "Esta ferramenta não fornece escolha, dose ou esquema farmacológico."
        };
      } else if (type === "stemi") {
        result = {
          level: "critical",
          state: "Transferência urgente",
          title: "Fibrinólise não é uma saída automática neste cenário.",
          actions: [
            "Busque ICP primária/transferência urgente.",
            "Revise tempo de início, contraindicações e diagnóstico de trabalho.",
            "Se a apresentação for tardia, ICP é preferida quando há isquemia persistente, instabilidade ou complicação.",
            "Documente o motivo de qualquer atraso e mantenha monitorização."
          ],
          label: "Regra local",
          note: "Acione cardiologia/hemodinâmica e a regulação para resolver o destino real."
        };
      } else if (type === "nste-very-high") {
        result = {
          level: "critical",
          state: "Invasiva imediata",
          title: "NSTE-ACS de muito alto risco não espera uma janela eletiva.",
          actions: [
            "Faça angiografia emergencial e revascularize se indicado.",
            "Trate instabilidade, arritmia, insuficiência cardíaca ou complicação mecânica em paralelo.",
            "Use ecocardiografia urgente se ela puder identificar a causa da deterioração.",
            "Não use fibrinólise em NSTEMI."
          ],
          label: "Diretriz",
          note: "A urgência é equivalente à ameaça fisiológica, mesmo sem elevação persistente de ST."
        };
      } else if (type === "nste-high") {
        result = {
          level: "urgent",
          state: "Invasiva precoce",
          title: "Considere angiografia dentro de 24 h.",
          actions: [
            "Mantenha internação e monitorização.",
            "Integre NSTEMI confirmado, GRACE >140, ST transitório ou alterações dinâmicas de ST/T.",
            "Estratifique sangramento, função renal e comorbidades.",
            "Reclassifique imediatamente se surgir instabilidade."
          ],
          label: "Decisão individual",
          note: "A estratégia de revascularização depois da angiografia depende de anatomia e condições clínicas."
        };
      } else {
        result = {
          level: "watch",
          state: "Diagnóstico em construção",
          title: "Continue ECG e troponina seriados em via validada.",
          actions: [
            "Não aplique fibrinólise sem diagnóstico de STEMI/equivalente apropriado.",
            "Use hs-cTn, delta, sintomas, ECG e imagem quando indicada.",
            "Investigue causas alternativas de lesão miocárdica e dor torácica.",
            "Defina alta somente após estratificação segura."
          ],
          label: "Limite",
          note: "Incerteza diagnóstica não é sinônimo de baixo risco."
        };
      }
      renderResult(output, result);
    });
  }

  function renderTimeline() {
    const tabs = $("#timelineTabs");
    const panel = $("#timelinePanel");
    if (!tabs || !panel) return;
    let active = data.timeline[0].id;
    const draw = () => {
      tabs.innerHTML = data.timeline.map((item) => `
        <button type="button" role="tab" class="${item.id === active ? "active" : ""}" aria-selected="${item.id === active}" data-time="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join("");
      const item = data.timeline.find((entry) => entry.id === active);
      panel.innerHTML = `
        <span class="time-badge">${escapeHtml(item.label)} · ${escapeHtml(item.priority)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        ${list(item.actions)}
        <div class="never-line"><b>Não esquecer:</b> ${escapeHtml(item.never)}</div>`;
      $$('[data-time]', tabs).forEach((button) => button.addEventListener("click", () => {
        active = button.dataset.time;
        draw();
      }));
    };
    draw();
  }

  function renderComplications() {
    const grid = $("#complicationGrid");
    if (!grid) return;
    grid.innerHTML = data.complications.map((item) => `
      <button class="complication-card" type="button" aria-expanded="false" data-complication="${escapeHtml(item.id)}">
        <header><h3>${escapeHtml(item.title)}</h3><span class="signal">${escapeHtml(item.signal)}</span></header>
        <p class="complication-detail">${escapeHtml(item.detail)}</p>
      </button>`).join("");
    $$('[data-complication]', grid).forEach((button) => button.addEventListener("click", () => {
      button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
    }));
  }

  function initSyntax() {
    const form = $("#syntaxForm");
    const output = $("#syntaxResult");
    if (!form || !output) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      const has = (name) => Boolean(values[name]);
      let result;
      if (has("unstable")) {
        result = {
          level: "critical",
          state: "SYNTAX não é o relógio",
          title: "Trate primeiro a instabilidade e o vaso culpado.",
          actions: ["Ative a estratégia emergencial.", "Use a anatomia para viabilizar a reperfusão imediata.", "Adie a decisão definitiva sobre lesões não culpadas quando clinicamente apropriado.", "Reúna o Heart Team após estabilização se a anatomia for complexa."],
          label: "Armadilha",
          note: "Um escore anatômico não pode criar atraso em choque ou isquemia em curso."
        };
      } else if (!has("anatomyKnown")) {
        result = {
          level: "watch",
          state: "Ainda não aplicável",
          title: "O SYNTAX anatômico depende da angiografia.",
          actions: ["Conclua a estratificação clínica da SCA.", "Defina indicação e tempo da angiografia pelo risco.", "Calcule complexidade somente quando a anatomia estiver disponível.", "Não tente substituir a angiografia por um SYNTAX clínico improvisado."],
          label: "Conceito",
          note: "SYNTAX não é escore de dor torácica, diagnóstico de NSTEMI ou risco hemorrágico."
        };
      } else if (has("complexDisease") || has("highComplexity") || has("clinicalFactors") || has("incompletePci")) {
        result = {
          level: "urgent",
          state: "Heart Team",
          title: "A anatomia exige decisão integrada.",
          actions: ["Calcule/revise o SYNTAX anatômico com angiografia de qualidade.", "Integre risco cirúrgico, diabetes, função ventricular, fragilidade e preferência.", "Compare chance de revascularização completa por ICP e cirurgia.", "Considere SYNTAX Score II 2020 como apoio prognóstico, sem automatizar a escolha."],
          label: "Decisão compartilhada",
          note: "Experiência e resultados locais também pertencem à conversa."
        };
      } else {
        result = {
          level: "watch",
          state: "Complexidade aparente menor",
          title: "O escore pode documentar anatomia, mas não substitui o plano clínico.",
          actions: ["Confirme o vaso culpado e a significância das lesões.", "Planeje completude da revascularização.", "Integre risco isquêmico, sangramento e comorbidades.", "Documente a justificativa da estratégia escolhida."],
          label: "Limite",
          note: "A ausência de marcadores de complexidade nesta ferramenta não garante ICP simples ou cirurgia desnecessária."
        };
      }
      renderResult(output, result);
    });
  }

  const state = {
    trainingMode: "cases",
    trainingIndex: { cases: 0, questions: 0, flashcards: 0 },
    selectedAnswers: {},
    answered: {
      cases: new Set(storage.get(`${localPrefix}:cases`, [])),
      questions: new Set(storage.get(`${localPrefix}:questions`, []))
    },
    revealedFlashcards: new Set(storage.get(`${localPrefix}:flashcards`, []))
  };

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
        <a href="${escapeHtml(safeHttps(reference.url))}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a>
      </article>`).join("");
  }

  initTheme();
  initFocus();
  initTriage();
  renderEcg();
  initReperfusion();
  renderTimeline();
  renderComplications();
  initSyntax();
  initTraining();
  renderReferences();

  document.dispatchEvent(new CustomEvent("antigravity:sca-temi-ready", { detail: { version: data.meta.version } }));
})();
