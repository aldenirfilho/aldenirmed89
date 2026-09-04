"use strict";

(() => {
  const STORAGE_KEY = "antigravity-theme";
  const RELEASE_KEY = "aldenirmed89-theme-release";
  const RELEASE_ID = "bruxa-rustica-moderna-v1";
  const DEFAULT_THEME = "bruxa-rustica-moderna";
  const ACTIVE_THEMES = new Set([
    "bruxa-rustica-moderna",
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
    return ACTIVE_THEMES.has(value) ? value : DEFAULT_THEME;
  }

  function apply(value) {
    const theme = normalize(value);
    root.dataset.theme = theme;
    root.dataset.visualProfile = theme;
    if (selector) selector.value = theme;
    if (themeColor) {
      themeColor.content = theme === "bruxa-rustica-moderna" ? "#0b100c" :
        theme === "total-orange" ? "#0b0603" :
        ["aerospace-light", "rustic-light", "minimal", "sepia", "natural", "modern-serious"].includes(theme)
          ? "#ffffff" : "#071422";
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  let initial = DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const release = localStorage.getItem(RELEASE_KEY);
    const legacyBrandDefault = release !== RELEASE_ID && (!stored || stored === "total-orange");
    initial = legacyBrandDefault ? DEFAULT_THEME : normalize(stored);
    localStorage.setItem(RELEASE_KEY, RELEASE_ID);
  } catch (_) {}
  apply(initial);

  selector?.addEventListener("change", event => apply(event.target.value));
})();
