#!/usr/bin/env python3
"""Regressões da Forja de Conhecimento visual e do backup ZIP local."""

from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FEED = (ROOT / "05_Midia_E_Feed/index.html").read_text(encoding="utf-8")
FORGE = (ROOT / "05_Midia_E_Feed/assets/knowledge-forge.js").read_text(encoding="utf-8")
STYLE = (ROOT / "05_Midia_E_Feed/assets/knowledge-forge.css").read_text(encoding="utf-8")
SERVICE_WORKER = (ROOT / "05_Midia_E_Feed/sw.js").read_text(encoding="utf-8")
VENDOR = ROOT / "05_Midia_E_Feed/assets/vendor/tesseract"


class KnowledgeForgeContractTests(unittest.TestCase):
    def test_feed_exposes_productive_projects_instead_of_completion_cards(self) -> None:
        markers = (
            'id="knowledgeForge"',
            "Seu laboratório completo para transformar evidência em conhecimento.",
            "não complete uma frase",
            'data-forge="${esc(c.id)}"',
            "🧠 Forjar conhecimento",
            'id="knowledgeForgeDialog"',
            'id="forgeMissions"',
        )
        for marker in markers:
            self.assertIn(marker, FEED)

        for mission in (
            "evidence-constellation",
            "diagnostic-duel",
            "causal-map",
            "decision-simulator",
            "teachable-synthesis",
        ):
            self.assertIn(f'type: "{mission}"', FORGE)
        self.assertEqual(FORGE.count("subtitle:"), 5)
        self.assertIn('draft: "Rascunho"', FORGE)
        self.assertIn('testable: "Testável"', FORGE)
        self.assertIn('teachable: "Ensinável"', FORGE)
        self.assertIn("missionProductionScore", FORGE)

    def test_editor_supports_crop_annotation_text_undo_and_original(self) -> None:
        for marker in (
            'data-forge-tool="pen"',
            'data-forge-tool="highlight"',
            'data-forge-tool="arrow"',
            'data-forge-tool="crop"',
            'id="btnForgeApplyCrop"',
            'id="btnForgeText"',
            'id="btnForgeUndo"',
            'id="btnForgeReset"',
            "function drawArrow(",
            "function drawCropSelection(",
            "async function applyCrop()",
            "function addTextAnnotation()",
            "async function undoCanvas()",
        ):
            self.assertIn(marker, FEED + FORGE)
        self.assertIn("touch-action: none", STYLE)
        self.assertIn("MAX_CANVAS_EDGE = 1800", FORGE)

    def test_database_upgrade_preserves_cards_and_adds_project_store(self) -> None:
        self.assertIn("indexedDB.open(DB_NAME, 2)", FEED)
        self.assertIn('const KNOWLEDGE_STORE = "knowledgeProjects"', FEED)
        self.assertIn('database.createObjectStore(KNOWLEDGE_STORE, { keyPath: "id" })', FEED)
        self.assertIn('const PROJECT_STORE = "knowledgeProjects"', FORGE)
        self.assertIn('state.db.transaction([CARD_STORE, PROJECT_STORE], "readwrite")', FORGE)
        self.assertIn("outros dados locais foram preservados", FORGE)
        self.assertIn("window.CardFeedBridge", FEED)
        self.assertIn('window.dispatchEvent(new CustomEvent("cardfeed:ready"))', FEED)

    def test_ocr_is_same_origin_local_bilingual_and_reviewable(self) -> None:
        for marker in (
            'id="btnForgeOcr"',
            "OCR automático no dispositivo",
            "Nenhuma imagem é enviada",
            'window.Tesseract.createWorker("por+eng"',
            'workerPath: "./assets/vendor/tesseract/worker.min.js"',
            'langPath: "./assets/vendor/tesseract/lang"',
            'corePath: "./assets/vendor/tesseract/tesseract-core-lstm.wasm.js"',
            'id="forgeOcrText"',
            "Revise o texto",
        ):
            self.assertIn(marker, FEED + FORGE)
        self.assertNotIn("cdn.jsdelivr", FORGE)
        self.assertNotIn("tessdata.projectnaptha", FORGE)
        self.assertNotIn("fetch(\"http", FORGE)

    def test_ocr_runtime_and_languages_are_vendored_and_cached(self) -> None:
        expected = {
            "tesseract.min.js": 40_000,
            "worker.min.js": 70_000,
            "tesseract-core-lstm.wasm.js": 3_000_000,
            "lang/por.traineddata.gz": 1_000_000,
            "lang/eng.traineddata.gz": 2_000_000,
            "LICENSE-tesseract-js.md": 5_000,
            "LICENSE-tesseract-core.txt": 5_000,
            "THIRD_PARTY_NOTICES.md": 500,
        }
        for relative, minimum_size in expected.items():
            path = VENDOR / relative
            self.assertTrue(path.is_file(), relative)
            self.assertGreater(path.stat().st_size, minimum_size, relative)
        self.assertEqual((VENDOR / "lang/por.traineddata.gz").read_bytes()[:2], b"\x1f\x8b")
        self.assertEqual((VENDOR / "lang/eng.traineddata.gz").read_bytes()[:2], b"\x1f\x8b")
        self.assertIn('CACHE_NAME = `${CACHE_PREFIX}v7`', SERVICE_WORKER)
        for relative in (
            "assets/knowledge-forge.css",
            "assets/knowledge-forge.js",
            "assets/vendor/tesseract/tesseract.min.js",
            "assets/vendor/tesseract/worker.min.js",
            "assets/vendor/tesseract/tesseract-core-lstm.wasm.js",
            "assets/vendor/tesseract/lang/por.traineddata.gz",
            "assets/vendor/tesseract/lang/eng.traineddata.gz",
        ):
            self.assertIn(f'"./{relative}"', SERVICE_WORKER)

    def test_zip_backup_contains_images_projects_crc_and_restore_limits(self) -> None:
        for marker in (
            'const BACKUP_SCHEMA = "antigravity-card-feed-backup-v3"',
            "const MAX_ZIP_BYTES = 512 * 1024 * 1024",
            "const MAX_ZIP_ENTRIES = 2500",
            "function crc32(bytes)",
            "function createZip(entries)",
            "function parseZip(bytes)",
            "CRC inválido",
            "ZIP criptografado não é aceito",
            "safeZipPath",
            '"manifest.json"',
            '"cards.json"',
            '"knowledge-projects.json"',
            "`images/cards/",
            "`images/projects/",
            "backupImagePath",
            'type: "application/zip"',
        ):
            self.assertIn(marker, FORGE)

    def test_zip_writer_round_trips_and_rejects_crc_corruption(self) -> None:
        script = f"""
const fs = require("fs");
global.window = {{ addEventListener() {{}}, CardFeedBridge: null }};
global.document = {{}};
eval(fs.readFileSync({json.dumps(str(ROOT / "05_Midia_E_Feed/assets/knowledge-forge.js"))}, "utf8"));
const api = window.KnowledgeForgeDiagnostics;
(async () => {{
  const source = new TextEncoder().encode("conhecimento produzido");
  const blob = api.createZip([{{name:"manifest.json", data:source}}]);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const parsed = api.parseZip(bytes);
  if (new TextDecoder().decode(parsed.get("manifest.json")) !== "conhecimento produzido") process.exit(2);
  const damaged = bytes.slice();
  const needle = source;
  let offset = -1;
  outer: for (let i = 0; i <= damaged.length - needle.length; i++) {{
    for (let j = 0; j < needle.length; j++) if (damaged[i+j] !== needle[j]) continue outer;
    offset = i; break;
  }}
  if (offset < 0) process.exit(3);
  damaged[offset] ^= 1;
  let rejected = false;
  try {{ api.parseZip(damaged); }} catch (error) {{ rejected = /CRC inválido/.test(error.message); }}
  if (!rejected) process.exit(4);
  console.log(JSON.stringify({{schema:api.schema, entries:parsed.size, crcRejected:rejected}}));
}})();
"""
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        self.assertEqual(payload["schema"], "antigravity-card-feed-backup-v3")
        self.assertEqual(payload["entries"], 1)
        self.assertTrue(payload["crcRejected"])


if __name__ == "__main__":
    unittest.main()
