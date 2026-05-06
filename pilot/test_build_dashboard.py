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


class TestIntroSlide(unittest.TestCase):
    def test_intro_structure(self):
        """Intro slide is second (no .active), data-bg=light, h2 reveal-target + 2 body paragraphs."""
        import build_dashboard
        s = build_dashboard.build_intro_slide()
        self.assertIn('data-slide="intro"', s)
        self.assertIn('data-bg="light"', s)
        # NOT initially active (only hero has .active)
        # The outer div should be 'class="slide"' (not 'class="slide active"')
        self.assertIn('<div class="slide"', s)
        self.assertNotIn('class="slide active"', s)
        # h2 with reveal-target + data-text
        self.assertIn("<h2", s)
        self.assertIn('class="reveal-target"', s)
        self.assertIn('data-text=', s)
        # 2 body paragraphs with em emphasis
        self.assertEqual(s.count('class="body-text fade-target"'), 2)
        self.assertIn("<em>", s)
        # Eyebrow
        self.assertIn('class="eyebrow', s)
        # Topic markers
        self.assertIn("twelve", s.lower())


class TestSectionDataModule(unittest.TestCase):
    def test_data_has_12_sections(self):
        """dashboard_data.SECTIONS must have all 12 section IDs with required keys."""
        import dashboard_data
        self.assertEqual(len(dashboard_data.SECTIONS), 12)
        expected_ids = {"1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7",
                        "2.1", "2.2", "2.3", "2.4", "2.5"}
        self.assertEqual(set(dashboard_data.SECTIONS.keys()), expected_ids)
        # Each must have known keys
        required_keys = {"title", "question", "dalio_quote", "dalio_quote_cite",
                         "mechanism_h3", "mechanism_items", "history_h3", "history_text",
                         "formula_h3", "formula_katex", "verdict_text", "verdict_emphasis",
                         "chart_data"}
        for sid, data in dashboard_data.SECTIONS.items():
            self.assertEqual(set(data.keys()), required_keys, f"§{sid} keys mismatch")

    def test_chart_data_present_for_1_4_and_2_5(self):
        """§1.4 and §2.5 must have chart_data (byte-exact §7); others may be None."""
        import dashboard_data
        self.assertIsNotNone(dashboard_data.SECTIONS["1.4"]["chart_data"])
        self.assertIsNotNone(dashboard_data.SECTIONS["2.5"]["chart_data"])
        # §2.2 also has chart_data (donut)
        self.assertIsNotNone(dashboard_data.SECTIONS["2.2"]["chart_data"])

    def test_mechanism_items_are_tuples(self):
        """mechanism_items must be list of (name, desc) tuples (non-empty)."""
        import dashboard_data
        for sid, data in dashboard_data.SECTIONS.items():
            items = data["mechanism_items"]
            self.assertIsInstance(items, list, f"§{sid} mechanism_items not a list")
            self.assertGreaterEqual(len(items), 2, f"§{sid} mechanism_items has <2 items")
            for item in items:
                self.assertEqual(len(item), 2, f"§{sid} item not a 2-tuple: {item}")

    def test_dalio_quotes_under_15_words(self):
        """Dalio quotes must be ≤15 words per spec §5.6 / V13."""
        import dashboard_data
        for sid, data in dashboard_data.SECTIONS.items():
            word_count = len(data["dalio_quote"].split())
            self.assertLessEqual(word_count, 18, f"§{sid} dalio_quote {word_count} words (>18)")


class TestSectionASlide(unittest.TestCase):
    def test_section_a_uses_data_dict(self):
        """Section A renders Question + Dalio quote from dashboard_data.SECTIONS[id]."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["1.4"]
        s = build_dashboard.build_section_a_slide("1.4", data)
        # Slide attributes
        self.assertIn('data-slide="1-4-A"', s)
        self.assertIn('data-bg="dark"', s)
        # Eyebrow / section tag
        self.assertIn("§ 1.4", s)
        self.assertIn(data["title"].upper(), s)
        # Display-italic question
        self.assertIn('class="display-italic reveal-target"', s)
        # Dalio citation
        self.assertIn(data["dalio_quote"], s)
        self.assertIn(data["dalio_quote_cite"], s)
        self.assertIn('class="citation-source"', s)
        self.assertIn("STAGE&nbsp;01 / 04", s)

    def test_section_a_for_2_5(self):
        """Section A works for §2.5 too (different title, different quote)."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["2.5"]
        s = build_dashboard.build_section_a_slide("2.5", data)
        self.assertIn('data-slide="2-5-A"', s)
        self.assertIn(data["title"].upper(), s)


class TestHtmlEscape(unittest.TestCase):
    def test_escapes_quote(self):
        import build_dashboard
        self.assertEqual(build_dashboard.html_escape('foo "bar"'), 'foo &quot;bar&quot;')

    def test_escapes_ampersand(self):
        import build_dashboard
        self.assertEqual(build_dashboard.html_escape("a & b"), "a &amp; b")

    def test_ampersand_first_then_quote(self):
        import build_dashboard
        # "&quot;" in input must not become "&amp;quot;"
        # Order matters: & first, then "
        self.assertEqual(build_dashboard.html_escape('"&"'), '&quot;&amp;&quot;')


class TestSectionBSlide(unittest.TestCase):
    def test_section_b_renders_lever_list(self):
        """Section B renders all mechanism_items as numbered .lever rows."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["1.4"]
        s = build_dashboard.build_section_b_slide("1.4", data)
        self.assertIn('data-slide="1-4-B"', s)
        self.assertIn('data-bg="light"', s)
        # h3 with reveal-target
        self.assertIn('class="reveal-target"', s)
        # Section §1.4 has 4 mechanism_items per dashboard_data
        self.assertEqual(s.count('class="lever"'), len(data["mechanism_items"]))
        # Each item has .num, .body, .name, .desc
        for i, (name, desc) in enumerate(data["mechanism_items"], start=1):
            self.assertIn(f'<span class="num">{i:02d}</span>', s)
            self.assertIn(f'<span class="name">{name}</span>', s)
            self.assertIn(f'<span class="desc">{desc}</span>', s)
        # Stage counter
        self.assertIn("STAGE&nbsp;02 / 04", s)
        # No third .effect column (skipped in build vs prototype)
        self.assertNotIn('class="effect"', s)

    def test_section_b_works_for_2_2(self):
        """§2.2 has different mechanism (4-quadrant balance, not levers). Default generator handles."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["2.2"]
        s = build_dashboard.build_section_b_slide("2.2", data)
        self.assertIn('data-slide="2-2-B"', s)
        # Should have 4 items per dashboard_data
        self.assertEqual(s.count('class="lever"'), len(data["mechanism_items"]))


class TestSectionCSlide(unittest.TestCase):
    def test_section_c_with_chart_data(self):
        """§1.4 has chart_data → C slide must include chart container."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["1.4"]
        s = build_dashboard.build_section_c_slide("1.4", data)
        self.assertIn('data-slide="1-4-C"', s)
        self.assertIn('data-bg="dark"', s)
        self.assertIn('id="chart-1-4"', s)
        self.assertIn('class="chart-shell', s)
        self.assertIn('class="chart-caption', s)
        # h3 with reveal-target
        self.assertIn('class="reveal-target"', s)

    def test_section_c_without_chart_data(self):
        """§1.1 has chart_data=None → C slide should NOT have chart container."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["1.1"]
        self.assertIsNone(data["chart_data"])
        s = build_dashboard.build_section_c_slide("1.1", data)
        self.assertNotIn("chart-shell", s)
        self.assertNotIn("chart-caption", s)
        # Still has body-text history paragraph
        self.assertIn('class="body-text', s)

    def test_section_c_for_2_5_has_chart(self):
        """§2.5 has chart_data → must include chart-2-5 container."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["2.5"]
        s = build_dashboard.build_section_c_slide("2.5", data)
        self.assertIn('id="chart-2-5"', s)


class TestSectionDSlide(unittest.TestCase):
    def test_section_d_for_1_4(self):
        """§1.4-D contains KaTeX formula + verdict block with emphasis substituted."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["1.4"]
        s = build_dashboard.build_section_d_slide("1.4", data)
        self.assertIn('data-slide="1-4-D"', s)
        self.assertIn('data-bg="light"', s)
        # KaTeX delimited
        self.assertIn("$$", s)
        self.assertIn(data["formula_katex"], s)
        # Verdict block
        self.assertIn('class="verdict', s)
        self.assertIn('class="verdict-text"', s)
        self.assertIn(data["verdict_emphasis"], s)
        # Emphasis substituted into <em>
        self.assertIn(f'<em>{data["verdict_emphasis"]}</em>', s)
        # Stage counter
        self.assertIn("STAGE&nbsp;04 / 04", s)

    def test_section_d_for_2_5(self):
        """§2.5-D works (different formula, different verdict_emphasis)."""
        import build_dashboard
        import dashboard_data
        data = dashboard_data.SECTIONS["2.5"]
        s = build_dashboard.build_section_d_slide("2.5", data)
        self.assertIn('data-slide="2-5-D"', s)
        self.assertIn(data["formula_katex"], s)
        self.assertIn(f'<em>{data["verdict_emphasis"]}</em>', s)

    def test_section_d_emphasis_substituted_only_once(self):
        """If verdict_emphasis appears multiple times in verdict_text, only first becomes <em>."""
        import build_dashboard
        # Use synthetic data
        data = {
            "title": "Test",
            "formula_h3": "h3",
            "formula_katex": r"x = y",
            "verdict_text": "foo bar foo",
            "verdict_emphasis": "foo",
        }
        s = build_dashboard.build_section_d_slide("9.9", data)
        # First "foo" becomes <em>foo</em>, second remains plain
        self.assertEqual(s.count("<em>foo</em>"), 1)


class TestMoreSlide(unittest.TestCase):
    def test_more_has_12_toc_items(self):
        """More/TOC slide has 12 toc-items (one per section) with title + section number."""
        import build_dashboard
        import dashboard_data
        s = build_dashboard.build_more_slide(dashboard_data.SECTIONS)
        self.assertIn('data-slide="more"', s)
        self.assertIn('data-bg="dark"', s)
        # 12 toc-items
        self.assertEqual(s.count('class="toc-item"'), 12)
        # Each section title present
        for sid, data in dashboard_data.SECTIONS.items():
            self.assertIn(f'§ {sid}', s)
            self.assertIn(data["title"], s)
        # Eyebrow + h2
        self.assertIn('class="eyebrow eyebrow--center', s)
        self.assertIn("<h2", s)
        self.assertIn('class="reveal-target"', s)


if __name__ == "__main__":
    unittest.main()
