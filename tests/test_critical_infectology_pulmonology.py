import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CriticalModulesTests(unittest.TestCase):
    def test_catalogs_pass_shared_validator(self):
        result = subprocess.run(
            ["node", "tests/validate_clinical_catalogs.js"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Infectologia Crítica", result.stdout)
        self.assertIn("Pneumologia Crítica", result.stdout)

    def test_modules_are_local_private_and_accessible(self):
        shared = (ROOT / "01_Modulos_Clinicos/_shared_critical/assets/critical.js").read_text(encoding="utf-8")
        for module in ("Infectologia_Critica", "Pneumologia_Critica"):
            base = ROOT / "01_Modulos_Clinicos" / module
            manifest = json.loads((base / "module.manifest.json").read_text(encoding="utf-8"))
            html = (base / "index.html").read_text(encoding="utf-8")
            self.assertEqual(manifest["status"], "em-revisao-medica")
            self.assertFalse(manifest["privacy"]["network"])
            self.assertFalse(manifest["privacy"]["cloud"])
            self.assertFalse(manifest["privacy"]["telemetry"])
            self.assertFalse(manifest["privacy"]["patientData"])
            self.assertIn("connect-src 'none'", html)
            self.assertIn('class="skip-link"', html)
            self.assertIn('id="moduleSafety"', html)
            self.assertIn("../_shared_critical/assets/critical.js", html)
        self.assertIn("localStorage", shared)
        self.assertIn("prefers-reduced-motion", (ROOT / "01_Modulos_Clinicos/_shared_critical/assets/critical.css").read_text(encoding="utf-8"))

    def test_home_previews_show_only_rotating_trios(self):
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('href="mnemonicos/"', home)
        self.assertIn('href="desafios/"', home)
        self.assertGreaterEqual(home.count("function trio(items"), 2)
        self.assertGreaterEqual(home.count("length:3"), 2)
        self.assertIn("setInterval(()=>move(1),25000)", home)
        self.assertNotIn('id="mnemSearch"', home)
        self.assertNotIn('id="mnemFilters"', home)

    def test_mnemonic_full_page_is_available(self):
        html = (ROOT / "mnemonicos/index.html").read_text(encoding="utf-8")
        app = (ROOT / "mnemonicos/app.js").read_text(encoding="utf-8")
        self.assertIn("../data/mnemonicos.json", app)
        self.assertIn('id="trainMode"', html)
        self.assertIn('id="search"', html)
        self.assertIn("showModal", app)

    def test_manifests_and_graph_route_to_new_modules(self):
        site = json.loads((ROOT / "data/site_manifest.json").read_text(encoding="utf-8"))
        home = json.loads((ROOT / "06_Infra_Site_E_Assets/data/home-manifest.json").read_text(encoding="utf-8"))
        graph = json.loads((ROOT / "data/connections.json").read_text(encoding="utf-8"))
        routes = site["canonicalRoutes"]
        self.assertEqual(routes["infectologia_critica"], "01_Modulos_Clinicos/Infectologia_Critica/index.html")
        self.assertEqual(routes["pneumologia_critica"], "01_Modulos_Clinicos/Pneumologia_Critica/index.html")
        hrefs = {item["href"] for item in home["mainLinks"]}
        self.assertIn("01_Modulos_Clinicos/Infectologia_Critica/", hrefs)
        self.assertIn("01_Modulos_Clinicos/Pneumologia_Critica/", hrefs)
        nodes = {node["id"]: node for node in graph["nodes"]}
        self.assertEqual(nodes["infectologia-uti"]["status"], "ativo")
        self.assertEqual(nodes["vm-sdra"]["status"], "ativo")
        self.assertNotEqual(nodes["infectologia-uti"]["url"], "#")
        self.assertNotEqual(nodes["vm-sdra"]["url"], "#")

    def test_radar_has_new_dated_edition_and_unique_ids(self):
        history = json.loads((ROOT / "15_Radar_Cientifico/data/radar-history.json").read_text(encoding="utf-8"))
        radar = (ROOT / "15_Radar_Cientifico/data/radar.js").read_text(encoding="utf-8")
        self.assertEqual(history["currentEditionId"], "2026-07-30")
        self.assertEqual(history["editions"][0]["scientificCount"], 3)
        for item_id in (
            "doi:10.1007/s00134-026-08361-1",
            "doi:10.1093/cid/ciae403",
            "pmid:41841715",
        ):
            self.assertIn(item_id, history["publishedIds"])
            self.assertIn(item_id, radar)
        self.assertEqual(len(history["publishedIds"]), len(set(history["publishedIds"])))
        self.assertIn('editionId:"2026-07-30"', radar)
        self.assertIn('audit:{reviewStatus:"pending"', radar)

    def test_no_obvious_identifiable_patient_data(self):
        paths = [
            ROOT / "01_Modulos_Clinicos/Infectologia_Critica/data/catalog.js",
            ROOT / "01_Modulos_Clinicos/Pneumologia_Critica/data/catalog.js",
        ]
        forbidden = re.compile(r"\b(?:CPF|prontu[aá]rio|telefone|e-mail do paciente)\b", re.IGNORECASE)
        for path in paths:
            self.assertIsNone(forbidden.search(path.read_text(encoding="utf-8")), path)

    def test_pulmonology_has_safe_rapid_dpoc_ventilation_block(self):
        catalog = (ROOT / "01_Modulos_Clinicos/Pneumologia_Critica/data/catalog.js").read_text(encoding="utf-8")
        required_clinical_markers = (
            'moduleVersion: "1.1.0"',
            "PaCO₂ alta isolada pode ser basal",
            "SpO₂ geralmente 88–92%",
            "pH ≤7,35",
            "Resposta clínica em 30–60 min",
            "6–8 mL/kg de peso predito",
            "10–15/min",
            "I:E ≥1:3",
            "Fluxo expiratório não retorna a zero",
            "dose exige validação local",
            "42371750",
            "26976648",
            "37225653",
            "38085854",
        )
        for marker in required_clinical_markers:
            self.assertIn(marker, catalog)
        self.assertNotIn("carbonarcose", catalog.casefold())


if __name__ == "__main__":
    unittest.main()
