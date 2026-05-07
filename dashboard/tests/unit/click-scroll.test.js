import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = `
    <main>
      <section data-slide-id="1.1" data-cell-index="0" id="s1"></section>
      <section data-slide-id="1.1" data-cell-index="1" id="s2"></section>
      <section data-slide-id="1.2" data-cell-index="0" id="s3"></section>
    </main>
    <nav class="nav-bar">
      <div class="nav-group" data-group-id="1.2">
        <button class="nav-cell" data-cell-index="0" id="c1"></button>
      </div>
    </nav>
  `;
  // happy-dom doesn't implement scrollIntoView; install spy
  Element.prototype.scrollIntoView = vi.fn();
});

describe('click-scroll', () => {
  it('cell click invokes scrollIntoView on matching slide section', async () => {
    const { bindClickScroll } = await import('../../src/nav/click-scroll.js');
    bindClickScroll(document.querySelector('.nav-bar'));
    document.getElementById('c1').click();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('group click (not on a cell) scrolls to first cell of that group', async () => {
    document.body.innerHTML = `
      <main>
        <section data-slide-id="1.2" data-cell-index="0" id="s3"></section>
      </main>
      <nav class="nav-bar">
        <div class="nav-group" data-group-id="1.2">
          <span class="nav-group-label" id="lbl"></span>
          <div class="nav-segment">
            <button class="nav-cell" data-cell-index="0"></button>
          </div>
        </div>
      </nav>
    `;
    const { bindClickScroll } = await import('../../src/nav/click-scroll.js');
    bindClickScroll(document.querySelector('.nav-bar'));
    document.getElementById('lbl').click();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
