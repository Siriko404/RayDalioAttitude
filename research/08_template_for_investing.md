# 2.1 Template for Investing

## § 1 Executive Summary

Dalio's template: **fundamental · systematic · diversified**. Returns decompose into `cash + beta + alpha`; each of `{beta, alpha}` is engineered as a portfolio of uncorrelated "return streams." The **Holy Grail**: 15-20 "good, uncorrelated" streams cut portfolio volatility up to ~80% at unchanged expected return. This subsection operationalises the stream-count / average-correlation diagnostic that gates whether a portfolio sits in the Holy-Grail regime — independent of specific betas (→ 2.2), alphas (→ 2.3), or leverage (→ 2.4).

## § 2 Dalio's Framework — Verbatim

Primary: **Dalio, "Engineering Targeted Returns and Risks," Bridgewater, Aug 2011** PDF. Printed-footer pagination.

> **Dalio** — "Engineering Targeted Returns and Risks" (Aug 2011), p. 2: "The three basic building blocks of all returns are: • The Risk-Free Return […] • Returns From Betas--The excess returns of asset classes over the risk-free return. […] • Returns From Alphas--The value added by managers, which is derived from managers deviating from the betas."

> **Dalio** — p. 2: "Betas are limited in number […] they are typically relatively correlated with each other, and their excess returns are relatively low compared to their excess risks, with Sharpe ratios typically ranging from 0.2 to 0.3."

> **Dalio** — p. 3: "Alphas […] Sources of alpha are numerous and relatively uncorrelated with each other."

> **Dalio** — p. 7: "create a well-diversified portfolio of uncorrelated return streams calibrated to balance each other and to deliver a targeted return."

> **Dalio** — p. 8 (Chart 5): "Alpha Portfolio 1 | Sources Of Value Added: 6 | Average Correlation: 0.25 […] Implied IR: 0.6 || Alpha Portfolio 2 | Sources Of Value Added: 77 | Average Correlation: 0.04 […] Implied IR: 1.4."

> **Dalio** — p. 5: "The Sharpe ratio improvement implies an increase of approximately 65% in the portfolio's expected excess return if risk levels are held steady."

> **Dalio** — LinkedIn slug: "My mantra of investing is fifteen good uncorrelated return streams, risk balanced." https://www.linkedin.com/posts/raydalio_my-mantra-of-investing-is-fifteen-good-uncorrelated-activity-7415437374295310336-X_v_

The "up to 80%" framing is from *Principles* (2017); R9 fair-use in § 10.

## § 3 Decision Problem

**Is the portfolio in the Holy-Grail regime, or a concentration bet in disguise?** Given `N` streams with vols `{σ_i}` and pairwise ρ_{ij}, emit: `N_eff`, `ρ_bar`, `σ_p/σ_bar`, `HolyGrailRegime ∈ {NONE, PARTIAL, FULL}`. Consumed by 2.2 (sizing gate `N_eff ≥ 15`), 2.3 (`ρ_bar_alpha ≤ 0.1`), 2.4 (leverage `L = σ_target / σ_p`), 2.5 (`ρ_bar` stress).

## § 4 Input Variables Table

Descriptions paraphrase official FRED / data-provider series pages verified in-session. FRED endpoints share the base `https://api.stlouisfed.org/fred/series/observations?series_id={id}&api_key={k}&file_type=json`.

| name | description | unit | data source | API endpoint | update freq | typical range |
|---|---|---|---|---|---|---|
| `P_sp500` | "S&P 500 […] gauge of the large cap U.S. equities market […] does not contain dividends" | index | FRED | id=`SP500` | D | 600–6500 |
| `Y_10y` | "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis" | % | FRED | id=`DGS10` | D | 0.5–16 |
| `Y_3m` | "3-Month Treasury Bill Secondary Market Rate, Discount Basis" (risk-free proxy, § 2 p. 2) | % | FRED | id=`DTB3` | D | 0–15 |
| `S_hy` | "ICE BofA US High Yield Index Option-Adjusted Spread" | bps | FRED | id=`BAMLH0A0HYM2` | D | 250–2000 |
| `P_gold` | "Gold Fixing Price 3:00 P.M. (London time)" LBMA PM USD/oz | USD/oz | FRED | id=`GOLDPMGBD228NLBM` | D | 250–3500 |
| `P_wti` | "Crude Oil Prices: West Texas Intermediate (WTI) - Cushing, Oklahoma" | USD/bbl | FRED | id=`DCOILWTICO` | D | 10–170 |
| `FX_DXY` | "Nominal Broad U.S. Dollar Index" (Fed H.10) | index (Jan-2006=100) | FRED | id=`DTWEXBGS` | D | 85–135 |
| `P_eem` | MSCI Emerging Markets ETF daily close | USD | Stooq | `stooq.com/q/d/l/?s=eem.us&i=d` | D | 15–60 |
| `P_agg` | Bloomberg US Aggregate Bond ETF daily close | USD | Stooq | `stooq.com/q/d/l/?s=agg.us&i=d` | D | 80–120 |
| `r_{i,t}` | Daily log excess return per stream (derived from above) | decimal | derived | — | D | ±0.10 |
| `ρ_{ij}` | 252-day rolling Pearson correlation of daily excess returns | unitless | derived | — | D rolling | −0.9 to 0.9 |
| `σ_i` | 252-day rolling annualised vol, `sd(r)·√252` | decimal | derived | — | D rolling | 0.02–0.60 |

> **DERIVED (operational)** — 252-day window for `ρ_{ij}` / `σ_i` is industry standard (1 trading year, annualised), not Dalio-prescribed. Dalio's Engineering paper uses multi-decade back-tests (1925 onward); 252-day is a current-conditions compromise between regime stability and reactivity.

## § 5 Computation / Transformations

### 5.1 Excess-return stream

For each stream `i` day `t`, matching Dalio's p. 2 `Returns From Betas = asset return − risk-free`:

$$\tilde r_{i,t} = \ln(P_{i,t}/P_{i,t-1}) - r^{f}_{t}/252$$

`r^f_t` = DTB3 yield (decimal). For yields (e.g. `Y_10y`), return proxy is `\tilde r_{10y,t} \approx -D\cdot \Delta Y_{10y,t}`, `D = 8.5`.

> **NON-DALIO (industry standard)** — PIMCO, "Bond Basics: Duration and Convexity," https://www.pimco.com/en-us/resources/education/understanding-bond-basics . Used because Dalio does not specify a duration; 8.5 is the approximate 10-yr on-the-run modified duration at coupon ≈ 4%.

### 5.2 Rolling correlation and average

$$\rho_{ij,t} = \frac{\sum_{s=t-251}^{t}(\tilde r_{i,s}-\bar{\tilde r}_i)(\tilde r_{j,s}-\bar{\tilde r}_j)}{\sqrt{\sum(\tilde r_{i,s}-\bar{\tilde r}_i)^2\sum(\tilde r_{j,s}-\bar{\tilde r}_j)^2}}, \quad \bar\rho_t = \frac{2}{N(N-1)}\sum_{i<j}\rho_{ij,t}$$

### 5.3 Portfolio volatility — equal-weight, equal-vol closed form

Expanding `Var(∑ wᵢrᵢ)` with `wᵢ=1/N`, `σᵢ=σ`, `ρᵢⱼ=ρ` (i≠j) yields the identity driving the Holy-Grail argument:

$$\boxed{\;\frac{\sigma_p}{\sigma} = \sqrt{\frac{1 + (N-1)\rho}{N}}\;}$$

Limits: `N→∞ ⇒ σ_p/σ → √ρ` (floor — cannot diversify below residual common factor); `ρ=0 ⇒ σ_p/σ = 1/√N` (classical √N rule); `ρ=1 ⇒ σ_p/σ = 1` (no diversification).

### 5.4 Effective stream count

$$N_{\text{eff}} = \frac{N}{1 + (N-1)\bar\rho}$$

so that `σ_p/σ = 1/√N_eff` for any `(N, ρ)` pair. `N_eff` collapses the two-parameter space onto the x-axis of the ρ=0 curve.

> **DERIVED (operational)** — `N_eff` is an algebraic re-expression of § 5.3, not a Dalio-named construct. It makes Dalio's p. 8 comparison (P1: N=6, ρ=0.25, N_eff=2.67 vs P2: N=77, ρ=0.04, N_eff=19.06) directly interpretable as "effectively 3 vs 19 independent streams." Ratio `√(N_eff2/N_eff1) = √(19.06/2.67) = 2.67×` ≈ Dalio's published "~2.5× better IR" (p. 8); within rounding the two match.

## § 6 Output Variables & Decision Rules

### 6.1 Holy-Grail regime classifier

> **DERIVED (operational)** — Dalio gives a range ("fifteen to twenty" in *Principles* 2017; "fifteen good" in LinkedIn mantra) and a ceiling ("up to 80%"); he does not publish regime edges. Edges below are chosen so the p. 8 Alpha Portfolio 2 (N=77, ρ=0.04, `N_eff=19.1`) lands FULL; Portfolio 1 (N=6, ρ=0.25, `N_eff=2.7`) and a traditional 60/40 (N=2, ρ≈0.4, `N_eff≈1.4`) land NONE.

| HolyGrailRegime | `N_eff` | `σ_p/σ` | Interpretation |
|---|---|---|---|
| NONE | < 5 | > 0.447 | Concentration bet; < 5 effectively independent streams |
| PARTIAL | 5 – 14 | 0.267 – 0.447 | Meaningfully diversified; σ-reduction ~55–73% |
| FULL | ≥ 15 | ≤ 0.258 | Holy-Grail regime; σ-reduction ≥ 74% |

At `N_eff=15`, `σ_p/σ = 1/√15 = 0.258` (74% red.); at `N_eff=25`, `σ_p/σ = 0.200` (80%, matching Dalio's "up to 80%").

### 6.2 Correlation-quality tag

> **DERIVED (operational)** — Edges align with Dalio anchors: p. 8 Alpha P2 `ρ=0.04` lands UNCORRELATED; P1 `ρ=0.25` lands LIGHTLY-CORRELATED; the within-asset-class `ρ≈0.6` Dalio cites on p. 2 for betas lands HIGHLY-CORRELATED; the `ρ=0.98` of 50/50 stocks/bonds ("Our Thoughts…" 9/16/2015, p. 2) lands DOMINATED.

| `ρ_bar` tag | Range | Floor `√ρ` |
|---|---|---|
| UNCORRELATED | < 0.10 | < 31.6% |
| LIGHTLY-CORRELATED | 0.10 – 0.30 | 31.6 – 54.8% |
| HIGHLY-CORRELATED | 0.30 – 0.70 | 54.8 – 83.7% |
| DOMINATED | ≥ 0.70 | ≥ 83.7% |

### 6.3 Downstream action rules

- `Regime = NONE` → 2.2 flags concentration; 2.4 denies incremental leverage; 2.5 runs forced `ρ_bar → 0.8` stress.
- `Regime = PARTIAL` → 2.3 increases alpha-sleeve diversification mandate until `N_eff ≥ 15`.
- `Regime = FULL` ∧ `ρ_bar` = UNCORRELATED → 2.4 may lever `σ_p` to target; 2.5 stress-tests `ρ_bar → 0.4` (the crisis-correlation failure mode).

## § 7 Worked Numeric Example

Illustrative numbers, clearly labelled. Vol annualised decimal; ρ unitless.

**Step 1 — calibrate to Dalio's own p. 8 Chart 5.** Reproduce both Alpha Portfolios so the derived formula passes R14 on Dalio's data before extending.

| Portfolio | `N` | `ρ_bar` | `N_eff` | `σ_p/σ` | σ-red. |
|---|---:|---:|---:|---:|---:|
| p. 8 Alpha P1 | 6 | 0.25 | 6/2.25 = 2.667 | √0.3750 = 0.6124 | 38.76% |
| p. 8 Alpha P2 | 77 | 0.04 | 77/4.04 = 19.06 | √0.05247 = 0.2291 | 77.09% |

R14 P1: 5·0.25=1.25; 2.25/6=0.3750; √=0.61237; 1−0.61237=0.38763. ✓
R14 P2: 76·0.04=3.04; 4.04/77=0.052468; √=0.22906; 1−0.22906=0.77094. ✓
Dalio-anchor check: his IR ratio 1.4/0.6 = 2.33×; derived `√(N_eff2/N_eff1)` = √(19.06/2.667) = 2.674×. Dalio's "~2.5× better" (p. 8) falls between the two — consistent with Chart-5 rounding.

**Step 2 — canonical grid, `σ = 10%` per stream.**

| `N` \ `ρ` | 0 | 0.10 | 0.25 | 0.50 | 0.75 | 1.00 |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 10.000 | 10.000 | 10.000 | 10.000 | 10.000 | 10.000 |
| 2 | 7.071 | 7.416 | 7.906 | 8.660 | 9.354 | 10.000 |
| 5 | 4.472 | 5.292 | 6.325 | 7.746 | 8.944 | 10.000 |
| 7 | 3.780 | 4.781 | 5.976 | 7.559 | 8.864 | 10.000 |
| 10 | 3.162 | 4.359 | 5.701 | 7.416 | 8.803 | 10.000 |
| 15 | **2.582** | 4.000 | 5.477 | 7.303 | 8.756 | 10.000 |
| 20 | **2.236** | 3.808 | 5.362 | 7.246 | 8.732 | 10.000 |
| 25 | **2.000** | 3.688 | 5.292 | 7.211 | 8.718 | 10.000 |
| 50 | 1.414 | 3.435 | 5.148 | 7.141 | 8.689 | 10.000 |
| 100 | 1.000 | 3.302 | 5.074 | 7.106 | 8.675 | 10.000 |
| ∞ floor | 0.000 | 3.162 | 5.000 | 7.071 | 8.660 | 10.000 |

R14 (N=15, ρ=0): 1/15=0.06667; √=0.25820; ×10%=2.582. ✓
R14 (N=25, ρ=0): 1/25=0.04; √=0.2000; ×10%=2.000. ✓ (80.0% red., matching Dalio's "up to 80%")
R14 (N=15, ρ=0.10): 2.40/15=0.16; √=0.40; ×10%=4.000. ✓ (60.0% red., realistic case)

**Step 3 — grid reading.**
- Dalio's "up to 80%" requires `ρ≈0` and `N≥25`. At ρ=0: 74% (N=15), 78% (N=20), 80% (N=25). "Up to" is literal.
- At ρ=0.10: N=15 delivers 60%; floor is 31.6%. Claiming 80% without measuring `ρ_bar` overstates by ~20 pp.
- At ρ=0.25: floor is 50% no matter the N. Dalio's p. 8 fix upgrades from ρ=0.25 to ρ=0.04 (correlation reduction), not merely stream count.

**Step 4 — sample 8-stream panel.** `streams = {US_eq, non_US_eq, EM_eq, 10y_UST, HY_credit, gold, WTI_oil, USD_broad}`. Illustrative `ρ_bar ≈ 0.22` (typical cross-asset 252-day average, risk-on regime; see § 10 note 3).

`N_eff = 8/(1 + 7·0.22) = 8/2.54 = 3.150`; `σ_p/σ = √(2.54/8) = √0.3175 = 0.5635` → red. = 43.65%.
R14: 7·0.22=1.54; 8/2.54=3.1496; 2.54/8=0.3175; √=0.5635; 1−0.5635=0.4365. ✓

Tag: `Regime = NONE` (N_eff=3.15 < 5); `ρ_bar` = LIGHTLY-CORRELATED. Downstream: 2.2 flags concentration; 2.3 demands uncorrelated alpha sleeves; 2.4 denies leverage; 2.5 runs `ρ_bar → 0.8` stress.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// file: dalio_dashboard/template_for_investing.js
const FRED = (id,k) => `https://api.stlouisfed.org/fred/series/observations`+
  `?series_id=${id}&api_key=${k}&file_type=json&observation_start=2015-01-01`;
const STOOQ = s => `https://stooq.com/q/d/l/?s=${s}&i=d`;

const STREAMS = [
  {key:'US_eq',src:'FRED', id:'SP500'},
  {key:'EM_eq',src:'STOOQ',id:'eem.us'},
  {key:'UST10',src:'FRED', id:'DGS10', kind:'yield', dur:8.5},
  {key:'HY',   src:'FRED', id:'BAMLH0A0HYM2', kind:'spread'},
  {key:'gold', src:'FRED', id:'GOLDPMGBD228NLBM'},
  {key:'oil',  src:'FRED', id:'DCOILWTICO'},
  {key:'USD',  src:'FRED', id:'DTWEXBGS'}
];

async function holyGrail(key, streams=STREAMS, win=252) {
  const rets = {}, ks = [];
  for (const s of streams) {
    const url = s.src==='FRED' ? FRED(s.id,key) : STOOQ(s.id);
    rets[s.key] = excessLogReturns(parseSeries(await(await fetch(url)).text(),s));  // § 5.1
    ks.push(s.key);
  }
  const N = ks.length;
  let sum=0, cnt=0;                                             // § 5.2 avg off-diag
  for (let i=0;i<N;i++) for (let j=i+1;j<N;j++) {
    sum += pearson(rets[ks[i]].slice(-win), rets[ks[j]].slice(-win));
    cnt++;
  }
  const rhoBar = sum/cnt;
  const Neff = N / (1 + (N-1)*rhoBar);                          // § 5.4
  const sigRatio = Math.sqrt((1 + (N-1)*rhoBar) / N);           // § 5.3
  const regime = Neff>=15 ? 'FULL' : Neff>=5 ? 'PARTIAL' : 'NONE';
  const corrTag = rhoBar<0.10 ? 'UNCORRELATED'
                : rhoBar<0.30 ? 'LIGHTLY-CORRELATED'
                : rhoBar<0.70 ? 'HIGHLY-CORRELATED' : 'DOMINATED';
  return {N, rhoBar, Neff, sigRatio, reduction:1-sigRatio, regime, corrTag};
}
```

Consumer: `dalio_dashboard.html` renders `HolyGrailGauge` (N_eff, σ-reduction, `ρ_bar` chip) and feeds `regime` into 2.2 / 2.4 / 2.5 widgets.

### 8b. Excel — sheet layout, Power Query M, key formulas

Workbook `dalio_model.xlsx`, sheet `8_HolyGrail`. One Power Query per FRED id:

```m
let R = Csv.Document(Web.Contents(
    "https://fred.stlouisfed.org/graph/fredgraph.csv", [Query=[id=SERIES_ID]]),
    [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
  H = Table.PromoteHeaders(R,[PromoteAllScalars=true]),
  T = Table.TransformColumnTypes(H, {{"DATE",type date},{SERIES_ID,type number}})
in T
```

Cols `A Date | B SP500 | C DGS10 | D DTB3 | E HY_OAS | F Gold | G WTI | H DXY | I-O log-returns | P ρ_{i,j} | Q N_eff`. Formulas: `=LN(B3/B2)` (log ret); `=I3-$D3/100/252` (excess); `=STDEV(I$3:I$254)*SQRT(252)` (ann vol); `=CORREL(I$3:I$254,J$3:J$254)` (ρ); `=(SUM(ρmat)-N)/(N*(N-1))` (`ρ_bar`); `=N/(1+(N-1)*ρ_bar)` (`N_eff`); `=SQRT((1+(N-1)*ρ_bar)/N)` (`σ_p/σ`); `=IFS(N_eff>=15,"FULL",N_eff>=5,"PARTIAL",TRUE,"NONE")`.

### 8c. ECharts config — chart type, encoding, palette tokens

Line chart of σ_p vs N at four ρ levels; values transcribed byte-for-byte from § 7 Step 2 (σ=10% / stream).

```js
const ax = { axisLine:{lineStyle:{color:'#262626'}}, axisLabel:{color:'#A3A3A3'} };
const panel = { backgroundColor:'#141414', borderColor:'#262626', borderWidth:1 };

const N_vals      = [1, 2, 5, 7, 10, 15, 20, 25, 50, 100];
const sig_rho0    = [10.000, 7.071, 4.472, 3.780, 3.162, 2.582, 2.236, 2.000, 1.414, 1.000];
const sig_rho025  = [10.000, 7.906, 6.325, 5.976, 5.701, 5.477, 5.362, 5.292, 5.148, 5.074];
const sig_rho050  = [10.000, 8.660, 7.746, 7.559, 7.416, 7.303, 7.246, 7.211, 7.141, 7.106];
const sig_rho075  = [10.000, 9.354, 8.944, 8.864, 8.803, 8.756, 8.732, 8.718, 8.689, 8.675];

option = {
  backgroundColor: '#0B0B0B', textStyle:{color:'#F5F5F5'},
  title: { text:'Holy Grail — σ_p vs # uncorrelated streams',
           left:20, top:10, textStyle:{color:'#F5F5F5', fontSize:14} },
  legend: { data:['ρ=0','ρ=0.25','ρ=0.50','ρ=0.75'],
            textStyle:{color:'#A3A3A3'}, top:35 },
  grid: [{ top:80, left:80, right:40, bottom:60, ...panel }],
  xAxis: [{ type:'log', name:'N streams', data:N_vals, ...ax,
            nameTextStyle:{color:'#A3A3A3'} }],
  yAxis: [{ type:'value', name:'σ_p (%)', min:0, max:11, ...ax,
            nameTextStyle:{color:'#A3A3A3'},
            splitLine:{lineStyle:{color:'#1C1C1C'}} }],
  series: [
    { name:'ρ=0',    type:'line', smooth:true, data:sig_rho0,
      itemStyle:{color:'#00D08C'}, lineStyle:{color:'#00D08C', width:2} },
    { name:'ρ=0.25', type:'line', smooth:true, data:sig_rho025,
      itemStyle:{color:'#7FFFD4'}, lineStyle:{color:'#7FFFD4', width:2} },
    { name:'ρ=0.50', type:'line', smooth:true, data:sig_rho050,
      itemStyle:{color:'#D4A373'}, lineStyle:{color:'#D4A373', width:2} },
    { name:'ρ=0.75', type:'line', smooth:true, data:sig_rho075,
      itemStyle:{color:'#E5484D'}, lineStyle:{color:'#E5484D', width:2} }
  ],
  markLine:{ data:[{ xAxis:15, label:{formatter:'N=15',color:'#F5F5F5'},
             lineStyle:{color:'#6B7280', type:'dashed'} }] },
  tooltip:{ trigger:'axis', backgroundColor:'#1C1C1C',
            borderColor:'#262626', textStyle:{color:'#F5F5F5'} }
};
```

ρ=0 at N=15 = 2.582 (= 74.2% σ-red.); matches § 7 and § 6 byte-for-byte.

## § 9 Integration Points

**Upstream:** FRED (`SP500`, `DGS10`, `DTB3`, `BAMLH0A0HYM2`, `GOLDPMGBD228NLBM`, `DCOILWTICO`, `DTWEXBGS`); Stooq (`eem.us`, `efa.us`, `agg.us`). **1.6** `StageTag`/`HegemonyRisk` can alter stream eligibility (DECLINE may add non-USD FX); **1.7** inflation regime gates gold / TIPS inclusion.

**Downstream:** **2.2** consumes `HolyGrailRegime` as sizing gate — the 4-box allocation must yield `N_eff ≥ 15` at risk-weighted scoring. **2.3** owns the alpha-stream equivalent (`ρ_alpha_bar`, alpha-sleeve `N_eff`); this subsection delivers measurement only. **2.4** scales `σ_p` to target via leverage `L = σ_target / σ_p`. **2.5** runs forced `ρ_bar → 0.4 / 0.8` crisis-correlation stress tests.

**OUT-of-scope pointers:** 4-box + canonical 30/40/15/7.5/7.5 weights → **2.2**; IR / bet-sizing math → **2.3**; leverage ratio / funding cost → **2.4**; scenario archetypes → **2.5**.

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **Stream-count range.** Dalio says "fifteen to twenty" (*Principles* 2017); "fifteen good" (LinkedIn mantra); "10 to 15" (short-form video). Registry commits 15-20; § 6 uses `N_eff ≥ 15`. `N_eff ≥ 20` is defensible (80%-reduction within 2 pp).
2. **"80%" caveats.** Match only at `ρ≈0` and `N≥20–25`. Cross-asset panels typically sit at `ρ_bar ≈ 0.15–0.30`, ceiling 50–69%. § 6's `HolyGrailRegime` uses `N_eff` (ρ-penalised) to avoid overstatement.
3. **Rolling window stipulated.** 252-day is industry standard. Dalio ("Our Thoughts…" p. 11) notes correlations "aren't stable"; the rolling-ρ gauge is a diagnostic, not a weighting rule.
4. **Stream granularity.** Dalio runs ~1000 streams (Principles 2017 anecdote). Math is scale-invariant; what counts as a stream is PM policy.
5. **Equal-vol / equal-weight.** § 5.3 assumes `σ_i=σ`, `w_i=1/N`. Real portfolios need `σ_p²=w'Σw`; the proxy is adequate for regime diagnosis, not for leverage sizing (2.4).
6. **Crisis correlation.** `ρ_bar` unstable in crises; 2.5 handles the tail.
7. **Alpha IR precondition.** Holy Grail presupposes positive expected IR per stream. Dalio p. 3 notes alpha risk-adjusted returns "slightly negative on average"; 15 bad-IR streams are not Holy-Grail. IR filtering → 2.3.

### Sources (all public, WebFetch'd and text-extracted in-session)

**Primary (Dalio / Bridgewater).**
- Ray Dalio, "Engineering Targeted Returns and Risks," Bridgewater Associates, August 2011 PDF. Printed-footer pagination verified via pdftotext. https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf
- Ray Dalio / Bob Prince / Greg Jensen, "Our Thoughts About Risk Parity and All-Weather," Bridgewater Daily Observations, 16 September 2015 PDF. Mirror: https://www.ahwilliamsco.com/includes/OurThoughtsaboutRiskParityandAllWeather.pdf
- Bridgewater (Saphier / Karniol-Tambour / Margolis), "Geographic Diversification Can Be a Lifesaver, Yet Most Portfolios Are Highly Geographically Concentrated," February 2019 PDF. Mirror: https://mebfaber.com/wp-content/uploads/2020/01/Geographic-Diversification-Can-Be-a-Lifesaver-1.pdf
- Dalio LinkedIn, mantra post (headline slug verbatim). https://www.linkedin.com/posts/raydalio_my-mantra-of-investing-is-fifteen-good-uncorrelated-activity-7415437374295310336-X_v_

**Commercial book (R9 fair-use only).**
- Ray Dalio, *Principles: Life and Work*, Simon & Schuster, 2017. Publisher page: https://www.simonandschuster.com/books/Principles/Ray-Dalio/9781501124020 . Cited for the "fifteen to twenty good, uncorrelated return streams" phrasing and the Brian-Gold-chart anecdote (one R9-compliant sentence above).

**Data.** FRED v1 API `https://api.stlouisfed.org/fred/series/observations?series_id={id}&api_key={key}&file_type=json`. Series: `SP500` https://fred.stlouisfed.org/series/SP500 ; `DGS10` https://fred.stlouisfed.org/series/DGS10/ ; `DTB3` https://fred.stlouisfed.org/series/DTB3 ; `BAMLH0A0HYM2` https://fred.stlouisfed.org/series/BAMLH0A0HYM2 ; `GOLDPMGBD228NLBM` https://fred.stlouisfed.org/series/GOLDPMGBD228NLBM ; `DCOILWTICO` https://fred.stlouisfed.org/series/DCOILWTICO ; `DTWEXBGS` https://fred.stlouisfed.org/series/DTWEXBGS . Stooq `https://stooq.com/q/d/l/?s={ticker}&i=d` for `eem.us`, `efa.us`, `agg.us`.

**Industry-standard gap-closer.** PIMCO, "Bond Basics: Duration," https://www.pimco.com/en-us/resources/education/understanding-bond-basics — § 5.1 duration constant (`D = 8.5`), Dalio silent on duration.
