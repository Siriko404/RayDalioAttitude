"""
Generator: combines `_deepresearch_prompt_template.md` and
`_deepresearch_prompt_registry.py` into per-topic prompt files at
`chatgpt_audit_kit/_deepresearch_prompt_{seq}_{slug}.md`.

CONTENT-FREE BY DESIGN. The generator only substitutes structural
identifiers (id, title, seq, slug) and a SUBSECTION_MAP that lists
all 12 subsections with the current one marked. It does NOT inject
named framework components, expected historical cases, Tier-1 source
allowlists, or any content that would bias the deep-research model.
The model MUST discover Dalio's framework structure by primary reading.

Run:
    python chatgpt_audit_kit/_deepresearch_prompt_generator.py [seq]

If `seq` is omitted, generates all 12. If given (e.g., `04`), generates
that topic only.

Slot syntax (chosen as `<<<NAME>>>` to avoid collision with the curly-
brace `{NAME}` mentions in instruction prose):
    <<<ID>>>             — registry entry `id` (e.g., `1.4`)
    <<<TITLE>>>          — registry entry `title`
    <<<SEQ>>>            — registry entry `seq` (e.g., `04`)
    <<<slug>>>           — registry entry `slug`
    <<<SUBSECTION_MAP>>> — bulleted list of all 12 subsections; the
                           current subsection is marked with `← THIS
                           SUBSECTION`.

The template's `## Slot reference (for the generator)` section is
STRIPPED before substitution (its literal `<<<NAME>>>` tokens document
the slots and would otherwise be clobbered by str.replace).
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _deepresearch_prompt_registry import REGISTRY, all_seqs  # noqa: E402

ROOT = Path(__file__).parent
TEMPLATE_PATH = ROOT / "_deepresearch_prompt_template.md"

SLOT_REFERENCE_MARKER = "## Slot reference (for the generator)"


def _strip_slot_reference_section(template_text: str) -> str:
    """Strip the `## Slot reference (for the generator)` section from
    the template before substitution. The section uses literal
    `<<<NAME>>>` tokens to document the slots and would otherwise be
    clobbered by str.replace. Generated files do not need it (they are
    auto-overwritten on regenerate)."""
    if SLOT_REFERENCE_MARKER not in template_text:
        return template_text
    head = template_text.split(SLOT_REFERENCE_MARKER, 1)[0]
    head = head.rstrip()
    if head.endswith("---"):
        head = head[:-3].rstrip()
    return head + "\n"


def _build_subsection_map(current_seq: str) -> str:
    """Render the 12-subsection map as an indented Markdown list with
    the current subsection marked. Module 1 (seq 01-07) and Module 2
    (seq 08-12) are separated by sub-headers. Indented 2 spaces to fit
    under the SUBSECTION block of the prompt."""
    lines = []
    lines.append("  Module 1 — Economic & Market Principles:")
    for seq in all_seqs():
        e = REGISTRY[seq]
        if e["seq"] >= "08":
            continue
        marker = "  ← THIS SUBSECTION" if seq == current_seq else ""
        lines.append(f"    {e['id']}  {e['title']}{marker}")
    lines.append("  Module 2 — Investment Principles:")
    for seq in all_seqs():
        e = REGISTRY[seq]
        if e["seq"] < "08":
            continue
        marker = "  ← THIS SUBSECTION" if seq == current_seq else ""
        lines.append(f"    {e['id']}  {e['title']}{marker}")
    return "\n".join(lines)


def _build_pilot_context_block(entry: dict) -> str:
    """Build the human-readable pilot-context block at the top of the
    generated file (above the PROMPT block). Replaces the placeholder
    block in the template. Project-wide failure modes only — no
    per-topic content."""
    return (
        f"## Pilot context (for the human user, NOT included in the prompt)\n\n"
        f"- **Topic:** {entry['id']} {entry['title']}.\n"
        f"- **Project:** consolidates Ray Dalio's investment + macro frameworks "
        f"into 3 operational artifacts (`README.md`, `dalio_dashboard.html`, "
        f"`dalio_model.xlsx`) for portfolio managers. The 12 research files "
        f"are the source material the artifacts are built from.\n"
        f"- **Content-free prompt:** The prompt does NOT name Dalio's "
        f"framework components, list historical cases, or enumerate Tier-1 "
        f"sources. The deep-research model MUST discover all of these by "
        f"EXHAUSTIVE primary reading. Pre-filling content would bias the "
        f"model toward a pre-existing summary instead of forcing real "
        f"research.\n"
        f"- **Failure modes the prompt must prevent (project-wide):** depth "
        f"shortfall, hard-rule violation, framing/scope drift, hallucinated "
        f"or weakly-sourced citations, surviving open questions in the "
        f"output, abandoned framework components, paraphrase disguised as "
        f"verbatim, manufactured words inside Dalio quote blocks.\n"
        f"- **Outcome standard:** COMPLETE + CONCLUSIVE. Every threshold, "
        f"formula, decision rule, and worked-example number cited at point "
        f"of use, with zero unresolved gaps in the output. Every framework "
        f"component the model DISCOVERS by primary reading must be "
        f"operationalized per R17.\n"
        f"- **Source priority (HARD):** Dalio's own public corpus is "
        f"presumed gap-free at the framework level. The prompt forces "
        f"exhaustive Dalio-corpus search BEFORE any non-Dalio source may be "
        f"introduced. Every Tier-1 source MUST be searched and recorded in "
        f"§11 search-trace per R20, even sources silent on the subsection.\n"
        f"- **Quote audit:** Every `> **Dalio**` block in the output must "
        f"have a byte-equal entry in the `_quote_audit.md` appendix per "
        f"R21.\n"
    )


def _substitute_slots(template_text: str, entry: dict) -> str:
    """Apply slot substitutions for a single topic. The template's
    `## Slot reference (for the generator)` section is stripped FIRST
    so that the literal `<<<NAME>>>` tokens it uses to document the
    slot syntax are not themselves substituted (which would corrupt
    the table). Generated files do not retain the slot reference (it
    is template-editor documentation only)."""
    template_text = _strip_slot_reference_section(template_text)
    subsection_map = _build_subsection_map(entry["seq"])

    text = template_text
    text = text.replace("<<<ID>>>", entry["id"])
    text = text.replace("<<<TITLE>>>", entry["title"])
    text = text.replace("<<<SEQ>>>", entry["seq"])
    text = text.replace("<<<slug>>>", entry["slug"])
    text = text.replace("<<<SUBSECTION_MAP>>>", subsection_map)

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
