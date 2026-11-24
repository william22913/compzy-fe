// Serves the production build the way a sub-path deployment does: the app at
// /stack/<token>/app/ with its own nginx rules behind it, and the API under
// the same prefix. The gateway is not emulated any further than that — no
// <base href> is injected — so the spec proves the build works without it.
//
// Asset serving mirrors deploy/nginx.conf.template, including the rule that
// answers a nested-route asset request (/order-confirmation/<id>/assets/...)
// from the build's own assets folder.
import { createServer, request as httpRequest } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { cataloguePayload } from '../../src/test/fixtures.js';

export const MOUNT = '/stack/preview-token/app/';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

async function readStatic(root, relative) {
  const target = normalize(join(root, relative));
  if (!target.startsWith(normalize(root) + sep)) return null;
  try {
    return { body: await readFile(target) };
  } catch {
    return null;
  }
}

function send(res, status, body, type) {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

function stubApi(pathname, res) {
  if (pathname === '/api/v1/catalogue') return send(res, 200, JSON.stringify(cataloguePayload), TYPES['.json']);
  if (pathname === '/api/v1/auth/me') {
    return send(
      res,
      401,
      JSON.stringify({
        request_id: 'mount-test',
        error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' },
      }),
      TYPES['.json'],
    );
  }
  return send(
    res,
    404,
    JSON.stringify({ request_id: 'mount-test', error: { code: 'NOT_FOUND', message: 'Not found.' } }),
    TYPES['.json'],
  );
}

export function startMountServer({ root = 'dist', prefix = MOUNT, api } = {}) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://mount.invalid');
    if (!url.pathname.startsWith(prefix)) {
      return send(res, 404, 'outside the mount', 'text/plain');
    }
    const rest = url.pathname.slice(prefix.length);

    if (rest.startsWith('api/')) {
      if (!api) return stubApi(`/${rest}`, res);
      // Forward to a real backend, path unchanged below the mount.
      const upstream = new URL(`/${rest}${url.search}`, api);
      const proxied = httpRequest(
        {
          hostname: upstream.hostname,
          port: upstream.port,
          path: upstream.pathname + upstream.search,
          method: req.method,
          headers: { ...req.headers, host: upstream.host },
        },
        (answer) => {
          res.writeHead(answer.statusCode || 502, answer.headers);
          answer.pipe(res);
        },
      );
      proxied.on('error', () => send(res, 502, 'upstream unavailable', 'text/plain'));
      req.pipe(proxied);
      return;
    }

    // The nested-route asset rule, as deploy/nginx.conf.template has it.
    const nested = /^(.+\/)assets\/(.+)$/.exec(rest);
    const file = nested ? await readStatic(root, `assets/${nested[2]}`) : await readStatic(root, rest);
    if (file) {
      return send(res, 200, file.body, TYPES[extname(rest)] || 'application/octet-stream');
    }
    if (nested || rest.startsWith('assets/')) {
      // A missing asset is a 404, never the HTML fallback.
      return send(res, 404, 'not found', 'text/plain');
    }
    // Any other path is a route: hand out index.html, as the SPA fallback does.
    const index = await readStatic(root, 'index.html');
    return send(res, index ? 200 : 500, index ? index.body : 'build missing', TYPES['.html']);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        origin: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}
