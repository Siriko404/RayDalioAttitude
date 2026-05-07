import { describe, it, expect } from 'vitest';
describe('build env', () => {
  it('has happy-dom window', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
