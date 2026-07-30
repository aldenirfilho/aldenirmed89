"use strict";

(async () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const stripTags = (value) => String(value ?? "").replace(/<[^>]+>/g, "");

  let items = [];
  try {
    const response = await fetch("../data/mnemonicos.json");
    if (response.ok) items = (await response.json()).mnemonicos || [];
  } catch (_) {}

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))].sort();
  $("#category").insertAdjacentHTML("beforeend", categories.map((category) =>
    `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
  ).join(""));

  let trainMode = false;

  function lettersText(item) {
    return Object.entries(item.letters || {}).map(([letter, meaning]) => `${letter} ${stripTags(meaning)}`).join(" ");
  }

  function markdown(value) {
    return escapeHtml(value || "")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "</p><p>");
  }

  function card(item) {
    const letters = Object.entries(item.letters || {}).filter(([letter]) => !["letterSep", "sepText"].includes(letter));
    return `<article class="card${trainMode ? " train" : ""}" style="--card-color:${escapeHtml(item.color || "var(--accent)")}" data-id="${escapeHtml(item.id)}" role="listitem">
      <div class="category">${escapeHtml(item.category || "Clínica")}</div>
      <h2>${escapeHtml(item.emoji || "🧩")} ${escapeHtml(item.title)}</h2>
      <div class="letters">${letters.map(([letter, meaning]) =>
        `<div class="line" ${trainMode ? 'tabindex="0" role="button" aria-pressed="false"' : ""}>
          <span class="letter">${escapeHtml(letter)}</span><span class="meaning">${escapeHtml(stripTags(meaning))}</span>
        </div>`).join("")}</div>
      <div class="card-actions"><span class="tags">${escapeHtml((item.tags || []).slice(0, 3).join(" · "))}</span><button class="open" type="button">Ver revisão →</button></div>
    </article>`;
  }

  function render() {
    const query = $("#search").value.trim().toLowerCase();
    const category = $("#category").value;
    const filtered = items.filter((item) => {
      const haystack = [item.title, item.category, ...(item.tags || []), lettersText(item)].join(" ").toLowerCase();
      return (!category || item.category === category) && (!query || haystack.includes(query));
    });
    $("#grid").innerHTML = filtered.map(card).join("");
    $("#count").textContent = `${filtered.length} de ${items.length} mnemônicos`;
    $("#empty").hidden = filtered.length > 0;
  }

  $("#search").addEventListener("input", render);
  $("#category").addEventListener("change", render);
  $("#trainMode").addEventListener("click", () => {
    trainMode = !trainMode;
    $("#trainMode").setAttribute("aria-pressed", String(trainMode));
    render();
  });
  $("#grid").addEventListener("click", (event) => {
    const line = event.target.closest(".line");
    if (trainMode && line) {
      line.classList.toggle("revealed");
      line.setAttribute("aria-pressed", String(line.classList.contains("revealed")));
      return;
    }
    const cardElement = event.target.closest(".card");
    if (!cardElement || !event.target.closest(".open")) return;
    const item = items.find((candidate) => candidate.id === cardElement.dataset.id);
    if (!item) return;
    $("#readerBody").innerHTML = markdown(item.content);
    $("#reader").showModal();
  });
  $("#grid").addEventListener("keydown", (event) => {
    if (!trainMode || !event.target.classList.contains("line") || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    event.target.classList.toggle("revealed");
    event.target.setAttribute("aria-pressed", String(event.target.classList.contains("revealed")));
  });
  $("#closeReader").addEventListener("click", () => $("#reader").close());
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    $("#themeToggle").setAttribute("aria-pressed", String(next === "light"));
  });

  render();
})();
