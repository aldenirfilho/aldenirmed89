#!/usr/bin/env python3
"""Regressões dos links publicados para o Centro da Tripulação."""

from __future__ import annotations

import re
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parents[1]
ALLOWED_VIEWS = {"", "public", "listening", "settings", "admin"}
ALLOWED_CHANNELS = {"manifestacao", "correcao", "uso-indevido"}


class CrewCenterDeepLinkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.app = (
            ROOT / "18_Centro_Tripulacao/assets/app.js"
        ).read_text(encoding="utf-8")
        cls.integrity = (
            ROOT / "19_Integridade_Editorial/index.html"
        ).read_text(encoding="utf-8")
        cls.incident_protocol = (
            ROOT / "19_Integridade_Editorial/PROTOCOLO_INCIDENTES.md"
        ).read_text(encoding="utf-8")
        cls.aldenir = (
            ROOT / "20_Conheca_Aldenir/index.html"
        ).read_text(encoding="utf-8")

    def test_all_html_links_use_canonical_views(self) -> None:
        links: list[str] = []
        for source in (self.integrity, self.aldenir):
            links.extend(
                re.findall(
                    r'href="([^"]*18_Centro_Tripulacao/[^"]*)"',
                    source,
                )
            )
        self.assertGreaterEqual(len(links), 7)
        for link in links:
            parsed = urlsplit(link)
            self.assertIn(parsed.fragment, ALLOWED_VIEWS, link)
            channel = parse_qs(parsed.query).get("canal", [])
            if channel:
                self.assertEqual(len(channel), 1, link)
                self.assertIn(channel[0], ALLOWED_CHANNELS, link)
                self.assertEqual(parsed.fragment, "listening", link)

    def test_incident_protocol_documents_canonical_listening_links(self) -> None:
        documented = re.findall(
            r"`([^`]*18_Centro_Tripulacao/[^`]*)`",
            self.incident_protocol,
        )
        self.assertEqual(len(documented), 3)
        for link in documented:
            parsed = urlsplit(link)
            self.assertEqual(parsed.fragment, "listening", link)
            channel = parse_qs(parsed.query).get("canal", [])
            self.assertEqual(len(channel), 1, link)
            self.assertIn(channel[0], ALLOWED_CHANNELS, link)

    def test_legacy_aliases_remain_safe_and_owner_alias_only_opens_admin_gate(self) -> None:
        for marker in (
            'listeningPanel: "listening"',
            'manifestacao: "listening"',
            'ownerNotebook: "admin"',
        ):
            self.assertIn(marker, self.app)
        self.assertNotIn('ownerNotebook: "owner"', self.app)

    def test_obsolete_fragments_are_not_published(self) -> None:
        published = self.integrity + self.incident_protocol + self.aldenir
        for fragment in ("#manifestacao", "#listeningPanel", "#ownerNotebook"):
            self.assertNotIn(fragment, published)


if __name__ == "__main__":
    unittest.main()
