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

// The build asks for its assets relatively, so a reload on a nested route asks
// for /order-confirmation/<id>/assets/... . Production nginx answers that from
// /assets (deploy/nginx.conf.template); the preview server does the same here.
function nestedAssets() {
  return {
    name: 'nested-assets',
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const nested = /^\/.+\/assets\/(.+)$/.exec(request.url || '');
        if (nested) request.url = `/assets/${nested[1]}`;
        next();
      });
    },
  };
}

export default defineConfig({
  // Relative asset URLs: the same build runs at a site root and under the
  // preview gateway's /stack/<token>/<name>/ mount, resolved against the
  // document's base. Runtime URLs are built in src/core/base.js.
  base: './',
  plugins: [react(), nestedAssets()],
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
