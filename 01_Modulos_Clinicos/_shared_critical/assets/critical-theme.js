"use strict";

(() => {
  const root = document.documentElement;
  const preferenceKey = "antigravity:a11y:v1";

  function readPreferences() {
    try {
      const parsed = JSON.parse(localStorage.getItem(preferenceKey) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function applyPreferences(preferences) {
    const fallback = { theme: "dark" };
    const systemLight = matchMedia("(prefers-color-scheme: light)").matches;
    const selected = ["light", "dark", "system"].includes(preferences.theme)
      ? preferences.theme
      : fallback.theme;
    const systemSelected = preferences.theme === "system";
    const light = selected === "light" || (systemSelected && systemLight);
    root.dataset.theme = light ? "light" : "dark";
    root.dataset.themeMode = selected;
    root.style.colorScheme = light ? "light" : "dark";
  }

  applyPreferences(readPreferences());
  window.ANTIGRAVITY_CRITICAL_THEME = {
    key: preferenceKey,
    readPreferences,
    applyPreferences
  };
})();
