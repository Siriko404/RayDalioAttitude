# Layer 2 Review — ChatGPT Audit Verification

> **Process:** I (main session, claude-opus-4.7) act as Layer 2 verifier. For each ChatGPT audit in this directory, every finding is verified against primary sources before a patch is applied to the research file. Anti-capitulation discipline: nothing accepted without firm primary evidence.
>
> **Cadence:** strict per-file sequential. After each file: commit + advisor call.

---

## Verdict legend

- **VALID-patched** — primary source confirms the audit finding; patch applied to research file in cited commit.
- **VALID-flagged** — finding is true but fix is structural enough that it needs user direction (re-spawn vs alternative).
- **DISMISS-{reason}** — finding is a false positive (audit pedantic, audit reading prompt over-literally, or audit-prompt itself has a typo).
- **INVALID-{evidence}** — primary source contradicts the audit's claim.

---

## File 01 — 1.1 Economic Machine Template (`_audit_01_economic_machine.md`)

**Audit verdict:** REJECT-re-spawn (3 CRITICAL, 4 MAJOR, 1 MINOR).
**Layer 2 commit:** `b4a179f` (2026-04-24).
**Final structural state after patches:** S2=2967w (≤3000 ✓), S5=87w (≤100 ✓), R4=8.02 (≥5.67 ✓), S6 columns ✓, P1 palette ✓.

| Finding | Severity | Verdict | Evidence | Patch summary |
|---|---|---|---|---|
| F1 — TCMDO unit `USD bn` should be `USD mn` | CRITICAL | **VALID-patched** | WebSearch confirmed FRED Q4 2025 = 107,632,484 mn = $107.6T (millions). M2SL Dec 2025 = 22,411 bn (billions). Raw `tcmdo/m2` returns 4807 instead of 4.8 — off by 1000×. | §4 unit relabeled `USD mn` + range rewrite; §5.5 formula adds `/1000`; §8a JS converts; §8b Excel formula converts; new caveat block. |
| F2 — BIS dataset `tc` is stale | CRITICAL | **VALID-patched** | WebSearch returned multiple `data.bis.org/topics/TOTAL_CREDIT/BIS,WS_TC,2.0/...` URLs. Self-contradictory inside file (§10 already noted ID changed). | §4 prose + §10 source updated to `BIS,WS_TC,2.0` with concrete US example URL. |
| F3 — 3 quote-fidelity violations | CRITICAL | **VALID-patched** | Read PDF (orcamgroup mirror) pages 5+7. Verbatim source: line 19 omits "Most importantly," + parentheticals; line 21 unmarked ellipsis between "$3 trillion" and "the amount of promises"; line 97 omits "The main point is that". | All three patched with `[...]` bracketed elisions per R12. |
| F4 — Hamilton 2018 doesn't prescribe ±1σ band | MAJOR | **VALID-patched** | WebSearch confirmed Hamilton 2018 abstract = HP-filter critique + regression-based detrending alternative. No σ-band classification rule. Author marker overstated. | Marker reclassified DERIVED (operational); Hamilton cited honestly as method-support only. |
| F5 — `.../series_id=X` shorthand fails strict R3 | MAJOR | **VALID-patched (could have DISMISSED)** | Original was understandable abbreviation referencing the full URL in row 1. Audit reading prompt strictly. Patched anyway for cleanliness; advisor noted this could have been DISMISS. | Replaced with `series_id=X` parameter form; full template made explicit in prose. |
| F6 — JS undefined helpers + `.last()` non-standard | MAJOR | **VALID-patched** | Read code in §8a directly. `toNumericSeries`, `olsLogTrend`, `diff` not defined; `Array.prototype.last()` is not standard JS. | Helpers documented in comment block; `.last()` replaced with standard array indexing. |
| F7 — word count > 3000 cap | MAJOR | **VALID-patched** | After F1-F6 patches added ~460 words, file reached 3550. | Trimmed §1 (102→87), §3, §5, §6, §9, §10, §8a comments. Final 2967. |
| F8 — §10 duplicate `4.` numbering | MINOR | **VALID-patched** | Confirmed by reading §10 (item 4 appeared twice). | Renumbered 1-7 cleanly. |

---

## File 02 — 1.2 Short-Term Debt Cycle (`_audit_02_short_term_debt_cycle.md`)

**Audit verdict:** REJECT-re-spawn (2 CRITICAL, 5 MAJOR, 1 MINOR).
**Layer 2 commit:** `e2f3acd` (2026-04-24).
**Final structural state after patches:** S2=2998w (≤3000 ✓), S5 §1=71w (≤100 ✓), R4=6.350 (≥5.67 ✓), S3 ✓, S6 columns ✓, S7 sub-sections ✓, R7 markers=21 ✓, P1 palette ✓.

| Finding | Severity | Verdict | Evidence | Patch summary |
|---|---|---|---|---|
| F1 — recession subphase quote attributed to p. 18 but is on p. 19 | CRITICAL | **VALID-patched** | PDF p. 18 (orcamgroup mirror) ends with "The recession phase of the cycle follows and occurs in two parts." p. 19 contains "early part of the recession" + "late part of the recession" content. | Line 95 marker rewritten as `pp. 18–19` with split attribution: 4 expansion + tightening phases on p. 18; recession transition sentence on p. 18; both recession subphases on p. 19. |
| F2 — §7 worked-example values do not match current FRED | CRITICAL | **VALID-patched** | FRED is blocked from this env (WebFetch 403, PowerShell timeout, curl exit 56) so live values not independently re-pulled. Audit's browser-fetched values (Q4 2025 RGDP=0.5, UNRATE Mar 2026=4.3, TCU Mar 2026=75.7, FEDFUNDS Mar 2026=3.64, T10Y3M 2026-04-21=0.61) all diverge from § 7 stated values; framing "Real data, as-of 2026-04-21" is not auditable. | § 7 reframed as schema option (a) "illustrative" — stylized inputs chosen to exercise every Step 1–7 branch. Series IDs retained for reproducibility; live re-run via § 8a/§ 8b. |
| F3 — `RGDP_yoy` mislabel (A191RL1Q225SBEA is QoQ SAAR, not YoY) | MAJOR | **VALID-patched** | WebSearch confirmed FRED A191RL1Q225SBEA units = "Percent Change from Preceding Period, Seasonally Adjusted Annual Rate" (quarterly). The variable name `_yoy` is misleading. | Renamed `RGDP_yoy` → `RGDP_qoq_saar` everywhere (table, formula, JS, Excel column, chart series); `g_yoy` → `g_qoq` (JS); chart axis label "RGDP YoY (%)" → "RGDP QoQ SAAR (%)". |
| F4 — late-cycle "Dalio-exact" overclaim | MAJOR | **VALID-patched** | PDF p. 18 verbatim: "around 3.5-4%" and "about 2 ½ years" (approximate anchors, not exact). | Late-cycle marker split: Dalio quote retained verbatim; second marker added as `> **DERIVED (operational)** — Dalio gives approximate anchors; the strict Boolean gates 3.5 ≤ g ≤ 4.0 and MST ≥ 30 are an operational conversion`. CAPUTL DERIVED block merged in. |
| F5 — R4 ratio 5.102 < 5.67 | MAJOR | **VALID-patched** | After F1+F4 patches expanded §§4–8 (additional DERIVED block) and §10 trims reduced narrative outside §§2–3, recomputed R4 = 6.350 (canonical `wc -w` per `_acceptance_criteria.md` formula). | R4 cleared structurally as side effect of F1+F4+F2 patches; no specific R4-targeted patch needed. |
| F6 — §8b title "Power Query M" vs schema "Power Query M or URL" | MAJOR | **VALID-patched** | `_prompt_template.md` line 186 confirms canonical title `### 8b. Excel — sheet layout, Power Query M or URL, key formulas`. | Line 194 updated to schema-exact title. |
| F7 — missing reproducibility lock for §7 | MAJOR | **VALID-patched (implicit via F2)** | With §7 relabeled to schema option (a), reproducibility lock is no longer required by the schema (option (a) explicitly waives the data-snapshot requirement; option (b) requires it). | No standalone fix; F2 patch resolves. |
| F8 — §3 grammar missing "that" | MINOR | **VALID-patched** | Line 25 confirmed: "primitives downstream consumes" — missing relative pronoun. | Replaced with "primitives that downstream modules consume". |

---

## File 03 — 1.3 Long-Term Debt Cycle (`_audit_03_long_term_debt_cycle.md`)

**Audit verdict:** REJECT-re-spawn (3 CRITICAL, 6 MAJOR, 1 MINOR).
**Layer 2 commits:** `f14dec0` (initial 9-patch round) + advisor-follow-up commit (F9 §10 + F5 chart-legend) at 2026-04-24.
**Final structural state:** S2=3000w (≤3000 ✓), S5 §1=74w (≤100 ✓), R4=6.02 (≥5.67 ✓), R7=30 markers (≥21 ✓), P1 palette 12 unique hex ✓, S6 7-col table ✓, S4 sub-sections ✓.

| Finding | Severity | Verdict | Evidence | Patch summary |
|---|---|---|---|---|
| F1 — FRED URLs missing api_key/file_type (R11 fail) | CRITICAL | **VALID-patched** | Audit live-fetched 8 FRED endpoints, all returned HTTP 400 due to missing parameters. R3/R11 require working URLs (with `${API_KEY}` placeholder). | §4 footer rewritten — all FRED cells show `series_id` only; full executable template per R3 documented inline (`?series_id=X&api_key={FRED_API_KEY}&file_type=json`). |
| F2 — BIS `WS_TC,1.0` stale + `WS_DSR,1.0` API unstable | CRITICAL | **VALID-patched** | Audit live-fetched both → HTTP 500. Cluster fact (verified 2026-04-24): public BIS portal uses `BIS,WS_TC,2.0`. DSR API also returns 500; portal CSV/XLSX export works. | §4 TC URL bumped 1.0 → 2.0; DSR row switched to portal URL form `https://data.bis.org/topics/DSR/data` with note that SDMX API is unstable. §10 source line updated. |
| F3 — `g_nom`/`Pi_dfl` mislabeled as growth rates (FRED returns level/index) | CRITICAL | **VALID-patched** | WebSearch confirmed FRED `GDP` units = "Billions of Dollars, SAAR" (level), `GDPDEF` units = "Index 2017=100" (index). Neither is a pre-computed growth rate. | §4 rows renamed `GDP_level` (USD bn SAAR) and `GDPDEF_index` (Idx 2017=100). DERIVED block added in §5.1: `g_nom = yoy(GDP_level, 4)`, `Pi_dfl = yoy(GDPDEF_index, 4)`. |
| F4 — §7 Year-0 Int/Inc 21.8% wrong | MAJOR | **VALID-patched** | HCGB-1 PDF Ex 3 table read directly via Read tool (pages 30-46): Year 0 Interest/Income column = blank; 21.8% is Year 1 value. Year 5/Y10 anchors (689%/898%) match source. | §7 line 150 Year 0 Int/Inc cell `21.8%` → `—`. R14 self-check line still passes. |
| F5 — §8a JS `project()` claims "Dalio Ex 3 recurrence" but understates | MAJOR | **VALID-patched** | Audit Python recomputation: target JS with `d0=580, pdRev=15, g=3.8, r0=3.4, rCreep=0.5` gives Year 5 = 674.2%, Year 10 = 865.9%. HCGB-1 source: 689% / 898%. Off by ~15-32 pp. The JS misses 35% principal-rollover mechanics. | §8a line 184 comment relabeled `// operational approx. — exact Y0/Y5/Y10 anchors per § 7`. §8c chart legend renamed `'Projection (op. approx; Ex 3 anchors 580/689/898 per § 7)'` so legend is honest about what `projSeries` renders (advisor-flag follow-up). |
| F6 — R7b coverage too loose (markers > 3 lines from numeric thresholds) | MAJOR | **VALID-patched** | §6 stage-table rows on lines 113-117 are 4-8 lines below DERIVED marker; §7 Step 1/3 input blocks lacked formal markers within 3 lines. R7b strict reading rejects distance > 3. | §6: existing marker tightened; new post-table DERIVED marker added (covers rows above). §7: new `> **Dalio**` markers added inline after Step 1 (Ex 1 anchors) and Step 3 (Ex 3 toy-model parameters). |
| F7 — §6 action rules (gold/ILB/long-nominals) lack attribution | MAJOR | **VALID-patched** | Lines 131-134 are portfolio prescriptions with no `Dalio`/`NON-DALIO`/`DERIVED` marker within 3 lines. Nearest marker (line 127) covers COFER, not asset rules. | DERIVED (operational) marker added directly above action-rules list — notes 4 prescriptions are author-stipulated; HCGB-1 implies but doesn't name "ILB" or "long nominals" verbatim. |
| F8 — §10 World Bank URL has literal `{ISO}` placeholder | MAJOR | **VALID-patched** | Live fetch on `…/country/{ISO}/…` fails (placeholder not interpolated); concrete USA URL works. R11 expects fetchable URLs unless explicitly templated. | §10 source line replaced with concrete USA URL + separate template form labeled R3 placeholder + landing page. |
| F9 — COFER methodology stale (2025Q3 unallocated eliminated) | MAJOR | **VALID-patched** | WebSearch confirmed IMF TN Nov 2025: starting 2025Q3 with revisions back to 2000Q1, IMF eliminates "unallocated" portion via stratified-mean + carry-forward imputation. Target previously locked to "allocated" definition. | §4 `FX_res_USD` description updated. §10 source line also updated with 2025Q3 boundary note (advisor-flag follow-up — audit cited both locations). |
| F10 — header spacing + §8b title | MINOR | **MIXED (DISMISS-spacing + VALID-patched-title)** | (a) Header spacing audit-prompt typo — `audit_prompt.md` lines 194-201 use 2 spaces; `_acceptance_criteria.md` S4 regex (canonical) uses 1 space. Research files comply with canonical regex — DISMISS. (b) `_prompt_template.md` line 186 confirms canonical `### 8b. Excel — sheet layout, Power Query M or URL, key formulas`; target had only "Power Query M". | Spacing dismissed (cluster false positive). §8b title patched to "Power Query M or URL". |

---

## Files 04-12

Not yet processed. See `memory/project_layer2_state.md` for per-file expected findings + verification plan.

---

## Cluster facts re-usable across remaining files

Captured in `memory/project_layer2_state.md`. Highlights:
- TCMDO units = MILLIONS (verified). Affects 1.4.
- BIS WS_TC,2.0 (verified). Affects 1.3.
- Hamilton 2018 ≠ ±1σ (verified). Wherever cited for σ-band, reclassify DERIVED.
- S4 schema-spacing finding is FALSE POSITIVE across all 12 files (audit-prompt typo). DISMISS.
- FRED is BLOCKED from this env — use WebSearch + third-party PDF mirrors.
- GOLDPMGBD228NLBM removed from FRED — appears in audits 1.7, 2.1, 2.2, 2.4. Independent verification still pending; the cluster pattern is suspicious enough to expect VALID but not assumed.
