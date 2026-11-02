"""Behavioral checks without reading any private document content."""

import json
from pathlib import Path
import random
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts_admin"))
from document_theme_classifier import CLASSIFIER_VERSION, THEMES, classify_document
import document_theme_classifier as classifier


class DocumentThemeClassifierTests(unittest.TestCase):
    def assert_matches_exhaustive_reference(self, *args, **kwargs):
        optimized = classify_document(*args, **kwargs)
        # The reference checks every cleaned chunk with the original predicate,
        # preserving the exact pre-index scoring and stable max/tie behavior.
        with patch.object(classifier, "_candidate_chunk_indices", lambda rule, word_chunks, count: range(count)):
            exhaustive = classify_document(*args, **kwargs)
        self.assertEqual(optimized, exhaustive)

    def test_word_index_matches_exhaustive_reference_on_varied_inputs(self):
        fixtures = [
            (("a.pdf",), {}),
            (("DPOC.pdf",), {"title": "Mechanical ventilation", "text": "Authors: Renal\nReferences\nDiabetes"}),
            (("PDF/TDAH/gerado.docx",), {"title": "Turbo TEMI 360X", "text": "TDAH-friendly\nGerado por IA"}),
            (("Terapia Intensiva/a.pdf",), {"title": "Acute kidney\ninjury", "text": "Harrison Principles of Internal Medicine\n" * 30}),
            (("a.docx",), {"title": "Planejamento financeiro", "text": "CPF: 123\nProjeto de pesquisa\nSepse", "original_folder": "Jurídico"}),
            (("a.pdf",), {"title": "Cardiac\narrest", "text": "\n".join(["Um cabeçalho"] * 4 + ["DPOC", "Asma", "Sepse", "POCUS"] * 15)}),
            (("a.pdf",), {"title": "Cardiac\nReferences\narrest", "original_folder": "PDD"}),
            (("a.pdf",), {"title": "x" * 701, "text": "x " * 10001 + "\nDPOC"}),
        ]
        for args, kwargs in fixtures:
            with self.subTest(args=args, kwargs=list(kwargs)):
                self.assert_matches_exhaustive_reference(*args, **kwargs)

    def test_word_index_matches_exhaustive_reference_for_deterministic_combinations(self):
        rng = random.Random("360x-exact-word-index")
        phrases = ["Acute kidney injury", "DPOC", "Sepse", "Pneumonia", "Ventrículo direito", "Reações transfusionais", "Direito de família", "Inteligência artificial", "Projeto de pesquisa", "Neurodiversidade", "Extrato bancário", "Harrison Principles of Internal Medicine", "renal", "adrenal", "Autores", "References", "Uma descrição sem assunto"]
        for index in range(40):
            body = "\n".join(rng.choice(phrases) for _ in range(rng.randrange(0, 60)))
            title = "\n".join(rng.choice(phrases) for _ in range(rng.randrange(0, 5)))
            filename = rng.choice(("a.pdf", "sepse.pdf", "POCUS.docx", "Harrison.pdf"))
            folder = rng.choice(("PDF", "DOC 2026", "Nefrologia", "tdah-neurodiversidade", "PDD"))
            with self.subTest(index=index):
                self.assert_matches_exhaustive_reference(filename, title, body, folder)

    def test_candidate_index_uses_whole_words_and_keeps_original_order(self):
        rule = classifier._Rule("nefro-aki-trs", "Referência de teste", 1.0, ("renal failure", "deep vein thrombosis"))
        index = {"adrenal": {0}, "renal": {5, 2}, "deep": {4, 2}}
        self.assertEqual(classifier._candidate_chunk_indices(rule, index, 6), [2, 4, 5])

    def test_library_ids_and_labels_are_preserved(self):
        path = Path(__file__).resolve().parents[1] / "02_Biblioteca_IA_Engine/data/biblioteca_taxonomia_temas.json"
        for item in json.loads(path.read_text())["themes"]:
            self.assertEqual(THEMES[item["id"]], item["label"])
        self.assertEqual(len(THEMES), 37)
        self.assertEqual(CLASSIFIER_VERSION, "360x-document-topics-1.1")

    def test_result_has_only_the_agreed_fields(self):
        self.assertEqual(set(classify_document("a.pdf")), {"theme", "themeLabel", "confidence", "method", "matchedTerms", "secondaryThemes", "needsReview", "reason"})

    def test_generic_names_and_source_folders_do_not_imply_medicine(self):
        for path in ("0001.pdf", "DOC 2026/Resumo 2026.docx", "07_ABC_221cfe8d.pdf", "documento.pdf"):
            result = classify_document(path, original_folder="PDF")
            self.assertEqual(result["theme"], "inbox-revisar")
            self.assertTrue(result["needsReview"])

    def test_specific_filename_and_explicit_title(self):
        self.assertEqual(classify_document("sepse-choque-septico.pdf")["theme"], "sepse-choque")
        result = classify_document("a.pdf", title="Pneumonia adquirida na comunidade")
        self.assertEqual(result["theme"], "pneumologia")
        self.assertEqual(result["method"], "titulo")
        self.assertEqual(result["confidence"], "alta")

    def test_wrapped_explicit_titles_are_read_as_one_phrase(self):
        cases = {"Medicina de\nemergência": "emergencias-clinicas", "Cardiac\narrest": "emergencias-clinicas", "Acute kidney\ninjury": "nefro-aki-trs"}
        for title, theme in cases.items():
            with self.subTest(title=title):
                result = classify_document("generico.pdf", title=title)
                self.assertEqual(result["theme"], theme)
                self.assertEqual(result["method"], "titulo")
                self.assertEqual(result["confidence"], "alta")

    def test_joined_title_does_not_restore_filtered_author_doi_or_references(self):
        for title in ("Authors: Acute kidney\nDOI: injury", "Cardiac\nDOI: arrest", "Authors: Cardiac arrest\nUm documento", "Cardiac\nReferences\narrest", "Acute kidney\nReferências bibliográficas\ninjury"):
            with self.subTest(title=title):
                self.assertEqual(classify_document("generico.pdf", title=title)["theme"], "inbox-revisar")

    def test_title_join_does_not_merge_body_lines(self):
        result = classify_document("generico.pdf", title="Resumo", text="Acute kidney\ninjury")
        self.assertEqual(result["theme"], "inbox-revisar")

    def test_title_join_does_not_promote_competing_topics_to_high_confidence(self):
        result = classify_document("generico.pdf", title="Acute kidney\ninjury\nSepsis")
        self.assertTrue(result["needsReview"])
        self.assertNotEqual(result["confidence"], "alta")
        self.assertIn("nefro-aki-trs", [result["theme"]] + result["secondaryThemes"])
        self.assertIn("sepse-choque", [result["theme"]] + result["secondaryThemes"])

    def test_title_join_is_limited_to_a_supplied_title_of_700_characters(self):
        result = classify_document("generico.pdf", title="Cardiac\narrest\n" + "x" * 700)
        self.assertEqual(result["theme"], "inbox-revisar")

    def test_specific_title_outranks_ia_name_and_repeated_body(self):
        result = classify_document("engenharia-de-prompts.pdf", title="DPOC: exacerbação", text="Inteligência artificial e automação\n" * 100)
        self.assertEqual(result["theme"], "pneumologia")
        self.assertIn("gestao-ia-produtividade", result["secondaryThemes"])

    def test_branding_is_not_tdah_or_ia_subject(self):
        result = classify_document("Turbo TEMI 360X.pdf", title="TDAH-friendly", text="Gerado por inteligência artificial")
        self.assertEqual(result["theme"], "inbox-revisar")
        result = classify_document("a.docx", title="Sepse", text="Turbo TEMI 360X · TDAH friendly\nGerado por IA")
        self.assertEqual(result["theme"], "sepse-choque")
        self.assertNotIn("tdah-neurodiversidade", result["secondaryThemes"])

    def test_tdah_does_not_become_neurocritical_illness(self):
        result = classify_document("a.pdf", title="Neurodiversidade e funções executivas no TDAH")
        self.assertEqual(result["theme"], "tdah-neurodiversidade")
        self.assertNotIn("neuro-uti", result["secondaryThemes"])

    def test_folder_hint_is_medium_and_reviewable(self):
        result = classify_document("Nefrologia/a.pdf")
        self.assertEqual(result["theme"], "nefro-aki-trs")
        self.assertEqual(result["method"], "pasta")
        self.assertTrue(result["needsReview"])
        result = classify_document("a.pdf", original_folder="TDAH")
        self.assertEqual(result["theme"], "tdah-neurodiversidade")

    def test_pdd_is_not_expanded_into_an_assumed_topic(self):
        self.assertEqual(classify_document("PDD/a.pdf")["theme"], "inbox-revisar")

    def test_canonical_folder_ids_are_supported(self):
        self.assertEqual(classify_document("disturbios-eletroliticos/a.pdf")["theme"], "disturbios-eletroliticos")

    def test_specific_title_outranks_general_folder(self):
        result = classify_document("Terapia Intensiva/a.pdf", title="Asma grave")
        self.assertEqual(result["theme"], "pneumologia")

    def test_harrison_and_general_textbook_titles_need_bibliographic_context(self):
        for title in ("Harrison - Medicina Interna", "Harrison's Principles of Internal Medicine", "Goldman Cecil Medicine"):
            with self.subTest(title=title):
                self.assertEqual(classify_document("a.pdf", title=title)["theme"], "clinica-medica")
        self.assertEqual(classify_document("Harrison.pdf", text="Author: Harrison")["theme"], "inbox-revisar")

    def test_icu_textbook_is_general_intensive_care(self):
        self.assertEqual(classify_document("Marino - The ICU Book.pdf")["theme"], "uti-geral")

    def test_point_of_care_ultrasound_is_pocus(self):
        self.assertEqual(classify_document("a.pdf", title="Point-of-Care Ultrasound")["theme"], "pocus-usg")
        self.assertEqual(classify_document("a.pdf", title="Point of Care Medicina Interna")["theme"], "clinica-medica")
        self.assertEqual(classify_document("Point of Care.pdf")["theme"], "inbox-revisar")

    def test_authors_and_identifiers_do_not_set_the_topic(self):
        result = classify_document("a.pdf", text="Authors: Renal, Neuro, Harrison\nDOI: sepsis.2026\nISBN: 978-123456789\nUUID: dpoc-0001")
        self.assertEqual(result["theme"], "inbox-revisar")

    def test_patient_names_and_author_affiliations_do_not_set_the_topic(self):
        result = classify_document("a.pdf", text="Nome do paciente: Asma\nAffiliation: Internal medicine\nDepartamento: Hematologia")
        self.assertEqual(result["theme"], "inbox-revisar")
        self.assertTrue(result["needsReview"])

    def test_specific_english_clinical_titles_use_existing_specialties(self):
        cases = {"Hyponatremia in adults": "disturbios-eletroliticos", "Acute liver failure": "gastro-hepatologia", "Rheumatoid arthritis": "reumatologia", "Pressure injury prevention": "dermatologia", "Antimicrobial therapy": "infectologia", "Pharmacokinetics and drug dosing": "farmaco-doses"}
        for title, theme in cases.items():
            with self.subTest(title=title):
                self.assertEqual(classify_document("a.pdf", title=title)["theme"], theme)

    def test_scientific_title_outranks_cited_source_and_design(self):
        result = classify_document("a.pdf", title="Community-acquired pneumonia", text="Randomized controlled trial\nClinical medicine\nReferences\nHarrison Principles of Internal Medicine\nThe ICU Book")
        self.assertEqual(result["theme"], "pneumologia")
        self.assertNotIn("clinica-medica", result["secondaryThemes"])
        self.assertNotIn("uti-geral", result["secondaryThemes"])

    def test_publication_design_is_a_fallback_topic(self):
        self.assertEqual(classify_document("a.pdf", title="Systematic review and meta-analysis")["theme"], "artigos-cientificos")
        self.assertEqual(classify_document("a.pdf", text="DOI: 10.2026/123456")["theme"], "inbox-revisar")

    def test_only_explicit_institutional_protocol_context_is_classified(self):
        self.assertEqual(classify_document("a.pdf", title="Protocolo institucional de admissão")["theme"], "protocolos-institucionais")
        self.assertEqual(classify_document("protocolo.pdf")["theme"], "inbox-revisar")

    def test_electrolytes_are_mapped_to_the_library_category(self):
        self.assertEqual(classify_document("hiponatremia.pdf")["theme"], "disturbios-eletroliticos")

    def test_sedation_delirium_and_brain_death_use_specialized_categories(self):
        self.assertEqual(classify_document("delirium.pdf")["theme"], "sedacao-analgesia")
        self.assertEqual(classify_document("morte-encefalica.pdf")["theme"], "morte-cerebral-doacao")
        self.assertEqual(classify_document("a.pdf", title="Brain death and organ donation")["theme"], "morte-cerebral-doacao")

    def test_procedures_and_emergency_medicine_are_supported(self):
        self.assertEqual(classify_document("cateter-venoso-central.pdf")["theme"], "procedimentos-dispositivos")
        self.assertEqual(classify_document("a.pdf", title="Emergency medicine handbook")["theme"], "emergencias-clinicas")

    def test_nonmedical_topics_are_not_forced_into_medicine(self):
        cases = {"Petição inicial e divórcio": "juridico", "Planejamento financeiro e patrimônio": "financas-patrimonio", "Projeto de pesquisa e currículo Lattes": "academico-projetos", "História da maçonaria": "fe-historia-cultura", "Bíblia e cristianismo": "fe-historia-cultura"}
        for title, theme in cases.items():
            with self.subTest(title=title):
                self.assertEqual(classify_document("a.pdf", title=title)["theme"], theme)

    def test_vague_legal_financial_and_grammatical_words_are_not_topics(self):
        for title in ("Direito", "Banco", "Guarda", "Laudo", "História clínica", "Coma e durma", "Proposta", "Projeto 360X"):
            with self.subTest(title=title):
                self.assertEqual(classify_document("a.pdf", title=title)["theme"], "inbox-revisar")

    def test_bank_of_questions_does_not_become_finance(self):
        self.assertEqual(classify_document("a.pdf", title="Banco de questões TEMI")["theme"], "temi-prova")

    def test_right_ventricle_is_not_law_and_adrenal_is_not_renal(self):
        self.assertEqual(classify_document("a.pdf", title="Ventrículo direito e hemodinâmica")["theme"], "cardio-hemodinamica")
        result = classify_document("a.pdf", title="Insuficiência adrenal")
        self.assertEqual(result["theme"], "endocrino-metabolico")
        self.assertNotIn("nefro-aki-trs", result["secondaryThemes"])

    def test_sensitive_topic_and_personal_identifier_require_local_review(self):
        for title in ("Extrato bancário", "Processo judicial e divórcio"):
            self.assertTrue(classify_document("a.pdf", title=title)["needsReview"])
        result = classify_document("nome-privado-XYZ.pdf", title="DPOC", text="CPF: 123.456.789-09\nNome do paciente: pessoa privada")
        self.assertTrue(result["needsReview"])
        rendered = json.dumps(result, ensure_ascii=False)
        for private in ("XYZ", "123", "pessoa privada", "nome-privado"):
            self.assertNotIn(private, rendered)

    def test_body_supports_a_topic_without_returning_the_text(self):
        result = classify_document("a.pdf", text="Acute kidney injury\nAn overview for clinical practice")
        self.assertEqual(result["theme"], "nefro-aki-trs")
        self.assertEqual(result["method"], "texto")
        self.assertTrue(result["needsReview"])
        self.assertNotIn("overview", json.dumps(result))

    def test_secondaries_are_at_most_two(self):
        result = classify_document("a.pdf", title="POCUS na sepse, DPOC e trombose")
        self.assertLessEqual(len(result["secondaryThemes"]), 2)
        self.assertTrue(result["needsReview"])

    def test_text_is_bounded_and_labeled_bibliography_does_not_vote(self):
        result = classify_document("a.pdf", text="Uma descrição sem tema\nReferences\nSepsis\nDPOC\nTDAH")
        self.assertEqual(result["theme"], "inbox-revisar")
        result = classify_document("a.pdf", text="x " * 10001 + "\nDPOC")
        self.assertEqual(result["theme"], "inbox-revisar")


if __name__ == "__main__":
    unittest.main()
