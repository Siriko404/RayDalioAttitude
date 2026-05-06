"""
R21 BYTE-EQUAL QUOTE AUDIT VERIFIER (BLOCKING).

Mechanizes verification-chain step 6: byte-equal diff between every
`> **Dalio**` quote block in the main deliverable and the
corresponding entry in the `_quote_audit.md` appendix.

Per R21 (template, line ~316 onwards):
    "Every Dalio quote in the main deliverable must have an entry
    in this appendix. Missing entry = rejection. Diff > 0 without
    `[sic]` = rejection."

Per R24 (template, post-pivot):
    "The R21 byte-equal audit MUST compare against UN-NORMALIZED
    source bytes. If the source legitimately contains typographic
    characters, preserve them and the audit passes."

Run:
    python chatgpt_audit_kit/_redteam_v2_quote_audit_diff.py \
        research_v2/04_deleveragings.md

The audit appendix path is derived from the main path by appending
`_quote_audit` before `.md`. Override with `--audit <path>`.

Exit code:
    0 — PASS (every body quote matched, all diffs annotated [sic])
    1 — FAIL (≥ 1 mismatch, missing entry, or unjustified diff)

This script does NOT verify that the quote-audit appendix's
"Source PDF text (byte-equal)" field matches the actual source PDF —
that requires retrieving the source and is the model's responsibility
under R12 + R21. This script verifies INTERNAL consistency: the body
quote and the audit appendix's "Quoted text in body" must match
exactly, and any "Source PDF text (byte-equal)" diff against
"Quoted text in body" must be annotated `[sic]`.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

# Windows console default cp1252 — mangles §, ρ, σ, em-dashes. Force
# UTF-8 stdout so report lines render verbatim (this script's report
# is meant to be diff-able and reproducible across environments).
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except (AttributeError, OSError):
    pass  # older Python or non-reconfigurable stream


@dataclass
class BodyQuote:
    location: str          # e.g., "§5 line 47" derived from line number
    line_no: int           # 1-indexed line number of the `> **Dalio**` marker
    marker_line: str       # the `> **Dalio** — source: ...` line (verbatim)
    quote_text: str        # the verbatim quote text (without `> ` prefix)


@dataclass
class AuditEntry:
    quote_id: str          # e.g., "Quote 1"
    body_location: str     # e.g., "§5 line 47"
    source: str            # title + page/URL
    source_url: str        # the WebFetch'd URL
    body_text: str         # "Quoted text in body" payload
    source_text: str       # "Source PDF text (byte-equal)" payload
    diff_field: str        # "NONE" or annotated diff list


def _section_for_line(text: str, line_no: int) -> str:
    """Walk back from `line_no` to find the most recent `## §N` heading
    and return e.g., '§5'. If not found, return the line number raw."""
    lines = text.splitlines()
    for i in range(min(line_no - 1, len(lines) - 1), -1, -1):
        m = re.match(r"^##\s*§\s*(\d+)\b", lines[i])
        if m:
            return f"§{m.group(1)} line {line_no}"
    return f"line {line_no}"


def parse_body_quotes(text: str) -> list[BodyQuote]:
    """Extract every `> **Dalio**` quote block from the body. A quote
    block is the `> **Dalio** — source: ...` line followed by 1-N `> `
    continuation lines. Returns one BodyQuote per block; quote_text
    concatenates all continuation lines (whitespace preserved between)."""
    out: list[BodyQuote] = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.lstrip().startswith("> **Dalio**"):
            marker_line = line.rstrip()
            # Collect continuation `> ` lines.
            quote_lines: list[str] = []
            j = i + 1
            while j < len(lines) and lines[j].lstrip().startswith("> ") \
                    and not lines[j].lstrip().startswith("> **"):
                # Strip the leading `> ` (or `>` followed by whitespace).
                stripped = re.sub(r"^\s*>\s?", "", lines[j])
                quote_lines.append(stripped)
                j += 1
            quote_text = "\n".join(quote_lines).strip()
            out.append(BodyQuote(
                location=_section_for_line(text, i + 1),
                line_no=i + 1,
                marker_line=marker_line,
                quote_text=quote_text,
            ))
            i = j
        else:
            i += 1
    return out


def parse_audit_entries(text: str) -> list[AuditEntry]:
    """Extract every `## Quote N` entry from the audit appendix.
    Each entry yields its Body location, Source, URL, body text,
    source text, and diff field."""
    entries: list[AuditEntry] = []
    # Split on `## Quote ` heading, keep heading.
    chunks = re.split(r"^##\s+(Quote\s+\d+\S*)\s*$", text, flags=re.MULTILINE)
    # chunks alternates: prefix, heading1, body1, heading2, body2, ...
    for k in range(1, len(chunks), 2):
        quote_id = chunks[k].strip()
        body = chunks[k + 1] if k + 1 < len(chunks) else ""

        loc = _grab_field(body, "Body location")
        source = _grab_field(body, "Source")
        source_url = _grab_field(body, "Source URL fetched")
        body_text = _grab_quote_block(body, "Quoted text in body")
        source_text = _grab_quote_block(body, "Source PDF text (byte-equal)")
        diff_field = _grab_field(body, "Diff")

        entries.append(AuditEntry(
            quote_id=quote_id,
            body_location=loc,
            source=source,
            source_url=source_url,
            body_text=body_text,
            source_text=source_text,
            diff_field=diff_field,
        ))
    return entries


def _grab_field(text: str, field_name: str) -> str:
    """Return the content of a `**Field name:** value` inline field
    (single line). Empty string if not found."""
    pattern = rf"\*\*{re.escape(field_name)}:\*\*\s*(.+)"
    m = re.search(pattern, text)
    return m.group(1).strip() if m else ""


def _grab_quote_block(text: str, field_name: str) -> str:
    """Return the multi-line `> ` quote block following a
    `**Field name:**` heading. Strips the `> ` prefix from each line.
    Empty string if not found."""
    pattern = rf"\*\*{re.escape(field_name)}:\*\*\s*\n((?:^>.*\n?)+)"
    m = re.search(pattern, text, flags=re.MULTILINE)
    if not m:
        return ""
    raw = m.group(1)
    out_lines: list[str] = []
    for ln in raw.splitlines():
        out_lines.append(re.sub(r"^\s*>\s?", "", ln))
    return "\n".join(out_lines).strip()


def diff_strings(a: str, b: str) -> list[tuple[int, str, str]]:
    """Return per-character diff: list of (index, a_char, b_char) for
    every position where a and b differ. Trailing whitespace mismatch
    treated as a diff."""
    diffs: list[tuple[int, str, str]] = []
    n = max(len(a), len(b))
    for i in range(n):
        ca = a[i] if i < len(a) else ""
        cb = b[i] if i < len(b) else ""
        if ca != cb:
            diffs.append((i, ca, cb))
    return diffs


def verify(main_path: Path, audit_path: Path) -> tuple[int, list[str]]:
    """Run the full byte-equal audit. Returns (exit_code, report_lines).
    exit_code is 0 PASS, 1 FAIL."""
    report: list[str] = []
    if not main_path.exists():
        return 1, [f"FAIL: main deliverable not found: {main_path}"]
    if not audit_path.exists():
        return 1, [f"FAIL: audit appendix not found: {audit_path}"]

    main_text = main_path.read_text(encoding="utf-8")
    audit_text = audit_path.read_text(encoding="utf-8")

    body_quotes = parse_body_quotes(main_text)
    audit_entries = parse_audit_entries(audit_text)

    report.append(f"R21 BYTE-EQUAL QUOTE AUDIT")
    report.append(f"  Main:  {main_path}")
    report.append(f"  Audit: {audit_path}")
    report.append(f"  Body Dalio-quote blocks: {len(body_quotes)}")
    report.append(f"  Audit entries:           {len(audit_entries)}")
    report.append("")

    fail = False

    # Check 1: every body quote has a matching audit entry whose
    # body_text matches the body's quote_text byte-equal.
    for bq in body_quotes:
        match = None
        for ae in audit_entries:
            if ae.body_text.strip() == bq.quote_text.strip():
                match = ae
                break
        if match is None:
            fail = True
            report.append(
                f"FAIL: body quote at {bq.location} has NO matching audit "
                f"entry (no audit `Quoted text in body` matches body text)"
            )
            report.append(f"  Body quote text (first 80 chars): "
                          f"{bq.quote_text[:80]!r}")
            continue
        # Sub-check: audit body_text vs source_text — diff must be NONE
        # or every diff char must be annotated `[sic]` in the diff field.
        diffs = diff_strings(match.body_text.strip(),
                             match.source_text.strip())
        if diffs and "[sic]" not in match.diff_field:
            fail = True
            report.append(
                f"FAIL: {match.quote_id} (body location {bq.location}) "
                f"has {len(diffs)} byte-diff(s) between `Quoted text in "
                f"body` and `Source PDF text` without `[sic]` annotation"
            )
            report.append(f"  Diff field: {match.diff_field!r}")
            for idx, ca, cb in diffs[:5]:
                report.append(f"    pos {idx}: body={ca!r} source={cb!r}")
            if len(diffs) > 5:
                report.append(f"    ... and {len(diffs) - 5} more")
        elif not diffs and match.diff_field.strip().upper() not in {
                "NONE", ""}:
            # Diff field claims something but strings match — minor
            # lint, not a fail.
            report.append(
                f"WARN: {match.quote_id} body+source match byte-equal, "
                f"but diff field is non-NONE: {match.diff_field!r}"
            )

    # Check 2: every audit entry's body_text appears in some body
    # quote (no orphan audit entries).
    body_texts = {bq.quote_text.strip() for bq in body_quotes}
    for ae in audit_entries:
        if ae.body_text.strip() not in body_texts:
            fail = True
            report.append(
                f"FAIL: audit entry {ae.quote_id} has no matching body "
                f"quote (orphan audit entry)"
            )
            report.append(f"  Audit body text (first 80 chars): "
                          f"{ae.body_text[:80]!r}")

    # Check 3: every audit entry has all required fields populated.
    for ae in audit_entries:
        missing: list[str] = []
        if not ae.body_location:
            missing.append("Body location")
        if not ae.source:
            missing.append("Source")
        if not ae.source_url:
            missing.append("Source URL fetched")
        if not ae.body_text:
            missing.append("Quoted text in body")
        if not ae.source_text:
            missing.append("Source PDF text (byte-equal)")
        if not ae.diff_field:
            missing.append("Diff")
        if missing:
            fail = True
            report.append(
                f"FAIL: audit entry {ae.quote_id} missing fields: "
                f"{', '.join(missing)}"
            )

    if not fail:
        report.append("PASS: all body quotes matched audit entries; all "
                      "byte-diffs annotated [sic] or NONE")

    return (1 if fail else 0), report


def _derive_audit_path(main_path: Path) -> Path:
    """Given e.g. `research_v2/04_deleveragings.md`, return
    `research_v2/04_deleveragings_quote_audit.md`."""
    return main_path.with_name(main_path.stem + "_quote_audit" + main_path.suffix)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("main", type=Path,
                        help="Main deliverable .md path")
    parser.add_argument("--audit", type=Path, default=None,
                        help="Audit appendix .md path (default: derive "
                             "from main by inserting `_quote_audit`)")
    args = parser.parse_args(argv)

    main_path = args.main
    audit_path = args.audit if args.audit else _derive_audit_path(main_path)
    code, report = verify(main_path, audit_path)
    for line in report:
        print(line)
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
