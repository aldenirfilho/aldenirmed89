#!/usr/bin/env python3
"""Gate editorial incremental e fail-closed da plataforma Antigravity.

O modo ``--check`` é estritamente somente leitura. O baseline explícito permite
introduzir o controle sem fingir que todo o acervo legado já foi auditado:

    python3 scripts_admin/editorial_gate.py --check
    python3 scripts_admin/editorial_gate.py --check --changed-since origin/main
    python3 scripts_admin/editorial_gate.py --check --changed-file caminho.html
    python3 scripts_admin/editorial_gate.py --check --public-root site

Arquivos novos/modificados passados por ``--changed-*`` precisam estar
registrados e aprovados. ``--public-root`` aplica a varredura crítica a toda a
saída, mas não transforma o acervo legado em conteúdo certificado.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, NamedTuple, Sequence
from urllib.parse import urlparse


POLICY_RELATIVE = Path("data/editorial/policy.json")
REGISTRY_RELATIVE = Path("data/editorial/registry.json")
PROVENANCE_RELATIVE = Path("data/editorial/editorial-provenance.json")

EXPECTED_CLASSES = {
    "public-approved",
    "public-cited",
    "restricted-owner",
    "quarantine",
    "rejected",
}
PUBLIC_CLASSES = {"public-approved", "public-cited"}
NONPUBLIC_CLASSES = EXPECTED_CLASSES - PUBLIC_CLASSES
RIGHTS_BASES = {"owned", "licensed", "public-domain", "fair-use-reviewed"}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}(?:T.*)?$")
HTTPS_RE = re.compile(r"^https://", re.IGNORECASE)


class Issue(NamedTuple):
    code: str
    message: str
    path: str = ""
    severity: str = "block"


SECRET_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    (
        "SECRET_PRIVATE_KEY",
        re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", re.I),
    ),
    (
        "SECRET_OPENAI_KEY",
        re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b"),
    ),
    (
        "SECRET_GITHUB_TOKEN",
        re.compile(r"\bgh[opusr]_[A-Za-z0-9]{20,}\b"),
    ),
    (
        "SECRET_AWS_KEY",
        re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    ),
    (
        "SECRET_PASSWORD_ASSIGNMENT",
        re.compile(
            r"""(?ix)
            \b(?:password|passwd|senha|service[_-]?role[_-]?key|api[_-]?secret)
            \s*[:=]\s*
            ["'](?!example|placeholder|change[_-]?me|env\b)[^"']{8,}["']
            """
        ),
    ),
    (
        "SECRET_PASSWORD_LITERAL_UNQUOTED",
        re.compile(
            r"""(?ix)
            \b(?:password|passwd|senha|service[_-]?role[_-]?key|api[_-]?secret)
            \s*[:=]\s*
            (?!example|placeholder|change[_-]?me|env\b)
            (?=[A-Za-z0-9_-]{20,}\b)(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]+
            """
        ),
    ),
    (
        "SECRET_JWT",
        re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b"),
    ),
)

CPF_RE = re.compile(
    r"""(?x)
    (?<![\w.-])
    (?:\d{3}[.\s-]\d{3}[.\s-]\d{3}[-\s]\d{2}|\d{11})
    (?![\w-]|\.[A-Za-z0-9])
    """
)
BRAZIL_DDD_RE = (
    r"(?:1[1-9]|2[12478]|3[1-578]|4[1-9]|5[1-5]|"
    r"6[1-9]|7[134579]|8[1-9]|9[1-9])"
)
PHONE_RE = re.compile(
    rf"""(?x)
    (?<![\w.-])
    (?:\+?55[\s.-]*)?
    (?:\({BRAZIL_DDD_RE}\)|{BRAZIL_DDD_RE})[\s.-]*
    (?:9\d{{4}}[\s-]?\d{{4}}|[2-5]\d{{3}}[\s-]?\d{{4}})
    (?![\w-]|\.[A-Za-z0-9])
    """
)
EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
PATIENT_ID_RE = re.compile(
    r"""(?ix)
    (?<![\w-])
    (?:registro\s+do\s+paciente|cart[aã]o\s+sus|prontu[aá]rio|paciente)
    (?:\s*[:#]\s*|\s+)
    (?=[A-Z0-9.-]{4,}(?![\w-]|\.[A-Z0-9]))
    (?=[A-Z0-9.-]*\d)
    [A-Z0-9]+(?:[.-][A-Z0-9]+)*
    (?![\w-]|\.[A-Z0-9])
    """
)
PROFESSIONAL_CLAIM_PATTERNS = (
    re.compile(r"(?i)\beu\s+sou\s+(?:m[eé]dico|especialista|mestre|doutor)"),
    re.compile(
        r"(?i)\bAldenir\s+Rocha\s+de\s+Oliveira\s+Filho\b.{0,100}\b(?:m[eé]dico|mestre|especialista|CRM)\b"
    ),
    re.compile(r"(?i)\bCRM[-\s:/]*[A-Z]{0,2}[-\s]*\d{3,}\b"),
)
DEFAMATION_RE = re.compile(
    r"(?i)\b(?:golpista|criminos[oa]|fraudador(?:a)?|corrupt[oa]|"
    r"roubou|plagiador(?:a)?|mentiros[oa]|negligente|cometeu\s+fraude)\b"
)
UNCERTAIN_RIGHTS_RE = re.compile(
    r"(?i)\b(?:copyright|licen[cç]a|direitos\s+autorais)\b"
    r".{0,50}\b(?:desconhecid[oa]|incert[oa]|n[aã]o\s+confirmad[oa]|sem\s+licen[cç]a)\b"
)
RESTRICTED_CONTENT_RE = re.compile(
    r"""(?ix)
    (?:
      ["']?(?:status|classification|audience)["']?\s*[:=]\s*["']?
      (?:beta|draft|rascunho|personal|pessoal|private|privado|restricted-owner|quarantine)
    )
    |
    (?:\bowner[-\s]?only\b|\bsomente\s+(?:do\s+)?propriet[aá]rio\b)
    """
)
RESTRICTED_PATH_PARTS = {
    "_private",
    "beta",
    "draft",
    "pessoal",
    "personal",
    "private",
    "quarantine",
    "restricted-owner",
    "rascunho",
}
MEDICAL_MARKERS = (
    re.compile(r"(?i)\b(?:diagn[oó]stic[oa]|tratamento|terapia|dose|posologia)\b"),
    re.compile(r"(?i)\b(?:paciente|doen[cç]a|s[ií]ndrome|sepse|choque)\b"),
    re.compile(r"(?i)\b(?:UTI|medicina\s+intensiva|ventila[cç][aã]o\s+mec[aâ]nica)\b"),
    re.compile(r"(?i)\b(?:mg|mcg|mmhg|ml/kg|min)\b"),
    re.compile(r"(?i)\b(?:anticoagula[cç][aã]o|vasopressor|antibi[oó]tico)\b"),
)


def _load_json(path: Path, label: str) -> tuple[Any | None, list[Issue]]:
    try:
        return json.loads(path.read_text(encoding="utf-8")), []
    except FileNotFoundError:
        return None, [Issue("MISSING_MANIFEST", f"{label} ausente", str(path))]
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        return None, [
            Issue("INVALID_MANIFEST", f"{label} inválido: {exc}", str(path))
        ]


def _is_date(value: Any) -> bool:
    if not isinstance(value, str) or not DATE_RE.match(value):
        return False
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return True


def _is_https_url(value: Any) -> bool:
    if not isinstance(value, str) or not HTTPS_RE.match(value):
        return False
    parsed = urlparse(value)
    return bool(parsed.netloc and parsed.scheme == "https")


def _nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _contains_valid_cpf(text: str) -> bool:
    """Evita confundir trechos numéricos de hashes/URLs com CPF.

    CPF formatado ou sequência de onze dígitos só é sinalizada quando os
    dígitos verificadores são matematicamente válidos.
    """

    for match in CPF_RE.finditer(text):
        digits = [int(value) for value in re.sub(r"\D", "", match.group(0))]
        if len(digits) != 11 or len(set(digits)) == 1:
            continue
        valid = True
        for index in (9, 10):
            total = sum(digits[position] * (index + 1 - position) for position in range(index))
            verifier = (total * 10 % 11) % 10
            if verifier != digits[index]:
                valid = False
                break
        if valid:
            return True
    return False


def _contains_brazilian_phone(text: str) -> bool:
    """Detecta telefone plausível sem confundir hashes e código minificado.

    O padrão exige DDD brasileiro e prefixo compatível com celular atual ou
    telefone fixo. A verificação de contexto ignora apenas inteiros isolados
    em listas numéricas minificadas; números formatados e telefones escritos
    sem formatação em texto comum continuam bloqueados.
    """

    for match in PHONE_RE.finditer(text):
        value = match.group(0)
        if re.fullmatch(r"\d{10,13}", value):
            before = text[match.start() - 1] if match.start() else ""
            after = text[match.end()] if match.end() < len(text) else ""
            nearby_label = re.search(
                r"(?i)(?:telefones?|phones?|fones?|celular|whats(?:app)?|contato)\W{0,24}$",
                text[max(0, match.start() - 48) : match.start()],
            )
            if (
                before
                and after
                and not nearby_label
                and before in "[,"
                and after in ",]}"
            ):
                continue
            integer_limits = {"2147483647", "2147483648"}
            code_operators = "=<>?*/%^&|"
            if (
                value in integer_limits
                and not nearby_label
                and (
                    (before and before in code_operators)
                    or (after and after in code_operators)
                )
            ):
                continue
        return True
    return False


def _is_reserved_example_email(value: str) -> bool:
    domain = value.rsplit("@", 1)[-1].casefold().rstrip(".")
    return domain in {"example.com", "example.net", "example.org"} or domain.endswith(
        ".example"
    )


def validate_policy(policy: Any, path: str = "") -> list[Issue]:
    issues: list[Issue] = []
    if not isinstance(policy, dict):
        return [Issue("POLICY_NOT_OBJECT", "A política deve ser um objeto JSON", path)]
    if policy.get("schemaVersion") != "editorial-policy-v1":
        issues.append(Issue("POLICY_SCHEMA", "schemaVersion da política inválida", path))
    if policy.get("failClosed") is not True:
        issues.append(Issue("POLICY_NOT_FAIL_CLOSED", "failClosed deve ser true", path))
    if policy.get("defaultDecision") != "quarantine":
        issues.append(
            Issue("POLICY_DEFAULT", "Qualquer dúvida deve resultar em quarantine", path)
        )
    classes = policy.get("classes")
    if not isinstance(classes, dict) or set(classes) != EXPECTED_CLASSES:
        issues.append(
            Issue(
                "POLICY_CLASSES",
                "As cinco classes editoriais obrigatórias devem existir, sem substituições",
                path,
            )
        )
    else:
        for name, definition in classes.items():
            if not isinstance(definition, dict):
                issues.append(Issue("POLICY_CLASS_INVALID", f"Classe inválida: {name}", path))
                continue
            expected_public = name in PUBLIC_CLASSES
            if definition.get("public") is not expected_public:
                issues.append(
                    Issue(
                        "POLICY_CLASS_EXPOSURE",
                        f"Exposição incompatível para {name}",
                        path,
                    )
                )
    rules = policy.get("publicRules")
    if not isinstance(rules, dict):
        issues.append(Issue("POLICY_RULES", "publicRules ausente", path))
    else:
        if set(rules.get("allowedClasses", [])) != PUBLIC_CLASSES:
            issues.append(
                Issue("POLICY_PUBLIC_CLASSES", "Classes públicas não são fail-closed", path)
            )
        if rules.get("uncertainRightsDecision") != "quarantine":
            issues.append(
                Issue("POLICY_RIGHTS_DEFAULT", "Direitos incertos devem ir para quarantine", path)
            )
        if rules.get("defamationSuspicionDecision") != "quarantine":
            issues.append(
                Issue(
                    "POLICY_DEFAMATION_DEFAULT",
                    "Suspeita de difamação deve ir para quarantine",
                    path,
                )
            )
    provenance = policy.get("provenance")
    if not isinstance(provenance, dict):
        issues.append(Issue("POLICY_PROVENANCE", "Bloco provenance ausente", path))
    else:
        if provenance.get("mark") != "ATV · TURBO TEMI · ALD 360":
            issues.append(Issue("POLICY_MARK", "Marca editorial divergente", path))
        if provenance.get("author") != "Aldenir Rocha de Oliveira Filho":
            issues.append(Issue("POLICY_AUTHOR", "Autor editorial divergente", path))
        if provenance.get("hashIsNotAbsoluteLegalProof") is not True:
            issues.append(
                Issue(
                    "POLICY_HASH_NOTICE",
                    "A política deve declarar que hash não é prova jurídica absoluta",
                    path,
                )
            )
    if not _nonempty(policy.get("legalNotice")):
        issues.append(Issue("POLICY_LEGAL_NOTICE", "Aviso jurídico ausente", path))
    return issues


def validate_baseline(registry: dict[str, Any], path: str = "") -> list[Issue]:
    issues: list[Issue] = []
    baseline = registry.get("baseline")
    if not isinstance(baseline, dict):
        return [Issue("BASELINE_MISSING", "Baseline editorial explícito ausente", path)]
    if baseline.get("mode") != "explicit-incremental":
        issues.append(
            Issue("BASELINE_MODE", "Baseline deve usar explicit-incremental", path)
        )
    if not _is_date(baseline.get("establishedAt")):
        issues.append(Issue("BASELINE_DATE", "Data do baseline inválida", path))
    if baseline.get("legacyInventoryState") != "not-certified":
        issues.append(
            Issue(
                "BASELINE_LEGACY_STATE",
                "O legado não inventariado não pode ser declarado certificado",
                path,
            )
        )
    if baseline.get("legacyPublicationDecision") != "outside-registry-no-approval":
        issues.append(
            Issue(
                "BASELINE_LEGACY_APPROVAL",
                "O baseline não pode inventar aprovação para o legado",
                path,
            )
        )
    if baseline.get("newOrModifiedPublicContentMustBeRegistered") is not True:
        issues.append(
            Issue(
                "BASELINE_INCREMENTAL_GATE",
                "Novo conteúdo público deve entrar no gate estrito",
                path,
            )
        )
    if baseline.get("hardRiskScanAppliesToLegacy") is not True:
        issues.append(
            Issue(
                "BASELINE_RISK_SCAN",
                "A varredura de risco crítico deve alcançar o legado",
                path,
            )
        )
    return issues


def _validate_rights(item: dict[str, Any], item_path: str) -> list[Issue]:
    rights = item.get("rights")
    if not isinstance(rights, dict):
        return [Issue("RIGHTS_MISSING", "Direitos/licença não documentados", item_path)]
    basis = rights.get("basis")
    if basis not in RIGHTS_BASES:
        return [
            Issue(
                "RIGHTS_UNCERTAIN",
                "Base de direitos incerta; mover para quarantine",
                item_path,
            )
        ]
    if not _nonempty(rights.get("statement")):
        return [Issue("RIGHTS_STATEMENT", "Declaração de direitos ausente", item_path)]
    if basis == "licensed" and not _nonempty(rights.get("license")):
        return [Issue("LICENSE_MISSING", "Licença documentada ausente", item_path)]
    return []


def _validate_sources(item: dict[str, Any], item_path: str) -> list[Issue]:
    issues: list[Issue] = []
    sources = item.get("sources")
    if not isinstance(sources, list) or not sources:
        return [
            Issue(
                "MEDICAL_SOURCES_MISSING",
                "Conteúdo médico/científico precisa de fontes rastreáveis",
                item_path,
            )
        ]
    for index, source in enumerate(sources):
        source_path = f"{item_path}#sources[{index}]"
        if not isinstance(source, dict):
            issues.append(Issue("SOURCE_INVALID", "Fonte deve ser objeto", source_path))
            continue
        if not _nonempty(source.get("title")):
            issues.append(Issue("SOURCE_TITLE", "Título da fonte ausente", source_path))
        if not _is_https_url(source.get("url")):
            issues.append(Issue("SOURCE_URL", "URL HTTPS da fonte ausente", source_path))
        if not (
            _is_date(source.get("publishedAt"))
            or _is_date(source.get("accessedAt"))
        ):
            issues.append(
                Issue(
                    "SOURCE_DATE",
                    "Fonte precisa de publishedAt ou accessedAt válido",
                    source_path,
                )
            )
    return issues


def _validate_professional_claims(item: dict[str, Any], item_path: str) -> list[Issue]:
    issues: list[Issue] = []
    claims = item.get("professionalClaims", [])
    if not isinstance(claims, list):
        return [
            Issue(
                "PROFESSIONAL_CLAIMS_INVALID",
                "professionalClaims deve ser uma lista",
                item_path,
            )
        ]
    for index, claim in enumerate(claims):
        claim_path = f"{item_path}#professionalClaims[{index}]"
        if not isinstance(claim, dict) or not _nonempty(claim.get("claim")):
            issues.append(
                Issue("PROFESSIONAL_CLAIM_INVALID", "Alegação profissional inválida", claim_path)
            )
            continue
        verification = claim.get("verification")
        if (
            not isinstance(verification, dict)
            or not _nonempty(verification.get("type"))
            or not _nonempty(verification.get("reference"))
            or not _is_date(verification.get("checkedAt"))
        ):
            issues.append(
                Issue(
                    "PROFESSIONAL_CLAIM_UNVERIFIED",
                    "Alegação profissional exige verificação e data",
                    claim_path,
                )
            )
    return issues


def _validate_personal_data(item: dict[str, Any], item_path: str) -> list[Issue]:
    block = item.get("personalData", {"contains": False})
    if not isinstance(block, dict) or not isinstance(block.get("contains"), bool):
        return [
            Issue(
                "PERSONAL_DATA_DECLARATION",
                "Declaração personalData.contains é obrigatória",
                item_path,
            )
        ]
    if block["contains"] is False:
        return []
    if not _nonempty(block.get("purpose")) or not _is_date(block.get("consentAt")):
        return [
            Issue(
                "PERSONAL_DATA_NO_CONSENT",
                "Dados pessoais exigem finalidade e consentimento verificável",
                item_path,
            )
        ]
    return []


def validate_registry(
    registry: Any, policy: dict[str, Any], path: str = ""
) -> tuple[list[Issue], dict[str, dict[str, Any]]]:
    issues: list[Issue] = []
    path_index: dict[str, dict[str, Any]] = {}
    if not isinstance(registry, dict):
        return [Issue("REGISTRY_NOT_OBJECT", "Registro deve ser objeto JSON", path)], {}
    if registry.get("schemaVersion") != "editorial-registry-v1":
        issues.append(Issue("REGISTRY_SCHEMA", "schemaVersion do registro inválida", path))
    issues.extend(validate_baseline(registry, path))
    items = registry.get("items")
    if not isinstance(items, list):
        return issues + [Issue("REGISTRY_ITEMS", "items deve ser uma lista", path)], {}
    seen_ids: set[str] = set()
    for index, item in enumerate(items):
        item_path = f"{path}#items[{index}]"
        if not isinstance(item, dict):
            issues.append(Issue("ITEM_INVALID", "Item deve ser objeto", item_path))
            continue
        item_id = item.get("id")
        if not _nonempty(item_id) or item_id in seen_ids:
            issues.append(Issue("ITEM_ID", "ID editorial ausente ou duplicado", item_path))
        else:
            seen_ids.add(item_id)
        classification = item.get("classification")
        if classification not in EXPECTED_CLASSES:
            issues.append(
                Issue("ITEM_CLASS", "Classificação editorial inválida", item_path)
            )
            classification = "quarantine"
        paths = item.get("paths")
        if not isinstance(paths, list) or not paths:
            issues.append(Issue("ITEM_PATHS", "Item real precisa de paths", item_path))
            paths = []
        for raw_path in paths:
            if not _nonempty(raw_path):
                issues.append(Issue("ITEM_PATH_INVALID", "Path inválido", item_path))
                continue
            normalized = normalize_relative_path(raw_path)
            if normalized in path_index:
                issues.append(
                    Issue(
                        "ITEM_PATH_DUPLICATE",
                        f"Path já registrado por {path_index[normalized].get('id')}",
                        normalized,
                    )
                )
            else:
                path_index[normalized] = item

        publish_targets = item.get("publishTargets", [])
        if classification in NONPUBLIC_CLASSES and publish_targets:
            issues.append(
                Issue(
                    "NONPUBLIC_HAS_TARGET",
                    "Conteúdo não público não pode ter destino de publicação",
                    item_path,
                )
            )
        if classification in PUBLIC_CLASSES:
            if item.get("ownerApproval") is not True:
                issues.append(
                    Issue(
                        "OWNER_APPROVAL_MISSING",
                        "Autorização explícita do proprietário ausente",
                        item_path,
                    )
                )
            if not _nonempty(item.get("reviewer")):
                issues.append(Issue("REVIEWER_MISSING", "Revisor ausente", item_path))
            if not _is_date(item.get("reviewedAt")):
                issues.append(Issue("REVIEW_DATE_MISSING", "Data de revisão ausente", item_path))
            issues.extend(_validate_rights(item, item_path))
            issues.extend(_validate_professional_claims(item, item_path))
            issues.extend(_validate_personal_data(item, item_path))

            is_medical = item.get("medical") is True
            if is_medical and classification != "public-cited":
                issues.append(
                    Issue(
                        "MEDICAL_WRONG_CLASS",
                        "Conteúdo médico só pode ser public-cited",
                        item_path,
                    )
                )
            if is_medical:
                if not _nonempty(item.get("clinicalReviewer")):
                    issues.append(
                        Issue(
                            "CLINICAL_REVIEWER_MISSING",
                            "Revisor clínico ausente",
                            item_path,
                        )
                    )
                issues.extend(_validate_sources(item, item_path))

    examples = registry.get("exampleTemplates", [])
    if not isinstance(examples, list):
        issues.append(Issue("EXAMPLES_INVALID", "exampleTemplates deve ser lista", path))
    else:
        for index, example in enumerate(examples):
            example_path = f"{path}#exampleTemplates[{index}]"
            if not isinstance(example, dict) or example.get("exampleOnly") is not True:
                issues.append(
                    Issue("EXAMPLE_NOT_MARKED", "Exemplo deve ser inequivocamente identificado", example_path)
                )
                continue
            if example.get("classification") in PUBLIC_CLASSES:
                issues.append(
                    Issue(
                        "EXAMPLE_PUBLIC",
                        "Exemplo não pode simular aprovação pública",
                        example_path,
                    )
                )
    return issues, path_index


def validate_provenance_scaffold(data: Any, path: str = "") -> list[Issue]:
    issues: list[Issue] = []
    if not isinstance(data, dict):
        return [Issue("PROVENANCE_NOT_OBJECT", "Proveniência deve ser objeto", path)]
    if data.get("schemaVersion") != "editorial-provenance-v1":
        issues.append(Issue("PROVENANCE_SCHEMA", "schemaVersion inválida", path))
    if data.get("mark") != "ATV · TURBO TEMI · ALD 360":
        issues.append(Issue("PROVENANCE_MARK", "Marca de proveniência divergente", path))
    if data.get("author") != "Aldenir Rocha de Oliveira Filho":
        issues.append(Issue("PROVENANCE_AUTHOR", "Autor de proveniência divergente", path))
    state = data.get("state")
    works = data.get("works")
    if state not in {"unissued", "issued"}:
        issues.append(Issue("PROVENANCE_STATE", "Estado de proveniência inválido", path))
    if not isinstance(works, list):
        issues.append(Issue("PROVENANCE_WORKS", "works deve ser lista", path))
        works = []
    if state == "unissued":
        if works or data.get("commit") is not None or data.get("generatedAt") is not None:
            issues.append(
                Issue(
                    "PROVENANCE_FALSE_ISSUE",
                    "Registro unissued não pode simular selagem",
                    path,
                )
            )
    else:
        if not _nonempty(data.get("commit")) or not _is_date(data.get("generatedAt")):
            issues.append(
                Issue(
                    "PROVENANCE_METADATA",
                    "Registro issued precisa de commit e data explícitos",
                    path,
                )
            )
        if not works:
            issues.append(Issue("PROVENANCE_EMPTY", "Registro issued sem obras", path))
    legal = str(data.get("legalNotice") or "").casefold()
    if "não são prova jurídica absoluta" not in legal:
        issues.append(
            Issue(
                "PROVENANCE_LEGAL_NOTICE",
                "Aviso sobre limites probatórios ausente",
                path,
            )
        )
    return issues


def normalize_relative_path(value: str) -> str:
    normalized = value.replace("\\", "/")
    while normalized.startswith("./"):
        normalized = normalized[2:]
    return normalized.strip("/")


def _inside(root: Path, path: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
    except ValueError:
        return False
    return True


def _text_extensions(policy: dict[str, Any]) -> set[str]:
    configured = policy.get("scanning", {}).get("textExtensions", [])
    return {str(value).lower() for value in configured}


def _max_text_bytes(policy: dict[str, Any]) -> int:
    value = policy.get("scanning", {}).get("maxTextFileBytes")
    return int(value) if isinstance(value, int) and value > 0 else 4 * 1024 * 1024


def _read_text(path: Path, policy: dict[str, Any]) -> tuple[str | None, list[Issue]]:
    try:
        size = path.stat().st_size
    except OSError as exc:
        return None, [Issue("FILE_UNREADABLE", str(exc), str(path))]
    if size > _max_text_bytes(policy):
        return None, [
            Issue(
                "TEXT_TOO_LARGE",
                "Arquivo textual excede limite; revisão manual obrigatória",
                str(path),
            )
        ]
    try:
        return path.read_text(encoding="utf-8"), []
    except (OSError, UnicodeError) as exc:
        return None, [Issue("FILE_UNREADABLE", str(exc), str(path))]


def infer_medical(text: str) -> bool:
    return sum(bool(pattern.search(text)) for pattern in MEDICAL_MARKERS) >= 2


def scan_text(
    text: str,
    path: str,
    policy: dict[str, Any],
    item: dict[str, Any] | None = None,
    *,
    require_registration: bool,
) -> list[Issue]:
    issues: list[Issue] = []
    for code, pattern in SECRET_PATTERNS:
        if pattern.search(text):
            issues.append(Issue(code, "Possível segredo/credencial em conteúdo público", path))
    if _contains_valid_cpf(text):
        issues.append(Issue("SENSITIVE_CPF", "Possível CPF em conteúdo público", path))
    if _contains_brazilian_phone(text):
        issues.append(Issue("SENSITIVE_PHONE", "Possível telefone pessoal em conteúdo público", path))
    if PATIENT_ID_RE.search(text):
        issues.append(
            Issue("SENSITIVE_PATIENT_ID", "Possível identificador de paciente", path)
        )
    allowlisted = {
        str(value).casefold()
        for value in policy.get("scanning", {}).get("publicContactAllowlist", [])
    }
    public_emails = {
        match.group(0).casefold()
        for match in EMAIL_RE.finditer(text)
        if match.group(0).casefold() not in allowlisted
        and not _is_reserved_example_email(match.group(0))
    }
    if public_emails:
        issues.append(
            Issue(
                "SENSITIVE_EMAIL",
                "E-mail não allowlisted; consentimento e finalidade precisam ser revisados",
                path,
            )
        )
    if DEFAMATION_RE.search(text):
        issues.append(
            Issue(
                "DEFAMATION_SUSPECTED",
                "Possível alegação difamatória; isolar e revisar juridicamente",
                path,
            )
        )
    if UNCERTAIN_RIGHTS_RE.search(text):
        issues.append(
            Issue(
                "COPYRIGHT_UNCERTAIN",
                "Direitos/licença incertos; mover para quarantine",
                path,
            )
        )
    if RESTRICTED_CONTENT_RE.search(text):
        issues.append(
            Issue(
                "RESTRICTED_STATUS_PUBLIC",
                "Conteúdo beta/pessoal/restrito encontrado na saída pública",
                path,
            )
        )
    if any(pattern.search(text) for pattern in PROFESSIONAL_CLAIM_PATTERNS):
        claims = item.get("professionalClaims", []) if isinstance(item, dict) else []
        if not claims or _validate_professional_claims(item or {}, path):
            issues.append(
                Issue(
                    "PROFESSIONAL_CLAIM_UNVERIFIED",
                    "Alegação profissional pública sem verificação registrada",
                    path,
                )
            )
    is_medical = infer_medical(text)
    if require_registration and item is None:
        issues.append(
            Issue(
                "UNREGISTERED_PUBLIC_CONTENT",
                "Arquivo público novo/modificado não consta do registro editorial",
                path,
            )
        )
    if is_medical and item is None and require_registration:
        issues.append(
            Issue(
                "MEDICAL_UNREGISTERED",
                "Conteúdo médico sem fonte, data e revisor registrados",
                path,
            )
        )
    if item is not None:
        classification = item.get("classification")
        if classification not in PUBLIC_CLASSES:
            issues.append(
                Issue(
                    "NONPUBLIC_IN_PUBLIC_OUTPUT",
                    f"Item {classification!r} não pode aparecer na saída pública",
                    path,
                )
            )
        if is_medical and item.get("medical") is not True:
            issues.append(
                Issue(
                    "MEDICAL_NOT_DECLARED",
                    "Conteúdo parece médico, mas medical não está declarado como true",
                    path,
                )
            )
    return issues


def scan_file(
    root: Path,
    path: Path,
    policy: dict[str, Any],
    item: dict[str, Any] | None,
    *,
    require_registration: bool,
) -> list[Issue]:
    resolved = path if path.is_absolute() else root / path
    display = (
        resolved.resolve().relative_to(root.resolve()).as_posix()
        if _inside(root, resolved)
        else str(resolved)
    )
    if not _inside(root, resolved):
        return [Issue("PATH_OUTSIDE_ROOT", "Path fora da raiz autorizada", display)]
    if not resolved.exists() or not resolved.is_file():
        return [Issue("FILE_MISSING", "Arquivo registrado/alterado não existe", display)]
    if any(part.casefold() in RESTRICTED_PATH_PARTS for part in Path(display).parts):
        return [
            Issue(
                "RESTRICTED_PATH_PUBLIC",
                "Path beta/pessoal/privado não pode ser publicado",
                display,
            )
        ]
    if resolved.suffix.lower() not in _text_extensions(policy):
        if require_registration and item is None:
            return [
                Issue(
                    "UNREGISTERED_PUBLIC_ASSET",
                    "Ativo público novo/modificado não consta do registro editorial",
                    display,
                )
            ]
        if item is not None and item.get("classification") not in PUBLIC_CLASSES:
            return [
                Issue(
                    "NONPUBLIC_IN_PUBLIC_OUTPUT",
                    "Ativo não público não pode ser publicado",
                    display,
                )
            ]
        return []
    text, issues = _read_text(resolved, policy)
    if text is None:
        return issues
    issues.extend(
        scan_text(
            text,
            display,
            policy,
            item,
            require_registration=require_registration,
        )
    )
    return issues


def _is_nonpublic_source(relative: str, policy: dict[str, Any]) -> bool:
    normalized = normalize_relative_path(relative)
    prefixes = policy.get("scanning", {}).get("nonPublicSourcePrefixes", [])
    return any(
        normalized == str(prefix).rstrip("/")
        or normalized.startswith(str(prefix).rstrip("/") + "/")
        for prefix in prefixes
    )


def _changed_since(root: Path, reference: str) -> tuple[list[str], list[Issue]]:
    try:
        result = subprocess.run(
            [
                "git",
                "-C",
                str(root),
                "diff",
                "--name-only",
                "--diff-filter=ACMR",
                "-z",
                f"{reference}...HEAD",
            ],
            check=True,
            capture_output=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        return [], [
            Issue(
                "GIT_DIFF_FAILED",
                f"Não foi possível resolver changed-since: {exc}",
                reference,
            )
        ]
    return [value for value in result.stdout.decode("utf-8").split("\0") if value], []


def _iter_public_text_files(public_root: Path, policy: dict[str, Any]) -> Iterable[Path]:
    extensions = _text_extensions(policy)
    for path in sorted(public_root.rglob("*")):
        if path.is_file() and path.suffix.lower() in extensions:
            yield path


def run_check(
    root: Path,
    policy_path: Path,
    registry_path: Path,
    provenance_path: Path,
    changed_files: Sequence[str] = (),
    changed_since: str | None = None,
    public_roots: Sequence[Path] = (),
) -> tuple[list[Issue], dict[str, Any]]:
    root = root.resolve()
    issues: list[Issue] = []
    policy, load_issues = _load_json(policy_path, "política editorial")
    issues.extend(load_issues)
    if policy is None:
        return issues, {"mode": "blocked", "checked": 0}
    issues.extend(validate_policy(policy, str(policy_path)))

    registry, load_issues = _load_json(registry_path, "registro editorial")
    issues.extend(load_issues)
    path_index: dict[str, dict[str, Any]] = {}
    if registry is not None:
        registry_issues, path_index = validate_registry(
            registry, policy, str(registry_path)
        )
        issues.extend(registry_issues)

    provenance, load_issues = _load_json(provenance_path, "proveniência editorial")
    issues.extend(load_issues)
    if provenance is not None:
        issues.extend(validate_provenance_scaffold(provenance, str(provenance_path)))

    strict_paths = list(changed_files)
    if changed_since:
        from_git, git_issues = _changed_since(root, changed_since)
        strict_paths.extend(from_git)
        issues.extend(git_issues)
    strict_paths = sorted(
        {
            normalize_relative_path(value)
            for value in strict_paths
            if value and not _is_nonpublic_source(value, policy)
        }
    )
    for relative in strict_paths:
        issues.extend(
            scan_file(
                root,
                root / relative,
                policy,
                path_index.get(relative),
                require_registration=True,
            )
        )

    scanned_public = 0
    for raw_public_root in public_roots:
        public_root = raw_public_root
        if not public_root.is_absolute():
            public_root = root / public_root
        if not _inside(root, public_root) or not public_root.is_dir():
            issues.append(
                Issue(
                    "PUBLIC_ROOT_INVALID",
                    "Raiz pública inexistente ou fora do repositório",
                    str(public_root),
                )
            )
            continue
        for path in _iter_public_text_files(public_root, policy):
            scanned_public += 1
            relative = path.resolve().relative_to(root).as_posix()
            issues.extend(
                scan_file(
                    root,
                    path,
                    policy,
                    path_index.get(relative),
                    require_registration=False,
                )
            )

    summary = {
        "mode": "blocked" if issues else "approved",
        "failClosed": True,
        "baselineMode": (
            registry.get("baseline", {}).get("mode")
            if isinstance(registry, dict)
            else None
        ),
        "strictFilesChecked": len(strict_paths),
        "publicTextFilesScanned": scanned_public,
        "registeredItems": (
            len(registry.get("items", []))
            if isinstance(registry, dict) and isinstance(registry.get("items"), list)
            else 0
        ),
        "issueCount": len(issues),
    }
    return issues, summary


def _resolve_under(root: Path, value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else root / path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Executa somente leitura")
    parser.add_argument("--root", default=".", help="Raiz do repositório")
    parser.add_argument("--policy", default=str(POLICY_RELATIVE))
    parser.add_argument("--registry", default=str(REGISTRY_RELATIVE))
    parser.add_argument("--provenance", default=str(PROVENANCE_RELATIVE))
    parser.add_argument(
        "--changed-file",
        action="append",
        default=[],
        help="Arquivo público novo/modificado; pode ser repetido",
    )
    parser.add_argument(
        "--changed-since",
        help="Referência Git; todos os arquivos AC/M/R desde ela entram no gate estrito",
    )
    parser.add_argument(
        "--public-root",
        action="append",
        default=[],
        help="Saída pública para varredura crítica; pode ser repetido",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emite relatório JSON em stdout, sem gravar arquivos",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if not args.check:
        print("ERRO: use --check; este gate não altera nem exclui arquivos.", file=sys.stderr)
        return 2
    root = Path(args.root).resolve()
    if not root.is_dir() or root == Path(root.anchor):
        print("ERRO: raiz ausente ou insegura.", file=sys.stderr)
        return 2
    policy_path = _resolve_under(root, args.policy)
    registry_path = _resolve_under(root, args.registry)
    provenance_path = _resolve_under(root, args.provenance)
    issues, summary = run_check(
        root,
        policy_path,
        registry_path,
        provenance_path,
        changed_files=args.changed_file,
        changed_since=args.changed_since,
        public_roots=[Path(value) for value in args.public_root],
    )
    if args.json:
        print(
            json.dumps(
                {
                    "summary": summary,
                    "issues": [issue._asdict() for issue in issues],
                },
                ensure_ascii=False,
                indent=2,
                sort_keys=True,
            )
        )
    else:
        print(
            "Gate editorial: "
            f"{summary['mode'].upper()} | "
            f"{summary['issueCount']} bloqueio(s) | "
            f"{summary['strictFilesChecked']} arquivo(s) estrito(s) | "
            f"{summary['publicTextFilesScanned']} arquivo(s) públicos varridos"
        )
        for issue in issues:
            location = f" [{issue.path}]" if issue.path else ""
            print(f"- {issue.code}{location}: {issue.message}")
    return 1 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
