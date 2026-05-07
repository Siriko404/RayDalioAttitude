import { describe, it, expect } from 'vitest';

describe('stress compute', () => {
  it('Table 7.1 byte-exact (research/12 §7): Defl=−8.125, Infl=−26.000, Stag=−3.050, Refl=+11.825', async () => {
    const { computeStress } = await import('../../src/compute/stress.js');
    const r = computeStress({
      weights: { equities: 0.30, long_treasury: 0.40, int_treasury: 0.15, gold: 0.075, commodities: 0.075 }
    });
    expect(r.R_port_pct.deflationary).toBeCloseTo(-8.125, 3);
    expect(r.R_port_pct.inflationary).toBeCloseTo(-26.000, 3);
    expect(r.R_port_pct.stagflation).toBeCloseTo(-3.050, 3);
    expect(r.R_port_pct.reflation).toBeCloseTo(+11.825, 3);
  });

  it('Asymmetry ratio = 26.00 / 3.05 = 8.52× → RED (research/12 §7 L148)', async () => {
    const { computeStress } = await import('../../src/compute/stress.js');
    const r = computeStress({
      weights: { equities: 0.30, long_treasury: 0.40, int_treasury: 0.15, gold: 0.075, commodities: 0.075 }
    });
    expect(r.asymmetry_ratio).toBeCloseTo(8.52, 1);
    expect(r.dominant_tail.regime).toBe('inflationary');
    expect(r.tail_band).toBe('AMBER');  // Per Set 3.5 D5: AMBER 5-9.99×, RED ≥10×
  });

  it('Tail band per Set 3.5 D5: GREEN <5×, AMBER 5-9.99×, RED ≥10×', async () => {
    const { tailBand } = await import('../../src/compute/stress.js');
    expect(tailBand(3)).toBe('GREEN');
    expect(tailBand(8.52)).toBe('AMBER');
    expect(tailBand(10)).toBe('RED');
  });

  it('Dominant driver per archetype = max |w_i · S_{i,e}|', async () => {
    const { computeStress } = await import('../../src/compute/stress.js');
    const r = computeStress({
      weights: { equities: 0.30, long_treasury: 0.40, int_treasury: 0.15, gold: 0.075, commodities: 0.075 }
    });
    expect(r.dominant_per_archetype.deflationary).toBe('equities');     // -15.00ppt
    expect(r.dominant_per_archetype.inflationary).toBe('long_treasury'); // -20.00ppt
  });
});
