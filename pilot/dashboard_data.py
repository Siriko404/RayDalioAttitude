"""
Per-section content for the dalio_dashboard.html build.

Each entry hand-extracted from research/NN_*.md sections §3 (decision problem),
§5 (mechanism), §6 (decision rules), §7 (worked example), §8 (citations).

Dalio anchor quotes are ≤15 words verbatim from research/NN §2 (Dalio's Framework —
Verbatim section), with citation source matching §2. All chart_data §7 numbers are
byte-exact targets validated by tests in test_build_dashboard.py::TestSectionDataModule.
"""

from __future__ import annotations

SECTIONS = {
    "1.1": {
        "title": "How the economic machine works",
        "question": "What drives output, prices, and credit growth at the broadest level?",
        # Verbatim: Dalio, "How the Economic Machine Works," Bridgewater, March 2012, p.1.
        "dalio_quote": "An economy is simply the sum of the transactions that make it up.",
        "dalio_quote_cite": "Dalio · How the Economic Machine Works · Bridgewater 2012 · p.1",
        "mechanism_h3": "The three forces, layered.",
        "mechanism_items": [
            ("Productivity", "Long-run trend growth from output-per-hour gains. Slow, smooth, decade-scale."),
            ("Short-term cycle", "5–8 year credit waves driven by central-bank policy. Boom-bust around the productivity trend."),
            ("Long-term cycle", "50–75 year debt accumulation cycles culminating in deleveraging."),
        ],
        "history_h3": "Three forces visible since 1900.",
        "history_text": (
            "Productivity has trended near 2% real for a century. Short-cycles oscillate ±5pp "
            "around it. Long-cycles emerge at debt peaks: 1929–1932, 2008–2009, 2020+."
        ),
        "formula_h3": "Output identity.",
        "formula_katex": r"Y_t \;=\; P_t \cdot (1 + g_{ST,t}) \cdot (1 + g_{LT,t})",
        "verdict_text": "Productivity sets the trend; cycles are deviations.",
        "verdict_emphasis": "trend dominates",
        "chart_data": None,
    },
    "1.2": {
        "title": "The short-term debt cycle",
        "question": "What drives the 5–8 year boom-bust cycle?",
        # Verbatim: Dalio, "How the Economic Machine Works," p.3 — short form.
        # Full quote: "a shorter-term (typically 5 to 8 years) debt cycle (i.e., the 'business/market cycle')."
        "dalio_quote": "a shorter-term (typically 5 to 8 years) debt cycle.",
        "dalio_quote_cite": "Dalio · How the Economic Machine Works · Bridgewater 2012 · p.5",
        "mechanism_h3": "Five-stage cycle.",
        "mechanism_items": [
            ("Expansion", "Low rates → credit growth → spending → income → repeat."),
            ("Inflation pickup", "Capacity tightens → wage and price pressure."),
            ("Tightening", "Central bank raises rates to cool inflation."),
            ("Recession", "Spending contracts, debts go bad, unemployment rises."),
            ("Easing", "Central bank cuts rates → cycle restarts."),
        ],
        "history_h3": "1965–2020: ~10 cycles in the US.",
        "history_text": (
            "Cycle length 5–8 years, driven by Fed Funds rate cycles. "
            "Mild deviations around 2% real productivity trend."
        ),
        "formula_h3": "Credit-spending identity.",
        "formula_katex": r"S_t \;=\; I_t + \Delta D_t",
        "verdict_text": "Spending equals income plus credit growth.",
        "verdict_emphasis": "credit drives the gap",
        "chart_data": None,
    },
    "1.3": {
        "title": "The long-term debt cycle",
        "question": "What happens when debt accumulation outpaces income for decades?",
        # Verbatim: Dalio, How Countries Go Broke Part 1, Introduction.
        # Full: "big, long-term debt cycles typically last about one lifetime—roughly 80 years (give or take 25 years)."
        # 16 words — ≤18 threshold passes; note as concern (>15 spec).
        "dalio_quote": "big, long-term debt cycles typically last about one lifetime—roughly 80 years.",
        "dalio_quote_cite": "Dalio · How Countries Go Broke Part 1 · Introduction",
        "mechanism_h3": "Three phases.",
        "mechanism_items": [
            ("Accumulation", "Debt-to-income rises over decades; living standards rise faster than productivity."),
            ("Bubble", "Asset prices, debt, and spending peak together; speculation dominates."),
            ("Deleveraging", "Debt service can no longer be paid; defaults, restructurings, money printing."),
        ],
        "history_h3": "US 1929, Japan 1990, Global 2008.",
        "history_text": (
            "Each ended a 50–75 year accumulation cycle. "
            "Resolution mechanism is the four levers (see §1.4)."
        ),
        "formula_h3": "Debt-burden identity.",
        "formula_katex": r"\text{Debt Service}_t \;=\; D_t \cdot r_t",
        "verdict_text": "Debt service growth must not exceed income growth indefinitely.",
        "verdict_emphasis": "limit reached",
        "chart_data": None,
    },
    "1.4": {
        "title": "Deleveragings",
        "question": (
            "When debt service overwhelms income, what mix of policy levers resolves the cycle, "
            "and which mix produces a 'beautiful' vs 'ugly' deleveraging?"
        ),
        # Verbatim: Dalio, "An In-Depth Look at Deleveragings," Bridgewater 2012.
        # Full: "Each one of these four paths reduces debt/income ratios, but they have different
        #        effects on inflation and growth."
        # Clean verbatim sub-string (9 words):
        "dalio_quote": "Each one of these four paths reduces debt/income ratios.",
        "dalio_quote_cite": "Dalio · An In-Depth Look at Deleveragings · Bridgewater 2012",
        "mechanism_h3": "Four policy levers, four archetypes.",
        "mechanism_items": [
            ("Austerity", "Cut spending. Deflationary. Reduces debt-service capacity."),
            ("Defaults", "Write down debts. Deflationary. Wealth destruction."),
            ("Money printing", "Expand monetary base. Inflationary. Debases currency."),
            ("Redistribution", "Transfer wealth from creditors to debtors. Politically unstable."),
        ],
        "history_h3": "Four archetypes: ugly deflationary, beautiful, ugly inflationary, transitional.",
        "history_text": (
            "US 1930–32 (ugly deflationary); US 1933–37 (beautiful — printing dominant); "
            "Japan 1990+ (ugly deflationary lite); Weimar 1921–23 (ugly inflationary)."
        ),
        "formula_h3": "Inflationary impulse identity.",
        "formula_katex": r"\pi_{\text{total}} \;=\; \Delta M_0^{\%GDP} + \Delta CB^{\%GDP}",
        "verdict_text": (
            "If printing dominates the lever mix, deleveraging is beautiful; "
            "if austerity + defaults dominate, it is ugly deflationary."
        ),
        "verdict_emphasis": "ugly deflationary",
        # §7 worked example: 4 archetypes × 4 levers, lever percentages.
        # Values are DERIVED operational estimates from §7 narrative anchors in research/04.
        # (Dalio gives qualitative lever dominance, not explicit percentages; these approximate
        # the narrative anchors: US 1930-32 = defaults dominant; US 1933-37 = printing ~equal;
        # Japan 1990+ = austerity/defaults; Weimar = printing dominant.)
        "chart_data": {
            "archetypes": ["US 1930–32", "US 1933–37", "Japan 1990+", "Weimar 1921–23"],
            "levers": ["austerity", "defaults", "printing", "redistribution"],
            "values": {
                "austerity":      [35, 15, 30, 0],
                "defaults":       [55, 40, 55, 5],
                "printing":       [10, 40, 10, 90],
                "redistribution": [0, 5, 5, 5],
            },
            "source": "research/04_deleveragings.md §7 — lever-mix percentages (DERIVED from narrative anchors)",
        },
    },
    "1.5": {
        "title": "Paradigm shifts",
        "question": "When does the dominant macro regime change, and what triggers the shift?",
        # Verbatim: Dalio, "Paradigm Shifts," LinkedIn, 17 Jul 2019.
        # "Identify the paradigm you're in, examine if and how it is unsustainable,
        #  and visualize how the paradigm shift will transpire when that which is unsustainable stops."
        # = 27 words. Trim to the key imperative clause:
        "dalio_quote": "Identify the paradigm you're in, examine if and how it is unsustainable.",
        "dalio_quote_cite": "Dalio · Paradigm Shifts · LinkedIn · 17 Jul 2019",
        "mechanism_h3": "Three signals.",
        "mechanism_items": [
            ("Asset returns invert", "Best-performing assets of the prior regime become worst-performing."),
            ("Policy reversal", "Central bank pivot from easing to tightening (or vice versa)."),
            ("Sentiment flip", "Market consensus shifts from confidence to fear."),
        ],
        "history_h3": "1970s, 1980s, 2000s.",
        "history_text": (
            "1970s inflation paradigm. 1980s disinflation paradigm. 2000s quantitative easing paradigm. "
            "2020s likely transition."
        ),
        "formula_h3": "Regime classifier.",
        "formula_katex": r"R_t \;=\; \arg\max_r \; P(r \mid X_t)",
        "verdict_text": "Paradigms last 10–20 years; transitions are the source of greatest opportunity and risk.",
        "verdict_emphasis": "transition imminent",
        "chart_data": None,
    },
    "1.6": {
        "title": "The changing world order",
        "question": "What drives the rise and fall of reserve currencies and great powers?",
        # Verbatim: Dalio, "Changing World Order," Ch 1, p.6.
        # Full: "important empires typically lasted roughly 250 years, give or take 150 years,
        #  with big economic, debt, and political cycles within them lasting about 50-100 years."
        # First clause = 12 words: verbatim sub-string.
        "dalio_quote": "important empires typically lasted roughly 250 years, give or take 150 years.",
        "dalio_quote_cite": "Dalio · The Changing World Order · Ch 1 · p.6",
        "mechanism_h3": "Eight measures of empire strength.",
        "mechanism_items": [
            ("Education", "Human capital quality."),
            ("Innovation", "Patents and tech leadership."),
            ("Trade", "Share of global trade."),
            ("Reserve currency", "Share of FX reserves."),
            ("Military", "Defense spending and capability."),
            ("Output", "Share of global GDP."),
            ("Financial center", "Share of global finance."),
            ("Cost competitiveness", "Unit-cost vs peers."),
        ],
        "history_h3": "Dutch → British → US.",
        "history_text": (
            "Each empire peaked in the 8 measures, then declined as costs rose, "
            "debt accumulated, and the next rising power overtook it."
        ),
        "formula_h3": "Empire strength index.",
        "formula_katex": r"E_t \;=\; \frac{1}{8} \sum_{i=1}^{8} w_i M_{i,t}",
        "verdict_text": "The US is past peak in 6 of 8 measures; China rising in all 8.",
        "verdict_emphasis": "transition underway",
        "chart_data": None,
    },
    "1.7": {
        "title": "Inflation & currency",
        "question": "What determines whether a deleveraging produces inflation or deflation?",
        # Verbatim: Dalio, "Paradigm Shifts," LinkedIn, 17 Jul 2019 (from research/07 §2).
        # Full: "In such a world, storing one's money in cash and bonds will no longer be safe."
        # = 16 words — ≤18 threshold passes; note as concern (>15 spec).
        # Shorter verbatim sub-string: "storing one's money in cash and bonds will no longer be safe." = 12 words.
        "dalio_quote": "storing one's money in cash and bonds will no longer be safe.",
        "dalio_quote_cite": "Dalio · Paradigm Shifts · LinkedIn · 17 Jul 2019",
        "mechanism_h3": "Two dimensions.",
        "mechanism_items": [
            ("Currency-of-debt", "Own-currency debt → can print to repay → inflationary risk."),
            ("Reserve status", "Reserve currency → external demand absorbs printing."),
            ("Currency-of-assets", "Foreign-currency assets → exposure to FX swings."),
        ],
        "history_h3": "US 1933 inflated; Japan 1990s deflated.",
        "history_text": (
            "US debts were USD; printing produced moderate inflation. "
            "Japan's debts also were JPY but external surplus absorbed printing → deflation persisted."
        ),
        "formula_h3": "Inflation identity.",
        "formula_katex": r"\pi_t \;=\; \Delta M_t - \Delta Y_t + \Delta V_t",
        "verdict_text": "Currency status determines whether debt resolution is inflationary or deflationary.",
        "verdict_emphasis": "currency-dependent",
        "chart_data": None,
    },
    "2.1": {
        "title": "Template for investing",
        "question": "What is the four-step process for choosing an investment policy?",
        # Verbatim: Dalio LinkedIn slug (cited in research/08 §2).
        # Full: "My mantra of investing is fifteen good uncorrelated return streams, risk balanced."
        # = 12 words. Clean verbatim.
        "dalio_quote": "My mantra of investing is fifteen good uncorrelated return streams, risk balanced.",
        "dalio_quote_cite": "Dalio · LinkedIn · My mantra of investing",
        "mechanism_h3": "Four steps.",
        "mechanism_items": [
            ("Goals", "Returns target, risk tolerance, liquidity needs."),
            ("Drivers", "Identify the macro forces that affect each asset class."),
            ("Portfolio", "Combine assets that respond differently to those drivers."),
            ("Stress-test", "Simulate tail scenarios; verify portfolio survives."),
        ],
        "history_h3": "Bridgewater pure-alpha + All-Weather.",
        "history_text": (
            "The four-step process underlies both the discretionary alpha fund "
            "and the rules-based All-Weather portfolio."
        ),
        "formula_h3": "Decision identity.",
        "formula_katex": r"\Pi^* \;=\; \arg\max_\Pi \; U(\Pi \mid \text{drivers}, \text{stress})",
        "verdict_text": "All four steps are required; skipping any one produces fragility.",
        "verdict_emphasis": "all four required",
        "chart_data": None,
    },
    "2.2": {
        "title": "All-Weather portfolio",
        "question": (
            "What portfolio survives all four economic environments — "
            "rising/falling growth × rising/falling inflation?"
        ),
        # Verbatim: Dalio / Bridgewater, "The All Weather Story," bridgewater.com.
        # Full: "The key was to put equal risk on each scenario to achieve balance."
        # = 13 words.
        "dalio_quote": "The key was to put equal risk on each scenario to achieve balance.",
        "dalio_quote_cite": "Dalio / Bridgewater · The All Weather Story · bridgewater.com",
        "mechanism_h3": "Four-quadrant balance.",
        "mechanism_items": [
            ("Rising growth", "Equities, corporate credit, commodities."),
            ("Falling growth", "Government bonds, defensive equities."),
            ("Rising inflation", "Commodities, TIPS, gold."),
            ("Falling inflation", "Long-duration government bonds."),
        ],
        "history_h3": "1996–2024: positive returns in 24 of 28 years.",
        "history_text": (
            "Drawdowns shallower than equity-heavy benchmarks; returns competitive with 60/40."
        ),
        "formula_h3": "Risk-parity identity.",
        "formula_katex": r"w_i \cdot \sigma_i \;=\; \text{const} \quad \forall i",
        "verdict_text": "Equal risk per environment, not equal weight per asset.",
        "verdict_emphasis": "risk parity, not equal weight",
        # §7: Robbins (2014) disclosure of Bridgewater All-Weather weights.
        # Source: research/09_all_weather.md §6 verbatim Robbins cite + §7.
        "chart_data": {
            "labels": ["Long Treasuries", "Intermediate Treasuries", "Stocks", "Commodities", "Gold"],
            "weights": [40, 15, 30, 7.5, 7.5],
            "source": "research/09_all_weather.md §6 — Robbins (2014) / Dalio disclosure · weights 30/40/15/7.5/7.5",
        },
    },
    "2.3": {
        "title": "Alpha & portable alpha",
        "question": "How is alpha decomposed and combined with beta to produce the desired return profile?",
        # Verbatim: Dalio, "Engineering Targeted Returns and Risks," p.8.
        # Full: "alpha is independent from beta and is overlaid on the beta."
        # = 11 words.
        "dalio_quote": "alpha is independent from beta and is overlaid on the beta.",
        "dalio_quote_cite": "Dalio · Engineering Targeted Returns and Risks · Bridgewater Aug 2011 · p.8",
        "mechanism_h3": "Two return sources.",
        "mechanism_items": [
            ("Beta", "Systematic exposure to asset classes; unlimited capacity."),
            ("Alpha", "Skill-based excess return; capacity-constrained."),
            ("Portable alpha", "Apply alpha (often via futures/swaps) on top of any beta exposure."),
        ],
        "history_h3": "Bridgewater Pure Alpha 1991+.",
        "history_text": (
            "Pure Alpha targets ~12% annualized excess return uncorrelated with beta. "
            "Combined with various betas to produce custom return profiles."
        ),
        "formula_h3": "Total return decomposition.",
        "formula_katex": r"R_p \;=\; \beta + \alpha + \epsilon",
        "verdict_text": "Alpha and beta are independent risk premia; portable alpha allows arbitrary combination.",
        "verdict_emphasis": "independent premia",
        "chart_data": None,
    },
    "2.4": {
        "title": "Risk parity & leverage",
        "question": "How is leverage applied to balance risk contributions across asset classes?",
        # Verbatim: Dalio / Bridgewater, "Engineering Targeted Returns and Risks," p.11.
        # Full: "All Weather doesn't use very much leverage; the strategy is around 2 times leveraged,
        #        which is less than the amount of leverage an average large company in the S&P 500 employs..."
        # Trim to ≤15 words: "All Weather doesn't use very much leverage; the strategy is around 2 times leveraged."
        # = 14 words.
        "dalio_quote": "All Weather doesn't use very much leverage; the strategy is around 2 times leveraged.",
        "dalio_quote_cite": "Dalio / Bridgewater · Engineering Targeted Returns and Risks · p.11",
        "mechanism_h3": "Three steps.",
        "mechanism_items": [
            ("Volatility scaling", "Compute σ for each asset class."),
            ("Equal-risk weighting", "w_i ∝ 1/σ_i."),
            ("Total leverage", "Lever the portfolio to target total volatility (e.g. 10%)."),
        ],
        "history_h3": "Risk parity since 1996.",
        "history_text": (
            "All-Weather is a risk-parity portfolio levered ~2× on bonds. "
            "Survived 2008 with shallow drawdown."
        ),
        "formula_h3": "Equal-risk identity.",
        "formula_katex": r"w_i \;=\; \frac{1/\sigma_i}{\sum_j 1/\sigma_j} \cdot L",
        "verdict_text": "Leverage transforms low-vol assets from minor contributors to equal-risk peers.",
        "verdict_emphasis": "leverage transforms vol",
        "chart_data": None,
    },
    "2.5": {
        "title": "Stress testing",
        "question": "Will the portfolio survive a tail scenario like the 2008 crisis or 1970s inflation?",
        # Verbatim: Dalio / Bridgewater, "Engineering Targeted Returns and Risks," p.10 (from research/12 §2).
        # Full: "Although we back-tested this strategy to 1925, it was not until the recent financial crisis
        #        that we had a crisis like the Great Depression to stress-test these concepts in real time
        #        [...]. During this period, the All Weather asset mix performed as expected."
        # Trim to 13 words: "the All Weather asset mix performed as expected." too thin.
        # Better: "it was not until the recent financial crisis that we had a crisis like the Great Depression
        #          to stress-test these concepts in real time" = 26 words.
        # Clean ≤15-word sub-string: "the All Weather asset mix performed as expected." = 9 words. Short but verbatim.
        # Alternative from §2: BDC p.32: "A 'beautiful deleveraging' happens when the four levers are moved
        #   in a balanced way so as to reduce intolerable shocks and produce positive growth." = 23 words.
        # Trim: "the four levers are moved in a balanced way so as to reduce intolerable shocks." = 16 words.
        # 15-word clean: "the four levers are moved in a balanced way to reduce intolerable shocks." — modified, not verbatim.
        # Use the 9-word verbatim: "the All Weather asset mix performed as expected."
        "dalio_quote": "the All Weather asset mix performed as expected.",
        "dalio_quote_cite": "Dalio / Bridgewater · Engineering Targeted Returns and Risks · p.10",
        "mechanism_h3": "Four-archetype shock matrix.",
        "mechanism_items": [
            ("1929-style deflation", "Equities −50%, long bonds +20%, commodities −35%."),
            ("1973-style stagflation", "Equities −37%, long bonds −5%, commodities +40%."),
            ("2008-style credit crisis", "Equities −37%, long bonds +20%, credit −25%."),
            ("Reflation", "Equities +25%, bonds +5%, commodities +15%."),
        ],
        "history_h3": "Four archetype contributions to All-Weather.",
        "history_text": (
            "Robbins (2014) disclosed Bridgewater's 4-archetype stress matrix for All-Weather. "
            "Contributions sum to portfolio return per archetype (Table 7.1 research/12)."
        ),
        "formula_h3": "Contribution identity.",
        "formula_katex": r"C_{i,e} \;=\; w_i \cdot S_{i,e}",
        "verdict_text": "All-Weather expected return by archetype: −8.13%, −26.00%, −3.05%, +11.83%.",
        "verdict_emphasis": "ugly inflationary worst",
        # §7 Table 7.1 Sum row — byte-exact from research/12_stress_testing.md.
        # Defl. = −8.125 (rounded to −8.13), Infl. = −26.000, Stag. = −3.050, Refl. = +11.825 (+11.83).
        "chart_data": {
            "archetypes": ["Deflationary", "Inflationary", "Stagflation", "Reflation"],
            "contributions": [-8.13, -26.00, -3.05, 11.83],
            "source": "research/12_stress_testing.md §7 Table 7.1 — Sum R^port_e row (Robbins weights)",
        },
    },
}
