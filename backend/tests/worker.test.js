import { describe, it, expect } from 'vitest';

describe('worker entry', () => {
  it('exports default with fetch handler', async () => {
    const mod = await import('../src/worker.js');
    expect(mod.default).toHaveProperty('fetch');
    expect(typeof mod.default.fetch).toBe('function');
  });

  it('GET /api/fetch-all returns JSON with sources + fetched_at_utc', async () => {
    const mod = await import('../src/worker.js');
    const req = new Request('https://x.test/api/fetch-all');
    const res = await mod.default.fetch(req, { FRED_API_KEY: 'test', __TEST: true });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('fetched_at_utc');
    expect(json).toHaveProperty('sources');
    expect(json).toHaveProperty('errors');
  });
});
