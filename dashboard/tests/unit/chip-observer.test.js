import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // happy-dom IntersectionObserver shim
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; this.elements = []; }
    observe(el) { this.elements.push(el); global.__lastIO = this; }
    disconnect() {}
  };
});

describe('chip observer', () => {
  it('observes 4 emitting slides and triggers fill on intersect', async () => {
    const { renderChipStrip } = await import('../../src/chips/chip-strip.js');
    const { observeEmittingSlides } = await import('../../src/chips/observer.js');
    document.body.innerHTML = `
      <header id="h"></header>
      <main>
        <section id="s1-3" data-slide-id="1.3"></section>
        <section id="s1-7" data-slide-id="1.7"></section>
        <section id="s1-5" data-slide-id="1.5"></section>
        <section id="s1-6" data-slide-id="1.6"></section>
      </main>
    `;
    renderChipStrip(document.getElementById('h'));
    observeEmittingSlides({
      '1.3': () => ({ kind: 'debt', label: 'Peak', status: 'amber' }),
      '1.7': () => ({ kind: 'inflation', label: 'Stagflation', status: 'amber' }),
      '1.5': () => ({ kind: 'paradigm', label: 'Late', status: 'amber' }),
      '1.6': () => ({ kind: 'empire', label: 'Top', status: 'amber' })
    });
    // simulate IntersectionObserver firing on slide 1.3
    global.__lastIO.cb([{ isIntersecting: true, target: document.getElementById('s1-3'), intersectionRatio: 0.6 }]);
    const chip = document.querySelector('.chip[data-kind="debt"]');
    expect(chip.dataset.filled).toBe('true');
    expect(chip.textContent).toMatch(/Peak/);
  });
});
