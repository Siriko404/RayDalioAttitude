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

**Status:** In progress (compaction prep). F1 pre-verified VALID via PDF; remaining findings unverified.

| Finding | Severity | Pre-verdict | Notes for resume |
|---|---|---|---|
| F1 — recession subphase quote attributed to p.18 but is on p.19 | CRITICAL | **VALID** (pre-verified) | PDF read: p. 18 ends with "The recession phase of the cycle follows and occurs in two parts." p. 19 has both "early part of the recession" + "late part of the recession" content. Patch needed: split line 95 between p. 18 (4 expansion + tightening + intro) and p. 19 (recession subphases). |
| F2 — 8 stale FRED values in §7 worked example | CRITICAL | likely **VALID-flagged** | FRED unreachable from this env. Recommend relabel §7 as illustrative per R7 schema option (a) instead of attempting refresh. |
| F3 — `RGDP_yoy` mislabel (A191RL1Q225SBEA is QoQ SAAR not YoY) | MAJOR | likely **VALID** | Need WebSearch to confirm. FRED label is likely "Percent Change from Preceding Period, Seasonally Adjusted Annual Rate" = QoQ SAAR. |
| F4 — late-cycle "Dalio-exact" overclaim | MAJOR | **VALID** (pre-verified) | PDF p. 18 says "around 3.5-4%" + "about 2 ½ years" (qualifiers, not exact). |
| F5 — R4 ratio 5.102 < 5.67 | MAJOR | needs recompute on current file | |
| F6 — §8b title "Power Query M" vs schema "Power Query M or URL" | MAJOR | **VALID** (pre-verified) | `_prompt_template.md` line 186 uses "or URL". Easy patch. |
| F7 — missing reproducibility lock for §7 | MAJOR | implicit fix via F2 | If §7 relabeled illustrative, lock not needed. |
| F8 — §3 grammar "primitives downstream consumes" missing "that" | MINOR | **VALID** | Easy patch. |

---

## Files 03-12

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
