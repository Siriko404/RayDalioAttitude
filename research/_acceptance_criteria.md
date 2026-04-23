# Acceptance Criteria — Research Subagent Reports

> Every agent report (`research/<SEQ>_<slug>.md`) MUST pass every item below.
> A single FAIL = report rejected and re-run (with refined prompt if needed).
> Commands use the Unix form; run from the project root.

Replace `<SEQ>_<slug>` in the commands below with the actual file, e.g. `01_economic_machine`.

---

## Structural criteria (format / presence)

- [ ] **S1. File exists at the registry-derived path.**
  ```bash
  test -f research/<SEQ>_<slug>.md && echo PASS || echo FAIL
  ```

- [ ] **S2. Word count is between 2000 and 3000.**
  ```bash
  words=$(wc -w < research/<SEQ>_<slug>.md); echo "$words words"; \
    [ "$words" -ge 2000 ] && [ "$words" -le 3000 ] && echo PASS || echo FAIL
  ```

- [ ] **S3. Exactly 10 top-level `## § N` section headers, numbered 1 through 10, in order.**
  ```bash
  grep -n "^## § " research/<SEQ>_<slug>.md
  # Visually: expect 10 lines, starting with "## § 1" and ending with "## § 10"
  ```

- [ ] **S4. Each section has the EXACT title prescribed by the prompt template's REQUIRED OUTPUT SCHEMA.**
  ```bash
  grep -E "^## § (1 Executive Summary|2 Dalio|3 Decision Problem|4 Input Variables|5 Computation|6 Output Variables|7 Worked Numeric|8 Implementation|9 Integration|10 Open Questions)" research/<SEQ>_<slug>.md | wc -l
  # Expect: 10
  ```

- [ ] **S5. § 1 Executive Summary is ≤ 100 words.**
  Manually count words between `## § 1` and `## § 2`. Expect ≤ 100.

- [ ] **S6. § 4 Input Variables Table has the required 7 columns.**
  ```bash
  awk '/^## § 4/,/^## § 5/' research/<SEQ>_<slug>.md | grep -E "^\|.*name.*description.*unit.*data source.*API endpoint.*update.*range" | head -1
  # Expect: exactly one header row matching the columns
  ```

- [ ] **S7. § 8 has three sub-sections: 8a, 8b, 8c.**
  ```bash
  awk '/^## § 8/,/^## § 9/' research/<SEQ>_<slug>.md | grep -cE "^### 8[abc]"
  # Expect: 3
  ```

## Content criteria (hard rules R1–R9)

- [ ] **R1. All 10 sections present.** Covered by S3 + S4 above.

- [ ] **R2. Every numeric threshold / formula has a source citation** (Dalio or non-Dalio marker). Walk § 5, § 6, § 7 manually. Any number appearing without a `> **Dalio**` or `> **NON-DALIO**` marker nearby = FAIL.

- [ ] **R3. Every input variable in § 4 has a specific public data source + API endpoint / dataset ID.**
  ```bash
  awk '/^## § 4/,/^## § 5/' research/<SEQ>_<slug>.md | grep -E "FRED|World Bank|BLS|BEA|ECB|IMF|SEC|Stooq|BIS|Alpha Vantage|FMP|Tiingo"
  # Every row of § 4's table should have an API name. If any row lacks one, FAIL.
  ```

- [ ] **R4. ≥85% of text is inputs/formulas/computation/worked example/implementation; ≤15% is narrative theory.**
  Count: words in §§ 4–8 vs words in §§ 2–3. Ratio should be ≥ 5.67 (that's 85/15).
  ```bash
  # Approximate: word counts of narrative vs model sections
  narrative=$(awk '/^## § 2/,/^## § 4/' research/<SEQ>_<slug>.md | wc -w)
  models=$(awk '/^## § 4/,/^## § 9/' research/<SEQ>_<slug>.md | wc -w)
  ratio=$(awk "BEGIN {printf \"%.2f\", $models / ($narrative + 0.01)}")
  echo "narrative=$narrative  models=$models  ratio=$ratio (PASS if >= 5.67)"
  ```

- [ ] **R5. Ambiguities explicitly flagged in § 10.** Read § 10. Expect at least one "Open Question" or "Limitation" bullet acknowledging what Dalio left vague. Generic disclaimers ("models are simplifications") don't count.

- [ ] **R6. No content belongs to another subsection.** Cross-check against the OUT-OF-SCOPE list in `research/_prompt_template.md`. Any violation = FAIL.

- [ ] **R7. Every claim has a visual attribution marker.**
  ```bash
  grep -cE '^> \*\*(Dalio|NON-DALIO|DERIVED)' research/<SEQ>_<slug>.md
  # Expect >= 8 markers for a 2000-3000 word report.
  # If 0, attribution was silently skipped = FAIL.
  ```
  NOTE: This is a PRESENCE check (fast filter). It does NOT verify that
  every threshold / bucket edge has an attribution marker nearby. That is
  the job of R7b below, which is the authoritative coverage check.

- [ ] **R7b. Point-of-use attribution for derived thresholds (COVERAGE check).**
  Spot-check every numeric threshold / bucket edge / band width /
  heuristic ratio / derived matrix in § 5 and § 6. Each must be within
  3 lines of either a `> **Dalio**`, `> **NON-DALIO (industry standard)**`,
  or `> **DERIVED (operational)**` marker. A threshold only acknowledged
  in § 10 = FAIL. Common slip pattern: Dalio gives a central anchor
  (e.g. "productivity grows ~2%"); agent stipulates bucket edges
  (e.g. "<1.5 = low-growth, >2.5 = high-growth") and attributes to the
  Dalio anchor — the edges themselves are DERIVED and need the marker
  at the point of use.
  ```bash
  # Quick filter: list every occurrence of numeric thresholds in §§ 5–6
  # and inspect for a nearby marker (within 3 preceding or following lines).
  awk '/^## § 5/,/^## § 7/' research/<SEQ>_<slug>.md | \
    grep -nE '[0-9]+(\.[0-9]+)?\s*(%|×|x|:|\|)' | head -40
  # Then for each hit, grep -B 3 -A 3 around that line for the marker.
  # No grep shortcut substitutes for reading the prose. Read it.
  ```

- [ ] **R8. Every cited source has a public URL (no paywalls).**
  ```bash
  grep -oE 'https?://[^ )]+' research/<SEQ>_<slug>.md | sort -u
  # Manually scan the list. Flag any paywalled domain (jstor, sciencedirect,
  # wiley, tandfonline, springer) WITHOUT a matching NBER/SSRN/Levy free-
  # version link nearby. Any unresolved paywall = FAIL.
  ```

- [ ] **R9. No commercial-book quote exceeds 1 sentence; ≤ 2 sentences cumulative per book.**
  Read § 2 and any other quoted spans. Manually check each quote from a commercial book (Kennedy, Koo, Eichengreen, Ferguson, Allison, Huntington, Goodhart-Pradhan, Friedman-Schwartz, Reinhart-Rogoff hardcover). Any > 1-sentence quote OR > 2 cumulative sentences per book = FAIL.

## Palette-compliance criteria (§ 8c)

- [ ] **P1. Every hex color in § 8c is one of the locked palette tokens.**
  ```bash
  awk '/^### 8c/,/^### 8|^## § 9/' research/<SEQ>_<slug>.md | grep -oE '#[0-9a-fA-F]{6}' | sort -u
  ```
  Expected allowed set (exactly): `#0B0B0B`, `#141414`, `#1C1C1C`, `#080808`, `#262626`, `#F5F5F5`, `#A3A3A3`, `#6B7280`, `#00D08C`, `#7FFFD4`, `#E5484D`, `#D4A373`.
  Any hex NOT in this list (case-insensitive) = FAIL.

## Closeout criteria

- [ ] **C1. § 9 Integration Points lists at least one upstream AND one downstream connection** (even if one is "none — this is a leaf framework").

- [ ] **C2. § 10 Sources subsection lists every source cited in the report, with full citations + public URLs.** Cross-reference R8's URL list against § 10's bibliography; every URL in the body must also appear in § 10.

---

## Tally

Total items: **20** (S1–S7, R1–R9, R7b, P1, C1–C2).
`grep -c "^- \[ \]" research/_acceptance_criteria.md` → expect exactly 20.

**Pass bar:** all 20 items marked PASS. Even one FAIL triggers rejection and (depending on root cause) either a targeted fix, a prompt refinement, or a full re-spawn.
