/* 1.7 Inflation & Currency Debasement — research/07 §5-§6.
 * Regime precedence: INFLATIONARY > STAGFLATION > BEAUTIFUL > DEFLATIONARY.
 * Reserve-currency tier: π threshold 4% vs 3% (non-reserve).
 *
 * Tilt table (verbatim research/07 §6 + §7 L150-160):
 *   DEFLATIONARY:     gold −2.5  comm −2.5  bonds  0   cash +5
 *   BEAUTIFUL:        all 0
 *   STAGFLATION:      gold +5    comm +5    bonds −5   cash −5  + FXShort +5 long EUR/JPY
 *   INFLATIONARY:     gold +10   comm +5    bonds −10  cash −5  + FXShort +10 short debasing
 */

const TILT_TABLE = {
  DEFLATIONARY:     { gold: -2.5, commodities: -2.5, bonds:   0, cash: +5,  fx_short: 0 },
  BEAUTIFUL:        { gold:    0, commodities:    0, bonds:   0, cash:  0,  fx_short: 0 },
  STAGFLATION:      { gold:   +5, commodities:   +5, bonds:  -5, cash: -5,  fx_short: +5 },
  INFLATIONARY:     { gold:  +10, commodities:   +5, bonds: -10, cash: -5,  fx_short: +10 }
};

export function computeInflation(input) {
  const { pi_hdln = 0, pi_core = 0, NGDP_yoy = 0, M2_yoy = 0,
          r_mkt = 0, ΔFX_12m = 0, ΔGold_12m = 0,
          reserve_currency = true } = input;

  // Real-rate bucket (at-boundary = upper bucket per research/07 §5.3 L70-74)
  const RealRateBucket =
    r_mkt < -0.5  ? 'DEEPLY_NEG' :
    r_mkt < 0     ? 'MILDLY_NEG' :
    r_mkt < 0.5   ? 'NEUTRAL'    :
    r_mkt < 1.5   ? 'MILDLY_POS' : 'POSITIVE';

  // Monetary separator
  const μ = M2_yoy - NGDP_yoy;
  const monetary_driven = μ > 4;  // sustained ≥4Q check left to caller's history

  // Debase flag (calibration: 1971/2002/2008/2020 trigger; 1995-99/2014-15 don't)
  const DebaseFlag = (ΔFX_12m < -0.07 && ΔGold_12m > +0.15) ? 1 : 0;

  // Regime precedence walk
  const piEdge_inflationary = reserve_currency ? 4 : 3;
  let regime;
  if (pi_hdln > piEdge_inflationary && r_mkt < 0 && DebaseFlag === 1) regime = 'INFLATIONARY';
  else if (pi_hdln > 3 && NGDP_yoy < 2 * pi_hdln) regime = 'STAGFLATION';
  else if (pi_hdln >= 1 && pi_hdln <= 3 && μ > 0 && r_mkt > 0) regime = 'BEAUTIFUL';
  else if (pi_hdln < 1 && r_mkt > 0 && ΔGold_12m < 0) regime = 'DEFLATIONARY';
  else regime = 'BEAUTIFUL';   // fallthrough — moderate steady state

  // Cash trash flag: r_mkt < 0 for ≥6 consecutive months
  const CashTrashFlag = (input.r_mkt_negative_streak ?? 0) >= 6 ? 1 : 0;

  return {
    regime,
    RealRateBucket,
    DebaseFlag,
    CashTrashFlag,
    tilt_deltas: TILT_TABLE[regime],
    pi_hdln, pi_core, μ, monetary_driven,
    emits: ['RegimeTag', 'tilt_deltas', 'DebaseFlag', 'CashTrashFlag', 'RealRateBucket']
  };
}
