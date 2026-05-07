import { describe, it, expect } from 'vitest';

describe('compute pipeline', () => {
  it('runs all 13 modules in DAG order + attaches each to payload.computedXxx', async () => {
    const { runComputePipeline } = await import('../../src/core/compute-pipeline.js');
    const payload = { sources: { fred: {}, bis: {}, cofer: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0.18 } } };
    runComputePipeline(payload, { sigma_target: 0.10 });
    expect(payload.computedEconMachine).toBeDefined();
    expect(payload.computedShortCycle).toBeDefined();
    expect(payload.computedLongDebt).toBeDefined();
    expect(payload.computedDelev).toBeDefined();
    expect(payload.computedInflation).toBeDefined();
    expect(payload.computedParadigms).toBeDefined();
    expect(payload.computedWorldOrder).toBeDefined();
    expect(payload.computedAW).toBeDefined();
    expect(payload.computedStress).toBeDefined();
    expect(payload.computedRiskParity).toBeDefined();
    expect(payload.computedHolyGrail).toBeDefined();
    expect(payload.computedAlpha).toBeDefined();
    expect(payload.computedTilt).toBeDefined();
  });

  it('downstream modules see upstream outputs (e.g. tilt arbiter sees inflation regime)', async () => {
    const { runComputePipeline } = await import('../../src/core/compute-pipeline.js');
    const payload = { sources: { fred: {} } };
    runComputePipeline(payload, { sigma_target: 0.10 });
    // Tilt arbiter consumed inflation + delev + paradigms emits
    expect(payload.computedTilt.binding_rule).toBeDefined();
  });
});
