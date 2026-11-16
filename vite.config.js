import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The app calls its own origin under /api/v1. In production nginx serves the
// build and proxies /api to the API service; the dev server and the preview
// server do the same so the browser never leaves this origin. The API must
// know it: set its APP_ORIGIN to the exact origin this app is opened on.
const apiTarget = process.env.VITE_API_PROXY || 'http://localhost:8080';

const apiProxy = {
  '/api': {
    target: apiTarget,
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
