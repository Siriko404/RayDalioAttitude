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

- [x] **VERDICT-S (subsection resistance — minor)** with a small VERDICT-P overlay.
   - Why not VERDICT-P: there are no SHARED failures of checklist items between the two pilots. Every structural and content rule (R1–R9, S1–S7, P1, C1–C2) passes for both.
   - Why there's a small P overlay: two of the proposed refinements (worked-example data policy, web-source citation format) would improve BOTH future agents' outputs, not just one. So the prompt has slack that can be tightened, not errors that must be fixed.
   - Why S: the one real divergence (Pilot B catching the IL-bonds vs intermediate-Treasuries discrepancy) is subsection-specific, reflects a genuine ambiguity about the subsection scope rather than a prompt failure, and is remediated by fixing the registry entry — not the prompt.

Verdict in one sentence: **prompt is working; tighten three small areas and fix one registry error; launch Wave 1.**

## 3. Proposed prompt refinements for Wave 1

Each is specific and testable.

1. **Refinement #1 — specify § 7 worked-example data policy.** Add to the REQUIRED OUTPUT SCHEMA description for § 7:

   > § 7's numbers may be either (a) illustrative and clearly labelled as such, or (b) drawn from a recent real data pull with the exact dataset identifier and as-of date cited. Either is acceptable; mixing (a) and (b) within one example is not.

   Addresses the A-vs-B inconsistency noted above. Every subsequent agent picks one mode and commits.

2. **Refinement #2 — explicit web-source citation style for § 2.** Add to the REQUIRED OUTPUT SCHEMA description for § 2:

   > For paginated sources, cite `source: <title>, <p. N>`. For unpaginated web sources, cite `source: <title>, <full URL>`. Do not invent page numbers for web sources.

   Addresses Pilot B's citation style question explicitly.

3. **Refinement #3 — fix the subsection registry entry for 2.2.** Edit `research/_prompt_template.md` (and spec § 5 for consistency) to replace:

   > **IN:** ... canonical weights (~30% stocks / 40% long bonds / 15% IL bonds / 7.5% gold / 7.5% commodities style).

   with:

   > **IN:** ... canonical weights (~30% stocks / 40% long bonds / 15% intermediate nominal Treasuries / 7.5% gold / 7.5% commodities style — the only publicly-disclosed Dalio recipe, via Robbins 2014; institutional Bridgewater may use inflation-linked in the same slot but those weights are not public).

   Addresses the IL-bond error Pilot B caught. This is a scope fix, not a prompt fix.

4. **Refinement #4 — optional — title format standardization.** Add to DELIVERABLE:

   > Document title (the H1 at the top of the file) must be exactly: `# {ID} {TITLE}` — for example, `# 1.1 Economic Machine Template` or `# 2.2 All-Weather (Beta) Portfolio`.

   Small cosmetic consistency win. Non-blocking — not a correctness issue.

## 4. Recommendation

**Launch Wave 1 with refinements #1, #2, #3 applied.** Refinement #4 is optional. No re-pilot needed. The prompt is validated on two subsections of materially different character (narrative/macro vs numeric/portfolio), and both produced useful operational frameworks.

Wave 1 = subsections 1.2, 1.3, 1.4, 1.5 (four agents spawned in parallel). Expect roughly one agent's worth of wall-clock time (~15–30 minutes).
