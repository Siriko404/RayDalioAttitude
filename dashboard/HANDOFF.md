# HANDOFF — Engine → UI/UX Design

You're inheriting a complete analytical engine that produces a fully-populated
data payload + 13 registered slide modules. **Your job is the visual layer:**
typography, layout, animations, chart treatments, micro-interactions.

This document is the contract you can rely on. The engine is stable; the design
is open.

---

## 1. Get running in 30 seconds

```bash
cd dashboard
npm install
VITE_DESIGN_MODE=1 npm run dev
```

→ http://localhost:5173 boots with a fully-populated **Apr-2026 mock snapshot**.
No Cloudflare Worker, no FRED API key, no network. Every slide renders with
realistic computed values — perfect for design iteration.

URL override (no env var needed): `http://localhost:5173/?mock=1`

When you want the real backend: omit `VITE_DESIGN_MODE`, deploy the Worker
(`npm --workspace backend run deploy`), set `FRED_API_KEY` secret, point Vite at
the worker URL.

---

## 2. Architecture (one diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│  bootstrap()                          src/main.js               │
│   ├─ isMobileBlocked() → mobile splash + exit                  │
│   ├─ loadWizard() → if saved, runDashboard()                   │
│   └─ renderWelcome → T1 → T2/T3 → saveWizard → runDashboard()  │
│                                                                 │
│  runDashboard()                                                 │
│   ├─ fetchAll()                       src/core/fetch.js         │
│   │   └─ design mode: MOCK_PAYLOAD                             │
│   │   └─ live mode:   GET /api/fetch-all (Cloudflare Worker)   │
│   ├─ runComputePipeline(data, wizard)  src/core/compute-pipeline│
│   │   └─ writes payload.computedXxx for all 13 frameworks       │
│   ├─ renderAll(slidesContainer)       src/core/render.js        │
│   │   └─ each registered slide.render(section, { payload })     │
│   ├─ renderNavBar + bindProximity + bindScrollspy + clickScroll │
│   ├─ bindSlideReveals — IntersectionObserver AF reveals         │
│   └─ observeEmittingSlides — chip strip fill-on-scroll          │
└─────────────────────────────────────────────────────────────────┘
```

**One semantic flow** per page load, **one fetch**, **one compute pass**, **N slide
renders** consuming from the same `payload` object.

---

## 3. The payload contract

After `runComputePipeline()`, `payload` carries every value any slide will
read. Shape (with realistic mock values from Apr-2026 INFLATIONARY-regime fixture):

### `payload.fetched_at_utc`
ISO timestamp shown in the chip-strip eyebrow. e.g. `"2026-04-30T14:32:00Z"`.

### `payload.sources.{fred,bis,cofer,wb_wdi,damodaran,shiller,yardeni,nber,nyfed}`
Raw data passthrough. Slides may read directly for chart histograms (e.g.
`slide-1-5` reads `damodaran.histretSP` for the 50-yr SP500 returns line). Most
slides should consume `payload.computedXxx` instead — sources are the source-of-truth
fallback.

### `payload.computedEconMachine` — 1.1 Economic Machine
```
{
  gap_regime:         'ABOVE_TREND' | 'ON_TREND' | 'BELOW_TREND',
  credit_mix_regime:  'CREDIT_DRIVEN' | 'MIXED' | 'MONEY_DRIVEN',
  debt_money_regime:  'LOW' | 'ELEVATED' | 'HIGH',
  trend_growth_pct:   number,    // e.g. 1.95
  gap_pct:            number,    // e.g. -0.43
  sC:                 number,    // credit share 0-1
  R_dm:               number,    // raw debt/money ratio
  R_dm_narrow:        number,    // narrow-money basis (×3.7); deleveragings gate compares this
  emits:              ['gap_regime','credit_mix_regime','trend_growth_pct','debt_money_regime']
}
```

### `payload.computedShortCycle` — 1.2 Short-Term Cycle
```
{
  phase:              'EARLY' | 'MID' | 'LATE' | 'RECESSION',
  yield_curve_signal: 'INVERTED' | 'STEEPENING' | 'NORMAL',
  unrate_yoy_pp:      number,
  recession_prob_12m: number,    // 0-1
  emits:              ['phase','recession_prob_12m','yield_curve_signal']
}
```

### `payload.computedLongDebt` — 1.3 Long-Term Debt Cycle
```
{
  stage:        'EARLY' | 'MID' | 'LATE' | 'PEAK' | 'DELEVERAGING',
  debtGdp:      number,
  netInterest:  number,
  realRate:     number,
  emits:        ['stage','debtGdp']
}
```
Per Set 3.5 D8 — 1.3 emits **PEAK** (not "TOP"); 1.6 keeps "TOP".

### `payload.computedDelev` — 1.4 Deleveragings (conditional)
```
{
  regime:       'NOT_DELEVERAGING' | 'TRANSITIONAL' | 'BEAUTIFUL' | 'UGLY_DEFLATIONARY' | 'UGLY_INFLATIONARY',
  gateOpen:     boolean,                           // false in mock (R_dm < 17 threshold)
  G:            number,                             // growth - rate gap (pp)
  dD_4q:        number,                             // debt-to-GDP delta over 4Q (decimal)
  pi:           number,                             // print rate (decimal)
  lever_mix:    { austerity, default_, print, redistribution },  // shares 0-1
  beautiful_score:    0 | 1,
  fisher_spiral:      0 | 1,
  gold_tilt_delta_pt: number,
  emits:              ['regime','lever_mix','beautiful_score','fisher_spiral']
}
```
**Slide 1.4 design note:** when `gateOpen=false`, render the "Conditional · Not
Triggered ✓" card. Mock snapshot is gate-CLOSED. Force gate-open path by setting
`?force_gate=1` if you wire that override (currently not wired; engine path
exists, UI override does not — flag if you need it).

### `payload.computedInflation` — 1.7 Inflation & Currency Debasement
```
{
  regime:       'DEFLATIONARY' | 'BEAUTIFUL' | 'STAGFLATION' | 'INFLATIONARY',
  RealRateBucket: 'DEEPLY_NEG' | 'MILDLY_NEG' | 'NEUTRAL' | 'MILDLY_POS' | 'POSITIVE',
  DebaseFlag:   0 | 1,
  CashTrashFlag: 0 | 1,                            // r_mkt < 0 sustained ≥ 6mo
  tilt_deltas:  { gold, commodities, bonds, cash, fx_short },  // pp adjustments
  pi_hdln:      number,                             // headline CPI yoy %
  pi_core:      number,                             // core CPI yoy %
  μ:            number,                             // M2_yoy − NGDP_yoy (monetary impulse)
  monetary_driven: boolean,
  emits:        ['RegimeTag','tilt_deltas','DebaseFlag','CashTrashFlag','RealRateBucket']
}
```
Mock fires INFLATIONARY (π=5.6%, r_mkt=-0.5%, ΔFX=-7.27%, ΔGold=+17.86% → DebaseFlag=1).

### `payload.computedParadigms` — 1.5 Paradigm Shifts
```
{
  PA:                 number,    // composite 0-1
  ρ:                  number,    // Spearman rank inversion across decades
  S_tail:             0..4,      // sum of 4 binary tailwinds (low rates, buyback yield, profit margin, low tax)
  Δ_recency:          number,
  sigmoidΔ:           number,
  paradigm_stage:     'EARLY' | 'MID' | 'LATE',
  tilt_trigger:       boolean,
  gold_overlay:       boolean,
  next_leader_set:    string[],
  emits:              ['paradigm_stage','tilt_trigger','gold_overlay','next_leader_set']
}
```
Mock: PA≈0.40, paradigm_stage='MID'.

### `payload.computedWorldOrder` — 1.6 Big Cycle / World Order
```
{
  CPI:          { USA: 0.926, CHN: 0.746 },     // Country Power Index 0-1
  StageTag:     { USA: 'DECLINE', CHN: 'RISE' },
  HegemonyRisk: 'LOW' | 'ELEVATED' | 'HIGH',
  cntNeg:       number,                          // measures where USA-CHN ≤ 0
  cofer_resDelta10pp: number,                    // USD reserve share Δ over 10y (pp)
  zScores:      { USA: {Edu, Innov, Cost, Mil, Trade, Output, Fin, Reserve}, CHN: {...} },
  emits:        ['CountryPowerIndex','StageTag','HegemonyRisk']
}
```
Mock: USA DECLINE, CHN RISE, ELEVATED. Mocked z-scores match research/06 §7
canonical Apr-2022 panel.

### `payload.computedHolyGrail` — 2.1 Holy Grail (educational sidebar)
```
{
  N: 8,
  ρ_avg: 0.22,
  N_eff: number,
  σ_reduction_pct: number   // illustrative
}
```

### `payload.computedAW` — 2.2 All-Weather
```
{
  baselineWeights:  { equities: 0.30, int_treasury: 0.15, long_treasury: 0.40, gold: 0.075, commodities: 0.075 },
  σ_p:              number,                   // baseline σ
  driftBand:        'GREEN' | 'AMBER' | 'RED'
}
```

### `payload.computedStress` — 2.5 Stress Testing
```
{
  R_port_pct:           { deflationary, inflationary, stagflation, reflation },
  C_per_archetype:      { deflationary: { equities, ... }, ... },
  dominant_per_archetype: { deflationary: 'equities', ... },
  asymmetry_ratio:      number,
  dominant_tail:        { regime, R_pct },
  tail_band:            'GREEN' | 'AMBER' | 'RED',
  SHOCK_MATRIX:         { ... }      // verbatim research/12 §7
}
```

### `payload.computedRiskParity` — 2.4 Risk Parity & Leverage
```
{
  L:              number,    // leverage multiplier
  σ_p_baseline:   number,
  σ_p_target:     number,
  expected_return_levered: number
}
```

### `payload.computedAlpha` — 2.3 Alpha (sidebar)
```
{
  IR_slice:  number,      // single-manager IR
  IR_port:   number,      // portfolio IR (Grinold formula)
  N_used:    number
}
```

### `payload.computedTilt` — Final Tilt Arbiter
```
{
  binding_rule:  string,                       // e.g. "INFLATIONARY > BASE"
  binding_label: string,
  tilts:         { equities, int_treasury, long_treasury, gold, commodities, cash, fx_short },
  capped:        boolean                        // true if any tilt would have exceeded ±10pt
}
```
Precedence: INFLATIONARY > STAGFLATION > max(DELEVER, PARADIGM) > BASE_AW.

---

## 4. Slide registry — how to add or modify a slide

```js
// src/slides/your-slide.js
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';

registerSlide({
  id: '1.X',
  title: 'Slide Title',
  render(section, { payload }) {
    const out = payload.computedXxx;
    renderSlideShell(section, {
      step: '01',
      section: '1.X Section Name',
      onePoint: 'The <em>single semantic point</em> of this slide.',
      caption: `Detail caption with <em>${out.value}</em> highlights.`,
      chartHtml:   subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml:   subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildChartOption(out));
  }
});
```

**Slide shell contract** (`src/ui/slide-shell.js`):
- `step` — 2-digit numeric badge (e.g. '04')
- `section` — sub-heading (e.g. "1.4 Deleveragings")
- `onePoint` — ONE sentence stating the slide's single argument; HTML allowed
- `caption` — supporting detail; HTML allowed
- `chartHtml`/`notesHtml`/`sourcesHtml` — three collapsible tabs (Chart / Notes / Sources)
- After shell, append a 4th `addAnchor(section, 3)` for chip-fill scrollspy

**One semantic point per slide** is non-negotiable (constitution rule #2).

---

## 5. Chart treatment — pattern-aware BW palette

```js
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries, barSeries, radarSeries } from '../charts/series-builder.js';

const chart = bwInit(mountEl);
chart.setOption({
  series: [
    lineSeries({ name: 'Line A', data: [...], strokePattern: 'SOLID' }),
    lineSeries({ name: 'Line B', data: [...], strokePattern: 'DASH-LONG' }),
    barSeries({ name: 'Bar', data: [...], fillPattern: 'HATCH-D' }),
    radarSeries({ name: 'USA', data: [...], fillPattern: 'HATCH-D' })
  ]
});
```

**Pattern catalog** (`src/charts/patterns.js` — SVG `<defs>` registered globally):
- `SOLID`, `DASH-LONG`, `DASH-SHORT`, `DASH-DOT`, `DOTS`
- `HATCH-D` (45° down), `HATCH-U` (45° up), `CROSS-HATCH`, `STIPPLE`

**Constitution rule #1:** pure B&W; differentiation by pattern + weight, never color.
**Constitution rule #7:** every series must use a distinct pattern.

---

## 6. Air Force reveal animations

```js
import { airForceReveal, airForceRevealOut } from '../animations/af-reveal.js';

airForceReveal(element);     // GSAP timeline: opacity 0→1, y +12px→0, blur 6→0
airForceRevealOut(element);  // reverse, plays on scroll-out
```

**Auto-binding:** `bindSlideReveals(scrollContainer)` from
`src/animations/slide-reveals.js` runs once during `runDashboard()`. Any element
with class `.reveal-target` inside a `<section data-slide-id="X">` auto-fires
`airForceReveal` on scroll-in (>30% intersection) and `airForceRevealOut` on
scroll-out.

To use: add `class="reveal-target"` to any element you want animated. No JS wiring
needed. WeakSet armed-state means each section's targets fire at most once per
direction.

---

## 7. Chip strip — fill-on-scroll

The chip strip header (`src/chips/chip-strip.js`) shows 4 emitting chips:
**Empire / Debt / Paradigm / Inflation**. Each fills with a label + status band
when its source slide enters the viewport.

```
Empire     → emitted by 1.6 (StageTag.USA)        bands: red HIGH | amber ELEVATED | green LOW
Debt       → emitted by 1.3 (stage)               bands: amber PEAK/DELEVERAGING | green other
Paradigm   → emitted by 1.5 (paradigm_stage)      bands: amber LATE | green EARLY/MID
Inflation  → emitted by 1.7 (regime)              bands: red INFLATIONARY | amber STAGFLATION | green other
```

Wired in `main.js` `observeEmittingSlides({...})`. Each entry is a function
returning `{ kind, label, status }`.

---

## 8. Mobile splash

Block on width < 1024px portrait. `src/ui/mobile-splash.js`:
```js
if (isMobileBlocked()) renderMobileSplash(app);   // exits before any wizard
```
Splash CSS in `src/styles/mobile-splash.css`. Email link goes to
`sinasoleimanipour@gmail.com`.

---

## 9. Wizard flow

Three tiers, persisted to `localStorage['dalio_dashboard_wizard_v1']`.

- **T1** (required): home_currency, focus_country, risk_profile, sigma_target
- **T2** (optional, skippable): t2_n, t2_rho (Holy Grail params)
- **T3** (optional, skippable): t3_n, t3_rho, t3_ic (Alpha params)

After save, `runDashboard()` runs once. Subsequent reloads skip wizard.
Settings link in chip-strip clears localStorage + reloads to re-enter wizard.

---

## 10. What's hardcoded / v1.1 deferred

These produce realistic values today but are NOT live-derived. UI/UX can ship
with these as-is; engine v1.1 will wire them substantively:

| Item | Current source | v1.1 plan |
|---|---|---|
| 1.6 z-score panel (8 measures × multi-country) | research/06 §7 hardcode | WB/BIS/COFER multi-country fan-out |
| 1.5 BuybackYield | 0.025 default | S&P SP500BUYBACK series |
| 1.5 ProfitShareMean+σ | 0.106 hardcode | rolling 1947-now from BEA |
| 1.5 StatTaxRate flags | true hardcode | OECD TABLE_II1 |
| 1.5 decadeReturns | research/05 §7 historical | (intentionally static — historical) |
| 1.4 cross-session regime journal | empty | server-side journal for sustained-2Q gate hysteresis |
| FR-11 xlsx export | not built | Excel-parallel export |

None of these block UI/UX design.

---

## 11. File map

```
dashboard/
├── HANDOFF.md                          ← you are here
├── README.md                            stack, scripts, constitution
├── package.json                         workspace root
├── index.html                           Vite entry
├── src/
│   ├── main.js                          bootstrap
│   ├── core/
│   │   ├── compute-pipeline.js         13-module DAG runner + 4 input adapters
│   │   ├── fetch.js                    /api/fetch-all OR mock
│   │   ├── state.js                    slide registry + payload + wizard
│   │   └── render.js                   foreach slides → render
│   ├── compute/                         13 framework modules (pure functions)
│   ├── slides/                          13 registered slide modules
│   ├── ui/
│   │   ├── slide-shell.js              eyebrow / point / caption / 3 tabs / 4 cells
│   │   └── mobile-splash.js
│   ├── wizard/                          3-tier wizard + persistence + settings
│   ├── chips/                           4-chip strip + fill-on-scroll observer
│   ├── nav/                             bottom nav: 12 groups × cells, scrollspy
│   ├── charts/                          ECharts BW theme + SVG patterns + series builders
│   ├── animations/                      AF reveal + loading loop + slide-reveals binder
│   ├── styles/                          design-system.css (tokens) + 6 module CSS
│   └── fixtures/
│       └── mock-payload.js             ← Apr-2026 design-mode snapshot
├── tests/                               142 unit + 4 E2E (engine-validated)
└── dist/                                npm run build output (1.18MB)
```

---

## 12. What's safe to change in design phase

```
✅ All of src/styles/*                  tokens, fonts, spacing, shadows
✅ slide-shell.js layout                eyebrow position, tab styling, anchor placement
✅ Chart options (axes, labels, formatters, padding)
✅ Pattern definitions in src/charts/patterns.js
✅ AF reveal timings + curves in animations/af-reveal.js
✅ Wizard form UI in src/wizard/*
✅ Chip strip visual treatment + animation
✅ Nav bar visual + proximity hover
✅ Mobile splash copy + visual
```

## 13. What requires engine handoff back

```
❌ Adding NEW computed fields to a framework
❌ Changing payload.computedXxx field names
❌ Reworking the DAG order
❌ Adding a 14th framework
❌ Changing tilt arbiter precedence
❌ Wiring v1.1 deferred items above
```

If any of those come up — flag back to engine.

---

## 14. The 8 non-negotiable constitution rules (from README)

1. Pure B&W only — differentiation by pattern + weight, never color
2. One semantic point per slide
3. Chart-primary, text-secondary
4. Suggestive, not prescriptive
5. Single fetch on page load (Set 3.5 D3)
6. Static thin-client + serverless backend
7. Pattern-based BW differentiation in charts (FR-5.1)
8. Suggestive output is the entire point — final recipe block is the destination

If a design decision violates any of these, escalate before shipping.

---

Good luck. The engine is solid. Make it sing.
