import { describe, it, expect } from 'vitest';

describe('alpha compute', () => {
  it('Dalio Chart 5 P1: N=6, ρ=0.25, IC=0.05, n_dec=49 (7yr quarterly) → IR_slice=0.35, IR_port≈0.571', async () => {
    const { computeAlpha } = await import('../../src/compute/alpha.js');
    const r = computeAlpha({ N: 6, ρ_avg: 0.25, IC: 0.05, n_dec: 49 });
    expect(r.IR_slice).toBeCloseTo(0.35, 2);
    expect(r.IR_port).toBeCloseTo(0.571, 2);
    expect(r.eligible).toBe(true);   // ≥ 0.30
  });

  it('Chart 5 P2: N=77, ρ=0.04 → IR_port≈1.528 (chart says 1.4; rounding implies ρ=0.05 vs 0.04)', async () => {
    const { computeAlpha } = await import('../../src/compute/alpha.js');
    const r = computeAlpha({ N: 77, ρ_avg: 0.04, IC: 0.05, n_dec: 49 });
    expect(r.IR_port).toBeCloseTo(1.528, 2);
  });

  it('IR_slice < 0.15 → retire flag set', async () => {
    const { computeAlpha } = await import('../../src/compute/alpha.js');
    const r = computeAlpha({ N: 6, ρ_avg: 0.25, IC: 0.02, n_dec: 49 });
    expect(r.IR_slice).toBeLessThan(0.15);
    expect(r.retire).toBe(true);
  });
});
