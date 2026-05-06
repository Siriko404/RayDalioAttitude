# Handoff — Phase 4 (v3 content-free deep-research prompt system)

**Date:** 2026-05-05 (evening update).
**HEAD at write time:** see `git log` for current; v3 final at `5d9bc6d`.
**Branch:** `main`.
**Verifier:** `python chatgpt_audit_kit/_layer3_bodycite_verify.py` → 12/12 PASS on `research/`.

---

## ⚠️ SESSION-2 UPDATE: PATH E RECOMMENDATION (read this first)

**The v3 full-rewrite plan below is no longer the recommended path forward.**

After receiving two deep-research v3 outputs (`research_v2/01_economic_machine.pdf` and `research_v2/04_deleveragings.pdf` — the topic-04 v3 retest), evidence checks revealed:

1. **R12 charge against v3 1.4 dissolved.** WebFetched canonical In-Depth Look 2012 PDF p.1 directly. Found **TWO different wordings** of the deleveragings sentence on the same page:
   - Intro paragraph: *"differences between **how** deleveragings **are resolved** depend on the amounts and paces ... haves to the have-nots **and** 4) debt monetization."* (no comma before "and 4)")
   - Reprise paragraph: *"differences between deleveragings depend on the amounts and paces ... haves to the have-nots, **and** 4) debt monetization."* (with comma)

   v3 1.4 quoted the intro paragraph verbatim (correct). research/04 quoted the reprise paragraph verbatim (correct). **Both pipelines have correct R12 quote-fidelity.** The v1 redteam's "CRITICAL R12 violation" finding was itself a misidentification — they compared v1's quote (intro paragraph) to the reprise paragraph and called it a violation.

2. **R17 framework regression in v3 IS real and persistent.** v3 1.4 names the 4 levers in §1+§2 but does NOT operationalize them in §5/§6/§7. research/04 §5.2 has per-lever formulas, §7 lever-mix scores per case, §8a stacked-bar JS data structure. Same pattern verified on topic 12: research/12 has 4-archetype shock matrix; v3 hypothetical wouldn't reliably deliver this.

3. **Audit findings on research/ are mostly polish.** Sample audit_12: 9 findings (8 critical / 9 major / 3 minor). Only ~2 of 9 (22%) affect Phase 5 artifacts (commodity data source + JS off-by-one). The other 7 are research/ presentation issues (URL rot, marker placement, word ratios, ibid usage, spacing typos) that don't break the deliverables.

4. **Pivot premise was half-false.** The original v1→v2→v3 pivot was driven by R12 + R17 concerns. R12 was a misidentification. Only R17 was real. The v3 prompt's R17 reframing as discovery-directive caught the discovery side but the LLM doesn't reliably enforce operationalization — same problem v1 had.

### Path E (recommended next action)

```
1. Use research/ files as authoritative input to Phase 5.
   (12/12 verifier-passing; framework operationalization confirmed
   on topics 04 + 12.)

2. STOP running remaining 10 topics through ChatGPT Pro Deep Research.
   The v3 prompt + R21 verifier remain useful tools for cross-check,
   not as a full-rewrite mechanism.

3. Build the 3 deliverables directly:
   a. dalio_dashboard.html  ← Claude builds (JS + ECharts + locked palette)
   b. dalio_model.xlsx      ← Claude builds (openpyxl + Power Query)
   c. README.md narrative   ← user writes; Claude assembles structure

4. Apply ~25 artifact-relevant audit findings inline during build.
   Triage rule: does the finding affect what the artifact uses?
   YES = fix in artifact code; NO = leave research/ as-is.

5. Use existing v3 deep-research outputs (research_v2/01 + 04) as
   adversarial cross-check. Where v3 disagrees with research/ on
   substantive content, flag for primary-source verification.

6. Skip patching research/ markdown beyond what the artifact build
   surfaces. research/ ships in repo as historical-record-of-reasoning.
   The 3 artifacts are the actual deliverables.
```

### What's awaiting user decision

User asked "build deliverables from research/ now?" Response options:
- **Yes** → Claude starts on `dalio_dashboard.html` (or whichever artifact user picks first)
- **No, keep going with v3 deep-research** → user runs remaining 10 topics through ChatGPT Pro Deep Research; Claude continues v3 verification chain
- **Pause** → no action; resume next session

### v3 prompt system (built this session, kept for cross-check use)

Architecture committed at HEAD `5d9bc6d` is functional and content-free. If user later wants v3 deep-research on specific topics for cross-check or as polish on weak research/ files, the system is ready. The build-only constraint + content-free principle remain durable.

### Comparison receipts (for next-session re-check)

| | research/ | deep-research v3 |
|---|---|---|
| 12/12 verifier passing | YES | (1.1, 1.4 only — not run yet) |
| R12 quote-fidelity on topic 04 | correct (reprise paragraph) | correct (intro paragraph) |
| R17 framework operationalization on topic 04 | YES (§5.2 4-lever decomp + §7 + §8a) | NO (named, not operationalized) |
| R17 framework operationalization on topic 12 | YES (4-archetype shock matrix + §7 arithmetic + §8a) | not yet run |
| Audit findings | ~113 across 05-12; ~22% artifact-relevant | output-by-output; varies |
| Time to artifact-shipped | shortest (build now) | +8-20 hrs uncertain |

### Files received this session in research_v2/

- `research_v2/01_economic_machine.pdf` — v3 deep-research output for topic 1.1 (received from user; structurally clean)
- `research_v2/04_deleveragings.pdf` — v3 RETEST output for topic 1.4 (received from user; R17 regression observed)
- `research_v2/04_deleveragings_v1_rejected.{md,pdf}` — v1 pilot output preserved as comparison baseline (REJECTED, but R12 charge against it has been dissolved post-canonical-PDF check)

---

## (Original handoff — describes v3 architecture; still valid but Path E supersedes for next-session execution)

---

## TL;DR — where we are

The project pivoted three times in this session. All pivots are durable, all are reflected in the commits.

**Pivot 1 — Build-only constraint.** User declared (verbatim): *"NO research, fixing files, or nothing knowledge related will be done by you! you are responsible for BUILDING ONLY."* Claude no longer reads primary sources to verify ChatGPT-audit findings, no longer decides VALID/DISMISS/INVALID, no longer writes research-file body content, no longer makes framing decisions. Claude DOES: apply mechanical patches, run scripts, build code (Python/openpyxl/HTML/JS), git ops, format conversions.

**Pivot 2 — Phase 4 audits become external.** The 12 research files are regenerated from scratch by ChatGPT Pro Deep Research under engineered prompts. Pilot ran on topic 1.4 (commit `e37dffb` v1). Redteam REJECTED v1 (R12 violations + 4-lever framework regression).

**Pivot 3 — Content-free prompt principle.** User declared (verbatim): *"you must not give any content to the research agent! content means anything that can bias the research towards what you know from memory. the deep research must have deep research principles and find and organize and report the workflow on its own!"* This pivot supersedes the v2 redteam audit's commit-2 fixes (registry tier-1 restructure etc.) — the entire registry-content approach was operating within the WRONG framework. The model MUST discover Dalio's framework structure (named components, typologies, historical cases, source coverage) by EXHAUSTIVE primary reading. Pre-filling content (sources, frameworks, cases, labels) BIASES the model toward Claude's prior memory.

The v3 prompt system is the current state. It uses a scalable template + registry + generator architecture, with R17-R25 reframed as DISCOVERY-DIRECTIVE rules. 12 v3 prompts are content-free and generated. **Awaiting user to run topic 04 v3 prompt through ChatGPT Pro Deep Research as the pilot retest.**

---

## What changed this session — commit chronology

```
14ffda8  phase3.5(advisor follow-up): 08-#4 local-cache grep added           (pre-pivot)
2f9ce87  phase3.5: cluster-F spot-check + 3 stragglers swept                  (pre-pivot)
e37dffb  phase4-pivot: engineered deep-research prompt for 1.4 (PILOT v1)
6447a26  phase4: deep-research prompt v2 system — template + registry + generator
8615132  docs(handoff): phase 4 v2 deep-research continuation guide
545899e  phase4(redteam-fix-1): C1+M4+C3+M5+m2+M3 — template + generator structural fixes
e633c69  phase4(content-free pivot): strip all per-topic content from prompt system
06f12fc  chore: remove stray .commit_msg.tmp accidentally committed in e633c69
e3e6973  chore: gitignore .commit_msg.tmp scratch files
                ← current HEAD (subject to update on commit 3 of this run)
```

**Pre-pivot work (still valid).** Phase 3.5 (research completeness sweep) was completed before the pivot. All 12 research files in `research/` pass marker-block-strict body-cite verifier. That work is preserved as the comparison baseline against new deep-research outputs.

**Pivot artifacts (this session).**
- `chatgpt_audit_kit/_deepresearch_prompt_template.md` — universal R1-R25 + 11-section schema + DISCOVERY DIRECTIVE + slot syntax `<<<...>>>`. Content-free.
- `chatgpt_audit_kit/_deepresearch_prompt_registry.py` — 4 fields per topic only (seq, id, slug, title). Content-free.
- `chatgpt_audit_kit/_deepresearch_prompt_generator.py` — combines template + registry + builds `SUBSECTION_MAP`.
- `chatgpt_audit_kit/_deepresearch_prompt_NN_slug.md` (× 12) — generated content-free per-topic prompts.
- `chatgpt_audit_kit/_redteam_review_pilot_04_deleveragings.md` — v1 redteam findings.
- `chatgpt_audit_kit/_redteam_v2_prompt_system_audit.md` — v2 redteam findings (FAIL verdict). Most findings re-evaluated as relevant or irrelevant under content-free architecture (see "Audit findings re-evaluation" below).
- `chatgpt_audit_kit/_redteam_v2_quote_audit_diff.py` — R21 byte-equal verifier script (NEW; mechanizes verification-chain step 6).
- `research_v2/04_deleveragings.md`, `04_deleveragings.pdf` — v1 pilot output (preserved as REJECTED comparison baseline; still uses pre-pivot v2 framework so its content patterns are not the v3 target).

---

## Hard rules R1-R25 — what's in the v3 prompt

R1-R16 carry over from `research/_prompt_template.md` (R1-R15) plus R16 §11 self-audit. R17-R25 are NEW; R17/R20/R23 are reframed as DISCOVERY-DIRECTIVE in v3 (model discovers, prompt does not pre-fill).

```
R1   All 11 sections present (was 10; §11 added)
R2   Numeric thresholds / formulas cited
R3   Inputs name specific public data source
R4   ≥85% inputs/formulas/impl ratio + §11 ≤30% of §§4-8 (M3 fix)
R5   Ambiguities CLOSED via Dalio cite / NON-DALIO cite / DERIVED marker
R6   No out-of-scope content
R7   Visual attribution markers + pagination-dictated cite format (m2 fix)
R8   Public URL only (no paywalls)
R9   Commercial-book quote ≤1 sentence at a time, ≤2 cumulative
R10  Point-of-use attribution within 3 lines of derived threshold
R11  URL pre-flight WebFetch each URL before citing
R12  Quote fidelity verbatim from retrieved text
R13  Data-series ID verification
R14  Worked-example arithmetic self-check
R15  §10 has exactly 2 sub-sections (Limitations / Sources). No open questions.
R16  §11 Completeness Self-Audit table (gap → keywords → hits → closure → location)

R17  v3 — FRAMEWORK-COMPONENT DISCOVERY + COVERAGE. Model MUST discover
     every named multi-part construct Dalio defines for this subsection by
     primary reading; operationalize each component (§5/§6/§7/§11). Naming
     a component from prior knowledge without verbatim cite = rejection.
R18  Decision-rule truth-table closure. Catch-all UNRESOLVED forbidden.
R19  Numeric provenance inline.
R20  v3 — DALIO CORPUS EXHAUSTIVE SEARCH + SEARCH TRACE. Every Tier-1
     work (all 7 cascade entries) MUST appear as its own §11 search-trace
     row with 4 fields: Source / Keywords tried / Hit counts / Outcome.
     Skipping any Tier-1 work = rejection. Search-trace row sufficient
     for silence (no incoherent "verbatim passage proving silence").
R21  Verbatim quote audit appendix `_quote_audit.md` with byte-equal
     diff per Dalio block. NOW SCRIPTED — see verification chain.
R22  Cross-section consistency.
R23  v3 — CASE DISCOVERY + WORKED-EXAMPLE COVERAGE. Model MUST discover
     historical cases by reading Dalio case panels (BDC Part 2/3, In-Depth
     Look, HCGB-1, etc.); §7 covers ALL discovered cases; §11 includes
     a CASE COMPLETENESS row.
R24  v3 — Anti-AUTOFORMAT-CONTAMINATION (M5 fix). Reject model-introduced
     curly quotes / em-dashes where source has ASCII; ALSO reject silent
     ASCII-normalization of source-faithful typography. R21 audits against
     UN-NORMALIZED source bytes.
R25  Book-attribution sanity check. (BDC ≠ HCGB-1 ≠ HCG.)
```

---

## v3 prompt structure (PROMPT block delivered to ChatGPT)

```
ROLE
SUBSECTION (id, title; methodological statement: discover, do not assume)
SUBSECTION MAP (12 subsections, current marked, Module 1 / Module 2 split)
DISCOVERY DIRECTIVE (BLOCKING — orientation; you discover components, cases, sources)
SOURCE PRIORITY (BLOCKING; cascade Tier 1-5; Dalio FIRST, all 7 Tier-1 must be searched)
PUBLIC-ACCESS REQUIREMENT
DELIVERABLE (research_v2/SEQ_slug.md; floor 2000 words; +_quote_audit.md)
HARD RULES R1-R25 (with R17/R20/R23 discovery-directive)
REQUIRED OUTPUT SCHEMA (11 sections in order)
TONE
REJECTION TRIGGERS
```

What CHANGED from v2 → v3:
- DROPPED `NAMED FRAMEWORK COMPONENTS (TOPIC-BOUND)` section
- DROPPED `EXPECTED HISTORICAL CASE SET (TOPIC-BOUND)` section
- DROPPED `EXPECTED DALIO TIER-1 SOURCE COVERAGE (TOPIC-BOUND)` section
- DROPPED IN-SCOPE / OUT-OF-SCOPE prose (replaced by SUBSECTION MAP for boundaries)
- ADDED `SUBSECTION MAP` (computed from registry; current subsection marked)
- ADDED `DISCOVERY DIRECTIVE` block stating the model must discover, not assume
- REFRAMED R17/R20/R23 to be discovery-directive
- Cascade Tier 1: emphasized "ALL 7 works MUST be searched" (no per-topic subset)

---

## Audit findings re-evaluation (v2 redteam audit vs v3 architecture)

The v2 redteam audit (`_redteam_v2_prompt_system_audit.md`) found 4 CRITICAL / 7 MAJOR / 5 MINOR with verdict FAIL. Status under v3:

| Finding | Status |
|---|---|
| C1 — slot-doc table corruption | FIXED in commit `545899e` (generator slot-reference exclusion) |
| C2 — Tier-1 contamination across topics | IRRELEVANT under v3 (no per-topic Tier-1 lists exist) |
| C3 — R20 silence-proof incoherent | FIXED in commit `545899e` then re-clarified in v3 R20 |
| C4 — verification scripts missing | PARTIALLY FIXED in this commit (R21 byte-equal verifier script written) |
| M1 — Robbins on tier1 | IRRELEVANT under v3 |
| M2 — pilot context identical | IRRELEVANT under v3 (pilot context now project-wide by design) |
| M3 — R4 §11 cap missing | FIXED in commit `545899e` |
| M4 — generator docstring stale | FIXED in commit `545899e` |
| M5 — R12 vs R24 collision | FIXED in commit `545899e` |
| M6 — chronic-case mis-classification | IRRELEVANT under v3 (no case allowlist) |
| M7 — illustrative cases on topics 10/11 | IRRELEVANT under v3 |
| m1 — MP2/MP3 unverified labels | IRRELEVANT under v3 (no labels in registry) |
| m2 — R7 unpaginated fallback | FIXED in commit `545899e` |
| m3 — slot reference paired with C1 | FIXED with C1 |
| m4 — Topic 02 transitional catch-all | IRRELEVANT under v3 |
| m5 — Topic 06 8-vs-18 mismatch | IRRELEVANT under v3 |

Net: 9 CRITICAL/MAJOR fixed; 7 made irrelevant by content-free pivot.

---

## v1 pilot — what failed (redteam findings; still source-of-truth)

Full report: `chatgpt_audit_kit/_redteam_review_pilot_04_deleveragings.md` (2,759 words). Key findings recapped:

**CRITICAL — R12 violation line 9.** The v1 file's `> **Dalio**` block had `how` and `are resolved` manufactured inside the verbatim Dalio block + missing comma. Stand-alone R12 rejection trigger.

**CRITICAL — R12 + book misattribution line 17.** Quote *"the debt-to-income ratio HAS THE BE lowered by roughly 50%, give or take about 20%."* "has the be" is non-grammatical. Cite is to *How Countries Go Broke* Part 1, p. 27; verified location is HCGB-1 Ch 1 — different Tier-1 book.

**CRITICAL — Framework regression.** v1 quotes the 4 levers in §2 but never operationalizes them. Existing `research/04_deleveragings.md` §5.2 has per-lever pp-of-GDP formulas, lever-share scores, balance flags. v1: zero.

**Engineer error.** "13 gates PASS + body-cite verifier PASS" overstated rigor; body-cite verifier checks marker presence + topic keywords, not byte-equal quote matching. Recorded for honesty.

**v3 prompt addresses each finding via:** R17 DISCOVERY-DIRECTIVE (forces operationalization of every discovered component, not just §2 quoting), R21 byte-equal scripted audit (catches manufactured words), R25 book-attribution check, content-free architecture (model can't drift to CONTENT FROM PRIOR MEMORY because none is given).

---

## v3 retest plan — workflow

When user is ready to retest:

1. Open `chatgpt_audit_kit/_deepresearch_prompt_04_deleveragings.md` (v3).
2. Copy the entire `## PROMPT (paste the block below into Deep Research)` code-fenced block.
3. Paste into ChatGPT Pro Deep Research.
4. Save the model response to `research_v2/04_deleveragings.md` (will overwrite v1).
5. Save the model's `_quote_audit.md` appendix to `research_v2/04_deleveragings_quote_audit.md` (per R21).
6. User signals Claude to run verification.

**Verification chain Claude runs:**

```
Step  Rule(s)              Implementation        Action
----  -------------------  --------------------  -----------------------
 1    Schema + R1-R16      _layer3_bodycite_     Run script
                            verify.py (existing)
 2    R17 component cov    MANUAL                Spot-check §11 component
                                                  rows; compare to body
 3    R18 truth-table      MANUAL                Confirm §6 has explicit
                                                  truth table, no catch-all
 4    R19 numeric prov     MANUAL                5-numeric spot-check
 5    R20 corpus breadth   MANUAL                §11 search-trace has 7
                                                  Tier-1 rows w/ all 4 fields
 6    R21 byte-equal       _redteam_v2_quote_    Run script (NEW)
                            audit_diff.py
 7    R22 cross-section    MANUAL                Variable + URL trace
 8    R23 case coverage    MANUAL                §11 CASE COMPLETENESS
                                                  row + §7 row count
 9    R24 autoformat       MANUAL                Grep for smart quotes /
                                                  em-dashes inside Dalio
                                                  blocks; cross-check vs
                                                  source PDFs
10    R25 book attribution MANUAL                Cross-check cites vs
                                                  Tier-1 taxonomy
11    Side-by-side diff    MANUAL                vs research/04_*.md
12    User decision        MANUAL                approve/reject/refine
```

Steps 2-5, 7-10 are MANUAL today (Claude runs them with judgment + grep). Step 6 is now SCRIPTED. Future scripts can mechanize 2/3/4/5/8/9/10 — see "Future hardening" below.

If v3 PASSES: scale by running the other 11 v3 prompts through deep research.
If v3 FAILS: iterate the prompt (template only — registry has no content to iterate) → regenerate → re-run.

---

## R21 byte-equal verifier (NEW) — usage

```bash
python chatgpt_audit_kit/_redteam_v2_quote_audit_diff.py \
    research_v2/04_deleveragings.md
```

Auto-derives audit appendix path from main path (inserts `_quote_audit` before `.md`). Override with `--audit <path>`.

What it checks:
1. Every `> **Dalio**` block in the main has a matching audit entry whose `Quoted text in body` equals the body text byte-equal.
2. Every audit entry's `Quoted text in body` matches some body quote (no orphans).
3. Every audit entry's body_text vs source_text is byte-equal OR the diff field declares `[sic]` annotations.
4. Every audit entry has all 6 required fields (Body location, Source, Source URL fetched, Quoted text in body, Source PDF text, Diff).

Exit code 0 = PASS, 1 = FAIL.

What it does NOT check (the model's responsibility under R12+R21): whether the audit's `Source PDF text (byte-equal)` actually matches the real source PDF. That requires retrieving the source. The script verifies INTERNAL consistency of the appendix; primary-source fidelity is the model's job to certify.

---

## Architecture details — for the next session

```
chatgpt_audit_kit/
  _deepresearch_prompt_template.md   ← universal R1-R25 + schema. Slot syntax
                                       <<<NAME>>>. Edit for rule changes.
  _deepresearch_prompt_registry.py   ← 4 fields per topic (seq/id/slug/title).
                                       Edit only to change topic identifiers.
                                       NO content (per content-free pivot).
  _deepresearch_prompt_generator.py  ← combines template + registry + builds
                                       SUBSECTION_MAP. Run after every
                                       template/registry change.
  _deepresearch_prompt_NN_slug.md    ← 12 generated files. DO NOT edit
                                       directly — regenerated by the
                                       generator.
  _redteam_v2_quote_audit_diff.py    ← R21 byte-equal verifier (verification
                                       chain step 6).
```

**Slot syntax (5 slots only):** `<<<ID>>>`, `<<<TITLE>>>`, `<<<SEQ>>>`, `<<<slug>>>`, `<<<SUBSECTION_MAP>>>`. The slot reference table at the bottom of the template is auto-stripped before substitution (its literal `<<<NAME>>>` tokens document the slot syntax and would otherwise be clobbered).

**Registry shape per topic (4 fields):**
```python
"NN": dict(seq, id, slug, title)
```

**Generator commands:**
```bash
# Generate one topic
python chatgpt_audit_kit/_deepresearch_prompt_generator.py 04

# Generate all 12
python chatgpt_audit_kit/_deepresearch_prompt_generator.py
```

---

## Memory state at compaction

Updated by this session:
- `MEMORY.md` index — points to current memory files.
- `project_phase4_v2_prompt_system.md` — current architecture (will be updated to v3).
- `feedback_buildonly_constraint.md` — build-only pivot.
- `feedback_content_free_prompts.md` (NEW) — content-free principle for deep-research prompts.

Pre-pivot memories preserved (still useful as backup reference):
- `feedback_layer2_methodology.md` — sequential per-file workflow. Still valid for *existing* `research/` files. Build-only pivot supersedes for new work.
- `reference_pdf_workflow.md` — PDF extraction recipes.

---

## Pre-existing project facts (still valid)

The "Verified Dalio quotes" list in pre-pivot memory is **preserved for backup verification only**. It is NOT used to fill the prompt (per content-free principle). Useful when manually spot-checking the deep-research model's output against known-good source bytes.

**Verified factual claims (project-facts, not Dalio-content):**
- TCMDO units = MILLIONS USD (FRED Q4 2025 = 107,632,484 mn = $107.6T)
- M2SL units = BILLIONS USD (Dec 2025 ≈ 22,411 bn)
- BIS dataflow current version = `BIS,WS_TC,2.0`
- Hamilton 2018 (NBER w23429) does NOT define ±1σ classification band
- Schema spacing typo: `audit_prompt.md` uses 2 spaces; `_acceptance_criteria.md` S4 regex uses 1 space (canonical).

**Environment constraints:**
- FRED is BLOCKED for Claude's WebFetch (403). Workarounds: WebSearch metadata; WebFetch on third-party PDF mirrors; firecrawl agent.
- WebFetch on PDF saves binary to disk; Read tool with `pages:N-M` extracts text + renders.
- Python on Windows console is cp1252; the R21 verifier reconfigures stdout to UTF-8 to render §, ρ, σ, etc. correctly.

---

## Future hardening (non-blocking)

Scripts that could be added to mechanize verification chain steps:
- `_redteam_v2_truth_table_check.py` — R18: parse §6 for truth table, verify no catch-all phrases.
- `_redteam_v2_numeric_provenance.py` — R19: regex-extract numerics in §5/§6/§7, flag any without inline `(source, p.N)` or `(institution series-ID, date)` or `(derived from ...)` cite.
- `_redteam_v2_search_trace_check.py` — R20: parse §11 for the 7 Tier-1 rows, verify all 4 fields (Source / Keywords tried / Hit counts / Outcome) populated.
- `_redteam_v2_autoformat_scan.py` — R24: grep for smart quotes / em-dashes / emoji inside `> **Dalio**` blocks.
- `_redteam_v2_book_attribution.py` — R25: extract every `> **Dalio** — source: ...` cite, regex against the Tier-1 taxonomy (BDC / CWO / HCGB-1 / HEMW / In-Depth Look / Paradigm Shifts / LinkedIn).

Build them on demand when verification chain steps prove too noisy in manual judgment.

---

## Pending work — Phase 5

Phase 5 (final consolidation) has not started. Per build-only constraint:
- `README.md` (narrative) — user writes; Claude assembles structure.
- `dalio_dashboard.html` — Claude builds (pure JS + ECharts + locked palette per design spec).
- `dalio_model.xlsx` — Claude builds (openpyxl + Power Query connections).
- Cross-test scripts — Claude builds.
- GitHub push — Claude executes.

Phase 5 build can start *now* against existing `research/` files (12/12 verifier-passing) OR wait for v3 deep-research outputs to land in `research_v2/`. Decision deferred to user post-pilot-retest.

---

## How to resume next session

1. Read this handoff.
2. Read `MEMORY.md` index. Memory files load automatically per Claude Code session-start hooks.
3. `git log --oneline -10` to confirm current HEAD.
4. `python chatgpt_audit_kit/_layer3_bodycite_verify.py` to confirm `research/` baseline still 12/12.
5. `ls research_v2/` to see whether user has run v3 prompt for any topics yet.
6. If `research_v2/04_deleveragings.md` is newer than current commit time → user has run v3 retest. Run verification chain (script for step 6, manual for others).
7. If unchanged → still awaiting user retest. Status report + ask for direction.

---

## Anti-capitulation discipline (active throughout)

Every meaningful position change in this session passed the 3-step protocol:
1. **Restate original** position.
2. **Identify NEW evidence** (not pushback / confidence / vibes).
3. **Evaluate on merit**.

Notable position reversals this session:
- "Pilot result: STRONG, scale to 11 more" → REJECT after redteam WebFetched canonical PDFs and found R12 violations. Evidence: byte-equal diff from primary source.
- "+175% input-table rows" → +10%. Evidence: redteam programmatic count.
- "All 13 gates PASS = pilot ready" → "13 gates PASS but verifier doesn't catch quote fidelity". Evidence: redteam pointed out body-cite verifier checks marker shape + topic keywords, NOT byte-equal text.
- "Registry path (a) tier1_sources rename solves redteam C2" → "registry should have NO content at all". Evidence: user citing original session directive *"it must not give any content in the prompt!"* + principled correction that pre-filling biases the research.

Build-only constraint stays active in next session unless explicitly lifted. Per-file authorization gate stays active for Phase 5. Content-free principle stays active for any future prompt-engineering work.
