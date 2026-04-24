# Red-Team Audit — 2.4 Risk Parity & Leverage

**Date:** 2026-04-23
**Auditor:** Fresh-context adversarial subagent (Claude Sonnet 4.6)
**Target:** `research/11_risk_parity_leverage.md`
**References consulted:**
1. `research/_prompt_template.md` (HARD RULES R7, R10, R11–R14)
2. `research/_acceptance_criteria.md` (21-item checklist S1–S7, R1–R9, R7b, P1, C1–C3)
3. `research/11_risk_parity_leverage.md` (target)
4. Bridgewater "Engineering Targeted Returns and Risks" (Aug 2011) — PDF downloaded and text extracted via PyMuPDF
5. Bridgewater "Our Thoughts about Risk Parity and All Weather" (Sep 16 2015, CMG mirror) — PDF downloaded and text extracted via PyMuPDF
6. PanAgora Qian (Sep 2005) "Risk Parity Portfolios" — PDF downloaded and text extracted via PyMuPDF
7. AQR Asness/Frazzini/Pedersen (2012) "Leverage Aversion and Risk Parity" — PDF downloaded and text extracted via PyMuPDF
8. All FRED series URLs and Stooq URL tested via WebFetch

---

## Findings

| # | Severity | Section / Line | Finding | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F1 | **MAJOR** | § 4 row `ret_bcom` (line 32); § 8a `STOOQ('%5Ebcom')` (line 178); § 10 Sources (line 304) | **Stooq ^BCOM URL does not resolve to valid data.** The cited URL `https://stooq.com/q/d/?s=%5Ebcom&i=d` redirects (HTTP 302) to `http://stooq.com/q/s/?e=^bcom&t=` which displays a Stooq symbol-search error page stating "Symbol ^BCOM nie istnieje w bazie" (the symbol ^BCOM does not exist in the database). This is a wrong-document 302 chain under R11, not the bot-protection 403 that FRED returns. The URL was pre-flight checked per R11 and fails condition (b): "the page content substantively relates to what you cite it for." | WebFetch on `https://stooq.com/q/d/?s=%5Ebcom&i=d` → 302 → redirect URL confirmed to return Stooq error page for non-existent symbol. Bloomberg Commodity Index data does not reside at this Stooq ticker. | Replace the Stooq endpoint with a working Bloomberg Commodity Index data source: (a) Stooq serves BCOM under `%5Ebcom` only if the symbol is in their database — verify the correct Stooq ticker or switch to a confirmed source. Candidate alternatives: Yahoo Finance `^BCOM` via `finance.yahoo.com/quote/%5EBCOM/history`, or note that Bloomberg Commodity Index requires a Bloomberg terminal or licensed feed and flag this in § 10. Update § 4 `API endpoint` cell, § 8a `STOOQ` reference, and § 10 Sources entry accordingly. |
| F2 | **MINOR** | § 6 "Funding-cost guardrail" RED rule (line 112) vs § 7 R14 check (line 159) | **Internal precision inconsistency for the same quantity.** § 6 RED threshold note reads "funding drag exceeds 6.6 pp Sharpe at L=1.66×, σ_p=6%". § 7 R14 self-check states "drag @ 100 bp = 6.56 pp ✓". These refer to the same computation. The independently verified correct value is 6.56 pp (computed: `((1.6565−1)/1.6565) × (0.01/0.06037) = 0.06565 ≈ 6.56 pp`). § 6 rounds to 6.6 pp; § 7 retains two decimal places as 6.56 pp. A reader cross-checking § 6 against § 7 will see a conflict. | Independent arithmetic: `((L−1)/L) × (s/σ_p)` at L=1.6565, s=0.01, σ_p=0.06037 → 6.565 pp. § 7 correctly states 6.56 pp; § 6 states 6.6 pp. | Align § 6 to match § 7: change "6.6 pp" to "6.56 pp" on line 112 so both sections agree. |
| F3 | **MINOR** | § 7 Step 5 (line 147) | **Sharpe pick 0.30 (top of Dalio range) attributed to Dalio without a DERIVED marker.** The target states "Assume SR_per_sleeve = 0.30 (Dalio '0.2 to 0.3' Sharpe range, Engineering Targeted Returns, p. 3)". Dalio gives a range of 0.2–0.3; picking 0.30 specifically is an author-stipulated choice, not a Dalio-stated value. Per R10 / R7b: "Dalio gives a range; I'm picking an endpoint" = DERIVED and needs a `> **DERIVED (operational)**` marker at the point of use. § 7 Step 5 carries no such marker. | Engineering Targeted Returns p.3 (confirmed in extracted PDF text): "Sharpe ratios typically ranging from 0.2 to 0.3" — a range, not a point. No value of 0.30 is specified. The selection of 0.30 is the author's choice. | Add a `> **DERIVED (operational)** — SR = 0.30 is the top of Dalio's stated 0.2–0.3 range (Engineering Targeted Returns, p. 3), selected here for a conservative worked-example. The worked-example numbers are illustrative; any value in 0.20–0.30 is defensible.` block immediately after the Step 5 assumption statement on line 147. |

---

## URLs Audited

| URL | Status | Notes |
|---|---|---|
| `https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf` | **OK — PDF downloaded, text extracted** | Resolves. Title confirmed: "Engineering Targeted Returns and Risks", Aug 2011, Ray Dalio. All cited quotes verified against extracted text (see Quote Fidelity section below). |
| `https://www.cmgwealth.com/wp-content/uploads/2015/10/Our-Thoughts-about-Risk-Parity-and-All-Weather-Bridgewater-Ray-Dalio-2015.pdf` | **OK — PDF downloaded, text extracted** | Resolves. Title confirmed: "Our Thoughts about Risk Parity and All Weather", Bridgewater Daily Observations 9/16/2015. All cited quotes verified. |
| `https://www.panagora.com/assets/PanAgora-Risk-Parity-Portfolios-Efficient-Portfolios-Through-True-Diversification.pdf` | **OK — PDF downloaded, text extracted** | Resolves. Qian 2005 paper confirmed. 23%/77% quote and three-deployment table verified. |
| `https://www.aqr.com/-/media/AQR/Documents/Insights/Journal-Article/Leverage-Aversion-and-Risk-Parity.pdf` | **OK — PDF downloaded, text extracted** | Resolves. AFP 2012 paper confirmed. Printed page footers: pp. 47–59 spanning viewer pages 1–14. Quote on p. 51 (printed footer) verified. |
| `https://fred.stlouisfed.org/series/FEDFUNDS` | **403 — MINOR** | Bot-protection; series widely documented. FEDFUNDS = Effective Federal Funds Rate. MINOR per audit instructions. |
| `https://fred.stlouisfed.org/series/DFF` | **403 — MINOR** | Bot-protection. DFF = Federal Funds Effective Rate (daily). MINOR. |
| `https://fred.stlouisfed.org/series/DTB3` | **403 — MINOR** | Bot-protection. DTB3 = 3-Month Treasury Bill: Secondary Market Rate. MINOR. |
| `https://fred.stlouisfed.org/series/DGS10` | **403 — MINOR** | Bot-protection. DGS10 = Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity. MINOR. |
| `https://fred.stlouisfed.org/series/SP500` | **403 — MINOR** | Bot-protection. SP500 = S&P 500. MINOR. |
| `https://fred.stlouisfed.org/series/GOLDPMGBD228NLBM` | **403 — MINOR** | Bot-protection. GOLDPMGBD228NLBM = Gold Fixing Price 3:00 P.M. (London time), in London Bullion Market, based in U.S. Dollars. MINOR. |
| `https://fred.stlouisfed.org/series/VIXCLS` | **403 — MINOR** | Bot-protection. VIXCLS = CBOE Volatility Index: VIX. MINOR. |
| `https://stooq.com/q/d/?s=%5Ebcom&i=d` | **FAIL — MAJOR (F1)** | 302 redirect to Stooq error page. Symbol ^BCOM does not exist in Stooq database. Wrong-document redirect chain per R11. |
| `https://www.bridgewater.com/research-and-insights/the-all-weather-story` | **OK** | Resolves. Bridgewater All Weather Story page confirmed. (§ 10 cites this as supplementary source.) |

---

## Quote Fidelity Verification

All four verbatim quotes in § 2 were checked word-for-word against the extracted PDF text. Results:

**Quote 1** (Engineering Targeted Returns, p. 4, line 9–10): Target text matches extracted p. 4 text exactly. The `[…]` elision legitimately removes "In other words," — proper use per R12. Printed page footer = 4. Attribution correct.

**Quote 2** (Engineering Targeted Returns, p. 11, line 13): Target text matches extracted p. 11 text exactly, truncating the parenthetical "(which we think is too much)" — legitimate truncation. The curly apostrophe in the PDF is rendered as straight in Markdown; this is an encoding convention, not a fidelity error. Printed page footer = 11. Attribution correct.

**Quote 3** (Our Thoughts, p. 1, line 15–17): "Risk parity is the means of adjusting the expected risks and returns of assets to make them more comparable. […] Once the better diversified portfolio is created and the return-risk ratio is improved, the portfolio can be geared to the desired level of risk and return." — CONFIRMED on printed page 1 of the PDF (the initial text extraction was truncated; a full-text search found it on viewer/printed page 1 in the section beginning "What is risk parity?"). Attribution correct.

**Quote 4** (Our Thoughts, p. 2, line 19–20): "if you lever up the bonds to have a similar volatility, both the expected risks and the expected returns of the bonds would increase to be more like the expected risks and returns of stocks. […] borrowing cash to buy more bonds will give more of that profitable spread." — CONFIRMED on printed page 2. The `[…]` elision removes "Doing that levering would raise the expected return of bonds because bonds have a expected return that is greater than cash so that" — legitimate elision of bridging text. Attribution correct.

**Rebalance quote** (Our Thoughts, p. 9, § 5 Step G line 75): "All Weather is a strategic asset allocation mix, not an active strategy. As such, All Weather tends to rebalance that mix, which leads us to tend to buy those assets that go down in relation to those that went up so that we keep the allocations to them constant." — CONFIRMED on printed page 9 of the PDF. Attribution correct.

**AFP p. 51 quote** (§ 5 Step B): "we set the portfolio weight in each asset class equal to the inverse of its volatility" — CONFIRMED in AFP PDF, printed page 51 (viewer page 5, footer reads "51"). The fuller text in the source: "we set the portfolio weight in each asset class equal to the inverse of its volatility (estimated by using three-year monthly excess returns up to month t − 1)". Truncation legitimate; three-year lookback attribution correctly placed in Step A NON-DALIO marker.

**Sharpe 0.2–0.3** (Engineering Targeted Returns, p. 3): Confirmed: "with Sharpe ratios typically ranging from 0.2 to 0.3" — printed page footer 3. Attribution correct; point-selection DERIVED issue flagged as F3.

---

## R7b Point-of-Use Coverage Check (§§ 5–6)

Each threshold verified for proximity of attribution marker (within 3 lines):

| Threshold / Item | Location | Marker present within 3 lines? |
|---|---|---|
| 63-day vol lookback (Step A) | § 5 Step A, lines 45–49 | YES — `> **DERIVED (operational)**` on line 49 |
| Inverse-vol vs ERC gap < 2pp (Step B) | § 5 Step B, lines 51–55 | YES — `> **NON-DALIO**` markers on lines 53–55 |
| L = target/unlevered identity (Step D) | § 5 Step D, lines 59–61 | YES — `> **DERIVED (operational)**` on line 61 |
| Sharpe-drag identity (Step F) | § 5 Step F, lines 65–71 | YES — `> **DERIVED (operational)**` on line 71 |
| σ_target bands 6/10/15/18%, L-bands 1.0×/2.0×/3.0× (§ 6 table) | § 6 lines 85–90, 96–98 | YES — `> **NON-DALIO**` and `> **DERIVED**` markers on lines 81–84 and 94 |
| 3.0× hard leverage cap | § 6 line 98 | YES — `> **DERIVED (operational)**` on line 94 |
| ±25% vol-band rebalance trigger | § 6 lines 102–104 | YES — `> **DERIVED (operational)**` on line 102 |
| 25/100 bp funding-spread GREEN/AMBER/RED | § 6 lines 108–112 | YES — `> **DERIVED (operational)**` on line 108 |
| 5% × (L−1) margin buffer | § 6 lines 114–116 | YES — `> **DERIVED (operational)**` on line 116 |
| 0.30 per-sleeve Sharpe (§ 7 Step 5) | § 7 line 147 | **NO** — no DERIVED marker within 3 lines. Flagged as F3. |

---

## R14 Arithmetic Deep-Check

All computations independently verified in Python:

| Claim | Stated value | Computed value | Status |
|---|---|---|---|
| sum(1/σ_i) | 35.1389 | 35.1389 | PASS |
| σ_p (unlevered portfolio vol) | 6.037% | 6.037% | PASS |
| L = 10% / 6.037% | 1.656× | 1.6565× (rounds to 1.656) | PASS |
| r_p (weighted return) | 7.415% | 7.415% | PASS |
| r_net levered @ s=0 | 9.657% | 9.657% (exact: 9.6569%) | PASS |
| Sharpe @ s=0 | 0.566 | 0.566 (exact: 0.5657) | PASS |
| Sharpe @ s=25 bp | 0.549 | 0.549 (exact: 0.5493) | PASS |
| Sharpe @ s=50 bp | 0.533 | 0.533 (exact: 0.5329) | PASS |
| Sharpe @ s=100 bp | 0.500 | 0.500 (exact: 0.5000) | PASS |
| Sharpe drag @ 25 bp | 1.64 pp | 1.64 pp | PASS |
| Sharpe drag @ 100 bp | 6.56 pp (§ 7) / 6.6 pp (§ 6) | 6.56 pp | § 7 PASS; § 6 inconsistent — F2 |
| Margin buffer 5%×(L−1) | 3.28% | 3.28% | PASS |
| § 8c chart data [0.566, 0.566, 0.549, 0.533, 0.500] | matches § 7 Sharpe column | CONFIRMED | PASS |
| All 6 off-diagonal pair terms | per table in § 7 Step 3 | match to 4 decimal places | PASS |

---

## Verdict

**PASS-with-patches**

(0 CRITICAL, 1 MAJOR [F1: Stooq ^BCOM URL broken], 2 MINOR [F2: § 6 vs § 7 precision inconsistency; F3: SR=0.30 endpoint pick lacks DERIVED marker])

**Patches applied 2026-04-23:**
- F1: § 4 `ret_bcom` API endpoint, § 8a `STOOQ` helper, § 9 data-source list, § 10 Sources — all updated to Yahoo Finance `https://query1.finance.yahoo.com/v8/finance/chart/%5EBCOM?interval=1d&range=10y`; § 1 Executive Summary updated to remove "Stooq" reference.
- F2: § 6 RED rule "6.6 pp" → "6.56 pp" to match § 7 R14 arithmetic.
- F3: Added `> **DERIVED (operational)**` marker after Step 5 SR=0.30 assumption in § 7.
- Word count maintained at 2999 (within 2000–3000 band) by tightening § 10 items 5–7 prose.

---

## Summary

The target document is substantively correct and well-constructed. All four verbatim quotes in § 2 verify word-for-word against extracted PDF text. All FRED series identifiers map to the correct series (FRED returns 403 bot-protection, not 404, for all seven series — MINOR per audit instructions). The § 7 arithmetic is internally consistent and independently reproduced to full precision across all 13 checked values; the R14 self-check is reliable. All DERIVED / NON-DALIO / Dalio markers in §§ 5–6 are present within the 3-line window for every threshold except the 0.30 Sharpe pick in § 7.

The single MAJOR defect is the Stooq ^BCOM data endpoint: the cited URL redirects to a Stooq symbol-not-found error page. Bloomberg Commodity Index data is not available from Stooq under the ticker `%5Ebcom`. This is a pre-flight check failure under R11, because the redirect chain delivers a wrong document. Two patches are required: replace or clearly footnote the Stooq endpoint in § 4, § 8a, and § 10 with a working public source (or flag that BCOM requires a licensed feed). The two MINOR items (§ 6 rounding "6.6 pp" vs § 7 precision "6.56 pp", and the missing DERIVED marker for SR=0.30 in § 7 Step 5) do not affect the document's usability but should be corrected before wave acceptance.
