# Deep Research Prompt — 2.1 Template for Investing

> **Purpose (for the human user, NOT for the prompt itself).**
>
> This file is the engineered prompt for ChatGPT Pro Deep Research producing `research_v2/08_template_for_investing.md`. It is generated from `_deepresearch_prompt_template.md` + per-topic context in `_deepresearch_prompt_registry.py` via the generator script. Edit the template or registry, not this file (changes here are overwritten on regenerate).
>
> **Hard requirement (do not violate).** This is a deep-research instruction document. The prompt block below states what must be researched and how the output must be structured. The prompt MUST NOT contain pre-filled content, sample answers, illustrative quotes from Dalio, or any text the deep-research model could copy as-if its own analysis. The prompt instructs; it does not author.

---

## Pilot context (for the human user, NOT included in the prompt)

- **Topic:** 2.1 Template for Investing.
- **Project:** consolidates Ray Dalio's investment + macro frameworks into 3 operational artifacts (`README.md`, `dalio_dashboard.html`, `dalio_model.xlsx`) for portfolio managers. The 12 research files are the source material the artifacts are built from.
- **Failure modes the prompt must prevent:** depth shortfall, hard-rule violation, framing/scope drift, hallucinated or weakly-sourced citations, surviving open questions in the output, abandoned framework components, paraphrase disguised as verbatim, manufactured words inside Dalio quote blocks.
- **Outcome standard:** COMPLETE + CONCLUSIVE. Every threshold, formula, decision rule, and worked-example number cited at point of use, with zero unresolved gaps in the output. Every named framework component operationalized per R17.
- **Source priority (HARD):** Dalio's own public corpus is presumed gap-free at the framework level. The prompt forces exhaustive Dalio-corpus search BEFORE any non-Dalio source may be introduced. Non-Dalio sources are restricted to a TOP-quality allowlist and may only close real gaps after Dalio exhaustion is documented in §11.
- **Quote audit:** Every `> **Dalio**` block in the output must have a byte-equal entry in the `_quote_audit.md` appendix per R21.

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
  ID:                2.1
  TITLE:             Template for Investing
  IN-SCOPE:          Fundamental + systematic + diversified approach; the Holy Grail of 15-20 uncorrelated return streams; return-stream sourcing methodology; why correlation-killing matters; the geometric reduction of portfolio risk via uncorrelated stream count.
  OUT-OF-SCOPE:      Specific All-Weather allocations — covered by 2.2; alpha-specific construction — covered by 2.3; leverage sizing — covered by 2.4; stress testing — covered by 2.5.

NAMED FRAMEWORK COMPONENTS (TOPIC-BOUND, R17 ENFORCEMENT)
  Dalio's framework for this subsection names the following distinct
  components. Every named component listed below MUST be operationalized
  per R17 (one §5 transform, one §6 emission or output variable, one §7
  worked-example column, and one §11 self-audit row per component).
  Failure to operationalize any named component below = rejection.

  1. **three investing pillars** — items: fundamental; systematic; diversified
     Dalio anchor: Engineering Targeted Returns and Risks, 2011
     Operationalization required: §5 must define each pillar's measurable expression; §6 must emit a regime tag per pillar.
  2. **Holy Grail correlation-killing chart** — items: stream count N; average correlation rho; information ratio IR
     Dalio anchor: Engineering 2011, p. 8 Chart 5
     Operationalization required: §5 must define the IR-vs-N-rho relationship transform; §6 must emit a 'streams sufficient' Boolean; §7 must show worked examples with verbatim Engineering chart values (N=6 ρ=0.25 IR=0.6; N=77 ρ=0.04 IR=1.4).

EXPECTED HISTORICAL CASE SET (TOPIC-BOUND, R23 ENFORCEMENT)
  Dalio writes about the following historical cases for this subsection.
  §7 worked example MUST cover at least 3 of the cases
  in the allowlist below. Cases not in the allowlist may not be substituted
  unless §11 includes a row justifying the substitution with a Dalio cite
  pointing to the substituted case in his corpus.

  Case allowlist:
    - Engineering 2011 Chart 5 P1 (N=6 ρ=0.25)
    - Engineering 2011 Chart 5 P2 (N=77 ρ=0.04)
    - 60/40 traditional benchmark (illustrative)
    - Bridgewater institutional ~1000-stream anecdote

  Minimum cases required in §7: 3

EXPECTED DALIO TIER-1 SOURCE COVERAGE (TOPIC-BOUND, R20 ENFORCEMENT)
  The following Dalio public works are the Tier-1 sources for this
  subsection. R20 requires:
   - Minimum 3 sources from the list below must be
     searched and quoted from in §2 or §5.
   - Each searched source must yield ≥3 verbatim quotes in the output OR
     §11 must include a row with a verbatim Dalio passage from that source
     proving silence on the specific gap claimed.
  Sources NOT on the list below may be used only as Tier 2-5 supplements
  per the SOURCE PRIORITY cascade below.

  Tier-1 source allowlist for this subsection:
    - Engineering Targeted Returns and Risks, 2011
    - Principles 2017 (commercial; R9 fair-use only)
    - LinkedIn long-form essays on Holy Grail / 15 streams
    - Speeches and interviews mentioning Holy Grail

SOURCE PRIORITY (BLOCKING — failure to follow = rejection)

  PRINCIPLE: Dalio's own public corpus is presumed gap-free at the
  framework level. You MUST exhaust the Dalio corpus BEFORE introducing
  any non-Dalio source. Every non-Dalio entry in your output must be
  preceded in §11 (Completeness Self-Audit) by an evidence row proving
  Dalio does not address the specific gap.

  Tier 1 — Ray Dalio primary writings (search EXHAUSTIVELY before moving
    on; see TOPIC-BOUND allowlist above for the subset relevant to this
    subsection):
    - "Big Debt Crises" (BDC), 2018 — full PDF on economicprinciples.org;
      includes Part 1 archetypal template, Part 2 detailed case studies,
      Part 3 compendium of 48 cases.
    - "Principles for Dealing with the Changing World Order" (CWO), 2021 —
      free summary PDF on economicprinciples.org plus the LinkedIn
      installment series.
    - "Principles for Navigating Big Debt Cycles" (HCGB-1), 2024-2025 —
      free chapter releases on economicprinciples.org and LinkedIn.
    - "How the Economic Machine Works — A Template for Understanding What
      is Happening Now" (HEMW), 2012 — paper plus 30-minute video, both
      free.
    - "An In-Depth Look at Deleveragings" (In-Depth Look), 2012 — free PDF
      mirrors.
    - "Paradigm Shifts" (LinkedIn essay), July 2019.
    - LinkedIn long-form posts and articles 2015-present.

  Tier 2 — Bridgewater public research (free on bridgewater.com):
    - "Engineering Targeted Returns and Risks" (Engineering 2011).
    - "The All-Weather Story".
    - "Our Thoughts About Risk Parity and All-Weather" (2015).
    - "Geographic Diversification Can Be a Lifesaver".

  Tier 3 — Speeches / interviews / testimony where a public recording or
    full-text transcript exists.

  Tier 4 — Dalio-cited primary sources (Fisher 1933, Minsky 1992,
    Reinhart-Rogoff NBER versions). Commercial books cited only with
    R9 fair-use limit; publisher page or Wikipedia entry as URL.

  Tier 5 (LAST RESORT) — TOP-quality non-Dalio sources to close residual
    gaps. May only be used after the gap is documented in §11 with
    evidence that Tiers 1-4 do not address it. Allowlist:
      - Central banks and supranationals: BIS, IMF, World Bank, ECB,
        Federal Reserve System (FRBNY, FRBSF, FRED, Board of Governors),
        Bank of England, Bank of Japan, OECD.
      - Academic: NBER working papers, SSRN preprints, Levy Economics
        Institute, Fama-French Data Library, Damodaran (NYU Stern).
      - US government data and research: BLS, BEA, CBO, OMB, US Treasury,
        SEC EDGAR.
      - Major finance institutions (papers only; not blog posts, not
        marketing): Vanguard research, BlackRock Investment Institute,
        AQR research, Goldman Sachs Asset Management public papers.
    Any non-Dalio source outside this list = rejection.

PUBLIC-ACCESS REQUIREMENT
  Every URL you cite MUST resolve to a publicly-readable page (no
  paywall, no login wall, no library-gated PDF). If the canonical source
  is paywalled, link the free working-paper or preprint version (NBER,
  SSRN, Levy, FRBxx, RePEc) and cite that as the URL. Citing a URL you
  have NOT WebFetch'd in this session = rejection.

DELIVERABLE
  One Markdown file. Save the model's response in full to
  research_v2/08_template_for_investing.md. Document title (the H1 at the top of the
  file) MUST be exactly:

      # 2.1 Template for Investing

  Floor 2000 words. No upper cap on length. Length must be whatever the
  COMPLETE + CONCLUSIVE standard requires — no padding, no trimming
  below the closure standard.

  ALSO produce an appendix file at
  research_v2/08_template_for_investing_quote_audit.md per R21.

HARD RULES (every rule binding; one violation = rejection)
  R1.  All 11 required sections below must be present, in order, with the
       exact section titles given. Missing a section = rejection.
  R2.  Every numeric threshold, formula, ratio, band edge, and decision
       boundary must carry a source citation at the point of use (Dalio
       cite, NON-DALIO cite, or DERIVED marker — see R7 / R10). No
       invented numbers. No "approximately" without a sourced anchor.
       For specific numerics (worked-example values, deflator readings,
       case-table figures), see R19.
  R3.  Every input variable in §4 must name a specific public data source
       (institution name + dataset/series identifier + API endpoint or
       URL). Generic phrases ("could be obtained from a data vendor") are
       rejection-grade.
  R4.  Word ratio: the combined word count of §§4-8 (inputs / formulas /
       decision rules / worked example / implementation specs) must be
       at least 5.67 times the combined word count of §§2-3 (verbatim
       Dalio + decision-problem framing). Less than 5.67 = rejection.
  R5.  AMBIGUITY MUST BE CLOSED, NOT JUST ACKNOWLEDGED. If Dalio's
       writing leaves a numeric threshold or rule ambiguous, the gap
       MUST be closed at the point of use by ONE of:
         (a) Dalio-search exhaustion result;
         (b) NON-DALIO industry-standard cite at point of use (Tier-5
             allowlist only);
         (c) explicit `> **DERIVED (operational)**` marker at point of
             use stating WHY no industry standard applies.
       The body must carry the actual cite or marker. §10 documents
       which option was used; §10 alone is INSUFFICIENT. An "Open
       Questions" sub-section listing UNRESOLVED gaps = rejection.
       Generic disclaimers = rejection.
  R6.  Do NOT cover material assigned to other subsections (see
       OUT-OF-SCOPE). If you find yourself writing out-of-scope content,
       stop and replace with one sentence pointing to the owning section.
  R7.  ATTRIBUTION DISTINCTION (public-repo rule). Every claim must
       carry a visual attribution marker, in one of these exact forms:

           > **Dalio** — source: <title>, <chapter / page or URL>:
           > "<verbatim quote>"

           > **NON-DALIO (industry standard)** — source: <full citation +
           > public URL>. Used to close a gap because Dalio does not
           > specify <what>: "<verbatim quote or precise paraphrase>"

           > **DERIVED (operational)** — <why this calibration; what
           > Dalio anchor it derives from; what the project chose>.

       Mixing the three without markers = rejection.
  R8.  PUBLIC URL only. NBER / SSRN / Levy / FRB-xx free working-paper
       version of any Tier-5 paper. Citing a paywalled URL without a
       free mirror = rejection.
  R9.  Commercial-book quote limit. ≤ 1 sentence at a time, ≤ 2 sentences
       cumulative across the entire output, per book.
  R10. Point-of-use attribution for derived thresholds. Any operational
       threshold, bucket edge, band width, heuristic ratio, or derived
       matrix that is NOT directly stated in a Dalio / Bridgewater source
       must carry a `> **NON-DALIO (industry standard)**` or
       `> **DERIVED (operational)**` marker WITHIN 3 LINES of the
       threshold itself, in the body. §10 acknowledgment alone =
       rejection.
  R11. URL PRE-FLIGHT (BLOCKING). Before including ANY URL in the
       output, you MUST WebFetch (or equivalent) that URL and confirm:
         (a) it returns 200 status (or 302 → 200 redirect chain);
         (b) the page content substantively matches what you cite it
             for.
       Citing a URL not fetched in this session = rejection.
  R12. QUOTE FIDELITY (BLOCKING). Every `> **Dalio**` verbatim quote
       MUST be copy-pasted from the page text returned by your retrieval
       — NEVER from memory. Do not trim or rephrase; use "[…]" for
       elisions and show every elision explicitly. Adding words inside
       quote-marks = rejection. Deleting punctuation inside quote-marks
       = rejection. Sentence-period substitution for source punctuation
       inside a quote-marks region = rejection unless the elision is
       marked. For multi-paper compilation PDFs, the page number MUST
       be the PRINTED page visible in the document footer, NOT the
       PDF-viewer page counter. See R21 for the byte-equal audit
       enforcement mechanism.
  R13. DATA-SERIES IDENTIFIER VERIFICATION. For every dataset identifier
       cited (FRED series ID, BIS dataset key, World Bank indicator
       code, BLS series ID, OECD code, etc.): WebFetch the official
       series description page and confirm the ID and the description
       you use refer to the same series. Wrong-series mis-labels =
       rejection. In §4 the description column must paraphrase the
       OFFICIAL series description (institution-published title), not a
       generic label.
  R14. WORKED-EXAMPLE ARITHMETIC SELF-CHECK. Before finalizing §7,
       re-execute every formula row by row and confirm:
         (a) every stated total equals the sum of its components to
             the precision printed;
         (b) no rank / ratio / share column contains a duplicate the
             formula disallows;
         (c) any chart data in §8c agrees numerically with the §7 table.
       Chart data diverging from §7 source = rejection.
  R15. §10 STRUCTURE. §10 must contain EXACTLY two sub-sections, in this
       order:
         ### Limitations / design choices
         ### Sources
       An "Open questions" sub-section is FORBIDDEN. Sources sub-section
       lists every URL cited in the body, full citation, public-access
       compliance.
  R16. §11 COMPLETENESS SELF-AUDIT (BLOCKING). §11 must contain a
       Markdown table with the following exact columns, one row per
       potential gap encountered during research:

       | Gap | Dalio sources searched | Keywords / phrases tried |
       Hits found in Dalio corpus | Closure outcome | Body location |

       Coverage requirement: at least one row for every numeric
       threshold, every bucket edge, every decision rule, every formula,
       every stipulated numeric value, and every named framework
       component in §§5-7. Each row MUST give a body-location anchor
       AT LINE-NUMBER or §-step granularity (e.g., "§5 line 75",
       "§7 case row 2"), not just a §N reference. Each row MUST specify
       (a) source-page anchor for Dalio cite OR (b) explicit DERIVED
       reasoning naming the Dalio anchor it derives from.

       In addition, §11 must end with a one-paragraph "Closure
       certification" stating: "All ambiguities listed above are closed
       in the body per R5. The output contains zero open questions."
       Absent or qualified certification = rejection.
  R17. FRAMEWORK-COMPONENT COVERAGE (BLOCKING). For every distinct
       framework component listed in NAMED FRAMEWORK COMPONENTS above,
       the output MUST contain:
         (a) one transform or operational definition in §5 that
             measures or computes the component;
         (b) one output variable, regime-tag dimension, or emitted
             value in §6 that reflects the component;
         (c) one column or row in the §7 worked-example table that
             reports the component for each case;
         (d) one row in §11 that names the component, the Dalio source
             where it is defined (with page reference), and the body
             location of its operationalization.
       Naming a component in §2 quotes but failing to operationalize it
       per (a)-(d) = rejection.
  R18. DECISION-RULE TRUTH-TABLE CLOSURE (BLOCKING). §6 decision rules
       must be exhaustive over the variable signs they depend on.
       Enumerate every sign-combination explicitly in a Markdown truth
       table. Each combination MUST map to a named regime tag or
       transition rule. Generic catch-all fallbacks (e.g.,
       "UNRESOLVED_WITHIN_SCOPE", "TRANSITIONAL") are FORBIDDEN unless
       §11 includes a row explicitly justifying the catch-all and
       naming the Boolean conditions under which the catch-all fires.
  R19. NUMERIC PROVENANCE (BLOCKING; extends R2). Every numeric value
       used in §5, §6, or §7 MUST carry inline provenance at point of
       use, in one of these exact forms:
         - `(Dalio, <title>, p. N)` for case-table values from Dalio;
         - `(<institution> <series ID>, <as-of date>)` for live data;
         - `(derived from X, Y, Z)` for computed values, with the
             derivation shown.
       Footer-style "Sources: Dalio table" or "from Dalio's case panel"
       does not satisfy R19. Inline provenance must appear within the
       same paragraph or table row as the value. Each value also
       requires a §11 row.
  R20. DALIO CORPUS BREADTH + SILENCE PROOF (BLOCKING). Minimum
       3 sources from the TOPIC-BOUND Tier-1
       allowlist must be searched. Each searched source must yield
       ≥ 3 verbatim quotes in §2 or §5 OR §11 must include a row
       containing a verbatim Dalio passage from that source proving
       silence on the specific gap. Generic "I searched X, found
       nothing" without a verbatim passage proving silence = rejection.
  R21. VERBATIM QUOTE AUDIT APPENDIX (BLOCKING). In addition to the
       main deliverable, produce a separate file
       `research_v2/08_template_for_investing_quote_audit.md` with this exact
       structure:

           # Quote Audit — 2.1 Template for Investing

           For each `> **Dalio**` block in the main deliverable, this
           appendix records the verbatim source text alongside the
           quoted text. A byte-equal comparison verifier will diff
           the two; any non-zero diff without `[sic]` annotation =
           rejection.

           ## Quote 1
           **Body location:** §N line LL
           **Source:** <title>, <printed page or URL>
           **Source URL fetched:** <URL>
           **Quoted text in body:**
           > <verbatim copy of the body's > **Dalio** quote text>

           **Source PDF text (byte-equal):**
           > <byte-equal copy from source>

           **Diff:** NONE | <list of differences with `[sic]` justification>

           ## Quote 2
           ...

       Every Dalio quote in the main deliverable must have an entry
       in this appendix. Missing entry = rejection. Diff > 0 without
       `[sic]` = rejection.
  R22. CROSS-SECTION CONSISTENCY (BLOCKING). Every variable referenced
       in §6, §7, §8a (JS), §8b (Excel), or §8c (chart) MUST be
       defined in §4 (input) or computed in §5 (transform) or output
       in §6. Variables introduced for the first time in §7/§8 with
       no §4/§5 definition = rejection. URLs must be canonical and
       identical across §4 (table data source), §8 (fetch URLs / Power
       Query), and §10 (sources list). Three different URL forms for
       one series ID = rejection. Non-formula chart-bar names that
       are not defined variables = rejection.
  R23. WORKED-EXAMPLE CASE COVERAGE (BLOCKING). §7 must include
       worked rows for at least 3 cases drawn from
       the EXPECTED HISTORICAL CASE SET above. Each case row MUST
       compute every Boolean flag and every output variable from
       numeric inputs visible in the row itself. Asserting a tag from
       narrative ("Dalio calls this an X") rather than deriving it
       from the §6 rule applied to the row's numbers = rejection.
       For cases where data is genuinely absent (e.g., hyperinflation
       making real-growth ill-defined), label the row's missing inputs
       explicitly and add a §11 row noting which §6 conditions cannot
       be evaluated for that case.
  R24. AUTOFORMAT CONTAMINATION REJECTION (BLOCKING). The body of
       every `> **Dalio**` quote block MUST use plain ASCII straight
       quotes (`"`), not curly/smart quotes (`"`/`"`). The body must
       not contain emoji, em-dash variants inside quote blocks (use
       `--` or `...` only inside verbatim blocks), or rendering
       artifacts from chat-style auto-formatting. Smart-quote
       contamination inside a `> **Dalio**` block = rejection.
  R25. BOOK-ATTRIBUTION SANITY CHECK (BLOCKING; extends R12). Every
       Dalio cite MUST match the prompt's Tier-1 source taxonomy by
       exact title. The following are DIFFERENT works and must not
       be conflated:
         - "Big Debt Crises" (BDC), 2018
         - "Principles for Navigating Big Debt Cycles" (HCGB-1),
           2024-2025
         - "An In-Depth Look at Deleveragings", 2012
         - "How the Economic Machine Works — A Template" (HEMW), 2012
         - "Principles for Dealing with the Changing World Order"
           (CWO), 2021
       Citing a quote to "How Countries Go Broke" when the underlying
       text is from HCGB-1 (or vice versa) = rejection. Cross-check
       every cite against the Tier-1 list above before submission.

REQUIRED OUTPUT SCHEMA (exact section titles, exact order; 11 sections)
  ## § 1  Executive Summary                  (≤ 100 words)
  ## § 2  Dalio's Framework — Verbatim       (3-6 direct Dalio quotes)
  ## § 3  Decision Problem
  ## § 4  Input Variables Table              (columns: name | description
                                              | unit | data source | API
                                              endpoint / dataset ID |
                                              update frequency | typical
                                              range)
  ## § 5  Computation / Transformations
  ## § 6  Output Variables & Decision Rules  (must include explicit
                                              truth table per R18)
  ## § 7  Worked Numeric Example             (must cover ≥
                                              3 cases
                                              per R23; arithmetic self-
                                              check per R14)
  ## § 8  Implementation Specs
              ### 8a. JS — function signature, fetch URLs, pseudo-code
              ### 8b. Excel — sheet layout, Power Query M or URL, key
                              formulas
              ### 8c. ECharts config — chart type, encoding, palette
                              tokens. Use ONLY the 12-token dark-theme
                              palette below (any hex outside this list
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
  ## § 9  Integration Points                 (upstream + downstream;
                                              must list every subsection
                                              that consumes or produces
                                              this section's outputs)
  ## § 10 Limitations & Sources
              ### Limitations / design choices  (closed-gap log per R15)
              ### Sources                       (every URL, full
                                                 citation, public-
                                                 access compliance)
  ## § 11 Completeness Self-Audit             (per R16: row-per-item
                                                 table, line-number
                                                 anchors, closure
                                                 certification)

TONE
  Crisp, declarative, zero hedging. Write for a portfolio manager who
  reads to act. State, cite, move on.

REJECTION TRIGGERS (any one = rejected; re-run not retry)
  - Any open question or unresolved ambiguity in the output.
  - Any threshold, formula, or decision rule without a point-of-use
    cite or marker.
  - Any URL not WebFetch'd in this session.
  - Any paraphrase, manufactured word, or deleted punctuation inside a
    `> **Dalio**` verbatim block (R12, R21, R24).
  - Any non-Dalio source not on the Tier-5 allowlist.
  - Any §11 row missing for a threshold, formula, or named component
    present in §§5-7 (R16, R17).
  - Any Closure certification absent or qualified.
  - Any hex outside the 12-token palette in §8c.
  - Any out-of-scope content from the OUT-OF-SCOPE list above.
  - Any named framework component listed in NAMED FRAMEWORK COMPONENTS
    that is not operationalized per R17 (a)-(d).
  - Any §6 truth-table sign-combination not assigned to a regime tag
    (R18).
  - Any numeric value in §5/§6/§7 without inline provenance (R19).
  - Fewer than 3 Tier-1 Dalio sources searched, or
    any searched Tier-1 source with fewer than 3 verbatim quotes AND
    no silence-proof row in §11 (R20).
  - Missing or non-byte-equal `_quote_audit.md` appendix (R21).
  - Variable referenced in §6/§7/§8 without §4/§5 definition (R22).
  - Three different URL forms for the same series ID across §4/§8/§10
    (R22).
  - Fewer than 3 cases in §7 from the case
    allowlist (R23).
  - §7 case where a Boolean flag or output tag is asserted from
    narrative rather than derived from row-visible numbers (R23).
  - Smart quotes / emoji / em-dash variants inside any `> **Dalio**`
    block (R24).
  - Any cite confusing two different Dalio works in the Tier-1
    taxonomy (R25).
```

---

## Verification chain (run after the model returns the file pair)

After the model writes its main deliverable to `research_v2/08_template_for_investing.md` and the quote-audit appendix to `research_v2/08_template_for_investing_quote_audit.md`, run these checks IN ORDER:

1. **Schema + R1-R16 gates.** Existing acceptance-criteria checks plus R16 self-audit row-count.
2. **R17 component-coverage check.** Verify every named component in the registry has §5/§6/§7/§11 presence.
3. **R18 truth-table closure check.** Verify §6 contains an explicit truth-table block with no catch-all.
4. **R19 numeric-provenance check.** Spot-check 5 numerics in §5/§6/§7 for inline provenance.
5. **R20 corpus-breadth check.** Verify §11 + §2 quotes cover ≥ minimum Tier-1 sources from the registry.
6. **R21 quote-audit byte-equal diff.** Run against the appendix; any non-zero diff without `[sic]` = reject.
7. **R22 cross-section consistency.** Check every variable in §6-§8 has a §4 or §5 definition; URL canonicalization across §4/§8/§10.
8. **R23 case-coverage check.** Verify ≥ minimum cases from registry; verify each case derives flags from row data.
9. **R24 autoformat scan.** Grep for smart quotes inside `> **Dalio**` blocks.
10. **R25 book-attribution scan.** Cross-check every cite against the Tier-1 taxonomy strings.
11. **Side-by-side diff.** Compare structurally + substantively against `research/08_template_for_investing.md` (existing version).
12. **User decision.** Approve / reject / refine prompt + re-run.

---

## Slot reference (for the generator)

The generator script `_deepresearch_prompt_generator.py` substitutes the following slots:

| Slot | Source | Format |
|---|---|---|
| `2.1` | registry entry `id` | string, e.g. `1.4` |
| `Template for Investing` | registry entry `title` | string |
| `08` | registry entry `seq` | string, e.g. `04` |
| `template_for_investing` | registry entry `slug` | string |
| `Fundamental + systematic + diversified approach; the Holy Grail of 15-20 uncorrelated return streams; return-stream sourcing methodology; why correlation-killing matters; the geometric reduction of portfolio risk via uncorrelated stream count.` | registry entry `scope_in` | prose paragraph |
| `Specific All-Weather allocations — covered by 2.2; alpha-specific construction — covered by 2.3; leverage sizing — covered by 2.4; stress testing — covered by 2.5.` | registry entry `scope_out` | prose paragraph |
| `  1. **three investing pillars** — items: fundamental; systematic; diversified
     Dalio anchor: Engineering Targeted Returns and Risks, 2011
     Operationalization required: §5 must define each pillar's measurable expression; §6 must emit a regime tag per pillar.
  2. **Holy Grail correlation-killing chart** — items: stream count N; average correlation rho; information ratio IR
     Dalio anchor: Engineering 2011, p. 8 Chart 5
     Operationalization required: §5 must define the IR-vs-N-rho relationship transform; §6 must emit a 'streams sufficient' Boolean; §7 must show worked examples with verbatim Engineering chart values (N=6 ρ=0.25 IR=0.6; N=77 ρ=0.04 IR=1.4).` | registry entry `named_components` | bulleted list (one bullet per component, each with name + Dalio source page) |
| `    - Engineering 2011 Chart 5 P1 (N=6 ρ=0.25)
    - Engineering 2011 Chart 5 P2 (N=77 ρ=0.04)
    - 60/40 traditional benchmark (illustrative)
    - Bridgewater institutional ~1000-stream anecdote` | registry entry `expected_cases.allowlist` | bulleted list (one bullet per case) |
| `3` | registry entry `expected_cases.min` | integer literal |
| `    - Engineering Targeted Returns and Risks, 2011
    - Principles 2017 (commercial; R9 fair-use only)
    - LinkedIn long-form essays on Holy Grail / 15 streams
    - Speeches and interviews mentioning Holy Grail` | registry entry `tier1_sources.allowlist` | bulleted list (one bullet per source) |
| `3` | registry entry `tier1_sources.min` | integer literal |
