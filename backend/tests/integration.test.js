import { describe, it, expect } from 'vitest';

describe('integration /api/fetch-all', () => {
  it('returns all 9 sources in test mode', async () => {
    const mod = await import('../src/worker.js');
    const req = new Request('https://x.test/api/fetch-all');
    const res = await mod.default.fetch(req, { __TEST: true });
    const json = await res.json();
    expect(Object.keys(json.sources)).toEqual(
      expect.arrayContaining(['fred', 'bis', 'cofer', 'wb_wdi', 'damodaran', 'shiller', 'yardeni', 'nber', 'nyfed'])
    );
    expect(json.errors).toEqual([]);
  });

  it('CORS Allow-Origin set', async () => {
    const mod = await import('../src/worker.js');
    const req = new Request('https://x.test/api/fetch-all');
    const res = await mod.default.fetch(req, { __TEST: true });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
