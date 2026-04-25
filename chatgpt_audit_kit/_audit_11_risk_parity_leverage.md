# Red-Team Audit — 2.4 Risk Parity & Leverage

**Date:** 2026-04-24
**Auditor:** ChatGPT (GPT-5.5 Thinking) — fresh context, not the author
**Target:** `research/11_risk_parity_leverage.md`
**Tools used:** Web Browsing — yes · Code Interpreter — yes · Outbound `requests.get()` — attempted but timed out in sandbox; live URL/PDF verification fell back to browser PDF previews and screenshots · Uploaded PDFs — none
**References consulted:** `_prompt_template.md` / `audit_prompt.md` rules embedded in uploaded audit prompt · target `11_risk_parity_leverage.md` · each URL listed below

## Findings

| ID | Severity | § / line | Finding | Evidence | Proposed fix |
|----|----------|----------|---------|----------|--------------|
| F1 | CRITICAL | § 4 line 31; § 10 line 307 | `GOLDPMGBD228NLBM` is not a live FRED series source anymore, so the gold input and the § 10 "URLs pre-flight-checked" claim fail R11/R13. | Live browser fetch of `https://fred.stlouisfed.org/series/GOLDPMGBD228NLBM` redirected to a St. Louis Fed announcement, not the series page. The announcement states: "On January 31, 2022, FRED will no longer include data from ICE Benchmark Administration Limited (IBA)" and "All series from the datasets below will be deleted from the FRED database, Excel Add-in, Mobile applications, APIs, and all other FRED services"; the deleted datasets include "LMBA Gold Price: Daily Prices." | Replace `ret_gold` with a current public source/API that actually resolves, or remove gold from the implementation until a live public source is specified. Do not cite this FRED series as pre-flight checked. |
| F2 | CRITICAL | § 10 line 308; § 4 line 32; § 8a lines 175/182 | The Yahoo Finance `^BCOM` chart endpoint did not resolve to 200 in live verification; it returned HTTP 429, so it fails R11 as a pre-flight-checked data URL. | Live browser fetch of `https://query1.finance.yahoo.com/v8/finance/chart/%5EBCOM?interval=1d&range=10y` returned: `Failed to fetch ... (429) Too Many Requests`. This is not a 200 or 302→200 chain and does not deliver the data needed by § 4/§ 8. | Use a stable public commodity-index source with documented rate limits/access terms, or mark Yahoo as an optional fallback and provide a primary source that returns 200 in audit. |
| F3 | CRITICAL | § 2 line 13 | The quoted "around 2 times leveraged" sentence is not copied word-for-word and suppresses source text without an explicit `[…]`, violating R12. | Browser PDF preview/screenshot of *Engineering Targeted Returns and Risks*, printed p. 11, shows: "All Weather doesn't use very much leverage; the strategy is around 2 times leveraged, which is less than the amount of leverage an average large company in the S&P 500 employs and about 1/10th the leverage the average U.S. bank employs (which we think is too much)." Target line 13 ends after "employs" and adds a period, omitting "(which we think is too much)" with no elision marker. | Either quote the complete source sentence including the parenthetical or write `... average U.S. bank employs […]`. |
| F4 | MAJOR | § 5 line 53; § 7 lines 126–143 | The claim that inverse-vol weights are within `<2 pp` of true ERC for the § 7 covariance matrix is false; the true ERC weights differ by up to **7.04 pp**, and inverse-vol risk contributions are not close to equal. | Python recomputation using the § 7 vols/correlation matrix: inverse-vol weights = `[17.7866%, 47.4308%, 18.9723%, 15.8103%]`; risk contributions = `[21.11%, 14.44%, 33.33%, 31.11%]`. Solving true ERC gives weights = `[18.2955%, 54.4730%, 14.3149%, 12.9166%]`. Weight differences vs inverse-vol = `[+0.51 pp, +7.04 pp, -4.66 pp, -2.89 pp]`. | Remove the `<2 pp` claim. Either solve full ERC (`w_i(Σw)_i = σ_p²/N`) or label the example explicitly as inverse-vol, not risk parity/equal-risk contribution. |
| F5 | MAJOR | § 7 lines 120–145; line 153; lines 155–163; line 167 | The worked-example numeric tables and the correlation matrix do not have R7b point-of-use attribution/derivation markers within 3 lines. | Target lines 126–143 contain vols, inverse vols, weights, correlation matrix entries, diagonal/off-diagonal variance terms, and σ_p. The nearest marker is line 149 and covers only the 0.30 Sharpe assumption. Step 6's return/Sharpe table at lines 155–161 and the R14 checks at line 163 also lack a marker within 3 lines. | Add a `> **DERIVED (operational)**` marker immediately before Step 1/Step 2 and before Step 6, stating that these are illustrative inputs and formulas computed from § 5, not sourced empirical estimates. |
| F6 | MAJOR | § 4 lines 36 and 41 | The input table violates R3 for private/non-public implementation inputs: broker ledger and OMS/custodian positions are not public data sources or public dataset IDs. | Line 36 cites `broker / IBKR` and an account-specific `/portfolio/{id}/ledger`; line 41 cites `custodian / OMS` and IBKR `/portfolio/{id}/positions`. These are authenticated/private account endpoints, not public sources. The audit prompt's R3 requires every § 4 input variable to name a specific public data source/API endpoint/dataset ID. | Move execution-account inputs into a separate "private/operator inputs" table and provide public proxies where possible, e.g., SOFR/T-bill/futures financing proxies for funding spread. |
| F7 | MAJOR | § 7 line 165 | "Leverage doubles vol" is mathematically wrong for the worked example. | Python recomputation: σ_p = 6.036959%; σ_target = 10.000000%; L = 1.656463×. That scales volatility by **1.656×**, not 2.0×. Doubling σ_p would produce 12.074%, not 10.000%. | Replace with: "Leverage scales vol by 1.66×, lifting σ from 6.04% to 10.00%." |
| F8 | MINOR | § 4 line 37 | `VIXCLS` is mislabeled as unit `%`; FRED labels it as an `Index`. | Live FRED page for `VIXCLS` states `CBOE Volatility Index: VIX (VIXCLS)`, Units: `Index`, Frequency: `Daily, Close`. | Change unit from `%` to `index points` or `Index`; explain that VIX is conventionally interpreted as annualized implied volatility points. |

## URLs audited

| URL | HTTP status | Quote / content match? | Notes |
|-----|-------------|------------------------|-------|
| `https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf` | 200 via browser PDF fetch | PARTIAL | PDF opens; quoted p. 4 and p. 11 passages exist. Line 13 quote fails fidelity because omitted parenthetical is not marked with `[…]`. |
| `https://www.cmgwealth.com/wp-content/uploads/2015/10/Our-Thoughts-about-Risk-Parity-and-All-Weather-Bridgewater-Ray-Dalio-2015.pdf` | 200 via browser PDF fetch | YES/PARTIAL | PDF opens; § 2 p. 1 and p. 2 passages exist. Initial phrase omissions are not always explicitly marked, but the substantive quoted text is present. The p. 9 rebalance quote is present. |
| `https://www.bridgewater.com/research-and-insights/the-all-weather-story` | 200 via browser HTML fetch | YES | Page opens and matches Bridgewater's *The All Weather Story*; not used for a § 2 quote in this target. |
| `https://www.panagora.com/assets/PanAgora-Risk-Parity-Portfolios-Efficient-Portfolios-Through-True-Diversification.pdf` | 200 via browser PDF fetch | YES | Qian quote and risk/leverage buckets appear in browser PDF preview. |
| `https://www.aqr.com/-/media/AQR/Documents/Insights/Journal-Article/Leverage-Aversion-and-Risk-Parity.pdf` | 200 via browser PDF fetch | YES | AFP quote appears: the portfolio weight is set equal to inverse volatility estimated using three-year monthly excess returns up to month t−1. |
| `https://fred.stlouisfed.org/series/FEDFUNDS` | 200 via browser HTML fetch | YES | FRED page title: `Federal Funds Effective Rate (FEDFUNDS)`; units percent; frequency monthly. |
| `https://fred.stlouisfed.org/series/DFF` | 200 via browser HTML fetch | YES | FRED page title: `Federal Funds Effective Rate (DFF)`; units percent; frequency daily / 7-day. |
| `https://fred.stlouisfed.org/series/DTB3` | 200 via browser HTML fetch | YES | FRED page title: `3-Month Treasury Bill Secondary Market Rate, Discount Basis (DTB3)`; units percent; frequency daily. |
| `https://fred.stlouisfed.org/series/DGS10` | 200 via browser HTML fetch | YES | FRED page title: `Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis (DGS10)`; units percent; frequency daily. |
| `https://fred.stlouisfed.org/series/SP500` | 200 via browser HTML fetch | YES | FRED page title: `S&P 500 (SP500)`; units index; frequency daily close. |
| `https://fred.stlouisfed.org/series/GOLDPMGBD228NLBM` | 302→200 wrong-document redirect | NO | Redirects to a St. Louis Fed announcement that IBA/LBMA gold price data were removed from FRED/API services as of Jan. 31, 2022. R11/R13 failure. |
| `https://fred.stlouisfed.org/series/VIXCLS` | 200 via browser HTML fetch | PARTIAL | Series exists and matches VIX, but FRED unit is `Index`; target line 37 labels it `%`. |
| `https://query1.finance.yahoo.com/v8/finance/chart/%5EBCOM?interval=1d&range=10y` | 429 | NO | Browser fetch returned `Too Many Requests`; fails R11 live pre-flight. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${process.env.FRED_KEY}&file_type=json` | Not a concrete URL | N/A | § 8a template string; not directly fetchable without substitution and a FRED API key. Syntax only reviewed. |
| `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=10y` | Not a concrete URL | N/A | § 8a template string; concrete `^BCOM` version failed with 429. |
| `https://api.stlouisfed.org/fred/series/observations?series_id=DFF&api_key=YOUR_FRED_KEY&file_type=json` | Not fetched as written | N/A | § 8b Power Query placeholder; requires a real API key. |

## Arithmetic re-checks (§ 7)

```text
Python / NumPy recomputation from target § 7 inputs:

Input vols:
SPX=0.160000, UST10=0.060000, Gold=0.150000, BCOM=0.180000

Inverse vols:
target displayed = [6.2500, 16.6667, 6.6667, 5.5556]
recomputed       = [6.250000, 16.666667, 6.666667, 5.555556]
sum              = 35.138889 → target 35.139 — MATCH after rounding

Inverse-vol weights:
target displayed = [17.79%, 47.43%, 18.97%, 15.81%]
recomputed       = [17.7866%, 47.4308%, 18.9723%, 15.8103%]
MATCH after rounding

Portfolio variance decomposition:
target diagonal = 32.3954 × 10^-4
recomputed      = 32.3954 × 10^-4 — MATCH

target off-diagonal terms ×10^-4:
SPX-UST10 -4.8593; SPX-Gold +0.8099; SPX-BCOM +3.2395; UST10-Gold +1.6198; UST10-BCOM -2.4297; Gold-BCOM +5.6692
recomputed:
SPX-UST10 -4.8593; SPX-Gold +0.8099; SPX-BCOM +3.2395; UST10-Gold +1.6198; UST10-BCOM -2.4297; Gold-BCOM +5.6692
MATCH

target off-diagonal sum = +4.0494 × 10^-4
recomputed              = +4.0494 × 10^-4 — MATCH

target variance = 36.4449 × 10^-4
recomputed      = 36.4449 × 10^-4 — MATCH

target sigma_p = 6.037%
recomputed     = 6.036959% — MATCH

target L = 10.00% / 6.037% = 1.656x
recomputed L = 1.656463x — MATCH

Expected sleeve returns with r_f=4.0%, SR=0.30:
target = [8.80%, 5.80%, 8.50%, 9.40%]
recomputed = [8.8000%, 5.8000%, 8.5000%, 9.4000%]
MATCH

Weighted r_p:
target = 7.415%
recomputed = 7.415020% — MATCH after rounding

Net return / Sharpe table:
Unlevered:
target r_net=7.415%, sigma=6.037%, Sharpe=0.566
recomputed r_net=7.415020%, sigma=6.036959%, Sharpe=0.565685 — MATCH

Levered @ r_f:
target r_net=9.657%, sigma=10.000%, Sharpe=0.566
recomputed r_net=9.656854%, sigma=10.000000%, Sharpe=0.565685 — MATCH

Levered @ r_f + 25 bp:
target r_net=9.493%, sigma=10.000%, Sharpe=0.549
recomputed r_net=9.492738%, sigma=10.000000%, Sharpe=0.549274 — MATCH

Levered @ r_f + 50 bp:
target r_net=9.329%, sigma=10.000%, Sharpe=0.533
recomputed r_net=9.328623%, sigma=10.000000%, Sharpe=0.532862 — MATCH

Levered @ r_f + 100 bp:
target r_net=9.000%, sigma=10.000%, Sharpe=0.500
recomputed r_net=9.000391%, sigma=10.000000%, Sharpe=0.500039 — MATCH

Sharpe drag:
25 bp target = 1.64 pp
recomputed = 0.565685 - 0.549274 = 0.016412 = 1.641 pp — MATCH
100 bp target = 6.56 pp
recomputed = 0.565685 - 0.500039 = 0.065646 = 6.565 pp — MATCH

Chart data (§ 8c):
target data = [0.566, 0.566, 0.549, 0.533, 0.500]
recomputed rounded Sharpe = [0.566, 0.566, 0.549, 0.533, 0.500]
MATCH

Margin buffer:
target = 5% × 0.656 = 3.28% NAV
exact L-1 = 0.656463; 5% × 0.656463 = 3.2823% NAV
MATCH after rounding

Additional ERC check for § 5 line 53 claim:
inverse-vol weights = [17.7866%, 47.4308%, 18.9723%, 15.8103%]
inverse-vol risk contributions = [21.11%, 14.44%, 33.33%, 31.11%]
true ERC weights = [18.2955%, 54.4730%, 14.3149%, 12.9166%]
weight gap vs inverse-vol = [+0.51 pp, +7.04 pp, -4.66 pp, -2.89 pp]
target claim "gap is <2 pp per weight" — MISMATCH
```

## Quote fidelity table

| Quote # | Cited page | Actual printed page (per browser PDF preview / screenshot) | Word-for-word match? | Notes |
|---------|------------|-------------------------------------------------------------|----------------------|-------|
| Q1 — Engineering Targeted Returns, line 10 | p. 4 | p. 4 | YES with explicit internal elision | The quoted leverage passage appears on printed p. 4. Target omits initial words from the sentence but the core text and `[ … ]` internal elision are faithful. |
| Q2 — Engineering Targeted Returns, line 13 | p. 11 | p. 11 | NO | Source sentence ends with `(which we think is too much)` after "average U.S. bank employs"; target omits that parenthetical without `[…]` and adds a period. R12 fail. |
| Q3 — Our Thoughts about Risk Parity and All Weather, line 16 | p. 1 | p. 1 | YES with explicit internal elision | The quoted risk-parity definition appears on printed p. 1. |
| Q4 — Our Thoughts about Risk Parity and All Weather, line 19 | p. 2 | p. 2 | PARTIAL | The substantive text appears on printed p. 2, but the source begins "On the other hand, if you lever up..." and the target starts at "if you lever up..." without an initial elision. Not charged separately because F3 already captures the R12 elision-control failure. |
| Q5 — Our Thoughts about Risk Parity and All Weather, line 75 outside § 2 | p. 9 | p. 9 | YES | The rebalance quote appears on printed p. 9. |

## Verdict

**REJECT-re-spawn**

## Summary

This target fails the audit. The arithmetic inside the § 7 funding and volatility example mostly recomputes correctly, but the report has blocking source-integrity problems: the FRED gold series is no longer available and redirects to a deletion notice; the Yahoo `^BCOM` endpoint returned 429 rather than data; and at least one Dalio/Bridgewater quote is not a faithful verbatim quote because it silently omits source text without an explicit elision.

The biggest substantive modeling defect is the inverse-vol vs true-ERC claim. The report asserts the § 7 inverse-vol portfolio is within `<2 pp` of ERC, but Python recomputation shows a maximum weight gap of about 7.04 pp and materially unequal risk contributions. Recommended next action: re-spawn the report, replace broken data sources, repair quote fidelity, add point-of-use DERIVED markers around the worked example, and either solve true ERC or stop calling the illustrative inverse-vol weights equal-risk-contribution weights.
