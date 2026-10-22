"""Offline regression tests for the public fauna catalogue (stdlib only)."""
import json
import re
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'apps/bolsa-ajuda-fauna'

class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

class FaunaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((SITE / 'catalog.json').read_text(encoding='utf-8'))
        cls.animals = cls.data['animals']
        cls.orgs = cls.data['organizations']
        cls.html = (SITE / 'index.html').read_text(encoding='utf-8')
        cls.tags = Tags()
        cls.tags.feed(cls.html)
    def test_counts_and_unique_ids(self):
        self.assertEqual(len(self.animals), 26)
        self.assertEqual(len({a['id'] for a in self.animals}), 26)
        self.assertEqual(len(self.orgs), 10)
        self.assertEqual(len({o['id'] for o in self.orgs}), 10)
    def test_risk_categories(self):
        self.assertEqual(Counter(a['risk'] for a in self.animals), {'CR':16, 'EN':9, 'VU':1})
    def test_taxonomy_is_explicit(self):
        self.assertEqual(Counter(a['taxon'] for a in self.animals), {'espécie':25,'subespécie':1})
    def test_all_animals_have_complete_fields_and_sources(self):
        for a in self.animals:
            for field in ['name','scientific','habitat','threat','action','sources','regions','reviewedAt']:
                self.assertTrue(a[field], (a['id'], field))
            for s in a['sources']:
                self.assertTrue(s['title'])
                self.assertEqual(urlparse(s['url']).scheme, 'https')
    def test_referenced_organizations_exist(self):
        ids = {o['id'] for o in self.orgs}
        for a in self.animals:
            self.assertTrue(set(a.get('organizations',[])+a.get('relatedOrganizations',[])) <= ids)
    def test_links_use_https_and_valid_dates(self):
        for o in self.orgs:
            for u in [o['url'],o.get('report')]:
                if u:
                    parsed=urlparse(u)
                    self.assertEqual(parsed.scheme,'https')
                    self.assertTrue(parsed.netloc)
                    self.assertIsNone(parsed.username)
            self.assertRegex(o['verifiedAt'],r'^\d{4}-\d{2}-\d{2}$')
    def test_javascript_catalog_matches_json(self):
        raw=(SITE/'catalog.js').read_text(encoding='utf-8')
        payload=raw.split('window.FAUNA_CATALOG = ',1)[1].rstrip().removesuffix(';')
        self.assertEqual(json.loads(payload),self.data)
    def test_no_speculative_galapagos_donation_mapping(self):
        a=next(a for a in self.animals if a['scientific']=='Phoebastria irrorata')
        self.assertNotIn('albatroz',a['organizations'])
        self.assertIn('albatroz',a['relatedOrganizations'])
    def test_no_foreign_species_routed_to_wwf_brasil(self):
        for a in self.animals:
            if 'wwf' in a['organizations']:
                self.assertIn('Brasil',a['regions'])
    def test_local_resources_and_no_payment_or_upload_form(self):
        for tag,attrs in self.tags.tags:
            if tag=='script' and attrs.get('src'):
                self.assertTrue((SITE/attrs['src']).is_file())
                self.assertFalse(attrs['src'].startswith('http'))
            if tag=='link' and attrs.get('rel')=='stylesheet':
                self.assertTrue((SITE/attrs['href']).is_file())
            if tag=='input':
                self.assertNotIn(attrs.get('type'),['file','password'])
            self.assertNotEqual(tag,'iframe')
        self.assertNotIn('<form',self.html)
    def test_accessibility_controls_and_unique_ids(self):
        ids=[attrs['id'] for _,attrs in self.tags.tags if 'id' in attrs]
        self.assertEqual(len(ids),len(set(ids)))
        self.assertIn('lang="pt-BR"',self.html)
        self.assertIn('aria-live="polite"',self.html)
        self.assertIn('prefers-reduced-motion',(SITE/'styles.css').read_text())
        self.assertIn('aria-labelledby="dialog-title"',self.html)
    def test_no_donor_data(self):
        public='\n'.join(p.read_text(encoding='utf-8') for p in SITE.iterdir() if p.is_file())
        for forbidden in ['16587','11846','Raimunda Lopes','Sancleya','3fd4e381','file_0000','ghp_','sk-proj-']:
            self.assertNotIn(forbidden,public)
        self.assertNotIn('type="file"',public)

if __name__ == '__main__':
    unittest.main()
