import { describe, it, expect } from 'vitest';

describe('inflation compute', () => {
  it('2022-Q2 canonical (research/07 §7 L161): π_hdln=8.5%, r_mkt=−0.5%, μ=−2%, ΔFX=+8%, ΔGold=+1.5%, DebaseFlag=0 → STAGFLATION', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({
      pi_hdln: 8.5, pi_core: 6.0, NGDP_yoy: 6.0, M2_yoy: 4.0,
      r_mkt: -0.5, ΔFX_12m: +0.08, ΔGold_12m: +0.015,
      reserve_currency: true
    });
    expect(r.regime).toBe('STAGFLATION');
    expect(r.tilt_deltas.gold).toBe(+5);
    expect(r.tilt_deltas.commodities).toBe(+5);
    expect(r.tilt_deltas.bonds).toBe(-5);
    expect(r.tilt_deltas.cash).toBe(-5);
    expect(r.RealRateBucket).toBe('MILDLY_NEG');
  });

  it('INFLATIONARY (reserve): π>4% AND r_mkt<0 AND DebaseFlag=1 → tilt gold +10pt', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({
      pi_hdln: 7.0, NGDP_yoy: 3.0, M2_yoy: 12.0,
      r_mkt: -1.5, ΔFX_12m: -0.10, ΔGold_12m: +0.20, reserve_currency: true
    });
    expect(r.regime).toBe('INFLATIONARY');
    expect(r.DebaseFlag).toBe(1);
    expect(r.tilt_deltas.gold).toBe(+10);
  });

  it('BEAUTIFUL: 1% ≤ π ≤ 3% AND μ>0 AND r_mkt>0 → all tilts 0', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({ pi_hdln: 2.0, NGDP_yoy: 4.5, M2_yoy: 5.0, r_mkt: +0.5 });
    expect(r.regime).toBe('BEAUTIFUL');
    expect(r.tilt_deltas.gold).toBe(0);
  });

  it('DEFLATIONARY: π<1% AND r_mkt>0 AND ΔGold<0 → tilt cash +5pt', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    const r = computeInflation({ pi_hdln: 0.5, NGDP_yoy: 1.0, M2_yoy: 2.0, r_mkt: +1.0, ΔGold_12m: -0.05 });
    expect(r.regime).toBe('DEFLATIONARY');
    expect(r.tilt_deltas.cash).toBe(+5);
  });

  it('RealRateBucket boundaries: at-boundary falls in upper bucket', async () => {
    const { computeInflation } = await import('../../src/compute/inflation.js');
    expect(computeInflation({ r_mkt: -1.0, pi_hdln: 5 }).RealRateBucket).toBe('DEEPLY_NEG');
    expect(computeInflation({ r_mkt: -0.5, pi_hdln: 5 }).RealRateBucket).toBe('MILDLY_NEG');
    expect(computeInflation({ r_mkt: 0.0, pi_hdln: 5 }).RealRateBucket).toBe('NEUTRAL');
    expect(computeInflation({ r_mkt: 0.5, pi_hdln: 2 }).RealRateBucket).toBe('MILDLY_POS');
    expect(computeInflation({ r_mkt: 1.5, pi_hdln: 2 }).RealRateBucket).toBe('POSITIVE');
  });
});
