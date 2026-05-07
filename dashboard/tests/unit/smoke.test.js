import { describe, it, expect } from 'vitest';
describe('workspace smoke', () => {
  it('module imports resolve', async () => {
    const mod = await import('../../src/main.js').catch(() => null);
    expect(mod).not.toBeNull();
  });
});
