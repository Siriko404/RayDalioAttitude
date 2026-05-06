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


if __name__ == "__main__":
    unittest.main()
