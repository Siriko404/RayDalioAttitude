import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('typography component', () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, '../../src/styles/typography.css'),
    'utf8'
  );

  it('eyebrow uses DM Mono 11px / 4px tracking / weight 500 / uppercase', () => {
    expect(css).toMatch(/\.eyebrow[\s\S]*font-family:\s*var\(--font-mono\)/);
    expect(css).toMatch(/\.eyebrow[\s\S]*letter-spacing:\s*var\(--tracking-eyebrow\)/);
    expect(css).toMatch(/\.eyebrow[\s\S]*font-weight:\s*500/);
    expect(css).toMatch(/\.eyebrow[\s\S]*text-transform:\s*uppercase/);
  });

  it('one-point uses italic Source Serif weight 300 with -1.2px tracking', () => {
    expect(css).toMatch(/\.one-point[\s\S]*font-style:\s*italic/);
    expect(css).toMatch(/\.one-point[\s\S]*font-weight:\s*300/);
    expect(css).toMatch(/\.one-point[\s\S]*letter-spacing:\s*var\(--tracking-tight\)/);
  });

  it('caption max-width 720px italic 16px', () => {
    expect(css).toMatch(/\.caption[\s\S]*max-width:\s*720px/);
    expect(css).toMatch(/\.caption[\s\S]*font-style:\s*italic/);
  });
});
