#!/usr/bin/env python3
"""Validação fail-closed de SVGs publicados pelo projeto.

O navegador trata SVG como documento ativo. Por isso esta política aceita
somente um subconjunto gráfico declarativo, sem scripts, HTML incorporado,
animações, folhas de estilo ou recursos externos. Referências ``url(...)`` e
``href`` são permitidas apenas para IDs dentro do próprio documento.
"""

from __future__ import annotations

import hashlib
import html
import re
import unicodedata
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path


MAX_SVG_BYTES = 5 * 1024 * 1024
MAX_SVG_ELEMENTS = 100_000
SVG_NAMESPACE = "http://www.w3.org/2000/svg"
XLINK_NAMESPACE = "http://www.w3.org/1999/xlink"
XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace"

# Elementos capazes de executar, navegar, carregar outros documentos, animar
# atributos ou incorporar HTML ficam fora desta lista por construção.
ALLOWED_TAGS = frozenset(
    {
        "svg",
        "g",
        "defs",
        "title",
        "desc",
        "path",
        "rect",
        "circle",
        "ellipse",
        "line",
        "polyline",
        "polygon",
        "text",
        "tspan",
        "clippath",
        "mask",
        "lineargradient",
        "radialgradient",
        "stop",
        "pattern",
        "marker",
        "symbol",
        "use",
    }
)

ALLOWED_ATTRIBUTES = frozenset(
    {
        "id",
        "class",
        "style",
        "role",
        "aria-label",
        "aria-labelledby",
        "aria-describedby",
        "focusable",
        "space",
        "width",
        "height",
        "viewbox",
        "preserveaspectratio",
        "x",
        "y",
        "x1",
        "y1",
        "x2",
        "y2",
        "cx",
        "cy",
        "r",
        "rx",
        "ry",
        "points",
        "d",
        "transform",
        "fill",
        "fill-rule",
        "fill-opacity",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-opacity",
        "opacity",
        "paint-order",
        "color",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        "text-anchor",
        "dominant-baseline",
        "letter-spacing",
        "word-spacing",
        "textlength",
        "lengthadjust",
        "href",
        "clip-path",
        "clippathunits",
        "mask",
        "maskunits",
        "maskcontentunits",
        "marker-start",
        "marker-mid",
        "marker-end",
        "markerwidth",
        "markerheight",
        "markerunits",
        "refx",
        "refy",
        "orient",
        "gradientunits",
        "gradienttransform",
        "offset",
        "stop-color",
        "stop-opacity",
        "spreadmethod",
        "patternunits",
        "patterncontentunits",
        "patterntransform",
    }
)

ALLOWED_STYLE_PROPERTIES = frozenset(
    {
        "fill",
        "fill-rule",
        "fill-opacity",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-opacity",
        "opacity",
        "paint-order",
        "color",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        "text-anchor",
        "dominant-baseline",
        "letter-spacing",
        "word-spacing",
        "display",
        "visibility",
    }
)

LOCAL_FRAGMENT = re.compile(r"#[A-Za-z_][A-Za-z0-9_.:-]*\Z")
CSS_COMMENT = re.compile(r"/\*.*?\*/", flags=re.DOTALL)
CSS_HEX_ESCAPE = re.compile(r"\\([0-9a-fA-F]{1,6})(?:\s)?")
CSS_SIMPLE_ESCAPE = re.compile(r"\\([^0-9a-fA-F\r\n])")
URL_FUNCTION = re.compile(r"url\s*\(\s*(['\"]?)(.*?)\1\s*\)", flags=re.IGNORECASE | re.DOTALL)
DANGEROUS_TOKEN = re.compile(
    r"(?:javascript|vbscript|data|file|https?|blob)\s*:|"
    r"@\s*import|expression\s*\(|-moz-binding|behavior\s*:|stylesheet|"
    r"(?:^|[^:])//",
    flags=re.IGNORECASE,
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _qualified_name(value: str) -> tuple[str, str]:
    if value.startswith("{") and "}" in value:
        namespace, local = value[1:].split("}", 1)
        return namespace, local.casefold()
    return "", value.casefold()


def _decode_css_escapes(value: str) -> str:
    def replace_hex(match: re.Match[str]) -> str:
        codepoint = int(match.group(1), 16)
        if codepoint == 0 or codepoint > 0x10FFFF:
            return "\ufffd"
        return chr(codepoint)

    decoded = value
    for _ in range(3):
        updated = CSS_HEX_ESCAPE.sub(replace_hex, decoded)
        updated = CSS_SIMPLE_ESCAPE.sub(r"\1", updated)
        if updated == decoded:
            break
        decoded = updated
    return decoded


def _canonical_value(value: str) -> str:
    canonical = unicodedata.normalize("NFKC", value)
    for _ in range(3):
        updated = html.unescape(urllib.parse.unquote(canonical))
        if updated == canonical:
            break
        canonical = updated
    canonical = _decode_css_escapes(CSS_COMMENT.sub("", canonical))
    if any(unicodedata.category(character) in {"Cc", "Cf"} for character in canonical):
        raise ValueError("caractere de controle ou formatação bloqueado em atributo SVG")
    return canonical


def _validate_references(value: str, context: str) -> None:
    canonical = _canonical_value(value)
    if DANGEROUS_TOKEN.search(canonical):
        raise ValueError(f"referência ativa ou externa bloqueada em {context}")

    matches = list(URL_FUNCTION.finditer(canonical))
    for match in matches:
        reference = match.group(2).strip().strip("'\"").strip()
        if LOCAL_FRAGMENT.fullmatch(reference) is None:
            raise ValueError(f"url externo ou inválido bloqueado em {context}")

    without_safe_urls = URL_FUNCTION.sub("", canonical)
    if re.search(r"u\s*r\s*l\s*\(", without_safe_urls, flags=re.IGNORECASE):
        raise ValueError(f"função url malformada bloqueada em {context}")


def _validate_style(value: str) -> None:
    canonical = _canonical_value(value)
    _validate_references(canonical, "style")
    if not canonical.strip():
        return
    for declaration in canonical.split(";"):
        declaration = declaration.strip()
        if not declaration:
            continue
        if ":" not in declaration:
            raise ValueError("declaração CSS malformada bloqueada em style")
        property_name, property_value = declaration.split(":", 1)
        if property_name.strip().casefold() not in ALLOWED_STYLE_PROPERTIES:
            raise ValueError(f"propriedade CSS não permitida: {property_name.strip()}")
        _validate_references(property_value, f"style/{property_name.strip()}")


def validate_svg_file(path: Path) -> None:
    """Valida um SVG existente sem modificá-lo.

    Qualquer dúvida de parsing, namespace, elemento, atributo ou referência
    resulta em ``ValueError``. O chamador decide se bloqueia publicação ou põe
    a fonte em quarentena.
    """

    if path.is_symlink() or not path.is_file():
        raise ValueError(f"SVG ausente, irregular ou simbólico: {path}")
    size = path.stat().st_size
    if size <= 0 or size > MAX_SVG_BYTES:
        raise ValueError(f"SVG fora do limite seguro de bytes: {path.name}")

    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise ValueError(f"SVG não é UTF-8 legível: {path.name}") from exc

    if "\x00" in text:
        raise ValueError(f"SVG com byte nulo bloqueado: {path.name}")
    if re.search(r"<!\s*(?:doctype|entity)\b", text, flags=re.IGNORECASE):
        raise ValueError(f"SVG com DTD/ENTITY bloqueado: {path.name}")
    if re.search(r"<\?(?!xml(?:\s|\?>))", text, flags=re.IGNORECASE):
        raise ValueError(f"SVG com instrução de processamento bloqueada: {path.name}")

    try:
        root = ET.fromstring(text)
    except ET.ParseError as exc:
        raise ValueError(f"SVG malformado: {path.name}") from exc

    root_namespace, root_name = _qualified_name(root.tag)
    if root_name != "svg" or root_namespace not in {"", SVG_NAMESPACE}:
        raise ValueError(f"raiz ou namespace SVG inválido: {path.name}")

    elements = list(root.iter())
    if len(elements) > MAX_SVG_ELEMENTS:
        raise ValueError(f"SVG excede o limite de elementos: {path.name}")

    for element in elements:
        namespace, tag = _qualified_name(element.tag)
        if namespace not in {"", SVG_NAMESPACE} or tag not in ALLOWED_TAGS:
            raise ValueError(f"elemento SVG não permitido: {tag}")

        for qualified_attribute, value in element.attrib.items():
            attribute_namespace, attribute = _qualified_name(qualified_attribute)
            if attribute_namespace not in {"", XLINK_NAMESPACE, XML_NAMESPACE}:
                raise ValueError(f"namespace de atributo SVG não permitido: {attribute}")
            if attribute.startswith("on"):
                raise ValueError(f"manipulador de evento SVG bloqueado: {attribute}")
            if attribute not in ALLOWED_ATTRIBUTES:
                raise ValueError(f"atributo SVG não permitido: {attribute}")
            if attribute == "style":
                _validate_style(value)
                continue
            if attribute == "href":
                reference = _canonical_value(value).strip()
                if LOCAL_FRAGMENT.fullmatch(reference) is None:
                    raise ValueError("href SVG deve apontar somente para #id local")
                continue
            _validate_references(value, attribute)


def validate_svg_integrity(path: Path, expected_sha256: str) -> None:
    """Valida conteúdo ativo e a impressão digital esperada de um SVG."""

    if re.fullmatch(r"[0-9a-f]{64}", expected_sha256) is None:
        raise ValueError("SHA-256 esperado do SVG ausente ou inválido")
    validate_svg_file(path)
    actual = sha256_file(path)
    if actual != expected_sha256:
        raise ValueError(
            f"integridade do SVG divergente: {path.name} "
            f"(obtido {actual}, esperado {expected_sha256})"
        )
