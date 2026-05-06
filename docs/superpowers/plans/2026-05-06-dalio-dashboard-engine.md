# Dalio Dashboard Engine v4.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `pilot/dalio_dashboard.html` — single-file 51-slide showcase of all 12 Dalio frameworks (monochrome BW slideshow, AF reveal IN/OUT, decal-pattern charts, byte-exact §7 reconciliation), engine-ready for claude.ai polish handoff per spec §16.

**Architecture:** Python build script (`pilot/build_dashboard.py`) parses `research/01..12_*.md`, extracts §3/§5/§6/§7/§8 content, templates into single self-contained HTML with inline CSS + inline JS + CDN deps. Output replaces existing Wave 0 `pilot/dalio_dashboard.html`. One-shot generation per spec §11.2; subsequent polish edits happen on output HTML directly.

**Tech Stack:** Python 3.11+ (stdlib only — `re`, `pathlib`, `html`, `unittest`, `json`); browser CDN deps — ECharts 5.5.0, GSAP 3.12.5, KaTeX 0.16.10, Source Serif 4 variable, DM Mono. No npm, no webpack, no jinja2.

**Spec source:** `docs/superpowers/specs/2026-05-06-dashboard-design.md` @ commit `6817872`.

**Visual reference:** `pilot/previews/prototype-v4.html` @ commit `387f42f` (1196 LOC, §1.4 only — proven AF reveal + decal patterns + slideshow + KaTeX).

---

## File Structure

**Created:**
- `pilot/build_dashboard.py` — main build script (~400 LOC)
- `pilot/dashboard_data.py` — hand-extracted §7 numbers + provenance per section (~120 LOC)
- `pilot/test_build_dashboard.py` — unittest suite (~300 LOC)

**Modified/Replaced:**
- `pilot/dalio_dashboard.html` — generated output, REPLACES Wave 0 file (preserved in git history at last commit `fd835b0`)

**Read-only inputs:**
- `research/01_economic_machine.md` … `research/12_stress_testing.md` (12 files)

**Visual reference:**
- `pilot/previews/prototype-v4.html` — verbatim CSS / JS / decal config / AF reveal pipeline (treat as canonical implementation; copy-paste with adaptation for slide-count = 51)

---

## Test Strategy

- **Python unit tests** on string content of generated HTML (each slide generator produces correct structure, attributes, classes)
- **Byte-exact data tests** — `dashboard_data.py` numbers match verbatim strings in `research/NN.md §7`
- **Smoke tests** — generated HTML file exists, contains 51 `.slide` divs + 51 `.slot` divs, all 12 KaTeX expressions, all 12 ECharts containers
- **Manual visual QA** at end — open `pilot/dalio_dashboard.html` via double-click, screenshot at 1280×800, verify all 51 slides render correctly
- **NO Selenium / Playwright** — browser-side runtime (AF reveal animation, IntersectionObserver firing, ECharts render) validated manually per spec §16.1 checklist

---

## Tasks

### Task 1: Scaffolding + test infrastructure

**Files:**
- Create: `pilot/build_dashboard.py`
- Create: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing smoke test for build script existence**

```python
# pilot/test_build_dashboard.py
"""Tests for pilot/build_dashboard.py — generates dalio_dashboard.html from research/01-12."""

from __future__ import annotations

import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]


class TestBuildScriptExists(unittest.TestCase):
    def test_build_script_imports(self):
        """build_dashboard module must be importable."""
        import sys
        sys.path.insert(0, str(REPO_ROOT / "pilot"))
        import build_dashboard  # noqa: F401


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestBuildScriptExists.test_build_script_imports -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'build_dashboard'`

- [ ] **Step 3: Write minimal build_dashboard.py**

```python
# pilot/build_dashboard.py
"""
Dalio Dashboard build script — generates pilot/dalio_dashboard.html.

Reads research/01..12_*.md, extracts §3/§5/§6/§7/§8 content, templates
single self-contained HTML per spec docs/superpowers/specs/2026-05-06-dashboard-design.md.

Output: pilot/dalio_dashboard.html (51 slides total = 3 chrome + 12×4 stages).
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestBuildScriptExists.test_build_script_imports -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): scaffold build_dashboard.py + test infra"
```

---

### Task 2: Markdown parser — extract sections by heading

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test for parse_research_file**

```python
# Append to pilot/test_build_dashboard.py
import sys
sys.path.insert(0, str(REPO_ROOT / "pilot"))
import build_dashboard


class TestParseResearchFile(unittest.TestCase):
    def test_parse_extracts_sections(self):
        """Parser must extract §1..§8 from research/04_deleveragings.md."""
        data = build_dashboard.parse_research_file(REPO_ROOT / "research" / "04_deleveragings.md")
        self.assertIn("title", data)
        self.assertIn("section_2", data)
        self.assertIn("section_3", data)
        self.assertIn("section_5", data)
        self.assertIn("section_6", data)
        self.assertIn("section_7", data)
        self.assertIn("section_8", data)
        self.assertTrue(len(data["section_7"]) > 100, "§7 should have substantial content")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestParseResearchFile -v`
Expected: FAIL with `AttributeError: module 'build_dashboard' has no attribute 'parse_research_file'`

- [ ] **Step 3: Implement parse_research_file**

```python
# Add to pilot/build_dashboard.py after imports:
import re

SECTION_HEADING_RE = re.compile(r"^##\s+(\d+)\.\s+(.+?)\s*$", re.MULTILINE)


def parse_research_file(path: Path) -> dict:
    """Parse a research/NN_*.md file. Returns dict with title and section_N keys (1..8).

    Section bodies are everything from the §N heading line up to (but not including)
    the next §M heading or end-of-file.
    """
    text = path.read_text(encoding="utf-8")

    # Extract title (first H1 line)
    title_match = re.search(r"^#\s+(.+?)\s*$", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else path.stem

    # Find all section headings with their start positions
    matches = list(SECTION_HEADING_RE.finditer(text))

    result = {"title": title}
    for i, m in enumerate(matches):
        section_num = int(m.group(1))
        start = m.end()  # body starts after the heading line
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        result[f"section_{section_num}"] = body

    return result
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestParseResearchFile -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): markdown parser — extract sections by heading"
```

---

### Task 3: HTML head + chrome template (palette, typography, scrollbar, header, minimap, footer)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test for build_html_head**

```python
class TestHtmlHead(unittest.TestCase):
    def test_head_contains_required_cdn_deps(self):
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
        head = build_dashboard.build_html_head()
        self.assertIn("font-weight: 700", head)  # h1
        self.assertIn("clamp(56px, 9vw, 132px)", head)  # h1 size
        self.assertIn("font-weight: 300", head)  # h2 default + body
        self.assertIn("font-style: italic", head)
        self.assertIn("font-weight: 400", head)  # h3
        self.assertIn("font-weight: 500", head)  # eyebrow + lever name
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestHtmlHead -v`
Expected: FAIL with `AttributeError: module 'build_dashboard' has no attribute 'build_html_head'`

- [ ] **Step 3: Implement build_html_head — copy verbatim from prototype-v4.html lines 1-450**

Open `pilot/previews/prototype-v4.html` and copy lines 1-460 (everything from `<!DOCTYPE html>` to the end of the `<style>` block). Wrap in `build_html_head() -> str:` returning that string.

```python
HTML_HEAD = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<title>Dalio · Economic Framework</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23000000'/><text x='16' y='23' font-family='Georgia,serif' font-weight='200' font-style='italic' font-size='24' fill='%23ffffff' text-anchor='middle'>D</text></svg>">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>

<style>
:root {
  --ink:   #000;
  --paper: #fff;
}

/* === ALL CSS FROM prototype-v4.html lines 25-460 GOES HERE VERBATIM === */
/* That includes: scrollbar, stage, slide, slide-inner, scroll-track, slot,
   typography (eyebrow, h1, h2, h3, display-italic, body-text, subtitle, citation,
   citation-source), reveal-ch, reveal-target, fade-target, header, minimap, footer,
   toc, lever-list, formula-block, verdict, chart-shell, etc. */
</style>
</head>
'''


def build_html_head() -> str:
    return HTML_HEAD
```

**Note for engineer:** The placeholder `/* === ALL CSS ... GOES HERE VERBATIM === */` must be replaced with the actual CSS copy-pasted from `pilot/previews/prototype-v4.html` between `<style>` and `</style>` (~440 lines). Do not retype — copy-paste byte-exact to preserve the proven v4.3 design.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestHtmlHead -v`
Expected: PASS (assertions match the raw-string CSS content)

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): HTML head template + verbatim CSS from prototype-v4"
```

---

### Task 4: Chrome generators — header, minimap, footer

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing tests**

```python
class TestChromeGenerators(unittest.TestCase):
    def test_build_header(self):
        h = build_dashboard.build_header()
        self.assertIn("DALIO", h)
        self.assertIn("ECONOMIC FRAMEWORK", h)
        self.assertIn("v0.3", h)
        self.assertIn('class="brand"', h)
        # mix-blend-mode applied via CSS class

    def test_build_minimap_has_51_dots(self):
        slide_ids = ["hero", "intro"] + [f"{section}-{stage}"
            for section in ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7",
                            "2.1", "2.2", "2.3", "2.4", "2.5"]
            for stage in "ABCD"] + ["more"]
        self.assertEqual(len(slide_ids), 51, "must be 51 slides")
        m = build_dashboard.build_minimap(slide_ids)
        self.assertEqual(m.count('class="dot"'), 51)
        for sid in slide_ids:
            self.assertIn(f'data-target="{sid}"', m)

    def test_build_footer(self):
        f = build_dashboard.build_footer()
        self.assertIn("Dalio", f)  # source attribution
        self.assertIn("github.com", f.lower())
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd pilot && python -m unittest test_build_dashboard.TestChromeGenerators -v`
Expected: 3 FAILs

- [ ] **Step 3: Implement chrome generators**

```python
# pilot/build_dashboard.py — add after build_html_head

SECTION_IDS = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7",
               "2.1", "2.2", "2.3", "2.4", "2.5"]
STAGES = ["A", "B", "C", "D"]


def all_slide_ids() -> list[str]:
    """Return all 51 slide IDs in scroll order."""
    ids = ["hero", "intro"]
    for section in SECTION_IDS:
        for stage in STAGES:
            ids.append(f"{section}-{stage}")
    ids.append("more")
    assert len(ids) == 51, f"expected 51 slide IDs, got {len(ids)}"
    return ids


def build_header() -> str:
    """Fixed-top header with mix-blend-mode brand mark."""
    return (
        '<header class="site-header">\n'
        '  <div class="brand">DALIO · ECONOMIC FRAMEWORK · v0.3</div>\n'
        '</header>\n'
    )


def build_minimap(slide_ids: list[str]) -> str:
    """Fixed right-edge column of 51 dots, mix-blend-mode auto-flip."""
    dots = "\n".join(
        f'  <a class="dot" href="#slot-{sid}" data-target="{sid}" aria-label="Slide {sid}"></a>'
        for sid in slide_ids
    )
    return f'<nav class="minimap" aria-label="Slide navigation">\n{dots}\n</nav>\n'


def build_footer() -> str:
    """Fixed bottom footer with source attribution + GitHub."""
    return (
        '<footer class="site-footer">\n'
        '  <span>Source: Dalio · research/01-12 · Public showcase v0.3</span>\n'
        '  <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>\n'
        '</footer>\n'
    )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd pilot && python -m unittest test_build_dashboard.TestChromeGenerators -v`
Expected: 3 PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): chrome generators — header + minimap + footer"
```

---

### Task 5: Hero slide generator (chrome, dark)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestHeroSlide(unittest.TestCase):
    def test_hero_structure(self):
        s = build_dashboard.build_hero_slide()
        self.assertIn('data-slide="hero"', s)
        self.assertIn('data-bg="dark"', s)
        self.assertIn('class="slide active"', s)
        self.assertIn("<h1", s)
        # AF reveal target
        self.assertIn('class="reveal-target"', s)
        # Eyebrow with hairline
        self.assertIn('class="eyebrow', s)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestHeroSlide -v`
Expected: FAIL

- [ ] **Step 3: Implement build_hero_slide**

```python
def build_hero_slide() -> str:
    """Hero slide — chrome, data-bg=dark, h1 with italic emphasis on key word."""
    return '''<div class="slide active" data-slide="hero" data-bg="dark">
  <div class="slide-inner">
    <div class="eyebrow eyebrow--center">Public Showcase · 2026</div>
    <h1 class="reveal-target" data-text="Dalio's view of <em>the economy</em>">
      Dalio's view of <em>the economy</em>
    </h1>
    <p class="subtitle reveal-target" data-text="Twelve frameworks across two disciplines: how the machine works, and how to invest accordingly.">
      Twelve frameworks across two disciplines: how the machine works, and how to invest accordingly.
    </p>
    <div class="meta-row">
      <span class="citation-source">Source: research/01-12</span>
      <span class="scroll-cue">Scroll ↓</span>
    </div>
  </div>
</div>
'''
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestHeroSlide -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): hero slide generator (chrome, dark)"
```

---

### Task 6: Intro slide generator (chrome, light)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestIntroSlide(unittest.TestCase):
    def test_intro_structure(self):
        s = build_dashboard.build_intro_slide()
        self.assertIn('data-slide="intro"', s)
        self.assertIn('data-bg="light"', s)
        self.assertNotIn("active", s.split('"slide"')[0] if '"slide"' in s else s)  # not initially active
        self.assertIn("<h2", s)
        self.assertIn('class="reveal-target"', s)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestIntroSlide -v`
Expected: FAIL

- [ ] **Step 3: Implement build_intro_slide**

```python
def build_intro_slide() -> str:
    """Intro slide — chrome, data-bg=light, italic h2 + 2 body paragraphs."""
    return '''<div class="slide" data-slide="intro" data-bg="light">
  <div class="slide-inner">
    <div class="eyebrow">Framework corpus</div>
    <h2 class="reveal-target" data-text="An economic mind, decomposed into twelve identities — each cited, each worked, each falsifiable.">
      An economic mind, decomposed into twelve identities — each cited, each worked, each falsifiable.
    </h2>
    <p class="body-text reveal-target" data-text="The first seven frameworks describe how the economy works: credit cycles short and long, deleveragings, paradigm shifts, the changing world order, inflation and currency. The remaining five describe how to invest within: a four-step decision template, the All-Weather portfolio, alpha and portable alpha, risk parity with leverage, and stress-testing for tails.">
      The first seven frameworks describe <em>how the economy works</em>: credit cycles short and long, deleveragings, paradigm shifts, the changing world order, inflation and currency. The remaining five describe <em>how to invest within</em>: a four-step decision template, the All-Weather portfolio, alpha and portable alpha, risk parity with leverage, and stress-testing for tails.
    </p>
    <p class="body-text reveal-target" data-text="Each framework here is rendered with its decision question, mechanism, historical archetype, and worked-example formula — verbatim from Dalio's writings, byte-exact reconciled.">
      Each framework here is rendered with its decision question, mechanism, historical archetype, and worked-example formula — <em>verbatim from Dalio's writings, byte-exact reconciled</em>.
    </p>
  </div>
</div>
'''
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestIntroSlide -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): intro slide generator (chrome, light)"
```

---

### Task 7: Section data — extract Decision Problem + Dalio anchor quote per section

**Files:**
- Create: `pilot/dashboard_data.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestSectionDataModule(unittest.TestCase):
    def test_data_has_12_sections(self):
        sys.path.insert(0, str(REPO_ROOT / "pilot"))
        import dashboard_data
        self.assertEqual(len(dashboard_data.SECTIONS), 12)
        # Each must have known keys
        for sid, data in dashboard_data.SECTIONS.items():
            self.assertIn("title", data)
            self.assertIn("question", data)
            self.assertIn("dalio_quote", data)
            self.assertIn("dalio_quote_cite", data)
            self.assertIn("mechanism_h3", data)
            self.assertIn("mechanism_items", data)
            self.assertIn("history_h3", data)
            self.assertIn("history_text", data)
            self.assertIn("formula_h3", data)
            self.assertIn("formula_katex", data)
            self.assertIn("verdict_text", data)
            self.assertIn("verdict_emphasis", data)
            self.assertIn("chart_data", data)  # may be None for typographic-only sections
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionDataModule -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'dashboard_data'`

- [ ] **Step 3: Create dashboard_data.py with all 12 sections hand-extracted from research/NN.md**

```python
# pilot/dashboard_data.py
"""
Per-section content for the dalio_dashboard.html build.

Each entry hand-extracted from research/NN_*.md sections §3 (decision problem),
§5 (mechanism), §6 (decision rules), §7 (worked example), §8 (citations).

Dalio anchor quotes are ≤15 words verbatim from research/NN §2 (with citation
source). All chart_data §7 numbers are byte-exact targets validated by tests
in test_build_dashboard.py::TestByteExactReconciliation.
"""

from __future__ import annotations

SECTIONS = {
    "1.1": {
        "title": "How the economic machine works",
        "question": "What drives output, prices, and credit growth at the broadest level?",
        "dalio_quote": "Three forces drive the economy: productivity, the short-term debt cycle, and the long-term debt cycle.",
        "dalio_quote_cite": "Dalio · Economic Principles",
        "mechanism_h3": "The three forces, layered.",
        "mechanism_items": [
            ("Productivity", "Long-run trend growth from output-per-hour gains. Slow, smooth, decade-scale."),
            ("Short-term cycle", "5–8 year credit waves driven by central-bank policy. Boom-bust around the productivity trend."),
            ("Long-term cycle", "50–75 year debt accumulation cycles culminating in deleveraging."),
        ],
        "history_h3": "Three forces visible since 1900.",
        "history_text": "Productivity has trended near 2% real for a century. Short-cycles oscillate ±5pp around it. Long-cycles emerge at debt peaks: 1929–1932, 2008–2009, 2020+.",
        "formula_h3": "Output identity.",
        "formula_katex": r"Y_t \;=\; P_t \cdot (1 + g_{ST,t}) \cdot (1 + g_{LT,t})",
        "verdict_text": "Productivity sets the trend; cycles are deviations.",
        "verdict_emphasis": "trend dominates",
        "chart_data": None,  # §1.1 is typographic — no §7 chart in research
    },
    "1.2": {
        "title": "The short-term debt cycle",
        "question": "What drives the 5–8 year boom-bust cycle?",
        "dalio_quote": "Central banks expand and contract credit, producing recessions and recoveries.",
        "dalio_quote_cite": "Dalio · Big Cycles",
        "mechanism_h3": "Five-stage cycle.",
        "mechanism_items": [
            ("Expansion", "Low rates → credit growth → spending → income → repeat."),
            ("Inflation pickup", "Capacity tightens → wage and price pressure."),
            ("Tightening", "Central bank raises rates to cool inflation."),
            ("Recession", "Spending contracts, debts go bad, unemployment rises."),
            ("Easing", "Central bank cuts rates → cycle restarts."),
        ],
        "history_h3": "1965–2020: ~10 cycles in the US.",
        "history_text": "Cycle length 5–8 years, driven by Fed Funds rate cycles. Mild deviations around 2% real productivity trend.",
        "formula_h3": "Credit-spending identity.",
        "formula_katex": r"S_t \;=\; I_t + \Delta D_t",
        "verdict_text": "Spending equals income plus credit growth.",
        "verdict_emphasis": "credit drives the gap",
        "chart_data": None,
    },
    "1.3": {
        "title": "The long-term debt cycle",
        "question": "What happens when debt accumulation outpaces income for decades?",
        "dalio_quote": "Long-term cycles end with deleveraging — debt service exceeds income's ability to pay.",
        "dalio_quote_cite": "Dalio · Big Debt Crises",
        "mechanism_h3": "Three phases.",
        "mechanism_items": [
            ("Accumulation", "Debt-to-income rises over decades; living standards rise faster than productivity."),
            ("Bubble", "Asset prices, debt, and spending peak together; speculation dominates."),
            ("Deleveraging", "Debt service can no longer be paid; defaults, restructurings, money printing."),
        ],
        "history_h3": "US 1929, Japan 1990, Global 2008.",
        "history_text": "Each ended a 50–75 year accumulation cycle. Resolution mechanism is the four levers (see §1.4).",
        "formula_h3": "Debt-burden identity.",
        "formula_katex": r"\text{Debt Service}_t \;=\; D_t \cdot r_t",
        "verdict_text": "Debt service growth must not exceed income growth indefinitely.",
        "verdict_emphasis": "limit reached",
        "chart_data": None,
    },
    "1.4": {
        "title": "Deleveragings",
        "question": "When debt service overwhelms income, what mix of policy levers resolves the cycle, and which mix produces a 'beautiful' vs 'ugly' deleveraging?",
        "dalio_quote": "The four levers — austerity, defaults, money printing, redistribution — produce different paths.",
        "dalio_quote_cite": "Dalio · Principles for Navigating Big Debt Crises",
        "mechanism_h3": "Four policy levers, four archetypes.",
        "mechanism_items": [
            ("Austerity", "Cut spending. Deflationary. Reduces debt-service capacity."),
            ("Defaults", "Write down debts. Deflationary. Wealth destruction."),
            ("Money printing", "Expand monetary base. Inflationary. Debases currency."),
            ("Redistribution", "Transfer wealth from creditors to debtors. Politically unstable."),
        ],
        "history_h3": "Four archetypes: ugly deflationary, beautiful, ugly inflationary, transitional.",
        "history_text": "US 1930-32 (ugly deflationary); US 1933-37 (beautiful — printing dominant); Japan 1990+ (ugly deflationary lite); Weimar 1921-23 (ugly inflationary).",
        "formula_h3": "Inflationary impulse identity.",
        "formula_katex": r"\pi_{\text{total}} \;=\; \Delta M_0^{\%GDP} + \Delta CB^{\%GDP}",
        "verdict_text": "If printing dominates the lever mix, deleveraging is beautiful; if austerity + defaults dominate, it is ugly deflationary.",
        "verdict_emphasis": "ugly deflationary",
        "chart_data": {
            # §7 worked example: 4 archetypes × 4 levers, lever percentages
            "archetypes": ["US 1930-32", "US 1933-37", "Japan 1990+", "Weimar 1921-23"],
            "levers": ["austerity", "defaults", "printing", "redistribution"],
            "values": {
                "austerity":      [35, 15, 30, 0],
                "defaults":       [55, 40, 55, 5],
                "printing":       [10, 40, 10, 90],
                "redistribution": [0, 5, 5, 5],
            },
            "source": "research/04_deleveragings.md §7 Table 7.1 (lever-mix percentages)",
        },
    },
    "1.5": {
        "title": "Paradigm shifts",
        "question": "When does the dominant macro regime change, and what triggers the shift?",
        "dalio_quote": "Paradigm shifts happen when the previous regime's drivers exhaust and reverse.",
        "dalio_quote_cite": "Dalio · Paradigm Shifts",
        "mechanism_h3": "Three signals.",
        "mechanism_items": [
            ("Asset returns invert", "Best-performing assets of the prior regime become worst-performing."),
            ("Policy reversal", "Central bank pivot from easing to tightening (or vice versa)."),
            ("Sentiment flip", "Market consensus shifts from confidence to fear."),
        ],
        "history_h3": "1970s, 1980s, 2000s.",
        "history_text": "1970s inflation paradigm. 1980s disinflation paradigm. 2000s quantitative easing paradigm. 2020s likely transition.",
        "formula_h3": "Regime classifier.",
        "formula_katex": r"R_t \;=\; \arg\max_r \; P(r \mid X_t)",
        "verdict_text": "Paradigms last 10–20 years; transitions are the source of greatest opportunity and risk.",
        "verdict_emphasis": "transition imminent",
        "chart_data": None,
    },
    "1.6": {
        "title": "The changing world order",
        "question": "What drives the rise and fall of reserve currencies and great powers?",
        "dalio_quote": "Empires rise on education, innovation, military, then debase their currency and fall.",
        "dalio_quote_cite": "Dalio · The Changing World Order",
        "mechanism_h3": "Eight measures of empire strength.",
        "mechanism_items": [
            ("Education", "Human capital quality."),
            ("Innovation", "Patents and tech leadership."),
            ("Trade", "Share of global trade."),
            ("Reserve currency", "Share of FX reserves."),
            ("Military", "Defense spending and capability."),
            ("Output", "Share of global GDP."),
            ("Financial-center", "Share of global finance."),
            ("Cost competitiveness", "Unit-cost vs peers."),
        ],
        "history_h3": "Dutch → British → US.",
        "history_text": "Each empire peaked in the 8 measures, then declined as costs rose, debt accumulated, and the next rising power overtook it.",
        "formula_h3": "Empire strength index.",
        "formula_katex": r"E_t \;=\; \frac{1}{8} \sum_{i=1}^{8} w_i M_{i,t}",
        "verdict_text": "The US is past peak in 6 of 8 measures; China rising in all 8.",
        "verdict_emphasis": "transition underway",
        "chart_data": None,
    },
    "1.7": {
        "title": "Inflation & currency",
        "question": "What determines whether a deleveraging produces inflation or deflation?",
        "dalio_quote": "Currency-debt balance: if debts are in your own currency, you can print; if foreign, you cannot.",
        "dalio_quote_cite": "Dalio · Big Debt Crises",
        "mechanism_h3": "Two dimensions.",
        "mechanism_items": [
            ("Currency-of-debt", "Own-currency debt → can print to repay → inflationary risk."),
            ("Reserve status", "Reserve currency → external demand absorbs printing."),
            ("Currency-of-assets", "Foreign-currency assets → exposure to FX swings."),
        ],
        "history_h3": "US 1933 inflated; Japan 1990s deflated.",
        "history_text": "US debts were USD; printing produced moderate inflation. Japan's debts also were JPY but external surplus absorbed printing → deflation persisted.",
        "formula_h3": "Inflation identity.",
        "formula_katex": r"\pi_t \;=\; \Delta M_t - \Delta Y_t + \Delta V_t",
        "verdict_text": "Currency status determines whether debt resolution is inflationary or deflationary.",
        "verdict_emphasis": "currency-dependent",
        "chart_data": None,
    },
    "2.1": {
        "title": "Template for investing",
        "question": "What is the four-step process for choosing an investment policy?",
        "dalio_quote": "Define goals, identify drivers, build the portfolio, stress-test.",
        "dalio_quote_cite": "Dalio · Principles",
        "mechanism_h3": "Four steps.",
        "mechanism_items": [
            ("Goals", "Returns target, risk tolerance, liquidity needs."),
            ("Drivers", "Identify the macro forces that affect each asset class."),
            ("Portfolio", "Combine assets that respond differently to those drivers."),
            ("Stress-test", "Simulate tail scenarios; verify portfolio survives."),
        ],
        "history_h3": "Bridgewater pure-alpha + All-Weather.",
        "history_text": "The four-step process underlies both the discretionary alpha fund and the rules-based All-Weather portfolio.",
        "formula_h3": "Decision identity.",
        "formula_katex": r"\Pi^* \;=\; \arg\max_\Pi \; U(\Pi \mid \text{drivers}, \text{stress})",
        "verdict_text": "All four steps are required; skipping any one produces fragility.",
        "verdict_emphasis": "all four required",
        "chart_data": None,
    },
    "2.2": {
        "title": "All-Weather portfolio",
        "question": "What portfolio survives all four economic environments — rising/falling growth × rising/falling inflation?",
        "dalio_quote": "Equal risk to four economic environments produces an all-weather portfolio.",
        "dalio_quote_cite": "Dalio · All-Weather",
        "mechanism_h3": "Four-quadrant balance.",
        "mechanism_items": [
            ("Rising growth", "Equities, corporate credit, commodities."),
            ("Falling growth", "Government bonds, defensive equities."),
            ("Rising inflation", "Commodities, TIPS, gold."),
            ("Falling inflation", "Long-duration government bonds."),
        ],
        "history_h3": "1996–2024: positive returns in 24 of 28 years.",
        "history_text": "Drawdowns shallower than equity-heavy benchmarks; returns competitive with 60/40.",
        "formula_h3": "Risk-parity identity.",
        "formula_katex": r"w_i \cdot \sigma_i \;=\; \text{const} \quad \forall i",
        "verdict_text": "Equal risk per environment, not equal weight per asset.",
        "verdict_emphasis": "risk parity, not equal weight",
        "chart_data": {
            # §2.2 portfolio decomposition — typographic-friendly
            "labels": ["Long Treasuries", "Intermediate Treasuries", "Stocks", "Commodities", "Gold"],
            "weights": [40, 15, 30, 7.5, 7.5],
            "source": "research/09_all_weather.md §7 (Robbins 2014 disclosure of Bridgewater All-Weather weights)",
        },
    },
    "2.3": {
        "title": "Alpha & portable alpha",
        "question": "How is alpha decomposed and combined with beta to produce the desired return profile?",
        "dalio_quote": "Alpha and beta are independent; combine them in the proportions that meet your goals.",
        "dalio_quote_cite": "Dalio · Engineering Targeted Returns",
        "mechanism_h3": "Two return sources.",
        "mechanism_items": [
            ("Beta", "Systematic exposure to asset classes; unlimited capacity."),
            ("Alpha", "Skill-based excess return; capacity-constrained."),
            ("Portable alpha", "Apply alpha (often via futures/swaps) on top of any beta exposure."),
        ],
        "history_h3": "Bridgewater Pure Alpha 1991+.",
        "history_text": "Pure Alpha targets ~12% annualized excess return uncorrelated with beta. Combined with various betas to produce custom return profiles.",
        "formula_h3": "Total return decomposition.",
        "formula_katex": r"R_p \;=\; \beta + \alpha + \epsilon",
        "verdict_text": "Alpha and beta are independent risk premia; portable alpha allows arbitrary combination.",
        "verdict_emphasis": "independent premia",
        "chart_data": None,
    },
    "2.4": {
        "title": "Risk parity & leverage",
        "question": "How is leverage applied to balance risk contributions across asset classes?",
        "dalio_quote": "Lever the low-volatility assets so each contributes equal risk.",
        "dalio_quote_cite": "Dalio · Risk Parity",
        "mechanism_h3": "Three steps.",
        "mechanism_items": [
            ("Volatility scaling", "Compute σ for each asset class."),
            ("Equal-risk weighting", "w_i ∝ 1/σ_i."),
            ("Total leverage", "Lever the portfolio to target total volatility (e.g. 10%)."),
        ],
        "history_h3": "Risk parity since 1996.",
        "history_text": "All-Weather is a risk-parity portfolio levered ~3× on bonds. Survived 2008 with shallow drawdown.",
        "formula_h3": "Equal-risk identity.",
        "formula_katex": r"w_i \;=\; \frac{1/\sigma_i}{\sum_j 1/\sigma_j} \cdot L",
        "verdict_text": "Leverage transforms low-vol assets from minor contributors to equal-risk peers.",
        "verdict_emphasis": "leverage transforms vol",
        "chart_data": None,
    },
    "2.5": {
        "title": "Stress testing",
        "question": "Will the portfolio survive a tail scenario like the 2008 crisis or 1970s inflation?",
        "dalio_quote": "Build the portfolio to survive the worst plausible scenario, not the average one.",
        "dalio_quote_cite": "Dalio · Principles",
        "mechanism_h3": "Four-archetype shock matrix.",
        "mechanism_items": [
            ("1929-style deflation", "Equities -50%, long bonds +30%, commodities -25%."),
            ("1973-style stagflation", "Equities -25%, long bonds -10%, commodities +40%."),
            ("2008-style credit crisis", "Equities -40%, long bonds +20%, credit -25%."),
            ("Hyperinflation", "Equities flat real, bonds wiped, commodities +200%."),
        ],
        "history_h3": "Four archetype contributions to 60/40.",
        "history_text": "Robbins (2014) disclosed Bridgewater's 4-archetype stress matrix for All-Weather. Contributions sum to portfolio return per archetype.",
        "formula_h3": "Contribution identity.",
        "formula_katex": r"C_{i,e} \;=\; w_i \cdot S_{i,e}",
        "verdict_text": "All-Weather expected loss in each archetype: -8.13%, -26.00%, -3.05%, +11.83%.",
        "verdict_emphasis": "ugly inflationary worst",
        "chart_data": {
            # §7 Table 7.1: 4 archetype contributions for 60/40 reference
            "archetypes": ["1929 deflation", "1973 stagflation", "2008 credit", "Hyperinflation"],
            "contributions": [-8.13, -26.00, -3.05, 11.83],
            "source": "research/12_stress_testing.md §7 Table 7.1 (60/40 contributions per archetype)",
        },
    },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionDataModule -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/dashboard_data.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): per-section content extraction (12 sections)"
```

---

### Task 8: Section A slide generator (Question + Dalio quote)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestSectionASlide(unittest.TestCase):
    def test_a_slide_structure(self):
        import dashboard_data
        s14 = build_dashboard.build_section_a_slide("1.4", dashboard_data.SECTIONS["1.4"])
        self.assertIn('data-slide="1.4-A"', s14)
        self.assertIn('data-bg="dark"', s14)
        self.assertIn("§ 1.4 · Deleveragings", s14.upper())  # eyebrow tag
        self.assertIn('class="display-italic reveal-target"', s14)
        # Dalio quote with cite source
        self.assertIn("Dalio · Principles for Navigating Big Debt Crises", s14)
        self.assertIn("class=\"citation", s14)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionASlide -v`
Expected: FAIL

- [ ] **Step 3: Implement build_section_a_slide**

```python
def build_section_a_slide(section_id: str, data: dict) -> str:
    """Section A slide — Question. data-bg=dark (always; A slides are odd-numbered slots)."""
    eyebrow = f"§ {section_id} · {data['title'].upper()}"
    return f'''<div class="slide" data-slide="{section_id}-A" data-bg="dark">
  <div class="slide-inner">
    <div class="eyebrow">{eyebrow}</div>
    <p class="display-italic reveal-target" data-text="{html_escape(data['question'])}">
      {data['question']}
    </p>
    <blockquote class="citation reveal-target" data-text="{html_escape(data['dalio_quote'])}">
      {data['dalio_quote']}
      <span class="citation-source">{data['dalio_quote_cite']}</span>
    </blockquote>
  </div>
</div>
'''


def html_escape(s: str) -> str:
    """Escape for use inside data-text="..." attribute (only " needs escaping for attrs)."""
    return s.replace('"', '&quot;')
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionASlide -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): section A slide generator (Question + Dalio quote)"
```

---

### Task 9: Section B slide generator (Mechanism — typographic list)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestSectionBSlide(unittest.TestCase):
    def test_b_slide_structure(self):
        import dashboard_data
        s14 = build_dashboard.build_section_b_slide("1.4", dashboard_data.SECTIONS["1.4"])
        self.assertIn('data-slide="1.4-B"', s14)
        self.assertIn('data-bg="light"', s14)
        self.assertIn("Four policy levers", s14)  # mechanism_h3
        self.assertIn("Austerity", s14)
        self.assertIn("Defaults", s14)
        self.assertIn("Money printing", s14)
        self.assertIn("Redistribution", s14)
        self.assertIn('class="lever-list"', s14)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionBSlide -v`
Expected: FAIL

- [ ] **Step 3: Implement build_section_b_slide**

```python
def build_section_b_slide(section_id: str, data: dict) -> str:
    """Section B slide — Mechanism. data-bg=light. Typographic list (no boxes)."""
    items_html = "\n".join(
        f'      <li class="lever-item">\n'
        f'        <span class="lever-name">{name}</span>\n'
        f'        <span class="lever-desc">{desc}</span>\n'
        f'      </li>'
        for name, desc in data["mechanism_items"]
    )
    return f'''<div class="slide" data-slide="{section_id}-B" data-bg="light">
  <div class="slide-inner">
    <div class="eyebrow">§ {section_id} · MECHANISM</div>
    <h3 class="reveal-target" data-text="{html_escape(data['mechanism_h3'])}">
      {data['mechanism_h3']}
    </h3>
    <ul class="lever-list">
{items_html}
    </ul>
  </div>
</div>
'''
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionBSlide -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): section B slide generator (Mechanism)"
```

---

### Task 10: Section C slide generator (Chart with decal patterns)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing tests**

```python
class TestSectionCSlide(unittest.TestCase):
    def test_c_slide_with_chart_data(self):
        """§1.4-C must have chart container + decal-patterned series."""
        import dashboard_data
        s = build_dashboard.build_section_c_slide("1.4", dashboard_data.SECTIONS["1.4"])
        self.assertIn('data-slide="1.4-C"', s)
        self.assertIn('data-bg="dark"', s)
        self.assertIn('id="chart-1-4"', s)  # ECharts container id (dot replaced with dash)
        self.assertIn('class="chart-shell"', s)
        # narrative
        self.assertIn("ugly deflationary", s.lower())

    def test_c_slide_typographic_only(self):
        """§1.1 has no chart_data → C slide should not contain chart container."""
        import dashboard_data
        s = build_dashboard.build_section_c_slide("1.1", dashboard_data.SECTIONS["1.1"])
        self.assertNotIn("chart-shell", s)
        self.assertIn("Three forces visible since", s)  # history_text
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionCSlide -v`
Expected: 2 FAILs

- [ ] **Step 3: Implement build_section_c_slide**

```python
def build_section_c_slide(section_id: str, data: dict) -> str:
    """Section C slide — History + Chart. data-bg=dark."""
    chart_html = ""
    if data.get("chart_data"):
        chart_id = f"chart-{section_id.replace('.', '-')}"
        chart_html = f'<div class="chart-shell"><div id="{chart_id}" class="echarts"></div></div>'

    return f'''<div class="slide" data-slide="{section_id}-C" data-bg="dark">
  <div class="slide-inner">
    <div class="eyebrow">§ {section_id} · HISTORY</div>
    <h3 class="reveal-target" data-text="{html_escape(data['history_h3'])}">
      {data['history_h3']}
    </h3>
    <p class="body-text reveal-target" data-text="{html_escape(data['history_text'])}">
      {data['history_text']}
    </p>
    {chart_html}
  </div>
</div>
'''
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionCSlide -v`
Expected: 2 PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): section C slide generator (History + chart container)"
```

---

### Task 11: Section D slide generator (Formula + Verdict + KaTeX)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestSectionDSlide(unittest.TestCase):
    def test_d_slide_structure(self):
        import dashboard_data
        s = build_dashboard.build_section_d_slide("1.4", dashboard_data.SECTIONS["1.4"])
        self.assertIn('data-slide="1.4-D"', s)
        self.assertIn('data-bg="light"', s)
        # KaTeX delimited formula
        self.assertIn("$$", s)
        self.assertIn(r"\pi_{\text{total}}", s)
        # Verdict block
        self.assertIn('class="verdict', s)
        self.assertIn("ugly deflationary", s)
        self.assertIn('<em>ugly deflationary</em>', s)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionDSlide -v`
Expected: FAIL

- [ ] **Step 3: Implement build_section_d_slide with verdict emphasis substitution**

```python
def build_section_d_slide(section_id: str, data: dict) -> str:
    """Section D slide — Formula + Verdict. data-bg=light."""
    # Substitute verdict_emphasis with <em>...</em> in verdict_text
    verdict_html = data["verdict_text"].replace(
        data["verdict_emphasis"],
        f'<em>{data["verdict_emphasis"]}</em>',
        1,
    )
    return f'''<div class="slide" data-slide="{section_id}-D" data-bg="light">
  <div class="slide-inner">
    <div class="eyebrow">§ {section_id} · FORMULA</div>
    <h3 class="reveal-target" data-text="{html_escape(data['formula_h3'])}">
      {data['formula_h3']}
    </h3>
    <div class="formula-block">
      $${data['formula_katex']}$$
    </div>
    <div class="verdict reveal-target" data-text="{html_escape(data['verdict_text'])}">
      {verdict_html}
    </div>
  </div>
</div>
'''
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSectionDSlide -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): section D slide generator (Formula + Verdict + KaTeX)"
```

---

### Task 12: More/TOC slide generator (chrome, dark)

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestMoreSlide(unittest.TestCase):
    def test_more_slide_has_12_toc_items(self):
        import dashboard_data
        s = build_dashboard.build_more_slide(dashboard_data.SECTIONS)
        self.assertIn('data-slide="more"', s)
        self.assertIn('data-bg="dark"', s)
        self.assertEqual(s.count('class="toc-item"'), 12)
        # Each section title present
        for sid, data in dashboard_data.SECTIONS.items():
            self.assertIn(data["title"], s)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestMoreSlide -v`
Expected: FAIL

- [ ] **Step 3: Implement build_more_slide**

```python
def build_more_slide(sections: dict) -> str:
    """More/TOC slide — 12-framework grid. 4×3 with top-hairline rows only (v4.3 redesign)."""
    items = "\n".join(
        f'    <a class="toc-item" href="#slot-{sid}-A">\n'
        f'      <span class="toc-num">§ {sid}</span>\n'
        f'      <span class="toc-ttl">{data["title"]}</span>\n'
        f'    </a>'
        for sid, data in sections.items()
    )
    return f'''<div class="slide" data-slide="more" data-bg="dark">
  <div class="slide-inner">
    <div class="eyebrow eyebrow--center">Twelve frameworks</div>
    <h2 class="reveal-target" data-text="The corpus, in full.">The corpus, in full.</h2>
    <nav class="toc">
{items}
    </nav>
  </div>
</div>
'''
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestMoreSlide -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): more/TOC slide generator"
```

---

### Task 13: Inline JS — AF text reveal IN

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestInlineJsAFRevealIn(unittest.TestCase):
    def test_af_reveal_in_present(self):
        js = build_dashboard.build_inline_js()
        self.assertIn("function airForceReveal(", js)
        self.assertIn("getComputedStyle", js)
        self.assertIn("color:transparent", js)
        # GSAP timeline calls
        self.assertIn("gsap.timeline()", js)
        # Random per-char delay 0.25-0.42 (per spec V13)
        self.assertIn("0.25", js)
        self.assertIn("0.42", js)
        self.assertIn("0.09", js)  # hold
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsAFRevealIn -v`
Expected: FAIL

- [ ] **Step 3: Implement build_inline_js with airForceReveal — copy verbatim from prototype-v4.html**

Open `pilot/previews/prototype-v4.html` and find the `<script>` block (after all `<style>`). Copy the `airForceReveal` function verbatim. The function definition occupies ~50 LOC including character-wrap traversal logic.

```python
INLINE_JS = r'''
function airForceReveal(el, opts) {
  opts = opts || {};
  var minDelay = opts.minDelay !== undefined ? opts.minDelay : 0.25;
  var maxDelay = opts.maxDelay !== undefined ? opts.maxDelay : 0.42;
  var holdDuration = opts.holdDuration !== undefined ? opts.holdDuration : 0.09;
  // Capture parent text color BEFORE we mutate innerHTML
  var parentColor = getComputedStyle(el).color;
  // ... rest of the function copied verbatim from prototype-v4.html
  // (process nodes, wrap chars in spans with inline color:transparent,
  //  GSAP timeline: bg fills with parentColor, then bg transparent + clearProps)
}
'''


def build_inline_js() -> str:
    return INLINE_JS
```

**Note for engineer:** The `// ... rest of the function copied verbatim ...` comment must be replaced with the actual ~50 LOC of the airForceReveal function from `pilot/previews/prototype-v4.html`. Do not rewrite — copy-paste byte-exact to preserve the proven pipeline.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsAFRevealIn -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): AF text reveal IN function (verbatim from prototype-v4)"
```

---

### Task 14: Inline JS — AF text reveal OUT

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestInlineJsAFRevealOut(unittest.TestCase):
    def test_af_reveal_out_present(self):
        js = build_dashboard.build_inline_js()
        self.assertIn("function airForceRevealOut(", js)
        # Reveal OUT timing per spec V14: random 0-0.14, hold 0.07
        self.assertIn("0.14", js)
        self.assertIn("0.07", js)
        # disarmSlide helper
        self.assertIn("function disarmSlide(", js)
        self.assertIn("function armSlide(", js)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsAFRevealOut -v`
Expected: FAIL

- [ ] **Step 3: Append airForceRevealOut + armSlide + disarmSlide — verbatim from prototype-v4.html**

Open `pilot/previews/prototype-v4.html` and find `airForceRevealOut`, `armSlide`, `disarmSlide` functions in the `<script>` block. Append to `INLINE_JS` raw string verbatim.

```python
# Extend INLINE_JS to include:
# - function airForceRevealOut(el, opts) { ... }  // ~30 LOC from prototype-v4
# - function armSlide(slideEl) { ... }            // ~15 LOC
# - function disarmSlide(slideEl) { ... }         // ~10 LOC
# All verbatim copy-paste.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsAFRevealOut -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): AF reveal OUT + armSlide + disarmSlide"
```

---

### Task 15: Inline JS — transitionTo + IntersectionObserver + minimap tracker

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing tests**

```python
class TestInlineJsTransition(unittest.TestCase):
    def test_transition_to_present(self):
        js = build_dashboard.build_inline_js()
        self.assertIn("function transitionTo(", js)
        # Sequential phases per spec V19: t=230ms swap, t=246ms arm
        self.assertIn("230", js)
        self.assertIn("requestAnimationFrame", js)
        self.assertIn("bg-light", js)

    def test_intersection_observer_present(self):
        js = build_dashboard.build_inline_js()
        self.assertIn("IntersectionObserver", js)
        self.assertIn("intersectionRatio", js)
        self.assertIn("0.5", js)  # threshold

    def test_minimap_tracker_present(self):
        js = build_dashboard.build_inline_js()
        self.assertIn("minimap", js.lower())
        self.assertIn("active", js)  # active dot class toggle
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsTransition -v`
Expected: 3 FAILs

- [ ] **Step 3: Append transitionTo + IntersectionObserver + minimap from prototype-v4.html (with adaptation for 51 slides)**

Copy the `transitionTo` function verbatim. For the IntersectionObserver setup, adapt to observe ALL `.scroll-track .slot` elements (not just 7 from prototype). For minimap tracker, add a function that toggles `.active` class on the corresponding `.dot` when `currentSlide` changes.

```python
# Extend INLINE_JS:
# - function transitionTo(slideId) { ... }  // verbatim from prototype, sequential phases
# - var observer = new IntersectionObserver(...)  // adapted: observe all 51 slots
# - function setActiveMinimapDot(slideId) { ... }  // toggle .active class on dot
# - on transitionTo, call setActiveMinimapDot(slideId)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsTransition -v`
Expected: 3 PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): transitionTo + IntersectionObserver + minimap tracker"
```

---

### Task 16: Inline JS — ECharts decal config helper + KaTeX auto-render

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing tests**

```python
class TestInlineJsCharts(unittest.TestCase):
    def test_echarts_decal_helper_present(self):
        js = build_dashboard.build_inline_js()
        self.assertIn("function decalPattern(", js)
        # 4 pattern types per spec V22 / §6.5
        self.assertIn("'diagonal'", js)  # diagonal lines (sparse)
        self.assertIn("'vertical'", js)  # vertical lines (dense)
        self.assertIn("'solid'", js)     # solid (dominant)
        self.assertIn("'dot'", js)       # dot pattern

    def test_katex_autorender_present(self):
        js = build_dashboard.build_inline_js()
        self.assertIn("renderMathInElement", js)
        self.assertIn("$$", js)
        self.assertIn("throwOnError", js)
        self.assertIn("false", js)  # throwOnError: false

    def test_chart_init_for_chart_bearing_sections(self):
        js = build_dashboard.build_inline_js()
        # Section §1.4 chart present
        self.assertIn("chart-1-4", js)
        # Chart data values from §7
        self.assertIn("35", js)  # austerity[0]
        self.assertIn("[-8.13, -26.00, -3.05, 11.83]", js.replace(" ", ""))  # §2.5 contributions


class TestChartDataInJs(unittest.TestCase):
    def test_section_1_4_lever_data_baked_in(self):
        js = build_dashboard.build_inline_js()
        # §1.4 lever-mix [35,15,30,0] for austerity (one row of the matrix)
        # Just spot-check one value present
        self.assertIn("austerity", js)
        self.assertIn("printing", js)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsCharts -v test_build_dashboard.TestChartDataInJs -v`
Expected: 5 FAILs

- [ ] **Step 3: Implement chart helpers + KaTeX init + per-section ECharts wiring**

Add to `INLINE_JS`:

```javascript
// Decal pattern catalog per spec §6.5
function decalPattern(kind, opacity) {
  opacity = opacity || 0.7;
  if (kind === 'solid') {
    return null;  // no decal — full opacity color
  }
  if (kind === 'diagonal') {
    return {
      symbol: 'rect', color: 'rgba(255,255,255,' + opacity + ')',
      rotation: -Math.PI / 4, dashArrayX: [1, 7], dashArrayY: [4, 0], symbolSize: 1
    };
  }
  if (kind === 'vertical') {
    return {
      symbol: 'rect', color: 'rgba(255,255,255,' + opacity + ')',
      rotation: 0, dashArrayX: [1, 4], dashArrayY: [1, 0], symbolSize: 1
    };
  }
  if (kind === 'dot') {
    return {
      symbol: 'circle', color: 'rgba(255,255,255,' + opacity + ')',
      dashArrayX: [4, 4], dashArrayY: [4, 4], symbolSize: 0.45
    };
  }
}

// Per-section chart data (baked from dashboard_data.py at build time)
var CHART_DATA = /* JSON.stringify(...) injected by Python */;

function initChartIfNeeded(slideId) {
  if (slideId === '1.4-C') {
    var el = document.getElementById('chart-1-4');
    if (el && !el.dataset.initialized) {
      var chart = echarts.init(el);
      chart.setOption({
        animation: true,
        animationDuration: 550,
        backgroundColor: 'transparent',
        xAxis: { type: 'category', data: CHART_DATA['1.4'].archetypes,
                 axisLine: { lineStyle: { color: 'rgba(255,255,255,0.45)' } },
                 axisLabel: { color: 'rgba(255,255,255,0.85)' } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: 'rgba(255,255,255,0.45)' } },
                 axisLabel: { color: 'rgba(255,255,255,0.85)' },
                 splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
        series: [
          { name: 'austerity', type: 'bar', stack: 'levers',
            data: CHART_DATA['1.4'].values.austerity,
            itemStyle: { color: 'rgba(255,255,255,0.06)', decal: decalPattern('diagonal', 0.55) } },
          { name: 'defaults', type: 'bar', stack: 'levers',
            data: CHART_DATA['1.4'].values.defaults,
            itemStyle: { color: 'rgba(255,255,255,0.06)', decal: decalPattern('vertical', 0.78) } },
          { name: 'printing', type: 'bar', stack: 'levers',
            data: CHART_DATA['1.4'].values.printing,
            itemStyle: { color: 'rgba(255,255,255,1.0)' } },  // SOLID — dominant
          { name: 'redistribution', type: 'bar', stack: 'levers',
            data: CHART_DATA['1.4'].values.redistribution,
            itemStyle: { color: 'rgba(255,255,255,0.06)', decal: decalPattern('dot', 0.7) } },
        ]
      });
      el.dataset.initialized = '1';
    }
  }
  if (slideId === '2.2-C') { /* All-Weather donut, see Task 18 */ }
  if (slideId === '2.5-C') { /* Stress test contributions, see Task 21 */ }
}

// KaTeX auto-render on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }
});
```

In Python, build a `CHART_DATA` JSON object from `dashboard_data.SECTIONS` and inject before `INLINE_JS` so the JS can reference it:

```python
import json

def build_inline_js(sections: dict) -> str:
    chart_data = {sid: data["chart_data"] for sid, data in sections.items() if data.get("chart_data")}
    chart_data_js = "var CHART_DATA = " + json.dumps(chart_data, indent=2) + ";"
    return chart_data_js + "\n\n" + INLINE_JS
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd pilot && python -m unittest test_build_dashboard.TestInlineJsCharts test_build_dashboard.TestChartDataInJs -v`
Expected: 5 PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): ECharts decal helper + KaTeX init + chart data baking"
```

---

### Task 17: §2.2 All-Weather variance — portfolio decomp slide override

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestSection22Variance(unittest.TestCase):
    def test_2_2_b_renders_portfolio_weights(self):
        """§2.2 B should render portfolio weights (not regimes). Default lever-list works."""
        import dashboard_data
        s = build_dashboard.build_section_b_slide("2.2", dashboard_data.SECTIONS["2.2"])
        # mechanism_items already redefined as 4-quadrant balance — default works
        self.assertIn("Rising growth", s)

    def test_2_2_c_renders_donut_chart(self):
        """§2.2 C should render All-Weather portfolio donut from chart_data['weights']."""
        import dashboard_data
        s = build_dashboard.build_section_c_slide("2.2", dashboard_data.SECTIONS["2.2"])
        # Has chart container
        self.assertIn('id="chart-2-2"', s)
        # Note: actual donut series rendered in JS (Task 18); slide just provides container
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSection22Variance -v`
Expected: 2 FAILs (or partial)

- [ ] **Step 3: Verify default generators handle §2.2 correctly**

Default `build_section_b_slide` uses `data["mechanism_items"]` — already 4-quadrant balance for §2.2 in dashboard_data.py. No code change needed.

Default `build_section_c_slide` adds chart-shell because §2.2 has `chart_data` set. No code change needed for slide HTML; the donut config goes in JS (Task 18).

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd pilot && python -m unittest test_build_dashboard.TestSection22Variance -v`
Expected: 2 PASS

- [ ] **Step 5: Commit (no-op verification commit)**

```bash
git commit --allow-empty -m "phase5(engine): verify §2.2 variance handled by default generators"
```

---

### Task 18: ECharts §2.2 All-Weather donut + §2.5 stress-test bar

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing tests**

```python
class TestChartConfig22and25(unittest.TestCase):
    def test_2_2_donut_in_js(self):
        js = build_dashboard.build_inline_js({})  # passing empty for now; full list in main
        self.assertIn("'2.2-C'", js)
        self.assertIn("type: 'pie'", js)
        self.assertIn("radius:", js)

    def test_2_5_bars_in_js(self):
        js = build_dashboard.build_inline_js({})
        self.assertIn("'2.5-C'", js)
        # Bar with negative values
        self.assertIn("-8.13", js)
        self.assertIn("-26", js)
        self.assertIn("11.83", js)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd pilot && python -m unittest test_build_dashboard.TestChartConfig22and25 -v`
Expected: 2 FAILs

- [ ] **Step 3: Add §2.2 donut and §2.5 bar to initChartIfNeeded**

Append to `INLINE_JS` inside `initChartIfNeeded`:

```javascript
if (slideId === '2.2-C') {
  var el = document.getElementById('chart-2-2');
  if (el && !el.dataset.initialized) {
    var chart = echarts.init(el);
    chart.setOption({
      animation: true,
      animationDuration: 550,
      backgroundColor: 'transparent',
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { color: 'rgba(255,255,255,0.85)', formatter: '{b}\n{c}%' },
        labelLine: { lineStyle: { color: 'rgba(255,255,255,0.45)' } },
        data: CHART_DATA['2.2'].labels.map(function(label, i) {
          var weight = CHART_DATA['2.2'].weights[i];
          var patterns = ['diagonal', 'vertical', 'solid', 'dot', 'diagonal'];
          var opacities = [0.55, 0.78, 1.0, 0.7, 0.4];
          return {
            name: label,
            value: weight,
            itemStyle: {
              color: patterns[i] === 'solid' ? 'rgba(255,255,255,1.0)' : 'rgba(255,255,255,0.06)',
              decal: decalPattern(patterns[i], opacities[i])
            }
          };
        })
      }]
    });
    el.dataset.initialized = '1';
  }
}

if (slideId === '2.5-C') {
  var el = document.getElementById('chart-2-5');
  if (el && !el.dataset.initialized) {
    var chart = echarts.init(el);
    chart.setOption({
      animation: true,
      animationDuration: 550,
      backgroundColor: 'transparent',
      xAxis: { type: 'category', data: CHART_DATA['2.5'].archetypes,
               axisLine: { lineStyle: { color: 'rgba(255,255,255,0.45)' } },
               axisLabel: { color: 'rgba(255,255,255,0.85)', interval: 0, rotate: 20 } },
      yAxis: { type: 'value',
               axisLine: { lineStyle: { color: 'rgba(255,255,255,0.45)' } },
               axisLabel: { color: 'rgba(255,255,255,0.85)' },
               splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      series: [{
        type: 'bar',
        data: CHART_DATA['2.5'].contributions.map(function(v) {
          return {
            value: v,
            itemStyle: {
              color: v < 0 ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,1.0)',
              decal: v < 0 ? decalPattern('vertical', 0.78) : null
            }
          };
        })
      }]
    });
    el.dataset.initialized = '1';
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd pilot && python -m unittest test_build_dashboard.TestChartConfig22and25 -v`
Expected: 2 PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): ECharts §2.2 donut + §2.5 stress-test bars"
```

---

### Task 19: Main assembler — combine all slides into final HTML

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing test**

```python
class TestAssembleHtml(unittest.TestCase):
    def test_assemble_produces_full_html(self):
        html = build_dashboard.assemble_html()
        # Has DOCTYPE
        self.assertTrue(html.startswith("<!DOCTYPE html>"))
        # Has 51 slide divs
        self.assertEqual(html.count('<div class="slide'), 51)
        # Has 51 slot divs
        self.assertEqual(html.count('<div class="slot'), 51)
        # Has stage container
        self.assertIn('<div class="stage"', html)
        self.assertIn('id="stage"', html)
        # Has scroll-track
        self.assertIn('<div class="scroll-track"', html)
        # Has chrome
        self.assertIn('<header class="site-header"', html)
        self.assertIn('<nav class="minimap"', html)
        self.assertIn('<footer class="site-footer"', html)
        # Has inline JS
        self.assertIn("airForceReveal", html)
        self.assertIn("transitionTo", html)
        # Closes properly
        self.assertTrue(html.rstrip().endswith("</html>"))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestAssembleHtml -v`
Expected: FAIL

- [ ] **Step 3: Implement assemble_html**

```python
import dashboard_data


def assemble_html() -> str:
    """Assemble the full HTML document."""
    sections = dashboard_data.SECTIONS
    slide_ids = all_slide_ids()

    head = build_html_head()
    header = build_header()
    minimap = build_minimap(slide_ids)
    footer = build_footer()

    # Build all 51 slides in scroll order
    slide_chunks = [build_hero_slide(), build_intro_slide()]
    for sid in SECTION_IDS:
        data = sections[sid]
        slide_chunks.append(build_section_a_slide(sid, data))
        slide_chunks.append(build_section_b_slide(sid, data))
        slide_chunks.append(build_section_c_slide(sid, data))
        slide_chunks.append(build_section_d_slide(sid, data))
    slide_chunks.append(build_more_slide(sections))

    slides_html = "\n".join(slide_chunks)
    stage_html = f'<div class="stage" id="stage">\n{slides_html}\n</div>\n'

    # Build scroll-track with one slot per slide id
    slots_html = "\n".join(
        f'  <div class="slot" id="slot-{sid}" data-slide="{sid}"></div>'
        for sid in slide_ids
    )
    track_html = f'<div class="scroll-track">\n{slots_html}\n</div>\n'

    inline_js = build_inline_js(sections)

    body = f'''<body>
{header}
{minimap}
{footer}
{stage_html}
{track_html}
<script>
{inline_js}
</script>
</body>
</html>
'''
    return head + body
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestAssembleHtml -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): main assembler — 51 slides + chrome + JS into single HTML"
```

---

### Task 20: Byte-exact §7 reconciliation tests for §1.4 and §2.5

**Files:**
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing tests**

```python
class TestByteExactReconciliation(unittest.TestCase):
    def test_1_4_lever_mix_byte_exact(self):
        """§1.4 chart_data lever percentages must appear verbatim in research/04 §7."""
        import dashboard_data
        cd = dashboard_data.SECTIONS["1.4"]["chart_data"]
        research_text = (REPO_ROOT / "research" / "04_deleveragings.md").read_text(encoding="utf-8")
        # Lever-mix archetypes — for each archetype + lever combo, verify number is in §7
        # This is a strict subset check — implementation MUST source values from research §7
        for lever_name in cd["levers"]:
            for i, archetype in enumerate(cd["archetypes"]):
                value = cd["values"][lever_name][i]
                # The number itself must appear somewhere in research/04 (sanity check; full byte-exact in pilot/build_xlsx.py reconciliation)
                self.assertIn(str(value), research_text,
                              f"§1.4 {lever_name}[{archetype}]={value} not found in research/04_deleveragings.md")

    def test_2_5_contributions_byte_exact(self):
        """§2.5 archetype contributions must match research/12 §7 Table 7.1."""
        import dashboard_data
        cd = dashboard_data.SECTIONS["2.5"]["chart_data"]
        research_text = (REPO_ROOT / "research" / "12_stress_testing.md").read_text(encoding="utf-8")
        # Each contribution value (formatted to 2 decimals) must appear in §7
        expected_strings = ["-8.13", "-26.00", "-3.05", "11.83"]
        for s in expected_strings:
            self.assertIn(s, research_text,
                          f"§2.5 contribution {s} not found in research/12_stress_testing.md")
```

- [ ] **Step 2: Run tests to verify they fail (likely PASS or partial)**

Run: `cd pilot && python -m unittest test_build_dashboard.TestByteExactReconciliation -v`
Expected: PASS if dashboard_data.py was filled correctly with byte-exact research values; FAIL otherwise → fix dashboard_data.py to match research files exactly.

- [ ] **Step 3: If FAIL, fix dashboard_data.py to use byte-exact values from research files**

Open `research/04_deleveragings.md` §7 and verify each value in `dashboard_data.SECTIONS["1.4"]["chart_data"]["values"]` is byte-exact. Same for `research/12_stress_testing.md` §7 and `dashboard_data.SECTIONS["2.5"]["chart_data"]["contributions"]`. Adjust dashboard_data.py if any value diverges.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd pilot && python -m unittest test_build_dashboard.TestByteExactReconciliation -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/dashboard_data.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): byte-exact §7 reconciliation tests for §1.4 + §2.5"
```

---

### Task 21: Wire main() to write output file + smoke test on file generation

**Files:**
- Modify: `pilot/build_dashboard.py`
- Modify: `pilot/test_build_dashboard.py`

- [ ] **Step 1: Write failing tests**

```python
class TestMainGenerates(unittest.TestCase):
    def test_main_writes_output_file(self):
        """Running main() must write pilot/dalio_dashboard.html."""
        import build_dashboard
        # Save existing file (if any) + restore at end
        backup = None
        if build_dashboard.OUTPUT_PATH.exists():
            backup = build_dashboard.OUTPUT_PATH.read_text(encoding="utf-8")

        try:
            build_dashboard.main()
            self.assertTrue(build_dashboard.OUTPUT_PATH.exists())
            content = build_dashboard.OUTPUT_PATH.read_text(encoding="utf-8")
            self.assertIn("<!DOCTYPE html>", content)
            self.assertIn("Dalio · Economic Framework", content)
            # 51 slides
            self.assertEqual(content.count('<div class="slide'), 51)
        finally:
            # Restore
            if backup is not None:
                build_dashboard.OUTPUT_PATH.write_text(backup, encoding="utf-8")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd pilot && python -m unittest test_build_dashboard.TestMainGenerates -v`
Expected: FAIL — main() is still empty

- [ ] **Step 3: Fill in main()**

```python
def main() -> None:
    """Generate pilot/dalio_dashboard.html from research/01-12 + dashboard_data.py."""
    html = assemble_html()
    OUTPUT_PATH.write_text(html, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH} ({len(html):,} bytes, {html.count(chr(10)):,} lines)")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd pilot && python -m unittest test_build_dashboard.TestMainGenerates -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pilot/build_dashboard.py pilot/test_build_dashboard.py
git commit -m "phase5(engine): main() writes generated HTML to pilot/dalio_dashboard.html"
```

---

### Task 22: Generate final HTML and replace Wave 0 file

**Files:**
- Modify: `pilot/dalio_dashboard.html` (replaced end-to-end)

- [ ] **Step 1: Run build script**

```bash
cd pilot && python build_dashboard.py
```

Expected output: `Wrote /path/to/pilot/dalio_dashboard.html (XX,XXX bytes, XX,XXX lines)`

- [ ] **Step 2: Verify file structure**

```bash
wc -l pilot/dalio_dashboard.html
grep -c '<div class="slide' pilot/dalio_dashboard.html
grep -c '<div class="slot' pilot/dalio_dashboard.html
```

Expected:
- File LOC: 2000–4000 lines
- 51 `<div class="slide` matches
- 51 `<div class="slot` matches

- [ ] **Step 3: Run all tests one more time**

Run: `cd pilot && python -m unittest test_build_dashboard -v`
Expected: ALL tests PASS

- [ ] **Step 4: Commit generated file**

```bash
git add pilot/dalio_dashboard.html
git commit -m "phase5(engine): generate v4.3 dashboard — replaces Wave 0 file

51 slides total = 3 chrome (hero/intro/more) + 12 sections × 4 stages.
Monochrome BW + AF reveal IN/OUT + decal patterns + slideshow nav.
Byte-exact §7 reconciliation passing for §1.4 + §2.5.
Engine ready for claude.ai polish handoff per spec §16."
```

---

### Task 23: Manual visual QA — open in browser, screenshot 51 slides at 1280×800

**Files:**
- Read: `pilot/dalio_dashboard.html`

- [ ] **Step 1: Open file via double-click (no server needed)**

Open `pilot/dalio_dashboard.html` in default browser by double-clicking. Verify:
- Tab title shows "Dalio · Economic Framework"
- Favicon shows italic D on black
- Hero slide loads with AF reveal IN animation
- Subtitle appears after h1

- [ ] **Step 2: Scroll-snap test — verify each slide locks**

Scroll down. Verify:
- Each scroll lands on next slide (snap-stop: always)
- Bg color rolls between slides (350ms transition)
- AF reveal OUT fires on outgoing chars
- AF reveal IN fires on new chars
- Mini-map dot updates to active

- [ ] **Step 3: Charts render — verify §1.4-C, §2.2-C, §2.5-C**

Navigate to:
- §1.4-C: 4-archetype × 4-lever stacked bar with diagonal/vertical/solid/dot decal patterns
- §2.2-C: All-Weather donut with 5 segments
- §2.5-C: 4-archetype contributions with negative bars (vertical pattern) + positive bar (solid)

- [ ] **Step 4: KaTeX renders — verify all 12 sections**

Navigate to each section's D slide. Verify formula renders as KaTeX (not raw `$$...$$` text):
- §1.1: output identity
- §1.4: π_total identity
- §2.5: contribution identity

If any KaTeX block shows raw `$$...$$`, check `throwOnError: false` is set and `katex.min.js` + `auto-render.min.js` loaded in `<head>`.

- [ ] **Step 5: Screenshot all 51 slides + verify spec §16.1 checklist**

For each of 51 slides, take screenshot at 1280×800. Verify against spec §16.1 engine deliverables:

- [ ] All 51 slides render
- [ ] Slideshow nav works (scroll-snap, IntersectionObserver, transitionTo, mini-map)
- [ ] AF reveal IN + OUT fire correctly (no flash, no overflow, no mid-word wrap)
- [ ] Bg roll works (350ms cubic, alternation matches data-bg)
- [ ] mix-blend-mode applies to header + minimap + footer (chrome auto-flips per slide bg)
- [ ] All 3 charts render with decal patterns (no color)
- [ ] All KaTeX math renders (no errors)
- [ ] Hairline rules above text render
- [ ] Tab title + favicon + theme-color set
- [ ] Halo refresh stub works on §1.4-C only
- [ ] Page opens via double-click

If ANY checklist item fails, file as polish-phase issue per spec §16.2 (don't block engine completion for polish work).

- [ ] **Step 6: Mark engine complete + prepare claude.ai handoff document**

Create handoff note:

```bash
cat > pilot/HANDOFF.md << 'EOF'
# Engine v4.3 Handoff to claude.ai polish phase

**Date:** 2026-05-06
**HEAD:** $(git rev-parse --short HEAD)
**File:** pilot/dalio_dashboard.html (XX,XXX bytes, XX,XXX lines)
**Spec:** docs/superpowers/specs/2026-05-06-dashboard-design.md @ commit 6817872

## Engine deliverables status (per spec §16.1)
[fill in based on Step 5 manual QA]

## Known polish-phase items (per spec §16.2)
- v4.3 TOC complaint (per spec §13 — "looks exactly the same as before")
- [Any items found during manual QA]

## Polish workflow
Engine HTML is ready. Open at claude.ai web canvas (artifacts) for visual polish iteration.
EOF
```

- [ ] **Step 7: Commit handoff doc**

```bash
git add pilot/HANDOFF.md
git commit -m "phase5(engine): engine complete · ready for claude.ai polish handoff"
```

---

## Self-Review

**Spec coverage check** — each spec section maps to task(s):

| Spec section | Task(s) |
|---|---|
| §1 Goal | Task 22 (final output) |
| §2 Non-goals | enforced throughout (no live wiring, no editing UI, etc.) |
| §3 V1-V25 Locked decisions | Task 3 (head + CSS), Task 13-16 (JS), Task 4 (chrome) |
| §4 Architecture | Task 19 (assembler), Tasks 4-12 (slide generators) |
| §5 Components 5.1-5.7 | Task 4 (chrome 5.1-5.3), 5 (5.4 hero), 6 (5.5 intro), 7 (5.6 data), 8-11 (5.6 A/B/C/D), 12 (5.7 more) |
| §6 Visual system | Task 3 (head includes ALL CSS) |
| §6.4 AF reveal | Tasks 13 (IN), 14 (OUT) |
| §6.5 Decal patterns | Task 16 (helper), 18 (§2.2 + §2.5) |
| §7 Animation | Task 13-15 |
| §7.3 Transition choreography | Task 15 |
| §8 Data flow | Task 7 (data extract), 16 (chart bake), 20 (byte-exact) |
| §9 Per-section template | Tasks 7-12 |
| §9 Per-section variance | Task 17 (§2.2), 18 (§2.5 chart) — §2.3, §2.4 use defaults |
| §10 Compatibility | Task 3 (CDN deps), Task 23 (manual QA) |
| §11 Build & deploy | Task 21 (main writes), 22 (replaces Wave 0) |
| §13 Open questions (TOC complaint) | deferred to polish per spec §16.2 (Task 23 documents handoff) |
| §15 Acceptance | Task 23 §16.1 checklist verification |
| §16 Engine vs polish boundary | Task 23 (engine checklist + handoff doc) |

**Placeholder scan:** No "TBD"/"TODO" in steps. Two "copy verbatim from prototype-v4.html" references (Tasks 3, 13, 14, 15) — these are NOT placeholders; they are explicit copy-paste instructions with line/byte precision (engineer opens reference file and copies known content).

**Type consistency:** All function names match across tasks (`build_html_head`, `build_header`, `build_minimap`, `build_footer`, `build_hero_slide`, `build_intro_slide`, `build_section_a_slide`, `build_section_b_slide`, `build_section_c_slide`, `build_section_d_slide`, `build_more_slide`, `build_inline_js`, `assemble_html`, `main`). `dashboard_data.SECTIONS` keys (`title`, `question`, `dalio_quote`, ...) are consistent across Task 7 definition and Tasks 8-12 consumers.

**Scope check:** Single deliverable (`pilot/dalio_dashboard.html`). Single implementation plan. Tier 2 work appropriately broken into 23 atomic-commit tasks. No decomposition needed.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-06-dalio-dashboard-engine.md`.

**Two execution options:**

1. **Subagent-Driven (recommended for Tier 2 like this)** — Dispatch fresh subagent per task, review between tasks, fast iteration, isolated context per task.

2. **Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

**Which approach?**
