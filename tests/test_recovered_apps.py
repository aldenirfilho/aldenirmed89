import importlib.util
import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
class RecoveredAppsTests(unittest.TestCase):
 def setUp(self):
  self.data=json.loads((ROOT/'ecossistema/data/aplicativos-recuperados.json').read_text())
  self.page=(ROOT/'ecossistema/aplicativos.html').read_text()
 def test_records_are_complete_and_identifiers_unique(self):
  apps=self.data['applications'];self.assertEqual(len(apps),13);self.assertEqual(len({a['id'] for a in apps}),len(apps))
  for app in apps:
   for key in ('name','version','description','features','steps','caveat','evidence','visualLabels'):
    self.assertTrue(app[key],(app['id'],key))
 def test_private_sources_are_not_linked(self):
  for app in self.data['applications']:
   for link in app.get('links',[]):
    u=urlsplit(link['url']);self.assertEqual(u.scheme,'https');self.assertNotIn('chatgpt',u.netloc)
    if '/archive/' in u.path:self.assertEqual(app['id'],'blackblok');self.assertIn('64a379e5047dd932fcc8d7ccb3a535d66b86620b',u.path)
  for term in ('libfile_','profile_preferencias','perfil_preferencias','api_key','aldenir-nexus-light/archive','aldenir-nexus-light/releases'):
   self.assertNotIn(term,self.page)
 def test_logos_exist_and_no_source_packages_are_published(self):
  for app in self.data['applications']:
   if app.get('icon'):self.assertTrue((ROOT/'ecossistema'/app['icon']).is_file())
  self.assertIn('Não é uma captura da interface',self.page)
  self.assertIn('não aplicativo assinado',self.page)
 def test_generator_and_navigation_are_current(self):
  spec=importlib.util.spec_from_file_location('showcase',ROOT/'scripts_admin/build_recovered_apps.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  self.assertEqual(module.render(),self.page)
  for f in ['ecossistema/index.html','ecossistema/painel.html']:self.assertIn('./aplicativos.html',(ROOT/f).read_text())
 def test_accessible_search_and_mobile_styles(self):
  self.assertIn('for="app-search"',self.page);self.assertIn('aria-live="polite"',self.page)
  css=(ROOT/'ecossistema/assets/aplicativos.css').read_text();self.assertIn('@media(max-width:740px)',css);self.assertIn('prefers-reduced-motion',css)
if __name__=='__main__':unittest.main()
