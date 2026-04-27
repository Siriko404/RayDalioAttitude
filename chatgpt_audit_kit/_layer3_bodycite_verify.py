"""
Phase-3 body-cite verifier (HARDENED).

For each entry in a file's `### Limitations / design choices` sub-section,
extract the body-location pointers (§ N, § N.N, § N step M) and verify
that the referenced body section carries BOTH:

  (a) a closure marker — `> **Dalio**`, `> **NON-DALIO`, or `> **DERIVED`
  (b) topic-relevant content — at least one significant keyword from the
      entry's bolded title appears in the section's body text.

Rationale (advisor finding 2026-04-27): the original verifier accepted
ANY marker in a referenced section as proof of closure. But the entry-6
hallucination class was specifically about a *topic mismatch* — entry
claimed an aggregate-Q caveat at § 5.1, and § 5.1 had only an unrelated
Dalio quote. The unrelated Dalio quote passed the loose marker check.
This hardened version requires the section to mention the topic, not
just any marker.

Run: python chatgpt_audit_kit/_layer3_bodycite_verify.py [research/<file>.md]
If no file given, runs against all 12 research files.

Exit 0 = all entries verified (marker + topic match).
Exit 1 = at least one entry's claim cannot be verified.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RESEARCH = REPO / "research"

SECTION_REF = re.compile(r"§\s*(\d+)(?:\.(\d+))?(?:\s+step\s+(\d+))?", re.IGNORECASE)
MARKER = re.compile(r"^>\s*\*\*(Dalio|NON-DALIO|DERIVED)", re.MULTILINE)

# Words too generic to count as topic match. Lowercase.
STOPWORDS: set[str] = {
    "is", "are", "the", "a", "an", "of", "in", "on", "at", "to", "and",
    "or", "not", "but", "with", "as", "by", "for", "from", "its", "their",
    "these", "this", "that", "be", "was", "were", "have", "has", "had", "do",
    "does", "did", "can", "may", "will", "than", "into", "over", "via",
    "derived", "operational", "design", "choice", "choices", "dalio",
    "ndalio", "marker", "block", "note", "via", "use", "used", "uses",
    "upper", "lower", "higher", "fewer", "more", "less", "very", "etc",
    "above", "below", "section", "subsection", "step", "fig", "table",
    "stipulated", "default", "defaults", "approach", "applies", "apply",
    "qualitative", "quantitative", "scope",
}


def split_sections(lines: list[str]) -> dict[str, tuple[int, int]]:
    """Return {'5': (start, end), '5.1': (start, end), ...} as line indices."""
    spans: dict[str, tuple[int, int]] = {}
    top_starts: list[tuple[str, int]] = []
    for i, ln in enumerate(lines):
        m = re.match(r"^##\s*§\s*(\d+)\b", ln)
        if m:
            top_starts.append((m.group(1), i))
    for idx, (n, start) in enumerate(top_starts):
        end = top_starts[idx + 1][1] if idx + 1 < len(top_starts) else len(lines)
        spans[n] = (start, end)
    for i, ln in enumerate(lines):
        m = re.match(r"^###\s*(\d+)\.(\d+)\b", ln)
        if m:
            key = f"{m.group(1)}.{m.group(2)}"
            for j in range(i + 1, len(lines)):
                if re.match(r"^##\s+", lines[j]) or re.match(r"^###\s*\d+\.\d+\b", lines[j]):
                    spans[key] = (i, j)
                    break
            else:
                spans[key] = (i, len(lines))
    return spans


def section_text(lines: list[str], span: tuple[int, int]) -> str:
    return "\n".join(lines[span[0]:span[1]])


def section_has_marker(text: str) -> bool:
    return MARKER.search(text) is not None


def get_marker_blocks(section_body: str) -> list[str]:
    """Extract each `> **Dalio|NON-DALIO|DERIVED** ...` blockquote run.

    A block starts at a line matching MARKER and continues for all
    consecutive lines beginning with `>`. Returns the joined text of
    each block (one string per block).
    """
    lines = section_body.splitlines()
    blocks: list[str] = []
    i = 0
    n = len(lines)
    while i < n:
        if MARKER.match(lines[i]):
            j = i
            chunk: list[str] = []
            while j < n and lines[j].lstrip().startswith(">"):
                chunk.append(lines[j])
                j += 1
            blocks.append("\n".join(chunk))
            i = j
        else:
            i += 1
    return blocks


def marker_block_topic_match(section_body: str, keywords: list[str]) -> tuple[bool, list[str]]:
    """Return (matched, debug). matched = True iff at least one marker block
    in the section contains at least one of the keywords."""
    debug: list[str] = []
    for blk in get_marker_blocks(section_body):
        blk_norm = blk.lower().replace("–", "-").replace("—", "-")
        for kw in keywords:
            kw_norm = kw.lower().replace("–", "-").replace("—", "-")
            if kw_norm in blk_norm:
                debug.append(f"matched '{kw}' in block")
                return True, debug
    return False, debug


def extract_topic_keywords(entry_body: str) -> list[str]:
    """Significant keywords from an entry's bold title.

    Strips leading numbered-list prefix `N. `, then matches `**…**`.
    Tokens must be ≥ 4 chars lowercased, not in STOPWORDS. Hyphenated
    tokens are also expanded so 'aggregate-q' matches body 'aggregate Q'
    or 'aggregateQ'.
    """
    stripped = re.sub(r"^\d+\.\s*", "", entry_body)
    keywords: list[str] = []
    m = re.match(r"^\*\*(.+?)\*\*", stripped, re.DOTALL)
    if m:
        title = m.group(1).rstrip(" .")
        for tok in re.split(r"[^A-Za-z0-9\-]+", title.lower()):
            if not tok or tok in STOPWORDS or len(tok) < 4:
                continue
            keywords.append(tok)
            if "-" in tok:
                keywords.append(tok.replace("-", " "))
                keywords.append(tok.replace("-", ""))
    seen: set[str] = set()
    out: list[str] = []
    for kw in keywords:
        if kw in seen:
            continue
        seen.add(kw)
        out.append(kw)
    return out


def section_topic_matches(section_body: str, keywords: list[str]) -> list[str]:
    """Return keywords that actually appear in the section body."""
    text = section_body.lower()
    # Normalize en-dash + em-dash to ASCII hyphen for numeric range matching
    text_norm = text.replace("–", "-").replace("—", "-")
    matched: list[str] = []
    for kw in keywords:
        kw_norm = kw.replace("–", "-").replace("—", "-")
        if kw_norm in text or kw_norm in text_norm:
            matched.append(kw)
    return matched


def find_limitations_block(lines: list[str]) -> tuple[int, int] | None:
    for i, ln in enumerate(lines):
        if re.match(r"^###\s+Limitations\s*/\s*design\s+choices\s*$", ln, re.IGNORECASE):
            for j in range(i + 1, len(lines)):
                if re.match(r"^###\s+", lines[j]) or re.match(r"^##\s+", lines[j]):
                    return (i, j)
            return (i, len(lines))
    return None


def split_entries(lines: list[str], span: tuple[int, int]) -> list[tuple[int, str]]:
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
        return []
    entries = split_entries(lines, block)
    for num, body in entries:
        refs = SECTION_REF.findall(body)
        refs = [(n, m, _step) for (n, m, _step) in refs if n != "10"]
        if not refs:
            issues.append(f"  entry {num}: NO body-section reference found in '{body[:80]}…'")
            continue
        keywords = extract_topic_keywords(body)
        if not keywords:
            issues.append(f"  entry {num}: NO topic keywords extractable from '{body[:80]}…'")
            continue

        # Find at least ONE referenced section where a SINGLE marker block
        # contains at least one of the entry's topic keywords. (Marker and
        # keyword must co-occur inside the same blockquote run, not just
        # somewhere in the same section.)
        verified = False
        block_marker_only: list[str] = []
        block_keyword_only: list[str] = []
        empty_sections: list[str] = []
        ref_seen: set[str] = set()
        for (n, m, _step) in refs:
            key = f"{n}.{m}" if m else n
            if key not in spans and m:
                key = n
            if key in ref_seen:
                continue
            ref_seen.add(key)
            if key not in spans:
                empty_sections.append(f"§{key}=missing-section")
                continue
            sect_text = section_text(lines, spans[key])
            in_block, _ = marker_block_topic_match(sect_text, keywords)
            if in_block:
                verified = True
                break
            has_marker = section_has_marker(sect_text)
            sect_topic = section_topic_matches(sect_text, keywords)
            if has_marker and not in_block:
                # Marker block exists but doesn't contain the topic keyword
                if sect_topic:
                    block_keyword_only.append(f"§{key}(prose-only:{sect_topic[0]})")
                else:
                    block_marker_only.append(f"§{key}")
            elif sect_topic:
                block_keyword_only.append(f"§{key}({sect_topic[0]})")
            else:
                empty_sections.append(f"§{key}=neither")

        if not verified:
            detail = []
            if block_marker_only:
                detail.append(f"marker-no-topic={block_marker_only}")
            if block_keyword_only:
                detail.append(f"topic-not-in-marker-block={block_keyword_only}")
            if empty_sections:
                detail.append(f"empty={empty_sections}")
            issues.append(
                f"  entry {num}: NO marker BLOCK in any referenced section "
                f"contains a topic keyword. "
                f"Keywords={keywords[:5]}{'...' if len(keywords)>5 else ''}. "
                f"Status: {'; '.join(detail) if detail else 'no refs resolved'}."
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
                print(f"{f.name}: PASS (Limitations block found, marker+topic verified)")
            else:
                print(f"{f.name}: SKIP (no Limitations block — Phase 3 not applied yet)")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
