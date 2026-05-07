import { describe, it, expect, vi } from 'vitest';

describe('welcome screen', () => {
  it('renders title + 30-sec context paragraph + Begin button', async () => {
    const { renderWelcome } = await import('../../src/wizard/welcome.js');
    document.body.innerHTML = '<div id="root"></div>';
    renderWelcome(document.getElementById('root'), { onBegin: () => {} });
    expect(document.querySelector('.welcome-title')).not.toBeNull();
    expect(document.querySelector('.welcome-context').textContent.length).toBeGreaterThan(80);
    expect(document.querySelector('button.begin-btn')).not.toBeNull();
  });

  it('Begin click invokes onBegin callback', async () => {
    const { renderWelcome } = await import('../../src/wizard/welcome.js');
    document.body.innerHTML = '<div id="root"></div>';
    const cb = vi.fn();
    renderWelcome(document.getElementById('root'), { onBegin: cb });
    document.querySelector('button.begin-btn').click();
    expect(cb).toHaveBeenCalled();
  });
});
