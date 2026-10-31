(function () {
  "use strict";

  const modeLabels = {
    publico: "Compra pública · base aplicável",
    pf20: "PF · ICMS 20%",
    pmvgCondicional: "PMVG · aplicação condicional"
  };
  const modeDescriptions = {
    publico: "Compra pública: PMVG quando CAP = Sim; PF quando CAP = Não. Foscarnet: valor histórico da ata informada. Isso não comprova o preço pago nem a disponibilidade atual.",
    pf20: "PF com ICMS de 20%: teto de referência da apresentação informada. Esta coluna não demonstra orçamento, contratação ou preço líquido negociado.",
    pmvgCondicional: "PMVG com desconto: para CAP = Não, a aplicação depende de hipótese legal específica, como aquisição judicial. Não representa desconto universal em toda compra pública."
  };
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const sortPt = new Intl.Collator("pt-BR", { sensitivity: "base" });

  function text(value) {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join("\n");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = text(content);
    return node;
  }

  function normalized(value) {
    return text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  }

  function safeHref(value, allowLocal) {
    const raw = text(value).trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, document.baseURI);
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
      if (allowLocal && url.protocol === "file:" && !/^[a-z][a-z0-9+.-]*:/i.test(raw) && !raw.startsWith("//")) return raw;
    } catch (_) {
      return null;
    }
    return null;
  }

  function makeLink(label, href, options) {
    const settings = options || {};
    const safe = safeHref(href, Boolean(settings.local));
    if (!safe) return element("span", settings.className, label);
    const link = element("a", settings.className, label);
    link.href = safe;
    if (settings.external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", text(label) + " (abre em nova aba)");
    }
    return link;
  }

  function sourceLabel(value) {
    try {
      const host = new URL(value, document.baseURI).hostname.replace(/^www\./, "");
      if (host === "pubmed.ncbi.nlm.nih.gov") return "PubMed";
      if (host === "pmc.ncbi.nlm.nih.gov") return "PubMed Central";
      if (host.endsWith("who.int")) return "OMS";
      if (host.endsWith("paho.org")) return "OPAS";
      if (host.endsWith("cdc.gov")) return "CDC";
      if (host.endsWith("fda.gov")) return "FDA";
      if (host === "idmp.ucsf.edu") return "UCSF";
      if (host === "dailymed.nlm.nih.gov") return "DailyMed";
      if (host === "clinicaltrials.gov") return "ClinicalTrials.gov";
      if (host.endsWith("gov.br")) return "Brasil · gov.br";
      return host;
    } catch (_) {
      return "Referência";
    }
  }

  function sourceBlock(values) {
    const block = element("div", "sources-block");
    block.append(element("p", "sources-title", "Fontes e documentos"));
    const urls = Array.isArray(values) ? values.filter(value => safeHref(value, false)) : [];
    if (!urls.length) {
      block.append(element("p", "cost-note", "Fonte não informada neste registro."));
      return block;
    }
    const list = element("ul", "source-list");
    urls.forEach((url, index) => {
      const item = element("li");
      const link = makeLink((index + 1) + " · " + sourceLabel(url) + " ↗", url, { className: "source-link", external: true });
      link.title = text(url);
      item.append(link);
      list.append(item);
    });
    block.append(list);
    return block;
  }

  function field(label, value, warning) {
    const row = element("div", warning ? "record-field field-warning" : "record-field");
    row.append(element("dt", "", label), element("dd", "", text(value) || "Não informado no acervo."));
    return row;
  }

  function profileCard(record, kind) {
    const article = element("article", "profile-card");
    const details = element("details", "card-disclosure");
    const summary = element("summary");
    const group = text(record.grupo) || "Grupo não informado";
    const badge = element("span", "group-badge", group);
    badge.dataset.group = group;
    const title = kind === "drug" ? record.farmaco : record.agente;
    summary.append(badge, element("h3", "", text(title) || "Registro sem título"), element("span", "card-hint", "Abrir ficha e fontes"));
    const body = element("div", "profile-body");
    const fields = element("dl", "record-fields");
    const definitions = kind === "drug" ? [
      ["Indicação e contexto", "indicacao"],
      ["Dose de referência", "dose"],
      ["Função renal e diálise", "renal"],
      ["Administração e infusão", "infusao"],
      ["Interações", "interacoes"],
      ["Monitorização", "monitorizacao"],
      ["Alertas e limites", "alertas", true]
    ] : [
      ["Perfil", "perfil"],
      ["Transmissão ou aquisição", "transmissao"],
      ["Manifestações", "manifestacoes"],
      ["Diagnóstico", "diagnostico"],
      ["Tratamento e suas condições", "tratamento"],
      ["Prevenção", "prevencao"],
      ["Limites da informação", "limites", true]
    ];
    definitions.forEach(definition => fields.append(field(definition[0], record[definition[1]], definition[2])));
    body.append(fields, sourceBlock(record.fontes));
    details.append(summary, body);
    article.append(details);
    return article;
  }

  function searchable(record) {
    return normalized(Object.entries(record).filter(entry => entry[0] !== "fontes").map(entry => text(entry[1])).join(" "));
  }

  function setupCatalog(prefix, records, kind) {
    const search = document.getElementById(prefix + "-search");
    const select = document.getElementById(prefix + "-group");
    const count = document.getElementById(prefix + "-count");
    const container = document.getElementById(prefix + "-results");
    const empty = document.getElementById(prefix + "-empty");
    const clear = document.getElementById(prefix + "-clear");
    const expand = document.getElementById(prefix + "-expand");
    const prepared = records.map(record => ({ record, index: searchable(record) }));
    const groups = Array.from(new Set(records.map(record => text(record.grupo)).filter(Boolean))).sort(sortPt.compare);
    groups.forEach(group => {
      const option = element("option", "", group);
      option.value = group;
      select.append(option);
    });

    function render() {
      const terms = normalized(search.value).split(/\s+/).filter(Boolean);
      const selected = select.value;
      const filtered = prepared.filter(item =>
        (!selected || text(item.record.grupo) === selected) &&
        terms.every(term => item.index.includes(term))
      );
      const fragment = document.createDocumentFragment();
      filtered.forEach(item => fragment.append(profileCard(item.record, kind)));
      container.replaceChildren(fragment);
      empty.hidden = filtered.length !== 0;
      count.textContent = filtered.length + " de " + records.length + (kind === "drug" ? " fármacos" : " perfis");
      expand.disabled = filtered.length === 0;
      expand.textContent = "Expandir resultados";
      expand.setAttribute("aria-label", "Expandir todos os " + filtered.length + " resultados desta seção");
    }

    search.addEventListener("input", render);
    select.addEventListener("change", render);
    clear.addEventListener("click", function () {
      search.value = "";
      select.value = "";
      render();
      search.focus();
    });
    expand.addEventListener("click", function () {
      const details = Array.from(container.querySelectorAll("details.card-disclosure"));
      const shouldOpen = details.some(detail => !detail.open);
      details.forEach(detail => { detail.open = shouldOpen; });
      expand.textContent = shouldOpen ? "Recolher resultados" : "Expandir resultados";
      expand.setAttribute("aria-label", (shouldOpen ? "Recolher" : "Expandir") + " todos os resultados desta seção");
    });
    container.addEventListener("toggle", function () {
      const details = Array.from(container.querySelectorAll("details.card-disclosure"));
      const allOpen = details.length > 0 && details.every(detail => detail.open);
      expand.textContent = allOpen ? "Recolher resultados" : "Expandir resultados";
    }, true);
    render();
  }

  function formatDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
    return match ? match[3] + "/" + match[2] + "/" + match[1] : text(value);
  }

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") return "Não disponível";
    const numeric = typeof value === "number" ? value : Number(text(value));
    return Number.isFinite(numeric) ? money.format(numeric) : "Não disponível";
  }

  function priceNode(value) {
    const label = formatMoney(value);
    return element("span", label === "Não disponível" ? "price-unavailable" : "price", label);
  }

  function capText(value) {
    if (value === true) return "Sim";
    if (value === false) return "Não";
    return text(value) || "Não informado";
  }

  function priceBasis(item, mode) {
    if (normalized([item.id, item.farmaco, item.marca]).includes("foscarnet")) return "Ata pública histórica · sem ICMS recalculado";
    if (mode === "pf20") return "PF · ICMS 20%";
    if (mode === "pmvgCondicional") return "PMVG · condicional";
    const cap = normalized(capText(item.capNovo));
    if (cap.startsWith("sim")) return "PMVG · CAP aplicável";
    if (cap.startsWith("nao")) return "PF · CAP não aplicável";
    return "Conforme fonte do acervo";
  }

  function tableCell(label, content) {
    const cell = element("td");
    cell.dataset.label = label;
    if (content instanceof Node) cell.append(content);
    else cell.textContent = text(content);
    return cell;
  }

  function setupCosts(costs) {
    const items = Array.isArray(costs.items) ? costs.items : [];
    const scenarios = Array.isArray(costs.scenarios) ? costs.scenarios : [];
    const byId = new Map(items.map(item => [text(item.id), item]));
    const select = document.getElementById("cost-mode");
    const description = document.getElementById("cost-mode-description");
    description.setAttribute("role", "status");
    description.setAttribute("aria-live", "polite");
    const model = document.getElementById("cost-model");
    if (text(costs.model)) {
      model.textContent = "Premissas dos cenários: " + text(costs.model);
      model.hidden = false;
    }
    const statusLabels = {
      PRECIFICADO_CMED: "Preço listado na CMED",
      PRECIFICADO_ARP_IMPORTACAO_2026: "Valor de ata pública · importação",
      NAO_LOCALIZADO: "Preço não localizado"
    };

    function render() {
      const mode = Object.prototype.hasOwnProperty.call(modeLabels, select.value) ? select.value : "publico";
      const body = document.createDocumentFragment();
      description.textContent = modeDescriptions[mode];

      items.forEach(item => {
        const row = element("tr");
        const name = element("div");
        name.append(element("strong", "cost-name", text(item.farmaco) || text(item.marca) || "Item sem nome"));
        if (text(item.marca) && item.marca !== item.farmaco) name.append(element("span", "cost-note", item.marca));
        name.append(element("span", "cost-note", "Unidade: " + (text(item.unidade) || "não informada")));
        const availability = element("div");
        availability.append(element("span", "", statusLabels[item.status] || text(item.status).replace(/_/g, " ") || "Status não informado"));
        if (text(item.disponibilidade)) availability.append(element("span", "cost-note", "Disponibilidade na fonte: " + text(item.disponibilidade)));
        const source = makeLink("Consultar ↗", item.fonte_url, { external: true });
        if (!safeHref(item.fonte_url, false)) source.textContent = "Não informada";
        row.append(
          tableCell("Medicamento", name),
          tableCell("CAP", capText(item.capNovo)),
          tableCell("Base de preço", priceBasis(item, mode)),
          tableCell("Valor unitário", priceNode(item.unit && item.unit[mode])),
          tableCell("Registro / disponibilidade", availability),
          tableCell("Fonte", source)
        );
        body.append(row);
      });
      document.getElementById("cost-items").replaceChildren(body);

      const cards = document.createDocumentFragment();
      scenarios.forEach(scenario => {
        const card = element("article", "scenario-card");
        card.append(element("h3", "", text(scenario.cenario) || "Cenário de consumo"));
        card.append(element("p", "scenario-period", "Período ilustrativo: " + (text(scenario.periodo) || "não informado")));
        const consumption = Array.isArray(scenario.consumo) ? scenario.consumo : [];
        const onlyPublicRecord = consumption.length > 0 && consumption.every(entry => {
          const item = byId.get(text(entry.id));
          return item && normalized([item.id, item.farmaco, item.marca]).includes("foscarnet");
        });
        const total = element("div", "scenario-total");
        total.append(element("span", "", onlyPublicRecord ? "Ata pública histórica" : modeLabels[mode]), priceNode(scenario.totals && scenario.totals[mode]));
        card.append(total);
        if (scenario.historic !== null && scenario.historic !== undefined && scenario.historic !== "") {
          card.append(element("p", "historic-total", "Valor histórico registrado: " + formatMoney(scenario.historic)));
        }
        if (consumption.length) {
          const details = element("details", "consumption-details");
          details.append(element("summary", "", "Ver consumo usado neste cenário"));
          const list = element("ul", "consumption-list");
          consumption.forEach(entry => {
            const item = byId.get(text(entry.id));
            const quantity = text(entry.unidades) || "Quantidade não informada";
            const unit = item ? text(item.unidade) || "unidade" : "unidade";
            const drug = item ? text(item.farmaco) || text(item.marca) || text(entry.id) : text(entry.id);
            list.append(element("li", "", quantity + " × " + unit + " — " + drug));
          });
          details.append(list);
          card.append(details);
        }
        cards.append(card);
      });
      document.getElementById("cost-scenarios").replaceChildren(cards);
      if (!items.length) {
        const row = element("tr");
        const cell = element("td", "price-unavailable", "Não há preços estruturados disponíveis neste carregamento.");
        cell.colSpan = 6;
        cell.dataset.label = "Registro";
        row.append(cell);
        document.getElementById("cost-items").append(row);
      }
    }

    select.value = "publico";
    select.addEventListener("change", render);
    render();
  }

  function renderArticles(articles, searches) {
    const fragment = document.createDocumentFragment();
    articles.forEach(article => {
      const card = element("article", "article-card");
      const tag = [text(article.grupo), text(article.ano)].filter(Boolean).join(" · ");
      if (tag) card.append(element("p", "eyebrow", tag));
      const title = element("h3");
      title.append(makeLink(text(article.titulo) || "Artigo sem título", article.url, { external: true }));
      card.append(title);
      if (text(article.achado)) {
        const finding = element("p");
        finding.append(element("strong", "", "Achado: "), document.createTextNode(text(article.achado)));
        card.append(finding);
      }
      if (text(article.limite)) {
        const limit = element("p", "article-limit");
        limit.append(element("strong", "", "Limite: "), document.createTextNode(text(article.limite)));
        card.append(limit);
      }
      fragment.append(card);
    });
    document.getElementById("article-results").replaceChildren(fragment);
    const searchList = document.createDocumentFragment();
    searches.forEach(search => {
      const item = element("li");
      item.append(makeLink((text(search.titulo) || "Abrir pesquisa") + " ↗", search.url, { external: true }));
      searchList.append(item);
    });
    document.getElementById("search-links").replaceChildren(searchList);
  }

  function renderReadings(readings) {
    const fragment = document.createDocumentFragment();
    readings.forEach(reading => {
      const card = element("article", "reading-card");
      card.append(element("h3", "", text(reading.title) || "Leitura do acervo"));
      if (text(reading.description)) card.append(element("p", "", reading.description));
      card.append(makeLink("Abrir leitura →", reading.href, { local: true, className: "text-link" }));
      fragment.append(card);
    });
    document.getElementById("reading-results").replaceChildren(fragment);
  }

  function init() {
    const catalog = window.INFECTOLOGIA_UTI;
    const valid = Boolean(catalog && typeof catalog === "object" && Array.isArray(catalog.pathogens) && Array.isArray(catalog.drugs));
    const data = valid ? catalog : {};
    const pathogens = Array.isArray(data.pathogens) ? data.pathogens : [];
    const drugs = Array.isArray(data.drugs) ? data.drugs : [];
    const articles = Array.isArray(data.articles) ? data.articles : [];
    const searches = Array.isArray(data.searches) ? data.searches : [];
    const readings = Array.isArray(data.readings) ? data.readings : [];
    const notes = Array.isArray(data.editorialNotes) ? data.editorialNotes : [];
    const meta = data.meta || {};
    document.getElementById("data-error").hidden = valid;
    document.getElementById("pathogen-total").textContent = String(pathogens.length);
    document.getElementById("drug-total").textContent = String(drugs.length);
    document.getElementById("article-total").textContent = String(articles.length);
    if (meta.publishedAt) document.getElementById("publication-date").textContent = formatDate(meta.publishedAt);
    if (Array.isArray(meta.evidenceCutoffs) && meta.evidenceCutoffs.length) {
      document.getElementById("evidence-dates").textContent = meta.evidenceCutoffs.map(formatDate).join(" e ");
    }
    const noteList = document.createDocumentFragment();
    notes.filter(note => text(note)).forEach(note => noteList.append(element("li", "", note)));
    document.getElementById("editorial-notes").replaceChildren(noteList);
    setupCatalog("pathogen", pathogens, "pathogen");
    setupCatalog("drug", drugs, "drug");
    setupCosts(data.costs || {});
    renderArticles(articles, searches);
    renderReadings(readings);
    document.getElementById("print-page").addEventListener("click", function () { window.print(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

