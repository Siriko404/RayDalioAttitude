# 2.3 Alpha Generation & Portable Alpha

## § 1 Executive Summary

Dalio splits portfolio return into three mechanically-separable streams — cash, beta, alpha — and argues the second-order lever is the *number and correlation* of alpha bets, not the skill per bet. The correlation-adjusted fundamental law (IR ≈ IR_slice · √N / √[1 + (N−1)ρ]) shows IR scaling roughly 2–4× when uncorrelated bets replace a clustered equity-manager stack. "Portable alpha" means overlaying that diversified alpha book on any chosen beta (index futures, All-Weather). Section 7 reproduces Dalio's own Alpha Portfolio 1 vs 2 chart numerically. Operational thresholds flagged where Dalio gives only examples.

## § 2 Dalio's Framework — Verbatim

> **Dalio** — source: "Engineering Targeted Returns and Risks", p. 2 (Bridgewater, Aug 2011):
> "PMPT differs in three key ways: first, returns from alpha and beta are separated; second, the sizes of alpha and beta are altered to more desirable levels; and finally, far more diversified portfolios of each are derived."

> **Dalio** — source: "Engineering Targeted Returns and Risks", p. 3:
> "Betas are limited in number […], they are typically relatively correlated with each other, and their excess returns are relatively low compared to their excess risks, with Sharpe ratios typically ranging from 0.2 to 0.3."

> **Dalio** — source: "Engineering Targeted Returns and Risks", p. 3:
> "Alphas […] are different. Sources of alpha are numerous and relatively uncorrelated with each other. However, their returns are unreliable, with risk-adjusted returns slightly negative on average […]."

> **Dalio** — source: "Engineering Targeted Returns and Risks", printed p. 8:
> "There are two ways an Optimal Alpha Portfolio can be created. The first […] is via alpha overlay; the second is to create a portfolio of different alphas, regardless of the asset classes in which they are generated. In both cases, alpha is independent from beta and is overlaid on the beta."

> **Dalio** — source: "Engineering Targeted Returns and Risks", p. 9, para under Chart 5:
> "We have found that, by following this general approach, information ratios can increase by factors of two to four times."

> **Bridgewater** — source: "The All Weather Story", p. 4 (2012):
> "return = cash + beta + alpha"

## § 3 Decision Problem

What is the maximum risk-adjusted return a PM can manufacture from one forecasting edge, and on which beta should that alpha be transported? The PM must answer: (a) breadth N; (b) pairwise bet correlation ρ; (c) per-slice skill IR_slice; (d) client tracking-error target; (e) which beta (S&P 500, All-Weather, Treasury duration) to replicate. Leverage sizing (turning 3% tracking error into a 10% return) belongs to § 2.4.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| RF (cash rate) | "Market Yield on U.S. Treasury Securities at 3-Month Constant Maturity, Quoted on an Investment Basis" | % p.a. | FRED (Board of Governors H.15) | `https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO` | daily | 0 – 6 |
| Mkt-RF (equity beta benchmark) | Value-weighted CRSP U.S. equity return minus 1-month T-bill (Fama/French factor) | % / month | Ken French Data Library | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip` | monthly | −20 to +15 |
| SMB, HML, Mom | Size, value, momentum factor returns (for alpha attribution / residualization) | % / month | Ken French Data Library | same zip archive family (`F-F_Research_Data_Factors_CSV.zip`, `F-F_Momentum_Factor_CSV.zip`) | monthly | −10 to +10 |
| σ_Alpha (alpha volatility / tracking error) | Ex-ante standard deviation of the PM's return stream net of its beta benchmark | % p.a. | internally estimated from trade blotter; no public API (§ 10 Q5) | n/a — manager-proprietary | weekly | 2 – 15 |
| IC (information coefficient) | Cross-sectional Spearman ρ between PM's ex-ante forecast and realized forward return, per decision period | dimensionless ∈ [−1, 1] | internally estimated from forecast log; no public API (§ 10 Q5) | n/a — manager-proprietary | monthly | 0.02 – 0.10 |
| N (breadth) | Number of *independent* bets per year (asset-times-time blocks after correlation collapse) | count / year | internally computed; Fama/French residuals test independence; no public API (§ 10 Q5) | n/a — manager-proprietary | annual | 10 – 500 |
| ρ_avg (average pairwise bet correlation) | Mean pairwise Pearson ρ of the PM's N bet P&L streams | dimensionless ∈ [−1, 1] | internally computed from trade P&L series; no public API (§ 10 Q5) | n/a — manager-proprietary | monthly | 0.00 – 0.40 |

> **DERIVED (operational)** — The last four rows (σ_Alpha, IC, N, ρ_avg) have no public API because alpha inputs are manager-proprietary by construction; Dalio labels alpha "the value added by managers, which is derived from managers deviating from the betas" (Engineering …, p. 3). Public hedge-fund index data (HFR, Credit Suisse LAB, Barclay) is subscription-gated as of April 2026 and is not used here.

## § 5 Computation / Transformations

**Step 1 — decompose the total return.** Per Bridgewater's identity:

$$r_{total} = r_{cash} + \beta \cdot (r_{benchmark} - r_{cash}) + \alpha$$

where β is estimated by rolling 36-month OLS of r_total on (r_benchmark − r_cash), and α is the residual mean.

> **Dalio** — "return = cash + beta + alpha" (All Weather Story, p. 4).

**Step 2 — compute per-slice skill.** Grinold's fundamental law (a standard, dating to Grinold 1989) gives the per-slice information ratio:

$$IR_{slice} = IC \cdot \sqrt{n_{dec}}$$

where n_dec is the number of independent decisions *within* a slice (one strategy) per year.

> **NON-DALIO (industry standard)** — source: Grinold, R. (1989) "The Fundamental Law of Active Management," *Journal of Portfolio Management* 15(3). Formula as summarized by Corporate Finance Institute, https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/fundamental-law-of-active-management/ (verified April 2026). Used to close a gap because Dalio does not state the n_dec half of the law.

**Step 3 — aggregate to portfolio IR under correlation.** With N slices and average pairwise correlation ρ_avg:

$$IR_{port} = IR_{slice} \cdot \frac{\sqrt{N}}{\sqrt{1 + (N-1) \cdot \rho_{avg}}}$$

Collapses to IR_slice·√N when ρ_avg = 0 and to IR_slice when ρ_avg = 1.

> **DERIVED (operational)** — The correlation-adjustment wrapper is standard portfolio algebra; Dalio's Chart 5 on p. 8 of Engineering … uses exactly this relation when he shows "Implied IR" rising from 0.6 to 1.4 as N goes 6 → 77 and ρ goes 0.25 → 0.04 (arithmetic reproduced in § 7).

**Step 4 — port the alpha.** Total portfolio return:

$$r_{client} = r_{cash} + w_\beta \cdot (r_{benchmark\,chosen} - r_{cash}) + w_\alpha \cdot r_{alpha\,book}$$

w_β picks the beta; w_α is scaled by the client's tracking error. Beta and alpha decided *independently*.

> **Dalio** — "each client chooses its beta and benchmark, which we replicate and then overlay with our own Optimal Alpha Portfolio. The client specifies a targeted tracking error (risk) for the alpha" (Engineering …, p. 8).

## § 6 Output Variables & Decision Rules

| Regime | Signal | Action |
|---|---|---|
| Over-concentrated alpha | N_eff = N / [1 + (N−1)ρ_avg] < 6 | Add uncorrelated strategies or residualize against Fama/French factors until N_eff ≥ 6 |
| Clustered bets | ρ_avg > 0.20 | Cut the most-correlated slice or short-overlap it against the common factor |
| Good per-slice skill | IR_slice ≥ 0.30 | Eligible for the alpha book |
| Insufficient per-slice skill | IR_slice < 0.15 | Retire the strategy — cannot be rescued by breadth |
| Post-publication decay detected | out-of-sample IR_slice < 0.65 · in-sample IR_slice, on a known academic anomaly | Discount the strategy's sizing by ≥35% or retire |

> **DERIVED (operational)** — IR_slice < 0.15 as the retirement floor is stipulated; Dalio's Chart 5 uses IR_slice = 0.35 as the illustration but sets no explicit minimum. This edge is not in Dalio's text.
>
> **DERIVED (operational)** — The N_eff < 6 rule stipulates 6 as an edge; Dalio's Chart 5 Portfolio 1 uses N = 6 as the *low-diversification illustration* (Implied IR 0.6) and N = 77 as the *well-diversified case* (Implied IR 1.4). I am picking 6 as the minimum target — this edge is not in Dalio's text.
>
> **DERIVED (operational)** — ρ_avg > 0.20 flagged as clustered. Dalio's Chart 5 labels ρ = 0.25 as the "poor" portfolio and ρ = 0.04 as the "optimal" one; I am stipulating 0.20 as the boundary — this edge is not in Dalio's text.
>
> **DERIVED (operational)** — IR_slice ≥ 0.30 as eligibility. Dalio's Chart 5 footnote specifies "the average information ratio of each slice of both pies is 0.35" (Engineering …, p. 8); 0.30 is a looser edge, not in Dalio's text.
>
> **NON-DALIO (industry standard)** — Post-publication decay threshold ≥35%: source is McLean & Pontiff (2016) "Does Academic Research Destroy Stock Return Predictability?" Abstract states: "the average post-publication decay […] is about 35%" (October 2012 working-paper version, HEC Montréal mirror, https://www.hec.ca/finance/Fichier/McLean.pdf). Used to close a gap because Dalio's 2011 note does not quantify alpha-decay magnitude for academic anomalies.

**Portable-alpha overlay recipe (operational).** Given the alpha book's IR_port and σ_Alpha (client-specified tracking error, e.g. 4% p.a.), the overlay sizing is:

1. Replicate the client-chosen beta synthetically (S&P 500 e-mini futures, Treasury futures strip, or an All-Weather-style balanced futures basket) to match the cash beta exposure at zero net capital outlay beyond margin.
2. Deploy the alpha book at notional such that realized tracking error equals σ_Alpha. Expected incremental return = IR_port · σ_Alpha.
3. Total expected return ≈ r_cash + (r_benchmark − r_cash) + IR_port · σ_Alpha.

> **Dalio** — "when Bridgewater provides alpha overlay, each client chooses its beta and benchmark, which we replicate and then overlay with our own Optimal Alpha Portfolio" (Engineering …, p. 8).

## § 7 Worked Numeric Example

*Illustrative — numbers drawn from Dalio's Chart 5 on printed p. 8 of "Engineering Targeted Returns and Risks" (Bridgewater, Aug 2011).*

| Portfolio | N (slices) | ρ_avg | IR_slice (as stated) | Implied IR (Dalio chart) | Implied IR (recomputed) |
|---|---|---|---|---|---|
| 1 (clustered) | 6 | 0.25 | 0.35 | 0.6 | 0.571 |
| 2 (diversified) | 77 | 0.04 | 0.35 | 1.4 | 1.528 |

**Row-by-row recomputation** (correlation-adjusted law, § 5 Step 3):

*Portfolio 1:* IR_port = 0.35 · √6 / √(1 + 5·0.25) = 0.35 · 2.449 / √2.250 = 0.35 · 2.449 / 1.500 = 0.5715 → rounds to **0.6** ✓ (matches Dalio's chart).

*Portfolio 2:* IR_port = 0.35 · √77 / √(1 + 76·0.04) = 0.35 · 8.775 / √4.040 = 0.35 · 8.775 / 2.010 = 1.5280 → rounds to **1.5**, while Dalio's chart states **1.4**.

**R14 discrepancy note:** Reproducing Dalio's IR = 1.4 from the stated (N = 77, IR_slice = 0.35) requires ρ_avg = ((0.35·√77/1.4)² − 1) / 76 = (2.1938² − 1) / 76 = 0.0502. So Dalio's chart legend rounds ρ ≈ 0.05 down to 0.04, or rounds IR 1.528 down to 1.4. The qualitative point — ~2.5× IR improvement via breadth + decorrelation, consistent with Dalio's "factors of two to four times" statement on p. 8 — is unchanged. Structural ratios: chart values 1.4 / 0.6 = 2.33×; recomputed 1.528 / 0.571 = 2.67× — both inside Dalio's "two to four times" range.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// Correlation-adjusted fundamental law of active management (Dalio/Grinold).
// Returns the portfolio information ratio given slice inputs.
export function portfolioIR(irSlice, n, rhoAvg) {
  if (n < 1 || rhoAvg < -1 || rhoAvg > 1) throw new RangeError("bad input");
  const num   = Math.sqrt(n);
  const denom = Math.sqrt(1 + (n - 1) * rhoAvg);
  return irSlice * num / denom;
}

// Effective breadth — how many truly independent bets the correlated stack is worth.
export function effectiveBreadth(n, rhoAvg) {
  return n / (1 + (n - 1) * rhoAvg);
}

// Cash rate (RF) for return-decomposition Step 1.
// FRED CSV observation endpoint (no key needed for CSV).
export async function fetchDGS3MO() {
  const url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS3MO";
  const resp = await fetch(url);
  return await resp.text();  // CSV: DATE, DGS3MO (percent p.a.)
}

// Equity beta benchmark (Mkt-RF) for the beta/alpha split.
export async function fetchFFFactors() {
  const url = "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip";
  const resp = await fetch(url);
  return await resp.arrayBuffer();  // Unzip → CSV: Date, Mkt-RF, SMB, HML, RF
}

// Example wiring: Dalio's Chart 5 worked example.
const p1 = portfolioIR(0.35,  6, 0.25);  // ≈ 0.571
const p2 = portfolioIR(0.35, 77, 0.04);  // ≈ 1.528
```

### 8b. Excel — sheet layout, Power Query M, key formulas

Sheet **Inputs**:

| Cell | Label | Value |
|---|---|---|
| B2 | IR_slice | 0.35 |
| B3 | N | 77 |
| B4 | rho_avg | 0.04 |

Sheet **Calc**:

| Cell | Formula | Output |
|---|---|---|
| B7 | `=B2*SQRT(B3)/SQRT(1+(B3-1)*B4)` | Implied IR |
| B8 | `=B3/(1+(B3-1)*B4)` | Effective breadth N_eff |
| B9 | `=IF(B8<6,"CLUSTERED — add decorrelation","OK")` | Rule flag |

Sheet **PQ_FRED** (Power Query M) — pulls DGS3MO daily and computes a monthly RF:

```m
let
    Source   = Csv.Document(
                 Web.Contents("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS3MO"),
                 [Delimiter=",", Columns=2, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    Typed    = Table.TransformColumnTypes(Promoted,
                 {{"DATE", type date}, {"DGS3MO", type number}}),
    Clean    = Table.SelectRows(Typed, each [DGS3MO] <> null),
    WithYM   = Table.AddColumn(Clean, "YearMonth", each Date.ToText([DATE], "yyyy-MM"), type text),
    Monthly  = Table.Group(WithYM,
                 {"YearMonth"},
                 {{"RF_monthly_pct", each List.Average([DGS3MO])/12, type number}})
in
    Monthly
```

### 8c. ECharts config — chart type, encoding, palette tokens

DARK THEME. Bar chart comparing Dalio Chart 5 Portfolio 1 (clustered, short green) vs Portfolio 2 (diversified, long green), with the recomputed-value marker in warm accent. Numbers match § 7 to one decimal.

```js
option = {
  backgroundColor: "#0B0B0B",
  textStyle: { color: "#F5F5F5" },
  title: {
    text: "Alpha Portfolio IR — Dalio Chart 5 reproduction",
    subtext: "IR_slice = 0.35 for both portfolios",
    textStyle: { color: "#F5F5F5" },
    subtextStyle: { color: "#A3A3A3" }
  },
  grid: { backgroundColor: "#141414", borderColor: "#262626", show: true },
  xAxis: {
    type: "category",
    data: ["P1: N=6, rho=0.25", "P2: N=77, rho=0.04"],
    axisLine: { lineStyle: { color: "#6B7280" } },
    axisLabel: { color: "#A3A3A3" }
  },
  yAxis: {
    type: "value",
    name: "Portfolio IR",
    nameTextStyle: { color: "#A3A3A3" },
    axisLine: { lineStyle: { color: "#6B7280" } },
    axisLabel: { color: "#A3A3A3" },
    splitLine: { lineStyle: { color: "#262626" } }
  },
  series: [
    {
      name: "Dalio chart value (rounded)",
      type: "bar",
      data: [0.6, 1.4],
      itemStyle: { color: "#00D08C" },
      label: { show: true, position: "top", color: "#F5F5F5" }
    },
    {
      name: "Recomputed from stated inputs",
      type: "bar",
      data: [0.571, 1.528],
      itemStyle: { color: "#D4A373" },
      label: { show: true, position: "top", color: "#F5F5F5", formatter: v => v.value.toFixed(3) }
    },
    {
      name: "IR_slice (reference)",
      type: "line",
      data: [0.35, 0.35],
      lineStyle: { color: "#E5484D", type: "dashed" },
      symbol: "none"
    }
  ],
  legend: { textStyle: { color: "#A3A3A3" }, top: 40 }
};
```

## § 9 Integration Points

**Upstream (inputs this subsection requires):**
- § 2.1 Template for Investing — supplies the "uncorrelated return streams" frame; this subsection operationalizes the per-bet math behind it.
- § 2.2 All-Weather (Beta) Portfolio — supplies the beta onto which alpha is overlaid when a client chooses All-Weather as their benchmark.
- § 2.5 Stress-Testing — supplies the scenario paths against which the aggregated alpha+beta book is tested.

**Downstream (consumers of this subsection's outputs):**
- § 2.4 Risk Parity & Leverage — takes σ_Alpha and w_α as inputs to set leverage such that total portfolio vol hits the client's target.
- Portfolio-construction layer — takes the alpha book's IR_port and correlation with the beta book to compute the combined Sharpe of the full "Optimal Portfolio" (Bridgewater's term, "Our Thoughts About Risk Parity and All Weather", 2015).

## § 10 Open Questions, Limitations, Sources

**Open questions / ambiguities in Dalio's public writing:**
1. **Breadth for a macro shop.** Chart 5 uses N = 77 without defining an independent bet for a global-macro manager. Stock-picker = stock-month; macro is less obvious. Dalio does not resolve.
2. **Correlation window.** Dalio cites ρ = 0.04 for P2 without sample window or ex-ante vs ex-post. Chart's stated IR 1.4 implies ρ = 0.050 (see § 7); chart legend rounds one of the two.
3. **Alpha decay.** Engineering Targeted Returns (2011) does not quantify decay for individual alpha sources; 35% threshold in § 6 is McLean & Pontiff (2016), not Dalio.
4. **Tracking error calibration.** Dalio cites "one client might choose a 3% tracking error while another might choose 6%" (p. 9) as *examples*, not anchors.
5. **Public-data gap.** IC, N, ρ_avg, σ_Alpha have no public API by construction; HFR, Credit Suisse LAB, Barclay require paid subscriptions as of April 2026.

**Limitations:**
- Grinold's 1989 *JPM* paper is paywalled (R8); formula cited via CFI's description page and book-length elaboration (Grinold & Kahn, *Active Portfolio Management*, 2nd ed., 2000; commercial — cited, not quoted, per R9).
- Leverage sizing to turn tracking-error 3% into a 10% target is out of scope (§ 2.4).

**Sources cited:**
- Dalio, R. (2011), "Engineering Targeted Returns and Risks" (Bridgewater Associates, August 2011), https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf.
- Bridgewater Associates (2012), "The All Weather Story", https://www.bridgewater.com/_document/the-all-weather-story?id=00000171-8623-d7de-affd-feaf4ee20000.
- Bridgewater Associates (2015), "Our Thoughts About Risk Parity and All Weather" (Dalio, Prince, Jensen), https://www.ahwilliamsco.com/includes/OurThoughtsaboutRiskParityandAllWeather.pdf (advisor-hosted mirror).
- Grinold, R. (1989), "The Fundamental Law of Active Management", *Journal of Portfolio Management* 15(3). Commercial/paywalled — cited but not quoted per R9. Free summary of the formula: Corporate Finance Institute, https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/fundamental-law-of-active-management/ (verified April 2026).
- Grinold, R. and Kahn, R. (2000), *Active Portfolio Management*, 2nd ed., McGraw-Hill. Commercial — cited only.
- McLean, R. D. and Pontiff, J. (2016), "Does Academic Research Destroy Stock Return Predictability?", *Journal of Finance* 71(1): 5–32. Free working-paper version: https://www.hec.ca/finance/Fichier/McLean.pdf (HEC Montréal mirror, verified April 2026).
- Federal Reserve Bank of St. Louis, FRED series DGS3MO, "Market Yield on U.S. Treasury Securities at 3-Month Constant Maturity, Quoted on an Investment Basis", https://fred.stlouisfed.org/series/DGS3MO (source: Board of Governors H.15).
- French, K. R., Data Library, "Fama/French 3 Factors" (Mkt-RF, SMB, HML, RF), https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/Data_Library/f-f_factors.html; CSV at https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip (verified April 2026).
