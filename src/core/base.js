// Where this build is mounted. At a site root that is "/", but the preview
// gateway serves the same build under /stack/<token>/<name>/ and every URL the
// app produces has to stay inside it: the router's basename, the images the
// components render and the API the client calls.
//
// The build uses relative asset URLs (Vite `base: './'`), so the browser
// resolves HTML and CSS assets against the mount on its own. JavaScript is not
// rewritten by the gateway, hence this module. The mount is read from the
// document's <base> when the gateway sets one; otherwise it is the document
// path with the app's own route stripped off it, which is right at a site root
// and under a no-gateway sub-path deployment alike.

// The app's routes (see src/app/App.jsx), as the suffix a document path can
// carry below its mount. A route is never a mount, so only an exact match is
// stripped, and only at a segment boundary.
const ROUTE_SUFFIX = [
  /\/order-confirmation\/[^/]+\/?$/,
  /\/(?:sign-in|sign-up|order-review)\/?$/,
];

export function mountFromPath(pathname) {
  for (const route of ROUTE_SUFFIX) {
    if (route.test(pathname)) return pathname.replace(route, '/');
  }
  // The mount root itself ends with "/"; anything else that reached here is a
  // route the app does not know, so its own address is the file to drop.
  return pathname.endsWith('/') ? pathname : pathname.replace(/[^/]*$/, '');
}

function resolveBase() {
  const baseElement = document.querySelector('base[href]');
  if (baseElement) {
    try {
      const url = new URL(baseElement.href);
      // Only a base this document was actually served under counts: same origin,
      // and a path the document sits below. Reading .href would otherwise trust
      // an injected <base> that CSP `base-uri` had already refused to apply.
      const basePath = url.pathname.replace(/\/?$/, '/');
      if (url.origin === location.origin && `${location.pathname}/`.startsWith(basePath)) {
        return new URL(basePath, url.origin);
      }
    } catch {
      // An unreadable href is no better than none: fall through.
    }
  }
  if (import.meta.env.DEV) return new URL('/', location.origin);
  const { origin, pathname } = location;
  return new URL(mountFromPath(pathname), origin);
}

export const APP_BASE = resolveBase();

// React Router's basename. At a mount it keeps the trailing slash on purpose:
// the router then renders every root link as the mount itself, so the address
// never becomes the mount without its slash — the one URL a relative build
// cannot serve (./assets would resolve one directory too high).
export const APP_BASE_PATH = APP_BASE.pathname;

// A URL for a file shipped with the build (images), kept under the mount. The
// result is checked, so a future caller passing data cannot make this an
// open-URL sink.
export function appUrl(path) {
  const url = new URL(String(path).replace(/^\/+/, ''), APP_BASE);
  if (url.origin !== APP_BASE.origin || !url.pathname.startsWith(APP_BASE.pathname)) {
    throw new Error(`appUrl: ${path} is outside the app`);
  }
  return url.toString();
}
