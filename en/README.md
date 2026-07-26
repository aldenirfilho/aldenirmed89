# Antigravity English edition

## Current scope

This first English release adds two static, dependency-free routes:

- `en/index.html`: English mission-control Home.
- `en/radar/index.html`: English Daily Radar with search, three editorial channels, date grouping, source links, evidence details, product disclosures, and Auto/Widescreen/Card image modes.

The English Radar reads its own reviewed editorial mirror from `en/radar/data/radar.en.js`. It contains the same edition structure as the Portuguese Radar on 25 July 2026:

- 10 clinical-science items;
- 6 health, systems, and geopolitical-health items;
- 3 productivity and purchase evaluations;
- 10 clinical/current-affairs visual pairs plus 3 product visual pairs.

The source dates, numbers, URLs, cautions, and price-check timestamps were preserved during translation. The first release reuses Portuguese educational images and places an English transcript directly below each image. This limitation is shown in the interface.

## Language boundaries

The English Home links to the complete Portuguese platform. Links to clinical modules, the Medical Directory, Portal Vivo, tools, libraries, and question banks explicitly state when the destination remains in Portuguese. Do not remove those labels until the destination itself has been reviewed in English.

## Theme catalogue

The platform theme specification lives at `data/theme-catalog.json`.

All 13 explicitly requested profiles are active in the English routes. The default and primary profiles are:

- `aerospace` — default dark mission-control identity;
- `aerospace-light` — daylight aerospace cockpit;
- `rustic-light` — conservative warm-paper reading mode.

The selector also includes essential dark, minimal, sepia, oceanic, clinical green, natural, forest, arcane academy, editorial hero, and modern serious. The original fantasy and comic directions deliberately avoid licensed franchise names, characters, and visual assets.

Theme choice is device-local and stored in `localStorage` under `antigravity-theme`. No account or personal information is required.

## Editing the English Radar safely

1. Update the reviewed Portuguese edition first.
2. Translate meaning rather than shortening away uncertainty.
3. Preserve every reported number, date, URL, study limitation, and `doNotInfer` statement.
4. Keep the three arrays separate: `science`, `healthAndSystems`, and `productivityPurchases`.
5. For products, keep `affiliate: false`, the price-check timestamp, availability wording, safety limits, and the option not to buy.
6. Add both `cardFile` and `wideFile` for every new visual.
7. If an image remains in Portuguese, keep the image-language notice and provide an English transcript.
8. Run `python3 -m unittest tests.test_english_and_theme_catalog -v` before publication.

## Clinical and commercial safety

This edition is educational support. It does not diagnose, prescribe, or replace bedside assessment, current guidelines, local protocols, specialist review, and patient-specific factors.

Product links are direct and non-affiliate. Price and stock are snapshots, not promises. Shipping, seller, warranty, returns, compatibility, and actual need must be checked again before purchase. No productivity, health, or ADHD-treatment result is guaranteed.
