import re
import os

gpt_file = "../IMAGENS GPT /homepage_enciclopedia_medica_intensiva_interna.html"

with open(gpt_file, "r", encoding="utf-8") as f:
    html = f.read()

nav_links = """
        <a href="07_Estudos_Markdown/index.html" style="color: #4ef0a1; font-weight: 800;">↕️ UpDown Hub</a>
        <a href="01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html" style="color: #4ef0a1;">🫁 VM</a>
        <a href="06_Card_Feed_Medico/index.html" style="color: #38bdf8;">🖼️ Card Feed</a>
        <a href="questoes/index.html" style="color: #ffc107;">🏆 Simulador TEMI</a>
        <a href="03_Calculadoras_UTI/index.html" style="color: #4ef0a1;">🧮 Calculadoras UTI</a>
        <a href="05_Biblioteca_IA/index.html" style="color: #a98cff;">📚 Biblioteca IA</a>
"""

html = re.sub(r'<div class="nav-links">.*?</div>', f'<div class="nav-links">\n{nav_links}\n</div>', html, flags=re.DOTALL)
html = html.replace('href="#avc"', 'href="01_Modulos_Clinicos/AVC_Agudo/avc.html"')
html = html.replace('href="temas/avc-agudo/index.html"', 'href="01_Modulos_Clinicos/AVC_Agudo/avc.html"')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
