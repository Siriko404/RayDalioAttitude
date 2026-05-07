import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = `
    <nav class="nav-bar" id="n" style="position:fixed;left:0;right:0;bottom:0;height:36px;width:1200px">
      <div class="nav-group" data-group-id="1.1">
        <div class="nav-segment">
          <button class="nav-cell" data-cell-index="0"></button>
          <button class="nav-cell" data-cell-index="1"></button>
        </div>
      </div>
      <div class="nav-group" data-group-id="1.2">
        <div class="nav-segment">
          <button class="nav-cell" data-cell-index="0"></button>
        </div>
      </div>
    </nav>
  `;
  // happy-dom getBoundingClientRect stub
  document.querySelectorAll('.nav-cell').forEach((cell, i) => {
    cell.getBoundingClientRect = () => ({ left: i*100, right: (i+1)*100, top: 0, bottom: 36, x: i*100, y: 0, width: 100, height: 36 });
  });
});

describe('proximity', () => {
  it('mousemove near cell index 1 marks it data-near=true', async () => {
    const { bindProximity } = await import('../../src/nav/proximity.js');
    bindProximity(document.getElementById('n'));
    const evt = new MouseEvent('mousemove', { clientX: 150, clientY: 18, bubbles: true });
    document.getElementById('n').dispatchEvent(evt);
    const cells = document.querySelectorAll('.nav-cell');
    expect(cells[1].dataset.near).toBe('true');
    expect(cells[0].dataset.near).not.toBe('true');
  });

  it('mouseleave clears all near markers', async () => {
    const { bindProximity } = await import('../../src/nav/proximity.js');
    bindProximity(document.getElementById('n'));
    document.getElementById('n').dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 18, bubbles: true }));
    document.getElementById('n').dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    const nearCells = document.querySelectorAll('.nav-cell[data-near="true"]');
    expect(nearCells.length).toBe(0);
  });
});
