import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")

PROFILE_IDS = {
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
        self.assertIn("visualProfile:'aerospace'", HOME)
        self.assertIn("a11yPrefs.visualProfile=profile.id", HOME)
        self.assertIn("localStorage.setItem(a11yKey,JSON.stringify(a11yPrefs))", HOME)
        self.assertIn("root.dataset.visualProfile=contrastActive?'contrast'", HOME)

    def test_aerospace_is_default_and_branded_fiction_is_original(self):
        self.assertIn("visualProfile='aerospace'", HOME)
        self.assertIn("padrão oficial da missão permanece aeroespacial", HOME)
        self.assertNotIn("Harry Potter", HOME)
        self.assertNotIn("Marvel", HOME)


if __name__ == "__main__":
    unittest.main()
