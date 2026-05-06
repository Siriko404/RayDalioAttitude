# Dalio Dashboard — Design Spec (v4.3)

**Date:** 2026-05-06 (rewrite of original 2026-05-06 v2.5 spec)
**Status:** Draft awaiting user approval
**Working directory:** `C:\Users\sinas\OneDrive\Desktop\Projects\RayDalioAttitude`
**Spec author:** Claude (brainstorming mode)
**Supersedes:** Earlier 2026-05-06 v2.5 spec on this same path (gold accent + GSAP pin+scrub) — REPLACED end-to-end. Also supersedes §17 of `2026-04-23-dalio-framework-design.md` (the iterative-polish output that §17 deferred).
**Proof-of-pattern reference:** `pilot/previews/prototype-v4.html` @ commit `387f42f` (v4.3, 1196 LOC, monochrome slideshow, §1.4 only).

---

## 1. Goal

Ship `pilot/dalio_dashboard.html` — a public-showcase, single-page editorial rendering of all 12 Dalio frameworks assembled from `research/01..12_*.md`. Architecture: **fixed-stage slideshow** with monochrome black-and-white aesthetic, alternating dark/light slide backgrounds, Air-Force-style block-fill char reveal on slide enter/leave, `mix-blend-mode: difference` chrome (header + minimap + footer auto-flip per slide background), CSS scroll-snap-driven slot detection via IntersectionObserver, byte-exact §7 chart reconciliation, KaTeX math, ECharts decal-pattern charts (no color).

Audience: recruiters, peers, GitHub viewers — not paid-Bloomberg-style traders. The dashboard is a public demonstration of the framework corpus, not a working trader's tool.

## 2. Non-goals

Carry over from `2026-04-23-dalio-framework-design.md` § 2 (paid data, build steps, server runtime, etc.). Plus dashboard-specific exclusions:

- **Live data wiring in v1.** Each section ships with the static §7 worked example. Auto-refresh halo animation is present in §1.4-C only as a proof-of-pattern; full FRED/BIS fetches deferred to v2.
- **Editing / writing UI.** Read-only.
- **Multi-page navigation.** Single page, single fixed-stage; no client-side router.
- **Authentication.** Public, no login.
- **Mobile-first.** Desktop-first; mobile gracefully degrades (mini-map hides at ≤720px, slide padding reduces, charts re-flow, slideshow still works).
- **Dynamic per-user theming.** Monochrome BW is the locked aesthetic. No light-mode toggle.
- **Glow / mystical effects.** Rejected post-v3.
- **Color accents.** No gold, no emerald, no any color. Pure BW.

## 3. Locked decisions

All decisions below were locked through visual-companion iteration (2026-05-05/06/07). Each was approved by the user; rejected alternatives are recorded in §12 for traceability.

| # | Decision | Value |
|---|---|---|
| V1 | Audience | Public showcase |
| V2 | Layout | Fixed-stage slideshow, single page, all 12 frameworks as slide groups |
| V3 | Aesthetic | Monochrome black-and-white only · alternating dark/light slides |
| V4 | Data mode | Static §7 + halo-pulse proof-of-pattern in §1.4-C; full live wiring deferred |
| V5 | Math rendering | KaTeX (CDN auto-render `$...$`, `$$...$$`) |
| V6 | Navigation | Floating right-edge mini-map dots; one dot per slide; `mix-blend-mode: difference` |
| V7 | Display type | Source Serif 4 weight 700 (variable font 200–900) — hero h1 ONLY |
| V8 | Body / section type | Source Serif 4 weight 300 default; weight 300 italic for h2 + display |
| V9 | Mid-weight type | Source Serif 4 weight 400 italic for h3; weight 500 italic for lever names |
| V10 | Mono type | DM Mono 400/500 — eyebrow tags, citation source, labels |
| V11 | Text reveal | Air-Force-style block-fill IN + OUT (faithful re-impl of `airforce.com` clientlib) |
| V12 | Reveal lib | GSAP 3.12 via CDN (no ScrollTrigger needed) |
| V13 | Reveal IN timing | Random per-char delay 0.25–0.42s, hold 0.09s |
| V14 | Reveal OUT timing | Random per-char delay 0.0–0.14s, hold 0.07s (faster than IN, so OUT completes during transition) |
| V15 | Slideshow architecture | Fixed `.stage` (`position: fixed; inset: 0`) holding all slides absolutely; only one `.slide.active` (display:flex) at a time |
| V16 | Slot detection | Invisible `.scroll-track` with one 100vh `.slot` per slide; CSS scroll-snap drives input; IntersectionObserver on slots fires `transitionTo()` |
| V17 | Snap behavior | `scroll-snap-type: y mandatory` + `scroll-snap-stop: always` on every slot |
| V18 | Bg roll timing | 350ms cubic-bezier(0.45, 0.05, 0.55, 0.95) on `.stage` background |
| V19 | Transition timeout | `transitionTo()` swaps active class at t=230ms (after AF reveal-OUT completes) |
| V20 | Palette | `--ink: #000`, `--paper: #fff`, plus rgba alphas only |
| V21 | Chrome auto-flip | `mix-blend-mode: difference` on header brand + minimap dots + footer (auto-inverts per slide bg) |
| V22 | Chart pattern system | ECharts `decal` API — no color; diagonal lines / vertical lines / solid / dot patterns |
| V23 | Tab title | "Dalio · Economic Framework" |
| V24 | Favicon | Inline-SVG, italic 200 white "D" on black background |
| V25 | Tab theme color | `#000000` · color-scheme `dark` |

## 4. Architecture

```
DOCUMENT
├─ <head>
│   ├─ Fonts: Google Fonts — Source Serif 4 variable (ital,opsz,wght@0,8..60,200..900;1,8..60,200..900) + DM Mono 400/500
│   ├─ KaTeX CSS + auto-render JS (CDN, defer)
│   ├─ ECharts JS (CDN, 5.5.0)
│   ├─ GSAP JS (CDN, 3.12.5) — timeline only, no ScrollTrigger
│   ├─ Inline CSS (palette vars, layout, animations, scrollbar, snap, decal seed values)
│   ├─ Tab theme: <title>, <link rel="icon">, theme-color, color-scheme
│   └─ KaTeX delimiters config
│
├─ <body>
│   ├─ <header>          ← fixed top · brand mark · mix-blend-mode: difference
│   ├─ <nav.minimap>     ← fixed right edge · N dots · mix-blend-mode: difference
│   ├─ <footer>          ← fixed bottom · sources / GitHub · mix-blend-mode: difference
│   │
│   ├─ <div.stage>       ← position: fixed; inset: 0; bg transition 350ms
│   │   ├─ <div.slide.active data-slide="hero"   data-bg="dark">    HERO    (chrome)
│   │   ├─ <div.slide       data-slide="intro"  data-bg="light">   INTRO   (chrome)
│   │   ├─ <div.slide       data-slide="1.1-A"  data-bg="dark">    §1.1 A  (Question)
│   │   ├─ <div.slide       data-slide="1.1-B"  data-bg="light">   §1.1 B  (Mechanism)
│   │   ├─ <div.slide       data-slide="1.1-C"  data-bg="dark">    §1.1 C  (History)
│   │   ├─ <div.slide       data-slide="1.1-D"  data-bg="light">   §1.1 D  (Formula+Verdict)
│   │   ├─ ... A/B/C/D for §1.2 .. §2.5 (12 sections × 4 stages = 48 slides)
│   │   └─ <div.slide       data-slide="more"   data-bg="dark">    MORE/TOC (chrome)
│   │
│   └─ <div.scroll-track>  ← invisible scroll length · z-index: 1 (below stage)
│       ├─ <div.slot data-slide="hero">     (100vh, scroll-snap-align: start, scroll-snap-stop: always)
│       ├─ <div.slot data-slide="intro">
│       ├─ <div.slot data-slide="1.1-A">  ... (one slot per slide)
│       └─ <div.slot data-slide="more">
│
└─ Inline JS (~300 LOC)
    ├─ AF text reveal IN + OUT (faithful airforce.com clientlib pipeline)
    ├─ ECharts init per chart-bearing slide (lazy on first activation)
    ├─ IntersectionObserver on slots — fires transitionTo(slideId) on >50% slot visibility
    ├─ transitionTo() — sequential phases: reveal-OUT (210ms) → swap (t=230ms) → bg roll (350ms) → reveal-IN (510ms)
    ├─ Mini-map active-dot tracker (mirrors transitionTo state)
    └─ KaTeX auto-render on DOMContentLoaded
```

**Total slide count:** 3 chrome (hero + intro + more) + 12 sections × 4 stages = **51 slides** (matches 51 snap waypoints from earlier spec — one slot per slide).

**Why fixed-stage and not scroll-page:** content stays still in viewport during transition. Only the stage's bg color rolls + AF chars block-fill. User intuition from "old material disappears, new appears in place" is preserved without translating content. Charts never move during scroll → no scroll-tied data morph (rejected v2.0).

## 5. Components

### 5.1 Header

Fixed-position top bar, no background, `mix-blend-mode: difference` on contained text. Contents:
- Brand mark "DALIO · ECONOMIC FRAMEWORK · v0.3" in DM Mono 11px, letter-spacing 4px, weight 500
- Right-side: optional `live · refreshed Xs ago` refresh-pill (only relevant in §1.4-C and only as proof-of-pattern in v1)

The `mix-blend-mode: difference` makes the brand text appear inverted vs current slide bg — black letters on white slides, white letters on black slides — without JS.

### 5.2 Mini-map nav

Fixed right-edge column of 51 dots (one per slide). Each dot 6×6px. Active dot scaled 1.4× and fully opaque; inactive dots opacity 0.35. `mix-blend-mode: difference` for auto-flip.

Dots are 4px apart vertically. At 51 dots × 10px = 510px column height — fits in any viewport ≥600px tall. Hidden at viewport ≤720px wide.

Click dot = `scrollIntoView()` on the corresponding `.slot`. URL hash updates via browser default.

### 5.3 Footer

Fixed bottom, single line · `mix-blend-mode: difference`. Contents: source attribution + GitHub link + version stamp. DM Mono 10px, letter-spacing 2.5px.

### 5.4 Hero slide (`data-slide="hero" data-bg="dark"`)

Centered slide. Eyebrow line (DM Mono 11px, 4px letter-spacing, with hairline rule before/after via `::before`/`::after`). Main h1 (Source Serif 4 weight 700, clamp 56–132px) with italic 300 emphasis on a key word. Subtitle italic 300. Meta-row at bottom (sources + scroll cue).

H1 + subtitle reveal char-by-char on page load via AF block-fill IN.

### 5.5 Intro slide (`data-slide="intro" data-bg="light"`)

Inverted bg (light). Eyebrow + italic h2 (weight 300, clamp 40–76px) + 2 body paragraphs framing the 12-framework corpus.

### 5.6 Per-section A/B/C/D slides

Each of the 12 frameworks renders as **four slides** following the §1.4 reference pattern in `prototype-v4.html`:

```
A — Question / Decision Problem
    • eyebrow tag (§ N.M · TITLE)
    • display-italic question (clamp 34–64px, italic 300)
    • Dalio anchor quote (≤15-word verbatim block, with citation source via DM Mono)

B — Mechanism / Levers / Regimes
    • eyebrow + h3 (italic 400)
    • mechanism elements typographic list (no boxes, no cards) — N items per section
    • lever names italic 500, descriptions italic 300

C — History / Archetypes / Data
    • eyebrow + h3 (italic 400)
    • ECharts chart with decal patterns (no color)
    • verdict-style historical narrative · italic 300

D — Formula + Worked Example + Verdict
    • eyebrow + h3 (italic 400)
    • KaTeX inline + display formulas
    • 3-step worked example
    • verdict block — italic 300 with 600-italic emphasis on regime call
```

Alternating bg per slide: A=dark, B=light, C=dark, D=light, repeating across all 12 sections (so §1.1-A is dark, §1.2-A is dark — every section starts on dark).

**Per-section variance (TBD during build):** Several sections may not fit the A/B/C/D mold cleanly. Confirmed during spec review:
- §2.2 All-Weather: portfolio-weights model, no regimes — B may render as portfolio decomposition pie/donut instead of a 4-lever list
- §2.3 Alpha / §2.4 Risk Parity: decomposition + leverage math may want 5 slides instead of 4
- §2.5 Stress Testing: 4-archetype contributions [-8.13, -26.00, -3.05, +11.83] from research/12 §7 — fits A/B/C/D well

Spec locks the **default** template as 4 slides. Variance per-section is a build-phase design decision per section, surfaced in the implementation plan (writing-plans output) — not pre-locked here.

### 5.7 More / TOC slide (`data-slide="more" data-bg="dark"`)

Final slide. 12-framework table-of-contents grid (4 columns × 3 rows) with top-hairline rows only (no vertical rules per v4.3 redesign). Each TOC item: framework number + title + 1-line summary. Hover: opacity bump + 6px left padding.

## 6. Visual system

### 6.1 Typography

| Use | Family | Weight | Size | Notes |
|---|---|---|---|---|
| Hero h1 | Source Serif 4 | 700 | clamp(56px, 9vw, 132px) | letter-spacing -2.5px, line-height 0.96 |
| Hero h1 italic span | Source Serif 4 | 300 italic | inherited | the "less artistic, more professional" emphasis |
| Section h2 | Source Serif 4 | 300 italic | clamp(40px, 5.6vw, 76px) | letter-spacing -1.2px, top-hairline 64×1px |
| Stage h3 | Source Serif 4 | 400 italic | clamp(24px, 2.8vw, 38px) | letter-spacing -0.5px, top-hairline 36×1px |
| Display italic (questions) | Source Serif 4 | 300 italic | clamp(34px, 4.6vw, 64px) | for §A questions |
| Body | Source Serif 4 | 300 | clamp(16px, 1.25vw, 18px) | line-height 1.7 |
| Subtitle | Source Serif 4 | 300 italic | clamp(17px, 1.5vw, 22px) | full opacity (was 0.82, too faint) |
| Citation | Source Serif 4 | 300 italic | clamp(14px, 1.05vw, 16px) | top-hairline 48×1px, opacity 0.95 |
| Citation source | DM Mono | 400 | 10px | letter-spacing 2.5px, uppercase, opacity 0.6 |
| Eyebrow | DM Mono | 500 | 11px | letter-spacing 4px, uppercase, hairline rule before |
| Lever name | Source Serif 4 | 500 italic | clamp(20px, 2vw, 26px) | mid-weight for hierarchy |
| Lever desc | Source Serif 4 | 300 italic | 14px | |
| Verdict text | Source Serif 4 | 300 italic | clamp(28px, 3.6vw, 48px) | |
| Verdict em | Source Serif 4 | 600 italic | inherited | the heaviest single emphasis (one regime call) |
| Math | KaTeX (default) | — | inherits | |

Variable font import (one HTTP/2 stream): Google Fonts `Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900` plus `DM+Mono:wght@400;500`.

Fallback chain: `'Source Serif 4', 'Times New Roman', Times, serif` for serif; `'DM Mono', ui-monospace, Menlo, monospace` for mono.

### 6.2 Palette

```css
:root {
  --ink:   #000;
  --paper: #fff;
}
```

Plus rgba alphas of currentColor for hairlines (alpha 0.35–0.55), opacity for tertiary text (0.6–0.95). No accent colors. Hairline rules above text are the ONLY decoration permitted.

`::selection { background: currentColor; color: var(--ink); }` — selection inverts.

### 6.3 Hairline rules

Used as the third hierarchy signal (after weight + size). Always 1px, color `currentColor`.
- Eyebrow: 32×1px before (and after when `.eyebrow--center`), opacity 0.55
- h2: 64×1px above heading, full opacity
- h3: 36×1px above heading, full opacity
- Citation: 48×1px above quote, full opacity
- TOC item: top-border 1px solid currentColor, full opacity (opacity reduced via item-level 0.85)

### 6.4 Air Force text-reveal pipeline

Faithful re-implementation of `airforce.com` `clientlib-site.min.js` block-fill animation, extended for both IN and OUT directions.

**Reveal IN (slide enters):**

```
1. Capture parentColor = getComputedStyle(el).color BEFORE innerHTML mutation
   (post-mutation lookup returns transparent because we pre-set inline color:transparent)
2. Wrap each non-whitespace char in
   <span class="reveal-ch" style="color:transparent">x</span>
   (preserves italic via tag-aware traversal; pre-set transparent prevents pre-animation flash)
3. GSAP timeline per char:
     t = random(0.25, 0.42):  set { background: parentColor }   ← block-fill bar appears
     t = above + 0.09:        set { background: transparent;
                                    clearProps: 'color,background' }   ← legible char
4. Toggle `.reveal-armed` to lift visibility:hidden on the parent
```

CSS transition `background 0.18s ease-out, color 0.18s ease-out` smooths the visual blip.

**Reveal OUT (slide leaves):**

```
1. Capture parentColor (chars currently visible)
2. GSAP timeline per char:
     t = random(0.0, 0.14):   set { background: parentColor; color: transparent }   ← block-fill bar; char hidden under bar
     t = above + 0.07:        set { background: transparent }                       ← bar fades; char ends invisible
```

Total reveal-IN ≈ 510ms; reveal-OUT ≈ 210ms. OUT is faster so it completes before slide swap (t=230ms), preventing visual overlap.

`reveal-ch { display: inline; text-wrap: balance }` on parent — `inline` prevents per-char wrap atoms (which previously caused mid-word wraps like `p|attern`); `text-wrap: balance` distributes lines evenly.

**Re-entries:** `dataset.text` stores the original text; airForceReveal rebuilds spans on each call. Bidirectional re-entry works.

### 6.5 Chart decal patterns (no color)

ECharts `decal` API is the differentiation tool. Each series gets a unique pattern; opacity scale is the secondary signal.

Reference §1.4-C four-lever stack:

```js
series: [
  { name: 'austerity', type: 'bar', stack: 'levers',
    itemStyle: { color: 'rgba(255,255,255,0.06)',
                 decal: { symbol: 'rect', color: 'rgba(255,255,255,0.55)',
                          rotation: -Math.PI / 4, dashArrayX: [1, 7], dashArrayY: [4, 0], symbolSize: 1 } } },
  { name: 'defaults', ...,
    decal: { symbol: 'rect', color: 'rgba(255,255,255,0.78)', rotation: 0,
             dashArrayX: [1, 4], dashArrayY: [1, 0], symbolSize: 1 } },
  { name: 'printing', ...,
    itemStyle: { color: 'rgba(255,255,255,1.0)' } },     // SOLID — the dominant lever
  { name: 'redistribution', ...,
    decal: { symbol: 'circle', color: 'rgba(255,255,255,0.7)',
             dashArrayX: [4, 4], dashArrayY: [4, 4], symbolSize: 0.45 } },
]
```

Pattern semantics for the build:
| Series semantic | Pattern |
|---|---|
| Sparse / minor lever | Diagonal lines, sparse (rotation -π/4, dashX [1,7]) |
| Medium / common lever | Vertical lines, dense (rotation 0, dashX [1,4]) |
| Dominant / primary lever | Solid (no decal, full opacity) |
| Distributive / scattered | Dot pattern (circle, dashX/Y [4,4]) |

Build-phase: per-section, the chart designer picks 1 pattern per series from this catalog. Opacity scale 0.55–1.0 for semantic intensity.

Axis lines, grid lines, tick labels: all `currentColor` with opacity 0.35–0.6. No tooltip color.

### 6.6 Scrollbar

```css
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); transition: background 220ms; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.45); }
::-webkit-scrollbar-corner { background: transparent; }
```

## 7. Animation system

### 7.1 Scroll-snap (CSS native)

```css
html {
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
}
.slot {
  width: 100%;
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

`scroll-snap-stop: always` guarantees no slot is skipped on fast wheel/swipe. Browser engine handles all timing — no JS preventDefault.

### 7.2 Slot detection (IntersectionObserver)

```js
const slots = document.querySelectorAll('.scroll-track .slot');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.intersectionRatio > 0.5 && e.target.dataset.slide !== currentSlide) {
      transitionTo(e.target.dataset.slide);
    }
  });
}, { threshold: [0.0, 0.5, 1.0] });

slots.forEach((slot) => observer.observe(slot));
```

When a slot crosses 50% visibility, `transitionTo()` fires. The `currentSlide` guard prevents re-fires.

### 7.3 Transition choreography (`transitionTo()`)

Sequential phases with no overlap:

```
t=0       transitionTo(slideId) called
          • currentSlide = slideId  (synchronous; dup observer fires no-op)
          • disarmSlide(oldEl)  → AF reveal-OUT on outgoing chars  (~210ms)

t=230ms   setTimeout fires
          • oldEl.classList.remove('active')  → display:none
          • newEl.classList.add('active')     → display:flex
              new chars are pre-set inline color:transparent (no flash)
          • stage.classList.toggle('bg-light')   → CSS rolls bg 350ms
          • requestAnimationFrame defers armSlide one frame for layout stability

t=246ms   armSlide(newEl)  → AF reveal-IN  (~510ms)
          • build char spans, run GSAP timeline

t=~756ms  fully settled — chars legible at parent color, bg matches data-bg
```

**Total transition wall-clock:** ~640ms (was ~1270ms before v4.2 timing halve).

### 7.4 Charts faithful, never scroll-bound

Each chart in a `C` slide is initialized empty on page load (or hidden). On first activation of its slide (transitionTo to that slideId), `chart.setOption({ ... targetData })` runs once, ECharts default animation plays, then the bars are static. Subsequent scroll-back-and-forth does not move the data.

Rejected: scroll-tied data morph (was in v2.0). User feedback: *"data-dependent visualizations should remain faithful, and not moved with rolling, which affects how reader views the visualizations"*.

### 7.5 Halo refresh (proof-of-pattern, v1)

§1.4-C chart card pulses with a hairline ring + values flash on auto-refresh. Implemented via temporary `box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);` cleared after 1.6s. Refresh interval: 30s in preview, 5min in production (configurable via `data-refresh-interval` on `<body>`). Refresh-pill in header shows `live · refreshed Xs ago`.

In v1: refresh hook is a stub — only the halo + pill timer animate, no actual data fetch. Full FRED/BIS wiring deferred to v2.

## 8. Data flow

### 8.1 Static §7 mode (v1)

For each of the 12 frameworks, the build script extracts §7 worked-example numbers from `research/NN_*.md` and bakes them into a per-section JS object (or a single `dashboardData.js` keyed by section ID). ECharts options reference these constants.

Math expressions are inlined as KaTeX-rendered `$...$` / `$$...$$` blocks in the HTML; auto-render on DOMContentLoaded.

### 8.2 Live refresh hook (stub for v1, full in v2)

```js
async function refresh(sectionId) {
  // v1: trigger halo + reset refresh-pill timer ONLY
  // v2: fetch FRED/BIS endpoints per research/NN §4 input table,
  //     re-compute via §5 transformations, setOption on chart
}
setInterval(() => sections.forEach(refresh), REFRESH_MS);
```

REFRESH_MS = 30_000 in preview, 300_000 (5min) in production.

### 8.3 Byte-exact reconciliation

Each section's chart values must match the corresponding `research/NN §7` worked example exactly. This was proven on §1.4 (lever-mix `[35,15,30] [55,40,55] [10,40,10] [0,5,5]`) and §2.5 (archetype contributions `[-8.13, -26.00, -3.05, +11.83]`) in the empirical pilot (commit `fd835b0`). All 10 remaining sections must pass the same byte-exact check before sign-off.

## 9. Per-section template (sketch)

Each of `§1.1 .. §2.5` follows this content schema (filled from `research/NN_*.md`). Default = 4 slides (A/B/C/D). Variance flagged.

| Slide | Content slot | Source in research file |
|---|---|---|
| A | Eyebrow tag (`§ N.M · TITLE`) | header line |
| A | Display-italic question | derived from §3 Decision Problem |
| A | Dalio anchor quote | §2 verbatim block (≤15 words quoted, with citation source) |
| B | h3 + mechanism explainer | §3 + §5 framework prose |
| B | Mechanism elements typographic list (4 levers / 3 regimes / portfolio weights) | §5 transformations |
| C | h3 + historical narrative (italic 300) | §7 case study text |
| C | ECharts chart with decal patterns (byte-exact §7 numbers) | §7 worked numbers |
| D | h3 + KaTeX core formula (display) | §5 identity |
| D | KaTeX worked example (3-step) | §7 step-by-step |
| D | Verdict block (regime call · italic 300 + 600 emphasis) | §6 decision rules |

A copy-from-template build script (Python) generates each section's 4 slides from the markdown. **Manual override allowed per section if §7 structure deviates** — surfaced as a per-section design decision in the implementation plan, not pre-locked here.

Known deviations (TBD at build):
- **§2.2 All-Weather:** portfolio weights, not regimes. B becomes portfolio decomposition (pie / donut / typographic weight list).
- **§2.3 Alpha / §2.4 Risk Parity:** decomposition + leverage math may want 5 slides (split formula+verdict).
- **§2.5 Stress Testing:** 4-archetype contributions fit A/B/C/D well.

## 10. Compatibility & fallbacks

| Surface | Required | Fallback |
|---|---|---|
| CSS scroll-snap | Chrome 69+, FF 68+, Safari 11+, Edge 79+ | Free smooth-scroll on older browsers (graceful — no JS feature detection needed; snap silently no-ops) |
| IntersectionObserver | All modern browsers (96%+ global) | Required for slot detection. Fallback: if missing, slides default to slide 1 and arrow-key/click-minimap nav still works |
| GSAP timeline (no ScrollTrigger) | All modern browsers | If JS disabled, slides render statically stacked via CSS-only fallback (only `.slide.active` visible — first slide; B/C/D opacity:0 but tab-navigable) |
| KaTeX | All modern browsers | `throwOnError: false` — malformed math renders as plain `$...$` (debugging signal) |
| ECharts | All modern browsers | If JS disabled, chart slot empty (degraded but no broken layout) |
| `mix-blend-mode: difference` | Chrome 41+, FF 32+, Safari 8+ | Chrome 100% support; if missing, fixed white text on chrome layers (semi-broken on white slides; acceptable as last-resort fallback) |
| Variable fonts | Chrome 62+, FF 62+, Safari 11+ | Falls back to Times New Roman via font stack |
| Inline-SVG favicon | Chrome 80+, FF 41+, Safari 9+ | Browser shows generic icon |

No build step at runtime. Single self-contained HTML file; CDN dependencies cache aggressively.

## 11. Build & deploy

### 11.1 File replacement

The new `pilot/dalio_dashboard.html` REPLACES the existing Wave 0 dalio_dashboard.html (394 LOC, color palette, 2-tab pilot of §4 + §12) end-to-end. The Wave 0 file is not extended; it is overwritten. Original preserved in git history (last commit on it: `fd835b0` Phase 5 pilot).

### 11.2 Build script

A Python script `build_dashboard.py` reads `research/NN_*.md` files, extracts §3 (Decision Problem), §5 (framework / transformations), §6 (decision rules), §7 (worked example), §8 (citations), and assembles the single HTML. Template strings + jinja2 (or vanilla `.format()`) — no webpack, no npm, no node toolchain.

Build script is **one-shot**: it generates the initial HTML from research/01-12. After generation, the HTML is hand-edited and polished. The build script is NOT a continuous pipeline — once polish-phase begins, edits happen on the HTML directly, not on the build script.

Reasoning: 12 sections × ~4 slides × content+chart+math is too much surface area for hand-coding from scratch (error-prone, slow). But polish-phase work (typography micro-tuning, animation refinement, copy edits) is faster on the rendered HTML than round-tripping through a templater.

### 11.3 Output and hosting

Output: one HTML file at `pilot/dalio_dashboard.html`. Open by double-click. Hosting: GitHub Pages or any static host; no server needed.

## 12. Rejected alternatives (history)

| Iteration | Rejection | Reason |
|---|---|---|
| Pudding-sticky scrollytelling (v1) | Sticky chart with text scrolling past | "looks NOTHING like apple product page rolling animation storytelling. the last two sections were basically empty" |
| Cyberpunk decrypt-text reveal | Random-alphanumeric scramble for ~1.2s then resolve | Replaced by AF block-fill — cleaner, more legible, user-picked |
| Emerald accent `#10B981` | Bright green | "i do not like it"; replaced by gold (which was later also rejected) |
| Times New Roman system font | Bold 700 only weight available | Insufficient broad-weight range; replaced by Source Serif 4 variable 200–900 |
| Cormorant italic / Playfair / Tenor Sans / Inter Tight | Various display alternatives | Wrong vibe; user picked TNR-family broad-weight |
| Scroll-bound chart morph (v2.0) | Lever-mix bars grew/shrank with scroll progress | "data-dependent visualizations should remain faithful, and not moved with rolling" — replaced by stage-entry one-shot ECharts default animation |
| JS snap-scroll system 155 LOC (v2.2/v2.3) | preventDefault wheel, lockouts, burst-extend, early-exit | "overengineered. replace with simple elegant smooth scroll" — replaced by CSS `scroll-snap-type: y mandatory` (~25 LOC) |
| Free smooth-scroll only (v2.4) | Native CSS smooth, no snap | "it doesnt have the scroll lock. it must have it. no mid way loading" — added CSS scroll-snap on top of smooth |
| GSAP ScrollTrigger pin+scrub on §1.4 (v2.5) | Apple-style pinned-stage with scroll-bound stage transitions | Replaced by fixed-stage slideshow in v4 — material remains still, only chars + bg animate |
| Gold accent `#c9a14a` (v2.5) | Warm gold for accents, scrollbar, brand | Replaced by pure BW in v3 — "the only colors should be black and white" |
| Mystical glow on titles (v3) | Multi-layer halo `text-shadow` for hero h1 + verdict | Replaced in v4 — "forget the glow idea completely. its overdoing it. stick to BW vintage minimal" |
| Material moves with scroll (v3) | Each section's content translates as scroll progresses | Replaced in v4 — "the material must REMAIN STILL, just disappear with airforce animation" |
| Source Serif 4 weight 900 hero (v2-v3) | Heavy hero h1 | Softened to 700 in v4.1 — "less artistic, more professional" |
| 90% thin (weight 200 default) (v4.0) | Ultra-thin baseline | Bumped to 300 in v4.1 — "doesn't provide enough contrast for a professional finance dashboard" |
| ECharts color-opacity differentiation (v4.0) | White at varying alpha for chart series | Replaced by decal patterns in v4.1 — "minimal chic patterns like thin parallel lines, cross-hatches, dotty pattern" |
| `.reveal-ch { display: inline-block }` (v4.0-v4.2) | Each char as wrap-anywhere atom | Caused mid-word wraps like `p|attern`. Replaced by `display: inline` + `text-wrap: balance` in v4.3 |
| TOC table with vertical hairlines (v4.2) | 4×3 grid with vertical+horizontal rules per cell | Looked heavy / table-like. Replaced by top-hairline-only rows in v4.3 |
| Pre-AF-animation flash (v4.0) | New text visible at default color before GSAP timeline runs | Fixed in v4.1 by pre-setting inline `color:transparent` on each char-span before innerHTML mutation, capturing parentColor BEFORE mutation |
| Slide overflow >100vh (v4.0) | §1.4-D had +111px overflow at 688px viewport | Fixed in v4.1 — slide padding 100/80→76/56, removed slide-inner max-height, tightened verdict + chart-shell heights |

## 13. Open questions

These are deliberate v1 deferrals, not unresolved gaps — except where flagged.

- **Live refresh wiring.** §8.2 stubs the hook; full FRED/BIS pipeline lands in v2.
- **Mobile slideshow layout.** Mini-map hides ≤720px; slide content needs reduced padding (currently 76/56 desktop). Test + tune at viewport 320 / 720 / 900.
- **Print stylesheet.** Probably not needed — defer.
- **Section anchor URLs.** `#1-1-A` works; consider human-readable `#economic-machine-question` aliases.
- **Per-section slide-count variance** (per §9): §2.2, §2.3, §2.4 may not fit A/B/C/D cleanly. Surface as design decision in implementation plan.
- **🔴 OPEN: v4.3 TOC complaint unresolved.** User said *"looks exactly the same as before"* on the v4.3 "more"/TOC slide after vertical-rule removal + display:inline fix. Not yet diagnosed: browser cache? change too subtle? user disliked different element than what was changed (e.g., the h2 title styling itself, not the table)? Resolution path: hard-refresh + screenshot QA + ask user to clarify which element. Deferred to polish phase per V2 design (engine first, polish later via claude.ai artifacts). If polish-phase determines the TOC needs a different design entirely, this spec's §5.7 changes accordingly.
- **Chart count.** Currently spec'd as 1 chart per C-slide × 12 sections = 12 charts. Some sections may want zero chart (pure typographic, e.g., §2.2 portfolio weights as italic list). Decide per-section at build.

## 14. References

### Research files (12)
`research/01_economic_machine.md` … `research/12_stress_testing.md` — verifier-passing per Phase A audit (commit `c3e6796`, matrix at `chatgpt_audit_kit/_phase5_readiness_matrix.md`).

### Empirical pilot
`pilot/build_xlsx.py` + `pilot/dalio_model.xlsx` — byte-exact reconciliation proven on §1.4 + §2.5 (commit `fd835b0`).

### Visual prototype
`pilot/previews/prototype-v4.html` @ commit `387f42f` (v4.3, 1196 LOC) — proof-of-pattern for §1.4 covering all locked decisions in §3.

### Brainstorm trail (additional reference)
`pilot/previews/prototype-v3.html` — v3 reference (alt-bg + glow, all rejected)
`pilot/previews/prototype-v2.html` — v2.5 reference (gold + GSAP pin+scrub, all rejected)
Memory file: `~/.claude/projects/<id>/memory/project_dashboard_brainstorm_state.md` — full v1→v4.3 iteration history.

### External references
- Air Force text-reveal: airforce.com `clientlib-site.min.js`
- GSAP: https://gsap.com/docs/v3/
- KaTeX: https://katex.org/docs/autorender.html
- ECharts decal API: https://echarts.apache.org/en/option.html#series-bar.itemStyle.decal
- CSS scroll-snap: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap
- IntersectionObserver: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- mix-blend-mode: https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
- Source Serif 4 (Adobe, OFL): https://fonts.google.com/specimen/Source+Serif+4
- DM Mono (OFL): https://fonts.google.com/specimen/DM+Mono

### Upstream spec
`docs/superpowers/specs/2026-04-23-dalio-framework-design.md` — corpus-level spec (12 frameworks, 3 artifacts, ECharts D12, etc.).

## 15. Acceptance

This spec is complete when:

1. User reviews it and confirms direction (per profile §9 atomic per-section approval).
2. writing-plans skill produces an implementation plan that:
   - Generates `build_dashboard.py` to template all 12 sections × default 4 slides + chrome (hero / intro / more).
   - Produces `pilot/dalio_dashboard.html` that passes a byte-exact reconciliation check against each `research/NN §7` (where applicable; sections without §7 numbers are typographic-only).
   - Validates the file opens correctly via double-click (no server) and via GitHub Pages.
   - Surfaces per-section slide-count variance decisions (§2.2, §2.3, §2.4) for user input during build.
3. Final `pilot/dalio_dashboard.html` is engine-ready for handoff to claude.ai artifacts (per §16 polish phase).

## 16. Engine vs polish phase boundary

The build separates into two phases. The spec defines the **engine** scope; the polish phase happens in claude.ai web artifacts after engine handoff.

### 16.1 Engine deliverables (this spec, this build)

The engine ships when ALL of:

- [ ] `pilot/dalio_dashboard.html` exists and replaces the Wave 0 file
- [ ] All 51 slides render (3 chrome + 12 sections × 4 stages, allowing per-section variance per §9)
- [ ] Slideshow nav works: scroll-snap, IntersectionObserver, transitionTo, mini-map dot click
- [ ] AF reveal IN + OUT both fire correctly on every slide change (no flash, no overflow, no mid-word wrap)
- [ ] Bg roll works on every slide change (350ms cubic, alternation matches `data-bg`)
- [ ] `mix-blend-mode: difference` applies to header + minimap + footer; chrome auto-flips per slide bg
- [ ] All 12 charts render with decal patterns (byte-exact §7 numbers); no color
- [ ] All KaTeX math renders correctly (auto-render on DOMContentLoaded; no errors)
- [ ] Hairline rules above text render correctly per typography table (§6.1, §6.3)
- [ ] Tab title + favicon + theme-color + color-scheme set per V23/V24/V25
- [ ] Halo refresh proof-of-pattern works on §1.4-C only (timer + halo pulse, no real fetch)
- [ ] Page opens via double-click (no server) at viewport 1280×800 minimum

### 16.2 Polish-phase deliverables (claude.ai artifacts, post-handoff)

After engine HTML is delivered, these items move to claude.ai artifact polish:

- Typography micro-tuning (kern, line-height per slide, italic balance per section)
- Per-section visual variance review (does §2.2's portfolio decomp work? §2.3's 5-slide variant?)
- Animation refinement (transition timings, easing curves, ranges)
- Color contrast / a11y pass (BW means high contrast already; verify alpha-text legibility)
- Copy edits per slide (eyebrow tags, citations, verdicts)
- Chart pattern density tuning (decal dashArray / opacity per section)
- Resolution of v4.3 TOC complaint (per §13 open question)
- Mobile / responsive breakpoint tuning (320 / 720 / 900 viewport)
- Final cross-browser QA (Chrome / Safari / Firefox)
- Any remaining design-taste decisions surfaced during engine build

The boundary is bright: engine = "all 51 slides functional with locked architecture and content"; polish = "design-taste refinement on functional HTML".
