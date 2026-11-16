"""Contratos da seção Créditos do Autor · Axiomas 360X (16/11/2026).

Garante que a página e o bloco da página inicial são gerados a partir de
``creditos-autor/data/axiomas.json``, que todos os axiomas aparecem com o
comentário da edição e que os e-books em PDF existem, conferem com o SHA-256
registrado e entram na publicação.
"""

import hashlib
import importlib.util
import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
DATA = json.loads((ROOT / "creditos-autor/data/axiomas.json").read_text(encoding="utf-8"))
PAGE = (ROOT / "creditos-autor/index.html").read_text(encoding="utf-8")


class CreditosAutorTests(unittest.TestCase):
    def test_generated_files_are_in_sync(self) -> None:
        result = subprocess.run(
            [sys.executable, "scripts_admin/build_creditos_autor.py", "--check"],
            cwd=ROOT, text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_every_axiom_is_on_the_page_with_its_comment(self) -> None:
        axioms = DATA["axiomas"]
        self.assertGreaterEqual(len(axioms), 129)
        self.assertEqual([a["numero"] for a in axioms], list(range(1, len(axioms) + 1)))
        self.assertEqual(PAGE.count('<article class="ax-card'), len(axioms))
        self.assertEqual(PAGE.count("📖 Comentário da edição"), len(axioms))
        for axiom in axioms:
            anchor = f'id="axioma-{axiom["numero"]:03d}"'
            self.assertIn(anchor, PAGE, axiom["numero"])
            self.assertTrue(axiom["comentario"].strip(), axiom["numero"])

    def test_ebooks_exist_match_their_hash_and_are_linked(self) -> None:
        self.assertGreaterEqual(len(DATA["ebooks"]), 4)
        for ebook in DATA["ebooks"]:
            path = ROOT / "creditos-autor/ebooks" / ebook["arquivo"]
            self.assertTrue(path.is_file(), ebook["arquivo"])
            raw = path.read_bytes()
            self.assertEqual(raw[:5], b"%PDF-", ebook["arquivo"])
            self.assertEqual(hashlib.sha256(raw).hexdigest(), ebook["sha256"], ebook["arquivo"])
            self.assertIn(f'href="./ebooks/{ebook["arquivo"]}"', PAGE)
            self.assertIn(f'href="creditos-autor/ebooks/{ebook["arquivo"]}"', HOME)

    def test_home_section_sits_near_the_end_before_backstage(self) -> None:
        order = ['id="downloads"', 'id="universo-360x"', 'id="auditoria-uti"',
                 'id="creditos-autor"', 'id="bastidores"', "</main>"]
        positions = [HOME.index(marker) for marker in order]
        self.assertEqual(positions, sorted(positions))
        self.assertIn('href="creditos-autor/index.html"', HOME)
        self.assertIn(DATA["lema"], HOME)
        self.assertEqual(HOME.count('<a class="hub-tile'), 8)

    def test_axiomas_and_jornal_shortcuts_sit_next_to_settings(self) -> None:
        cluster = HOME[HOME.index('id="cornerCommandCluster"'):HOME.index("</header>")]
        settings = cluster.index('id="settingsConsole"')
        axiomas = cluster.index('class="quick-command command-shortcut command-axiomas" href="creditos-autor/index.html"')
        jornal = cluster.index('class="quick-command command-shortcut command-jornal" href="jornal-360/index.html"')
        language = cluster.index('class="command-language"')
        self.assertLess(settings, axiomas)
        self.assertLess(axiomas, jornal)
        self.assertLess(jornal, language)
        self.assertIn("publicação diária", cluster[jornal:language])

    def test_page_keeps_editorial_notices(self) -> None:
        self.assertIn('<html lang="pt-BR">', PAGE)
        self.assertIn("Não substituem o julgamento clínico", PAGE)
        self.assertIn("Os comentários são leitura da edição, não texto do autor", PAGE)

    def test_folder_is_published_and_pdfs_are_not_ignored(self) -> None:
        spec = importlib.util.spec_from_file_location("builder_creditos", ROOT / "scripts_admin/build_public_site.py")
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        self.assertIn("creditos-autor", builder.OPTIONAL)
        manifest = json.loads((ROOT / "data/site_manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["canonicalRoutes"]["creditos_autor"], "creditos-autor/index.html")
        first = DATA["ebooks"][0]["arquivo"]
        ignored = subprocess.run(
            ["git", "check-ignore", "-q", f"creditos-autor/ebooks/{first}"], cwd=ROOT,
        )
        self.assertNotEqual(ignored.returncode, 0, "PDF dos créditos ignorado pelo .gitignore")


if __name__ == "__main__":
    unittest.main()
