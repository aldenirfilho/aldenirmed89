"use strict";

(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("themeToggle");
  const printButton = document.getElementById("printModule");
  const expandButton = document.getElementById("expandAll");
  const preferenceKey = "antigravity:a11y:v1";

  function readPreferences() {
    try {
      const value = JSON.parse(localStorage.getItem(preferenceKey) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeTheme(theme) {
    const preferences = readPreferences();
    preferences.theme = theme;
    preferences.clarity = theme === "light";
    preferences.contrast = false;
    preferences.visualProfile = theme === "light" ? "aerospace-light" : "bruxa-rustica-moderna";
    const themeEngine = window.ANTIGRAVITY_CRITICAL_THEME;
    themeEngine?.applyPreferences(preferences);
    if (!themeEngine) {
      root.dataset.theme = theme;
      root.dataset.themeMode = theme;
      root.dataset.visualProfile = preferences.visualProfile;
      root.style.colorScheme = theme;
    }
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(preferences));
    } catch (_) {
      // A preferência visual é opcional; o módulo continua funcional sem storage.
    }
  }

  function syncThemeButton() {
    if (!themeButton) return;
    const light = root.dataset.theme === "light";
    themeButton.textContent = light ? "🌙" : "☀️";
    themeButton.setAttribute("aria-pressed", String(light));
    themeButton.setAttribute("aria-label", light ? "Ativar visualização escura" : "Ativar visualização clara");
  }

  themeButton?.addEventListener("click", () => {
    const theme = root.dataset.theme === "light" ? "dark" : "light";
    writeTheme(theme);
    syncThemeButton();
  });

  printButton?.addEventListener("click", () => window.print());
  syncThemeButton();

  const expandable = Array.from(document.querySelectorAll("details"));
  expandButton?.addEventListener("click", () => {
    const shouldOpen = expandable.some((item) => !item.open);
    expandable.forEach((item) => { item.open = shouldOpen; });
    expandButton.setAttribute("aria-pressed", String(shouldOpen));
    expandButton.textContent = shouldOpen ? "Fechar detalhes" : "Abrir detalhes";
  });

  const wakeChecks = Array.from(document.querySelectorAll("[data-wake-check]"));
  const wakeResult = document.getElementById("wakeResult");

  function updateWakeGate() {
    if (!wakeResult) return;
    const checked = wakeChecks.filter((input) => input.checked).length;
    const complete = checked === wakeChecks.length && wakeChecks.length > 0;
    wakeResult.classList.toggle("ready", complete);
    wakeResult.textContent = complete
      ? `${checked}/${wakeChecks.length} condições confirmadas — elegível para discussão à beira-leito; faça briefing e defina critérios de abortagem.`
      : `${checked}/${wakeChecks.length} condições confirmadas — mantenha a sedação e reavalie o motivo pendente.`;
  }

  wakeChecks.forEach((input) => input.addEventListener("change", updateWakeGate));
  updateWakeGate();

  const search = document.getElementById("asynchronySearch");
  const filter = document.getElementById("asynchronyFilter");
  const cards = Array.from(document.querySelectorAll(".async-card"));
  const count = document.getElementById("asynchronyCount");
  const empty = document.getElementById("asynchronyEmpty");

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  function filterAsynchronies() {
    const query = normalize(search?.value);
    const category = filter?.value || "all";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize(`${card.dataset.search || ""} ${card.textContent || ""}`);
      const categoryMatches = category === "all" || card.dataset.category === category;
      const queryMatches = !query || haystack.includes(query);
      card.hidden = !(categoryMatches && queryMatches);
      if (!card.hidden) visible += 1;
    });

    if (count) count.textContent = `${visible} de ${cards.length} padrões`;
    if (empty) empty.hidden = visible !== 0;
  }

  search?.addEventListener("input", filterAsynchronies);
  filter?.addEventListener("change", filterAsynchronies);
  filterAsynchronies();

  const copyStatus = document.getElementById("copyStatus");

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.className = "clipboard-fallback";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    if (!copied) throw new Error("copy-unavailable");
  }

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget || "");
      if (!target) return;
      try {
        await copyText(target.textContent || "");
        if (copyStatus) copyStatus.textContent = "Checklist copiado. Remova identificadores antes de colar em qualquer sistema.";
      } catch (_) {
        if (copyStatus) copyStatus.textContent = "Não foi possível copiar automaticamente; selecione o texto manualmente.";
      }
    });
  });

  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".module-nav a"));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (!active) return;
      navLinks.forEach((link) => {
        const selected = link.getAttribute("href") === `#${active.target.id}`;
        link.classList.toggle("active", selected);
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -65%", threshold: [0.01, 0.25] });
    sections.forEach((section) => observer.observe(section));
  }
})();
