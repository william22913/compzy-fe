import { test, expect } from './base.js';
import { startMountServer, MOUNT } from './mount-server.js';

// The same production build, served under a sub-path with no <base href>, the
// way a gateway-less deployment behind nginx does. Everything the app asks for
// — its pages, its fonts, its images and its API — has to stay inside the
// mount, at the home page and on a deep link alike.
let mounted;

test.beforeAll(async () => {
  mounted = await startMountServer({ api: process.env.MOUNT_API });
});

test.afterAll(async () => {
  await mounted?.close();
});

function insideMount(url) {
  return url.startsWith(mounted.origin + MOUNT) || url.startsWith('data:');
}

// The router keeps the mount's trailing slash on root links, because the mount
// without it is the one URL a relative build cannot serve.
const MOUNT_ROOT = MOUNT;

test('the home page, its fonts and its API call stay inside the mount', async ({ page }) => {
  const requests = [];
  const assetFailures = [];
  const consoleErrors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400 && /\/assets\//.test(response.url())) {
      assetFailures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('console', (message) => {
    // The anonymous session check answers 401 by design; the browser logs the
    // status itself. Anything else is a real error.
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(mounted.origin + MOUNT);

  // The catalogue arrived through <mount>/api/v1/catalogue.
  await expect(page.locator('#cat-cpu')).toBeVisible();
  await expect(page.locator('#cat-cpu').getByRole('button', { name: 'Choose' }).first()).toBeVisible();

  expect(requests.filter((url) => !insideMount(url))).toEqual([]);
  expect(assetFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);

  // The design's display face really loaded from the mount.
  const fonts = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => name.endsWith('.woff2')),
  );
  expect(fonts.length).toBeGreaterThan(0);
  expect(fonts.every(insideMount)).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('16px Archivo'))).toBe(true);

  // No link leaves the mount.
  const hrefs = await page.$$eval('a[href]', (links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  expect(hrefs.filter((href) => !href.startsWith(MOUNT_ROOT))).toEqual([]);
});

test('a crafted asset path cannot leave the build', async ({ request }) => {
  const response = await request.get(`${mounted.origin}${MOUNT}assets/..%2f..%2fpackage.json`);
  expect(response.status()).toBe(404);
});

test('a second route loads under the mount', async ({ page }) => {
  await page.goto(mounted.origin + MOUNT + 'sign-up');
  await expect(page.locator('header a.brand')).toHaveAttribute('href', MOUNT_ROOT);
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  expect(await page.title()).toBe('Create account · compzy PC Builder');
});

test('the brand link keeps the mount and survives a reload', async ({ page }) => {
  const assetFailures = [];
  page.on('response', (response) => {
    if (response.status() >= 400 && /\/assets\//.test(response.url())) {
      assetFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(mounted.origin + MOUNT + 'sign-up');
  await page.locator('header a.brand').click();
  await expect(page).toHaveURL(mounted.origin + MOUNT);

  await page.reload();
  await expect(page.locator('#cat-cpu')).toBeVisible();
  expect(assetFailures).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('16px Archivo'))).toBe(true);
});

test('a two-level deep link reloads the app under the mount', async ({ page }) => {
  const assetFailures = [];
  page.on('response', (response) => {
    if (response.status() >= 400 && /\/assets\//.test(response.url())) {
      assetFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  const deep = `${MOUNT}order-confirmation/00000000-0000-4000-8000-000000000000`;
  await page.goto(mounted.origin + deep);

  // The app's own route, not the not-found fallback.
  await expect(page.locator('header a.brand')).toHaveAttribute('href', MOUNT_ROOT);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /could not find that order|session has ended/,
  );
  expect(await page.title()).toBe('Order confirmed · compzy PC Builder');

  // The relative asset URLs of index.html resolved to files, not to HTML.
  expect(assetFailures).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('16px Archivo'))).toBe(true);
});
