"use strict";

(() => {
  const data = window.ANTIGRAVITY_CRITICAL_MODULE;
  if (!data) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const list = (items) => `<ul>${(items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  const tags = (items) => (items || []).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("");

  document.title = `${data.meta.title} — Antigravity`;
  $("#moduleTitle").textContent = data.meta.title;
  $("#moduleSubtitle").textContent = data.meta.subtitle;
  $("#moduleKicker").textContent = data.meta.kicker;
  $("#moduleVersion").textContent = `v${data.meta.moduleVersion} · ${data.meta.updatedAt}`;
  $("#moduleSafety").textContent = data.meta.safetyNotice;
  $("#moduleEmoji").textContent = data.meta.emoji;

  const theme = window.ANTIGRAVITY_CRITICAL_THEME;
  const themeKey = theme?.key || "antigravity:a11y:v1";
  const themeButton = $("#themeToggle");
  themeButton.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "light"));

  themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    let preferences = {};
    try {
      const parsed = JSON.parse(localStorage.getItem(themeKey) || "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) preferences = parsed;
    } catch (_) {}
    preferences.theme = next;
    preferences.clarity = next === "light";
    preferences.contrast = false;
    preferences.visualProfile = next === "light" ? "aerospace-light" : "aerospace";
    theme?.applyPreferences(preferences);
    if (!theme) document.documentElement.dataset.theme = next;
    themeButton.setAttribute("aria-pressed", String(next === "light"));
    try { localStorage.setItem(themeKey, JSON.stringify(preferences)); } catch (_) {}
  });
  $("#printModule").addEventListener("click", () => window.print());

  $("#quickGrid").innerHTML = data.quickActions.map((item) => `
    <article class="card quick-card">
      <div class="icon" aria-hidden="true">${escapeHtml(item.icon)}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
      <a href="${escapeHtml(item.href)}">Abrir bloco →</a>
    </article>
  `).join("");

  const emergencyGrid = $("#emergencyGrid");
  const categories = [...new Set(data.emergencies.map((item) => item.category))];
  $("#emergencyCategory").innerHTML = `<option value="">Todos os eixos</option>` +
    categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");

  function renderEmergencies() {
    const query = $("#emergencySearch").value.trim().toLowerCase();
    const category = $("#emergencyCategory").value;
    const items = data.emergencies.filter((item) => {
      const haystack = [item.title, item.category, item.signal, ...(item.tags || [])].join(" ").toLowerCase();
      return (!category || item.category === category) && (!query || haystack.includes(query));
    });
    emergencyGrid.innerHTML = items.map((item) => `
      <article class="card emergency" data-id="${escapeHtml(item.id)}">
        <span class="card-tag">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p><strong>Reconheça:</strong> ${escapeHtml(item.signal)}</p>
        <details>
          <summary>Primeira hora</summary>
          ${list(item.firstHour)}
          <p><strong>Exames decisivos</strong></p>${list(item.decisive)}
          <p><strong>Não faça no automático</strong></p>${list(item.doNot)}
        </details>
        <div class="chips">${tags(item.tags)}</div>
      </article>
    `).join("");
    $("#emergencyEmpty").style.display = items.length ? "none" : "block";
    $("#emergencyCount").textContent = `${items.length} de ${data.emergencies.length} cenários`;
  }
  $("#emergencySearch").addEventListener("input", renderEmergencies);
  $("#emergencyCategory").addEventListener("change", renderEmergencies);
  renderEmergencies();

  $("#pathwayGrid").innerHTML = data.pathways.map((item) => `
    <article class="card">
      <span class="card-tag">${escapeHtml(item.timebox)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <div class="pathway">${item.steps.map((step) => `
        <div class="pathway-step">
          <strong>${escapeHtml(step.title)}</strong>
          <div class="meta">${escapeHtml(step.text)}</div>
        </div>`).join("")}
      </div>
      <p class="meta">Saída segura: ${escapeHtml(item.exit)}</p>
    </article>
  `).join("");

  $("#comparisonGrid").innerHTML = data.comparisons.map((comparison) => `
    <article class="card">
      <h3>${escapeHtml(comparison.title)}</h3>
      <div class="comparison-wrap">
        <table>
          <thead><tr>${comparison.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${comparison.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    </article>
  `).join("");

  $("#conceptGrid").innerHTML = data.concepts.map((item) => `
    <article class="card">
      <span class="card-tag">${escapeHtml(item.category)}</span>
      <h3>${escapeHtml(item.term)}</h3>
      <p>${escapeHtml(item.definition)}</p>
      <details><summary>Aplicação e limite</summary><p>${escapeHtml(item.application)}</p></details>
    </article>
  `).join("");

  $("#mnemonicGrid").innerHTML = data.mnemonics.map((item) => `
    <article class="card">
      <span class="card-tag">${escapeHtml(item.code)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      ${list(item.lines)}
      <p class="meta">${escapeHtml(item.limit)}</p>
    </article>
  `).join("");

  $("#alertGrid").innerHTML = data.alerts.map((item) => `
    <article class="card alert">
      <span class="card-tag">${escapeHtml(item.kind)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.message)}</p>
      <p class="meta">Antídoto cognitivo: ${escapeHtml(item.countermeasure)}</p>
    </article>
  `).join("");

  function calculatorHtml(calculator) {
    const fields = calculator.fields.map((field) => {
      if (field.type === "select") {
        return `<div class="field"><label for="calc-${escapeHtml(field.id)}">${escapeHtml(field.label)}</label>
          <select id="calc-${escapeHtml(field.id)}" data-field="${escapeHtml(field.id)}">
            ${field.options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("")}
          </select></div>`;
      }
      return `<div class="field"><label for="calc-${escapeHtml(field.id)}">${escapeHtml(field.label)}</label>
        <input id="calc-${escapeHtml(field.id)}" data-field="${escapeHtml(field.id)}" type="${escapeHtml(field.type || "number")}"
          min="${escapeHtml(field.min ?? "")}" max="${escapeHtml(field.max ?? "")}" step="${escapeHtml(field.step ?? "any")}" inputmode="decimal"></div>`;
    }).join("");
    return `<article class="card">
      <h3>${escapeHtml(calculator.title)}</h3>
      <p>${escapeHtml(calculator.description)}</p>
      <div class="calculator" data-calculator="${escapeHtml(calculator.id)}">
        ${fields}
        <button type="button" data-calculate>Calcular</button>
        <div class="result" aria-live="polite">Preencha os campos e calcule.</div>
      </div>
      <p class="meta">${escapeHtml(calculator.limit)}</p>
    </article>`;
  }
  $("#calculatorGrid").innerHTML = data.calculators.map(calculatorHtml).join("");

  function calculate(id, values) {
    if (id === "qsofa") {
      const score = Number(values.rr >= 22) + Number(values.sbp <= 100) + Number(values.mental === "alterado");
      return `<strong>qSOFA = ${score}/3.</strong> Use como alerta prognóstico contextual, nunca como regra isolada para rastrear ou excluir sepse.`;
    }
    if (id === "pf-pbw") {
      const pao2 = Number(values.pao2);
      const fio2Raw = Number(values.fio2);
      const fio2 = fio2Raw > 1 ? fio2Raw / 100 : fio2Raw;
      const height = Number(values.height);
      const base = values.sex === "female" ? 45.5 : 50;
      const pbw = base + 0.91 * (height - 152.4);
      if (!(pao2 > 0 && fio2 > 0 && height > 0)) return "Revise PaO₂, FiO₂ e altura.";
      return `<strong>P/F ≈ ${Math.round(pao2 / fio2)} mmHg · peso predito ≈ ${pbw.toFixed(1)} kg.</strong> Interprete P/F com PEEP, tempo, posição e estabilidade; use peso predito, não peso real, para VT protetor.`;
    }
    return "Calculadora indisponível.";
  }

  $$("#calculatorGrid [data-calculate]").forEach((button) => {
    button.addEventListener("click", () => {
      const calculator = button.closest("[data-calculator]");
      const values = {};
      $$("[data-field]", calculator).forEach((field) => { values[field.dataset.field] = field.value; });
      $(".result", calculator).innerHTML = calculate(calculator.dataset.calculator, values);
    });
  });

  function quizHtml(item, index, kind) {
    return `<article class="card quiz-card" data-answer="${item.correct}">
      <span class="card-tag">${escapeHtml(item.block || kind)}</span>
      <h3>${index + 1}. ${escapeHtml(item.prompt)}</h3>
      <div class="options">${item.options.map((option, optionIndex) =>
        `<button class="option" type="button" data-option="${optionIndex}">${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(option)}</button>`
      ).join("")}</div>
      <div class="feedback" hidden></div>
    </article>`;
  }
  $("#questionGrid").innerHTML = data.questions.map((item, index) => quizHtml(item, index, "Turbo TEMI")).join("");
  $("#caseGrid").innerHTML = data.cases.map((item, index) => quizHtml(item, index, "Caso")).join("");

  $$(".quiz-card").forEach((card) => {
    $$(".option", card).forEach((button) => button.addEventListener("click", () => {
      if (card.dataset.answered === "true") return;
      card.dataset.answered = "true";
      const correct = Number(card.dataset.answer);
      const chosen = Number(button.dataset.option);
      $$(".option", card)[correct].classList.add("correct");
      if (chosen !== correct) button.classList.add("incorrect");
      const source = card.closest("#caseGrid") ? data.cases : data.questions;
      const index = [...card.parentElement.children].indexOf(card);
      const feedback = $(".feedback", card);
      feedback.hidden = false;
      feedback.textContent = `${chosen === correct ? "✅ Correto. " : "🔁 Revise. "}${source[index].explanation}`;
    }));
  });

  const progressKey = `antigravity:${data.meta.slug}:flashcards`;
  let flashIndex = 0;
  let reviewed = [];
  try { reviewed = JSON.parse(localStorage.getItem(progressKey) || "[]"); } catch (_) {}
  const flashCard = $("#flashCard");

  function renderFlashcard() {
    const item = data.flashcards[flashIndex];
    flashCard.classList.remove("revealed");
    flashCard.innerHTML = `
      <div class="question"><span class="card-tag">${escapeHtml(item.topic)}</span><h3>${escapeHtml(item.front)}</h3><p>Toque para revelar</p></div>
      <div class="answer"><span class="card-tag">Resposta</span><h3>${escapeHtml(item.back)}</h3><p>${escapeHtml(item.pearl)}</p></div>`;
    $("#flashProgress").textContent = `Card ${flashIndex + 1}/${data.flashcards.length} · ${reviewed.length} revisado(s) neste dispositivo`;
  }
  flashCard.addEventListener("click", () => flashCard.classList.toggle("revealed"));
  flashCard.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flashCard.classList.toggle("revealed");
    }
  });
  $("#flashNext").addEventListener("click", () => {
    reviewed = [...new Set([...reviewed, data.flashcards[flashIndex].id])];
    try { localStorage.setItem(progressKey, JSON.stringify(reviewed)); } catch (_) {}
    flashIndex = (flashIndex + 1) % data.flashcards.length;
    renderFlashcard();
  });
  $("#flashReset").addEventListener("click", () => {
    reviewed = [];
    try { localStorage.removeItem(progressKey); } catch (_) {}
    renderFlashcard();
  });
  renderFlashcard();

  $("#referenceList").innerHTML = data.references.map((reference) => `
    <li><a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.title)}</a>
      <span class="meta"> · ${escapeHtml(reference.group)} · ${escapeHtml(reference.year)}</span></li>
  `).join("");

  let remaining = 12 * 60;
  let focusTimer = null;
  function renderFocus() {
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const seconds = String(remaining % 60).padStart(2, "0");
    $("#focusTime").textContent = `${minutes}:${seconds}`;
  }
  $("#focusStart").addEventListener("click", () => {
    if (focusTimer) {
      clearInterval(focusTimer);
      focusTimer = null;
      $("#focusStart").textContent = "▶ Retomar";
      return;
    }
    $("#focusStart").textContent = "⏸ Pausar";
    focusTimer = setInterval(() => {
      remaining -= 1;
      renderFocus();
      if (remaining <= 0) {
        clearInterval(focusTimer);
        focusTimer = null;
        remaining = 12 * 60;
        $("#focusStart").textContent = "▶ Novo sprint";
        $("#focusStatus").textContent = "✅ Sprint concluído. Pare 2 minutos e recupere.";
      }
    }, 1000);
  });
  $("#focusReset").addEventListener("click", () => {
    if (focusTimer) clearInterval(focusTimer);
    focusTimer = null;
    remaining = 12 * 60;
    $("#focusStart").textContent = "▶ Iniciar";
    $("#focusStatus").textContent = "Escolha um bloco e foque apenas nele.";
    renderFocus();
  });
  renderFocus();

  document.dispatchEvent(new CustomEvent(data.meta.readyEvent, { detail: { module: data.meta.slug } }));
})();
