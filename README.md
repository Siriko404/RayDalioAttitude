# The Dalio Framework — Operational Edition

> **Status:** WORK IN PROGRESS. Framework under construction. This README will be replaced by the final one-document framework explainer when the project completes.

This repository consolidates **Ray Dalio's publicly-published investment and macroeconomic frameworks** into three operational artifacts that a portfolio manager can actually use:

| Artifact | What it is | State |
|---|---|---|
| `README.md` | One-document framework explainer + how-to for the other two artifacts | **placeholder** |
| `dalio_dashboard.html` | Single-file browser dashboard (pure JS, ECharts, pulls live data from free APIs) | not built |
| `dalio_model.xlsx` | Excel model with Power Query connections to the same APIs | not built |

## Scope

- Dalio's **investment and macro** frameworks only (debt cycles, paradigm shifts, changing world order, inflation/currency, All-Weather, Holy Grail, risk parity, stress-testing). Life & Work / management principles are out of scope.
- **12 subsections across 2 modules.** See the design spec for the breakdown.
- Built from **freely-available** Dalio publications on `economicprinciples.org`, `bridgewater.com`, and LinkedIn.

## Attribution standard

This is a public repository. Every claim is attributed to one of:

- **Dalio** — his own public writings
- **NON-DALIO (industry standard)** — explicitly marked, used only to close gaps Dalio doesn't address, with full citation and public URL

We do not embed copyrighted paywalled material. Commercial books that Dalio cites (Kennedy, Koo, Eichengreen, etc.) are referenced by citation only, with at most minimal fair-use snippets.

## Current state

See these paths for the work in progress:

- `docs/superpowers/specs/2026-04-23-dalio-framework-design.md` — the design contract
- `docs/superpowers/plans/` — implementation plans as they're written
- `research/` — per-subsection research reports as they land (12 total)
- `dalio_market_principles_syllabus.md` — reference: the actual syllabus of the Dalio Market Principles Online Programme (WMI + ADGM Academy)

## License

MIT. See `LICENSE`. Ray Dalio's frameworks are credited per his public writings; this repository's own code and text are MIT-licensed.
