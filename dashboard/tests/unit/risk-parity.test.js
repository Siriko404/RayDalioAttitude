import { describe, it, expect } from 'vitest';

// Plan-deviation note (same pattern as T38 / all-weather): plan T40 step-1 omitted the
// correlation matrix, but research/11 §7 L138-145 explicitly publishes a non-identity
// 4×4 correlation matrix. Identity gives σ_p=5.69% (with all w·σ equal); the canonical
// 6.037% requires the published matrix (Σ_{i<j} ρ_ij = +0.25 → off-diagonal +4.05e-4).
// Test passes the research §7 matrix verbatim.

const RP_CORR = [
  [ 1.00, -0.30,  0.05,  0.20],   // SPX (equities)
  [-0.30,  1.00,  0.10, -0.15],   // UST10 (treasury10)
  [ 0.05,  0.10,  1.00,  0.35],   // Gold
  [ 0.20, -0.15,  0.35,  1.00]    // BCOM (commodities)
];

describe('riskParity compute', () => {
  it('Apr-2026 canonical (research/11 §7): inverse-vol weights, σ_p≈6.037%, L≈1.656×', async () => {
    const { computeRiskParity } = await import('../../src/compute/risk-parity.js');
    const r = computeRiskParity({
      vols: { equities: 0.16, treasury10: 0.06, gold: 0.15, commodities: 0.18 },
      corrMatrix: RP_CORR,
      σ_target: 0.10,
      r_p: 0.07415,
      r_f: 0.04,
      funding_spread_bp: 0
    });
    expect(r.σ_p_pct).toBeCloseTo(6.037, 2);
    expect(r.L).toBeCloseTo(1.656, 2);
    expect(r.weights.equities).toBeCloseTo(0.1779, 3);  // 17.79%
    expect(r.weights.treasury10).toBeCloseTo(0.4743, 3); // 47.43%
  });

  it('Sharpe drag matches Table 7.1 col2: 0bp→0.566, 25bp→0.549, 100bp→0.500', async () => {
    const { computeRiskParity } = await import('../../src/compute/risk-parity.js');
    const base = { vols: { equities: 0.16, treasury10: 0.06, gold: 0.15, commodities: 0.18 }, corrMatrix: RP_CORR, σ_target: 0.10, r_p: 0.07415, r_f: 0.04 };
    expect(computeRiskParity({ ...base, funding_spread_bp: 0   }).SR_lev).toBeCloseTo(0.566, 2);
    expect(computeRiskParity({ ...base, funding_spread_bp: 25  }).SR_lev).toBeCloseTo(0.549, 2);
    expect(computeRiskParity({ ...base, funding_spread_bp: 100 }).SR_lev).toBeCloseTo(0.500, 2);
  });

  it('Hard cap L ≤ 3.0×', async () => {
    const { computeRiskParity } = await import('../../src/compute/risk-parity.js');
    const r = computeRiskParity({
      vols: { equities: 0.05, treasury10: 0.02, gold: 0.04, commodities: 0.05 },
      σ_target: 0.20, r_p: 0.10, r_f: 0.04
    });
    expect(r.L).toBeLessThanOrEqual(3.0);
  });

  it('Funding-spread bands: GREEN ≤25bp; AMBER 25-100bp; RED >100bp', async () => {
    const { fundingSpreadBand } = await import('../../src/compute/risk-parity.js');
    expect(fundingSpreadBand(20)).toBe('GREEN');
    expect(fundingSpreadBand(50)).toBe('AMBER');
    expect(fundingSpreadBand(150)).toBe('RED');
  });

  it('Margin buffer = 5% × (L−1) of NAV', async () => {
    const { marginBuffer } = await import('../../src/compute/risk-parity.js');
    expect(marginBuffer(1.656)).toBeCloseTo(0.0328, 4);
  });
});
