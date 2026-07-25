(() => {
  const $ = id => document.getElementById(id);
  const A11Y_KEY = "antigravity:a11y:v1";
  const DARK_THEME_COLOR = "#07111f";
  const LIGHT_THEME_COLOR = "#ffffff";
  const CONTRAST_THEME_COLOR = "#000000";
  let deferredPrompt = null;
  let a11yPrefs = readA11yPrefs();

  function readA11yPrefs(serialized) {
    let saved = {};
    try {
      if (serialized === undefined) serialized = localStorage.getItem(A11Y_KEY);
      saved = JSON.parse(serialized || "{}");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) saved = {};
    } catch (_) {}
    return {
      ...saved,
      clarity: saved.clarity === true,
      contrast: saved.contrast === true
    };
  }
  function clarityEnabled(preferences) {
    if (preferences.contrast === true) return false;
    if (preferences.theme === "light") return true;
    if (preferences.theme === "dark") return false;
    if (preferences.theme === "system") {
      return matchMedia("(prefers-color-scheme: light)").matches;
    }
    return preferences.clarity === true;
  }

  function applyClarity({ persist = true } = {}) {
    const root = document.documentElement;
    const contrastActive = a11yPrefs.contrast === true;
    const clarityActive = clarityEnabled(a11yPrefs);
    root.classList.toggle("a11y-contrast", contrastActive);
    root.classList.toggle("a11y-light", clarityActive);
    root.style.colorScheme = contrastActive ? "dark" : clarityActive ? "light" : "dark";

    const themeColor = document.querySelector('meta[name="theme-color"]');
    const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    themeColor?.setAttribute(
      "content",
      contrastActive ? CONTRAST_THEME_COLOR : clarityActive ? LIGHT_THEME_COLOR : DARK_THEME_COLOR
    );
    appleStatus?.setAttribute("content", clarityActive ? "default" : "black-translucent");

    const button = $("btnClarity");
    if (button) {
      button.setAttribute("aria-pressed", String(clarityActive));
      button.textContent = clarityActive ? "🌙 Modo espacial escuro" : "☀️ Visualização clara";
      button.setAttribute(
        "aria-label",
        clarityActive
          ? "Desativar visualização clara e voltar ao modo espacial escuro"
          : "Ativar visualização clara com fundo branco"
      );
    }

    if (persist) {
      try {
        localStorage.setItem(A11Y_KEY, JSON.stringify(a11yPrefs));
      } catch (_) {}
    }
    if (typeof window.renderSim === "function") requestAnimationFrame(window.renderSim);
  }

  function setStatus() {
    const badge = $("offlineStatus");
    if (!badge) return;
    if (navigator.onLine) {
      badge.textContent = "🟢 online";
      badge.className = "status-pill online";
    } else {
      badge.textContent = "🟡 offline/PWA";
      badge.className = "status-pill offline";
    }
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    const btn = $("btnInstallPWA");
    if (btn) btn.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    const btn = $("btnInstallPWA");
    if (btn) btn.hidden = true;
    deferredPrompt = null;
  });

  document.addEventListener("DOMContentLoaded", () => {
    applyClarity({ persist: false });
    setStatus();
    window.addEventListener("online", setStatus);
    window.addEventListener("offline", setStatus);

    const clarityButton = $("btnClarity");
    if (clarityButton) {
      clarityButton.addEventListener("click", () => {
        const clarityActive = clarityEnabled(a11yPrefs);
        a11yPrefs.clarity = !clarityActive;
        a11yPrefs.theme = a11yPrefs.clarity ? "light" : "dark";
        if (a11yPrefs.clarity) a11yPrefs.contrast = false;
        applyClarity();
      });
    }

    const btn = $("btnInstallPWA");
    if (btn) {
      btn.addEventListener("click", async () => {
        if (!deferredPrompt) {
          alert("No iPhone/iPad: Safari → Compartilhar → Adicionar à Tela de Início. No Chrome/Edge: use instalar app quando disponível.");
          return;
        }
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        btn.hidden = true;
      });
    }
  });

  window.addEventListener("storage", event => {
    if (event.key !== A11Y_KEY) return;
    a11yPrefs = readA11yPrefs(event.newValue);
    applyClarity({ persist: false });
  });
  const systemTheme = matchMedia("(prefers-color-scheme: light)");
  const handleSystemThemeChange = () => {
    a11yPrefs = readA11yPrefs();
    if (a11yPrefs.theme === "system") applyClarity({ persist: false });
  };
  if (systemTheme.addEventListener) {
    systemTheme.addEventListener("change", handleSystemThemeChange);
  } else {
    systemTheme.addListener?.(handleSystemThemeChange);
  }

  window.addEventListener("beforeprint", () => {
    document.documentElement.classList.add("print-light");
    if (typeof window.renderSim === "function") window.renderSim();
  });

  window.addEventListener("afterprint", () => {
    document.documentElement.classList.remove("print-light");
    if (typeof window.renderSim === "function") window.renderSim();
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(err => console.warn("Service Worker não registrado:", err));
    });
  }
})();
