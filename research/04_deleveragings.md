# 1.4 Deleveragings

## § 1 Executive Summary

When a long-term debt cycle tops, policymakers pull Dalio's four levers — debt reduction, austerity, wealth transfer, debt monetization — to reduce debt/income ratios. Dalio classifies outcomes into three regimes: *ugly deflationary* (NGDP < rate, debt/income still rising), *beautiful* (balanced, NGDP > rate, debt/income falling), *ugly inflationary* (lever 4 dominates, currency collapses). Scope: classification + lever scoring; not cycle detection (→ 1.2/1.3) or transitions (→ 1.5).

## § 2 Dalio's Framework — Verbatim

Two Dalio primary sources. (i) "An In-Depth Look at Deleveragings," Bridgewater, February 2012 — standalone PDF, unpaginated. (ii) "How the Economic Machine Works — A Template" (2015 draft) — Chapter I of the compilation that re-prints the In-Depth paper as Chapter II.

> **Dalio** — source: "An In-Depth Look at Deleveragings," https://www.nowandfutures.com/large/an-in-depth-look-at-deleveragings--ray-dalio-bridgewater.pdf : "[…] the differences between deleveragings depend on the amounts and paces of 1) debt reduction, 2) austerity, 3) transferring wealth from the haves to the have-nots, and 4) debt monetization."

> **Dalio** — source: ibid.: "Each one of these four paths reduces debt/income ratios, but they have different effects on inflation and growth. Debt reduction (i.e., defaults and restructurings) and austerity are both deflationary and depressing while debt monetization is inflationary and stimulative."

> **Dalio** — source: ibid.: "The right amounts are those that a) neutralize what would otherwise be a deflationary credit market collapse and b) get the nominal growth rate marginally above the nominal interest rate to tolerably spread out the deleveraging process."

> **Dalio** — source: ibid.: "In the second phase of the typical deleveraging the debt/income ratios decline at the same time as economic activity and financial asset prices improve. This happens because there is enough 'printing of money/debt monetization' to bring the nominal growth rate above the nominal interest rate and a currency devaluation to offset the deflationary forces."

> **Dalio** — source: ibid.: "'ugly inflationary deleveragings' (in which the 'printing' is large relative to the deflationary forces and nominal growth through monetary inflation and interest rates are in a self-reinforcing upward spiral)."

## § 3 Decision Problem

Given 1.1 has tagged `debt_money_regime = HIGH` with `gap_regime = BELOW_TREND`, a deleveraging is in progress. Two questions: (a) which of Dalio's three regimes — *ugly deflationary*, *beautiful*, *ugly inflationary* — is running; (b) what is the current lever mix? Outputs feed 2.2 All-Weather and 2.5 Stress-Testing. Transitions belong to 1.5; cycle detection to 1.2/1.3.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `GDP_level` | Nominal GDP, level (USD bn SAAR) | USD bn | FRED (BEA) | `series_id=GDP` | Quarterly | 1000–30000 |
| `DebtGDP` | Total credit to non-financial sector / GDP | % of GDP | FRED (BIS) | `series_id=QUSCAM770A` | Quarterly | 100%–500% |
| `LT_Rate` | 10-yr UST yield (nominal interest rate proxy) | % p.a. | FRED | `series_id=DGS10` | Daily | 0.5%–15% |
| `M0_GDP` | Monetary base / GDP (print intensity) | % of GDP | FRED | `series_id=BOGMBASE` ÷ `GDP` | Monthly | 3%–30% |
| `CB_Assets` | Central bank balance sheet / GDP | % of GDP | FRED (Fed) / ECB / BoJ | `series_id=WALCL` | Weekly | 5%–130% (BoJ) |
| `CPI_yoy` | Headline CPI, year-on-year | % | FRED (BLS) | `series_id=CPIAUCSL` | Monthly | -10% to +15% |
| `FX_Gold` | Trade-weighted FX vs gold price | % p.a. | Stooq / LBMA | `https://stooq.com/q/?s=xauusd&i=d` + DXY | Daily | -40% p.a. to +5% p.a. |
| `FiscalBal` | Federal fiscal balance / GDP (austerity proxy; negative = deficit) | % of GDP | FRED (OMB) | `series_id=FYFSGDA188S` | Annual | -15% to +5% |
| `LoanWriteoff` | Net charge-off rate, all banks (default proxy) | % of loans | FRED (FDIC QBP) | `series_id=QBPLNTLNNTCGOFFR` | Quarterly | 0.2%–3.0% |
| `Gini_net` | Post-tax disposable-income Gini (wealth-transfer proxy) | Index | World Inequality Database | `https://wid.world/data/` (variable `gdiinc992j`) | Annual | 0.25–0.65 |

FRED cells show `series_id` only — full template per R3: `https://api.stlouisfed.org/fred/series/observations?series_id=X&api_key={FRED_API_KEY}&file_type=json` (free key). BIS direct alt: https://data.bis.org/topics/TOTAL_CREDIT/BIS,WS_TC,2.0/Q.US.C.A.M.770.A.

## § 5 Computation / Transformations

### 5.1 Regime classification inputs

Note FRED `GDP` returns level (USD bn SAAR), not growth — DERIVED `NGDP_yoy = yoy(GDP_level, 4)`. Three ratios over a trailing 4-quarter window:

1. **Growth-to-rate gap** (beautiful-condition core): $G_t = \text{NGDP}_{yoy,t} - \text{LT\_Rate}_t$
2. **Debt-to-income trajectory**: $\Delta D_t = \text{DebtGDP}_t - \text{DebtGDP}_{t-4}$
3. **Print intensity**: $\pi_t = (M0\_GDP_t - M0\_GDP_{t-4}) + (CB\_Assets_t - CB\_Assets_{t-4})$ (4Q deltas in print stock + CB assets, both as % of GDP)

> **DERIVED (operational)** — $\pi_t$ is author-stipulated as the sum of M0/GDP and CB-Assets/GDP 4Q deltas; Dalio names "money printing" + "central bank asset purchases" qualitatively but writes no formula.

> **Dalio** — source: "An In-Depth Look at Deleveragings": "get the nominal growth rate marginally above the nominal interest rate to tolerably spread out the deleveraging process." This anchors $G_t$'s sign as the beautiful gate.

### 5.2 Four-lever decomposition (Dalio's 4 paths)

> **DERIVED (operational)** — Dalio names the four levers qualitatively, without coefficients. Mapping below (fiscal tightening as −ΔBalance; writeoffs × debt stock; print-sum; Gini × debt × k=0.1) is operational. Dalio notes wealth transfers "rarely occur in amounts that contribute meaningfully," so `k` is small.

Per-quarter contribution in pp of GDP:

$$L^{\text{aust}}_t = -\Delta\text{FiscalBal}_t; \quad L^{\text{def}}_t = \text{Writeoff}_t \cdot \text{DebtGDP}_t$$
$$L^{\text{print}}_t = \pi_t; \quad L^{\text{redist}}_t = -k \cdot \Delta\text{Gini}_t \cdot \text{DebtGDP}_t$$

> **Dalio** — source: ibid.: "Debt reduction (i.e., defaults and restructurings) and austerity are both deflationary and depressing while debt monetization is inflationary and stimulative."

### 5.3 Regime rule (Dalio's three categories)

> **Dalio** — source: ibid.: "ugly deflationary deleveraging," "beautiful deleveraging," "ugly inflationary deleveraging" — the three exhaustive categories.

Regime is assigned on the joint sign of $G_t$ and $\pi_t$:

| Regime | Condition | Dalio anchor |
|---|---|---|
| UGLY_DEFLATIONARY | $G_t < 0$ AND $\Delta D_t > 0$ AND $\pi_t$ small | "economy was bad while the debt/income ratio rose" |
| BEAUTIFUL | $G_t > 0$ AND $\Delta D_t < 0$ AND $\pi_t$ moderate | "nominal growth rate above the nominal interest rate" |
| UGLY_INFLATIONARY | $G_t > 0$ AND CPI_yoy > LT_Rate AND FX_Gold < −20% p.a. | "self-reinforcing upward spiral" |

> **DERIVED (operational)** — $\pi_t$ buckets: "small" ≤ 0.5%, "moderate" 0.5%–4%, "large" > 4% of GDP p.a. Edges stipulated to bracket Dalio historical values (Japan 1990s ≈ 0.8%, US 1933–37 ≈ 2.0%, US 2009+ ≈ 3.3%). Dalio gives no bucket edges.

> **DERIVED (operational)** — FX_Gold < −20% p.a. matches Dalio's Spain data point; Dalio defines no "too much" devaluation numerically.

### 5.4 Lever-mix score (balance diagnostic)

Lever shares: $s^i_t = L^i_t / \sum_j L^j_t$ for $i \in \{\text{aust, def, print, redist}\}$.

> **DERIVED (operational)** — Dalio says beautiful deleveragings are "well balanced" but assigns no weights. Flag rule: $s^{\text{print}} < 0.25$ with $G<0$ → under-print/deflationary risk; $s^{\text{print}} > 0.75$ with CPI_yoy > 0 → over-print/inflationary risk. The 0.25/0.75 cutoffs are stipulated quartile anchors.

### 5.5 Debt-service burden (Fisher complement)

> **Dalio** — source: "How the Economic Machine Works — A Template": "the total amount of debt in the U.S. is about $50 trillion and the total amount of money … is about $3 trillion … roughly 15 times the amount of money there is to deliver" — structural squeeze arithmetic.

Use BIS DSR portal `https://data.bis.org/topics/DSR/BIS,WS_DSR,1.0/Q.US.P` (private non-financial sector key, CSV/XLSX export). SDMX `stats.bis.org/api/v1/...` is unstable in 2026.

> **NON-DALIO (industry standard)** — Fisher, Irving (1933), "The Debt-Deflation Theory of Great Depressions," *Econometrica* 1(4), FRASER PDF: https://fraser.stlouisfed.org/files/docs/meltzer/fisdeb33.pdf. Dalio emphasises debt service qualitatively; Fisher's nine-link mechanism (liquidation → falling prices → rising real debt → further liquidation) operationalises the "debt spiral."

## § 6 Output Variables & Decision Rules

The layer emits one categorical regime tag plus a 4-vector of lever shares plus a continuous beautiful-score.

| Output | Formula / source | Decision rule | Cite |
|---|---|---|---|
| `regime` | § 5.3 truth table | one of {UGLY_DEFLATIONARY, BEAUTIFUL, UGLY_INFLATIONARY, NOT_DELEVERAGING} | Dalio three-category taxonomy |
| `lever_mix` | $(s^{\text{aust}}, s^{\text{def}}, s^{\text{print}}, s^{\text{redist}})$ | report shares; tag under/over-print flags at 0.25 / 0.75 | Dalio qualitative balance; cutoffs DERIVED |
| `beautiful_score` | ($G_t$ in [0, +3pp]) AND ($\Delta D_t < 0$) AND ($\pi_t \in [0.5\%, 4\%]$) | binary 0/1 | condition set DERIVED from Dalio's "marginally above" |
| `fisher_spiral` | $\Delta(\text{DSR})_t > 0$ while $\text{CPI}_{yoy} < 0$ | binary 0/1; true = classical debt-deflation trap | Fisher (1933) NON-DALIO |

> **DERIVED (operational)** — `beautiful_score` $G_t \in [0, +3pp]$ operationalises Dalio's "marginally above"; +3pp ceiling rejects runaway reflations from mis-tagging BEAUTIFUL. $\pi_t \in [0.5\%, 4\%]$ re-uses § 5.3 bucket.

Downstream regime mappings:
- `UGLY_DEFLATIONARY` → long-duration nominals + cash (growth-down/inflation-down). Stress set: 1930–32 US, 1990–98 Japan.
- `BEAUTIFUL` → equities + nominal bonds re-rate; gold neutral. Stress set: 1933–37 US, 2009–14 US.
- `UGLY_INFLATIONARY` → gold + inflation-linked + real assets; nominal bonds near-zero. Stress set: Weimar 1922–23.

## § 7 Worked Numeric Example

Numbers below are type (a) per the template — Dalio-reported historical values from his "An In-Depth Look at Deleveragings" case tables, not live data. Periods match Dalio's table labels exactly.

**US Depression 1930–1932 (Ugly Deflationary).** Per Dalio's US table (verified PDF p. 4 + p. 8): NGDP_yoy = −17.0%; Gov't Bond Yield = 3.4%; M0 Growth %GDP = 0.4%; CB Asset Purchases = 0.4%; DebtGDP 155% → 252%. Dalio narrative: "debt to GDP rose at a rate of 32% per year."

1. $G = -17.0 - 3.4 = -20.4$pp — matches Dalio's table row.
2. $\Delta D = +32$pp/yr (Dalio's stated rate); total change = +97pp.
3. $\pi = 0.4\% + 0.4\% = 0.8\%$ — at small/moderate boundary (same as Japan 1990s; § 5.3 edges are stipulated, not strict).
4. Regime: $G<0 \wedge \Delta D>0$, $\pi$ at boundary ⇒ `UGLY_DEFLATIONARY` (Dalio's own classification, § 2).
5. Lever shares: defaults dominant (bank failures), austerity active (Hoover), printing low, redistribution ~0 ⇒ $s^{\text{print}} \approx 0.10 < 0.25$ ⇒ **under-printing flag** true.

**US Reflation 1933–1937 (Beautiful, post-gold-devaluation).** Per Dalio's US Reflation table: NGDP_yoy = +9.2%; Gov't Bond Yield = 2.9%; M0 Growth %GDP = 1.7%; CB Asset Purchases = 0.3%.

> **DERIVED (operational)** — Steps 1+3 reuse § 6 +3pp ceiling and § 5.3 π-bucket [0.5%, 4%]; both author-stipulated.

1. $G = 9.2 - 2.9 = +6.3$pp — positive but above the +3pp ceiling.
2. $\Delta D < 0$ — falling (Dalio: "falling 17% per year in 1933-1937").
3. $\pi = 1.7\% + 0.3\% = 2.0\% \in [0.5\%, 4\%]$ — moderate.
4. Categorical `regime` = BEAUTIFUL (Dalio's own); `beautiful_score` = 0 under +3pp. A widened +6pp captures 1933–37 but risks over-including runaway reflations.

**Japan 1990–Present (Ugly Deflationary, chronic).** Per Dalio's Japan table: NGDP_yoy = 0.6%; Gov't Bond Yield = 2.6%; M0 Growth %GDP = 0.7%; CB Asset Purchases = 0.1%; DebtGDP 403% → 498%. Dalio narrative: "nominal growth 2% below nominal interest rates."

> **DERIVED (operational)** — π=0.8% sits at § 5.3 small/moderate boundary; UGLY_DEFLATIONARY tag follows Dalio's own taxonomy (parallels US Depression).

1. $G = 0.6 - 2.6 = -2.0$pp — matches Dalio's row.
2. $\Delta D \approx +95$pp over 20 yr — rising.
3. $\pi = 0.7\% + 0.1\% = 0.8\%$ — at small/moderate cutoff.
4. Regime: `UGLY_DEFLATIONARY` — under-printed and prolonged.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// file: dalio_dashboard/deleveragings.js
// Activates only when machineOut.debtMoney==='HIGH' && gapRegime==='BELOW_TREND'.
const FRED = (id, key) =>
  `https://api.stlouisfed.org/fred/series/observations` +
  `?series_id=${id}&api_key=${key}&file_type=json`;

async function deleveragings({ apiKey, machineOut }) {
  if (machineOut.debtMoney !== 'HIGH' || machineOut.gapRegime !== 'BELOW_TREND')
    return { regime: 'NOT_DELEVERAGING' };

  const ids = ['GDP','DGS10','BOGMBASE','WALCL','CPIAUCSL','FYFSGDA188S','QBPLNTLNNTCGOFFR'];
  const [gdp, gs10, m0, walcl, cpi, fiscal, writeoff] =
    (await Promise.all(ids.map(i => fetch(FRED(i, apiKey)).then(r => r.json()))))
    .map(toNumeric);

  const nGDPyoy = pctChange(gdp, 4);
  const ltRate  = gs10.last();
  const piTotal = pctChangeOfGDP(m0, gdp, 4) + pctChangeOfGDP(walcl, gdp, 4);
  const cpiYoy  = pctChange(cpi, 12);
  const deltaD  = machineOut.debtGDP - machineOut.debtGDP_4Q_ago;
  const G       = nGDPyoy - ltRate;

  const regime =
      (G > 0 && cpiYoy > ltRate && fxGold() < -20)      ? 'UGLY_INFLATIONARY'
    : (G > 0 && deltaD < 0 && piTotal >= 0.5 && piTotal <= 4) ? 'BEAUTIFUL'
    : (G < 0 && deltaD > 0)                              ? 'UGLY_DEFLATIONARY'
    :                                                      'TRANSITIONAL';

  // § 5.2 lever shares
  const L = { austerity: -delta(fiscal,4),
              defaults:   writeoff.last() * machineOut.debtGDP,
              printing:   piTotal,
              redistribution: 0.1 * (-delta(giniNet(),1)) * machineOut.debtGDP };
  const sum = L.austerity + L.defaults + L.printing + L.redistribution;
  const shares = Object.fromEntries(Object.entries(L).map(([k,v])=>[k,v/sum]));

  return { regime, G, deltaD, piTotal, shares,
           underPrint: shares.printing < 0.25 && G < 0,
           overPrint:  shares.printing > 0.75 && cpiYoy > 0 };
}
```

### 8b. Excel — sheet layout, Power Query M or URL, key formulas

Sheet `4_Deleverage`. Columns: `date | NGDP_yoy | LT_Rate | G_gap | DebtGDP | dDebtGDP | pi_total | CPI_yoy | FX_Gold | regime`. One Power Query per FRED series. Key formulas:

```
G_gap     = NGDP_yoy − LT_Rate
pi_total  = dM0_pctGDP + dCB_pctGDP     (both 4Q deltas)
regime    = IFS(
             AND(G_gap>0, CPI_yoy>LT_Rate, FX_Gold<-20), "UGLY_INFLATIONARY",
             AND(G_gap>0, dDebtGDP<0, pi_total>=0.5, pi_total<=4), "BEAUTIFUL",
             AND(G_gap<0, dDebtGDP>0), "UGLY_DEFLATIONARY",
             TRUE, "TRANSITIONAL")
beautiful = IF(AND(G_gap>=0, G_gap<=3, dDebtGDP<0,
                   pi_total>=0.5, pi_total<=4), 1, 0)
```

BIS DSR via portal export URL (SDMX API unstable, 2026 — returns 400/500). Use the BIS Data Portal CSV export:

```
https://data.bis.org/topics/DSR/BIS,WS_DSR,1.0/Q.US.P  (download CSV/XLSX)
```

Power Query:
```m
let
    Src      = Csv.Document(
                   Web.Contents("https://data.bis.org/static/dataportal/datasets/WS_DSR.csv"),
                   [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Promoted = Table.PromoteHeaders(Src, [PromoteAllScalars=true]),
    Typed    = Table.TransformColumnTypes(Promoted,
                   {{"TIME_PERIOD", type text}, {"OBS_VALUE", type number}}),
    USpriv   = Table.SelectRows(Typed, each [BORROWERS_CTY]="US" and [TC_BORROWERS]="P")
in
    USpriv
```

### 8c. ECharts config — chart type, encoding, palette tokens

Chart: two-pane. Top = stacked bar of the four lever shares per year. Bottom = `G_gap` line with regime-coloured background bands.

```js
option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5' },
  legend: { textStyle: { color: '#A3A3A3' } },
  grid: [
    { top: 40, height: '45%', backgroundColor: '#141414',
      borderColor: '#262626', borderWidth: 1 },
    { top: '60%', height: '30%', backgroundColor: '#141414',
      borderColor: '#262626', borderWidth: 1 }
  ],
  xAxis: [
    { gridIndex: 0, type: 'category', data: years,
      axisLine: { lineStyle: { color: '#262626' } },
      axisLabel: { color: '#A3A3A3' } },
    { gridIndex: 1, type: 'category', data: years,
      axisLine: { lineStyle: { color: '#262626' } },
      axisLabel: { color: '#A3A3A3' } }
  ],
  yAxis: [
    { gridIndex: 0, name: 'lever share (%)',
      nameTextStyle: { color: '#A3A3A3' },
      axisLabel: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#1C1C1C' } } },
    { gridIndex: 1, name: 'G = NGDP_yoy − LT_Rate (pp)',
      nameTextStyle: { color: '#A3A3A3' },
      axisLabel: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#1C1C1C' } } }
  ],
  series: [
    { name: 'austerity', type: 'bar', stack: 'levers',
      xAxisIndex: 0, yAxisIndex: 0,
      itemStyle: { color: '#6B7280' }, data: sAust },
    { name: 'defaults', type: 'bar', stack: 'levers',
      xAxisIndex: 0, yAxisIndex: 0,
      itemStyle: { color: '#E5484D' }, data: sDef },
    { name: 'printing', type: 'bar', stack: 'levers',
      xAxisIndex: 0, yAxisIndex: 0,
      itemStyle: { color: '#00D08C' }, data: sPrint },
    { name: 'redistribution', type: 'bar', stack: 'levers',
      xAxisIndex: 0, yAxisIndex: 0,
      itemStyle: { color: '#D4A373' }, data: sRedist },
    { name: 'G_gap', type: 'line', xAxisIndex: 1, yAxisIndex: 1,
      data: gGap, showSymbol: false,
      lineStyle: { color: '#7FFFD4', width: 2 },
      markLine: { lineStyle: { color: '#E5484D' },
        data: [{ yAxis: 0 }] },
      markArea: { itemStyle: { color: '#080808' },
        data: [[{ yAxis: 0 }, { yAxis: 3 }]] } }
  ],
  tooltip: { trigger: 'axis', backgroundColor: '#1C1C1C',
    borderColor: '#262626', textStyle: { color: '#F5F5F5' } }
};
```

Regime chips: `#00D08C` BEAUTIFUL, `#E5484D` UGLY_*, `#D4A373` TRANSITIONAL. Text `#F5F5F5`/`#A3A3A3`/`#6B7280`; panels `#1C1C1C`; inset `#080808`.

## § 9 Integration Points

**Upstream preconditions:** 1.1 Economic Machine (activates this layer only when `debt_money_regime = HIGH` AND `gap_regime = BELOW_TREND`); 1.3 Long-Term Debt Cycle (late-stage warning trigger).

**Upstream data feeds:** FRED API (GDP, DGS10, BOGMBASE, WALCL, CPIAUCSL, FYFSGDA188S, QBPLNTLNNTCGOFFR, QUSCAM770A); BIS DSR portal `https://data.bis.org/topics/DSR/BIS,WS_DSR,1.0/Q.US.P` and total credit at https://data.bis.org/topics/TOTAL_CREDIT ; WID at https://wid.world/data/ (`gdiinc992j`); Stooq / LBMA gold.

**Downstream consumers:** 1.5 Paradigm Shifts (ingests `regime` + lever mix); 1.7 Inflation & Currency Debasement (sharpens inflationary classification); 2.2 All-Weather (regime re-weighting); 2.5 Stress-Testing (1930–32 US, 1933–37 US, 1990s Japan, Weimar 1922–23 as stress set).

**Not covered here:** cycle timing → 1.2 / 1.3; regime transitions → 1.5; reserve-currency loss → 1.6.

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **"Marginally above" is not numeric.** $G \in [0, +3\text{pp}]$ DERIVED (§6); US 1933–37 (+6.3pp) sits above. Widening to +6pp captures it but risks runaway reflations.
2. **π bucket edges 0.5% / 4% are DERIVED.** Dalio cites points (US 1933–37 ≈ 2.0%, US 2009+ ≈ 3.3%, Japan ≈ 0.8%) without publishing thresholds.
3. **Lever-mix balance target undefined.** Dalio says "well balanced" without target weights; 0.25/0.75 flags are DERIVED.
4. **Redistribution lever under-specified.** Dalio: transfers "rarely occur in amounts that contribute meaningfully." `k = 0.1` is a stand-in; sensitivity-test before production.
5. **FX_Gold < −20% p.a. edge** matches Dalio's Spain point only; no general numeric threshold.
6. **Regime boundary fuzziness.** US 2008–09 pre-QE was ugly-deflationary; post-QE became beautiful. `TRANSITIONAL` tag catches in-between quarters; not in Dalio's three-category taxonomy.
7. **Debt-service vs debt-stock ambiguity.** Dalio alternates. BIS DSR (§5.5) is the Fisher-complement; debt/GDP alone mis-times Japan (DSR fell via rate cuts as stock rose).

### Sources (all publicly accessible, no paywall, no login)

**Dalio primary:**
- "An In-Depth Look at Deleveragings," Bridgewater 2012 — PDF: https://www.nowandfutures.com/large/an-in-depth-look-at-deleveragings--ray-dalio-bridgewater.pdf
- "How the Economic Machine Works — A Template," Bridgewater 2015 draft: https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf
- Compiled "Economic Principles" volume (Ch I Template + Ch II In-Depth Look): https://operators.macro-ops.com/wp-content/uploads/2022/12/ray_dalio__how_the_economic_machine_works__leveragings_and_deleveragings.pdf
- Dalio hub: https://www.economicprinciples.org/

**Non-Dalio:**
- Fisher, Irving (1933), "The Debt-Deflation Theory of Great Depressions," *Econometrica* 1(4): 337–357. FRASER: https://fraser.stlouisfed.org/files/docs/meltzer/fisdeb33.pdf

**Data endpoints:**
- FRED API: https://fred.stlouisfed.org/docs/api/fred/ (series `GDP`, `DGS10`, `BOGMBASE`, `WALCL`, `CPIAUCSL`, `FYFSGDA188S`, `QBPLNTLNNTCGOFFR`, `QUSCAM770A`). `NCOTOT` discontinued; `QBPLNTLNNTCGOFFR` is the FDIC QBP successor. `GS10` is monthly; use `DGS10` for daily.
- BIS data portal: https://data.bis.org/topics/TOTAL_CREDIT/BIS,WS_TC,2.0/Q.US.C.A.M.770.A , https://data.bis.org/topics/DSR/BIS,WS_DSR,1.0/Q.US.P (CSV/XLSX export). SDMX API `stats.bis.org/api/v1/...` returns 400/500 in 2026 — portal is the stable path.
- WID: https://wid.world/data/ (variable `gdiinc992j` = Gini of disposable income). Stooq: https://stooq.com/q/?s=xauusd
