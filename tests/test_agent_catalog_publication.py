"""Regressões da publicação do catálogo e de sua cópia autocontida."""

import shutil
import tempfile
import unittest
from pathlib import Path

from scripts_admin import build_public_site as builder


ROOT = Path(__file__).resolve().parents[1]
CATALOG_DOCUMENTS = (
    "ecossistema/agentes-habilidades/index.html",
    "ecossistema/agentes-habilidades/downloads/"
    "Catalogo_Agentes_Habilidades_360X_2026.html",
)


class AgentCatalogPublicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.analytics = builder.load_site_analytics_config(ROOT)

    def publication_passes(self):
        """Mesma ordem usada em build(), depois de copiar os documentos."""
        return (
            ("identidade", builder.migrate_public_identity),
            ("atribuição", builder.inject_editorial_attribution),
            (
                "metadados",
                lambda site: builder.inject_public_metadata(site, self.analytics),
            ),
        )

    def test_real_catalog_documents_remain_byte_identical_after_each_pass(self):
        """Aliases, recursos embutidos e créditos próprios sobrevivem à publicação."""
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            originals = {}
            for relative in CATALOG_DOCUMENTS:
                source = ROOT / relative
                self.assertTrue(source.is_file(), f"Documento ausente: {relative}")
                originals[relative] = source.read_bytes()
                destination = site / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, destination)

            for pass_name, transform in self.publication_passes():
                with self.subTest(etapa=pass_name):
                    self.assertEqual(transform(site), 0)
                    for relative, original in originals.items():
                        with self.subTest(documento=relative):
                            # Comparação binária, sem normalizar quebras de linha,
                            # reserializar HTML ou ocultar mudanças em data URIs.
                            self.assertTrue(
                                (site / relative).read_bytes() == original,
                                f"{pass_name} alterou os bytes de {relative}",
                            )

    def test_generic_and_neighboring_pages_still_receive_public_transforms(self):
        """A exceção não se estende ao diretório do catálogo ou de downloads."""
        controls = (
            "controle.html",
            "ecossistema/agentes-habilidades/controle.html",
            "ecossistema/agentes-habilidades/downloads/controle.html",
        )
        original = (
            '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
            '<title>Antigravity Consultas</title></head><body>'
            '<h1>ANTIGRAVITY</h1>'
            f'<a href="{builder.LEGACY_BASE_URL}">Portal</a>'
            '</body></html>'
        )
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            for relative in controls:
                path = site / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(original, encoding="utf-8")

            for pass_name, transform in self.publication_passes():
                with self.subTest(etapa=pass_name):
                    self.assertEqual(transform(site), len(controls))

            for relative in controls:
                with self.subTest(documento=relative):
                    html = (site / relative).read_text(encoding="utf-8")
                    self.assertIn("<title>AldenirMed89</title>", html)
                    self.assertIn("<h1>ALDENIRMED89</h1>", html)
                    self.assertIn(f'href="{builder.PUBLIC_BASE_URL}"', html)
                    self.assertNotIn(builder.LEGACY_BASE_URL, html)
                    self.assertEqual(html.count(builder.EDITORIAL_ATTRIBUTION_MARKER), 1)
                    self.assertEqual(html.count(builder.PUBLIC_METADATA_MARKER), 1)
                    self.assertIn("assets/editorial-attribution.css", html)
                    self.assertIn("assets/aldenirmed89-mystic.css", html)
                    self.assertIn("assets/site-analytics.js", html)
                    self.assertIn("data-antigravity-analytics", html)
                    self.assertIn(
                        f'rel="canonical" href="{builder.PUBLIC_BASE_URL}{relative}"',
                        html,
                    )

            # Uma nova execução conserva a idempotência das páginas comuns.
            for pass_name, transform in self.publication_passes():
                with self.subTest(reexecucao=pass_name):
                    self.assertEqual(transform(site), 0)


if __name__ == "__main__":
    unittest.main()
