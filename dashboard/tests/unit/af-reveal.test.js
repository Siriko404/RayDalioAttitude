import { describe, it, expect, beforeEach } from 'vitest';

describe('airForceReveal', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '<div id="t">Hello <em>world</em></div>';
    el = document.getElementById('t');
  });

  it('wraps each non-space char in .reveal-ch span', async () => {
    const { airForceReveal } = await import('../../src/animations/af-reveal.js');
    airForceReveal(el);
    const spans = el.querySelectorAll('.reveal-ch');
    // "Hello world" = 10 chars (Hello=5, world=5; space replaced by &nbsp;)
    expect(spans.length).toBe(10);
  });

  it('preserves italic via nested <em>', async () => {
    const { airForceReveal } = await import('../../src/animations/af-reveal.js');
    airForceReveal(el);
    expect(el.innerHTML).toMatch(/font-style:italic/);
  });

  it('returns a GSAP timeline-like object', async () => {
    const { airForceReveal } = await import('../../src/animations/af-reveal.js');
    const tl = airForceReveal(el);
    expect(tl).toBeDefined();
    // Mock gsap returns a timeline shim
  });
});
