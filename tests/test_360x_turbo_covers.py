"""Regression contracts for the original, accessible 360X cover set."""
import hashlib
import json
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
PAGE=ROOT/'ecossistema'
class TurboCoversTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.projects=json.loads((PAGE/'data/sites-360x.json').read_text(encoding='utf-8'))['projects']
    def test_every_site_has_an_independent_cover(self):
        images=[p['image'] for p in self.projects]
        self.assertEqual(len(images),len(set(images)))
        self.assertTrue(all('/turbo-360x-v1/' in i for i in images))
    def test_vector_art_has_exact_widescreen_dimensions(self):
        for p in self.projects:
            with self.subTest(p=p['id']):
                path=(PAGE/p['image']).resolve()
                self.assertTrue(path.is_relative_to(PAGE/'assets/previews/turbo-360x-v1'))
                self.assertLess(path.stat().st_size,30000)
                svg=ET.parse(path).getroot()
                self.assertEqual(svg.get('viewBox'),'0 0 1200 675')
                self.assertEqual(svg.get('width'),'1200')
                self.assertEqual(svg.get('height'),'675')
                self.assertEqual(p['imageType'],'illustration')
                self.assertTrue(p['imageAlt'] and p['imageCredit'] and p['imageLicense'])
    def test_no_active_elements_external_resources_or_fonts(self):
        from scripts_admin.svg_safety import validate_svg_file
        for p in self.projects:
            path=PAGE/p['image']
            self.assertIsNone(validate_svg_file(path),p['id'])
            for node in ET.parse(path).iter():
                self.assertNotIn(node.tag.rsplit('}',1)[-1].lower(),{'image','script','foreignobject','animate'})
                for key,val in node.attrib.items():
                    self.assertFalse(key.lower().startswith('on'))
                    if key in ('href','{http://www.w3.org/1999/xlink}href'):self.assertTrue(val.startswith('#'))
    def test_old_art_is_preserved(self):
        self.assertTrue((PAGE/'assets/previews/aldenirmed.svg').is_file())
        self.assertTrue((PAGE/'assets/previews/atlas-animais.svg').is_file())
        by_id={p['id']:p for p in self.projects}
        self.assertNotEqual(by_id['atlas-animais']['image'],by_id['bolsa-ajuda-fauna']['image'])
    def test_styles_respect_motion_and_reading_themes(self):
        css=(PAGE/'assets/styles.css').read_text()
        self.assertIn('prefers-reduced-motion:reduce',css)
        self.assertIn('object-fit:contain',css)
        self.assertIn('html[data-theme="light"] .site-card',css)
        self.assertIn('styles.css?v=turbo-360x-20261022',(PAGE/'index.html').read_text())
    def test_new_public_art_is_registered_with_evidence(self):
        registry=json.loads((ROOT/'data/editorial/registry.json').read_text())
        item=next(i for i in registry['items'] if i['id']=='universo-360x-capas-turbo-20261022')
        ev={e['path']:e['sha256'] for e in item['assetEvidence']}
        expected={(PAGE/p['image']).relative_to(ROOT).as_posix() for p in self.projects}
        self.assertEqual(expected,set(item['paths']))
        for path in expected:self.assertEqual(ev[path],hashlib.sha256((ROOT/path).read_bytes()).hexdigest())
if __name__=='__main__':unittest.main()
