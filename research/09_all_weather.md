# 2.2 All-Weather (Beta) Portfolio

## § 1 Executive Summary

All-Weather is a static, risk-weighted beta portfolio engineered to deliver similar risk across four macro environments: growth up, growth down, inflation up, inflation down. It does not forecast the next environment; it allocates equal risk to all four. Dalio's retail "All Seasons" recipe — 30% stocks, 40% long Treasuries, 15% intermediate Treasuries, 7.5% gold, 7.5% commodities — is the canonical split. This document operationalizes that split: inputs, the risk-contribution formula, drift thresholds, a worked example, and JS / Excel / ECharts specs.

## § 2 Dalio's Framework — Verbatim

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com, https://www.bridgewater.com/research-and-insights/the-all-weather-story:
> "what kind of investment portfolio would you hold that would perform well across all environments"

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com:
> "economic scenarios can be broken down to four. There are all sorts of surprises in markets, but the general pattern of surprises follows this framework"

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com:
> "holding four different portfolios each with the same risk, each of which does well in a particular environment: when (1) inflation rises, (2) inflation falls, (3) growth rises, and (4) growth falls"

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com:
> "The key was to put equal risk on each scenario to achieve balance."

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com:
> "low-risk/low-return assets can be converted into high-risk/high-return assets."

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com:
> "Bonds will perform best during times of disinflationary recession, stocks will perform best during periods of … growth, and cash will be the most attractive when money is tight."

## § 3 Decision Problem

Given four environments (growth up, growth down, inflation up, inflation down) and an explicit refusal to forecast which is next: what **static** capital allocation equalizes risk contribution across those four?

This subsection answers *how to structure the beta sleeve*. Out of scope: (a) regime detection — Module 1; (b) leverage sizing — 2.4; (c) alpha overlay — 2.3. Output: target capital weights plus a drift monitor. A PM with those plus a rebalance calendar runs the sleeve without any macro call.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `ret_spx` | US large-cap stock returns | decimal | FRED | `series_id=SP500` | daily | −12% to +12% |
| `ret_tlt` | Long UST (20–30y) price return | decimal | FRED | `series_id=DGS20` or `DGS30` | daily | −3% to +3% |
| `ret_ief` | Intermediate UST (7–10y) price return | decimal | FRED | `series_id=DGS10` | daily | −1.5% to +1.5% |
| `ret_gold` | Gold spot, London PM fix | USD/oz | FRED | `series_id=GOLDPMGBD228NLBM` | daily | 250–3000 |
| `ret_comm` | Broad commodities index (BCOM) | index | Stooq | `https://stooq.com/q/d/?s=%5Ebcom&i=d` | daily | 50–350 |
| `vol_i_252` | 252-day annualized vol per sleeve | % | derived | `STDEV(ret_i)*SQRT(252)` | daily | 4%–35% |
| `corr_matrix` | 5×5 Pearson correlation matrix | unitless | derived | Pearson on returns | daily | −0.5 to +0.7 |
| `w_target` | Target weights 30/40/15/7.5/7.5 | % | Dalio via Robbins (2014) | constant | static | see § 6 |
| `w_current` | Current portfolio weights | % | custodian/OMS | IBKR `/portfolio/{accountId}/positions` | intraday | 0%–100% |
| `cpi_yoy` | Headline CPI YoY (historical labelling) | % | BLS via FRED | `series_id=CPIAUCSL` | monthly | −2% to 15% |
| `gdp_yoy` | Real GDP YoY (historical labelling) | % | BEA via FRED | `series_id=GDPC1` | quarterly | −5% to 8% |

## § 5 Computation / Transformations

**Core identities.** $\sigma_i = \sqrt{252} \cdot \mathrm{stdev}(r_{i,t})$ over trailing 252 days. $\Sigma_{ij} = \sigma_i \sigma_j \rho_{ij}$. $\sigma_p = \sqrt{w^\top \Sigma w}$. $\mathrm{RC\%}_i = w_i (\Sigma w)_i / \sigma_p^2$ (sums to 100%).

**Environment bucket mapping (static, not forecasting).** Each asset is tagged per Dalio:

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com: "Bonds will perform best during times of disinflationary recession, stocks will perform best during periods of … growth, and cash will be the most attractive when money is tight."

Environmental bias matrix $B$ used below has entries in $\{+1, 0, -1\}$: +1 = asset is a "winner" in that environment, −1 = "loser", 0 = neutral. Columns are the 4 Dalio boxes; rows are the 5 sleeves.

> **DERIVED (operational)** — the +1/0/−1 entries paraphrase Dalio's directional prose; Dalio/Bridgewater do not publish a formal sign table. The zeros and overlap cases (Equities = +1 in both Growth-up and Inflation-down) are author operationalizations.

| Asset | Growth up | Growth down | Inflation up | Inflation down |
|---|---|---|---|---|
| Equities | +1 | −1 | 0 | +1 |
| Long Treasuries | 0 | +1 | −1 | +1 |
| Intermediate Treasuries | 0 | +1 | −1 | +1 |
| Gold | 0 | 0 | +1 | 0 |
| Commodities | +1 | −1 | +1 | 0 |

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com: "holding four different portfolios each with the same risk, each of which does well in a particular environment: when (1) inflation rises, (2) inflation falls, (3) growth rises, and (4) growth falls"

**Environment-risk check.** For each environment *e*, $\mathrm{RC}^{env}_e = \sum_{i:B_{i,e}=+1} \mathrm{RC}_i$ (sum over that environment's "+1" winners). Because assets can be +1 winners in multiple environments, these four values are **not disjoint and do not sum to 100%** — read as "winning-sleeve RCs per environment." Target: each within ±25% of their mean. Canonical 30/40/15/7.5/7.5 weights approximate this without leverage; true equalization requires leverage (out of scope — 2.4).

> **DERIVED (operational)** — ±25% of the mean is the author's tolerance for flagging imbalance; Dalio does not publish a numeric band.

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com: "The key was to put equal risk on each scenario to achieve balance."

**Rebalancing rule.** Drift = $\|w_{\text{current}} - w_{\text{target}}\|_\infty$; rebalance when drift exceeds the § 6 band.

## § 6 Output Variables & Decision Rules

**Target capital weights** (the single most important output of this subsection):

> **Dalio** — source: Tony Robbins, "MONEY: Master the Game" (2014), reprinted at tonyrobbins.com, https://www.tonyrobbins.com/blog/the-end-of-the-bull-market: "30% in stocks — for instance, the S&P 500 or other indexes … 15% in immediate term (seven- to ten-year Treasuries) … 40% in long-term bonds (20- to 25-year Treasuries) … 7.5% in gold … 7.5% in commodities"

| Sleeve | Weight | Instrument class | Primary environmental bias |
|---|---|---|---|
| US large-cap equities | 30.0% | SPX / VTI / VOO | Growth up, Inflation down |
| Long US Treasuries (20–25y) | 40.0% | TLT / GOVT-long | Growth down, Inflation down |
| Intermediate US Treasuries (7–10y) | 15.0% | IEF | Growth down, Inflation down |
| Gold | 7.5% | GLD / IAU / physical | Inflation up |
| Commodities (broad) | 7.5% | BCOM / DBC / PDBC | Growth up, Inflation up |

**Drift bands.** Dalio does not publish rebalance thresholds; bands below anchor on industry practice:

> **NON-DALIO (industry standard)** — source: Zilbering, Jaconetti, and Kinniry, "Best Practices for Portfolio Rebalancing," Vanguard Research, November 2015. Vanguard CDN URL currently 404; working mirror: https://www.financieelonafhankelijkblog.nl/wp-content/uploads/2021/11/Vanguard-ISGPORE.pdf. Page-1 bullet, verbatim: "Vanguard research has found that there is no optimal frequency or threshold for rebalancing, since risk-adjusted returns do not differ meaningfully from one rebalancing strategy to another." Paper's threshold strategies use "1%, 5%, or 10%" absolute-drift thresholds (p. 7).

> **DERIVED (operational)** — the 5% RED cutoff tracks Vanguard; the 3% GREEN/AMBER boundary is the author's own choice between Vanguard's 1% and 5% ticks, not in the Vanguard paper.

Operational rules:

- **GREEN (no action):** every sleeve within ±3% absolute of target weight.
- **AMBER (review):** any sleeve drifted 3%–5% absolute. Log, schedule next calendar rebalance.
- **RED (rebalance now):** any sleeve drifted >5% absolute, or portfolio ex-ante vol outside a ±25% band around the long-run target. Trade back to target weights.

> **DERIVED (operational)** — the ±25% ex-ante-vol band is an author-stipulated operational tolerance distinct from the § 5 environment-risk band; Dalio does not publish a vol-deviation threshold.

**Risk-contribution health check.** Compute $\mathrm{RC}^{env}_e$ for each of the 4 environments. If max/min ratio exceeds 1.5×, flag as *environmentally unbalanced* (typically a vol regime shift — e.g., bond vol spike 2022). Do not override canonical weights from this flag alone; surface for PM judgment.

> **DERIVED (operational)** — the 1.5× max/min RC cutoff is an author heuristic; Dalio does not publish an imbalance ratio.

## § 7 Worked Numeric Example

Illustrative numbers (end-of-April-2026 style):

| Sleeve | $w_i$ | $\sigma_i$ (ann.) |
|---|---|---|
| Equities (SPX) | 30.0% | 16.0% |
| Long Treasuries | 40.0% | 13.0% |
| Intermediate Treasuries | 15.0% | 6.0% |
| Gold | 7.5% | 15.0% |
| Commodities | 7.5% | 18.0% |

Illustrative correlation matrix $\rho$ (rows/cols same order):

|  | SPX | LT | IT | Gold | Comm |
|---|---|---|---|---|---|
| SPX | 1.00 | −0.20 | −0.15 | 0.05 | 0.25 |
| LT | −0.20 | 1.00 | 0.90 | 0.15 | −0.10 |
| IT | −0.15 | 0.90 | 1.00 | 0.10 | −0.05 |
| Gold | 0.05 | 0.15 | 0.10 | 1.00 | 0.35 |
| Comm | 0.25 | −0.10 | −0.05 | 0.35 | 1.00 |

**Step 1 — Capital-vol contributions ($w_i \sigma_i$, %):** SPX 4.80, LT 5.20, IT 0.90, Gold 1.125, Comm 1.35. Stocks and long bonds are ~equal at ~5 despite 30% vs 40% capital — capital is skewed to bonds so risk lines up with equities.

**Step 2 — Portfolio vol.** Compute $\Sigma_{ij} = \sigma_i \sigma_j \rho_{ij}$, then $\sigma_p^2 = w^\top \Sigma w$ (values below scaled by $10^4$). Diagonal $w_i^2 \sigma_i^2$ terms: $23.04 + 27.04 + 0.81 + 1.27 + 1.82 = 53.98$. Off-diagonal $2 w_i w_j \sigma_i \sigma_j \rho_{ij}$ terms sum to $+2.42$ (largest: LT–IT $+8.42$, SPX–LT $-9.98$, SPX–Comm $+3.24$). Total $56.40$; $\sigma_p = \sqrt{56.40 \times 10^{-4}} = 7.510\%$ annualized.

**Step 3 — Percent risk contribution** $\mathrm{RC\%}_i = w_i (\Sigma w)_i / \sigma_p^2$. With $\sigma_p^2 = 56.40 \times 10^{-4}$, and $(\Sigma w)_i$ quoted scaled by $10^4$:

| Sleeve | $(\Sigma w)_i \times 10^4$ | $w_i (\Sigma w)_i \times 10^4$ | $\mathrm{RC\%}_i$ |
|---|---|---|---|
| SPX | 64.30 | 19.29 | 34.20% |
| LT | 66.09 | 26.44 | 46.87% |
| IT | 29.43 | 4.41 | 7.83% |
| Gold | 40.61 | 3.05 | 5.40% |
| Comm | 42.82 | 3.21 | 5.69% |
| **Sum** | — | **56.40** | **100.00%** |

Reproducible via `rc = w * (Sigma @ w) / (w @ Sigma @ w)` with § 7 inputs; sum = 100.00% per R14.

**Step 4 — Environment risk aggregation** (§ 5 $B$ matrix, "+1" entries only). The matrix has designed-in overlap, so these values are the **sum of winning-sleeve RCs per environment** — not a partition, and they do not sum to 100%:

- Growth up: SPX (34.20%) + Comm (5.69%) = **39.89%**
- Growth down: LT (46.87%) + IT (7.83%) = **54.70%**
- Inflation up: Gold (5.40%) + Comm (5.69%) = **11.09%**
- Inflation down: SPX (34.20%) + LT (46.87%) + IT (7.83%) = **88.90%**

At unleveraged canonical weights and this covariance, inflation-down/growth-down attract the largest risk share — bond-heavy in risk terms. The structural fix (leverage) belongs to 2.4; here the PM just recognizes the imbalance and hands off.

**Step 5 — Drift check.** Actuals 33/37/15/7.5/7.5. Max drift = max(3, 3, 0, 0, 0) = 3.0%. Under § 8a's strict-`<` logic, 3.0% is AMBER — log, rebalance on calendar.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
const TARGET = { spx: 0.30, lt: 0.40, it: 0.15, gold: 0.075, comm: 0.075 };
const FRED = (id) => `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${process.env.FRED_KEY}&file_type=json`;
const STOOQ = (sym) => `https://stooq.com/q/d/?s=${sym}&i=d`;

async function allWeather(current) {
  const rets = await loadReturns([
    FRED('SP500'), STOOQ('tlt.us'), STOOQ('ief.us'),
    FRED('GOLDPMGBD228NLBM'), STOOQ('%5Ebcom'),
  ]); // 252-day aligned daily log returns
  const v = vols(rets);            // sqrt(252)*stdev per column
  const R = corr(rets);            // Pearson correlation matrix
  const C = diagMulDiag(v, R, v);  // covariance = diag(v)*R*diag(v)
  const w = Object.values(TARGET);
  const Cw = matVec(C, w);
  const sigmaP = Math.sqrt(dot(w, Cw));
  const rc = w.map((wi, i) => (wi * Cw[i]) / (sigmaP * sigmaP));
  const drift = Object.fromEntries(Object.keys(TARGET).map(k => [k, current[k] - TARGET[k]]));
  const maxDrift = Math.max(...Object.values(drift).map(Math.abs));
  const band = maxDrift < 0.03 ? 'GREEN' : maxDrift < 0.05 ? 'AMBER' : 'RED';
  return { target: TARGET, rc, sigmaP, drift, band };
}
```

### 8b. Excel — sheet layout, Power Query M or URL, key formulas

Four sheets. `Data` (col A dates, B–F closes for SPX, TLT, IEF, GOLD, BCOM) via Power Query:

```M
let key = "YOUR_FRED_KEY",
    url = "https://api.stlouisfed.org/fred/series/observations?series_id=SP500&api_key=" & key & "&file_type=json",
    src = Json.Document(Web.Contents(url)),
    tbl = Table.ExpandRecordColumn(Table.FromList(src[observations], Splitter.SplitByNothing()), "Column1", {"date","value"})
in Table.TransformColumnTypes(tbl, {{"date", type date}, {"value", type number}})
```

`Returns`: `=LN(B3/B2)` across all five series. `Stats`: vols `=STDEV(col)*SQRT(252)`, correlations `=CORREL(i,j)`, covariance `=$H2*H$2*I2`. `Portfolio`: target weights in `B2:B6` (30/40/15/7.5/7.5); drift `=C2-B2`; max drift `=MAX(ABS(D2:D6))`; band `=IF(E1<0.03,"GREEN",IF(E1<0.05,"AMBER","RED"))`; portfolio vol `=SQRT(MMULT(TRANSPOSE(B2:B6),MMULT(Stats!O2:S6,B2:B6)))`; RC% `={B2*MMULT(Stats!O2:S6,B2:B6)/F2^2}` (array).

### 8c. ECharts config — chart type, encoding, palette tokens

Horizontal bar: sum of winning-sleeve RCs per environment. The § 5 $B$ matrix has overlap, so bars are not a partition.

```js
const option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5', fontFamily: 'Inter, sans-serif' },
  title: {
    text: 'All-Weather: Risk Contribution by Environment',
    textStyle: { color: '#F5F5F5' },
    subtext: 'Sum of winning-sleeve RCs per environment (non-disjoint; bars do not sum to 100%)',
    subtextStyle: { color: '#A3A3A3' },
  },
  grid: { left: 140, backgroundColor: '#141414', borderColor: '#262626' },
  xAxis: {
    type: 'value', min: 0, max: 100,
    axisLabel: { color: '#A3A3A3', formatter: '{value}%' },
    axisLine: { lineStyle: { color: '#262626' } },
    splitLine: { lineStyle: { color: '#262626' } },
  },
  yAxis: {
    type: 'category',
    data: ['Growth up', 'Growth down', 'Inflation up', 'Inflation down'],
    axisLabel: { color: '#F5F5F5' },
    axisLine: { lineStyle: { color: '#262626' } },
  },
  series: [{
    type: 'bar',
    data: [39.89, 54.70, 11.09, 88.90], // § 7 Step-4 values
    itemStyle: { color: '#00D08C' },
    emphasis: { itemStyle: { color: '#7FFFD4' } },
    markLine: {
      symbol: 'none',
      lineStyle: { color: '#E5484D', type: 'dashed' },
      data: [{ xAxis: 16.6, name: '1.5× min (§6 imbalance flag)' }],
      label: { color: '#D4A373' },
    },
  }],
  tooltip: {
    backgroundColor: '#1C1C1C',
    borderColor: '#262626',
    textStyle: { color: '#F5F5F5' },
  },
  // Inset token `#080808` reserved for card/panel backgrounds outside this chart.
  // Tertiary text `#6B7280` reserved for disabled-state labels.
};
```

## § 9 Integration Points

**Upstream dependencies.**

- **2.1 Template for Investing** — supplies the "15–20 uncorrelated return streams" philosophy; All-Weather is the beta instantiation.
- **Module 1 (1.1–1.7)** — supplies the macro grammar (growth × inflation); All-Weather does **not** consume a live regime signal, it uses the grammar statically.
- **Market data** — FRED, Stooq, BLS CPI, BEA GDP.

**Downstream consumers.**

- **2.3 Alpha Generation & Portable Alpha** — alpha sleeves ride on top of this beta.
- **2.4 Risk Parity & Leverage** — takes these canonical weights and engineers leverage that equalizes risk across environments; § 7 Step-4 shows why unleveraged All-Weather over-allocates to inflation-down/growth-down.
- **2.5 Stress-Testing** — stresses these weights.
- **Execution layer** — OMS/EMS consumes weights + drift band; trades only when § 6 band = RED.

## § 10 Open Questions, Limitations, Sources

**Open questions & limitations.**

1. **15% intermediate bonds — nominal or inflation-linked?** The only public Dalio canonical weights (via Robbins, 2014) specify "seven- to ten-year Treasuries" — nominal intermediate Treasuries, not TIPS. Bridgewater's institutional All-Weather does use inflation-linked bonds, but production weights are not public. This report defaults to nominal intermediate Treasuries per the only public Dalio-sourced number.
2. **"Equal risk" is not literal 25%-per-box.** Dalio's phrase is "equal risk on each scenario." Because the § 5 $B$ matrix has overlap, the four $\mathrm{RC}^{env}$ values are non-disjoint (§ 7 Step-4 and § 8c); "equal risk" is a directional target, not a partition arithmetic claim.
3. **Rebalancing thresholds.** Vanguard (Zilbering et al. 2015) analyzes 1% / 5% / 10% thresholds. The 5% RED cutoff tracks Vanguard; the 3% GREEN/AMBER cutoff is author-derived, sitting between Vanguard's 1% and 5% ticks — marked DERIVED at point of use in § 6.
4. **Environmental bias matrix in § 5.** The +1/0/−1 entries paraphrase Dalio's directional prose; the specific entries (zeros, overlaps) are author operationalizations marked DERIVED at point of use.
5. **Correlation regime risk.** The canonical weights were calibrated in an era of negative stock-bond correlation. The 2022 co-crash violated that assumption; Step-4 shows how sensitive the split is to covariance. Mitigation (vol-targeted leverage) belongs to 2.4.
6. **Geographic concentration.** The Robbins recipe is US-only. Bridgewater's own 2019 "Geographic Diversification Can Be a Lifesaver" argues against this; out of scope here by brief but material for implementation.

**Sources (all public, verifiable at the URL listed).**

- Bridgewater Associates, "The All Weather Story": https://www.bridgewater.com/research-and-insights/the-all-weather-story
- Bridgewater Associates, "Engineering Targeted Returns and Risks" (Aug 2011 reprint): https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf
- Tony Robbins, "The End of the Bull Market" (reprint of Dalio's All Seasons recipe from MONEY: Master the Game, 2014): https://www.tonyrobbins.com/blog/the-end-of-the-bull-market
- Meb Faber, "Chapter 4 — The Risk Parity and All Seasons Portfolios" (reprints Bridgewater All-Weather passages): https://mebfaber.com/2015/05/28/chapter-4-the-risk-parity-and-all-seasons-portfolios/
- Portfolio Charts, "All Seasons Portfolio": https://portfoliocharts.com/portfolios/all-seasons-portfolio/
- Bridgewater Associates / Karniol-Tambour & Margolis, "Geographic Diversification Can Be a Lifesaver" (free copy): https://mebfaber.com/wp-content/uploads/2020/01/Geographic-Diversification-Can-Be-a-Lifesaver-1.pdf
- Zilbering, Y., C. M. Jaconetti, and F. M. Kinniry Jr., "Best Practices for Portfolio Rebalancing," Vanguard Research, November 2015. Vanguard's own CDN URL `corporate.vanguard.com/content/dam/corp/research/pdf/best_practices_for_portfolio_rebalancing.pdf` returns 404 as of 2026-04-23; working public mirror: https://www.financieelonafhankelijkblog.nl/wp-content/uploads/2021/11/Vanguard-ISGPORE.pdf
- FRED (Federal Reserve Economic Data), series SP500, DGS10, DGS20, DGS30, GOLDPMGBD228NLBM, CPIAUCSL, GDPC1: https://fred.stlouisfed.org/
- Stooq daily CSV feeds for ETF proxies (TLT, IEF, BCOM): https://stooq.com/
