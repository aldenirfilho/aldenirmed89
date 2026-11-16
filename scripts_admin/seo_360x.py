#!/usr/bin/env python3
"""Motor de Busca 360X: metadados de descoberta aplicados ao artefato público.

Roda dentro de ``build_public_site.py`` e só altera a cópia em ``site/``; o
repositório (conteúdo clínico, ``index.html`` etc.) não é reescrito.

Duas etapas:

``apply_page_seo``
    Em cada HTML público que ainda não tenha o marcador, completa o que falta:
    meta description, robots com prévia grande de imagem, Open Graph/Twitter,
    hreflang, link do feed do Jornal, verificação dos buscadores (só na home) e
    um bloco JSON-LD (WebSite/Organization/Person na home; WebPage ou subtipo +
    BreadcrumbList nas demais; Periodical no Jornal). Nada que a página já
    declare é substituído. Componentes e páginas offline recebem ``noindex``.
    Deve rodar antes do sitemap, que descarta páginas ``noindex``.

``write_discovery_extras``
    Depois do sitemap: ``sitemap-jornal-360.xml`` (página e PDFs com a data de
    cada edição), ``sitemap_index.xml``, feed RSS do Jornal, ``llms.txt`` e o
    arquivo-chave do IndexNow.

Fatos apenas: nenhuma credencial profissional é afirmada nos dados
estruturados (alegações profissionais exigem registro no gate editorial), e
``dateModified`` só é declarado quando o histórico git completo existe.
"""

from __future__ import annotations

import html as html_lib
import json
import re
import subprocess
from datetime import date, datetime, timezone
from email.utils import format_datetime
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Callable
from urllib.parse import quote, urljoin
from xml.sax.saxutils import escape as xml_escape

try:
    from editorial_gate import infer_medical
except ModuleNotFoundError:  # import via unittest/importlib a partir da raiz
    from scripts_admin.editorial_gate import infer_medical

CONFIG_RELATIVE = Path("scripts_admin/seo_360x_config.json")
SEO_MARKER = "seo-360x:v1"
PREVIEWS_PREFIX = "02_Biblioteca_IA_Engine/previews/"
INDEXNOW_KEY_RE = re.compile(r"^[A-Za-z0-9-]{8,128}$")
DESCRIPTION_LIMIT = 158


# ── utilidades ──────────────────────────────────────────────────────────────


def load_config(root: Path) -> dict:
    config = json.loads((root / CONFIG_RELATIVE).read_text(encoding="utf-8"))
    if config.get("schemaVersion") != "seo-360x-v1":
        raise ValueError("Configuração SEO 360X com schemaVersion inválida.")
    key = config.get("indexnow", {}).get("key", "")
    if key and not INDEXNOW_KEY_RE.match(key):
        raise ValueError("Chave IndexNow inválida (8–128 caracteres alfanuméricos ou hífen).")
    return config


def clean_text(value: str) -> str:
    value = re.sub(r"(?is)<(script|style|noscript|template)\b.*?</\1\s*>", " ", value)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html_lib.unescape(value)).strip()


def truncate(text: str, limit: int = DESCRIPTION_LIMIT) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    cut = text[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:—-")
    return cut + "…"


def attr(value: str) -> str:
    return html_lib.escape(value, quote=True)


def json_ld(graph: list[dict]) -> str:
    payload = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    # "</" dentro de JSON encerraria o <script>; a barra escapada é JSON válido.
    return '<script type="application/ld+json">' + payload.replace("</", "<\\/") + "</script>"


class HeadInfo(HTMLParser):
    """Lê só o que importa no <head>: título, metas, canonical, JSON-LD."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self.meta_names: dict[str, str] = {}
        self.meta_props: dict[str, str] = {}
        self.canonical = ""
        self.refresh = False
        self.has_json_ld = False
        self.has_feed = False
        self.hreflang = False
        self.lang = ""

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "html":
            self.lang = a.get("lang", "")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            if a.get("http-equiv", "").casefold() == "refresh":
                self.refresh = True
            if a.get("name"):
                self.meta_names[a["name"].casefold()] = a.get("content", "")
            if a.get("property"):
                self.meta_props[a["property"].casefold()] = a.get("content", "")
        elif tag == "link":
            rel = a.get("rel", "").casefold().split()
            if "canonical" in rel and not self.canonical:
                self.canonical = a.get("href", "")
            if "alternate" in rel and "rss" in a.get("type", ""):
                self.has_feed = True
            if "alternate" in rel and a.get("hreflang"):
                self.hreflang = True
        elif tag == "script" and a.get("type", "").casefold() == "application/ld+json":
            self.has_json_ld = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def first_paragraph(document: str) -> str:
    body = document.split("<body", 1)[-1]
    body = re.sub(r"(?is)<(script|style|noscript|template|nav|header|footer)\b.*?</\1\s*>", " ", body)
    for match in re.finditer(r"(?is)<p\b[^>]*>(.*?)</p\s*>", body):
        text = clean_text(match.group(1))
        if len(text) >= 60 and "pular para" not in text.casefold():
            return text
    return ""


def section_for(relative: str, config: dict) -> dict:
    best: dict = {}
    for section in config.get("sections", []):
        if relative.startswith(section["prefix"]) and len(section["prefix"]) > len(best.get("prefix", "")):
            best = section
    return best


def git_dates(root: Path) -> Callable[[str], str | None]:
    """Data do último commit por arquivo, só com histórico completo (CI usa fetch-depth 0)."""
    try:
        shallow = subprocess.run(
            ["git", "-C", str(root), "rev-parse", "--is-shallow-repository"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return lambda _relative: None
    if shallow != "false":
        return lambda _relative: None

    cache: dict[str, str | None] = {}

    def lookup(relative: str) -> str | None:
        if relative not in cache:
            try:
                value = subprocess.run(
                    ["git", "-C", str(root), "log", "-1", "--format=%cs", "--", relative],
                    capture_output=True, text=True, check=True,
                ).stdout.strip()
            except (OSError, subprocess.CalledProcessError):
                value = ""
            cache[relative] = value if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value) else None
        return cache[relative]

    return lookup


# ── etapa 1: metadados por página ───────────────────────────────────────────


def identity_graph(config: dict, base_url: str, complexo_urls: list[str]) -> list[dict]:
    organization = {
        "@type": "Organization",
        "@id": base_url + "#projeto-360x",
        "name": config["publisherName"],
        "alternateName": ["Complexo 360X", "Equipe 360X", "Plano D"],
        "url": base_url + config["complexoPath"],
        "logo": {"@type": "ImageObject", "url": base_url + config["logoPath"], "width": 512, "height": 512},
        "founder": {"@id": base_url + "#idealizador"},
    }
    if complexo_urls:
        organization["sameAs"] = complexo_urls
    person = {
        "@type": "Person",
        "@id": base_url + "#idealizador",
        "name": config["authorName"],
        "url": base_url + config["authorPath"],
    }
    if config.get("authorSameAs"):
        person["sameAs"] = config["authorSameAs"]
    website = {
        "@type": "WebSite",
        "@id": base_url + "#website",
        "url": base_url,
        "name": config["siteName"],
        "alternateName": config.get("alternateNames", []),
        "description": config["siteDescription"],
        "inLanguage": "pt-BR",
        "publisher": {"@id": base_url + "#projeto-360x"},
    }
    return [website, organization, person]


def jornal_graph(root: Path, config: dict, base_url: str, page_url: str) -> list[dict]:
    jornal = config.get("jornal") or {}
    data_path = root / jornal.get("data", "")
    if not jornal or not data_path.is_file():
        return []
    data = json.loads(data_path.read_text(encoding="utf-8"))
    issues = []
    for edition in data.get("edicoes", []):
        filename = (edition.get("arquivos") or {}).get("jornal")
        if not filename:
            continue
        issue = {
            "@type": "PublicationIssue",
            "issueNumber": str(edition.get("numero", "")),
            "datePublished": edition.get("data"),
            "name": f"{jornal['name']} nº {int(edition.get('numero', 0)):03d} — {edition.get('temaDoDia', '')}".rstrip(" —"),
            "url": base_url + jornal["pdfFolder"] + quote(filename),
            "isPartOf": {"@id": page_url + "#periodico"},
        }
        issues.append(issue)
    return [
        {
            "@type": "Periodical",
            "@id": page_url + "#periodico",
            "name": jornal["name"],
            "description": jornal["description"],
            "inLanguage": "pt-BR",
            "url": page_url,
            "publisher": {"@id": base_url + "#projeto-360x"},
            "hasPart": issues,
        }
    ]


def breadcrumb(site: Path, relative: PurePosixPath, url: str, name: str, base_url: str,
               canonical_for: Callable[[PurePosixPath], str], config: dict) -> dict:
    items = [{"@type": "ListItem", "position": 1, "name": config["siteName"], "item": base_url}]
    parts = relative.parts[:-1]
    for depth in range(1, len(parts) + 1):
        folder = PurePosixPath(*parts[:depth])
        index = folder / "index.html"
        crumb_url = canonical_for(index)
        if crumb_url == url or not (site / index).is_file():
            continue
        if depth == 1:
            label = section_for(folder.as_posix() + "/", config).get("label") or parts[0].replace("_", " ")
        else:
            label = parts[depth - 1].replace("_", " ").replace("-", " ")
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": label, "item": crumb_url})
    if url != base_url:
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": name, "item": url})
    return {"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": items}


def apply_page_seo(
    root: Path,
    site: Path,
    *,
    base_url: str,
    canonical_for: Callable[[PurePosixPath], str],
    closing_tag: Callable[[str, str], int | None],
    exclusions: frozenset[str] = frozenset(),
) -> dict[str, int]:
    config = load_config(root)
    complexo_urls = complexo_site_urls(root, config)
    modified = git_dates(root)
    jornal_path = (config.get("jornal") or {}).get("path", "jornal-360/")
    feed_url = base_url + (config.get("jornal") or {}).get("feedPath", "jornal-360/feed.xml")
    hreflang_pages: dict[str, dict[str, str]] = {}
    for pair in config.get("hreflangPairs", []):
        for path in pair.values():
            hreflang_pages[path] = pair
    stats = {"pages": 0, "jsonld": 0, "descriptions": 0, "noindex": 0, "opengraph": 0}

    for html_path in sorted(site.rglob("*.html")):
        relative = PurePosixPath(html_path.relative_to(site).as_posix())
        rel = relative.as_posix()
        if rel in exclusions or rel.startswith(PREVIEWS_PREFIX) or rel == "404.html":
            continue
        document = html_path.read_text(encoding="utf-8")
        if SEO_MARKER in document:
            continue
        closing = closing_tag(document, "head")
        if closing is None:
            continue
        info = HeadInfo()
        info.feed(document[:closing])
        if info.refresh:
            continue

        own_url = canonical_for(relative)
        canonical = urljoin(own_url, info.canonical) if info.canonical else own_url
        if canonical.endswith("/index.html"):
            canonical = canonical[: -len("index.html")]
        if canonical != own_url:
            continue  # alias de outra página: metadados ficam com a canônica

        lines = [f"<!-- {SEO_MARKER} -->"]
        robots = info.meta_names.get("robots", "") + " " + info.meta_names.get("googlebot", "")
        fragment = any(pattern in "/" + rel for pattern in config.get("noindexPatterns", []))
        if not robots.strip():
            if fragment:
                lines.append('<meta name="robots" content="noindex,follow">')
                stats["noindex"] += 1
            else:
                lines.append(
                    '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">'
                )
        indexable = not fragment and not re.search(r"noindex|none", robots, re.I)

        section = section_for(rel, config)
        title = clean_text(info.title) or clean_text(info.meta_props.get("og:title", "")) or config["siteName"]
        description = clean_text(info.meta_names.get("description", ""))
        if not description:
            description = truncate(first_paragraph(document) or f"{title}. {section.get('fallback', config['siteDescription'])}")
            # O motor nunca muda a classificação editorial da página: se o texto
            # derivado a tornaria "médica" no gate, usa-se uma descrição neutra.
            if not infer_medical(document) and infer_medical(document + " " + description):
                description = f"{title} · {config['siteName']}"
            lines.append(f'<meta name="description" content="{attr(description)}">')
            stats["descriptions"] += 1

        english = info.lang.casefold().startswith("en")
        og = {
            "og:type": "website" if rel in {"index.html", "en/index.html"} else "article",
            "og:site_name": config["siteName"],
            "og:locale": "en_US" if english else "pt_BR",
            "og:title": title,
            "og:description": truncate(description, 200),
            "og:url": own_url,
            "og:image": base_url + config["socialImagePath"],
        }
        added_og = False
        for prop, value in og.items():
            if prop not in info.meta_props:
                lines.append(f'<meta property="{prop}" content="{attr(value)}">')
                added_og = True
        if "twitter:card" not in info.meta_names:
            lines.append('<meta name="twitter:card" content="summary_large_image">')
        stats["opengraph"] += int(added_og)

        if rel in hreflang_pages and not info.hreflang:
            for language, path in hreflang_pages[rel].items():
                lines.append(
                    f'<link rel="alternate" hreflang="{attr(language)}" href="{attr(canonical_for(PurePosixPath(path)))}">'
                )
        if (rel in {"index.html", "complexo-360x/index.html"} or rel.startswith(jornal_path)) and not info.has_feed:
            lines.append(
                f'<link rel="alternate" type="application/rss+xml" title="{attr((config.get("jornal") or {}).get("name", "Feed"))}" href="{attr(feed_url)}">'
            )
        if rel == "index.html":
            for name, token in (config.get("verification") or {}).items():
                if token and name not in info.meta_names:
                    lines.append(f'<meta name="{attr(name)}" content="{attr(token)}">')

        if indexable and not info.has_json_ld:
            graph: list[dict] = []
            page = {
                "@type": section.get("type", "WebPage") if rel != "index.html" else "WebPage",
                "@id": own_url + "#webpage",
                "url": own_url,
                "name": title,
                "description": description,
                "inLanguage": "en" if english else "pt-BR",
                "isPartOf": {"@id": base_url + "#website"},
                "publisher": {"@id": base_url + "#projeto-360x"},
                "author": {"@id": base_url + "#idealizador"},
                "primaryImageOfPage": {"@type": "ImageObject", "url": og["og:image"] if "og:image" not in info.meta_props else info.meta_props["og:image"]},
            }
            last = modified(rel)  # a allowlist copia cada HTML no mesmo caminho do repositório
            if last:
                page["dateModified"] = last
            if page["@type"] == "MedicalWebPage":
                page["audience"] = {"@type": "MedicalAudience", "audienceType": "Clinician"}
            if page["@type"] == "ProfilePage":
                page["mainEntity"] = {"@id": base_url + "#idealizador"}
            if rel == "index.html":
                graph.extend(identity_graph(config, base_url, complexo_urls))
            else:
                page["breadcrumb"] = {"@id": own_url + "#breadcrumb"}
                graph.append(breadcrumb(site, relative, own_url, title, base_url, canonical_for, config))
            if rel == jornal_path + "index.html":
                graph.extend(jornal_graph(root, config, base_url, own_url))
                page["mainEntity"] = {"@id": own_url + "#periodico"}
            graph.insert(0, page)
            lines.append(json_ld(graph))
            stats["jsonld"] += 1

        document = document[:closing] + "\n".join(lines) + "\n" + document[closing:]
        html_path.write_text(document, encoding="utf-8")
        stats["pages"] += 1
    return stats


def complexo_site_urls(root: Path, config: dict) -> list[str]:
    path = root / config.get("complexoData", "")
    if not path.is_file():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    urls = [entry["url"] for entry in [*data.get("sites", []), *data.get("constelacoes", [])] if not entry.get("interno")]
    return sorted(dict.fromkeys(urls))


# ── etapa 2: arquivos de descoberta ─────────────────────────────────────────


def sitemap_urls(site: Path, name: str = "sitemap.xml") -> list[str]:
    path = site / name
    if not path.is_file():
        return []
    return re.findall(r"<loc>([^<]+)</loc>", path.read_text(encoding="utf-8"))


def page_titles(site: Path, urls: list[str], base_url: str) -> dict[str, str]:
    from urllib.parse import unquote

    titles = {}
    for url in urls:
        relative = unquote(url.removeprefix(base_url))
        path = site / (relative + "index.html" if not relative or relative.endswith("/") else relative)
        if not path.is_file():
            continue
        match = re.search(r"<title\b[^>]*>(.*?)</title\s*>", path.read_text(encoding="utf-8"), re.I | re.S)
        titles[url] = clean_text(match.group(1)) if match else relative
    return titles


def write_discovery_extras(root: Path, site: Path, *, base_url: str) -> dict[str, int]:
    config = load_config(root)
    jornal = config.get("jornal") or {}
    stats = {"jornalUrls": 0, "feedItems": 0, "llmsLinks": 0, "indexnow": 0}
    sitemaps = [("sitemap.xml", None)]

    data_path = root / jornal.get("data", "")
    editions = []
    if jornal and data_path.is_file():
        editions = json.loads(data_path.read_text(encoding="utf-8")).get("edicoes", [])
    jornal_url = base_url + jornal.get("path", "jornal-360/")
    if editions and (site / jornal["path"] / "index.html").is_file():
        latest = max(edition["data"] for edition in editions)
        entries = [(jornal_url, latest)]
        for edition in editions:
            for filename in (edition.get("arquivos") or {}).values():
                if filename and (site / jornal["pdfFolder"] / filename).is_file():
                    entries.append((base_url + jornal["pdfFolder"] + quote(filename), edition["data"]))
        body = "\n".join(
            f"  <url>\n    <loc>{xml_escape(url)}</loc>\n    <lastmod>{day}</lastmod>\n  </url>" for url, day in entries
        )
        (site / "sitemap-jornal-360.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n",
            encoding="utf-8",
        )
        sitemaps.append(("sitemap-jornal-360.xml", latest))
        stats["jornalUrls"] = len(entries)
        stats["feedItems"] = write_jornal_feed(site, jornal, editions, base_url)

    index_body = "\n".join(
        f"  <sitemap>\n    <loc>{xml_escape(base_url + name)}</loc>\n"
        + (f"    <lastmod>{day}</lastmod>\n" if day else "")
        + "  </sitemap>"
        for name, day in sitemaps
        if (site / name).is_file()
    )
    (site / "sitemap_index.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + index_body + "\n</sitemapindex>\n",
        encoding="utf-8",
    )
    robots = site / "robots.txt"
    if robots.is_file():
        text = robots.read_text(encoding="utf-8").rstrip("\n") + "\n"
        for name, _day in sitemaps[1:] + [("sitemap_index.xml", None)]:
            line = f"Sitemap: {base_url}{name}"
            if line not in text:
                text += line + "\n"
        robots.write_text(text, encoding="utf-8")

    stats["llmsLinks"] = write_llms_txt(root, site, config, base_url)
    key = (config.get("indexnow") or {}).get("key", "")
    if key:
        (site / f"{key}.txt").write_text(key, encoding="utf-8")
        stats["indexnow"] = 1
    return stats


def write_jornal_feed(site: Path, jornal: dict, editions: list[dict], base_url: str) -> int:
    page_url = base_url + jornal["path"]
    feed_url = base_url + jornal["feedPath"]
    items = []
    for edition in sorted(editions, key=lambda item: item["data"], reverse=True):
        number = int(edition.get("numero", 0))
        published = datetime.fromisoformat(f"{edition['data']}T{jornal.get('publishHourLocal', '06:00:00-03:00')}")
        title = f"{jornal['name']} nº {number:03d} — {edition['data'][8:10]}/{edition['data'][5:7]}/{edition['data'][:4]}"
        if edition.get("temaDoDia"):
            title += f" · {edition['temaDoDia']}"
        parts = []
        if edition.get("manchetes"):
            parts.append("<p><strong>Manchetes</strong></p><ul>" + "".join(
                f"<li>{html_lib.escape(line)}</li>" for line in edition["manchetes"]) + "</ul>")
        if edition.get("pilulas"):
            parts.append("<p><strong>Pílulas do Dia</strong></p><ul>" + "".join(
                f"<li>{html_lib.escape(axis)}: {html_lib.escape(text)}</li>" for axis, text in edition["pilulas"].items()) + "</ul>")
        if edition.get("correcoes"):
            parts.append("<p><strong>Correções</strong></p><ul>" + "".join(
                f"<li>{html_lib.escape(line)}</li>" for line in edition["correcoes"]) + "</ul>")
        description = "".join(parts) or html_lib.escape(jornal["description"])
        link = f"{page_url}#edicao-{number:03d}"
        enclosure = ""
        pdf = (edition.get("arquivos") or {}).get("jornal")
        pdf_path = site / jornal["pdfFolder"] / pdf if pdf else None
        if pdf_path and pdf_path.is_file():
            enclosure = (
                f'      <enclosure url="{xml_escape(base_url + jornal["pdfFolder"] + quote(pdf))}" '
                f'length="{pdf_path.stat().st_size}" type="application/pdf"/>\n'
            )
        items.append(
            "    <item>\n"
            f"      <title>{xml_escape(title)}</title>\n"
            f"      <link>{xml_escape(link)}</link>\n"
            f'      <guid isPermaLink="false">jornal-diario-360-{number:03d}-{edition["data"]}</guid>\n'
            f"      <pubDate>{format_datetime(published)}</pubDate>\n"
            f"      <description>{xml_escape(description)}</description>\n"
            + enclosure
            + "    </item>"
        )
    latest = max(datetime.fromisoformat(f"{e['data']}T{jornal.get('publishHourLocal', '06:00:00-03:00')}") for e in editions)
    feed = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        f"    <title>{xml_escape(jornal['name'])} · AldenirMed 360X</title>\n"
        f"    <link>{xml_escape(page_url)}</link>\n"
        f'    <atom:link href="{xml_escape(feed_url)}" rel="self" type="application/rss+xml"/>\n'
        f"    <description>{xml_escape(jornal['description'])}</description>\n"
        "    <language>pt-BR</language>\n"
        f"    <lastBuildDate>{format_datetime(latest)}</lastBuildDate>\n"
        + "\n".join(items)
        + "\n  </channel>\n</rss>\n"
    )
    target = site / jornal["feedPath"]
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(feed, encoding="utf-8")
    return len(items)


def write_llms_txt(root: Path, site: Path, config: dict, base_url: str) -> int:
    urls = sitemap_urls(site)
    titles = page_titles(site, urls, base_url)
    lines = [
        f"# {config['siteName']}",
        "",
        f"> {config['siteDescription']}",
        "",
        "Conteúdo educacional em português do Brasil. Não substitui avaliação médica individual nem protocolos institucionais.",
        "",
        "## Complexo 360X",
        "",
        f"- [Complexo 360X — mapa de busca por tema]({base_url}{config['complexoPath']}): medicina, honra, religião, justiça, auditoria, verdades verdadeiras, projetos políticos e ficção com magia.",
    ]
    jornal = config.get("jornal") or {}
    if jornal:
        lines.append(f"- [{jornal['name']}]({base_url}{jornal['path']}): {jornal['description']} Feed RSS: {base_url}{jornal['feedPath']}")
    lines += ["", "## Páginas", ""]
    count = 0
    for url in urls:
        lines.append(f"- [{titles.get(url, url)}]({url})")
        count += 1
    lines += ["", "## Descoberta", "", f"- Sitemap: {base_url}sitemap_index.xml", f"- Mapa do site: {base_url}mapa-do-site.html", ""]
    (site / "llms.txt").write_text("\n".join(lines), encoding="utf-8")
    return count + 2
