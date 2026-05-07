import { describe, it, expect } from 'vitest';

describe('longDebt compute', () => {
  it('US Ex.1 canonical: I1_rev≈580%, I2≈20% → DELEVERAGING (research/03 §7)', async () => {
    const { computeLongDebt } = await import('../../src/compute/long-debt.js');
    const r = computeLongDebt(makeFredFixtureLong({
      D_tot_GDP: 0.99,           // total debt / GDP
      Rev_GDP: 0.17,             // → I1_rev = 99/17 ≈ 582%
      Int_GDP: 0.034,            // → I2_rev = 3.4/17 = 20%
      r_nom: 3.4, g_nom: 3.8     // → I3 = -0.4
    }));
    expect(r.I1_rev_pct).toBeGreaterThan(550);
    expect(r.I1_rev_pct).toBeLessThan(620);
    expect(r.stage).toBe('DELEVERAGING');
  });

  it('PEAK band: I1=480%, I2=12% → PEAK (renamed from TOP per Set 3.5 D8)', async () => {
    const { computeLongDebt } = await import('../../src/compute/long-debt.js');
    const r = computeLongDebt(makeFredFixtureLong({
      D_tot_GDP: 0.96, Rev_GDP: 0.20, Int_GDP: 0.024, r_nom: 4.0, g_nom: 3.0
    }));
    expect(r.stage).toBe('PEAK');
    expect(r.emitsLabel).toBe('PEAK');
  });

  it('SOUND when I1_rev < 200% AND I2_rev < 5%', async () => {
    const { computeLongDebt } = await import('../../src/compute/long-debt.js');
    const r = computeLongDebt(makeFredFixtureLong({
      D_tot_GDP: 0.30, Rev_GDP: 0.20, Int_GDP: 0.005, r_nom: 2, g_nom: 4
    }));
    expect(r.stage).toBe('SOUND');
  });
});

// --- fixture builder ---
function makeFredFixtureLong(opts) {
  const { D_tot_GDP, Rev_GDP, Int_GDP, r_nom, g_nom } = opts;
  // Build GDP series so 4-qtr ratio gives g_nom (g_nom in pct/yr)
  const gdp_now = 100;
  const gdp_4q_ago = gdp_now / (1 + g_nom / 100);
  const gdpSeries = [
    ...Array.from({ length: 4 }, (_, i) => ({ date: `2023-Q${i + 1}`, value: gdp_4q_ago + (gdp_now - gdp_4q_ago) * i / 4 })),
    { date: '2024-Q1', value: gdp_now }
  ];
  return {
    sources: {
      fred: {
        GFDEGDQ188S: [{ date: '2024-Q1', value: D_tot_GDP }],
        FYFRGDA188S: [{ date: '2024', value: Rev_GDP }],
        FYOIGDA188S: [{ date: '2024', value: Int_GDP }],
        GS10: [{ date: '2024-Q1', value: r_nom }],
        GDP: gdpSeries
      }
    }
  };
}
