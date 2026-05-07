import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => { localStorage.clear(); });

describe('wizard persistence', () => {
  it('save + load round-trip', async () => {
    const { saveWizard, loadWizard } = await import('../../src/wizard/persistence.js');
    saveWizard({ home_currency: 'EUR', risk_profile: 'aggressive' });
    expect(loadWizard()).toEqual({ home_currency: 'EUR', risk_profile: 'aggressive' });
  });

  it('loadWizard returns null when nothing saved', async () => {
    const { loadWizard } = await import('../../src/wizard/persistence.js');
    expect(loadWizard()).toBeNull();
  });
});
