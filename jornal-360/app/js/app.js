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
  // ---------- ⭐ meus destaques (guardados só no aparelho) ----------
  function meus() { try { return JSON.parse(ler("j360_destaques", "[]")) || []; } catch (e) { return []; } }
  function salvarMeus(l) { gravar("j360_destaques", JSON.stringify(l.slice(0, 300))); }
  function chave(ed, item) { return ed.date + "|" + item.texto; }
  function marcado(k) { return meus().some(function (m) { return m.k === k; }); }
  function alternar(ed, item, btn) {
    var k = chave(ed, item), l = meus(), i = -1;
    l.forEach(function (m, n) { if (m.k === k) i = n; });
    if (i >= 0) { l.splice(i, 1); } else { l.unshift({ k: k, data: ed.date, label: ed.label, tipo: item.tipo, texto: item.texto, link: ed.html || ed.pdf }); }
    salvarMeus(l); estrela(btn, i < 0); mostrarMeus();
  }
  function estrela(btn, on) { btn.textContent = on ? "⭐" : "☆"; btn.setAttribute("aria-pressed", String(on)); btn.setAttribute("aria-label", on ? "Remover dos meus destaques" : "Guardar nos meus destaques"); }
  function preencher(id, itens, ed) {
    var ul = document.getElementById(id); ul.innerHTML = "";
    itens.forEach(function (item) {
      var li = document.createElement("li"), b = document.createElement("button"), sp = document.createElement("span");
      b.type = "button"; b.className = "estrela"; estrela(b, marcado(chave(ed, item)));
      b.addEventListener("click", function () { alternar(ed, item, b); });
      sp.innerHTML = (item.tipo !== "📰" ? "<b>" + esc(item.tipo) + "</b> " : "") + esc(item.texto);
      li.appendChild(b); li.appendChild(sp); ul.appendChild(li);
    });
  }
  function mostrarMeus() {
    var l = meus(), ul = document.getElementById("listaMeus"); ul.innerHTML = "";
    l.forEach(function (m) {
      var li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.className = "estrela"; estrela(b, true);
      b.addEventListener("click", function () {
        salvarMeus(meus().filter(function (x) { return x.k !== m.k; })); mostrarMeus();
        document.querySelectorAll(".marcaveis .estrela").forEach(function (e) { if (e.parentNode.textContent.indexOf(m.texto) >= 0) estrela(e, false); });
      });
      var sp = document.createElement("span");
      sp.innerHTML = '<small>' + esc(m.data.split("-").reverse().join("/")) + " · " + esc(m.tipo) + '</small><br>' + esc(m.texto) +
        (m.link ? ' <a href="' + esc(m.link) + '">abrir edição</a>' : "");
      li.appendChild(b); li.appendChild(sp); ul.appendChild(li);
    });
    document.getElementById("meusVazio").hidden = l.length > 0;
    document.getElementById("acoesMeus").hidden = l.length === 0;
    document.getElementById("contaMeus").textContent = l.length ? "(" + l.length + ")" : "";
  }
  document.getElementById("btnCopiarMeus").addEventListener("click", function () {
    var txt = "⭐ Meus destaques · Jornal Diário 360\n\n" + meus().map(function (m) { return "• " + m.data.split("-").reverse().join("/") + " · " + m.tipo + ": " + m.texto; }).join("\n");
    try { navigator.clipboard.writeText(txt).then(function () { alert("Destaques copiados."); }); } catch (e) { prompt("Copie:", txt); }
  });
  document.getElementById("btnLimparMeus").addEventListener("click", function () {
    if (confirm("Apagar todos os seus destaques deste aparelho?")) { salvarMeus([]); mostrarMeus(); document.querySelectorAll(".marcaveis .estrela").forEach(function (e) { estrela(e, false); }); }
  });
  mostrarMeus();

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
    preencher("listaDestaques", (atual.highlights || []).map(function (t) { return { tipo: "📰", texto: t }; }), atual);
    document.getElementById("sessenta").hidden = !(atual.highlights || []).length;
    preencher("listaPilulas", (atual.pills || []).map(function (p) { return { tipo: p.icon + " " + p.area, texto: p.text }; }), atual);
    document.getElementById("pilulas").hidden = !(atual.pills || []).length;
    if (atual.humanitarian) { document.getElementById("linkHumanitario").href = atual.humanitarian; }
    document.getElementById("humanitario").hidden = !atual.humanitarian;
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
