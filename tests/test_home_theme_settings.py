import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")

PROFILE_IDS = {
    "total-orange",
    "mystic-aerospace",
    "aerospace",
    "aerospace-light",
    "rustic-light",
    "dark",
    "minimal",
    "sepia",
    "oceanic",
    "green",
    "natural",
    "forest",
    "wizard-academy",
    "comic-hero",
    "modern-serious",
}


class HomeThemeSettingsTests(unittest.TestCase):
    def test_settings_and_language_commands_share_top_cluster(self):
        cluster = HOME[
            HOME.index('id="cornerCommandCluster"'):
            HOME.index("<!-- Animated background orbs -->")
        ]
        for marker in (
            'id="soundConsole"',
            'id="settingsConsole"',
            'id="settingsConsoleToggle"',
            'id="settingsConsolePanel"',
            'href="en/index.html"',
            'href="18_Centro_Tripulacao/index.html"',
        ):
            self.assertIn(marker, cluster)

    def test_all_visual_profiles_are_real_selectable_controls(self):
        for profile_id in PROFILE_IDS:
            with self.subTest(profile=profile_id):
                self.assertIn(f"id:'{profile_id}'", HOME)
                if profile_id not in {"aerospace", "aerospace-light"}:
                    self.assertIn(
                        f'html[data-visual-profile="{profile_id}"]',
                        HOME,
                    )
        self.assertIn(
            'themeOptions.querySelectorAll(\'[data-visual-profile]\')',
            HOME,
        )

    def test_profile_persists_in_shared_accessibility_preferences(self):
        self.assertIn("const a11yKey='antigravity:a11y:v1'", HOME)
        self.assertIn("visualProfile:'total-orange'", HOME)
        self.assertIn("visualProfile=saved.visualProfile", HOME)
        self.assertIn("a11yPrefs.visualProfile=profile.id", HOME)
        self.assertIn("localStorage.setItem(a11yKey,JSON.stringify(a11yPrefs))", HOME)
        self.assertIn("root.dataset.visualProfile=contrastActive?'contrast'", HOME)

    def test_total_orange_is_default_and_branded_tribute_is_original(self):
        self.assertIn("visualProfile='total-orange'", HOME)
        self.assertIn("Modo principal · Laranja Mecânica", HOME)
        self.assertIn("trocas coordenadas", HOME)
        self.assertIn("sem afiliação esportiva oficial", HOME)
        self.assertIn("O conteúdo clínico permanece separado", HOME)
        self.assertNotIn("Harry Potter", HOME)
        self.assertNotIn("Marvel", HOME)
        self.assertNotIn("A Clockwork Orange", HOME)

    def test_total_football_is_an_accessible_operating_surface(self):
        self.assertIn('id="campo-total"', HOME)
        self.assertIn('aria-labelledby="campo-total-heading"', HOME)
        self.assertIn('id="tfPitch" role="group"', HOME)
        self.assertIn('id="tfStatus" aria-live="polite"', HOME)
        self.assertIn("const TOTAL_FOOTBALL_PHASES", HOME)
        self.assertIn("setAttribute('aria-pressed'", HOME)

        players = re.findall(r'<a class="tf-player[^>]*data-tf-player[^>]*>', HOME)
        self.assertEqual(11, len(players))
        for player in players:
            with self.subTest(player=player):
                href = re.search(r'href="([^"]+)"', player)
                self.assertIsNotNone(href)
                clean_href = href.group(1).split("#", 1)[0]
                self.assertTrue((ROOT / clean_href).exists())
                self.assertRegex(player, r'data-phases="[^"]+"')
                self.assertRegex(player, r'data-primary="[^"]+"')
                self.assertRegex(player, r'data-cover="[^"]+"')
                self.assertNotIn('role="listitem"', player)

        for phase in ("all", "evidence", "shift", "study", "review"):
            self.assertIn(f'data-tf-filter="{phase}"', HOME)
        self.assertIn("4–3–3 vivo", HOME)
        self.assertIn("função primária", HOME)
        self.assertIn("demais rotas continuam disponíveis", HOME)


if __name__ == "__main__":
    unittest.main()
