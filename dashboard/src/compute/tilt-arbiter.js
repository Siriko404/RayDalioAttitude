/* Tilt arbiter — Spec §6 FR-12 (locked Set 3.5 D7).
 * Precedence (highest → lowest):
 *   1. 1.7 INFLATIONARY → +10pt gold
 *   2. 1.7 STAGFLATION  → +5pt  gold
 *   3. max(1.4 DELEVER gold_tilt_delta_pt, 1.5 gold_overlay = +5 if true)
 *   4. Base AW gold (7.5%) — no delta
 *
 * Aggregate cap: ±10pt per research/07 §6 L132.
 */

const AW_GOLD_BASELINE_PCT = 7.5;
const CAP_PP = 10;

export function arbitrateTilts(emits) {
  const { inflation = {}, deleveragings = {}, paradigms = {} } = emits;
  let gold_pp = 0;
  let binding_rule = null;
  const sources = [];

  // Tier 1: 1.7 INFLATIONARY
  if (inflation.regime === 'INFLATIONARY') {
    gold_pp = inflation.tilt_deltas?.gold ?? +10;
    binding_rule = 'INFLATIONARY';
    sources.push('INFLATIONARY');
  }
  // Tier 2: 1.7 STAGFLATION
  else if (inflation.regime === 'STAGFLATION') {
    gold_pp = inflation.tilt_deltas?.gold ?? +5;
    binding_rule = 'STAGFLATION';
    sources.push('STAGFLATION');
    // Stagflation can co-emit with DELEVER for narrative purposes; surface in label
    if (deleveragings.regime === 'UGLY_DEFLATIONARY' && (deleveragings.gold_tilt_delta_pt ?? 0) > 0) {
      sources.push('DELEVER');
    }
  }
  // Tier 3: max(1.4 DELEVER, 1.5 gold_overlay)
  else {
    const deleverGold = deleveragings.gold_tilt_delta_pt ?? 0;
    const paradigmGold = paradigms.gold_overlay ? +5 : 0;
    if (deleverGold >= paradigmGold && deleverGold > 0) {
      gold_pp = deleverGold;
      binding_rule = 'DELEVER';
      sources.push('DELEVER');
    } else if (paradigmGold > 0) {
      gold_pp = paradigmGold;
      binding_rule = 'PARADIGM';
      sources.push('PARADIGM');
    } else {
      binding_rule = 'BASE_AW';
    }
  }

  // Cap ±10pt (also affects all other sleeves through clipping in all-weather.js)
  const capped = Math.abs(gold_pp) > CAP_PP;
  if (gold_pp > +CAP_PP) gold_pp = +CAP_PP;
  if (gold_pp < -CAP_PP) gold_pp = -CAP_PP;

  // Other sleeves pass through directly from 1.7 (no arbitration needed):
  const tilts = {
    gold:        gold_pp,
    commodities: inflation.tilt_deltas?.commodities ?? 0,
    bonds:       inflation.tilt_deltas?.bonds ?? 0,
    cash:        inflation.tilt_deltas?.cash ?? 0,
    fx_short:    inflation.tilt_deltas?.fx_short ?? 0
  };

  // Build human-readable label
  const finalGoldPct = AW_GOLD_BASELINE_PCT + gold_pp;
  const arrow = gold_pp > 0 ? '↑' : gold_pp < 0 ? '↓' : '·';
  const sourceStr = sources.length > 0 ? sources.join(' + ') : 'BASE';
  const cappedSuffix = capped ? ' · capped' : '';
  const binding_label = `Gold: ${finalGoldPct.toFixed(1)}% (${arrow}${Math.abs(gold_pp)}pt) · source: ${sourceStr}${cappedSuffix}`;

  return { gold_pp, tilts, binding_rule, binding_label, capped, sources };
}
