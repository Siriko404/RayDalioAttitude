"""
Dalio Dashboard build script — generates pilot/dalio_dashboard.html.

Reads research/01..12_*.md, extracts §3/§5/§6/§7/§8 content, templates
single self-contained HTML per spec docs/superpowers/specs/2026-05-06-dashboard-design.md.

Output: pilot/dalio_dashboard.html (51 slides total = 3 chrome + 12 sections × 4 stages).
Run:    python pilot/build_dashboard.py
"""

from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RESEARCH_DIR = REPO_ROOT / "research"
OUTPUT_PATH = REPO_ROOT / "pilot" / "dalio_dashboard.html"

# Section heading format in research/NN_*.md is "## § N Title"
SECTION_HEADING_RE = re.compile(r"^##\s+§\s+(\d+)\s+(.+?)\s*$", re.MULTILINE)


def parse_research_file(path: Path) -> dict:
    """Parse a research/NN_*.md file. Returns dict with title and section_N keys (1..N).

    Section bodies are everything from the §N heading line up to (but not including)
    the next §M heading or end-of-file.
    """
    text = path.read_text(encoding="utf-8")

    # Extract title (first H1 line)
    title_match = re.search(r"^#\s+(.+?)\s*$", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else path.stem

    # Find all section headings with their start positions
    matches = list(SECTION_HEADING_RE.finditer(text))

    result: dict = {"title": title}
    for i, m in enumerate(matches):
        section_num = int(m.group(1))
        start = m.end()  # body starts after the heading line
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        result[f"section_{section_num}"] = body

    return result


def main() -> None:
    """Build entry point. Will be filled in subsequent tasks."""
    pass


if __name__ == "__main__":
    main()
