(() => {
  "use strict";
  const root = document.documentElement;
  let preferences = {};
  try {
    const parsed = JSON.parse(localStorage.getItem("antigravity:a11y:v1") || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) preferences = parsed;
  } catch (_) { /* preferência opcional */ }
  const systemLight = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: light)").matches;
  const light = preferences.contrast !== true && (
    preferences.theme === "light" ||
    (preferences.theme === "system" && systemLight) ||
    (!["dark", "light", "system"].includes(preferences.theme) && preferences.clarity !== false)
  );
  root.dataset.theme = light ? "light" : "dark";
  root.classList.toggle("a11y-contrast", preferences.contrast === true);
  root.style.colorScheme = light ? "light" : "dark";
})();
