import { defineConfig } from 'vite';
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787'  // wrangler dev port
    }
  }
});
