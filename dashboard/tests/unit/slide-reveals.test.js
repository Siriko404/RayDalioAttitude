import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; global.__lastIO = this; }
    observe() {}
    disconnect() {}
  };
  document.body.innerHTML = `
    <main>
      <section data-slide-id="1.1">
        <div class="reveal-target">Hello</div>
      </section>
    </main>`;
});

describe('slide reveals', () => {
  it('observes all sections; calling intersection cb arms .reveal-target', async () => {
    const { bindSlideReveals } = await import('../../src/animations/slide-reveals.js');
    bindSlideReveals(document.querySelector('main'));
    const slide = document.querySelector('section');
    global.__lastIO.cb([{ isIntersecting: true, target: slide, intersectionRatio: 0.5 }]);
    expect(slide.dataset.armed).toBe('true');
  });
});
