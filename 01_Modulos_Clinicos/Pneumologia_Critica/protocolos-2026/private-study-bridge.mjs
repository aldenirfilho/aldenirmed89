// This adapter never imports a private exercise into the public learning registry.
export const PRIVATE_STUDY_MODES = Object.freeze(['flow', 'cases', 'cards', 'exam', 'review']);

const defaultLoader = async () => {
  const module = await import('../../../02_Biblioteca_IA_Engine/assets/private-study-ui.mjs?v=47ac50b0c02aaa47');
  return module.mountPrivateStudyUI;
};

/** Keep one private player in the same study workspace and pause it when hidden. */
export function createPrivateStudyBridge(host, { loadPlayer = defaultLoader, onModeChange = () => {} } = {}) {
  let active = false, visible = false, disposed = false, mode = 'flow';
  let factory = null, player = null, pending = null, syncedMode = null, syncedVisible = null;
  const sync = () => {
    host.hidden = !active;
    if (player) {
      if (syncedMode !== mode) { syncedMode = mode; player.setMode?.(mode); }
      const effectiveVisible = active && visible;
      if (syncedVisible !== effectiveVisible) {
        syncedVisible = effectiveVisible;
        player.setVisible?.(effectiveVisible);
        if (!effectiveVisible) player.pause?.();
      }
    }
  };
  const ensure = () => {
    if (disposed || !active || player || pending) return pending;
    host.textContent = 'Carregando sua biblioteca privada neste navegador…';
    pending = Promise.resolve().then(async () => {
      factory ||= await loadPlayer();
      if (disposed || !active) return;
      if (typeof factory !== 'function') throw new TypeError('Private study player unavailable');
      host.textContent = '';
      const mounted = await factory(host, { initialMode: mode, showNavigation: false,
        onModeChange(next) {
          if (disposed || next === mode || !PRIVATE_STUDY_MODES.includes(next)) return;
          mode = next;
          if (active) onModeChange(next);
        } });
      if (disposed) { mounted?.pause?.(); mounted?.dispose?.(); return; }
      player = mounted;
      sync();
    }).catch(() => {
      if (!disposed && active) host.textContent = 'Não foi possível abrir a biblioteca privada. Volte aos protocolos ou selecione Biblioteca privada para tentar novamente.';
    }).finally(() => { pending = null; });
    return pending;
  };
  sync();
  return {
    setActive(value) { if (disposed) return; active = Boolean(value); sync(); return ensure(); },
    setMode(next) { if (!PRIVATE_STUDY_MODES.includes(next)) return; mode = next; sync(); },
    setVisible(value) { if (disposed) return; visible = Boolean(value); sync(); },
    pause() { player?.pause?.(); },
    dispose() { if (disposed) return; disposed = true; active = false; player?.pause?.(); player?.dispose?.(); player = null; host.hidden = true; },
  };
}
