# 2.4 Risk Parity & Leverage

## § 1 Executive Summary

Risk parity weights assets so each contributes equal risk, not equal capital; leverage then scales the balanced portfolio to a target volatility. Dalio's All-Weather uses "around 2 times" leverage to raise low-risk sleeves into equity-like return territory while preserving diversification. This subsection operationalizes the leverage stack on top of vol-parity weights: the `L = σ_target / σ_p` identity, funding-cost drag on Sharpe, rebalance cadence, and leverage caps. Public data from FRED (FEDFUNDS, DTB3, DGS10, VIXCLS, SP500) and Yahoo Finance (^BCOM) drives implementation. A worked example and JS / Excel / ECharts specs follow.

## § 2 Dalio's Framework — Verbatim

> **Dalio / Bridgewater** — source: "Engineering Targeted Returns and Risks" (Aug 2011, Ray Dalio), p. 4, https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf:
> "assets can be made \"competitive\" with each other and \"arbitraged\" through the use of leverage. […] by borrowing cash to buy more of an investment, one can raise both the expected return and the expected risk of that investment."

> **Dalio / Bridgewater** — source: "Engineering Targeted Returns and Risks", p. 11:
> "All Weather doesn't use very much leverage; the strategy is around 2 times leveraged, which is less than the amount of leverage an average large company in the S&P 500 employs and about 1/10th the leverage the average U.S. bank employs".

> **Dalio / Bridgewater** — source: "Our Thoughts about Risk Parity and All Weather" (Daily Observations, Sep 16 2015, Dalio / Prince / Jensen), p. 1, https://www.cmgwealth.com/wp-content/uploads/2015/10/Our-Thoughts-about-Risk-Parity-and-All-Weather-Bridgewater-Ray-Dalio-2015.pdf:
> "Risk parity is the means of adjusting the expected risks and returns of assets to make them more comparable. […] Once the better diversified portfolio is created and the return-risk ratio is improved, the portfolio can be geared to the desired level of risk and return."

> **Dalio / Bridgewater** — source: "Our Thoughts about Risk Parity and All Weather", p. 2:
> "if you lever up the bonds to have a similar volatility, both the expected risks and the expected returns of the bonds would increase to be more like the expected risks and returns of stocks. […] borrowing cash to buy more bonds will give more of that profitable spread."

## § 3 Decision Problem

Given a vol-parity / equal-risk-contribution portfolio with low unlevered σ: how much leverage hits the target portfolio vol, and what does it cost? Two questions: (1) σ_p=6%, σ_target=10% — what L? (2) How much Sharpe is lost to the funding spread? Out of scope: asset weights (2.2), alpha sizing (2.3). Output: target L, funding-adjusted net return and Sharpe, and operational leverage / vol-band / rebalance rules.

## § 4 Input Variables Table

| name | description | unit | data source | API endpoint | update frequency | typical range |
|---|---|---|---|---|---|---|
| `ret_spx` | S&P 500 daily level (equity sleeve) | index | FRED "S&P 500" | `series_id=SP500` | daily | 2000–7000 |
| `ret_ust10` | 10-Yr Treasury Constant Maturity yield (→ price via duration) | % | FRED "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity" | `series_id=DGS10` | daily | 0.5–6.0 |
| `ret_gold` | Gold Fixing Price 3 P.M. London PM per troy oz | USD/oz | FRED "Gold Fixing Price" | `series_id=GOLDPMGBD228NLBM` | daily | 250–3000 |
| `ret_bcom` | Bloomberg Commodity Index level | index | Yahoo Finance (^BCOM) | `https://query1.finance.yahoo.com/v8/finance/chart/%5EBCOM?interval=1d&range=10y` | daily | 50–350 |
| `sigma_i` | 63-day annualized stdev per sleeve | % | derived | `STDEV(r)*SQRT(252)` | daily | 3%–40% |
| `r_f` | Effective federal funds rate (funding anchor) | % p.a. | FRED "Federal Funds Effective Rate" | `series_id=FEDFUNDS` / `DFF` | monthly / daily | 0%–6% |
| `r_repo` | 3-Mo T-Bill Secondary Market Rate | % p.a. | FRED "3-Month Treasury Bill: Secondary Market Rate" | `series_id=DTB3` | daily | 0%–6% |
| `r_fund_broker` | Broker / futures-implied financing rate | % p.a. | broker / IBKR | IBKR `/portfolio/{id}/ledger` | intraday | `r_f`+25–150 bp |
| `vix` | CBOE Volatility Index | % | FRED / Cboe | `series_id=VIXCLS` | daily | 10–80 |
| `sigma_target` | Portfolio volatility target | % | operator | constant | static | 6%–16% |
| `L` | Leverage ratio = σ_target / σ_p | × | derived | `σ_target / σ_p` | daily | 1.0×–3.0× |
| `w_target_i` | Inverse-vol weights, normalized | % | derived (Qian 2005 / AFP 2012) | — | monthly | 5%–60% |
| `w_current_i` | Current sleeve weights | % | custodian / OMS | IBKR `/portfolio/{id}/positions` | intraday | 0%–80% |

## § 5 Computation / Transformations

**Step A — vol estimate per sleeve.** $\sigma_i = \sqrt{252}\cdot\mathrm{stdev}(r_{i,t})$ over $t\in[T-63,T-1]$.

> **NON-DALIO (industry standard)** — source: Asness, Frazzini, Pedersen (2012), "Leverage Aversion and Risk Parity", *Financial Analysts Journal* 68(1): 47–59, p. 51, https://www.aqr.com/-/media/AQR/Documents/Insights/Journal-Article/Leverage-Aversion-and-Risk-Parity.pdf — AFP use "three-year monthly excess returns up to month t − 1".

> **DERIVED (operational)** — 63-day daily (vs AFP's 36-month) is author-stipulated for live monitoring; trades off responsiveness against turnover.

**Step B — inverse-vol weights.** $w_i = (1/\sigma_i) \,/\, \sum_{j} (1/\sigma_j)$.

> **NON-DALIO (industry standard)** — source: AFP (2012), p. 51: "we set the portfolio weight in each asset class equal to the inverse of its volatility". Inverse-vol equals exact ERC only when correlations are equal; for § 7's mixed-sign matrix, the gap is <2 pp per weight.

> **NON-DALIO (industry standard)** — source: Qian (2005), "Risk Parity Portfolios", PanAgora, § "Risk Parity Portfolios", https://www.panagora.com/assets/PanAgora-Risk-Parity-Portfolios-Efficient-Portfolios-Through-True-Diversification.pdf: "an allocation of 23% in the Russell 1000 Index and 77% in the Lehman Aggregate Bond Index would have equal risk contribution from stocks and bonds".

**Step C — portfolio vol.** $\Sigma_{ij} = \sigma_i\sigma_j\rho_{ij}$; $\sigma_p = \sqrt{w^{\top}\Sigma w}$.

**Step D — leverage.** $L = \sigma_{\text{target}} / \sigma_p$; levered vol $= L\sigma_p$.

> **DERIVED (operational)** — the `L = target / unlevered` identity requires ~0-vol financing. Dalio's "around 2× at ~10% vol" (p. 11) anchors the central case.

**Step E — net return.** $r_{\text{net}} = L\,r_p - (L-1)\,r_{\text{fund}}$.

**Step F — Sharpe identity.** With spread $s = r_{\text{fund}} - r_f$:

$$\mathrm{SR}_{\text{lev}} = \frac{L r_p - (L-1)(r_f+s) - r_f}{L\sigma_p} = \frac{r_p - r_f}{\sigma_p} - \frac{L-1}{L}\cdot\frac{s}{\sigma_p}.$$

Sharpe is unchanged at $s=0$; each bp of spread costs $((L-1)/L)\cdot(s/\sigma_p)$ Sharpe.

> **DERIVED (operational)** — algebraic consequence of Step E; not a Dalio-stated formula.

**Step G — rebalancing.** Recompute σ_i monthly; re-solve w and L. Trade only when § 6 triggers fire.

> **Dalio / Bridgewater** — source: "Our Thoughts about Risk Parity and All Weather", p. 9: "All Weather is a strategic asset allocation mix, not an active strategy. As such, All Weather tends to rebalance that mix, which leads us to tend to buy those assets that go down in relation to those that went up so that we keep the allocations to them constant."

## § 6 Output Variables & Decision Rules

**Volatility target bands.**

> **NON-DALIO (industry standard)** — source: Qian (2005), § "Using the Risk Parity Portfolios", three canonical deployments: "An unleveraged version with 4%–5% risk"; "A leveraged version with a leverage ratio of about 2:1 and a risk target of around 8%–10%"; "A global macro strategy with 16%–20% risk and leverage of 4:1".

> **DERIVED (operational)** — the 10% target default tracks Qian's balanced bucket and Bridgewater's ~2× anchor.

| σ_target | Typical L @ σ_p=6% | Use case |
|---|---|---|
| 6% | 1.00× | Bond-like (DC-plan safer sleeve) |
| 10% | ≈ 1.67× | Matches 60/40 risk (Qian bucket B; "around 2×") |
| 15% | ≈ 2.50× | Matches unlevered equity risk |
| 18%+ | ≥ 3.0× | Hedge-fund-style; raise margin reserves |

**Leverage cap.**

> **DERIVED (operational)** — 3.0× hard cap is an author-stipulated operational limit. Dalio's "around 2×" (§ 2, Engineering Targeted Returns, p. 11) anchors the centre; the cap guards forced-deleverage risk in a correlation-breakdown shock.

- **GREEN:** L ∈ [1.0×, 2.0×] — Bridgewater's anchor band.
- **AMBER:** L ∈ (2.0×, 3.0×] — permitted only if σ_p has spiked; log in PM journal.
- **RED:** L > 3.0× — forbidden; reduce σ_target instead.

**Vol-band rebalance trigger.**

> **DERIVED (operational)** — ±25% band around σ_target is author-stipulated, mirroring 2.2's drift logic. Dalio publishes no numeric vol-deviation trigger.

Realized 21-day annualized `σ_p_realized`. If `|σ_p_realized − σ_target|/σ_target > 25%` → rebalance now. Otherwise rebalance monthly on the first business day.

**Funding-cost guardrail.**

> **DERIVED (operational)** — 100 bp funding-spread threshold is author-stipulated. Dalio notes "we actively limit exposure to lenders" (Engineering Targeted Returns, p. 11) but gives no numeric cap.

- **GREEN:** `s ≤ 25 bp` above `r_f`.
- **AMBER:** `s ∈ (25, 100] bp` — switch to cheapest-to-deliver funding.
- **RED:** `s > 100 bp` — reduce L one step; funding drag exceeds 6.56 pp Sharpe at L=1.66×, σ_p=6% (§ 7).

**Liquidity reserve.** Hold `5% × (L−1)` of NAV in cash / T-bills as margin buffer.

> **DERIVED (operational)** — `5% × (L−1)` is author-stipulated, sized for one daily 3-σ move on `(L−1)` notional at σ_p=10% (~1.9%/day; 2.5 days headroom). Dalio's related principle — leverage "employed in a range of highly liquid forms that can be rebalanced and liquidated if asset prices fall" — is from Engineering Targeted Returns, p. 11.

## § 7 Worked Numeric Example

**Scenario (illustrative).** Four-sleeve portfolio — SPX, 10-year UST, Gold, BCOM — as-of end-April-2026.

**Step 1 — sleeve vols (63-day, annualized) and inverse-vol weights:**

| Sleeve | σ_i | 1/σ_i | w_i |
|---|---|---|---|
| SPX | 16.0% | 6.2500 | 17.79% |
| UST10 | 6.0% | 16.6667 | 47.43% |
| Gold | 15.0% | 6.6667 | 18.97% |
| BCOM | 18.0% | 5.5556 | 15.81% |
| **Sum** | — | **35.139** | **100.00%** |

Each `w_i = (1/σ_i) / 35.139`.

**Step 2 — correlation matrix (illustrative, 252-day):**

|  | SPX | UST10 | Gold | BCOM |
|---|---|---|---|---|
| SPX | 1.00 | −0.30 | 0.05 | 0.20 |
| UST10 | −0.30 | 1.00 | 0.10 | −0.15 |
| Gold | 0.05 | 0.10 | 1.00 | 0.35 |
| BCOM | 0.20 | −0.15 | 0.35 | 1.00 |

**Step 3 — unlevered portfolio vol.** Diagonal $\sum_i (w_i\sigma_i)^2 = 32.3954\times10^{-4}$. Off-diagonal pair terms (all × 10⁻⁴): SPX–UST10 −4.8593, SPX–Gold +0.8099, SPX–BCOM +3.2395, UST10–Gold +1.6198, UST10–BCOM −2.4297, Gold–BCOM +5.6692 → sum +4.0494. Variance 36.4449 × 10⁻⁴; **σ_p = 6.037%**.

**Step 4 — leverage.** $L = 10.00\%/6.037\% = 1.656\times$; levered gross = **165.6%** of NAV.

**Step 5 — expected returns.** Assume `SR_per_sleeve = 0.30` (Dalio "0.2 to 0.3" Sharpe range, Engineering Targeted Returns, p. 3) and `r_f = 4.0%`.

> **DERIVED (operational)** — 0.30 is the top of Dalio's 0.2–0.3 Sharpe range; author-stipulated for this worked example.

$E[r_i] = 4.0\% + 0.30\sigma_i$: SPX 8.80%, UST10 5.80%, Gold 8.50%, BCOM 9.40%. Weighted `r_p = 0.1779·8.80 + 0.4743·5.80 + 0.1897·8.50 + 0.1581·9.40 = 7.415%`.

**Step 6 — net return by funding scenario.** $r_{\text{net}} = L r_p - (L-1) r_{\text{fund}}$:

| Scenario | r_fund | r_net | σ_lev | Sharpe |
|---|---|---|---|---|
| Unlevered | — | 7.415% | 6.037% | 0.566 |
| Levered @ r_f (s=0) | 4.00% | 9.657% | 10.000% | 0.566 |
| Levered @ r_f + 25 bp | 4.25% | 9.493% | 10.000% | 0.549 |
| Levered @ r_f + 50 bp | 4.50% | 9.329% | 10.000% | 0.533 |
| Levered @ r_f + 100 bp | 5.00% | 9.000% | 10.000% | 0.500 |

R14 checks: (a) `1.656·7.415 − 0.656·4.00 = 9.657%` ✓; (b) Sharpe @ r_f = (9.657−4.00)/10.00 = 0.5657 = unlevered Sharpe ✓; (c) drag @ 25 bp = (0.656/1.656)·(0.25/6.037) = **1.64 pp**; observed 0.566 − 0.549 = 1.64 pp ✓; drag @ 100 bp = 6.56 pp ✓; (d) § 8c chart data = Sharpe column verbatim.

**Step 7.** Leverage doubles vol, lifts net return 7.42% → 9.66% at zero spread — Sharpe unchanged. A 25–50 bp broker spread costs 1.6–3.3 pp Sharpe; at 100 bp (§ 6 RED) SR collapses to 0.50 and the de-lever rule fires.

**Step 8 — margin buffer.** `5% × (L−1) × NAV = 5% × 0.656 = 3.28% × NAV`.

## § 8 Implementation Specs

### 8a. JS — function signature, fetch URLs, pseudo-code

```js
const FRED = (id) => `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${process.env.FRED_KEY}&file_type=json`;
const YHOO = (sym) => `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=10y`;

const SLEEVES = ['SPX', 'UST10', 'Gold', 'BCOM'];
const SOURCES = {
  SPX:   FRED('SP500'),
  UST10: FRED('DGS10'),            // yield → price return via duration ≈ 8.5
  Gold:  FRED('GOLDPMGBD228NLBM'),
  BCOM:  YHOO('%5EBCOM'),
};

async function riskParityLeverage({ sigmaTarget = 0.10, lookbackDays = 63 }) {
  const rets = await loadAlignedReturns(SOURCES, lookbackDays);
  const rf = await fredLatest('DFF');
  const sigma = annualizedStdev(rets, 252);
  const inv = SLEEVES.map(s => 1 / sigma[s]);
  const w = inv.map(x => x / inv.reduce((a,b)=>a+b,0));              // Step B
  const rho = pearson(rets);
  const cov = SLEEVES.map((a,i) => SLEEVES.map((b,j) => sigma[a]*sigma[b]*rho[i][j]));
  const sigmaP = Math.sqrt(dot(w, cov.map(row => dot(row, w))));     // Step C
  const L = Math.min(sigmaTarget / sigmaP, 3.0);                     // Step D, § 6 cap
  const sFunding = await brokerFundingSpread() ?? 0.0025;
  return { w, sigmaP, L, sigmaLev: L*sigmaP, sFunding,
           sharpeDrag: ((L-1)/L) * (sFunding/sigmaP) };
}
```

### 8b. Excel — sheet layout, Power Query M or URL, key formulas

Three sheets: `Data` (A=date; B–E = daily closes SPX, UST10_yld, Gold, BCOM) via Power Query (replicate `09_all_weather.md` § 8b feed pattern, substituting `DGS10` for bond and `DFF` for funding):

```m
let key = "YOUR_FRED_KEY",
    url = "https://api.stlouisfed.org/fred/series/observations?series_id=DFF&api_key=" & key & "&file_type=json",
    src = Json.Document(Web.Contents(url)),
    tbl = Table.ExpandRecordColumn(Table.FromList(src[observations], Splitter.SplitByNothing()),
                                   "Column1", {"date","value"})
in Table.TransformColumnTypes(tbl, {{"date", type date}, {"value", type number}})
```

Formulas — `Returns`: `=LN(B3/B2)` for prices; UST10 price-return `= -$Z$1*(YieldB3-YieldB2)/100` with `$Z$1`=8.5 (10y duration at 4%). `Risk`: vols `=STDEV(lookback)*SQRT(252)`; inverse in col G; weights `=G2/G$7`. `Portfolio`: `σ_p = SQRT(MMULT(TRANSPOSE(H2:H5), MMULT(CovMatrix, H2:H5)))`; `L = MIN(J2/I2, 3.0)`; `r_net = K2*M2 - (K2-1)*(N2+O2)`.

### 8c. ECharts config — chart type, encoding, palette tokens

Two-series line: Sharpe under funding-spread scenarios + flat unlevered reference. Numbers copied cell-by-cell from § 7 Step-6 Sharpe column (R14 compliance).

```js
const option = {
  backgroundColor: '#0B0B0B',
  textStyle: { color: '#F5F5F5', fontFamily: 'Inter, sans-serif' },
  title: {
    text: 'Risk Parity @ L=1.66x: Funding-Spread Sharpe Drag',
    textStyle: { color: '#F5F5F5' },
    subtext: '§ 7 inputs: σ_p=6.04%, r_p=7.42%, r_f=4%, σ_target=10%',
    subtextStyle: { color: '#A3A3A3' },
  },
  grid: { left: 80, backgroundColor: '#141414', borderColor: '#262626' },
  xAxis: {
    type: 'category',
    data: ['Unlevered', 'L=1.66x @ r_f', '+25 bp', '+50 bp', '+100 bp'],
    axisLabel: { color: '#A3A3A3' },
    axisLine: { lineStyle: { color: '#262626' } },
  },
  yAxis: {
    type: 'value', min: 0.45, max: 0.60,
    axisLabel: { color: '#A3A3A3', formatter: v => v.toFixed(3) },
    axisLine: { lineStyle: { color: '#262626' } },
    splitLine: { lineStyle: { color: '#262626' } },
  },
  series: [
    { name: 'Sharpe (realized)', type: 'line',
      data: [0.566, 0.566, 0.549, 0.533, 0.500],  // § 7 Step 6 column
      itemStyle: { color: '#00D08C' },
      lineStyle: { color: '#00D08C', width: 2 },
      symbol: 'circle', symbolSize: 8,
      emphasis: { itemStyle: { color: '#7FFFD4' } },
      markLine: {
        symbol: 'none',
        lineStyle: { color: '#E5484D', type: 'dashed' },
        data: [{ yAxis: 0.500, name: '§ 6 RED' }],
        label: { color: '#E5484D' },
      },
    },
    { name: 'Sharpe (unlevered ref.)', type: 'line',
      data: [0.566, 0.566, 0.566, 0.566, 0.566],
      lineStyle: { color: '#D4A373', type: 'dashed', width: 1 },
      itemStyle: { color: '#D4A373' },
      symbol: 'none',
    },
  ],
  tooltip: {
    backgroundColor: '#1C1C1C',
    borderColor: '#262626',
    textStyle: { color: '#F5F5F5' },
  },
  // Reserved palette tokens: #080808 (inset), #6B7280 (tertiary).
};
```

## § 9 Integration Points

**Upstream.**

- **2.1 Template for Investing** — "many uncorrelated streams" philosophy supplies the *why*; 2.4 supplies the vol-parity + leverage mechanics.
- **2.2 All-Weather (Beta) Portfolio** — supplies the asset mix. 2.4 reads 2.2's 30/40/15/7.5/7.5 as a *capital-weighted benchmark* and inverse-vol as the *risk-weighted peer*.
- **Module 1 (1.1–1.7)** — macro grammar feeds inclusion; 2.4 is regime-agnostic at execution.
- **Market/funding data** — FRED (SP500, DGS10, GOLDPMGBD228NLBM, DFF, DTB3, VIXCLS), Yahoo Finance ^BCOM, broker for financing spread.

**Downstream.**

- **2.3 Alpha Generation & Portable Alpha** — overlays ride on levered risk-parity beta; funding drag feeds portable-alpha net return.
- **2.5 Stress-Testing** — owns the forced-deleverage scenario (2008 / 2022 co-crash).
- **Execution / OMS** — consumes weights + L + margin buffer; trades on § 6 band breach.

## § 10 Open Questions, Limitations, Sources

**Open questions & limitations.**

1. **No precise Dalio L.** Engineering Targeted Returns (p. 11) gives only "around 2×"; the 1.0×–3.0× GREEN/AMBER/RED bands in § 6 are DERIVED, marked at point of use.
2. **Vol lookback.** AFP 2012 uses 36-month monthly; 63-day daily is author-stipulated for live monitoring. Substitute 36-month if turnover is an issue.
3. **Funding spread.** 25 / 50 / 100 bp brackets are illustrative; actual broker / futures-implied financing varies by cycle stage. Dalio does not quantify.
4. **Covariance stability.** `L = σ_target / σ_p` uses historical σ_p. A correlation-breakdown shock (1998, 2008, 2022) raises realized σ_p overnight → forced deleveraging via § 6 RED. Owned by 2.5.
5. **Rising-rate risk.** Dalio/Prince/Jensen (2015, p. 8): All-Weather 8.7% vs 60/40 7.6% across 1946–1981 yield upcycle; weigh against the 2022 co-crash.
6. **Inverse-vol vs full ERC.** Inverse-vol = exact ERC only with equal correlations; true ERC needs Newton iteration on `w_i·(Σw)_i = σ_p²/N`. Gap is <2 pp for 4–6 sleeves; matters at 10+. Qian 2005 and AFP 2012 both use inverse-vol.
7. **MOVE index unavailable on FRED.** ICE/BAML does not publish MOVE free; `BAMLCC0A0CMTRIV` is Corporate Index total return, not MOVE. § 4 uses `VIXCLS` only; a public bond-vol signal is absent.

**Sources (all public, URLs pre-flight-checked).**

- Dalio, R. (Aug 2011), "Engineering Targeted Returns and Risks", Bridgewater: https://bridgewater.brightspotcdn.com/fa/e3/d09e72bd401a8414c5c0bdaf88bb/bridgewater-associates-engineering-targeted-returns-and-risks-aug-2011.pdf
- Dalio R., Prince B., Jensen G. (Sep 16 2015), "Our Thoughts about Risk Parity and All Weather", Bridgewater Daily Observations: https://www.cmgwealth.com/wp-content/uploads/2015/10/Our-Thoughts-about-Risk-Parity-and-All-Weather-Bridgewater-Ray-Dalio-2015.pdf
- Bridgewater, "The All Weather Story": https://www.bridgewater.com/research-and-insights/the-all-weather-story
- Qian, E. (Sep 2005), "Risk Parity Portfolios", PanAgora: https://www.panagora.com/assets/PanAgora-Risk-Parity-Portfolios-Efficient-Portfolios-Through-True-Diversification.pdf
- Asness, C., Frazzini, A., Pedersen, L. (2012), "Leverage Aversion and Risk Parity", *Financial Analysts Journal* 68(1): 47–59 (AQR mirror): https://www.aqr.com/-/media/AQR/Documents/Insights/Journal-Article/Leverage-Aversion-and-Risk-Parity.pdf
- FRED series: FEDFUNDS (https://fred.stlouisfed.org/series/FEDFUNDS), DFF (https://fred.stlouisfed.org/series/DFF), DTB3 (https://fred.stlouisfed.org/series/DTB3), DGS10 (https://fred.stlouisfed.org/series/DGS10), SP500 (https://fred.stlouisfed.org/series/SP500), GOLDPMGBD228NLBM (https://fred.stlouisfed.org/series/GOLDPMGBD228NLBM), VIXCLS (https://fred.stlouisfed.org/series/VIXCLS)
- Yahoo Finance (BCOM daily): https://query1.finance.yahoo.com/v8/finance/chart/%5EBCOM?interval=1d&range=10y
