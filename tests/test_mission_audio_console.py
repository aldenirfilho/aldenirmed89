#!/usr/bin/env python3
"""Contrato estático do console sonoro local da home Antigravity."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
ENGINE = HOME[
    HOME.index("/* ── CONSOLE SONORO · WEB AUDIO LOCAL"):
    HOME.index("/* ── PORTAL DE MISSÃO · 10 SEGUNDOS")
]


class MissionAudioConsoleTests(unittest.TestCase):
    def test_command_cluster_is_extensible_and_fixed_to_upper_right(self) -> None:
        for marker in (
            'class="corner-command-cluster" id="cornerCommandCluster"',
            'class="sound-console" id="soundConsole"',
            ".corner-command-cluster > *{pointer-events:auto}",
            "top:calc(76px + env(safe-area-inset-top))",
            "justify-content:flex-end",
        ):
            self.assertIn(marker, HOME)

    def test_authorial_true_wireless_icon_has_no_brand_dependency(self) -> None:
        for marker in (
            'class="sound-buds-icon"',
            'class="bud-accent"',
            'viewBox="0 0 52 40"',
            'aria-label="Abrir console sonoro"',
        ):
            self.assertIn(marker, HOME)
        self.assertNotIn("airpods", HOME.casefold())
        self.assertNotIn("apple.com", ENGINE.casefold())

    def test_volume_mute_and_selection_are_persistent(self) -> None:
        for marker in (
            "const AUDIO_PREFS_KEY='antigravity:audio-console:v1'",
            'id="soundVolume" type="range" min="0" max="100"',
            'id="soundMute" type="button"',
            "localStorage.setItem(AUDIO_PREFS_KEY,JSON.stringify(audioPrefs))",
            "const volume=Number.isFinite(Number(parsed.volume))",
            "return{\n    volume,",
            "muted:parsed.muted===true",
            "landscape:AUDIO_LANDSCAPES.includes(parsed.landscape)",
        ):
            self.assertIn(marker, HOME)
        self.assertIn("audioGain(missionOutputBase)", HOME)
        self.assertIn("syncSoundMasterGains()", HOME)

    def test_exactly_five_selectable_landscapes_are_available(self) -> None:
        landscapes = re.findall(r'data-audio-landscape="([^"]+)"', HOME)
        self.assertEqual(
            landscapes,
            ["launch", "electric", "supersonic", "calm", "rain"],
        )
        self.assertIn(
            "const AUDIO_LANDSCAPES=['launch','electric','supersonic','calm','rain']",
            HOME,
        )
        for label in (
            "Lançamento",
            "Elétrico",
            "Supersônica",
            "Calma",
            "Chuva",
        ):
            self.assertIn(label, HOME)

    def test_rain_is_continuous_and_thunder_is_optional(self) -> None:
        for marker in (
            'id="soundThunder" type="checkbox" checked',
            "source.loop=true",
            "function startRainLandscape",
            "function createThunder",
            "function scheduleThunder",
            "if(!audioPrefs.thunder",
            "Trovões ocasionais (opcional)",
        ):
            self.assertIn(marker, HOME)

    def test_audio_is_generated_locally_and_only_after_a_click(self) -> None:
        for marker in (
            "window.AudioContext||window.webkitAudioContext",
            "context.createOscillator()",
            "context.createBuffer(",
            "soundPlay.addEventListener('click',startSelectedSound)",
            "await context.resume()",
            "Áudio local · sem telemetria",
        ):
            self.assertIn(marker, HOME)
        self.assertNotIn("<audio autoplay", HOME.casefold())
        self.assertNotIn("new Audio(", ENGINE)
        self.assertNotIn("fetch(", ENGINE)
        self.assertNotIn("XMLHttpRequest", ENGINE)
        self.assertNotIn("sendBeacon", ENGINE)

    def test_stop_escape_focus_live_status_and_pagehide_are_covered(self) -> None:
        for marker in (
            'id="soundStop" type="button"',
            'id="soundConsoleStatus" role="status"',
            'aria-live="polite"',
            "if(event.key==='Escape'&&!soundConsolePanel.hidden)",
            "soundConsoleClose.focus()",
            "soundConsoleToggle.focus()",
            "window.addEventListener('pagehide'",
            "stopAmbientSound({announce:false})",
            "stopMissionAudio()",
        ):
            self.assertIn(marker, HOME)

    def test_light_theme_and_reduced_motion_keep_controls_usable(self) -> None:
        for marker in (
            'html[data-theme="light"] .sound-console-toggle',
            'html[data-theme="light"] .sound-console-panel',
            ".sound-console.is-playing .sound-console-toggle::after",
            "@media(prefers-reduced-motion:reduce)",
            ".corner-command-cluster,",
        ):
            self.assertIn(marker, HOME)


if __name__ == "__main__":
    unittest.main()
