"""
Independent verification of _layer3_entries.json.

Re-extracts numbered open-question entries from research/[0-9][0-9]_*.md using
DIFFERENT logic than _layer3_extract.py:
- Reads file as raw bytes (not splitlines)
- Locates §10 sub-section by character offset
- Splits into entries by regex on multi-line text directly (not line-by-line)
- Strips trailing whitespace per entry

Then asserts byte-equal match against the JSON. Any mismatch = script bug
or scope ambiguity that must be resolved before triage can be trusted.

Run: python chatgpt_audit_kit/_layer3_verify_extract.py
Exit 0 = full match. Exit 1 = mismatch (with diff).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RESEARCH = REPO / "research"
ENTRIES_JSON = REPO / "chatgpt_audit_kit" / "_layer3_entries.json"

# §10 header
SECTION10 = re.compile(r"^## § 10\b", re.MULTILINE)

# Sub-section headers (5 known variants)
SUBHEADERS = re.compile(
    r"(?m)^"
    r"(?:"
    r"### Open questions and ambiguities"
    r"|### Open questions and limitations"
    r"|\*\*Ambiguities\s*\(R5\):\*\*"
    r"|\*\*Open questions\s*&\s*limitations\.\*\*"
    r"|\*\*Open questions\s*/\s*ambiguities[^*]*\*\*"
    r")\s*$"
)

# Sub-section terminators
TERMINATOR = re.compile(
    r"(?m)^"
    r"(?:"
    r"## "
    r"|### "
    r"|\*\*Limitations[:.]?\*\*"
    r"|\*\*Sources[^*]*\*\*"
    r"|\*\*Findings[^*]*\*\*"
    r"|\*\*URL[^*]*\*\*"
    r"|\*\*R12[^*]*\*\*"
    r"|\*\*R13[^*]*\*\*"
    r"|\*\*R14[^*]*\*\*"
    r")"
)

# Entry start: line beginning with "N." where N is a number
ENTRY_START = re.compile(r"(?m)^(\d+)\.\s")


def extract_v2(text: str) -> list[tuple[int, str]]:
    """Independent re-extraction logic."""
    # Find §10 header
    m10 = SECTION10.search(text)
    if not m10:
        return []
    after_10 = text[m10.end():]

    # Find sub-section header within remainder of §10 (i.e. before next ## )
    # but not consuming a `## ` itself
    next_h2 = re.search(r"(?m)^## ", after_10)
    section10_block = after_10[: next_h2.start()] if next_h2 else after_10

    sub = SUBHEADERS.search(section10_block)
    if not sub:
        return []
    after_sub = section10_block[sub.end():]

    # Find terminator within sub block
    term = TERMINATOR.search(after_sub)
    sub_block = after_sub[: term.start()] if term else after_sub

    # Split into entries by ENTRY_START matches; each entry runs to start of next match
    matches = list(ENTRY_START.finditer(sub_block))
    entries: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(sub_block)
        body = sub_block[start:end].rstrip()
        num = int(m.group(1))
        entries.append((num, body))
    return entries


def main() -> int:
    json_data = json.loads(ENTRIES_JSON.read_text(encoding="utf-8"))
    json_by_key = {(d["file"], d["entry_num"]): d["verbatim"] for d in json_data}

    files = sorted(RESEARCH.glob("[0-9][0-9]_*.md"))
    mismatch_count = 0
    total_entries_v2 = 0

    for f in files:
        text = f.read_text(encoding="utf-8")
        entries = extract_v2(text)
        total_entries_v2 += len(entries)
        # JSON entries for this file
        json_entries = sorted(
            [(num, txt) for (fn, num), txt in json_by_key.items() if fn == f.name]
        )
        v2_entries = sorted(entries)
        # Compare counts
        if len(json_entries) != len(v2_entries):
            print(f"COUNT MISMATCH {f.name}: json={len(json_entries)} v2={len(v2_entries)}")
            mismatch_count += 1
            continue
        # Compare per-entry verbatim text
        for (jn, jt), (vn, vt) in zip(json_entries, v2_entries):
            if jn != vn:
                print(f"NUM MISMATCH {f.name}: json#{jn} vs v2#{vn}")
                mismatch_count += 1
            elif jt != vt:
                print(f"TEXT MISMATCH {f.name} entry {jn}:")
                print(f"  json[{len(jt)}]: {repr(jt[:120])}...")
                print(f"  v2 [{len(vt)}]: {repr(vt[:120])}...")
                # Show first divergent char
                for i, (a, b) in enumerate(zip(jt, vt)):
                    if a != b:
                        print(f"  diverge @ char {i}: json={repr(a)} v2={repr(b)}")
                        break
                if len(jt) != len(vt):
                    print(f"  length diff: json={len(jt)} v2={len(vt)}")
                mismatch_count += 1

    print(f"\nJSON total: {len(json_data)}")
    print(f"v2 total:   {total_entries_v2}")
    print(f"Mismatches: {mismatch_count}")
    return 0 if mismatch_count == 0 and len(json_data) == total_entries_v2 else 1


if __name__ == "__main__":
    sys.exit(main())
