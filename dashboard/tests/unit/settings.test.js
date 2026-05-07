import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => { document.body.innerHTML = '<header id="h"></header>'; });

describe('settings link', () => {
  it('renderSettingsLink injects a clickable Settings button', async () => {
    const { renderSettingsLink } = await import('../../src/wizard/settings.js');
    renderSettingsLink(document.getElementById('h'), () => {});
    expect(document.querySelector('button.settings-link')).not.toBeNull();
  });

  it('click invokes onClick callback', async () => {
    const { renderSettingsLink } = await import('../../src/wizard/settings.js');
    let clicked = false;
    renderSettingsLink(document.getElementById('h'), () => { clicked = true; });
    document.querySelector('button.settings-link').click();
    expect(clicked).toBe(true);
  });
});
