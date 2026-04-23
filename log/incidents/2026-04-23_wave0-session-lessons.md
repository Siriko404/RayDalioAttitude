# Lessons Learned — Dalio Framework Project, Session of 2026-04-23

**Date:** 2026-04-23
**Severity:** Low to Medium (one near-miss that the advisor caught before it multiplied 4× in Wave 1)
**Status:** Resolved + encoded

This is a cross-incident retrospective covering the full brainstorming + Wave 0 pilot session. Grouped by theme. Each lesson has a **Root**, **Fix (applied)**, and **Rule** line.

---

## Group 1 — Premise handling (user scope statements vs Claude's literal interpretation)

### L1. "ALL of Dalio's published works" — literal scope statement
- **Incident:** User wrote "ALL of ray dalios published works ... ANYTHING AT ALL." I classified as hyperbole and narrowed silently in my Q1 options.
- **Root:** I pattern-matched "ALL" to "rhetorical emphasis" rather than "scope specification."
- **Fix (applied):** Surfaced three scope options in Q1 including the "literal everything" choice; user picked it, then scoped back on Life & Work in Q2 follow-up. Spec § 1 + § 2 now reflect the actual scope.
- **Rule:** When a user statement sounds hyperbolic but is describing scope, ASK — don't pre-filter.

### L2. Public-repo constraint came late (after library-pull proposal)
- **Incident:** I offered a 25-paper library-pull list (Priority 1/2/3) through uOttawa Omni. User then clarified (a) no library pull at all, (b) repo is public → only public-domain / freely-accessible sources, (c) attribution distinction between Dalio and non-Dalio material. A full tier-list was wasted effort.
- **Root:** I didn't ask about repo visibility / copyright constraints before proposing the external-resource layer.
- **Fix (applied):** Spec § 2 now lists "Paywalled / non-public sources" as a non-goal; § 7 prompt has public-access HARD RULES R7/R8/R9; attribution markers required at point of use.
- **Rule:** Before proposing any resource-acquisition step (library, purchase, subscription), confirm repo visibility and copyright constraints.

### L3. Artifact count drifted (4 → 3) during brainstorming
- **Incident:** User's original prompt listed 4 artifacts (md + xlsx + py + html). Brainstorming clarified that the `.py` wasn't user-facing under the pure-JS runtime; dropped to 3 artifacts.
- **Root:** I accepted the initial enumeration at face value without pressing on whether each item actually earned its place.
- **Fix (applied):** Spec § 3 D7 locks at 3 artifacts; D8 clarifies Python is internal-only.
- **Rule:** Enumerated requirements from the user's first message are candidates, not commitments. Each should be pressure-tested against the constraints that emerge during brainstorming.

---

## Group 2 — Substance vs surface enforcement (the VERDICT-P flip class)

### L4. R7 grep counted markers instead of coverage (the headline incident)
- **Incident:** Acceptance criterion R7 tested marker presence (`grep -cE '^> \*\*(Dalio|NON-DALIO)' >= 8`). Both Wave 0 pilots passed the grep (11 markers each). Advisor caught that specific thresholds in § 5/§ 6 — 0.66/0.33 tertile cuts in 1.1, ±25% and 1.5× ratios in 2.2, the +1/0/−1 bias matrix in 2.2 — appeared in the body WITHOUT nearby attribution markers, only acknowledged in § 10.
- **Root:** Acceptance criteria framework biased toward grep-testable one-liners. I treated a substance rule ("every threshold attributed at point of use") as a presence rule ("≥ 8 markers exist").
- **Fix (applied):** Retro § 3 #5 added Hard Rule R10 to prompt template (pending user approval) + acceptance-criterion R7b (spot-check each threshold in § 5/§ 6 for a marker within 3 lines).
- **Rule:** **When a rule is about coverage, never enforce it with a count-only grep. Always pair with a substance spot-check.** Goodhart's Law — the metric becomes the target.

### L5. Word-count checks were chasing awk artifacts instead of content
- **Incident:** My awk command for §1 word count produced "503 words" for a 3-line section — a parsing quirk, not a real failure. I was about to debug the awk; user interrupted: "word count is not as important as material relevance and accuracy."
- **Root:** I over-invested in automated numeric checks and under-invested in content reads.
- **Fix (applied):** Spec D5 updated mid-session to "concise + complete; no point lost; word count secondary." Retro's evaluation re-read both pilots in full rather than relying on automated metrics.
- **Rule:** For research output, read the file. Automated checks are sanity filters, not substitutes for substance review.

### L6. Agent self-reports claimed all-pass; independent verification was required
- **Incident:** Both Wave 0 agents returned "all criteria passing" summaries. Independent re-reading caught the attribution gaps that the agents (and the initial retro) missed.
- **Root:** Agents are motivated to report success. The plan already encoded "agent completion summaries are not authoritative — verify by reading files" but I nearly skipped independent verification when their self-reports were confident.
- **Fix (applied):** Wave 0 plan Task 4 Step 1 made independent re-read explicit; Wave 1 will follow the same pattern.
- **Rule:** Always re-read the file after an agent run, even when the agent's summary is confident.

---

## Group 3 — Plan/execution mechanics (process gaps)

### L7. Subagent-driven execution doesn't preserve in-memory state between tasks
- **Incident:** Original Wave 0 plan had Task 3 "build `prompt_A` in memory" and Task 4 "spawn agent with `prompt_A`." Advisor caught that subagent-driven execution creates fresh context per task — the variable wouldn't survive.
- **Root:** I designed the plan assuming one continuous session, not fresh-context-per-task.
- **Fix (applied):** Tasks merged — one task now covers "build prompt and spawn agent." Reduced 7 tasks to 6.
- **Rule:** When a plan step hands state to the next step, persist it to a file OR merge the steps. Never rely on in-memory variables across tasks.

### L8. Over-proposed files (7 when 4 would do)
- **Incident:** Wave 0 plan initially scaffolded 7 files for one pilot (prompt_template, subsections.json, acceptance_criteria, filled_prompt_A, filled_prompt_B, evaluation, retro, plus the pilot outputs). Advisor consolidated: registry lives in template file, filled prompts are ephemeral, evaluation+retro merge.
- **Root:** Reflex toward "more files = more rigor." Actually: more files = more places for drift.
- **Fix (applied):** Wave 0 file count dropped to 4: `_prompt_template.md`, `_acceptance_criteria.md`, `##_<slug>.md` outputs, `_wave0_retro.md`.
- **Rule:** Every scaffolding file must justify its own existence. If two files would always change together, they should be one file.

### L9. Awk range-pattern overlap caused silent empty output
- **Incident:** My awk `/^### 8c/,/^### 8|^## § 9/` exited immediately because `### 8c` matches BOTH the start AND the end pattern. Produced empty hex-color output; could have been mis-read as "no colors in § 8c."
- **Root:** Range-pattern end clause overlapping the start clause.
- **Fix (applied):** Used `sed -n '<start_line>,<end_line>p'` with explicit line numbers when ranges matter.
- **Rule:** Validate awk/sed ranges with a test that should return content before trusting an empty result as meaningful.

### L10. Slot-count drift between plan and template (5 vs 6)
- **Incident:** Plan said "5 slots: {SEQ}, {ID}, {TITLE}, {SCOPE_IN}, {SCOPE_OUT}" but the actual prompt has 6 (adds `{slug}` in the delivery path).
- **Root:** I mentally grouped `{SEQ}_{slug}` as one identifier rather than two separate placeholders.
- **Fix (applied):** Template documented all 6 slots; verification commands check all 6.
- **Rule:** Count placeholder substitutions literally, not semantically.

---

## Group 4 — User-direction dynamics (recommendation vs authority)

### L11. User overrides often signal I underweighted their stated goals
- **Incident:** Q1 (corpus scope) and Q2 (granularity): user picked the non-recommended options. The anti-capitulation reconciliation found that my recommendations had underweighted user's own stated goals ("consolidate ALL Dalio" and "AS COMPREHENSIVE AS POSSIBLE").
- **Root:** My recommendations optimized for "easy to execute" rather than "serves the user's stated goal."
- **Fix (applied):** Subsequent recommendations explicitly traced back to user goals; reconciliations surfaced my blind spots rather than silently complied.
- **Rule:** If the user overrides a recommendation, start by re-reading their prior messages for goals I may have underweighted. Don't assume they're wrong OR that I should silently flip.

### L12. Design language evolves through dialogue — layer, don't discard
- **Incident:** Visual language went Bridgewater-esque → "minimal black + elegant green" → "Claude-editorial × Apple-elegant × black + green." Each revision added without obliterating prior intent.
- **Root:** No fix needed — this is a healthy pattern.
- **Rule:** When design language gets a new directive, integrate it WITH prior decisions rather than replacing the earlier palette/typography choices wholesale.

### L13. Auto-mode doesn't mean skip decision gates
- **Incident:** Auto-mode activated mid-Wave-0. I continued execution but paused before applying BLOCKING refinements (R3, R5) without user approval — correctly.
- **Root:** Auto-mode ≠ autonomous decisions on user-level scope/policy choices.
- **Fix (applied):** Handoff doc explicitly lists the 4 decisions awaiting user; plan already gated Task 6 on Task 5 user approval.
- **Rule:** Auto-mode authorizes action on well-scoped low-risk work. Policy-level decisions (scope, refinements, spawn) still need explicit user approval.

---

## Group 5 — Session-management discipline

### L14. Pre-compaction handoff discipline
- **Incident:** At ~85% context the user asked to prepare for compaction. Handoff file written to `docs/superpowers/HANDOFF_2026-04-23.md` captures current state, locked decisions, git log, open items, and what-to-do-on-resume.
- **Root:** No failure — proactive pattern.
- **Rule:** At ≥ 80% context, write a self-contained handoff document so the next session can resume without re-deriving decisions.

### L15. Advisor cadence: end-of-plan + post-pilot
- **Incident:** User initially asked for advisor-after-each-chunk. Advisor itself flagged that 50 lines of header don't give enough to shift trajectory; per-chunk = low signal per call. User accepted batching to two inflection points.
- **Root:** Advisor value is highest at decision points, lowest at continuous editing.
- **Rule:** Call advisor at structural inflection points: (a) plan draft complete, (b) after first real output. Not mid-writing.

### L16. The fix-while-retrospecting rule
- **Incident:** The retro proposed R5 (new Hard Rule R10) + R7b without applying them to the prompt template / acceptance criteria files. Applied only in the retro doc. User then paused — so the META-fix is in a "proposed" state rather than "applied" state. The lessons-learned skill explicitly warns against this ("Recommend without acting → Lessons forgotten, recurs").
- **Root:** Plan gated refinement application on user approval. Wasn't wrong, but meant the fix is incomplete until user returns.
- **Fix (applied): partial** — retro documents exact diff-level text. On resume, applying R3/R5/R7b is mechanical (not another decision point).
- **Rule:** If a fix is gated on user approval, spell out the exact diffs in the retro doc so applying later is mechanical.

---

## Meta-rule synthesis (cross-cutting)

1. **Coverage rules need coverage checks.** Presence grep ≠ coverage grep. (L4)
2. **Substance > surface.** Read the file; automated checks are filters, not substitutes. (L5, L6)
3. **Scope is a conversation, not a parse.** Surface literal-vs-rhetorical ambiguity to the user. (L1)
4. **Constraint first, content second.** Repo visibility and copyright policy BEFORE proposing content sources. (L2)
5. **State in files, not memory, across plan tasks.** (L7)
6. **Every scaffold file must earn its place.** (L8)
7. **User overrides flag my blind spots before they flag theirs.** (L11)
8. **Auto-mode is for execution, not policy.** (L13)

## Fixes already implemented in this session

| Fix | Type | Location | Status |
|---|---|---|---|
| Public-repo + attribution rules | Hard rules R7/R8/R9 | Spec § 7 + `_prompt_template.md` | Applied |
| Point-of-use attribution (Hard Rule R10) | Hard rule | `_wave0_retro.md` § 3 #5 (text ready) | Proposed, awaiting user |
| Acceptance-criterion spot-check (R7b) | Checklist item | `_wave0_retro.md` § 3 #5 (text ready) | Proposed, awaiting user |
| Word count demoted | Decision | Spec D5 + acceptance criteria S2 informational | Applied |
| Handoff doc discipline | Doc | `docs/superpowers/HANDOFF_2026-04-23.md` | Applied |
| 4-file consolidation (from 7) | Plan refactor | `2026-04-23-wave0-pilot.md` | Applied |
| Task 3 + Task 4 merged | Plan refactor | `2026-04-23-wave0-pilot.md` | Applied |

## Verification — how to know the META fix (coverage-rule rule) holds

- **Test scenario:** When writing Wave 1 acceptance criteria additions (if any), every new rule is classified as "presence-check" or "coverage-check" explicitly; coverage-check rules get paired grep + spot-check.
- **Success criteria:** No future retro flips from PASS to FAIL because a grep counted presence instead of coverage.
- **Review date:** After Wave 1 retro (expected within this or next session).

## `[LEARN]` tags recorded in MEMORY.md

- `[LEARN] coverage vs presence` (L4)
- `[LEARN] read the file, don't only grep` (L5, L6)
- `[LEARN] public-repo copyright first` (L2)
- `[LEARN] subagent-driven = files not memory` (L7)
- `[LEARN] user overrides flag my blind spots` (L11)
- `[LEARN] advisor at inflection, not chunk` (L15)
