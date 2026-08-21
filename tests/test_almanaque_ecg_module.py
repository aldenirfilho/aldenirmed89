from __future__ import annotations

import hashlib
import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/Almanaque_ECG")
MODULE = ROOT / RELATIVE


def load_catalog() -> dict:
    source = (MODULE / "data/catalog.js").read_text(encoding="utf-8").strip()
    prefix = "window.ECG_ALMANAC ="
    if not source.startswith(prefix) or not source.endswith(";"):
        raise AssertionError("Catálogo ECG não segue o envelope JavaScript esperado")
    return json.loads(source[len(prefix) : -1].strip())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


class StrictHtmlParser(HTMLParser):
    def error(self, message: str) -> None:  # pragma: no cover
        raise AssertionError(message)


class AlmanaqueEcgModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.catalog = load_catalog()
        cls.manifest = json.loads(
            (MODULE / "data/visual-assets.json").read_text(encoding="utf-8")
        )
        cls.public_source = "\n".join(
            (cls.html, cls.css, cls.app, json.dumps(cls.catalog, ensure_ascii=False))
        )

    def test_core_files_exist_and_html_parses(self) -> None:
        for relative in (
            "index.html", "assets/styles.css", "assets/app.js", "data/catalog.js"
        ):
            with self.subTest(path=relative):
                path = MODULE / relative
                self.assertTrue(path.is_file())
                self.assertGreater(path.stat().st_size, 600)
        parser = StrictHtmlParser()
        parser.feed(self.html)
        parser.close()

    def test_exactly_thirty_unique_models_and_images(self) -> None:
        patterns = self.catalog["patterns"]
        self.assertEqual(len(patterns), 30)
        self.assertEqual(self.catalog["meta"]["patternCount"], 30)
        self.assertEqual(len({item["id"] for item in patterns}), 30)
        self.assertEqual(len({item["number"] for item in patterns}), 30)
        self.assertEqual(len({item["image"] for item in patterns}), 30)
        image_files = sorted((MODULE / "assets/images").glob("*.png"))
        self.assertEqual(len(image_files), 30)
        for pattern in patterns:
            with self.subTest(pattern=pattern["id"]):
                self.assertTrue((MODULE / pattern["image"]).is_file())
                self.assertIn(pattern["imageKind"], {"real", "sintetico"})
                self.assertGreater(len(pattern["imageAlt"]), 40)

    def test_visual_manifest_hashes_and_provenance_are_consistent(self) -> None:
        assets = self.manifest["assets"]
        self.assertEqual(len(assets), 30)
        self.assertEqual(self.manifest["stage"], "approved-for-integration")
        self.assertEqual(len({asset["sha256"] for asset in assets}), 30)
        for asset in assets:
            path = MODULE / "assets/images" / asset["file"]
            with self.subTest(file=asset["file"]):
                self.assertTrue(path.is_file())
                self.assertEqual(sha256(path), asset["sha256"])
                self.assertEqual(asset["status"], "approved-for-integration")
        real = [item for item in self.catalog["patterns"] if item["imageKind"] == "real"]
        self.assertEqual(len(real), 4)
        self.assertIn("PTB-XL", self.public_source)
        self.assertIn("CC BY 4.0", self.public_source)

    def test_requested_clinical_domains_are_covered(self) -> None:
        for marker in (
            "hipocalemia", "hipercalemia", "hipocalcemia", "hipercalcemia",
            "hipomagnesemia", "hipermagnesemia", "hipotermia", "Osborn",
            "cascata da isquemia", "repolarização", "Mobitz I", "Mobitz II",
            "BAVT", "bloqueio de ramo direito", "bloqueio de ramo esquerdo",
            "pericardite", "tamponamento", "TEP", "Wellens", "de Winter",
            "Sgarbossa", "fibrilação atrial", "flutter", "WPW", "Brugada",
            "marcapasso", "digoxina", "canal de sódio"
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker.casefold(), self.public_source.casefold())

    def test_each_pattern_has_operational_comparison_content(self) -> None:
        required = {
            "firstLook", "leads", "measure", "context", "findings", "mimics",
            "action", "prevention", "limits", "refs"
        }
        valid_refs = {item["id"] for item in self.catalog["references"]}
        for pattern in self.catalog["patterns"]:
            with self.subTest(pattern=pattern["id"]):
                self.assertTrue(required.issubset(pattern))
                for key in ("findings", "mimics", "action", "prevention", "limits"):
                    self.assertIsInstance(pattern[key], list)
                    self.assertTrue(pattern[key])
                self.assertTrue(set(pattern["refs"]).issubset(valid_refs))

    def test_search_filters_compare_and_deep_links_are_local(self) -> None:
        for marker in (
            "normalize(value)", "searchableText", "filteredPatterns",
            "data-category", "data-compare", "state.compare.length < 2",
            "#padrao=", "escapeHtml", "compareDialog", "aria-live=\"polite\""
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.public_source)
        self.assertNotIn("fetch(", self.app)
        self.assertNotIn("XMLHttpRequest", self.app)
        self.assertNotIn("sessionStorage", self.app)

    def test_safety_privacy_and_dose_boundary_are_explicit(self) -> None:
        for marker in (
            "Não substitui avaliação cardiológica",
            "protocolo institucional",
            "não fornecem escolha, dose, diluição ou esquema farmacológico",
            "Não inserir dados identificáveis de pacientes",
            "connect-src 'none'",
            "não recebe, envia ou analisa exames",
            "traçados sintéticos"
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker.casefold(), self.public_source.casefold())
        blocked = (
            "source_thread_id", "Rua Raimunda", "CRM 16587", "token=",
            "api_key", "deploymentId", "TAF###", "HOM###"
        )
        for marker in blocked:
            self.assertNotIn(marker.casefold(), self.public_source.casefold())
        dose_pattern = re.compile(
            r"\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|g)(?:/kg|/min|/h)?\b",
            flags=re.IGNORECASE,
        )
        self.assertIsNone(dose_pattern.search(self.public_source))

    def test_references_are_https_and_current_core_guidelines_are_present(self) -> None:
        references = self.catalog["references"]
        self.assertGreaterEqual(len(references), 12)
        urls = [item["url"] for item in references]
        self.assertTrue(all(url.startswith("https://") for url in urls))
        self.assertEqual(len(urls), len(set(urls)))
        self.assertTrue(any(item["year"] == 2025 and "ACC" in item["organization"] for item in references))
        self.assertTrue(any("cpr.heart.org" in url for url in urls))
        self.assertTrue(any("physionet.org" in url for url in urls))

    def test_accessibility_responsiveness_and_print_are_present(self) -> None:
        for marker in (
            'class="skip-link"', 'role="search"', 'aria-live="polite"',
            'aria-pressed="false"', "@media (max-width: 720px)",
            "@media (prefers-reduced-motion: reduce)", "@media print",
            "antigravity:a11y:v1", "dialog", "loading=\"lazy\""
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.public_source)

    def test_portal_integration_cache_and_public_boundary(self) -> None:
        expected = (RELATIVE / "index.html").as_posix()
        site_manifest = json.loads((ROOT / "data/site_manifest.json").read_text())
        navigation = json.loads((ROOT / "data/navigation.json").read_text())
        home_manifest = json.loads(
            (ROOT / "06_Infra_Site_E_Assets/data/home-manifest.json").read_text()
        )
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        sca = (
            ROOT / "01_Modulos_Clinicos/Sindrome_Coronariana_Aguda/index.html"
        ).read_text(encoding="utf-8")
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text()
        builder = (ROOT / "scripts_admin/build_public_site.py").read_text()
        self.assertEqual(site_manifest["canonicalRoutes"]["almanaque_ecg"], expected)
        self.assertTrue(any(item["url"] == expected for item in navigation["main"]))
        self.assertTrue(any(item["href"] == RELATIVE.as_posix() + "/" for item in home_manifest["mainLinks"]))
        self.assertIn(expected, home)
        self.assertIn("../Almanaque_ECG/index.html", sca)
        self.assertIn("./" + expected, worker)
        self.assertIn("site/" + expected, workflow)
        self.assertIn((RELATIVE / "module.manifest.json").as_posix(), builder)
        self.assertIn((RELATIVE / "data/visual-assets.json").as_posix(), builder)


if __name__ == "__main__":
    unittest.main()
