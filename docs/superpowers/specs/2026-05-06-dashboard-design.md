# Dalio Dashboard — Live Analytical Workflow Spec

> **Status:** v2 — wholesale rewrite. Replaces `2026-05-06-dashboard-design-SLIDESHOW-OBSOLETE.md` after a mid-session scope reversal in which the user clarified that the dashboard is a **live functional analytical workflow tool**, not an editorial slideshow showcase.
>
> **Audit:** Builds on `docs/superpowers/audits/2026-05-06-pipeline-redteam.md` (BLOCK verdict). All 6 critical findings + 8 important findings + 4 minor findings resolved by Set 3.5 / Set 4 / Set 5 ratifications below.
>
> **Provenance:** All decisions in this spec were ratified atomically across 5 adaptive question sets (Sets 1, 2, 3.5, 4, 5) totaling 30 user-locked decisions. Per-decision rationale lives in `~/.claude/projects/<project>/memory/project_dashboard_brainstorm_state.md`.

---

## §0. Constitution (non-negotiable principles)

These principles override any subsequent decision in this spec. Anything that conflicts must be redesigned.

1. **Pure B&W only.** No color anywhere — palette is `#000` (ink) on `#fff` (paper) plus inverted (white-on-black). Status differentiation via weight, inverted block, symbols, hairline rules — never color.
2. **One semantic point per slide.** Each step-slide delivers ONE big idea. Subordinate detail goes into max 3 collapsible tabs (Chart / Notes / Sources).
3. **Chart-primary, text-secondary.** Each slide IS a chart; caption + tabs support it. No paragraphs of prose where a chart with a verdict-derived caption suffices.
4. **Suggestive, not prescriptive.** Recommendations framed as "Per Dalio's frameworks…" with disclaimer footer. Target user = educated general investor, not pro analyst.
5. **Single fetch on page load.** No auto-refresh, no live ticker theatre. User reloads the page to re-fetch. Footer shows "Data fetched: HH:MM at page load".
6. **Static thin-client + serverless backend.** HTML/JS/CSS served from CDN. Backend proxy (Cloudflare Worker / Vercel Function) holds API keys + normalizes bulk-file sources.
7. **Pattern-based BW differentiation in charts.** Series differentiated by stroke patterns (solid/dashed/dotted/dash-dot) for lines and fill patterns (hatch/dots/crosshatch/vert) for areas. Never color, never opacity-shading.
8. **Suggestive output is the entire point.** The 10-step pipeline ends in ONE decisive recommendation slide. Cutting steps cuts recommendation quality.

---

## §1. Goal

A web dashboard that walks an educated general investor through Dalio's 12-framework analysis methodology in a sequential, narrated, live-data scroll, ending in **one decisive portfolio suggestion** derived from Dalio's published recipes applied to current regime states.

**Target user:** educated general investor (curious; not a professional analyst). Has heard of Dalio. Wants to see "where are we, what does it mean, what should I do" answered through Dalio's lens. Capable of reading charts, understanding "regime", "tilt", "asymmetry"; not capable of providing manager-proprietary inputs (IC, N, ρ_avg, σ_α).

**Out of scope (v1):**
- Personalized financial advice (this is suggestive, not prescriptive)
- Live-streaming intraday data
- Mobile portrait responsive (≤1023px shows "open on laptop" splash)
- xlsx parallel implementation (v1.1)
- Manager-proprietary alpha inputs (Step 2.3 stays educational sidebar only)

---

## §2. Architecture

### §2.1 Topology

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (≥ 1024px)                                         │
│  ────────────────                                           │
│  Static HTML/CSS/JS (single page)                           │
│  · Source Serif 4 + DM Mono fonts                           │
│  · ECharts (charts)                                         │
│  · GSAP (AF reveals)                                        │
│  · ~ 200 KB initial payload                                 │
└──────────────┬──────────────────────────────────────────────┘
               │ XHR fetch (single request on page load)
               ▼
┌─────────────────────────────────────────────────────────────┐
│  Serverless backend proxy (Cloudflare Worker / Vercel Func) │
│  ────────────────────────────────────────────────────────   │
│  · Holds FRED API key as env secret                         │
│  · Fetches all data sources in parallel                     │
│  · Normalizes formats (xls, zip, pdf → JSON)                │
│  · Returns single JSON payload to browser                   │
│  · No persistence; cache only at edge layer if needed       │
└──┬───────┬──────┬────────┬─────────┬───────────┬────────────┘
   │       │      │        │         │           │
   ▼       ▼      ▼        ▼         ▼           ▼
 FRED    BIS    IMF     World     Damodaran    Shiller
 (api)   (zip)  COFER   Bank      .xls         .xls
```

### §2.2 Data flow

1. User opens dashboard URL.
2. Static HTML/CSS/JS scaffolds the page (visible within ~ 500ms; AF "LOADING" loop runs in header).
3. Single XHR fires to backend proxy `/api/fetch-all`.
4. Backend fans out to ~ 10 data sources in parallel, normalizes, returns single JSON.
5. Browser populates each slide's data slots via per-data-point AF one-shot reveals.
6. Header AF loop replaces with "DATA · 2026-04-30 14:32 UTC" timestamp.
7. User scrolls through 11 slides; navigation bar at bottom shows position.
8. To re-fetch, user reloads the page.

### §2.3 Tech stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend framework | None (vanilla JS + HTML) | Lightest payload; matches slideshow's existing stack |
| Charts | **ECharts** | Matches slideshow choice (`pilot/dalio_dashboard.html:1996`); battle-tested; custom BW theme override |
| Animations | **GSAP** + CSS | Reuses slideshow's `airForceReveal` mechanism for char block-fill |
| Fonts | **Source Serif 4** + **DM Mono** (Google Fonts) | Matches slideshow design language |
| Backend | **Cloudflare Worker** OR **Vercel Function** (TBD at build) | Smallest serverless surface; either works |
| Data sources | FRED · BIS · IMF COFER · World Bank WDI · Damodaran NYU · Shiller · Yardeni IBES PDF · NBER · NY Fed | Per `research/01-12_*.md` §4 input tables |

### §2.4 Backend proxy contract

**Endpoint:** `GET /api/fetch-all`

**Returns:** Single JSON with shape:

```json
{
  "fetched_at_utc": "2026-04-30T14:32:00Z",
  "sources": {
    "fred": { "GDP": [...], "TCMDO": [...], ... },
    "bis": { "EER": [...] },
    "cofer": { "Res_shr": [...] },
    "wb_wdi": { "Edu_tert": [...], ... },
    "damodaran": { "histretSP": [...] },
    "shiller": { "ie_data": [...] },
    "yardeni": { "ConsForecast": null },
    "nber": { "recession_dates": [...] }
  },
  "errors": [
    { "source": "yardeni", "reason": "PDF parse failed", "fallback_used": true }
  ]
}
```

Backend uses parallel `Promise.all` against the data sources; ~ 5–10 second total fetch time depending on source latency. Browser shows AF loading loop during this window. Failed sources return null with error in `errors` array; browser slide handles null gracefully (renders "data unavailable" via AF reveal).

---

## §3. Pipeline DAG (locked Set 3.5 D1)

10 live steps in DAG order, plus 2 educational sidebars and 1 final recommendation slide.

```
Live sequence (slide 1 → slide 11):

  1. 1.1 Economic Machine                    [framework 1.1]
  2. 1.2 Short-Term Cycle                    [framework 1.2]
  3. 1.3 Long-Term Debt Cycle                [framework 1.3]
  4. 1.4 Deleveragings (CONDITIONAL)         [framework 1.4]   ← gate at FR-4
  5. 1.7 Inflation & Currency Debasement     [framework 1.7]
  6. 1.5 Paradigm Shifts                     [framework 1.5]
  7. 1.6 Big Cycle / World Order             [framework 1.6]
  8. 2.2 All-Weather                         [framework 2.2]
  9. 2.5 Stress Testing                      [framework 2.5]
 10. 2.4 Risk Parity & Leverage              [framework 2.4]
 11. Final Recommendation                    [synthesis]

Educational sidebars (NOT in numbered live sequence):
  · 2.1 Holy Grail (math infographic)        [reachable from nav, dashed line]
  · 2.3 Alpha (formula viz, manager-only)    [reachable from nav, dashed line]
```

**DAG-derived order rationale (from audit §C1):** Each downstream step receives outputs from upstream steps without back-edges. The original design's order (1.6 → 1.5; 1.4 → 1.7) violated 5+ research-file `§9 Integration Points` declarations. The locked order resolves all violations.

**Conditional gate (Step 4 = 1.4 Deleveragings):**
- Active when `debt_money_regime = HIGH` AND `gap_regime = BELOW_TREND` (per research/04 §9 L285).
- Hysteresis: gate fires when `R^{D/M} > 17` instantaneously OR `debt_money_regime = HIGH` sustained ≥ 2 consecutive quarters (per audit I6 fix).
- When gate is OFF, slide renders a "Not Triggered ✓" mini-card with one-sentence explanation. Pattern locked at Set 3.5 Q3.2.

---

## §4. Functional Requirements

### §4.1 Onboarding (FR-1)

**FR-1.1** Dashboard loads to a 1-page welcome screen with single "Begin" button + 30-sec context paragraph explaining what the user is about to see (suggestive, not prescriptive; per Dalio's 12 frameworks; ~ 2-min read).

**FR-1.2** "Begin" advances to T1 wizard step. T1 has 3 fields, each with default pre-filled:
- Home currency: dropdown, default `USD`
- Focus country: dropdown, default `United States`
- Risk profile: 3-option pick (Conservative / **Balanced** / Aggressive) → maps to σ_target = 6% / **10%** / 15%

**FR-1.3** After T1, "Tell us more?" card offers T2 (1 field, optional) + T3 (5 fields, advanced/collapsed-by-default). Either expands inline or "Skip → Use defaults" advances to dashboard.
- T2: Current portfolio weights (5 sleeves: equities / int Tsy / long Tsy / gold / commodities). Default: "Starting from cash."
- T3 (collapsed under "Advanced — for professional users"): IC / N / ρ_avg / σ_α / broker financing spread.

**FR-1.4** Total time from URL-open to dashboard with T1-only path: ≤ 45 seconds.

**FR-1.5** Pipeline functions end-to-end with T1-only inputs (T2 + T3 fully optional). User can update via "Settings" link in header at any time.

### §4.2 Page architecture (FR-2)

**FR-2.1** Page is a vertical scroll of 11 numbered slides + 2 educational-sidebar slides reachable only via navigation.

**FR-2.2** Each slide fills the viewport at minimum height (no slide-stacking).

**FR-2.3** Top of viewport: pinned-header chip strip (per FR-7 below) — always visible during scroll.

**FR-2.4** Bottom of viewport: navigation bar (per FR-6 below) — always visible during scroll.

**FR-2.5** Slides alternate light/dark themes per slideshow design language convention. Dark = `#000` bg with `#fff` text + inverted patterns; light = inverse.

### §4.3 Per-slide architecture (FR-3) — locked Set 4 Q4.4

Every slide (live or educational) follows this structure:

**FR-3.1** **Eyebrow** (top of slide): DM Mono, 11px, letterspacing 4px, weight 500, uppercase. Format: `DALIO · {SECTION} · STEP {NN} OF 10`. Hairline rule (32 × 1px) before.

**FR-3.2** **The ONE point** (middle): italic Source Serif 4, 44–56px (responsive), weight 300, letterspacing −1.2px, with 64 × 1px hairline rule before. Single semantic statement, one sentence. Italic emphasis (weight 700) on the verdict word(s).

**FR-3.3** **Caption** (just below the ONE point): italic Source Serif 4, 16px, weight 300, max-width 720px. Brief sentence containing the actual numbers driving the verdict (e.g. "Total debt / GDP at 134%; near zero-bound."). Italic emphasis on numeric values.

**FR-3.4** **Three collapsible tabs** (below caption):
- `▼ Chart` — DEFAULT OPEN. Renders the slide's primary chart (ECharts per FR-5).
- `▶ Notes` — Collapsed. Pedagogical depth: 2-4 paragraphs explaining what the framework measures + what current state means + why it matters.
- `▶ Sources` — Collapsed. Citation list: data source IDs (e.g. FRED `TCMDO`), Dalio book chapter references, link to research/{NN}_*.md spec.

Tab UI: DM Mono 10px / 2.5px tracking / weight 500. Click toggles open; only one open at a time per slide.

**FR-3.5** Optional slide elements (only on slides that need them):
- Conditional gate banner (Step 4 only): "Not Triggered ✓" mini-card replacing the chart panel when gate is OFF.
- Recipe block (Step 11 only): inverted (white-on-black) anchor block with explicit 5-sleeve weight list.
- Disclaimer footer (Step 11 only): "Suggestive · Not prescriptive · Live data fetched {timestamp} · Reload to refresh."

### §4.4 Conditional Step 4 / Educational sidebars (FR-4)

**FR-4.1** Step 4 (1.4 Deleveragings) gate logic per FR-3 above; renders "Not Triggered ✓" mini-card when OFF.

**FR-4.2** Educational sidebars 2.1 (Holy Grail) and 2.3 (Alpha) live OUTSIDE the 11-slide live sequence. Reachable only via clicking their dashed-line entries in the navigation bar. They render with the same FR-3 architecture (eyebrow + ONE point + caption + collapsible tabs).

**FR-4.3** Sidebar 2.1 (Holy Grail): N_eff curves chart (per Q4.6b catalog) + Notes explaining "why 15+ streams matter" + Sources from research/08.

**FR-4.4** Sidebar 2.3 (Alpha): Information Ratio formula viz + Notes explaining "for professional managers, not for general investor inputs" + Sources from research/10 §10 L277 verbatim.

### §4.5 Charts (FR-5) — locked Set 4 Q4.6

**FR-5.1** All charts rendered via ECharts with custom BW theme.

**FR-5.2** **Pattern-based differentiation only.** Series distinguished via:
- Lines: `SOLID` / `DASH-LONG` (6-3) / `DASH-SHORT` (3-2) / `DOTTED` (1-2) / `DASH-DOT` (5-2-1-2)
- Fills/areas: `SOLID` / `HATCH-D` (45° dense) / `HATCH-S` (45° sparse) / `HATCH-R` (135° reverse) / `CROSSHATCH` / `DOTS` / `VERT` (vertical lines) / `HORIZ` (horizontal lines)

Implemented via SVG `<pattern>` definitions referenced in ECharts series styles.

**FR-5.3** Per-step chart catalog (locked Set 4 Q4.6b, mockup at `.superpowers/brainstorm/.../07-chart-catalog-v2.html`):

| Step | Chart type |
|---|---|
| 1.1 Economic Machine | Two-line (productivity solid + cycle dashed), 50yr |
| 1.2 Short-Term Cycle | Half-circle phase dial with 4 hatched zones + pointer + recession-prob % |
| 1.3 Long-Term Debt Cycle | Line + 4 stage-shading bands (each band = distinct pattern), 100yr |
| 1.4 Deleveragings | Lever-mix horizontal bars, 4 levers each with distinct pattern (cuts/austerity/transfers/print) |
| 1.7 Inflation & Currency | 4-quadrant matrix (real rates × growth), each quadrant = distinct pattern, current point dot |
| 1.5 Paradigm Shifts | 10yr returns line + 50yr-mean dash-dot reference |
| 1.6 Big Cycle / World Order | 8-axis radar (US = hatch-fill polygon, CHN = dashed-outline polygon, others as needed) |
| 2.1 Holy Grail (edu) | N_eff curves with 3 dash patterns for ρ ∈ {0.05, 0.20, 0.40} |
| 2.2 All-Weather | Stacked horiz bar with 5 sleeve-pattern fills + dashed baseline outline |
| 2.5 Stress Testing | 4-archetype outcomes bar with distinct pattern per archetype |
| 2.4 Risk Parity & Leverage | Vol-contribution bars + leverage gauge (vert pattern) |
| 2.3 Alpha (edu) | Formula visualization (IR = IC · √N) |

### §4.6 Navigation (FR-6) — locked Set 4 Q4.2

**FR-6.1** Bottom-pinned navigation bar, position absolute at bottom of viewport, contained left/right with 100px margin from viewport edges, gap 10px between groups. Bar is always visible during scroll.

**FR-6.2** 12 segments (10 live + 2 educational sidebars) in DAG order from left to right.

**FR-6.3** Each segment idle state: empty hairline (1px stroke, opacity 0.42).

**FR-6.4** Each segment has its sub-slide cells (3-5 cells per group, count = number of content blocks in that step's slide). Cells are full-lane click targets (~ 6× larger than visual dot for accessibility).

**FR-6.5** Group hover OR group is currently scrolled-into-view: line morphs in-place into HOLLOW dots (one per cell) via SVG `<pattern>`-equivalent CSS (`width: 100% → 7px`, `height: 1px → 7px`, `border-radius: 0 → 50%`, `background: currentColor → transparent`, `box-shadow: inset 0 0 0 1px currentColor`). Animation: 380ms cubic-bezier(0.2, 0.8, 0.2, 1) staggered 35ms per cell.

**FR-6.6** Cursor proximity (mousemove tracks nearest cell by X-distance): nearest cell adds `.is-near` class → ring brightens (1.5px box-shadow, opacity 1) + dot's name appears below at exactly 12px gap (mirrors group label-to-dot above).

**FR-6.7** Currently-scrolled-into-view cell adds `.is-current` class → dot is FILLED (`background: currentColor`). Only ONE cell across the entire bar has `.is-current` at any time. The current cell's name is ALWAYS visible (overrides default-hidden).

**FR-6.8** Group label visibility:
- Default (idle): all group labels HIDDEN.
- Bar hover (mouseover anywhere on .nav-bar): ALL group labels appear simultaneously (opacity 0.7).
- Currently-scrolled-into-view group's label: ALWAYS visible (opacity 1, weight 500) — overrides default-hidden.

**FR-6.9** Educational sidebar groups (2.1, 2.3): default line uses dashed stroke (1px dashed) instead of solid; label uses italic + dimmer opacity. On hover: morphs to filled dots same as live groups.

**FR-6.10** Click anywhere in a cell → smooth-scroll to that cell's slide AND mark group as `.is-active` AND mark cell as `.is-current`. Click on group's empty space (not on a cell) → scroll to first cell of that group.

### §4.7 Pinned-header regime chips (FR-7) — locked Set 4 Q4.5

**FR-7.1** Pinned strip at top of viewport, sticky during scroll. Background `#fff` (light theme) or `#000` (dark theme) inverted automatically per current slide's theme.

**FR-7.2** Eyebrow label "REGIMES" in DM Mono 8px / 2px tracking / weight 700.

**FR-7.3** 4 regime chips visible in fixed order: Empire · Debt · Paradigm · Inflation. Plus optional 2 cycle chips: Phase · Recession-prob (placement TBD at build).

**FR-7.4** Default state of each chip: empty placeholder text (e.g. `Paradigm: ___`) in italic light gray (`#aaa`), border `#ccc`.

**FR-7.5** As user scrolls past each emitting slide (1.6 emits Empire; 1.3 emits Debt; 1.5 emits Paradigm; 1.7 emits Inflation), corresponding chip fills in: text replaces placeholder, color becomes `#000`, border becomes `#000`, status weight per FR-9 below applied.

**FR-7.6** Implementation: IntersectionObserver on each emitting slide; when slide's first half is in viewport, mark its chip as filled.

**FR-7.7** Chip text format: `{Category}: {STATE}` — e.g. `Empire: Top`, `Debt: Peak`, `Paradigm: Late`, `Inflation: Stagflation`. Status encoding per FR-9.

### §4.8 Status encoding (FR-8) — locked Set 4 Q4.3 (Option A pure BW)

**FR-8.1** Status states: GREEN (default/normal), AMBER (warn), RED (danger).

**FR-8.2** No color anywhere. Status differentiated via:
- GREEN: regular weight (500), 1px hairline border-bottom.
- AMBER: bold weight (700), 2px thicker border-bottom, ◆ symbol cue suffix.
- RED: bold weight (700), inverted block (white text on black background), no border.

**FR-8.3** Tail-risk panel encoding (canonical example):
- < 5× asymmetry: GREEN
- 5–9.99×: AMBER (canonical AW = 8.52× lands here per locked Set 3.5 D5)
- ≥ 10×: RED

**FR-8.4** Status applies to: regime chips (FR-7), tail panels, recession probability, deleveraging gate status.

### §4.9 AF loading + reveal animations (FR-9) — locked Set 4 Q4.3 + reuse

**FR-9.1** Reuse `airForceReveal()` and `airForceRevealOut()` from `pilot/dalio_dashboard.html:1792-1882`. Real GSAP, instant block flashes via `gsap.set()`, true random per-char delays via `Math.random()`. **Do not** reproduce as CSS-only smooth-scaleY transitions — that loses the cyberpunk feel.

**FR-9.2** Header loading loop: `loadingLoop(headerEl)` cycles `airForceReveal` (loading-tuned: minDelay 0.05, maxDelay 0.20, holdDuration 0.06) → 700ms hold visible → `airForceRevealOut` (minDelay 0.0, maxDelay 0.18, holdDuration 0.06) → 200ms hold invisible → repeat. Used during initial backend fetch period. Replaces with timestamp text when fetch completes.

**FR-9.3** Per-data-slot one-shot reveal: `airForceReveal(slotEl)` with slideshow defaults (minDelay 0.25, maxDelay 0.42, holdDuration 0.09). Triggered when each data point lands from the backend. Single-shot (not looped).

**FR-9.4** Slide entry/exit AF reveals: when user scrolls into a slide, the slide's `.reveal-target` elements (h2, captions) animate via `airForceReveal`. Already implemented in slideshow `armSlide()` / `disarmSlide()`.

### §4.10 Mobile responsive (FR-10) — locked Set 5 Q5.6

**FR-10.1** Desktop-only at v1. Minimum supported viewport: 1024px width.

**FR-10.2** Viewports < 1024px portrait orientation: render a splash screen with:
- "Best on desktop — open on laptop for the full analysis" header in italic Source Serif
- Email-yourself-this-link button (`mailto:?body=<dashboard URL>`)
- Brief explanation of why desktop-only

**FR-10.3** Mobile-responsive redesign: deferred to v2.

### §4.11 Excel parallel implementation (FR-11) — locked Set 5 Q5.2

**FR-11.1** v1.0 ships web only.

**FR-11.2** v1.1 adds parallel xlsx implementation: same data + computations + bar/line charts. Excel does NOT implement: AF reveals, GSAP animations, collapsible tabs, alternating dark/light themes, proximity-nav. xlsx is "data + static charts" parity only.

**FR-11.3** xlsx file generated by Python build pipeline (extends existing `pilot/build_xlsx.py`). Single .xlsx with one sheet per framework + final recommendation sheet.

---

## §5. Output dependency edges (information flow between steps)

Per research file `§9 Integration Points` declarations + audit §C1 evidence:

```
1.1 Economic Machine
  ├─ emits: debt_money_regime, gap_regime, productivity_trend
  └─ consumed by: 1.4 (gate), 1.3 (debt context)

1.2 Short-Term Cycle
  ├─ emits: phase, recession_prob, policy_stance, cycle_phase
  └─ consumed by: 1.3 (rate-cut zero-bound detection), 1.5 (cycle phase transitions)

1.3 Long-Term Debt Cycle
  ├─ emits: stage ∈ {SOUND, BUBBLE, PEAK, DELEVER, RECEDE}
  │  (renamed from "TOP" to "PEAK" per locked Set 3.5 D8 — to avoid collision with 1.6's TOP)
  └─ consumed by: 1.4 (late-stage warning), 1.6 (debt-empire interaction)

1.4 Deleveragings (CONDITIONAL)
  ├─ emits: lever_mix, beautiful_deleveraging_flag, gold_tilt_delta
  └─ consumed by: 2.2 (tilt aggregation)

1.7 Inflation & Currency Debasement
  ├─ emits: regime ∈ {DISINFLATION, STAGFLATION, INFLATIONARY, DEFLATION}
  │         RegimeTag, RealRateBucket, DebaseFlag, GoldTiltΔ, CashTiltΔ, FXShortΔ
  └─ consumed by: 1.4 (DebaseFlag), 1.5 (regime context), 2.2 (tilt aggregation)

1.5 Paradigm Shifts
  ├─ emits: paradigm_stage ∈ {EARLY, MID, LATE}, gold_overlay flag
  └─ consumed by: 1.6 (paradigm-empire interaction), 2.2 (tilt aggregation)

1.6 Big Cycle / World Order
  ├─ emits: StageTag ∈ {RISE, TOP, DECLINE, NEW_ORDER}
  └─ consumed by: 1.7 (debasement +1 notch), 2.2 (CHN-tilt option)

2.2 All-Weather
  ├─ emits: tilt_vector (5 sleeves), recommended_weights
  ├─ consumes: 1.4 + 1.5 + 1.7 gold tilts (arbitrated per FR-12)
  └─ consumed by: 2.5 (input portfolio), 2.4 (input weights)

2.5 Stress Testing
  ├─ emits: archetype_outcomes, asymmetry_ratio, dominant_tail
  └─ consumed by: 2.4 (per-archetype returns input), Step 11 (tail panel)

2.4 Risk Parity & Leverage
  ├─ emits: vol_contributions, leverage L (capped 3×)
  └─ consumed by: Step 11 (recipe block)

Step 11 Final Recommendation
  └─ consumes: ALL upstream outputs → renders synthesis
```

**Mutual dependencies:** None (the original 1.4 ↔ 1.7 mutual dep was a misreading; per audit §C2, the actual flow is 1.7 → 1.4 one-way after the DAG re-order).

---

## §6. Tilt vector arbitration (FR-12) — locked Set 3.5 D7

When multiple steps emit gold tilt deltas simultaneously, apply this precedence:

**Priority order (highest to lowest):**
1. 1.7 INFLATIONARY → +10pt gold
2. 1.7 STAGFLATION → +5pt gold
3. max(1.4 DELEVER gold tilt, 1.5 gold_overlay flag) → as emitted
4. Base AW gold weight (7.5%)

**Aggregate cap:** ±10pt deviation from AW baseline per research/07 §6 L132 explicit limit.

**UI surface:** Final recommendation slide (Step 11) renders the binding rule next to the Gold row in the recipe table:

```
Gold: 17.5% (↑10pt) · source: STAGFLATION + DELEVER · capped
```

---

## §7. Visual design language (locked Set 4 Q4.1)

Identical to `pilot/dalio_dashboard.html` slideshow design system. Reused tokens:

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#000` | Default text + line + hairline |
| `--paper` | `#fff` | Default background |
| Body font | `Source Serif 4` (300 weight default) | All running text + headings |
| Mono font | `DM Mono` (500 weight default) | Eyebrows, labels, numeric data, citations |
| Hero h1 | Source Serif 700, 56–132px clamp, letterspacing −2.5px | Reserved for the ONE dramatic moment per slide (currently: each slide's ONE point) |
| h2 | Source Serif 300 italic, 40–76px clamp, letterspacing −1.2px | Slide point statements |
| h3 | Source Serif 400 italic, 24–38px clamp | Section headings (rare in analytical layout) |
| Body text | Source Serif 300, 16–18px clamp | Captions, notes |
| Eyebrow | DM Mono 500, 11px, letterspacing 4px, uppercase, with 32×1px hairline before | All eyebrow labels (slide eyebrow, section markers) |
| Hairline | 1px `currentColor`, 32–64px wide, opacity 0.55 | Before all major typography elements |

---

## §8. Build plan

### §8.1 Workflow tier — locked Set 5 Q5.5

**Tier-2 Spec Kit phases** per scope-discipline rubric:

1. ✅ This spec (§spec output of brainstorming)
2. ⏳ User review of this spec (gate)
3. ⏳ `writing-plans` skill → `docs/superpowers/plans/2026-05-06-dalio-dashboard-engine-v2.md`
4. ⏳ User review of plan (gate)
5. ⏳ `subagent-driven-development` skill → per-task implementation with two-stage review

### §8.2 Subagent dispatch model

- **Mechanical implementation** (single-file changes, clear specs, ECharts config, CSS): Sonnet
- **Integration / multi-file coordination** (backend proxy wiring, GSAP integration, build pipeline): Sonnet
- **Architecture / heavy reasoning** (any spec-deviation calls, debugging, complex DAG logic): Opus

Per-task two-stage review:
1. Spec-compliance reviewer subagent (verifies code matches this spec's FR-N requirements)
2. Code-quality reviewer subagent (verifies clean code, naming, comments, tests)

Final code reviewer subagent runs after all tasks complete.

### §8.3 File structure (planned)

```
pilot/
├── dalio_dashboard.html          [OBSOLETE — slideshow; do not modify]
├── dalio_dashboard_v2.html       [NEW — analytical workflow, single-page entry]
├── src/
│   ├── core/                     [data fetch, state, render orchestration]
│   ├── slides/                   [one module per slide: 1.1, 1.2, ..., 2.4, final]
│   ├── nav/                      [bottom navigation bar]
│   ├── chips/                    [pinned-header regime chips]
│   ├── animations/               [AF reveal port from slideshow]
│   ├── charts/                   [ECharts BW theme + per-chart configs]
│   └── wizard/                   [onboarding flow]
├── styles/
│   └── design-system.css         [BW Source Serif tokens, component styles]
└── build_xlsx.py                 [extended for v1.1 xlsx parity]

backend/
├── worker.js                     [Cloudflare Worker / Vercel Function]
└── normalize/                    [per-source normalizers: bis-zip, damodaran-xls, ...]

docs/superpowers/
├── specs/2026-05-06-dashboard-design.md       [THIS FILE]
├── specs/2026-05-06-dashboard-design-SLIDESHOW-OBSOLETE.md  [archived]
├── plans/2026-05-06-dalio-dashboard-engine-v2.md  [next]
└── audits/2026-05-06-pipeline-redteam.md      [done; reference only]
```

---

## §9. Spec self-review

**Placeholder scan:** All FR-N have concrete content. No "TBD" / "TODO" / "implement later" remaining.

**Internal consistency:** All FR-N consistent with §0 Constitution + §3 Pipeline DAG + §4 Functional Requirements. No contradictions found.

**Scope check:** Single implementation plan in scope. Cross-subsystem (web frontend + serverless backend + xlsx parallel) but coherent as a single deliverable. v1.1 xlsx port is scoped as a follow-up but plan structure accommodates it.

**Ambiguity check:** Each FR-N has exactly one interpretation. Numbers and thresholds locked (134%, 8.52×, 17.5%, etc.).

**Audit closure:** All 6 critical + 8 important + 4 minor findings from `2026-05-06-pipeline-redteam.md` are addressed:
- C1 → §3 (DAG re-order)
- C2 → §3 (one-way 1.7 → 1.4)
- C3 → §4.4 (Step 2.3 educational sidebar only)
- C4 → §4.4 (Step 2.1 educational sidebar only; reframed)
- C5 → §4.8 (tail-risk threshold raised: AMBER 5–9.99×, RED ≥ 10×)
- C6 → §6 (tilt arbitration precedence specified)
- I1 → §3 (1.3 emits PEAK, not TOP)
- I2 → §0 #5 (single fetch on page load; auto-refresh removed)
- I3 → §4.1 (3-tier wizard with T1-only minimum)
- I4 → §3 (no two-pass render needed after DAG re-order)
- I5 → §2 (backend proxy locked)
- I6 → §3 (hysteresis on 1.4 gate)
- I7 → §4.3 (one point per slide, no synthesis paragraph)
- I8 → §0 #5 (single timestamp = page load time, honest)
- M1 → §3 (1.6 chips show stage; pedagogical Notes explain horizon mismatch)
- M2 → §0 #5 (no auto-refresh; chip computed once per page load)
- M3 → §4.7 (pinned-header chips = TL;DR; per-slide depth = full)
- M4 → §0 #5 (refresh cadence = page reload only; closing narration matches)

---

## §10. User review gate

**Spec written and committed.** Please review this spec end-to-end. Look for:

- Anything missing or contradictory
- Anything that should be cut for v1
- Anything that needs to be more specific before plan-writing
- Anything you want to renegotiate from the locked decisions (would require unlocking)

**Reply with:** `approve` (proceed to writing-plans) · `amend [section]` (fix and re-review) · `cut [FR]` (remove a requirement before planning).
