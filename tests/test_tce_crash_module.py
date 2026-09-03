#!/usr/bin/env python3
"""Contratos clínicos, editoriais e técnicos do módulo TCE grave CRASH."""

from __future__ import annotations

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


class TceCrashModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.catalog = (MODULE / "data/catalog.js").read_text(encoding="utf-8")
        cls.checklist = (MODULE / "CHECKLIST_OPERACIONAL.md").read_text(
            encoding="utf-8"
        )

    def test_required_files_and_public_preview_gate(self) -> None:
        for relative in (
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "data/catalog.js",
            "module.manifest.json",
            "CHECKLIST_OPERACIONAL.md",
            "README.md",
        ):
            self.assertTrue((MODULE / relative).is_file(), relative)

        manifest = load_json(f"{RELATIVE.as_posix()}/module.manifest.json")
        self.assertEqual(manifest["status"], "em-revisao-medica")
        self.assertTrue(manifest["clinicalReviewRequired"])
        self.assertEqual(manifest["publication"]["mode"], "public-preview")
        self.assertTrue(manifest["publication"]["clinicalReviewOngoing"])
        self.assertFalse(manifest["privacy"]["networkRuntime"])
        self.assertFalse(manifest["privacy"]["telemetry"])
        self.assertFalse(manifest["privacy"]["patientData"])
        self.assertIn("review-strip", self.html)
        self.assertIn("Revisão médica obrigatória", self.html)

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
            "o subgrupo grave não demonstrou benefício",
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
        self.assertGreaterEqual(self.html.count('<li><a href="https://'), 17)
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

    def test_editorial_registry_covers_new_public_medical_files(self) -> None:
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


if __name__ == "__main__":
    unittest.main()
