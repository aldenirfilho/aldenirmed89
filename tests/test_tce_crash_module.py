#!/usr/bin/env python3
"""Contratos clínicos, editoriais e técnicos do módulo TCE grave CRASH."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/TCE_Grave_CRASH")
MODULE = ROOT / RELATIVE
ROUTE = f"{RELATIVE.as_posix()}/index.html"


def load_json(relative: str) -> dict | list:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def jpeg_dimensions(path: Path) -> tuple[int, int]:
    """Read JPEG dimensions without adding an image-library dependency."""
    data = path.read_bytes()
    if not data.startswith(b"\xff\xd8"):
        raise ValueError(f"not a JPEG: {path}")

    sof_markers = {
        0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
        0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
    }
    offset = 2
    while offset + 4 <= len(data):
        while offset < len(data) and data[offset] != 0xFF:
            offset += 1
        while offset < len(data) and data[offset] == 0xFF:
            offset += 1
        if offset >= len(data):
            break
        marker = data[offset]
        offset += 1
        if marker in (0xD8, 0xD9):
            continue
        if marker == 0xDA or offset + 2 > len(data):
            break
        segment_length = int.from_bytes(data[offset:offset + 2], "big")
        if segment_length < 2 or offset + segment_length > len(data):
            break
        if marker in sof_markers and segment_length >= 7:
            height = int.from_bytes(data[offset + 3:offset + 5], "big")
            width = int.from_bytes(data[offset + 5:offset + 7], "big")
            return width, height
        offset += segment_length
    raise ValueError(f"JPEG dimensions not found: {path}")


class TceCrashModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.catalog = (MODULE / "data/catalog.js").read_text(encoding="utf-8")
        cls.visuals = load_json(f"{RELATIVE.as_posix()}/data/visual-assets.json")
        cls.checklist = (MODULE / "CHECKLIST_OPERACIONAL.md").read_text(
            encoding="utf-8"
        )

    def test_required_files_and_review_gate(self) -> None:
        for relative in (
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "data/catalog.js",
            "data/visual-assets.json",
            "module.manifest.json",
            "CHECKLIST_OPERACIONAL.md",
            "README.md",
        ):
            self.assertTrue((MODULE / relative).is_file(), relative)

        manifest = load_json(f"{RELATIVE.as_posix()}/module.manifest.json")
        self.assertEqual(manifest["status"], "em-revisao-medica")
        self.assertTrue(manifest["clinicalReviewRequired"])
        self.assertEqual(manifest["publication"]["mode"], "public-preview")
        self.assertTrue(manifest["publication"]["publicPreview"])
        self.assertTrue(manifest["publication"]["clinicalReviewOngoing"])
        self.assertIn("previewReason", manifest["publication"])
        self.assertFalse(manifest["privacy"]["networkRuntime"])
        self.assertFalse(manifest["privacy"]["telemetry"])
        self.assertFalse(manifest["privacy"]["patientData"])
        self.assertIn("review-strip", self.html)
        self.assertIn("Revisão médica obrigatória", self.html)

    def test_ct_atlas_assets_dimensions_hashes_and_accessibility(self) -> None:
        manifest = load_json(f"{RELATIVE.as_posix()}/module.manifest.json")
        atlas = manifest["visualAtlas"]
        assets = self.visuals["assets"]

        self.assertEqual(atlas["count"], 10)
        self.assertTrue(atlas["synthetic"])
        self.assertFalse(atlas["diagnosticUse"])
        self.assertEqual(len(assets), 10)
        self.assertFalse(self.visuals["patientDerived"])
        self.assertFalse(self.visuals["diagnosticUse"])
        self.assertEqual(
            self.visuals["reviewStatus"], "pending-neuroradiology-neurosurgery"
        )
        self.assertEqual(
            self.visuals["rights"]["basis"], "project-generated-synthetic"
        )
        self.assertEqual(self.html.count('class="ct-plate"'), 10)
        self.assertNotIn("CT_GALLERY_CARDS", self.html)
        self.assertNotIn("CT_THERAPY_BRIDGE", self.html)

        image_sources = re.findall(
            r'src="(assets/visuals/tc-tce-[^"]+\.jpg)"', self.html
        )
        self.assertEqual(len(image_sources), 10)
        self.assertEqual(len(set(image_sources)), 10)
        self.assertEqual({item["file"] for item in assets}, set(image_sources))
        self.assertEqual(len({item["sha256"] for item in assets}), 10)

        for item in assets:
            image_path = MODULE / item["file"]
            self.assertTrue(image_path.is_file(), item["file"])
            self.assertEqual(image_path.stat().st_size, item["bytes"])
            self.assertEqual(item["format"], "image/jpeg")
            self.assertEqual(item["origin"], "original-generated")
            self.assertEqual(item["rightsBasis"], "generated-for-project")
            self.assertFalse(item["patientData"])
            self.assertFalse(item["embeddedText"])
            self.assertFalse(item["clinicalGroundTruth"])
            self.assertEqual(item["technicalReview"], "completed")
            self.assertEqual(
                item["clinicalReview"],
                "pending-neuroradiology-neurosurgery",
            )
            self.assertEqual(item["publicationStatus"], "public-preview")
            self.assertTrue(item["caption"])
            self.assertTrue(item["promptSummary"])
            self.assertEqual(
                hashlib.sha256(image_path.read_bytes()).hexdigest(),
                item["sha256"],
            )
            self.assertEqual(
                jpeg_dimensions(image_path),
                (item["width"], item["height"]),
            )
            tag = re.search(
                rf'<img\s+src="{re.escape(item["file"])}"[^>]+>', self.html
            )
            self.assertIsNotNone(tag, item["file"])
            markup = tag.group(0)
            self.assertIn(f'width="{item["width"]}"', markup)
            self.assertIn(f'height="{item["height"]}"', markup)
            self.assertIn('loading="lazy"', markup)
            self.assertIn('decoding="async"', markup)
            self.assertIn(f'alt="{item["alt"]}"', markup)
            self.assertIn("Ilustração sintética", item["alt"])

    def test_ct_atlas_navigation_responsive_and_version_contract(self) -> None:
        manifest = load_json(f"{RELATIVE.as_posix()}/module.manifest.json")
        self.assertIn('href="#tc-tce-360x"', self.html)
        self.assertIn(
            '<section class="ct-atlas" id="tc-tce-360x"', self.html
        )
        self.assertIn('main section[id]', self.app)
        self.assertIn("scroll-margin-top: 8rem", self.css)
        self.assertIn(".ct-gallery", self.css)
        self.assertIn(".ct-read-sequence { grid-template-columns: repeat(2", self.css)
        self.assertIn(f'v{manifest["version"]}', self.html)
        self.assertIn(f'version: "{manifest["version"]}"', self.catalog)

    def test_ct_therapy_bridge_keeps_drugs_and_drains_in_guardrails(self) -> None:
        for required in (
            "CONTUSO · PROFILAXIA ≤7 D",
            "BTF 2026 recomenda por consenso 7 dias ou mais",
            "RR 0,94; IC95% 0,86–1,02",
            "ceftriaxona pode compor protocolo local",
            "clindamicina pode ser alternativa",
            "não há esquema superior universal",
            "a PIC não é medida com exatidão enquanto o dreno está aberto",
            "Válvula programável foi a opção consensual",
            "a evidência é baixa e o uso não padronizado",
            "cessar drenagem e avaliação neurocirúrgica urgente",
        ):
            self.assertIn(required.casefold(), self.html.casefold())

    def test_csp_offline_privacy_and_javascript_syntax(self) -> None:
        policy_match = re.search(
            r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">',
            self.html,
        )
        self.assertIsNotNone(policy_match)
        policy = policy_match.group(1)
        self.assertIn("object-src 'none'", policy)
        self.assertIn("base-uri 'self'", policy)
        self.assertNotIn("'unsafe-inline'", policy)
        self.assertNotRegex(self.html, r"\sstyle=")
        self.assertNotIn("fetch(", self.app)
        self.assertNotIn("XMLHttpRequest", self.app)
        self.assertNotIn("sendBeacon", self.app)
        self.assertNotIn("WebSocket", self.app)
        self.assertNotRegex(
            self.app,
            r"localStorage\.setItem\([^)]*(?:gcs|pupila|pic|pco2|paciente)",
        )

        for script in (MODULE / "assets/app.js", MODULE / "data/catalog.js"):
            result = subprocess.run(
                ["node", "--check", str(script)],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_crash_is_explicitly_authorial_and_not_a_score(self) -> None:
        normalized = self.html.casefold()
        self.assertIn("mnemônico autoral", normalized)
        self.assertIn("não um escore validado", normalized)
        self.assertIn("ensaio <em>crash</em>", normalized)
        self.assertIn("<em>crash-3</em>", normalized)
        for command in (
            "Circulação, coluna e capnografia",
            "Respiração e via aérea neuroprotetora",
            "Avaliação neurológica e agentes",
            "Segunda lesão, sedação e sincronização",
            "Herniação, resgate e handoff",
        ):
            self.assertIn(command, self.html)

    def test_core_tbi_targets_and_harm_guards_are_visible(self) -> None:
        for required in (
            "≥ 94%",
            "35–38 mmHg",
            "≥ 100–110 mmHg",
            "&gt; 22 mmHg",
            "60–70 mmHg",
            "Corticoide no TCE",
            "aumento de mortalidade",
            "ETCO<sub>2</sub> 32–35 mmHg",
            "nenhum benefício demonstrado no grave",
        ):
            self.assertIn(required, self.html)

    def test_sedation_wakeup_and_extubation_contracts(self) -> None:
        for required in (
            "Pode iniciar o teste de despertar?",
            "PIC estável/no alvo",
            "Sem estado de mal",
            "Sem bloqueio neuromuscular ativo",
            "Abortar e resgatar",
            "Extubação não decidida por um único número de GCS",
            "CPOT/BPS",
            "RASS/SAS",
        ):
            self.assertIn(required, self.html + self.checklist)
        self.assertEqual(self.html.count("data-wake-check"), 6)

    def test_all_major_asynchronies_and_cycling_directions(self) -> None:
        for required in (
            "Fome de fluxo",
            "Esforço ineficaz",
            "Auto-disparo",
            "Duplo disparo / empilhamento",
            "Ciclagem precoce",
            "Ciclagem tardia",
            "Auto-PEEP / aprisionamento",
            "Reverse triggering",
            "reduza a porcentagem de ciclagem",
            "aumente a porcentagem de ciclagem",
            "Não eleve VT cegamente",
        ):
            self.assertIn(required, self.html)
        self.assertEqual(self.html.count('class="async-card"'), 8)

    def test_respiratory_rescue_and_drug_specific_guards(self) -> None:
        for required in (
            "P/F permanece &lt;150",
            "≥16 horas",
            "P/F &lt;80",
            "pH &lt;7,25",
            "PaCO<sub>2</sub> ≥60",
            "não deve interromper RCP",
            "não recomenda antagonista beta-adrenérgico",
            "Corrija hipoglicemia imediatamente; não espere tiamina",
            "Evite flumazenil rotineiro",
        ):
            self.assertIn(required, self.html)

    def test_accessibility_responsive_and_print_contracts(self) -> None:
        for required in (
            "overflow-x: hidden",
            "grid-template-columns: 1fr",
            "-webkit-overflow-scrolling: touch",
            "@media (prefers-reduced-motion: reduce)",
            "@media print",
        ):
            self.assertIn(required, self.css)
        self.assertIn('class="skip-link"', self.html)
        self.assertIn('aria-live="polite"', self.html)
        self.assertIn('<main id="conteudo">', self.html)

    def test_references_are_primary_and_current(self) -> None:
        self.assertGreaterEqual(self.html.count('<li><a href="https://'), 28)
        for authority in (
            "Neurocritical Care Society",
            "Brain Trauma Foundation",
            "ESICM",
            "ATS",
            "ELSO",
            "SCCM",
            "AHA 2025",
            "CRASH-3",
        ):
            self.assertIn(authority, self.html)

    def test_portal_manifests_graph_updown_and_pwa_are_integrated(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn(f'href="{ROUTE}"', home)
        self.assertIn("TCE grave · CRASH", home)

        site = load_json("data/site_manifest.json")
        self.assertEqual(site["canonicalRoutes"]["tce_grave_crash"], ROUTE)
        self.assertEqual(
            site["dataSources"]["tceCrashManifest"],
            f"{RELATIVE.as_posix()}/module.manifest.json",
        )
        self.assertTrue(any(item.get("path") == ROUTE for item in site["modules"]))

        home_manifest = load_json("06_Infra_Site_E_Assets/data/home-manifest.json")
        self.assertTrue(
            any(item.get("href") == "01_Modulos_Clinicos/TCE_Grave_CRASH/"
                for item in home_manifest["mainLinks"])
        )

        registry = load_json("01_UpDown_Hub/registry.json")
        self.assertIn(
            "updown-010-tce-grave-crash",
            {item["id"] for item in registry["documents"]},
        )

        topics = load_json("data/topics.json")
        topic_ids = {item["id"] for item in topics}
        for topic_id in (
            "tce-grave-crash",
            "tce-herniacao-pic",
            "tce-sedacao-despertar",
            "tce-assincronias",
            "tce-resgate-respiratorio",
            "tce-alcool-drogas",
        ):
            self.assertIn(topic_id, topic_ids)

        graph = load_json("data/connections.json")
        node_ids = {node["id"] for node in graph["nodes"]}
        self.assertIn("tce-grave-crash", node_ids)
        edges = {(edge["from"], edge["to"]) for edge in graph["edges"]}
        self.assertIn(("home", "tce-grave-crash"), edges)
        self.assertIn(("tce-grave-crash", "vm-sdra"), edges)

        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        self.assertIn(f'"./{ROUTE}"', worker)
        self.assertIn(
            '"./01_Modulos_Clinicos/TCE_Grave_CRASH/assets/app.js"', worker
        )
        self.assertIn(
            '"./01_Modulos_Clinicos/TCE_Grave_CRASH/data/visual-assets.json"',
            worker,
        )
        self.assertIn('`${CACHE_PREFIX}v27`', worker)

    def test_editorial_registry_preserves_previous_and_records_atlas_preview(self) -> None:
        editorial = load_json("data/editorial/registry.json")
        release = next(
            item for item in editorial["items"]
            if item["id"] == "release-tce-grave-crash-public-preview-2026-09-03"
        )
        self.assertEqual(release["classification"], "public-cited")
        self.assertTrue(release["ownerApproval"])
        self.assertTrue(release["medical"])
        self.assertGreaterEqual(len(release["sources"]), 10)
        self.assertIn(ROUTE, release["paths"])
        self.assertIn(
            f"{RELATIVE.as_posix()}/module.manifest.json", release["paths"]
        )
        self.assertNotIn(
            f"{RELATIVE.as_posix()}/data/visual-assets.json", release["paths"]
        )
        self.assertTrue(
            load_json(f"{RELATIVE.as_posix()}/module.manifest.json")
            ["publication"]["publicPreview"]
        )

        atlas_release = next(
            item for item in editorial["items"]
            if item["id"] == "release-tce-atlas-360x-public-preview-2026-09-04"
        )
        self.assertEqual(atlas_release["classification"], "public-cited")
        self.assertTrue(atlas_release["ownerApproval"])
        self.assertTrue(atlas_release["medical"])
        self.assertIn(
            f"{RELATIVE.as_posix()}/data/visual-assets.json",
            atlas_release["paths"],
        )
        self.assertEqual(
            len([path for path in atlas_release["paths"] if path.endswith(".jpg")]),
            10,
        )


if __name__ == "__main__":
    unittest.main()
