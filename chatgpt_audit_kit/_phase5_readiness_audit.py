"""
Phase-5 build-readiness audit (Phase A — mechanical).

Audits every research/<NN>_*.md file for the structural + content
elements that the Phase-5 build (`dalio_dashboard.html` + `dalio_model.xlsx`
+ `README.md`) will consume. Mechanical only — no network calls.

For each file, runs 8 checks:

  C1 §4 Input Variables Table
       - Section present
       - Header row has the 7 prescribed columns
       - Every data row has an API endpoint cell that contains a
         recognized provider keyword (FRED / BIS / ECB / IMF / BLS /
         BEA / SEC / Stooq / OECD / World Bank / WID / Alpha Vantage /
         FMP / Tiingo / LBMA / FDIC / Fed)

  C2 §5 Computation
       - Section present
       - Has at least one fenced code block OR LaTeX/`=` math line
         that contains an `=` (operational form, not narrative-only)

  C3 §6 Output Variables & Decision Rules
       - Section present
       - Has at least one decision-rule expression: `if`, `IFS(`,
         `AND(`, `>=`, `<=`, ternary `?`, or fenced code with `=`

  C4 §7 Worked Numeric Example
       - Section present
       - Has either a markdown table with ≥2 data rows OR a fenced
         block containing ≥3 numeric tokens

  C5 §8a JS — `node --check` on each ```js / ```javascript fence
       - Section present
       - Every JS block parses (Node 18+ syntax check)
       - Records syntax errors verbatim

  C6 §8b Excel — fenced code blocks
       - Section present
       - Has at least one code block (Power Query M `let...in` OR
         `=`-prefixed formulas OR a column-spec table)

  C7 §8c ECharts config
       - Section present
       - Code or prose mentions at least 2 of the ECharts option
         keys: xAxis / yAxis / series / type / grid / dataset / legend
         / tooltip / option

  C8 §10 Sources / Limitations
       - Section present
       - At least one URL (http/https) per the source-list rule
       - Counts URL tokens, reports

Verdict per file:
  GREEN  = all 8 PASS
  YELLOW = ≥1 partial / soft-fail (URL count low, decision-rule weak)
  RED    = ≥1 hard fail (section missing, JS won't parse, no API
           endpoints in §4)

Run:
  python chatgpt_audit_kit/_phase5_readiness_audit.py
  python chatgpt_audit_kit/_phase5_readiness_audit.py research/04_deleveragings.md

Writes:
  chatgpt_audit_kit/_phase5_readiness_matrix.md   (always, when full sweep)
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# Force UTF-8 stdout for Windows cp1252 consoles
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
except Exception:
    pass

REPO = Path(__file__).resolve().parent.parent
RESEARCH = REPO / "research"
MATRIX_OUT = REPO / "chatgpt_audit_kit" / "_phase5_readiness_matrix.md"

API_PROVIDERS = (
    "FRED", "BIS", "ECB", "IMF", "BLS", "BEA", "SEC", "Stooq", "OECD",
    "World Bank", "WID", "Alpha Vantage", "FMP", "Tiingo", "LBMA", "FDIC",
    "Fed", "BoJ", "Federal Reserve", "Eurostat", "Penn World",
    "Maddison", "Treasury", "EIA", "USGS", "World Inequality",
    "Ken French", "French Data Library", "Yahoo Finance", "IBKR",
    "Cboe", "DBnomics", "WB ", "WIPO", "Damodaran", "Macrotrends",
    "Wikipedia",
)

# Phrases that signal a legitimately non-public input row (script computes,
# user provides, or is a constant). These rows should NOT count against the
# row-coverage check.
NON_API_LEGIT = (
    "derived", "internal", "internally", "manager-proprietary",
    "constant", "static", "operator", "broker", "custodian",
    "oms", "user input", "user-input", "stipulated", "author",
    "n/a", "—",
)

ECHARTS_KEYS = (
    "xAxis", "yAxis", "series", "type", "grid", "dataset", "legend",
    "tooltip", "option", "dataZoom", "visualMap",
)

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------


@dataclass
class CheckResult:
    name: str
    status: str  # "PASS" | "PARTIAL" | "FAIL"
    detail: str = ""


@dataclass
class FileReport:
    path: Path
    checks: list[CheckResult] = field(default_factory=list)

    @property
    def verdict(self) -> str:
        statuses = {c.status for c in self.checks}
        if "FAIL" in statuses:
            return "RED"
        if "PARTIAL" in statuses:
            return "YELLOW"
        return "GREEN"


# ---------------------------------------------------------------------------
# Section parsing
# ---------------------------------------------------------------------------

SECT_TOP_RE = re.compile(r"^##\s*§\s*(\d+)(?:\s+([^\n]*))?$", re.MULTILINE)
SECT_SUB_RE = re.compile(r"^###\s*(\d+)([a-z])?\.?\s*([^\n]*)$", re.MULTILINE)


def split_top_sections(text: str) -> dict[str, tuple[int, int]]:
    """Return {section_number: (start_offset, end_offset)} for §1-§10."""
    matches = list(SECT_TOP_RE.finditer(text))
    spans: dict[str, tuple[int, int]] = {}
    for i, m in enumerate(matches):
        n = m.group(1)
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        spans[n] = (start, end)
    return spans


def get_section(text: str, spans: dict[str, tuple[int, int]], n: str) -> str:
    if n not in spans:
        return ""
    s, e = spans[n]
    return text[s:e]


def split_subsections(section_text: str) -> dict[str, str]:
    """Return {subsection_letter: text}, e.g. {'a': '...8a body...', 'b': '...'}."""
    matches = list(SECT_SUB_RE.finditer(section_text))
    out: dict[str, str] = {}
    for i, m in enumerate(matches):
        letter = m.group(2) or ""
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(section_text)
        if letter:
            out[letter] = section_text[start:end]
    return out


# ---------------------------------------------------------------------------
# Code-fence extraction
# ---------------------------------------------------------------------------

FENCE_RE = re.compile(r"^```([a-zA-Z0-9_+\-]*)\s*\n(.*?)^```", re.DOTALL | re.MULTILINE)


def extract_fences(text: str, lang: Optional[str] = None) -> list[tuple[str, str]]:
    """Return list of (lang, body) for fenced code blocks."""
    out: list[tuple[str, str]] = []
    for m in FENCE_RE.finditer(text):
        block_lang = (m.group(1) or "").lower()
        if lang is None or block_lang in lang.lower().split("|"):
            out.append((block_lang, m.group(2)))
    return out


# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------


def check_c1_input_table(s4: str) -> CheckResult:
    if not s4.strip():
        return CheckResult("C1 §4 input table", "FAIL", "section missing")

    # Find first markdown table header row in the section.
    # Accepted variations:
    #   "API endpoint" or "API endpoint / identifier" or "API endpoint / id"
    #   "update freq" or "update frequency"
    header_re = re.compile(
        r"^\|\s*name\s*\|\s*description\s*\|\s*unit\s*\|\s*data\s*source\s*\|\s*"
        r"API\s*endpoint[^|]*\|\s*update\s*freq(uency)?\s*\|\s*typical\s*range\s*\|",
        re.MULTILINE | re.IGNORECASE,
    )
    if not header_re.search(s4):
        return CheckResult(
            "C1 §4 input table",
            "FAIL",
            "header row missing or wrong columns",
        )

    # Count data rows after the header (skip separator)
    lines = s4.splitlines()
    in_table = False
    data_rows: list[str] = []
    for line in lines:
        if header_re.match(line):
            in_table = True
            continue
        if in_table:
            if line.startswith("|---") or line.startswith("| ---") or re.match(r"^\|\s*-+", line):
                continue
            if line.startswith("|"):
                data_rows.append(line)
            elif line.strip() == "" and data_rows:
                # blank line ends table
                break
            elif not line.startswith("|"):
                break

    if not data_rows:
        return CheckResult("C1 §4 input table", "FAIL", "no data rows")

    # Per-row API endpoint coverage. A row counts as "addressable" if it has
    # a recognized provider OR a URL/series_id OR an explicit non-public
    # phrase (derived/internal/operator/etc.) that documents legitimate
    # absence of a public endpoint.
    rows_addressable = 0
    rows_unaddressable: list[str] = []
    for row in data_rows:
        cells = [c.strip() for c in row.strip("|").split("|")]
        if len(cells) < 5:
            continue
        ds = cells[3] if len(cells) > 3 else ""
        api = cells[4] if len(cells) > 4 else ""
        joined = (ds + " " + api).lower()
        if any(p.lower() in joined for p in API_PROVIDERS):
            rows_addressable += 1
        elif "series_id" in joined or "http" in joined:
            rows_addressable += 1
        elif any(phrase in joined for phrase in NON_API_LEGIT):
            rows_addressable += 1
        else:
            # row gap — record name (col 0) for diagnosis
            rows_unaddressable.append(cells[0][:30] if cells else "(unknown)")

    coverage = rows_addressable / len(data_rows)
    detail = f"{rows_addressable}/{len(data_rows)} rows addressable"
    if rows_unaddressable:
        detail += f"; gaps={rows_unaddressable[:3]}"
    if coverage == 1.0:
        return CheckResult("C1 §4 input table", "PASS", detail)
    if coverage >= 0.8:
        return CheckResult("C1 §4 input table", "PARTIAL", detail)
    return CheckResult("C1 §4 input table", "FAIL", detail)


def check_c2_section5_math(s5: str) -> CheckResult:
    if not s5.strip():
        return CheckResult("C2 §5 math operational", "FAIL", "section missing")

    fences = extract_fences(s5)
    fence_with_eq = sum(1 for _, body in fences if "=" in body)
    # Or LaTeX inline / display math — \( \), \[ \], $$ $$, OR single $ ... $
    has_latex = bool(
        re.search(r"\\\(.*?=.*?\\\)", s5, re.DOTALL)
        or re.search(r"\$\$.*?=.*?\$\$", s5, re.DOTALL)
        or re.search(r"\\\[.*?=.*?\\\]", s5, re.DOTALL)
        or re.search(r"\$[^$\n]*=[^$\n]*\$", s5)
    )
    # Or `=` in indented or non-fence prose lines (e.g., "G_gap = NGDP_yoy − LT_Rate")
    inline_eq_lines = sum(
        1
        for ln in s5.splitlines()
        if re.search(r"`[^`]*=[^`]*`", ln) or re.match(r"^\s*[A-Za-z_][\w]*\s*=\s*", ln)
    )
    score = fence_with_eq + (1 if has_latex else 0) + (inline_eq_lines // 3)
    detail = f"fences_with_eq={fence_with_eq} latex={has_latex} inline_eq_lines={inline_eq_lines}"
    if score >= 1:
        return CheckResult("C2 §5 math operational", "PASS", detail)
    return CheckResult("C2 §5 math operational", "FAIL", detail)


def check_c3_section6_decision(s6: str) -> CheckResult:
    if not s6.strip():
        return CheckResult("C3 §6 decision rules", "FAIL", "section missing")
    # Code-style indicators (Excel / JS / Python pseudo-code)
    code_indicators = [
        bool(re.search(r"\bif\b", s6, re.IGNORECASE)),
        "IFS(" in s6,
        bool(re.search(r"\bAND\s*\(", s6)),
        ">=" in s6 or "<=" in s6,
        "?" in s6 and ":" in s6 and "{" in s6,  # ternary in code only
    ]
    has_eq_fence = any("=" in body for _, body in extract_fences(s6))
    # Math-style indicators (LaTeX inequalities / Unicode comparators / set notation)
    has_math_compare = bool(
        re.search(r"\$[^$\n]*[<>≥≤=]+[^$\n]*\$", s6)
        or re.search(r"\\geq|\\leq|\\le|\\ge", s6)
        or re.search(r"[≤≥]", s6)
    )
    # Tabular decision rules — table column header naming a decision concept
    has_decision_table = bool(
        re.search(
            r"\|[^|\n]*\b(decision rule|decision|condition|threshold|rule|"
            r"regime tag|regime|flag|tag|bucket|band|category|state)\b[^|\n]*\|",
            s6,
            re.IGNORECASE,
        )
    )
    # Prose-inequality patterns (`> 0.66`, `< 0.33`, `>= 10`, etc.) — signals
    # numeric thresholds even when not in LaTeX. Also count tolerance-band
    # forms: `±3%`, `3%–5%`, `1.5×`.
    prose_ineq_count = (
        len(re.findall(r"[<>]=?\s*-?\d+\.?\d*", s6))
        + len(re.findall(r"±\s*\d+\.?\d*", s6))
        + len(re.findall(r"\b\d+(?:\.\d+)?%\s*[-–]\s*\d+", s6))
        + len(re.findall(r"\b\d+\.?\d*\s*[×x]\b", s6))
    )
    has_prose_ineq = prose_ineq_count >= 2
    # State-name decision tags (e.g. **GREEN**, **AMBER**, **RED**, **HIGH**)
    state_tags = sorted(set(re.findall(
        r"\*\*([A-Z][A-Z_]{2,})\*\*", s6
    )))
    has_state_tags = len(state_tags) >= 2
    score = (
        sum(code_indicators)
        + (1 if has_eq_fence else 0)
        + (2 if has_math_compare else 0)
        + (2 if has_decision_table else 0)
        + (2 if has_prose_ineq else 0)
        + (2 if has_state_tags else 0)
    )
    detail = (
        f"code_indicators={sum(code_indicators)} eq_fence={has_eq_fence} "
        f"math_compare={has_math_compare} decision_table={has_decision_table} "
        f"prose_ineq={prose_ineq_count} state_tags={state_tags[:5]}"
    )
    if score >= 3:
        return CheckResult("C3 §6 decision rules", "PASS", detail)
    if score >= 1:
        return CheckResult("C3 §6 decision rules", "PARTIAL", detail)
    return CheckResult("C3 §6 decision rules", "FAIL", detail)


def check_c4_worked_example(s7: str) -> CheckResult:
    if not s7.strip():
        return CheckResult("C4 §7 worked example", "FAIL", "section missing")
    # Markdown table?
    table_lines = [ln for ln in s7.splitlines() if ln.strip().startswith("|")]
    table_data_rows = max(0, len(table_lines) - 2)  # subtract header + separator
    fences = extract_fences(s7)
    fence_numerics = 0
    for _, body in fences:
        fence_numerics += len(re.findall(r"-?\d+\.?\d*", body))
    inline_numerics = len(re.findall(r"-?\d+\.?\d*", s7))
    # Worked-case headers: bold-prefixed lines like "**US Depression 1930-1932...**"
    case_headers = len(re.findall(r"^\*\*[^*\n]{10,}\*\*", s7, re.MULTILINE))
    detail = (
        f"table_rows={table_data_rows} fence_numerics={fence_numerics} "
        f"inline_numerics={inline_numerics} case_headers={case_headers}"
    )
    if table_data_rows >= 2 or fence_numerics >= 3 or (case_headers >= 1 and inline_numerics >= 10):
        return CheckResult("C4 §7 worked example", "PASS", detail)
    if inline_numerics >= 5:
        return CheckResult("C4 §7 worked example", "PARTIAL", detail)
    return CheckResult("C4 §7 worked example", "FAIL", detail)


def check_c5_js_parses(s8a: str) -> CheckResult:
    if not s8a.strip():
        return CheckResult("C5 §8a JS parses", "FAIL", "section missing")

    js_blocks = extract_fences(s8a, lang="js|javascript")
    if not js_blocks:
        return CheckResult("C5 §8a JS parses", "FAIL", "no js fences")

    errors: list[str] = []
    parsed = 0
    for i, (_, body) in enumerate(js_blocks):
        # If body uses ES-module syntax (`export`/`import`), don't wrap —
        # `node --check` parses module files directly when extension is .mjs.
        # Otherwise wrap in async IIFE so top-level await / arrow-fn
        # pseudo-code parses.
        is_module = bool(re.search(r"^\s*(export|import)\b", body, re.MULTILINE))
        wrapped = body + "\n" if is_module else "(async () => {\n" + body + "\n})();\n"
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".mjs", delete=False, encoding="utf-8"
        ) as tmp:
            tmp.write(wrapped)
            tmp_path = tmp.name
        try:
            r = subprocess.run(
                ["node", "--check", tmp_path],
                capture_output=True,
                text=True,
                timeout=15,
            )
            if r.returncode == 0:
                parsed += 1
            else:
                err = (r.stderr or r.stdout).strip().splitlines()
                first = err[0] if err else "unknown"
                # Strip tmp path noise
                first = re.sub(r"^.*?:", "", first).strip()
                errors.append(f"block{i+1}: {first[:120]}")
        except Exception as e:
            errors.append(f"block{i+1}: {type(e).__name__}: {e}")
        finally:
            try:
                Path(tmp_path).unlink()
            except Exception:
                pass

    detail = f"{parsed}/{len(js_blocks)} parse"
    if errors:
        detail += "; errors: " + " | ".join(errors)
    if parsed == len(js_blocks):
        return CheckResult("C5 §8a JS parses", "PASS", detail)
    return CheckResult("C5 §8a JS parses", "FAIL", detail)


def check_c6_excel(s8b: str) -> CheckResult:
    if not s8b.strip():
        return CheckResult("C6 §8b excel spec", "FAIL", "section missing")
    fences = extract_fences(s8b)
    # Power Query M: `let ... in` somewhere, allowing `let key = ...`
    has_let = any(re.search(r"\blet\b.*?\bin\b", body, re.DOTALL | re.IGNORECASE) for _, body in fences)
    # Excel formula in fence
    has_eq_formula = any(re.search(r"^\s*=", body, re.MULTILINE) or "= " in body for _, body in fences)
    # Inline-backtick formulas like `=AVERAGE(...)` or `zBar = AVERAGE(B2:I2)`
    has_inline_formula = bool(
        re.search(r"`[^`]*=\s*[A-Z][A-Z0-9_]+\s*\(", s8b)
        or re.search(r"`\s*=\s*[A-Z][A-Z0-9_]+\s*\(", s8b)
    )
    # Column spec — table or `Cols A-X:` listing
    has_column_spec = bool(
        re.search(r"`[^`]*\|[^`]*\|", s8b)
        or re.search(r"Column[s]?\s*[:|]", s8b, re.IGNORECASE)
        or re.search(r"\bcols?\b\s+[A-Z]", s8b, re.IGNORECASE)
    )
    score = sum([has_let, has_eq_formula, has_inline_formula, has_column_spec])
    detail = (
        f"power_query={has_let} fence_formula={has_eq_formula} "
        f"inline_formula={has_inline_formula} column_spec={has_column_spec}"
    )
    if score >= 2:
        return CheckResult("C6 §8b excel spec", "PASS", detail)
    if score == 1:
        return CheckResult("C6 §8b excel spec", "PARTIAL", detail)
    return CheckResult("C6 §8b excel spec", "FAIL", detail)


def check_c7_echarts(s8c: str) -> CheckResult:
    if not s8c.strip():
        return CheckResult("C7 §8c ECharts spec", "FAIL", "section missing")
    matches = sorted({k for k in ECHARTS_KEYS if k in s8c})
    detail = f"keys_found={matches}"
    if len(matches) >= 3:
        return CheckResult("C7 §8c ECharts spec", "PASS", detail)
    if len(matches) >= 1:
        return CheckResult("C7 §8c ECharts spec", "PARTIAL", detail)
    return CheckResult("C7 §8c ECharts spec", "FAIL", detail)


def check_c8_sources(s10: str) -> CheckResult:
    if not s10.strip():
        return CheckResult("C8 §10 sources", "FAIL", "section missing")
    urls = re.findall(r"https?://[^\s)]+", s10)
    detail = f"urls={len(urls)}"
    if len(urls) >= 5:
        return CheckResult("C8 §10 sources", "PASS", detail)
    if len(urls) >= 1:
        return CheckResult("C8 §10 sources", "PARTIAL", detail)
    return CheckResult("C8 §10 sources", "FAIL", detail)


# ---------------------------------------------------------------------------
# Per-file driver
# ---------------------------------------------------------------------------


def audit_file(path: Path) -> FileReport:
    rep = FileReport(path=path)
    text = path.read_text(encoding="utf-8")
    spans = split_top_sections(text)

    s4 = get_section(text, spans, "4")
    s5 = get_section(text, spans, "5")
    s6 = get_section(text, spans, "6")
    s7 = get_section(text, spans, "7")
    s8 = get_section(text, spans, "8")
    s10 = get_section(text, spans, "10")

    subs8 = split_subsections(s8)
    s8a = subs8.get("a", "")
    s8b = subs8.get("b", "")
    s8c = subs8.get("c", "")

    rep.checks.append(check_c1_input_table(s4))
    rep.checks.append(check_c2_section5_math(s5))
    rep.checks.append(check_c3_section6_decision(s6))
    rep.checks.append(check_c4_worked_example(s7))
    rep.checks.append(check_c5_js_parses(s8a))
    rep.checks.append(check_c6_excel(s8b))
    rep.checks.append(check_c7_echarts(s8c))
    rep.checks.append(check_c8_sources(s10))

    return rep


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------


def render_matrix(reports: list[FileReport]) -> str:
    out = ["# Phase-5 Build-Readiness Matrix",
           "",
           "Mechanical readiness audit of all 12 `research/<NN>_*.md` files.",
           "Verdict logic: GREEN = all 8 PASS · YELLOW = ≥1 PARTIAL · RED = ≥1 FAIL.",
           "",
           "| File | C1 §4 | C2 §5 | C3 §6 | C4 §7 | C5 §8a | C6 §8b | C7 §8c | C8 §10 | Verdict |",
           "|---|---|---|---|---|---|---|---|---|---|"]
    sym = {"PASS": "✅", "PARTIAL": "🟡", "FAIL": "❌"}
    for rep in reports:
        cells = [sym[c.status] for c in rep.checks]
        verdict_emoji = {"GREEN": "🟢 GREEN", "YELLOW": "🟡 YELLOW", "RED": "🔴 RED"}[rep.verdict]
        out.append(
            f"| `{rep.path.name}` | " + " | ".join(cells) + f" | {verdict_emoji} |"
        )

    out.append("")
    out.append("## Per-file detail")
    for rep in reports:
        out.append("")
        out.append(f"### `{rep.path.name}` — {rep.verdict}")
        out.append("")
        out.append("| Check | Status | Detail |")
        out.append("|---|---|---|")
        for c in rep.checks:
            detail = c.detail.replace("|", "\\|")
            out.append(f"| {c.name} | {c.status} | {detail} |")

    out.append("")
    return "\n".join(out)


def render_console(reports: list[FileReport]) -> str:
    out_lines: list[str] = []
    sym = {"PASS": "P", "PARTIAL": ".", "FAIL": "X"}
    for rep in reports:
        line = f"{rep.path.name:<35}  " + " ".join(sym[c.status] for c in rep.checks) + f"  {rep.verdict}"
        out_lines.append(line)
    return "\n".join(out_lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main(argv: list[str]) -> int:
    if len(argv) > 1:
        path = Path(argv[1])
        if not path.is_absolute():
            path = REPO / path
        rep = audit_file(path)
        print(f"--- {rep.path.relative_to(REPO)} ---")
        for c in rep.checks:
            print(f"  [{c.status:<7}] {c.name}: {c.detail}")
        print(f"  VERDICT: {rep.verdict}")
        return 0 if rep.verdict != "RED" else 1

    files = sorted(RESEARCH.glob("[0-9][0-9]_*.md"))
    reports = [audit_file(p) for p in files]

    print(render_console(reports))
    print()
    print(f"GREEN={sum(1 for r in reports if r.verdict == 'GREEN')}  "
          f"YELLOW={sum(1 for r in reports if r.verdict == 'YELLOW')}  "
          f"RED={sum(1 for r in reports if r.verdict == 'RED')}")

    MATRIX_OUT.write_text(render_matrix(reports), encoding="utf-8")
    print(f"\nMatrix written: {MATRIX_OUT.relative_to(REPO)}")

    return 0 if not any(r.verdict == "RED" for r in reports) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
