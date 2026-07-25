(() => {
  "use strict";

  const root = document.documentElement;
  const globalKey = "antigravity:a11y:v1";
  const legacyKey = root.dataset.legacyThemeKey;
  let preferences = {};
  let legacyTheme = null;

  try {
    const parsed = JSON.parse(localStorage.getItem(globalKey) || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      preferences = parsed;
    }
  } catch (_) {
    preferences = {};
  }

  try {
    legacyTheme = legacyKey ? localStorage.getItem(legacyKey) : null;
  } catch (_) {
    legacyTheme = null;
  }

  const systemLight = matchMedia("(prefers-color-scheme: light)").matches;
  const contrast = preferences.contrast === true;
  const requestedTheme = ["dark", "light", "system"].includes(preferences.theme)
    ? preferences.theme
    : null;
  const legacyClarity = legacyTheme === "light" || legacyTheme === '"light"';
  const clarity = !contrast && (
    requestedTheme === "light"
    || (requestedTheme === "system" && systemLight)
    || (
      requestedTheme === null
      && (
        typeof preferences.clarity === "boolean"
          ? preferences.clarity
          : legacyClarity
      )
    )
  );

  root.classList.toggle("a11y-contrast", contrast);
  root.dataset.theme = clarity ? "light" : "dark";
  root.style.colorScheme = clarity ? "light" : "dark";
})();
