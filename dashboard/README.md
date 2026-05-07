# Dalio Dashboard v2

Live analytical workflow tool implementing Ray Dalio's 12 frameworks as a sequential narrated single-page web app, ending in one decisive portfolio recommendation.

**Spec:** `docs/superpowers/specs/2026-05-06-dashboard-design.md`
**Plan:** `docs/superpowers/plans/2026-05-06-dalio-dashboard-engine-v2.md`

## Tech stack

Vanilla JS · Vite 5 · Vitest 2 + happy-dom + Playwright · ECharts 5 · GSAP 3 · Source Serif 4 + DM Mono · Cloudflare Worker backend

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run test         # unit tests (vitest)
npm run test:e2e     # Playwright
```

## Deploy

```bash
npm run build                # → dashboard/dist
npm --workspace backend run deploy   # → Cloudflare Worker
```

## Constitution (non-negotiable)

1. Pure B&W only — differentiation by pattern + weight, never color
2. One semantic point per slide
3. Chart-primary, text-secondary
4. Suggestive, not prescriptive
5. Single fetch on page load (Set 3.5 D3)
6. Static thin-client + serverless backend
7. Pattern-based BW differentiation in charts (FR-5.1)
8. Suggestive output is the entire point — final recipe block is the destination

## Architecture

```
Wizard (3-tier)  →  Single fetch  →  Compute pipeline (13 modules in DAG order)
                                      ↓
       Chip strip ← Slide render ← Tilt arbiter (FR-12: INFL > STAGFL > max(DELEVER, PARADIGM) > BASE)
                                      ↓
                              Final Recommendation slide (recipe + tail + binding rule + disclaimer)
```

Compute order: 1.1 → 1.2 → 1.3 → 1.4(cond) → 1.7 → 1.5 → 1.6 → 2.1 → 2.2 → 2.5 → 2.4 → 2.3 → tilt arbiter → final.

## v1.1 deferred

- FR-11 Excel-parallel xlsx export (Q5.2 lock)
- Server-side regime journal for sustained-2Q gate hysteresis (research/04 §6.2)
- Multi-pair sustained-quarter Set 3.5 D3 history
