"""Gráficos do Jornal Diário 360 — edição 16/11/2026 (OpenDyslexic em curvas).
Paleta validada na superfície #fbf7ee: S1 #0087a3, S2 #a8750a, S3 #5b5fa8; cinza #b9b2a3."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
for f in ["/root/.fonts/OpenDyslexic-400-normal.ttf", "/root/.fonts/OpenDyslexic-700-normal.ttf"]:
    if os.path.exists(f): fm.fontManager.addfont(f)
import os
OUT = os.environ.get("J360_IMG", "img")
SURF = "#fbf7ee"; INK = "#1b1a17"; INK2 = "#55524a"; GRID = "#e6dfcf"
S1, S2, S3 = "#0087a3", "#a8750a", "#5b5fa8"; GRAY = "#b9b2a3"; RED = "#b3261e"
plt.rcParams.update({"font.family": ["OpenDyslexic", "DejaVu Sans"], "font.size": 7.4, "text.color": INK,
    "axes.edgecolor": GRID, "axes.labelcolor": INK2, "xtick.color": INK2, "ytick.color": INK2,
    "axes.facecolor": SURF, "figure.facecolor": SURF, "svg.fonttype": "path",
    "axes.spines.top": False, "axes.spines.right": False})

def save(fig, name):
    fig.savefig(f"{OUT}/{name}.svg", bbox_inches="tight", pad_inches=0.06); plt.close(fig)
def br(n, d=0):
    return f"{n:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")
def clean(ax, x=True, y=True):
    if x: ax.set_xticks([]); ax.spines["bottom"].set_visible(False)
    if y: ax.spines["left"].set_visible(False)
    ax.tick_params(axis="y", length=0)
def hbars(name, labs, vals, colors, fmt, xmax, figsize=(2.9, 1.0), fs=6.0, lfs=5.8):
    fig, ax = plt.subplots(figsize=figsize)
    y = list(range(len(vals)))[::-1]
    ax.barh(y, vals, color=colors, height=0.58, edgecolor=SURF, linewidth=1.4)
    for yi, v in zip(y, vals):
        ax.text(v + xmax * 0.015, yi, fmt(v), va="center", fontsize=fs)
    ax.set_yticks(y, labs, fontsize=lfs); ax.set_xlim(0, xmax)
    clean(ax); save(fig, name)
def pairs(name, rows, a_lab, b_lab, a_col, b_col, xmax, fmt, figsize=(2.9, 1.2), below=False):
    """Duas séries por linha (ex.: tratamento × controle), rótulos diretos e legenda."""
    fig, ax = plt.subplots(figsize=figsize)
    h = 0.34
    for i, (lab, a, b) in enumerate(rows[::-1]):
        ax.barh(i + h / 2, a, height=h, color=a_col, edgecolor=SURF, linewidth=1.2, label=a_lab if i == 0 else None)
        ax.barh(i - h / 2, b, height=h, color=b_col, edgecolor=SURF, linewidth=1.2, label=b_lab if i == 0 else None)
        ax.text(a + xmax * 0.015, i + h / 2, fmt(a), va="center", fontsize=5.8)
        ax.text(b + xmax * 0.015, i - h / 2, fmt(b), va="center", fontsize=5.8)
    ax.set_yticks(range(len(rows)), [r[0] for r in rows[::-1]], fontsize=5.6); ax.set_xlim(0, xmax)
    if below:
        ax.legend(fontsize=5.2, loc="upper center", bbox_to_anchor=(0.45, -0.02), ncol=2, frameon=False, handlelength=1.0)
    else:
        ax.legend(fontsize=5.2, loc="lower right", frameon=False, handlelength=1.0, borderaxespad=0.1)
    clean(ax); save(fig, name)


