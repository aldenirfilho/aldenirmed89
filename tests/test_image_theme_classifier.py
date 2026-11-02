"""Behavior checks for the local, conservative private-image classifier."""

import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts_admin"))
from image_theme_classifier import CLASSIFIER_VERSION, THEMES, classify_image, taxonomy_document


def line(text, y=0.85, confidence=0.95, height=0.06):
    return {"text": text, "confidence": confidence, "x": 0.05, "y": y, "width": 0.9, "height": height}


class ImageThemeClassifierTests(unittest.TestCase):
    def test_existing_feed_ids_and_labels_are_preserved(self):
        path = Path(__file__).resolve().parents[1] / "05_Midia_E_Feed/data/themes.json"
        for theme in json.loads(path.read_text())["themes"]:
            self.assertEqual(THEMES[theme["id"]], theme["label"])

    def test_specific_filename_is_useful_without_ocr(self):
        result = classify_image("01-admissao-dpoc-grave.png", [])
        self.assertEqual(result["theme"], "pneumologia")
        self.assertEqual(result["method"], "nome")
        self.assertEqual(result["confidence"], "alta")

    def test_dpoc_primary_and_ventilation_secondary(self):
        result = classify_image("unknown.png", [
            line("DPOC: exacerbação grave"),
            line("Ventilação mecânica: PEEP e esforços ineficazes", y=0.28),
        ])
        self.assertEqual(result["theme"], "pneumologia")
        self.assertIn("vm-sdra", result["secondaryThemes"])

    def test_sepsis_title_outranks_pocus_in_body(self):
        result = classify_image("image.png", [
            line("SEPSE: reconhecimento e choque séptico"),
            line("POCUS e ultrassonografia na reavaliação", y=0.25),
        ])
        self.assertEqual(result["theme"], "sepse-choque")
        self.assertIn("pocus", result["secondaryThemes"])

    def test_pocus_title_outranks_sepsis_body(self):
        result = classify_image("image.png", [
            line("POCUS no choque"), line("Paciente com sepse", y=0.18),
        ])
        self.assertEqual(result["theme"], "pocus")
        self.assertIn("sepse-choque", result["secondaryThemes"])

    def test_hemorrhagic_shock_title_outranks_generic_hemodynamics_body(self):
        result = classify_image("generica.png", [
            line("Choque hemorrágico"), line("Hemodinâmica e débito cardíaco", y=0.25),
        ])
        self.assertEqual(result["theme"], "sepse-choque")
        self.assertEqual(result["confidence"], "alta")
        self.assertIn("cardio-hemodinamica", result["secondaryThemes"])

    def test_specific_transfusion_headings_are_hematology(self):
        for heading in ("Reação transfusional", "Reações transfusionais", "Concentrado de hemácias", "Concentrado de plaquetas"):
            with self.subTest(heading=heading):
                result = classify_image("generica.png", [line(heading)])
                self.assertEqual(result["theme"], "hematologia-trombose")
                self.assertEqual(result["confidence"], "alta")

    def test_generic_blood_words_do_not_force_a_theme(self):
        for heading in ("Hemácias", "Hemorrágico", "Plaquetas", "Concentrado"):
            with self.subTest(heading=heading):
                result = classify_image("generica.png", [line(heading)])
                self.assertEqual(result["theme"], "a-classificar")
                self.assertTrue(result["needsReview"])

    def test_classifier_version_tracks_the_specific_phrase_update(self):
        self.assertEqual(CLASSIFIER_VERSION, "360x-topics-1.1")
        self.assertEqual(taxonomy_document()["classifierVersion"], CLASSIFIER_VERSION)

    def test_clinical_subject_beats_recurrent_branding(self):
        result = classify_image("ChatGPT Image 12 de setembro.png", [
            line("Turbo TEMI 360X — TDAH friendly", y=0.93),
            line("PNEUMONIA ADQUIRIDA NA COMUNIDADE", y=0.79),
            line("Imagem gerada por IA", y=0.02),
        ])
        self.assertEqual(result["theme"], "pneumologia")
        self.assertNotIn("tdah-neurodiversidade", result["secondaryThemes"])
        self.assertNotIn("ia-produtividade", result["secondaryThemes"])

    def test_branding_alone_does_not_invent_a_subject(self):
        result = classify_image("ChatGPT Image 2026-11-02.png", [
            line("Turbo TEMI 360X TDAH friendly"),
            line("Imagem gerada por inteligência artificial", y=0.02),
        ])
        self.assertEqual(result["theme"], "a-classificar")
        self.assertTrue(result["needsReview"])

    def test_explicit_logo_is_visual_identity(self):
        self.assertEqual(classify_image("logo-360x.png", []) ["theme"], "identidade-360x")

    def test_tdah_is_distinct_from_neurocritical_illness(self):
        result = classify_image("generica.png", [line("TDAH e funções executivas")])
        self.assertEqual(result["theme"], "tdah-neurodiversidade")
        self.assertNotIn("neuro-uti", result["secondaryThemes"])
        self.assertEqual(classify_image("AVC-neuro-UTI.png", [])["theme"], "neuro-uti")

    def test_tdah_folder_survives_unresolved_text(self):
        result = classify_image("IMAGENS TDAH/ChatGPT Image 09_01.png", [line("Um passo de cada vez")])
        self.assertEqual(result["theme"], "tdah-neurodiversidade")
        self.assertEqual(result["method"], "pasta")
        self.assertTrue(result["needsReview"])

    def test_specific_subject_can_resolve_tdah_folder(self):
        result = classify_image("IMAGENS TDAH/ChatGPT Image.png", [line("AVC isquêmico e NIHSS")])
        self.assertEqual(result["theme"], "neuro-uti")

    def test_pdd_folder_is_retained_without_inventing_expansion(self):
        result = classify_image("IMAGENS PDD/000_a3e9.png", [line("Narrativas e possibilidades")])
        self.assertEqual(result["theme"], "pdd-acervo")
        self.assertEqual(result["method"], "pasta")
        self.assertNotIn("diagnóstico", result["reason"].lower())
        self.assertNotIn("plano", result["themeLabel"].lower())

    def test_pdd_not_assigned_from_ambiguous_acronym(self):
        self.assertEqual(classify_image("PDD.png", [line("PDD")])["theme"], "a-classificar")

    def test_unknown_generic_names_stay_unclassified(self):
        for name in ("005__07fe4b28-980e-4002-a11b-60327f09496d.png", "ChatGPT Image 4 de ago.png", "07:06/IMG_001.png"):
            result = classify_image(name, [])
            self.assertEqual(result["theme"], "a-classificar")
            self.assertEqual(result["method"], "revisao")

    def test_no_diagnosis_from_photograph_metadata(self):
        result = classify_image("foto-familia.png", [line("Paciente, mãe, homem, clínica")])
        self.assertEqual(result["theme"], "a-classificar")
        self.assertNotIn("familia-paciente", result["secondaryThemes"])

    def test_family_communication_has_its_own_evidence(self):
        self.assertEqual(classify_image("reuniao-familiar.png", [])["theme"], "familia-paciente")

    def test_financial_and_legal_signals_remain_reviewable(self):
        for text in ("Extrato bancário", "Divórcio e processo judicial", "Planejamento financeiro"):
            result = classify_image("generica.png", [line(text)])
            self.assertEqual(result["theme"], "vida-organizacao")
            self.assertTrue(result["needsReview"])
            self.assertNotEqual(result["confidence"], "alta")

    def test_private_ocr_text_is_not_echoed_in_the_result(self):
        result = classify_image("generica.png", [line("CPF 123.456.789-09: título privado de Maria"), line("DPOC", y=0.75)])
        rendered = json.dumps(result, ensure_ascii=False)
        self.assertNotIn("123", rendered)
        self.assertNotIn("Maria", rendered)
        self.assertEqual(result["theme"], "pneumologia")
        self.assertTrue(result["needsReview"])

    def test_short_acronyms_need_word_boundaries(self):
        self.assertEqual(classify_image("diagrama-e-familia.png", [line("A criação e o dia")])["theme"], "a-classificar")

    def test_repeated_body_text_does_not_outvote_title(self):
        result = classify_image("image.png", [line("PNEUMONIA")] + [line("POCUS", y=0.20) for _ in range(40)])
        self.assertEqual(result["theme"], "pneumologia")

    def test_low_quality_ocr_is_ignored(self):
        self.assertEqual(classify_image("image.png", [line("DPOC", confidence=0.25)])["theme"], "a-classificar")

    def test_bottom_caption_is_not_treated_as_title(self):
        result = classify_image("image.png", [line("SEPSE", y=0.90), line("POCUS", y=0.02, height=0.2)])
        self.assertEqual(result["theme"], "sepse-choque")

    def test_at_most_three_themes(self):
        result = classify_image("image.png", [line("POCUS SEPSE DPOC TVP AVC")])
        self.assertLessEqual(1 + len(result["secondaryThemes"]), 3)
        self.assertTrue(result["needsReview"])

    def test_taxonomy_document_is_serializable_and_private(self):
        document = taxonomy_document()
        json.dumps(document, allow_nan=False)
        self.assertTrue(document["private"])
        self.assertEqual(len(document["themes"]), 24)
        self.assertTrue(document["policy"]["noPhotoDiagnosis"])

    def test_malformed_optional_lines_do_not_crash(self):
        result = classify_image("unknown.png", [None, {}, {"text": "DPOC", "confidence": "bad", "y": float("nan")}])
        self.assertIn(result["theme"], THEMES)


if __name__ == "__main__":
    unittest.main()
