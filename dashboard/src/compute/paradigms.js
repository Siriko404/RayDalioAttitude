/* 1.5 Paradigm Shifts — research/05 §5-§6.
 * PA composite (research/05 §5.4 L99-106):
 *   PA = (1/3) · [(1−ρ_d)/2  +  S_tail/4  +  sigmoid(Δ_recency / σ_Δ)]
 *
 * Inputs: 5 assets × 2 decades returns; 4 tailwind flags; recency vs CAGR anchor.
 *
 * Verbatim from research/05 §7:
 *   2019-Q4: ρ=-0.10 → (1-ρ)/2 = 0.55
 *           S_tail=3   → 0.75
 *           Δ=+4.1, σ=3.5 → sigmoid(1.17) ≈ 0.76
 *           PA = (0.55+0.75+0.76)/3 = 0.687 → LATE
 */

export function computeParadigms(input) {
  const decRet = input.decadeReturns;

  // Spearman ρ on decade-rank inversion (5 assets):
  // d_i = rank_2010s(asset i) − rank_2000s(asset i); Σd² = Σ over 5 assets;
  // ρ = 1 − 6·Σd² / (n·(n²−1)),  n=5 → denom=120.
  const assets = Object.keys(decRet);
  const ranks2000s = rankAssets(assets.map(a => decRet[a].d2000s));
  const ranks2010s = rankAssets(assets.map(a => decRet[a].d2010s));
  const Σd2 = assets.reduce((s, _, i) => s + (ranks2010s[i] - ranks2000s[i]) ** 2, 0);
  const ρ = 1 - 6 * Σd2 / (5 * (25 - 1));   // = 1 − Σd²·6/120 = 1 − Σd²/20

  // S_tail = ΣT_i, 4 binary AND-conditions
  const T1 = (input.RealRate10y < 0.005 && input.FedFunds < 0.010) ? 1 : 0;
  const T2 = (input.BuybackYield > 0.025) ? 1 : 0;
  const T3 = (input.ProfitShare > input.ProfitShareMean_plus_sigma) ? 1 : 0;
  const T4 = (input.StatTaxRateAtPost1986Low && input.StatTaxRateStable2Yr) ? 1 : 0;
  const S_tail = T1 + T2 + T3 + T4;

  // Recency divergence
  const Δ_recency = ((input.ConsensusForecast ?? 0) - (input.LongRunCAGR ?? 0.064)) * 100;
  const σΔ = (input.Δ_recency_sigma ?? 0.035) * 100;
  const sigmoidΔ = 1 / (1 + Math.exp(-(Δ_recency / σΔ)));

  // PA composite (equal weight)
  const corrTerm = (1 - ρ) / 2;       // 2019-Q4: (1+0.10)/2 = 0.55 ✓
  const tailTerm = S_tail / 4;
  const PA = (corrTerm + tailTerm + sigmoidΔ) / 3;

  const paradigm_stage = classifyParadigmStage(PA);

  // Tilt trigger: S_tail ≥ 3 AND ρ < 0
  const tilt_trigger = (S_tail >= 3 && ρ < 0);
  // Gold overlay: PA ≥ 0.67 AND RealRate10y < 0.50%
  const gold_overlay = (PA >= 0.67 && input.RealRate10y < 0.005);

  // next_leader_set: bottom 2 by 2010s decade rank (intuition: rotation toward laggards)
  const sorted = assets.map((a, i) => ({ asset: a, ret: decRet[a].d2010s, rank: ranks2010s[i] }))
    .sort((p, q) => p.rank - q.rank);
  const next_leader_set = sorted.slice(0, 2).map(x => x.asset);

  return {
    PA, ρ, S_tail, Δ_recency, sigmoidΔ,
    paradigm_stage, tilt_trigger, gold_overlay,
    next_leader_set,
    emits: ['paradigm_stage', 'tilt_trigger', 'gold_overlay', 'next_leader_set']
  };
}

export function classifyParadigmStage(PA) {
  if (PA < 0.33) return 'EARLY';
  if (PA < 0.67) return 'MID';
  return 'LATE';
}

function rankAssets(values) {
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const ranks = new Array(values.length);
  indexed.forEach((entry, rankIdx) => { ranks[entry.i] = rankIdx + 1; });
  return ranks;
}
