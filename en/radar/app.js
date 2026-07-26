"use strict";

(() => {
  const radar = window.ANTIGRAVITY_RADAR_EN;
  const root = document.documentElement;
  const feed = document.querySelector("#radar-feed");
  const empty = document.querySelector("#empty-state");
  const count = document.querySelector("#result-count");
  const search = document.querySelector("#radar-search");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const viewButtons = [...document.querySelectorAll("[data-view]")];
  const allItems = [...radar.science, ...radar.healthAndSystems, ...radar.productivityPurchases]
    .sort((a, b) => b.date.localeCompare(a.date) || a.priority - b.priority || a.title.localeCompare(b.title));
  const visuals = new Map(radar.visualPairs.map(visual => [visual.itemId, visual]));
  const state = { section: "all", query: "", view: "auto" };

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const sectionLabel = section => ({
    scientific: "Clinical science",
    context: "Health & systems",
    commercial: "Productivity & purchases"
  })[section] || section;

  const longDate = value => new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
  }).format(new Date(`${value}T12:00:00Z`));

  const searchableText = item => [
    item.title, item.summary, item.why, item.caveat, item.topic, item.source,
    item.routineImpact, ...Object.values(item.evidence || {}),
    ...(item.commerce?.specs || []), ...Object.values(item.commerce || {})
  ].flat().join(" ").toLocaleLowerCase("en");

  function visualHTML(visual) {
    if (!visual) return "";
    return `
      <figure class="visual">
        <img class="visual-image wide" src="${escapeHTML(visual.wideFile)}" alt="${escapeHTML(visual.alt)}" loading="lazy" decoding="async">
        <img class="visual-image card" src="${escapeHTML(visual.cardFile)}" alt="${escapeHTML(visual.alt)}" loading="lazy" decoding="async">
        <figcaption>
          <span class="visual-title">${escapeHTML(visual.title)}</span>
          <span class="visual-caption">${escapeHTML(visual.caption)}</span>
          <span class="visual-note">Image text: Portuguese · English transcript below</span>
          <span class="transcript">${escapeHTML(visual.transcript)}</span>
        </figcaption>
      </figure>`;
  }

  function commercialHTML(item) {
    if (!item.commerce || !item.price) return "";
    const checked = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      timeZone: "America/Fortaleza", timeZoneName: "short"
    }).format(new Date(item.price.checkedAt));
    return `
      <section class="commercial-panel" aria-label="Product evaluation and price snapshot">
        <div class="price-line">
          <div><span class="eyebrow">Price snapshot</span><br><strong>${escapeHTML(item.price.display)}</strong> · ${escapeHTML(item.price.reference)}</div>
          <small>Checked ${escapeHTML(checked)}<br>${escapeHTML(item.price.availability)}</small>
        </div>
        <ul class="specs">${item.commerce.specs.map(spec => `<li>${escapeHTML(spec)}</li>`).join("")}</ul>
        <div class="commercial-grid">
          <div><strong>Useful for</strong><p>${escapeHTML(item.commerce.goodFor)}</p></div>
          <div><strong>How to use it</strong><p>${escapeHTML(item.commerce.howToUse)}</p></div>
          <div><strong>Possible benefit</strong><p>${escapeHTML(item.commerce.possibleBenefit)}</p></div>
          <div><strong>Worth considering if</strong><p>${escapeHTML(item.commerce.worthIf)}</p></div>
          <div><strong>Skip it if</strong><p>${escapeHTML(item.commerce.skipIf)}</p></div>
        </div>
        <p class="disclosure"><strong>Commercial disclosure:</strong> direct non-affiliate link. Price and stock are volatile. Compare seller, shipping, warranty, returns, and actual need before purchase.</p>
      </section>`;
  }

  function evidenceHTML(item) {
    const evidence = item.evidence || {};
    return `
      <details class="evidence">
        <summary>Open evidence and practical interpretation</summary>
        <div class="evidence-grid">
          <div><strong>Design</strong><p>${escapeHTML(evidence.design)}</p></div>
          <div><strong>Population / scope</strong><p>${escapeHTML(evidence.population)}</p></div>
          <div><strong>Main result</strong><p>${escapeHTML(evidence.mainResult)}</p></div>
          <div><strong>Practice today</strong><p>${escapeHTML(evidence.practice)}</p></div>
          <div><strong>Do not infer</strong><p>${escapeHTML(evidence.doNotInfer)}</p></div>
        </div>
      </details>`;
  }

  function storyHTML(item) {
    const visual = visuals.get(item.id);
    return `
      <article class="story ${visual ? "" : "no-visual"}" data-section="${escapeHTML(item.section)}">
        <div class="story-copy">
          <div class="story-meta">
            <span class="badge section">${escapeHTML(sectionLabel(item.section))}</span>
            <span class="badge">${escapeHTML(item.topic)}</span>
            <span class="badge">${escapeHTML(item.evidenceLevel)}</span>
            <span class="badge">${escapeHTML(item.access)}</span>
          </div>
          <h2>${escapeHTML(item.title)}</h2>
          <p class="summary">${escapeHTML(item.summary)}</p>
          <p class="why"><strong>Why it matters:</strong> ${escapeHTML(item.why)}</p>
          ${item.routineImpact ? `<p class="routine"><strong>Impact on clinical or study routine:</strong> ${escapeHTML(item.routineImpact)}</p>` : ""}
          <p class="caveat"><strong>Limit:</strong> ${escapeHTML(item.caveat)}</p>
          ${commercialHTML(item)}
          ${evidenceHTML(item)}
          <p class="source-link">
            <a class="button primary" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">Open primary / official source ↗</a>
          </p>
          <p class="muted"><small>Source published ${escapeHTML(longDate(item.date))} · Reference checked ${escapeHTML(radar.checkedAt)}</small></p>
        </div>
        ${visualHTML(visual)}
      </article>`;
  }

  function render() {
    const query = state.query.trim().toLocaleLowerCase("en");
    const visible = allItems.filter(item => {
      const sectionMatch = state.section === "all" || item.section === state.section;
      const queryMatch = !query || searchableText(item).includes(query);
      return sectionMatch && queryMatch;
    });
    const byDate = new Map();
    visible.forEach(item => {
      if (!byDate.has(item.date)) byDate.set(item.date, []);
      byDate.get(item.date).push(item);
    });
    feed.innerHTML = [...byDate.entries()].map(([date, items]) => `
      <section class="date-group" aria-labelledby="date-${date}">
        <h2 class="date-heading" id="date-${date}">${escapeHTML(longDate(date))}</h2>
        <div class="story-list">${items.map(storyHTML).join("")}</div>
      </section>`).join("");
    count.textContent = `${visible.length} of ${allItems.length} highlights`;
    empty.classList.toggle("visible", visible.length === 0);
  }

  filters.forEach(button => button.addEventListener("click", () => {
    state.section = button.dataset.filter;
    filters.forEach(candidate => candidate.setAttribute("aria-pressed", String(candidate === button)));
    render();
  }));

  viewButtons.forEach(button => button.addEventListener("click", () => {
    state.view = button.dataset.view;
    root.dataset.visualMode = state.view;
    viewButtons.forEach(candidate => candidate.setAttribute("aria-pressed", String(candidate === button)));
    try { localStorage.setItem("antigravity-radar-visual-mode", state.view); } catch (_) {}
  }));

  search.addEventListener("input", () => {
    state.query = search.value;
    render();
  });

  try {
    const storedView = localStorage.getItem("antigravity-radar-visual-mode");
    if (["auto", "wide", "card"].includes(storedView)) {
      state.view = storedView;
      root.dataset.visualMode = storedView;
      viewButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.view === storedView)));
    }
  } catch (_) {}

  document.querySelector("#science-count").textContent = radar.science.length;
  document.querySelector("#context-count").textContent = radar.healthAndSystems.length;
  document.querySelector("#commercial-count").textContent = radar.productivityPurchases.length;
  document.querySelector("#visual-count").textContent = radar.visualPairs.length;
  document.querySelector("#editorial-note").textContent = radar.editorialNote;
  document.querySelector("#clinical-disclaimer").textContent = radar.clinicalDisclaimer;
  render();
})();
