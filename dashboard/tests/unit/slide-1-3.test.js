import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.3 Long-Term Debt Cycle', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 1.3', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-3-long-term-debt.js');
    expect(getSlides().find(s => s.id === '1.3')).toBeDefined();
  });

  it('uses PEAK (not TOP) in caption when stage is PEAK', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-3-long-term-debt.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: peakFredFixture() } }, wizard: {}
    });
    const caption = document.querySelector('.caption').innerHTML.toLowerCase();
    const onePoint = document.querySelector('.one-point').innerHTML.toLowerCase();
    expect(caption + onePoint).toMatch(/peak/);
  });
});

// Constructs FRED fixture so computeLongDebt returns stage='PEAK'
// (I1_rev_pct ∈ [400, 550) AND I2_rev_pct ∈ [10, 15)).
// Set D/GDP=0.96, Rev/GDP=0.20 → I1=480%; Int/GDP=0.024 → I2=12%.
function peakFredFixture() {
  const gdp_now = 100, g_nom = 3.0;
  const gdp_4q_ago = gdp_now / (1 + g_nom / 100);
  const gdpSeries = [
    ...Array.from({ length: 4 }, (_, i) => ({ date: `2023-Q${i + 1}`, value: gdp_4q_ago + (gdp_now - gdp_4q_ago) * i / 4 })),
    { date: '2024-Q1', value: gdp_now }
  ];
  return {
    GFDEGDQ188S: [{ date: '2024-Q1', value: 0.96 }],
    FYFRGDA188S: [{ date: '2024', value: 0.20 }],
    FYOIGDA188S: [{ date: '2024', value: 0.024 }],
    GS10:        [{ date: '2024-Q1', value: 4.0 }],
    GDP:         gdpSeries
  };
}
