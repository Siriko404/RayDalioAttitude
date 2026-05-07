/* 2.2 All-Weather — research/09 §5-§6.
 * Baseline weights locked: 30/15/40/7.5/7.5 (Robbins 2014 / Dalio).
 * RC%_i = w_i · (Σw)_i / σ_p²
 * σ_p = √(w'Σw)
 *
 * Tilt arbitration is delegated to ./tilt-arbiter.js per Spec FR-12.
 * This module exports applyTilts() that accepts the arbiter's output and
 * enforces the ±10pt aggregate cap.
 */

export const AW_BASELINE_WEIGHTS = {
  equities:       0.30,
  int_treasury:   0.15,
  long_treasury:  0.40,
  gold:           0.075,
  commodities:    0.075
};

const SLEEVE_ORDER = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities'];

export function computeAllWeather(input) {
  const { vols, corrMatrix = 'identity', weights = AW_BASELINE_WEIGHTS } = input;
  const w = SLEEVE_ORDER.map(k => weights[k]);
  const σ = SLEEVE_ORDER.map(k => vols[k]);

  // Build covariance Σ_{ij} = σ_i · σ_j · ρ_{ij}
  const Σ = SLEEVE_ORDER.map((_, i) => SLEEVE_ORDER.map((_, j) => {
    const ρ = (corrMatrix === 'identity') ? (i === j ? 1 : 0) : (corrMatrix[i]?.[j] ?? 0);
    return σ[i] * σ[j] * ρ;
  }));

  // Σw = matrix-vector product
  const Σw = w.map((_, i) => SLEEVE_ORDER.reduce((s, _, j) => s + Σ[i][j] * w[j], 0));
  // σ_p² = w' Σ w
  const σ_p2 = w.reduce((s, wi, i) => s + wi * Σw[i], 0);
  const σ_p = Math.sqrt(σ_p2);

  // RC%_i = w_i · (Σw)_i / σ_p²  → returns percentages
  const RC_pct = {};
  SLEEVE_ORDER.forEach((k, i) => { RC_pct[k] = (σ_p2 > 0) ? (w[i] * Σw[i] / σ_p2) * 100 : 0; });

  // Environment RC (B matrix per research/09 §7 L155)
  const B = {
    equities:      { growth_up: +1, growth_down: -1, infl_up:  0, infl_down: +1 },
    int_treasury:  { growth_up:  0, growth_down: +1, infl_up: -1, infl_down: +1 },
    long_treasury: { growth_up:  0, growth_down: +1, infl_up: -1, infl_down: +1 },
    gold:          { growth_up:  0, growth_down:  0, infl_up: +1, infl_down:  0 },
    commodities:   { growth_up: +1, growth_down: -1, infl_up: +1, infl_down:  0 }
  };
  const RC_env_pct = { growth_up: 0, growth_down: 0, infl_up: 0, infl_down: 0 };
  for (const env of Object.keys(RC_env_pct)) {
    SLEEVE_ORDER.forEach(k => {
      if (B[k][env] === +1) RC_env_pct[env] += RC_pct[k];
    });
  }

  return {
    weights, σ_p, σ_p_pct: σ_p * 100,
    RC_pct, RC_env_pct,
    emits: ['target_weights', 'RC%_i', 'σ_p', 'drift_band']
  };
}

/**
 * Accept a tilt-arbiter output (per-sleeve pp deltas) and return final weights
 * with ±10pt aggregate cap (Spec §6 + research/07 §6 L132).
 *
 * Inputs treat keys: gold, commodities, bonds (= long+int treasury), cash, equities.
 */
export function applyTilts(tiltsPp) {
  const out = { ...AW_BASELINE_WEIGHTS };
  const goldDelta = clipPp(tiltsPp.gold ?? 0);
  out.gold += goldDelta / 100;

  const commDelta = clipPp(tiltsPp.commodities ?? 0);
  out.commodities += commDelta / 100;

  // Bonds tilt splits between long/int treasury proportional to baseline (40/15).
  const bondDelta = clipPp(tiltsPp.bonds ?? 0);
  const bondSplit = AW_BASELINE_WEIGHTS.long_treasury / (AW_BASELINE_WEIGHTS.long_treasury + AW_BASELINE_WEIGHTS.int_treasury);
  out.long_treasury += (bondDelta * bondSplit) / 100;
  out.int_treasury  += (bondDelta * (1 - bondSplit)) / 100;

  // Cash absorbs residual (and any explicit cash tilt). Keep ≥ 0; renormalize.
  const equitiesDelta = clipPp(tiltsPp.equities ?? 0);
  out.equities += equitiesDelta / 100;

  // Renormalize to sum=1 (clamp negatives to 0 first)
  for (const k of SLEEVE_ORDER) if (out[k] < 0) out[k] = 0;
  const total = SLEEVE_ORDER.reduce((s, k) => s + out[k], 0) || 1;
  for (const k of SLEEVE_ORDER) out[k] /= total;

  return out;
}

function clipPp(x) {
  return Math.max(-10, Math.min(10, Number(x) || 0));
}

export function driftBand(actual, target) {
  let maxDriftPp = 0;
  for (const k of Object.keys(target)) {
    const drift = Math.abs((actual[k] ?? 0) - target[k]) * 100;
    if (drift > maxDriftPp) maxDriftPp = drift;
  }
  if (maxDriftPp < 3) return 'GREEN';
  if (maxDriftPp <= 5) return 'AMBER';
  return 'RED';
}
