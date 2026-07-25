#!/usr/bin/env python3
"""Contratos do app Forjador de Conhecimento e da ponte com a Biblioteca."""

from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FEED = (ROOT / "05_Midia_E_Feed/index.html").read_text(encoding="utf-8")
FORGE = (ROOT / "05_Midia_E_Feed/assets/knowledge-forge.js").read_text(encoding="utf-8")
STYLE = (ROOT / "05_Midia_E_Feed/assets/knowledge-forge.css").read_text(encoding="utf-8")
LIBRARY = (ROOT / "02_Biblioteca_IA_Engine/index.html").read_text(encoding="utf-8")
SERVICE_WORKER = (ROOT / "05_Midia_E_Feed/sw.js").read_text(encoding="utf-8")


class KnowledgeForgeAppTests(unittest.TestCase):
    def test_workspace_accepts_multiple_safe_raster_formats_and_dimensions(self) -> None:
        for marker in (
            'id="btnForgeNew"',
            'id="forgeImageInput"',
            'multiple',
            ".png,.jpg,.jpeg,.webp,.gif,.bmp,.avif",
            "const MAX_IMAGE_BYTES = 40 * 1024 * 1024",
            "const MAX_IMAGE_PIXELS = 80_000_000",
            "const MAX_ATTACHMENTS = 12",
            "async function hasExpectedImageSignature(",
            "async function attachmentFromFile(",
            "async function switchAttachment(",
            "async function importImageFiles(",
            'id="btnForgeFit"',
            'id="btnForgeActual"',
            "function setCanvasZoom(",
        ):
            self.assertIn(marker, FEED + FORGE)
        for signature in ("PNG", "GIF87a", "GIF89a", "RIFF", "WEBP", "BM", "ftyp"):
            self.assertIn(signature, FORGE)
        self.assertNotIn('accept="image/*"', FEED)

    def test_project_schema_preserves_attachments_cards_sources_challenges_and_reviews(self) -> None:
        for marker in (
            "function normalizeAttachment(",
            "function normalizeKnowledgeCard(",
            "function normalizeSource(",
            "function normalizeReview(",
            "function normalizeChallenge(",
            "attachments,",
            "activeAttachmentId,",
            "cards:",
            "temiChallenges:",
            "librarySources:",
            "peerReviews:",
            "peerSourceProjectId:",
        ):
            self.assertIn(marker, FORGE)

    def test_exports_cover_anki_pdf_csv_markdown_html_and_json(self) -> None:
        for value in ("anki", "pdf", "csv", "markdown", "html", "json"):
            self.assertIn(f'data-forge-export="{value}"', FEED)
        for marker in (
            "function exportAnkiKit(",
            '"#separator:tab"',
            '"#html:true"',
            '"#tags column:5"',
            "Front",
            "Back",
            "Evidence",
            "SourceId",
            "Tags",
            "anki-import.txt",
            "media/",
            "function printProject(",
            "Salvar como PDF",
            "function projectMarkdown(",
            "function projectHTML(",
        ):
            self.assertIn(marker, FORGE)

    def test_temi_and_causal_gallery_are_grounded_in_authored_artifacts(self) -> None:
        for marker in (
            'id="btnForgeGenerateCards"',
            'id="btnForgeGenerateTemi"',
            "function generateKnowledgeCards(",
            "mission.artifact.trim().length >= 40",
            "mission.evidence.trim().length >= 20",
            "state.current.cards.length < 4",
            "sem inventar conteúdo novo",
            'id="forgeGalleryDialog"',
            "function causalNodes(",
            "function renderCausalGallery(",
        ):
            self.assertIn(marker, FEED + FORGE)
        self.assertNotIn("fetch(\"https://", FORGE)
        self.assertNotIn("api.openai.com", FORGE)

    def test_peer_review_is_file_based_and_traceable(self) -> None:
        for marker in (
            'id="forgePanelPeer"',
            'id="btnForgePeerPacket"',
            'id="btnForgePeerImport"',
            'id="btnForgePeerSave"',
            'const PEER_PACKET_SCHEMA = "antigravity-peer-review-packet-v1"',
            'const PEER_RESPONSE_SCHEMA = "antigravity-peer-review-response-v1"',
            "function exportPeerPacketOrResponse(",
            "async function importPeerFile(",
            "targetProjectId",
        ):
            self.assertIn(marker, FEED + FORGE)

    def test_library_builds_only_evidence_backed_authored_cards(self) -> None:
        for marker in (
            'id="libraryForgePrompt"',
            'id="libraryForgeAnswer"',
            'id="libraryForgeSave"',
            "function saveLibraryCardToForge(",
            "focusedReader?.exportPayload?.()",
            "evidence.length < 20",
            "answer.length < 40",
            "antigravity-library-forge-intake-v1",
            'const FORGE_INTAKE_KEY = "antigravity_forge_intake_v1"',
            "async function consumeLibraryIntakes(",
            "biblioteca_catalogo.json",
            "sourceSha256",
        ):
            self.assertIn(marker, LIBRARY + FORGE)
        self.assertIn("sem evidência literal, nenhum card é salvo", LIBRARY)

    def test_complete_zip_extracts_every_attachment_variant(self) -> None:
        for marker in (
            'for (const attachment of copy.attachments)',
            'for (const variant of ["originalData", "editedData"])',
            '"backupOriginalPath"',
            '"backupEditedPath"',
            '"backupOriginalMime"',
            '"backupEditedMime"',
            "restoreProjectImage",
        ):
            self.assertIn(marker, FORGE)

    def test_full_screen_responsive_workspace_and_fresh_offline_cache(self) -> None:
        self.assertIn("height: calc(100dvh - 12px)", STYLE)
        self.assertIn("overflow-x: auto", STYLE)
        self.assertIn("@media (max-width: 620px)", STYLE)
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v7`', SERVICE_WORKER)

    def test_runtime_normalizer_preserves_new_product_records(self) -> None:
        script = f"""
const fs = require("fs");
global.window = {{ addEventListener() {{}}, CardFeedBridge: null }};
global.document = {{}};
eval(fs.readFileSync({json.dumps(str(ROOT / "05_Midia_E_Feed/assets/knowledge-forge.js"))}, "utf8"));
const api = window.KnowledgeForgeDiagnostics;
const types = ["evidence-constellation","diagnostic-duel","causal-map","decision-simulator","teachable-synthesis"];
const missions = types.map((type, i) => ({{
  id:"m"+i,type,maturity:"testable",artifact:type === "causal-map" ? "gatilho → mecanismo → desfecho" : "artefato autoral suficientemente detalhado",
  evidence:"evidência literal rastreável",uncertainty:"contraponto explícito",nextQuestion:"próximo teste decisório"
}}));
const project = api.normalizeProject({{
  id:"project-1",title:"Projeto",
  attachments:[{{id:"img-1",name:"x.png",mime:"image/png",width:10,height:20,originalData:"data:image/png;base64,AA=="}}],
  activeAttachmentId:"img-1",missions,
  cards:[{{id:"c1",front:"Produza",back:"Modelo produzido",evidence:"Trecho",sourceId:"s1",tags:["TEMI"]}}],
  librarySources:[{{id:"s1",title:"Artigo",path:"acervo/a.pdf",sourceSha256:"a".repeat(64)}}],
  temiChallenges:[{{id:"q1",stem:"Qual?",options:["a","b","c","d"],answerIndex:1}}],
  peerReviews:[{{id:"r1",reviewer:"Par",scores:{{evidence:5,coherence:4,uncertainty:3,teachability:5}},critique:"Crítica construtiva suficiente",nextTest:"Novo teste"}}]
}});
const payload = {{
  attachments: project.attachments.length,
  blockedRemoteAttachments: api.normalizeProject({{id:"p2",attachments:[{{id:"x",mime:"image/png",originalData:"https://tracker.invalid/x.png"}}]}}).attachments.length,
  cards: api.cardRows(project).length,
  sources: project.librarySources.length,
  challenges: project.temiChallenges.length,
  reviews: project.peerReviews.length,
  nodes: api.causalNodes(project).length
}};
console.log(JSON.stringify(payload));
"""
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        self.assertEqual(
            json.loads(result.stdout),
            {
                "attachments": 1,
                "blockedRemoteAttachments": 0,
                "cards": 1,
                "sources": 1,
                "challenges": 1,
                "reviews": 1,
                "nodes": 3,
            },
        )


if __name__ == "__main__":
    unittest.main()
