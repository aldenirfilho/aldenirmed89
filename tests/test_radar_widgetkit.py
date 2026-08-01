import json
import plistlib
import shutil
import subprocess
import unittest
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
RADAR = ROOT / "15_Radar_Cientifico"
IOS = ROOT / "ios/AntigravityRadar"
APP_GROUP = "group.com.aldenirfilho.antigravity.radar"
PUBLIC_RADAR = (
    "https://aldenirfilho.github.io/"
    "antigravity-consultas/15_Radar_Cientifico/"
)


class RadarWidgetKitTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.feed = json.loads(
            (RADAR / "data/radar-widget-feed.json").read_text(encoding="utf-8")
        )
        cls.native = json.loads(
            (IOS / "native-widget.manifest.json").read_text(encoding="utf-8")
        )
        cls.radar_html = (RADAR / "index.html").read_text(encoding="utf-8")
        cls.widget_swift = (IOS / "Widget/RadarDiarioWidget.swift").read_text(
            encoding="utf-8"
        )
        cls.store_swift = (IOS / "Shared/RadarFeedStore.swift").read_text(
            encoding="utf-8"
        )
        cls.project = (
            IOS / "AntigravityRadar.xcodeproj/project.pbxproj"
        ).read_text(encoding="utf-8")

    def test_generated_feed_matches_current_radar(self):
        result = subprocess.run(
            ["node", "scripts_admin/build_radar_widget_feed.mjs", "--check"],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Feed WidgetKit sincronizado", result.stdout)

    def test_feed_contract_is_private_bounded_and_deep_linked(self):
        self.assertEqual(
            self.feed["schemaVersion"],
            "antigravity-radar-widget-feed-v1",
        )
        self.assertEqual(self.feed["editionId"], self.feed["editorialDay"])
        self.assertEqual(len(self.feed["items"]), 3)
        self.assertFalse(self.feed["privacy"]["telemetry"])
        self.assertFalse(self.feed["privacy"]["patientData"])
        self.assertFalse(self.feed["privacy"]["accountRequired"])
        self.assertEqual(self.feed["refreshAfterMinutes"], 60)
        self.assertEqual(
            len({item["id"] for item in self.feed["items"]}),
            len(self.feed["items"]),
        )
        for item in self.feed["items"]:
            source = urlparse(item["sourceUrl"])
            deep_link = urlparse(item["deepLink"])
            self.assertEqual(source.scheme, "https")
            self.assertEqual(deep_link.scheme, "https")
            self.assertEqual(deep_link.netloc, "aldenirfilho.github.io")
            self.assertTrue(item["deepLink"].startswith(PUBLIC_RADAR + "#radar-"))
            self.assertTrue(item["title"])
            self.assertTrue(item["takeaway"])
            self.assertTrue(item["doNotInfer"])

    def test_current_edition_records_confirmed_clinical_review(self):
        self.assertEqual(
            self.feed["safety"]["status"],
            "conteúdo educacional com revisão clínica humana confirmada",
        )
        self.assertEqual(
            self.feed["safety"]["clinicalReview"],
            {
                "status": "reviewed",
                "reviewedItemCount": 3,
                "totalItemCount": 3,
            },
        )
        for item in self.feed["items"]:
            self.assertEqual(item["reviewStatus"], "reviewed")
            self.assertEqual(item["clinicalReviewer"], "Proprietário")
            self.assertEqual(item["reviewedAt"], "2026-08-01")
            self.assertEqual(
                item["reviewEvidence"],
                "Revisão clínica confirmada pelo proprietário em 2026-08-01.",
            )

    def test_radar_page_exposes_stable_anchors_and_widget_guide(self):
        self.assertIn("const storyAnchor=", self.radar_html)
        self.assertIn('id="${esc(storyAnchor)}"', self.radar_html)
        self.assertIn("📲 Widget iPhone", self.radar_html)
        self.assertIn("../docs_usuario/ACESSO_IPHONE/", self.radar_html)

    def test_native_manifest_is_source_ready_but_not_claimed_installed(self):
        self.assertEqual(
            self.native["status"],
            "source-ready-signing-pending",
        )
        self.assertEqual(self.native["minimumOS"], "17.0")
        self.assertEqual(self.native["appGroup"], APP_GROUP)
        self.assertEqual(
            self.native["widgetExtension"]["families"],
            ["systemSmall", "systemMedium", "systemLarge"],
        )
        self.assertEqual(self.native["widgetExtension"]["rotationMinutes"], 20)
        self.assertEqual(self.native["widgetExtension"]["timelineMinutes"], 60)
        self.assertTrue(self.native["feed"]["bundledFallback"])
        self.assertTrue(self.native["feed"]["appGroupCache"])
        self.assertFalse(self.native["privacy"]["telemetry"])
        self.assertFalse(self.native["privacy"]["patientData"])
        self.assertFalse(self.native["privacy"]["credentials"])
        self.assertFalse(self.native["privacy"]["externalAPIs"])
        self.assertIn(
            "instalar e homologar em um iPhone físico",
            self.native["pendingHumanActions"],
        )

    def test_widgetkit_source_supports_three_families_timeline_and_deep_links(self):
        for marker in (
            "import WidgetKit",
            "TimelineProvider",
            "StaticConfiguration",
            ".systemSmall",
            ".systemMedium",
            ".systemLarge",
            ".widgetURL(entry.item.deepLinkURL)",
            "value: index * 20",
            "result.feed.refreshAfterMinutes",
        ):
            self.assertIn(marker, self.widget_swift)
        for marker in (
            "RadarWidgetConstants.allowedFeedHost",
            "data.count <= 256_000",
            "feed.privacy.telemetry == false",
            "feed.privacy.patientData == false",
            "Bundle.main.url",
            "RadarWidgetConstants.cacheKey",
        ):
            self.assertIn(marker, self.store_swift)

    def test_plists_and_entitlements_share_the_app_group(self):
        with (IOS / "Widget/Info.plist").open("rb") as handle:
            widget_info = plistlib.load(handle)
        self.assertEqual(
            widget_info["NSExtension"]["NSExtensionPointIdentifier"],
            "com.apple.widgetkit-extension",
        )
        entitlements = []
        for relative in (
            "App/AntigravityRadar.entitlements",
            "Widget/RadarDiarioWidget.entitlements",
        ):
            with (IOS / relative).open("rb") as handle:
                entitlements.append(plistlib.load(handle))
        for entitlement in entitlements:
            self.assertEqual(
                entitlement["com.apple.security.application-groups"],
                [APP_GROUP],
            )

    def test_xcode_project_embeds_extension_and_bundled_feed(self):
        for marker in (
            'PBXNativeTarget "AntigravityRadar"',
            'PBXNativeTarget "RadarDiarioWidget"',
            "RadarDiarioWidget.appex in Embed App Extensions",
            "radar-widget-feed.json in Resources",
            "com.aldenirfilho.antigravity.radar;",
            "com.aldenirfilho.antigravity.radar.widget;",
        ):
            self.assertIn(marker, self.project)

    @unittest.skipUnless(shutil.which("swiftc"), "swiftc não disponível")
    def test_swift_sources_pass_parser(self):
        swift_files = sorted(IOS.glob("**/*.swift"))
        self.assertTrue(swift_files)
        for source in swift_files:
            result = subprocess.run(
                ["swiftc", "-parse", str(source)],
                cwd=ROOT,
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(
                result.returncode,
                0,
                f"{source.relative_to(ROOT)}\n{result.stdout}{result.stderr}",
            )

    def test_deploy_workflow_checks_feed_before_and_after_build(self):
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(
            encoding="utf-8"
        )
        self.assertIn(
            "node scripts_admin/build_radar_widget_feed.mjs --check",
            workflow,
        )
        self.assertIn(
            "test -s site/15_Radar_Cientifico/data/radar-widget-feed.json",
            workflow,
        )


if __name__ == "__main__":
    unittest.main()
