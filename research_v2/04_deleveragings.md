# 1.4 Deleveragings

## § 1 Executive Summary

A deleveraging is operationally classifiable with four things only: debt-burden direction, nominal growth versus nominal interest, the inflation/real-growth mix, and whether currency weakness is carrying the adjustment. Dalio’s core test is simple: ugly deflationary deleveragings have rising debt ratios and nominal growth below nominal rates; beautiful deleveragings have falling debt ratios, positive real growth, and nominal growth above nominal rates; ugly inflationary deleveragings reduce debt mainly by inflation and devaluation. The executable framework below turns that verbal logic into formulas, rules, inputs, and worked case classifications. 

## § 2 Dalio's Framework — Verbatim

> **Dalio** — source: *An In-Depth Look at Deleveragings*, p. 1: "The differences between how deleveragings are resolved depend on the amounts and paces of 1) debt reduction, 2) austerity, 3) transferring wealth from the haves to the have-nots and 4) debt monetization." 

> **Dalio** — source: *An In-Depth Look at Deleveragings*, p. 2: "The right amounts are those that a) neutralize what would otherwise be a deflationary credit market collapse and b) get the nominal growth rate marginally above the nominal interest rate to tolerably spread out the deleveraging process." 

> **Dalio** — source: *An In-Depth Look at Deleveragings*, p. 3: "‘ugly deflationary deleveragings’ (which occurred before enough money was ‘printed’ and deflationary contractions existed and when nominal interest rates were above nominal growth rates)." 

> **Dalio** — source: *An In-Depth Look at Deleveragings*, p. 3: "‘beautiful deleveragings’ (those in which enough ‘printing’ occurred to balance the deflationary forces of debt reduction and austerity in a manner in which there is positive growth, a falling debt/income ratio and nominal GDP growth above nominal interest rates)." 

> **Dalio** — source: *How Countries Go Broke*, Part 1, printed p. 27: "In a typical deleveraging the debt-to-income ratio has the be lowered by roughly 50%, give or take about 20%." 

> **Dalio** — source: *How Countries Go Broke*, Part 2, printed p. 30: "Stage 7: Debts are restructured and devalued. When managed in the best possible way (what I call a beautiful deleveraging), the deflationary ways of reducing debt burdens (e.g., through debt restructurings) are balanced with the inflationary ways of reducing debt burdens (e.g., by monetizing them) so that the deleveraging occurs without having unacceptable amounts of either deflation or inflation." 

## § 3 Decision Problem

This section answers one portfolio-manager question only: **given that upstream cycle work has already determined that a deleveraging is underway, what type of deleveraging is it now, what phase is it in now, and what hard data will show that it has improved, deteriorated, or completed?** Dalio’s framework supplies the governing causal logic and the admissible policy levers; the task here is to convert that into an executable tagging engine. 

The output of this section is not a portfolio. It is a regime label and a phase-transition map: `UDEF` for ugly deflationary deleveraging, `BDEL` for beautiful deleveraging, `UINF` for ugly inflationary deleveraging, and `POST` for post-deleveraging re-equilibrium. Those tags feed later sections that own inflation-regime interpretation, paradigm-shift analysis, and portfolio construction. 

## § 4 Input Variables Table

> **NON-DALIO (industry standard)** — source: official public data series pages listed in the table and in §10 Sources. Used to close the live-data plumbing gap because Dalio explains the framework and publishes historical case data, but he does not publish a maintained public API for day-to-day implementation. The table therefore uses official public macro series for a U.S. reference implementation. For non-U.S. deployment, keep the same variable names and swap in the country-equivalent official series from the same institutions where available. 

| name | description | unit | data source | API endpoint / dataset ID | update frequency | typical range |
|---|---|---:|---|---|---|---|
| `ngdp_us` | Nominal GDP; market value of all final goods and services produced in the U.S.  | USD bn | FRED, source BEA | `series_id=GDP`; `https://api.stlouisfed.org/fred/series/observations?series_id=GDP` | quarterly | history-dependent |
| `rgdp_us` | Real GDP; inflation-adjusted output.  | chain-weighted USD bn | FRED, source BEA | `series_id=GDPC1`; `https://api.stlouisfed.org/fred/series/observations?series_id=GDPC1` | quarterly | history-dependent |
| `gdpdef_us` | GDP implicit price deflator; economy-wide price level for GDP.  | index | FRED, source BEA | `series_id=GDPDEF`; `https://api.stlouisfed.org/fred/series/observations?series_id=GDPDEF` | quarterly | history-dependent |
| `ust10y` | 10-year Treasury constant-maturity yield; long nominal sovereign rate proxy.  | % p.a. | FRED, source Board of Governors | `series_id=DGS10`; `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10` | daily | history-dependent |
| `ust3m` | 3-month Treasury bill secondary-market rate; short nominal sovereign rate proxy.  | % p.a. | FRED, source Board of Governors | `series_id=TB3MS`; `https://api.stlouisfed.org/fred/series/observations?series_id=TB3MS` | monthly | history-dependent |
| `debt_nf_us` | Total credit to the non-financial sector; BIS-based broad debt-burden proxy. FRED notes the series measures outstanding credit from domestic banks, all other sectors, and non-residents.  | % of GDP | FRED, source BIS Credit to Non-Financial Sector | `series_id=QUSCAM770A`; `https://api.stlouisfed.org/fred/series/observations?series_id=QUSCAM770A` | quarterly | history-dependent |
| `debt_pnfs_us` | Total credit to the private non-financial sector; household plus non-financial corporate credit burden.  | % of GDP | FRED, source BIS Credit to Non-Financial Sector | `series_id=CRDQUSAPABIS`; `https://api.stlouisfed.org/fred/series/observations?series_id=CRDQUSAPABIS` | quarterly | history-dependent |
| `fed_assets` | Federal Reserve total assets; balance-sheet expansion proxy for monetization.  | USD mn | FRED, source Board of Governors H.4.1 | `series_id=WALCL`; `https://api.stlouisfed.org/fred/series/observations?series_id=WALCL` | weekly | history-dependent |
| `feddebt_gdp` | Federal debt as percent of GDP; sovereign debt-burden series built by St. Louis Fed from OMB debt data and GDP.  | % of GDP | FRED, source OMB + St. Louis Fed formula | `series_id=GFDEGDQ188S`; `https://api.stlouisfed.org/fred/series/observations?series_id=GFDEGDQ188S` | quarterly | history-dependent |
| `usd_broad` | Nominal broad U.S. dollar index; trade-weighted FX-strength proxy. For non-U.S. deployment, replace with local-currency NEER or the local currency per USD.  | index | FRED, source Board of Governors H.10 | `series_id=DTWEXBGS`; `https://api.stlouisfed.org/fred/series/observations?series_id=DTWEXBGS` | daily | history-dependent |
| `stdebt_reserves` | Short-term debt as a percent of total reserves; external-funding stress proxy for non-reserve-currency cases. World Bank notes the debt is reported in repayment currency and compiled in U.S. dollars.  | % | World Bank WDI / IDS | `indicator=DT.DOD.DSTC.IR.ZS`; `https://api.worldbank.org/v2/country/{country}/indicator/DT.DOD.DSTC.IR.ZS?format=json&per_page=20000` | annual | history-dependent |

## § 5 Computation / Transformations

> **DERIVED (operational)** — Dalio gives the direction-of-travel logic and the case-table anatomy, not a turnkey daily formula sheet. The project therefore turns his verbal conditions into a small set of Boolean and arithmetic transforms, without importing non-Dalio macro theory. The formulas below are anchored to Dalio’s recurring criteria: debt burden direction, nominal growth versus nominal interest, positive versus negative real growth, and inflationary versus deflationary composition. 

### Debt-burden proxy

> **DERIVED (operational)** — why this calibration: Dalio alternates between “debt/income” language and debt-as-a-percent-of-GDP case tables. For executable public implementation, `debt/GDP` is the correct proxy because Dalio’s own 2012 case panels are presented that way. 

\[
d_t=\frac{\text{Debt}_t}{\text{Nominal GDP}_t}
\]

Use `debt_nf_us` for economy-wide tagging, `debt_pnfs_us` for private-sector deleveraging, and `feddebt_gdp` for sovereign-only cross-checks. 

### Debt-direction transform

\[
\Delta d_t = d_t-d_{t-4}
\]

Interpretation: a deleveraging that is still getting worse has \(\Delta d_t>0\); a deleveraging that is actually reducing the burden has \(\Delta d_t<0\). That is exactly how Dalio separates ugly deflationary cases from beautiful ones. 

### Carry gap

\[
CG_t = y^{N}_t - i^{LT}_t
\]

where \(y^{N}_t\) is year-over-year nominal GDP growth and \(i^{LT}_t\) is the average long nominal sovereign yield over the same window.

> **Dalio** — source: *An In-Depth Look at Deleveragings*, p. 2: "get the nominal growth rate marginally above the nominal interest rate" 

Operational meaning: `CG_t > 0` is a necessary condition for `BDEL`; `CG_t < 0` is a sufficient warning that the debt burden will not fall cleanly unless defaults or inflation do the work. 

### Real-growth flag

\[
RG_t = \mathbf{1}\{y^{R}_t>0\}
\]

Dalio’s beautiful deleveraging requires positive growth; ugly deflationary deleveragings feature negative or weak real activity. 

### Inflation-dominance transform

\[
ID_t = \mathbf{1}\{\pi_t > y^{R}_t\}
\]

where \(\pi_t\) is GDP-deflator inflation.

> **DERIVED (operational)** — why this calibration: Dalio defines ugly inflationary deleveragings as cases in which nominal growth comes "through monetary inflation." He does not publish a universal CPI threshold. The project therefore uses the composition test `inflation > real growth`, which is directly aligned with his wording and works off public data. 

### FX-weakness flag

\[
FXW_t = \mathbf{1}\{\Delta FX_t<0\}
\]

where `FX` is the local-currency external value versus a hard-money or external benchmark. For the U.S. reference implementation, use the inverse of `usd_broad`; for non-U.S. deployment, use NEER or local currency per USD.

> **DERIVED (operational)** — why this calibration: Dalio repeatedly treats devaluation/currency weakness as the inflationary transmission channel. He does not impose one canonical benchmark across all countries. The project therefore uses a sign test on an external-value proxy. 

### Deleveraging completion drawdown

\[
DD_t=\frac{d_{\text{peak}}-d_t}{d_{\text{peak}}}
\]

> **Dalio** — source: *How Countries Go Broke*, Part 1, printed p. 27: "In a typical deleveraging the debt-to-income ratio has the be lowered by roughly 50%, give or take about 20%." 

> **DERIVED (operational)** — what the project chose: use `0.30` as the lower bound for a completed deleveraging drawdown because Dalio’s own range implies a 30%–70% debt-burden reduction band. The engine uses the lower bound for a `POST` candidate and keeps 50% as the midpoint reference, not as a hard gate. 

## § 6 Output Variables & Decision Rules

### Regime tag `UDEF`

> **DERIVED (operational)** — Dalio anchor: ugly deflationary deleveragings occur when money printing is insufficient, nominal growth is below nominal rates, and the debt ratio rises. The project encodes that literally. 

Assign `UDEF` if all three hold:

\[
CG_t < 0,\quad \Delta d_t > 0,\quad y^R_t \le 0
\]

Analytical action: treat the episode as still in the contraction-and-cleanup phase; do **not** call the bottom merely because assets rally. Dalio’s 2009 CFA article explicitly warns that bear-market rallies can occur before the fundamental imbalance is eliminated. 

### Regime tag `BDEL`

> **DERIVED (operational)** — Dalio anchor: beautiful deleveraging requires positive growth, a falling debt ratio, and nominal GDP growth above nominal interest rates. The project adds a guardrail excluding inflation-dominant currency-led episodes. 

Assign `BDEL` if all four hold:

\[
CG_t > 0,\quad \Delta d_t < 0,\quad y^R_t > 0,\quad \neg(ID_t \land FXW_t)
\]

Analytical action: classify the deleveraging as balanced between deflationary and inflationary levers; monitor for slippage to `UINF` if inflation and currency weakness take over. 

### Regime tag `UINF`

> **DERIVED (operational)** — Dalio anchor: ugly inflationary deleveragings occur when printing/devaluation are large relative to the deflationary forces and nominal growth comes through monetary inflation. Because Dalio does not give a universal printed numerical rate threshold, the project uses composition and FX direction instead of an arbitrary CPI number. 

Assign `UINF` if both hold and `UDEF` does not hold:

\[
\Delta d_t \le 0,\quad ID_t = 1,\quad FXW_t = 1
\]

Analytical action: escalate immediately to subsection 1.7 for inflation-and-debasement diagnostics; keep this subsection’s job limited to tagging the deleveraging type. 

### Regime tag `POST`

> **DERIVED (operational)** — Dalio anchor: the crisis recedes when a new equilibrium is reached and the debt burden has been reduced materially; his typical debt-burden reduction band is 50% ± 20%. The project uses the lower bound as the executable minimum. 

Assign `POST` if all three hold:

\[
DD_t \ge 0.30,\quad CG_t \ge 0,\quad y^R_t \ge 0
\]

Analytical action: hand control back to the normal long-cycle framework in subsection 1.3 and, where relevant, to 1.5 and 1.7. 

### Phase-transition rules

> **DERIVED (operational)** — Dalio anchor: his archetype runs from ugly deflationary contraction to balanced restructuring/devaluation, then to extraordinary policy steps, then to a new equilibrium. The project turns that sequence into crossing rules. 

Use these transitions:

1. `UDEF → BDEL` on the first observation where \(CG_t\) flips negative-to-positive and \(\Delta d_t\) flips positive-to-negative. 
2. `BDEL → UINF` on the first observation where \(ID_t\) and \(FXW_t\) are both true while \(\Delta d_t \le 0\). 
3. `any deleveraging tag → POST` on the first observation where \(DD_t \ge 0.30\), \(CG_t \ge 0\), and \(y^R_t \ge 0\). 

## § 7 Worked Numeric Example

The example below is a **Dalio historical calibration panel**, not a live nowcast. Every number comes directly from Dalio’s public case tables or case text so the arithmetic can be checked exactly at source. 

| case | period | start debt % GDP | end debt % GDP | Δ debt pp | nominal growth % | real growth % | avg govt yield % | carry gap pp | FX / money signal | tag |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| U.S. Great Depression | 1930–1932 | 155 | 252 | +97 | -17.0 | -9.0 | 3.4 | -20.4 | dollar strong vs gold; no material printing | `UDEF` |
| U.S. reflation | 1933–1937 | 252 | 168 | -84 | 9.2 | 7.2 | 2.9 | +6.3 | dollar devalued 40% vs gold in 1933 | `BDEL` |
| Weimar Germany | 1919–1923 | 913 | 0 | -913 | n/a in summary table | weak economy with hyperinflation | n/a | n/a | FX vs gold -100%; M0 +1.2 trillion % | `UINF` |

Sources: Dalio case-table values and case narration. 

### Row-by-row execution

**U.S. 1930–1932**

\[
\Delta d = 252-155 = +97
\]

\[
CG = -17.0 - 3.4 = -20.4
\]

Real growth is \(-9.0\%\). All three `UDEF` conditions hold: \(CG<0\), \(\Delta d>0\), and \(y^R\le 0\). Classification: `UDEF`. Dalio himself labels this first phase the "ugly deflationary depression" in the same case discussion. 

**U.S. 1933–1937**

\[
\Delta d = 168-252 = -84
\]

\[
CG = 9.2 - 2.9 = +6.3
\]

Real growth is \(+7.2\%\). Inflation is \(2.0\%\), which is below real growth, so `ID=0`. The debt ratio falls, growth is positive, and nominal growth exceeds nominal rates. Classification: `BDEL`. This is exactly Dalio’s own beautiful-deleveraging template. 

Debt-drawdown check:

\[
DD = \frac{252-168}{252} = \frac{84}{252} = 0.3333 = 33.33\%
\]

That exceeds the lower operational completion bound of 30%. Mechanically, the case qualifies as at least a `POST` candidate on debt-burden reduction grounds. The framework keeps the case tagged as `BDEL` here because the purpose of the row is archetype classification, not to settle the separate question of durable cycle completion after the 1937 tightening. 

**Weimar Germany 1919–1923**

\[
\Delta d = 0-913 = -913
\]

Dalio’s case summary gives a currency collapse versus gold of \(-100\%\), money-base growth of \(1.2\) trillion percent, default on reparations of \(-780\%\) of GDP, and local-currency debt inflated away by \(-133\%\) of GDP. By Dalio’s own archetype language, that is an ugly inflationary deleveraging. Arithmetic self-check: \(-780)+(-133)=-913\), which exactly equals the total debt reduction shown in the table. Classification: `UINF`. 

### Arithmetic self-check per R14

The worked-example arithmetic holds exactly at the precision shown:

- U.S. 1930–1932: \(252-155=97\); \(-17.0-3.4=-20.4\). 
- U.S. 1933–1937: \(168-252=-84\); \(9.2-2.9=6.3\); \(84/252=0.3333\). 
- Weimar 1919–1923: \(-780)+(-133)=-913\). 

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

> **NON-DALIO (industry standard)** — source: official FRED and World Bank API documentation/pages cited in §4 and §10. Used to close the live-fetch implementation gap because Dalio publishes framework logic, not a maintained code interface. 

```js
/**
 * Classify a deleveraging episode.
 * Inputs are already aligned to year-over-year or trailing-4Q frequency.
 */
function classifyDeleveraging({
 debtRatioNow, // d_t
 debtRatioPrevYear, // d_{t-4}
 debtRatioPeak, // d_peak
 nominalGrowth, // yN_t
 realGrowth, // yR_t
 inflation, // pi_t
 longRate, // iLT_t
 fxNow, // FX_t
 fxPrevYear // FX_{t-4}
}) {
 const deltaDebt = debtRatioNow - debtRatioPrevYear;
 const carryGap = nominalGrowth - longRate;
 const drawdown = (debtRatioPeak - debtRatioNow) / debtRatioPeak;
 const inflationDominant = inflation > realGrowth;
 const fxWeak = (fxNow - fxPrevYear) < 0;

 if (carryGap < 0 && deltaDebt > 0 && realGrowth <= 0) return "UDEF";
 if (deltaDebt <= 0 && inflationDominant && fxWeak) return "UINF";
 if (carryGap > 0 && deltaDebt < 0 && realGrowth > 0 && !(inflationDominant && fxWeak)) return "BDEL";
 if (drawdown >= 0.30 && carryGap >= 0 && realGrowth >= 0) return "POST";
 return "UNRESOLVED_WITHIN_SCOPE";
}
```

Reference fetch URLs for the U.S. deployment:

```txt
FRED GDP:
https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=YOUR_KEY&file_type=json

FRED GDPC1:
https://api.stlouisfed.org/fred/series/observations?series_id=GDPC1&api_key=YOUR_KEY&file_type=json

FRED GDPDEF:
https://api.stlouisfed.org/fred/series/observations?series_id=GDPDEF&api_key=YOUR_KEY&file_type=json

FRED DGS10:
https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=YOUR_KEY&file_type=json

FRED QUSCAM770A:
https://api.stlouisfed.org/fred/series/observations?series_id=QUSCAM770A&api_key=YOUR_KEY&file_type=json

FRED CRDQUSAPABIS:
https://api.stlouisfed.org/fred/series/observations?series_id=CRDQUSAPABIS&api_key=YOUR_KEY&file_type=json

FRED DTWEXBGS:
https://api.stlouisfed.org/fred/series/observations?series_id=DTWEXBGS&api_key=YOUR_KEY&file_type=json

World Bank short-term debt / reserves:
https://api.worldbank.org/v2/country/{country}/indicator/DT.DOD.DSTC.IR.ZS?format=json&per_page=20000
```

Execution order:

1. Pull debt, GDP, deflator, rates, and FX.
2. Resample all series to quarterly end dates.
3. Compute \(y^N_t\), \(y^R_t\), \(\pi_t\), \(CG_t\), \(\Delta d_t\), and \(DD_t\).
4. Apply rules in this exact order: `UDEF`, `UINF`, `BDEL`, `POST`.
5. Emit both the tag and the underlying fields; never emit a tag without the raw metrics that produced it.

### 8b. Excel — sheet layout, Power Query M or URL, key formulas

Sheet layout:

- `raw_gdp`
- `raw_rgdp`
- `raw_deflator`
- `raw_rates`
- `raw_debt`
- `calc`
- `dashboard`

Power Query source examples:

```txt
https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=YOUR_KEY&file_type=json
https://api.stlouisfed.org/fred/series/observations?series_id=GDPC1&api_key=YOUR_KEY&file_type=json
https://api.stlouisfed.org/fred/series/observations?series_id=GDPDEF&api_key=YOUR_KEY&file_type=json
https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=YOUR_KEY&file_type=json
https://api.stlouisfed.org/fred/series/observations?series_id=QUSCAM770A&api_key=YOUR_KEY&file_type=json
https://api.stlouisfed.org/fred/series/observations?series_id=DTWEXBGS&api_key=YOUR_KEY&file_type=json
```

Key `calc` formulas, assuming row `t` and four-quarter lag in row `t-4`:

```excel
NominalGrowth = (GDP_t / GDP_t-4) - 1
RealGrowth = (RGDP_t / RGDP_t-4) - 1
Inflation = (GDPDEF_t / GDPDEF_t-4) - 1
CarryGap = NominalGrowth - LTYield_t
DeltaDebt = DebtRatio_t - DebtRatio_t-4
Drawdown = (DebtPeak - DebtRatio_t) / DebtPeak
InflDominant = IF(Inflation > RealGrowth,1,0)
FXWeak = IF(FX_t < FX_t-4,1,0)

Tag = IF(AND(CarryGap<0,DeltaDebt>0,RealGrowth<=0),"UDEF",
 IF(AND(DeltaDebt<=0,InflDominant=1,FXWeak=1),"UINF",
 IF(AND(CarryGap>0,DeltaDebt<0,RealGrowth>0,NOT(AND(InflDominant=1,FXWeak=1))),"BDEL",
 IF(AND(Drawdown>=0.30,CarryGap>=0,RealGrowth>=0),"POST","UNRESOLVED_WITHIN_SCOPE"))))
```

### 8c. ECharts config — chart type, encoding, palette tokens

Use one dual-axis line chart for regime diagnostics and one bar chart for Dalio-style debt-burden attribution.

Allowed palette tokens only:

- `#0B0B0B` bg-canvas
- `#141414` bg-surface
- `#1C1C1C` bg-elevated
- `#080808` bg-inset
- `#262626` hairline
- `#F5F5F5` text-primary
- `#A3A3A3` text-secondary
- `#6B7280` text-tertiary
- `#00D08C` green-core
- `#7FFFD4` green-glow
- `#E5484D` signal-red
- `#D4A373` warm-accent

Config requirements:

```js
const palette = {
 bgCanvas: "#0B0B0B",
 bgSurface: "#141414",
 bgElevated: "#1C1C1C",
 bgInset: "#080808",
 hairline: "#262626",
 textPrimary: "#F5F5F5",
 textSecondary: "#A3A3A3",
 textTertiary: "#6B7280",
 greenCore: "#00D08C",
 greenGlow: "#7FFFD4",
 signalRed: "#E5484D",
 warmAccent: "#D4A373"
};
```

Chart A: line chart

- x-axis: date
- y-axis left: `debtRatio`
- y-axis right: `carryGap`
- series 1: debt ratio in `#F5F5F5`
- series 2: carry gap in `#00D08C` when positive, `#E5484D` when negative
- background: `#0B0B0B`
- grid/border: `#262626`

Chart B: stacked bar chart

- x-axis: case or quarter
- bars: `realGrowth`, `inflation`, `defaults`, `interestPayments`, `newBorrowing`
- negative deleveraging contributors: `#00D08C`
- positive burden adders: `#E5484D`
- annotation line: total change in debt ratio in `#D4A373`

The chart data for the historical panel in §7 must equal the same numbers used in the table: `+97`, `-84`, and `-913` debt-ratio changes; `-20.4` and `+6.3` carry gaps. 

## § 9 Integration Points

Upstream dependency: this subsection consumes only the output of subsections 1.2 and 1.3 that already established **that** a deleveraging has begun. It does **not** re-derive the start-of-deleveraging signal; that belongs to those sections. Downstream consumers: subsection 1.7 consumes the `UINF` handoff whenever inflation and devaluation dominate; subsection 1.5 consumes persistent `POST` outcomes that stabilize into a new macro order; Module 2 consumes the regime tag only after those downstream sections finish their own scope-owned work. 

## § 10 Limitations & Sources

### Limitations / design choices

1. **Debt/GDP as the executable debt-burden proxy** — closed in §5 “Debt-burden proxy.” Dalio’s prose often says debt/income, but his public deleveraging case panels use debt as a percent of GDP, so the implementation does the same. Closure lives at §5 under the `DERIVED (operational)` marker. 

2. **No hard CPI threshold for `UINF`** — closed in §5 “Inflation-dominance transform” and §6 “Regime tag `UINF`.” Dalio describes inflationary deleveragings compositionally, not with one universal CPI number. The implementation therefore uses `inflation > real growth` plus FX weakness rather than an invented CPI cutoff. Closure lives at those body locations under `DERIVED (operational)`. 

3. **Completion threshold uses the lower edge of Dalio’s typical drawdown band** — closed in §5 “Deleveraging completion drawdown” and §6 `POST`. Dalio gives 50% ± 20%; the implementation uses 30% as the minimum executable completion boundary and keeps 50% as the midpoint reference. 

4. **Live implementation uses non-Dalio official data plumbing** — closed in §4 and §8 under `NON-DALIO (industry standard)`. Dalio does not publish a public data API for current inputs, so the implementation uses official public FRED and World Bank series. 

5. **U.S. reference deployment in the input table** — closed in §4. The framework logic is generic, but the concrete API wiring is U.S.-first because those official public identifiers were fully verified in-session. The formula layer remains country-agnostic. 

### Sources

- Ray Dalio, *An In-Depth Look at Deleveragings* (February 2012), public PDF mirror on HOLD. Public-access checked. URL: `https://hold.hu/holdblog/wp-content/uploads/2012/03/an-in-depth-look-at-deleveragings--ray-dalio-bridgewater.pdf`
- Ray Dalio, *A Two-Part Look at: 1. Principles for Navigating Big Debt Crises, and 2. How They Apply to What’s Happening Now* (LinkedIn, Jan. 5, 2023). Public-access checked. URL: `https://www.linkedin.com/pulse/two-part-look-1-principles-navigating-big-debt-crises-ray-dalio`
- Ray Dalio, *How Countries Go Broke*, Part 1 (economicprinciples.org public PDF). Public-access checked. URL: `https://www.economicprinciples.org/downloads/how-countries-go-broke-part-1.pdf`
- Ray Dalio, *How Countries Go Broke*, Part 2 (economicprinciples.org public PDF). Public-access checked. URL: `https://economicprinciples.org/downloads/how-countries-go-broke-part-2.pdf`
- Ray Dalio, *How Countries Go Broke*, Part 3 (economicprinciples.org public PDF). Public-access checked. URL: `https://economicprinciples.org/downloads/how-countries-go-broke-part-3.pdf`
- Ray Dalio, *A Template for Understanding What Is Going On*, in CFA Institute, *Insights into the Global Financial Crisis* (public PDF). Public-access checked. URL: `https://www.cfainstitute.org/sites/default/files/-/media/documents/book/rf-publication/2009/rf-v2009-n5-18-pdf.pdf`
- BIS, *Credit to the non-financial sector - overview*. Public-access checked. URL: `https://www.bis.org/statistics/totcredit.htm`
- BIS Data Portal, *Credit to the non-financial sector - data*. Public-access checked. URL: `https://data.bis.org/topics/TOTAL_CREDIT/data`
- BIS Data Portal, *Debt service ratios - overview*. Public-access checked. URL: `https://data.bis.org/topics/DSR`
- FRED, *Gross Domestic Product (GDP)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/GDP`
- FRED, *Real Gross Domestic Product (GDPC1)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/GDPC1`
- FRED, *Gross Domestic Product: Implicit Price Deflator (GDPDEF)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/GDPDEF`
- FRED, *Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity (DGS10)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/DGS10`
- FRED, *3-Month Treasury Bill Secondary Market Rate, Discount Basis (TB3MS)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/TB3MS`
- FRED, *Total Credit to Non-Financial Sector, Adjusted for Breaks, for United States (QUSCAM770A)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/QUSCAM770A`
- FRED, *Total Credit to Private Non-Financial Sector, Adjusted for Breaks, for United States (CRDQUSAPABIS)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/CRDQUSAPABIS`
- FRED, *Assets: Total Assets: Total Assets (Less Eliminations from Consolidation): Wednesday Level (WALCL)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/WALCL`
- FRED, *Federal Debt: Total Public Debt as Percent of Gross Domestic Product (GFDEGDQ188S)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/GFDEGDQ188S`
- FRED, *Nominal Broad U.S. Dollar Index (DTWEXBGS)*. Public-access checked. URL: `https://fred.stlouisfed.org/series/DTWEXBGS`
- World Bank, *About the Indicators API Documentation*. Public-access checked. URL: `https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation`
- World Bank Data, *Short-term debt (% of total reserves) (DT.DOD.DSTC.IR.ZS)*. Public-access checked. URL: `https://data.worldbank.org/indicator/DT.DOD.DSTC.IR.ZS`
- World Bank Data, *Total reserves in months of imports (FI.RES.TOTL.MO)*. Public-access checked. URL: `https://data.worldbank.org/indicator/FI.RES.TOTL.MO`

## § 11 Completeness Self-Audit

| Gap | Dalio sources searched | Keywords / phrases tried | Hits found in Dalio corpus | Closure outcome | Body location |
|---|---|---|---|---|---|
| Exact list of deleveraging levers | 2012 *In-Depth Look*; LinkedIn Jan 2023; HCG Part 1 | `debt reduction austerity transferring wealth debt monetization`; `four types of levers` | 2012 paper p.1 names all four; LinkedIn lines 90-95 repeats them | Dalio anchor (cite at §2, §5) | §2, §5 |
| Executable test for beautiful deleveraging | 2012 *In-Depth Look*; LinkedIn Jan 2023; HCG Part 1 | `beautiful deleveraging nominal growth above nominal interest`; `positive growth falling debt ratio` | 2012 paper p.2-3 and LinkedIn lines 106-108 / 114-116 | Dalio anchor (cite at §2, §6) | §2, §6 |
| Executable test for ugly deflationary deleveraging | 2012 *In-Depth Look*; CFA 2009 article | `ugly deflationary deleveraging`; `nominal interest rates above nominal growth rates`; `debt ratio rose` | 2012 paper p.3 gives the exact verbal conditions | Dalio anchor (cite at §2, §6) | §2, §6 |
| Executable test for ugly inflationary deleveraging | 2012 *In-Depth Look*; CFA 2009 article | `ugly inflationary deleveraging`; `nominal growth through monetary inflation`; `currency devaluation` | 2012 paper p.2 and p.5 gives the archetype, but no universal CPI threshold | DERIVED at §5-§6 (no industry standard applies because Dalio gives composition, not one numeric CPI cutoff) | §5, §6 |
| Whether deleveraging type is governed by money creation versus contracting credit | CFA 2009 article; HCG Part 1; LinkedIn Jan 2023 | `what determines whether deleveraging is deflationary or inflationary` | CFA article p.105: type depends on extent central banks create money to negate contracting credit | Dalio anchor (cite at §5) | §5 |
| Whether debt-burden reduction must exceed a threshold to call completion | HCG Part 1; 2012 *In-Depth Look*; LinkedIn Jan 2023 | `typical deleveraging 50 give or take 20`; `debt to income ratio lowered` | HCG Part 1 printed p.27 gives 50% ± 20% | Dalio anchor plus DERIVED lower-bound choice at §5 | §5, §6 |
| Using debt/GDP instead of debt/income in live code | 2012 *In-Depth Look*; HCG Parts 1-3 | `debt % gdp`; `debt income ratio` | Dalio uses debt/GDP in case tables while speaking of debt/income conceptually | DERIVED at §5 (no industry standard gap; project picks the public-data-compatible Dalio proxy) | §5 |
| Turning phase language into crossing rules | 2012 *In-Depth Look*; HCG Part 2 | `first phase second phase`; `stages 7-9`; `new equilibrium` | Dalio provides ordered phases but not code-ready crossing rules | DERIVED at §6 (no industry standard applies because the gap is coding logic, not macro theory) | §6 |
| Public live macro data source for GDP, deflator, rates, debt, FX | BDC-related public corpus; HCG Parts 1-3; LinkedIn; 2012 paper | `api`; `data source`; `series` | no Dalio-maintained public API | NON-DALIO at §4 citing FRED and World Bank official series pages | §4 |
| Public official series ID for U.S. total non-financial debt burden | HCG corpus; 2012 paper | `total credit non-financial sector`; `BIS debt series` | Dalio cites broad debt burdens but no public maintained series ID | NON-DALIO at §4 citing FRED `QUSCAM770A` / BIS release page | §4 |
| Public official series ID for U.S. private non-financial debt burden | HCG corpus; 2012 paper | `private non-financial debt`; `household corporate credit` | no Dalio-maintained public series ID | NON-DALIO at §4 citing FRED `CRDQUSAPABIS` | §4 |
| Public official external-stress proxy for foreign-currency cases | HCG Part 2; 2012 *In-Depth Look* | `foreign currency denominated debts`; `reserves`; `capital controls` | Dalio explains the logic qualitatively, but does not publish one maintained public metric page | NON-DALIO at §4 citing World Bank `DT.DOD.DSTC.IR.ZS` | §4 |
| Arithmetic decomposition components for debt-ratio change | 2012 *In-Depth Look* | `real growth inflation defaults interest payments new borrowing above interest payments` | 2012 paper p.3-5 defines the decomposition bars directly | Dalio anchor (cite at §5, §7) | §5, §7 |

All ambiguities listed above are closed in the body per R5. The output contains zero open questions.