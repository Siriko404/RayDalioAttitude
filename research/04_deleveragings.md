# 1.4 Deleveragings

## § 1 Executive Summary

When a long-term debt cycle tops, policymakers pull Dalio's four levers to reduce debt/income ratios: 1) debt reduction, 2) austerity, 3) transferring wealth from the haves to the have-nots, 4) debt monetization. Dalio classifies the outcome into three regimes: *ugly deflationary* (levers 1–2 dominate, NGDP < rate, debt/income still rising), *beautiful* (balanced mix, NGDP above rate, debt/income falling), *ugly inflationary* (lever 4 dominates, currency collapses). This subsection operationalises classification and lever scoring — it does NOT detect the cycle (→ 1.2, 1.3) or forecast regime successors (→ 1.5).

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
| `NGDP_yoy` | Nominal GDP, year-on-year growth | % | FRED (BEA) | `https://api.stlouisfed.org/fred/series/observations?series_id=GDP` | Quarterly | -17% (1932) to +20% (1940s) |
| `DebtGDP` | Total non-financial debt / GDP | % | FRED (Fed Z.1 via BIS) | `.../series_id=QUSPAMUSQNSA` (BIS) or `TCMDO/GDP` construct | Quarterly | 100%–500% |
| `LT_Rate` | 10-yr sovereign bond yield (nominal interest rate proxy) | % p.a. | FRED | `.../series_id=GS10` | Daily | 0.5%–15% |
| `M0_GDP` | Monetary base / GDP (print intensity) | % of GDP | FRED | `.../series_id=BOGMBASE` ÷ `GDP` | Monthly | 3%–30% |
| `CB_Assets` | Central bank balance sheet / GDP | % of GDP | FRED (Fed) / ECB / BoJ | `.../series_id=WALCL` | Weekly | 5%–130% (BoJ) |
| `CPI_yoy` | Headline CPI, year-on-year | % | FRED (BLS) | `.../series_id=CPIAUCSL` | Monthly | -10% to +15% |
| `FX_Gold` | Trade-weighted FX vs gold price | % p.a. | Stooq / LBMA | `https://stooq.com/q/?s=xauusd&i=d` + DXY | Daily | -40% p.a. to +5% p.a. |
| `FiscalBal` | Federal fiscal balance / GDP (austerity proxy; negative = deficit) | % of GDP | FRED (OMB) | `.../series_id=FYFSGDA188S` | Annual | -15% to +5% |
| `LoanWriteoff` | Net charge-off rate, all commercial banks (default proxy) | % of loans | FRED (Fed) | `.../series_id=NCOTOT` | Quarterly | 0.2%–3.0% |
| `Gini_net` | Post-tax Gini (wealth transfer proxy) | Index | World Inequality Database | `https://wid.world/data/` (variable `agini992j`) | Annual | 0.25–0.65 |

All FRED endpoints require a free `api_key`. BIS total-credit series codes at https://data.bis.org/topics/TOTAL_CREDIT (series `Q:US:P:A:M:XDC:A`). For cross-country extension, substitute the ISO-indexed BIS code.

## § 5 Computation / Transformations

### 5.1 Regime classification inputs

Three ratios over a trailing 4-quarter window:

1. **Growth-to-rate gap** (beautiful-condition core): $G_t = \text{NGDP}_{yoy,t} - \text{LT\_Rate}_t$
2. **Debt-to-income trajectory**: $\Delta D_t = \text{DebtGDP}_t - \text{DebtGDP}_{t-4}$
3. **Print intensity**: $\pi_t = (M0\_GDP_t - M0\_GDP_{t-4}) + (CB\_Assets_t - CB\_Assets_{t-4})$ (change in print stock + CB asset purchases, both as % of GDP)

> **Dalio** — source: "An In-Depth Look at Deleveragings": "get the nominal growth rate marginally above the nominal interest rate to tolerably spread out the deleveraging process." This anchors $G_t$'s sign as the beautiful gate.

### 5.2 Four-lever decomposition (Dalio's 4 paths)

Mapped to observables; per-quarter contribution in pp of GDP:

$$L^{\text{aust}}_t = -\Delta\text{FiscalBal}_t; \quad L^{\text{def}}_t = \text{Writeoff}_t \cdot \text{DebtGDP}_t$$
$$L^{\text{print}}_t = \pi_t; \quad L^{\text{redist}}_t = -k \cdot \Delta\text{Gini}_t \cdot \text{DebtGDP}_t$$

> **Dalio** — source: ibid.: "Debt reduction (i.e., defaults and restructurings) and austerity are both deflationary and depressing while debt monetization is inflationary and stimulative."

> **DERIVED (operational)** — Dalio names the four levers qualitatively, without coefficients. The mapping above (fiscal tightening as −ΔBalance; writeoffs × debt stock; print-sum; Gini × debt stock × k=0.1) is operational. Dalio notes wealth transfers "rarely occur in amounts that contribute meaningfully," so `k` is small.

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

Use BIS DSR directly (https://data.bis.org/topics/DSR ; SDMX CSV `https://stats.bis.org/api/v1/data/WS_DSR/Q.US?format=csv`) — debt-service-to-income by country.

> **NON-DALIO (industry standard)** — source: Fisher, Irving (1933), "The Debt-Deflation Theory of Great Depressions," *Econometrica* 1(4), FRASER free PDF: https://fraser.stlouisfed.org/files/docs/meltzer/fisdeb33.pdf . Closes the gap because Dalio emphasises debt service qualitatively; Fisher supplies the nine-link mechanism (liquidation → falling prices → rising real debt → further liquidation) operationalising the "debt spiral."

## § 6 Output Variables & Decision Rules

The layer emits one categorical regime tag plus a 4-vector of lever shares plus a continuous beautiful-score.

| Output | Formula / source | Decision rule | Cite |
|---|---|---|---|
| `regime` | § 5.3 truth table | one of {UGLY_DEFLATIONARY, BEAUTIFUL, UGLY_INFLATIONARY, NOT_DELEVERAGING} | Dalio three-category taxonomy |
| `lever_mix` | $(s^{\text{aust}}, s^{\text{def}}, s^{\text{print}}, s^{\text{redist}})$ | report shares; tag under/over-print flags at 0.25 / 0.75 | Dalio qualitative balance; cutoffs DERIVED |
| `beautiful_score` | ($G_t$ in [0, +3pp]) AND ($\Delta D_t < 0$) AND ($\pi_t \in [0.5\%, 4\%]$) | binary 0/1 | condition set DERIVED from Dalio's "marginally above" |
| `fisher_spiral` | $\Delta(\text{DSR})_t > 0$ while $\text{CPI}_{yoy} < 0$ | binary 0/1; true = classical debt-deflation trap | Fisher (1933) NON-DALIO |

> **DERIVED (operational)** — `beautiful_score`'s $G_t \in [0, +3pp]$ operationalises Dalio's "marginally above." Lower edge = Dalio's strict inequality; +3pp upper edge rejects inflationary spikes (e.g. Weimar late stage) from mis-tagging as BEAUTIFUL. $\pi_t \in [0.5\%, 4\%]$ re-uses the § 5.3 bucket.

Downstream regime mappings:
- `UGLY_DEFLATIONARY` → long-duration nominals + cash (growth-down/inflation-down). Stress set: 1930–32 US, 1990–98 Japan.
- `BEAUTIFUL` → equities + nominal bonds re-rate; gold neutral. Stress set: 1933–37 US, 2009–14 US.
- `UGLY_INFLATIONARY` → gold + inflation-linked + real assets; nominal bonds near-zero. Stress set: Weimar 1922–23.

## § 7 Worked Numeric Example

Numbers below are type (a) per the template — Dalio-reported historical values from his "An In-Depth Look at Deleveragings" case tables, not live data. Periods match Dalio's table labels exactly.

**US Depression 1930–1932 (Ugly Deflationary).** Per Dalio's US table: NGDP_yoy = −17.0%; Gov't Bond Yield = 3.4%; M0 Growth %GDP = 0.4%; CB Asset Purchases = 0.0%; DebtGDP 155% → 252%. Dalio narrative: "debt to GDP rose at a rate of 32% per year."

1. $G = -17.0 - 3.4 = -20.4$pp — matches Dalio's table row.
2. $\Delta D = +32$pp/yr (Dalio's stated rate); total change = +97pp.
3. $\pi = 0.4\% + 0.0\% = 0.4\% < 0.5\%$ — small.
4. Regime: $G<0 \wedge \Delta D>0 \wedge \pi$ small ⇒ `UGLY_DEFLATIONARY`.
5. Lever shares: defaults dominant (bank failures), austerity active (Hoover), printing ~0, redistribution ~0 ⇒ $s^{\text{print}} \approx 0.05 < 0.25$ ⇒ **under-printing flag** true.

**US Reflation 1933–1937 (Beautiful, post-gold-devaluation).** Per Dalio's US Reflation table: NGDP_yoy = +9.2%; Gov't Bond Yield = 2.9%; M0 Growth %GDP = 1.7%; CB Asset Purchases = 0.3%.

1. $G = 9.2 - 2.9 = +6.3$pp — positive but above the DERIVED +3pp ceiling.
2. $\Delta D < 0$ — falling (Dalio: "falling 17% per year in 1933-1937").
3. $\pi = 1.7\% + 0.3\% = 2.0\% \in [0.5\%, 4\%]$ — moderate.
4. Categorical `regime` = BEAUTIFUL (Dalio's own characterisation); `beautiful_score` = 0 under the strict +3pp ceiling.

> **DERIVED (operational)** — 1933–37 illustrates the +3pp ceiling trade-off: tight enough to reject Weimar-style runaways but also excludes vigorous reflations. A widened +6pp ceiling captures 1933–37; +3pp is the conservative baseline.

**Japan 1990–Present (Ugly Deflationary, chronic).** Per Dalio's Japan table: NGDP_yoy = 0.6%; Gov't Bond Yield = 2.6%; M0 Growth %GDP = 0.7%; CB Asset Purchases = 0.1%; DebtGDP 403% → 498%. Dalio narrative: "nominal growth 2% below nominal interest rates."

1. $G = 0.6 - 2.6 = -2.0$pp — matches Dalio's table row exactly.
2. $\Delta D \approx +95$pp over 20 yr — rising.
3. $\pi = 0.7\% + 0.1\% = 0.8\%$ — just above the 0.5% "small" cutoff.
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

  const ids = ['GDP','GS10','BOGMBASE','WALCL','CPIAUCSL','FYFSGDA188S','NCOTOT'];
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

### 8b. Excel — sheet layout, Power Query M, key formulas

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

BIS DSR Power Query. Uses BIS SDMX REST v1 with `format=csv` (no ZIP decompression needed); `Table.PromoteHeaders` runs before `Table.SelectRows` so `BORROWERS_CTY` resolves:

```m
let
    Src       = Csv.Document(
                    Web.Contents("https://stats.bis.org/api/v1/data/WS_DSR/Q.US?format=csv"),
                    [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Promoted  = Table.PromoteHeaders(Src, [PromoteAllScalars=true]),
    Typed     = Table.TransformColumnTypes(Promoted,
                    {{"TIME_PERIOD", type text}, {"OBS_VALUE", type number}}),
    USonly    = Table.SelectRows(Typed, each [BORROWERS_CTY] = "US")
in
    USonly
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

**Upstream data feeds:** FRED API (GDP, GS10, BOGMBASE, WALCL, CPIAUCSL, FYFSGDA188S, NCOTOT); BIS DSR via SDMX CSV `https://stats.bis.org/api/v1/data/WS_DSR/Q.US?format=csv` and total credit at https://data.bis.org/topics/TOTAL_CREDIT ; WID at https://wid.world/data/; Stooq / LBMA gold.

**Downstream consumers:** 1.5 Paradigm Shifts (ingests `regime` + lever mix); 1.7 Inflation & Currency Debasement (sharpens inflationary classification); 2.2 All-Weather (regime re-weighting); 2.5 Stress-Testing (1930–32 US, 1933–37 US, 1990s Japan, Weimar 1922–23 as stress set).

**Not covered here:** cycle timing → 1.2 / 1.3; regime transitions → 1.5; reserve-currency loss → 1.6.

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **"Marginally above" is not numeric.** Dalio bounds no band. $G \in [0, +3\text{pp}]$ is DERIVED (§6). US 1933–37 (+6.3pp) sat above this edge; a widened +6pp captures it but risks over-including runaway reflations. Flagged per R5.
2. **Print-intensity bucket edges (0.5% / 4%) are DERIVED.** Dalio cites point values (US 1933–37 ≈ 2.0%, US 2009+ ≈ 3.3%, Japan ≈ 0.8%) without publishing thresholds.
3. **Lever-mix balance target is undefined.** Dalio says beautiful deleveragings are "well balanced" but assigns no target weights; 0.25/0.75 flags are DERIVED.
4. **Wealth-redistribution lever is under-specified.** Dalio notes transfers "rarely occur in amounts that contribute meaningfully." `k = 0.1` is a stand-in; sensitivity test before production use.
5. **Currency devaluation edge.** FX_Gold < −20% p.a. matches Dalio's Spain data point; he does not define "too much" devaluation numerically.
6. **Regime boundary fuzziness.** US 2008–09 pre-QE was ugly-deflationary; post-QE became beautiful. The `TRANSITIONAL` tag catches in-between quarters and is NOT in Dalio's three-category taxonomy.
7. **Debt-service vs debt-stock ambiguity.** Dalio alternates between the two. BIS DSR (§5.5) is the Fisher-complement; debt/GDP alone mis-times Japan (DSR fell via rate cuts as stock rose).

### Sources (all publicly accessible, no paywall, no login)

**Dalio primary:**
- "An In-Depth Look at Deleveragings," Bridgewater, February 2012 — standalone PDF: https://www.nowandfutures.com/large/an-in-depth-look-at-deleveragings--ray-dalio-bridgewater.pdf
- "How the Economic Machine Works — A Template for Understanding What is Happening Now," Bridgewater 2015 draft: https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf
- Compiled "Economic Principles" volume (Ch I Template + Ch II In-Depth Look + US-1930s/Weimar case timelines): https://operators.macro-ops.com/wp-content/uploads/2022/12/ray_dalio__how_the_economic_machine_works__leveragings_and_deleveragings.pdf (archive.org OCR mirror: https://archive.org/stream/RayDalioHowTheEconomicMachineWorksLeveragingsAndDeleveragings/Ray+Dalio+-+How+the+Economic+Machine+Works+-+Leveragings+and+Deleveragings_djvu.txt)
- Dalio hub: https://www.economicprinciples.org/

**Non-Dalio:**
- Fisher, Irving (1933), "The Debt-Deflation Theory of Great Depressions," *Econometrica* 1(4): 337–357. FRASER: https://fraser.stlouisfed.org/files/docs/meltzer/fisdeb33.pdf

**Data endpoints:**
- FRED API: https://fred.stlouisfed.org/docs/api/fred/ (series `GDP`, `GS10`, `BOGMBASE`, `WALCL`, `CPIAUCSL`, `FYFSGDA188S`, `NCOTOT`).
- BIS data portal: https://data.bis.org/topics/TOTAL_CREDIT , https://data.bis.org/topics/DSR ; BIS SDMX REST v1 (returns CSV when `?format=csv` appended): https://stats.bis.org/api/v1/data/WS_DSR/Q.US?format=csv
- WID: https://wid.world/data/  |  Stooq: https://stooq.com/q/?s=xauusd
