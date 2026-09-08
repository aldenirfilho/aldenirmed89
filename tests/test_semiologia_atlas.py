import hashlib,json,struct,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ATLAS=ROOT/'24_Semiologia/Atlas'
class SemiologyAtlasTests(unittest.TestCase):
 def test_images_are_distinct_and_complete(self):
  catalog=json.loads((ATLAS/'catalogo.json').read_text())
  items=catalog['items'];self.assertEqual(len(items),40);self.assertEqual(len({i['sha256'] for i in items}),40)
  for group in ('Neurologica','Cardiovascular'):self.assertEqual(sum(i['group']==group for i in items),20)
  for i in items:
   raw=(ATLAS/i['file']).read_bytes()
   self.assertEqual(hashlib.sha256(raw).hexdigest(),i['sha256'])
   self.assertEqual(struct.unpack('>II',raw[16:24]),(1672,941))
   self.assertFalse(i['patientDerived']);self.assertEqual(i['clinicalReview'],'pending')
 def test_modules_include_twenty_contextual_images(self):
  for rel,prefix in [('24_Semiologia/Cardiovascular/index.html','C'),('01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/index.html','N'),('01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/aprofundamento.html','N')]:
   page=(ROOT/rel).read_text()
   self.assertEqual(page.count('id="atlas-widescreen"'),1)
   for n in range(1,21):self.assertIn('id="atlas-'+prefix+str(n).zfill(2)+'"',page)
   self.assertIn('figcaption',page)
 def test_public_gallery_excludes_production_material(self):
  page=(ATLAS/'index.html').read_text()
  self.assertNotIn('127.0.0.1',page);self.assertNotIn('PROMPTS_FINAIS',page)
  self.assertIn('theme-toggle',page);self.assertIn('modulo', (ATLAS/'galeria.js').read_text())
  self.assertFalse(any('prompt' in p.name.casefold() for p in ATLAS.rglob('*')))
if __name__=='__main__':unittest.main()

