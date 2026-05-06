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
