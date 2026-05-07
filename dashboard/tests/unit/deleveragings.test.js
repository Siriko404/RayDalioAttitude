import { describe, it, expect } from 'vitest';

describe('deleveragings compute', () => {
  it('US 1930-32 canonical: G<-15, ΔD>0 → UGLY_DEFLATIONARY (research/04 §7)', async () => {
    const { computeDeleveragings } = await import('../../src/compute/deleveragings.js');
    const r = computeDeleveragings({
      NGDP_yoy: -17.0, LT_Rate: 3.4,
      DebtGDP_now: 1.30, DebtGDP_4Qago: 0.98,
      M0_GDP_now: 0.10, M0_GDP_4Qago: 0.09,
      CB_Assets_now: 0, CB_Assets_4Qago: 0,
      FiscalBal_delta: -0.02, Writeoff: 0.06, Gini_delta: 0.005
    }, true);
    expect(r.regime).toBe('UGLY_DEFLATIONARY');
    expect(r.G).toBeLessThan(-15);
  });

  it('US 1933-37 reflation: G=+6.3pp (above ceiling) so beautiful_score=0', async () => {
    const { computeDeleveragings } = await import('../../src/compute/deleveragings.js');
    const r = computeDeleveragings({
      NGDP_yoy: 9.2, LT_Rate: 2.9,
      DebtGDP_now: 0.98, DebtGDP_4Qago: 1.18,
      'π_proxy': 0.02
    }, true);
    expect(r.G).toBeGreaterThan(3);
    expect(r.beautiful_score).toBe(0);  // G=6.3 > +3pp ceiling
  });

  it('Gate hysteresis: fires when R_dm > 17 instantaneous', async () => {
    const { isGateOpen } = await import('../../src/compute/deleveragings.js');
    expect(isGateOpen({ R_dm: 18, history: [] })).toBe(true);
  });

  it('Gate hysteresis: fires when debt_money=HIGH AND gap=BELOW_TREND sustained ≥2Q', async () => {
    const { isGateOpen } = await import('../../src/compute/deleveragings.js');
    const sustained = isGateOpen({
      R_dm: 14, history: [
        { debt_money_regime: 'HIGH', gap_regime: 'BELOW_TREND' },
        { debt_money_regime: 'HIGH', gap_regime: 'BELOW_TREND' }
      ]
    });
    expect(sustained).toBe(true);
  });

  it('Gate does NOT fire when only 1 quarter sustained AND R_dm < 17', async () => {
    const { isGateOpen } = await import('../../src/compute/deleveragings.js');
    const oneQ = isGateOpen({
      R_dm: 14, history: [{ debt_money_regime: 'HIGH', gap_regime: 'BELOW_TREND' }]
    });
    expect(oneQ).toBe(false);
  });
});
