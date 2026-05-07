import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; global.__lastIO = this; }
    observe() {}
    disconnect() {}
  };
  document.body.innerHTML = `
    <main>
      <section data-slide-id="1.1" data-cell-index="0"></section>
      <section data-slide-id="1.1" data-cell-index="1"></section>
      <section data-slide-id="1.2" data-cell-index="0"></section>
    </main>
    <nav class="nav-bar">
      <div class="nav-group" data-group-id="1.1">
        <button class="nav-cell" data-cell-index="0"></button>
        <button class="nav-cell" data-cell-index="1"></button>
      </div>
      <div class="nav-group" data-group-id="1.2">
        <button class="nav-cell" data-cell-index="0"></button>
      </div>
    </nav>
  `;
});

describe('scrollspy', () => {
  it('IntersectionObserver fires on slide section → marks matching nav-cell as current', async () => {
    const { bindScrollspy } = await import('../../src/nav/scrollspy.js');
    bindScrollspy(document.querySelector('.nav-bar'), document.querySelector('main'));
    const slide = document.querySelector('[data-slide-id="1.2"]');
    global.__lastIO.cb([{ isIntersecting: true, target: slide, intersectionRatio: 0.7 }]);
    const cell = document.querySelector('.nav-group[data-group-id="1.2"] .nav-cell');
    expect(cell.dataset.current).toBe('true');
  });

  it('Only one cell across the entire bar is current at a time', async () => {
    const { bindScrollspy } = await import('../../src/nav/scrollspy.js');
    bindScrollspy(document.querySelector('.nav-bar'), document.querySelector('main'));
    const s1 = document.querySelector('[data-slide-id="1.1"][data-cell-index="0"]');
    const s2 = document.querySelector('[data-slide-id="1.2"]');
    global.__lastIO.cb([{ isIntersecting: true, target: s1, intersectionRatio: 0.7 }]);
    global.__lastIO.cb([{ isIntersecting: true, target: s2, intersectionRatio: 0.7 }]);
    const allCurrent = document.querySelectorAll('.nav-cell[data-current="true"]');
    expect(allCurrent.length).toBe(1);
    expect(allCurrent[0].closest('.nav-group').dataset.groupId).toBe('1.2');
  });

  it('Group containing current cell gets data-current=true', async () => {
    const { bindScrollspy } = await import('../../src/nav/scrollspy.js');
    bindScrollspy(document.querySelector('.nav-bar'), document.querySelector('main'));
    const slide = document.querySelector('[data-slide-id="1.2"]');
    global.__lastIO.cb([{ isIntersecting: true, target: slide, intersectionRatio: 0.7 }]);
    expect(document.querySelector('.nav-group[data-group-id="1.2"]').dataset.current).toBe('true');
    expect(document.querySelector('.nav-group[data-group-id="1.1"]').dataset.current).toBe('false');
  });
});
