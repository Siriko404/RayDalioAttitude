# Wave 0 Retrospective

**Date:** 2026-04-23
**Pilots:** `research/01_economic_machine.md` (subsection 1.1) · `research/09_all_weather.md` (subsection 2.2)
**Evaluator:** Claude (main session), independently reading both files and running acceptance checks.

---

## 1. Results summary

Both reports pass substance. Every one of the 10 required sections is present in both, attribution markers are correctly distinguished (Dalio vs NON-DALIO), the palette tokens in § 8c are exactly the 12 allowed hex values, scope discipline is clean (each pilot explicitly defers out-of-scope material to the correct downstream subsection), and every threshold / formula traces to a public source with a working URL. The exact-word-count gate is demoted per user instruction; conciseness + completeness are verified by read.

| Check | Pilot A (1.1) | Pilot B (2.2) | Notes |
|---|---|---|---|
| 10 section headers, correct titles, correct order | PASS | PASS | exact match in both |
| § 8 has 8a / 8b / 8c | PASS | PASS | all three present, all implementable |
| Attribution markers `> **Dalio**` or `> **NON-DALIO**` | 11 | 11 | dense and correctly typed |
| § 8c palette compliance | PASS | PASS | both files use only the 12 locked hex tokens |
| Public URLs only (no paywalls) | PASS | PASS | FRED, Bridgewater CDN, NBER, Vanguard PDF, Stooq, BIS, Maddison — all free |
| § 10 flags real Dalio ambiguities | 6 flagged | 6 flagged | specific, not generic |
| Scope discipline (no OUT-OF-SCOPE content) | PASS | PASS | both point at the correct downstream subsection for deferred topics |
| § 4 Input Variables Table with 7 columns + real API endpoints | PASS | PASS | every row names a specific public endpoint |
| § 5 formulas are implementable | PASS | PASS | map directly to code in § 8a |
| § 7 worked example is step-by-step and verifiable | PASS | PASS | |
| § 2 verbatim quotes have page-level or URL-level cites | PASS (pp. 1, 2, 4, 5, 7) | PASS (URL-anchored; no pages in web source) | |
| § 9 integration points name upstream + downstream | PASS | PASS | |

## 2. Pattern findings

**What both pilots got right.**

- **Scope discipline was strong.** Pilot A explicitly defers cycle mechanics (→1.2/1.3), deleveraging (→1.4), and inflation (→1.7). Pilot B explicitly defers leverage (→2.4), alpha (→2.3), and macro regime detection (→Module 1). Neither leaked material into the wrong subsection.
- **Attribution distinction was operationalized correctly.** Each pilot used exactly one NON-DALIO marker for a specific gap Dalio does not address — Pilot A used Hamilton (2018) for the σ-band rule, Pilot B used Vanguard (2022) for rebalancing bands. Neither pilot bled non-Dalio material into unmarked prose.
- **Output schema discipline was rigid.** Exact section titles, exact order, all the sub-sections. The prompt's REQUIRED OUTPUT SCHEMA section did its job.
- **Implementation specs are actually buildable.** § 8a of both reports has a JS function I could drop into a real `.html`. § 8b has Power Query M I could paste into Excel. § 8c uses only locked palette tokens.

**What both pilots could sharpen.**

- **§ 7 worked-example data policy is inconsistent.** Pilot A used real FRED data for the US productivity trend (n = 312 quarterly obs, residual σ ≈ 3.2%, g_trend ≈ 1.96% p.a.). Pilot B used illustrative end-April-2026 numbers. Both are valid — the spec never said which to do. Agents picked differently. Worth tightening for Wave 1.
- **Document titles have different formats.** Pilot A: `# 1.1 Economic Machine Template — Operational Framework`. Pilot B: `# 09 — All-Weather (Beta) Portfolio`. Neither is wrong; both pass; inconsistent across the repo is a small aesthetic cost.
- **§ 2 verbatim-quote formatting is slightly loose on Pilot B.** Pilot A cites `p. 1`, `p. 2`, etc. — a paginated PDF. Pilot B's source (Bridgewater's "The All Weather Story" web page) has no pages, so every citation reads `source: "The All Weather Story", bridgewater.com`. Correct, but the prompt could acknowledge the web-source case explicitly.

**Where A and B diverged.**

- **Pilot B caught a scope-spec error.** The subsection registry (both in spec § 5 and in the research prompt template) says Pilot B's IN includes "15% IL bonds." The only publicly-disclosed Dalio canonical weights (via Robbins, 2014) specify nominal intermediate Treasuries (7–10y), NOT inflation-linked bonds. Pilot B defaulted to the public Dalio number and flagged the discrepancy in § 10 #1. **This is excellent — the attribution and honesty rules caught a scope error the user and I baked in.** Action: correct the registry entry.
- **Pilot A had no equivalent catch**; 1.1 is a cleaner subsection scoping-wise.

## 2.5 VERDICT

**REVISED after advisor review.** Original verdict was VERDICT-S; advisor correctly surfaced a SHARED substance issue across both pilots that the letter-of-the-checklist grep (R7) did not catch. Updating below.

- [x] **VERDICT-P (prompt failure — attribution discipline at point of use)** with a small VERDICT-S overlay (IL-bonds registry error in 2.2).
   - **Shared slip, both pilots:** operational thresholds / bucket edges / band widths / derived matrices that are NOT directly in a Dalio/Bridgewater source appear in the body **without a NON-DALIO or DERIVED marker at the point of use**. Only acknowledged in § 10 limitations. Concrete examples (verified by re-read):
      - **Pilot A § 6:** `credit_mix_regime` uses 0.66 / 0.33 tertile cuts — attributed to "Dalio's qualitative framing, p. 2," but those specific numbers are not in that quote. Dalio's p. 2 argues Total $ matters more than Total Q; he doesn't specify tertile thresholds.
      - **Pilot A § 6:** `debt_money_regime` bucket edges 10 and 15 — the 15 anchors on Dalio p. 7, but the edges themselves are stipulated. § 10 #3 admits this; § 6 doesn't mark it NON-DALIO/DERIVED.
      - **Pilot B § 5:** "±25% of mean" environment-risk band — uncited, unmarked.
      - **Pilot B § 6:** "1.5× max/min RC" imbalance heuristic — uncited, unmarked.
      - **Pilot B § 5:** +1 / 0 / −1 environmental bias matrix — § 10 #4 admits "fair paraphrase, not literally in Dalio's text"; § 5 presents it unmarked.
   - **Why this is VERDICT-P, not S:** the pattern is IDENTICAL across two subsections of materially different character (narrative-macro vs numeric-portfolio). That's the definition of a shared prompt failure.
   - **Why only a small S overlay:** the IL-bonds vs intermediate-Treasuries issue in 2.2 is a registry scope error that only affects that subsection; it's remediated by refinement R3 below.
   - **Why the checklist missed it:** R7 grep counts markers (≥ 8) and confirms presence — it doesn't verify that every numeric threshold has either a Dalio citation or a NON-DALIO/DERIVED marker within a few lines. Both pilots had 11 markers and passed the grep while unsourced thresholds slipped through the body unmarked.

Verdict in one sentence: **prompt has a real attribution-discipline hole at the point-of-use for derived thresholds; fix with a new hard rule + acceptance-criteria patch before Wave 1; do not re-spawn 1.1 / 2.2 (patch them during consolidation).**

## 3. Proposed prompt refinements for Wave 1

Each is specific and testable. **Refinements #3 and #5 are BLOCKING for Wave 1** (must land in prompt + checklist before spawn). #1, #2 are helpful and cheap. #4 is optional.

1. **Refinement #1 — specify § 7 worked-example data policy.** Add to the REQUIRED OUTPUT SCHEMA description for § 7:

   > § 7's numbers may be either (a) illustrative and clearly labelled as such, or (b) drawn from a recent real data pull with the exact dataset identifier and as-of date cited. Either is acceptable; mixing (a) and (b) within one example is not.

2. **Refinement #2 — explicit web-source citation style for § 2.** Add to the REQUIRED OUTPUT SCHEMA description for § 2:

   > For paginated sources, cite `source: <title>, <p. N>`. For unpaginated web sources, cite `source: <title>, <full URL>`. Do not invent page numbers for web sources.

3. **Refinement #3 — fix the subsection registry entry for 2.2.** Edit `research/_prompt_template.md` (and spec § 5 for consistency) to replace:

   > **IN:** ... canonical weights (~30% stocks / 40% long bonds / 15% IL bonds / 7.5% gold / 7.5% commodities style).

   with:

   > **IN:** ... canonical weights (~30% stocks / 40% long bonds / 15% intermediate nominal Treasuries / 7.5% gold / 7.5% commodities style — the only publicly-disclosed Dalio recipe, via Robbins 2014; institutional Bridgewater may use inflation-linked in the same slot but those weights are not public).

4. **Refinement #4 — optional — title format standardization.** Add to DELIVERABLE:

   > Document title (the H1 at the top of the file) must be exactly: `# {ID} {TITLE}` — for example, `# 1.1 Economic Machine Template` or `# 2.2 All-Weather (Beta) Portfolio`.

5. **Refinement #5 (NEW, BLOCKING) — Hard Rule R10, point-of-use attribution for derived thresholds.** Add to HARD RULES in `research/_prompt_template.md`:

   > R10. Any operational threshold, bucket edge, band width, heuristic ratio, or derived matrix that is NOT directly stated in a Dalio/Bridgewater source MUST carry a `> **NON-DALIO (industry standard)**` or `> **DERIVED (operational)**` marker at the point of use in the body — NOT only as a § 10 acknowledgment. "Dalio gives a range; I'm picking the midpoint" counts as DERIVED and needs the marker at the point of use. "Dalio anchors the centre; I'm stipulating bucket edges" counts as DERIVED.

   And add a corresponding acceptance-criteria item **R7b** to `research/_acceptance_criteria.md`:

   > **R7b. Point-of-use attribution for derived thresholds.** Spot-check every numeric threshold / bucket edge / band width / derived matrix in § 5 and § 6. Each must be within 3 lines of either a `> **Dalio**`, `> **NON-DALIO**`, or `> **DERIVED**` marker. A threshold only acknowledged in § 10 = FAIL.

## 4. Recommendation

**Apply refinements #3 and #5 (blocking), then #1 and #2 (cheap wins). Then launch Wave 1.** Refinement #4 is optional. Do NOT re-spawn 1.1 / 2.2 — those reports are substantively useful; patch their attribution slips in place during consolidation with inserted `> **DERIVED**` markers where needed.

Wave 1 = subsections 1.2, 1.3, 1.4, 1.5 (four agents spawned in parallel). Expect roughly one agent's worth of wall-clock time (~15–30 minutes).
