import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 2.2 All-Weather', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 2.2', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-2-all-weather.js');
    expect(getSlides().find(s => s.id === '2.2')).toBeDefined();
  });

  it('caption surfaces σ_p + drift band', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-2-2-all-weather.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: {}, computedAW: { σ_p_pct: 7.51, RC_pct: { equities: 34.2, long_treasury: 46.87, int_treasury: 7.83, gold: 5.40, commodities: 5.69 } } },
      wizard: { risk_profile: 'balanced', sigma_target: 0.10 }
    });
    expect(document.querySelector('.caption').innerHTML).toMatch(/7\.5|σ/);
  });
});
