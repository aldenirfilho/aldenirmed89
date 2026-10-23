#!/usr/bin/env python3
"""Gera uma cópia HTML autocontida do catálogo público de agentes 360X.

Lê somente os arquivos locais do catálogo: HTML canônico, CSS, JavaScript,
imagens e JSON. Incorpora recursos sem consultar a rede, preserva as âncoras
internas e converte os demais links relativos para os destinos publicados.
"""

from __future__ import annotations

import argparse
import base64
from datetime import date
import hashlib
from html import escape
from html.parser import HTMLParser
import json
import mimetypes
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit


REPO_ROOT = Path(__file__).resolve().parents[1]
CATALOG_ROOT = REPO_ROOT / "ecossistema" / "agentes-habilidades"
PUBLIC_BASE = "https://aldenirfilho.github.io/aldenirmed89/ecossistema/agentes-habilidades/"
DOWNLOAD_NAME = "Catalogo_Agentes_Habilidades_360X_2026.html"

OFFLINE_STYLE = """
.offline-copy-note{width:min(1240px,calc(100% - 72px));margin:16px auto 0;padding:9px 13px;border:1px solid #dcded3;border-radius:7px;background:#eeeee5;color:#66746b;font:10px/1.7 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;display:flex;flex-wrap:wrap;gap:5px 12px;align-items:center;justify-content:space-between}
.offline-copy-note strong{color:#183e3d;font-weight:650}.offline-copy-note a{color:#183e3d;text-underline-offset:3px}
@media(max-width:1000px){.offline-copy-note{width:calc(100% - 48px)}}
@media(max-width:700px){.offline-copy-note{width:calc(100% - 36px);font-size:9px}}
@media print{.offline-copy-note{width:100%;font-size:7pt;background:transparent;margin:8pt 0}}
""".strip()


def esc(value: object) -> str:
    return escape(str(value), quote=True)


def safe_close_tag(source: str, tag: str) -> str:
    """Evita que uma string de CSS/JS encerre seu elemento HTML antecipadamente."""
    return re.sub(rf"</{re.escape(tag)}", lambda match: "<\\/" + match.group(0)[2:], source, flags=re.I)


def attrs_html(attrs: list[tuple[str, str | None]]) -> str:
    return "".join(f" {key}" if value is None else f' {key}="{esc(value)}"' for key, value in attrs)


def human_date(value: object) -> str:
    if value:
        try:
            return date.fromisoformat(str(value)[:10]).strftime("%d/%m/%Y")
        except ValueError:
            return str(value)
    return "data indicada nas fichas"


class OfflineBuilder(HTMLParser):
    def __init__(self, canonical: Path, json_file: Path, public_base: str):
        super().__init__(convert_charrefs=False)
        self.canonical = canonical.resolve()
        self.root = self.canonical.parent
        self.public_base = public_base.rstrip("/") + "/"
        self.json_bytes = json_file.read_bytes()
        self.data = json.loads(self.json_bytes)
        if not isinstance(self.data, dict) or not isinstance(self.data.get("entries"), list):
            raise ValueError("O JSON do catálogo deve conter uma lista entries.")
        self.json_uri = "data:application/json;charset=utf-8;base64," + base64.b64encode(self.json_bytes).decode("ascii")
        self.parts: list[str] = []
        self.scripts: list[tuple[list[tuple[str, str | None]], str]] = []
        self.resource_cache: dict[Path, str] = {}
        self.images = 0
        self.stylesheets = 0
        self.json_downloads = 0
        self.entries: list[str] = []
        self.banner_added = False
        self.scripts_added = False
        self._skip_script = False
        self._skip_anchor_depth = 0

    def local_resource(self, value: str, base_dir: Path | None = None) -> Path:
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc:
            public = urlsplit(self.public_base)
            if parsed.scheme not in {"http", "https"} or parsed.netloc != public.netloc or not parsed.path.startswith(public.path):
                raise ValueError(f"Recurso externo não pode ser embutido sem rede: {value}")
            relative = unquote(parsed.path[len(public.path):])
            target = (self.root / relative).resolve()
        else:
            if parsed.path.startswith("/"):
                public_path = urlsplit(self.public_base).path
                if not parsed.path.startswith(public_path):
                    raise ValueError(f"Recurso fora do diretório do catálogo: {value}")
                target = (self.root / unquote(parsed.path[len(public_path):])).resolve()
            else:
                target = ((base_dir or self.root) / unquote(parsed.path)).resolve()
        if not target.is_relative_to(self.root):
            raise ValueError(f"Recurso fora do diretório do catálogo: {value}")
        if not target.is_file():
            raise FileNotFoundError(f"Recurso local não encontrado: {target}")
        return target

    def data_uri(self, value: str, base_dir: Path | None = None) -> str:
        if value.startswith("data:"):
            return value
        resource = self.local_resource(value, base_dir)
        if resource not in self.resource_cache:
            mime = mimetypes.guess_type(resource.name)[0] or "application/octet-stream"
            self.resource_cache[resource] = f"data:{mime};base64," + base64.b64encode(resource.read_bytes()).decode("ascii")
        fragment = urlsplit(value).fragment
        return self.resource_cache[resource] + ("#" + fragment if fragment else "")

    def embed_css_urls(self, source: str, base_dir: Path) -> str:
        if re.search(r"@import\b", source, flags=re.I):
            raise ValueError("CSS com @import exige incorporação explícita antes de gerar a cópia offline.")

        def replace(match: re.Match) -> str:
            value = match.group(2).strip()
            if value.startswith(("#", "data:")):
                return match.group(0)
            return 'url("' + self.data_uri(value, base_dir) + '")'

        return re.sub(r"url\(\s*([\"']?)(.*?)\1\s*\)", replace, source, flags=re.I)

    def absolute_link(self, value: str) -> str:
        if not value or value.startswith(("#", "data:", "blob:", "mailto:", "tel:")):
            return value
        return urljoin(self.public_base, value)

    def is_json_link(self, value: str) -> bool:
        observed = urlsplit(urljoin(self.public_base, value))
        expected = urlsplit(urljoin(self.public_base, "data/catalogo.json"))
        return (observed.netloc, observed.path) == (expected.netloc, expected.path)

    def is_html_download(self, value: str) -> bool:
        observed = urlsplit(urljoin(self.public_base, value))
        expected = urlsplit(urljoin(self.public_base, "downloads/" + DOWNLOAD_NAME))
        return (observed.netloc, observed.path) == (expected.netloc, expected.path)

    def offline_note(self) -> str:
        verified = human_date((self.data.get("metadata") or {}).get("verifiedAt"))
        return ('<aside class="offline-copy-note" data-offline-copy aria-label="Informações da cópia offline">'
                f'<span><strong>Cópia offline</strong> · Dados verificados em {esc(verified)}. Consulta e busca funcionam neste arquivo; links externos exigem conexão.</span>'
                f'<a href="{esc(self.public_base)}" target="_blank" rel="noopener noreferrer">Consultar edição online</a></aside>')

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self._skip_script:
            return
        if self._skip_anchor_depth:
            if tag == "a":
                self._skip_anchor_depth += 1
            return
        values = dict(attrs)
        if tag == "base":
            return
        if tag == "main" and not self.banner_added:
            self.parts.append(self.offline_note())
            self.banner_added = True
        if tag == "article" and values.get("data-entry-id"):
            self.entries.append(values["data-entry-id"])
        if tag == "link" and "stylesheet" in (values.get("rel") or "").split():
            resource = self.local_resource(values.get("href") or "")
            css = self.embed_css_urls(resource.read_text(encoding="utf-8"), resource.parent)
            media = f' media="{esc(values["media"])}"' if values.get("media") else ""
            self.parts.append(f'<style{media}>\n{safe_close_tag(css, "style")}\n</style>')
            self.stylesheets += 1
            return
        if tag == "script" and values.get("src"):
            resource = self.local_resource(values["src"])
            source = resource.read_text(encoding="utf-8")
            kept = [(key, value) for key, value in attrs if key not in {"src", "defer", "async", "integrity", "crossorigin"}]
            self.scripts.append((kept, source))
            self._skip_script = True
            return
        if tag == "a" and values.get("href") and self.is_html_download(values["href"]):
            kept = [(key, value) for key, value in attrs if key not in {"href", "download", "target", "rel", "title", "aria-label"}]
            kept.extend([("href", self.public_base), ("target", "_blank"), ("rel", "noopener noreferrer"), ("title", "Abrir a edição online do catálogo")])
            self.parts.append('<a' + attrs_html(kept) + '><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-arrow-up"></use></svg> Versão online</a>')
            self._skip_anchor_depth = 1
            return

        changed = False
        updated = []
        for key, value in attrs:
            new_value = value
            if tag == "img" and key == "src" and value:
                new_value = self.data_uri(value)
                self.images += 1
            elif tag == "link" and key == "href" and "icon" in (values.get("rel") or "").split() and value:
                new_value = self.data_uri(value)
            elif tag == "a" and key == "href" and value and self.is_json_link(value):
                new_value = self.json_uri
                self.json_downloads += 1
            elif key in {"href", "xlink:href", "action", "poster"} and value:
                new_value = self.absolute_link(value)
            elif key == "src" and value:
                new_value = self.absolute_link(value)
            if new_value != value:
                changed = True
            updated.append((key, new_value))
        if tag == "a" and values.get("href") and self.is_json_link(values["href"]):
            updated = [(key, value) for key, value in updated if key != "download"]
            updated.append(("download", "catalogo_agentes_habilidades_360x_2026.json"))
            changed = True
        self.parts.append('<' + tag + attrs_html(updated) + '>' if changed else self.get_starttag_text())

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        if self._skip_script:
            if tag == "script":
                self._skip_script = False
            return
        if self._skip_anchor_depth:
            if tag == "a":
                self._skip_anchor_depth -= 1
            return
        if tag == "head":
            self.parts.append('<style id="offline-copy-style">' + OFFLINE_STYLE + '</style>')
        if tag == "body" and not self.scripts_added:
            for attrs, source in self.scripts:
                self.parts.append('<script' + attrs_html(attrs) + '>\n' + safe_close_tag(source, "script") + '\n</script>')
            self.scripts_added = True
        self.parts.append(f'</{tag}>')

    def handle_data(self, data: str) -> None:
        if not self._skip_script and not self._skip_anchor_depth:
            self.parts.append(data)

    def handle_entityref(self, name: str) -> None:
        self.handle_data(f'&{name};')

    def handle_charref(self, name: str) -> None:
        self.handle_data(f'&#{name};')

    def handle_comment(self, data: str) -> None:
        if not self._skip_script and not self._skip_anchor_depth:
            self.parts.append(f'<!--{data}-->')

    def handle_decl(self, decl: str) -> None:
        self.parts.append(f'<!{decl}>')

    def handle_pi(self, data: str) -> None:
        self.parts.append(f'<?{data}>')

    def result(self) -> str:
        if self._skip_script or self._skip_anchor_depth:
            raise ValueError("O HTML canônico tem um elemento de recurso sem fechamento.")
        if not self.scripts_added or not self.banner_added:
            raise ValueError("O HTML canônico não contém a estrutura body/main esperada.")
        if not self.stylesheets or not self.scripts:
            raise ValueError("Não foram encontrados CSS e JavaScript para incorporar.")
        if self.images != 3:
            raise ValueError(f"Esperadas três ilustrações no HTML canônico; encontradas {self.images}.")
        if not self.json_downloads:
            raise ValueError("O link de download do JSON não foi localizado.")
        expected = [str(item.get("id")) for item in self.data["entries"] if isinstance(item, dict)]
        if self.entries != expected:
            raise ValueError("As fichas do HTML canônico divergem do JSON. Recompile index.html antes de gerar o download.")
        return "".join(self.parts)


class OfflineAudit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.entries: list[str] = []
        self.images = 0
        self.styles = 0
        self.scripts = 0
        self.json_uris: list[str] = []
        self.errors: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "article" and values.get("data-entry-id"):
            self.entries.append(values["data-entry-id"])
        if tag == "img":
            self.images += 1
            if not (values.get("src") or "").startswith("data:image/webp;base64,"):
                self.errors.append("Imagem não incorporada como WebP.")
        if tag == "style":
            self.styles += 1
        if tag == "script":
            self.scripts += 1
            if values.get("src"):
                self.errors.append("JavaScript externo permaneceu na cópia.")
        if tag == "link" and "stylesheet" in (values.get("rel") or "").split():
            self.errors.append("CSS externo permaneceu na cópia.")
        href = values.get("href") or values.get("xlink:href") or ""
        if href.startswith("data:application/json;"):
            self.json_uris.append(href)
        if href and not href.startswith(("#", "data:", "blob:", "http://", "https://", "mailto:", "tel:")):
            self.errors.append("Link relativo permaneceu na cópia.")


def build(canonical: Path, json_file: Path, public_base: str) -> tuple[bytes, dict]:
    if not canonical.is_file():
        raise FileNotFoundError(f"HTML canônico ainda não existe: {canonical}. Nenhum download foi gerado.")
    builder = OfflineBuilder(canonical, json_file, public_base)
    canonical_text = canonical.read_text(encoding="utf-8")
    builder.feed(canonical_text)
    builder.close()
    html = builder.result()
    audit = OfflineAudit()
    audit.feed(html)
    audit.close()
    if audit.errors:
        raise ValueError("Falha na verificação offline: " + " ".join(audit.errors))
    if audit.entries != builder.entries or len(audit.json_uris) != builder.json_downloads:
        raise ValueError("Fichas ou downloads foram alterados na transformação.")
    for uri in audit.json_uris:
        if base64.b64decode(uri.split(",", 1)[1]) != builder.json_bytes:
            raise ValueError("O JSON incorporado difere da fonte canônica.")
    result = html.encode("utf-8")
    report = {
        "registros": len(audit.entries),
        "imagens_webp_embutidas": audit.images,
        "folhas_css_embutidas": builder.stylesheets,
        "scripts_embutidos": len(builder.scripts),
        "json_offline": len(audit.json_uris),
        "bytes": len(result),
        "sha256": hashlib.sha256(result).hexdigest(),
    }
    return result, report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=CATALOG_ROOT / "index.html", help="HTML canônico já compilado.")
    parser.add_argument("--data", type=Path, default=CATALOG_ROOT / "data" / "catalogo.json", help="JSON canônico a incorporar.")
    parser.add_argument("--output", type=Path, default=CATALOG_ROOT / "downloads" / DOWNLOAD_NAME, help="Arquivo HTML autocontido.")
    parser.add_argument("--base-url", default=PUBLIC_BASE, help="Base pública para links externos ao documento.")
    parser.add_argument("--check", action="store_true", help="Gera e verifica em memória sem gravar arquivos.")
    args = parser.parse_args()
    try:
        content, report = build(args.input, args.data, args.base_url)
    except (OSError, ValueError, TypeError) as exc:
        raise SystemExit(f"Não foi possível gerar a cópia offline: {exc}") from exc
    if args.check:
        report["resultado"] = "validado em memória; nenhum arquivo gravado"
    elif args.output.is_file() and args.output.read_bytes() == content:
        report["resultado"] = "sem alterações; arquivo já corresponde ao canônico"
        report["arquivo"] = str(args.output)
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(content)
        report["resultado"] = "cópia autocontida gerada"
        report["arquivo"] = str(args.output)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
