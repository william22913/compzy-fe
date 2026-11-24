import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountFromPath } from './base';

// The mount path is read once, at import: each case re-imports the module with
// the document it should see.
async function load() {
  vi.resetModules();
  return import('./base');
}

function setBase(href) {
  const element = document.createElement('base');
  element.href = href;
  document.head.append(element);
}

// The mount is only trusted when the document is served below it, so the cases
// that use a <base> also move the document there.
function setLocation(path) {
  window.history.replaceState({}, '', path);
}

afterEach(() => {
  document.querySelectorAll('base').forEach((element) => element.remove());
  window.history.replaceState({}, '', '/');
});

describe('app base', () => {
  it('is the site root when the document carries no base element', async () => {
    const { APP_BASE, APP_BASE_PATH, appUrl } = await load();
    expect(APP_BASE.pathname).toBe('/');
    expect(APP_BASE_PATH).toBe('/');
    expect(appUrl('assets/img/hero.webp')).toBe(`${window.location.origin}/assets/img/hero.webp`);
  });

  it('follows the <base href> a preview gateway mounts the build under', async () => {
    setLocation('/stack/token/app/sign-in');
    setBase(`${window.location.origin}/stack/token/app/`);
    const { APP_BASE_PATH, appUrl } = await load();
    expect(APP_BASE_PATH).toBe('/stack/token/app/');
    expect(appUrl('assets/img/hero.webp')).toBe(
      `${window.location.origin}/stack/token/app/assets/img/hero.webp`,
    );
  });

  it('keeps a nested asset path inside the mount', async () => {
    setLocation('/stack/token/app/');
    setBase(`${window.location.origin}/stack/token/app/`);
    const { appUrl } = await load();
    expect(appUrl('/assets/img/a.webp')).toBe(
      `${window.location.origin}/stack/token/app/assets/img/a.webp`,
    );
  });

  it('accepts a gateway base for a document served without a trailing slash', async () => {
    setLocation('/stack/token/app');
    setBase(`${window.location.origin}/stack/token/app/`);
    const { APP_BASE_PATH } = await load();
    expect(APP_BASE_PATH).toBe('/stack/token/app/');
  });

  it('ignores a base from another origin', async () => {
    setBase('https://evil.example/stack/token/app/');
    const { APP_BASE_PATH } = await load();
    expect(APP_BASE_PATH).toBe('/');
  });

  it('ignores a same-origin base the document is not served under', async () => {
    setBase(`${window.location.origin}/somewhere/else/`);
    const { APP_BASE_PATH } = await load();
    expect(APP_BASE_PATH).toBe('/');
  });
});

describe('appUrl', () => {
  it('refuses a URL that would leave the app', async () => {
    setLocation('/stack/token/app/');
    setBase(`${window.location.origin}/stack/token/app/`);
    const { appUrl } = await load();
    expect(() => appUrl('https://evil.example/x.webp')).toThrow();
    expect(() => appUrl(String.raw`\\evil.example/x.webp`)).toThrow();
    expect(() => appUrl('../x.webp')).toThrow();
  });
});

// Without a <base> the production build reads the mount off the document path;
// the route has to come off first, or a deep link looks like its own mount.
describe('mountFromPath', () => {
  it('is the site root for every root route', () => {
    expect(mountFromPath('/')).toBe('/');
    expect(mountFromPath('/sign-in')).toBe('/');
    expect(mountFromPath('/sign-up')).toBe('/');
    expect(mountFromPath('/order-review')).toBe('/');
    expect(mountFromPath('/order-confirmation/00000000-0000-4000-8000-000000000000')).toBe('/');
  });

  it('keeps the mount and drops its route', () => {
    expect(mountFromPath('/stack/token/app/')).toBe('/stack/token/app/');
    expect(mountFromPath('/stack/token/app/sign-in')).toBe('/stack/token/app/');
    expect(mountFromPath('/stack/token/app/order-confirmation/00000000-0000-4000-8000-000000000000')).toBe(
      '/stack/token/app/',
    );
  });

  it('does not confuse a mount that is named like a route', () => {
    expect(mountFromPath('/stack/sign-in/app/')).toBe('/stack/sign-in/app/');
    expect(mountFromPath('/stack/sign-in/app/sign-in')).toBe('/stack/sign-in/app/');
  });

  it('handles an address the app does not route', () => {
    expect(mountFromPath('/nonsense')).toBe('/');
    expect(mountFromPath('/stack/token/app/nonsense')).toBe('/stack/token/app/');
  });
});
