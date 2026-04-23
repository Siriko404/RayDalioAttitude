# The Dalio Framework — Design Spec

**Date:** 2026-04-23
**Status:** Draft awaiting user approval
**Working directory:** `C:\Users\sinas\OneDrive\Desktop\Projects\RayDalioAttitude`
**Spec author:** Claude (brainstorming mode, anti-capitulation protocol active)

---

## 1. Goal

Build a two-stack, three-artifact system that consolidates Ray Dalio's **investment + macro** frameworks into operational tools a portfolio manager can actually use. Every published framework is expressed as: (inputs → formulas → decision rules → worked example), never as narrative theory alone.

## 2. Non-goals

- Life & Work / management principles. Scoped out by user.
- Paid data (Bloomberg, Refinitiv). Open/free only.
- Running a local server, installing Python, or any launcher. The HTML must open by double-click.
- Any artifact that requires a build step (webpack, npm, etc.).
- Lit-review prose. Every section of every agent report must land in a model.
- **Paywalled / non-public sources.** The repository is PUBLIC on GitHub. No library-only PDFs, no verbatim quoting beyond minimal fair-use snippets from copyrighted works, no embedding of subscription-only material. Every citation must point at a publicly-verifiable URL.
- **Undifferentiated sourcing.** No report may mix Dalio's framework with industry-standard / non-Dalio material without a visually distinct attribution marker. See § 7 R7.

## 3. Locked decisions

| # | Decision | Value |
|---|---|---|
| D1 | Corpus scope | Dalio's investment + macro output (books, Bridgewater papers, LinkedIn, speeches, video). No Life & Work. |
| D2 | Subsection count | 12 (7 macro + 5 investment) |
| D3 | Agents per subsection | Exactly 1 |
| D4 | Output schema strictness | Strict — 10 required sections, missing = failure |
| D5 | Per-report depth | 2000–3000 words |
| D6 | Example-number source | Agent specifies data source; JS/Excel fills real numbers |
| D7 | Artifacts shipped | 3 — `README.md`, `dalio_dashboard.html`, `dalio_model.xlsx` |
| D8 | Python role | Internal research/analysis only, NOT shipped as an artifact |
| D9 | In-browser runtime | Pure JavaScript — no Pyodide, no server |
| D10 | Dashboard layout | By user workflow (Regime → Portfolio → Stress → Log → Reference) |
| D11 | Excel data engine | Power Query (native) |
| D12 | Chart library | ECharts (Apache, MIT-licensed) via CDN |
| D13 | Visual design language | Minimal black + elegant green palette, with Claude's editorial typography and Apple's interaction elegance. Dark theme. |
| D14 | Execution cadence | Pilot → review → batches of 4 with iteration between waves |
| D15 | Dashboard design | Iterative multi-pass polish phase — NOT a one-shot build. See § 17. |

---

## 4. Architecture

```
PROJECT ROOT
├─ README.md                      ← artifact #1 (master framework doc)
├─ dalio_dashboard.html           ← artifact #2 (pure JS, ECharts, double-click to run)
├─ dalio_model.xlsx               ← artifact #3 (Power Query to the same APIs)
│
├─ research/                      ← INTERNAL (12 agent reports feed artifacts 1-3)
│   ├─ 01_economic_machine.md
│   ├─ 02_short_term_debt_cycle.md
│   ├─ 03_long_term_debt_cycle.md
│   ├─ 04_deleveragings.md
│   ├─ 05_paradigm_shifts.md
│   ├─ 06_changing_world_order.md
│   ├─ 07_inflation_currency.md
│   ├─ 08_template_for_investing.md
│   ├─ 09_all_weather.md
│   ├─ 10_alpha_portable_alpha.md
│   ├─ 11_risk_parity_leverage.md
│   └─ 12_stress_testing.md
│
├─ docs/
│   └─ superpowers/
│       └─ specs/
│           └─ 2026-04-23-dalio-framework-design.md  ← this file
│
└─ dalio_market_principles_syllabus.md   ← reference (built in prior turn)
```

**Data flow at runtime:**

```
                            ┌──────────────────────────┐
                            │  Free / open data APIs   │
                            │  FRED · World Bank · BIS │
                            │  BLS · BEA · ECB · IMF   │
                            │  SEC · Stooq · AV · FMP  │
                            └───────────┬──────────────┘
                                        │
                      ┌─────────────────┴─────────────────┐
                      │                                    │
                 direct fetch                         Power Query
                 (JS from HTML)                       (from Excel)
                      │                                    │
            ┌─────────▼─────────┐              ┌──────────▼─────────┐
            │ dalio_dashboard.  │              │ dalio_model.xlsx   │
            │     html          │              │                    │
            │ (one file, double-│              │ (Refresh All button)│
            │  click to open)   │              │                    │
            └───────────────────┘              └────────────────────┘
```

Stacks are **independent mirrors** of the same framework. They do not share runtime files. Either can be used without the other.

---

## 5. The 12 subsections — with scope boundaries

Each boundary is the contract every agent signs. **IN** = agent must cover. **OUT** = another agent owns, agent must not duplicate.

**ID → SEQ → slug mapping** (used for filenames):

| SEQ | ID | Slug | Title |
|---|---|---|---|
| 01 | 1.1 | `economic_machine` | Economic Machine Template |
| 02 | 1.2 | `short_term_debt_cycle` | Short-Term Debt Cycle |
| 03 | 1.3 | `long_term_debt_cycle` | Long-Term Debt Cycle |
| 04 | 1.4 | `deleveragings` | Deleveragings |
| 05 | 1.5 | `paradigm_shifts` | Paradigm Shifts |
| 06 | 1.6 | `changing_world_order` | Changing World Order / Big Cycle |
| 07 | 1.7 | `inflation_currency` | Inflation & Currency Debasement |
| 08 | 2.1 | `template_for_investing` | Template for Investing |
| 09 | 2.2 | `all_weather` | All-Weather (Beta) Portfolio |
| 10 | 2.3 | `alpha_portable_alpha` | Alpha Generation & Portable Alpha |
| 11 | 2.4 | `risk_parity_leverage` | Risk Parity & Leverage |
| 12 | 2.5 | `stress_testing` | Stress-Testing & Scenario Analysis |

Filename pattern: `research/{SEQ}_{slug}.md`.

### Module 1 — Economic & Market Principles (7)

**1.1 Economic Machine Template**
- **IN:** transactions-based GDP identity; productivity growth as linear trend; the concept of short + long debt cycles as overlays on productivity; money vs credit distinction.
- **OUT:** mechanics of either debt cycle (1.2, 1.3); deleveraging dynamics (1.4); inflation specifics (1.7).

**1.2 Short-Term Debt Cycle**
- **IN:** 5–10 year business cycle; central-bank-driven credit expansion/contraction; yield curve; recession indicators; late-cycle vs mid-cycle detection.
- **OUT:** long-term cycle (1.3); deleveraging levers (1.4); productivity trend (1.1).

**1.3 Long-Term Debt Cycle**
- **IN:** 50–75 year secular cycle; debt/GDP ceiling detection; debt-service/GDP; reserve-currency cycle; late-stage warning signs.
- **OUT:** short-cycle timing (1.2); deleveraging mechanics (1.4); paradigm shifts (1.5).

**1.4 Deleveragings**
- **IN:** beautiful vs ugly deleveraging; 4 levers (austerity, defaults, printing, wealth redistribution); deflationary vs inflationary dynamics; archetype templates.
- **OUT:** cycle detection itself (1.2, 1.3); forward-looking paradigm shifts (1.5).

**1.5 Paradigm Shifts**
- **IN:** 10-year regime-change detection; Dalio's 2019 framework for spotting reversals; asset-class leadership rotation by decade.
- **OUT:** empire-scale transitions (1.6); inflation-specific regime (1.7); cycle-level (1.2–1.4).

**1.6 Changing World Order / Big Cycle**
- **IN:** 8 measures of great powers (education, innovation, competitiveness, military, trade, output, financial center, reserve currency); 250-yr empire cycle; US vs China scoring; gold/reserve positioning at empire transitions.
- **OUT:** 10-year paradigm shifts (1.5); inflation dynamics (1.7).

**1.7 Inflation & Currency Debasement**
- **IN:** monetary vs credit inflation distinction; gold + real-asset allocation under debasement; FX positioning; "cash is trash" framing; real-rate regime classification.
- **OUT:** long-term debt cycle generic (1.3); deleveraging levers generic (1.4).

### Module 2 — Investment Principles (5)

**2.1 Template for Investing**
- **IN:** fundamental + systematic + diversified approach; Holy Grail of 15–20 uncorrelated return streams; return-stream sourcing methodology; why correlation-killing matters.
- **OUT:** specific All-Weather allocations (2.2); alpha-specific (2.3); leverage sizing (2.4); stress testing (2.5).

**2.2 All-Weather (Beta) Portfolio**
- **IN:** 4-box growth × inflation framework; risk-weighted (not capital-weighted) allocation; asset-class regime mapping; canonical weights (~30% stocks / 40% long bonds / 15% IL bonds / 7.5% gold / 7.5% commodities style).
- **OUT:** leverage engineering (2.4); alpha overlay (2.3); macro regime detection (Module 1).

**2.3 Alpha Generation & Portable Alpha**
- **IN:** alpha/beta separation; information ratio; bet sizing; pure alpha vs traditional; portable alpha construction; alpha decay.
- **OUT:** beta construction (2.2); leverage sizing (2.4).

**2.4 Risk Parity & Leverage**
- **IN:** vol-targeted weighting; leverage ratios to hit target return; funding cost; rebalancing cadence; leverage limits.
- **OUT:** asset-class weights per se (2.2); alpha-specific sizing (2.3).

**2.5 Stress-Testing & Scenario Analysis**
- **IN:** historical stress tests (1929–33, 1970s, 2008, 2020); forward scenario construction; Dalio-template scenarios (deflationary depression, inflationary depression, reflation, stagflation); sensitivity tables.
- **OUT:** portfolio construction (2.2–2.4); macro prediction (Module 1).

---

## 6. Research execution plan

```
Wave 0  — PILOT           Wave 1 — BATCH A      Wave 2 — BATCH B      Wave 3 — BATCH C
[1.1]  ──► inspect ──►  [1.2, 1.3, 1.4, 1.5] ──► inspect ──►  [1.6, 1.7, 2.1, 2.2] ──► inspect ──►  [2.3, 2.4, 2.5] ──► done
```

Between waves: I produce a "wave report" with what I learned, what prompt adjustments I'm making, and I wait for your sign-off before launching the next batch.

**Subagent type:** `general-purpose` (has WebSearch + WebFetch + file write). Spawn them in isolation mode with explicit write paths so reports land at `research/##_<slug>.md`.

---

## 7. Deterministic research prompt (the contract)

Every agent receives this prompt with only 4 slots filled: `{ID}`, `{TITLE}`, `{SCOPE_IN}`, `{SCOPE_OUT}`.

```
ROLE
  You are a deep-research analyst on Ray Dalio's investment and macroeconomic
  framework. You are NOT a theory writer. You produce operational analysis
  frameworks that a portfolio manager can plug numbers into tomorrow morning.

SUBSECTION
  ID:     {ID}
  TITLE:  {TITLE}
  IN-SCOPE:   {SCOPE_IN}
  OUT-OF-SCOPE: {SCOPE_OUT}   (another agent owns these; do NOT cover them)

SOURCE PRIORITY (use WebSearch and WebFetch freely)
  CONSTRAINT: This repository is PUBLIC on GitHub. Every cited source
  must be verifiable via a public URL at the time of writing. Do NOT
  cite paywalled material you cannot view in full. Do NOT include
  verbatim quotes beyond minimal fair-use snippets from copyrighted
  works. Library access is NOT available.

  1. Ray Dalio primary writings — all freely available:
       - "Big Debt Crises" — full PDF on economicprinciples.org
       - "Principles for Dealing with the Changing World Order" —
         free summary PDF on economicprinciples.org + LinkedIn
         installments (do NOT quote from the commercial hardcover
         beyond fair-use snippets)
       - "How the Economic Machine Works — A Template for Understanding
         What is Happening Now" (paper + 30-min video, both free)
       - "Paradigm Shifts" (LinkedIn, July 2019)
       - LinkedIn long-form posts 2015-present
  2. Bridgewater public research — free on bridgewater.com:
       - "Engineering Targeted Returns and Risks"
       - "The All-Weather Story"
       - "Our Thoughts About Risk Parity and All-Weather" (2015)
       - "Geographic Diversification Can Be a Lifesaver"
  3. Speeches / interviews / testimony where a public recording or
     transcript exists: CFR, Milken, Davos, TED (2017), Lex Fridman,
     FT Head-to-Head, Bloomberg Studio 1.0, Congressional testimony
  4. Dalio-cited sources ONLY if freely accessible in full:
       - Irving Fisher (1933) "The Debt-Deflation Theory of Great
         Depressions" — public domain, JSTOR free
       - Hyman Minsky (1992) "The Financial Instability Hypothesis" —
         Levy Economics Institute WP 74, free
       - NBER working-paper versions of Reinhart-Rogoff,
         Schularick-Taylor etc. where they exist freely
       - For commercial books Dalio cites (Kennedy, Koo, Eichengreen,
         Ferguson, Allison, Huntington, Goodhart-Pradhan, Friedman-
         Schwartz, Reinhart-Rogoff hardcover): CITE only, do NOT
         quote beyond a single fair-use sentence, use publisher page
         or Wikipedia entry as the verifiable URL.
  5. Industry-standard sources to close gaps Dalio does not address:
       ONLY if no Dalio/Dalio-cited source covers the gap. MUST be
       marked per R7 below.

DELIVERABLE
  One Markdown file, 2000-3000 words, saved at:
  research/{SEQ}_{slug}.md
  (where SEQ and slug come from the mapping table in spec § 5)

HARD RULES
  R1. Every one of the 10 required sections below must be present.
      Missing a section = research failure, report will be rejected.
  R2. Every numeric threshold or formula must cite a Dalio source
      (title + page or URL). No invented numbers. No "Claude estimates."
  R3. Every input variable must name a specific public data source
      (API endpoint or dataset ID). No "could be found somewhere."
  R4. Narrative theory gets <=15% of the word budget.
      Models, inputs, formulas, and worked examples get >=85%.
  R5. If Dalio's writing is ambiguous on a numeric threshold, say so
      explicitly in section 10 — do not paper over with a fabricated number.
  R6. Do NOT cover material assigned to other subsections (see OUT-OF-SCOPE).
      If you find yourself writing about an out-of-scope topic, stop and
      summarize your content in ONE sentence with a pointer instead.
  R7. ATTRIBUTION DISTINCTION (public-repo rule).
      Every claim must be visually attributed to either (a) Dalio /
      Bridgewater, or (b) an explicitly-named non-Dalio source.
      Dalio-sourced content uses this marker:
          > **Dalio** — source: "Big Debt Crises", Part 1, p. 47:
          > "...quote or paraphrase..."
      Non-Dalio / industry-standard content uses this marker:
          > **NON-DALIO (industry standard)** — source: [full citation +
          > public URL]. Used to close a gap because Dalio does not
          > specify [what]: "...quote or paraphrase..."
      Any report that mixes the two without this markup, or that
      presents a non-Dalio claim as if it were Dalio's, will be rejected.
  R8. PUBLIC-ACCESS RULE.
      Every source you cite MUST have a public URL the reader can open
      without a paywall or login. If a source is paywalled but a free
      working-paper or preprint version exists (e.g., NBER, SSRN, Levy
      Institute), link the free version. Do NOT cite works you have
      not actually viewed in full. Library access is not available.
  R9. NO EMBEDDED COPYRIGHTED TEXT.
      For commercial books you cite (Kennedy, Koo, Eichengreen, etc.),
      quote no more than ONE sentence at a time and no more than TWO
      sentences cumulative per book. Paraphrase the rest in your own
      words.

REQUIRED OUTPUT SCHEMA (exact section titles, exact order)
  § 1  Executive Summary                  (<=100 words)
  § 2  Dalio's Framework — Verbatim       (3-6 direct quotes with full citations)
  § 3  Decision Problem                    (what question does this answer?)
  § 4  Input Variables Table
         Columns: name | description | unit | data source | API endpoint |
                  update frequency | typical range
  § 5  Computation / Transformations       (formulas in LaTeX or clear prose)
  § 6  Output Variables & Decision Rules   (thresholds -> regime/action)
  § 7  Worked Numeric Example              (illustrative small numbers, step by step)
  § 8  Implementation Specs
         8a. JS — function signature, fetch URLs, pseudo-code
         8b. Excel — sheet layout, Power Query M or URL, key formulas
         8c. ECharts config — chart type, encoding, palette tokens
             DARK THEME, minimal black + elegant green:
               bg-0 #0a0a0a (deepest black), bg-1 #141414 (cards),
               bg-2 #1e1e1e (elevated), hairline #262626,
               text-1 #f5f5f5 (primary), text-2 #a3a3a3 (secondary),
               green-core #00d08c, green-soft #00d08c33 (20% alpha),
               green-glow #7fffd4 (pulse highlight),
               signal-red #e5484d (for down/warning only)
  § 9  Integration Points                  (upstream dependencies, downstream consumers)
  § 10 Open Questions, Limitations, Sources

TONE
  Crisp, declarative, zero hedging. Write for a PM, not a professor.
```

---

## 8. Consolidation — from 12 reports to 3 artifacts

After all 12 reports land in `research/`, I build the artifacts in this order:

1. **README.md** — high-level framework doc that references each report.
2. **dalio_dashboard.html** — single file, pure JS, ECharts, Tailwind CDN, tabs + widgets per § 10.
3. **dalio_model.xlsx** — Power Query + input sheet + calc sheets + dashboard + decision log per § 11.

Each report's § 8 (Implementation Specs) is the direct input to the corresponding artifact code.

---

## 9. README.md outline (artifact #1)

| # | Section | What it contains |
|---|---|---|
| 1 | Title + subtitle | "The Dalio Framework — Operational Edition" |
| 2 | What this is / who it's for | 150 words |
| 3 | The framework at a glance | 500 words: the 12 subsections as one story |
| 4 | How the two stacks work | HTML vs Excel; when to use each |
| 5 | Quick start — HTML | Double-click the .html, click tabs, enter inputs |
| 6 | Quick start — Excel | Open, enable Power Query, click Refresh All |
| 7 | The 12 subsection models | Table: ID, title, inputs, outputs, link to research/ file |
| 8 | Data sources | Registry table (see § 12) |
| 9 | Visual language | Palette + typography + one example chart |
| 10 | Known limitations & open items | From each report's § 10, deduplicated |
| 11 | Attribution legend | Explains the **Dalio** vs **NON-DALIO (industry standard)** markers readers will see throughout the repo. Tells readers how to verify every claim. |
| 12 | License, credits, Dalio sources | MIT license for the repo's own code + our framework implementation. All Dalio references credited to economicprinciples.org + bridgewater.com. All non-Dalio sources credited inline with public URLs. |

---

## 10. dalio_dashboard.html (artifact #2)

**Tab structure** (workflow-ordered, per D10):

```
┌─ Tab 1: Macro Regime ─────────────────────────────────────┐
│  KPI band:  ST-cycle phase | LT-cycle phase | Paradigm    │
│             state | World-order score (US, CN)             │
│  Chart 1:   4-box regime heatmap (growth × inflation)      │
│  Chart 2:   Empire 8-measures radar (US vs CN vs others)  │
│  Chart 3:   Debt/GDP vs real rate scatter over time       │
│  Chart 4:   Deleveraging-type probability bars            │
│  Inputs:    regional filter, as-of date                   │
└────────────────────────────────────────────────────────────┘
┌─ Tab 2: Portfolio Builder ────────────────────────────────┐
│  Return-stream picker (15-20 uncorrelated streams)        │
│  Correlation matrix heatmap                                │
│  All-Weather canonical allocation vs user override        │
│  Alpha sleeve sizer                                        │
│  Vol target + leverage slider                              │
│  Output: final portfolio weights table + pie              │
└────────────────────────────────────────────────────────────┘
┌─ Tab 3: Stress Test ──────────────────────────────────────┐
│  Scenario selector (Dalio templates + custom)             │
│  Asset-class P&L bars per scenario                        │
│  Portfolio P&L distribution                               │
│  Historical analogue viewer                               │
└────────────────────────────────────────────────────────────┘
┌─ Tab 4: Decision Log ─────────────────────────────────────┐
│  Add entry: date, regime call, allocation, rationale,     │
│             review date                                    │
│  Table of past entries (persisted in localStorage)        │
└────────────────────────────────────────────────────────────┘
┌─ Tab 5: Reference ────────────────────────────────────────┐
│  Glossary | Data source registry | Links to research/*.md │
└────────────────────────────────────────────────────────────┘
```

**Auto-refresh behavior (locked per user input):**
- Dashboard polls every **60 seconds**
- Per-variable TTL (respect upstream cadence; avoid hammering APIs):
  - Daily-updating series (SPX, DGS10, gold, DXY, TLT): 60s TTL (always refetch on tick)
  - Monthly series (CPI, unemployment, M2, Fed Funds): 1-day TTL
  - Quarterly series (GDP, debt): 7-day TTL
  - Annual series (World Bank GDP, empire measures): 30-day TTL
- On every tick, iterate each box; if its TTL expired, refetch and mark as "refreshed this tick"
- For every box marked "refreshed this tick", run the **pulse animation** (see Visual section § 13)
- Boxes whose TTL had not expired are **untouched** — no animation, no fetch
- Free-tier API rate-limit guardrails:
  - Alpha Vantage / FMP: NOT used for 60s-TTL series (their daily caps would blow out in <1 hour); reserved for slow-moving data only
  - FRED / World Bank / ECB / Stooq: primary data sources; well within their generous quotas

**Decision log persistence (locked per user input):**
- `localStorage` is primary
- **Export to .csv button** and **Import from .csv button** visible in Tab 4
- CSV schema: `date, regime_call, allocation_json, rationale, review_date, tags`

**Technical constraints:**
- File size target: under 500 KB (Tailwind + ECharts via CDN, no bundling)
- Loads in < 2 seconds on cached second visit
- Degrades gracefully on API failure — show last cached value with a **muted red dot** on the box header and a timestamp of the last successful fetch
- No build step. Edit the `.html` directly.

---

## 11. dalio_model.xlsx (artifact #3)

**Sheet list:**

| # | Sheet | Type | Contents |
|---|---|---|---|
| 1 | `README` | Static | 1-page how-to for the workbook |
| 2 | `Dashboard` | Live | Summary tiles + 4 key charts (mirrors HTML Tab 1) |
| 3 | `Inputs` | User-edit | Named ranges: user overrides for expected returns, vol, correlations, regime bets |
| 4 | `Data_Macro` | Power Query | FRED / World Bank / ECB / IMF pulls |
| 5 | `Data_Assets` | Power Query | Stooq asset prices, SEC EDGAR filings |
| 6 | `Calc_Regime` | Formula | Subsections 1.1–1.6: cycle detection, world-order scoring |
| 7 | `Calc_Inflation` | Formula | Subsection 1.7: inflation regime + gold allocation rec |
| 8 | `Calc_Portfolio` | Formula | Subsections 2.1–2.4: Holy Grail diag, All-Weather, alpha, leverage |
| 9 | `Calc_Stress` | Formula | Subsection 2.5: scenario P&L grid |
| 10 | `Decision_Log` | User-edit | Same schema as HTML Tab 4 |

**Technical constraints:**
- All Power Query connections use URLs visible in the sheet — no hidden credentials
- `Inputs` sheet has every user-tunable value in a single column (named ranges)
- Conditional formatting uses only the Bridgewater-esque palette
- No macros, no VBA — Power Query M language only (works on Mac + Windows)

---

## 12. Data source registry (illustrative — agents complete per subsection)

| Variable | Units | API | Endpoint / ID | Freq | Used in |
|---|---|---|---|---|---|
| US GDP (nominal) | $B | FRED | `GDP` | Q | 1.1, 1.3 |
| US Federal Debt | $B | FRED | `GFDEBTN` | Q | 1.3 |
| US 10y Treasury yield | % | FRED | `DGS10` | D | 1.2, 1.3, 1.7 |
| US CPI | index | FRED | `CPIAUCSL` | M | 1.7, 2.2 |
| US Unemployment | % | FRED | `UNRATE` | M | 1.2 |
| US M2 | $B | FRED | `M2SL` | M | 1.7 |
| Fed Funds rate | % | FRED | `FEDFUNDS` | M | 1.2 |
| 10y–2y spread | pp | FRED | `T10Y2Y` | D | 1.2 |
| US real 10y | % | FRED | `REAINTRATREARAT10Y` | M | 1.7 |
| Gold (London AM) | $/oz | FRED | `GOLDAMGBD228NLBM` | D | 1.7, 2.2 |
| DXY | index | Stooq | `^dxy` | D | 1.7 |
| SPX | index | Stooq | `^spx` | D | 2.2, 2.5 |
| Long-bond ETF (TLT) | px | Stooq | `tlt.us` | D | 2.2, 2.5 |
| World GDP | $T | World Bank | `NY.GDP.MKTP.CD` | A | 1.6 |
| Credit / GDP gap | pp | BIS | `credit_gaps` | Q | 1.3 |

Each agent's § 4 extends this table with any additional variables their subsection requires.

---

## 13. Visual design language — Claude-editorial × Apple-elegant × black+green

The dashboard is designed to feel like a **Claude / Anthropic editorial surface** wearing a **dark terminal jacket**, animated with **Apple-level motion restraint**. The palette is locked at black + green; the sophistication comes from typography, spacing, motion, and micro-detailing.

### 13.1 Design DNA — three influences, one surface

| Influence | What we borrow |
|---|---|
| **Claude / Anthropic brand** | Editorial serifs for emphasis; warm dark (not cold); restrained, patient typography hierarchy; tone of confident understatement; headline-as-moment rather than headline-as-label |
| **Apple (iOS / macOS)** | Haptic-feeling easing curves (`cubic-bezier(0.32, 0.72, 0, 1)`); 4-pt spacing grid; surface elevation via color, not shadow; precise hit-targets; motion that acknowledges (never performs) |
| **Trading terminal** | Information density where it matters (KPI bands, tables); monospaced numerics with tabular figures; per-box refresh semantics; stale/fresh indicators |

If a design choice doesn't serve **at least two** of these three, we drop it.

### 13.2 Palette — locked

| Token | Hex | Use |
|---|---|---|
| `bg-canvas` | `#0B0B0B` | Page background. Warm-black (not pure `#000`) — subtle warmth distinguishes Claude/Apple dark from Windows-dark. |
| `bg-surface` | `#141414` | Box/card background |
| `bg-elevated` | `#1C1C1C` | Modal, popover, hover state |
| `bg-inset` | `#080808` | Chart backgrounds, table header bands |
| `hairline` | `#262626` | 1px borders, table separators. Never thicker. |
| `text-primary` | `#F5F5F5` | Headings, KPI values, body |
| `text-secondary` | `#A3A3A3` | Labels, captions |
| `text-tertiary` | `#6B7280` | Disabled, placeholder |
| `green-core` | `#00D08C` | Primary accent: active state, data lines, key values |
| `green-soft` | `#00D08C33` | 20% alpha fill (chart areas, hover tints) |
| `green-glow` | `#7FFFD4` | Pulse-ring peak (refresh animation) |
| `signal-red` | `#E5484D` | Negative P&L / breach / stale-data dot |
| `warm-accent` | `#D4A373` | RESERVED — a single warm sand used only for emphasis in editorial headers (Claude nod) |

**Hard rule:** no other colors enter the file. Every chart, icon, border, state uses tokens above.

### 13.3 Typography — editorial-meets-terminal

**Fonts (all free, loaded from Google Fonts CDN):**

| Role | Family | Weight | Notes |
|---|---|---|---|
| **Editorial headline** (hero, section titles) | **Fraunces** | 400 (with `opsz 144`) | The serif that gives the surface its "Claude" feeling. Used sparingly — never for labels. |
| **UI body + headings** | **Inter** | 400 / 500 / 600 | Workhorse. All labels, navigation, descriptions. |
| **Numerics** | **IBM Plex Mono** | 500, tabular figures | Every KPI value, every table number, every axis tick. |

**Scale (pt at base 14):** 11 · 12 · 14 · 16 · 20 · 28 · 40

- 40pt Fraunces — hero-only (page title)
- 28pt Fraunces — section titles (Tab 1, Tab 2 names when introduced)
- 20pt Inter 600 — card titles
- 16pt Inter 500 — sub-titles, KPI values (Plex Mono for the number itself)
- 14pt Inter 400 — body
- 12pt Inter 500 uppercase +0.06em tracking — labels, eyebrows
- 11pt IBM Plex Mono — tabular cells

**Typography rules (Claude-informed):**
- Headlines have breathing room — minimum 24pt of space above them
- Eyebrows (12pt uppercase) always precede section titles
- Numbers NEVER wrap; use `white-space: nowrap; font-variant-numeric: tabular-nums`
- Titles never use all-caps
- Body copy `line-height: 1.5`; headings `line-height: 1.15`; numerics `line-height: 1.0`

### 13.4 Spacing, grid, elevation (Apple-informed)

- **Grid:** 4-pt base. All spacing ∈ {0, 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96}.
- **Layout grid:** 12-column fluid. Max content width 1440px on desktop; content respects safe areas on mobile.
- **Box geometry:** `border-radius: 6px` (more refined than 4, less cartoonish than 12). `border: 1px solid hairline`. No drop shadows — elevation is communicated by bg-color shift (`bg-canvas` → `bg-surface` → `bg-elevated`).
- **Gutter between boxes:** 16pt on tablet, 24pt on desktop.
- **Box internal padding:** 20pt horizontal, 16pt vertical.
- **Hit targets:** minimum 40×40pt for any interactive element. Buttons have generous internal padding (12pt × 16pt).

### 13.5 Motion (Apple-informed)

Every animation uses one of these three curves:

```css
--ease-emphasized:   cubic-bezier(0.32, 0.72, 0, 1);   /* acknowledgement */
--ease-decelerate:   cubic-bezier(0.0, 0.0, 0.2, 1);   /* entrance */
--ease-accelerate:   cubic-bezier(0.4, 0.0, 1, 1);     /* exit */
```

Durations: 150ms (state), 250ms (property change), 400ms (layout), 900ms (pulse).

**Motion rules:**
- Animations acknowledge user intent, never perform for the user
- No bounces, no rubber-banding, no spring overshoot
- Prefer opacity + transform over width/height/color
- Respect `prefers-reduced-motion` — if set, replace animations with instant color changes
- No more than two things animate simultaneously on user action

### 13.6 Pulse-on-refresh animation (locked per user)

When a box's data refetches on a 60s tick, the box emits a **hollow green ring** that expands, peaks, and fades:

```
t=0ms      box border = hairline #262626
t=0→180ms  box border + box-shadow ramp: hairline → green-glow #7FFFD4
             ease-decelerate
t=180ms    peak — border #7FFFD4, shadow = 0 0 0 1px #7FFFD4, 0 0 16px #7FFFD4AA
t=180→220ms hold at peak
t=220→900ms decay: peak → hairline, ease-accelerate
```

Implementation:
```css
@keyframes pulse-refresh {
  0%   { box-shadow: 0 0 0 1px #262626, 0 0 0px transparent; border-color: #262626; }
  20%  { box-shadow: 0 0 0 1px #7FFFD4, 0 0 16px #7FFFD4AA; border-color: #7FFFD4; }
  24%  { box-shadow: 0 0 0 1px #7FFFD4, 0 0 16px #7FFFD4AA; border-color: #7FFFD4; }
  100% { box-shadow: 0 0 0 1px #262626, 0 0 0px transparent; border-color: #262626; }
}
.box.refreshed { animation: pulse-refresh 900ms var(--ease-emphasized); }
```

Only boxes whose TTL expired and whose fetch succeeded this tick get the `.refreshed` class (which is removed after the animation completes).

### 13.7 Iconography

- Icon set: **Lucide** (free, MIT, line-based, feels Apple-adjacent). Load via CDN, pulled on demand.
- Stroke width: 1.5px. Size: 16px default.
- Icons never carry color on their own — always inherit `currentColor`, which defaults to `text-secondary` and turns `green-core` on active states.

### 13.8 Excel application of the theme

Excel can't render the HTML dashboard's refinement but it can honor the palette and typographic logic:

| Element | Style |
|---|---|
| Worksheet bg | `#0B0B0B` |
| Header band fill | `#141414` with `#F5F5F5` text |
| Data area fill | `#141414` |
| Positive numbers | `#00D08C` |
| Negative numbers | `#E5484D` |
| Stale/warning indicator | Red circle icon (conditional format) |
| Cell borders | `#262626` hairline only — no heavy grids |
| Font (text) | **Segoe UI** 10pt |
| Font (numbers) | **Consolas** 10pt tabular |
| Row height | 22pt (slightly generous, Apple-ish) |
| Freeze panes | Header row + leftmost ID column |

No charts with skeuomorphism. Line charts only, `#00D08C` on `#141414`, hairline axes.

---

## 14. Risk register

| # | Risk | Mitigation |
|---|---|---|
| R1 | Agent prompt produces narrative not models | Pilot-first; reject reports where theory >15% word budget |
| R2 | Agents overlap on shared topics (e.g., debt cycles appears in 1.1, 1.2, 1.3) | Explicit SCOPE_IN / SCOPE_OUT in every prompt; R6 hard rule |
| R3 | Agent fabricates numeric thresholds | R2 hard rule: cite or put in § 10 (Open Questions) |
| R4 | CORS fails on some API from the browser | Pre-tested list in § 12; fallback to static snapshot with "STALE" flag |
| R5 | Excel Power Query breaks on Mac for specific connector | Stick to generic Web connector (works on both platforms) |
| R6 | Dashboard ECharts file size bloats | Stay on CDN (don't bundle), monitor total file size |
| R7 | User loses their inputs when reopening HTML | Persist via localStorage (documented limitation: clears on private browsing) |
| R8 | Dalio source URLs rot | Every citation includes title + page + URL; fallback to title match via web search |
| R9 | Consolidation phase balloons beyond one MD | Strict 4-page target per subsection in README; full depth only in research/ |
| R10 | Public-repo copyright violation via embedded paywalled text | Hard rules R7/R8/R9 in § 7 prompt; post-pilot audit of Wave 0 report for any quote >1 sentence from a copyrighted source |
| R11 | Non-Dalio material presented as if Dalio's (attribution bleed) | R7 visual markers required in every report; self-audit during consolidation before publishing to README.md |

---

## 15. Open questions — RESOLVED

All four originally-open questions are now locked per user input:

| # | Question | Locked answer |
|---|---|---|
| Q1 | Geography scope | US + China + UK + Japan + EU (Dalio's Changing World Order comparison universe) |
| Q2 | Live-data refresh | 60s auto-refresh with per-variable TTLs (see § 10). Pulse-green animation on boxes that actually refetched this tick. |
| Q3 | Decision log portability | `localStorage` primary + CSV export/import buttons |
| Q4 | Recency of sources | Through 2026-04-23 (today) — include all post-2022 LinkedIn, interview, speech material |

---

## 16. Dashboard design iteration protocol (per D15, user directive)

The HTML dashboard is NOT built in one pass. It gets a **dedicated multi-iteration design phase** after research reports land and after the first functional build. Quality target: "Apple-level elegance" — which means we pay for it in passes.

### 16.1 Phases (each is its own commit / review cycle)

```
Phase A  — Functional skeleton
           Build the 5 tabs, wire all charts and data, hit all ECharts configs
           from research reports. Correctness first, aesthetics raw.
           DONE WHEN: every KPI/chart shows a real number, auto-refresh works.

Phase B  — Typography + spacing pass
           Apply Fraunces/Inter/Plex Mono. Enforce 4pt grid. Tune sizes,
           line-heights, tracking, vertical rhythm. No color work yet.
           DONE WHEN: the page reads like an editorial at every breakpoint.

Phase C  — Palette + surface pass
           Apply locked tokens. Surface elevation via bg-color shifts.
           Hairline audit. Every color used is from the palette.
           DONE WHEN: a reviewer opens the page and their first words are
                      "this is elegant."

Phase D  — Motion + pulse pass
           Implement pulse-refresh. Every state change uses one of three
           eases. Respect prefers-reduced-motion. Time each interaction.
           DONE WHEN: the dashboard acknowledges every user intent without
                      performing.

Phase E  — Density + hierarchy pass
           Verify information density where needed (tables, KPI bands) vs
           generosity where appropriate (hero, editorial moments).
           Kill any chartjunk. Reduce, reduce, reduce.
           DONE WHEN: nothing on the page can be removed without loss.

Phase F  — Micro-detail pass
           Hover states, focus rings, disabled states, stale-data dots,
           empty states, loading skeletons, error surfaces.
           DONE WHEN: you can't find a state that isn't designed.

Phase G  — Responsive + device pass
           1440 desktop, 1024 laptop, 768 tablet, 390 mobile.
           Verify reflow + touch targets + pulse animation on each.
           DONE WHEN: the dashboard is equally credible on all four.

Phase H  — Final polish (held for user feedback)
           You (user) review the full surface and call out any remaining
           rough edges. We iterate until you approve.
```

### 16.2 Review cadence

After each phase (A–G), I commit and send you a link or screenshot set. You spend ≤10 minutes reviewing and give me a list of "keep / fix / cut". I adopt all fixes, ask about ambiguous ones, then move to the next phase.

**No phase is skipped.** Even if Phase B feels obvious, we do it deliberately so the dashboard is internally consistent.

### 16.3 Anti-patterns we enforce against

- Dropshadow-driven elevation (we use color)
- Rounded-XL (we use 6px)
- Gradient fills (we use solid)
- Color-coded warnings that aren't in the palette
- Icons in arbitrary colors
- Text that isn't in Fraunces / Inter / Plex Mono
- Chart legends that repeat axis labels
- Decorative animation

---

## 17. Approval checklist

Before I invoke `writing-plans` and start Wave 0, you need to sign off on:

- [ ] 12-subsection decomposition in § 5
- [ ] Scope boundaries for every subsection in § 5
- [ ] Deterministic prompt template in § 7, including new hard rules R7 (attribution distinction), R8 (public-access), R9 (no-embedded-copyright)
- [ ] Required output schema (10 sections) in § 7
- [ ] Public-repo constraint in § 2 non-goals
- [ ] 5-tab HTML structure in § 10
- [ ] 10-sheet Excel structure in § 11
- [ ] Visual palette + typography + motion in § 13 (Claude + Apple + black+green)
- [ ] Dashboard design iteration protocol in § 16 (multi-pass Phase A–H)
- [ ] Resolved answers in § 15 (all four locked)

When you say approved, I mark the brainstorming checklist complete and invoke `superpowers:writing-plans` to create the implementation plan for Wave 0 (the pilot research agent on subsection 1.1 — Economic Machine Template).
