# 1.7 Inflation & Currency Debasement

## § 1 Executive Summary

Inflation is the symptom; currency debasement is the mechanism. Dalio splits inflation into **credit-driven** (cycle-bound) and **monetary-driven** (printing plus FX decline, the exit valve when debt is unsustainable). This module emits `RegimeTag ∈ {DEFLATIONARY, BEAUTIFUL, STAGFLATION, INFLATIONARY}` keyed on real 10-yr yield, FX vs gold, M2 minus NGDP, and reserve-currency binary. Output drives gold / real-asset / FX-short overlay and the "cash is trash" flag. NOT: cycle detection (→ 1.2/1.3), deleveraging mechanics (→ 1.4).

## § 2 Dalio's Framework — Verbatim

Primary sources: (A) *Principles For Navigating Big Debt Crises*, Part 1 — verified PDF mirror, printed-footer pages cited. (B) "Paradigm Shifts," LinkedIn, 17 Jul 2019.

> **Dalio** — source: *Big Debt Crises*, Part 1, Introduction ("How I Think about Credit and Debt" — the two-types distinction, pp. 14-15): "Inflationary depressions classically occur in countries that are reliant on foreign capital flows and so have built up a significant amount of debt denominated in foreign currency that can't be monetized […] In an inflationary deleveraging, capital withdrawal dries up lending and liquidity at the same time that currency declines produce inflation."

> **Dalio** — source: *Big Debt Crises*, Part 1, p. 34: "On average the printing of money has been around 4 percent of GDP per year. There is a large initial currency devaluation of around 50 percent against gold, and deficits widen to about 6 percent of GDP."

> **Dalio** — source: *Big Debt Crises*, Part 1, p. 40 ("Which Countries/Currencies Are Most Vulnerable"): vulnerable countries "Don't have a reserve currency […] Have a large foreign debt […] Have negative real interest rates (i.e., interest rates that are significantly less than inflation rates) […] Have a history of high inflation and negative total returns in the currency."

> **Dalio** — source: *Big Debt Crises*, Part 1, p. 59: "during this time gold becomes the preferred asset to hold, shares are a disaster even though they rise in local currency, and bonds are wiped out."

> **Dalio** — source: "Paradigm Shifts," LinkedIn, 17 Jul 2019: "those that will most likely do best will be those that do well when the value of money is being depreciated […] such as gold. […] it would be both risk-reducing and return-enhancing to consider adding gold to one's portfolio."

## § 3 Decision Problem

**What inflation regime are we in, and how much of the portfolio should be gold / real assets / FX-short vs cash and nominal bonds?** Emits: `RegimeTag`, `RealRateBucket`, `DebaseFlag`, `GoldTiltΔ`, `CashTiltΔ`, `FXShortΔ`. Consumed by 2.2 (inflation-quadrant tilt), 2.3 (cross-currency), 2.5 (stagflation scenario).

## § 4 Input Variables Table

Descriptions paraphrase or quote the official series description page verified in-session (R13). All endpoints return the series ID in the body of the response; every FRED URL uses the `fredgraph.csv?id=<SERIES>` pattern.

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `cpi_hdln` | "Consumer Price Index for All Urban Consumers: All Items in U.S. City Average" — seasonally adjusted, BLS | index 1982-84=100 | FRED (BLS) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL` | M | 20–330 |
| `cpi_core` | "Consumer Price Index for All Urban Consumers: All Items Less Food and Energy" — seasonally adjusted, BLS | index 1982-84=100 | FRED (BLS) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPILFESL` | M | 30–320 |
| `tips10` | "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis, Inflation-Indexed" (TIPS) | % | FRED (Fed H.15) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFII10` | D | −1.5 to 3.0 |
| `ust10` | "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis" | % | FRED (Fed H.15) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10` | D | 0.5 – 16 |
| `rreal10` | "10-Year Real Interest Rate" — Cleveland Fed model (Treasuries + inflation-swaps + survey expectations); used as cross-check on `r^mkt` in § 5.2 | % | FRED (Cleveland Fed) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=REAINTRATREARAT10Y` | M | −2 to 5 |
| `gold_pm` | "Gold Fixing Price 3:00 P.M. (London time) in London Bullion Market, based in U.S. Dollars" (LBMA PM fix) | USD/oz | FRED (ICE-LBMA) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=GOLDPMGBD228NLBM` | D | 35–3000 |
| `usd_broad` | "Nominal Broad U.S. Dollar Index" — weighted avg vs broad group of US trading partners, Fed H.10 | index Jan 2006=100 | FRED (Fed H.10) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS` | D | 85–135 |
| `m2` | "M2" monetary aggregate (M1 + small-denomination time deposits + retail MMF balances), seasonally adjusted, Fed H.6 | USD billions | FRED (Fed H.6) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=M2SL` | M | 1e3–2.2e4 |
| `gdp_ngdp` | "Gross Domestic Product" — current-dollar (nominal), BEA NIPA Table 1.1.5 | USD billions, annual rate | FRED (BEA) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=GDP` | Q | 0.8e3–3e4 |
| `rsv_status` | Reserve-currency status binary (1 if COFER share > 40% for country's currency) | {0,1} | IMF COFER via DBnomics | `https://api.db.nomics.world/v22/series/IMF/COFER/Q.W00.RAXGFX_USD_USD` | Q | 0 or 1 |

## § 5 Computation / Transformations

### 5.1 Headline vs Core inflation (y/y)

$$\pi^{hdln}_t = \tfrac{cpi\_hdln_t}{cpi\_hdln_{t-12}} - 1; \quad \pi^{core}_t = \tfrac{cpi\_core_t}{cpi\_core_{t-12}} - 1$$

### 5.2 Real-rate decomposition (market vs model)

Market real yield (TIPS):

$$r^{mkt}_t = tips10_t$$

Breakeven inflation:

$$\pi^{be}_t = ust10_t - tips10_t$$

Model real yield (Cleveland Fed, expected-inflation-based):

$$r^{mdl}_t = rreal10_t$$

### 5.3 Real-rate bucket (regime driver)

> **DERIVED (operational)** — Dalio names "negative real interest rates (i.e., interest rates that are significantly less than inflation rates)" as a vulnerability marker (*BDC*, p. 40) but does not publish numeric edges. Edges below are stipulated so the post-2020 US period (TIPS at −1.1% trough) lands in DEEPLY_NEG, late-2022 (TIPS at +1.5%) lands in POSITIVE, and the long-run 2003–2019 median (~+0.6%) sits in MILDLY_POS.

| Bucket | Edge (on `r^mkt`, the 10-yr TIPS) |
|---|---|
| `DEEPLY_NEG` | < −0.5% |
| `MILDLY_NEG` | −0.5% to 0.0% |
| `NEUTRAL` | 0.0% to 0.5% |
| `MILDLY_POS` | 0.5% to 1.5% |
| `POSITIVE` | > 1.5% |

### 5.4 Monetary-vs-credit inflation separator

Monetary-driven inflation is defined as excess money growth over nominal GDP growth:

$$\mu_t = \underbrace{\tfrac{m2_t}{m2_{t-12}} - 1}_{m2\_yoy} \;-\; \underbrace{\tfrac{gdp\_ngdp_t}{gdp\_ngdp_{t-4}} - 1}_{ngdp\_yoy}$$

Credit-driven inflation is the residual that tracks with cycle position (owned by 1.2 — here we only flag it).

> **DERIVED (operational)** — Dalio distinguishes "credit creation" from "printing a lot of the currency in which the debt is denominated" (*BDC*, p. 39) but does not give a numeric edge for `μ`. Threshold `μ > 4%/yr sustained ≥ 4Q` is stipulated to match Dalio's archetypal "around 4 percent of GDP per year" money-printing pace (*BDC*, p. 34) — note Dalio's 4% is % GDP per year of NEW M0, while `μ` here is M2 y/y minus NGDP y/y, a looser but publicly observable proxy.

### 5.5 FX-depreciation and gold signal

$$\Delta FX^{12m}_t = \tfrac{usd\_broad_t}{usd\_broad_{t-12}} - 1$$

$$\Delta Gold^{12m}_t = \tfrac{gold\_pm_t}{gold\_pm_{t-12}} - 1$$

`DebaseFlag = 1` if `ΔFX^12m < −7%` **AND** `ΔGold^12m > +15%` over same 12-mo window.

> **DERIVED (operational)** — Dalio anchors gold + FX decline as the debasement pair (*BDC*, p. 34: "around 50 percent [FX decline] against gold") and names gold as the preferred store (*BDC*, p. 59); the 12-mo threshold pair stipulated here (−7% / +15%) is a working filter, not a Dalio number. It is calibrated so the 1971 (USD leaves gold), 2002, 2008, and 2020 episodes trigger, and 1995–1999 and 2014–2015 do not.

### 5.6 Regime classifier (the core output)

| Regime | Trigger |
|---|---|
| `DEFLATIONARY` | `π^hdln < 1%` AND `r^mkt > 0` AND `ΔGold^12m < 0` |
| `BEAUTIFUL` | `1% ≤ π^hdln ≤ 3%` AND `μ > 0` AND `r^mkt > 0` |
| `STAGFLATION` | `π^hdln > 3%` AND nominal GDP y/y < 2× `π^hdln` (i.e., real growth weak) |
| `INFLATIONARY` | `π^hdln > 4%` AND `r^mkt < 0` AND `DebaseFlag = 1` |

> **DERIVED (operational)** — Regime edges stipulated; Dalio provides the concept (Deflationary vs Inflationary depression) but not the numeric cuts. 3% CPI lower-edge for STAGFLATION matches Dalio's archetypal post-1970s band; 4% upper-edge for full INFLATIONARY matches *BDC* p. 34's "around 50%" FX move being bound to a CPI regime clearly above target. Non-reserve-currency countries collapse the INFLATIONARY trigger to `π^hdln > 6%` (lower bar) per *BDC* p. 40's "vulnerability" list.

## § 6 Output Variables & Decision Rules

Portfolio-tilt rules relative to All-Weather baseline (→ 2.2 owns the base weights). Internal-asset tilts MUST sum to 0; FX is an overlay.

| Regime | `GoldΔ` | `CommoditiesΔ` | `BondsΔ` | `CashΔ` | `FXShortΔ` |
|---|---|---|---|---|---|
| `DEFLATIONARY` | −2.5 pts | −2.5 pts | 0 | +5 pts | 0 |
| `BEAUTIFUL` | 0 | 0 | 0 | 0 | 0 |
| `STAGFLATION` | +5 pts | +5 pts | −5 pts | −5 pts | +5 pts long EUR/JPY vs USD (flip if USD debasing) |
| `INFLATIONARY` | +10 pts | +5 pts | −10 pts | −5 pts | +10 pts short the debasing currency |

Row sums (internal assets only, FX overlay excluded): −2.5 + −2.5 + 0 + 5 = 0 ✓ ; 0+0+0+0 = 0 ✓ ; 5+5+−5+−5 = 0 ✓ ; 10+5+−10+−5 = 0 ✓.

> **DERIVED (operational)** — Tilt magnitudes stipulated. Dalio endorses the direction (gold bigger, cash smaller, bonds worse during debasement; "cash is trash" framing) but does not publish a basis-point table. ±10 pts max deviation from AW gold baseline is stipulated to preserve the AW risk-parity structure (see 2.2, 2.4).

"Cash is trash" operational rule — tactical bond-vs-cash overlay:

> **Dalio** — "Paradigm Shifts," LinkedIn, 17 Jul 2019: "the cash returns provided to the owner are denominated in currencies that the central bank can 'print' so they can be depreciated in value when enough money is printed to hold interest rates significantly below inflation rates."

- If `r^mkt < 0` for ≥ 6 consecutive months → set `CashTrashFlag = 1`, rotate strategic cash into short-duration TIPS + gold.
- If `r^mkt > +1%` → reset flag; cash is competitive again.

## § 7 Worked Numeric Example

**Illustrative numbers, clearly labelled.** Post-pandemic snapshot, mocked to match 2022-Q2-ish readings, rounded to 1 dp. Not a live data pull.

**Inputs (illustrative):**
- `cpi_hdln_t / cpi_hdln_{t-12} − 1 = 8.5%` → `π^hdln = 8.5%`
- `cpi_core_t / cpi_core_{t-12} − 1 = 6.0%` → `π^core = 6.0%`
- `ust10 = 3.0%`, `tips10 = −0.5%` → `r^mkt = −0.5%`, `π^be = 3.5%`
- `m2_t / m2_{t-12} − 1 = 7.0%`; `gdp_ngdp_t / gdp_ngdp_{t-4} − 1 = 9.0%` → `μ = −2.0%`
- `usd_broad_t / usd_broad_{t-12} − 1 = +8.0%` → `ΔFX^12m = +8%` (stronger USD)
- `gold_pm_t / gold_pm_{t-12} − 1 = +1.5%` → `ΔGold^12m = +1.5%`

**Step-by-step:**

1. Real-rate bucket: `r^mkt = −0.5%` hits the boundary of `DEEPLY_NEG` / `MILDLY_NEG`; tie rule "≥ edge → upper bucket" → `MILDLY_NEG`. ✓
2. Monetary separator: `μ = 7.0 − 9.0 = −2.0%`. Below `+4%` threshold → credit-inflation, NOT monetary.
3. DebaseFlag: `ΔFX^12m = +8%` (USD stronger, fails `<−7%`) AND `ΔGold^12m = +1.5%` (fails `>+15%`). → `DebaseFlag = 0`.
4. Regime walk: `DEFLATIONARY` ✗ (π^hdln 8.5% fails <1%); `BEAUTIFUL` ✗ (fails ≤3%); `STAGFLATION` ✓ (π^hdln > 3% ✓ AND `9.0 < 17.0` ✓); `INFLATIONARY` ✗ (`DebaseFlag=0`). → **Regime = STAGFLATION**.
5. Tilts emitted per § 6 STAGFLATION row: `GoldΔ=+5`, `CommoditiesΔ=+5`, `BondsΔ=−5`, `CashΔ=−5`; `FXShortΔ=+5pt` long EUR/JPY (USD strengthening, debasing-currency leg inactive).
6. "Cash is trash": `r^mkt = −0.5%` for ≥ 6 mo → `CashTrashFlag = 1`; strategic cash rotates to short TIPS + gold.

**Arithmetic self-check (R14):** `π^be = 3.0 − (−0.5) = 3.5%` ✓ ; `μ = 7.0 − 9.0 = −2.0%` ✓ ; AW gold + commodities baseline `7.5 + 7.5 = 15.0%`, STAGFLATION tilt `+5 + 5 = +10` → new gold+commodities total = `25.0%` ✓ ; internal-asset tilt sum `5 + 5 + (−5) + (−5) = 0` ✓.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
async function classifyInflationRegime(asof) { /* → {regime, realRate, debase, cashTrash, tilts} */ }
const FRED = id => `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`;
const IDS = ['CPIAUCSL','CPILFESL','DFII10','DGS10','GOLDPMGBD228NLBM','DTWEXBGS','M2SL','GDP'];
const raw = await Promise.all(IDS.map(id => fetchCSV(FRED(id))));
const [cpi_h, cpi_c, tips10, ust10, gold, usd, m2, ngdp] = raw;
const pi_h  = pctChg12m(cpi_h);
const r_mkt = last(tips10);
const mu    = pctChg12m(m2) - pctChg4q(ngdp);
const dFX   = pctChg12m(usd);       // >0 = USD stronger
const dGold = pctChg12m(gold);
const debase = (dFX < -0.07 && dGold > 0.15) ? 1 : 0;
const regime = pickRegime({pi_h, r_mkt, debase, ngdp_yoy: pctChg4q(ngdp), mu});
return { regime, realRate: r_mkt, debase,
         cashTrash: (r_mkt < 0 && monthsNegative(tips10) >= 6),
         tilts: tiltMap[regime] };
```

### 8b. Excel — sheet layout, Power Query M, key formulas

Sheet `InputCSV`: one PQ tab per FRED ID. Template:

```m
let
  Src = Csv.Document(Web.Contents("https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL"),
                     [Delimiter=",", Encoding=65001]),
  Hdr = Table.PromoteHeaders(Src, [PromoteAllScalars=true]),
  Typed = Table.TransformColumnTypes(Hdr,
           {{"observation_date", type date},{"CPIAUCSL", type number}})
in Typed
```

Sheet `Calc` — cols A:DATE, B:`cpi_hdln`, D:`tips10`, E:`ust10`, F:`gold_pm`, G:`usd_broad`, H:`m2`, I:`gdp_ngdp`. Helpers (on last-row):

- `π^hdln`: `=B$L / INDEX(B:B, MATCH(EDATE(A$L,-12),A:A,0)) - 1`
- `r^mkt`: `=D$L` ;  `π^be`: `=E$L - D$L`
- `μ`: `=(H$L/INDEX(H:H,MATCH(EDATE(A$L,-12),A:A,0))-1) - (I$L/INDEX(I:I,MATCH(EDATE(A$L,-365),A:A,0))-1)`
- `ΔFX^12m`, `ΔGold^12m`: analogous; `DebaseFlag`: `=IF(AND(P<-0.07,Q>0.15),1,0)`
- `Regime`: nested `IF` matching § 5.6. Sheet `Tilt` VLOOKUPs § 6 table.

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
    { name: '10y TIPS, %',  gridIndex: 0, nameTextStyle: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#262626' } }, axisLabel: { color: '#F5F5F5' } },
    { name: 'ΔGold vs ΔUSD, %', gridIndex: 1, nameTextStyle: { color: '#A3A3A3' },
      splitLine: { lineStyle: { color: '#262626' } }, axisLabel: { color: '#F5F5F5' } }
  ],
  series: [
    { name: 'r_mkt (TIPS10)',  type: 'line', xAxisIndex: 0, yAxisIndex: 0,
      lineStyle: { color: '#00D08C', width: 2 }, areaStyle: { color: '#7FFFD4', opacity: 0.1 } },
    { name: 'π^hdln (y/y CPI)', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
      lineStyle: { color: '#D4A373', width: 2 } },
    { name: 'ΔGold^12m',   type: 'line', xAxisIndex: 1, yAxisIndex: 1,
      lineStyle: { color: '#00D08C', width: 2 } },
    { name: 'ΔUSD^12m',    type: 'line', xAxisIndex: 1, yAxisIndex: 1,
      lineStyle: { color: '#E5484D', width: 2 } }
  ],
  graphic: { elements: [
    { type: 'text', left: '70%', top: '2%',
      style: { text: 'Regime: STAGFLATION', fill: '#E5484D',
               font: 'bold 14px sans-serif' } } ] }
};
```

Data pulls for the chart use the same § 7 numbers in the "current" marker (π^hdln 8.5%, r_mkt −0.5%, ΔGold +1.5%, ΔUSD +8.0%) — numerically identical to § 7 per R14.

## § 9 Integration Points

- **Upstream:** § 2.3 "FX/Rates" alpha book supplies realised FX moves; § 1.3 Long-Term Debt Cycle supplies debt/GDP stress flags (used to widen the INFLATIONARY trigger when debt-service/GDP is also high); § 1.6 Changing World Order supplies reserve-currency-status binary (`rsv_status`) that relaxes/tightens the debase flag.
- **Downstream:** § 2.2 All-Weather consumes `RegimeTag` + tilts to shift the inflation-quadrant weighting (bond → gold → commodities gradient); § 2.5 Stress-Testing uses the `STAGFLATION` and `INFLATIONARY` regimes as two of its canonical scenarios; § 1.4 Deleveragings uses the `DebaseFlag` to tag which of its four levers (austerity / defaults / printing / redistribution) is currently dominant (printing = this module's trigger).

## § 10 Open Questions, Limitations, Sources

**Ambiguities (R5):**

1. Dalio's "around 4% of GDP per year" printing (*BDC* p. 34) refers to narrow-money crisis creation; `μ = m2_yoy − ngdp_yoy` is a broader, lower-frequency proxy. Fed H.4.1 balance-sheet reconciliation not wired; flagged.
2. Real-rate bucket edges (`<−0.5`, `0`, `+0.5`, `+1.5`) are DERIVED. Dalio says "significantly less than inflation rates" without numeric cut.
3. `DebaseFlag` 12-mo window + `−7%/+15%` pair is a working calibration, not Dalio-anchored. A 24-mo / `−15%/+30%` pair is a slower alternative.
4. Non-reserve `INFLATIONARY` lower-bar (6% vs 4% headline) stipulated; Dalio's vulnerability list (*BDC* p. 40) does not attach a rate cutoff.
5. `STAGFLATION` test `ngdp_yoy < 2 × π^hdln` is a monthly-frequency proxy for weak real growth; cleaner real-GDP cut introduces a calendar mismatch.

**Limitations:**

- US-centric. Extension requires national-CPI swap, bilateral REER, and relaxed reserve-currency test.
- `CashTrashFlag` is binary — hyperinflation territory (monthly π > 50%) is not triggered here; owned by 2.5 Stress.
- "Paradigm Shifts" (2019) gave the verbal gold-tilt argument; concrete position sizing is module extension, not Dalio's published numbers.

**Sources (all URLs opened and verified in-session, R11):**

- Ray Dalio, *Principles For Navigating Big Debt Crises*, Part 1, 2018. Mirror: https://www.librairi.com/images/principles-for-navigating-big-debt-crises-by-ray-dalio.pdf (pp. 14, 34, 39–40, 59).
- Ray Dalio, "Paradigm Shifts," LinkedIn, 17 Jul 2019. https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio . Verbatim archive: https://www.invest.nl/docs/pdf/Paradigm%20shifts%20Ray%20Dalio%202019-07.pdf .
- CNBC Davos "cash is trash" framing: https://www.cnbc.com/2020/01/21/ray-dalio-at-davos-cash-is-trash-as-everybody-wants-in-on-the-2020-market.html (WAF-blocked in session; cited as attribution anchor for the framing only, NOT as verbatim source — the verbatim analog used is the July 2019 Paradigm Shifts language).
- FRED (St. Louis Fed) series pages verified per R13: CPIAUCSL, CPILFESL, DFII10, DGS10, REAINTRATREARAT10Y, GOLDPMGBD228NLBM, DTWEXBGS, M2SL, GDP — all at `https://fred.stlouisfed.org/series/<ID>`.
- BLS CPI-U All Items: https://data.bls.gov/timeseries/CUUR0000SA0 .
- IMF COFER via DBnomics: https://api.db.nomics.world/v22/series/IMF/COFER/Q.W00.RAXGFX_USD_USD .
