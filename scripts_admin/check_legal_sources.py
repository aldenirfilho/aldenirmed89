#!/usr/bin/env python3
"""Monitora mudanças técnicas em fontes jurídico-editoriais oficiais.

O comando é deliberadamente conservador:

* ``--check`` consulta somente hosts HTTPS de uma allowlist compilada, compara
  hashes de texto normalizado e emite um relatório JSON. Ele nunca altera o
  catálogo de baselines.
* ``--refresh`` altera baselines somente quando fonte(s), revisor e instante
  com fuso são fornecidos explicitamente. A troca do arquivo é atômica.
* Nenhum modo interpreta a lei, aprova conteúdo ou publica alterações.

Exemplos:

    python3 scripts_admin/check_legal_sources.py --check

    python3 scripts_admin/check_legal_sources.py --check \
      --report legal-integrity-report.json

    python3 scripts_admin/check_legal_sources.py --refresh \
      --source cfm-resolution-2336 \
      --reviewer "Nome do revisor" \
      --reviewed-at "2026-07-25T22:00:00-03:00"
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import html.parser
import json
import os
import re
import sys
import tempfile
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from email.message import Message
from pathlib import Path
from typing import Any, Iterable, Sequence


SCHEMA_VERSION = "antigravity-legal-sources-v1"
REPORT_SCHEMA_VERSION = "antigravity-legal-source-report-v1"
DEFAULT_CONFIG = Path("19_Integridade_Editorial/data/legal-sources.json")
DEFAULT_TIMEOUT_SECONDS = 20.0
MIN_TIMEOUT_SECONDS = 1.0
MAX_TIMEOUT_SECONDS = 60.0
HARD_MAX_RESPONSE_BYTES = 5_000_000
MAX_NORMALIZED_BYTES = 4_000_000
USER_AGENT = (
    "Antigravity-LegalIntegrityMonitor/1.0 "
    "(+https://aldenirfilho.github.io/aldenirmed89/"
    "19_Integridade_Editorial/; technical-change-monitor)"
)
ALLOWED_HOSTS = frozenset(
    {
        "www.planalto.gov.br",
        "sistemas.cfm.org.br",
        "portal.cfm.org.br",
        "publicidademedica.cfm.org.br",
        "www.gov.br",
        "creativecommons.org",
    }
)
ALLOWED_CONTENT_TYPES = frozenset(
    {
        "text/html",
        "text/plain",
        "application/xhtml+xml",
    }
)
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
SOURCE_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{2,63}$")
ISO_DATE_PREFIX_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T")
ZERO_WIDTH_RE = re.compile("[\u200b\u200c\u200d\u2060\ufeff]")
WHITESPACE_RE = re.compile(r"\s+")
DEFAULT_VOLATILE_PATTERNS = (
    # Datas de moldura editorial mudam sem que a norma ou orientação mude.
    r"\b(?:publicado|atualizado|modificado)\s+em\s+"
    r"\d{1,2}/\d{1,2}/\d{4}(?:\s+(?:às|as)\s+\d{1,2}h?\d{0,2})?",
    r"\blast\s+(?:updated|modified)\s+(?:on\s+)?"
    r"[a-z]+\s+\d{1,2},?\s+\d{4}",
    # Tokens de consentimento/cabeçalho não fazem parte do conteúdo monitorado.
    r"\b(?:aceitar todos os cookies|rejeitar cookies|gerenciar cookies)\b",
)
SKIP_TAGS = frozenset(
    {
        "script",
        "style",
        "noscript",
        "svg",
        "canvas",
        "template",
        "nav",
        "header",
        "footer",
        "form",
        "dialog",
    }
)
BLOCK_TAGS = frozenset(
    {
        "address",
        "article",
        "aside",
        "blockquote",
        "br",
        "dd",
        "div",
        "dl",
        "dt",
        "figcaption",
        "figure",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "li",
        "main",
        "ol",
        "p",
        "pre",
        "section",
        "table",
        "tbody",
        "td",
        "th",
        "thead",
        "tr",
        "ul",
    }
)


class MonitorError(RuntimeError):
    """Erro esperado, seguro para ser resumido no relatório público."""


class SourceConfigurationError(MonitorError):
    """Configuração recusada em modo fail-closed."""


class SourceUnavailableError(MonitorError):
    """Fonte não pôde ser verificada com os limites estabelecidos."""


@dataclass(frozen=True)
class Snapshot:
    sourceId: str
    finalUrl: str
    contentType: str
    downloadedBytes: int
    normalizedBytes: int
    sha256: str
    hashBasis: str


class _VisibleTextParser(html.parser.HTMLParser):
    """Extrai texto visível, preferindo ``main``/``article`` quando presentes."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_stack: list[str] = []
        self._scope_depth = 0
        self._body: list[str] = []
        self._scoped: list[str] = []

    @staticmethod
    def _is_scope(tag: str, attrs: list[tuple[str, str | None]]) -> bool:
        return tag in {"main", "article"}

    def _append(self, value: str) -> None:
        self._body.append(value)
        if self._scope_depth:
            self._scoped.append(value)

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        tag = tag.casefold()
        if self._skip_stack:
            if tag in SKIP_TAGS:
                self._skip_stack.append(tag)
            return
        if tag in SKIP_TAGS:
            self._skip_stack.append(tag)
            return
        if self._is_scope(tag, attrs):
            self._scope_depth += 1
        if tag in BLOCK_TAGS:
            self._append(" ")

    def handle_startendtag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if not self._skip_stack and tag.casefold() in BLOCK_TAGS:
            self._append(" ")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.casefold()
        if self._skip_stack:
            if tag in SKIP_TAGS:
                for index in range(len(self._skip_stack) - 1, -1, -1):
                    if self._skip_stack[index] == tag:
                        del self._skip_stack[index:]
                        break
            return
        if tag in BLOCK_TAGS:
            self._append(" ")
        if tag in {"main", "article"} and self._scope_depth:
            self._scope_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self._skip_stack:
            self._append(data)

    def selected_text(self) -> str:
        scoped = "".join(self._scoped)
        # Páginas com um ``article`` decorativo muito curto não devem ocultar
        # o corpo principal. O limiar é estrutural, não dependente do baseline.
        return scoped if len(scoped.strip()) >= 200 else "".join(self._body)


class _RestrictedRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Impede que um host oficial redirecione o monitor para outro domínio."""

    def __init__(self, allowed_hosts: frozenset[str]) -> None:
        super().__init__()
        self.allowed_hosts = allowed_hosts

    def redirect_request(
        self,
        req: urllib.request.Request,
        fp: Any,
        code: int,
        msg: str,
        headers: Message,
        newurl: str,
    ) -> urllib.request.Request | None:
        validate_https_url(newurl, self.allowed_hosts)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def canonical_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def write_atomic(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_name, path)
    finally:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace(
        "+00:00", "Z"
    )


def validate_timestamp(value: str, field: str) -> str:
    if not isinstance(value, str) or not ISO_DATE_PREFIX_RE.match(value):
        raise SourceConfigurationError(f"{field} deve ser ISO-8601 completo")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise SourceConfigurationError(f"{field} deve ser ISO-8601 válido") from exc
    if parsed.tzinfo is None:
        raise SourceConfigurationError(f"{field} precisa incluir fuso horário")
    return value


def validate_https_url(
    url: str, allowed_hosts: Iterable[str] = ALLOWED_HOSTS
) -> urllib.parse.SplitResult:
    if not isinstance(url, str) or len(url) > 2048:
        raise SourceConfigurationError("URL ausente ou longa demais")
    try:
        parsed = urllib.parse.urlsplit(url)
        port = parsed.port
    except ValueError as exc:
        raise SourceConfigurationError("URL inválida") from exc
    hostname = (parsed.hostname or "").casefold().rstrip(".")
    allowed = {host.casefold().rstrip(".") for host in allowed_hosts}
    if parsed.scheme.casefold() != "https":
        raise SourceConfigurationError("somente URLs HTTPS são aceitas")
    if parsed.username or parsed.password:
        raise SourceConfigurationError("credenciais em URL são recusadas")
    if port not in (None, 443):
        raise SourceConfigurationError("somente a porta HTTPS padrão é aceita")
    if hostname not in allowed:
        raise SourceConfigurationError(f"host fora da allowlist: {hostname or '(vazio)'}")
    if not parsed.path.startswith("/"):
        raise SourceConfigurationError("caminho absoluto HTTPS obrigatório")
    if parsed.fragment:
        raise SourceConfigurationError("fragmentos não são aceitos em fonte monitorada")
    return parsed


def _validate_source(source: dict[str, Any]) -> None:
    source_id = source.get("id")
    if not isinstance(source_id, str) or not SOURCE_ID_RE.fullmatch(source_id):
        raise SourceConfigurationError("id de fonte inválido")
    for field in ("title", "publisher", "url", "expectedHost"):
        value = source.get(field)
        if not isinstance(value, str) or not value.strip():
            raise SourceConfigurationError(f"{source_id}: {field} obrigatório")
    expected_host = source["expectedHost"].casefold().rstrip(".")
    if expected_host not in ALLOWED_HOSTS:
        raise SourceConfigurationError(
            f"{source_id}: expectedHost fora da allowlist compilada"
        )
    parsed = validate_https_url(source["url"], {expected_host})
    if (parsed.hostname or "").casefold().rstrip(".") != expected_host:
        raise SourceConfigurationError(f"{source_id}: host divergente")

    extraction = source.get("extraction")
    if extraction not in {"visible-html-text-v1", "raw-pdf-bytes-v1"}:
        raise SourceConfigurationError(f"{source_id}: extraction não suportada")
    max_bytes = source.get("maxBytes")
    min_normalized = source.get("minNormalizedBytes")
    if not isinstance(max_bytes, int) or not 1 <= max_bytes <= HARD_MAX_RESPONSE_BYTES:
        raise SourceConfigurationError(f"{source_id}: maxBytes inválido")
    if (
        not isinstance(min_normalized, int)
        or not 100 <= min_normalized <= MAX_NORMALIZED_BYTES
    ):
        raise SourceConfigurationError(
            f"{source_id}: minNormalizedBytes inválido"
        )

    markers = source.get("requiredMarkers")
    if not isinstance(markers, list) or any(
        not isinstance(item, str) or len(item.strip()) < 3 for item in markers
    ):
        raise SourceConfigurationError(f"{source_id}: requiredMarkers inválido")
    if extraction == "visible-html-text-v1" and len(markers) < 2:
        raise SourceConfigurationError(
            f"{source_id}: ao menos dois requiredMarkers são obrigatórios"
        )
    if extraction == "raw-pdf-bytes-v1" and markers:
        raise SourceConfigurationError(
            f"{source_id}: PDF binário não aceita marcadores textuais"
        )
    ignore_patterns = source.get("ignoreRegexes", [])
    if not isinstance(ignore_patterns, list) or any(
        not isinstance(item, str) or len(item) > 500 for item in ignore_patterns
    ):
        raise SourceConfigurationError(f"{source_id}: ignoreRegexes inválido")
    try:
        for pattern in ignore_patterns:
            re.compile(pattern)
    except re.error as exc:
        raise SourceConfigurationError(
            f"{source_id}: ignoreRegexes contém expressão inválida"
        ) from exc

    state = source.get("baselineState")
    if state not in {"issued", "unissued"}:
        raise SourceConfigurationError(f"{source_id}: baselineState inválido")
    if state == "issued":
        sha = source.get("baselineSha256")
        normalized_bytes = source.get("baselineNormalizedBytes")
        if not isinstance(sha, str) or not SHA256_RE.fullmatch(sha):
            raise SourceConfigurationError(
                f"{source_id}: baselineSha256 emitido inválido"
            )
        if not isinstance(normalized_bytes, int) or normalized_bytes < min_normalized:
            raise SourceConfigurationError(
                f"{source_id}: baselineNormalizedBytes emitido inválido"
            )
        if not isinstance(source.get("baselineReviewedBy"), str) or not source[
            "baselineReviewedBy"
        ].strip():
            raise SourceConfigurationError(
                f"{source_id}: baselineReviewedBy obrigatório"
            )
        validate_timestamp(source.get("baselineConsultedAt"), "baselineConsultedAt")
    else:
        if source.get("baselineSha256") is not None:
            raise SourceConfigurationError(
                f"{source_id}: baseline unissued não pode ter SHA-256"
            )
        if source.get("baselineNormalizedBytes") is not None:
            raise SourceConfigurationError(
                f"{source_id}: baseline unissued não pode ter tamanho"
            )
        if not isinstance(source.get("baselineNote"), str) or not source[
            "baselineNote"
        ].strip():
            raise SourceConfigurationError(
                f"{source_id}: baselineNote explica o estado unissued"
            )
        validate_timestamp(source.get("lastConsultedAt"), "lastConsultedAt")


def validate_config(config: dict[str, Any]) -> None:
    if config.get("schemaVersion") != SCHEMA_VERSION:
        raise SourceConfigurationError("schemaVersion do catálogo inválida")
    configured_hosts = config.get("allowedHosts")
    if not isinstance(configured_hosts, list) or set(configured_hosts) != set(
        sorted(ALLOWED_HOSTS)
    ):
        raise SourceConfigurationError(
            "allowedHosts deve coincidir com a allowlist compilada"
        )
    if config.get("automaticLegalInterpretation") is not False:
        raise SourceConfigurationError(
            "automaticLegalInterpretation precisa permanecer false"
        )
    sources = config.get("sources")
    if not isinstance(sources, list) or not sources:
        raise SourceConfigurationError("catálogo precisa conter fontes")
    seen: set[str] = set()
    for source in sources:
        if not isinstance(source, dict):
            raise SourceConfigurationError("entrada de fonte inválida")
        _validate_source(source)
        if source["id"] in seen:
            raise SourceConfigurationError(f"id duplicado: {source['id']}")
        seen.add(source["id"])


def load_config(path: Path) -> dict[str, Any]:
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SourceConfigurationError(f"não foi possível ler {path}") from exc
    if not isinstance(config, dict):
        raise SourceConfigurationError("raiz do catálogo precisa ser objeto JSON")
    validate_config(config)
    return config


def _decode_document(raw: bytes, headers: Message) -> str:
    declared = headers.get_content_charset()
    candidates: list[str] = []
    if declared:
        candidates.append(declared)
    prefix = raw[:4096]
    meta = re.search(
        br"""(?ix)
        <meta[^>]+charset\s*=\s*["']?\s*([a-z0-9._-]+)
        """,
        prefix,
    )
    if meta:
        candidates.append(meta.group(1).decode("ascii", "ignore"))
    candidates.extend(["utf-8", "windows-1252", "iso-8859-1"])
    tried: set[str] = set()
    for encoding in candidates:
        normalized_encoding = encoding.casefold()
        if normalized_encoding in tried:
            continue
        tried.add(normalized_encoding)
        try:
            return raw.decode(encoding, errors="strict")
        except (LookupError, UnicodeDecodeError):
            continue
    raise SourceUnavailableError("codificação textual não pôde ser validada")


def normalize_document(document: str, ignore_regexes: Sequence[str] = ()) -> str:
    parser = _VisibleTextParser()
    try:
        parser.feed(document)
        parser.close()
    except (html.parser.HTMLParseError, RecursionError) as exc:
        raise SourceUnavailableError("HTML não pôde ser normalizado") from exc
    text = unicodedata.normalize("NFKC", parser.selected_text())
    text = ZERO_WIDTH_RE.sub("", text).casefold()
    for pattern in (*DEFAULT_VOLATILE_PATTERNS, *ignore_regexes):
        text = re.sub(pattern, " ", text, flags=re.IGNORECASE)
    return WHITESPACE_RE.sub(" ", text).strip()


def _bounded_read(response: Any, max_bytes: int) -> bytes:
    content_length = response.headers.get("Content-Length")
    if content_length:
        try:
            declared = int(content_length)
        except ValueError as exc:
            raise SourceUnavailableError("Content-Length inválido") from exc
        if declared < 0 or declared > max_bytes:
            raise SourceUnavailableError(
                f"resposta excede o limite de {max_bytes} bytes"
            )
    chunks: list[bytes] = []
    consumed = 0
    while True:
        chunk = response.read(min(64 * 1024, max_bytes - consumed + 1))
        if not chunk:
            break
        consumed += len(chunk)
        if consumed > max_bytes:
            raise SourceUnavailableError(
                f"resposta excede o limite de {max_bytes} bytes"
            )
        chunks.append(chunk)
    return b"".join(chunks)


def fetch_snapshot(
    source: dict[str, Any],
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
    opener: Any | None = None,
) -> Snapshot:
    _validate_source(source)
    if not MIN_TIMEOUT_SECONDS <= timeout_seconds <= MAX_TIMEOUT_SECONDS:
        raise SourceConfigurationError("timeout fora do intervalo seguro")
    expected_host = source["expectedHost"].casefold().rstrip(".")
    validate_https_url(source["url"], {expected_host})
    if opener is None:
        opener = urllib.request.build_opener(
            _RestrictedRedirectHandler(frozenset({expected_host}))
        )
    request = urllib.request.Request(
        source["url"],
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9",
            "Accept-Encoding": "identity",
            "Cache-Control": "no-cache",
        },
        method="GET",
    )
    try:
        with opener.open(request, timeout=timeout_seconds) as response:
            status = getattr(response, "status", response.getcode())
            if status != 200:
                raise SourceUnavailableError(f"HTTP inesperado: {status}")
            final_url = response.geturl()
            validate_https_url(final_url, {expected_host})
            content_encoding = (response.headers.get("Content-Encoding") or "").strip()
            if content_encoding.casefold() not in {"", "identity"}:
                raise SourceUnavailableError(
                    f"Content-Encoding não suportado: {content_encoding}"
                )
            content_type = response.headers.get_content_type().casefold()
            extraction = source["extraction"]
            expected_types = (
                {"application/pdf"}
                if extraction == "raw-pdf-bytes-v1"
                else ALLOWED_CONTENT_TYPES
            )
            if content_type not in expected_types:
                raise SourceUnavailableError(
                    f"Content-Type não suportado: {content_type}"
                )
            raw = _bounded_read(response, source["maxBytes"])
            headers = response.headers
    except SourceUnavailableError:
        raise
    except (
        TimeoutError,
        urllib.error.URLError,
        urllib.error.HTTPError,
        ConnectionError,
        OSError,
    ) as exc:
        raise SourceUnavailableError(
            f"fonte indisponível ({type(exc).__name__})"
        ) from exc

    if source["extraction"] == "raw-pdf-bytes-v1":
        if not raw.startswith(b"%PDF-"):
            raise SourceUnavailableError("assinatura PDF obrigatória ausente")
        normalized_raw = raw
        hash_basis = "raw-pdf-bytes-v1"
    else:
        document = _decode_document(raw, headers)
        normalized = normalize_document(document, source.get("ignoreRegexes", []))
        normalized_raw = normalized.encode("utf-8")
        hash_basis = "visible-html-text-v1"
    if len(normalized_raw) < source["minNormalizedBytes"]:
        raise SourceUnavailableError(
            "conteúdo normalizado curto demais; possível bloqueio ou página de erro"
        )
    if len(normalized_raw) > MAX_NORMALIZED_BYTES:
        raise SourceUnavailableError("conteúdo normalizado excede o limite seguro")
    for marker in source["requiredMarkers"]:
        marker_normalized = WHITESPACE_RE.sub(
            " ", unicodedata.normalize("NFKC", marker).casefold()
        ).strip()
        if marker_normalized not in normalized:
            raise SourceUnavailableError(
                f"marcador obrigatório ausente: {marker[:80]}"
            )
    return Snapshot(
        sourceId=source["id"],
        finalUrl=final_url,
        contentType=content_type,
        downloadedBytes=len(raw),
        normalizedBytes=len(normalized_raw),
        sha256=hashlib.sha256(normalized_raw).hexdigest(),
        hashBasis=hash_basis,
    )


def _selected_sources(
    config: dict[str, Any], requested_ids: Sequence[str]
) -> list[dict[str, Any]]:
    sources_by_id = {source["id"]: source for source in config["sources"]}
    if not requested_ids:
        return list(config["sources"])
    unknown = sorted(set(requested_ids) - set(sources_by_id))
    if unknown:
        raise SourceConfigurationError(
            f"fonte(s) desconhecida(s): {', '.join(unknown)}"
        )
    return [sources_by_id[source_id] for source_id in dict.fromkeys(requested_ids)]


def run_check(
    config: dict[str, Any],
    requested_ids: Sequence[str] = (),
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
    checked_at: str | None = None,
) -> tuple[dict[str, Any], bool]:
    validate_config(config)
    checked_at = checked_at or utc_now()
    validate_timestamp(checked_at, "checkedAt")
    results: list[dict[str, Any]] = []
    needs_review = False
    for source in _selected_sources(config, requested_ids):
        base = {
            "id": source["id"],
            "title": source["title"],
            "publisher": source["publisher"],
            "url": source["url"],
            "baselineState": source["baselineState"],
        }
        try:
            snapshot = fetch_snapshot(source, timeout_seconds=timeout_seconds)
        except MonitorError as exc:
            needs_review = True
            results.append(
                {
                    **base,
                    "status": "unavailable",
                    "errorType": type(exc).__name__,
                    "message": str(exc),
                }
            )
            continue

        observed = asdict(snapshot)
        if source["baselineState"] != "issued":
            status = "baseline_unissued"
            needs_review = True
        elif (
            snapshot.sha256 != source["baselineSha256"]
            or snapshot.normalizedBytes != source["baselineNormalizedBytes"]
        ):
            status = "changed"
            needs_review = True
        else:
            status = "unchanged"
        results.append(
            {
                **base,
                "status": status,
                "expectedSha256": source.get("baselineSha256"),
                "expectedNormalizedBytes": source.get("baselineNormalizedBytes"),
                "observed": observed,
            }
        )

    report = {
        "schemaVersion": REPORT_SCHEMA_VERSION,
        "mode": "check",
        "checkedAt": checked_at,
        "overallStatus": "review_required" if needs_review else "unchanged",
        "automaticPublication": False,
        "automaticLegalInterpretation": False,
        "notice": (
            "Relatório técnico de disponibilidade e mudança textual. "
            "Não constitui interpretação, validação ou assessoria jurídica."
        ),
        "results": results,
    }
    return report, needs_review


def run_refresh(
    config: dict[str, Any],
    requested_ids: Sequence[str],
    reviewer: str,
    reviewed_at: str,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
) -> tuple[dict[str, Any], dict[str, Any]]:
    validate_config(config)
    if not requested_ids:
        raise SourceConfigurationError(
            "--refresh exige ao menos um --source explícito"
        )
    reviewer = reviewer.strip()
    if not 3 <= len(reviewer) <= 160 or "\n" in reviewer or "\r" in reviewer:
        raise SourceConfigurationError("--reviewer inválido")
    validate_timestamp(reviewed_at, "--reviewed-at")

    selected = _selected_sources(config, requested_ids)
    snapshots: dict[str, Snapshot] = {}
    # Primeiro busca e valida tudo. Qualquer falha impede uma escrita parcial.
    for source in selected:
        snapshots[source["id"]] = fetch_snapshot(
            source, timeout_seconds=timeout_seconds
        )

    refreshed = copy.deepcopy(config)
    refreshed["lastBaselineReview"] = {
        "reviewedAt": reviewed_at,
        "reviewedBy": reviewer,
        "scope": list(dict.fromkeys(requested_ids)),
    }
    for source in refreshed["sources"]:
        snapshot = snapshots.get(source["id"])
        if snapshot is None:
            continue
        source["baselineState"] = "issued"
        source["baselineSha256"] = snapshot.sha256
        source["baselineNormalizedBytes"] = snapshot.normalizedBytes
        source["baselineConsultedAt"] = reviewed_at
        source["baselineReviewedBy"] = reviewer
        source["baselineFinalUrl"] = snapshot.finalUrl
        source["baselineContentType"] = snapshot.contentType
        source.pop("baselineNote", None)
        source.pop("lastConsultedAt", None)
    validate_config(refreshed)
    report = {
        "schemaVersion": REPORT_SCHEMA_VERSION,
        "mode": "refresh",
        "checkedAt": reviewed_at,
        "overallStatus": "baseline_refreshed",
        "automaticPublication": False,
        "automaticLegalInterpretation": False,
        "reviewer": reviewer,
        "notice": (
            "Baselines técnicos atualizados por solicitação explícita. "
            "A operação não interpreta nem aprova juridicamente o conteúdo."
        ),
        "results": [
            {
                "id": source["id"],
                "title": source["title"],
                "status": "baseline_refreshed",
                "observed": asdict(snapshots[source["id"]]),
            }
            for source in selected
        ],
    }
    return refreshed, report


def _configuration_error_report(mode: str, exc: Exception) -> dict[str, Any]:
    return {
        "schemaVersion": REPORT_SCHEMA_VERSION,
        "mode": mode,
        "checkedAt": utc_now(),
        "overallStatus": "review_required",
        "automaticPublication": False,
        "automaticLegalInterpretation": False,
        "notice": (
            "Falha fechada de configuração/execução. Revisão humana obrigatória; "
            "nenhuma interpretação ou publicação automática foi realizada."
        ),
        "results": [
            {
                "id": "monitor",
                "status": "configuration_error",
                "errorType": type(exc).__name__,
                "message": str(exc),
            }
        ],
    }


def _emit_report(report: dict[str, Any], report_path: Path | None) -> None:
    payload = canonical_json_bytes(report)
    if report_path is None:
        sys.stdout.buffer.write(payload)
    else:
        write_atomic(report_path, payload)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--check",
        action="store_true",
        help="compara sem alterar o catálogo de baselines",
    )
    mode.add_argument(
        "--refresh",
        action="store_true",
        help="atualiza baselines selecionados com revisão explícita",
    )
    parser.add_argument("--config", default=str(DEFAULT_CONFIG))
    parser.add_argument(
        "--source",
        action="append",
        default=[],
        help="id exato da fonte; repetível",
    )
    parser.add_argument("--reviewer")
    parser.add_argument("--reviewed-at")
    parser.add_argument("--report")
    parser.add_argument(
        "--timeout-seconds",
        type=float,
        default=DEFAULT_TIMEOUT_SECONDS,
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    config_path = Path(args.config)
    report_path = Path(args.report) if args.report else None
    if report_path is not None and report_path.resolve() == config_path.resolve():
        report = _configuration_error_report(
            "refresh" if args.refresh else "check",
            SourceConfigurationError("--report não pode sobrescrever --config"),
        )
        _emit_report(report, None)
        return 2

    try:
        config = load_config(config_path)
        if args.check:
            if args.reviewer or args.reviewed_at:
                raise SourceConfigurationError(
                    "--reviewer/--reviewed-at só são aceitos com --refresh"
                )
            report, needs_review = run_check(
                config,
                requested_ids=args.source,
                timeout_seconds=args.timeout_seconds,
            )
            _emit_report(report, report_path)
            return 2 if needs_review else 0

        if not args.reviewer or not args.reviewed_at:
            raise SourceConfigurationError(
                "--refresh exige --reviewer e --reviewed-at explícitos"
            )
        refreshed, report = run_refresh(
            config,
            requested_ids=args.source,
            reviewer=args.reviewer,
            reviewed_at=args.reviewed_at,
            timeout_seconds=args.timeout_seconds,
        )
        # O relatório é emitido antes da troca do catálogo somente em memória;
        # a escrita efetiva continua atômica e ocorre uma única vez.
        write_atomic(config_path, canonical_json_bytes(refreshed))
        _emit_report(report, report_path)
        return 0
    except (MonitorError, ValueError) as exc:
        report = _configuration_error_report(
            "refresh" if args.refresh else "check", exc
        )
        _emit_report(report, report_path)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
