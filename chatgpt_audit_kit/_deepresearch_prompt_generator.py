"""
Generator: combines `_deepresearch_prompt_template.md` and
`_deepresearch_prompt_registry.py` into per-topic prompt files at
`chatgpt_audit_kit/_deepresearch_prompt_{seq}_{slug}.md`.

Run:
    python chatgpt_audit_kit/_deepresearch_prompt_generator.py [seq]

If `seq` is omitted, generates all 12. If given (e.g., `04`), generates
that topic only.

Slot syntax in the template:
    {ID}, {TITLE}, {SEQ}, {slug}, {SCOPE_IN}, {SCOPE_OUT},
    {NAMED_COMPONENTS_BLOCK}, {EXPECTED_CASES_BLOCK}, {EXPECTED_CASES_MIN},
    {TIER1_SOURCES_BLOCK}, {TIER1_SOURCES_MIN}.

The `{...BLOCK}` slots are formatted as Markdown bulleted lists by this
generator from the registry's structured fields. All other slots are
plain string substitutions.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _deepresearch_prompt_registry import REGISTRY, all_seqs  # noqa: E402

ROOT = Path(__file__).parent
TEMPLATE_PATH = ROOT / "_deepresearch_prompt_template.md"


def _format_named_components(components: list[dict]) -> str:
    """Render named_components as a Markdown bullet list. The template's
    slot line has no leading whitespace (the block self-indents). First
    line starts at column 2 to match the surrounding section text; sub-
    lines align under the bullet text."""
    if not components:
        return "  (no distinct framework components named for this topic)"
    lines = []
    for i, c in enumerate(components, start=1):
        items_str = "; ".join(c["items"])
        lines.append(f"  {i}. **{c['name']}** — items: {items_str}")
        lines.append(f"     Dalio anchor: {c['dalio_anchor']}")
        lines.append(f"     Operationalization required: {c['operationalization']}")
    return "\n".join(lines)


def _format_cases(allowlist: list[str]) -> str:
    """Render expected_cases.allowlist as a Markdown bullet list with
    4-space leading indentation (one level deeper than section text)."""
    return "\n".join(f"    - {c}" for c in allowlist)


def _format_sources(allowlist: list[str]) -> str:
    """Render tier1_sources.allowlist as a Markdown bullet list with
    4-space leading indentation."""
    return "\n".join(f"    - {s}" for s in allowlist)


def _build_pilot_context_block(entry: dict) -> str:
    """Build the human-readable pilot-context block at the top of the
    generated file (above the PROMPT block). Replaces the placeholder
    block in the template."""
    return (
        f"## Pilot context (for the human user, NOT included in the prompt)\n\n"
        f"- **Topic:** {entry['id']} {entry['title']}.\n"
        f"- **Project:** consolidates Ray Dalio's investment + macro frameworks "
        f"into 3 operational artifacts (`README.md`, `dalio_dashboard.html`, "
        f"`dalio_model.xlsx`) for portfolio managers. The 12 research files "
        f"are the source material the artifacts are built from.\n"
        f"- **Failure modes the prompt must prevent:** depth shortfall, "
        f"hard-rule violation, framing/scope drift, hallucinated or weakly-"
        f"sourced citations, surviving open questions in the output, "
        f"abandoned framework components, paraphrase disguised as verbatim, "
        f"manufactured words inside Dalio quote blocks.\n"
        f"- **Outcome standard:** COMPLETE + CONCLUSIVE. Every threshold, "
        f"formula, decision rule, and worked-example number cited at point of "
        f"use, with zero unresolved gaps in the output. Every named framework "
        f"component operationalized per R17.\n"
        f"- **Source priority (HARD):** Dalio's own public corpus is presumed "
        f"gap-free at the framework level. The prompt forces exhaustive Dalio-"
        f"corpus search BEFORE any non-Dalio source may be introduced. Non-"
        f"Dalio sources are restricted to a TOP-quality allowlist and may only "
        f"close real gaps after Dalio exhaustion is documented in §11.\n"
        f"- **Quote audit:** Every `> **Dalio**` block in the output must have "
        f"a byte-equal entry in the `_quote_audit.md` appendix per R21.\n"
    )


def _substitute_slots(template_text: str, entry: dict) -> str:
    """Apply all slot substitutions for a single topic. Slot syntax is
    `<<<NAME>>>` (chosen to avoid collision with example uses of `{ID}`
    and similar inside instruction prose)."""
    named_block = _format_named_components(entry["named_components"])
    cases_block = _format_cases(entry["expected_cases"]["allowlist"])
    sources_block = _format_sources(entry["tier1_sources"]["allowlist"])

    text = template_text
    text = text.replace("<<<ID>>>", entry["id"])
    text = text.replace("<<<TITLE>>>", entry["title"])
    text = text.replace("<<<SEQ>>>", entry["seq"])
    text = text.replace("<<<slug>>>", entry["slug"])
    text = text.replace("<<<SCOPE_IN>>>", entry["scope_in"])
    text = text.replace("<<<SCOPE_OUT>>>", entry["scope_out"])
    text = text.replace("<<<NAMED_COMPONENTS_BLOCK>>>", named_block)
    text = text.replace("<<<EXPECTED_CASES_BLOCK>>>", cases_block)
    text = text.replace("<<<EXPECTED_CASES_MIN>>>", str(entry["expected_cases"]["min"]))
    text = text.replace("<<<TIER1_SOURCES_BLOCK>>>", sources_block)
    text = text.replace("<<<TIER1_SOURCES_MIN>>>", str(entry["tier1_sources"]["min"]))

    # Replace the pilot-context placeholder paragraph with the topic-
    # specific block.
    placeholder_block = (
        "## Pilot context (for the human user; injected per-topic by the generator)\n\n"
        "This block is replaced by the generator with topic-specific context. "
        "The PROMPT block below is what gets pasted into ChatGPT Pro Deep Research.\n"
    )
    if placeholder_block in text:
        text = text.replace(placeholder_block, _build_pilot_context_block(entry))

    return text


def generate_one(seq: str) -> Path:
    """Generate the per-topic prompt file for the given sequence string."""
    entry = REGISTRY[seq]
    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    text = _substitute_slots(template_text, entry)

    out_path = ROOT / f"_deepresearch_prompt_{entry['seq']}_{entry['slug']}.md"
    out_path.write_text(text, encoding="utf-8")
    return out_path


def generate_all() -> list[Path]:
    """Generate per-topic prompt files for all 12 topics."""
    return [generate_one(seq) for seq in all_seqs()]


if __name__ == "__main__":
    if len(sys.argv) > 1:
        seq = sys.argv[1].zfill(2)
        if seq not in REGISTRY:
            print(f"ERROR: seq '{seq}' not in registry. Valid seqs: {all_seqs()}")
            sys.exit(1)
        path = generate_one(seq)
        print(f"GENERATED: {path}")
    else:
        paths = generate_all()
        for p in paths:
            print(f"GENERATED: {p}")
        print(f"\nTotal: {len(paths)} files.")
