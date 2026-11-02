"""Contrato editorial e recuperabilidade do lote de 50 ganchos de novembro."""
import json
import re
import unicodedata
import unittest
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / '11_MNEMONICOS' / 'catalogo_expansao_50_20261102.json'
TOPICS = {
    'sepse-choque': 'Sepse e choque',
    'ventilacao-sdra': 'Ventilação e SDRA',
    'infeccoes-antimicrobianos': 'Infecções e antimicrobianos',
    'neurocritico': 'Neurocrítico',
    'renal-eletrolitos': 'Renal e eletrólitos',
    'metabolico-endocrino': 'Metabólico e endócrino',
    'cardiovascular': 'Cardiovascular',
    'hematologia-trombose': 'Hematologia e trombose',
    'gastro-hepato-nutricao': 'Gastro, hepato e nutrição',
    'sedacao-seguranca': 'Sedação e segurança',
}


def folded(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.casefold())
                   if unicodedata.category(c) != 'Mn')


class NovemberMnemonicContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads(PACK.read_text(encoding='utf-8'))
        cls.items = cls.pack['mnemonicos']

    def test_adds_exactly_fifty_unique_mnemonics(self):
        self.assertEqual(len(self.items), 50)
        ids = {item['id'] for item in self.items}
        self.assertEqual(len(ids), 50)
        self.assertTrue(all(re.fullmatch(r'nov26-m-\d{2}', item) for item in ids))
        self.assertEqual(len({folded(i['title']) for i in self.items}), 50)

    def test_ten_searchable_topics_have_five_items_each(self):
        self.assertEqual(Counter(i['topicId'] for i in self.items),
                         Counter({topic: 5 for topic in TOPICS}))
        for item in self.items:
            with self.subTest(item=item['id']):
                self.assertEqual(item['topicLabel'], TOPICS[item['topicId']])
                self.assertEqual(item['category'], item['topicLabel'])
                self.assertGreater(len(item['subtopic'].strip()), 8)
                self.assertIn(item['subtopic'], item['tags'])
                self.assertIn(item['topicLabel'], item['tags'])

    def test_existing_pack_identifiers_and_titles_are_not_reused(self):
        old_ids, old_titles = set(), set()
        for path in (ROOT / '11_MNEMONICOS').glob('*.json'):
            if path == PACK:
                continue
            old = json.loads(path.read_text(encoding='utf-8'))
            old_ids.update(item['id'] for item in old.get('mnemonicos', []))
            old_titles.update(folded(item['title']) for item in old.get('mnemonicos', []))
        self.assertTrue(old_ids, 'O teste precisa comparar os packs anteriores.')
        self.assertTrue(old_ids.isdisjoint(i['id'] for i in self.items))
        self.assertTrue(old_titles.isdisjoint(folded(i['title']) for i in self.items))

    def test_all_items_cite_resolvable_primary_reference_keys(self):
        sources = self.pack['sources']
        details = self.pack['sourceDetails']
        self.assertEqual(set(sources), set(details))
        used = set()
        for item in self.items:
            self.assertTrue(item['sourceRefs'])
            for key in item['sourceRefs']:
                with self.subTest(item=item['id'], key=key):
                    self.assertIn(key, sources)
                    self.assertIn(sources[key], item['content'])
                    url = urlsplit(sources[key])
                    self.assertEqual(url.scheme, 'https')
                    self.assertTrue(url.netloc)
                    self.assertEqual(details[key]['accessedAt'], '2026-11-02')
                    self.assertEqual(details[key]['url'], sources[key])
                    self.assertGreater(len(details[key]['scope']), 30)
                    used.add(key)
        self.assertEqual(used, set(sources), 'Sem bibliografia não utilizada.')

    def test_authorial_hooks_keep_explicit_review_and_safety_boundaries(self):
        editorial = self.pack['editorial']
        self.assertEqual(editorial['status'], 'revisao-medica-pendente')
        self.assertIs(editorial['patientData'], False)
        self.assertEqual(editorial['verifiedAt'], '2026-11-02')
        self.assertIn('sem vínculo com provas oficiais AMIB', editorial['purpose'])
        for item in self.items:
            with self.subTest(item=item['id']):
                self.assertEqual(item['reviewStatus'], 'revisao-medica-pendente')
                self.assertEqual(item['evidenceType'], 'gancho-autoral-baseado-em-diretriz')
                self.assertIn('Gancho autoral', item['content'])
                self.assertIn('não é escore validado', item['content'])
                self.assertIn('Revisão médica formal pendente', item['content'])
                self.assertIn(editorial['safety'], item['content'])
                self.assertIn('**Atenção:**', item['content'])
                self.assertGreaterEqual(len(item['letters']), 3)
                self.assertTrue(all(str(v).strip() for v in item['letters'].values()))

    def test_scope_qualifications_cover_high_risk_generalizations(self):
        combined = '\n'.join(item['content'] for item in self.items)
        self.assertIn('Ânion gap não é critério de resolução', combined)
        self.assertIn('acidose hiperclorêmica', combined)
        self.assertIn('rascunho KDIGO 2026', combined)
        self.assertIn('não deve determinar o encerramento da ressuscitação', combined)
        self.assertIn('não remove potássio', combined)
        self.assertIn('Não é indicação rotineira para qualquer paciente ventilado', combined)


if __name__ == '__main__':
    unittest.main()
