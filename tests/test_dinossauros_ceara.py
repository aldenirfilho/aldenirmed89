"""Regressions for navigation and the responsive paleoart delivery budget."""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ecossistema/misterios-antigos/dinossauros-do-ceara/index.html"


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.elements = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class DinossaurosDeliveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = PAGE.read_text(encoding="utf-8")
        cls.document = Document(cls.source)

    def local_target(self, value):
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path:
            return None
        path = (PAGE.parent / unquote(url.path)).resolve()
        # This page intentionally links upwards to the rest of the portal.
        self.assertTrue(path.is_relative_to(ROOT), value)
        return path

    def test_unique_ids_and_working_in_page_navigation(self):
        ids = [attrs["id"] for _, attrs in self.document.elements if "id" in attrs]
        self.assertFalse([key for key, count in Counter(ids).items() if count > 1])
        for tag, attrs in self.document.elements:
            if tag == "a" and attrs.get("href", "").startswith("#"):
                self.assertIn(unquote(attrs["href"][1:]), ids, attrs["href"])

    def test_local_navigation_and_assets_exist(self):
        for tag, attrs in self.document.elements:
            values = []
            if tag == "a" and attrs.get("href"):
                values.append(attrs["href"])
            if tag in {"img", "script"} and attrs.get("src"):
                values.append(attrs["src"])
            if tag == "link" and attrs.get("href"):
                values.append(attrs["href"])
            if attrs.get("srcset"):
                values.extend(item.strip().split()[0] for item in attrs["srcset"].split(","))
            for value in values:
                target = self.local_target(value)
                if target is not None:
                    self.assertTrue(target.exists(), value)

    def test_paleoart_has_accessibility_and_load_controls(self):
        images = [attrs for tag, attrs in self.document.elements if tag == "img"]
        self.assertTrue(images, "The expanded site must deliver raster paleoart.")
        eager = []
        for attrs in images:
            self.assertTrue(attrs.get("alt", "").strip(), attrs.get("src"))
            self.assertGreater(int(attrs.get("width", "0")), 0)
            self.assertGreater(int(attrs.get("height", "0")), 0)
            if attrs.get("loading") != "lazy":
                eager.append(attrs)
            else:
                self.assertEqual(attrs.get("decoding"), "async")
            target = self.local_target(attrs["src"])
            if target is not None and target.suffix == ".webp":
                self.assertLessEqual(target.stat().st_size, 600_000, str(target))
                data = target.read_bytes()
                self.assertEqual(data[:4], b"RIFF")
                self.assertEqual(data[8:12], b"WEBP")
        self.assertLessEqual(len(eager), 1, "Only the opening image should load eagerly.")
        if eager:
            self.assertEqual(eager[0].get("fetchpriority"), "high")


if __name__ == "__main__":
    unittest.main()
