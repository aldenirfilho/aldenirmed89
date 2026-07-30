#!/usr/bin/env python3
"""
Compilador automático de mnemônicos clínicos para a Enciclopédia Médica.
Varre o diretório 11_MNEMONICOS/ e compila arquivos .md e pacotes .json em
data/mnemonicos.json.
"""

import os
import re
import json
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MNEMONICOS_DIR = os.path.join(ROOT_DIR, "11_MNEMONICOS")
OUTPUT_JSON = os.path.join(ROOT_DIR, "data", "mnemonicos.json")


def normalize_pack_entry(entry, source, pack_editorial):
    """Valida e normaliza uma entrada de pacote JSON."""
    if not isinstance(entry, dict):
        raise ValueError("cada mnemônico do pacote deve ser um objeto")

    required = ("id", "title", "letters")
    missing = [key for key in required if not entry.get(key)]
    if missing:
        raise ValueError(f"campos obrigatórios ausentes: {', '.join(missing)}")
    if not isinstance(entry["letters"], dict) or not entry["letters"]:
        raise ValueError("letters deve ser um objeto não vazio")

    normalized = {
        "id": str(entry["id"]).strip(),
        "title": str(entry["title"]).strip(),
        "emoji": str(entry.get("emoji") or "🏥"),
        "color": str(entry.get("color") or "var(--cyan)"),
        "category": str(entry.get("category") or "UTI"),
        "tags": [str(tag) for tag in entry.get("tags", ["UTI"])],
        "letters": {str(key): str(value) for key, value in entry["letters"].items()},
        "content": str(entry.get("content") or "").strip(),
        "source": source,
        "sourceRefs": [str(ref) for ref in entry.get("sourceRefs", [])],
        "evidenceType": str(entry.get("evidenceType") or "conceito"),
        "reviewStatus": str(
            entry.get("reviewStatus") or "revisao-medica-pendente"
        ),
        "editorial": entry.get("editorial") or pack_editorial,
    }
    return normalized


def load_json_packs():
    """Carrega catálogos JSON versionados dentro de 11_MNEMONICOS/."""
    entries = []
    pack_files = sorted(
        filename
        for filename in os.listdir(MNEMONICOS_DIR)
        if filename.lower().endswith(".json") and not filename.startswith(".")
    )
    for filename in pack_files:
        filepath = os.path.join(MNEMONICOS_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        raw_entries = payload.get("mnemonicos", [])
        if not isinstance(raw_entries, list):
            raise ValueError(f"{filename}: mnemonicos deve ser uma lista")
        source = os.path.relpath(filepath, ROOT_DIR)
        editorial = payload.get("editorial", {})
        for raw_entry in raw_entries:
            entry = normalize_pack_entry(raw_entry, source, editorial)
            entries.append(entry)
            print(f"   ✅ [{entry['id']}] {entry['title']} · pacote")
    return entries


def parse_yaml_frontmatter(file_content: str) -> tuple[dict, str]:
    """Parseia de forma simples o frontmatter YAML de um arquivo markdown."""
    frontmatter = {}
    content_body = file_content

    # Regex para capturar o bloco entre os primeiros '---'
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", file_content, re.DOTALL)
    if match:
        yaml_block = match.group(1)
        content_body = match.group(2)

        # Parsear linha por linha
        lines = yaml_block.splitlines()
        in_letters = False
        letters = {}

        for line in lines:
            # Detectar se entramos no dicionário de letters
            if line.strip().startswith("letters:"):
                in_letters = True
                continue

            # Se estivermos em letters, capturar cada par chave-valor identado
            if in_letters:
                if line.startswith("  ") or line.startswith("\t"):
                    m_letter = re.match(r"^\s+([a-zA-Z]+|letterSep):\s*\"?(.*?)\"?$", line)
                    if m_letter:
                        letters[m_letter.group(1)] = m_letter.group(2).strip()
                    continue
                else:
                    in_letters = False

            # Parser genérico para chaves de primeiro nível
            m_key = re.match(r"^([\w_-]+)\s*:\s*(.*?)$", line)
            if m_key:
                key = m_key.group(1)
                val = m_key.group(2).strip()

                # Remover aspas externas se houver
                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                elif val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]

                # Parsear tags no formato ["a", "b"]
                if key == "tags":
                    tags_clean = re.sub(r"[\[\]\"' ]", "", val)
                    frontmatter[key] = [t for t in tags_clean.split(",") if t]
                else:
                    frontmatter[key] = val

        if letters:
            frontmatter["letters"] = letters

    return frontmatter, content_body


def build():
    print("🧠 Compilando mnemônicos clínicos a partir de 11_MNEMONICOS/...")

    if not os.path.isdir(MNEMONICOS_DIR):
        print(f"⚠️ Diretório de mnemônicos {MNEMONICOS_DIR} não encontrado.")
        return

    mnemonicos = []
    
    # Listar e ordenar arquivos .md
    files = sorted([f for f in os.listdir(MNEMONICOS_DIR) if f.endswith(".md") and not f.startswith(".")])

    for filename in files:
        filepath = os.path.join(MNEMONICOS_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                raw_content = f.read()

            meta, body = parse_yaml_frontmatter(raw_content)

            # Fallbacks caso o metadata não esteja completo
            m_id = meta.get("id") or os.path.splitext(filename)[0].lower().replace("_", "")
            title = meta.get("title") or os.path.splitext(filename)[0].replace("_", " ").title()
            emoji = meta.get("emoji") or "🏥"
            color = meta.get("color") or "var(--cyan)"
            category = meta.get("category") or "UTI"
            tags = meta.get("tags") or ["UTI"]
            letters = meta.get("letters") or {}

            mnemonicos.append({
                "id": m_id,
                "title": title,
                "emoji": emoji,
                "color": color,
                "category": category,
                "tags": tags,
                "letters": letters,
                "content": body.strip()
            })
            print(f"   ✅ [{m_id}] {title}")
        except Exception as e:
            print(f"   ❌ Erro ao parsear {filename}: {e}")

    # Escrever no JSON de saída
    mnemonicos.extend(load_json_packs())

    seen = set()
    duplicates = set()
    for entry in mnemonicos:
        entry_id = entry["id"]
        if entry_id in seen:
            duplicates.add(entry_id)
        seen.add(entry_id)
    if duplicates:
        raise ValueError(
            "IDs de mnemônicos duplicados: " + ", ".join(sorted(duplicates))
        )

    output_data = {
        "version": "2.0",
        "updated": datetime.now().strftime("%Y-%m-%d"),
        "mnemonicos": mnemonicos
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ mnemonicos.json gerado com sucesso! ({len(mnemonicos)} mnemônicos compilados)")


if __name__ == "__main__":
    build()
