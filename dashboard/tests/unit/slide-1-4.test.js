import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.4 Deleveragings', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 1.4', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-4-deleveragings.js');
    expect(getSlides().find(s => s.id === '1.4')).toBeDefined();
  });

  it('Gate OFF → renders "Not Triggered ✓" card and skips chart', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-4-deleveragings.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {} }, computedRegimes: { debt_money_regime: 'LOW', gap_regime: 'ABOVE_TREND', R_dm_narrow: 8 } },
      wizard: {}
    });
    expect(document.querySelector('.gate-off-card')).not.toBeNull();
    expect(document.querySelector('.gate-off-card').textContent).toMatch(/Not Triggered/);
  });

  it('Gate ON (R_dm > 17) → renders lever-mix chart', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-4-deleveragings.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {} }, computedRegimes: { R_dm_narrow: 18 } },
      wizard: {}
    });
    expect(document.querySelector('.chart-mount')).not.toBeNull();
    expect(document.querySelector('.gate-off-card')).toBeNull();
  });
});
