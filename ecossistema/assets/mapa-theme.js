/* Tema compartilhado com o AldenirMed; executado antes da primeira pintura. */
"use strict";
(() => {
  const SHARED_KEY = "antigravity:a11y:v1";
  const LEGACY_KEY = "aldenirmed89:ecosystem-theme:v1";
  const LIGHT_PROFILES = new Set(["light", "aerospace-light", "minimal", "sepia", "rustic-light", "natural", "modern-serious"]);

  function sharedPreference() {
    try {
      const value = JSON.parse(localStorage.getItem(SHARED_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }

  function read() {
    const shared = sharedPreference();
    if (shared.contrast === true) return "dark";
    if (shared.theme === "system") return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    if (shared.visualProfile) return LIGHT_PROFILES.has(shared.visualProfile) ? "light" : "dark";
    if (["light", "dark"].includes(shared.theme)) return shared.theme;
    if (shared.clarity === true) return "light";
    try { return localStorage.getItem(LEGACY_KEY) === "light" ? "light" : "dark"; }
    catch (_) { return "dark"; }
  }

  function apply(theme, persist = false) {
    const value = theme === "light" ? "light" : "dark";
    if (persist) {
      const shared = sharedPreference();
      Object.assign(shared, {theme: value, visualProfile: value === "light" ? "aerospace-light" : "aerospace", clarity: value === "light", contrast: false});
      try {
        localStorage.setItem(SHARED_KEY, JSON.stringify(shared));
        localStorage.setItem(LEGACY_KEY, value);
      } catch (_) { /* A navegação permanece disponível sem armazenamento local. */ }
    }
    document.documentElement.dataset.theme = value;
    document.documentElement.dataset.highContrast = String(sharedPreference().contrast === true);
    document.documentElement.style.colorScheme = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = value === "light" ? "#f6f3eb" : "#0c2027";
    window.dispatchEvent(new CustomEvent("map360:theme", {detail: value}));
  }

  window.Map360Theme = Object.freeze({read, apply});
  apply(read());
  addEventListener("storage", (event) => {
    if ([SHARED_KEY, LEGACY_KEY, null].includes(event.key)) apply(read());
  });
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (sharedPreference().theme === "system") apply(read());
  });
})();
