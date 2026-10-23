/* Aprimoramento progressivo: as fichas completas já estão no HTML. */
(() => {
  "use strict";

  const root = document.querySelector("[data-agent-catalog]");
  const grid = document.getElementById("catalog-grid");
  if (!root || !grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-entry-id]"));
  const byId = new Map(cards.map((card) => [card.dataset.entryId, card]));
  const query = document.getElementById("catalog-search");
  const category = document.getElementById("filter-category");
  const type = document.getElementById("filter-type");
  const status = document.getElementById("filter-status");
  const order = document.getElementById("sort-order");
  const favoriteFilter = document.getElementById("filter-favorites");
  const resultCount = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");
  const more = document.getElementById("show-more");
  const pagination = document.getElementById("catalog-pagination");
  const paginationNote = document.getElementById("pagination-note");
  const favoriteNote = document.getElementById("favorites-note");
  const areaLinks = Array.from(document.querySelectorAll("[data-category-filter]"));
  if (![query, category, type, status, order, resultCount].every(Boolean)) return;

  const PAGE_SIZE = 30;
  const STORAGE_KEY = "360x:catalogo-agentes:favorite:v1";
  let visibleLimit = PAGE_SIZE;
  let favoritesOnly = false;
  let favorites = new Set();
  let persistentStorage = true;
  let printState = null;

  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();

  const searchable = new Map(cards.map((card) => [card,
    normalize(card.dataset.search || card.textContent)]));

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved)) {
      favorites = new Set(saved.filter((id) => typeof id === "string" && byId.has(id)));
    }
  } catch (_) {
    persistentStorage = false;
  }

  function updateFavoriteNote() {
    if (favoriteNote) {
      favoriteNote.textContent = persistentStorage
        ? "Seus favoritos ficam apenas neste navegador."
        : "Favoritos disponíveis nesta sessão; armazenamento local indisponível.";
    }
  }

  function persistFavorites() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    } catch (_) {
      persistentStorage = false;
    }
    updateFavoriteNote();
  }

  function updateFavoriteButtons() {
    cards.forEach((card) => {
      const button = card.querySelector("[data-favorite]");
      if (!button) return;
      const active = favorites.has(card.dataset.entryId);
      const name = card.dataset.name || "este item";
      const label = `${active ? "Remover" : "Adicionar"} ${name} ${active ? "dos" : "aos"} favoritos`;
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", label);
      button.title = label;
    });
    if (favoriteFilter) {
      favoriteFilter.setAttribute("aria-pressed", String(favoritesOnly));
      const count = favoriteFilter.querySelector("[data-favorite-count]");
      if (count) count.textContent = String(favorites.size);
    }
  }

  function matchingCards() {
    const words = normalize(query.value).split(" ").filter(Boolean);
    const selected = cards.filter((card) => {
      if (category.value && card.dataset.category !== category.value) return false;
      if (type.value && card.dataset.type !== type.value) return false;
      if (status.value && card.dataset.status !== status.value) return false;
      if (favoritesOnly && !favorites.has(card.dataset.entryId)) return false;
      return words.every((word) => searchable.get(card).includes(word));
    });
    if (order.value === "az") {
      selected.sort((a, b) => (a.dataset.name || "").localeCompare(
        b.dataset.name || "", "pt-BR", { sensitivity: "base", numeric: true }));
    } else {
      selected.sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    }
    return selected;
  }

  function applyFilters() {
    const matches = matchingCards();
    const selected = new Set(matches);
    const ordered = matches.concat(cards.filter((card) => !selected.has(card)));
    const fragment = document.createDocumentFragment();
    ordered.forEach((card) => fragment.appendChild(card));
    grid.appendChild(fragment);

    cards.forEach((card) => { card.hidden = true; });
    matches.slice(0, visibleLimit).forEach((card) => { card.hidden = false; });
    const shown = Math.min(visibleLimit, matches.length);
    const singular = matches.length === 1;
    resultCount.textContent = `${matches.length} ${singular ? "item encontrado" : "itens encontrados"}`
      + ` de ${cards.length} · ${shown} ${shown === 1 ? "exibido" : "exibidos"}`;
    if (emptyState) emptyState.hidden = matches.length !== 0;
    if (more) {
      more.hidden = shown >= matches.length;
      more.textContent = `Mostrar mais ${Math.min(PAGE_SIZE, matches.length - shown)}`;
    }
    if (pagination) pagination.hidden = matches.length === 0 || shown >= matches.length;
    if (paginationNote) paginationNote.textContent = `${shown} de ${matches.length} fichas nesta seleção`;
    areaLinks.forEach((link) => {
      if (link.dataset.categoryFilter === category.value && category.value) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    updateFavoriteButtons();
    return matches;
  }

  function clearFilters() {
    query.value = "";
    category.value = "";
    type.value = "";
    status.value = "";
    order.value = "catalogo";
    favoritesOnly = false;
    visibleLimit = PAGE_SIZE;
  }

  function reducedMotion() {
    return typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function revealEntry(id, shouldScroll = true) {
    const card = byId.get(id);
    if (!card) return false;
    clearFilters();
    const index = cards.indexOf(card);
    visibleLimit = Math.max(PAGE_SIZE, index + 1);
    applyFilters();
    const details = card.querySelector("details");
    if (details) details.open = true;
    cards.forEach((item) => item.classList.remove("is-highlighted"));
    card.classList.add("is-highlighted");
    if (shouldScroll) {
      window.requestAnimationFrame(() => card.scrollIntoView({
        block: "start", behavior: reducedMotion() ? "auto" : "smooth"
      }));
    }
    return true;
  }

  function revealHash(shouldScroll = true) {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch (_) { return false; }
    return revealEntry(id, shouldScroll);
  }

  [query, category, type, status, order].forEach((control) => {
    control.addEventListener(control === query ? "input" : "change", () => {
      visibleLimit = PAGE_SIZE;
      applyFilters();
    });
  });

  document.querySelectorAll("[data-clear-filters]").forEach((button) => {
    button.addEventListener("click", () => {
      clearFilters();
      applyFilters();
      query.focus({ preventScroll: true });
    });
  });

  if (favoriteFilter) favoriteFilter.addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    visibleLimit = PAGE_SIZE;
    applyFilters();
  });

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite]");
    if (!button) return;
    const card = button.closest("[data-entry-id]");
    if (!card) return;
    const id = card.dataset.entryId;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    persistFavorites();
    if (favoritesOnly) applyFilters();
    else updateFavoriteButtons();
  });

  areaLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.dataset.categoryFilter;
      if (!Array.from(category.options).some((option) => option.value === id)) return;
      event.preventDefault();
      clearFilters();
      category.value = id;
      applyFilters();
      document.getElementById("catalogo").scrollIntoView({
        block: "start", behavior: reducedMotion() ? "auto" : "smooth"
      });
    });
  });

  if (more) more.addEventListener("click", () => {
    const previousLimit = visibleLimit;
    visibleLimit += PAGE_SIZE;
    const matches = applyFilters();
    const firstNew = matches[previousLimit];
    if (firstNew) {
      const link = firstNew.querySelector(".card-title a");
      if (link) link.focus({ preventScroll: true });
    }
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    let id;
    try { id = decodeURIComponent(link.getAttribute("href").slice(1)); }
    catch (_) { return; }
    if (!byId.has(id)) return;
    if (window.location.hash === link.getAttribute("href")) {
      event.preventDefault();
      revealEntry(id);
    }
  });
  window.addEventListener("hashchange", () => revealHash(true));

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });
  window.addEventListener("beforeprint", () => {
    if (printState) return;
    printState = cards.map((card) => ({
      card, hidden: card.hidden, details: card.querySelector("details"),
      open: Boolean(card.querySelector("details")?.open)
    }));
    printState.forEach(({ card, details }) => {
      card.hidden = false;
      if (details) details.open = true;
    });
  });
  window.addEventListener("afterprint", () => {
    if (!printState) return;
    printState.forEach(({ card, hidden, details, open }) => {
      card.hidden = hidden;
      if (details) details.open = open;
    });
    printState = null;
  });

  updateFavoriteNote();
  document.documentElement.classList.add("has-js");
  applyFilters();
  revealHash(Boolean(window.location.hash));
})();
