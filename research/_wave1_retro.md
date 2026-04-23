# Wave 1 Retrospective

**Date:** 2026-04-23
**Scope:** 4 Wave-1 subsections (1.2 Short-Term Debt Cycle, 1.3 Long-Term Debt Cycle, 1.4 Deleveragings, 1.5 Paradigm Shifts) + 2 retroactive Wave-0 pilots (1.1 Economic Machine, 2.2 All-Weather).
**Evaluator:** 6 independent red-team agents (fresh context, per `research/_redteam_prompt.md`) + main-session synthesis.

---

## 1. Tally — all 6 audits

| Target | Verdict | CRITICAL | MAJOR | MINOR | Audit file |
|---|---|---|---|---|---|
| 1.1 Economic Machine (pilot) | REJECT (rubric) | 0 | 4 | 3 | `_audit_01_economic_machine.md` |
| 1.2 Short-Term Debt Cycle | REJECT | 1 | 4 | 3 | `_audit_02_short_term_debt_cycle.md` |
| 1.3 Long-Term Debt Cycle | REJECT | 1 | 3 | 2 | `_audit_03_long_term_debt_cycle.md` |
| 1.4 Deleveragings | REJECT | 0 | 5 | 2 | `_audit_04_deleveragings.md` |
| 1.5 Paradigm Shifts | REJECT | 5 | 7 | 2 | `_audit_05_paradigm_shifts.md` |
| 2.2 All-Weather (pilot) | REJECT | 5 | 5 | 3 | `_audit_09_all_weather.md` |
| **TOTAL** | **6/6 REJECT** | **12** | **28** | **15** | 55 findings |

---

## 2. What worked (the R10 / R7b fix held)

The 5 refinements applied before Wave 1 (R1–R5, commit `afb029b`) delivered on their specific target:

- **R10 point-of-use attribution.** 4 of 6 targets (1.1, 1.3, 1.4, 1.5) have every DERIVED threshold within 3 lines of a marker. The one exception (1.2) is a distance miss (5–7 lines), not a missing-marker miss.
- **R7b coverage-not-presence check.** The red-team spot-check caught zero bare thresholds in 1.3, 1.4, 1.5. Pilots 1.1 and 2.2 retain the original Wave-0 retro's flagged slips — these predate R10 and are patchable in place.
- **Palette compliance** (P1). All 6 targets use ONLY the 12 locked hex tokens. No drift.
- **Scope discipline** (R6). Every target respected its registry IN/OUT boundaries. No cross-subsection leakage.

**Conclusion on R10/R7b:** the rule is working. Wave 2 inherits it unchanged.

---

## 3. What failed (and was not visible under the pre-red-team process)

Red-team exposed failure classes that the original 20-item checklist + agent self-report missed entirely. Breakdown:

| Failure class | Frequency | Examples |
|---|---|---|
| **Hallucinated or dead URLs** | 6/6 (100%) | 1.2 Hamilton-Project Sahm URL 404 · 1.5 `SP500BUYBACK` FRED endpoint doesn't exist · 1.5 Yardeni `ibesarchive.pdf` 404 · 2.2 Vanguard rebalancing URL 404 · 1.4 archive.org link resolves to wrong paper |
| **Fabricated "verbatim" quotes** | 4/6 | 1.3 line 103 "currency/debt markets" → "currencies" · 1.5 § 5.1 "distinct character" (real: "distinctive characteristics") · 1.5 § 5.2 "caught off guard" (real: "caught overextended") · 2.2 "time- and threshold-based … similar outcomes" (not in Vanguard paper) · 1.4 Quote 1 source mis-attributed · 1.4 Quote 4 drops phase prefix |
| **Wrong printed-page numbers** | 3/6 | 1.1 quote attributed to p. 1, actually p. 2 · 1.2 p. 18 → actual p. 19 · 1.3 footnote attribution |
| **Mis-identified data-series endpoints** | 3/6 | 1.3 `GFDEGDQ188S` labeled "debt held by public" → actually total debt · 1.3 `FYFSGDA188S` labeled "primary deficit" → actually headline · 1.5 `SPASTT01USM661N` labeled commodities → actually OECD broad share-price · 1.5 `A445RC1Q027SBEA` labeled nonfinancial → actually all-industries |
| **Worked-example arithmetic** | 2/6 | 1.5 § 7 ρ = −0.45 → correct value is −0.30; rank duplicate impossible · 2.2 § 7 RCs sum to 108.1% not 100%; chart data 102.7% on percent axis |
| **Implementation-spec bugs** | 2/6 | 1.3 § 8a JS arithmetic "200% rev ≈ 60% GDP" should be ~34%; unit mismatch rev vs GDP · 1.4 § 8b Power Query M: `Csv.Document` on raw ZIP without decompression + filter before `PromoteHeaders` |

These are NOT attribution-discipline failures. They are **sourcing-fidelity failures** — the research agent consistently trusts its own memory of URLs / quotes / series descriptions over verified retrieval.

---

## 4. Root cause

Two systemic failure modes compound:

**A. "Memory mode" over verification.** The research prompt does not require live verification of URLs / quotes / data-series descriptions. Agents default to producing plausible-looking citations that are close-enough-to-real, because the checklist rewards presence of a citation, not correctness.

**B. Worked-example without self-check.** § 7 arithmetic is written narratively; the agent does not re-execute the computation row-by-row before finalizing. Result: 2.2's chart data disagrees with its own narrative.

Neither issue was visible from the agent's self-report — because self-report runs the same failure mode as the original write. Red-team (fresh-context adversarial audit with actual WebFetch + pdftotext verification) catches both classes.

---

## 5. Proposed prompt refinements for Wave 2

Four new hard rules. Each is specific and testable. **R11 and R12 are BLOCKING for Wave 2.** R13 and R14 are strongly recommended.

### R11 — URL pre-flight (BLOCKING)

Add to HARD RULES in `research/_prompt_template.md`:

> **R11. URL PRE-FLIGHT.**
> Before including any URL in the final report, you MUST WebFetch that URL and confirm:
>   (a) it resolves to a 200 status (or 302 → 200 redirect chain),
>   (b) the page content substantively relates to what you cite it for.
> A paywall/login wall / 404 / wrong-document 302 chain = do not cite.
> If the canonical source is dead, either (1) find a working mirror via
> Wayback Machine (and cite the Wayback URL explicitly), or (2) drop the
> claim that depends on it.

### R12 — Quote fidelity via extraction (BLOCKING)

Add to HARD RULES:

> **R12. QUOTE FIDELITY FROM RETRIEVED TEXT.**
> Every `> **Dalio**` verbatim quote MUST be copy-pasted from the page text
> returned by your WebFetch / pdftotext / equivalent retrieval — never from
> memory. Do not trim or rephrase; use "[…]" for elisions and show the
> elision explicitly.
> When citing from a multi-paper compilation PDF (e.g. Dalio's "Economic
> Principles" compilation), the page number MUST be the PRINTED page
> visible in the footer, NOT the PDF-viewer counter. If you cannot verify
> the printed page, cite by section heading instead (e.g. `source: "Big Debt Crises", Ch 1 "The Archetypal …"`).

### R13 — Data-series identifier verification (STRONGLY RECOMMENDED)

Add to § 4 Input Variables Table schema description:

> For every dataset identifier cited (FRED series ID, BIS dataset key,
> World Bank indicator code, etc.): WebFetch the series description page
> and paste the one-line official description alongside the ID in your
> working notes. The ID you cite and the description you use MUST refer
> to the same series. Wrong-series mis-labels (e.g. citing
> `GFDEGDQ188S` for "debt held by public" when it is total debt) =
> research failure.

### R14 — Worked-example arithmetic self-check (STRONGLY RECOMMENDED)

Add to § 7 schema description:

> Before finalizing § 7, manually re-execute each formula row-by-row
> and confirm that (a) every stated total equals the sum of its
> components to the precision printed (no rounding slop), (b) no
> rank / ratio / share column contains a duplicate that the formula
> disallows, (c) any chart data in § 8c agrees with the § 7 table
> that generated it.

These refinements would have caught every CRITICAL and most MAJOR findings above.

---

## 6. Patch-vs-respawn decision per target

Strict rubric says 6/6 REJECT-re-spawn. Mechanical application would re-spawn all 6 — expensive and wasteful for targets where 0 CRITICAL and all MAJOR are marker-insertion patches.

Proposed policy (main-session judgment, calibrated to rubric spirit):

| Target | Rubric | Action | Rationale |
|---|---|---|---|
| 1.1 Economic Machine (pilot) | REJECT (4 MAJOR) | **Patch-in-place** | 0 CRITICAL. All 4 MAJOR are marker insertions + 1 page-number typo. Wave 0 retro explicitly directed "do NOT re-spawn 1.1 / 2.2 — patch in place." 0-CRITICAL justifies that directive. |
| 1.2 Short-Term Debt Cycle | REJECT (1 CRITICAL + 4 MAJOR) | **Re-spawn** | URL hallucination + quote page + NBER mislabel + marker-distance. Not all trivially patchable. |
| 1.3 Long-Term Debt Cycle | REJECT (1 CRITICAL + 3 MAJOR) | **Re-spawn** | Fabricated verbatim quote (CRITICAL) + 2 FRED series mislabels (break § 7 if wired live) + JS arithmetic. |
| 1.4 Deleveragings | REJECT (5 MAJOR) | **Re-spawn** | Quote mis-attributions + wrong source URL + Power Query M bugs + case-date conflicts with Dalio's table. Multiple failures of different classes; patch-in-place risks missing compounds. |
| 1.5 Paradigm Shifts | REJECT (5 CRITICAL + 7 MAJOR) | **Re-spawn** | Worst of the 6. Two fabricated quotes + hallucinated FRED + broken primary URL + math errors. Complete rewrite needed. |
| 2.2 All-Weather (pilot) | REJECT (5 CRITICAL + 5 MAJOR) | **Re-spawn** | § 7 arithmetic materially wrong (RCs sum to 108.1%) + chart propagates bad data + fabricated Vanguard quote + 3 → 1 band misattribution. Wave 0 retro's patch-in-place directive assumed 0 CRITICAL; 5 CRITICAL voids it. |

**1 patch in place + 5 re-spawns.** Re-spawn briefs will quote the specific findings and require R11–R14 compliance.

---

## 7. Re-spawn batch plan

- **Concurrency cap:** 4 background agents max (per user rule 2026-04-23).
- **Batch 1:** 4 re-spawns: 1.2, 1.3, 1.4, 1.5.
- **Batch 2:** 1 re-spawn: 2.2 (queued; launches when batch 1 slot frees).
- **Prompt refinement:** Apply R11–R14 to `research/_prompt_template.md` BEFORE launching any re-spawn. Re-spawn briefs explicitly cite R11–R14 plus the finding table from the target's audit.
- **After re-spawn:** each revised report gets a new red-team audit (batched when ≥ 3 slots free).
- **1.1 patch:** main session applies the 4 in-place patches from `_audit_01_economic_machine.md` directly; no agent spawn. Commit separately.

---

## 8. Verdict on Wave 1 gate

- **Wave 1 does NOT close** until all 6 reports PASS (with or without patches) through red-team.
- Wave 2 (1.6, 1.7, 2.1) is **blocked** on Wave 1 closure + R11–R14 application.
- Expected timeline: 4-batch re-spawn (~30 min) + 4-batch re-audit (~30 min) + 2.2 slot (~60 min) + final 1.1 patch commit. Total Wave 1 closure ≈ 2.5 hours.

---

## 9. Open questions for user

1. Apply R11 + R12 (blocking) + R13 + R14 (recommended) to the prompt template before re-spawning? Default: yes, all four.
2. Patch 1.1 in place per Wave 0 retro + 0-CRITICAL? Re-spawn 1.1 anyway despite rubric friction? Default: patch in place.
3. Any subsection you'd rather re-spawn differently (e.g. different source priority, different scope tightening)?
