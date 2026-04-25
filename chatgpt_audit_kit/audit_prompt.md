# ChatGPT Audit Prompt — Dalio Framework Project (Layer 1)

> **PURPOSE.** This single file contains everything ChatGPT needs to red-team-audit one research report from the Dalio Framework project. Paste this entire file into a fresh ChatGPT chat, then paste the target research file below it, then ask ChatGPT to run the audit.
>
> **LAYER.** This is **Layer 1** — the primary audit. A separate Layer 2 prompt (TBD) will verify Layer-1 audits and produce the final patched report. Layer 2 will live alongside this file in `chatgpt_audit_kit/`.

---

## How To Use (For The Human) — 2-File Upload, Done

**Steps:**
1. Open ChatGPT (Plus or Pro — Web Browsing + Code Interpreter / Python both ON).
2. Start a fresh chat.
3. Upload **2 files** as attachments:
   - This file (`audit_prompt.md`)
   - The target research file (`research/{SEQ}_{slug}.md`) — any of the 12.
4. Send this single message:
   > **Run the audit per `audit_prompt.md` against the attached research file. Use Python + requests + PyMuPDF (fitz) to fetch and parse the PDFs cited in the target's § 2 and § 10 — do not skip primary-source verification. Return the audit markdown only, no conversational text.**
5. Wait 2–5 minutes.
6. Save ChatGPT's output as `research/_audit_{SEQ}_{slug}.md` (use the SEQ + slug ChatGPT identified in its audit header).
7. Commit via git.

That is the entire workflow. ChatGPT reads the target file's H1 (`# {ID} {TITLE}`), looks up the corresponding row in the **Subsection Registry** below, and fills its own SEQ / slug / scope IN / scope OUT slots. ChatGPT fetches PDFs from the URLs cited in the target file using Code Interpreter Python (`requests.get(url)` → `fitz.open(stream=…)`) — no manual PDF upload needed.

**If ChatGPT skips URL fetches or refuses Code Interpreter / web access**, stop and re-prompt: "*Use Python and web browsing. Do not rely on training data for URL status, PDF page numbers, or arithmetic.*" The audit is invalid without live verification.

### Verdict Policy (Both First-Time And Deferred-Sweep Audits)

- **First-time audit on a never-audited file:** PASS / PASS-with-patches → file accepted. **REJECT-re-spawn → triggers a re-spawn** (project default cadence: a re-spawn agent rewrites the file with the audit's findings table as the correction list; no second audit in-wave). Re-spawn happens in the local Sonnet session, not in ChatGPT (rewrites stay local until a ChatGPT-rewrite Layer-2 prompt is calibrated separately).
- **Deferred-sweep audit on a previously-audited file:** ChatGPT REJECT supersedes prior Sonnet PASS *only if* every ChatGPT finding has a populated Evidence column citing primary source. A REJECT with empty evidence = the audit is rejected, not the target.

### What ChatGPT Does Automatically (No User Input Needed)

When ChatGPT receives the 2-file upload + the run-audit message:

1. Reads the target file's H1 line. Format: `# {ID} {TITLE}` (e.g. `# 2.3 Alpha Generation & Portable Alpha`).
2. Looks up that ID in the **Subsection Registry** table below to get SEQ, slug, scope IN, scope OUT.
3. Identifies all URLs cited in target §§ 2 and 10. Fetches each via web browsing OR `requests.get()` in Python.
4. Identifies all PDF citations. For each, downloads the PDF via Python and runs `fitz` (PyMuPDF — install with `pip install pymupdf` if not present) to extract text. Verifies each verbatim quote against the printed footer page number.
5. Identifies all numeric formulas and worked-example cells in §§ 5–7. Recomputes via Python. Compares to target's stated values.
6. Runs all 8 audit checks (A–H below).
7. Writes the audit markdown per the Output Schema. Saves the SEQ + slug at the top so the user knows what filename to use.

If a PDF download fails (timeout, oversized, redirect, captcha), ChatGPT falls back to:
- Web search for the specific quote text to confirm it exists somewhere on the source's domain.
- Marks the finding as `evidence: web-search-confirmed only — PDF unfetchable in session` instead of `evidence: PyMuPDF p.N`.

For the Big Debt Crises PDF (~75 MB), ChatGPT may need to download in chunks or skip; if it cannot extract, it should mark BDC-page citations as `unverified — primary PDF too large for session sandbox` rather than fabricate verification.

### Calibration Test (Run This First, Before Trusting ChatGPT On Real Audits)

Run a calibration test on the **pre-patch** version of subsection 2.3 (a known-buggy file with logged findings) before trusting ChatGPT on real audits.

**STEP 1 — Generate the calibration target file:**

```bash
git show 5ee3b1e:research/10_alpha_portable_alpha.md > calibration_target.md
```

**STEP 2 — Open ChatGPT (Plus or Pro, Web Browsing + Code Interpreter both ON). Start a fresh chat.**

**STEP 3 — Upload 2 files** as attachments to the chat:
- This `audit_prompt.md`
- `calibration_target.md` from Step 1

**STEP 4 — Send this single message:**

> *Run the audit per `audit_prompt.md` against the attached `calibration_target.md`. Use Python + requests + PyMuPDF (fitz) to fetch and parse Bridgewater PDFs cited in the target's § 2 and § 10. Return the audit markdown only.*

ChatGPT will identify the target as 2.3 from the H1 (`# 2.3 Alpha Generation & Portable Alpha`), look up scope from the Subsection Registry below, fetch the Engineering Targeted Returns PDF (~232 KB) and All Weather Story PDF (~113 KB) via Python, run PyMuPDF, and audit.

**STEP 5 — Score ChatGPT's output against the findings already logged in `research/_audit_10_alpha_portable_alpha.md`:**

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

## What To Do When The User Uploads The 2 Files

The user uploads `audit_prompt.md` (this file) and a target research file (`research/{SEQ}_{slug}.md`), then sends a "run the audit" message.

1. **Confirm tool availability.** Web Browsing on AND Code Interpreter / Python on. If either is off, **stop and ask the user to enable them**.
2. **Read the target file fully.** Identify its H1 line — format is `# {ID} {TITLE}` (e.g. `# 2.3 Alpha Generation & Portable Alpha`). Match the ID against the Subsection Registry table below to resolve SEQ, slug, scope IN, scope OUT. Record these slot values at the top of your audit output.
3. **Fetch primary sources via Python** (Code Interpreter):
   ```python
   import requests, fitz, io
   r = requests.get(url, timeout=60)
   r.raise_for_status()
   doc = fitz.open(stream=r.content, filetype="pdf")
   for page in doc:
       text = page.get_text()  # printed-page text; footer page number is usually in this text
   ```
   Do this for every PDF cited in §§ 2 and 10 of the target. Note printed-footer page numbers from each page's text (the `N` near "© 2011 Bridgewater Associates, LP" or similar footer line).
4. **Run all 8 checks (A–H)** in order. Use web browsing for HTML URLs (A, G). Use Python for PDFs (B), data-series description verification (D), and § 7 arithmetic recomputation (H).
5. **Build the Findings table.** One row per finding. Severity ∈ {CRITICAL, MAJOR, MINOR}. Evidence column MUST cite primary source (extracted PDF text snippet, fetched URL HTTP status, Python output) — not "I think this is wrong."
6. **Build the URLs-audited table** — every URL the target cites must appear here with HTTP status from your live fetch. Empty status = audit invalid.
7. **Build the Arithmetic-rechecks block.** Paste verbatim Python output for each cell you recomputed.
8. **Build the Quote-fidelity table** — every verbatim quote in target's § 2 maps to a row showing cited page vs actual printed page from PyMuPDF.
9. **Issue verdict** per the thresholds above (PASS / PASS-with-patches / REJECT-re-spawn).
10. **Write the Summary.** Overall confidence; biggest residual risks; recommended next action.
11. **Return the markdown audit document.** Do not include conversational text outside the document. The user will save your output verbatim as `research/_audit_{SEQ}_{slug}.md` using the SEQ + slug you identified in step 2.

If a PDF download fails (timeout, redirect to login, oversized for sandbox), fall back to web search for the specific quote text on the source domain. Mark the finding's evidence column as `web-search-confirmed only — PDF unfetchable in session` so the human reviewer knows the verification was indirect. Do NOT silently skip.

---

## Reminders (Hard Constraints)

- **Be adversarial.** Assume errors exist; prove them. Bluntness over diplomacy.
- **No politeness softening.** "This report is excellent" with no findings → re-check. Either you missed something or you can credibly state PASS with the list of what you actually verified.
- **Quote line numbers** in the target file for every finding.
- **Cite primary source per finding.** "I think this is wrong" without a fetched URL or extracted PDF text = useless to the project.
- **Printed page numbers**, not PDF-viewer page counters. The PDFs in this project use printed footer page numbers as the canonical reference.
- **You are an auditor, not a writer.** Do not propose to write a corrected version of the target. The Layer-2 prompt (separate file) handles that.

End of audit prompt.
