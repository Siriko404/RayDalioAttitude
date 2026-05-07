import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('layout shell', () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, '../../src/styles/layout.css'),
    'utf8'
  );

  it('chip-strip is sticky top', () => {
    expect(css).toMatch(/\.chip-strip[\s\S]*position:\s*sticky/);
    expect(css).toMatch(/\.chip-strip[\s\S]*top:\s*0/);
  });

  it('nav-bar fixed bottom with 100px page margin', () => {
    expect(css).toMatch(/\.nav-bar[\s\S]*position:\s*fixed/);
    expect(css).toMatch(/\.nav-bar[\s\S]*left:\s*var\(--gap-page\)/);
    expect(css).toMatch(/\.nav-bar[\s\S]*right:\s*var\(--gap-page\)/);
  });

  it('slide section fills viewport min-height', () => {
    expect(css).toMatch(/\.slide[\s\S]*min-height:\s*100vh/);
  });
});
