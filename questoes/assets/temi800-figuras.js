/* TEMI 800 — gerador de figuras didáticas (SVG inline, sem dependências).
   Esquemas autorais para estudo: não são imagens de pacientes reais. */
(function (root) {
  "use strict";
  const W = 800;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const num = v => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : null; };
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const g = (t, a, mu, sd) => a * Math.exp(-((t - mu) ** 2) / (2 * sd * sd));
  const box = (t, a, b, e) => 1 / (1 + Math.exp(-(t - a) / e)) - 1 / (1 + Math.exp(-(t - b) / e));
  const svgOpen = (h, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" role="img" class="t8fig"><rect width="${W}" height="${h}" rx="14" fill="${bg}"/>`;
  const label = (x, y, txt, fill = "#cfe3f5", size = 13, weight = 600, anchor = "start") => `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="Inter,Arial,sans-serif">${esc(txt)}</text>`;
  const path = (pts, stroke, w = 1.6, extra = "") => `<polyline fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra} points="${pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}"/>`;
  const stamp = (h, txt = "Esquema didático · não é imagem real") => label(W - 14, h - 10, txt, "#8aa0b8", 10, 500, "end");

  /* ───────────────────────── ECG ───────────────────────── */
  function beat(tt, m) {
    const w = m.w || 1;
    let v = 0;
    if (m.delta) v += g(tt, m.delta, -0.045, 0.022);
    v += g(tt, m.q ?? -0.06, -0.02 * w, 0.007 * w);
    v += g(tt, m.r ?? 1, 0, 0.0085 * w);
    if (m.r2) v += g(tt, m.r2, 0.04 * w, 0.009 * w);
    v += g(tt, m.s ?? -0.2, 0.022 * w, 0.009 * w);
    if (m.j) v += g(tt, m.j, 0.03 * w + 0.01, 0.012);
    if (m.st) v += m.st * box(tt, 0.03 * w, 0.2 + 0.03 * w + (m.qt || 0), 0.012);
    const tc = 0.25 + 0.03 * (w - 1) + (m.qt || 0);
    v += g(tt, m.t ?? 0.3, tc, m.tw || 0.045);
    if (m.u) v += g(tt, m.u, tc + 0.16, 0.04);
    return v;
  }
  function pw(tt, a) { return g(tt, a, 0, 0.022); }
  // Constrói séries temporais (mV) para uma derivação a partir de um ritmo.
  function rhythm(key, dur, lead, r, opt = {}) {
    const fs = 250, n = Math.round(dur * fs), out = new Float64Array(n);
    const L = Object.assign({p: 0.15, r: 1.0, s: -0.2, q: -0.06, t: 0.3}, lead || {});
    const beats = [], ps = [];
    let hr = opt.fc ? num(opt.fc) : null;
    const reg = (rate, m, pr = 0.16) => { const rr = 60 / rate; for (let t = 0.35 + r() * 0.2; t < dur + 0.5; t += rr * (0.98 + r() * 0.04)) { beats.push([t, m]); if (pr) ps.push([t - pr, L.p]); } };
    const irr = (lo, hi, m) => { for (let t = 0.3; t < dur + 0.5; t += lo + r() * (hi - lo)) beats.push([t, m]); };
    let base = () => 0;
    switch (key) {
      case "taqui_sinusal": reg(hr || 122, L); break;
      case "bradi_sinusal": reg(hr || 44, L); break;
      case "fa": irr(0.5, 1.05, Object.assign({}, L, {p: 0})); base = t => 0.035 * Math.sin(2 * Math.PI * 6.3 * t) + 0.025 * Math.sin(2 * Math.PI * 4.7 * t + 1.3); break;
      case "fa_rvr": irr(0.33, 0.55, Object.assign({}, L, {p: 0})); base = t => 0.04 * Math.sin(2 * Math.PI * 6.1 * t) + 0.03 * Math.sin(2 * Math.PI * 5.2 * t + 2); break;
      case "flutter": { reg(150, Object.assign({}, L, {p: 0}), 0); base = t => { const ph = (t * 5) % 1; return -0.3 * (ph < 0.75 ? ph / 0.75 : (1 - ph) / 0.25) + 0.15; }; break; }
      case "tsv": reg(hr || 182, Object.assign({}, L, {p: 0, t: L.t * 0.7}), 0); break;
      case "tv": reg(hr || 172, {r: 1.3, q: -0.1, s: -0.5, t: -0.55, w: 3.2, tw: 0.06}, 0); break;
      case "aesp": reg(hr || 38, {r: 0.6, q: -0.05, s: -0.35, t: 0.2, w: 2.4, tw: 0.07}, 0); break;
      case "bav1": reg(hr || 68, L, 0.33); break;
      case "mobitz1": { const pp = 0.78; let k = 0, pr = 0.18; for (let t = 0.3; t < dur + 0.5; t += pp) { ps.push([t, L.p]); if (k === 3) { k = 0; pr = 0.18; continue; } beats.push([t + pr, L]); pr += [0.1, 0.05][k] || 0.03; k++; } break; }
      case "mobitz2": { const pp = 0.78; let k = 0; for (let t = 0.3; t < dur + 0.5; t += pp) { ps.push([t, L.p]); k++; if (k % 4 === 0) continue; beats.push([t + 0.18, Object.assign({}, L, {w: 1.6})]); } break; }
      case "bavt": { for (let t = 0.2; t < dur + 0.5; t += 0.72) ps.push([t, L.p]); for (let t = 0.6; t < dur + 0.5; t += 1.7) beats.push([t, {r: 0.9, q: -0.08, s: -0.4, t: -0.35, w: 2.6, tw: 0.07}]); break; }
      case "hiperk": reg(hr || 76, Object.assign({}, L, {p: 0.05, t: 0.85, tw: 0.028, w: 1.6})); break;
      case "hipok": reg(hr || 82, Object.assign({}, L, {t: 0.06, st: -0.07, u: 0.22})); break;
      case "qt_longo": reg(hr || 58, Object.assign({}, L, {qt: 0.2, tw: 0.07})); break;
      case "osborn": reg(hr || 42, Object.assign({}, L, {j: 0.45})); base = t => 0.012 * Math.sin(2 * Math.PI * 9 * t); break;
      case "wpw": reg(hr || 74, Object.assign({}, L, {delta: 0.35, w: 1.5}), 0.09); break;
      case "fa_preexcitada": { for (let t = 0.3; t < dur + 0.5; t += 0.24 + r() * 0.22) beats.push([t, {r: 1.1 + r() * 0.5, delta: 0.4, q: 0, s: -0.3, t: -0.3, w: 2 + r() * 1.3}]); break; }
      case "marcapasso_ok": case "marcapasso_falha": {
        const fail = key === "marcapasso_falha";
        let i = 0; for (let t = 0.4; t < dur + 0.5; t += 0.86) { ps.push([t, 0, "spike"]); i++; if (!fail || i % 2 === 1) beats.push([t + 0.04, {r: -0.2, q: 0, s: -1.1, t: 0.45, w: 2.8, tw: 0.07}]); }
        if (fail) base = t => 0; break;
      }
      case "torsades": base = t => { const env = 0.25 + 0.9 * Math.abs(Math.sin(Math.PI * t / 1.9)); return 0.9 * env * Math.sin(2 * Math.PI * 3.9 * t); }; break;
      case "fv": { const f = [4.1 + r(), 5.3 + r(), 6.7 + r()], ph = [r() * 6, r() * 6, r() * 6]; base = t => (0.35 + 0.15 * Math.sin(t * 1.3)) * (Math.sin(2 * Math.PI * f[0] * t + ph[0]) + 0.6 * Math.sin(2 * Math.PI * f[1] * t + ph[1]) + 0.4 * Math.sin(2 * Math.PI * f[2] * t + ph[2])); break; }
      case "assistolia": base = t => 0.02 * Math.sin(2 * Math.PI * 0.3 * t) + 0.006 * Math.sin(2 * Math.PI * 7 * t); break;
      case "hiperk_grave": base = t => 0.75 * Math.sin(2 * Math.PI * 1.45 * t); break;
      default: reg(hr || 74, L);
    }
    for (let i = 0; i < n; i++) {
      const t = i / fs; let v = base(t);
      for (const [bt, m] of beats) { const d = t - bt; if (d > -0.5 && d < 0.75) v += beat(d, m); }
      for (const [pt, a, kind] of ps) { const d = t - pt; if (kind === "spike") { if (Math.abs(d) < 0.006) v += 1.6 * (1 - Math.abs(d) / 0.006); } else if (d > -0.1 && d < 0.1) v += pw(d, a); }
      v += (r() - 0.5) * 0.012;
      out[i] = v;
    }
    return out;
  }
  function paper(x, y, w, h, pxs, pxmv) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff6f4"/>`;
    const small = pxs * 0.04, big = small * 5;
    for (let gx = x; gx <= x + w + 0.1; gx += small) s += `<line x1="${gx.toFixed(1)}" y1="${y}" x2="${gx.toFixed(1)}" y2="${y + h}" stroke="${Math.round((gx - x) / small) % 5 === 0 ? "#f0a8a0" : "#fbd9d4"}" stroke-width="${Math.round((gx - x) / small) % 5 === 0 ? 0.9 : 0.5}"/>`;
    for (let gy = y; gy <= y + h + 0.1; gy += pxmv / 10) s += `<line x1="${x}" y1="${gy.toFixed(1)}" x2="${x + w}" y2="${gy.toFixed(1)}" stroke="${Math.round((gy - y) / (pxmv / 10)) % 5 === 0 ? "#f0a8a0" : "#fbd9d4"}" stroke-width="${Math.round((gy - y) / (pxmv / 10)) % 5 === 0 ? 0.9 : 0.5}"/>`;
    return s + (big ? "" : "");
  }
  function trace(data, x0, y0, pxs, pxmv, maxW, color = "#111") {
    const pts = []; const fs = 250;
    for (let i = 0; i < data.length; i++) { const x = x0 + (i / fs) * pxs; if (x > x0 + maxW) break; if (i % 2 === 0) pts.push([x, y0 - data[i] * pxmv]); }
    return path(pts, color, 1.4);
  }
  function ecgStrip(spec, r) {
    const h = 210, pxs = 100, pxmv = 46;
    let s = svgOpen(h, "#fff6f4") + paper(10, 34, 780, 166, pxs, pxmv);
    s += label(18, 24, `${spec.title || "ECG — derivação DII contínua"}`, "#5b2a2a", 13, 700) + label(782, 24, "25 mm/s · 10 mm/mV", "#8b4a4a", 11, 600, "end");
    const data = rhythm(spec.key, 7.8, null, r, spec.params || {});
    s += trace(data, 12, 130, pxs, pxmv, 776);
    return s + stamp(h, "Traçado sintético didático") + "</svg>";
  }
  const LEADS = {
    I: {p: .1, r: .7, s: -.1, t: .25}, II: {p: .15, r: 1, s: -.15, t: .3}, III: {p: .06, r: .45, s: -.2, t: .1},
    aVR: {p: -.12, r: .12, q: 0, s: -.75, t: -.25}, aVL: {p: .05, r: .4, s: -.3, t: .1}, aVF: {p: .1, r: .7, s: -.15, t: .2},
    V1: {p: .08, r: .2, q: 0, s: -1.0, t: -.05}, V2: {p: .08, r: .4, q: 0, s: -1.2, t: .4}, V3: {p: .08, r: .8, s: -.8, t: .45},
    V4: {p: .1, r: 1.3, s: -.5, t: .45}, V5: {p: .1, r: 1.4, s: -.25, t: .35}, V6: {p: .1, r: 1.1, s: -.1, t: .3}
  };
  function pattern12(key) {
    const m = {}; const set = (leads, o) => leads.forEach(l => { const oo = Object.assign({}, o); if (oo.st) oo.st *= 1.5; m[l] = Object.assign({}, m[l] || {}, oo); });
    let rate = 74, rhythmKey = "sinusal";
    switch (key) {
      case "iam_anterior": set(["V1"], {st: .2, t: .35}); set(["V2", "V3"], {st: .38, t: .65}); set(["V4"], {st: .28, t: .55}); set(["II", "III", "aVF"], {st: -.08}); break;
      case "iam_inferior": set(["II"], {st: .25, t: .5}); set(["III"], {st: .35, t: .55}); set(["aVF"], {st: .3, t: .5}); set(["I"], {st: -.1, t: -.05}); set(["aVL"], {st: -.18, t: -.12}); set(["V2"], {st: -.06}); break;
      case "iam_lateral": set(["I"], {st: .2, t: .45}); set(["aVL"], {st: .25, t: .4}); set(["V5", "V6"], {st: .2, t: .45}); set(["III", "aVF"], {st: -.15, t: -.1}); break;
      case "iam_posterior": set(["V1"], {r: .7, s: -.4, st: -.2, t: .25}); set(["V2"], {r: 1.0, s: -.4, st: -.28, t: .3}); set(["V3"], {st: -.2}); break;
      case "pericardite": ["I", "II", "aVF", "V2", "V3", "V4", "V5", "V6"].forEach(l => set([l], {st: .16})); set(["III"], {st: .06}); set(["aVR"], {st: -.12, p: -.12}); m.prDepress = true; rate = 96; break;
      case "wellens": set(["V2"], {st: .02, t: -.55, tw: .05}); set(["V3"], {st: .02, t: -.5, tw: .05}); set(["V4"], {t: -.25}); break;
      case "de_winter": ["V1", "V2", "V3", "V4", "V5", "V6"].forEach((l, i) => set([l], {st: -.12, j: -.15, t: [.7, .95, 1.0, .95, .7, .5][i], tw: .04})); set(["aVR"], {st: .1}); break;
      case "brugada": set(["V1"], {r2: .35, st: .3, t: -.25, tw: .06}); set(["V2"], {r2: .3, st: .28, t: -.2, tw: .06}); break;
      case "tep": rate = 116; set(["I"], {s: -.45}); set(["III"], {q: -.25, t: -.22}); set(["V1", "V2", "V3"], {t: -.3}); set(["V4"], {t: -.18}); break;
      case "hiperk": Object.keys(LEADS).forEach(l => set([l], {t: (LEADS[l].t >= 0 ? 1 : -1) * (Math.abs(LEADS[l].t) * 2.6 + .25), tw: .028, w: 1.7, p: (LEADS[l].p || 0) * .3})); break;
      case "triciclico": rate = 124; Object.keys(LEADS).forEach(l => set([l], {w: 1.9})); set(["aVR"], {r2: .55}); set(["I"], {s: -.4}); break;
      case "bre": Object.keys(LEADS).forEach(l => set([l], {w: 2.6})); set(["I", "aVL", "V5", "V6"], {r: 1.0, r2: .9, s: 0, q: 0, st: -.1, t: -.25}); set(["V1", "V2", "V3"], {r: .05, s: -1.4, q: 0, st: .15, t: .4}); break;
      case "brd": set(["V1"], {r: .3, s: -.3, r2: .8, t: -.15}); set(["V2"], {r2: .5}); set(["I", "V5", "V6"], {s: -.35}); Object.keys(LEADS).forEach(l => set([l], {w: (m[l] && m[l].w) || 1.25})); break;
      case "tronco": set(["aVR"], {st: .2, t: .2}); set(["V1"], {st: .08}); ["I", "II", "aVF", "V3", "V4", "V5", "V6"].forEach(l => set([l], {st: -.18, t: .1})); set(["aVL"], {st: -.08}); rate = 96; break;
      default: break;
    }
    return {m, rate, rhythmKey};
  }
  function ecg12(spec, r) {
    const pat = pattern12(spec.key), h = 470, pxs = 78, pxmv = 36;
    let s = svgOpen(h, "#fff6f4") + paper(8, 30, 784, 430, pxs, pxmv);
    s += label(16, 21, spec.title || "ECG de 12 derivações", "#5b2a2a", 13, 700) + label(784, 21, "25 mm/s · 10 mm/mV", "#8b4a4a", 11, 600, "end");
    const order = [["I", "aVR", "V1", "V4"], ["II", "aVL", "V2", "V5"], ["III", "aVF", "V3", "V6"]];
    const colW = 195, seed = Math.floor(r() * 1e9);
    order.forEach((row, ri) => row.forEach((ld, ci) => {
      const lead = Object.assign({}, LEADS[ld], pat.m[ld] || {});
      const data = rhythm("sinusal", 2.5, lead, rng(seed + ri), {fc: pat.rate});
      if (pat.m.prDepress && ld !== "aVR") for (let i = 0; i < data.length; i++) data[i] -= 0;
      const x0 = 10 + ci * colW, y0 = 92 + ri * 92;
      s += trace(data, x0, y0, pxs, pxmv, colW - 6) + label(x0 + 4, y0 - 38, ld, "#3b1f1f", 12, 800);
      if (ci) s += `<line x1="${x0}" y1="${y0 - 10}" x2="${x0}" y2="${y0 + 10}" stroke="#333" stroke-width="1.2"/>`;
    }));
    const ii = Object.assign({}, LEADS.II, pat.m.II || {});
    s += trace(rhythm("sinusal", 10, ii, rng(seed + 1), {fc: pat.rate}), 10, 410, pxs, pxmv, 778) + label(14, 378, "II", "#3b1f1f", 12, 800);
    return s + stamp(h, "Traçado sintético didático") + "</svg>";
  }

  /* ───────────────────────── Curvas do ventilador ───────────────────────── */
  const VENT_MODES = {
    pcv_normal: "PCV", psv_normal: "PSV", ciclagem_precoce: "PSV",
    ciclagem_tardia: "PSV", disparo_reverso: "PCV", autodisparo: "PCV"
  };
  function ventSeries(key, p) {
    const dt = 0.01, T = 9, n = Math.round(T / dt);
    const P = new Float64Array(n), F = new Float64Array(n), V = new Float64Array(n);
    const peep = num(p.peep) ?? 8, pplat = num(p.pplat) ?? 22, ppico = num(p.ppico) ?? 28;
    const per = key === "autopeep" ? 2.4 : key === "autodisparo" ? 1.9 : 3.0;
    const ti = 1.0, vt = 450;
    for (let i = 0; i < n; i++) {
      const t = i * dt; let k = Math.floor(t / per); let c = t - k * per;
      let pr = peep, fl = 0, vol = 0;
      const pcMode = ["pcv_normal", "psv_normal", "ciclagem_precoce", "ciclagem_tardia", "disparo_reverso", "autodisparo"].includes(key);
      let tiK = ti; if (key === "ciclagem_precoce") tiK = 0.45; if (key === "psv_normal") tiK = 0.85;
      if (pcMode) {
        const dp = pplat - peep, tau = 0.22;
        if (c < tiK) { pr = peep + dp * (1 - Math.exp(-c / 0.04)); fl = 62 * Math.exp(-c / tau); vol = vt * (1 - Math.exp(-c / tau)) / (1 - Math.exp(-tiK / tau)) * (key === "ciclagem_precoce" ? 0.65 : 1); }
        else { const e = c - tiK, vi = (key === "ciclagem_precoce" ? 0.65 : 1) * vt; pr = peep; fl = -vi / 0.35 / 1000 * 60 * Math.exp(-e / 0.35); vol = vi * Math.exp(-e / 0.35); }
        if (key === "ciclagem_tardia" && c > 0.85 && c < tiK + 0.12) { pr += 7 * Math.exp(-((c - 1.02) ** 2) / 0.0025); fl *= 0.4; }
        if (key === "ciclagem_precoce" && c > 0.5 && c < 0.85) { fl += 18 * Math.exp(-((c - 0.62) ** 2) / 0.004); pr -= 2 * Math.exp(-((c - 0.6) ** 2) / 0.003); }
        if (key === "disparo_reverso" && c > 0.55 && c < 1.0) { pr -= 4 * Math.exp(-((c - 0.75) ** 2) / 0.008); fl += 22 * Math.exp(-((c - 0.78) ** 2) / 0.008); }
        if (key === "autodisparo" && c > tiK) fl += 4 * Math.sin(2 * Math.PI * 1.7 * t);
        if (key !== "pcv_normal" && key !== "autodisparo" && c < 0.08) pr -= 2.5 * Math.sin(Math.PI * c / 0.08);
      } else {
        const pause = ["vcv_pausa", "resistencia", "complacencia"].includes(key) ? 0.35 : 0;
        const tin = ti - (pause ? 0.25 : 0);
        const flow = 55; const C = vt / Math.max(pplat - peep, 4);
        if (c < tin) {
          fl = flow; vol = vt * c / tin; const res = ppico - pplat;
          pr = peep + Math.min(1, c / 0.04) * res + vol / C;
          if (key === "fome_fluxo") pr -= 9 * Math.sin(Math.PI * c / tin) ** 1.5;
        } else if (c < tin + pause) { fl = 0; vol = vt; const e = c - tin; pr = pplat + (ppico - pplat) * Math.exp(-e / 0.03); }
        else {
          const e = c - tin - pause, tau = key === "autopeep" ? 1.25 : 0.35;
          vol = vt * Math.exp(-e / tau); fl = -(vt / tau) / 1000 * 60 * Math.exp(-e / tau); pr = peep;
          if (key === "vazamento") vol = vt * (0.28 + 0.72 * Math.exp(-e / tau));
          if (key === "disparo_ineficaz" && e > 0.7 && e < 1.3) { const b = Math.exp(-((e - 0.95) ** 2) / 0.006); fl += 24 * b; pr -= 2.5 * b; }
        }
        if (key === "duplo_disparo" && k % 2 === 1) { if (c < 0.12) { pr = pplat + 4; fl = 30; vol = vt; } else if (c < tin + 0.12) { const cc = c - 0.12; fl = flow; vol = vt + vt * cc / tin; pr = peep + (ppico - pplat) + vol / C; } else { const e = c - tin - 0.12; vol = 2 * vt * Math.exp(-e / 0.4); fl = -(2 * vt / 0.4) / 1000 * 60 * Math.exp(-e / 0.4); pr = peep; } }
        if (key === "duplo_disparo" && k % 2 === 0 && c > tin) { /* expiração interrompida */ if (c > tin + 0.12) { pr = peep; } }
      }
      if (key === "secrecao") { const sw = Math.sin(2 * Math.PI * 11 * t); fl += 4.5 * sw; pr += 0.9 * sw; }
      P[i] = pr; F[i] = fl; V[i] = vol;
    }
    return {P, F, V, dt, n};
  }
  function chart(x, y, w, h, series, dt, color, yMin, yMax, title, unit, zero = true) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#050d15" stroke="#1d3347"/>`;
    const sy = v => Math.max(y + 3, Math.min(y + h - 3, y + h - 8 - ((v - yMin) / (yMax - yMin)) * (h - 16)));
    for (let k = 1; k < 4; k++) s += `<line x1="${x}" y1="${(y + k * h / 4).toFixed(1)}" x2="${x + w}" y2="${(y + k * h / 4).toFixed(1)}" stroke="#10243a" stroke-width="1"/>`;
    if (zero && yMin < 0 && yMax > 0) s += `<line x1="${x}" y1="${sy(0).toFixed(1)}" x2="${x + w}" y2="${sy(0).toFixed(1)}" stroke="#2c4a66" stroke-dasharray="4 4"/>`;
    const pts = []; const N = series.length;
    for (let i = 0; i < N; i += 2) pts.push([x + 4 + (i / N) * (w - 8), sy(series[i])]);
    s += path(pts, color, 1.8);
    s += label(x + 10, y + 16, title, color, 12, 700) + label(x + w - 10, y + 16, unit, "#7f97ad", 11, 500, "end");
    s += label(x + w - 10, y + h - 8, `${yMin} … ${yMax}`, "#5e7790", 9, 500, "end");
    return s;
  }
  function curva(spec) {
    const p = spec.params || {}, d = ventSeries(spec.key, p), h = 400;
    let s = svgOpen(h, "#02080e") + label(16, 22, spec.title || "Curvas do ventilador", "#e5f3ff", 14, 800);
    const mode = VENT_MODES[spec.key] || "VCV";
    s += label(784, 22, `Modo ${mode}`, "#ffd166", 12, 700, "end");
    const pMax = Math.max(40, Math.ceil((Math.max(...d.P) + 5) / 10) * 10);
    s += chart(10, 32, 780, 118, d.P, d.dt, "#ffd166", 0, pMax, "Pressão", "cmH₂O", false);
    s += chart(10, 156, 780, 118, d.F, d.dt, "#ff7aa8", -80, 80, "Fluxo", "L/min");
    s += chart(10, 280, 780, 104, d.V, d.dt, "#43e8ff", 0, 1000, "Volume", "mL", false);
    if (["vcv_pausa", "resistencia", "complacencia"].includes(spec.key)) {
      s += label(640, 48, `Ppico ${p.ppico ?? "—"} · Pplatô ${p.pplat ?? "—"} · PEEP ${p.peep ?? "—"}`, "#fff3c4", 12, 700, "end");
    }
    return s + stamp(h, "Curvas sintéticas didáticas") + "</svg>";
  }

  /* ───────────────────────── Capnografia, PIC, PAI, PVC ───────────────────────── */
  function waveCard(title, series, color, yMin, yMax, unit, h = 230, sub = "") {
    let s = svgOpen(h, "#02080e") + label(16, 22, title, "#e5f3ff", 14, 800) + (sub ? label(784, 22, sub, "#9fb6cc", 11, 600, "end") : "");
    s += chart(10, 32, 780, h - 52, series, 0.01, color, yMin, yMax, "", unit, false);
    return s + stamp(h, "Curva sintética didática") + "</svg>";
  }
  function capno(spec) {
    const n = 1200, out = new Float64Array(n), key = spec.key;
    for (let i = 0; i < n; i++) {
      const t = i * 0.01; let per = 5, peak = 38, c = t % per;
      if (key === "rcp_baixa") { per = 6; peak = 8; c = t % per; }
      if (key === "rosc") { per = 6; c = t % per; peak = t < 6 ? 11 : 42; }
      if (key === "hipoventilacao") { per = 6; c = t % per; peak = 40 + t * 2.2; }
      if (key === "queda_progressiva") { peak = t < 5 ? 38 : 19; }
      let v;
      const up = key === "broncoespasmo" ? 1.4 : 0.15;
      if (c < 2.6) { v = c < up ? peak * (1 - Math.exp(-c / (up / 3))) * (key === "broncoespasmo" ? 0.85 + 0.15 * c / 2.6 : 1) : peak * (key === "broncoespasmo" ? 0.85 + 0.15 * c / 2.6 : 0.96 + 0.04 * c / 2.6); if (key === "broncoespasmo" && c < up) v = peak * Math.pow(c / 2.6, 0.55); }
      else v = peak * Math.exp(-(c - 2.6) / 0.06);
      if (key === "curare" && c > 1.3 && c < 1.7) v -= 9 * Math.sin(Math.PI * (c - 1.3) / 0.4);
      if (key === "reinalacao") v = v * 0.85 + 7;
      if (key === "desconexao" && t > 7) v = 0;
      if (key === "esofagica") v = t < 8 ? v * (0.25 * Math.exp(-t / 4)) : 0;
      if (key === "rcp_baixa" || key === "rosc") v += 1.2 * Math.sin(2 * Math.PI * 1.8 * t);
      out[i] = Math.max(0, v);
    }
    return waveCard(spec.title || "Capnografia (EtCO₂ × tempo)", out, "#ffe066", 0, 60, "mmHg", 240, "EtCO₂");
  }
  function pic(spec) {
    if (spec.key === "plato" || spec.key === "pic_alta") {
      const n = 600, out = new Float64Array(n);
      for (let i = 0; i < n; i++) { const t = i / 10; let v = spec.key === "plato" ? 18 + (t > 18 && t < 42 ? 34 * box(t, 20, 40, 0.8) : 0) : 24 + 3 * Math.sin(t / 7); out[i] = v + Math.sin(t * 3) * 0.8; }
      return waveCard(spec.title || "Tendência da PIC (60 min)", out, "#b39dff", 0, 70, "mmHg", 230, "PIC");
    }
    const n = 800, out = new Float64Array(n), low = spec.key === "complacencia_baixa";
    for (let i = 0; i < n; i++) { const t = i * 0.01, c = t % 0.85; out[i] = 12 + (low ? 6 : 9) * Math.exp(-((c - 0.1) ** 2) / 0.0012) + (low ? 11 : 6) * Math.exp(-((c - 0.24) ** 2) / 0.002) + 4 * Math.exp(-((c - 0.4) ** 2) / 0.002) - 2 * c + (low ? 6 : 0); }
    return waveCard(spec.title || "Morfologia da onda de PIC", out, "#b39dff", 5, 40, "mmHg", 230, "P1 · P2 · P3");
  }
  function art(spec, r) {
    const n = 900, out = new Float64Array(n), key = spec.key;
    for (let i = 0; i < n; i++) {
      const t = i * 0.01; let c = t % 0.8, amp = 50;
      if (key === "vpp") amp = 50 * (0.62 + 0.38 * Math.sin(2 * Math.PI * t / 4));
      if (key === "paradoxal") amp = 50 * (0.66 + 0.34 * Math.sin(2 * Math.PI * t / 4));
      if (key === "alternante") amp = Math.floor(t / 0.8) % 2 ? 33 : 52;
      let v = 72 + amp * (c < 0.12 ? Math.sin(Math.PI / 2 * c / 0.12) : Math.exp(-(c - 0.12) / 0.32)) + (c > 0.3 ? 6 * Math.exp(-((c - 0.34) ** 2) / 0.0006) : 0);
      if (key === "superamortecida") v = 80 + 0.62 * (v - 80) * (c < 0.2 ? Math.sin(Math.PI / 2 * c / 0.2) / Math.max(Math.sin(Math.PI / 2 * Math.min(c, 0.12) / 0.12), 0.2) : 1) - (c > 0.3 && c < 0.4 ? 5 * Math.exp(-((c - 0.34) ** 2) / 0.0006) : 0);
      if (key === "subamortecida") v += 22 * Math.exp(-c / 0.05) * Math.sin(2 * Math.PI * c / 0.05) * (c < 0.2 ? 1 : 0);
      if (key.startsWith("flush") && t > 2.4 && t < 4.4) {
        const e = t - 2.4; if (e < 0.6) v = 260; else { const e2 = e - 0.6; v = key === "flush_otimo" ? 120 - 130 * Math.exp(-e2 / 0.06) * Math.cos(2 * Math.PI * e2 / 0.07) : key === "flush_sub" ? 120 - 140 * Math.exp(-e2 / 0.25) * Math.cos(2 * Math.PI * e2 / 0.06) : 120 + 140 * Math.exp(-e2 / 0.35) - 140; if (e2 > 0.6) v = 72 + 50 * Math.exp(-(c) / 0.32); }
      }
      out[i] = v;
    }
    return waveCard(spec.title || "Pressão arterial invasiva", out, "#ff6b6b", 40, key.startsWith("flush") ? 280 : 150, "mmHg", 240, key === "vpp" || key === "paradoxal" ? "ventilação/respiração ~15 irpm" : "");
  }
  function pvc(spec) {
    const n = 800, out = new Float64Array(n), key = spec.key;
    for (let i = 0; i < n; i++) {
      const t = i * 0.01, c = t % 0.9; let base = key === "constricao" || key === "tamponamento" ? 18 : 7;
      let a = key === "sem_a" ? 0 : 3 * Math.exp(-((c - 0.05) ** 2) / 0.0012);
      if (key === "canhao" && Math.floor(t / 0.9) % 3 === 1) a = 12 * Math.exp(-((c - 0.33) ** 2) / 0.0012);
      const cc = 1.4 * Math.exp(-((c - 0.15) ** 2) / 0.0006);
      const x = (key === "v_gigante" ? 0 : -2) * Math.exp(-((c - 0.28) ** 2) / 0.004);
      const v = (key === "v_gigante" ? 11 : 2.5) * Math.exp(-((c - 0.45) ** 2) / (key === "v_gigante" ? 0.006 : 0.002));
      const y = (key === "constricao" ? -8 : key === "tamponamento" ? -0.5 : -2.2) * Math.exp(-((c - 0.58) ** 2) / (key === "constricao" ? 0.0015 : 0.004));
      out[i] = base + a + cc + x + v + y + (key === "sem_a" ? 0.4 * Math.sin(2 * Math.PI * 6 * t) : 0);
    }
    return waveCard(spec.title || "Curva de pressão venosa central", out, "#7ee3ff", 0, 28, "mmHg", 230, "ondas a · c · v / descensos x · y");
  }

  /* ───────────────────────── Ultrassom (POCUS) ───────────────────────── */
  function speckle(x, y, w, h, r, dens = 0.0025, col = "#8c96a0") { let s = ""; const n = Math.round(w * h * dens); for (let i = 0; i < n; i++) s += `<circle cx="${(x + r() * w).toFixed(1)}" cy="${(y + r() * h).toFixed(1)}" r="${(0.6 + r() * 1.4).toFixed(1)}" fill="${col}" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`; return s; }
  let fanSeq = 0;
  function usFrame(title, inner, h = 360, sub = "") {
    const id = "t8fan" + (++fanSeq) + Math.random().toString(36).slice(2, 7);
    let s = svgOpen(h, "#000") + `<defs><clipPath id="${id}"><path d="M330 34 L470 34 L700 ${h - 24} Q400 ${h + 30} 100 ${h - 24} Z"/></clipPath></defs>`;
    s += `<g clip-path="url(#${id})"><rect x="0" y="0" width="${W}" height="${h}" fill="#0b0b0b"/>${inner}</g>`;
    s += label(16, 24, title, "#e9eef3", 14, 800) + (sub ? label(784, 24, sub, "#9aa7b4", 11, 600, "end") : "");
    return s + stamp(h, "Ultrassom esquemático didático") + "</svg>";
  }
  function pocus(spec, r) {
    const k = spec.key, t = spec.title;
    const lungTop = (r2) => `<rect x="0" y="34" width="${W}" height="70" fill="#3a3a3a"/>${speckle(100, 34, 600, 70, r2, 0.01, "#bbb")}<ellipse cx="260" cy="118" rx="60" ry="16" fill="#cfcfcf"/><ellipse cx="540" cy="118" rx="60" ry="16" fill="#cfcfcf"/><rect x="200" y="124" width="120" height="260" fill="#050505"/><rect x="480" y="124" width="120" height="260" fill="#050505"/><line x1="320" y1="132" x2="480" y2="132" stroke="#f2f2f2" stroke-width="5"/>`;
    const mmode = (bar) => { let s = `<rect x="420" y="40" width="360" height="300" fill="#0b0b0b"/>`; for (let y = 50; y < 140; y += 7) s += `<line x1="420" y1="${y}" x2="780" y2="${y}" stroke="#8a8a8a" stroke-width="${1 + (y % 3)}"/>`; s += `<line x1="420" y1="146" x2="780" y2="146" stroke="#f0f0f0" stroke-width="4"/>`; if (bar === "barcode") { for (let y = 156; y < 335; y += 6) s += `<line x1="420" y1="${y}" x2="780" y2="${y}" stroke="#9a9a9a" stroke-width="2"/>`; } else if (bar === "point") { for (let y = 156; y < 335; y += 6) s += `<line x1="420" y1="${y}" x2="600" y2="${y}" stroke="#9a9a9a" stroke-width="2"/>`; s += speckle(600, 152, 180, 185, r, 0.03, "#aaa"); s += `<line x1="600" y1="40" x2="600" y2="340" stroke="#43e8ff" stroke-dasharray="5 5"/>`; } else s += speckle(420, 152, 360, 185, r, 0.03, "#aaa"); return s; };
    switch (k) {
      case "linhas_a": { let s = lungTop(r); for (const y of [210, 288]) s += `<line x1="320" y1="${y}" x2="480" y2="${y}" stroke="#bdbdbd" stroke-width="4" opacity=".75"/>`; return usFrame(t || "Ultrassom pulmonar — transdutor no 3º EIC", s); }
      case "linhas_b": { let s = lungTop(r); for (const x of [345, 380, 420, 455]) s += `<path d="M${x - 4} 134 L${x + 4} 134 L${x + 9} 360 L${x - 9} 360 Z" fill="#e8e8e8" opacity=".85"/>`; return usFrame(t || "Ultrassom pulmonar — campos anteriores bilaterais", s); }
      case "consolidacao": { let s = `<rect x="0" y="34" width="${W}" height="70" fill="#3a3a3a"/><path d="M200 120 Q400 100 600 125 L640 360 L160 360 Z" fill="#4a4a4a"/>` + speckle(180, 120, 450, 240, r, 0.02, "#c9c9c9"); for (let i = 0; i < 9; i++) s += `<path d="M${280 + r() * 240} ${170 + r() * 150} q 10 -6 22 0" stroke="#fff" stroke-width="3" fill="none"/>`; return usFrame(t || "Ultrassom pulmonar — base direita", s); }
      case "derrame_pleural": { let s = `<rect x="0" y="34" width="${W}" height="${326}" fill="#2a2a2a"/>` + speckle(100, 34, 600, 326, r, 0.006, "#999") + `<path d="M120 150 L680 150 L680 300 Q400 340 120 300 Z" fill="#000"/><path d="M260 300 Q400 230 540 300" fill="#555"/><path d="M120 300 Q400 360 680 300 L700 360 L100 360 Z" fill="#7a7a7a"/>` + label(560, 342, "diafragma", "#ddd", 11); return usFrame(t || "Ultrassom — base pulmonar (corte coronal)", s); }
      case "praia": case "codigo_barras": case "ponto_pulmonar": {
        const kind = {praia: "seashore", codigo_barras: "barcode", ponto_pulmonar: "point"}[k];
        let s = svgOpen(360, "#000") + label(16, 24, t || "Ultrassom pulmonar — modo M", "#e9eef3", 14, 800) + label(784, 24, "modo M · tempo →", "#9aa7b4", 11, 600, "end");
        s += `<g transform="translate(-819,0) scale(2.05,1)">` + mmode(kind) + `</g>`;
        return s + label(30, 170, "linha pleural", "#ffe066", 11, 700) + stamp(360, "Ultrassom esquemático didático") + "</svg>";
      }
      case "vci_pletorica": case "vci_colapsavel": {
        const ple = k === "vci_pletorica"; let s = `<rect x="0" y="30" width="${W}" height="340" fill="#3d3d3d"/>` + speckle(100, 30, 600, 330, r, 0.012, "#aaa");
        s += `<path d="M150 ${ple ? 170 : 200} L650 ${ple ? 165 : 198} L650 ${ple ? 255 : 222} L150 ${ple ? 260 : 226} Z" fill="#050505"/>` + label(470, ple ? 290 : 260, `VCI ${ple ? "2,6 cm" : "1,1 cm"} · variação ${ple ? "< 10%" : "> 50%"}`, "#ffe066", 12, 700);
        return usFrame(t || "Ultrassom — VCI subcostal, eixo longo", s);
      }
      case "tamponamento": case "vd_dilatado": case "fe_reduzida": {
        let s = `<rect x="0" y="30" width="${W}" height="340" fill="#333"/>` + speckle(100, 30, 600, 330, r, 0.01, "#aaa");
        if (k === "tamponamento") s += `<ellipse cx="400" cy="210" rx="190" ry="130" fill="#000"/><ellipse cx="400" cy="210" rx="150" ry="98" fill="#5a5a5a"/><path d="M290 170 Q330 120 380 170 Q340 185 290 170 Z" fill="#0a0a0a"/><ellipse cx="455" cy="215" rx="55" ry="60" fill="#0a0a0a"/>` + label(250, 345, "derrame circunferencial · VD colapsado na diástole", "#ffe066", 12, 700);
        if (k === "vd_dilatado") s += `<ellipse cx="330" cy="215" rx="95" ry="120" fill="#0a0a0a"/><ellipse cx="490" cy="235" rx="55" ry="80" fill="#0a0a0a"/><path d="M425 130 Q440 215 425 300" stroke="#bbb" stroke-width="10" fill="none"/>` + label(230, 350, "VD > VE · septo retificado", "#ffe066", 12, 700);
        if (k === "fe_reduzida") s += `<ellipse cx="420" cy="215" rx="130" ry="120" fill="#0a0a0a"/><path d="M300 130 Q420 90 540 130" stroke="#bbb" stroke-width="12" fill="none"/>` + label(210, 350, "VE dilatado, hipocinético · EPSS 18 mm", "#ffe066", 12, 700);
        return usFrame(t || "Ecocardiograma à beira-leito", s);
      }
      case "fast_morison": { let s = `<rect x="0" y="30" width="${W}" height="340" fill="#454545"/>` + speckle(100, 30, 600, 330, r, 0.014, "#bbb") + `<ellipse cx="470" cy="260" rx="120" ry="70" fill="#5b5b5b"/><ellipse cx="470" cy="260" rx="60" ry="30" fill="#8a8a8a"/><path d="M300 210 Q450 165 600 200 Q450 185 300 222 Z" fill="#000"/>` + label(250, 120, "fígado", "#ddd", 12) + label(540, 345, "rim direito", "#ddd", 12); return usFrame(t || "FAST — quadrante superior direito", s); }
      case "aorta_aneurisma": { let s = `<rect x="0" y="30" width="${W}" height="340" fill="#3a3a3a"/>` + speckle(100, 30, 600, 330, r, 0.01, "#aaa") + `<circle cx="400" cy="220" r="105" fill="#6a6a6a"/><circle cx="400" cy="220" r="70" fill="#060606"/><line x1="295" y1="220" x2="505" y2="220" stroke="#ffe066" stroke-dasharray="6 4"/>` + label(330, 345, "diâmetro externo 6,1 cm", "#ffe066", 12, 700); return usFrame(t || "Ultrassom — aorta abdominal, corte transversal", s); }
      case "tvp": { let s = `<rect x="0" y="30" width="${W}" height="340" fill="#3a3a3a"/>` + speckle(100, 30, 600, 330, r, 0.01, "#aaa") + `<circle cx="330" cy="200" r="40" fill="#050505"/><circle cx="460" cy="215" r="58" fill="#1e1e1e"/>` + speckle(410, 165, 100, 100, r, 0.05, "#888") + label(250, 330, "artéria", "#ddd", 12) + label(430, 330, "veia femoral — sob compressão", "#ffe066", 12, 700); return usFrame(t || "Ultrassom venoso — região inguinal com compressão", s); }
      case "bainha_optico": { let s = `<rect x="0" y="30" width="${W}" height="340" fill="#2e2e2e"/><circle cx="400" cy="130" r="88" fill="#030303"/><path d="M362 210 L438 210 L432 360 L368 360 Z" fill="#141414"/><path d="M380 210 L420 210 L416 360 L384 360 Z" fill="#4a4a4a"/><line x1="350" y1="246" x2="450" y2="246" stroke="#ffe066" stroke-width="2"/>` + label(460, 250, "DBNO 6,8 mm", "#ffe066", 13, 700); return usFrame(t || "Ultrassom ocular — bainha do nervo óptico", s); }
      case "vh_normal": case "vh_s_menor": case "vh_s_reverso": case "vp_pulsatil": {
        const n = 800, out = new Float64Array(n);
        for (let i = 0; i < n; i++) { const tt = i * 0.01, c = tt % 0.9; let v;
          if (k === "vp_pulsatil") v = 18 - 14 * Math.max(0, Math.sin(2 * Math.PI * c / 0.9));
          else { const S = k === "vh_normal" ? -22 : k === "vh_s_menor" ? -9 : 10; const D = k === "vh_normal" ? -12 : -20; v = 6 * Math.exp(-((c - 0.05) ** 2) / 0.001) + S * Math.exp(-((c - 0.25) ** 2) / 0.004) + 3 * Math.exp(-((c - 0.42) ** 2) / 0.001) + D * Math.exp(-((c - 0.6) ** 2) / 0.004); }
          out[i] = v; }
        return waveCard(t || (k === "vp_pulsatil" ? "Doppler pulsado — veia porta" : "Doppler pulsado — veia hepática"), out, "#9fe7ff", -30, 30, "cm/s", 230, k === "vp_pulsatil" ? "fluxo hepatopetal" : "ondas A · S · V · D");
      }
      default: return usFrame(t || "Ultrassom", lungTop(r));
    }
  }

  /* ───────────────────────── TC e radiografia ───────────────────────── */
  function ctHead(k, r, title) {
    const h = 380; let s = svgOpen(h, "#000") + label(16, 24, title || "TC de crânio sem contraste — corte axial", "#e9eef3", 14, 800);
    const cx = 400, cy = 205;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="150" ry="170" fill="#f2f2f2"/><ellipse cx="${cx}" cy="${cy}" rx="138" ry="158" fill="#7d7d7d"/>`;
    const edema = k === "edema", hydro = k === "hidrocefalia";
    if (!edema) for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; s += `<line x1="${(cx + 128 * Math.cos(a)).toFixed(1)}" y1="${(cy + 148 * Math.sin(a)).toFixed(1)}" x2="${(cx + 112 * Math.cos(a)).toFixed(1)}" y2="${(cy + 130 * Math.sin(a)).toFixed(1)}" stroke="#4a4a4a" stroke-width="2.5"/>`; }
    const vs = hydro ? 1.8 : edema ? 0.45 : 1; const shift = ["hed", "hsd", "avci_acm"].includes(k) ? -22 : 0;
    s += `<path d="M${cx - 6 + shift} ${cy - 55} q ${-26 * vs} 10 ${-30 * vs} ${50} q ${10} ${25 * vs} ${28 * vs} ${-5} Z" fill="#1a1a1a"/><path d="M${cx + 6 + shift} ${cy - 55} q ${26 * vs} 10 ${30 * vs} ${50} q ${-10} ${25 * vs} ${-28 * vs} ${-5} Z" fill="#1a1a1a"/>`;
    s += `<line x1="${cx}" y1="${cy - 150}" x2="${cx + shift}" y2="${cy + 150}" stroke="#5c5c5c" stroke-width="2"/>`;
    if (k === "hsa") { s += `<path d="M${cx - 70} ${cy + 40} Q${cx} ${cy + 10} ${cx + 70} ${cy + 40} L${cx + 40} ${cy + 70} Q${cx} ${cy + 55} ${cx - 40} ${cy + 70} Z" fill="#eaeaea"/><path d="M${cx - 70} ${cy + 40} q -40 -20 -60 -50" stroke="#e6e6e6" stroke-width="9" fill="none"/><path d="M${cx + 70} ${cy + 40} q 40 -20 60 -50" stroke="#e6e6e6" stroke-width="9" fill="none"/>`; }
    if (k === "hed") s += `<path d="M${cx + 120} ${cy - 90} Q${cx + 70} ${cy - 20} ${cx + 118} ${cy + 60} Q${cx + 140} ${cy - 15} ${cx + 120} ${cy - 90} Z" fill="#e8e8e8"/>`;
    if (k === "hsd") s += `<path d="M${cx + 70} ${cy - 135} Q${cx + 145} ${cy} ${cx + 60} ${cy + 140} Q${cx + 118} ${cy} ${cx + 70} ${cy - 135} Z" fill="#e2e2e2"/>`;
    if (k === "hsd_cronico") s += `<path d="M${cx + 70} ${cy - 135} Q${cx + 145} ${cy} ${cx + 60} ${cy + 140} Q${cx + 112} ${cy} ${cx + 70} ${cy - 135} Z" fill="#3a3a3a"/>`;
    if (k === "hip") s += `<ellipse cx="${cx - 55}" cy="${cy + 5}" rx="44" ry="30" fill="#4f4f4f"/><ellipse cx="${cx - 55}" cy="${cy + 5}" rx="32" ry="21" fill="#efefef"/>`;
    if (k === "avci_acm") s += `<path d="M${cx + 30} ${cy - 120} Q${cx + 150} ${cy - 40} ${cx + 125} ${cy + 80} Q${cx + 60} ${cy + 40} ${cx + 30} ${cy - 120} Z" fill="#5a5a5a"/><line x1="${cx + 25}" y1="${cy + 40}" x2="${cx + 80}" y2="${cy + 25}" stroke="#f4f4f4" stroke-width="5"/>`;
    if (k === "hiv") s += `<path d="M${cx - 30} ${cy - 10} q 0 25 22 30 l -18 0 Z" fill="#e8e8e8"/><path d="M${cx + 30} ${cy - 10} q 0 25 -22 30 l 18 0 Z" fill="#e8e8e8"/>`;
    s += label(cx - 165, 360, "D", "#cbd5df", 13, 800) + label(cx + 160, 360, "E", "#cbd5df", 13, 800, "end");
    return s + stamp(h, "TC esquemática didática") + "</svg>";
  }
  function ctOther(k, r, title) {
    const h = 360; let s = svgOpen(h, "#000");
    if (k === "angiotc_tep") {
      s += label(16, 24, title || "AngioTC de tórax — corte axial", "#e9eef3", 14, 800) + `<ellipse cx="400" cy="200" rx="300" ry="140" fill="#6b6b6b"/><ellipse cx="270" cy="200" rx="110" ry="105" fill="#151515"/><ellipse cx="530" cy="200" rx="110" ry="105" fill="#151515"/><ellipse cx="400" cy="190" rx="70" ry="60" fill="#8a8a8a"/><path d="M360 160 Q400 130 440 160 L480 175 Q400 165 320 175 Z" fill="#f0f0f0"/><path d="M380 152 Q400 145 420 152 L440 165 Q400 158 360 165 Z" fill="#3a3a3a"/><circle cx="440" cy="225" r="20" fill="#f0f0f0"/>`;
    } else if (k === "pancreatite_necrose") {
      s += label(16, 24, title || "TC de abdome com contraste — fase venosa", "#e9eef3", 14, 800) + `<ellipse cx="400" cy="200" rx="300" ry="145" fill="#5f5f5f"/><path d="M260 190 Q400 150 560 180 Q600 200 560 215 Q400 200 270 225 Z" fill="#9a9a9a"/><path d="M420 175 Q470 170 520 182 Q470 195 420 200 Z" fill="#3c3c3c"/><ellipse cx="360" cy="250" rx="70" ry="35" fill="#2c2c2c"/><circle cx="560" cy="270" r="26" fill="#d0d0d0"/>` + label(330, 330, "área não realçada + coleção", "#ffe066", 12, 700);
    } else {
      s += label(16, 24, title || "TC de abdome — janela pulmonar", "#e9eef3", 14, 800) + `<ellipse cx="400" cy="200" rx="300" ry="145" fill="#6a6a6a"/><path d="M180 110 Q400 50 620 110 Q400 85 180 110 Z" fill="#000"/><ellipse cx="300" cy="210" rx="90" ry="70" fill="#8d8d8d"/><circle cx="520" cy="230" r="28" fill="#000"/>`;
    }
    return s + stamp(h, "TC esquemática didática") + "</svg>";
  }
  function rx(spec, r) {
    const k = spec.key, h = 400; let s = svgOpen(h, "#000") + label(16, 24, spec.title || "Radiografia de tórax AP no leito", "#e9eef3", 14, 800);
    s += `<path d="M150 40 Q400 20 650 40 L700 390 L100 390 Z" fill="#5d5d5d"/>`;
    const dark = "#171717";
    let rl = `<path d="M240 70 Q300 55 360 80 L365 330 Q300 350 210 345 Q200 200 240 70 Z" fill="${dark}"/>`;
    let ll = `<path d="M440 80 Q500 55 560 70 Q600 200 590 345 Q500 350 435 330 Z" fill="${dark}"/>`;
    let heart = `<path d="M355 200 Q350 330 420 340 Q520 345 525 270 Q520 215 440 205 Z" fill="#cfcfcf"/>`;
    let ribs = ""; for (let i = 0; i < 8; i++) ribs += `<path d="M215 ${90 + i * 32} Q290 ${70 + i * 32} 365 ${95 + i * 32}" stroke="#7a7a7a" stroke-width="5" fill="none" opacity=".55"/><path d="M435 ${95 + i * 32} Q510 ${70 + i * 32} 585 ${90 + i * 32}" stroke="#7a7a7a" stroke-width="5" fill="none" opacity=".55"/>`;
    let extra = "", trachea = `<path d="M393 40 L393 165 L360 200 M407 40 L407 165 L440 200" stroke="#0b0b0b" stroke-width="10" fill="none"/>`;
    switch (k) {
      case "pneumotorax_hipertensivo": rl = `<path d="M200 60 Q300 40 380 70 L392 345 Q300 360 195 350 Z" fill="#050505"/><ellipse cx="370" cy="200" rx="18" ry="60" fill="#3a3a3a"/>`; heart = `<path d="M395 200 Q390 330 455 340 Q550 345 552 270 Q545 215 470 205 Z" fill="#cfcfcf"/>`; trachea = `<path d="M405 40 L420 165 L395 200 M419 40 L434 165 L465 200" stroke="#0b0b0b" stroke-width="10" fill="none"/>`; break;
      case "pneumotorax": rl += `<path d="M300 80 Q250 200 285 330" stroke="#bdbdbd" stroke-width="2" fill="none"/><path d="M300 80 Q250 200 285 330 L365 330 L360 80 Z" fill="#262626"/>`; break;
      case "derrame": ll = `<path d="M440 80 Q500 55 560 70 Q600 200 590 250 Q520 230 440 245 Z" fill="${dark}"/><path d="M440 245 Q520 228 592 252 L590 345 L435 330 Z" fill="#b8b8b8"/>`; break;
      case "sdra": extra = speckle(215, 80, 150, 260, r, 0.05, "#cfcfcf") + speckle(440, 80, 150, 260, r, 0.05, "#cfcfcf"); heart = `<path d="M365 210 Q360 320 420 330 Q500 335 505 270 Q500 220 440 212 Z" fill="#cfcfcf"/>`; break;
      case "eap": heart = `<path d="M330 190 Q320 345 420 352 Q560 355 565 260 Q555 205 450 196 Z" fill="#d6d6d6"/>`; extra = `<ellipse cx="330" cy="190" rx="60" ry="45" fill="#a9a9a9" opacity=".8"/><ellipse cx="470" cy="190" rx="60" ry="45" fill="#a9a9a9" opacity=".8"/><path d="M215 320 Q260 300 300 345 Z" fill="#a0a0a0"/><path d="M585 320 Q540 300 500 345 Z" fill="#a0a0a0"/>`; break;
      case "tot_seletivo": ll = `<path d="M440 80 Q500 55 560 70 Q600 200 590 345 Q500 350 435 330 Z" fill="#b5b5b5"/>`; trachea = `<path d="M393 40 L393 165 L360 200 M407 40 L407 165 L440 200" stroke="#0b0b0b" stroke-width="10" fill="none"/>`; extra = `<path d="M400 30 L398 170 L372 196" stroke="#fafafa" stroke-width="4" fill="none"/><circle cx="372" cy="196" r="3" fill="#fff"/>`; heart = `<path d="M370 200 Q365 330 435 340 Q535 345 540 270 Q535 215 455 205 Z" fill="#cfcfcf"/>`; break;
      case "atelectasia": ll = `<path d="M420 80 Q480 60 540 75 Q575 200 565 345 Q480 350 415 330 Z" fill="#c4c4c4"/>`; heart = `<path d="M370 200 Q360 330 430 340 Q530 345 540 270 Q530 215 450 205 Z" fill="#d0d0d0"/>`; trachea = `<path d="M405 40 L415 165 L385 200 M419 40 L429 165 L455 200" stroke="#0b0b0b" stroke-width="10" fill="none"/>`; break;
      case "pneumoperitonio_rx": extra = `<path d="M215 350 Q290 330 365 352 Q290 340 215 350 Z" fill="#050505"/><path d="M215 352 Q290 375 365 352" stroke="#050505" stroke-width="12" fill="none"/>`; break;
      case "mediastino_alargado": heart = `<path d="M340 90 L460 90 L470 200 Q540 220 535 280 Q520 345 420 342 Q345 335 345 220 Z" fill="#d0d0d0"/>` + label(470, 120, "mediastino superior 10 cm", "#ffe066", 12, 700); break;
      case "consolidacao": extra = `<path d="M225 240 Q300 220 362 250 L364 330 Q300 345 215 340 Z" fill="#b9b9b9"/>` + speckle(225, 240, 135, 95, r, 0.06, "#e0e0e0"); break;
      case "cvc_mal_posicionado": extra = `<path d="M300 40 Q330 110 360 130 Q380 100 388 40" stroke="#fafafa" stroke-width="3" fill="none"/>`; break;
      case "hiperinsuflacao": rl = `<path d="M230 55 Q300 45 365 70 L368 365 Q300 372 200 368 Q190 200 230 55 Z" fill="#0c0c0c"/>`; ll = `<path d="M435 70 Q500 45 570 55 Q610 200 600 368 Q500 372 432 365 Z" fill="#0c0c0c"/>`; heart = `<path d="M375 220 Q368 340 410 352 Q460 356 470 300 Q465 230 420 222 Z" fill="#cfcfcf"/>`; break;
      default: break;
    }
    s += rl + ll + ribs + heart + trachea + extra;
    s += label(120, 385, "D", "#cbd5df", 13, 800) + label(680, 385, "E", "#cbd5df", 13, 800, "end");
    return s + stamp(h, "Radiografia esquemática didática") + "</svg>";
  }

  /* ───────────────────────── ROTEM ───────────────────────── */
  function rotem(spec) {
    const k = spec.key, h = 300;
    const sets = {
      normal: [["EXTEM", 60, 48, 5], ["FIBTEM", 60, 14, 3]],
      hipofibrinogenemia: [["EXTEM", 70, 32, 5], ["FIBTEM", 70, 4, 2]],
      hiperfibrinolise: [["EXTEM", 75, 40, 75], ["APTEM", 70, 44, 6]],
      deficit_fatores: [["EXTEM", 135, 47, 4], ["FIBTEM", 120, 13, 3]],
      heparina: [["INTEM", 420, 45, 4], ["HEPTEM", 190, 47, 4]],
      plaquetas: [["EXTEM", 65, 30, 4], ["FIBTEM", 62, 15, 3]]
    }[k] || [["EXTEM", 60, 48, 5], ["FIBTEM", 60, 14, 3]];
    let s = svgOpen(h, "#050d15") + label(16, 24, spec.title || "Tromboelastometria rotacional (ROTEM)", "#e5f3ff", 14, 800);
    sets.forEach(([name, ct, a10, ml], i) => {
      const x0 = 20 + i * 390, y0 = 150, wid = 360; let up = [], dn = [];
      for (let xx = 0; xx <= wid; xx += 4) { const ts = xx * 4; let a = ts < ct ? 0 : a10 * 1.15 * (1 - Math.exp(-(ts - ct) / 160)); if (ml > 15 && ts > ct + 600) a *= Math.max(0, 1 - (ts - ct - 600) / 500); up.push([x0 + xx, y0 - a * 1.4]); dn.push([x0 + xx, y0 + a * 1.4]); }
      s += `<rect x="${x0 - 6}" y="38" width="${wid + 12}" height="222" rx="10" fill="#071a29" stroke="#1d3347"/>` + path(up, "#54f0a2", 2) + path(dn, "#54f0a2", 2) + `<line x1="${x0}" y1="${y0}" x2="${x0 + wid}" y2="${y0}" stroke="#2c4a66"/>`;
      s += label(x0 + 4, 58, name, "#ffd166", 13, 800) + label(x0 + 4, 248, `CT ${ct} s · A10 ${a10} mm · ML ${ml}%`, "#dbe6f5", 12, 700);
    });
    return s + stamp(h, "Traçado esquemático didático") + "</svg>";
  }

  /* ───────────────────────── Painéis de dados ───────────────────────── */
  const REF = {
    pH: [7.35, 7.45, ""], PaCO2: [35, 45, "mmHg"], PaO2: [80, 100, "mmHg"], HCO3: [22, 26, "mEq/L"], BE: [-2, 2, "mEq/L"],
    SatO2: [94, 100, "%"], SaO2: [94, 100, "%"], Lac: [0.5, 2, "mmol/L"], Na: [135, 145, "mEq/L"], K: [3.5, 5, "mEq/L"], Cl: [98, 107, "mEq/L"],
    Ca_i: [1.12, 1.32, "mmol/L"], Alb: [3.5, 5, "g/dL"], Glic: [70, 180, "mg/dL"], SvO2: [65, 80, "%"], ScvO2: [70, 85, "%"], FiO2: [null, null, "%"],
    "P/F": [300, null, ""], AG: [8, 12, "mEq/L"], Mg: [1.7, 2.4, "mg/dL"], P: [2.5, 4.5, "mg/dL"], Osm: [275, 295, "mOsm/kg"], "Gap CO2": [null, 6, "mmHg"]
  };
  function panel(spec) {
    const items = spec.items || [], isGaso = spec.kind === "gaso";
    const cols = items.length > 8 ? 2 : 1, rows = Math.ceil(items.length / cols), h = 70 + rows * 34;
    let s = svgOpen(h, "#061423") + `<rect x="10" y="10" width="780" height="${h - 20}" rx="12" fill="#0a1d31" stroke="#24476a"/>`;
    s += label(26, 38, spec.title || (isGaso ? "Gasometria arterial e eletrólitos" : "Exames"), "#e8f6ff", 15, 800);
    const cw = 760 / cols;
    items.forEach(([k, v], i) => {
      const col = Math.floor(i / rows), row = i % rows, x = 22 + col * cw, y = 62 + row * 34;
      const ref = REF[k]; const n = num(v);
      let flag = "", color = "#e6f1fb";
      if (ref && n !== null) { if (ref[0] !== null && n < ref[0]) { flag = "↓"; color = "#7fc8ff"; } if (ref[1] !== null && n > ref[1]) { flag = "↑"; color = "#ff8f8f"; } }
      s += `<rect x="${x}" y="${y - 22}" width="${cw - 14}" height="30" rx="7" fill="${row % 2 ? "#0c2238" : "#0e2740"}"/>`;
      if (v === "") { s += `<rect x="${x}" y="${y - 22}" width="${cw - 14}" height="30" rx="7" fill="${row % 2 ? "#0c2238" : "#0e2740"}"/>` + label(x + 12, y - 2, k, "#e6f1fb", 14, 700); return; }
      s += label(x + 12, y - 2, k, "#9fc3e6", 13, 700) + label(x + cw * 0.5, y - 2, `${v}${ref && ref[2] && !/[a-zA-Z%]/.test(String(v)) ? " " + ref[2] : ""} ${flag}`, color, 14, 800);
      if (ref && (ref[0] !== null || ref[1] !== null)) s += label(x + cw - 24, y - 2, ref[0] !== null && ref[1] !== null ? `${ref[0]}–${ref[1]}` : ref[0] !== null ? `> ${ref[0]}` : `< ${ref[1]}`, "#5f7f9e", 11, 500, "end");
    });
    return s + "</svg>";
  }
  function monitor(spec, r) {
    const it = Object.fromEntries(spec.items || []); const h = 300;
    let s = svgOpen(h, "#000") + label(16, 22, spec.title || "Monitor multiparamétrico", "#cfe3f5", 13, 700);
    const fc = num(it.FC) || 90; const rk = it.ritmo || (fc > 105 ? "taqui_sinusal" : fc < 55 ? "bradi_sinusal" : "sinusal");
    const ecgData = rhythm(rk, 5.2, null, r, {fc});
    const pts = []; for (let i = 0; i < ecgData.length; i += 2) pts.push([14 + (i / 250) * 100, 80 - ecgData[i] * 34]);
    s += path(pts, "#54f0a2", 1.6) + label(18, 46, "II", "#54f0a2", 11, 700);
    const pl = []; for (let i = 0; i < 520; i++) { const t = i / 100, c = (t * fc / 60) % 1; pl.push([14 + i, 175 - 34 * (c < 0.18 ? Math.sin(Math.PI / 2 * c / 0.18) : Math.exp(-(c - 0.18) / 0.35))]); }
    s += path(pl, "#43e8ff", 1.6) + label(18, 128, "Pleth", "#43e8ff", 11, 700);
    if (it.PAI || it.PA) { const al = []; for (let i = 0; i < 520; i++) { const t = i / 100, c = (t * fc / 60) % 1; al.push([14 + i, 270 - 40 * (c < 0.12 ? Math.sin(Math.PI / 2 * c / 0.12) : Math.exp(-(c - 0.12) / 0.4))]); } s += path(al, "#ff6b6b", 1.6) + label(18, 214, "ART", "#ff6b6b", 11, 700); }
    const tiles = [["FC", it.FC, "bpm", "#54f0a2"], ["PA", it.PA || it.PAI, "mmHg", "#ff6b6b"], ["PAM", it.PAM, "mmHg", "#ff8f8f"], ["SpO₂", it.SpO2, "%", "#43e8ff"], ["FR", it.FR, "irpm", "#ffd166"], ["T", it.T, "°C", "#e6f1fb"], ["EtCO₂", it.EtCO2, "mmHg", "#f6e58d"], ["PVC", it.PVC, "mmHg", "#9fe7ff"], ["PIC", it.PIC, "mmHg", "#b39dff"]].filter(x => x[1] !== undefined && x[1] !== "");
    tiles.forEach(([n, v, u, c], i) => { const col = i % 2, row = Math.floor(i / 2), x = 548 + col * 122, y = 34 + row * 62; s += `<rect x="${x}" y="${y}" width="114" height="56" rx="8" fill="#08131d" stroke="#1b3042"/>` + label(x + 8, y + 16, n, c, 11, 700) + label(x + 106, y + 16, u, "#6f8aa3", 9, 500, "end") + label(x + 57, y + 46, v, c, String(v).length > 6 ? 18 : 24, 800, "middle"); });
    return s + "</svg>";
  }
  function vmPanel(spec) {
    const items = spec.items || []; const h = 90 + Math.ceil(items.length / 4) * 74;
    let s = svgOpen(h, "#02080e") + `<rect x="10" y="10" width="780" height="${h - 20}" rx="12" fill="#06121d" stroke="#1d3347"/>` + label(26, 40, spec.title || "Ventilador — ajustes e medidas", "#e5f3ff", 15, 800);
    items.forEach(([k, v], i) => { const x = 24 + (i % 4) * 191, y = 60 + Math.floor(i / 4) * 74; s += `<rect x="${x}" y="${y}" width="181" height="64" rx="9" fill="#0b2032" stroke="#21405c"/>` + label(x + 10, y + 20, k, "#ffd166", 12, 700) + label(x + 90, y + 52, v, "#f7f9fc", 22, 800, "middle"); });
    return s + "</svg>";
  }
  function card(spec) {
    const lines = spec.lines || []; const h = 70 + lines.length * 30;
    let s = svgOpen(h, "#08131f") + `<rect x="10" y="10" width="780" height="${h - 20}" rx="12" fill="#0c1e30" stroke="#2a4b6c"/><rect x="10" y="10" width="8" height="${h - 20}" rx="4" fill="#43e8ff"/>`;
    s += label(30, 40, spec.title || "Achados", "#e8f6ff", 15, 800);
    lines.forEach((ln, i) => { s += label(34, 72 + i * 30, "• " + ln, "#dbe6f5", 14, 600); });
    return s + "</svg>";
  }
  function trend(spec) {
    const pts = (spec.points || []).map(([x, y]) => [x, num(y)]).filter(p => p[1] !== null); const h = 280;
    let s = svgOpen(h, "#061423").replace(`viewBox="0 0 ${W} ${h}"`, `viewBox="40 0 ${W - 40} ${h}"`) + label(56, 28, spec.title || "Tendência", "#e8f6ff", 19, 800);
    if (!pts.length) return s + "</svg>";
    const vals = pts.map(p => p[1]); const ref = spec.ref != null ? num(spec.ref) : null;
    let lo = Math.min(...vals, ref ?? Infinity), hi = Math.max(...vals, ref ?? -Infinity); const pad = (hi - lo || 1) * 0.2; lo -= pad; hi += pad;
    const x0 = 92, x1 = 770, y0 = 240, y1 = 56, sx = i => x0 + (pts.length === 1 ? 0 : i / (pts.length - 1)) * (x1 - x0), sy = v => y0 - (v - lo) / (hi - lo) * (y0 - y1);
    for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4; s += `<line x1="${x0}" y1="${sy(v).toFixed(1)}" x2="${x1}" y2="${sy(v).toFixed(1)}" stroke="#12304b"/>` + label(x0 - 8, sy(v) + 5, (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)).replace(".", ","), "#8aa6c0", 14, 600, "end"); }
    if (ref !== null) s += `<line x1="${x0}" y1="${sy(ref).toFixed(1)}" x2="${x1}" y2="${sy(ref).toFixed(1)}" stroke="#ffd166" stroke-dasharray="6 5"/>` + label(x1, sy(ref) - 8, `referência ${String(spec.ref)}`, "#ffd166", 15, 700, "end");
    s += path(pts.map((p, i) => [sx(i), sy(p[1])]), "#43e8ff", 2.6);
    pts.forEach((p, i) => { s += `<circle cx="${sx(i).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="5" fill="#43e8ff"/>` + label(sx(i), sy(p[1]) - 12, String(p[1]).replace(".", ","), "#e8f6ff", 17, 800, "middle") + label(sx(i), 266, p[0], "#b5c8da", 15, 700, "middle"); });
    return s + "</svg>";
  }

  /* Painéis de dados em HTML (legíveis no celular) */
  const P = "font-family:Inter,Arial,sans-serif;border-radius:14px;padding:14px 16px;background:linear-gradient(145deg,#0b2033,#08172a);border:1px solid #24476a;color:#e6f1fb";
  function htmlPanel(spec) {
    const isGaso = spec.kind === "gaso", isVm = spec.kind === "vm";
    const title = spec.title || (isGaso ? "Gasometria arterial e eletrólitos" : isVm ? "Ventilador — ajustes e medidas" : spec.kind === "card" ? "Achados do caso" : "Exames");
    const icon = isGaso ? "🩸" : isVm ? "🌬️" : spec.kind === "card" ? "📋" : "🧪";
    let rows = "";
    if (spec.kind === "card") {
      rows = (spec.lines || []).map(ln => `<li style="margin:6px 0;line-height:1.45">${esc(ln)}</li>`).join("");
      return `<div class="t8panel" style="${P};border-left:6px solid #43e8ff"><div style="font-weight:800;font-size:1.02rem;margin-bottom:6px">${icon} ${esc(title)}</div><ul style="margin:0;padding-left:20px;color:#dbe6f5">${rows}</ul></div>`;
    }
    rows = (spec.items || []).map(([k, v]) => {
      if (v === "") return `<div style="grid-column:1/-1;padding:8px 10px;border-radius:9px;background:#0e2740;font-weight:700">${esc(k)}</div>`;
      const ref = REF[k]; const n = num(v); let flag = "", color = "#f7f9fc";
      if (ref && n !== null) { if (ref[0] !== null && n < ref[0]) { flag = " ↓"; color = "#8fd0ff"; } if (ref[1] !== null && n > ref[1]) { flag = " ↑"; color = "#ff9b9b"; } }
      const unit = ref && ref[2] && !/[a-zA-Z%]/.test(String(v)) ? " " + ref[2] : "";
      const refTxt = ref && (ref[0] !== null || ref[1] !== null) ? (ref[0] !== null && ref[1] !== null ? `${ref[0]}–${ref[1]}` : ref[0] !== null ? `> ${ref[0]}` : `< ${ref[1]}`) : "";
      return `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:8px 10px;border-radius:9px;background:#0e2740"><span style="color:#9fc3e6;font-weight:700">${esc(k)}</span><span style="text-align:right"><b style="color:${color};font-size:1.05rem">${esc(v)}${esc(unit)}${flag}</b>${refTxt ? `<small style="display:block;color:#6f8faf;font-size:.72rem">ref. ${esc(refTxt)}</small>` : ""}</span></div>`;
    }).join("");
    return `<div class="t8panel" style="${P}"><div style="font-weight:800;font-size:1.02rem;margin-bottom:10px">${icon} ${esc(title)}</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px">${rows}</div></div>`;
  }

  function render(spec, seedKey) {
    if (!spec || !spec.kind) return "";
    const r = rng(hash(seedKey || JSON.stringify(spec)));
    switch (spec.kind) {
      case "ecg": return ecgStrip(spec, r);
      case "ecg12": return ecg12(spec, r);
      case "curva": return curva(spec, r);
      case "capno": return capno(spec, r);
      case "pic": return pic(spec, r);
      case "art": return art(spec, r);
      case "pvc": return pvc(spec, r);
      case "pocus": return pocus(spec, r);
      case "tc": return ["angiotc_tep", "pancreatite_necrose", "pneumoperitonio"].includes(spec.key) ? ctOther(spec.key, r, spec.title) : ctHead(spec.key, r, spec.title);
      case "rx": return rx(spec, r);
      case "rotem": return rotem(spec, r);
      case "mon": return monitor(spec, r);
      case "gaso": case "lab": case "vm": case "card": return htmlPanel(spec);
      case "trend": return trend(spec);
      default: return "";
    }
  }
  // Transcreve morfologia e anotações antes da resposta. As chaves internas,
  // o diagnóstico e a interpretação comentada nunca entram no texto.
  const ECG_FINDINGS = {
    fa_rvr: "Complexos QRS estreitos, frequentes e com intervalos entre batimentos que variam sem padrão fixo. A linha entre os complexos oscila discretamente, sem ondas P definidas.",
    fv: "Ondulações rápidas, irregulares e de amplitude variável ocupam toda a tira. Não se distinguem ondas P, complexos QRS ou ondas T organizados.",
    tv: "Sequência rápida e regular de complexos QRS largos e muito semelhantes entre si. Não se distinguem ondas P antes dos complexos.",
    assistolia: "Linha quase plana ao longo da tira, com pequenas oscilações. Não se distinguem ondas P nem complexos QRS.",
    aesp: "Complexos QRS largos, regulares e bem espaçados. O traçado eletrocardiográfico não informa se há pulso.",
    torsades: "Oscilações rápidas e largas agrupadas em fusos. A amplitude cresce e diminui ciclicamente em torno da linha de base; as ondas P, QRS e T não se separam com nitidez.",
    hiperk_grave: "Ondas contínuas, amplas e arredondadas, em formato senoidal. Não se distinguem ondas P, complexos QRS e ondas T separados.",
    osborn: "Complexos regulares e espaçados, cada um precedido por uma onda P. Há um ressalto positivo logo após o QRS e pequenas oscilações na linha de base.",
    tsv: "Complexos QRS estreitos, muito próximos entre si e com intervalos regulares. Não se distinguem ondas P isoladas.",
    fa_preexcitada: "Sequência muito rápida de complexos largos, com diferenças de largura, amplitude e espaçamento entre batimentos. Não se identificam ondas P regulares.",
    flutter: "Complexos QRS estreitos e regulares. Entre eles há deflexões repetidas com formato de dentes de serra, em frequência maior que a dos QRS.",
    bradi_sinusal: "Complexos QRS estreitos e regulares, bem espaçados. Uma onda P precede cada QRS, com intervalo constante.",
    bavt: "Ondas P regulares e mais frequentes que os QRS. Os QRS são largos e lentos, sem relação fixa com as ondas P.",
    mobitz2: "As ondas P mantêm espaçamento regular. O intervalo PR dos batimentos conduzidos permanece semelhante, e periodicamente há uma onda P sem QRS em seguida. Os QRS conduzidos são alargados.",
    mobitz1: "Em cada grupo de batimentos, o intervalo PR aumenta progressivamente até uma onda P não ser seguida por QRS. Em seguida, o intervalo PR volta a encurtar.",
    bav1: "Cada onda P é seguida por um QRS. O intervalo entre a onda P e o início do QRS é prolongado e semelhante de um batimento ao outro.",
    marcapasso_falha: "Espículas verticais finas aparecem a intervalos regulares. Algumas são seguidas de complexo QRS largo e outras não são seguidas de complexo.",
    hiperk: "Ondas P pequenas, complexos QRS alargados e ondas T altas, estreitas e pontiagudas.",
    hipok: "Segmento ST abaixo da linha de base e onda T de baixa amplitude. Uma segunda onda positiva aparece após a onda T.",
    qt_longo: "As ondas T estão mais afastadas dos seus complexos QRS. O intervalo do início do QRS ao final da onda T ocupa parte prolongada de cada ciclo.",
    wpw: "O intervalo da onda P ao QRS é curto. O início do QRS sobe de forma mais lenta e arredondada antes da deflexão mais rápida.",
    taqui_sinusal: "Complexos QRS estreitos, frequentes e regulares. Cada QRS é precedido por onda P semelhante, com intervalo PR aproximadamente constante.",
    fa: "Complexos QRS estreitos, com espaçamento variável sem padrão fixo. Entre os complexos há oscilações discretas e nenhuma onda P se destaca."
  };
  const ECG12_FINDINGS = {
    iam_inferior: "Segmento ST acima da linha de base em DII, DIII e aVF, mais elevado em DIII que em DII. Deslocamento abaixo da linha de base em DI e aVL.",
    iam_anterior: "Segmento ST acima da linha de base em V1 a V4, mais evidente em V2 e V3. Em DII, DIII e aVF, o segmento ST está discretamente abaixo da linha de base.",
    normal: "Complexos QRS regulares, precedidos por ondas P. Não se destaca deslocamento persistente do segmento ST nas derivações mostradas.",
    iam_posterior: "Segmento ST abaixo da linha de base em V1 a V3. As ondas R em V1 e V2 são relativamente altas neste traçado.",
    wellens: "Ondas T negativas e profundas em V2 e V3, com inversão menor em V4. O segmento ST em V2 e V3 fica próximo da linha de base.",
    de_winter: "Ponto J e trecho inicial do segmento ST abaixo da linha de base em V1 a V6, seguidos por ondas T altas e positivas, sobretudo em V2 a V4. Em aVR o ST está discretamente elevado.",
    tronco: "Segmento ST abaixo da linha de base em várias derivações, incluindo DI, DII, aVF e V3 a V6. Em aVR há elevação e em V1 há elevação menor.",
    pericardite: "Segmento ST acima da linha de base em várias derivações dos membros e precordiais, incluindo DI, DII e V2 a V6. Em aVR o ST está abaixo da linha de base.",
    brugada: "Em V1 e V2 há deflexão positiva terminal do QRS, seguida de segmento ST acima da linha de base e onda T negativa.",
    triciclico: "Batimentos frequentes e regulares, com QRS alargados. Existe uma deflexão positiva tardia do QRS em aVR e uma onda S evidente em DI.",
    brd: "O complexo QRS em V1 tem duas deflexões positivas separadas por uma negativa. A segunda positiva é maior que a primeira. A onda S é mais evidente em DI, V5 e V6."
  };
  const VENT_FINDINGS = {
    vcv_pausa: "Durante a inspiração, o fluxo mantém um nível positivo constante e o volume sobe em rampa. Quando o fluxo chega a zero na pausa, a pressão cai do pico para um platô, com o volume mantido antes da expiração.",
    resistencia: "Durante a inspiração, o fluxo mantém um nível positivo constante. Na pausa de fluxo zero há uma queda acentuada da pressão entre o pico e o platô. O volume se mantém durante a pausa.",
    complacencia: "Durante a inspiração, o fluxo mantém um nível positivo constante. Na pausa de fluxo zero, a pressão permanece próxima do pico, em um platô alto. O volume se mantém durante a pausa.",
    autopeep: "O fluxo expiratório está abaixo de zero e ainda não volta a zero quando começa a inspiração seguinte. A curva de volume também não retorna à linha de base entre os ciclos.",
    disparo_ineficaz: "Durante a expiração há uma elevação breve do fluxo em direção a zero, junto com uma pequena queda na pressão. A deflexão não é seguida de nova subida do volume.",
    duplo_disparo: "Em ciclos alternados, o volume já começa elevado e, no trecho de fluxo inspiratório positivo, sobe até quase o dobro dos demais ciclos antes de decair. O volume não retorna à linha de base nesse trecho.",
    fome_fluxo: "O fluxo se mantém num patamar positivo na inspiração. Durante a subida da pressão há uma depressão no meio do traçado, enquanto o volume cresce em rampa.",
    ciclagem_precoce: "A pressão inspiratória retorna à linha de base após trecho breve de fluxo positivo. Pouco depois há uma pequena queda adicional da pressão, acompanhada de uma deflexão do fluxo expiratório em direção a zero.",
    ciclagem_tardia: "O fluxo inspiratório cai progressivamente. Perto da transição para a expiração aparece um ressalto breve de pressão, antes que ela retorne à linha de base.",
    vazamento: "O volume sobe na inspiração e desce na expiração, mas termina o ciclo ainda acima da linha de base. Na inspiração seguinte, o traçado de volume recomeça na linha de base.",
    secrecao: "Há pequenas oscilações rápidas sobrepostas aos traçados de pressão e de fluxo, tanto na inspiração como na expiração. A curva do volume não tem o mesmo serrilhado.",
    autodisparo: "A pressão sobe em ciclos regulares e próximos, sem queda imediatamente antes da subida. Há pequenas oscilações repetidas sobre o fluxo expiratório. O gráfico não registra esforço muscular.",
    disparo_reverso: "Já durante o trecho de pressurização, aparece uma concavidade na curva de pressão ao mesmo tempo que o fluxo inspiratório volta a subir.",
    pcv_normal: "A pressão sobe rapidamente e fica quase horizontal na inspiração. O fluxo começa alto e decai progressivamente enquanto o volume sobe; na expiração, pressão, fluxo e volume retornam à linha de base.",
    psv_normal: "A pressão sobe rapidamente para um platô. O fluxo inspiratório começa alto e decai; na transição para a expiração ele cruza zero e fica negativo. O volume volta à linha de base."
  };
  const POCUS_FINDINGS = {
    vh_s_reverso: "Doppler pulsado da veia hepática. Em cada ciclo, a deflexão S fica acima do centro da escala e a deflexão D fica abaixo.",
    linhas_b: "Na imagem pulmonar, quatro faixas verticais brilhantes partem da linha pleural e se estendem até a borda profunda do quadro.",
    fe_reduzida: "O esquema cardíaco mostra uma cavidade ventricular ampla. A anotação da distância E-septo é de 18 milímetros. É um quadro estático, sem registro do movimento das paredes.",
    tamponamento: "Há um halo escuro em torno do contorno cardíaco. Uma das cavidades internas tem contorno estreito e achatado. A figura é estática e não mostra a fase do ciclo cardíaco.",
    vd_dilatado: "No esquema cardíaco, o ventrículo direito é maior que o esquerdo e o septo entre as cavidades tem contorno quase reto. Não há medida da espessura da parede nesta figura.",
    vci_colapsavel: "Corte longitudinal subcostal da veia cava inferior, com lúmen escuro e estreito. A anotação informa diâmetro de 1,1 centímetro e variação maior que 50 por cento.",
    consolidacao: "Na base pulmonar há uma área cinza de textura semelhante à de um órgão sólido, com pequenos traços brancos em seu interior. É um quadro estático.",
    ponto_pulmonar: "Modo M pulmonar. Acima da linha pleural há linhas horizontais. Abaixo dela, a metade esquerda tem linhas horizontais paralelas e, à direita de uma marca vertical, o padrão passa a granular.",
    bainha_optico: "No esquema ocular, uma linha de medida cruza a bainha do nervo atrás do globo. O diâmetro anotado é de 6,8 milímetros.",
    derrame_pleural: "No corte da base pulmonar há uma área escura acima da linha curva do diafragma, com uma estrutura cinza que se projeta para dentro dessa área.",
    tvp: "No corte inguinal, durante a compressão indicada no quadro, a veia femoral aparece circular e aberta, com ecos no interior. Ao lado há um vaso identificado como artéria.",
    fast_morison: "Na janela do quadrante superior direito, há uma faixa escura em forma de crescente entre a superfície inferior do fígado e a região do rim direito.",
    linhas_a: "Na imagem pulmonar, duas linhas horizontais brilhantes se repetem em profundidade, paralelas à linha pleural, entre as sombras das costelas. O quadro é estático.",
    praia: "Modo M pulmonar. Acima da linha pleural há linhas horizontais paralelas e, abaixo, a textura é granular de um lado ao outro.",
    codigo_barras: "Modo M pulmonar. Linhas horizontais paralelas se repetem tanto acima como abaixo da linha pleural, sem faixa granular abaixo dela.",
    vci_pletorica: "Corte longitudinal subcostal da veia cava inferior, com lúmen escuro e largo. A anotação informa diâmetro de 2,6 centímetros e variação menor que 10 por cento.",
    vp_pulsatil: "Doppler pulsado da veia porta. O traçado permanece acima do centro da escala, com quedas profundas e repetidas da velocidade, sem inversão de direção no trecho mostrado.",
    vh_normal: "Doppler pulsado da veia hepática. As duas deflexões principais, S e D, ficam abaixo do centro da escala. A deflexão S tem amplitude maior que a D.",
    aorta_aneurisma: "Corte transversal da aorta abdominal. Uma linha tracejada cruza a estrutura circular de uma borda externa à outra. O diâmetro externo anotado é de 6,1 centímetros."
  };

  function describe(spec) {
    const {kind, key, params} = spec || {};
    const hasFinding = (findings) => Object.prototype.hasOwnProperty.call(findings, key);
    if (kind === "ecg" && hasFinding(ECG_FINDINGS)) {
      return `Traçado sintético de ECG na derivação DII. ${ECG_FINDINGS[key]}`;
    }
    if (kind === "ecg12" && hasFinding(ECG12_FINDINGS)) {
      return `Traçado sintético de ECG de 12 derivações, com tira longa de DII. ${ECG12_FINDINGS[key]}`;
    }
    if (kind === "curva" && hasFinding(VENT_FINDINGS)) {
      let text = `Curvas sintéticas do ventilador em modo ${VENT_MODES[key] || "VCV"}. De cima para baixo, pressão, fluxo e volume ao longo do tempo. ${VENT_FINDINGS[key]}`;
      if (["vcv_pausa", "resistencia", "complacencia"].includes(key)) {
        const measurements = [["Pressão de pico", params?.ppico], ["Pressão de platô", params?.pplat], ["PEEP", params?.peep]];
        const displayed = measurements.filter(([, value]) => value != null && value !== "");
        if (displayed.length) text += ` Valores anotados em centímetros de água. ${displayed.map(([name, value]) => `${name} ${value}`).join(". ")}.`;
      }
      return text;
    }
    if (kind === "pocus" && hasFinding(POCUS_FINDINGS)) {
      return `Ultrassom esquemático. ${POCUS_FINDINGS[key]}`;
    }
    return "";
  }

  const api = {render, describe};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.Temi800Figuras = api;
})(typeof window !== "undefined" ? window : globalThis);
