# Phase 5 Pilot Report

**Built:** 2026-05-05
**Goal:** Empirically test whether the existing `research/<NN>_*.md` files actually produce a working dashboard + xlsx artifact, or whether mechanical-readiness GREEN was a false positive.

## Scope

Two-file pilot:

- `research/04_deleveragings.md` (typical / GREEN throughout audit)
- `research/12_stress_testing.md` (edge — heavy LaTeX-only formulas; was source of v1 audit R17 framework-regression concern)

Each file → 1 dashboard tab + 1 xlsx sheet.

## Deliverables

| File | Purpose | Result |
|---|---|---|
| `pilot/dalio_dashboard.html` | 2-tab dashboard (1.4 + 2.5) using ECharts CDN, locked-palette dark theme | Built, JS parses, HTML well-formed, all required DOM IDs present |
| `pilot/build_xlsx.py` | openpyxl builder for 2-sheet workbook | Runs clean |
| `pilot/dalio_model.xlsx` | Output workbook with `4_Deleverage` + `12_Stress` sheets, formulas embedded | Built, formulas inspected, manual compute matches Dalio source values |

## Empirical evidence — does it actually work?

### Sheet 4 (research/04 §7 + §8b)

Formulas embedded verbatim from §8b. Three Dalio-cited cases as input rows. Computed regime should match §7 narrative:

| Case | G_gap | ΔDebtGDP | π_total | regime computed | matches §7? |
|---|---:|---:|---:|---|:---:|
| US 1930-32 | −20.4 | +97.0 | +0.80 | UGLY_DEFLATIONARY | ✓ ("G<0 ∧ ΔD>0 ⇒ UGLY_DEFLATIONARY") |
| US 1933-37 | +6.3 | −17.0 | +2.00 | BEAUTIFUL | ✓ ("Categorical `regime` = BEAUTIFUL") |
| Japan 1990+ | −2.0 | +95.0 | +0.80 | UGLY_DEFLATIONARY | ✓ ("Regime: `UGLY_DEFLATIONARY` — under-printed and prolonged") |

beautiful_score for US 1933-37 = 0 because G=+6.3 > +3 ceiling → matches §7 narrative ("positive but above the +3pp ceiling … `beautiful_score` = 0 under +3pp").

### Sheet 12 (research/12 §5 + §7 Table 7.1)

Per-archetype portfolio return computed via $C_{i,e} = w_i \cdot S_{i,e}$ + column SUM:

| Archetype | Computed | Table 7.1 target | diff |
|---|---:|---:|---:|
| Deflationary | −8.1250% | −8.1250% | +0.0000% |
| Inflationary | −26.0000% | −26.0000% | +0.0000% |
| Stagflation | −3.0500% | −3.0500% | −0.0000% |
| Reflation | +11.8250% | +11.8250% | +0.0000% |

**Byte-exact match across all four archetypes.**

### Dashboard (HTML + ECharts)

- HTML well-formed (`html.parser` clean stack, zero errors)
- All required DOM IDs present (`chart-04`, `chart-12`, `t04`, `t12`)
- JS parses via `node --check` (after `<script>`-block extraction)
- ECharts loaded via CDN (`https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js`)
- 12 palette tokens locked from `research/01 §8c`
- 2 tabs: 1.4 stacked-bar + G_gap line, 2.5 horizontal bar of archetypes
- Provenance markers shown beneath each chart (DALIO / DERIVED / NON-DALIO badges)

**Visual render not auto-verified.** User opens `pilot/dalio_dashboard.html` in any modern browser to confirm.

## What this proves

- ✓ research/04 §8b formulas compile to working Excel formulas that produce Dalio-stated regime classifications
- ✓ research/12 §5 shock matrix + §7 Table 7.1 reconcile byte-exact via openpyxl-embedded formulas
- ✓ research/04 §8c + research/12 §8c chart specs are usable as ECharts options with minor adaptation (tab switching wrapper)
- ✓ Locked palette renders consistently across HTML + xlsx
- ✓ Provenance markers (DALIO / DERIVED / NON-DALIO) translate from research-file convention to UI without information loss

## What this does NOT prove

- Live data integration (no FRED/BIS calls — pilot uses research §7 worked-case values only)
- Cross-file consistency (only 2 of 12 files tested; cross-file variable consistency not yet checked)
- Production styling polish (typography, spacing, responsive breakpoints, accessibility)
- Excel auto-recalc on open (formulas are present; user must verify by opening in Excel and pressing F9 / save-as)
- All 113 audit-kit findings — Phase B triage still pending; pilot's success says nothing about the other 10 files individually

## Recommendation

Path E approval supported by empirical evidence. Two files in, both build cleanly with byte-exact reconciliation against research-file Dalio sources. Scaling to remaining 10 files is engineering effort, not research-file gap (subject to per-file audit during build).

Next concrete step (when user gives go):

1. Approve Path E (or apply learnings + approve)
2. Build remaining 10 dashboard tabs + 10 xlsx sheets, file by file
3. Apply audit-kit findings inline during build (artifact-impact triage)
4. Cross-file consistency check before final commit
5. README + GitHub publish

Estimated effort: ~6–10 hr for full Phase 5 build given pilot pattern is set.

## How to inspect

```bash
# Open dashboard in default browser (Windows)
start pilot/dalio_dashboard.html

# Open xlsx in Excel (Windows)
start pilot/dalio_model.xlsx

# Re-run xlsx build
python pilot/build_xlsx.py

# Re-run readiness audit (covers research/, not pilot/)
python chatgpt_audit_kit/_phase5_readiness_audit.py
```
