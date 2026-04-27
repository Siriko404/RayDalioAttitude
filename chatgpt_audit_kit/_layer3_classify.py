"""
Layer-3 classification overlay.

This module is the ONLY place where classification metadata is hand-coded.
Entry verbatim text comes from _layer3_entries.json (script-extracted).

CLASSIFY: (file, entry_num) -> {cluster, bucket, search_target, notes}

Buckets:
- dalio-search-pending  : worth deep Dalio-search before close decision
- dalio-canonical-found : Dalio addresses; cite + close (no NON-DALIO needed)
- close-by-NON-DALIO    : Dalio doesn't address; needs industry-standard cite
- reclassify-limitations: methodological / proxy / range disclosure -> Limitations sub-section
- reclassify-§9         : explicit scope handoff -> §9 Integration Points
- already-closed-here   : NON-DALIO closer ALREADY CITED in §10 sources or §6
                          prose; just needs heading reclassify + point-of-use
                          marker audit (no new research)

Clusters:
- A: Numeric thresholds Dalio doesn't publish (DERIVED operationalization)
- B: Range/duration claims (Dalio's own range, no point estimate)
- C: Methodological caveats / proxy choices
- D: Data caveats / R11 source state
- E: Scope handoffs (X owned by 2.4 / 2.5 etc.)
- F: Possibly Dalio-canonical (worth deep search before classifying)

Each row reflects judgment based on (a) the verbatim entry text in
_layer3_entries.json and (b) §10 source list of the same file (citations
already present or not). Rationale lives in `notes`.
"""

# (file, entry_num) -> dict
CLASSIFY: dict[tuple[str, int], dict] = {
    # ------------------------------------------------------------- file 01
    ("01_economic_machine.md", 1): dict(
        cluster="B",
        bucket="reclassify-limitations",
        search_target="HEMW p.5 (already cited)",
        notes="Dalio published these AS ranges. Limitations entry, not open question.",
    ),
    ("01_economic_machine.md", 2): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="HEMW p.5 'shade less than 2%'; BDC trend-productivity discussion",
        notes="Closer candidate: CBO trend productivity series; FRED GDPPOT methodology. Currently no NON-DALIO closer at point of use.",
    ),
    ("01_economic_machine.md", 3): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="HEMW p.7 (already cited); BDC archetypes for 'money'",
        notes="Closer candidate: BIS total-credit / M2 historical norms. Project-author bucket edges currently unjustified.",
    ),
    ("01_economic_machine.md", 4): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="HEMW p.2 (already cited)",
        notes="Closer candidate: BIS credit-gap or NBER credit-cycle. Or reclassify-limitations as project design choice if no industry-standard tertile cut exists.",
    ),
    ("01_economic_machine.md", 5): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="Hamilton 2018 NBER WP 23429 (already cited in §10)",
        notes="Hamilton already cited as NON-DALIO support; +/-1sigma framing project-author. Reclassify-limitations with explicit 'Hamilton supports detrending; classification band project-author'.",
    ),
    ("01_economic_machine.md", 6): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — methodological choice (real GDP composition)",
        notes="Reclassify to Limitations.",
    ),
    ("01_economic_machine.md", 7): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="HEMW currency+reserves definition (already cited)",
        notes="Reclassify to Limitations (proxy doc).",
    ),
    # ------------------------------------------------------------- file 02
    ("02_short_term_debt_cycle.md", 1): dict(
        cluster="B",
        bucket="reclassify-limitations",
        search_target="HEMW p.18-19 (already cited)",
        notes="Reclassify to Limitations.",
    ),
    ("02_short_term_debt_cycle.md", 2): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="HEMW + BDC archetypes",
        notes="Closer candidate: CBO trend-productivity post-2015 series, OR formalize the entry's own 'trend + 2sigma' fallback as the published rule.",
    ),
    ("02_short_term_debt_cycle.md", 3): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="Estrella-Mishkin 1996 (already cited in §10)",
        notes="NON-DALIO closer already cited. Reclassify-limitations as 'method note: thresholds from Estrella-Mishkin, not Dalio'.",
    ),
    ("02_short_term_debt_cycle.md", 4): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="NY Fed probit + Sahm 2019 (already cited)",
        notes="Both NON-DALIO closers already cited. Reclassify-limitations as method note.",
    ),
    ("02_short_term_debt_cycle.md", 5): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="BDC + HEMW for 'recession' / 'contraction' / 'mid-cycle' definition",
        notes="Dalio uses NBER-aligned framing implicitly via US data. Verify whether BDC has explicit dating convention.",
    ),
    ("02_short_term_debt_cycle.md", 6): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="HEMW p.19 (already cited as source of the quoted caveat)",
        notes="Dalio's own caveat. Reclassify-limitations citing Dalio.",
    ),
    ("02_short_term_debt_cycle.md", 7): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="HEMW p.18 CAPUTL mention; FRED TCU methodology",
        notes="Closer candidate: 50-yr TCU median is data fact (FRED-derived), not framework — reclassify-limitations as 'project anchor at TCU 50-yr median'.",
    ),
    ("02_short_term_debt_cycle.md", 8): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — data documentation",
        notes="Move to Limitations / Sources.",
    ),
    # ------------------------------------------------------------- file 03
    ("03_long_term_debt_cycle.md", 1): dict(
        cluster="B",
        bucket="reclassify-limitations",
        search_target="HCGB-1 Ch 1 '~80 +/- 25' (already cited)",
        notes="Reclassify to Limitations.",
    ),
    ("03_long_term_debt_cycle.md", 2): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="HCGB-1 stage descriptions Ch 3",
        notes="Closer candidate: BIS Basel III credit-gap stage convention (10pp / 2pp triggers).",
    ),
    ("03_long_term_debt_cycle.md", 3): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="HCGB-1 Ch 3 + CWO MP definitions",
        notes="High likelihood Dalio addresses MP4-6 trigger conditions in HCGB-1. Search before bucketing as close-by-NON-DALIO.",
    ),
    ("03_long_term_debt_cycle.md", 4): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="BDC deleveraging archetypes ~p.25-30 (debt-reduction averages)",
        notes="50%+/-20% is Dalio's own number from BDC. Reclassify-limitations as Dalio's-stated-historical-mean.",
    ),
    ("03_long_term_debt_cycle.md", 5): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="HCGB-1 Ch 3 r-g math",
        notes="Methodological assumption. Move to Limitations.",
    ),
    ("03_long_term_debt_cycle.md", 6): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="HCGB-1 reserve-share discussion + IMF COFER methodology",
        notes="Closer candidate: IMF COFER trend-decline norms OR reclassify-limitations if no industry standard exists.",
    ),
    ("03_long_term_debt_cycle.md", 7): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="HCGB-1 % GDP / % rev / % money denominator discussion",
        notes="Document choice. Move to Limitations.",
    ),
    ("03_long_term_debt_cycle.md", 8): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — accounting choice",
        notes="Move to Limitations.",
    ),
    # ------------------------------------------------------------- file 04
    ("04_deleveragings.md", 1): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="In-Depth-Look 'balanced reflation' wording (already cited)",
        notes="Closer candidate: BIS / IMF balanced-reflation criteria; or reclassify-limitations as project boundary calibration.",
    ),
    ("04_deleveragings.md", 2): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="In-Depth-Look US/Japan/Spain pi points (already cited)",
        notes="Closer candidate: IMF/BIS price-stability norms; OR reclassify-limitations as Dalio-points-only with project bucket-edges.",
    ),
    ("04_deleveragings.md", 3): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="BDC + In-Depth-Look 'well balanced' policy mix",
        notes="Closer candidate: industry-standard balanced-budget rule OR reclassify-limitations.",
    ),
    ("04_deleveragings.md", 4): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="BDC redistribution discussion",
        notes="Closer candidate: IMF DSF transfer assumption OR reclassify-limitations as stand-in pending production calibration.",
    ),
    ("04_deleveragings.md", 5): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="BDC currency-crisis discussion",
        notes="Closer candidate: BIS currency-crisis convention OR reclassify-limitations.",
    ),
    ("04_deleveragings.md", 6): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="BDC US 2008 case",
        notes="Methodological transition treatment. Move to Limitations.",
    ),
    ("04_deleveragings.md", 7): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="BDC discusses both stock and service",
        notes="Already handed off to §5.5 BIS DSR. Reclassify to §9 Integration Points.",
    ),
    # ------------------------------------------------------------- file 05
    ("05_paradigm_shifts.md", 1): dict(
        cluster="B",
        bucket="reclassify-limitations",
        search_target="Paradigm Shifts essay (already cited)",
        notes="Reclassify to Limitations.",
    ),
    ("05_paradigm_shifts.md", 2): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="Paradigm Shifts essay tailwind discussion",
        notes="Each of the 4 thresholds needs either NON-DALIO benchmark OR reclassify-limitations as project calibration window.",
    ),
    ("05_paradigm_shifts.md", 3): dict(
        cluster="A",
        bucket="reclassify-limitations",
        search_target="Paradigm Shifts essay 'more opposite than similar'",
        notes="Spearman is textbook proxy. Reclassify-limitations.",
    ),
    ("05_paradigm_shifts.md", 4): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="Paradigm Shifts essay calendar boundaries",
        notes="Move to Limitations.",
    ),
    ("05_paradigm_shifts.md", 5): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — data availability",
        notes="Move to Limitations.",
    ),
    ("05_paradigm_shifts.md", 6): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="Multpl + IBES (already cited)",
        notes="Move to Limitations (anchor choice).",
    ),
    ("05_paradigm_shifts.md", 7): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — recency",
        notes="Move to Limitations.",
    ),
    ("05_paradigm_shifts.md", 8): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — design choice",
        notes="Move to Limitations.",
    ),
    # ------------------------------------------------------------- file 06
    ("06_changing_world_order.md", 1): dict(
        cluster="B",
        bucket="reclassify-limitations",
        search_target="CWO Ch 1 (already cited)",
        notes="Reclassify to Limitations.",
    ),
    ("06_changing_world_order.md", 2): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="CWO Ch 1 p.17 power-index weights",
        notes="Likely Dalio canonical — search published weights table before calling it a gap.",
    ),
    ("06_changing_world_order.md", 3): dict(
        cluster="A",
        bucket="reclassify-limitations",
        search_target="CWO charts PDF",
        notes="Min-max rescale is textbook normalization. Reclassify-limitations.",
    ),
    ("06_changing_world_order.md", 4): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="CWO chapter discussion of measures",
        notes="Closer candidate: WEF GCI / WIPO GII threshold conventions OR reclassify-limitations as project-author thresholds.",
    ),
    ("06_changing_world_order.md", 5): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — data anchor choice",
        notes="Move to Limitations.",
    ),
    ("06_changing_world_order.md", 6): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — R11 documentation",
        notes="Move to Limitations / R11 honesty.",
    ),
    # ------------------------------------------------------------- file 07
    ("07_inflation_currency.md", 1): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — R11 + R12 documentation",
        notes="Move to Limitations / R12 fallback. NB: file 07 is OVER 3000-w cap (3811w) — must trim BEFORE Layer-3 patches.",
    ),
    ("07_inflation_currency.md", 2): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="BDC archetypes + Paradigm Shifts real-rate discussion",
        notes="Closer candidate: BIS real-rate norms OR reclassify-limitations.",
    ),
    ("07_inflation_currency.md", 3): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="BDC archetypes",
        notes="Closer candidate: IMF currency-crisis criteria OR reclassify-limitations.",
    ),
    ("07_inflation_currency.md", 4): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="BDC vulnerability list",
        notes="Closer candidate: IMF inflation-target deviation norms OR reclassify-limitations.",
    ),
    ("07_inflation_currency.md", 5): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — frequency-mismatch proxy",
        notes="Move to Limitations.",
    ),
    ("07_inflation_currency.md", 6): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="BDC narrow-money references",
        notes="Move to Limitations (proxy doc).",
    ),
    # ------------------------------------------------------------- file 08
    ("08_template_for_investing.md", 1): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="Engineering Targeted Returns p.~3 + LinkedIn mantra (both already cited)",
        notes="Dalio's own variation across sources. Reclassify-limitations citing Dalio's range.",
    ),
    ("08_template_for_investing.md", 2): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="Engineering Targeted Returns Holy Grail math",
        notes="Dalio's own caveats in essay. Likely dalio-canonical-found; reclassify-limitations.",
    ),
    ("08_template_for_investing.md", 3): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="'Our Thoughts' 2015 p.11 (already cited)",
        notes="Move to Limitations. 252-day is industry standard window choice.",
    ),
    ("08_template_for_investing.md", 4): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="Principles 2017 ~1000-streams anecdote",
        notes="Dalio's own. Reclassify-limitations.",
    ),
    ("08_template_for_investing.md", 5): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — math simplification",
        notes="Move to Limitations.",
    ),
    ("08_template_for_investing.md", 6): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="'Our Thoughts' 2015 p.~8 (already cited)",
        notes="Already handed off to 2.5. Reclassify to §9.",
    ),
    ("08_template_for_investing.md", 7): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="Engineering p.3 alpha discussion",
        notes="Already handed off to 2.3. Reclassify to §9.",
    ),
    # ------------------------------------------------------------- file 09
    ("09_all_weather.md", 1): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="Robbins reprint (already cited); Bridgewater institutional unpublished",
        notes="Robbins says '7-10 year Treasuries' = nominal. Reclassify-limitations stating Dalio's only-public number is nominal.",
    ),
    ("09_all_weather.md", 2): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="'Our Thoughts' 2015 + All Weather Story",
        notes="Dalio's wording. Reclassify-limitations.",
    ),
    ("09_all_weather.md", 3): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="Vanguard Zilbering 2015 (already cited)",
        notes="Vanguard already cited as NON-DALIO closer for 1%/5%; 3% midpoint is project-author. Reclassify-limitations.",
    ),
    ("09_all_weather.md", 4): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="'Our Thoughts' + All Weather Story",
        notes="Closer candidate: Bridgewater own framework; if no numerical entries published, reclassify-limitations as project operationalization of qualitative directional prose.",
    ),
    ("09_all_weather.md", 5): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="'Our Thoughts' 2015 + 2022 retrospectives",
        notes="Already handed off to 2.4. Reclassify to §9.",
    ),
    ("09_all_weather.md", 6): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="Geographic Diversification 2019 (already cited)",
        notes="Already handed off as out-of-scope-by-brief. Reclassify to §9.",
    ),
    # ------------------------------------------------------------- file 10
    ("10_alpha_portable_alpha.md", 1): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="Grinold 1989 / Grinold-Kahn 2000 (already cited)",
        notes="NON-DALIO foundational reference already cited. Reclassify-limitations as 'breadth definition for macro = scope ambiguity not closed by Grinold formula'.",
    ),
    ("10_alpha_portable_alpha.md", 2): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="Engineering Targeted Returns Chart 5 + p. discussion",
        notes="Mathematical reconciliation already in §7. Reclassify-limitations as documentation of chart-rounding.",
    ),
    ("10_alpha_portable_alpha.md", 3): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="McLean & Pontiff 2016 (already cited)",
        notes="NON-DALIO closer already cited. Reclassify-limitations as 'NON-DALIO threshold from McLean-Pontiff'.",
    ),
    ("10_alpha_portable_alpha.md", 4): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="Engineering Targeted Returns p.9",
        notes="Dalio's own examples. Reclassify-limitations as Dalio's-stated-examples-not-anchors.",
    ),
    ("10_alpha_portable_alpha.md", 5): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — data availability",
        notes="Move to Limitations.",
    ),
    # ------------------------------------------------------------- file 11
    ("11_risk_parity_leverage.md", 1): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="Engineering p.11 'around 2x' (already cited); AFP 2012 / Qian 2005 (already cited)",
        notes="Dalio anchor + NON-DALIO references already in §10. Reclassify-limitations as 'project bands around Dalio anchor; AFP/Qian for context'.",
    ),
    ("11_risk_parity_leverage.md", 2): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="AFP 2012 (already cited)",
        notes="Move to Limitations.",
    ),
    ("11_risk_parity_leverage.md", 3): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="n/a — illustrative",
        notes="Closer candidate: industry-standard funding-cost convention OR reclassify-limitations as illustrative-only.",
    ),
    ("11_risk_parity_leverage.md", 4): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="n/a — handed off to 2.5",
        notes="Move to §9.",
    ),
    ("11_risk_parity_leverage.md", 5): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="'Our Thoughts' 2015 p.8 (already cited)",
        notes="Already documented as empirical comparison. Reclassify to §9 OR Limitations.",
    ),
    ("11_risk_parity_leverage.md", 6): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="Qian 2005 / AFP 2012 (already cited)",
        notes="Methodological. Move to Limitations.",
    ),
    ("11_risk_parity_leverage.md", 7): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — data availability",
        notes="Move to Limitations.",
    ),
    # ------------------------------------------------------------- file 12
    ("12_stress_testing.md", 1): dict(
        cluster="A",
        bucket="close-by-NON-DALIO",
        search_target="BDC archetypes p.14, p.32 (already cited)",
        notes="Closer candidate: Fed CCAR scenario archive / NBER recession-trough magnitudes.",
    ),
    ("12_stress_testing.md", 2): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — scope",
        notes="Move to Limitations.",
    ),
    ("12_stress_testing.md", 3): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="n/a — handed off to 2.2",
        notes="Move to §9.",
    ),
    ("12_stress_testing.md", 4): dict(
        cluster="E",
        bucket="reclassify-§9",
        search_target="n/a — handed off to 2.4",
        notes="Move to §9.",
    ),
    ("12_stress_testing.md", 5): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — fix methodology",
        notes="Move to Limitations.",
    ),
    ("12_stress_testing.md", 6): dict(
        cluster="C",
        bucket="reclassify-limitations",
        search_target="n/a — Damodaran TR series choice (already cited)",
        notes="Move to Limitations.",
    ),
    ("12_stress_testing.md", 7): dict(
        cluster="D",
        bucket="reclassify-limitations",
        search_target="n/a — R11 documentation",
        notes="Move to Limitations.",
    ),
}
