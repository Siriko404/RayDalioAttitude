import { describe, it, expect } from 'vitest';

describe('paradigms compute', () => {
  it('2019-Q4 canonical (research/05 §7): ρ=−0.10, S_tail=3, Δ=+4.1 → PA=0.687 LATE', async () => {
    const { computeParadigms } = await import('../../src/compute/paradigms.js');
    const r = computeParadigms({
      decadeReturns: {
        SPX: { d2000s: -0.009, d2010s: 0.134 },
        UST10: { d2000s: 0.066, d2010s: 0.040 },
        Tbill: { d2000s: 0.025, d2010s: 0.006 },
        Gold: { d2000s: 0.143, d2010s: 0.033 },
        Cmdty: { d2000s: 0.029, d2010s: 0.009 }
      },
      RealRate10y: 0.0015,    // 0.15%
      FedFunds: 0.0155,       // 1.55%
      BuybackYield: 0.031,    // 3.1%
      ProfitShare: 0.112,     // 11.2% (μ+σ ≈ 10.6%)
      ProfitShareMean_plus_sigma: 0.106,
      StatTaxRateAtPost1986Low: true,
      StatTaxRateStable2Yr: true,
      ConsensusForecast: 0.105,
      LongRunCAGR: 0.064,
      Δ_recency_sigma: 0.035
    });
    expect(r.PA).toBeCloseTo(0.687, 1);
    expect(r.paradigm_stage).toBe('LATE');
    expect(r.tilt_trigger).toBe(true);
    expect(r.gold_overlay).toBe(true);
  });

  it('S_tail counts 4 binary tailwinds correctly', async () => {
    const { computeParadigms } = await import('../../src/compute/paradigms.js');
    const r = computeParadigms({
      decadeReturns: { SPX: { d2000s: 0, d2010s: 0 }, UST10: { d2000s: 0, d2010s: 0 }, Tbill: { d2000s: 0, d2010s: 0 }, Gold: { d2000s: 0, d2010s: 0 }, Cmdty: { d2000s: 0, d2010s: 0 } },
      RealRate10y: 0.001, FedFunds: 0.005,
      BuybackYield: 0.030,
      ProfitShare: 0.12, ProfitShareMean_plus_sigma: 0.10,
      StatTaxRateAtPost1986Low: true, StatTaxRateStable2Yr: true
    });
    expect(r.S_tail).toBe(4);
  });

  it('paradigm_stage thresholds: <0.33 EARLY, [0.33, 0.67) MID, ≥0.67 LATE', async () => {
    const { classifyParadigmStage } = await import('../../src/compute/paradigms.js');
    expect(classifyParadigmStage(0.20)).toBe('EARLY');
    expect(classifyParadigmStage(0.50)).toBe('MID');
    expect(classifyParadigmStage(0.70)).toBe('LATE');
  });
});
