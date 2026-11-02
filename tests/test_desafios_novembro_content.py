"""Contrato e limites clínicos editoriais dos 30 novos desafios de novembro."""
import json
import re
import unittest
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / '10_DESAFIOS' / 'catalogo_expansao_30_20261102.json'
TOPICS = {
    'sepse-choque', 'ventilacao-sdra', 'infeccoes-antimicrobianos',
    'neurocritico', 'renal-eletrolitos', 'metabolico-endocrino',
    'cardiovascular', 'hematologia-trombose', 'gastro-hepato-nutricao',
    'sedacao-seguranca',
}


class NovemberClinicalChallenges(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads(PACK.read_text(encoding='utf-8'))
        cls.items = cls.pack['temi']
        cls.by_id = {item['id']: item for item in cls.items}

    def test_exact_increment_and_three_cases_per_topic(self):
        self.assertEqual(len(self.items), 30)
        self.assertEqual(self.pack['r3'], [])
        self.assertEqual(Counter(item['topicId'] for item in self.items),
                         Counter({topic: 3 for topic in TOPICS}))
        self.assertEqual(len(self.by_id), 30)
        self.assertEqual(len({item['title'] for item in self.items}), 30)

    def test_does_not_replace_or_duplicate_older_challenges(self):
        older_ids, older_titles = set(), set()
        for path in (ROOT / '10_DESAFIOS').glob('*.json'):
            if path == PACK:
                continue
            older = json.loads(path.read_text(encoding='utf-8'))
            for branch in ('temi', 'r3'):
                for item in older.get(branch, []):
                    older_ids.add(item['id'])
                    older_titles.add(item['title'].casefold())
        self.assertTrue(older_ids, 'A comparação exige os packs anteriores.')
        self.assertFalse(set(self.by_id) & older_ids)
        self.assertFalse({item['title'].casefold() for item in self.items} & older_titles)

    def test_each_case_has_search_metadata_reasoning_and_fiction_notice(self):
        for item in self.items:
            with self.subTest(id=item['id']):
                self.assertRegex(item['id'], r'^temi-nov26-[a-z0-9]+(?:-[a-z0-9]+)*$')
                self.assertEqual(item['date'], '2026-11-02')
                self.assertEqual(item['difficulty'], 'alta')
                self.assertEqual(item['reviewStatus'], 'revisao-medica-pendente')
                self.assertIn(item['topicLabel'], item['tags'])
                self.assertIn('TEMI', item['tags'])
                self.assertGreaterEqual(len(item['tags']), 5)
                self.assertTrue(item['subtopic'].strip())
                self.assertTrue(item['excerpt'].strip())
                for section in ('# ' + item['title'], '## Caso\nCaso fictício.',
                                '## Missão TEMI', '### ✅ Gabarito comentado',
                                '**Armadilha:**', '**Transferência:**',
                                'sem vínculo com questões oficiais da AMIB',
                                'revisão médica formal pendente'):
                    self.assertIn(section, item['content'])
                self.assertIn(self.pack['editorial']['safety'], item['content'])

    def test_sources_resolve_to_https_and_are_cited_in_case(self):
        sources = self.pack['sources']
        self.assertEqual(len(sources), 24)
        self.assertEqual(set(sources), set(self.pack['sourceDetails']))
        for item in self.items:
            with self.subTest(id=item['id']):
                self.assertTrue(item['sourceRefs'])
                for ref in item['sourceRefs']:
                    self.assertIn(ref, sources)
                    parsed = urlparse(sources[ref])
                    self.assertEqual(parsed.scheme, 'https')
                    self.assertTrue(parsed.netloc)
                    self.assertIn(sources[ref], item['content'])
                    self.assertEqual(self.pack['sourceDetails'][ref]['verifiedAt'], '2026-11-02')

    def test_no_claim_of_human_review_or_official_exam_authorship(self):
        editorial = self.pack['editorial']
        self.assertFalse(editorial['patientData'])
        self.assertEqual(editorial['status'], 'revisao-medica-pendente')
        self.assertIn('revisão humana pendente', editorial['authorship'])
        self.assertIn('casos inteiramente fictícios', editorial['purpose'])
        self.assertNotIn('Public-Review-Draft', self.pack['sources']['KDIGO2012NOV'])
        self.assertIn('rascunho', self.pack['sourceDetails']['KDIGO2012NOV']['scope'])

    def test_high_risk_distinctions_are_explicit(self):
        cases = self.by_id
        hyperk = cases['temi-nov26-hiperk-ecg-normal']['content']
        self.assertIn('Hipercalemia grave exige manejo urgente', hyperk)
        self.assertIn('não recomenda cálcio IV apenas por um ECG normal', hyperk)
        iam = cases['temi-nov26-iam-hb-indicacao']['content']
        self.assertIn('condicional', iam)
        self.assertIn('baixa certeza', iam)
        self.assertIn('não uma ordem automática', iam)
        neuro = cases['temi-nov26-prognostico-sedacao']['content']
        self.assertIn('confundimento por sedação e temperatura', neuro)
        delirium = cases['temi-nov26-delirium-antipsicotico']['content']
        self.assertIn('não conseguiu recomendar a favor ou contra', delirium)
        tre = cases['temi-nov26-tre-fio2']['content']
        self.assertIn('não autoriza mantê-los', tre)


if __name__ == '__main__':
    unittest.main()
