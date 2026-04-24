# Red-Team Audit — 2.3 Alpha Generation & Portable Alpha

**Date:** 2026-04-23
**Auditor:** Claude red-team agent (fresh context, not the author)
**Target:** `research/10_alpha_portable_alpha.md`
**References consulted:** `_prompt_template.md` · `_acceptance_criteria.md` · Engineering Targeted Returns and Risks PDF (fetched and parsed via PyMuPDF) · The All Weather Story PDF (fetched and parsed via PyMuPDF) · McLean & Pontiff HEC mirror PDF (fetched and parsed) · Ken French Data Library page (WebFetch) · Corporate Finance Institute FLAM page (WebFetch) · FRED series pages (returned 403, noted below)

---

## Findings

| ID | Severity | § / line | Finding | Evidence | Proposed fix |
|----|----------|----------|---------|----------|--------------|
| F1 | CRITICAL | § 2, line 18 | Quote 4 carries wrong page number. Target cites "printed p. 7" for the Optimal Alpha Portfolio construction passage ("There are two ways an Optimal Alpha Portfolio can be created…"). The Engineering Targeted Returns PDF (Aug 2011) places this text entirely on **printed p. 8**, not p. 7. Printed page numbers in that PDF match PDF-viewer page numbers (each page carries a footer "8 © 2011 Bridgewater Associates, LP"). | PyMuPDF extraction: PDF viewer page 8 begins "The Optimal Alpha Portfolio / The basic principles… There are two ways an Optimal Alpha Portfolio can be created. The first, and currently the most popular, is via alpha overlay…" Page 7 contains only Chart 3, Chart 4, and All Weather performance text — none of the Optimal Alpha Portfolio prose. | Change citation to `printed p. 8`. The same error propagates to inline citations in § 5 (line 77) and § 6 (line 103) — both cite `Engineering …, p. 7` for the same passage and must be corrected to p. 8. |
| F2 | CRITICAL | § 2, lines 21–22 | Quote 5 carries wrong page number. Target cites "p. 8, para under Chart 5" for the verbatim sentence "We have found that, by following this general approach, information ratios can increase by factors of two to four times." The sentence does NOT appear on printed p. 8. It appears at the top of **printed p. 9**. Printed p. 8 ends at the Chart 5 legend label "Chart 5: Structuring an Optimal Alpha Portfolio." | PyMuPDF extraction of p. 8: last text is "Chart 5: Structuring an Optimal Alpha Portfolio". PyMuPDF extraction of p. 9: first substantive paragraph reads "In other words, the increased diversification from additional sources of lower-correlated alphas … We have found that, by following this general approach, information ratios can increase by factors of two to four times." | Change citation to `Engineering Targeted Returns and Risks, p. 9`. |
| F3 | CRITICAL | § 2, lines 24–25 | All Weather Story quote attributed to "p. 3 (2012)" but formula is on printed **p. 4**. Target cites "The All Weather Story, p. 3 (2012)" for the formula "return = cash + beta + alpha." PyMuPDF extraction of the All Weather Story PDF confirms p. 3 contains the Discovery Process narrative (no formula); the formula appears on p. 4: "In summary: return = cash + beta + alpha." Page numbers in that PDF have printed footers ("4 © 2012 Bridgewater Associates, LP"), confirming p. 4. | PyMuPDF p. 3 text: "providing attractive, relatively stable returns. The strategy was and is passive… A Discovery Process…" — no formula. PyMuPDF p. 4 text: "(alpha). The mutual fund blurs the distinction… In summary: return = cash + beta + alpha". | Change citation to `"The All Weather Story", p. 4`. |
| F4 | CRITICAL | § 5, line 77 and § 6, line 103 | Two inline body citations attribute the Bridgewater client-overlay passage to "Engineering …, p. 7." The relevant text ("each client chooses its beta and benchmark, which we replicate and then overlay with our own Optimal Alpha Portfolio. The client specifies a targeted tracking error (risk) for the alpha") sits on printed p. 8, not p. 7. This is the same root error as F1 but appears independently in body prose outside § 2, so it is recorded as a separate finding because it affects body citations, not just the § 2 verbatim block. | PyMuPDF p. 8 confirms the passage is there, not on p. 7. See F1 evidence. | Change both inline citations from `p. 7` to `p. 8`. |
| F5 | MAJOR | § 6, line 86 | The threshold `IR_slice < 0.15 → Retire the strategy` has no DERIVED or NON-DALIO marker within 3 lines. Per R10 and R7b, every derived threshold must carry a point-of-use attribution marker within 3 lines (preceding or following). The blockquote block that follows (line 89) carries a DERIVED marker but its text explicitly covers only the N_eff < 6 edge. The IR_slice ≥ 0.30 eligibility threshold is covered by a separate DERIVED marker at line 93. The 0.15 retirement cutoff has no corresponding marker at all — it is a stipulated number with no Dalio or identified non-Dalio source. | Lines 83–95 read: table rows at lines 83–87, then DERIVED markers at 89 (N_eff<6), 91 (rho>0.20), 93 (IR>=0.30), 95 (McLean decay). None of the three DERIVED markers claim the 0.15 figure. § 10 does not acknowledge it either. | Add a `> **DERIVED (operational)**` marker immediately after the table row at line 86, e.g.: "> **DERIVED (operational)** — IR_slice < 0.15 as the retirement floor is stipulated; Dalio's Chart 5 uses IR_slice = 0.35 as the illustration but sets no explicit minimum. This edge is not in Dalio's text." |
| F6 | MAJOR | § 8b, lines 190–193 | The Power Query M `Table.Group` call passes an expression `{Date.ToText([DATE],"yyyy-MM")}` as the key parameter. The Power Query M specification requires the `key` parameter to be a **list of column name strings** (`list`), not a list of computed expressions. `Date.ToText([DATE],"yyyy-MM")` is a row-level expression that resolves at record-evaluation time; it is not a column name string. Passing it in the key position will cause a runtime `Expression.Error` ("We cannot convert the value … to type Text" or equivalent). The standard correct pattern is: (1) add an intermediate column `Table.AddColumn(Clean, "YearMonth", each Date.ToText([DATE],"yyyy-MM"))`, then (2) group on `{"YearMonth"}`. | Power Query M spec (Microsoft Docs): `Table.Group(table as table, key as any, ...)` — when key is a list, elements must be column name strings. Passing an evaluated expression literal in this position is not valid M syntax and will produce a runtime error. The prior named steps (`Source`, `Promoted`, `Typed`, `Clean`) are all correctly defined before use; this error is confined to the `Monthly` step. | Replace the `Monthly` step with two steps: `WithYM = Table.AddColumn(Clean, "YearMonth", each Date.ToText([DATE], "yyyy-MM"))` and `Monthly = Table.Group(WithYM, {"YearMonth"}, {{"RF_monthly_pct", each List.Average([DGS3MO])/12, type number}})`. Also update `in Monthly` to keep the same final return. |
| F7 | MAJOR | § 4, lines 38–41 | Four input-variable rows (σ_Alpha, IC, N, ρ_avg) cite `n/a — internal; no public API` as their API endpoint. R3 in the prompt template is unambiguous: "Every input variable must name a specific public data source (API endpoint or dataset ID). No 'could be found somewhere.'" The DERIVED marker at line 43 is an R10 point-of-use attribution for thresholds, not an R3 exemption for input variables. Alpha inputs are genuinely proprietary, but the prompt does not carve out an exemption for proprietary inputs — it requires a public data source or explicit acknowledgment of the gap in § 10 as an open question. The limitation is mentioned in § 10 bullet 5 but only as a "public-data gap" note, not framed as the R3 failure mode it is. | Prompt template R3: "Every input variable must name a specific public data source (API endpoint or dataset ID). No 'could be found somewhere.'" Acceptance-criteria R3 grep checks for API endpoint names in every § 4 row. These four rows will return no match on `FRED|World Bank|BLS|BEA|ECB|IMF|SEC|Stooq|BIS|Alpha Vantage|FMP|Tiingo`. | Either (a) acknowledge in the § 4 row itself that these inputs have no public analogue and that the framework cannot be mechanically instantiated from public data alone, and cross-reference the § 10 open-question bullet, or (b) point to a public hedge-fund index dataset (e.g. HFRI free indices, Barclay hedge) that can serve as a proxy with an appropriate NON-DALIO marker. |

---

## URLs audited

| URL | Resolved? | Quote match? | Notes |
|-----|-----------|--------------|-------|
| https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf | YES — PDF returned (232.8 KB, PDF 1.5, Adobe Illustrator 24.1) | PARTIAL — see F1, F2, F4 for page-number misattributions; quote text itself is verbatim-correct. PDF content verified via PyMuPDF. | Quotes 1–3 (pp. 2–3) are correct. Quote 4 misattributed (p. 7 stated → p. 8 actual). Quote 5 misattributed (p. 8 stated → p. 9 actual). Chart 5 data (N=6/77, ρ=0.25/0.04, IR=0.6/1.4) confirmed on p. 8. |
| https://www.bridgewater.com/_document/the-all-weather-story?id=00000171-8623-d7de-affd-feaf4ee20000 | YES — PDF returned (113.5 KB) | FAIL — formula cited as p. 3, actually on p. 4. See F3. | The formula text "return = cash + beta + alpha" is verbatim-correct; only the page number is wrong. |
| https://www.hec.ca/finance/Fichier/McLean.pdf | YES — PDF returned (310.4 KB, 41 pages) | YES — abstract confirms "The average post-publication decay … is about 35%"; target's elision using "[…]" is R12-compliant. | Paper is McLean & Pontiff (Oct 2012 working-paper version). Authors, date, and 35% figure verified. |
| https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/fundamental-law-of-active-management/ | YES — page accessible, no paywall | PASS — page describes Grinold/Kahn FLAM; formula IR = IC · √Breadth confirmed. Note: CFI page does not itself cite Grinold 1989 JPM by bibliographic detail, but target's use of CFI is as a free-access summary of the formula, which is permissible. | Grinold's original 1989 JPM paper is paywalled; target correctly flags this limitation in § 10. |
| https://www.ahwilliamsco.com/includes/OurThoughtsaboutRiskParityandAllWeather.pdf | YES — PDF returned (1.3 MB) | Not verifiable via PyMuPDF text-extraction attempt (PDF binary structure opaque to fitz in this session); URL resolves. | Used in § 9 footnote only; not quoted in body. URL resolves. |
| https://fred.stlouisfed.org/series/DGS3MO | 403 (bot-rate-limit) | Not verifiable via WebFetch | FRED is a well-known public resource. 403 is a bot-protection response, not a paywall. Series DGS3MO and its official title are documented in the Federal Reserve H.15 release and widely verified. Flag as MINOR, not MAJOR. |
| https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS3MO | 403 (bot-rate-limit) | Not verifiable | Same note as above; this is the key-free CSV endpoint used in § 8a JS. |
| https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO | 403 (requires api_key param) | N/A | Cited in § 4 as the API endpoint. FRED API requires a free api_key parameter; without it, returns 403. This is technically a registration-gated endpoint, but FRED API keys are free and widely available — flagging as MINOR. Consider replacing with the keyless CSV endpoint already used in § 8a. |
| https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/Data_Library/f-f_factors.html | YES — page accessible | PASS — Mkt-RF described as value-weight return of all CRSP firms minus one-month T-bill; matches target description. | Factor descriptions verified. |
| https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip | YES — ZIP returned (12.7 KB) | N/A (binary) | URL resolves; ZIP file returned. |

---

## Patches Applied (2026-04-23, main session)

Per `project_audit_cadence.md`, revised reports are accepted without second audit in the live wave. All 7 findings were mechanical fixes and were applied directly to `research/10_alpha_portable_alpha.md` by the main session:

| Finding | Fix applied |
|---------|-------------|
| F1 — § 2 line 18: "printed p. 7" | Changed to "printed p. 8" |
| F2 — § 2 lines 21–22: "p. 8, para under Chart 5" | Changed to "p. 9, para under Chart 5" |
| F3 — § 2 lines 24–25: "p. 3 (2012)" | Changed to "p. 4 (2012)" |
| F4 — §§ 5/6: two `Engineering …, p. 7` inline citations | Changed both to `p. 8` |
| F5 — § 6 line 86: IR_slice < 0.15 no DERIVED marker | Added `> **DERIVED (operational)**` marker immediately after the table row |
| F6 — § 8b: invalid Power Query M Table.Group key | Added `WithYM` intermediate column step; updated Table.Group to use `{"YearMonth"}` |
| F7 — § 4: four rows with `n/a — internal; no public API` | Data-source column now reads "internally estimated from X; no public API (§ 10 Q5)"; API endpoint column reads "n/a — manager-proprietary" |

Word count after patches: 2996 (within 2000–3000 bounds).

---

## Verdict

~~**REJECT-re-spawn**~~ → **PASS-with-patches** (patches applied 2026-04-23)

Original criteria: 4 CRITICAL findings (F1–F4), 3 MAJOR findings (F5–F7).

Post-patch status: all 7 findings resolved. Zero CRITICAL, zero MAJOR outstanding. No second audit required per `project_audit_cadence.md` (re-audits deferred to final consolidation sweep).

---

## Summary

The target report was structurally sound, arithmetically honest, and attribution-marker coverage was nearly complete. It carried a cluster of page-number errors (CRITICAL under R12): Quote 4 misattributed to p. 7 (actual p. 8); Quote 5 to p. 8 (actual p. 9); All Weather Story formula to p. 3 (actual p. 4); same p. 7 error in two inline body citations. All traced to an off-by-one in page counting. Three MAJOR findings also addressed: DERIVED marker added for the IR_slice < 0.15 retirement threshold; Power Query M Table.Group key syntax corrected (intermediate column added); proprietary-input rows in § 4 now explicitly acknowledge the public-API gap with a § 10 cross-reference.

All patches are mechanical. Underlying research, verbatim quote text, arithmetic (Chart 5 recomputation), palette compliance, and scope boundaries remain clean. Deferred re-audit sweep at final consolidation should confirm PASS.
