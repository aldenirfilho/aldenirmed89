"""Local, conservative topic classification for the private 360X documents.

Only caller-supplied names, titles, folders and bounded text are examined. This
module opens no files, extracts no document content and makes no network calls.
The return value contains generic rule labels, never a document title, author,
identifier, excerpt or diagnosis of an individual.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
import re
import unicodedata

try:  # Support both scripts_admin imports and command-line sibling imports.
    from .image_theme_classifier import RULES as IMAGE_RULES
except ImportError:
    from image_theme_classifier import RULES as IMAGE_RULES


CLASSIFIER_VERSION = "360x-document-topics-1.1"

# The first 25 entries preserve the Biblioteca IA vocabulary verbatim.
THEMES = {
    "uti-geral": "UTI Geral",
    "sepse-choque": "Sepse / Choque",
    "vm-sdra": "Ventilação Mecânica / SDRA",
    "nefro-aki-trs": "Nefro / AKI / TRS",
    "infectologia": "Infectologia / Antimicrobianos",
    "neuro-uti": "Neuro UTI",
    "cardio-hemodinamica": "Cardio / Hemodinâmica",
    "endocrino-metabolico": "Endócrino / Metabólico",
    "disturbios-eletroliticos": "Distúrbios Hidroeletrolíticos / Ácido-base",
    "gastro-hepatologia": "Gastro / Hepatologia",
    "reumatologia": "Reumatologia",
    "hematologia": "Hematologia",
    "emergencias-clinicas": "Emergências Clínicas",
    "farmaco-doses": "Farmacologia / Doses / Diluições",
    "morte-cerebral-doacao": "Morte Cerebral / Doação",
    "sedacao-analgesia": "Sedação / Analgesia / Delirium",
    "psiquiatria": "Psiquiatria na UTI",
    "procedimentos-dispositivos": "Procedimentos / Dispositivos / Cateteres",
    "pocus-usg": "POCUS / USG Beira-leito",
    "temi-prova": "TEMI / Prova / Questões",
    "clinica-medica": "Clínica Médica / Enfermaria",
    "gestao-ia-produtividade": "IA / Obsidian / Produtividade Médica",
    "familia-paciente": "Família / Paciente / Educação em Saúde",
    "artigos-cientificos": "Artigos Científicos",
    "protocolos-institucionais": "Protocolos Institucionais",
    "pneumologia": "Pneumologia",
    "dermatologia": "Dermatologia / Feridas",
    "tdah-neurodiversidade": "TDAH / Neurodiversidade",
    "juridico": "Jurídico / Documentação legal",
    "financas-patrimonio": "Finanças / Patrimônio",
    "academico-projetos": "Acadêmico / Projetos",
    "fe-historia-cultura": "Fé / História / Cultura",
    "cirurgia-trauma": "Cirurgia / Trauma / Ortopedia",
    "gineco-obstetricia": "Ginecologia / Obstetrícia",
    "pediatria-neonatologia": "Pediatria / Neonatologia",
    "saude-coletiva-epidemiologia": "Saúde Coletiva / Epidemiologia / Bioestatística",
    "inbox-revisar": "A revisar / Classificação pendente",
}


def _normalize(value):
    text = unicodedata.normalize("NFKD", str(value or "")).casefold()
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def _contains(text, phrase):
    return (" " + phrase + " ") in (" " + text + " ")


@dataclass(frozen=True)
class _Rule:
    theme: str
    label: str
    weight: float
    terms: tuple[str, ...]


def _rule(theme, label, weight, *terms):
    return _Rule(theme, label, weight, tuple(_normalize(term) for term in terms))


_IMAGE_THEME_MAP = {
    "uti-geral": "uti-geral", "temi": "temi-prova", "vm-sdra": "vm-sdra",
    "sepse-choque": "sepse-choque", "nefro-aki-trs": "nefro-aki-trs",
    "endocrino-diabetes": "endocrino-metabolico", "neuro-uti": "neuro-uti",
    "cardio-hemodinamica": "cardio-hemodinamica", "infectologia": "infectologia",
    "farmaco-doses": "farmaco-doses", "pocus": "pocus-usg",
    "familia-paciente": "familia-paciente", "ia-produtividade": "gestao-ia-produtividade",
    "reumato-imuno": "reumatologia", "pneumologia": "pneumologia",
    "gastro-hepato-nutricao": "gastro-hepatologia", "hematologia-trombose": "hematologia",
    "dermato-feridas": "dermatologia", "tdah-neurodiversidade": "tdah-neurodiversidade",
}

# These words have important bibliographic, grammatical or personal ambiguity.
# The document-specific rules below restore their explicit medical phrases.
_AMBIGUOUS = {"coma", "wells", "prona", "morte encefalica", "delirium"}
_shared = []
for _image_rule in IMAGE_RULES:
    if _image_rule.theme not in _IMAGE_THEME_MAP:
        continue
    _theme = _IMAGE_THEME_MAP[_image_rule.theme]
    if _image_rule.label == "Eletrólitos e equilíbrio ácido-base":
        _theme = "disturbios-eletroliticos"
    _terms = tuple(term for term in _image_rule.terms if term not in _AMBIGUOUS)
    if _terms:
        _shared.append(_Rule(_theme, _image_rule.label, _image_rule.weight, _terms))

RULES = tuple(_shared) + (
    _rule("clinica-medica", "Medicina interna geral", 4.7, "clinica medica", "medicina interna", "internal medicine", "raciocinio clinico", "diagnostico diferencial"),
    _rule("clinica-medica", "Referência geral de medicina interna", 5.3, "harrison principles of internal medicine", "harrisons principles of internal medicine", "harrison medicina interna", "medicina interna de harrison", "cecil medicina interna", "cecil essentials of medicine", "goldman cecil medicine", "point of care medicina interna", "point of care clinical medicine"),
    _rule("uti-geral", "Referência geral de terapia intensiva", 5.2, "the icu book", "icu book", "marinos the icu book", "manual de terapia intensiva", "tratado de terapia intensiva", "textbook of critical care", "critical care medicine textbook", "point of care terapia intensiva"),
    _rule("emergencias-clinicas", "Medicina de emergência", 4.9, "emergencias clinicas", "medicina de emergencia", "medicina de urgencia", "emergency medicine", "ressuscitacao cardiopulmonar", "parada cardiorrespiratoria", "cardiac arrest"),
    _rule("nefro-aki-trs", "Doença renal", 5.0, "doenca renal cronica", "chronic kidney disease", "acute kidney injury", "renal replacement therapy", "kidney failure", "insuficiencia renal", "nefropatia", "kidney disease"),
    _rule("vm-sdra", "Ventilação e suporte respiratório", 5.0, "mechanical ventilation", "noninvasive ventilation", "acute respiratory distress syndrome", "ventilacao protetora", "posicao prona", "pressao de suporte"),
    _rule("sepse-choque", "Sepse e choque em literatura clínica", 5.1, "septic shock", "hemorrhagic shock", "hypovolemic shock", "sepsis management"),
    _rule("pneumologia", "Doença pulmonar em literatura clínica", 5.0, "community acquired pneumonia", "chronic obstructive pulmonary disease", "asthma", "cystic fibrosis", "interstitial lung disease", "pulmonary hypertension", "pneumonia adquirida na comunidade"),
    _rule("hematologia", "Trombose e hematologia clínica", 5.0, "deep vein thrombosis", "pulmonary embolism", "blood transfusion", "transfusion reaction", "wells score", "escore de wells", "concentrados de hemacias", "concentrados de plaquetas"),
    _rule("cardio-hemodinamica", "Doença cardiovascular em literatura clínica", 5.0, "heart failure", "atrial fibrillation", "myocardial infarction", "cardiogenic shock", "cardiac output", "acute coronary syndrome"),
    _rule("endocrino-metabolico", "Doença endócrina em literatura clínica", 5.0, "diabetic ketoacidosis", "adrenal insufficiency", "thyroid disease", "crise tireotoxica"),
    _rule("disturbios-eletroliticos", "Eletrólitos e ácido-base em literatura clínica", 5.0, "hyponatremia", "hypernatremia", "hyperkalemia", "hypokalemia", "metabolic acidosis", "acid base disorders"),
    _rule("infectologia", "Infecções em literatura clínica", 5.0, "infectious diseases", "antimicrobial therapy", "antibiotic resistance", "histoplasmosis", "cryptococcosis", "aspergillosis"),
    _rule("gastro-hepatologia", "Doença digestiva e nutrição em literatura clínica", 5.0, "acute liver failure", "cirrhosis", "pancreatitis", "gastrointestinal bleeding", "hepatic encephalopathy", "enteral nutrition", "parenteral nutrition"),
    _rule("reumatologia", "Doença reumática em literatura clínica", 5.0, "systemic lupus", "rheumatoid arthritis", "vasculitis", "systemic sclerosis"),
    _rule("dermatologia", "Pele e feridas em literatura clínica", 5.0, "pressure injury", "pressure ulcer", "wound care", "burn injury"),
    _rule("farmaco-doses", "Farmacologia em literatura clínica", 5.0, "drug dosing", "dose adjustment", "pharmacokinetics", "pharmacodynamics", "pharmacology"),
    _rule("neuro-uti", "Neurologia crítica", 5.0, "stroke", "subarachnoid hemorrhage", "intracerebral hemorrhage", "status epilepticus", "intracranial hypertension", "escala de coma", "paciente em coma", "coma neurologico", "coma profundo"),
    _rule("sedacao-analgesia", "Sedação, analgesia e delirium", 5.2, "sedacao", "analgesia", "delirium", "sedation", "analgesia multimodal", "pain management", "agitation and sedation"),
    _rule("morte-cerebral-doacao", "Morte encefálica e doação de órgãos", 5.4, "morte encefalica", "morte cerebral", "brain death", "doacao de orgaos", "organ donation", "potencial doador"),
    _rule("psiquiatria", "Psiquiatria clínica", 5.0, "psiquiatria", "transtorno bipolar", "transtorno depressivo", "esquizofrenia", "psicose", "psychiatry", "bipolar disorder", "major depressive disorder"),
    _rule("procedimentos-dispositivos", "Procedimentos e dispositivos clínicos", 5.1, "acesso venoso central", "cateter venoso central", "central venous catheter", "central venous access", "puncao arterial", "toracocentese", "thoracentesis", "paracentese", "dreno toracico", "dispositivos invasivos"),
    _rule("pocus-usg", "Ultrassonografia clínica", 5.3, "point of care ultrasound", "point of care ultrasonography", "bedside ultrasound", "lung ultrasound", "focused cardiac ultrasound", "compressao venosa"),
    _rule("familia-paciente", "Educação e comunicação com pacientes", 5.0, "educacao em saude", "orientacao ao paciente", "manual do paciente", "guia para familiares", "patient education", "shared decision making", "palliative care"),
    _rule("artigos-cientificos", "Publicação científica", 4.0, "artigos cientificos", "artigo cientifico", "randomized controlled trial", "randomised controlled trial", "systematic review", "meta analysis", "ensaio clinico randomizado", "revisao sistematica"),
    _rule("protocolos-institucionais", "Normas e protocolos institucionais", 4.6, "protocolo institucional", "protocolos institucionais", "procedimento operacional padrao", "norma institucional", "rotina institucional"),
    _rule("juridico", "Documentação e temas jurídicos", 5.2, "juridico", "juridica", "processo judicial", "acao judicial", "peticao inicial", "contestacao judicial", "recurso de apelacao", "divorcio", "guarda de filhos", "pensao alimenticia", "codigo civil", "codigo de processo civil", "direito de familia", "sentenca judicial", "contrato de emprestimo"),
    _rule("financas-patrimonio", "Finanças e patrimônio", 5.1, "financas pessoais", "planejamento financeiro", "educacao financeira", "orcamento domestico", "extrato bancario", "imposto de renda", "investimentos financeiros", "juros compostos", "previdencia privada", "patrimonio", "cartao de credito", "fatura bancaria"),
    _rule("academico-projetos", "Projetos e produção acadêmica", 5.0, "projeto de pesquisa", "pre projeto", "projeto academico", "projeto de curso", "proposta de curso", "plano de ensino", "plano de pesquisa", "cronograma do projeto", "dissertacao", "tese de doutorado", "qualificacao de mestrado", "curriculo lattes", "memorial academico", "relatorio de pesquisa"),
    _rule("fe-historia-cultura", "Fé, história e cultura", 5.0, "espiritualidade", "biblia", "jesus cristo", "evangelho", "teologia", "salmos", "fe crista", "cristianismo", "espirito santo", "pai nosso", "historia do brasil", "historia da maconaria", "maconaria", "literatura brasileira", "filosofia", "critica literaria"),
)

_WATERMARKS = tuple(_normalize(value) for value in (
    "Turbo TEMI 360X", "Turbo TEMI", "TDAH friendly", "TDAH-friendly",
    "imagem gerada por IA", "gerado por IA", "gerada por IA",
    "gerado por inteligência artificial", "gerada por inteligência artificial",
    "generated by artificial intelligence", "generated by AI", "ChatGPT Image",
))
_METADATA_LINE = re.compile(r"^\s*(?:author(?:s)?|autor(?:es|a|as)?|editor(?:s|es)?|doi|isbn|issn|orcid|pmid|pmcid|identifier|identificador|id|uuid|copyright|corresponding author|patient name|nome do paciente|institution|institui[cç][aã]o|affiliation|afilia[cç][aã]o|department|departamento)\s*[:=]", re.I)
_REFERENCES = {"referencias", "referencias bibliograficas", "references", "bibliography", "bibliografia"}
_PERSONAL = tuple(_normalize(term) for term in ("cpf", "rg", "extrato bancario", "conta bancaria", "numero do processo", "nome do paciente", "dados do paciente", "prontuario do paciente"))
_FOLDER_ALIASES = {
    "pneumologia": ("pneumologia", "pneumo"),
    "nefro-aki-trs": ("nefrologia", "nefro"),
    "disturbios-eletroliticos": ("eletrolitos", "hidroeletroliticos", "acido base"),
    "hematologia": ("hematologia", "hemato"),
    "gastro-hepatologia": ("gastroenterologia", "hepatologia", "nutricao"),
    "dermatologia": ("dermatologia", "dermato", "feridas"),
    "psiquiatria": ("psiquiatria",),
    "tdah-neurodiversidade": ("tdah", "imagens tdah", "neurodiversidade"),
    "juridico": ("juridico", "juridica", "documentos juridicos"),
    "financas-patrimonio": ("financas", "financeiro", "patrimonio"),
    "academico-projetos": ("academico", "academicos", "projetos academicos"),
    "fe-historia-cultura": ("fe", "espiritualidade", "historia e cultura"),
    "artigos-cientificos": ("artigos", "papers", "artigos cientificos"),
}
_FOLDER_IDS = {_normalize(theme): theme for theme in THEMES if theme != "inbox-revisar"}
for _theme, _aliases in _FOLDER_ALIASES.items():
    for _alias in _aliases:
        _FOLDER_IDS[_normalize(_alias)] = _theme


def _clean(value):
    text = _normalize(value)
    for phrase in _WATERMARKS:
        text = re.sub(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", " ", text)
    return " ".join(text.split())


def _content_lines(value, max_characters):
    lines = []
    for line in str(value or "")[:max_characters].splitlines()[:200]:
        normalized = _normalize(line)
        if normalized in _REFERENCES:
            break
        if _METADATA_LINE.match(line):
            continue
        cleaned = _clean(line)
        if cleaned:
            lines.append(cleaned)
    return lines


def _unknown(secondary=(), reason="Sem assunto específico suficiente; classificação local precisa de revisão."):
    return {"theme": "inbox-revisar", "themeLabel": THEMES["inbox-revisar"],
            "confidence": "baixa", "method": "revisao", "matchedTerms": [],
            "secondaryThemes": list(secondary)[:2], "needsReview": True, "reason": reason}


def _candidate_chunk_indices(rule, word_chunks, chunk_count):
    """Necessary-condition filter; matching and original chunk order stay exact."""
    candidates = set()
    for term in rule.terms:
        first_word = term.partition(" ")[0]
        if not first_word:
            # Preserve exhaustive semantics even for a future empty term.
            return range(chunk_count)
        candidates.update(word_chunks.get(first_word, ()))
    return sorted(candidates)


def classify_document(relative_path, title="", text="", original_folder=""):
    """Return one written topic and at most two secondary Biblioteca theme IDs.

    A topic is not a diagnosis, assessment of an author or authorization to
    publish. Confidence grades measure heuristic topic evidence only. Full text
    is neither retained nor returned; at most its first 20,000 characters and
    200 lines are examined, ending before a labeled bibliography section.
    """
    parts = str(relative_path or "").replace("\\", "/").split("/")
    filename = re.sub(r"\.[^.]*$", "", parts[-1])
    title_lines = _content_lines(title, 700)
    body_lines = _content_lines(text, 20000)
    chunks = [(_clean(filename), "nome", 1.55, True)]
    chunks.extend((line, "titulo", 1.80, True) for line in title_lines)
    # PDF/XML title fields may wrap one phrase across lines. Join only this
    # bounded, metadata-filtered title; it retains the same evidence weight.
    # Each rule still counts once, so an added view does not amplify repeats.
    if len(str(title or "")) <= 700 and len(title_lines) > 1:
        chunks.append((" ".join(title_lines), "titulo", 1.80, True))
    # A short leading line can be a bibliographic heading. Body repetitions do
    # not increase evidence; text remains weaker than an explicit title/name.
    chunks.extend((line, "texto", 1.15 if index < 3 and len(line) <= 180 else 0.65,
                   index < 3 and len(line) <= 180) for index, line in enumerate(body_lines))
    folder_parts = parts[:-1] + str(original_folder or "").replace("\\", "/").split("/")
    folders = [_clean(part) for part in folder_parts if _clean(part)]
    chunks.extend((folder, "pasta", 0.95, False) for folder in folders)
    personal_text = " ".join(_normalize(value) for value in (relative_path, title, str(text or "")[:20000]))
    personal = any(_contains(personal_text, term) for term in _PERSONAL)

    word_chunks = defaultdict(set)
    for index, (content, _, _, _) in enumerate(chunks):
        for word in set(content.split()):
            word_chunks[word].add(index)
    evidence = defaultdict(list)
    for rule in RULES:
        found = []
        for index in _candidate_chunk_indices(rule, word_chunks, len(chunks)):
            content, method, factor, header = chunks[index]
            if any(_contains(content, term) for term in rule.terms):
                found.append((rule.weight * factor, method, header))
        if found:
            best = max(found, key=lambda item: item[0])
            # Only the best occurrence of each concept counts. Long books and
            # generated references cannot win by repeating a peripheral term.
            evidence[rule.theme].append((best[0], rule.label, best[1], best[2]))
    for folder in folders:
        theme = _FOLDER_IDS.get(folder)
        if theme:
            evidence[theme].append((5.0, "Pasta temática declarada", "pasta", False))
    scores = {}
    for theme, hits in evidence.items():
        hits.sort(key=lambda item: item[0], reverse=True)
        scores[theme] = hits[0][0] + sum(hit[0] * factor for hit, factor in zip(hits[1:4], (0.20, 0.08, 0.03)))
    order = {theme: index for index, theme in enumerate(THEMES)}
    ranked = sorted(scores, key=lambda theme: (-scores[theme], order[theme]))
    if not ranked or scores[ranked[0]] < 3.5:
        return _unknown()

    # Publication design and institutional format are fallback buckets when a
    # more specific subject is supported at the same evidence level.
    broad = {"artigos-cientificos", "protocolos-institucionais"}
    winner = ranked[0]
    specific = [theme for theme in ranked if theme not in broad and scores[theme] >= 3.5]
    if winner in broad and specific and scores[specific[0]] >= scores[winner] * 0.70:
        winner = specific[0]
    others = [theme for theme in ranked if theme != winner]
    score = scores[winner]
    runner = scores[others[0]] if others else 0.0
    hit = evidence[winner][0]
    secondary = [theme for theme in others if scores[theme] >= max(3.5, score * 0.42)][:2]
    close = runner >= score * 0.82
    # A mixed paragraph without a topic heading is not sufficient to pick one
    # specialty merely because it has the first dictionary entry in a tie.
    if hit[2] == "texto" and not hit[3] and score < 6 and sum(scores[t] >= score * 0.90 for t in ranked) >= 3:
        return _unknown([winner] + secondary, "Texto com vários assuntos sem título temático claro; revisar localmente.")
    high = score >= 7.0 and hit[2] in {"nome", "titulo"} and score - runner >= 1.1
    grade = "alta" if high else "media" if score >= 4.3 else "baixa"
    sensitive = personal or winner in {"juridico", "financas-patrimonio"}
    review = grade != "alta" or close or sensitive or hit[2] == "pasta"
    labels = []
    for theme in [winner] + secondary:
        for _, label, _, _ in evidence[theme][:3]:
            if label not in labels:
                labels.append(label)
    if sensitive:
        reason = "Conteúdo pessoal, jurídico ou financeiro; revisar localmente antes de compartilhar."
    elif close:
        reason = "Mais de um assunto tem evidência semelhante; conferir tema principal e secundários."
    elif hit[2] == "pasta":
        reason = "Pasta temática usada como referência; conferir o assunto do documento."
    elif grade == "alta":
        reason = "Assunto específico apoiado no nome ou título fornecido do documento."
    else:
        reason = "Assunto sugerido por descrição ou texto fornecido; conferir classificação local."
    return {"theme": winner, "themeLabel": THEMES[winner], "confidence": grade,
            "method": hit[2], "matchedTerms": labels[:8], "secondaryThemes": secondary,
            "needsReview": review, "reason": reason}
