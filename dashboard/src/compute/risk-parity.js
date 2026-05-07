/* 2.4 Risk Parity & Leverage — research/11 §5-§6.
 * Inverse-vol weights: w_i = (1/σ_i) / Σ_j(1/σ_j)
 * σ_p = √(w'Σw); accepts optional corrMatrix (identity default)
 * L = σ_target / σ_p, hard-capped at 3.0×
 * Sharpe with funding spread: SR_lev = (r_p − r_f)/σ_p − [(L−1)/L]·(s/σ_p)
 *
 * Plan deviation: research/11 §7 L138-145 publishes 4×4 correlation matrix; impl
 * accepts a corrMatrix input (consistent with all-weather.js pattern). 'identity'
 * default preserves the simpler form.
 */

const L_HARD_CAP = 3.0;

export function computeRiskParity(input) {
  const { vols, corrMatrix = 'identity', σ_target = 0.10, r_p, r_f = 0.04, funding_spread_bp = 0 } = input;

  // Inverse-vol weights
  const sleeves = Object.keys(vols);
  const σ = sleeves.map(k => vols[k]);
  const inv = σ.map(v => 1 / v);
  const invSum = inv.reduce((s, x) => s + x, 0);
  const weights = {};
  sleeves.forEach((k, i) => { weights[k] = inv[i] / invSum; });

  // σ_p — full w'Σw with optional correlation matrix
  const w = sleeves.map(k => weights[k]);
  const Σ = sleeves.map((_, i) => sleeves.map((_, j) => {
    const ρ = (corrMatrix === 'identity') ? (i === j ? 1 : 0) : (corrMatrix[i]?.[j] ?? 0);
    return σ[i] * σ[j] * ρ;
  }));
  const Σw = w.map((_, i) => sleeves.reduce((s, _, j) => s + Σ[i][j] * w[j], 0));
  const σ_p2 = w.reduce((s, wi, i) => s + wi * Σw[i], 0);
  const σ_p = Math.sqrt(σ_p2);

  // Leverage with hard cap
  const L_raw = σ_target / σ_p;
  const L = Math.min(L_raw, L_HARD_CAP);

  // Sharpe ratio (unlevered) and levered with funding spread drag
  const s = funding_spread_bp / 10000;
  const SR_unlev = (r_p - r_f) / σ_p;
  const SR_lev = SR_unlev - ((L - 1) / L) * (s / σ_p);

  // Drag from base
  const sharpeDrag = SR_unlev - SR_lev;

  return {
    weights, σ_p, σ_p_pct: σ_p * 100,
    L, L_raw,
    L_band: lBand(L),
    funding_spread_bp,
    funding_spread_band: fundingSpreadBand(funding_spread_bp),
    SR_unlev, SR_lev, sharpeDrag,
    margin_buffer: marginBuffer(L),
    emits: ['L', 'w_i', 'SR_lev', 'sharpeDrag', 'margin_buffer']
  };
}

export function lBand(L) {
  if (L <= 2.0) return 'GREEN';
  if (L <= 3.0) return 'AMBER';
  return 'RED';
}

export function fundingSpreadBand(bp) {
  if (bp <= 25) return 'GREEN';
  if (bp <= 100) return 'AMBER';
  return 'RED';
}

export function marginBuffer(L) {
  return 0.05 * (L - 1);
}
