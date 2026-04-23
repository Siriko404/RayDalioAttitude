# 1.2 Short-Term Debt Cycle

## § 1 Executive Summary

Dalio's short-term debt cycle is a 5–8 year oscillation driven by central-bank policy: tighten when inflation / capacity rise, ease when slack returns. He names six phases — early, mid, late, tightening, early-recession, late-recession — with growth / duration anchors (p. 18). This layer builds a phase-classifier from FRED data, emits a 12-month recession probability, and hands a regime tag downstream. Not covered: 50–75 year cycle (→ 1.3), zero-bound deleveraging (→ 1.4), inflation tagging (→ 1.7).

## § 2 Dalio's Framework — Verbatim

All citations: Dalio, "How the Economic Machine Works," Bridgewater, updated March 2012. Page numbers from printed footer of public mirror: https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf

> **Dalio** — p. 3: "a recession is an economic contraction that is due to a contraction in private sector debt growth arising from tight central bank policy (usually to fight inflation), which ends when the central bank eases."

> **Dalio** — p. 5: "a shorter-term (typically 5 to 8 years) debt cycle (i.e., the 'business/market cycle')."

> **Dalio** — p. 18: "The short-term debt cycle, also known as the business cycle, is primarily controlled by central banks' policies that a) tighten when inflation is too high and/or rising uncomfortably because there isn't much slack in the economy (as reflected in the GDP gap, capacity utilization and the unemployment rate) and credit growth is strong; and b) ease when the reverse conditions exist."

> **Dalio** — p. 18: "The 'early-cycle' (which typically lasts about five or six quarters) […] Credit growth is typically fast, economic growth is strong (i.e., in excess of 4%), inflation is low […]"

> **Dalio** — p. 18: "the 'mid-cycle' […] economic growth slows substantially (i.e., to around 2%), inflation remains low […]" followed by "the 'late-cycle' (which typically begins about 2 ½ years into expansion) […] economic growth picks up to a moderate pace (i.e., around 3.5-4%)."

> **Dalio** — p. 18: "the tightening phase […] actual or anticipated acceleration of inflation prompts the Fed to turn restrictive, which shows up in reduced liquidity, interest rates rising and the yield curve flattening or inverting."

## § 3 Decision Problem

Which phase of the 5–8 year business cycle is the economy in today, and how close is the next recession? This layer emits three primitives downstream consumes: `cycle_phase` ∈ {early, mid, late, tightening, recession-early, recession-late, transitional}, `recession_prob_12m`, `policy_stance` ∈ {easing, neutral, tightening}. 2.2 and 2.5 flip asset-regime weights on this vector. Wrong tag = wrong equity/bond tilt.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `RGDP_yoy` | Real GDP growth, % change from prior period, annualized (FRED `A191RL1Q225SBEA`) | % SAAR | FRED (BEA) | `https://api.stlouisfed.org/fred/series/observations?series_id=A191RL1Q225SBEA` | Quarterly | −9% to +8% post-1960 |
| `GDP_gap` | Real GDP vs CBO real potential GDP (computed: `GDPC1 / GDPPOT − 1`) | % of potential | FRED (BEA, CBO) | `.../series_id=GDPC1` and `.../series_id=GDPPOT` | Quarterly | −8% to +4% post-1960 |
| `UNRATE` | Civilian unemployment rate, 16 yrs+, SA (FRED `UNRATE`) | % | FRED (BLS) | `.../series_id=UNRATE` | Monthly | 3% to 11% post-1960 |
| `CAPUTL` | Capacity Utilization: Total Index, percent of capacity, SA (FRED `TCU`, Fed G.17) | % | FRED (Fed G.17) | `.../series_id=TCU` | Monthly | 65% to 90% post-1967 |
| `CPI_yoy` | CPI-U All Items, U.S. city avg; compute YoY (FRED `CPIAUCSL`) | % YoY | FRED (BLS) | `.../series_id=CPIAUCSL` | Monthly | −2% to +14% post-1960 |
| `FEDFUNDS` | Effective federal funds rate, monthly, NSA (FRED `FEDFUNDS`, Fed H.15) | % | FRED (Fed H.15) | `.../series_id=FEDFUNDS` | Monthly | 0% to 19% post-1960 |
| `T10Y2Y` | 10y–2y Treasury CMT yield spread (FRED `T10Y2Y`) | %pt | FRED (Fed H.15) | `.../series_id=T10Y2Y` | Daily | −3 to +3 post-1976 |
| `T10Y3M` | 10y–3m Treasury CMT yield spread (FRED `T10Y3M`) | %pt | FRED (Fed H.15) | `.../series_id=T10Y3M` | Daily | −4 to +4 post-1982 |
| `C&I_loans` | Commercial & industrial loans, all banks (FRED `BUSLOANS`, Fed H.8) | USD bn SA | FRED (Fed H.8) | `.../series_id=BUSLOANS` | Monthly | 500 to 3,000 post-2000 |
| `SAHM` | Real-time Sahm Rule recession indicator: 3-mo avg UNRATE minus prior-12m min (FRED `SAHMREALTIME`) | %pt | FRED | `.../series_id=SAHMREALTIME` | Monthly | −0.3 to +2.5 normal; ~+4 in 2020 |
| `NYFED_prob` | NY Fed monthly 10y–3m spread + fitted 12-mo recession probability (XLS) | % / %pt | NY Fed Liberty St | `https://www.newyorkfed.org/medialibrary/media/research/capital_markets/allmonth.xls` | Monthly | 0% to 95% post-1960 |

FRED endpoints require a free `api_key` and accept `&file_type=json`. Non-US extension: World Bank WDI `NY.GDP.MKTP.KD` + IMF WEO.

## § 5 Computation / Transformations

### 5.1 Cycle-phase indicator construction

Let `g = RGDP_yoy`, `cu = CAPUTL`, `π = CPI_yoy`, `spread = T10Y3M`, `ΔFF = FEDFUNDS − FEDFUNDS_{-12}`. Operationalise each Dalio phase (p. 18) as a Boolean:

Early-cycle:
$$\text{early} = \mathbb{1}\{g > 4\% \text{ AND } \Delta g > 0 \text{ AND } \pi < \pi_{\text{prev}} \text{ AND } \Delta FF \leq 0\}$$
> **Dalio** — p. 18: "economic growth is strong (i.e., in excess of 4%), inflation is low." 4% and low-inflation gates are Dalio-exact.

Mid-cycle:
$$\text{mid} = \mathbb{1}\{1.5\% \leq g \leq 2.5\% \text{ AND } \Delta g < 0 \text{ AND } \Delta FF \approx 0\}$$
> **DERIVED (operational)** — Dalio anchors mid-cycle at "around 2%" (p. 18); the ±0.5pp band is derived so the flag fires on a single quarterly observation.

Late-cycle:
$$\text{late} = \mathbb{1}\{3.5\% \leq g \leq 4.0\% \text{ AND } \pi > \pi_{\text{prev}} \text{ AND } cu > 78\% \text{ AND } \text{MST} \geq 30\}$$
> **Dalio** — p. 18: "the 'late-cycle' (which typically begins about 2 ½ years into expansion) […] economic growth picks up to a moderate pace (i.e., around 3.5-4%)." 3.5–4% and 30-month (≈ 2½ yr) gates are Dalio-exact.
> **DERIVED (operational)** — `cu > 78%` = 50-yr FRED `TCU` median (Dalio names capacity utilization (p. 18) as a tightness input without a threshold).

Tightening:
$$\text{tightening} = \mathbb{1}\{\Delta FF > 0 \text{ AND } spread < 1\% \text{ AND } \pi > 2.5\%\}$$
> **Dalio** — p. 18: "actual or anticipated acceleration of inflation prompts the Fed to turn restrictive, which shows up in […] the yield curve flattening or inverting."
> **DERIVED (operational)** — `spread < 1%` = post-1982 T10Y3M median; `π > 2.5%` = 0.5pp above the Fed's 2% target.

### 5.2 Recession probability — yield-curve model

> **NON-DALIO (industry standard)** — Estrella & Mishkin (1996), "The Yield Curve as a Predictor of U.S. Recessions," FRBNY *Current Issues* 2(7), https://www.newyorkfed.org/medialibrary/media/research/current_issues/ci2-7.pdf. Closes a gap: Dalio names no numeric P(recession) model.

$$P(\text{rec})_{t+12} = \Phi(\alpha + \beta \cdot spread_t)$$

NY Fed publishes fitted probabilities monthly in `allmonth.xls`; no client-side re-fit needed.

### 5.3 Recession probability — labor-market model (Sahm Rule)

> **NON-DALIO (industry standard)** — Sahm (2019), "Direct Stimulus Payments to Individuals," in *Recession Ready*, Hamilton Project: https://www.hamiltonproject.org/wp-content/uploads/2023/01/Sahm_web_20190506.pdf. Closes a gap: Dalio names unemployment as a tightness proxy (p. 18) but gives no recession-call rule.

$$\text{Sahm}_t = \text{MA}_3(u_t) - \min_{s \in [t-12, t]} u_s$$

> **NON-DALIO (industry standard)** — Sahm (2019), p. 76: "Automatic lump-sum stimulus payments would be made to individuals when the three-month average national unemployment rate rises by at least 0.50 percentage points relative to its low in the previous 12 months." Rule: if `Sahm_t ≥ 0.5 pp` → flag `RECESSION_UNDERWAY`.

### 5.4 Months-since-trough (MST)

Take latest NBER recession-end date; compute MST in months. Grounds the late-cycle 30-month gate. JSON: https://data.nber.org/data/cycles/business_cycle_dates.json.

## § 6 Output Variables & Decision Rules

Three regime tags + two probabilities. Each rule carries attribution within 3 lines (R7b).

**`cycle_phase`** ← § 5.1 flags + MST → `EARLY` / `MID` / `LATE` / `TIGHTENING` / `RECESSION_EARLY` / `RECESSION_LATE` / `TRANSITIONAL`.

> **Dalio** — p. 18: six phases named ("early-cycle", "mid-cycle", "late-cycle", "tightening phase", "early part of the recession", "late part of the recession"). `TRANSITIONAL` is DERIVED as a catch-all when no primary flag fires.

**`policy_stance`** ← sign of `ΔFF_12m` → `EASING` if `ΔFF < −0.5pp`; `TIGHTENING` if `ΔFF > +0.5pp`; else `NEUTRAL`.

> **DERIVED (operational)** — Dalio (p. 18) gives only qualitative "easing" vs "tightening"; ±0.5pp ≈ 2× a 25bp FOMC move and avoids tagging every single adjustment as a regime change.

**`yc_signal`** ← `spread` (T10Y3M) → `INVERTED` if `< 0`; `FLAT` if `[0, 100bp)`; `STEEP` if `≥ 100bp`.

> **DERIVED (operational)** — Dalio mentions "flattening or inverting" (p. 18) qualitatively. `0` = inversion boundary (structural); `100bp` = post-1982 T10Y3M median.

**`recession_prob_12m`** ← NY Fed probit (§ 5.2) → raw %; `ELEVATED` if `> 30%`.

> **DERIVED (operational)** — underlying model is NON-DALIO (Estrella-Mishkin). At `spread = 0` the probit prints ≈ 25–30%, so 30% fires at or just past inversion.

**`sahm_signal`** ← Sahm Rule (§ 5.3) → `TRIGGERED` if `Sahm ≥ 0.5 pp`.

> **NON-DALIO (industry standard)** — Sahm (2019) rule; 0.5pp threshold is the author's own numeric trigger (§ 5.3 quote).

Sequencing `RECESSION_EARLY` vs `RECESSION_LATE`: early = `sahm_signal=TRIGGERED` ∧ `policy_stance ∈ {NEUTRAL, TIGHTENING}`; late = `sahm_signal=TRIGGERED` ∧ `policy_stance=EASING`.

> **Dalio** — p. 19: "In the early part of the recession, the economy contracts […] because the Fed remains tight. In the late part of the recession, the central bank eases monetary policy as inflation concerns subside and recession concerns grow."

## § 7 Worked Numeric Example

Real data, as-of 2026-04-21 (§ 7 option (b): real values + named FRED series).

**Step 1 — inputs.**

| Variable | Value | FRED series |
|---|---|---|
| `RGDP_yoy` | +2.1% | `A191RL1Q225SBEA` |
| `GDP_gap` | +0.3% | `GDPC1` / `GDPPOT` |
| `UNRATE` | 4.1% | `UNRATE` |
| `CAPUTL` | 77.9% | `TCU` |
| `CPI_yoy` | 3.1% | `CPIAUCSL` YoY |
| `FEDFUNDS` | 4.33% | `FEDFUNDS` |
| `T10Y3M` | 0.45pp | `T10Y3M` |
| `ΔFF_12m` | −1.00pp | `FEDFUNDS` Δ |
| `SAHM` | 0.4pp | `SAHMREALTIME` |

**Step 2 — flags (§ 5.1).** Early: `g>4` FAIL (2.1). Mid: `1.5 ≤ 2.1 ≤ 2.5` PASS, `Δg<0` PASS, `|ΔFF|<0.5` FAIL (−1.0). Late: `g ≥ 3.5` FAIL. Tightening: `ΔFF>0` FAIL. No flag fires → `TRANSITIONAL`. Matches Dalio p. 19: "it is the sequence of events, not the specific timeline, which is important".

**Step 3 — policy.** `ΔFF = −1.00 < −0.5` → `EASING`.

**Step 4 — yield curve.** `spread = 0.45 ∈ [0, 1.0)` → `FLAT`.

**Step 5 — recession prob.** NY Fed probit at `spread = 0.45` ≈ 18% (from `allmonth.xls`); 18 < 30 → not `ELEVATED`.

**Step 6 — Sahm.** `0.4 < 0.5` → `NOT_TRIGGERED` (close).

**Step 7 — regime vector.**
```
{ cycle_phase: "TRANSITIONAL", policy_stance: "EASING",
  yc_signal: "FLAT", recession_prob_12m: 0.18, sahm_signal: "NOT_TRIGGERED" }
```

PM read: post-tightening Fed has pivoted to easing; growth at mid-cycle mark; curve de-inverted but flat; Sahm near threshold. No recession call. 2.2 reads `TRANSITIONAL` + `EASING` → neutral growth tilt, modest duration overweight.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// file: dalio_dashboard/stdc.js
const FRED = (id, key) =>
  `https://api.stlouisfed.org/fred/series/observations` +
  `?series_id=${id}&api_key=${key}&file_type=json`;

async function shortTermDebtCycle({ apiKey, now = new Date() }) {
  const ids = ['A191RL1Q225SBEA','GDPC1','GDPPOT','UNRATE','TCU',
               'CPIAUCSL','FEDFUNDS','T10Y3M','SAHMREALTIME'];
  const s = await Promise.all(ids.map(
    id => fetch(FRED(id, apiKey)).then(r => r.json()).then(toSeries)));
  const [g_yoy,,, u, cu, cpi, ff, spread, sahm] = s;

  const g = g_yoy.last(), gPrev = g_yoy.at(-2).value;
  const pi = yoy(cpi, 12), piPrev = yoyAt(cpi, -3, 12);
  const dFF = ff.last().value - ff.at(-13).value;
  const spr = spread.last().value;
  const mst = monthsSinceLastTrough(now);   // NBER JSON

  const early = g > 4 && g > gPrev && pi < piPrev && dFF <= 0;
  const mid   = g >= 1.5 && g <= 2.5 && g < gPrev && Math.abs(dFF) < 0.5;
  const late  = g >= 3.5 && g <= 4.0 && pi > piPrev && cu.last().value > 78 && mst >= 30;
  const tight = dFF > 0 && spr < 1 && pi > 2.5;
  const rec   = sahm.last().value >= 0.5;

  return {
    cycle_phase: early?'EARLY':mid?'MID':late?'LATE':tight?'TIGHTENING'
               : rec && dFF < -0.5 ? 'RECESSION_LATE'
               : rec ? 'RECESSION_EARLY' : 'TRANSITIONAL',
    policy_stance: dFF < -0.5 ? 'EASING' : dFF > 0.5 ? 'TIGHTENING' : 'NEUTRAL',
    yc_signal:     spr < 0 ? 'INVERTED' : spr < 1 ? 'FLAT' : 'STEEP',
    recession_prob_12m: await fetchNYFedProb(spr),  // from allmonth.xls
    sahm_signal:   rec ? 'TRIGGERED' : 'NOT_TRIGGERED'
  };
}
```

### 8b. Excel — sheet layout, Power Query M, key formulas

Workbook `dalio_model.xlsx`, sheet `2_STDC`. One Power Query per FRED series.

```m
let
    Source = Json.Document(Web.Contents(
        "https://api.stlouisfed.org/fred/series/observations",
        [Query = [series_id = "T10Y3M",
                  api_key = ApiKey, file_type = "json"]])),
    Obs = Source[observations],
    T = Table.ExpandRecordColumn(
          Table.FromList(Obs, Splitter.SplitByNothing()),
          "Column1", {"date", "value"})
in T
```

Columns A–K: `date | RGDP_yoy | GDP_gap | UNRATE | CAPUTL | CPI_yoy | FEDFUNDS | dFF_12m | T10Y3M | SAHM | cycle_phase`.

Key named formulas:
- `dFF_12m` = `FEDFUNDS_t - OFFSET(FEDFUNDS_t, -12)`
- `EarlyFlag` = `IF(AND(RGDP_yoy>4, dRGDP>0, dCPI<0, dFF_12m<=0), 1, 0)`
- `LateFlag` = `IF(AND(RGDP_yoy>=3.5, RGDP_yoy<=4, dCPI>0, CAPUTL>78, MST>=30), 1, 0)`
- `YCSignal` = `IF(T10Y3M<0, "INVERTED", IF(T10Y3M<1, "FLAT", "STEEP"))`
- `PolicyStance` = `IF(dFF_12m<-0.5, "EASING", IF(dFF_12m>0.5, "TIGHTENING", "NEUTRAL"))`

### 8c. ECharts config — chart type, encoding, palette tokens

Chart: dual-pane. Top: RGDP_yoy with markLines at phase anchors (2.0, 3.75, 4.0). Bottom: T10Y3M with zero-line + shaded FLAT band `[0, 1.0)`. MarkLines match § 5.1 (mid 2%, late 3.5–4%) and § 7 (RGDP 2.1 between 2.0 and 3.5; spread 0.45 inside [0, 1.0)).

```js
option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5' },
  grid: [
    { top: 40, height: '42%', backgroundColor: '#141414', borderColor: '#262626', borderWidth: 1 },
    { top: '58%', height: '32%', backgroundColor: '#141414', borderColor: '#262626', borderWidth: 1 }
  ],
  xAxis: [0,1].map(i => ({ gridIndex: i, type: 'time',
    axisLine: { lineStyle: { color: '#262626' } }, axisLabel: { color: '#A3A3A3' } })),
  yAxis: [
    { gridIndex: 0, name: 'RGDP YoY (%)', nameTextStyle: { color: '#A3A3A3' },
      axisLabel: { color: '#A3A3A3' }, splitLine: { lineStyle: { color: '#1C1C1C' } } },
    { gridIndex: 1, name: '10y–3m (pp)', nameTextStyle: { color: '#A3A3A3' },
      axisLabel: { color: '#A3A3A3' }, splitLine: { lineStyle: { color: '#1C1C1C' } } }
  ],
  series: [
    { name: 'RGDP_yoy', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: rgdp,
      showSymbol: false, lineStyle: { color: '#00D08C', width: 2 },
      markLine: { symbol: 'none', lineStyle: { color: '#7FFFD4', type: 'dashed' },
        data: [{ yAxis: 2.0 }, { yAxis: 3.75 }, { yAxis: 4.0 }] } },
    { name: 'T10Y3M', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: spread,
      showSymbol: false, lineStyle: { color: '#D4A373', width: 1 },
      markLine: { symbol: 'none', lineStyle: { color: '#E5484D' }, data: [{ yAxis: 0 }] },
      markArea: { itemStyle: { color: '#080808' }, data: [[{ yAxis: 0 }, { yAxis: 1.0 }]] } }
  ],
  tooltip: { trigger: 'axis', backgroundColor: '#1C1C1C',
    borderColor: '#262626', textStyle: { color: '#F5F5F5' } }
};
```

Phase chips: `#00D08C` (EARLY / EASING / STEEP), `#7FFFD4` (MID / NEUTRAL / FLAT), `#D4A373` (LATE), `#E5484D` (TIGHTENING / INVERTED / RECESSION_*), `#A3A3A3` (TRANSITIONAL). Tertiary text `#6B7280`.

## § 9 Integration Points

**Upstream:** FRED API (BEA, BLS, Fed G.17, H.15, H.8); NY Fed `allmonth.xls`; NBER cycle-dates JSON; 1.1 Economic Machine for `gap_regime` + `trend_growth_pct`.

**Downstream:**
- **2.2 All-Weather** tilts growth-axis weights on `cycle_phase` + `yc_signal` (overweight growth EARLY, underweight LATE / TIGHTENING).
- **2.5 Stress-Testing** weights historical analogs (1973, 1981, 1990, 2001, 2008, 2020) on `recession_prob_12m` + `sahm_signal`.
- **1.3 Long-Term Debt Cycle** reads `policy_stance` at decade scale to detect when rate cuts hit the zero bound (control hands off to 1.4).
- **1.5 Paradigm Shifts** reads `cycle_phase` transition sequences for regime change.

**Not covered:** post-ZLB dynamics (→ 1.4); debt-to-GDP ceiling (→ 1.3); CPI regime beyond the tightening flag (→ 1.7); paradigm shifts (→ 1.5).

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **Phase durations are ranges.** Early 5–6 qtrs, mid 3–4 qtrs, late from ~2½ years (p. 18); expansions from deep recessions "bound to last longer" (p. 19). Classifier treats as ranges, not forecasts.
2. **4% early-cycle anchor is a 20th-century artifact.** Trend productivity has fallen (→ 1.1). Stipulated fallback: use `> trend + 2σ` as the relative anchor post-2015. Flagged per R5.
3. **Yield-curve thresholds are not Dalio.** p. 18 says "flattening or inverting" qualitatively; `<0` and `<100bp` cuts come from Estrella-Mishkin + post-1982 median. Marked NON-DALIO (§ 5.2) / DERIVED (§ 6).
4. **No Dalio recession-probability model exists.** NY Fed probit + Sahm Rule are external closers; Dalio names unemployment / GDP gap only qualitatively (p. 18).
5. **MST grounding is NBER, not Dalio.** "2½ years into expansion" has no specified dating convention. ECRI / OECD would give slightly different values.
6. **Six-phase sequence is not always observed.** Dalio (p. 19): "not all are manifest precisely as described." Shocks can skip phases. `TRANSITIONAL` fallback catches failed-all-flags observations.
7. **CAPUTL 78% gate is a median, not Dalio.** Dalio names capacity utilization as a tightness input without a threshold; 78% is the 50-year TCU median. Marked DERIVED in § 5.1.
8. **NY Fed `Prob_Rec.xlsx` link actually serves a PDF** (the chart, not data). Live data file is `allmonth.xls`; § 4 endpoint corrected.

### Sources (all publicly accessible, no login)

- **Primary, page-numbered.** Dalio, "How the Economic Machine Works — A Template for Understanding What is Happening Now," Bridgewater, updated March 2012 (pp. 3, 5, 18, 19, 20): https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf. Fed Funds cyclical peaks/troughs table (1919–2011) on p. 20.
- **Canonical Dalio portal:** https://www.economicprinciples.org/
- **FRED API.** https://fred.stlouisfed.org/docs/api/fred/ — series: `A191RL1Q225SBEA`, `GDPC1`, `GDPPOT`, `UNRATE`, `TCU`, `CPIAUCSL`, `FEDFUNDS`, `T10Y3M`, `T10Y2Y`, `BUSLOANS`, `SAHMREALTIME`.
- **NON-DALIO yield-curve probit.** Estrella & Mishkin (1996), "The Yield Curve as a Predictor of U.S. Recessions," FRBNY *Current Issues* 2(7): https://www.newyorkfed.org/medialibrary/media/research/current_issues/ci2-7.pdf. Live data: https://www.newyorkfed.org/medialibrary/media/research/capital_markets/allmonth.xls (monthly spread + probability). Live chart PDF: https://www.newyorkfed.org/medialibrary/media/research/capital_markets/Prob_Rec.pdf. FAQ: https://www.newyorkfed.org/research/capital_markets/ycfaq.
- **NON-DALIO Sahm Rule.** Sahm (2019), "Direct Stimulus Payments to Individuals," in *Recession Ready: Fiscal Policies to Stabilize the American Economy*, Hamilton Project: https://www.hamiltonproject.org/wp-content/uploads/2023/01/Sahm_web_20190506.pdf. FRED indicator: https://fred.stlouisfed.org/series/SAHMREALTIME.
- **NBER business-cycle dates** (for MST): https://data.nber.org/data/cycles/business_cycle_dates.json; HTML: https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions.
- **IMF WEO (non-US extension):** https://www.imf.org/en/Publications/WEO.
