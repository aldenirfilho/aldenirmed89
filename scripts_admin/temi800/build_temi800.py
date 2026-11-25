#!/usr/bin/env python3
"""Compila o banco TEMI 800 (fontes em src/*.txt) para questoes/data/qbank_temi_800_2026.js.

Formato-fonte (uma questão):
    #M Subtópico | REF1,REF2          (#M = Médio, #D = Difícil; refs opcionais)
    IMG tipo | ...                    (figura obrigatória)
    S: enunciado
    + alternativa correta :: comentário
    - distrator :: comentário          (quatro linhas)
    K: comentário-chave (síntese)
    R: leitura da imagem (opcional; padrão vem do dicionário)
    P: pérola (opcional)

Uso: python3 scripts_admin/temi800/build_temi800.py [--check] [--allow-partial]
"""
from __future__ import annotations

import json
import random
import re
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from sources import SOURCES  # noqa: E402
from readings import READINGS, CAPTIONS, TEMPLATE_KINDS, DATA_KINDS  # noqa: E402

OUT = ROOT / "questoes/data/qbank_temi_800_2026.js"
LETTERS = "ABCDE"
PER_BLOCK = 40


def slug(text: str) -> str:
    t = unicodedata.normalize("NFKD", text.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


def norm(text: str) -> str:
    return " ".join(slug(text).split("-"))


def kv_items(raw: str) -> list[list[str]]:
    items = []
    for part in raw.split(";"):
        part = part.strip()
        if not part:
            continue
        if "=" not in part:
            items.append([part, ""])
            continue
        k, v = part.split("=", 1)
        items.append([k.strip(), v.strip()])
    return items


def parse_img(raw: str, where: str) -> dict:
    parts = [p.strip() for p in raw.split("|")]
    kind = parts[0]
    if kind in TEMPLATE_KINDS:
        if len(parts) < 2:
            raise ValueError(f"{where}: figura {kind} sem chave")
        key = parts[1]
        if (kind, key) not in READINGS:
            raise ValueError(f"{where}: chave de figura desconhecida {kind}:{key}")
        spec = {"kind": kind, "key": key}
        for extra in parts[2:]:
            if extra.startswith("t="):
                spec["title"] = extra[2:].strip()
            elif extra:
                spec["params"] = dict(kv_items(extra))
        return spec
    if kind in ("mon", "gaso", "vm", "lab"):
        if len(parts) == 2:
            return {"kind": kind, "items": kv_items(parts[1])}
        title = parts[1][2:].strip() if parts[1].startswith("t=") else parts[1]
        return {"kind": kind, "title": title, "items": kv_items(parts[2])}
    if kind == "card":
        return {"kind": kind, "title": parts[1], "lines": [x.strip() for x in parts[2].split(";") if x.strip()]}
    if kind == "trend":
        items = kv_items(parts[2])
        spec = {"kind": kind, "title": parts[1], "points": [], "ref": None}
        for k, v in items:
            if k == "ref":
                spec["ref"] = v
            else:
                spec["points"].append([k, v])
        if spec["ref"] is None:
            del spec["ref"]
        return spec
    raise ValueError(f"{where}: tipo de figura desconhecido {kind!r}")


def alt_text(spec: dict) -> str:
    cap = CAPTIONS[spec["kind"]]
    if spec["kind"] in DATA_KINDS:
        if spec.get("items"):
            detail = "; ".join(f"{k} {v}".strip() for k, v in spec["items"] if k != "ritmo")
        elif spec.get("lines"):
            detail = "; ".join(spec["lines"])
        else:
            detail = "; ".join(f"{x} {y}" for x, y in spec.get("points", []))
        return f"{spec.get('title') or cap}: {detail}"
    return f"{spec.get('title') or cap}. Interpretação descrita no comentário da questão."


def parse_file(path: Path) -> tuple[dict, list[dict]]:
    block = None
    questions: list[dict] = []
    cur: dict | None = None
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        where = f"{path.name}:{n}"
        if not line or line.startswith("//"):
            continue
        if line.startswith("@BLOCO"):
            bid, label, icon, color, refs = [x.strip() for x in line[6:].split("|")]
            block = {"id": bid, "label": label, "icon": icon, "color": color, "defaultRefs": [r.strip() for r in refs.split(",") if r.strip()]}
            continue
        if line.startswith("#M") or line.startswith("#D"):
            if cur:
                questions.append(cur)
            head = [x.strip() for x in line[2:].split("|")]
            cur = {"difficulty": "Médio" if line[1] == "M" else "Difícil", "subtopic": head[0],
                   "refs": [r.strip() for r in head[1].split(",")] if len(head) > 1 and head[1] else list(block["defaultRefs"]),
                   "options": [], "where": where}
            continue
        if cur is None:
            raise ValueError(f"{where}: linha fora de questão: {line[:60]}")
        if line.startswith("IMG "):
            cur["image"] = parse_img(line[4:], where)
        elif line.startswith("S:"):
            cur["stem"] = line[2:].strip()
        elif line[:1] in "+-" and "::" in line:
            text, why = line[1:].split("::", 1)
            cur["options"].append((line[0] == "+", text.strip(), why.strip()))
        elif line.startswith("K:"):
            cur["synthesis"] = line[2:].strip()
        elif line.startswith("R:"):
            cur["reading"] = line[2:].strip()
        elif line.startswith("P:"):
            cur["pearl"] = line[2:].strip()
        else:
            raise ValueError(f"{where}: linha não reconhecida: {line[:80]}")
    if cur:
        questions.append(cur)
    if not block:
        raise ValueError(f"{path.name}: @BLOCO ausente")
    return block, questions


def build(allow_partial: bool = False) -> dict:
    files = sorted((HERE / "src").glob("b*.txt"))
    blocks, out_q = [], []
    seen_stems: set[str] = set()
    for f in files:
        block, qs = parse_file(f)
        if not allow_partial and len(qs) != PER_BLOCK:
            raise ValueError(f"{f.name}: {len(qs)} questões (esperado {PER_BLOCK})")
        rnd = random.Random("temi800:" + block["id"])
        slots = [i % 5 for i in range(len(qs))]
        rnd.shuffle(slots)
        blocks.append({k: block[k] for k in ("id", "label", "icon", "color")})
        for i, q in enumerate(qs):
            w = q["where"]
            for key in ("stem", "synthesis", "image"):
                if key not in q:
                    raise ValueError(f"{w}: campo {key} ausente")
            opts = q["options"]
            if len(opts) != 5 or sum(1 for o in opts if o[0]) != 1:
                raise ValueError(f"{w}: precisa de 1 correta + 4 distratores (tem {len(opts)})")
            for ref in q["refs"]:
                if ref not in SOURCES:
                    raise ValueError(f"{w}: fonte desconhecida {ref}")
            correct = next(o for o in opts if o[0])
            wrong = [o for o in opts if not o[0]]
            rnd.shuffle(wrong)
            pos = slots[i]
            ordered = wrong[:pos] + [correct] + wrong[pos:]
            letter = LETTERS[pos]
            stem_n = norm(q["stem"] + " " + alt_text(q["image"]))
            if stem_n in seen_stems:
                raise ValueError(f"{w}: enunciado duplicado")
            seen_stems.add(stem_n)
            spec = q["image"]
            kind = spec["kind"]
            reading = q.get("reading") or (READINGS.get((kind, spec.get("key"))) if kind in TEMPLATE_KINDS else "")
            idx = len(out_q) + 1
            out_q.append({
                "id": f"TEMI-800-{idx:03d}",
                "block": block["id"],
                "topicId": block["id"],
                "topicLabel": block["label"],
                "subtopic": q["subtopic"],
                "difficulty": q["difficulty"],
                "tags": [block["id"], slug(q["subtopic"]), "TEMI", "temi-800", "imagem-" + kind],
                "stem": q["stem"],
                "image": {**spec, "caption": spec.get("title") or CAPTIONS[kind], "alt": alt_text(spec), "reading": reading},
                "options": {LETTERS[j]: o[1] for j, o in enumerate(ordered)},
                "answer": letter,
                "rationales": {LETTERS[j]: ("Correta. " if o[0] else "Incorreta. ") + o[2] for j, o in enumerate(ordered)},
                "synthesis": q["synthesis"],
                "pearl": "🧠 " + (q.get("pearl") or f"{q['subtopic']}: {correct[1]}"),
                "sourceRefs": q["refs"],
                "reviewStatus": "revisao-medica-pendente",
            })
    used = sorted({r for q in out_q for r in q["sourceRefs"]})
    total = len(out_q)
    return {
        "meta": {
            "id": "qbank-temi-800-imagens-2026-v1",
            "title": f"TEMI 800 com imagens — {total} questões autorais",
            "subtitle": "Vinte temas de terapia intensiva; casos fictícios, figura didática e comentário A–E em cada questão",
            "version": "1.0",
            "updated": "2026-11-16",
            "verifiedAt": "2026-11-16",
            "status": "revisao-medica-pendente",
            "patientData": False,
            "authorship": "Conteúdo educacional autoral assistido por IA para o Dr. Aldenir Rocha; revisão médica humana formal pendente.",
            "purpose": "Preparação educacional em adultos; questões não oficiais da AMIB; casos inteiramente fictícios.",
            "safety": "⚠️ Ferramenta educacional/de apoio à decisão. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual.",
            "images": "Figuras são esquemas e traçados sintéticos gerados por código (sem imagens de pacientes reais).",
            "scope": "Cada questão cita fontes primárias ou diretrizes; o recorte é o da questão. Doses e metas devem ser conferidas no protocolo local.",
            "clinicalReviewStatus": "public-preview-pending-formal-medical-review",
            "claimsHumanClinicalReview": False,
        },
        "sources": {k: SOURCES[k] for k in used},
        "blocks": blocks,
        "questions": out_q,
    }


def render_js(bank: dict) -> str:
    return "// Banco autoral TEMI 800 com figuras didáticas; sem questões oficiais ou dados de pacientes.\nconst TEMI_800_2026_QBANK = " + json.dumps(bank, ensure_ascii=False, indent=1) + ";\n"


def main() -> int:
    allow = "--allow-partial" in sys.argv
    bank = build(allow)
    js = render_js(bank)
    if "--check" in sys.argv:
        if not OUT.exists() or OUT.read_text(encoding="utf-8") != js:
            print("Banco TEMI 800 desatualizado; execute build_temi800.py", file=sys.stderr)
            return 1
    else:
        OUT.write_text(js, encoding="utf-8")
    counts = {}
    for q in bank["questions"]:
        counts[q["answer"]] = counts.get(q["answer"], 0) + 1
    print(json.dumps({"questions": len(bank["questions"]), "blocks": len(bank["blocks"]), "answers": counts, "sources": len(bank["sources"])}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
