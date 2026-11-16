"""Tirinhas originais do Jornal 360 (SVG inline). Personagens próprios; nenhuma fala de pessoa real.
Uso: from comics_1116 import strip; strip(title, panels) -> str (svg)."""
INK = "#1b1a17"; SURF = "#fbf7ee"; SKIN = "#e8c39e"; SKIN2 = "#c99a6e"
PW, PH, GAP = 192, 214, 7          # painel
BASE = 206                          # linha do chão (y dentro do painel)

def _eyes(cx, cy, d=7, r=2.6, mood="smile"):
    s = f'<circle cx="{cx-d}" cy="{cy}" r="{r}" fill="{INK}"/><circle cx="{cx+d}" cy="{cy}" r="{r}" fill="{INK}"/>'
    if mood == "worried":
        s += f'<path d="M{cx-d-4} {cy-6} l7 2 M{cx+d+4} {cy-6} l-7 2" stroke="{INK}" stroke-width="1.6" fill="none"/>'
    if mood == "proud":
        s += f'<path d="M{cx-d-4} {cy-6} l7 -2 M{cx+d+4} {cy-6} l-7 -2" stroke="{INK}" stroke-width="1.6" fill="none"/>'
    return s

def _mouth(cx, cy, mood="smile", w=8):
    if mood in ("smile", "proud"):
        return f'<path d="M{cx-w} {cy} q{w} {w*0.8} {2*w} 0" stroke="{INK}" stroke-width="2" fill="none" stroke-linecap="round"/>'
    if mood == "open":
        return f'<ellipse cx="{cx}" cy="{cy+2}" rx="{w*0.6}" ry="{w*0.55}" fill="{INK}"/>'
    if mood == "worried":
        return f'<path d="M{cx-w} {cy+4} q{w} {-w*0.7} {2*w} 0" stroke="{INK}" stroke-width="2" fill="none" stroke-linecap="round"/>'
    return f'<path d="M{cx-w} {cy+2} h{2*w}" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>'

def _sweat(x, y):
    return f'<path d="M{x} {y} q-4 7 0 9 q4 -2 0 -9z" fill="#7cc4d6" stroke="{INK}" stroke-width="0.8"/>'

def _head(cx, cy, r=18, skin=SKIN, mood="smile"):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{skin}" stroke="{INK}" stroke-width="2"/>'
            + _eyes(cx, cy - 3, mood=mood) + _mouth(cx, cy + 7, mood))

# ---------------- personagens ----------------
def selic(cx, by, mood="smile", cup=False):
    s = f'<ellipse cx="{cx}" cy="{by-36}" rx="30" ry="36" fill="#5b5fa8" stroke="{INK}" stroke-width="2"/>'
    s += f'<text x="{cx}" y="{by-26}" text-anchor="middle" font-size="22" fill="#fff" font-weight="700">%</text>'
    s += f'<circle cx="{cx}" cy="{by-110}" r="9" fill="#9a958b" stroke="{INK}" stroke-width="1.6"/>'
    s += _head(cx, by - 88, mood=mood)
    s += f'<circle cx="{cx-7}" cy="{by-91}" r="5" fill="none" stroke="{INK}" stroke-width="1.4"/><circle cx="{cx+7}" cy="{by-91}" r="5" fill="none" stroke="{INK}" stroke-width="1.4"/>'
    s += f'<path d="M{cx-12} {by} v8 M{cx+12} {by} v8" stroke="{INK}" stroke-width="3"/>'
    if cup:
        s += (f'<rect x="{cx+24}" y="{by-58}" width="14" height="12" rx="2" fill="#fff" stroke="{INK}" stroke-width="1.6"/>'
              f'<path d="M{cx+38} {by-55} q6 3 0 7" stroke="{INK}" stroke-width="1.4" fill="none"/>'
              f'<path d="M{cx+28} {by-64} q3 -4 0 -7 M{cx+34} {by-64} q3 -4 0 -7" stroke="#8a857b" stroke-width="1.2" fill="none"/>')
    return s

def dolar(cx, by, mood="worried"):
    s = f'<path d="M{cx-14} {by-10} v18 M{cx+14} {by-10} v18" stroke="{INK}" stroke-width="3"/>'
    s += f'<path d="M{cx-26} {by-60} l-16 14 M{cx+26} {by-60} l16 14" stroke="{INK}" stroke-width="3"/>'
    s += f'<rect x="{cx-26}" y="{by-112}" width="52" height="104" rx="6" fill="#4f9a6a" stroke="{INK}" stroke-width="2"/>'
    s += f'<rect x="{cx-20}" y="{by-106}" width="40" height="92" rx="4" fill="none" stroke="#d9efe0" stroke-width="1.4"/>'
    s += _eyes(cx, by - 86, mood=mood) + _mouth(cx, by - 74, mood)
    s += f'<text x="{cx}" y="{by-34}" text-anchor="middle" font-size="16" fill="#eaf6ee" font-weight="700">US$</text>'
    return s

def porquinho(cx, by, mood="worried"):
    s = f'<ellipse cx="{cx}" cy="{by-34}" rx="40" ry="30" fill="#efa5b4" stroke="{INK}" stroke-width="2"/>'
    s += f'<path d="M{cx-24} {by-6} v12 M{cx-8} {by-4} v10 M{cx+10} {by-4} v10 M{cx+26} {by-6} v12" stroke="{INK}" stroke-width="4"/>'
    s += f'<path d="M{cx-22} {by-60} l-4 -14 l14 8 M{cx+8} {by-62} l6 -14 l6 14" fill="#efa5b4" stroke="{INK}" stroke-width="1.8"/>'
    s += f'<rect x="{cx-10}" y="{by-66}" width="22" height="4" rx="2" fill="{INK}"/>'
    s += f'<ellipse cx="{cx-40}" cy="{by-34}" rx="9" ry="8" fill="#f4bcc7" stroke="{INK}" stroke-width="1.8"/>'
    s += f'<circle cx="{cx-43}" cy="{by-35}" r="1.6" fill="{INK}"/><circle cx="{cx-37}" cy="{by-35}" r="1.6" fill="{INK}"/>'
    s += _eyes(cx - 18, by - 46, d=6, mood=mood) + _mouth(cx - 18, by - 22, mood, w=6)
    return s

def barril(cx, by, mood="worried", sweat=True):
    s = f'<path d="M{cx-12} {by-6} v14 M{cx+12} {by-6} v14" stroke="{INK}" stroke-width="3"/>'
    s += f'<path d="M{cx-26} {by-6} q-6 -48 0 -96 h52 q6 48 0 96z" fill="#3b3a38" stroke="{INK}" stroke-width="2"/>'
    s += f'<path d="M{cx-29} {by-34} h58 M{cx-29} {by-74} h58" stroke="#a8750a" stroke-width="3"/>'
    s += f'<circle cx="{cx}" cy="{by-58}" r="15" fill="#e9e3d6" stroke="{INK}" stroke-width="1.4"/>'
    s += _eyes(cx, by - 61, d=5, r=2.2, mood=mood) + _mouth(cx, by - 51, mood, w=5)
    if sweat: s += _sweat(cx + 26, by - 96) + _sweat(cx - 30, by - 84)
    return s

def plantonista(cx, by, mood="smile"):
    s = f'<path d="M{cx-12} {by} v8 M{cx+12} {by} v8" stroke="{INK}" stroke-width="3"/>'
    s += f'<path d="M{cx-28} {by} v-58 q0 -14 14 -14 h28 q14 0 14 14 v58z" fill="#ffffff" stroke="{INK}" stroke-width="2"/>'
    s += f'<path d="M{cx} {by-72} v72" stroke="#cfc8b8" stroke-width="1.4"/>'
    s += f'<path d="M{cx-9} {by-70} q-6 26 6 30 q12 2 12 -14" stroke="#0087a3" stroke-width="2.4" fill="none"/><circle cx="{cx+9}" cy="{by-52}" r="4" fill="#0087a3"/>'
    s += _head(cx, by - 92, mood=mood)
    s += f'<path d="M{cx-18} {by-98} q4 -22 18 -20 q16 -2 18 20 q-8 -10 -18 -9 q-10 -1 -18 9z" fill="#3a2a1e"/>'
    return s

def robo(cx, by, mood="smile"):
    s = f'<path d="M{cx-12} {by-6} v14 M{cx+12} {by-6} v14" stroke="{INK}" stroke-width="3"/>'
    s += f'<rect x="{cx-24}" y="{by-62}" width="48" height="58" rx="6" fill="#c9c4b8" stroke="{INK}" stroke-width="2"/>'
    s += f'<circle cx="{cx}" cy="{by-36}" r="7" fill="#0087a3" stroke="{INK}" stroke-width="1.4"/>'
    s += f'<rect x="{cx-22}" y="{by-110}" width="44" height="40" rx="8" fill="#dedad0" stroke="{INK}" stroke-width="2"/>'
    s += f'<path d="M{cx} {by-110} v-12" stroke="{INK}" stroke-width="2"/><circle cx="{cx}" cy="{by-124}" r="4" fill="#b3261e"/>'
    s += f'<rect x="{cx-14}" y="{by-100}" width="10" height="8" rx="2" fill="#0087a3"/><rect x="{cx+4}" y="{by-100}" width="10" height="8" rx="2" fill="#0087a3"/>'
    s += _mouth(cx, by - 84, mood, w=7)
    return s

def torcedor(cx, by, cores=("#b3261e", "#1b1a17"), mood="smile", calc=False, rabo=False):
    a, b = cores
    s = f'<path d="M{cx-12} {by} v8 M{cx+12} {by} v8" stroke="{INK}" stroke-width="3"/>'
    s += f'<path d="M{cx-26} {by} v-56 q0 -14 14 -14 h24 q14 0 14 14 v56z" fill="{a}" stroke="{INK}" stroke-width="2"/>'
    if b:
        for k in range(3):
            s += f'<rect x="{cx-25}" y="{by-58+k*18}" width="50" height="8" fill="{b}"/>'
    s += _head(cx, by - 90, mood=mood)
    if rabo:
        s += f'<path d="M{cx+14} {by-104} q20 4 14 30" stroke="#5a3a22" stroke-width="7" fill="none" stroke-linecap="round"/>'
        s += f'<path d="M{cx-18} {by-96} q2 -24 18 -24 q16 0 18 20" fill="#5a3a22"/>'
    else:
        s += f'<path d="M{cx-17} {by-98} q4 -20 17 -18 q15 -2 17 18 q-9 -8 -17 -7 q-8 -1 -17 7z" fill="#2b2118"/>'
    if calc:
        s += (f'<rect x="{cx+16}" y="{by-64}" width="24" height="32" rx="3" fill="#e9e3d6" stroke="{INK}" stroke-width="1.6"/>'
              f'<rect x="{cx+19}" y="{by-61}" width="18" height="7" fill="#9fd3c7"/>'
              + "".join(f'<rect x="{cx+19+(i%3)*6}" y="{by-50+(i//3)*6}" width="4" height="4" fill="{INK}"/>' for i in range(6)))
    return s

def leao(cx, by, mood="proud"):
    s = f'<path d="M{cx-12} {by} v8 M{cx+12} {by} v8" stroke="{INK}" stroke-width="3"/>'
    s += f'<path d="M{cx-26} {by} v-54 q0 -14 14 -14 h24 q14 0 14 14 v54z" fill="#1f4e9a" stroke="{INK}" stroke-width="2"/>'
    s += f'<rect x="{cx-25}" y="{by-46}" width="50" height="9" fill="#b3261e"/><rect x="{cx-25}" y="{by-37}" width="50" height="5" fill="#fff"/>'
    s += f'<circle cx="{cx}" cy="{by-92}" r="30" fill="#b06a1f" stroke="{INK}" stroke-width="2"/>'
    s += _head(cx, by - 90, r=19, skin="#e3a54a", mood=mood)
    s += f'<path d="M{cx-4} {by-86} h8 l-4 4z" fill="{INK}"/>'
    return s

def vovo(cx, by, mood="worried", sweat=True):
    s = f'<path d="M{cx-12} {by} v8 M{cx+12} {by} v8" stroke="{INK}" stroke-width="3"/>'
    s += f'<path d="M{cx-26} {by} v-54 q0 -14 14 -14 h24 q14 0 14 14 v54z" fill="#ffffff" stroke="{INK}" stroke-width="2"/>'
    for k in range(4):
        s += f'<rect x="{cx-22+k*13}" y="{by-67}" width="6" height="66" fill="{INK}"/>'
    s += f'<path d="M{cx+34} {by+8} v-58 q0 -8 -8 -8" stroke="#6b4a2e" stroke-width="4" fill="none" stroke-linecap="round"/>'
    s += _head(cx, by - 90, mood=mood)
    s += f'<path d="M{cx-18} {by-96} q-4 -16 6 -18 M{cx+18} {by-96} q4 -16 -6 -18" stroke="#e9e6e0" stroke-width="6" fill="none" stroke-linecap="round"/>'
    s += f'<path d="M{cx-9} {by-82} q9 -5 18 0" stroke="#e9e6e0" stroke-width="4" fill="none" stroke-linecap="round"/>'
    if sweat: s += _sweat(cx + 22, by - 112)
    return s

def mei(cx, by, mood="worried"):
    s = f'<path d="M{cx-16} {by-4} v12 M{cx+16} {by-4} v12" stroke="{INK}" stroke-width="3"/>'
    s += f'<rect x="{cx-34}" y="{by-70}" width="68" height="66" rx="4" fill="#e9d9b5" stroke="{INK}" stroke-width="2"/>'
    s += "".join(f'<path d="M{cx-38+k*16} {by-70} l8 -20 l8 20z" fill="{"#b3261e" if k%2==0 else "#fff"}" stroke="{INK}" stroke-width="1.4"/>' for k in range(5))
    s += _eyes(cx, by - 48, mood=mood) + _mouth(cx, by - 34, mood)
    s += f'<text x="{cx}" y="{by-12}" text-anchor="middle" font-size="12" font-weight="700" fill="{INK}">MEI</text>'
    return s

def lei(cx, by, mood="proud"):
    s = f'<path d="M{cx-10} {by-4} v12 M{cx+10} {by-4} v12" stroke="{INK}" stroke-width="3"/>'
    s += f'<rect x="{cx-26}" y="{by-112}" width="52" height="108" fill="#f6eedb" stroke="{INK}" stroke-width="2"/>'
    s += f'<rect x="{cx-32}" y="{by-118}" width="64" height="10" rx="5" fill="#d8c9a3" stroke="{INK}" stroke-width="1.6"/>'
    s += f'<rect x="{cx-32}" y="{by-10}" width="64" height="10" rx="5" fill="#d8c9a3" stroke="{INK}" stroke-width="1.6"/>'
    s += _eyes(cx, by - 92, mood=mood) + _mouth(cx, by - 80, mood)
    s += "".join(f'<path d="M{cx-18} {by-64+k*10} h{36 if k<3 else 18}" stroke="#8a857b" stroke-width="2"/>' for k in range(5))
    s += f'<text x="{cx+8}" y="{by-18}" font-size="7" fill="{INK}">letras miúdas</text>'
    return s

def calendario(cx, by, mood="smile"):
    s = f'<path d="M{cx-10} {by-4} v12 M{cx+10} {by-4} v12" stroke="{INK}" stroke-width="3"/>'
    s += f'<rect x="{cx-30}" y="{by-104}" width="60" height="100" rx="4" fill="#fff" stroke="{INK}" stroke-width="2"/>'
    s += f'<rect x="{cx-30}" y="{by-104}" width="60" height="24" rx="4" fill="#0087a3" stroke="{INK}" stroke-width="2"/>'
    s += f'<text x="{cx}" y="{by-86}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">2027</text>'
    s += _eyes(cx, by - 62, mood=mood) + _mouth(cx, by - 48, mood)
    return s

def galo(cx, by, mood="open"):
    s = f'<path d="M{cx-6} {by-4} v12 M{cx+6} {by-4} v12" stroke="#c98a1a" stroke-width="3"/>'
    s += f'<ellipse cx="{cx}" cy="{by-32}" rx="26" ry="24" fill="#f2efe6" stroke="{INK}" stroke-width="2"/>'
    s += f'<path d="M{cx+20} {by-40} q22 -20 14 -40 q-6 18 -18 22 q4 -16 -4 -24 q0 16 -8 22" fill="#2e6b3a" stroke="{INK}" stroke-width="1.6"/>'
    s += f'<circle cx="{cx-14}" cy="{by-62}" r="15" fill="#f2efe6" stroke="{INK}" stroke-width="2"/>'
    s += f'<path d="M{cx-22} {by-76} q-2 -10 6 -8 q2 -8 8 -4 q4 -6 8 0" fill="#b3261e" stroke="{INK}" stroke-width="1.4"/>'
    s += f'<path d="M{cx-29} {by-64} l-10 3 l10 3z" fill="#e2a33a" stroke="{INK}" stroke-width="1.2"/>'
    s += f'<circle cx="{cx-17}" cy="{by-66}" r="2.4" fill="{INK}"/>'
    s += f'<path d="M{cx-26} {by-56} q2 8 6 4" fill="#b3261e"/>'
    return s

CHARS = dict(selic=selic, dolar=dolar, porquinho=porquinho, barril=barril, plantonista=plantonista,
             robo=robo, torcedor=torcedor, leao=leao, vovo=vovo, mei=mei, lei=lei, calendario=calendario, galo=galo)
HEADY = dict(selic=88, dolar=86, porquinho=46, barril=60, plantonista=92, robo=92, torcedor=90, leao=92,
             vovo=90, mei=48, lei=92, calendario=62, galo=64)

def balloon(px, lines, tx, ty, fs=10.0):
    """Balão centrado no painel; rabicho aponta para (tx, ty)."""
    lh = fs * 1.32
    w = max(len(l) for l in lines) * fs * 0.75 + 16
    w = min(w, PW - 6)
    h = len(lines) * lh + 12
    x = px + (PW - w) / 2; y = 7
    cx = x + w / 2
    tail_x = max(x + 16, min(x + w - 16, tx))
    s = (f'<path d="M{tail_x-8} {y+h-1} L{tx} {min(ty-26, y+h+26)} L{tail_x+8} {y+h-1}" fill="#fff" stroke="{INK}" stroke-width="1.8" stroke-linejoin="round"/>'
         f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#fff" stroke="{INK}" stroke-width="1.8"/>'
         f'<path d="M{tail_x-7} {y+h-1.2} h14" stroke="#fff" stroke-width="3"/>')
    for i, l in enumerate(lines):
        s += f'<text x="{cx}" y="{y + 6 + lh*(i+0.78)}" text-anchor="middle" font-size="{fs}" fill="{INK}">{l}</text>'
    return s

def strip(panels, bg=("#fdf3e1", "#eef6f7", "#f3eef9", "#f6f1e4")):
    """panels: lista de dicts {cast:[(nome, dx, kwargs)], speaker:int, text:[linhas], props:svg extra}"""
    n = len(panels); W = n * PW + (n - 1) * GAP + 8
    out = [f'<svg viewBox="0 0 {W} {PH+8}" xmlns="http://www.w3.org/2000/svg" font-family="OD, sans-serif" role="img" style="width:100%;height:auto;display:block">']
    for i, p in enumerate(panels):
        px = 4 + i * (PW + GAP); py = 4
        out.append(f'<g transform="translate(0,{py})"><rect x="{px}" y="0" width="{PW}" height="{PH}" rx="6" fill="{bg[i % len(bg)]}" stroke="{INK}" stroke-width="2.4"/>')
        out.append(f'<path d="M{px+3} {BASE+2} h{PW-6}" stroke="#cfc8b8" stroke-width="2"/>')
        sp = None
        for j, (name, dx, kw) in enumerate(p["cast"]):
            cx = px + PW / 2 + dx
            out.append(CHARS[name](cx, BASE, **kw))
            if j == p.get("speaker", 0): sp = (cx, BASE - HEADY[name] - 20)
        if p.get("props"): out.append(p["props"].replace("PX", str(px)))
        if p.get("text"): out.append(balloon(px, p["text"], sp[0], sp[1]))
        out.append(f'<text x="{px+PW-8}" y="{PH-6}" text-anchor="end" font-size="8" fill="#8a857b">{i+1}</text></g>')
    out.append("</svg>")
    return "".join(out)
