import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")

PROFILE_IDS = {
    "bruxa-rustica-moderna",
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
                    selector = (
                        f'html[data-theme="dark"][data-visual-profile="{profile_id}"]'
                        if profile_id == "bruxa-rustica-moderna"
                        else f'html[data-visual-profile="{profile_id}"]'
                    )
                    self.assertIn(selector, HOME)
        self.assertIn(
            'themeOptions.querySelectorAll(\'[data-visual-profile]\')',
            HOME,
        )

    def test_profile_persists_in_shared_accessibility_preferences(self):
        self.assertIn("const a11yKey='antigravity:a11y:v1'", HOME)
        self.assertIn("visualProfile:'bruxa-rustica-moderna'", HOME)
        self.assertIn("visualProfile=saved.visualProfile", HOME)
        self.assertIn("a11yPrefs.visualProfile=profile.id", HOME)
        self.assertIn("localStorage.setItem(a11yKey,JSON.stringify(a11yPrefs))", HOME)
        self.assertIn("root.dataset.visualProfile=contrastActive?'contrast'", HOME)

    def test_bruxa_rustica_is_default_and_total_orange_remains_available(self):
        self.assertIn("visualProfile='bruxa-rustica-moderna'", HOME)
        self.assertIn('<html lang="pt-BR" data-theme="dark" data-theme-mode="dark" data-visual-profile="bruxa-rustica-moderna">', HOME)
        self.assertGreaterEqual(HOME.count("!['light','system'].includes(saved.theme)"), 2)
        self.assertIn("Bruxa Rústica Moderna", HOME)
        self.assertIn("id:'total-orange'", HOME)
        self.assertIn("Identidade histórica · Laranja Mecânica", HOME)
        self.assertIn("trocas coordenadas", HOME)
        self.assertIn("sem afiliação esportiva oficial", HOME)
        self.assertIn("O conteúdo clínico permanece separado", HOME)
        self.assertNotIn("Harry Potter", HOME)
        self.assertNotIn("Marvel", HOME)
        self.assertNotIn("A Clockwork Orange", HOME)

    def test_prepaint_migration_preserves_system_and_explicit_choices(self):
        harness = r"""
const fs = require("fs");
const vm = require("vm");
const html = fs.readFileSync(process.argv[1], "utf8");
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function run(preferences, systemLight) {
  let stored = JSON.stringify(preferences);
  const themeMeta = {setAttribute(name, value) { this[name] = value; }};
  const statusMeta = {setAttribute(name, value) { this[name] = value; }};
  const root = {
    dataset: {}, style: {},
    classList: {state: {}, toggle(name, force) { this.state[name] = Boolean(force); }}
  };
  const localStorage = {
    getItem() { return stored; },
    setItem(_key, value) { stored = value; }
  };
  const matchMedia = () => ({matches: systemLight});
  const document = {
    documentElement: root,
    querySelector(selector) {
      return selector.includes("theme-color") ? themeMeta : statusMeta;
    }
  };
  vm.runInNewContext(bootstrap, {document, localStorage, matchMedia, window: {matchMedia}});
  return {dataset: root.dataset, stored: JSON.parse(stored), themeColor: themeMeta.content};
}
process.stdout.write(JSON.stringify({
  system: run({theme: "system"}, true),
  legacy: run({theme: "dark", visualProfile: "total-orange"}, false),
  explicitOrange: run({theme: "dark", visualProfile: "total-orange", brandThemeRelease: "bruxa-rustica-moderna-v1"}, false),
  contrast: run({theme: "dark", contrast: true}, false)
}));
"""
        result = subprocess.run(
            ["node", "-e", harness, str(ROOT / "index.html")],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        cases = json.loads(result.stdout)
        self.assertEqual("system", cases["system"]["dataset"]["themeMode"])
        self.assertEqual("light", cases["system"]["dataset"]["theme"])
        self.assertEqual("system", cases["system"]["stored"]["theme"])
        self.assertEqual("bruxa-rustica-moderna", cases["legacy"]["dataset"]["visualProfile"])
        self.assertEqual("total-orange", cases["explicitOrange"]["dataset"]["visualProfile"])
        self.assertEqual("contrast", cases["contrast"]["dataset"]["visualProfile"])
        self.assertEqual("#000000", cases["contrast"]["themeColor"])

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
