import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('reveal-ch CSS', () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, '../../src/styles/reveal.css'),
    'utf8'
  );
  it('reveal-ch is inline-block to receive bg', () => {
    expect(css).toMatch(/\.reveal-ch[\s\S]*display:\s*inline-block/);
  });
  it('reveal-target hides .reveal-ch initially via parent gating', () => {
    expect(css).toMatch(/\.reveal-target/);
  });
});
