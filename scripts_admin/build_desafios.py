#!/usr/bin/env python3
"""
Converte arquivos .md da pasta 10_DESAFIOS/ em data/desafios.json.

Estrutura de pastas suportada:
  10_DESAFIOS/arquivo.md         → branch detectado por conteúdo (padrão: temi)
  10_DESAFIOS/TEMI/arquivo.md   → branch = temi
  10_DESAFIOS/R3/arquivo.md     → branch = r3

Campos extraídos do Markdown:
  - id        : slug do nome do arquivo
  - title     : segundo H1 (ou primeiro que não seja "RODADA")
  - excerpt   : texto do primeiro H2 após o título, ou primeiro parágrafo
  - content   : conteúdo Markdown completo
  - tags      : palavras-chave extraídas do conteúdo
  - date      : data de modificação do arquivo
  - difficulty: detectada por palavras no conteúdo (padrão: alta para TEMI)
  - featured  : False por padrão
"""

import os
import re
import json
import unicodedata
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESAFIOS_DIR = os.path.join(ROOT_DIR, "10_DESAFIOS")
OUTPUT_JSON = os.path.join(ROOT_DIR, "data", "desafios.json")

TEMI_KEYWORDS = [
    "TEMI", "UTI", "medicina intensiva", "ventilação mecânica",
    "SDRA", "ARDS", "sepse", "choque", "hemodinâmica",
    "vasopressor", "ECMO", "IOT", "intubação",
]
R3_KEYWORDS = [
    "R3", "clínica médica", "ambulatório", "enfermaria",
]

MEDICAL_TAGS = [
    "SDRA", "ARDS", "sepse", "choque", "ventilação", "prona",
    "ECMO", "BNM", "cisatracúrio", "PEEP", "driving pressure",
    "gasometria", "ARDSNet", "PROSEVA", "ROSE", "EOLIA",
    "insuficiência respiratória", "oxigenação", "desmame",
    "PCR", "ressuscitação", "droga vasoativa",
    "hiponatremia", "hipercalemia", "hipoglicemia",
    "antibiótico", "anticoagulação", "trombose", "TEP",
    "IAM", "SCA", "fibrilação", "taquicardia",
    "pneumonia", "DPOC", "asma", "broncoespasmo",
    "insuficiência renal", "diálise", "KDIGO",
    "insuficiência hepática", "cirrose",
    "AVC", "crises epilépticas", "meningite",
    "VExUS", "FAST", "POCUS", "USG", "delirium", "sedação",
    "analgesia", "RASS", "CAM-ICU", "hemodinâmica", "nora",
    "noradrenalina", "dobutamina", "intubação", "IOT",
    "potássio", "sódio", "magnésio", "cálcio", "acidose",
    "alcalose", "lactato", "trombólise", "alteplase",
    "trombectomia", "ASPECTS", "NIHSS", "edema maligno",
    "craniectomia", "encefalite", "cetoacidose", "CAD",
    "insulina", "ânion gap", "hipernatremia", "coma"
]


def slugify(text):
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)


def detect_branch(filepath, content):
    folder = os.path.basename(os.path.dirname(filepath)).upper()
    if folder == "TEMI":
        return "temi"
    if folder == "R3":
        return "r3"
    content_upper = content.upper()
    r3_score = sum(1 for kw in R3_KEYWORDS if kw.upper() in content_upper)
    temi_score = sum(1 for kw in TEMI_KEYWORDS if kw.upper() in content_upper)
    return "r3" if r3_score > temi_score else "temi"


def extract_title(content):
    lines = content.splitlines()
    titles = []
    for line in lines:
        m = re.match(r"^#\s+(.+)", line)
        if m:
            t = re.sub(r"[🧠⚡🫁🏥🩺💊📊🔥★✅❓📌🔎🎯📖🔗🔁🚀🛟🔍📞📣🧰🛌💉🩸🧪🧭🫀]", "", m.group(1)).strip()
            titles.append(t)
    for t in titles:
        if "RODADA" not in t.upper() and "TEMA SORTEADO" not in t.upper():
            return t
    return titles[0] if titles else os.path.splitext(os.path.basename(""))[0]


def extract_excerpt(content):
    lines = content.splitlines()
    for line in lines:
        m = re.match(r"^#{2,3}\s+_?(.+?)_?$", line)
        if m:
            text = m.group(1).strip("_* ")
            if len(text) > 15:
                return text
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("|") and not line.startswith("-") and not line.startswith(">") and not line.startswith("```"):
            clean = re.sub(r"\*+|`|_", "", line).strip()
            if len(clean) > 20:
                return clean[:200]
    return ""


def extract_tags(content, branch):
    found = []
    content_upper = content.upper()
    for tag in MEDICAL_TAGS:
        if tag.upper() in content_upper:
            found.append(tag)
    if branch == "temi":
        found.insert(0, "TEMI")
    elif branch == "r3":
        found.insert(0, "R3")
    return found[:8]


def detect_difficulty(content, branch):
    # Busca padrões explícitos de dificuldade no frontmatter ou cabeçalho
    m = re.search(r"dificuldade\s*[:=]\s*(básica|basica|média|media|alta)", content, re.IGNORECASE)
    if m:
        val = m.group(1).lower()
        if "s" in val:  # basica
            return "basica"
        if "d" in val:  # media/média
            return "media"
    # TEMI e UTI são sempre alta; R3 sem marcação = media
    return "alta" if branch == "temi" else "media"


def file_date(filepath):
    mtime = os.path.getmtime(filepath)
    return datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")


def parse_md_file(filepath):
    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    filename = os.path.splitext(os.path.basename(filepath))[0]
    branch = detect_branch(filepath, content)
    title = extract_title(content) or filename
    excerpt = extract_excerpt(content)
    tags = extract_tags(content, branch)
    difficulty = detect_difficulty(content, branch)
    date = file_date(filepath)
    dsf_id = slugify(filename)

    return branch, {
        "id": dsf_id,
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "tags": tags,
        "date": date,
        "difficulty": difficulty,
        "featured": False,
        "source": os.path.relpath(filepath, ROOT_DIR),
    }


def collect_md_files(folder):
    entries = []
    if not os.path.isdir(folder):
        print(f"⚠️  Pasta {folder} não encontrada.")
        return entries
    for dirpath, _, filenames in os.walk(folder):
        for fname in sorted(filenames):
            if fname.endswith(".md") and not fname.startswith("."):
                entries.append(os.path.join(dirpath, fname))
    return entries


def build():
    print("🏋️  Construindo data/desafios.json a partir de 10_DESAFIOS/...")

    existing = {"version": "1.0", "temi": [], "r3": []}
    if os.path.exists(OUTPUT_JSON):
        with open(OUTPUT_JSON, encoding="utf-8") as f:
            existing = json.load(f)

    md_files = collect_md_files(DESAFIOS_DIR)
    if not md_files:
        print("   Nenhum arquivo .md encontrado em 10_DESAFIOS/.")
        return

    # Índice dos que já existem (pelo id) para não duplicar entradas manuais
    existing_ids_temi = {d["id"]: i for i, d in enumerate(existing.get("temi", []))}
    existing_ids_r3 = {d["id"]: i for i, d in enumerate(existing.get("r3", []))}

    temi = list(existing.get("temi", []))
    r3 = list(existing.get("r3", []))

    added = updated = 0
    for filepath in md_files:
        try:
            branch, entry = parse_md_file(filepath)
        except Exception as e:
            print(f"   ⚠️  Erro ao processar {filepath}: {e}")
            continue

        if branch == "temi":
            if entry["id"] in existing_ids_temi:
                temi[existing_ids_temi[entry["id"]]] = entry
                updated += 1
            else:
                temi.append(entry)
                added += 1
        else:
            if entry["id"] in existing_ids_r3:
                r3[existing_ids_r3[entry["id"]]] = entry
                updated += 1
            else:
                r3.append(entry)
                added += 1

        print(f"   ✅  [{branch.upper()}] {entry['title'][:60]}")

    output = {
        "version": "1.0",
        "updated": datetime.now().strftime("%Y-%m-%d"),
        "temi": temi,
        "r3": r3,
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅  desafios.json atualizado — {added} adicionados, {updated} atualizados.")
    print(f"   TEMI: {len(temi)} | R3: {len(r3)}")


if __name__ == "__main__":
    build()
