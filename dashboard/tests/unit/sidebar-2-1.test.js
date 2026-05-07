import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('echarts', () => ({
  init: () => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }),
  registerTheme: vi.fn()
}));

describe('Sidebar 2.1 Holy Grail', () => {
  beforeEach(() => { vi.resetModules(); });

  it('registers slide id 2.1 with kind=edu', async () => {
    const { clearSlides, getSlides } = await import('../../src/core/state.js');
    clearSlides();
    await import('../../src/slides/sidebar-2-1-holy-grail.js');
    const slide = getSlides().find(s => s.id === '2.1');
    expect(slide).toBeDefined();
    expect(slide.kind).toBe('edu');
  });
});
