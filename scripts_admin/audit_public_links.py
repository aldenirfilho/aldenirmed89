#!/usr/bin/env python3
"""Audita referências HTML/CSS no artefato público, sem rede nem escrita.

Uso: python3 scripts_admin/audit_public_links.py site > auditoria.json
Fragmentos sem alvo estático são avisos: alguns módulos os criam por JavaScript.
"""
import json
import hashlib
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.refs, self.ids, self.images_missing_alt = [], [], 0
        self.title, self.has_lang = False, False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.append(a['id'])
        if tag == 'title':
            self.title = True
        if tag == 'html':
            self.has_lang = bool(a.get('lang'))
        if tag == 'img' and 'alt' not in a:
            self.images_missing_alt += 1
        for key in ('href', 'src', 'poster'):
            if a.get(key) and (key != 'href' or tag in ('a', 'link')):
                self.refs.append((tag, a[key]))


def audit(root):
    root = Path(root).resolve()
    pages = {p: Page(p.read_text(encoding='utf-8', errors='replace')) for p in sorted(root.rglob('*.html'))}
    issues, fragments, accessibility = [], [], []
    checked, external = 0, set()

    def check(source, tag, value):
        nonlocal checked
        u = urlsplit(value)
        if u.scheme or u.netloc:
            if u.scheme in ('http', 'https'):
                external.add(value)
            return
        path = unquote(u.path)
        if not path:
            target = source
        elif path.startswith('/aldenirmed89/'):
            target = root / path.removeprefix('/aldenirmed89/')
        elif path.startswith('/'):
            target = root / path.lstrip('/')
        else:
            target = source.parent / path
        target = target.resolve()
        if target.is_dir():
            target /= 'index.html'
        checked += 1
        item = {'source':source.relative_to(root).as_posix(), 'tag':tag, 'url':value}
        if not target.is_relative_to(root) or not target.is_file():
            issues.append(item)
        elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:
            fragments.append(item)

    for path, page in pages.items():
        for tag, value in page.refs:
            check(path, tag, value)
        duplicate = [key for key, count in Counter(page.ids).items() if count > 1]
        if duplicate or not page.has_lang or not page.title or page.images_missing_alt:
            accessibility.append({'source':path.relative_to(root).as_posix(), 'duplicateIds':duplicate,
                                  'missingLanguage':not page.has_lang,'missingTitle':not page.title,
                                  'imagesWithoutAlt':page.images_missing_alt})
    for path in sorted(root.rglob('*.css')):
        for value in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)', path.read_text(errors='replace')):
            if value.startswith('#'):
                continue
            check(path, 'css-url', value.strip())
    preview_errors, previews_checked = [], 0
    preview_index = root / '02_Biblioteca_IA_Engine/data/biblioteca_previews.json'
    if preview_index.is_file():
        for entry in json.loads(preview_index.read_text(encoding='utf-8')).get('items', []):
            if entry.get('status') != 'ready':
                continue
            preview_path = str(entry.get('previewPath') or '')
            expected = str(entry.get('previewSha256') or '')
            if not re.fullmatch(r'previews/(?:docx|pdf|pages)-[0-9a-f]{20}\.html', preview_path) or not re.fullmatch(r'[0-9a-f]{64}', expected):
                preview_errors.append({'documentId':entry.get('documentId'), 'error':'invalid-preview-identity'})
                continue
            path = root / '02_Biblioteca_IA_Engine' / preview_path
            previews_checked += 1
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
                preview_errors.append({'documentId':entry.get('documentId'), 'path':preview_path, 'error':'published-preview-hash-mismatch'})
    return {'htmlPages':len(pages), 'checkedLocalReferences':checked,
            'externalUrlsListedNotCrawled':len(external), 'brokenLocalReferences':issues,
            'previewsCheckedBySha256':previews_checked, 'previewIntegrityErrors':preview_errors,
            'fragmentsNeedingRuntimeCheck':fragments, 'accessibilityFindings':accessibility}


if __name__ == '__main__':
    result = audit(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(bool(result['brokenLocalReferences'] or result['previewIntegrityErrors']))
