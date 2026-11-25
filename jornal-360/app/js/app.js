/* Jornal Diário 360 — lógica do app (sem dependências, sem rastreamento). */
(function () {
  "use strict";
  var CFG = window.J360_CONFIG || { links: {} };
  var nativo = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  // ---------- preferências de leitura (guardadas no aparelho) ----------
  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v === null ? padrao : v; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* modo privado: ignora */ } }
  var tam = parseInt(ler("j360_tam", "17"), 10);
  function aplicar() {
    document.documentElement.style.setProperty("--tam", tam + "px");
    document.body.classList.toggle("semDislexia", ler("j360_dislexia", "1") !== "1");
    document.body.classList.toggle("claro", ler("j360_claro", "0") === "1");
    document.getElementById("optDislexia").checked = ler("j360_dislexia", "1") === "1";
    document.getElementById("optClaro").checked = ler("j360_claro", "0") === "1";
  }
  document.getElementById("btnAjustes").addEventListener("click", function () {
    var p = document.getElementById("ajustes"); p.hidden = !p.hidden; this.setAttribute("aria-expanded", String(!p.hidden));
  });
  document.getElementById("optDislexia").addEventListener("change", function () { gravar("j360_dislexia", this.checked ? "1" : "0"); aplicar(); });
  document.getElementById("optClaro").addEventListener("change", function () { gravar("j360_claro", this.checked ? "1" : "0"); aplicar(); });
  document.getElementById("fonteMenos").addEventListener("click", function () { tam = Math.max(14, tam - 1); gravar("j360_tam", tam); aplicar(); });
  document.getElementById("fonteMais").addEventListener("click", function () { tam = Math.min(24, tam + 1); gravar("j360_tam", tam); aplicar(); });
  aplicar();

  // ---------- apoio (links do config.js) ----------
  // Nas versões de loja (Android/iOS nativos) a área de pagamento fica oculta,
  // para respeitar as regras de cobrança da Google Play e da App Store.
  if (nativo) { document.getElementById("apoie").hidden = true; }
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = (CFG.links || {})[a.getAttribute("data-link")];
    if (url) { a.href = url; } else { a.setAttribute("aria-disabled", "true"); a.textContent = "Em breve"; }
  });
  if (CFG.portalCliente) { document.getElementById("notaPortal").hidden = false; document.getElementById("linkPortal").href = CFG.portalCliente; }
  if (CFG.contato) { document.getElementById("contato").innerHTML = '<a href="mailto:' + CFG.contato + '">Contato</a>'; }

  // ---------- edições ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function compartilhar(ed) {
    var base = CFG.urlPublica || location.href.split("?")[0];
    var dados = { title: "Jornal Diário 360 · " + ed.label, text: ed.title, url: base + "?ed=" + ed.date + "&origem=compartilhar" };
    if (navigator.share) { navigator.share(dados).catch(function () {}); }
    else { try { navigator.clipboard.writeText(dados.url); alert("Link copiado."); } catch (e) { prompt("Copie o link:", dados.url); } }
  }
  fetch("editions.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    var eds = d.editions || [];
    if (!eds.length) return;
    var pedida = new URLSearchParams(location.search).get("ed");
    var atual = eds.filter(function (e) { return e.date === pedida; })[0] || eds[0];
    var h = document.getElementById("hoje");
    h.innerHTML =
      '<img src="' + esc(atual.cover) + '" alt="Capa da edição de ' + esc(atual.label) + '">' +
      '<div><div class="data">Edição nº ' + String(atual.number).padStart(3, "0") + " · " + esc(atual.label) + "</div>" +
      "<h1>" + esc(atual.title) + "</h1>" +
      '<div class="meta">' + atual.pages + " páginas · fonte " + esc(atual.font) + "</div>" +
      '<div class="acoes">' + (atual.html ? '<a class="botao" href="' + esc(atual.html) + '">📱 Ler no celular</a>' : '') + '<a class="botao' + (atual.html ? ' sec' : '') + '" href="' + esc(atual.pdf) + '" target="_blank" rel="noopener">📖 PDF</a>' +
      (nativo ? "" : '<a class="botao sec" href="' + esc(atual.pdf) + '" download>⬇️ Baixar</a>') +
      '<button class="botao sec" id="btnComp">🔗 Compartilhar</button></div></div>';
    document.getElementById("btnComp").addEventListener("click", function () { compartilhar(atual); });
    var ul = document.getElementById("listaDestaques"); ul.innerHTML = "";
    (atual.highlights || []).forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    document.getElementById("sessenta").hidden = !(atual.highlights || []).length;
    var g = document.getElementById("gradeAcervo"); g.innerHTML = "";
    eds.forEach(function (e) {
      var a = document.createElement("a"); a.className = "ed"; a.href = e.html ? e.html : e.pdf;
      a.innerHTML = '<img loading="lazy" src="' + esc(e.cover) + '" alt=""><b>' + e.date.split("-").reverse().join("/") + "</b>" + esc(e.title);
      g.appendChild(a);
    });
  }).catch(function () {
    document.getElementById("hoje").innerHTML = '<div class="carregando">Sem conexão. As edições já abertas continuam disponíveis no aparelho.</div>';
  });

  // ---------- instalação ----------
  var adiado = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); adiado = e; document.getElementById("btnInstalar").hidden = false; });
  document.getElementById("btnInstalar").addEventListener("click", function () { if (adiado) { adiado.prompt(); adiado = null; this.hidden = true; } });
  if (nativo) { document.getElementById("instalar").hidden = true; }
  if ("serviceWorker" in navigator && location.protocol !== "file:") { navigator.serviceWorker.register("sw.js").catch(function () {}); }
})();
