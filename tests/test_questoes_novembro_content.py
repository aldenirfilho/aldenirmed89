"""Contrato editorial do lote autoral TEMI de novembro: contagem, mapa e atribuição."""
import collections
import json
from pathlib import Path
import re
import unittest
import unicodedata
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / 'questoes/data/qbank_temi_novembro_2026.js'
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


def normalize(text):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFKD', text.lower()) if not unicodedata.combining(c)).split())


class NovembroTemiContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        source = BANK.read_text(encoding='utf-8')
        match = re.fullmatch(r'//[^\n]*\nconst TEMI_NOVEMBRO_2026_QBANK = (\{[\s\S]*\});\s*', source)
        if not match:
            raise AssertionError('Banco deve ser uma constante clássica contendo JSON válido.')
        cls.bank = json.loads(match[1])
        cls.questions = cls.bank['questions']

    def test_exactly_eighty_stable_unique_ids(self):
        self.assertEqual(len(self.questions), 80)
        self.assertEqual([q['id'] for q in self.questions], [f'TEMI-NOV26-{n:03d}' for n in range(1, 81)])

    def test_eight_questions_per_thematic_filter(self):
        self.assertEqual(collections.Counter(q['topicId'] for q in self.questions), {key: 8 for key in TOPICS})
        self.assertEqual({b['id']: b['label'] for b in self.bank['blocks']}, TOPICS)
        for q in self.questions:
            self.assertEqual(q['block'], q['topicId'])
            self.assertEqual(q['topicLabel'], TOPICS[q['topicId']])
            self.assertTrue(q['subtopic'].strip())
            self.assertIn(q['topicId'], q['tags'])

    def test_five_alternatives_and_one_correct_rationale(self):
        for q in self.questions:
            with self.subTest(q=q['id']):
                self.assertEqual(set(q['options']), set('ABCDE'))
                self.assertEqual(set(q['rationales']), set('ABCDE'))
                self.assertIn(q['answer'], 'ABCDE')
                self.assertEqual(len(set(normalize(x) for x in q['options'].values())), 5)
                for letter in 'ABCDE':
                    self.assertGreaterEqual(len(q['options'][letter]), 12)
                    self.assertGreaterEqual(len(q['rationales'][letter]), 24)
                    prefix = 'Correta. ' if letter == q['answer'] else 'Incorreta. '
                    self.assertTrue(q['rationales'][letter].startswith(prefix))
        self.assertEqual(collections.Counter(q['answer'] for q in self.questions), {letter: 16 for letter in 'ABCDE'})

    def test_unique_new_stems_and_no_exact_reuse_from_older_banks(self):
        new_stems = [normalize(q['stem']) for q in self.questions]
        self.assertEqual(len(set(new_stems)), 80)
        older = set()
        for path in (ROOT / 'questoes/data').glob('qbank*.js'):
            if path == BANK:
                continue
            text = path.read_text(encoding='utf-8')
            for match in re.finditer(r'^\s*(?:"stem"|stem)\s*:\s*("(?:\\.|[^"\\])*")', text, re.M):
                older.add(normalize(json.loads(match[1])))
        self.assertFalse(set(new_stems) & older)

    def test_each_item_has_resolvable_primary_references(self):
        sources = self.bank['sources']
        for q in self.questions:
            self.assertTrue(q['sourceRefs'])
            for ref in q['sourceRefs']:
                self.assertIn(ref, sources)
        for key, source in sources.items():
            with self.subTest(source=key):
                parsed = urlparse(source['url'])
                self.assertEqual(parsed.scheme, 'https')
                self.assertTrue(parsed.netloc)
                self.assertEqual(source['verifiedAt'], '2026-11-02')
                self.assertTrue(source['scope'].strip())
                self.assertTrue(source['label'].strip())

    def test_editorial_limits_are_not_promoted_to_human_approval(self):
        meta = self.bank['meta']
        self.assertEqual(meta['status'], 'revisao-medica-pendente')
        self.assertFalse(meta['patientData'])
        self.assertFalse(meta['claimsHumanClinicalReview'])
        self.assertIn('não oficiais', meta['purpose'])
        self.assertIn('casos inteiramente fictícios', meta['purpose'])
        self.assertIn('Não substitui o julgamento clínico', meta['safety'])
        self.assertTrue(all(q['reviewStatus'] == 'revisao-medica-pendente' for q in self.questions))

    def test_readable_complete_items_and_declared_source_limits(self):
        for q in self.questions:
            self.assertGreater(len(q['stem']), 100)
            self.assertTrue(q['synthesis'].strip())
            self.assertTrue(q['pearl'].startswith('🧠 '))
            self.assertIn(q['difficulty'], ('Médio', 'Difícil'))
        self.assertIn('rascunho', self.bank['sources']['NOV_KDIGO12']['scope'])
        self.assertIn('Abstract', self.bank['sources']['NOV_HSA26']['scope'])
        self.assertIn('Parte 1', self.bank['sources']['NOV_SAB26']['scope'])


if __name__ == '__main__':
    unittest.main()
