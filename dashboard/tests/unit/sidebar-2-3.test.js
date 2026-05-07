import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Sidebar 2.3 Alpha', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 2.3 kind=edu', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/sidebar-2-3-alpha.js');
    const slide = getSlides().find(s => s.id === '2.3');
    expect(slide).toBeDefined();
    expect(slide.kind).toBe('edu');
  });

  it('caption explicitly states "for professional managers" qualifier', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/sidebar-2-3-alpha.js');
    const slide = getSlides()[0];
    document.body.innerHTML = '<section id="s"></section>';
    slide.render(document.getElementById('s'), { payload: {}, wizard: {} });
    const cap = document.querySelector('.caption').innerHTML.toLowerCase();
    expect(cap).toMatch(/professional|manager/);
  });
});
