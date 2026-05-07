import { describe, it, expect } from 'vitest';

describe('tilt arbiter', () => {
  it('1.7 INFLATIONARY emits +10pt gold → final tilts inflation overrides others', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'INFLATIONARY', tilt_deltas: { gold: +10, commodities: +5, bonds: -10, cash: -5 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: true }
    });
    expect(r.gold_pp).toBe(+10);
    expect(r.binding_rule).toBe('INFLATIONARY');
    expect(r.binding_label).toMatch(/INFL/);
  });

  it('1.7 STAGFLATION + 1.4 DELEVER gold +5 → STAGFLATION wins (+5 not stacked)', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'STAGFLATION', tilt_deltas: { gold: +5, commodities: +5, bonds: -5, cash: -5 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: false }
    });
    expect(r.gold_pp).toBe(+5);
    expect(r.binding_rule).toBe('STAGFLATION');
  });

  it('No 1.7 trigger; 1.4 DELEVER (+5) > 1.5 gold_overlay → DELEVER wins (+5)', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'BEAUTIFUL', tilt_deltas: { gold: 0, commodities: 0, bonds: 0, cash: 0 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: true }
    });
    expect(r.gold_pp).toBe(+5);
    expect(r.binding_rule).toBe('DELEVER');
  });

  it('Aggregate cap: gold tilt clipped at ±10pt', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'INFLATIONARY', tilt_deltas: { gold: +15, commodities: +5, bonds: -10, cash: -5 } },
      deleveragings: { regime: 'NOT_DELEVERAGING', gold_tilt_delta_pt: 0 },
      paradigms: { gold_overlay: false }
    });
    expect(r.gold_pp).toBeLessThanOrEqual(+10);
    expect(r.capped).toBe(true);
  });

  it('binding_label format: "Gold: 17.5% (↑10pt) · source: STAGFLATION + DELEVER · capped"', async () => {
    const { arbitrateTilts } = await import('../../src/compute/tilt-arbiter.js');
    const r = arbitrateTilts({
      inflation: { regime: 'STAGFLATION', tilt_deltas: { gold: +5, commodities: +5, bonds: -5, cash: -5 } },
      deleveragings: { regime: 'UGLY_DEFLATIONARY', gold_tilt_delta_pt: +5 },
      paradigms: { gold_overlay: false }
    });
    expect(r.binding_label).toMatch(/Gold:.*\(↑.*pt\)/);
    expect(r.binding_label).toMatch(/STAGFLATION/);
  });
});
