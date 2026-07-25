#!/usr/bin/env python3
"""Valida e publica um post auditado no Portal Vivo Antigravity."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parents[4]
DATA_DIR = ROOT / "17_Portal_Vivo" / "data"
POSTS_PATH = DATA_DIR / "posts.json"
JS_PATH = DATA_DIR / "posts.js"
HISTORY_PATH = DATA_DIR / "publication-history.json"

ALLOWED_TYPES = {
    "evidence-summary",
    "clinical-news",
    "health-policy",
    "study-note",
    "system-upgrade",
}
ALLOWED_REVIEW = {"pending", "confirmed", "not-required"}
TRACKING_KEYS = {"fbclid", "gclid", "mc_cid", "mc_eid", "ref", "source"}
DIRECTIVE_RE = re.compile(
    r"\b(prescreva|administre|infunda|inicie|suspenda|dose\s+de|mg/kg|mcg/kg)\b",
    re.IGNORECASE,
)
PERSONAL_DATA_RE = re.compile(
    r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|"
    r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b",
    re.IGNORECASE,
)


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError(f"Objeto JSON esperado: {path}")
    return payload


def canonical_url(value: str, *, allow_internal: bool = False) -> str:
    value = value.strip()
    if allow_internal and re.fullmatch(r"\.\./[A-Za-z0-9_./-]*/?", value):
        return value
    split = urlsplit(value.strip())
    if split.scheme != "https" or not split.netloc:
        raise ValueError("A fonte externa precisa usar HTTPS.")
    query = [
        (key, item)
        for key, item in parse_qsl(split.query, keep_blank_values=True)
        if not key.lower().startswith("utm_") and key.lower() not in TRACKING_KEYS
    ]
    path = re.sub(r"/+$", "", split.path) or "/"
    return urlunsplit(("https", split.netloc.lower(), path, urlencode(query), ""))


def normalized_text(value: str) -> str:
    folded = unicodedata.normalize("NFKD", value)
    return " ".join(
        "".join(char for char in folded if not unicodedata.combining(char))
        .casefold()
        .split()
    )


def require_text(container: dict, key: str, minimum: int, maximum: int) -> str:
    value = container.get(key)
    if not isinstance(value, str):
        raise ValueError(f"Campo textual obrigatório: {key}")
    value = " ".join(value.split())
    if not minimum <= len(value) <= maximum:
        raise ValueError(f"{key} precisa ter entre {minimum} e {maximum} caracteres.")
    return value


def require_iso(value: object, key: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"Data obrigatória: {key}")
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"Data ISO inválida: {key}") from exc
    return value


def validate_post(raw: dict) -> dict:
    post = json.loads(json.dumps(raw, ensure_ascii=False))
    if post.get("type") not in ALLOWED_TYPES:
        raise ValueError("Tipo de publicação não permitido.")
    if post.get("priority") not in {1, 2, 3}:
        raise ValueError("Prioridade precisa ser 1, 2 ou 3.")

    for key, minimum, maximum in (
        ("category", 3, 60),
        ("title", 12, 140),
        ("summary", 40, 720),
    ):
        post[key] = require_text(post, key, minimum, maximum)
    post["publishedAt"] = require_iso(post.get("publishedAt"), "publishedAt")

    source = post.get("source")
    if not isinstance(source, dict):
        raise ValueError("Bloco source obrigatório.")
    source["name"] = require_text(source, "name", 2, 100)
    source["url"] = canonical_url(
        require_text(source, "url", 3, 1500),
        allow_internal=post["type"] == "system-upgrade",
    )
    require_iso(source.get("date"), "source.date")
    source["checkedAt"] = require_iso(source.get("checkedAt"), "source.checkedAt")

    turbo = post.get("turbo")
    if not isinstance(turbo, dict):
        raise ValueError("Bloco turbo obrigatório.")
    for key, minimum, maximum in (
        ("clinicalImpact", 20, 500),
        ("temiHook", 20, 500),
        ("memoryAnchor", 3, 80),
        ("caveat", 20, 500),
    ):
        turbo[key] = require_text(turbo, key, minimum, maximum)
    takeaways = turbo.get("takeaways")
    if not isinstance(takeaways, list) or not 2 <= len(takeaways) <= 5:
        raise ValueError("turbo.takeaways precisa conter de 2 a 5 itens.")
    turbo["takeaways"] = [
        require_text({"item": item}, "item", 6, 180) for item in takeaways
    ]

    audit = post.get("audit")
    if not isinstance(audit, dict):
        raise ValueError("Bloco audit obrigatório.")
    if audit.get("sourceChecked") is not True:
        raise ValueError("A fonte precisa estar conferida.")
    if audit.get("noDirectPatientData") is not True:
        raise ValueError("A publicação não pode conter dados diretos de paciente.")
    if audit.get("clinicalReview") not in ALLOWED_REVIEW:
        raise ValueError("Status de revisão clínica inválido.")
    audit["reviewedAt"] = require_iso(audit.get("reviewedAt"), "audit.reviewedAt")
    audit["reviewedBy"] = require_text(audit, "reviewedBy", 3, 80)

    public_text = " ".join(
        [
            post["title"],
            post["summary"],
            turbo["clinicalImpact"],
            turbo["temiHook"],
            turbo["memoryAnchor"],
            *turbo["takeaways"],
            turbo["caveat"],
        ]
    )
    if PERSONAL_DATA_RE.search(public_text):
        raise ValueError("Possível dado pessoal encontrado no texto público.")
    if DIRECTIVE_RE.search(public_text) and audit["clinicalReview"] != "confirmed":
        raise ValueError(
            "Texto com dose ou ordem terapêutica exige revisão clínica confirmada."
        )

    digest = hashlib.sha256(source["url"].encode()).hexdigest()[:16]
    date = post["publishedAt"][:10]
    slug = re.sub(r"[^a-z0-9]+", "-", normalized_text(post["title"])).strip("-")[:52]
    post["id"] = post.get("id") or f"{date}-{slug}-{digest[:8]}"
    post["sourceHash"] = f"sha256:{digest}"
    return post


def build_js(payload: dict) -> None:
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    JS_PATH.write_text(
        '"use strict";\n\n// Gerado de data/posts.json; não editar manualmente.\n'
        f"window.ANTIGRAVITY_PORTAL={body};\n",
        encoding="utf-8",
    )


def validate_store(payload: dict, history: dict) -> None:
    posts = payload.get("posts")
    if not isinstance(posts, list):
        raise ValueError("posts.json precisa conter a lista posts.")
    validated = [validate_post(item) for item in posts]
    ids = [item["id"] for item in validated]
    urls = [item["source"]["url"] for item in validated]
    if len(ids) != len(set(ids)):
        raise ValueError("ID duplicado no Portal.")
    if len(urls) != len(set(urls)):
        raise ValueError("Fonte duplicada no Portal.")
    if not set(ids).issubset(set(history.get("publishedIds", []))):
        raise ValueError("Histórico não contém todos os IDs publicados.")


def publish(input_path: Path) -> str:
    payload = load_json(POSTS_PATH)
    history = load_json(HISTORY_PATH)
    post = validate_post(load_json(input_path))
    existing_ids = {item["id"] for item in payload["posts"]}
    existing_urls = {
        canonical_url(
            item["source"]["url"],
            allow_internal=item.get("type") == "system-upgrade",
        )
        for item in payload["posts"]
    }
    history_hashes = set(history.get("sourceHashes", []))
    if post["id"] in existing_ids:
        raise ValueError(f"Publicação já existe: {post['id']}")
    if post["source"]["url"] in existing_urls:
        raise ValueError("A fonte já possui publicação manual no Portal.")
    if post["sourceHash"] in history_hashes:
        raise ValueError("A fonte está no histórico antirrepetição.")

    payload["posts"].insert(0, post)
    payload["updatedAt"] = post["publishedAt"]
    history["publishedIds"].append(post["id"])
    history["sourceHashes"].append(post["sourceHash"])
    history["updatedAt"] = post["publishedAt"]

    POSTS_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    HISTORY_PATH.write_text(
        json.dumps(history, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    build_js(payload)
    return post["id"]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    validate_parser = subparsers.add_parser("validate")
    validate_parser.add_argument("--input", type=Path, required=True)
    publish_parser = subparsers.add_parser("publish")
    publish_parser.add_argument("--input", type=Path, required=True)
    subparsers.add_parser("build-js")
    subparsers.add_parser("check-store")
    args = parser.parse_args()

    try:
        if args.command == "validate":
            post = validate_post(load_json(args.input))
            print(json.dumps({"ok": True, "id": post["id"]}, ensure_ascii=False))
        elif args.command == "publish":
            post_id = publish(args.input)
            print(json.dumps({"ok": True, "publishedId": post_id}, ensure_ascii=False))
        elif args.command == "build-js":
            build_js(load_json(POSTS_PATH))
            print(json.dumps({"ok": True, "output": str(JS_PATH)}, ensure_ascii=False))
        else:
            validate_store(load_json(POSTS_PATH), load_json(HISTORY_PATH))
            print(json.dumps({"ok": True, "store": str(POSTS_PATH)}, ensure_ascii=False))
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    sys.exit(main())
