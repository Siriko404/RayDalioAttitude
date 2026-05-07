import { describe, it, expect } from 'vitest';

describe('worldOrder compute', () => {
  it('USA Apr-2022 canonical (research/06 §7 L143-148): CPI≈0.923 → DECLINE', async () => {
    const { computeWorldOrder } = await import('../../src/compute/world-order.js');
    const r = computeWorldOrder({
      panel: {
        USA: { Edu: 2.0, Innov: 2.1, Cost: -0.4, Mil: 2.0, Trade: 1.1, Output: 1.7, Fin: 2.7, Reserve: 1.9 },
        CHN: { Edu: 1.7, Innov: 1.6, Cost: 1.1, Mil: 0.9, Trade: 1.9, Output: 1.5, Fin: 0.2, Reserve: -0.6 }
      },
      anchors: { max: 1.9, min: -1.5 },
      cofer_resDelta10pp: -2.98,
      s20_USA: -0.06,
      s20_CHN: +0.07
    });
    expect(r.CPI.USA).toBeCloseTo(0.923, 2);
    expect(r.CPI.CHN).toBeCloseTo(0.746, 2);
    expect(r.StageTag.USA).toBe('DECLINE');
    expect(r.StageTag.CHN).toBe('RISE');
    expect(r.HegemonyRisk).toBe('ELEVATED');
  });

  it('cntNeg = number of measures where z_USA − z_CHN ≤ 0', async () => {
    const { computeWorldOrder } = await import('../../src/compute/world-order.js');
    const r = computeWorldOrder({
      panel: {
        USA: { Edu: 2.0, Innov: 2.1, Cost: -0.4, Mil: 2.0, Trade: 1.1, Output: 1.7, Fin: 2.7, Reserve: 1.9 },
        CHN: { Edu: 1.7, Innov: 1.6, Cost: 1.1, Mil: 0.9, Trade: 1.9, Output: 1.5, Fin: 0.2, Reserve: -0.6 }
      },
      anchors: { max: 1.9, min: -1.5 },
      cofer_resDelta10pp: -2.98,
      s20_USA: -0.06, s20_CHN: 0.07
    });
    expect(r.cntNeg).toBe(2);  // Cost (−0.4 vs +1.1, diff=−1.5 ≤ 0); Trade (1.1 vs 1.9, diff=−0.8 ≤ 0)
  });

  it('HegemonyRisk: LOW if cntNeg≤1 AND resDelta≥0; ELEVATED 2-3 + −1 to −10pp; HIGH ≥4 + <−10pp', async () => {
    const { classifyHegemonyRisk } = await import('../../src/compute/world-order.js');
    expect(classifyHegemonyRisk(0, +1)).toBe('LOW');
    expect(classifyHegemonyRisk(2, -3)).toBe('ELEVATED');
    expect(classifyHegemonyRisk(5, -15)).toBe('HIGH');
  });
});
