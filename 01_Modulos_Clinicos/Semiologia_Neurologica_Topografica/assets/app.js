(() => {
  "use strict";

  const data = window.ALDENIR_NEURO_SEMIOLOGY;
  const root = document.documentElement;
  const liveRegion = document.getElementById("liveRegion");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeKey = root.dataset.globalThemeKey || "antigravity:a11y:v1";
  const checklistKey = "aldenirmed89:neuro-semiology:checklist:v1";
  const casesKey = "aldenirmed89:neuro-semiology:cases:v1";
  const osceDuration = 8 * 60;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    window.requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  const storage = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (_) {
        return false;
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
        return true;
      } catch (_) {
        return false;
      }
    }
  };

  function readPreferences(serialized) {
    if (typeof serialized === "string") {
      try {
        const parsed = JSON.parse(serialized);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
      } catch (_) {
        return {};
      }
    }
    const stored = storage.get(themeKey, {});
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  }

  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  function isLight(preferences) {
    if (preferences.contrast === true) return false;
    if (preferences.theme === "light") return true;
    if (preferences.theme === "dark") return false;
    if (preferences.theme === "system") return systemTheme.matches;
    if (typeof preferences.clarity === "boolean") return preferences.clarity;
    return root.dataset.defaultTheme === "light";
  }

  function updateButtonLabel(button, icon, label) {
    if (!button) return;
    const text = document.createTextNode(`${icon} `);
    const span = create("span", "", label);
    button.replaceChildren(text, span);
  }

  function applyTheme(preferences = readPreferences()) {
    const light = isLight(preferences);
    const contrast = preferences.contrast === true;
    root.classList.toggle("a11y-contrast", contrast);
    root.dataset.theme = light ? "light" : "dark";
    root.style.colorScheme = light ? "light" : "dark";
    themeMeta?.setAttribute("content", light ? "#f7fbff" : contrast ? "#000000" : "#06111d");

    const button = document.getElementById("themeToggle");
    if (!button) return;
    button.setAttribute("aria-pressed", String(light));
    button.setAttribute(
      "aria-label",
      light ? "Voltar ao modo aeroespacial escuro" : "Ativar visualização clara"
    );
    button.title = light ? "Voltar ao modo aeroespacial escuro" : "Ativar visualização clara";
    updateButtonLabel(button, light ? "🌙" : "☀️", light ? "Escura" : "Clara");
  }

  function toggleTheme() {
    const current = readPreferences();
    const nextLight = !isLight(current);
    const updated = {
      ...current,
      theme: nextLight ? "light" : "dark",
      clarity: nextLight
    };
    if (nextLight) updated.contrast = false;
    storage.set(themeKey, updated);
    applyTheme(updated);
    announce(nextLight ? "Visualização clara ativada." : "Modo aeroespacial escuro ativado.");
  }

  function initTheme() {
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
    window.addEventListener("storage", (event) => {
      if (event.key === themeKey) applyTheme(readPreferences(event.newValue || "{}"));
    });
    const handleSystemChange = () => {
      const preferences = readPreferences();
      if (preferences.theme === "system") applyTheme(preferences);
    };
    if (typeof systemTheme.addEventListener === "function") {
      systemTheme.addEventListener("change", handleSystemChange);
    } else {
      systemTheme.addListener?.(handleSystemChange);
    }
    applyTheme();
  }

  function initNavigation() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("moduleNav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      updateButtonLabel(toggle, open ? "✕" : "☰", open ? "Fechar" : "Menu");
    };

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
      setOpen(false);
      toggle.focus();
    });
    document.addEventListener("pointerdown", (event) => {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1080) setOpen(false);
    });
  }

  function initFocusMode() {
    const button = document.getElementById("focusToggle");
    if (!button) return;
    button.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("focus-mode");
      button.setAttribute("aria-pressed", String(enabled));
      button.title = enabled ? "Sair do modo foco" : "Alternar modo foco";
      updateButtonLabel(button, "🎯", enabled ? "Sair" : "Foco");
      announce(enabled ? "Modo foco ativado. Ferramentas de treino em destaque." : "Modo foco desativado.");
    });
  }

  function initPrint() {
    const details = $$("details");
    let previouslyOpen = [];
    window.addEventListener("beforeprint", () => {
      previouslyOpen = details.filter((item) => item.open);
      details.forEach((item) => { item.open = true; });
    });
    window.addEventListener("afterprint", () => {
      details.forEach((item) => { item.open = previouslyOpen.includes(item); });
    });
    document.getElementById("printButton")?.addEventListener("click", () => window.print());
  }

  function appendLabeledParagraph(parent, label, value) {
    const paragraph = create("p");
    const strong = create("strong", "", `${label}: `);
    paragraph.append(strong, document.createTextNode(value));
    parent.append(paragraph);
  }

  function renderLocalizationMatrix() {
    const container = document.getElementById("localizationMatrix");
    if (!container) return;
    const fragment = document.createDocumentFragment();
    data.localizationRules.forEach((rule, index) => {
      const card = create("article", "localization-card");
      card.dataset.ruleId = rule.id;
      card.append(
        create("span", "localization-index", `NÍVEL ${String(index + 1).padStart(2, "0")}`),
        create("h3", "", rule.title)
      );
      appendLabeledParagraph(card, "Assinatura", rule.signal);
      appendLabeledParagraph(card, "Confirme", rule.checks);
      appendLabeledParagraph(card, "Contradição", rule.contradiction);
      fragment.append(card);
    });
    container.replaceChildren(fragment);
  }

  const localizationWeights = Object.freeze({
    cortical: { cortex: 10, subcortex: -4, brainstem: -4, cerebellum: -2, cord: -6, "root-plexus-nerve": -5, "nmj-muscle": -5 },
    crossed: { brainstem: 12, cortex: -2, subcortex: -2, cerebellum: 1, cord: -3 },
    hemibody: { subcortex: 8, cortex: 4, brainstem: 2, cord: -2, "root-plexus-nerve": -3, "nmj-muscle": -3 },
    cerebellar: { cerebellum: 10, brainstem: 4, cortex: 1, subcortex: 1 },
    "sensory-level": { cord: 12, "root-plexus-nerve": 1, cortex: -5, subcortex: -4, brainstem: -3 },
    sphincter: { cord: 8, "root-plexus-nerve": 2, "nmj-muscle": -3 },
    lmn: { "root-plexus-nerve": 7, "nmj-muscle": 2, cord: 1, cortex: -4, subcortex: -4 },
    radicular: { "root-plexus-nerve": 11, cord: 2, "nmj-muscle": -2 },
    nerve: { "root-plexus-nerve": 11, cord: -3, "nmj-muscle": -2 },
    fatigable: { "nmj-muscle": 12, "root-plexus-nerve": 1, cortex: -4, subcortex: -4, cord: -4 },
    proximal: { "nmj-muscle": 9, "root-plexus-nerve": 1, cortex: -2, subcortex: -2 }
  });

  function resetLocalizationResult() {
    const result = document.getElementById("localizationResult");
    if (!result) return;
    result.classList.remove("is-urgent", "is-caution");
    result.replaceChildren(
      create("strong", "", "Selecione os achados dominantes."),
      create("span", "", "Comece com um ou dois sinais fortes; excesso de caixas pode representar mais de uma lesão ou um cenário mal definido.")
    );
    $$(".localization-card.is-ranked").forEach((card) => card.classList.remove("is-ranked"));
  }

  function analyzeLocalization(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = document.getElementById("localizationResult");
    if (!result) return;
    const selected = new Set($$('input[name="feature"]:checked', form).map((input) => input.value));
    const timing = document.getElementById("tempoSelect")?.value;
    if (!selected.size) {
      resetLocalizationResult();
      announce("Nenhum achado topográfico foi selecionado.");
      return;
    }

    const scores = new Map(data.localizationRules.map((rule) => [rule.id, 0]));
    selected.forEach((feature) => {
      const weights = localizationWeights[feature] || {};
      Object.entries(weights).forEach(([id, value]) => scores.set(id, (scores.get(id) || 0) + value));
    });
    if (selected.has("lmn") && selected.has("radicular")) scores.set("root-plexus-nerve", scores.get("root-plexus-nerve") + 4);
    if (selected.has("lmn") && selected.has("nerve")) scores.set("root-plexus-nerve", scores.get("root-plexus-nerve") + 4);
    if (selected.has("sensory-level") && selected.has("sphincter")) scores.set("cord", scores.get("cord") + 5);
    if (selected.has("fatigable") && selected.has("proximal")) scores.set("nmj-muscle", scores.get("nmj-muscle") + 3);

    const ranked = data.localizationRules
      .map((rule) => ({ rule, score: scores.get(rule.id) || 0 }))
      .sort((a, b) => b.score - a.score);
    const leader = ranked[0];
    const runnerUp = ranked.find((item, index) => index > 0 && item.score > 0);
    const abrupt = timing === "sudden";
    const mutuallyDistant = selected.has("cortical") && (selected.has("sensory-level") || selected.has("fatigable"));

    $$(".localization-card").forEach((card) => {
      card.classList.toggle(
        "is-ranked",
        card.dataset.ruleId === leader.rule.id || (runnerUp && card.dataset.ruleId === runnerUp.rule.id)
      );
    });

    result.classList.remove("is-urgent", "is-caution");
    if (abrupt) result.classList.add("is-urgent");
    else if (mutuallyDistant) result.classList.add("is-caution");
    const fragment = document.createDocumentFragment();
    fragment.append(create("strong", "", `Hipótese topográfica líder: ${leader.rule.title}`));
    if (abrupt) {
      fragment.append(create("span", "", "⚠️ Início súbito: interrompa o treino e trate o cenário real como emergência neurológica; o radar não determina elegibilidade terapêutica."));
    } else {
      fragment.append(create("span", "", "Resultado educacional por compatibilidade de padrão; não é diagnóstico nem cálculo probabilístico validado."));
    }
    const list = create("ul");
    list.append(create("li", "", `Confirme agora: ${leader.rule.checks}`));
    list.append(create("li", "", `Tente refutar: ${leader.rule.contradiction}`));
    if (runnerUp) list.append(create("li", "", `Segunda hipótese a confrontar: ${runnerUp.rule.title}.`));
    if (mutuallyDistant) list.append(create("li", "", "Achados de níveis distantes foram combinados: repita o exame, verifique compreensão/técnica e considere mais de uma lesão."));
    fragment.append(list);
    result.replaceChildren(fragment);
    announce(`Radar concluído. Hipótese topográfica líder: ${leader.rule.title}.`);
  }

  function initLocalizationTool() {
    const form = document.getElementById("localizationForm");
    if (!form) return;
    form.addEventListener("submit", analyzeLocalization);
    form.addEventListener("reset", () => window.setTimeout(resetLocalizationResult, 0));
  }

  function validStoredIds(value, allowed) {
    if (!Array.isArray(value)) return [];
    return value.filter((id) => typeof id === "string" && allowed.has(id));
  }

  const checklistIds = new Set(data?.examChecklist?.map((item) => item.id) || []);
  const completedChecklist = new Set(validStoredIds(storage.get(checklistKey, []), checklistIds));

  function checklistGroups() {
    const groups = new Map();
    data.examChecklist.forEach((item) => {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group).push(item);
    });
    return groups;
  }

  function updateChecklistStatus() {
    const total = data.examChecklist.length;
    const done = completedChecklist.size;
    const badge = document.getElementById("checklistBadge");
    if (badge) badge.textContent = `${done}/${total} concluídos`;

    $$(".checklist-group").forEach((group) => {
      const inputs = $$('input[type="checkbox"]', group);
      const checked = inputs.filter((input) => input.checked).length;
      const counter = $("h3 small", group);
      if (counter) counter.textContent = `${checked}/${inputs.length}`;
    });
  }

  function renderChecklist() {
    const container = document.getElementById("examChecklist");
    if (!container) return;
    const fragment = document.createDocumentFragment();
    checklistGroups().forEach((items, groupName) => {
      const section = create("section", "checklist-group");
      const heading = create("h3");
      heading.append(create("span", "", groupName), create("small", "", "0/0"));
      section.append(heading);
      items.forEach((item) => {
        const label = create("label", "check-item");
        const input = create("input");
        input.type = "checkbox";
        input.checked = completedChecklist.has(item.id);
        input.dataset.itemId = item.id;
        const detailId = `exam-detail-${item.id}`;
        input.setAttribute("aria-describedby", detailId);
        const copy = create("span");
        copy.append(create("strong", "", item.label));
        const detail = create("small", "", item.detail);
        detail.id = detailId;
        copy.append(detail);
        label.classList.toggle("is-complete", input.checked);
        label.append(input, copy);
        input.addEventListener("change", () => {
          if (input.checked) completedChecklist.add(item.id);
          else completedChecklist.delete(item.id);
          label.classList.toggle("is-complete", input.checked);
          storage.set(checklistKey, [...completedChecklist]);
          updateChecklistStatus();
          announce(`${item.label}: ${input.checked ? "concluído" : "desmarcado"}.`);
        });
        section.append(label);
      });
      fragment.append(section);
    });
    container.replaceChildren(fragment);
    updateChecklistStatus();
  }

  function initChecklistReset() {
    document.getElementById("checklistReset")?.addEventListener("click", () => {
      if (!completedChecklist.size) {
        announce("O checklist já está vazio.");
        return;
      }
      if (!window.confirm("Reiniciar somente o progresso educacional deste checklist neste dispositivo?")) return;
      completedChecklist.clear();
      storage.remove(checklistKey);
      $$('#examChecklist input[type="checkbox"]').forEach((input) => {
        input.checked = false;
        input.closest(".check-item")?.classList.remove("is-complete");
      });
      updateChecklistStatus();
      announce("Progresso local do checklist reiniciado.");
    });
  }

  function initOsceTimer() {
    const button = document.getElementById("osceStart");
    const output = document.getElementById("osceTimer");
    if (!button || !output) return;
    let remaining = osceDuration;
    let deadline = 0;
    let timerId = null;

    const format = (seconds) => {
      const safe = Math.max(0, seconds);
      return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
    };
    const paint = () => {
      output.textContent = format(remaining);
      output.classList.toggle("is-finished", remaining === 0);
    };
    const stopInterval = () => {
      if (timerId !== null) window.clearInterval(timerId);
      timerId = null;
    };
    const tick = () => {
      remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      paint();
      if (remaining > 0) return;
      stopInterval();
      updateButtonLabel(button, "↻", "Reiniciar 8 min");
      button.setAttribute("aria-pressed", "false");
      announce("Tempo do OSCE encerrado.");
    };
    const start = () => {
      if (remaining <= 0) remaining = osceDuration;
      deadline = Date.now() + remaining * 1000;
      stopInterval();
      timerId = window.setInterval(tick, 250);
      button.setAttribute("aria-pressed", "true");
      updateButtonLabel(button, "⏸", "Pausar OSCE");
      paint();
      announce("Cronômetro OSCE de oito minutos iniciado.");
    };
    const pause = () => {
      remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      stopInterval();
      button.setAttribute("aria-pressed", "false");
      updateButtonLabel(button, "▶", "Retomar OSCE");
      paint();
      announce("Cronômetro OSCE pausado.");
    };

    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (timerId !== null) pause();
      else start();
    });
    window.addEventListener("beforeunload", stopInterval);
    paint();
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = create("textarea", "sr-only");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Cópia indisponível");
  }

  function initSummaryCopy() {
    const button = document.getElementById("copySummary");
    const template = document.getElementById("summaryTemplate");
    if (!button || !template) return;
    const originalLabel = button.textContent;
    button.addEventListener("click", async () => {
      try {
        await copyText(template.textContent.trim());
        button.textContent = "✓ Modelo copiado";
        announce("Modelo de síntese copiado. Ele não contém dados de paciente.");
      } catch (_) {
        button.textContent = "Selecione e copie o texto";
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(template);
        selection.removeAllRanges();
        selection.addRange(range);
        announce("Cópia automática indisponível. O texto foi selecionado para cópia manual.");
      }
      window.setTimeout(() => { button.textContent = originalLabel; }, 2400);
    });
  }

  const aphasiaLabels = Object.freeze({
    fluente: "Fluente",
    "nao-fluente": "Não fluente",
    preservada: "Preservada",
    prejudicada: "Prejudicada"
  });

  function renderAphasiaTable() {
    const body = document.getElementById("aphasiaTable");
    if (!body) return;
    const fragment = document.createDocumentFragment();
    data.aphasiaPatterns.forEach((pattern) => {
      const row = create("tr");
      const heading = create("th", "", pattern.name);
      heading.scope = "row";
      row.append(
        heading,
        create("td", "", aphasiaLabels[pattern.fluency] || pattern.fluency),
        create("td", "", aphasiaLabels[pattern.comprehension] || pattern.comprehension),
        create("td", "", aphasiaLabels[pattern.repetition] || pattern.repetition),
        create("td", "", pattern.topography)
      );
      fragment.append(row);
    });
    body.replaceChildren(fragment);
  }

  function initAphasiaClassifier() {
    const form = document.getElementById("aphasiaForm");
    const result = document.getElementById("aphasiaResult");
    if (!form || !result) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = {
        fluency: document.getElementById("aphasiaFluency")?.value,
        comprehension: document.getElementById("aphasiaComprehension")?.value,
        repetition: document.getElementById("aphasiaRepetition")?.value,
        naming: document.getElementById("aphasiaNaming")?.value
      };
      const exact = data.aphasiaPatterns.find((pattern) => (
        pattern.fluency === profile.fluency
        && pattern.comprehension === profile.comprehension
        && pattern.repetition === profile.repetition
        && pattern.naming === profile.naming
      ));
      const threeAxis = data.aphasiaPatterns.find((pattern) => (
        pattern.fluency === profile.fluency
        && pattern.comprehension === profile.comprehension
        && pattern.repetition === profile.repetition
      ));
      const pattern = exact || threeAxis;
      if (!pattern) {
        result.classList.add("is-caution");
        result.replaceChildren(
          create("strong", "", "Perfil misto ou incompleto"),
          create("span", "", "Descreva cada eixo, verifique audição, visão, atenção, disartria e apraxia da fala e repita a avaliação sem forçar um subtipo.")
        );
        announce("O perfil não corresponde a um padrão clássico único.");
        return;
      }

      result.classList.toggle("is-caution", !exact);
      const fragment = document.createDocumentFragment();
      fragment.append(create("strong", "", `Padrão mais próximo: ${pattern.name}`));
      fragment.append(create("span", "", pattern.signature));
      appendLabeledParagraph(fragment, "Pista topográfica", pattern.topography);
      appendLabeledParagraph(fragment, "Procure junto", pattern.associates);
      appendLabeledParagraph(fragment, "Não simplifique", pattern.caveat);
      if (!exact) {
        fragment.append(create("p", "", "A nomeação selecionada não completa o padrão clássico. Documente essa discrepância em vez de tratá-la como erro do paciente."));
      }
      result.replaceChildren(fragment);
      announce(`Classificação educacional: ${pattern.name}.`);
    });
  }

  function loadCaseAnswers() {
    const stored = storage.get(casesKey, {});
    const valid = new Map();
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return valid;
    data.cases.forEach((item) => {
      const value = stored[item.id];
      if (Number.isInteger(value) && value >= 0 && value < item.options.length) valid.set(item.id, value);
    });
    return valid;
  }

  const caseAnswers = data ? loadCaseAnswers() : new Map();
  const caseShifts = [2, 1, 3, 0, 1, 2, 0, 3];

  function persistCaseAnswers() {
    storage.set(casesKey, Object.fromEntries(caseAnswers));
  }

  function updateCaseScore() {
    const badge = document.getElementById("caseScore");
    if (!badge) return;
    let correct = 0;
    data.cases.forEach((item) => {
      if (caseAnswers.get(item.id) === item.answer) correct += 1;
    });
    badge.textContent = `${caseAnswers.size}/${data.cases.length} respondidos · ${correct} acertos`;
  }

  function optionOrder(item, index) {
    const indexes = item.options.map((_, optionIndex) => optionIndex);
    const shift = caseShifts[index % caseShifts.length] % indexes.length;
    return [...indexes.slice(shift), ...indexes.slice(0, shift)];
  }

  function renderCases(focusTarget) {
    const shell = document.getElementById("caseShell");
    if (!shell) return;
    const fragment = document.createDocumentFragment();
    data.cases.forEach((item, caseIndex) => {
      const fieldset = create("fieldset", "case-card");
      const answered = caseAnswers.has(item.id);
      const selected = caseAnswers.get(item.id);
      const correct = selected === item.answer;
      fieldset.classList.toggle("is-correct", answered && correct);
      fieldset.classList.toggle("is-incorrect", answered && !correct);
      fieldset.append(
        create("legend", "", `Caso ${String(caseIndex + 1).padStart(2, "0")} · escolha o nível`),
        create("p", "case-stem", item.stem)
      );
      const options = create("div", "case-options");
      optionOrder(item, caseIndex).forEach((optionIndex) => {
        const optionId = `${item.id}-option-${optionIndex}`;
        const label = create("label", "case-option");
        label.htmlFor = optionId;
        const input = create("input");
        input.type = "radio";
        input.name = item.id;
        input.id = optionId;
        input.value = String(optionIndex);
        input.checked = answered && selected === optionIndex;
        input.disabled = answered;
        if (answered && optionIndex === item.answer) label.classList.add("is-correct");
        if (answered && optionIndex === selected && optionIndex !== item.answer) label.classList.add("is-wrong");
        input.addEventListener("change", () => {
          caseAnswers.set(item.id, optionIndex);
          persistCaseAnswers();
          renderCases(`feedback-${item.id}`);
          announce(`${correct ? "" : "Resposta registrada. "}${optionIndex === item.answer ? "Correto." : "Revise a pista topográfica."}`);
        });
        label.append(input, create("span", "", item.options[optionIndex]));
        options.append(label);
      });
      fieldset.append(options);

      if (answered) {
        const feedback = create("div", `case-feedback${correct ? " correct" : ""}`);
        feedback.id = `feedback-${item.id}`;
        feedback.tabIndex = -1;
        feedback.setAttribute("role", "status");
        feedback.append(
          create("strong", "", correct ? "✓ Correto" : "↻ Refaça o caminho anatômico"),
          create("span", "", item.feedback)
        );
        fieldset.append(feedback);
        const retry = create("button", "button ghost case-retry", "Tentar este caso novamente");
        retry.type = "button";
        retry.addEventListener("click", () => {
          caseAnswers.delete(item.id);
          persistCaseAnswers();
          renderCases(`${item.id}-option-${optionOrder(item, caseIndex)[0]}`);
          announce(`Caso ${caseIndex + 1} liberado para nova tentativa.`);
        });
        fieldset.append(retry);
      }
      fragment.append(fieldset);
    });
    shell.replaceChildren(fragment);
    updateCaseScore();
    if (focusTarget) document.getElementById(focusTarget)?.focus();
  }

  function renderReferences() {
    const container = document.getElementById("referenceList");
    if (!container) return;
    const fragment = document.createDocumentFragment();
    data.references.forEach((reference, index) => {
      const card = create("article", "reference-card");
      const link = create("a", "", reference.title);
      link.href = reference.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `${reference.title} — abrir fonte externa`);
      card.append(
        create("span", "localization-index", `FONTE ${String(index + 1).padStart(2, "0")}`),
        link,
        create("small", "", `${reference.organization} · ${reference.year}`),
        create("p", "", reference.use)
      );
      fragment.append(card);
    });
    container.replaceChildren(fragment);
    const badge = $("#fontes .badge");
    if (badge) badge.textContent = `${data.references.length} fontes`;
  }

  function showDataError() {
    const targets = ["localizationResult", "aphasiaResult"];
    targets.forEach((id) => {
      const node = document.getElementById(id);
      if (!node) return;
      node.classList.add("is-urgent");
      node.replaceChildren(
        create("strong", "", "Conteúdo estruturado indisponível"),
        create("span", "", "Recarregue esta página. A parte estática permanece disponível, mas as ferramentas interativas foram desativadas.")
      );
    });
  }

  initTheme();
  initNavigation();
  initFocusMode();
  initPrint();

  if (!data || !Array.isArray(data.localizationRules) || !Array.isArray(data.examChecklist)) {
    showDataError();
    return;
  }

  renderLocalizationMatrix();
  initLocalizationTool();
  renderChecklist();
  initChecklistReset();
  initOsceTimer();
  initSummaryCopy();
  renderAphasiaTable();
  initAphasiaClassifier();
  renderCases();
  renderReferences();

  window.dispatchEvent(new CustomEvent("aldenirmed89:neuro-semiology-ready", {
    detail: { version: data.version, updatedAt: data.updatedAt }
  }));
})();
