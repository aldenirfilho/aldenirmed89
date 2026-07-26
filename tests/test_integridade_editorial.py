#!/usr/bin/env python3
"""Contratos da Estação Documentação e Integridade Editorial."""

from __future__ import annotations

import re
import unicodedata
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PORTAL = ROOT / "19_Integridade_Editorial"


def normalize(value: str) -> str:
    without_accents = "".join(
        character
        for character in unicodedata.normalize("NFD", value)
        if unicodedata.category(character) != "Mn"
    ).lower()
    return re.sub(r"\s+", " ", without_accents)


class IntegridadeEditorialTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (PORTAL / "index.html").read_text(encoding="utf-8")
        cls.readme = (PORTAL / "README.md").read_text(encoding="utf-8")
        cls.plain = normalize(cls.html)

    def test_portal_is_accessible_responsive_and_printable(self) -> None:
        self.assertIn('<html lang="pt-BR">', self.html)
        self.assertIn('name="viewport"', self.html)
        self.assertIn('class="skip" href="#conteudo"', self.html)
        self.assertIn('aria-live="polite"', self.html)
        self.assertIn(":focus-visible", self.html)
        self.assertIn("@media(max-width:560px)", self.html)
        self.assertIn("@media(prefers-reduced-motion:reduce)", self.html)
        self.assertIn("@media print", self.html)
        self.assertIn('type="button" onclick="window.print()"', self.html)

    def test_required_editorial_sections_and_gate_exist(self) -> None:
        for marker in (
            "Documentação e Integridade Editorial",
            'id="gate"',
            'id="clinica"',
            'id="politica"',
            'id="correcoes"',
            'id="privacidade"',
            'id="direitos"',
            'id="autoria"',
            'id="fontes"',
            'id="monitoramento"',
            'id="contato"',
            'id="editorialGate"',
            "Bloqueio editorial.",
            "Mantenha o material privado",
            "Elegível para revisão final humana.",
        ):
            self.assertIn(marker, self.html)

        self.assertEqual(self.html.count("data-gate>"), 6)
        self.assertIn('fetch("data/revision-log.json"', self.html)
        self.assertNotIn("XMLHttpRequest", self.html)

    def test_public_policy_uses_only_requested_official_sources(self) -> None:
        expected = (
            "https://www.planalto.gov.br/ccivil_03/leis/l9610.htm",
            "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
            "https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2023/2336",
            "https://publicidademedica.cfm.org.br/",
            "https://www.gov.br/bn/pt-br/atuacao/direitos-autorais-1/direitos-autorais",
            "https://www.gov.br/inpi/pt-br/servicos/marcas",
            "https://creativecommons.org/chooser/",
            "https://creativecommons.org/faq/",
        )
        for source in expected:
            self.assertIn(source, self.html)
            self.assertIn(source, self.readme)

        self.assertGreaterEqual(self.html.count('datetime="2026-07-25"'), 3)
        external_links = re.findall(r'href="(https?://[^"]+)"', self.html)
        allowed_hosts = (
            "https://www.planalto.gov.br/",
            "https://sistemas.cfm.org.br/",
            "https://publicidademedica.cfm.org.br/",
            "https://www.gov.br/",
            "https://creativecommons.org/",
        )
        self.assertTrue(external_links)
        for link in external_links:
            self.assertTrue(link.startswith(allowed_hosts), link)

    def test_attribution_is_discreet_and_does_not_publish_credentials(self) -> None:
        self.assertIn("ATV · TURBO TEMI · ALD 360", self.html)
        self.assertIn("Aldenir Rocha de Oliveira Filho", self.html)
        for role in (
            "idealizador",
            "editor",
            "criador",
            "codificador",
            "produtor",
            "atualizador",
            "patrocinador independente",
        ):
            self.assertIn(role, self.plain)

        for unverified_claim in (
            "mestre",
            "especialista em",
            "crm-",
            "rqe",
            "residencia de anestesia",
            "divorcio",
        ):
            self.assertNotIn(unverified_claim, self.plain)

    def test_rights_are_reserved_without_activating_irrevocable_license(self) -> None:
        for marker in (
            "Leitura gratuita; licença ainda não escolhida.",
            "com direitos reservados",
            "nenhuma está ativa",
            "Nenhuma licença Creative Commons está ativa",
            "natureza irrevogável",
            "Licença de software separada",
        ):
            self.assertIn(marker, self.html)

        self.assertNotIn('rel="license"', self.html)
        self.assertNotIn("creativecommons.org/licenses/", self.html)
        self.assertNotIn("licensed under", self.plain)

    def test_policy_rejects_false_legal_or_technical_certainty(self) -> None:
        for required_limit in (
            "não constituem prova jurídica absoluta",
            "não impedem cópia ou fraude",
            "não garantem evitar reclamações ou processos",
            "não é marca registrada",
            "não é assessoria jurídica",
            "ideias, métodos, sistemas, fatos e conteúdo científico/técnico",
        ):
            self.assertIn(normalize(required_limit), self.plain)

        forbidden_patterns = (
            r"blindagem juridica",
            r"protecao (?:juridica )?total",
            r"garantia de (?:que nao havera|evitar) processo",
            r"(?:selo|hash|git) (?:e|é|eh) prova juridica",
            r"impede (?:a )?copia",
            r"certificacao oficial atv",
            r"marca registrada atv",
        )
        for pattern in forbidden_patterns:
            self.assertIsNone(re.search(pattern, self.plain), pattern)

        self.assertNotIn("®", self.html)
        self.assertNotIn("™", self.html)

    def test_privacy_and_manifestation_route_do_not_invent_contact(self) -> None:
        self.assertIn("Pode ser anônima ou identificada.", self.html)
        self.assertIn("Dados pessoais não devem ser expostos publicamente.", self.html)
        self.assertIn(
            normalize("esta página estática não possui formulário de cadastro"),
            self.plain,
        )
        self.assertIn("../18_Centro_Tripulacao/index.html?canal=manifestacao#listening", self.html)
        self.assertIn(
            normalize(
                "O canal institucional e o e-mail definitivo só devem ser anunciados "
                "quando estiverem realmente configurados."
            ),
            self.plain,
        )
        self.assertNotIn("mailto:", self.html)

    def test_continuous_protection_and_public_feed_are_documented(self) -> None:
        for marker in (
            "Processo de padrão profissional",
            "Automatizar a vigilância, preservar a decisão humana.",
            "Gate incremental",
            "Monitor oficial diário",
            "Proveniência verificável",
            "Resposta a incidentes",
            'href="DOCUMENTACAO_PROTETIVA.md"',
            'href="CHECKLIST_PUBLICACAO.md"',
            'href="PROTOCOLO_INCIDENTES.md"',
            'id="integrityFeed"',
            'fetch("data/revision-log.json"',
            'fetch("data/legal-sources.json"',
            'id="legalMonitorStatus"',
            "nunca uma interpretação publicada",
        ):
            self.assertIn(marker, self.html)

        for relative in (
            "DOCUMENTACAO_PROTETIVA.md",
            "CHECKLIST_PUBLICACAO.md",
            "PROTOCOLO_INCIDENTES.md",
            "data/revision-log.json",
        ):
            self.assertTrue((PORTAL / relative).is_file(), relative)


if __name__ == "__main__":
    unittest.main()
