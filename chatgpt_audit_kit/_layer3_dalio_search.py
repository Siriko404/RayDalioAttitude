"""
Layer-3 Dalio-exhaustion search.

For each cluster-F (dalio-search-pending) entry whose source is locally cached,
run grep with hand-coded keywords on Dalio cache files. Output structured
report with ±3 lines context per match.

Cache files (CORRECTED inventory after audit 2026-04-27):
- BDC.txt    : Big Debt Crises 2018 full text
- ENG.txt    : Engineering Targeted Returns 2011
- HEMW.txt   : How the Economic Machine Works 2008/2012 (template.pdf -> txt)
- HCGB1.txt  : How Countries Go Broke Part 1 2024-2025
- P&SR.txt   : Productivity & Structural Reform 2017 (dalio2017.txt; aliased
               to economic_machine.pdf and dalio_deleverage.txt — all same)

NOT IN CACHE (need WebFetch in Phase 3):
- CWO 2021 (Changing World Order chapters)
- Principles 2017 (Life and Work)
- Our Thoughts 2015
- Robbins reprint
- All Weather Story
- Paradigm Shifts (paradigm.txt is corrupted Dutch blog)

Search keywords are hand-coded per entry but mechanically applied via regex.
The MATCH evidence is what gets reviewed. Keywords miss = false negative
(failure to find Dalio passage); user manually expands keywords if a finding
seems wrong.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ENTRIES_JSON = REPO / "chatgpt_audit_kit" / "_layer3_entries.json"
OUT = REPO / "chatgpt_audit_kit" / "_layer3_dalio_search_report.md"

CACHE_ROOT = Path(r"C:/Users/sinas/AppData/Local/Temp")
CACHE = {
    "BDC":   CACHE_ROOT / "dalio_scratch" / "bdc.txt",
    "ENG":   CACHE_ROOT / "dalio_scratch" / "engineering.txt",
    "HEMW":  CACHE_ROOT / "dalio" / "template.txt",
    "HCGB1": CACHE_ROOT / "hcgb1.txt",
    "P&SR":  CACHE_ROOT / "dalio2017.txt",
}

# Per-entry search spec for cluster-F entries with LOCAL cache coverage.
# (file, entry_num) -> {keywords: [str], cache_keys: [str], note: str}
SEARCH = {
    ("02_short_term_debt_cycle.md", 5): dict(
        keywords=[r"\brecession\b", r"\bcontraction\b", r"\b2[½1/2]\s*year", r"NBER"],
        cache_keys=["BDC", "HEMW"],
        note="Does Dalio publish his own dating convention for cycle phases / recessions?",
    ),
    ("02_short_term_debt_cycle.md", 6): dict(
        keywords=[r"not all are manifest", r"manifest precisely", r"six(?:-|\s)phase",
                  r"phases?.*not.*always"],
        cache_keys=["HEMW"],
        note="Verify HEMW p.19 explicit caveat about six-phase variability.",
    ),
    ("03_long_term_debt_cycle.md", 3): dict(
        keywords=[r"\bMP[1-9]\b", r"monetary policy 1", r"monetary policy 2",
                  r"monetary policy 3", r"monetary policy 4", r"monetary policy 5",
                  r"monetary policy 6", r"first type of monetary",
                  r"hard money", r"fiat money"],
        cache_keys=["HCGB1", "BDC"],
        note="Does HCGB-1 give numeric trigger conditions for MP4-MP6 transitions?",
    ),
    ("03_long_term_debt_cycle.md", 4): dict(
        keywords=[r"50\s*%", r"50\s*percent", r"35\s+cases", r"35\s+(?:big )?debt",
                  r"average.*debt.*reduction", r"reduced by"],
        cache_keys=["BDC", "HCGB1"],
        note="Verify '50% ±20% reduction across 35 cases' in BDC archetypes section.",
    ),
    ("08_template_for_investing.md", 1): dict(
        keywords=[r"15\s+to\s+20", r"fifteen\s+to\s+twenty", r"10\s+to\s+15",
                  r"ten\s+to\s+fifteen", r"fifteen\s+good", r"uncorrelated.*streams?",
                  r"good.*uncorrelated"],
        cache_keys=["ENG"],
        note="Verify Dalio's stream-count language in Engineering 2011.",
    ),
    ("08_template_for_investing.md", 2): dict(
        keywords=[r"80\s*%", r"eighty percent", r"reduce.*80",
                  r"holy grail", r"correlations?.*0", r"rho\s*=\s*0"],
        cache_keys=["ENG"],
        note="Verify Engineering 2011 explicitly caveats the 80% reduction claim.",
    ),
    ("10_alpha_portable_alpha.md", 2): dict(
        keywords=[r"0\.04", r"\.04\b", r"correlation.*P2", r"correlations?.*Chart 5",
                  r"information ratio", r"IR\s*1\.4"],
        cache_keys=["ENG"],
        note="Verify Engineering 2011 Chart 5 / P2 correlation values.",
    ),
    ("10_alpha_portable_alpha.md", 4): dict(
        keywords=[r"3\s*%.*tracking", r"6\s*%.*tracking", r"tracking error",
                  r"client.*choose"],
        cache_keys=["ENG"],
        note="Verify Engineering 2011 p.9 client-choice TE examples.",
    ),
}


def grep_with_context(text: str, pattern: str, context: int = 3) -> list[tuple[int, str]]:
    """Return list of (line_num, snippet) for pattern matches."""
    lines = text.splitlines()
    rx = re.compile(pattern, re.IGNORECASE)
    hits: list[tuple[int, str]] = []
    for i, ln in enumerate(lines):
        if rx.search(ln):
            lo = max(0, i - context)
            hi = min(len(lines), i + context + 1)
            snippet_lines = []
            for j in range(lo, hi):
                marker = ">>" if j == i else "  "
                snippet_lines.append(f"{marker} L{j+1:5}: {lines[j].rstrip()}")
            hits.append((i + 1, "\n".join(snippet_lines)))
    return hits


def main() -> None:
    json_data = json.loads(ENTRIES_JSON.read_text(encoding="utf-8"))
    by_key = {(d["file"], d["entry_num"]): d["verbatim"] for d in json_data}

    out_lines: list[str] = []
    out_lines.append("# Layer-3 Dalio-Exhaustion Search Report")
    out_lines.append("")
    out_lines.append("Generated by `chatgpt_audit_kit/_layer3_dalio_search.py`. Per-entry hand-coded")
    out_lines.append("keyword sets greped against locally-cached Dalio sources.")
    out_lines.append("")
    out_lines.append("## Cache inventory (post-audit 2026-04-27)")
    out_lines.append("")
    out_lines.append("| Key | Source | File | Lines |")
    out_lines.append("|-----|--------|------|-------|")
    for key, path in CACHE.items():
        try:
            n = sum(1 for _ in path.open(encoding="utf-8", errors="replace"))
        except OSError:
            n = -1
        out_lines.append(f"| `{key}` | {path.name} | `{path}` | {n} |")
    out_lines.append("")
    out_lines.append("**Cache errors discovered:** `paradigm.txt` is a Dutch blog snippet (NOT")
    out_lines.append("Paradigm Shifts essay); `dalio2017.txt` / `dalio_deleverage.txt` /")
    out_lines.append("`dalio/economic_machine.pdf` are all the same file (Productivity & Structural")
    out_lines.append("Reform 2017, NOT HEMW). HEMW lives in `dalio/template.pdf` (newly extracted).")
    out_lines.append("")
    out_lines.append(f"## Searches ({len(SEARCH)} entries)")
    out_lines.append("")
    out_lines.append("Each search reports verbatim entry + keyword set + match results.")
    out_lines.append("")

    cache_text: dict[str, str] = {}
    for key, path in CACHE.items():
        try:
            cache_text[key] = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            cache_text[key] = ""

    summary: list[tuple[str, int, int]] = []  # (entry_id, total_hits, files_with_hits)

    for (fname, num), spec in sorted(SEARCH.items()):
        verbatim = by_key.get((fname, num), "(MISSING)")
        out_lines.append(f"### {fname} entry #{num}")
        out_lines.append("")
        out_lines.append("**Verbatim:**")
        out_lines.append("")
        for ln in verbatim.splitlines():
            out_lines.append(f"> {ln}")
        out_lines.append("")
        out_lines.append(f"**Question:** {spec['note']}")
        out_lines.append("")
        out_lines.append(f"**Keywords:** {', '.join('`' + k + '`' for k in spec['keywords'])}")
        out_lines.append(f"**Searched in:** {', '.join(spec['cache_keys'])}")
        out_lines.append("")

        total_hits = 0
        files_with_hits = 0
        for ck in spec["cache_keys"]:
            text = cache_text.get(ck, "")
            ck_hits: list[tuple[str, int, str]] = []
            for kw in spec["keywords"]:
                try:
                    matches = grep_with_context(text, kw, context=2)
                except re.error as e:
                    matches = []
                    out_lines.append(f"  *(regex error in `{kw}`: {e})*")
                for ln, snip in matches:
                    ck_hits.append((kw, ln, snip))
            # Dedupe by line number
            seen_lines = set()
            unique_hits = []
            for kw, ln, snip in ck_hits:
                if ln in seen_lines:
                    continue
                seen_lines.add(ln)
                unique_hits.append((kw, ln, snip))
            if unique_hits:
                files_with_hits += 1
                total_hits += len(unique_hits)
                out_lines.append(f"#### Matches in `{ck}` ({len(unique_hits)})")
                out_lines.append("")
                # Cap to 8 hits per file to keep report readable
                for kw, ln, snip in unique_hits[:8]:
                    out_lines.append(f"*Keyword `{kw}` at line {ln}:*")
                    out_lines.append("```")
                    out_lines.append(snip)
                    out_lines.append("```")
                    out_lines.append("")
                if len(unique_hits) > 8:
                    out_lines.append(f"*(... {len(unique_hits) - 8} more hits, truncated)*")
                    out_lines.append("")
            else:
                out_lines.append(f"#### Matches in `{ck}`: NONE")
                out_lines.append("")
        summary.append((f"{fname} #{num}", total_hits, files_with_hits))
        out_lines.append("---")
        out_lines.append("")

    out_lines.append("## Summary")
    out_lines.append("")
    out_lines.append("| Entry | Total hits | Files with hits |")
    out_lines.append("|-------|-----------:|---------------:|")
    for eid, th, fh in summary:
        out_lines.append(f"| {eid} | {th} | {fh} |")
    out_lines.append("")
    out_lines.append("Manual review of each entry's matches → update `CLASSIFY` bucket in")
    out_lines.append("`_layer3_classify.py` with explicit evidence note.")
    out_lines.append("")
    out_lines.append("## Pending fetches (4 cluster-F entries not searchable locally)")
    out_lines.append("")
    out_lines.append("- **06-#2** — CWO Ch 1 p.17 power-index weights table. Need fetch:")
    out_lines.append("  https://www.linkedin.com/pulse/chapter-1-big-picture-tiny-nutshell-ray-dalio")
    out_lines.append("- **08-#4** — Principles 2017 ~1000-streams anecdote. Source is paywalled book;")
    out_lines.append("  R9 fair-use only. Not searchable; reclassify-limitations.")
    out_lines.append("- **09-#1** — Robbins reprint nominal vs TIPS. Need fetch:")
    out_lines.append("  https://www.tonyrobbins.com/blog/the-end-of-the-bull-market")
    out_lines.append("- **09-#2** — 'Our Thoughts' 2015 'equal risk on each scenario'. Need fetch:")
    out_lines.append("  https://www.ahwilliamsco.com/includes/OurThoughtsaboutRiskParityandAllWeather.pdf")

    OUT.write_text("\n".join(out_lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    for eid, th, fh in summary:
        print(f"  {eid:50s} hits={th:3d} files_with_hits={fh}")


if __name__ == "__main__":
    main()
