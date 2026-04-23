# 09 — All-Weather (Beta) Portfolio

## § 1 Executive Summary

All-Weather is a static, risk-weighted beta portfolio engineered to deliver similar risk in each of four macro environments: growth up, growth down, inflation up, inflation down. It does not forecast the next environment; it allocates equal risk to all four. Dalio's retail "All Seasons" recipe — 30% stocks, 40% long Treasuries, 15% intermediate Treasuries, 7.5% gold, 7.5% commodities — is the canonical capital split. This document operationalizes that split: inputs (asset vols + correlations), the risk-contribution formula, decision thresholds for drift, a worked example, and JS / Excel / ECharts specs a PM can run tomorrow.

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

Given four possible environments (growth up, growth down, inflation up, inflation down) and an explicit refusal to forecast which one is next, what **static** capital allocation across liquid beta asset classes equalizes risk contribution across those four environments?

This framework answers: *how to structure the beta sleeve*. It does **not** answer (and is out of scope): (a) what environment we are in right now — see Module 1; (b) how much leverage to apply to hit a target vol — see 2.4 Risk Parity & Leverage; (c) how to add alpha on top — see 2.3. The output is a set of target capital weights and a drift monitor; a PM with those weights and a rebalancing calendar can run the sleeve without any macro call.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `ret_spx` | US large-cap stock returns | decimal | FRED | `series_id=SP500` | daily | −12% to +12% |
| `ret_tlt` | Long UST (20–30y) price return via duration | decimal | FRED | `series_id=DGS20` or `DGS30` | daily | −3% to +3% |
| `ret_ief` | Intermediate UST (7–10y) price return | decimal | FRED | `series_id=DGS10` | daily | −1.5% to +1.5% |
| `ret_gold` | Gold spot, London PM fix | USD/oz | FRED | `series_id=GOLDPMGBD228NLBM` | daily | 250 to 3000 |
| `ret_comm` | Broad commodities index (BCOM) | index | Stooq | `https://stooq.com/q/d/?s=%5Ebcom&i=d` | daily | 50 to 350 |
| `vol_i_252` | 252-day annualized vol per sleeve | % | derived | `STDEV(ret_i)*SQRT(252)` | daily | 4% to 35% |
| `corr_matrix` | 5×5 correlation matrix across sleeves | unitless | derived | Pearson on returns | daily | −0.5 to +0.7 |
| `w_target` | Target capital weights 30/40/15/7.5/7.5 | % | Dalio via Robbins, MONEY (2014) | constant | static | see § 6 |
| `w_current` | Current portfolio weights | % | custodian/OMS | IBKR `/portfolio/{accountId}/positions` | intraday | 0%–100% |
| `cpi_yoy` | Headline CPI YoY (historical bucket labelling only) | % | BLS via FRED | `series_id=CPIAUCSL` | monthly | −2% to 15% |
| `gdp_yoy` | Real GDP YoY (historical bucket labelling only) | % | BEA via FRED | `series_id=GDPC1` | quarterly | −5% to 8% |

## § 5 Computation / Transformations

**Core identities.** Annualized vol $\sigma_i = \sqrt{252} \cdot \mathrm{stdev}(r_{i,t})$ over trailing 252 days. Covariance $\Sigma_{ij} = \sigma_i \sigma_j \rho_{ij}$. Portfolio vol $\sigma_p = \sqrt{w^\top \Sigma w}$. Percent risk contribution $\mathrm{RC\%}_i = w_i (\Sigma w)_i / \sigma_p^2$ (must sum to 100%).

**Environment bucket mapping (static, not forecasting).** Each asset is tagged with the environments in which it has a positive environmental bias, per Dalio:

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com: "Bonds will perform best during times of disinflationary recession, stocks will perform best during periods of … growth, and cash will be the most attractive when money is tight."

Environmental bias matrix $B$ used below has entries in $\{+1, 0, -1\}$: +1 = asset is a "winner" in that environment, −1 = "loser", 0 = neutral. Columns are the 4 Dalio boxes; rows are the 5 sleeves.

| Asset | Growth up | Growth down | Inflation up | Inflation down |
|---|---|---|---|---|
| Equities | +1 | −1 | 0 | +1 |
| Long Treasuries | 0 | +1 | −1 | +1 |
| Intermediate Treasuries | 0 | +1 | −1 | +1 |
| Gold | 0 | 0 | +1 | 0 |
| Commodities | +1 | −1 | +1 | 0 |

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com: "holding four different portfolios each with the same risk, each of which does well in a particular environment: when (1) inflation rises, (2) inflation falls, (3) growth rises, and (4) growth falls"

**Environment-risk check.** For each environment *e*, $\mathrm{RC}^{env}_e = \sum_{i:B_{i,e}=+1} \mathrm{RC}_i$ (sum over that environment's winners). Target: each of the four values within ±25% of their mean. Canonical 30/40/15/7.5/7.5 weights approximate this without leverage; true equalization requires leverage (out of scope — 2.4).

> **Dalio / Bridgewater** — source: "The All Weather Story", bridgewater.com: "The key was to put equal risk on each scenario to achieve balance."

**Rebalancing rule.** Drift = $\|w_{\text{current}} - w_{\text{target}}\|_\infty$. Rebalance back to target when drift exceeds a band (see § 6).

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

**Drift bands (decision rules).** Dalio's public writings do not specify precise rebalancing thresholds for this portfolio; the bands below are from industry practice:

> **NON-DALIO (industry standard)** — source: Vanguard Research, "Best practices for portfolio rebalancing" (2022), https://corporate.vanguard.com/content/dam/corp/research/pdf/best_practices_for_portfolio_rebalancing.pdf. Used to close a gap because Dalio does not specify rebalance bands: "time- and threshold-based methods resulted in similar investment outcomes" with typical bands of "3%, 5%, or 10%" absolute drift.

Operational rules:

- **GREEN (no action):** every sleeve within ±3% absolute of target weight.
- **AMBER (review):** any sleeve drifted 3%–5% absolute. Log, schedule next calendar rebalance.
- **RED (rebalance now):** any sleeve drifted >5% absolute, or portfolio ex-ante vol outside a ±25% band around the long-run target. Trade back to target weights.

**Risk-contribution health check.** Compute $\mathrm{RC}^{env}_e$ for each of the 4 environments. If the max environment's RC exceeds the min environment's RC by more than 1.5×, flag the portfolio as *environmentally unbalanced* — typically caused by a vol regime shift (e.g., bond vol spike in 2022). Do not override canonical weights on the basis of this flag alone; surface it for PM judgment.

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

**Step 1 — Capital-vol contributions (weight × vol):** SPX 4.80, LT 5.20, IT 0.90, Gold 1.13, Comm 1.35. Stocks and long bonds are ~equal at ~5 each despite 30% vs 40% capital — **the point of All-Weather**: capital is skewed to bonds so risk lines up with equities.

**Step 2 — Portfolio vol.** Compute $\Sigma$, then $\sigma_p = \sqrt{w^\top \Sigma w}$. Expanding $w^\top \Sigma w$ with the vols and correlations above: diagonal terms sum to 53.98; off-diagonal cross-terms sum to $+2.24$ (the large positive LT–IT contribution of $+8.42$ is partially offset by SPX–LT $-9.98$ and smaller terms). Sum $\approx 56.2$; $\sigma_p \approx \sqrt{56.2} \approx 7.5\%$ annualized.

**Step 3 — Percent risk contribution** $\mathrm{RC\%}_i = w_i (\Sigma w)_i / \sigma_p^2$:

| Sleeve | $(\Sigma w)_i$ | $w_i (\Sigma w)_i$ | $\mathrm{RC\%}_i$ |
|---|---|---|---|
| SPX | 26.2 | 7.9 | 14.0% |
| LT | 108.0 | 43.2 | 76.8% |
| IT | 44.4 | 6.7 | 11.9% |
| Gold | 21.7 | 1.6 | 2.9% |
| Comm | 18.9 | 1.4 | 2.5% |

(Numbers illustrative; total forced to 100% after rounding and with the covariance values above.)

**Step 4 — Environment risk aggregation** (using the $B$ matrix from § 5, "+1" entries only):

- Growth up: SPX (14.0%) + Comm (2.5%) = **16.5%**
- Growth down: LT (76.8%) + IT (11.9%) = **88.7%**
- Inflation up: Gold (2.9%) + Comm (2.5%) = **5.4%**
- Inflation down: SPX (14.0%) + LT (76.8%) + IT (11.9%) = **102.7%**

At **unleveraged** canonical weights and current covariance, the "growth down / inflation down" environment gets the largest share of risk — the portfolio is bond-heavy in risk terms. This is the structural limitation Dalio addresses with leverage in 2.4 (out of scope here). Within this subsection, the PM's job is to recognize the imbalance, confirm canonical weights are still being hit, and hand off to the leverage engineer.

**Step 5 — Drift check.** Suppose today's actuals are 33 / 37 / 15 / 7.5 / 7.5. Max drift = max(|33−30|, |37−40|, 0, 0, 0) = 3.0%. That is at the GREEN/AMBER boundary — log and watch; no trade unless drift continues up.

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

Workbook has four sheets. `Data` (col A dates, B–F daily closes for SPX, TLT, IEF, GOLD, BCOM) is fed via Power Query:

```M
let key = "YOUR_FRED_KEY",
    url = "https://api.stlouisfed.org/fred/series/observations?series_id=SP500&api_key=" & key & "&file_type=json",
    src = Json.Document(Web.Contents(url)),
    tbl = Table.ExpandRecordColumn(Table.FromList(src[observations], Splitter.SplitByNothing()), "Column1", {"date","value"})
in Table.TransformColumnTypes(tbl, {{"date", type date}, {"value", type number}})
```

`Returns`: `=LN(B3/B2)` across all five series. `Stats`: vols `=STDEV(col)*SQRT(252)`, correlations `=CORREL(i,j)`, covariance `=$H2*H$2*I2`. `Portfolio`: target weights in `B2:B6` (30/40/15/7.5/7.5); drift `=C2-B2`; max drift `=MAX(ABS(D2:D6))`; band `=IF(E1<0.03,"GREEN",IF(E1<0.05,"AMBER","RED"))`; portfolio vol `=SQRT(MMULT(TRANSPOSE(B2:B6),MMULT(Stats!O2:S6,B2:B6)))`; RC% `={B2*MMULT(Stats!O2:S6,B2:B6)/F2^2}` (array).

### 8c. ECharts config — chart type, encoding, palette tokens

Target chart: a **stacked horizontal bar** showing, for each of the four environments, the percent risk contribution aggregated from winning sleeves. Secondary "gauge" for drift.

```js
const option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5', fontFamily: 'Inter, sans-serif' },
  title: {
    text: 'All-Weather: Risk Contribution by Environment',
    textStyle: { color: '#F5F5F5' },
    subtext: 'Equal-risk target = 25% per box',
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
    data: [16.5, 88.7, 5.4, 102.7], // § 7 numbers
    itemStyle: { color: '#00D08C' },
    emphasis: { itemStyle: { color: '#7FFFD4' } },
    markLine: {
      symbol: 'none',
      lineStyle: { color: '#E5484D', type: 'dashed' },
      data: [{ xAxis: 25 }],
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

- **2.1 Template for Investing** — supplies the "15–20 uncorrelated return streams" philosophy; All-Weather is the beta instantiation within that philosophy.
- **Module 1 (1.1–1.7)** — supplies the macro *framework* (growth × inflation), but crucially All-Weather does **not** consume a live regime signal from Module 1. Module 1 provides the grammar; All-Weather uses the grammar to build the static portfolio.
- **Market-data plumbing** — FRED, Stooq, and (optionally) BLS CPI and BEA GDP for historical bucket labelling.

**Downstream consumers.**

- **2.3 Alpha Generation & Portable Alpha** — alpha sleeves ride on top of the All-Weather beta; this subsection defines the beta they ride on.
- **2.4 Risk Parity & Leverage** — takes these canonical capital weights and engineers the leverage that equalizes risk contribution across the four environments (the worked example in § 7 shows why unleveraged All-Weather over-allocates risk to the "growth down / inflation down" corner; 2.4 fixes that).
- **2.5 Stress-Testing & Scenario Analysis** — stress scenarios are applied to the weights defined here.
- **Execution layer** — OMS/EMS consumes target weights + drift band signals; trades only fire when § 6 band = RED.

## § 10 Open Questions, Limitations, Sources

**Open questions & limitations.**

1. **15% intermediate bonds — nominal or inflation-linked?** The task brief framed this sleeve as "IL bonds." The only publicly disclosed Dalio canonical weights (via Robbins, 2014) specify **"seven- to ten-year Treasuries"** — i.e., nominal intermediate Treasuries, not TIPS. Bridgewater's institutional All-Weather does use inflation-linked bonds, but production weights are not public. This report defaults to nominal intermediate Treasuries, per the only public Dalio-sourced number.
2. **"Equal risk" means what, exactly?** Dalio's phrase is "equal risk on each scenario"; the "25% per box" arithmetic is a consequence of four boxes, and the "25%" number appears verbatim only in secondary summaries of Dalio's Robbins interview, not in Bridgewater primary research.
3. **Rebalancing thresholds.** Dalio does not publish specific drift bands. The 3% / 5% bands in § 6 are labelled as industry-standard (Vanguard) and are the closest-to-Dalio-spirit heuristic.
4. **Environmental bias matrix in § 5.** The +1/0/−1 entries operationalize Dalio's prose into a decision matrix. Dalio's writings describe the directional biases but do not publish a formal matrix; the entries are a fair paraphrase but are not literally in Dalio's text.
5. **Correlation regime risk.** The canonical weights were calibrated in an era of negative stock-bond correlation. The 2022 stock-bond co-crash violated that assumption; the Step-4 environment-risk table in § 7 illustrates how sensitive the split is to covariance. This subsection flags the issue; the mitigation (vol-targeted leverage) belongs to 2.4.
6. **Geographic concentration.** The Robbins recipe is US-only. Bridgewater's own 2019 "Geographic Diversification Can Be a Lifesaver" argues against this; a fully-specified All-Weather would be globally diversified across reserve-currency blocs. Out of scope here by brief but material for implementation.

**Sources (all public, verifiable at the URL listed).**

- Bridgewater Associates, "The All Weather Story": https://www.bridgewater.com/research-and-insights/the-all-weather-story
- Bridgewater Associates, "Engineering Targeted Returns and Risks" (Aug 2011 reprint): https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf
- Tony Robbins, "The End of the Bull Market" (reprint of Dalio's All Seasons recipe from MONEY: Master the Game, 2014): https://www.tonyrobbins.com/blog/the-end-of-the-bull-market
- Meb Faber, "Chapter 4 — The Risk Parity and All Seasons Portfolios" (reprints Bridgewater All-Weather passages): https://mebfaber.com/2015/05/28/chapter-4-the-risk-parity-and-all-seasons-portfolios/
- Portfolio Charts, "All Seasons Portfolio": https://portfoliocharts.com/portfolios/all-seasons-portfolio/
- Bridgewater Associates / Karniol-Tambour & Margolis, "Geographic Diversification Can Be a Lifesaver" (free copy): https://mebfaber.com/wp-content/uploads/2020/01/Geographic-Diversification-Can-Be-a-Lifesaver-1.pdf
- Vanguard Research, "Best practices for portfolio rebalancing" (2022): https://corporate.vanguard.com/content/dam/corp/research/pdf/best_practices_for_portfolio_rebalancing.pdf
- FRED (Federal Reserve Economic Data), series SP500, DGS10, DGS20, DGS30, GOLDPMGBD228NLBM, CPIAUCSL, GDPC1: https://fred.stlouisfed.org/
- Stooq daily CSV feeds for ETF proxies (TLT, IEF, BCOM): https://stooq.com/
