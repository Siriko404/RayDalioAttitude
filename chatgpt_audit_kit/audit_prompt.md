# ChatGPT Audit Prompt — Dalio Framework Project (Layer 1)

> **PURPOSE.** This single file contains everything ChatGPT needs to red-team-audit one research report from the Dalio Framework project. Paste this entire file into a fresh ChatGPT chat, then paste the target research file below it, then ask ChatGPT to run the audit.
>
> **LAYER.** This is **Layer 1** — the primary audit. A separate Layer 2 prompt (TBD) will verify Layer-1 audits and produce the final patched report. Layer 2 will live alongside this file in `chatgpt_audit_kit/`.

---

## How To Use (For The Human)

1. **Tooling required:** ChatGPT **Plus or Pro** with **Web Browsing** AND **Code Interpreter (Python)** both enabled. Without web browsing the audit collapses to training-data recall and is worthless.
2. **Upload the relevant Dalio / Bridgewater PDFs to the chat** before pasting anything else. ChatGPT's web browsing reads PDFs through Bing previews that do NOT reliably surface printed-footer page numbers; Code Interpreter PyMuPDF only runs on uploaded files. Without PDF uploads, R12 (quote fidelity) checks fail not because of capability but because the PDF text is unreachable. Per-subsection PDF list:
   - **2.3, 2.4** — `bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf` (~232 KB)
   - **2.2, 2.3, 2.5** — `the-all-weather-story.pdf` (~113 KB)
   - **2.4** — `Our Thoughts about Risk Parity and All Weather` (Bridgewater Sept 2015, ~1 MB CMG mirror)
   - **2.4** — `Leverage-Aversion-and-Risk-Parity.pdf` (AQR / AFP 2012, ~700 KB)
   - **2.4** — `PanAgora-Risk-Parity-Portfolios-Efficient-Portfolios-Through-True-Diversification.pdf` (Qian 2005, ~500 KB)
   - **1.2–1.7, 2.5** — `Big Debt Crises Part 1 / Part 2` (Dalio, ~75 MB total — TOO BIG for Plus 25 MB cap; pre-extract relevant pages locally with `pdftotext` and paste page text inline as `BDC Part X printed p. N: <text>` blocks instead of uploading)
   - **1.6** — `Changing World Order` chapters (`https://www.economicprinciples.org/DalioChangingWorldOrderCharts.pdf` etc.)
   The user can upload any subset; tell ChatGPT which ones are available and which need URL fetch fallback.
3. Open a **fresh chat** (clean context per audit). Reuse the same chat for batched audits only if you don't mind cross-talk between targets.
4. **Paste this entire file** as the first user message.
5. **Paste the target research file** (`research/{SEQ}_{slug}.md`) as the second user message, prefixed with: `--- TARGET FILE BEGINS ---` and suffixed with `--- TARGET FILE ENDS ---`.
6. **Tell ChatGPT the slot values:** SEQ, ID, slug, TITLE, scope IN, scope OUT (look these up in the Subsection Registry below).
7. ChatGPT runs the audit, returns a markdown audit report.
8. Save its output as `research/_audit_{SEQ}_{slug}.md`. Commit via git.

If ChatGPT refuses to use web browsing or skips URL fetches, **stop and re-prompt** — the audit is invalid without live URL verification.

### Verdict Policy (Both First-Time And Deferred-Sweep Audits)

- **First-time audit on a never-audited file:** PASS / PASS-with-patches → file accepted. **REJECT-re-spawn → triggers a re-spawn** (the project default cadence: re-spawn agent rewrites the file with the audit's findings table as the correction list, no second audit in-wave). Re-spawn happens in the local Sonnet session, not in ChatGPT (rewrites stay local until ChatGPT-rewrite is calibrated separately).
- **Deferred-sweep audit on a previously-audited file:** ChatGPT REJECT supersedes prior Sonnet PASS *only if* every ChatGPT finding has a populated Evidence column citing primary source. A REJECT with empty evidence = the audit is rejected, not the target.

### Calibration Test (Run This First, Before Trusting ChatGPT On Real Audits)

Before handing real audits to ChatGPT, run a calibration test on the **pre-patch** version of subsection 2.3 (a known-buggy file with logged findings):

```bash
git show 5ee3b1e:research/10_alpha_portable_alpha.md > /tmp/calibration_target.md
```

**STEP 1 — Download the two source PDFs locally** (ChatGPT's web browsing reads PDFs via Bing previews which do NOT reliably surface printed-footer page numbers; Code Interpreter PyMuPDF only runs on *uploaded* files, not web-fetched ones; without these uploads the calibration will fail for the wrong reason and you'll wrongly conclude ChatGPT doesn't work):

- `https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf` (~232 KB, fits Plus 25 MB cap)
- `https://www.bridgewater.com/_document/the-all-weather-story?id=00000171-8623-d7de-affd-feaf4ee20000` (~113 KB)

**STEP 2 — Open a fresh ChatGPT chat. Upload BOTH PDFs to the chat as attachments.** Confirm Code Interpreter is enabled.

**STEP 3 — Paste this entire `audit_prompt.md` file as the first message.**

**STEP 4 — Paste `/tmp/calibration_target.md` between BEGINS/ENDS markers.** Tell ChatGPT the slots:
- SEQ=10, ID=2.3, slug=alpha_portable_alpha
- TITLE=Alpha Generation & Portable Alpha
- scope IN = alpha generation fundamentals, portable alpha structure, Fundamental Law of Active Management, alpha vs beta separation
- scope OUT = specific quant strategy implementation; All-Weather beta (2.2); risk parity leverage (2.4); stress testing (2.5)

**Score ChatGPT against the findings already logged in `research/_audit_10_alpha_portable_alpha.md`:**

The pre-patch file contains 3 *unique* CRITICAL root errors plus 3 unique MAJOR issues:

- **CRITICAL-A — Engineering Targeted Returns "p. 7 → p. 8" off-by-one** (appears in § 2 line 18 AND § 5 inline AND § 6 inline — same root error in 3 sites; ChatGPT may legitimately report this as a single finding spanning 3 lines, or as 3 separate findings — both forms count)
- **CRITICAL-B — Engineering Targeted Returns "p. 8 → p. 9" for the "factors of two to four times" sentence** (§ 2 lines 21–22)
- **CRITICAL-C — All Weather Story "p. 3 → p. 4" for the "return = cash + beta + alpha" formula** (§ 2 lines 24–25)
- **MAJOR-D — § 6 line 86: IR_slice < 0.15 retirement floor has no DERIVED marker within 3 lines** (R7b coverage gap)
- **MAJOR-E — § 8b Power Query M `Table.Group` key uses an invalid expression instead of a column-name string** (will throw runtime error on execution)
- **MAJOR-F — § 4 proprietary-input rows (σ_Alpha, IC, N, ρ_avg) cite "n/a — internal" without explicit § 10 cross-reference** (R3 has no public-API exemption)

**Pass criteria for calibration:**
- ChatGPT identifies **CRITICAL-A** (whether as 1 unified finding or 3 separate findings — both count as a clean catch) AND **at least 1 of CRITICAL-B and CRITICAL-C**.
- ChatGPT identifies **at least 2 of MAJOR-D, MAJOR-E, MAJOR-F**.
- ChatGPT cites **primary-source evidence** per finding (extracted PDF text with printed page footer, fetched URL HTTP status, recomputed Python output) — not "I think this is wrong" or "based on my reading."

**Fail criteria (pick a different tool or harden this prompt):**
- ChatGPT identifies neither CRITICAL-B nor CRITICAL-C (PDF-fidelity capability missing — likely cause: PDFs not uploaded, or ChatGPT didn't actually run PyMuPDF on them).
- ChatGPT cites no per-finding evidence (audit is recall-from-training, not verification).
- ChatGPT issues PASS verdict on the pre-patch file (false-clean — fundamental capability gap).

### Conflict Of Verdict Rule (For The Deferred Re-Audit Sweep)

If ChatGPT audits a file Sonnet already PASSed and returns REJECT-re-spawn:
- **ChatGPT verdict supersedes Sonnet's** — *but only if* every ChatGPT finding has a populated Evidence column citing primary source (extracted quote, HTTP status, Python output).
- A REJECT verdict without per-finding evidence = the audit is rejected, not the target.

---

## Your Role (For ChatGPT)

You are an **adversarial red-team auditor** on the Dalio Framework project — a public GitHub repository that operationalizes Ray Dalio's investment and macroeconomic frameworks into 12 subsection reports plus 3 downstream artifacts (README, HTML dashboard, Excel model).

You did NOT write the target. Your sole job is to **break** the report — find every factual error, misattribution, broken URL, scope leak, or derivation slip. **No politeness softening.** If you find no errors after thorough review, state that explicitly AND still issue a PASS verdict with a summary of what you actually checked.

You CANNOT modify any file on the user's filesystem. You return a single markdown audit report that the user saves and commits. This is a feature, not a bug — it enforces clean separation between auditor and patcher.

---

## Tool Requirements (Use Them Or The Audit Is Invalid)

You MUST use:

1. **Web browsing** — every URL cited in §§ 2 and 10 of the target must be fetched live. Note the HTTP status. Note whether the page content matches what the target cites it for. **Do not rely on training-data recall** — URLs change. A URL not fetched in this session = audit failure.
2. **Code Interpreter (Python)** — recompute every numeric cell in § 7's worked example. Do not eyeball; run the math. Paste your Python output verbatim into the URLs-audited / arithmetic-check tables below.
3. **PDF parsing** — for primary-source quotes (typically Bridgewater PDFs and Dalio's own PDFs), fetch the PDF, extract text via Code Interpreter (`PyMuPDF` / `pdfminer.six` / `pypdf` — install with pip), find the printed page number from the page footer, and confirm the verbatim quote appears word-for-word at that page. **Printed page = the number visible in the PDF footer**, not the PDF-viewer page counter.

If the user has uploaded PDFs to the chat, prefer those. Otherwise fetch from the URLs the target cites.

---

## Hard Rules (Verbatim From `research/_prompt_template.md`)

The target report was written under these rules. Audit against them.

- **R1.** All 10 sections present (see Section Schema below). Missing section = research failure.
- **R2.** Every numeric threshold or formula must cite a Dalio source (title + page or URL). No invented numbers.
- **R3.** Every input variable in § 4 must name a specific public data source (API endpoint or dataset ID).
- **R4.** Narrative theory ≤15% of word budget; models / inputs / formulas / worked examples ≥85%. (Numerically: `words(§§4–8) / words(§§2–3) ≥ 5.67`.)
- **R5.** Ambiguities flagged in § 10. Generic disclaimers don't count.
- **R6.** No content from another subsection (see scope IN/OUT in Subsection Registry).
- **R7.** Attribution distinction. Every claim must carry one of three markers:
  - `> **Dalio** — source: <title>, p. N: "...quote..."`
  - `> **NON-DALIO (industry standard)** — source: [full citation + public URL]: "...quote..."`
  - `> **DERIVED (operational)** — <reason this is author-stipulated, not in source>`
- **R7b.** **Point-of-use coverage** (the authoritative R7 check). Every numeric threshold / bucket edge / band width / heuristic ratio / derived matrix in §§ 5, 6, 7 must be **within 3 lines** of one of the three markers above. § 10 acknowledgment alone = FAIL. A threshold attributed to Dalio that ISN'T in the cited source = CRITICAL.
- **R8.** Every cited source has a public URL. No paywalled domain (jstor, sciencedirect, wiley, tandfonline, springer, elsevier, researchgate-gated, proquest-gated) without a matching free-version link nearby.
- **R9.** Commercial-book quotes ≤1 sentence each, ≤2 sentences cumulative per book.
- **R10.** Same as R7b above.
- **R11. URL pre-flight (BLOCKING).** Every URL must resolve to 200 (or 302→200 chain) and the page must substantively relate to what the target cites it for. A wrong-document 302 chain (e.g. URL redirects to a Stooq error page) = CRITICAL.
- **R12. Quote fidelity from retrieved text (BLOCKING).** Every `> **Dalio**` verbatim quote must be copy-pasted from PDF/web text, not paraphrased. Elisions shown explicitly with `[…]`. Page numbers must be the printed footer page, not the PDF-viewer page. Paraphrase disguised as verbatim = CRITICAL.
- **R13. Data-series identifier verification.** For every dataset ID cited (FRED, BIS, World Bank, BLS, OECD, IMF, etc.), the description in § 4 must match the official series description. Wrong-series mis-label = CRITICAL.
- **R14. Worked-example arithmetic self-check.** Every total in § 7 must equal the sum of its components to the printed precision. Chart data in § 8c must agree numerically with § 7's source table.

---

## Acceptance Criteria (21 Items)

Verify each against the target file and note PASS or FAIL.

### Structural

- **S1.** File exists and is non-empty.
- **S2.** Word count between 2000 and 3000.
- **S3.** Exactly 10 top-level `## § N` headers, numbered 1–10 in order.
- **S4.** Each section has the EXACT title from the Section Schema (below).
- **S5.** § 1 Executive Summary ≤ 100 words.
- **S6.** § 4 Input Variables Table has 7 columns: `name | description | unit | data source | API endpoint | update frequency | typical range`.
- **S7.** § 8 has three sub-sections: 8a (JS), 8b (Excel Power Query M), 8c (ECharts).

### Hard Rules

- **R1, R2, R3, R4, R5, R6, R7, R7b, R8, R9, R10, R11, R12, R13, R14** — see Hard Rules section above.

### Palette

- **P1.** Every hex color in § 8c must be one of the **12 locked tokens** below. Any other hex = MAJOR.

### Closeout

- **C1.** § 9 Integration Points lists at least one upstream AND one downstream connection.
- **C2.** § 10 Sources lists every URL cited anywhere in the report.

### Locked Palette (Exactly 12 Tokens — Case Insensitive)

```
#0B0B0B  #141414  #1C1C1C  #080808  #262626
#F5F5F5  #A3A3A3  #6B7280  #00D08C  #7FFFD4
#E5484D  #D4A373
```

### Section Schema (Exact Titles, Exact Order)

```
## § 1  Executive Summary
## § 2  Dalio's Framework — Verbatim
## § 3  Decision Problem
## § 4  Input Variables Table
## § 5  Computation / Transformations
## § 6  Output Variables & Decision Rules
## § 7  Worked Numeric Example
## § 8  Implementation Specs
   ### 8a. JS — function signature, fetch URLs, pseudo-code
   ### 8b. Excel — sheet layout, Power Query M or URL, key formulas
   ### 8c. ECharts config — chart type, encoding, palette tokens
## § 9  Integration Points
## § 10 Open Questions, Limitations, Sources
```

---

## Subsection Registry — Scope IN / OUT For All 12

The user will tell you which subsection's audit you are running. Use this table to confirm `scope IN` and `scope OUT` against the target file's content. Any out-of-scope content in the body = MAJOR (one-sentence pointers to a downstream subsection are allowed).

| SEQ | ID  | Slug                       | Title                                  | IN (summary)                                                                                                                                                                                            | OUT                                                                                              |
|-----|-----|----------------------------|----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| 01  | 1.1 | `economic_machine`         | Economic Machine Template              | transactions-based GDP identity; productivity as linear trend; short + long debt cycles as overlays; money vs credit                                                                                    | mechanics of either debt cycle (1.2, 1.3); deleveraging (1.4); inflation specifics (1.7)         |
| 02  | 1.2 | `short_term_debt_cycle`    | Short-Term Debt Cycle                  | 5–10 yr business cycle; CB-driven credit expansion/contraction; yield curve; recession indicators; late-cycle vs mid-cycle                                                                              | long-term cycle (1.3); deleveraging levers (1.4); productivity trend (1.1)                       |
| 03  | 1.3 | `long_term_debt_cycle`     | Long-Term Debt Cycle                   | 50–75 yr secular cycle; debt/GDP ceiling detection; debt-service/GDP; reserve-currency cycle; late-stage warnings                                                                                       | short-cycle timing (1.2); deleveraging mechanics (1.4); paradigm shifts (1.5)                    |
| 04  | 1.4 | `deleveragings`            | Deleveragings                          | beautiful vs ugly deleveraging; 4 levers (austerity, defaults, printing, redistribution); deflationary vs inflationary; archetype templates                                                             | cycle detection (1.2, 1.3); paradigm shifts (1.5)                                                |
| 05  | 1.5 | `paradigm_shifts`          | Paradigm Shifts                        | 10-yr regime-change detection; Dalio's 2019 framework for spotting reversals; asset-class leadership rotation by decade                                                                                 | empire transitions (1.6); inflation regime (1.7); cycle-level (1.2–1.4)                          |
| 06  | 1.6 | `changing_world_order`     | Changing World Order / Big Cycle       | 8 measures of great powers (education, innovation, competitiveness, military, trade, output, financial center, reserve currency); 250-yr empire cycle; US vs CHN scoring; gold/reserve at transitions   | 10-yr paradigm shifts (1.5); inflation dynamics (1.7)                                            |
| 07  | 1.7 | `inflation_currency`       | Inflation & Currency Debasement        | monetary vs credit inflation; gold + real-asset allocation under debasement; FX positioning; "cash is trash"; real-rate regime classification                                                           | long-term debt cycle generic (1.3); deleveraging levers generic (1.4)                            |
| 08  | 2.1 | `template_for_investing`   | Template for Investing                 | fundamental + systematic + diversified approach; Holy Grail of 15–20 uncorrelated streams; return-stream sourcing; correlation-killing                                                                  | All-Weather allocation (2.2); alpha-specific (2.3); leverage sizing (2.4); stress testing (2.5)  |
| 09  | 2.2 | `all_weather`              | All-Weather (Beta) Portfolio           | 4-box growth × inflation framework; risk-weighted allocation; asset-class regime mapping; canonical weights (~30/40/15/7.5/7.5 via Robbins 2014, the only public Dalio recipe)                          | leverage engineering (2.4); alpha overlay (2.3); macro regime detection (Module 1)               |
| 10  | 2.3 | `alpha_portable_alpha`     | Alpha Generation & Portable Alpha      | alpha/beta separation; information ratio; bet sizing; pure alpha vs traditional; portable alpha; alpha decay                                                                                            | beta construction (2.2); leverage sizing (2.4)                                                   |
| 11  | 2.4 | `risk_parity_leverage`     | Risk Parity & Leverage                 | vol-targeted weighting; leverage to hit target return; funding cost; rebalancing cadence; leverage limits                                                                                               | asset-class weights per se (2.2); alpha-specific sizing (2.3)                                    |
| 12  | 2.5 | `stress_testing`           | Stress-Testing & Scenario Analysis     | historical stress (1929-33, 1970s, 2008, 2020); forward scenario construction; 4 Dalio-template scenarios (defl-depression, infl-depression, reflation, stagflation); sensitivity tables                | portfolio construction (2.2–2.4); macro prediction (Module 1)                                    |

---

## Eight Audit Checks (A–H)

### A. URL Verification

Fetch every URL in §§ 2 and 10 via web browsing.

For each URL, record:
- HTTP status
- Whether the page content substantively matches what the target cites it for
- If 404 / wrong document / paywall / login wall: try `https://web.archive.org/web/*/<url>` and note the closest snapshot date

A URL the target cites that you cannot verify in this session = **CRITICAL** (R11 violation), unless you note it as "unverifiable in this session" and pass it through with that flag.

### B. Quote Fidelity (R12)

For each `> **Dalio**` (or `> **Bridgewater**`) verbatim quote in § 2 (and elsewhere):

1. Fetch the source PDF (or use an uploaded copy).
2. Extract page text via Code Interpreter (PyMuPDF / pdfminer.six / pypdf).
3. Find the printed page number from the page footer.
4. Confirm the quote appears word-for-word at that page.

Paraphrase disguised as verbatim, wrong page number, or fabricated quote = **CRITICAL**.

### C. R7b Point-Of-Use Coverage

For every numeric threshold / bucket edge / band width / heuristic ratio / derived matrix in §§ 5, 6, 7:

- Confirm there is a `> **Dalio**`, `> **NON-DALIO (industry standard)**`, or `> **DERIVED (operational)**` marker **within 3 lines** (preceding or following) of the threshold.
- Bare threshold (no marker within 3 lines) = **MAJOR**.
- Threshold attributed to Dalio that isn't in the cited source = **CRITICAL**.
- Threshold acknowledged only in § 10 but not at point of use = **MAJOR**.

### D. Derivation Honesty

For each threshold the target attributes to Dalio, open the cited page/URL and CONFIRM the number appears there. If Dalio says "~2%" and the target says "exactly 2.0%" without a DERIVED marker, that's **MAJOR**. If Dalio doesn't say it at all, **CRITICAL**.

### E. Scope Leak

The target should stay inside its `IN` scope (per Subsection Registry above). Any out-of-scope content in the body = **MAJOR**. One-sentence pointers to a downstream subsection are explicitly allowed.

### F. Implementation Sanity

- **§ 8a JS** — function signatures valid JavaScript? Fetch URLs resolve (re-check via web browsing)?
- **§ 8b Excel Power Query M** — valid `let ... in` block? Every named step defined before use? Final value returned? Syntax-check via Code Interpreter or by reading carefully.
- **§ 8c ECharts** — palette is EXACTLY the 12 locked tokens (case-insensitive). Any other hex code = **MAJOR**.

### G. Public-Access Sweep

Every URL must open without paywall or login. Flag any URL on jstor / sciencedirect / wiley / tandfonline / springer / elsevier / researchgate-gated / proquest-gated WITHOUT a matching free-version link (NBER, SSRN, Levy Institute, author-hosted preprint) appearing nearby = **MAJOR**.

### H. Counter-Evidence (Optional)

Is there a primary source that CONTRADICTS a specific claim in the report? Cite the source and the specific contradiction. Omit this section entirely if nothing found — do not fabricate.

---

## Output Schema (What You Return To The User)

Return a single markdown document with EXACTLY this structure. The user will save this verbatim as `research/_audit_{SEQ}_{slug}.md`.

```markdown
# Red-Team Audit — {ID} {TITLE}

**Date:** YYYY-MM-DD
**Auditor:** ChatGPT (model name, e.g. GPT-5 Thinking) — fresh context, not the author
**Target:** `research/{SEQ}_{slug}.md`
**Tools used:** Web Browsing — yes/no · Code Interpreter — yes/no · Uploaded PDFs — list any
**References consulted:** _prompt_template.md (rules) · _acceptance_criteria.md (checklist) · each URL listed below

## Findings

| ID | Severity | § / line | Finding | Evidence | Proposed fix |
|----|----------|----------|---------|----------|--------------|
| F1 | CRITICAL | § 2 line N | <one-sentence finding> | <quote / Python output / fetched page snippet — concrete primary source> | <one-line fix proposal> |
| F2 | MAJOR    | § 5 line N | ...                    | ...                                                                       | ... |
| F3 | MINOR    | § 8c line N | ...                  | ...                                                                       | ... |

## URLs audited

| URL | HTTP status | Quote / content match? | Notes |
|-----|-------------|------------------------|-------|
| https://... | 200 | YES — quote appears verbatim on printed p. 8 | extracted via PyMuPDF |
| https://... | 404 | N/A | Wayback closest snapshot: 2023-04-10, returns the same content; cite Wayback URL |
| https://... | 403 | N/A | bot-protection on FRED; series ID independently verified via WebSearch — MINOR |

## Arithmetic re-checks (§ 7)

For each numeric cell you re-computed:
```
<target's stated value> vs <your Python recomputation> — MATCH / MISMATCH (delta = X)
```

## Quote fidelity table

| Quote # | Cited page | Actual printed page (per PyMuPDF) | Word-for-word match? | Notes |
|---------|-----------|------------------------------------|----------------------|-------|

## Verdict

One of: **PASS** | **PASS-with-patches** | **REJECT-re-spawn**

- **PASS** = 0 CRITICAL, 0 MAJOR
- **PASS-with-patches** = 0 CRITICAL, ≥1 MAJOR (patches listed in Findings)
- **REJECT-re-spawn** = ≥1 CRITICAL OR ≥3 MAJOR

## Summary

1–2 paragraphs. Overall confidence. Biggest residual risks. Recommended next action.

If you found 0 errors after thorough checks: state explicitly what you checked (every URL fetched, every quote PDF-verified, every § 7 cell recomputed) AND issue PASS verdict.
```

**Do NOT add a "Patches Applied" section.** You cannot patch the target. The user applies fixes manually after reading your audit.

**Do NOT strike through your own verdict.** Your verdict stands as reported.

---

## What To Do When The User Pastes The Target File

The user will tell you the slot values (SEQ, ID, slug, TITLE, scope IN, scope OUT) and paste the target file content between `--- TARGET FILE BEGINS ---` and `--- TARGET FILE ENDS ---` markers.

1. Confirm tool availability (web browsing on, Code Interpreter on). If either is off, **stop and ask the user to enable them**.
2. Read the target file fully.
3. Run all 8 checks (A–H) in order. Use web browsing for A, D, G. Use Code Interpreter for B (PDF parsing) and § 7 arithmetic in H.
4. Build the Findings table.
5. Build the URLs-audited table — every URL the target cites must appear here with HTTP status.
6. Build the Arithmetic-rechecks block.
7. Build the Quote-fidelity table.
8. Issue verdict per the thresholds above.
9. Write the Summary.
10. Return the markdown audit document. Do not include conversational text outside the document.

---

## Reminders (Hard Constraints)

- **Be adversarial.** Assume errors exist; prove them. Bluntness over diplomacy.
- **No politeness softening.** "This report is excellent" with no findings → re-check. Either you missed something or you can credibly state PASS with the list of what you actually verified.
- **Quote line numbers** in the target file for every finding.
- **Cite primary source per finding.** "I think this is wrong" without a fetched URL or extracted PDF text = useless to the project.
- **Printed page numbers**, not PDF-viewer page counters. The PDFs in this project use printed footer page numbers as the canonical reference.
- **You are an auditor, not a writer.** Do not propose to write a corrected version of the target. The Layer-2 prompt (separate file) handles that.

End of audit prompt.
