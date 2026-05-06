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


HTML_HEAD = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<title>Dalio · Economic Framework</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23000000'/><text x='16' y='23' font-family='Georgia,serif' font-weight='200' font-style='italic' font-size='24' fill='%23ffffff' text-anchor='middle'>D</text></svg>">

<!-- Fonts: Source Serif 4 variable (200..900 + italic) + DM Mono -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- KaTeX -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"></script>

<!-- ECharts + GSAP -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>

<style>
/* =============================================================
   PALETTE — pure B&W, no glow, no accents. Vintage minimal.
   Hierarchy lives in: weight (mostly 200, sparingly 700+),
   italic, size, hairline rules.
   ============================================================= */
:root {
  --ink:   #000;
  --paper: #fff;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  font-family: 'Source Serif 4', 'Times New Roman', Times, serif;
  font-weight: 300;       /* DEFAULT: thin but readable. Was 200 — too faint for pro finance. */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  background: var(--ink);
}
html {
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
}
body { overflow-x: hidden; }

/* =============================================================
   SCROLLBAR — monochrome, minimal
   ============================================================= */
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); transition: background 220ms; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.45); }
::-webkit-scrollbar-corner { background: transparent; }

::selection { background: currentColor; color: var(--ink); }

/* =============================================================
   STAGE — fixed-position slideshow viewport
   Content stays still during scroll. Only bg "rolls" + AF reveals
   handle the transitions. (User note 3: material remains still.)
   ============================================================= */
.stage {
  position: fixed;
  inset: 0;
  background: var(--ink);
  transition: background 350ms cubic-bezier(0.45, 0.05, 0.55, 0.95);
  z-index: 5;
  overflow: hidden;
}
.stage.bg-light { background: var(--paper); }

.slide {
  position: absolute;
  inset: 0;
  display: none;
  flex-direction: column;
  justify-content: center;
  padding: 76px 8vw 56px;        /* leave room for header (top) + footer */
  color: var(--paper);
  pointer-events: none;
  overflow: hidden;
}
.slide[data-bg="light"] { color: var(--ink); }
.slide.active {
  display: flex;
  pointer-events: auto;
}

.slide-inner {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  position: relative;
  /* No max-height/overflow here — slide itself has overflow:hidden.
     Letting slide-inner size naturally avoids clip-mid-content artifacts. */
}

/* =============================================================
   SCROLL-TRACK — invisible scroll slots, drive snap + intersection.
   They live below the fixed stage in z-order so they're never seen.
   ============================================================= */
.scroll-track {
  position: relative;
  z-index: 1;
}
.slot {
  width: 100%;
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* =============================================================
   TYPOGRAPHY — 90% thin (weight 200), play with size + italic.
   Heavy weights only on hero h1 (the dramatic moment) + lever
   names (mid weight) + key emphasis words.
   ============================================================= */

/* Eyebrow — DM Mono with thin rule before */
.eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: 'DM Mono', ui-monospace, Menlo, monospace;
  font-weight: 500;       /* readable density on dark + light bg */
  font-size: 11px;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 28px;
  opacity: 0.85;
}
.eyebrow::before {
  content: '';
  width: 32px;
  height: 1px;
  background: currentColor;
  opacity: 0.55;
  flex-shrink: 0;
}
.eyebrow.eyebrow--center { justify-content: center; }
.eyebrow.eyebrow--center::after {
  content: '';
  width: 32px;
  height: 1px;
  background: currentColor;
  opacity: 0.55;
  flex-shrink: 0;
}

/* H1 — hero only · the ONE bold moment · weight 700 (less artistic, professional) */
h1 {
  font-family: 'Source Serif 4', serif;
  font-weight: 700;
  font-size: clamp(56px, 9vw, 132px);
  letter-spacing: -2.5px;
  line-height: 0.96;
  margin-bottom: 32px;
}
h1 em {
  font-weight: 300;
  font-style: italic;
  letter-spacing: -1.6px;
}

/* H2 — section · italic THIN, sized down for fit */
h2 {
  font-family: 'Source Serif 4', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 5.6vw, 76px);
  letter-spacing: -1.2px;
  line-height: 1.05;
  margin-bottom: 28px;
  position: relative;
  padding-top: 24px;
}
h2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 1px;
  background: currentColor;
}
h2 em { font-style: normal; font-weight: 600; }

/* H3 — stage heading · italic, mid-thin */
h3 {
  font-family: 'Source Serif 4', serif;
  font-weight: 400;
  font-style: italic;
  font-size: clamp(24px, 2.8vw, 38px);
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin-bottom: 22px;
  position: relative;
  padding-top: 20px;
  max-width: 880px;
}
h3::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 1px;
  background: currentColor;
}

/* Display italic — questions, dramatic statements · italic, sized for fit */
.display-italic {
  font-family: 'Source Serif 4', serif;
  font-style: italic;
  font-weight: 300;
  font-size: clamp(34px, 4.6vw, 64px);
  letter-spacing: -0.8px;
  line-height: 1.15;
  max-width: 920px;
}
.display-italic em {
  font-weight: 600;
  font-style: italic;
}

/* Body — readable thin */
.body-text {
  font-size: clamp(16px, 1.25vw, 18px);
  font-weight: 300;
  line-height: 1.7;
  max-width: 640px;
}
.body-text em { font-style: italic; font-weight: 500; }
.body-text + .body-text { margin-top: 20px; }

/* Subtitle — italic, slightly heavier than body for hierarchy */
.subtitle {
  font-family: 'Source Serif 4', serif;
  font-style: italic;
  font-weight: 300;
  font-size: clamp(17px, 1.5vw, 22px);
  line-height: 1.55;
  max-width: 720px;
  opacity: 1;        /* full opacity for contrast — was 0.82 (too faint) */
}

/* Citation — italic, readable */
.citation {
  font-family: 'Source Serif 4', serif;
  font-style: italic;
  font-weight: 300;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.6;
  max-width: 580px;
  margin-top: 28px;
  padding-top: 16px;
  position: relative;
  opacity: 0.95;     /* was 0.85 */
}
.citation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 1px;
  background: currentColor;
}
.citation-source {
  display: block;
  font-style: normal;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 2.5px;
  margin-top: 14px;
  opacity: 0.6;
  text-transform: uppercase;
}

/* =============================================================
   AF TEXT REVEAL — char block-fill IN / OUT
   ============================================================= */
.reveal-ch {
  display: inline;          /* was inline-block — caused mid-word wraps */
  transition: background 0.18s ease-out, color 0.18s ease-out;
}
.reveal-target { visibility: hidden; }
.reveal-target.reveal-armed { visibility: visible; }
.reveal-target { text-wrap: balance; }   /* prevent ragged short tails */

.fade-target {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.42s cubic-bezier(0.2,0.8,0.2,1) 0.07s,
              transform 0.42s cubic-bezier(0.2,0.8,0.2,1) 0.07s;
}
.fade-target.fade-armed {
  opacity: 1;
  transform: translateY(0);
}
.fade-target.fade-disarmed {
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

/* =============================================================
   HEADER + MINIMAP — mix-blend-mode: difference auto-flips
   ============================================================= */
header.brand-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  padding: 22px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--paper);
  mix-blend-mode: difference;
  pointer-events: none;
  text-transform: uppercase;
}
header.brand-bar .refresh-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
header.brand-bar .refresh-pill::before {
  content: '';
  width: 5px; height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}

nav.minimap {
  position: fixed;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 14px;
  mix-blend-mode: difference;
  color: var(--paper);
}
nav.minimap a {
  display: block;
  width: 5px;
  height: 5px;
  border: 1px solid currentColor;
  border-radius: 50%;
  position: relative;
  text-decoration: none;
  opacity: 0.55;
  transition: opacity 220ms, transform 220ms, background 220ms;
}
nav.minimap a::after {
  content: attr(data-label);
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 220ms;
  pointer-events: none;
}
nav.minimap a:hover { opacity: 1; transform: scale(1.6); }
nav.minimap a:hover::after { opacity: 1; }
nav.minimap a.active {
  opacity: 1;
  background: currentColor;
}

/* =============================================================
   HERO meta strip
   ============================================================= */
.hero-meta {
  position: absolute;
  bottom: 56px;
  left: 8vw; right: 8vw;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  opacity: 0.55;
}
.hero-meta .scroll-cue::after {
  content: '  ↓';
  margin-left: 6px;
}

/* =============================================================
   §1.4 — section-tag + stage-counter (sits between header + content)
   ============================================================= */
.section-tag {
  position: absolute;
  top: 64px;
  left: 8vw;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  opacity: 0.75;
  z-index: 7;
}
.section-tag .num { font-weight: 600; opacity: 1; }

.stage-counter {
  position: absolute;
  top: 64px;
  right: 8vw;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 3px;
  opacity: 0.65;
  text-transform: uppercase;
  z-index: 7;
}

/* =============================================================
   LEVERS — typographic list, no boxes
   ============================================================= */
.levers {
  margin-top: 36px;
  border-top: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
}
.lever {
  display: grid;
  grid-template-columns: 50px 1fr auto;
  align-items: baseline;
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid currentColor;
  opacity: 0.95;
  transition: opacity 220ms, padding-left 220ms;
}
.lever:last-child { border-bottom: none; }
.lever:hover { opacity: 1; padding-left: 8px; }
.lever .num {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 2px;
  opacity: 0.6;
}
.lever .body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lever .name {
  font-family: 'Source Serif 4', serif;
  font-weight: 500;
  font-style: italic;
  font-size: clamp(20px, 2vw, 26px);
  letter-spacing: -0.4px;
  line-height: 1.1;
}
.lever .desc {
  font-style: italic;
  font-weight: 300;
  font-size: 14px;
  line-height: 1.55;
  opacity: 0.85;
}
.lever .effect {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.85;
  white-space: nowrap;
}

/* =============================================================
   CHART panel (§1.4-C)
   ============================================================= */
.chart-shell {
  width: 100%;
  height: clamp(320px, 50vh, 480px);   /* tighter to ensure fit */
  position: relative;
  margin-top: 18px;
}
.chart-shell .echart {
  position: absolute;
  inset: 0;
}
.chart-caption {
  margin-top: 18px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.55;
}

/* =============================================================
   MATH + VERDICT
   ============================================================= */
.math-line {
  font-size: 17px;
  margin: 10px 0;
  padding-left: 26px;
  position: relative;
}
.math-line::before {
  content: attr(data-step);
  position: absolute;
  left: 0;
  top: 4px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 1.5px;
  opacity: 0.5;
}

.verdict {
  margin-top: 36px;
  padding: 28px 0 24px;
  border-top: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  text-align: center;
}
.verdict .verdict-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 14px;
  opacity: 0.7;
}
.verdict .verdict-text {
  font-family: 'Source Serif 4', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(28px, 3.6vw, 48px);
  letter-spacing: -0.7px;
  line-height: 1.15;
}
.verdict .verdict-text em {
  font-style: italic;
  font-weight: 600;     /* heaviest emphasis, but not screaming */
}

/* =============================================================
   MORE — TOC grid
   ============================================================= */
.toc {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 36px;
  row-gap: 0;
  margin-top: 36px;
}
.toc-item {
  padding: 14px 0;
  border-top: 1px solid currentColor;       /* hairlines only on top of each row */
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0.85;
  transition: opacity 220ms, padding-left 220ms;
}
.toc-item:hover { opacity: 1; padding-left: 6px; }
.toc-item .num {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 2px;
  opacity: 0.7;
}
.toc-item .ttl {
  font-family: 'Source Serif 4', serif;
  font-weight: 400;
  font-size: 15px;
  letter-spacing: -0.2px;
  line-height: 1.25;
}
.toc-item .ttl em {
  font-weight: 300;
  font-style: italic;
}

footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 6;
  padding: 18px 36px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 400;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  color: var(--paper);
  mix-blend-mode: difference;
  opacity: 0.5;
}
footer a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  pointer-events: auto;
}

/* =============================================================
   RESPONSIVE
   ============================================================= */
@media (max-width: 900px) {
  nav.minimap { display: none; }
  .lever { grid-template-columns: 36px 1fr; gap: 16px; }
  .lever .effect { grid-column: 2; padding-top: 6px; }
  .toc { grid-template-columns: repeat(2, 1fr); column-gap: 24px; }
  h1 { font-size: clamp(56px, 14vw, 96px); }
  h2 { font-size: clamp(40px, 11vw, 72px); }
  .display-italic { font-size: clamp(32px, 9vw, 64px); }
  footer { padding: 14px 20px; flex-direction: column; gap: 6px; align-items: flex-start; }
}
</style>
</head>'''


def build_html_head() -> str:
    """Return the HTML <head> block verbatim from prototype-v4.html (lines 1-658)."""
    return HTML_HEAD


SECTION_IDS = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7",
               "2.1", "2.2", "2.3", "2.4", "2.5"]
STAGES = ["A", "B", "C", "D"]


def all_slide_ids() -> list[str]:
    """Return all 51 slide IDs in scroll order. Format: hero/intro/1-N-A.../more."""
    ids = ["hero", "intro"]
    for section in SECTION_IDS:
        section_dashed = section.replace(".", "-")  # "1.1" -> "1-1"
        for stage in STAGES:
            ids.append(f"{section_dashed}-{stage}")
    ids.append("more")
    if len(ids) != 51:
        raise ValueError(f"expected 51 slide IDs, got {len(ids)}")
    return ids


def build_header() -> str:
    """Fixed-top header with mix-blend-mode brand mark + refresh-pill."""
    return (
        '<header class="brand-bar">\n'
        '  <div>DALIO &nbsp;·&nbsp; ECONOMIC FRAMEWORK &nbsp;·&nbsp; v0.4</div>\n'
        '  <div class="refresh-pill" id="refresh-pill"><span>live · refreshed 0s ago</span></div>\n'
        '</header>\n'
    )


def build_minimap(slide_ids: list[str]) -> str:
    """Fixed right-edge column of dots, mix-blend-mode auto-flip.

    First dot has class="active". Each <a> has href="#slot-{id}", data-slide,
    and a human-readable data-label (uppercase, with dots and slashes for sections).
    """
    def label_for(sid: str) -> str:
        # "hero" -> "HERO"; "intro" -> "INTRO"; "more" -> "MORE"
        # "1-4-A" -> "1.4 / A"; "2-5-D" -> "2.5 / D"
        if sid in ("hero", "intro", "more"):
            return sid.upper()
        # Format: M-N-X -> M.N / X
        parts = sid.split("-")
        if len(parts) == 3:
            return f"{parts[0]}.{parts[1]} / {parts[2]}"
        return sid.upper()

    dots = []
    for i, sid in enumerate(slide_ids):
        active_class = ' class="active"' if i == 0 else ''
        dots.append(
            f'  <a href="#slot-{sid}" data-slide="{sid}" '
            f'data-label="{label_for(sid)}"{active_class}></a>'
        )
    dots_html = "\n".join(dots)
    return f'<nav class="minimap" aria-label="page navigation">\n{dots_html}\n</nav>\n'


def build_footer() -> str:
    """Fixed bottom footer with brand + GitHub link + version stamp."""
    return (
        '<footer>\n'
        '  <div>DALIO &nbsp;·&nbsp; <a href="#">/raydalioattitude</a></div>\n'
        '  <div>v0.4 &nbsp;·&nbsp; 2026-05</div>\n'
        '</footer>\n'
    )


def build_hero_slide() -> str:
    """Return the HERO slide HTML block — chrome, dark bg, first slide (.active).

    Structure mirrors prototype-v4.html lines 688-699 (functionally equivalent;
    data-text uses literal `<br>`/`<em>` rather than the prototype's HTML-entity
    encoding — both produce identical DOM via dataset.text + innerHTML at runtime):
    - Outer div: class="slide active" data-slide="hero" data-bg="dark"
    - slide-inner: eyebrow + h1 (AF reveal-target, content in data-text) + subtitle
    - hero-meta: OUTSIDE slide-inner per prototype convention; contains source strip + SCROLL cue
    """
    return (
        '<div class="slide active" data-slide="hero" data-bg="dark">\n'
        '  <div class="slide-inner">\n'
        '    <div class="eyebrow fade-target">RAY DALIO &nbsp;·&nbsp; THE TEMPLATE &nbsp;·&nbsp; 12 FRAMEWORKS, ONE PAGE</div>\n'
        '    <h1 class="reveal-target" data-text="How he sees<br><em>the economy.</em>"></h1>\n'
        '    <p class="subtitle fade-target">Twelve interlocking models — debt cycles, deleveragings, all-weather, stress tests — assembled from primary Bridgewater sources, parameterised, and rendered live.</p>\n'
        '  </div>\n'
        '  <div class="hero-meta fade-target">\n'
        '    <div>NOWANDFUTURES &nbsp;·&nbsp; LINKEDIN &nbsp;·&nbsp; PRINCIPLES (CWO)</div>\n'
        '    <div class="scroll-cue">SCROLL</div>\n'
        '  </div>\n'
        '</div>\n'
    )


def main() -> None:
    """Build entry point. Will be filled in subsequent tasks."""
    pass


if __name__ == "__main__":
    main()
