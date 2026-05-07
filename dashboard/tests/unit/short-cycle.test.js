import { describe, it, expect } from 'vitest';

describe('shortCycle compute', () => {
  it('illustrative TRANSITIONAL fixture from research/02 §7 L121-155', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    // g=2.1%, CAPUTL=77.9%, CPI=3.1%, FF=4.33%, T10Y3M=0.45pp,
    // ΔFF_12m=-1.00pp, SAHM=0.4pp → no flags fire → TRANSITIONAL.
    const r = computeShortCycle({
      sources: { fred: makeFredFixture({
        A191RL1Q225SBEA_now: 2.1, A191RL1Q225SBEA_prev: 2.0,
        TCU: 77.9, CPI_yoy_now: 3.1, CPI_yoy_prev: 3.1,
        FEDFUNDS_now: 4.33, FEDFUNDS_12m_ago: 5.33,  // ΔFF = -1.00
        T10Y3M: 0.45, T10Y2Y: 0.5, SAHM: 0.4
      }) }
    });
    expect(r.cycle_phase).toBe('TRANSITIONAL');
    expect(r.policy_stance).toBe('EASING');
    expect(r.yc_signal).toBe('FLAT');
    expect(r.sahm_signal).toBe('NOT_TRIGGERED');
  });

  it('Sahm rule TRIGGERED if MA3(u) − min[t-12,t] u ≥ 0.5pp', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    const r = computeShortCycle({ sources: { fred: makeFredFixture({ SAHM: 0.6 }) } });
    expect(r.sahm_signal).toBe('TRIGGERED');
  });

  it('LATE phase fires when g ∈ [3.5%, 4.0%] AND π > π_prev AND cu > 78% AND MST ≥ 30', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    // MST 32 months ago → recession_dates ending 32 months back
    const past = new Date(Date.now() - 32 * 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const r = computeShortCycle({
      sources: {
        fred: makeFredFixture({
          A191RL1Q225SBEA_now: 3.7, A191RL1Q225SBEA_prev: 3.8,
          TCU: 79.5, CPI_yoy_now: 3.5, CPI_yoy_prev: 3.0
        }),
        nber: { recession_dates: [['2018-01-01', past]] }
      }
    });
    expect(r.cycle_phase).toBe('LATE');
  });

  it('yc_signal classifier per T10Y3M brackets', async () => {
    const { computeShortCycle } = await import('../../src/compute/short-cycle.js');
    expect(computeShortCycle({ sources: { fred: makeFredFixture({ T10Y3M: -0.5 }) } }).yc_signal).toBe('INVERTED');
    expect(computeShortCycle({ sources: { fred: makeFredFixture({ T10Y3M: 0.5 }) } }).yc_signal).toBe('FLAT');
    expect(computeShortCycle({ sources: { fred: makeFredFixture({ T10Y3M: 1.5 }) } }).yc_signal).toBe('STEEP');
  });
});

// --- fixture builder ---
function makeFredFixture(opts = {}) {
  const N = 24;
  const fred = {};

  // GDP qoq SAAR
  const g_now = opts.A191RL1Q225SBEA_now ?? 2.0;
  const g_prev = opts.A191RL1Q225SBEA_prev ?? g_now;
  fred.A191RL1Q225SBEA = Array.from({ length: N }, (_, i) => ({
    date: `2020-Q${(i % 4) + 1}`,
    value: i === N - 1 ? g_now : i === N - 2 ? g_prev : 2.0
  }));

  // Capacity utilization
  fred.TCU = Array.from({ length: N }, () => ({ date: '2024-01', value: opts.TCU ?? 78.0 }));

  // CPI: backward-derived levels giving target yoy now/prev
  const cpi_yoy_now = opts.CPI_yoy_now ?? 2.0;
  const cpi_yoy_prev = opts.CPI_yoy_prev ?? cpi_yoy_now;
  fred.CPIAUCSL = Array.from({ length: 30 }, (_, i) => ({
    date: `2023-${(i % 12) + 1}`,
    value: 100 * Math.pow(1 + cpi_yoy_now / 100, i / 12)
  }));
  // Override last 12 to inject yoy_now-vs-yoy_prev divergence:
  if (cpi_yoy_now !== cpi_yoy_prev) {
    // Force last value = yoy_now × value 12 ago; force value 12 ago = yoy_prev × value 24 ago
    const v24 = fred.CPIAUCSL[fred.CPIAUCSL.length - 1 - 24]?.value ?? 100;
    const v12 = v24 * (1 + cpi_yoy_prev / 100);
    const vNow = v12 * (1 + cpi_yoy_now / 100);
    fred.CPIAUCSL[fred.CPIAUCSL.length - 1 - 12].value = v12;
    fred.CPIAUCSL[fred.CPIAUCSL.length - 1].value = vNow;
  }

  // Fed funds: now and 12-mo-ago
  const ff_now = opts.FEDFUNDS_now ?? 4.0;
  const ff_12m_ago = opts.FEDFUNDS_12m_ago ?? ff_now;
  fred.FEDFUNDS = Array.from({ length: 18 }, (_, i) => ({
    date: `2023-${(i % 12) + 1}`,
    value: i === 17 ? ff_now : i === 17 - 12 ? ff_12m_ago : ff_now
  }));

  // T10Y3M
  fred.T10Y3M = [{ date: '2024-01', value: opts.T10Y3M ?? 0.5 }];

  // T10Y2Y
  fred.T10Y2Y = [{ date: '2024-01', value: opts.T10Y2Y ?? 0.5 }];

  // UNRATE for Sahm rule
  const sahmTarget = opts.SAHM ?? 0.0;
  // 12 unrate observations: min = 3.0; last 3 = MA3 = 3.0 + sahm
  const unrate = Array.from({ length: 12 }, () => 3.0);
  unrate[11] = 3.0 + sahmTarget;
  unrate[10] = 3.0 + sahmTarget;
  unrate[9] = 3.0 + sahmTarget;
  fred.UNRATE = unrate.map((v, i) => ({ date: `2023-${i + 1}`, value: v }));

  // NBER for MST estimation (months since recession trough)
  // Use opts.mst_months to compute a fictitious recession-end date
  const nberSources = opts.mst_months
    ? { nber: { recession_dates: [['2018-01-01', new Date(Date.now() - opts.mst_months * 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)]] } }
    : null;

  return Object.assign(fred, nberSources ? { __extra: nberSources } : {});
}
