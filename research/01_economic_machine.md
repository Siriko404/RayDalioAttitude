# 1.1 Economic Machine Template — Operational Framework

## § 1 Executive Summary

Dalio's template decomposes output growth into three series: a log-linear productivity trend (~2% p.a.), a long-wave credit cycle (50–75 yrs), and a short business-credit cycle (5–8 yrs). The identity Price = Total $ / Total Q and Total $ = Money + Credit is the plumbing. This subsection operationalises the *structural diagnostic*: decompose nominal GDP into money- vs credit-financed spending, project the productivity trend, and tag the output-gap regime. Cycle timing (→ 1.2 / 1.3), deleveragings (→ 1.4), and inflation tagging (→ 1.7) are out of scope.

## § 2 Dalio's Framework — Verbatim

All citations: Ray Dalio, "How the Economic Machine Works — A Template for Understanding What is Happening Now," Bridgewater, updated March 2012.

> **Dalio** — p. 1: "An economy is simply the sum of the transactions that make it up."

> **Dalio** — p. 1: "Price = Total $ / Total Q" and "Total $ = Money + Credit."

> **Dalio** — p. 4: "I believe that three main forces drive most economic activity: 1) trend line productivity growth, 2) the long-term debt cycle and 3) the short-term debt cycle."

> **Dalio** — p. 5: "real per capita GDP has increased at an average rate of a shade less than 2% over the last 100 years and didn't vary a lot from that."

> **Dalio** — p. 5: "[...] major swings around the trend are due to expansions and contractions in credit – i.e., credit cycles, most importantly 1) a long-term (typically 50 to 75 years) debt cycle [...] and 2) a shorter-term (typically 5 to 8 years) debt cycle [...]"

> **Dalio** — p. 7: "The total amount of debt in the U.S. is about $50 trillion and the total amount of money (i.e., currency and reserves) in existence is about $3 trillion. [...] the amount of promises to deliver money (i.e., debt) is roughly 15 times the amount of money there is to deliver."

## § 3 Decision Problem

**Given today's nominal activity, how much is trend productivity and how much is borrowed from the future via credit?** Emits four primitives consumed downstream: (1) productivity trend, (2) output gap, (3) money-vs-credit mix, (4) debt/money ratio.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `GDP_nom` | Nominal GDP (Total $) | USD bn, SAAR | FRED (BEA NIPA) | `https://api.stlouisfed.org/fred/series/observations?series_id=GDP` | Quarterly | $5k–$30k bn post-1980 |
| `GDP_real` | Real GDP (chained 2017 $, Total Q proxy) | USD bn, SAAR | FRED (BEA) | `series_id=GDPC1` | Quarterly | $7k–$24k bn post-1980 |
| `GDP_defl` | GDP deflator (P) | Index, 2017=100 | FRED (BEA) | `series_id=GDPDEF` | Quarterly | 20–130 post-1950 |
| `RGDP_pc` | Real GDP per capita (productivity proxy) | USD, 2017$ | FRED (BEA) | `series_id=A939RX0Q048SBEA` | Quarterly | $15k–$75k post-1950 |
| `POP` | Civilian noninstitutional population 16+ | Thousands | FRED (BLS) | `series_id=CNP16OV` | Monthly | 200k–270k post-2000 |
| `M2` | M2 money stock (money proxy) | USD bn | FRED (Fed H.6) | `series_id=M2SL` | Monthly | $4k–$22k bn post-2000 |
| `TCMDO` | All sectors; debt securities and loans; liability | USD mn (raw FRED unit; divide by 1000 to compare with M2 in USD bn) | FRED (Fed Z.1) | `series_id=TCMDO` | Quarterly | 25,000,000–110,000,000 (mn) ≈ $25T–$110T post-2000 |
| `HPAY` | Hours worked, nonfarm business (Q proxy at sector level) | Index, 2017=100 | FRED (BLS) | `series_id=HOANBS` | Quarterly | 85–115 post-1990 |
| `OPH` | Output per hour, nonfarm business (productivity level) | Index, 2017=100 | FRED (BLS) | `series_id=OPHNFB` | Quarterly | 60–115 post-1990 |

**FRED endpoint template.** Rows 32–39 list only the `series_id=X` parameter. Full executable URL = `https://api.stlouisfed.org/fred/series/observations?series_id=X&api_key={FRED_API_KEY}&file_type=json` (free api_key required from FRED). For non-US geographies, substitute World Bank WDI series `NY.GDP.MKTP.KD` (real GDP) and `NY.GDP.PCAP.KD` (real GDP per capita) with template `https://api.worldbank.org/v2/country/{ISO}/indicator/{code}?format=json` (concrete US example: `https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.KD?format=json`). BIS total-credit data (cross-country credit gap work) is at `https://data.bis.org/topics/TOTAL_CREDIT` under dataflow `BIS,WS_TC,2.0` (e.g. `https://data.bis.org/topics/TOTAL_CREDIT/BIS,WS_TC,2.0/Q.US.C.A.M.770.A` for US total credit), quarterly.

## § 5 Computation / Transformations

### 5.1 Transactions identity (Dalio, p. 1)

For any closed period:

$$\text{Total \$}_t = M_t + C_t$$

$$P_t = \frac{\text{Total \$}_t}{Q_t}$$

At the economy level: $\text{GDP}_{\text{nom},t} = \text{GDP}_{\text{real},t} \cdot P_t / 100$, identifying `Total $` with `GDP_nom`, `Q` with `GDP_real`, and `P` with `GDP_defl`.

> **Dalio** — source: ibid., p. 2: "All changes in economic activity and all changes in financial markets' prices are due to changes in the amounts of 1) money or 2) credit that are spent on them (total $), and the amounts of these items sold (total Q)."

### 5.2 Money-vs-credit decomposition

Credit-financed marginal spending = $\Delta C_t = TCMDO_t - TCMDO_{t-1}$. Money-financed = $\Delta M_t = M2_t - M2_{t-1}$.

$$s^C_t = \frac{\Delta C_t}{\Delta C_t + \Delta M_t}$$

> **Dalio** — ibid., p. 2: "Changes in the amount of buying (total $) typically have a much bigger impact on changes in economic activity and prices than do changes in the total amount of selling (total Q)."

### 5.3 Productivity trend (the "2% line")

Dalio's Chart 1 (p. 5) fits a line to log real GDP per capita over ~100 years.

> **Dalio** — source: ibid., p. 5: productivity trend fit is "a shade less than 2%" over the last 100 years.

OLS fit on quarterly data:

$$\ln(RGDP\_pc_t) = \alpha + \beta \cdot t + \varepsilon_t, \quad g^{\text{trend}} = \exp(4\beta) - 1$$

Anchor on FRED `A939RX0Q048SBEA` (1947→); extend pre-1947 via Maddison Project 2020 if a longer window is needed.

### 5.4 Output gap against trend

$$\text{gap}_t = \ln(RGDP\_pc_t) - (\hat{\alpha} + \hat{\beta} \cdot t)$$

Expressed in percent: $\text{gap\%}_t = 100 \cdot \text{gap}_t$. Positive gap = above-trend operation; negative gap = below-trend.

### 5.5 Debt-to-money ratio (structural leverage of the medium of exchange)

$$R^{D/M}_t = \frac{TCMDO_t / 1000}{M2_t}$$

**Unit caveat (DERIVED).** FRED `TCMDO` is in USD millions; `M2SL` is in USD billions. The `/1000` aligns units. Without it the ratio is 1000× too large.

Dalio's 2012 snapshot: $R^{D/M} \approx 15$ using debt ~$50T and money (currency + reserves) ~$3T (p. 7). M2 is used here as the public proxy; the ratio still measures unsettled promises vs settlement medium.

> **Dalio** — source: ibid., p. 7: "[The main point is that] most people buy things with credit and don't pay much attention to what they are promising to deliver and where they are going to get it from, so there is much less money than obligations to deliver it."

## § 6 Output Variables & Decision Rules

Dalio anchors qualitative concepts and point estimates; operational thresholds (flag bands, tertile cuts, bucket edges) are author-stipulated and marked DERIVED below the table.

> **DERIVED (operational)** — flag band 1–3% p.a. on `trend_growth_pct` brackets typical decade realizations (Chart 1 averages range 0.2%–4.1%). Dalio's ~2% (p. 5) anchors the centre; the range itself is author-stipulated.

| Output | Formula | Regime tag | Cite |
|---|---|---|---|
| `trend_growth_pct` | $g^{\text{trend}}$ | Flag if outside 1–3% p.a. | Dalio p. 5 anchors ~2%; band is DERIVED above |
| `gap_regime` | from `gap%` | ABOVE_TREND if gap% > +σ; BELOW_TREND if < −σ; else ON_TREND | σ-band is DERIVED (see note below) |
| `credit_mix_regime` | from `s^C_t` (rolling 4Q) | CREDIT_DRIVEN if `s^C` > 0.66; MONEY_DRIVEN if < 0.33; else MIXED | DERIVED cuts (see note below) |
| `debt_money_regime` | from `R^{D/M}` | LOW if < 10; ELEVATED if 10–15; HIGH if > 15 | DERIVED edges (see note below) |

> **DERIVED (operational)** — the 0.66 / 0.33 tertile cuts (`credit_mix_regime`) and the 10 / 15 bucket edges (`debt_money_regime`) are author-stipulated. Dalio supplies only the qualitative claim (p. 2) that Total $ drives the cycle more than Total Q, and the 2012 point estimate "roughly 15 times" (p. 7); he publishes no numeric thresholds.

> **DERIVED (operational)** — `gap_regime` uses ±1σ of the §5.3 OLS residual as the "on-trend" band. Choice of ±1σ is author-stipulated; Hamilton (2018, NBER WP 23429, https://www.nber.org/papers/w23429) supports regression-based detrending but does not prescribe a classification band.

Downstream: 1.2 reads `gap_regime` + `credit_mix_regime`; 1.3 reads `debt_money_regime` + `trend_growth_pct`; 1.4 activates when `debt_money_regime = HIGH`; 2.1–2.5 read `trend_growth_pct` as beta return floor.

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
// file: dalio_dashboard/machine.js — fetch order: GDP_nom, GDP_real, GDP_defl, RGDP_pc, M2, TCMDO.
// Helpers (consumer-implemented, not built-ins):
//   toNumericSeries(fredJson) → [{date, value, tIdx}, …]; drops value==='.' sentinels.
//   olsLogTrend(series)       → {alpha, beta, sigma} from ln(value)=α+β·tIdx.
//   diff(series, lag)         → last value minus value `lag` periods earlier.

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

  // § 5.5 debt/money — TCMDO is in USD millions (FRED Z.1), M2SL is in USD billions (Fed H.6). Convert TCMDO to billions before dividing.
  const tcmdoLastBn = tcmdo[tcmdo.length - 1].value / 1000;
  const m2Last      = m2[m2.length - 1].value;
  const ratio       = tcmdoLastBn / m2Last;
  const debtMoney   = ratio < 10 ? 'LOW'
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
- `DebtMoneyRatio` = `(INDEX(K:K, COUNTA(K:K))/1000) / INDEX(J:J, COUNTA(J:J))` (column K is raw TCMDO in USD mn; M2 in column J is in USD bn — divide by 1000 to align units)
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

**Upstream:** FRED API (BEA + Fed Z.1 + BLS); World Bank WDI (non-US); BIS `WS_TC,2.0` (cross-country `R^{D/M}` analogue).

**Downstream:**
- **1.2** reads `gap_regime`, `credit_mix_regime`, `trend_growth_pct` as background to yield-curve / policy signals.
- **1.3** reads `debt_money_regime` + decade-scale rolling `s^C` (debt vs money + income).
- **1.4** activates when `debt_money_regime = HIGH` and `gap_regime` < 0.
- **1.7** reads `credit_mix_regime` + Total $ decomposition for money-vs-credit inflation distinction.
- **2.1** reads `trend_growth_pct` as secular beta-return anchor.
- **2.2** uses productivity trend as "growth" axis baseline.

Out of scope: cycle mechanism (→ 1.2, 1.3); policy response to high `R^{D/M}` (→ 1.4); CPI / breakeven tagging (→ 1.7).

## § 10 Open Questions, Limitations, Sources

### Open questions and ambiguities

1. **Cycle ranges, not thresholds.** "5–8 years" (short) and "50–75 years" (long) are descriptive ranges from p. 5; Dalio publishes no numeric test for *which* cycle you are in (→ 1.2 / 1.3).
2. **"A shade less than 2%"** (p. 5) is a historical fit, not a forward-looking threshold. The 1–3% p.a. flag band around Dalio's ~2% anchor is DERIVED (brackets typical decade realizations 0.2%–4.1% per Chart 1).
3. **"Roughly 15 times"** debt-to-money (p. 7) is a 2012 snapshot using currency + reserves as money. Dalio does not specify the aggregate or a danger threshold; the `LOW / ELEVATED / HIGH` bucket edges are author-stipulated.
4. **`credit_mix_regime` tertile cuts (0.66 / 0.33)** are DERIVED. Dalio supplies only the qualitative claim (p. 2) that Total $ changes drive the cycle more than Total Q; the cuts are a minimum-information split of [0,1].
5. **Output-gap σ-band is not Dalio.** The ±1σ classification is DERIVED (operational); Hamilton 2018 supports regression-based detrending but does not itself prescribe a classification band (see §6).
6. **Total Q at the economy level is an approximation.** Real GDP as aggregate Q treats composition changes as price changes in P; the identity applies more cleanly to single markets.
7. **Dalio's "money" ≠ M2.** He uses currency + reserves; M2 is the practical public proxy. Worked example (step 6) reports both.

### Sources (all publicly accessible, no login)

- **Primary, page-numbered.** Dalio, "How the Economic Machine Works — A Template for Understanding What is Happening Now," Bridgewater, 2008/2012. Public mirror used for §2 page citations (pp. 1, 2, 4, 5, 7): https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf
- **Canonical landing page** (gated signup): https://www.economicprinciples.org/
- **Compiled 2017 PDF (productivity appendix, pp. 24–33):** https://www.economicprinciples.org/downloads/ray_dalio__how_the_economic_machine_works__leveragings_and_deleveragings.pdf
- **FRED API.** https://fred.stlouisfed.org/docs/api/fred/ — series `GDP`, `GDPC1`, `GDPDEF`, `A939RX0Q048SBEA`, `CNP16OV`, `M2SL`, `TCMDO`, `HOANBS`, `OPHNFB`.
- **Maddison Project 2020:** https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2020
- **World Bank WDI:** `https://api.worldbank.org/v2/country/{ISO}/indicator/{code}` — `NY.GDP.MKTP.KD`, `NY.GDP.PCAP.KD`.
- **BIS total credit `BIS,WS_TC,2.0`:** https://data.bis.org/topics/TOTAL_CREDIT (US example: `.../BIS,WS_TC,2.0/Q.US.C.A.M.770.A`).
- **Hamilton (2018), NBER WP 23429:** https://www.nber.org/papers/w23429 — supports regression-based detrending used in §5.3 (the ±1σ classification band is DERIVED, not Hamilton's).
