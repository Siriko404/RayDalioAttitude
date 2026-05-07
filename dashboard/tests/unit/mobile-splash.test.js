import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // happy-dom default window width
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1440 });
});

describe('mobile splash', () => {
  it('isMobileBlocked() returns true if width < 1024 AND portrait', async () => {
    const { isMobileBlocked } = await import('../../src/ui/mobile-splash.js');
    window.innerWidth = 768;
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 1024 });
    expect(isMobileBlocked()).toBe(true);
  });

  it('isMobileBlocked() returns false if width ≥ 1024', async () => {
    const { isMobileBlocked } = await import('../../src/ui/mobile-splash.js');
    window.innerWidth = 1440;
    expect(isMobileBlocked()).toBe(false);
  });

  it('renderMobileSplash injects splash + email-yourself-link button', async () => {
    const { renderMobileSplash } = await import('../../src/ui/mobile-splash.js');
    document.body.innerHTML = '<div id="root"></div>';
    renderMobileSplash(document.getElementById('root'));
    expect(document.querySelector('.mobile-splash')).not.toBeNull();
    expect(document.querySelector('a.email-link')?.href).toMatch(/mailto:/);
  });
});
