#!/usr/bin/env python3
"""Publica uma edição pronta do Jornal Diário 360 no site (jornal-360/) e no Códice 360X (coleção j360).

Uso: python3 publish.py PASTA_DA_EDICAO RAIZ_ALDENIRMED89 [RAIZ_INTENSIVAHUB]

A PASTA_DA_EDICAO precisa ter: jornal.pdf (32 págs. desde 27/11/2026: p. 31 Neurodiversidade 360 e p. 32 Serviço Humanitário 360; 31 ou 30 nas edições antigas), jornal.html, jornal.css, img/,
e edicao.json com:
  {"data": "AAAA-MM-DD", "numero": 12, "diaSemana": "terça-feira", "fechamento": "madrugada",
   "temaDoDia": "...", "manchetes": [5 frases], "pilulas": {"TEMI": "...", "R3": "...", "POCUS": "...", "ECG": "...", "VM": "..."},
   "arcanos": ["...", "..."], "correcoes": [],
   "sources": [{"title": "...", "url": "https://...", "accessedAt": "AAAA-MM-DD"}],   # 3+ fontes médicas da edição
   "codice": {"jornalAncora": "#p8", "cards": [[área, frente, verso, pegadinha, fonte], ...]}}  # 10–16 cards das Pílulas

Faz: metadados e cadernos em PDF · cópia para jornal-360/edicoes/ · leitura no celular · capa do app ·
edicoes.json · build_jornal_360.py · item no registro editorial · baralho do Códice (se a raiz for dada).
Não faz git: o agente revisa, roda os portões e abre/mescla o PR.
"""
import json, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ed_dir, site = Path(sys.argv[1]), Path(sys.argv[2])
hub = Path(sys.argv[3]) if len(sys.argv) > 3 else None
ed = json.loads((ed_dir / "edicao.json").read_text())
D, N = ed["data"], int(ed["numero"])
dbr = "/".join(reversed(D.split("-")))

# 1) PDFs com metadados + cadernos (índices 0-based no padrão de 30 páginas)
from pypdf import PdfReader, PdfWriter
src = PdfReader(str(ed_dir / "jornal.pdf"))
NP = len(src.pages)
assert NP in (30, 31, 32), f"a edição padrão tem 32 páginas (30 + Neurodiversidade 360 + Serviço Humanitário 360, desde 27/11/2026), veio {NP}"
AUTOR = "ALDENIR ROCHA DE OLIVEIRA FILHO · PROJETO 360X"  # crédito obrigatório (pedido do proprietário em 20/11/2026)
CADERNOS = {
    "jornal": (f"Jornal_Diario_360_{D}.pdf", range(NP), f"Jornal Diário 360 — Radar 360 Circunstancial — {dbr} (nº {N:03d}, {NP} págs.)"),
    "pilulas": (f"Pilulas_do_Dia_360_{D}.pdf", range(7, 10), f"Pílulas do Dia 360 — {dbr}"),
    "esportes": (f"Esportes_360_{D}.pdf", range(11, 15), f"Esportes 360 — {dbr}"),
    "financas": (f"Financas_e_Humor_360_{D}.pdf", range(19, 23), f"Educação Financeira e Humor 360 — {dbr}"),
    "arcanos": (f"Arcanos_360_Sessao_Extra_{D}.pdf", range(23, 25), f"Arcanos 360 — {dbr}"),
    "honra": (f"Honra_e_Equilibrio_360_{D}.pdf", range(25, 29), f"Honra 360 e Equilíbrio 360 — {dbr}"),
}
if NP == 32:
    CADERNOS["neuro"] = (f"Neurodiversidade_360_{D}.pdf", range(30, 31), f"Neurodiversidade 360 — TDAH, autismo e neurodiversidade — {dbr}")
if NP >= 31:  # o Serviço Humanitário 360 é sempre a última página
    CADERNOS["humanitario"] = (f"Servico_Humanitario_360_{D}.pdf", range(NP - 1, NP), f"Serviço Humanitário 360 — {dbr}")
out_dir = site / "jornal-360/edicoes"
for key, (name, idx, title) in CADERNOS.items():
    w = PdfWriter()
    for i in idx:
        w.add_page(src.pages[i])
    w.add_metadata({"/Title": title, "/Author": AUTOR, "/Creator": "Jornal Diário 360 · Agente Editorial 360 · Claude (Anthropic)"})
    with open(out_dir / name, "wb") as f:
        w.write(f)
    shutil.copy(out_dir / name, ed_dir / name)

# 2) leitura no celular + capa do app
subprocess.run([sys.executable, str(HERE / "mobile_build.py"), str(ed_dir / "jornal.html"), str(ed_dir / "jornal.css"),
                str(ed_dir / "img"), str(site / "jornal-360/leitura" / D), D, str(N)], check=True)
subprocess.run(["pdftoppm", "-r", "60", "-f", "1", "-l", "1", "-png", str(ed_dir / "jornal.pdf"), str(ed_dir / "capa")], check=True)
from PIL import Image
capa = next(ed_dir.glob("capa*.png"))
Image.open(capa).convert("RGB").resize((420, 594)).save(site / f"jornal-360/app/capas/{D}.webp", "WEBP", quality=80)

# 3) edicoes.json (edição nova no INÍCIO) + build
dj = site / "jornal-360/data/edicoes.json"
data = json.loads(dj.read_text())
data["edicoes"] = [e for e in data["edicoes"] if e["data"] != D]
data["edicoes"].insert(0, {
    "numero": N, "data": D, "diaSemana": ed["diaSemana"], "fechamento": ed.get("fechamento", "madrugada"),
    "paginas": NP, "fonte": "OpenDyslexic", "temaDoDia": ed["temaDoDia"],
    "arquivos": {k: v[0] for k, v in CADERNOS.items()},
    "manchetes": ed["manchetes"], "pilulas": ed["pilulas"], "arcanos": ed["arcanos"], "correcoes": ed.get("correcoes", []),
})
data["atualizadoEm"] = D
dj.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
subprocess.run([sys.executable, str(site / "scripts_admin/build_jornal_360.py")], check=True, cwd=site)

# 4) registro editorial (um item por edição, com os paths novos/alterados)
reg_p = site / "data/editorial/registry.json"
raw = reg_p.read_text(); reg = json.loads(raw)
paths = sorted({f"jornal-360/edicoes/{v[0]}" for v in CADERNOS.values()}
               | {f"jornal-360/app/capas/{D}.webp"}
               | {p.relative_to(site).as_posix() for p in (site / "jornal-360/leitura" / D).rglob("*") if p.is_file()})
item_id = f"release-jornal-diario-360-{D}"
reg["items"] = [i for i in reg["items"] if i.get("id") != item_id]
reg["items"].append({
    "id": item_id, "classification": "public-cited", "paths": paths, "publishTargets": ["github-pages"], "ownerApproval": True,
    "reviewer": "Claude (Anthropic) — Agente Editorial 360: conferência de dados pessoais, fotos de terceiros, neutralidade política e citações curtas da edição diária. Não constitui revisão médica.",
    "reviewedAt": D,
    "rights": {"basis": "owned", "statement": "Jornal produzido pelo Agente Editorial 360 com o Claude (Anthropic) para o proprietário; gráficos, tirinhas e ilustrações originais, nenhuma foto de terceiros; notícias resumidas com fontes datadas."},
    "professionalClaims": [], "personalData": {"contains": False}, "medical": True,
    "clinicalReviewer": "Revisão médica formal das Pílulas do Dia pendente; publicação educacional diária autorizada pelo proprietário em 16/11/2026, com aviso de protocolo institucional.",
    "sources": ed["sources"],
    "publicationAuthorization": {"source": "standing-owner-instruction", "authorizedAt": "2026-11-16",
        "userRequest": "GERE MECANISMO DE ATUALIZACAO CONTINUA DIARIA E LANCAMENTO DIARIO DO JORNAL AS 05:30 ... E PUBLIQUE TAL JORNAL NO SITE ALDENIRMED89",
        "authorizationSummary": "Instrução permanente do proprietário (16/11/2026) para gerar, publicar e enviar a edição diária; desde 25/11/2026 com 31 páginas (página final Serviço Humanitário 360, padrão pedido em 24/11/2026)."},
})
reg["updatedAt"] = D
reg_p.write_text(json.dumps(reg, ensure_ascii=False, indent=2) + ("\n" if raw.endswith("\n") else ""))

# 5) Códice 360X: baralho das Pílulas do Dia
if hub and ed.get("codice"):
    cj = hub / "flashcards/tools/jornal360/edicoes" / f"{D}.json"
    cj.write_text(json.dumps({"data": D, "numero": N, "tema": ed["temaDoDia"],
        "jornal": f"https://aldenirfilho.github.io/aldenirmed89/jornal-360/leitura/{D}/index.html{ed['codice'].get('jornalAncora', '#p8')}",
        "cards": ed["codice"]["cards"]}, ensure_ascii=False, indent=1))
    idx = json.loads((hub / "flashcards/data/index.json").read_text())
    major, minor, patch = (int(x) for x in idx["versao"].split("."))
    subprocess.run([sys.executable, "tools/jornal360/build_pack9.py", ".", f"{major}.{minor}.{patch + 1}"], check=True, cwd=hub / "flashcards")
print("✅ publicado localmente:", D, "· agora rode os portões e abra/mescle os PRs")
