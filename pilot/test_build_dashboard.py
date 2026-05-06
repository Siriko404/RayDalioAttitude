"""Tests for pilot/build_dashboard.py — generates dalio_dashboard.html from research/01-12."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "pilot"))


class TestBuildScriptExists(unittest.TestCase):
    def test_build_script_imports(self):
        """build_dashboard module must be importable."""
        import build_dashboard  # noqa: F401


class TestHtmlHead(unittest.TestCase):
    def test_head_contains_required_cdn_deps(self):
        import build_dashboard
        head = build_dashboard.build_html_head()
        self.assertIn("Source+Serif+4", head)
        self.assertIn("DM+Mono", head)
        self.assertIn("katex", head)
        self.assertIn("echarts", head)
        self.assertIn("gsap", head)
        self.assertIn("--ink:   #000", head)
        self.assertIn("--paper: #fff", head)
        self.assertIn("scroll-snap-type: y mandatory", head)
        self.assertIn("Dalio · Economic Framework", head)

    def test_head_contains_typography_table(self):
        import build_dashboard
        head = build_dashboard.build_html_head()
        self.assertIn("font-weight: 700", head)  # h1
        self.assertIn("clamp(56px, 9vw, 132px)", head)  # h1 size
        self.assertIn("font-weight: 300", head)  # h2 default + body
        self.assertIn("font-style: italic", head)
        self.assertIn("font-weight: 400", head)  # h3
        self.assertIn("font-weight: 500", head)  # eyebrow + lever name


class TestParseResearchFile(unittest.TestCase):
    def test_parse_extracts_sections(self):
        """Parser must extract §1..§8 from research/04_deleveragings.md."""
        import build_dashboard
        data = build_dashboard.parse_research_file(REPO_ROOT / "research" / "04_deleveragings.md")
        self.assertIn("title", data)
        self.assertIn("section_2", data)
        self.assertIn("section_3", data)
        self.assertIn("section_5", data)
        self.assertIn("section_6", data)
        self.assertIn("section_7", data)
        self.assertIn("section_8", data)
        self.assertTrue(len(data["section_7"]) > 100, "§7 should have substantial content")


if __name__ == "__main__":
    unittest.main()
