(() => {
  "use strict";

  const A11Y_STORAGE_KEY = "antigravity:a11y:v1";
  const BRAND_THEME_RELEASE = "aerospace-primary-v1";
  const FEED_URL = "./data/content/public-feed.json";
  const DOCUMENTS_URL = "./data/content/public-documents.json";
  const PAGE_SIZE = 6;
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  const ALLOWED_PROFILES = new Set([
    "bruxa-rustica-moderna",
    "total-orange",
    "mystic-aerospace",
    "aerospace",
    "aerospace-light",
    "rustic-light",
    "dark",
    "minimal",
    "sepia",
    "oceanic",
    "green",
    "natural",
    "forest",
    "wizard-academy",
    "comic-hero",
    "modern-serious"
  ]);

  const LIGHT_PROFILES = new Set([
    "aerospace-light",
    "rustic-light",
    "minimal",
    "sepia",
    "natural",
    "modern-serious"
  ]);

  const CATEGORY_LABELS = new Map([
    ["reflexoes", "Reflexões"],
    ["ideias", "Ideias"],
    ["insights", "Insights"],
    ["promessas-publicas", "Promessas públicas"],
    ["relatos", "Relatos"],
    ["manifestacoes", "Manifestações"],
    ["historia-biografia", "História e biografia"]
  ]);

  const DOCUMENT_CATEGORY_LABELS = new Map([
    ["apresentacao", "Apresentação"],
    ["biografia", "Biografia"],
    ["curriculo", "Currículo"],
    ["historia", "História"],
    ["experiencia-profissional", "Experiência profissional"],
    ["relatos", "Relatos"],
    ["manifestacoes", "Manifestações"]
  ]);

  const VERIFICATION_LABELS = new Map([
    ["not-applicable", "Verificação não aplicável"],
    ["self-reported", "Relato pessoal revisado"],
    ["verified", "Informação verificada"]
  ]);

  const CONVERSATION_CATEGORIES = new Set([
    "pergunta",
    "contato-pessoal",
    "produtividade",
    "contribuicao-operacional",
    "contribuicao-cientifica",
    "relato"
  ]);

  const THREAD_AUTHORS = new Map([
    ["subscriber", "Assinante"],
    ["idealizer", "Idealizador"],
    ["system", "Sistema do canal"]
  ]);

  const state = {
    approvedEntries: [],
    approvedDocuments: [],
    visibleCount: PAGE_SIZE,
    search: "",
    category: "all",
    lastSubmissionAt: 0,
    conversationEndpoint: null,
    threadEndpoint: null
  };

  const elements = {
    tools: document.getElementById("feedTools"),
    search: document.getElementById("feedSearch"),
    category: document.getElementById("categoryFilter"),
    list: document.getElementById("feedList"),
    status: document.getElementById("feedStatus"),
    empty: document.getElementById("emptyState"),
    error: document.getElementById("feedError"),
    loadMore: document.getElementById("loadMore"),
    documentsList: document.getElementById("documentsList"),
    documentsStatus: document.getElementById("documentsStatus"),
    documentsEmpty: document.getElementById("documentsEmpty"),
    documentsError: document.getElementById("documentsError"),
    conversationStatus: document.getElementById("conversationStatus"),
    suggestedEmailIdentity: document.getElementById("suggestedEmailIdentity"),
    contactEmailStatus: document.getElementById("contactEmailStatus"),
    conversationForm: document.getElementById("conversationForm"),
    conversationMessage: document.getElementById("conversationMessage"),
    threadLookupForm: document.getElementById("threadLookupForm"),
    threadLookupMessage: document.getElementById("threadLookupMessage"),
    threadMessages: document.getElementById("threadMessages"),
    threadProtocolLabel: document.getElementById("threadProtocolLabel")
  };

  function safeInteger(value, fallback, minimum, maximum) {
    return Number.isInteger(value) && value >= minimum && value <= maximum
      ? value
      : fallback;
  }

  function safeEmail(value) {
    const email = cleanText(value, 254);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
  }

  function safeAllowedOrigin(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.origin : "";
    } catch (_error) {
      return "";
    }
  }

  function readRuntimeConfig() {
    const raw = window.ANTIGRAVITY_IDEALIZER_CONFIG;
    const source = raw && typeof raw === "object" ? raw : {};
    const origins = Array.isArray(source.allowedGatewayOrigins)
      ? source.allowedGatewayOrigins.map(safeAllowedOrigin).filter(Boolean)
      : [];
    return Object.freeze({
      mode: source.mode === "gateway" ? "gateway" : "disconnected",
      conversationEndpoint: cleanText(source.conversationEndpoint, 500),
      threadEndpoint: cleanText(source.threadEndpoint, 500),
      allowedGatewayOrigins: new Set(origins),
      contactEmail: safeEmail(source.contactEmail),
      suggestedEmailIdentity: cleanText(source.suggestedEmailIdentity, 80) || "AldenGrav360",
      maxMessageLength: safeInteger(source.maxMessageLength, 3000, 500, 3000),
      minimumSubmissionIntervalMs: safeInteger(
        source.minimumSubmissionIntervalMs,
        60000,
        60000,
        3600000
      ),
      requestTimeoutMs: safeInteger(source.requestTimeoutMs, 12000, 3000, 30000)
    });
  }

  const runtimeConfig = readRuntimeConfig();

  function readPreferences() {
    try {
      const raw = localStorage.getItem(A11Y_STORAGE_KEY);
      if (!raw) {
        return {
          theme: "dark",
          visualProfile: "aerospace",
          brandThemeRelease: BRAND_THEME_RELEASE
        };
      }
      const parsed = JSON.parse(raw);
      const preferences = parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
      const previousBrandDefault = (
        !preferences.visualProfile ||
        (preferences.visualProfile === "bruxa-rustica-moderna" && preferences.brandThemeRelease === "bruxa-rustica-moderna-v1") ||
        (preferences.visualProfile === "total-orange" && preferences.brandThemeRelease !== "bruxa-rustica-moderna-v1")
      );
      if (
        preferences.brandThemeRelease !== BRAND_THEME_RELEASE &&
        previousBrandDefault &&
        preferences.contrast !== true && preferences.clarity !== true &&
        !["light", "system"].includes(preferences.theme)
      ) {
        const migrated = {
          ...preferences,
          theme: "dark",
          visualProfile: "aerospace",
          brandThemeRelease: BRAND_THEME_RELEASE
        };
        return migrated;
      }
      return preferences;
    } catch (_error) {
      return {
        theme: "dark",
        visualProfile: "aerospace",
        brandThemeRelease: BRAND_THEME_RELEASE
      };
    }
  }

  function applyVisualProfile() {
    const preferences = readPreferences();
    const requestedProfile = ALLOWED_PROFILES.has(preferences.visualProfile)
      ? preferences.visualProfile
      : "aerospace";
    const requestedMode = ["dark", "light", "system"].includes(preferences.theme)
      ? preferences.theme
      : preferences.clarity === true
        ? "light"
        : LIGHT_PROFILES.has(requestedProfile) ? "light" : "dark";
    const contrast = preferences.contrast === true;
    const mode = contrast
      ? "dark"
      : requestedMode === "system" ? (systemTheme.matches ? "light" : "dark") : requestedMode;
    const profile = contrast
      ? "contrast"
      : mode === "light" && !LIGHT_PROFILES.has(requestedProfile)
        ? "aerospace-light"
        : mode === "dark" && LIGHT_PROFILES.has(requestedProfile)
          ? "aerospace"
          : requestedProfile;
    document.documentElement.dataset.visualProfile = profile;
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.themeMode = requestedMode;
    document.documentElement.classList.toggle("a11y-contrast", contrast);
    document.documentElement.style.colorScheme = mode;
    const themeMeta = document.querySelector("meta[name=theme-color]");
    if (themeMeta) {
      themeMeta.content = contrast ? "#000000" : mode === "light" ? "#ffffff" : profile === "bruxa-rustica-moderna" ? "#0b100c" : profile === "total-orange" ? "#0b0603" : "#071422";
    }
  }

  function cleanText(value, maximum = 5000) {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim().slice(0, maximum);
  }

  function isValidIsoDate(value) {
    if (typeof value !== "string" || !value.includes("T")) return false;
    return Number.isFinite(Date.parse(value));
  }

  function safeExternalReference(reference) {
    if (!reference || typeof reference !== "object") return null;
    const label = cleanText(reference.label, 160);
    try {
      const url = new URL(reference.url);
      if (url.protocol !== "https:" || !label) return null;
      return { label, url: url.href };
    } catch (_error) {
      return null;
    }
  }

  function normalizeApprovedEntry(entry) {
    if (!entry || typeof entry !== "object") return null;
    if (entry.status !== "public-approved") return null;
    if (entry.visibility !== "public") return null;
    if (!CATEGORY_LABELS.has(entry.category)) return null;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id || "")) return null;
    if (!isValidIsoDate(entry.publishedAt) || !isValidIsoDate(entry.updatedAt)) return null;

    const title = cleanText(entry.title, 180);
    const content = cleanText(entry.content, 5000);
    const version = cleanText(entry.version, 32);
    const kind = cleanText(entry.kind, 32);
    if (!title || !content || !version || !kind) return null;

    const rawReferences = Array.isArray(entry.references) ? entry.references : [];
    const references = rawReferences.map(safeExternalReference).filter(Boolean);
    if (entry.kind === "factual" && references.length === 0) return null;
    if (entry.kind === "credential" && references.length === 0) return null;

    return {
      id: entry.id,
      status: entry.status,
      visibility: entry.visibility,
      category: entry.category,
      kind,
      title,
      content,
      publishedAt: entry.publishedAt,
      updatedAt: entry.updatedAt,
      version,
      references
    };
  }

  function normalizeApprovedDocument(entry) {
    if (!entry || typeof entry !== "object") return null;
    if (entry.status !== "public-approved") return null;
    if (entry.visibility !== "public") return null;
    if (!DOCUMENT_CATEGORY_LABELS.has(entry.category)) return null;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id || "")) return null;
    if (!isValidIsoDate(entry.publishedAt) || !isValidIsoDate(entry.updatedAt)) return null;

    const title = cleanText(entry.title, 180);
    const content = cleanText(entry.content, 7000);
    const version = cleanText(entry.version, 32);
    const kind = cleanText(entry.kind, 32);
    const verificationStatus = cleanText(entry.verificationStatus, 32);
    if (!title || !content || !version || !kind) return null;
    if (!VERIFICATION_LABELS.has(verificationStatus)) return null;

    const rawReferences = Array.isArray(entry.references) ? entry.references : [];
    const references = rawReferences.map(safeExternalReference).filter(Boolean);
    const requiresVerification = kind === "factual" || kind === "credential";
    if (requiresVerification && verificationStatus !== "verified") return null;
    if (requiresVerification && references.length === 0) return null;

    return {
      id: entry.id,
      status: entry.status,
      visibility: entry.visibility,
      category: entry.category,
      kind,
      verificationStatus,
      title,
      content,
      publishedAt: entry.publishedAt,
      updatedAt: entry.updatedAt,
      version,
      references
    };
  }

  function normalizeForSearch(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  }

  function filteredEntries() {
    const query = normalizeForSearch(state.search);
    return state.approvedEntries.filter((entry) => {
      const categoryMatches = state.category === "all" || entry.category === state.category;
      if (!categoryMatches) return false;
      if (!query) return true;
      return normalizeForSearch(`${entry.title} ${entry.content} ${CATEGORY_LABELS.get(entry.category)}`).includes(query);
    });
  }

  function formatDate(isoValue) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date(isoValue));
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderReferences(references) {
    if (!references.length) return null;
    const list = makeElement("ul", "reference-list");
    list.setAttribute("aria-label", "Referências desta publicação");
    references.forEach((reference) => {
      const item = document.createElement("li");
      const link = makeElement("a", "", reference.label);
      link.href = reference.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow external";
      item.append(link);
      list.append(item);
    });
    return list;
  }

  function renderCard(entry) {
    const article = makeElement("article", "feed-card");
    article.id = `publicacao-${entry.id}`;

    const meta = makeElement("div", "feed-meta");
    meta.append(
      makeElement("span", "category-badge", CATEGORY_LABELS.get(entry.category)),
      makeElement("time", "", formatDate(entry.publishedAt)),
      makeElement("span", "version-label", `versão ${entry.version}`)
    );
    meta.querySelector("time").dateTime = entry.publishedAt;

    const body = makeElement("div", "feed-body");
    const title = makeElement("h3", "", entry.title);
    const paragraph = makeElement("p", "", entry.content);
    body.append(title, paragraph);

    const references = renderReferences(entry.references);
    if (references) body.append(references);
    article.append(meta, body);
    return article;
  }

  function renderDocumentCard(entry) {
    const article = makeElement("article", "document-card");
    article.id = `documento-${entry.id}`;

    const heading = makeElement("div", "document-heading");
    const headingCopy = document.createElement("div");
    headingCopy.append(
      makeElement("span", "category-badge", DOCUMENT_CATEGORY_LABELS.get(entry.category)),
      makeElement("h3", "", entry.title)
    );
    heading.append(
      headingCopy,
      makeElement(
        "span",
        `verification-badge verification-${entry.verificationStatus}`,
        VERIFICATION_LABELS.get(entry.verificationStatus)
      )
    );

    const content = makeElement("p", "document-content", entry.content);
    const meta = makeElement("p", "document-meta");
    const published = document.createElement("time");
    published.dateTime = entry.publishedAt;
    published.textContent = `Publicado em ${formatDate(entry.publishedAt)}`;
    meta.append(
      published,
      document.createTextNode(` · versão ${entry.version}`)
    );
    article.append(heading, content, meta);

    const references = renderReferences(entry.references);
    if (references) article.append(references);
    return article;
  }

  function renderDocuments() {
    const fragment = document.createDocumentFragment();
    state.approvedDocuments.forEach((entry) => {
      fragment.append(renderDocumentCard(entry));
    });
    elements.documentsList.replaceChildren(fragment);
    elements.documentsList.setAttribute("aria-busy", "false");
    elements.documentsEmpty.hidden = state.approvedDocuments.length !== 0;
    elements.documentsError.hidden = true;
    const total = state.approvedDocuments.length;
    elements.documentsStatus.textContent = total === 1
      ? "1 documento aprovado"
      : `${total} documentos aprovados`;
  }

  function showDocumentsFailure() {
    state.approvedDocuments = [];
    elements.documentsList.replaceChildren();
    elements.documentsList.setAttribute("aria-busy", "false");
    elements.documentsEmpty.hidden = true;
    elements.documentsError.hidden = false;
    elements.documentsStatus.textContent = "Arquivo público indisponível";
  }

  function updateStatus(filteredTotal) {
    const total = state.approvedEntries.length;
    if (state.search || state.category !== "all") {
      elements.status.textContent = `${filteredTotal} de ${total} publicações aprovadas`;
      return;
    }
    elements.status.textContent = total === 1
      ? "1 publicação aprovada"
      : `${total} publicações aprovadas`;
  }

  function renderFeed() {
    const filtered = filteredEntries();
    const visible = filtered.slice(0, state.visibleCount);
    const fragment = document.createDocumentFragment();
    visible.forEach((entry) => fragment.append(renderCard(entry)));
    elements.list.replaceChildren(fragment);
    elements.list.setAttribute("aria-busy", "false");
    elements.empty.hidden = filtered.length !== 0;
    elements.error.hidden = true;
    elements.loadMore.hidden = visible.length >= filtered.length;
    updateStatus(filtered.length);
  }

  function showFeedFailure() {
    state.approvedEntries = [];
    elements.list.replaceChildren();
    elements.list.setAttribute("aria-busy", "false");
    elements.empty.hidden = true;
    elements.error.hidden = false;
    elements.loadMore.hidden = true;
    elements.status.textContent = "Feed indisponível";
  }

  async function loadApprovedFeed() {
    try {
      const response = await fetch(FEED_URL, {
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("feed-unavailable");
      const documentData = await response.json();
      if (!documentData || !Array.isArray(documentData.entries)) {
        throw new Error("invalid-feed");
      }
      state.approvedEntries = documentData.entries
        .map(normalizeApprovedEntry)
        .filter(Boolean)
        .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
      renderFeed();
    } catch (_error) {
      showFeedFailure();
    }
  }

  async function loadApprovedDocuments() {
    try {
      const response = await fetch(DOCUMENTS_URL, {
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("documents-unavailable");
      const documentData = await response.json();
      if (!documentData || !Array.isArray(documentData.entries)) {
        throw new Error("invalid-documents");
      }
      state.approvedDocuments = documentData.entries
        .map(normalizeApprovedDocument)
        .filter(Boolean)
        .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
      renderDocuments();
    } catch (_error) {
      showDocumentsFailure();
    }
  }

  function resolveGatewayEndpoint(configuredValue) {
    if (runtimeConfig.mode !== "gateway" || !configuredValue) return null;
    try {
      const url = new URL(configuredValue, window.location.href);
      if (!["http:", "https:"].includes(url.protocol)) return null;
      if (url.username || url.password) return null;
      const isSameOrigin = url.origin === window.location.origin;
      const isApprovedExternal =
        url.protocol === "https:" &&
        runtimeConfig.allowedGatewayOrigins.has(url.origin);
      if (!isSameOrigin && !isApprovedExternal) return null;
      return url;
    } catch (_error) {
      return null;
    }
  }

  function setConversationControlsEnabled(enabled) {
    [elements.conversationForm, elements.threadLookupForm].forEach((form) => {
      form.querySelectorAll("input, select, textarea, button").forEach((control) => {
        control.disabled = !enabled;
      });
    });
  }

  function updateContactIdentity() {
    elements.suggestedEmailIdentity.textContent =
      `Identidade sugerida: ${runtimeConfig.suggestedEmailIdentity}`;
    elements.contactEmailStatus.replaceChildren();
    if (!runtimeConfig.contactEmail) {
      elements.contactEmailStatus.textContent =
        "E-mail institucional em ativação — nenhum endereço foi publicado.";
      return;
    }
    const link = makeElement("a", "", runtimeConfig.contactEmail);
    link.href = `mailto:${runtimeConfig.contactEmail}`;
    link.rel = "nofollow";
    elements.contactEmailStatus.append(
      document.createTextNode("E-mail institucional: "),
      link
    );
  }

  function initializeConversationGateway() {
    state.conversationEndpoint = resolveGatewayEndpoint(
      runtimeConfig.conversationEndpoint
    );
    state.threadEndpoint = resolveGatewayEndpoint(runtimeConfig.threadEndpoint);
    const isReady = Boolean(state.conversationEndpoint && state.threadEndpoint);
    setConversationControlsEnabled(isReady);
    updateContactIdentity();
    if (!isReady) {
      elements.conversationStatus.textContent = "Canal direto ainda não conectado";
      elements.conversationStatus.className = "status-pill offline";
      elements.conversationMessage.textContent =
        "Serviço desativado: nada será enviado.";
      return;
    }
    elements.conversationStatus.textContent = "Gateway seguro configurado";
    elements.conversationStatus.className = "status-pill ready";
    elements.conversationMessage.textContent =
      "Canal configurado. O envio só ocorrerá após validação e consentimento.";
  }

  function cleanMultilineText(value, maximum) {
    if (typeof value !== "string") return "";
    return value
      .replace(/\r\n?/g, "\n")
      .replace(/\u0000/g, "")
      .trim()
      .slice(0, maximum);
  }

  async function postGatewayJson(endpoint, payload) {
    if (!(endpoint instanceof URL)) throw new Error("gateway-disabled");
    const serialized = JSON.stringify(payload);
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      runtimeConfig.requestTimeoutMs
    );
    try {
      const response = await fetch(endpoint.href, {
        method: "POST",
        credentials:
          endpoint.origin === window.location.origin ? "same-origin" : "omit",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: serialized,
        signal: controller.signal
      });
      if (!response.ok) throw new Error("gateway-request-failed");
      const responseText = await response.text();
      if (!responseText || responseText.length > 200000) {
        throw new Error("invalid-gateway-response");
      }
      const data = JSON.parse(responseText);
      if (!data || typeof data !== "object") {
        throw new Error("invalid-gateway-response");
      }
      return data;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function normalizeThreadMessage(message) {
    if (!message || typeof message !== "object") return null;
    if (!THREAD_AUTHORS.has(message.authorRole)) return null;
    if (!isValidIsoDate(message.createdAt)) return null;
    const body = cleanMultilineText(message.body, 5000);
    if (!body) return null;
    return {
      authorRole: message.authorRole,
      body,
      createdAt: message.createdAt
    };
  }

  function renderThread(messages, protocol) {
    const safeMessages = (Array.isArray(messages) ? messages : [])
      .slice(0, 100)
      .map(normalizeThreadMessage)
      .filter(Boolean)
      .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
    const fragment = document.createDocumentFragment();
    if (safeMessages.length === 0) {
      fragment.append(
        makeElement(
          "p",
          "thread-empty",
          "Nenhuma mensagem válida foi devolvida pelo gateway."
        )
      );
    } else {
      safeMessages.forEach((message) => {
        const article = makeElement(
          "article",
          `thread-message from-${message.authorRole}`
        );
        const header = document.createElement("header");
        const author = makeElement(
          "strong",
          "",
          THREAD_AUTHORS.get(message.authorRole)
        );
        const time = makeElement("time", "", formatDate(message.createdAt));
        time.dateTime = message.createdAt;
        header.append(author, time);
        article.append(header, makeElement("p", "", message.body));
        fragment.append(article);
      });
    }
    elements.threadMessages.replaceChildren(fragment);
    const safeProtocol = cleanText(protocol, 40);
    elements.threadProtocolLabel.textContent = safeProtocol
      ? `Protocolo ${safeProtocol}`
      : "";
  }

  function conversationPayloadFromForm() {
    const category = elements.conversationForm.elements.category.value;
    const displayName = cleanText(
      elements.conversationForm.elements.displayName.value,
      80
    );
    const email = safeEmail(elements.conversationForm.elements.email.value);
    const subject = cleanText(
      elements.conversationForm.elements.subject.value,
      140
    );
    const message = cleanMultilineText(
      elements.conversationForm.elements.message.value,
      runtimeConfig.maxMessageLength
    );
    const rightsConsent = document.getElementById("rightsConsent").checked;
    const privacyConsent = document.getElementById("privacyConsent").checked;

    if (!CONVERSATION_CATEGORIES.has(category)) {
      throw new Error("Selecione uma categoria válida.");
    }
    if (!email) throw new Error("Informe um e-mail válido.");
    if (subject.length < 4) throw new Error("O assunto precisa ter ao menos 4 caracteres.");
    if (message.length < 20) throw new Error("A mensagem precisa ter ao menos 20 caracteres.");
    if (!rightsConsent || !privacyConsent) {
      throw new Error("Confirme autoria/licença, privacidade e ausência de dados de pacientes.");
    }
    return {
      schemaVersion: "1.0.0",
      channel: "conheca-aldenir",
      category,
      displayName,
      email,
      subject,
      message,
      consent: {
        rightsConfirmed: true,
        privacyConfirmed: true,
        patientDataExcluded: true
      }
    };
  }

  async function submitConversation(event) {
    event.preventDefault();
    if (!state.conversationEndpoint || !state.threadEndpoint) {
      elements.conversationMessage.textContent =
        "Serviço desativado: nada foi enviado.";
      return;
    }
    const elapsed = Date.now() - state.lastSubmissionAt;
    if (elapsed < runtimeConfig.minimumSubmissionIntervalMs) {
      const remainingSeconds = Math.ceil(
        (runtimeConfig.minimumSubmissionIntervalMs - elapsed) / 1000
      );
      elements.conversationMessage.textContent =
        `Aguarde ${remainingSeconds} segundos antes de uma nova tentativa.`;
      return;
    }

    let payload;
    try {
      payload = conversationPayloadFromForm();
    } catch (error) {
      elements.conversationMessage.textContent = error.message;
      return;
    }

    const submitButton = document.getElementById("conversationSubmit");
    submitButton.disabled = true;
    state.lastSubmissionAt = Date.now();
    elements.conversationMessage.textContent = "Enviando pelo gateway seguro…";
    try {
      const response = await postGatewayJson(state.conversationEndpoint, payload);
      const protocol = cleanText(response.protocol, 40);
      if (!/^[A-Z0-9-]{8,40}$/.test(protocol)) {
        throw new Error("invalid-protocol");
      }
      elements.conversationForm.reset();
      elements.conversationMessage.textContent =
        `Mensagem recebida pelo gateway. Protocolo: ${protocol}.`;
      renderThread(response.messages, protocol);
    } catch (_error) {
      elements.conversationMessage.textContent =
        "O gateway não confirmou o envio. Revise os dados e tente novamente mais tarde.";
    } finally {
      payload = null;
      submitButton.disabled = false;
    }
  }

  async function lookupThread(event) {
    event.preventDefault();
    if (!state.threadEndpoint) {
      elements.threadLookupMessage.textContent =
        "Serviço desativado: nenhuma conversa foi consultada.";
      return;
    }
    const protocol = cleanText(
      document.getElementById("threadProtocol").value,
      40
    ).toUpperCase();
    let accessCode = cleanText(
      document.getElementById("threadAccessCode").value,
      128
    );
    document.getElementById("threadAccessCode").value = "";
    if (!/^[A-Z0-9-]{8,40}$/.test(protocol) || accessCode.length < 8) {
      accessCode = "";
      elements.threadLookupMessage.textContent =
        "Informe protocolo e código de acesso válidos.";
      return;
    }

    const lookupButton = document.getElementById("threadLookupSubmit");
    lookupButton.disabled = true;
    elements.threadLookupMessage.textContent = "Consultando gateway seguro…";
    try {
      const response = await postGatewayJson(state.threadEndpoint, {
        operation: "read-thread",
        protocol,
        accessCode
      });
      renderThread(response.messages, protocol);
      elements.threadLookupMessage.textContent =
        "Conversa atualizada. O código de acesso não foi armazenado.";
    } catch (_error) {
      elements.threadLookupMessage.textContent =
        "Não foi possível autenticar ou carregar esta conversa.";
    } finally {
      accessCode = "";
      lookupButton.disabled = false;
    }
  }

  function bindInteractions() {
    elements.search.addEventListener("input", () => {
      state.search = elements.search.value.trim();
      state.visibleCount = PAGE_SIZE;
      renderFeed();
    });
    elements.category.addEventListener("change", () => {
      state.category = elements.category.value;
      state.visibleCount = PAGE_SIZE;
      renderFeed();
    });
    elements.tools.addEventListener("reset", () => {
      window.setTimeout(() => {
        state.search = "";
        state.category = "all";
        state.visibleCount = PAGE_SIZE;
        renderFeed();
      }, 0);
    });
    elements.loadMore.addEventListener("click", () => {
      state.visibleCount += PAGE_SIZE;
      renderFeed();
    });
    elements.conversationForm.addEventListener("submit", submitConversation);
    elements.threadLookupForm.addEventListener("submit", lookupThread);
    window.addEventListener("storage", (event) => {
      if (event.key === A11Y_STORAGE_KEY) applyVisualProfile();
    });
    if (typeof systemTheme.addEventListener === "function") {
      systemTheme.addEventListener("change", applyVisualProfile);
    } else {
      systemTheme.addListener?.(applyVisualProfile);
    }
  }

  applyVisualProfile();
  initializeConversationGateway();
  bindInteractions();
  loadApprovedDocuments();
  loadApprovedFeed();
})();
