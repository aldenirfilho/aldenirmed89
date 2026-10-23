"use strict";
(() => {
  const byId = (id) => document.getElementById(id);
  const fold = (text) => String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const entries = [...document.querySelectorAll("[data-kind]")];
  const roots = [...document.querySelectorAll("[data-root-group]")];
  const datasets = [...document.querySelectorAll("[data-section]")];
  const search = byId("panelSearch"), kind = byId("panelKind"), root = byId("panelRoot");
  const searchText = new Map(entries.map((entry) => [entry, fold(entry.textContent)]));
  function render() {
    const query = fold(search.value.trim());
    root.disabled = kind.value === "sites" || kind.value === "repositories";
    let count = 0;
    entries.forEach((entry) => {
      const show = (kind.value === "all" || entry.dataset.kind === kind.value) &&
        (root.disabled || root.value === "all" || entry.dataset.root === root.value) &&
        (!query || searchText.get(entry).includes(query));
      entry.hidden = !show;
      if (show) count += 1;
    });
    roots.forEach((group) => { group.hidden = !group.querySelector("[data-kind]:not([hidden])"); });
    datasets.forEach((section) => { section.hidden = !section.querySelector("[data-kind]:not([hidden])"); });
    byId("panelStatus").textContent = `${count} de ${entries.length} registros exibidos.`;
    byId("panelEmpty").hidden = count !== 0;
  }
  byId("panelFilters").addEventListener("submit", (event) => event.preventDefault());
  search.addEventListener("input", render);
  kind.addEventListener("change", render);
  root.addEventListener("change", render);
  byId("panelClear").addEventListener("click", () => {
    search.value = ""; kind.value = "all"; root.value = "all"; render(); search.focus();
  });
  document.querySelectorAll(".jump a").forEach((anchor) => anchor.addEventListener("click", () => {
    kind.value = "all"; root.value = "all"; search.value = ""; render();
  }));
  render();
})();
