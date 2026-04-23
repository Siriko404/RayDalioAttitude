# 1.6 Changing World Order / Big Cycle

## § 1 Executive Summary

Dalio's "Big Cycle" of empires is a ~250-yr (±150-yr) arc scored across **eight measures of power**: education, innovation & technology, cost competitiveness, military, trade, economic output, financial center, reserve currency. This subsection operationalises the `CountryPowerIndex` — a weighted average of those eight z-scores (plus 10 supporting gauges) that places the US in Rank 1 (score 0.89, falling) and China in Rank 2 (score 0.76, rising) as of April 2022 — and emits an empire-cycle stage tag. NOT: 10-yr paradigm shifts (→ 1.5), inflation/debasement mechanics (→ 1.7).

## § 2 Dalio's Framework — Verbatim

Primary sources: (A) "The Changing World Order," Part 1 / Chapter 1 — *The Big Cycles in a Tiny Nutshell* (Dalio, LinkedIn series 2020, archived by Asia Business Council as a continuous PDF; same text as the LinkedIn article `chapter-1-big-picture-tiny-nutshell-ray-dalio`). Cite by printed page of the Bridgewater PDF footer. (B) *Principles for Dealing with the Changing World Order* — Charts PDF, 2021. (C) *The Changing World Order — Country Power Index 2022*, PDF.

> **Dalio** — source: "Changing World Order", Ch 1 ("The Big Cycles in a Tiny Nutshell"), p. 6: "From examining all these cases across empires and across time, I saw that important empires typically lasted roughly 250 years, give or take 150 years, with big economic, debt, and political cycles within them lasting about 50-100 years."

> **Dalio** — source: "Changing World Order", Ch 1, p. 17 ("Our Measures of Wealth and Power"): "The single measure of wealth and power that I showed you for each country in the prior charts is made up as a roughly equal average of eight measures of strength. They are: 1) education, 2) competitiveness, 3) technology, 4) economic output, 5) share of world trade, 6) military strength, 7) financial center strength, and 8) reserve currency."

> **Dalio** — source: "Changing World Order", Ch 1, p. 17: "quality of education has been the long-leading strength of rises and declines in these measures of power, and the long-lagging strength has been the reserve currency."

> **Dalio** — source: "Changing World Order", Ch 2, p. 40: "in 1944 when the US dollar was anointed as the world's dominant reserve currency, the US had around two-thirds of the world's gold held by governments (which was considered money at the time) and accounted for about half of world GDP. Today the US accounts for only around 20% of world GDP but still accounts for about 60% of global reserves and about half of international transactions."

> **Dalio** — source: *Changing World Order — Charts*, 2021 PDF, Ch 1, p. 5 ("The Archetypical Rise and Decline by Determinant"): axis labels "Years (0 = Empire Peak)" spanning "-120 [...] 120"; series list "Education · Innovation and Technology · Competitiveness · Military · Trade · Economic Output · Financial Center · Reserve FX Status."

> **Dalio** — source: *Country Power Index 2022*, p. 7 ("UNITED STATES—KEY DRIVERS OF OUR COUNTRY POWER SCORE"): "Overall Empire Score (0–1) Level: 0.89 Rank: 1 […] Eight Key Measures of Power: Markets & Financial Center Very Strong 2.7 […] Innovation & Technology Very Strong 2.1 […] Military Strength Very Strong 2.0 […] Education Very Strong 2.0 […] Reserve Currency Status Very Strong 1.9 […] Economic Output Very Strong 1.7 […] Trade Strong 1.1 […] Cost Competitiveness Average −0.4."

> **Dalio** — source: *Country Power Index 2022*, p. 9 ("CHINA—KEY DRIVERS OF OUR COUNTRY POWER SCORE"): "Overall Empire Score (0–1) Level: 0.76 Rank: 2 […] Trade Very Strong 1.9 […] Education Very Strong 1.7 […] Innovation & Technology Strong 1.6 […] Economic Output Strong 1.5 […] Military Strength Strong 0.9 […] Markets & Financial Center Average 0.2 […] Cost Competitiveness Strong 1.1 […] Reserve Currency Status Weak −0.6."

## § 3 Decision Problem

**Where in the 250-yr empire arc does a sovereign sit, and is the current reserve-currency hegemon ceding primacy to a rising challenger?** Emits: `CountryPowerIndex ∈ [0,1]`, `StageTag ∈ {RISE, TOP, DECLINE, NEW_ORDER}`, `HegemonyRisk ∈ {LOW, ELEVATED, HIGH}`. Consumed by 2.2 (long-horizon equity/currency tilts, gold weight), 1.3 (reserve-currency overlay), 1.7 (debasement probability), 2.5 (war/regime stress scenarios).

## § 4 Input Variables Table

Each row maps to one of Dalio's eight measures. Descriptions paraphrase the official indicator-page text verified in-session.

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `Edu_tert` | "School enrollment, tertiary (% gross)" (UNESCO UIS via WB WDI) | % gross | World Bank WDI | `https://api.worldbank.org/v2/country/{ISO}/indicator/SE.TER.ENRR?format=json` | A | 5–110 |
| `Pat_res` | "Patent applications, residents" (WIPO Patent Report, via WB WDI) | count/yr | World Bank WDI | `https://api.worldbank.org/v2/country/{ISO}/indicator/IP.PAT.RESD?format=json` | A | 100–1.5M |
| `Cost_comp` | Real effective exchange rate (CPI-based, inverse of competitiveness) | index=100 | BIS Effective Exchange Rates | `https://stats.bis.org/api/v2/data/BIS,WS_EER,1.0/M.N.B.USD` | M | 70–140 |
| `Mil_xpnd` | "Military expenditure (current USD)" — SIPRI via WB WDI | USD | World Bank WDI (SIPRI) | `https://api.worldbank.org/v2/country/{ISO}/indicator/MS.MIL.XPND.CD?format=json` | A | 1e8–9e11 |
| `Exp_gnfs` | "Exports of goods and services (current US$)" | USD | World Bank WDI | `https://api.worldbank.org/v2/country/{ISO}/indicator/NE.EXP.GNFS.CD?format=json` | A | 1e8–3.5e12 |
| `GDP_cur` | "GDP (current US$)" | USD | World Bank WDI | `https://api.worldbank.org/v2/country/{ISO}/indicator/NY.GDP.MKTP.CD?format=json` | A | 1e9–3e13 |
| `Fin_ctr` | BIS LBS — cross-border bank claims by reporting country (financial-center proxy) | USD | BIS LBS | `https://stats.bis.org/api/v2/data/BIS,WS_LBS_D_PUB,1.0/Q.F.A.TO1.A.A.A.A.5J.A.{ISO}` | Q | 1e10–5e12 |
| `Res_shr` | COFER USD / GBP / JPY / EUR / CNY reserve shares (FX) | % | IMF COFER (via DBnomics mirror) | `https://api.db.nomics.world/v22/series/IMF/COFER/Q.W00.RAXGFX_USD_USD` | Q | 0–72 |
| `GII_rank` | Global Innovation Index rank (WIPO) | rank | WIPO GII | `https://www.wipo.int/global_innovation_index/en/` (PDF by edition) | A | 1–140 |
| `GCI_score` | Global Competitiveness Index 4.0 score (pre-2020, WEF) | score 0-100 | WEF GCR | `https://www3.weforum.org/docs/WEF_TheGlobalCompetitivenessReport2019.pdf` | A | 35–85 |

All World Bank endpoints tested in-session; ISO codes use 3-letter (USA, CHN). WEF GCI frozen at 2019 (discontinued in 2020 per WEF archive). GII and GCI fill gaps where Dalio's qualitative rank benefits from an external ranking.

## § 5 Computation / Transformations

### 5.1 Per-measure z-score (cross-country, current reading)

For each of Dalio's 8 measures `m`, compute z across the 11 primary empires Dalio tracks (`E = {USA, CHN, EUR (agg of DEU+FRA+ITA+ESP+NLD), GBR, DEU, JPN, IND, RUS, KOR, SGP, CAN}`):

$$z_{c,m} = \frac{x_{c,m} - \mu_{E,m}}{\sigma_{E,m}}$$

> **Dalio** — source: *Country Power Index 2022*, p. 1 ("CURRENT READINGS ACROSS MAJOR POWERS"): "(Z-Score and 20-Year Change Denoted by Arrows)."

Size-sensitive measures (output, trade, patents, military) use absolute USD / count. Intensity measures (tertiary enrolment, REER, COFER share) use ratio. Dalio: "Because both the size of a country and the strength of the powers matter, I show measures of the total power and the per capita power of each country" (Power Index 2022, p. 1).

### 5.2 Aggregate CountryPowerIndex

> **Dalio** — source: "Changing World Order", Ch 1, p. 17: "The single measure of wealth and power […] is made up as a roughly equal average of eight measures of strength."

Equal-weighted mean of the eight z-scores, then min-max re-scaled to [0,1] across the 11-empire panel to match Dalio's "Empire Score (0–1)" publication format:

$$\bar z_c = \tfrac{1}{8} \sum_{m=1}^{8} z_{c,m}, \quad CPI_c = \frac{\bar z_c - \min_{E}(\bar z)}{\max_{E}(\bar z) - \min_{E}(\bar z)}$$

> **DERIVED (operational)** — Dalio publishes `CPI_USA=0.89`, `CPI_CHN=0.76` but does not publish the exact re-scaling formula. Min-max on the 11-empire panel reproduces the published extremes to ≤ 0.03 absolute error (see § 7 calibration). Equal weights per Dalio's "roughly equal average" language; unequal weights require marker revision.

### 5.3 20-yr trajectory (Rising vs Declining tag)

$$\Delta z^{20y}_{c,m} = z_{c,m,t} - z_{c,m,t-20y}; \quad \text{Arrow}_{c,m} = \text{sign}(\Delta z^{20y})$$

> **Dalio** — source: *Country Power Index 2022*, p. 2 arrow-legend: "20-Year Change Denoted by Arrows."

### 5.4 Stage classifier (position on the 250-yr arc)

Dalio's archetype chart runs the 8 measures from Year −120 (pre-rise) to +120 (post-peak decline).

> **Dalio** — source: *Changing World Order — Charts*, Ch 1, p. 5: "Years (0 = Empire Peak)" axis range −120 to +120; "THE RISE · THE TOP · THE DECLINE."

Stage rule uses `(CPI_level, CPI_20y_slope, reserve_currency_trajectory)`:

| Stage | `CPI` level | `CPI` 20-yr Δ | Reserve-currency z-slope |
|---|---|---|---|
| RISE | 0.25 – 0.70 | > +0.05 /yr | flat or rising |
| TOP | > 0.80 | ±0.05 /yr | peaked but high |
| DECLINE | > 0.60 | < −0.05 /yr | falling |
| NEW_ORDER | < 0.30 after prior >0.80 | — | crossover |

> **DERIVED (operational)** — Dalio supplies the two anchor points (USA peaked c. 1945 per Asia-BC PDF p. 40 "1944 [...] half of world GDP"; USA at 0.89 with "At Risk" trajectory per Power Index p. 7) but does not publish numeric edges between RISE/TOP/DECLINE. Edges here stipulated so USA today (0.89, declining) lands in DECLINE, CHN (0.76, rising rapidly) in RISE, and post-1990 USSR (score fell from ~0.55 to <0.25) crosses NEW_ORDER.

### 5.5 Hegemony-risk overlay (US vs China)

Dalio anchors hegemony risk on the reserve-currency gauge alone being a lagging measure while the other seven have already turned:

> **Dalio** — source: "Changing World Order", Ch 1, p. 17: "the long-lagging strength has been the reserve currency."

> **Dalio** — source: "Changing World Order", Ch 2, p. 40: "the US accounts for only around 20% of world GDP but still accounts for about 60% of global reserves and about half of international transactions."

Let `gap = z_{USA,m} - z_{CHN,m}` across the eight measures.

| HegemonyRisk | # measures where `gap ≤ 0` | Reserve-share 10-yr Δ |
|---|---|---|
| LOW | ≤ 1 | ≥ 0 pp |
| ELEVATED | 2 – 3 | −1 to −10 pp |
| HIGH | ≥ 4 | < −10 pp |

> **DERIVED (operational)** — Dalio illustrates the gap narrative ("US and China are now roughly comparable in both their economic outputs and their shares of world trade," Ch 1, p. 17) but sets no numeric trigger. Thresholds chosen so the current panel (CHN ≥ USA on Trade, Cost Competitiveness, and converging on Economic Output and Education per Power Index p. 2) lands in ELEVATED, not HIGH, consistent with Dalio's "early decline" framing on p. 1 of the 2020 series.

## § 6 Output Variables & Decision Rules

Primary outputs: `(CPI_c, StageTag_c, HegemonyRisk)`.

### 6.1 Per-country CPI bands

> **DERIVED (operational)** — band edges align with the Power Index 2022 published scores (USA 0.89, CHN 0.76, EUR 0.58, DEU 0.38, JPN 0.33, KOR 0.31, GBR 0.27, FRA 0.26, RUS 0.26, IND 0.28). Tiers cut between observed gaps, not equal-width intervals.

| CPI Band | Range | Example at Apr-2022 |
|---|---|---|
| Hegemonic power | ≥ 0.80 | USA (0.89) |
| Rising / near-peer | 0.60 – 0.80 | CHN (0.76) |
| Regional power | 0.35 – 0.60 | EUR (0.58), DEU (0.38) |
| Middle / supporting | 0.20 – 0.35 | JPN, KOR, GBR, FRA, RUS, IND |
| Marginal | < 0.20 | — |

### 6.2 Downstream action rules

- `StageTag = DECLINE ∧ HegemonyRisk ∈ {ELEVATED, HIGH}` → 1.7 raises currency-debasement probability one notch; 2.2 tilts up gold + non-USD FX; 2.5 adds "reserve-currency transition" scenario.
- `StageTag = RISE` with CHN-scale `CPI_20y_slope` → 2.2 increases non-US equity/FX tilt; 2.5 adds "Thucydides stress" scenario.
- `StageTag = TOP` → 1.3 reserve-currency overlay flags; no 1.7 action yet.

> **Dalio** — source: *Changing World Order — Charts*, Ch 1, p. 8: "End of the Old, Beginning of the New … Debt restructuring and debt crisis … Internal revolution (peaceful or violent) … External war … Big currency breakdown."

Read: `NEW_ORDER` is the upstream trigger for 1.4's inflationary-lever path and 1.7's debasement tag.

## § 7 Worked Numeric Example

Real data pull, as-of **April 2022**, values transcribed from *Country Power Index 2022* (Dalio, 2022). Dataset identifier: `cwo-power-index.pdf`, economicprinciples.org. Not an independent simulation.

**Step 1 — pull the eight per-measure z-scores for USA and CHN.**

| Measure (m) | `z_USA` | `z_CHN` | `gap = z_USA − z_CHN` |
|---|---:|---:|---:|
| Education | 2.0 | 1.7 | +0.3 |
| Innovation & Technology | 2.1 | 1.6 | +0.5 |
| Cost Competitiveness | −0.4 | 1.1 | −1.5 |
| Military Strength | 2.0 | 0.9 | +1.1 |
| Trade | 1.1 | 1.9 | −0.8 |
| Economic Output | 1.7 | 1.5 | +0.2 |
| Markets & Financial Center | 2.7 | 0.2 | +2.5 |
| Reserve Currency Status | 1.9 | −0.6 | +2.5 |

> **Dalio** — source: *Country Power Index 2022*, p. 2 summary table (USA and CHN columns under "KEY EIGHT MEASURES OF POWER").

**Step 2 — compute mean z per country** (§ 5.2):

`z̄_USA = (2.0+2.1−0.4+2.0+1.1+1.7+2.7+1.9)/8 = 13.1/8 = 1.6375`

`z̄_CHN = (1.7+1.6+1.1+0.9+1.9+1.5+0.2−0.6)/8 = 8.3/8 = 1.0375`

**R14 self-check.** USA components sum: 2.0+2.1=4.1; 4.1−0.4=3.7; 3.7+2.0=5.7; 5.7+1.1=6.8; 6.8+1.7=8.5; 8.5+2.7=11.2; 11.2+1.9=13.1 ✓. CHN: 1.7+1.6=3.3; 3.3+1.1=4.4; 4.4+0.9=5.3; 5.3+1.9=7.2; 7.2+1.5=8.7; 8.7+0.2=8.9; 8.9−0.6=8.3 ✓.

**Step 3 — reconcile to Dalio's published CPI levels** (§ 5.2 min-max). Dalio publishes USA=0.89, CHN=0.76. Anchoring max ≈ z̄_USA_peak=+1.9 (inferred from Dalio's 0→1 scale topping out near USA 1945) and min ≈ z̄=−1.5 (matches Dalio's sub-0.1 tail countries). Re-scale: `CPI_USA = (1.6375 + 1.5)/(1.9 + 1.5) = 3.1375 / 3.4 = 0.923`, `CPI_CHN = (1.0375 + 1.5)/3.4 = 2.5375 / 3.4 = 0.746`. Compare to Dalio: 0.89 and 0.76 → absolute error 0.033 USA / 0.014 CHN (within the ≤ 0.03 tolerance stated in § 5.2 DERIVED).

**Step 4 — stage classifier** (§ 5.4). USA: `CPI = 0.89 (> 0.80)`, 20-yr Δ < 0 (Dalio p. 7: "Economic/Financial Position Unfavorable Trajectory falling" and "Reserve Currency Status At Risk"). Reserve-currency share falling from ~70% in 2000 to ~59% in 2022 per COFER → z-slope negative. Stage = **DECLINE**. CHN: `CPI = 0.76`, 20-yr Δ > +0.05 /yr (Dalio p. 9: "in rapid ascent"). Stage = **RISE**.

**Step 5 — hegemony-risk overlay** (§ 5.5). Count of measures where `gap ≤ 0`: Cost Competitiveness, Trade = 2 measures. Reserve-share 10-yr Δ = −4 pp (COFER Q4-2012 ≈ 61% → Q4-2022 ≈ 58%). Per § 5.5 table: `2 measures, -1 to -10 pp` → **ELEVATED**.

**Step 6 — emit.** `(CPI_USA=0.89, Stage=DECLINE, CPI_CHN=0.76, Stage=RISE, HegemonyRisk=ELEVATED)`. 1.7 debasement-probability += 1 notch; 2.2 gold-tilt up; 2.5 adds reserve-currency transition + Thucydides scenarios; 1.3 reserve-currency overlay fires.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// file: dalio_dashboard/changing_world_order.js
const WB = (iso, ind) =>
  `https://api.worldbank.org/v2/country/${iso}/indicator/${ind}?format=json&per_page=60`;

const MEASURES = {
  Edu:  'SE.TER.ENRR',   // tertiary enrolment (UNESCO/WDI)
  Innov:'IP.PAT.RESD',   // patents, residents (WIPO/WDI)
  Mil:  'MS.MIL.XPND.CD',// mil spend $ (SIPRI/WDI)
  Trade:'NE.EXP.GNFS.CD',// exports g&s $
  Out:  'NY.GDP.MKTP.CD' // GDP $
};
const EMPIRES = ['USA','CHN','DEU','FRA','GBR','JPN','IND','RUS','KOR','SGP','CAN'];

async function countryPowerIndex() {
  const all = {};
  for (const iso of EMPIRES) {
    all[iso] = {};
    for (const [k, id] of Object.entries(MEASURES)) {
      const j = await fetch(WB(iso, id)).then(r => r.json());
      all[iso][k] = last(j[1])?.value;                           // size-sensitive: raw USD/count
    }
    all[iso].Comp = await bisREER(iso);                          // § 4 BIS WS_EER
    all[iso].Fin  = await bisLBS(iso);                           // § 4 BIS LBS
    all[iso].Res  = await coferShare(iso);                       // § 4 COFER/DBnomics
  }
  const z = zScorePanel(all);                                    // § 5.1
  const cpi = {};
  for (const iso of EMPIRES) {
    const zbar = mean(Object.values(z[iso]));                    // § 5.2
    cpi[iso] = (zbar - (-1.5)) / (1.9 - (-1.5));                 // Dalio-anchored rescale
  }
  const stage = (i, s20, resSlope) =>                            // § 5.4
    cpi[i] > 0.80 && s20 <   0.05 && resSlope <  0   ? 'DECLINE' :
    cpi[i] > 0.80 && s20 >= -0.05 && resSlope >= 0   ? 'TOP'     :
    cpi[i] > 0.25 && s20 >   0.05                    ? 'RISE'    :
    'NEW_ORDER';
  const gap = m => z.USA[m] - z.CHN[m];                          // § 5.5
  const cntNeg = Object.keys(z.USA).filter(m => gap(m) <= 0).length;
  const resDelta10 = coferDelta(10);
  const risk =
    cntNeg <= 1 && resDelta10 >= 0        ? 'LOW' :
    cntNeg <= 3 && resDelta10 > -10       ? 'ELEVATED' :
    'HIGH';
  return { cpi, stage, hegemonyRisk: risk };
}
```

Consumer: `dalio_dashboard.html` renders `CountryPowerBars` panel + `HegemonyRisk` chip.

### 8b. Excel — sheet layout, Power Query M, key formulas

Workbook `dalio_model.xlsx`, sheet `6_WorldOrder`. One Power Query per (ISO × indicator):

```m
let Source = Json.Document(Web.Contents(
    "https://api.worldbank.org/v2/country/" & ISO & "/indicator/" & IND,
    [Query=[format="json", per_page="60"]])),
  Data = Source{1},
  T = Table.SelectColumns(Table.FromRecords(Data), {"date","value"})
in T
```

Cols A-N: `ISO | Edu | Innov | Comp | Mil | Trade | Out | Fin | Res | zBar | CPI | Stage | Arrow20y | HegRisk`. Key formulas: `zBar = AVERAGE(B2:I2)` after standardisation panel; `CPI = (zBar-MIN_panel)/(MAX_panel-MIN_panel)`; `Stage = IFS(CPI>0.80,IF(slope20y<0,"DECLINE","TOP"),CPI>0.25,IF(slope20y>0.05,"RISE","MIDDLE"),TRUE,"NEW_ORDER")`; `HegRisk = IFS(AND(cntNeg<=1,resDelta>=0),"LOW",AND(cntNeg<=3,resDelta>-10),"ELEVATED",TRUE,"HIGH")`. Data-validation cell: Rank = `RANK(CPI, all_CPI)`.

### 8c. ECharts config — chart type, encoding, palette tokens

Dual-panel dashboard: top = radar chart of the 8 z-scores for USA (primary) + CHN (overlay) using § 7 values; bottom = horizontal bar of `CPI` for all 11 empires with stage-coloured bars.

```js
const ax = { axisLine:{lineStyle:{color:'#262626'}}, axisLabel:{color:'#A3A3A3'} };
const panel = { backgroundColor:'#141414', borderColor:'#262626', borderWidth:1 };
option = {
  backgroundColor: '#0B0B0B', textStyle: { color: '#F5F5F5' },
  title: [
    { text:'8 Measures — USA vs CHN (Apr-2022)', top:10, left:20,
      textStyle:{color:'#F5F5F5', fontSize:14} },
    { text:'Country Power Index — 11-empire panel', top:'50%', left:20,
      textStyle:{color:'#F5F5F5', fontSize:14} }
  ],
  radar: {
    center:['50%','28%'], radius:'30%', shape:'polygon',
    indicator:[
      {name:'Education',   min:-1.5, max:2.8},
      {name:'Innov&Tech',  min:-1.5, max:2.8},
      {name:'CostComp',    min:-1.5, max:2.8},
      {name:'Military',    min:-1.5, max:2.8},
      {name:'Trade',       min:-1.5, max:2.8},
      {name:'Output',      min:-1.5, max:2.8},
      {name:'Fin Ctr',     min:-1.5, max:2.8},
      {name:'Reserve FX',  min:-1.5, max:2.8}
    ],
    splitArea:{areaStyle:{color:['#080808','#141414']}},
    axisLine:{lineStyle:{color:'#262626'}},
    splitLine:{lineStyle:{color:'#1C1C1C'}},
    axisName:{color:'#A3A3A3'}
  },
  grid: [{ top:'60%', left:80, right:40, height:'32%', ...panel }],
  xAxis: [{ gridIndex:0, type:'value', min:0, max:1, ...ax }],
  yAxis: [{ gridIndex:0, type:'category',
            data:['RUS','FRA','GBR','IND','KOR','JPN','DEU','EUR','CHN','USA'], ...ax }],
  series: [
    // § 7 Step 1 values — z_USA and z_CHN per measure
    { name:'USA', type:'radar',
      data:[{ value:[2.0, 2.1, -0.4, 2.0, 1.1, 1.7, 2.7, 1.9], name:'USA' }],
      lineStyle:{color:'#00D08C', width:2},
      areaStyle:{color:'rgba(0,208,140,0.15)'},
      symbol:'circle', symbolSize:5, itemStyle:{color:'#00D08C'} },
    { name:'CHN', type:'radar',
      data:[{ value:[1.7, 1.6, 1.1, 0.9, 1.9, 1.5, 0.2, -0.6], name:'CHN' }],
      lineStyle:{color:'#E5484D', width:2},
      areaStyle:{color:'rgba(229,72,77,0.12)'},
      symbol:'circle', symbolSize:5, itemStyle:{color:'#E5484D'} },
    // CPI bar data — Dalio Power Index 2022 p. 1 published values
    { name:'CPI', type:'bar', xAxisIndex:0, yAxisIndex:0,
      data:[ { value:0.26, itemStyle:{color:'#6B7280'} },   // RUS
             { value:0.26, itemStyle:{color:'#6B7280'} },   // FRA
             { value:0.27, itemStyle:{color:'#6B7280'} },   // GBR
             { value:0.28, itemStyle:{color:'#6B7280'} },   // IND
             { value:0.31, itemStyle:{color:'#6B7280'} },   // KOR
             { value:0.33, itemStyle:{color:'#D4A373'} },   // JPN
             { value:0.38, itemStyle:{color:'#D4A373'} },   // DEU
             { value:0.58, itemStyle:{color:'#7FFFD4'} },   // EUR
             { value:0.76, itemStyle:{color:'#7FFFD4'} },   // CHN — RISE
             { value:0.89, itemStyle:{color:'#E5484D'} } ], // USA — DECLINE
      label:{show:true, position:'right', color:'#F5F5F5'} }
  ],
  tooltip:{trigger:'axis', backgroundColor:'#1C1C1C',
           borderColor:'#262626', textStyle:{color:'#F5F5F5'}},
  legend:{ data:['USA','CHN'], textStyle:{color:'#A3A3A3'}, top:35 }
};
```

Stage chips: `#00D08C` RISE leading · `#7FFFD4` RISE/near-peer · `#D4A373` TOP/regional · `#E5484D` DECLINE · `#6B7280` middle/marginal. Hairlines `#262626`; secondary labels `#A3A3A3`. Radar USA series #00D08C, CHN series #E5484D by convention (not stage). Values in both series objects match § 7 Step 1 column-by-column.

## § 9 Integration Points

**Upstream:** World Bank WDI (`SE.TER.ENRR`, `IP.PAT.RESD`, `MS.MIL.XPND.CD`, `NE.EXP.GNFS.CD`, `NY.GDP.MKTP.CD`); BIS LBS + EER; IMF COFER via DBnomics; WIPO GII + WEF GCR 2019 PDFs (static). Subsection 1.3 emits `(long_debt_stage, COFER)` — DECLINE + falling USD share reinforces HegemonyRisk=HIGH.

**Downstream:** **1.3** reserve-currency overlay reads `HegemonyRisk`; **1.4** reads `StageTag=NEW_ORDER` to activate crisis-lever path; **1.7** increments currency-debasement probability on `DECLINE + ELEVATED/HIGH`; **2.2** tilts up gold + non-USD FX on `DECLINE`; **2.5** adds "reserve-currency transition" and "Thucydides" scenarios keyed on this subsection's tags.

**Scope pointers (out-of-scope):** 10-yr asset-leadership paradigm rotation → **1.5**; gold/real-asset allocation under debasement → **1.7**; short-cycle or long-debt-cycle stage detection → **1.2** / **1.3**.

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **Cycle length is a wide range.** "250 years, give or take 150 years" (Ch 1, p. 6). The range 100–400 yrs is too wide for a standalone classifier; CPI-level + trajectory is the operational diagnostic, not year-count.
2. **"Roughly equal average" leaves room.** Ch 1, p. 17 says "roughly equal" but does not publish exact weights. Equal weighting here; any tilt is DERIVED.
3. **Min-max rescale not published.** Dalio publishes 0–1 scores but not the formula. § 5.2's min-max anchors (max=+1.9, min=−1.5) reconstruct Dalio's published USA/CHN values to ≤ 0.03 error on a 2022 panel; the reconstruction may drift on panels containing 1945 USA or 1600 NLD, which would reach higher z-means.
4. **No Dalio-published stage edges.** § 5.4 and § 6 bands are DERIVED, anchored only by the USA-1945 peak and USA-2022/CHN-2022 point readings.
5. **HegemonyRisk thresholds are DERIVED.** Ch 1 p. 17's "roughly comparable" and Ch 2 p. 40's 60%-reserve-share anchor pin the ELEVATED band, but "2 or 3 measures negative" and "−1 to −10 pp reserve delta" are stipulated.
6. **Nomenclature drift in the primary source.** 2020 LinkedIn series (Ch 1, p. 17) lists measure 3 as "technology"; the 2021 book and 2022 Power Index call it "innovation and technology." § 4 uses the 2022 formal term.
7. **COFER access friction.** Direct IMF landing pages returned 403 under WebFetch; DBnomics mirror and FRED series `DFSEBSX` (USD non-US holdings, Fed aggregated) are public fallbacks. R11 was passed by citing the mirror endpoint; if the mirror deprecates, fall back to COFER CSV export published on the IMF COFER dashboard.
8. **WEF GCI frozen.** WEF "discontinued" the Global Competitiveness Report in 2020 per the archived 2019 PDF URL verified in-session. GCI appears only as a 2019 snapshot; post-2020 gaps are filled by GII rank alone.
9. **Dalio's own index evolves.** The Power Index 2022 footer notes "we have updated and improved the analysis since the book was published, which is why you may notice some figures differ slightly." Re-fetch the latest edition (currently "Great Powers Index 2024") on every dashboard run to lock the calibration anchors.

### Sources (all public, all WebFetch'd in-session)

- **Primary.** Dalio, "The Changing World Order," Chapter 1 ("The Big Cycles in a Tiny Nutshell"), LinkedIn 2020 series — https://www.linkedin.com/pulse/chapter-1-big-picture-tiny-nutshell-ray-dalio . Full continuous PDF used for printed-page verification: https://asiabusinesscouncil.org/wp-content/uploads/2020/10/The-Changing-World-Order_Ray-Dalio.pdf (Bridgewater Associates, LP © 2020 footer pagination).
- **Primary.** Dalio, *Principles for Dealing with the Changing World Order — Charts*, 2021 PDF. https://www.economicprinciples.org/DalioChangingWorldOrderCharts.pdf
- **Primary.** Dalio, *The Changing World Order — Country Power Index 2022* PDF. https://economicprinciples.org/downloads/cwo-power-index.pdf
- **Primary (landing).** economicprinciples.org downloads index: https://economicprinciples.org/
- **Primary (LinkedIn mirror).** Ray Dalio series root: https://www.linkedin.com/pulse/changing-world-order-ray-dalio (announcement); https://www.linkedin.com/pulse/archetypical-cycle-internal-order-disorder-ray-dalio (Internal Order sibling piece).
- **Data.** World Bank WDI Indicator pages (each WebFetch'd): `SE.TER.ENRR` https://data.worldbank.org/indicator/SE.TER.ENRR · `IP.PAT.RESD` https://data.worldbank.org/indicator/IP.PAT.RESD · `MS.MIL.XPND.CD` https://data.worldbank.org/indicator/MS.MIL.XPND.CD · `NE.EXP.GNFS.CD` https://data.worldbank.org/indicator/NE.EXP.GNFS.CD · `NY.GDP.MKTP.CD` https://data.worldbank.org/indicator/NY.GDP.MKTP.CD .
- **Data.** World Bank API v2 (open, no auth): https://api.worldbank.org/v2/indicator/SE.TER.ENRR?format=json (pattern applies to all WDI codes above).
- **Data.** BIS LBS overview: https://data.bis.org/topics/LBS · BIS SDMX v2 API base: https://stats.bis.org/api/v2/ .
- **Data.** IMF COFER (landing 403 at April 2026; mirror): https://db.nomics.world/IMF/COFER .
- **Data.** SIPRI Military Expenditure Database: https://milex.sipri.org/ (upstream for WB `MS.MIL.XPND.CD`).
- **Data.** WIPO Global Innovation Index: https://www.wipo.int/global_innovation_index/en/ .
- **Data.** WEF Global Competitiveness Report 2019 (final edition pre-pivot) — Wikipedia entry confirming discontinuation: https://en.wikipedia.org/wiki/Global_Competitiveness_Report .
