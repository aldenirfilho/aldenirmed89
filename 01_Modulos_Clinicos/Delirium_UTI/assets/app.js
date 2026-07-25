(() => {
  "use strict";

  const data = window.ANTIGRAVITY_DELIRIUM;
  if (!data) {
    throw new Error("Catálogo do módulo Delirium indisponível.");
  }

  const root = document.documentElement;
  const globalThemeKey = "antigravity:a11y:v1";
  const legacyThemeKey = root.dataset.legacyThemeKey;
  const progressKey = "antigravity:delirium:study:v1";
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  const liveRegion = document.getElementById("liveRegion");

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  function create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  function readThemeState(serialized) {
    let raw = serialized;
    try {
      if (arguments.length === 0) raw = localStorage.getItem(globalThemeKey);
      const parsed = JSON.parse(raw || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch (_) {
      return {};
    }
  }

  function legacyIsLight() {
    try {
      const value = legacyThemeKey ? localStorage.getItem(legacyThemeKey) : null;
      return value === "light" || value === '"light"';
    } catch (_) {
      return false;
    }
  }

  function clarityEnabled(preferences) {
    if (preferences.contrast === true) return false;
    if (preferences.theme === "light") return true;
    if (preferences.theme === "dark") return false;
    if (preferences.theme === "system") {
      return matchMedia("(prefers-color-scheme: light)").matches;
    }
    if (typeof preferences.clarity === "boolean") return preferences.clarity;
    return legacyIsLight() || root.dataset.defaultTheme === "light";
  }

  function applyTheme(preferences = readThemeState()) {
    const clarity = clarityEnabled(preferences);
    const contrast = preferences.contrast === true;
    root.classList.toggle("a11y-contrast", contrast);
    root.dataset.theme = clarity ? "light" : "dark";
    root.style.colorScheme = clarity ? "light" : "dark";
    themeMeta?.setAttribute("content", clarity ? "#ffffff" : contrast ? "#000000" : "#07101d");
    statusMeta?.setAttribute("content", clarity ? "default" : "black-translucent");

    const button = $("#themeToggle");
    if (button) {
      button.setAttribute("aria-pressed", String(clarity));
      button.setAttribute(
        "aria-label",
        clarity
          ? "Desativar visualização clara e voltar ao modo espacial escuro"
          : "Ativar visualização clara com fundo branco"
      );
      button.title = clarity ? "Voltar ao modo espacial escuro" : "Ativar visualização clara";
      const icon = clarity ? "🌙" : "☀️";
      button.replaceChildren(document.createTextNode(`${icon} `), create("span", "", clarity ? "Escura" : "Clara"));
    }
  }

  function toggleTheme() {
    const current = readThemeState();
    const clarity = clarityEnabled(current);
    const updated = {
      ...current,
      clarity: !clarity,
      theme: clarity ? "dark" : "light"
    };
    if (updated.clarity) updated.contrast = false;
    try {
      localStorage.setItem(globalThemeKey, JSON.stringify(updated));
      if (legacyThemeKey) localStorage.setItem(legacyThemeKey, updated.clarity ? "light" : "dark");
    } catch (_) {}
    applyTheme(updated);
    announce(updated.clarity ? "Visualização clara ativada." : "Modo aeroespacial ativado.");
  }

  $("#themeToggle")?.addEventListener("click", toggleTheme);
  window.addEventListener("storage", (event) => {
    if (event.key === globalThemeKey) applyTheme(readThemeState(event.newValue));
  });
  const systemTheme = matchMedia("(prefers-color-scheme: light)");
  const handleSystemThemeChange = () => {
    const state = readThemeState();
    if (state.theme === "system") applyTheme(state);
  };
  if (systemTheme.addEventListener) {
    systemTheme.addEventListener("change", handleSystemThemeChange);
  } else {
    systemTheme.addListener?.(handleSystemThemeChange);
  }
  applyTheme();

  function initTabs(tabSelector, panelSelector, onActivate) {
    const tabs = $$(tabSelector);
    const panels = $$(panelSelector);
    if (!tabs.length || !panels.length) return;

    function activate(tab, moveFocus = false) {
      tabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.setAttribute("aria-selected", String(active));
        candidate.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
      if (moveFocus) tab.focus();
      onActivate?.(tab);
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        }
        if (nextIndex === null) return;
        event.preventDefault();
        activate(tabs[nextIndex], true);
      });
    });

    activate(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
  }

  initTabs(".scenario-tab", ".scenario-panel", (tab) => {
    const context = $("#investigationContext");
    if (context && tab.dataset.scenario) context.value = tab.dataset.scenario;
    announce(`Cenário ${tab.textContent.trim()} selecionado.`);
  });

  initTabs(".restraint-tab", ".restraint-panel", (tab) => {
    announce(`Aba ${tab.textContent.trim()} selecionada.`);
  });

  function setScaleResult(element, title, text) {
    if (!element) return;
    const strong = create("strong", "", title);
    element.replaceChildren(strong, document.createTextNode(text));
  }

  function runInvestigation() {
    const context = $("#investigationContext")?.value || "emergencia";
    const threat = $("#investigationThreat")?.checked === true;
    const change = $("#investigationChange")?.checked === true;
    const deep = $("#investigationDeep")?.checked === true;
    const result = $("#investigationResult");

    if (threat) {
      setScaleResult(
        result,
        "Prioridade 0 · estabilizar e investigar a ameaça",
        "Ative ajuda; trate ABC, glicose, perfusão, temperatura e red flags neurológicas/toxicológicas. Não espere CAM-ICU, ICDSC ou 4AT para iniciar estabilização."
      );
      return;
    }
    if (deep) {
      setScaleResult(
        result,
        "Não avaliável cognitivamente neste momento",
        "RASS −4/−5 ou ausência de despertar: rever sedação, coma, ventilação e causas fisiológicas. Não registre CAM-ICU como negativo; reavalie quando houver vigília suficiente."
      );
      return;
    }
    if (!change) {
      setScaleResult(
        result,
        "Primeiro defina o basal e procure flutuação",
        "Obtenha história colateral, compare atenção, vigília, cognição e função. Mantenha observação e aplique o instrumento se surgirem indicadores; comprometimento crônico não exclui delirium sobreposto."
      );
      return;
    }
    if (context === "uti") {
      setScaleResult(
        result,
        "UTI · RASS → CAM-ICU ou ICDSC",
        "Documente RASS; com RASS ≥−3, use CAM-ICU para o estado atual ou ICDSC para integrar o turno. Depois confirme clinicamente, procure causas e inicie ABCDEF."
      );
      return;
    }
    setScaleResult(
      result,
      `${context === "emergencia" ? "Emergência" : "Enfermaria"} · 4AT + diagnóstico clínico`,
      "Com mudança aguda/flutuação e paciente avaliável, aplique 4AT; um resultado positivo exige confirmação, etiologia, plano e reavaliação. Red flags sempre mudam a prioridade."
    );
  }

  $("#investigationRun")?.addEventListener("click", runInvestigation);

  function runAgitation() {
    const danger = $("#agitationDanger")?.checked === true;
    const withdrawal = $("#agitationWithdrawal")?.checked === true;
    const ventilated = $("#agitationVent")?.checked === true;
    const neurolepticRisk = $("#agitationNeurolepticRisk")?.checked === true;
    const basics = $("#agitationBasics")?.checked === true;
    const result = $("#agitationResult");
    const guidance = [];

    if (!basics) {
      setScaleResult(
        result,
        "Volte aos degraus 1–3",
        "Organize segurança/ABC, trate dor e causas reversíveis e faça desescalada ambiental. Sem isso, repetir ou somar sedativos pode ocultar deterioração e aumentar dano."
      );
      return;
    }
    if (withdrawal) {
      guidance.push("Abstinência/convulsão muda a lógica: benzodiazepínico pode ser indicado conforme protocolo, com vigilância respiratória e hemodinâmica.");
    }
    if (ventilated) {
      guidance.push("Em VM com agitação impedindo desmame/extubação, dexmedetomidina pode ser considerada conforme protocolo; vigiar bradicardia e hipotensão.");
    }
    if (neurolepticRisk) {
      guidance.push("Risco com antipsicótico: rever QT/K/Mg/interações e Parkinson/Lewy/EPS; prefira alternativa coerente e apoio especializado.");
    }
    if (danger) {
      guidance.push("Risco imediato exige equipe, ambiente monitorizado, alvo explícito e via aérea preparada; contenção só se for o único meio disponível e pelo menor tempo.");
    }
    if (!guidance.length) {
      guidance.push("Se não há perigo imediato nem indicação específica, mantenha medidas não farmacológicas, tratamento causal e reavaliação; não medique apenas o score.");
    }
    setScaleResult(result, danger ? "Escalonar com segurança" : "Evitar sedação automática", guidance.join(" "));
  }

  $("#agitationRun")?.addEventListener("click", runAgitation);

  function formatRass(score) {
    return score > 0 ? `+${score}` : String(score).replace("-", "−");
  }

  function renderRass() {
    const container = $("#rassOptions");
    if (!container) return;
    data.rass.forEach((item) => {
      const button = create("button", "scale-option", formatRass(item.score));
      button.type = "button";
      button.dataset.score = String(item.score);
      button.setAttribute("aria-pressed", "false");
      button.title = `${item.label}: ${item.cue}`;
      button.addEventListener("click", () => {
        $$(".scale-option", container).forEach((candidate) => {
          candidate.setAttribute("aria-pressed", String(candidate === button));
        });
        const gate = item.score <= -4
          ? " CAM-ICU não avaliável: rever coma, sedação e causas de rebaixamento."
          : " CAM-ICU pode ser tentado se houver resposta suficiente ao teste.";
        setScaleResult(
          $("#rassResult"),
          `RASS ${formatRass(item.score)} · ${item.label}`,
          `${item.cue}${gate}`
        );
        const camRass = $("#camRass");
        if (camRass) camRass.value = String(item.score);
      });
      container.append(button);
    });
  }

  function calculateCam() {
    const rawRass = $("#camRass")?.value;
    const result = $("#camResult");
    if (rawRass === "") {
      setScaleResult(result, "CAM-ICU incompleto", "Selecione primeiro o RASS atual.");
      return;
    }
    const rass = Number(rawRass);
    if (rass <= -4) {
      setScaleResult(
        result,
        "CAM-ICU não avaliável",
        "RASS −4/−5: não registre como negativo. Reveja sedação, coma e ameaças fisiológicas."
      );
      return;
    }
    const feature1 = $("#camF1")?.checked === true;
    const feature2 = $("#camF2")?.checked === true;
    const feature3 = rass !== 0;
    const feature4 = $("#camF4")?.checked === true;
    const positive = feature1 && feature2 && (feature3 || feature4);
    const detail = `F1 ${feature1 ? "sim" : "não"} · F2 ${feature2 ? "sim" : "não"} · F3 ${feature3 ? "sim" : "não"} · F4 ${feature4 ? "sim" : "não"}.`;
    setScaleResult(
      result,
      positive ? "CAM-ICU positivo" : "CAM-ICU negativo neste momento",
      `${detail} ${positive ? "Confirme clinicamente, investigue causas e documente." : "Um resultado pontual não exclui flutuação; repita se houver nova mudança."}`
    );
  }

  $("#camCalculate")?.addEventListener("click", calculateCam);

  function updateIcdsc() {
    const checkboxes = $$("#icdscItems input[type='checkbox']");
    const score = checkboxes.filter((checkbox) => checkbox.checked).length;
    let interpretation = "Sem itens presentes nesta janela; mantenha observação clínica.";
    if (score >= 4) {
      interpretation = "Rastreio positivo: confirmar diagnóstico, causas, fenótipo e plano.";
    } else if (score >= 1) {
      interpretation = "Alterações/subsindrômico: não ignorar; revisar causas e repetir conforme protocolo.";
    }
    setScaleResult($("#icdscResult"), `ICDSC ${score}/8`, interpretation);
  }

  $$("#icdscItems input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", updateIcdsc);
  });

  function updateFourAt() {
    const ids = ["fourAlertness", "fourAmt", "fourAttention", "fourAcute"];
    const score = ids.reduce((total, id) => total + Number($(`#${id}`)?.value || 0), 0);
    let interpretation = "Sem delirium ou comprometimento moderado-grave sugeridos, mas 0 não exclui definitivamente.";
    if (score >= 4) {
      interpretation = "Possível delirium: realizar diagnóstico clínico, investigar causas e documentar.";
    } else if (score >= 1) {
      interpretation = "Possível comprometimento cognitivo; correlacionar com basal e contexto.";
    }
    setScaleResult($("#fouratResult"), `4AT ${score}/12`, interpretation);
  }

  ["fourAlertness", "fourAmt", "fourAttention", "fourAcute"].forEach((id) => {
    $(`#${id}`)?.addEventListener("change", updateFourAt);
  });

  function renderCauses() {
    const container = $("#causeGrid");
    if (!container) return;
    data.causes.forEach((group) => {
      const card = create("article", "cause-card");
      card.append(create("div", "cause-icon", group.icon), create("h3", "", group.title));
      const list = create("ul");
      group.items.forEach((item) => list.append(create("li", "", item)));
      card.append(list);
      container.append(card);
    });
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = create("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.className = "copy-fallback";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Falha ao copiar.");
  }

  function renderChecklists() {
    const container = $("#checklistGrid");
    if (!container) return;
    Object.values(data.checklists).forEach((checklist) => {
      const card = create("article", "checklist-card");
      const title = create("h3", "", checklist.title);
      const pre = create("pre", "", checklist.text.join("\n"));
      const button = create("button", "copy-button", "📋 Copiar checklist");
      button.type = "button";
      button.addEventListener("click", async () => {
        const payload = `${checklist.title}\n${checklist.text.join("\n")}`;
        try {
          await copyText(payload);
          button.textContent = "✅ Copiado";
          announce(`${checklist.title} copiado.`);
          window.setTimeout(() => {
            button.textContent = "📋 Copiar checklist";
          }, 1800);
        } catch (_) {
          button.textContent = "Selecione o texto acima";
          announce("Não foi possível copiar automaticamente.");
        }
      });
      card.append(title, pre, button);
      container.append(card);
    });
  }

  function renderReferences() {
    const container = $("#referenceGrid");
    if (!container) return;
    data.references.forEach((reference) => {
      const anchor = create("a", "reference-card");
      anchor.href = reference.href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.append(
        create("strong", "", `${reference.title} ↗`),
        create("span", "", reference.note)
      );
      container.append(anchor);
    });
  }

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(progressKey) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch (_) {
      return {};
    }
  }

  function saveProgress(patch) {
    try {
      localStorage.setItem(progressKey, JSON.stringify({ ...readProgress(), ...patch }));
    } catch (_) {}
  }

  let flashIndex = Number(readProgress().flashIndex || 0) % data.flashcards.length;
  let flashRevealed = false;
  let quizIndex = Number(readProgress().quizIndex || 0) % data.questions.length;
  let caseIndex = Number(readProgress().caseIndex || 0) % data.cases.length;

  function renderFlashcard() {
    const item = data.flashcards[flashIndex];
    $("#flashcardQuestion").textContent = item.q;
    $("#flashcardAnswer").textContent = item.a;
    $("#flashcardAnswer").hidden = !flashRevealed;
    $("#flashcardHint").textContent = flashRevealed
      ? "Resposta revelada · pressione Enter para ocultar"
      : "Clique ou pressione Enter para revelar";
    $("#flashPosition").textContent = `${flashIndex + 1}/${data.flashcards.length}`;
    saveProgress({ flashIndex });
  }

  function toggleFlashcard() {
    flashRevealed = !flashRevealed;
    renderFlashcard();
  }

  $("#flashcard")?.addEventListener("click", toggleFlashcard);
  $("#flashcard")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFlashcard();
    }
  });
  $("#flashPrev")?.addEventListener("click", () => {
    flashIndex = (flashIndex - 1 + data.flashcards.length) % data.flashcards.length;
    flashRevealed = false;
    renderFlashcard();
  });
  $("#flashNext")?.addEventListener("click", () => {
    flashIndex = (flashIndex + 1) % data.flashcards.length;
    flashRevealed = false;
    renderFlashcard();
  });

  function renderQuiz() {
    const item = data.questions[quizIndex];
    $("#quizQuestion").textContent = item.q;
    $("#quizPosition").textContent = `${quizIndex + 1}/${data.questions.length}`;
    const options = $("#quizOptions");
    options.replaceChildren();
    const feedback = $("#quizFeedback");
    feedback.hidden = true;
    feedback.textContent = "";

    item.options.forEach((label, optionIndex) => {
      const button = create("button", "quiz-option", `${String.fromCharCode(65 + optionIndex)}. ${label}`);
      button.type = "button";
      button.addEventListener("click", () => {
        $$(".quiz-option", options).forEach((candidate, candidateIndex) => {
          candidate.disabled = true;
          if (candidateIndex === item.answer) candidate.classList.add("correct");
        });
        if (optionIndex !== item.answer) button.classList.add("wrong");
        feedback.textContent = `${optionIndex === item.answer ? "✅ Correto." : "❌ Revise."} ${item.why}`;
        feedback.hidden = false;
        saveProgress({ quizIndex, lastQuizCorrect: optionIndex === item.answer });
      });
      options.append(button);
    });
    saveProgress({ quizIndex });
  }

  $("#quizPrev")?.addEventListener("click", () => {
    quizIndex = (quizIndex - 1 + data.questions.length) % data.questions.length;
    renderQuiz();
  });
  $("#quizNext")?.addEventListener("click", () => {
    quizIndex = (quizIndex + 1) % data.questions.length;
    renderQuiz();
  });

  function renderCase() {
    const item = data.cases[caseIndex];
    $("#caseTitle").textContent = item.title;
    $("#caseVignette").textContent = item.vignette;
    $("#casePrompt").textContent = item.prompt;
    $("#caseAnswer").textContent = item.answer;
    $("#caseAnswer").hidden = true;
    $("#caseReveal").textContent = "Revelar raciocínio";
    $("#casePosition").textContent = `${caseIndex + 1}/${data.cases.length}`;
    saveProgress({ caseIndex });
  }

  $("#caseReveal")?.addEventListener("click", () => {
    const answer = $("#caseAnswer");
    answer.hidden = !answer.hidden;
    $("#caseReveal").textContent = answer.hidden ? "Revelar raciocínio" : "Ocultar raciocínio";
  });
  $("#casePrev")?.addEventListener("click", () => {
    caseIndex = (caseIndex - 1 + data.cases.length) % data.cases.length;
    renderCase();
  });
  $("#caseNext")?.addEventListener("click", () => {
    caseIndex = (caseIndex + 1) % data.cases.length;
    renderCase();
  });

  const menuToggle = $("#menuToggle");
  const moduleNav = $("#moduleNav");
  function setMenu(open) {
    moduleNav?.classList.toggle("open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
  }
  menuToggle?.addEventListener("click", () => {
    setMenu(!(moduleNav?.classList.contains("open")));
  });
  $$("#moduleNav a").forEach((anchor) => anchor.addEventListener("click", () => setMenu(false)));

  $("#focusToggle")?.addEventListener("click", () => {
    const enabled = !root.classList.contains("focus-mode");
    root.classList.toggle("focus-mode", enabled);
    $("#focusToggle").setAttribute("aria-pressed", String(enabled));
    announce(enabled ? "Modo foco ativado." : "Modo foco desativado.");
  });

  $("#printButton")?.addEventListener("click", () => window.print());

  const backTop = $("#backTop");
  window.addEventListener("scroll", () => {
    backTop?.classList.toggle("visible", window.scrollY > 700);
  }, { passive: true });
  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName || "";
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
    if (event.key === "Escape") setMenu(false);
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.toLowerCase() === "t") {
      event.preventDefault();
      toggleTheme();
    }
    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      $("#focusToggle")?.click();
    }
    if (event.key === "/") {
      event.preventDefault();
      $("#escalas")?.scrollIntoView({ behavior: "smooth", block: "start" });
      $("#camRass")?.focus({ preventScroll: true });
    }
  });

  renderRass();
  updateIcdsc();
  updateFourAt();
  renderCauses();
  renderChecklists();
  renderReferences();
  renderFlashcard();
  renderQuiz();
  renderCase();
})();
