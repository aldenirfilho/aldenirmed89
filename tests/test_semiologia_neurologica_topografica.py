#!/usr/bin/env python3
"""Contratos clínicos, editoriais e técnicos da Semiologia Neurológica."""

from __future__ import annotations

import hashlib
import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/Semiologia_Neurologica_Topografica")
MODULE = ROOT / RELATIVE
ROUTE = f"{RELATIVE.as_posix()}/index.html"
IMAGE_NAMES = {
    "01-mapa-cortical-funcional.png",
    "02-rede-da-linguagem.png",
    "03-padroes-afasicos.png",
    "04-via-corticoespinal.png",
    "05-paralisia-facial-central-periferica.png",
    "06-via-optica-campos-visuais.png",
    "07-tronco-encefalico-sinais-cruzados.png",
    "08-vias-sensitivas.png",
    "09-cerebelo-topografia.png",
    "10-eixo-neuromuscular.png",
}


def load_json(relative: str) -> dict | list:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()[:24]
    if len(data) != 24 or data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError(f"PNG inválido: {path}")
    return int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")


def js_collection(source: str, name: str, next_name: str) -> str:
    start = source.index(f"{name}: [")
    end = source.index(f"{next_name}:", start)
    return source[start:end]


class SemiologiaNeurologicaTopograficaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.bootstrap = (MODULE / "assets/theme-bootstrap.js").read_text(
            encoding="utf-8"
        )
        cls.content = (MODULE / "data/content.js").read_text(encoding="utf-8")
        cls.manifest = load_json(f"{RELATIVE.as_posix()}/module.manifest.json")
        cls.visuals = load_json(f"{RELATIVE.as_posix()}/data/visual-assets.json")

    def test_required_files_and_public_preview_gate(self) -> None:
        for relative in (
            "README.md",
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "assets/theme-bootstrap.js",
            "data/content.js",
            "data/visual-assets.json",
            "module.manifest.json",
        ):
            self.assertTrue((MODULE / relative).is_file(), relative)

        self.assertEqual(self.manifest["status"], "em-revisao-medica")
        self.assertTrue(self.manifest["clinicalReviewRequired"])
        self.assertEqual(self.manifest["publication"]["mode"], "public-preview")
        self.assertTrue(self.manifest["publication"]["publicPreview"])
        self.assertTrue(self.manifest["publication"]["clinicalReviewOngoing"])
        self.assertFalse(self.manifest["privacy"]["networkRuntime"])
        self.assertFalse(self.manifest["privacy"]["telemetry"])
        self.assertFalse(self.manifest["privacy"]["patientData"])
        self.assertIn("review-strip", self.html)
        self.assertIn("Prévia educacional", self.html)
        self.assertIn("revisão médica", self.html.casefold())
        self.assertIn("Revisão humana obrigatória", self.html)
        self.assertIn("não para excluir emergência", self.html)

    def test_full_exam_and_localization_content_are_structured(self) -> None:
        aphasias = js_collection(self.content, "aphasiaPatterns", "localizationRules")
        localization = js_collection(
            self.content, "localizationRules", "examChecklist"
        )
        checklist = js_collection(self.content, "examChecklist", "cases")
        cases = js_collection(self.content, "cases", "references")
        references = self.content[self.content.index("references: [") :]

        self.assertEqual(len(re.findall(r'^\s+id: "', aphasias, re.MULTILINE)), 8)
        self.assertEqual(len(re.findall(r'^\s+id: "', localization, re.MULTILINE)), 7)
        self.assertEqual(len(re.findall(r'\{ id: "', checklist)), 29)
        self.assertEqual(len(re.findall(r'^\s+id: "case-', cases, re.MULTILINE)), 8)
        self.assertEqual(len(re.findall(r'\{ title: "', references)), 17)

        for marker in (
            "Padrão não fluente tipo Broca",
            "Padrão fluente tipo Wernicke",
            "Afasia de condução",
            "Afasia transcortical motora",
            "Afasia transcortical sensorial",
            "Afasia transcortical mista",
            "Afasia anômica",
            "Córtex / rede hemisférica",
            "Tronco encefálico",
            "Medula espinal",
            "Junção neuromuscular ou músculo",
        ):
            self.assertIn(marker, self.content)

        self.assertIn("linguagem é rede, não duas caixas", self.html)
        self.assertIn("envolvimento da testa", self.html)
        self.assertIn("sinais cruzados", self.html)
        self.assertIn("NIHSS baixo não exclui AVC de circulação posterior", self.html)

    def test_interactive_controls_are_accessible_and_local_only(self) -> None:
        for element_id in (
            "localizationForm",
            "localizationResult",
            "examChecklist",
            "osceStart",
            "aphasiaForm",
            "aphasiaResult",
            "caseShell",
            "caseScore",
            "themeToggle",
            "printButton",
        ):
            self.assertIn(f'id="{element_id}"', self.html)

        for marker in (
            "ALDENIR_NEURO_SEMIOLOGY",
            "localStorage",
            "textContent",
            "aldenirmed89:neuro-semiology-ready",
        ):
            self.assertIn(marker, self.app + self.content)
        self.assertNotIn("fetch(", self.app)
        self.assertNotIn("XMLHttpRequest", self.app)
        self.assertIn("antigravity:a11y:v1", self.bootstrap + self.html)
        self.assertIn("prefers-color-scheme: light", self.bootstrap + self.app)
        self.assertIn("@media print", self.css)
        self.assertRegex(self.css.casefold(), r"(?:background|--bg)\s*:\s*#(?:fff|ffffff)\b")
        self.assertIn('aria-label="Ativar visualização clara"', self.html)

    def test_ten_generated_widescreen_assets_match_manifest_and_metadata(self) -> None:
        image_dir = MODULE / "assets/images"
        physical = {path.name for path in image_dir.glob("*.png")}
        self.assertEqual(physical, IMAGE_NAMES)
        self.assertEqual(set(self.manifest["media"]["files"]), IMAGE_NAMES)
        self.assertEqual(self.manifest["media"]["count"], 10)
        self.assertEqual(self.html.count('class="atlas-card"'), 10)
        for name in IMAGE_NAMES:
            self.assertIn(f'src="assets/images/{name}"', self.html)
            width, height = png_dimensions(image_dir / name)
            self.assertGreater(width, height, name)
            self.assertGreaterEqual(width / height, 1.45, name)

        raw_assets = (
            self.visuals.get("assets", [])
            if isinstance(self.visuals, dict)
            else self.visuals
        )
        self.assertEqual(len(raw_assets), 10)
        declared_names = set()
        for asset in raw_assets:
            relative = asset.get("file") or asset.get("path")
            self.assertIsInstance(relative, str)
            declared_names.add(Path(relative).name)
            if asset.get("sha256"):
                self.assertEqual(
                    hashlib.sha256((image_dir / Path(relative).name).read_bytes()).hexdigest(),
                    asset["sha256"],
                )
            self.assertFalse(asset.get("patientData", False))
        self.assertEqual(declared_names, IMAGE_NAMES)

    def test_home_manifests_navigation_topics_graph_and_cache_are_integrated(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        navigation = load_json("data/navigation.json")
        topics = load_json("data/topics.json")
        manifest = load_json("data/site_manifest.json")
        public_manifest = load_json("public_site/data/site_manifest.json")
        graph = load_json("data/connections.json")
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")

        self.assertIn(f'href="{ROUTE}"', home)
        self.assertTrue(any(item.get("url") == ROUTE for item in navigation["main"]))
        topic_ids = {item["id"] for item in topics}
        for topic_id in (
            "semiologia-neurologica-topografica",
            "neuro-radar-topografico",
            "neuro-exame-completo-osce",
            "neuro-afasias",
            "neuro-face-central-periferica",
            "neuro-atlas-topografico",
            "neuro-casos-topograficos",
        ):
            self.assertIn(topic_id, topic_ids)

        self.assertEqual(
            manifest["canonicalRoutes"]["semiologia_neurologica_topografica"],
            ROUTE,
        )
        self.assertEqual(
            manifest["dataSources"]["semiologiaNeurologicaManifest"],
            f"{RELATIVE.as_posix()}/module.manifest.json",
        )
        self.assertTrue(any(item.get("path") == ROUTE for item in manifest["modules"]))
        self.assertEqual(manifest, public_manifest)

        node_ids = {node["id"] for node in graph["nodes"]}
        self.assertIn("semiologia-neurologica-topografica", node_ids)
        edges = {(edge["from"], edge["to"]) for edge in graph["edges"]}
        self.assertIn(("home", "semiologia-neurologica-topografica"), edges)
        self.assertIn(("semiologia-neurologica-topografica", "avc-agudo"), edges)
        self.assertIn(("semiologia-neurologica-topografica", "banco-temi"), edges)

        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v31`', worker)
        for core in (
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "assets/theme-bootstrap.js",
            "data/content.js",
            "data/visual-assets.json",
            "module.manifest.json",
        ):
            self.assertIn(f'"./{RELATIVE.as_posix()}/{core}"', worker)
        self.assertNotIn(
            f'"./{RELATIVE.as_posix()}/assets/images/',
            worker,
        )

    def test_editorial_registry_records_preview_without_claiming_formal_review(self) -> None:
        registry = load_json("data/editorial/registry.json")
        releases = {
            item["id"]: item
            for item in registry["items"]
            if item["id"].startswith("release-semiologia-neurologica-")
        }
        self.assertEqual(
            set(releases),
            {
                "release-semiologia-neurologica-topografica-public-preview-2026-09-05",
                "release-semiologia-neurologica-atlas-public-preview-2026-09-05",
            },
        )
        for release in releases.values():
            self.assertEqual(release["classification"], "public-cited")
            self.assertTrue(release["ownerApproval"])
            self.assertTrue(release["medical"])
            self.assertEqual(release["professionalClaims"], [])
            self.assertFalse(release["personalData"]["contains"])
            self.assertIn("pendente", release["clinicalReviewer"].casefold())
            self.assertTrue(release["sources"])
            self.assertTrue(all(source["url"].startswith("https://") for source in release["sources"]))

        module_release = releases[
            "release-semiologia-neurologica-topografica-public-preview-2026-09-05"
        ]
        atlas_release = releases[
            "release-semiologia-neurologica-atlas-public-preview-2026-09-05"
        ]
        self.assertIn(ROUTE, module_release["paths"])
        self.assertEqual(
            {Path(path).name for path in atlas_release["paths"] if path.endswith(".png")},
            IMAGE_NAMES,
        )

    def test_deploy_workflow_checks_core_and_exact_visual_count(self) -> None:
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(
            encoding="utf-8"
        )
        for core in (
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "data/content.js",
            "data/visual-assets.json",
            "module.manifest.json",
            "README.md",
        ):
            self.assertIn(f"site/{RELATIVE.as_posix()}/{core}", workflow)
        self.assertIn(
            f"find site/{RELATIVE.as_posix()}/assets/images",
            workflow,
        )
        self.assertIn('name \'*.png\' | wc -l)" -eq 10', workflow)


if __name__ == "__main__":
    unittest.main()
