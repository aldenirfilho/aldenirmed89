#!/usr/bin/env node
"use strict";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const radarSource = path.join(root, "15_Radar_Cientifico/data/radar.js");
const outputPath = path.join(
  root,
  "15_Radar_Cientifico/data/radar-widget-feed.json",
);
const publicBase =
  "https://aldenirfilho.github.io/antigravity-consultas/15_Radar_Cientifico/";

function fail(message) {
  process.stderr.write(`❌ ${message}\n`);
  process.exitCode = 1;
}

function slugFor(itemId) {
  return String(itemId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nonEmptyString(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function validReviewDate(value) {
  return (
    nonEmptyString(value) &&
    /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function loadRadar() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(radarSource, "utf8"), context, {
    filename: radarSource,
    timeout: 2_000,
  });
  const radar = context.window.ANTIGRAVITY_RADAR;
  if (!radar || radar.schemaVersion !== "radar-v2") {
    throw new Error("radar.js não expôs o contrato radar-v2.");
  }
  return radar;
}

function buildFeed(radar) {
  const edition = radar.editions.find((item) => item.id === radar.editionId);
  if (!edition || !Array.isArray(edition.itemIds) || !edition.itemIds.length) {
    throw new Error("Edição atual sem itens para o widget.");
  }
  const allItems = [
    ...(radar.scientific || []),
    ...(radar.geopolitics || []),
    ...(radar.commercial || []),
  ];
  const itemById = new Map(allItems.map((item) => [item.id, item]));
  const items = edition.itemIds.map((itemId) => {
    const item = itemById.get(itemId);
    if (!item) throw new Error(`Item atual ausente no catálogo: ${itemId}`);
    const didactic = item.didactic || {};
    return {
      id: item.id,
      priority: item.priority,
      section: item.section,
      topic: item.topic,
      kind: item.kind,
      evidenceLevel: item.evidenceLevel,
      title: item.title,
      source: item.source,
      sourceUrl: item.url,
      editorialPublishedAt: item.editorialPublishedAt,
      checkedAt: item.checkedAt,
      summary: item.summary,
      takeaway: didactic.practiceToday || didactic.clinicalMeaning,
      doNotInfer: didactic.doNotInfer || item.caveat,
      temiHook: didactic.temiHook,
      memoryAnchor: didactic.memoryAnchor || item.topic,
      reviewStatus: item.audit?.reviewStatus || "pending",
      clinicalReviewer: item.audit?.clinicalReviewer || null,
      reviewedAt: item.audit?.reviewedAt || null,
      reviewEvidence: item.audit?.reviewEvidence || null,
      deepLink: `${publicBase}#radar-${slugFor(item.id)}`,
    };
  });
  const reviewedItemCount = items.filter(
    (item) =>
      item.reviewStatus === "reviewed" &&
      nonEmptyString(item.clinicalReviewer) &&
      validReviewDate(item.reviewedAt) &&
      nonEmptyString(item.reviewEvidence),
  ).length;
  const clinicalReviewConfirmed = reviewedItemCount === items.length;
  const contentHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(items))
    .digest("hex");

  return {
    schemaVersion: "antigravity-radar-widget-feed-v1",
    editionId: radar.editionId,
    editorialDay: radar.editionDate,
    generatedAt: radar.generatedAt,
    timezone: radar.timezone,
    refreshAfterMinutes: 60,
    canonicalUrl: publicBase,
    contentHash,
    privacy: {
      telemetry: false,
      patientData: false,
      accountRequired: false,
      network: "leitura HTTPS do GitHub Pages oficial",
    },
    safety: {
      status: clinicalReviewConfirmed
        ? "conteúdo educacional com revisão clínica humana confirmada"
        : "prévia educacional em revisão clínica",
      clinicalReview: {
        status: clinicalReviewConfirmed ? "reviewed" : "pending",
        reviewedItemCount,
        totalItemCount: items.length,
      },
      disclaimer:
        "Apoio educacional. Não substitui avaliação clínica, protocolo local ou julgamento profissional.",
    },
    items,
  };
}

let serialized;
try {
  serialized = `${JSON.stringify(buildFeed(loadRadar()), null, 2)}\n`;
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
  process.exit();
}

if (process.argv.includes("--check")) {
  if (!fs.existsSync(outputPath)) {
    fail("radar-widget-feed.json ainda não foi gerado.");
  } else if (fs.readFileSync(outputPath, "utf8") !== serialized) {
    fail("radar-widget-feed.json está divergente de radar.js.");
  } else {
    process.stdout.write("✅ Feed WidgetKit sincronizado com o Radar Diário.\n");
  }
} else {
  fs.writeFileSync(outputPath, serialized, "utf8");
  process.stdout.write(
    `✅ Feed WidgetKit gerado: ${path.relative(root, outputPath)}\n`,
  );
}
