"""
Layer-3 §10 open-questions extractor.

Reads each research/{NN}_*.md, locates the "## § 10" header, isolates the
"Open questions and ambiguities" sub-section (or file-07's "Ambiguities (R5)"
variant), and splits it into numbered entries.

Output: chatgpt_audit_kit/_layer3_entries.json — list of records with verbatim
text per entry. No paraphrase. Classification metadata is added in a SEPARATE
step (_layer3_triage.md) keyed on (file, entry_num).

Run: python chatgpt_audit_kit/_layer3_extract.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RESEARCH = REPO / "research"
OUT = REPO / "chatgpt_audit_kit" / "_layer3_entries.json"

# §10 sub-section header variants observed:
#   Standard:  "### Open questions and ambiguities"
#   File 06 :  "### Open questions and limitations"
#   File 07 :  "**Ambiguities (R5):**"
#   File 09 :  "**Open questions & limitations.**"
#   File 10 :  "**Open questions / ambiguities in Dalio's public writing:**"
#   File 11 :  "**Open questions & limitations.**"
#   File 12 :  "**Open questions & limitations.**"
SECTION_HEADERS = [
    re.compile(r"^### Open questions and ambiguities\s*$"),
    re.compile(r"^### Open questions and limitations\s*$"),
    re.compile(r"^\*\*Ambiguities\s*\(R5\):\*\*\s*$"),
    re.compile(r"^\*\*Open questions\s*&\s*limitations\.\*\*\s*$"),
    re.compile(r"^\*\*Open questions\s*/\s*ambiguities[^*]*\*\*\s*$"),
]

# § 10 header variants
SECTION10_HEADER = re.compile(r"^## § 10\b")

# Sub-section terminator: any new heading starting with `### `, `## `, or
# `**Limitations` or `**Sources` or `**Findings` or `**URL`, etc.
TERMINATORS = [
    re.compile(r"^## "),
    re.compile(r"^### "),
    re.compile(r"^\*\*Limitations[:.]?\*\*"),
    re.compile(r"^\*\*Sources[^*]*\*\*"),
    re.compile(r"^\*\*Findings[^*]*\*\*"),
    re.compile(r"^\*\*URL[^*]*\*\*"),
    re.compile(r"^\*\*R12[^*]*\*\*"),
    re.compile(r"^\*\*R13[^*]*\*\*"),
    re.compile(r"^\*\*R14[^*]*\*\*"),
]

# An entry starts with a number-dot at line start (markdown ordered list).
ENTRY_START = re.compile(r"^(\d+)\.\s+(.*)$")


def find_section10(lines: list[str]) -> int:
    for i, ln in enumerate(lines):
        if SECTION10_HEADER.match(ln):
            return i
    return -1


def find_subsection_start(lines: list[str], start: int) -> int:
    """Return index of FIRST line of open-questions-sub-section content (line
    AFTER the matching header). -1 if no header found within §10."""
    for i in range(start, len(lines)):
        for pat in SECTION_HEADERS:
            if pat.match(lines[i]):
                return i + 1
        # If we hit another `## ` heading first, we've left §10 entirely.
        if i > start and lines[i].startswith("## ") and not SECTION10_HEADER.match(lines[i]):
            return -1
    return -1


def find_subsection_end(lines: list[str], start: int) -> int:
    """Return index AFTER last content line of the sub-section (exclusive)."""
    for i in range(start, len(lines)):
        for pat in TERMINATORS:
            if pat.match(lines[i]):
                return i
    return len(lines)


def extract_entries(sub_lines: list[str]) -> list[tuple[int, str]]:
    """Walk sub_lines; group lines under the most-recent ENTRY_START match.
    Returns list of (entry_num, verbatim_text). Entry text includes
    continuation lines (sub-bullets / blockquotes) up to next entry."""
    entries: list[tuple[int, list[str]]] = []
    current: list[str] | None = None
    current_num: int | None = None
    for ln in sub_lines:
        m = ENTRY_START.match(ln)
        if m:
            if current is not None and current_num is not None:
                entries.append((current_num, current))
            current_num = int(m.group(1))
            current = [ln.rstrip("\n")]
        else:
            if current is not None:
                current.append(ln.rstrip("\n"))
    if current is not None and current_num is not None:
        entries.append((current_num, current))
    return [(num, "\n".join(txt).rstrip()) for num, txt in entries]


def main() -> None:
    files = sorted(RESEARCH.glob("[0-9][0-9]_*.md"))
    out: list[dict] = []
    summary: list[str] = []
    for f in files:
        text = f.read_text(encoding="utf-8")
        lines = text.splitlines(keepends=False)

        i10 = find_section10(lines)
        if i10 < 0:
            summary.append(f"{f.name}: NO §10 HEADER")
            continue

        sub_start = find_subsection_start(lines, i10)
        if sub_start < 0:
            summary.append(f"{f.name}: §10 found but NO open-questions sub-section header")
            continue

        sub_end = find_subsection_end(lines, sub_start)
        sub_lines = lines[sub_start:sub_end]
        entries = extract_entries(sub_lines)

        for num, body in entries:
            out.append({
                "file": f.name,
                "entry_num": num,
                "verbatim": body,
                "subsection_start_line": sub_start + 1,  # 1-indexed for editors
                "subsection_end_line": sub_end,          # 1-indexed exclusive end
            })
        summary.append(f"{f.name}: {len(entries)} entries (lines {sub_start+1}-{sub_end})")

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print("\n".join(summary))
    print(f"\nTotal entries: {len(out)}")
    print(f"Output: {OUT}")


if __name__ == "__main__":
    main()
