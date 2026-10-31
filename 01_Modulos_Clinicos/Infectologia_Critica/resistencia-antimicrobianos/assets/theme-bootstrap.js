(function () {
  "use strict";

  const key = "antigravity:a11y:v1";
  const root = document.documentElement;
  const media = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: light)") : null;
  let preferences = {};

  function readPreferences() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) { return {}; }
  }

  function preferenceTheme() {
    if (["light", "dark", "system"].includes(preferences.theme)) return preferences.theme;
    return preferences.clarity === false ? "dark" : "light";
  }

  function applyTheme() {
    const light = preferences.contrast !== true && (
      preferences.theme === "light" ||
      (preferences.theme === "system" && Boolean(media && media.matches)) ||
      (!["light", "dark", "system"].includes(preferences.theme) && preferences.clarity !== false)
    );
    root.dataset.theme = light ? "light" : "dark";
    root.classList.toggle("a11y-contrast", preferences.contrast === true);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", light ? "#ffffff" : "#091722");
    document.querySelectorAll("[data-clarity-toggle]").forEach(function (button) {
      button.textContent = light ? "🌙 Escura" : "☀️ Clara";
      button.setAttribute("aria-pressed", String(light));
      button.setAttribute("aria-label", light ? "Ativar visualização escura" : "Ativar visualização clara com fundo branco");
    });
    document.querySelectorAll("[data-theme-select]").forEach(function (select) {
      select.value = preferenceTheme();
    });
  }

  function saveTheme(theme) {
    preferences = {
      ...preferences,
      theme: theme === "system" ? "system" : theme === "dark" ? "dark" : "light",
      clarity: theme === "light" || (theme === "system" && Boolean(media && media.matches)),
      contrast: false
    };
    try { window.localStorage.setItem(key, JSON.stringify(preferences)); }
    catch (_) { /* A escolha continua funcionando quando o armazenamento é indisponível. */ }
    applyTheme();
  }

  function bindControls() {
    document.querySelectorAll("[data-clarity-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        saveTheme(root.dataset.theme === "light" ? "dark" : "light");
      });
    });
    document.querySelectorAll("[data-theme-select]").forEach(function (select) {
      select.addEventListener("change", function () { saveTheme(select.value); });
    });
    applyTheme();
  }

  preferences = readPreferences();
  applyTheme();
  window.addEventListener("storage", function (event) {
    if (event.key === key || event.key === null) {
      preferences = readPreferences();
      applyTheme();
    }
  });
  if (media && typeof media.addEventListener === "function") media.addEventListener("change", applyTheme);
  else if (media && typeof media.addListener === "function") media.addListener(applyTheme);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindControls, { once: true });
  else bindControls();
})();
