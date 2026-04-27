# 1.3 Long-Term Debt Cycle

## § 1 Executive Summary

Dalio's "Big" debt cycle: ~80 ±25-yr arc; short cycles ratchet debt until policy forces monetization, devaluation, or restructuring. **Stage diagnostic**: five-stage archetype (Sound → Bubble → Top → Deleveraging → Recedes), four Dalio indicators (debt/income, debt-service/income, r−g, debt/savings), reserve-currency overlay. NOT: 5–8 yr cycle (→ 1.2), levers (→ 1.4), empire scoring (→ 1.6).

## § 2 Dalio's Framework — Verbatim

Dalio, *How Countries Go Broke: Part 1* ("HCGB-1") — https://economicprinciples.org/downloads/how-countries-go-broke-part-1.pdf (unpaginated; cite by chapter).

> **Dalio** — source: HCGB-1, Introduction: "big, long-term debt cycles typically last about one lifetime—roughly 80 years (give or take 25 years)."

> **Dalio** — source: HCGB-1, Ch 1, "Five Big Stages" section: "1) The Sound Money Stage … 2) The Debt Bubble Stage … 3) The Top Stage … 4) The Deleveraging Stage … 5) The Big Debt Crisis Recedes."

> **Dalio** — source: HCGB-1, Ch 1, Stage 1 bullet: "when the Big Debt Cycle that we are in began in 1944, the ratios of a) US government debt and b) US money supply divided by the amount of gold the US government had were equal to a) 7x and b) 1.3x respectively, whereas now these ratios are a) 37x and b) 6x respectively."

> **Dalio** — source: HCGB-1, Ch 1, Stage 4 bullet: "In a typical deleveraging the debt-to-income ratio has [to] be lowered by roughly 50%, give or take about 20%." ([to] corrects a "the" OCR typo in source)

> **Dalio** — source: HCGB-1, Ch 3: "interest rates being higher than income growth by 2%. This would cause the debt-to-income ratio to increase by around 50% over 20 years, even without primary deficits […]."

> **Dalio** — source: HCGB-1, Ch 3, Ex 1: "the US government's debt to money coming in (mostly tax income) is, as of this writing, about 580%. […] the primary deficit—the difference between these—is ~15% of income. The US is also borrowing ~20% of its income each year to cover interest expenses on the existing debt."

> **Dalio** — source: HCGB-1, Introduction (opening bold paragraph): "only about 20% of the roughly 750 currency/debt markets that have existed since 1700 remain and that all these remaining ones have been severely devalued through the mechanistic process I am going to describe in this study."

## § 3 Decision Problem

**Where in the 80-yr arc is the economy, what policy reaction should the PM price?** Emits: stage tag {SOUND, BUBBLE, TOP, DELEVER, RECEDE}; MP tag {MP1…MP6}; forward debt/income path. Wrong stage poisons 1.4's lever choice, 1.7's inflation tag, 2.2's regime box.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `D_tot_GDP` | Federal Debt: Total Public Debt / GDP (incl. intragov.) | % GDP | FRED | `https://api.stlouisfed.org/fred/series/observations?series_id=GFDEGDQ188S` | Q | 30–130% |
| `D_pub_GDP` | Federal Debt Held by the Public / GDP (excl. intragov.) | % GDP | FRED | `https://api.stlouisfed.org/fred/series/observations?series_id=FYGFGDQ188S` | Q | 24–100% |
| `D_priv_GDP` | BIS Total Credit to Non-Financial Sector / GDP | % GDP | BIS (SDMX v2) | `https://stats.bis.org/api/v2/data/BIS,WS_TC,2.0/Q.US.C.A.M.770.A` | Q | 120–300% |
| `DS_int_GDP` | Federal Outlays: Interest / GDP | % GDP | FRED | `https://api.stlouisfed.org/fred/series/observations?series_id=FYOIGDA188S` | A | 1–5% |
| `DSR_priv` | Private non-financial debt service ratio (BIS DSR) | % inc | BIS portal | `https://data.bis.org/topics/DSR/data` (CSV/XLSX export; SDMX `WS_DSR` API unstable as of 2026-04) | Q | 12–18% |
| `r_nom` | 10-Year Treasury Constant Maturity Rate | % p.a. | FRED (H.15) | `https://api.stlouisfed.org/fred/series/observations?series_id=GS10` | M | 1–16% |
| `GDP_level` | Nominal GDP — raw level (BEA) | USD bn, SAAR | FRED | `https://api.stlouisfed.org/fred/series/observations?series_id=GDP` | Q | 1000–30000 |
| `GDPDEF_index` | GDP Implicit Price Deflator — raw index (BEA) | Idx 2017=100 | FRED | `https://api.stlouisfed.org/fred/series/observations?series_id=GDPDEF` | Q | 20–130 |
| `HdlDef_GDP` | Federal Surplus or Deficit [-] / GDP — HEADLINE (incl. interest) | % GDP | FRED | `https://api.stlouisfed.org/fred/series/observations?series_id=FYFSGDA188S` | A | -10–4% |
| `PrimDef_GDP` | Primary deficit / GDP = `|HdlDef_GDP| − DS_int_GDP` (DERIVED) | % GDP | FRED (derived) | FYFSGDA188S + FYOIGDA188S | A | -2–6% |
| `Rev_GDP` | Federal revenue / GDP (Dalio anchor ~17% US today) | % GDP | FRED | `https://api.stlouisfed.org/fred/series/observations?series_id=FYFRGDA188S` | A | 14–20% |
| `Res_GDP` | Total reserves (inc. gold, current US$) ÷ nom. GDP | % GDP | WB WDI | `https://api.worldbank.org/v2/country/USA/indicator/FI.RES.TOTL.CD?format=json` | A | 0.5–4% |
| `FX_res_USD` | USD share of global FX reserves (COFER; legacy "allocated" through 2025Q2; from 2025Q3 IMF eliminates unallocated via imputation per TN Nov 2025) | % | IMF COFER | `https://data.imf.org/en/datasets/IMF.STA:COFER` (CSV/XLSX) | Q | 55–72% |

FRED cells show `series_id` only — full template per R3: `…/observations?series_id=X&api_key={FRED_API_KEY}&file_type=json` (free key). BIS API v2 open SDMX. COFER: no JSON feed.

## § 5 Computation / Transformations

### 5.1 The four Dalio indicators (HCGB-1 Ch 3)

> **Dalio** — source: HCGB-1, Ch 3, "The Four Most Important Indicators": "the four most important indicators are: 1. Debts relative to income. […] 2) Debt service relative to income. […] 3) Nominal interest rates relative to a) inflation rates and b) nominal income growth rates […] 4) Debts and debt service relative to savings […]."

Dalio denominates in federal **revenue** throughout Ch 3 — canonical for the § 6 classifier.

$$I_1 = \frac{\text{Debt}_t}{\text{Revenue}_t}, \quad I_2 = \frac{\text{Interest}_t + \text{Principal due}_t}{\text{Revenue}_t}, \quad I_3 = r_{nom,t} - g_{nom,t}, \quad I_4 = \frac{\text{Debt}_t}{\text{Reserves} + \text{Savings}_t}$$

> **DERIVED (operational)** — `g_{nom} = yoy(GDP_level, 4)`; `Pi_dfl = yoy(GDPDEF_index, 4)`. FRED `GDP`/`GDPDEF` are raw level/index, not growth rates.

> **Dalio** — source: HCGB-1, Ch 3, Example 1: "about 580%"; "borrowing ~20% of its income each year to cover interest expenses."

> **Dalio** — source: HCGB-1, Ch 3, rule of thumb: "If nominal interest rates are at the same level as nominal income growth and a government is running no primary deficit […] debts will stay the same relative to the incomes."

### 5.2 GDP ↔ revenue conversion

> **Dalio** — source: HCGB-1, Ch 3, cross-country table: USA central-government revenue = "17%" of GDP (tabulated with JPN 16%, CHN 28%, FRA 18%, DEU 13%, GBR 36%).

$$I_1^{rev} = I_1^{GDP} / \text{Rev\_GDP}, \quad \text{with Dalio anchor Rev\_GDP} \approx 0.17 \text{ for US today.}$$

> **DERIVED (operational)** — Rev_GDP varies 14–20% historically; pipe FRED series `FYFRGDA188S` rather than hard-coding 0.17 outside "now."

### 5.3 Forward debt/income projection

Generalising Dalio's Example 3 when rate ≠ growth:

$$\frac{D_{t+N}}{Y_{t+N}} = \frac{D_t \prod_{i=0}^{N-1}(1 + r_{t+i}) + \sum_{i=0}^{N-1} PD_{t+i}\prod_{j=i+1}^{N-1}(1 + r_{t+j})}{Y_t \prod_{i=0}^{N-1}(1+g_{t+i})}$$

> **Dalio** — source: HCGB-1, Ch 3, Example 1: "the US government's debt-to-income is projected to rise by about 150%, from 580% to 730% over the next 10 years."

### 5.4 Rate-spread rule of thumb

> **Dalio** — source: HCGB-1, Ch 3, Example 2: "interest rates being higher than income growth by 2%. This would cause the debt-to-income ratio to increase by around 50% over 20 years, even without primary deficits […]."

Linearising: ≈25 pp per 100 bp of $(r - g)$ per 20 years, zero primary deficit.

> **DERIVED (operational)** — the linearisation under-states non-linear blow-ups at high starting debt. Use § 5.3 closed form for projections.

### 5.5 Primary vs headline deficit derivation

Dalio's Ex 1/Ex 3 inputs use PRIMARY deficit (excludes interest). FRED `FYFSGDA188S` is HEADLINE. Convert:

$$PrimDef\_GDP_t \approx |HdlDef\_GDP_t| - DS\_int\_GDP_t; \quad PrimDef\_Rev_t = PrimDef\_GDP_t / Rev\_GDP_t$$

> **DERIVED (operational)** — Primary vs headline deficit derivation: FRED `FYFSGDA188S` is the HEADLINE deficit (includes interest); Dalio's Ex 1/Ex 3 inputs use the PRIMARY deficit (excludes interest). Subtraction follows the standard OMB/CBO convention. Sanity-check: ~7%−~3% = ~4% GDP ÷ 0.17 ≈ ~24% rev; Dalio's 15% is CBO decade average.

### 5.6 MP phase overlay (Dalio taxonomy)

> **Dalio** — source: HCGB-1, Ch 1, phases-of-monetary-policy section: "Phase 1: A Linked (i.e., Hard) Monetary System (MP1). […] existed from 1944 until 1971. […] Phase 2: A Fiat Money, Interest-Rate-Driven Monetary Policy (MP2). […] Phase 3: A Fiat Monetary System with Debt Monetization (MP3). […] phase from 2008 until 2020. Phase 4: A Fiat Money System with Coordinated Big Fiscal Deficit and Big Debt Monetization Policy (MP4). […] Phase 5: A Big Deleveraging (MP5). […] Phase 6: The Return to Hard Money (MP6)."

Classify by (rate active?, QE active?, coordinated fiscal-monetary?, restructuring?). Taxonomic — no numeric thresholds.

## § 6 Output Variables & Decision Rules

Primary output: `(stage, mp_phase)`. **Denominator: % of Revenue throughout this table.**

### Stage-classifier thresholds

> **DERIVED (operational)** — Dalio anchors are points only (1944=7x; today=580%; JPN=1376%); inter-stage edges below are stipulated. 550/900 bracket the US (580%) and JPN (1376%) cases.

| Stage | `D / Revenue` | `Int / Revenue` | `I3 = r − g` | Typical MP |
|---|---|---|---|---|
| 1. Sound Money | < 200% | < 5% | ≤ 0 | MP1 |
| 2. Debt Bubble | 200–400% | 5–10% | ≤ 0 | MP2 |
| 3. Top | 400–550% | 10–15% | turning + | late MP2 / early MP3 |
| 4. Deleveraging | 550–900% | 15–40% | − (CB-forced) | MP3 / MP4 / MP5 |
| 5. Recedes | falling thru 400% | falling thru 10% | → 0 | MP6 |

> **DERIVED (operational)** — edges 200/400/550/900 and 5/10/15/40 are stipulated; covers table rows above.

### Reserve-currency overlay

> **Dalio** — source: HCGB-1, Introduction (opening bold paragraph): "only about 20% of the roughly 750 currency/debt markets that have existed since 1700 remain and that all these remaining ones have been severely devalued through the mechanistic process I am going to describe in this study."

> **Dalio** — source: HCGB-1, Ch 1, phases-of-monetary-policy closing bullet: "For great countries with great empires, the end of the Big Debt Cycle has meant the end of their prominence."

Signal: COFER USD share trend DOWN combined with `stage ∈ {TOP, DELEVER}` = elevated devaluation-risk tag.

> **DERIVED (operational)** — COFER USD share has no Dalio-stated threshold. Use "falling > 10 pp over 10 years" as trigger heuristic. 8-measures empire scoring is scope of 1.6.

### Action rules

> **DERIVED (operational)** — four prescriptions author-stipulated; HCGB-1 implies inflation-protection in DELEVER+I3>0 / equity-gold in repression but doesn't name "ILB" or "long nominals". Final routing in 1.7 / 2.2.

- `SOUND`/`BUBBLE` → pass-through to 1.2; 1.4 dormant.
- `TOP` → cut long-duration nominal bond; watch 1.4.
- `DELEVER` + `I3 > 0` → inflation-lever path; 1.7 active; hold gold / ILB.
- `DELEVER` + `I3 < 0` (repression) → hold equities + gold; avoid long nominals.

1.4 activates on `stage ∈ {TOP, DELEVER}`; 1.6 reads `(stage, COFER)`.

## § 7 Worked Numeric Example

Illustrative — values TRANSCRIBED from HCGB-1 Ch 3 Ex 1 (present US anchors) and Ex 3 ("Interest Rates Spiral Upward") published table. Not an independent simulation.

**Step 1 — tag indicators for US (Ex 1).** $I_1^{rev}$ = 580% · $I_2^{rev}$ ≈ 20% · $I_3$ = 3.4% − 3.8% = −0.4% · $I_4$ = 37x debt/gold (Ch 1, up from 7x in 1944).

> **Dalio** — Ex 1 anchors 580% / ~20%; Ex 2 CBO baseline 3.4 vs 3.8; Ch 1 gold ratios 7x→37x (1944→today).

**Step 2 — assign stage.** 580% → DELEVER (550–900%); 20% → DELEVER (15–40%); $I_3$ slightly negative = repression. Stage = `DELEVERAGING`.

**Step 3 — 10-yr projection (Ex 3).** Inputs: start 580%, g = 3.8%, primary deficit = 15% of revenue, r starts 3.4% rising 50 bps/yr, 35% rolls/yr.

> **Dalio** — HCGB-1 Ch 3 Ex 3 toy model parameters: Income Growth 3.8%, Spending excl. Interest 115% Inc, Starting Debt 29.3, Starting Interest 3.4%, Share Maturing 35%/yr.

| Year | r (%) | D/Inc | DS/Inc | Int/Inc |
|---:|---:|---:|---:|---:|
| 0 | 3.4 | 580% | — | — |
| 5 | 5.9 | 689% | 260% | 37.5% |
| 10 | 8.4 | 898% | 353% | 68.4% |

> **Dalio** — source: HCGB-1, Ch 3, Ex 3 table "A Toy Model: Interest Rates Spiral Higher": Year 10 "Debt / Income 898%, Debt Service / Income 353%, Interest / Income 68.4%"; Y0/Y5 transcribed from same table.

**R14 self-check.** All § 7 rows are transcribed Dalio values. Rate path 3.4 + 0.5·t (t = 0…10) → 3.4, 3.9, 4.4, 4.9, 5.4, 5.9, 6.4, 6.9, 7.4, 7.9, 8.4 — matches Dalio's "memo: Interest Rates" row. § 8c legend cites Y0/Y5/Y10 anchors from this table; rendered line is the § 8a operational approximation.

**Step 4 — MP evolution.** Y0 = MP3; by Y5 with $I_3 > 0$ policy forced to MP4; by Y10 interest = 68.4% of revenue → MP5 ("Big Deleveraging") probability high.

**Step 5 — emit.** `(stage=DELEVERAGING, mp_phase=MP3, 10yr=580→898, mp=MP3→MP4→MP5)`. 1.4 activated; 1.7 gets $I_3>0$ → inflationary-lever tag; 2.2 rising-growth + rising-inflation cell.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// file: dalio_dashboard/long_term_cycle.js
const FRED = (id, k) => `https://api.stlouisfed.org/fred/series/observations`
  + `?series_id=${id}&api_key=${k}&file_type=json`;

async function longTermDebtCycle({ apiKey, horizonYrs = 10 }) {
  const ids = ['GFDEGDQ188S','FYOIGDA188S','FYFSGDA188S','FYFRGDA188S','GS10','GDP'];
  const [debt, intGDP, hdlDef, revGDP, rate, gdp] =
    await Promise.all(ids.map(id => fetch(FRED(id, apiKey)).then(r=>r.json())));
  const revShare   = last(revGDP) / 100;                     // ~0.17 US today
  const gNom       = yoy(gdp, 4);
  const I3         = last(rate) - gNom;
  const I1_rev     = last(debt)   / revShare;                // § 5.2
  const I2_rev     = last(intGDP) / revShare;
  const primDefRev = (Math.abs(last(hdlDef)) - last(intGDP)) / revShare; // § 5.5
  const stage = (i1, i2, i3) =>
    i1 < 200 && i2 <  5                 ? 'SOUND'        :
    i1 < 400 && i2 < 10                 ? 'BUBBLE'       :
    i1 < 550 && i2 < 15 && i3 < 1       ? 'TOP'          :
    (i1 < 900 || i2 >= 15)              ? 'DELEVERAGING' : 'RECEDES';
  const project = (d0, pdRev, g, r0, rCreep, yrs) => {       // operational approx. — exact Y0/Y5/Y10 anchors per § 7
    let d = d0, r = r0, path = [{ yr: 0, debt: d, r }];
    for (let t = 0; t < yrs; t++) {
      d += pdRev + d * (r - g) / 100; r += rCreep;
      path.push({ yr: t + 1, debt: d, r });
    }
    return path;
  };
  const stg = stage(I1_rev, I2_rev, I3);
  return { indicators: { I1_rev, I2_rev, I3, primDefRev }, stage: stg,
           mpPhase: inferMP(stg, I3),
           path: project(I1_rev, primDefRev, gNom, last(rate), 0.5, horizonYrs) };
}
```

Consumer: `dalio_dashboard.html` renders stage chip + 10-yr trajectory overlay.

### 8b. Excel — sheet layout, Power Query M or URL, key formulas

Workbook `dalio_model.xlsx`, sheet `3_LongCycle`. One Power Query per FRED series:

```m
let Source = Json.Document(Web.Contents(
    "https://api.stlouisfed.org/fred/series/observations",
    [Query=[series_id="GFDEGDQ188S", api_key=ApiKey, file_type="json"]])),
  T = Table.ExpandRecordColumn(
      Table.FromList(Source[observations], Splitter.SplitByNothing()),
      "Column1", {"date","value"})
in T
```

Cols A–L: `date | D_tot/GDP | D_pub/GDP | Int/GDP | Hdl_Def/GDP | Rev/GDP | PrimDef/GDP | I1_rev | I2_rev | I3 | Stage | MPPhase`. Key formulas: `Rev_share = [@Rev/GDP]/100`; `I1_rev = [@D_tot/GDP]/Rev_share`; `I2_rev = [@Int/GDP]/Rev_share`; `PrimDef/GDP = ABS([@Hdl_Def/GDP])-[@Int/GDP]`; `I3 = [@10y]-[@gNom]`; `Stage` = nested `IF` on § 6 revenue edges (200/400/550/900, 5/10/15/40); `Alarm = IF(AND(Stage="DELEVERAGING",I3>0),"INFLATIONARY_LEVER_RISK","")`.

### 8c. ECharts config — chart type, encoding, palette tokens

Dual-panel: top = stacked `D_pub/GDP + D_priv/GDP` bars with dashed projection overlay (Dalio Ex 3 Y0/Y5/Y10 anchors from § 7); bottom = `I3 = r − g` line with zero-ref.

```js
const ax = { axisLine:{lineStyle:{color:'#262626'}}, axisLabel:{color:'#A3A3A3'} };
const panel = { backgroundColor:'#141414', borderColor:'#262626', borderWidth:1 };
option = {
  backgroundColor: '#0B0B0B', textStyle: { color: '#F5F5F5' },
  grid: [ {top:50,  height:'50%', ...panel}, {top:'68%', height:'23%', ...panel} ],
  xAxis: [ {gridIndex:0, type:'time', ...ax}, {gridIndex:1, type:'time', ...ax} ],
  yAxis: [ {gridIndex:0, name:'Debt / Revenue (%)', ...ax,
            nameTextStyle:{color:'#A3A3A3'}, splitLine:{lineStyle:{color:'#1C1C1C'}}},
           {gridIndex:1, name:'r − g (pp)', ...ax,
            nameTextStyle:{color:'#A3A3A3'}, splitLine:{lineStyle:{color:'#1C1C1C'}}} ],
  series: [
    {name:'Gov debt/Rev',  type:'bar', stack:'d', xAxisIndex:0, yAxisIndex:0,
     itemStyle:{color:'#00D08C'}, data:govSeries},
    {name:'Priv debt/Rev', type:'bar', stack:'d', xAxisIndex:0, yAxisIndex:0,
     itemStyle:{color:'#7FFFD4'}, data:privSeries},
    {name:'Projection (op. approx; Ex 3 anchors 580/689/898 per § 7)', type:'line',
     xAxisIndex:0, yAxisIndex:0, showSymbol:false,
     lineStyle:{color:'#D4A373', type:'dashed', width:1}, data:projSeries},
    {name:'r − g', type:'line', xAxisIndex:1, yAxisIndex:1, showSymbol:false,
     lineStyle:{color:'#F5F5F5', width:1}, data:spreadSeries,
     markLine:{lineStyle:{color:'#E5484D'}, data:[{yAxis:0}]},
     markArea:{itemStyle:{color:'#080808'},
               data:[[{xAxis:delStart},{xAxis:delEnd}]]}}
  ],
  tooltip:{trigger:'axis', backgroundColor:'#1C1C1C',
           borderColor:'#262626', textStyle:{color:'#F5F5F5'}},
  legend: {textStyle:{color:'#6B7280'}}
};
```

Stage chips: `#00D08C` SOUND · `#7FFFD4` BUBBLE · `#D4A373` TOP · `#E5484D` DELEVERAGING · `#F5F5F5` RECEDES. Tertiary labels `#6B7280`.

## § 9 Integration Points

**Upstream:** FRED (all 8 series in § 4); BIS Total Credit + DSR; IMF COFER; World Bank WDI. Subsection 1.1 emits `debt_money_regime` — HIGH triggers 1.3's Deleveraging watch.

**Downstream:** **1.4** activates on `stage ∈ {TOP, DELEVER}` (ships stage + `I3` sign); **1.6** reads `(stage, COFER)` (1.3 does NOT compute 8-measures); **1.7** reads `I3` sign under DELEVER; **2.2** reads `(stage, I3)` for 4-box cell; **2.5** uses § 5.3 for "rate spiral" scenarios.

**Scope pointers (out-of-scope):** 4 levers → **1.4**; short 5–8 yr cycle → **1.2**; 8-measures/250-yr empire → **1.6**; 10-yr asset-leadership rotation → **1.5**.

## § 10 Limitations & Sources

### Limitations / design choices

Each entry below references the body location where the gap is closed via Dalio cite, NON-DALIO cite, or explicit `> **DERIVED (operational)**` marker per R5/R10/R15.

1. **Cycle duration is a Dalio-published range.** "~80 ±25 years" (HCGB-1 Ch 1; § 2 verbatim). Year-count alone never signals late-stage; § 6's stage classifier relies on the four indicators (`I1`–`I4`), not duration.
2. **Stage edges 200/400/550/900 and 5/10/15/40 are DERIVED.** Dalio publishes point anchors only (1944=7x; today=580%; JPN=1376%); inter-stage edges are project-author. Closure: explicit `DERIVED (operational)` markers at § 6 above and below the stage table; 550/900 bracket the US (580%) and Japan (1376%) cases.
3. **MP phases (HCGB-1 Ch 1) are taxonomic, not numeric.** Dalio defines MP1–MP6 by qualitative regime (Linked/Hard, Fiat-Interest-Rate-Driven, Fiat-with-Debt-Monetization, Coordinated Fiscal/Monetary, Big Deleveraging, Return to Hard Money) at § 5.6 verbatim. Transition triggers are described qualitatively (rate floor hit → MP3; QE exhausted → MP4; etc.) without numeric thresholds. Classifier in § 5.6 uses Boolean checks (rate active? QE active? coordinated fiscal-monetary? restructuring?) — taxonomic by design.
4. **"50% ±20%" debt-to-income reduction is a Dalio deleveraging archetype, not a forward target.** Cited at § 2 verbatim (HCGB-1 Ch 1, Stage 4); appears as backward-looking summary across the deleveraging archetype, not a calibrated parameter for projection.
5. **"r − g = 2% → +50%/20 yr" is a Dalio rule of thumb under zero primary deficit.** Cited at § 5.4 verbatim (HCGB-1 Ch 3 Ex 2). The DERIVED note at § 5.4 flags non-linear blow-ups at high starting debt; § 5.3 closed-form formula is the production projection.
6. **COFER "falling > 10 pp / 10 yr" trigger is DERIVED.** Dalio gives no numeric threshold for reserve-currency drift. Closure: explicit `DERIVED (operational)` marker at § 6 reserve-currency overlay.
7. **Three-denominator design choice (% GDP, % revenue, % money/gold).** Dalio uses revenue throughout HCGB-1 Ch 3; FRED publishes most series in % GDP. Conversion at § 5.2 (with US revenue/GDP anchor 17% per Dalio Ch 3 cross-country table verbatim) + DERIVED note that `Rev_GDP` varies 14–20% historically, so production runs pipe FRED `FYFRGDA188S` rather than hard-coding 0.17.
8. **Primary vs headline deficit derivation.** FRED `FYFSGDA188S` is HEADLINE (includes interest); Dalio's Ex 1 / Ex 3 inputs use PRIMARY. Closure: explicit `DERIVED (operational)` marker at § 5.5 documenting the OMB/CBO-standard subtraction; sanity-check arithmetic vs Dalio's 15% revenue decade average preserved.

### Sources

All sources publicly accessible.

- **Primary.** Dalio, *How Countries Go Broke: Part 1*, Intro + Ch 1 + Ch 3 Ex 1–3. https://economicprinciples.org/downloads/how-countries-go-broke-part-1.pdf
- **Primary.** Dalio, "How the Economic Machine Works," Bridgewater 2012. https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf
- **Primary.** Dalio, "Where We Are in the Big Cycle …" LinkedIn Feb 2022. https://www.linkedin.com/pulse/where-we-big-cycle-money-credit-debt-economic-activity-ray-dalio
- **Primary.** Dalio, *Principles for Navigating Big Debt Crises*, 2018 (free PDF via email). https://www.principles.com/big-debt-crises
- **Data.** FRED API https://fred.stlouisfed.org/docs/api/fred/ — 8 series listed in § 4.
- **Data.** BIS — total credit `https://data.bis.org/topics/TOTAL_CREDIT/BIS,WS_TC,2.0/Q.US.C.A.M.770.A`; DSR portal `https://data.bis.org/topics/DSR`; SDMX v2 docs `https://stats.bis.org/api-doc/v2/`.
- **Data.** IMF COFER https://data.imf.org/en/datasets/IMF.STA:COFER (CSV/XLSX; from 2025Q3 unallocated eliminated per TN Nov 2025 — branch at boundary).
- **Data.** World Bank WDI — concrete USA: `https://api.worldbank.org/v2/country/USA/indicator/FI.RES.TOTL.CD?format=json`; template: `…/country/{ISO}/indicator/FI.RES.TOTL.CD` (R3 placeholder); page `https://data.worldbank.org/indicator/FI.RES.TOTL.CD`.
