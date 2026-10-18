(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const themeKey = "antigravity:a11y:v1";
  const checklistKey = "antigravity:amr:study-checklist:v1";
  const checks = $$("[data-check]");
  let storageAvailable = true;

  function readObject(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) { storageAvailable = false; return {}; }
  }

  const media = window.matchMedia("(prefers-color-scheme: light)");
  function applyTheme() {
    const preference = readObject(themeKey);
    const light = preference.contrast !== true && (
      preference.theme === "light" || (preference.theme === "system" && media.matches) ||
      (!["dark", "light", "system"].includes(preference.theme) && preference.clarity !== false)
    );
    document.documentElement.dataset.theme = light ? "light" : "dark";
    document.documentElement.classList.toggle("a11y-contrast", preference.contrast === true);
    document.documentElement.style.colorScheme = light ? "light" : "dark";
    const button = $("#themeToggle");
    button.textContent = light ? "🌙 Escura" : "☀️ Clara";
    button.setAttribute("aria-pressed", String(light));
    button.setAttribute("aria-label", light ? "Ativar visualização escura" : "Ativar visualização clara com fundo branco");
    $('meta[name="theme-color"]').setAttribute("content", light ? "#ffffff" : "#09131f");
  }

  $("#themeToggle").addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    const preferences = { ...readObject(themeKey), theme: nextTheme, clarity: nextTheme === "light", contrast: false };
    try { localStorage.setItem(themeKey, JSON.stringify(preferences)); applyTheme(); }
    catch (_) {
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.classList.remove("a11y-contrast");
      document.documentElement.style.colorScheme = nextTheme;
      $("#themeToggle").textContent = nextTheme === "light" ? "🌙 Escura" : "☀️ Clara";
      $("#themeToggle").setAttribute("aria-pressed", String(nextTheme === "light"));
      $("#themeToggle").setAttribute("aria-label", nextTheme === "light" ? "Ativar visualização escura" : "Ativar visualização clara com fundo branco");
      $('meta[name="theme-color"]').setAttribute("content", nextTheme === "light" ? "#ffffff" : "#09131f");
    }
  });
  window.addEventListener("storage", (event) => { if (event.key === themeKey || event.key === null) applyTheme(); });
  if (typeof media.addEventListener === "function") media.addEventListener("change", applyTheme);
  else if (typeof media.addListener === "function") media.addListener(applyTheme);
  applyTheme();

  function normalize(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }
  const cards = $$(".mechanism");
  const rows = $$("#doseBody tr");
  const searchIndex = new Map([...cards, ...rows].map((item) => [item, normalize(item.textContent)]));
  function filterContent() {
    const terms = normalize($("#amrSearch").value).split(/\s+/).filter(Boolean);
    const tag = $("#mechanismFilter").value;
    const filter = (items) => {
      let visible = 0;
      items.forEach((item) => {
        const match = (tag === "all" || item.dataset.tags.split(" ").includes(tag)) &&
          terms.every((term) => searchIndex.get(item).includes(term));
        item.hidden = !match;
        if (match) visible += 1;
      });
      return visible;
    };
    const cardCount = filter(cards);
    const rowCount = filter(rows);
    $("#filterStatus").textContent = `${cardCount} de ${cards.length} cenários e ${rowCount} de ${rows.length} esquemas de referência.`;
    $("#emptyMechanisms").hidden = cardCount !== 0;
    $("#emptyDoses").hidden = rowCount !== 0;
  }
  $("#filters").addEventListener("submit", (event) => event.preventDefault());
  $("#amrSearch").addEventListener("input", filterContent);
  $("#mechanismFilter").addEventListener("change", filterContent);
  $("#clearFilters").addEventListener("click", () => {
    $("#amrSearch").value = "";
    $("#mechanismFilter").value = "all";
    filterContent();
    $("#amrSearch").focus();
  });

  function showChecklistStatus() {
    const count = checks.filter((check) => check.checked).length;
    $("#checklistStatus").textContent = `${count} de ${checks.length} itens revisados. Reinicie ao começar uma nova revisão.`;
    $("#storageStatus").textContent = storageAvailable
      ? "Somente as marcações deste roteiro são salvas neste navegador. Nenhum dado de paciente é solicitado ou enviado."
      : "O armazenamento está indisponível. As marcações funcionam nesta página e poderão ser perdidas ao fechar ou recarregar.";
  }
  const saved = readObject(checklistKey);
  checks.forEach((check) => {
    check.checked = saved[check.dataset.check] === true;
    check.addEventListener("change", () => {
      const value = Object.fromEntries(checks.map((item) => [item.dataset.check, item.checked]));
      try { localStorage.setItem(checklistKey, JSON.stringify(value)); storageAvailable = true; }
      catch (_) { storageAvailable = false; }
      showChecklistStatus();
    });
  });
  $("#resetChecklist").addEventListener("click", () => {
    checks.forEach((check) => { check.checked = false; });
    try { localStorage.removeItem(checklistKey); storageAvailable = true; }
    catch (_) { storageAvailable = false; }
    $("#copyStatus").textContent = "";
    showChecklistStatus();
  });
  $("#copyChecklist").addEventListener("click", async () => {
    const text = ["ROTEIRO EDUCACIONAL — MDR/XDR/PDR", "Revisão médica pendente. Sem dados de pacientes.",
      ...$$(".checklist").flatMap((fieldset) => ["", fieldset.querySelector("legend").textContent,
        ...Array.from(fieldset.querySelectorAll("label")).map((label) => `□ ${label.textContent.trim()}`)]),
      "", "Fontes: IDSA 2026, CDC e ANVISA 2023. Reavaliar diariamente; não constitui registro assistencial."].join("\n");
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("clipboard-unavailable");
      await navigator.clipboard.writeText(text);
      $("#copyStatus").textContent = "Roteiro copiado sem marcações salvas. Revise antes de usar.";
    } catch (_) {
      $("#copyStatus").textContent = "Cópia automática indisponível. Selecione o roteiro nesta página ou use Imprimir / Salvar como PDF.";
    }
  });
  $("#printButton").addEventListener("click", () => window.print());
  showChecklistStatus();
  filterContent();
})();
