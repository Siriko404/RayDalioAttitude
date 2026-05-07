import { describe, it, expect } from 'vitest';

describe('econMachine compute', () => {
  it('classifies gap_regime per ±σ band (σ ≈ 3.2%)', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    expect(computeEconMachine(makeFixtureGap(+5.0)).gap_regime).toBe('ABOVE_TREND');
    expect(computeEconMachine(makeFixtureGap(-5.0)).gap_regime).toBe('BELOW_TREND');
    expect(computeEconMachine(makeFixtureGap(0)).gap_regime).toBe('ON_TREND');
  });

  it('classifies credit_mix_regime via 0.33/0.66 tertile', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    expect(computeEconMachine(makeFixtureMix(0.80)).credit_mix_regime).toBe('CREDIT_DRIVEN');
    expect(computeEconMachine(makeFixtureMix(0.20)).credit_mix_regime).toBe('MONEY_DRIVEN');
    expect(computeEconMachine(makeFixtureMix(0.50)).credit_mix_regime).toBe('MIXED');
  });

  it('classifies debt_money_regime per 10/15 edges (R^{D/M} narrow-money)', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    // R_dm_narrow = (TCMDO/1000) / M2 * 3.7 → target narrow value
    // For LOW (8): TCMDO=8000, M2=3.7 (so 8000/1000 / 3.7 * 3.7 = 8.0)
    expect(computeEconMachine(makeFixtureDebtMoney(8)).debt_money_regime).toBe('LOW');
    expect(computeEconMachine(makeFixtureDebtMoney(13)).debt_money_regime).toBe('ELEVATED');
    expect(computeEconMachine(makeFixtureDebtMoney(18)).debt_money_regime).toBe('HIGH');
  });

  it('canonical 2024 snapshot: trend_growth ≈ 1.96% p.a. (±0.5pp)', async () => {
    const { computeEconMachine } = await import('../../src/compute/econ-machine.js');
    const out = computeEconMachine(canonicalUS2024());
    expect(out.trend_growth_pct).toBeGreaterThan(1.4);
    expect(out.trend_growth_pct).toBeLessThan(2.5);
  });
});

// --- fixture builders ---

function makeSeries(values) {
  return values.map((v, i) => ({ date: `2024-Q${(i % 4) + 1}`, value: v }));
}

// Build RGDP_pc series with deterministic OLS slope; last point displaced by gapPct.
// Trend: ~2%/yr ≈ 0.5%/qtr (matches σ_residual ≈ 0 unless we displace last point).
function makeFixtureGap(gapPct) {
  const baseLn = 10.0;        // ln(22000)
  const slope = 0.005;        // ~2%/yr quarterly
  const N = 80;               // 20 yrs
  const values = [];
  for (let i = 0; i < N; i++) {
    const trend_ln = baseLn + slope * i;
    values.push(Math.exp(trend_ln));
  }
  // Displace the very last point by gapPct
  values[N - 1] = Math.exp(baseLn + slope * (N - 1) + gapPct / 100);
  return {
    sources: {
      fred: {
        A939RX0Q048SBEA: makeSeries(values),
        TCMDO: makeSeries(Array(N).fill(80000000)),  // mn
        M2SL: makeSeries(Array(N).fill(20000))
      }
    }
  };
}

// Adjust ΔTCMDO and ΔM2 to produce target sC = ΔTCMDO / (ΔTCMDO + ΔM2)
function makeFixtureMix(scTarget) {
  const dC = scTarget * 100;
  const dM = (1 - scTarget) * 100;
  const tcmdo = makeSeries([80000000, 80000000 + dC]);
  const m2 = makeSeries([20000, 20000 + dM]);
  return {
    sources: {
      fred: {
        A939RX0Q048SBEA: makeSeries(Array(80).fill(22000).map((v, i) => v * Math.exp(0.005 * i))),
        TCMDO: tcmdo,
        M2SL: m2
      }
    }
  };
}

// Set R_dm_narrow = (TCMDO/1000) / M2 * 3.7 = ratio
// Simplest: M2 = 1000, then TCMDO_mn = ratio / 3.7 * 1000 * 1000 = ratio * 270270.27
function makeFixtureDebtMoney(ratio) {
  const m2 = 1000;
  const tcmdo_mn = (ratio / 3.7) * m2 * 1000;
  return {
    sources: {
      fred: {
        A939RX0Q048SBEA: makeSeries(Array(80).fill(22000).map((v, i) => v * Math.exp(0.005 * i))),
        TCMDO: makeSeries([tcmdo_mn, tcmdo_mn]),
        M2SL: makeSeries([m2, m2])
      }
    }
  };
}

// Realistic-ish 2024: 80q of 0.5%/qtr trend
function canonicalUS2024() {
  const N = 80;
  const series = [];
  let v = 50000;
  for (let i = 0; i < N; i++) {
    series.push(v);
    v *= 1.005;  // ~2.0% annualized
  }
  return {
    sources: {
      fred: {
        A939RX0Q048SBEA: makeSeries(series),
        TCMDO: makeSeries(Array(N).fill(97000000)),
        M2SL: makeSeries(Array(N).fill(21000))
      }
    }
  };
}
