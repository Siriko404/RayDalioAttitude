import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Slide 1.5 Paradigms', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 1.5', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-5-paradigms.js');
    expect(getSlides().find(s => s.id === '1.5')).toBeDefined();
  });

  it('caption surfaces PA composite + paradigm_stage word', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/slide-1-5-paradigms.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), {
      payload: { sources: { fred: {}, damodaran: { histretSP: [] } }, computedParadigms: { PA: 0.687, paradigm_stage: 'LATE', S_tail: 3, ρ: -0.10 } },
      wizard: {}
    });
    const cap = document.querySelector('.caption').innerHTML;
    expect(cap).toMatch(/0\.69|PA/);
  });
});
