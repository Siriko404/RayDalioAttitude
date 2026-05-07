import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    setupFiles: ['./tests/unit/_setup.js'],
    include: ['tests/unit/**/*.test.js']
  }
});
