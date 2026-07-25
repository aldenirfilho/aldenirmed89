#!/usr/bin/env python3
"""Contrato estático do Portal de Missão Antigravity."""

from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")


class MissionPortalTests(unittest.TestCase):
    def test_portal_uses_the_public_brand_card_and_emblem(self) -> None:
        for marker in (
            'id="missionIntro" role="dialog" aria-modal="true"',
            'src="./assets/brand/antigravity-social-card.png"',
            'rel="preload" as="image" '
            'href="./assets/brand/antigravity-social-card.png"',
            'id="missionCore"',
            'id="missionEmblem"',
            'src="./assets/icons/antigravity-consultas-192.png"',
            "Com honra e vigor. A missão começa agora.",
        ):
            self.assertIn(marker, HOME)

    def test_sound_requires_an_explicit_choice_and_stays_local(self) -> None:
        for marker in (
            'id="missionStartSound" type="button"',
            'id="missionStartSilent" type="button"',
            "window.AudioContext||window.webkitAudioContext",
            "context.createOscillator()",
            "context.createBuffer(",
            "playMissionSound({compact:missionHasReducedMotion()})",
        ):
            self.assertIn(marker, HOME)
        self.assertNotIn("<audio autoplay", HOME.lower())
        self.assertNotIn("new Audio(", HOME)
        self.assertNotIn("fetch('./assets/audio", HOME)

    def test_five_second_flight_lands_on_the_replay_emblem(self) -> None:
        for marker in (
            "const MISSION_DURATION=5000",
            "missionCore.getBoundingClientRect()",
            "missionEmblem.getBoundingClientRect()",
            "duration:MISSION_DURATION",
            "missionLater(()=>finishMission(),MISSION_DURATION)",
            "animation:mission-progress 5s linear both",
        ):
            self.assertIn(marker, HOME)

    def test_intro_is_once_per_session_and_can_be_replayed(self) -> None:
        for marker in (
            "const MISSION_INTRO_KEY='antigravity:mission-intro:v1'",
            "sessionStorage.setItem(MISSION_INTRO_KEY,'seen')",
            "sessionStorage.getItem(MISSION_INTRO_KEY)==='seen'",
            "missionEmblem.addEventListener('click',openMissionPortal)",
            "Repetir abertura da missão",
        ):
            self.assertIn(marker, HOME)
        self.assertNotIn("localStorage.setItem(MISSION_INTRO_KEY", HOME)

    def test_keyboard_skip_focus_trap_and_live_status_are_present(self) -> None:
        for marker in (
            'id="missionSkip" type="button"',
            'class="mission-telemetry" aria-live="polite"',
            "if(event.key==='Escape')",
            "if(event.key!=='Tab')return",
            "missionStartSound.focus()",
        ):
            self.assertIn(marker, HOME)

    def test_accessibility_and_fallback_paths_cannot_trap_the_page(self) -> None:
        for marker in (
            "missionHasReducedMotion()",
            "window.matchMedia('(prefers-reduced-motion: reduce)').matches",
            "html.a11y-reduce-motion *",
            "<noscript><style>.mission-intro,.mission-emblem"
            "{display:none!important}</style></noscript>",
            "#drawer,.mission-intro,.mission-emblem,",
        ):
            self.assertIn(marker, HOME)

    def test_portal_does_not_add_telemetry_or_remote_audio(self) -> None:
        portal_source = HOME[
            HOME.index("/* ── PORTAL DE MISSÃO · 5 SEGUNDOS"):
            HOME.index("/* ── DATA: topic drawer content")
        ]
        self.assertNotIn("sendBeacon", portal_source)
        self.assertNotIn("fetch(", portal_source)
        self.assertNotIn("XMLHttpRequest", portal_source)
        self.assertNotIn("https://", portal_source)


if __name__ == "__main__":
    unittest.main()
