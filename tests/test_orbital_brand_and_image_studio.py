#!/usr/bin/env python3
"""Regressões da identidade A Orbital e da oficina local do Card Feed."""

from __future__ import annotations

import struct
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def png_header(path: Path) -> tuple[int, int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise AssertionError(f"{path} não é PNG")
    width, height, _depth, color_type = struct.unpack(">IIBB", data[16:26])
    return width, height, color_type


class OrbitalBrandTests(unittest.TestCase):
    def test_social_card_has_public_share_dimensions_and_metadata(self) -> None:
        card = ROOT / "assets/brand/antigravity-social-card.png"
        self.assertTrue(card.is_file())
        self.assertEqual(png_header(card)[:2], (1200, 630))

        home = (ROOT / "index.html").read_text(encoding="utf-8")
        public_url = (
            "https://aldenirfilho.github.io/antigravity-consultas/"
            "assets/brand/antigravity-social-card.png"
        )
        self.assertIn(f'<meta property="og:image" content="{public_url}"/>', home)
        self.assertIn('<meta property="og:image:width" content="1200"/>', home)
        self.assertIn('<meta property="og:image:height" content="630"/>', home)
        self.assertIn(f'<meta name="twitter:image" content="{public_url}"/>', home)
        self.assertIn('property="og:image:alt"', home)
        self.assertIn('name="twitter:image:alt"', home)

    def test_monochrome_marks_are_square_pngs_with_alpha(self) -> None:
        for filename in (
            "antigravity-a-orbital-mono-light.png",
            "antigravity-a-orbital-mono-dark.png",
        ):
            width, height, color_type = png_header(ROOT / "assets/brand" / filename)
            self.assertEqual((width, height), (1024, 1024))
            self.assertIn(color_type, {4, 6}, f"{filename} precisa preservar transparência")

    def test_launch_animation_is_short_once_and_respects_reduced_motion(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("animation:orbital-launch 1.55s", home)
        self.assertIn("@keyframes orbital-launch", home)
        self.assertIn("@media(prefers-reduced-motion:reduce)", home)
        self.assertIn("html.a11y-reduce-motion *", home)

    def test_brand_assets_have_reproducible_documented_generator(self) -> None:
        readme = (ROOT / "assets/brand/README.md").read_text(encoding="utf-8")
        generator = ROOT / "scripts_admin/build_orbital_brand_assets.swift"
        self.assertTrue(generator.is_file())
        self.assertIn("antigravity-a-orbital-mono-light.png", readme)
        self.assertIn("antigravity-a-orbital-mono-dark.png", readme)
        self.assertIn("antigravity-social-card.png", readme)
        self.assertIn("build_orbital_brand_assets.swift", readme)


class LocalImageStudioTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (ROOT / "05_Midia_E_Feed/index.html").read_text(encoding="utf-8")

    def test_studio_is_visible_accessible_and_explicitly_private(self) -> None:
        for marker in (
            'id="imageStudio"',
            'id="imageDropZone" type="button"',
            'id="studioStatus" role="status" aria-live="polite"',
            "Fica apenas neste dispositivo. Nenhum upload.",
            "Adicione agora. Edite quando quiser.",
        ):
            self.assertIn(marker, self.source)

    def test_picker_and_runtime_use_a_strict_image_allowlist(self) -> None:
        accept = 'accept="image/png,image/jpeg,image/webp,image/gif"'
        self.assertGreaterEqual(self.source.count(accept), 2)
        self.assertIn(
            'new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])',
            self.source,
        )
        self.assertIn("const MAX_IMAGE_BYTES = 12 * 1024 * 1024", self.source)
        self.assertIn("const MAX_BATCH_FILES = 24", self.source)
        self.assertIn("async function hasExpectedImageSignature(file)", self.source)
        for signature in ("PNG", "RIFF", "WEBP", "GIF87a", "GIF89a"):
            self.assertIn(signature, self.source)
        self.assertNotIn('accept="image/*"', self.source)

    def test_images_persist_locally_and_can_be_reedited_or_downloaded(self) -> None:
        for marker in (
            'indexedDB.open(DB_NAME, 1)',
            'imageData: await fileToDataURL(file)',
            'imageSize: file.size',
            'id="editImageInput"',
            "const replacement = $(\"editImageInput\").files?.[0]",
            "async function saveEdit()",
            "function downloadCardImage(id)",
            'data-download="${esc(c.id)}"',
            'id="btnDownloadImage"',
            "navigator.storage?.estimate",
        ):
            self.assertIn(marker, self.source)

    def test_drag_and_drop_has_keyboard_and_error_paths(self) -> None:
        for marker in (
            'id="imageDropZone" type="button"',
            "dropZone.onclick = selectImages",
            'for (const eventName of ["dragenter", "dragover"])',
            'dropZone.addEventListener("drop"',
            "event.dataTransfer?.files",
            "queueImageImport = files => importImages(files).catch",
        ):
            self.assertIn(marker, self.source)

    def test_studio_does_not_prepare_network_uploads(self) -> None:
        self.assertNotIn("new FormData(", self.source)
        self.assertNotIn("XMLHttpRequest", self.source)
        self.assertNotIn("fetch(file", self.source)
        self.assertNotIn("navigator.sendBeacon", self.source)


if __name__ == "__main__":
    unittest.main()
