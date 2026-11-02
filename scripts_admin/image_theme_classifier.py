"""Conservative, local topic labels for the private 360X image collection.

This module reads no files and performs no OCR or network requests. The caller
supplies a relative name and optional Apple Vision lines. A label describes the
written subject of an image; it is never a diagnosis or permission to publish.
Vision coordinates have their origin at the bottom left (larger y is higher).
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
import math
import re
import unicodedata


CLASSIFIER_VERSION = "360x-topics-1.0"

# Keep existing CardFeed IDs stable. The final ten entries extend the vocabulary
# only for local organization; the module does not change a public manifest.
THEMES = {
    "uti-geral": "UTI Geral",
    "temi": "TEMI",
    "vm-sdra": "Ventilação Mecânica / SDRA",
    "sepse-choque": "Sepse / Choque",
    "nefro-aki-trs": "Nefro / AKI / TRS",
    "endocrino-diabetes": "Endócrino / Diabetes",
    "neuro-uti": "Neuro UTI",
    "cardio-hemodinamica": "Cardio / Hemodinâmica",
    "infectologia": "Infectologia",
    "farmaco-doses": "Farmacologia / Doses",
    "pocus": "POCUS / USG",
    "familia-paciente": "Família / Paciente",
    "ia-produtividade": "IA / Obsidian / Produtividade",
    "reumato-imuno": "Reumatologia / Imuno",
    "pneumologia": "Pneumologia",
    "gastro-hepato-nutricao": "Gastro / Hepato / Nutrição",
    "hematologia-trombose": "Hematologia / Trombose",
    "dermato-feridas": "Dermatologia / Feridas",
    "tdah-neurodiversidade": "TDAH / Neurodiversidade",
    "identidade-360x": "Identidade 360X",
    "fe-espiritualidade": "Fé / Espiritualidade",
    "vida-organizacao": "Vida / Organização",
    "pdd-acervo": "PDD / Acervo",
    "a-classificar": "A classificar",
}


def _normalize(text):
    text = unicodedata.normalize("NFKD", str(text or "")).casefold()
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


@dataclass(frozen=True)
class _Rule:
    theme: str
    label: str
    weight: float
    terms: tuple[str, ...]


def _rule(theme, label, weight, *terms):
    return _Rule(theme, label, weight, tuple(_normalize(t) for t in terms))


# Specific written subjects are stronger than context words. Do not add bare
# "paciente", "clínica", "família", "IA", "TEMI", "UTI", "PDD", "IRA",
# "choque" or "focus": each has important nonclinical or branding ambiguity.
RULES = (
    _rule("uti-geral", "Cuidados intensivos", 4.5, "cuidados intensivos", "terapia intensiva", "intensive care"),
    _rule("uti-geral", "Rotina da UTI", 4.7, "checklist uti", "admissao na uti", "rotina da uti", "round multiprofissional"),
    _rule("uti-geral", "Segurança do paciente", 4.8, "seguranca do paciente", "bundle abcdef", "mobilizacao precoce"),
    _rule("temi", "Preparação para prova", 4.8, "prova de titulo", "estrategia de prova", "preparacao temi", "revisao temi", "estudo para temi"),
    _rule("temi", "Questões e simulados", 4.6, "questoes comentadas", "banco de questoes", "simulado cronometrado", "questoes temi", "simulado temi"),
    _rule("vm-sdra", "Ventilação mecânica", 4.6, "ventilacao mecanica", "ventilacao invasiva", "ventilacao nao invasiva", "ventilador", "ventilatoria", "ventilatorio"),
    _rule("vm-sdra", "SDRA", 5.2, "sdra", "ards", "sindrome do desconforto respiratorio agudo"),
    _rule("vm-sdra", "Ajustes ventilatórios", 4.6, "peep", "auto peep", "pressao de plato", "driving pressure", "volume corrente", "hiperinsuflacao dinamica", "complacencia pulmonar", "baixa complacencia"),
    _rule("vm-sdra", "Sincronia e desmame", 4.7, "esforcos ineficazes", "assincronia", "desmame ventilatorio", "extubacao", "intubacao", "prona", "peep intrinseca"),
    _rule("sepse-choque", "Sepse", 5.1, "sepse", "sepsis", "choque septico", "choque distributivo", "schoque septico"),
    _rule("sepse-choque", "Ressuscitação do choque", 4.6, "ressuscitacao hemodinamica", "ressuscitacao volemica", "fluid responsiveness", "choque refratario", "choque hipovolemico"),
    _rule("nefro-aki-trs", "Lesão renal e diálise", 5.0, "lesao renal aguda", "injuria renal aguda", "aki", "dialise", "hemodialise", "terapia renal substitutiva", "trs", "crrt"),
    _rule("nefro-aki-trs", "Nefrologia", 4.8, "nefrologia", "glomerulonefrite", "sindrome nefrotica", "sindrome nefritica", "glomerulopatia", "uremia"),
    _rule("nefro-aki-trs", "Eletrólitos e equilíbrio ácido-base", 4.6, "hiponatremia", "hipernatremia", "hipercalemia", "hipocalemia", "disnatremia", "acidose metabolica", "alcalose metabolica"),
    _rule("endocrino-diabetes", "Diabetes", 5.1, "diabetes", "cetoacidose diabetica", "estado hiperosmolar", "insulinoterapia", "hipoglicemia", "hiperglicemia"),
    _rule("endocrino-diabetes", "Endocrinologia", 4.9, "endocrinologia", "tireoide", "tireotoxicose", "hipotireoidismo", "hipertireoidismo", "insuficiencia adrenal", "crise adrenal", "feocromocitoma"),
    _rule("neuro-uti", "AVC e hemorragia cerebral", 5.2, "avc", "acidente vascular cerebral", "hemorragia intracerebral", "hemorragia subaracnoidea", "trombectomia cerebral", "nihss"),
    _rule("neuro-uti", "Neurointensivismo", 5.0, "neuro uti", "neurointensivismo", "hipertensao intracraniana", "traumatismo cranioencefalico", "tce", "morte encefalica", "neuromonitorizacao"),
    _rule("neuro-uti", "Delirium e crises neurológicas", 5.0, "delirium", "estado de mal epileptico", "crise convulsiva", "convulsao", "encefalite", "coma", "meningite tuberculosa", "neuro tb", "neurotb"),
    _rule("cardio-hemodinamica", "Cardiologia", 5.0, "infarto", "sindrome coronariana", "insuficiencia cardiaca", "cardiomiopatia", "miocardite", "arritmia", "fibrilacao atrial", "taquicardia", "bradicardia", "eletrocardiograma", "ecg"),
    _rule("cardio-hemodinamica", "Hemodinâmica", 4.6, "hemodinamica", "debito cardiaco", "choque cardiogenico", "choque obstrutivo", "tamponamento", "ventriculo direito", "funcao ve", "pressao arterial invasiva"),
    _rule("infectologia", "Tuberculose", 5.3, "tuberculose", "tuberculosis", "tb pulmonar", "tb extrapulmonar", "mal de pott", "bacilo de koch", "rifampicina", "isoniazida", "bedaquilina"),
    _rule("infectologia", "Micoses e infecções fúngicas", 5.1, "micose", "micoses", "candidemia", "aspergilose", "histoplasmose", "criptococose", "paracoccidioidomicose", "pneumocistose", "mucormicose"),
    _rule("infectologia", "Infecções e microbiologia", 4.9, "infectologia", "infeccao hospitalar", "endocardite", "bacteremia", "antibioticoterapia", "antimicrobianos", "antibiograma", "hiv", "aids", "dengue", "leptospirose"),
    _rule("farmaco-doses", "Farmacologia e doses", 4.9, "farmacologia", "farmacocinetica", "farmacodinamica", "ajuste de dose", "ajustes de dose", "diluicao", "diluicoes", "dose de ataque", "interacoes medicamentosas"),
    _rule("farmaco-doses", "Antifúngicos", 5.0, "antifungicos", "anfotericina", "voriconazol", "fluconazol", "equinocandinas", "posaconazol", "isavuconazol"),
    _rule("farmaco-doses", "Medicamentos", 4.4, "noradrenalina", "dobutamina", "vasopressina", "propofol", "midazolam", "dexmedetomidina", "ketamina", "cetamina"),
    _rule("pocus", "POCUS / Ultrassonografia", 5.3, "pocus", "usg", "ultrassom", "ultrassonografia", "ecografia", "ultrasound", "ecocardiografia focada", "ecocardiograma a beira leito"),
    _rule("pocus", "Protocolos ultrassonográficos", 5.1, "protocolo rush", "protocolo blue", "veXus", "visao geral focus", "cinco janelas focus", "compressibilidade venosa", "linhas b", "sinal do deslizamento pleural"),
    _rule("familia-paciente", "Comunicação e decisões compartilhadas", 5.0, "comunicacao de mas noticias", "comunicacao com familiares", "reuniao familiar", "decisao compartilhada", "decisoes compartilhadas", "protocolo spikes", "relacao medico paciente"),
    _rule("familia-paciente", "Cuidados paliativos", 5.1, "cuidados paliativos", "objetivos de cuidado", "diretivas antecipadas", "fim de vida", "limitacao de suporte"),
    _rule("ia-produtividade", "IA e automação", 4.9, "inteligencia artificial", "engenharia de prompt", "engenharia de prompts", "prompt engineering", "agentes de ia", "automacao", "automacoes", "tokens", "llm", "workflow"),
    _rule("ia-produtividade", "Conhecimento digital", 4.9, "obsidian", "notion", "codex", "claude code", "gestao do conhecimento", "segundo cerebro", "zettelkasten", "produtividade digital"),
    _rule("reumato-imuno", "IgG4 e imunologia", 5.2, "igg4", "doenca relacionada a igg4", "imunodeficiencia", "imunologia", "autoimunidade"),
    _rule("reumato-imuno", "Reumatologia", 5.0, "reumatologia", "lupus", "vasculite", "vasculites", "artrite reumatoide", "esclerose sistemica", "sjogren", "miopatia inflamatoria", "dermatomiosite"),
    _rule("pneumologia", "DPOC", 5.3, "dpoc", "copd", "doenca pulmonar obstrutiva cronica"),
    _rule("pneumologia", "Pneumonia", 5.2, "pneumonia", "pneumonia comunitaria", "pneumonia adquirida na comunidade"),
    _rule("pneumologia", "Doenças pulmonares", 5.0, "pneumologia", "asma", "bronquiectasia", "fibrose cistica", "fibrose pulmonar", "doenca intersticial", "enfisema", "sarcoidose", "pneumotorax", "derrame pleural"),
    _rule("gastro-hepato-nutricao", "Gastroenterologia e hepatologia", 5.1, "gastroenterologia", "hepatologia", "cirrose", "hepatite", "insuficiencia hepatica", "encefalopatia hepatica", "pancreatite", "hemorragia digestiva", "colangite", "colecistite", "sindrome hepatorrenal", "ascite"),
    _rule("gastro-hepato-nutricao", "Nutrição clínica", 5.0, "nutricao enteral", "nutricao parenteral", "terapia nutricional", "sindrome de realimentacao", "desnutricao", "avaliacao nutricional"),
    _rule("hematologia-trombose", "Trombose e anticoagulação", 5.1, "tvp", "tep", "trombose", "tromboembolismo", "embolia pulmonar", "anticoagulacao", "hemostasia", "coagulopatia", "coagulacao intravascular disseminada", "wells", "d dimero", "ddimero"),
    _rule("hematologia-trombose", "Hematologia", 5.0, "hematologia", "anemia", "plaquetopenia", "trombocitopenia", "neutropenia", "leucemia", "linfoma", "mieloma", "hemolise", "transfusao", "hemocomponentes"),
    _rule("dermato-feridas", "Pele e feridas", 5.0, "dermatologia", "feridas", "ferida", "lesao por pressao", "ulcera por pressao", "curativos", "desbridamento", "queimadura", "fasciite necrosante", "lesao cutanea"),
    _rule("tdah-neurodiversidade", "TDAH e neurodiversidade", 5.3, "tdah", "adhd", "neurodiversidade", "neurodivergencia", "deficit de atencao", "disfuncao executiva", "funcao executiva", "funcoes executivas", "autismo", "hiperfoco"),
    _rule("tdah-neurodiversidade", "Acessibilidade cognitiva", 4.9, "acessibilidade cognitiva", "cegueira temporal", "paralisia executiva", "sobrecarga sensorial", "time blindness"),
    _rule("identidade-360x", "Identidade visual", 5.0, "identidade visual", "logotipo", "logo 360x", "marca 360x", "manual de marca", "paleta da marca", "wallpaper 360x"),
    _rule("fe-espiritualidade", "Fé e espiritualidade", 5.0, "espiritualidade", "biblia", "biblico", "jesus", "jesus cristo", "oracao", "evangelho", "salmos", "devocional", "fe crista"),
    _rule("vida-organizacao", "Organização pessoal", 4.9, "organizacao pessoal", "planejamento pessoal", "planejamento financeiro", "orcamento domestico", "financas pessoais", "rotina pessoal", "minhas metas", "minha familia", "gestao do tempo"),
    _rule("vida-organizacao", "Assuntos pessoais e documentos", 4.9, "divorcio", "processo judicial", "advogado", "extrato bancario", "saldo bancario", "fatura do cartao", "imposto de renda", "planejamento patrimonial", "contrato de emprestimo"),
)

# These phrases identify the generator or recurring footer, not the subject.
_WATERMARKS = tuple(_normalize(t) for t in (
    "turbo temi 360x", "turbo temi", "tdah friendly", "tdah-friendly",
    "imagem gerada por ia", "gerada por inteligencia artificial",
    "gerado por inteligencia artificial", "gerado por ia", "generated by ai",
    "chatgpt image", "chatgpt imagem",
))
_PERSONAL_SIGNALS = tuple(_normalize(t) for t in (
    "divorcio", "processo judicial", "advogado", "extrato bancario",
    "saldo bancario", "fatura do cartao", "cpf", "rg", "conta bancaria",
    "contrato de emprestimo", "imposto de renda", "financas pessoais",
    "planejamento financeiro", "orcamento domestico", "minha familia",
))


def _contains(text, term):
    return (" " + term + " ") in (" " + text + " ")


def _strip_watermarks(text):
    for term in _WATERMARKS:
        text = re.sub(r"(?<!\w)" + re.escape(term) + r"(?!\w)", " ", text)
    return " ".join(text.split())


def _number(value, default):
    try:
        number = float(value)
        return number if math.isfinite(number) else default
    except (TypeError, ValueError):
        return default


def _folder_hint(parts):
    """Use explicit local folders only, never expand the ambiguous PDD acronym."""
    for part in reversed(parts):
        normalized = _normalize(part)
        if normalized in {"imagens tdah", "tdah", "tdah neurodiversidade"}:
            return "tdah-neurodiversidade"
        if normalized in {"imagens pdd", "pdd acervo"}:
            return "pdd-acervo"
        for theme in THEMES:
            if theme not in {"a-classificar", "pdd-acervo", "identidade-360x"} and normalized == _normalize(theme):
                return theme
    return None


def classify_image(relative_path, lines=None):
    """Return one main theme and at most two secondary theme IDs.

    ``lines`` may be absent, empty, or a sequence of Vision line dictionaries.
    Confidence is a heuristic evidence grade, not a calibrated probability.
    Output never includes free-form OCR text or the original filename.
    """
    path_parts = str(relative_path or "").replace("\\", "/").split("/")
    basename = re.sub(r"\.[^.]*$", "", path_parts[-1])
    chunks = [(_strip_watermarks(_normalize(basename)), "nome", 1.55, True)]
    personal = any(_contains(_normalize(basename), term) for term in _PERSONAL_SIGNALS)
    for line in lines or ():
        if not isinstance(line, dict):
            continue
        confidence = max(0.0, min(1.0, _number(line.get("confidence"), 0.8)))
        if confidence < 0.55:
            continue
        normalized = _normalize(line.get("text"))
        if not normalized:
            continue
        personal = personal or any(_contains(normalized, term) for term in _PERSONAL_SIGNALS)
        y = max(0.0, min(1.0, _number(line.get("y"), 0.4)))
        height = max(0.0, min(1.0, _number(line.get("height"), 0.0)))
        # A large line in the lower half can be a footer, so height alone does
        # not turn it into a title. Top text is a topic signal, never a diagnosis.
        title = y >= 0.68 or (y >= 0.42 and height >= 0.065)
        factor = (1.65 if title else 0.82) * confidence
        chunks.append((_strip_watermarks(normalized), "ocr", factor, title))

    evidence = defaultdict(list)
    for rule in RULES:
        matches = []
        for text, method, factor, title in chunks:
            if any(_contains(text, term) for term in rule.terms):
                matches.append((rule.weight * factor, method, title))
        if matches:
            # Repeated footers and repeated body terms cannot accumulate an
            # arbitrary score. A second source corroborates only a little.
            best = max(matches, key=lambda item: item[0])
            corroboration = 0.10 if len({m[1] for m in matches}) > 1 else 0.0
            evidence[rule.theme].append((best[0] * (1 + corroboration), rule.label, best[1], best[2]))

    scores = {}
    for theme, hits in evidence.items():
        hits.sort(key=lambda item: item[0], reverse=True)
        # Several relevant concepts strengthen a label without letting a long
        # paragraph outweigh a clear specific title in another specialty.
        scores[theme] = hits[0][0] + sum(hit[0] * factor for hit, factor in zip(hits[1:4], (0.22, 0.10, 0.05)))
    ranked = sorted(scores, key=lambda theme: (-scores[theme], list(THEMES).index(theme)))
    folder = _folder_hint(path_parts[:-1])

    if not ranked or scores[ranked[0]] < 3.5:
        if folder:
            return {
                "theme": folder, "themeLabel": THEMES[folder],
                "confidence": "media", "method": "pasta", "matchedTerms": [],
                "secondaryThemes": [], "needsReview": True,
                "reason": "Rótulo da pasta original preservado; conteúdo ainda sem confirmação textual.",
            }
        return {
            "theme": "a-classificar", "themeLabel": THEMES["a-classificar"],
            "confidence": "baixa", "method": "revisao", "matchedTerms": [],
            "secondaryThemes": [], "needsReview": True,
            "reason": "Sem sinal textual específico suficiente; revisão local necessária.",
        }

    winner = ranked[0]
    score = scores[winner]
    runner_score = scores[ranked[1]] if len(ranked) > 1 else 0.0
    margin = score - runner_score
    primary_hit = evidence[winner][0]
    secondary = [theme for theme in ranked[1:] if scores[theme] >= max(3.5, score * 0.40)][:2]
    close = runner_score >= score * 0.82
    high = score >= 7.0 and primary_hit[3] and margin >= 1.2
    grade = "alta" if high else "media" if score >= 4.3 else "baixa"
    review = grade != "alta" or close or personal or winner == "vida-organizacao"
    if personal and grade == "alta":
        grade = "media"
    terms = []
    for theme in [winner] + secondary:
        for _, label, _, _ in evidence[theme][:3]:
            if label not in terms:
                terms.append(label)
    if personal or winner == "vida-organizacao":
        reason = "Sinais de conteúdo pessoal; manter local e revisar antes de compartilhar."
    elif close:
        reason = "Há mais de um assunto com peso semelhante; conferir tema principal e secundários."
    elif grade == "alta":
        reason = "Assunto específico identificado no nome ou no texto superior da imagem."
    else:
        reason = "Assunto sugerido por texto legível; conferir classificação local."
    return {
        "theme": winner, "themeLabel": THEMES[winner], "confidence": grade,
        "method": primary_hit[2], "matchedTerms": terms[:8],
        "secondaryThemes": secondary, "needsReview": review, "reason": reason,
    }


def taxonomy_document():
    """An inspectable rule document without image names, paths or OCR output."""
    return {
        "schema": "360x-private-image-taxonomy-v1",
        "classifierVersion": CLASSIFIER_VERSION,
        "private": True,
        "clinicalValidation": False,
        "purpose": "Organização local por assunto escrito; não autoriza publicação nem faz diagnóstico por fotografia.",
        "themes": [{"id": key, "label": value} for key, value in THEMES.items()],
        "rules": [
            {"theme": rule.theme, "label": rule.label, "weight": rule.weight, "terms": list(rule.terms)}
            for rule in RULES
        ],
        "policy": {
            "existingCardFeedIds": list(THEMES)[:14],
            "maxThemesPerImage": 3,
            "secondaryThemesShape": "lista de IDs, no máximo 2",
            "visionCoordinates": "y=0 na base; y=1 no topo",
            "minOcrConfidence": 0.55,
            "titleRule": "y >= 0.68 ou y >= 0.42 com altura >= 0.065",
            "evidencePriority": "nome e títulos específicos > corpo; repetição não acumula ilimitadamente",
            "confidenceMeaning": "grau heurístico de evidência, não probabilidade calibrada",
            "watermarksIgnored": list(_WATERMARKS),
            "unknown": "a-classificar; não usar UTI Geral como categoria residual",
            "tdahFolder": "Preservar IMAGENS TDAH quando nome/texto não resolve o assunto.",
            "pddFolder": "Preservar IMAGENS PDD literalmente; sigla sem expansão ou diagnóstico inferido.",
            "personal": "Sinais financeiros, jurídicos e pessoais exigem revisão e permanência local.",
            "noPhotoDiagnosis": True,
            "rawOcrInClassification": False,
        },
    }
