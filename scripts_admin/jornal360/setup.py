#!/usr/bin/env python3
"""Prepara uma pasta de trabalho do Jornal 360: copia o modelo, instala as fontes (@fontsource) e converte a
OpenDyslexic para TTF (usada pelos gráficos matplotlib). Uso: python3 setup.py /home/claude/j360/AAAA-MM-DD"""
import os, shutil, subprocess, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
d = Path(sys.argv[1]); (d / "pages").mkdir(parents=True, exist_ok=True); (d / "img").mkdir(exist_ok=True)
for f in ("head.html", "tail.html"):
    shutil.copy(HERE / "modelo" / f, d / f)
shutil.copy(HERE / "jornal.css", d / "jornal.css")
fonts = d / "fonts"; fonts.mkdir(exist_ok=True)
if not (fonts / "node_modules/@fontsource/opendyslexic").is_dir():
    subprocess.run(["npm", "i", "--silent", "--prefix", str(fonts), "@fontsource/unifrakturmaguntia", "@fontsource/cinzel", "@fontsource/opendyslexic"], check=True)
os.makedirs("/root/.fonts", exist_ok=True)
try:
    from fontTools.ttLib import TTFont
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "fonttools", "brotli"], check=True)
    from fontTools.ttLib import TTFont
for w in ("400", "700"):
    dst = f"/root/.fonts/OpenDyslexic-{w}-normal.ttf"
    if not os.path.exists(dst):
        f = TTFont(fonts / f"node_modules/@fontsource/opendyslexic/files/opendyslexic-latin-{w}-normal.woff2"); f.flavor = None; f.save(dst)
print("pronto:", d)
