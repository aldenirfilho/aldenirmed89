#!/usr/bin/env python3
"""Monta o HTML A4 da edição a partir de head.html + pages/01..30.html + tail.html e renumera os rodapés "N / total".
Uso: python3 assemble.py PASTA_DA_EDICAO  (a pasta tem head.html, tail.html, pages/NN.html e jornal.css) → PASTA/jornal.html"""
import re, sys
from pathlib import Path
d = Path(sys.argv[1])
pages = sorted((d / "pages").glob("[0-9][0-9].html"))
secs = []
for f in pages:
    s = re.findall(r'<section class="page".*?</section>', f.read_text(), re.S)
    assert len(s) == 1, f"{f.name}: precisa ter exatamente 1 <section class=\"page\">"
    secs.append(s[0])
n = len(secs)
out = [re.sub(r'<b>\d+</b> / \d+', f'<b>{i}</b> / {n}', s) for i, s in enumerate(secs, 1)]
(d / "jornal.html").write_text((d / "head.html").read_text() + "\n".join(out) + (d / "tail.html").read_text())
print(f"{n} páginas → {d / 'jornal.html'}")
