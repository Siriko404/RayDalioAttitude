/* 1.1 Economic Machine — Spec §3 + research/01 §5-§6.
 * Inputs: FRED series GDP, GDPC1, A939RX0Q048SBEA, CNP16OV, M2SL, TCMDO.
 * Outputs: gap_regime, credit_mix_regime, debt_money_regime, trend_growth_pct,
 *          R_dm (debt/money ratio).
 *
 * Verbatim from research/01:
 *   gap_regime: ABOVE_TREND if gap% > +σ; BELOW_TREND if < −σ; else ON_TREND
 *               (σ ≈ 3.2% from OLS residual stdev on 1947-2024 RGDP_pc)
 *   credit_mix_regime: CREDIT_DRIVEN if sᶜ > 0.66; MONEY_DRIVEN if < 0.33; else MIXED
 *   debt_money_regime: LOW < 10; ELEVATED 10-15; HIGH > 15  (R^{D/M} narrow-money)
 */

const SIGMA_GAP_PCT = 3.2;       // OLS residual σ
const TERTILE_LOW = 0.33;
const TERTILE_HIGH = 0.66;
const DM_LOW_EDGE = 10;
const DM_HIGH_EDGE = 15;

export function computeEconMachine(payload) {
  const fred = payload?.sources?.fred || {};

  const trend = fitOlsTrend(fred.A939RX0Q048SBEA || []);
  const trend_growth_pct = (Math.exp(4 * trend.beta) - 1) * 100;

  const lastReal = lastValue(fred.A939RX0Q048SBEA);
  const t_idx = (fred.A939RX0Q048SBEA?.length || 1) - 1;
  const expected_ln = trend.alpha + trend.beta * t_idx;
  const gap_pct = lastReal != null ? (Math.log(lastReal) - expected_ln) * 100 : 0;
  const gap_regime = gap_pct > +SIGMA_GAP_PCT ? 'ABOVE_TREND' :
                     gap_pct < -SIGMA_GAP_PCT ? 'BELOW_TREND' : 'ON_TREND';

  const dC = qDelta(fred.TCMDO);
  const dM = qDelta(fred.M2SL);
  const sC = (dC + dM) === 0 ? 0.5 : dC / (dC + dM);
  const credit_mix_regime = sC > TERTILE_HIGH ? 'CREDIT_DRIVEN' :
                            sC < TERTILE_LOW  ? 'MONEY_DRIVEN'  : 'MIXED';

  // Narrow-money R^{D/M}: TCMDO_mn / narrow money. v1 uses M2-based proxy with
  // ×3.7 scaling (research/01 §7 L137-138 documents the historical narrow/M2 ratio
  // that produces the canonical "roughly 15" anchor).
  const tcmdoBn = (lastValue(fred.TCMDO) || 0) / 1000;
  const m2Bn = lastValue(fred.M2SL) || 1;
  const R_dm = tcmdoBn / m2Bn;
  const R_dm_narrow = R_dm * 3.7;
  const debt_money_regime = R_dm_narrow < DM_LOW_EDGE ? 'LOW' :
                            R_dm_narrow > DM_HIGH_EDGE ? 'HIGH' : 'ELEVATED';

  return {
    gap_regime, credit_mix_regime, debt_money_regime,
    trend_growth_pct, gap_pct, sC, R_dm, R_dm_narrow,
    emits: ['gap_regime', 'credit_mix_regime', 'trend_growth_pct', 'debt_money_regime']
  };
}

// --- helpers ---
function lastValue(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].value != null) return Number(series[i].value);
  }
  return null;
}
function qDelta(series) {
  if (!Array.isArray(series) || series.length < 2) return 0;
  const a = series[series.length - 1]?.value;
  const b = series[series.length - 2]?.value;
  return (a != null && b != null) ? Number(a) - Number(b) : 0;
}
function fitOlsTrend(series) {
  // Simple OLS: ln(y) ~ alpha + beta*t  where t = quarter index.
  const ys = (series || []).map((p, i) => [i, p.value])
    .filter(([_, v]) => v != null && Number(v) > 0)
    .map(([i, v]) => [i, Math.log(Number(v))]);
  if (ys.length < 4) return { alpha: 0, beta: 0, sigma_residual: 0 };
  const n = ys.length;
  const sumT = ys.reduce((s, [t]) => s + t, 0);
  const sumY = ys.reduce((s, [, y]) => s + y, 0);
  const sumTT = ys.reduce((s, [t]) => s + t * t, 0);
  const sumTY = ys.reduce((s, [t, y]) => s + t * y, 0);
  const beta = (n * sumTY - sumT * sumY) / (n * sumTT - sumT * sumT);
  const alpha = (sumY - beta * sumT) / n;
  const residuals = ys.map(([t, y]) => y - (alpha + beta * t));
  const sigma2 = residuals.reduce((s, r) => s + r * r, 0) / (n - 2);
  return { alpha, beta, sigma_residual: Math.sqrt(sigma2) };
}
