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

// Input adapters — map raw sources to compute-module input shape.
// v1: minimal stubs returning shape-compliant defaults; data wiring iterates in v1.1.
function buildDelevInput(payload)      { return {}; }
function buildInflationInput(payload)  { return {}; }
function buildParadigmsInput(payload)  { return { decadeReturns: { SPX:{d2000s:0,d2010s:0}, UST10:{d2000s:0,d2010s:0}, Tbill:{d2000s:0,d2010s:0}, Gold:{d2000s:0,d2010s:0}, Cmdty:{d2000s:0,d2010s:0} } }; }
function buildWorldOrderInput(payload) { return { panel: { USA: {}, CHN: {} }, anchors: { max: 1.9, min: -1.5 } }; }
function deriveVols(payload, keys = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities']) {
  // 252-day rolling vol from FRED daily returns; default to Apr-2026 illustrative if missing.
  const defaults = { equities: 0.16, int_treasury: 0.06, treasury10: 0.06, long_treasury: 0.13, gold: 0.15, commodities: 0.18 };
  const out = {};
  for (const k of keys) out[k] = defaults[k];
  return out;
}
