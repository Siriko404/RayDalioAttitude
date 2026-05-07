import { describe, it, expect } from 'vitest';

describe('series builder', () => {
  it('lineSeries applies stroke pattern', async () => {
    const { lineSeries } = await import('../../src/charts/series-builder.js');
    const s = lineSeries({ name: 'X', data: [1,2,3], strokePattern: 'DASH-LONG' });
    expect(s.lineStyle.type).toEqual([6, 3]);
  });
  it('barSeries applies fill pattern', async () => {
    const { barSeries } = await import('../../src/charts/series-builder.js');
    const s = barSeries({ name: 'Y', data: [4,5,6], fillPattern: 'HATCH-D' });
    expect(s.itemStyle.color).toHaveProperty('image');
  });
});
