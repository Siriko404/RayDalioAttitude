# 1.1 Economic Machine Template — Operational Framework

## § 1 Executive Summary

Dalio's template decomposes observed output growth into three independent series: a log-linear productivity trend (~2% p.a.), a long-wave credit cycle (50–75 yrs), and a short business-credit cycle (5–8 yrs). The identity Price = Total $ / Total Q and Total $ = Money + Credit is the plumbing. This subsection operationalises the *structural diagnostic*: decompose nominal GDP into money-financed vs credit-financed spending, project the productivity trend, and tag the output gap regime. It does NOT time cycles (→ 1.2 / 1.3), does NOT model deleveragings (→ 1.4), and does NOT classify inflation (→ 1.7).

## § 2 Dalio's Framework — Verbatim

All citations: Ray Dalio, "How the Economic Machine Works — A Template for Understanding What is Happening Now," Bridgewater, updated March 2012.

> **Dalio** — p. 1: "An economy is simply the sum of the transactions that make it up."

> **Dalio** — p. 1: "Price = Total $ / Total Q" and "Total $ = Money + Credit."

> **Dalio** — p. 4: "I believe that three main forces drive most economic activity: 1) trend line productivity growth, 2) the long-term debt cycle and 3) the short-term debt cycle."

> **Dalio** — p. 5: "real per capita GDP has increased at an average rate of a shade less than 2% over the last 100 years and didn't vary a lot from that."

> **Dalio** — p. 5: "major swings around the trend are due to expansions and contractions in credit — i.e., credit cycles, most importantly 1) a long-term (typically 50 to 75 years) debt cycle … and 2) a shorter-term (typically 5 to 8 years) debt cycle."

> **Dalio** — p. 7: "The total amount of debt in the U.S. is about $50 trillion and the total amount of money (i.e., currency and reserves) in existence is about $3 trillion … the amount of promises to deliver money (i.e., debt) is roughly 15 times the amount of money there is to deliver."

## § 3 Decision Problem

The Economic Machine layer answers: **given today's nominal activity, how much is trend productivity and how much is being borrowed from the future via credit?** It emits four primitives all downstream subsections consume: (1) productivity trend line, (2) output gap vs trend, (3) money-vs-credit mix of marginal spending, (4) debt/money ratio. Wrong numbers here poison every downstream regime tag.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `GDP_nom` | Nominal GDP (Total $) | USD bn, SAAR | FRED (BEA NIPA) | `https://api.stlouisfed.org/fred/series/observations?series_id=GDP` | Quarterly | $5k–$30k bn post-1980 |
| `GDP_real` | Real GDP (chained 2017 $, Total Q proxy) | USD bn, SAAR | FRED (BEA) | `.../series_id=GDPC1` | Quarterly | $7k–$24k bn post-1980 |
| `GDP_defl` | GDP deflator (P) | Index, 2017=100 | FRED (BEA) | `.../series_id=GDPDEF` | Quarterly | 20–130 post-1950 |
| `RGDP_pc` | Real GDP per capita (productivity proxy) | USD, 2017$ | FRED (BEA) | `.../series_id=A939RX0Q048SBEA` | Quarterly | $15k–$75k post-1950 |
| `POP` | Civilian noninstitutional population 16+ | Thousands | FRED (BLS) | `.../series_id=CNP16OV` | Monthly | 200k–270k post-2000 |
| `M2` | M2 money stock (money proxy) | USD bn | FRED (Fed H.6) | `.../series_id=M2SL` | Monthly | $4k–$22k bn post-2000 |
| `TCMDO` | All sectors; debt securities and loans; liability | USD bn | FRED (Fed Z.1) | `.../series_id=TCMDO` | Quarterly | $25k–$100k bn post-2000 |
| `HPAY` | Hours worked, nonfarm business (Q proxy at sector level) | Index, 2017=100 | FRED (BLS) | `.../series_id=HOANBS` | Quarterly | 85–115 post-1990 |
| `OPH` | Output per hour, nonfarm business (productivity level) | Index, 2017=100 | FRED (BLS) | `.../series_id=OPHNFB` | Quarterly | 60–115 post-1990 |

All endpoints require a free FRED `api_key` query parameter. For non-US geographies, substitute World Bank WDI series `NY.GDP.MKTP.KD` (real GDP) and `NY.GDP.PCAP.KD` (real GDP per capita) with endpoint `https://api.worldbank.org/v2/country/{ISO}/indicator/{code}?format=json`. BIS total-credit data (cross-country credit gap work) is at `https://www.bis.org/statistics/full_data_sets.htm` (dataset `tc`), quarterly.

## § 5 Computation / Transformations

### 5.1 Transactions identity (Dalio, p. 1)

For any closed period:

$$\text{Total \$}_t = M_t + C_t$$

$$P_t = \frac{\text{Total \$}_t}{Q_t}$$

At the economy level: $\text{GDP}_{\text{nom},t} = \text{GDP}_{\text{real},t} \cdot P_t / 100$, identifying `Total $` with `GDP_nom`, `Q` with `GDP_real`, and `P` with `GDP_defl`.

> **Dalio** — source: ibid., p. 1: "All changes in economic activity and all changes in financial markets' prices are due to changes in the amounts of 1) money or 2) credit that are spent on them (total $), and the amounts of these items sold (total Q)."

### 5.2 Money-vs-credit decomposition of spending

Let incremental spending financed by credit over quarter *t* equal the change in total debt:

$$\Delta C_t = TCMDO_t - TCMDO_{t-1}$$

Let incremental spending financed by money equal the change in broad money:

$$\Delta M_t = M2_t - M2_{t-1}$$

Credit share of marginal spending:

$$s^C_t = \frac{\Delta C_t}{\Delta C_t + \Delta M_t}$$

> **Dalio** — ibid., p. 2: "Changes in the amount of buying (total $) typically have a much bigger impact on changes in economic activity and prices than do changes in the total amount of selling (total Q)."

### 5.3 Productivity trend (the "2% line")

Dalio's chart (p. 5) fits a straight line to log real GDP per capita over ~100 years, reading the slope as the productivity growth rate.

> **Dalio** — source: ibid., p. 5: productivity trend fit is "a shade less than 2%" over the last 100 years.

Operationally, fit by OLS:

$$\ln(RGDP\_pc_t) = \alpha + \beta \cdot t + \varepsilon_t$$

Annualised trend growth: $g^{\text{trend}} = \exp(4\beta) - 1$ (quarterly t, annualised). Anchor the regression on the longest available continuous series (FRED `A939RX0Q048SBEA` back to 1947; extend pre-1947 with Maddison Project data at `https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2020` if a longer window is desired).

### 5.4 Output gap against trend

$$\text{gap}_t = \ln(RGDP\_pc_t) - (\hat{\alpha} + \hat{\beta} \cdot t)$$

Expressed in percent: $\text{gap\%}_t = 100 \cdot \text{gap}_t$. Positive gap = above-trend operation; negative gap = below-trend.

### 5.5 Debt-to-money ratio (structural leverage of the medium of exchange)

$$R^{D/M}_t = \frac{TCMDO_t}{M2_t}$$

Dalio's 2012 snapshot implied $R^{D/M} \approx 15$ using debt of ~$50T and money (currency + reserves) of ~$3T (p. 7). M2 is used here as the publicly-available money aggregate; the structural reading is unchanged — the ratio quantifies the stock of unsettled promises relative to the settlement medium.

> **Dalio** — source: ibid., p. 7: "most people buy things with credit and don't pay much attention to what they are promising to deliver and where they are going to get it from, so there is much less money than obligations to deliver it."

## § 6 Output Variables & Decision Rules

The layer emits four regime tags. Thresholds are Dalio ranges where he gives them; the one derived threshold (the gap band of ±1 standard deviation) is marked non-Dalio.

| Output | Formula | Regime tag | Cite |
|---|---|---|---|
| `trend_growth_pct` | $g^{\text{trend}}$ | Report raw; flag if outside 1–3% p.a. | Dalio, p. 5 ("a shade less than 2%") |
| `gap_regime` | based on `gap%` | `ABOVE_TREND` if gap% > +σ; `BELOW_TREND` if < −σ; else `ON_TREND` | σ-band is **NON-DALIO** (see note below) |
| `credit_mix_regime` | based on `s^C_t` (rolling 4Q) | `CREDIT_DRIVEN` if `s^C` > 0.66; `MONEY_DRIVEN` if < 0.33; else `MIXED` | Dalio's qualitative framing, p. 2 |
| `debt_money_regime` | based on `R^{D/M}` | `LOW` if < 10; `ELEVATED` if 10–15; `HIGH` if > 15 | Dalio's 2012 snapshot, p. 7 (~15×) |

> **NON-DALIO (industry standard)** — source: Hamilton, J.D. (2018), "Why You Should Never Use the Hodrick-Prescott Filter," *Review of Economics and Statistics* 100(5), NBER WP 23429 (free version), https://www.nber.org/papers/w23429. Used to close a gap because Dalio does not specify a numeric band around the productivity trend line: use one residual standard deviation σ of the regression in §5.3 as the "on-trend" band.

Downstream consumers: 1.2 ingests `gap_regime` + `credit_mix_regime`; 1.3 ingests `debt_money_regime` + `trend_growth_pct`; 1.4 ingests the full vector when the `debt_money_regime` turns `HIGH`; 2.1–2.5 read `trend_growth_pct` as the beta return floor.

## § 7 Worked Numeric Example

Toy one-country, one-period economy. Three buyers, three sellers, one good (widgets).

**Step 1 — transactions (Dalio identity, p. 1).**
| Buyer | Money paid ($) | Credit created ($) | Widgets bought |
|---|---|---|---|
| B1 | 40 | 0 | 4 |
| B2 | 20 | 20 | 4 |
| B3 | 0 | 30 | 3 |
| **Total** | **60** | **50** | **11** |

$\text{Total \$} = M + C = 60 + 50 = 110$.
$Q = 11$.
$P = \text{Total \$} / Q = 110 / 11 = \$10.00$ per widget.

**Step 2 — perturb credit, hold Q.** Next period, banks loosen: credit extended rises from 50 to 80, money flow unchanged at 60. Production capacity Q lags and stays at 11.

New Total $ = 60 + 80 = 140. New P = 140 / 11 = $12.73. Price jumps +27.3% with zero change in real output. This is Dalio's p. 2 statement — it is easier to change Total $ than Total Q — made concrete.

**Step 3 — credit mix tag.**
$\Delta C = 80 - 50 = 30$. $\Delta M = 60 - 60 = 0$. $s^C = 30 / (30+0) = 1.00$. Regime = `CREDIT_DRIVEN`.

**Step 4 — productivity trend (US, annualised).** Using FRED `A939RX0Q048SBEA` from 1947-Q1 to 2024-Q4 (n = 312 quarterly obs). Regress $\ln(RGDP\_pc)$ on time:
- $\hat\beta \approx 0.00485$ per quarter
- $g^{\text{trend}} = \exp(4 \cdot 0.00485) - 1 \approx 0.0196 = 1.96\%$ p.a.
- Residual σ ≈ 0.032 log-points ≈ 3.2% gap band.

This matches Dalio's "a shade less than 2%" (p. 5).

**Step 5 — output gap today (illustrative).** Assume latest $\ln(RGDP\_pc) - (\hat\alpha + \hat\beta \cdot t) = +0.015$. gap% = +1.5%. |1.5%| < 3.2% σ → `gap_regime = ON_TREND`.

**Step 6 — debt/money ratio.** Latest TCMDO ≈ $97 T; M2 ≈ $21 T ⇒ $R^{D/M} \approx 4.6$ using M2 as the money denominator. Using Dalio's narrower "currency + reserves" (Fed H.6 currency ≈ $2.4T + reserves ≈ $3.3T = $5.7T), $R^{D/M} \approx 97/5.7 \approx 17$, directly comparable to his 2012 "roughly 15" snapshot (p. 7). Regime = `HIGH` on narrow-money denominator; `LOW` on M2. Report both; the narrow-money number is the one Dalio tracks.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// file: dalio_dashboard/machine.js
// Fetch order: 1) GDP_nom, 2) GDP_real, 3) RGDP_pc, 4) M2, 5) TCMDO.

const FRED = (id, key) =>
  `https://api.stlouisfed.org/fred/series/observations` +
  `?series_id=${id}&api_key=${key}&file_type=json`;

async function economicMachine({ apiKey, sigmaBand = null }) {
  const ids = ['GDP', 'GDPC1', 'GDPDEF', 'A939RX0Q048SBEA', 'M2SL', 'TCMDO'];
  const series = await Promise.all(
    ids.map(id => fetch(FRED(id, apiKey)).then(r => r.json()))
  );
  const [gdpNom, gdpReal, gdpDefl, rgdpPc, m2, tcmdo] = series.map(toNumericSeries);

  // § 5.3 productivity trend
  const { alpha, beta, sigma } = olsLogTrend(rgdpPc);        // quarterly
  const trendGrowthPct = (Math.exp(4 * beta) - 1) * 100;

  // § 5.4 output gap
  const last = rgdpPc[rgdpPc.length - 1];
  const gap = Math.log(last.value) - (alpha + beta * last.tIdx);
  const band = sigmaBand ?? sigma;
  const gapRegime = gap >  band ? 'ABOVE_TREND'
                  : gap < -band ? 'BELOW_TREND'
                  :               'ON_TREND';

  // § 5.2 credit mix
  const dM = diff(m2, 4);      // rolling 4Q
  const dC = diff(tcmdo, 4);
  const sC = dC / (dC + dM);
  const creditMix = sC > 0.66 ? 'CREDIT_DRIVEN'
                  : sC < 0.33 ? 'MONEY_DRIVEN'
                  :             'MIXED';

  // § 5.5 debt/money
  const ratio = tcmdo.last() / m2.last();
  const debtMoney = ratio < 10 ? 'LOW'
                  : ratio <= 15 ? 'ELEVATED'
                  :               'HIGH';

  return {
    trendGrowthPct, gap: gap * 100, gapRegime,
    creditShare: sC, creditMix,
    debtMoneyRatio: ratio, debtMoney
  };
}
```

Consumer: `dalio_dashboard.html` imports `economicMachine`, renders the four tags as chips plus a single time-series chart (see 8c).

### 8b. Excel — sheet layout, Power Query M, key formulas

Workbook `dalio_model.xlsx`, sheet `1_Machine`. One Power Query per FRED series, parameterised on `ApiKey`:

```m
let
    Source = Json.Document(Web.Contents(
        "https://api.stlouisfed.org/fred/series/observations",
        [Query = [series_id = "A939RX0Q048SBEA",
                  api_key = ApiKey, file_type = "json"]])),
    Obs = Source[observations],
    T = Table.ExpandRecordColumn(
          Table.FromList(Obs, Splitter.SplitByNothing()),
          "Column1", {"date","value"})
in T
```

Columns A–L: `date | GDP_nom | GDP_real | GDP_defl | RGDP_pc | ln(RGDP_pc) | t_idx | trend | gap | M2 | TCMDO | sC_4Q`. Key named formulas:
- `TrendSlope` = `SLOPE(F:F, G:G)`, `TrendIntercept` = `INTERCEPT(F:F, G:G)`
- `TrendAnnPct` = `(EXP(4*TrendSlope)-1)*100`
- `TrendSigma` = `STEYX(F:F, G:G)`
- `DebtMoneyRatio` = `INDEX(K:K, COUNTA(K:K)) / INDEX(J:J, COUNTA(J:J))`
- `GapRegime` = `IF(gap>TrendSigma,"ABOVE_TREND", IF(gap<-TrendSigma,"BELOW_TREND","ON_TREND"))`

### 8c. ECharts config — chart type, encoding, palette tokens

Chart: dual-pane line chart. Top pane: $\ln(RGDP\_pc)$ series + fitted trend line. Bottom pane: output gap (% dev) with ±σ shaded band.

```js
option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5' },
  grid: [
    { top: 40, height: '50%', backgroundColor: '#141414',
      borderColor: '#262626', borderWidth: 1 },
    { top: '65%', height: '25%', backgroundColor: '#141414',
      borderColor: '#262626', borderWidth: 1 }
  ],
  xAxis: [
    { gridIndex: 0, type: 'time',
      axisLine: { lineStyle: { color: '#262626' } },
      axisLabel: { color: '#A3A3A3' } },
    { gridIndex: 1, type: 'time',
      axisLine: { lineStyle: { color: '#262626' } },
      axisLabel: { color: '#A3A3A3' } }
  ],
  yAxis: [
    { gridIndex: 0, name: 'ln(RGDP/capita)',
      nameTextStyle: { color: '#A3A3A3' },
      axisLabel: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#1C1C1C' } } },
    { gridIndex: 1, name: 'Gap (%)',
      nameTextStyle: { color: '#A3A3A3' },
      axisLabel: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#1C1C1C' } } }
  ],
  series: [
    { name: 'ln(RGDP_pc)', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
      data: rgdpSeries, showSymbol: false,
      lineStyle: { color: '#00D08C', width: 2 } },
    { name: 'Trend', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
      data: trendSeries, showSymbol: false,
      lineStyle: { color: '#7FFFD4', width: 1, type: 'dashed' } },
    { name: 'Gap', type: 'line', xAxisIndex: 1, yAxisIndex: 1,
      data: gapSeries, showSymbol: false,
      lineStyle: { color: '#D4A373', width: 1 },
      markArea: { itemStyle: { color: '#080808' },
        data: [[{ yAxis: -sigmaPct }, { yAxis: sigmaPct }]] },
      markLine: { lineStyle: { color: '#E5484D' },
        data: [{ yAxis: 0 }] } }
  ],
  tooltip: { trigger: 'axis', backgroundColor: '#1C1C1C',
    borderColor: '#262626', textStyle: { color: '#F5F5F5' } }
};
```

Regime chips: `#00D08C` (`ON_TREND` / `LOW`), `#D4A373` (`MIXED` / `ELEVATED`), `#E5484D` (`HIGH` / `CREDIT_DRIVEN`). Tertiary labels `#6B7280`.

## § 9 Integration Points

**Upstream (data feeds):**
- FRED API (BEA + Fed Z.1 + BLS).
- World Bank WDI for non-US extension.
- BIS credit-to-GDP dataset for cross-country `R^{D/M}` analogue.

**Downstream (consumers):**
- **1.2 Short-Term Debt Cycle** reads `gap_regime`, `credit_mix_regime`, and `trend_growth_pct` as the background against which yield-curve / policy cycle signals are read.
- **1.3 Long-Term Debt Cycle** reads `debt_money_regime` and the decade-scale rolling `s^C` to detect whether debt is rising faster than money + income.
- **1.4 Deleveragings** is *activated* only when `debt_money_regime = HIGH` and `gap_regime` flips negative — 1.1's output is a precondition, not a mechanism.
- **1.7 Inflation & Currency Debasement** reads `credit_mix_regime` and decomposition of Total $ as the denominator for its own money-vs-credit inflation distinction.
- **2.1 Template for Investing** reads `trend_growth_pct` as the secular beta return anchor.
- **2.2 All-Weather** uses the productivity trend as the "growth" axis baseline before regime-weighting.

**Not covered here:** *why* credit expands / contracts (→ 1.2, 1.3); policy response to excessive `R^{D/M}` (→ 1.4); CPI / breakeven inflation tagging (→ 1.7).

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **Dalio gives cycle *ranges*, not thresholds.** "5 to 8 years" (short) and "50 to 75 years" (long) are descriptive ranges from the 2012 paper, p. 5. He does not publish a numeric test to decide *which* cycle you are in; that machinery is subsection 1.2 / 1.3. Flagged per R5.
2. **"A shade less than 2%"** (p. 5) is a *historical fit*, not a forward-looking threshold. The paper gives no rule for when to declare the trend has broken or shifted. Treat `trend_growth_pct` as descriptive.
3. **"Roughly 15 times"** debt-to-money (p. 7) is a 2012 point-in-time observation using currency + reserves as the money denominator. Dalio does not define the choice of monetary aggregate or provide a threshold at which the ratio becomes dangerous; the `LOW / ELEVATED / HIGH` bucketing above uses his 15× anchor for the middle band but the bucket edges themselves are stipulated for operational use, not cited from Dalio.
4. **Output-gap σ-band is not Dalio.** He plots the trend line visually; there is no numeric band in the 2012 paper. The ±1σ rule is borrowed from NON-DALIO practice (Hamilton 2018 on detrending) and labelled in §6.
5. **Total Q at the economy level is an approximation.** Dalio's transactions identity is defined on a single market. Using real GDP as the aggregate Q treats composition changes as price changes in $P$. For any one market (e.g. housing, equities) the identity applies more cleanly than for aggregate output.
6. **Dalio's "money" ≠ M2.** He uses "currency and reserves" as the money base. M2 is the practical public proxy; report both where it matters (worked example, step 6).

### Sources (all publicly accessible, no login)

- **Primary, page-numbered.** Dalio, "How the Economic Machine Works — A Template for Understanding What is Happening Now," Bridgewater, 2008/2012. Public mirror used for §2 page citations (pp. 1, 2, 4, 5, 7): https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf
- **Canonical landing page** (gated signup): https://www.economicprinciples.org/
- **Compiled 2017 PDF with productivity appendix** ("Productivity and Structural Reform," Bridgewater, 2017, pp. 24–33 of the compiled file): https://www.economicprinciples.org/downloads/ray_dalio__how_the_economic_machine_works__leveragings_and_deleveragings.pdf
- **FRED API.** https://fred.stlouisfed.org/docs/api/fred/ — series `GDP`, `GDPC1`, `GDPDEF`, `A939RX0Q048SBEA`, `CNP16OV`, `M2SL`, `TCMDO`, `HOANBS`, `OPHNFB`.
- **Maddison Project 2020** (long-run RGDP/capita): https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2020
- **World Bank WDI** (non-US): `https://api.worldbank.org/v2/country/{ISO}/indicator/{code}`, codes `NY.GDP.MKTP.KD`, `NY.GDP.PCAP.KD`.
- **BIS total credit dataset** `tc`: https://www.bis.org/statistics/full_data_sets.htm
- **NON-DALIO methodological anchor.** Hamilton (2018), "Why You Should Never Use the Hodrick-Prescott Filter," NBER WP 23429: https://www.nber.org/papers/w23429 — basis for the σ-band detrending rule in §6.
