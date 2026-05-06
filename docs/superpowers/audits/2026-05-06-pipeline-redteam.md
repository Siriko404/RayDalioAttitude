# Pipeline Red-Team Audit

**Date:** 2026-05-06
**Auditor:** Claude opus (red-team adversarial mode, post-research-file verification)
**Subject:** Opus pipeline design draft (12-step, 3 meta-stage, mutual-dep two-pass render)
**Verdict:** **BLOCK** — design ships with at least 5 hard DAG order violations and 2 named-output direction errors. Proceeding to build before fixing means writing dead code paths and producing a card that, on the user's own recommended portfolio, trips its own highest alarm 100% of the time.

---

## Summary

Three findings would, individually, force a rewrite. (1) The "only 1.4↔1.7 is mutually dependent" claim is empirically wrong: the research files declare **at least five additional upstream→downstream edges that the pipeline order violates**, including the user's own audit prompt suspicion that 2.5 should precede 2.4 (research/12 §9 explicitly says "2.4 ... consumes § 7 asymmetry ratio"). (2) The "two-pass render" architecture rests on a **direction-inverted reading**: the design says "1.4's DebaseFlag feeds 1.7" but research/07 §3 explicitly emits `DebaseFlag` from 1.7 and §9 lists 1.4 as the consumer (1.7 → 1.4, opposite of design). (3) Two of the twelve steps are architecturally dead for the target audience: Step 10 (Alpha) requires four manager-proprietary inputs that research/10 §4 explicitly states **have no public API by construction**, and Step 8 (Holy Grail) by its own §7 sample-panel computation tags the recommended All-Weather portfolio as `Regime = NONE` always. Combined with a tail-risk RED-by-construction bug (research/12 §7 computes asymmetry = 8.52× at the locked weights, > 8× → "RED (re-architect)" by §6), the dashboard would simultaneously recommend a portfolio AND tell the user to re-architect it. Building the design as drafted means shipping a coherent-looking UI that fails its own tests.

---

## Critical findings (must fix before build)

### C1. Pipeline order violates ≥ 5 declared upstream→downstream edges in the research files

**WHAT.** The design's "data DAG actually permits this order" claim — citing only the 1.4↔1.7 mutual dep — misses at least five hard edges that the research files declare verbatim in their §9 Integration Points.

**WHY IT MATTERS.** A downstream step running before its declared upstream means the downstream step renders against a stale or absent input on first pass. Either the pipeline silently uses last-refresh stale data (introducing regime-tag drift the user can't see), or the dashboard ships with hidden two-pass render dependencies on top of the one already acknowledged. The design's transition-sentence narrative also breaks: you cannot tell a clean "now we use last step's output" story when the actual data flow goes backward.

**EVIDENCE (verbatim from research files).**

| Edge declared in research file | Design ordering | Violation |
|---|---|---|
| **research/02 §9 line 268:** "1.3 Long-Term Debt Cycle reads `policy_stance` at decade scale to detect when rate cuts hit the zero bound" | 1.3 at Step 2 (META-STAGE I), 1.2 at Step 7 (META-STAGE II) | **YES** — 1.3 runs before 1.2 emits `policy_stance` |
| **research/02 §9 line 269:** "1.5 Paradigm Shifts reads `cycle_phase` transition sequences for regime change" | 1.5 at Step 4, 1.2 at Step 7 | **YES** — 1.5 runs before 1.2 emits `cycle_phase` |
| **research/04 §9 line 289:** "Downstream consumers: 1.5 Paradigm Shifts (ingests `regime` + lever mix)" | 1.5 at Step 4, 1.4 at Step 5 | **YES** — 1.5 runs before 1.4 emits `regime` and lever mix |
| **research/05 §9 line 266:** "Downstream: 1.6 Big Cycle (reads `paradigm_stage`)" | 1.6 at Step 3, 1.5 at Step 4 | **YES** — 1.6 runs before 1.5 emits `paradigm_stage` |
| **research/12 §9 line 271:** "**2.4 Risk Parity & Leverage** — consumes § 7 asymmetry ratio (8.52×) and per-archetype $R^{port}_e$" | 2.5 at Step 12, 2.4 at Step 11 | **YES** — 2.4 runs before 2.5 emits asymmetry and per-archetype returns |

The user's audit prompt explicitly asked "Should 2.5 Stress Test be LAST? Or BEFORE 2.4 Leverage?" — research/12 §9 is dispositive: **2.5 must precede 2.4.** The design has it backwards.

**RECOMMENDED FIX.** Before any other work, redo the topological sort against the union of all 12 §9 Integration Points blocks. A defensible re-order based on the research files: 1.1 → 1.2 → 1.3 → 1.4 → 1.7 → 1.5 → 1.6 → 2.1 → 2.2 → 2.5 → 2.4 → 2.3. (Note: this leaves the Alpha step disconnected from its prerequisites; see C3.) The "long-to-short structural zoom" justification is a presentation argument that conflicts with the actual data DAG; the data DAG wins.

---

### C2. The "two-pass render" architecture inverts the actual `DebaseFlag` flow

**WHAT.** The design states: "1.4's DebaseFlag feeds 1.7; 1.7's RegimeTag sharpens 1.4. Resolved via 'two-pass render' — 1.4 runs first using 1.3's I3 sign as proxy; 1.7 runs; 1.4 re-renders with sharpened tag." This is wrong on the direction.

**WHY IT MATTERS.** `DebaseFlag` is computed inside 1.7 from `ΔFX^12m` and `ΔGold^12m` (research/07 §5.5 line 102), and consumed by 1.4 (research/07 §9 line 275). The design's "two-pass" — running 1.4 first with a proxy, then re-rendering 1.4 after 1.7 — is solving a problem in the wrong direction. It bakes a stale proxy into the first-pass UI on a step where the canonical flow (1.7 → 1.4) is one-way once you fix C1's order. Worse, it implies the developer believes 1.4 emits `DebaseFlag`; whoever builds 1.4 from this spec will implement an emission node that doesn't exist in research/04. Pure-1.4-side wiring then fails silently.

**EVIDENCE (verbatim from research/07).**
- Line 31 (§3 Decision Problem): "Emits: `RegimeTag`, `RealRateBucket`, `**DebaseFlag**`, `GoldTiltΔ`, `CashTiltΔ`, `FXShortΔ`."
- Line 102 (§5.5): "`DebaseFlag = 1` if `ΔFX^12m < −7%` AND `ΔGold^12m > +15%` over same 12-mo window."
- Line 275 (§9 Downstream): "**1.4 Deleveragings uses `DebaseFlag = 1`** to tag which lever (printing/monetization) is currently dominant."

Research/04 §9 line 289 confirms the consume side: "1.7 Inflation & Currency Debasement (sharpens inflationary classification)" — 1.4 consumes 1.7's classification, not the inverse.

**RECOMMENDED FIX.** Drop the two-pass render entirely. Order: 1.7 → 1.4 (one-way). The 1.4-needs-1.3's-I3 dependency (research/04 §9 line 285: "1.3 Long-Term Debt Cycle (late-stage warning trigger)") is a separate, also-one-way edge. Both fit a clean linear topo sort once C1 is fixed.

---

### C3. Step 10 (Alpha) is dead-weight for the target user — research/10 §4 says inputs have no public API

**WHAT.** The pipeline includes Step 10 (§ 2.3 Alpha / Portable Alpha) as an OPTIONAL step gated on user-provided IC, N, ρ_avg, σ_Alpha. The design assumes the wizard can elicit these. It cannot, for any general investor, by definition.

**WHY IT MATTERS.** The user spec says "educated general investor (curious, not pro)." Such a user has no IC (information coefficient on their forecasts), no breadth N (how many independent bets per year their forecasts produce), no ρ_avg between forecast streams, and no σ_Alpha (tracking error of an alpha book they do not have). The "skip-alpha" path will fire 100% of the time. That makes Step 10 a sequence checkbox with no decision content — but the pipeline still narrates a transition into and out of it, occupies a slide in the slideshow architecture, and demands wizard fields the user can't fill. The compact "100% beta" card is a non-decision masquerading as a decision.

**EVIDENCE (verbatim from research/10).**

§4 input table rows 38–41, all four alpha inputs: "internally estimated from trade blotter; **no public API** (§ 10 Q5)" / "n/a — manager-proprietary".

§4 line 43 DERIVED note: "The last four rows (σ_Alpha, IC, N, ρ_avg) **have no public API because alpha inputs are manager-proprietary by construction**; Dalio labels alpha 'the value added by managers, which is derived from managers deviating from the betas' (Engineering …, p. 3). Public hedge-fund index data (HFR, Credit Suisse LAB, Barclay) is subscription-gated as of April 2026 and is not used here."

§10 line 277: "**Alpha inputs (`IC`, `N`, `ρ_avg`, `σ_Alpha`) have no public API by construction.**"

**RECOMMENDED FIX.** This is a meta-stage architecture problem, not a conditional-handling polish issue. Three options:
- **(a)** Drop 2.3 entirely from the user-facing pipeline; mention it once in a "for professional managers, see Appendix" marginal section.
- **(b)** Keep 2.3 as a non-pipeline educational read (a static infographic explaining Dalio's portable-alpha framework), removed from the linear narration.
- **(c)** If the user insists on "all 12 frameworks must appear," explicitly tag 2.3 as "Educational, not for live calculation" — but then it cannot occupy a numbered Step in the same sequence as steps that DO produce live decisions, because the cognitive contract of "linear scroll narrative produces ONE decisive suggestion" is broken.

---

### C4. Step 8 (Holy Grail) tags the recommended All-Weather portfolio as `Regime = NONE` by construction

**WHAT.** The pipeline has Step 8 (§ 2.1 Holy Grail / N_eff regime classifier) compute whether the portfolio is "in the Holy-Grail regime." The recommended portfolio at Step 9 is the canonical 5-sleeve All-Weather (30/40/15/7.5/7.5). Step 8's own worked example (research/08 §7 Step 4) computes N_eff for a sample 8-stream panel and gets 3.15 → tags `Regime = NONE`. The 5-sleeve All-Weather will get worse (smaller N, similar ρ_bar), guaranteeing `NONE` under the §6 thresholds.

**WHY IT MATTERS.** The dashboard renders Step 8 BEFORE the All-Weather recommendation in Step 9, so the narrative on first read is: "your portfolio is a concentration bet in disguise (Step 8) — and here is the recommended portfolio (Step 9)." The recommended portfolio fails the prior step's test. The user is led to extrapolate that the recommendation is wrong, OR (more likely) that the dashboard's Step 8 is theatrical. Either way, narrative coherence dies.

**EVIDENCE (verbatim from research/08).**

§7 line 161 (Step 4 sample 8-stream panel, ρ_bar ≈ 0.22): "`N_eff = 8/(1 + 7·0.22) = 8/2.54 = 3.150`; `σ_p/σ = √(2.54/8) = √0.3175 = 0.5635` → red. = 43.65%."

Line 164: "**Tag: `Regime = NONE` (N_eff=3.15 < 5)**; `ρ_bar` = LIGHTLY-CORRELATED."

§6 line 92 — the regime edges are calibrated such that "p. 8 Alpha Portfolio 2 (N=77, ρ=0.04, `N_eff=19.1`) lands FULL; Portfolio 1 (N=6, ρ=0.25, `N_eff=2.7`) and a traditional 60/40 (N=2, ρ≈0.4, `N_eff≈1.4`) land NONE."

5-sleeve All-Weather has N=5. With realistic stock-bond ρ in 2022+ (research/09 §10 limitation 5: "2022's stock-bond co-crash violated the negative-correlation assumption"), ρ_bar at N=5 is structurally similar or worse than the 8-stream sample. N_eff < 5 always → `Regime = NONE` always.

**RECOMMENDED FIX.** Either (a) reframe Step 8 from "regime classifier on the user's portfolio" to "Dalio's intellectual building block — here's the math, here's how big professional books (N=77) work versus a retail portfolio (N=5); the All-Weather you're about to see in Step 9 is a *concession* to the public-data constraint, not a Holy-Grail," OR (b) cut Step 8 entirely from the live pipeline (it's a philosophy step in §2.1 of research/08, the §1 Executive Summary itself says "operationalises the **stream-count / average-correlation diagnostic that gates whether a portfolio sits in the Holy-Grail regime — independent of specific betas (→ 2.2)**" — i.e. the step is explicitly a meta-diagnostic, not a portfolio recommendation).

---

### C5. Tail-risk panel will RED-flag the recommended portfolio every refresh, by construction

**WHAT.** The final-output card includes a tail-risk panel with "asymmetry ratio with band" displayed; the design states ">8× = RED." Research/12 §7 computes the asymmetry ratio at the locked 30/40/15/7.5/7.5 weights and gets exactly 8.52× → RED.

**WHY IT MATTERS.** The dashboard renders, in a single card, simultaneously: (a) the recommended portfolio (the All-Weather tilt vector), and (b) a tail-risk RED chip on that very portfolio's asymmetry. The user's reasonable interpretation is "this dashboard is broken or its recommendation is bad." The narrative claim — "this is suggestive, not prescriptive" — does not absorb a RED tail-risk warning *on the suggestion itself*. The user's audit prompt asked whether the >8× threshold is "calibrated against historical Dalio precedent or just stipulated." Per research/12 §6 line 102 verbatim: "The 8× edge is the author's heuristic; Dalio does not publish a ratio threshold." Stipulated, and stipulated badly — the threshold lands one tick below the canonical-weight result.

**EVIDENCE (verbatim from research/12).**

§7 line 148: "Asymmetry ratio $|R_{infl}| / |R_{stag}| = 26.00 / 3.05 ≈ 8.52×$ → > 8× → **RED (re-architect)** per § 6."

§6 line 102: "**DERIVED (operational)** — ratio > 8× flags material regime imbalance. The 8× edge is the author's heuristic; Dalio does not publish a ratio threshold."

§5 line 76 (the gap rationale): "≈17.7-ppt gap vs the −20% fund result is the leverage + sleeve-mix differential: retail weights are unleveraged and use nominal intermediate Treasuries; the institutional fund is ≈2× leveraged and uses inflation-linked bonds."

The asymmetry exists because the unleveraged retail recipe IS structurally exposed to inflationary depression. Research/12 §1 says so verbatim: "Inflationary depression dominates tail." The RED is not a bug in the heuristic — it's a true statement about the recommended portfolio that the dashboard then recommends anyway.

**RECOMMENDED FIX.** Either (a) raise the >8× threshold to >10× (so the canonical baseline lands AMBER, not RED, and only genuinely worse portfolios trip RED), OR (b) re-frame the tail panel as "expected tail asymmetry, dominant driver = inflationary depression" and drop the GREEN/AMBER/RED color-coding entirely — let the user see the number without a binary verdict that contradicts the recommendation. Option (a) is the smaller-edit path.

---

### C6. Tilt vector arbitration is undefined — three different steps emit gold tilts that can fire simultaneously with conflicting deltas

**WHAT.** The final card displays "Portfolio tilt vector" with rows for Equities/LongTsy/IntTsy/Gold/Commodities + base AW + tilt + recommended. Three upstream steps independently emit gold tilts: (1) Step 5 (1.4) under DELEVER+I3>0 says "hold gold / ILB" (research/03 §6 — Step 3 in design's order, but the action rule lives in 1.3 §6); (2) Step 4 (1.5) emits `gold_overlay = ON` when LATE+RealRate<0.5%, "Increase gold toward Dalio's 7.5% All-Weather anchor" (research/05 §6); (3) Step 6 (1.7) emits `GoldΔ = +5 pts` (STAGFLATION) or `+10 pts` (INFLATIONARY) (research/07 §6). Nothing in the design specifies how these are arbitrated when two or three fire simultaneously with different magnitudes.

**WHY IT MATTERS.** A typical late-cycle scenario can plausibly fire all three: 1.4 says DELEVER+I3>0, 1.5 says LATE-paradigm with negative real rates, 1.7 says STAGFLATION or INFLATIONARY. The user sees a single Gold row with one number. The dashboard either silently picks the largest (no rationale shown), arithmetically sums (which can blow past the +10pt cap research/07 §6 commits to), or worse — the developer ships whichever order the JS Promise.all happens to resolve first. None of these is defensible.

**EVIDENCE (verbatim from research files).**
- research/03 §6 line 138: "`DELEVER` + `I3 > 0` → inflation-lever path; 1.7 active; **hold gold / ILB**."
- research/05 §6 line 125: "`gold_overlay` | `PA ≥ 0.67` AND `RealRate10y < 0.50%` | **Increase gold toward Dalio's 7.5% All-Weather anchor**"
- research/07 §6 line 130: "STAGFLATION | **+5 pts** [Gold]"; line 131: "INFLATIONARY | **+10 pts** [Gold]"
- research/07 §6 line 132 explicitly bounds: "±10 pts max deviation from AW gold baseline is stipulated to preserve the AW risk-parity structure."

There is no arbitration spec in the design draft.

**RECOMMENDED FIX.** Specify a written precedence order BEFORE coding. A defensible default: 1.7's INFLATIONARY > 1.7's STAGFLATION > max(1.4 DELEVER, 1.5 gold_overlay) > base AW. Cap aggregate at +10pt per research/07 §6's explicit limit. Surface the binding rule next to the Gold row in the tilt table ("source: STAGFLATION regime; capped at +10pt"). Without this, the dashboard ships with an architecturally unspecified output.

---

## Important findings (should fix before build)

### I1. "TOP" stage label collision between two different chips

**WHAT.** Step 2 (1.3 Long-Term Debt Cycle, design's META-STAGE I) emits `stage ∈ {SOUND, BUBBLE, **TOP**, DELEVER, RECEDE}`. Step 3 (1.6 Changing World Order, design's META-STAGE I) emits `StageTag ∈ {RISE, **TOP**, DECLINE, NEW_ORDER}`. The 6-chip header strip on the final card includes both as separate chips. Both labeled "TOP."

**WHY IT MATTERS.** A general investor scanning 6 chips at the top sees "TOP" twice in the same row. They will conflate them. They mean different things: 1.3's TOP means "debt cycle approaching deleveraging" (medium-term, financial); 1.6's TOP means "empire at peak hegemony" (250-yr, geopolitical). Conflation = confused user = the entire pipeline's narrative coherence is at risk in the first 2 seconds of looking at the card.

**EVIDENCE (verbatim).**
- research/03 §3 line 27: "stage tag {SOUND, BUBBLE, **TOP**, DELEVER, RECEDE}"
- research/06 §3 line 23: "`StageTag ∈ {RISE, **TOP**, DECLINE, NEW_ORDER}`"

**RECOMMENDED FIX.** Rename one. Suggested: 1.3 emits `PEAK` instead of `TOP` (synonym, no conceptual change). 1.6 keeps `TOP` because Dalio's published charts use "THE RISE · THE TOP · THE DECLINE" wording explicitly (research/06 §5.4 line 76). Alternatively, prefix the chips: "Debt: TOP" vs "Empire: TOP."

---

### I2. 10-min auto-refresh is theatrical for a pipeline dominated by quarterly and annual data

**WHAT.** Locked decision: scaffold @ 3s + data populate + 10-min refresh. But the underlying data sources are dominated by series with quarterly or annual cadence.

**WHY IT MATTERS.** The dashboard renders a "last refresh: 2026-04-30 14:32 UTC" timestamp every 10 minutes, but the underlying numbers haven't moved since the last quarterly release. A user who watches multiple refreshes thinks "the dashboard is doing work" when nothing is changing — at best a UX trust issue, at worst a misleading indicator that the dashboard is "live" in a way it isn't. Compounds with footer-confidence claims: if the freshness chip says "fresh" but a quarterly series is 80 days stale, the user is told a contradicting thing.

**EVIDENCE (verbatim from research §4 input tables).**
- research/01 §4: GDP, GDPC1, GDPDEF, RGDP_pc, TCMDO, HOANBS, OPHNFB — all **Quarterly** (lines 31–39).
- research/03 §4: D_tot_GDP, D_pub_GDP, D_priv_GDP, GDP, GDPDEF — **Quarterly**; FYOIGDA188S, FYFSGDA188S, Rev_GDP, Res_GDP — **Annual** (lines 33–44).
- research/05 §4: SPX/UST10/Tbill/Gold returns from Damodaran histretSP — **Annual, Jan**; OECD tax — **Annual** (lines 33–43).
- research/06 §4: WB WDI indicators (Edu_tert, Pat_res, Mil_xpnd, Exp_gnfs, GDP_cur) — **Annual**; COFER — **Annual** (lines 31–40).
- research/12 §4: Damodaran returns — **Annual**; Shiller ie_data.xls — **Monthly** (lines 33–37).

The genuinely daily series (FRED rates, gold, USD index, equities) are a minority of inputs and most don't drive regime tags — they drive 2.2 / 2.4 vol estimates downstream.

**RECOMMENDED FIX.** Replace "10-min refresh" with "tiered refresh + last-source-update timestamp per chip." Daily series refresh on a 1-hr cadence; quarterly series refresh nightly with a "next release: YYYY-MM-DD" badge. If the user wants a single global "last refresh" footer, label it "data check (no series advanced this hour)" honestly. Revisit the locked decision.

---

### I3. Wizard input count is 10+ fields with several manager-proprietary — one-shot wizard is not realistic

**WHAT.** Locked decision: "onboarding wizard captures everything once." Counting the fields actually required from the research files: σ_target (research/11 §4 line 38), country focus list (research/06 §5.1 — implicit), current portfolio weights (research/09 §4 line 45), home currency (research/07 §5.6 reserve-vs-non-reserve tier — implicit), IC, N, ρ_avg, σ_Alpha (research/10 §4, four fields, all manager-proprietary per C3), broker financing spread (research/11 §4 line 36), planned stream list (research/08 §4 line 49 — derived from streams the user defines).

That's 10+ fields, several of which a general investor cannot fill.

**WHY IT MATTERS.** The user spec says "educated general investor (curious, not pro)." A 10+-field wizard with technical terms (IC, ρ_avg, σ_Alpha, broker financing spread, σ_target) at the door means a single-screen wizard becomes a multi-page wizard, which becomes an onboarding bounce. For a portfolio-less prospective investor exploring the framework, current portfolio weights is also unfillable.

**EVIDENCE (verbatim).** See research/10 §4 lines 38–41 (already cited at C3) and research/11 §4 line 38 ("`sigma_target` | Portfolio volatility target | % | operator | constant"). research/09 §4 line 45: "`w_current` | Current portfolio weights | % | custodian/OMS | IBKR `/portfolio/{accountId}/positions`."

**RECOMMENDED FIX.** Triage wizard fields into THREE tiers: **(T1) required** = USD-default home currency + USD-default focus country + a single risk-budget choice ("conservative / balanced / aggressive" mapped to σ_target = 6 / 10 / 15%). **(T2) optional** = current portfolio weights (else default to "starting from cash"). **(T3) hidden by default** = alpha and broker-financing fields (collapsed under "Advanced — for professional users"). The pipeline must function end-to-end with T1-only inputs. Re-litigate the "captures everything once" decision against this tier triage.

---

### I4. 1.4↔1.7 mutual-dep two-pass render produces flicker on every refresh, by design

**WHAT.** Even after fixing C2's direction error (1.7 → 1.4), the design's first-pass-with-proxy-then-re-render mechanism still produces a UI flicker every refresh: 1.4 first renders with a proxy regime guess, then re-renders with the actual 1.7 output a few hundred ms later. Multiplied by 10-min auto-refresh = a visible "flash" every 10 minutes on the 1.4 card.

**WHY IT MATTERS.** Visual flicker on a passive-monitoring dashboard erodes trust ("the dashboard glitched again"). It also breaks the linear-scroll narrative if the user is scrolling and lands on Step 5 (1.4) mid-flicker — they read a mid-state regime tag.

**EVIDENCE.** This is a design-construction issue, not a research-file issue. The research files declare a one-way edge (1.7 → 1.4 per research/04 §9 line 285 and research/07 §9 line 275). There is no two-pass requirement at all; the design invented one.

**RECOMMENDED FIX.** After fixing C2, run 1.7 before 1.4 in the topo sort. No proxy; no re-render. Clean one-pass.

---

### I5. Bulk file dependencies (Damodaran .xls, Shiller .xls, BIS bulk zip, Yardeni PDF) cannot scaffold @ 3s from a static HTML page

**WHAT.** The design promises "scaffold @ 3s + data populate." Steps depending on Damodaran `histretSP.xls` (research/05 §4, research/12 §4), Shiller `ie_data.xls` (research/12 §4), BIS bulk-download CSV/ZIP (research/06 §4 line 33), and Yardeni IBES PDF (research/05 §4 line 44) require: client-side .xls parsing (SheetJS or similar — non-trivial), CORS-permitting hosts (Damodaran's NYU pages do not set CORS headers reliably for XHR fetches), or PDF parsing (no client-side path for Yardeni's chart PDF).

**WHY IT MATTERS.** A live web dashboard from a static HTML page literally cannot fetch + parse a 5MB+ multi-sheet .xls in 3s, end-to-end, even if CORS were permissive. The 3s-scaffold-+-data-populate timeline is unrealistic by 1–2 orders of magnitude for the worst sources. Either the design implicitly assumes a backend proxy server (which contradicts the "static HTML" assumption from the brainstorm logs), or the dashboard ships with several steps in permanent "loading…" state.

**EVIDENCE (verbatim).**
- research/05 §4 line 29: "Damodaran xls: https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls"
- research/05 §4 line 44: "`ConsForecast` | IBES 12-mo forward consensus SPX EPS growth | … | IBES via Yardeni archive | `https://archive.yardeni.com/pub/sp500analycons.pdf`" — **PDF**.
- research/06 §4 line 33: "`Cost_comp` | … | BIS EER **bulk CSV** (API 500, see § 10) | `https://data.bis.org/bulkdownload`"
- research/12 §4 line 37: "`cape_shiller` | Monthly … 1871-present ('ie_data.xls') | shillerdata.com | https://shillerdata.com/ (ie_data.xls)"
- research/08 §10 line 307: "direct WebFetch on `fred.stlouisfed.org` (both `/series/{id}` landing pages and `fredgraph.csv`) returned 403 this session (bot-detection / Cloudflare)" — **CORS / bot-detection issues even for FRED**.

**RECOMMENDED FIX.** Decide BEFORE coding: (a) acknowledge a backend proxy is required and design accordingly (a Cloudflare Worker or Vercel Function fronts the bulk-data sources, normalizes CORS, caches nightly), or (b) drop steps that depend on bulk files and accept the framework gaps that creates. Option (a) means the "static HTML" architecture is dead — the dashboard becomes a thin-client + serverless backend. Option (b) means cutting at minimum 1.5, 1.6, and 2.5 from live operation. Either way, this is a Set-4 architectural decision that must precede build.

---

### I6. The 1.4 conditional gate uses two regimes from 1.1 with different cadences — flicker on rolling-window edges

**WHAT.** Step 5 (1.4) gate fires only if 1.1 emits `debt_money_regime = HIGH` AND `gap_regime = BELOW_TREND`. But research/01 §5.2 line 64 specifies `s^C_t` (which feeds `credit_mix_regime`) uses a **rolling 4Q window**, while §5.5 line 87 specifies `R^{D/M}_t` (which feeds `debt_money_regime`) is an instantaneous ratio of latest values. The 1.4 gate tests a stable rolling regime AND an instantaneous regime jointly; on borderline quarters either can flip while the other holds.

**WHY IT MATTERS.** A borderline quarter where M2 ticks up 1% nudges `R^{D/M}` from `HIGH` (>15) to `ELEVATED` (10–15) on a single data refresh, while `gap_regime` remains stable. The gate flips fired→not-fired→fired on alternating refreshes if values hover near the threshold. The "Not Triggered" mini-card appears, disappears, reappears across 10-min refreshes. Same user-trust erosion as I4.

**EVIDENCE (verbatim).**
- research/01 §5.2 line 64: `s^C_t = ΔC / (ΔC + ΔM)` — but §6 line 105: "`credit_mix_regime` | from `s^C_t` (**rolling 4Q**)"
- research/01 §5.5 line 87: `R^{D/M}_t = TCMDO_t / 1000 / M2_t` — instantaneous, no rolling window
- research/01 §6 line 106: "`debt_money_regime` | from `R^{D/M}` | LOW if < 10; ELEVATED if 10–15; HIGH if > 15"
- research/04 §9 line 285: "1.1 Economic Machine (activates this layer only when `debt_money_regime = HIGH` AND `gap_regime = BELOW_TREND`)"

**RECOMMENDED FIX.** Add a hysteresis band to the gate: 1.4 fires when `debt_money_regime = HIGH` is sustained for ≥ 2 consecutive quarters OR `R^{D/M} > 17` instantaneously (well above the 15 edge). Document the hysteresis in 1.4's narration and on the "Not Triggered" mini-card itself.

---

### I7. Final-card narrative paragraph cannot coherently synthesize all 12 step outputs across all regime combinations

**WHAT.** The design says "Middle: 4-6 sentence narrative paragraph composed from all 12 step outputs." With 4 regime chips × 2 cycle chips × 4 inflation regimes × 5 debt-cycle stages × 4 empire stages × 4 stress archetypes, the cardinality of distinct narrative-states is in the thousands. A single 4–6 sentence template cannot cover all combinations coherently; many will print contradictions.

**WHY IT MATTERS.** Example contradiction the system will produce: 1.6 says STAGE = RISE for the user's home country (e.g., user picks USA but takes the design's CHN-RISE finding), 1.7 says INFLATIONARY, 1.5 says EARLY paradigm, 1.4 says NOT_TRIGGERED, 2.5 says inflationary depression dominates tail. The narrative has to weave these into 4–6 coherent sentences. With even a hand-written template, the cross-product of regime states produces narratives like "the empire is rising, while inflationary depression is the dominant tail risk and we are in an early paradigm with no deleveraging" — which a general investor reads as five mutually-contradictory things.

**EVIDENCE.** No verbatim research-file evidence; this is a design-architecture critique. But the user's audit prompt explicitly asked: "Will the synthesis actually be coherent across all combinations of regime tags? Or will it produce contradictions?" The answer from the regime cardinality is: yes, it will produce contradictions.

**RECOMMENDED FIX.** Replace the 4–6 sentence narrative with a structured "regime stack" rendering: a 5-line summary, one regime per line, each with a one-clause interpretation drawn from a per-regime template (not a synthesis template). Drop the synthesis ambition. The user is better served by "Empire stage: RISE (CHN-leading; US in DECLINE). Inflation regime: STAGFLATION. Paradigm stage: LATE. Short cycle: TRANSITIONAL/EASING. Tail dominant: inflationary depression." than by a forced synthesis of the same. Saves the dashboard from producing contradictions it cannot detect.

---

### I8. Confidence/staleness footer cannot meaningfully aggregate when sub-series have different freshness

**WHAT.** Footer claims "last refresh: 2026-04-30 14:32 UTC." But sub-series have heterogeneous freshness: TCMDO is 1 quarter behind (nominally 90 days stale on average), WALCL Fed balance sheet is updated Thursdays (so up to 6 days stale by Wednesday), COFER is annual (up to 365 days stale at Q1 of any year), Damodaran histretSP refreshes once a year in January. A single timestamp cannot represent this honestly.

**WHY IT MATTERS.** "frameworks fired n/12, conditional 1.4 status, alpha overlay status" makes claims about state freshness that the architecture can't honor. If the user trusts the timestamp, they will misread quarterly data as fresh-as-of-this-morning. The pretty footer becomes a lie.

**EVIDENCE (verbatim, sample).**
- research/01 §4 line 31: "`GDP_nom` | … | **Quarterly** | $5k–$30k bn post-1980"
- research/03 §4 line 36: "`DS_int_GDP` | Federal Outlays: Interest / GDP | … | **A**[nnual]"
- research/05 §4 line 47: "`histretSP.xls` re-posts every January; treat as point-in-time."
- research/06 §4 line 38: "`Res_shr` | … | IMF COFER | … | **A**[nnual]"

**RECOMMENDED FIX.** Replace the single-timestamp footer with a per-step "data as of YYYY-MM-DD" badge inside each step's card. Surface the worst-stale series in the footer ("most-stale input: COFER, last update 2025-12-31, ~125 days old"). The aggregate "n/12 fired" claim is still defensible if it's tied to per-step gate state; just don't over-promise freshness.

---

## Minor findings (nice to fix)

### M1. "Roughly 250 years, give or take 150 years" empire arc is not actionable for a 5–10yr investment horizon

**WHAT.** Step 3 (1.6) places a "decline / new_order" tag on a 250-yr ±150-yr arc. Research/06 §1 itself flags this in its scope language — the stage classifier "uses Country-Power Index level + 20-yr trajectory, not duration" (research/06 §10 line 290). But the tag is exposed to the user as one of the four regime chips at the top of the final card.

**WHY IT MATTERS.** A general investor with a 5–10 yr horizon, told "USA is in DECLINE" as a decision-input, will misweight portfolio decisions. The user's audit prompt explicitly raised this: "Is 1.6 (empire arc, 250yr) meaningfully actionable for an investor with a 5-10yr horizon?" The honest answer is: the chip is informational not actionable, but the dashboard treats it as an operational input to portfolio tilts (research/06 §6 line 125 → "1.7 debasement +1 notch; 2.2 gold-tilt up").

**RECOMMENDED FIX.** Lower-prominence the empire chip — move from the 6-chip header strip into a context band below the main tilt vector with a "long-horizon context, not a tactical signal" qualifier. Keep its downstream wiring into 1.7's gold tilt; just don't lead the visual hierarchy with it.

---

### M2. 1.6 8-measures method is a snapshot CPI computation, not a live signal

**WHAT.** Research/06's `CountryPowerIndex` is constructed from 11 countries × 8 measures of power. The data sources update **annually** (WB WDI, IMF COFER, OECD tax) — research/06 §4 lines 31–40. Calling Step 3 (1.6) into a 10-min refresh loop produces no movement in the chip ever — annual data, weekly chip, 10-min refresh.

**WHY IT MATTERS.** The dashboard auto-refreshes a step that has zero update cadence. Wasteful (re-fetching annual files) and misleading (suggests the chip might move).

**RECOMMENDED FIX.** Step 3 (1.6) computed once per session, locked for the session, refresh button optional. Treat as static between data releases.

---

### M3. The "always-expanded full depth" locked decision conflicts with the 6-chip overview

**WHAT.** Locked: "always-expanded full depth + user-friendly nav." But the 6-chip header is by construction a summary, not full depth. The two design goals are in tension.

**WHY IT MATTERS.** The user must decide: is the card a TL;DR (chip strip + tilt + tail panel + footer = single-screen overview) or full-depth (every step expanded = scroll-document)? The current design half-commits to both.

**RECOMMENDED FIX.** Surface this contradiction to the user as a Set-4 decision: do they want a single decision card (TL;DR) ANCHORED above a scroll narrative (full depth), or just one or the other? The brainstorm logs (memory) suggest the user has been iterating on slideshow architecture (v3, v4, v4.3); this is the same tension showing up at the data-flow layer.

---

### M4. "Every locked decision should be evidenced" — closing narration's "regimes change" ↔ 10-min refresh tension

**WHAT.** The design's closing narration says "regimes change. Come back periodically." But the 10-min refresh implies the regimes might change intra-day. They don't (per I2). The narration tells the user something incompatible with the refresh cadence the dashboard implements.

**WHY IT MATTERS.** Misaligned mental-model.

**RECOMMENDED FIX.** Closing narration should match actual cadence: "The longer-cycle frameworks shift quarterly to annually; daily price moves register in tilts but not regime tags. Check back monthly." Drop "come back periodically" — too vague.

---

## Aspects PASSED (not all red flags)

The design is not malformed; several pieces are sensible and survive adversarial scrutiny:

- **The three-meta-stage taxonomy (Economic / Market / Investment Analysis)** is a clean conceptual carve. Even after C1's order fix, the buckets themselves remain defensible groupings of the 12 frameworks.
- **The mini "Not Triggered" card for Step 5 (1.4)** is the right UX pattern for a conditional step — the alternative (suppressing the step entirely or rendering it as "0") would be less honest. The pattern itself is good; the gate logic needs hysteresis (I6) but the chip pattern is sound.
- **The compact "100% beta" card for Step 10 (2.3)** is a similarly correct pattern in principle — the problem is that for the target audience, the "100% beta" path fires 100% of the time (C3), making the step itself wrong-for-this-audience, not the card pattern wrong.
- **The "scaffold + data populate" pattern** is the right architecture for a slow-data dashboard — the 3-second timing is wrong (I5) but the pattern is correct.
- **Suggestive (not prescriptive) framing** is the right liability stance. A general-investor product cannot legally or pedagogically be prescriptive.
- **Onboarding wizard as a one-time gate** is the right top-level UX choice; the wizard's contents need triaging (I3) but the position-in-flow is right.
- **Linear scroll narrative** as the spine is defensible for a teaching-oriented product, even though the data DAG (C1) doesn't naturally produce a linear order. The user may legitimately privilege pedagogical order over data-DAG order — but only AFTER the data DAG is correctly identified.

The Excel-parity question (locked decision) was not deeply audited because the decision is locked and the most damaging finding (C1's DAG violation) applies to both the web and Excel implementations equally. Excel's lack of intersection observers and modern scroll mechanics means parity = "same data, different UX" by construction; the user has implicitly accepted this by locking parallel implementations.

---

## Recommended next-step decisions for user

These are framed as questions for Set 4 (or a "Set 3.5: pre-Set-4 architecture re-litigation" if needed):

1. **DAG re-order vs. pedagogy-order:** Given C1's evidence of 5+ violations, should the pipeline order follow the data DAG (1.1→1.2→1.3→1.4→1.7→1.5→1.6→2.1→2.2→2.5→2.4→2.3) or stay with the design's pedagogy order and accept hidden multi-pass renders? If pedagogy wins, are you committed to documenting and managing every back-edge?

2. **Cut Steps 8, 10, or both?** Per C3 + C4: Step 10 (Alpha) is dead-weight for general investors and Step 8 (Holy Grail) tags the recommended portfolio as `Regime = NONE` always. Do you want both removed from the user-facing pipeline (kept in an Appendix), reframed as educational-only (no live calculation), or kept-as-is with a "for context, not action" caveat?

3. **Tail-risk panel: drop the color verdict, raise the threshold, or change the metric?** Per C5: the canonical recipe IS structurally exposed to inflationary depression by Dalio's own framework, so a >8× RED is true-but-counterproductive. Do you want to (a) raise the threshold to >10× so canonical lands AMBER, (b) remove color-coding entirely from this panel, or (c) replace asymmetry-ratio with a different metric that doesn't trip on the canonical baseline?

4. **Backend proxy vs. cut bulk-data steps?** Per I5: BIS bulk + Damodaran .xls + Shiller .xls + Yardeni PDF cannot live-fetch from a static HTML page. Are you committing to a serverless backend (Cloudflare Worker, Vercel Function) that fronts these sources, or accepting that 1.5 / 1.6 / 2.5 cannot have live data and will use last-cached snapshots only?

5. **Refresh cadence: what does "live" actually mean?** Per I2 + I8: most series are quarterly or annual. Are you committing to (a) tiered refresh + per-step "data as of" badges, or (b) one global refresh that's pinned to the slowest-changing series, or (c) keeping the 10-min auto-refresh as theatre and accepting that the footer claim is misleading?

6. **Wizard tier triage:** Per I3 + C3: 10+ wizard fields, several manager-proprietary. Do you want a 3-tier triage (T1 required = USD + balanced σ_target; T2 optional = portfolio weights; T3 advanced/hidden = alpha & financing fields) or stay with one-shot all-fields-once?

7. **Tilt arbitration precedence — written before code:** Per C6: three steps emit gold tilts that can fire simultaneously. Specify the precedence order now (recommended default: 1.7 INFLATIONARY > 1.7 STAGFLATION > max(1.4 DELEVER, 1.5 gold_overlay) > base AW; cap aggregate at +10pt) and put it on a Set-4 acceptance list.

8. **TOP-label collision:** Rename 1.3's `TOP` to `PEAK` (smaller change), or prefix both chips ("Debt: TOP" vs "Empire: TOP")? Decide before chip rendering ships.
