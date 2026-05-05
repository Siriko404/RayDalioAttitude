"""
Per-topic context registry for the deep-research prompt generator.

Each entry feeds the slot fields in `_deepresearch_prompt_template.md`.
The generator script `_deepresearch_prompt_generator.py` reads this dict
and emits one `_deepresearch_prompt_{seq}_{slug}.md` per topic.

Fields per topic:
    seq             — two-digit sequence string ("01" .. "12")
    id              — Dalio framework subsection ID ("1.1" .. "2.5")
    slug            — filename slug
    title           — display title (used in H1)
    scope_in        — prose paragraph; what the agent must cover
    scope_out       — prose paragraph; what other subsections own
    named_components — list of dicts with keys:
        name        — short component label (e.g., "four levers")
        items       — list of component members
        dalio_anchor — Dalio source where the component is defined
        operationalization — what §5/§6/§7/§11 must show per R17
    expected_cases  — dict with keys:
        min         — minimum number of cases required in §7 (R23)
        allowlist   — list of historical-case strings
    tier1_sources   — dict with keys:
        min         — minimum Tier-1 sources to search (R20)
        allowlist   — list of Tier-1 Dalio works that should be searched

Topics 02..12 carry skeleton populations: IN/OUT carried over from the
existing `research/_prompt_template.md`; `named_components`, `expected_cases`,
and `tier1_sources` filled with best derivations from Dalio's published
framework structure where defensible. `# TODO` markers flag fields that
require user / external research confirmation before that topic's prompt
is generated. Topic 04 (the active pilot) is fully populated.
"""

REGISTRY = {
    # ===================================================================
    # MODULE 1 — ECONOMIC & MARKET PRINCIPLES (7 topics)
    # ===================================================================

    "01": dict(
        seq="01",
        id="1.1",
        slug="economic_machine",
        title="Economic Machine Template",
        scope_in=(
            "Transactions-based GDP identity (P × Q = M × V); productivity "
            "growth as linear trend; the concept of short + long debt cycles "
            "as overlays on productivity; money vs credit distinction; the "
            "three-driver framework (productivity, short-term debt cycle, "
            "long-term debt cycle) as Dalio's master macro model."
        ),
        scope_out=(
            "Mechanics of either debt cycle — covered by 1.2 and 1.3; "
            "deleveraging dynamics — covered by 1.4; inflation specifics — "
            "covered by 1.7."
        ),
        named_components=[
            dict(
                name="three drivers",
                items=["productivity growth", "short-term debt cycle", "long-term debt cycle"],
                dalio_anchor="HEMW (Economic Machine Works), 2012, p. 1-3",
                operationalization=(
                    "§5 must define a transform per driver; §6 must emit a "
                    "regime tag dimension per driver; §7 must show one case "
                    "per driver state; §11 must row each driver."
                ),
            ),
            dict(
                name="GDP identity components",
                items=["money", "credit", "transactions", "goods/services"],
                dalio_anchor="HEMW, 2012, p. 1-2",
                operationalization=(
                    "§5 must define M, V, P, Q transforms; §11 must row each."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "US 1929-1932 (productivity-up + debt-cycle-down)",
                "US 1990s (productivity-up + healthy expansion)",
                "Japan 1990-2010 (productivity-flat + long-cycle-deleverage)",
                "US 2008-2014 (post-crisis expansion)",
                "China 2010-2020 (mid-cycle expansion)",
            ],  # TODO: confirm Dalio anchors per case
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "How the Economic Machine Works (HEMW), 2012 paper + 30-min video",
                "Big Debt Crises (BDC), 2018, Part 1 archetype",
                "Principles for Navigating Big Debt Cycles (HCGB-1), 2024-2025, Ch 1",
                "LinkedIn long-form essays on the three drivers",
            ],
        ),
    ),

    "02": dict(
        seq="02",
        id="1.2",
        slug="short_term_debt_cycle",
        title="Short-Term Debt Cycle",
        scope_in=(
            "5-10 year business cycle; central-bank-driven credit expansion "
            "and contraction; yield-curve indicators; recession indicators; "
            "late-cycle vs mid-cycle detection; six-phase cycle template."
        ),
        scope_out=(
            "Long-term debt cycle — covered by 1.3; deleveraging levers — "
            "covered by 1.4; productivity trend — covered by 1.1."
        ),
        named_components=[
            dict(
                name="six cycle phases",
                items=["early cycle", "mid cycle", "late cycle", "recession early", "recession late", "transitional"],
                dalio_anchor="HEMW, 2012, p. 18-19",
                operationalization=(
                    "§5 must define a phase-classifier transform; §6 must "
                    "emit phase tag; §7 must show ≥3 cases at different "
                    "phases; §11 must row each phase boundary."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "US 1990s expansion",
                "US 2007 late-cycle / 2008 recession",
                "US 2014-2019 mid-cycle",
                "Japan 1990s recession",
                "Eurozone 2011 recession",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "How the Economic Machine Works (HEMW), 2012",
                "Big Debt Crises (BDC), 2018, Part 1",
                "Principles for Navigating Big Debt Cycles (HCGB-1), 2024-2025",
                "LinkedIn essays on cycle detection",
            ],
        ),
    ),

    "03": dict(
        seq="03",
        id="1.3",
        slug="long_term_debt_cycle",
        title="Long-Term Debt Cycle",
        scope_in=(
            "50-75 year secular cycle; debt/GDP ceiling detection; "
            "debt-service/GDP burden; reserve-currency cycle; late-stage "
            "warning signs; r minus g (interest minus growth) compounding "
            "dynamics."
        ),
        scope_out=(
            "Short-cycle timing — covered by 1.2; deleveraging mechanics — "
            "covered by 1.4; paradigm shifts — covered by 1.5."
        ),
        named_components=[
            dict(
                name="six monetary-policy regimes (MP1-MP6)",
                items=["MP1 linked", "MP2 fiat-IR", "MP3 fiat-debt-monetization", "MP4 coordinated", "MP5 big-deleveraging", "MP6 hard-money"],
                dalio_anchor="HCGB-1, 2024-2025, Ch 1 footnote (MP scheme renumbered vs BDC 2018)",
                operationalization=(
                    "§5 must define MP-regime classifier; §6 must emit MP "
                    "tag; §7 must show ≥3 cases at different MP regimes; "
                    "§11 must row each MP boundary."
                ),
            ),
            dict(
                name="r-minus-g compounding rule",
                items=["interest rate", "income growth", "debt-to-income ratio change"],
                dalio_anchor="HCGB-1, Ch 3, Ex 2",
                operationalization=(
                    "§5 must define `r - g` formula; §6 must emit "
                    "compounding-state tag; §7 must show worked example "
                    "with verbatim Dalio anchor (2% rate-growth gap → +50% "
                    "debt/income over 20 years)."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "US 1944 (post-war debt peak 7x revenue)",
                "Japan 1990-present (debt 1376% GDP)",
                "US 2024 (debt 580% GDP)",
                "UK 1820s",
                "Weimar Germany 1918-1924",
            ],
        ),
        tier1_sources=dict(
            min=4,
            allowlist=[
                "Big Debt Crises (BDC), 2018, Part 1 archetype + Part 3 48-case compendium",
                "Principles for Navigating Big Debt Cycles (HCGB-1), 2024-2025, Ch 1 + Ch 3",
                "How the Economic Machine Works (HEMW), 2012",
                "LinkedIn essays 2023-2025 on debt cycle / how countries go broke",
            ],
        ),
    ),

    "04": dict(
        seq="04",
        id="1.4",
        slug="deleveragings",
        title="Deleveragings",
        scope_in=(
            "Beautiful vs ugly deleveraging; the four levers (austerity, "
            "debt defaults / restructurings, money printing / debt "
            "monetization, redistribution of wealth); deflationary vs "
            "inflationary deleveraging dynamics; archetype templates and "
            "how the four levers are applied in each archetype; conditions "
            "under which a deleveraging tips from beautiful to ugly; "
            "observable indicators that classify a current or historical "
            "deleveraging episode by type; transition between episode "
            "phases within the deleveraging itself."
        ),
        scope_out=(
            "Cycle detection itself — covered by 1.2 (Short-Term Debt Cycle) "
            "and 1.3 (Long-Term Debt Cycle); forward-looking paradigm-shift "
            "logic across decades — covered by 1.5; empire-scale 250-year "
            "reserve-currency cycle — covered by 1.6; inflation regime "
            "classification generic — covered by 1.7; portfolio "
            "construction — covered by Module 2."
        ),
        named_components=[
            dict(
                name="four levers",
                items=[
                    "debt reduction (defaults / restructurings)",
                    "austerity",
                    "wealth transfer (haves to have-nots)",
                    "debt monetization (money printing)",
                ],
                dalio_anchor='An In-Depth Look at Deleveragings, 2012, p. 1: "the differences between deleveragings depend on the amounts and paces of 1) debt reduction, 2) austerity, 3) transferring wealth from the haves to the have-nots, and 4) debt monetization."',
                operationalization=(
                    "§5 must define a per-lever pp-of-GDP contribution "
                    "formula (one transform per lever, four total). §6 must "
                    "emit a 4-vector lever-share output AND under-print / "
                    "over-print balance flags. §7 must show one column per "
                    "lever for each case row. §11 must row each lever with "
                    "its Dalio source page."
                ),
            ),
            dict(
                name="three deleveraging archetypes",
                items=[
                    "ugly deflationary deleveraging (UDEF)",
                    "beautiful deleveraging (BDEL)",
                    "ugly inflationary deleveraging (UINF)",
                ],
                dalio_anchor="An In-Depth Look at Deleveragings, 2012, p. 2-3",
                operationalization=(
                    "§5 must define indicator transforms for each archetype's "
                    "diagnostic conditions. §6 must emit a single regime tag "
                    "from {UDEF, BDEL, UINF} plus an explicit truth table "
                    "covering all sign-combinations. §7 must show one case "
                    "per archetype, with the regime tag DERIVED from the "
                    "row's numeric inputs (not asserted from narrative)."
                ),
            ),
        ],
        expected_cases=dict(
            min=4,
            allowlist=[
                "US 1930-1932 (ugly deflationary)",
                "US 1933-1937 (beautiful, post-gold-devaluation)",
                "UK 1947-1969 (chronic / lever-mix specific)",
                "Japan 1990-present (ugly deflationary, chronic)",
                "US 2008-2014 (beautiful, post-QE)",
                "Spain 1977-1979 (chronic / lever-mix specific)",
                "Weimar Germany 1919-1923 (ugly inflationary)",
            ],
        ),
        tier1_sources=dict(
            min=4,
            allowlist=[
                "An In-Depth Look at Deleveragings, 2012",
                "Big Debt Crises (BDC), 2018, Part 1 archetype + Part 2 detailed cases + Part 3 48-case compendium",
                "Principles for Navigating Big Debt Cycles (HCGB-1), 2024-2025",
                "How the Economic Machine Works (HEMW), 2012",
                "CFA Institute, 'A Template for Understanding What Is Going On', 2009",
                "LinkedIn essays 2015-present on deleveraging dynamics",
            ],
        ),
    ),

    "05": dict(
        seq="05",
        id="1.5",
        slug="paradigm_shifts",
        title="Paradigm Shifts",
        scope_in=(
            "10-year regime-change detection; Dalio's 2019 framework for "
            "spotting reversals; asset-class leadership rotation by decade; "
            "the principle that each decade's winners reverse in the next."
        ),
        scope_out=(
            "Empire-scale 250-year transitions — covered by 1.6; "
            "inflation-specific regime — covered by 1.7; cycle-level "
            "detection — covered by 1.2-1.4."
        ),
        named_components=[
            dict(
                name="paradigm-shift signals",
                items=["asset-class leadership rotation", "valuation extremes", "money-printing reaction"],
                dalio_anchor="Paradigm Shifts (LinkedIn), July 2019",
                operationalization=(
                    "§5 must define each signal as a transform; §6 must "
                    "emit a paradigm-shift regime tag; §7 must show ≥3 "
                    "decade-transition cases."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "1920s reversal into 1930s (asset reversals + Great Depression)",
                "1970s reversal into 1980s (commodities to disinflation)",
                "2000s reversal into 2010s (post-GFC zero-rate paradigm)",
                "2020s emerging paradigm (debasement / new Cold War)",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "Paradigm Shifts (LinkedIn essay), July 2019",
                "Principles for Dealing with the Changing World Order (CWO), 2021",
                "Big Debt Crises (BDC), 2018",
                "LinkedIn essays 2019-present on paradigm shifts",
            ],
        ),
    ),

    "06": dict(
        seq="06",
        id="1.6",
        slug="changing_world_order",
        title="Changing World Order / Big Cycle",
        scope_in=(
            "Eight measures of great powers (education, innovation, "
            "competitiveness, military, trade, output, financial center, "
            "reserve currency); 250-year empire cycle; US vs China scoring; "
            "gold and reserve positioning at empire transitions; the Big "
            "Cycle archetype (rise → top → decline)."
        ),
        scope_out=(
            "10-year paradigm shifts — covered by 1.5; inflation dynamics — "
            "covered by 1.7."
        ),
        named_components=[
            dict(
                name="eight great-power measures",
                items=[
                    "education", "innovation/technology", "competitiveness",
                    "military", "trade", "economic output", "financial center", "reserve currency",
                ],
                dalio_anchor='Principles for Dealing with the Changing World Order (CWO), 2021, Ch 1: "roughly equal average of 18 measures of strength" (8 displayed publicly)',
                operationalization=(
                    "§5 must define a per-measure normalization transform "
                    "(0-1 rescale per Dalio's chart conventions); §6 must "
                    "emit 8-vector empire-strength score per country plus a "
                    "composite 'Empire' tag; §7 must show one row per "
                    "great-power case with all 8 measures; §11 must row each "
                    "measure with its Dalio source."
                ),
            ),
            dict(
                name="three big-cycle stages",
                items=["rise", "top", "decline"],
                dalio_anchor="CWO, 2021, Ch 1 archetype chart",
                operationalization=(
                    "§5 must define a stage-classifier transform; §6 must "
                    "emit stage tag; §7 must show one case per stage."
                ),
            ),
        ],
        expected_cases=dict(
            min=4,
            allowlist=[
                "Dutch Empire (rise 1581-1672, top, decline 1780-1815)",
                "British Empire (rise 1815, top, decline 1914-1945)",
                "US Empire (rise 1860s, top 1944, in late stage)",
                "Spanish Empire (rise 1500s, top, decline 1640s)",
                "China (current rising power)",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "Principles for Dealing with the Changing World Order (CWO), 2021 — free PDF + LinkedIn series",
                "Big Debt Crises (BDC), 2018 (cross-reference reserve-currency cycle)",
                "LinkedIn essays 2020-present on world order and rising powers",
            ],
        ),
    ),

    "07": dict(
        seq="07",
        id="1.7",
        slug="inflation_currency",
        title="Inflation & Currency Debasement",
        scope_in=(
            "Monetary vs credit inflation distinction; gold and real-asset "
            "allocation under debasement; FX positioning; 'cash is trash' "
            "framing; real-rate regime classification; hyperinflation tail "
            "vs moderate-inflation regime."
        ),
        scope_out=(
            "Long-term debt cycle generic — covered by 1.3; deleveraging "
            "levers generic — covered by 1.4."
        ),
        named_components=[
            dict(
                name="four inflation regimes",
                items=[
                    "moderate (real rate positive)",
                    "high (real rate negative)",
                    "debasement (M0 surge + FX collapse)",
                    "hyperinflation (M0 logarithmic)",
                ],
                dalio_anchor="HEMW, 2012, p. 5 + LinkedIn essays on cash/inflation",
                operationalization=(
                    "§5 must define classifier transforms; §6 must emit "
                    "regime tag; §7 must show one case per regime."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "US 1970s stagflation",
                "Weimar Germany 1922-1923 hyperinflation",
                "US 2009-2014 zero-bound moderate",
                "Argentina 2010-present chronic high inflation",
                "Japan 1990-present near-zero inflation",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "How the Economic Machine Works (HEMW), 2012",
                "Big Debt Crises (BDC), 2018, hyperinflation case studies",
                "LinkedIn essays on cash debasement / fiat decay 2019-present",
                "An In-Depth Look at Deleveragings, 2012 (inflationary archetype)",
            ],
        ),
    ),

    # ===================================================================
    # MODULE 2 — INVESTMENT PRINCIPLES (5 topics)
    # ===================================================================

    "08": dict(
        seq="08",
        id="2.1",
        slug="template_for_investing",
        title="Template for Investing",
        scope_in=(
            "Fundamental + systematic + diversified approach; the Holy "
            "Grail of 15-20 uncorrelated return streams; return-stream "
            "sourcing methodology; why correlation-killing matters; the "
            "geometric reduction of portfolio risk via uncorrelated stream "
            "count."
        ),
        scope_out=(
            "Specific All-Weather allocations — covered by 2.2; alpha-"
            "specific construction — covered by 2.3; leverage sizing — "
            "covered by 2.4; stress testing — covered by 2.5."
        ),
        named_components=[
            dict(
                name="three investing pillars",
                items=["fundamental", "systematic", "diversified"],
                dalio_anchor="Engineering Targeted Returns and Risks, 2011",
                operationalization=(
                    "§5 must define each pillar's measurable expression; "
                    "§6 must emit a regime tag per pillar."
                ),
            ),
            dict(
                name="Holy Grail correlation-killing chart",
                items=["stream count N", "average correlation rho", "information ratio IR"],
                dalio_anchor="Engineering 2011, p. 8 Chart 5",
                operationalization=(
                    "§5 must define the IR-vs-N-rho relationship transform; "
                    "§6 must emit a 'streams sufficient' Boolean; §7 must "
                    "show worked examples with verbatim Engineering chart "
                    "values (N=6 ρ=0.25 IR=0.6; N=77 ρ=0.04 IR=1.4)."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "Engineering 2011 Chart 5 P1 (N=6 ρ=0.25)",
                "Engineering 2011 Chart 5 P2 (N=77 ρ=0.04)",
                "60/40 traditional benchmark (illustrative)",
                "Bridgewater institutional ~1000-stream anecdote",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "Engineering Targeted Returns and Risks, 2011",
                "Principles 2017 (commercial; R9 fair-use only)",
                "LinkedIn long-form essays on Holy Grail / 15 streams",
                "Speeches and interviews mentioning Holy Grail",
            ],
        ),
    ),

    "09": dict(
        seq="09",
        id="2.2",
        slug="all_weather",
        title="All-Weather (Beta) Portfolio",
        scope_in=(
            "Four-box growth × inflation framework; risk-weighted (not "
            "capital-weighted) allocation; asset-class regime mapping; "
            "canonical weights from Dalio's only-public recipe via Robbins "
            "2014 (30% stocks / 40% long bonds / 15% intermediate Treasuries "
            "/ 7.5% gold / 7.5% commodities); 25-25-25-25 risk-quadrant "
            "allocation."
        ),
        scope_out=(
            "Leverage engineering — covered by 2.4; alpha overlay — "
            "covered by 2.3; macro regime detection — covered by Module 1."
        ),
        named_components=[
            dict(
                name="four growth × inflation quadrants",
                items=[
                    "growth-up + inflation-up",
                    "growth-up + inflation-down",
                    "growth-down + inflation-up",
                    "growth-down + inflation-down",
                ],
                dalio_anchor="Our Thoughts About Risk Parity and All-Weather, 2015, p. 6 + Chart on p. 7",
                operationalization=(
                    "§5 must define a regime-classifier transform "
                    "(growth-direction × inflation-direction); §6 must emit "
                    "the 4-box quadrant tag with per-quadrant 25% risk "
                    "allocation; §7 must show one case per quadrant."
                ),
            ),
            dict(
                name="canonical asset weights",
                items=["30% stocks", "40% long bonds", "15% intermediate Treasuries", "7.5% gold", "7.5% commodities"],
                dalio_anchor="Tony Robbins 'MONEY: Master the Game', 2014, ch. on Dalio All Seasons",
                operationalization=(
                    "§5 must define how capital weights translate to risk "
                    "weights; §6 must emit canonical-weights vs user-override "
                    "comparison."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "1970s stagflation (growth-down + inflation-up quadrant)",
                "1990s Goldilocks (growth-up + inflation-down quadrant)",
                "2008-2014 deflationary recovery (growth-up + inflation-down)",
                "2022 stagflation print (growth-down + inflation-up)",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "Our Thoughts About Risk Parity and All-Weather, 2015",
                "The All-Weather Story, Bridgewater public",
                "Tony Robbins 'MONEY: Master the Game', 2014 (R9 fair-use; only-public recipe)",
                "LinkedIn essays / interviews on All-Weather construction",
            ],
        ),
    ),

    "10": dict(
        seq="10",
        id="2.3",
        slug="alpha_portable_alpha",
        title="Alpha Generation & Portable Alpha",
        scope_in=(
            "Alpha / beta separation; information ratio; bet sizing; pure "
            "alpha vs traditional alpha; portable alpha construction "
            "(transport alpha from one beta to another); alpha decay; "
            "alpha-stream breadth and concentration limits."
        ),
        scope_out=(
            "Beta construction — covered by 2.2; leverage sizing — "
            "covered by 2.4."
        ),
        named_components=[
            dict(
                name="alpha-beta separation framework",
                items=["beta sleeve", "alpha overlay", "tracking error budget"],
                dalio_anchor="Engineering Targeted Returns and Risks, 2011, p. 11 + p. 9",
                operationalization=(
                    "§5 must define separation transforms; §6 must emit "
                    "alpha-decomposition vector; §7 must show worked examples."
                ),
            ),
            dict(
                name="information ratio formula",
                items=["IC", "breadth", "IR"],
                dalio_anchor="Engineering 2011 (cross-references Grinold-Kahn breadth identity, NON-DALIO)",
                operationalization=(
                    "§5 must define IR formula with NON-DALIO Grinold-Kahn "
                    "anchor; §6 must emit IR per stream output."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "Bridgewater Pure Alpha worked example",
                "Tracking-error 3% / 6% client examples (Engineering 2011 L466-467)",
                "60/40 portable-alpha overlay illustration",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "Engineering Targeted Returns and Risks, 2011",
                "Principles 2017 (commercial; R9 fair-use only)",
                "Bridgewater Daily Observations on alpha (free citations)",
                "LinkedIn essays on alpha generation",
            ],
        ),
    ),

    "11": dict(
        seq="11",
        id="2.4",
        slug="risk_parity_leverage",
        title="Risk Parity & Leverage",
        scope_in=(
            "Vol-targeted weighting; leverage ratios to hit target return; "
            "funding-cost analysis; rebalancing cadence; leverage limits; "
            "the principle that risk-parity portfolios require leverage to "
            "match return targets of capital-weighted portfolios."
        ),
        scope_out=(
            "Asset-class weights per se — covered by 2.2; alpha-specific "
            "sizing — covered by 2.3."
        ),
        named_components=[
            dict(
                name="risk-parity construction steps",
                items=["target volatility", "asset volatility estimation", "weight calculation", "leverage application"],
                dalio_anchor="Our Thoughts About Risk Parity and All-Weather, 2015 + Engineering 2011",
                operationalization=(
                    "§5 must define each step as a transform; §6 must emit "
                    "leverage ratio; §7 must show worked examples."
                ),
            ),
        ],
        expected_cases=dict(
            min=3,
            allowlist=[
                "All-Weather risk-parity worked example (Engineering 2011 ~2x leverage)",
                "1970s rising-rates leverage stress",
                "2008 funding-cost spike",
            ],
        ),
        tier1_sources=dict(
            min=3,
            allowlist=[
                "Our Thoughts About Risk Parity and All-Weather, 2015",
                "Engineering Targeted Returns and Risks, 2011",
                "The All-Weather Story",
                "LinkedIn essays on leverage / risk parity",
            ],
        ),
    ),

    "12": dict(
        seq="12",
        id="2.5",
        slug="stress_testing",
        title="Stress-Testing & Scenario Analysis",
        scope_in=(
            "Historical stress tests (1929-1933, 1970s, 2008, 2020); forward "
            "scenario construction; Dalio-template scenarios (deflationary "
            "depression, inflationary depression, reflation, stagflation); "
            "sensitivity tables; tail-correlation behavior in crises."
        ),
        scope_out=(
            "Portfolio construction — covered by 2.2-2.4; macro prediction "
            "— covered by Module 1."
        ),
        named_components=[
            dict(
                name="four Dalio template scenarios",
                items=[
                    "deflationary depression",
                    "inflationary depression",
                    "reflation",
                    "stagflation",
                ],
                dalio_anchor="Big Debt Crises (BDC), 2018, archetype templates",
                operationalization=(
                    "§5 must define a scenario-construction transform per "
                    "template; §6 must emit scenario-impact vector; §7 must "
                    "show one historical case per scenario."
                ),
            ),
            dict(
                name="historical stress-test set",
                items=["1929-1933", "1970s", "2008", "2020"],
                dalio_anchor="BDC Part 2 case studies",
                operationalization=(
                    "§5 must reference each case's stress-test data; §7 "
                    "must show the four cases as worked examples."
                ),
            ),
        ],
        expected_cases=dict(
            min=4,
            allowlist=[
                "1929-1933 deflationary depression",
                "1970s stagflation",
                "2008 deflationary recession",
                "2020 pandemic + reflation",
                "Weimar 1922-1923 inflationary depression",
            ],
        ),
        tier1_sources=dict(
            min=4,
            allowlist=[
                "Big Debt Crises (BDC), 2018, Part 2 case studies + Part 3 compendium",
                "An In-Depth Look at Deleveragings, 2012",
                "LinkedIn essays 2020-present on scenario analysis",
                "Bridgewater public research on stress-testing",
            ],
        ),
    ),
}


def get(seq: str) -> dict:
    """Return registry entry for a given two-digit sequence string."""
    return REGISTRY[seq]


def all_seqs() -> list:
    """Return all registry sequence strings in order."""
    return sorted(REGISTRY.keys())


if __name__ == "__main__":
    # Quick sanity: print every topic's id + title + component count.
    for seq in all_seqs():
        e = REGISTRY[seq]
        print(f"  {seq}  {e['id']:>4}  {e['title']:<50}  "
              f"components={len(e['named_components'])}  "
              f"min_cases={e['expected_cases']['min']}  "
              f"min_sources={e['tier1_sources']['min']}")
