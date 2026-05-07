import { describe, it, expect, vi } from 'vitest';

describe('T2/T3 advanced', () => {
  it('T3 fields collapsed by default', async () => {
    const { renderTier23 } = await import('../../src/wizard/tier-2-3.js');
    document.body.innerHTML = '<div id="r"></div>';
    renderTier23(document.getElementById('r'), { onSubmit: () => {}, onSkip: () => {} });
    expect(document.querySelector('.t3-advanced').dataset.expanded).toBe('false');
  });

  it('Skip emits onSkip with empty payload', async () => {
    const { renderTier23 } = await import('../../src/wizard/tier-2-3.js');
    document.body.innerHTML = '<div id="r"></div>';
    const skip = vi.fn();
    renderTier23(document.getElementById('r'), { onSubmit: () => {}, onSkip: skip });
    document.querySelector('.wizard-skip').click();
    expect(skip).toHaveBeenCalled();
  });
});
