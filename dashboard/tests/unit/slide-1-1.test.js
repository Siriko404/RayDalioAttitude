import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.1 Economic Machine', () => {
  // ESM modules are cached across tests; reset between tests so each `await import`
  // of the slide module re-runs its registerSlide() call (which would otherwise no-op
  // after the first test left state wiped via clearSlides).
  beforeEach(() => { vi.resetModules(); });

  it('registers slide with id 1.1', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-1-economic-machine.js');
    const slides = getSlides();
    expect(slides.find(s => s.id === '1.1')).toBeDefined();
  });

  it('render produces eyebrow + one-point + chart-mount + 4 sub-cells', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-1-economic-machine.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    const sec = document.getElementById('s');
    slide.render(sec, { payload: makePayload111(), wizard: {} });
    expect(sec.querySelector('.eyebrow').textContent).toMatch(/STEP 01 OF 10/);
    expect(sec.querySelector('.one-point')).not.toBeNull();
    expect(sec.querySelector('.chart-mount')).not.toBeNull();
    expect(sec.querySelectorAll('[data-cell-index]').length).toBeGreaterThanOrEqual(4);
  });

  it('one-point text reflects gap_regime from compute', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-1-economic-machine.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), { payload: makePayload111(), wizard: {} });
    const text = document.querySelector('.one-point').textContent;
    expect(text.toLowerCase()).toMatch(/(above|on|below)/);  // gap_regime word
  });
});

// Minimal payload exercising 1.1 compute paths (FRED series only)
function makePayload111() {
  // Log-linear synthetic: 8 quarters fits OLS exactly so gap_pct ≈ 0 → ON_TREND
  const realGdpPc = Array.from({ length: 8 }, (_, i) => ({
    date: `2022-Q${(i % 4) + 1}`,
    value: 60000 * Math.exp(0.005 * i)   // ~2% annual growth
  }));
  const ophnfb = Array.from({ length: 8 }, (_, i) => ({
    date: `2022-Q${(i % 4) + 1}`,
    value: 110 + i * 0.3
  }));
  return {
    sources: {
      fred: {
        A939RX0Q048SBEA: realGdpPc,
        OPHNFB: ophnfb,
        TCMDO: [{ date: '2024-Q1', value: 95000 }, { date: '2024-Q2', value: 96000 }],
        M2SL: [{ date: '2024-Q1', value: 21000 }, { date: '2024-Q2', value: 21100 }]
      }
    }
  };
}
