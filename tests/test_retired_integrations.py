from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
ARCHITECTURE = ROOT / "docs_projeto/arquitetura/nexus-e360x-render-22x"
MANIFEST = ARCHITECTURE / "NEXUS_E360X_SYNC_MANIFEST_PUBLIC_v2.1.yaml"
ORCHESTRATOR = ARCHITECTURE / "NEXUS_E360X_PIPELINE_ORCHESTRATOR_v2.0.md"
RETIRED = ("airtable", "asana", "confluence", "jira")


def indented_block(text: str, heading: str, indent: int) -> str:
    pattern = rf"(?ms)^{' ' * indent}{re.escape(heading)}:\n(.*?)(?=^{' ' * indent}\S[^\n]*:\s*(?:\n|$)|\Z)"
    match = re.search(pattern, text)
    if match is None:
        raise AssertionError(f"Bloco YAML ausente: {heading}")
    return match.group(1)


class RetiredIntegrationsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = MANIFEST.read_text(encoding="utf-8")
        cls.orchestrator = ORCHESTRATOR.read_text(encoding="utf-8")

    def test_cancelled_accounts_are_explicitly_retired_and_blocked(self):
        retired = indented_block(self.manifest, "retired_accounts", 2)
        for service in RETIRED:
            service_block = indented_block(retired, service, 4)
            self.assertIn("account_state: RETIRED_ACCOUNT", service_block)
            self.assertIn("routing_state: BLOCKED", service_block)
            self.assertIn("active_route: false", service_block)

    def test_cancelled_accounts_are_not_active_private_platforms(self):
        registry = indented_block(self.manifest, "private_registry", 2)
        platforms = indented_block(registry, "platforms", 4)
        listed = {
            match.group(1)
            for match in re.finditer(r"(?m)^\s+-\s+([a-z0-9_-]+)\s*$", platforms)
        }
        self.assertTrue({"notion", "google_drive", "figma"}.issubset(listed))
        self.assertTrue(set(RETIRED).isdisjoint(listed))
        self.assertNotIn("atlassian", listed)

    def test_source_of_truth_uses_local_fail_closed_replacements(self):
        source = indented_block(self.manifest, "source_of_truth", 0)
        self.assertIn("doctrine: local_versioned_markdown", source)
        self.assertIn("execution: local_backlog_and_github_draft_pr", source)
        self.assertNotRegex(
            source,
            r"(?mi)^\s*(?:doctrine|execution):\s*(?:airtable|asana|confluence|jira|atlassian)\s*$",
        )

    def test_automation_policy_blocks_every_cancelled_destination(self):
        policy = indented_block(self.manifest, "automation_policy", 2)
        self.assertIn("fail_closed: true", policy)
        self.assertIn("automatic_reactivation: forbidden", policy)
        destinations = indented_block(policy, "prohibited_destinations", 4)
        for service in RETIRED:
            self.assertRegex(destinations, rf"(?m)^\s+-\s+{service}\s*$")

    def test_historical_atlassian_keys_are_redacted_and_inactive(self):
        history = indented_block(self.manifest, "historical_records", 2)
        self.assertIn("retention: historical_trace_only", history)
        self.assertIn("routing_active: false", history)
        self.assertIn("status: BLOCKED", history)
        self.assertIn("public_identifiers: REDACTED", history)
        self.assertIn("record_count: 3", history)
        self.assertIn("private_lookup: local_vault_only", history)
        self.assertNotRegex(history, r"(?m)^\s+(?:jira_project|epic|implementation):")

    def test_orchestrator_has_no_cancelled_active_routes(self):
        self.assertNotIn("| doutrina e decisões | Confluence |", self.orchestrator)
        self.assertNotIn("| tarefas e aceite | Jira |", self.orchestrator)
        self.assertNotIn("- **Confluence:** arquitetura", self.orchestrator)
        self.assertNotIn("- **Jira:** backlog", self.orchestrator)
        for service in ("Airtable", "Asana", "Confluence", "Jira"):
            self.assertRegex(
                self.orchestrator,
                rf"(?m)^\| {service} \| `RETIRED_ACCOUNT / BLOCKED` \|",
            )


if __name__ == "__main__":
    unittest.main()
