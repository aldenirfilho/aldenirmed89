#!/usr/bin/env python3
"""
Converte arquivos .md da pasta 10_DESAFIOS/ em data/desafios.json.

Estrutura de pastas suportada:
  10_DESAFIOS/arquivo.md         → 1 desafio (branch detectado por conteúdo)
  10_DESAFIOS/TEMI/arquivo.md    → 1 desafio, branch = temi
  10_DESAFIOS/R3/arquivo.md      → 1 desafio, branch = r3
  10_DESAFIOS/Sepse/             → 1 desafio ÚNICO combinando TODOS os .md
                                    da pasta (em ordem alfabética), como
                                    texto contínuo. Permite ir acrescentando
                                    conteúdo: basta soltar 01-intro.md,
                                    02-questoes.md, 03-aprofundamento.md...
  (também funciona dentro de TEMI/ e R3/: ex. TEMI/Choque/ vira 1 desafio)

Para "continuar" um desafio existente, você também pode simplesmente
acrescentar mais texto ao final do próprio .md — o leitor mostra tudo
em rolagem contínua.

Campos extraídos do Markdown:
  - id        : slug do nome do arquivo OU da pasta (no modo combinado)
  - title     : primeiro H1 que não seja "RODADA"/"TEMA SORTEADO"
  - excerpt   : texto do primeiro H2/H3 ou primeiro parágrafo
  - content   : Markdown completo (concatenado, no modo combinado)
  - tags      : palavras-chave extraídas do conteúdo
  - date      : data de modificação mais recente entre os .md
  - difficulty: detectada por palavras no conteúdo (padrão: alta p/ TEMI)
  - parts     : nº de arquivos .md combinados (1 no modo arquivo único)
  - featured  : False por padrão

Rebuild limpo: entradas geradas a partir de arquivos (campo `source`
começando com "10_DESAFIOS") são regeneradas a cada execução — apagar ou
renomear um .md reflete no JSON. Entradas adicionadas manualmente pelo
editor admin/desafios.html (sem `source` de arquivo) são preservadas.
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
    return re.sub(r"[\s_-]+", "-", text).strip("-") or "desafio"


def detect_branch_by_content(content):
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


def most_recent_date(md_files):
    if not md_files:
        return datetime.now().strftime("%Y-%m-%d")
    mtime = max(os.path.getmtime(fp) for fp in md_files)
    return datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")


def folder_md_files(folder):
    """Todos os .md (recursivos, ordenados) de uma pasta."""
    mds = []
    for dirpath, _, filenames in os.walk(folder):
        for fname in sorted(filenames):
            if fname.lower().endswith(".md") and not fname.startswith("."):
                mds.append(os.path.join(dirpath, fname))
    return sorted(mds)


def collect_units():
    """Descobre 'unidades' de desafio.

    Cada unidade é uma tupla (forced_branch, base_path, [md_files]):
      - arquivo .md solto  → 1 unidade, id = nome do arquivo
      - subpasta comum     → 1 unidade combinando todos os .md, id = nome da pasta
    TEMI/ e R3/ são tratadas como pastas-de-branch (forçam o ramo) e não
    viram um desafio combinado em si — seus filhos é que viram desafios.
    """
    units = []
    if not os.path.isdir(DESAFIOS_DIR):
        print(f"⚠️  Pasta {DESAFIOS_DIR} não encontrada.")
        return units

    branch_roots = [(DESAFIOS_DIR, None)]
    reserved = set()
    for sub, branch in (("TEMI", "temi"), ("R3", "r3")):
        p = os.path.join(DESAFIOS_DIR, sub)
        if os.path.isdir(p):
            branch_roots.append((p, branch))
            reserved.add(os.path.normcase(p))

    for root, forced in branch_roots:
        for name in sorted(os.listdir(root)):
            if name.startswith("."):
                continue
            full = os.path.join(root, name)
            if os.path.isfile(full) and name.lower().endswith(".md"):
                units.append((forced, full, [full]))
            elif os.path.isdir(full):
                # No nível do DESAFIOS_DIR, pular as pastas-de-branch
                if root == DESAFIOS_DIR and os.path.normcase(full) in reserved:
                    continue
                mds = folder_md_files(full)
                if mds:
                    units.append((forced, full, mds))
    return units


def parse_unit(forced_branch, base_path, md_files):
    parts = []
    for fp in md_files:
        with open(fp, encoding="utf-8") as f:
            text = f.read().strip()
        if text:
            parts.append(text)
    content = "\n\n".join(parts)

    is_folder = os.path.isdir(base_path)
    raw_name = os.path.basename(base_path.rstrip(os.sep))
    if not is_folder:
        raw_name = os.path.splitext(raw_name)[0]

    branch = forced_branch or detect_branch_by_content(content)
    fallback_title = raw_name.replace("_", " ").replace("-", " ").strip().title()
    title = extract_title(content) or fallback_title
    excerpt = extract_excerpt(content)
    tags = extract_tags(content, branch)
    difficulty = detect_difficulty(content, branch)

    return branch, {
        "id": slugify(raw_name),
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "tags": tags,
        "date": most_recent_date(md_files),
        "difficulty": difficulty,
        "parts": len(md_files),
        "featured": False,
        "source": os.path.relpath(base_path, ROOT_DIR),
    }


def is_file_sourced(entry):
    src = str(entry.get("source", "")).replace("\\", "/")
    return src.startswith("10_DESAFIOS")


def build():
    print("🏋️  Construindo data/desafios.json a partir de 10_DESAFIOS/...")

    existing = {"version": "1.0", "temi": [], "r3": []}
    if os.path.exists(OUTPUT_JSON):
        with open(OUTPUT_JSON, encoding="utf-8") as f:
            existing = json.load(f)

    # Preserva apenas entradas manuais (editor admin); regenera as de arquivo.
    manual_temi = [e for e in existing.get("temi", []) if not is_file_sourced(e)]
    manual_r3 = [e for e in existing.get("r3", []) if not is_file_sourced(e)]

    units = collect_units()
    if not units:
        print("   Nenhum arquivo .md encontrado em 10_DESAFIOS/.")

    file_temi, file_r3 = [], []
    for forced, base, md_files in units:
        try:
            branch, entry = parse_unit(forced, base, md_files)
        except Exception as e:
            print(f"   ⚠️  Erro ao processar {base}: {e}")
            continue
        (file_temi if branch == "temi" else file_r3).append(entry)
        extra = f" ({entry['parts']} partes)" if entry["parts"] > 1 else ""
        print(f"   ✅  [{branch.upper()}] {entry['title'][:60]}{extra}")

    def merge(file_list, manual_list):
        ids = {e["id"] for e in file_list}
        return file_list + [m for m in manual_list if m.get("id") not in ids]

    temi = merge(file_temi, manual_temi)
    r3 = merge(file_r3, manual_r3)

    output = {
        "version": "1.0",
        "updated": datetime.now().strftime("%Y-%m-%d"),
        "temi": temi,
        "r3": r3,
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    kept = len(manual_temi) + len(manual_r3)
    print(
        f"\n✅  desafios.json atualizado — {len(file_temi) + len(file_r3)} de arquivos, "
        f"{kept} manuais preservados."
    )
    print(f"   TEMI: {len(temi)} | R3: {len(r3)}")


if __name__ == "__main__":
    build()
