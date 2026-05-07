import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('design-system tokens', () => {
  let css;
  beforeEach(() => {
    css = fs.readFileSync(
      path.resolve(__dirname, '../../src/styles/design-system.css'),
      'utf8'
    );
  });

  it('declares ink + paper variables', () => {
    expect(css).toMatch(/--ink:\s*#000/);
    expect(css).toMatch(/--paper:\s*#fff/);
  });

  it('declares Source Serif 4 + DM Mono', () => {
    expect(css).toMatch(/Source Serif 4/);
    expect(css).toMatch(/DM Mono/);
  });

  it('declares hairline opacity 0.55', () => {
    expect(css).toMatch(/--hairline-opacity:\s*0\.55/);
  });
});
