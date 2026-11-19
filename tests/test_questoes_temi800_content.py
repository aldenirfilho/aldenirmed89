"""Contrato editorial do banco TEMI 800 com imagens: contagem, gabarito, figuras e fontes."""
import collections
import json
from pathlib import Path
import re
import subprocess
import unittest
import unicodedata
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / 'questoes/data/qbank_temi_800_2026.js'
PAGE = ROOT / 'questoes/temi_800_imagens_questoes.html'
RENDERER = ROOT / 'questoes/assets/temi800-figuras.js'
HUB = ROOT / 'questoes/data/hub_qbanks.js'
TEMPLATE_KINDS = {'ecg', 'ecg12', 'curva', 'capno', 'pic', 'art', 'pvc', 'pocus', 'tc', 'rx', 'rotem'}
DATA_KINDS = {'mon', 'gaso', 'lab', 'vm', 'card', 'trend'}
DESCRIBED_KINDS = {'ecg', 'ecg12', 'curva', 'pocus'}


def normalize(text):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFKD', text.lower()) if not unicodedata.combining(c)).split())


class Temi800ContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        source = BANK.read_text(encoding='utf-8')
        match = re.fullmatch(r'//[^\n]*\nconst TEMI_800_2026_QBANK = (\{[\s\S]*\});\s*', source)
        if not match:
            raise AssertionError('Banco deve ser uma constante clássica contendo JSON válido.')
        cls.bank = json.loads(match[1])
        cls.questions = cls.bank['questions']

    def test_exactly_800_stable_unique_ids(self):
        self.assertEqual(len(self.questions), 800)
        self.assertEqual([q['id'] for q in self.questions], [f'TEMI-800-{n:03d}' for n in range(1, 801)])

    def test_twenty_blocks_with_forty_questions(self):
        blocks = {b['id'] for b in self.bank['blocks']}
        self.assertEqual(len(blocks), 20)
        self.assertEqual(collections.Counter(q['block'] for q in self.questions), {b: 40 for b in blocks})
        for q in self.questions:
            self.assertEqual(q['block'], q['topicId'])
            self.assertTrue(q['subtopic'].strip())
            self.assertIn(q['difficulty'], {'Médio', 'Difícil'})

    def test_five_options_and_rationales(self):
        for q in self.questions:
            with self.subTest(q=q['id']):
                self.assertEqual(set(q['options']), set('ABCDE'))
                self.assertEqual(set(q['rationales']), set('ABCDE'))
                self.assertIn(q['answer'], 'ABCDE')
                self.assertEqual(len({normalize(x) for x in q['options'].values()}), 5)
                for letter in 'ABCDE':
                    prefix = 'Correta.' if letter == q['answer'] else 'Incorreta.'
                    self.assertTrue(q['rationales'][letter].startswith(prefix))
                self.assertTrue(q['synthesis'].strip())

    def test_answer_key_is_balanced(self):
        self.assertEqual(collections.Counter(q['answer'] for q in self.questions), {k: 160 for k in 'ABCDE'})

    def test_every_question_has_figure_with_alt_text(self):
        for q in self.questions:
            with self.subTest(q=q['id']):
                image = q['image']
                self.assertIn(image['kind'], TEMPLATE_KINDS | DATA_KINDS)
                self.assertTrue(image['caption'].strip())
                self.assertGreater(len(image['alt']), 10)
                if image['kind'] in TEMPLATE_KINDS:
                    self.assertTrue(image['reading'].strip())
                self.assertIn('imagem-' + image['kind'], q['tags'])

    def test_pre_answer_descriptions_cover_ecg_ventilation_and_pocus(self):
        input_images = {q['id']: q['image'] for q in self.questions}
        script = '''
            const {readFileSync} = require('node:fs');
            const {describe} = require(process.argv[1]);
            const images = JSON.parse(readFileSync(0, 'utf8'));
            console.log(JSON.stringify(Object.fromEntries(
              Object.entries(images).map(([id, image]) => [id, describe(image)])
            )));
        '''
        result = subprocess.run(
            ['node', '-e', script, str(RENDERER)],
            input=json.dumps(input_images), text=True, capture_output=True, check=True,
        )
        descriptions = json.loads(result.stdout)
        for q in self.questions:
            description = descriptions[q['id']]
            with self.subTest(q=q['id']):
                if q['image']['kind'] in DESCRIBED_KINDS:
                    self.assertGreater(len(description), 80)
                    self.assertNotIn(normalize(q['image']['reading']), normalize(description))
                    self.assertNotIn('descrita no comentario', normalize(description))
                else:
                    self.assertEqual(description, '')

        for id_suffix, expected in {
            '083': ('Pressão de pico 32', 'Pressão de platô 27', 'PEEP 8'),
            '157': ('linhas horizontais paralelas', 'o padrão passa a granular'),
            '201': ('Ondulações rápidas, irregulares', 'QRS'),
            '241': ('DII, DIII e aVF', 'em DI e aVL'),
            '354': ('6,8 milímetros',),
            '765': ('textura é granular',),
            '767': ('2,6 centímetros', 'menor que 10 por cento'),
        }.items():
            for text in expected:
                self.assertIn(text, descriptions[f'TEMI-800-{id_suffix}'])

    def test_case_context_is_self_contained_and_unique(self):
        seen = set()
        for q in self.questions:
            with self.subTest(q=q['id']):
                context = normalize(q['stem'] + ' ' + q['image']['alt'])
                self.assertGreater(len(context), 100)
                self.assertNotIn(context, seen)
                seen.add(context)

    def test_sources_are_https_dated_and_referenced(self):
        sources = self.bank['sources']
        for key, source in sources.items():
            with self.subTest(source=key):
                self.assertEqual(urlparse(source['url']).scheme, 'https')
                self.assertRegex(source['verifiedAt'], r'^\d{4}-\d{2}-\d{2}$')
                self.assertTrue(source['label'].strip())
        used = {ref for q in self.questions for ref in q['sourceRefs']}
        self.assertEqual(used, set(sources))

    def test_meta_declares_pending_review_and_no_patient_data(self):
        meta = self.bank['meta']
        self.assertFalse(meta['patientData'])
        self.assertFalse(meta['claimsHumanClinicalReview'])
        self.assertEqual(meta['status'], 'revisao-medica-pendente')
        self.assertEqual(meta['clinicalReviewStatus'], 'public-preview-pending-formal-medical-review')
        self.assertIn('fictícios', meta['purpose'])
        self.assertTrue(all(q['reviewStatus'] == 'revisao-medica-pendente' for q in self.questions))

    def test_page_renderer_and_hub_are_wired(self):
        html = PAGE.read_text(encoding='utf-8')
        self.assertIn('assets/temi800-figuras.js', html)
        self.assertIn('data/qbank_temi_800_2026.js', html)
        self.assertIn('TEMI_800_2026_QBANK', html)
        self.assertIn('Temi800Figuras', RENDERER.read_text(encoding='utf-8'))
        hub = HUB.read_text(encoding='utf-8')
        self.assertIn('"url": "temi_800_imagens_questoes.html"', hub)
        self.assertIn('"questions": 800', hub)


if __name__ == '__main__':
    unittest.main()
