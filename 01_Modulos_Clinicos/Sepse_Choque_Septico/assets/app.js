(function () {
  "use strict";

  const data = window.SEPSE_ULTRA_EXPERT;
  if (!data) {
    const message = '<div class="frontier-rule" role="alert"><b>Falha local:</b> o catálogo clínico não foi carregado. Não use os painéis interativos até restaurar <code>data/catalog.js</code>.</div>';
    ["timelinePanel", "phenotypeDetail", "organGrid", "frontierGrid", "trainingGrid", "referenceList"].forEach((id) => {
      const region = document.getElementById(id);
      if (region) region.innerHTML = message;
    });
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const sharedPreferenceKey = document.documentElement.dataset.preferenceKey || "antigravity:a11y:v1";

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const htmlList = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  const sourceLinks = (sourceIds) => {
    if (!Array.isArray(sourceIds) || sourceIds.length === 0) return "";
    const links = sourceIds.map((id) => data.references.find((reference) => reference.id === id))
      .filter(Boolean)
      .map((reference) => `<a href="#reference-${escapeHtml(reference.id)}">${escapeHtml(reference.title)}</a>`);
    return links.length ? `<p class="source-links"><b>Fontes:</b> ${links.join(" · ")}</p>` : "";
  };

  const storage = {
    get(key, fallback) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return value === null ? fallback : value;
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* preferência opcional */ }
    }
  };

  const state = {
    timeline: data.timeline[0]?.id,
    layer: "hemodynamic",
    phenotype: data.phenotypes.hemodynamic[0]?.id,
    frontierFilter: "all",
    training: "cases"
  };

  function setButtonState(button, active) {
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  }

  function bindRovingTabs(container, activate) {
    container?.addEventListener("keydown", (event) => {
      const tabs = $$('[role="tab"]', container).filter((tab) => !tab.disabled && !tab.hidden);
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;

      let next = current;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;

      event.preventDefault();
      tabs[next].focus();
      activate(tabs[next]);
    });
  }

  function initTheme() {
    const root = document.documentElement;
    const media = window.SEPSE_THEME?.media || window.matchMedia("(prefers-color-scheme: light)");
    let preferences = storage.get(sharedPreferenceKey, {});
    if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) preferences = {};

    const apply = () => {
      const systemLight = media.matches;
      const light = preferences.contrast === true
        ? false
        : preferences.theme === "light" || preferences.clarity === true || (preferences.theme === "system" && systemLight);
      root.dataset.theme = light ? "light" : "dark";
      root.classList.toggle("a11y-contrast", preferences.contrast === true);
      root.style.colorScheme = light ? "light" : "dark";
      const themeColor = $('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute("content", light ? "#ffffff" : "#12080b");
      updateThemeButton();
    };

    const updateFromStorage = () => {
      const next = storage.get(sharedPreferenceKey, preferences);
      if (next && typeof next === "object" && !Array.isArray(next)) preferences = next;
      apply();
    };

    $("#themeToggle")?.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
      preferences = { ...preferences, theme: nextTheme, clarity: nextTheme === "light", contrast: false };
      storage.set(sharedPreferenceKey, preferences);
      apply();
    });

    const mediaListener = () => {
      if (preferences.theme === "system") apply();
    };
    if (typeof media.addEventListener === "function") media.addEventListener("change", mediaListener);
    else if (typeof media.addListener === "function") media.addListener(mediaListener);
    window.addEventListener("storage", (event) => {
      if (event.key === sharedPreferenceKey) updateFromStorage();
    });
    apply();
  }

  function updateThemeButton() {
    const button = $("#themeToggle");
    if (!button) return;
    const light = document.documentElement.dataset.theme === "light";
    button.setAttribute("aria-pressed", String(light));
    button.setAttribute("aria-label", light ? "Ativar visualização escura" : "Ativar visualização clara com fundo branco");
    button.textContent = light ? "🌙 Escura" : "☀️ Clara";
  }

  function initNavigation() {
    const menu = $("#moduleNav");
    const button = $("#menuToggle");
    if (menu && button) {
      const close = () => {
        menu.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      };
      button.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        button.setAttribute("aria-expanded", String(open));
      });
      $$('a[href^="#"]', menu).forEach((link) => link.addEventListener("click", close));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menu.classList.contains("open")) {
          close();
          button.focus();
        }
      });
      document.addEventListener("click", (event) => {
        if (menu.classList.contains("open") && !menu.contains(event.target) && !button.contains(event.target)) close();
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 1050) close();
      });
    }

    const focusButton = $("#focusToggle");
    const currentHashTarget = () => {
      if (!location.hash) return null;
      try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); }
      catch (_) { return null; }
    };
    const updateFocusTarget = () => {
      const target = currentHashTarget();
      document.body.classList.toggle("focus-has-target", Boolean(target?.classList.contains("section")));
    };
    focusButton?.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("focus-mode");
      if (enabled && !currentHashTarget()?.classList.contains("section")) location.hash = "suspeita";
      updateFocusTarget();
      focusButton.setAttribute("aria-pressed", String(enabled));
      focusButton.textContent = enabled ? "🎯 Foco ativo" : "🎯 Foco";
    });
    window.addEventListener("hashchange", updateFocusTarget);
    updateFocusTarget();
  }

  function initMortalityCounter() {
    const counter = $("#deathCounter");
    if (!counter || !Number.isFinite(data.burden.annualDeathsAssociated)) return;
    const formatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
    const deathsPerSecond = data.burden.annualDeathsAssociated / 365.2425 / 24 / 60 / 60;

    const update = () => {
      const now = new Date();
      const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const elapsedSeconds = Math.max(0, (now.getTime() - localMidnight.getTime()) / 1000);
      counter.textContent = formatter.format(Math.floor(elapsedSeconds * deathsPerSecond));
      counter.title = data.burden.caveat;
    };

    update();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setInterval(update, reducedMotion ? 60000 : 1000);
  }

  function initCostCalculator() {
    const form = $("#costForm");
    const output = $("#costResult");
    if (!form || !output) return;
    const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const value = (name) => {
      const field = form.elements.namedItem(name);
      return field instanceof HTMLInputElement && Number.isFinite(field.valueAsNumber) ? Math.max(0, field.valueAsNumber) : 0;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const early = value("earlyWard") + value("earlyTreatment") + value("earlySource");
      const late = value("lateIcu") + value("lateSupport") + value("lateTreatment");
      if (early === 0 && late === 0) {
        output.textContent = "Informe ao menos um valor institucional conferido. A ferramenta não inventa custos.";
        return;
      }
      const difference = late - early;
      const direction = difference >= 0 ? "a mais na trajetória crítica" : "a menos na trajetória crítica";
      const ratio = early > 0 ? late / early : null;
      output.innerHTML = `<strong>Trajetória oportuna: ${escapeHtml(currency.format(early))}</strong><br>`
        + `<strong>Trajetória crítica: ${escapeHtml(currency.format(late))}</strong><br>`
        + `Diferença descritiva: <b>${escapeHtml(currency.format(Math.abs(difference)))} ${direction}</b>. `
        + (ratio === null ? "" : `Razão informada: <b>${escapeHtml(ratio.toLocaleString("pt-BR", { maximumFractionDigits: 2 }))}×</b>. `)
        + "Cenários informados, não estimativa causal.";
    });
    form.addEventListener("reset", () => {
      window.requestAnimationFrame(() => { output.textContent = "Preencha apenas valores conferidos da instituição."; });
    });
  }

  function initTriage() {
    const form = $("#triageForm");
    const panel = $("#triageResult");
    if (!form || !panel) return;

    const render = (level, label, title, summary, actions) => {
      panel.dataset.level = level;
      panel.innerHTML = `<span class="status-pill">${escapeHtml(label)}</span>`
        + `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(summary)}</p>`
        + htmlList(actions)
        + "<p class=\"microcopy\"><b>Limite:</b> saída educacional; não diagnostica nem prescreve.</p>";
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const checked = new Set($$('input[type="checkbox"]:checked', form).map((input) => input.name));
      const unstable = ["shock", "respiratory", "mental"].some((name) => checked.has(name));
      const organs = ["renal", "coagulation", "hepatic", "perfusion"].filter((name) => checked.has(name));
      const infection = checked.has("infection");

      if (unstable) {
        render("critical", "Emergência fisiológica", "ABCDE e suporte agora", "Há instabilidade potencialmente ameaçadora à vida. Sepse e mimetizadores precisam ser abordados em paralelo.", [
          "Acione resposta rápida/UTI e monitorização contínua conforme o cenário.",
          "Estabilize oxigenação, ventilação e perfusão sem aguardar um escore.",
          infection ? "Classifique a probabilidade infecciosa, colha culturas sem atraso relevante e siga a janela antimicrobiana." : "Procure infecção e causas alternativas de choque, hipoxemia ou encefalopatia simultaneamente.",
          "Defina o próximo checkpoint em minutos e documente resposta/dano."
        ]);
      } else if (infection && organs.length > 0) {
        render("urgent", "Sepse possível · alta prioridade", "Disfunção orgânica + infecção exige ação imediata", "A combinação sustenta investigação e manejo urgente, mas ainda requer confirmação clínica e exclusão de alternativas.", [
          "Quantifique a disfunção, obtenha lactato/culturas e avalie perfusão.",
          "Defina se a infecção é possível, provável ou definida e aplique a janela correspondente.",
          "Procure foco que demande drenagem, desbridamento, retirada de dispositivo ou cirurgia.",
          "Reavalie evolução fisiológica e resposta terapêutica de forma seriada."
        ]);
      } else if (organs.length > 0) {
        render("urgent", "Deterioração sem causa definida", "Não descarte sepse — nem ancore nela", "Há possível disfunção orgânica, mas o contexto infeccioso não foi marcado.", [
          "Confirme se a alteração é nova e ameaçadora à vida.",
          "Investigue infecção oculta e diagnósticos não infecciosos em paralelo.",
          "Escalone se houver piora, hipoperfusão ou nova necessidade de suporte.",
          "Use tendência e exame seriado; um resultado isolado não encerra a avaliação."
        ]);
      } else if (infection || checked.has("risk")) {
        render("watch", "Investigação com limite temporal", "Suspeita sem disfunção marcada", "Ausência de sinais assinalados não exclui fase inicial, dado ausente ou deterioração iminente.", [
          "Complete história, exame, sinais vitais e dados basais.",
          "Procure disfunção orgânica e foco; classifique a probabilidade infecciosa.",
          "Defina tempo e gatilhos objetivos para reavaliação.",
          "Escalone imediatamente se surgir instabilidade ou nova disfunção."
        ]);
      } else {
        render("watch", "Sem alerta marcado", "Triagem negativa não exclui sepse", "Nenhuma caixa foi marcada; isso pode refletir ausência de dados ou doença inicial.", [
          "Reavalie se a condição clínica estiver mudando.",
          "Não use esta ferramenta para dar alta ou suspender investigação.",
          "Procure outras causas de deterioração quando aplicável."
        ]);
      }
    });

    form.addEventListener("reset", () => {
      window.requestAnimationFrame(() => {
        panel.removeAttribute("data-level");
        panel.innerHTML = '<span class="status-pill">Aguardando avaliação</span><h3>Comece pela fisiologia.</h3><p>Se houver instabilidade, inicie ABCDE, monitorização e suporte imediatamente. Não aguarde um escore.</p>';
      });
    });
  }

  function initTimeline() {
    const tabs = $("#timelineTabs");
    const panel = $("#timelinePanel");
    if (!tabs || !panel || !data.timeline.length) return;

    tabs.innerHTML = data.timeline.map((item, index) => {
      const active = item.id === state.timeline;
      return `<button type="button" id="timeline-tab-${escapeHtml(item.id)}" role="tab" aria-controls="timelinePanel" aria-selected="${active}" tabindex="${active ? 0 : -1}" data-timeline="${escapeHtml(item.id)}" class="${active ? "active" : ""}">${escapeHtml(item.label)}</button>`;
    }).join("");

    const activate = (button) => {
      const item = data.timeline.find((entry) => entry.id === button.dataset.timeline);
      if (!item) return;
      state.timeline = item.id;
      $$('[role="tab"]', tabs).forEach((tab) => setButtonState(tab, tab === button));
      panel.setAttribute("aria-labelledby", button.id);
      panel.innerHTML = `<span class="time-badge">${escapeHtml(item.label)}</span><h3>${escapeHtml(item.title)}</h3>`
        + `<p><strong>${escapeHtml(item.priority)}</strong></p>${htmlList(item.actions)}`
        + `<div class="reassess-line"><b>🔁 Reavaliar:</b> ${escapeHtml(item.reassess)}</div>`
        + `<div class="never-line"><b>⛔ Nunca:</b> ${escapeHtml(item.never)}</div>`
        + sourceLinks(item.sourceIds);
    };

    tabs.addEventListener("click", (event) => {
      const button = event.target.closest('[role="tab"]');
      if (button) activate(button);
    });
    bindRovingTabs(tabs, activate);
    activate($(`[data-timeline="${state.timeline}"]`, tabs));
  }

  function initPhenotypes() {
    const layerTabs = $(".layer-switcher");
    const profileTabs = $("#phenotypeButtons");
    const panel = $("#phenotypeDetail");
    if (!layerTabs || !profileTabs || !panel) return;

    const renderProfile = (profile, button) => {
      if (!profile || !button) return;
      state.phenotype = profile.id;
      $$('[role="tab"]', profileTabs).forEach((tab) => setButtonState(tab, tab === button));
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.innerHTML = `<header><span class="phenotype-icon" aria-hidden="true">${escapeHtml(profile.icon)}</span><div><h3>${escapeHtml(profile.name)}</h3><p>${escapeHtml(profile.subtitle)}</p></div></header>`
        + `<div class="phenotype-mechanism"><b>Fisiopatologia:</b> ${escapeHtml(profile.mechanism)}</div>`
        + `<div class="phenotype-columns"><div class="phenotype-column"><b>Pistas convergentes</b>${htmlList(profile.clues)}</div>`
        + `<div class="phenotype-column"><b>O que muda com segurança</b>${htmlList(profile.changes)}</div></div>`
        + `<div class="phenotype-trap"><b>Armadilha:</b> ${escapeHtml(profile.trap)}</div>`
        + `<p class="phenotype-evidence"><b>Base/limite:</b> ${escapeHtml(profile.evidence)}</p>`
        + sourceLinks(profile.sourceIds);
    };

    const renderLayer = (layer, layerButton) => {
      const profiles = data.phenotypes[layer];
      if (!Array.isArray(profiles) || profiles.length === 0) return;
      state.layer = layer;
      state.phenotype = profiles[0].id;
      $$('[role="tab"]', layerTabs).forEach((tab) => setButtonState(tab, tab === layerButton));
      profileTabs.innerHTML = profiles.map((profile, index) => `<button type="button" id="phenotype-tab-${escapeHtml(layer)}-${escapeHtml(profile.id)}" role="tab" aria-controls="phenotypeDetail" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-profile="${escapeHtml(profile.id)}" class="${index === 0 ? "active" : ""}">${escapeHtml(profile.icon)} ${escapeHtml(profile.name)}</button>`).join("");
      profileTabs.setAttribute("role", "tablist");
      profileTabs.setAttribute("aria-label", `Perfis da camada ${layerButton.textContent.trim()}`);
      renderProfile(profiles[0], $("[data-profile]", profileTabs));
    };

    $$('.layer-button', layerTabs).forEach((button, index) => {
      button.id = `phenotype-layer-${button.dataset.layer}`;
      button.setAttribute("aria-controls", "phenotypeButtons");
      button.tabIndex = index === 0 ? 0 : -1;
    });
    layerTabs.addEventListener("click", (event) => {
      const button = event.target.closest(".layer-button");
      if (button) renderLayer(button.dataset.layer, button);
    });
    profileTabs.addEventListener("click", (event) => {
      const button = event.target.closest('[role="tab"]');
      const profile = data.phenotypes[state.layer]?.find((item) => item.id === button?.dataset.profile);
      if (profile && button) renderProfile(profile, button);
    });
    bindRovingTabs(layerTabs, (button) => renderLayer(button.dataset.layer, button));
    bindRovingTabs(profileTabs, (button) => {
      const profile = data.phenotypes[state.layer]?.find((item) => item.id === button.dataset.profile);
      renderProfile(profile, button);
    });
    renderLayer(state.layer, $(`[data-layer="${state.layer}"]`, layerTabs));
  }

  function initRefractoryAudit() {
    const form = $("#refractoryForm");
    const panel = $("#auditResult");
    if (!form || !panel) return;
    const update = () => {
      const total = $$('input[type="checkbox"]', form).length;
      const checked = $$('input[type="checkbox"]:checked', form).length;
      const complete = checked === total;
      panel.dataset.level = complete ? "complete" : "open";
      panel.innerHTML = `<span class="status-pill">${checked} de ${total} domínios revisados</span>`
        + `<h3>${complete ? "Auditoria completa — agora integre os achados" : checked >= 6 ? "Quase completo — não pule os domínios restantes" : "O choque ainda está incompletamente explicado"}</h3>`
        + `<p>${complete ? "Checklist completo não prova que o diagnóstico está correto nem autoriza resgate experimental. Reúna mecanismo dominante, causas reversíveis, resposta e plano de reavaliação." : "Marque somente após revisar dados objetivos, intervenções e resposta. Priorize causas reversíveis e cuidado padrão."}</p>`;
    };
    form.addEventListener("change", update);
    update();
  }

  function renderOrganSupport() {
    const grid = $("#organGrid");
    if (!grid) return;
    grid.innerHTML = data.organSupport.map((item) => `<article class="organ-card" id="organ-${escapeHtml(item.id)}"><span class="organ-icon" aria-hidden="true">${escapeHtml(item.icon)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.action)}</p><p class="organ-limit"><b>Limite:</b> ${escapeHtml(item.limit)}</p>${sourceLinks(item.sourceIds)}</article>`).join("");
  }

  function initFrontier() {
    const grid = $("#frontierGrid");
    const filters = $(".filter-row");
    if (!grid || !filters) return;

    const render = () => {
      const items = state.frontierFilter === "all" ? data.frontier : data.frontier.filter((item) => item.status === state.frontierFilter);
      grid.innerHTML = items.map((item) => `<article class="frontier-card" data-status="${escapeHtml(item.status)}"><span class="evidence-badge">${escapeHtml(item.badge)}</span><h3>${escapeHtml(item.title)}</h3><p><b>Mecanismo:</b> ${escapeHtml(item.mechanism)}</p><p><b>Evidência:</b> ${escapeHtml(item.evidence)}</p><p class="guardrail"><b>Proteção:</b> ${escapeHtml(item.guardrail)}</p>${sourceLinks(item.sourceIds)}</article>`).join("");
    };

    filters.addEventListener("click", (event) => {
      const button = event.target.closest(".filter-button");
      if (!button) return;
      state.frontierFilter = button.dataset.filter;
      $$(".filter-button", filters).forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      render();
    });
    $$(".filter-button", filters).forEach((button) => button.setAttribute("aria-pressed", String(button.classList.contains("active"))));
    render();
  }

  function initTraining() {
    const tabs = $(".training-tabs");
    const grid = $("#trainingGrid");
    if (!tabs || !grid) return;

    const render = (tabButton) => {
      const items = data[state.training];
      grid.setAttribute("role", "tabpanel");
      grid.setAttribute("aria-labelledby", tabButton.id);
      grid.innerHTML = items.map((item, itemIndex) => {
        const options = item.options.map((option, optionIndex) => `<button type="button" class="quiz-option" data-item="${itemIndex}" data-option="${optionIndex}" aria-describedby="feedback-${escapeHtml(item.id)}" aria-pressed="false"><b>${String.fromCharCode(65 + optionIndex)}.</b> ${escapeHtml(option)}</button>`).join("");
        return `<article class="quiz-card" aria-labelledby="quiz-title-${escapeHtml(item.id)}"><span class="quiz-meta">${state.training === "cases" ? "Caso clínico" : "Questão TEMI"} · ${itemIndex + 1}/${items.length}</span><h3 id="quiz-title-${escapeHtml(item.id)}">${escapeHtml(item.title)}</h3><p>${escapeHtml(item.prompt)}</p><div class="quiz-options">${options}</div><div class="quiz-feedback" id="feedback-${escapeHtml(item.id)}" aria-live="polite" hidden></div><p class="quiz-pearl" hidden><b>💡 Pérola:</b> ${escapeHtml(item.pearl)}</p>${sourceLinks(item.sourceIds)}</article>`;
      }).join("");
    };

    $$(".training-tab", tabs).forEach((button, index) => {
      button.id = `training-tab-${button.dataset.training}`;
      button.setAttribute("aria-controls", "trainingGrid");
      button.tabIndex = index === 0 ? 0 : -1;
    });

    const activate = (button) => {
      state.training = button.dataset.training;
      $$(".training-tab", tabs).forEach((tab) => setButtonState(tab, tab === button));
      render(button);
    };

    tabs.addEventListener("click", (event) => {
      const button = event.target.closest(".training-tab");
      if (button) activate(button);
    });
    bindRovingTabs(tabs, activate);
    grid.addEventListener("click", (event) => {
      const button = event.target.closest(".quiz-option");
      if (!button) return;
      const item = data[state.training][Number(button.dataset.item)];
      const selected = Number(button.dataset.option);
      if (!item || !Number.isInteger(selected)) return;
      const card = button.closest(".quiz-card");
      if (card.dataset.answered === "true") return;
      card.dataset.answered = "true";
      const feedback = $(".quiz-feedback", card);
      const pearl = $(".quiz-pearl", card);
      $$(".quiz-option", card).forEach((option, optionIndex) => {
        option.classList.toggle("correct", optionIndex === item.correct);
        option.classList.toggle("incorrect", optionIndex === selected && selected !== item.correct);
        option.setAttribute("aria-pressed", String(optionIndex === selected));
        option.disabled = true;
      });
      feedback.hidden = false;
      feedback.innerHTML = `<b>${selected === item.correct ? "✅ Decisão correta" : "⚠️ Revise a decisão"}</b><br>${escapeHtml(item.feedback[selected])}`;
      pearl.hidden = false;
    });
    activate($(`[data-training="${state.training}"]`, tabs));
  }

  function renderReferences() {
    const list = $("#referenceList");
    if (!list) return;
    list.innerHTML = data.references.map((reference) => {
      let href = "";
      try {
        const url = new URL(reference.url);
        if (url.protocol === "https:") href = url.href;
      } catch (_) { /* URL inválida não vira link */ }
      const link = href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a>`
        : "<span>Link indisponível</span>";
      return `<article class="reference-card" id="reference-${escapeHtml(reference.id)}"><div class="reference-meta">${escapeHtml(reference.group)}<br>${escapeHtml(reference.year)}</div><div><h3>${escapeHtml(reference.title)}</h3><p>${escapeHtml(reference.supports)}</p><p class="reference-limit"><b>Limite:</b> ${escapeHtml(reference.limit)}</p></div>${link}</article>`;
    }).join("");
  }

  function init() {
    initTheme();
    initNavigation();
    initMortalityCounter();
    initCostCalculator();
    initTriage();
    initTimeline();
    initPhenotypes();
    initRefractoryAudit();
    renderOrganSupport();
    initFrontier();
    initTraining();
    renderReferences();
    window.dispatchEvent(new CustomEvent(data.meta.readyEvent, { detail: { version: data.meta.version } }));
  }

  init();
})();
