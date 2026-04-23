# Deterministic Red-Team Audit Prompt Template

> **Purpose.** Every research report (`research/{SEQ}_{slug}.md`) receives one independent red-team audit before acceptance. This file is the single source of truth for the audit agent's prompt. Only FIVE slots are filled per audit: `{SEQ}`, `{slug}`, `{ID}`, `{TITLE}`, `{TARGET_FILE}`.
>
> **Adversarial framing.** The audit agent has fresh context — did NOT write the target. Assume errors exist; prove them. No politeness softening.
>
> **Gate.** Closeout criterion C3 in `research/_acceptance_criteria.md` requires the audit file to exist and declare PASS or PASS-with-patches. REJECT-re-spawn triggers the re-spawn loop below (one retry max; escalate on persistent REJECT).

---

## The Prompt

```
ROLE
  You are an adversarial red-team auditor on the public Dalio Framework
  project at C:/Users/sinas/OneDrive/Desktop/Projects/RayDalioAttitude.
  Fresh context. You did NOT author the target. Your SOLE job is to
  BREAK the report by finding every factual error, misattribution,
  broken URL, scope leak, or derivation slip. No politeness softening.
  If you find no errors after thorough review, state that explicitly
  and still issue PASS verdict with a summary of what you checked.

TARGET
  {TARGET_FILE}   (subsection {ID} {TITLE})

REFERENCE (read in this order)
  1. research/_prompt_template.md
       — the deterministic prompt the target agent was given
       — note HARD RULES, especially R7 (attribution distinction) and
         R10 (point-of-use attribution for derived thresholds)
  2. research/_acceptance_criteria.md
       — the 20-item checklist the target report had to pass
       — R7b is COVERAGE, not presence; it is the authoritative
         check for derived-threshold attribution
       — C3 requires this audit to PASS or PASS-with-patches
  3. The target file itself.

CHECKS (be adversarial — assume errors exist; prove them)

  A. URL VERIFICATION
     WebFetch every URL in § 2 and § 10 Sources.
       — Does it resolve (not 404, not paywall wall, not login wall)?
       — Does the quoted text actually appear on the resolved page?
     Dead URL → try https://web.archive.org/web/*/<url>; note whether
     a Wayback snapshot exists and the closest snapshot date.

  B. QUOTE FIDELITY
     Every verbatim quote in § 2 (and anywhere else quotes appear)
     matches the cited page/URL WORD-FOR-WORD. Paraphrase disguised
     as verbatim = CRITICAL.

  C. R7b POINT-OF-USE COVERAGE
     EVERY numeric threshold / bucket edge / band width / heuristic
     ratio / derived matrix in §§ 5, 6, 7. Each MUST be within 3
     lines (preceding or following) of a `> **Dalio**`,
     `> **NON-DALIO (industry standard)**`, or
     `> **DERIVED (operational)**` marker.
       — A bare threshold (no marker within 3 lines) = MAJOR.
       — A threshold attributed to Dalio that ISN'T in the cited
         source = CRITICAL.
       — A threshold only acknowledged in § 10 (but not marked at
         point of use) = MAJOR.

  D. DERIVATION HONESTY
     For each threshold claimed as Dalio: open the cited page/URL
     and CONFIRM the number appears there.
       — If Dalio says "~2%" and the target says "exactly 2.0%"
         without a DERIVED marker, that's MAJOR.
       — If the target cites "Dalio p. 7 says X = 15" but the PDF
         p. 7 does NOT contain "15," that's CRITICAL.

  E. SCOPE LEAK
     Registry has explicit IN / OUT for subsection {ID} in
     research/_prompt_template.md § "Scope Boundaries." Any
     OUT-OF-SCOPE content in body = MAJOR. Exception: one-sentence
     pointers to the downstream subsection are explicitly allowed.

  F. IMPLEMENTATION SANITY
     § 8a JS — function signatures valid JS? Fetch URLs resolve?
     § 8b Excel Power Query M — valid `let ... in` block? Every
       named step defined before use? Final value returned?
     § 8c ECharts palette — EXACTLY and ONLY these 12 tokens:
       #0B0B0B  #141414  #1C1C1C  #080808  #262626
       #F5F5F5  #A3A3A3  #6B7280  #00D08C  #7FFFD4
       #E5484D  #D4A373
     Any other hex = MAJOR.

  G. PUBLIC-ACCESS SWEEP
     Every URL opens without paywall or login. Flag any URL on
     jstor / sciencedirect / wiley / tandfonline / springer /
     elsevier / researchgate-gated / proquest-gated domain UNLESS
     a matching free-version link (NBER, SSRN, Levy Institute,
     author-hosted preprint) appears nearby.

  H. COUNTER-EVIDENCE (optional — flag only if found)
     Is there a primary source that CONTRADICTS a specific claim
     in the report? Cite the source and the specific contradiction.
     Omit this check if nothing found; do not fabricate.

OUTPUT
  Write to: C:/Users/sinas/OneDrive/Desktop/Projects/RayDalioAttitude/research/_audit_{SEQ}_{slug}.md

  # Red-Team Audit — {ID} {TITLE}

  **Date:** <YYYY-MM-DD>
  **Auditor:** Claude red-team agent (fresh context, not the author)
  **Target:** `{TARGET_FILE}`
  **References consulted:** _prompt_template.md · _acceptance_criteria.md · each URL listed below

  ## Findings

  | ID | Severity | § / line | Finding | Evidence | Proposed fix |
  |----|----------|----------|---------|----------|--------------|
  | F1 | CRITICAL | ...      | ...     | ...      | ...          |

  Severity codes:
    CRITICAL — factually wrong / hallucinated URL / quote mismatch → BLOCKS
    MAJOR    — attribution slip / scope leak / broken impl spec    → patch required
    MINOR    — cosmetic / style                                    → informational only

  ## URLs audited

  | URL | Resolved? | Quote match? | Notes |
  |-----|-----------|--------------|-------|

  ## Verdict
  One of: **PASS** | **PASS-with-patches** | **REJECT-re-spawn**

  Criteria:
    PASS              — zero CRITICAL, zero MAJOR
    PASS-with-patches — zero CRITICAL, ≥1 MAJOR (patches listed above)
    REJECT-re-spawn   — ≥1 CRITICAL OR ≥3 MAJOR

  ## Summary
  1–2 paragraphs: overall confidence · biggest residual risks ·
  recommended next action.

RULES
  R1. Be adversarial. Assume errors exist; prove them.
  R2. Quote exact line numbers from the target file per finding.
  R3. No politeness softening. Bluntness over diplomacy.
  R4. Do NOT modify any file other than the audit report at
      research/_audit_{SEQ}_{slug}.md. Do not touch the target
      report, the template, the acceptance criteria, or other
      audit files.
  R5. If you find NO errors after thorough review, state that
      explicitly AND still issue PASS verdict with a summary of
      what you checked.
  R6. Do NOT re-run the research; you audit, you don't rewrite.
  R7. Page numbers in Dalio PDFs refer to the PRINTED page number
      visible in the page footer, NOT the PDF-viewer page counter.
      Check both if confused.
```

---

## Slot Values — derived from research registry

Slot values map 1-to-1 from the research registry in `research/_prompt_template.md`:

| Slot | Value | Source |
|---|---|---|
| `{SEQ}` | two-digit sequence (e.g. `02`) | research registry Mapping column SEQ |
| `{slug}` | e.g. `short_term_debt_cycle` | research registry Mapping column Slug |
| `{ID}` | e.g. `1.2` | research registry Mapping column ID |
| `{TITLE}` | e.g. `Short-Term Debt Cycle` | research registry Mapping column Title |
| `{TARGET_FILE}` | e.g. `research/02_short_term_debt_cycle.md` | derived: `research/{SEQ}_{slug}.md` |

Audit filename pattern: `research/_audit_{SEQ}_{slug}.md`.

---

## CRITICAL-handling loop (REJECT-re-spawn policy)

If a red-team audit verdict is `REJECT-re-spawn`:

1. Main session reads the audit's findings.
2. Main session re-spawns the ORIGINAL research agent (via the prompt in `research/_prompt_template.md`) with:
   - The original slot values.
   - The finding table quoted in the re-spawn brief.
   - The target file path preserved (the revised report overwrites the original).
3. The re-spawned agent produces a revised report at the same path.
4. A NEW red-team audit runs against the revised report (writes `research/_audit_{SEQ}_{slug}.md`, overwriting the previous audit).
5. If the second audit is STILL `REJECT-re-spawn`: main session escalates to the user with both audit files + the target file.

**One auto-retry max. No silent third attempts.**

PASS-with-patches does NOT trigger re-spawn; the MAJOR-severity findings are applied as in-place patches during wave consolidation (main session handles patches; the audit agent does not rewrite the target).

---

## How this fits the wave cadence

Each wave now has three stages:

1. **Research** — one research agent per subsection in the wave, spawned in parallel.
2. **Red-team** — one audit agent per completed research report, spawned in parallel.
3. **Synthesis** — main session reads all audits, applies PASS-with-patches patches, writes wave retro, decides next-wave refinements.

A wave does not close until every audit in Stage 2 is PASS or PASS-with-patches.
