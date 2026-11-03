"""Regras de publicação: planos visíveis, cobrança fechada e backend fora do Pages."""
import json
import unittest
from pathlib import Path
from scripts_admin import build_public_site

ROOT = Path(__file__).resolve().parents[1]


class MonetizationPublicationTests(unittest.TestCase):
    def test_prices_match_server_and_public_catalog(self):
        public = json.loads((ROOT / 'planos/config.json').read_text())
        server = json.loads((ROOT / 'commerce/catalog.json').read_text())
        self.assertEqual(server['currency'], 'brl')
        self.assertEqual(server['interval'], 'month')
        previous = set()
        for plan, amount, count in zip(server['plans'], [4990, 9990, 14990], [6, 9, 12]):
            self.assertEqual(plan['amount'], amount)
            self.assertEqual(public['plans'][plan['id']]['unitAmount'], amount)
            self.assertEqual(len(plan['features']), count)
            self.assertTrue(previous.issubset(plan['features']))
            previous = set(plan['features'])

    def test_only_public_frontend_enters_allowlist(self):
        allowed = set(build_public_site.REQUIRED + build_public_site.OPTIONAL)
        self.assertTrue({'planos', 'membros'}.issubset(allowed))
        self.assertFalse({'commerce', 'mobile', 'comercializacao'} & allowed)
        self.assertIn('membros/', build_public_site.ANALYTICS_EXCLUDED_PREFIXES)

    def test_default_configuration_cannot_sell_or_register(self):
        config = json.loads((ROOT / 'planos/config.json').read_text())
        self.assertIs(config['salesEnabled'], False)
        for provider in config['providers'].values():
            self.assertIs(provider['enabled'], False)
            self.assertEqual(provider['checkoutUrl'], '')
        self.assertTrue(all(value == '' for value in json.loads((ROOT / 'membros/config.json').read_text()).values()))

    def test_home_discovers_plans_and_checkout_is_closed_without_js(self):
        self.assertIn('href="planos/"', (ROOT / 'index.html').read_text())
        html = (ROOT / 'planos/index.html').read_text()
        self.assertEqual(html.count('data-plan='), 3)
        self.assertEqual(html.count(' disabled>Em preparação</button>'), 3)
        self.assertIn('Lançamento em preparação', html)


if __name__ == '__main__':
    unittest.main()
