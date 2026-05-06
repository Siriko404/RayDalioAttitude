# Dalio Dashboard — Design Spec

**Date:** 2026-05-06
**Status:** Draft awaiting user approval
**Working directory:** `C:\Users\sinas\OneDrive\Desktop\Projects\RayDalioAttitude`
**Spec author:** Claude (brainstorming mode)
**Supersedes (in part):** §17 of `2026-04-23-dalio-framework-design.md` — this spec is the iterative polish output that §17 deferred.
**Proof-of-pattern reference:** `pilot/previews/prototype-v2.html` @ commit `3c7c41a`

---

## 1. Goal

Ship `dalio_dashboard.html` — a public-showcase, single-page, long-scroll editorial rendering of all 12 Dalio frameworks assembled from `research/01..12_*.md`. Each section uses the same scrollytelling pattern (pinned section, four scroll-driven stages, byte-exact §7 chart reconciliation, KaTeX math, mini-map nav). Audience: recruiters, peers, GitHub viewers — not paid-Bloomberg-style traders.

## 2. Non-goals

Carry over from `2026-04-23-dalio-framework-design.md` § 2 (paid data, build steps, server runtime, etc.). Plus dashboard-specific exclusions:

- **Live data wiring in v1.** Each section ships with the static §7 worked example. Auto-refresh halo animation is present but the refresh hook is a stub for v1; live FRED/BIS fetches land in v2.
- **Editing / writing UI.** This is read-only.
- **Multi-page navigation.** Single page, scroll-driven. No client-side router.
- **Authentication.** Public, no login.
- **Mobile-first.** Desktop-first; mobile gracefully degrades (mini-map hides at ≤720px, pin-stage stacks, charts re-flow, snap-anchors still work).

## 3. Locked decisions

All decisions below were locked through visual-companion iteration (2026-05-05/06). Each was approved by the user; rejected alternatives are recorded in § 14 for traceability.

| # | Decision | Value |
|---|---|---|
| V1 | Audience | Public showcase |
| V2 | Layout | Long-scroll editorial, single page, all 12 frameworks vertically |
| V3 | Data mode | Static §7 + 5-min auto-refresh + halo pulse on each chart card |
| V4 | Math rendering | KaTeX (CDN auto-render `$...$`, `$$...$$`) |
| V5 | Navigation | Floating right-edge mini-map dots; one dot per top-level section |
| V6 | Display type | `Source Serif 4` weight 900 (variable font 200–900) |
| V7 | Body type | `Source Serif 4` weight 400, italic 400 for `<em>` |
| V8 | Mono type | `DM Mono` 400/500 — labels, eyebrow text, annotations |
| V9 | Text reveal | Air Force-style block-fill (faithful re-impl of `airforce.com` clientlib pipeline) |
| V10 | Reveal lib | GSAP 3.12 + ScrollTrigger via CDN |
| V11 | Reveal timing | Random per-char delay 0.5–0.83s, hold 0.18s |
| V12 | Scrollytelling pattern | Apple-style pin + scrub via GSAP ScrollTrigger (`pin: true, scrub: 0.4`) |
| V13 | Pin budget per section | 5× viewport-height (4× pin-budget after viewport subtraction) |
| V14 | Stages per section | 4 — A (question), B (mechanism), C (historical/data), D (formula + verdict) |
| V15 | Charts inside scrolly | Static / faithful — load once on stage entry via ECharts default animation; never scroll-bound |
| V16 | Snap behavior | Native CSS `scroll-snap-type: y mandatory` + `scroll-snap-stop: always` |
| V17 | Snap waypoints per section | 4 internal anchors at scroll positions matching the 4 stages |
| V18 | Palette base | `#0a0a0a` near-black |
| V19 | Palette text | `#e8e6df` cream |
| V20 | Palette accent | `#c9a14a` gold (rejected: emerald `#10B981` from v1) |
| V21 | Scrollbar | Gold-tinted Webkit + Firefox (`#4a3b1d` thumb, `#c9a14a` hover) |
| V22 | Tab title | "Dalio · Economic Framework" |
| V23 | Favicon | Inline-SVG, gold "D" on black, Georgia weight 900 |
| V24 | Tab theme color | `#0a0a0a` (mobile / PWA browser chrome) |
| V25 | Color scheme declared | `dark` |

## 4. Architecture

```
DOCUMENT
├─ <head>
│   ├─ Fonts (Google Fonts: Source Serif 4 variable + DM Mono)
│   ├─ KaTeX CSS + auto-render JS (CDN, defer)
│   ├─ ECharts JS (CDN)
│   ├─ GSAP + ScrollTrigger JS (CDN)
│   ├─ Inline CSS (palette vars, layout, animations, scrollbar, snap)
│   ├─ Tab theme: <title>, <link rel="icon">, theme-color, color-scheme
│   └─ KaTeX delimiters config
│
├─ <body>
│   ├─ <header>            ← fixed top bar: brand + refresh-pill
│   ├─ <nav.minimap>       ← fixed right edge: 15 dots (hero + intro + 12 sections + more)
│   │
│   ├─ <section.hero>      ← waypoint 1: AF text-reveal hero, scroll cue
│   │
│   ├─ <section.intro>     ← waypoint 2: framing intro (~600px)
│   │
│   ├─ §1.1 ECONOMIC MACHINE   ┐
│   ├─ §1.2 SHORT-TERM CYCLE   │
│   ├─ §1.3 LONG-TERM CYCLE    │
│   ├─ §1.4 DELEVERAGINGS      │  Each section: pin-wrapper (500vh)
│   ├─ §1.5 PARADIGM SHIFTS    │  containing pin-stage (100vh) +
│   ├─ §1.6 CHANGING WORLD     │  4 snap-anchors at progress 0/⅓/⅔/1.
│   ├─ §1.7 INFLATION/CURRENCY │  Each = 4 waypoints (A/B/C/D).
│   ├─ §2.1 INVESTMENT TEMPLATE│
│   ├─ §2.2 ALL-WEATHER        │
│   ├─ §2.3 ALPHA              │
│   ├─ §2.4 RISK PARITY        │
│   ├─ §2.5 STRESS TESTING     ┘
│   │
│   ├─ <section.more>      ← waypoint N: continuation TOC / appendix
│   └─ <footer>            ← sources, license, GitHub link
│
└─ Inline JS (~200 LOC)
    ├─ AF text-reveal (faithful airforce.com clientlib pipeline)
    ├─ ECharts init per section
    ├─ GSAP ScrollTrigger pin+scrub timeline per section
    ├─ Mini-map active-dot tracker (scroll listener)
    └─ Refresh-pill timer + halo pulse (5min in prod, 30s in preview)
```

Total waypoint count (live build): 2 (hero + intro) + 12×4 (stages A/B/C/D per section) + 1 (more) = **51 snap waypoints**.

## 5. Components

### 5.1 Header
Fixed-position top bar, blur-backdrop, fades into transparent at bottom edge. Contents: brand mark "DALIO · ECONOMIC FRAMEWORK · v0.2" in DM Mono with gold "DALIO" + refresh-pill on the right.

### 5.2 Mini-map nav
Fixed right-edge column of 15 dots (hero + intro + 12 framework sections + more). Each dot 8×8px, 1px gold-low border. Active dot fills gold. On hover: scales 1.4× and reveals section label tooltip in DM Mono. Hidden at viewport ≤720px.

Anchor links (`<a href="#sec-1-4">`) trigger native CSS smooth-scroll. URL hash updates via browser default.

### 5.3 Hero
Full viewport height. Eyebrow line (DM Mono 11px, gold separators), main h1 (Source Serif 4 weight 900, clamp 64–140px), subtitle italic 300, meta-row at bottom (sources + scroll cue).

H1 + subtitle reveal char-by-char on page load via AF block-fill (see §6.3).

### 5.4 Intro
Standard-padding block between hero and §1.1. Sets up the 12-framework framing in 2 paragraphs of body prose. Source Serif 4 400 + italic gold for `<em>`.

### 5.5 Per-section pin-stage
Each of the 12 frameworks renders identically:

```
.pin-wrapper                       (height: 500vh, position: relative)
├─ .snap-anchor data-stage="A"     (top: 0)        ← waypoint
├─ .snap-anchor data-stage="B"     (top: 133vh)    ← waypoint
├─ .snap-anchor data-stage="C"     (top: 266vh)    ← waypoint
├─ .snap-anchor data-stage="D"     (top: 400vh)    ← waypoint
└─ .pin-stage                      (height: 100vh, GRID 1fr 1fr)
    ├─ .pin-section-tag            (§ N.M label, top-left)
    ├─ .pin-progress                (NN%, top-right)
    ├─ .pin-progress-bar            (gold fill, scroll progress)
    ├─ .pin-left                    (text content, 4 stages stacked)
    │   ├─ .stage.stage-a           ← question + Dalio anchor quote
    │   ├─ .stage.stage-b           ← mechanism (4 levers / 3 regimes / etc.)
    │   ├─ .stage.stage-c           ← historical / archetype narrative
    │   └─ .stage.stage-d           ← KaTeX formula + worked example + verdict
    └─ .pin-right                   (chart panes, 4 stages stacked)
        ├─ .stage.stage-a-r         ← stage-A chart (taxonomy / decision tree)
        ├─ .stage.stage-b-r         ← stage-B chart (effect cross-plot)
        ├─ .stage.stage-c-r         ← stage-C chart (lever-mix bars / archetype data)
        └─ .stage.stage-d-r         ← stage-D chart (G_t over time / regime gates)
```

The four `.stage` divs in each pane are absolute-positioned, stacked. Only one is opacity:1 at any scroll position.

### 5.6 Continuation / more
Placeholder/expansion section after §2.5. v1: 12-section TOC grid. v2+: optional appendix, methodology notes, version history.

### 5.7 Footer
Single line: source attribution, GitHub link, version stamp. DM Mono 10px, dim cream.

## 6. Visual system

### 6.1 Typography

| Use | Family | Weight | Notes |
|---|---|---|---|
| Hero h1 | Source Serif 4 | 900 | clamp(64px, 10vw, 140px), letter-spacing -1.5px |
| Section h2 | Source Serif 4 | 800 | clamp(40px, 6vw, 84px) |
| Stage h3 | Source Serif 4 | 700 | clamp(22px, 2.4vw, 32px) |
| Body | Source Serif 4 | 400 | 19px, line-height 1.65 |
| Italic emphasis | Source Serif 4 | 400 italic | colored gold |
| Eyebrow / labels | DM Mono | 400/500 | letter-spacing 1.5–4px, uppercase |
| Math | KaTeX (default font) | — | inherits base size |

Variable font import (one HTTP/2 stream): `@font-face` via Google Fonts `Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900` plus `DM+Mono:wght@400;500`.

Fallback chain: `'Source Serif 4', 'Times New Roman', Times, serif`.

### 6.2 Palette

```
--bg:        #0a0a0a   /* near-black base */
--bg-panel:  #0e0e0e   /* slight elevation */
--border:    #1a1a1a   /* hairline */
--border-2:  #262626   /* hover hairline */
--text-1:    #e8e6df   /* primary cream */
--text-2:    #8a8a82   /* secondary */
--text-3:    #5a5a52   /* tertiary */
--text-4:    #3a3a32   /* quaternary */
--gold:      #c9a14a   /* primary accent */
--gold-low:  #4a3b1d   /* dim gold (scrollbar, hairlines) */
--gold-glow: rgba(201,161,74,0.45)
--bad:       #8b2e2e   /* deflationary / negative regimes */
--warn:      #a87a3d   /* cautionary */
```

`::selection { background: gold; color: bg; }`

### 6.3 Air Force text-reveal pipeline

Faithful re-implementation of `airforce.com` `clientlib-site.min.js` block-fill animation:

```
1. Parse element's data-text (innerHTML can include <em> markers).
2. Wrap each non-whitespace char in <span class="reveal-ch"> (preserve italics).
3. For each span:
     t = 0:               color: transparent          (char invisible)
     t = random(0.5, 0.83): background: <text color>  (block-fill bar)
     t = above + 0.18s:    background: transparent    (clearProps color)
4. Drive via gsap.timeline().set() at scheduled offsets.
5. Trigger via ScrollTrigger onEnter (top 80%) for in-section reveals,
   or manual setTimeout for hero on page load.
```

CSS transition `background 0.18s ease-out, color 0.18s ease-out` smooths visual blip.

### 6.4 Scrollbar

```css
* { scrollbar-width: thin; scrollbar-color: var(--gold-low) var(--bg); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb {
  background: var(--gold-low);
  border: 2px solid var(--bg);
  transition: background 220ms;
}
::-webkit-scrollbar-thumb:hover { background: var(--gold); }
::-webkit-scrollbar-corner { background: var(--bg); }
```

### 6.5 Halo refresh

Every chart-card pulses with a gold ring + chart values flash on auto-refresh. Implemented via temporary inline `box-shadow: 0 0 0 2px gold-glow, 0 0 24px gold-glow;` cleared after 1.6s. Refresh interval: 30s in preview, 5min in production (configurable via `data-refresh-interval` on `<body>`).

Refresh-pill in header: gold 6px dot + DM Mono "live · refreshed Xs ago" auto-incrementing every second; resets to "0s" on each pulse.

## 7. Animation system

### 7.1 Scroll-snap (CSS native)

```css
html {
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
}
.hero, .intro, .more {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.snap-anchor {
  position: absolute;
  left: 0; width: 1px; height: 1px;
  pointer-events: none;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

7+ waypoints per page (3 top-level + 4 per-section internal). `scroll-snap-stop: always` guarantees no waypoint skipping. Browser engine handles all timing — no JS interception, no `preventDefault` on wheel, full user agency.

### 7.2 Per-section pin + scrub (GSAP)

```js
gsap.registerPlugin(ScrollTrigger);

gsap.timeline({
  scrollTrigger: {
    trigger: '#sec-N-M',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,           // 400ms catch-up — feels Apple-ish
    pin: '.pin-stage',
    anticipatePin: 1,
    onUpdate: handleProgress,  // updates pin-progress-bar + chart-load gates
  },
})
.to('.stage-a',   { opacity: 0, y: -40 }, 0)
.fromTo('.stage-b', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, 0.5)
.to('.stage-b',   { opacity: 0, y: -40 }, 1)
.fromTo('.stage-c', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, 1.5)
.to('.stage-c',   { opacity: 0, y: -40 }, 2)
.fromTo('.stage-d', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, 2.5);
```

Timeline duration ≈ 3.0; trigger range maps progress 0..1 to timeline 0..3. Stage transitions occur at progress thresholds 0/⅓/⅔/1.

### 7.3 Charts faithful, never scroll-bound

Each chart in `.pin-right` is initialized empty (or with target data; ECharts auto-animation plays once). On stage entry threshold (e.g. progress > 0.40 for stage-C), we fire `chart.setOption({ series: targetData })` exactly once via a `loaded` flag. After that the bars are static; subsequent scrolls do not move the data.

Rejected: scroll-tied data morph (was in v2.0; user feedback "data-dependent visualizations should remain faithful, and not moved with rolling, which affects how reader views the visualizations").

## 8. Data flow

### 8.1 Static §7 mode (v1)

For each of the 12 frameworks, the build script extracts §7 worked-example numbers from `research/NN_*.md` and bakes them into a per-section JS object (or a single `dashboardData.js` keyed by section ID). ECharts options reference these constants.

Math expressions are inlined as KaTeX-rendered `$...$` / `$$...$$` blocks in the HTML; auto-render on DOMContentLoaded.

### 8.2 Live refresh hook (stub for v1, full in v2)

```js
async function refresh(sectionId) {
  // v1: just trigger halo + reset refresh-pill timer
  // v2: fetch FRED/BIS endpoints per research/NN §4 input table,
  //     re-compute via §5 transformations, setOption on chart
}
setInterval(() => sections.forEach(refresh), REFRESH_MS);
```

REFRESH_MS = 30_000 in preview, 300_000 (5min) in production.

### 8.3 Byte-exact reconciliation

Each section's chart values must match the corresponding `research/NN §7` worked example exactly. This was proven on §1.4 (lever-mix `[35,15,30] [55,40,55] [10,40,10] [0,5,5]`) and §2.5 (archetype contributions `[-8.13, -26.00, -3.05, +11.83]`) in the empirical pilot (commit `fd835b0`). All 10 remaining sections must pass the same byte-exact check before sign-off.

## 9. Per-section template (sketch)

Each of `§1.1 .. §2.5` follows this content schema (filled from `research/NN_*.md`):

| Stage | Slot | Source in research file |
|---|---|---|
| A | Eyebrow tag (`§ N.M · TITLE`) | header line |
| A | Question (italic display) | derived from §3 Decision Problem |
| A | Dalio anchor quote | §2 verbatim block (≤15 words quoted, with citation) |
| A right | Decision tree / taxonomy / overview chart | §6 outputs |
| B | Mechanism explainer | §3 + §5 framework prose |
| B | Mechanism elements grid (4 levers / 3 regimes / etc.) | §5 transformations |
| B right | Effect cross-plot or process diagram | §5 lever directions |
| C | Historical narrative | §7 case study text |
| C right | Archetype data chart (byte-exact) | §7 worked numbers |
| D | KaTeX core formula | §5 identity |
| D | KaTeX worked example | §7 step-by-step |
| D | Verdict box (regime call) | §6 decision rules |
| D right | Time-series / gate chart | §6 boundaries |

A copy-from-template build script (Python) generates each section's HTML from the markdown. Manual override allowed per section if §7 structure deviates (e.g. §2.2 All-Weather has portfolio weights, not regimes — chart C becomes a pie/donut).

## 10. Compatibility & fallbacks

| Surface | Required | Fallback |
|---|---|---|
| CSS scroll-snap | Chrome 69+, FF 68+, Safari 11+, Edge 79+ | Free smooth-scroll on older browsers (graceful — feature detection unnecessary, snap silently no-ops) |
| GSAP ScrollTrigger | All modern browsers | If JS disabled, sections render statically stacked (CSS-only fallback shows stage-A always; B/C/D opacity:0 hidden — degraded but legible) |
| KaTeX | All modern browsers | `throwOnError: false` — malformed math renders as plain `$...$` (debugging signal) |
| ECharts | All modern browsers | If JS disabled, chart panes empty (degraded but no broken layout) |
| Variable fonts | Chrome 62+, FF 62+, Safari 11+ | Falls back to Times New Roman via font stack |
| Inline-SVG favicon | Chrome 80+, FF 41+, Safari 9+ | Browser shows generic icon |

No build step. Single self-contained HTML file; CDN dependencies cache aggressively.

## 11. Build & deploy

Working file: `dalio_dashboard.html` at project root (per `2026-04-23-dalio-framework-design.md` D7).

Build pipeline: a Python script (`build_dashboard.py`) reads `research/NN_*.md` files, extracts §4/§5/§6/§7/§8 content, and assembles the single HTML. Template strings + jinja2 (or vanilla `.format()`) — no webpack, no npm.

Output: one HTML file. Open by double-click. Hosting: GitHub Pages or any static host; no server needed.

## 12. Rejected alternatives (history)

| Iteration | Rejection | Reason |
|---|---|---|
| Pudding-sticky scrollytelling (v1) | Sticky chart with text scrolling past | "looks NOTHING like apple product page rolling animation storytelling. the last two sections were basically empty" |
| Cyberpunk decrypt-text reveal | Random-alphanumeric scramble for ~1.2s then resolve | Replaced by AF block-fill — cleaner, more legible, user-picked |
| Emerald accent `#10B981` | Bright green | "i do not like it"; replaced by warm gold `#c9a14a` |
| Times New Roman system font | Bold 700 only weight available | Insufficient broad-weight range; replaced by Source Serif 4 variable 200–900 |
| Cormorant italic / Playfair / Tenor Sans / Inter Tight | Various display alternatives | Wrong vibe (couture / editorial / architectural / sans-serif); user picked TNR-family broad-weight |
| Scroll-bound chart morph | Lever-mix bars grew/shrank with scroll progress | "data-dependent visualizations should remain faithful, and not moved with rolling" — replaced by stage-entry one-shot ECharts default animation |
| JS snap-scroll system (v2.2/v2.3) | 155 LOC: preventDefault wheel, lockouts, burst-extend, early-exit | "overengineered. replace with simple elegant smooth scroll" — replaced by CSS `scroll-snap-type: y mandatory` (~25 LOC) |
| Free smooth-scroll only (v2.4) | Native CSS smooth, no snap | "it doesnt have the scroll lock. it must have it. no mid way loading" — added CSS scroll-snap on top of smooth |

## 13. Open questions

These are deliberate v1 deferrals, not unresolved gaps:

- **Live refresh wiring.** §8.2 stubs the hook; full FRED/BIS pipeline lands in v2.
- **Mobile pin-stage layout.** Currently stacks; may need swap to vertical-only animation (no horizontal split) for ≤900px.
- **Print stylesheet.** Will users print this? Probably not — defer.
- **Section anchor URLs.** `#sec-1-4` works; consider human-readable `#deleveragings` aliases.
- **Per-section timing tweaks.** §2.1 (template-for-investing) + §2.2 (all-weather) may want longer pin (6× vh) due to richer step-through. Pilot one and tune.

## 14. References

### Research files (12)
`research/01_economic_machine.md` … `research/12_stress_testing.md` — verifier-passing per Phase A audit (commit `c3e6796`, matrix at `chatgpt_audit_kit/_phase5_readiness_matrix.md`).

### Empirical pilot
`pilot/build_xlsx.py` + `pilot/dalio_model.xlsx` — byte-exact reconciliation proven on §1.4 + §2.5 (commit `fd835b0`).

### Visual prototype
`pilot/previews/prototype-v2.html` @ commit `3c7c41a` — proof-of-pattern for §1.4. All locked decisions present.

### External references
- Air Force text-reveal: airforce.com `clientlib-site.min.js`
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- KaTeX: https://katex.org/docs/autorender.html
- ECharts: https://echarts.apache.org/en/option.html
- CSS scroll-snap: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap
- Source Serif 4 (Adobe, OFL): https://fonts.google.com/specimen/Source+Serif+4
- DM Mono (OFL): https://fonts.google.com/specimen/DM+Mono

### Upstream spec
`docs/superpowers/specs/2026-04-23-dalio-framework-design.md` — corpus-level spec (12 frameworks, 3 artifacts, ECharts D12, etc.).

## 15. Acceptance

This spec is complete when:

1. User reviews it and confirms direction.
2. writing-plans skill produces an implementation plan that:
   - Generates `build_dashboard.py` to template all 12 sections.
   - Produces `dalio_dashboard.html` that passes a byte-exact reconciliation check against each `research/NN §7`.
   - Validates the file opens correctly via double-click (no server) and via GitHub Pages.
3. Final `dalio_dashboard.html` lands at project root, committed.
