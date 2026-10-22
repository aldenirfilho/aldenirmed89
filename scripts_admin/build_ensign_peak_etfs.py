"""Reconcile researched ETF disclosures against immutable Ensign Peak 13F rows.

No network requests. Native taxonomies and dates remain separate by fund.
Usage: python3 scripts_admin/build_ensign_peak_etfs.py --research-dir PATH
       [--historical-dir PATH]
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import re
from collections import defaultdict
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORTAL = ROOT / "ecossistema/auditoria-religiosa-360"
DATA = PORTAL / "data"
TOTAL_13F = 60_816_389_385
TOTAL_ETF = 1_217_968_868
AS_OF = "2026-06-30"
CUTOFF = "2026-10-22"
RESEARCH_FILES = ("invesco_ssga.json", "ishares.json", "vanguard_avantis.json")
HISTORICAL_FILES = ("invesco_historical.json", "ssga_historical.json", "vanguard_avantis_historical.json")
GROUPS = {
    "equity": "Mandatos de ações",
    "loan_credit": "Crédito com empréstimos sêniores",
    "corporate_bonds": "Títulos de dívida corporativa",
    "government": "Títulos públicos ligados à inflação",
    "commodity": "Commodities e derivativos",
}
HISTORICAL_SEARCH_TICKERS = {
    "PBUS", "BKLN", "QQQM", "KBWB", "XLU", "XLY", "KRE", "SPYG", "SPYV", "SRLN",
    "VXF", "VWO", "VEA", "VTIP", "AVEM", "HGER",
}
TEMPORAL_LABELS = {
    "historical_same_date": "Componentes e categorias em 30/06",
    "partial_same_date": "Confirmação parcial em 30/06",
    "later_proxy": "Aproximação posterior",
}


def set_temporal_fields(fund: dict) -> None:
    """Date confirmation is field-specific; it never means complete coverage."""
    status = {}
    for field, date_key, rows_key in (("holdings", "holdingsAsOf", "topHoldings"),
                                       ("sectors", "sectorAsOf", "sectors")):
        date_value = fund.get(date_key)
        if date_value == AS_OF and fund.get(rows_key):
            status[field] = "same_date_documented"
        elif date_value and date_value > AS_OF:
            status[field] = "later_dated_proxy"
        else:
            status[field] = "not_confirmed"
    count = sum(value == "same_date_documented" for value in status.values())
    fund["fieldDateStatus"] = status
    fund["temporalStatus"] = ("historical_same_date" if count == 2 else
                               "partial_same_date" if count == 1 else "later_proxy")
    fund["temporalLabel"] = TEMPORAL_LABELS[fund["temporalStatus"]]


def temporal_summary(funds: list[dict]) -> dict:
    result = {}
    for prefix, predicate in (
        ("historical", lambda fund: fund["temporalStatus"] == "historical_same_date"),
        ("partial", lambda fund: fund["temporalStatus"] == "partial_same_date"),
        ("proxy", lambda fund: fund["temporalStatus"] == "later_proxy"),
        ("historicalHoldings", lambda fund: fund["fieldDateStatus"]["holdings"] == "same_date_documented"),
        ("historicalSectors", lambda fund: fund["fieldDateStatus"]["sectors"] == "same_date_documented"),
    ):
        members = [fund for fund in funds if predicate(fund)]
        result[prefix + "FundCount"] = len(members)
        result[prefix + "ValueUSD"] = sum(fund["ensignPeakValueUSD"] for fund in members)
        result[prefix + "PercentOfETFs"] = result[prefix + "ValueUSD"] / TOTAL_ETF * 100
    return result


def merge_historical_research(base_data: dict, documents: list[dict], positions: list[dict]) -> dict:
    """Accept dated primary findings; an unsuccessful search never erases a proxy."""
    funds = {fund["ticker"]: deepcopy(fund) for fund in base_data["funds"]}
    searches = {}
    for document in documents:
        for candidate in document["funds"]:
            ticker = candidate["ticker"]
            if ticker not in HISTORICAL_SEARCH_TICKERS or ticker in searches:
                raise ValueError(f"Unexpected/duplicate historical search: {ticker}")
            fund = funds[ticker]
            if candidate.get("cusip", fund["cusip"]) != fund["cusip"]:
                raise ValueError(f"Historical identity mismatch: {ticker}")
            if candidate.get("ensignPeakValueUSD", fund["ensignPeakValueUSD"]) != fund["ensignPeakValueUSD"]:
                raise ValueError(f"Historical 13F value mismatch: {ticker}")
            old_dates = {"holdingsAsOf": fund["holdingsAsOf"], "sectorAsOf": fund["sectorAsOf"]}
            confirmed_date = candidate.get("holdingsAsOf") == AS_OF or candidate.get("sectorAsOf") == AS_OF
            if candidate.get("applyOverride", confirmed_date) and confirmed_date:
                immutable = {key: fund[key] for key in ("cusip", "ticker", "ensignPeakValueUSD", "secLineNumber", "secIssuer", "secSecurityClass")}
                fund.update(deepcopy(candidate))
                for key, value in immutable.items():
                    if fund.get(key) != value:
                        raise ValueError(f"Historical finding changed {key}: {ticker}")
                if ticker in {"SPYG", "SPYV", "KRE", "XLU", "XLY", "SRLN"}:
                    fund["nativeSectorZeroThresholdPercent"] = 0.05
            if candidate.get("alternativeDatedDisclosure"):
                fund["alternativeDatedDisclosure"] = deepcopy(candidate["alternativeDatedDisclosure"])
            for limitation in candidate.get("limitationsToAppend", []):
                if limitation not in fund["limitations"]:
                    fund["limitations"].append(limitation)
            # An unsuccessful June lookup contributes evidence, never empty holdings.
            if not (candidate.get("applyOverride", confirmed_date) and confirmed_date):
                fund.setdefault("evidenceFiles", []).extend(deepcopy(candidate.get("evidenceFiles", [])))
            raw_search = deepcopy(candidate.get("historicalSearch", {}))
            if not raw_search:
                raw_search = {"targetAsOf": AS_OF, "result": candidate.get("historicalSearchStatus", "not_confirmed"),
                              "attempts": candidate.get("attempts", []), "sources": candidate.get("sources", [])}
            raw_search["previousDates"] = old_dates
            raw_search["evidenceFiles"] = deepcopy(candidate.get("evidenceFiles", []))
            searches[ticker] = raw_search
            fund.pop("historicalSearch", None)
            # Full encoded document-viewer URLs are transient locators, not needed in the public audit.
            for attempt in raw_search.get("attempts", []):
                attempt.pop("finalPDFURL", None)
            sanitize_evidence(raw_search)
            sanitize_evidence(fund)
    if set(searches) != HISTORICAL_SEARCH_TICKERS:
        raise ValueError(f"Historical search is incomplete: {HISTORICAL_SEARCH_TICKERS - set(searches)}")
    result = reconcile([{"funds": list(funds.values())}], positions)
    audit = []
    for fund in result["funds"]:
        ticker = fund["ticker"]
        if ticker not in searches:
            continue
        search = searches[ticker]
        sources = search.get("sources") or fund["holdingsSources"]
        if ticker in {"PBUS", "BKLN", "QQQM", "KBWB"}:
            sources = [source for source in sources if source.get("url", "").startswith("https://data.sec.gov/")] + [source for source in sources if "asOfDate=" in source.get("url", "")]
            sources = [{**source, "title": ("SEC — filings do trust consultados" if source["url"].startswith("https://data.sec.gov/") else "Invesco — pedido de junho retornou data de outubro")} for source in sources]
        holdings_ok = fund["fieldDateStatus"]["holdings"] == "same_date_documented"
        sectors_ok = fund["fieldDateStatus"]["sectors"] == "same_date_documented"
        if holdings_ok and sectors_ok:
            gap = "Data de junho confirmada nos dois campos; permanecem as bases, arredondamentos e limites do documento."
        elif holdings_ok:
            gap = "Componentes de junho confirmados; setores amplos ainda usam referência posterior. Não misturar as duas datas."
        elif sectors_ok:
            gap = "Categorias de junho confirmadas; componentes individuais de junho permanecem sem confirmação."
        else:
            gap = "Não se confirmou a composição exata de junho; a referência posterior foi preservada."
        if ticker == "BKLN":
            gap += " Setores de 31/05 aparecem em quadro separado, sem classificação de junho."
        audit.append({"ticker": ticker, "cusip": fund["cusip"], "targetAsOf": AS_OF,
                      "holdingsConfirmed": holdings_ok, "sectorsConfirmed": sectors_ok,
                      "holdingsAsOf": fund["holdingsAsOf"], "sectorsAsOf": fund["sectorAsOf"],
                      "result": fund["temporalStatus"], "gap": gap,
                      "sources": sources, "attempts": search.get("attempts", []),
                      "researchOutcome": search.get("result"),
                      "locatedFilings": search.get("locatedFilings", []),
                      "limitations": search.get("limitations", []),
                      "evidenceFiles": search.get("evidenceFiles", []),
                      "previousDates": search["previousDates"]})
    result["historicalSearchAudit"] = audit
    result["historicalSearchScope"] = {"originalEdition": "1.2", "targetAsOf": AS_OF, "fundCount": 16,
                                        "tickers": sorted(HISTORICAL_SEARCH_TICKERS)}
    return result


def numeric_json(value: object, *, compact: bool = False) -> str:
    """Equivalent JSON numbers avoid the editorial phone-number false positive."""
    text = json.dumps(value, ensure_ascii=False, indent=None if compact else 2,
                      separators=(",", ":") if compact else None, allow_nan=False)
    return re.sub(r'("[^"\n]*USD"\s*:\s*)(-?\d+(?:\.\d+)?)(?=[,}\s])',
                  lambda match: match[1] + match[2] + "e0", text)


def sanitize_evidence(fund: dict) -> None:
    for record in fund.get("evidenceFiles", []):
        if "path" in record:
            record["fileName"] = Path(record.pop("path")).name
    # Research metadata must never expose workstation locations.
    for value in walk(fund):
        if isinstance(value, str) and ("/Users/" in value or "/private/tmp/" in value):
            raise ValueError("Private path in public evidence metadata")


def walk(value):
    yield value
    if isinstance(value, dict):
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)


def mandate(ticker: str) -> str:
    if ticker == "HGER":
        return "commodity"
    if ticker == "VTIP":
        return "government"
    if ticker in {"BKLN", "SRLN"}:
        return "loan_credit"
    if ticker in {"HYG", "IGSB"}:
        return "corporate_bonds"
    return "equity"


def reconcile(research: list[dict], positions: list[dict]) -> dict:
    expected = {row["cusip"]: row for row in positions if row["status"] == "etf"}
    if len(expected) != 29 or sum(row["valueUSD"] for row in expected.values()) != TOTAL_ETF:
        raise ValueError("ETF perimeter changed; review original 13F before rebuilding")
    funds, seen = [], set()
    for document in research:
        for original in document["funds"]:
            fund = deepcopy(original)
            cusip = fund["cusip"]
            if cusip in seen or cusip not in expected:
                raise ValueError(f"Duplicate/unexpected CUSIP: {cusip}")
            seen.add(cusip)
            row = expected[cusip]
            if fund.get("ensignPeakValueUSD", row["valueUSD"]) != row["valueUSD"]:
                raise ValueError(f"13F value mismatch: {cusip}")
            fund.update({
                "ensignPeakValueUSD": int(row["valueUSD"]),
                "ensignPeakHoldingsAsOf": AS_OF,
                "secLineNumber": row["lineNumber"],
                "secIssuer": row["issuer"],
                "secSecurityClass": row["securityClass"],
                "percentOfETFs": row["valueUSD"] / TOTAL_ETF * 100,
                "percentOf13F": row["valueUSD"] / TOTAL_13F * 100,
                "mandateCategory": mandate(fund["ticker"]),
            })
            fund["mandateLabel"] = GROUPS[fund["mandateCategory"]]
            set_temporal_fields(fund)
            fund["reportedSectorWeightSumPercent"] = sum(
                item["weightPercent"] for item in fund.get("sectors", [])
            ) if fund.get("sectors") else None
            if fund["ticker"] == "HGER":
                fund["componentHeading"] = "Exposições a commodities; não são empresas"
            elif fund["ticker"] == "VTIP":
                fund["componentHeading"] = ("Principais títulos públicos ligados à inflação" if fund.get("topHoldings")
                                              else "Títulos públicos; títulos individuais não confirmados")
            elif fund["mandateCategory"] in {"loan_credit", "corporate_bonds"}:
                fund["componentHeading"] = "Principais linhas de dívida e caixa; não são ações"
            else:
                fund["componentHeading"] = "Maiores posições do ETF; classes separadas do mesmo emissor"
            sanitize_evidence(fund)
            funds.append(fund)
    if seen != set(expected):
        raise ValueError(f"Missing ETF identities: {set(expected) - seen}")
    funds.sort(key=lambda fund: -fund["ensignPeakValueUSD"])
    groups = []
    for key, label in GROUPS.items():
        members = [fund for fund in funds if fund["mandateCategory"] == key]
        value = sum(fund["ensignPeakValueUSD"] for fund in members)
        groups.append({"id": key, "label": label, "fundCount": len(members),
                       "valueUSD": value, "percentOfETFs": value / TOTAL_ETF * 100,
                       "percentOf13F": value / TOTAL_13F * 100})
    dataset = {"schemaVersion": "1.1", "edition": "1.3", "accessedAt": CUTOFF,
               "ensignPeakHoldingsAsOf": AS_OF, "total13FValueUSD": TOTAL_13F,
               "totalETFValueUSD": TOTAL_ETF, "fundCount": 29,
               "percentOf13F": TOTAL_ETF / TOTAL_13F * 100,
               "aggregationBasis": "Valor das cotas 13F por classe/mandato do veículo, não setores dos subjacentes.",
               "sectorAggregationPerformed": False,
               "indirectExposuresAddedToDirectPortfolio": False,
               **temporal_summary(funds),
               "groups": groups, "funds": funds,
               "secSource": "https://www.sec.gov/Archives/edgar/data/1454984/000145498426000004/xslForm13F_X02/13FQ22026FINAL.xml",
               "limitations": [
                   "O 13F confirma cotas dos veículos em 30/06/2026; não lista os seus subjacentes.",
                   "Composições posteriores são proxies temporais; não comprovam posições indiretas em junho nem posições atuais da Ensign Peak.",
                   "Datas de componentes e categorias são confirmadas separadamente. Uma confirmação parcial não torna o outro campo contemporâneo nem comprova cobertura integral do fundo.",
                   "Taxonomias de setores, indústrias, crédito e commodities são preservadas por fundo; não existe total setorial harmonizado dos 29 veículos.",
                   "Os maiores componentes são listas parciais por fundo. Não foi produzido ranking global de empresas com top10 truncados.",
                   "Valores de cotas não se somam aos subjacentes. Não foram reclassificadas posições do gráfico direto nem o patrimônio global da Igreja.",
                   "Peso setorial publicado pode excluir caixa, usar base diferente ou apresentar arredondamentos; somas não são normalizadas para 100%.",
               ]}
    validate_dataset(dataset)
    return dataset


def validate_dataset(data: dict) -> None:
    assert len(data["funds"]) == data["fundCount"] == 29
    assert len({fund["cusip"] for fund in data["funds"]}) == 29
    assert sum(fund["ensignPeakValueUSD"] for fund in data["funds"]) == TOTAL_ETF
    assert sum(group["valueUSD"] for group in data["groups"]) == TOTAL_ETF
    for fund in data["funds"]:
        assert fund["identitySources"] and fund["holdingsSources"]
        for key in ("holdingsAsOf", "sectorAsOf"):
            assert fund[key] is None or AS_OF <= fund[key] <= CUTOFF
        for source in fund["identitySources"] + fund["holdingsSources"]:
            assert source["url"].startswith("https://")
        for item in fund.get("sectors", []) + fund.get("topHoldings", []):
            if item.get("weightPercent") is not None:
                assert isinstance(item["weightPercent"], (int, float))
        if "fieldDateStatus" in fund:
            derived = deepcopy(fund)
            set_temporal_fields(derived)
            assert fund["fieldDateStatus"] == derived["fieldDateStatus"]
            assert fund["temporalStatus"] == derived["temporalStatus"]


def money(value: float) -> str:
    return "US$ " + f"{value:,.0f}".replace(",", ".")


def pct(value: float, decimals: int = 4) -> str:
    return f"{value:.{decimals}f}".replace(".", ",") + "%"


def native_table(rows: list[dict], caption: str, weight_label: str = "% do patrimônio líquido") -> str:
    esc = html.escape
    body = "".join(f'<tr><th scope="row">{esc(row["name"])}</th><td class="num">{pct(row["weightPercent"], 2)}</td></tr>' for row in rows)
    return (f'<div class="etf-table-region etf-small-table" role="region" tabindex="0" aria-label="{esc(caption)}">'
            f'<table><caption>{esc(caption)}</caption><thead><tr><th scope="col">Categoria original</th>'
            f'<th scope="col" class="num">{esc(weight_label)}</th></tr></thead><tbody>{body}</tbody></table></div>')


def render_historical_search(data: dict) -> str:
    records = data.get("historicalSearchAudit", [])
    if not records:
        return ""
    esc = html.escape
    rows = []
    for record in records:
        source_links = "<br>".join(f'<a href="{esc(source["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{esc(source["title"])}</a>' for source in record["sources"])
        fields = []
        for field in ("holdings", "sectors"):
            confirmed = record[field + "Confirmed"]
            field_date = record[field + "AsOf"]
            readable_date = "/".join(reversed(field_date.split("-"))) if field_date else "não confirmada"
            fields.append(f'<td>{"Confirmado em 30/06/2026" if confirmed else "Junho não confirmado"}<br><small class="muted">Data exibida: {readable_date}</small></td>')
        rows.append(f'<tr><th scope="row">{esc(record["ticker"])}</th>{"".join(fields)}<td class="small">{source_links}</td><td class="small">{esc(record["gap"])}</td></tr>')
    return f'''<details id="etf-historical-search" open><summary>Auditoria das 16 buscas por carteiras de junho</summary>
<p>Esta edição procurou a data exata de <strong>30/06/2026</strong> para os 16 fundos que antes usavam somente aproximações posteriores. Componentes e categorias são avaliados separadamente. “Confirmado” identifica a data do documento e os campos recuperados; não significa cobertura de todos os ativos ou padronização entre taxonomias.</p>
<div class="etf-table-region" role="region" aria-label="Resultado por campo das 16 buscas históricas" tabindex="0"><table><caption>Resultados com fontes primárias e lacunas; consulta em 22/10/2026. Quadro disponível sem JavaScript.</caption><thead><tr><th scope="col">Fundo</th><th scope="col">Componentes</th><th scope="col">Setores / categorias</th><th scope="col">Fontes / relatório</th><th scope="col">Limite remanescente</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div></details>'''


def render_bkln_may(data: dict) -> str:
    fund = next(fund for fund in data["funds"] if fund["ticker"] == "BKLN")
    alternative = fund.get("alternativeDatedDisclosure")
    if not alternative:
        return ""
    esc = html.escape
    blocks = "".join('<details><summary>' + esc(group["assetClass"]) + ' · ' + pct(group["assetClassWeightPercentOfNetAssets"], 2) + ' do patrimônio líquido</summary>' + native_table(group["sectors"], group["assetClass"] + " — 31/05/2026") + '</details>' for group in alternative["sectorBreakdowns"])
    sources = "".join(f'<li><a href="{esc(source["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{esc(source["title"])}</a> · conteúdo de 31/05/2026; consulta em 22/10/2026.</li>' for source in alternative["sources"])
    return f'''<details id="etf-bkln-maio" open><summary>BKLN: setores confirmados em 31/05/2026 — junho não confirmado</summary>
<div class="notice"><strong>Data anterior e base diferente:</strong> estes percentuais são do <strong>patrimônio líquido do BKLN em 31/05/2026</strong>. Não são percentuais do bloco de empréstimos nem da posição Ensign Peak em junho. Não os multiplicamos pelo valor das cotas de 30/06.</div>
<p>A <em>Schedule of Investments</em> oficial apresenta 30 categorias de empréstimos, que somam 93,14% do patrimônio líquido, e 17 categorias de bonds, que somam 3,79%. A pequena posição acionária aparece em quadro próprio. Os rótulos nativos diferem entre classes; mantemos tabelas separadas.</p>
{native_table(alternative["assetAllocation"], "BKLN: classes de ativos e ajuste do balanço — 31/05/2026")}
<p><strong>Reconciliação:</strong> investimentos brutos de <strong>106,04%</strong> ({money(alternative["totalInvestmentsValueUSD"])}) + outros ativos menos passivos de <strong>−6,04%</strong> ({money(alternative["otherAssetsLessLiabilitiesValueUSD"])}) = patrimônio líquido de <strong>100,00%</strong> ({money(alternative["netAssetsValueUSD"])}). Nada foi normalizado para forçar uma carteira bruta de 100%.</p>
{blocks}<p class="small muted">Os cabeçalhos de cada classe e suas somas foram conciliados com o relatório. O empréstimo não foi tratado como ação da empresa devedora. A composição exata de junho permanece em aberto.</p><ol class="etf-source-list">{sources}</ol></details>'''


def render_section(data: dict) -> str:
    esc = html.escape
    group_rows = "".join(
        f'<tr><th scope="row">{esc(group["label"])}<br><small class="muted">{group["fundCount"]} {"fundo" if group["fundCount"] == 1 else "fundos"}</small></th>'
        f'<td class="num">{money(group["valueUSD"])}</td><td class="num">{pct(group["percentOfETFs"])}</td>'
        f'<td class="num">{pct(group["percentOf13F"])}</td></tr>' for group in data["groups"])
    fund_rows = "".join(
        f'<tr><th scope="row" class="etf-name-cell"><button type="button" class="etf-open" data-etf="{esc(fund["ticker"])}">{esc(fund["ticker"])}</button><br>{esc(fund["name"])}<br><small>CUSIP {esc(fund["cusip"])}</small></th>'
        f'<td class="num">{money(fund["ensignPeakValueUSD"])}</td><td class="num">{pct(fund["percentOfETFs"])}</td><td class="num">{pct(fund["percentOf13F"])}</td><td>{esc(fund["mandateLabel"])}</td><td>{esc(fund["temporalLabel"])}</td></tr>' for fund in data["funds"])
    options = "".join(f'<option value="{esc(fund["ticker"])}">{esc(fund["ticker"] + " · " + fund["name"])}</option>' for fund in data["funds"])
    categories = "".join(f'<option value="{key}">{esc(label)}</option>' for key, label in GROUPS.items())
    return f'''<section class="section alt" id="etfs"><div class="wrap">
<span class="number">02B / DENTRO DOS FUNDOS · EDIÇÃO 1.3</span><h2>Os 2% em ETFs.<br>O que existe dentro deles?</h2>
<p class="lead etf-intro">As 29 cotas declaradas pela Ensign Peak somam <strong>{money(TOTAL_ETF)}</strong>: <strong>{pct(data["percentOf13F"])} do total 13F</strong>. Aqui se distingue o veículo comprado dos seus componentes, com a data e a fonte de cada fundo.</p>
<div class="etf-summary"><article class="card"><div class="metric">{data["historicalHoldingsFundCount"]}/29</div><h3>Componentes em 30/06</h3><p class="small muted">{pct(data["historicalHoldingsPercentOfETFs"],2)} do valor das cotas. Posições ou instrumentos recuperados com data de junho; não é porcentagem de todos os subjacentes cobertos.</p></article><article class="card"><div class="metric">{data["historicalSectorsFundCount"]}/29</div><h3>Categorias em 30/06</h3><p class="small muted">{pct(data["historicalSectorsPercentOfETFs"],2)} do valor das cotas. Setores, indústrias ou tipos de emissor/ativo, com bases originais separadas.</p></article><article class="card"><div class="metric">{data["historicalFundCount"]}/29</div><h3>Ambos os campos em junho</h3><p class="small muted">{pct(data["historicalPercentOfETFs"],2)} do valor das cotas. A confirmação da data não elimina limitações de cobertura ou diferenças entre taxonomias.</p></article><article class="card"><div class="metric">{data["partialFundCount"]} / {data["proxyFundCount"]}</div><h3>Parciais / sem campo de junho</h3><p class="small muted">{data["partialFundCount"]} com um campo confirmado em junho; {data["proxyFundCount"]} conservam referências posteriores nos dois campos.</p></article></div>
<div class="notice"><strong>Duas datas, duas perguntas:</strong> o 13F confirma quais cotas existiam em junho. A composição histórica do fundo permite olhar seus componentes naquela data; composições posteriores são apenas proxies. <strong>Não se acrescenta o valor dos componentes ao das cotas</strong>, nem se somam estes setores ao gráfico anterior.</div>
<h3 style="margin-top:32px">Como se distribui o valor das cotas</h3><p class="muted">Agrupamento editorial por classe/mandato do veículo. Não é uma soma dos setores das empresas: as taxonomias de ações, indústrias, crédito e commodities permanecem separadas por fundo.</p>
<div class="etf-table-region etf-mandates" role="region" aria-label="Valor das cotas por classe ou mandato" tabindex="0"><table><caption>Denominadores: ETFs = {money(TOTAL_ETF)}; 13F = {money(TOTAL_13F)}. Valores em 30/06/2026.</caption><thead><tr><th scope="col">Classe / mandato</th><th scope="col" class="num">Cotas no 13F</th><th scope="col" class="num">% dos ETFs</th><th scope="col" class="num">% do 13F</th></tr></thead><tbody>{group_rows}</tbody></table></div>
<p class="small muted">BKLN e SRLN são veículos de crédito com empréstimos sêniores; isso não significa 100% em empréstimos. HYG e IGSB possuem dívida corporativa. VTIP possui principalmente títulos públicos dos EUA ligados à inflação. HGER usa exposições a commodities e derivativos; não é uma carteira de mineradoras ou petroleiras.</p>
<div class="actions"><a class="button" href="data/etfs-ensign-peak-2026-q2.json" download>Dados completos e fontes · JSON</a><a class="button" href="data/etfs-ensign-peak-2026-q2-resumo.csv" download>Resumo dos 29 fundos · CSV</a><a class="button" href="#etf-historical-search">Auditoria das 16 buscas ↓</a><a class="button" href="#etf-bkln-maio">BKLN em maio ↓</a><a class="button" href="#etf-method">Método e lacunas ↓</a></div>
{render_historical_search(data)}
{render_bkln_may(data)}
<h3 style="margin-top:32px">Explore os 29 fundos</h3><div class="etf-tools"><div><label for="etf-search">Buscar nome, ticker ou CUSIP</label><input type="search" id="etf-search" placeholder="Ex.: IWM, empréstimos, 46138E461" autocomplete="off"></div><div><label for="etf-group">Classe / mandato</label><select id="etf-group"><option value="">Todos os mandatos</option>{categories}</select></div><div><label for="etf-timing">Data da composição</label><select id="etf-timing"><option value="">Todas as datas</option><option value="historical_same_date">Ambos os campos em junho</option><option value="partial_same_date">Confirmação parcial em junho</option><option value="later_proxy">Referências posteriores</option></select></div></div>
<p id="etf-count" class="small muted" role="status" aria-live="polite">29 fundos · {money(TOTAL_ETF)} em cotas.</p><div class="etf-table-region" role="region" aria-label="Os 29 ETFs da Ensign Peak" tabindex="0"><table><caption>Toque no ticker para abrir setores, componentes, datas, fontes e limitações. Pesos das cotas em 30/06/2026.</caption><thead><tr><th scope="col">Fundo</th><th scope="col" class="num">Cotas no 13F</th><th scope="col" class="num">% dos ETFs</th><th scope="col" class="num">% do 13F</th><th scope="col">Classe / mandato</th><th scope="col">Composição</th></tr></thead><tbody id="etf-fund-rows">{fund_rows}</tbody></table></div>
<div id="etf-selected" class="etf-selected"><div class="etf-picker"><label for="etf-picker">Fundo em detalhe</label><select id="etf-picker">{options}</select></div><div id="etf-detail"></div><noscript><p class="notice">A tabela de cotas está disponível acima. Para explorar cada composição nesta página, ative JavaScript; as fontes e todos os componentes também constam do JSON para download.</p></noscript></div>
<details id="etf-method"><summary>Método, cobertura e principais lacunas</summary><ol><li><strong>Perímetro imutável:</strong> 29 linhas classificadas como ETF no 13F, conciliadas por CUSIP e valor, somam {money(TOTAL_ETF)}. Nenhum valor ou setor do mapa de posições diretas foi alterado.</li><li><strong>Confirmação por campo:</strong> a data interna da fonte decide se componentes e categorias correspondem a 30/06. Há APIs históricas, relatórios financeiros oficiais e, no caso de VOO, tabela oficial recuperada pela extração indexada. A fonte exata aparece em cada fundo; não se atribuem todos os dados à mesma API.</li><li><strong>Taxonomias e bases:</strong> setores, indústrias, tipos de emissor e categorias de futuros permanecem separados. Pesos publicados e cálculos editoriais valor/NAV são identificados. NAV significa patrimônio líquido do fundo. Percentuais de outra base, como percentOfFunds, não são renomeados como percentuais do NAV.</li><li><strong>BKLN:</strong> a distribuição de devedores em junho permanece não confirmada. O quadro separado de 31/05 traz 30 categorias de empréstimos e 17 de bonds, sem converter maio em junho. “Corporate 100%” da API posterior continua sendo categoria ampla de crédito, sem setor econômico.</li><li><strong>Valor bruto e passivos:</strong> alguns relatórios têm investimentos acima de 100% do NAV e ajustes negativos de outros ativos/passivos. Esses pesos são preservados, sem normalização nem interpretação como uma carteira líquida de 100% em empresas.</li><li><strong>IJH e IJR:</strong> pesos de mercado e medidas nocionais são separados; há linhas sem peso de mercado. Soma próxima de 100% não demonstra cobertura total.</li><li><strong>Commodities e governo:</strong> HGER não é uma carteira de empresas; swaps, exposições e caução não são somados como alocação simples de capital. VTIP contém dívida pública ligada à inflação; a lista de títulos, quando confirmada, conserva sua própria data e base de peso.</li><li><strong>Limites:</strong> listas de dez maiores linhas são parciais e podem repetir emissores por classe ou título. Não há ranking global feito com listas truncadas, adição dos subjacentes às cotas ou mudança da nota de transparência de 31/100.</li><li><strong>Rastreabilidade:</strong> o quadro das 16 buscas e o JSON registram fontes, datas, resultados, lacunas e hashes. Corte em 22/10/2026, sem atualização ao vivo; PDFs integrais e caminhos privados não são republicados.</li></ol></details>
</div></section>'''


def install_view(data: dict) -> None:
    page = PORTAL / "dossie-igreja-mormon.html"
    text = page.read_text()
    section = render_section(data)
    if '<section class="section alt" id="etfs">' in text:
        text = re.sub(r'<section class="section alt" id="etfs">.*?</section>', lambda _: section, text, count=1, flags=re.S)
    else:
        text = text.replace('<section class="section" id="gestao">', section + '\n\n<section class="section" id="gestao">', 1)
    for identifier, tag, content in (
        ("etfs-styles", "style", (PORTAL / "etfs-ensign-peak.css").read_text()),
        ("etfs-data", 'script type="application/json"', numeric_json(data, compact=True)),
        ("etfs-ui", "script", (PORTAL / "etfs-ensign-peak.js").read_text()),
    ):
        element = tag.split()[0]
        markup = f'<{tag} id="{identifier}">\n{content}\n</{element}>'
        pattern = rf'<{element}[^>]*id="{identifier}"[^>]*>.*?</{element}>'
        if re.search(pattern, text, flags=re.S):
            text = re.sub(pattern, lambda _: markup, text, count=1, flags=re.S)
        else:
            marker = "</head>" if element == "style" else "</body>"
            text = text.replace(marker, markup + '\n' + marker, 1)
    if '<a href="#etfs">ETFs</a>' not in text:
        text = text.replace('<a href="#carteira">Investimentos</a>', '<a href="#carteira">Investimentos</a><a href="#etfs">ETFs</a>', 1)
    text = re.sub(r'pesquisa documental pública · edição 1\.[12]', 'pesquisa documental pública · edição 1.3', text, count=1)
    # Update visible descriptions, never the legacy compact holdings dataset.
    prefix, holdings = text.split('<script id="holdings-data"', 1)
    prefix = prefix.replace('Agrupamento editorial por instrumento, sem abrir os ativos de cada fundo.', 'Agrupamento editorial por instrumento. <a href="#etfs">Veja a composição pesquisada dos 29 ETFs ↓</a>')
    prefix = prefix.replace('corresponde a cotas de ETFs, separadas sem decompor seus ativos.', 'corresponde a cotas de ETFs, separadas neste gráfico de posições diretas. <a href="#etfs">Composição por fundo ↓</a>')
    prefix = prefix.replace('<h3>ETFs, sem decomposição</h3>', '<h3><a href="#etfs">ETFs no mapa direto ↓</a></h3>')
    prefix = prefix.replace('29 linhas · US$ 1.217.968.868. O setor do administrador não representa as exposições do fundo.', '29 linhas · US$ 1.217.968.868. Cotas não decompostas neste gráfico; a análise dos componentes está na seção ETFs.')
    prefix = prefix.replace('>ETFs — sem decomposição</span>', '>ETFs — cotas no mapa direto</span>')
    prefix = prefix.replace('>ETFs — sem decomposição</th>', '>ETFs — cotas no mapa direto</th>')
    prefix = prefix.replace('>ETFs — sem decomposição</option>', '>ETFs — cotas no mapa direto</option>')
    prefix = prefix.replace('>ETFs sem decomposição</option>', '>ETFs — detalhe na seção abaixo</option>')
    prefix = prefix.replace('Edição 1.1 · classificação ampliada em 22/10/2026.', 'Edição 1.2 · análise dos 29 ETFs em 22/10/2026. A classificação de posições diretas da edição 1.1 foi preservada. <a href="#etfs">ETFs: fontes, datas e limites ↓</a>')
    prefix = prefix.replace('Edição 1.2 · análise dos 29 ETFs em 22/10/2026.', 'Edição 1.3 · revisão histórica dos 29 ETFs em 22/10/2026.')
    page.write_text(prefix + '<script id="holdings-data"' + holdings)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--research-dir", required=True, type=Path)
    parser.add_argument("--historical-dir", type=Path, help="Notas estruturadas das 16 buscas por 30/06/2026")
    args = parser.parse_args()
    paths = [args.research_dir / filename for filename in RESEARCH_FILES]
    research = [json.loads(path.read_text()) for path in paths]
    positions = json.loads((DATA / "setores-2026-q2.json").read_text())["holdings"]
    data = reconcile(research, positions)
    historical_paths = [args.historical_dir / filename for filename in HISTORICAL_FILES] if args.historical_dir else []
    if historical_paths:
        historical = [json.loads(path.read_text()) for path in historical_paths]
        data = merge_historical_research(data, historical, positions)
    else:
        data["edition"] = "1.2"
    data["sourceHashes"] = {"secCSV": hashlib.sha256((DATA / "ensign-peak-2026-q2.csv").read_bytes()).hexdigest(),
        "researchInputs": [{"fileName": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()} for path in paths],
        "historicalResearchInputs": [{"fileName": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()} for path in historical_paths]}
    (DATA / "etfs-ensign-peak-2026-q2.json").write_text(numeric_json(data) + "\n")
    columns = ["ticker", "name", "cusip", "ensignPeakValueUSD", "percentOfETFs", "percentOf13F", "mandateCategory", "holdingsAsOf", "sectorAsOf", "temporalStatus", "sectorTaxonomy"]
    with (DATA / "etfs-ensign-peak-2026-q2-resumo.csv").open("w", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=columns, lineterminator="\n")
        writer.writeheader()
        writer.writerows({key: fund[key] for key in columns} for fund in data["funds"])
    install_view(data)
    print(json.dumps({"fundCount": len(data["funds"]), "historicalFundCount": data["historicalFundCount"], "partialFundCount": data["partialFundCount"], "proxyFundCount": data["proxyFundCount"], "totalETFValueUSD": TOTAL_ETF, "groups": data["groups"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
