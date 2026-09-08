"""Integrity and navigability contracts for the abdominal teaching module."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import unittest
import zipfile

ROOT=Path(__file__).resolve().parents[1]
MODULE=ROOT/'24_Semiologia/Abdominal'

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.refs=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:self.ids.append(attrs['id'])
        for key in ('src','href'):
            if key in attrs:self.refs.append(attrs[key])

class AbdominalTests(unittest.TestCase):
    def test_all_content_records_and_references_are_complete(self):
        c=json.loads((MODULE/'data/course.json').read_text());s=json.loads((MODULE/'data/signs.json').read_text());sources=json.loads((MODULE/'data/sources.json').read_text())
        ids={x['id'] for x in sources};self.assertEqual(len(ids),len(sources))
        for field,count in [('lessons',18),('syndromes',7),('cases',16),('flashcards',40),('checklist',16),('tutors',4)]:
            self.assertEqual(len(c[field]),count);self.assertEqual(len({x['id'] for x in c[field]}),count)
        self.assertEqual(len(s),42)
        for record in c['lessons']+c['cases']+c['syndromes']+s:
            self.assertTrue(set(record['sources']).issubset(ids),record['id'])
        for case in c['cases']:
            self.assertEqual(sum(x['correct'] for x in case['options']),1)
            self.assertTrue(all(len(x['feedback'])>40 for x in case['options']))
        for sign in s:
            self.assertGreaterEqual(len(sign['steps']),3)
            for field in ('limits','avoid','mechanism','interpretation'):self.assertGreater(len(sign[field]),25)

    def test_every_local_file_and_anchor_resolves(self):
        page=Page((MODULE/'index.html').read_text());self.assertEqual(len(page.ids),len(set(page.ids)))
        for ref in page.refs:
            url=urlsplit(ref)
            if url.scheme or url.netloc:continue
            target=MODULE/unquote(url.path) if url.path else MODULE/'index.html'
            self.assertTrue(target.is_file(),ref)
            if url.fragment and target.suffix=='.html':self.assertIn(unquote(url.fragment),Page(target.read_text()).ids,ref)
        for anchor in ('sinal-murphy','sinal-israel','sinal-macicez-movel','agentes','casos','atlas'):self.assertIn(anchor,page.ids)

    def test_public_scope_and_original_brand(self):
        text=(MODULE/'index.html').read_text();m=json.loads((MODULE/'module.manifest.json').read_text())
        self.assertTrue(m['publication']['publicPreview']);self.assertTrue(m['clinicalReviewRequired'])
        self.assertIn('revisão humana especializada pendente',text)
        self.assertIn('não foram fornecidos nem consultados',text)
        self.assertIn('Não são uma conversa com IA em tempo real',text)
        self.assertIn('aerospace-v2/icon-32.png',text)
        for forbidden in ('/Users/','PROMPT_CODEX','sk-proj-'):self.assertNotIn(forbidden,text)
        self.assertIn('Abdominal/index.html',(ROOT/'24_Semiologia/index.html').read_text())

    def test_visual_catalog_and_download_match(self):
        visuals=json.loads((MODULE/'data/visuals.json').read_text());self.assertEqual(len(visuals),20)
        self.assertEqual(len({x['sha256'] for x in visuals}),20)
        with zipfile.ZipFile(MODULE/'Semiologia_Abdominal_Atlas.zip') as z:
            self.assertIsNone(z.testzip());self.assertEqual(len([x for x in z.namelist() if x.endswith('.png')]),20)
            for v in visuals:
                raw=(MODULE/v['file']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),v['sha256'])
                self.assertAlmostEqual(v['width']/v['height'],16/9,delta=.01)
                self.assertFalse(v['patientDerived']);self.assertEqual(v['clinicalReview'],'pending')
                self.assertNotIn('prompt',v);self.assertGreaterEqual(len(v['steps']),3)

if __name__=='__main__':unittest.main()
