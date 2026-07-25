#!/usr/bin/env python3
"""Contratos clínicos, visuais e operacionais do módulo Delirium."""

from __future__ import annotations

import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "01_Modulos_Clinicos/Delirium_UTI"


def load_json(relative: str) -> dict:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def relative_luminance(color: str) -> float:
    channels = [
        int(color.lstrip("#")[offset : offset + 2], 16) / 255
        for offset in (0, 2, 4)
    ]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str = "#ffffff") -> float:
    lighter = max(relative_luminance(first), relative_luminance(second))
    darker = min(relative_luminance(first), relative_luminance(second))
    return (lighter + 0.05) / (darker + 0.05)


class DeliriumModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.catalog = (MODULE / "data/catalog.js").read_text(encoding="utf-8")
        cls.checklist = (MODULE / "CHECKLIST_OPERACIONAL.md").read_text(
            encoding="utf-8"
        )
        cls.source = (
            ROOT / "01_UpDown_Hub/content/intensiva/delirium-uti-enfermaria.md"
        ).read_text(encoding="utf-8")

    def test_required_files_manifest_and_public_preview_gate(self) -> None:
        for relative in (
            "index.html",
            "assets/styles.css",
            "assets/theme-bootstrap.js",
            "assets/app.js",
            "data/catalog.js",
            "module.manifest.json",
            "CHECKLIST_OPERACIONAL.md",
            "README.md",
        ):
            self.assertTrue((MODULE / relative).is_file(), relative)

        manifest = load_json(
            "01_Modulos_Clinicos/Delirium_UTI/module.manifest.json"
        )
        self.assertEqual(manifest["status"], "em-revisao-medica")
        self.assertTrue(manifest["clinicalReviewRequired"])
        self.assertEqual(manifest["publication"]["mode"], "public-preview")
        self.assertTrue(manifest["publication"]["clinicalReviewOngoing"])
        self.assertFalse(manifest["privacy"]["networkRuntime"])
        self.assertFalse(manifest["privacy"]["telemetry"])
        self.assertFalse(manifest["privacy"]["patientData"])
        self.assertIn("review-strip", self.html)
        self.assertIn("Revisão médica obrigatória", self.html)
        self.assertEqual(manifest["version"], "1.1.0-rc.1")
        self.assertEqual(manifest["media"]["count"], 10)

    def test_csp_offline_privacy_and_no_inline_style_contract(self) -> None:
        policy_match = re.search(
            r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">',
            self.html,
        )
        self.assertIsNotNone(policy_match)
        policy = policy_match.group(1)
        self.assertIn("connect-src 'none'", policy)
        self.assertIn("object-src 'none'", policy)
        self.assertNotIn("'unsafe-inline'", policy)
        self.assertNotRegex(self.html, r"\sstyle=")
        self.assertNotIn("fetch(", self.app)
        self.assertNotIn("XMLHttpRequest", self.app)
        self.assertNotIn("sendBeacon", self.app)
        self.assertNotIn("WebSocket", self.app)
        self.assertNotRegex(
            self.app,
            r"localStorage\.setItem\([^)]*(?:cam|icdsc|fourat|rass)",
        )
        self.assertIn("antigravity:delirium:study:v1", self.app)

    def test_white_visualization_contrast_print_and_safari_contracts(self) -> None:
        for required in (
            'html[data-theme="light"]',
            "--bg: #ffffff",
            "--text: #102a43",
            "--soft: #334e68",
            "--muted: #526d82",
            "--line: #71869a",
            "overflow-x: hidden",
            "grid-template-columns: minmax(0, 1fr)",
            "-webkit-overflow-scrolling: touch",
            "env(safe-area-inset-bottom)",
            ":focus-visible",
            "@media (max-width: 760px)",
            "@media (prefers-reduced-motion: reduce)",
            "@media print",
            "background: #ffffff !important",
            ".learning-figure",
            ".scenario-tabs",
            ".restraint-tabs",
        ):
            self.assertIn(required, self.css)
        self.assertIn('data-default-theme="light"', self.html)
        self.assertIn('root.dataset.defaultTheme === "light"', self.app)
        for color in (
            "#102a43",
            "#334e68",
            "#526d82",
            "#006d80",
            "#155fb3",
            "#5946c7",
            "#087a55",
            "#7a4e00",
            "#9b3f10",
            "#b4233f",
        ):
            self.assertGreaterEqual(
                contrast_ratio(color),
                4.5,
                f"{color} não alcança contraste AA no branco",
            )
        self.assertIn("systemTheme.addEventListener", self.app)
        self.assertIn("systemTheme.addListener?.", self.app)

    def test_accessibility_and_keyboard_navigation_are_explicit(self) -> None:
        for required in (
            'class="skip-link"',
            'aria-controls="moduleNav"',
            'aria-label="Navegação do módulo"',
            'aria-live="polite"',
            'role="status"',
            'aria-pressed="false"',
            'tabindex="0"',
        ):
            self.assertIn(required, self.html)
        for required in (
            'event.key.toLowerCase() === "t"',
            'event.key.toLowerCase() === "f"',
            'event.key === "/"',
            'event.key === "Escape"',
            "scrollIntoView",
            'event.key === "ArrowRight"',
            'event.key === "Home"',
            'event.key === "End"',
            "initTabs",
        ):
            self.assertIn(required, self.app)

    def test_practical_scenarios_and_decision_support_are_explicit(self) -> None:
        for required in (
            "Quando pensar, rastrear e investigar?",
            'role="tablist" aria-label="Escolher cenário assistencial"',
            "Na chegada e em qualquer deterioração",
            "Em cada turno e após mudanças",
            "Na observação diária e nas transições",
            "Qual é o próximo movimento?",
            "Simulador de escalonamento",
            "Nada é salvo ou transmitido",
        ):
            self.assertIn(required, self.html)
        for required in (
            "runInvestigation",
            "runAgitation",
            "Não espere CAM-ICU, ICDSC ou 4AT",
            "RASS −4/−5 ou ausência de despertar",
            "Volte aos degraus 1–3",
        ):
            self.assertIn(required, self.app)

    def test_scales_have_correct_gates_thresholds_and_interpretation(self) -> None:
        for required in (
            "RASS −4/−5 = não avaliável",
            "1 + 2 + (3 ou 4)",
            "≥4: rastreio positivo",
            "4AT 0/12",
            "PRE-DELIRIC",
            "E-PRE-DELIRIC",
        ):
            self.assertIn(required, self.html)
        for required in (
            "if (rass <= -4)",
            "feature1 && feature2 && (feature3 || feature4)",
            "if (score >= 4)",
            'const ids = ["fourAlertness", "fourAmt", "fourAttention", "fourAcute"]',
            "4AT ${score}/12",
        ):
            self.assertIn(required, self.app)
        self.assertEqual(self.catalog.count("score:"), 10)
        for score in range(-5, 5):
            self.assertRegex(self.catalog, rf"score:\s*{score}\b")

    def test_clinical_safety_and_refractory_agitation_are_not_oversold(self) -> None:
        for required in (
            "Não existe “remédio do delirium” universal",
            "Não encurta delirium de rotina",
            "VM com delirium agitado impedindo desmame/extubação",
            "Abstinência de álcool/benzodiazepínico",
            "Parkinson e corpos de Lewy",
            "Contenção física",
            "Estado epiléptico não convulsivo",
            "ambiente monitorizado, via aérea preparada",
            "torsades",
            "reação paradoxal",
            "Atividade significativa e AVD graduadas",
        ):
            self.assertIn(required, self.html)
        for required in (
            "instrumento positivo apoia",
            "Não existe “painel de delirium” universal",
            "O hipoativo não é necessariamente mais leve",
        ):
            self.assertIn(required, self.source)

    def test_operational_checklists_are_complete_and_copyable(self) -> None:
        sessions = (
            "Sessão 1 — Emergência",
            "Sessão 2 — Avaliação na UTI",
            "Sessão 3 — Enfermaria",
            "Sessão 4 — Prevenção",
            "Sessão 5 — Agitação",
            "Sessão 6 — Contenção",
            "Sessão 7 — Passagem",
        )
        for session in sessions:
            self.assertIn(session, self.checklist)
        self.assertGreaterEqual(self.checklist.count("[ ]"), 35)
        self.assertIn("navigator.clipboard?.writeText", self.app)
        self.assertIn("document.execCommand", self.app)
        self.assertIn('button.textContent = "✅ Copiado"', self.app)

    def test_ten_turbo_temi_images_are_integrated_accessibly(self) -> None:
        images = sorted((MODULE / "assets/images").glob("*.png"))
        self.assertEqual(len(images), 10)
        self.assertTrue(all(image.stat().st_size > 500_000 for image in images))

        tags = re.findall(r"<img\b[\s\S]*?>", self.html)
        module_tags = [
            tag for tag in tags if 'src="assets/images/' in tag
        ]
        self.assertEqual(len(module_tags), 10)
        for tag in module_tags:
            self.assertRegex(tag, r'\balt="[^"]{20,}"')
            self.assertRegex(tag, r'\bwidth="\d+"')
            self.assertRegex(tag, r'\bheight="\d+"')
            self.assertIn('decoding="async"', tag)
        self.assertEqual(
            sum('loading="lazy"' in tag for tag in module_tags),
            9,
        )

        manifest = load_json(
            "01_Modulos_Clinicos/Delirium_UTI/module.manifest.json"
        )
        self.assertEqual(len(manifest["media"]["files"]), 10)
        for filename in manifest["media"]["files"]:
            self.assertTrue((MODULE / "assets/images" / filename).is_file())

    def test_restraint_evidence_monitoring_and_brazilian_governance(self) -> None:
        for required in (
            "Contenção física/mecânica: último recurso, não rotina",
            "único meio disponível",
            "supervisão direta do enfermeiro",
            "não fixa “15 minutos” como regra nacional",
            "Não há resposta automática por cargo",
            "responsabilidade médica é pessoal e não pode ser presumida",
            "não é parecer jurídico",
            "R2D2-ICU",
            "41,6%",
            "21.665",
        ):
            self.assertIn(required, self.html)
        for source in (
            "https://www.cofen.gov.br/resolucao-cofen-no-746-de-20-de-marco-de-2024/",
            "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15378.htm",
            "https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2018/2217",
            "https://pubmed.ncbi.nlm.nih.gov/40101313/",
            "https://jamanetwork.com/journals/jama/article-abstract/2846726",
        ):
            self.assertIn(source, self.catalog)
        self.assertNotIn("somente o médico responde", self.html.casefold())
        self.assertNotIn("somente o enfermeiro responde", self.html.casefold())

    def test_catalog_is_valid_javascript_and_has_learning_depth(self) -> None:
        for script in (
            MODULE / "assets/theme-bootstrap.js",
            MODULE / "assets/app.js",
            MODULE / "data/catalog.js",
        ):
            result = subprocess.run(
                ["node", "--check", str(script)],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)

        node = """
const fs=require("fs"),vm=require("vm");
const sandbox={window:{dispatchEvent(){}},document:{dispatchEvent(){}},CustomEvent:function(){}};
vm.runInNewContext(fs.readFileSync(process.argv[1],"utf8"),sandbox);
const d=sandbox.window.ANTIGRAVITY_DELIRIUM;
console.log(JSON.stringify({
  rass:d.rass.length,causes:d.causes.length,flashcards:d.flashcards.length,
  questions:d.questions.length,cases:d.cases.length,
  checklists:Object.keys(d.checklists).length,references:d.references.length
}));
"""
        result = subprocess.run(
            ["node", "-e", node, str(MODULE / "data/catalog.js")],
            check=True,
            capture_output=True,
            text=True,
        )
        counts = json.loads(result.stdout)
        self.assertEqual(counts["rass"], 10)
        self.assertGreaterEqual(counts["causes"], 8)
        self.assertGreaterEqual(counts["flashcards"], 15)
        self.assertGreaterEqual(counts["questions"], 13)
        self.assertGreaterEqual(counts["cases"], 7)
        self.assertEqual(counts["checklists"], 7)
        self.assertGreaterEqual(counts["references"], 17)

    def test_home_registry_manifest_graph_and_source_are_integrated(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn(
            'href="01_Modulos_Clinicos/Delirium_UTI/index.html"',
            home,
        )
        self.assertIn("CAM-ICU · 4AT", home)

        site_manifest = load_json("data/site_manifest.json")
        self.assertEqual(
            site_manifest["canonicalRoutes"]["delirium_uti"],
            "01_Modulos_Clinicos/Delirium_UTI/index.html",
        )
        self.assertEqual(
            site_manifest["dataSources"]["deliriumManifest"],
            "01_Modulos_Clinicos/Delirium_UTI/module.manifest.json",
        )

        registry = load_json("01_UpDown_Hub/registry.json")
        registry_ids = {item["id"] for item in registry["documents"]}
        self.assertIn("updown-009-delirium-uti-enfermaria", registry_ids)

        topics = load_json("data/topics.json")
        topic_ids = {item["id"] for item in topics}
        for topic_id in (
            "delirium-uti",
            "rass-cam-icu",
            "icdsc-4at",
            "delirium-prevencao",
            "delirium-agitacao",
        ):
            self.assertIn(topic_id, topic_ids)

        graph = load_json("data/connections.json")
        node_ids = {node["id"] for node in graph["nodes"]}
        self.assertIn("delirium-uti", node_ids)
        self.assertIn(
            ("home", "delirium-uti"),
            {(edge["from"], edge["to"]) for edge in graph["edges"]},
        )


if __name__ == "__main__":
    unittest.main()
