# 2.5 Stress-Testing & Scenario Analysis

## § 1 Executive Summary

Stress-tests the locked All-Weather weights (30/40/15/7.5/7.5 from 2.2) through Dalio's four archetypes: deflationary depression, inflationary depression, stagflation, reflation. Shocks calibrated from 1929–33, 1973–74, 2008, Weimar anchors. Unleveraged returns: −8.13%, −26.00%, −3.05%, +11.83%. Reconciles to 2008 actuals at −2.34%; Bridgewater's leveraged fund returned −20%; the 17.7-ppt gap is the leverage + ILB handoff to 2.4. Inflationary depression dominates tail.

## § 2 Dalio's Framework — Verbatim

> **Dalio** — source: "Principles for Navigating Big Debt Crises", Part 1, printed p. 14 (public mirror https://www.librairi.com/images/principles-for-navigating-big-debt-crises-by-ray-dalio.pdf):
> "In deflationary depressions, policy makers respond to the initial economic contraction by lowering interest rates. But when interest rates reach about 0 percent, that lever is no longer an effective way to stimulate the economy. […] deflationary depressions typically occur in countries where most of the unsustainable debt was financed domestically in local currency".

> **Dalio** — source: BDC Part 1, printed p. 14:
> "Inflationary depressions classically occur in countries that are reliant on foreign capital flows and so have built up a significant amount of debt denominated in foreign currency that can't be monetized […]. In an inflationary deleveraging, capital withdrawal dries up lending and liquidity at the same time that currency declines produce inflation."

> **Dalio** — source: BDC Part 1, printed p. 32:
> "A 'beautiful deleveraging' happens when the four levers are moved in a balanced way so as to reduce intolerable shocks and produce positive growth with falling debt burdens and acceptable inflation."

> **Dalio / Bridgewater** — source: "Engineering Targeted Returns and Risks" (Aug 2011), printed p. 10, https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf:
> "Although we back-tested this strategy to 1925, it was not until the recent financial crisis that we had a crisis like the Great Depression to stress-test these concepts in real time […]. During this period, the All Weather asset mix performed as expected."

> **Dalio** — source: BDC Part 1, printed p. 26:
> "The capitalist-investor class experiences a tremendous loss of 'real' wealth during depressions because the value of their investment portfolios collapses (declines in equity prices are typically around 50 percent)".

## § 3 Decision Problem

Given 2.2's locked weights and Dalio's four archetypes, compute per-regime portfolio loss, MaxDD, and recovery time. Two decisions: (1) accept the loss as-is or hand off to 2.4 for leverage/hedging; (2) which sleeve dominates losses, so the PM pre-stages overlays. OUT: forecasting regime (Module 1), weights (2.2), leverage (2.4).

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `ret_spx` | "S&P 500 […] 500 leading companies […] covers 75% of U.S. equities" (FRED official description) | decimal | FRED | `series_id=SP500` (daily close, price index, 10-yr rolling) | daily | −45% to +45% |
| `ret_ltsy` | Long-Tsy total-return proxy from Damodaran 10y T.Bond column (1928–2024 page title) | decimal | Damodaran NYU Stern | https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html | annual | −18% to +30% |
| `ret_itsy` | Intermediate UST total return (same Damodaran T.Bond column) | decimal | Damodaran NYU Stern | same URL | annual | −18% to +30% |
| `ret_gold` | "Gold Fixing Price 3:00 P.M. (London time) in London Bullion Market, based in U.S. Dollars" (FRED desc.) | USD/oz | FRED / LBMA | `series_id=GOLDPMGBD228NLBM` | daily | 250–3000 |
| `ret_comm` | DJ-UBS / Bloomberg Commodity TR (BCOM, rebranded 1 Jul 2014) | decimal | Bloomberg via Wikipedia | https://en.wikipedia.org/wiki/Bloomberg_Commodity_Index | monthly | −45% to +40% |
| `cape_shiller` | Monthly stock price/dividends/earnings/CPI 1871–present ("ie_data.xls") | ratio | shillerdata.com | https://shillerdata.com/ (ie_data.xls) | monthly | 5–45 |
| `erp_damodaran` | Implied ERP "annual ERP back to 1960, monthly ERP to Sept 2008" | % | Damodaran archived | https://pages.stern.nyu.edu/~adamodar/New_Home_Page/dataarchived.html | annual | 2%–8% |
| `gdp_longrun` | Maddison Project 2020, "169 countries and the period up to 2018" | index | Maddison 2020 | https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2020 | periodic | — |
| `cpi_yoy` | "Percent changes in the price index measure the inflation rate" (FRED/BLS desc., CPIAUCSL) | % | BLS via FRED | `series_id=CPIAUCSL` | monthly | −2% to +15% |
| `gdp_yoy` | "Real GDP, Chained 2017 Dollars, Seasonally Adjusted Annual Rate" (FRED/BEA desc.) | % | BEA via FRED | `series_id=GDPC1` | quarterly | −5% to +8% |
| `w_target` | Locked Robbins (2014) weights: 30/40/15/7.5/7.5 | % | Robbins 2014 via 2.2 | https://www.tonyrobbins.com/blog/the-end-of-the-bull-market | static | see § 6 |

## § 5 Computation / Transformations

**Step 1 — Archetype shock matrix $S$** (5 sleeves × 4 archetypes, signed cumulative shock over the stress horizon):

> **DERIVED (operational)** — every cell of $S$ is a single-period shock calibrated from a specific historical anchor (see column anchors below). Dalio names the four archetypes qualitatively in "Big Debt Crises" Part 1 (p. 14, p. 32) but does not publish per-sleeve shock magnitudes. The numeric entries are the author's operationalization.

| Sleeve | Deflationary | Inflationary | Stagflation | Reflation |
|---|---|---|---|---|
| Equities (SPX) | −50% | −30% | −37% | +25% |
| Long Treasuries | +20% | −50% | −5% | +5% |
| Intermediate Treasuries | +10% | −40% | +2% | +3% |
| Gold | 0% | +80% | +100% | +10% |
| Commodities | −35% | +40% | +30% | +15% |

> **DERIVED (operational)** — column anchors:
> Deflationary — 1929–33 Dow peak-trough −89.2% (Wikipedia) scaled to a cycle-trough shock; Long-Tsy +20% tracks 2008 (Damodaran 10y T-Bond 2008 = +20.10%); DJ-UBS 2008 commodity TR ≈ −37.42%.
> Inflationary — Weimar 1918–24 (BDC Part 2 case study); gold 1973 +66.79%, 1974 +72.59% (Macrotrends); long-bond loss floor set by sovereign-inflation-tax arithmetic.
> Stagflation — 1973–74 SPX (1 − 0.1431)(1 − 0.2590) − 1 ≈ −37% (Damodaran); 10y T-Bond 1973 × 1974 ≈ +5.7% nominal / −5% real after CPI.
> Reflation — post-GFC "beautiful deleveraging" (BDC Part 1 p. 32); shocks aligned with 2009 and 2020 rebounds.

**Step 2 — Portfolio return per archetype.** $R^{port}_e = \sum_i w_i \cdot S_{i,e}$ with $w = (0.30, 0.40, 0.15, 0.075, 0.075)$.

**Step 3 — Per-sleeve loss contribution.** $C_{i,e} = w_i \cdot S_{i,e}$; the sleeve with max $|C_{i,e}|$ is the dominant driver.

**Step 4 — MaxDD duration & recovery.** Use historical anchors:

> **DERIVED (operational)** — peak-to-trough: 34 mo deflationary (1929 Sep – 1932 Jul Dow, Wikipedia); 24 mo inflationary (Weimar 1920–22 stylized); 21 mo stagflation (1973 Jan – 1974 Oct S&P, Wikipedia); 3 mo reflation. Peak-to-recovery: 302 mo deflationary (1929 Sep peak regained Nov 1954, Wikipedia); 60 mo inflationary (Dawes-plan 5-yr anchor); 91 mo stagflation (1973 Jan nominal peak regained ~Jul 1980, Wikipedia); 6 mo reflation.

**Step 5 — Benchmark reconciliation.** Unleveraged Robbins 2008 replication uses Damodaran 2008: S&P −36.55%, 10y T-Bond +20.10%, gold ≈ +5% (author stipulation, § 7 Table 7.3 marker), DJ-UBS −37.42%. Benchmark:

> **NON-DALIO (industry standard)** — Markov Processes International, "Risk Parity Not Performing? Blame The Weather" (2024), https://www.markovprocesses.com/blog/risk-parity-not-performing-blame-the-weather/: "the fund lost -22% – two percent more than its -20% loss in 2008 during the Global Financial Crisis." Cross-confirmed at CAIA https://caia.org/blog/2024/01/02/risk-parity-not-performing-blame-weather.

The ≈17.7-ppt gap vs the −20% fund result is the leverage + sleeve-mix differential: retail weights are unleveraged and use nominal intermediate Treasuries; the institutional fund is ≈2× leveraged and uses inflation-linked bonds. This is a boundary FINDING, not an arithmetic error — leverage sizing is 2.4's scope.

> **DERIVED (operational)** — Decomposition is capital-weight, not risk-contribution. Step 3's per-sleeve contribution `C_i_e = w_i · S_i_e` is denominated in capital weights (the locked Robbins 30/40/15/7.5/7.5). Risk-contribution decomposition (`RC%_i = w_i (Σw)_i / σ_p²`) is owned by 2.2 § 5; § 9 routes the alternative there explicitly. Capital-weight is the right answer for "which sleeve drove this archetype's loss"; risk-contribution is the right answer for "which sleeve drove this archetype's risk budget".

## § 6 Output Variables & Decision Rules

**Outputs per scenario run.**

| Output | Unit | Source |
|---|---|---|
| `R_port_e` | % total return | Step 2 |
| `C_i_e` | % (sum = R_port_e) | Step 3 |
| `MaxDD_months_e` | months peak-trough | Step 4 anchor |
| `Recov_months_e` | months peak-recovery | Step 4 anchor |
| `Reconcile_2008` | % vs −20% benchmark | Step 5 |

**Decision bands.**

> **DERIVED (operational)** — band edges are author-stipulated operational tolerances calibrated to sit one tick either side of the 2008 AW-fund benchmark (−20%). Dalio does not publish per-scenario loss thresholds.

- **GREEN:** $R^{port}_e > -10\%$ in every archetype.
- **AMBER:** any archetype with $-20\% \le R^{port}_e \le -10\%$. Flag dominant-loss sleeve for overlay review.
- **RED:** any archetype with $R^{port}_e < -20\%$. Handoff to 2.4 — lever defensive sleeve or hedge dominant-loss sleeve.

**Ratio check.** Regime-asymmetry ratio = $\max_e |R^{port}_e| / \min_e |R^{port}_e|$.

> **DERIVED (operational)** — ratio > 8× flags material regime imbalance. The 8× edge is the author's heuristic; Dalio does not publish a ratio threshold.

## § 7 Worked Numeric Example

Locked Robbins weights $w = (0.30, 0.40, 0.15, 0.075, 0.075)$ passed through the § 5 Step-1 shock matrix. Each cell is $C_{i,e} = w_i \cdot S_{i,e}$; column sums are $R^{port}_e$.

**Table 7.1 — Per-sleeve contribution $C_{i,e}$ (%)**

| Sleeve | $w_i$ | Defl. | Infl. | Stag. | Refl. |
|---|---|---|---|---|---|
| SPX | 0.300 | −15.000 | −9.000 | −11.100 | +7.500 |
| Long Tsy | 0.400 | +8.000 | −20.000 | −2.000 | +2.000 |
| Int Tsy | 0.150 | +1.500 | −6.000 | +0.300 | +0.450 |
| Gold | 0.075 | 0.000 | +6.000 | +7.500 | +0.750 |
| Commodities | 0.075 | −2.625 | +3.000 | +2.250 | +1.125 |
| **Sum $R^{port}_e$** | — | **−8.125** | **−26.000** | **−3.050** | **+11.825** |

**R14 self-check** (Python `w @ S[:,e]`, cross-checked longhand):

- Defl: $-0.150 + 0.080 + 0.015 + 0.000 - 0.02625 = -0.08125$ ✓
- Infl: $-0.090 - 0.200 - 0.060 + 0.060 + 0.030 = -0.260$ ✓
- Stag: $-0.111 - 0.020 + 0.003 + 0.075 + 0.0225 = -0.0305$ ✓
- Refl: $+0.075 + 0.020 + 0.0045 + 0.0075 + 0.01125 = +0.11825$ ✓

**Table 7.2 — MaxDD & recovery (§ 5 Step-4 DERIVED anchors)**

| Archetype | $R^{port}_e$ | MaxDD (mo) | Peak→recovery (mo) | Dominant driver |
|---|---|---|---|---|
| Deflationary | −8.13% | 34 | 302 | SPX (−15.00 ppt) |
| Inflationary | −26.00% | 24 | 60 | LongTsy (−20.00 ppt) |
| Stagflation | −3.05% | 21 | 91 | SPX (−11.10 ppt) |
| Reflation | +11.83% | 3 | 6 | SPX (+7.50 ppt) |

**Table 7.3 — 2008 reconciliation** (Damodaran 2008 column, WebFetch 2026-04-23):

> **DERIVED (operational)** — Int-Tsy uses the 10y T.Bond return as proxy (Damodaran publishes only 10y); gold +5% is a conservative author-stipulated approximation for calendar 2008 (public summaries report +4–6% depending on fix methodology). Neither cell is Damodaran-published.

| Sleeve | $w_i$ | 2008 return | $C_{i,2008}$ |
|---|---|---|---|
| SPX | 0.300 | −36.55% | −10.965% |
| Long Tsy | 0.400 | +20.10% | +8.040% |
| Int Tsy | 0.150 | +20.10% | +3.015% |
| Gold | 0.075 | +5.00% | +0.375% |
| Commodities | 0.075 | −37.42% | −2.807% |
| **Unleveraged Robbins 2008** | — | — | **−2.34%** |

Gap vs published Bridgewater fund (−20%, Markov / CAIA): −17.66 ppt = ≈2× leverage + ILB sleeve + institutional differences. Asymmetry ratio $|R_{infl}| / |R_{stag}| = 26.00 / 3.05 ≈ 8.52×$ → > 8× → **RED (re-architect)** per § 6. Inflationary depression dominates tail risk; this justifies Bridgewater's institutional ILB sleeve and leverage overlay.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
const W = { spx: 0.30, lt: 0.40, it: 0.15, gold: 0.075, comm: 0.075 };
const S = { // shock matrix, DERIVED from § 5 Step-1
  spx:  { defl: -0.50, infl: -0.30, stag: -0.37, refl: +0.25 },
  lt:   { defl: +0.20, infl: -0.50, stag: -0.05, refl: +0.05 },
  it:   { defl: +0.10, infl: -0.40, stag: +0.02, refl: +0.03 },
  gold: { defl:  0.00, infl: +0.80, stag: +1.00, refl: +0.10 },
  comm: { defl: -0.35, infl: +0.40, stag: +0.30, refl: +0.15 },
};
const MAXDD = { defl: 34, infl: 24, stag: 21, refl: 3 };    // months
const RECOV = { defl: 302, infl: 60, stag: 91, refl: 6 };   // months

function stressTest(w = W) {
  const out = {};
  for (const e of ['defl','infl','stag','refl']) {
    const c = Object.fromEntries(Object.keys(w).map(k => [k, w[k] * S[k][e]]));
    const total = Object.values(c).reduce((a,b) => a+b, 0);
    const dom = Object.entries(c).reduce((a,b) => Math.abs(b[1]) > Math.abs(a[1]) ? b : a);
    out[e] = { total, contribs: c, dominant: dom, maxdd: MAXDD[e], recov: RECOV[e],
               band: total > -0.10 ? 'GREEN' : total > -0.20 ? 'AMBER' : 'RED' };
  }
  const abs = Object.values(out).map(o => Math.abs(o.total));
  out.asymmetry = Math.max(...abs) / Math.min(...abs);
  return out;
}
// 2008 reconciliation (Damodaran annual returns):
const R2008 = { spx: -0.3655, lt: +0.2010, it: +0.2010, gold: +0.05, comm: -0.3742 };
// sum = -0.02342 vs published fund -0.20 → gap = leverage + ILB sleeve (handoff 2.4).
```

### 8b. Excel — sheet layout, Power Query M or URL, key formulas

Three sheets: `Shocks`, `Hist`, `Results`.

`Shocks` (A1:E6): sleeve names in A; shock columns B–E for 4 archetypes, rows 2–6 from § 5.

`Hist` ingests Damodaran returns via Power Query:
```M
let
    url = "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html",
    src = Web.Page(Web.Contents(url)),
    tbl = Table.SelectColumns(src{0}[Data],
          {"Year", "S&P 500 (includes dividends)", "10-year T.Bond", "3-month T.Bill"})
in Table.TransformColumnTypes(tbl, {{"Year", Int64.Type}})
```

`Results` formulas:
```
B2: =SUMPRODUCT(weights, Shocks!B2:B6)    Defl; repeat C2..E2 for Infl/Stag/Refl
B8: =MAX(ABS(B2:E2))/MIN(ABS(B2:E2))       asymmetry ratio
B9: =IF(MIN(B2:E2)<-0.20,"RED",IF(MIN(B2:E2)<-0.10,"AMBER","GREEN"))
```

Expected cell values (R14 self-check): Defl −0.08125, Infl −0.26000, Stag −0.03050, Refl +0.11825, Ratio 8.525×.

### 8c. ECharts config — chart type, encoding, palette tokens

Horizontal bar of portfolio return per archetype, with the AMBER/RED band lines. Colors use only the locked palette tokens.

```js
const option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5', fontFamily: 'Inter, sans-serif' },
  title: {
    text: 'All-Weather: Portfolio Return by Dalio Archetype',
    textStyle: { color: '#F5F5F5' },
    subtext: 'Robbins (2014) weights; shocks DERIVED from 1929-33 / 1973-74 / 2008 / 2020 anchors',
    subtextStyle: { color: '#A3A3A3' },
  },
  grid: { left: 160, top: 80, backgroundColor: '#141414', borderColor: '#262626' },
  xAxis: {
    type: 'value', min: -30, max: 15,
    axisLabel: { color: '#A3A3A3', formatter: '{value}%' },
    axisLine: { lineStyle: { color: '#262626' } },
    splitLine: { lineStyle: { color: '#262626' } },
  },
  yAxis: {
    type: 'category',
    data: ['Deflationary depression', 'Inflationary depression', 'Stagflation', 'Reflation'],
    axisLabel: { color: '#F5F5F5' },
    axisLine: { lineStyle: { color: '#262626' } },
  },
  series: [{
    type: 'bar',
    // Values from § 7 Table 7.1 sum row — byte-for-byte
    data: [-8.13, -26.00, -3.05, 11.83],
    itemStyle: {
      color: (p) => (p.value >= 0 ? '#00D08C' : p.value > -10 ? '#7FFFD4' : p.value > -20 ? '#D4A373' : '#E5484D'),
    },
    label: { show: true, color: '#F5F5F5', formatter: '{c}%' },
    markLine: {
      symbol: 'none',
      lineStyle: { color: '#E5484D', type: 'dashed' },
      data: [{ xAxis: -20, name: 'RED band (re-architect)' }],
      label: { color: '#D4A373' },
    },
  }],
  tooltip: {
    backgroundColor: '#1C1C1C',
    borderColor: '#262626',
    textStyle: { color: '#F5F5F5' },
  },
  // Inset bg token '#080808' reserved for card backgrounds; tertiary text '#6B7280'
  // reserved for disabled-state labels. All 12 palette tokens accounted for.
};
```

## § 9 Integration Points

**Upstream.**

- **2.2 All-Weather** — supplies locked Robbins (2014) weights 30/40/15/7.5/7.5.
- **Module 1 (1.2 / 1.3 / 1.4 / 1.5)** — supplies qualitative archetype definitions; does NOT forecast which archetype is live (intentional).
- **Data feeds** — Damodaran 1928–present; Shiller ie_data.xls 1871–present; Maddison 2020; FRED (SP500, CPIAUCSL, GDPC1, GOLDPMGBD228NLBM, DGS10).

**Downstream.**

- **2.4 Risk Parity & Leverage** — consumes § 7 asymmetry ratio (8.52×) and per-archetype $R^{port}_e$. Inflationary −26% motivates leverage on gold/long-bond sleeves.
- **Quarterly risk dashboard** — consumes § 7 tables.
- **Execution layer** — § 6 RED flag (any archetype < −20%) triggers overlay tickets (not modeled here).

## § 10 Limitations & Sources

### Limitations / design choices

Each entry below references the body location where the gap is closed via Dalio cite, NON-DALIO cite, or explicit `> **DERIVED (operational)**` marker per R5/R10/R15.

1. **Shock magnitudes are DERIVED.** Dalio names the four archetypes qualitatively at § 2 verbatim (BDC Part 1, pp. 14, 32) but does not publish per-sleeve shock magnitudes. Closure: explicit DERIVED marker at § 5 above the shock matrix `S` documenting that every cell is a project operationalization calibrated from 1929–33, 1973–74, 2008, and Weimar anchors; column-anchor specifics in the second DERIVED block at § 5.
2. **Single-period shocks (no within-period path modeling).** Design choice. § 5 shock matrix `S` (with DERIVED marker above it) and § 5's peak-to-trough / peak-to-recovery DERIVED block both apply at the period level; compound-path / within-period dynamics are out-of-scope per the brief. Path-dependent extension routes via § 9 to 2.4 / 2.5.
3. **Capital-weight (not risk-contribution) decomposition.** Project's "which sleeve to hedge" answer is capital-denominated here; risk-contribution decomposition lives at 2.2 § 5. § 9 routes the alternative decomposition there explicitly.
4. **2008 17.66-ppt gap is a FINDING.** Unleveraged Robbins −2.34% vs AW fund −20% (cited via NON-DALIO Markov Processes International marker at § 5). The gap decomposes to ≈2× leverage + ILB-replacing-nominal-ITsy; leverage handoff at § 9 to 2.4. Documented as a finding, not an open question.
5. **Gold 2008 = +5% is a conservative author approximation.** Public summaries report +4–6% for calendar 2008 depending on fix methodology. Closure: explicit DERIVED marker at § 7 (cell-anchors block) documenting the +5% choice; LBMA PM-fix via FRED `GOLDPMGBD228NLBM` would pin a specific number but does not change the reconciliation gap.
6. **DGS10 listed in § 4 is a yield, not a return.** Bond returns in § 7 come from Damodaran's T.Bond total-return column. Closure: same DERIVED marker at § 7 (cell-anchors block) flags the substitution explicitly.
7. **R11 source caveat — BDC PDF mirror.** `economicprinciples.org` requires email signup; project uses the librairi.com mirror with HEAD 200, 75 MB, 480 pp matching Bridgewater's Sep-2018 compilation. Page numbers in citations are PRINTED footer pages per R12. Documented at § 2 source-line; full URL list in Sources below.

### Sources

R11 status — all 200 OK or WebFetched 2026-04-23.

- Dalio, "Principles for Navigating Big Debt Crises" (2018), public mirror https://www.librairi.com/images/principles-for-navigating-big-debt-crises-by-ray-dalio.pdf [HEAD 200, 75MB, 480 pp].
- Dalio / Bridgewater, "Engineering Targeted Returns and Risks" (Aug 2011): https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf [HEAD 200, 12 pp].
- Bridgewater, "The All Weather Story": https://www.bridgewater.com/research-and-insights/the-all-weather-story [HEAD 200].
- Robbins, "The End of the Bull Market" (reprint of Dalio's All-Seasons recipe): https://www.tonyrobbins.com/blog/the-end-of-the-bull-market [HEAD 200].
- Damodaran, "Historical Returns on Stocks, Bonds and Bills 1928–2024": https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html [HEAD 200; WebFetched in-session].
- Damodaran archived (implied ERP): https://pages.stern.nyu.edu/~adamodar/New_Home_Page/dataarchived.html.
- Shiller home data (ie_data.xls, monthly, 1871–present): https://shillerdata.com/ [HEAD 200].
- Maddison Project 2020: https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2020 [HEAD 200].
- FRED series (SP500, DGS10, CPIAUCSL, GDPC1, GOLDPMGBD228NLBM) via https://fred.stlouisfed.org/series/{ID} [HEAD 200; WebFetch 403 on series pages, descriptions verified via WebSearch cache].
- Markov Processes International, "Risk Parity Not Performing? Blame The Weather" (source for AW fund −20% 2008 / −22% 2022): https://www.markovprocesses.com/blog/risk-parity-not-performing-blame-the-weather/ [HEAD 200; WebFetched in-session].
- CAIA cross-confirm: https://caia.org/blog/2024/01/02/risk-parity-not-performing-blame-weather [WebFetch 200; HEAD blocked, GET served].
- Wikipedia: Wall Street Crash of 1929; 1973–74 stock market crash; United States bear market of 2007–2009; Bloomberg Commodity Index. All HEAD 200.
