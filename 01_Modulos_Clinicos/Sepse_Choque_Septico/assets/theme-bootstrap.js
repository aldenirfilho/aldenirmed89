"use strict";

(() => {
  const root = document.documentElement;
  const key = root.dataset.preferenceKey || "antigravity:a11y:v1";
  const media = window.matchMedia("(prefers-color-scheme: light)");
  let preferences = {};

  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) preferences = parsed;
  } catch (_) {
    preferences = {};
  }

  const preferredTheme = ["light", "dark", "system"].includes(preferences.theme)
    ? preferences.theme
    : "dark";
  const systemLight = media.matches;
  const clarity = preferences.contrast === true
    ? false
    : preferences.clarity === true || preferredTheme === "light" || (preferredTheme === "system" && systemLight);

  root.dataset.theme = clarity ? "light" : "dark";
  root.classList.toggle("a11y-contrast", preferences.contrast === true);
  root.style.colorScheme = clarity ? "light" : "dark";
  window.SEPSE_THEME = { key, media };
})();
