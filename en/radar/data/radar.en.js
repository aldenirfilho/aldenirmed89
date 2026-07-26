"use strict";

/*
 * English editorial mirror of the 2026-07-25 Antigravity Daily Radar.
 * Source dates, checked timestamps, URLs, reported numbers, cautions, and
 * commercial disclosures mirror the Portuguese edition. The educational
 * images remain in Portuguese in this first release; each image is paired
 * with an English transcript in the interface.
 */

const CHECKED_AT = "2026-07-25T22:40:00-03:00";

const science = [
  {
    id: "pmid:42469838",
    section: "scientific",
    priority: 1,
    date: "2026-07-17",
    sourcePublishedAt: "2026-07-17T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Prospective two-centre study",
    evidenceLevel: "Physiological observational evidence",
    access: "open",
    topic: "Hemodynamics",
    title: "Intra-abdominal hypertension reduces the reliability of passive leg raising",
    source: "Critical Care · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42469838/",
    summary: "In 88 mechanically ventilated patients, passive leg raising discriminated fluid responsiveness very well without intra-abdominal hypertension but performed less well when intra-abdominal pressure was ≥12 mmHg. End-expiratory occlusion and a mini-fluid challenge retained better performance in that subgroup.",
    why: "It prevents an overly binary interpretation of a dynamic test used frequently in the ICU.",
    caveat: "This was a small physiological observational study; diagnostic performance does not demonstrate improved patient outcomes.",
    evidence: {
      design: "Prospective observational comparison of dynamic tests in two centres against change in cardiac output.",
      population: "88 ventilated adults; intra-abdominal hypertension was defined as intra-abdominal pressure ≥12 mmHg.",
      mainResult: "Passive-leg-raising AUROC was 0.96 without intra-abdominal hypertension and 0.71 with it; in the hypertension subgroup, end-expiratory occlusion and mini-fluid challenge had AUROCs of 0.89 and 0.90.",
      practice: "Measure intra-abdominal pressure when clinically suspected. If elevated, integrate end-expiratory occlusion, mini-fluid challenge, cardiac output, and fluid tolerance.",
      doNotInfer: "Do not give fluid solely because a test is positive. Fluid responsiveness is not the same as need or tolerance."
    }
  },
  {
    id: "pmid:42476363",
    section: "scientific",
    priority: 1,
    date: "2026-07-20",
    sourcePublishedAt: "2026-07-20T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Clinical review",
    evidenceLevel: "Open narrative review",
    access: "open",
    topic: "POCUS",
    title: "A POCUS pyramid integrates the heart, lungs, and systemic venous congestion",
    source: "Clinical Medicine · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42476363/",
    summary: "The review proposes integrating cardiac, lung, and venous ultrasound with dynamic variables—ventilation, preload, vasoactive therapy, and metabolism—instead of treating a single window as a complete diagnosis.",
    why: "It converts isolated images into a structured physiological question for shock and hypoxemia.",
    caveat: "This is an integrative review model, not a validated score or an outcomes trial.",
    evidence: {
      design: "Clinical review organized as a teaching pyramid.",
      population: "Critically ill patients with shock, hypoxemia, or hemodynamic uncertainty.",
      mainResult: "Three pillars—heart, lungs, and systemic venous congestion—should be interpreted in physiological context and reassessed after intervention.",
      practice: "Start with the clinical question, obtain technically adequate windows, integrate the three domains, and document limitations and response to intervention.",
      doNotInfer: "Do not treat the pyramid as a validated protocol or use POCUS to replace examination, monitoring, or a confirmatory method when indicated."
    }
  },
  {
    id: "pmid:41848489",
    section: "scientific",
    priority: 1,
    date: "2026-07-15",
    sourcePublishedAt: "2026-07-15T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Randomized clinical trial",
    evidenceLevel: "Open-label, single-centre RCT",
    access: "semi-open",
    topic: "AI in health care",
    title: "AI in low-dose CT detected more nodules without shortening reading time",
    source: "AJR · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/41848489/",
    summary: "Across 911 examinations in asymptomatic people, AI assistance did not significantly shorten interpretation time. It increased positive Lung-RADS findings and follow-up CT recommendations; no cancer was diagnosed during a median follow-up of about 215 days.",
    why: "It shows the practical paradox: greater detection may trigger more investigation before clinical benefit is demonstrated.",
    caveat: "Single-centre opportunistic screening with short follow-up; mortality and long-term overdiagnosis were not assessed.",
    evidence: {
      design: "Prospective, randomized, open-label, single-centre trial.",
      population: "911 asymptomatic individuals undergoing check-ups; 10 thoracic radiologists.",
      mainResult: "Reading time 187 vs 172 seconds (p=0.23); positive Lung-RADS 16.9% vs 10.3%; follow-up CT recommendation 15.3% vs 7.4%.",
      practice: "Before adoption, track actual reading time, false positives, downstream imaging, confirmed cancer, workload, and equity.",
      doNotInfer: "Do not conclude that the AI improves cancer outcomes or replaces a radiologist."
    }
  },
  {
    id: "pmid:42449426",
    section: "scientific",
    priority: 1,
    date: "2026-07-14",
    sourcePublishedAt: "2026-07-14T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Randomized-trial follow-up",
    evidenceLevel: "One-year outcome analysis",
    access: "open",
    topic: "Mechanical ventilation",
    title: "Ultra-low tidal volume: similar survival and a cognitive signal requiring caution",
    source: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42449426/",
    summary: "In a follow-up of 215 patients with COVID-19 ARDS randomized to 4 or 6 mL/kg predicted body weight, one-year mortality did not differ significantly. Among survivors, the ultra-low-volume group had a median 5-minute MoCA score 2 points lower; hypercapnia was associated with the result but causality was not established.",
    why: "Lung protection must be balanced against treatment burden and possible systemic effects.",
    caveat: "Survivor analysis, a brief cognitive scale, and a non-causal association with hypercapnia.",
    evidence: {
      design: "Follow-up of a multicentre randomized trial.",
      population: "215 adults with COVID-19-related ARDS.",
      mainResult: "No significant difference in one-year mortality; among survivors, median 5-minute MoCA was 2 points lower in the ultra-low-volume group.",
      practice: "Individualize the strategy and monitor respiratory drive, synchrony, pH/PaCO₂, sedation, and outcomes beyond the lungs.",
      doNotInfer: "Do not claim that hypercapnia caused cognitive impairment or abandon standard lung-protective ventilation."
    }
  },
  {
    id: "pmid:42432993",
    section: "scientific",
    priority: 1,
    date: "2026-07-10",
    sourcePublishedAt: "2026-07-10T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Randomized clinical trial",
    evidenceLevel: "Single-centre RCT",
    access: "open",
    topic: "Delirium",
    title: "Flexible family visiting reduced delirium in one orthopaedic ICU",
    source: "Journal of International Medical Research · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42432993/",
    summary: "Among 405 patients aged ≥60 years after orthopaedic surgery, flexible visiting was associated with less delirium (29.5% vs 44.4%) and less sedative use (32.0% vs 44.9%), without an observed increase in infection or length of stay.",
    why: "It is a potentially simple human intervention whose effect depends on context and implementation.",
    caveat: "Single orthopaedic ICU; results contrast with earlier larger trials in broader ICU populations.",
    evidence: {
      design: "Parallel, randomized, single-centre trial.",
      population: "405 patients aged 60 years or older admitted after orthopaedic surgery.",
      mainResult: "Delirium 29.5% vs 44.4%; sedative use 32.0% vs 44.9%; no observed increase in infection or length of stay.",
      practice: "Define eligibility, family education, flexible hours, hygiene, safe participation, and local outcome measurement.",
      doNotInfer: "Do not turn one single-centre trial into a universal policy or attribute the full effect only to family presence."
    }
  },
  {
    id: "pmid:42393197",
    section: "scientific",
    priority: 2,
    date: "2026-07-02",
    sourcePublishedAt: "2026-07-02T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Evaluation study",
    evidenceLevel: "AI evaluators compared with physicians",
    access: "open",
    topic: "AI in health care",
    title: "AI evaluating AI: useful for triage, insufficient to replace clinical judgment",
    source: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42393197/",
    summary: "More than 400 physicians across seven specialties compared human and automated assessments of AI-generated clinical answers. AI evaluators were efficient and directionally aligned, but missed nuances identified by specialists.",
    why: "It matters to any system proposing automated audit of medical answers.",
    caveat: "Average alignment does not eliminate rare failures, specialty differences, or shared bias between the evaluated and evaluating systems.",
    evidence: {
      design: "Comparative study with multispecialty human evaluation.",
      population: "More than 400 physicians from seven specialties and clinical responses generated by AI.",
      mainResult: "Automated evaluators were fast and directionally aligned on average, but did not capture all clinical nuance.",
      practice: "Use human sampling, explicit criteria, double-checking of critical items, and tracking of disagreements.",
      doNotInfer: "An automated score is not proof of clinical safety or correctness."
    }
  },
  {
    id: "pmid:42012891",
    section: "scientific",
    priority: 1,
    date: "2026-07-01",
    sourcePublishedAt: "2026-07-01T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Randomized pilot trial",
    evidenceLevel: "Open-label pilot",
    access: "semi-open",
    topic: "POCUS",
    title: "Fluid-tolerance POCUS changed management in half of patients with AKI",
    source: "CJASN · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42012891/",
    summary: "In 80 non-critically ill patients with acute kidney injury, B-lines and VExUS changed the initially planned management in 50% and increased early diuretic use. The pilot showed no difference in five-day fluid balance, AKI progression, or death/escalation.",
    why: "It places congestion and tolerance beside the usual question of fluid responsiveness.",
    caveat: "Small, open-label, single-centre pilot in non-critically ill patients; not designed to establish clinical efficacy.",
    evidence: {
      design: "Open-label, randomized, single-centre pilot trial.",
      population: "80 non-critically ill patients with AKI for whom fluid had been started or considered.",
      mainResult: "POCUS changed the intended approach in 50%; day-1 diuretic use was 40% vs 15%; no demonstrated difference in the main exploratory clinical outcomes.",
      practice: "Ask separately: is the patient responsive, is fluid needed, and is fluid tolerated? Document B-lines/VExUS and reassess.",
      doNotInfer: "Do not prescribe a diuretic or withhold fluid based on VExUS alone; the study did not prove improved outcomes."
    }
  },
  {
    id: "pmid:42159452",
    section: "scientific",
    priority: 2,
    date: "2026-07-01",
    sourcePublishedAt: "2026-07-01T11:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Pragmatic randomized trial",
    evidenceLevel: "Single-centre RCT",
    access: "open",
    topic: "Delirium",
    title: "The ABCDEF bundle did not reduce delirium in this Australian pragmatic trial",
    source: "Critical Care Medicine · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42159452/",
    summary: "Full bundle adherence occurred on 50% of days. Cumulative delirium was similar (37.9% vs 36.4%), as were duration and function at ICU discharge; one usual-activities domain was better at 90 days and requires confirmation.",
    why: "It shows how implementation fidelity, context, and outcome selection shape a complex intervention.",
    caveat: "One eight-bed ICU, several components already present in usual care, and limited full adherence.",
    evidence: {
      design: "Pragmatic randomized trial in one mixed medical-surgical ICU.",
      population: "Adults expected to remain in the ICU for at least 48 hours.",
      mainResult: "Delirium 37.9% vs 36.4%; similar duration and function; a signal in one quality-of-life domain at 90 days.",
      practice: "Audit each component, actual adherence, sedation, mobility, communication, and local outcomes.",
      doNotInfer: "Do not abandon the bundle or promise that merely introducing it will reduce delirium."
    }
  },
  {
    id: "pmid:41855428",
    section: "scientific",
    priority: 2,
    date: "2026-07-01",
    sourcePublishedAt: "2026-07-01T10:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Phase 3 non-inferiority trial",
    evidenceLevel: "Multicentre RCT",
    access: "semi-open",
    topic: "Sedation",
    title: "Remimazolam was non-inferior to propofol for short postoperative sedation",
    source: "Anesthesiology · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/41855428/",
    summary: "Among 211 nearly all postoperative patients sedated for up to 24 hours, sedation success was 98.1% with remimazolam and 96.2% with propofol, meeting the −8% non-inferiority margin.",
    why: "It introduces a potential option, but only in a narrow setting and duration.",
    caveat: "Do not extrapolate to prolonged sedation, shock, delirium, or different clinical populations.",
    evidence: {
      design: "Phase 3, multicentre, randomized, assessor-blinded non-inferiority trial.",
      population: "211 ventilated patients; 99.1% postoperative; treatment for no more than 24 hours.",
      mainResult: "Success 98.1% vs 96.2%; difference 1.9%, 95% CI −3.3 to 7.8, compatible with the −8% non-inferiority margin.",
      practice: "Do not change a protocol from the abstract alone; compare population, margin, adverse events, recovery, and local cost.",
      doNotInfer: "Do not claim superiority, less delirium, or safety during prolonged sedation."
    }
  },
  {
    id: "pmid:42229230",
    section: "scientific",
    priority: 2,
    date: "2026-06-02",
    sourcePublishedAt: "2026-06-02T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Systematic review and meta-analysis",
    evidenceLevel: "52 observational studies",
    access: "semi-open",
    topic: "Delirium",
    title: "Sepsis-associated delirium: high pooled incidence, but risk is not causality",
    source: "Intensive & Critical Care Nursing · PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/42229230/",
    summary: "The meta-analysis included 52 studies and 89,789 patients, estimating a pooled incidence of 43%. Age, illness severity, mechanical ventilation, lactate, and cerebrovascular disease were associated factors amid heterogeneity and potential confounding.",
    why: "It supports recognition of high risk without converting associations into unvalidated decision tools.",
    caveat: "Mostly observational evidence with heterogeneous definitions and populations; associated factors are not necessarily modifiable or causal.",
    evidence: {
      design: "Systematic review and meta-analysis of 52 studies.",
      population: "89,789 ICU patients with sepsis.",
      mainResult: "Pooled incidence 43% (95% CI 39–47%); several clinical and severity markers were associated.",
      practice: "Use validated screening and review sedation, pain, sleep, mobility, hypoxemia, infection, metabolic factors, and medications.",
      doNotInfer: "Do not treat one factor as a validated score or an associated marker as a proven cause."
    }
  }
];

const healthAndSystems = [
  {
    id: "who:precision-medicine-ai-2026-07-24",
    section: "context",
    priority: 2,
    date: "2026-07-24",
    sourcePublishedAt: "2026-07-24T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "International cooperation",
    evidenceLevel: "Institutional announcement",
    access: "open",
    topic: "AI in health care",
    title: "WHO South-East Asia and the University of Colombo announce training in AI and precision medicine",
    source: "WHO South-East Asia",
    url: "https://www.who.int/southeastasia/news/detail/24-07-2026-who-searo-and-university-of-colombo-collaborate-on-ai-leadership-and-capacity-development-for-precision-medicine-primary-health-care-and-universal-health-coverage",
    summary: "The partnership plans leadership and capacity development in AI, genomics, and precision medicine with a focus on primary care and universal health coverage.",
    why: "Training and governance may influence how clinical technologies reach public systems.",
    caveat: "This is a cooperation announcement, not an efficacy evaluation, a Brazilian implementation timetable, or evidence of patient benefit.",
    routineImpact: "For clinicians and students: follow changes in curricula, data competencies, and validation requirements. Do not mistake institutional training for a clinically ready tool.",
    evidence: {
      design: "Official announcement of an academic-institutional partnership.",
      population: "Health leaders and professionals in the WHO South-East Asia Region.",
      mainResult: "Capacity-development areas were set out for AI, genomics, and precision medicine.",
      practice: "Strengthen data literacy, privacy, bias awareness, external validation, and human oversight.",
      doNotInfer: "The partnership is not evidence of clinical benefit from any specific technology."
    }
  },
  {
    id: "who:west-nile-europe-2026-07-24",
    section: "context",
    priority: 1,
    date: "2026-07-24",
    sourcePublishedAt: "2026-07-24T11:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Epidemiological alert",
    evidenceLevel: "Official surveillance",
    access: "open",
    topic: "Global health",
    title: "West Nile virus activity rises in parts of Europe: recognize the neuroinvasive phenotype",
    source: "WHO Europe",
    url: "https://www.who.int/europe/news/item/24-07-2026-west-nile-virus--as-cases-rise-across-parts-of-europe--here-is-what-you-need-to-know",
    summary: "WHO reported cases in Greece and Italy in 2026. Most infections are asymptomatic; severe neurological disease occurs in about 1 in 150 infected people. There is no licensed human vaccine or specific antiviral treatment.",
    why: "Travel, mosquito exposure, and an acute neurological syndrome can turn a distant alert into a local differential diagnosis.",
    caveat: "European counts do not estimate an individual patient’s risk in Brazil; check local epidemiology and surveillance guidance.",
    routineImpact: "For clinicians: ask about travel and exposure, recognize meningitis, encephalitis, or acute flaccid paralysis, and follow local reporting rules. For students: review flaviviruses and neuroinfection differentials.",
    evidence: {
      design: "Official surveillance update and public guidance.",
      population: "People exposed to mosquitoes where the virus is circulating, particularly older and immunocompromised people.",
      mainResult: "About 70–80% are asymptomatic; severe neuroinvasive disease occurs in approximately 1/150 infected people; treatment is supportive.",
      practice: "Ask about travel and exposure, perform a neurological examination, provide supportive care, and follow local diagnostic and reporting rules.",
      doNotInfer: "Do not infer local Brazilian transmission from European data or use a specific antibiotic/antiviral without another indication."
    }
  },
  {
    id: "ms:fumaça-incendios-2026-07-21",
    section: "context",
    priority: 1,
    date: "2026-07-21",
    sourcePublishedAt: "2026-07-21T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Public-health alert",
    evidenceLevel: "Official guidance",
    access: "open",
    topic: "Environmental health",
    title: "Brazil’s Ministry of Health monitors wildfire smoke: respiratory risk reaches the clinical shift",
    source: "Brazilian Ministry of Health",
    url: "https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-monitora-impactos-dos-incendios-florestais-na-saude-e-orienta-populacao-sobre-exposicao-a-fumaca",
    summary: "The Ministry reinforced surveillance of smoke-related health effects and exposure-reduction guidance. Fine particulate matter can worsen respiratory and cardiovascular disease, especially in children, older people, pregnant people, and those with comorbidities.",
    why: "It translates an environmental story into history-taking, prevention, care pathways, and capacity planning.",
    caveat: "Risk varies with local concentration, exposure duration, and vulnerability; consult regional air-quality and surveillance data.",
    routineImpact: "For clinicians: add smoke exposure to the history, review asthma/COPD plans, identify hypoxemia, and counsel exposure reduction. For students: connect PM2.5, inflammation, and cardiorespiratory decompensation.",
    evidence: {
      design: "Official monitoring and prevention communication.",
      population: "Exposed communities, with added attention to children, older people, pregnant people, and those with cardiac or pulmonary disease.",
      mainResult: "Smoke includes fine particles that can penetrate deeply into the respiratory tract and exacerbate disease.",
      practice: "Ask where and how long exposure occurred, assess symptoms, comorbidities, and oxygen saturation, and explain exposure reduction and warning signs.",
      doNotInfer: "Do not attribute every symptom to smoke or promise complete protection from a mask or indoor environment."
    }
  },
  {
    id: "ms:diagnostico-portatil-tb-2026-07-15",
    section: "context",
    priority: 2,
    date: "2026-07-15",
    sourcePublishedAt: "2026-07-15T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Technology procurement initiative",
    evidenceLevel: "Official market consultation",
    access: "open",
    topic: "Brazilian public health and innovation",
    title: "Brazil consults the market on a portable tuberculosis diagnostic solution",
    source: "Brazilian Ministry of Health",
    url: "https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-recebe-contribuicoes-do-mercado-para-desenvolver-encomenda-tecnologica-que-identificara-tuberculose/",
    summary: "The Ministry received contributions toward a portable tuberculosis identification solution intended to bring diagnosis closer to territories and populations facing access barriers.",
    why: "A field technology could affect time to diagnosis, isolation, treatment, and surveillance.",
    caveat: "Consultation and development do not mean there is an approved, validated, purchased, or locally available product.",
    routineImpact: "For clinicians and students: continue using the current diagnostic pathway and watch for validation population, sensitivity, specificity, and implementation before adopting the technology.",
    evidence: {
      design: "Institutional consultation for a technology order.",
      population: "Populations and territories facing barriers to conventional diagnosis.",
      mainResult: "A development initiative exists; this source does not announce an available validated product.",
      practice: "Use current recommended methods and pathways while following validation studies and official guidance.",
      doNotInfer: "Do not advertise the technology as available or replace a recommended test."
    }
  },
  {
    id: "amib:temi-2026-edital",
    section: "context",
    priority: 1,
    date: "2026-03-18",
    sourcePublishedAt: "2026-03-18T14:49:31-03:00",
    checkedAt: CHECKED_AT,
    kind: "Official deadline",
    evidenceLevel: "Updated official notice",
    access: "open",
    topic: "TEMI",
    title: "TEMI 2026: the July 31 deadline requires action from already-registered candidates",
    source: "AMIB · TEMI 2026 notice",
    url: "https://d1xe7tfg0uwul9.cloudfront.net/amib-portal/wp-content/uploads/2026/03/18144931/Edital-TEMI-2026-Atualizado.pdf",
    summary: "For candidates who already registered, the updated notice sets July 31 at 20:00 for document updates/resubmission and July 31 at 18:00 as the expected special-accommodation analysis time. Registration closed on July 15.",
    why: "A time-sensitive administrative task carries more immediate operational risk than another study session.",
    caveat: "Check amendments and your individual status in the official channel. This summary does not reopen closed registration.",
    routineImpact: "For a registered candidate: audit files, receipts, and status before the deadline. The notice schedules the written exam for November 10 and the practical exam for November 15 in Olinda.",
    evidence: {
      design: "Operational reading of the updated official notice.",
      population: "Candidates who completed registration by July 15, 2026.",
      mainResult: "Document update/resubmission is due July 31 at 20:00; verify status and any amendments in the official portal.",
      practice: "Open the official portal, verify status, legible documents, proof of submission, and any correction request; retain evidence of sending.",
      doNotInfer: "This summary is not confirmation of registration, approval, or a right to reopen registration."
    }
  },
  {
    id: "sesa-ce:pas-tb-cuida-2026",
    section: "context",
    priority: 2,
    date: "2026-06-30",
    sourcePublishedAt: "2026-06-30T12:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "State health planning",
    evidenceLevel: "Official annual programme",
    access: "open",
    topic: "Ceará",
    title: "Ceará includes digital tuberculosis actions in its annual health programme",
    source: "Ceará State Health Department",
    url: "https://www.saude.ce.gov.br/wp-content/uploads/sites/9/2026/06/PAS-2026.pdf",
    summary: "Ceará’s Annual Health Programme records actions to improve tuberculosis surveillance and care, including digital initiatives such as TB CUIDA.",
    why: "It links state policy, surveillance, and continuity of care to the region where this platform is used.",
    caveat: "A planning document does not demonstrate coverage, actual adoption, effectiveness, or availability in every municipality.",
    routineImpact: "For clinicians in Ceará: knowing municipal pathways and state channels may reduce loss to follow-up, but confirm local availability before advising a patient.",
    evidence: {
      design: "Official annual health planning and targets document.",
      population: "The health network and people receiving tuberculosis care in Ceará.",
      mainResult: "The action appears in the plan; delivery and reach need monitoring through indicators and official communication.",
      practice: "Check the municipal pathway, epidemiological surveillance, and official material before referring or enrolling a patient.",
      doNotInfer: "Do not claim that the tool is active statewide or improves outcomes without evaluation."
    }
  }
];

const productivityPurchases = [
  {
    id: "commerce:shopee-suporte-notebook-11683006699",
    section: "commercial",
    priority: 2,
    date: "2026-07-25",
    sourcePublishedAt: "2026-07-25T20:00:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Monitored offer",
    evidenceLevel: "Dynamic retail price",
    access: "open",
    topic: "Ergonomics and study",
    title: "A folding laptop stand is inexpensive, but ergonomic use requires peripherals",
    source: "Shopee Brazil",
    url: "https://shopee.com.br/Apoio-Notebook-Suporte-Laptop-Ergonomico-Dobravel-em-alum%C3%ADnio-i.392264865.11683006699",
    summary: "A search snapshot on July 25, 2026 showed R$52.15 promotional pricing versus R$54.90 reference pricing. Final cost may change with shipping, coupons, seller, and checkout.",
    why: "Raising the display can organize a study station and bring the top of the screen closer to eye level.",
    caveat: "Prolonged typing on an elevated keyboard may worsen wrist and shoulder position; combine it with an external keyboard and mouse.",
    price: {
      display: "R$ 52.15",
      reference: "R$ 54.90",
      checkedAt: "2026-07-25T20:00:00-03:00",
      availability: "Price seen in search; confirm at checkout.",
      volatile: true
    },
    commerce: {
      retailer: "Shopee",
      affiliate: false,
      specs: ["Advertised aluminium structure", "Foldable and angle-adjustable", "Compatibility and load limit require confirmation", "Check warranty and returns"],
      goodFor: "A fixed or mobile laptop setup with an external keyboard and mouse.",
      howToUse: "Set the top of the screen near eye level, support the forearms, and take movement breaks.",
      possibleBenefit: "It may reduce neck flexion and free desk space; it is not guaranteed to eliminate pain or improve performance.",
      worthIf: "Consider it if the structure is stable, supports your laptop, and the final delivered cost remains acceptable.",
      skipIf: "Skip it if it wobbles, blocks ventilation, cannot support the device, or you will not use external peripherals."
    },
    evidence: {
      design: "Practical comparison of function, ergonomics, price, and limitations in the listing.",
      population: "Laptop users studying for prolonged periods.",
      mainResult: "Low entry price and height adjustment can be useful, but ergonomics depend on the complete workstation.",
      practice: "Measure the desk and screen, and confirm stability, supported weight, ventilation, shipping, and returns.",
      doNotInfer: "Do not promise injury prevention or a measurable productivity gain."
    }
  },
  {
    id: "commerce:amazon-monitor-bettdow-b0d6dt84jd",
    section: "commercial",
    priority: 2,
    date: "2026-07-25",
    sourcePublishedAt: "2026-07-25T19:55:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Product watch",
    evidenceLevel: "Retailer specifications",
    access: "open",
    topic: "Digital productivity",
    title: "A 15.6-inch portable monitor is useful only if connection, power, and warranty fit",
    source: "Amazon Brazil",
    url: "https://www.amazon.com.br/Bettdow-Portatil-Conectado-Inteligente-magn%C3%A9tico/dp/B0D6DT84JD",
    summary: "The page advertises a 1920×1080 Full HD IPS panel, 178° viewing angle, two full-function USB-C ports, Mini HDMI, about 655 g, a magnetic cover, and speakers. No verifiable offer price was available at review time.",
    why: "It can keep a paper/PDF on one screen and notes or questions on the other, reducing window switching.",
    caveat: "The computer’s USB-C port must support DisplayPort Alt Mode; some setups need HDMI plus separate power.",
    price: {
      display: "Price not confirmed",
      reference: "Open the current offer",
      checkedAt: "2026-07-25T19:55:00-03:00",
      availability: "No verifiable offer price during the review.",
      volatile: true
    },
    commerce: {
      retailer: "Amazon",
      affiliate: false,
      specs: ["15.6 inches", "1920×1080 IPS", "Advertised 178° viewing angle", "2 full-function USB-C ports + Mini HDMI", "Approximately 655 g", "Magnetic cover and speakers"],
      goodFor: "Paper/PDF + notes, training chart + guideline, or lecture + questions.",
      howToUse: "Before purchase, test DP Alt Mode, ports, cable, power, brightness, display scaling, stand, and macOS/Windows compatibility.",
      possibleBenefit: "It may reduce window switching; improvement in focus or speed is not guaranteed.",
      worthIf: "It may fit users who genuinely need two simultaneous sources and portability.",
      skipIf: "Skip it if the laptop screen is already sufficient, compatible ports are absent, or warranty/returns are weak."
    },
    evidence: {
      design: "Audit of listed specifications, compatibility, intended use, and unconfirmed cost.",
      population: "Clinicians and students whose digital workflow uses two sources at the same time.",
      mainResult: "The advertised package is portable and Full HD, but current price and practical compatibility require confirmation.",
      practice: "Count how often you switch windows; check ports and compare warranty, brightness, weight, and final price.",
      doNotInfer: "Do not promise a percentage productivity gain or professional colour accuracy."
    }
  },
  {
    id: "commerce:amazon-jbl-tune-770nc-b0c664nhv6",
    section: "commercial",
    priority: 2,
    date: "2026-07-25",
    sourcePublishedAt: "2026-07-25T19:50:00-03:00",
    checkedAt: CHECKED_AT,
    kind: "Product watch",
    evidenceLevel: "Retailer specifications",
    access: "open",
    topic: "Audio and focus",
    title: "ANC headphones may support study—but never at the cost of awareness and safety",
    source: "Amazon Brazil",
    url: "https://www.amazon.com.br/JBL-Fone-Ouvido-770NC-Bluetooth/dp/B0C664NHV6",
    summary: "The JBL Tune 770NC page lists active noise cancellation, Ambient Aware/TalkThru, Bluetooth 5.3, multipoint connectivity, app equalization, and up to 70 hours of battery life. No featured offer could be confirmed.",
    why: "Reducing background noise may make a study environment more predictable for some people.",
    caveat: "Do not use isolation during clinical duty, traffic, driving, or any setting where alarms and people must remain audible; protect your hearing.",
    price: {
      display: "No featured offer",
      reference: "Compare price and warranty",
      checkedAt: "2026-07-25T19:50:00-03:00",
      availability: "Page active, without a featured offer at review time.",
      volatile: true
    },
    commerce: {
      retailer: "Amazon",
      affiliate: false,
      specs: ["Active noise cancellation", "Ambient Aware and TalkThru", "Bluetooth 5.3", "Multipoint connection", "App-based EQ", "Up to 70 advertised hours"],
      goodFor: "Individual study in a safe setting, video classes, and focus cycles.",
      howToUse: "Keep volume moderate, take listening breaks, and use ambient mode when the surroundings must remain audible.",
      possibleBenefit: "It may reduce perceived sound distraction; it does not treat ADHD or guarantee focus.",
      worthIf: "Consider it only if comfort, seal, ambient mode, warranty, and final price are suitable.",
      skipIf: "Do not buy for ANC alone; skip it if it clamps, overheats, isolates too much, or encourages high volume."
    },
    evidence: {
      design: "Audit of specifications, context of use, and safety.",
      population: "Students and professionals during focus sessions away from direct patient care.",
      mainResult: "ANC, ambient mode, and multipoint may support workflow; current price was not confirmed.",
      practice: "Test comfort, latency, microphone, ambient mode, volume, and return policy.",
      doNotInfer: "Do not promise focus, academic performance, or a clinical benefit."
    }
  }
];

const visualPairs = [
  {
    id: "plr-hia",
    itemId: "pmid:42469838",
    cardFile: "../../15_Radar_Cientifico/assets/cards/01-plr-hia-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/01-plr-hia-wide.png",
    title: "PLR under abdominal pressure",
    caption: "Why a negative test becomes less reliable when intra-abdominal pressure is elevated.",
    alt: "Portuguese clinical infographic about passive leg raising in intra-abdominal hypertension.",
    transcript: "In 88 ventilated patients, PLR AUROC fell from 0.96 without intra-abdominal hypertension to 0.71 with it. Measure pressure when suspected and integrate another dynamic test. Responsiveness is not need or tolerance."
  },
  {
    id: "pocus-pyramid",
    itemId: "pmid:42476363",
    cardFile: "../../15_Radar_Cientifico/assets/cards/02-pocus-piramide-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/02-pocus-piramide-wide.png",
    title: "The POCUS pyramid",
    caption: "Heart, lungs, and veins interpreted through one physiological question.",
    alt: "Portuguese infographic showing the heart, lungs, and systemic venous congestion domains of POCUS.",
    transcript: "Use the clinical question to select windows, integrate the three domains, intervene, and reassess. This is a narrative framework, not a validated score."
  },
  {
    id: "smoke-pm25",
    itemId: "ms:fumaça-incendios-2026-07-21",
    cardFile: "../../15_Radar_Cientifico/assets/cards/03-fumaca-mp25-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/03-fumaca-mp25-wide.png",
    title: "Smoke belongs in the history",
    caption: "Exposure, vulnerability, oxygen saturation, and warning signs.",
    alt: "Portuguese infographic about triage after wildfire-smoke exposure.",
    transcript: "Ask where and how long exposure occurred, assess comorbidities, symptoms, and oxygen saturation, and explain warning signs. Local concentration and individual vulnerability matter."
  },
  {
    id: "temi-deadline",
    itemId: "amib:temi-2026-edital",
    cardFile: "../../15_Radar_Cientifico/assets/cards/04-temi-prazo-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/04-temi-prazo-wide.png",
    title: "TEMI 2026: task before content",
    caption: "July 31: documents, status, and proof for candidates who already registered.",
    alt: "Portuguese TEMI 2026 checklist for the July 31 document deadline.",
    transcript: "Registered candidates should verify the official portal, file legibility, resubmission status, and proof before the deadline. Check amendments and your individual status."
  },
  {
    id: "ultra-low-vt-cognition",
    itemId: "pmid:42449426",
    cardFile: "../../15_Radar_Cientifico/assets/cards/05-vt-ultrabaixo-cognicao-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/05-vt-ultrabaixo-cognicao-wide.png",
    title: "Ultra-low tidal volume and the brain",
    caption: "Similar one-year survival; a cognitive signal that does not establish causality.",
    alt: "Portuguese infographic on ultra-low tidal volume, one-year mortality, and cognitive caution.",
    transcript: "Mortality did not differ significantly. Among survivors, brief MoCA was a median 2 points lower in the ultra-low group. Hypercapnia was associated but not proven causal."
  },
  {
    id: "flexible-visiting-delirium",
    itemId: "pmid:42432993",
    cardFile: "../../15_Radar_Cientifico/assets/cards/06-visita-flexivel-delirium-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/06-visita-flexivel-delirium-wide.png",
    title: "Family as a structured intervention",
    caption: "Less delirium in this trial; context and implementation still matter.",
    alt: "Portuguese infographic on flexible family visiting and delirium.",
    transcript: "Delirium was 29.5% vs 44.4% among 405 older patients in one orthopaedic ICU. Build education, hygiene, and safe participation; do not assume a universal effect."
  },
  {
    id: "ai-lung-nodules",
    itemId: "pmid:41848489",
    cardFile: "../../15_Radar_Cientifico/assets/cards/07-ia-nodulos-tc-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/07-ia-nodulos-tc-wide.png",
    title: "AI detects more—then what?",
    caption: "More nodules and follow-up recommendations without demonstrated time savings.",
    alt: "Portuguese infographic comparing lung-nodule detection and follow-up with AI assistance.",
    transcript: "AI did not significantly shorten reading time and increased positive Lung-RADS findings and follow-up recommendations. Short follow-up showed no diagnosed cancer in either group."
  },
  {
    id: "ai-evaluates-ai",
    itemId: "pmid:42393197",
    cardFile: "../../15_Radar_Cientifico/assets/cards/08-ia-avalia-ia-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/08-ia-avalia-ia-wide.png",
    title: "Who audits clinical AI?",
    caption: "Automation for triage; experts for nuance, disagreement, and risk.",
    alt: "Portuguese infographic about AI pre-auditing another clinical AI with physician review.",
    transcript: "Automated evaluators were efficient and directionally aligned but missed human nuance. Use them for pre-audit, retain specialist review, and track disagreements."
  },
  {
    id: "aki-pocus-fluid-tolerance",
    itemId: "pmid:42012891",
    cardFile: "../../15_Radar_Cientifico/assets/cards/09-aki-pocus-tolerancia-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/09-aki-pocus-tolerancia-wide.png",
    title: "AKI: responsive, needed, and tolerated?",
    caption: "B-lines and VExUS changed management; outcome benefit remains unproven.",
    alt: "Portuguese infographic separating fluid responsiveness, need, and tolerance in AKI.",
    transcript: "POCUS changed intended management in 50% and increased day-1 diuretic use in an 80-patient pilot. It did not prove better clinical outcomes."
  },
  {
    id: "west-nile",
    itemId: "who:west-nile-europe-2026-07-24",
    cardFile: "../../15_Radar_Cientifico/assets/cards/10-west-nile-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/cards/10-west-nile-wide.png",
    title: "West Nile: recognize the rare severe phenotype",
    caption: "Travel, mosquitoes, and an acute neurological syndrome guide suspicion.",
    alt: "Portuguese infographic on West Nile virus, travel exposure, and neuroinvasive warning signs.",
    transcript: "Severe neuroinvasive disease occurs in about 1/150 infected people. Ask about travel and exposure, provide supportive care, and check local surveillance guidance."
  },
  {
    id: "laptop-stand",
    itemId: "commerce:shopee-suporte-notebook-11683006699",
    cardFile: "../../15_Radar_Cientifico/assets/products/01-suporte-notebook-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/products/01-suporte-notebook-wide.png",
    title: "A laptop stand is a workstation, not an isolated part",
    caption: "Dated price, stability, ventilation, and peripherals before purchase.",
    alt: "Portuguese buying guide for a folding laptop stand and external peripherals.",
    transcript: "The snapshot was R$52.15 on July 25, 2026. Confirm final checkout, load, stability, ventilation, returns, keyboard, and mouse. No productivity or pain-relief claim is supported."
  },
  {
    id: "portable-monitor",
    itemId: "commerce:amazon-monitor-bettdow-b0d6dt84jd",
    cardFile: "../../15_Radar_Cientifico/assets/products/02-monitor-portatil-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/products/02-monitor-portatil-wide.png",
    title: "A second screen—with criteria",
    caption: "USB-C compatibility, power, warranty, and actual workflow determine value.",
    alt: "Portuguese buying guide for a Full HD portable monitor.",
    transcript: "The listed panel is 15.6-inch 1920×1080 IPS with two full-function USB-C ports, Mini HDMI, and about 655 g. Current price was unavailable; compatibility and productivity gains are not guaranteed."
  },
  {
    id: "anc-headphones",
    itemId: "commerce:amazon-jbl-tune-770nc-b0c664nhv6",
    cardFile: "../../15_Radar_Cientifico/assets/products/03-fone-anc-card.png",
    wideFile: "../../15_Radar_Cientifico/assets/products/03-fone-anc-wide.png",
    title: "ANC for study, never at the expense of awareness",
    caption: "Comfort, safe volume, ambient mode, and context before purchase.",
    alt: "Portuguese safe-use and buying guide for active-noise-cancelling headphones.",
    transcript: "The retailer lists ANC, ambient modes, Bluetooth 5.3, multipoint, app EQ, and up to 70 hours. No featured offer was available. Do not isolate during clinical duty or traffic."
  }
];

window.ANTIGRAVITY_RADAR_EN = {
  schemaVersion: "radar-en-v1",
  editionId: "2026-07-25",
  editionDate: "2026-07-25",
  generatedAt: CHECKED_AT,
  checkedAt: CHECKED_AT,
  timezone: "America/Fortaleza",
  editorialNote: "Priority combines clinical severity, relevance to intensive/internal medicine, recency, and source quality. Science, health context, and commerce are separated. Every product link is non-affiliate; prices and stock are time-stamped snapshots and results are never guaranteed.",
  clinicalDisclaimer: "Educational support only. This Radar does not diagnose, prescribe, replace bedside assessment, or supersede current guidelines, local protocols, specialist review, and patient-specific factors.",
  imageLanguageNote: "The paired educational images currently contain Portuguese text. The English transcript below each image carries the same key evidence and limitation.",
  science,
  healthAndSystems,
  productivityPurchases,
  visualPairs
};
