"""
Per-topic registry for the deep-research prompt generator.

Each entry feeds the slot fields in `_deepresearch_prompt_template.md`.
The generator script `_deepresearch_prompt_generator.py` reads this dict
and emits one `_deepresearch_prompt_{seq}_{slug}.md` per topic.

CONTENT-FREE BY DESIGN. The registry stores ONLY structural identifiers
for each subsection (seq, id, slug, title). It deliberately does NOT
store named framework components, expected historical cases, expected
Tier-1 sources, scope_in summaries, or any content that would BIAS the
deep-research model toward a pre-existing summary. The model MUST
discover Dalio's framework structure, named components, historical
cases, and source coverage by EXHAUSTIVE primary reading of his corpus.

Why content-free: pre-filling specific frameworks/cases/sources in the
prompt converts deep research into list-verification (the model
"discovers" exactly what was already given). The deep-research model is
a research instrument; the prompt is METHOD-directive only. Topic
boundaries are enforced via the SUBSECTION_MAP slot the generator
builds from all 12 (id, title) pairs — no per-topic content needed.

Fields per topic:
    seq    — two-digit sequence string ("01" .. "12")
    id     — Dalio framework subsection ID ("1.1" .. "2.5")
    slug   — filename slug
    title  — display title (used in H1 and SUBSECTION block)

Version history:
    v1 (HEAD e37dffb)   — single 11-section prompt for topic 04 only.
                          REJECTED by redteam (R12 violations + 4-lever
                          framework regression).
    v2 (HEAD 6447a26)   — template + registry + generator architecture
                          with per-topic content (named_components,
                          expected_cases, tier1_sources allowlists).
                          REJECTED by redteam audit at HEAD 545899e
                          (Tier-1 contamination, gameable rules) AND
                          by user as content-biasing the model.
    v3 (this revision)  — content-free registry. Discovery is the
                          model's job; the registry only identifies
                          subsections.
"""

REGISTRY = {
    # Module 1 — Economic & Market Principles (7 topics)
    "01": dict(seq="01", id="1.1", slug="economic_machine",       title="Economic Machine Template"),
    "02": dict(seq="02", id="1.2", slug="short_term_debt_cycle",  title="Short-Term Debt Cycle"),
    "03": dict(seq="03", id="1.3", slug="long_term_debt_cycle",   title="Long-Term Debt Cycle"),
    "04": dict(seq="04", id="1.4", slug="deleveragings",          title="Deleveragings"),
    "05": dict(seq="05", id="1.5", slug="paradigm_shifts",        title="Paradigm Shifts"),
    "06": dict(seq="06", id="1.6", slug="changing_world_order",   title="Changing World Order / Big Cycle"),
    "07": dict(seq="07", id="1.7", slug="inflation_currency",     title="Inflation & Currency Debasement"),

    # Module 2 — Investment Principles (5 topics)
    "08": dict(seq="08", id="2.1", slug="template_for_investing", title="Template for Investing"),
    "09": dict(seq="09", id="2.2", slug="all_weather",            title="All-Weather (Beta) Portfolio"),
    "10": dict(seq="10", id="2.3", slug="alpha_portable_alpha",   title="Alpha Generation & Portable Alpha"),
    "11": dict(seq="11", id="2.4", slug="risk_parity_leverage",   title="Risk Parity & Leverage"),
    "12": dict(seq="12", id="2.5", slug="stress_testing",         title="Stress-Testing & Scenario Analysis"),
}


def get(seq: str) -> dict:
    """Return registry entry for a given two-digit sequence string."""
    return REGISTRY[seq]


def all_seqs() -> list:
    """Return all registry sequence strings in order."""
    return sorted(REGISTRY.keys())


if __name__ == "__main__":
    # Sanity-print all 12 entries.
    for seq in all_seqs():
        e = REGISTRY[seq]
        print(f"  {seq}  {e['id']:>4}  {e['title']}")
