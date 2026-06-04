(() => {
  const $ = id => document.getElementById(id);
  let deferredPrompt = null;

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
    setStatus();
    window.addEventListener("online", setStatus);
    window.addEventListener("offline", setStatus);

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

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(err => console.warn("Service Worker não registrado:", err));
    });
  }
})();
