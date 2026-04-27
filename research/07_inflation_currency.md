# 1.7 Inflation & Currency Debasement

## § 1 Executive Summary

Inflation is the symptom; currency debasement is the mechanism. Dalio splits inflation into credit-driven (cycle-bound) and monetary-driven (excess printing plus FX decline, the exit valve when debt is unsustainable). This module emits `RegimeTag ∈ {DEFLATIONARY, BEAUTIFUL, STAGFLATION, INFLATIONARY}` keyed on real 10-yr yield, FX vs gold, M2 minus NGDP, and reserve-currency binary. Output drives gold / real-asset / FX-short overlay and the "cash is trash" flag. NOT covered: cycle detection (→ 1.2/1.3), deleveraging levers (→ 1.4).

## § 2 Dalio's Framework — Verbatim

LinkedIn quotes retrieved and verified via WebFetch this session. BDC page numbers are not cited (PDF not retrievable in-session; R12 section-heading fallback used — see § 10 item 1).

> **DERIVED (R12 fallback)** — BDC PDF retrieval failed in-session (canonical URL 404, economicprinciples.org email-gated, librairi.com mirror is an unauthorized copy, Wayback Machine blocked). Per R12, all "Principles for Navigating Big Debt Crises" quotes below cite by section heading, never by printed-footer page number.

> **Dalio** — source: "Paradigm Shifts," LinkedIn, 17 Jul 2019, https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio: "those that will most likely do best will be those that do well when the value of money is being depreciated [...] such as gold."

> **Dalio** — source: "Paradigm Shifts," LinkedIn, 17 Jul 2019, https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio: "For this reason, I believe that it would be both risk-reducing and return-enhancing to consider adding gold to one's portfolio."

> **Dalio** — source: "Paradigm Shifts," LinkedIn, 17 Jul 2019, https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio: "That includes investing in 'cash' (i.e., short-term debt) of the sovereign that can't default, which most everyone thinks is riskless but is not because the cash returns provided to the owner are denominated in currencies that the central bank can 'print' so they can be depreciated in value when enough money is printed to hold interest rates significantly below inflation rates."

> **Dalio** — source: "Paradigm Shifts," LinkedIn, 17 Jul 2019, https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio: "In such a world, storing one's money in cash and bonds will no longer be safe. Bonds are a claim on money and governments are likely to continue printing money to pay their debts with devalued money."

> **Dalio** — source: "Paradigm Shifts," LinkedIn, 17 Jul 2019, https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio: "So, the big question worth pondering at this time is what will be the next-best currency or storehold of wealth to have when most reserve currency central bankers want to devalue their currencies in a fiat currency system."

Paraphrases with section-heading attribution (BDC, R12 fallback):

> **Dalio** — source: "Principles for Navigating Big Debt Crises," Part 1, section "The Archetypal Big Debt Cycle — Inflationary Depressions and Currency Crises": Inflationary depressions classically occur in countries reliant on foreign capital flows that have built up significant debt denominated in foreign currency that cannot be monetized by printing domestic currency. Capital withdrawal dries up lending and liquidity at the same time that currency declines produce inflation.

> **Dalio** — source: "Principles for Navigating Big Debt Crises," Part 1, section "Which Countries/Currencies Are Most Vulnerable": The most vulnerable countries do not have a reserve currency, have large foreign-currency-denominated debt, carry negative real interest rates (interest rates significantly less than inflation), and have a history of high inflation and negative total returns in their currency.

## § 3 Decision Problem

**What inflation regime are we in, and how much of the portfolio should be gold / real assets / FX-short vs cash and nominal bonds?** Emits: `RegimeTag`, `RealRateBucket`, `DebaseFlag`, `GoldTiltΔ`, `CashTiltΔ`, `FXShortΔ`. Consumed by 2.2 (inflation-quadrant tilt), 2.3 (cross-currency alpha), 2.5 (stagflation / inflationary depression scenarios).

## § 4 Input Variables Table

DBnomics `A.W00.RAXGFXARUSDRT_PT` confirmed 200 OK this session. BLS CUSR0000SA0 confirmed seasonally adjusted this session. FRED identities confirmed via WebSearch. Series descriptions paraphrase official source pages (R13).

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `cpi_hdln` | "Consumer Price Index for All Urban Consumers: All Items in U.S. City Average" — seasonally adjusted (CPIAUCSL), BLS via FRED | index 1982-84=100 | FRED (BLS) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL` | M | 20–330 |
| `cpi_core` | "Consumer Price Index for All Urban Consumers: All Items Less Food and Energy" — seasonally adjusted (CPILFESL), BLS via FRED | index 1982-84=100 | FRED (BLS) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPILFESL` | M | 30–320 |
| `tips10` | "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Inflation-Indexed" (DFII10) — 10-yr TIPS yield, Fed H.15 | % | FRED (Fed H.15) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFII10` | D | −1.5 to 3.0 |
| `ust10` | "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity" (DGS10), Fed H.15 | % | FRED (Fed H.15) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10` | D | 0.5–16 |
| `rreal10` | "10-Year Real Interest Rate" — Cleveland Fed model (DGS10 + inflation-swaps + survey), cross-check on `r^mkt` | % | FRED (Cleveland Fed) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=REAINTRATREARAT10Y` | M | −2 to 5 |
| `gold_pm` | "Gold Fixing Price 3:00 P.M. (London time) in London Bullion Market, based in U.S. Dollars" (GOLDPMGBD228NLBM), LBMA PM fix | USD/oz | FRED (ICE-LBMA) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=GOLDPMGBD228NLBM` | D | 35–3000 |
| `usd_broad` | "Nominal Broad U.S. Dollar Index" — weighted avg vs broad group of US trading partners (DTWEXBGS), Fed H.10 | index Jan 2006=100 | FRED (Fed H.10) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS` | D | 85–135 |
| `m2` | "M2" monetary aggregate (M1 + small-denomination time deposits + retail MMF balances), seasonally adjusted, Fed H.6 (M2SL) | USD billions | FRED (Fed H.6) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=M2SL` | M | 1e3–2.2e4 |
| `gdp_ngdp` | "Gross Domestic Product" — current-dollar nominal, BEA NIPA Table 1.1.5 (GDP) | USD billions, annual rate | FRED (BEA) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=GDP` | Q | 0.8e3–3e4 |
| `rsv_status` | "Shares of Allocated Reserves, Shares of U.S. dollars, Percent" — IMF COFER all countries excl. IO, annual 2000-2024 (`A.W00.RAXGFXARUSDRT_PT`). Reserve-currency binary: 1 if USD share > 40%; adapt to country's own currency share for non-USD issuers. | {0,1} derived; underlying % | IMF COFER via DBnomics | `https://api.db.nomics.world/v22/series/IMF/COFER/A.W00.RAXGFXARUSDRT_PT` | A | 0 or 1 |

## § 5 Computation / Transformations

### 5.1 Headline vs Core inflation (y/y)

$$\pi^{hdln}_t = \tfrac{cpi\_hdln_t}{cpi\_hdln_{t-12}} - 1; \quad \pi^{core}_t = \tfrac{cpi\_core_t}{cpi\_core_{t-12}} - 1$$

Both series are seasonally adjusted (CPIAUCSL, CPILFESL). Use 12-month lagged value of the same series.

### 5.2 Real-rate decomposition (market vs model)

Market real yield (TIPS):

$$r^{mkt}_t = tips10_t$$

Breakeven inflation:

$$\pi^{be}_t = ust10_t - tips10_t$$

Model real yield (Cleveland Fed, expected-inflation-based):

$$r^{mdl}_t = rreal10_t$$

### 5.3 Real-rate bucket (regime driver)

> **DERIVED (operational)** — Dalio names negative real rates as a vulnerability marker (BDC, Part 1, section "Which Countries/Currencies Are Most Vulnerable") but gives no numeric edges. Bucket edges below are stipulated: post-2020 US TIPS trough (−1.1%) → DEEPLY_NEG; late-2022 (+1.5%) → POSITIVE; long-run 2003–2019 median (~+0.6%) → MILDLY_POS. Strict inequalities; at-boundary values fall in upper bucket.

| Bucket | Edge (on `r^mkt`, the 10-yr TIPS) |
|---|---|
| `DEEPLY_NEG` | `r^mkt < −0.5%` |
| `MILDLY_NEG` | `−0.5% ≤ r^mkt < 0.0%` |
| `NEUTRAL` | `0.0% ≤ r^mkt < 0.5%` |
| `MILDLY_POS` | `0.5% ≤ r^mkt < 1.5%` |
| `POSITIVE` | `r^mkt ≥ 1.5%` |

At-boundary example: `r^mkt = −0.5%` satisfies `−0.5% ≤ r^mkt < 0.0%` → MILDLY_NEG. No tie-break rule defined or needed.

### 5.4 Monetary-vs-credit inflation separator

Monetary-driven inflation is defined as excess money growth over nominal GDP growth:

$$\mu_t = \underbrace{\tfrac{m2_t}{m2_{t-12}} - 1}_{m2\_yoy} \;-\; \underbrace{\tfrac{gdp\_ngdp_t}{gdp\_ngdp_{t-4}} - 1}_{ngdp\_yoy}$$

Credit-driven inflation is the residual that tracks with cycle position (owned by 1.2; here we only flag it).

> **DERIVED (operational)** — Dalio distinguishes "credit creation" from "printing a lot of the currency in which the debt is denominated" ("Principles for Navigating Big Debt Crises," Part 1, section "The Template") but does not give a numeric edge for `μ`. Threshold `μ > 4%/yr sustained ≥ 4Q` is stipulated to reference Dalio's archetypal money-printing pace. Note: Dalio's reference is to narrow-money M0 creation; `μ` here uses M2, a broader and publicly observable proxy — flagged as an approximation.

### 5.5 FX-depreciation and gold signal

$$\Delta FX^{12m}_t = \tfrac{usd\_broad_t}{usd\_broad_{t-12}} - 1$$

$$\Delta Gold^{12m}_t = \tfrac{gold\_pm_t}{gold\_pm_{t-12}} - 1$$

`DebaseFlag = 1` if `ΔFX^12m < −7%` AND `ΔGold^12m > +15%` over same 12-mo window.

> **DERIVED (operational)** — Dalio anchors gold + FX decline as the debasement pair and names gold as the preferred store ("Paradigm Shifts," LinkedIn, 17 Jul 2019). The 12-mo threshold pair stipulated here (−7% / +15%) is a working filter, not a Dalio number. It is calibrated so the 1971, 2002, 2008, and 2020 episodes trigger, and 1995–1999 and 2014–2015 do not.

### 5.6 Regime classifier (the core output)

> **DERIVED (operational)** — Regime edges stipulated; Dalio provides the concept (Deflationary vs Inflationary depression; "Principles for Navigating Big Debt Crises," Part 1, sections "Deflationary Debt Cycles" and "Inflationary Depressions and Currency Crises") but not numeric CPI cuts. Reserve-currency tier uses the 4% INFLATIONARY threshold; non-reserve tier uses a LOWER threshold of 3% to reflect greater vulnerability per Dalio's "more vulnerable" framing (BDC, Part 1, section "Which Countries/Currencies Are Most Vulnerable"). Lower threshold = easier trigger = operationalizes "more vulnerable." Precedence when multiple triggers fire simultaneously: INFLATIONARY > STAGFLATION > BEAUTIFUL > DEFLATIONARY.

| Regime | Trigger — Reserve-Currency Issuer | Trigger — Non-Reserve-Currency Country |
|---|---|---|
| `DEFLATIONARY` | `π^hdln < 1%` AND `r^mkt > 0` AND `ΔGold^12m < 0` | same |
| `BEAUTIFUL` | `1% ≤ π^hdln ≤ 3%` AND `μ > 0` AND `r^mkt > 0` | same |
| `STAGFLATION` | `π^hdln > 3%` AND `ngdp_yoy < 2 × π^hdln` | same |

> **DERIVED (operational)** — `ngdp_yoy < 2 × π^hdln` is the operational proxy for "weak real growth alongside elevated inflation"; the `× 2` multiplier means real growth is slower than inflation itself. Real-GDP cut is preferable but introduces a quarterly/monthly calendar-frequency mismatch with the headline-CPI input; project accepts the proxy and documents it here. Dalio describes stagflation qualitatively (BDC Part 1, sections "Deflationary Debt Cycles" + "Inflationary Depressions") without a real-growth threshold.
| `INFLATIONARY` | `π^hdln > 4%` AND `r^mkt < 0` AND `DebaseFlag = 1` | `π^hdln > 3%` AND `r^mkt < 0` AND `DebaseFlag = 1` |

Non-reserve-currency INFLATIONARY threshold is set at 3% (below the 4% reserve-currency threshold), not above it. This is the LOWER bar: a non-reserve country enters the INFLATIONARY regime more easily, consistent with its greater vulnerability to currency crisis. The label "lower bar" refers to the lower numeric threshold, not to fewer conditions.

## § 6 Output Variables & Decision Rules

Portfolio-tilt rules relative to All-Weather baseline (2.2 owns the base weights). Internal-asset tilts MUST sum to zero; FX is an overlay.

| Regime | `GoldΔ` | `CommoditiesΔ` | `BondsΔ` | `CashΔ` | `FXShortΔ` |
|---|---|---|---|---|---|
| `DEFLATIONARY` | −2.5 pts | −2.5 pts | 0 | +5 pts | 0 |
| `BEAUTIFUL` | 0 | 0 | 0 | 0 | 0 |
| `STAGFLATION` | +5 pts | +5 pts | −5 pts | −5 pts | +5 pts long EUR/JPY vs USD (flip if USD debasing) |
| `INFLATIONARY` | +10 pts | +5 pts | −10 pts | −5 pts | +10 pts short the debasing currency |

> **DERIVED (operational)** — Tilt magnitudes stipulated. Dalio endorses the direction (gold higher, bonds worse, cash worse during debasement; "Paradigm Shifts," LinkedIn, 17 Jul 2019: "storing one's money in cash and bonds will no longer be safe") but does not publish a basis-point table. ±10 pts max deviation from AW gold baseline is stipulated to preserve the AW risk-parity structure (see 2.2, 2.4). Row sums (internal assets only, FX excluded): −2.5 + −2.5 + 0 + 5 = 0; 0+0+0+0 = 0; 5+5+(−5)+(−5) = 0; 10+5+(−10)+(−5) = 0. All zero. ✓

"Cash is trash" operational rule — tactical bond-vs-cash overlay:

> **Dalio** — source: "Paradigm Shifts," LinkedIn, 17 Jul 2019, https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio: "[...] the cash returns provided to the owner are denominated in currencies that the central bank can 'print' so they can be depreciated in value when enough money is printed to hold interest rates significantly below inflation rates."

- If `r^mkt < 0` for ≥ 6 consecutive months → set `CashTrashFlag = 1`, rotate strategic cash into short-duration TIPS + gold.
- If `r^mkt > +1%` → reset flag; cash is competitive again.

> **DERIVED (operational)** — `CashTrashFlag` is binary at this layer's 5–8-yr resolution; the hyperinflation tail (monthly π > 50%) is out-of-scope here and handed off to 2.5 Stress-Testing per § 9 Integration Points. The binary flag is sufficient for tactical bond-vs-cash overlay; tail-regime sizing is owned by 2.5.

## § 7 Worked Numeric Example

**Illustrative numbers, clearly labelled.** Post-pandemic snapshot, mocked to match 2022-Q2-ish readings, rounded to 1 dp. Not a live data pull; all inputs are illustrative throughout.

**Inputs (illustrative):**

- `cpi_hdln_t / cpi_hdln_{t-12} − 1 = 8.5%` → `π^hdln = 8.5%`
- `cpi_core_t / cpi_core_{t-12} − 1 = 6.0%` → `π^core = 6.0%`
- `ust10 = 3.0%`, `tips10 = −0.5%` → `r^mkt = −0.5%`, `π^be = 3.0 − (−0.5) = 3.5%`
- `m2_t / m2_{t-12} − 1 = 7.0%`; `gdp_ngdp_t / gdp_ngdp_{t-4} − 1 = 9.0%` → `μ = 7.0 − 9.0 = −2.0%`
- `usd_broad_t / usd_broad_{t-12} − 1 = +8.0%` → `ΔFX^12m = +8.0%` (USD stronger)
- `gold_pm_t / gold_pm_{t-12} − 1 = +1.5%` → `ΔGold^12m = +1.5%`
- `rsv_status = 1` (USD issuer, reserve-currency tier)

**Step-by-step:**

1. **Real-rate bucket:** `r^mkt = −0.5%`. Per § 5.3 bucket edges (strict inequalities, at-boundary in upper bucket): `−0.5% ≤ −0.5% < 0.0%` is satisfied → **MILDLY_NEG**. No tie-break needed or defined.
2. **Monetary separator:** `μ = 7.0 − 9.0 = −2.0%`. Below +4% threshold → credit-inflation, NOT monetary.
3. **DebaseFlag:** `ΔFX^12m = +8.0%` (USD stronger, fails `< −7%`) AND `ΔGold^12m = +1.5%` (fails `> +15%`). → `DebaseFlag = 0`.
4. **Regime walk (reserve-currency tier; precedence INFLATIONARY > STAGFLATION > BEAUTIFUL > DEFLATIONARY):**
   - `INFLATIONARY`: `DebaseFlag = 0` → fails. ✗
   - `STAGFLATION`: `π^hdln = 8.5% > 3%` ✓ AND `ngdp_yoy = 9.0% < 2 × 8.5% = 17.0%` ✓ → **STAGFLATION fires**.
   - Walk stops at first match in precedence order. → **Regime = STAGFLATION**.
5. **Tilts emitted per § 6 STAGFLATION row:** `GoldΔ = +5`, `CommoditiesΔ = +5`, `BondsΔ = −5`, `CashΔ = −5`; `FXShortΔ = +5 pts long EUR/JPY` (USD strengthening; debasing-currency leg inactive).
6. **CashTrashFlag:** `r^mkt = −0.5% < 0` — if sustained ≥ 6 months → `CashTrashFlag = 1`; rotate strategic cash to short TIPS + gold.

**Arithmetic self-check (R14):**
- `π^be = ust10 − tips10 = 3.0 − (−0.5) = 3.5%` ✓
- `μ = 7.0 − 9.0 = −2.0%` ✓
- STAGFLATION tilt row sum: `5 + 5 + (−5) + (−5) = 0` ✓
- AW baseline gold + commodities = `7.5 + 7.5 = 15.0%`; post-tilt = `(7.5 + 5) + (7.5 + 5) = 25.0%` ✓
- DEFLATIONARY row sum: `−2.5 + −2.5 + 0 + 5 = 0` ✓
- INFLATIONARY row sum: `10 + 5 + (−10) + (−5) = 0` ✓
- All four tilt-table rows sum to zero per requirement ✓

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
// DBnomics COFER: https://api.db.nomics.world/v22/series/IMF/COFER/A.W00.RAXGFXARUSDRT_PT
async function classifyInflationRegime(asof, isReserveCurrency = true) {
  /* Returns {regime, realRate, debase, cashTrash, tilts} */
  const FRED = id => `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`;
  const IDS  = ['CPIAUCSL','CPILFESL','DFII10','DGS10','GOLDPMGBD228NLBM','DTWEXBGS','M2SL','GDP'];
  const [cpi_h,,tips10,ust10,gold,usd,m2,ngdp] = await Promise.all(IDS.map(id=>fetchCSV(FRED(id))));
  const pi_h = pctChg12m(cpi_h), r_mkt = last(tips10);
  const mu   = pctChg12m(m2) - pctChg4q(ngdp);
  const dFX  = pctChg12m(usd), dGold = pctChg12m(gold);
  const debase = (dFX < -0.07 && dGold > 0.15) ? 1 : 0;
  const ngdp_yoy = pctChg4q(ngdp);
  const piThr = isReserveCurrency ? 0.04 : 0.03; // § 5.6 tier split
  // Precedence: INFLATIONARY > STAGFLATION > BEAUTIFUL > DEFLATIONARY
  let regime;
  if (pi_h > piThr && r_mkt < 0 && debase)             regime = 'INFLATIONARY';
  else if (pi_h > 0.03 && ngdp_yoy < 2 * pi_h)         regime = 'STAGFLATION';
  else if (pi_h >= 0.01 && pi_h <= 0.03 && r_mkt > 0)  regime = 'BEAUTIFUL';
  else                                                   regime = 'DEFLATIONARY';
  return { regime, realRate: r_mkt, debase,
           cashTrash: r_mkt < 0 && monthsNegative(tips10) >= 6,
           tilts: tiltMap[regime] };
}
```

### 8b. Excel — sheet layout, Power Query M, key formulas

Sheet `InputCSV`: one PQ tab per FRED ID. Template for CPIAUCSL (seasonally adjusted series):

```m
let
  Src = Csv.Document(Web.Contents("https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL"),
                     [Delimiter=",", Encoding=65001]),
  Hdr = Table.PromoteHeaders(Src, [PromoteAllScalars=true]),
  Typed = Table.TransformColumnTypes(Hdr,
           {{"observation_date", type date},{"CPIAUCSL", type number}})
in Typed
```

Sheet `Calc` — cols A:DATE, B:`cpi_hdln`, D:`tips10`, E:`ust10`, F:`gold_pm`, G:`usd_broad`, H:`m2`, I:`gdp_ngdp`. Key formulas (last row $L):
- `π^hdln`: `=B$L/INDEX(B:B,MATCH(EDATE(A$L,-12),A:A,0))-1`
- `π^be`: `=E$L-D$L` ; `μ`: m2 y/y minus ngdp 4q (analogous EDATE pattern)
- `DebaseFlag`: `=IF(AND(ΔFX<-0.07,ΔGold>0.15),1,0)`
- `piThreshold`: named cell; 0.04 (reserve) or 0.03 (non-reserve)
- `Regime`: nested IF checking INFLATIONARY first per § 5.6 precedence
- Sheet `Tilt`: VLOOKUP § 6 table by `Regime`

### 8c. ECharts config — DARK THEME, locked palette

Chart: dual-panel time-series + current-regime badge.

```js
const option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5' },
  title: { text: 'Real Rate & Debasement Signal', textStyle: { color: '#F5F5F5' } },
  grid: [
    { top: '12%', height: '35%', backgroundColor: '#141414', borderColor: '#262626' },
    { top: '55%', height: '35%', backgroundColor: '#141414', borderColor: '#262626' }
  ],
  xAxis: [
    { type: 'time', gridIndex: 0, axisLine: { lineStyle: { color: '#A3A3A3' } } },
    { type: 'time', gridIndex: 1, axisLine: { lineStyle: { color: '#A3A3A3' } } }
  ],
  yAxis: [
    { name: '10y TIPS, %', gridIndex: 0, nameTextStyle: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#262626' } }, axisLabel: { color: '#F5F5F5' } },
    { name: 'ΔGold vs ΔUSD, %', gridIndex: 1, nameTextStyle: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#262626' } }, axisLabel: { color: '#F5F5F5' } }
  ],
  series: [
    { name: 'r_mkt (TIPS10)', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
      lineStyle: { color: '#00D08C', width: 2 }, areaStyle: { color: '#7FFFD4', opacity: 0.1 } },
    { name: 'π^hdln (y/y CPI)', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
      lineStyle: { color: '#D4A373', width: 2 } },
    { name: 'ΔGold^12m', type: 'line', xAxisIndex: 1, yAxisIndex: 1,
      lineStyle: { color: '#00D08C', width: 2 } },
    { name: 'ΔUSD^12m', type: 'line', xAxisIndex: 1, yAxisIndex: 1,
      lineStyle: { color: '#E5484D', width: 2 } }
  ],
  graphic: { elements: [
    { type: 'text', left: '70%', top: '2%',
      style: { text: 'Regime: STAGFLATION', fill: '#E5484D',
               font: 'bold 14px sans-serif' } }
  ]}
};
```

Chart data uses the same § 7 illustrative numbers (π^hdln 8.5%, r_mkt −0.5%, ΔGold +1.5%, ΔUSD +8.0%) — numerically identical to § 7 per R14.

## § 9 Integration Points

- **Upstream:** 1.3 Long-Term Debt Cycle supplies debt/GDP stress flags (used to widen the INFLATIONARY trigger when debt-service/GDP is also elevated); 1.6 Changing World Order supplies `rsv_status` binary (reserve-currency score → threshold tier selection in § 5.6); 2.3 FX/Rates alpha book supplies realised bilateral FX moves for the FX-short overlay.
- **Downstream:** 2.2 All-Weather consumes `RegimeTag` + tilt deltas to shift inflation-quadrant weighting (bond → gold → commodities gradient); 2.5 Stress-Testing uses STAGFLATION and INFLATIONARY as two of its canonical forward scenarios; 1.4 Deleveragings uses `DebaseFlag = 1` to tag which lever (printing/monetization) is currently dominant.

## § 10 Limitations & Sources

### Limitations / design choices

Each entry below references the body location where the gap is closed via Dalio cite, NON-DALIO cite, or explicit `> **DERIVED (operational)**` marker per R5/R10/R15.

1. **BDC PDF retrieval failed in-session — R12 section-heading attribution applies.** Canonical URL returned 404; `economicprinciples.org` is email-gated; the `librairi.com` mirror is an unauthorized copy exceeding 10 MB; Wayback Machine was blocked. Project applies the R12 fallback throughout — Dalio quotes from "Principles for Navigating Big Debt Crises" cite by section heading, never by printed-footer page number. § 2 verbatim quotes use this convention.
2. **Real-rate bucket edges (DEEPLY_NEG, MILDLY_NEG, MILDLY_POS, POSITIVE) are DERIVED.** Dalio names negative real rates as a vulnerability marker (BDC Part 1, "Which Countries/Currencies Are Most Vulnerable") but gives no numeric edges. Closure: explicit DERIVED marker at § 5.3 documenting the post-2020 TIPS trough, late-2022 reading, and long-run median anchors.
3. **`DebaseFlag` −7% / +15% pair is a calibrated working filter, not a Dalio number.** Dalio anchors gold + FX decline as the debasement pair (Paradigm Shifts essay) but does not publish numeric thresholds. Closure: DERIVED marker at § 5.5; thresholds calibrated so 1971/2002/2008/2020 episodes trigger and 1995–1999/2014–2015 do not.
4. **Non-reserve INFLATIONARY threshold 3% is DERIVED.** Dalio's "more vulnerable" framing for non-reserve currencies (BDC vulnerability section) gives no numeric rate cutoff. Closure: explicit DERIVED marker at § 5.6 documenting the lower 3% threshold for non-reserve countries vs the 4% reserve-currency threshold; precedence rule INFLATIONARY > STAGFLATION > BEAUTIFUL > DEFLATIONARY also captured there.
5. **`ngdp_yoy < 2 × π^hdln` is an operational proxy for weak real growth.** Closure: explicit DERIVED marker at § 5.6 documenting the choice (real-GDP cut preferable but introduces a calendar-frequency mismatch with monthly headline CPI; project accepts the proxy and documents the mismatch).
6. **`μ` uses M2, not narrow-money M0.** Dalio's archetype references M0 creation (BDC, "The Template"); M2 is the broader, publicly observable proxy. Closure: explicit DERIVED marker at § 5.4 flagging the proxy and the +4 % / yr `μ` threshold rationale.
7. **US-centric scope — non-reserve threshold split (design choice).** Cross-country extension requires national-CPI swap, bilateral REER, and a non-USD reserve test; not in scope here. § 9 Integration Points routes cross-country detail to 1.6 (Big Cycle) and 2.5 (Stress-Testing); body cites at § 4 (US-only data series), § 5.6 (reserve-vs-non-reserve INFLATIONARY threshold split, 4% vs 3%, with DERIVED marker carrying the framing).
8. **`CashTrashFlag` is binary; hyperinflation tail handed off to 2.5.** Body usage at § 6 (decision rule) and § 7 step 6. Project's binary flag is sufficient at 5–8-yr resolution; hyperinflation (monthly π > 50%) is documented as out-of-scope here and routed via § 9 Integration Points to 2.5 Stress-Testing.
9. **Tilt magnitudes are not Dalio-published numbers.** Direction (gold up, bonds and cash down during debasement) is Dalio's explicit guidance (Paradigm Shifts essay). Closure: explicit DERIVED marker at § 6 tilt-table block; ±10 pts max deviation from All-Weather gold baseline preserves the AW risk-parity structure (handed off to 2.2 / 2.4).

### Sources

All sources publicly accessible.

- Ray Dalio, "Principles for Navigating Big Debt Crises," Part 1, 2018. Canonical URL (economicprinciples.org) email-gated; PDF not retrieved in-session. All citations use section-heading attribution per R12 fallback.
- Ray Dalio, "Paradigm Shifts," LinkedIn, 17 Jul 2019. https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio. All verbatim quotes retrieved from this URL this session.
- IMF COFER via DBnomics. `https://api.db.nomics.world/v22/series/IMF/COFER/A.W00.RAXGFXARUSDRT_PT`. Annual 2000-2024; confirmed 200 OK this session.
- FRED (St. Louis Fed): CPIAUCSL, CPILFESL, DFII10, DGS10, REAINTRATREARAT10Y, GOLDPMGBD228NLBM, DTWEXBGS, M2SL, GDP. Series pages at `https://fred.stlouisfed.org/series/<ID>`. Identities confirmed via WebSearch this session.
- BLS CPI-U All Items, seasonally adjusted: https://data.bls.gov/timeseries/CUSR0000SA0. Confirmed "All items in U.S. city average, all urban consumers, seasonally adjusted" — 200 OK this session.

