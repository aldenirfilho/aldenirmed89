"use strict";

(() => {
  const root = document.documentElement;
  const preferenceKey = "antigravity:a11y:v1";
  const brandThemeRelease = "bruxa-rustica-moderna-v1";
  const defaultProfile = "bruxa-rustica-moderna";
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  function readPreferences() {
    try {
      const parsed = JSON.parse(localStorage.getItem(preferenceKey) || "{}");
      const preferences = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
      const legacyBrandDefault = (
        preferences.brandThemeRelease !== brandThemeRelease &&
        (!preferences.visualProfile || preferences.visualProfile === "total-orange") &&
        preferences.contrast !== true && preferences.clarity !== true && !["light", "system"].includes(preferences.theme)
      );
      if (legacyBrandDefault) {
        preferences.visualProfile = defaultProfile;
        preferences.theme = "dark";
        preferences.brandThemeRelease = brandThemeRelease;
        localStorage.setItem(preferenceKey, JSON.stringify(preferences));
      }
      return preferences;
    } catch (_) {
      return { visualProfile: defaultProfile, theme: "dark", brandThemeRelease };
    }
  }

  function applyPreferences(preferences) {
    const fallback = { theme: "dark" };
    const systemLight = systemTheme.matches;
    const selected = ["light", "dark", "system"].includes(preferences.theme)
      ? preferences.theme
      : fallback.theme;
    const systemSelected = preferences.theme === "system";
    const light = selected === "light" || (systemSelected && systemLight);
    const contrast = preferences.contrast === true;
    const visualProfile = preferences.visualProfile || defaultProfile;
    root.dataset.theme = contrast ? "dark" : light ? "light" : "dark";
    root.dataset.themeMode = selected;
    root.dataset.visualProfile = contrast ? "contrast" : visualProfile;
    root.style.colorScheme = contrast ? "dark" : light ? "light" : "dark";
    root.classList.toggle("a11y-contrast", contrast);
    const themeMeta = document.querySelector("meta[name=theme-color]");
    if (themeMeta) {
      themeMeta.content = contrast ? "#000000" : light ? "#ffffff" : visualProfile === "total-orange" ? "#0b0603" : visualProfile === defaultProfile ? "#0b100c" : "#071422";
    }
  }

  const syncPreferences = () => applyPreferences(readPreferences());
  syncPreferences();
  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", syncPreferences);
  } else {
    systemTheme.addListener?.(syncPreferences);
  }
  window.addEventListener("storage", (event) => {
    if (event.key === preferenceKey) syncPreferences();
  });
  window.ANTIGRAVITY_CRITICAL_THEME = {
    key: preferenceKey,
    readPreferences,
    applyPreferences
  };
})();
