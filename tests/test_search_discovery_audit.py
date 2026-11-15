import importlib.util
import json
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('search_discovery_builder', ROOT / 'scripts_admin/build_public_site.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class SearchDiscoveryAuditTests(unittest.TestCase):
    def test_sitemap_filters_nonindexable_pages_and_has_static_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            site = root / 'site'
            site.mkdir()
            (root / 'data').mkdir()
            pages = {
                'index.html': '<html><head><title>Início &amp; estudo</title></head></html>',
                'conteudo.html': '<html><head><title>Conteúdo</title></head></html>',
                'privado.html': '<html><head><meta name="robots" content="noindex, follow"></head></html>',
                'google.html': '<html><head><meta name="googlebot" content="NONE"></head></html>',
                'redirect.html': '<html><head><meta http-equiv="refresh" content="0;url=conteudo.html"></head></html>',
                'alias.html': '<html><head><link href="conteudo.html" rel="canonical"></head></html>',
                'falso.html': '<html><head></head><body><script>let s=\'<meta name="robots" content="noindex">\';</script></body></html>',
            }
            for path, html in pages.items():
                (site / path).write_text(html)
            (root / 'data/site_manifest.json').write_text(json.dumps({
                'updatedAt': '2026-11-03',
                'canonicalRoutes': {**{p:p for p in pages}, 'dados':'data.json', 'ausente':'ausente.html'},
            }))
            count, _ = builder.write_search_discovery(root, site)
            self.assertEqual(count, 3)
            xml = (site / 'sitemap.xml').read_text()
            tree = ET.fromstring(xml)
            self.assertNotIn('lastmod', xml)
            urls = [e.text for e in tree.findall('{*}url/{*}loc')]
            self.assertEqual(set(urls), {builder.PUBLIC_BASE_URL, builder.PUBLIC_BASE_URL+'conteudo.html', builder.PUBLIC_BASE_URL+'falso.html'})
            index = (site / 'mapa-do-site.html').read_text()
            for url in urls:
                self.assertIn('href="'+url+'"', index)
            self.assertIn('Início &amp; estudo', index)
            self.assertIn('lang="pt-BR"', index)
            self.assertNotIn('<script', index)

    def test_directory_canonical_equivalence(self):
        with tempfile.TemporaryDirectory() as tmp:
            site = Path(tmp)
            (site / 'modulo').mkdir()
            (site / 'modulo/index.html').write_text('<head><link rel="canonical" href="index.html"></head>')
            self.assertTrue(builder.search_page_is_indexable(site, builder.PUBLIC_BASE_URL+'modulo/'))

    def test_new_routes_are_independent_existing_pages(self):
        manifest = json.loads((ROOT / 'data/site_manifest.json').read_text())
        for key in ('doencas_geneticas', 'protocolos_pneumologia_2026', 'antimicrobianos_farmacologia', 'agentes_habilidades', 'auditoria_uti'):
            path = manifest['canonicalRoutes'][key]
            self.assertTrue((ROOT / path).is_file())
            self.assertNotIn('#', path)
            self.assertNotIn('?', path)


if __name__ == '__main__':
    unittest.main()
