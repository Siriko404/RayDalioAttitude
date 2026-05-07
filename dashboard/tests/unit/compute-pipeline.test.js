import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => { vi.resetModules(); });

// FRED fixture builders — date strings are decorative; adapters read .value only.
const makeQ = (...vs)   => vs.map((v, i) => ({ date: `2024-Q${i+1}`, value: v }));
const makeM = (...vs)   => vs.map((v, i) => ({ date: `2024-${String(i+1).padStart(2,'0')}-01`, value: v }));
const makeD = (n, base, step) => Array.from({ length: n }, (_, i) => ({ date: `d${i}`, value: base + i*step }));

const emptyPayload = () => ({ sources: { fred: {}, bis: {}, cofer: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0.18 } } });

describe('compute pipeline', () => {
  it('runs all 13 modules in DAG order + attaches each to payload.computedXxx', async () => {
    const { runComputePipeline } = await import('../../src/core/compute-pipeline.js');
    const payload = emptyPayload();
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
    expect(payload.computedTilt.binding_rule).toBeDefined();
  });
});

// ─── Adapter tests — gap-fix verifying no longer stubs ────────────────────────

describe('buildDelevInput adapter', () => {
  it('empty FRED → zero-valued shape (no crash)', async () => {
    const { buildDelevInput } = await import('../../src/core/compute-pipeline.js');
    const out = buildDelevInput({ sources: { fred: {} } });
    expect(out.NGDP_yoy).toBe(0);
    expect(out.LT_Rate).toBe(0);
    expect(out.DebtGDP_now).toBe(0);
    expect(out.DebtGDP_4Qago).toBe(0);
    expect(out.CPI_yoy).toBe(0);
    expect(out.FX_Gold_yoy).toBe(0);
  });

  it('NGDP_yoy = GDP yoy in PERCENT (5Q fixture, 4Q lag)', async () => {
    const { buildDelevInput } = await import('../../src/core/compute-pipeline.js');
    // 4Q ago = 100, latest = 110 → yoy = (110-100)/100 = 0.10 → 10 percent
    const fred = { GDP: makeQ(100, 102, 105, 108, 110) };
    const out = buildDelevInput({ sources: { fred } });
    expect(out.NGDP_yoy).toBeCloseTo(10, 1);
  });

  it('LT_Rate = GS10 latest in PERCENT', async () => {
    const { buildDelevInput } = await import('../../src/core/compute-pipeline.js');
    const fred = { GS10: makeM(4.20, 4.25, 4.30, 4.35) };
    const out = buildDelevInput({ sources: { fred } });
    expect(out.LT_Rate).toBeCloseTo(4.35, 2);
  });

  it('DebtGDP_now/4Qago = GFDEGDQ188S percent → decimal (÷100)', async () => {
    const { buildDelevInput } = await import('../../src/core/compute-pipeline.js');
    const fred = { GFDEGDQ188S: makeQ(121.5, 121.8, 122.0, 122.2, 122.5) };
    const out = buildDelevInput({ sources: { fred } });
    expect(out.DebtGDP_now).toBeCloseTo(1.225, 3);
    expect(out.DebtGDP_4Qago).toBeCloseTo(1.215, 3);
  });

  it('CPI_yoy = CPIAUCSL yoy in DECIMAL (13M fixture, 12M lag)', async () => {
    const { buildDelevInput } = await import('../../src/core/compute-pipeline.js');
    // 12M ago = 100, latest = 105 → yoy = 0.05 (decimal)
    const fred = { CPIAUCSL: [...makeM(100, 100.5, 101, 101.5, 102, 102.5, 103, 103.5, 104, 104.3, 104.6, 104.8), { date: '2025-01-01', value: 105 }] };
    const out = buildDelevInput({ sources: { fred } });
    expect(out.CPI_yoy).toBeCloseTo(0.05, 2);
  });

  it('FX_Gold_yoy = GOLDPMGBD228NLBM yoy in DECIMAL', async () => {
    const { buildDelevInput } = await import('../../src/core/compute-pipeline.js');
    // 252-day daily gold; 252 day-ago = 2000, latest = 2400 → yoy = +0.20 (decimal)
    const arr = [{ date: 'lag', value: 2000 }, ...Array.from({ length: 251 }, (_, i) => ({ date: `mid${i}`, value: 2000 + (i+1) })), { date: 'now', value: 2400 }];
    const out = buildDelevInput({ sources: { fred: { GOLDPMGBD228NLBM: arr } } });
    expect(out.FX_Gold_yoy).toBeCloseTo(0.20, 2);
  });
});

describe('buildInflationInput adapter', () => {
  it('empty FRED → zero-valued shape (no crash)', async () => {
    const { buildInflationInput } = await import('../../src/core/compute-pipeline.js');
    const out = buildInflationInput({ sources: { fred: {} } });
    expect(out.pi_hdln).toBe(0);
    expect(out.pi_core).toBe(0);
    expect(out.NGDP_yoy).toBe(0);
    expect(out.M2_yoy).toBe(0);
    expect(out.r_mkt).toBe(0);
    expect(out.reserve_currency).toBe(true);
  });

  it('pi_hdln = CPIAUCSL yoy in PERCENT (matches inflation compute test convention)', async () => {
    const { buildInflationInput } = await import('../../src/core/compute-pipeline.js');
    const fred = { CPIAUCSL: [...makeM(100, 100.5, 101, 101.5, 102, 102.5, 103, 103.5, 104, 104.3, 104.6, 104.8), { date: 'now', value: 108.5 }] };
    const out = buildInflationInput({ sources: { fred } });
    expect(out.pi_hdln).toBeCloseTo(8.5, 1);
  });

  it('r_mkt = DFII10 latest in PERCENT', async () => {
    const { buildInflationInput } = await import('../../src/core/compute-pipeline.js');
    const fred = { DFII10: makeD(5, 1.95, 0.01) };  // last = 1.99
    const out = buildInflationInput({ sources: { fred } });
    expect(out.r_mkt).toBeCloseTo(1.99, 2);
  });

  it('ΔFX_12m = DTWEXBGS yoy DECIMAL (252-day lag for daily series)', async () => {
    const { buildInflationInput } = await import('../../src/core/compute-pipeline.js');
    const arr = [{ date: 'lag', value: 100 }, ...Array.from({ length: 251 }, (_, i) => ({ date: `mid${i}`, value: 100 + i*0.01 })), { date: 'now', value: 108 }];
    const out = buildInflationInput({ sources: { fred: { DTWEXBGS: arr } } });
    expect(out.ΔFX_12m).toBeCloseTo(0.08, 2);
  });
});

describe('buildParadigmsInput adapter', () => {
  it('empty FRED → static decade returns + zero live values', async () => {
    const { buildParadigmsInput } = await import('../../src/core/compute-pipeline.js');
    const out = buildParadigmsInput({ sources: { fred: {}, damodaran: { histretSP: [] } } });
    expect(out.decadeReturns).toBeDefined();
    expect(out.decadeReturns.SPX.d2010s).toBeCloseTo(0.134, 3);  // research/05 §7
    expect(out.decadeReturns.UST10.d2000s).toBeCloseTo(0.066, 3);
    expect(out.RealRate10y).toBe(0);
    expect(out.FedFunds).toBe(0);
    expect(out.StatTaxRateAtPost1986Low).toBe(true);
    expect(out.StatTaxRateStable2Yr).toBe(true);
  });

  it('RealRate10y = DFII10 latest converted percent → decimal (÷100)', async () => {
    const { buildParadigmsInput } = await import('../../src/core/compute-pipeline.js');
    const fred = { DFII10: makeD(3, 0.10, 0.05) };  // last = 0.20 percent → 0.0020 decimal
    const out = buildParadigmsInput({ sources: { fred, damodaran: { histretSP: [] } } });
    expect(out.RealRate10y).toBeCloseTo(0.0020, 4);
  });

  it('FedFunds = FEDFUNDS latest converted percent → decimal', async () => {
    const { buildParadigmsInput } = await import('../../src/core/compute-pipeline.js');
    const fred = { FEDFUNDS: makeM(5.25, 5.33, 5.33) };  // last 5.33 → 0.0533
    const out = buildParadigmsInput({ sources: { fred, damodaran: { histretSP: [] } } });
    expect(out.FedFunds).toBeCloseTo(0.0533, 4);
  });

  it('ProfitShare = A463RC1Q027SBEA / GDP latest', async () => {
    const { buildParadigmsInput } = await import('../../src/core/compute-pipeline.js');
    const fred = {
      A463RC1Q027SBEA: makeQ(2800, 2900, 3000, 3100, 3200),  // corp profits
      GDP: makeQ(26000, 27000, 28000, 28500, 28800)          // GDP
    };
    const out = buildParadigmsInput({ sources: { fred, damodaran: { histretSP: [] } } });
    expect(out.ProfitShare).toBeCloseTo(3200/28800, 4);
  });
});

describe('buildWorldOrderInput adapter', () => {
  it('empty COFER → canonical research/06 §7 panel + fallback resDelta', async () => {
    const { buildWorldOrderInput } = await import('../../src/core/compute-pipeline.js');
    const out = buildWorldOrderInput({ sources: { cofer: {}, fred: {} } });
    expect(out.panel.USA.Edu).toBeCloseTo(2.0, 2);   // research/06 §7 L143
    expect(out.panel.USA.Fin).toBeCloseTo(2.7, 2);
    expect(out.panel.CHN.Trade).toBeCloseTo(1.9, 2);
    expect(out.panel.CHN.Reserve).toBeCloseTo(-0.6, 2);
    expect(out.anchors.max).toBeCloseTo(1.9, 2);
    expect(out.anchors.min).toBeCloseTo(-1.5, 2);
    expect(out.cofer_resDelta10pp).toBeCloseTo(-2.98, 1);
    expect(out.s20_USA).toBeCloseTo(-0.06, 2);
    expect(out.s20_CHN).toBeCloseTo(+0.07, 2);
  });
});

describe('end-to-end with substantive FRED fixture', () => {
  it('inflation regime computed from real CPI/M2/r_mkt fixture (not BEAUTIFUL fallthrough)', async () => {
    const { runComputePipeline } = await import('../../src/core/compute-pipeline.js');
    // Build CPI fixture: 12-month yoy = 5% → pi_hdln = 5 (percent, > 4 inflationary edge)
    const cpi = [...Array.from({ length: 12 }, (_, i) => ({ date: `m${i}`, value: 100 + i*0.4 })), { date: 'now', value: 105 }];
    // M2 yoy = 12% → μ = 12 - 5 = 7 > 4 monetary-driven
    const m2 = [...Array.from({ length: 12 }, (_, i) => ({ date: `m${i}`, value: 100 + i*0.5 })), { date: 'now', value: 112 }];
    // GDP yoy = 3% (NGDP_yoy)
    const gdp = [{ date: 'lag', value: 100 }, ...Array.from({ length: 3 }, (_, i) => ({ date: `q${i}`, value: 101 + i })), { date: 'now', value: 103 }];
    // DFII10 = -1.5% (deeply neg real rate)
    const dfii10 = makeD(3, -1.5, 0);
    // ΔFX -10% (debasing)
    const fx = [{ date: 'lag', value: 110 }, ...Array.from({ length: 251 }, (_, i) => ({ date: `m${i}`, value: 110 - i*0.04 })), { date: 'now', value: 99 }];
    // ΔGold +20% (debasement signal)
    const gold = [{ date: 'lag', value: 2000 }, ...Array.from({ length: 251 }, (_, i) => ({ date: `m${i}`, value: 2000 + i*1.6 })), { date: 'now', value: 2400 }];
    const payload = {
      sources: {
        fred: { CPIAUCSL: cpi, CPILFESL: cpi, M2SL: m2, GDP: gdp, DFII10: dfii10, DTWEXBGS: fx, GOLDPMGBD228NLBM: gold },
        cofer: {}, bis: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0 }
      }
    };
    runComputePipeline(payload, { sigma_target: 0.10 });
    // π_hdln=5, μ=7, r_mkt=-1.5, DebaseFlag fires → INFLATIONARY regime, gold +10pt
    expect(payload.computedInflation.regime).toBe('INFLATIONARY');
    expect(payload.computedInflation.tilt_deltas.gold).toBe(+10);
  });

  it('world-order uses canonical panel → DECLINE / RISE / ELEVATED', async () => {
    const { runComputePipeline } = await import('../../src/core/compute-pipeline.js');
    const payload = emptyPayload();
    runComputePipeline(payload, { sigma_target: 0.10 });
    // Canonical research/06 §7 panel hardcoded → USA DECLINE, CHN RISE, ELEVATED
    expect(payload.computedWorldOrder.StageTag.USA).toBe('DECLINE');
    expect(payload.computedWorldOrder.StageTag.CHN).toBe('RISE');
    expect(payload.computedWorldOrder.HegemonyRisk).toBe('ELEVATED');
  });
});
