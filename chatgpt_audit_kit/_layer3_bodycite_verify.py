"""
Phase-3 body-cite verifier.

For each entry in a file's `### Limitations / design choices` sub-section,
extract the body-location pointers (§ N, § N.N, § N step M) and verify
that the referenced body section actually carries one of:

  - a verbatim quote block (`> **Dalio**`)
  - a NON-DALIO marker (`> **NON-DALIO`)
  - a DERIVED marker (`> **DERIVED`)

If a Limitations entry claims closure at § N but § N has no marker /
quote that the entry references, flag.

This catches the entry-6 hallucination class (advisor finding 2026-04-27):
§ 10 entry asserted "caveat at § 5.1 point of use" but § 5.1 had no such
marker. R5/R15 violation.

Run: python chatgpt_audit_kit/_layer3_bodycite_verify.py [research/<file>.md]
If no file given, runs against all 12 research files.

Exit 0 = all entries' body-cite claims verified.
Exit 1 = at least one entry's claim cannot be verified.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RESEARCH = REPO / "research"

# Match a § reference like:  § 5.1, § 7 step 6, §6, § 2 verbatim quote
SECTION_REF = re.compile(r"§\s*(\d+)(?:\.(\d+))?(?:\s+step\s+(\d+))?", re.IGNORECASE)

# Markers that count as a body-cite closure
MARKER = re.compile(r"^>\s*\*\*(Dalio|NON-DALIO|DERIVED)", re.MULTILINE)


def split_sections(lines: list[str]) -> dict[str, tuple[int, int]]:
    """Return {'5': (start, end), '5.1': (start, end), ...} as line indices.

    Top-level sections are `## § N`. Sub-sections within § 5 / § 7 / § 8
    are `### N.M` (sometimes ### 8a/8b/8c, treat alphanumeric). For § 5
    sub-sections, content is `### 5.1 …` style.
    """
    spans: dict[str, tuple[int, int]] = {}
    # Top-level § N
    top_starts: list[tuple[str, int]] = []
    for i, ln in enumerate(lines):
        m = re.match(r"^##\s*§\s*(\d+)\b", ln)
        if m:
            top_starts.append((m.group(1), i))
    for idx, (n, start) in enumerate(top_starts):
        end = top_starts[idx + 1][1] if idx + 1 < len(top_starts) else len(lines)
        spans[n] = (start, end)
    # Sub-section ### N.M  (within whichever top-level section it falls)
    for i, ln in enumerate(lines):
        m = re.match(r"^###\s*(\d+)\.(\d+)\b", ln)
        if m:
            key = f"{m.group(1)}.{m.group(2)}"
            # End: next ### header at same level OR next ## §
            for j in range(i + 1, len(lines)):
                if re.match(r"^##\s+", lines[j]) or re.match(r"^###\s*\d+\.\d+\b", lines[j]):
                    spans[key] = (i, j)
                    break
            else:
                spans[key] = (i, len(lines))
    return spans


def section_has_marker(lines: list[str], span: tuple[int, int]) -> bool:
    text = "\n".join(lines[span[0]:span[1]])
    return MARKER.search(text) is not None


def find_limitations_block(lines: list[str]) -> tuple[int, int] | None:
    """Find the line range of `### Limitations / design choices`."""
    for i, ln in enumerate(lines):
        if re.match(r"^###\s+Limitations\s*/\s*design\s+choices\s*$", ln, re.IGNORECASE):
            for j in range(i + 1, len(lines)):
                if re.match(r"^###\s+", lines[j]) or re.match(r"^##\s+", lines[j]):
                    return (i, j)
            return (i, len(lines))
    return None


def split_entries(lines: list[str], span: tuple[int, int]) -> list[tuple[int, str]]:
    """Same numbered-list split as the entries extractor."""
    entries: list[tuple[int, list[str]]] = []
    current: list[str] | None = None
    current_num: int | None = None
    for ln in lines[span[0]:span[1]]:
        m = re.match(r"^(\d+)\.\s+(.*)$", ln)
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


def verify_file(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    spans = split_sections(lines)
    block = find_limitations_block(lines)
    issues: list[str] = []
    if block is None:
        # Phase-3-not-yet-applied file — return empty (don't flag, that's
        # a different gate)
        return []
    entries = split_entries(lines, block)
    for num, body in entries:
        # Every entry needs at least ONE valid section reference whose
        # section carries a marker. Find all § N references in body.
        refs = SECTION_REF.findall(body)
        # Filter out § 10 self-references — Limitations is in § 10
        refs = [(n, m, _step) for (n, m, _step) in refs if n != "10"]
        if not refs:
            issues.append(f"  entry {num}: NO body-section reference found in '{body[:80]}…'")
            continue
        # Check each referenced section. A claim is verified if AT LEAST ONE
        # referenced section carries a marker (Dalio / NON-DALIO / DERIVED).
        verified = False
        ref_summary: list[str] = []
        for (n, m, _step) in refs:
            key = f"{n}.{m}" if m else n
            if key not in spans and m:
                # Try parent section if N.M not registered
                key = n
            if key in spans:
                has = section_has_marker(lines, spans[key])
                ref_summary.append(f"§{key}={'MARKER' if has else 'no-marker'}")
                if has:
                    verified = True
        if not verified:
            issues.append(
                f"  entry {num}: claims body cite at "
                f"[{', '.join(ref_summary)}] but NO referenced section carries a "
                f"Dalio/NON-DALIO/DERIVED marker."
            )
    return issues


def main() -> int:
    args = sys.argv[1:]
    if args:
        files = [Path(a).resolve() for a in args]
    else:
        files = sorted(RESEARCH.glob("[0-9][0-9]_*.md"))
    fail_count = 0
    for f in files:
        issues = verify_file(f)
        if issues:
            print(f"\n{f.name}:")
            for x in issues:
                print(x)
            fail_count += 1
        else:
            block = find_limitations_block(f.read_text(encoding="utf-8").splitlines())
            if block is not None:
                print(f"{f.name}: PASS (Limitations block found, all entries verified)")
            else:
                print(f"{f.name}: SKIP (no Limitations block — Phase 3 not applied yet)")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
