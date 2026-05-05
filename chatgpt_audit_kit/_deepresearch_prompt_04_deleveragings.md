# Deep Research Prompt — 1.4 Deleveragings (PILOT)

> **Purpose of this file (for the human user, NOT for the prompt itself).**
>
> This document contains an engineered prompt for ChatGPT Pro Deep Research (or equivalent) that produces a single research file at `research_v2/04_deleveragings.md`. The pilot tests whether external deep research can match or exceed the existing `research/04_deleveragings.md`. If the pilot succeeds, 11 more prompts of this form are engineered (one per topic). If it fails, the pivot is killed and the existing 12 files remain canonical.
>
> **What to do.** Copy the entire `## PROMPT (paste the block below into Deep Research)` section — verbatim, including the surrounding code fence — into ChatGPT Pro Deep Research. Save the model's full response to `research_v2/04_deleveragings.md`. Then run the verification chain in § Verification chain at the bottom of this file.
>
> **Hard requirement (do not violate).** This is a deep-research instruction document. The prompt below states what must be researched and how the output must be structured. The prompt MUST NOT contain pre-filled content, sample answers, illustrative quotes from Dalio, or any other text that the deep-research model could copy as-if it were its own analysis. The prompt instructs; it does not author.

---

## Pilot context (for the human user, NOT included in the prompt)

- **Topic:** 1.4 Deleveragings.
- **Project:** consolidates Ray Dalio's investment + macro frameworks into 3 operational artifacts (`README.md`, `dalio_dashboard.html`, `dalio_model.xlsx`) for portfolio managers. The 12 research files are the source material the artifacts are built from.
- **Failure modes the prompt must prevent:** depth shortfall, hard-rule violation, framing/scope drift, hallucinated or weakly-sourced citations, surviving open questions in the output.
- **Outcome standard:** COMPLETE + CONCLUSIVE. Every threshold, formula, decision rule, and worked-example number cited at point of use, with zero unresolved gaps in the output.
- **Source priority (HARD):** Dalio's own public corpus is presumed gap-free at the framework level. The prompt forces exhaustive Dalio-corpus search BEFORE any non-Dalio source may be introduced. Non-Dalio sources are restricted to a TOP-quality allowlist below and may only close real gaps after Dalio exhaustion is documented.

---

## PROMPT (paste the block below into Deep Research)

```
ROLE
  You are a deep-research analyst on Ray Dalio's investment and
  macroeconomic framework. You are NOT a theory writer and NOT a popular-
  finance explainer. You produce an operational analysis framework that a
  portfolio manager can plug numbers into tomorrow morning. Every numeric
  threshold, formula, decision rule, and worked-example number in your
  output MUST be sourced at point of use. Every gap MUST be closed. No
  open questions may survive in the output.

SUBSECTION
  ID:           1.4
  TITLE:        Deleveragings
  IN-SCOPE:     Beautiful vs ugly deleveraging; the four levers (austerity,
                debt defaults / restructurings, money printing,
                redistribution of wealth); deflationary vs inflationary
                deleveraging dynamics; archetype templates and how the four
                levers are applied in each archetype; conditions under
                which a deleveraging tips from beautiful to ugly; observable
                indicators that classify a current or historical deleveraging
                episode by type; transition between episode phases.
  OUT-OF-SCOPE: Cycle-detection itself (covered by 1.2 Short-Term Debt Cycle
                and 1.3 Long-Term Debt Cycle — do NOT re-derive how to detect
                you are in a deleveraging; assume that detection is upstream
                from this subsection); forward-looking paradigm-shift logic
                across decades (covered by 1.5 Paradigm Shifts); empire-
                scale 250-year reserve-currency cycle (covered by 1.6
                Changing World Order); inflation regime classification
                generic (covered by 1.7 Inflation & Currency Debasement);
                portfolio construction (covered by Module 2). If you find
                yourself writing about an out-of-scope topic, stop, replace
                the passage with one sentence pointing to the owning
                subsection, and continue.

SOURCE PRIORITY (BLOCKING — failure to follow = rejection)

  PRINCIPLE: Dalio's own public corpus is presumed gap-free at the
  framework level. You MUST exhaust the Dalio corpus BEFORE introducing
  any non-Dalio source. Every non-Dalio entry in your output must be
  preceded in §11 (Completeness Self-Audit) by an evidence row proving
  Dalio does not address the specific gap.

  Tier 1 — Ray Dalio primary writings (search EXHAUSTIVELY before moving on):
    - "Big Debt Crises" (BDC), 2018 — full PDF on economicprinciples.org;
      includes Part 1 archetypal template, Part 2 detailed case studies,
      Part 3 compendium of 48 cases.
    - "Principles for Dealing with the Changing World Order" (CWO), 2021 —
      free summary PDF on economicprinciples.org plus the LinkedIn
      installment series. Do NOT quote from the commercial hardcover
      beyond a single fair-use sentence; cite by chapter / section heading
      where the free LinkedIn version omits page numbers.
    - "Principles for Navigating Big Debt Cycles" (HCGB-1), 2024-2025 —
      free chapter releases on economicprinciples.org and LinkedIn.
      Renumbers the monetary-policy regime scheme MP1-MP5 vs BDC; verify
      the version you cite.
    - "How the Economic Machine Works — A Template for Understanding What
      is Happening Now" (HEMW), 2012 — paper plus 30-minute video, both
      free on economicprinciples.org.
    - "Paradigm Shifts" (LinkedIn essay), July 2019.
    - LinkedIn long-form posts and articles 2015-present.

  Tier 2 — Bridgewater public research (free on bridgewater.com):
    - "Engineering Targeted Returns and Risks" (Engineering 2011).
    - "The All-Weather Story".
    - "Our Thoughts About Risk Parity and All-Weather" (2015).
    - "Geographic Diversification Can Be a Lifesaver".

  Tier 3 — Speeches / interviews / testimony where a public recording or
    full-text transcript exists: CFR, Milken Institute, Davos, TED (2017),
    Lex Fridman Podcast, FT Head-to-Head, Bloomberg Studio 1.0,
    Congressional testimony.

  Tier 4 — Dalio-cited primary sources, ONLY if freely accessible in full
    (Irving Fisher 1933 "Debt-Deflation"; Hyman Minsky 1992 "Financial
    Instability Hypothesis"; NBER working-paper versions of Reinhart-Rogoff,
    Schularick-Taylor, etc.). For commercial books Dalio cites (Kennedy,
    Koo, Eichengreen, Ferguson, Allison, Huntington, Goodhart-Pradhan,
    Friedman-Schwartz, Reinhart-Rogoff hardcover): cite only, do NOT quote
    beyond R9 fair-use limits, link the publisher page or Wikipedia entry
    as the verifiable URL.

  Tier 5 (LAST RESORT) — TOP-quality non-Dalio sources to close residual
    gaps. May only be used after the gap is documented in §11 with
    evidence that Tiers 1-4 do not address it. Allowed sources are
    restricted to this exact list:
      - Central banks and supranationals: BIS, IMF, World Bank, ECB,
        Federal Reserve System (FRBNY, FRBSF, FRED, the Board of
        Governors), Bank of England, Bank of Japan, OECD.
      - Academic: NBER working papers, SSRN preprints, Levy Economics
        Institute, Fama-French Data Library, Damodaran (NYU Stern) public
        page.
      - US government data and research: BLS, BEA, CBO, OMB, US Treasury,
        SEC EDGAR.
      - Major finance institutions: Vanguard research, BlackRock Investment
        Institute, AQR research, Goldman Sachs Asset Management public
        papers (NOT marketing material). Only papers; not blog posts, not
        commentary.
    Any non-Dalio source outside this list = rejection of the report.

PUBLIC-ACCESS REQUIREMENT
  Every URL you cite MUST resolve to a publicly-readable page (no
  paywall, no login wall, no library-gated PDF). If the canonical source
  is paywalled, link the free working-paper or preprint version (NBER,
  SSRN, Levy, FRBxx, RePEc) and cite that as the URL. Citing a URL you
  have NOT WebFetch'd in this session = rejection.

DELIVERABLE
  One Markdown file. Save the model's response in full to
  research_v2/04_deleveragings.md. Document title (the H1 at the top of
  the file) MUST be exactly:

      # 1.4 Deleveragings

  Floor 2000 words. No upper cap on length. Length must be whatever the
  COMPLETE + CONCLUSIVE standard requires — no padding, no trimming
  below the closure standard.

HARD RULES (every rule binding; one violation = rejection)
  R1.  All 11 required sections below must be present, in order, with the
       exact section titles given. Missing a section = rejection.
  R2.  Every numeric threshold, formula, ratio, band edge, and decision
       boundary must carry a source citation at the point of use (Dalio
       cite, NON-DALIO cite, or DERIVED marker — see R7 / R10). No
       invented numbers. No "approximately" without a sourced anchor.
  R3.  Every input variable in §4 must name a specific public data source
       (institution name + dataset/series identifier + API endpoint or
       URL). Generic phrases ("could be obtained from a data vendor") are
       rejection-grade.
  R4.  Word ratio: the combined word count of §§4-8 (inputs / formulas /
       decision rules / worked example / implementation specs) must be
       at least 5.67 times the combined word count of §§2-3 (verbatim
       Dalio + decision-problem framing). That is the 85/15 split. Less
       than 5.67 = narrative theory padding = rejection.
  R5.  AMBIGUITY MUST BE CLOSED, NOT JUST ACKNOWLEDGED. If Dalio's writing
       leaves a numeric threshold or rule ambiguous, the gap MUST be
       closed at the point of use by ONE of:
         (a) Dalio-search exhaustion result — cite a Dalio source that
             DOES address the gap (search BDC, HEMW, HCGB-1, CWO,
             Engineering, Paradigm Shifts, "Our Thoughts", LinkedIn
             essays, Bridgewater Daily Observations, speeches/transcripts);
         (b) NON-DALIO industry-standard cite at point of use (see R7 /
             R10) drawn ONLY from the Tier-5 allowlist above;
         (c) explicit `> **DERIVED (operational)**` marker at point of use
             stating WHY no industry standard applies and what the
             project calibration is anchored to.
       The body must carry the actual cite or marker. §10 documents
       which option was used and why; §10 alone is INSUFFICIENT — §10
       documents, the body cites. An "Open Questions" sub-section listing
       UNRESOLVED gaps = rejection. Generic disclaimers ("models are
       simplifications") = rejection.
  R6.  Do NOT cover material assigned to other subsections (see
       OUT-OF-SCOPE). If you find yourself writing out-of-scope content,
       stop and replace with one sentence pointing to the owning section.
  R7.  ATTRIBUTION DISTINCTION (public-repo rule). Every claim must carry
       a visual attribution marker, in one of these exact forms:

           > **Dalio** — source: <title>, <chapter / page or URL>:
           > "<verbatim quote>"

           > **NON-DALIO (industry standard)** — source: <full citation +
           > public URL>. Used to close a gap because Dalio does not
           > specify <what>: "<verbatim quote or precise paraphrase>"

           > **DERIVED (operational)** — <why this calibration; what
           > Dalio anchor it derives from; what the project chose>.

       Mixing the three without the markers, or presenting non-Dalio
       claims as Dalio's, = rejection.
  R8.  PUBLIC URL only. No paywalls. NBER / SSRN / Levy / FRB-xx free
       working-paper version of any Tier-5 paper. Citing a paywalled URL
       without a free mirror = rejection.
  R9.  Commercial-book quote limit. For each commercial book Dalio cites
       (Kennedy, Koo, Eichengreen, Ferguson, Allison, Huntington,
       Goodhart-Pradhan, Friedman-Schwartz, Reinhart-Rogoff hardcover),
       quote no more than 1 sentence at a time and no more than 2
       sentences cumulative across the entire output. Paraphrase the rest
       in your own words.
  R10. Point-of-use attribution for derived thresholds. Any operational
       threshold, bucket edge, band width, heuristic ratio, or derived
       matrix that is NOT directly stated in a Dalio / Bridgewater source
       must carry a `> **NON-DALIO (industry standard)**` or
       `> **DERIVED (operational)**` marker WITHIN 3 LINES of the
       threshold itself, in the body. §10 acknowledgment alone =
       rejection. Examples that count as DERIVED: "Dalio gives a range,
       I picked the midpoint"; "Dalio anchors the centre, I stipulated
       bucket edges"; "Dalio names a typical case, I extended to a
       formula".
  R11. URL PRE-FLIGHT (BLOCKING). Before including ANY URL in the output,
       you MUST WebFetch (or equivalent) that URL and confirm:
         (a) it returns 200 status (or 302 → 200 redirect chain);
         (b) the page content substantively matches what you cite it for.
       Paywall / login wall / 404 / wrong-document redirect = do NOT
       cite. If the canonical source is dead, find a Wayback Machine
       snapshot and cite the Wayback URL with the snapshot date, or drop
       the claim entirely. Citing a URL not fetched in this session =
       rejection.
  R12. QUOTE FIDELITY (BLOCKING). Every `> **Dalio**` verbatim quote MUST
       be copy-pasted from the page text returned by your retrieval —
       NEVER from memory. Do not trim or rephrase; use "[…]" for
       elisions. For multi-paper compilation PDFs (e.g. Dalio's
       "Economic Principles" compilation), the page number MUST be the
       PRINTED page visible in the footer of the document, NOT the
       PDF-viewer page counter. If you cannot verify the printed page,
       cite by section heading instead. Paraphrase disguised as verbatim
       inside a `> **Dalio**` block = rejection.
  R13. DATA-SERIES IDENTIFIER VERIFICATION. For every dataset identifier
       cited (FRED series ID, BIS dataset key, World Bank indicator code,
       BLS series ID, OECD code, etc.): WebFetch the official series
       description page and confirm the ID and the description you use
       refer to the same series. Wrong-series mis-labels = rejection. In
       §4 the description column must paraphrase the official series
       description, not a generic label.
  R14. WORKED-EXAMPLE ARITHMETIC SELF-CHECK. Before finalizing §7,
       re-execute every formula row by row and confirm:
         (a) every stated total equals the sum of its components to the
             precision printed (no rounding slop unless explicitly noted);
         (b) no rank / ratio / share column contains a duplicate the
             formula disallows;
         (c) any chart data in §8c agrees numerically with the §7 table
             that generated it.
       Chart data diverging from its own §7 source = rejection.
  R15. §10 STRUCTURE. §10 must contain EXACTLY two sub-sections, in this
       order:
         ### Limitations / design choices
         ### Sources
       "Limitations / design choices" documents methodological choices,
       data-proxy decisions, range disclosures, and DERIVED markers
       placed in the body. Each entry must reference the body location
       (§N or line context) where the closure cite or marker lives. An
       "Open questions" / "Open questions and ambiguities" / "Ambiguities"
       sub-section is FORBIDDEN. Sources sub-section lists every URL
       cited in the body, full citation, public-access compliance.
  R16. §11 COMPLETENESS SELF-AUDIT (NEW; BLOCKING). §11 must contain a
       Markdown table with the following exact columns, one row per
       potential gap encountered during research:

       | Gap | Dalio sources searched | Keywords / phrases tried |
       Hits found in Dalio corpus | Closure outcome | Body location |

       - "Gap" describes the specific question or threshold that was
         ambiguous at first reading.
       - "Dalio sources searched" lists every Tier-1 through Tier-3 source
         actually queried for this gap (BDC, HEMW, HCGB-1, CWO,
         Engineering, etc.).
       - "Keywords / phrases tried" lists the actual search terms.
       - "Hits found in Dalio corpus" gives a brief description (e.g.
         "BDC L427 verbatim 50% give-or-take 20%"; "no hits") and a line
         reference where applicable.
       - "Closure outcome" is one of: "Dalio anchor (cite at §N)" /
         "NON-DALIO at §N citing <Tier-5 source>" / "DERIVED at §N (no
         industry standard applies because <reason>)".
       - "Body location" gives the §N reference where the cite or marker
         lives.

       At least one row is REQUIRED for every numeric threshold, every
       bucket edge, every decision rule, every formula in §§5-7. A §11
       with fewer rows than thresholds = rejection.

       In addition, §11 must end with a one-paragraph "Closure
       certification" stating: "All ambiguities listed above are closed
       in the body per R5. The output contains zero open questions." If
       this certification is absent or qualified, = rejection.

REQUIRED OUTPUT SCHEMA (exact section titles, exact order; 11 sections)
  ## § 1  Executive Summary                  (≤ 100 words)
  ## § 2  Dalio's Framework — Verbatim       (3-6 direct Dalio quotes
                                              with full citations; for
                                              paginated sources cite
                                              <title>, p. N; for web
                                              sources cite <title>,
                                              <full URL>; do not invent
                                              page numbers)
  ## § 3  Decision Problem                   (what question this answers
                                              for the PM)
  ## § 4  Input Variables Table              (Markdown table; columns,
                                              in this exact order: name |
                                              description | unit | data
                                              source | API endpoint /
                                              dataset ID | update
                                              frequency | typical range)
  ## § 5  Computation / Transformations      (formulas in LaTeX or
                                              precise prose; every
                                              numeric anchor cited at
                                              point of use per R2 / R10)
  ## § 6  Output Variables & Decision Rules  (thresholds → regime tag /
                                              action; every threshold
                                              cited per R7 / R10)
  ## § 7  Worked Numeric Example             (illustrative or real data
                                              pull, clearly labelled;
                                              step-by-step; arithmetic
                                              self-check per R14)
  ## § 8  Implementation Specs
              ### 8a. JS — function signature, fetch URLs, pseudo-code
              ### 8b. Excel — sheet layout, Power Query M or URL, key
                              formulas
              ### 8c. ECharts config — chart type, encoding, palette
                              tokens. Use ONLY this exact 12-token dark-
                              theme palette (any hex not in this list
                              = rejection):
                                #0B0B0B  bg-canvas
                                #141414  bg-surface
                                #1C1C1C  bg-elevated
                                #080808  bg-inset
                                #262626  hairline
                                #F5F5F5  text-primary
                                #A3A3A3  text-secondary
                                #6B7280  text-tertiary
                                #00D08C  green-core
                                #7FFFD4  green-glow
                                #E5484D  signal-red
                                #D4A373  warm-accent
  ## § 9  Integration Points                 (upstream dependencies —
                                              what this section consumes
                                              from other subsections;
                                              downstream consumers —
                                              which subsections consume
                                              this section's outputs)
  ## § 10 Limitations & Sources
              ### Limitations / design choices  (per R15: closed-gap log,
                                                 each entry references
                                                 the body location of
                                                 its closure cite or
                                                 marker; NOT an open-
                                                 questions list)
              ### Sources                       (every URL cited in the
                                                 body, with full citation
                                                 and public-access
                                                 compliance per R8 /
                                                 R11)
  ## § 11 Completeness Self-Audit             (per R16: Markdown table
                                                 with the 6 columns;
                                                 one row per ambiguity
                                                 encountered; Closure
                                                 certification paragraph
                                                 at the end)

TONE
  Crisp, declarative, zero hedging. Write for a portfolio manager who
  reads to act. No "this paper argues" / "it could be argued that" /
  "some have suggested". State, cite, move on.

REJECTION TRIGGERS (any one = report rejected; re-run not retry)
  - Any open question or unresolved ambiguity in the output.
  - Any threshold, formula, or decision rule without a point-of-use cite
    or marker.
  - Any URL not WebFetch'd in this session.
  - Any paraphrase inside a `> **Dalio**` verbatim block.
  - Any non-Dalio source not on the Tier-5 allowlist.
  - Any §11 row missing for a threshold present in §§5-7.
  - Any Closure certification absent or qualified.
  - Any hex outside the 12-token palette in §8c.
  - Any out-of-scope content from §1.4's OUT list above.
```

---

## Verification chain (run after the model returns the file)

After the model writes its response to `research_v2/04_deleveragings.md`, run these checks IN ORDER. Any failure = the deep-research output is rejected; user decides whether to re-run, refine the prompt, or kill the pivot.

1. **Verifier — structural + content gates (S1-S7, R1-R9, R7b, P1, C1-C4).**
   - Run the existing acceptance-criteria checks from `research/_acceptance_criteria.md`.
   - Note: S2 word-cap removed (floor=2000, no upper cap). Update verifier accordingly.
   - Note: S3 expects 11 sections, not 10 (was 10; §11 added).
   - Note: S4 must include `## § 11 Completeness Self-Audit` as the 11th title.

2. **Body-cite verifier — marker-block strict.**
   - Run `python chatgpt_audit_kit/_layer3_bodycite_verify.py` extended for `research_v2/`.
   - Every threshold / decision rule must have a marker block within 3 lines.

3. **Side-by-side diff vs `research/04_deleveragings.md`.**
   - Compare structurally (same 10 numbered sections + §11) and substantively (citation density, threshold count, breadth of Dalio coverage).
   - Surface what is materially better, equivalent, or worse in the new file.

4. **User decision.** Approve → engineer 11 more prompts. Reject → kill pilot, keep existing files. Re-run with refined prompt → revise the prompt md and re-issue.

---

## Verifier-script tweaks required (to be done by the build engine before run)

These are minor mechanical changes to existing scripts in `chatgpt_audit_kit/` and `research/`:

- `research/_acceptance_criteria.md`: change S2 to "Word count is at least 2000; no upper cap." Change S3 to "Exactly 11 top-level `## § N` headers, numbered 1-11." Change S4 regex to include `## § 11 Completeness Self-Audit`. Add a new criterion for §11 (every threshold in §§5-7 has a row).
- `chatgpt_audit_kit/_layer3_bodycite_verify.py`: extend the file path resolver to also scan `research_v2/` when a flag is passed.
- No change to R1-R15 enforcement logic; only the schema-presence checks shift from "10 sections" to "11 sections".

These tweaks are scoped for the pilot (research_v2/04 only). If the pilot succeeds and 11 more prompts ship, the same tweaks apply across the board.
