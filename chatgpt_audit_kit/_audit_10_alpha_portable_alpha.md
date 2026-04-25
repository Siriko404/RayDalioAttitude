# Red-Team Audit — 2.3 Alpha Generation & Portable Alpha

**Date:** 2026-04-24  
**Auditor:** ChatGPT (GPT-5.5 Thinking) — fresh context, not the author  
**Target:** `research/10_alpha_portable_alpha.md`  
**Tools used:** Web Browsing — yes · Code Interpreter — yes · Outbound Python networking — no, `requests.get()` failed DNS resolution for all external hosts · Uploaded PDFs — none · PDF verification method — web-rendered PDF text + page screenshots, not local PyMuPDF  
**References consulted:** `audit_prompt(13).md` rules · target file `10_alpha_portable_alpha.md` · every URL listed below

## Findings

| ID | Severity | § / line | Finding | Evidence | Proposed fix |
|----|----------|----------|---------|----------|--------------|
| F1 | CRITICAL | § 4 line 35 | The FRED API endpoint is not a usable public API URL as written; it omits the required `api_key` parameter and failed live fetch. This violates R11 and weakens R3. | Live web fetch of `https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO` returned **400 Bad Request**. FRED's own API documentation examples include `series_id=...&api_key=...`; a registered key is required. | Replace with either the no-key CSV endpoint used in § 8 (`https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS3MO`) or an API template explicitly marked as requiring `api_key={FRED_API_KEY}&file_type=json`. |
| F2 | MAJOR | § 6 lines 83–87, 99 | R7b point-of-use coverage still fails for most decision thresholds. The markers are grouped below the table, not within three lines of the thresholds they justify. | Line-distance check: line 83 `N_eff < 6 / ≥ 6` has nearest relevant marker at line 91; line 84 `ρ_avg > 0.20` has marker at line 93; line 85 `IR_slice ≥ 0.30` has marker at line 95; line 87 `0.65` and `≥35%` has marker at line 97; line 99 `e.g. 4%` has no canonical R7 marker within three lines. Only line 86 is within three lines of its marker. | Move each `DERIVED` / `NON-DALIO` marker directly adjacent to the table row it supports, or split the decision table into row-by-row blocks where each threshold is covered within ±3 lines. Add a marker for the 4% tracking-error example. |
| F3 | MAJOR | § 5 line 69 | The report overclaims that Dalio's Chart 5 "uses exactly this relation." The stated Chart 5 inputs do not reproduce the Chart 5 implied IR for Portfolio 2 under the formula. | Web-rendered Bridgewater Chart 5 shows Portfolio 2 inputs: N = 77, average correlation = 0.04, IR per slice = 0.35, implied IR = 1.4. Python recomputation of the report's formula gives **1.5279977839**, not 1.4. The target later admits this in § 7, so line 69 is internally inconsistent. | Change "uses exactly this relation" to "can be reconstructed approximately from this relation, subject to the Chart 5 rounding discrepancy discussed in § 7." |
| F4 | MAJOR | § 4 lines 38–41 | Four input rows still violate the literal R3 requirement that every input variable name a specific public data source/API endpoint. "Manager-proprietary" plus `n/a` is an explanation, not a public source. | Rows for `σ_Alpha`, `IC`, `N`, and `ρ_avg` state internal estimation / no public API and use `n/a — manager-proprietary`. R3 says every input variable must name a specific public data source, API endpoint, or dataset ID. | Either remove these from the public-data input table and put them in a separate "manager-internal inputs" table explicitly outside R3, or supply public proxy datasets/endpoints and label the proprietary versions as implementation-only. |
| F5 | MAJOR | § 10 lines 281–288 | § 10 does not list every URL cited anywhere in the report, failing C2. | URLs appearing outside § 10 but absent from the source list include the FRED API endpoint from line 35 and the FRED CSV endpoint from lines 146 and 186. The Ken French Momentum ZIP is named as `F-F_Momentum_Factor_CSV.zip` but no full URL is listed. | Add a complete "All URLs cited anywhere" list in § 10, including FRED API/CSV endpoints and the full Ken French Momentum ZIP URL if it remains part of the input specification. |
| F6 | MINOR | Headers: lines 3, 7, 27, 31, 45, 79, 107, 124, 256, 267; § 8b line 163 | The section headings do not exactly match the schema formatting. Top-level headers use one space after the section number instead of the schema's two spaces; § 8b omits "or URL" from the exact schema title. | Schema requires forms such as `## § 1  Executive Summary` and `### 8b. Excel — sheet layout, Power Query M or URL, key formulas`; target uses `## § 1 Executive Summary` and `### 8b. Excel — sheet layout, Power Query M, key formulas`. | Normalize headings exactly to the schema. |
| F7 | MINOR | § 2 line 10 | The first Dalio quote begins mid-source sentence without marking the omitted opening words. R12 says elisions must be explicit. | Source text reads "By contrast, PMPT differs..." while the target quote starts "PMPT differs..." with no leading `[…]`. The quoted text is otherwise faithful and on the correct printed page. | Either include "By contrast," or write `[…] PMPT differs...`. |
| F8 | MINOR | § 8a lines 130–134 | `portfolioIR()` validates `rhoAvg ∈ [-1,1]`, but for an average pairwise correlation matrix the lower feasible bound is `-1/(n-1)`. Some accepted inputs produce division by zero or `NaN`. | Example: `portfolioIR(0.35, 3, -1)` passes the current guard but denominator is `sqrt(1 + 2*(-1)) = sqrt(-1)`, producing `NaN`; `n=2, rho=-1` produces division by zero. | Validate `1 + (n - 1) * rhoAvg > 0` or enforce `rhoAvg > -1/(n-1)` for `n > 1`. |
| F9 | MINOR | § 9 lines 258–263 | § 2.5 Stress-Testing is directionally mislabeled as "upstream" for this subsection. Stress-testing normally consumes the completed alpha+beta book; it does not supply core inputs to alpha generation. | Registry scope for 2.3 is alpha/beta separation, IR, bet sizing, portable alpha, and alpha decay; § 2.5 is a separate downstream stress-testing subsection. The target itself later says § 2.5 supplies scenario paths "against which" the book is tested. | Move § 2.5 from "Upstream" to "Downstream" or "adjacent consumer." |

## URLs audited

| URL | HTTP status | Quote / content match? | Notes |
|-----|-------------|------------------------|-------|
| `https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf` | 200 inferred from successful web PDF render | YES | PDF rendered as 12 pages. Verified § 2 quotes and Chart 5 via web PDF text + screenshots. Python `requests.get()` failed DNS in sandbox. |
| `https://www.bridgewater.com/_document/the-all-weather-story?id=00000171-8623-d7de-affd-feaf4ee20000` | 200 inferred from successful web PDF render | YES | PDF rendered as 9 pages. The `return = cash + beta + alpha` formula appears on printed p. 4. Python `requests.get()` failed DNS in sandbox. |
| `https://www.ahwilliamsco.com/includes/OurThoughtsaboutRiskParityandAllWeather.pdf` | 200 inferred from successful web PDF render | CONTENT-RELATED | PDF rendered as 13 pages. Used only as § 10 / § 9 background source, not for a § 2 quote. |
| `https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/fundamental-law-of-active-management/` | 200 inferred from successful web render | YES | Page states the Fundamental Law as `IR = IC*√Breadth` and defines breadth as number of investment decisions in a year. |
| `https://www.hec.ca/finance/Fichier/McLean.pdf` | 200 inferred from successful web PDF render | YES | PDF rendered as 41 pages. Abstract supports the post-publication decay claim. |
| `https://fred.stlouisfed.org/series/DGS3MO` | 200 inferred from successful web render | YES | Page title and notes match `DGS3MO`: 3-month Treasury constant maturity, percent, not seasonally adjusted, daily, source Board of Governors H.15. |
| `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS3MO` | Tool-limited: web direct fetch returned `Failed to fetch ... (400) OK` | UNVERIFIED DIRECTLY | Likely a binary/CSV rendering limitation in the web tool. This endpoint is also not listed in § 10, so C2 still fails. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO` | 400 Bad Request | NO | Broken as written; official examples require `api_key`. This is F1. |
| `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/Data_Library/f-f_factors.html` | 200 inferred from successful web render | YES | Page defines SMB, HML, and `Rm-Rf` as the value-weighted CRSP market return minus the one-month Treasury bill rate. |
| `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip` | Tool-limited: web direct fetch returned `Failed to fetch ... (400) OK` | UNVERIFIED DIRECTLY | Likely a ZIP rendering limitation in the web tool. The data-library HTML page itself rendered and supports the factor descriptions. |

## Arithmetic re-checks (§ 7)

For each numeric cell recomputed:

```text
Python environment: available.
Outbound Python networking: unavailable; all external requests failed DNS.
Arithmetic recomputation: executed locally.

Formula:
IR_port = IR_slice * sqrt(N) / sqrt(1 + (N - 1) * rho_avg)

Portfolio 1:
target stated recomputed value = 0.571
Python recomputation = 0.5715476066494082
MATCH to printed precision 0.571 (delta ≈ 0.000548 before rounding)

Portfolio 2:
target stated recomputed value = 1.528
Python recomputation = 1.5279977839390908
MATCH to printed precision 1.528 (delta ≈ -0.000002 before rounding)

Rho required to force Portfolio 2 implied IR = 1.4:
target stated value = 0.0502
Python recomputation = 0.05016447368421054
MATCH to printed precision 0.0502

Chart ratio:
target stated chart ratio = 1.4 / 0.6 = 2.33x
Python recomputation = 2.3333333333333335
MATCH to printed precision 2.33x

Recomputed ratio:
target stated recomputed ratio = 1.528 / 0.571 = 2.67x
Python recomputation using unrounded values = 2.6734392133958784
MATCH to printed precision 2.67x

ECharts data check:
§ 8c Dalio chart data = [0.6, 1.4]; § 7 chart values = [0.6, 1.4] — MATCH.
§ 8c recomputed data = [0.571, 1.528]; § 7 recomputed values = [0.571, 1.528] — MATCH.
```

## Quote fidelity table

| Quote # | Cited page | Actual printed page (per web PDF text/screenshots) | Word-for-word match? | Notes |
|---------|-----------|------------------------------------|----------------------|-------|
| Q1 — Engineering PMPT separation quote | p. 2 | p. 2 | PARTIAL | Text is faithful after the omitted opening words, but target omits the source's leading "By contrast," without a leading elision marker. See F7. |
| Q2 — Engineering beta characteristics quote | p. 3 | p. 3 | YES | Elision covers explanatory parenthetical. Page number correct. |
| Q3 — Engineering alpha characteristics quote | p. 3 | p. 3 | YES | Elisions are visible and page number is correct. |
| Q4 — Optimal Alpha Portfolio / alpha overlay quote | printed p. 8 | printed p. 8 | YES | Verified on rendered page with footer 8. |
| Q5 — Information ratios increase by factors quote | p. 9 | printed p. 9 | YES | Verified on rendered page with footer 9. |
| Q6 — All Weather formula | p. 4 | printed p. 4 | YES | Formula appears on rendered page with footer 4. |

## Verdict

**REJECT-re-spawn**

- **PASS** = 0 CRITICAL, 0 MAJOR
- **PASS-with-patches** = 0 CRITICAL, ≥1 MAJOR
- **REJECT-re-spawn** = ≥1 CRITICAL OR ≥3 MAJOR

This target has **1 CRITICAL**, **4 MAJOR**, and **4 MINOR** findings.

## Summary

The core Bridgewater quote-fidelity problems that were present in the calibration target are largely fixed: the major § 2 quotes now resolve to the correct printed pages, and the § 7 arithmetic is internally recomputed correctly. The file is not clean. It still fails on a live broken FRED API URL, R7b point-of-use coverage, public-source compliance for proprietary alpha inputs, incomplete § 10 URL inventory, and an overstatement that Chart 5 uses the correlation-adjusted formula "exactly" even though the report's own recomputation proves the Portfolio 2 chart value does not exactly follow from the printed inputs.

Residual risk: because outbound Python networking failed, I could not independently download PDFs into PyMuPDF. I compensated by using web-rendered PDF text and screenshots for the relevant pages. Direct binary ZIP/CSV endpoints also could not be rendered by the web tool, so those are flagged as tool-limited rather than silently passed. Recommended next action is re-spawn rather than patch-in-place: fix F1–F5 first, then run a narrower re-audit focused on URL inventory, R7b line-distance coverage, and data-source compliance.
