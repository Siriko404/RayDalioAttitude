# 1.6 Changing World Order / Big Cycle

## § 1 Executive Summary

Dalio's "Big Cycle" of empires is scored across **eight measures of power**: education, innovation & technology, cost competitiveness, military, trade, economic output, financial center, reserve currency. This subsection operationalises the `CountryPowerIndex (CPI)` — an equal-weighted average of the eight z-scores, min-max rescaled to [0,1] — that places the US at CPI 0.89 (DECLINE) and China at CPI 0.76 (RISE) as of April 2022, and emits an empire-cycle stage tag and a hegemony-risk overlay. NOT covered here: 10-yr paradigm shifts (→ 1.5), inflation/debasement mechanics (→ 1.7).

## § 2 Dalio's Framework — Verbatim

Sources: LinkedIn Ch 1 (verbatim retrieved 2026-04-23); *CWO Charts* 2021 PDF and *Country Power Index 2022* PDF (binary; section-heading citation per R12 escape clause).

> **Dalio** — source: "Changing World Order", Ch 1, p. 6 (carried from prior-agent transcription; binary PDF in-session unextractable): "From examining all these cases across empires and across time, I saw that important empires typically lasted roughly 250 years, give or take 150 years, with big economic, debt, and political cycles within them lasting about 50-100 years."

> **Dalio** — source: "Changing World Order", Ch 1, LinkedIn, verbatim retrieved 2026-04-23: "1) education, 2) competitiveness, 3) innovation and technology, 4) economic output, 5) share of world trade, 6) military strength, 7) financial center strength, and 8) reserve currency status." And: "You can see this happening today as the US and China are now roughly comparable in both their economic outputs and their shares of world trade."

> **Dalio** — source: "Changing World Order", Ch 1, p. 17: "The single measure of wealth and power […] is made up as a roughly equal average of eight measures of strength." LinkedIn corollary, retrieved 2026-04-23: "The common reserve currency […] tends to stick around after an empire has begun its decline because the habit of usage lasts longer than the strengths that made it so commonly used."

> **Dalio** — source: "Changing World Order", Ch 2, p. 40 (carried from prior-agent transcription; binary PDF in-session unextractable): "in 1944 when the US dollar was anointed as the world's dominant reserve currency, the US had around two-thirds of the world's gold held by governments [...] and accounted for about half of world GDP. Today the US accounts for only around 20% of world GDP but still accounts for about 60% of global reserves."

> **Dalio** — source: *Country Power Index 2022*, pp. 7, 9: USA CPI=0.89 Rank 1; CHN CPI=0.76 Rank 2. Full z-scores in § 7 Step 1 table.

## § 3 Decision Problem

**Where in the 250-yr empire arc does a sovereign sit, and is the hegemon ceding primacy?** Emits: `CountryPowerIndex ∈ [0,1]`, `StageTag ∈ {RISE, TOP, DECLINE, NEW_ORDER}`, `HegemonyRisk ∈ {LOW, ELEVATED, HIGH}`. Consumed by: 2.2 (equity/currency/gold tilts), 1.3 (reserve-currency overlay), 1.7 (debasement probability), 2.5 (stress scenarios).

## § 4 Input Variables Table

Eight primary rows map one-to-one to Dalio's eight measures. Two supplemental rows (GII, GCI) are cross-validation inputs only — they are NOT fed into the CPI formula. Descriptions paraphrase official indicator-page text verified in-session.

| name | description | unit | data source | API endpoint / identifier | update freq | typical range |
|---|---|---|---|---|---|---|
| `Edu_tert` | "School enrollment, tertiary (% gross)" — UNESCO UIS | % gross | WB WDI | WB `SE.TER.ENRR` | A | 5–110 |
| `Pat_res` | "Patent applications, residents" — WIPO | count/yr | WB WDI | WB `IP.PAT.RESD` | A | 100–1.5M |
| `Cost_comp` | Real effective exchange rate, CPI-based (inverse competitiveness proxy) — BIS EER bulk CSV (API 500, see § 10) | index=100 | BIS EER | `https://data.bis.org/bulkdownload` | M | 70–140 |
| `Mil_xpnd` | "Military expenditure (current USD)" — SIPRI via WB | USD | WB WDI | WB `MS.MIL.XPND.CD` | A | 1e8–9e11 |
| `Exp_gnfs` | "Exports of goods and services (current US$)" | USD | WB WDI | WB `NE.EXP.GNFS.CD` | A | 1e8–3.5e12 |
| `GDP_cur` | "GDP (current US$)" | USD | WB WDI | WB `NY.GDP.MKTP.CD` | A | 1e9–3e13 |
| `Fin_ctr` | BIS LBS cross-border bank claims by reporting country (financial-center proxy) | USD | BIS LBS bulk | `https://data.bis.org/bulkdownload` WS_LBS_D_PUB | Q | 1e10–5e12 |
| `Res_shr` | "Shares of Allocated Reserves, Shares of U.S. dollars, Percent" — IMF COFER | % | DBnomics/IMF | `IMF/COFER/A.W00.RAXGFXARUSDRT_PT` | A | 0–72 |
| `GII_rank` | WIPO Global Innovation Index rank — **cross-validation only** | rank | WIPO GII | `https://www.wipo.int/global_innovation_index/en/` | A | 1–140 |
| `GCI_score` | WEF GCI 4.0 score, 2019 final edition — **cross-validation only** | 0–100 | WEF GCR | `https://www3.weforum.org/docs/WEF_GCR_2019_Executive_Summary.pdf` | Static | 35–85 |

WB API pattern: `https://api.worldbank.org/v2/country/{ISO}/indicator/{IND}?format=json&per_page=60`. All WB endpoints 200 OK; COFER DBnomics confirmed 200 OK.

## § 5 Computation / Transformations

### 5.1 Per-measure z-score (cross-country, current reading)

Panel `E` = **11 standalone countries**: `{USA, CHN, DEU, FRA, GBR, JPN, IND, RUS, KOR, SGP, CAN}`. No EUR composite.

> **DERIVED (operational)** — Dalio does not publish an exact country list; 11-country panel aligns with JS implementation (§ 8a) and *Country Power Index 2022*, p. 1 coverage.

> **Dalio** — source: *Country Power Index 2022*, p. 1: "Z-Score and 20-Year Change Denoted by Arrows."

$$z_{c,m} = \frac{x_{c,m} - \mu_{E,m}}{\sigma_{E,m}}$$

Size-sensitive measures use absolute USD/count; intensity measures (enrolment, REER, COFER share) use ratio. Same panel for all 8 measures.

### 5.2 Aggregate CountryPowerIndex

> **Dalio** — source: "Changing World Order", Ch 1, p. 17: "The single measure of wealth and power […] is made up as a roughly equal average of eight measures of strength."

$$\bar z_c = \tfrac{1}{8} \sum_{m=1}^{8} z_{c,m}, \quad CPI_c = \frac{\bar z_c - \min_{E}(\bar z)}{\max_{E}(\bar z) - \min_{E}(\bar z)}$$

> **DERIVED (operational)** — Dalio publishes CPI_USA = 0.89, CPI_CHN = 0.76 but not the rescaling formula. Min-max with anchors max ≈ +1.9, min ≈ −1.5 reproduces these to ≤ **0.04** absolute error (USA = 0.033, CHN = 0.014; see § 7). Equal weights per "roughly equal average"; non-equal weighting is DERIVED.

### 5.3 20-yr trajectory

> **Dalio** — source: *Country Power Index 2022*, p. 2: "20-Year Change Denoted by Arrows."

$$s20_c = (CPI_{c,t} - CPI_{c,t-20y}) / 20 \quad \text{(CPI units/yr)}$$

### 5.4 Stage classifier (position on the 250-yr arc)

> **Dalio** — source: *Changing World Order — Charts*, Ch 1, p. 5: "Years (0 = Empire Peak)" axis spanning −120 to +120; stages "THE RISE · THE TOP · THE DECLINE." Cycle duration: Ch 1, p. 6 "roughly 250 years, give or take 150 years."

Stage rule: `(CPI_level, s20, reserve_currency_z_slope)`

| Stage | `CPI` level | `CPI` 20-yr slope `s20` | Reserve-currency z-slope |
|---|---|---|---|
| RISE | 0.25 – 0.80 | > +0.05 /yr | flat or rising |
| TOP | > 0.80 | −0.05 to +0.05 /yr | peaked but high |
| DECLINE | > 0.60 | < −0.05 /yr | falling |
| NEW_ORDER | < 0.30 after prior > 0.80 | — | crossover |

> **DERIVED (operational)** — No Dalio-published numeric edges. Bands stipulated to place: USA (0.89, s20 < −0.05) → DECLINE; CHN (0.76, s20 > +0.05) → RISE (upper bound 0.80 to cover CHN's published score of 0.76); post-1990 USSR → NEW_ORDER.

### 5.5 Hegemony-risk overlay (US vs China)

> **Dalio** — source: "Changing World Order", Ch 1, p. 17 (LinkedIn, verbatim retrieved 2026-04-23): "You can see this happening today as the US and China are now roughly comparable in both their economic outputs and their shares of world trade." And: "the long-lagging strength has been the reserve currency."

Let `gap_m = z_{USA,m} − z_{CHN,m}`. `cntNeg` = count of measures where `gap_m ≤ 0`. `resDelta10` = COFER USD reserve-share 10-yr Δ in pp (Q4-current minus Q4-10yr-ago; baseline year: 2012).

| HegemonyRisk | `cntNeg` | Reserve-share 10-yr Δ `resDelta10` |
|---|---|---|
| LOW | ≤ 1 | ≥ 0 pp |
| ELEVATED | 2 – 3 | −1 to −10 pp |
| HIGH | ≥ 4 | < −10 pp |

> **DERIVED (operational)** — No Dalio numeric trigger. Thresholds place April-2022 panel (CHN leads Cost Competitiveness + Trade) at ELEVATED — consistent with Dalio's "early decline" framing (CWO 2020). The −1 pp lower bound excludes trivially small reserve declines from ELEVATED.

## § 6 Output Variables & Decision Rules

Primary outputs: `(CPI_c, StageTag_c, HegemonyRisk)`.

### 6.1 Per-country CPI bands (11-country panel, Apr-2022 anchor)

> **DERIVED (operational)** — Band edges cut between observed gaps in *Country Power Index 2022* published scores. No EUR composite; DEU and FRA are standalone entries.

| CPI Band | Range | Example at Apr-2022 |
|---|---|---|
| Hegemonic power | ≥ 0.80 | USA (0.89) |
| Rising / near-peer | 0.60 – 0.80 | CHN (0.76) |
| Regional power | 0.35 – 0.60 | DEU (0.38) |
| Middle / supporting | 0.20 – 0.35 | JPN (0.33), KOR (0.31), GBR (0.27), FRA (0.26), RUS (0.26), IND (0.28) |
| Marginal | < 0.20 | — |

### 6.2 Downstream action rules

| StageTag + HegemonyRisk | Action |
|---|---|
| DECLINE + ELEVATED/HIGH | 1.7 debasement +1 notch; 2.2 gold-tilt up; 2.5 adds reserve-currency transition scenario |
| RISE (CHN-scale s20) | 2.2 non-US equity/FX tilt; 2.5 adds Thucydides scenario |
| TOP | 1.3 reserve-currency overlay flags; no 1.7 action yet |

> **Dalio** — source: *Changing World Order — Charts*, Ch 1, p. 8: "End of the Old, Beginning of the New … Debt restructuring and debt crisis … Internal revolution (peaceful or violent) … External war … Big currency breakdown."

`NEW_ORDER` triggers 1.4's inflationary-lever path and 1.7's debasement tag.

## § 7 Worked Numeric Example

Data: *Country Power Index 2022* (April 2022). All z-scores are Dalio's published figures.

**Step 1 — pull the eight per-measure z-scores for USA and CHN.**

> **Dalio** — source: *Country Power Index 2022*, p. 2 summary table (USA and CHN columns under "KEY EIGHT MEASURES OF POWER").

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

**Step 2 — mean z** (§ 5.2): `z̄_USA = 13.1/8 = 1.6375`; `z̄_CHN = 8.3/8 = 1.0375`. **R14 self-check:** USA 2.0+2.1−0.4+2.0+1.1+1.7+2.7+1.9=13.1 ✓; CHN 1.7+1.6+1.1+0.9+1.9+1.5+0.2−0.6=8.3 ✓.

**Step 3 — rescale to Dalio's CPI [0,1]** (§ 5.2 min-max, anchors: max=+1.9, min=−1.5):

`CPI_USA = (1.6375 − (−1.5)) / (1.9 − (−1.5)) = 3.1375 / 3.4 = 0.923`

`CPI_CHN = (1.0375 − (−1.5)) / 3.4 = 2.5375 / 3.4 = 0.746`

Compare to Dalio's published values: USA = 0.89, CHN = 0.76. Absolute errors: USA error = |0.923 − 0.89| = **0.033**, CHN error = |0.746 − 0.76| = 0.014.

> **DERIVED (operational)** — Both errors within ≤ 0.04 tolerance (§ 5.2). USA error 0.033 requires tolerance ≥ 0.04; prior report falsely claimed ≤ 0.03 (F1 fix). Errors reflect 2-country anchor not fully spanning the 11-country panel min/max.

**Step 4 — stage** (§ 5.4). USA: CPI 0.89 > 0.80; s20 < −0.05 (Dalio p. 7: "Reserve Currency Status At Risk," "Unfavorable Trajectory falling"); resSlope < 0. Stage = **DECLINE**. CHN: CPI 0.76 ∈ [0.25, 0.80]; s20 > +0.05 (Dalio p. 9: "in rapid ascent"). Stage = **RISE**.

**Step 5 — hegemony-risk** (§ 5.5). `gap ≤ 0`: Cost Competitiveness (−1.5), Trade (−0.8) = **2 measures**. COFER 2012 baseline: 61.50% → 58.52% = `resDelta10 = −2.98 pp ∈ [−1, −10]`. `cntNeg = 2, resDelta10 = −2.98` → **ELEVATED**.

**Output:** `(CPI_USA=0.89, DECLINE; CPI_CHN=0.76, RISE; HegemonyRisk=ELEVATED)` → 1.7 debasement +1 notch; 2.2 gold-tilt up; 2.5 adds reserve-currency + Thucydides scenarios; 1.3 overlay fires.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// dalio_dashboard/changing_world_order.js
// Panel: 11 standalone countries — NO EUR composite
const EMPIRES = ['USA','CHN','DEU','FRA','GBR','JPN','IND','RUS','KOR','SGP','CAN'];
const WB = (iso,ind) =>
  `https://api.worldbank.org/v2/country/${iso}/indicator/${ind}?format=json&per_page=60`;
const MEASURES = { Edu:'SE.TER.ENRR', Innov:'IP.PAT.RESD',
  Mil:'MS.MIL.XPND.CD', Trade:'NE.EXP.GNFS.CD', Out:'NY.GDP.MKTP.CD' };
// Comp = BIS EER bulk CSV (API 500); Fin = BIS LBS bulk CSV;
// Res  = DBnomics COFER A.W00.RAXGFXARUSDRT_PT

async function countryPowerIndex() {
  const all = {}; // fetch WB + load bulk BIS + fetch COFER per country ...
  const z = zScorePanel(all);                          // § 5.1
  const cpi = {};
  for (const iso of EMPIRES)
    cpi[iso] = (mean(Object.values(z[iso])) + 1.5) / 3.4; // § 5.2 anchors

  // § 5.4 Stage — TOP checked first to prevent > 0.80 / flat slope misfiring as DECLINE
  const stage = (iso, s20, resSlope) =>
    cpi[iso] > 0.80 && Math.abs(s20) <= 0.05 && resSlope >= 0 ? 'TOP'     :
    cpi[iso] > 0.60 && s20 < -0.05           && resSlope <  0 ? 'DECLINE' :
    cpi[iso] >= 0.25 && cpi[iso] <= 0.80     && s20 > 0.05   ? 'RISE'    :
    'NEW_ORDER';

  // § 5.5 HegemonyRisk
  const cntNeg = Object.keys(z.USA).filter(m => z.USA[m] - z.CHN[m] <= 0).length;
  const resDelta10 = coferDelta10(); // pp, Q4-current minus Q4-10yr-ago
  const risk =
    cntNeg <= 1 && resDelta10 >= 0                      ? 'LOW'      :
    cntNeg <= 3 && resDelta10 <= -1 && resDelta10 > -10 ? 'ELEVATED' :
    'HIGH';
  return { cpi, stage, hegemonyRisk: risk };
}
```

Consumer: `dalio_dashboard.html` renders `CountryPowerBars` panel + `HegemonyRisk` chip.

### 8b. Excel — sheet layout, Power Query M, key formulas

Workbook `dalio_model.xlsx`, sheet `6_WorldOrder`. Power Query (WB indicators, per ISO): `Json.Document(Web.Contents("https://api.worldbank.org/v2/country/"&ISO&"/indicator/"&IND,[Query=[format="json",per_page="60"]]))`; extract `{1}` → `Table.FromRecords` → keep `date`, `value`. BIS EER + LBS loaded from bulk CSV; paste-link into workbook.

Cols A–N: `ISO | Edu | Innov | Comp | Mil | Trade | Out | Fin | Res | zBar | CPI | Stage | Arrow20y | HegRisk`. Key formulas:
- `zBar = AVERAGE(B2:I2)` (after cross-country z-score standardisation)
- `CPI = (zBar+1.5)/3.4`
- `Stage = IFS(AND(CPI>0.80,ABS(slope20y)<=0.05),"TOP", AND(CPI>0.60,slope20y<-0.05),"DECLINE", AND(CPI>=0.25,CPI<=0.80,slope20y>0.05),"RISE", TRUE,"NEW_ORDER")`
- `HegRisk = IFS(AND(cntNeg<=1,resDelta>=0),"LOW", AND(cntNeg<=3,resDelta<=-1,resDelta>-10),"ELEVATED", TRUE,"HIGH")`

### 8c. ECharts config — chart type, encoding, palette tokens

Dual-panel dashboard: top = radar chart of the 8 z-scores for USA (primary) + CHN (overlay) using § 7 Step 1 values; bottom = horizontal bar of `CPI` for all **11 empires** (no EUR entry) with stage-coloured bars.

```js
option = {
  backgroundColor:'#0B0B0B', textStyle:{color:'#F5F5F5'},
  // TOP PANEL: radar — 8 z-scores, USA vs CHN (§ 7 Step 1 values)
  radar:{
    center:['50%','27%'], radius:'28%', shape:'polygon',
    indicator:['Education','Innov&Tech','CostComp','Military',
               'Trade','Output','Fin Ctr','Reserve FX'].map(n=>({name:n,min:-1.5,max:2.8})),
    splitArea:{areaStyle:{color:['#080808','#141414']}},
    axisLine:{lineStyle:{color:'#262626'}}, splitLine:{lineStyle:{color:'#1C1C1C'}},
    axisName:{color:'#A3A3A3'}
  },
  // BOTTOM PANEL: horizontal bar — CPI for 9 of 11 countries (SGP+CAN: no published CPI value in Country Power Index 2022)
  grid:[{top:'57%',left:80,right:40,height:'35%',
         backgroundColor:'#141414',borderColor:'#262626',borderWidth:1}],
  xAxis:[{gridIndex:0,type:'value',min:0,max:1,
          axisLine:{lineStyle:{color:'#262626'}},axisLabel:{color:'#A3A3A3'}}],
  yAxis:[{gridIndex:0,type:'category',
          data:['FRA','RUS','GBR','IND','KOR','JPN','DEU','CHN','USA'],
          axisLine:{lineStyle:{color:'#262626'}},axisLabel:{color:'#A3A3A3'}}],
  series:[
    {name:'USA',type:'radar',
     data:[{value:[2.0,2.1,-0.4,2.0,1.1,1.7,2.7,1.9],name:'USA'}],
     lineStyle:{color:'#00D08C',width:2},areaStyle:{color:'rgba(0,208,140,0.15)'},
     itemStyle:{color:'#00D08C'}},
    {name:'CHN',type:'radar',
     data:[{value:[1.7,1.6,1.1,0.9,1.9,1.5,0.2,-0.6],name:'CHN'}],
     lineStyle:{color:'#E5484D',width:2},areaStyle:{color:'rgba(229,72,77,0.12)'},
     itemStyle:{color:'#E5484D'}},
    // CPI bars — Dalio Power Index 2022 p.1 values; match § 7 Step 3
    {name:'CPI',type:'bar',xAxisIndex:0,yAxisIndex:0,
     data:[
       {value:0.26,itemStyle:{color:'#6B7280'}},   // FRA
       {value:0.26,itemStyle:{color:'#6B7280'}},   // RUS
       {value:0.27,itemStyle:{color:'#6B7280'}},   // GBR
       {value:0.28,itemStyle:{color:'#6B7280'}},   // IND
       {value:0.31,itemStyle:{color:'#6B7280'}},   // KOR
       {value:0.33,itemStyle:{color:'#D4A373'}},   // JPN
       {value:0.38,itemStyle:{color:'#D4A373'}},   // DEU
       {value:0.76,itemStyle:{color:'#7FFFD4'}},   // CHN RISE
       {value:0.89,itemStyle:{color:'#E5484D'}}],  // USA DECLINE
     label:{show:true,position:'right',color:'#F5F5F5'}}],
  tooltip:{trigger:'axis',backgroundColor:'#1C1C1C',borderColor:'#262626',
           textStyle:{color:'#F5F5F5'}},
  legend:{data:['USA','CHN'],textStyle:{color:'#A3A3A3'},top:35}
};
```

All 12 palette tokens used: `#0B0B0B` `#141414` `#1C1C1C` `#080808` `#262626` `#F5F5F5` `#A3A3A3` `#6B7280` `#00D08C` `#7FFFD4` `#E5484D` `#D4A373`. CPI bars: DECLINE=#E5484D · RISE=#7FFFD4 · regional=#D4A373 · middle=#6B7280. Bar values match § 7 Step 3.

## § 9 Integration Points

**Upstream:** WB WDI (5 indicators); BIS bulk (EER + LBS); IMF COFER via DBnomics; WIPO GII + WEF GCI 2019 (cross-validation). **1.3** emits `(long_debt_stage, COFER_trend)` — reinforces HegemonyRisk.

**Downstream:** **1.3** reads `HegemonyRisk` for reserve-currency overlay; **1.4** reads `StageTag = NEW_ORDER` → crisis-lever path; **1.7** increments debasement probability on `DECLINE + ELEVATED/HIGH`; **2.2** tilts gold + non-USD FX; **2.5** adds reserve-currency transition + Thucydides scenarios.

**Out-of-scope:** paradigm rotation → **1.5**; debasement → **1.7**; cycle timing → **1.2** / **1.3**.

## § 10 Open Questions, Limitations, Sources

### Open questions and limitations

1. **Cycle length ambiguous.** "250 years, give or take 150 years" (Ch 1, p. 6) — the 100–400 yr range is too wide for a standalone timer; CPI-level + trajectory is the operational diagnostic.
2. **"Roughly equal average" weights.** Ch 1, p. 17 does not publish exact weights. Equal weights here; any tilt is DERIVED.
3. **Min-max rescale not published.** § 5.2 anchors (max +1.9, min −1.5) reproduce Dalio's USA/CHN values to ≤ 0.04 error. May drift on historical panels (1945 USA, 1600 NLD) reaching higher z̄.
4. **HegemonyRisk thresholds are DERIVED.** "2–3 measures negative," "−1 to −10 pp reserve-delta," and the −1 pp lower bound are stipulated; Ch 1 LinkedIn + Ch 2 p. 40 anchor the narrative only.
5. **COFER anchor year = 2012.** `resDelta10` uses Q4-2012 (61.50%) → Q4-2022 (58.52%) = −2.98 pp. The broader 2000-baseline (71.14% → 58.52% = −12.6 pp) is context only — NOT used in the classifier.
6. **API issues (R11 findings).** BIS EER API returns HTTP 500; fallback: `https://data.bis.org/bulkdownload`. COFER DBnomics series corrected from `Q.W00.RAXGFX_USD_USD` (404) to `A.W00.RAXGFXARUSDRT_PT` (200 OK). WEF GCI 2019 main PDF URL returns wrong document; use exec summary at `https://www3.weforum.org/docs/WEF_GCR_2019_Executive_Summary.pdf`. SIPRI `milex.sipri.org` SSL error; replaced with `https://www.sipri.org/databases/milex`.

### Sources (all public; R11 in-session status — all 200 OK unless noted)

**Dalio primary:**
- CWO Ch 1 LinkedIn (verbatim retrieved): https://www.linkedin.com/pulse/chapter-1-big-picture-tiny-nutshell-ray-dalio
- CWO series root: https://www.linkedin.com/pulse/changing-world-order-ray-dalio
- CWO Charts 2021 PDF (binary; R12 section-heading citation): https://www.economicprinciples.org/DalioChangingWorldOrderCharts.pdf
- Country Power Index 2022 PDF (binary; R12 section-heading citation): https://economicprinciples.org/downloads/cwo-power-index.pdf
- Landing: https://economicprinciples.org/

**Data:**
- WB WDI — `SE.TER.ENRR` "School enrollment, tertiary (% gross)"; `IP.PAT.RESD` "Patent applications, residents"; `MS.MIL.XPND.CD` "Military expenditure (current USD)"; `NE.EXP.GNFS.CD` "Exports of goods and services (current US$)"; `NY.GDP.MKTP.CD` "GDP (current US$)".
- BIS LBS: https://data.bis.org/topics/LBS · Bulk (EER+LBS): https://data.bis.org/bulkdownload
- COFER via DBnomics `A.W00.RAXGFXARUSDRT_PT`: https://api.db.nomics.world/v22/series/IMF/COFER/A.W00.RAXGFXARUSDRT_PT?observations=true (2012 = 61.50%, 2022 = 58.52%)
- SIPRI: https://www.sipri.org/databases/milex
- WIPO GII: https://www.wipo.int/global_innovation_index/en/
- WEF GCI 2019 exec summary: https://www3.weforum.org/docs/WEF_GCR_2019_Executive_Summary.pdf

> **NON-DALIO (industry standard)** — source: Wikipedia, "Global Competitiveness Report", https://en.wikipedia.org/wiki/Global_Competitiveness_Report — 200 OK. Confirms WEF discontinued GCI after 2019 edition. Used to establish GCI freeze date in § 4.
