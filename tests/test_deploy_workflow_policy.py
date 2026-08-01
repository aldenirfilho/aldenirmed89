#!/usr/bin/env python3
"""Trava de publicação: PR e workflow manual validam, mas não publicam."""

from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(encoding="utf-8")
PUSH_MAIN = "github.event_name == 'push' && github.ref == 'refs/heads/main'"


class DeployWorkflowPolicyTests(unittest.TestCase):
    def test_only_push_to_main_can_setup_upload_or_deploy_pages(self) -> None:
        self.assertEqual(WORKFLOW.count(f"if: {PUSH_MAIN}"), 3)
        self.assertNotIn("if: github.event_name != 'pull_request'", WORKFLOW)
        self.assertEqual(WORKFLOW.count("actions/deploy-pages@"), 1)

    def test_manual_dispatch_remains_validation_only(self) -> None:
        self.assertIn("workflow_dispatch:", WORKFLOW)
        self.assertIn("pull_request:", WORKFLOW)
        self.assertIn("branches:\n      - main", WORKFLOW)

    def test_pages_permissions_are_scoped_to_deploy_job(self) -> None:
        global_permissions = WORKFLOW.split("concurrency:", 1)[0]
        self.assertIn("permissions:\n  contents: read", global_permissions)
        self.assertNotIn("pages: write", global_permissions)
        deploy = WORKFLOW.split("  deploy:\n", 1)[1]
        self.assertIn("permissions:\n      contents: read\n      pages: write\n      id-token: write", deploy)

    def test_cosmos_smoke_checks_are_part_of_the_candidate_build(self) -> None:
        for marker in (
            "site/23_Cosmos_NEXUS/index.html",
            "site/23_Cosmos_NEXUS/data/sync-contract.json",
            "site/23_Cosmos_NEXUS/data/document-sync-contract.json",
            "site/23_Cosmos_NEXUS/data/governance-code-contract.json",
            "site/23_Cosmos_NEXUS/assets/atlas",
        ):
            self.assertIn(marker, WORKFLOW)


if __name__ == "__main__":
    unittest.main()
