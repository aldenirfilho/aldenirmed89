"use strict";

(() => {
  const STORAGE_KEY = "antigravity-theme";
  const ACTIVE_THEMES = new Set([
    "total-orange",
    "mystic-aerospace",
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
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function normalize(value) {
    return ACTIVE_THEMES.has(value) ? value : "total-orange";
  }

  function apply(value) {
    const theme = normalize(value);
    root.dataset.theme = theme;
    if (selector) selector.value = theme;
    if (themeColor) {
      themeColor.content = theme === "total-orange" ? "#0b0603" :
        ["aerospace-light", "rustic-light", "minimal", "sepia", "natural", "modern-serious"].includes(theme)
          ? "#ffffff" : "#071422";
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  let initial = "total-orange";
  try { initial = normalize(localStorage.getItem(STORAGE_KEY)); } catch (_) {}
  apply(initial);

  selector?.addEventListener("change", event => apply(event.target.value));
})();
