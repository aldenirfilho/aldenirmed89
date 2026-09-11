#!/usr/bin/env python3
"""Transporta o pacote auditado AVC Turbo TEMI 1.1 para 01_Modulos_Clinicos/AVC_Turbo_TEMI.

O pacote auditado (`AVC_TURBO_TEMI_2026-09-11_v1.1`, fora deste repositório) é a
fonte editável: `conteudo/*.md|json`, `build.py`, testes e as 20 ilustrações
PNG de 1672 px. Este script copia apenas o que é servido ao leitor e aplica as
adaptações de hospedagem do AldenirMed89, sem tocar no conteúdo clínico:

1. figuras 01–20 servidas em WebP (1280 px); a figura 21 é SVG nativo;
2. esquema de tema compartilhado do portal (`antigravity:a11y:v1`,
   "Visualização clara", texto ampliado, alto contraste, redução de movimento);
3. faixa visível de prévia pública em revisão médica (`review-strip`);
4. linha de edição com retorno à página inicial e ligação ao app anterior;
5. `module.manifest.json`, `README.md`, `CHECKLIST_OPERACIONAL.md` e
   `data/visual-assets.json` no padrão dos demais módulos clínicos;
6. cópia canônica em Markdown para o UpDown Hub e relatório de auditoria em
   `docs_usuario/`.

Uso:
    python3 scripts_admin/gerar_modulo_avc_turbo_temi.py <pasta_do_pacote_v1.1>

Idempotente: recria a pasta do módulo a cada execução. Não altera arquivos fora
das saídas listadas em SAIDAS.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULO_REL = "01_Modulos_Clinicos/AVC_Turbo_TEMI"
MD_REL = "01_UpDown_Hub/content/intensiva/avc-agudo-turbo-temi.md"
AUDITORIA_REL = "docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md"
SAIDAS = (MODULO_REL, MD_REL, AUDITORIA_REL)
EDICAO = "1.1"
DATA_EDICAO = "2026-09-11"
DATA_EDICAO_BR = "11/09/2026"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1]).resolve()
    site = src / "site"
    conteudo = src / "conteudo"
    if not (site / "index.html").is_file():
        raise SystemExit(f"pacote inválido: {src}")

    imagens = {int(x["number"]): x for x in json.loads((conteudo / "imagens.json").read_text("utf-8"))}
    manifesto_imagens = json.loads((src / "auditoria" / "IMAGENS_MANIFEST.json").read_text("utf-8"))
    referencias = json.loads((conteudo / "referencias.json").read_text("utf-8"))

    dst = ROOT / MODULO_REL
    if dst.exists():
        shutil.rmtree(dst)
    (dst / "assets" / "images").mkdir(parents=True)
    (dst / "data").mkdir()

    # ------------------------------------------------------------------ assets
    for name in ("data.js", "nihss.js", "tools.js", "icon-192.png", "icon-512.png"):
        shutil.copy2(site / "assets" / name, dst / "assets" / name)
    shutil.copy2(site / "manifest.webmanifest", dst / "manifest.webmanifest")
    for meta in imagens.values():
        shutil.copy2(site / meta["webp"], dst / meta["webp"])
    shutil.copy2(
        site / "assets/images/21_compartimentos_vetor.svg",
        dst / "assets/images/21_compartimentos_vetor.svg",
    )

    # -------------------------------------------------------------- index.html
    html = (site / "index.html").read_text("utf-8")

    def troca_figura(m: re.Match[str]) -> str:
        webp, png, resto = m.group("webp"), m.group("png"), m.group("resto")
        meta = imagens[int(Path(png).name[:2])]
        resto = re.sub(
            r'width="\d+" height="\d+"',
            f'width="{meta["webp_width"]}" height="{meta["webp_height"]}"',
            resto,
        )
        return f'<img src="{webp}"{resto}>'

    html, n_fig = re.subn(
        r'<picture><source type="image/webp" srcset="(?P<webp>[^"]+)">'
        r'<img src="(?P<png>[^"]+\.png)"(?P<resto>[^>]*)></picture>',
        troca_figura,
        html,
    )
    assert n_fig == 20, f"esperadas 20 figuras convertidas, obtidas {n_fig}"
    html, n_amp = re.subn(r'href="(assets/images/\d\d_[a-z_]+)\.png"', r'href="\1.webp"', html)
    assert n_amp >= 40, f"links de imagem convertidos: {n_amp}"
    html = html.replace("Baixar PNG original", "Abrir imagem em nova aba")
    assert "Baixar PNG original" not in html
    assert ".png" not in html.replace("icon-192.png", "").replace("icon-512.png", "")

    def substitui(antigo: str, novo: str, vezes: int = 1) -> None:
        nonlocal html
        assert html.count(antigo) == vezes, f"trecho não encontrado ({html.count(antigo)}x): {antigo[:80]}"
        html = html.replace(antigo, novo)

    substitui('<meta name="color-scheme" content="dark">', '<meta name="color-scheme" content="dark light">')

    # esquema de tema compartilhado (mesma chave da página inicial e dos demais módulos)
    substitui(
        "<script>try{const t=localStorage.getItem('avc-theme');if(t==='light'||t==='dark')"
        "document.documentElement.dataset.theme=t;const f=Number(localStorage.getItem('avc-font'));"
        "if(f>=80&&f<=140)document.documentElement.style.fontSize=f+'%';}catch(e){}</script>",
        "<script>try{const r=document.documentElement;const p=JSON.parse(localStorage.getItem('antigravity:a11y:v1')||'{}')||{};"
        "const sl=matchMedia('(prefers-color-scheme: light)').matches;"
        "const light=p.contrast!==true&&(p.theme==='light'||(p.theme==='system'&&sl)||(p.theme==null&&p.clarity===true));"
        "r.dataset.theme=light?'light':'dark';r.style.colorScheme=light?'light':'dark';"
        "r.classList.toggle('a11y-large-text',p.large===true);r.classList.toggle('a11y-contrast',p.contrast===true);"
        "r.classList.toggle('a11y-reduce-motion',p.motion===true);"
        "const f=Number(localStorage.getItem('avc-font'));if(f>=80&&f<=140)r.style.fontSize=f+'%';}catch(e){}</script>",
    )
    substitui(
        '<button type="button" id="theme-toggle" aria-pressed="false" aria-label="Alternar tema claro ou escuro">Tema</button>',
        '<button type="button" id="theme-toggle" aria-pressed="false" aria-label="Ativar visualização clara">☀️ Visualização clara</button>',
    )

    # linha de edição: publicada como prévia, com retorno ao portal
    substitui(
        '<div class="edition">Edição 1.1 · 11 set 2026<br><b>Revisada após auditoria · não publicada</b></div>',
        '<div class="edition">Edição 1.1 · 11 set 2026 · <b>revisada após auditoria</b><br>'
        '<a href="../../index.html#avc-turbo-temi">← Início AldenirMed89</a></div>',
    )

    # faixa de prévia pública em revisão médica (padrão dos módulos clínicos)
    substitui(
        '</header><div id="search-results"',
        '</header><div class="review-strip" role="status"><strong>Revisão médica em andamento:</strong> '
        "prévia pública educacional da edição 1.1, revisada em auditoria independente em 11/09/2026 "
        "(33 identificadores PubMed, comunicados regulatórios, protocolos ENLS e bulas conferidos). "
        "Não é protocolo assistencial homologado: confirme doses, disponibilidade e fluxos no protocolo "
        "institucional e com a equipe de AVC antes de qualquer uso clínico.</div>"
        '<div id="search-results"',
    )

    # nota lateral: origem, auditoria e app anterior
    substitui(
        '<p class="aside-note">Adultos · Emergência e UTI<br>Conteúdo e ferramentas locais.<br>Sem envio de dados clínicos.</p>',
        '<p class="aside-note">Adultos · Emergência e UTI<br>Conteúdo e ferramentas locais.<br>Sem envio de dados clínicos.</p>'
        '<p class="aside-note aside-links"><a href="../../docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md">Relatório da auditoria</a>'
        '<br><a href="../../01_UpDown_Hub/viewer.html?doc=content/intensiva/avc-agudo-turbo-temi.md">Texto canônico no UpDown Hub</a>'
        '<br><a href="../AVC_Agudo/avc.html">App AVC Agudo anterior (2025)</a></p>',
    )

    substitui(
        "<footer>ALDENIRMED89 · Conteúdo educacional para adultos · Edição 1.1 · 11/09/2026 · Sem rastreamento, sem envio de dados</footer>",
        "<footer>ALDENIRMED89 · Conteúdo educacional para profissionais de saúde · Edição 1.1 · 11/09/2026 · "
        "Prévia pública em revisão médica · Sem rastreamento, sem envio de dados</footer>",
    )
    (dst / "index.html").write_text(html, "utf-8")

    # ------------------------------------------------------------------ app.js
    app = (site / "assets" / "app.js").read_text("utf-8")
    antigo_tema = (
        "// ---------- tema e fonte ----------\n"
        "const themeBtn=$('theme-toggle');\n"
        "function applyTheme(t){if(t)document.documentElement.dataset.theme=t;else delete document.documentElement.dataset.theme;"
        "const light=t==='light';if(themeBtn){themeBtn.setAttribute('aria-pressed',String(light));themeBtn.textContent=light?'Tema: claro':'Tema: escuro';}}\n"
        "if(themeBtn){applyTheme(document.documentElement.dataset.theme||null);themeBtn.addEventListener('click',()=>{"
        "const cur=document.documentElement.dataset.theme||'dark';const next=cur==='light'?'dark':'light';applyTheme(next);store.set('avc-theme',next);});}\n"
    )
    novo_tema = (
        "// ---------- tema: esquema compartilhado do AldenirMed89 (antigravity:a11y:v1) ----------\n"
        "const A11Y_KEY='antigravity:a11y:v1';\n"
        "const themeBtn=$('theme-toggle');\n"
        "const lightQuery=matchMedia('(prefers-color-scheme: light)');\n"
        "function readA11y(){try{const p=JSON.parse(localStorage.getItem(A11Y_KEY)||'{}');return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}catch{return {};}}\n"
        "function writeA11y(patch){try{localStorage.setItem(A11Y_KEY,JSON.stringify({...readA11y(),...patch}));return true;}catch{return false;}}\n"
        "function resolveClarity(prefs){if(prefs.contrast===true)return false;if(prefs.theme==='light')return true;if(prefs.theme==='dark')return false;"
        "if(prefs.theme==='system')return lightQuery.matches;return prefs.clarity===true;}\n"
        "function applyA11y(prefs){const root=document.documentElement;const light=resolveClarity(prefs);"
        "root.dataset.theme=light?'light':'dark';root.style.colorScheme=light?'light':'dark';"
        "root.classList.toggle('a11y-large-text',prefs.large===true);root.classList.toggle('a11y-contrast',prefs.contrast===true);"
        "root.classList.toggle('a11y-reduce-motion',prefs.motion===true);"
        "if(themeBtn){themeBtn.setAttribute('aria-pressed',String(light));themeBtn.textContent=light?'☀️ Visualização clara ativa':'☀️ Visualização clara';}}\n"
        "applyA11y(readA11y());\n"
        "if(themeBtn){themeBtn.addEventListener('click',()=>{const prefs=readA11y();const light=!resolveClarity(prefs);"
        "prefs.theme=light?'light':'dark';prefs.clarity=light;writeA11y({theme:prefs.theme,clarity:light});applyA11y(prefs);});}\n"
        "window.addEventListener('storage',e=>{if(e.key===A11Y_KEY)applyA11y(readA11y());});\n"
        "lightQuery.addEventListener('change',()=>{if(readA11y().theme==='system')applyA11y(readA11y());});\n"
    )
    assert app.count(antigo_tema) == 1, "bloco de tema não encontrado em app.js"
    app = app.replace(antigo_tema, novo_tema)
    antigo_clear = (
        "['avc-persist','avc-quiz','avc-cards','avc-theme','avc-font'].forEach(k=>store.del(k));$('persist-toggle').checked=false;"
        "$('persist-status').textContent='Dados locais apagados (progresso, marcações e preferências de tema/fonte).';"
    )
    novo_clear = (
        "['avc-persist','avc-quiz','avc-cards','avc-font'].forEach(k=>store.del(k));$('persist-toggle').checked=false;"
        "$('persist-status').textContent='Dados locais do módulo apagados (progresso, marcações e tamanho da fonte). "
        "A preferência de visualização clara é do portal inteiro e fica no painel de acessibilidade da página inicial.';"
    )
    assert app.count(antigo_clear) == 1, "bloco de limpeza não encontrado em app.js"
    app = app.replace(antigo_clear, novo_clear)
    assert "avc-theme" not in app
    (dst / "assets" / "app.js").write_text(app, "utf-8")

    # --------------------------------------------------------------- style.css
    css = (site / "assets" / "style.css").read_text("utf-8")
    css += (
        "\n/* AldenirMed89: faixa de prévia em revisão médica e esquema de acessibilidade compartilhado */\n"
        ".review-strip{margin:0;padding:.7rem 1rem;background:var(--callout-bg);color:var(--callout-ink);"
        "border-bottom:1px solid var(--line);font-size:.92rem;line-height:1.5}"
        ".review-strip strong{color:var(--warn)}"
        ".aside-links a{display:inline-block;margin-top:.15rem}"
        ".edition a{color:var(--accent);font-weight:400}"
        "html.a11y-large-text{font-size:115%}"
        "html.a11y-contrast{--ink:#ffffff;--muted:#e3ecf7;--line:#9db3cc;--accent:#7ff6dd;--blue:#b3d5ff;--warn:#ffd98a;--danger:#ffb4ab}"
        "html.a11y-reduce-motion{scroll-behavior:auto}"
        "html.a11y-reduce-motion *{transition:none!important;animation:none!important}"
        "@media print{.review-strip{display:block!important;border:1px solid #000;color:#000!important;background:#fff!important}}\n"
    )
    (dst / "assets" / "style.css").write_text(css, "utf-8")

    # ------------------------------------------------- data/visual-assets.json
    pendentes = set(manifesto_imagens["qa"]["audit_1_1"]["pending_regeneration"])
    menores = set(manifesto_imagens["qa"]["audit_1_1"]["minor"])
    figuras = []
    for a in manifesto_imagens["assets"]:
        n = a["index"]
        if n in pendentes:
            estado = "correcao-pendente"
        elif n in menores:
            estado = "ajuste-menor-recomendado"
        else:
            estado = "inspecionada-sem-erro-relevante"
        figuras.append(
            {
                "index": n,
                "file": Path(a["webp"]).name,
                "title": a["title"],
                "alt": a["alt"],
                "servedFormat": "image/webp",
                "servedDimensions": a["webp_dimensions"],
                "servedBytes": a["webp_bytes"],
                "servedSha256": a["webp_sha256"],
                "originalPng": {
                    "file": a["file"],
                    "dimensions": [a["width"], a["height"]],
                    "sha256": a["sha256"],
                    "location": "pacote auditado AVC_TURBO_TEMI_2026-09-11_v1.1 (fora do repositório)",
                },
                "synthetic": True,
                "diagnosticUse": False,
                "auditState": estado,
                "auditNote": a.get("audit_1_1", ""),
            }
        )
    vetor = manifesto_imagens["vector_assets"][0]
    ledger = {
        "schemaVersion": "1.0.0",
        "module": "avc-turbo-temi",
        "edition": EDICAO,
        "updatedAt": DATA_EDICAO,
        "generator": manifesto_imagens["generator"],
        "purpose": manifesto_imagens["purpose"],
        "limits": manifesto_imagens["limits"],
        "auditSummary": {
            "date": manifesto_imagens["qa"]["audit_1_1"]["date"],
            "method": manifesto_imagens["qa"]["audit_1_1"]["method"],
            "pendingRegeneration": sorted(pendentes),
            "minorAdjustments": sorted(menores),
            "note": "As legendas das figuras com correção pendente já trazem a correção em texto; a figura 21 (SVG) mostra a distribuição correta do sangue na TC.",
        },
        "count": len(figuras) + 1,
        "images": figuras,
        "vectorImages": [
            {
                "index": vetor["index"],
                "file": vetor["file"],
                "title": vetor["title"],
                "generator": vetor["generator"],
                "notes": vetor["notes"],
                "synthetic": True,
                "diagnosticUse": False,
                "auditState": "desenhada-na-auditoria-1.1",
            }
        ],
    }
    (dst / "data" / "visual-assets.json").write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", "utf-8")

    # ------------------------------------------------------ module.manifest.json
    manifest = {
        "schemaVersion": "1.0.0",
        "id": "avc-turbo-temi",
        "title": "AVC agudo — Turbo TEMI (isquêmico, HIC e HSA)",
        "shortTitle": "AVC Turbo TEMI",
        "emoji": "🧠",
        "entrypoint": "index.html",
        "href": f"{MODULO_REL}/index.html",
        "version": "1.1.0",
        "status": "em-revisao-medica",
        "clinicalReviewRequired": True,
        "publication": {
            "mode": "public-preview",
            "publicPreview": True,
            "clinicalReviewOngoing": True,
            "purpose": "educacional-e-apoio-cognitivo",
            "authorizedAt": DATA_EDICAO,
            "previewReason": "O proprietário solicitou a publicação da edição 1.1 após auditoria independente (11/09/2026). A auditoria conferiu fontes, doses, escalas, figuras e software; não substitui homologação clínica assinada.",
        },
        "updatedAt": DATA_EDICAO,
        "category": [
            "Medicina Intensiva",
            "Medicina de Emergência",
            "Neurointensivismo",
            "Neurologia vascular",
            "Neurocirurgia",
            "TEMI",
        ],
        "keywords": [
            "AVC isquêmico",
            "hemorragia intracerebral",
            "hemorragia subaracnóidea",
            "NIHSS",
            "trombólise",
            "tenecteplase",
            "alteplase",
            "trombectomia",
            "oclusão de vaso médio",
            "Fisher",
            "Hunt–Hess",
            "WFNS",
            "ABC/2",
            "ICH Score",
            "reversão de anticoagulação",
            "andexanet",
            "complexo protrombínico",
            "vasoespasmo",
            "nimodipino",
            "hidrocefalia",
            "edema maligno",
            "craniectomia",
            "estado de mal epiléptico",
            "angioedema",
        ],
        "features": [
            "Dez percursos: primeiros minutos, isquêmico, HIC, HSA, NIHSS, escalas, complicações, fármacos, laboratório TEMI e referências",
            "Calculadora NIHSS item a item com UN, subtotal explícito, alertas de coerência em coma e comparação com exame anterior",
            "Fisher original e modificado, Hunt–Hess, Glasgow → WFNS, ABC/2 e ICH Score com o critério exposto e sem decisão automatizada",
            "Relógio do código AVC com janelas de reperfusão a partir da última vez visto bem",
            "Dezesseis roteiros de deterioração neurológica e sistêmica",
            "Dezessete fichas farmacológicas com limites de fonte declarados, incluindo alternativas disponíveis no Brasil",
            "Sete casos com progressão, 25 questões comentadas alternativa por alternativa e 30 flashcards com plano D1–D30",
            "Vinte ilustrações conceituais em WebP e uma figura vetorial dos compartimentos na TC",
            "Busca local, tema compartilhado do portal, fonte ampliada, impressão e navegação por teclado",
            "HTML, CSS e JavaScript puros; sem dependências externas de runtime",
        ],
        "visualAtlas": {
            "id": "avc-turbo-temi-figuras",
            "count": 21,
            "format": "widescreen",
            "servedDimensions": "1280x720 (WebP)",
            "synthetic": True,
            "diagnosticUse": False,
            "assetDirectory": "assets/images",
            "ledger": "data/visual-assets.json",
            "reviewStatus": "3 figuras com correcao pendente (03, 06, 13); legendas ja trazem a correcao em texto",
        },
        "privacy": {
            "networkRuntime": False,
            "cloud": False,
            "telemetry": False,
            "patientData": False,
            "siteWideAnalytics": "O build público pode injetar o contador agregado de visitas do portal; não há telemetria clínica nem envio do exame ou das respostas.",
            "localStorage": [
                "preferência global de visualização clara (antigravity:a11y:v1)",
                "tamanho da fonte do módulo",
                "progresso de questões e flashcards, somente quando o leitor marca a opção de guardar",
            ],
        },
        "evidence": {
            "cutoffDate": DATA_EDICAO,
            "referenceCount": len(referencias),
            "sourceFamilies": [
                "AHA/ASA — AVC isquêmico agudo 2026",
                "AHA/ASA — hemorragia intracerebral 2022",
                "ESO/EANS — hemorragia intracerebral 2025",
                "AHA/ASA — hemorragia subaracnóidea aneurismática 2023",
                "Neurocritical Care Society ENLS 6.0",
                "Ensaios ESCAPE-MeVO, DISTAL, ORIENTAL-MeVO, INTERACT3/4, ANNEXA-I, ENRICH, SELECT2, ANGEL-ASPECT, DEFUSE 3, DAWN, EXTEND, CHANCE, POINT, SHINE, PATCH",
                "FDA — retirada do andexanet alfa (2025)",
                "Bulas DailyMed (KCENTRA, nimodipino)",
                "Escalas originais: NIHSS, Fisher 1980, Frontera 2006, Hunt–Hess 1968, WFNS 1988, Kothari 1996, Hemphill 2001",
            ],
            "sourceAccessLimits": "Texto integral em ahajournals.org (AIS 2026 e HIC 2022), PCDT do Ministério da Saúde e diretriz SBDCV 2012 não foram acessados na auditoria; esses pontos foram conferidos por resumos oficiais e estão marcados no relatório.",
            "uncertaintyLabelsRequired": True,
        },
        "safetyNotice": "Conteúdo educacional e apoio cognitivo para adultos. Não substitui equipe de AVC, neurocirurgia, neurorradiologia nem protocolo institucional. Doses e diluições exigem dupla checagem local; as fichas adaptadas ao Brasil aguardam conferência com a farmácia do serviço.",
        "audit": {
            "date": DATA_EDICAO,
            "auditor": "Claude (Anthropic), a pedido do proprietário",
            "report": "docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md",
            "findings": {"total": 50, "high": 3, "medium": 12, "low": 35, "highResolved": 3},
            "verifiedPubMedIds": 33,
            "scope": "fontes, doses, escalas, figuras, aprendizagem, software e acessibilidade",
            "isClinicalCertification": False,
        },
        "reviewGate": {
            "owner": "Aldenir Rocha de Oliveira Filho",
            "requiredBeforeActive": [
                "revisão médica assinada do conteúdo clínico (neurologia vascular ou neurointensivismo)",
                "regenerar as figuras 03, 06 e 13 e reinspecionar 12, 15, 16, 17 e 20",
                "conferir com a farmácia e o protocolo do serviço as fichas de metoprolol, esmolol, nitroprussiato e diazepam",
                "obter o texto integral de AHA/ASA AIS 2026, AHA/ASA HIC 2022 e do PCDT vigente e reconferir os pontos marcados",
                "testar em Safari/iOS",
                "registrar data, versão e responsável por cada revisão e mudar status para ativo somente após homologação documentada",
            ],
        },
    }
    (dst / "module.manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", "utf-8")

    # -------------------------------------------------------------- README.md
    (dst / "README.md").write_text(README, "utf-8")
    (dst / "CHECKLIST_OPERACIONAL.md").write_text(CHECKLIST, "utf-8")

    # ------------------------------------------------- Markdown canônico (hub)
    (ROOT / MD_REL).write_text(gerar_markdown_canonico(conteudo, imagens, referencias), "utf-8")

    # ------------------------------------------------- relatório de auditoria
    relatorio = (src / "auditoria" / "ACHADOS_AUDITORIA_2026-09-11.md").read_text("utf-8")
    cabecalho = (
        "> Relatório da auditoria independente da edição 1.0 do módulo **AVC agudo — Turbo TEMI**, "
        "que originou a edição 1.1 publicada em "
        f"[01_Modulos_Clinicos/AVC_Turbo_TEMI](../{MODULO_REL}/index.html). "
        "Auditoria de fontes, doses, escalas, figuras, aprendizagem, software e acessibilidade; "
        "**não é homologação clínica**. Reproduzido do pacote auditado sem alteração de conteúdo.\n\n"
    )
    (ROOT / AUDITORIA_REL).write_text(cabecalho + relatorio, "utf-8")

    # ----------------------------------------------------------- conferências
    texto = html
    remotos = [m for m in re.findall(r'(?:src|srcset)="([^"]+)"', texto) if m.startswith(("http", "//"))]
    assert not remotos, f"asset remoto no HTML: {remotos[:3]}"
    for tag in ('<script src="http', '<link rel="stylesheet" href="http', "@import"):
        assert tag not in texto, f"dependência remota: {tag}"
    for f in dst.rglob("*"):
        if f.suffix in (".js", ".css"):
            t = f.read_text("utf-8")
            assert "http://" not in t and "https://" not in t, f"recurso remoto em {f.name}"
    refs = len(re.findall(r'href="(https://[^"]+)"', texto))
    assert refs >= len(referencias), f"referências externas esperadas: {len(referencias)}, obtidas {refs}"
    faltando = [
        m
        for m in re.findall(r'(?:src|href)="([^"#:]+)"', texto)
        if not m.startswith(("data:", "mailto:", "..", "#")) and not (dst / m).exists()
    ]
    assert not faltando, f"arquivos referenciados ausentes: {faltando[:5]}"
    for m in re.findall(r'href="(\.\./[^"#?]+)"', texto):
        assert (dst / m).resolve().exists(), f"ligação relativa quebrada: {m}"

    total = sum(f.stat().st_size for f in dst.rglob("*") if f.is_file())
    print(
        json.dumps(
            {
                "modulo": MODULO_REL,
                "arquivos": sum(1 for f in dst.rglob("*") if f.is_file()),
                "tamanho_MB": round(total / 1e6, 2),
                "figuras_webp": n_fig,
                "links_convertidos": n_amp,
                "markdown": MD_REL,
                "auditoria": AUDITORIA_REL,
            },
            ensure_ascii=False,
        )
    )


def gerar_markdown_canonico(conteudo: Path, imagens: dict, referencias: list) -> str:
    """Converte conteudo/modulo.md (com diretivas de build) em Markdown legível no UpDown Hub."""
    md = (conteudo / "modulo.md").read_text("utf-8")
    dados = {
        "farmacos": json.loads((conteudo / "farmacos.json").read_text("utf-8")),
        "aprendizagem": json.loads((conteudo / "aprendizagem.json").read_text("utf-8")),
    }
    n_fichas = len(dados["farmacos"]) if isinstance(dados["farmacos"], list) else len(dados["farmacos"].get("fichas", dados["farmacos"]))
    apr = dados["aprendizagem"]
    n_q = len(apr.get("questoes", apr.get("questions", [])))
    n_c = len(apr.get("casos", apr.get("cases", [])))
    n_f = len(apr.get("flashcards", []))
    modulo_href = f"../../../{MODULO_REL}/index.html"

    # cabeçalho original -> frontmatter + título
    md = re.sub(r"\A# AVC agudo • Turbo TEMI\n\nEdição 1\.1[^\n]*\n", "", md)
    # "## id | Título" -> "## Título" com âncora para o módulo
    def secao(m: re.Match[str]) -> str:
        sid, titulo = m.group(1).strip(), m.group(2).strip()
        return f"## {titulo}\n\n> Versão interativa desta seção: [{titulo}]({modulo_href}#{sid})"
    md = re.sub(r"^## ([a-z0-9-]+) \| (.+)$", secao, md, flags=re.M)

    def figura(m: re.Match[str]) -> str:
        n = int(m.group(1))
        if n == 21:
            return (
                f"![Onde está o sangue? Quatro compartimentos na TC — figura vetorial]"
                f"(../../../{MODULO_REL}/assets/images/21_compartimentos_vetor.svg)\n\n"
                "*Figura 21 — Onde está o sangue? Quatro compartimentos na TC (desenho vetorial da auditoria 1.1).*"
            )
        meta = imagens[n]
        return (
            f"![{meta['alt']}](../../../{MODULO_REL}/{meta['webp']})\n\n"
            f"*Figura {n:02d} — {meta['title']}. Ilustração conceitual gerada por IA; não é exame real.*"
        )
    md = re.sub(r"\{\{figure:(\d+)\}\}", figura, md)

    ferramentas = {
        "nihss": "Calculadora NIHSS (item a item, UN, subtotal explícito, comparação com exame anterior)",
        "scales": "Fisher original e modificado, Hunt–Hess e Glasgow → WFNS",
        "ichscore": "ICH Score (Hemphill 2001), com aviso contra uso prognóstico individual",
        "abc2": "ABC/2 (Kothari 1996) para volume estimado do hematoma",
        "clock": "Relógio do código AVC — janelas a partir da última vez visto bem",
        "questions": f"{n_q} questões comentadas alternativa por alternativa",
        "flashcards": f"{n_f} flashcards com modo treino",
        "study": "plano de revisão espaçada D1–D30 gerado no aparelho",
    }

    # conteúdo substantivo dos JSON: fichas, roteiros de deterioração e casos
    fichas = dados["farmacos"]
    blocos = []
    for fx in fichas:
        blocos.append(
            f"### {fx['name']}\n\n"
            f"| Campo | Conteúdo |\n|---|---|\n"
            f"| Indicação | {fx['indication']} |\n"
            f"| Dose | {fx['dose']} |\n"
            f"| Preparo | {fx['preparation']} |\n"
            f"| Monitorizar | {fx['monitor']} |\n"
            f"| Limites | {fx['limits']} |\n"
            f"| Fontes | {fx['refs']} |\n"
        )
    md = md.replace(
        "{{drugs}}",
        f"> 💊 {len(fichas)} fichas. Toda dose exige conferência na bula, no protocolo institucional e com a farmácia; "
        "as fichas adaptadas ao Brasil aguardam conferência local.\n\n" + "\n".join(blocos),
    )
    complicacoes = json.loads((conteudo / "complicacoes.json").read_text("utf-8"))
    blocos = []
    for cx in complicacoes:
        agora = "\n".join(f"  {i + 1}. {passo}" for i, passo in enumerate(cx["now"]))
        blocos.append(
            f"### {cx['title']} ({cx['group']} · {cx['when']})\n\n"
            f"- **Reconhecer:** {cx['recognize']}\n"
            f"- **Agora:**\n{agora}\n"
            f"- **Investigar:** {cx['investigate']}\n"
            f"- **Evitar:** {cx['avoid']}\n"
            f"- **Reavaliar:** {cx['reassess']}\n"
            f"- **Fontes:** {cx['refs']}\n"
        )
    md = md.replace("{{complications}}", f"{len(complicacoes)} roteiros de deterioração.\n\n" + "\n".join(blocos))
    blocos = []
    for kx in apr.get("cases", []):
        passos = "\n".join(f"- **{q}** {a}" for q, a in kx["steps"])
        blocos.append(f"### {kx['title']}\n\n{kx['context']}\n\n{passos}\n\n_Fontes: {kx['refs']}_\n")
    md = md.replace("{{cases}}", f"{n_c} casos fictícios com progressão.\n\n" + "\n".join(blocos))
    for chave, descricao in ferramentas.items():
        md = md.replace(
            "{{" + chave + "}}",
            f"> 🧰 **Ferramenta interativa — {descricao}.** Disponível somente no [módulo publicado]({modulo_href}); "
            "a versão em texto não substitui o exame item a item nem decide tratamento.",
        )
    linhas = [f"{len(referencias)} referências com função declarada (conferidas na auditoria de 11/09/2026):", ""]
    for r in referencias:
        rid, titulo, url = r.get("id", ""), r.get("title", ""), r.get("url", "")
        ano, tipo, funcao = r.get("year", ""), r.get("type", ""), r.get("supports", "")
        item = f"- **{rid}** — {titulo}"
        if ano or tipo:
            item += f" ({', '.join(x for x in (tipo, ano) if x)})"
        if funcao:
            item += f" — _{funcao}_"
        if url:
            item += f" — <{url}>"
        linhas.append(item)
    md = md.replace("{{references}}", "\n".join(linhas))
    assert "{{" not in md, "diretiva de build não convertida no Markdown canônico"

    frontmatter = (
        "---\n"
        'title: "AVC agudo — Turbo TEMI (isquêmico, HIC e HSA)"\n'
        'slug: "avc-agudo-turbo-temi"\n'
        'category: "Medicina Intensiva / Emergência / Neurointensivismo"\n'
        "tags: [AVC isquêmico, hemorragia intracerebral, HSA, NIHSS, trombólise, trombectomia, Fisher, Hunt-Hess, WFNS, TEMI]\n"
        'status: "em_revisao"\n'
        'visibility: "publico"\n'
        'source_type: "síntese autoral de diretrizes, ensaios e escalas originais, auditada em 11/09/2026"\n'
        'copyright_safety: "reescrita autoral, sem cópia literal extensa"\n'
        "links_relacionados:\n"
        f'  - "{modulo_href}"\n'
        '  - "../../../01_Modulos_Clinicos/AVC_Agudo/avc.html"\n'
        '  - "../../../docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md"\n'
        'created_for: "AldenirMed89 / Enciclopédia Médica"\n'
        f'updated_at: "{DATA_EDICAO}"\n'
        f'edition: "{EDICAO}"\n'
        "---\n\n"
        "# AVC agudo — Turbo TEMI\n\n"
        f"Edição {EDICAO}, revisada após auditoria independente em {DATA_EDICAO_BR}. Adultos. "
        f"Texto canônico do [módulo interativo]({modulo_href}) — {n_fichas} fichas farmacológicas, "
        f"{n_q} questões, {n_c} casos, {n_f} flashcards e 21 figuras ficam na versão publicada.\n\n"
        "> ⚠️ **Prévia pública em revisão médica.** Conteúdo educacional e apoio cognitivo; não substitui equipe de AVC, "
        "neurocirurgia nem protocolo institucional. Doses exigem dupla checagem local.\n\n"
    )
    return frontmatter + md.strip() + "\n"


README = f"""# AVC agudo — Turbo TEMI (edição {EDICAO})

Módulo estático e interativo sobre AVC isquêmico, hemorragia intracerebral e
hemorragia subaracnóidea: primeiros minutos, reperfusão, controle pressórico,
reversão de anticoagulação, HSA e vasoespasmo, escalas, complicações, fármacos e
laboratório de estudo para o TEMI.

Esta pasta é **artefato de publicação**. A fonte editável é o pacote auditado
`AVC_TURBO_TEMI_2026-09-11_v1.1` (fora do repositório), que contém
`conteudo/*.md|json`, `build.py`, testes, evidências de QA e as 20 ilustrações
PNG originais de 1672 px. A pasta é regenerada por
`scripts_admin/gerar_modulo_avc_turbo_temi.py <pacote>`.

## Arquivos

- `index.html` — dez percursos, calculadoras, laboratório TEMI e referências.
- `assets/style.css` — layout responsivo, tema compartilhado do portal, impressão.
- `assets/app.js` — navegação, busca local, tema, quiz, flashcards, ferramentas.
- `assets/nihss.js` — regras de pontuação NIHSS (UN, subtotal, coerência em coma).
- `assets/tools.js` — ABC/2, Glasgow → WFNS, ICH Score, Fisher, relógio, revisão espaçada.
- `assets/data.js` — fichas farmacológicas, casos, questões, flashcards e referências.
- `assets/images/` — 20 figuras WebP (1280 px) e uma figura vetorial SVG.
- `data/visual-assets.json` — registro auditável das figuras (hashes, estado de auditoria).
- `module.manifest.json` — publicação, privacidade, evidência, auditoria e gate de revisão.
- `CHECKLIST_OPERACIONAL.md` — checklists de uso e de homologação.
- `manifest.webmanifest` — metadados de instalação; o cache offline é do `sw.js` da raiz.

## Diferenças em relação ao pacote auditado

1. Figuras 01–20 servidas em WebP (1,8 MB no total, contra 37,8 MB em PNG); os
   PNG originais permanecem no pacote, com hashes registrados em
   `data/visual-assets.json`.
2. Tema integrado ao esquema de acessibilidade do portal
   (`antigravity:a11y:v1`): Visualização clara, texto ampliado, alto contraste e
   redução de movimento seguem a preferência global.
3. Faixa visível de prévia pública em revisão médica, linha de edição com
   retorno à página inicial e ligações para o relatório de auditoria, para o
   texto canônico no UpDown Hub e para o app AVC Agudo anterior.

Nenhum texto clínico, referência, calculadora ou aviso foi alterado no transporte.

## Limites de segurança

- Conteúdo educacional e apoio cognitivo para adultos; não é protocolo
  assistencial homologado nem serviço assistencial.
- Nenhum dado digitado nas calculadoras é guardado ou transmitido; o progresso
  de estudo só fica no aparelho se o leitor marcar a opção.
- Campo vazio não vale zero, item não testável (UN) não entra como zero e o
  subtotal nunca é apresentado como total; soma isolada não decide reperfusão
  nem prognóstico.
- As figuras são esquemas gerados por IA, não exames reais; as figuras 03, 06 e
  13 têm correção pendente, antecipada nas legendas e na figura 21.
- As fichas adaptadas ao Brasil (metoprolol, esmolol, nitroprussiato, diazepam)
  aguardam conferência com a farmácia e o protocolo do serviço.
- O estado é `em-revisao-medica` com `public-preview`; mudar para `ativo`
  exige cumprir o `reviewGate` do manifesto.

## Auditoria

A edição 1.0 passou por auditoria independente em {DATA_EDICAO_BR}: 33
identificadores PubMed, comunicados regulatórios, protocolos ENLS e bulas
conferidos; 50 achados (3 altos, todos corrigidos; 12 médios; 35 baixos);
nenhum erro de dose ou unidade confirmado nas fichas. Relatório completo em
`docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md`. A auditoria não é
certificação clínica.

## Validação

```bash
python3 -m unittest tests.test_avc_turbo_temi_module -v
node --check {MODULO_REL}/assets/app.js
node --check {MODULO_REL}/assets/nihss.js
node --check {MODULO_REL}/assets/tools.js
python3 scripts_admin/validate_mapa_vivo.py data/connections.json
```

No pacote auditado: `python3 build.py --require-images`, `python3 testes/estrutura.py`,
`node testes/nihss.test.cjs`, `node testes/tools.test.cjs` e `node testes/browser.cjs`.
"""

CHECKLIST = f"""# Checklist operacional — AVC agudo Turbo TEMI (edição {EDICAO})

## Antes de usar no plantão

- [ ] Ler a faixa de prévia: o módulo é educacional e está em revisão médica.
- [ ] Confirmar o protocolo institucional de AVC, a disponibilidade de trombolítico,
      trombectomia, reversores e nimodipino no serviço.
- [ ] Registrar dois tempos: última vez visto bem e hora da descoberta dos sintomas.
- [ ] Preencher o NIHSS item a item; usar UN só quando o manual admite barreira física.
- [ ] Tratar subtotal como subtotal; não usar soma isolada para decidir reperfusão.
- [ ] Conferir cada dose na bula e no protocolo local antes de prescrever.

## Antes de publicar uma nova edição

- [ ] Editar no pacote auditado, reconstruir (`build.py --require-images`) e rodar
      `estrutura.py`, `nihss.test.cjs`, `tools.test.cjs` e `browser.cjs`.
- [ ] Regenerar esta pasta com `scripts_admin/gerar_modulo_avc_turbo_temi.py`.
- [ ] Atualizar `module.manifest.json` (versão, data, evidência) e `data/visual-assets.json`.
- [ ] Registrar os arquivos alterados em `data/editorial/registry.json` com fontes.
- [ ] Rodar `python3 -m unittest tests.test_avc_turbo_temi_module` e os portões do CI.
- [ ] Atualizar `sw.js` (versão do cache) se arquivos do módulo mudarem.

## Homologação clínica (para mudar o status para `ativo`)

- [ ] Revisão médica assinada (neurologia vascular ou neurointensivismo).
- [ ] Figuras 03, 06 e 13 regeneradas e reinspecionadas; 12, 15, 16, 17 e 20 revistas.
- [ ] Fichas brasileiras conferidas com a farmácia e o protocolo do serviço.
- [ ] Texto integral de AHA/ASA AIS 2026, HIC 2022 e PCDT vigente reconferido.
- [ ] Teste em Safari/iOS.
- [ ] Data, versão e responsável registrados no manifesto e no registro editorial.
"""


if __name__ == "__main__":
    main()
