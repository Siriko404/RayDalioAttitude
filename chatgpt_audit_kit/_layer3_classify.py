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
        search_target="Hamilton 2018 NBER WP 23429 (already cited in §10) — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 3 2026-04-27): Hamilton 2018 abstract describes "
              "regression-based detrending methodology (regress variable at t+h on four "
              "most recent values as of t); does NOT prescribe a classification band "
              "(no thresholds, no ±1σ language). Project's claim 'Hamilton supports "
              "detrending; classification band project-author' is accurate.",
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
        search_target="NY Fed probit + Sahm 2019 (already cited) — Sahm VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 3 2026-04-27): Sahm 2019 (Hamilton Project p.76) "
              "verbatim: 'Automatic lump-sum stimulus payments would be made to "
              "individuals when the three-month average national unemployment rate "
              "rises by at least 0.50 percentage points relative to its low in the "
              "previous 12 months.' p.77: 'The direct stimulus payments to individuals "
              "begin after a 0.50 percentage point increase or more in the three-month "
              "moving average of the unemployment rate relative to its low in the prior "
              "12 months.' Project's 0.5pp Sahm Rule citation is accurate. NY Fed probit "
              "not separately re-verified this round; Estrella-Mishkin 1996 fetch 403'd.",
    ),
    ("02_short_term_debt_cycle.md", 5): dict(
        cluster="F",
        bucket="reclassify-limitations",
        search_target="HEMW L108-112 (template.pdf): functional recession definition",
        notes="EVIDENCE (Dalio-search 2026-04-27): HEMW lines 110-112 give Dalio's "
              "structural recession definition: 'a recession is an economic contraction "
              "that is due to a contraction in private sector debt growth arising from "
              "tight central bank policy.' Project's claim 'no dating convention' is "
              "true — Dalio defines recession FUNCTIONALLY, not by dates. NBER provides "
              "dates compatible with that definition. Reclassify with explicit "
              "'Dalio defines recession functionally; dating uses NBER for compatibility'.",
    ),
    ("02_short_term_debt_cycle.md", 6): dict(
        cluster="F",
        bucket="reclassify-limitations",
        search_target="HEMW L996 + L942 (template.pdf)",
        notes="EVIDENCE (Dalio-search 2026-04-27): HEMW L942 'typically occur in six "
              "phases — four in the expansion and two in the recession'; L996 caveat "
              "verbatim 'not all are manifest precisely as described.' Dalio's own "
              "caveat. Reclassify-limitations citing HEMW directly.",
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
        bucket="dalio-canonical-found",
        search_target="HCGB-1 L462-514 (hcgb1.txt): MP1-MP5 definitions",
        notes="EVIDENCE (Dalio-search 2026-04-27): HCGB-1 footnote L461-462 explicitly "
              "RENUMBERS the MP scheme vs BDC ('separated linked monetary systems from "
              "fiat ones, which were previously both described as being part of MP1.' "
              "L513-514: 'numbering is now different (i.e., MP2 has become MP3 and MP3 "
              "has become MP4).' L464=MP1 Linked, L489=MP4 Coordinated Fiscal/Monetary, "
              "L495=MP5 Big Deleveraging). RESOLVED 2026-04-27 (commit 11ae972 self-"
              "correction): re-read of file 03 §5.6 confirms project ALREADY uses HCGB-1 "
              "current scheme (MP1 Linked/Hard, MP2 Fiat-IR-Driven, MP3 Fiat-Debt-"
              "Monetization, MP4 Coordinated Fiscal/Monetary, MP5 Big Deleveraging, "
              "MP6 Return to Hard Money). Earlier 'stale BDC numbering' flag was a "
              "misread. No Layer-2 patch needed. §10 entry 3 closes via Dalio § 5.6 "
              "verbatim citing HCGB-1 Ch 1 phases-of-monetary-policy section.",
    ),
    ("03_long_term_debt_cycle.md", 4): dict(
        cluster="F",
        bucket="dalio-search-pending",
        search_target="BDC deleveraging archetypes (debt-reduction averages); 119 hits in BDC need targeted re-search",
        notes="EVIDENCE (Dalio-search 2026-04-27): grep on '50%' / '35 cases' returned "
              "119 hits in BDC — too noisy for keyword approach. Need deeper targeted "
              "read of BDC archetypes section. Provisional bucket reclassify-limitations "
              "as Dalio's-stated-historical-mean pending precise BDC quote retrieval.",
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
        bucket="reclassify-limitations",
        search_target="CWO Ch 1 LinkedIn — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 2 2026-04-27): Dalio CWO Ch 1 LinkedIn explicitly "
              "states 'roughly equal average of 18 measures of strength' AND 'while one "
              "could reconfigure them to produce marginally different readings, they "
              "are broadly indicative in a by-and-large way' — Dalio explicitly does "
              "NOT publish numeric weights. Project's intuition that weighting is "
              "non-formulaic is correct. Reclassify-limitations citing CWO Ch 1 quote "
              "directly; document weighting choice as Dalio-flagged 'broadly indicative'.",
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
        bucket="reclassify-limitations",
        search_target="Engineering 2011 L393 (engineering.txt); '15 to 20' is from Principles 2017 (commercial)",
        notes="EVIDENCE (Dalio-search 2026-04-27): Engineering 2011 only says 'well-"
              "diversified portfolio of uncorrelated return streams' (L393) — does NOT "
              "specify 15-20 there. The 15-20 / 'fifteen to twenty' phrasing is from "
              "Principles 2017 (commercial book, R9 fair-use already in §10 sources). "
              "'Fifteen good' is LinkedIn mantra. The cross-source variation is real "
              "and documented; reclassify-limitations citing the three Dalio sources.",
    ),
    ("08_template_for_investing.md", 2): dict(
        cluster="F",
        bucket="close-by-NON-DALIO",
        search_target="Engineering 2011 L425-429 + Chart 5 (engineering.txt)",
        notes="EVIDENCE (Dalio-search 2026-04-27): Engineering 2011 L425-429 shows "
              "Chart 5 with 'Sources Of Value Added: 6/77' and 'Average Correlation: "
              "0.25/0.04' for two portfolios. Dalio's 'Holy Grail' framing implies the "
              "low-correlation portfolio achieves better IR. The project's caveats "
              "(N>=20-25 + rho~=0 conditions) are NOT explicit in Engineering 2011 — "
              "they're project-author derivations from the math. Either close-by-NON-"
              "DALIO (cite textbook Markowitz / Grinold for the explicit rho-N "
              "tradeoff) OR reclassify-limitations as honest derivation from chart.",
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
        bucket="reclassify-limitations",
        search_target="Robbins reprint (already cited) — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 2 2026-04-27): Robbins reprint of Dalio's All "
              "Seasons recipe specifies '15% intermediate term (seven- to ten-year "
              "Treasuries)' and '40% long-term bonds (20- to 25-year Treasuries)'. "
              "NO mention of TIPS or inflation-linked bonds. Project's reading is "
              "correct: Dalio's only-public number specifies nominal Treasuries. "
              "Reclassify-limitations citing Robbins reprint directly.",
    ),
    ("09_all_weather.md", 2): dict(
        cluster="F",
        bucket="reclassify-limitations",
        search_target="'Our Thoughts' 2015 p.6-7 — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 2 2026-04-27): Dalio/Prince/Jensen 2015 p.6: "
              "'we put 25% of money into risk adjusted assets that do well when growth "
              "is faster than expected, 25% into those that do well when growth is "
              "slower than expected, 25% into those that do well when inflation is "
              "higher than expected, and 25% into those that do well when inflation is "
              "lower than expected.' p.7 Chart: Growth Rising 25% Risk / Inflation "
              "Rising 25% Risk / Growth Falling 25% Risk / Inflation Falling 25% Risk. "
              "Project's 'equal risk on each scenario' language is correct paraphrase. "
              "Reclassify-limitations citing Our Thoughts 2015 p.6-7 verbatim.",
    ),
    ("09_all_weather.md", 3): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="Vanguard Zilbering 2015 (already cited) — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 3 2026-04-27): Vanguard 2015 paper p.7-9 "
              "explicitly publishes 1%/5%/10% rebalancing thresholds in three places: "
              "Strategy #2 'threshold-only' (p.7), Strategy #3 'time-and-threshold' "
              "(p.8 + Figure 6 p.9), and Figure 7 summary table (p.10). Conclusion "
              "(p.12): 'reasonable allocation thresholds (variations of 5% or so)'. "
              "Project's 09-#3 entry citing Zilbering for 1%/5%/10% is accurate. The "
              "3% midpoint is correctly flagged as project-author.",
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
        search_target="Grinold 1989 via CFI summary — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 3 2026-04-27): Grinold's Fundamental Law of "
              "Active Management formula confirmed via CFI summary page: IR = IC × √Breadth "
              "(equivalent to project's IR = IC × √N). Project's citation accurate; the "
              "remaining open question is what 'independent bet' means for a global "
              "macro manager (Dalio doesn't resolve), which is genuine scope ambiguity "
              "not closed by Grinold's formula. Reclassify-limitations.",
    ),
    ("10_alpha_portable_alpha.md", 2): dict(
        cluster="F",
        bucket="reclassify-limitations",
        search_target="Engineering 2011 L425-442 (engineering.txt)",
        notes="EVIDENCE (Dalio-search 2026-04-27): Engineering 2011 L427 = chart values "
              "'Average Correlation: 0.25 / 0.04'; L418-420 = 'information ratio of "
              "each slice ... is 0.35 ... approximately 2.5 times better'; L442 = "
              "general claim 'information ratios can increase by factors of two to "
              "four times'. Dalio gives chart-only values, no sample window or "
              "ex-ante/ex-post specification. Project's reconciliation is honest "
              "documentation of chart-rounding. Reclassify-limitations citing "
              "Engineering Chart 5 directly.",
    ),
    ("10_alpha_portable_alpha.md", 3): dict(
        cluster="A",
        bucket="already-closed-here",
        search_target="McLean & Pontiff 2016 (already cited) — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 3 2026-04-27): McLean-Pontiff 2012 working paper "
              "(2016 JF) Abstract: 'The average post-publication decay ... is about 35%, "
              "and statistically different from both 0% and 100%.' p.4: 'We estimate "
              "the average anomaly's post-publication return decays by about 35%. Thus, "
              "an in-sample alpha of 5% is expected to decay to 3.25% post-publication.' "
              "Project's 10-#3 entry citing McLean-Pontiff for 35% threshold is "
              "accurate.",
    ),
    ("10_alpha_portable_alpha.md", 4): dict(
        cluster="F",
        bucket="reclassify-limitations",
        search_target="Engineering 2011 L466-467 (engineering.txt)",
        notes="EVIDENCE (Dalio-search 2026-04-27): Engineering 2011 L466-467 verbatim "
              "'one client might choose a 3% tracking error while another might choose "
              "6%.' Project's reading correct: Dalio gives examples, not anchors. "
              "Reclassify-limitations citing Engineering L466-467.",
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
        search_target="Engineering 'around 2x' (Dalio); AFP 2012 (already cited) — VERIFIED 2026-04-27",
        notes="VERIFIED (Layer-3 Check 3 2026-04-27): AFP 2012 (Asness/Frazzini/Pedersen) "
              "publishes risk-parity construction methodology — inverse-vol weights with "
              "leverage k_t set to match benchmark vol. Does NOT anchor a specific 2x "
              "leverage figure (the 'around 2x' anchor comes from Dalio Engineering 2011 "
              "p.11). AFP Table B1 shows levered RP samples. Project's 11-#1 framing is "
              "accurate: Dalio gives 'around 2x' anchor, AFP/Qian provide methodology "
              "context, project's 1.0x-3.0x bands are DERIVED. Reclassify-limitations.",
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
