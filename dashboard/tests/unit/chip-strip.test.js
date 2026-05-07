import { describe, it, expect } from 'vitest';

describe('chip strip', () => {
  it('renders REGIMES eyebrow + 4 placeholder chips', async () => {
    const { renderChipStrip } = await import('../../src/chips/chip-strip.js');
    document.body.innerHTML = '<header id="h"></header>';
    renderChipStrip(document.getElementById('h'));
    expect(document.querySelector('.chip-strip-eyebrow').textContent).toMatch(/REGIMES/);
    const chips = document.querySelectorAll('.chip');
    expect(chips.length).toBe(4);
    expect(chips[0].dataset.kind).toBe('empire');
    expect(chips[1].dataset.kind).toBe('debt');
    expect(chips[2].dataset.kind).toBe('paradigm');
    expect(chips[3].dataset.kind).toBe('inflation');
  });

  it('default chip state shows placeholder ___ in italic gray', async () => {
    const { renderChipStrip } = await import('../../src/chips/chip-strip.js');
    document.body.innerHTML = '<header id="h"></header>';
    renderChipStrip(document.getElementById('h'));
    const chip = document.querySelector('.chip[data-kind="empire"]');
    expect(chip.dataset.filled).toBe('false');
    expect(chip.textContent).toMatch(/___/);
  });

  it('fillChip(kind, label, status) sets text + status class', async () => {
    const { renderChipStrip, fillChip } = await import('../../src/chips/chip-strip.js');
    document.body.innerHTML = '<header id="h"></header>';
    renderChipStrip(document.getElementById('h'));
    fillChip('inflation', 'Stagflation', 'amber');
    const chip = document.querySelector('.chip[data-kind="inflation"]');
    expect(chip.dataset.filled).toBe('true');
    expect(chip.dataset.status).toBe('amber');
    expect(chip.textContent).toMatch(/Stagflation/);
  });
});
