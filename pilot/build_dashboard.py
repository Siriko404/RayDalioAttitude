"""
Dalio Dashboard build script — generates pilot/dalio_dashboard.html.

Reads research/01..12_*.md, extracts §3/§5/§6/§7/§8 content, templates
single self-contained HTML per spec docs/superpowers/specs/2026-05-06-dashboard-design.md.

Output: pilot/dalio_dashboard.html (51 slides total = 3 chrome + 12 sections × 4 stages).
Run:    python pilot/build_dashboard.py
"""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RESEARCH_DIR = REPO_ROOT / "research"
OUTPUT_PATH = REPO_ROOT / "pilot" / "dalio_dashboard.html"


def main() -> None:
    """Build entry point. Will be filled in subsequent tasks."""
    pass


if __name__ == "__main__":
    main()
