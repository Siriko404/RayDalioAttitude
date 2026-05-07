/* 1.2 Short-Term Cycle — research/02 §5.1-§5.4 + §6.
 * Phase Boolean flags evaluated in order; first match wins; fallthrough = TRANSITIONAL.
 */

export function computeShortCycle(payload) {
  const fred = payload?.sources?.fred || {};

  // Real GDP qoq SAAR (most recent value)
  const g = lastValue(fred.A191RL1Q225SBEA) ?? 0;
  // Capacity utilization
  const cu = lastValue(fred.TCU) ?? 0;
  // CPI yoy (compute from CPIAUCSL last 12M ratio if not pre-computed)
  const cpi_yoy_now = computeYoY(fred.CPIAUCSL, 0);
  const cpi_yoy_prev = computeYoY(fred.CPIAUCSL, 12);
  // Fed funds + 12-month delta
  const ff = lastValue(fred.FEDFUNDS) ?? 0;
  const ff_12m_ago = valueAtOffset(fred.FEDFUNDS, 12) ?? ff;
  const deltaFF12m = ff - ff_12m_ago;
  // Curve
  const t10y3m = lastValue(fred.T10Y3M) ?? 0;
  // Sahm rule (MA3(u) − min over [t−12, t])
  const sahm = computeSahmRule(fred.UNRATE);
  // Months since trough (MST) — use NBER cycle dates if available; else 0
  const mst = (payload?.sources?.nber && estimateMST(payload.sources.nber.recession_dates)) || 0;
  // Δg sign (qoq qoq)
  const g_prev = valueAtOffset(fred.A191RL1Q225SBEA, 1) ?? g;
  const dg = g - g_prev;
  // Δπ sign
  const dpi = cpi_yoy_now - cpi_yoy_prev;
  // 10Y-2Y spread (for tightening flag)
  const spread = lastValue(fred.T10Y2Y) ?? 0;

  // Phase flags (research/02 §5.1):
  const earlyFlag      = g > 4.0 && dg > 0 && dpi < 0 && deltaFF12m <= 0;
  const midFlag        = g >= 1.5 && g <= 2.5 && dg < 0 && Math.abs(deltaFF12m) < 0.5;
  const lateFlag       = g >= 3.5 && g <= 4.0 && dpi > 0 && cu > 78 && mst >= 30;
  const tighteningFlag = deltaFF12m > 0 && spread < 1.0 && cpi_yoy_now > 2.5;

  const policy_stance =
    deltaFF12m < -0.5 ? 'EASING' :
    deltaFF12m > +0.5 ? 'TIGHTENING' : 'NEUTRAL';

  const yc_signal =
    t10y3m < 0    ? 'INVERTED' :
    t10y3m < 1.0  ? 'FLAT'     : 'STEEP';

  const sahm_signal = sahm >= 0.5 ? 'TRIGGERED' : 'NOT_TRIGGERED';

  // Recession phase detection
  const recession_early = sahm_signal === 'TRIGGERED' && (policy_stance === 'NEUTRAL' || policy_stance === 'TIGHTENING');
  const recession_late  = sahm_signal === 'TRIGGERED' && policy_stance === 'EASING';

  const cycle_phase =
    recession_late      ? 'RECESSION_LATE'  :
    recession_early     ? 'RECESSION_EARLY' :
    earlyFlag           ? 'EARLY'           :
    lateFlag            ? 'LATE'            :
    tighteningFlag      ? 'TIGHTENING'      :
    midFlag             ? 'MID'             :
                          'TRANSITIONAL';

  // NY Fed probit recession_prob_12m: P(rec) = Φ(α + β·spread); use precomputed if available
  const recession_prob_12m = payload?.sources?.nyfed?.recession_prob_12m ?? probitFromSpread(spread);
  const recession_prob_label = recession_prob_12m > 0.30 ? 'ELEVATED' : 'NORMAL';

  return {
    cycle_phase, policy_stance, yc_signal, sahm_signal,
    recession_prob_12m, recession_prob_label,
    g, cu, cpi_yoy_now, ff, deltaFF12m, t10y3m, sahm, mst,
    emits: ['cycle_phase', 'recession_prob_12m', 'sahm_signal', 'policy_stance', 'yc_signal']
  };
}

// --- helpers ---
function lastValue(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) if (series[i].value != null) return Number(series[i].value);
  return null;
}
function valueAtOffset(series, offset) {
  if (!Array.isArray(series) || series.length === 0) return null;
  const idx = series.length - 1 - offset;
  return idx < 0 ? null : (series[idx]?.value ?? null);
}
function computeYoY(series, monthsAgo) {
  if (!Array.isArray(series) || series.length < 12) return 0;
  const idx = series.length - 1 - monthsAgo;
  const idxYoY = idx - 12;
  if (idxYoY < 0 || !series[idx] || !series[idxYoY]) return 0;
  return (Number(series[idx].value) / Number(series[idxYoY].value) - 1) * 100;
}
function computeSahmRule(unrate) {
  // MA3(u_t) − min over [t-12, t] u_s
  if (!Array.isArray(unrate) || unrate.length < 12) return 0;
  const last3 = unrate.slice(-3).map(p => Number(p.value)).filter(v => !Number.isNaN(v));
  if (last3.length === 0) return 0;
  const ma3 = last3.reduce((a, b) => a + b, 0) / last3.length;
  const last12 = unrate.slice(-12).map(p => Number(p.value)).filter(v => !Number.isNaN(v));
  const minU = Math.min(...last12);
  return ma3 - minU;
}
function estimateMST(recessionDates) {
  if (!Array.isArray(recessionDates) || recessionDates.length === 0) return 0;
  const lastEnd = recessionDates[0]?.[1];
  if (!lastEnd) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(lastEnd).getTime()) / (30 * 24 * 3600 * 1000)));
}
function probitFromSpread(spread) {
  // NY Fed probit (research/02 §5.4): Φ(α + β·spread); rough approx for fallback only.
  // Use Estrella-Hardouvelis 1998 calibration: α=0.45, β=−1.0
  const z = 0.45 - 1.0 * spread;
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
function erf(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
