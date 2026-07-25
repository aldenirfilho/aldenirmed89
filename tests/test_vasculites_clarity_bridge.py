#!/usr/bin/env python3
"""Contrato da preferência global na família Vasculites Decision."""

from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "03_Calculadoras_E_Apps" / "vasculites-decision"
PAGES = [APP / "index.html", *sorted((APP / "pages").glob("*.html"))]


class VasculitesClarityBridgeTests(unittest.TestCase):
    def test_every_surface_bootstraps_and_exposes_an_accessible_toggle(self) -> None:
        for page in PAGES:
            source = page.read_text(encoding="utf-8")
            self.assertIn('meta name="theme-color"', source, page)
            self.assertIn("theme-bootstrap.js", source, page)
            self.assertIn("data-theme-toggle", source, page)
            self.assertIn('aria-pressed="false"', source, page)

    def test_global_preference_preserves_legacy_theme_and_syncs_tabs(self) -> None:
        bootstrap = (APP / "assets" / "theme-bootstrap.js").read_text(encoding="utf-8")
        controller = (APP / "assets" / "app.js").read_text(encoding="utf-8")
        for marker in (
            '"antigravity:a11y:v1"',
            'const contrast = saved.contrast === true',
            'localStorage.getItem("vasc-theme")',
            'contrast ? "contrast" : light ? "light" : "dark"',
        ):
            self.assertIn(marker, bootstrap)
        for marker in (
            "const a11yKey='antigravity:a11y:v1'",
            "clarityEnabled(a11yPrefs)",
            "a11yPrefs.theme=a11yPrefs.clarity?'light':'dark'",
            "if(a11yPrefs.clarity)a11yPrefs.contrast=false",
            "localStorage.setItem(a11yKey,JSON.stringify(a11yPrefs))",
            "window.addEventListener('storage'",
            "hasGlobal=serialized!==null",
            "contrast?'contrast':light?'light':'dark'",
            "systemTheme.addListener?.(syncVasculitesSystemTheme)",
        ):
            self.assertIn(marker, controller)

    def test_light_and_print_palettes_are_white_and_do_not_filter_content(self) -> None:
        styles = (APP / "assets" / "style.css").read_text(encoding="utf-8")
        self.assertIn('[data-theme="light"]{color-scheme:light;--bg:#fff', styles)
        self.assertIn('[data-theme="contrast"]{color-scheme:dark;--bg:#000', styles)
        self.assertIn("--line:#fff", styles)
        self.assertIn("--line:#71869a", styles)
        self.assertIn("@media print", styles)
        self.assertIn("background:#fff!important", styles)
        self.assertIn(":focus-visible{outline:3px solid var(--warn)", styles)
        self.assertIn(".dose{background:#eef5ff!important;color:#065f46!important}", styles)
        controller = (APP / "assets" / "app.js").read_text(encoding="utf-8")
        self.assertIn("setAttribute('aria-pressed'", controller)
        self.assertIn("setAttribute('aria-selected'", controller)
        self.assertNotIn("filter:invert", styles.replace(" ", ""))


if __name__ == "__main__":
    unittest.main()
