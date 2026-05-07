import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide Final Recommendation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id final', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-final-recommendation.js');
    expect(getSlides().find(s => s.id === 'final')).toBeDefined();
  });

  it('renders recipe block (5 sleeves) + tail panel + binding rule label + disclaimer footer', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-final-recommendation.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: {
        fetched_at_utc: '2026-04-30T14:32:00Z',
        sources: {},
        computedInflation: { regime: 'STAGFLATION', tilt_deltas: { gold: +5, commodities: +5, bonds: -5, cash: -5, fx_short: +5 } },
        computedDelev: { regime: 'NOT_DELEVERAGING', gold_tilt_delta_pt: 0 },
        computedParadigms: { gold_overlay: false },
        computedStress: { asymmetry_ratio: 8.52, dominant_tail: { regime: 'inflationary', R_pct: -26 }, tail_band: 'AMBER' },
        computedRiskParity: { L: 1.656, σ_p_pct: 6.037, SR_lev: 0.566 }
      },
      wizard: {}
    });
    expect(document.querySelector('.recipe-block')).not.toBeNull();
    expect(document.querySelectorAll('.recipe-block .recipe-row').length).toBe(5);
    expect(document.querySelector('.tail-panel')).not.toBeNull();
    expect(document.querySelector('.binding-rule')).not.toBeNull();
    expect(document.querySelector('.disclaimer-footer')).not.toBeNull();
  });

  it('binding rule label shows tilt source per FR-12', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-final-recommendation.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: {
        fetched_at_utc: '2026-04-30T14:32:00Z',
        sources: {},
        computedInflation: { regime: 'INFLATIONARY', tilt_deltas: { gold: +10, commodities: +5, bonds: -10, cash: -5 } }
      },
      wizard: {}
    });
    expect(document.querySelector('.binding-rule').textContent).toMatch(/INFLATIONARY/);
  });
});
