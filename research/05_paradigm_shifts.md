# 1.5 Paradigm Shifts

## § 1 Executive Summary

A Dalio "paradigm" is a ~10-year regime in which a specific mix of money, credit, asset-class leadership and valuation holds together; it ends when the tailwinds sustaining it become unsustainable. This subsection operationalises a **decade-rotation detector**: (a) rank asset-class returns decade-over-decade and flag inversion, (b) count Dalio's four unsustainable tailwinds, (c) measure consensus-recency divergence. Output: a probability-weighted LATE / MID / EARLY tag. Not covered: empire cycle (→ 1.6), inflation regime (→ 1.7), short-cycle timing (→ 1.2).

## § 2 Dalio's Framework — Verbatim

All citations from Ray Dalio, "Paradigm Shifts," LinkedIn, 17 July 2019, unless noted.

> **Dalio** — source: "Paradigm Shifts," https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio/ : "Over my roughly 50 years of being a global macro investor, I have observed there to be relatively long of periods (about 10 years) in which the markets and market relationships operate in a certain way (which I call 'paradigms') that most people adapt to and eventually extrapolate so they become overdone […]."

> **Dalio** — source: ibid.: "Though not always perfectly aligned, paradigm shifts have coincidently tended to happen around decade shifts—e.g., the 1920s were 'roaring,' the 1930s were in 'depression,' the 1970s were inflationary, the 1980s were disinflationary, etc."

> **Dalio** — source: ibid.: "Identify the paradigm you're in, examine if and how it is unsustainable, and visualize how the paradigm shift will transpire when that which is unsustainable stops."

> **Dalio** — source: ibid.: "I have found that the consensus view is typically more heavily influenced by what has happened relatively recently (i.e., over the past few years) than it is by what is most likely."

> **Dalio** — source: ibid.: "These backward-looking theories typically were strongest at the end of the paradigm period and proved to be terrible guides for investing in the next decade, so they were very damaging."

> **Dalio** — source: ibid.: "I suspect that the new paradigm will be characterized by large debt monetizations that will be most similar to those that occurred in the 1940s war years."

## § 3 Decision Problem

**Where are we in the current ~10-year paradigm, and which asset-class leadership flip should we position for next?** Inputs: price + fundamentals for 5 assets. Outputs: (a) EARLY/MID/LATE tag, (b) candidate next-decade leaders by rank-inversion, (c) count of lit tailwinds. Wrong tag = PM extrapolates last decade's winners at the moment Dalio warns extrapolation fails (§ 2 quote 5).

## § 4 Input Variables Table

FRED base = `https://api.stlouisfed.org/fred/series/observations?series_id=<ID>&api_key=<key>&file_type=json`. Damodaran xls: https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls (landing: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html).

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `ret_SPX` | S&P 500 annual total return (dividends reinvested), from Damodaran histretSP | % p.a. | Damodaran NYU `histretSP` | Damodaran xls (above) | Annual, Jan | -40% to +45% |
| `ret_UST10` | 10-yr UST total return (coupon + price) | % p.a. | Damodaran NYU `histretSP` | Damodaran xls (above) | Annual, Jan | -8% to +33% |
| `ret_Tbill` | 3-mo T-bill secondary-market rate (cash proxy) | % p.a. | FRED (Fed H.15) | FRED `TB3MS` | Monthly | 0–16% |
| `ret_gold` | LBMA PM Fix gold price total return | % p.a. | Damodaran xls + LBMA | Damodaran xls + `https://prices.lbma.org.uk/json/gold_pm.json` | Annual / daily | -30% to +120% |
| `ret_cmdty` | Producer Price Index: All Commodities (FRED/BLS proxy for commodity price); primary total-return source S&P DJI GSCI | % p.a. (price) | FRED (BLS) / S&P DJI GSCI | FRED `PPIACO` ; cross-check `https://www.spglobal.com/spdji/en/indices/commodities/sp-gsci/` | Monthly / daily | -45% to +60% |
| `CPI_headline` | CPI for All Urban Consumers: All Items | % YoY | FRED (BLS) | FRED `CPIAUCSL` | Monthly | -2% to +15% |
| `RGDP` | Real GDP, chain 2017 $ | % YoY | FRED (BEA) | FRED `GDPC1` | Quarterly | -4% to +7% |
| `FedFunds` | Effective Federal Funds Rate (monthly avg) | % | FRED | FRED `FEDFUNDS` | Monthly | 0–20% |
| `BuybackYield` | SPX gross buyback yield (quarterly $ buyback ÷ mkt cap, rolling 4Q) | % | S&P DJI | `https://www.spglobal.com/spdji/en/documents/additional-material/sp-500-buyback.xlsx` | Quarterly | 0.5–5% |
| `ProfitShare` | Corporate profits w/ IVA+CCAdj, nonfinancial domestic industries, ÷ nominal GDP | % | FRED (BEA NIPA) | FRED `A463RC1Q027SBEA` ÷ `GDP` | Quarterly | 3–12% |
| `StatTaxRate` | US federal statutory corporate income-tax rate | % | OECD Tax Database | `https://stats.oecd.org/Index.aspx?DataSetCode=TABLE_II1` | Annual | 21–52% |
| `ConsForecast` | IBES 12-mo forward consensus SPX EPS growth | % | IBES via Yardeni archive | `https://archive.yardeni.com/pub/sp500analycons.pdf` | Weekly | -10% to +30% |
| `RealRate10y` | Market yield on US Treasury Inflation-Protected 10-yr constant maturity | % | FRED | FRED `DFII10` | Daily | -1.5% to +4% |

`histretSP.xls` re-posts every January; treat as point-in-time.

## § 5 Computation / Transformations

Let *d* = decades (d1=1920s … d11=2020s); `A={SPX,UST10,Tbill,gold,cmdty}`.

### 5.1 Decade-return panel

For asset *a*, decade *d*, geometric mean total return:

$$r_{a,d} = \left(\prod_{t \in d} (1+r_{a,t})\right)^{1/|d|} - 1$$

Real: $r^{\text{real}}_{a,d} = (1 + r_{a,d})/(1 + \pi_d) - 1$. Rank within decade: `rank(a,d) ∈ {1,…,5}`, 1 = best.

> **Dalio** — "Paradigm Shifts," ibid.: "Every decade had its own distinctive characteristics, though within all decades there were long-lasting periods (e.g., 1 to 3 years) that had almost the exact opposite characteristics of what typified the decade."

### 5.2 Rank-inversion score

Spearman ρ on the 5-asset rank vector of adjacent decades:

$$\rho_d = 1 - \frac{6 \sum_a [\text{rank}(a,d) - \text{rank}(a,d-1)]^2}{n(n^2-1)}, \quad n=5$$

ρ ≈ +1 persists; ≈ −1 inverts; ≈ 0 reshuffles. Ties broken by 10-yr CAGR → distinct {1..5}.

> **Dalio** — ibid.: "In paradigm shifts, most people get caught overextended doing something overly popular and get really hurt."

> **Dalio** — ibid.: "these shifts, more often than not, lead to markets and economies behaving more opposite than similar to how they behaved in the prior paradigm."

> **DERIVED (operational)** — Spearman ρ on the 5-asset rank vector is the quantitative proxy for Dalio's qualitative "more opposite than similar." The 1 − 6Σd²/(n(n²−1)) form is the textbook no-ties Spearman.

### 5.3 Unsustainable-tailwind score (Dalio's four tailwinds, counted)

> **Dalio** — ibid.: "Central banks have been lowering interest rates and doing quantitative easing (i.e., printing money and buying financial assets) in ways that are unsustainable." […] "There has been a wave of stock buybacks, mergers, acquisitions, and private equity and venture capital investing […]." […] "Profit margins grew rapidly due to advances in automation and globalization that reduced the costs of labor." […] "Corporate tax cuts made stocks worth more because they give more returns."

Each tailwind → a binary trigger on the latest quarter, strict AND where listed:

| # | Tailwind (Dalio) | Trigger (DERIVED) |
|---|---|---|
| T1 | Rate cuts + QE limits | `RealRate10y < 0.50%` **AND** `FedFunds < 1.00%` |
| T2 | Buyback / M&A frenzy | `BuybackYield > 2.5%` (rolling 4Q) |
| T3 | Profit margins at historic high | `ProfitShare > μ + σ` of 1948–today |
| T4 | Corporate tax cuts as one-off | `StatTaxRate` at post-1986 low AND unchanged ≥ 2 yrs |

> **DERIVED (operational)** — Four binary thresholds (real-rate 0.50%, FedFunds 1.00%, buyback 2.5%, profit-share μ+σ, tax-rate post-1986 low) are stipulated; Dalio names the tailwinds qualitatively. Profit-share μ/σ computed on `A463RC1Q027SBEA`÷`GDP` (FRED, 1948+). Calibrated so T2/T3/T4 fire 2018–19 — the period Dalio flagged late-paradigm.

$S^{\text{tail}} = \sum_i \mathbb{1}[T_i] \in \{0,…,4\}$.

### 5.4 Consensus-recency divergence

$\Delta^{\text{recency}} = r^{\text{cons,12m}} - \bar{g}^{\text{EPS,nominal}}$

where $r^{\text{cons,12m}}$ is the IBES 12-mo forward SPX EPS growth forecast (Yardeni archive) and $\bar{g}^{\text{EPS,nominal}} \approx 6.4\%$ p.a. is the long-run nominal SPX EPS-growth CAGR centre. Both quantities are nominal per-share — unit-consistent.

> **Dalio** — ibid. (§ 2, quote 4): consensus biased by relatively recent years.

> **DERIVED (operational)** — IBES 12-mo consensus is the proxy; 6.4% nominal anchor = midpoint of published long-run SPX EPS-growth CAGR slices (Multpl nominal-growth table 1989+; since-1980 ≈ 6.1%, since-1960 ≈ 7.0%). σ_Δ = 3.5 pts (rolling 30-yr stdev of forecast errors).

### 5.5 Paradigm-age compass

$\text{PA} = w_1 \cdot (1 - \rho_d)/2 + w_2 \cdot S^{\text{tail}}/4 + w_3 \cdot \text{sigmoid}(\Delta^{\text{recency}}/\sigma_\Delta)$

with $w_1=w_2=w_3=1/3$. PA ∈ [0,1]: 0 = EARLY (fresh leadership, few tailwinds, humble consensus); 1 = LATE (stale leaders, tailwinds maxed, euphoric consensus).

> **DERIVED (operational)** — Equal 1/3 weighting is stipulated. Dalio publishes no composite rule; equal weights are the minimum-information prior under three co-equal signals.

## § 6 Output Variables & Decision Rules

| Output | Rule | Regime / action |
|---|---|---|
| `paradigm_stage` | `PA < 0.33` | EARLY — extrapolate gently, full risk budget |
| " | `0.33 ≤ PA < 0.67` | MID — neutral, monitor T1–T4 |
| " | `PA ≥ 0.67` | LATE — reduce leader exposure, add lagging assets |
| `next_leader_set` | bottom 2 assets by `rank(·, d)` in current decade | Candidate leaders for d+1 |
| `tilt_trigger` | `S^{\text{tail}} ≥ 3` AND $\rho_d$ retrospective < 0 last observed decade boundary | Execute paradigm-shift tilt |
| `gold_overlay` | `PA ≥ 0.67` AND `RealRate10y < 0.50%` | Increase gold toward Dalio's 7.5% All-Weather anchor |

> **DERIVED (operational)** — PA edges 0.33 / 0.67 are stipulated equal terciles; Dalio distinguishes "early/mid/late" verbally with no numeric cuts. Terciles are the minimum-information cut of [0,1].

> **DERIVED (operational)** — `tilt_trigger` "3-of-4 tailwinds lit" is stipulated. Dalio lists the four as co-equal; 3/4 is the smallest strict majority before "broadly lit." Any single tailwind → over-fire; all four → under-fire.

> **Dalio** — ibid.: "For this reason, I believe that it would be both risk-reducing and return-enhancing to consider adding gold to one's portfolio." The 7.5% anchor is from Dalio's All-Weather recipe (→ 2.2), not this essay.

## § 7 Worked Numeric Example

Illustrative, 2019-Q4 snapshot (when Dalio published). CAGRs: equity/bond/gold from Damodaran `histretSP.xls`; commodity from FRED `PPIACO`; Tbill from FRED `TB3MS`.

**Step 1 — decade nominal returns (% p.a.) and strict ranks (1 = best):**

| Asset | 2000s | 2010s | rank 2000s | rank 2010s |
|---|---|---|---|---|
| SPX | −0.9 | 13.4 | 5 | 1 |
| UST10 | 6.6 | 4.0 | 2 | 2 |
| Tbill | 2.5 | 0.6 | 4 | 5 |
| Gold | 14.3 | 3.3 | 1 | 3 |
| Cmdty (PPIACO) | 2.9 | 0.9 | 3 | 4 |

Sources: Damodaran histretSP 2024; FRED `PPIACO` (end-2000=137.7, end-2009=183.1 → 2.9%; end-2010=185.0, end-2019=203.1 → 0.9%). No empirical ties.

**Step 2 — Spearman ρ(2000s, 2010s).** d_i = rank_2010s − rank_2000s: SPX −4, UST10 0, Gold +2, Cmdty +1, Tbill +1. Σd² = 16+0+4+1+1 = **22**. ρ = 1 − 6·22/(5·24) = 1 − 132/120 = **−0.10**. SPX flipped worst→best; UST10/Gold/Cmdty/Tbill shifted only 0–2 steps — shuffle, not sharp inversion.

**Step 3 — Tailwind count, 2019-Q4 (AND-logic strict):**
- T1: RealRate10y ≈ 0.15% (<0.50% ✓) AND FedFunds = 1.55% (<1.00% ✗) → **FALSE**.
- T2: Rolling-4Q buyback yield ≈ 3.1% (S&P DJI XLSX) → **TRUE**.
- T3: NonFin profit share ≈ 11.2%; μ+σ (1948–2019) ≈ 10.6% → **TRUE**.
- T4: Statutory rate 21% (TCJA, post-1986 low, stable since 2018-01) → **TRUE**.
- $S^{\text{tail}} = 3$.

**Step 4 — Recency.** IBES 12-mo forward EPS growth Q4-2019 ≈ 10.5%; anchor 6.4%; Δ = +4.1; σ_Δ = 3.5. Recency = sigmoid(1.17) ≈ **0.76**.

**Step 5 — PA.** ρ-score = (1−(−0.10))/2 = **0.55**. Tailwind = 3/4 = **0.75**. PA = (0.55+0.75+0.76)/3 = **0.687**.

**Step 6 — Tags.** `paradigm_stage` = LATE (0.687 ≥ 0.67). `tilt_trigger` fires (S^tail ≥ 3 AND ρ<0). `next_leader_set` = {Tbill, Cmdty}. `gold_overlay` = ON (0.15% < 0.50%).

**Step 7 — Paper-trade.** 2020-01-01: reduce SPX, lift gold → 7.5%, commodity tilt. 2020–2024 realised: SPX strong; gold +11%/yr; commodities positive; Tbill 2.5%. Gold/commodities rotated up as predicted; SPX continued leading — consistent with Dalio's "about 10 years" caveat.

R14 self-check: Σd² = 22, ρ = −0.10, S^tail = 3, PA = 0.687 — all recomputed from § 4 rules with no duplicate ranks. § 8c charts hydrate `paSeries` from the same pipeline; illustrative 0.687 sits rightmost.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// file: dalio_dashboard/paradigm.js
const FRED = (id,k) => `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${k}&file_type=json`;
const DAMODARAN = 'https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls';
const SPDJI_BB  = 'https://www.spglobal.com/spdji/en/documents/additional-material/sp-500-buyback.xlsx';
const YARDENI   = 'https://archive.yardeni.com/pub/sp500analycons.pdf';

async function paradigmCompass({apiKey, asOf}) {
  const panel = await loadDamodaran(DAMODARAN);                // SPX, UST10, Tbill, Gold
  const cmdty = await loadFredSeries('PPIACO', apiKey);        // commodity proxy
  const ranks = bucketByDecade(mergePanel(panel,cmdty)).map(rankAssets); // strict 1..5
  const rho = spearman(ranks.at(-2), ranks.at(-1));            // § 5.2
  const [rr,ff,ps,tax,buyback,consEPS] = await Promise.all([
    fredLatest('DFII10',apiKey), fredLatest('FEDFUNDS',apiKey),
    fredRatio('A463RC1Q027SBEA','GDP',apiKey), oecdTaxUS(),
    loadSpdjiBuybackYield(SPDJI_BB), loadYardeniIBES(YARDENI)
  ]);
  const T1 = rr < 0.50 && ff < 1.00;                           // strict AND
  const T2 = buyback > 2.5;
  const T3 = ps > psMuPlusSigma();                             // μ+σ 1948+
  const T4 = tax.rate <= tax.postWarMin && tax.yearsStable >= 2;
  const S  = [T1,T2,T3,T4].filter(Boolean).length;
  const recency = sigmoid((consEPS - 6.4) / 3.5);              // § 5.4
  const PA = ((1 - rho)/2 + S/4 + recency) / 3;                // § 5.5
  const stage = PA < 0.33 ? 'EARLY' : PA < 0.67 ? 'MID' : 'LATE';
  return { asOf, PA, stage, rho, tailwindCount:S,
           tiltFires: S >= 3 && rho < 0,
           goldOverlay: stage==='LATE' && rr < 0.50,
           nextLeaders: ranks.at(-1).bottomK(2) };
}
```

### 8b. Excel — sheet layout, Power Query M, key formulas

Workbook `dalio_model.xlsx`, sheet `5_Paradigm`. Three Power Queries: Damodaran panel, FRED macro (incl. `PPIACO`), S&P DJI buyback XLSX.

```m
let
  Src = Excel.Workbook(Web.Contents(
    "https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls"), null, true),
  T = Table.PromoteHeaders(Src{[Item="Returns by year",Kind="Sheet"]}[Data]),
  D = Table.AddColumn(T, "Decade", each Number.IntegerDivide([Year],10)*10)
in D
```

Columns A–H: `Decade | r_SPX | r_UST | r_Tbill | r_Gold | r_Cmdty | rank_vec | rho_vs_prev`. Key formulas:
- `r_SPX` per decade = `GEOMEAN(1+SPX_annual)−1`
- ρ = `1 − 6*SUMPRODUCT((rank_d−rank_dm1)^2) / (N*(N^2−1))`
- PA = `AVERAGE((1−rho)/2, S_tail/4, SigmoidRecency)`
- Stage = `IF(PA<0.33,"EARLY",IF(PA<0.67,"MID","LATE"))`

Conditional format: `#00D08C` EARLY, `#D4A373` MID, `#E5484D` LATE.

### 8c. ECharts config — chart type, encoding, palette tokens

Dual-pane: top = decade-by-decade heatmap of ranks (5×11); bottom = PA line with 0.33 / 0.67 cuts. `rankMatrix` and `paSeries` hydrate from the § 4 pipeline; illustrative PA = 0.687 (§ 7) sits rightmost on the line.

```js
option = {
  backgroundColor: '#0B0B0B', textStyle: { color: '#F5F5F5' },
  grid: [
    { top: 40, height: '55%', backgroundColor: '#141414', borderColor: '#262626', borderWidth: 1 },
    { top: '70%', height: '22%', backgroundColor: '#141414', borderColor: '#262626', borderWidth: 1 }
  ],
  xAxis: [
    { gridIndex: 0, type: 'category', data: decadeLabels, axisLine:{lineStyle:{color:'#262626'}}, axisLabel:{color:'#A3A3A3'} },
    { gridIndex: 1, type: 'category', data: decadeLabels, axisLine:{lineStyle:{color:'#262626'}}, axisLabel:{color:'#A3A3A3'} }
  ],
  yAxis: [
    { gridIndex: 0, type: 'category', data: ['SPX','UST10','Tbill','Gold','Cmdty'], axisLabel:{color:'#A3A3A3'}, splitLine:{lineStyle:{color:'#1C1C1C'}} },
    { gridIndex: 1, name: 'PA', min: 0, max: 1, nameTextStyle:{color:'#A3A3A3'}, axisLabel:{color:'#A3A3A3'}, splitLine:{lineStyle:{color:'#1C1C1C'}} }
  ],
  visualMap: { min: 1, max: 5, orient: 'horizontal', left: 'center', bottom: 0, textStyle:{color:'#A3A3A3'},
    inRange: { color: ['#00D08C','#7FFFD4','#D4A373','#E5484D','#080808'] } },
  series: [
    { type: 'heatmap', xAxisIndex: 0, yAxisIndex: 0, data: rankMatrix,
      label: { show: true, color: '#F5F5F5' }, itemStyle:{borderColor:'#262626',borderWidth:1} },
    { type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: paSeries, symbolSize: 8,
      lineStyle: { color: '#00D08C', width: 2 },
      markLine: { lineStyle: { color: '#E5484D', type: 'dashed' },
        data: [{ yAxis: 0.67 }, { yAxis: 0.33 }] } }
  ],
  tooltip: { trigger: 'axis', backgroundColor: '#1C1C1C', borderColor: '#262626', textStyle: { color: '#F5F5F5' } }
};
```

Stage chips: EARLY `#00D08C`, MID `#D4A373`, LATE `#E5484D`. Tertiary labels `#6B7280`.

## § 9 Integration Points

**Upstream data:** Damodaran `histretSP.xls`; FRED (`TB3MS`, `FEDFUNDS`, `DFII10`, `CPIAUCSL`, `GDPC1`, `A463RC1Q027SBEA`, `GDP`, `PPIACO`); S&P DJI buyback XLSX; OECD Tax DB; archive.yardeni IBES PDF; LBMA gold JSON.

**Upstream frameworks:** 1.1 Economic Machine (`trend_growth_pct` seeds § 5.4 anchor); 1.3 Long-Term Debt Cycle (`late_stage_flag` informs the "1940s-like" monetisation setup).

**Downstream:** 1.6 Big Cycle (reads `paradigm_stage`); 1.7 Inflation (reads `gold_overlay`, `tilt_trigger`); 2.1 Template (reads `next_leader_set`); 2.2 All-Weather (lifts gold to 7.5% when `gold_overlay=ON`); 2.5 Stress-Testing (past `paradigm_stage` transitions as scenarios).

**Not covered:** 250-yr empire dynamics → 1.6; reserve-currency flip → 1.7; debt-cycle endgame → 1.3, 1.4.

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **"About 10 years" is an observation, not a threshold.** No Dalio numeric test for paradigm-end; all PA edges are DERIVED terciles.
2. **Tailwind triggers are qualitative in Dalio.** The four thresholds (real-rate 0.50%, FedFunds 1.00%, buyback 2.5%, profit-share μ+σ, tax-rate post-1986 low) are calibrated to 2018–19; different calibrations shift late-paradigm start dates.
3. **"More opposite than similar" is qualitative.** Spearman ρ is a DERIVED proxy; no Dalio numeric cutoff exists.
4. **Paradigm ≠ calendar decade.** 1970s inflation arguably 1965–82; 2000s paradigm arguably ended 2008. Calendar bucketing follows the essay but introduces boundary noise (per R5).
5. **Commodity proxy is PPI, not total-return.** FRED publishes no canonical GSCI TR series; `PPIACO` is the best freely-accessible proxy. Cross-check via S&P DJI GSCI page; deviation >1% downgrades commodity-rank reliability.
6. **Long-run EPS-growth anchor 6.4% nominal.** Midpoint of Multpl nominal-growth slices (since-1980 ≈ 6.1%, since-1960 ≈ 7.0%); unit-consistent with IBES nominal 12-mo. Alt anchors (real EPS ~2%) bias the recency sigmoid.
7. **2020s observation is partial.** Confirming the 2020s rotation requires more data; live operation treats 2020+ with low confidence.
8. **Equal 1/3 weighting is stipulated.** No empirical optimisation attempted.

### Sources (all publicly accessible, no login)

- **Primary, Dalio.** Ray Dalio, "Paradigm Shifts," LinkedIn Pulse, 17 July 2019. https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio/
- **Damodaran histretSP** (SPX/UST10/Gold/Tbill). Landing: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html ; Xls: https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls
- **FRED API** (St. Louis Fed) — `TB3MS`, `FEDFUNDS`, `DFII10`, `CPIAUCSL`, `GDPC1`, `PPIACO`, `A463RC1Q027SBEA`, `GDP`. https://fred.stlouisfed.org/docs/api/fred/
- **S&P DJI — SPX Buyback XLSX** (primary for `BuybackYield`): https://www.spglobal.com/spdji/en/documents/additional-material/sp-500-buyback.xlsx
- **S&P DJI — S&P GSCI page** (commodity TR cross-check): https://www.spglobal.com/spdji/en/indices/commodities/sp-gsci/
- **OECD Tax Database** (statutory corp. tax): https://stats.oecd.org/Index.aspx?DataSetCode=TABLE_II1
- **LBMA gold PM JSON**: https://prices.lbma.org.uk/json/gold_pm.json
- **Yardeni archive — SPX Analysts' Consensus** (IBES proxy): https://archive.yardeni.com/pub/sp500analycons.pdf
- **UBS Global Investment Returns Yearbook 2025 (summary)** — external cross-check long-run returns: https://www.ubs.com/global/en/investment-bank/insights-and-data/2025/global-investment-returns-yearbook-2025/
- **Multpl SPX nominal EPS-growth table** (anchor for 6.4% midpoint; "current dollars, not inflation-adjusted"): https://www.multpl.com/s-p-500-earnings-growth/table/by-year
- **NON-DALIO anchors.** Statutory tax from OECD; profit-share baseline from FRED NIPA; EPS CAGR anchor from Multpl nominal-growth panel. Spearman ρ formula is textbook.
