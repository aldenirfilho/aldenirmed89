(function registerSepsisAcraRuntime(root) {
  "use strict";

  if (root.SepsisAcraRuntime) return;

  const ARTIFACT_VERSION = "1.0";
  const BUNDLE_VERSION = "antigravity-sepsis-acra-bundle-v1";
  const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,63}$/;
  const SHA256_PATTERN = /^[a-f0-9]{64}$/;
  const SOURCE_PATTERN = /^acra\/acra-sepse-(?:0[1-9]|10)-[a-z0-9-]+\.json$/;
  const MODES = Object.freeze([
    "plain",
    "hybrid",
    "artifact",
    "tutorial",
    "comparison",
    "algorithm",
    "quiz",
    "review",
    "calculator"
  ]);
  const COMPONENT_TYPES = Object.freeze([
    "callout",
    "tabs",
    "accordion",
    "cards",
    "numberedSteps",
    "comparisonTable",
    "thresholdTable",
    "checklist",
    "quiz",
    "keyValueGrid",
    "sources",
    "progress",
    "followupActions"
  ]);
  const TONES = Object.freeze(["neutral", "info", "success", "warning", "danger"]);
  const SEVERITIES = Object.freeze(["info", "warning", "danger"]);
  const ACTION_KINDS = Object.freeze([
    "continueResearch",
    "deepen",
    "compare",
    "verify",
    "quiz",
    "review"
  ]);
  const CONTENT_TYPES = Object.freeze(["paragraph", "bulletList", "keyValueList"]);
  const ROOT_KEYS = Object.freeze([
    "version",
    "id",
    "title",
    "subtitle",
    "mode",
    "summary",
    "critical",
    "components",
    "actions",
    "sources"
  ]);
  const ERROR_MESSAGES = Object.freeze({
    ACRA_BUNDLE_INVALID: "O bundle ACRA local é inválido.",
    ACRA_SCHEMA_INVALID: "O artefato não corresponde ao schema ACRA v1.0.",
    ACRA_PROPERTY_INVALID: "Uma propriedade não permitida foi encontrada.",
    ACRA_VALUE_INVALID: "Um valor ACRA é inválido.",
    ACRA_ID_INVALID: "Um identificador ACRA é inválido ou duplicado.",
    ACRA_REFERENCE_INVALID: "Uma referência ACRA não pôde ser resolvida.",
    ACRA_URL_INVALID: "Uma fonte ACRA não usa URL HTTPS segura.",
    ACRA_TARGET_INVALID: "O ponto de montagem ACRA é inválido.",
    ACRA_RENDER_FAILED: "A montagem ACRA falhou de forma segura."
  });

  let mountSequence = 0;

  class ValidationFailure extends Error {
    constructor(code, path) {
      super(ERROR_MESSAGES[code] || ERROR_MESSAGES.ACRA_VALUE_INVALID);
      this.name = "ValidationFailure";
      this.code = code;
      this.path = path;
    }
  }

  function failure(error) {
    const code = error instanceof ValidationFailure ? error.code : "ACRA_SCHEMA_INVALID";
    const path = error instanceof ValidationFailure ? error.path : "/";
    return Object.freeze({
      ok: false,
      error: Object.freeze({
        code,
        message: ERROR_MESSAGES[code] || ERROR_MESSAGES.ACRA_SCHEMA_INVALID,
        path
      })
    });
  }

  function reject(code, path) {
    throw new ValidationFailure(code, path);
  }

  function hasOnlyDataProperties(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      reject("ACRA_SCHEMA_INVALID", path);
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      reject("ACRA_SCHEMA_INVALID", path);
    }
    Reflect.ownKeys(value).forEach((key) => {
      if (typeof key !== "string" || ["__proto__", "prototype", "constructor"].includes(key)) {
        reject("ACRA_PROPERTY_INVALID", path);
      }
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor)) reject("ACRA_PROPERTY_INVALID", path);
    });
    return value;
  }

  function validateKeys(value, path, allowed, required) {
    const record = hasOnlyDataProperties(value, path);
    const allowedSet = new Set(allowed);
    const keys = Object.keys(record);
    keys.forEach((key) => {
      if (!allowedSet.has(key)) reject("ACRA_PROPERTY_INVALID", `${path}/${key}`);
    });
    (required || allowed).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(record, key)) {
        reject("ACRA_SCHEMA_INVALID", `${path}/${key}`);
      }
    });
    return record;
  }

  function validateString(value, path, minimum, maximum) {
    if (
      typeof value !== "string" ||
      value.length < minimum ||
      value.length > maximum ||
      (minimum > 0 && !value.trim())
    ) {
      reject("ACRA_VALUE_INVALID", path);
    }
    return value;
  }

  function validateBoolean(value, path) {
    if (typeof value !== "boolean") reject("ACRA_VALUE_INVALID", path);
    return value;
  }

  function validateInteger(value, path, minimum, maximum) {
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
      reject("ACRA_VALUE_INVALID", path);
    }
    return value;
  }

  function validateEnum(value, path, values) {
    if (!values.includes(value)) reject("ACRA_VALUE_INVALID", path);
    return value;
  }

  function validateArray(value, path, minimum, maximum, validator) {
    if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
      reject("ACRA_VALUE_INVALID", path);
    }
    value.forEach((item, index) => validator(item, `${path}/${index}`, index));
    return value;
  }

  function registerId(context, value, path, kind) {
    validateString(value, path, 3, 64);
    if (!ID_PATTERN.test(value) || context.ids.has(value)) reject("ACRA_ID_INVALID", path);
    context.ids.set(value, Object.freeze({ kind, path }));
    return value;
  }

  function validateTextItem(value, path, kind) {
    const item = validateKeys(value, path, ["id", "title", "text"], ["id", "title", "text"]);
    registerId(kind.context, item.id, `${path}/id`, kind.name);
    validateString(item.title, `${path}/title`, 1, 320);
    validateString(item.text, `${path}/text`, 1, 6000);
  }

  function validateContentBlock(value, path) {
    const base = hasOnlyDataProperties(value, path);
    validateEnum(base.type, `${path}/type`, CONTENT_TYPES);
    if (base.type === "paragraph") {
      validateKeys(base, path, ["type", "text"], ["type", "text"]);
      validateString(base.text, `${path}/text`, 1, 6000);
      return;
    }
    if (base.type === "bulletList") {
      validateKeys(base, path, ["type", "items"], ["type", "items"]);
      validateArray(base.items, `${path}/items`, 1, 64, (item, itemPath) => {
        validateString(item, itemPath, 1, 2000);
      });
      return;
    }
    validateKeys(base, path, ["type", "items"], ["type", "items"]);
    validateArray(base.items, `${path}/items`, 1, 64, (item, itemPath) => {
      const pair = validateKeys(item, itemPath, ["label", "value"], ["label", "value"]);
      validateString(pair.label, `${itemPath}/label`, 1, 320);
      validateString(pair.value, `${itemPath}/value`, 1, 2000);
    });
  }

  function validateComponent(context, value, path) {
    const component = hasOnlyDataProperties(value, path);
    validateEnum(component.type, `${path}/type`, COMPONENT_TYPES);
    registerId(context, component.id, `${path}/id`, "component");
    context.componentIds.add(component.id);
    validateString(component.title, `${path}/title`, 1, 320);

    switch (component.type) {
      case "callout":
        validateKeys(component, path, ["id", "type", "title", "tone", "text"]);
        validateEnum(component.tone, `${path}/tone`, TONES);
        validateString(component.text, `${path}/text`, 1, 6000);
        return;
      case "tabs":
      case "accordion": {
        validateKeys(component, path, ["id", "type", "title", "items"]);
        validateArray(component.items, `${path}/items`, 1, 24, (item, itemPath) => {
          const allowed = component.type === "accordion"
            ? ["id", "label", "content", "initiallyOpen"]
            : ["id", "label", "content"];
          const row = validateKeys(item, itemPath, allowed, ["id", "label", "content"]);
          registerId(context, row.id, `${itemPath}/id`, `${component.type}Item`);
          validateString(row.label, `${itemPath}/label`, 1, 320);
          if (Object.prototype.hasOwnProperty.call(row, "initiallyOpen")) {
            validateBoolean(row.initiallyOpen, `${itemPath}/initiallyOpen`);
          }
          validateArray(row.content, `${itemPath}/content`, 1, 32, validateContentBlock);
        });
        return;
      }
      case "cards":
        validateKeys(component, path, ["id", "type", "title", "items"]);
        validateArray(component.items, `${path}/items`, 1, 48, (item, itemPath) => {
          const card = validateKeys(
            item,
            itemPath,
            ["id", "title", "text", "tone"],
            ["id", "title", "text"]
          );
          registerId(context, card.id, `${itemPath}/id`, "card");
          validateString(card.title, `${itemPath}/title`, 1, 320);
          validateString(card.text, `${itemPath}/text`, 1, 4000);
          if (Object.prototype.hasOwnProperty.call(card, "tone")) {
            validateEnum(card.tone, `${itemPath}/tone`, TONES);
          }
        });
        return;
      case "numberedSteps":
        validateKeys(component, path, ["id", "type", "title", "items"]);
        validateArray(component.items, `${path}/items`, 1, 48, (item, itemPath) => {
          validateTextItem(item, itemPath, { context, name: "step" });
        });
        return;
      case "comparisonTable": {
        validateKeys(component, path, ["id", "type", "title", "columns", "rows"]);
        validateArray(component.columns, `${path}/columns`, 1, 12, (item, itemPath) => {
          const column = validateKeys(item, itemPath, ["id", "label"]);
          registerId(context, column.id, `${itemPath}/id`, "column");
          validateString(column.label, `${itemPath}/label`, 1, 320);
        });
        validateArray(component.rows, `${path}/rows`, 1, 48, (item, itemPath) => {
          const row = validateKeys(item, itemPath, ["id", "label", "cells"]);
          registerId(context, row.id, `${itemPath}/id`, "row");
          validateString(row.label, `${itemPath}/label`, 1, 320);
          validateArray(
            row.cells,
            `${itemPath}/cells`,
            component.columns.length,
            component.columns.length,
            (cell, cellPath) => validateString(cell, cellPath, 1, 4000)
          );
        });
        return;
      }
      case "thresholdTable":
        validateKeys(component, path, ["id", "type", "title", "rows"]);
        validateArray(component.rows, `${path}/rows`, 1, 48, (item, itemPath) => {
          const row = validateKeys(
            item,
            itemPath,
            ["id", "metric", "operator", "value", "unit", "meaning"],
            ["id", "metric", "operator", "value", "meaning"]
          );
          registerId(context, row.id, `${itemPath}/id`, "thresholdRow");
          ["metric", "operator", "value", "meaning"].forEach((key) => {
            validateString(row[key], `${itemPath}/${key}`, 1, key === "meaning" ? 4000 : 320);
          });
          if (Object.prototype.hasOwnProperty.call(row, "unit")) {
            validateString(row.unit, `${itemPath}/unit`, 0, 80);
          }
        });
        return;
      case "checklist":
        validateKeys(component, path, ["id", "type", "title", "items"]);
        validateArray(component.items, `${path}/items`, 1, 64, (item, itemPath) => {
          const check = validateKeys(
            item,
            itemPath,
            ["id", "label", "details", "initiallyChecked"],
            ["id", "label"]
          );
          registerId(context, check.id, `${itemPath}/id`, "checklistItem");
          validateString(check.label, `${itemPath}/label`, 1, 1000);
          if (Object.prototype.hasOwnProperty.call(check, "details")) {
            validateString(check.details, `${itemPath}/details`, 1, 4000);
          }
          if (Object.prototype.hasOwnProperty.call(check, "initiallyChecked")) {
            validateBoolean(check.initiallyChecked, `${itemPath}/initiallyChecked`);
          }
        });
        return;
      case "quiz":
        validateKeys(component, path, ["id", "type", "title", "questions"]);
        validateArray(component.questions, `${path}/questions`, 1, 24, (item, itemPath) => {
          const question = validateKeys(
            item,
            itemPath,
            ["id", "prompt", "options", "correctOptionId", "feedback"]
          );
          registerId(context, question.id, `${itemPath}/id`, "question");
          validateString(question.prompt, `${itemPath}/prompt`, 1, 4000);
          validateString(question.feedback, `${itemPath}/feedback`, 1, 4000);
          const optionIds = new Set();
          validateArray(question.options, `${itemPath}/options`, 2, 10, (option, optionPath) => {
            const choice = validateKeys(option, optionPath, ["id", "label"]);
            registerId(context, choice.id, `${optionPath}/id`, "quizOption");
            optionIds.add(choice.id);
            validateString(choice.label, `${optionPath}/label`, 1, 2000);
          });
          if (!optionIds.has(question.correctOptionId)) {
            reject("ACRA_REFERENCE_INVALID", `${itemPath}/correctOptionId`);
          }
        });
        return;
      case "keyValueGrid":
        validateKeys(component, path, ["id", "type", "title", "items"]);
        validateArray(component.items, `${path}/items`, 1, 64, (item, itemPath) => {
          const pair = validateKeys(item, itemPath, ["id", "label", "value"]);
          registerId(context, pair.id, `${itemPath}/id`, "keyValueItem");
          validateString(pair.label, `${itemPath}/label`, 1, 320);
          validateString(pair.value, `${itemPath}/value`, 1, 4000);
        });
        return;
      case "sources":
        validateKeys(component, path, ["id", "type", "title", "sourceIds"]);
        validateArray(component.sourceIds, `${path}/sourceIds`, 1, 64, (id, idPath) => {
          validateString(id, idPath, 3, 64);
          context.references.push({ id, path: idPath, kind: "source" });
        });
        return;
      case "progress":
        validateKeys(component, path, ["id", "type", "title", "label", "current", "total"]);
        validateString(component.label, `${path}/label`, 1, 320);
        validateInteger(component.total, `${path}/total`, 1, 128);
        validateInteger(component.current, `${path}/current`, 0, component.total);
        return;
      case "followupActions":
        validateKeys(component, path, ["id", "type", "title", "actionIds"]);
        validateArray(component.actionIds, `${path}/actionIds`, 1, 64, (id, idPath) => {
          validateString(id, idPath, 3, 64);
          context.references.push({ id, path: idPath, kind: "action" });
        });
        return;
      default:
        reject("ACRA_SCHEMA_INVALID", `${path}/type`);
    }
  }

  function validateHttpsUrl(value, path) {
    validateString(value, path, 9, 2048);
    let parsed;
    try {
      parsed = new URL(value);
    } catch (_error) {
      reject("ACRA_URL_INVALID", path);
    }
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) {
      reject("ACRA_URL_INVALID", path);
    }
    return parsed.href;
  }

  function validateArtifactInternal(value, path) {
    const artifact = validateKeys(value, path, ROOT_KEYS);
    const context = {
      componentIds: new Set(),
      ids: new Map(),
      references: []
    };
    if (artifact.version !== ARTIFACT_VERSION) reject("ACRA_SCHEMA_INVALID", `${path}/version`);
    registerId(context, artifact.id, `${path}/id`, "artifact");
    validateString(artifact.title, `${path}/title`, 1, 320);
    validateString(artifact.subtitle, `${path}/subtitle`, 1, 1000);
    validateEnum(artifact.mode, `${path}/mode`, MODES);
    validateString(artifact.summary, `${path}/summary`, 1, 8000);

    validateArray(artifact.critical, `${path}/critical`, 1, 16, (item, itemPath) => {
      const alert = validateKeys(item, itemPath, ["id", "severity", "title", "text"]);
      registerId(context, alert.id, `${itemPath}/id`, "critical");
      validateEnum(alert.severity, `${itemPath}/severity`, SEVERITIES);
      validateString(alert.title, `${itemPath}/title`, 1, 320);
      validateString(alert.text, `${itemPath}/text`, 1, 6000);
    });

    validateArray(artifact.components, `${path}/components`, 1, 24, (component, componentPath) => {
      validateComponent(context, component, componentPath);
    });

    validateArray(artifact.actions, `${path}/actions`, 1, 32, (item, itemPath) => {
      const action = validateKeys(
        item,
        itemPath,
        ["id", "kind", "label", "prompt", "contextComponentIds", "requiresPreview"]
      );
      registerId(context, action.id, `${itemPath}/id`, "action");
      validateEnum(action.kind, `${itemPath}/kind`, ACTION_KINDS);
      validateString(action.label, `${itemPath}/label`, 1, 320);
      validateString(action.prompt, `${itemPath}/prompt`, 1, 6000);
      if (action.requiresPreview !== true) reject("ACRA_VALUE_INVALID", `${itemPath}/requiresPreview`);
      validateArray(
        action.contextComponentIds,
        `${itemPath}/contextComponentIds`,
        0,
        24,
        (id, idPath) => {
          validateString(id, idPath, 3, 64);
          context.references.push({ id, path: idPath, kind: "component" });
        }
      );
    });

    validateArray(artifact.sources, `${path}/sources`, 1, 64, (item, itemPath) => {
      const source = validateKeys(
        item,
        itemPath,
        ["id", "title", "url", "publisher", "publishedAt"],
        ["id", "title", "url"]
      );
      registerId(context, source.id, `${itemPath}/id`, "source");
      validateString(source.title, `${itemPath}/title`, 1, 1000);
      validateHttpsUrl(source.url, `${itemPath}/url`);
      if (Object.prototype.hasOwnProperty.call(source, "publisher")) {
        validateString(source.publisher, `${itemPath}/publisher`, 1, 320);
      }
      if (Object.prototype.hasOwnProperty.call(source, "publishedAt")) {
        validateString(source.publishedAt, `${itemPath}/publishedAt`, 4, 40);
      }
    });

    context.references.forEach((reference) => {
      const target = context.ids.get(reference.id);
      if (!target || target.kind !== reference.kind) {
        reject("ACRA_REFERENCE_INVALID", reference.path);
      }
    });
    return artifact;
  }

  function validateArtifact(value) {
    try {
      return Object.freeze({ ok: true, value: validateArtifactInternal(value, "/artifact") });
    } catch (error) {
      return failure(error);
    }
  }

  function validateBundle(value) {
    try {
      const bundle = validateKeys(
        value,
        "/bundle",
        ["schemaVersion", "artifactSchemaVersion", "artifactCount", "contentSha256", "entries"]
      );
      if (bundle.schemaVersion !== BUNDLE_VERSION) reject("ACRA_BUNDLE_INVALID", "/bundle/schemaVersion");
      if (bundle.artifactSchemaVersion !== ARTIFACT_VERSION) {
        reject("ACRA_BUNDLE_INVALID", "/bundle/artifactSchemaVersion");
      }
      validateInteger(bundle.artifactCount, "/bundle/artifactCount", 10, 10);
      validateString(bundle.contentSha256, "/bundle/contentSha256", 64, 64);
      if (!SHA256_PATTERN.test(bundle.contentSha256)) {
        reject("ACRA_BUNDLE_INVALID", "/bundle/contentSha256");
      }

      const sources = new Set();
      const artifactIds = new Set();
      const artifacts = [];
      validateArray(bundle.entries, "/bundle/entries", 10, 10, (entryValue, entryPath) => {
        const entry = validateKeys(entryValue, entryPath, ["source", "sha256", "artifact"]);
        validateString(entry.source, `${entryPath}/source`, 16, 180);
        if (!SOURCE_PATTERN.test(entry.source) || sources.has(entry.source)) {
          reject("ACRA_BUNDLE_INVALID", `${entryPath}/source`);
        }
        sources.add(entry.source);
        validateString(entry.sha256, `${entryPath}/sha256`, 64, 64);
        if (!SHA256_PATTERN.test(entry.sha256)) reject("ACRA_BUNDLE_INVALID", `${entryPath}/sha256`);
        const artifact = validateArtifactInternal(entry.artifact, `${entryPath}/artifact`);
        if (artifactIds.has(artifact.id)) reject("ACRA_ID_INVALID", `${entryPath}/artifact/id`);
        artifactIds.add(artifact.id);
        artifacts.push(artifact);
      });
      if (bundle.artifactCount !== artifacts.length) reject("ACRA_BUNDLE_INVALID", "/bundle/artifactCount");
      return Object.freeze({ ok: true, value: bundle, artifacts: Object.freeze(artifacts) });
    } catch (error) {
      return failure(error);
    }
  }

  function safeHttpsUrl(value) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) return "";
      return parsed.href;
    } catch (_error) {
      return "";
    }
  }

  function createElement(documentNode, tagName, className, text) {
    const node = documentNode.createElement(tagName);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function addListener(context, node, type, listener) {
    node.addEventListener(type, listener);
    context.cleanup.push(() => node.removeEventListener(type, listener));
  }

  function progressFrom(value) {
    const source = value && typeof value === "object" ? value : {};
    const toSafeSet = (items) => new Set(
      Array.isArray(items) ? items.filter((item) => typeof item === "string" && ID_PATTERN.test(item)) : []
    );
    return {
      answeredIds: toSafeSet(source.answeredIds),
      checkedIds: toSafeSet(source.checkedIds),
      visitedIds: toSafeSet(source.visitedIds)
    };
  }

  function snapshotProgress(context) {
    return Object.freeze({
      answeredIds: Object.freeze(Array.from(context.progress.answeredIds).sort()),
      checkedIds: Object.freeze(Array.from(context.progress.checkedIds).sort()),
      visitedIds: Object.freeze(Array.from(context.progress.visitedIds).sort())
    });
  }

  function notifyProgress(context) {
    updateProgressViews(context);
    if (typeof context.onProgress === "function") context.onProgress(snapshotProgress(context));
  }

  function markVisited(context, id) {
    if (!context.progress.visitedIds.has(id)) {
      context.progress.visitedIds.add(id);
      notifyProgress(context);
    }
  }

  function componentShell(context, component, part) {
    const section = createElement(context.document, "section", "acra-runtime__component");
    section.dataset.acraPart = part;
    section.dataset.acraComponentId = component.id;
    context.componentNodes.set(component.id, section);
    if (component.title) section.append(createElement(context.document, "h4", "acra-runtime__title", component.title));
    return section;
  }

  function renderContentBlocks(context, parent, blocks) {
    blocks.forEach((block) => {
      if (block.type === "paragraph") {
        parent.append(createElement(context.document, "p", "acra-runtime__copy", block.text));
      } else if (block.type === "bulletList") {
        const list = createElement(context.document, "ul", "acra-runtime__list");
        block.items.forEach((item) => list.append(createElement(context.document, "li", "", item)));
        parent.append(list);
      } else if (block.type === "keyValueList") {
        const list = createElement(context.document, "dl", "acra-runtime__key-values");
        block.items.forEach((item) => {
          const pair = createElement(context.document, "div", "acra-runtime__key-value");
          pair.append(
            createElement(context.document, "dt", "", item.label),
            createElement(context.document, "dd", "", item.value)
          );
          list.append(pair);
        });
        parent.append(list);
      }
    });
  }

  function renderCallout(context, component) {
    const section = componentShell(context, component, "callout");
    section.dataset.tone = component.tone;
    section.append(createElement(context.document, "p", "acra-runtime__copy", component.text));
    return section;
  }

  function renderCards(context, component) {
    const section = componentShell(context, component, "cards");
    const list = createElement(context.document, "div", "acra-runtime__cards");
    component.items.forEach((item) => {
      const card = createElement(context.document, "article", "acra-runtime__card");
      card.dataset.tone = item.tone || "neutral";
      card.append(
        createElement(context.document, "h5", "acra-runtime__item-title", item.title),
        createElement(context.document, "p", "acra-runtime__copy", item.text)
      );
      list.append(card);
    });
    section.append(list);
    return section;
  }

  function renderNumberedSteps(context, component) {
    const section = componentShell(context, component, "numbered-steps");
    const list = createElement(context.document, "ol", "acra-runtime__steps");
    component.items.forEach((item) => {
      const row = createElement(context.document, "li", "acra-runtime__step");
      row.append(
        createElement(context.document, "strong", "", item.title),
        createElement(context.document, "p", "acra-runtime__copy", item.text)
      );
      list.append(row);
    });
    section.append(list);
    return section;
  }

  function renderTabs(context, component) {
    const section = componentShell(context, component, "tabs");
    const tabList = createElement(context.document, "div", "acra-runtime__tabs");
    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-label", component.title);
    const pairs = [];

    function activate(index, focus) {
      pairs.forEach((pair, pairIndex) => {
        const active = pairIndex === index;
        pair.button.setAttribute("aria-selected", String(active));
        pair.button.tabIndex = active ? 0 : -1;
        pair.panel.hidden = !active;
      });
      if (focus) pairs[index].button.focus();
      markVisited(context, component.id);
    }

    component.items.forEach((item, index) => {
      const button = createElement(context.document, "button", "acra-runtime__tab", item.label);
      const panel = createElement(context.document, "div", "acra-runtime__panel");
      const tabId = `${context.domPrefix}-${item.id}-tab`;
      const panelId = `${context.domPrefix}-${item.id}-panel`;
      button.type = "button";
      button.id = tabId;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-selected", String(index === 0));
      button.tabIndex = index === 0 ? 0 : -1;
      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.hidden = index !== 0;
      renderContentBlocks(context, panel, item.content);
      pairs.push({ button, panel });
      tabList.append(button);
      section.append(panel);
      addListener(context, button, "click", () => activate(index, false));
      addListener(context, button, "keydown", (event) => {
        const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % pairs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + pairs.length) % pairs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = pairs.length - 1;
        activate(next, true);
      });
    });
    section.insertBefore(tabList, section.children[1] || null);
    return section;
  }

  function renderAccordion(context, component) {
    const section = componentShell(context, component, "accordion");
    const list = createElement(context.document, "div", "acra-runtime__accordion");
    const pairs = [];
    component.items.forEach((item) => {
      const wrapper = createElement(context.document, "section", "acra-runtime__accordion-item");
      const button = createElement(context.document, "button", "acra-runtime__accordion-trigger", item.label);
      const panel = createElement(context.document, "div", "acra-runtime__panel");
      const panelId = `${context.domPrefix}-${item.id}-content`;
      button.type = "button";
      button.setAttribute("aria-expanded", String(Boolean(item.initiallyOpen)));
      button.setAttribute("aria-controls", panelId);
      panel.id = panelId;
      panel.hidden = !item.initiallyOpen;
      renderContentBlocks(context, panel, item.content);
      pairs.push({ button, panel });
      addListener(context, button, "click", () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        pairs.forEach((pair) => {
          pair.button.setAttribute("aria-expanded", "false");
          pair.panel.hidden = true;
        });
        button.setAttribute("aria-expanded", String(open));
        panel.hidden = !open;
        if (open) markVisited(context, component.id);
      });
      wrapper.append(button, panel);
      list.append(wrapper);
    });
    section.append(list);
    return section;
  }

  function renderComparisonTable(context, component) {
    const section = componentShell(context, component, "comparison-table");
    const scroll = createElement(context.document, "div", "acra-runtime__table-scroll");
    const table = createElement(context.document, "table", "acra-runtime__table");
    const head = createElement(context.document, "thead");
    const headerRow = createElement(context.document, "tr");
    const first = createElement(context.document, "th", "", "Sinal");
    first.scope = "col";
    headerRow.append(first);
    component.columns.forEach((column) => {
      const cell = createElement(context.document, "th", "", column.label);
      cell.scope = "col";
      headerRow.append(cell);
    });
    head.append(headerRow);
    const body = createElement(context.document, "tbody");
    component.rows.forEach((row) => {
      const tr = createElement(context.document, "tr");
      const label = createElement(context.document, "th", "", row.label);
      label.scope = "row";
      tr.append(label);
      row.cells.forEach((cell) => tr.append(createElement(context.document, "td", "", cell)));
      body.append(tr);
    });
    table.append(head, body);
    scroll.append(table);
    section.append(scroll);
    return section;
  }

  function renderThresholdTable(context, component) {
    const section = componentShell(context, component, "threshold-table");
    const scroll = createElement(context.document, "div", "acra-runtime__table-scroll");
    const table = createElement(context.document, "table", "acra-runtime__table");
    const head = createElement(context.document, "thead");
    const headerRow = createElement(context.document, "tr");
    ["Métrica", "Pista", "Interpretação segura"].forEach((title) => {
      const cell = createElement(context.document, "th", "", title);
      cell.scope = "col";
      headerRow.append(cell);
    });
    head.append(headerRow);
    const body = createElement(context.document, "tbody");
    component.rows.forEach((row) => {
      const tr = createElement(context.document, "tr");
      const metric = createElement(context.document, "th", "", row.metric);
      metric.scope = "row";
      tr.append(
        metric,
        createElement(
          context.document,
          "td",
          "",
          `${row.operator} ${row.value}${row.unit ? ` ${row.unit}` : ""}`
        ),
        createElement(context.document, "td", "", row.meaning)
      );
      body.append(tr);
    });
    table.append(head, body);
    scroll.append(table);
    section.append(scroll);
    return section;
  }

  function renderKeyValueGrid(context, component) {
    const section = componentShell(context, component, "key-value-grid");
    const list = createElement(context.document, "dl", "acra-runtime__key-values");
    component.items.forEach((item) => {
      const pair = createElement(context.document, "div", "acra-runtime__key-value");
      pair.append(
        createElement(context.document, "dt", "", item.label),
        createElement(context.document, "dd", "", item.value)
      );
      list.append(pair);
    });
    section.append(list);
    return section;
  }

  function renderChecklist(context, component) {
    const section = componentShell(context, component, "checklist");
    const list = createElement(context.document, "ul", "acra-runtime__checklist");
    component.items.forEach((item) => {
      const row = createElement(context.document, "li", "acra-runtime__check-item");
      const input = createElement(context.document, "input");
      const label = createElement(context.document, "label");
      const inputId = `${context.domPrefix}-${item.id}`;
      input.type = "checkbox";
      input.id = inputId;
      input.checked = context.progress.checkedIds.has(item.id) || Boolean(item.initiallyChecked);
      label.htmlFor = inputId;
      label.append(createElement(context.document, "strong", "", item.label));
      if (item.details) label.append(createElement(context.document, "small", "", item.details));
      addListener(context, input, "change", () => {
        if (input.checked) context.progress.checkedIds.add(item.id);
        else context.progress.checkedIds.delete(item.id);
        context.progress.visitedIds.add(component.id);
        notifyProgress(context);
      });
      row.append(input, label);
      list.append(row);
    });
    section.append(list);
    return section;
  }

  function renderQuiz(context, component) {
    const section = componentShell(context, component, "quiz");
    const list = createElement(context.document, "div", "acra-runtime__quiz");
    component.questions.forEach((question, index) => {
      const card = createElement(context.document, "section", "acra-runtime__question");
      const fieldset = createElement(context.document, "fieldset");
      const legend = createElement(context.document, "legend", "", `${index + 1}. ${question.prompt}`);
      const options = createElement(context.document, "div", "acra-runtime__options");
      const submit = createElement(context.document, "button", "acra-runtime__submit", "Conferir resposta");
      const feedback = createElement(context.document, "p", "acra-runtime__feedback");
      let selectedId = "";
      submit.type = "button";
      submit.disabled = true;
      feedback.hidden = true;
      question.options.forEach((option) => {
        const label = createElement(context.document, "label", "acra-runtime__option");
        const input = createElement(context.document, "input");
        input.type = "radio";
        input.name = `${context.domPrefix}-${question.id}`;
        input.value = option.id;
        addListener(context, input, "change", () => {
          selectedId = option.id;
          submit.disabled = false;
        });
        label.append(input, context.document.createTextNode(option.label));
        options.append(label);
      });
      addListener(context, submit, "click", () => {
        if (!selectedId) return;
        const correct = selectedId === question.correctOptionId;
        feedback.dataset.correct = String(correct);
        feedback.textContent = `${correct ? "✅ Correto. " : "🔁 Revise. "}${question.feedback}`;
        feedback.hidden = false;
        submit.textContent = "Revisar resposta";
        context.progress.answeredIds.add(question.id);
        context.progress.visitedIds.add(component.id);
        notifyProgress(context);
      });
      fieldset.append(legend, options);
      card.append(fieldset, submit, feedback);
      list.append(card);
    });
    section.append(list);
    return section;
  }

  function updateProgressViews(context) {
    context.progressViews.forEach((view) => {
      const completed = context.artifact.components.filter((component) => {
        if (context.progress.visitedIds.has(component.id)) return true;
        if (component.type === "checklist") {
          return component.items.some((item) => context.progress.checkedIds.has(item.id));
        }
        if (component.type === "quiz") {
          return component.questions.some((item) => context.progress.answeredIds.has(item.id));
        }
        return false;
      }).length;
      const current = Math.min(view.total, Math.max(view.initial, completed));
      const percentage = Math.round((current / view.total) * 100);
      view.track.setAttribute("aria-valuenow", String(current));
      view.value.style.width = `${percentage}%`;
      view.copy.textContent = `${current}/${view.total} · ${percentage}%`;
    });
  }

  function renderProgress(context, component) {
    const section = componentShell(context, component, "progress");
    const wrapper = createElement(context.document, "div", "acra-runtime__progress");
    const track = createElement(context.document, "div", "acra-runtime__progress-track");
    const value = createElement(context.document, "div", "acra-runtime__progress-value");
    const copy = createElement(context.document, "strong", "acra-runtime__progress-copy");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", component.label);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(component.total));
    track.append(value);
    wrapper.append(track, copy);
    section.append(wrapper);
    context.progressViews.push({
      copy,
      initial: component.current,
      total: component.total,
      track,
      value
    });
    updateProgressViews(context);
    return section;
  }

  function renderSources(context, component) {
    const section = componentShell(context, component, "sources");
    const list = createElement(context.document, "ol", "acra-runtime__sources");
    component.sourceIds.forEach((sourceId) => {
      const source = context.sources.get(sourceId);
      if (!source) return;
      const item = createElement(context.document, "li");
      const url = safeHttpsUrl(source.url);
      if (!url) return;
      const link = createElement(context.document, "a", "", source.title);
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const metadata = [source.publisher, source.publishedAt].filter(Boolean).join(" · ");
      if (metadata) link.append(createElement(context.document, "small", "", metadata));
      item.append(link);
      list.append(item);
    });
    section.append(list);
    return section;
  }

  function renderFollowupActions(context, component) {
    const section = componentShell(context, component, "followup-actions");
    const list = createElement(context.document, "div", "acra-runtime__actions");
    const preview = createElement(context.document, "div", "acra-runtime__action-preview");
    preview.hidden = true;
    component.actionIds.forEach((actionId) => {
      const action = context.actions.get(actionId);
      if (!action || action.requiresPreview !== true) return;
      const button = createElement(context.document, "button", "acra-runtime__action", `➡️ ${action.label}`);
      button.type = "button";
      addListener(context, button, "click", () => {
        preview.textContent = `Prévia educacional — nenhuma ação é executada: ${action.prompt}`;
        preview.hidden = false;
        const target = action.contextComponentIds
          .map((id) => context.componentNodes.get(id))
          .find(Boolean);
        if (target && typeof target.scrollIntoView === "function") {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        markVisited(context, component.id);
      });
      list.append(button);
    });
    section.append(list, preview);
    return section;
  }

  function renderComponent(context, component) {
    switch (component.type) {
      case "callout": return renderCallout(context, component);
      case "tabs": return renderTabs(context, component);
      case "accordion": return renderAccordion(context, component);
      case "cards": return renderCards(context, component);
      case "numberedSteps": return renderNumberedSteps(context, component);
      case "comparisonTable": return renderComparisonTable(context, component);
      case "thresholdTable": return renderThresholdTable(context, component);
      case "checklist": return renderChecklist(context, component);
      case "quiz": return renderQuiz(context, component);
      case "keyValueGrid": return renderKeyValueGrid(context, component);
      case "sources": return renderSources(context, component);
      case "progress": return renderProgress(context, component);
      case "followupActions": return renderFollowupActions(context, component);
      default: throw new ValidationFailure("ACRA_SCHEMA_INVALID", "/component/type");
    }
  }

  function renderHeader(context, parent) {
    const header = createElement(context.document, "header", "acra-runtime__header");
    const badge = createElement(
      context.document,
      "p",
      "acra-runtime__badge",
      context.variant === "partial" ? "ACRA PARCIAL · apoio visual" : "ACRA COMPLETO · opt-in"
    );
    header.append(
      badge,
      createElement(context.document, "h3", "acra-runtime__artifact-title", context.artifact.title),
      createElement(context.document, "p", "acra-runtime__subtitle", context.artifact.subtitle),
      createElement(context.document, "p", "acra-runtime__summary", context.artifact.summary)
    );
    parent.append(header);
  }

  function renderCritical(context, parent) {
    const region = createElement(context.document, "section", "acra-runtime__critical");
    region.setAttribute("aria-label", "Alertas clínicos do artefato ACRA");
    context.artifact.critical.forEach((item) => {
      const alert = createElement(context.document, "article", "acra-runtime__critical-item");
      alert.dataset.severity = item.severity;
      alert.append(
        createElement(context.document, "h4", "", item.title),
        createElement(context.document, "p", "acra-runtime__copy", item.text)
      );
      region.append(alert);
    });
    parent.append(region);
  }

  function mount(options) {
    const target = options && options.target;
    if (
      !target ||
      typeof target.append !== "function" ||
      !target.ownerDocument ||
      typeof target.ownerDocument.createElement !== "function"
    ) {
      return failure(new ValidationFailure("ACRA_TARGET_INVALID", "/target"));
    }
    const validation = validateArtifact(options.artifact);
    if (!validation.ok) return validation;
    const variant = options.variant === "full" ? "full" : "partial";
    const documentNode = target.ownerDocument;
    const rootNode = createElement(documentNode, "article", "acra-runtime");
    rootNode.dataset.acraGenerated = "true";
    rootNode.dataset.acraArtifactId = validation.value.id;
    rootNode.dataset.acraVariant = variant;
    const context = {
      actions: new Map(validation.value.actions.map((item) => [item.id, item])),
      artifact: validation.value,
      cleanup: [],
      componentNodes: new Map(),
      document: documentNode,
      domPrefix: `sepse-acra-${++mountSequence}-${validation.value.id}`,
      onProgress: typeof options.onProgress === "function" ? options.onProgress : null,
      progress: progressFrom(options.progress),
      progressViews: [],
      sources: new Map(validation.value.sources.map((item) => [item.id, item])),
      variant
    };

    try {
      renderHeader(context, rootNode);
      renderCritical(context, rootNode);
      const components = createElement(documentNode, "div", "acra-runtime__components");
      if (variant === "partial") {
        const firstCallout = validation.value.components.find((item) => item.type === "callout");
        if (firstCallout) components.append(renderCallout(context, firstCallout));
      } else {
        validation.value.components.forEach((component) => {
          components.append(renderComponent(context, component));
        });
      }
      rootNode.append(components);
      target.append(rootNode);
    } catch (_error) {
      context.cleanup.splice(0).reverse().forEach((dispose) => dispose());
      if (typeof rootNode.remove === "function") rootNode.remove();
      return failure(new ValidationFailure("ACRA_RENDER_FAILED", "/render"));
    }

    let active = true;
    const handle = Object.freeze({
      artifactId: validation.value.id,
      variant,
      unmount() {
        if (!active) return true;
        active = false;
        context.cleanup.splice(0).reverse().forEach((dispose) => {
          try { dispose(); } catch (_error) { /* limpeza fail-safe */ }
        });
        if (typeof rootNode.remove === "function") rootNode.remove();
        else if (rootNode.parentNode) rootNode.parentNode.removeChild(rootNode);
        return true;
      }
    });
    return Object.freeze({ ok: true, handle });
  }

  root.SepsisAcraRuntime = Object.freeze({
    artifactVersion: ARTIFACT_VERSION,
    bundleVersion: BUNDLE_VERSION,
    componentTypes: COMPONENT_TYPES,
    errorMessages: ERROR_MESSAGES,
    mount,
    safeHttpsUrl,
    validateArtifact,
    validateBundle
  });
})(globalThis);
