#!/usr/bin/env python3
"""Validador fail-closed do roteiro público de ativação.

O validador é deliberadamente somente leitura. Ele nunca imprime valores do
roadmap: os diagnósticos contêm apenas código, caminho estrutural e uma mensagem
estática, para que uma credencial acidental não seja repetida no terminal ou CI.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence
from urllib.parse import parse_qsl, urlsplit


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ROADMAP = ROOT / "21_Central_Ativacao" / "data" / "roadmap.json"

SCHEMA_VERSION = "1.0.0"
ALLOWED_STATUSES = frozenset({"live", "ready", "owner-action", "blocked", "planned"})
ALLOWED_ACTORS = frozenset({"owner", "codex", "joint"})

# A lista fica no código para que um roadmap adulterado não possa autorizar o
# próprio domínio. Subdomínios legítimos são aceitos por limite de rótulo DNS.
OFFICIAL_DOMAIN_ALLOWLIST = frozenset(
    {
        "aldenirfilho.github.io",
        "apple.com",
        "brevo.com",
        "cfm.org.br",
        "cloudflare.com",
        "github.com",
        "githubusercontent.com",
        "google.com",
        "mailgun.com",
        "microsoft.com",
        "netlify.com",
        "openai.com",
        "planalto.gov.br",
        "resend.com",
        "sendgrid.com",
        "spotify.com",
        "supabase.co",
        "supabase.com",
        "vercel.com",
    }
)

ID_PATTERN = re.compile(r"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$")
URL_PATTERN = re.compile(r"(?i)\b(?:https?|ftp)://[^\s<>{}\[\]\"']+")
SENSITIVE_KEY_PATTERN = re.compile(
    r"(?i)(?:"
    r"api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key|"
    r"service[_-]?role(?:[_-]?key)?|client[_-]?secret|password|passwd|senha|"
    r"credential(?:[_-]?value)?|secret"
    r")"
)
ASSIGNED_SECRET_PATTERN = re.compile(
    r"(?i)\b(?:token|api[_-]?key|secret|chave|senha|password|passwd)"
    r"\s*[:=]\s*([^\s,;]+)"
)
JWT_PATTERN = re.compile(
    r"(?<![A-Za-z0-9_-])"
    r"([A-Za-z0-9_-]{8,})\.([A-Za-z0-9_-]{8,})\.([A-Za-z0-9_-]{8,})"
    r"(?![A-Za-z0-9_-])"
)
HIGH_CONFIDENCE_SECRET_PATTERNS = (
    re.compile(r"(?<![A-Za-z0-9_])sb_secret_[A-Za-z0-9_-]{8,}"),
    re.compile(r"(?<![A-Za-z0-9_-])sk-[A-Za-z0-9_-]{16,}"),
    re.compile(r"(?<![A-Za-z0-9_])github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"(?<![A-Za-z0-9_])gh[pousr]_[A-Za-z0-9]{20,}"),
    re.compile(r"(?<![A-Z0-9])AKIA[A-Z0-9]{16}(?![A-Z0-9])"),
)
PLACEHOLDER_VALUES = frozenset(
    {
        "",
        "-",
        "***",
        "<redacted>",
        "<placeholder>",
        "redacted",
        "placeholder",
        "preencher no painel",
        "configurar no painel",
        "não versionar",
        "nao versionar",
    }
)


@dataclass(frozen=True)
class Issue:
    code: str
    path: str
    message: str


def _issue(issues: list[Issue], code: str, path: str, message: str) -> None:
    issues.append(Issue(code=code, path=path, message=message))


def _nonempty_text(value: Any, *, minimum: int = 1, maximum: int = 1000) -> bool:
    return isinstance(value, str) and minimum <= len(value.strip()) <= maximum


def _nonempty_text_list(value: Any, *, maximum_items: int = 50) -> bool:
    return (
        isinstance(value, list)
        and 1 <= len(value) <= maximum_items
        and all(_nonempty_text(item, maximum=500) for item in value)
    )


def _valid_time(value: Any) -> bool:
    if not _nonempty_text(value, maximum=80):
        return False
    text = value.strip()
    return bool(re.search(r"\d", text)) and text not in {"0", "0 min", "0 minuto"}


def _host_is_allowed(hostname: str) -> bool:
    host = hostname.rstrip(".").lower()
    return any(host == domain or host.endswith(f".{domain}") for domain in OFFICIAL_DOMAIN_ALLOWLIST)


def _trim_url_punctuation(value: str) -> str:
    return value.rstrip(".,;:!?)]}")


def _validate_url(raw_url: str, path: str, issues: list[Issue]) -> None:
    url = _trim_url_punctuation(raw_url)
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError:
        _issue(issues, "url.invalid", path, "URL inválida.")
        return
    if parsed.scheme.lower() != "https":
        _issue(issues, "url.https_required", path, "URL deve usar HTTPS.")
        return
    if not parsed.hostname or not _host_is_allowed(parsed.hostname):
        _issue(issues, "url.domain_not_allowed", path, "Domínio não consta na allowlist oficial.")
    if parsed.username or parsed.password:
        _issue(issues, "url.userinfo_forbidden", path, "URL não pode conter credenciais.")
    if port not in (None, 443):
        _issue(issues, "url.port_forbidden", path, "URL HTTPS deve usar a porta padrão.")
    for key, value in parse_qsl(parsed.query, keep_blank_values=True):
        if SENSITIVE_KEY_PATTERN.search(key) or re.search(
            r"(?i)(?:^|_)(?:token|key|chave|signature|sig)(?:$|_)", key
        ):
            if value.strip():
                _issue(
                    issues,
                    "url.credential_query",
                    path,
                    "URL não pode conter credencial preenchida na query string.",
                )
                break


def _decode_base64url_json(segment: str) -> Mapping[str, Any] | None:
    try:
        padded = segment + "=" * (-len(segment) % 4)
        decoded = base64.urlsafe_b64decode(padded.encode("ascii"))
        value = json.loads(decoded.decode("utf-8"))
    except (ValueError, UnicodeError, json.JSONDecodeError):
        return None
    return value if isinstance(value, dict) else None


def _contains_service_role_jwt(value: str) -> bool:
    for match in JWT_PATTERN.finditer(value):
        payload = _decode_base64url_json(match.group(2))
        if not payload:
            continue
        role = str(payload.get("role", "")).strip().lower()
        if role == "service_role":
            return True
    return False


def _looks_like_placeholder(value: str) -> bool:
    normalized = value.strip().strip("\"'.,;:!?()[]{}").lower()
    return (
        normalized in PLACEHOLDER_VALUES
        or (normalized.startswith("<") and normalized.endswith(">"))
        or normalized.startswith("${")
        or normalized.startswith("seu-")
        or normalized.startswith("sua-")
    )


def _value_has_secret(value: str) -> bool:
    if any(pattern.search(value) for pattern in HIGH_CONFIDENCE_SECRET_PATTERNS):
        return True
    if _contains_service_role_jwt(value):
        return True
    for match in ASSIGNED_SECRET_PATTERN.finditer(value):
        candidate = match.group(1).strip("\"'")
        if candidate and not _looks_like_placeholder(candidate):
            return True
    return False


def _walk_values(value: Any, path: str = "$") -> Iterable[tuple[str, str | None, Any]]:
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            yield child_path, str(key), child
            yield from _walk_values(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            child_path = f"{path}[{index}]"
            yield child_path, None, child
            yield from _walk_values(child, child_path)


def _validate_urls_and_secrets(document: Mapping[str, Any], issues: list[Issue]) -> None:
    for path, key, value in _walk_values(document):
        if not isinstance(value, str):
            continue

        if _value_has_secret(value):
            _issue(
                issues,
                "secret.detected",
                path,
                "Valor com padrão de credencial foi bloqueado.",
            )

        if key and SENSITIVE_KEY_PATTERN.search(key):
            if value.strip() and not _looks_like_placeholder(value):
                _issue(
                    issues,
                    "secret.sensitive_field_filled",
                    path,
                    "Campo de credencial deve permanecer vazio ou fora do roadmap.",
                )

        urls = [match.group(0) for match in URL_PATTERN.finditer(value)]
        normalized_key = re.sub(r"[^a-z]", "", key.lower()) if key else ""
        is_url_field = any(
            normalized_key.endswith(suffix)
            for suffix in ("url", "uri", "href", "link", "endpoint")
        )
        if is_url_field and value.strip() and not urls:
            _issue(issues, "url.invalid", path, "Campo de URL deve conter uma URL HTTPS válida.")
        for url in urls:
            _validate_url(url, path, issues)


def _validate_micro_action(
    action: Any,
    path: str,
    item_actor: str,
    known_ids: set[str],
    issues: list[Issue],
) -> None:
    if not isinstance(action, dict):
        _issue(issues, "micro_action.type", path, "Microação deve ser um objeto.")
        return

    action_id = action.get("id")
    if not isinstance(action_id, str) or not ID_PATTERN.fullmatch(action_id):
        _issue(
            issues,
            "id.invalid",
            f"{path}.id",
            "ID deve usar kebab-case minúsculo.",
        )
    elif action_id in known_ids:
        _issue(issues, "id.duplicate", f"{path}.id", "ID deve ser único no roadmap.")
    else:
        known_ids.add(action_id)

    if not _nonempty_text(action.get("label"), minimum=3, maximum=200):
        _issue(
            issues,
            "micro_action.label",
            f"{path}.label",
            "Microação exige uma instrução curta e objetiva.",
        )
    if not _valid_time(action.get("estimatedTime")):
        _issue(
            issues,
            "micro_action.estimated_time",
            f"{path}.estimatedTime",
            "Microação exige tempo estimado não nulo.",
        )
    if not _nonempty_text(action.get("completionCriterion"), minimum=5, maximum=500):
        _issue(
            issues,
            "micro_action.completion_criterion",
            f"{path}.completionCriterion",
            "Microação exige critério de conclusão verificável.",
        )

    actor = action.get("actor", item_actor)
    if actor not in ALLOWED_ACTORS:
        _issue(
            issues,
            "actor.invalid",
            f"{path}.actor",
            "Actor deve ser owner, codex ou joint.",
        )
    if actor == "owner" and not _nonempty_text_list(action.get("doNotShare")):
        _issue(
            issues,
            "owner.do_not_share_required",
            f"{path}.doNotShare",
            "Ação do proprietário exige alertas do que não deve ser compartilhado.",
        )


def _find_dependency_cycles(graph: Mapping[str, Sequence[str]]) -> list[list[str]]:
    state: dict[str, int] = {}
    stack: list[str] = []
    stack_position: dict[str, int] = {}
    cycles: list[list[str]] = []

    def visit(node: str) -> None:
        node_state = state.get(node, 0)
        if node_state == 2:
            return
        if node_state == 1:
            start = stack_position[node]
            cycles.append(stack[start:] + [node])
            return
        state[node] = 1
        stack_position[node] = len(stack)
        stack.append(node)
        for dependency in graph.get(node, ()):
            if dependency in graph:
                visit(dependency)
        stack.pop()
        stack_position.pop(node, None)
        state[node] = 2

    for node in graph:
        if state.get(node, 0) == 0:
            visit(node)
    return cycles


def validate_document(document: Any) -> list[Issue]:
    issues: list[Issue] = []
    if not isinstance(document, dict):
        return [Issue("schema.root", "$", "Raiz do roadmap deve ser um objeto JSON.")]

    if document.get("schemaVersion") != SCHEMA_VERSION:
        _issue(
            issues,
            "schema.version",
            "$.schemaVersion",
            f"schemaVersion deve ser {SCHEMA_VERSION}.",
        )

    items = document.get("items")
    if not isinstance(items, list) or not items:
        _issue(issues, "schema.items", "$.items", "Roadmap exige uma lista não vazia de itens.")
        _validate_urls_and_secrets(document, issues)
        return issues
    if len(items) > 200:
        _issue(issues, "schema.items_limit", "$.items", "Roadmap excede o limite de 200 itens.")

    known_ids: set[str] = set()
    item_ids: set[str] = set()
    dependency_graph: dict[str, list[str]] = {}
    pending_dependencies: list[tuple[str, str, str]] = []

    for index, item in enumerate(items):
        path = f"$.items[{index}]"
        if not isinstance(item, dict):
            _issue(issues, "item.type", path, "Item do roadmap deve ser um objeto.")
            continue

        item_id = item.get("id")
        valid_item_id = isinstance(item_id, str) and bool(ID_PATTERN.fullmatch(item_id))
        if not valid_item_id:
            _issue(issues, "id.invalid", f"{path}.id", "ID deve usar kebab-case minúsculo.")
        elif item_id in known_ids:
            _issue(issues, "id.duplicate", f"{path}.id", "ID deve ser único no roadmap.")
        else:
            known_ids.add(item_id)
            item_ids.add(item_id)

        if not _nonempty_text(item.get("title"), minimum=3, maximum=160):
            _issue(issues, "item.title", f"{path}.title", "Item exige título objetivo.")

        status = item.get("status")
        if status not in ALLOWED_STATUSES:
            _issue(
                issues,
                "status.invalid",
                f"{path}.status",
                "Status deve ser live, ready, owner-action, blocked ou planned.",
            )

        actor = item.get("actor")
        if actor not in ALLOWED_ACTORS:
            _issue(
                issues,
                "actor.invalid",
                f"{path}.actor",
                "Actor deve ser owner, codex ou joint.",
            )

        dependencies = item.get("dependsOn")
        if not isinstance(dependencies, list) or not all(
            isinstance(dependency, str) for dependency in dependencies
        ):
            _issue(
                issues,
                "dependency.type",
                f"{path}.dependsOn",
                "dependsOn deve ser uma lista de IDs.",
            )
            dependencies = []
        elif len(dependencies) != len(set(dependencies)):
            _issue(
                issues,
                "dependency.duplicate",
                f"{path}.dependsOn",
                "Uma dependência não pode ser repetida.",
            )
        if valid_item_id:
            dependency_graph[item_id] = list(dependencies)
            for dependency in dependencies:
                pending_dependencies.append((item_id, dependency, f"{path}.dependsOn"))

        if not _valid_time(item.get("estimatedTime")):
            _issue(
                issues,
                "item.estimated_time",
                f"{path}.estimatedTime",
                "Item exige tempo estimado não nulo.",
            )
        if not _nonempty_text_list(item.get("completionCriteria")):
            _issue(
                issues,
                "item.completion_criteria",
                f"{path}.completionCriteria",
                "Item exige ao menos um critério de conclusão verificável.",
            )
        if actor == "owner" and not _nonempty_text_list(item.get("doNotShare")):
            _issue(
                issues,
                "owner.do_not_share_required",
                f"{path}.doNotShare",
                "Item do proprietário exige alertas do que não deve ser compartilhado.",
            )

        actions = item.get("microActions")
        if not isinstance(actions, list) or not actions:
            _issue(
                issues,
                "micro_action.required",
                f"{path}.microActions",
                "Item exige ao menos uma microação.",
            )
        elif len(actions) > 50:
            _issue(
                issues,
                "micro_action.limit",
                f"{path}.microActions",
                "Item excede o limite de 50 microações.",
            )
        else:
            for action_index, action in enumerate(actions):
                _validate_micro_action(
                    action,
                    f"{path}.microActions[{action_index}]",
                    actor if actor in ALLOWED_ACTORS else "",
                    known_ids,
                    issues,
                )

    for item_id, dependency, path in pending_dependencies:
        if dependency == item_id:
            _issue(issues, "dependency.self", path, "Item não pode depender de si mesmo.")
        elif dependency not in item_ids:
            _issue(
                issues,
                "dependency.missing",
                path,
                "Dependência aponta para item inexistente.",
            )

    for cycle in _find_dependency_cycles(dependency_graph):
        if len(cycle) > 1:
            _issue(
                issues,
                "dependency.cycle",
                "$.items",
                "Roadmap contém ciclo de dependências.",
            )

    _validate_urls_and_secrets(document, issues)
    return issues


def validate_path(path: Path) -> list[Issue]:
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError:
        return [Issue("file.unreadable", "$", "Roadmap ausente ou ilegível.")]
    try:
        document = json.loads(raw)
    except json.JSONDecodeError:
        return [Issue("json.invalid", "$", "Roadmap não contém JSON válido.")]
    return validate_document(document)


def _result_payload(path: Path, issues: Sequence[Issue]) -> dict[str, Any]:
    return {
        "ok": not issues,
        "file": str(path),
        "schemaVersion": SCHEMA_VERSION,
        "issueCount": len(issues),
        "issues": [asdict(issue) for issue in issues],
    }


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "roadmap",
        nargs="?",
        type=Path,
        default=DEFAULT_ROADMAP,
        help="roadmap JSON; padrão: 21_Central_Ativacao/data/roadmap.json",
    )
    parser.add_argument("--json", action="store_true", help="emite resultado JSON")
    args = parser.parse_args(argv)

    issues = validate_path(args.roadmap)
    if args.json:
        print(json.dumps(_result_payload(args.roadmap, issues), ensure_ascii=False, indent=2))
    elif issues:
        print(f"ROADMAP BLOQUEADO ({len(issues)} problema(s))")
        for issue in issues:
            print(f"- [{issue.code}] {issue.path}: {issue.message}")
    else:
        print("ROADMAP VÁLIDO")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
