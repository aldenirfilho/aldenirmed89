#!/usr/bin/env python3
"""Contratos clínicos, editoriais e técnicos do módulo AVC agudo — Turbo TEMI (edição 1.1)."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/AVC_Turbo_TEMI")
MODULE = ROOT / RELATIVE
ROUTE = f"{RELATIVE.as_posix()}/index.html"
CANONICAL_MD = ROOT / "01_UpDown_Hub/content/intensiva/avc-agudo-turbo-temi.md"
AUDIT_DOC = ROOT / "docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md"
PREFERENCE_KEY = "antigravity:a11y:v1"


def load_json(relative: str) -> dict | list:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def local_references(html: str) -> list[str]:
    refs = re.findall(r'(?:src|href)="(?!https?:|data:|mailto:|#)([^"#?]+)"', html)
    return [ref for ref in refs if ref]


class AvcTurboTemiModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/style.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.manifest = load_json(f"{RELATIVE.as_posix()}/module.manifest.json")
        cls.visuals = load_json(f"{RELATIVE.as_posix()}/data/visual-assets.json")
        cls.files = sorted(
            p.relative_to(ROOT).as_posix() for p in MODULE.rglob("*") if p.is_file()
        )

    # ------------------------------------------------------------- publicação
    def test_required_files_and_review_gate(self) -> None:
        for relative in (
            "index.html",
            "assets/style.css",
            "assets/app.js",
            "assets/data.js",
            "assets/nihss.js",
            "assets/tools.js",
            "data/visual-assets.json",
            "module.manifest.json",
            "manifest.webmanifest",
            "CHECKLIST_OPERACIONAL.md",
            "README.md",
        ):
            self.assertTrue((MODULE / relative).is_file(), relative)

        manifest = self.manifest
        self.assertEqual(manifest["id"], "avc-turbo-temi")
        self.assertEqual(manifest["href"], ROUTE)
        self.assertEqual(manifest["status"], "em-revisao-medica")
        self.assertTrue(manifest["clinicalReviewRequired"])
        self.assertEqual(manifest["publication"]["mode"], "public-preview")
        self.assertTrue(manifest["publication"]["publicPreview"])
        self.assertTrue(manifest["publication"]["clinicalReviewOngoing"])
        self.assertIn("previewReason", manifest["publication"])
        self.assertFalse(manifest["privacy"]["networkRuntime"])
        self.assertFalse(manifest["privacy"]["telemetry"])
        self.assertFalse(manifest["privacy"]["patientData"])
        self.assertFalse(manifest["audit"]["isClinicalCertification"])
        self.assertIn("review-strip", self.html)
        self.assertIn("Revisão médica em andamento", self.html)
        self.assertIn("Edição 1.1", self.html)
        self.assertNotIn("não publicada", self.html)

    def test_safety_notices_remain_visible(self) -> None:
        for notice in (
            "não substitui equipe de AVC",
            "não é instrumento de certificação",
            "Sem envio de dados",
            "Prévia pública em revisão médica",
        ):
            self.assertIn(notice, self.html, notice)

    # -------------------------------------------------------------- integridade
    def test_no_remote_runtime_dependency(self) -> None:
        for match in re.finditer(r'(?:src|srcset)="([^"]+)"', self.html):
            self.assertFalse(match.group(1).startswith(("http:", "https:", "//")), match.group(1))
        self.assertNotIn('<script src="http', self.html)
        self.assertNotIn('<link rel="stylesheet" href="http', self.html)
        self.assertNotIn("@import", self.css)
        for relative in self.files:
            if relative.endswith((".js", ".css")):
                text = (ROOT / relative).read_text(encoding="utf-8")
                self.assertNotIn("https://", text, relative)
                self.assertNotIn("http://", text, relative)
        self.assertNotIn("avc-theme", self.app)

    def test_every_local_reference_exists(self) -> None:
        refs = local_references(self.html)
        self.assertGreater(len(refs), 40)
        for ref in refs:
            self.assertTrue((MODULE / ref).resolve().exists(), ref)
        for ref in ("../../index.html", "../AVC_Agudo/avc.html"):
            self.assertIn(f'href="{ref}', self.html)
        self.assertGreaterEqual(len(re.findall(r'href="https://[^"]+"', self.html)), 54)

    def test_figures_are_light_hashed_and_described(self) -> None:
        webps = sorted(p for p in (MODULE / "assets/images").glob("*.webp"))
        self.assertEqual(len(webps), 20)
        self.assertTrue((MODULE / "assets/images/21_compartimentos_vetor.svg").is_file())
        self.assertEqual(list((MODULE / "assets/images").glob("*.png")), [])
        ledger = {item["file"]: item for item in self.visuals["images"]}
        self.assertEqual(len(ledger), 20)
        self.assertEqual(self.visuals["count"], 21)
        self.assertEqual(self.visuals["auditSummary"]["pendingRegeneration"], [3, 6, 13])
        for path in webps:
            item = ledger[path.name]
            self.assertLess(path.stat().st_size, 400_000, path.name)
            self.assertEqual(path.stat().st_size, item["servedBytes"], path.name)
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), item["servedSha256"])
            self.assertTrue(item["synthetic"])
            self.assertFalse(item["diagnosticUse"])
            tag = re.search(rf'<img src="assets/images/{re.escape(path.name)}"[^>]*>', self.html)
            self.assertIsNotNone(tag, path.name)
            markup = tag.group(0)
            self.assertIn('loading="lazy"', markup)
            self.assertIn('decoding="async"', markup)
            self.assertIn("gerada por IA", markup)
            self.assertIn('width="1280"', markup)

    # ---------------------------------------------------------- tema do portal
    def test_shared_clarity_contract(self) -> None:
        self.assertIn(PREFERENCE_KEY, self.html)
        self.assertIn(PREFERENCE_KEY, self.app)
        button = re.search(r'<button\b[^>]*id="theme-toggle"[^>]*>', self.html)
        self.assertIsNotNone(button)
        self.assertIn('aria-label="Ativar visualização clara"', button.group(0))
        self.assertIn('aria-pressed="false"', button.group(0))
        self.assertIn("prefers-color-scheme: light", self.app)
        self.assertRegex(self.app, r"\.theme\s*===?\s*['\"]system['\"]")
        self.assertIn("html.a11y-large-text", self.css)
        self.assertIn("html.a11y-contrast", self.css)
        self.assertIn("html.a11y-reduce-motion", self.css)
        self.assertIn("@media print", self.css)
        self.assertRegex(self.css, r"background\s*:\s*#fff\b")

    # ----------------------------------------------------- calculadoras (Node)
    @unittest.skipUnless(shutil.which("node"), "node ausente")
    def test_scoring_contracts_in_node(self) -> None:
        script = r"""
        const nihss = require(process.argv[1]);
        const tools = require(process.argv[2]);
        const out = {};
        out.items = nihss.items.length;
        out.emptyTotal = nihss.assess({}).total;
        const normal = Object.fromEntries(nihss.items.map((i) => [i.id, '0']));
        out.normalTotal = nihss.assess(normal).total;
        const withUn = { ...normal, '7': 'UN' };
        const r = nihss.assess(withUn);
        out.unTotal = r.total;
        out.unSubtotal = r.subtotal;
        out.coma = nihss.assess({ ...normal, '1a': '3', '1b': '0' }).errors.length;
        out.abc2 = tools.abc2(4, 3, 3).volume;
        out.wfns = tools.wfns(14, 'no').grade;
        out.ich = tools.ichScore({ gcs: 15, volume: 10, age80: 'no', infratentorial: 'no', ivh: 'no' }).text;
        console.log(JSON.stringify(out));
        """
        result = subprocess.run(
            ["node", "-e", script, str(MODULE / "assets/nihss.js"), str(MODULE / "assets/tools.js")],
            capture_output=True,
            text=True,
            check=True,
        )
        out = json.loads(result.stdout)
        self.assertEqual(out["items"], 15)
        self.assertIsNone(out["emptyTotal"], "exame vazio não pode somar")
        self.assertEqual(out["normalTotal"], 0)
        self.assertIsNone(out["unTotal"], "UN não vira zero nem fecha total")
        self.assertEqual(out["unSubtotal"], 0)
        self.assertGreater(out["coma"], 0, "coma exige alerta de coerência")
        self.assertEqual(out["abc2"], 18)
        self.assertEqual(out["wfns"], "II")
        self.assertIn("futilidade", out["ich"])

    # ------------------------------------------------------- integração no site
    def test_home_navigation_and_offline_shell(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertRegex(
            home,
            rf'<a id="avc-turbo-temi" class="module-card[^"]*" href="{re.escape(ROUTE)}"',
        )
        self.assertGreaterEqual(home.count(ROUTE), 4)
        sw = (ROOT / "sw.js").read_text(encoding="utf-8")
        warm = re.findall(rf'"\./({re.escape(RELATIVE.as_posix())}/[^"?]+)', sw)
        self.assertGreaterEqual(len(warm), 8)
        for relative in warm:
            self.assertTrue((ROOT / relative).is_file(), relative)
        self.assertNotIn("v37`", sw)

    def test_manifests_topics_and_living_map(self) -> None:
        site_manifest = load_json("data/site_manifest.json")
        self.assertEqual(site_manifest["hubs"]["avc_turbo_temi"], ROUTE)
        self.assertEqual(site_manifest["canonicalRoutes"]["avc_turbo_temi"], ROUTE)
        self.assertEqual(
            site_manifest["dataSources"]["avcTurboTemiManifest"],
            f"{RELATIVE.as_posix()}/module.manifest.json",
        )
        self.assertTrue(any(m["id"] == "avc_turbo_temi" and m["path"] == ROUTE for m in site_manifest["modules"]))

        topics = {t["id"]: t for t in load_json("data/topics.json")}
        self.assertEqual(topics["avc-turbo-temi"]["url"], ROUTE)
        self.assertEqual(topics["avc-turbo-temi"]["status"], "em_revisao")
        for child in ("avc-turbo-nihss", "avc-turbo-hsa-escalas", "avc-turbo-complicacoes", "avc-turbo-farmacos", "avc-turbo-laboratorio"):
            self.assertEqual(topics[child]["parent"], "avc-turbo-temi")
            anchor = topics[child]["url"].split("#", 1)[1]
            self.assertIn(f'id="{anchor}"', self.html, anchor)

        connections = load_json("data/connections.json")
        nodes = {n["id"] for n in connections["nodes"]}
        self.assertIn("avc-turbo-temi", nodes)
        for edge in connections["edges"]:
            self.assertIn(edge["from"], nodes, edge)
            self.assertIn(edge["to"], nodes, edge)
        relations = {(e["from"], e["to"]) for e in connections["edges"]}
        self.assertIn(("home", "avc-turbo-temi"), relations)
        self.assertIn(("avc-agudo", "avc-turbo-temi"), relations)

        home_manifest = load_json("06_Infra_Site_E_Assets/data/home-manifest.json")
        self.assertTrue(any(l["href"] == f"{RELATIVE.as_posix()}/" for l in home_manifest["mainLinks"]))
        navigation = load_json("data/navigation.json")
        self.assertTrue(any(m["url"] == ROUTE for m in navigation["main"]))

    def test_canonical_markdown_and_audit_document(self) -> None:
        registry = load_json("01_UpDown_Hub/registry.json")
        doc = next(d for d in registry["documents"] if d["id"] == "updown-011-avc-agudo-turbo-temi")
        self.assertEqual(doc["status"], "em_revisao")
        self.assertTrue((ROOT / "01_UpDown_Hub" / doc["path"]).is_file())
        text = CANONICAL_MD.read_text(encoding="utf-8")
        self.assertTrue(text.startswith("---\n"))
        self.assertIn('status: "em_revisao"', text)
        self.assertNotIn("{{", text)
        self.assertIn("Prévia pública em revisão médica", text)
        for link in set(re.findall(r"\]\((\.\./[^)#?]+)", text)):
            self.assertTrue((CANONICAL_MD.parent / link).resolve().exists(), link)
        self.assertTrue(AUDIT_DOC.is_file())
        audit = AUDIT_DOC.read_text(encoding="utf-8")
        self.assertIn("não é homologação clínica", audit)
        self.assertIn(self.manifest["audit"]["report"], ("docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md",))

    def test_every_module_file_is_registered_for_publication(self) -> None:
        registry = load_json("data/editorial/registry.json")
        item = next(i for i in registry["items"] if i["id"] == "release-avc-turbo-temi-public-preview-2026-09-11")
        self.assertEqual(item["classification"], "public-cited")
        self.assertTrue(item["medical"])
        self.assertTrue(item["ownerApproval"])
        self.assertGreaterEqual(len(item["sources"]), 54)
        registered = set(item["paths"])
        for relative in self.files:
            self.assertIn(relative, registered, relative)
        for relative in registered:
            self.assertTrue((ROOT / relative).is_file(), relative)
        self.assertIn(CANONICAL_MD.relative_to(ROOT).as_posix(), registered)
        self.assertIn(AUDIT_DOC.relative_to(ROOT).as_posix(), registered)

    def test_deploy_workflow_asserts_the_module(self) -> None:
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(encoding="utf-8")
        self.assertIn(f"test -s site/{RELATIVE.as_posix()}/index.html", workflow)
        self.assertIn(f"test -s site/{RELATIVE.as_posix()}/module.manifest.json", workflow)


if __name__ == "__main__":
    unittest.main()
