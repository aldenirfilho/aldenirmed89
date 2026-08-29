#!/usr/bin/env python3
"""Gera a revisão protetiva semanal do Antigravity, sem alterar conteúdo.

O processo reúne verificações técnicas, editoriais e de disponibilidade das
fontes jurídico-editoriais oficiais já cadastradas. Ele produz um laudo em
Markdown e um relatório JSON para revisão humana.

Limites deliberados:

* não interpreta leis, resoluções ou regras profissionais;
* não declara conformidade jurídica nem confirma violações;
* não atualiza baselines, registro editorial ou conteúdo público;
* não corrige, commita nem publica arquivos ou conteúdo do site;
* publica somente um extrato sanitizado na issue semanal e artefatos do Actions;
* achados do inventário legado são heurísticos e exigem triagem humana.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Iterable, Sequence


SCHEMA_VERSION = "antigravity-weekly-protective-review-v1"
TIMEZONE_LABEL = "America/Fortaleza (UTC-03:00)"
DEFAULT_LEGAL_CATALOG = Path(
    "19_Integridade_Editorial/data/legal-sources.json"
)
DEFAULT_POLICY = Path("data/editorial/policy.json")
DEFAULT_REGISTRY = Path("data/editorial/registry.json")
DEFAULT_PROVENANCE = Path("data/editorial/editorial-provenance.json")
DEFAULT_MANIFEST = Path("data/site_manifest.json")
DEFAULT_DOWNLOADS = Path("downloads")
DEFAULT_SITE_BASE_URL = (
    "https://aldenirfilho.github.io/aldenirmed89/"
)
OUTPUT_JSON_NAME = "laudo-semanal.json"
OUTPUT_MARKDOWN_NAME = "laudo-semanal.md"
LEGAL_REPORT_NAME = "fontes-oficiais.json"
MAX_COMMAND_EXCERPT = 5_000
MAX_FINDING_SAMPLES = 80
MAX_LIVE_RESPONSE_BYTES = 64 * 1024 * 1024
SEVERITY_ORDER = {"baixo": 1, "médio": 2, "alto": 3, "crítico": 4}
LEGACY_DISCLAIMER = (
    "Os itens do inventário legado são achados heurísticos para triagem. "
    "Não são violações confirmadas, não inventam aprovação retroativa e não "
    "constituem conclusão jurídica, clínica ou profissional."
)
LEGAL_NOTICE = (
    "Este laudo é um controle técnico-editorial preventivo. Não constitui "
    "parecer jurídico, certificação de conformidade, validação clínica nem "
    "garantia contra litígios. Decisões e correções exigem revisão humana."
)
SECRET_OUTPUT_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\bgh[opsu]_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"(?i)\b(?:password|passwd|token|secret)\s*[:=]\s*\S+"),
)
LEGACY_LOW_CODES = {
    "UNREGISTERED_PUBLIC_ASSET",
    "UNREGISTERED_PUBLIC_CONTENT",
}
LEGACY_MEDIUM_CODES = {
    "COPYRIGHT_UNCERTAIN",
    "MEDICAL_NOT_DECLARED",
    "MEDICAL_UNREGISTERED",
    "PROFESSIONAL_CLAIM_UNVERIFIED",
    "SENSITIVE_EMAIL",
    "TEXT_TOO_LARGE",
}
LEGACY_HIGH_CODES = {
    "DEFAMATION_SUSPECTED",
    "NONPUBLIC_IN_PUBLIC_OUTPUT",
    "RESTRICTED_PATH_PUBLIC",
    "RESTRICTED_STATUS_PUBLIC",
    "SENSITIVE_CPF",
    "SENSITIVE_PATIENT_ID",
    "SENSITIVE_PHONE",
}


def utc_now() -> str:
    """Retorna instante UTC canônico, sem microssegundos."""

    return (
        datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def local_week_metadata(now: datetime | None = None) -> dict[str, str]:
    """Calcula a semana ISO usando o horário fixo de Fortaleza."""

    if now is None:
        now = datetime.now(timezone.utc)
    fortaleza_seconds = -3 * 60 * 60
    local_timestamp = now.timestamp() + fortaleza_seconds
    local = datetime.fromtimestamp(local_timestamp, tz=timezone.utc)
    iso_year, iso_week, _ = local.isocalendar()
    return {
        "weekId": f"{iso_year}-W{iso_week:02d}",
        "localDate": local.date().isoformat(),
        "timezone": TIMEZONE_LABEL,
    }


def ensure_safe_root(value: Path) -> Path:
    root = value.resolve()
    if not root.is_dir() or root == Path(root.anchor):
        raise ValueError(f"Raiz insegura ou inexistente: {root}")
    return root


def ensure_under(root: Path, value: Path) -> Path:
    resolved = value.resolve()
    if resolved == root or root not in resolved.parents:
        raise ValueError(f"Destino deve ser subdiretório da raiz: {resolved}")
    return resolved


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def canonical_json(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        indent=2,
        sort_keys=True,
    ) + "\n"


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(content, encoding="utf-8")
    os.replace(temporary, path)


def sanitize_excerpt(value: str, limit: int = MAX_COMMAND_EXCERPT) -> str:
    cleaned = value.replace("\x00", "").replace("\r\n", "\n")
    for pattern in SECRET_OUTPUT_PATTERNS:
        cleaned = pattern.sub("[REDACTED]", cleaned)
    if len(cleaned) > limit:
        return cleaned[:limit] + "\n… saída truncada pelo laudo"
    return cleaned


def run_command(
    root: Path,
    check_id: str,
    title: str,
    argv: Sequence[str],
    *,
    timeout_seconds: int,
    severity_on_failure: str,
) -> dict[str, Any]:
    """Executa um comando somente leitura e captura uma evidência limitada."""

    started = time.monotonic()
    try:
        completed = subprocess.run(
            list(argv),
            cwd=root,
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            env={
                **os.environ,
                "PYTHONDONTWRITEBYTECODE": "1",
                "PYTHONUNBUFFERED": "1",
            },
        )
        exit_code = completed.returncode
        stdout = sanitize_excerpt(completed.stdout)
        stderr = sanitize_excerpt(completed.stderr)
        timed_out = False
    except subprocess.TimeoutExpired as exc:
        exit_code = 124
        stdout = sanitize_excerpt(
            exc.stdout.decode("utf-8", errors="replace")
            if isinstance(exc.stdout, bytes)
            else (exc.stdout or "")
        )
        stderr = sanitize_excerpt(
            exc.stderr.decode("utf-8", errors="replace")
            if isinstance(exc.stderr, bytes)
            else (exc.stderr or "")
        )
        timed_out = True
    except OSError as exc:
        exit_code = 127
        stdout = ""
        stderr = sanitize_excerpt(str(exc))
        timed_out = False
    duration_ms = round((time.monotonic() - started) * 1000)
    return {
        "id": check_id,
        "title": title,
        "command": list(argv),
        "status": "aprovado" if exit_code == 0 else "revisão_humana",
        "exitCode": exit_code,
        "timedOut": timed_out,
        "durationMs": duration_ms,
        "severityOnFailure": severity_on_failure,
        "stdoutExcerpt": stdout,
        "stderrExcerpt": stderr,
        "mutatesPublicContent": False,
    }


def finding(
    finding_id: str,
    category: str,
    severity: str,
    title: str,
    detail: str,
    *,
    evidence: str = "",
    heuristic: bool = False,
) -> dict[str, Any]:
    if severity not in SEVERITY_ORDER:
        raise ValueError(f"Severidade inválida: {severity}")
    fingerprint_basis = "\n".join(
        (category, title, evidence or detail[:300])
    ).encode("utf-8")
    return {
        "id": finding_id,
        "fingerprint": hashlib.sha256(fingerprint_basis).hexdigest()[:20],
        "category": category,
        "severity": severity,
        "title": title,
        "detail": detail,
        "evidence": evidence,
        "status": "requer_revisão_humana",
        "heuristic": heuristic,
        "confirmedViolation": False,
    }


def command_findings(checks: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for check in checks:
        if check["exitCode"] == 0:
            continue
        suffix = (
            " O limite de tempo foi atingido."
            if check.get("timedOut")
            else ""
        )
        results.append(
            finding(
                f"check-{check['id']}",
                "técnico",
                check["severityOnFailure"],
                f"Verificação não concluída: {check['title']}",
                (
                    f"O comando terminou com código {check['exitCode']}."
                    f"{suffix} A saída limitada deve ser revisada no JSON."
                ),
                evidence=check["id"],
            )
        )
    return results


def import_editorial_gate(root: Path) -> Any:
    script = root / "scripts_admin" / "editorial_gate.py"
    spec = importlib.util.spec_from_file_location(
        "antigravity_weekly_editorial_gate", script
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("Não foi possível carregar editorial_gate.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def tracked_paths(root: Path) -> list[str]:
    completed = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z"],
        check=True,
        capture_output=True,
    )
    return sorted(
        item
        for item in completed.stdout.decode("utf-8").split("\0")
        if item
    )


def legacy_issue_severity(code: str) -> str:
    if code.startswith("SECRET_"):
        return "crítico"
    if code in LEGACY_HIGH_CODES:
        return "alto"
    if code in LEGACY_MEDIUM_CODES:
        return "médio"
    return "baixo"


def public_source_paths_from_site(root: Path, site_dir: Path) -> list[str]:
    """Mapeia o artefato allowlisted de volta a fontes existentes na raiz."""

    candidates: list[str] = []
    for public_path in sorted(site_dir.rglob("*")):
        if not public_path.is_file():
            continue
        relative = public_path.relative_to(site_dir).as_posix()
        if (root / relative).is_file():
            candidates.append(relative)
    return candidates


def run_legacy_inventory(
    root: Path,
    public_paths: Sequence[str] | None = None,
) -> dict[str, Any]:
    """Inventaria o legado sem conceder aprovação nem alterar o registro."""

    gate = import_editorial_gate(root)
    policy = load_json(root / DEFAULT_POLICY)
    registry = load_json(root / DEFAULT_REGISTRY)
    validation_issues, path_index = gate.validate_registry(
        registry, policy, str(DEFAULT_REGISTRY)
    )
    source_paths = (
        list(public_paths)
        if public_paths is not None
        else tracked_paths(root)
    )
    candidates = [
        relative
        for relative in sorted(set(source_paths))
        if not gate._is_nonpublic_source(relative, policy)
        and (root / relative).is_file()
    ]
    issues: list[Any] = list(validation_issues)
    for relative in candidates:
        issues.extend(
            gate.scan_file(
                root,
                root / relative,
                policy,
                path_index.get(relative),
                require_registration=True,
            )
        )

    counts = Counter(issue.code for issue in issues)
    severity_counts = Counter(
        legacy_issue_severity(issue.code) for issue in issues
    )
    ordered_issues = sorted(
        issues,
        key=lambda issue: (
            -SEVERITY_ORDER[legacy_issue_severity(issue.code)],
            issue.code,
            issue.path,
        ),
    )
    samples = [
        {
            "code": issue.code,
            "path": issue.path,
            "message": issue.message,
            "severity": legacy_issue_severity(issue.code),
            "heuristic": True,
            "confirmedViolation": False,
        }
        for issue in ordered_issues[:MAX_FINDING_SAMPLES]
    ]
    return {
        "state": "not-certified",
        "publicationDecision": "outside-registry-no-approval",
        "candidateCount": len(candidates),
        "registeredPathCount": len(path_index),
        "findingCount": len(issues),
        "countsByCode": dict(sorted(counts.items())),
        "countsBySeverity": {
            severity: severity_counts.get(severity, 0)
            for severity in ("crítico", "alto", "médio", "baixo")
        },
        "sampleLimit": MAX_FINDING_SAMPLES,
        "samples": samples,
        "notice": LEGACY_DISCLAIMER,
    }


def legacy_findings(inventory: dict[str, Any]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    samples_by_code: dict[str, list[dict[str, Any]]] = {}
    for sample in inventory.get("samples", []):
        samples_by_code.setdefault(sample["code"], []).append(sample)
    for code, count in inventory.get("countsByCode", {}).items():
        samples = samples_by_code.get(code, [])
        severity = (
            samples[0]["severity"]
            if samples
            else legacy_issue_severity(code)
        )
        example_paths = [
            str(sample.get("path") or "")
            for sample in samples[:5]
            if sample.get("path")
        ]
        detail = (
            f"O inventário contabilizou {count} ocorrência(s) do código "
            f"{code}. São sinais para triagem, não violações confirmadas."
        )
        if len(samples) < count:
            detail += " O JSON preserva a contagem completa; a amostra é limitada."
        results.append(
            finding(
                f"legacy-{code}",
                "inventário legado",
                severity,
                f"Achado heurístico agregado: {code}",
                detail,
                evidence=", ".join(example_paths),
                heuristic=True,
            )
        )
    return results


def run_legal_monitor(
    root: Path, output_dir: Path, timeout_seconds: int
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    report_path = output_dir / LEGAL_REPORT_NAME
    check = run_command(
        root,
        "fontes-oficiais",
        "Monitor de fontes jurídico-editoriais oficiais",
        (
            sys.executable,
            "scripts_admin/check_legal_sources.py",
            "--check",
            "--config",
            str(DEFAULT_LEGAL_CATALOG),
            "--report",
            str(report_path),
            "--timeout-seconds",
            "20",
        ),
        timeout_seconds=timeout_seconds,
        # O monitor usa código 2 quando qualquer item pede revisão. O conteúdo
        # do relatório determina a severidade real abaixo.
        severity_on_failure="médio",
    )
    if report_path.is_file():
        try:
            report = load_json(report_path)
        except (OSError, json.JSONDecodeError) as exc:
            report = {
                "overallStatus": "review_required",
                "results": [],
                "notice": f"Relatório inválido: {exc}",
            }
    else:
        report = {
            "overallStatus": "review_required",
            "results": [],
            "notice": "O monitor não produziu o relatório esperado.",
        }

    findings: list[dict[str, Any]] = []
    results = report.get("results", [])
    if not isinstance(results, list):
        results = []
    for item in results:
        if not isinstance(item, dict):
            continue
        status = str(item.get("status") or "desconhecido")
        if status == "unchanged":
            continue
        severity = {
            "changed": "alto",
            "configuration_error": "alto",
            "baseline_unissued": "médio",
            "unavailable": "médio",
        }.get(status, "médio")
        source_id = str(item.get("id") or "fonte")
        findings.append(
            finding(
                f"legal-{source_id}-{status}",
                "fonte oficial",
                severity,
                f"Fonte oficial requer revisão: {source_id}",
                (
                    f"Estado técnico `{status}`. O resultado só detecta "
                    "disponibilidade ou mudança textual; não interpreta a regra."
                ),
                evidence=str(item.get("url") or source_id),
            )
        )
    if not report_path.is_file() or not results:
        findings.append(
            finding(
                "legal-report-incomplete",
                "fonte oficial",
                "alto",
                "Monitor oficial não gerou evidência completa",
                "Repetir a consulta e revisar configuração/conectividade.",
                evidence=LEGAL_REPORT_NAME,
            )
        )
    return {"check": check, "report": report}, findings


class _SameOriginRedirectHandler(urllib.request.HTTPRedirectHandler):
    def __init__(self, origin: tuple[str, str], base_path: str) -> None:
        super().__init__()
        self.origin = origin
        self.base_path = base_path.rstrip("/") + "/"

    def redirect_request(
        self,
        req: urllib.request.Request,
        fp: Any,
        code: int,
        msg: str,
        headers: Any,
        newurl: str,
    ) -> urllib.request.Request | None:
        parsed = urllib.parse.urlsplit(newurl)
        if (
            (parsed.scheme.casefold(), parsed.netloc.casefold()) != self.origin
            or not parsed.path.startswith(self.base_path)
        ):
            raise urllib.error.URLError(
                "Redirecionamento para origem ou prefixo não autorizado"
            )
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def validate_site_base_url(value: str) -> str:
    parsed = urllib.parse.urlsplit(value)
    if (
        parsed.scheme.casefold() != "https"
        or not parsed.netloc
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("A URL pública deve ser HTTPS, sem credenciais/query.")
    path = parsed.path or "/"
    if not path.endswith("/"):
        path += "/"
    return urllib.parse.urlunsplit(
        ("https", parsed.netloc.casefold(), path, "", "")
    )


def safe_relative_url_path(value: str) -> str:
    parsed = urllib.parse.urlsplit(value)
    path = parsed.path.replace("\\", "/")
    pure = PurePosixPath(path)
    if (
        parsed.scheme
        or parsed.netloc
        or parsed.query
        or parsed.fragment
        or path.startswith("/")
        or any(part in {"", ".", ".."} for part in pure.parts)
    ):
        raise ValueError(f"Rota relativa insegura: {value!r}")
    return pure.as_posix()


def fetch_same_origin(
    base_url: str,
    relative: str,
    *,
    timeout_seconds: float,
    max_bytes: int,
    require_complete: bool = True,
) -> tuple[int, bytes, str]:
    base_url = validate_site_base_url(base_url)
    relative = safe_relative_url_path(relative)
    target = urllib.parse.urljoin(base_url, relative)
    base = urllib.parse.urlsplit(base_url)
    origin = (base.scheme.casefold(), base.netloc.casefold())
    opener = urllib.request.build_opener(
        _SameOriginRedirectHandler(origin, base.path)
    )
    request = urllib.request.Request(
        target,
        headers={
            "Accept": "*/*",
            "User-Agent": (
                "Antigravity-WeeklyProtectiveReview/1.0 "
                "(technical availability check)"
            ),
        },
        method="GET",
    )
    with opener.open(request, timeout=timeout_seconds) as response:
        chunks: list[bytes] = []
        total = 0
        while True:
            remaining = max_bytes - total
            if remaining <= 0:
                if require_complete and response.read(1):
                    raise ValueError(
                        "Resposta pública excedeu o limite do auditor."
                    )
                break
            chunk = response.read(min(64 * 1024, remaining))
            if not chunk:
                break
            chunks.append(chunk)
            total += len(chunk)
        return int(response.status), b"".join(chunks), response.geturl()


def parse_checksums(path: Path) -> dict[str, str]:
    checksums: dict[str, str] = {}
    for line_number, raw_line in enumerate(
        path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        line = raw_line.strip()
        if not line:
            continue
        match = re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?([^/\\]+)", line)
        if not match:
            raise ValueError(
                f"Checksum inválido em {path.name}:{line_number}"
            )
        digest, filename = match.groups()
        if filename in checksums:
            raise ValueError(f"Checksum duplicado: {filename}")
        checksums[filename] = digest.casefold()
    return checksums


def inspect_zip(path: Path) -> tuple[bool, str]:
    try:
        with zipfile.ZipFile(path) as archive:
            for info in archive.infolist():
                pure = PurePosixPath(info.filename.replace("\\", "/"))
                if pure.is_absolute() or ".." in pure.parts:
                    return False, "ZIP contém path inseguro."
            bad_member = archive.testzip()
            if bad_member:
                return False, f"CRC divergente em {bad_member}."
    except (OSError, zipfile.BadZipFile) as exc:
        return False, f"ZIP inválido: {exc}"
    return True, "Estrutura e CRC válidos."


def audit_public_surface(
    root: Path,
    site_dir: Path,
    site_base_url: str | None,
    *,
    live_timeout_seconds: float,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    manifest = load_json(root / DEFAULT_MANIFEST)
    canonical_routes = manifest.get("canonicalRoutes", {})
    if not isinstance(canonical_routes, dict):
        raise ValueError("canonicalRoutes ausente ou inválido.")
    route_results: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []

    for route_id, raw_relative in sorted(canonical_routes.items()):
        relative = safe_relative_url_path(str(raw_relative))
        local_path = site_dir / relative
        local_ok = local_path.is_file()
        live_status: int | None = None
        live_error = ""
        final_url = ""
        if site_base_url:
            try:
                live_status, _, final_url = fetch_same_origin(
                    site_base_url,
                    relative,
                    timeout_seconds=live_timeout_seconds,
                    max_bytes=64 * 1024,
                    require_complete=False,
                )
            except (OSError, ValueError, urllib.error.URLError) as exc:
                live_error = sanitize_excerpt(str(exc), 500)
        live_ok = (
            not site_base_url
            or (live_status is not None and 200 <= live_status < 400)
        )
        route_results.append(
            {
                "id": route_id,
                "path": relative,
                "localExists": local_ok,
                "liveChecked": bool(site_base_url),
                "liveStatus": live_status,
                "liveFinalUrl": final_url,
                "liveError": live_error,
                "ok": local_ok and live_ok,
            }
        )
        if not local_ok:
            findings.append(
                finding(
                    f"route-local-{route_id}",
                    "rota pública",
                    "alto",
                    f"Rota ausente no artefato: {route_id}",
                    "O destino canônico não existe no build allowlisted.",
                    evidence=relative,
                )
            )
        elif site_base_url and not live_ok:
            findings.append(
                finding(
                    f"route-live-{route_id}",
                    "rota pública",
                    "médio",
                    f"Rota publicada indisponível: {route_id}",
                    (
                        "A consulta HTTPS falhou ou não retornou estado 2xx/3xx. "
                        "Pode ser falha transitória; repetir antes de concluir."
                    ),
                    evidence=relative,
                )
            )

    downloads_dir = root / DEFAULT_DOWNLOADS
    checksum_path = downloads_dir / "SHA256SUMS.txt"
    expected = parse_checksums(checksum_path)
    download_results: list[dict[str, Any]] = []
    for filename, expected_sha in sorted(expected.items()):
        local_path = downloads_dir / filename
        local_exists = local_path.is_file()
        local_sha = (
            hashlib.sha256(local_path.read_bytes()).hexdigest()
            if local_exists
            else None
        )
        checksum_ok = local_sha == expected_sha
        zip_ok, zip_message = (
            inspect_zip(local_path)
            if local_exists and filename.casefold().endswith(".zip")
            else (local_exists, "Arquivo não ZIP.")
        )
        live_status: int | None = None
        live_sha: str | None = None
        live_error = ""
        if site_base_url:
            try:
                live_status, payload, _ = fetch_same_origin(
                    site_base_url,
                    f"downloads/{filename}",
                    timeout_seconds=live_timeout_seconds,
                    max_bytes=MAX_LIVE_RESPONSE_BYTES,
                )
                live_sha = hashlib.sha256(payload).hexdigest()
            except (OSError, ValueError, urllib.error.URLError) as exc:
                live_error = sanitize_excerpt(str(exc), 500)
        live_ok = (
            not site_base_url
            or (
                live_status is not None
                and 200 <= live_status < 400
                and live_sha == expected_sha
            )
        )
        result = {
            "filename": filename,
            "localExists": local_exists,
            "expectedSha256": expected_sha,
            "localSha256": local_sha,
            "checksumOk": checksum_ok,
            "archiveOk": zip_ok,
            "archiveMessage": zip_message,
            "liveChecked": bool(site_base_url),
            "liveStatus": live_status,
            "liveSha256": live_sha,
            "liveError": live_error,
            "ok": local_exists and checksum_ok and zip_ok and live_ok,
        }
        download_results.append(result)
        if not local_exists or not checksum_ok or not zip_ok:
            findings.append(
                finding(
                    f"download-local-{filename}",
                    "download público",
                    "crítico",
                    f"Integridade local do download falhou: {filename}",
                    (
                        "Arquivo ausente, checksum divergente ou ZIP inválido. "
                        "Não republicar o pacote antes de revisão humana."
                    ),
                    evidence=filename,
                )
            )
        elif site_base_url and not live_ok:
            findings.append(
                finding(
                    f"download-live-{filename}",
                    "download público",
                    "alto",
                    f"Download publicado indisponível ou divergente: {filename}",
                    (
                        "A versão HTTPS não pôde ser confirmada pelo checksum "
                        "canônico. Repetir a consulta e revisar o deploy."
                    ),
                    evidence=filename,
                )
            )

    return {
        "siteBaseUrl": site_base_url,
        "liveChecksAreAvailabilityEvidenceOnly": True,
        "routes": route_results,
        "downloads": download_results,
        "summary": {
            "routeCount": len(route_results),
            "routesOk": sum(bool(item["ok"]) for item in route_results),
            "downloadCount": len(download_results),
            "downloadsOk": sum(bool(item["ok"]) for item in download_results),
        },
    }, findings


def severity_counts(findings: Sequence[dict[str, Any]]) -> dict[str, int]:
    counter = Counter(item["severity"] for item in findings)
    return {
        severity: counter.get(severity, 0)
        for severity in ("crítico", "alto", "médio", "baixo")
    }


def compare_with_previous(
    current_findings: Sequence[dict[str, Any]],
    previous: dict[str, Any] | None,
) -> dict[str, Any]:
    current_fingerprints = {
        str(item["fingerprint"]) for item in current_findings
    }
    if not isinstance(previous, dict):
        return {
            "available": False,
            "reason": (
                "Nenhum resumo semanal anterior válido foi fornecido. "
                "A primeira execução estabelece referência comparável."
            ),
            "currentFingerprints": sorted(current_fingerprints),
        }
    previous_fingerprints = {
        str(value)
        for value in previous.get("findingFingerprints", [])
        if isinstance(value, str)
    }
    previous_counts = previous.get("severityCounts", {})
    current_counts = severity_counts(current_findings)
    return {
        "available": True,
        "previousWeekId": previous.get("weekId"),
        "newFindingFingerprints": sorted(
            current_fingerprints - previous_fingerprints
        ),
        "resolvedFindingFingerprints": sorted(
            previous_fingerprints - current_fingerprints
        ),
        "persistingFindingFingerprints": sorted(
            current_fingerprints & previous_fingerprints
        ),
        "severityDelta": {
            severity: current_counts[severity]
            - int(previous_counts.get(severity, 0) or 0)
            for severity in ("crítico", "alto", "médio", "baixo")
        },
    }


def next_seven_days(findings: Sequence[dict[str, Any]]) -> list[str]:
    counts = severity_counts(findings)
    actions: list[str] = []
    if counts["crítico"]:
        actions.append(
            "Em até 24 horas: isolar manualmente a superfície afetada e validar "
            "integridade/privacidade antes de qualquer nova publicação."
        )
    if counts["alto"]:
        actions.append(
            "Em até 72 horas: revisar os achados altos com responsável editorial "
            "e especialista adequado ao tema; registrar decisão e evidência."
        )
    if any(item["category"] == "fonte oficial" for item in findings):
        actions.append(
            "Comparar manualmente cada mudança/indisponibilidade com a fonte "
            "oficial; não atualizar baseline sem revisor e instante explícitos."
        )
    if any(item["category"] == "inventário legado" for item in findings):
        actions.append(
            "Triar um lote do inventário legado, começando por segredos, dados "
            "pessoais, direitos incertos e alegações profissionais; não presumir infração."
        )
    if any(
        item["category"] in {"rota pública", "download público"}
        for item in findings
    ):
        actions.append(
            "Repetir rotas e downloads em rede independente e corrigir somente "
            "após confirmar que não é instabilidade transitória."
        )
    actions.append(
        "Registrar revisão humana, responsável, data, decisão e fontes; manter "
        "conteúdo duvidoso em quarentena até resolução."
    )
    actions.append(
        "Na próxima segunda-feira, comparar o novo laudo com este extrato e "
        "documentar achados novos, persistentes e resolvidos."
    )
    return actions


def overall_status(findings: Sequence[dict[str, Any]]) -> str:
    counts = severity_counts(findings)
    if counts["crítico"] or counts["alto"]:
        return "revisão_humana_prioritária"
    if counts["médio"]:
        return "atenção_e_revisão_humana"
    if counts["baixo"]:
        return "triagem_programada"
    return "sem_achados_automatizados_relevantes"


def git_metadata(root: Path) -> dict[str, Any]:
    def call(*args: str) -> str:
        try:
            completed = subprocess.run(
                ["git", "-C", str(root), *args],
                check=True,
                capture_output=True,
                text=True,
            )
            return completed.stdout.strip()
        except (OSError, subprocess.SubprocessError):
            return ""

    return {
        "commit": call("rev-parse", "HEAD"),
        "branch": call("branch", "--show-current"),
        "repository": os.environ.get("GITHUB_REPOSITORY", ""),
        "runId": os.environ.get("GITHUB_RUN_ID", ""),
        "runAttempt": os.environ.get("GITHUB_RUN_ATTEMPT", ""),
        "runUrl": (
            f"{os.environ.get('GITHUB_SERVER_URL')}/"
            f"{os.environ.get('GITHUB_REPOSITORY')}/actions/runs/"
            f"{os.environ.get('GITHUB_RUN_ID')}"
            if os.environ.get("GITHUB_SERVER_URL")
            and os.environ.get("GITHUB_REPOSITORY")
            and os.environ.get("GITHUB_RUN_ID")
            else ""
        ),
    }


def report_summary_for_issue(report: dict[str, Any]) -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "weekId": report["period"]["weekId"],
        "generatedAt": report["generatedAt"],
        "overallStatus": report["summary"]["overallStatus"],
        "severityCounts": report["summary"]["severityCounts"],
        "findingFingerprints": sorted(
            item["fingerprint"] for item in report["findings"]
        ),
        "commit": report["execution"]["commit"],
    }


def build_report(
    *,
    period: dict[str, str],
    generated_at: str,
    execution: dict[str, Any],
    checks: list[dict[str, Any]],
    legal_monitor: dict[str, Any],
    legacy_inventory: dict[str, Any],
    public_surface: dict[str, Any],
    findings: list[dict[str, Any]],
    previous: dict[str, Any] | None,
) -> dict[str, Any]:
    counts = severity_counts(findings)
    report = {
        "schemaVersion": SCHEMA_VERSION,
        "reportType": "revisão-protetiva-editorial-jurídica-técnica",
        "generatedAt": generated_at,
        "period": period,
        "summary": {
            "overallStatus": overall_status(findings),
            "findingCount": len(findings),
            "severityCounts": counts,
            "automaticLegalInterpretation": False,
            "automaticCorrection": False,
            "automaticCommit": False,
            "automaticPublication": False,
            "automaticSitePublication": False,
            "sanitizedIssueExcerptPublication": True,
            "confirmedViolationCount": 0,
        },
        "execution": execution,
        "scope": {
            "axes": [
                "fontes jurídico-editoriais oficiais cadastradas",
                "testes automatizados",
                "manifests e rotas",
                "gate de publicação e privacidade",
                "gate editorial",
                "inventário heurístico do legado",
                "rotas e downloads do artefato e da versão pública",
            ],
            "legalCatalog": str(DEFAULT_LEGAL_CATALOG),
            "legalSourcesAreOfficialCatalogOnly": True,
        },
        "checks": checks,
        "legalSourceMonitor": legal_monitor["report"],
        "legacyInventory": legacy_inventory,
        "publicSurface": public_surface,
        "findings": findings,
        "comparison": compare_with_previous(findings, previous),
        "nextSevenDays": next_seven_days(findings),
        "limitations": [
            LEGAL_NOTICE,
            LEGACY_DISCLAIMER,
            (
                "Disponibilidade HTTPS é uma fotografia do instante; falhas de "
                "rede e cache podem gerar alertas transitórios."
            ),
            (
                "Testes automatizados não substituem inspeção clínica, jurídica, "
                "de acessibilidade, de segurança ofensiva ou de dispositivos reais."
            ),
            (
                "Ausência de achado automatizado não prova inexistência de risco. "
                "Fontes alteradas sempre exigem leitura humana do texto oficial."
            ),
        ],
    }
    report["comparisonToken"] = report_summary_for_issue(report)
    report["recommendedExitCode"] = (
        1 if counts["crítico"] or counts["alto"] else 0
    )
    return report


def markdown_cell(value: Any, limit: int = 300) -> str:
    return (
        str(value if value not in (None, "") else "—")
        .replace("|", "\\|")
        .replace("\r", " ")
        .replace("\n", " ")[:limit]
    )


def render_markdown(report: dict[str, Any]) -> str:
    summary = report["summary"]
    counts = summary["severityCounts"]
    comparison = report["comparison"]
    lines = [
        f"# Laudo semanal de revisão protetiva — {report['period']['weekId']}",
        "",
        f"**Gerado em:** `{report['generatedAt']}`  ",
        f"**Data local:** `{report['period']['localDate']}` · `{report['period']['timezone']}`  ",
        f"**Estado:** `{summary['overallStatus']}`  ",
        "",
        "> " + LEGAL_NOTICE,
        "",
        "## Extrato executivo",
        "",
        "| Severidade | Achados para revisão |",
        "|---|---:|",
        f"| Crítico | {counts['crítico']} |",
        f"| Alto | {counts['alto']} |",
        f"| Médio | {counts['médio']} |",
        f"| Baixo | {counts['baixo']} |",
        "",
        (
            "**Nenhum achado deste laudo é rotulado como violação confirmada.** "
            "O mecanismo organiza sinais técnicos para decisão humana."
        ),
        "",
        "## Comparação com a revisão anterior",
        "",
    ]
    if comparison.get("available"):
        lines.extend(
            [
                f"- Referência anterior: `{markdown_cell(comparison.get('previousWeekId'))}`",
                f"- Novos sinais: `{len(comparison['newFindingFingerprints'])}`",
                f"- Persistentes: `{len(comparison['persistingFindingFingerprints'])}`",
                f"- Não observados nesta execução: `{len(comparison['resolvedFindingFingerprints'])}`",
                (
                    "- Variação por severidade: "
                    + ", ".join(
                        f"{severity} {delta:+d}"
                        for severity, delta in comparison[
                            "severityDelta"
                        ].items()
                    )
                ),
            ]
        )
    else:
        lines.append(f"- {comparison.get('reason')}")

    lines.extend(
        [
            "",
            "## Eixos técnicos executados",
            "",
            "| Verificação | Resultado | Código | Duração |",
            "|---|---|---:|---:|",
        ]
    )
    for check in report["checks"]:
        lines.append(
            f"| {markdown_cell(check['title'])} | "
            f"{markdown_cell(check['status'])} | {check['exitCode']} | "
            f"{check['durationMs']} ms |"
        )

    lines.extend(
        [
            "",
            "## Achados priorizados",
            "",
            "| Severidade | Área | Achado | Evidência | Natureza |",
            "|---|---|---|---|---|",
        ]
    )
    if report["findings"]:
        for item in sorted(
            report["findings"],
            key=lambda value: (
                -SEVERITY_ORDER[value["severity"]],
                value["category"],
                value["title"],
            ),
        ):
            nature = (
                "heurístico · não confirmado"
                if item["heuristic"]
                else "sinal técnico · revisão humana"
            )
            lines.append(
                f"| {item['severity']} | {markdown_cell(item['category'])} | "
                f"{markdown_cell(item['title'])} | "
                f"`{markdown_cell(item['evidence'], 180)}` | {nature} |"
            )
    else:
        lines.append(
            "| — | — | Nenhum achado automatizado relevante nesta execução. | — | "
            "não é certificação |"
        )

    legal_results = report["legalSourceMonitor"].get("results", [])
    lines.extend(
        [
            "",
            "## Fontes oficiais monitoradas",
            "",
            (
                "A automação consulta somente o catálogo allowlisted. Mudança de "
                "hash, baseline ausente ou indisponibilidade **não é interpretação da norma**."
            ),
            "",
            "| Fonte | Publicador | Estado técnico | URL oficial |",
            "|---|---|---|---|",
        ]
    )
    for item in legal_results:
        url = str(item.get("url") or "")
        link = f"[abrir]({url})" if url.startswith("https://") else "—"
        lines.append(
            f"| {markdown_cell(item.get('title') or item.get('id'))} | "
            f"{markdown_cell(item.get('publisher'))} | "
            f"`{markdown_cell(item.get('status'))}` | {link} |"
        )

    legacy = report["legacyInventory"]
    lines.extend(
        [
            "",
            "## Inventário editorial legado",
            "",
            f"> {LEGACY_DISCLAIMER}",
            "",
            f"- Arquivos candidatos: `{legacy['candidateCount']}`",
            f"- Paths já registrados: `{legacy['registeredPathCount']}`",
            f"- Sinais heurísticos: `{legacy['findingCount']}`",
            f"- Estado declarado: `{legacy['state']}`",
            f"- Decisão do baseline: `{legacy['publicationDecision']}`",
            "",
            "| Código heurístico | Quantidade |",
            "|---|---:|",
        ]
    )
    for code, count in legacy["countsByCode"].items():
        lines.append(f"| `{markdown_cell(code)}` | {count} |")
    if not legacy["countsByCode"]:
        lines.append("| — | 0 |")

    surface = report["publicSurface"]
    lines.extend(
        [
            "",
            "## Rotas e downloads públicos",
            "",
            f"- Base consultada: `{markdown_cell(surface.get('siteBaseUrl'))}`",
            (
                f"- Rotas: `{surface['summary']['routesOk']}/"
                f"{surface['summary']['routeCount']}` sem sinal de falha"
            ),
            (
                f"- Downloads: `{surface['summary']['downloadsOk']}/"
                f"{surface['summary']['downloadCount']}` com integridade confirmada"
            ),
            "",
            "| Download | Local/checksum/ZIP | HTTPS/checksum |",
            "|---|---|---|",
        ]
    )
    for item in surface["downloads"]:
        local = (
            "OK"
            if item["localExists"]
            and item["checksumOk"]
            and item["archiveOk"]
            else "REVISAR"
        )
        live = (
            "OK"
            if not item["liveChecked"]
            or (
                item["liveStatus"]
                and 200 <= item["liveStatus"] < 400
                and item["liveSha256"] == item["expectedSha256"]
            )
            else "REVISAR"
        )
        lines.append(
            f"| `{markdown_cell(item['filename'])}` | {local} | {live} |"
        )

    lines.extend(["", "## Plano para os próximos 7 dias", ""])
    for index, action in enumerate(report["nextSevenDays"], start=1):
        lines.append(f"{index}. {action}")

    lines.extend(["", "## Limitações e responsabilidade", ""])
    for limitation in report["limitations"]:
        lines.append(f"- {limitation}")
    execution = report["execution"]
    lines.extend(
        [
            "",
            "## Rastreabilidade",
            "",
            f"- Commit: `{markdown_cell(execution.get('commit'))}`",
            f"- Branch: `{markdown_cell(execution.get('branch'))}`",
            (
                f"- Execução: [abrir workflow]({execution['runUrl']})"
                if execution.get("runUrl")
                else "- Execução local: sem URL de workflow."
            ),
            "",
            (
                "_Nenhum baseline, conteúdo, registro editorial, commit ou deploy "
                "foi alterado automaticamente por esta revisão._"
            ),
            "",
        ]
    )
    return "\n".join(lines)


def load_previous(path: Path | None) -> dict[str, Any] | None:
    if path is None or not path.is_file():
        return None
    try:
        value = load_json(path)
    except (OSError, json.JSONDecodeError):
        return None
    return value if isinstance(value, dict) else None


def default_checks(root: Path) -> list[dict[str, Any]]:
    return [
        run_command(
            root,
            "python-tests",
            "Testes automatizados Python",
            (
                sys.executable,
                "-m",
                "unittest",
                "discover",
                "-s",
                "tests",
                "-p",
                "test_*.py",
                "-v",
            ),
            timeout_seconds=25 * 60,
            severity_on_failure="alto",
        ),
        run_command(
            root,
            "clinical-catalogs",
            "Catálogos clínicos JavaScript",
            ("node", "tests/validate_clinical_catalogs.js"),
            timeout_seconds=5 * 60,
            severity_on_failure="alto",
        ),
        run_command(
            root,
            "static-manifests",
            "Manifests estáticos",
            (sys.executable, "scripts_admin/check_static_manifests.py"),
            timeout_seconds=5 * 60,
            severity_on_failure="alto",
        ),
        run_command(
            root,
            "routes",
            "Rotas e aliases locais",
            (sys.executable, "scripts/validate_routes.py"),
            timeout_seconds=5 * 60,
            severity_on_failure="alto",
        ),
        run_command(
            root,
            "paths",
            "Paths públicos declarados",
            (
                sys.executable,
                "scripts_admin/validar_paths.py",
                "--check",
            ),
            timeout_seconds=10 * 60,
            severity_on_failure="alto",
        ),
        run_command(
            root,
            "publication-guard-repository",
            "Portão de privacidade do repositório",
            (
                sys.executable,
                "scripts_admin/publication_guard.py",
                "check-repository",
                ".",
            ),
            timeout_seconds=10 * 60,
            severity_on_failure="crítico",
        ),
        run_command(
            root,
            "editorial-gate",
            "Política, registro e proveniência editoriais",
            (
                sys.executable,
                "scripts_admin/editorial_gate.py",
                "--check",
                "--json",
            ),
            timeout_seconds=5 * 60,
            severity_on_failure="alto",
        ),
    ]


def run(
    root: Path,
    output_dir: Path,
    *,
    site_base_url: str | None,
    previous_json: Path | None,
    skip_full_tests: bool,
    skip_live: bool,
) -> dict[str, Any]:
    root = ensure_safe_root(root)
    output_dir = ensure_under(root, output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    site_dir = output_dir / "_site"
    if site_dir.exists():
        shutil.rmtree(site_dir)

    period = local_week_metadata()
    generated_at = utc_now()
    legal_monitor, legal_findings_list = run_legal_monitor(
        root, output_dir, timeout_seconds=5 * 60
    )
    checks: list[dict[str, Any]] = [legal_monitor["check"]]
    if not skip_full_tests:
        checks.extend(default_checks(root))
    else:
        checks.append(
            {
                "id": "full-suite-skipped",
                "title": "Suíte completa omitida por opção explícita",
                "command": [],
                "status": "omitido",
                "exitCode": 0,
                "timedOut": False,
                "durationMs": 0,
                "severityOnFailure": "alto",
                "stdoutExcerpt": "",
                "stderrExcerpt": "",
                "mutatesPublicContent": False,
            }
        )

    build_check = run_command(
        root,
        "build-public-site",
        "Build público por allowlist",
        (
            sys.executable,
            "scripts_admin/build_public_site.py",
            ".",
            str(site_dir),
        ),
        timeout_seconds=20 * 60,
        severity_on_failure="crítico",
    )
    checks.append(build_check)
    if build_check["exitCode"] == 0:
        checks.append(
            run_command(
                root,
                "publication-guard-site",
                "Portão de privacidade do artefato",
                (
                    sys.executable,
                    "scripts_admin/publication_guard.py",
                    "check-site",
                    str(site_dir),
                ),
                timeout_seconds=10 * 60,
                severity_on_failure="crítico",
            )
        )

    try:
        legacy_inventory = run_legacy_inventory(
            root,
            public_source_paths_from_site(root, site_dir)
            if site_dir.is_dir()
            else None,
        )
    except Exception as exc:  # relatório deve sobreviver a erro do inventário
        legacy_inventory = {
            "state": "not-certified",
            "publicationDecision": "outside-registry-no-approval",
            "candidateCount": 0,
            "registeredPathCount": 0,
            "findingCount": 1,
            "countsByCode": {"INVENTORY_EXECUTION_FAILED": 1},
            "countsBySeverity": {
                "crítico": 0,
                "alto": 1,
                "médio": 0,
                "baixo": 0,
            },
            "sampleLimit": MAX_FINDING_SAMPLES,
            "samples": [
                {
                    "code": "INVENTORY_EXECUTION_FAILED",
                    "path": "",
                    "message": sanitize_excerpt(str(exc), 500),
                    "severity": "alto",
                    "heuristic": True,
                    "confirmedViolation": False,
                }
            ],
            "notice": LEGACY_DISCLAIMER,
        }

    surface_findings: list[dict[str, Any]] = []
    if build_check["exitCode"] == 0 and site_dir.is_dir():
        try:
            public_surface, surface_findings = audit_public_surface(
                root,
                site_dir,
                None
                if skip_live
                else validate_site_base_url(
                    site_base_url or DEFAULT_SITE_BASE_URL
                ),
                live_timeout_seconds=20,
            )
        except Exception as exc:
            public_surface = {
                "siteBaseUrl": None if skip_live else site_base_url,
                "liveChecksAreAvailabilityEvidenceOnly": True,
                "routes": [],
                "downloads": [],
                "summary": {
                    "routeCount": 0,
                    "routesOk": 0,
                    "downloadCount": 0,
                    "downloadsOk": 0,
                },
                "error": sanitize_excerpt(str(exc), 500),
            }
            surface_findings.append(
                finding(
                    "public-surface-execution-failed",
                    "rota pública",
                    "alto",
                    "Auditoria de rotas/downloads não foi concluída",
                    "Revisar configuração e repetir a verificação.",
                    evidence="publicSurface.error",
                )
            )
    else:
        public_surface = {
            "siteBaseUrl": None if skip_live else site_base_url,
            "liveChecksAreAvailabilityEvidenceOnly": True,
            "routes": [],
            "downloads": [],
            "summary": {
                "routeCount": 0,
                "routesOk": 0,
                "downloadCount": 0,
                "downloadsOk": 0,
            },
            "error": "Build indisponível; superfície não auditada.",
        }
        surface_findings.append(
            finding(
                "public-surface-blocked-by-build",
                "rota pública",
                "alto",
                "Rotas e downloads não foram auditados",
                "O build público falhou; corrigir essa etapa antes de nova publicação.",
                evidence="build-public-site",
            )
        )

    all_findings = (
        command_findings(
            check
            for check in checks
            if check["id"] != "fontes-oficiais"
        )
        + legal_findings_list
        + legacy_findings(legacy_inventory)
        + surface_findings
    )
    report = build_report(
        period=period,
        generated_at=generated_at,
        execution=git_metadata(root),
        checks=checks,
        legal_monitor=legal_monitor,
        legacy_inventory=legacy_inventory,
        public_surface=public_surface,
        findings=all_findings,
        previous=load_previous(previous_json),
    )
    write_atomic(output_dir / OUTPUT_JSON_NAME, canonical_json(report))
    write_atomic(
        output_dir / OUTPUT_MARKDOWN_NAME,
        render_markdown(report),
    )
    if site_dir.exists():
        shutil.rmtree(site_dir)
    return report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("weekly-protective-review"),
    )
    parser.add_argument(
        "--site-base-url",
        default=DEFAULT_SITE_BASE_URL,
        help="Base HTTPS da versão pública para checagem de disponibilidade.",
    )
    parser.add_argument("--previous-json", type=Path)
    parser.add_argument(
        "--skip-full-tests",
        action="store_true",
        help="Somente para desenvolvimento local; o workflow semanal não usa.",
    )
    parser.add_argument(
        "--skip-live",
        action="store_true",
        help="Omite rede pública; fontes oficiais continuam sendo monitoradas.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        root = ensure_safe_root(args.root)
        output_candidate = (
            args.output_dir
            if args.output_dir.is_absolute()
            else root / args.output_dir
        )
        output_dir = ensure_under(root, output_candidate)
        previous_json = args.previous_json
        if previous_json is not None and not previous_json.is_absolute():
            previous_json = root / previous_json
    except (OSError, ValueError) as exc:
        print(f"ERRO DE CONFIGURAÇÃO: {exc}", file=sys.stderr)
        return 2
    try:
        report = run(
            root,
            output_dir,
            site_base_url=args.site_base_url,
            previous_json=previous_json,
            skip_full_tests=args.skip_full_tests,
            skip_live=args.skip_live,
        )
    except Exception as exc:
        # Não mascara a falha: tenta deixar um extrato mínimo antes de sair.
        period = local_week_metadata()
        fallback = {
            "schemaVersion": SCHEMA_VERSION,
            "reportType": "revisão-protetiva-editorial-jurídica-técnica",
            "generatedAt": utc_now(),
            "period": period,
            "summary": {
                "overallStatus": "revisão_humana_prioritária",
                "findingCount": 1,
                "severityCounts": {
                    "crítico": 1,
                    "alto": 0,
                    "médio": 0,
                    "baixo": 0,
                },
                "automaticLegalInterpretation": False,
                "automaticCorrection": False,
                "automaticCommit": False,
                "automaticPublication": False,
                "confirmedViolationCount": 0,
            },
            "execution": git_metadata(root),
            "findings": [
                finding(
                    "weekly-review-execution-failed",
                    "execução",
                    "crítico",
                    "Laudo semanal não foi concluído",
                    sanitize_excerpt(str(exc), 800),
                    evidence="weekly_protective_review.py",
                )
            ],
            "limitations": [LEGAL_NOTICE],
            "recommendedExitCode": 1,
        }
        output_dir.mkdir(parents=True, exist_ok=True)
        write_atomic(output_dir / OUTPUT_JSON_NAME, canonical_json(fallback))
        write_atomic(
            output_dir / OUTPUT_MARKDOWN_NAME,
            (
                f"# Laudo semanal incompleto — {period['weekId']}\n\n"
                f"> {LEGAL_NOTICE}\n\n"
                "## Falha crítica de execução\n\n"
                f"{sanitize_excerpt(str(exc), 800)}\n"
            ),
        )
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1
    print(
        "Laudo semanal gerado: "
        f"{report['summary']['overallStatus']} | "
        f"{report['summary']['findingCount']} achado(s) para revisão humana."
    )
    # O código não tenta publicar/corrigir. O workflow decide se deve marcar a
    # execução como falha após arquivar e abrir a issue.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
