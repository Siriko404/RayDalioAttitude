# Layer-3 §10 Open-Questions Triage Report

**Generated:** by `chatgpt_audit_kit/_layer3_build_triage.py` from
verbatim entries in `_layer3_entries.json` + classification overlay in
`_layer3_classify.py`. Re-run script after edits to either input.

**Scope:** All 12 research files, §10 sub-section "Open questions and ambiguities".

**Total entries (script-counted):** 82

**Authorization:** Phase 0 (this report) authorized 2026-04-27 by user "go".
Phases 1-5 NOT YET AUTHORIZED. User reviews this report before any ChatGPT
spend, file edits to `research/`, or commits other than this build artifact.

## 1. Mandate

User intent (verbatim 2026-04-27): *"WORKABLE FUCKING FRAMEWORK based on
dalios published work, and logically his work DOESNT HAVE GAPS! but if they
do, we try to close them by the best industry standards and cite EVERYTHING
EXACTLY."*

User refinement (2026-04-27): *"MAKE 100% SURE that the 'gaps' arent really
lazy work … LOGICALLY someone like dalio shouldnt have any holes in his
frameworks. so we must search specifically for dalios own work to see if
these has addressed before in his published work, if not, ONLY FROM THE BEST
AND CREDIBLE SOURCES we must apply the best compatible industry standards."*

End-state: empty `### Open questions and ambiguities` sub-section across all
12 files. Every gap closed with Dalio cite OR best-credible NON-DALIO cite OR
reclassified to a sub-section that is NOT "Open questions" (Limitations or
Integration Points).

## 2. Source inventory (Dalio-search corpus)

### Available locally (text-extracted, verified file-size > 0)
- `dalio2017.txt` (460 KB) — compiled "How the Economic Machine Works +
  Leveragings and Deleveragings" Bridgewater 2008/2012/2017.
- `dalio_scratch/bdc.txt` + `bdc.pdf` — *Principles for Navigating Big Debt
  Crises* (BDC) 2018, full 480-page free PDF.
- `dalio_scratch/engineering.txt` — "Engineering Targeted Returns and Risks" 2011.
- `dalio_scratch/paradigm.txt` — "Paradigm Shifts" 2019 (LinkedIn).
- `dalio_scratch/economic_machine.pdf` + `template.pdf` — HEMW source PDFs.

### Need fetch (Layer-3 step 1 per file when triggered)
- *Principles for Dealing with the Changing World Order* (CWO) 2021 — chapters
  via LinkedIn series + economicprinciples.org PDFs.
- *How Countries Go Broke Part 1* (HCGB-1) 2024-2025 — PDF at
  economicprinciples.org/downloads/.
- "Our Thoughts About Risk Parity and All Weather" 2015 — Bridgewater PDF (mirror).
- "Geographic Diversification Can Be a Lifesaver" 2019 — Bridgewater PDF (mirror).
- "The All Weather Story" — Bridgewater landing page.
- LinkedIn essays beyond Paradigm Shifts.

### Best-credible NON-DALIO corpus (closer of last resort)
BIS (Basel III credit-gap, DSR methodology, total-credit dataset doc); IMF
(WEO, COFER, DSF technical notes); Federal Reserve / NY Fed (Estrella-Mishkin
1996, capital-markets FAQ); BEA / FRED methodology pages; CBO (trend-
productivity, output-gap, primary-balance methodology); NBER (cycle dating,
WPs); Hamilton Project / Brookings (Sahm 2019); Damodaran NYU Stern (historical
returns dataset doc); Vanguard (rebalancing thresholds); McLean & Pontiff 2016
(alpha decay); Fama-French Data Library.

## 3. Classification clusters & buckets

### 3.1 Clusters (structural)

| ID | Definition |
|----|------------|
| **A** | Numeric thresholds Dalio doesn't publish (DERIVED operationalization) |
| **B** | Range/duration claims (Dalio's own range, no point estimate) |
| **C** | Methodological caveats / proxy choices |
| **D** | Data caveats / R11 source state |
| **E** | Scope handoffs (X owned by 2.4 / 2.5 etc.) |
| **F** | Possibly Dalio-canonical (worth deep search before classifying) |

### 3.2 Buckets (preliminary disposition)

| Bucket | Treatment |
|--------|-----------|
| `dalio-search-pending` | Worth deep Dalio-search before close decision (Layer-3 step 1). |
| `dalio-canonical-found` | Dalio addresses; cite + close (no NON-DALIO needed). |
| `close-by-NON-DALIO` | Dalio doesn't address; needs industry-standard cite. |
| `already-closed-here` | NON-DALIO closer ALREADY CITED in §10 sources or §6 prose; needs heading reclassify + point-of-use marker audit only. |
| `reclassify-limitations` | Methodological / proxy / range disclosure -> 'Limitations / design choices' sub-section. |
| `reclassify-§9` | Explicit scope handoff -> §9 Integration Points (already exists). |

## 4. Per-file triage

Each file gets two blocks:
1. **Verbatim entries** — script-extracted from `research/{file}` §10
   sub-section. NOT paraphrased.
2. **Classification table** — cluster, bucket, Dalio-search target, notes.

### 01_economic_machine.md — Economic Machine

*Sub-section spans `research/01_economic_machine.md` lines 301-309; 7 entries.*

**Verbatim entries:**

> 1. **Cycle ranges, not thresholds.** "5–8 years" (short) and "50–75 years" (long) are descriptive ranges from p. 5; Dalio publishes no numeric test for *which* cycle you are in (→ 1.2 / 1.3).

> 2. **"A shade less than 2%"** (p. 5) is a historical fit, not a forward-looking threshold. The 1–3% p.a. flag band around Dalio's ~2% anchor is DERIVED (brackets typical decade realizations 0.2%–4.1% per Chart 1).

> 3. **"Roughly 15 times"** debt-to-money (p. 7) is a 2012 snapshot using currency + reserves as money. Dalio does not specify the aggregate or a danger threshold; the `LOW / ELEVATED / HIGH` bucket edges are author-stipulated.

> 4. **`credit_mix_regime` tertile cuts (0.66 / 0.33)** are DERIVED. Dalio supplies only the qualitative claim (p. 2) that Total $ changes drive the cycle more than Total Q; the cuts are a minimum-information split of [0,1].

> 5. **Output-gap σ-band is not Dalio.** The ±1σ classification is DERIVED (operational); Hamilton 2018 supports regression-based detrending but does not itself prescribe a classification band (see §6).

> 6. **Total Q at the economy level is an approximation.** Real GDP as aggregate Q treats composition changes as price changes in P; the identity applies more cleanly to single markets.

> 7. **Dalio's "money" ≠ M2.** He uses currency + reserves; M2 is the practical public proxy. Worked example (step 6) reports both.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | B | `reclassify-limitations` | HEMW p.5 (already cited) | Dalio published these AS ranges. Limitations entry, not open question. |
| 2 | A | `close-by-NON-DALIO` | HEMW p.5 'shade less than 2%'; BDC trend-productivity discussion | Closer candidate: CBO trend productivity series; FRED GDPPOT methodology. Currently no NON-DALIO closer at point of use. |
| 3 | A | `close-by-NON-DALIO` | HEMW p.7 (already cited); BDC archetypes for 'money' | Closer candidate: BIS total-credit / M2 historical norms. Project-author bucket edges currently unjustified. |
| 4 | A | `close-by-NON-DALIO` | HEMW p.2 (already cited) | Closer candidate: BIS credit-gap or NBER credit-cycle. Or reclassify-limitations as project design choice if no industry-standard tertile cut exists. |
| 5 | A | `already-closed-here` | Hamilton 2018 NBER WP 23429 (already cited in §10) | Hamilton already cited as NON-DALIO support; +/-1sigma framing project-author. Reclassify-limitations with explicit 'Hamilton supports detrending; classification band project-author'. |
| 6 | C | `reclassify-limitations` | n/a — methodological choice (real GDP composition) | Reclassify to Limitations. |
| 7 | C | `reclassify-limitations` | HEMW currency+reserves definition (already cited) | Reclassify to Limitations (proxy doc). |

### 02_short_term_debt_cycle.md — Short-Term Debt Cycle

*Sub-section spans `research/02_short_term_debt_cycle.md` lines 272-281; 8 entries.*

**Verbatim entries:**

> 1. **Phase durations are ranges.** Early 5–6 qtrs, mid 3–4 qtrs, late from ~2½ years (p. 18); expansions from deep recessions "bound to last longer" (p. 19). Classifier treats as ranges, not forecasts.

> 2. **4% early-cycle anchor is a 20th-century artifact.** Trend productivity has fallen (→ 1.1). Stipulated fallback: use `> trend + 2σ` as the relative anchor post-2015. Flagged per R5.

> 3. **Yield-curve thresholds are not Dalio.** p. 18 says "flattening or inverting" qualitatively; `<0` and `<100bp` cuts come from Estrella-Mishkin + post-1982 median. Marked NON-DALIO (§ 5.2) / DERIVED (§ 6).

> 4. **No Dalio P(recession) model.** NY Fed probit + Sahm are external closers (Dalio: unemployment / GDP gap qualitatively, p. 18).

> 5. **MST grounding is NBER, not Dalio.** "2½ years" has no dating convention; ECRI / OECD would differ.

> 6. **Six-phase sequence is not always observed.** Dalio (p. 19): "not all are manifest precisely as described." `TRANSITIONAL` catches failed-all-flags.

> 7. **CAPUTL 78% is median, not Dalio.** Dalio names CAPUTL qualitatively (p. 18); 78% = 50-yr TCU median. DERIVED (§ 5.1).

> 8. **NY Fed PDF vs XLS.** Chart is `Prob_Rec.pdf`; raw data is `allmonth.xls` (§ 4).

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | B | `reclassify-limitations` | HEMW p.18-19 (already cited) | Reclassify to Limitations. |
| 2 | A | `close-by-NON-DALIO` | HEMW + BDC archetypes | Closer candidate: CBO trend-productivity post-2015 series, OR formalize the entry's own 'trend + 2sigma' fallback as the published rule. |
| 3 | A | `already-closed-here` | Estrella-Mishkin 1996 (already cited in §10) | NON-DALIO closer already cited. Reclassify-limitations as 'method note: thresholds from Estrella-Mishkin, not Dalio'. |
| 4 | A | `already-closed-here` | NY Fed probit + Sahm 2019 (already cited) | Both NON-DALIO closers already cited. Reclassify-limitations as method note. |
| 5 | F | `dalio-search-pending` | BDC + HEMW for 'recession' / 'contraction' / 'mid-cycle' definition | Dalio uses NBER-aligned framing implicitly via US data. Verify whether BDC has explicit dating convention. |
| 6 | F | `dalio-search-pending` | HEMW p.19 (already cited as source of the quoted caveat) | Dalio's own caveat. Reclassify-limitations citing Dalio. |
| 7 | A | `close-by-NON-DALIO` | HEMW p.18 CAPUTL mention; FRED TCU methodology | Closer candidate: 50-yr TCU median is data fact (FRED-derived), not framework — reclassify-limitations as 'project anchor at TCU 50-yr median'. |
| 8 | D | `reclassify-limitations` | n/a — data documentation | Move to Limitations / Sources. |

### 03_long_term_debt_cycle.md — Long-Term Debt Cycle

*Sub-section spans `research/03_long_term_debt_cycle.md` lines 275-284; 8 entries.*

**Verbatim entries:**

> 1. **Cycle duration is a range** — "~80 ±25 years" (HCGB-1 Ch 1); year-count alone never signals late-stage.

> 2. **No Dalio stage edges.** Point anchors only (1944=7x; today=37x; JPN=1376%). All § 6 edges DERIVED.

> 3. **MP phases: dates, no numeric transitions.** MP1=1944–71, MP2=1971–2008, MP3=2008–20; MP4–MP6 no trigger.

> 4. **"50% ±20% reduction"** — historical mean across 35 cases, not forward target.

> 5. **"r − g = 2% → +50%/20yr"** — assumes zero primary deficit; lower bound. Use § 5.3.

> 6. **COFER threshold "10 pp / 10 yr" is DERIVED**, not Dalio.

> 7. **Three denominators:** % GDP (FRED feeds), % revenue (classifier), % money/gold (anchor). `Rev_GDP`≈0.17 today but 14–20% historically; pipe `FYFRGDA188S`.

> 8. **Primary vs headline.** `FYFSGDA188S` is headline; primary = `|FYFSGDA188S|−FYOIGDA188S`. § 7's 15% is CBO decade average.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | B | `reclassify-limitations` | HCGB-1 Ch 1 '~80 +/- 25' (already cited) | Reclassify to Limitations. |
| 2 | A | `close-by-NON-DALIO` | HCGB-1 stage descriptions Ch 3 | Closer candidate: BIS Basel III credit-gap stage convention (10pp / 2pp triggers). |
| 3 | F | `dalio-search-pending` | HCGB-1 Ch 3 + CWO MP definitions | High likelihood Dalio addresses MP4-6 trigger conditions in HCGB-1. Search before bucketing as close-by-NON-DALIO. |
| 4 | F | `dalio-search-pending` | BDC deleveraging archetypes ~p.25-30 (debt-reduction averages) | 50%+/-20% is Dalio's own number from BDC. Reclassify-limitations as Dalio's-stated-historical-mean. |
| 5 | C | `reclassify-limitations` | HCGB-1 Ch 3 r-g math | Methodological assumption. Move to Limitations. |
| 6 | A | `close-by-NON-DALIO` | HCGB-1 reserve-share discussion + IMF COFER methodology | Closer candidate: IMF COFER trend-decline norms OR reclassify-limitations if no industry standard exists. |
| 7 | D | `reclassify-limitations` | HCGB-1 % GDP / % rev / % money denominator discussion | Document choice. Move to Limitations. |
| 8 | D | `reclassify-limitations` | n/a — accounting choice | Move to Limitations. |

### 04_deleveragings.md — Deleveragings

*Sub-section spans `research/04_deleveragings.md` lines 294-302; 7 entries.*

**Verbatim entries:**

> 1. **"Marginally above" is not numeric.** $G \in [0, +3\text{pp}]$ DERIVED (§6); US 1933–37 (+6.3pp) sits above. Widening to +6pp captures it but risks runaway reflations.

> 2. **π bucket edges 0.5% / 4% are DERIVED.** Dalio cites points (US 1933–37 ≈ 2.0%, US 2009+ ≈ 3.3%, Japan ≈ 0.8%) without publishing thresholds.

> 3. **Lever-mix balance target undefined.** Dalio says "well balanced" without target weights; 0.25/0.75 flags are DERIVED.

> 4. **Redistribution lever under-specified.** Dalio: transfers "rarely occur in amounts that contribute meaningfully." `k = 0.1` is a stand-in; sensitivity-test before production.

> 5. **FX_Gold < −20% p.a. edge** matches Dalio's Spain point only; no general numeric threshold.

> 6. **Regime boundary fuzziness.** US 2008–09 pre-QE was ugly-deflationary; post-QE became beautiful. `TRANSITIONAL` tag catches in-between quarters; not in Dalio's three-category taxonomy.

> 7. **Debt-service vs debt-stock ambiguity.** Dalio alternates. BIS DSR (§5.5) is the Fisher-complement; debt/GDP alone mis-times Japan (DSR fell via rate cuts as stock rose).

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | A | `close-by-NON-DALIO` | In-Depth-Look 'balanced reflation' wording (already cited) | Closer candidate: BIS / IMF balanced-reflation criteria; or reclassify-limitations as project boundary calibration. |
| 2 | A | `close-by-NON-DALIO` | In-Depth-Look US/Japan/Spain pi points (already cited) | Closer candidate: IMF/BIS price-stability norms; OR reclassify-limitations as Dalio-points-only with project bucket-edges. |
| 3 | A | `close-by-NON-DALIO` | BDC + In-Depth-Look 'well balanced' policy mix | Closer candidate: industry-standard balanced-budget rule OR reclassify-limitations. |
| 4 | A | `close-by-NON-DALIO` | BDC redistribution discussion | Closer candidate: IMF DSF transfer assumption OR reclassify-limitations as stand-in pending production calibration. |
| 5 | A | `close-by-NON-DALIO` | BDC currency-crisis discussion | Closer candidate: BIS currency-crisis convention OR reclassify-limitations. |
| 6 | C | `reclassify-limitations` | BDC US 2008 case | Methodological transition treatment. Move to Limitations. |
| 7 | E | `reclassify-§9` | BDC discusses both stock and service | Already handed off to §5.5 BIS DSR. Reclassify to §9 Integration Points. |

### 05_paradigm_shifts.md — Paradigm Shifts

*Sub-section spans `research/05_paradigm_shifts.md` lines 269-278; 8 entries.*

**Verbatim entries:**

> 1. **"About 10 years" is an observation, not a threshold.** No Dalio numeric test for paradigm-end; all PA edges are DERIVED terciles.

> 2. **Tailwind triggers are qualitative in Dalio.** The four thresholds (real-rate 0.50%, FedFunds 1.00%, buyback 2.5%, profit-share μ+σ, tax-rate post-1986 low) are calibrated to 2018–19; different calibrations shift late-paradigm start dates.

> 3. **"More opposite than similar" is qualitative.** Spearman ρ is a DERIVED proxy; no Dalio numeric cutoff exists.

> 4. **Paradigm ≠ calendar decade.** 1970s inflation arguably 1965–82; 2000s paradigm arguably ended 2008. Calendar bucketing follows the essay but introduces boundary noise (per R5).

> 5. **Commodity proxy is PPI, not total-return.** FRED publishes no canonical GSCI TR series; `PPIACO` is the best freely-accessible proxy. Cross-check via S&P DJI GSCI page; deviation >1% downgrades commodity-rank reliability.

> 6. **Long-run EPS-growth anchor 6.4% nominal.** Midpoint of Multpl nominal-growth slices (since-1980 ≈ 6.1%, since-1960 ≈ 7.0%); unit-consistent with IBES nominal 12-mo. Alt anchors (real EPS ~2%) bias the recency sigmoid.

> 7. **2020s observation is partial.** Confirming the 2020s rotation requires more data; live operation treats 2020+ with low confidence.

> 8. **Equal 1/3 weighting is stipulated.** No empirical optimisation attempted.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | B | `reclassify-limitations` | Paradigm Shifts essay (already cited) | Reclassify to Limitations. |
| 2 | A | `close-by-NON-DALIO` | Paradigm Shifts essay tailwind discussion | Each of the 4 thresholds needs either NON-DALIO benchmark OR reclassify-limitations as project calibration window. |
| 3 | A | `reclassify-limitations` | Paradigm Shifts essay 'more opposite than similar' | Spearman is textbook proxy. Reclassify-limitations. |
| 4 | C | `reclassify-limitations` | Paradigm Shifts essay calendar boundaries | Move to Limitations. |
| 5 | C | `reclassify-limitations` | n/a — data availability | Move to Limitations. |
| 6 | C | `reclassify-limitations` | Multpl + IBES (already cited) | Move to Limitations (anchor choice). |
| 7 | C | `reclassify-limitations` | n/a — recency | Move to Limitations. |
| 8 | C | `reclassify-limitations` | n/a — design choice | Move to Limitations. |

### 06_changing_world_order.md — Changing World Order

*Sub-section spans `research/06_changing_world_order.md` lines 283-290; 6 entries.*

**Verbatim entries:**

> 1. **Cycle length ambiguous.** "250 years, give or take 150 years" (Ch 1, p. 6) — the 100–400 yr range is too wide for a standalone timer; CPI-level + trajectory is the operational diagnostic.

> 2. **"Roughly equal average" weights.** Ch 1, p. 17 does not publish exact weights. Equal weights here; any tilt is DERIVED.

> 3. **Min-max rescale not published.** § 5.2 anchors (max +1.9, min −1.5) reproduce Dalio's USA/CHN values to ≤ 0.04 error. May drift on historical panels (1945 USA, 1600 NLD) reaching higher z̄.

> 4. **HegemonyRisk thresholds are DERIVED.** "2–3 measures negative," "−1 to −10 pp reserve-delta," and the −1 pp lower bound are stipulated; Ch 1 LinkedIn + Ch 2 p. 40 anchor the narrative only.

> 5. **COFER anchor year = 2012.** `resDelta10` uses Q4-2012 (61.50%) → Q4-2022 (58.52%) = −2.98 pp. The broader 2000-baseline (71.14% → 58.52% = −12.6 pp) is context only — NOT used in the classifier.

> 6. **API issues (R11 findings).** BIS EER API returns HTTP 500; fallback: `https://data.bis.org/bulkdownload`. COFER DBnomics series corrected from `Q.W00.RAXGFX_USD_USD` (404) to `A.W00.RAXGFXARUSDRT_PT` (200 OK). WEF GCI 2019 main PDF URL returns wrong document; use exec summary at `https://www3.weforum.org/docs/WEF_GCR_2019_Executive_Summary.pdf`. SIPRI `milex.sipri.org` SSL error; replaced with `https://www.sipri.org/databases/milex`.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | B | `reclassify-limitations` | CWO Ch 1 (already cited) | Reclassify to Limitations. |
| 2 | F | `dalio-search-pending` | CWO Ch 1 p.17 power-index weights | Likely Dalio canonical — search published weights table before calling it a gap. |
| 3 | A | `reclassify-limitations` | CWO charts PDF | Min-max rescale is textbook normalization. Reclassify-limitations. |
| 4 | A | `close-by-NON-DALIO` | CWO chapter discussion of measures | Closer candidate: WEF GCI / WIPO GII threshold conventions OR reclassify-limitations as project-author thresholds. |
| 5 | C | `reclassify-limitations` | n/a — data anchor choice | Move to Limitations. |
| 6 | D | `reclassify-limitations` | n/a — R11 documentation | Move to Limitations / R11 honesty. |

### 07_inflation_currency.md — Inflation / Currency

*Sub-section spans `research/07_inflation_currency.md` lines 274-281; 6 entries.*

**Verbatim entries:**

> 1. BDC PDF not retrievable via WebFetch in-session (canonical URL 404; economicprinciples.org email-gated; librairi.com unauthorized mirror exceeds 10MB; Wayback Machine blocked). Per R12 fallback: section-heading attribution only; no printed-footer page numbers.

> 2. Real-rate bucket edges are DERIVED — Dalio says "significantly less than inflation rates" without numeric cuts.

> 3. `DebaseFlag` −7%/+15% pair is a calibrated working filter, not a Dalio number.

> 4. Non-reserve INFLATIONARY threshold 3% is DERIVED from Dalio's "more vulnerable" directional framing; no rate cutoff in BDC vulnerability list.

> 5. `ngdp_yoy < 2 × π^hdln` is a monthly-CPI proxy for weak real growth; real-GDP cut preferred but introduces calendar-frequency mismatch.

> 6. `μ` uses M2; Dalio's archetype references narrow-money M0 — proxy is directionally correct but not numerically equivalent.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | D | `reclassify-limitations` | n/a — R11 + R12 documentation | Move to Limitations / R12 fallback. NB: file 07 is OVER 3000-w cap (3811w) — must trim BEFORE Layer-3 patches. |
| 2 | A | `close-by-NON-DALIO` | BDC archetypes + Paradigm Shifts real-rate discussion | Closer candidate: BIS real-rate norms OR reclassify-limitations. |
| 3 | A | `close-by-NON-DALIO` | BDC archetypes | Closer candidate: IMF currency-crisis criteria OR reclassify-limitations. |
| 4 | A | `close-by-NON-DALIO` | BDC vulnerability list | Closer candidate: IMF inflation-target deviation norms OR reclassify-limitations. |
| 5 | C | `reclassify-limitations` | n/a — frequency-mismatch proxy | Move to Limitations. |
| 6 | C | `reclassify-limitations` | BDC narrow-money references | Move to Limitations (proxy doc). |

### 08_template_for_investing.md — Template for Investing

*Sub-section spans `research/08_template_for_investing.md` lines 279-287; 7 entries.*

**Verbatim entries:**

> 1. **Stream-count range.** Dalio says "fifteen to twenty" (*Principles* 2017); "fifteen good" (LinkedIn mantra); "10 to 15" (short-form video). Registry commits 15-20; § 6 uses `N_eff ≥ 15`. `N_eff ≥ 20` is defensible (80%-reduction within 2 pp).

> 2. **"80%" caveats.** Match only at `ρ≈0` and `N≥20–25`. Cross-asset panels typically sit at `ρ_bar ≈ 0.15–0.30`, ceiling 50–69%. § 6's `HolyGrailRegime` uses `N_eff` (ρ-penalised) to avoid overstatement.

> 3. **Rolling window stipulated.** 252-day is industry standard. Dalio ("Our Thoughts…" p. 11) notes correlations "aren't stable"; the rolling-ρ gauge is a diagnostic, not a weighting rule.

> 4. **Stream granularity.** Dalio runs ~1000 streams (Principles 2017 anecdote). Math is scale-invariant; what counts as a stream is PM policy.

> 5. **Equal-vol / equal-weight.** § 5.3 assumes `σ_i=σ`, `w_i=1/N`. Real portfolios need `σ_p²=w'Σw`; the proxy is adequate for regime diagnosis, not for leverage sizing (2.4).

> 6. **Crisis correlation.** `ρ_bar` unstable in crises; 2.5 handles the tail.

> 7. **Alpha IR precondition.** Holy Grail presupposes positive expected IR per stream. Dalio p. 3 notes alpha risk-adjusted returns "slightly negative on average"; 15 bad-IR streams are not Holy-Grail. IR filtering → 2.3.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | F | `dalio-search-pending` | Engineering Targeted Returns p.~3 + LinkedIn mantra (both already cited) | Dalio's own variation across sources. Reclassify-limitations citing Dalio's range. |
| 2 | F | `dalio-search-pending` | Engineering Targeted Returns Holy Grail math | Dalio's own caveats in essay. Likely dalio-canonical-found; reclassify-limitations. |
| 3 | C | `reclassify-limitations` | 'Our Thoughts' 2015 p.11 (already cited) | Move to Limitations. 252-day is industry standard window choice. |
| 4 | F | `dalio-search-pending` | Principles 2017 ~1000-streams anecdote | Dalio's own. Reclassify-limitations. |
| 5 | C | `reclassify-limitations` | n/a — math simplification | Move to Limitations. |
| 6 | E | `reclassify-§9` | 'Our Thoughts' 2015 p.~8 (already cited) | Already handed off to 2.5. Reclassify to §9. |
| 7 | E | `reclassify-§9` | Engineering p.3 alpha discussion | Already handed off to 2.3. Reclassify to §9. |

### 09_all_weather.md — All Weather

*Sub-section spans `research/09_all_weather.md` lines 270-277; 6 entries.*

**Verbatim entries:**

> 1. **15% intermediate bonds — nominal or inflation-linked?** The only public Dalio canonical weights (via Robbins, 2014) specify "seven- to ten-year Treasuries" — nominal intermediate Treasuries, not TIPS. Bridgewater's institutional All-Weather does use inflation-linked bonds, but production weights are not public. This report defaults to nominal intermediate Treasuries per the only public Dalio-sourced number.

> 2. **"Equal risk" is not literal 25%-per-box.** Dalio's phrase is "equal risk on each scenario." Because the § 5 $B$ matrix has overlap, the four $\mathrm{RC}^{env}$ values are non-disjoint (§ 7 Step-4 and § 8c); "equal risk" is a directional target, not a partition arithmetic claim.

> 3. **Rebalancing thresholds.** Vanguard (Zilbering et al. 2015) analyzes 1% / 5% / 10% thresholds. The 5% RED cutoff tracks Vanguard; the 3% GREEN/AMBER cutoff is author-derived, sitting between Vanguard's 1% and 5% ticks — marked DERIVED at point of use in § 6.

> 4. **Environmental bias matrix in § 5.** The +1/0/−1 entries paraphrase Dalio's directional prose; the specific entries (zeros, overlaps) are author operationalizations marked DERIVED at point of use.

> 5. **Correlation regime risk.** The canonical weights were calibrated in an era of negative stock-bond correlation. The 2022 co-crash violated that assumption; Step-4 shows how sensitive the split is to covariance. Mitigation (vol-targeted leverage) belongs to 2.4.

> 6. **Geographic concentration.** The Robbins recipe is US-only. Bridgewater's own 2019 "Geographic Diversification Can Be a Lifesaver" argues against this; out of scope here by brief but material for implementation.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | F | `dalio-search-pending` | Robbins reprint (already cited); Bridgewater institutional unpublished | Robbins says '7-10 year Treasuries' = nominal. Reclassify-limitations stating Dalio's only-public number is nominal. |
| 2 | F | `dalio-search-pending` | 'Our Thoughts' 2015 + All Weather Story | Dalio's wording. Reclassify-limitations. |
| 3 | A | `already-closed-here` | Vanguard Zilbering 2015 (already cited) | Vanguard already cited as NON-DALIO closer for 1%/5%; 3% midpoint is project-author. Reclassify-limitations. |
| 4 | A | `close-by-NON-DALIO` | 'Our Thoughts' + All Weather Story | Closer candidate: Bridgewater own framework; if no numerical entries published, reclassify-limitations as project operationalization of qualitative directional prose. |
| 5 | E | `reclassify-§9` | 'Our Thoughts' 2015 + 2022 retrospectives | Already handed off to 2.4. Reclassify to §9. |
| 6 | E | `reclassify-§9` | Geographic Diversification 2019 (already cited) | Already handed off as out-of-scope-by-brief. Reclassify to §9. |

### 10_alpha_portable_alpha.md — Alpha / Portable Alpha

*Sub-section spans `research/10_alpha_portable_alpha.md` lines 270-275; 5 entries.*

**Verbatim entries:**

> 1. **Breadth for a macro shop.** Chart 5 uses N = 77 without defining an independent bet for a global-macro manager. Stock-picker = stock-month; macro is less obvious. Dalio does not resolve.

> 2. **Correlation window.** Dalio cites ρ = 0.04 for P2 without sample window or ex-ante vs ex-post. Chart's stated IR 1.4 implies ρ = 0.050 (see § 7); chart legend rounds one of the two.

> 3. **Alpha decay.** Engineering Targeted Returns (2011) does not quantify decay for individual alpha sources; 35% threshold in § 6 is McLean & Pontiff (2016), not Dalio.

> 4. **Tracking error calibration.** Dalio cites "one client might choose a 3% tracking error while another might choose 6%" (p. 9) as *examples*, not anchors.

> 5. **Public-data gap.** IC, N, ρ_avg, σ_Alpha have no public API by construction; HFR, Credit Suisse LAB, Barclay require paid subscriptions as of April 2026.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | A | `already-closed-here` | Grinold 1989 / Grinold-Kahn 2000 (already cited) | NON-DALIO foundational reference already cited. Reclassify-limitations as 'breadth definition for macro = scope ambiguity not closed by Grinold formula'. |
| 2 | F | `dalio-search-pending` | Engineering Targeted Returns Chart 5 + p. discussion | Mathematical reconciliation already in §7. Reclassify-limitations as documentation of chart-rounding. |
| 3 | A | `already-closed-here` | McLean & Pontiff 2016 (already cited) | NON-DALIO closer already cited. Reclassify-limitations as 'NON-DALIO threshold from McLean-Pontiff'. |
| 4 | F | `dalio-search-pending` | Engineering Targeted Returns p.9 | Dalio's own examples. Reclassify-limitations as Dalio's-stated-examples-not-anchors. |
| 5 | D | `reclassify-limitations` | n/a — data availability | Move to Limitations. |

### 11_risk_parity_leverage.md — Risk Parity Leverage

*Sub-section spans `research/11_risk_parity_leverage.md` lines 291-299; 7 entries.*

**Verbatim entries:**

> 1. **No precise Dalio L.** Engineering Targeted Returns (p. 11) gives only "around 2×"; the 1.0×–3.0× GREEN/AMBER/RED bands in § 6 are DERIVED, marked at point of use.

> 2. **Vol lookback.** AFP 2012 uses 36-month monthly; 63-day daily is author-stipulated for live monitoring. Substitute 36-month if turnover is an issue.

> 3. **Funding spread.** 25 / 50 / 100 bp brackets are illustrative; actual broker / futures-implied financing varies by cycle stage. Dalio does not quantify.

> 4. **Covariance stability.** `L = σ_target / σ_p` uses historical σ_p. A correlation-breakdown shock (1998, 2008, 2022) raises realized σ_p overnight → forced deleveraging via § 6 RED. Owned by 2.5.

> 5. **Rising-rate risk.** Dalio/Prince/Jensen (2015, p. 8): All-Weather 8.7% vs 60/40 7.6% across 1946–1981 yield upcycle; weigh against the 2022 co-crash.

> 6. **Inverse-vol vs full ERC.** Inverse-vol = exact ERC only with equal correlations; true ERC needs Newton iteration on `w_i·(Σw)_i = σ_p²/N`. Gap is <2 pp for 4–6 sleeves; matters at 10+. Qian 2005 and AFP 2012 both use inverse-vol.

> 7. **MOVE index unavailable on FRED.** ICE/BAML does not publish MOVE free; `BAMLCC0A0CMTRIV` is Corporate Index total return, not MOVE. § 4 uses `VIXCLS` only; a public bond-vol signal is absent.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | A | `already-closed-here` | Engineering p.11 'around 2x' (already cited); AFP 2012 / Qian 2005 (already cited) | Dalio anchor + NON-DALIO references already in §10. Reclassify-limitations as 'project bands around Dalio anchor; AFP/Qian for context'. |
| 2 | C | `reclassify-limitations` | AFP 2012 (already cited) | Move to Limitations. |
| 3 | A | `close-by-NON-DALIO` | n/a — illustrative | Closer candidate: industry-standard funding-cost convention OR reclassify-limitations as illustrative-only. |
| 4 | E | `reclassify-§9` | n/a — handed off to 2.5 | Move to §9. |
| 5 | E | `reclassify-§9` | 'Our Thoughts' 2015 p.8 (already cited) | Already documented as empirical comparison. Reclassify to §9 OR Limitations. |
| 6 | C | `reclassify-limitations` | Qian 2005 / AFP 2012 (already cited) | Methodological. Move to Limitations. |
| 7 | D | `reclassify-limitations` | n/a — data availability | Move to Limitations. |

### 12_stress_testing.md — Stress Testing

*Sub-section spans `research/12_stress_testing.md` lines 276-284; 7 entries.*

**Verbatim entries:**

> 1. **Shock magnitudes are DERIVED.** Every § 5 Step-1 cell is calibrated from 1929–33, 1973–74, 2008, Weimar anchors. Dalio describes archetypes qualitatively (BDC p. 14, p. 32) but does not publish per-sleeve magnitudes. Different anchor choices would produce different results.

> 2. **Single-period shocks.** No within-period path modeling. Compound-path extension is out of word budget.

> 3. **Capital-weight, not risk-contribution, decomposition.** PM's "which sleeve to hedge" is capital-denominated; risk-contribution decomposition (2.2 § 5) gives different dominants.

> 4. **2008 gap is a FINDING.** Unleveraged Robbins −2.34% vs fund −20%; the 17.66-ppt gap = ≈2× leverage + ILB replacing nominal ITsy. Leverage handoff = 2.4.

> 5. **Gold 2008 = +5% (author approximation).** Public summaries report +4–6% for calendar 2008 depending on fix methodology; LBMA PM-fix via FRED `GOLDPMGBD228NLBM` would pin a specific number but does not change the reconciliation gap.

> 6. **DGS10 is a yield, not a return.** § 4 lists DGS10 for regime diagnostics; all bond returns in § 7 come from Damodaran's T.Bond total-return column.

> 7. **R11 source caveat.** BDC PDF retrieved from librairi.com mirror (economicprinciples.org requires email signup). Mirror metadata matches Bridgewater's 480-page Sep-2018 compilation; page numbers are PRINTED footer pages.

**Classification:**

| # | Cluster | Bucket | Dalio-search target | Notes |
|---|---------|--------|---------------------|-------|
| 1 | A | `close-by-NON-DALIO` | BDC archetypes p.14, p.32 (already cited) | Closer candidate: Fed CCAR scenario archive / NBER recession-trough magnitudes. |
| 2 | C | `reclassify-limitations` | n/a — scope | Move to Limitations. |
| 3 | E | `reclassify-§9` | n/a — handed off to 2.2 | Move to §9. |
| 4 | E | `reclassify-§9` | n/a — handed off to 2.4 | Move to §9. |
| 5 | D | `reclassify-limitations` | n/a — fix methodology | Move to Limitations. |
| 6 | C | `reclassify-limitations` | n/a — Damodaran TR series choice (already cited) | Move to Limitations. |
| 7 | D | `reclassify-limitations` | n/a — R11 documentation | Move to Limitations. |

## 5. Summary counts (script-derived)

### By cluster

| Cluster | Definition | Count | Pct |
|---------|------------|-------|-----|
| **A** | Numeric thresholds Dalio doesn't publish (DERIVED operationalization) | 29 | 35% |
| **B** | Range/duration claims (Dalio's own range, no point estimate) | 5 | 6% |
| **C** | Methodological caveats / proxy choices | 18 | 22% |
| **D** | Data caveats / R11 source state | 9 | 11% |
| **E** | Scope handoffs (X owned by 2.4 / 2.5 etc.) | 9 | 11% |
| **F** | Possibly Dalio-canonical (worth deep search before classifying) | 12 | 15% |
| **Total** | | 82 | 100% |

### By preliminary bucket

| Bucket | Count | Pct |
|--------|-------|-----|
| `dalio-search-pending` | 12 | 15% |
| `dalio-canonical-found` | 0 | 0% |
| `close-by-NON-DALIO` | 20 | 24% |
| `already-closed-here` | 7 | 9% |
| `reclassify-limitations` | 34 | 41% |
| `reclassify-§9` | 9 | 11% |
| **Total** | 82 | 100% |

### Net research load (estimated)

- **Genuinely needs NEW NON-DALIO research:** 20 entries (`close-by-NON-DALIO`).
  Some of these may resolve to `reclassify-limitations` after Layer-3 step 1 if the
  industry standard turns out to be project-author-only.
- **Already closed in §10 sources, just need heading move:** 7 entries (`already-closed-here`).
- **Dalio-search pending (likely reclassify after search):** 12 entries (`dalio-search-pending`).
- **Pure heading reclassify (no research):** 43 entries (`reclassify-limitations` + `reclassify-§9`).

ChatGPT-spend candidates concentrate in `close-by-NON-DALIO`. Estimated cost:
~20 × 1 multi-step ChatGPT call ≈ <$50 at Plus rates,
**not** thousands. Most §10 entries close locally.

## 6. Recommended phase sequence

Each phase requires explicit user "go". Phases 1-5 NOT YET AUTHORIZED.

**Phase 1 — Spec fix (LOCAL, $0).** Update `research/_prompt_template.md`:
remove `### Open questions and ambiguities`; add `### Limitations / design
choices` and `### Integration points (forward-references)`. Update
`_acceptance_criteria.md` accordingly. Add R-rule: "§10 has no unresolved
gaps; every gap is Dalio-cited or NON-DALIO-cited at point of use".

**Phase 2 — File 07 trim (LOCAL, $0).** Trim `research/07_inflation_currency.md`
from 3811w to ≤3000w. Layer-3 patches will add words; this is required prep.

**Phase 3 — Layer-3 sweep, per file (mixed local + ChatGPT).** Per-file
authorization gate. Per file:
1. Local Dalio-exhaustion search (cache + WebFetch CWO/HCGB-1 as needed).
2. Reclassify all `reclassify-*` and `already-closed-here` entries (local, $0).
3. ChatGPT 5-step research for `close-by-NON-DALIO` (only if Dalio-search empty).
4. Local verify each ChatGPT step against primary sources.
5. Patch + commit + advisor.

**Phase 4 — Layer-2 finish on files 05-12.** Separate from Layer-3.

**Phase 5 — Final consolidation.** Reconcile C3 audit-file path; build 3 final
artifacts (README + dalio_dashboard.html + dalio_model.xlsx); push.

## 7. User decision points (BEFORE Phase 1)

**D1 — Spec fix scope.** Three options for `### Open questions and ambiguities`:
- (a) **Remove entirely** (replace with Limitations + Integration points).
- (b) **Rename + require empty** ("Open questions — should be EMPTY in production").
- (c) **Keep but require all entries cited** (each entry ends with "→ closed via [src]").

Recommendation: (a). Enforces design intent structurally.

**D2 — Reclassify ALL or only-some.** Recommendation: full reclassify per cluster table.

**D3 — Per-file or batched reclassify.** Recommendation: per-file (one commit per file).

**D4 — Net-unclosed entries — research now or accept reclassify-limitations.**
For the 20 `close-by-NON-DALIO` entries:
- (a) Research all → strongest closure, ~$20-50 ChatGPT.
- (b) Reclassify-limitations with explicit "DERIVED, project calibration" framing → $0.
- (c) Mix — research the 3-5 where industry standard exists; reclassify the rest.

## 8. Risks not in scope of this triage

- **R7b coverage on every closure** — markers within 3 lines of every numeric
  threshold. Audited at Phase 3 step 2, not here.
- **Word-cap pressure** — file 07 at 3811w is over; file 04 at 2955w has <50w
  headroom. Reclassify-only is word-neutral; close-by-NON-DALIO adds words.
- **C3 audit-file path** in `_acceptance_criteria.md` still points to deleted
  `research/_audit_*` location; reconcile at Phase 5.

## 9. Provenance (script integrity)

- Verbatim entries: `_layer3_extract.py` reads `research/[0-9][0-9]_*.md`,
  locates `## § 10` header + open-questions sub-section header (5 known
  variants), splits on numbered list items, writes JSON.
- Classification overlay: `_layer3_classify.CLASSIFY` is the only hand-typed
  data; coverage check enforces every JSON entry has exactly one CLASSIFY row.
- Build: `_layer3_build_triage.py` joins JSON + CLASSIFY into this MD; counts
  via `collections.Counter`; no paraphrase of entry text anywhere.

