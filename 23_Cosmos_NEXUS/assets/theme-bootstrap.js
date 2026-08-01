(() => {
  "use strict";

  const root = document.documentElement;
  const preferenceKey = "antigravity:a11y:v1";
  let preferences = {};

  try {
    const parsed = JSON.parse(localStorage.getItem(preferenceKey) || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      preferences = parsed;
    }
  } catch (_) {
    preferences = {};
  }

  const contrast = preferences.contrast === true;
  const systemLight = matchMedia("(prefers-color-scheme: light)").matches;
  const requestedTheme = ["dark", "light", "system"].includes(preferences.theme)
    ? preferences.theme
    : null;
  const clarity = !contrast && (
    requestedTheme === "light"
    || (requestedTheme === "system" && systemLight)
    || (
      requestedTheme === null
      && (
        typeof preferences.clarity === "boolean"
          ? preferences.clarity
          : root.dataset.defaultTheme === "light"
      )
    )
  );

  root.dataset.theme = clarity ? "light" : "dark";
  root.dataset.contrast = contrast ? "high" : "normal";
  root.style.colorScheme = contrast ? "dark" : clarity ? "light" : "dark";

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  themeMeta?.setAttribute("content", clarity ? "#ffffff" : contrast ? "#000000" : "#07111f");
})();
