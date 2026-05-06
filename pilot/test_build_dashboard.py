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


class TestChromeGenerators(unittest.TestCase):
    def test_all_slide_ids_returns_51(self):
        """all_slide_ids must return 51 IDs in scroll order: hero, intro, 12 sections × 4 stages, more."""
        import build_dashboard
        ids = build_dashboard.all_slide_ids()
        self.assertEqual(len(ids), 51)
        self.assertEqual(ids[0], "hero")
        self.assertEqual(ids[1], "intro")
        self.assertEqual(ids[2], "1-1-A")
        self.assertEqual(ids[5], "1-1-D")
        self.assertEqual(ids[6], "1-2-A")
        self.assertEqual(ids[-1], "more")
        self.assertEqual(ids[-2], "2-5-D")

    def test_build_header(self):
        """Header uses class='brand-bar' on <header> tag with brand mark."""
        import build_dashboard
        h = build_dashboard.build_header()
        self.assertIn("DALIO", h)
        self.assertIn("ECONOMIC FRAMEWORK", h)
        self.assertIn('class="brand-bar"', h)
        self.assertIn("<header", h)

    def test_build_minimap_has_51_dots(self):
        """Minimap has one <a> dot per slide_id with href, data-label, data-slide. First is active."""
        import build_dashboard
        slide_ids = build_dashboard.all_slide_ids()
        m = build_dashboard.build_minimap(slide_ids)
        # Count <a> tags inside <nav class="minimap">
        # CSS selector pattern: nav.minimap a (no class on <a>)
        self.assertEqual(m.count("<a "), 51)
        # First should have class="active"
        self.assertIn('class="active"', m)
        # Each slide_id should appear in data-slide
        for sid in slide_ids:
            self.assertIn(f'data-slide="{sid}"', m)
        # Each href should be #slot-{sid}
        for sid in slide_ids:
            self.assertIn(f'href="#slot-{sid}"', m)
        # Sample data-label format
        self.assertIn('data-label="HERO"', m)
        self.assertIn('data-label="1.4 / C"', m)
        self.assertIn('data-label="2.5 / D"', m)

    def test_build_footer(self):
        """Footer plain tag with brand + GitHub link + version."""
        import build_dashboard
        f = build_dashboard.build_footer()
        self.assertIn("DALIO", f)
        self.assertIn("<footer", f)
        self.assertIn("</footer>", f)
        self.assertIn("/raydalioattitude", f.lower())


class TestHeroSlide(unittest.TestCase):
    def test_hero_structure(self):
        """Hero slide is first (.active class), data-bg=dark, contains h1 with reveal-target + data-text."""
        import build_dashboard
        s = build_dashboard.build_hero_slide()
        self.assertIn('data-slide="hero"', s)
        self.assertIn('data-bg="dark"', s)
        self.assertIn('class="slide active"', s)
        self.assertIn("<h1", s)
        # AF reveal target
        self.assertIn('class="reveal-target"', s)
        self.assertIn('data-text=', s)
        # Eyebrow with hairline
        self.assertIn('class="eyebrow', s)
        # Subtitle
        self.assertIn('class="subtitle', s)
        # Hero meta
        self.assertIn('class="hero-meta', s)
        self.assertIn("SCROLL", s)


if __name__ == "__main__":
    unittest.main()
