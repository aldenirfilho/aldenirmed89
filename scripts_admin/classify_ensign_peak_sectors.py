#!/usr/bin/env python3
"""Enriquece o 13F com setores do snapshot Nasdaq; não faz consultas de rede.

Não aceita fuzzy matching. Mantém ETFs sem decomposição e identidades pendentes.
O ticker é uma referência atual do emissor, não validação histórica de CUSIP.
"""
from __future__ import annotations

import argparse
import collections
import csv
import hashlib
import json
import re
from pathlib import Path

TOTAL = 60_816_389_385
DATE = "2026-10-22"
API = "https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=10000&download=true"
LABELS = {
    "Technology": "Tecnologia", "Finance": "Financeiro",
    "Consumer Discretionary": "Consumo discricionário", "Health Care": "Saúde",
    "Industrials": "Industriais", "Real Estate": "Imobiliário",
    "Energy": "Energia", "Utilities": "Serviços públicos",
    "Basic Materials": "Materiais básicos", "Consumer Staples": "Consumo básico",
    "Telecommunications": "Telecomunicações",
}
ETF_ISSUERS = {
    "AMERICAN CENTY ETF TR", "HARBOR ETF TRUST", "INVESCO EXCH TRADED FD TR II",
    "ISHARES TR", "SELECT SECTOR SPDR TR", "SPDR SERIES TRUST", "SSGA ACTIVE ETF TR",
    "VANGUARD INDEX FDS", "VANGUARD INTL EQUITY INDEX F", "VANGUARD MALVERN FDS",
    "VANGUARD TAX-MANAGED FDS",
}
EXPANSIONS = {
    "FINL": "FINANCIAL", "INTL": "INTERNATIONAL", "SYS": "SYSTEMS", "SYSTEM": "SYSTEMS",
    "HLDGS": "HOLDINGS", "HLDNGS": "HOLDINGS", "HLDG": "HOLDINGS", "HOLDING": "HOLDINGS",
    "SVCS": "SERVICES", "RES": "RESOURCES", "PPTY": "PROPERTY", "MATLS": "MATERIALS",
    "INSTRS": "INSTRUMENTS", "COS": "COMPANIES", "MGMT": "MANAGEMENT", "PRODS": "PRODUCTS",
    "ELEC": "ELECTRIC", "MTRS": "MOTORS", "WKS": "WORKS", "TRANSN": "TRANSPORTATION",
    "PWR": "POWER", "UTILS": "UTILITIES", "SECD": "SECURED", "SECS": "SECURITIES",
    "TR": "TRUST", "FD": "FUND", "FDS": "FUNDS", "BK": "BANK", "NATL": "NATIONAL",
    "BANCORPORATION": "BANCORP", "CP": "CORPORATION", "MACHS": "MACHINES", "MKTS": "MARKETS",
    "PMTS": "PAYMENTS", "PAC": "PACIFIC", "AMER": "AMERICA", "PETE": "PETROLEUM", "AIRLS": "AIRLINES",
    "MFG": "MANUFACTURING", "CAP": "CAPITAL", "INDS": "INDUSTRIES", "RLTY": "REALTY",
    "INVS": "INVESTORS", "SOLNS": "SOLUTIONS", "STR": "STREET", "PPTYS": "PROPERTIES",
    "CMNTYS": "COMMUNITIES", "INS": "INSURANCE", "MTR": "MOTOR", "MNG": "MINING",
    "HLTH": "HEALTH", "RESH": "RESEARCH", "MED": "MEDICAL", "INVT": "INVESTMENT",
    "INVTS": "INVESTMENTS", "GRP": "GROUP", "FMRS": "FARMERS", "MKT": "MARKET",
    "BKG": "BANKING", "INDTY": "INDEMNITY", "ENTMT": "ENTERTAINMENT", "GENL": "GENERAL",
    "ALUM": "ALUMINUM", "BLDG": "BUILDING", "CTRS": "CENTERS", "CHEM": "CHEMICAL",
    "SOUTHN": "SOUTHERN", "FED": "FEDERAL", "GOVT": "GOVERNMENT", "STL": "STEEL",
    "RUBR": "RUBBER", "RY": "RAILWAY", "SVC": "SERVICE", "GEN": "GENERAL", "WTR": "WATER",
    "SVSC": "SERVICES", "AMERN": "AMERICAN", "INDL": "INDUSTRIAL", "HOLD": "HOLDINGS",
    "CORPORATI": "CORPORATION", "INFRAS": "INFRASTRUCTURE", "1ST": "FIRST",
}
LEGAL = {"INC", "INCORPORATED", "CORP", "CORPORATION", "CO", "COMPANY", "COMPANIES", "LTD",
         "LIMITED", "PLC", "LLC", "LP", "NV", "SA", "SE", "AG", "NEW", "DEL", "THE", "REIT", "FORMERLY"}
BLOCKED_AUTOMATCH = {"FIRSTBANCORP"}
BDC_ISSUERS = {"BLACKSTONE SECD LENDING FD", "ARES CAPITAL CORP", "SLR INVESTMENT CORP", "GOLUB CAP BDC INC"}


def normalize(name: str) -> str:
    name = name.upper().replace("&", " AND ").replace("'", "")
    name = re.sub(r"\([^)]*\)", " ", name)
    name = re.split(r"\b(?:COMMON STOCK|COMMON SHARES|ORDINARY SHARES|ORDINARY SHARE|DEPOSITARY SHARES|DEPOSITARY SHARE|SPONSORED ADS|SPONSORED ADR|AMERICAN DEPOSITARY|CLASS [A-Z0-9]|CL [A-Z0-9])\b", name)[0]
    words = [EXPANSIONS.get(w, w) for w in re.findall(r"[A-Z0-9]+", name)]
    return "".join(w for w in words if w not in LEGAL)


def json_text(value: object) -> str:
    # Notação numérica JSON equivalente evita confundir valores USD com telefone.
    text = json.dumps(value, ensure_ascii=False, indent=2)
    text = re.sub(r'("(?:valueUSD|matchedValueUSD|totalValueUSD|residualValueUSD)"\s*:\s*)(\d+)(?:\.0+)?(?=\s*[,}\]])', lambda m: m[1] + m[2] + "e0", text)
    return text + "\n"


def classify(rows: list[dict], nasdaq: dict, manual: list[dict], pending_reviews: list[dict] | None = None) -> dict:
    index = collections.defaultdict(list)
    by_symbol = {x["symbol"]: x for x in nasdaq["data"]["rows"]}
    for x in nasdaq["data"]["rows"]:
        index[normalize(x["name"])].append(x)
    reviews = {x["issuer"]: x for x in manual}
    pending_notes = {x["issuer"]: x for x in (pending_reviews or [])}
    if len(reviews) != len(manual):
        raise ValueError("Identidade manual duplicada")
    issuer_values = collections.Counter()
    for r in rows:
        issuer_values[r["issuer"]] += int(r["valueUSD"])
    previous_top = {name for name, _ in issuer_values.most_common(15)}
    result = []
    for raw in rows:
        issuer = raw["issuer"]
        item = {k: raw[k] for k in ("issuer", "securityClass", "cusip")}
        item.update(lineNumber=int(raw["lineNumber"]), valueUSD=int(raw["valueUSD"]),
                    previousResidual=issuer not in previous_top, referenceSymbol="", providerName="",
                    providerSector="", providerIndustry="", sourceURL="", identitySourceURL="",
                    status="pending", sector="Não confirmado / não especificado", method="unresolved", note="")
        hits = index.get(normalize(issuer), [])
        classified = [h for h in hits if h["sector"]]
        identities = {(h["sector"], h["industry"]) for h in classified}
        reference = None
        if issuer in ETF_ISSUERS:
            item.update(status="etf", sector="ETFs — sem decomposição", method="sec_instrument_review",
                        sourceURL="https://www.sec.gov/Archives/edgar/data/1454984/000145498426000004/xslForm13F_X02/13FQ22026FINAL.xml",
                        note="Cota de ETF; não representa setor do administrador. Subjacentes não decompostos.")
        elif issuer in reviews:
            review = reviews[issuer]
            if raw["cusip"] not in review["cusips"]:
                raise ValueError(f"CUSIP não revisado: {issuer} {raw['cusip']}")
            reference = by_symbol[review["nasdaqSymbol"]]
            item.update(method=review.get("matchMethod", "manual_identity_primary_source"),
                        identitySourceURL=review["identitySourceURL"], note=review["identityEvidence"])
        elif normalize(issuer) not in BLOCKED_AUTOMATCH and classified and len(identities) == 1:
            reference = classified[0]
            # Escolha de classe apenas melhora a referência; não valida o CUSIP.
            cl = re.search(r"(?:CL|CLASS|STK CL)\s+([ACB])\b", raw["securityClass"])
            if cl:
                candidates = [h for h in classified if f"Class {cl[1]} " in h["name"]]
                if candidates:
                    reference = candidates[0]
            item["method"] = "normalized_issuer_name_reviewed_collisions"
            item["note"] = "Nome normalizado e consenso no setor/indústria; identidade histórica da classe/CUSIP não confirmada independentemente."
        else:
            if normalize(issuer) in BLOCKED_AUTOMATCH:
                item["note"] = "Colisão entre emissores homônimos; revisão individual necessária."
            elif hits and not classified:
                item["note"] = "Emissor localizado, mas setor ausente no snapshot Nasdaq."
            elif hits:
                item["note"] = "Correspondências com setores/indústrias conflitantes."
            else:
                item["note"] = "Sem correspondência inequívoca por nome; não se aceitou aproximação automática."
        if reference:
            item.update(referenceSymbol=reference["symbol"], providerName=reference["name"],
                        providerSector=reference["sector"], providerIndustry=reference["industry"],
                        sourceURL="https://www.nasdaq.com" + reference["url"])
            if reference["sector"] in LABELS:
                item.update(status="nasdaq", sector=LABELS[reference["sector"]])
            else:
                item["note"] += " Provedor não especifica setor econômico suficiente (vazio ou Miscellaneous)."
        if issuer in BDC_ISSUERS:
            item["note"] += " BDC/veículo listado de investimento; Finance é rótulo do emissor, sem decomposição de crédito/subjacentes."
        if issuer in pending_notes and pending_notes[issuer].get("excludeFromSector"):
            item.update(status="pending", sector="Não confirmado / não especificado", method="provider_label_contested")
        if item["status"] == "pending" and issuer in pending_notes:
            review = pending_notes[issuer]
            item.update(referenceSymbol=review.get("symbol", ""),
                        identitySourceURL=review["identitySourceURL"], note=review["identityEvidence"])
        item["percentOf13F"] = item["valueUSD"] / TOTAL * 100
        result.append(item)
    if len(result) != 1724 or sum(r["valueUSD"] for r in result) != TOTAL:
        raise ValueError("Carteira não reconciliada com o 13F")
    sectors = []
    former_residual_total = sum(r["valueUSD"] for r in result if r["previousResidual"])
    for sector in sorted({r["sector"] for r in result}):
        rs = [r for r in result if r["sector"] == sector]
        value = sum(r["valueUSD"] for r in rs)
        residual_value = sum(r["valueUSD"] for r in rs if r["previousResidual"])
        sectors.append(dict(sector=sector, valueUSD=value, percentOf13F=value/TOTAL*100,
                            residualValueUSD=residual_value, residualPercentOf13F=residual_value/TOTAL*100,
                            percentOfFormerResidual=residual_value/former_residual_total*100,
                            positions=len(rs), issuers=len({r["issuer"] for r in rs})))
    sectors.sort(key=lambda s: -s["valueUSD"])
    totals = {}
    residual = {}
    for status in ("nasdaq", "etf", "pending"):
        rs = [r for r in result if r["status"] == status]
        totals[status] = dict(positions=len(rs), issuers=len({r["issuer"] for r in rs}),
                              valueUSD=sum(r["valueUSD"] for r in rs), percentOf13F=sum(r["valueUSD"] for r in rs)/TOTAL*100)
        rr = [r for r in rs if r["previousResidual"]]
        residual[status] = dict(positions=len(rr), valueUSD=sum(r["valueUSD"] for r in rr),
                                percentOf13F=sum(r["valueUSD"] for r in rr)/TOTAL*100)
    return dict(schemaVersion="ensign-sector-review-v1.1", holdingsDate="2026-06-30", classificationConsultedAt=DATE,
                providerAsOf=nasdaq["data"].get("asOf"), totalValueUSD=TOTAL, positions=len(result),
                issuerCount=len(issuer_values), sourceAPI=API, provider="Nasdaq Stock Screener",
                classificationBasis="Rótulos literais Nasdaq traduzidos; não GICS ou setor oficial SEC. GE Aerospace excluída por conflito material de atividade, com rótulo bruto preservado.",
                identityBasis="Nome normalizado com colisões revisadas ou identidade manual documentada. Não é validação histórica de todo CUSIP/ticker.",
                noFundLookThrough=True, summary=totals, previousResidual=residual, sectors=sectors, holdings=result)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--holdings", type=Path, required=True)
    p.add_argument("--nasdaq", type=Path, required=True)
    p.add_argument("--reviews", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    args = p.parse_args()
    with args.holdings.open() as f:
        rows = list(csv.DictReader(f))
    review_data = json.loads(args.reviews.read_text())
    result = classify(rows, json.loads(args.nasdaq.read_text()), review_data["aliases"], review_data.get("pending"))
    result["sourceHashes"] = {"secCSV": hashlib.sha256(args.holdings.read_bytes()).hexdigest(),
                              "nasdaqSnapshot": hashlib.sha256(args.nasdaq.read_bytes()).hexdigest(),
                              "manualReviews": hashlib.sha256(args.reviews.read_bytes()).hexdigest()}
    result["normalizationRules"] = {"expansions": EXPANSIONS, "removedLegalTokens": sorted(LEGAL),
                                     "blockedAutomaticNames": sorted(BLOCKED_AUTOMATCH), "fuzzyAutoAccepted": False}
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output/"setores-2026-q2.json").write_text(json_text(result))
    with (args.output/"ensign-peak-2026-q2-setores.csv").open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(result["holdings"][0]), lineterminator="\n")
        writer.writeheader(); writer.writerows(result["holdings"])
    print(json.dumps({"summary": result["summary"], "previousResidual": result["previousResidual"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
