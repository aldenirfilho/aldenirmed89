"use strict";

(() => {
  const script = document.currentScript;
  const source = script?.dataset.source || "";
  const guideTitle = script?.dataset.title || "Guia Antigravity";
  const article = document.getElementById("guide");
  const toc = document.getElementById("toc");
  const progress = document.getElementById("readingProgress");
  const fontButton = document.getElementById("fontButton");
  const contrastButton = document.getElementById("contrastButton");
  const printButton = document.getElementById("printButton");
  const preferenceKey = "antigravity:guide-reader:v1";
  const tocLevels = new Set(
    String(script?.dataset.tocLevels || "2,3")
      .split(",")
      .map((level) => level.trim())
      .filter((level) => level === "2" || level === "3")
  );

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const safeUrl = (value) => {
    const url = String(value || "").trim();
    if (/^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "#";
      } catch (_) {
        return "#";
      }
    }
    if (
      !url ||
      url.startsWith("/") ||
      url.includes("\\") ||
      /^[a-z][a-z0-9+.-]*:/i.test(url) ||
      url.split("/").includes("..")
    ) {
      return "#";
    }
    return url;
  };

  const safeGuideSourceUrl = (value) => {
    try {
      const resolved = new URL(String(value || ""), window.location.href);
      const docsRoot = new URL("../", window.location.href);
      if (
        resolved.origin !== window.location.origin ||
        !resolved.pathname.startsWith(docsRoot.pathname)
      ) {
        return "#";
      }
      return resolved.href;
    } catch (_) {
      return "#";
    }
  };

  const inline = (value) => {
    let result = escapeHtml(value);
    result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
    result = result.replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, label, url) => {
        const href = escapeHtml(safeUrl(url));
        const external = /^https?:\/\//i.test(url)
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
        return `<a href="${href}"${external}>${label}</a>`;
      }
    );
    result = result
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    return result;
  };

  const slugify = (value) =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "secao";

  const isTableSeparator = (line) =>
    /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);

  function renderMarkdown(markdown) {
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const output = [];
    const usedIds = new Map();
    let listType = "";
    let inCode = false;
    let codeLanguage = "";
    let codeLines = [];

    const closeList = () => {
      if (!listType) return;
      output.push(`</${listType}>`);
      listType = "";
    };

    const uniqueId = (text) => {
      const base = slugify(text);
      const count = usedIds.get(base) || 0;
      usedIds.set(base, count + 1);
      return count ? `${base}-${count + 1}` : base;
    };

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const fence = line.match(/^\s*```([\w+-]*)\s*$/);
      if (fence) {
        closeList();
        if (!inCode) {
          inCode = true;
          codeLanguage = fence[1] || "";
          codeLines = [];
        } else {
          const languageClass = codeLanguage
            ? ` class="language-${escapeHtml(codeLanguage)}"`
            : "";
          output.push(
            `<pre><code${languageClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`
          );
          inCode = false;
          codeLanguage = "";
          codeLines = [];
        }
        continue;
      }
      if (inCode) {
        codeLines.push(line);
        continue;
      }

      if (
        line.includes("|") &&
        index + 1 < lines.length &&
        isTableSeparator(lines[index + 1])
      ) {
        closeList();
        const cells = (row) =>
          row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
        const header = cells(line);
        index += 2;
        const bodyRows = [];
        while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
          bodyRows.push(cells(lines[index]));
          index += 1;
        }
        index -= 1;
        output.push("<div class=\"table-wrap\"><table><thead><tr>");
        output.push(header.map((cell) => `<th>${inline(cell)}</th>`).join(""));
        output.push("</tr></thead><tbody>");
        output.push(
          bodyRows
            .map(
              (row) =>
                `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`
            )
            .join("")
        );
        output.push("</tbody></table></div>");
        continue;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        closeList();
        const level = heading[1].length;
        const id = uniqueId(heading[2]);
        output.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);
        continue;
      }
      if (/^\s*---+\s*$/.test(line)) {
        closeList();
        output.push("<hr>");
        continue;
      }
      const quote = line.match(/^\s*>\s?(.*)$/);
      if (quote) {
        closeList();
        output.push(`<blockquote>${inline(quote[1])}</blockquote>`);
        continue;
      }
      const unordered = line.match(/^\s*[-*]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        const desired = ordered ? "ol" : "ul";
        if (listType !== desired) {
          closeList();
          listType = desired;
          output.push(`<${desired}>`);
        }
        let item = (unordered || ordered)[1];
        item = item.replace(/^\[([ xX])\]\s*/, (_, checked) =>
          checked.toLowerCase() === "x" ? "☑️ " : "☐ "
        );
        output.push(`<li>${inline(item)}</li>`);
        continue;
      }
      if (!line.trim()) {
        closeList();
        continue;
      }

      closeList();
      const paragraph = [line.trim()];
      while (
        index + 1 < lines.length &&
        lines[index + 1].trim() &&
        !/^(#{1,3})\s+/.test(lines[index + 1]) &&
        !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[index + 1]) &&
        !/^\s*>/.test(lines[index + 1]) &&
        !/^\s*```/.test(lines[index + 1]) &&
        !(lines[index + 1].includes("|") &&
          index + 2 < lines.length &&
          isTableSeparator(lines[index + 2]))
      ) {
        paragraph.push(lines[index + 1].trim());
        index += 1;
      }
      output.push(`<p>${inline(paragraph.join(" "))}</p>`);
    }
    closeList();
    if (inCode) {
      output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    }
    return output.join("\n");
  }

  function buildToc() {
    const selector = [...tocLevels].map((level) => `h${level}`).join(", ") || "h2";
    const headings = article.querySelectorAll(selector);
    toc.replaceChildren();
    headings.forEach((heading) => {
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.dataset.level = heading.tagName === "H3" ? "3" : "2";
      toc.append(link);
    });
    if (!headings.length) {
      const note = document.createElement("span");
      note.className = "reader-note";
      note.textContent = "Este guia não possui seções adicionais.";
      toc.append(note);
    }
  }

  function loadPreferences() {
    let preferences = { size: 0, contrast: false };
    try {
      preferences = {
        ...preferences,
        ...JSON.parse(localStorage.getItem(preferenceKey) || "{}"),
      };
    } catch (_) {}
    const apply = () => {
      document.documentElement.classList.toggle("reader-large", preferences.size === 1);
      document.documentElement.classList.toggle("reader-xlarge", preferences.size === 2);
      document.documentElement.classList.toggle("reader-contrast", preferences.contrast);
      fontButton.textContent = ["Texto A", "Texto A+", "Texto A++"][preferences.size] || "Texto A";
      contrastButton.setAttribute("aria-pressed", String(preferences.contrast));
      try {
        localStorage.setItem(preferenceKey, JSON.stringify(preferences));
      } catch (_) {}
    };
    fontButton.addEventListener("click", () => {
      preferences.size = (Number(preferences.size) + 1) % 3;
      apply();
    });
    contrastButton.addEventListener("click", () => {
      preferences.contrast = !preferences.contrast;
      apply();
    });
    apply();
  }

  async function loadGuide() {
    document.title = `${guideTitle} · Antigravity Consultas`;
    try {
      const response = await fetch(source, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      article.innerHTML = renderMarkdown(markdown);
      article.setAttribute("aria-busy", "false");
      buildToc();
    } catch (error) {
      article.setAttribute("aria-busy", "false");
      article.replaceChildren();
      const panel = document.createElement("div");
      panel.className = "guide-error";
      const title = document.createElement("h1");
      title.textContent = "Não foi possível carregar este guia";
      const detail = document.createElement("p");
      detail.textContent = "A página principal continua disponível. Tente recarregar ou abra o arquivo original.";
      const link = document.createElement("a");
      link.href = safeGuideSourceUrl(source);
      link.textContent = "Abrir versão Markdown";
      panel.append(title, detail, link);
      article.append(panel);
      console.error("Falha ao carregar guia:", error);
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.width = `${Math.round(ratio * 100)}%`;
    },
    { passive: true }
  );
  printButton.addEventListener("click", () => window.print());
  loadPreferences();
  loadGuide();
})();
