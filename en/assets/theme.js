"use strict";

(() => {
  const STORAGE_KEY = "antigravity-theme";
  const ACTIVE_THEMES = new Set([
    "aerospace",
    "aerospace-light",
    "rustic-light",
    "dark",
    "minimal",
    "sepia",
    "oceanic",
    "green",
    "natural",
    "forest",
    "wizard-academy",
    "comic-hero",
    "modern-serious"
  ]);
  const root = document.documentElement;
  const selector = document.querySelector("[data-theme-selector]");

  function normalize(value) {
    return ACTIVE_THEMES.has(value) ? value : "aerospace";
  }

  function apply(value) {
    const theme = normalize(value);
    root.dataset.theme = theme;
    if (selector) selector.value = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  let initial = "aerospace";
  try { initial = normalize(localStorage.getItem(STORAGE_KEY)); } catch (_) {}
  apply(initial);

  selector?.addEventListener("change", event => apply(event.target.value));
})();
