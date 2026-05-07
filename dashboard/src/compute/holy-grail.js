/* 2.1 Holy Grail (educational sidebar) — research/08 §5-§6.
 * N_eff = N / (1 + (N−1)·ρ̄)
 * σ_p/σ = √[(1+(N−1)ρ)/N]
 * Equivalently σ_p/σ = 1/√N_eff.
 */

export function computeHolyGrail(input) {
  const { N = 1, ρ_avg = 0 } = input;
  const safeN = Math.max(1, N);
  const N_eff = safeN / (1 + (safeN - 1) * ρ_avg);
  const σ_p_over_σ = Math.sqrt((1 + (safeN - 1) * ρ_avg) / safeN);
  const σ_reduction_pct = (1 - σ_p_over_σ) * 100;

  return {
    N, ρ_avg, N_eff, σ_p_over_σ, σ_reduction_pct,
    HolyGrailRegime: classifyHolyGrailRegime(N_eff),
    rhoTag: classifyRhoTag(ρ_avg),
    emits: ['HolyGrailRegime', 'N_eff', 'ρ̄']
  };
}

export function classifyHolyGrailRegime(N_eff) {
  if (N_eff < 5)  return 'NONE';
  if (N_eff < 15) return 'PARTIAL';
  return 'FULL';
}

export function classifyRhoTag(ρ) {
  if (ρ < 0.10) return 'UNCORRELATED';
  if (ρ < 0.30) return 'LIGHTLY-CORRELATED';
  if (ρ < 0.70) return 'HIGHLY-CORRELATED';
  return 'DOMINATED';
}
