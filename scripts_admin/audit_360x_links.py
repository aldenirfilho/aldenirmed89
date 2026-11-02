#!/usr/bin/env python3
"""Audit the public 360X directory with anonymous GETs, without editing it.

Usage: python3 scripts_admin/audit_360x_links.py --output /tmp/links-360x.json
Only the Python standard library is required. Network failures and access
challenges remain inconclusive; the report never marks them as broken links.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import ipaddress
import json
from pathlib import Path
import re
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

MAX_BYTES = 2 * 1024 * 1024


def public_https(url):
    """Reject malformed URLs, credentials and obvious local network targets."""
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        return False
    if parsed.hostname.lower() == "localhost" or parsed.hostname.endswith((".local", ".localhost")):
        return False
    try:
        return ipaddress.ip_address(parsed.hostname).is_global
    except ValueError:
        return "." in parsed.hostname


class Redirects(HTTPRedirectHandler):
    def __init__(self):
        super().__init__()
        self.chain = []

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.chain.append({"from": req.full_url, "to": newurl, "status": code})
        if not public_https(newurl):
            raise ValueError("Redirect to a non-public or non-HTTPS URL")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.in_head = False
        self.title_parts = []
        self.text_parts = []
        self.skip = 0
        self.has_password = False
        self.refresh_url = None
        self.canonical_url = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.in_head = True
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "title" and self.in_head:
            self.in_title = True
        if tag == "input" and attrs.get("type", "").lower() == "password":
            self.has_password = True
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
            match = re.search(r"(?:^|;)\s*url\s*=\s*[\"']?([^\"']+)", attrs.get("content", ""), re.I)
            if match:
                self.refresh_url = match.group(1).strip()
        if tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonical_url = attrs.get("href")

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
        if tag == "title":
            self.in_title = False
        if tag == "head":
            self.in_head = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if not self.skip:
            self.text_parts.append(data)


def classify(status, content_type, title, visible, has_password=False):
    """Conservative HTTP/content classification; this is not browser QA."""
    title_lower = title.lower()
    challenge = re.search(
        r"just a moment|attention required|checking your browser|verify you are human|"
        r"verificando.{0,20}navegador|security checkpoint|vercel security|"
        r"enable javascript and cookies to continue|performing security verification",
        title_lower + " " + visible[:10000].lower(),
    )
    if challenge:
        return "access-challenge"
    login = re.search(r"^(sign in|log in|login|entrar|iniciar sess[aã]o)(\b|\s*[|·—-])", title_lower)
    if status in (401, 403) or login or has_password:
        return "access-restricted"
    if status in (404, 410):
        return "not-found"
    if status < 200 or status >= 400:
        return "http-error"
    if "html" not in content_type.lower():
        return "unexpected-content"
    if not title and len(visible.strip()) < 40:
        return "inconclusive-content"
    return "http-ok"


def audit_one(project, timeout=25, retries=1):
    url = project["url"]
    result = {"id": project["id"], "url": url, "checkedAt": datetime.now(timezone.utc).isoformat(), "authentication": "none", "method": "GET"}
    if not public_https(url):
        result.update(outcome="invalid-url", error="Expected public HTTPS URL without credentials")
        return result
    attempts = []
    for attempt in range(retries + 1):
        redirects = Redirects()
        opener = build_opener(redirects)
        # No cookies, account tokens, Authorization headers or browser state.
        request = Request(url, headers={"User-Agent": "360X-LinkAudit/1.0 (anonymous availability check)", "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1"})
        started = time.monotonic()
        response = None
        try:
            try:
                response = opener.open(request, timeout=timeout)
            except HTTPError as error:
                response = error
            with response:
                body = response.read(MAX_BYTES + 1)
                content_type = response.headers.get("Content-Type", "")
                charset = response.headers.get_content_charset() or "utf-8"
                sample = body[:MAX_BYTES]
                page = PageText()
                try:
                    page.feed(sample.decode(charset, errors="replace"))
                except (LookupError, ValueError):
                    page.feed(sample.decode("utf-8", errors="replace"))
                title = " ".join("".join(page.title_parts).split())[:300]
                visible = " ".join(" ".join(page.text_parts).split())
                status = response.code
                current = {"outcome": classify(status, content_type, title, visible, page.has_password), "httpStatus": status, "finalURL": response.geturl(), "redirects": redirects.chain, "contentType": content_type, "title": title, "sampleSHA256": hashlib.sha256(sample).hexdigest(), "sampleBytes": len(sample), "truncated": len(body) > MAX_BYTES, "durationSeconds": round(time.monotonic() - started, 3)}
                if page.canonical_url:
                    current["canonicalURL"] = urljoin(response.geturl(), page.canonical_url)
                if page.refresh_url:
                    current["htmlRedirectURL"] = urljoin(response.geturl(), page.refresh_url)
                    if current["outcome"] == "http-ok":
                        current["outcome"] = "html-redirect" if public_https(current["htmlRedirectURL"]) else "invalid-html-redirect"
        except (URLError, TimeoutError, OSError, ValueError) as error:
            current = {"outcome": "network-error", "error": str(error)[:500], "redirects": redirects.chain, "durationSeconds": round(time.monotonic() - started, 3)}
        attempts.append(current)
        transient = current["outcome"] == "network-error" or current.get("httpStatus", 0) in (408, 425, 429, 500, 502, 503, 504)
        if not transient or attempt >= retries:
            break
        time.sleep(0.5)
    result.update(attempts[-1], attempts=attempts)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=Path(__file__).resolve().parents[1] / "ecossistema/data/sites-360x.json")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--timeout", type=float, default=25)
    parser.add_argument("--retries", type=int, default=1)
    args = parser.parse_args()
    if not 1 <= args.workers <= 12 or args.timeout <= 0 or not 0 <= args.retries <= 3:
        parser.error("workers must be 1..12, timeout positive and retries 0..3")
    source = args.catalog.read_bytes()
    projects = json.loads(source)["projects"]
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        records = list(pool.map(lambda project: audit_one(project, args.timeout, args.retries), projects))
    counts = {}
    for record in records:
        counts[record["outcome"]] = counts.get(record["outcome"], 0) + 1
    report = {"schemaVersion": 1, "checkedAt": datetime.now(timezone.utc).isoformat(), "catalogSHA256": hashlib.sha256(source).hexdigest(), "scope": "Anonymous HTTP GET snapshot of documented project URLs. HTTP success does not certify browser functionality, clinical quality or lasting availability. Access challenges and network errors are inconclusive, not proof of a broken destination.", "counts": counts, "projects": records}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "total": len(records), "counts": counts}, ensure_ascii=False))


if __name__ == "__main__":
    main()
