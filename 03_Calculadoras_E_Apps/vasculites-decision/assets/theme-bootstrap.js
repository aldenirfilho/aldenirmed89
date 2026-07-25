(() => {
  "use strict";
  const root = document.documentElement;
  const key = "antigravity:a11y:v1";
  let saved = {};
  let hasGlobalPreference = false;
  try {
    const serialized = localStorage.getItem(key);
    hasGlobalPreference = serialized !== null;
    saved = JSON.parse(serialized || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) saved = {};
  } catch (_) {
    saved = {};
  }
  let legacyLight = false;
  try {
    legacyLight = !hasGlobalPreference && localStorage.getItem("vasc-theme") === "light";
  } catch (_) {}
  const theme = saved.theme;
  const contrast = saved.contrast === true;
  const light = !contrast && (
    theme === "light" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: light)").matches) ||
    (!["dark", "light", "system"].includes(theme) && (saved.clarity === true || legacyLight))
  );
  root.dataset.theme = contrast ? "contrast" : light ? "light" : "dark";
  root.style.colorScheme = light ? "light" : "dark";
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    light ? "#ffffff" : saved.contrast === true ? "#000000" : "#08111f"
  );
  document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute(
    "content",
    light ? "default" : "black-translucent"
  );
})();
