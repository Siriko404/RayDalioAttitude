import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // Mock all bulk fetches with empty buffers; test mode returns fixtures.
  global.fetch = vi.fn(async () => new Response(new ArrayBuffer(0), { status: 200 }));
});

describe('bulk-file normalizers', () => {
  it('BIS test mode returns EER series', async () => {
    const { fetchBis } = await import('../src/normalize/bis.js');
    const r = await fetchBis({ __TEST: true });
    expect(r).toHaveProperty('EER');
  });
  it('Damodaran test mode returns histretSP', async () => {
    const { fetchDamodaran } = await import('../src/normalize/damodaran.js');
    const r = await fetchDamodaran({ __TEST: true });
    expect(r).toHaveProperty('histretSP');
  });
  it('Shiller test mode returns ie_data', async () => {
    const { fetchShiller } = await import('../src/normalize/shiller.js');
    const r = await fetchShiller({ __TEST: true });
    expect(r).toHaveProperty('ie_data');
  });
  it('IMF COFER test mode returns Res_shr', async () => {
    const { fetchCofer } = await import('../src/normalize/imf-cofer.js');
    const r = await fetchCofer({ __TEST: true });
    expect(r).toHaveProperty('Res_shr');
  });
});
