/* 1.4 Deleveragings — research/04 §5-§6 + Spec §3 conditional gate.
 * G = NGDP_yoy − LT_Rate.
 * ΔD = DebtGDP_t − DebtGDP_{t-4}.
 * π = (M0_GDP delta) + (CB_Assets delta) over 4Q.
 * Lever decomposition: L_aust, L_def, L_print, L_redist (pp of GDP).
 *
 * Regime classifier (research/04 §6):
 *   UGLY_DEFLATIONARY: G < 0 AND ΔD > 0
 *   BEAUTIFUL:         G > 0 AND ΔD < 0 AND π moderate (0.5%-4%)
 *   UGLY_INFLATIONARY: G > 0 AND CPI > LT_Rate AND FX_Gold < -20% p.a.
 */

const PI_MODERATE_LO = 0.005;   // 0.5%
const PI_MODERATE_HI = 0.04;    // 4%

export function computeDeleveragings(input, gateOpen) {
  if (!gateOpen) {
    return { regime: 'NOT_DELEVERAGING', gateOpen: false, emits: ['regime'] };
  }

  const G = (input.NGDP_yoy ?? 0) - (input.LT_Rate ?? 0);
  const dD_4q = (input.DebtGDP_now ?? 0) - (input.DebtGDP_4Qago ?? 0);
  const dM0_4q = (input.M0_GDP_now ?? 0) - (input.M0_GDP_4Qago ?? 0);
  const dCB_4q = (input.CB_Assets_now ?? 0) - (input.CB_Assets_4Qago ?? 0);
  const piComputed = dM0_4q + dCB_4q;
  const pi = input['π_proxy'] ?? piComputed;

  // Lever decomposition (pp of GDP):
  const L_aust   = -(input.FiscalBal_delta ?? 0);
  const L_def    =  (input.Writeoff ?? 0) * (input.DebtGDP_now ?? 0);
  const L_print  =  pi;
  const L_redist = -0.1 * (input.Gini_delta ?? 0) * (input.DebtGDP_now ?? 0);
  const sumL = L_aust + L_def + L_print + L_redist || 1e-9;
  const lever_mix = {
    austerity: L_aust / sumL,
    default_: L_def / sumL,
    print: L_print / sumL,
    redistribution: L_redist / sumL
  };

  // Regime classifier (priority: UGLY_INFL > UGLY_DEFL > BEAUTIFUL):
  const cpi_yoy = input.CPI_yoy ?? 0;
  const fx_gold_yoy = input.FX_Gold_yoy ?? 0;
  let regime;
  if (G > 0 && cpi_yoy > (input.LT_Rate ?? 0) && fx_gold_yoy < -0.20) regime = 'UGLY_INFLATIONARY';
  else if (G < 0 && dD_4q > 0) regime = 'UGLY_DEFLATIONARY';
  else if (G > 0 && dD_4q < 0 && pi >= PI_MODERATE_LO && pi <= PI_MODERATE_HI) regime = 'BEAUTIFUL';
  else regime = 'TRANSITIONAL';

  // Beautiful score: 1 if G ∈ [0, +3pp] AND ΔD < 0 AND π ∈ [0.5%, 4%]
  const beautiful_score = (G >= 0 && G <= 3 && dD_4q < 0 && pi >= PI_MODERATE_LO && pi <= PI_MODERATE_HI) ? 1 : 0;

  // Fisher spiral: ΔDSR > 0 AND CPI < 0 (deflationary debt deflation)
  const dDSR = input.dDSR ?? 0;
  const fisher_spiral = (dDSR > 0 && cpi_yoy < 0) ? 1 : 0;

  // Gold tilt delta: only emitted when regime = UGLY_DEFLATIONARY (Dalio prescription:
  // print to escape; gold benefits). Per research/04 cross-ref + 1.7's tilt table.
  const gold_tilt_delta_pt = regime === 'UGLY_DEFLATIONARY' ? +5 : 0;

  return {
    regime, gateOpen: true,
    G, dD_4q, pi, lever_mix, beautiful_score, fisher_spiral,
    gold_tilt_delta_pt,
    emits: ['regime', 'lever_mix', 'beautiful_score', 'fisher_spiral']
  };
}

/**
 * Gate hysteresis (Spec §3 + Set 3.5 D1):
 *   Fires when R^{D/M} > 17 instantaneous (narrow-money basis)
 *   OR  debt_money_regime=HIGH AND gap_regime=BELOW_TREND sustained ≥2 consecutive quarters.
 *
 * v1 KNOWN COMPROMISE: under single-fetch-on-load (Set 3.5 D3), there is no
 * cross-session regime history → `history` array is always empty in v1. Only
 * the `R_dm > 17` instantaneous path actually fires in v1.0. Sustained-2Q
 * hysteresis path requires server-side regime journal (deferred to v1.1).
 *
 * @param {{R_dm: number, history: Array<{debt_money_regime: string, gap_regime: string}>}} params
 */
export function isGateOpen({ R_dm, history }) {
  if (R_dm > 17) return true;
  if (!Array.isArray(history) || history.length < 2) return false;
  const last2 = history.slice(-2);
  return last2.every(h => h.debt_money_regime === 'HIGH' && h.gap_regime === 'BELOW_TREND');
}
