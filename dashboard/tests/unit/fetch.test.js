import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  global.fetch = vi.fn(async () => new Response(JSON.stringify({
    fetched_at_utc: '2026-05-06T14:32:00Z',
    sources: { fred: { GDP: [{ date: '2024-01', value: 27000 }] } },
    errors: []
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
});

describe('fetch core', () => {
  it('fetchAll hits /api/fetch-all and returns parsed JSON', async () => {
    const { fetchAll } = await import('../../src/core/fetch.js');
    const data = await fetchAll();
    expect(data.fetched_at_utc).toBe('2026-05-06T14:32:00Z');
    expect(data.sources.fred.GDP).toBeDefined();
  });

  it('throws on non-200', async () => {
    global.fetch = vi.fn(async () => new Response('err', { status: 500 }));
    const { fetchAll } = await import('../../src/core/fetch.js');
    await expect(fetchAll()).rejects.toThrow();
  });
});
