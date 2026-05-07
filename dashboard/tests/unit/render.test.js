import { describe, it, expect, vi } from 'vitest';

describe('render orchestrator', () => {
  it('registerSlide adds slide module to registry', async () => {
    const state = await import('../../src/core/state.js');
    const slide = { id: '1.1', title: 'Test', render: vi.fn() };
    state.clearSlides();
    state.registerSlide(slide);
    expect(state.getSlides()).toContainEqual(slide);
  });

  it('renderAll calls each slide.render with state.payload', async () => {
    const state = await import('../../src/core/state.js');
    const { renderAll } = await import('../../src/core/render.js');
    const renderFn = vi.fn();
    state.clearSlides();
    state.registerSlide({ id: 'X', title: 'X', render: renderFn });
    state.setPayload({ sources: { fred: { GDP: [] } }, fetched_at_utc: '2026-05-06T00:00Z' });
    document.body.innerHTML = '<main id="slides"></main>';
    renderAll(document.getElementById('slides'));
    expect(renderFn).toHaveBeenCalled();
  });
});
