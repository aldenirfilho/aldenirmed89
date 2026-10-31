#!/usr/bin/env python3
"""Importa somente leituras publicadas e confere cada trecho no blog público."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BLOG = "https://biblia-crista-guerreiros-de-fe.aldenirmed.chatgpt.site"
OUTPUT = ROOT / "radar-biblico-3min/daily-messages.js"
SECTIONS = {
    "context": "🔎 Contexto e limite da aplicação",
    "action": "🌱 Uma ação possível",
    "question": "🧭 Pergunta para reflexão",
    "care": "Cuidado ao usar esta mensagem",
}


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def normalize(value):
    return " ".join(value.split())


def get_public(path):
    request = Request(BLOG + path, headers={"User-Agent": "AldenirMed89-Radar/1.0"})
    with urlopen(request, timeout=30) as response:
        if not response.url.startswith(BLOG + "/"):
            raise ValueError("Redirecionamento fora do blog público")
        content = response.read(2_000_001)
        if len(content) > 2_000_000:
            raise ValueError("Página excede o limite da importação")
        return content


def collect(source, public, verified_on):
    source = source.resolve()
    catalog = json.loads((source / "dados/catalogo.json").read_text())
    if catalog["versao"] != public["versao"]:
        raise ValueError("O catálogo local difere da versão publicada")
    entries = []
    for item in catalog["mensagens"]:
        if item.get("status") != "publicado":
            continue
        path = (source / item["arquivo"]).resolve()
        if not path.is_relative_to(source / "mensagens") or path.suffix != ".md":
            raise ValueError("Mensagem fora da pasta autorizada")
        if not re.fullmatch(r"GF-\d{3}", item["id"]):
            raise ValueError("Identificador inválido")
        route = "leituras/" + path.stem + ".html"
        if route not in public["rotas"]:
            raise ValueError("Leitura ausente da publicação: " + route)
        verse = item["versiculo"]
        parsed = urlsplit(verse["fonte"])
        if parsed.scheme != "https" or parsed.netloc != "www.gutenberg.org":
            raise ValueError("Fonte bíblica fora do domínio aprovado")
        parts = re.split(r"^## (.+)$", path.read_text(), flags=re.MULTILINE)
        sections = dict(zip(parts[1::2], parts[2::2]))
        entry = {
            "id": item["id"], "title": item["titulo"],
            "summary": item["essencial"], "situation": item["situacao"],
            "virtues": item["virtudes"], "reference": verse["referencia"],
            "verse": verse["texto"], "edition": verse["edicao"],
            "sourceUrl": verse["fonte"], "readingUnit": item["unidade_de_leitura"],
            "blogUrl": BLOG + "/" + route,
            "textCheckedOn": item["conferencia_citacao_em"],
            "theologicalReview": item["revisao_teologica_independente"],
        }
        for key, section in SECTIONS.items():
            entry[key] = normalize(sections[section].replace("**", "").strip())
        raw = get_public("/" + route)
        text = Text()
        text.feed(raw.decode("utf-8"))
        public_text = normalize(" ".join(text.parts))
        for key in ("title", "summary", "verse", *SECTIONS):
            if not entry[key] or normalize(entry[key]) not in public_text:
                raise ValueError(f"{entry['id']}: trecho {key} não corresponde ao blog publicado")
        entry["publicPageSha256"] = hashlib.sha256(raw).hexdigest()
        entries.append(entry)
    if len(entries) != public["mensagens"] or len({m["id"] for m in entries}) != len(entries):
        raise ValueError("Inventário público divergente ou identificadores repetidos")
    return {
        "schemaVersion": "radar-daily-v1", "blogName": catalog["projeto"],
        "blogUrl": BLOG, "sourceVersion": public["versao"],
        "verifiedOn": verified_on, "timeZone": "America/Fortaleza",
        "selection": "calendar-day-modulo-sorted-id",
        "entries": sorted(entries, key=lambda m: m["id"]),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Checkout do blog, apenas leitura")
    parser.add_argument("--verified-on", required=True, help="Data da conferência, YYYY-MM-DD")
    parser.add_argument("--check", action="store_true", help="Confere sem gravar")
    args = parser.parse_args()
    from datetime import date
    date.fromisoformat(args.verified_on)
    public = json.loads(get_public("/publicacao.json"))
    payload = collect(args.source, public, args.verified_on)
    data = json.dumps(payload, ensure_ascii=False, indent=2)
    for char, replacement in (("<", "\\u003c"), (">", "\\u003e"), ("\u2028", "\\u2028"), ("\u2029", "\\u2029")):
        data = data.replace(char, replacement)
    rendered = "/* Acervo público conferido; gerar com scripts_admin/sync_radar_daily.py. */\n" + \
        "(function(root){const data = " + data + ";\n" + \
        "if(typeof module==='object'&&module.exports)module.exports=data;else root.RadarDailyMessages=data;})(globalThis);\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != rendered:
            raise SystemExit("Acervo do Radar precisa de atualização editorial")
    else:
        OUTPUT.write_text(rendered)
    print(f"{len(payload['entries'])} leituras conferidas na versão pública {public['versao']}; " + ("sem escrita" if args.check else "acervo gerado"))


if __name__ == "__main__":
    main()
