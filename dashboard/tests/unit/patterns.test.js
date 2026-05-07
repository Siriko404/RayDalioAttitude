import { describe, it, expect } from 'vitest';

describe('SVG patterns', () => {
  it('exports 7 fill patterns + 5 stroke patterns', async () => {
    const { FILL_PATTERNS, STROKE_PATTERNS } = await import('../../src/charts/patterns.js');
    const expectedFills = ['SOLID', 'HATCH-D', 'HATCH-S', 'HATCH-R', 'CROSSHATCH', 'DOTS', 'VERT', 'HORIZ'];
    expectedFills.forEach(k => expect(FILL_PATTERNS).toHaveProperty(k));
    const expectedStrokes = ['SOLID', 'DASH-LONG', 'DASH-SHORT', 'DOTTED', 'DASH-DOT'];
    expectedStrokes.forEach(k => expect(STROKE_PATTERNS).toHaveProperty(k));
  });

  it('makePatternFill returns ECharts pattern brush descriptor', async () => {
    const { makePatternFill } = await import('../../src/charts/patterns.js');
    const p = makePatternFill('HATCH-D');
    expect(p).toHaveProperty('image');
    expect(p).toHaveProperty('repeat');
  });
});
