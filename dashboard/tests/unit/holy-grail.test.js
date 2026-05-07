import { describe, it, expect } from 'vitest';

describe('holyGrail compute', () => {
  it('Dalio Chart 5 P1: N=6, ρ=0.25 → N_eff=2.667, σ_p/σ=0.6124, σ-red≈38.76%', async () => {
    const { computeHolyGrail } = await import('../../src/compute/holy-grail.js');
    const r = computeHolyGrail({ N: 6, ρ_avg: 0.25 });
    expect(r.N_eff).toBeCloseTo(2.667, 2);
    expect(r.σ_p_over_σ).toBeCloseTo(0.6124, 3);
    expect(r.σ_reduction_pct).toBeCloseTo(38.76, 1);
    expect(r.HolyGrailRegime).toBe('NONE');
  });

  it('P2: N=77, ρ=0.04 → N_eff=19.06 → FULL', async () => {
    const { computeHolyGrail } = await import('../../src/compute/holy-grail.js');
    const r = computeHolyGrail({ N: 77, ρ_avg: 0.04 });
    expect(r.N_eff).toBeCloseTo(19.06, 1);
    expect(r.HolyGrailRegime).toBe('FULL');
  });

  it('regime thresholds: N_eff < 5 NONE; 5-14 PARTIAL; ≥15 FULL', async () => {
    const { classifyHolyGrailRegime } = await import('../../src/compute/holy-grail.js');
    expect(classifyHolyGrailRegime(3)).toBe('NONE');
    expect(classifyHolyGrailRegime(10)).toBe('PARTIAL');
    expect(classifyHolyGrailRegime(15)).toBe('FULL');
  });

  it('ρ̄ tag: <0.10 UNCORRELATED; 0.10-0.30 LIGHTLY; 0.30-0.70 HIGHLY; ≥0.70 DOMINATED', async () => {
    const { classifyRhoTag } = await import('../../src/compute/holy-grail.js');
    expect(classifyRhoTag(0.05)).toBe('UNCORRELATED');
    expect(classifyRhoTag(0.20)).toBe('LIGHTLY-CORRELATED');
    expect(classifyRhoTag(0.50)).toBe('HIGHLY-CORRELATED');
    expect(classifyRhoTag(0.80)).toBe('DOMINATED');
  });
});
