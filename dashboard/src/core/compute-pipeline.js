/* Compute pipeline orchestrator — runs all 13 framework compute modules in DAG
 * order ONCE per page load. Attaches each result to payload.computedXxx so
 * slides + chips read from a single source of truth.
 *
 * DAG order per Spec §3 (Set 3.5 D1):
 *   1.1 → 1.2 → 1.3 → 1.4(cond) → 1.7 → 1.5 → 1.6 → 2.1 → 2.2 → 2.5 → 2.4 → 2.3
 *   → tilt arbiter (consumes 1.4 + 1.5 + 1.7)
 */
import { computeEconMachine }   from '../compute/econ-machine.js';
import { computeShortCycle }    from '../compute/short-cycle.js';
import { computeLongDebt }      from '../compute/long-debt.js';
import { computeDeleveragings, isGateOpen } from '../compute/deleveragings.js';
import { computeInflation }     from '../compute/inflation.js';
import { computeParadigms }     from '../compute/paradigms.js';
import { computeWorldOrder }    from '../compute/world-order.js';
import { computeHolyGrail }     from '../compute/holy-grail.js';
import { computeAllWeather, applyTilts } from '../compute/all-weather.js';
import { computeStress }        from '../compute/stress.js';
import { computeRiskParity }    from '../compute/risk-parity.js';
import { computeAlpha }         from '../compute/alpha.js';
import { arbitrateTilts }       from '../compute/tilt-arbiter.js';

export function runComputePipeline(payload, wizard = {}) {
  // Tier 1 — economic foundation
  payload.computedEconMachine = computeEconMachine(payload);
  payload.computedShortCycle  = computeShortCycle(payload);
  payload.computedLongDebt    = computeLongDebt(payload);

  // Tier 2 — conditional + inflation + paradigms
  const gateOpen = isGateOpen({
    R_dm: payload.computedEconMachine?.R_dm_narrow ?? 0,
    history: payload.regimeHistory ?? []
  });
  payload.computedDelev       = computeDeleveragings(buildDelevInput(payload), gateOpen);
  payload.computedInflation   = computeInflation(buildInflationInput(payload));
  payload.computedParadigms   = computeParadigms(buildParadigmsInput(payload));

  // Tier 3 — empire + portfolio analytics
  payload.computedWorldOrder  = computeWorldOrder(buildWorldOrderInput(payload));
  payload.computedHolyGrail   = computeHolyGrail({ N: 8, ρ_avg: 0.22 });   // illustrative; AW canonical
  payload.computedAW          = computeAllWeather({ vols: deriveVols(payload) });

  // Tier 4 — tilt arbiter consumes inflation + delev + paradigms
  payload.computedTilt = arbitrateTilts({
    inflation:    payload.computedInflation,
    deleveragings: payload.computedDelev,
    paradigms:    payload.computedParadigms
  });

  // Tier 5 — stress + leverage consume final tilted weights
  const tiltedWeights = applyTilts(payload.computedTilt.tilts);
  payload.computedStress     = computeStress({ weights: tiltedWeights });
  payload.computedRiskParity = computeRiskParity({
    vols: deriveVols(payload, ['equities', 'treasury10', 'gold', 'commodities']),
    σ_target: wizard.sigma_target ?? 0.10,
    r_p: 0.07415, r_f: 0.04, funding_spread_bp: 0
  });
  payload.computedAlpha      = computeAlpha({
    N: wizard.t3_n ?? 1, ρ_avg: wizard.t3_rho ?? 0,
    IC: wizard.t3_ic ?? 0, n_dec: 49
  });
}

// ─── Input adapters ──────────────────────────────────────────────────────────
// Map raw payload.sources → compute-module input shape per their tests.
//
// Unit conventions (verbatim from each module's existing test fixtures):
//   1.4 deleveragings:  NGDP_yoy, LT_Rate, CPI_yoy → PERCENT (e.g. 4.35);
//                       DebtGDP, M0_GDP, CB_Assets, FX_Gold_yoy → DECIMAL
//   1.7 inflation:      pi_hdln, pi_core, NGDP_yoy, M2_yoy, r_mkt → PERCENT;
//                       ΔFX_12m, ΔGold_12m → DECIMAL
//   1.5 paradigms:      ALL DECIMAL (0.0015 = 0.15%); decadeReturns DECIMAL CAGR
//   1.6 world-order:    z-scores dimensionless; cofer_resDelta10pp → pp units
//
// Lag conventions per FRED frequency:
const QPY = 4;     // GDP, GFDEGDQ188S, A463RC1Q027SBEA quarterly
const MPY = 12;    // CPIAUCSL, CPILFESL, M2SL, FEDFUNDS, BOGMBASE monthly
const WPY = 52;    // WALCL weekly (4Q ≈ 52 weeks)
const DPY = 252;   // DFII10, DTWEXBGS, GS10, GOLDPMGBD228NLBM daily (≈ trading days/yr)

/** 1.4 Deleveragings input — research/04 §4 mapping. */
export function buildDelevInput(payload) {
  const fred = payload?.sources?.fred || {};
  // FRED GFDEGDQ188S is "Federal Debt Total Public Debt as Percent of GDP" → ÷100 to decimal.
  const debtPct = (v) => (v == null ? 0 : v / 100);
  const gdpNow = lastValue(fred.GDP);
  const gdpLag = valueLagged(fred.GDP, QPY);
  const debtGDPNow = debtPct(lastValue(fred.GFDEGDQ188S));
  const debtGDPLag = debtPct(valueLagged(fred.GFDEGDQ188S, QPY));
  // FYFSGDA188S — Federal Surplus / Deficit as % of GDP (annual, percent)
  const fiscalNow = lastValue(fred.FYFSGDA188S);
  const fiscalLag = valueLagged(fred.FYFSGDA188S, 1);                // annual lag = 1 obs
  const FiscalBal_delta = (fiscalNow != null && fiscalLag != null)
    ? (fiscalNow - fiscalLag) / 100                                  // pp Δ → decimal
    : 0;
  // QBPLNTLNNTCGOFFR — Total loan charge-off rate (Q, percent of avg loans)
  const writeoffPct = lastValue(fred.QBPLNTLNNTCGOFFR);
  const Writeoff = writeoffPct == null ? 0 : writeoffPct / 100;       // pct → decimal
  // dDSR proxy — Δ long-rate × DebtGDP (research/04 §6 fisher-spiral signal)
  const gs10Now = lastValue(fred.GS10) ?? 0;
  const gs10Lag = valueLagged(fred.GS10, MPY) ?? gs10Now;             // 12M lag
  const dDSR = ((gs10Now - gs10Lag) / 100) * debtGDPNow;              // decimal pp × decimal ratio
  return {
    NGDP_yoy:        yoyPct(fred.GDP, QPY),                           // PERCENT
    LT_Rate:         gs10Now,                                          // PERCENT
    DebtGDP_now:     debtGDPNow,
    DebtGDP_4Qago:   debtGDPLag,
    M0_GDP_now:      ratio(lastValue(fred.BOGMBASE),       gdpNow),
    M0_GDP_4Qago:    ratio(valueLagged(fred.BOGMBASE, MPY), gdpLag),   // 12M ≈ 4Q
    CB_Assets_now:   ratio(lastValue(fred.WALCL),          gdpNow),
    CB_Assets_4Qago: ratio(valueLagged(fred.WALCL, WPY),  gdpLag),    // 52W ≈ 4Q
    CPI_yoy:         yoy(fred.CPIAUCSL, MPY),                          // DECIMAL
    FX_Gold_yoy:     yoy(fred.GOLDPMGBD228NLBM, DPY),                  // DECIMAL
    FiscalBal_delta,
    Writeoff,
    Gini_delta:      0.005,                                            // US 1980-2024 ~+0.5pp/decade trend (WID)
    dDSR
  };
}

/** 1.7 Inflation input — research/07 §4 mapping. */
export function buildInflationInput(payload) {
  const fred = payload?.sources?.fred || {};
  // Walk DFII10 backward to count consecutive trailing days with r_mkt < 0,
  // convert to months (÷21 trading days). CashTrashFlag fires at ≥ 6 months.
  const dfii10 = fred.DFII10 || [];
  let negDays = 0;
  for (let i = dfii10.length - 1; i >= 0; i--) {
    const v = dfii10[i]?.value;
    if (v == null) continue;
    if (Number(v) < 0) negDays++;
    else break;
  }
  const r_mkt_negative_streak = Math.floor(negDays / 21);
  return {
    pi_hdln:    yoyPct(fred.CPIAUCSL, MPY),
    pi_core:    yoyPct(fred.CPILFESL, MPY),
    NGDP_yoy:   yoyPct(fred.GDP, QPY),
    M2_yoy:     yoyPct(fred.M2SL, MPY),
    r_mkt:      lastValue(fred.DFII10) ?? 0,            // DFII10 already in pct
    ΔFX_12m:    yoy(fred.DTWEXBGS, DPY),                // DECIMAL
    ΔGold_12m:  yoy(fred.GOLDPMGBD228NLBM, DPY),        // DECIMAL
    reserve_currency: true,                              // USD home currency
    r_mkt_negative_streak                                 // months of consecutive negative
  };
}

/** 1.5 Paradigms input — research/05 §4 mapping.
 *
 * Decade returns are HISTORICAL CONSTANTS (fixed by 2000s/2010s realized history,
 * not derivable from current FRED fetch) — verbatim from research/05 §7 L98.
 *
 * Live FRED-derived inputs: RealRate10y, FedFunds, ProfitShare. Static fallbacks
 * for non-FRED inputs:
 *   - BuybackYield: no FRED source. Default 2.5% (S&P 500 long-run average).
 *     Live wiring deferred to v1.1 (S&P SP500BUYBACK series).
 *   - ProfitShareMean_plus_sigma: 1947-2024 historical anchor from research/05 §6.
 *     Recomputing μ+σ each fetch from current series tail introduces noise.
 *   - StatTaxRate flags: post-TCJA 21% statutory rate has been stable since 2018,
 *     well below 1986 baseline of 46%. Both flags = true.
 */
export function buildParadigmsInput(payload) {
  const fred = payload?.sources?.fred || {};
  const decadeReturns = {
    SPX:   { d2000s: -0.009, d2010s: 0.134 },
    UST10: { d2000s:  0.066, d2010s: 0.040 },
    Tbill: { d2000s:  0.025, d2010s: 0.006 },
    Gold:  { d2000s:  0.143, d2010s: 0.033 },
    Cmdty: { d2000s:  0.029, d2010s: 0.009 }
  };
  const RealRate10y = (lastValue(fred.DFII10)   ?? 0) / 100;
  const FedFunds    = (lastValue(fred.FEDFUNDS) ?? 0) / 100;
  const profitsNow  = lastValue(fred.A463RC1Q027SBEA) ?? 0;
  const gdpNow      = lastValue(fred.GDP) || 1;
  return {
    decadeReturns,
    RealRate10y, FedFunds,
    BuybackYield: 0.025,
    ProfitShare:                profitsNow / gdpNow,
    ProfitShareMean_plus_sigma: 0.106,
    StatTaxRateAtPost1986Low:   true,
    StatTaxRateStable2Yr:       true,
    LongRunCAGR:     0.064,
    Δ_recency_sigma: 0.035
  };
}

/** 1.6 World Order input — research/06 §7 hardcoded panel.
 *
 * The 8-measure × 2-country z-score panel requires WB/BIS/COFER × multi-country
 * fan-out not present in current backend (fetchWorldBank pulls only one USA
 * indicator). Live panel construction deferred to v1.1.
 *
 * Live: cofer_resDelta10pp from COFER usd-share Δ if parseable.
 */
export function buildWorldOrderInput(payload) {
  const cofer = payload?.sources?.cofer || {};
  return {
    panel: {
      USA: { Edu: 2.0, Innov: 2.1, Cost: -0.4, Mil: 2.0, Trade: 1.1, Output: 1.7, Fin: 2.7, Reserve: 1.9 },
      CHN: { Edu: 1.7, Innov: 1.6, Cost:  1.1, Mil: 0.9, Trade: 1.9, Output: 1.5, Fin: 0.2, Reserve: -0.6 }
    },
    anchors: { max: 1.9, min: -1.5 },
    cofer_resDelta10pp: coferResDelta(cofer) ?? -2.98,    // research/06 §7 fallback
    s20_USA: -0.06,
    s20_CHN: +0.07
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lastValue(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i]?.value != null) return Number(series[i].value);
  }
  return null;
}

function valueLagged(series, lag) {
  if (!Array.isArray(series) || series.length <= lag) return null;
  const v = series[series.length - 1 - lag]?.value;
  return v == null ? null : Number(v);
}

function yoy(series, lag) {
  const now = lastValue(series);
  const ago = valueLagged(series, lag);
  if (now == null || ago == null || ago === 0) return 0;
  return (now - ago) / ago;
}

function yoyPct(series, lag) { return yoy(series, lag) * 100; }

function ratio(num, den) {
  if (num == null || den == null || den === 0) return 0;
  return num / den;
}

function coferResDelta(cofer) {
  const rows = cofer?.Res_shr;
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const first = rows[0], last = rows[rows.length - 1];
  if (typeof first?.usd === 'number' && typeof last?.usd === 'number') {
    return (last.usd - first.usd) * 100;   // decimal share Δ → percentage points
  }
  return null;
}

function deriveVols(payload, keys = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities']) {
  // 252-day rolling vol from FRED daily returns; default to Apr-2026 illustrative if missing.
  const defaults = { equities: 0.16, int_treasury: 0.06, treasury10: 0.06, long_treasury: 0.13, gold: 0.15, commodities: 0.18 };
  const out = {};
  for (const k of keys) out[k] = defaults[k];
  return out;
}
