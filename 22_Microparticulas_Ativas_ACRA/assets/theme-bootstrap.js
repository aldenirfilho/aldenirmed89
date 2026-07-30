(function bootstrapTheme() {
  "use strict";

  const storageKey = "antigravity:a11y:v1";
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");
  let preferences = { theme: "dark" };

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (stored && ["dark", "light", "system"].includes(stored.theme)) {
      preferences = stored;
    }
  } catch (_) {
    preferences = { theme: "dark" };
  }

  const resolved =
    preferences.theme === "system"
      ? systemLight.matches
        ? "light"
        : "dark"
      : preferences.theme;

  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preferences.theme;
})();
