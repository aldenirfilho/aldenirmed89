from __future__ import annotations

import json
import hashlib
import os
import unittest
from pathlib import Path

from scripts_admin import build_public_site
from scripts_admin.verify_unit_publication import PRODUCT_RELATIVE, verify


ROOT = Path(__file__).resolve().parents[1]
PRODUCT = ROOT / PRODUCT_RELATIVE
EXPECTED_TAF = "TAF###-MUX-PROD-20260801-0014-C5139E0C"
EXPECTED_PUB = "PUB###-20260801-0015-DF8A6AE4"
EXPECTED_COMMIT = "4e4138359af9d1d718a922eaf689d47df14d813f"
EXPECTED_DEPLOYMENT = "5710096161"


class TurboTemiUnitPublicationTests(unittest.TestCase):
    def test_builder_allowlists_only_the_unit_product(self) -> None:
        self.assertNotIn("23_Cosmos_NEXUS", build_public_site.REQUIRED)
        self.assertNotIn("23_Cosmos_NEXUS", build_public_site.OPTIONAL)
        self.assertIn(PRODUCT_RELATIVE.as_posix(), build_public_site.OPTIONAL)

    def test_manifest_records_official_publication_receipt(self) -> None:
        manifest = json.loads(
            (PRODUCT / "product.manifest.json").read_text(encoding="utf-8")
        )
        publication = manifest["publication"]
        self.assertEqual(publication["finalAcceptanceCode"], EXPECTED_TAF)
        self.assertEqual(publication["requiredCommand"], f"PUBLICAR {EXPECTED_TAF}")
        self.assertTrue(publication["officialPublication"])
        self.assertTrue(publication["ownerPublicationAuthorization"])
        self.assertEqual(publication["officialPublicationCode"], EXPECTED_PUB)
        self.assertEqual(publication["status"], "published")
        self.assertEqual(publication["authorizationMode"], "LITERAL_OWNER_COMMAND")
        self.assertEqual(publication["authorizationEvidence"], f"PUBLICAR {EXPECTED_TAF}")
        self.assertEqual(publication["commitSha"], EXPECTED_COMMIT)
        self.assertEqual(publication["deploymentId"], EXPECTED_DEPLOYMENT)
        self.assertEqual(manifest["classification"]["privacy"], "P0")
        self.assertFalse(manifest["classification"]["patientData"])

    def test_page_is_public_ready_and_not_self_contradictory(self) -> None:
        html = (PRODUCT / "index.html").read_text(encoding="utf-8")
        self.assertIn("###STATUS:PUBLIC_READY", html)
        self.assertNotIn("###STATUS:RELEASE_LOCKED", html)
        self.assertNotIn("publicação bloqueada", html.casefold())
        self.assertIn('href="../../../index.html"', html)
        self.assertIn('href="release/release.json"', html)

    def test_release_scope_excludes_other_universes(self) -> None:
        release = json.loads(
            (PRODUCT / "release/release.json").read_text(encoding="utf-8")
        )
        self.assertEqual(release["tafCode"], EXPECTED_TAF)
        self.assertEqual(release["memberCount"], 12)
        publication = release["publication"]
        self.assertEqual(publication["status"], "PUBLISHED")
        self.assertTrue(publication["ownerPublicationAuthorization"])
        self.assertTrue(publication["officialPublication"])
        self.assertEqual(publication["officialPublicationCode"], EXPECTED_PUB)
        self.assertEqual(publication["authorizationEvidence"], f"PUBLICAR {EXPECTED_TAF}")
        self.assertEqual(publication["commitSha"], EXPECTED_COMMIT)
        self.assertEqual(publication["deploymentId"], EXPECTED_DEPLOYMENT)
        excluded = set(release["scope"]["excluded"])
        self.assertIn("Biblioteca Visual Cósmica", excluded)
        self.assertIn("Atlas JPEG de 20 imagens", excluded)
        self.assertIn("estação fusional NEXUS", excluded)

    def test_eight_images_keep_cataloged_hashes(self) -> None:
        manifest = json.loads(
            (PRODUCT / "product.manifest.json").read_text(encoding="utf-8")
        )
        self.assertEqual(len(manifest["assets"]), 8)
        self.assertTrue(
            all(asset["publicationStatus"] == "published" for asset in manifest["assets"])
        )
        self.assertEqual(
            len({asset["catalogCode"] for asset in manifest["assets"]}), 8
        )
        for asset in manifest["assets"]:
            path = PRODUCT / asset["path"]
            self.assertTrue(path.is_file())
            self.assertEqual(path.stat().st_size, asset["bytes"])
            self.assertEqual(
                hashlib.sha256(path.read_bytes()).hexdigest(), asset["sha256"]
            )

    def test_materialized_site_when_available(self) -> None:
        public_root = Path(os.environ.get("ANTIGRAVITY_PUBLIC_ROOT", ROOT / "site"))
        if not public_root.is_dir():
            self.skipTest("artefato público ainda não materializado")
        result = verify(public_root)
        self.assertEqual(result["tafCode"], EXPECTED_TAF)
        self.assertEqual(result["scope"], "maquina-turbo-temi-360x-only")


if __name__ == "__main__":
    unittest.main()
