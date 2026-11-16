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
            'src="./assets/brand-360x/aldenirmed-360x-launch-card.png"',
            'rel="preload" as="image" '
            'href="./assets/brand-360x/aldenirmed-360x-launch-card.png"',
            'id="missionCore"',
            'id="missionEmblem"',
            'src="./assets/brand-360x/aldenirmed-360x-mark.svg"',
            'src="./assets/brand-360x/icons/aldenirmed-360x-192.png"',
            'class="mission-flight-hud"',
            "<span>AM 360X · Controle de missão</span>",
            "Portal de missão · AldenirMed 360X",
            "A missão começa agora.",
        ):
            self.assertIn(marker, HOME)
        intro = HOME.split('id="missionIntro"', 1)[1].split("</section>", 1)[0]
        self.assertNotIn("aldenirmed89-aerospace", intro)
        self.assertNotIn("AM89", intro)
        self.assertNotIn("com honra e vigor", HOME.casefold())
        self.assertNotIn("honra · vigor", HOME.casefold())

    def test_launch_assets_are_cached_for_offline_replay(self) -> None:
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v54`', worker)
        for asset in (
            "./assets/brand-360x/aldenirmed-360x-launch-card.png",
            "./assets/brand-360x/aldenirmed-360x-mark.svg",
            "./assets/brand-360x/icons/aldenirmed-360x-192.png",
            "./assets/icons/aldenirmed89-aerospace-orbital-192.png",
        ):
            self.assertIn(f'"{asset}"', worker)
            self.assertTrue((ROOT / asset[2:]).is_file(), asset)

    def test_launch_card_360x_is_clean_and_sized(self) -> None:
        card = ROOT / "assets/brand-360x/aldenirmed-360x-launch-card.png"
        data = card.read_bytes()
        self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")
        width = int.from_bytes(data[16:20], "big")
        height = int.from_bytes(data[20:24], "big")
        self.assertEqual((width, height), (1200, 630))
        chunks, offset = set(), 8
        while offset < len(data):
            length = int.from_bytes(data[offset:offset + 4], "big")
            chunks.add(data[offset + 4:offset + 8])
            offset += 12 + length
        self.assertEqual(chunks, {b"IHDR", b"IDAT", b"IEND"})
        source = (ROOT / "assets/brand-360x/aldenirmed-360x-launch-card.svg").read_text(encoding="utf-8")
        self.assertIn("AldenirMed 360X", source)
        self.assertIn("360X</text>", source)

    def test_sound_requires_an_explicit_choice_and_stays_local(self) -> None:
        for marker in (
            'id="missionStartSound" type="button"',
            'id="missionStartSilent" type="button"',
            "window.AudioContext||window.webkitAudioContext",
            "context.createOscillator()",
            "context.createBuffer(",
            "playMissionSound({compact:missionHasReducedMotion(),theme:missionSoundTheme})",
            "async function playMissionSound",
            "await context.resume()",
        ):
            self.assertIn(marker, HOME)
        self.assertNotIn("<audio autoplay", HOME.lower())
        self.assertNotIn("new Audio(", HOME)
        self.assertNotIn("fetch('./assets/audio", HOME)

    def test_sound_is_audible_ten_seconds_and_peak_limited(self) -> None:
        for marker in (
            "const duration=compact?.74:10.05",
            "master:.68",
            "master:.58",
            "master:.72",
            "const limiter=context.createDynamicsCompressor()",
            "limiter.threshold.value=-12",
            "limiter.ratio.value=16",
            "output.gain.setValueAtTime(.86,start)",
            "master.connect(limiter).connect(output).connect(context.destination)",
            "presence.frequency.setValueAtTime(frequency*3.2,when)",
            "chord(profile.harmony[1],start+7.62,2.38,.072)",
        ):
            self.assertIn(marker, HOME)

    def test_three_sound_themes_are_selectable_and_persistent(self) -> None:
        for marker in (
            "const MISSION_SOUND_KEY='antigravity:mission-sound-theme:v1'",
            'data-mission-sound="honra"',
            'data-mission-sound="foco"',
            'data-mission-sound="vigor"',
            "localStorage.setItem(MISSION_SOUND_KEY,theme)",
        ):
            self.assertIn(marker, HOME)

    def test_ten_second_flight_lands_on_the_replay_emblem(self) -> None:
        for marker in (
            "const MISSION_DURATION=10000",
            "missionCore.getBoundingClientRect()",
            "missionEmblem.getBoundingClientRect()",
            "duration:MISSION_DURATION",
            "missionLater(()=>finishMission(),MISSION_DURATION)",
            "animation:mission-progress 10s linear both",
            "animation:mission-star-drive 10s ease-in both",
            "Dez segundos para organizar o foco",
            "T−10,0",
        ):
            self.assertIn(marker, HOME)

    def test_intro_is_once_per_session_and_can_be_replayed(self) -> None:
        for marker in (
            "const MISSION_INTRO_KEY='antigravity:mission-intro:v2'",
            "sessionStorage.setItem(MISSION_INTRO_KEY,'seen')",
            "sessionStorage.getItem(MISSION_INTRO_KEY)==='seen'",
            "missionEmblem.addEventListener('click',openMissionPortal)",
            "heroReplayMission?.addEventListener('click',openMissionPortal)",
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
            "overflow:auto;overscroll-behavior:contain",
            "@media(max-height:820px)",
            "calc(52vh * 1.9048)",
            "<noscript><style>.mission-intro,.mission-emblem"
            "{display:none!important}</style></noscript>",
            "#drawer,.mission-intro,.mission-emblem,",
        ):
            self.assertIn(marker, HOME)

    def test_portal_does_not_add_telemetry_or_remote_audio(self) -> None:
        portal_source = HOME[
            HOME.index("/* ── PORTAL DE MISSÃO · 10 SEGUNDOS"):
            HOME.index("/* ── DATA: topic drawer content")
        ]
        self.assertNotIn("sendBeacon", portal_source)
        self.assertNotIn("fetch(", portal_source)
        self.assertNotIn("XMLHttpRequest", portal_source)
        self.assertNotIn("https://", portal_source)


if __name__ == "__main__":
    unittest.main()
