# Engine v4.3 Handoff to claude.ai polish phase

**Date:** 2026-05-06
**HEAD after engine build:** `e74a1f3935fad9d3fbb66a14b53ab0f67974ffc5`
**Generated file:** `pilot/dalio_dashboard.html` (85,219 bytes, 2,193 lines)
**Spec:** `docs/superpowers/specs/2026-05-06-dashboard-design.md` @ commit `6817872`
**Plan:** `docs/superpowers/plans/2026-05-06-dalio-dashboard-engine.md`
**Build script:** `pilot/build_dashboard.py` (regenerable via `python pilot/build_dashboard.py`)

## Engine deliverables status (per spec §16.1)

Auto-verified by Python tests (44/44 pass at HEAD):
- [x] `pilot/dalio_dashboard.html` exists, replaces Wave 0
- [x] All 51 slides render in HTML structure (3 chrome + 12 sections × 4 stages)
- [x] All 51 slots in scroll-track present
- [x] Stage container with `id="stage"` + `class="stage"`
- [x] Chrome: `<header class="brand-bar">`, `<nav class="minimap">`, `<footer>` all with `mix-blend-mode: difference` via CSS
- [x] All 12 sections from research/01-12 wired into A/B/C/D slides
- [x] 3 chart containers present: `chart-1-4`, `chart-2-2`, `chart-2-5`
- [x] Inline JS includes: AF reveal IN+OUT, transitionTo, IntersectionObserver, minimap tracker, ECharts decal helper, KaTeX auto-render
- [x] Tab title + favicon + theme-color set per V23/V24/V25
- [x] Byte-exact reconciliation: §2.5 contributions ([-8.13, -26.00, -3.05, 11.83]) verbatim in research/12 §7

Requires manual browser verification (next step):
- [ ] Page opens via double-click (no server)
- [ ] Slideshow nav works (scroll-snap, IO fires transitionTo, mini-map dots active)
- [ ] AF reveal IN+OUT fire correctly (no flash, no overflow, no mid-word wrap)
- [ ] Bg roll works on every transition (350ms cubic, alternation matches data-bg)
- [ ] mix-blend-mode chrome auto-flips per slide bg
- [ ] All 3 ECharts charts render with decal patterns (no color)
- [ ] All 12 KaTeX formulas render correctly
- [ ] Hairline rules above text render correctly

## Known polish-phase items (per spec §16.2)

Carried into polish phase:
1. **v4.3 TOC complaint unresolved** (per spec §13). User: "looks exactly the same as before" on v4.3 TOC. Diagnose at polish: hard refresh + screenshot QA.
2. **§1.4 chart_data percentages are DERIVED from research/04 §7 narrative**, not byte-exact. The §7 narrative describes lever-mix qualitatively (e.g., "defaults dominant, printing low") rather than providing explicit percentages. Validate at polish if exact reconciliation matters.
3. **§2.2 portfolio label order** differs from Robbins (2014) original. Cosmetic — labels and weights arrays are aligned correctly.
4. **§2.5 Dalio quote** ("the All Weather asset mix performed as expected.") is thematically thin. No better verbatim ≤15-word candidate found in research/12 §2. Polish phase may want to relax the ≤15-word constraint or use a §3-sourced quote instead.
5. **Worked-example details on §D slides simplified** (only formula + verdict, not the per-section worked numeric breakdown that was in §1.4 prototype). Polish phase decides whether to add per-section worked examples.
6. **Per-section variance not implemented**: §2.3 Alpha + §2.4 Risk Parity may want 5 slides instead of 4 (decomposition + leverage as separate slides). Currently render 4 slides per uniform template.
7. **Mobile responsive tuning** not yet validated at viewport ≤720px.

## Polish workflow (per spec §16.2)

The engine HTML is engine-ready. Polish steps happen at `claude.ai` web canvas (artifacts):

1. Open the generated `pilot/dalio_dashboard.html` in claude.ai artifacts
2. Iterate on visual polish: typography micro-tuning, animation refinement, copy edits, chart density tuning, TOC redesign per §13 open question, mobile responsive, cross-browser QA
3. Polished HTML replaces engine HTML in repo when ready

## Regeneration

If the engine HTML needs full regeneration (e.g., research file content changed):
```
cd C:\Users\sinas\OneDrive\Desktop\Projects\RayDalioAttitude
python pilot/build_dashboard.py
```

This is a one-shot regeneration. Per spec §11.2, post-engine polish edits happen on the HTML directly, NOT round-tripped through build_dashboard.py.
