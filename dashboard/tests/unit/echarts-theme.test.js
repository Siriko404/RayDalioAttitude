import { describe, it, expect } from 'vitest';

describe('ECharts BW theme', () => {
  it('exports theme name + theme object', async () => {
    const { THEME_NAME, bwTheme } = await import('../../src/charts/echarts-bw-theme.js');
    expect(THEME_NAME).toBe('dalio-bw');
    expect(bwTheme).toBeTypeOf('object');
  });

  it('color palette is all #000 or #fff (pure B&W)', async () => {
    const { bwTheme } = await import('../../src/charts/echarts-bw-theme.js');
    bwTheme.color.forEach(c => {
      expect(['#000', '#fff', '#000000', '#ffffff']).toContain(c);
    });
  });

  it('text uses Source Serif 4 for axis labels', async () => {
    const { bwTheme } = await import('../../src/charts/echarts-bw-theme.js');
    expect(bwTheme.textStyle.fontFamily).toMatch(/Source Serif/);
  });
});
