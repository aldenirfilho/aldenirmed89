const RECOVERY_URL = "data/authorial_recovery_public_summary.json";
const CATALOG_URL = "data/biblioteca_catalogo.json";
const STORE_KEY = "antigravity-clinical-review-queue-v1";
const STORE_SCHEMA = 1;
const MAX_JSON_BYTES = 5 * 1024 * 1024;
const MAX_RECORDS = 5000;
const STATUS_VALUES = new Set([
  "pending",
  "assigned",
  "in-review",
  "approved",
  "expired",
  "quarantine",
]);
const STATUS_LABELS = Object.freeze({
  pending: "Pendente",
  assigned: "Atribuído",
  "in-review": "Em revisão",
  approved: "Aprovado",
  expired: "Validade vencida",
  quarantine: "Quarentena",
});
const BLOCKED_PATH_SEGMENTS = new Set(["_private", "inbox", "juridico-financeiro"]);

const state = {
  documents: [],
  byId: new Map(),
  records: Object.create(null),
};

const $ = (id) => document.getElementById(id);

function setStatus(message, tone = "") {
  const target = $("dashboardStatus");
  target.textContent = String(message || "");
  target.className = `status${tone ? ` ${tone}` : ""}`;
}

function cleanText(value, limit) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, limit);
}

function normalizeSearch(value) {
  return cleanText(value, 300)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function validDate(value) {
  const normalized = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return "";
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    Number.isNaN(date.getTime())
    || date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return "";
  return normalized;
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function isSafeDocumentPath(value) {
  const path = cleanText(value, 1000).replaceAll("\\", "/");
  if (!path || path.startsWith("/") || path.includes("\u0000")) return false;
  const parts = path.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) return false;
  return !parts.some((part) => BLOCKED_PATH_SEGMENTS.has(part.toLocaleLowerCase("pt-BR")));
}

async function fetchJsonLimited(url, maxBytes = MAX_JSON_BYTES) {
  const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status} ao carregar ${url}`);
  const declared = Number(response.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new Error(`Arquivo de dados excede ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }

  if (!response.body || typeof response.body.getReader !== "function") {
    if (!declared) throw new Error("Navegador sem leitura limitada e resposta sem tamanho declarado.");
    const fallback = await response.arrayBuffer();
    if (fallback.byteLength > maxBytes) throw new Error("Arquivo de dados excede o limite seguro.");
    return JSON.parse(new TextDecoder("utf-8").decode(fallback));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel("limit-exceeded");
        throw new Error("Arquivo de dados excede o limite seguro.");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(text);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function appendMetric(container, value, label, detail, tone = "") {
  const card = element("article", `metric${tone ? ` ${tone}` : ""}`);
  card.append(
    element("strong", "", value),
    element("span", "", label),
    element("small", "", detail),
  );
  container.append(card);
}

function validateRecoverySummary(payload) {
  if (!payload || payload.schemaVersion !== 1 || payload.kind !== "authorial-recovery-public-aggregate") {
    throw new Error("Resumo agregado de recuperação possui schema incompatível.");
  }
  if (
    payload.privacy?.aggregateOnly !== true ||
    payload.privacy?.containsCandidateNames !== false ||
    payload.privacy?.containsPaths !== false ||
    payload.privacy?.containsHashes !== false ||
    payload.privacy?.publishesDocuments !== false
  ) {
    throw new Error("Resumo de recuperação não comprovou o contrato de privacidade.");
  }
  const numeric = [
    payload.baseline?.requestedCandidates,
    payload.current?.candidates,
    payload.current?.uniqueSha256,
    payload.current?.exactDuplicateGroups,
    payload.current?.possibleRenditionGroups,
    payload.current?.alreadyPublicUniqueSha256,
    payload.current?.eligibleUniqueWorks,
    payload.nextBatch?.selectedUniqueWorks,
    payload.nextBatch?.remainingUniqueWorksAfterBatch,
  ];
  if (numeric.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new Error("Resumo agregado contém contagem inválida.");
  }
  return payload;
}

function renderRecovery(raw) {
  const payload = validateRecoverySummary(raw);
  const metrics = $("recoveryMetrics");
  metrics.replaceChildren();
  appendMetric(metrics, payload.current.candidates, "Candidatos atuais", "Ocorrências inventariadas em modo somente leitura");
  appendMetric(metrics, payload.current.uniqueSha256, "Obras únicas por SHA", "Duplicatas exatas ocupam uma única unidade de revisão", "safe");
  appendMetric(metrics, payload.current.exactDuplicateGroups, "Grupos duplicados", `${payload.current.filesInExactDuplicateGroups} ocorrências preservadas`, "warn");
  appendMetric(metrics, payload.current.possibleRenditionGroups, "Rendições possíveis", "Exigem comparação humana; não são exclusões automáticas", "warn");
  appendMetric(metrics, payload.current.alreadyPublicUniqueSha256, "SHA já públicos", `${payload.current.alreadyPublicOccurrences} ocorrências excluídas da retriagem`, "safe");
  appendMetric(metrics, payload.nextBatch.selectedUniqueWorks, "Próximo lote", `${payload.nextBatch.selectedOccurrences} ocorrências; ${payload.nextBatch.remainingUniqueWorksAfterBatch} obras depois do lote`);

  const baseline = payload.baseline.requestedCandidates;
  const current = payload.current.candidates;
  const delta = current - baseline;
  $("recoveryNotice").textContent = delta === 0
    ? `A fotografia atual confirma os ${current} candidatos do levantamento anterior.`
    : `O levantamento citado tinha ${baseline} candidatos. A varredura atual encontrou ${current} (${delta > 0 ? "+" : ""}${delta}); o painel mostra o estado mais recente sem expor nomes ou caminhos.`;
  $("recoveryTimestamp").textContent = `Atualizado em ${new Date(payload.generatedAt).toLocaleString("pt-BR")}`;
}

function normalizeCatalog(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length || items.length > MAX_RECORDS) throw new Error("Catálogo público ausente ou fora do limite.");
  const documents = [];
  const seen = new Set();
  for (const raw of items) {
    const id = cleanText(raw?.id, 220);
    const path = cleanText(raw?.path, 1000);
    const sha256 = cleanText(raw?.sourceSha256, 64).toLocaleLowerCase("en-US");
    if (!id || seen.has(id) || !isSafeDocumentPath(path) || !/^[0-9a-f]{64}$/.test(sha256)) continue;
    seen.add(id);
    documents.push({
      id,
      path,
      sha256,
      title: cleanText(raw?.title || raw?.filename || id, 300),
      theme: cleanText(raw?.theme || "sem-tema", 100),
      format: cleanText(raw?.formatShortLabel || raw?.extension || "arquivo", 80),
      extension: cleanText(raw?.extension || "", 20),
      catalogReviewStatus: cleanText(raw?.clinicalReviewStatus || "nao-informado", 80),
    });
  }
  if (!documents.length) throw new Error("Nenhum documento público válido no catálogo.");
  return documents;
}

function normalizeRecord(raw, documentRecord = null) {
  if (!raw || typeof raw !== "object") return null;
  const documentId = cleanText(raw.documentId, 220);
  const sha256 = cleanText(raw.documentSha256, 64).toLocaleLowerCase("en-US");
  const status = STATUS_VALUES.has(raw.status) ? raw.status : "pending";
  if (!documentId || !/^[0-9a-f]{64}$/.test(sha256)) return null;
  if (documentRecord && (documentRecord.id !== documentId || documentRecord.sha256 !== sha256)) return null;
  return {
    documentId,
    documentSha256: sha256,
    status,
    responsible: cleanText(raw.responsible, 120),
    source: cleanText(raw.source, 1000),
    reviewedAt: validDate(raw.reviewedAt),
    validUntil: validDate(raw.validUntil),
    notes: cleanText(raw.notes, 2000),
    updatedAt: /^\d{4}-\d{2}-\d{2}T/.test(String(raw.updatedAt || ""))
      ? cleanText(raw.updatedAt, 40)
      : new Date().toISOString(),
  };
}

function loadQueue() {
  let parsed;
  try {
    parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch {
    setStatus("O backup local da fila estava ilegível e foi ignorado.", "error");
    return Object.create(null);
  }
  if (!parsed || parsed.schemaVersion !== STORE_SCHEMA || parsed.kind !== "clinical-review-local-queue") {
    return Object.create(null);
  }
  const entries = Array.isArray(parsed.records) ? parsed.records.slice(0, MAX_RECORDS) : [];
  const records = Object.create(null);
  for (const raw of entries) {
    const normalized = normalizeRecord(raw);
    if (normalized && !recordValidationError(normalized)) {
      records[normalized.documentId] = normalized;
    }
  }
  return records;
}

function saveQueue() {
  const payload = {
    schemaVersion: STORE_SCHEMA,
    kind: "clinical-review-local-queue",
    updatedAt: new Date().toISOString(),
    records: Object.values(state.records),
  };
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    setStatus("Não foi possível salvar localmente. Exporte a fila e libere espaço no navegador.", "error");
    return false;
  }
}

function effectiveStatus(record) {
  if (!record) return "pending";
  if (record.status === "approved" && record.validUntil && record.validUntil < todayISO()) return "expired";
  return record.status;
}

function daysUntil(dateString) {
  const target = validDate(dateString);
  if (!target) return null;
  const today = new Date(`${todayISO()}T12:00:00Z`);
  return Math.round((new Date(`${target}T12:00:00Z`) - today) / 86_400_000);
}

function queueCounts() {
  const counts = { approved: 0, expired: 0, unassigned: 0, inReview: 0 };
  for (const doc of state.documents) {
    const record = state.records[doc.id];
    const status = effectiveStatus(record);
    if (status === "approved") counts.approved += 1;
    if (status === "expired") counts.expired += 1;
    if (!record?.responsible) counts.unassigned += 1;
    if (status === "in-review" || status === "assigned") counts.inReview += 1;
  }
  return counts;
}

function renderQueueMetrics() {
  const counts = queueCounts();
  const target = $("queueMetrics");
  target.replaceChildren();
  appendMetric(target, state.documents.length, "Documentos públicos", "Base da fila editorial atual");
  appendMetric(target, counts.approved, "Aprovados válidos", "Com validade ainda vigente", "safe");
  appendMetric(target, counts.inReview, "Em andamento", "Atribuídos ou em revisão");
  appendMetric(target, counts.expired, "Validade vencida", "Revisar antes de reutilizar", counts.expired ? "warn" : "safe");
  appendMetric(target, counts.unassigned, "Sem responsável", "Próximos para distribuição", "warn");
}

function matchesValidity(record, filter) {
  if (filter === "all") return true;
  const remaining = daysUntil(record?.validUntil);
  if (filter === "without") return remaining === null;
  if (filter === "expired") return remaining !== null && remaining < 0;
  if (filter === "due30") return remaining !== null && remaining >= 0 && remaining <= 30;
  return true;
}

function filteredDocuments() {
  const query = normalizeSearch($("queueSearch").value);
  const statusFilter = $("queueStatus").value;
  const validityFilter = $("queueValidity").value;
  const priority = { expired: 0, quarantine: 1, "in-review": 2, assigned: 3, pending: 4, approved: 5 };
  return state.documents
    .filter((doc) => {
      const record = state.records[doc.id];
      const status = effectiveStatus(record);
      const blob = normalizeSearch(`${doc.title} ${doc.theme} ${doc.format} ${record?.responsible || ""} ${record?.source || ""}`);
      return (!query || blob.includes(query))
        && (statusFilter === "all" || status === statusFilter)
        && matchesValidity(record, validityFilter);
    })
    .sort((a, b) => {
      const statusDifference = priority[effectiveStatus(state.records[a.id])] - priority[effectiveStatus(state.records[b.id])];
      return statusDifference || a.title.localeCompare(b.title, "pt-BR");
    });
}

function queueCard(doc) {
  const record = state.records[doc.id];
  const status = effectiveStatus(record);
  const card = element("article", "queue-card");

  const identity = element("div");
  identity.append(element("h3", "", doc.title));
  identity.append(element("p", "", `${doc.format} · ${doc.theme} · catálogo: ${doc.catalogReviewStatus}`));

  const stateBlock = element("div");
  stateBlock.append(element("span", `status-pill ${status}`, STATUS_LABELS[status]));
  if (record?.validUntil) {
    const remaining = daysUntil(record.validUntil);
    const label = remaining < 0 ? `Venceu há ${Math.abs(remaining)} dia(s)` : `Validade: ${record.validUntil}`;
    stateBlock.append(element("p", "", label));
  }

  const meta = element("div", "queue-meta");
  meta.append(element("span", "", `Responsável: ${record?.responsible || "não atribuído"}`));
  meta.append(element("span", "", `Revisão: ${record?.reviewedAt || "não informada"}`));
  meta.append(element("span", "", `Fonte: ${record?.source ? "registrada" : "não informada"}`));

  const actions = element("div", "queue-actions");
  const original = element("a", "button ghost", "Abrir original");
  original.href = doc.path;
  original.target = "_blank";
  original.rel = "noopener noreferrer";
  const edit = element("button", "button", "Editar revisão");
  edit.type = "button";
  edit.addEventListener("click", () => openReview(doc.id));
  actions.append(original, edit);

  card.append(identity, stateBlock, meta, actions);
  return card;
}

function renderQueue() {
  renderQueueMetrics();
  const list = filteredDocuments();
  const target = $("queueList");
  target.setAttribute("aria-busy", "false");
  target.replaceChildren();
  $("queueResultCount").textContent = `${list.length} de ${state.documents.length} documento(s) exibido(s).`;
  if (!list.length) {
    target.append(element("p", "empty-state", "Nenhum documento corresponde aos filtros. Limpe os filtros para ver toda a fila."));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const doc of list) fragment.append(queueCard(doc));
  target.append(fragment);
}

function openReview(documentId) {
  const doc = state.byId.get(documentId);
  if (!doc) return;
  const record = state.records[documentId];
  $("reviewDocumentId").value = doc.id;
  $("reviewDocumentTitle").textContent = doc.title;
  $("reviewStatus").value = effectiveStatus(record);
  $("reviewResponsible").value = record?.responsible || "";
  $("reviewDate").value = record?.reviewedAt || "";
  $("reviewValidUntil").value = record?.validUntil || "";
  $("reviewSource").value = record?.source || "";
  $("reviewNotes").value = record?.notes || "";
  $("deleteReview").hidden = !record;
  const dialog = $("reviewDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  $("reviewStatus").focus();
}

function closeReview() {
  const dialog = $("reviewDialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function requireApprovedFields(record) {
  if (record.status !== "approved") return "";
  if (!record.responsible) return "Informe o responsável antes de aprovar.";
  if (!record.source) return "Informe a fonte clínica antes de aprovar.";
  if (!record.reviewedAt) return "Informe a data da revisão antes de aprovar.";
  if (!record.validUntil) return "Informe a validade antes de aprovar.";
  return "";
}

function recordValidationError(record) {
  if (!record) return "Registro inválido; nada foi salvo.";
  const missing = requireApprovedFields(record);
  if (missing) return missing;
  if (record.reviewedAt && record.validUntil && record.validUntil < record.reviewedAt) {
    return "A validade não pode ser anterior à data de revisão.";
  }
  return "";
}

function saveReview(event) {
  event.preventDefault();
  const doc = state.byId.get($("reviewDocumentId").value);
  if (!doc) return;
  const record = normalizeRecord({
    documentId: doc.id,
    documentSha256: doc.sha256,
    status: $("reviewStatus").value,
    responsible: $("reviewResponsible").value,
    source: $("reviewSource").value,
    reviewedAt: $("reviewDate").value,
    validUntil: $("reviewValidUntil").value,
    notes: $("reviewNotes").value,
    updatedAt: new Date().toISOString(),
  }, doc);
  const validationError = recordValidationError(record);
  if (validationError) {
    setStatus(validationError, "error");
    if (validationError.startsWith("A validade")) $("reviewValidUntil").focus();
    return;
  }
  state.records[doc.id] = record;
  if (!saveQueue()) return;
  closeReview();
  renderQueue();
  setStatus(`Revisão local de “${doc.title}” salva.`, "success");
}

function deleteReview() {
  const id = $("reviewDocumentId").value;
  const doc = state.byId.get(id);
  if (!doc || !state.records[id]) return closeReview();
  if (!window.confirm(`Remover somente o registro local de revisão de “${doc.title}”?`)) return;
  delete state.records[id];
  if (!saveQueue()) return;
  closeReview();
  renderQueue();
  setStatus("Registro local removido; o documento original não foi alterado.", "success");
}

function exportQueue() {
  const payload = {
    schemaVersion: STORE_SCHEMA,
    kind: "clinical-review-local-queue",
    exportedAt: new Date().toISOString(),
    notice: "Backup local. Não contém os arquivos originais; não inserir dados identificáveis de pacientes.",
    records: Object.values(state.records).map((record) => ({
      ...record,
      documentTitle: state.byId.get(record.documentId)?.title || record.documentId,
    })),
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `fila-revisao-clinica-${todayISO()}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  setStatus(`${payload.records.length} registro(s) exportado(s).`, "success");
}

async function importQueueFile(file) {
  if (!file) return;
  if (file.size > MAX_JSON_BYTES) {
    setStatus("Backup recusado: o arquivo excede 5 MB.", "error");
    return;
  }
  try {
    const payload = JSON.parse(await file.text());
    if (payload?.schemaVersion !== STORE_SCHEMA || payload?.kind !== "clinical-review-local-queue" || !Array.isArray(payload.records)) {
      throw new Error("schema incompatível");
    }
    if (payload.records.length > MAX_RECORDS) throw new Error("registros demais");
    const imported = Object.create(null);
    let skipped = 0;
    for (const raw of payload.records) {
      const doc = state.byId.get(cleanText(raw?.documentId, 220));
      const normalized = doc ? normalizeRecord(raw, doc) : null;
      if (normalized && !recordValidationError(normalized)) {
        imported[normalized.documentId] = normalized;
      }
      else skipped += 1;
    }
    if (!Object.keys(imported).length && payload.records.length) throw new Error("nenhum registro corresponde ao catálogo e SHA atuais");
    if (Object.keys(state.records).length && !window.confirm("Mesclar este backup com a fila local atual? Registros do arquivo com o mesmo documento substituirão os locais.")) return;
    state.records = Object.assign(Object.create(null), state.records, imported);
    if (!saveQueue()) return;
    renderQueue();
    setStatus(`${Object.keys(imported).length} registro(s) importado(s); ${skipped} ignorado(s) por ID/SHA incompatível.`, "success");
  } catch (error) {
    setStatus(`Backup recusado com segurança: ${error.message}.`, "error");
  } finally {
    $("importQueueFile").value = "";
  }
}

function wireEvents() {
  $("queueSearch").addEventListener("input", renderQueue);
  $("queueStatus").addEventListener("change", renderQueue);
  $("queueValidity").addEventListener("change", renderQueue);
  $("clearFilters").addEventListener("click", () => {
    $("queueSearch").value = "";
    $("queueStatus").value = "all";
    $("queueValidity").value = "all";
    renderQueue();
    $("queueSearch").focus();
  });
  $("exportQueue").addEventListener("click", exportQueue);
  $("importQueue").addEventListener("click", () => $("importQueueFile").click());
  $("importQueueFile").addEventListener("change", (event) => importQueueFile(event.target.files?.[0]));
  $("reviewForm").addEventListener("submit", saveReview);
  $("closeDialog").addEventListener("click", closeReview);
  $("cancelReview").addEventListener("click", closeReview);
  $("deleteReview").addEventListener("click", deleteReview);
}

async function start() {
  wireEvents();
  state.records = loadQueue();
  try {
    const [recovery, catalog] = await Promise.all([
      fetchJsonLimited(RECOVERY_URL),
      fetchJsonLimited(CATALOG_URL),
    ]);
    renderRecovery(recovery);
    state.documents = normalizeCatalog(catalog);
    state.byId = new Map(state.documents.map((doc) => [doc.id, doc]));

    const current = Object.create(null);
    let stale = 0;
    for (const [id, record] of Object.entries(state.records)) {
      const doc = state.byId.get(id);
      const normalized = doc ? normalizeRecord(record, doc) : null;
      if (normalized && !recordValidationError(normalized)) current[id] = normalized;
      else stale += 1;
    }
    state.records = current;
    if (stale) saveQueue();
    renderQueue();
    setStatus(`Painel pronto: ${state.documents.length} documentos públicos; ${stale} registro(s) local(is) obsoleto(s) removido(s).`, "success");
  } catch (error) {
    $("queueList").setAttribute("aria-busy", "false");
    $("queueList").replaceChildren(element("p", "empty-state", "O painel não pôde carregar os dados. A Biblioteca e os arquivos originais não foram alterados."));
    setStatus(`Falha segura ao carregar o painel: ${error.message}`, "error");
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Object.freeze({ validDate, normalizeRecord, recordValidationError });
} else {
  start();
}
