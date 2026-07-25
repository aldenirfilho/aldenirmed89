#!/usr/bin/env python3
"""Contrato isolado da Visualização Clara do PWA RespiraSense."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense"


def relative_luminance(color: str) -> float:
    channels = [int(color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(foreground: str, background: str) -> float:
    lighter, darker = sorted(
        (relative_luminance(foreground), relative_luminance(background)),
        reverse=True,
    )
    return (lighter + 0.05) / (darker + 0.05)


class RespiraSenseClarityTests(unittest.TestCase):
    def test_head_bootstrap_prevents_dark_flash_and_contrast_wins(self) -> None:
        source = (MODULE / "index.html").read_text(encoding="utf-8")
        self.assertIn('localStorage.getItem("antigravity:a11y:v1")', source)
        self.assertIn("savedPrefs.contrast === true", source)
        self.assertIn('savedPrefs.theme === "system"', source)
        self.assertIn('content = "#000000"', source)
        self.assertIn('content = "#ffffff"', source)
        self.assertLess(
            source.index("Aplica a preferência global antes da primeira pintura"),
            source.index('<link rel="stylesheet" href="styles.css"'),
        )

    def test_control_persists_and_synchronizes_the_global_preference(self) -> None:
        index = (MODULE / "index.html").read_text(encoding="utf-8")
        controller = (MODULE / "pwa.js").read_text(encoding="utf-8")
        self.assertRegex(
            index,
            r'id="btnClarity"[^>]+aria-pressed="false"[^>]+aria-label="Ativar visualização clara',
        )
        self.assertIn('const A11Y_KEY = "antigravity:a11y:v1"', controller)
        self.assertIn(
            "clarityEnabled(a11yPrefs)",
            controller,
        )
        self.assertIn('a11yPrefs.theme = a11yPrefs.clarity ? "light" : "dark"', controller)
        self.assertIn("if (a11yPrefs.clarity) a11yPrefs.contrast = false", controller)
        self.assertIn("localStorage.setItem(A11Y_KEY, JSON.stringify(a11yPrefs))", controller)
        self.assertIn('window.addEventListener("storage"', controller)
        self.assertIn("applyClarity({ persist: false })", controller)
        self.assertIn('if (a11yPrefs.theme === "system") applyClarity({ persist: false })', controller)
        self.assertIn('"🌙 Modo espacial escuro"', controller)

    def test_light_palette_meets_wcag_aa_and_keeps_print_clear(self) -> None:
        styles = (MODULE / "styles.css").read_text(encoding="utf-8")
        for token, color in {
            "--text": "#102a43",
            "--muted": "#536b7d",
            "--accent": "#006b7d",
            "--green": "#087a55",
            "--yellow": "#855400",
            "--red": "#b4233f",
            "--purple": "#5946c7",
        }.items():
            self.assertIn(f"{token}:{color}", styles)
            self.assertGreaterEqual(contrast_ratio(color, "#ffffff"), 4.5)
        self.assertIn("--control-border:#71869a", styles)
        self.assertGreaterEqual(contrast_ratio("#71869a", "#ffffff"), 3)
        self.assertIn("--chart-grid:#71869a", styles)
        self.assertIn("html.a11y-light body{background:#fff", styles)
        self.assertIn("@media print", styles)
        self.assertIn("html.print-light", styles)
        self.assertIn("background:#fff!important", styles)
        self.assertIn(".eyebrow,.metric em{color:var(--accent)!important;}", styles)
        self.assertIn(".warning-box p{color:#7f1d1d!important;}", styles)
        self.assertNotRegex(styles, r"(?<![-\w])filter\s*:")

    def test_canvas_and_offline_cache_follow_the_theme_release(self) -> None:
        index = (MODULE / "index.html").read_text(encoding="utf-8")
        app = (MODULE / "app.js").read_text(encoding="utf-8")
        worker = (MODULE / "sw.js").read_text(encoding="utf-8")
        self.assertEqual(index.count('role="img" aria-label="Curva'), 3)
        self.assertIn('canvas.setAttribute("aria-label"', app)
        for token in ("--chart-grid", "--chart-line", "--chart-text", "--chart-muted"):
            self.assertIn(f'getPropertyValue("{token}")', app)
        self.assertIn(
            "dpr=Math.max(1,Number(window.devicePixelRatio)||1)",
            app,
        )
        self.assertIn("cssWidth=Math.max(1,canvas.clientWidth)", app)
        self.assertIn("cssHeight=Math.max(1,canvas.clientHeight)", app)
        self.assertIn("ctx.setTransform(dpr,0,0,dpr,0,0)", app)
        self.assertNotIn("W/devicePixelRatio", app)
        controller = (MODULE / "pwa.js").read_text(encoding="utf-8")
        self.assertIn('window.addEventListener("beforeprint"', controller)
        self.assertIn('window.addEventListener("afterprint"', controller)
        self.assertIn('classList.add("print-light")', controller)
        self.assertIn('classList.remove("print-light")', controller)
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v3.2.0`', worker)
        self.assertIn('event.request.headers.has("range")', worker)
        self.assertIn("event.respondWith(fetch(event.request))", worker)
        for asset in ("./index.html", "./styles.css", "./app.js", "./pwa.js"):
            self.assertIn(f'"{asset}"', worker)

    def test_tabs_expose_state_panels_and_keyboard_navigation(self) -> None:
        index = (MODULE / "index.html").read_text(encoding="utf-8")
        app = (MODULE / "app.js").read_text(encoding="utf-8")
        self.assertEqual(index.count('role="tab"'), 8)
        self.assertEqual(index.count('role="tabpanel"'), 8)
        self.assertEqual(index.count('aria-controls="tab-'), 8)
        self.assertEqual(index.count('aria-labelledby="tab-button-'), 8)
        self.assertIn('aria-selected="true"', index)
        self.assertIn('aria-selected="false"', index)
        self.assertIn("function activateTab(button", app)
        self.assertIn('tab.setAttribute("aria-selected"', app)
        self.assertIn("panel.hidden=!active", app)
        for key in ("ArrowRight", "ArrowLeft", "Home", "End"):
            self.assertIn(f'event.key==="{key}"', app)


if __name__ == "__main__":
    unittest.main()
