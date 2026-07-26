"use strict";

(() => {
  const PREFERENCES_KEY = "antigravity.crew.preferences.v1";
  const A11Y_PREFERENCES_KEY = "antigravity:a11y:v1";
  const DEFAULT_GLOBAL_A11Y = Object.freeze({ theme: "dark", visualProfile: "aerospace" });
  const DEFAULT_PREFERENCES = Object.freeze({
    theme: "aerospace",
    colorMode: "dark",
    language: "pt-BR",
    notificationsEnabled: false,
    publicProfile: false,
    displayName: "",
    occupation: ""
  });
  const ALLOWED_THEMES = new Set([
    "aerospace", "aerospace-light", "rustic-light", "dark", "minimal",
    "sepia", "oceanic", "green", "natural", "forest", "wizard-academy",
    "comic-hero", "modern-serious"
  ]);
  const ALLOWED_COLOR_MODES = new Set(["dark", "light", "system"]);
  const PROFILE_MODES = Object.freeze({
    aerospace: "dark",
    "aerospace-light": "light",
    "rustic-light": "light",
    dark: "dark",
    minimal: "light",
    sepia: "light",
    oceanic: "dark",
    green: "dark",
    natural: "light",
    forest: "dark",
    "wizard-academy": "dark",
    "comic-hero": "dark",
    "modern-serious": "light"
  });
  const ALLOWED_LANGUAGES = new Set(["pt-BR", "en"]);
  const ALLOWED_CATEGORIES = new Set([
    "agradecimento", "sugestao", "contribuicao", "informacao",
    "notificacao", "reclamacao", "outra"
  ]);
  const VIEW_ALIASES = Object.freeze({
    public: "public",
    mission: "public",
    listening: "listening",
    listeningPanel: "listening",
    manifestacao: "listening",
    settings: "settings",
    settingsPanel: "settings",
    admin: "admin",
    ownerNotebook: "admin"
  });
  const LISTENING_CHANNELS = new Set(["manifestacao", "correcao", "uso-indevido"]);
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PROTOCOL_PATTERN = /^AG-\d{4}-[A-F0-9]{16}$/;
  const config = Object.freeze(window.ANTIGRAVITY_CREW_CONFIG || {});
  const PAGE_SESSION_ID = (() => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  })();

  const byId = (id) => document.getElementById(id);
  const text = (value) => document.createTextNode(String(value ?? ""));
  const cleanText = (value, maxLength) =>
    String(value ?? "").trim().replace(/\u0000/g, "").slice(0, maxLength);
  const safeJson = (raw, fallback) => {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return fallback;
    }
  };
  const readStorage = (storage, key, fallback) => {
    try {
      const raw = storage.getItem(key);
      if (raw === null) return fallback;
      const parsed = safeJson(raw, fallback);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (_error) {
      return fallback;
    }
  };
  const writeStorage = (storage, key, value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  };
  const removeStorage = (storage, key) => {
    try {
      storage.removeItem(key);
    } catch (_error) {
      // Storage can be unavailable in hardened/private browsing modes.
    }
  };
  const formatNumber = (value) =>
    Number.isFinite(value) ? new Intl.NumberFormat("pt-BR").format(value) : "—";
  const metricNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };
  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(date);
  };
  const setMessage = (element, message, kind = "") => {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("error", "success");
    if (kind) element.classList.add(kind);
  };
  const makeElement = (tag, value, className = "") => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) element.textContent = String(value);
    return element;
  };

  function normalizeOrigin(value) {
    try {
      const parsed = new URL(value);
      if (!["https:", "http:"].includes(parsed.protocol)) return "";
      return parsed.origin;
    } catch (_error) {
      return "";
    }
  }

  function currentOriginAllowed() {
    const allowed = Array.isArray(config.allowedAppOrigins)
      ? config.allowedAppOrigins.map(normalizeOrigin).filter(Boolean)
      : [];
    return allowed.includes(window.location.origin);
  }

  function validateConnectedConfig() {
    if (config.mode !== "connected") {
      return { connected: false, reason: "Serviço ainda não conectado." };
    }
    const apiOrigin = normalizeOrigin(config.supabaseUrl);
    const allowedApiOrigins = Array.isArray(config.allowedApiOrigins)
      ? config.allowedApiOrigins.map(normalizeOrigin).filter(Boolean)
      : [];
    if (!apiOrigin || !cleanText(config.supabaseAnonKey, 4096)) {
      return { connected: false, invalid: true, reason: "Configuração do backend incompleta." };
    }
    if (!allowedApiOrigins.includes(apiOrigin)) {
      return { connected: false, invalid: true, reason: "Origem da API fora da allowlist." };
    }
    if (window.location.protocol !== "file:" && !currentOriginAllowed()) {
      return { connected: false, invalid: true, reason: "Origem deste site fora da allowlist." };
    }
    if (window.location.protocol === "file:") {
      return { connected: false, invalid: true, reason: "Autenticação bloqueada em file://; use HTTPS ou localhost autorizado." };
    }
    return { connected: true, apiOrigin };
  }

  class SupabaseAdapter {
    constructor(settings, apiOrigin) {
      this.baseUrl = apiOrigin;
      this.anonKey = cleanText(settings.supabaseAnonKey, 4096);
      this.analyticsEndpoint = cleanText(settings.analyticsEndpoint, 2048);
      this.manifestationEndpoint = cleanText(settings.manifestationEndpoint, 2048);
      this.allowedApiOrigins = new Set(
        (settings.allowedApiOrigins || []).map(normalizeOrigin).filter(Boolean)
      );
      this.accessToken = "";
    }

    setAccessToken(token) {
      this.accessToken = cleanText(token, 8192);
    }

    endpoint(path) {
      const url = new URL(path.replace(/^\/+/, ""), `${this.baseUrl}/`);
      if (url.origin !== this.baseUrl || !this.allowedApiOrigins.has(url.origin)) {
        throw new Error("Destino de API não autorizado.");
      }
      return url.toString();
    }

    async request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      headers.set("apikey", this.anonKey);
      headers.set("Content-Type", "application/json");
      if (this.accessToken) headers.set("Authorization", `Bearer ${this.accessToken}`);
      const response = await fetch(this.endpoint(path), {
        method: options.method || "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer"
      });
      if (!response.ok) {
        const status = response.status;
        throw new Error(
          status === 401 || status === 403
            ? "Acesso não autorizado ou sessão expirada."
            : status === 429
              ? "Muitas tentativas. Aguarde antes de tentar novamente."
              : "O serviço não concluiu a solicitação."
        );
      }
      if (response.status === 204) return null;
      const contentType = response.headers.get("content-type") || "";
      return contentType.includes("application/json") ? response.json() : null;
    }

    signIn(email, password) {
      return this.request("auth/v1/token?grant_type=password", {
        method: "POST",
        body: { email, password }
      });
    }

    signUp(email, password) {
      return this.request("auth/v1/signup", {
        method: "POST",
        body: { email, password }
      });
    }

    signOut() {
      return this.request("auth/v1/logout", { method: "POST", body: {} });
    }

    rpc(name, body = {}) {
      if (!/^[a-z][a-z0-9_]{2,63}$/.test(name)) throw new Error("RPC inválida.");
      return this.request(`rest/v1/rpc/${name}`, { method: "POST", body });
    }

    rest(resource, options = {}) {
      if (!/^[a-z][a-z0-9_]*(?:\?.*)?$/.test(resource)) {
        throw new Error("Recurso REST inválido.");
      }
      return this.request(`rest/v1/${resource}`, options);
    }

    getPublicMetrics() {
      return this.rpc("crew_public_metrics");
    }

    async recordSectionView(sectionSlug) {
      if (!this.analyticsEndpoint) return false;
      const endpoint = new URL(this.analyticsEndpoint);
      if (
        endpoint.protocol !== "https:" ||
        !this.allowedApiOrigins.has(endpoint.origin)
      ) {
        throw new Error("Endpoint de telemetria fora da allowlist.");
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: this.anonKey,
          Authorization: `Bearer ${this.anonKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sectionSlug: cleanText(sectionSlug, 80),
          pageSessionId: PAGE_SESSION_ID
        }),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer"
      });
      return response.ok;
    }

    hasManifestationGateway() {
      if (!this.manifestationEndpoint) return false;
      try {
        const endpoint = new URL(this.manifestationEndpoint);
        return (
          endpoint.protocol === "https:" &&
          this.allowedApiOrigins.has(endpoint.origin)
        );
      } catch (_error) {
        return false;
      }
    }

    async manifestationGateway(action, payload) {
      if (!this.hasManifestationGateway()) {
        throw new Error("Canal de manifestações ainda não conectado ao gateway seguro.");
      }
      const endpoint = new URL(this.manifestationEndpoint);
      const headers = {
        apikey: this.anonKey,
        "Content-Type": "application/json"
      };
      if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, payload }),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer"
      });
      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? "Muitas tentativas. Aguarde antes de tentar novamente."
            : "O canal seguro não concluiu a solicitação."
        );
      }
      return response.json();
    }

    getProfile(userId) {
      return this.rest(
        `profiles?select=id,display_name,contact_email,occupation,theme,visual_profile,language,notifications_enabled,public_profile,created_at,updated_at&id=eq.${encodeURIComponent(userId)}`
      );
    }

    checkAdmin(userId) {
      return this.rest(
        `admin_users?select=user_id,role&user_id=eq.${encodeURIComponent(userId)}`
      );
    }

    saveProfile(profile) {
      return this.rest("profiles?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: profile
      });
    }

    subscribe(payload) {
      return this.rest("subscriptions?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: payload
      });
    }

    unsubscribe(userId) {
      return this.rest(`subscriptions?user_id=eq.${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: {
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString()
        }
      });
    }

    getAdminDirectory() {
      return this.rest(
        "profiles?select=id,display_name,contact_email,occupation,theme,visual_profile,language,notifications_enabled,public_profile,created_at,updated_at&order=created_at.desc&limit=500"
      );
    }

    getAdminSubscriptions() {
      return this.rest(
        "subscriptions?select=user_id,status,frequency,consent_at,unsubscribed_at&limit=500"
      );
    }

    getAdminMetrics() {
      return this.rpc("crew_admin_metrics");
    }

    getOwnerDocuments() {
      return this.rest(
        "owner_documents?select=id,owner_user_id,title,category,status,summary,content,editorial_note,publication_workflow_reference,created_at,updated_at&order=updated_at.desc&limit=300"
      );
    }

    saveOwnerDocument(documentRecord) {
      const documentId = cleanText(documentRecord.id, 80);
      const payload = { ...documentRecord };
      delete payload.id;
      if (documentId) {
        return this.rest(`owner_documents?id=eq.${encodeURIComponent(documentId)}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: payload
        });
      }
      return this.rest("owner_documents", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: payload
      });
    }

    getOwnerCredentialSubmissions() {
      return this.rest(
        "owner_credential_verifications?select=id,credential_type,claimed_title,issuer,private_reference,verification_status,verification_method,verified_at,created_at,updated_at&order=created_at.desc&limit=200"
      );
    }

    submitOwnerCredential(payload) {
      return this.rest("owner_credential_verifications", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: payload
      });
    }

    submitManifestation(payload) {
      return this.manifestationGateway("submit", payload);
    }

    getOwnManifestations() {
      return this.rest(
        "manifestations?select=id,protocol,category,other_category,subject,body,status,identity_mode,created_at,updated_at&order=created_at.desc&limit=100"
      );
    }

    getAdminManifestations() {
      return this.rest(
        "manifestations?select=id,protocol,user_id,contact_email,category,other_category,subject,body,status,identity_mode,consent_to_contact,created_at,updated_at&order=created_at.desc&limit=300"
      );
    }

    getManifestationThread(manifestationId) {
      return this.rpc("crew_manifestation_thread", {
        p_manifestation_id: manifestationId
      });
    }

    getAnonymousThread(protocol, accessToken) {
      return this.manifestationGateway("anonymous-thread", {
        p_protocol: protocol,
        p_access_token: accessToken
      });
    }

    replyToManifestation(manifestationId, body) {
      return this.rpc("reply_manifestation", {
        p_manifestation_id: manifestationId,
        p_body: body
      });
    }

    replyToAnonymousManifestation(protocol, accessToken, body) {
      return this.manifestationGateway("anonymous-reply", {
        p_protocol: protocol,
        p_access_token: accessToken,
        p_body: body
      });
    }
  }

  const connection = validateConnectedConfig();
  const state = {
    connected: connection.connected,
    adapter: connection.connected
      ? new SupabaseAdapter(config, connection.apiOrigin)
      : null,
    session: null,
    profile: null,
    isAdmin: false,
    isOwner: false,
    authMode: "signin",
    directoryRows: [],
    subscriptionRows: [],
    manifestationRows: [],
    adminManifestationRows: [],
    ownerDocumentRows: [],
    ownerCredentialRows: [],
    activeThread: null,
    adminActiveThread: null
  };

  function setServiceStatus(kind, title, detail) {
    const status = byId("serviceStatus");
    status.className = `service-status ${kind}`;
    const strong = status.querySelector("strong");
    const paragraph = status.querySelector("p");
    strong.textContent = title;
    paragraph.textContent = detail;
  }

  function applyTheme(theme, colorMode = "dark") {
    const safeTheme = ALLOWED_THEMES.has(theme) ? theme : "aerospace";
    const safeMode = ALLOWED_COLOR_MODES.has(colorMode) ? colorMode : "dark";
    const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const resolvedMode = safeMode === "system"
      ? (systemLight ? "light" : "dark")
      : safeMode;
    document.documentElement.dataset.visualProfile = safeTheme;
    document.documentElement.dataset.themeMode = safeMode;
    document.documentElement.dataset.theme = resolvedMode;
    document.documentElement.style.colorScheme = resolvedMode;
    const clarity = byId("clarityToggle");
    if (clarity) {
      clarity.textContent = resolvedMode === "light" ? "🌙 Escuro" : "☀️ Claro";
      clarity.setAttribute(
        "aria-label",
        resolvedMode === "light" ? "Ativar visualização escura" : "Ativar visualização clara"
      );
      clarity.setAttribute("aria-pressed", String(resolvedMode === "light"));
    }
  }

  function normalizePreferences(input) {
    const source = input && typeof input === "object" ? input : {};
    return {
      theme: ALLOWED_THEMES.has(source.theme) ? source.theme : DEFAULT_PREFERENCES.theme,
      colorMode: ALLOWED_COLOR_MODES.has(source.colorMode)
        ? source.colorMode
        : DEFAULT_PREFERENCES.colorMode,
      language: ALLOWED_LANGUAGES.has(source.language)
        ? source.language
        : DEFAULT_PREFERENCES.language,
      notificationsEnabled: Boolean(source.notificationsEnabled),
      publicProfile: Boolean(source.publicProfile),
      displayName: cleanText(source.displayName, 80),
      occupation: cleanText(source.occupation, 100)
    };
  }

  function loadLocalPreferences() {
    const stored = readStorage(localStorage, PREFERENCES_KEY, {});
    const globalA11y = readStorage(localStorage, A11Y_PREFERENCES_KEY, DEFAULT_GLOBAL_A11Y);
    const savedColorMode = globalA11y.theme === "system"
      ? "system"
      : ALLOWED_COLOR_MODES.has(globalA11y.theme)
        ? globalA11y.theme
        : stored.colorMode;
    return normalizePreferences({
      ...DEFAULT_PREFERENCES,
      ...stored,
      theme: ALLOWED_THEMES.has(globalA11y.visualProfile)
        ? globalA11y.visualProfile
        : stored.theme,
      colorMode: savedColorMode
    });
  }

  function fillPreferences(preferences) {
    const safe = normalizePreferences(preferences);
    byId("themePreference").value = safe.theme;
    byId("colorModePreference").value = safe.colorMode;
    byId("languagePreference").value = safe.language;
    byId("notificationPreference").checked = safe.notificationsEnabled;
    byId("publicProfilePreference").checked = safe.publicProfile;
    byId("displayName").value = safe.displayName;
    byId("occupation").value = safe.occupation;
    applyTheme(safe.theme, safe.colorMode);
    configurePreparedCapabilities();
  }

  function getPreferencesFromForm() {
    return normalizePreferences({
      theme: byId("themePreference").value,
      colorMode: byId("colorModePreference").value,
      language: byId("languagePreference").value,
      notificationsEnabled: byId("notificationPreference").checked,
      publicProfile: byId("publicProfilePreference").checked,
      displayName: byId("displayName").value,
      occupation: byId("occupation").value
    });
  }

  function normalizeViewName(viewName) {
    return VIEW_ALIASES[cleanText(viewName, 40)] || "public";
  }

  function requestedViewFromLocation() {
    const hashView = window.location.hash.replace(/^#/, "");
    if (hashView && VIEW_ALIASES[cleanText(hashView, 40)]) {
      return normalizeViewName(hashView);
    }
    let channel = "";
    try {
      channel = cleanText(new URLSearchParams(window.location.search).get("canal"), 40);
    } catch (_error) {
      channel = "";
    }
    if (LISTENING_CHANNELS.has(channel)) return "listening";
    return "public";
  }

  function configurePreparedCapabilities() {
    const publicProfileCheckbox = byId("publicProfilePreference");
    const publicProfileStatus = byId("publicProfileStatus");
    const publicProfilesEnabled = config.enablePublicProfiles === true;
    publicProfileCheckbox.disabled = !publicProfilesEnabled;
    if (!publicProfilesEnabled) {
      publicProfileCheckbox.checked = false;
      publicProfileStatus.textContent =
        "Preferência preparada, mas ainda não existe mural público ativo. Nenhum perfil será publicado.";
    } else {
      publicProfileStatus.textContent =
        "Opt-in disponível. A publicação continua condicionada ao serviço seguro e à revogação imediata.";
    }
  }

  function showView(viewName) {
    const validView = normalizeViewName(viewName);
    const panels = {
      public: byId("publicPanel"),
      listening: byId("listeningPanel"),
      settings: byId("settingsPanel"),
      admin: byId("adminPanel")
    };
    Object.entries(panels).forEach(([name, panel]) => {
      panel.hidden = name !== validView;
    });
    document.querySelectorAll("[data-view]").forEach((button) => {
      if (!button.classList.contains("nav-button")) return;
      const active = button.dataset.view === validView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (validView === "admin") {
      prepareAdminView();
    } else if (validView === "listening" && state.session) {
      loadOwnManifestations();
    }
    const hash = validView === "public" ? "" : `#${validView}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setConnectedControls() {
    const connected = state.connected;
    const manifestationReady =
      connected && state.adapter && state.adapter.hasManifestationGateway();
    byId("authSubmit").disabled = !connected;
    byId("submitManifestation").disabled = !manifestationReady;
    byId("subscribeButton").disabled = !connected || !state.session;
    byId("unsubscribeButton").disabled = !connected || !state.session;
    if (!connected) {
      setMessage(byId("authMessage"), "Serviço ainda não conectado. Nenhum login será simulado.");
      setMessage(
        byId("manifestationMessageStatus"),
        "Canal ainda não conectado. Você pode preparar o texto, mas não é possível enviar nem gerar protocolo."
      );
      setMessage(byId("newsletterMessage"), "Assinatura indisponível até a conexão segura do serviço.");
    } else if (!manifestationReady) {
      setMessage(
        byId("manifestationMessageStatus"),
        "Canal de manifestações aguardando gateway seguro; nada será enviado nem receberá protocolo."
      );
    }
  }

  async function loadPublicMetrics() {
    let payload;
    if (!state.connected) {
      try {
        const response = await fetch("./data/public-metrics.json", {
          cache: "no-store",
          credentials: "same-origin"
        });
        payload = response.ok ? await response.json() : null;
      } catch (_error) {
        payload = null;
      }
      renderMetrics(payload || {
        status: "disconnected",
        subscriberCount: null,
        totalViews: null,
        sectionViews: [],
        generatedAt: null
      });
      return;
    }
    try {
      payload = await state.adapter.getPublicMetrics();
      if (Array.isArray(payload)) payload = payload[0] || {};
      renderMetrics(payload);
    } catch (_error) {
      renderMetrics({
        status: "error",
        subscriberCount: null,
        totalViews: null,
        sectionViews: [],
        generatedAt: null
      });
      setServiceStatus(
        "error",
        "Backend configurado, mas a telemetria não respondeu",
        "Nenhum número foi substituído por estimativa. Verifique a implantação e a política de acesso."
      );
    }
  }

  function renderMetrics(payload) {
    const connectedMetrics =
      state.connected && payload && payload.status === "connected";
    const subscriberCount = connectedMetrics
      ? metricNumber(payload.subscriberCount)
      : null;
    const totalViews = connectedMetrics
      ? metricNumber(payload.totalViews)
      : null;
    const sectionViews = connectedMetrics && Array.isArray(payload.sectionViews)
      ? payload.sectionViews.filter((row) =>
          row && typeof row.section === "string" && metricNumber(row.views) !== null
        )
      : [];
    byId("subscriberCount").textContent = formatNumber(subscriberCount);
    byId("totalViews").textContent = formatNumber(totalViews);
    byId("sectionCount").textContent = connectedMetrics
      ? formatNumber(sectionViews.length)
      : "—";
    byId("metricsCheckedAt").textContent = connectedMetrics
      ? `Atualizado em ${formatDate(payload.generatedAt)}`
      : "Fonte ainda não conectada";
    byId("metricsMode").textContent = connectedMetrics ? "Dados agregados" : "Sem conexão";
    const body = byId("sectionMetricsBody");
    body.replaceChildren();
    if (!connectedMetrics) {
      const row = document.createElement("tr");
      const cell = makeElement("td", "Serviço ainda não conectado; nenhum número foi estimado.");
      cell.colSpan = 3;
      row.append(cell);
      body.append(row);
      return;
    }
    if (!sectionViews.length) {
      const row = document.createElement("tr");
      const cell = makeElement("td", "Ainda não há visualizações agregadas.");
      cell.colSpan = 3;
      row.append(cell);
      body.append(row);
      return;
    }
    sectionViews.forEach((item) => {
      const row = document.createElement("tr");
      row.append(
        makeElement("td", cleanText(item.section, 100)),
        makeElement("td", formatNumber(metricNumber(item.views))),
        makeElement("td", formatDate(item.updatedAt || payload.generatedAt))
      );
      body.append(row);
    });
  }

  async function activateSession(session) {
    state.session = session;
    state.adapter.setAccessToken(session.accessToken);
    byId("signedOutContent").hidden = true;
    byId("signedInContent").hidden = false;
    byId("sessionIdentity").textContent = session.user.email || "tripulante autenticado";
    byId("subscribeButton").disabled = false;
    byId("unsubscribeButton").disabled = false;
    try {
      const [profiles, admins] = await Promise.all([
        state.adapter.getProfile(session.user.id),
        state.adapter.checkAdmin(session.user.id)
      ]);
      state.profile = Array.isArray(profiles) ? profiles[0] || null : null;
      state.isAdmin = Array.isArray(admins) && admins.length > 0;
      state.isOwner = Array.isArray(admins) && admins.some((row) => row.role === "owner");
      byId("roleDescription").textContent = state.isAdmin
        ? state.isOwner
          ? "Função owner confirmada pelo servidor; o Caderno privado está disponível no Comando."
          : "Função administrativa confirmada pelo servidor."
        : "Tripulante autenticado. O diretório administrativo permanece bloqueado.";
      if (state.profile) {
        fillPreferences({
          theme: state.profile.visual_profile,
          colorMode: state.profile.theme,
          language: state.profile.language,
          notificationsEnabled: state.profile.notifications_enabled,
          publicProfile: state.profile.public_profile,
          displayName: state.profile.display_name,
          occupation: state.profile.occupation
        });
      }
      if (!byId("listeningPanel").hidden) loadOwnManifestations();
    } catch (_error) {
      clearSession();
      setMessage(byId("authMessage"), "Sessão inválida ou expirada. Entre novamente.", "error");
    }
  }

  function clearSession() {
    const localPreferences = loadLocalPreferences();
    state.session = null;
    state.profile = null;
    state.isAdmin = false;
    state.isOwner = false;
    state.directoryRows = [];
    state.subscriptionRows = [];
    state.manifestationRows = [];
    state.adminManifestationRows = [];
    state.ownerDocumentRows = [];
    state.ownerCredentialRows = [];
    state.activeThread = null;
    state.adminActiveThread = null;
    if (state.adapter) state.adapter.setAccessToken("");

    [
      "authForm",
      "newsletterForm",
      "manifestationForm",
      "anonymousLookupForm",
      "crewReplyForm",
      "adminReplyForm",
      "ownerDocumentForm",
      "credentialSubmissionForm"
    ].forEach((formId) => byId(formId).reset());

    fillPreferences({
      ...localPreferences,
      displayName: "",
      occupation: ""
    });
    byId("signedOutContent").hidden = false;
    byId("signedInContent").hidden = true;
    byId("sessionIdentity").textContent = "";
    byId("roleDescription").textContent = "";
    byId("adminContent").hidden = true;
    byId("adminGate").hidden = false;
    byId("adminDirectoryBody").replaceChildren();
    byId("adminInboxList").replaceChildren();
    byId("conversationList").replaceChildren();
    byId("threadMessages").replaceChildren(
      makeElement("p", "Selecione uma manifestação ou consulte um protocolo anônimo.", "empty-state")
    );
    byId("adminThreadMessages").replaceChildren(
      makeElement("p", "Selecione uma manifestação para ler e responder.", "empty-state")
    );
    byId("ownerDocumentsList").replaceChildren(
      makeElement("p", "Nenhum documento carregado.", "empty-state")
    );
    byId("credentialList").replaceChildren();
    byId("protocolResult").hidden = true;
    byId("protocolValue").textContent = "";
    byId("anonymousKeyValue").hidden = true;
    byId("anonymousKeyValue").textContent = "";
    byId("anonymousKeyNotice").textContent = "";
    byId("otherCategoryField").hidden = true;
    byId("manifestationOtherCategory").required = false;
    byId("crewReplyForm").hidden = true;
    byId("adminReplyForm").hidden = true;
    byId("ownerNotebook").hidden = true;
    byId("ownerDocumentFields").disabled = true;
    byId("credentialFields").disabled = true;
    byId("conversationStatus").textContent = "Nenhuma conversa carregada";
    byId("directoryCount").textContent = "0 registros";
    byId("adminInboxCount").textContent = "0 manifestações";
    byId("adminUserCount").textContent = "—";
    byId("adminSubscriberCount").textContent = "—";
    byId("adminViewCount").textContent = "—";
    byId("directorySearch").value = "";
    [
      "manifestationMessageStatus",
      "newsletterMessage",
      "adminMessage",
      "ownerDocumentMessage",
      "credentialMessage"
    ].forEach((messageId) => setMessage(byId(messageId), ""));
    setConnectedControls();
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    if (!state.connected) return;
    const email = cleanText(byId("authEmail").value, 254).toLowerCase();
    const passwordInput = byId("authPassword");
    const password = passwordInput.value;
    passwordInput.value = "";
    if (!EMAIL_PATTERN.test(email) || password.length < 10 || password.length > 128) {
      setMessage(byId("authMessage"), "Informe e-mail válido e senha com 10 a 128 caracteres.", "error");
      return;
    }
    byId("authSubmit").disabled = true;
    setMessage(byId("authMessage"), state.authMode === "signup" ? "Solicitando cadastro…" : "Autenticando…");
    try {
      const result = state.authMode === "signup"
        ? await state.adapter.signUp(email, password)
        : await state.adapter.signIn(email, password);
      if (result && result.access_token && result.user) {
        await activateSession({
          accessToken: result.access_token,
          user: { id: result.user.id, email: result.user.email || email },
          expiresAt: Date.now() + Number(result.expires_in || 3600) * 1000
        });
        setMessage(byId("authMessage"), "Sessão segura iniciada.", "success");
      } else if (state.authMode === "signup") {
        setMessage(
          byId("authMessage"),
          "Cadastro solicitado. Confirme o e-mail antes de entrar; nenhuma sessão foi simulada.",
          "success"
        );
      } else {
        throw new Error("Sessão não retornada.");
      }
    } catch (error) {
      setMessage(byId("authMessage"), error.message || "Não foi possível autenticar.", "error");
    } finally {
      byId("authSubmit").disabled = false;
    }
  }

  function setAuthMode(mode) {
    state.authMode = mode === "signup" ? "signup" : "signin";
    byId("signInTab").setAttribute("aria-selected", String(state.authMode === "signin"));
    byId("signUpTab").setAttribute("aria-selected", String(state.authMode === "signup"));
    byId("authPassword").autocomplete = state.authMode === "signup"
      ? "new-password"
      : "current-password";
    byId("authSubmit").textContent = state.authMode === "signup"
      ? "Criar conta com segurança"
      : "Entrar com segurança";
    setMessage(byId("authMessage"), "");
  }

  async function savePreferences(event) {
    event.preventDefault();
    const preferences = getPreferencesFromForm();
    writeStorage(localStorage, PREFERENCES_KEY, preferences);
    const existingA11y = readStorage(localStorage, A11Y_PREFERENCES_KEY, {});
    writeStorage(localStorage, A11Y_PREFERENCES_KEY, {
      ...existingA11y,
      theme: preferences.colorMode,
      visualProfile: preferences.theme
    });
    applyTheme(preferences.theme, preferences.colorMode);
    if (!state.connected || !state.session) {
      setMessage(
        byId("preferencesMessage"),
        "Preferências salvas somente neste navegador; serviço ainda não conectado ou sem sessão.",
        "success"
      );
      return;
    }
    try {
      await state.adapter.saveProfile({
        id: state.session.user.id,
        contact_email: state.session.user.email || null,
        display_name: preferences.displayName || null,
        occupation: preferences.occupation || null,
        theme: preferences.colorMode,
        visual_profile: preferences.theme,
        language: preferences.language,
        notifications_enabled: preferences.notificationsEnabled,
        public_profile: preferences.publicProfile,
        updated_at: new Date().toISOString()
      });
      setMessage(byId("preferencesMessage"), "Preferências sincronizadas com sua conta.", "success");
    } catch (error) {
      setMessage(byId("preferencesMessage"), error.message, "error");
    }
  }

  async function subscribeNewsletter(event) {
    event.preventDefault();
    if (!state.connected || !state.session) {
      setMessage(byId("newsletterMessage"), "Entre na conta para registrar consentimento.", "error");
      return;
    }
    if (!byId("newsletterConsent").checked) {
      setMessage(byId("newsletterMessage"), "Marque o consentimento antes de assinar.", "error");
      return;
    }
    try {
      await state.adapter.subscribe({
        user_id: state.session.user.id,
        email: state.session.user.email,
        status: "active",
        frequency: "daily",
        consent_at: new Date().toISOString(),
        unsubscribed_at: null
      });
      setMessage(byId("newsletterMessage"), "Assinatura diária ativada com consentimento registrado.", "success");
    } catch (error) {
      setMessage(byId("newsletterMessage"), error.message, "error");
    }
  }

  async function unsubscribeNewsletter() {
    if (!state.connected || !state.session) return;
    try {
      await state.adapter.unsubscribe(state.session.user.id);
      byId("newsletterConsent").checked = false;
      setMessage(byId("newsletterMessage"), "Assinatura cancelada. Sua conta continua ativa.", "success");
    } catch (error) {
      setMessage(byId("newsletterMessage"), error.message, "error");
    }
  }

  async function prepareAdminView() {
    byId("adminContent").hidden = true;
    byId("adminGate").hidden = false;
    if (!state.connected) {
      setMessage(byId("adminMessage"), "Serviço ainda não conectado; diretório não disponível.");
      return;
    }
    if (!state.session) {
      setMessage(byId("adminMessage"), "Entre em uma conta administrativa para continuar.");
      return;
    }
    if (!state.isAdmin) {
      setMessage(byId("adminMessage"), "A sessão atual não possui função administrativa.", "error");
      return;
    }
    byId("adminGate").hidden = true;
    byId("adminContent").hidden = false;
    setMessage(byId("adminMessage"), "Carregando dados protegidos…");
    try {
      const [profiles, subscriptions, metrics, manifestations] = await Promise.all([
        state.adapter.getAdminDirectory(),
        state.adapter.getAdminSubscriptions(),
        state.adapter.getAdminMetrics(),
        state.adapter.getAdminManifestations()
      ]);
      state.directoryRows = Array.isArray(profiles) ? profiles : [];
      state.subscriptionRows = Array.isArray(subscriptions) ? subscriptions : [];
      state.adminManifestationRows = Array.isArray(manifestations) ? manifestations : [];
      renderDirectory(state.directoryRows, state.subscriptionRows);
      renderAdminMetrics(Array.isArray(metrics) ? metrics[0] || {} : metrics || {});
      renderAdminInbox(state.adminManifestationRows);
      setMessage(byId("adminMessage"), "Dados administrativos carregados após autorização do servidor.", "success");
      await loadOwnerNotebook();
    } catch (error) {
      byId("adminContent").hidden = true;
      byId("adminGate").hidden = false;
      setMessage(byId("adminMessage"), error.message, "error");
    }
  }

  function renderAdminMetrics(metrics) {
    byId("adminUserCount").textContent = formatNumber(Number(metrics.totalUsers));
    byId("adminSubscriberCount").textContent = formatNumber(Number(metrics.subscriberCount));
    byId("adminViewCount").textContent = formatNumber(Number(metrics.totalViews));
  }

  async function loadOwnerNotebook() {
    const notebook = byId("ownerNotebook");
    notebook.hidden = true;
    byId("ownerDocumentFields").disabled = true;
    byId("credentialFields").disabled = true;
    if (!state.connected || !state.session || !state.isOwner) return;
    notebook.hidden = false;
    try {
      const [documents, credentials] = await Promise.all([
        state.adapter.getOwnerDocuments(),
        state.adapter.getOwnerCredentialSubmissions()
      ]);
      state.ownerDocumentRows = Array.isArray(documents) ? documents : [];
      state.ownerCredentialRows = Array.isArray(credentials) ? credentials : [];
      renderOwnerDocuments(state.ownerDocumentRows);
      renderOwnerCredentials(state.ownerCredentialRows);
      byId("ownerDocumentFields").disabled = false;
      byId("credentialFields").disabled = false;
      setMessage(
        byId("ownerDocumentMessage"),
        "Backend privado conectado. Nenhum conteúdo deste Caderno é público.",
        "success"
      );
    } catch (error) {
      setMessage(
        byId("ownerDocumentMessage"),
        `${error.message} O editor permanece desabilitado para evitar rascunho em arquivo público.`,
        "error"
      );
    }
  }

  function renderOwnerDocuments(rows) {
    if (!state.session || !state.isOwner) return;
    const list = byId("ownerDocumentsList");
    list.replaceChildren();
    if (!rows.length) {
      list.append(makeElement("p", "Nenhum documento privado encontrado.", "empty-state"));
      return;
    }
    rows.forEach((row) => {
      const article = makeElement("article", "", "owner-document-item");
      const button = makeElement("button");
      button.type = "button";
      button.append(
        makeElement("strong", cleanText(row.title, 160)),
        makeElement(
          "small",
          `${cleanText(row.category, 30)} · ${cleanText(row.status, 30)} · ${formatDate(row.updated_at)}`
        )
      );
      if (row.summary) {
        button.append(makeElement("p", cleanText(row.summary, 600)));
      }
      button.addEventListener("click", () => fillOwnerDocument(row));
      article.append(button);
      list.append(article);
    });
  }

  function fillOwnerDocument(row) {
    if (!state.session || !state.isOwner) return;
    byId("ownerDocumentId").value = cleanText(row.id, 80);
    byId("ownerDocumentTitle").value = cleanText(row.title, 160);
    byId("ownerDocumentCategory").value = cleanText(row.category, 30);
    byId("ownerDocumentStatus").value = cleanText(row.status, 30);
    byId("ownerDocumentSummary").value = cleanText(row.summary, 600);
    byId("ownerDocumentBody").value = cleanText(row.content, 30000);
    byId("ownerEditorialNote").value = cleanText(row.editorial_note, 2000);
    byId("ownerPublicationWorkflow").value = cleanText(
      row.publication_workflow_reference,
      200
    );
    byId("ownerDocumentTitle").focus();
  }

  function clearOwnerDocumentForm() {
    byId("ownerDocumentForm").reset();
    byId("ownerDocumentId").value = "";
    byId("ownerDocumentCategory").value = "biografia";
    byId("ownerDocumentStatus").value = "draft";
    setMessage(byId("ownerDocumentMessage"), "Novo rascunho privado preparado.");
  }

  async function saveOwnerDocument(event) {
    event.preventDefault();
    if (!state.connected || !state.session || !state.isOwner) return;
    const allowedCategories = new Set([
      "biografia", "curriculo", "historia", "experiencia", "reflexao",
      "posicao", "explicacao", "legado"
    ]);
    const allowedStatuses = new Set(["draft", "review", "private", "publish-approved"]);
    const title = cleanText(byId("ownerDocumentTitle").value, 160);
    const category = byId("ownerDocumentCategory").value;
    const documentStatus = byId("ownerDocumentStatus").value;
    const content = cleanText(byId("ownerDocumentBody").value, 30000);
    const workflowReference = cleanText(byId("ownerPublicationWorkflow").value, 200);
    if (
      title.length < 4 ||
      content.length < 10 ||
      !allowedCategories.has(category) ||
      !allowedStatuses.has(documentStatus)
    ) {
      setMessage(byId("ownerDocumentMessage"), "Revise título, categoria, estado e conteúdo.", "error");
      return;
    }
    if (documentStatus === "publish-approved" && workflowReference.length < 4) {
      setMessage(
        byId("ownerDocumentMessage"),
        "Publicação aprovada exige uma referência explícita de workflow editorial.",
        "error"
      );
      return;
    }
    try {
      await state.adapter.saveOwnerDocument({
        id: cleanText(byId("ownerDocumentId").value, 80),
        owner_user_id: state.session.user.id,
        title,
        category,
        status: documentStatus,
        summary: cleanText(byId("ownerDocumentSummary").value, 600) || null,
        content,
        editorial_note: cleanText(byId("ownerEditorialNote").value, 2000) || null,
        publication_workflow_reference: workflowReference || null,
        updated_at: new Date().toISOString()
      });
      setMessage(byId("ownerDocumentMessage"), "Documento salvo no backend privado.", "success");
      clearOwnerDocumentForm();
      await loadOwnerNotebook();
    } catch (error) {
      setMessage(byId("ownerDocumentMessage"), error.message, "error");
    }
  }

  function renderOwnerCredentials(rows) {
    if (!state.session || !state.isOwner) return;
    const list = byId("credentialList");
    list.replaceChildren();
    if (!rows.length) {
      list.append(makeElement("p", "Nenhuma credencial encaminhada.", "empty-state"));
      return;
    }
    rows.forEach((row) => {
      const item = makeElement("article", "", "owner-document-item");
      item.append(
        makeElement("strong", cleanText(row.claimed_title, 180)),
        makeElement(
          "small",
          `${cleanText(row.issuer, 180)} · ${cleanText(row.verification_status, 30)}`
        ),
        makeElement(
          "p",
          row.verification_status === "verified"
            ? `Verificada em ${formatDate(row.verified_at)} por processo independente.`
            : "Alegação ainda não verificada; não usar como credencial pública."
        )
      );
      list.append(item);
    });
  }

  async function submitOwnerCredential(event) {
    event.preventDefault();
    if (!state.connected || !state.session || !state.isOwner) return;
    const credentialType = cleanText(byId("credentialType").value, 100);
    const claimedTitle = cleanText(byId("credentialTitleClaim").value, 180);
    const issuer = cleanText(byId("credentialIssuer").value, 180);
    if (credentialType.length < 2 || claimedTitle.length < 2 || issuer.length < 2) {
      setMessage(byId("credentialMessage"), "Preencha tipo, título e instituição.", "error");
      return;
    }
    try {
      await state.adapter.submitOwnerCredential({
        owner_user_id: state.session.user.id,
        credential_type: credentialType,
        claimed_title: claimedTitle,
        issuer,
        private_reference: cleanText(byId("credentialReference").value, 500) || null,
        verification_status: "pending"
      });
      byId("credentialSubmissionForm").reset();
      setMessage(
        byId("credentialMessage"),
        "Credencial encaminhada como pendente; nenhuma verificação foi presumida.",
        "success"
      );
      await loadOwnerNotebook();
    } catch (error) {
      setMessage(byId("credentialMessage"), error.message, "error");
    }
  }

  function renderDirectory(rows, subscriptions, query = "") {
    if (!state.session || !state.isAdmin) return;
    const subscriptionByUser = new Map(
      subscriptions.map((row) => [String(row.user_id), row])
    );
    const needle = cleanText(query, 120).toLocaleLowerCase("pt-BR");
    const filtered = rows.filter((row) => {
      if (!needle) return true;
      return [
        row.display_name, row.contact_email, row.occupation, row.language,
        row.theme, row.visual_profile
      ].some((value) => String(value || "").toLocaleLowerCase("pt-BR").includes(needle));
    });
    const body = byId("adminDirectoryBody");
    body.replaceChildren();
    filtered.forEach((row) => {
      const subscription = subscriptionByUser.get(String(row.id));
      const tr = document.createElement("tr");
      const identity = document.createElement("td");
      identity.append(
        makeElement("strong", cleanText(row.display_name, 80) || "Sem nome de exibição"),
        makeElement("small", cleanText(row.occupation, 100) || "Atuação não informada")
      );
      const contact = makeElement("td", cleanText(row.contact_email, 254) || "Não informado");
      const preferences = makeElement(
        "td",
        `${cleanText(row.language, 12) || "—"} · ${cleanText(row.visual_profile, 30) || "—"} · ${cleanText(row.theme, 10) || "—"}`
      );
      const newsletter = makeElement(
        "td",
        subscription && subscription.status === "active" ? "Ativo · diário" : "Inativo"
      );
      const created = makeElement("td", formatDate(row.created_at));
      tr.append(identity, contact, preferences, newsletter, created);
      body.append(tr);
    });
    byId("directoryCount").textContent = `${filtered.length} registro${filtered.length === 1 ? "" : "s"}`;
  }

  function randomAccessToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function submitManifestation(event) {
    event.preventDefault();
    if (
      !state.connected ||
      !state.adapter ||
      !state.adapter.hasManifestationGateway()
    ) {
      setMessage(
        byId("manifestationMessageStatus"),
        "Canal ainda não conectado ao gateway seguro; nada foi enviado.",
        "error"
      );
      return;
    }
    const category = byId("manifestationCategory").value;
    const otherCategory = cleanText(byId("manifestationOtherCategory").value, 80);
    const identityMode = document.querySelector('input[name="identityMode"]:checked')?.value || "anonymous";
    const subject = cleanText(byId("manifestationSubject").value, 140);
    const message = cleanText(byId("manifestationMessage").value, 5000);
    if (!ALLOWED_CATEGORIES.has(category)) {
      setMessage(byId("manifestationMessageStatus"), "Selecione uma categoria válida.", "error");
      return;
    }
    if (category === "outra" && otherCategory.length < 2) {
      setMessage(byId("manifestationMessageStatus"), "Especifique a categoria “Outra”.", "error");
      return;
    }
    if (identityMode === "identified" && !state.session) {
      setMessage(byId("manifestationMessageStatus"), "Entre na conta para enviar uma manifestação identificada.", "error");
      return;
    }
    if (subject.length < 4 || message.length < 10 || !byId("manifestationConsent").checked) {
      setMessage(byId("manifestationMessageStatus"), "Revise assunto, mensagem e consentimento obrigatório.", "error");
      return;
    }
    const anonymousToken = identityMode === "anonymous" ? randomAccessToken() : "";
    byId("submitManifestation").disabled = true;
    setMessage(byId("manifestationMessageStatus"), "Enviando ao canal seguro…");
    try {
      let result = await state.adapter.submitManifestation({
        p_category: category,
        p_other_category: category === "outra" ? otherCategory : null,
        p_subject: subject,
        p_body: message,
        p_identity_mode: identityMode,
        p_consent_to_process: true,
        p_consent_to_contact: byId("contactConsent").checked,
        p_anonymous_access_token: anonymousToken || null
      });
      if (Array.isArray(result)) result = result[0];
      const protocol = cleanText(result && result.protocol, 32);
      if (!PROTOCOL_PATTERN.test(protocol)) throw new Error("O servidor não retornou protocolo válido.");
      byId("protocolValue").textContent = protocol;
      byId("protocolResult").hidden = false;
      byId("anonymousKeyValue").hidden = identityMode !== "anonymous";
      byId("anonymousKeyValue").textContent = identityMode === "anonymous" ? anonymousToken : "";
      byId("anonymousKeyNotice").textContent = identityMode === "anonymous"
        ? "Guarde também a chave secreta abaixo. Ela é mostrada uma vez e não é armazenada por esta página."
        : "A conversa ficará vinculada à sua conta autenticada.";
      byId("manifestationForm").reset();
      byId("otherCategoryField").hidden = true;
      setMessage(byId("manifestationMessageStatus"), "Manifestação registrada. Guarde o protocolo.", "success");
      if (state.session && identityMode === "identified") loadOwnManifestations();
    } catch (error) {
      setMessage(byId("manifestationMessageStatus"), error.message, "error");
    } finally {
      byId("submitManifestation").disabled = false;
    }
  }

  async function copyProtocol() {
    const protocol = byId("protocolValue").textContent;
    const key = byId("anonymousKeyValue").hidden ? "" : byId("anonymousKeyValue").textContent;
    const value = key ? `Protocolo: ${protocol}\nChave secreta: ${key}` : `Protocolo: ${protocol}`;
    try {
      await navigator.clipboard.writeText(value);
      setMessage(byId("manifestationMessageStatus"), "Dados de acompanhamento copiados.", "success");
    } catch (_error) {
      setMessage(byId("manifestationMessageStatus"), "Não foi possível copiar automaticamente. Selecione os dados exibidos.", "error");
    }
  }

  async function loadOwnManifestations() {
    if (!state.connected || !state.session) {
      renderConversationList([]);
      return;
    }
    try {
      const rows = await state.adapter.getOwnManifestations();
      state.manifestationRows = Array.isArray(rows) ? rows : [];
      renderConversationList(state.manifestationRows);
    } catch (error) {
      setMessage(byId("manifestationMessageStatus"), error.message, "error");
    }
  }

  function renderConversationList(rows) {
    const list = byId("conversationList");
    list.replaceChildren();
    if (!rows.length) {
      list.append(makeElement("p", "Nenhuma manifestação identificada foi carregada.", "empty-state"));
      byId("conversationStatus").textContent = "0 conversas";
      return;
    }
    rows.forEach((row) => {
      const button = makeElement("button", "", "conversation-item");
      button.type = "button";
      button.dataset.manifestationId = cleanText(row.id, 80);
      button.append(
        makeElement("strong", cleanText(row.subject, 140)),
        makeElement("small", `${cleanText(row.protocol, 32)} · ${cleanText(row.status, 30)}`)
      );
      button.addEventListener("click", () => openOwnThread(row));
      list.append(button);
    });
    byId("conversationStatus").textContent = `${rows.length} conversa${rows.length === 1 ? "" : "s"}`;
  }

  async function openOwnThread(row) {
    if (!state.session) return;
    try {
      const thread = await state.adapter.getManifestationThread(row.id);
      state.activeThread = { type: "identified", row };
      renderThread(byId("threadMessages"), normalizeThread(thread, row));
      byId("crewReplyForm").hidden = false;
    } catch (error) {
      setMessage(byId("manifestationMessageStatus"), error.message, "error");
    }
  }

  function normalizeThread(payload, fallback = null) {
    let result = Array.isArray(payload) ? payload[0] || {} : payload || {};
    if (result.thread && typeof result.thread === "object") result = result.thread;
    const manifestation = result.manifestation || fallback || {};
    const messages = Array.isArray(result.messages) ? result.messages : [];
    return { manifestation, messages };
  }

  function renderThread(container, thread) {
    container.replaceChildren();
    const initial = thread.manifestation;
    if (initial && initial.body) {
      container.append(
        threadMessageElement(
          initial.identity_mode === "anonymous" ? "Tripulante anônimo" : "Tripulante",
          initial.body,
          initial.created_at,
          "crew"
        )
      );
    }
    thread.messages.forEach((message) => {
      container.append(
        threadMessageElement(
          message.author_role === "admin" ? "Equipe Antigravity" : "Tripulante",
          message.body,
          message.created_at,
          message.author_role === "admin" ? "admin" : "crew"
        )
      );
    });
    if (!container.children.length) {
      container.append(makeElement("p", "Conversa sem mensagens disponíveis.", "empty-state"));
    }
  }

  function threadMessageElement(author, body, createdAt, kind) {
    const article = makeElement("article", "", `thread-message ${kind}-message`);
    article.append(
      makeElement("strong", cleanText(author, 80)),
      makeElement("p", cleanText(body, 5000))
    );
    const time = makeElement("time", formatDate(createdAt));
    if (createdAt) time.dateTime = String(createdAt);
    article.append(time);
    return article;
  }

  async function lookupAnonymousThread(event) {
    event.preventDefault();
    if (
      !state.connected ||
      !state.adapter ||
      !state.adapter.hasManifestationGateway()
    ) {
      setMessage(
        byId("manifestationMessageStatus"),
        "Consulta anônima aguardando o gateway seguro; nada foi enviado.",
        "error"
      );
      return;
    }
    const protocol = cleanText(byId("lookupProtocol").value, 32).toUpperCase();
    const key = cleanText(byId("lookupKey").value, 128);
    byId("lookupKey").value = "";
    if (!PROTOCOL_PATTERN.test(protocol) || key.length < 32) {
      setMessage(byId("manifestationMessageStatus"), "Informe protocolo e chave secreta válidos.", "error");
      return;
    }
    try {
      const payload = await state.adapter.getAnonymousThread(protocol, key);
      const thread = normalizeThread(payload);
      state.activeThread = { type: "anonymous", protocol, key, row: thread.manifestation };
      renderThread(byId("threadMessages"), thread);
      byId("crewReplyForm").hidden = false;
      byId("conversationStatus").textContent = `Conversa ${protocol}`;
    } catch (error) {
      setMessage(byId("manifestationMessageStatus"), error.message, "error");
    }
  }

  async function replyAsCrew(event) {
    event.preventDefault();
    if (!state.activeThread) return;
    const body = cleanText(byId("crewReplyBody").value, 3000);
    if (body.length < 2) return;
    byId("crewReplyBody").value = "";
    try {
      if (state.activeThread.type === "identified") {
        await state.adapter.replyToManifestation(state.activeThread.row.id, body);
        await openOwnThread(state.activeThread.row);
      } else {
        await state.adapter.replyToAnonymousManifestation(
          state.activeThread.protocol,
          state.activeThread.key,
          body
        );
        const payload = await state.adapter.getAnonymousThread(
          state.activeThread.protocol,
          state.activeThread.key
        );
        renderThread(byId("threadMessages"), normalizeThread(payload));
      }
      setMessage(byId("manifestationMessageStatus"), "Mensagem adicionada à conversa assíncrona.", "success");
    } catch (error) {
      setMessage(byId("manifestationMessageStatus"), error.message, "error");
    }
  }

  function renderAdminInbox(rows) {
    if (!state.session || !state.isAdmin) return;
    const list = byId("adminInboxList");
    list.replaceChildren();
    rows.forEach((row) => {
      const button = makeElement("button", "", "conversation-item");
      button.type = "button";
      button.append(
        makeElement("strong", cleanText(row.subject, 140)),
        makeElement(
          "small",
          `${cleanText(row.protocol, 32)} · ${cleanText(row.category, 30)} · ${cleanText(row.status, 30)}`
        )
      );
      button.addEventListener("click", () => openAdminThread(row));
      list.append(button);
    });
    if (!rows.length) list.append(makeElement("p", "Nenhuma manifestação recebida.", "empty-state"));
    byId("adminInboxCount").textContent = `${rows.length} manifestaç${rows.length === 1 ? "ão" : "ões"}`;
  }

  async function openAdminThread(row) {
    if (!state.session || !state.isAdmin) return;
    try {
      const payload = await state.adapter.getManifestationThread(row.id);
      state.adminActiveThread = row;
      renderThread(byId("adminThreadMessages"), normalizeThread(payload, row));
      byId("adminReplyForm").hidden = false;
    } catch (error) {
      setMessage(byId("adminMessage"), error.message, "error");
    }
  }

  async function replyAsAdmin(event) {
    event.preventDefault();
    if (!state.session || !state.isAdmin || !state.adminActiveThread) return;
    const body = cleanText(byId("adminReplyBody").value, 3000);
    if (body.length < 2) return;
    byId("adminReplyBody").value = "";
    try {
      await state.adapter.replyToManifestation(state.adminActiveThread.id, body);
      await openAdminThread(state.adminActiveThread);
      setMessage(byId("adminMessage"), "Resposta adicionada à conversa.", "success");
    } catch (error) {
      setMessage(byId("adminMessage"), error.message, "error");
    }
  }

  function configureInstitutionalEmail() {
    const container = byId("institutionalEmailStatus");
    container.replaceChildren();
    const email = cleanText(config.institutionalEmail, 254).toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      container.textContent = "Canal de e-mail em configuração.";
      return;
    }
    container.append(text("E-mail institucional: "));
    const link = makeElement("a", email);
    link.href = `mailto:${email}`;
    link.rel = "nofollow";
    container.append(link);
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => showView(button.dataset.view));
    });
    byId("joinMission").addEventListener("click", () => {
      showView("public");
      byId("authCard").scrollIntoView({ behavior: "smooth", block: "center" });
      byId("authEmail").focus({ preventScroll: true });
    });
    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
    });
    byId("authForm").addEventListener("submit", handleAuthSubmit);
    byId("signOutButton").addEventListener("click", async () => {
      try {
        if (state.adapter && state.session) await state.adapter.signOut();
      } catch (_error) {
        // Local session is cleared even when the remote logout is unavailable.
      }
      clearSession();
      setMessage(byId("authMessage"), "Sessão encerrada.", "success");
    });
    byId("preferencesForm").addEventListener("submit", savePreferences);
    byId("themePreference").addEventListener("change", (event) => {
      const profile = event.target.value;
      const profileMode = PROFILE_MODES[profile] || "dark";
      byId("colorModePreference").value = profileMode;
      applyTheme(profile, profileMode);
    });
    byId("colorModePreference").addEventListener("change", () => {
      applyTheme(byId("themePreference").value, byId("colorModePreference").value);
    });
    byId("clarityToggle").addEventListener("click", () => {
      const currentMode = byId("colorModePreference").value;
      const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      const currentlyLight = currentMode === "light" || (currentMode === "system" && systemLight);
      const nextMode = currentlyLight ? "dark" : "light";
      const nextProfile = currentlyLight ? "aerospace" : "aerospace-light";
      byId("colorModePreference").value = nextMode;
      byId("themePreference").value = nextProfile;
      const preferences = { ...getPreferencesFromForm(), colorMode: nextMode, theme: nextProfile };
      writeStorage(localStorage, PREFERENCES_KEY, preferences);
      const existingA11y = readStorage(localStorage, A11Y_PREFERENCES_KEY, {});
      writeStorage(localStorage, A11Y_PREFERENCES_KEY, {
        ...existingA11y,
        theme: nextMode,
        visualProfile: nextProfile
      });
      applyTheme(nextProfile, nextMode);
    });
    byId("resetLocalPreferences").addEventListener("click", () => {
      removeStorage(localStorage, PREFERENCES_KEY);
      removeStorage(localStorage, A11Y_PREFERENCES_KEY);
      fillPreferences(DEFAULT_PREFERENCES);
      setMessage(byId("preferencesMessage"), "Preferências locais restauradas.", "success");
    });
    byId("newsletterForm").addEventListener("submit", subscribeNewsletter);
    byId("unsubscribeButton").addEventListener("click", unsubscribeNewsletter);
    byId("directorySearch").addEventListener("input", (event) => {
      if (!state.session || !state.isAdmin) return;
      renderDirectory(
        state.directoryRows,
        state.subscriptionRows,
        event.target.value
      );
    });
    byId("manifestationCategory").addEventListener("change", (event) => {
      const isOther = event.target.value === "outra";
      byId("otherCategoryField").hidden = !isOther;
      byId("manifestationOtherCategory").required = isOther;
    });
    byId("manifestationForm").addEventListener("submit", submitManifestation);
    byId("copyProtocolButton").addEventListener("click", copyProtocol);
    byId("anonymousLookupForm").addEventListener("submit", lookupAnonymousThread);
    byId("crewReplyForm").addEventListener("submit", replyAsCrew);
    byId("adminReplyForm").addEventListener("submit", replyAsAdmin);
    byId("ownerDocumentForm").addEventListener("submit", saveOwnerDocument);
    byId("clearOwnerDocument").addEventListener("click", clearOwnerDocumentForm);
    byId("credentialSubmissionForm").addEventListener("submit", submitOwnerCredential);
    window.addEventListener("hashchange", () => {
      showView(requestedViewFromLocation());
    });
  }

  async function initialize() {
    fillPreferences(loadLocalPreferences());
    bindEvents();
    configureInstitutionalEmail();
    if (state.connected) {
      setServiceStatus(
        "connected",
        "Backend configurado",
        "Métricas e contas serão exibidas somente após respostas autorizadas pelo servidor."
      );
      state.adapter.recordSectionView("centro-tripulacao").catch(() => {
        // Telemetria é opcional; falhar não gera número local nem bloqueia a página.
      });
    } else if (connection.invalid) {
      setServiceStatus(
        "error",
        "Configuração bloqueada por segurança",
        connection.reason
      );
    } else {
      setServiceStatus(
        "disconnected",
        "Serviço ainda não conectado",
        "Preferências locais funcionam; login, assinatura, protocolos e métricas reais permanecem indisponíveis."
      );
    }
    setConnectedControls();
    await loadPublicMetrics();
    showView(requestedViewFromLocation());
    const colorSchemeMedia = window.matchMedia("(prefers-color-scheme: light)");
    const syncSystemTheme = () => {
      const preferences = getPreferencesFromForm();
      if (preferences.colorMode === "system") applyTheme(preferences.theme, "system");
    };
    colorSchemeMedia.addEventListener?.("change", syncSystemTheme);
    colorSchemeMedia.addListener?.(syncSystemTheme);
  }

  initialize();
})();
