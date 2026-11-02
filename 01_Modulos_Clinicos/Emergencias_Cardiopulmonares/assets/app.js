(function () {
  "use strict";

  const data = window.ECP_TEMI;
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
  const fmt = (value, digits = 1) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  const num = (form, name) => {
    const field = form.elements[name];
    if (!field || field.value === "") return null;
    const value = Number(String(field.value).replace(",", "."));
    return Number.isFinite(value) ? value : null;
  };

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

  /* ---------- tema e foco (padrão do portal) ---------- */
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
      preferences = { ...preferences, clarity: !clarity, theme: clarity ? "dark" : "light" };
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
    container.dataset.level = result.level;
    container.innerHTML = `
      <span class="result-state">${escapeHtml(result.state)}</span>
      <h3>${escapeHtml(result.title)}</h3>
      ${result.lead ? `<p>${escapeHtml(result.lead)}</p>` : ""}
      ${result.items?.length ? list(result.items) : ""}
      ${result.alert ? `<p class="result-alert">⚠️ ${escapeHtml(result.alert)}</p>` : ""}`;
  }

  /* ---------- Ferramenta 1: FA ---------- */
  function initAf() {
    const form = $("#afForm");
    const output = $("#afResult");
    if (!form || !output) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const has = (name) => form.elements[name]?.checked === true;
      const unstable = ["hypotension", "ischemia", "heartFailure", "consciousness"].some(has);

      if (has("preexcited")) {
        renderResult(output, unstable ? {
          level: "critical",
          state: "Pré-excitação instável",
          title: "Cardioversão elétrica sincronizada imediata.",
          lead: "FA conduzida pela via acessória pode degenerar em FV.",
          items: [
            "Sedação e analgesia com via aérea preparada; desfibrilador em modo sincronizado.",
            "Nenhum bloqueador do nó AV: adenosina, verapamil/diltiazem, betabloqueador, digital e amiodarona IV.",
            "Após estabilizar: anticoagulação conforme duração e risco; encaminhar para ablação da via acessória."
          ]
        } : {
          level: "urgent",
          state: "Pré-excitação estável",
          title: "Ibutilida ou procainamida — ou cardioversão eletiva.",
          lead: "No Brasil esses fármacos raramente estão disponíveis; a cardioversão elétrica sob sedação é a rota segura.",
          items: [
            "Proibidos: adenosina, verapamil/diltiazem, betabloqueador, digital e amiodarona IV.",
            "Monitorização contínua com desfibrilador ao lado.",
            "Discutir com eletrofisiologia: ablação da via acessória elimina o risco de morte súbita."
          ]
        });
        return;
      }

      if (unstable) {
        renderResult(output, {
          level: "critical",
          state: has("trigger") ? "Instável com gatilho ativo" : "Instável",
          title: has("trigger")
            ? "Pergunte: a FA causa o choque ou é consequência dele?"
            : "Cardioversão elétrica sincronizada já.",
          lead: has("trigger")
            ? "Se a instabilidade é atribuível à FC (em geral >150 bpm), cardioverta; se a FA é resposta ao gatilho, trate o gatilho em paralelo — a cardioversão tende a recidivar."
            : "A vida vem antes do êmbolo: não aguarde anticoagulação para reverter um paciente instável.",
          items: [
            "Choque sincronizado bifásico; ERC 2021 prefere carga máxima no primeiro choque para FA.",
            "Sedação/analgesia com vasopressor pronto se a PA for limítrofe.",
            "Recidiva após cardioversão: amiodarona IV e correção de K⁺/Mg²⁺.",
            "Iniciar anticoagulação assim que possível, se não houver contraindicação."
          ],
          alert: has("longDuration") && !has("anticoagulated")
            ? "FA ≥24 h sem anticoagulação: o risco embólico existe, mas não impede a cardioversão no instável. Anticoagule logo após."
            : ""
        });
        return;
      }

      const rate = [];
      if (has("lowEf")) {
        rate.push("FEVE reduzida: amiodarona IV ou digital; betabloqueador só se compensado e com cautela. Evite diltiazem/verapamil.");
      } else if (has("bronchospasm")) {
        rate.push("Broncoespasmo com FEVE preservada: diltiazem IV é a escolha natural; evite betabloqueador não seletivo.");
      } else {
        rate.push("FEVE preservada: betabloqueador (metoprolol/esmolol) ou diltiazem IV.");
      }
      rate.push("Alvo inicial: FC <110 bpm em repouso (RACE II).");
      if (has("trigger")) rate.unshift("Trate o gatilho primeiro: volume guiado por resposta, oxigenação, analgesia, infecção, K⁺ e Mg²⁺.");

      let alert = "";
      if (has("longDuration") && !has("anticoagulated")) {
        rate.push("Ritmo: NÃO cardioverter agora. ≥3 semanas de anticoagulação OU ETE excluindo trombo.");
        alert = "Amiodarona pode reverter quimicamente o ritmo: a reversão química também emboliza.";
      } else if (has("longDuration") && has("anticoagulated")) {
        rate.push("Ritmo: cardioversão eletiva possível com anticoagulação contínua; mantenha ≥4 semanas depois.");
      } else {
        rate.push("Ritmo: início bem definido <24 h (ESC) permite cardioversão precoce com anticoagulação periprocedimento — ou aguardar a reversão espontânea.");
      }
      rate.push("Anticoagulação de longo prazo: decidir pelo CHA₂DS₂-VA (calculadora abaixo).");

      renderResult(output, {
        level: has("trigger") ? "urgent" : "watch",
        state: "Estável",
        title: "Controle de frequência e decisão embólica.",
        lead: "Estratégia de FC e anticoagulação são decisões independentes.",
        items: rate,
        alert
      });
    });
    form.addEventListener("reset", () => {
      output.dataset.level = "";
      output.innerHTML = `<span class="result-state">Aguardando achados</span><h3>Comece pela estabilidade e pelo ECG.</h3><p>Instável de verdade? Cardioversão elétrica sincronizada não espera esta ferramenta.</p>`;
    });
  }

  function renderAfDrugs() {
    const grid = $("#afDrugs");
    if (!grid) return;
    grid.innerHTML = data.afDrugs.map((drug) => `
      <article class="drug-card">
        <h3>${escapeHtml(drug.name)}</h3>
        <dl>
          <dt>Ataque</dt><dd>${escapeHtml(drug.load)}</dd>
          <dt>Manutenção</dt><dd>${escapeHtml(drug.maint)}</dd>
          <dt>👍 Melhor cenário</dt><dd>${escapeHtml(drug.best)}</dd>
          <dt>👎 Evitar</dt><dd>${escapeHtml(drug.avoid)}</dd>
        </dl>
      </article>`).join("");
  }

  function renderAfWindows() {
    const box = $("#afWindows");
    if (!box) return;
    box.innerHTML = data.afWindows.map((item) => `
      <article class="window-row" data-level="${escapeHtml(item.level)}">
        <b>${escapeHtml(item.scenario)}</b>
        <span>${escapeHtml(item.action)}</span>
      </article>`).join("");
  }

  /* ---------- Ferramenta 2: EAP ---------- */
  function initEap() {
    const form = $("#eapForm");
    const output = $("#eapResult");
    if (!form || !output) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const has = (name) => form.elements[name]?.checked === true;
      const sbp = num(form, "sbp");
      const rr = num(form, "rr");
      const spo2 = num(form, "spo2");
      if (sbp === null) {
        renderResult(output, { level: "watch", state: "Falta a PAS", title: "Informe a pressão sistólica.", lead: "PAS e perfusão definem o primeiro passo." });
        return;
      }
      const distress = (spo2 !== null && spo2 < 90) || (rr !== null && rr > 25);
      const ventilation = distress
        ? (has("hypercapnia") ? "Desconforto respiratório com hipercapnia: BiPAP (IPAP 10–15 / EPAP 5–8 cmH₂O)." : "Desconforto respiratório: VNI agora (CPAP 5–10 cmH₂O ou BiPAP).")
        : "Sem desconforto importante: oxigênio só se SpO₂ <90%; reavaliar com frequência.";
      const nitrateBlock = has("pde5") || sbp < 90;

      let result;
      if (has("hypoperfusion") || sbp < 90) {
        result = {
          level: "critical", state: "Choque cardiogênico",
          title: "Perfusão primeiro: vasodilatador está proibido.",
          items: [
            "Noradrenalina para restaurar perfusão; dobutamina se baixo débito persistir.",
            "ECG e troponina: SCA → hemodinâmica de emergência para o vaso culpado.",
            "POCUS: FEVE, VD, derrame, valvas; discutir suporte circulatório mecânico.",
            distress ? "VNI ou intubação podem derrubar a PA: deixe o vasopressor correndo antes." : "Oxigênio conforme SpO₂; prepare a via aérea."
          ]
        };
      } else if (has("mechanical")) {
        result = {
          level: "critical", state: "Suspeita mecânica/valvar",
          title: "Ecocardiograma urgente e cirurgia — nenhuma droga resolve.",
          items: [
            "Ruptura de músculo papilar, CIV pós-IAM ou regurgitação aguda grave.",
            nitrateBlock ? "PA não permite vasodilatador: suporte hemodinâmico e equipe cirúrgica." : "Ponte com redução de pós-carga (nitroprussiato) se a PA permitir; considerar balão intra-aórtico.",
            ventilation
          ]
        };
      } else if (sbp >= 140 && has("sudden") && !has("overload")) {
        result = {
          level: "urgent", state: "Vascular / SCAPE",
          title: "VNI + nitroglicerina IV titulada.",
          items: [
            ventilation,
            nitrateBlock ? "Nitrato bloqueado (iPDE5 ou suspeita de IAM de VD): discuta alternativa de redução de pós-carga." : "Nitroglicerina 10–20 mcg/min, ↑ 5–10 mcg/min a cada 3–5 min até ~200 mcg/min.",
            "Diurético em dose baixa ou após controlar a pós-carga: a paciente é euvolêmica.",
            "Procure gatilho: isquemia, crise hipertensiva, FA, não adesão."
          ]
        };
      } else if (has("overload")) {
        result = {
          level: sbp < 110 ? "urgent" : "watch", state: "Congestão sistêmica",
          title: "Diurético de alça IV em dose adequada.",
          items: [
            ventilation,
            "Furosemida: 20–40 mg IV se virgem; 1–2× a dose oral diária se já usa (calculadora abaixo).",
            sbp > 110 && !nitrateBlock ? "PAS >110 mmHg: vasodilatador pode ser associado para alívio sintomático." : "PAS ≤110 mmHg ou nitrato bloqueado: sem vasodilatador.",
            "Sódio urinário em 2 h e diurese em 6 h: resposta insuficiente → dobrar a dose."
          ]
        };
      } else if (sbp >= 140) {
        result = {
          level: "urgent", state: "Predomínio vascular",
          title: "Pós-carga alta: vasodilatador + VNI conforme o esforço.",
          items: [ventilation, nitrateBlock ? "Nitrato bloqueado: discutir alternativa." : "Nitroglicerina IV titulada.", "Diurético conforme a volemia real."]
        };
      } else {
        result = {
          level: "watch", state: "Fenótipo indefinido",
          title: "Reavalie o diagnóstico antes de tratar como EAP.",
          items: [ventilation, "POCUS: linhas B difusas e bilaterais? VCI pletórica? Padrão heterogêneo sugere pneumonia/SDRA.", "Considere TEP, DPOC exacerbada, pneumonia e SDRA."]
        };
      }
      if (nitrateBlock && result.state !== "Choque cardiogênico") result.alert = "Nitrato contraindicado: PAS <90 mmHg, iPDE5 recente ou IAM de VD.";
      renderResult(output, result);
    });
    form.addEventListener("reset", () => {
      output.dataset.level = "";
      output.innerHTML = `<span class="result-state">Aguardando dados</span><h3>PAS e perfusão definem o primeiro passo.</h3><p>Hipoxemia com desconforto respiratório? Inicie a VNI enquanto fenotipa.</p>`;
    });
  }

  function renderEapStatic() {
    const pheno = $("#eapPhenotypes");
    if (pheno) {
      pheno.innerHTML = data.eapPhenotypes.map((item) => `
        <article class="pheno-card" data-pheno="${escapeHtml(item.id)}">
          <h3>${escapeHtml(item.name)}</h3>
          <p><b>Retrato:</b> ${escapeHtml(item.portrait)}</p>
          <p><b>Pilar:</b> ${escapeHtml(item.pillar)}</p>
          <p class="pheno-caution"><b>Cuidado:</b> ${escapeHtml(item.caution)}</p>
        </article>`).join("");
    }
    const support = $("#eapSupport");
    if (support) {
      support.insertAdjacentHTML("beforeend", `<thead><tr><th scope="col">Modalidade</th><th scope="col">Ajuste inicial</th><th scope="col">Racional</th></tr></thead><tbody>${data.eapSupport.map((row) => `<tr><th scope="row">${escapeHtml(row.mode)}</th><td>${escapeHtml(row.setting)}</td><td>${escapeHtml(row.why)}</td></tr>`).join("")}</tbody>`);
    }
    const drugs = $("#eapDrugs");
    if (drugs) {
      drugs.insertAdjacentHTML("beforeend", `<thead><tr><th scope="col">Droga</th><th scope="col">Dose de referência</th><th scope="col">Quando</th></tr></thead><tbody>${data.eapDrugs.map((row) => `<tr><th scope="row">${escapeHtml(row.drug)}</th><td>${escapeHtml(row.dose)}</td><td>${escapeHtml(row.when)}</td></tr>`).join("")}</tbody>`);
    }
  }

  /* ---------- Ferramenta 3: calculadoras ---------- */
  const calcOut = (form, level, html) => {
    const out = $(".calc-out", form);
    out.dataset.level = level;
    out.innerHTML = html;
  };
  const checkedSum = (form) => $$('input[type="checkbox"]', form)
    .filter((input) => input.checked && input.name !== "female")
    .reduce((total, input) => total + Number(input.value || 0), 0);

  const calculators = {
    calcCha(form) {
      const has = (name) => form.elements[name].checked;
      let warn = "";
      let score = checkedSum(form);
      if (has("age75") && has("age65")) {
        score -= 1;
        warn = "<br><small>⚠️ Marque só uma faixa etária (contada a de ≥75).</small>";
      }
      const vasc = score + (has("female") ? 1 : 0);
      let level = "watch";
      let text = "0 → anticoagulação não indicada pelo escore; reavaliar periodicamente.";
      if (score === 1) { level = "urgent"; text = "1 → anticoagulação deve ser considerada (ESC 2024, IIa)."; }
      if (score >= 2) { level = "critical"; text = "≥2 → anticoagulação recomendada (ESC 2024, I), preferindo DOAC."; }
      calcOut(form, level, `<b>CHA₂DS₂-VA = ${score}</b> · ${text}<br><small>CHA₂DS₂-VASc (AHA 2023) = ${vasc}: recomendada se ≥2 em homens ou ≥3 em mulheres.</small>${warn}`);
    },
    calcHasbled(form) {
      const score = checkedSum(form);
      const high = score >= 3;
      calcOut(form, high ? "urgent" : "watch", `<b>HAS-BLED = ${score}</b> · ${high ? "Alto risco: corrija o modificável (PA, AINE, álcool, INR lábil, antiagregante desnecessário) e revise com mais frequência." : "Risco não elevado pelo escore."}<br><small>Escore alto não é motivo isolado para não anticoagular.</small>`);
    },
    calcHeart(form) {
      const score = ["h", "e", "a", "r", "t"].reduce((total, key) => total + Number(form.elements[key].value), 0);
      let level = "watch";
      let text = "Baixo risco (0–3): MACE em 6 semanas ~2%; considerar alta com seguimento se o protocolo de troponina for negativo.";
      if (score >= 4 && score <= 6) { level = "urgent"; text = "Risco intermediário (4–6): observação, troponina seriada e investigação."; }
      if (score >= 7) { level = "critical"; text = "Alto risco (7–10): conduta como SCA e estratégia invasiva precoce."; }
      calcOut(form, level, `<b>HEART = ${score}</b> · ${text}<br><small>Não se aplica a STEMI ou equivalente de oclusão.</small>`);
    },
    calcTimi(form) {
      const score = checkedSum(form);
      const risk = { 0: "4,7", 1: "4,7", 2: "8,3", 3: "13,2", 4: "19,9", 5: "26,2", 6: "40,9", 7: "40,9" }[score];
      const level = score >= 5 ? "critical" : score >= 3 ? "urgent" : "watch";
      calcOut(form, level, `<b>TIMI = ${score}</b> · morte, IAM ou revascularização urgente em 14 dias ≈ ${risk}% (coorte original).<br><small>Na prática atual, prefira GRACE para definir o tempo da estratégia invasiva.</small>`);
    },
    calcSgarbossa(form) {
      const score = checkedSum(form);
      const st = num(form, "st");
      const s = num(form, "s");
      let smith = "";
      let positive = score >= 3;
      if (st !== null && s !== null && s > 0) {
        const ratio = st / s;
        const smithPositive = st >= 1 && ratio >= 0.25;
        positive = positive || smithPositive;
        smith = `<br>Razão ST/S = ${fmt(ratio, 2)} → ${smithPositive ? "<b>Smith positivo (supra discordante ≥1 mm e razão ≥0,25)</b>" : st < 1 ? "Smith não se aplica: exige supra discordante ≥1 mm" : "Smith negativo (&lt;0,25)"}`;
      }
      calcOut(form, positive ? "critical" : "watch", `<b>Sgarbossa = ${score}</b> · ${score >= 3 ? "≥3: alta especificidade para IAM." : "&lt;3: não exclui IAM — a sensibilidade é baixa."}${smith}${positive ? "<br><b>Tratar como equivalente de oclusão: acionar hemodinâmica.</b>" : ""}`);
    },
    calcKillip(form) {
      const value = form.elements.k.value;
      if (!value) { calcOut(form, "watch", "Selecione a classe."); return; }
      const map = {
        1: ["watch", "Classe I: mortalidade hospitalar ~6% na série original."],
        2: ["urgent", "Classe II: ~17% na era pré-reperfusão."],
        3: ["critical", "Classe III: EAP — ~38% históricos. VNI e vasodilatador se PA permitir."],
        4: ["critical", "Classe IV: choque cardiogênico — ~81% na série original de 1967. Hemodinâmica e suporte."]
      };
      const [level, text] = map[value];
      calcOut(form, level, `<b>Killip ${["", "I", "II", "III", "IV"][Number(value)]}</b> · ${text}<br><small>Números de séries pré-reperfusão: hoje menores, mas a hierarquia de risco se mantém.</small>`);
    },
    calcTnk(form) {
      const weight = num(form, "weight");
      const age = num(form, "age");
      if (weight === null || age === null) { calcOut(form, "watch", "Informe peso e idade."); return; }
      const rules = data.doseRules;
      const band = rules.tnkBands.find((item) => item.maxKgExclusive === null || weight < item.maxKgExclusive);
      const half = age >= rules.tnkHalfDoseAge;
      const mg = half ? band.mg / 2 : band.mg;
      const ml = mg / rules.tnkConcentrationMgPerMl;
      calcOut(form, "critical", `<b>${fmt(mg)} mg IV em bólus único</b> (${fmt(ml)} mL a ${rules.tnkConcentrationMgPerMl} mg/mL)<br><small>Faixa ${escapeHtml(band.label)} = ${band.mg} mg${half ? " → meia-dose por idade ≥75 anos" : ""}. Associar antiagregação e anticoagulação adjuvantes.</small>`);
    },
    calcUfh(form) {
      const weight = num(form, "weight");
      if (weight === null) { calcOut(form, "watch", "Informe o peso."); return; }
      const r = data.doseRules.ufhFibrinolysis;
      const bolus = Math.min(r.bolusUnitsPerKg * weight, r.bolusMaxUnits);
      const infusion = Math.min(r.infusionUnitsPerKgH * weight, r.infusionMaxUnitsH);
      calcOut(form, "urgent", `<b>Bólus ${fmt(bolus, 0)} UI IV</b> (60 UI/kg, máx. 4.000)<br><b>Infusão ${fmt(infusion, 0)} UI/h</b> (12 UI/kg/h, máx. 1.000)<br><small>Manter 24–48 h, ajustando pelo TTPa.</small>`);
    },
    calcEnoxa(form) {
      const weight = num(form, "weight");
      const age = num(form, "age");
      const crcl = num(form, "crcl");
      if (weight === null || age === null || crcl === null) { calcOut(form, "watch", "Informe peso, idade e ClCr."); return; }
      if (crcl < 15) { calcOut(form, "critical", "<b>ClCr &lt;15 mL/min:</b> enoxaparina não recomendada — preferir HNF IV com TTPa."); return; }
      if (form.elements.ctx.value === "nste") {
        const interval = crcl < 30 ? "a cada 24 h" : "a cada 12 h";
        const dose = 1 * weight;
        calcOut(form, "urgent", `<b>${fmt(dose)} mg SC ${interval}</b> (1 mg/kg)${crcl < 30 ? "<br><small>ClCr &lt;30: intervalo de 24 h.</small>" : ""}<br><small>Arredondar conforme a seringa disponível.</small>`);
        return;
      }
      const lysis = data.doseRules.enoxaparinFibrinolysis;
      if (crcl < 30) {
        const renal = lysis.crclBelow30;
        const dose = renal.scMgPerKg * weight;
        const bolus = age < 75 ? `<b>Bólus ${lysis.under75.ivBolusMg} mg IV</b>, depois em 15 min:<br>` : "<b>Sem bólus IV</b> (≥75 anos)<br>";
        calcOut(form, "critical", `${bolus}<b>${fmt(dose)} mg SC ${renal.interval}</b> (${fmt(renal.scMgPerKg, 2)} mg/kg)<br><small>ClCr &lt;30: ${escapeHtml(renal.note)}. Considerar HNF se a função renal for instável.</small>`);
        return;
      }
      const rule = age >= 75 ? lysis.age75plus : lysis.under75;
      const dose = rule.scMgPerKg * weight;
      const firstDoses = Math.min(dose, rule.firstTwoDosesMaxMg);
      const bolus = rule.ivBolusMg ? `<b>Bólus ${rule.ivBolusMg} mg IV</b>, depois em 15 min:<br>` : "<b>Sem bólus IV</b> (≥75 anos)<br>";
      const capped = dose > rule.firstTwoDosesMaxMg
        ? `<b>1ª e 2ª doses: ${fmt(firstDoses)} mg SC</b> (teto de ${rule.firstTwoDosesMaxMg} mg) → depois <b>${fmt(dose)} mg SC a cada 12 h</b>`
        : `<b>${fmt(dose)} mg SC a cada 12 h</b>`;
      calcOut(form, "urgent", `${bolus}${capped} (${fmt(rule.scMgPerKg, 2)} mg/kg)<br><small>Até a revascularização ou alta, por até 8 dias. Arredondar conforme a seringa disponível.</small>`);
    },
    calcCg(form) {
      const age = num(form, "age");
      const weight = num(form, "weight");
      const cr = num(form, "cr");
      if (age === null || weight === null || cr === null || cr <= 0) { calcOut(form, "watch", "Informe idade, peso e creatinina."); return; }
      const value = ((140 - age) * weight) / (72 * cr) * (form.elements.sex.value === "f" ? 0.85 : 1);
      const level = value < 30 ? "critical" : value < 60 ? "urgent" : "watch";
      calcOut(form, level, `<b>ClCr ≈ ${fmt(value, 0)} mL/min</b>${value < 30 ? " · ajustar heparina de baixo peso, DOAC e digital." : ""}`);
      const enoxaCrcl = $("#calcEnoxa")?.elements.crcl;
      if (enoxaCrcl && !enoxaCrcl.value) enoxaCrcl.placeholder = `≈ ${Math.round(value)}`;
    },
    calcFuro(form) {
      const prior = form.elements.prior.value;
      if (prior === "no") {
        calcOut(form, "watch", "<b>Furosemida 20–40 mg IV</b> (virgem de diurético, ESC 2021).<br><small>Dose maior se congestão importante ou DRC.</small>");
        return;
      }
      const home = num(form, "home");
      if (home === null || home <= 0) { calcOut(form, "watch", "Informe a dose oral diária de furosemida."); return; }
      calcOut(form, "urgent", `<b>${fmt(home, 0)}–${fmt(home * 2, 0)} mg IV</b> por dia (1–2× a dose oral, ESC 2021), em bólus ou infusão.<br><small>DOSE: 2,5× não diferiu nos desfechos primários (sintomas, p=0,06; creatinina), mas trouxe mais diurese e alívio de dispneia nos secundários, com piora transitória da creatinina.</small>`);
    }
  };

  function initCalculators() {
    Object.entries(calculators).forEach(([id, fn]) => {
      const form = document.getElementById(id);
      if (!form) return;
      const run = () => fn(form);
      form.addEventListener("input", run);
      form.addEventListener("change", run);
      form.addEventListener("submit", (event) => { event.preventDefault(); run(); });
    });
    $$(".calc-filter [data-filter]").forEach((button) => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      $$(".calc-filter [data-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      $$(".calc-card").forEach((card) => {
        const groups = (card.dataset.group || "").split(" ");
        card.hidden = filter !== "all" && !groups.includes(filter);
      });
    }));
  }

  /* ---------- pós-alta ---------- */
  function renderChronic() {
    const grid = $("#chronicPillars");
    if (grid) {
      grid.innerHTML = data.chronicPillars.map((pillar, index) => `
        <article class="pillar-card">
          <span class="pillar-index">${index + 1}</span>
          <h3>${escapeHtml(pillar.title)}</h3>
          <p>${escapeHtml(pillar.do)}</p>
          <p class="pillar-nuance">${escapeHtml(pillar.nuance)}</p>
        </article>`).join("");
    }
    const listBox = $("#dischargeChecklist");
    if (!listBox) return;
    const key = `${localPrefix}:checklist`;
    const checked = new Set(storage.get(key, []));
    const render = () => {
      listBox.innerHTML = data.dischargeChecklist.map((item) => `
        <li><label class="check-row"><input type="checkbox" data-check="${escapeHtml(item.id)}" ${checked.has(item.id) ? "checked" : ""}> ${escapeHtml(item.text)}</label></li>`).join("");
      $$("[data-check]", listBox).forEach((input) => input.addEventListener("change", () => {
        if (input.checked) checked.add(input.dataset.check);
        else checked.delete(input.dataset.check);
        storage.set(key, Array.from(checked));
      }));
    };
    render();
    $("#checklistReset")?.addEventListener("click", () => {
      checked.clear();
      storage.remove(key);
      render();
    });
    $("#printPage")?.addEventListener("click", () => window.print());
  }

  /* ---------- treino ---------- */
  const state = {
    trainingMode: "cases",
    trainingIndex: { cases: 0, questions: 0, flashcards: 0 },
    selectedAnswers: storage.get(`${localPrefix}:answers`, {}),
    revealedFlashcards: new Set(storage.get(`${localPrefix}:flashcards`, []))
  };

  function renderScore() {
    const line = $("#trainingScore");
    if (!line) return;
    const graded = ["cases", "questions"].flatMap((mode) => data[mode]);
    const answered = graded.filter((item) => state.selectedAnswers[item.id] !== undefined);
    const correct = answered.filter((item) => state.selectedAnswers[item.id] === item.answer).length;
    line.textContent = answered.length ? `🎯 ${correct}/${answered.length} acertos em ${graded.length} itens com gabarito` : "";
  }

  function renderTraining() {
    const collection = data[state.trainingMode];
    const index = state.trainingIndex[state.trainingMode];
    const item = collection[index];
    const panel = $("#trainingPanel");
    const progress = $("#trainingProgress");
    if (!panel || !progress) return;
    progress.value = ((index + 1) / collection.length) * 100;
    progress.textContent = `${Math.round(progress.value)}%`;
    renderScore();

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

    $$("[data-answer]", panel).forEach((button) => button.addEventListener("click", () => {
      state.selectedAnswers[item.id] = Number(button.dataset.answer);
      storage.set(`${localPrefix}:answers`, state.selectedAnswers);
      renderTraining();
    }));
  }

  function initTraining() {
    $$(".training-nav .training-tab").forEach((button) => button.addEventListener("click", () => {
      state.trainingMode = button.dataset.training;
      $$(".training-nav .training-tab").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderTraining();
    }));
    $("#trainingPrev")?.addEventListener("click", () => {
      const length = data[state.trainingMode].length;
      state.trainingIndex[state.trainingMode] = (state.trainingIndex[state.trainingMode] - 1 + length) % length;
      renderTraining();
    });
    $("#trainingNext")?.addEventListener("click", () => {
      const length = data[state.trainingMode].length;
      state.trainingIndex[state.trainingMode] = (state.trainingIndex[state.trainingMode] + 1) % length;
      renderTraining();
    });
    $("#trainingReset")?.addEventListener("click", () => {
      state.revealedFlashcards.clear();
      state.selectedAnswers = {};
      ["flashcards", "answers"].forEach((key) => storage.remove(`${localPrefix}:${key}`));
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
  initAf();
  renderAfDrugs();
  renderAfWindows();
  initEap();
  renderEapStatic();
  initCalculators();
  renderChronic();
  initTraining();
  renderReferences();

  document.dispatchEvent(new CustomEvent("antigravity:ecp-temi-ready", { detail: { version: data.meta.version } }));
})();
