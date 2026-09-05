(() => {
  "use strict";

  const root = document.documentElement;
  const globalKey = "antigravity:a11y:v1";
  let preferences = {};

  try {
    const parsed = JSON.parse(localStorage.getItem(globalKey) || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) preferences = parsed;
  } catch (_) {
    preferences = {};
  }

  const systemLight = matchMedia("(prefers-color-scheme: light)").matches;
  const contrast = preferences.contrast === true;
  const requestedTheme = ["dark", "light", "system"].includes(preferences.theme)
    ? preferences.theme
    : null;
  const clarity = !contrast && (
    requestedTheme === "light"
    || (requestedTheme === "system" && systemLight)
    || (requestedTheme === null && preferences.clarity === true)
  );

  root.classList.toggle("a11y-contrast", contrast);
  root.dataset.theme = clarity ? "light" : "dark";
  root.style.colorScheme = clarity ? "light" : "dark";
})();
