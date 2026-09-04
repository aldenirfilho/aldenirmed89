"use strict";

window.ANTIGRAVITY_TCE_CRASH = Object.freeze({
  meta: Object.freeze({
    schemaVersion: "antigravity-tce-crash-v1",
    moduleId: "tce-grave-crash",
    title: "TCE grave · Protocolo CRASH",
    version: "1.1.0-rc.2",
    updatedAt: "2026-09-04",
    status: "em-revisao-medica",
    mnemonic: Object.freeze({
      C: "Circulação, coluna e capnografia",
      R: "Respiração e via aérea neuroprotetora",
      A: "Avaliação neurológica e agentes",
      S: "Segunda lesão, sedação e sincronização",
      H: "Herniação, resgate e handoff"
    })
  }),
  targets: Object.freeze({
    spo2: "≥94%",
    paco2: "35–38 mmHg quando há suspeita de hipertensão intracraniana",
    systolicBloodPressure: Object.freeze({
      age15to49: "≥110 mmHg",
      age50to69: "≥100 mmHg",
      ageOver70: "≥110 mmHg"
    }),
    icp: "tratar elevação sustentada >22 mmHg",
    cpp: "60–70 mmHg"
  }),
  asynchronies: Object.freeze([
    "fome-de-fluxo",
    "esforco-ineficaz",
    "auto-disparo",
    "duplo-disparo",
    "ciclagem-precoce",
    "ciclagem-tardia",
    "auto-peep",
    "reverse-triggering"
  ]),
  visualAtlas: Object.freeze({
    id: "tce-tc-360x",
    count: 10,
    aspectRatio: "16:9",
    synthetic: true,
    diagnosticUse: false
  }),
  sourceFamilies: Object.freeze([
    "Neurocritical Care Society ENLS 6.0",
    "Brain Trauma Foundation",
    "American College of Surgeons",
    "Neurocritical Care Society Guidelines",
    "ESICM",
    "ATS",
    "ELSO",
    "SCCM",
    "American Heart Association 2025"
  ]),
  safety: Object.freeze({
    authorialMnemonic: true,
    validatedScore: false,
    storesPatientData: false,
    networkRuntime: false,
    medicalReviewRequired: true,
    localProtocolRequired: true
  })
});

window.dispatchEvent(new CustomEvent("antigravity:tce-crash-ready", {
  detail: { version: window.ANTIGRAVITY_TCE_CRASH.meta.version }
}));
