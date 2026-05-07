import { describe, it, expect, vi } from 'vitest';

describe('T1 form', () => {
  it('renders 3 fields with defaults pre-filled', async () => {
    const { renderTier1 } = await import('../../src/wizard/tier-1.js');
    document.body.innerHTML = '<div id="r"></div>';
    renderTier1(document.getElementById('r'), { onSubmit: () => {} });
    expect(document.querySelector('select[name="home_currency"]').value).toBe('USD');
    expect(document.querySelector('select[name="focus_country"]').value).toBe('US');
    expect(document.querySelector('input[name="risk_profile"][value="balanced"]:checked')).not.toBeNull();
  });

  it('Submit emits {home_currency, focus_country, risk_profile, sigma_target}', async () => {
    const { renderTier1 } = await import('../../src/wizard/tier-1.js');
    document.body.innerHTML = '<div id="r"></div>';
    const cb = vi.fn();
    renderTier1(document.getElementById('r'), { onSubmit: cb });
    document.querySelector('.wizard-next').click();
    expect(cb).toHaveBeenCalledWith({
      home_currency: 'USD',
      focus_country: 'US',
      risk_profile: 'balanced',
      sigma_target: 0.10
    });
  });

  it('Aggressive risk profile maps sigma_target=0.15', async () => {
    const { renderTier1 } = await import('../../src/wizard/tier-1.js');
    document.body.innerHTML = '<div id="r"></div>';
    const cb = vi.fn();
    renderTier1(document.getElementById('r'), { onSubmit: cb });
    document.querySelector('input[value="aggressive"]').click();
    document.querySelector('.wizard-next').click();
    expect(cb.mock.calls[0][0].sigma_target).toBe(0.15);
  });
});
