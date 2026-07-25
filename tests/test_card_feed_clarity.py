#!/usr/bin/env python3
"""Regressões da Visualização Clara global no Card Feed Médico."""

from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FEED = ROOT / "05_Midia_E_Feed"


def relative_luminance(color: str) -> float:
    channels = [int(color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(foreground: str, background: str) -> float:
    lighter, darker = sorted(
        (relative_luminance(foreground), relative_luminance(background)),
        reverse=True,
    )
    return (lighter + 0.05) / (darker + 0.05)


class CardFeedClarityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (FEED / "index.html").read_text(encoding="utf-8")

    def test_global_preference_bootstraps_before_styles_with_contrast_precedence(self) -> None:
        bootstrap = self.source[: self.source.index("<style>")]
        self.assertIn('localStorage.getItem("antigravity:a11y:v1")', bootstrap)
        self.assertIn(
            'savedPrefs.theme === "system"',
            bootstrap,
        )
        self.assertIn('classList.add("a11y-contrast")', bootstrap)
        self.assertIn('content = "#000000"', bootstrap)
        self.assertIn('classList.add("a11y-light")', bootstrap)
        self.assertIn('content = "#ffffff"', bootstrap)

    def test_accessible_toggle_persists_syncs_and_updates_browser_chrome(self) -> None:
        for marker in (
            'id="btnClarity"',
            'aria-pressed="false"',
            'aria-label="Ativar visualização clara com fundo branco"',
            'const A11Y_PREFERENCES_KEY = "antigravity:a11y:v1"',
            'clarityPreferenceEnabled(a11yPreferences)',
            'a11yPreferences.theme = a11yPreferences.clarity ? "light" : "dark"',
            'classList.toggle("a11y-contrast", contrastActive)',
            'if (a11yPreferences.clarity) a11yPreferences.contrast = false',
            'writeStorage(A11Y_PREFERENCES_KEY, JSON.stringify(a11yPreferences))',
            'window.addEventListener("storage", handleA11yStorage)',
            "themeColorMeta?.setAttribute(",
            'appleStatusMeta?.setAttribute("content"',
        ):
            self.assertIn(marker, self.source)

    def test_theme_sync_is_registered_before_async_loading_with_legacy_fallback(self) -> None:
        storage_registration = 'window.addEventListener("storage", handleA11yStorage)'
        self.assertEqual(self.source.count(storage_registration), 1)
        self.assertLess(
            self.source.index(storage_registration),
            self.source.index("async function main()"),
        )
        wire_source = self.source[
            self.source.index("function wire()")
            : self.source.index("async function main()")
        ]
        self.assertNotIn(storage_registration, wire_source)

        self.assertIn("function handleFeedSystemThemeChange()", self.source)
        self.assertIn(
            'if (typeof feedSystemTheme.addEventListener === "function")',
            self.source,
        )
        self.assertIn(
            'feedSystemTheme.addEventListener("change", handleFeedSystemThemeChange)',
            self.source,
        )
        self.assertIn(
            '} else if (typeof feedSystemTheme.addListener === "function")',
            self.source,
        )
        self.assertIn(
            "feedSystemTheme.addListener(handleFeedSystemThemeChange)",
            self.source,
        )

    def test_light_palette_changes_ui_without_filtering_card_images(self) -> None:
        light_css = self.source[
            self.source.index("/* Visualização clara:")
            : self.source.index("@media print")
        ]
        for marker in (
            "html.a11y-light body",
            "html.a11y-light .topbar",
            "html.a11y-light .card",
            "html.a11y-light .imgbox",
            "html.a11y-light dialog",
            "html.a11y-light .clinical-notice",
        ):
            self.assertIn(marker, light_css)
        self.assertNotIn("filter:", light_css)
        self.assertNotIn("invert(", light_css)
        self.assertIn("html.a11y-light .btn { border-color: #71869a; }", light_css)
        self.assertIn("border-color: #71869a;", light_css)
        self.assertIn("outline-color: #855400;", self.source)
        self.assertIn(
            ".topbar, .toolbar, .theme-strip, .floating, dialog, .install-hint, .feed-progress",
            self.source.replace("\n      ", " "),
        )
        print_css = self.source[self.source.index("@media print") :]
        self.assertIn("html, html.a11y-light, html.a11y-contrast", print_css)
        self.assertIn(".glass, .metric, .card, .help-box", print_css)
        self.assertIn(".empty strong, .study-prompt, .study-prompt strong", print_css)
        self.assertIn(".study-evaluation, .study-evaluation strong, .clinical-notice", print_css)
        self.assertIn("background: #fff !important", print_css)

    def test_light_palette_meets_wcag_contrast_contract(self) -> None:
        for token, color in {
            "--text": "#102a43",
            "--muted": "#526779",
            "--accent": "#006b7d",
            "--accent2": "#5946c7",
            "--gold": "#855400",
            "--green": "#087a55",
            "--danger": "#b4233f",
        }.items():
            self.assertIn(f"{token}: {color}", self.source)
            self.assertGreaterEqual(contrast_ratio(color, "#ffffff"), 4.5)
        self.assertGreaterEqual(contrast_ratio("#71869a", "#ffffff"), 3)

    def test_service_worker_cache_is_bumped_and_old_versions_are_cleaned(self) -> None:
        service_worker = (FEED / "sw.js").read_text(encoding="utf-8")
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v6`', service_worker)
        self.assertIn('event.request.headers.has("range")', service_worker)
        self.assertIn("event.respondWith(fetch(event.request))", service_worker)
        self.assertIn("k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME", service_worker)
        self.assertIn(".then(() => self.skipWaiting())", service_worker)
        self.assertIn(".then(() => self.clients.claim())", service_worker)
        self.assertNotIn(".catch(() => null)", service_worker)


if __name__ == "__main__":
    unittest.main()
