"use strict";

const fs = require("fs");
const vm = require("vm");

const MODULES = [
  {
    label: "Hematologia Crítica",
    file: "01_Modulos_Clinicos/Hematologia_Critica/data/catalog.js",
    global: "ANTIGRAVITY_HEMATOLOGY",
    minimum: {
      emergencies: 16,
      diagnosticTracks: 8,
      comparisons: 5,
      concepts: 12,
      mnemonics: 10,
      alerts: 10,
      calculators: 3,
      questions: 12,
      flashcards: 32,
      cases: 12,
      references: 21
    }
  },
  {
    label: "Reumatologia Crítica",
    file: "01_Modulos_Clinicos/Reumatologia_Critica/data/catalog.js",
    global: "ANTIGRAVITY_RHEUMATOLOGY",
    minimum: {
      emergencies: 19,
      diagnosticTracks: 8,
      comparisons: 5,
      concepts: 12,
      mnemonics: 12,
      alerts: 12,
      calculators: 7,
      questions: 16,
      flashcards: 24,
      cases: 12,
      references: 27
    }
  },
  {
    label: "Infectologia Crítica",
    file: "01_Modulos_Clinicos/Infectologia_Critica/data/catalog.js",
    global: "ANTIGRAVITY_INFECTOLOGY",
    minimum: {
      emergencies: 10,
      pathways: 5,
      comparisons: 4,
      concepts: 10,
      mnemonics: 8,
      alerts: 8,
      calculators: 1,
      questions: 10,
      flashcards: 18,
      cases: 6,
      references: 12
    }
  },
  {
    label: "Pneumologia Crítica",
    file: "01_Modulos_Clinicos/Pneumologia_Critica/data/catalog.js",
    global: "ANTIGRAVITY_PULMONOLOGY",
    minimum: {
      emergencies: 10,
      pathways: 5,
      comparisons: 4,
      concepts: 10,
      mnemonics: 8,
      alerts: 8,
      calculators: 1,
      questions: 10,
      flashcards: 18,
      cases: 6,
      references: 14
    }
  }
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function loadCatalog(config) {
  const sandbox = {
    window: {},
    document: { dispatchEvent() {} },
    CustomEvent: function CustomEvent() {}
  };
  vm.runInNewContext(fs.readFileSync(config.file, "utf8"), sandbox, {
    filename: config.file,
    timeout: 3000
  });
  const catalog = sandbox.window[config.global];
  invariant(catalog && typeof catalog === "object", `${config.label}: catálogo ausente.`);
  return catalog;
}

function validateUniqueIds(config, collection, items) {
  const fallbackKeys = { concepts: "term", mnemonics: "code", alerts: "title" };
  const key = fallbackKeys[collection] || "id";
  const ids = items.map((item) => item && item[key]);
  invariant(ids.every((id) => typeof id === "string" && id.trim()), `${config.label}/${collection}: chave ${key} ausente.`);
  invariant(new Set(ids).size === ids.length, `${config.label}/${collection}: chave ${key} duplicada.`);
}

function validateQuestions(config, collection, items) {
  items.forEach((item) => {
    invariant(Array.isArray(item.options) && item.options.length >= 2, `${config.label}/${collection}/${item.id}: alternativas insuficientes.`);
    invariant(Number.isInteger(item.correct), `${config.label}/${collection}/${item.id}: gabarito não inteiro.`);
    invariant(item.correct >= 0 && item.correct < item.options.length, `${config.label}/${collection}/${item.id}: gabarito fora das alternativas.`);
    invariant(typeof item.explanation === "string" && item.explanation.trim(), `${config.label}/${collection}/${item.id}: comentário ausente.`);
  });
}

function validate(config) {
  const catalog = loadCatalog(config);
  invariant(catalog.meta?.schemaVersion, `${config.label}: schemaVersion ausente.`);
  invariant(catalog.meta?.moduleVersion, `${config.label}: moduleVersion ausente.`);
  invariant(catalog.meta?.status === "em-revisao-medica", `${config.label}: status clínico inesperado.`);

  Object.entries(config.minimum).forEach(([collection, minimum]) => {
    const items = catalog[collection];
    invariant(Array.isArray(items), `${config.label}: coleção ${collection} ausente.`);
    invariant(items.length >= minimum, `${config.label}: ${collection} caiu de ${minimum} para ${items.length}.`);
    validateUniqueIds(config, collection, items);
  });

  const referenceIds = new Set(catalog.references.map((reference) => reference.id));
  catalog.emergencies.forEach((item) => {
    invariant(Array.isArray(item.firstHour) && item.firstHour.length, `${config.label}/${item.id}: primeira hora vazia.`);
    invariant(Array.isArray(item.decisive) && item.decisive.length, `${config.label}/${item.id}: exames decisivos vazios.`);
    invariant(Array.isArray(item.doNot) && item.doNot.length, `${config.label}/${item.id}: alertas vazios.`);
    invariant(Array.isArray(item.referenceIds) && item.referenceIds.length, `${config.label}/${item.id}: referência ausente.`);
    item.referenceIds.forEach((id) => {
      invariant(referenceIds.has(id), `${config.label}/${item.id}: referência inexistente ${id}.`);
    });
  });

  validateQuestions(config, "questions", catalog.questions);
  validateQuestions(config, "cases", catalog.cases);
  catalog.references.forEach((reference) => {
    invariant(/^https:\/\//.test(reference.url), `${config.label}/${reference.id}: fonte sem HTTPS.`);
    invariant(reference.year && reference.title && reference.group, `${config.label}/${reference.id}: metadados incompletos.`);
  });

  console.log(
    `✅ ${config.label}: ${catalog.emergencies.length} emergências, ` +
    `${catalog.calculators.length} ferramentas, ${catalog.questions.length} questões, ` +
    `${catalog.flashcards.length} flashcards e ${catalog.references.length} fontes.`
  );
}

MODULES.forEach(validate);
