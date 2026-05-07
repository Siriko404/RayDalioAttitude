import { describe, it, expect, vi, beforeEach } from 'vitest';

const fakeFredResponse = {
  observations: [
    { date: '2024-01-01', value: '27000.5' },
    { date: '2024-04-01', value: '27450.2' }
  ]
};

beforeEach(() => {
  global.fetch = vi.fn(async (url) => {
    if (url.includes('series/observations')) {
      return new Response(JSON.stringify(fakeFredResponse), { status: 200 });
    }
    throw new Error(`unexpected url: ${url}`);
  });
});

describe('FRED normalizer', () => {
  it('fetches required series and returns map of seriesId → array of {date, value}', async () => {
    const { fetchFred } = await import('../src/normalize/fred.js');
    const result = await fetchFred({ FRED_API_KEY: 'test' });
    expect(result).toHaveProperty('GDP');
    expect(Array.isArray(result.GDP)).toBe(true);
    expect(result.GDP[0]).toEqual({ date: '2024-01-01', value: 27000.5 });
  });

  it('coerces FRED "." (missing) to null', async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({
      observations: [{ date: '2020-01-01', value: '.' }]
    }), { status: 200 }));
    const { fetchFred } = await import('../src/normalize/fred.js');
    const result = await fetchFred({ FRED_API_KEY: 'test' });
    expect(result.GDP[0].value).toBeNull();
  });
});
