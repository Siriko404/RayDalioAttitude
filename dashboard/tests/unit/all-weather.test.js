import { describe, it, expect } from 'vitest';

// Plan-deviation note: T38 step-1 test specified `corrMatrix: 'identity'` but research/09
// §7 L127-133 defines an explicit non-identity correlation matrix (LT-IT ρ=+0.90, SPX-LT
// ρ=−0.20, SPX-Comm ρ=+0.25, etc.). The canonical σ_p=7.510% AND RC% rows (SPX 34.20% /
// LT 46.87%) reproduce ONLY with that matrix; identity yields σ_p=7.347%. Test below uses
// the research §7 matrix verbatim (re-indexed to SLEEVE_ORDER eq/IT/LT/gold/comm).

// Research §7 matrix order is SPX, LT, IT, Gold, Comm; plan SLEEVE_ORDER is
// eq, int_treasury, long_treasury, gold, comm. Re-indexed below:
const APR2026_CORR = [
  [ 1.00, -0.15, -0.20,  0.05,  0.25],  // equities (SPX)
  [-0.15,  1.00,  0.90,  0.10, -0.05],  // int_treasury (IT)
  [-0.20,  0.90,  1.00,  0.15, -0.10],  // long_treasury (LT)
  [ 0.05,  0.10,  0.15,  1.00,  0.35],  // gold
  [ 0.25, -0.05, -0.10,  0.35,  1.00]   // commodities
];

describe('allWeather compute', () => {
  it('canonical Robbins/Dalio weights = 30/15/40/7.5/7.5', async () => {
    const { AW_BASELINE_WEIGHTS } = await import('../../src/compute/all-weather.js');
    expect(AW_BASELINE_WEIGHTS).toEqual({
      equities: 0.30, int_treasury: 0.15, long_treasury: 0.40, gold: 0.075, commodities: 0.075
    });
  });

  it('Apr-2026 canonical illustrative: σ_p ≈ 7.510%, SPX RC%≈34.20%, LT RC%≈46.87% (research/09 §7)', async () => {
    const { computeAllWeather } = await import('../../src/compute/all-weather.js');
    const r = computeAllWeather({
      vols: { equities: 0.16, int_treasury: 0.06, long_treasury: 0.13, gold: 0.15, commodities: 0.18 },
      corrMatrix: APR2026_CORR
    });
    expect(r.σ_p).toBeCloseTo(0.0751, 3);
    expect(r.RC_pct.equities).toBeCloseTo(34.20, 1);
    expect(r.RC_pct.long_treasury).toBeCloseTo(46.87, 1);
  });

  it('Drift band: GREEN < 3%; AMBER 3-5%; RED > 5% (research/09 §6)', async () => {
    const { driftBand } = await import('../../src/compute/all-weather.js');
    expect(driftBand({ equities: 0.31 }, { equities: 0.30 })).toBe('GREEN');
    expect(driftBand({ equities: 0.34 }, { equities: 0.30 })).toBe('AMBER');
    expect(driftBand({ equities: 0.36 }, { equities: 0.30 })).toBe('RED');
  });

  it('applyTilts respects ±10pt aggregate cap (Spec §6 + research/07 §6 L132)', async () => {
    const { applyTilts } = await import('../../src/compute/all-weather.js');
    const tilted = applyTilts({ gold: +15, bonds: -15 });  // > 10pt — must clip
    expect(Math.abs(tilted.gold - 0.075)).toBeLessThanOrEqual(0.10 + 1e-9);
    expect(tilted.long_treasury + tilted.int_treasury + tilted.equities + tilted.gold + tilted.commodities).toBeCloseTo(1.0, 6);
  });
});
