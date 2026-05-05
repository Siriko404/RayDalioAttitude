# Handoff — Phase 4 (v2 deep-research prompt system)

**Date:** 2026-05-05.
**HEAD at write time:** `6447a26`.
**Branch:** `main`.
**Verifier:** `python chatgpt_audit_kit/_layer3_bodycite_verify.py` → 12/12 PASS on `research/`.

---

## TL;DR — where we are

The project pivoted twice in this session. Both pivots are durable, both are reflected in the commits.

**Pivot 1 — Build-only constraint.** User declared (verbatim): *"NO research, fixing files, or nothing knowledge related will be done by you! you are responsible for BUILDING ONLY."* Claude no longer reads primary sources to verify ChatGPT-audit findings, no longer decides VALID/DISMISS/INVALID, no longer writes research-file body content, no longer makes framing decisions, no longer writes README narrative. Claude DOES: apply mechanical patches the user (or external research) hands over, run scripts, build code (Python, openpyxl, HTML/JS), git ops, advisor calls, format conversions.

**Pivot 2 — Phase 4 audits become external.** Instead of Claude verifying ChatGPT-audit findings against primary sources, the 12 research files are regenerated from scratch by ChatGPT Pro Deep Research under engineered prompts. The pilot ran on topic 1.4 Deleveragings (commit `e37dffb` v1). Redteam audit on the v1 output found two CRITICAL R12 quote-fidelity violations (manufactured words inside Dalio blocks) plus a CRITICAL framework regression (4-lever decomposition abandoned vs the existing hand-built file). v1 REJECTED.

The v2 prompt system (commit `6447a26`) is the current state. It uses a scalable template + registry + generator architecture, with 9 new hard rules R17-R25 derived from the redteam findings. 12 v2 prompts are generated and ready. **Awaiting user to run topic 04 v2 prompt through ChatGPT Pro Deep Research as the pilot retest.**

---

## What changed this session — commit chronology

```
14ffda8  phase3.5(advisor follow-up): 08-#4 local-cache grep added           (pre-pivot)
2f9ce87  phase3.5: cluster-F spot-check + 3 stragglers swept                  (pre-pivot)
e37dffb  phase4-pivot: engineered deep-research prompt for 1.4 (PILOT v1)
6447a26  phase4: deep-research prompt v2 system — template + registry + generator
                ← current HEAD
```

**Pre-pivot work (still valid).** Phase 3.5 (research completeness sweep on cluster-F entries) was completed before the pivot. All 12 research files in `research/` pass marker-block-strict body-cite verifier. That work is preserved as the comparison baseline against the new deep-research outputs.

**Pivot artifacts (this session).**
- `chatgpt_audit_kit/_deepresearch_prompt_template.md` — universal R1-R25 + 11-section schema + slot syntax `<<<...>>>`.
- `chatgpt_audit_kit/_deepresearch_prompt_registry.py` — per-topic context (named components, expected cases, Tier-1 source allowlist) for all 12 topics.
- `chatgpt_audit_kit/_deepresearch_prompt_generator.py` — combines template + registry, emits `_deepresearch_prompt_NN_slug.md` files.
- `chatgpt_audit_kit/_deepresearch_prompt_NN_slug.md` (× 12) — generated per-topic prompts.
- `chatgpt_audit_kit/_redteam_review_pilot_04_deleveragings.md` — full redteam findings on v1 with REJECT verdict and rule-sharpening recommendations.
- `research_v2/04_deleveragings.md`, `04_deleveragings.pdf` — v1 pilot output (preserved as comparison baseline; PDF is the canonical render with proper footnoted URL bibliography).

---

## Hard rules R1-R25 — what's in the v2 prompt

R1-R16 carry over from the original `research/_prompt_template.md` (R1-R15) plus the §11 Completeness Self-Audit table requirement (R16) introduced in the v1 pilot. R17-R25 are NEW, derived from the redteam findings on v1.

```
R1  All 11 sections present (was 10; §11 added)
R2  Numeric thresholds / formulas cited
R3  Inputs name specific public data source
R4  ≥85% inputs/formulas/impl ratio (vs ≤15% narrative)
R5  Ambiguities CLOSED via Dalio cite / NON-DALIO cite / DERIVED marker
R6  No out-of-scope content
R7  Visual attribution markers Dalio / NON-DALIO / DERIVED
R8  Public URL only (no paywalls)
R9  Commercial-book quote ≤1 sentence at a time, ≤2 cumulative
R10 Point-of-use attribution within 3 lines of derived threshold
R11 URL pre-flight WebFetch each URL before citing
R12 Quote fidelity verbatim from retrieved text
R13 Data-series ID verification
R14 Worked-example arithmetic self-check
R15 §10 has exactly 2 sub-sections (Limitations / Sources). No open questions.
R16 §11 Completeness Self-Audit table (gap → keywords → hits → closure → location)

R17 NEW — Framework-component coverage (topic-bound). For every named
    component in §2 quotes (4 levers, 8 measures, etc.), §5 must operationalize,
    §6 must emit, §7 must show column, §11 must row.
R18 NEW — Decision-rule truth-table closure. Catch-all UNRESOLVED forbidden;
    every Boolean cell maps to a named regime tag.
R19 NEW — Numeric provenance inline. Every value in §5/§6/§7 carries
    inline (source, p.N) cite + §11 row. Footer-style sources insufficient.
R20 NEW — Dalio corpus breadth. Min N Tier-1 sources searched (topic-bound);
    each searched source ≥3 verbatim quotes OR §11 row with verbatim
    Dalio passage proving silence on the gap.
R21 NEW — Verbatim quote audit appendix `_quote_audit.md` with byte-equal
    source-text diff per Dalio block. Catches manufactured words.
R22 NEW — Cross-section consistency. Every variable in §6/§7/§8 defined
    in §4/§5. URLs canonical/identical across §4/§8/§10.
R23 NEW — Worked-example case coverage. Topic-bound min N cases from
    registry allowlist. Boolean flags must derive from row data.
R24 NEW — Autoformat contamination rejection. Smart quotes / emoji / em-dash
    inside Dalio blocks = rejection.
R25 NEW — Book-attribution sanity check. Every Dalio cite matches Tier-1
    taxonomy by exact title. (BDC ≠ HCGB-1 ≠ HCG.)
```

---

## v1 pilot — what failed (redteam findings)

Full report: `chatgpt_audit_kit/_redteam_review_pilot_04_deleveragings.md` (2,759 words). Key findings:

**CRITICAL — R12 violation line 9.** The new file's `> **Dalio**` block:
> "The differences between **how** deleveragings **are resolved** depend on the amounts and paces of 1) debt reduction, 2) austerity, 3) transferring wealth from the haves to the have-nots and 4) debt monetization."

Canonical In-Depth Look 2012 PDF page 1 (verified by redteam WebFetch) actually reads:
> "the differences between deleveragings depend on the amounts and paces of 1) debt reduction, 2) austerity, 3) transferring wealth from the haves to the have-nots, and 4) debt monetization."

Words `how` and `are resolved` were manufactured inside a verbatim Dalio block. Comma before "and 4)" was deleted. Stand-alone R12 rejection trigger.

**CRITICAL — R12 + book misattribution line 17.** Quote: *"the debt-to-income ratio HAS THE BE lowered by roughly 50%, give or take about 20%."* "has the be" is non-grammatical. Cite is to *How Countries Go Broke* Part 1, p. 27. Redteam read the canonical PDF pp. 25-42 and could not find the cited text. MEMORY records the verified location as HCGB-1 Ch 1 — a different Tier-1 book.

**CRITICAL — Framework regression.** v1 quotes the 4 levers in §2 but never operationalizes them. The existing hand-built `research/04_deleveragings.md` §5.2 has per-lever pp-of-GDP formulas, lever-share scores, balance flags wired into §6 and §8a. v1: zero. The 4-lever decomposition IS the substantive core of Dalio's In-Depth Look 2012; v1 is non-responsive to the prompt's own IN-SCOPE clause.

**Engineer error.** Claude's initial v1 verdict overstated rigor: "13 gates PASS + body-cite verifier PASS" — body-cite verifier checks marker presence + topic keywords, NOT byte-equal quote matching. The R12 violations went unflagged. Claude's "+175% input-table rows" stat was also wrong (actual delta is +10%; my regex under-counted the existing file). These are documented in the redteam report.

**v2 prompt addresses each finding** via R17 (framework coverage), R21 (quote-audit byte-equal diff), R25 (book-attribution check), and topic-bound registry context.

---

## v2 retest plan — workflow

When user is ready to retest:

1. Open `chatgpt_audit_kit/_deepresearch_prompt_04_deleveragings.md` (v2).
2. Copy the entire `## PROMPT (paste the block below into Deep Research)` code-fenced block.
3. Paste into ChatGPT Pro Deep Research.
4. Save the model response to `research_v2/04_deleveragings.md` (will overwrite v1).
5. Save the model's `_quote_audit.md` appendix to `research_v2/04_deleveragings_quote_audit.md` (per R21).
6. User signals Claude to run verification.

**Verification chain Claude runs:**

```
1. Schema + R1-R16 gates (existing 13 automated checks + body-cite verifier)
2. R17 component-coverage check
   - For each registry component, verify §5 transform + §6 emission +
     §7 column + §11 row presence
3. R18 truth-table closure check
   - Verify §6 contains explicit truth table with no UNRESOLVED catch-all
4. R19 numeric-provenance spot-check (5 numerics from §5/§6/§7)
5. R20 corpus-breadth check (≥4 Tier-1 sources searched per registry)
6. R21 byte-equal quote audit
   - Run diff between body Dalio blocks and _quote_audit.md appendix
   - Any non-zero diff without [sic] = reject
7. R22 cross-section consistency
   - Variable definitions across §4/§5/§6/§7/§8
   - URL canonicalization across §4/§8/§10
8. R23 case-coverage check (≥4 cases from registry allowlist)
9. R24 autoformat scan (smart quotes / emoji inside Dalio blocks)
10. R25 book-attribution scan (cite text vs Tier-1 taxonomy)
11. Side-by-side diff vs research/04_deleveragings.md
12. User decision: approve / reject / refine
```

If v2 PASSES: scale by running the other 11 v2 prompts through deep research.
If v2 FAILS: iterate the prompt (template or registry) + regenerate + re-run.

---

## Architecture details — for the next session

```
chatgpt_audit_kit/
  _deepresearch_prompt_template.md     ← universal R1-R25 + schema. Has slot
                                          syntax <<<NAME>>>. Edit this for
                                          rule changes that apply to all 12.
  _deepresearch_prompt_registry.py     ← per-topic context. Edit this for
                                          topic-specific changes (named
                                          components, cases, sources).
  _deepresearch_prompt_generator.py    ← combines template + registry. No
                                          regular edits. Run after every
                                          template/registry change.
  _deepresearch_prompt_NN_slug.md      ← 12 generated files. DO NOT edit
                                          directly — regenerated by the
                                          generator. Edits are overwritten.
```

**Slot syntax:** `<<<ID>>>`, `<<<TITLE>>>`, `<<<SEQ>>>`, `<<<slug>>>`, `<<<SCOPE_IN>>>`, `<<<SCOPE_OUT>>>`, `<<<NAMED_COMPONENTS_BLOCK>>>`, `<<<EXPECTED_CASES_BLOCK>>>`, `<<<EXPECTED_CASES_MIN>>>`, `<<<TIER1_SOURCES_BLOCK>>>`, `<<<TIER1_SOURCES_MIN>>>`. Chosen to avoid collision with example uses of `{ID}` etc. inside instruction prose.

**Registry shape per topic:**
```python
"NN": dict(
    seq, id, slug, title,
    scope_in, scope_out,           # prose paragraphs
    named_components=[             # for R17 enforcement
        dict(name, items, dalio_anchor, operationalization),
        ...
    ],
    expected_cases=dict(           # for R23 enforcement
        min,                        # int
        allowlist,                  # list[str]
    ),
    tier1_sources=dict(            # for R20 enforcement
        min,                        # int
        allowlist,                  # list[str]
    ),
)
```

**Generator commands:**
```bash
# Generate one topic
python chatgpt_audit_kit/_deepresearch_prompt_generator.py 04

# Generate all 12
python chatgpt_audit_kit/_deepresearch_prompt_generator.py
```

---

## Per-topic registry status

Topic 04 (Deleveragings) is **fully populated** for the pilot retest — 4 levers + 3 archetypes as named components, 7 historical cases as allowlist, 6 Tier-1 sources. Other topics carry **best-derivation skeleton** populations from existing `research/_prompt_template.md` IN/OUT scope plus Dalio framework structure inferences. Some fields may need user / external research confirmation before each topic's prompt runs through deep research.

Quick registry sanity:
```bash
python chatgpt_audit_kit/_deepresearch_prompt_registry.py
```
Outputs per-topic component count + min cases + min sources.

---

## Memory state at compaction

Updated by this session:
- `MEMORY.md` index — points to current memory files.
- `project_phase4_v2_prompt_system.md` — current architecture (NEW).
- `feedback_buildonly_constraint.md` — build-only pivot (NEW).
- `project_layer2_state.md` — REPLACED with handoff pointer + sunset note.

Pre-pivot memories preserved (still useful as backup reference):
- `feedback_layer2_methodology.md` — sequential per-file workflow. Still valid for the *existing* `research/` files (1-4 audited; 5-12 untouched). Build-only pivot supersedes for new work.
- `reference_pdf_workflow.md` — PDF extraction + verification recipes.
- Other feedback memories.

---

## Pre-existing project facts (still valid)

**Verified Dalio quotes (Phase 3 work, pre-pivot — still source-of-truth for backup verification):**
- HEMW p. 5: cycle ranges "50 to 75 years" / "5 to 8 years"
- HEMW p. 7: "$50 trillion" debt, "$3 trillion" money, "roughly 15 times"
- HEMW p. 18: 6-phase cycle, "around 3.5-4%" + "about 2½ years"
- HCGB-1 Ch 1 footnote: MP scheme renumbered (current MP1 Linked, MP4 Coordinated, MP5 Big Deleveraging, MP6 Hard Money)
- HCGB-1 Ch 1 Stage 4: "lowered by roughly 50%, give or take about 20%"
- HCGB-1 Ch 3: "interest rates being higher than income growth by 2%...debt-to-income ratio to increase by around 50% over 20 years"
- Engineering p. 3: "Alphas...risk-adjusted returns slightly negative on average"
- Engineering p. 8 Chart 5: P1 N=6 ρ=0.25 IR=0.6; P2 N=77 ρ=0.04 IR=1.4
- Engineering p. 11: "around 2 times leveraged"
- Engineering L466-467: tracking-error "3% / 6%" examples
- CWO Ch 1 LinkedIn: "roughly equal average of 18 measures of strength"
- Robbins reprint: "30% in stocks…15% in immediate term…40% in long-term bonds…7.5% in gold…7.5% in commodities"
- Our Thoughts 2015 p. 6: 25% per quadrant risk allocation

**Verified factual claims:**
- TCMDO units = MILLIONS USD (FRED Q4 2025 = 107,632,484 mn = $107.6T)
- M2SL units = BILLIONS USD (Dec 2025 ≈ 22,411 bn)
- BIS dataflow current version = `BIS,WS_TC,2.0`
- Hamilton 2018 (NBER w23429) does NOT define ±1σ classification band
- Schema spacing typo: `audit_prompt.md` uses 2 spaces; `_acceptance_criteria.md` S4 regex uses 1 space (canonical). All ChatGPT spacing MINOR findings = false positives → DISMISS.

**Environment constraints:**
- FRED is BLOCKED for Claude's WebFetch (403). Workarounds: WebSearch metadata; WebFetch on third-party PDF mirrors; firecrawl agent (per redteam workflow this session).
- WebFetch on PDF saves binary to disk; Read tool with `pages:N-M` extracts text + renders.
- Python on Windows console is cp1252; use `.encode('ascii', 'replace').decode()` for printing strings with §, ρ, σ, etc.

---

## Pending work — Phase 5

Phase 5 (final consolidation) has not started. Per build-only constraint:
- `README.md` (narrative) — user writes; Claude assembles structure.
- `dalio_dashboard.html` — Claude builds (pure JS + ECharts + locked palette per design spec).
- `dalio_model.xlsx` — Claude builds (openpyxl + Power Query connections).
- Cross-test scripts — Claude builds.
- GitHub push — Claude executes.

Phase 5 build can start *now* against existing `research/` files (12/12 verifier-passing) OR wait for v2 deep-research outputs to land in `research_v2/`. Decision deferred to user direction post-pilot-retest.

---

## How to resume next session

1. Read this handoff (you're doing that).
2. Read `MEMORY.md` index. Memory files load automatically per Claude Code session-start hooks.
3. `git log --oneline -5` to confirm HEAD `6447a26` (or whatever's current).
4. `python chatgpt_audit_kit/_layer3_bodycite_verify.py` to confirm `research/` baseline still 12/12.
5. `ls research_v2/` to see whether user has run v2 prompt for any topics yet.
6. If `research_v2/04_deleveragings.md` is newer than `6447a26` commit time → user has run v2 retest, run verification chain.
7. If unchanged → still awaiting user retest. Status report + ask for direction.

---

## Anti-capitulation discipline (active throughout)

Every meaningful position change in this session passed the 3-step protocol:
1. **Restate original** position.
2. **Identify NEW evidence** (not pushback / confidence / vibes).
3. **Evaluate on merit**.

Notable position reversals this session:
- "Pilot result: STRONG, scale to 11 more" → REJECT after redteam WebFetched canonical PDFs and found R12 violations. Evidence: byte-equal diff from primary source.
- "+175% input-table rows" → +10%. Evidence: redteam programmatic count with explicit definitions.
- "All 13 gates PASS = pilot ready" → "13 gates PASS but verifier doesn't catch quote fidelity, separate audit needed". Evidence: redteam pointed out body-cite verifier checks marker shape + topic keywords, NOT byte-equal text.

Build-only constraint stays active in next session unless explicitly lifted by user. Per-file authorization gate stays active for Phase 5 work.
