#!/usr/bin/env python3
"""Gera estudo privado ancorado em trechos locais, sem modificar documentos.

Resumo documental é extrativo e limitado às passagens consultadas. Questões de
aplicação clínica vêm de curadoria separada, com referências verificadas, e não
são atribuídas ao texto privado. Fontes insuficientes permanecem no inventário.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
import unicodedata
from organize_icloud_images import _rename_exclusive

REPO = Path(__file__).resolve().parents[1]
SCHEMA = "360x-private-clinical-study-v1"
MAX_PACKAGE_BYTES = 25 * 1024 * 1024
NONCLINICAL = {"juridico", "financas-patrimonio", "academico-projetos", "fe-historia-cultura", "gestao-ia-produtividade", "inbox-revisar"}
IDENTIFIER = re.compile(r"\bCPF\s*[:#-]?\s*\d|\b(?:prontu[aá]rio|nome\s+do\s+paciente|paciente\s*:)\s*[:#-]?\s*[A-Za-zÀ-ÿ0-9]|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b", re.I)
META = re.compile(r"copyright|all rights reserved|direitos reservados|licensed to|licenciad[oa] para|doi\s*[:.]|isbn|issn|corresponding author|[a-z]+://|www\.|^\s*(?:autores?|authors?|editores?|editors?|refer[eê]ncias?|bibliograf|instru[cç][oõ]es)\b", re.I)
MARKETING = re.compile(r"guia completo|uni[aã]o faz a for[cç]a|compreendendo|neste (?:cap[ií]tulo|livro)|this (?:chapter|paper)|ao final|n[aã]o substitui|consulte o|é proibid|e expressamente|assinale|alternativa correta|alternativa incorreta|escolha a resposta|gabarito", re.I)
AFFILIATION = re.compile(r"\b(?:professor[ae]?s?|coordenador[ae]?s?|doutorad[oa]|mestrad[oa]|mestre em|graduad[oa] em|especialista em|universidade|university|faculdade|college|departamento de|department of|pós-graduação|residência médica|board.certified)\b", re.I)
DOSE = re.compile(r"\b(?:\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|ug|UI|mEq|mmol|mL|ml|g/kg)|dose|posologia|dilui[cç][aã]o|infundir|prescrev|administrar\s+\d)", re.I)
PREDICATE = re.compile(r"\b(?:é|são|consiste|definid[oa]s?|caracterizad[oa]s?|apresenta|associad[oa]s?|ocorre|causa|resulta|envolve|aumenta|reduz|inclui|incluem|indica|permite|depende|representa|afeta|is|are|defined|associated|characterized|causes|includes|occurs|results|requires|increases|reduces)\b", re.I)
MEDICAL_WORDS = "sepse|sepsis|choque|shock|pneumonia|DPOC|COPD|SDRA|ARDS|asma|asthma|tuberculose|tuberculosis|candid|infec|infection|antimicrob|anemia|hemoglobina|tromb|hemorr|coagula|hemost|plaqueta|leucemia|linfoma|renal|kidney|creatinina|potássio|sódio|acidose|alcalose|diabetes|insulina|glicemia|tireo|adrenal|cortisol|hipófis|hepát|hepat|cirrose|pancreat|gastr|intestin|nutri|enteral|cardíac|cardiac|coronári|coronary|arritm|arrhythm|hipertens|hypertens|ventila|pulmon|respirat|pleural|oxig|hipox|delirium|sedaç|sedation|analges|neur|AVC|stroke|epilep|cefaleia|encefal|lupus|artrit|autoim|cortico|ferida|lesão|úlcera|útero|gestaç|gravidez|parto|obstétr|puerp|menstr|ovári|fetal|neonat|pediátr|infância|criança|aleitamento|vacina|imuniza|trauma|queimadura|hérnia|cirurg|cateter|ultrass|ultrasound|POCUS|diarreia|desidrata|epidemiol|coorte|bioestat|sensibilidade|especificidade|mortalidade|prevalência|incidência|TDAH|ADHD|paliativ|fisiolog|patolog|diagnóst|diagnos|prognóst"
MEDICAL = re.compile(MEDICAL_WORDS + "|heart|hepatic|liver|oxygen|hypox|potassium|sodium|electrolyt|thyroid|pregnan|pediatric|diarrh|dehydrat|seizure|surgic|anaphylax", re.I)
CLOZE = re.compile(r"\b(?:insuficiência\s+respiratória|cetoacidose\s+diabética|ventilação\s+mecânica|insuficiência\s+cardíaca|lesão\s+renal\s+aguda|choque\s+séptico|pressão\s+arterial|sistema\s+único\s+de\s+saúde|sepse|sepsis|SDRA|ARDS|DPOC|COPD|POCUS|tuberculose|pneumonia|asma|anemia|trombose|anticoagulação|hemostasia|creatinina|potássio|sódio|magnésio|insulina|glicemia|acidose|alcalose|cirrose|pancreatite|delirium|sedação|analgesia|hipoxemia|AVC|epilepsia|lupus|artrite|gravidez|gestação|puerpério|aleitamento|neonatologia|diarreia|desidratação|coorte|prevalência|incidência|sensibilidade|especificidade|TDAH|ADHD)\b", re.I)


def normalized(text):
    return " ".join(unicodedata.normalize("NFKC", str(text)).split())


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()[:24]


def safe_path(value):
    return (isinstance(value, str) and value and len(value) <= 2048 and not value.startswith("/")
            and not re.match(r"^[a-z][a-z0-9+.-]*:", value, re.I) and "\\" not in value
            and not any(ord(c) < 32 or ord(c) == 127 for c in value)
            and all(p not in {"", ".", ".."} for p in value.split("/")))


def _locator(segment, line_numbers=()):
    locator = {"pages": [], "paragraphs": []}
    if segment.get("kind") == "pdf-page":
        locator["pages"] = [segment["pageNumber"]]
    elif segment.get("kind") == "pdf-page-range":
        if segment.get("rangeIsPrefixUpperBound"):
            return None  # An upper bound is not evidence that page 2 exists.
        locator["pages"] = list(segment["pageNumbers"])
    elif segment.get("kind") == "xml-paragraph":
        locator["paragraphs"] = [segment["paragraphNumber"]]
    elif segment.get("kind") in {"text-lines", "converted-text-lines"}:
        locator["lines"] = list(line_numbers)
    for numbers in locator.values():
        if len(numbers) > 200 or len(set(numbers)) != len(numbers) or any(type(n) is not int or not 1 <= n <= 1_000_000 for n in numbers):
            return None
    return locator if any(locator.values()) else None


def _blocks(segment):
    raw = str(segment.get("text", ""))
    if segment.get("kind") in {"text-lines", "converted-text-lines"}:
        block, numbers = [], []
        for i, line in enumerate(raw.splitlines(), segment.get("startLine", 1)):
            if line.strip():
                block.append(line); numbers.append(i)
            elif block:
                yield " ".join(block), _locator(segment, numbers)
                block, numbers = [], []
        if block:
            yield " ".join(block), _locator(segment, numbers)
    else:
        # Rejoin only alphabetic hyphenation, never numeric signs or ranges.
        raw = re.sub(r"(?<=[a-zà-ÿ])-\s*\n\s*(?=[a-zà-ÿ])", "", raw, flags=re.I)
        yield raw, _locator(segment)


def _quarantined(row):
    return (row.get("privacyTriage", {}).get("status") not in {None, "noPatientRecordSignals"}
            or row.get("status") in {"quarantinedPII", "privacyReview"}
            or any(IDENTIFIER.search(str(s.get("text", ""))) for s in row.get("didacticSegments", [])))


def select_facts(row, maximum=3):
    """Only complete, qualitative, topical statements; never ungraded choices."""
    if _quarantined(row) or not row.get("factualEligible") or row.get("status") != "ready-candidate":
        return []
    candidates, seen = [], set()
    for segment in row.get("didacticSegments", []):
        for block, locator in _blocks(segment):
            if not locator:
                continue
            # Reflow wrapped PDF lines before sentence selection. Blank lines,
            # bullets and lettered choices remain boundaries.
            block = re.sub(r"\n(?!\s*\n|\s*[•●▪]|\s*[A-E][.)]\s)", " ", block)
            for sentence in re.split(r"(?<=[.!?])\s+(?=[A-ZÀ-Ý])|\n+|[•●▪]", block):
                text = normalized(re.sub(r"^[#>*\-\s]+", "", sentence))
                if not 50 <= len(text) <= 600 or not 9 <= len(text.split()) <= 90:
                    continue
                if META.search(text) or MARKETING.search(text) or AFFILIATION.search(text) or DOSE.search(text) or IDENTIFIER.search(text):
                    continue
                if "?" in text or re.search(r"<(?:/?[a-z])|\[[a-z]+://|(?:^|\s)[A-Ea-e][.)]\s", text, re.I):
                    continue
                if re.search(r"[,:;—–-]$", text) or re.match(r"(?:essa|esse|esta|este|isso|estes|esses|essas|estas|it|they|these|those|além disso|por isso|portanto|dessa forma|deste modo|assim sendo|no entanto|entretanto|qual|quais|como|por que|what|which|how|why)\b", text, re.I):
                    continue
                terms = list(MEDICAL.finditer(text))
                if not terms or not PREDICATE.search(text):
                    continue
                key = text.casefold()
                if key in seen:
                    continue
                seen.add(key)
                score = min(len(terms), 5) * 3 + (4 if re.search(r"\bé\b|\bdefined\b|\bcaracterizad", text, re.I) else 0) - len(text) / 300
                candidates.append({"text": text, "locator": locator, "score": score})
    result = []
    for item in sorted(candidates, key=lambda v: -v["score"]):
        words = set(item["text"].lower().split())
        if any(len(words & set(r["text"].lower().split())) / max(1, len(words)) > .8 for r in result):
            continue
        result.append(item)
        if len(result) == maximum:
            break
    return result


def _card(fact):
    found = CLOZE.search(fact) or re.search(r"\b(?:acute kidney injury|respiratory failure|heart failure|mechanical ventilation|septic shock|diabetic ketoacidosis|pneumonia|asthma|tuberculosis|creatinine|potassium|sodium|hypoxemia|pregnancy|diarrhea|dehydration|anaphylaxis)\b", fact, re.I)
    if found:
        target = found.group()
        front = "Complete a afirmação da fonte: " + re.sub(r"\b" + re.escape(target) + r"\b", "[…]", fact, flags=re.I)
        return front, target + ". " + fact
    found = re.match(r"^(.{4,90}?)\s+(?:é|são|consiste|refere-se|is|are)\s+", fact, re.I)
    if found and len(found[1].split()) <= 10:
        return "Como o trecho caracteriza " + found[1] + "?", fact
    return None


def _source(row, facts):
    source_id = "library-study-source-" + digest([row["sourceName"], row["path"], row["size"], row["modifiedNs"]])
    quarantined = _quarantined(row)
    coverage = {"status": "quarantined" if quarantined else "partial" if facts else "insufficient", "partial": True, "pages": [], "paragraphs": []}
    if row.get("status") in {"pending-extraction", "awaiting-extraction", "candidate"} and not facts and not quarantined:
        coverage["status"] = "pending"
    for field in ("pages", "paragraphs", "lines"):
        numbers = sorted({n for f in facts for n in f["locator"].get(field, [])}) if not quarantined else []
        if numbers or field != "lines":
            coverage[field] = numbers
    source = {"id": source_id, "slot": "pdf" if row["sourceName"] == "PDF" else "doc",
              "path": unicodedata.normalize("NFC", row["path"]), "size": row["size"], "modifiedMs": row["modifiedNs"] // 1_000_000,
              "privacy": "quarantined" if quarantined else "educational", "rights": "blocked" if quarantined else "private-reference", "coverage": coverage}
    if re.fullmatch(r"[a-f0-9]{64}", row.get("sha256") or ""):
        source["sha256"] = row["sha256"]
    return source


def build_package(inventory, enrichments, package_id="library-study-clinical-20261102", version=1):
    if not re.fullmatch(r"library-study-[a-z0-9-]{1,106}", package_id) or type(version) is not int or not 1 <= version <= 1_000_000:
        raise ValueError("invalid-package-version")
    rows = inventory.get("documents")
    if not isinstance(rows, list) or not rows:
        raise ValueError("empty-inventory")
    sources, units, report, source_rows, duplicate_units = [], [], [], {}, {}
    for row in rows:
        if row["theme"] in NONCLINICAL:
            raise ValueError("nonclinical-source")
        if not safe_path(row["path"]):
            report.append({"id": row["id"], "status": "local-only-path"}); continue
        if row.get("metadataCurrent") is False or row.get("manifestCurrent") is False or row.get("metadataStable") is False:
            raise ValueError("source-changed")
        quarantined = _quarantined(row)
        facts = [] if quarantined else select_facts(row)
        source = _source(row, facts); sources.append(source); source_rows[source["id"]] = row
        status = source["coverage"]["status"]
        evidence = {"id": row["id"], "sourceId": source["id"], "status": status, "particles": len(facts), "cards": 0,
                    "wholeWorkSummarized": False, "method": "extractive-selected-passages"}
        if facts:
            # Deduplicate only byte-identical documents with identical passages/locators.
            duplicate_key = digest([source.get("sha256") or source["id"], row["theme"], [(f["text"], f["locator"]) for f in facts]])
            prior = duplicate_units.get(duplicate_key)
            if prior:
                prior["sourceIds"].append(source["id"]); evidence["sharedUnitId"] = prior["id"]
                evidence["cards"] = len(prior["cards"])
            else:
                uid = "library-study-doc-" + digest([source["id"], duplicate_key])
                # A private document title makes the local study searchable.
                # Names are labels only, never evidence for clinical claims.
                labels = [row.get("titlePrivate", ""), Path(row["path"]).stem.replace("_", " "), *row.get("labels", [])]
                label = next((normalized(s)[:155] for s in labels if 6 <= len(normalized(s)) <= 200
                              and not IDENTIFIER.search(s) and not META.search(s)
                              and not re.fullmatch(r"(?:untitled|document[o]?|[a-f0-9-]{20,})", normalized(s), re.I)), row["themeLabel"])
                title = ("Síntese extrativa · " + label)[:190]
                unit = {"id": uid, "title": title, "theme": row["theme"], "sourceIds": [source["id"]], "refIds": [], "particles": [], "cards": [], "questions": []}
                for i, fact in enumerate(facts, 1):
                    provenance = {"sourceId": source["id"], "locator": fact["locator"], "relationBasis": "document-grounded", "refIds": []}
                    unit["particles"].append({"id": uid + "-p" + str(i), "title": "Ideia " + str(i) + " · " + label[:120], "text": fact["text"], **provenance})
                    card = _card(fact["text"])
                    if card:
                        unit["cards"].append({"id": uid + "-c" + str(i), "front": card[0], "back": card[1], **provenance})
                evidence["cards"] = len(unit["cards"]); units.append(unit); duplicate_units[duplicate_key] = unit
        report.append(evidence)
    refs = {}
    for enrichment in enrichments:
        for ref in enrichment["references"]:
            if ref["id"] in refs and refs[ref["id"]] != ref:
                raise ValueError("reference-conflict")
            refs[ref["id"]] = ref
        for raw in enrichment["units"]:
            unit = json.loads(json.dumps(raw))
            if unit["theme"] in NONCLINICAL:
                raise ValueError("nonclinical-application")
            related = [s["id"] for s in sources if s["privacy"] == "educational" and source_rows[s["id"]]["theme"] == unit["theme"]]
            unit["sourceIds"] = related
            for question in unit["questions"]:
                question["sourceIds"] = related.copy()
            units.append(unit)
    package = {"schema": SCHEMA, "packageId": package_id, "version": version, "title": "Biblioteca clínica privada · Turbo TEMI 360X",
               "createdAt": datetime.now(timezone.utc).isoformat(), "privacyReview": "cleared-no-identifiers", "clinicalReview": "educational-pending",
               "sources": sources, "references": list(refs.values()), "units": units}
    raw = json.dumps(package, ensure_ascii=False, separators=(",", ":")).encode()
    if len(raw) > MAX_PACKAGE_BYTES:
        raise ValueError("package-too-large")
    summary = {"schema": "360x-private-clinical-generation-report-v1", "sources": len(sources), "coverage": dict(Counter(s["coverage"]["status"] for s in sources)),
        "documentsWithGroundedSummary": sum(r.get("particles", 0) > 0 for r in report), "documentalUnits": len(duplicate_units),
        "clinicalApplicationUnits": len(units) - len(duplicate_units), "particles": sum(len(u["particles"]) for u in units),
        "cards": sum(len(u["cards"]) for u in units), "questions": sum(len(u["questions"]) for u in units), "packageBytes": len(raw),
        "privateOriginalsModified": False, "fullWorksSummarized": False, "officialAMIBQuestions": False, "clinicalReview": "educational-pending", "documents": report}
    return package, summary


def write_private(output, package, report):
    requested = Path(output).absolute()
    output = requested.resolve(strict=False)
    repo = REPO.resolve()
    if requested.is_symlink() or output.exists() or output == repo or repo in output.parents:
        raise ValueError("private-new-output-required")
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    stage = Path(tempfile.mkdtemp(prefix=".clinical-study-stage-", dir=output.parent))
    try:
        for name, data in (("estudo-clinico-360x.json", package), ("cobertura-geracao.json", report)):
            path = stage / name
            path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
            path.chmod(0o600)
        (stage / "LEIA-ME.txt").write_text("ESTUDO CLÍNICO PRIVADO — TURBO TEMI 360X\n\nImporte estudo-clinico-360x.json em Biblioteca IA → Estudo privado.\nConecte PDF e DOC para abrir as fontes pela versão correspondente.\nResumos são extrativos e restritos às passagens indicadas. As questões autorais de aplicação temática usam referências próprias; não são questões oficiais AMIB nem transcrições das provas.\nConteúdo e progresso ficam privados no navegador. Use o backup privado de estudo para transferir conteúdo/progresso.\nFontes insuficientes e possíveis registros individuais ficam no inventário; não viram afirmações clínicas.\nRevisão médica formal pendente. Originais não foram movidos, renomeados ou editados.\n", encoding="utf-8")
        (stage / "LEIA-ME.txt").chmod(0o600)
        _rename_exclusive(stage, output)
    finally:
        if stage.exists():
            for path in stage.iterdir():
                path.unlink()
            stage.rmdir()


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inventory", type=Path, required=True)
    parser.add_argument("--enrichment", type=Path, action="append", default=[])
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--package-id", default="library-study-clinical-20261102")
    parser.add_argument("--version", type=int, default=1)
    args = parser.parse_args(argv)
    try:
        inventory = json.loads(args.inventory.read_text())
        enrichments = [json.loads(p.read_text()) for p in args.enrichment]
        package, report = build_package(inventory, enrichments, args.package_id, args.version)
        write_private(args.output, package, report)
    except (OSError, ValueError, TypeError, KeyError):
        print(json.dumps({"ok": False, "message": "Geração recusada; confira inventário, âncoras e destino privado."}))
        return 1
    print(json.dumps({"ok": True, **{k: v for k, v in report.items() if k != "documents"}}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
