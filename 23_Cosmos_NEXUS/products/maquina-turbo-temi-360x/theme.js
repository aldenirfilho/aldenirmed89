(function initializeTheme() {
  "use strict";

  const preferenceKey = "antigravity:a11y:v1";
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");
  let preferences = { theme: "dark" };

  try {
    const stored = JSON.parse(localStorage.getItem(preferenceKey) || "{}");
    if (stored && typeof stored === "object") preferences = { ...stored };
    if (!["dark", "light", "system"].includes(preferences.theme)) {
      preferences.theme = "dark";
    }
  } catch (_) {
    preferences = { theme: "dark" };
  }

  function resolvedTheme() {
    if (preferences.theme === "system") {
      return systemLight.matches ? "light" : "dark";
    }
    return preferences.theme;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = resolvedTheme();
    document.documentElement.dataset.themePreference = preferences.theme;
  }

  function persistTheme() {
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(preferences));
    } catch (_) {
      // O controle continua funcional quando o armazenamento local está indisponível.
    }
  }

  function configureToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;

    function syncButton() {
      const light = document.documentElement.dataset.theme === "light";
      button.setAttribute("aria-pressed", String(light));
      button.setAttribute(
        "aria-label",
        light ? "Ativar visualização escura" : "Ativar visualização clara"
      );
      button.textContent = light ? "🌙 Escuro" : "☀️ Claro";
    }

    button.addEventListener("click", () => {
      preferences.theme = resolvedTheme() === "light" ? "dark" : "light";
      applyTheme();
      persistTheme();
      syncButton();
    });

    const followSystem = () => {
      if (preferences.theme === "system") {
        applyTheme();
        syncButton();
      }
    };

    if (typeof systemLight.addEventListener === "function") {
      systemLight.addEventListener("change", followSystem);
    } else {
      systemLight.addListener(followSystem);
    }

    window.addEventListener("storage", (event) => {
      if (event.key !== preferenceKey || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue);
        if (incoming && ["dark", "light", "system"].includes(incoming.theme)) {
          preferences = { ...incoming };
          applyTheme();
          syncButton();
        }
      } catch (_) {
        // Ignora somente a preferência externa inválida.
      }
    });

    syncButton();
  }

  applyTheme();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", configureToggle, { once: true });
  } else {
    configureToggle();
  }
})();
